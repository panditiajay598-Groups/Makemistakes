import { NextResponse } from "next/server";
import { workspaceDir } from "@/lib/buildos/paths";
import { readAllEditableFiles, writeWorkspaceTextFile } from "@/lib/buildos/files";
import { buildBuildOsPreviewHtml } from "@/lib/buildos/previewRuntime";
import { setWorkspaceStatus } from "@/lib/buildos/workspaceService";
import { validateWorkspaceDependencies } from "@/lib/buildos/validator";

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
    const runId = body.runId || Date.now();
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

    // PART 7 — PRE-RUN VALIDATION GATE
    const validation = validateWorkspaceDependencies(files, "Beginner");

    if (!validation.valid) {
      const errorHeader = "Build failed\n\nValidation Errors:\n";
      const formattedErrors = validation.errors
        .map(
          (e, idx) =>
            `${idx + 1}. [${e.type}] ${e.message}\n   File: ${e.file}${
              e.suggestedAction ? `\n   Action: ${e.suggestedAction}` : ""
            }`
        )
        .join("\n\n");

      const fullError = `${errorHeader}${formattedErrors}`;

      return NextResponse.json({
        ok: false,
        error: fullError,
        logs: [
          "Saving workspace files...",
          "Validating workspace dependency graph...",
          ...validation.errors.map((e) => `Error in ${e.file}: ${e.message}`),
          "❌ Build failed — Runtime launch blocked",
        ],
      });
    }

    const previewHtml = buildBuildOsPreviewHtml(files, { problemId, runId });
    setWorkspaceStatus(userId, problemId, "running").catch(() => {});

    return NextResponse.json({
      ok: true,
      runId,
      message: "Starting project runtime...",
      previewHtml,
      logs: ["Saving workspace files...", "Validating workspace dependency graph...", "Starting project runtime..."],
    });
  } catch (err: any) {
    return NextResponse.json({
      ok: false,
      error: `Build failed\n\nError:\n${err.message}`,
    });
  }
}
