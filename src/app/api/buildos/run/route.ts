import { NextResponse } from "next/server";
import { workspaceDir } from "@/lib/buildos/paths";
import { readAllEditableFiles, writeWorkspaceTextFile } from "@/lib/buildos/files";
import { buildBuildOsPreviewHtml } from "@/lib/buildos/previewRuntime";
import { setWorkspaceStatus } from "@/lib/buildos/workspaceService";
import { validateWorkspaceDependencies } from "@/lib/buildos/validator";
import { runWorkspaceValidation, summarizeValidation } from "@/lib/buildos/validation";
import { getAuthenticatedIdentity } from "@/lib/security/sessionIdentity";
import { requireOwnedWorkspace } from "@/lib/security/workspaceOwnership";
import { recordNovaActivity } from "@/lib/nova/activity";
import { getDb } from "@/lib/mongodb";
import { deriveBuildWorkspace } from "@/lib/buildWorkspace";
import type { ProblemData } from "@/lib/problemContent";

export const runtime = "nodejs";

/**
 * Run = validate workspace + prepare isolated preview payload.
 * Executes student's current workspace code inside the sandboxed iframe.
 */
export async function POST(req: Request) {
  try {
    const identity = await getAuthenticatedIdentity(req);
    if (!identity) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const body = await req.json();
    const problemId = String(body.problemId || "").trim();
    const runId = body.runId || Date.now();
    const taskId = Number.isInteger(body.taskId) ? Number(body.taskId) : undefined;
    const clientFiles = body.files && typeof body.files === "object" ? body.files : null;

    if (!problemId) {
      return NextResponse.json({ error: "problemId is required" }, { status: 400 });
    }

    const { userId } = await requireOwnedWorkspace(identity, problemId);
    if (taskId !== undefined) {
      const db = await getDb();
      const problem = await db.collection("problems").findOne(
        { problemId },
        { projection: { _id: 0 } }
      ) as unknown as ProblemData | null;
      if (!problem || !deriveBuildWorkspace(problem).missions.some((mission) => mission.id === taskId)) {
        return NextResponse.json({ error: "Task does not belong to this project plan" }, { status: 400 });
      }
    }
    const root = workspaceDir(userId, problemId);

    // If client supplied latest in-memory workspace files, write them to disk first
    if (clientFiles) {
      for (const [filePath, content] of Object.entries(clientFiles)) {
        if (typeof filePath === "string" && typeof content === "string") {
          writeWorkspaceTextFile(root, filePath, content);
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

    // Structured, bounded validation pipeline (static checks only; no student
    // code is executed server-side). Toolchain checks are reported as
    // blocked/skipped rather than silently passed.
    const workflowValidation = await runWorkspaceValidation({
      userId,
      problemId,
      executionId: String(runId),
      files,
      level: "Beginner",
    });

    const validationActivityDetails = {
      executionId: workflowValidation.executionId,
      ok: workflowValidation.ok,
      counts: {
        passed: workflowValidation.passed,
        failed: workflowValidation.failed,
        blocked: workflowValidation.blocked,
        skipped: workflowValidation.skipped,
        notExecuted: workflowValidation.notExecuted,
      },
      checks: workflowValidation.checks.slice(0, 12).map((check) => ({
        kind: check.kind,
        status: check.status,
        label: check.label,
        note: check.note || undefined,
        firstError: check.errors[0]?.message,
      })),
    };
    await recordNovaActivity({
      userId,
      problemId,
      type: "validation_run",
      taskId,
      summary: workflowValidation.ok
        ? "BuildOS static validation pipeline passed."
        : "BuildOS static validation pipeline reported failures or blocked checks.",
      details: validationActivityDetails,
    });

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

      await recordNovaActivity({
        userId,
        problemId,
        type: "build_failed",
        taskId,
        summary: "BuildOS dependency validation failed before the preview was launched.",
        details: { errors: validation.errors.slice(0, 12).map((error) => ({ file: error.file, type: error.type, message: error.message })) },
      });

      return NextResponse.json({
        ok: false,
        error: fullError,
        validation: summarizeValidation(workflowValidation),
        logs: [
          "Saving workspace files...",
          "Validating workspace dependency graph...",
          ...validation.errors.map((e) => `Error in ${e.file}: ${e.message}`),
          "❌ Build failed — Runtime launch blocked",
        ],
      });
    }

    const previewHtml = buildBuildOsPreviewHtml(files, { problemId, runId });
    await setWorkspaceStatus(userId, problemId, "running");
    await recordNovaActivity({
      userId,
      problemId,
      type: "preview_prepared",
      summary: "BuildOS validated workspace dependencies and prepared a preview; browser readiness is not yet confirmed.",
      details: { runId: String(runId), fileCount: Object.keys(files).length },
    });

    return NextResponse.json({
      ok: true,
      runId,
      message: "Starting project runtime...",
      previewHtml,
      validation: summarizeValidation(workflowValidation),
      logs: ["Saving workspace files...", "Validating workspace dependency graph...", "Starting project runtime..."],
    });
  } catch (err: unknown) {
    const status =
      typeof err === "object" && err !== null && "status" in err && typeof (err as { status?: unknown }).status === "number"
        ? (err as { status: number }).status
        : 500;
    return NextResponse.json({
      ok: false,
      error: status === 404 ? "Workspace not found" : "Build failed",
    }, { status });
  }
}
