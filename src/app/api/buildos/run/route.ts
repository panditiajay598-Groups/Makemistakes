import { NextResponse } from "next/server";
import { workspaceDir } from "@/lib/buildos/paths";
import { readAllEditableFiles } from "@/lib/buildos/files";
import { buildBuildOsPreviewHtml } from "@/lib/buildos/previewRuntime";
import { getWorkspaceMeta, setWorkspaceStatus } from "@/lib/buildos/workspaceService";

export const runtime = "nodejs";

/**
 * Run = validate workspace + prepare isolated preview payload.
 * Does NOT execute student code inside the main MakeMistakes Node process.
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const userId = String(body.userId || "").trim();
    const problemId = String(body.problemId || "").trim();
    if (!userId || !problemId) {
      return NextResponse.json({ error: "userId and problemId are required" }, { status: 400 });
    }

    const root = workspaceDir(userId, problemId);
    const files = readAllEditableFiles(root);

    if (!files["app/page.tsx"] && !files["page.tsx"]) {
      return NextResponse.json({
        ok: false,
        error: "Build failed\n\nError:\nModule not found: app/page.tsx",
      });
    }

    const previewHtml = buildBuildOsPreviewHtml(files, { problemId });
    setWorkspaceStatus(userId, problemId, "running").catch(() => {});

    return NextResponse.json({
      ok: true,
      message: "Project running",
      previewHtml,
      logs: ["Starting project...", "✓ Project running"],
    });
  } catch (err: any) {
    return NextResponse.json({
      ok: false,
      error: `Build failed\n\nError:\n${err.message}`,
    });
  }
}
