"use client";

import { Check, Copy, Loader2, RotateCcw, X } from "lucide-react";
import { useState } from "react";
import { highlightCode } from "@/components/journey/buildos/NovaConversation";
import type { NovaImplementationPlan } from "@/lib/nova/implementationPlan";

export type NovaMode = "PLAN" | "BUILD" | "UNDERSTAND" | "DEBUG" | "VERIFY";
export type ProposalStatus = "pending" | "applied" | "rejected";

const IMPLEMENTATION_STATUS_LABELS: Record<string, string> = {
  planned: "Planned",
  ready_for_review: "Ready for review",
  awaiting_approval: "Awaiting approval",
  approved: "Approved",
  executing: "Executing",
  completed: "Completed",
  validation_failed: "Validation failed",
  blocked: "Blocked",
  rejected: "Rejected",
};

export function NovaImplementationPlanCard({
  plan,
}: {
  plan: NovaImplementationPlan;
}) {
  return (
    <section className="overflow-hidden rounded-md border border-emerald-900/70 bg-[#0E1510]" aria-label="Feature implementation plan">
      <header className="border-b border-emerald-950/80 px-3 py-2">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-emerald-300">Feature implementation plan</p>
        <p className="mt-1 text-[12px] font-medium text-zinc-100">{plan.objective}</p>
        {plan.expectedOutcome && <p className="mt-1 text-[11px] text-zinc-400">Expected: {plan.expectedOutcome}</p>}
      </header>
      {(plan.existingFindings.length > 0 || plan.risks.length > 0) && (
        <div className="grid gap-2 border-b border-[#252D27] px-3 py-2 text-[10px] text-zinc-400 sm:grid-cols-2">
          {plan.existingFindings.length > 0 && (
            <div>
              <p className="font-semibold text-zinc-300">Existing implementation</p>
              <ul className="mt-1 list-disc space-y-0.5 pl-4">{plan.existingFindings.map((item, index) => <li key={`${index}-${item}`}>{item}</li>)}</ul>
            </div>
          )}
          {plan.risks.length > 0 && (
            <div>
              <p className="font-semibold text-zinc-300">Risks</p>
              <ul className="mt-1 list-disc space-y-0.5 pl-4">{plan.risks.map((item, index) => <li key={`${index}-${item}`}>{item}</li>)}</ul>
            </div>
          )}
        </div>
      )}
      <ol className="divide-y divide-[#252D27]">
        {plan.steps.map((step, index) => (
          <li key={step.id} className={`px-3 py-2.5 ${plan.currentStepId === step.id ? "bg-[#142019]" : ""}`}>
            <div className="flex items-start justify-between gap-2">
              <p className="text-[11px] font-semibold text-zinc-100">{index + 1}. {step.title}</p>
              <span className="shrink-0 rounded bg-[#222820] px-1.5 py-0.5 text-[9px] font-medium text-emerald-200">
                {IMPLEMENTATION_STATUS_LABELS[step.status] || "Planned"}
              </span>
            </div>
            {step.explanation && <p className="mt-1 text-[10px] leading-relaxed text-zinc-400">{step.explanation}</p>}
            {step.technicalObjective && <p className="mt-1 text-[10px] text-zinc-300"><span className="font-semibold">Objective:</span> {step.technicalObjective}</p>}
            {step.relevantFiles.length > 0 && (
              <div className="mt-1 flex flex-wrap gap-1">
                {step.relevantFiles.map((file) => <code key={file} className="rounded bg-black/30 px-1.5 py-0.5 font-mono text-[9px] text-emerald-200">{file}</code>)}
              </div>
            )}
            {step.acceptanceCriteria.length > 0 && (
              <ul className="mt-1 list-disc space-y-0.5 pl-4 text-[10px] text-zinc-400">
                {step.acceptanceCriteria.map((criterion, criterionIndex) => <li key={`${step.id}-${criterionIndex}`}>{criterion}</li>)}
              </ul>
            )}
            {step.validationMethod && <p className="mt-1 text-[10px] text-zinc-500">Verify: {step.validationMethod}</p>}
          </li>
        ))}
      </ol>
    </section>
  );
}

type DiffLine = {
  kind: "context" | "added" | "removed";
  text: string;
};

const MODES: Array<{ id: NovaMode; label: string; description: string }> = [
  { id: "PLAN", label: "Plan", description: "Break down a feature into steps, files, and acceptance criteria." },
  { id: "BUILD", label: "Build", description: "Create a small code proposal for you to review before applying." },
  { id: "UNDERSTAND", label: "Understand", description: "Explain the code and concepts in the context of this project." },
  { id: "DEBUG", label: "Debug", description: "Analyze the error and distinguish evidence from possible causes." },
];

export function NovaModeSelector({
  value,
  onChange,
  disabled,
}: {
  value: NovaMode;
  onChange: (mode: NovaMode) => void;
  disabled?: boolean;
}) {
  const activeMode = MODES.find((mode) => mode.id === value) || MODES[2];

  return (
    <div className="border-b border-[#252D27] bg-[#101310]">
      <div className="grid grid-cols-4 gap-1 px-2 pt-2" role="group" aria-label="Nova mode">
        {MODES.map((mode) => (
          <button
            key={mode.id}
            type="button"
            aria-pressed={value === mode.id}
            disabled={disabled}
            onClick={() => onChange(mode.id)}
            className={`rounded px-1 py-1.5 text-[10px] font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
              value === mode.id
                ? "bg-[#1B241D] text-[#86EFAC] ring-1 ring-inset ring-[#31543A]"
                : "text-[#9CA3AF] hover:bg-[#191E1A] hover:text-[#F3F4F6]"
            }`}
          >
            {mode.label}
          </button>
        ))}
      </div>
      <p className="px-3 py-2 text-[10px] leading-relaxed text-[#9CA3AF]">{activeMode.description}</p>
    </div>
  );
}

export function CodeProposal({
  filePath,
  code,
  baseContent,
  status,
  baseError,
  applying,
  onApply,
  onReject,
  onRequestRevision,
}: {
  filePath: string;
  code: string;
  baseContent: string | null | undefined;
  status: ProposalStatus;
  baseError?: string;
  applying: boolean;
  onApply: () => void;
  onReject: () => void;
  onRequestRevision: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const nextLines = code.replace(/\r\n/g, "\n").split("\n");
  const oldLines = (baseContent ?? "").replace(/\r\n/g, "\n").split("\n");
  const comparisonAvailable = baseContent !== undefined && !baseError;
  const diff = comparisonAvailable
    ? buildDiff(oldLines, nextLines, baseContent !== null)
    : nextLines.map((text) => ({ kind: "context" as const, text }));
  const added = diff.filter((line) => line.kind === "added").length;
  const removed = diff.filter((line) => line.kind === "removed").length;

  const copyProposal = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch (error) {
      console.error("[Nova] Could not copy proposed code.", error);
    }
  };

  return (
    <section className="overflow-hidden rounded-md border border-[#31543A] bg-[#101310]" aria-label={`Code proposal for ${filePath}`}>
      <header className="flex items-center justify-between gap-2 border-b border-[#252D27] px-3 py-2">
        <div className="min-w-0">
          <p className="truncate font-mono text-[11px] font-semibold text-[#D1D5DB]">{filePath}</p>
          <p className="mt-1 text-[10px] text-[#9CA3AF]">
            {baseError ? "Comparison unavailable" : baseContent === undefined ? "Loading current file…" : baseContent === null ? "New file" : "Change proposal"}
            {comparisonAvailable && (
              <span className="ml-2">
                <span className="text-[#86EFAC]">+{added}</span>
                <span className="ml-1 text-[#FCA5A5]">−{removed}</span>
              </span>
            )}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-1.5">
          <button
            type="button"
            onClick={() => void copyProposal()}
            className="inline-flex items-center gap-1 rounded px-1.5 py-1 text-[10px] text-[#9CA3AF] hover:bg-[#1B211D] hover:text-[#F3F4F6]"
            aria-label={copied ? `Copied ${filePath}` : `Copy ${filePath}`}
          >
            {copied ? <Check className="h-3 w-3 text-[#86EFAC]" /> : <Copy className="h-3 w-3" />}
            {copied ? "Copied" : "Copy"}
          </button>
          <span className={`rounded px-1.5 py-1 text-[9px] font-semibold uppercase tracking-wide ${
            status === "applied"
              ? "bg-[#17351F] text-[#86EFAC]"
              : status === "rejected"
              ? "bg-[#2A1B1B] text-[#FCA5A5]"
              : "bg-[#222820] text-[#D1D5DB]"
          }`}>
            {status === "applied" ? "Applied" : status === "rejected" ? "Rejected" : "Awaiting review"}
          </span>
        </div>
      </header>

      <div className="max-h-64 overflow-auto bg-[#090B0A] py-1 font-mono text-[10px] leading-5">
        {baseContent === undefined && !baseError ? (
          <div className="flex items-center gap-2 px-3 py-4 text-[#9CA3AF]">
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            Loading current file for comparison…
          </div>
        ) : baseError ? (
          <div className="p-3 text-[10px] text-amber-200">
            {baseError}
            <pre className="mt-2 whitespace-pre-wrap text-[#D1D5DB]">{code}</pre>
          </div>
        ) : diff.map((line, index) => (
          <div
            key={`${index}-${line.kind}`}
            className={`flex min-h-5 whitespace-pre ${
              line.kind === "added"
                ? "bg-[#142319] text-[#BBF7D0]"
                : line.kind === "removed"
                ? "bg-[#2A1B1B] text-[#FECACA]"
                : "text-[#9CA3AF]"
            }`}
          >
            <span className="w-7 shrink-0 select-none pr-2 text-right opacity-70">
              {line.kind === "added" ? "+" : line.kind === "removed" ? "−" : " "}
            </span>
            <span className="min-w-0 pr-3">{highlightCode(line.text || " ")}</span>
          </div>
        ))}
      </div>

      <footer className="flex flex-wrap items-center gap-2 border-t border-[#252D27] p-2">
        {status === "applied" ? (
          <div className="flex items-center gap-1.5 px-2 py-1 text-[11px] font-medium text-[#86EFAC]">
            <Check className="h-3.5 w-3.5" />
            Applied to the workspace
          </div>
        ) : status === "rejected" ? (
          <div className="flex items-center gap-1.5 px-2 py-1 text-[11px] font-medium text-[#FCA5A5]">
            <X className="h-3.5 w-3.5" />
            Rejected — workspace unchanged
          </div>
        ) : (
          <>
            <button
              type="button"
              onClick={onApply}
              disabled={applying || baseContent === undefined || Boolean(baseError)}
              className="inline-flex items-center gap-1.5 rounded bg-[#22C55E] px-2.5 py-1.5 text-[11px] font-semibold text-[#071109] transition-colors hover:bg-[#16A34A] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {applying ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
              {applying ? "Applying…" : "Apply changes"}
            </button>
            <button
              type="button"
              onClick={onReject}
              disabled={applying}
              className="inline-flex items-center gap-1.5 rounded border border-[#39423B] px-2.5 py-1.5 text-[11px] text-[#D1D5DB] hover:bg-[#1B211D] disabled:opacity-50"
            >
              <X className="h-3.5 w-3.5" />
              Reject
            </button>
            <button
              type="button"
              onClick={onRequestRevision}
              disabled={applying}
              className="inline-flex items-center gap-1.5 rounded px-2 py-1.5 text-[11px] text-[#9CA3AF] hover:bg-[#1B211D] hover:text-[#F3F4F6] disabled:opacity-50"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Request revision
            </button>
          </>
        )}
      </footer>
    </section>
  );
}

function buildDiff(oldLines: string[], nextLines: string[], hasBase: boolean): DiffLine[] {
  if (!hasBase) return nextLines.map((text) => ({ kind: "added", text }));

  const n = oldLines.length;
  const m = nextLines.length;
  if (n * m > 120_000) {
    return [
      ...oldLines.map((text) => ({ kind: "removed" as const, text })),
      ...nextLines.map((text) => ({ kind: "added" as const, text })),
    ];
  }

  const table = Array.from({ length: n + 1 }, () => new Uint32Array(m + 1));
  for (let i = n - 1; i >= 0; i--) {
    for (let j = m - 1; j >= 0; j--) {
      table[i][j] = oldLines[i] === nextLines[j]
        ? table[i + 1][j + 1] + 1
        : Math.max(table[i + 1][j], table[i][j + 1]);
    }
  }

  const result: DiffLine[] = [];
  let i = 0;
  let j = 0;
  while (i < n && j < m) {
    if (oldLines[i] === nextLines[j]) {
      result.push({ kind: "context", text: oldLines[i++] });
      j++;
    } else if (table[i + 1][j] >= table[i][j + 1]) {
      result.push({ kind: "removed", text: oldLines[i++] });
    } else {
      result.push({ kind: "added", text: nextLines[j++] });
    }
  }
  while (i < n) result.push({ kind: "removed", text: oldLines[i++] });
  while (j < m) result.push({ kind: "added", text: nextLines[j++] });
  return result;
}
