#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { MongoClient } from "mongodb";

const ROOT = process.cwd();
const ENV_FILE = path.join(ROOT, ".env.local");
const ALLOWED_DATABASES = new Set(["makemistakes_dev", "makemistakes_test"]);

function readLocalEnvironment() {
  if (!fs.existsSync(ENV_FILE)) {
    throw new Error("Missing .env.local; run scripts/setup_dev_env.mjs first.");
  }
  const values = {};
  for (const rawLine of fs.readFileSync(ENV_FILE, "utf8").split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const separator = line.indexOf("=");
    if (separator <= 0) continue;
    const key = line.slice(0, separator).trim();
    let value = line.slice(separator + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    values[key] = value;
  }
  return values;
}

function isLoopback(host) {
  const normalized = host.toLowerCase().replace(/^\[|\]$/g, "");
  return normalized === "localhost" || normalized === "127.0.0.1" || normalized === "::1";
}

function parseMongoAddress(address) {
  try {
    return new URL(`mongodb://${address}`).hostname;
  } catch {
    return "";
  }
}

function getVerifiedTarget() {
  const localEnv = readLocalEnvironment();
  if (localEnv.NODE_ENV !== "development" || process.env.NODE_ENV === "production") {
    throw new Error("Test data is allowed only with NODE_ENV=development in .env.local.");
  }
  if (!localEnv.DATABASE_URL) {
    throw new Error("DATABASE_URL must be explicitly configured in .env.local.");
  }
  if (process.env.DATABASE_URL && process.env.DATABASE_URL !== localEnv.DATABASE_URL) {
    throw new Error("Process DATABASE_URL differs from .env.local; refusing to connect.");
  }

  let url;
  try {
    url = new URL(localEnv.DATABASE_URL);
  } catch {
    throw new Error("DATABASE_URL in .env.local is not a valid MongoDB URI.");
  }
  const database = url.pathname.replace(/^\//, "").split(/[?&#]/)[0];
  if (
    !["mongodb:", "mongodb+srv:"].includes(url.protocol) ||
    !isLoopback(url.hostname) ||
    !ALLOWED_DATABASES.has(database)
  ) {
    throw new Error("Only localhost databases named makemistakes_dev or makemistakes_test are allowed.");
  }

  return { uri: localEnv.DATABASE_URL, expectedDatabase: database };
}

export async function connectVerifiedDevDatabase() {
  const target = getVerifiedTarget();
  const client = new MongoClient(target.uri, {
    serverSelectionTimeoutMS: 5000,
    connectTimeoutMS: 5000,
  });
  try {
    await client.connect();
    const database = client.db().databaseName;
    const servers = client.topology?.description?.servers;
    const addresses = servers instanceof Map ? [...servers.keys()] : [];
    if (
      database !== target.expectedDatabase ||
      addresses.length === 0 ||
      addresses.some((address) => !isLoopback(parseMongoAddress(address)))
    ) {
      throw new Error("Connected MongoDB identity did not match the explicitly approved local development target.");
    }
    return {
      client,
      db: client.db(database),
      identity: { host: addresses.join(","), database },
    };
  } catch (error) {
    await client.close().catch(() => undefined);
    throw error;
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const { client, identity } = await connectVerifiedDevDatabase();
    console.log("[dev-db-identity] Verified connected host and dedicated development database.");
    console.log(`[dev-db-identity] host=${identity.host}; database=${identity.database}`);
    await client.close();
  } catch (error) {
    console.error("[dev-db-identity] Refusing test-data operations.", {
      errorName: error instanceof Error ? error.name : "UnknownError",
      code: error && typeof error === "object" && "code" in error ? error.code : undefined,
      message: "Identity verification failed; no test-data operation was allowed.",
    });
    process.exitCode = 1;
  }
}
