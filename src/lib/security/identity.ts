import type { SessionPayload } from "../authSession";

export type AuthenticatedIdentity = {
  session: SessionPayload;
  userIds: string[];
  primaryUserId: string;
};

export function authenticatedIdentityFromSession(
  session: SessionPayload | null
): AuthenticatedIdentity | null {
  if (!session?.userId?.trim() || !session.email?.trim()) {
    return null;
  }

  const email = session.email.trim().toLowerCase();
  const userIds = [...new Set([email, session.userId.trim()])];
  return {
    session,
    userIds,
    primaryUserId: email,
  };
}
