import { createHash, randomUUID } from "node:crypto";
import type { Db, Document } from "mongodb";
import type {
  ImplementationStepStatus,
  NovaImplementationPlan,
} from "./implementationPlan";

const CONVERSATIONS = "nova_conversations";
const MESSAGES = "nova_conversation_messages";
const MAX_MESSAGE_CHARS = 8_000;
const MAX_MEMORY_NOTES = 24;
const MAX_MEMORY_CHARS = 8_000;
const MAX_RECENT_MESSAGES = 12;
const MAX_RECENT_CHARS = 12_000;

export type NovaConversationMessage = {
  role: "user" | "assistant";
  content: string;
  createdAt: Date;
  /** Client-supplied idempotency key. Retries reuse it so a user message is never stored twice. */
  clientMessageId?: string;
  /** Delivery outcome for assistant messages. Omitted/undefined means a successful answer. */
  deliveryStatus?: "ok" | "failed";
  error?: string;
  /** For assistant messages: the clientMessageId of the user message this response answers. Persisted so Retry survives a page refresh. */
  linkedClientMessageId?: string;
  /** Marked true when a later, successful retry supersedes this failed attempt. Kept as history but hidden from the active conversation. */
  superseded?: boolean;
};

type ConversationDocument = Document & {
  _id: string;
  userId: string;
  problemId: string;
  conversationId: string;
  technicalMemory: string[];
  messageCount: number;
  implementationPlan?: NovaImplementationPlan;
  /** clientMessageIds that have already claimed a credit deduction (idempotency). */
  creditedClientMessageIds?: string[];
  createdAt: Date;
  updatedAt: Date;
};

type MessageDocument = Document & {
  _id: string;
  userId: string;
  problemId: string;
  conversationId: string;
  role: NovaConversationMessage["role"];
  content: string;
  sequence: number;
  createdAt: Date;
  clientMessageId?: string;
  deliveryStatus?: "ok" | "failed";
  error?: string;
  linkedClientMessageId?: string;
  superseded?: boolean;
};

export type NovaConversation = {
  conversationId: string;
  technicalMemory: string;
  messages: NovaConversationMessage[];
  implementationPlan: NovaImplementationPlan | null;
};

function projectKey(userId: string, problemId: string): string {
  return createHash("sha256").update(`${userId}\0${problemId}`).digest("hex");
}

function redactSensitiveText(value: string): string {
  return value
    .replace(/mongodb(?:\+srv)?:\/\/[^\s/@:]+(?::[^\s/@]*)?@[^\s/]+(?:\/[^\s]*)?/gi, "[REDACTED DATABASE URI]")
    .replace(/-----BEGIN [A-Z ]*PRIVATE KEY-----[\s\S]*?-----END [A-Z ]*PRIVATE KEY-----/g, "[REDACTED PRIVATE KEY]")
    .replace(/\bBearer\s+[A-Za-z0-9._~+/-]+=*/gi, "Bearer [REDACTED]")
    .replace(/\b(?:sk-[A-Za-z0-9_-]{12,}|gh[pousr]_[A-Za-z0-9_]{20,}|xox[baprs]-[A-Za-z0-9-]{10,})\b/g, "[REDACTED CREDENTIAL]")
    .replace(/((?:api[_-]?key|secret|password|passwd|token|access[_-]?token|client[_-]?secret)\s*[:=]\s*["']?)[^\s"',;}]+/gi, "$1[REDACTED]");
}

export function sanitizeNovaMessage(content: string): string {
  return redactSensitiveText(content.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, ""))
    .trim()
    .slice(0, MAX_MESSAGE_CHARS);
}

function getMemoryNote(role: NovaConversationMessage["role"], content: string): string[] {
  const marker = /\b(decisions?|decide|decided|choosing|chosen|choice|select(?:ed|ion)|implement(?:ed|ation)?|existing|architecture|trade[- ]?off|constraint|must|will use|going to use|avoid|recommend|database|schema|endpoint|component|bug|root cause|fix(?:ed)?)\b/i;
  return content
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0 && marker.test(line))
    .slice(0, 8)
    .map((line) => `${role}: ${line.slice(0, 800)}`);
}

function formatMemory(notes: string[]): string {
  const selected: string[] = [];
  let total = 0;
  for (const note of [...notes].reverse()) {
    if (total + note.length > MAX_MEMORY_CHARS) continue;
    selected.push(note);
    total += note.length;
    if (selected.length >= MAX_MEMORY_NOTES) break;
  }
  return selected.reverse().join("\n");
}

function trimRecentMessages(messages: MessageDocument[]): NovaConversationMessage[] {
  const selected: NovaConversationMessage[] = [];
  let total = 0;
  const newestFirst = [...messages].sort((a, b) => b.sequence - a.sequence);
  for (const message of newestFirst) {
    if (selected.length >= MAX_RECENT_MESSAGES || total + message.content.length > MAX_RECENT_CHARS) break;
    selected.push({
      role: message.role,
      content: message.content,
      createdAt: message.createdAt,
      clientMessageId: message.clientMessageId,
      deliveryStatus: message.deliveryStatus,
      error: message.error,
      linkedClientMessageId: message.linkedClientMessageId,
      superseded: message.superseded,
    });
    total += message.content.length;
  }
  return selected.reverse();
}

export async function getOrCreateNovaConversation(
  db: Db,
  userId: string,
  problemId: string
): Promise<NovaConversation> {
  const key = projectKey(userId, problemId);
  const conversations = db.collection<ConversationDocument>(CONVERSATIONS);
  let conversation = await conversations.findOne({ _id: key, userId, problemId });

  if (!conversation) {
    const now = new Date();
    const created: ConversationDocument = {
      _id: key,
      userId,
      problemId,
      conversationId: randomUUID(),
      technicalMemory: [],
      messageCount: 0,
      createdAt: now,
      updatedAt: now,
    };
    try {
      await conversations.insertOne(created);
      conversation = created;
    } catch (error) {
      const code = error && typeof error === "object" && "code" in error ? error.code : undefined;
      if (code !== 11000) throw error;
      conversation = await conversations.findOne({ _id: key, userId, problemId });
      if (!conversation) throw error;
    }
  }

  const messages = await db.collection<MessageDocument>(MESSAGES)
    .find({ userId, problemId, conversationId: conversation.conversationId })
    .sort({ sequence: -1 })
    .limit(MAX_RECENT_MESSAGES * 4)
    .toArray();

  return {
    conversationId: conversation.conversationId,
    technicalMemory: formatMemory(conversation.technicalMemory || []),
    messages: trimRecentMessages(messages),
    implementationPlan: conversation.implementationPlan || null,
  };
}

export async function saveNovaImplementationPlan(
  db: Db,
  userId: string,
  problemId: string,
  conversationId: string,
  plan: NovaImplementationPlan
): Promise<void> {
  const result = await db.collection<ConversationDocument>(CONVERSATIONS).updateOne(
    { _id: projectKey(userId, problemId), userId, problemId, conversationId },
    { $set: { implementationPlan: plan, updatedAt: new Date() } }
  );
  if (!result.matchedCount) {
    throw Object.assign(new Error("Conversation not found"), { status: 404 });
  }
}

export async function updateNovaImplementationStep(
  db: Db,
  userId: string,
  problemId: string,
  conversationId: string,
  stepId: string,
  status: ImplementationStepStatus,
  proposalId?: string,
  proposalContent?: string
): Promise<NovaImplementationPlan> {
  const collection = db.collection<ConversationDocument>(CONVERSATIONS);
  const scope = { _id: projectKey(userId, problemId), userId, problemId, conversationId };
  const conversation = await collection.findOne(scope);
  const plan = conversation?.implementationPlan;
  if (!plan) throw Object.assign(new Error("No saved implementation plan exists"), { status: 404 });

  const step = plan.steps.find((item) => item.id === stepId);
  if (!step) throw Object.assign(new Error("Implementation step not found"), { status: 404 });

  if (status === "awaiting_approval") {
    if (
      plan.currentStepId !== stepId ||
      !proposalId ||
      typeof proposalContent !== "string" ||
      step.status === "executing" ||
      step.status === "completed"
    ) {
      throw Object.assign(new Error("A reviewable proposal is required"), { status: 409 });
    }
    step.proposalId = proposalId;
    step.proposalHash = createHash("sha256").update(proposalContent).digest("hex");
  } else if (status === "approved" || status === "rejected") {
    if (step.status !== "awaiting_approval" || !proposalId || step.proposalId !== proposalId) {
      throw Object.assign(new Error("This proposal is no longer awaiting approval"), { status: 409 });
    }
  } else if (status === "executing") {
    if (step.status !== "approved" || !proposalId || step.proposalId !== proposalId) {
      throw Object.assign(new Error("Only an approved proposal can execute"), { status: 409 });
    }
  } else if (status === "validation_failed") {
    if (!["executing", "approved", "validation_failed"].includes(step.status)) {
      throw Object.assign(new Error("The implementation step has not been executed"), { status: 409 });
    }
  } else if (status === "completed") {
    if (!["executing", "approved", "validation_failed"].includes(step.status)) {
      throw Object.assign(new Error("The implementation step has not been executed"), { status: 409 });
    }
  }

  const dependenciesComplete = step.dependsOn.every((dependencyId) =>
    plan.steps.some((dependency) => dependency.id === dependencyId && dependency.status === "completed")
  );
  if (status === "approved" && !dependenciesComplete) {
    throw Object.assign(new Error("Complete the prerequisite steps before approval"), { status: 409 });
  }

  step.status = status;
  const nextStep = status === "completed"
    ? plan.steps.find((candidate) =>
        candidate.status !== "completed" &&
        candidate.id !== stepId &&
        candidate.dependsOn.every((dependencyId) =>
          plan.steps.some((dependency) => dependency.id === dependencyId && dependency.status === "completed")
        )
      )
    : undefined;
  plan.currentStepId = nextStep?.id || stepId;
  plan.updatedAt = new Date().toISOString();
  const result = await collection.updateOne(scope, {
    $set: { implementationPlan: plan, updatedAt: new Date() },
  });
  if (!result.matchedCount) {
    throw Object.assign(new Error("Conversation not found"), { status: 404 });
  }
  return plan;
}

export async function matchesNovaImplementationProposal(
  db: Db,
  userId: string,
  problemId: string,
  conversationId: string,
  stepId: string,
  proposalId: string,
  content: string
): Promise<boolean> {
  const conversation = await db.collection<ConversationDocument>(CONVERSATIONS).findOne({
    _id: projectKey(userId, problemId),
    userId,
    problemId,
    conversationId,
  });
  const step = conversation?.implementationPlan?.steps.find((item) => item.id === stepId);
  if (!step || step.status !== "executing" || step.proposalId !== proposalId || !step.proposalHash) {
    return false;
  }
  return createHash("sha256").update(content).digest("hex") === step.proposalHash;
}

export async function hasNovaImplementationPlan(
  db: Db,
  userId: string,
  problemId: string
): Promise<boolean> {
  const conversation = await db.collection<ConversationDocument>(CONVERSATIONS).findOne({
    _id: projectKey(userId, problemId),
    userId,
    problemId,
  });
  return Boolean(conversation?.implementationPlan);
}

export async function findNovaConversation(
  db: Db,
  userId: string,
  problemId: string,
  conversationId: string
): Promise<boolean> {
  const conversation = await db.collection<ConversationDocument>(CONVERSATIONS).findOne({
    _id: projectKey(userId, problemId),
    userId,
    problemId,
    conversationId,
  });
  return Boolean(conversation);
}

export async function claimNovaCreditRequest(
  db: Db,
  userId: string,
  problemId: string,
  conversationId: string,
  clientMessageId: string
): Promise<boolean> {
  // No idempotency key: always bill (can't dedup a keyed request).
  if (!clientMessageId) return true;
  // Atomic single-document claim. Only the request whose $addToSet actually
  // ADDS the clientMessageId (modifiedCount 1) wins the right to deduct. Any
  // concurrent duplicate / retry sees the id already present (modifiedCount 0)
  // and is never billed twice. No read-then-charge race remains.
  const result = await db.collection<ConversationDocument>(CONVERSATIONS).updateOne(
    { _id: projectKey(userId, problemId), userId, problemId, conversationId },
    { $addToSet: { creditedClientMessageIds: clientMessageId } }
  );
  if (!result.matchedCount) throw Object.assign(new Error("Conversation not found"), { status: 404 });
  return result.modifiedCount === 1;
}

/**
 * Releases a previously-claimed credit request id (atomic $pull). Used as
 * compensation when a claim is taken but billing does not successfully
 * complete (insufficient credits, infrastructure failure), so that a later
 * retry with the same clientMessageId can re-claim and re-bill. A missing id
 * is a no-op (modifiedCount 0).
 */
export async function releaseNovaCreditRequest(
  db: Db,
  userId: string,
  problemId: string,
  conversationId: string,
  clientMessageId: string
): Promise<void> {
  if (!clientMessageId) return;
  await db.collection<ConversationDocument>(CONVERSATIONS).updateOne(
    { _id: projectKey(userId, problemId), userId, problemId, conversationId },
    { $pull: { creditedClientMessageIds: clientMessageId } }
  );
}

export async function hasNovaUserMessage(
  db: Db,
  userId: string,
  problemId: string,
  conversationId: string,
  clientMessageId: string
): Promise<boolean> {
  if (!clientMessageId) return false;
  const existing = await db.collection<MessageDocument>(MESSAGES).findOne({
    userId,
    problemId,
    conversationId,
    role: "user",
    clientMessageId,
  });
  return Boolean(existing);
}

export type AppendNovaMessageOptions = {
  clientMessageId?: string;
  deliveryStatus?: "ok" | "failed";
  error?: string;
  linkedClientMessageId?: string;
  superseded?: boolean;
};

export async function appendNovaConversationMessage(
  db: Db,
  userId: string,
  problemId: string,
  conversationId: string,
  role: NovaConversationMessage["role"],
  content: string,
  options: AppendNovaMessageOptions = {}
): Promise<void> {
  const key = projectKey(userId, problemId);
  const conversations = db.collection<ConversationDocument>(CONVERSATIONS);
  const scope = { _id: key, userId, problemId, conversationId };
  const safeContent = sanitizeNovaMessage(content);
  if (!safeContent && role === "user") {
    throw Object.assign(new Error("Message content is required"), { status: 400 });
  }

  // Idempotency: retries reuse the same clientMessageId, so never store the
  // same user message twice. This prevents duplicate user messages on retry.
  if (role === "user" && options.clientMessageId) {
    const existing = await db.collection<MessageDocument>(MESSAGES).findOne({
      userId,
      problemId,
      conversationId,
      role: "user",
      clientMessageId: options.clientMessageId,
    });
    if (existing) return;
  }

  const now = new Date();
  const updatedConversation = await conversations.findOneAndUpdate(
    scope,
    { $inc: { messageCount: 1 }, $set: { updatedAt: now } },
    { returnDocument: "after" }
  );
  if (!updatedConversation) throw Object.assign(new Error("Conversation not found"), { status: 404 });

  await db.collection<MessageDocument>(MESSAGES).insertOne({
    _id: randomUUID(),
    userId,
    problemId,
    conversationId,
    role,
    content: safeContent,
    sequence: updatedConversation.messageCount,
    createdAt: now,
    clientMessageId: options.clientMessageId,
    deliveryStatus: options.deliveryStatus,
    error: options.error,
    linkedClientMessageId: options.linkedClientMessageId,
    superseded: options.superseded,
  });

  const notes = getMemoryNote(role, safeContent);
  if (notes.length) {
    await conversations.updateOne(scope, [
      {
        $set: {
          technicalMemory: {
            $slice: [
              {
                $concatArrays: [
                  { $ifNull: ["$technicalMemory", []] },
                  { $literal: notes },
                ],
              },
              -MAX_MEMORY_NOTES,
            ],
          },
        },
      },
    ]);
  }
}

export async function supersedeFailedNovaAttempts(
  db: Db,
  userId: string,
  problemId: string,
  conversationId: string,
  clientMessageId: string
): Promise<void> {
  await db.collection<MessageDocument>(MESSAGES).updateMany(
    {
      userId,
      problemId,
      conversationId,
      role: "assistant",
      deliveryStatus: "failed",
      linkedClientMessageId: clientMessageId,
    },
    { $set: { superseded: true } }
  );
}
