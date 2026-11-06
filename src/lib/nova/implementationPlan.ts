import { randomUUID } from "node:crypto";

export type ImplementationStepStatus =
  | "planned"
  | "ready_for_review"
  | "awaiting_approval"
  | "approved"
  | "executing"
  | "completed"
  | "validation_failed"
  | "blocked"
  | "rejected";

export type NovaImplementationStep = {
  id: string;
  title: string;
  explanation: string;
  technicalObjective: string;
  relevantFiles: string[];
  proposedChanges: string[];
  dependsOn: string[];
  acceptanceCriteria: string[];
  validationMethod: string;
  status: ImplementationStepStatus;
  proposalId?: string;
  proposalHash?: string;
};

export type NovaImplementationPlan = {
  id: string;
  objective: string;
  existingFindings: string[];
  risks: string[];
  expectedOutcome: string;
  currentStepId: string;
  steps: NovaImplementationStep[];
  updatedAt: string;
};

const PLAN_BLOCK = /<NOVA_IMPLEMENTATION_PLAN>\s*([\s\S]*?)\s*<\/NOVA_IMPLEMENTATION_PLAN>/i;
const SAFE_RELATIVE_PATH = /^(?!\/)(?!.*(?:^|\/)\.\.?\/)[A-Za-z0-9._@+-]+(?:\/[A-Za-z0-9._@+-]+)*$/;

function boundedText(value: unknown, limit: number): string {
  if (typeof value !== "string") return "";
  return value
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "")
    .replace(/mongodb(?:\+srv)?:\/\/\S+/gi, "[REDACTED DATABASE URI]")
    .replace(/\b(?:sk-[A-Za-z0-9_-]{12,}|gh[pousr]_[A-Za-z0-9_]{20,})\b/g, "[REDACTED CREDENTIAL]")
    .trim()
    .slice(0, limit);
}

function boundedList(value: unknown, limit: number, itemLimit: number): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .slice(0, limit)
    .map((item) => boundedText(item, itemLimit))
    .filter(Boolean);
}

function safeFiles(value: unknown): string[] {
  return boundedList(value, 12, 240).filter((filePath) =>
    SAFE_RELATIVE_PATH.test(filePath) &&
    !/(^|\/)(?:\.env(?:[._-]|$)|secrets?(?:[._/-]|$)|credentials?(?:[._/-]|$))/i.test(filePath)
  );
}

export function parseNovaImplementationPlan(response: string): {
  message: string;
  plan: NovaImplementationPlan | null;
} {
  const match = PLAN_BLOCK.exec(response);
  if (!match) return { message: response, plan: null };

  let value: unknown;
  try {
    value = JSON.parse(match[1]);
  } catch {
    return {
      message: response.replace(PLAN_BLOCK, "[Nova's structured plan could not be parsed.]").trim(),
      plan: null,
    };
  }
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return { message: response.replace(PLAN_BLOCK, "").trim(), plan: null };
  }

  const candidate = value as Record<string, unknown>;
  const rawSteps = Array.isArray(candidate.steps) ? candidate.steps.slice(0, 10) : [];
  const steps: NovaImplementationStep[] = rawSteps.flatMap((rawStep, index) => {
    if (!rawStep || typeof rawStep !== "object" || Array.isArray(rawStep)) return [];
    const step = rawStep as Record<string, unknown>;
    const title = boundedText(step.title, 160);
    if (!title) return [];
    return [{
      id: `step-${index + 1}`,
      title,
      explanation: boundedText(step.explanation, 700),
      technicalObjective: boundedText(step.technicalObjective, 500),
      relevantFiles: safeFiles(step.relevantFiles),
      proposedChanges: boundedList(step.proposedChanges, 8, 320),
      dependsOn: boundedList(step.dependsOn, 10, 40),
      acceptanceCriteria: boundedList(step.acceptanceCriteria, 8, 240),
      validationMethod: boundedText(step.validationMethod, 400),
      status: "planned",
    }];
  });
  const stepIds = new Set(steps.map((step) => step.id));
  for (const [index, step] of steps.entries()) {
    step.dependsOn = step.dependsOn.filter((dependency) => {
      const dependencyIndex = Number(dependency.replace(/^step-/, "")) - 1;
      return stepIds.has(dependency) && dependencyIndex >= 0 && dependencyIndex < index;
    });
  }

  if (!steps.length) {
    return { message: response.replace(PLAN_BLOCK, "").trim(), plan: null };
  }

  const now = new Date().toISOString();
  const plan: NovaImplementationPlan = {
    id: randomUUID(),
    objective: boundedText(candidate.objective, 500) || "Feature implementation plan",
    existingFindings: boundedList(candidate.existingFindings, 12, 300),
    risks: boundedList(candidate.risks, 8, 300),
    expectedOutcome: boundedText(candidate.expectedOutcome, 500),
    currentStepId: steps[0].id,
    steps,
    updatedAt: now,
  };
  return { message: response.replace(PLAN_BLOCK, "").trim(), plan };
}

export function getNextImplementationStep(plan: NovaImplementationPlan): NovaImplementationStep | null {
  const current = plan.steps.find((step) => step.id === plan.currentStepId);
  if (current && current.status !== "completed" && current.status !== "blocked") return current;
  return plan.steps.find((step) =>
    step.status !== "completed" &&
    step.dependsOn.every((dependencyId) =>
      plan.steps.some((dependency) => dependency.id === dependencyId && dependency.status === "completed")
    )
  ) || null;
}

export function createProposalId(planId: string, stepId: string, filePath: string, code: string): string {
  const normalized = `${planId}\0${stepId}\0${filePath}\0${code}`;
  let hash = 2166136261;
  for (let index = 0; index < normalized.length; index++) {
    hash ^= normalized.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return `proposal-${(hash >>> 0).toString(16)}`;
}
