import { getDb } from "@/lib/mongodb";
import { hasUnresolvedTaskFailure, projectActivityScope } from "./projectProgress";

export type NovaActivityType =
  | "file_saved"
  | "file_created"
  | "file_deleted"
  | "proposal_approved"
  | "proposal_rejected"
  | "task_started"
  | "task_completed"
  | "build_failed"
  | "preview_prepared"
  | "preview_ready"
  | "runtime_error"
  | "validation_run";

export type NovaActivity = {
  userId: string;
  problemId: string;
  type: NovaActivityType;
  at: Date;
  taskId?: number;
  filePath?: string;
  summary?: string;
  details?: Record<string, unknown>;
};

const COLLECTION = "buildos_activity";

function sanitizeActivityValue(value: unknown, depth = 0): unknown {
  if (depth > 4) return undefined;
  if (value instanceof Date) return value;
  if (typeof value === "string") {
    return value
      .slice(0, 1_000)
      .replace(/-----BEGIN [A-Z ]*PRIVATE KEY-----[\s\S]*?-----END [A-Z ]*PRIVATE KEY-----/g, "[REDACTED PRIVATE KEY]")
      .replace(/\bBearer\s+[A-Za-z0-9._~+/-]+=*/gi, "Bearer [REDACTED]")
      .replace(/((?:api[_-]?key|secret|password|passwd|token|access[_-]?token|client[_-]?secret)\s*[:=]\s*["']?)[^\s"',;}]+/gi, "$1[REDACTED]")
      .replace(/\b(sk-[A-Za-z0-9_-]{12,}|gh[pousr]_[A-Za-z0-9_]{20,})\b/g, "[REDACTED CREDENTIAL]");
  }
  if (typeof value === "number" || typeof value === "boolean" || value === null) return value;
  if (Array.isArray(value)) return value.slice(0, 20).map((item) => sanitizeActivityValue(item, depth + 1));
  if (typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>)
        .filter(([key]) => !/(?:token|secret|password|credential|private.?key|env(?:ironment)?.?variable)/i.test(key))
        .slice(0, 30)
        .map(([key, item]) => [key.slice(0, 100), sanitizeActivityValue(item, depth + 1)])
    );
  }
  return undefined;
}

export async function recordNovaActivity(
  activity: Omit<NovaActivity, "at"> & { at?: Date }
): Promise<boolean> {
  try {
    const db = await getDb();
    const safeActivity = sanitizeActivityValue(activity) as Omit<NovaActivity, "at"> & { at?: Date };
    await db.collection<NovaActivity>(COLLECTION).insertOne({
      ...safeActivity,
      at: safeActivity.at || new Date(),
    });
    return true;
  } catch (error) {
    console.warn("[Nova] Could not persist project activity.", {
      type: activity.type,
      errorName: error instanceof Error ? error.name : "UnknownError",
    });
    return false;
  }
}

export async function getNovaProjectActivity(
  userId: string,
  problemId: string,
  limit = 20
): Promise<{
  recentActivity: NovaActivity[];
  completedTaskIds: Set<number>;
  latestTaskId: number | null;
  blockedTaskIds: Set<number>;
}> {
  const db = await getDb();
  const [snapshot] = await db
    .collection<NovaActivity>(COLLECTION)
    .aggregate<{
    recentActivity: NovaActivity[];
    completedTasks: Array<{ _id: number }>;
    latestTaskStarted: Array<{ taskId: number }>;
    taskOutcomes: Array<{
      _id: number;
      lastStartedAt: Date | null;
      lastFailureAt: Date | null;
      lastReadyAt: Date | null;
    }>;
    }>([
    { $match: projectActivityScope(userId, problemId) },
    {
      $facet: {
        recentActivity: [
          { $sort: { at: -1, _id: -1 } },
          { $limit: Math.max(1, Math.min(50, limit)) },
          { $project: { _id: 0 } },
        ],
        completedTasks: [
          { $match: { type: "task_completed", taskId: { $type: "number" } } },
          { $group: { _id: "$taskId" } },
        ],
        latestTaskStarted: [
          { $match: { type: "task_started", taskId: { $type: "number" } } },
          { $sort: { at: -1, _id: -1 } },
          { $limit: 1 },
          { $project: { _id: 0, taskId: 1 } },
        ],
        taskOutcomes: [
          {
            $match: {
              type: { $in: ["task_started", "build_failed", "runtime_error", "preview_ready"] },
              taskId: { $type: "number" },
            },
          },
          {
            $group: {
              _id: "$taskId",
              lastStartedAt: {
                $max: { $cond: [{ $eq: ["$type", "task_started"] }, "$at", null] },
              },
              lastFailureAt: {
                $max: {
                  $cond: [
                    { $in: ["$type", ["build_failed", "runtime_error"]] },
                    "$at",
                    null,
                  ],
                },
              },
              lastReadyAt: {
                $max: { $cond: [{ $eq: ["$type", "preview_ready"] }, "$at", null] },
              },
            },
          },
        ],
      },
    },
    ])
    .toArray();

  return {
    recentActivity: snapshot?.recentActivity || [],
    completedTaskIds: new Set((snapshot?.completedTasks || [])
    .map((task) => task._id)
    .filter((taskId): taskId is number =>
    typeof taskId === "number" && Number.isInteger(taskId)
    )),
    latestTaskId: snapshot?.latestTaskStarted?.[0]?.taskId ?? null,
    blockedTaskIds: new Set((snapshot?.taskOutcomes || [])
    .filter(hasUnresolvedTaskFailure)
    .map((task) => task._id)
    .filter((taskId): taskId is number =>
      typeof taskId === "number" && Number.isInteger(taskId)
    )),
  };
}
