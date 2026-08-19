// In-memory verification code store with 10-minute expiration

interface CodeEntry {
  code: string;
  expiresAt: number;
}

// Global reference to persist code store across Next.js API reloads in dev
const globalForCodeStore = globalThis as unknown as {
  codeStore?: Map<string, CodeEntry>;
};

const store = globalForCodeStore.codeStore ?? new Map<string, CodeEntry>();
if (process.env.NODE_ENV !== "production") {
  globalForCodeStore.codeStore = store;
}

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

/**
 * Saves a 6-digit verification code for a given email.
 * Defaults to 10 minutes TTL.
 */
export function saveCode(email: string, code: string, ttlMinutes = 10): void {
  const cleanEmail = normalizeEmail(email);
  const expiresAt = Date.now() + ttlMinutes * 60 * 1000;
  store.set(cleanEmail, { code, expiresAt });
}

/**
 * Retrieves stored code details for dev fallback testing.
 */
export function getCodeDetails(email: string): { code?: string; isExpired?: boolean } {
  const cleanEmail = normalizeEmail(email);
  const entry = store.get(cleanEmail);
  if (!entry) return {};
  const isExpired = Date.now() > entry.expiresAt;
  return { code: entry.code, isExpired };
}

/**
 * Validates a 6-digit verification code.
 */
export function verifyCode(
  email: string,
  userSubmittedCode: string
): { valid: boolean; reason?: string } {
  const cleanEmail = normalizeEmail(email);
  const entry = store.get(cleanEmail);

  if (!entry) {
    return {
      valid: false,
      reason: "No active verification code found for this email. Please request a new code.",
    };
  }

  if (Date.now() > entry.expiresAt) {
    store.delete(cleanEmail);
    return {
      valid: false,
      reason: "Verification code has expired (10 min limit). Please request a new code.",
    };
  }

  if (entry.code !== userSubmittedCode.trim()) {
    return {
      valid: false,
      reason: "Incorrect 6-digit verification code. Please check and try again.",
    };
  }

  // Code is valid! Consume code so it cannot be reused.
  store.delete(cleanEmail);
  return { valid: true };
}
