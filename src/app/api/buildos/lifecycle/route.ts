import { NextResponse } from "next/server";
import { setWorkspaceStatus, stopWorkspace } from "@/lib/buildos/workspaceService";
import { getAuthenticatedIdentity } from "@/lib/security/sessionIdentity";
import { requireOwnedWorkspace } from "@/lib/security/workspaceOwnership";

export const runtime = "nodejs";

/** POST — stop / archive workspace lifecycle */
export async function POST(req: Request) {
  try {
    const identity = await getAuthenticatedIdentity(req);
    if (!identity) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const body = await req.json();
    const problemId = String(body.problemId || "").trim();
    const action = String(body.action || "stop").trim();
    if (!problemId) {
      return NextResponse.json({ error: "problemId is required" }, { status: 400 });
    }

    const { userId } = await requireOwnedWorkspace(identity, problemId);
    if (action === "archive") {
      const ws = await setWorkspaceStatus(userId, problemId, "archived");
      return NextResponse.json({ ok: true, workspace: ws });
    }

    const ws = await stopWorkspace(userId, problemId);
    return NextResponse.json({ ok: true, workspace: ws });
  } catch (err: any) {
    const status = typeof err?.status === "number" ? err.status : 500;
    return NextResponse.json(
      { error: status === 404 ? "Workspace not found" : "Unable to update workspace lifecycle" },
      { status }
    );
  }
}
