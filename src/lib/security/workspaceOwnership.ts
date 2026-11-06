import {
  getWorkspaceMeta,
  type BuildWorkspaceDoc,
} from "@/lib/buildos/workspaceService";
import type { AuthenticatedIdentity } from "./sessionIdentity";
import { findOwnedResource } from "./ownedResource";

export type OwnedWorkspace = {
  userId: string;
  meta: BuildWorkspaceDoc;
};

export async function findOwnedWorkspace(
  identity: AuthenticatedIdentity,
  problemId: string
): Promise<OwnedWorkspace | null> {
  const owned = await findOwnedResource(identity.userIds, async (userId) => {
    const meta = await getWorkspaceMeta(userId, problemId);
    return meta?.userId === userId ? meta : null;
  });
  return owned ? { userId: owned.userId, meta: owned.resource } : null;
}

export async function requireOwnedWorkspace(
  identity: AuthenticatedIdentity,
  problemId: string
): Promise<OwnedWorkspace> {
  const owned = await findOwnedWorkspace(identity, problemId);
  if (!owned) {
    throw Object.assign(new Error("Workspace not found"), { status: 404 });
  }
  return owned;
}
