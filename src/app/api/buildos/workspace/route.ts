import { NextResponse } from "next/server";
import { ensureWorkspace } from "@/lib/buildos/workspaceService";
import { getAuthenticatedIdentity } from "@/lib/security/sessionIdentity";
import { findOwnedWorkspace } from "@/lib/security/workspaceOwnership";

export const runtime = "nodejs";
export const maxDuration = 300;

function bad(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

/** GET — load existing workspace metadata (no install). */
export async function GET(req: Request) {
  try {
    const identity = await getAuthenticatedIdentity(req);
    if (!identity) return bad("Authentication required", 401);

    const { searchParams } = new URL(req.url);
    const problemId = searchParams.get("problemId")?.trim();
    if (!problemId) return bad("problemId is required");

    const owned = await findOwnedWorkspace(identity, problemId);
    const meta = owned?.meta;
    if (!meta) return NextResponse.json({ exists: false });
    return NextResponse.json({ exists: true, workspace: meta });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

/** POST — create or restore workspace + install approved packages. */
export async function POST(req: Request) {
  try {
    const identity = await getAuthenticatedIdentity(req);
    if (!identity) return bad("Authentication required", 401);

    const body = await req.json().catch(() => ({}));
    const problemId = String(body.problemId || "").trim();
    const forceReinstall = Boolean(body.forceReinstall);
    if (!problemId) return bad("problemId is required");

    const owned = await findOwnedWorkspace(identity, problemId);
    const userId = owned?.userId || identity.primaryUserId;
    const result = await ensureWorkspace(userId, problemId, { forceReinstall });

    return NextResponse.json({
      ok: result.workspace.status === "ready",
      created: result.created,
      workspace: {
        workspaceId: result.workspace.workspaceId,
        userId: result.workspace.userId,
        problemId: result.workspace.problemId,
        template: result.workspace.template,
        status: result.workspace.status,
        lastError: result.workspace.lastError,
        createdAt: result.workspace.createdAt,
        updatedAt: result.workspace.updatedAt,
      },
      checks: result.checks,
      tree: result.tree,
      logs: result.provisionLogs,
      environmentReady: result.workspace.status === "ready",
    });
  } catch (err: any) {
    console.error("BuildOS workspace error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
