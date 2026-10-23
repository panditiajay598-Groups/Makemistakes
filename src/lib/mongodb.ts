import { MongoClient, type Db, type MongoClientOptions } from "mongodb";
import { initDns } from "./dns";

// Ensure DNS is configured for MongoDB Atlas SRV record resolution
initDns();


interface MongoCache {
  client: MongoClient | null;
  promise: Promise<MongoClient> | null;
  uri: string | null;
}

declare global {
  // eslint-disable-next-line no-var
  var __mongoCache: MongoCache | undefined;
}

const cache: MongoCache = globalThis.__mongoCache ?? {
  client: null,
  promise: null,
  uri: null,
};

if (!globalThis.__mongoCache) {
  globalThis.__mongoCache = cache;
}

const mongoOptions: MongoClientOptions = {
  maxPoolSize: 10,
  minPoolSize: 0,
  serverSelectionTimeoutMS: 8000,
  connectTimeoutMS: 10000,
};

/**
 * Returns a cached, connected MongoClient instance.
 * - Concurrency-safe: shares connection promise during initialization across concurrent requests.
 * - Failure-resilient: clears cache on error so subsequent requests can retry cleanly.
 * - Warm instance reuse: keeps connection pool alive across requests on the same runtime instance.
 */
export async function getMongoClient(): Promise<MongoClient> {
  initDns();
  const uri = process.env.DATABASE_URL;
  if (!uri) {
    throw new Error("DATABASE_URL is not configured");
  }

  // If URI changed, reset and clean up old client
  if (cache.uri && cache.uri !== uri) {
    if (cache.client) {
      await cache.client.close().catch(() => {});
    }
    cache.client = null;
    cache.promise = null;
  }

  if (cache.client) {
    return cache.client;
  }

  if (!cache.promise) {
    cache.uri = uri;
    const client = new MongoClient(uri, mongoOptions);

    cache.promise = client
      .connect()
      .then((connectedClient) => {
        cache.client = connectedClient;
        return connectedClient;
      })
      .catch((err) => {
        // Clear cache so next request can retry cleanly
        cache.client = null;
        cache.promise = null;
        throw err;
      });
  }

  return cache.promise;
}

/**
 * Returns a connected MongoDB Db instance.
 * Uses the default database in the connection string if dbName is not provided.
 */
export async function getDb(dbName?: string): Promise<Db> {
  const client = await getMongoClient();
  return client.db(dbName);
}
