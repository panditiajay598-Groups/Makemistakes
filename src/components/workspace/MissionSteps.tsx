"use client";

import React from "react";
import { Check, Circle, Flame, ChevronRight, Lock, Sparkles } from "lucide-react";

interface StepItem {
  id: number;
  label: string;
  description: string;
}

interface MissionStepsProps {
  currentStep: number;
  totalSteps: number;
  onSelectStep?: (stepId: number) => void;
}

export default function MissionSteps({ currentStep, totalSteps, onSelectStep }: MissionStepsProps) {
  const steps: StepItem[] = [
    { id: 1, label: "Understand Problem", description: "Analyze DDoS vectors & connection pool exhaustion" },
    { id: 2, label: "Read Existing Code", description: "Inspect starter Redis connection module & interfaces" },
    { id: 3, label: "Implement Solution", description: "Write atomic sliding window log rate limit algorithm" },
    { id: 4, label: "Optimize Performance", description: "Convert multi-step roundtrips into atomic Lua script" },
    { id: 5, label: "Handle Edge Cases", description: "Manage clock drift, zero limits, & cluster nodes" },
    { id: 6, label: "Pass Hidden Suite", description: "Execute 10k req/sec burst load tests under 5ms SLA" },
    { id: 7, label: "Senior Code Review", description: "Defend architecture choices & trade-off decisions" },
    { id: 8, label: "Publish Proof of Work", description: "Generate verified portfolio proof of work entry" },
  ];

  return (
    <div className="bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden shadow-lg font-mono text-xs">
      
      {/* Header */}
      <div className="bg-zinc-900/90 border-b border-zinc-800 px-3.5 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-2 text-zinc-100 font-bold">
          <Flame className="h-4 w-4 text-amber-400" />
          <span>Mission Roadmap</span>
        </div>
        <span className="text-amber-400 font-bold bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 text-[11px]">
          Step {currentStep} of {totalSteps}
        </span>
      </div>

      {/* Steps List */}
      <div className="p-3 space-y-2 max-h-[380px] overflow-y-auto">
        {steps.map((step) => {
          const isDone = step.id < currentStep;
          const isCurrent = step.id === currentStep;
          const isLocked = step.id > currentStep;

          return (
            <div
              key={step.id}
              onClick={() => !isLocked && onSelectStep && onSelectStep(step.id)}
              className={`p-3 rounded-xl border transition-all select-none ${
                isCurrent
                  ? "bg-amber-500/10 border-amber-500/50 shadow-md"
                  : isDone
                  ? "bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:border-zinc-700 cursor-pointer"
                  : "bg-zinc-950 border-zinc-900 opacity-50 cursor-not-allowed"
              }`}
            >
              <div className="flex items-start gap-2.5">
                
                {/* Status Indicator Icon */}
                <div className="mt-0.5 shrink-0">
                  {isDone ? (
                    <div className="h-4 w-4 rounded-full bg-emerald-500/20 border border-emerald-500 text-emerald-400 flex items-center justify-center font-bold text-[10px]">
                      <Check className="h-3 w-3" />
                    </div>
                  ) : isCurrent ? (
                    <div className="h-4 w-4 rounded-full bg-amber-500 text-zinc-950 flex items-center justify-center font-bold text-[10px] animate-pulse">
                      ●
                    </div>
                  ) : (
                    <div className="h-4 w-4 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-600 flex items-center justify-center text-[10px]">
                      <Lock className="h-2.5 w-2.5" />
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 space-y-0.5">
                  <div className="flex items-center justify-between">
                    <span className={`font-bold ${isCurrent ? "text-amber-400" : isDone ? "text-zinc-200" : "text-zinc-500"}`}>
                      {step.label}
                    </span>
                    {isCurrent && (
                      <span className="text-[10px] bg-amber-500 text-zinc-950 px-1.5 py-0.2 rounded font-black uppercase">
                        ACTIVE
                      </span>
                    )}
                  </div>
                  <p className="text-zinc-500 text-[11px] font-sans leading-tight">
                    {step.description}
                  </p>
                </div>

              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}
