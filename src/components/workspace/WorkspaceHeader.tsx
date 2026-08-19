"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Bookmark,
  Settings,
  Keyboard,
  Clock,
  Sparkles,
  Award,
  ChevronRight,
  ShieldCheck,
  Check,
} from "lucide-react";
import AutosaveIndicator from "./AutosaveIndicator";

interface WorkspaceHeaderProps {
  missionTitle: string;
  difficulty: string;
  currentStep: number;
  totalSteps: number;
  progressPercent: number;
  timeRemaining: string;
  saveStatus: "saved" | "saving" | "idle";
  lastSavedText?: string;
  onOpenSettings: () => void;
  onOpenShortcuts: () => void;
}

export default function WorkspaceHeader({
  missionTitle,
  difficulty,
  currentStep,
  totalSteps,
  progressPercent,
  timeRemaining,
  saveStatus,
  lastSavedText,
  onOpenSettings,
  onOpenShortcuts,
}: WorkspaceHeaderProps) {
  const [isBookmarked, setIsBookmarked] = useState(false);

  const difficultyColors: Record<string, string> = {
    Easy: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
    Intermediate: "bg-amber-500/10 text-amber-400 border-amber-500/30",
    Medium: "bg-amber-500/10 text-amber-400 border-amber-500/30",
    Hard: "bg-red-500/10 text-red-400 border-red-500/30",
    Senior: "bg-purple-500/10 text-purple-400 border-purple-500/30",
    Expert: "bg-purple-500/10 text-purple-400 border-purple-500/30",
  };

  const badgeStyle = difficultyColors[difficulty] || difficultyColors["Intermediate"];

  return (
    <header className="h-14 bg-zinc-950 border-b border-zinc-800/80 px-4 flex items-center justify-between font-mono text-xs text-zinc-300 shrink-0 z-30 relative select-none">
      
      {/* LEFT SECTION: Logo & Mission Navigation */}
      <div className="flex items-center gap-3">
        <Link
          href="/missions"
          className="flex items-center gap-1.5 text-zinc-400 hover:text-zinc-100 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 px-2.5 py-1.5 rounded-lg transition-all no-underline shrink-0 group"
          title="Exit Mission & Return to Catalog"
        >
          <ArrowLeft className="h-3.5 w-3.5 group-hover:-translate-x-0.5 transition-transform" />
          <span className="font-semibold hidden sm:inline">Exit Mission</span>
        </Link>

        <div className="h-4 w-px bg-zinc-800 hidden sm:block" />

        <div className="flex items-center gap-2 overflow-hidden">
          <div className="h-6 w-6 rounded-md bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center font-bold text-[10px] shrink-0">
            M
          </div>
          <h1 className="font-bold text-zinc-100 truncate text-sm max-w-[200px] md:max-w-[320px]" title={missionTitle}>
            {missionTitle}
          </h1>

          <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${badgeStyle} hidden md:inline`}>
            {difficulty}
          </span>
        </div>
      </div>

      {/* CENTER SECTION: Metric Summary Pill */}
      <div className="hidden lg:flex items-center gap-4 bg-zinc-900/60 border border-zinc-800/80 px-3.5 py-1 rounded-full text-zinc-400">
        <div className="flex items-center gap-1.5">
          <span className="text-zinc-500 font-bold uppercase text-[10px]">Step:</span>
          <span className="text-zinc-100 font-bold">{currentStep} / {totalSteps}</span>
        </div>

        <div className="h-3 w-px bg-zinc-800" />

        <div className="flex items-center gap-2">
          <span className="text-zinc-500 font-bold uppercase text-[10px]">Progress:</span>
          <div className="w-16 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-amber-500 transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <span className="text-amber-400 font-bold">{progressPercent}%</span>
        </div>

        <div className="h-3 w-px bg-zinc-800" />

        <div className="flex items-center gap-1 text-zinc-400">
          <Clock className="h-3 w-3 text-zinc-500" />
          <span className="text-zinc-300 font-medium">{timeRemaining} left</span>
        </div>
      </div>

      {/* RIGHT SECTION: Actions & Autosave */}
      <div className="flex items-center gap-2">
        <AutosaveIndicator status={saveStatus} lastSavedText={lastSavedText} />

        <button
          onClick={() => setIsBookmarked(!isBookmarked)}
          className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
            isBookmarked
              ? "bg-amber-500/10 text-amber-400 border-amber-500/30"
              : "bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 border-zinc-800"
          }`}
          title={isBookmarked ? "Mission Bookmarked" : "Bookmark Mission"}
        >
          <Bookmark className={`h-3.5 w-3.5 ${isBookmarked ? "fill-amber-400" : ""}`} />
        </button>

        <button
          onClick={onOpenShortcuts}
          className="p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 border border-zinc-800 transition-all cursor-pointer hidden sm:flex items-center gap-1"
          title="Keyboard Shortcuts (?)"
        >
          <Keyboard className="h-3.5 w-3.5" />
        </button>

        <button
          onClick={onOpenSettings}
          className="p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 border border-zinc-800 transition-all cursor-pointer"
          title="Workspace Settings"
        >
          <Settings className="h-3.5 w-3.5" />
        </button>
      </div>

    </header>
  );
}
