import type { SessionPayload } from "../authSession";

export function authenticatedSubscriptionUserId(
  session: Pick<SessionPayload, "userId"> | null
): string | null {
  const userId = session?.userId?.trim();
  return userId || null;
}
