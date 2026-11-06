import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { getAuthenticatedIdentity } from "@/lib/security/sessionIdentity";
import { requireOwnedWorkspace } from "@/lib/security/workspaceOwnership";
import { updateNovaImplementationStep } from "@/lib/nova/conversations";
import type { ImplementationStepStatus } from "@/lib/nova/implementationPlan";

export const runtime = "nodejs";

const STATUSES = new Set<ImplementationStepStatus>([
  "awaiting_approval",
  "approved",
  "executing",
  "completed",
  "validation_failed",
  "blocked",
  "rejected",
]);

function responseError(error: unknown) {
  const status = error && typeof error === "object" && "status" in error && typeof error.status === "number"
    ? error.status
    : 500;
  return NextResponse.json(
    { ok: false, error: status === 404 ? "Workspace or implementation plan not found" : status < 500 ? (error instanceof Error ? error.message : "Invalid implementation update") : "Could not update implementation progress" },
    { status }
  );
}

export async function POST(req: Request) {
  try {
    const identity = await getAuthenticatedIdentity(req);
    if (!identity) return NextResponse.json({ ok: false, error: "Authentication required" }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const problemId = typeof body.problemId === "string" ? body.problemId.trim().slice(0, 120) : "";
    const conversationId = typeof body.conversationId === "string" ? body.conversationId.trim().slice(0, 80) : "";
    const stepId = typeof body.stepId === "string" ? body.stepId.trim().slice(0, 40) : "";
    const proposalId = typeof body.proposalId === "string" ? body.proposalId.trim().slice(0, 120) : undefined;
    const proposalContent = typeof body.proposalContent === "string" ? body.proposalContent.slice(0, 50_000) : undefined;
    const status = typeof body.status === "string" ? body.status as ImplementationStepStatus : undefined;

    if (!problemId || !conversationId || !stepId || !status || !STATUSES.has(status)) {
      return NextResponse.json({ ok: false, error: "A valid project, conversation, step, and status are required." }, { status: 400 });
    }

    const { userId } = await requireOwnedWorkspace(identity, problemId);
    const plan = await updateNovaImplementationStep(
      await getDb(),
      userId,
      problemId,
      conversationId,
      stepId,
      status,
      proposalId,
      proposalContent
    );
    return NextResponse.json(
      { ok: true, implementationPlan: plan },
      { headers: { "Cache-Control": "private, no-store" } }
    );
  } catch (error) {
    return responseError(error);
  }
}
