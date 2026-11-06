"use client";

import React, { useMemo } from "react";
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
      <div className="flex-1 min-h-0 w-full">
        <BuildOS
          problemId={workspace.problemId}
          productName={workspace.productName}
          problemData={problemData}
          onBackToJourney={onBackToJourney}
          onComplete={onComplete}
          userId={userId}
        />
      </div>
    </div>
  );
}
