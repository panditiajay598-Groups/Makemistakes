"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Bot,
  Sparkles,
  ArrowRight,
  Award,
  Clock,
  Check,
  Cpu,
  Layers,
  Database,
  Server,
  Lock,
} from "lucide-react";
import { saveActiveSession, canStartMission } from "@/lib/session";
import { Mission } from "./types";
import DifficultyBadge from "./DifficultyBadge";

interface AIRecommendationCardProps {
  mission: Mission;
  recommendationReason: string;
  onSelect: (mission: Mission) => void;
}

export default function AIRecommendationCard({
  mission,
  recommendationReason,
  onSelect,
}: AIRecommendationCardProps) {
  const router = useRouter();
  const [canStart, setCanStart] = useState<{
    allowed: boolean;
    activeMissionTitle?: string;
    activeMissionId?: string;
    activeAttemptNumber?: number;
  }>({ allowed: true });

  useEffect(() => {
    setCanStart(canStartMission(mission.id));
  }, [mission.id]);

  const handleStart = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!canStart.allowed) return;

    saveActiveSession({
      missionId: mission.id,
      missionTitle: mission.title,
      currentStep: 1,
      totalSteps: mission.totalSteps || 8,
      activeFile: mission.activeFile || "worker.ts",
    });
    router.push("/workspace");
  };

  return (
    <div
      onClick={() => onSelect(mission)}
      className="relative rounded-3xl border border-amber-500/30 bg-[#0d0d0d] hover:border-amber-500/50 p-6 sm:p-7 transition-all duration-300 group cursor-pointer shadow-2xl space-y-5 overflow-hidden"
    >
      {/* Top Banner: Socratic AI Rationale */}
      <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 font-mono text-xs text-amber-400 flex items-start gap-2.5">
        <Bot className="h-4 w-4 shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <div className="font-bold uppercase text-[10px] tracking-wider text-amber-500 flex items-center justify-between">
            <span>AI MENTOR RECOMMENDATION</span>
            {!canStart.allowed && (
              <span className="text-zinc-400 font-normal text-[10px] flex items-center gap-1">
                <Lock className="h-3 w-3 text-amber-400" /> Locked until active mission finishes
              </span>
            )}
          </div>
          <p className="text-zinc-200 font-sans text-xs leading-relaxed">
            "{recommendationReason}"
          </p>
        </div>
      </div>

      {/* Title & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] text-zinc-500 font-bold uppercase">
              RECOMMENDED SPEC #01
            </span>
            <DifficultyBadge difficulty={mission.difficulty} />
          </div>
          <h3 className="font-display text-2xl sm:text-3xl font-bold text-zinc-50 group-hover:text-amber-400 transition-colors tracking-tight">
            {mission.title}
          </h3>
        </div>

        <span className="font-mono text-xs text-amber-400 font-bold bg-[#161616] px-3 py-1.5 rounded-lg border border-[#2a2a2a] self-start sm:self-auto flex items-center gap-1.5">
          <Award className="h-4 w-4" /> +{mission.xpReward} XP
        </span>
      </div>

      <p className="text-xs sm:text-sm text-zinc-300 font-sans leading-relaxed">
        {mission.description}
      </p>

      {/* Information Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 rounded-2xl bg-[#080808] border border-[#1e1e1e] font-mono text-xs">
        <div>
          <span className="text-zinc-500 uppercase text-[10px] font-bold block">Duration</span>
          <span className="text-zinc-200 font-semibold">{mission.timeEstimate}</span>
        </div>
        <div>
          <span className="text-zinc-500 uppercase text-[10px] font-bold block">Category</span>
          <span className="text-zinc-200 font-semibold">{mission.category}</span>
        </div>
        <div className="col-span-2">
          <span className="text-zinc-500 uppercase text-[10px] font-bold block">Stack</span>
          <span className="text-amber-400 font-semibold truncate block">
            {mission.techStack.join(" • ")}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-[#232323]">
        <div className="flex flex-wrap gap-1.5">
          {mission.skills.slice(0, 3).map((skill) => (
            <span
              key={skill}
              className="px-2.5 py-0.5 rounded-md bg-[#161616] text-zinc-400 border border-[#262626] font-mono text-[11px]"
            >
              {skill}
            </span>
          ))}
        </div>

        {canStart.allowed ? (
          <button
            onClick={handleStart}
            className="px-6 py-3 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-mono text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-amber-500/20 hover:scale-[1.02] shrink-0"
          >
            <span>Start Challenge</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        ) : (
          <div className="flex flex-col items-end gap-1">
            <button
              disabled
              title="You can only work on one mission at a time. Finish your current mission to unlock this challenge."
              className="px-5 py-3 bg-zinc-800 text-zinc-500 border border-zinc-700 font-mono text-xs font-bold rounded-xl flex items-center justify-center gap-2 cursor-not-allowed opacity-80 shrink-0"
            >
              <Lock className="h-3.5 w-3.5 text-zinc-500" />
              <span>Complete Current Mission First</span>
            </button>
            <span className="text-[10px] font-mono text-zinc-500 italic">
              Complete your current mission first.
            </span>
          </div>
        )}
      </div>

    </div>
  );
}
