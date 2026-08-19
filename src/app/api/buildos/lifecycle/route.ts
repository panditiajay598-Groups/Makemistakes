import { NextResponse } from "next/server";
import { setWorkspaceStatus, stopWorkspace } from "@/lib/buildos/workspaceService";

export const runtime = "nodejs";

/** POST — stop / archive workspace lifecycle */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const userId = String(body.userId || "").trim();
    const problemId = String(body.problemId || "").trim();
    const action = String(body.action || "stop").trim();
    if (!userId || !problemId) {
      return NextResponse.json({ error: "userId and problemId are required" }, { status: 400 });
    }

    if (action === "archive") {
      const ws = await setWorkspaceStatus(userId, problemId, "archived");
      return NextResponse.json({ ok: true, workspace: ws });
    }

    const ws = await stopWorkspace(userId, problemId);
    return NextResponse.json({ ok: true, workspace: ws });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
