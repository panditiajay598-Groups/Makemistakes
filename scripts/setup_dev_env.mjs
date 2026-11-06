#!/usr/bin/env node
/**
 * setup_dev_env.mjs — Generate a local `.env.local` development override.
 *
 * Writes `.env.local` (gitignored), preserving existing local values while
 * restricting DATABASE_URL to the dedicated loopback development database.
 * It never touches committed `.env*` files or contacts a database.
 *
 * Usage:
 *   node scripts/setup_dev_env.mjs
 *
 * Optional overrides via environment:
 *   DEV_DATABASE_URL=mongodb://127.0.0.1:27017/makemistakes_dev
 *   DEV_SESSION_SECRET=<64 hex chars>   (otherwise generated)
 */
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const ROOT = process.cwd();
const TARGET = path.join(ROOT, ".env.local");

const DEFAULT_DATABASE_URL =
  "mongodb://127.0.0.1:27017/makemistakes_dev?directConnection=true&serverSelectionTimeoutMS=5000";

function validateDevDatabaseUrl(value) {
  let url;
  try {
    url = new URL(value);
  } catch {
    throw new Error("Development DATABASE_URL must be a valid MongoDB URI.");
  }
  const host = url.hostname.toLowerCase().replace(/^\[|\]$/g, "");
  const database = url.pathname.replace(/^\//, "").split(/[?&#]/)[0];
  if (
    !["mongodb:", "mongodb+srv:"].includes(url.protocol) ||
    !["localhost", "127.0.0.1", "::1"].includes(host) ||
    database !== "makemistakes_dev"
  ) {
    throw new Error("Only the local MongoDB database 'makemistakes_dev' is allowed for development setup.");
  }
  return { host, database };
}

function randomSecret() {
  return crypto.randomBytes(48).toString("hex");
}

function loadExisting() {
  if (!fs.existsSync(TARGET)) return "";
  return fs.readFileSync(TARGET, "utf8");
}

function parseEnvLines(text) {
  const out = {};
  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const eq = line.indexOf("=");
    if (eq <= 0) continue;
    const key = line.slice(0, eq).trim();
    let value = line.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    out[key] = value;
  }
  return out;
}

function renderLines(env, extras = {}) {
  const lines = [
    "# Local development overrides (gitignored). See .env.example for the reference contract.",
    "# Loaded automatically by Next.js during `npm run dev`; Prisma reads the same values.",
    "#",
    "# Dedicated development MongoDB. Adjust to point at your local dev instance.",
    "NODE_ENV=development",
    `DATABASE_URL=${env.DATABASE_URL}`,
    "# Development-only session signing secret (randomly generated).",
    `JWT_ACCESS_SECRET=${env.JWT_ACCESS_SECRET}`,
  ];
  for (const [key, value] of Object.entries(extras)) {
    lines.push(`${key}=${value}`);
  }
  lines.push("");
  return lines.join("\n");
}

function main() {
  if (process.env.NODE_ENV === "production") {
    throw new Error("Refusing to prepare a local development environment from a production process.");
  }
  const existing = loadExisting();
  const parsed = parseEnvLines(existing);
  if (parsed.NODE_ENV && parsed.NODE_ENV !== "development") {
    throw new Error("Refusing to replace an existing .env.local NODE_ENV.");
  }

  if (parsed.DATABASE_URL && process.env.DEV_DATABASE_URL && parsed.DATABASE_URL !== process.env.DEV_DATABASE_URL) {
    throw new Error("Refusing to replace an existing .env.local DATABASE_URL.");
  }

  let secret = parsed.JWT_ACCESS_SECRET || null;
  if (secret && secret === "__GENERATE_ME__") secret = null;
  if (!secret) {
    secret = process.env.DEV_SESSION_SECRET || randomSecret();
  }

  const databaseUrl = parsed.DATABASE_URL || process.env.DEV_DATABASE_URL || DEFAULT_DATABASE_URL;
  const databaseIdentity = validateDevDatabaseUrl(databaseUrl);

  const next = renderLines({
    DATABASE_URL: databaseUrl,
    JWT_ACCESS_SECRET: secret,
    NODE_ENV: "development",
  }, Object.fromEntries(
    Object.entries(parsed).filter(([key]) =>
      !["DATABASE_URL", "JWT_ACCESS_SECRET", "NODE_ENV"].includes(key)
    )
  ));

  const changed = existing !== next;
  fs.writeFileSync(TARGET, next, "utf8");

  console.log("[setup-dev-env] .env.local ready at", TARGET);
  console.log("[setup-dev-env] DATABASE_URL ->", databaseIdentity.host, "/", databaseIdentity.database);
  console.log(
    "[setup-dev-env] JWT_ACCESS_SECRET ->",
    changed ? (secret ? "randomly generated (32+ bytes)" : "not set") : "unchanged"
  );
  console.log(
    "[setup-dev-env] Production env files were not touched; no network or database access performed."
  );
}

main();
