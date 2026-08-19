import { NextResponse } from "next/server";
import { ensureWorkspace, getWorkspaceMeta } from "@/lib/buildos/workspaceService";

export const runtime = "nodejs";
export const maxDuration = 300;

function bad(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

/** GET — load existing workspace metadata (no install). */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId")?.trim();
    const problemId = searchParams.get("problemId")?.trim();
    if (!userId || !problemId) return bad("userId and problemId are required");

    const meta = await getWorkspaceMeta(userId, problemId);
    if (!meta) return NextResponse.json({ exists: false });
    return NextResponse.json({ exists: true, workspace: meta });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

/** POST — create or restore workspace + install approved packages. */
export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const userId = String(body.userId || "").trim();
    const problemId = String(body.problemId || "").trim();
    const forceReinstall = Boolean(body.forceReinstall);
    if (!userId || !problemId) return bad("userId and problemId are required");

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
