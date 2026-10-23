import crypto from "crypto";
import nodemailer from "nodemailer";
import type { Transporter } from "nodemailer";

export interface SmtpTransportOptions {
  host: string;
  port: number;
  secure: boolean;
  auth?: {
    user: string;
    pass: string;
  };
  connectionTimeout?: number;
  greetingTimeout?: number;
}

declare global {
  // eslint-disable-next-line no-var
  var __smtpTransporterCache: Map<string, Transporter> | undefined;
}

// Global cache to maintain warm SMTP transporter pools across hot reloads in Next.js
const transporterCache =
  globalThis.__smtpTransporterCache ?? new Map<string, Transporter>();

if (!globalThis.__smtpTransporterCache) {
  globalThis.__smtpTransporterCache = transporterCache;
}

/**
 * Derives a deterministic cache key based on connection parameters, user identity,
 * and a secure one-way hash fingerprint of credentials.
 * Raw passwords are never stored in the key or exposed in logs.
 */
function getTransporterKey(options: SmtpTransportOptions): string {
  const host = options.host.trim().toLowerCase();
  const port = options.port;
  const secure = Boolean(options.secure);
  const user = (options.auth?.user || "anonymous").trim().toLowerCase();
  const passFingerprint = options.auth?.pass
    ? crypto.createHash("sha256").update(options.auth.pass).digest("hex").slice(0, 12)
    : "none";
  return `${host}:${port}:${secure}:${user}:${passFingerprint}`;
}

/**
 * Returns a cached, reusable Nodemailer Transporter instance for equivalent SMTP configurations.
 * Creates a new transporter only when an existing instance with identical configuration is not found.
 */
export function getOrCreateTransporter(options: SmtpTransportOptions): Transporter {
  if (!options.host || !options.port) {
    throw new Error("Invalid SMTP configuration: host and port are required.");
  }

  const key = getTransporterKey(options);

  const existing = transporterCache.get(key);
  if (existing) {
    return existing;
  }

  const transporter = nodemailer.createTransport({
    host: options.host,
    port: options.port,
    secure: options.secure,
    auth: options.auth
      ? {
          user: options.auth.user,
          pass: options.auth.pass,
        }
      : undefined,
    connectionTimeout: options.connectionTimeout ?? 8000,
    greetingTimeout: options.greetingTimeout ?? 8000,
    pool: true, // Enable SMTP connection pooling for reused connections
    maxConnections: 5,
    maxMessages: 100,
  });

  transporterCache.set(key, transporter);
  return transporter;
}

/**
 * Diagnostic helper: returns the count of active cached transporters.
 */
export function getTransporterPoolSize(): number {
  return transporterCache.size;
}

/**
 * Resets the transporter cache strictly for test suite verification.
 * @internal
 */
export function _resetTransportersForTesting(): void {
  for (const transporter of transporterCache.values()) {
    try {
      transporter.close();
    } catch {
      // Ignore cleanup error
    }
  }
  transporterCache.clear();
}
