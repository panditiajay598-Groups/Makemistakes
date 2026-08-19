"use client";

import React from "react";
import { Play, CheckCircle2, XCircle, ShieldCheck, Clock, RefreshCw } from "lucide-react";

interface RunTestsButtonProps {
  isRunning: boolean;
  onRunTests: () => void;
  passedCount?: number;
  failedCount?: number;
  hiddenRemaining?: number;
  executionTime?: string;
  testStatus: "idle" | "running" | "passed" | "failed";
}

export default function RunTestsButton({
  isRunning,
  onRunTests,
  passedCount = 4,
  failedCount = 0,
  hiddenRemaining = 3,
  executionTime = "142ms",
  testStatus,
}: RunTestsButtonProps) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 space-y-3 shadow-lg font-mono">
      
      {/* Primary Action Button */}
      <button
        onClick={onRunTests}
        disabled={isRunning}
        className="w-full py-4 bg-amber-500 hover:bg-amber-400 disabled:opacity-60 text-zinc-950 font-bold font-mono text-base rounded-xl flex items-center justify-center gap-2.5 transition-all cursor-pointer shadow-xl shadow-amber-500/25 hover:scale-[1.01] active:scale-[0.99]"
      >
        {isRunning ? (
          <>
            <RefreshCw className="h-5 w-5 animate-spin text-zinc-950" />
            <span>Executing Assertions...</span>
          </>
        ) : (
          <>
            <Play className="h-5 w-5 fill-zinc-950" />
            <span>Run Tests</span>
            <span className="text-xs bg-zinc-950/20 text-zinc-950 px-2 py-0.5 rounded font-mono font-normal">
              ⌘ + Enter
            </span>
          </>
        )}
      </button>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
        
        {/* Passed */}
        <div className="bg-zinc-950 border border-zinc-800 p-2.5 rounded-lg flex items-center justify-between">
          <span className="text-zinc-500 text-[11px] font-bold">Passed</span>
          <span className="text-emerald-400 font-bold flex items-center gap-1">
            <CheckCircle2 className="h-3.5 w-3.5" />
            {testStatus === "passed" ? passedCount + 1 : passedCount}
          </span>
        </div>

        {/* Failed */}
        <div className="bg-zinc-950 border border-zinc-800 p-2.5 rounded-lg flex items-center justify-between">
          <span className="text-zinc-500 text-[11px] font-bold">Failed</span>
          <span className="text-zinc-400 font-bold flex items-center gap-1">
            <XCircle className="h-3.5 w-3.5 text-zinc-500" />
            {failedCount}
          </span>
        </div>

        {/* Hidden Tests */}
        <div className="bg-zinc-950 border border-zinc-800 p-2.5 rounded-lg flex items-center justify-between">
          <span className="text-zinc-500 text-[10px] font-bold uppercase">Hidden</span>
          <span className="text-amber-400 font-bold flex items-center gap-1 text-[11px]">
            <ShieldCheck className="h-3.5 w-3.5" />
            {hiddenRemaining} left
          </span>
        </div>

        {/* Execution Time */}
        <div className="bg-zinc-950 border border-zinc-800 p-2.5 rounded-lg flex items-center justify-between">
          <span className="text-zinc-500 text-[11px] font-bold">Time</span>
          <span className="text-zinc-300 font-bold flex items-center gap-1">
            <Clock className="h-3.5 w-3.5 text-zinc-500" />
            {executionTime}
          </span>
        </div>

      </div>

    </div>
  );
}
