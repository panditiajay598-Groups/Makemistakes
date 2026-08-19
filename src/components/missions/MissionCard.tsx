"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Clock,
  Award,
  CheckCircle2,
  Play,
  ArrowRight,
  Lock,
  Sparkles,
  Server,
  Database,
  ShieldCheck,
  Code2,
  Cpu,
  RotateCcw,
} from "lucide-react";
import { saveActiveSession } from "@/lib/session";
import { getMissionStateDetails, startOrResumeAttempt, practiceAgain, MissionStateDetails } from "@/lib/attemptsStore";
import { Mission } from "./types";
import DifficultyBadge from "./DifficultyBadge";
import TechTag from "./TechTag";

interface MissionCardProps {
  mission: Mission;
  viewMode?: "grid" | "list";
  onSelect: (mission: Mission) => void;
}

export default function MissionCard({
  mission,
  viewMode = "grid",
  onSelect,
}: MissionCardProps) {
  const router = useRouter();
  const [stateDetails, setStateDetails] = useState<MissionStateDetails | null>(null);

  useEffect(() => {
    setStateDetails(getMissionStateDetails(mission.id));
  }, [mission.id]);

  const handleAction = (e: React.MouseEvent) => {
    e.stopPropagation();

    if (stateDetails?.status === "Locked") return;

    if (stateDetails?.status === "Completed") {
      const result = practiceAgain(mission.id, mission.title, mission.totalSteps || 8);
      if (result.success && result.attempt) {
        saveActiveSession({
          missionId: mission.id,
          missionTitle: mission.title,
          currentStep: result.attempt.currentStep,
          totalSteps: result.attempt.totalSteps,
          activeFile: mission.activeFile || "limiter.ts",
        });
        router.push("/workspace");
      }
      return;
    }

    const result = startOrResumeAttempt(mission.id, mission.title, mission.totalSteps || 8);
    if (result.success && result.attempt) {
      saveActiveSession({
        missionId: mission.id,
        missionTitle: mission.title,
        currentStep: result.attempt.currentStep,
        totalSteps: result.attempt.totalSteps,
        activeFile: mission.activeFile || "limiter.ts",
      });
      router.push("/workspace");
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "Backend":
        return Server;
      case "Database":
        return Database;
      case "Security":
        return ShieldCheck;
      case "AI":
        return Sparkles;
      case "Frontend":
        return Code2;
      default:
        return Cpu;
    }
  };

  const CategoryIcon = getCategoryIcon(mission.category);
  const status = stateDetails?.status || mission.status;
  const isLocked = status === "Locked";
  const isCompleted = status === "Completed";
  const activeAttempt = stateDetails?.activeAttempt;

  if (viewMode === "list") {
    return (
      <div
        onClick={() => onSelect(mission)}
        className={`group relative rounded-2xl border border-[#232323] bg-[#111111] hover:border-amber-500/40 p-4 sm:p-5 transition-all duration-200 cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm hover:shadow-lg hover:shadow-amber-500/5 ${
          isLocked ? "opacity-80" : ""
        }`}
      >
        {/* Left main info */}
        <div className="flex items-start gap-4 min-w-0 flex-1">
          <div className="h-11 w-11 rounded-xl bg-[#161616] border border-[#2a2a2a] group-hover:border-amber-500/30 flex items-center justify-center shrink-0 text-amber-400 group-hover:scale-105 transition-transform">
            <CategoryIcon className="h-5.5 w-5.5" />
          </div>

          <div className="space-y-1.5 min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <DifficultyBadge difficulty={mission.difficulty} showIcon={false} />
              <span className="font-mono text-[11px] text-zinc-500">{mission.category}</span>
              
              {isLocked ? (
                <span className="inline-flex items-center gap-1 font-mono text-[11px] text-zinc-400 font-bold bg-[#161616] px-2 py-0.5 rounded border border-[#282828]">
                  <Lock className="h-3 w-3 text-zinc-500" /> Locked
                </span>
              ) : isCompleted ? (
                <span className="inline-flex items-center gap-1 font-mono text-[11px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
                  <CheckCircle2 className="h-3 w-3" /> ✅ Completed
                </span>
              ) : activeAttempt ? (
                <span className="inline-flex items-center gap-1 font-mono text-[11px] text-amber-400 font-bold bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30">
                  • Attempt #{activeAttempt.attemptNumber} In Progress ({activeAttempt.progress}%)
                </span>
              ) : null}
            </div>

            <h4 className="font-display text-base font-bold text-zinc-100 group-hover:text-amber-400 transition-colors tracking-tight truncate">
              {mission.title}
            </h4>

            <p className="text-xs text-zinc-400 font-sans line-clamp-1">
              {mission.description}
            </p>

            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              {mission.techStack.map((tech) => (
                <TechTag key={tech} name={tech} />
              ))}
            </div>
          </div>
        </div>

        {/* Action side */}
        <div className="flex items-center justify-between md:flex-col md:items-end gap-3 shrink-0 pt-3 md:pt-0 border-t md:border-t-0 border-[#232323]">
          <div className="flex items-center gap-3 font-mono text-xs text-zinc-400">
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5 text-zinc-500" /> {mission.timeEstimate}
            </span>
            <span className="text-amber-400 font-bold flex items-center gap-1">
              <Award className="h-3.5 w-3.5" /> +{mission.xpReward} XP
            </span>
          </div>

          {!isLocked ? (
            <button
              onClick={handleAction}
              className={`px-4 py-2 font-mono text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all cursor-pointer shadow-md shrink-0 ${
                isCompleted
                  ? "bg-amber-500/10 hover:bg-amber-500 text-amber-400 hover:text-zinc-950 border border-amber-500/40"
                  : activeAttempt
                  ? "bg-amber-500 hover:bg-amber-400 text-zinc-950"
                  : "bg-amber-500 hover:bg-amber-400 text-zinc-950"
              }`}
            >
              {isCompleted ? (
                <>
                  <RotateCcw className="h-3.5 w-3.5" />
                  <span>Practice Again</span>
                </>
              ) : activeAttempt ? (
                <>
                  <Play className="h-3.5 w-3.5 fill-zinc-950" />
                  <span>Resume #{activeAttempt.attemptNumber}</span>
                </>
              ) : (
                <>
                  <span>Start Mission</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </>
              )}
            </button>
          ) : (
            <button
              disabled
              title={`🔒 Finish or abandon your current attempt on "${stateDetails?.lockedByAttempt?.missionTitle}" first.`}
              className="px-3 py-2 bg-zinc-800 text-zinc-500 border border-zinc-700 font-mono text-[11px] font-bold rounded-xl flex items-center gap-1 cursor-not-allowed opacity-80 shrink-0"
            >
              <Lock className="h-3 w-3 text-zinc-500" />
              <span>Locked (Active Attempt Exists)</span>
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={() => onSelect(mission)}
      className={`group relative rounded-2xl border border-[#232323] bg-[#111111] hover:border-amber-500/40 p-5 transition-all duration-200 cursor-pointer flex flex-col justify-between space-y-4 shadow-sm hover:shadow-xl hover:shadow-amber-500/5 ${
        isLocked ? "opacity-85" : ""
      }`}
    >
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-[#161616] border border-[#2a2a2a] group-hover:border-amber-500/30 flex items-center justify-center text-amber-400">
            <CategoryIcon className="h-4 w-4" />
          </div>
          <span className="font-mono text-xs text-zinc-400 font-medium">{mission.category}</span>
        </div>

        <DifficultyBadge difficulty={mission.difficulty} showIcon={false} />
      </div>

      {/* Content */}
      <div className="space-y-2">
        <h4 className="font-display text-lg font-bold text-zinc-100 group-hover:text-amber-400 transition-colors tracking-tight line-clamp-2">
          {mission.title}
        </h4>
        <p className="text-xs text-zinc-400 font-sans line-clamp-2 leading-relaxed">
          {mission.description}
        </p>
      </div>

      {/* Status Badges */}
      {isCompleted ? (
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono text-xs font-bold w-fit">
          <CheckCircle2 className="h-3.5 w-3.5" />
          <span>✅ Completed</span>
        </div>
      ) : activeAttempt ? (
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 font-mono text-xs font-bold w-fit">
          <Play className="h-3 w-3 fill-amber-400" />
          <span>Attempt #{activeAttempt.attemptNumber} ({activeAttempt.progress}%)</span>
        </div>
      ) : null}

      {/* Tech Stack */}
      <div className="flex flex-wrap gap-1.5 pt-1">
        {mission.techStack.map((tech) => (
          <TechTag key={tech} name={tech} />
        ))}
      </div>

      {/* Footer info & Action */}
      <div className="pt-3 border-t border-[#232323] flex items-center justify-between gap-2 font-mono text-xs">
        <div className="flex items-center gap-2 text-zinc-400">
          <span className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5 text-zinc-500" /> {mission.timeEstimate}
          </span>
          <span className="text-amber-400 font-bold">+{mission.xpReward} XP</span>
        </div>

        {!isLocked ? (
          <button
            onClick={handleAction}
            className={`px-3.5 py-2 font-bold rounded-xl flex items-center gap-1 cursor-pointer transition-all shadow-md shrink-0 text-xs ${
              isCompleted
                ? "bg-amber-500/10 hover:bg-amber-500 text-amber-400 hover:text-zinc-950 border border-amber-500/40"
                : activeAttempt
                ? "bg-amber-500 hover:bg-amber-400 text-zinc-950"
                : "bg-amber-500 hover:bg-amber-400 text-zinc-950"
            }`}
          >
            {isCompleted ? (
              <>
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Practice Again</span>
              </>
            ) : activeAttempt ? (
              <>
                <Play className="h-3.5 w-3.5 fill-zinc-950" />
                <span>Resume #{activeAttempt.attemptNumber}</span>
              </>
            ) : (
              <>
                <span>Start</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </>
            )}
          </button>
        ) : (
          <button
            disabled
            title={`🔒 Finish or abandon your active attempt on "${stateDetails?.lockedByAttempt?.missionTitle}" first.`}
            className="px-3 py-1.5 bg-zinc-800 text-zinc-500 border border-zinc-700 font-mono text-[11px] font-bold rounded-xl flex items-center gap-1 cursor-not-allowed opacity-80 shrink-0"
          >
            <Lock className="h-3 w-3 text-zinc-500" />
            <span>Locked</span>
          </button>
        )}
      </div>

      {/* Locked message banner */}
      {isLocked && stateDetails?.lockedByAttempt && (
        <div className="text-[10px] font-mono text-amber-400/90 bg-amber-500/10 p-2 rounded-lg border border-amber-500/20 text-center space-y-0.5">
          <div>🔒 Finish or abandon your current attempt first.</div>
          <div className="text-zinc-400 font-semibold truncate">Active: {stateDetails.lockedByAttempt.missionTitle}</div>
        </div>
      )}
    </div>
  );
}
