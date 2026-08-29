import { NextResponse } from "next/server";
import { workspaceDir } from "@/lib/buildos/paths";
import { readAllEditableFiles, writeWorkspaceTextFile } from "@/lib/buildos/files";
import { buildBuildOsPreviewHtml } from "@/lib/buildos/previewRuntime";
import { setWorkspaceStatus } from "@/lib/buildos/workspaceService";

export const runtime = "nodejs";

/**
 * Run = validate workspace + prepare isolated preview payload.
 * Executes student's current workspace code inside the sandboxed iframe.
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const userId = String(body.userId || "").trim();
    const problemId = String(body.problemId || "").trim();
    const clientFiles = body.files && typeof body.files === "object" ? body.files : null;

    if (!userId || !problemId) {
      return NextResponse.json({ error: "userId and problemId are required" }, { status: 400 });
    }

    const root = workspaceDir(userId, problemId);

    // If client supplied latest in-memory workspace files, write them to disk first
    if (clientFiles) {
      for (const [filePath, content] of Object.entries(clientFiles)) {
        if (typeof filePath === "string" && typeof content === "string") {
          try {
            writeWorkspaceTextFile(root, filePath, content);
          } catch (e) {
            console.warn(`Failed to sync file ${filePath} to disk:`, e);
          }
        }
      }
    }

    // Read current workspace files from disk
    const diskFiles = readAllEditableFiles(root);

    // Merge disk files with client in-memory files (client in-memory takes precedence)
    const files: Record<string, string> = {
      ...diskFiles,
      ...(clientFiles || {}),
    };

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
