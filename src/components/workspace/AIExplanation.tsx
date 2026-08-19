"use client";

import React, { useState } from "react";
import { Sparkles, Bot, AlertOctagon, HelpCircle, ShieldAlert, ChevronDown, ChevronUp } from "lucide-react";

interface AIExplanationProps {
  what: string;
  why: string;
  commonMistakes: string[];
  whatNotToDo: string;
}

export default function AIExplanation({
  what,
  why,
  commonMistakes,
  whatNotToDo,
}: AIExplanationProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl overflow-hidden shadow-md">
      
      {/* Header Banner */}
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className="p-3.5 bg-amber-500/10 border-b border-amber-500/20 flex items-center justify-between cursor-pointer hover:bg-amber-500/15 transition-colors select-none"
      >
        <div className="flex items-center gap-2 font-mono text-xs font-bold text-amber-400">
          <Bot className="h-4 w-4" />
          <span>Socratic AI Engineering Briefing</span>
          <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded border border-amber-500/30">
            No Solution Spoilers
          </span>
        </div>
        <button className="text-amber-400 hover:text-amber-300 p-0.5 rounded">
          {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>
      </div>

      {/* Content */}
      {isExpanded && (
        <div className="p-4 space-y-4 font-mono text-xs text-zinc-300">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* What it is */}
            <div className="p-3 rounded-lg bg-zinc-950/80 border border-zinc-800/80 space-y-1">
              <div className="text-amber-400 font-bold uppercase text-[10px] flex items-center gap-1.5">
                <HelpCircle className="h-3.5 w-3.5" /> What You're Building
              </div>
              <p className="text-zinc-200 leading-relaxed font-sans text-xs">{what}</p>
            </div>

            {/* Why it matters */}
            <div className="p-3 rounded-lg bg-zinc-950/80 border border-zinc-800/80 space-y-1">
              <div className="text-amber-400 font-bold uppercase text-[10px] flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5" /> Why It Matters In Production
              </div>
              <p className="text-zinc-200 leading-relaxed font-sans text-xs">{why}</p>
            </div>
          </div>

          {/* Pitfalls & What NOT to do */}
          <div className="p-3 rounded-lg bg-zinc-950/80 border border-zinc-800/80 space-y-2">
            <div className="text-red-400 font-bold uppercase text-[10px] flex items-center gap-1.5">
              <ShieldAlert className="h-3.5 w-3.5" /> Common Pitfalls & What NOT To Do
            </div>
            
            <ul className="space-y-1 pl-4 list-disc text-zinc-300 font-sans text-xs">
              {commonMistakes.map((mistake, i) => (
                <li key={i}>{mistake}</li>
              ))}
            </ul>

            <div className="pt-2 border-t border-zinc-900 text-[11px] text-red-300/90 font-mono flex items-start gap-1.5">
              <AlertOctagon className="h-3.5 w-3.5 shrink-0 text-red-400 mt-0.5" />
              <span><strong>AVOID:</strong> {whatNotToDo}</span>
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
