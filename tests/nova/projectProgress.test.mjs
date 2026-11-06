import assert from "node:assert/strict";
import test from "node:test";
import {
  deriveProjectTaskProgress,
  hasUnresolvedTaskFailure,
  migrateStoredJourneyPhase,
  projectActivityScope,
  persistedJourneyScope,
  readPersistedJourneyPhase,
} from "../../src/lib/nova/projectProgress.ts";

test("journey phase comes only from a valid persisted currentPhase", () => {
  assert.deepEqual(readPersistedJourneyPhase(null), {
    phase: null,
    step: null,
    reason: "No persisted journey record was found.",
  });
  assert.equal(readPersistedJourneyPhase({ currentPhase: 0 }).phase, null);
  assert.equal(readPersistedJourneyPhase({ currentPhase: 10 }).phase, null);
  assert.deepEqual(readPersistedJourneyPhase({ currentPhase: 5 }), {
    phase: "Build",
    step: 5,
    reason: null,
  });
  assert.deepEqual(readPersistedJourneyPhase({ currentPhase: 7 }), {
    phase: "Push to GitHub",
    step: 7,
    reason: null,
  });
  assert.deepEqual(readPersistedJourneyPhase({ currentPhase: 8 }), {
    phase: "Deploy",
    step: 8,
    reason: null,
  });
  assert.deepEqual(readPersistedJourneyPhase({ currentPhase: 9 }), {
    phase: "Validate",
    step: 9,
    reason: null,
  });
});

test("task statuses use verified completion, persisted selection, failures, and dependencies", () => {
  const result = deriveProjectTaskProgress(
    [
      { id: 1, title: "Plan" },
      { id: 2, title: "Implement", dependsOn: [1] },
      { id: 3, title: "Independent check" },
    ],
    new Set([1]),
    2,
    new Set([3])
  );

  assert.deepEqual(result.tasks.map(({ status }) => status), [
    "completed",
    "in_progress",
    "blocked",
  ]);
  assert.equal(result.activeTaskId, 2);
  assert.equal(result.nextTaskId, 2);
});

test("unsatisfied or inconsistent dependencies block tasks without inventing an active task", () => {
  const result = deriveProjectTaskProgress(
    [
      { id: 1, title: "First task" },
      { id: 2, title: "Depends on first", dependsOn: [1] },
      { id: 3, title: "Invalid dependency", dependsOn: [99] },
    ],
    new Set(),
    2
  );

  assert.deepEqual(result.tasks.map(({ status }) => status), [
    "pending",
    "blocked",
    "blocked",
  ]);
  assert.equal(result.tasks[2].dependencyIssue, true);
  assert.equal(result.activeTaskId, null);
  assert.equal(result.nextTaskId, 1);
});

test("activity query is scoped to both authenticated student and project", () => {
  const records = [
    { userId: "student-a", problemId: "project-a", taskId: 1 },
    { userId: "student-b", problemId: "project-a", taskId: 2 },
    { userId: "student-a", problemId: "project-b", taskId: 3 },
  ];
  const scope = projectActivityScope("student-a", "project-a");

  assert.deepEqual(scope, { userId: "student-a", problemId: "project-a" });
  assert.deepEqual(
    records.filter((record) =>
      Object.entries(scope).every(([key, value]) => record[key] === value)
    ),
    [records[0]]
  );

  const journeyScope = persistedJourneyScope(["student-a", "student-a@example.test"], "project-a");
  assert.deepEqual(journeyScope, {
    userId: { $in: ["student-a", "student-a@example.test"] },
    problemId: "project-a",
  });

  test("a task failure blocks progress only until a later task selection or ready preview", () => {
    const started = new Date("2026-01-01T10:00:00Z");
    const failed = new Date("2026-01-01T10:01:00Z");
    const ready = new Date("2026-01-01T10:02:00Z");

    assert.equal(hasUnresolvedTaskFailure({
      lastStartedAt: started,
      lastFailureAt: failed,
      lastReadyAt: null,
    }), true);
    assert.equal(hasUnresolvedTaskFailure({
      lastStartedAt: started,
      lastFailureAt: failed,
      lastReadyAt: ready,
    }), false);
    assert.equal(hasUnresolvedTaskFailure({
      lastStartedAt: ready,
      lastFailureAt: failed,
      lastReadyAt: null,
    }), false);
  });
});

test("legacy journey phase migration maps old 8-phase numbering onto the approved nine-phase sequence", () => {
  // Old 8-phase model: 7 = Deploy, 8 = Validate. No migration needed for <= 6.
  assert.equal(migrateStoredJourneyPhase(1, {}), 1);
  assert.equal(migrateStoredJourneyPhase(6, {}), 6);

  // Old "Deploy" (7) with no further evidence → new Push to GitHub (7)
  assert.equal(migrateStoredJourneyPhase(7, {}), 7);
  // Old "Deploy" (7) with deploy evidence → new Deploy (8)
  assert.equal(
    migrateStoredJourneyPhase(7, { deploy: { githubRepoUrl: "https://github.com/u/r" } }),
    7
  );
  assert.equal(
    migrateStoredJourneyPhase(7, { deploy: { liveUrl: "https://app.vercel.app" } }),
    8
  );

  // Old "Validate" (8) with no deploy/validate evidence → new Deploy (8)
  assert.equal(migrateStoredJourneyPhase(8, {}), 8);
  // Old "Validate" (8) with validate evidence → new Validate (9)
  assert.equal(
    migrateStoredJourneyPhase(8, { validate: { liveUrl: "https://app.vercel.app" } }),
    9
  );
  // Old "Validate" (8) with only deploy evidence → new Deploy (8)
  assert.equal(
    migrateStoredJourneyPhase(8, { deploy: { liveUrl: "https://app.vercel.app" } }),
    8
  );

  // Out-of-range values are clamped into 1..9
  assert.equal(migrateStoredJourneyPhase(null, {}), 1);
  assert.equal(migrateStoredJourneyPhase(0, {}), 1);
  assert.equal(migrateStoredJourneyPhase(99, { validate: { liveUrl: "u" } }), 9);
});
