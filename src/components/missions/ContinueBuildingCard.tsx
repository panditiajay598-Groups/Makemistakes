"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Play, Clock, Award, Layers, Target, ArrowRight } from "lucide-react";
import { Mission } from "./types";

interface ContinueBuildingCardProps {
  mission: Mission;
}

export default function ContinueBuildingCard({ mission }: ContinueBuildingCardProps) {
  const router = useRouter();

  const handleResume = () => {
    router.push("/workspace");
  };

  const progress = mission.progress || 37;
  const currentStep = mission.currentStep || 3;
  const totalSteps = mission.totalSteps || 8;

  return (
    <div className="bg-gradient-to-r from-amber-500/10 via-zinc-900 to-zinc-950 border border-amber-500/30 rounded-2xl p-5 font-mono text-xs shadow-xl select-none flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      
      {/* Left Details */}
      <div className="space-y-2 flex-1">
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 rounded bg-amber-500 text-zinc-950 font-bold text-[10px] uppercase tracking-wider flex items-center gap-1">
            <Play className="h-3 w-3 fill-zinc-950" /> Continue Building
          </span>
          <span className="text-zinc-400 text-[11px]">Step {currentStep} of {totalSteps}</span>
        </div>

        <div className="space-y-0.5">
          <h3 className="text-zinc-100 font-bold text-lg font-display tracking-tight">
            {mission.title}
          </h3>
          <p className="text-zinc-400 font-sans text-xs line-clamp-1">
            {mission.description}
          </p>
        </div>

        {/* Progress bar */}
        <div className="flex items-center gap-3 pt-1 max-w-md">
          <div className="flex-1 bg-zinc-900 h-2 rounded-full overflow-hidden border border-zinc-800">
            <div
              className="bg-amber-500 h-full rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="text-amber-400 font-bold">{progress}% Complete</span>
          <span className="text-zinc-500">•</span>
          <span className="text-zinc-400 flex items-center gap-1">
            <Clock className="h-3 w-3 text-zinc-500" /> {mission.timeEstimate || "1h 52m"} left
          </span>
        </div>
      </div>

      {/* Resume Button */}
      <button
        onClick={handleResume}
        className="w-full sm:w-auto px-6 py-3 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-all shadow-lg shadow-amber-500/20 shrink-0 font-mono text-xs hover:scale-[1.02]"
      >
        <span>Resume Mission</span>
        <ArrowRight className="h-4 w-4" />
      </button>

    </div>
  );
}
