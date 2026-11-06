import { NextResponse } from "next/server";
import { deriveBuildWorkspace, validateMissionCode } from "@/lib/buildWorkspace";
import type { ProblemData } from "@/lib/problemContent";
import { isEditableRelativePath, workspaceDir } from "@/lib/buildos/paths";
import { readWorkspaceTextFile } from "@/lib/buildos/files";
import { getDb } from "@/lib/mongodb";
import { getAuthenticatedIdentity } from "@/lib/security/sessionIdentity";
import { requireOwnedWorkspace } from "@/lib/security/workspaceOwnership";
import { getNovaProjectActivity, recordNovaActivity } from "@/lib/nova/activity";
import { deriveProjectTaskProgress } from "@/lib/nova/projectProgress";

export const runtime = "nodejs";

function message(error: string, status = 400) {
  return NextResponse.json({ ok: false, error }, { status });
}

function clean(value: unknown, limit = 600): string {
  return typeof value === "string"
    ? value.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "").trim().slice(0, limit)
    : "";
}

export async function POST(req: Request) {
  try {
    const identity = await getAuthenticatedIdentity(req);
    if (!identity) return message("Authentication required", 401);

    const body = await req.json().catch(() => ({}));
    const problemId = clean(body.problemId, 120);
    const type = clean(body.type, 40);
    if (!problemId) return message("problemId is required");

    const { userId } = await requireOwnedWorkspace(identity, problemId);
    const db = await getDb();
    const problem = await db.collection("problems").findOne(
      { problemId },
      { projection: { _id: 0 } }
    ) as unknown as ProblemData | null;
    if (!problem) return message("Project problem record was not found", 404);
    const workspace = deriveBuildWorkspace(problem);
    const taskId = Number.isInteger(body.taskId) ? Number(body.taskId) : undefined;
    const mission = workspace.missions.find((item) => item.id === taskId);

    if (type === "task_started") {
      if (!mission) return message("Task does not belong to this project plan", 400);
      const activity = await getNovaProjectActivity(userId, problemId, 50);
      const progress = deriveProjectTaskProgress(
        workspace.missions,
        activity.completedTaskIds,
        activity.latestTaskId,
        activity.blockedTaskIds
      );
      const taskProgress = progress.tasks.find((task) => task.id === mission.id);
      if (taskProgress?.dependencyIssue || taskProgress?.blockingTaskIds.length) {
        return message("Complete the prerequisite tasks before selecting this task.", 409);
      }
      const recorded = await recordNovaActivity({
        userId,
        problemId,
        type,
        taskId: mission.id,
        summary: "Student selected this task in the BuildOS roadmap.",
      });
      return recorded ? NextResponse.json({ ok: true, taskId: mission.id }) : message("Could not save active task", 503);
    }

    if (type === "task_completed") {
      if (!mission) return message("Task does not belong to this project plan", 400);
      const {
        recentActivity: history,
        completedTaskIds,
        latestTaskId,
        blockedTaskIds,
      } = await getNovaProjectActivity(userId, problemId, 50);
      if (completedTaskIds.has(mission.id)) {
        return NextResponse.json({ ok: true, taskId: mission.id, alreadyCompleted: true });
      }
      const progress = deriveProjectTaskProgress(
        workspace.missions,
        completedTaskIds,
        latestTaskId,
        blockedTaskIds
      );
      const taskProgress = progress.tasks.find((task) => task.id === mission.id);
      if (progress.activeTaskId !== mission.id) {
        return message("Select this task in the BuildOS roadmap before completing it.", 409);
      }
      if (taskProgress?.status === "blocked") {
        return message("Complete the task dependencies and resolve the latest failed run before completing this task.", 409);
      }
      const lastRuntimeReady = history.find((event) =>
        event.type === "preview_ready" && event.taskId === mission.id
      );
      const runId = lastRuntimeReady?.details?.runId;
      const matchingPreparedRun = typeof runId === "string" && history.find((event) =>
        event.type === "preview_prepared" && event.details?.runId === runId
      );
      const lastFileChange = history.find((event) =>
        ["file_saved", "file_created", "file_deleted", "proposal_approved"].includes(event.type)
      );
      const lastBuildFailure = history.find((event) =>
        event.type === "build_failed" && (!event.taskId || event.taskId === mission.id)
      );
      const lastRuntimeError = history.find((event) =>
        event.type === "runtime_error" && event.taskId === mission.id
      );
      if (
        !lastRuntimeReady ||
        !matchingPreparedRun ||
        matchingPreparedRun.at > lastRuntimeReady.at ||
        (lastFileChange && lastFileChange.at > matchingPreparedRun.at) ||
        (lastBuildFailure && lastBuildFailure.at > matchingPreparedRun.at) ||
        (lastRuntimeError && lastRuntimeError.at > lastRuntimeReady.at)
      ) {
        return message("Run the current workspace and wait for the preview to become ready before completing this task.", 409);
      }

      const root = workspaceDir(userId, problemId);
      const files: Record<string, string> = {};
      for (const filePath of mission.files) {
        try {
          files[filePath] = readWorkspaceTextFile(root, filePath);
        } catch {
          // A missing task file is represented by the server-side validator as absent code.
        }
      }

      const validation = validateMissionCode({ mission, files, hasRun: true });
      if (!validation.ok) {
        return NextResponse.json({ ok: false, error: "Task validation failed against the saved workspace.", validation }, { status: 422 });
      }
      const recorded = await recordNovaActivity({
        userId,
        problemId,
        type: "task_completed",
        taskId: mission.id,
        summary: "Task passed server-side validation against saved workspace files after a ready preview.",
        details: { validatedFilePaths: Object.keys(files) },
      });
      if (!recorded) return message("Task passed, but its progress could not be saved. Try again.", 503);
      return NextResponse.json({ ok: true, taskId: mission.id, validation });
    }

    if (type === "proposal_rejected") {
      if (!mission) return message("Task does not belong to this project plan", 400);
      const filePath = clean(body.filePath, 240).replace(/\\/g, "/");
      if (!filePath || !isEditableRelativePath(filePath)) return message("A valid proposal file path is required");
      const recorded = await recordNovaActivity({
        userId,
        problemId,
        type,
        taskId: mission.id,
        filePath,
        summary: "Student rejected a Nova code proposal; no code was applied.",
      });
      return recorded ? NextResponse.json({ ok: true }) : message("Could not save proposal history", 503);
    }

    if (type === "preview_ready" || type === "runtime_error") {
      if (taskId !== undefined && !mission) return message("Task does not belong to this project plan", 400);
      const summary = type === "preview_ready"
        ? "Preview iframe reported ready for the current BuildOS run."
        : clean(body.error, 1_000) || "Preview reported a runtime error.";
      const recorded = await recordNovaActivity({
        userId,
        problemId,
        type,
        taskId: mission?.id,
        summary,
        details: { runId: clean(body.runId, 80) },
      });
      return recorded ? NextResponse.json({ ok: true }) : message("Could not save runtime history", 503);
    }

    return message("Unsupported project activity type");
  } catch (error) {
    const status = typeof error === "object" && error !== null && "status" in error && typeof error.status === "number"
      ? error.status
      : 500;
    if (status >= 500) console.error("[Nova activity] Failed to record project activity.", error);
    return message(status === 404 ? "Workspace not found" : "Could not record project activity", status);
  }
}

export async function GET(req: Request) {
  try {
    const identity = await getAuthenticatedIdentity(req);
    if (!identity) return message("Authentication required", 401);

    const problemId = clean(new URL(req.url).searchParams.get("problemId"), 120);
    if (!problemId) return message("problemId is required");

    const { userId } = await requireOwnedWorkspace(identity, problemId);
    const db = await getDb();
    const problem = await db.collection("problems").findOne(
      { problemId },
      { projection: { _id: 0 } }
    ) as unknown as ProblemData | null;
    if (!problem) return message("Project problem record was not found", 404);

    const workspace = deriveBuildWorkspace(problem);
    const activity = await getNovaProjectActivity(userId, problemId, 50);
    const progress = deriveProjectTaskProgress(
      workspace.missions,
      activity.completedTaskIds,
      activity.latestTaskId,
      activity.blockedTaskIds
    );

    return NextResponse.json(
      {
        ok: true,
        activeTaskId: progress.activeTaskId,
        nextTaskId: progress.nextTaskId,
        completedTaskIds: [...activity.completedTaskIds].filter((id) =>
          workspace.missions.some((mission) => mission.id === id)
        ),
        blockedTaskIds: progress.tasks
          .filter((task) => task.status === "blocked")
          .map((task) => task.id),
        dependencyBlockedTaskIds: progress.tasks
          .filter((task) => task.dependencyIssue || task.blockingTaskIds.length > 0)
          .map((task) => task.id),
      },
      { headers: { "Cache-Control": "private, no-store" } }
    );
  } catch (error) {
    const status = typeof error === "object" && error !== null && "status" in error && typeof error.status === "number"
      ? error.status
      : 500;
    if (status >= 500) console.error("[Nova activity] Failed to load project progress.", error);
    return message(status === 404 ? "Workspace not found" : "Could not load project progress", status);
  }
}
