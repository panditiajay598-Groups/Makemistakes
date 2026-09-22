"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ProblemData } from "@/lib/problemContent";
import { deriveBuildWorkspace } from "@/lib/buildWorkspace";
import BuildOS from "@/components/journey/BuildOS";

interface BuildPhaseProps {
  onComplete: () => void;
  onBackToJourney?: () => void;
  problemData?: ProblemData | null;
  userId?: string;
}

export default function BuildPhase({
  onComplete,
  onBackToJourney,
  problemData,
  userId,
}: BuildPhaseProps) {
  const workspace = useMemo(() => deriveBuildWorkspace(problemData), [problemData]);

  return (
    <div className="w-screen h-screen flex flex-col bg-[#07090e] text-zinc-100 overflow-hidden">
      {/* Top Bar */}
      <div className="flex items-center justify-between h-8 px-4 bg-[#0a0d14] border-b border-zinc-800/80 text-xs shrink-0">
        <div className="flex items-center gap-3">
          {onBackToJourney ? (
            <button
              type="button"
              onClick={onBackToJourney}
              className="inline-flex items-center gap-1.5 text-[11px] text-zinc-400 hover:text-teal-300 transition-colors cursor-pointer"
              title="Return to Phase 4: Plan"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>← Phase 4: Plan</span>
            </button>
          ) : (
            <Link
              href="/dashboard/journey"
              className="inline-flex items-center gap-1.5 text-[11px] text-zinc-400 hover:text-teal-300 transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>← Roadmap</span>
            </Link>
          )}
          <span className="text-zinc-700">|</span>
          <Link
            href="/dashboard/journey"
            className="text-[11px] text-zinc-500 hover:text-zinc-300 transition-colors"
          >
            All Phases
          </Link>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-teal-400 font-mono font-medium">
            Phase 5 of 8 — Build
          </span>
          <span className="text-zinc-700 hidden sm:inline">·</span>
          <p className="text-[11px] text-zinc-500 font-mono hidden sm:inline">
            packages stay in your cloud workspace, not on your device
          </p>
        </div>
      </div>

      <div className="flex-1 min-h-0 w-full">
        <BuildOS
          problemId={workspace.problemId}
          productName={workspace.productName}
          problemData={problemData}
          onComplete={onComplete}
        />
      </div>
    </div>
  );
}
