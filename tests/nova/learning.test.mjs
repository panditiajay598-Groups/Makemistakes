import assert from "node:assert/strict";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

const originalJwtSecret = process.env.JWT_ACCESS_SECRET;
const originalDatabaseUrl = process.env.DATABASE_URL;
process.env.JWT_ACCESS_SECRET = "nova-learning-route-test-secret-0123456789";
process.env.DATABASE_URL = "mongodb://nova-learning-route-test.invalid/test";

const [
  { POST, GET },
  { evaluateUnderstandingResponse, getOrCreateLearningRecord, recordConceptIntroduced },
  { signSessionToken },
  { workspaceDir },
] = await Promise.all([
  import("../../src/app/api/nova/learning/route.ts"),
  import("../../src/lib/nova/learning.ts"),
  import("../../src/lib/authSession.ts"),
  import("../../src/lib/buildos/paths.ts"),
]);

class FixtureCollection {
  constructor(documents = []) {
    this.documents = documents;
  }

  matches(document, query) {
    return Object.entries(query).every(([key, value]) => {
      const actual = document[key];
      if (value && typeof value === "object" && "$in" in value) {
        return value.$in.includes(actual);
      }
      return actual === value;
    });
  }

  async findOne(query) {
    return structuredClone(this.documents.find((document) => this.matches(document, query)) || null);
  }

  async insertOne(document) {
    this.documents.push(structuredClone(document));
    return { insertedId: document._id };
  }

  find(query) {
    const matches = this.documents.filter((document) => this.matches(document, query));
    return {
      sort() { return this; },
      limit() { return this; },
      async toArray() { return structuredClone(matches); },
      _matches: matches,
    };
  }

  async updateOne(query, update) {
    const document = this.documents.find((item) => this.matches(item, query));
    if (!document) return { matchedCount: 0 };
    Object.assign(document, update.$set || {});
    return { matchedCount: 1 };
  }
}

class FixtureDb {
  constructor() {
    this.collections = new Map();
  }

  collection(name) {
    if (!this.collections.has(name)) this.collections.set(name, new FixtureCollection());
    return this.collections.get(name);
  }
}

function makeProjectFixture(userId, problemId, label) {
  const root = workspaceDir(userId, problemId);
  fs.mkdirSync(path.join(root, "src"), { recursive: true });
  fs.writeFileSync(path.join(root, "package.json"), JSON.stringify({
    name: `${label}-fixture`,
    dependencies: { react: "^19.0.0" },
  }));
  fs.writeFileSync(path.join(root, "src", "auth.ts"), `export const authEvidence = "${label}-workspace";`);
  return {
    root,
    workspace: {
      userId,
      problemId,
      workspaceId: `workspace-${problemId}`,
      status: "ready",
    },
    problem: {
      problemId,
      title: `${label} Product`,
      problemStatement: `A test project for ${label}.`,
      category: "Testing",
    },
  };
}

function installFixtures(fixtures) {
  const db = new FixtureDb();
  for (const fixture of fixtures) {
    db.collection("build_workspaces").documents.push(fixture.workspace);
    db.collection("problems").documents.push(fixture.problem);
  }
  globalThis.__novaChatRouteTestDb = db;
  return db;
}

function authenticatedRequest(userId, body, tokenUserId = userId) {
  const token = signSessionToken({ userId: tokenUserId, email: userId });
  return new Request("http://localhost/api/nova/learning", {
    method: "POST",
    headers: {
      authorization: `Bearer ${token}`,
      "content-type": "application/json",
    },
    body: JSON.stringify(body),
  });
}

const testUserPrefix = `nova-learning-${crypto.randomUUID()}`;
const fixtureRoots = new Set();

test.after(() => {
  delete globalThis.__novaChatRouteTestDb;
  for (const root of fixtureRoots) {
    if (fs.existsSync(root)) fs.rmSync(root, { recursive: true, force: true });
  }
  if (originalDatabaseUrl === undefined) delete process.env.DATABASE_URL;
  else process.env.DATABASE_URL = originalDatabaseUrl;
  if (originalJwtSecret === undefined) delete process.env.JWT_ACCESS_SECRET;
  else process.env.JWT_ACCESS_SECRET = originalJwtSecret;
});

test("understanding evaluation classifies strong, partial, and empty answers", () => {
  const input = (answer) => ({
    question: "Why is authentication required on this API route?",
    answer,
    conceptName: "authentication",
    keywords: ["authentication", "authorization", "session", "protected route"],
    evidenceTerms: ["src/api/route.ts", "middleware"],
  });

  assert.equal(evaluateUnderstandingResponse(input("Authentication is required to verify the identity of the caller and protect the route from unauthorized access. The session token is checked in the middleware before the route runs.")), "understood");
  assert.equal(evaluateUnderstandingResponse(input("It checks who is logged in using the session token.")), "partially_understood");
  assert.equal(evaluateUnderstandingResponse(input("")), "needs_clarification");
  assert.equal(evaluateUnderstandingResponse(input("yes")), "needs_clarification");
});

test("learning record creation is scoped to student and project and is idempotent", async () => {
  const db = new FixtureDb();
  const studentA = `${testUserPrefix}-a@example.test`;
  const projectA = `project-a-${crypto.randomUUID()}`;

  const first = await getOrCreateLearningRecord(db, studentA, projectA);
  assert.equal(first.concepts.length, 0);
  assert.equal(first.userId, studentA);
  assert.equal(first.problemId, projectA);

  const again = await getOrCreateLearningRecord(db, studentA, projectA);
  assert.equal(again.concepts.length, 0);
  assert.equal(db.collection("nova_learning_records").documents.length, 1);

  const otherStudent = await getOrCreateLearningRecord(db, `${testUserPrefix}-other@example.test`, projectA);
  assert.equal(db.collection("nova_learning_records").documents.length, 2);
  assert.notEqual(otherStudent.userId, studentA);
});

test("concept tracking deduplicates by name and records explanations", async () => {
  const db = new FixtureDb();
  const studentA = `${testUserPrefix}-b@example.test`;
  const projectA = `project-b-${crypto.randomUUID()}`;

  const first = await recordConceptIntroduced(db, studentA, projectA, "Sessions and tokens");
  assert.equal(first.record.concepts.length, 1);
  assert.equal(first.record.concepts[0].explanationCount, 0);

  const dup = await recordConceptIntroduced(db, studentA, projectA, "sessions and tokens");
  assert.equal(dup.record.concepts.length, 1);
  assert.equal(dup.concept.id, first.concept.id);

  const after = await (await import("../../src/lib/nova/learning.ts")).recordExplanationCompleted(db, studentA, projectA, first.concept.id);
  assert.equal(after.concepts[0].explanationCount, 1);
});

test("assessment outcomes are recorded server-side and flag required revision", async () => {
  const db = new FixtureDb();
  const studentA = `${testUserPrefix}-c@example.test`;
  const projectA = `project-c-${crypto.randomUUID()}`;

  const { concept } = await recordConceptIntroduced(db, studentA, projectA, "authentication");
  const { check, record } = await import("../../src/lib/nova/learning.ts")
    .then((m) => m.recordUnderstandingCheck(
      db, studentA, projectA, concept.id,
      "What does this function do?",
      "It verifies the caller's session token.",
      ["session", "token", "verify"]
    ));
  assert.equal(check.outcome, "understood");
  assert.equal(record.concepts[0].assessmentOutcomes.length, 1);
  assert.equal(record.concepts[0].requiresRevision, false);

  const weak = await import("../../src/lib/nova/learning.ts")
    .then((m) => m.recordUnderstandingCheck(
      db, studentA, projectA, concept.id,
      "What does this function do?",
      "I am not sure.",
      ["session", "token", "verify"]
    ));
  assert.equal(weak.check.outcome, "needs_clarification");
  assert.equal(weak.record.concepts[0].requiresRevision, true);
});

test("practical exercise lifecycle is recorded against a concept", async () => {
  const db = new FixtureDb();
  const studentA = `${testUserPrefix}-d@example.test`;
  const projectA = `project-d-${crypto.randomUUID()}`;

  const { concept } = await recordConceptIntroduced(db, studentA, projectA, "api routes");
  const assigned = await (await import("../../src/lib/nova/learning.ts")).recordExercise(db, studentA, projectA, concept.id, "Add a validation condition", "assigned", false);
  assert.equal(assigned.exercises.length, 1);
  assert.equal(assigned.exercises[0].proposalApproved, false);

  const completed = await (await import("../../src/lib/nova/learning.ts")).recordExercise(db, studentA, projectA, concept.id, "Add a validation condition", "completed", true);
  assert.equal(completed.exercises[1].status, "completed");
  assert.equal(completed.exercises[1].proposalApproved, true);
  assert.equal(completed.concepts[0].exerciseCount, 2);
  assert.equal(completed.concepts[0].exerciseCompleted, 1);
});

test("learning route requires authentication and rejects cross-student access", async () => {
  const studentA = `${testUserPrefix}-e@example.test`;
  const studentB = `${testUserPrefix}-f@example.test`;
  const projectB = `project-e-${crypto.randomUUID()}`;
  const fixture = makeProjectFixture(studentB, projectB, "owner");
  fixtureRoots.add(fixture.root);
  installFixtures([fixture]);

  const unauthenticated = await POST(new Request("http://localhost/api/nova/learning", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ problemId: projectB, action: "concept_introduced", name: "auth" }),
  }));
  assert.equal(unauthenticated.status, 401);

  const crossStudent = await POST(authenticatedRequest(studentA, {
    problemId: projectB,
    action: "concept_introduced",
    name: "auth",
  }));
  assert.equal(crossStudent.status, 404);
});

test("learning route evaluates an understanding check server-side", async () => {
  const studentA = `${testUserPrefix}-g@example.test`;
  const projectA = `project-f-${crypto.randomUUID()}`;
  const fixture = makeProjectFixture(studentA, projectA, "student");
  fixtureRoots.add(fixture.root);
  const db = installFixtures([fixture]);
  const { concept } = await recordConceptIntroduced(db, studentA, projectA, "sessions");

  const response = await POST(authenticatedRequest(studentA, {
    problemId: projectA,
    action: "understanding_check",
    conceptId: concept.id,
    question: "Where is the session value stored?",
    answer: "The session token is created at login and verified in the route middleware before protected handlers run.",
    keywords: ["session", "token", "middleware", "route"],
  }));
  assert.equal(response.status, 200);
  const body = await response.json();
  assert.equal(body.ok, true);
  assert.equal(body.outcome, "understood");
  assert.equal(db.collection("nova_learning_records").documents[0].understandingChecks.length, 1);
  assert.notEqual(body.outcome, "needs_clarification");
});

test("learning route rejects invalid and forged records", async () => {
  const studentA = `${testUserPrefix}-h@example.test`;
  const projectA = `project-g-${crypto.randomUUID()}`;
  const fixture = makeProjectFixture(studentA, projectA, "student");
  fixtureRoots.add(fixture.root);
  installFixtures([fixture]);

  const missing = await POST(authenticatedRequest(studentA, { problemId: projectA, action: "understanding_check" }));
  assert.equal(missing.status, 400);

  const badStatus = await POST(authenticatedRequest(studentA, {
    problemId: projectA,
    action: "exercise",
    conceptId: "concept-1",
    title: "Check",
    status: "fake-status",
  }));
  assert.equal(badStatus.status, 400);

  const forgedClientOutcome = await POST(authenticatedRequest(studentA, {
    problemId: projectA,
    action: "understanding_check",
    conceptId: "concept-1",
    question: "test",
    answer: "I don't know.",
    keywords: ["session"],
    outcome: "understood",
  }));
  const forgedBody = await forgedClientOutcome.json();
  assert.equal(forgedBody.outcome, "needs_clarification");
});

test("GET returns a bounded learning summary and scopes to the owner", async () => {
  const studentA = `${testUserPrefix}-i@example.test`;
  const projectA = `project-h-${crypto.randomUUID()}`;
  const fixture = makeProjectFixture(studentA, projectA, "student");
  fixtureRoots.add(fixture.root);
  const db = installFixtures([fixture]);
  await recordConceptIntroduced(db, studentA, projectA, "authentication");

  const token = signSessionToken({ userId: studentA, email: studentA });
  const response = await GET(new Request(`http://localhost/api/nova/learning?problemId=${encodeURIComponent(projectA)}`, {
    headers: { authorization: `Bearer ${token}` },
  }));
  assert.equal(response.status, 200);
  const body = await response.json();
  assert.equal(body.ok, true);
  assert.equal(body.concepts.length, 1);
  assert.match(body.summary, /authentication/);

  const other = `${testUserPrefix}-j@example.test`;
  const otherToken = signSessionToken({ userId: other, email: other });
  const forbidden = await GET(new Request(`http://localhost/api/nova/learning?problemId=${encodeURIComponent(projectA)}`, {
    headers: { authorization: `Bearer ${otherToken}` },
  }));
  assert.equal(forbidden.status, 404);
});
