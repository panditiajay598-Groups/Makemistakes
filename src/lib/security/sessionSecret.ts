type SessionSecretEnvironment = {
  JWT_ACCESS_SECRET?: string;
  NODE_ENV?: string;
};

const LEGACY_DEVELOPMENT_SECRET = "makemistakes_secure_session_secret_2026";

export function getSessionSecret(
  env: SessionSecretEnvironment = process.env
): string {
  const secret = env.JWT_ACCESS_SECRET;

  if (!secret) {
    throw new Error("JWT_ACCESS_SECRET must be configured before the application can start.");
  }
  if (secret !== secret.trim() || Buffer.byteLength(secret, "utf8") < 32) {
    throw new Error("JWT_ACCESS_SECRET must be at least 32 bytes and contain no surrounding whitespace.");
  }
  if (secret === LEGACY_DEVELOPMENT_SECRET) {
    throw new Error("JWT_ACCESS_SECRET must not use the legacy development signing key.");
  }

  return secret;
}

export function validateSessionSecretConfiguration(): void {
  getSessionSecret(process.env);
}
