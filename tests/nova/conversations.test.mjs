import assert from "node:assert/strict";
import test from "node:test";
import {
  appendNovaConversationMessage,
  findNovaConversation,
  getOrCreateNovaConversation,
  matchesNovaImplementationProposal,
  saveNovaImplementationPlan,
  updateNovaImplementationStep,
} from "../../src/lib/nova/conversations.ts";
import { parseNovaImplementationPlan } from "../../src/lib/nova/implementationPlan.ts";

class FakeCollection {
  documents = [];

  async findOne(query) {
    return this.documents.find((document) =>
      Object.entries(query).every(([key, value]) => document[key] === value)
    ) || null;
  }

  async insertOne(document) {
    if (this.documents.some((item) => item._id === document._id)) {
      throw Object.assign(new Error("duplicate key"), { code: 11000 });
    }
    this.documents.push(structuredClone(document));
  }

  find(query) {
    let matches = this.documents.filter((document) =>
      Object.entries(query).every(([key, value]) => document[key] === value)
    );
    const cursor = {
      sort(spec) {
        matches = [...matches].sort((a, b) => {
          for (const [key, direction] of Object.entries(spec)) {
            const result = a[key] < b[key] ? -1 : a[key] > b[key] ? 1 : 0;
            if (result !== 0) return result * direction;
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
    const document = await this.findOne(query);
    if (!document) return null;
    document.messageCount = (document.messageCount || 0) + update.$inc.messageCount;
    Object.assign(document, update.$set || {});
    return structuredClone(document);
  }

  async updateOne(query, update) {
    const document = await this.findOne(query);
    if (!document) return { matchedCount: 0 };
    if (Array.isArray(update)) {
      const expression = update[0].$set.technicalMemory;
      const concatenated = [
        ...document.technicalMemory,
        ...expression.$slice[0].$concatArrays[1].$literal,
      ];
      document.technicalMemory = concatenated.slice(expression.$slice[1]);
      return { matchedCount: 1 };
    }
    Object.assign(document, update.$set || {});
    return { matchedCount: 1 };
  }
}

class FakeDb {
  collections = new Map();

  collection(name) {
    if (!this.collections.has(name)) this.collections.set(name, new FakeCollection());
    return this.collections.get(name);
  }
}

test("project conversation ID and messages persist and restore", async () => {
  const db = new FakeDb();
  const first = await getOrCreateNovaConversation(db, "student-a", "P000001");
  await appendNovaConversationMessage(db, "student-a", "P000001", first.conversationId, "user", "Decision: use MongoDB for saved project state.");
  await appendNovaConversationMessage(db, "student-a", "P000001", first.conversationId, "assistant", "That matches the existing MongoDB infrastructure.");

  const restored = await getOrCreateNovaConversation(db, "student-a", "P000001");
  assert.equal(restored.conversationId, first.conversationId);
  assert.deepEqual(restored.messages.map(({ role }) => role), ["user", "assistant"]);
  assert.match(restored.technicalMemory, /use MongoDB for saved project state/);
});

test("parallel first requests keep one conversation ID per project", async () => {
  const db = new FakeDb();
  const conversations = await Promise.all(
    Array.from({ length: 8 }, () => getOrCreateNovaConversation(db, "student-a", "P000001"))
  );
  assert.equal(new Set(conversations.map(({ conversationId }) => conversationId)).size, 1);
});

test("conversation and message reads are isolated by student and project", async () => {
  const db = new FakeDb();
  const studentA = await getOrCreateNovaConversation(db, "student-a", "P000001");
  const studentB = await getOrCreateNovaConversation(db, "student-b", "P000001");
  const otherProject = await getOrCreateNovaConversation(db, "student-a", "P000002");

  assert.notEqual(studentA.conversationId, studentB.conversationId);
  assert.notEqual(studentA.conversationId, otherProject.conversationId);
  assert.equal(await findNovaConversation(db, "student-b", "P000001", studentA.conversationId), false);
  assert.equal(await findNovaConversation(db, "student-a", "P000002", studentA.conversationId), false);
  assert.equal(await findNovaConversation(db, "student-a", "P000001", studentB.conversationId), false);
});

test("stored messages redact credentials and restored context remains bounded", async () => {
  const db = new FakeDb();
  const conversation = await getOrCreateNovaConversation(db, "student-a", "P000001");
  await appendNovaConversationMessage(
    db,
    "student-a",
    "P000001",
    conversation.conversationId,
    "user",
    "Use this API key: ghp_123456789012345678901234567890123456"
  );
  for (let index = 0; index < 20; index++) {
    await appendNovaConversationMessage(
      db,
      "student-a",
      "P000001",
      conversation.conversationId,
      index % 2 === 0 ? "user" : "assistant",
      `Implementation decision ${index}: keep the service boundary stable.`
    );
  }

  const restored = await getOrCreateNovaConversation(db, "student-a", "P000001");
  assert.equal(restored.messages.length, 12);
  assert.equal(restored.messages.some(({ content }) => content.includes("ghp_1234567890")), false);
  assert.ok(restored.technicalMemory.length <= 8_000);
});

test("implementation plans parse bounded steps and ignore forward dependencies", () => {
  const parsed = parseNovaImplementationPlan([
    "I inspected the current workspace.",
    "<NOVA_IMPLEMENTATION_PLAN>",
    JSON.stringify({
      objective: "Add authentication",
      steps: [
        { title: "Inspect login", dependsOn: ["step-2"], relevantFiles: ["src/auth.ts", "../outside.ts"] },
        { title: "Add provider", dependsOn: ["step-1"] },
      ],
    }),
    "</NOVA_IMPLEMENTATION_PLAN>",
  ].join("\n"));

  assert.equal(parsed.plan.steps.length, 2);
  assert.deepEqual(parsed.plan.steps[0].dependsOn, []);
  assert.deepEqual(parsed.plan.steps[1].dependsOn, ["step-1"]);
  assert.deepEqual(parsed.plan.steps[0].relevantFiles, ["src/auth.ts"]);
  assert.doesNotMatch(parsed.message, /NOVA_IMPLEMENTATION_PLAN/);
});

test("implementation approval binds exact proposal, enforces order, and restores progress", async () => {
  const db = new FakeDb();
  const conversation = await getOrCreateNovaConversation(db, "student-a", "P000001");
  const plan = {
    id: "plan-test",
    objective: "Add a login component",
    existingFindings: [],
    risks: [],
    expectedOutcome: "A reviewed login component",
    currentStepId: "step-1",
    steps: [
      {
        id: "step-1",
        title: "Add login component",
        explanation: "",
        technicalObjective: "",
        relevantFiles: ["src/Login.tsx"],
        proposedChanges: [],
        dependsOn: [],
        acceptanceCriteria: ["Component renders"],
        validationMethod: "Run the workspace",
        status: "planned",
      },
      {
        id: "step-2",
        title: "Connect login API",
        explanation: "",
        technicalObjective: "",
        relevantFiles: ["src/api.ts"],
        proposedChanges: [],
        dependsOn: ["step-1"],
        acceptanceCriteria: ["Request is sent"],
        validationMethod: "Run focused tests",
        status: "planned",
      },
    ],
    updatedAt: new Date().toISOString(),
  };
  await saveNovaImplementationPlan(db, "student-a", "P000001", conversation.conversationId, plan);

  await assert.rejects(
    updateNovaImplementationStep(
      db, "student-a", "P000001", conversation.conversationId,
      "step-2", "awaiting_approval", "proposal-2", "export const api = true;"
    ),
    /reviewable proposal/
  );
  await updateNovaImplementationStep(
    db, "student-a", "P000001", conversation.conversationId,
    "step-1", "awaiting_approval", "proposal-1", "export function Login() {}"
  );
  await assert.rejects(
    updateNovaImplementationStep(
      db, "student-a", "P000001", conversation.conversationId,
      "step-1", "approved", "proposal-other"
    ),
    /no longer awaiting approval/
  );
  await updateNovaImplementationStep(
    db, "student-a", "P000001", conversation.conversationId,
    "step-1", "approved", "proposal-1"
  );
  await updateNovaImplementationStep(
    db, "student-a", "P000001", conversation.conversationId,
    "step-1", "executing", "proposal-1"
  );

  assert.equal(
    await matchesNovaImplementationProposal(
      db, "student-a", "P000001", conversation.conversationId,
      "step-1", "proposal-1", "export function Login() {}"
    ),
    true
  );
  assert.equal(
    await matchesNovaImplementationProposal(
      db, "student-a", "P000001", conversation.conversationId,
      "step-1", "proposal-1", "export function Login() { return null; }"
    ),
    false
  );
  await updateNovaImplementationStep(
    db, "student-a", "P000001", conversation.conversationId,
    "step-1", "validation_failed"
  );
  await updateNovaImplementationStep(
    db, "student-a", "P000001", conversation.conversationId,
    "step-1", "completed"
  );

  const restored = await getOrCreateNovaConversation(db, "student-a", "P000001");
  assert.equal(restored.implementationPlan.currentStepId, "step-2");
  assert.equal(restored.implementationPlan.steps[0].status, "completed");
  assert.equal(
    await matchesNovaImplementationProposal(
      db, "student-b", "P000001", conversation.conversationId,
      "step-1", "proposal-1", "export function Login() {}"
    ),
    false
  );
});
