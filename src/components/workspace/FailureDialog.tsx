"use client";

import React from "react";
import { AlertOctagon, RotateCcw, BookOpen, Bot, ChevronRight, HelpCircle } from "lucide-react";

interface FailureDialogProps {
  isOpen: boolean;
  failureReason: string;
  commonMistake: string;
  suggestedReading: string;
  onRetry: () => void;
  onAskAI: () => void;
}

export default function FailureDialog({
  isOpen,
  failureReason,
  commonMistake,
  suggestedReading,
  onRetry,
  onAskAI,
}: FailureDialogProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-zinc-950/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-zinc-900 border border-red-500/30 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl p-6 space-y-5 text-left font-mono">
        
        {/* Error Badge & Header */}
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-2xl bg-red-500/20 border border-red-500/40 text-red-400 flex items-center justify-center shrink-0">
            <AlertOctagon className="h-6 w-6" />
          </div>
          <div>
            <span className="text-red-400 font-bold uppercase text-[10px] tracking-wider">
              Step Verification Failed
            </span>
            <h2 className="text-zinc-100 font-bold text-xl font-sans">
              Assertion Error Post-Mortem
            </h2>
          </div>
        </div>

        {/* Failure Reason */}
        <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800 space-y-1">
          <div className="text-red-400 font-bold uppercase text-[10px]">Failure Reason</div>
          <p className="text-zinc-200 text-xs font-sans leading-relaxed">{failureReason}</p>
        </div>

        {/* Common Mistake Identified */}
        <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800 space-y-1">
          <div className="text-amber-400 font-bold uppercase text-[10px]">Identified Pattern</div>
          <p className="text-zinc-300 text-xs font-sans leading-relaxed">{commonMistake}</p>
        </div>

        {/* Suggested Reading */}
        <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-amber-400" />
            <span className="text-zinc-200 font-sans">{suggestedReading}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <button
            onClick={onAskAI}
            className="py-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-100 font-bold rounded-xl flex items-center justify-center gap-1.5 cursor-pointer transition-colors text-xs"
          >
            <Bot className="h-4 w-4 text-amber-400" />
            <span>Ask AI Coach</span>
          </button>

          <button
            onClick={onRetry}
            className="py-3 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold rounded-xl flex items-center justify-center gap-1.5 cursor-pointer transition-colors text-xs shadow-lg shadow-amber-500/20"
          >
            <RotateCcw className="h-4 w-4" />
            <span>Retry Step</span>
          </button>
        </div>

      </div>
    </div>
  );
}
