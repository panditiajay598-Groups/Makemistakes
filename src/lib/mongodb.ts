import { getDnsStatus, initDns } from "./dns";

// Ensure DNS is configured for MongoDB Atlas SRV record resolution prior to driver initialization
initDns();

import type { Db, MongoClient, MongoClientOptions } from "mongodb";
import { connectToConfiguredMongo } from "./security/mongoConnection";


interface MongoCache {
  client: MongoClient | null;
  promise: Promise<MongoClient> | null;
  uri: string | null;
}

declare global {
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

function getErrorCode(error: unknown): string | number | undefined {
  if (!error || typeof error !== "object") return undefined;
  const code = "code" in error ? error.code : undefined;
  if (typeof code === "string" || typeof code === "number") return code;
  if ("message" in error && typeof error.message === "string") {
    return error.message.match(/\b(ECONNREFUSED|ENOTFOUND|EAI_AGAIN|ETIMEDOUT)\b/)?.[0];
  }
  return undefined;
}

function isDnsResolutionError(error: unknown): boolean {
  if (!error || typeof error !== "object" || !("message" in error)) return false;
  const message = typeof error.message === "string" ? error.message.toLowerCase() : "";
  const code = getErrorCode(error);
  return (
    message.includes("querysrv") ||
    message.includes("querytxt") ||
    ["ECONNREFUSED", "ENOTFOUND", "EAI_AGAIN", "ETIMEDOUT"].includes(String(code))
  );
}

function getSafeHost(uri: string): string | undefined {
  try {
    return new URL(uri).hostname;
  } catch {
    return undefined;
  }
}

function logConnectionFailure(error: unknown, uri: string): void {
  const details = {
    host: getSafeHost(uri),
    code: getErrorCode(error),
    resolvers: getDnsStatus().servers,
  };
  if (isDnsResolutionError(error)) {
    console.error("[mongodb] DNS resolution failed while connecting to MongoDB.", details);
  } else {
    console.error("[mongodb] MongoDB connection failed.", details);
  }
}

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
      await cache.client.close();
    }
    cache.client = null;
    cache.promise = null;
  }

  if (cache.client) {
    return cache.client;
  }

  if (!cache.promise) {
    cache.uri = uri;
    console.info("[mongodb] Connecting to MongoDB.", {
      host: getSafeHost(uri),
      resolvers: getDnsStatus().servers,
    });
    const connectToMongo = async () => {
      initDns();
      const { MongoClient } = await import("mongodb");
      return connectToConfiguredMongo(uri, (configuredUri) =>
        new MongoClient(configuredUri, mongoOptions).connect()
      );
    };

    cache.promise = connectToMongo()
      .then((connectedClient) => {
        cache.client = connectedClient;
        const host = getSafeHost(uri);
        console.info("[mongodb] Connected to MongoDB.", {
          host,
          resolvers: getDnsStatus().servers,
        });

        let connectionInterrupted = false;
        connectedClient.on("serverHeartbeatFailed", (event) => {
          if (connectionInterrupted) return;
          connectionInterrupted = true;
          console.warn("[mongodb] MongoDB connection interrupted; the driver will retry.", {
            host,
            code: getErrorCode(event.failure),
          });
        });
        connectedClient.on("serverHeartbeatSucceeded", () => {
          if (!connectionInterrupted) return;
          connectionInterrupted = false;
          console.info("[mongodb] MongoDB connection recovered.", { host });
        });
        return connectedClient;
      })
      .catch((err) => {
        logConnectionFailure(err, uri);
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
