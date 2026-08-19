"use client";

import React, { useState } from "react";
import { AlertTriangle, DollarSign, Cpu, CheckCircle2, ChevronDown, ChevronUp, FileText } from "lucide-react";

interface ProblemDescriptionProps {
  stepTitle: string;
  problemText: string;
  businessImpact: string;
  technicalChallenge: string;
  expectedOutcome: string;
}

export default function ProblemDescription({
  stepTitle,
  problemText,
  businessImpact,
  technicalChallenge,
  expectedOutcome,
}: ProblemDescriptionProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="bg-zinc-900/90 border border-zinc-800/80 rounded-xl overflow-hidden shadow-md">
      
      {/* Header Bar */}
      <div
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="p-3.5 bg-zinc-950/80 border-b border-zinc-800/80 flex items-center justify-between cursor-pointer hover:bg-zinc-900/80 transition-colors select-none"
      >
        <div className="flex items-center gap-2 font-mono text-xs text-zinc-100 font-bold">
          <FileText className="h-4 w-4 text-amber-400" />
          <span>Problem Statement: <span className="text-zinc-400 font-normal">{stepTitle}</span></span>
        </div>
        <button className="text-zinc-400 hover:text-zinc-100 p-0.5 rounded">
          {isCollapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
        </button>
      </div>

      {/* Body Content */}
      {!isCollapsed && (
        <div className="p-4 space-y-4 font-mono text-xs">
          
          {/* Engineering Problem */}
          <div className="p-3 rounded-lg bg-zinc-950/60 border border-zinc-800/60 space-y-1">
            <div className="text-zinc-400 font-bold uppercase text-[10px] tracking-wider flex items-center gap-1.5 text-amber-400">
              <AlertTriangle className="h-3.5 w-3.5" /> Engineering Context
            </div>
            <p className="text-zinc-200 leading-relaxed font-sans">{problemText}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Business Impact */}
            <div className="p-3 rounded-lg bg-zinc-950/60 border border-zinc-800/60 space-y-1">
              <div className="text-zinc-400 font-bold uppercase text-[10px] tracking-wider flex items-center gap-1 text-red-400">
                <DollarSign className="h-3.5 w-3.5" /> Business Impact
              </div>
              <p className="text-zinc-300 text-[11px] leading-relaxed font-sans">{businessImpact}</p>
            </div>

            {/* Technical Challenge */}
            <div className="p-3 rounded-lg bg-zinc-950/60 border border-zinc-800/60 space-y-1">
              <div className="text-zinc-400 font-bold uppercase text-[10px] tracking-wider flex items-center gap-1 text-amber-400">
                <Cpu className="h-3.5 w-3.5" /> Technical Challenge
              </div>
              <p className="text-zinc-300 text-[11px] leading-relaxed font-sans">{technicalChallenge}</p>
            </div>

            {/* Expected Outcome */}
            <div className="p-3 rounded-lg bg-zinc-950/60 border border-zinc-800/60 space-y-1">
              <div className="text-zinc-400 font-bold uppercase text-[10px] tracking-wider flex items-center gap-1 text-emerald-400">
                <CheckCircle2 className="h-3.5 w-3.5" /> Expected Outcome
              </div>
              <p className="text-zinc-300 text-[11px] leading-relaxed font-sans">{expectedOutcome}</p>
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
