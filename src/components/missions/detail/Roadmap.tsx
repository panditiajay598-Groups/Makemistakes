import React from "react";
import { GitCommit, CheckCircle2, Clock, FileCode2, Play } from "lucide-react";
import { RoadmapStep } from "./detailTypes";
import DifficultyBadge from "../DifficultyBadge";

interface RoadmapProps {
  steps: RoadmapStep[];
  currentStep?: number;
}

export default function Roadmap({ steps, currentStep = 3 }: RoadmapProps) {
  return (
    <section className="rounded-3xl border border-[#232323] bg-[#111111] p-6 sm:p-8 space-y-6">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#232323] pb-4">
        <div className="flex items-center gap-2">
          <GitCommit className="h-5 w-5 text-amber-400" />
          <h2 className="font-display text-xl font-bold text-zinc-100 tracking-tight">
            Mission Engineering Roadmap ({steps.length} Milestones)
          </h2>
        </div>
        <span className="font-mono text-xs text-zinc-500">
          Step-by-Step Hands-On Progression
        </span>
      </div>

      <div className="space-y-4">
        {steps.map((step) => {
          const isCompleted = step.stepNumber < currentStep;
          const isCurrent = step.stepNumber === currentStep;

          return (
            <div
              key={step.stepNumber}
              className={`p-5 rounded-2xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                isCurrent
                  ? "bg-[#161616] border-amber-500/50 ring-1 ring-amber-500/20 shadow-lg"
                  : isCompleted
                  ? "bg-[#0d0d0d] border-[#232323] opacity-85"
                  : "bg-[#090909] border-[#1f1f1f] opacity-60"
              }`}
            >
              
              {/* Left Step Header & Title */}
              <div className="flex items-start gap-4 min-w-0 flex-1">
                <div
                  className={`h-9 w-9 rounded-xl flex items-center justify-center font-mono font-bold text-xs shrink-0 ${
                    isCompleted
                      ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                      : isCurrent
                      ? "bg-amber-500 text-zinc-950 shadow-md shadow-amber-500/20"
                      : "bg-[#181818] text-zinc-500 border border-[#282828]"
                  }`}
                >
                  {isCompleted ? <CheckCircle2 className="h-5 w-5" /> : `0${step.stepNumber}`}
                </div>

                <div className="space-y-1 min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <span
                      className={`font-mono text-[10px] uppercase font-bold tracking-wider ${
                        isCurrent ? "text-amber-400" : isCompleted ? "text-emerald-400" : "text-zinc-500"
                      }`}
                    >
                      Step {step.stepNumber} {isCurrent ? "• ACTIVE STEP" : isCompleted ? "• COMPLETED" : ""}
                    </span>
                    <DifficultyBadge difficulty={step.difficulty} showIcon={false} />
                  </div>

                  <h4 className="font-display text-base font-bold text-zinc-100 tracking-tight">
                    {step.title}
                  </h4>

                  <p className="text-xs text-zinc-400 font-sans leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>

              {/* Right meta details */}
              <div className="flex items-center gap-4 shrink-0 font-mono text-xs text-zinc-400 justify-between md:justify-end border-t md:border-t-0 border-[#232323] pt-3 md:pt-0">
                <span className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5 text-zinc-500" />
                  {step.timeEstimate}
                </span>

                {step.keyFile && (
                  <span className="flex items-center gap-1 bg-[#1c1c1c] px-2.5 py-1 rounded-md border border-[#2a2a2a] text-[11px] text-amber-400">
                    <FileCode2 className="h-3 w-3" />
                    {step.keyFile}
                  </span>
                )}
              </div>

            </div>
          );
        })}
      </div>

    </section>
  );
}
