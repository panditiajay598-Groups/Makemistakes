export const PERSISTED_JOURNEY_PHASES = [
  "Discover",
  "Research",
  "Design",
  "Plan",
  "Build",
  "Test",
  "Push to GitHub",
  "Deploy",
  "Validate",
] as const;

export type ProjectTaskStatus = "completed" | "in_progress" | "blocked" | "pending";

export type ProjectTask = {
  id: number;
  title: string;
  dependsOn?: number[];
};

export type ProjectTaskProgress = ProjectTask & {
  status: ProjectTaskStatus;
  blockingTaskIds: number[];
  dependencyIssue: boolean;
};

export type TaskOutcomeTimes = {
  lastStartedAt: Date | null;
  lastFailureAt: Date | null;
  lastReadyAt: Date | null;
};

export function hasUnresolvedTaskFailure(outcome: TaskOutcomeTimes): boolean {
  return outcome.lastFailureAt instanceof Date &&
    (!outcome.lastReadyAt || outcome.lastFailureAt > outcome.lastReadyAt) &&
    (!outcome.lastStartedAt || outcome.lastFailureAt > outcome.lastStartedAt);
}

/**
 * Map a legacy stored journey phase number onto the approved nine-phase sequence.
 *
 * The previously persisted model used a eight-phase numbering where 7 = Deploy
 * and 8 = Validate. The approved nine-phase model is:
 *   1 Discover, 2 Research, 3 Design, 4 Plan, 5 Build,
 *   6 Test, 7 Push to GitHub, 8 Deploy, 9 Validate
 *
 * This function is deterministic and repeatable; it rewrites no persisted data.
 * It only interprets evidence already present in the phase document.
 */
export function migrateStoredJourneyPhase(
  storedPhase: number | null | undefined,
  phases: unknown
): number {
  if (storedPhase == null) return 1;
  const p = (phases && typeof phases === "object" && !Array.isArray(phases) ? phases : {}) as Record<string, any>;
  const isValidateDone = Boolean(p.validate?.liveUrl);
  const isDeployDone =
    isValidateDone ||
    Boolean(p.deploy?.liveUrl) ||
    Boolean(p.deploy?.deploymentStatus && p.deploy.deploymentStatus !== "pending");
  const isPushDone =
    Boolean(p.deploy?.githubRepoUrl) ||
    Boolean(p.deploy?.isPushed) ||
    Boolean(p.deploy?.connected);

  if (storedPhase >= 8) {
    if (isValidateDone) return 9;
    if (isDeployDone) return 8;
    if (isPushDone) return 7;
    return 8;
  }
  if (storedPhase === 7) {
    if (isValidateDone) return 9;
    if (isDeployDone) return 8;
    return 7;
  }
  return Math.max(1, Math.min(9, storedPhase));
}

export function projectActivityScope(userId: string, problemId: string) {
  return { userId, problemId };
}

export function persistedJourneyScope(userIds: string[], problemId: string) {
  return { userId: { $in: userIds }, problemId };
}

export function readPersistedJourneyPhase(
  journey: unknown
): { phase: string | null; step: number | null; reason: string | null } {
  if (!journey || typeof journey !== "object" || Array.isArray(journey)) {
    return { phase: null, step: null, reason: "No persisted journey record was found." };
  }

  const currentPhase = (journey as Record<string, unknown>).currentPhase;
  if (
    typeof currentPhase !== "number" ||
    !Number.isInteger(currentPhase) ||
    currentPhase < 1 ||
    currentPhase > PERSISTED_JOURNEY_PHASES.length
  ) {
    return { phase: null, step: null, reason: "The persisted journey phase is missing or invalid." };
  }

  return {
    phase: PERSISTED_JOURNEY_PHASES[currentPhase - 1],
    step: currentPhase,
    reason: null,
  };
}

export function deriveProjectTaskProgress(
  tasks: ProjectTask[],
  completedTaskIds: ReadonlySet<number>,
  activeTaskId: number | null,
  blockedTaskIds: ReadonlySet<number> = new Set()
): {
  tasks: ProjectTaskProgress[];
  activeTaskId: number | null;
  nextTaskId: number | null;
} {
  const taskIds = new Set(tasks.map((task) => task.id));
  const taskProgress = tasks.map((task) => {
    const rawDependencies: unknown[] = Array.isArray(task.dependsOn) ? task.dependsOn : [];
    const dependencies = rawDependencies.filter(
      (id): id is number => typeof id === "number" && Number.isInteger(id)
    );
    const dependencyIssue = dependencies.length !== rawDependencies.length || dependencies.some((id) =>
      id === task.id || !taskIds.has(id)
    );
    const blockingTaskIds = dependencies.filter((id) => !completedTaskIds.has(id));
    const isCompleted = completedTaskIds.has(task.id);
    const isBlocked = !isCompleted && (
      dependencyIssue ||
      blockingTaskIds.length > 0 ||
      blockedTaskIds.has(task.id)
    );
    const isActive = !isCompleted && !isBlocked && activeTaskId === task.id;

    return {
      ...task,
      status: isCompleted
        ? "completed"
        : isBlocked
          ? "blocked"
          : isActive
            ? "in_progress"
            : "pending",
      blockingTaskIds,
      dependencyIssue,
    } satisfies ProjectTaskProgress;
  });

  const active = taskProgress.find((task) =>
    task.id === activeTaskId && task.status === "in_progress"
  );
  const next = taskProgress.find((task) =>
    task.status === "pending" || task.status === "in_progress"
  );

  return {
    tasks: taskProgress,
    activeTaskId: active?.id ?? null,
    nextTaskId: next?.id ?? null,
  };
}
