import { getAuthSession } from "@/lib/authSession";
import {
  authenticatedIdentityFromSession,
  type AuthenticatedIdentity,
} from "./identity";

export type { AuthenticatedIdentity } from "./identity";

export async function getAuthenticatedIdentity(
  request: Request
): Promise<AuthenticatedIdentity | null> {
  return authenticatedIdentityFromSession(await getAuthSession(request));
}
