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
        {onBackToJourney ? (
          <button
            type="button"
            onClick={onBackToJourney}
            className="inline-flex items-center gap-1.5 text-[11px] text-zinc-400 hover:text-zinc-200 transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Journey
          </button>
        ) : (
          <Link
            href="/dashboard/journey"
            className="inline-flex items-center gap-1.5 text-[11px] text-zinc-400 hover:text-zinc-200 transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Journey
          </Link>
        )}
        <p className="text-[11px] text-zinc-500 font-mono">
          Phase 5 — Build · packages stay in your cloud workspace, not on your device
        </p>
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
