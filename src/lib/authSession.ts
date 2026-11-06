import crypto from "crypto";
import { prisma } from "@backend/lib/prisma";
import { getSessionSecret } from "@/lib/security/sessionSecret";

const SESSION_SECRET = getSessionSecret();
const SESSION_COOKIE_NAME = "makemistakes_session";
const SESSION_EXPIRY_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

export interface SessionPayload {
  userId: string;
  email: string;
  role?: string;
  iat: number;
  exp: number;
}

/**
 * Base64URL encode/decode helpers
 */
function base64UrlEncode(str: string): string {
  return Buffer.from(str)
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

function base64UrlDecode(str: string): string {
  let base64 = str.replace(/-/g, "+").replace(/_/g, "/");
  while (base64.length % 4) {
    base64 += "=";
  }
  return Buffer.from(base64, "base64").toString("utf-8");
}

/**
 * Creates a cryptographically signed HMAC-SHA256 JWT-compatible session token
 */
export function signSessionToken(payload: Omit<SessionPayload, "iat" | "exp">): string {
  const now = Math.floor(Date.now() / 1000);
  const exp = now + Math.floor(SESSION_EXPIRY_MS / 1000);

  const header = { alg: "HS256", typ: "JWT" };
  const fullPayload: SessionPayload = {
    ...payload,
    iat: now,
    exp,
  };

  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(fullPayload));
  const data = `${encodedHeader}.${encodedPayload}`;

  const signature = crypto
    .createHmac("sha256", SESSION_SECRET)
    .update(data)
    .digest("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");

  return `${data}.${signature}`;
}

/**
 * Verifies a signed session token. Returns null if invalid or expired.
 */
export function verifySessionToken(token: string): SessionPayload | null {
  if (!token || typeof token !== "string") return null;

  const parts = token.split(".");
  if (parts.length !== 3) return null;

  const [encodedHeader, encodedPayload, signature] = parts;
  const data = `${encodedHeader}.${encodedPayload}`;

  try {
    const header = JSON.parse(base64UrlDecode(encodedHeader)) as { alg?: string };
    if (header.alg !== "HS256") return null;

    const expectedSignature = crypto
      .createHmac("sha256", SESSION_SECRET)
      .update(data)
      .digest("base64")
      .replace(/=/g, "")
      .replace(/\+/g, "-")
      .replace(/\//g, "_");

    if (Buffer.byteLength(signature) !== Buffer.byteLength(expectedSignature)) {
      return null;
    }

    const isSigValid = crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    );
    if (!isSigValid) return null;

    const payload: SessionPayload = JSON.parse(base64UrlDecode(encodedPayload));
    const now = Math.floor(Date.now() / 1000);

    if (
      typeof payload.userId !== "string" ||
      !payload.userId.trim() ||
      typeof payload.email !== "string" ||
      !payload.email.trim() ||
      typeof payload.iat !== "number" ||
      typeof payload.exp !== "number" ||
      payload.exp <= now
    ) {
      return null;
    }

    return payload;
  } catch (err) {
    return null;
  }
}

/**
 * Resolves the authenticated session from an incoming Request
 * Checks Authorization header (Bearer token) or Cookies (makemistakes_session)
 */
export async function getAuthSession(req: Request): Promise<SessionPayload | null> {
  let token: string | null = null;

  // 1. Try Authorization header
  const authHeader = req.headers.get("authorization");
  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.substring(7).trim();
  }

  // 2. Try Cookie header if no auth header
  if (!token) {
    const cookieHeader = req.headers.get("cookie");
    if (cookieHeader) {
      const cookies = cookieHeader.split(";").map((c) => c.trim());
      for (const cookie of cookies) {
        if (cookie.startsWith(`${SESSION_COOKIE_NAME}=`)) {
          token = cookie.substring(SESSION_COOKIE_NAME.length + 1).trim();
          break;
        }
      }
    }
  }

  if (!token) return null;

  return verifySessionToken(token);
}

// In-flight user resolution map to deduplicate concurrent creation requests
const inFlightUserResolution = new Map<
  string,
  Promise<{ id: string; email: string; role: string; emailVerified: boolean }>
>();

/**
 * Ensures or retrieves the authoritative internal User account record by email.
 * Guarantees a stable internal ObjectId in the database.
 */
export async function resolveOrCreateUser(emailInput: string): Promise<{
  id: string;
  email: string;
  role: string;
  emailVerified: boolean;
}> {
  const email = emailInput.trim().toLowerCase();
  const existingPromise = inFlightUserResolution.get(email);
  if (existingPromise) {
    return existingPromise;
  }

  const promise = (async () => {
    try {
      return await _resolveOrCreateUserInternal(email);
    } finally {
      inFlightUserResolution.delete(email);
    }
  })();

  inFlightUserResolution.set(email, promise);
  return promise;
}

async function _resolveOrCreateUserInternal(email: string): Promise<{
  id: string;
  email: string;
  role: string;
  emailVerified: boolean;
}> {
  // 1. Check if user already exists with related records
  const existingUser = await prisma.user.findUnique({
    where: { email },
    include: {
      creditBalance: { select: { id: true } },
      subscription: { select: { id: true } },
    },
  });

  if (existingUser) {
    // If email is not yet marked verified, update it
    if (!existingUser.emailVerified) {
      await prisma.user.update({
        where: { id: existingUser.id },
        data: { emailVerified: true },
      });
      existingUser.emailVerified = true;
    }

    // Ensure default credit balance exists if missing (repair state)
    if (!existingUser.creditBalance) {
      try {
        await prisma.aiCreditBalance.create({
          data: {
            userId: existingUser.id,
            totalCredits: 100,
            usedCredits: 0,
            remainingCredits: 100,
          },
        });
      } catch (cErr: any) {
        if (cErr?.code !== "P2002") throw cErr;
      }
    }

    // Ensure subscription exists if missing (repair state)
    if (!existingUser.subscription) {
      try {
        await prisma.subscription.create({
          data: {
            userId: existingUser.id,
            plan: "FREE",
            status: "ACTIVE",
          },
        });
      } catch (sErr: any) {
        if (sErr?.code !== "P2002") throw sErr;
      }
    }

    return {
      id: existingUser.id,
      email: existingUser.email,
      role: existingUser.role,
      emailVerified: existingUser.emailVerified,
    };
  }

  // 2. First-time registration: create user, initial balance, and free tier subscription
  let newUser;
  try {
    newUser = await prisma.user.create({
      data: {
        email,
        emailVerified: true,
        role: "student",
      },
    });
  } catch (err: any) {
    // If concurrent registration hit a unique email race condition (Prisma P2002)
    if (err?.code === "P2002" || err?.message?.includes("Unique constraint")) {
      const winnerUser = await prisma.user.findUnique({
        where: { email },
        include: {
          creditBalance: { select: { id: true } },
          subscription: { select: { id: true } },
        },
      });

      if (winnerUser) {
        if (!winnerUser.creditBalance) {
          try {
            await prisma.aiCreditBalance.create({
              data: {
                userId: winnerUser.id,
                totalCredits: 100,
                usedCredits: 0,
                remainingCredits: 100,
              },
            });
          } catch (cErr: any) {
            if (cErr?.code !== "P2002") throw cErr;
          }
        }

        if (!winnerUser.subscription) {
          try {
            await prisma.subscription.create({
              data: {
                userId: winnerUser.id,
                plan: "FREE",
                status: "ACTIVE",
              },
            });
          } catch (sErr: any) {
            if (sErr?.code !== "P2002") throw sErr;
          }
        }

        return {
          id: winnerUser.id,
          email: winnerUser.email,
          role: winnerUser.role,
          emailVerified: winnerUser.emailVerified,
        };
      }
    }
    // Re-throw any other database error
    throw err;
  }

  try {
    await prisma.aiCreditBalance.create({
      data: {
        userId: newUser.id,
        totalCredits: 100,
        usedCredits: 0,
        remainingCredits: 100,
      },
    });
  } catch (cErr: any) {
    if (cErr?.code !== "P2002") throw cErr;
  }

  try {
    await prisma.subscription.create({
      data: {
        userId: newUser.id,
        plan: "FREE",
        status: "ACTIVE",
      },
    });
  } catch (sErr: any) {
    if (sErr?.code !== "P2002") throw sErr;
  }

  return {
    id: newUser.id,
    email: newUser.email,
    role: newUser.role,
    emailVerified: newUser.emailVerified,
  };
}

export { SESSION_COOKIE_NAME, SESSION_EXPIRY_MS };
