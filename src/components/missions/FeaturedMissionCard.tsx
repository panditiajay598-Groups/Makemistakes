"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Flame,
  Award,
  Clock,
  ArrowRight,
  Bookmark,
  Share2,
  Check,
  ShieldCheck,
  Zap,
  Users,
  Server,
  Database,
  Layers,
  Cpu,
  Lock,
  RotateCcw,
  Play,
} from "lucide-react";
import { saveActiveSession } from "@/lib/session";
import { getMissionStateDetails, startOrResumeAttempt, practiceAgain, MissionStateDetails } from "@/lib/attemptsStore";
import { Mission } from "./types";
import DifficultyBadge from "./DifficultyBadge";

interface FeaturedMissionCardProps {
  mission: Mission;
  onSelect: (mission: Mission) => void;
}

export default function FeaturedMissionCard({ mission, onSelect }: FeaturedMissionCardProps) {
  const router = useRouter();
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [copied, setCopied] = useState(false);
  const [stateDetails, setStateDetails] = useState<MissionStateDetails | null>(null);

  useEffect(() => {
    setStateDetails(getMissionStateDetails(mission.id));
  }, [mission.id]);

  const handleStart = (e: React.MouseEvent) => {
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

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const deliverables = [
    "Sliding Window Rate Limiter",
    "Atomic Redis Operations",
    "High Traffic Protection",
    "Hidden Test Suite Pass",
    "Production Proof of Work",
  ];

  const companies = ["Stripe", "Cloudflare", "Netflix"];
  const status = stateDetails?.status || mission.status;
  const isLocked = status === "Locked";
  const isCompleted = status === "Completed";
  const activeAttempt = stateDetails?.activeAttempt;

  return (
    <div
      onClick={() => onSelect(mission)}
      className={`relative rounded-3xl border border-[#232323] bg-[#0f0f0f] hover:border-amber-500/40 p-6 sm:p-7 transition-all duration-200 group cursor-pointer shadow-2xl overflow-hidden space-y-6 ${
        isLocked ? "opacity-90" : ""
      }`}
    >
      {/* Top Header Tag */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 font-mono text-xs text-amber-400 font-bold bg-amber-500/10 px-3 py-1 rounded-lg border border-amber-500/20">
          <Flame className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
          <span>FEATURED MISSION</span>
        </div>

        <DifficultyBadge difficulty={mission.difficulty} />
      </div>

      {/* Mission Title & Problem Statement */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <h3 className="font-display text-2xl sm:text-3xl font-bold text-zinc-50 group-hover:text-amber-400 transition-colors tracking-tight">
            {mission.title}
          </h3>
        </div>
        <p className="text-xs sm:text-sm text-zinc-300 font-sans leading-relaxed">
          {mission.description}
        </p>
      </div>

      {/* Information Section (Compact Grid) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 rounded-2xl bg-[#080808] border border-[#1e1e1e] font-mono text-xs">
        <div>
          <span className="text-zinc-500 uppercase text-[10px] font-bold block">Difficulty</span>
          <span className="text-zinc-200 font-semibold">{mission.difficulty}</span>
        </div>

        <div>
          <span className="text-zinc-500 uppercase text-[10px] font-bold block">Duration</span>
          <span className="text-zinc-200 font-semibold">{mission.timeEstimate}</span>
        </div>

        <div>
          <span className="text-zinc-500 uppercase text-[10px] font-bold block">XP Reward</span>
          <span className="text-amber-400 font-bold">+{mission.xpReward} XP</span>
        </div>

        <div>
          <span className="text-zinc-500 uppercase text-[10px] font-bold block">Category</span>
          <span className="text-zinc-200 font-semibold">{mission.category}</span>
        </div>

        <div className="sm:col-span-2">
          <span className="text-zinc-500 uppercase text-[10px] font-bold block">Required Stack</span>
          <span className="text-amber-400 font-semibold truncate block">
            {mission.techStack.join(" • ")}
          </span>
        </div>

        <div className="col-span-2 sm:col-span-3 pt-2 border-t border-[#181818] flex items-center justify-between text-[11px]">
          <span className="text-zinc-500">Real-World Reference:</span>
          <span className="text-zinc-300 font-bold">{companies.join(" • ")}</span>
        </div>
      </div>

      {/* Status Banner if Locked or Completed */}
      {isLocked && stateDetails?.lockedByAttempt ? (
        <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs font-mono text-amber-300 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Lock className="h-4 w-4 text-amber-400 shrink-0" />
            <span>🔒 Finish or abandon active attempt: <strong>{stateDetails.lockedByAttempt.missionTitle} (#{stateDetails.lockedByAttempt.attemptNumber})</strong></span>
          </div>
        </div>
      ) : isCompleted ? (
        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs font-mono text-emerald-400 flex items-center gap-2 font-bold">
          <ShieldCheck className="h-4 w-4" />
          <span>✅ Completed ({stateDetails?.completedAttempts.length || 1} Attempt{stateDetails?.completedAttempts.length === 1 ? "" : "s"})</span>
        </div>
      ) : null}

      {/* Skills Badges */}
      <div className="space-y-1.5 font-mono text-xs">
        <span className="text-zinc-500 uppercase text-[10px] font-bold tracking-wider">Skills Gained</span>
        <div className="flex flex-wrap gap-1.5">
          {mission.skills.map((skill) => (
            <span
              key={skill}
              className="px-2.5 py-1 rounded-md bg-[#161616] text-zinc-300 border border-[#262626] text-[11px] font-medium"
            >
              {skill}
            </span>
          ))}
        </div>
      </div>

      {/* "You'll Build" Section */}
      <div className="space-y-2 font-mono text-xs">
        <span className="text-zinc-500 uppercase text-[10px] font-bold tracking-wider">You'll Build</span>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 font-sans text-xs">
          {deliverables.map((item, idx) => (
            <div key={idx} className="flex items-center gap-2 text-zinc-300">
              <Check className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
              <span>{item}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Architecture Preview */}
      <div className="p-4 rounded-2xl bg-[#080808] border border-[#1e1e1e] space-y-2.5 font-mono text-xs">
        <div className="flex items-center justify-between text-zinc-500 text-[10px] uppercase font-bold">
          <span>Architecture Flow Preview</span>
          <span>Sliding Window Log</span>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-xl bg-[#0d0d0d] border border-[#232323] text-center font-mono text-[11px]">
          <div className="flex items-center gap-1 text-zinc-300 bg-[#161616] px-2.5 py-1 rounded border border-[#282828]">
            <Users className="h-3.5 w-3.5 text-amber-400" />
            <span>Users</span>
          </div>
          <span className="text-amber-500 font-bold">➔</span>
          <div className="flex items-center gap-1 text-zinc-300 bg-[#161616] px-2.5 py-1 rounded border border-[#282828]">
            <Layers className="h-3.5 w-3.5 text-amber-400" />
            <span>API Gateway</span>
          </div>
          <span className="text-amber-500 font-bold">➔</span>
          <div className="flex items-center gap-1 text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded border border-amber-500/30 font-bold">
            <Cpu className="h-3.5 w-3.5 text-amber-400" />
            <span>Rate Limiter</span>
          </div>
          <span className="text-amber-500 font-bold">➔</span>
          <div className="flex items-center gap-1 text-zinc-300 bg-[#161616] px-2.5 py-1 rounded border border-[#282828]">
            <Database className="h-3.5 w-3.5 text-amber-400" />
            <span>Redis</span>
          </div>
        </div>
      </div>

      {/* CTA Footer Row */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-[#232323]">
        {!isLocked ? (
          <button
            onClick={handleStart}
            className={`w-full sm:w-auto px-7 py-3.5 font-mono text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shrink-0 ${
              isCompleted
                ? "bg-amber-500/10 hover:bg-amber-500 text-amber-400 hover:text-zinc-950 border border-amber-500/40"
                : activeAttempt
                ? "bg-amber-500 hover:bg-amber-400 text-zinc-950 shadow-amber-500/20"
                : "bg-amber-500 hover:bg-amber-400 text-zinc-950 shadow-amber-500/20"
            }`}
          >
            {isCompleted ? (
              <>
                <RotateCcw className="h-4 w-4" />
                <span>Practice Again</span>
              </>
            ) : activeAttempt ? (
              <>
                <Play className="h-4 w-4 fill-zinc-950" />
                <span>Resume Attempt #{activeAttempt.attemptNumber}</span>
              </>
            ) : (
              <>
                <span>Start Mission</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        ) : (
          <button
            disabled
            className="w-full sm:w-auto px-6 py-3.5 bg-zinc-800 text-zinc-500 border border-zinc-700 font-mono text-xs font-bold rounded-xl flex items-center justify-center gap-2 cursor-not-allowed opacity-80"
          >
            <Lock className="h-4 w-4" />
            <span>Locked (Active Attempt Exists)</span>
          </button>
        )}

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsBookmarked(!isBookmarked);
            }}
            className={`px-4 py-2.5 rounded-xl font-mono text-xs font-semibold flex items-center justify-center gap-1.5 border transition-colors cursor-pointer ${
              isBookmarked
                ? "bg-amber-500/10 text-amber-400 border-amber-500/30"
                : "bg-[#161616] hover:bg-[#202020] text-zinc-300 border-[#282828]"
            }`}
          >
            <Bookmark className={`h-3.5 w-3.5 ${isBookmarked ? "fill-amber-400 text-amber-400" : "text-zinc-400"}`} />
            <span>{isBookmarked ? "Saved" : "Bookmark"}</span>
          </button>

          <button
            onClick={handleShare}
            className="px-4 py-2.5 bg-[#161616] hover:bg-[#202020] text-zinc-300 border border-[#282828] rounded-xl font-mono text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Share2 className="h-3.5 w-3.5 text-zinc-400" />}
            <span>{copied ? "Copied" : "Share"}</span>
          </button>
        </div>
      </div>

    </div>
  );
}
