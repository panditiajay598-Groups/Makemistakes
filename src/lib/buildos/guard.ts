import { NextResponse } from "next/server";
import { getAuthSession, type SessionPayload } from "@/lib/authSession";

export type AuthGuardResult =
  | { ok: true; session: SessionPayload }
  | { ok: false; response: NextResponse };

/**
 * Shared authentication + ownership guard for BuildOS API routes.
 *
 * Security contract:
 *  - Rejects unauthenticated or invalid sessions with HTTP 401, without
 *    revealing any workspace information.
 *  - When the client supplies a target `userId`, it MUST match the
 *    authenticated session
 * 's owner; otherwise HTTP 403 is returned.
 *  - The authoritative identity is ALWAYS the session (never the client
 *    supplied value), so a caller can never address another user's workspace.
 */
export async function requireAuthenticatedOwner(
  req: Request,
  requestedUserId?: string | null
): Promise<AuthGuardResult> {
  const session = await getAuthSession(req);

  if (!session) {
    return {
      ok: false,
      response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }

  if (requestedUserId && session.userId !== requestedUserId) {
    return {
      ok: false,
      response: NextResponse.json({ error: "Forbidden" }, { status: 403 }),
    };
  }

  return { ok: true, session };
}
