import crypto from "crypto";
import type { Db } from "mongodb";
import type { AuthenticatedIdentity } from "./sessionIdentity";

const STATE_TTL_MS = 10 * 60 * 1000;
const TOKEN_PREFIX = "enc:v1:";
const stateIndexPromises = new WeakMap<Db, Promise<void>>();

async function ensureStateExpiryIndex(db: Db): Promise<void> {
  const cached = stateIndexPromises.get(db);
  if (cached) {
    return cached;
  }

  const initialization = db
    .collection("vercel_oauth_states")
    .createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 })
    .then(() => undefined);
  stateIndexPromises.set(db, initialization);
  try {
    await initialization;
  } catch (error) {
    stateIndexPromises.delete(db);
    throw error;
  }
}

/**
 * Resolve the encryption key for Vercel tokens.
 *
 * Prefers a dedicated VERCEL_TOKEN_ENCRYPTION_KEY but falls back to the
 * existing GITHUB_TOKEN_ENCRYPTION_KEY so existing environments can enable
 * Vercel integration without provisioning a brand-new secret.
 */
function getEncryptionKey(): Buffer {
  const configured = process.env.VERCEL_TOKEN_ENCRYPTION_KEY || process.env.GITHUB_TOKEN_ENCRYPTION_KEY;
  if (!configured) {
    throw new Error("VERCEL_TOKEN_ENCRYPTION_KEY is not configured.");
  }

  const key = Buffer.from(configured, "base64");
  if (key.length !== 32) {
    throw new Error("VERCEL_TOKEN_ENCRYPTION_KEY must be a base64-encoded 32-byte key.");
  }
  return key;
}

export function validateVercelTokenEncryptionConfiguration(): void {
  getEncryptionKey();
}

export async function createVercelOAuthState(
  db: Db,
  identity: AuthenticatedIdentity,
  ownerUserId: string,
  problemId: string
): Promise<string> {
  await ensureStateExpiryIndex(db);
  const state = crypto.randomBytes(32).toString("base64url");
  const now = new Date();
  await db.collection("vercel_oauth_states").insertOne({
    stateHash: crypto.createHash("sha256").update(state).digest("hex"),
    userId: ownerUserId,
    sessionUserId: identity.session.userId,
    problemId,
    createdAt: now,
    expiresAt: new Date(now.getTime() + STATE_TTL_MS),
  });
  return state;
}

export async function consumeVercelOAuthState(
  db: Db,
  state: string,
  identity: AuthenticatedIdentity,
  now = new Date()
): Promise<{ userId: string; problemId: string } | null> {
  const stateHash = crypto.createHash("sha256").update(state).digest("hex");
  const result = await db.collection("vercel_oauth_states").findOneAndDelete({
    stateHash,
    sessionUserId: identity.session.userId,
    expiresAt: { $gt: now },
  });

  const stateDocument = result && "value" in result ? result.value : result;
  if (
    !stateDocument ||
    typeof stateDocument.problemId !== "string" ||
    typeof stateDocument.userId !== "string"
  ) {
    return null;
  }
  return { userId: stateDocument.userId, problemId: stateDocument.problemId };
}

export function encryptVercelAccessToken(token: string): string {
  const key = getEncryptionKey();
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
  const encrypted = Buffer.concat([cipher.update(token, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `${TOKEN_PREFIX}${iv.toString("base64url")}.${tag.toString("base64url")}.${encrypted.toString("base64url")}`;
}

export function decryptVercelAccessToken(value: string): {
  token: string;
  wasEncrypted: boolean;
} {
  if (!value.startsWith(TOKEN_PREFIX)) {
    return { token: value, wasEncrypted: false };
  }

  const [ivValue, tagValue, encryptedValue] = value.slice(TOKEN_PREFIX.length).split(".");
  if (!ivValue || !tagValue || !encryptedValue) {
    throw new Error("Stored Vercel credential is invalid.");
  }

  const decipher = crypto.createDecipheriv(
    "aes-256-gcm",
    getEncryptionKey(),
    Buffer.from(ivValue, "base64url")
  );
  decipher.setAuthTag(Buffer.from(tagValue, "base64url"));
  const token = Buffer.concat([
    decipher.update(Buffer.from(encryptedValue, "base64url")),
    decipher.final(),
  ]).toString("utf8");

  return { token, wasEncrypted: true };
}

export function redactVercelAccessToken(
  phases: Record<string, unknown>
): Record<string, unknown> {
  const deploy = phases.deploy;
  if (!deploy || typeof deploy !== "object" || Array.isArray(deploy)) {
    return phases;
  }

  const safeDeploy = { ...(deploy as Record<string, unknown>) };
  delete safeDeploy.vercelAccessToken;
  return { ...phases, deploy: safeDeploy };
}
