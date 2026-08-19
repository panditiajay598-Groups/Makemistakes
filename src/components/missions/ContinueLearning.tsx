import React from "react";
import { useRouter } from "next/navigation";
import { Play, ArrowRight, Clock } from "lucide-react";
import { saveActiveSession } from "@/lib/session";
import { Mission } from "./types";

interface ContinueLearningProps {
  mission: Mission;
}

export default function ContinueLearning({ mission }: ContinueLearningProps) {
  const router = useRouter();

  const handleResume = () => {
    saveActiveSession({
      missionId: mission.id,
      missionTitle: mission.title,
      currentStep: mission.currentStep || 3,
      totalSteps: mission.totalSteps || 8,
      activeFile: mission.activeFile || "limiter.ts",
    });
    router.push("/workspace");
  };

  return (
    <div className="rounded-3xl border border-amber-500/30 bg-[#111111] p-6 sm:p-7 space-y-4 shadow-xl relative overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
        
        {/* Left: Mission info & progress */}
        <div className="space-y-3 max-w-xl">
          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] text-amber-400 font-bold bg-amber-500/10 px-2.5 py-0.5 rounded border border-amber-500/20 uppercase tracking-wider">
              CONTINUE LEARNING
            </span>
            <span className="font-mono text-xs text-zinc-400">
              Step {mission.currentStep || 3} of {mission.totalSteps || 8}
            </span>
          </div>

          <h3 className="font-display text-xl sm:text-2xl font-bold text-zinc-50 tracking-tight">
            {mission.title}
          </h3>

          <div className="space-y-1.5 pt-1">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-zinc-400 flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-zinc-500" />
                Est. Time Left: <strong className="text-zinc-200">2h 18m</strong>
              </span>
              <span className="text-amber-400 font-bold">{mission.progress || 37}%</span>
            </div>

            <div className="h-2 w-full bg-[#1c1c1c] rounded-full overflow-hidden border border-[#282828]">
              <div
                className="h-full bg-amber-500 rounded-full transition-all duration-500 shadow-[0_0_10px_rgba(245,158,11,0.4)]"
                style={{ width: `${mission.progress || 37}%` }}
              />
            </div>
          </div>
        </div>

        {/* Right: Resume button */}
        <div className="shrink-0 flex items-center pt-2 sm:pt-0">
          <button
            onClick={handleResume}
            className="group px-6 py-3.5 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-mono text-sm font-bold rounded-2xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-amber-500/20 hover:scale-[1.02] active:scale-[0.98] w-full sm:w-auto"
          >
            <Play className="h-4 w-4 fill-zinc-950" />
            <span>Resume Mission</span>
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </button>
        </div>

      </div>
    </div>
  );
}
