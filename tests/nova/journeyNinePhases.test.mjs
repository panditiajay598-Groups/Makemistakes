import assert from "node:assert/strict";
import test from "node:test";
import {
  PERSISTED_JOURNEY_PHASES,
  readPersistedJourneyPhase,
  migrateStoredJourneyPhase,
  projectActivityScope,
} from "../../src/lib/nova/projectProgress.ts";
import { computeMaxAllowedPhase } from "../../src/app/api/journey/user-data/route.ts";

const NINE_PHASES = [
  "Discover",
  "Research",
  "Design",
  "Plan",
  "Build",
  "Test",
  "Push to GitHub",
  "Deploy",
  "Validate",
];

test("canonical registry contains exactly the approved nine phases in order", () => {
  assert.deepEqual(
    [...PERSISTED_JOURNEY_PHASES],
    NINE_PHASES
  );
  assert.equal(PERSISTED_JOURNEY_PHASES.length, 9);
});

test("readPersistedJourneyPhase maps every nine-phase number to its name", () => {
  for (let step = 1; step <= 9; step++) {
    assert.deepEqual(readPersistedJourneyPhase({ currentPhase: step }), {
      phase: NINE_PHASES[step - 1],
      step,
      reason: null,
    });
  }
  assert.equal(readPersistedJourneyPhase({ currentPhase: 10 }).phase, null);
  assert.equal(readPersistedJourneyPhase({ currentPhase: 0 }).phase, null);
});

test("portfolio is preserved as a non-phase step (step 10) and does not appear in the registry", () => {
  assert.equal(PERSISTED_JOURNEY_PHASES.includes("Portfolio"), false);
  assert.equal(readPersistedJourneyPhase({ currentPhase: 10 }).phase, null);
});

test("no evidence unlocks only phase 1 (Discover)", () => {
  assert.equal(computeMaxAllowedPhase({}), 1);
  assert.equal(computeMaxAllowedPhase(null), 1);
  assert.equal(computeMaxAllowedPhase({ discover: { completed: false } }), 1);
});

test("phase progression unlocks the next phase based on completed-stage evidence", () => {
  assert.equal(
    computeMaxAllowedPhase({ discover: { completed: true } }),
    2
  );
  assert.equal(
    computeMaxAllowedPhase({ research: { sources: [{ title: "s" }] } }),
    3
  );
  assert.equal(
    computeMaxAllowedPhase({ design: { productGoal: "app" } }),
    4
  );
  assert.equal(
    computeMaxAllowedPhase({ plan: { modules: [{ id: 1 }] } }),
    5
  );
  assert.equal(
    computeMaxAllowedPhase({ build: { status: "completed" } }),
    6
  );
  assert.equal(
    computeMaxAllowedPhase({ test: { finalSummary: "done" } }),
    7
  );
});

test("GitHub push unlocks Push to GitHub (7) and Deploy (8) but not Validate (9)", () => {
  assert.equal(
    computeMaxAllowedPhase({ deploy: { githubRepoUrl: "https://github.com/u/r" } }),
    7
  );
  assert.equal(
    computeMaxAllowedPhase({ deploy: { connected: true } }),
    7
  );
  assert.equal(
    computeMaxAllowedPhase({ deploy: { liveUrl: "https://app.vercel.app" } }),
    8
  );
  assert.equal(
    computeMaxAllowedPhase({ deploy: { deploymentStatus: "success" } }),
    8
  );
});

test("a completed Validate record unlocks all nine phases", () => {
  assert.equal(
    computeMaxAllowedPhase({ validate: { liveUrl: "https://app.vercel.app" } }),
    9
  );
});

test("incomplete/invalid phase data never unlocks a full stage or unwinds progress", () => {
  assert.equal(
    computeMaxAllowedPhase({ test: { scenarios: [] }, build: {} }),
    1
  );
  // A stored higher phase is preserved rather than reset
  assert.equal(computeMaxAllowedPhase({}, 8), 8);
  assert.equal(computeMaxAllowedPhase({}, 9), 9);
});

test("migration is deterministic and repeatable (same input → same output)", () => {
  const phaseDoc = { validate: { liveUrl: "https://app.vercel.app" } };
  const first = migrateStoredJourneyPhase(8, phaseDoc);
  const second = migrateStoredJourneyPhase(8, phaseDoc);
  assert.equal(first, 9);
  assert.equal(second, 9);
});

test("legacy 8-phase records migrate without resetting completed work", () => {
  // Old Validate (8) with validate evidence → 9
  assert.equal(
    migrateStoredJourneyPhase(8, { validate: { liveUrl: "u" } }),
    9
  );
  // Old Deploy (7) with only push evidence → 7 (Push to GitHub)
  assert.equal(
    migrateStoredJourneyPhase(7, { deploy: { githubRepoUrl: "u" } }),
    7
  );
  // Old Deploy (7) with real deploy evidence → 8
  assert.equal(
    migrateStoredJourneyPhase(7, { deploy: { liveUrl: "u" } }),
    8
  );
  // Old Validate (8) with only deploy evidence → 8
  assert.equal(
    migrateStoredJourneyPhase(8, { deploy: { liveUrl: "u" } }),
    8
  );
});

test("student/project isolation is enforced by scope helpers", () => {
  const scope = projectActivityScope("student-a", "project-a");
  assert.deepEqual(scope, { userId: "student-a", problemId: "project-a" });
  const records = [
    { userId: "student-a", problemId: "project-a" },
    { userId: "student-b", problemId: "project-a" },
    { userId: "student-a", problemId: "project-b" },
  ];
  assert.deepEqual(
    records.filter((r) =>
      Object.entries(scope).every(([k, v]) => r[k] === v)
    ),
    [records[0]]
  );
});
