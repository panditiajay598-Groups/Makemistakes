"use client";

import React from "react";
import { Clock, Target, Layers, TrendingUp } from "lucide-react";

interface MissionProgressProps {
  missionTitle: string;
  currentStep: number;
  totalSteps: number;
  progressPercent: number;
  estimatedTime: string;
}

export default function MissionProgress({
  missionTitle,
  currentStep,
  totalSteps,
  progressPercent,
  estimatedTime,
}: MissionProgressProps) {
  return (
    <div className="bg-zinc-950/90 border-b border-zinc-800/80 px-4 py-2.5 font-mono text-xs text-zinc-300">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        
        {/* Metric 1: Mission Title */}
        <div className="flex items-center gap-2">
          <span className="text-zinc-500 font-bold uppercase text-[10px] tracking-wider">Mission</span>
          <span className="text-zinc-100 font-bold bg-zinc-900 px-2.5 py-1 rounded-md border border-zinc-800 flex items-center gap-1.5">
            <Target className="h-3.5 w-3.5 text-amber-400" />
            {missionTitle}
          </span>
        </div>

        {/* Metric 2: Step Counter */}
        <div className="flex items-center gap-2">
          <span className="text-zinc-500 font-bold uppercase text-[10px] tracking-wider">Step</span>
          <span className="text-amber-400 font-bold bg-amber-500/10 px-2.5 py-1 rounded-md border border-amber-500/20 flex items-center gap-1.5">
            <Layers className="h-3.5 w-3.5" />
            {currentStep} / {totalSteps}
          </span>
        </div>

        {/* Metric 3: Progress Bar */}
        <div className="flex items-center gap-2.5 flex-1 min-w-[200px] max-w-md">
          <span className="text-zinc-500 font-bold uppercase text-[10px] tracking-wider shrink-0">Progress</span>
          <div className="flex-1 bg-zinc-900 rounded-full h-2 overflow-hidden border border-zinc-800 p-0.5">
            <div
              className="bg-amber-500 h-full rounded-full transition-all duration-500 ease-out shadow-sm shadow-amber-500/30"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <span className="text-zinc-100 font-bold shrink-0">{progressPercent}%</span>
        </div>

        {/* Metric 4: Estimated Time */}
        <div className="flex items-center gap-2">
          <span className="text-zinc-500 font-bold uppercase text-[10px] tracking-wider">Estimated Time</span>
          <span className="text-zinc-300 font-medium bg-zinc-900 px-2.5 py-1 rounded-md border border-zinc-800 flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5 text-zinc-400" />
            {estimatedTime}
          </span>
        </div>

      </div>
    </div>
  );
}
