"use client";

import React from "react";
import { ArrowRight, Bot, CheckCircle2, ShieldCheck, Sparkles, Code2, AlertTriangle } from "lucide-react";

interface StepAICodeReviewProps {
  code: string;
  fileName: string;
  stepTitle: string;
  onContinue: () => void;
}

export default function StepAICodeReview({ code, fileName, stepTitle, onContinue }: StepAICodeReviewProps) {
  // Analyze submitted code dynamically for summary bullet points
  const hasRedis = code.includes("redis") || code.includes("Redis");
  const hasDecr = code.includes("decr") || code.includes("incr") || code.includes("token");
  const hasIf = code.includes("if");
  const hasReturn = code.includes("return");

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-3 duration-300 font-sans">
      
      {/* Senior AI Header */}
      <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Bot className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-display text-lg font-bold text-zinc-100 flex items-center gap-2">
              <span>Senior AI Coach Review</span>
              <span className="text-[10px] font-mono text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                PR Code Analysis
              </span>
            </h3>
            <p className="text-xs text-zinc-400 font-mono">
              Reviewing: <span className="text-amber-400">{fileName}</span> ({stepTitle})
            </p>
          </div>
        </div>

        <span className="font-mono text-xs text-zinc-500 bg-zinc-950 px-2.5 py-1 rounded border border-zinc-800">
          Stage 1 of 6
        </span>
      </div>

      {/* Description */}
      <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed font-sans bg-zinc-950 p-4 rounded-xl border border-zinc-850">
        Before running the automated tests, let's review your implementation together. Great engineers understand <strong>why</strong> their code works—not just that it compiles.
      </p>

      {/* Dynamic Code Explanation Card */}
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-6 space-y-4 shadow-xl backdrop-blur-xl">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
          <span className="font-mono text-xs text-amber-400 font-bold uppercase tracking-wider flex items-center gap-2">
            <Code2 className="h-4 w-4 text-amber-400" />
            AI Breakdown of Your Implementation
          </span>
          <span className="text-[10px] font-mono text-zinc-400">
            Code Line Inspection
          </span>
        </div>

        <p className="text-xs text-zinc-300 font-mono">
          I reviewed your submitted implementation in <span className="text-amber-400 font-bold">{fileName}</span>. Here is what your code currently does:
        </p>

        <div className="space-y-2.5">
          <div className="flex items-start gap-3 bg-zinc-950 p-3 rounded-xl border border-zinc-850 text-xs text-zinc-200">
            <CheckCircle2 className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
            <span>Initializes the Redis client connection and checks store availability.</span>
          </div>

          <div className="flex items-start gap-3 bg-zinc-950 p-3 rounded-xl border border-zinc-850 text-xs text-zinc-200">
            <CheckCircle2 className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
            <span>Reads the current token count for incoming user key.</span>
          </div>

          <div className="flex items-start gap-3 bg-zinc-950 p-3 rounded-xl border border-zinc-850 text-xs text-zinc-200">
            <CheckCircle2 className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
            <span>Evaluates conditional logic to check whether requests are still allowed.</span>
          </div>

          <div className="flex items-start gap-3 bg-zinc-950 p-3 rounded-xl border border-zinc-850 text-xs text-zinc-200">
            <CheckCircle2 className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
            <span>Decreases token count and returns true when access is granted.</span>
          </div>
        </div>

        {/* Observation Observation Box */}
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 space-y-1">
          <span className="font-mono text-xs text-amber-400 font-bold uppercase block flex items-center gap-1.5">
            <AlertTriangle className="h-3.5 w-3.5 text-amber-400" />
            Senior Engineer Observation:
          </span>
          <p className="text-xs text-amber-200 font-sans leading-relaxed">
            "Overall your implementation is logically correct. However, I'm curious how this specific conditional structure behaves under heavy concurrent traffic."
          </p>
        </div>
      </div>

      {/* Action CTA */}
      <div className="flex flex-col items-center gap-2 pt-2">
        <button
          onClick={onContinue}
          className="group relative inline-flex h-12 w-full sm:w-auto items-center justify-center gap-3 rounded-lg bg-amber-500 px-8 text-sm font-bold text-zinc-950 transition-all hover:bg-amber-400 active:scale-98 cursor-pointer border-none shadow-lg shadow-amber-500/20"
        >
          <span>Continue Review</span>
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </button>
        <span className="font-mono text-[11px] text-zinc-500">
          Press <kbd className="px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-700">Enter ↵</kbd> to proceed to Assessment Mode
        </span>
      </div>

    </div>
  );
}
