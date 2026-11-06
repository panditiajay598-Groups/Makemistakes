import { createHash, randomUUID } from "node:crypto";
import type { Db } from "mongodb";

const LEARNING_RECORDS = "nova_learning_records";
const MAX_CONCEPTS = 60;
const MAX_CHECKS = 200;
const MAX_EXERCISES = 60;
const MAX_TEXT = 1_200;

export type UnderstandingOutcome =
  | "understood"
  | "partially_understood"
  | "needs_clarification";

export type ExerciseStatus = "assigned" | "in_progress" | "completed" | "skipped";

export type LearningConcept = {
  id: string;
  name: string;
  introducedAt: string;
  explanationCount: number;
  assessmentOutcomes: UnderstandingOutcome[];
  requiresRevision: boolean;
  exerciseCount: number;
  exerciseCompleted: number;
};

export type UnderstandingCheck = {
  id: string;
  conceptId: string;
  question: string;
  answer: string;
  outcome: UnderstandingOutcome;
  at: string;
};

export type LearningExercise = {
  id: string;
  conceptId: string;
  title: string;
  status: ExerciseStatus;
  proposalApproved: boolean;
  at: string;
};

export type LearningRecord = {
  userId: string;
  problemId: string;
  concepts: LearningConcept[];
  understandingChecks: UnderstandingCheck[];
  exercises: LearningExercise[];
  updatedAt: Date;
  createdAt: Date;
};

type LearningRecordDoc = LearningRecord & { _id: string };

export type EvaluationInput = {
  question: string;
  answer: string;
  conceptName: string;
  keywords: string[];
  evidenceTerms?: string[];
};

function projectKey(userId: string, problemId: string): string {
  return createHash("sha256").update(`${userId}\0${problemId}`).digest("hex");
}

function boundedText(value: unknown, limit = MAX_TEXT): string {
  if (typeof value !== "string") return "";
  return value
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "")
    .replace(/mongodb(?:\+srv)?:\/\/[^\s/@:]+(?::[^\s/@]*)?@[^\s/]+(?:\/[^\s]*)?/gi, "[REDACTED DATABASE URI]")
    .replace(/-----BEGIN [A-Z ]*PRIVATE KEY-----[\s\S]*?-----END [A-Z ]*PRIVATE KEY-----/g, "[REDACTED PRIVATE KEY]")
    .replace(/\bBearer\s+[A-Za-z0-9._~+/-]+=*/gi, "Bearer [REDACTED]")
    .replace(/((?:api[_-]?key|secret|password|passwd|token|access[_-]?token|client[_-]?secret)\s*[:=]\s*["']?)[^\s"',;}]+/gi, "$1[REDACTED]")
    .replace(/\b(?:sk-[A-Za-z0-9_-]{12,}|gh[pousr]_[A-Za-z0-9_]{20,})\b/g, "[REDACTED CREDENTIAL]")
    .trim()
    .slice(0, limit);
}

export function evaluateUnderstandingResponse(input: EvaluationInput): UnderstandingOutcome {
  const answer = boundedText(input.answer, 4_000);
  if (answer.length < 8) return "needs_clarification";

  const terms = [...new Set([
    input.conceptName,
    ...(Array.isArray(input.keywords) ? input.keywords : []),
    ...(Array.isArray(input.evidenceTerms) ? input.evidenceTerms : []),
  ])]
    .map((term) => String(term).toLowerCase())
    .filter((term) => term.length >= 3);

  const lower = answer.toLowerCase();
  const matched = terms.filter((term) => lower.includes(term)).length;
  const total = terms.length;

  if (total === 0) {
    return answer.split(/\s+/).length >= 12 ? "partially_understood" : "needs_clarification";
  }
  if (matched >= Math.max(1, Math.ceil(total / 2)) && matched >= 1) return "understood";
  if (matched >= 1) return "partially_understood";
  return answer.split(/\s+/).length >= 16 ? "partially_understood" : "needs_clarification";
}

export function evaluateConceptRequiresRevision(outcomes: UnderstandingOutcome[]): boolean {
  return outcomes.some((outcome) => outcome === "needs_clarification");
}

export async function getOrCreateLearningRecord(
  db: Db,
  userId: string,
  problemId: string
): Promise<LearningRecord> {
  const key = projectKey(userId, problemId);
  const collection = db.collection<LearningRecordDoc>(LEARNING_RECORDS);
  const existing = await collection.findOne({ _id: key });
  if (existing) {
    return {
      userId: existing.userId,
      problemId: existing.problemId,
      concepts: existing.concepts || [],
      understandingChecks: existing.understandingChecks || [],
      exercises: existing.exercises || [],
      updatedAt: existing.updatedAt,
      createdAt: existing.createdAt,
    };
  }
  const now = new Date();
  const created: LearningRecordDoc = {
    _id: key,
    userId,
    problemId,
    concepts: [],
    understandingChecks: [],
    exercises: [],
    updatedAt: now,
    createdAt: now,
  };
  try {
    await collection.insertOne(created);
  } catch (error) {
    const code = error && typeof error === "object" && "code" in error ? error.code : undefined;
    if (code !== 11000) throw error;
  }
  return {
    userId,
    problemId,
    concepts: [],
    understandingChecks: [],
    exercises: [],
    updatedAt: now,
    createdAt: now,
  };
}

async function saveLearningRecord(db: Db, userId: string, problemId: string, record: LearningRecord): Promise<void> {
  await db.collection<LearningRecordDoc>(LEARNING_RECORDS).updateOne(
    { _id: projectKey(userId, problemId), userId, problemId },
    { $set: { ...record, updatedAt: new Date() } }
  );
}

export async function recordConceptIntroduced(
  db: Db,
  userId: string,
  problemId: string,
  name: string
): Promise<{ record: LearningRecord; concept: LearningConcept }> {
  const record = await getOrCreateLearningRecord(db, userId, problemId);
  const safeName = boundedText(name, 200);
  if (!safeName) throw Object.assign(new Error("Concept name is required"), { status: 400 });

  let concept = record.concepts.find((item) => item.name.toLowerCase() === safeName.toLowerCase());
  if (!concept) {
    concept = {
      id: randomUUID(),
      name: safeName,
      introducedAt: new Date().toISOString(),
      explanationCount: 0,
      assessmentOutcomes: [],
      requiresRevision: false,
      exerciseCount: 0,
      exerciseCompleted: 0,
    };
    record.concepts = [...record.concepts, concept].slice(0, MAX_CONCEPTS);
  }
  await saveLearningRecord(db, userId, problemId, record);
  return { record, concept };
}

export async function recordExplanationCompleted(
  db: Db,
  userId: string,
  problemId: string,
  conceptId: string
): Promise<LearningRecord> {
  const record = await getOrCreateLearningRecord(db, userId, problemId);
  const concept = record.concepts.find((item) => item.id === conceptId);
  if (!concept) throw Object.assign(new Error("Concept not found"), { status: 404 });
  concept.explanationCount += 1;
  concept.requiresRevision = false;
  await saveLearningRecord(db, userId, problemId, record);
  return record;
}

export async function recordUnderstandingCheck(
  db: Db,
  userId: string,
  problemId: string,
  conceptId: string,
  question: string,
  answer: string,
  keywords: string[],
  evidenceTerms?: string[]
): Promise<{ record: LearningRecord; check: UnderstandingCheck }> {
  const record = await getOrCreateLearningRecord(db, userId, problemId);
  const concept = record.concepts.find((item) => item.id === conceptId);
  const outcome = evaluateUnderstandingResponse({
    question,
    answer,
    conceptName: concept?.name || "unknown concept",
    keywords,
    evidenceTerms,
  });
  const check: UnderstandingCheck = {
    id: randomUUID(),
    conceptId,
    question: boundedText(question, 600),
    answer: boundedText(answer, 1_200),
    outcome,
    at: new Date().toISOString(),
  };
  record.understandingChecks = [...record.understandingChecks, check].slice(-MAX_CHECKS);
  if (concept) {
    concept.assessmentOutcomes = [...concept.assessmentOutcomes, outcome].slice(-40);
    concept.requiresRevision = evaluateConceptRequiresRevision(concept.assessmentOutcomes);
  }
  await saveLearningRecord(db, userId, problemId, record);
  return { record, check };
}

export async function recordExercise(
  db: Db,
  userId: string,
  problemId: string,
  conceptId: string,
  title: string,
  status: ExerciseStatus,
  proposalApproved = false
): Promise<LearningRecord> {
  const record = await getOrCreateLearningRecord(db, userId, problemId);
  const concept = record.concepts.find((item) => item.id === conceptId);
  const safeTitle = boundedText(title, 300);
  if (!safeTitle) throw Object.assign(new Error("Exercise title is required"), { status: 400 });

  const exercise: LearningExercise = {
    id: randomUUID(),
    conceptId,
    title: safeTitle,
    status,
    proposalApproved: Boolean(proposalApproved),
    at: new Date().toISOString(),
  };
  record.exercises = [...record.exercises, exercise].slice(-MAX_EXERCISES);
  if (concept) {
    concept.exerciseCount += 1;
    if (status === "completed") concept.exerciseCompleted += 1;
  }
  await saveLearningRecord(db, userId, problemId, record);
  return record;
}

export function deriveLearningSummary(record: LearningRecord | null): string {
  if (!record) return "No learning record has been created for this project.";
  const concepts = (record.concepts || []).slice(0, 20).map((concept) => {
    const outcomes = concept.assessmentOutcomes || [];
    const lastOutcome = outcomes.length ? outcomes[outcomes.length - 1] : "not yet assessed";
    return `- ${concept.name}: explained ${concept.explanationCount}x, latest assessment ${lastOutcome}, exercises ${concept.exerciseCompleted}/${concept.exerciseCount} completed${concept.requiresRevision ? ", requires revision" : ""}`;
  });
  const totalOutcomes = (record.understandingChecks || []).length;
  return [
    `Learning record (authenticated student, this project): ${concepts.length} concept(s) introduced; ${totalOutcomes} understanding check(s) recorded.`,
    concepts.join("\n") || "No concepts have been introduced yet.",
    "Assessment outcomes are recorded from server-side evaluation only; they are not client-reported.",
  ].join("\n");
}
