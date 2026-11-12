import assert from "node:assert/strict";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

const originalDatabaseUrl = process.env.DATABASE_URL;
const originalGroqKey = process.env.GROQ_API_KEY;
const originalJwtSecret = process.env.JWT_ACCESS_SECRET;
process.env.JWT_ACCESS_SECRET = "nova-chat-route-test-secret-0123456789";
process.env.DATABASE_URL = "mongodb://nova-route-test.invalid/test";

const [
  { POST },
  { POST: updateImplementation },
  { PUT: writeBuildOSFile },
  { signSessionToken },
  { workspaceDir },
  {
    getOrCreateNovaConversation,
    saveNovaImplementationPlan,
    updateNovaImplementationStep,
  },
  { PaymentService },
] = await Promise.all([
  import("../../src/app/api/nova/chat/route.ts"),
  import("../../src/app/api/nova/implementation/route.ts"),
  import("../../src/app/api/buildos/files/route.ts"),
  import("../../src/lib/authSession.ts"),
  import("../../src/lib/buildos/paths.ts"),
  import("../../src/lib/nova/conversations.ts"),
  import("./routeFixtures/mockPaymentService.mjs"),
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
    if (document._id !== undefined && this.documents.some((existing) => existing._id === document._id)) {
      const error = new Error("E11000 duplicate key error collection: duplicate key on _id");
      error.code = 11000;
      throw error;
    }
    this.documents.push(structuredClone(document));
    return { insertedId: document._id };
  }

  find(query) {
    let matches = this.documents.filter((document) => this.matches(document, query));
    const cursor = {
      sort(spec) {
        matches = [...matches].sort((a, b) => {
          for (const [key, direction] of Object.entries(spec)) {
            const order = a[key] < b[key] ? -1 : a[key] > b[key] ? 1 : 0;
            if (order) return order * direction;
          }
          return 0;
        });
        return cursor;
      },
      limit(count) {
        matches = matches.slice(0, count);
        return cursor;
      },
      async toArray() {
        return structuredClone(matches);
      },
    };
    return cursor;
  }

  async findOneAndUpdate(query, update) {
    const document = this.documents.find((item) => this.matches(item, query));
    if (!document) return null;
    document.messageCount = (document.messageCount || 0) + (update.$inc?.messageCount || 0);
    Object.assign(document, update.$set || {});
    return structuredClone(document);
  }

  async updateMany(query, update) {
    let updated = 0;
    for (const document of this.documents) {
      if (this.matches(document, query)) {
        Object.assign(document, update.$set || {});
        updated += 1;
      }
    }
    return { modifiedCount: updated };
  }

  async updateOne(query, update) {
    const document = this.documents.find((item) => this.matches(item, query));
    if (!document) return { matchedCount: 0 };
    if (Array.isArray(update)) {
      const noteExpression = update[0].$set.technicalMemory;
      const notes = noteExpression.$slice[0].$concatArrays[1].$literal;
      document.technicalMemory = [...(document.technicalMemory || []), ...notes].slice(noteExpression.$slice[1]);
    } else if (update.$addToSet) {
      let modified = 0;
      for (const [key, value] of Object.entries(update.$addToSet)) {
        if (!document[key]) document[key] = [];
        if (!document[key].includes(value)) {
          document[key].push(value);
          modified += 1;
        }
      }
      return { matchedCount: 1, modifiedCount: modified };
    } else {
      Object.assign(document, update.$set || {});
    }
    return { matchedCount: 1, modifiedCount: 1 };
  }

  aggregate() {
    return {
      toArray: async () => [{
        recentActivity: [],
        completedTasks: [],
        latestTaskStarted: [],
        taskOutcomes: [],
      }],
    };
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
  const parent = path.dirname(root);
  const outsidePath = path.join(parent, `${problemId}-outside.ts`);
  fs.writeFileSync(outsidePath, `export const outsideEvidence = "${label}-outside-root";`);
  return {
    root,
    outsidePath,
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
  return new Request("http://localhost/api/nova/chat", {
    method: "POST",
    headers: {
      authorization: `Bearer ${token}`,
      "content-type": "application/json",
    },
    body: JSON.stringify(body),
  });
}

function requestBody(problemId, additionalContext = {}) {
  return {
    message: "Where is authentication implemented?",
    context: { problemId, ...additionalContext },
  };
}

function useMockProvider(t) {
  const previousFetch = globalThis.fetch;
  const previousKey = process.env.GROQ_API_KEY;
  const providerCalls = [];
  process.env.GROQ_API_KEY = "synthetic-route-test-key";
  globalThis.fetch = async (_url, options) => {
    const messages = JSON.parse(options.body).messages;
    providerCalls.push(messages);
    return new Response(JSON.stringify({
      choices: [{ message: { content: "The workspace source was inspected." } }],
    }), { status: 200, headers: { "content-type": "application/json" } });
  };
  t.after(() => {
    globalThis.fetch = previousFetch;
    if (previousKey === undefined) delete process.env.GROQ_API_KEY;
    else process.env.GROQ_API_KEY = previousKey;
  });
  return providerCalls;
}

const testUserPrefix = `nova-route-${crypto.randomUUID()}`;
const fixtureRoots = new Set();
const fixtureOutsidePaths = new Set();

test.after(() => {
  delete globalThis.__novaChatRouteTestDb;
  for (const root of fixtureRoots) {
    if (fs.existsSync(root)) fs.rmSync(root, { recursive: true, force: true });
  }
  for (const file of fixtureOutsidePaths) {
    if (fs.existsSync(file)) fs.unlinkSync(file);
  }
  if (originalDatabaseUrl === undefined) delete process.env.DATABASE_URL;
  else process.env.DATABASE_URL = originalDatabaseUrl;
  if (originalGroqKey === undefined) delete process.env.GROQ_API_KEY;
  else process.env.GROQ_API_KEY = originalGroqKey;
  if (originalJwtSecret === undefined) delete process.env.JWT_ACCESS_SECRET;
  else process.env.JWT_ACCESS_SECRET = originalJwtSecret;
});

test("retrying the same request with the same clientMessageId does not deduct AI credits twice", async (t) => {
  const studentA = `${testUserPrefix}-credit@example.test`;
  const projectA = `project-credit-${crypto.randomUUID()}`;
  const fixture = makeProjectFixture(studentA, projectA, "credit");
  fixtureRoots.add(fixture.root);
  fixtureOutsidePaths.add(fixture.outsidePath);
  const db = installFixtures([fixture]);
  useMockProvider(t);
  PaymentService.resetDeductionCallCount();

  const clientMessageId = "retry-idempotency-key";
  const body = { ...requestBody(projectA), clientMessageId };

  const first = await POST(authenticatedRequest(studentA, body));
  assert.equal(first.status, 200);
  assert.equal(PaymentService.getDeductionCallCount(), 1);

  const retry = await POST(authenticatedRequest(studentA, body));
  assert.equal(retry.status, 200);
  assert.equal(PaymentService.getDeductionCallCount(), 1, "retry must not deduct credits again");

  const userMessages = db.collection("nova_conversation_messages").documents.filter(
    (m) => m.role === "user" && m.clientMessageId === clientMessageId
  );
  assert.equal(userMessages.length, 1, "duplicate user message must not be appended");
});

test("concurrent duplicate requests with the same clientMessageId deduct credits only once", async (t) => {
  const studentA = `${testUserPrefix}-conc@example.test`;
  const projectA = `project-conc-${crypto.randomUUID()}`;
  const fixture = makeProjectFixture(studentA, projectA, "conc");
  fixtureRoots.add(fixture.root);
  fixtureOutsidePaths.add(fixture.outsidePath);
  const db = installFixtures([fixture]);
  useMockProvider(t);
  PaymentService.resetDeductionCallCount();

  const clientMessageId = "concurrent-idempotency-key";
  const body = { ...requestBody(projectA), clientMessageId };
  const [first, second] = await Promise.all([
    POST(authenticatedRequest(studentA, body)),
    POST(authenticatedRequest(studentA, body)),
  ]);

  assert.equal(first.status, 200);
  assert.equal(second.status, 200);
  assert.equal(
    PaymentService.getDeductionCallCount(),
    1,
    "concurrent duplicates with the same clientMessageId must deduct credits exactly once"
  );

  const userMessages = db.collection("nova_conversation_messages").documents.filter(
    (m) => m.role === "user" && m.clientMessageId === clientMessageId
  );
  assert.ok(userMessages.length >= 1, "the user message is stored");
});

test("insufficient credits returns 402 and releases the claim so a retry can re-bill", async (t) => {
  const studentA = `${testUserPrefix}-insuf@example.test`;
  const projectA = `project-insuf-${crypto.randomUUID()}`;
  const fixture = makeProjectFixture(studentA, projectA, "insuf");
  fixtureRoots.add(fixture.root);
  fixtureOutsidePaths.add(fixture.outsidePath);
  const db = installFixtures([fixture]);
  useMockProvider(t);
  PaymentService.resetDeductionCallCount();

  const clientMessageId = "insufficient-idempotency-key";
  const body = { ...requestBody(projectA), clientMessageId };

  // First attempt: insufficient credits -> 402. The claim must be released so
  // the same clientMessageId can be billed on a later retry (after top-up).
  PaymentService.setNextDeductResult({ success: false, reason: "INSUFFICIENT_CREDITS", remainingCredits: 0 });
  const denied = await POST(authenticatedRequest(studentA, body));
  assert.equal(denied.status, 402);
  assert.equal(PaymentService.getDeductionCallCount(), 0, "no credits were deducted on the 402");

  // Retry with credits available now bills exactly once (claim was released).
  const retry = await POST(authenticatedRequest(studentA, body));
  assert.equal(retry.status, 200);
  assert.equal(PaymentService.getDeductionCallCount(), 1, "retry after 402 must bill exactly once");
});

test("deduction infrastructure failure returns 500 and releases the claim for a safe retry", async (t) => {
  const studentA = `${testUserPrefix}-fail@example.test`;
  const projectA = `project-fail-${crypto.randomUUID()}`;
  const fixture = makeProjectFixture(studentA, projectA, "fail");
  fixtureRoots.add(fixture.root);
  fixtureOutsidePaths.add(fixture.outsidePath);
  const db = installFixtures([fixture]);
  useMockProvider(t);
  PaymentService.resetDeductionCallCount();

  const clientMessageId = "failure-idempotency-key";
  const body = { ...requestBody(projectA), clientMessageId };

  // First attempt: deduction infrastructure throws -> 500, claim released.
  PaymentService.setNextDeductError(new Error("credit db unavailable"));
  const failed = await POST(authenticatedRequest(studentA, body));
  assert.equal(failed.status, 500);
  assert.equal(PaymentService.getDeductionCallCount(), 1, "the failing attempt did attempt one deduction");

  // Retry with the same clientMessageId re-claims and re-bills once (not stuck).
  const retry = await POST(authenticatedRequest(studentA, body));
  assert.equal(retry.status, 200);
  assert.equal(PaymentService.getDeductionCallCount(), 2, "retry after a deduction failure must bill again exactly once");
});

test("concurrent retries after a 402 do not double-deduct", async (t) => {
  const studentA = `${testUserPrefix}-conr@example.test`;
  const projectA = `project-conr-${crypto.randomUUID()}`;
  const fixture = makeProjectFixture(studentA, projectA, "conr");
  fixtureRoots.add(fixture.root);
  fixtureOutsidePaths.add(fixture.outsidePath);
  const db = installFixtures([fixture]);
  useMockProvider(t);
  PaymentService.resetDeductionCallCount();

  const clientMessageId = "concurrent-retry-idempotency-key";
  const body = { ...requestBody(projectA), clientMessageId };

  // Pre-consume the claim via an insufficient-credit attempt (402).
  PaymentService.setNextDeductResult({ success: false, reason: "INSUFFICIENT_CREDITS", remainingCredits: 0 });
  const denied = await POST(authenticatedRequest(studentA, body));
  assert.equal(denied.status, 402);

  // Two concurrent retries (now with credits) must bill exactly once in total.
  const [first, second] = await Promise.all([
    POST(authenticatedRequest(studentA, body)),
    POST(authenticatedRequest(studentA, body)),
  ]);
  assert.equal(first.status, 200);
  assert.equal(second.status, 200);
  assert.equal(
    PaymentService.getDeductionCallCount(),
    1,
    "concurrent retries after a 402 must deduct credits exactly once"
  );
});

test("authenticated Student A receives only Project A workspace context", async (t) => {
  const studentA = `${testUserPrefix}-a@example.test`;
  const projectA = `project-a-${crypto.randomUUID()}`;
  const fixture = makeProjectFixture(studentA, projectA, "student-a");
  fixtureRoots.add(fixture.root);
  fixtureOutsidePaths.add(fixture.outsidePath);
  const providerCalls = useMockProvider(t);
  const db = installFixtures([fixture]);
  const response = await POST(authenticatedRequest(studentA, requestBody(projectA)));
  const body = await response.json();

  assert.equal(response.status, 200);
  assert.equal(body.ok, true);
  assert.equal(providerCalls.length, 1);
  assert.match(providerCalls[0][0].content, /student-a-workspace/);
  assert.doesNotMatch(providerCalls[0][0].content, /student-a-outside-root/);
  assert.match(db.collection("nova_conversations").documents[0].userId, /nova-route-/);
  const messages = db.collection("nova_conversation_messages").documents;
  assert.equal(messages.length, 2);
  assert.equal(messages[0].role, "user");
  assert.equal(messages[1].role, "assistant");
});

test("Student A cannot request Student B project context", async () => {
  const studentA = `${testUserPrefix}-b@example.test`;
  const studentB = `${testUserPrefix}-c@example.test`;
  const projectB = `project-b-${crypto.randomUUID()}`;
  const fixture = makeProjectFixture(studentB, projectB, "student-b");
  fixtureRoots.add(fixture.root);
  fixtureOutsidePaths.add(fixture.outsidePath);
  const db = installFixtures([fixture]);

  const response = await POST(authenticatedRequest(studentA, requestBody(projectB)));
  const body = await response.json();
  assert.equal(response.status, 404);
  assert.deepEqual(body, { ok: false, error: "Workspace not found" });
  assert.equal(db.collection("nova_conversation_messages").documents.length, 0);
});

test("forged client owner identifier does not change the authenticated workspace identity", async (t) => {
  const studentA = `${testUserPrefix}-d@example.test`;
  const studentB = `${testUserPrefix}-e@example.test`;
  const projectA = `project-forged-${crypto.randomUUID()}`;
  const fixtureA = makeProjectFixture(studentA, projectA, "owner-a");
  const fixtureB = makeProjectFixture(studentB, projectA, "owner-b");
  fixtureRoots.add(fixtureA.root);
  fixtureRoots.add(fixtureB.root);
  fixtureOutsidePaths.add(fixtureA.outsidePath);
  fixtureOutsidePaths.add(fixtureB.outsidePath);
  const providerCalls = useMockProvider(t);
  const db = installFixtures([fixtureA, fixtureB]);

  const response = await POST(authenticatedRequest(
    studentA,
    requestBody(projectA, { userId: studentB, ownerId: studentB, email: studentB })
  ));
  const body = await response.json();

  assert.equal(response.status, 200);
  assert.equal(body.ok, true);
  assert.equal(providerCalls.length, 1);
  assert.match(providerCalls[0][0].content, /owner-a-workspace/);
  assert.doesNotMatch(providerCalls[0][0].content, /owner-b-workspace/);
  assert.equal(db.collection("nova_conversations").documents[0].userId, studentA);
  assert.equal(db.collection("nova_conversation_messages").documents.some((message) =>
    message.content.includes("owner-b")
  ), false);
});

test("unauthenticated requests return no workspace data", async () => {
  const studentA = `${testUserPrefix}-f@example.test`;
  const projectA = `project-unauth-${crypto.randomUUID()}`;
  const fixture = makeProjectFixture(studentA, projectA, "private");
  fixtureRoots.add(fixture.root);
  fixtureOutsidePaths.add(fixture.outsidePath);
  const db = installFixtures([fixture]);
  const response = await POST(new Request("http://localhost/api/nova/chat", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(requestBody(projectA)),
  }));
  const body = await response.json();

  assert.equal(response.status, 401);
  assert.equal(body.ok, false);
  assert.equal(JSON.stringify(body).includes("private-workspace"), false);
  assert.equal(db.collection("nova_conversation_messages").documents.length, 0);
});

test("missing and inaccessible projects fail safely without filesystem details", async () => {
  const studentA = `${testUserPrefix}-g@example.test`;
  const missingProject = `project-missing-${crypto.randomUUID()}`;
  installFixtures([]);

  const response = await POST(authenticatedRequest(studentA, requestBody(missingProject)));
  const body = await response.json();
  assert.equal(response.status, 404);
  assert.deepEqual(body, { ok: false, error: "Workspace not found" });
  assert.equal(JSON.stringify(body).includes("student-workspaces"), false);
});

test("workspace context cannot read files outside the authenticated project root", async (t) => {
  const studentA = `${testUserPrefix}-h@example.test`;
  const projectA = `project-boundary-${crypto.randomUUID()}`;
  const fixture = makeProjectFixture(studentA, projectA, "inside-root");
  fixtureRoots.add(fixture.root);
  fixtureOutsidePaths.add(fixture.outsidePath);
  installFixtures([fixture]);
  const previousDatabaseUrl = process.env.DATABASE_URL;
  const providerCalls = useMockProvider(t);
  process.env.DATABASE_URL = "mongodb://nova-route-test.invalid/test";
  t.after(() => {
    if (previousDatabaseUrl === undefined) delete process.env.DATABASE_URL;
    else process.env.DATABASE_URL = previousDatabaseUrl;
  });

  const response = await POST(authenticatedRequest(studentA, requestBody(projectA, {
    activeFile: "../outside.ts",
  })));
  assert.equal(response.status, 200);
  const serializedPrompt = JSON.stringify(providerCalls);
  assert.match(serializedPrompt, /inside-root-workspace/);
  assert.doesNotMatch(serializedPrompt, /inside-root-outside-root/);
});

test("implementation progress route enforces authenticated project ownership", async () => {
  const studentA = `${testUserPrefix}-implementation-a@example.test`;
  const studentB = `${testUserPrefix}-implementation-b@example.test`;
  const projectA = `project-implementation-${crypto.randomUUID()}`;
  const fixture = makeProjectFixture(studentA, projectA, "implementation-owner");
  fixtureRoots.add(fixture.root);
  fixtureOutsidePaths.add(fixture.outsidePath);
  const db = installFixtures([fixture]);
  const conversation = await getOrCreateNovaConversation(db, studentA, projectA);
  await saveNovaImplementationPlan(db, studentA, projectA, conversation.conversationId, {
    id: "plan-route-test",
    objective: "Add a login view",
    existingFindings: [],
    risks: [],
    expectedOutcome: "Reviewed login view",
    currentStepId: "step-1",
    steps: [{
      id: "step-1",
      title: "Add login view",
      explanation: "",
      technicalObjective: "",
      relevantFiles: ["src/Login.tsx"],
      proposedChanges: [],
      dependsOn: [],
      acceptanceCriteria: ["View renders"],
      validationMethod: "Run the workspace",
      status: "planned",
    }],
    updatedAt: new Date().toISOString(),
  });
  const payload = {
    problemId: projectA,
    conversationId: conversation.conversationId,
    stepId: "step-1",
    status: "awaiting_approval",
    proposalId: "proposal-route-test",
    proposalContent: "export function Login() { return null; }",
    userId: studentB,
    ownerId: studentB,
  };

  const unauthenticated = await updateImplementation(new Request("http://localhost/api/nova/implementation", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(payload),
  }));
  assert.equal(unauthenticated.status, 401);

  const crossStudent = await updateImplementation(authenticatedRequest(studentB, payload));
  assert.equal(crossStudent.status, 404);

  const ownerRequest = await updateImplementation(authenticatedRequest(studentA, payload));
  const ownerBody = await ownerRequest.json();
  assert.equal(ownerRequest.status, 200);
  assert.equal(ownerBody.implementationPlan.steps[0].status, "awaiting_approval");
  assert.equal(db.collection("nova_conversations").documents[0].userId, studentA);
});

test("workspace file route accepts only the exact executing proposal for a saved plan", async () => {
  const studentA = `${testUserPrefix}-file-binding@example.test`;
  const projectA = `project-file-binding-${crypto.randomUUID()}`;
  const fixture = makeProjectFixture(studentA, projectA, "file-binding");
  fixtureRoots.add(fixture.root);
  fixtureOutsidePaths.add(fixture.outsidePath);
  const db = installFixtures([fixture]);
  const conversation = await getOrCreateNovaConversation(db, studentA, projectA);
  const code = "export const authEnabled = true;";
  await saveNovaImplementationPlan(db, studentA, projectA, conversation.conversationId, {
    id: "plan-file-binding-test",
    objective: "Update authentication",
    existingFindings: [],
    risks: [],
    expectedOutcome: "Reviewed authentication change",
    currentStepId: "step-1",
    steps: [{
      id: "step-1",
      title: "Update auth module",
      explanation: "",
      technicalObjective: "",
      relevantFiles: ["src/auth.ts"],
      proposedChanges: [],
      dependsOn: [],
      acceptanceCriteria: ["Auth module exports the updated flag"],
      validationMethod: "Run the workspace",
      status: "planned",
    }],
    updatedAt: new Date().toISOString(),
  });
  await updateNovaImplementationStep(
    db, studentA, projectA, conversation.conversationId,
    "step-1", "awaiting_approval", "proposal-file-test", code
  );
  await updateNovaImplementationStep(
    db, studentA, projectA, conversation.conversationId,
    "step-1", "approved", "proposal-file-test"
  );
  await updateNovaImplementationStep(
    db, studentA, projectA, conversation.conversationId,
    "step-1", "executing", "proposal-file-test"
  );

  const authorized = (content, implementation) => authenticatedRequest(studentA, {
      problemId: projectA,
      path: "src/auth.ts",
      content,
      source: "nova_approved",
      implementation,
    });
  const original = fs.readFileSync(path.join(fixture.root, "src", "auth.ts"), "utf8");
  const binding = {
    conversationId: conversation.conversationId,
    stepId: "step-1",
    proposalId: "proposal-file-test",
  };

  const unbound = await writeBuildOSFile(authorized(code, undefined));
  assert.equal(unbound.status, 409);
  assert.equal(fs.readFileSync(path.join(fixture.root, "src", "auth.ts"), "utf8"), original);

  const altered = await writeBuildOSFile(authorized("export const authEnabled = false;", binding));
  assert.equal(altered.status, 409);
  assert.equal(fs.readFileSync(path.join(fixture.root, "src", "auth.ts"), "utf8"), original);

  const applied = await writeBuildOSFile(authorized(code, binding));
  assert.equal(applied.status, 200);
  assert.equal(fs.readFileSync(path.join(fixture.root, "src", "auth.ts"), "utf8"), code);
});
