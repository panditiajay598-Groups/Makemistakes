import React from "react";
import { History, ShieldCheck, Play, XCircle, Award, ArrowUpRight, Clock, AlertTriangle } from "lucide-react";
import { Attempt, ProofOfWorkRecord } from "@/lib/attemptsStore";

interface PreviousAttemptsListProps {
  attempts: Attempt[];
  onViewProofOfWork: (pow: ProofOfWorkRecord) => void;
  onResumeAttempt: (attempt: Attempt) => void;
  onAbandonAttempt: (attempt: Attempt) => void;
  onPracticeAgain?: () => void;
  isMissionLocked?: boolean;
  lockedByTitle?: string;
}

export default function PreviousAttemptsList({
  attempts,
  onViewProofOfWork,
  onResumeAttempt,
  onAbandonAttempt,
  onPracticeAgain,
  isMissionLocked,
  lockedByTitle,
}: PreviousAttemptsListProps) {
  if (!attempts || attempts.length === 0) {
    return (
      <section className="rounded-3xl border border-[#232323] bg-[#111111] p-6 space-y-4">
        <div className="flex items-center gap-2 border-b border-[#232323] pb-3">
          <History className="h-5 w-5 text-amber-400" />
          <h3 className="font-display text-lg font-bold text-zinc-100">Previous Attempts</h3>
        </div>
        <p className="text-xs text-zinc-400 font-mono italic">
          No previous attempts recorded yet. Click "Start Mission" to make your first attempt!
        </p>
      </section>
    );
  }

  const formatDate = (isoOrStr?: string) => {
    if (!isoOrStr) return "Today";
    try {
      const d = new Date(isoOrStr);
      if (isNaN(d.getTime())) return isoOrStr;
      return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    } catch {
      return isoOrStr;
    }
  };

  return (
    <section className="rounded-3xl border border-[#232323] bg-[#111111] p-6 sm:p-8 space-y-6 shadow-xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#232323] pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <History className="h-5 w-5 text-amber-400" />
            <h3 className="font-display text-xl font-bold text-zinc-100 tracking-tight">
              Attempt History ({attempts.length})
            </h3>
          </div>
          <p className="text-xs text-zinc-400 font-mono">
            Every retry is tracked as a new engineering attempt. Proofs of Work are never overwritten.
          </p>
        </div>

        {onPracticeAgain && !isMissionLocked && (
          <button
            onClick={onPracticeAgain}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-mono text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all cursor-pointer shadow-md shrink-0"
          >
            <span>Practice Again</span>
            <ArrowUpRight className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      <div className="space-y-3">
        {attempts.map((att) => {
          const isCompleted = att.status === "Completed";
          const isInProgress = att.status === "In Progress";
          const isAbandoned = att.status === "Abandoned";

          return (
            <div
              key={att.id}
              className={`rounded-2xl border p-4 sm:p-5 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                isInProgress
                  ? "border-amber-500/40 bg-amber-500/5 shadow-md shadow-amber-500/5"
                  : isCompleted
                  ? "border-emerald-500/30 bg-[#0d1510]"
                  : "border-[#232323] bg-[#141414] opacity-75"
              }`}
            >
              {/* Left attempt details */}
              <div className="space-y-2 min-w-0">
                <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
                  <span className="font-bold text-zinc-100 text-sm">
                    Attempt #{att.attemptNumber}
                  </span>

                  {isCompleted && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[11px] font-bold">
                      <ShieldCheck className="h-3 w-3" /> Completed
                    </span>
                  )}

                  {isInProgress && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/40 text-[11px] font-bold animate-pulse">
                      <Clock className="h-3 w-3" /> In Progress ({att.progress}%)
                    </span>
                  )}

                  {isAbandoned && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-zinc-800 text-zinc-400 border border-zinc-700 text-[11px] font-medium">
                      <XCircle className="h-3 w-3" /> Abandoned
                    </span>
                  )}

                  <span className="text-zinc-500">•</span>
                  <span className="text-zinc-400">
                    {formatDate(att.completedAt || att.startedAt)}
                  </span>
                </div>

                {/* Score / Metric preview */}
                <div className="text-xs text-zinc-300 font-sans">
                  {att.score && (
                    <span className="font-mono text-amber-400 font-bold mr-3">
                      Score: {att.score}%
                    </span>
                  )}
                  {att.proofOfWork?.verifiedMetric && (
                    <span className="text-zinc-400 font-mono text-[11px]">
                      Metric: "{att.proofOfWork.verifiedMetric}"
                    </span>
                  )}
                  {isInProgress && (
                    <span className="text-amber-400/90 font-mono text-[11px]">
                      Current Step: Step {att.currentStep} of {att.totalSteps}
                    </span>
                  )}
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-2 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-[#232323]">
                {isCompleted && att.proofOfWork && (
                  <button
                    onClick={() => onViewProofOfWork(att.proofOfWork!)}
                    className="px-3.5 py-2 bg-[#1c2820] hover:bg-[#25362b] text-emerald-400 border border-emerald-500/30 rounded-xl font-mono text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <ShieldCheck className="h-3.5 w-3.5" />
                    <span>View Proof of Work</span>
                  </button>
                )}

                {isInProgress && (
                  <>
                    <button
                      onClick={() => onResumeAttempt(att)}
                      className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-mono text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all cursor-pointer shadow-md shadow-amber-500/20"
                    >
                      <Play className="h-3.5 w-3.5 fill-zinc-950" />
                      <span>Resume Attempt</span>
                    </button>

                    <button
                      onClick={() => onAbandonAttempt(att)}
                      className="px-3 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 font-mono text-xs font-semibold rounded-xl flex items-center gap-1 transition-all cursor-pointer"
                    >
                      <XCircle className="h-3.5 w-3.5" />
                      <span>Abandon</span>
                    </button>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
