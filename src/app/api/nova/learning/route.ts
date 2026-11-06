import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { getAuthenticatedIdentity } from "@/lib/security/sessionIdentity";
import { requireOwnedWorkspace } from "@/lib/security/workspaceOwnership";
import {
  deriveLearningSummary,
  getOrCreateLearningRecord,
  recordConceptIntroduced,
  recordExercise,
  recordExplanationCompleted,
  recordUnderstandingCheck,
  type ExerciseStatus,
} from "@/lib/nova/learning";

export const runtime = "nodejs";

function message(error: string, status = 400) {
  return NextResponse.json({ ok: false, error }, { status });
}

function clean(value: unknown, limit = 600): string {
  return typeof value === "string"
    ? value.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "").trim().slice(0, limit)
    : "";
}

function cleanList(value: unknown, limit = 8, itemLimit = 120): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => clean(item, itemLimit))
    .filter(Boolean)
    .slice(0, limit);
}

const EXERCISE_STATUSES = new Set<ExerciseStatus>([
  "assigned",
  "in_progress",
  "completed",
  "skipped",
]);

export async function GET(req: Request) {
  try {
    const identity = await getAuthenticatedIdentity(req);
    if (!identity) return message("Authentication required", 401);

    const problemId = clean(new URL(req.url).searchParams.get("problemId"), 120);
    if (!problemId) return message("problemId is required");

    const { userId } = await requireOwnedWorkspace(identity, problemId);
    const record = await getOrCreateLearningRecord(await getDb(), userId, problemId);

    return NextResponse.json(
      {
        ok: true,
        concepts: record.concepts,
        understandingChecks: record.understandingChecks,
        exercises: record.exercises,
        summary: deriveLearningSummary(record),
      },
      { headers: { "Cache-Control": "private, no-store" } }
    );
  } catch (error) {
    const status = typeof error === "object" && error !== null && "status" in error && typeof error.status === "number"
      ? error.status
      : 500;
    if (status >= 500) console.error("[Nova learning] Failed to load the learning record.", error);
    return message(status === 404 ? "Workspace not found" : "Could not load the learning record", status);
  }
}

export async function POST(req: Request) {
  try {
    const identity = await getAuthenticatedIdentity(req);
    if (!identity) return message("Authentication required", 401);

    const body = await req.json().catch(() => ({}));
    const problemId = clean(body.problemId, 120);
    const action = clean(body.action, 60);
    if (!problemId) return message("problemId is required");

    const { userId } = await requireOwnedWorkspace(identity, problemId);
    const db = await getDb();

    if (action === "concept_introduced") {
      const name = clean(body.name, 200);
      if (!name) return message("Concept name is required");
      const concept = await recordConceptIntroduced(db, userId, problemId, name);
      return NextResponse.json({ ok: true, concept: concept.concept });
    }

    if (action === "explanation_completed") {
      const conceptId = clean(body.conceptId, 80);
      if (!conceptId) return message("conceptId is required");
      const record = await recordExplanationCompleted(db, userId, problemId, conceptId);
      return NextResponse.json({ ok: true, record });
    }

    if (action === "understanding_check") {
      const conceptId = clean(body.conceptId, 80);
      const question = clean(body.question, 600);
      const answer = clean(body.answer, 1_200);
      const keywords = cleanList(body.keywords);
      const evidenceTerms = cleanList(body.evidenceTerms);
      if (!conceptId || !question || !answer) return message("conceptId, question, and answer are required");
      const { record, check } = await recordUnderstandingCheck(
        db, userId, problemId, conceptId, question, answer, keywords, evidenceTerms
      );
      return NextResponse.json({ ok: true, outcome: check.outcome, check, record });
    }

    if (action === "exercise") {
      const conceptId = clean(body.conceptId, 80);
      const title = clean(body.title, 300);
      const rawStatus = clean(body.status, 30) as ExerciseStatus;
      if (!conceptId || !title) return message("conceptId and title are required");
      if (!EXERCISE_STATUSES.has(rawStatus)) return message("A valid exercise status is required");
      const proposalApproved = Boolean(body.proposalApproved);
      const record = await recordExercise(db, userId, problemId, conceptId, title, rawStatus, proposalApproved);
      return NextResponse.json({ ok: true, record });
    }

    return message("Unsupported learning action");
  } catch (error) {
    const status = typeof error === "object" && error !== null && "status" in error && typeof error.status === "number"
      ? error.status
      : 500;
    if (status >= 500) console.error("[Nova learning] Failed to record learning activity.", error);
    return message(status === 404 ? "Workspace not found" : "Could not record learning activity", status);
  }
}
