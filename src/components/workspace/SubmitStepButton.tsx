"use client";

import React from "react";
import { ArrowRight, ShieldCheck, Sparkles, RefreshCw } from "lucide-react";

interface SubmitStepButtonProps {
  onSubmit: () => void;
  isSubmitting?: boolean;
}

export default function SubmitStepButton({ onSubmit, isSubmitting = false }: SubmitStepButtonProps) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 space-y-2 shadow-lg font-mono">
      <button
        onClick={onSubmit}
        disabled={isSubmitting}
        className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-60 text-zinc-950 font-bold font-mono text-base rounded-xl flex items-center justify-center gap-2.5 transition-all cursor-pointer shadow-xl shadow-emerald-500/20 hover:scale-[1.01] active:scale-[0.99]"
      >
        {isSubmitting ? (
          <>
            <RefreshCw className="h-5 w-5 animate-spin text-zinc-950" />
            <span>Validating Hidden Suite...</span>
          </>
        ) : (
          <>
            <ShieldCheck className="h-5 w-5 fill-zinc-950 text-emerald-500" />
            <span>Submit Step</span>
            <ArrowRight className="h-5 w-5" />
          </>
        )}
      </button>

      <div className="text-center font-mono text-[11px] text-zinc-500 flex items-center justify-center gap-1.5">
        <Sparkles className="h-3 w-3 text-amber-400" />
        <span>Triggers AI PR Code Review & Hidden Assertions</span>
      </div>
    </div>
  );
}
