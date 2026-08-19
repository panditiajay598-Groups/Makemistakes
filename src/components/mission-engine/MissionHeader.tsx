"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft, Clock, Save, ChevronDown, ChevronUp, Terminal } from "lucide-react";
import ProgressTracker from "./ProgressTracker";
import { MissionData } from "./missionsData";

interface MissionHeaderProps {
  mission: MissionData;
  currentStep: "BRIEF" | "WORKSPACE" | "SUBMITTING" | "REVIEW" | "COMPLETED";
  saveStatus?: "saved" | "saving" | "idle";
  isSummaryOpen?: boolean;
  onToggleSummary?: () => void;
  onStepClick?: (step: "BRIEF" | "WORKSPACE" | "REVIEW" | "COMPLETED") => void;
}

export default function MissionHeader({
  mission,
  currentStep,
  saveStatus = "saved",
  isSummaryOpen = false,
  onToggleSummary,
  onStepClick,
}: MissionHeaderProps) {
  return (
    <header className="h-16 sm:h-20 border-b border-zinc-200/80 bg-[#FAF9F5]/95 backdrop-blur-md px-4 sm:px-8 flex items-center justify-between shrink-0 sticky top-0 z-40">
      {/* Left: Brand & Back Navigation */}
      <div className="flex items-center gap-3 sm:gap-4">
        <Link
          href="/dashboard"
          className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-700 hover:text-zinc-900 font-mono text-xs font-semibold transition-all no-underline shadow-sm"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Dashboard</span>
        </Link>

        <div className="h-5 w-px bg-zinc-200 hidden sm:block" />

        {/* Mission Badge & Title */}
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-lg bg-teal-700 text-white font-mono font-bold text-xs flex items-center justify-center shadow-sm">
            M{mission.number}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-serif text-sm sm:text-base font-bold text-zinc-900 tracking-tight">
                {mission.title}
              </span>
              <span className="hidden md:inline font-mono text-[10px] text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200 font-bold">
                {mission.productName}
              </span>
            </div>
            <div className="flex items-center gap-2 text-[11px] font-mono text-zinc-500">
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3 text-zinc-400" />
                {mission.estimatedTime}
              </span>
              <span>•</span>
              <span className="text-teal-800 font-semibold">{mission.difficulty}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Center/Right: Progress Tracker & Save Indicator */}
      <div className="flex items-center gap-3 sm:gap-6">
        <ProgressTracker currentStep={currentStep} onStepClick={onStepClick} />

        {/* Save Status (Only in Workspace mode) */}
        {currentStep === "WORKSPACE" && (
          <div className="hidden lg:flex items-center gap-1.5 font-mono text-[11px] text-zinc-500 bg-white border border-zinc-200 px-3 py-1 rounded-full shadow-sm">
            <Save className={`h-3 w-3 ${saveStatus === "saving" ? "text-amber-500 animate-spin" : "text-teal-700"}`} />
            <span>{saveStatus === "saving" ? "Saving Draft..." : "Draft Saved"}</span>
          </div>
        )}

        {/* Summary Toggle (Workspace mode) */}
        {currentStep === "WORKSPACE" && onToggleSummary && (
          <button
            onClick={onToggleSummary}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-teal-200 bg-teal-50 hover:bg-teal-100 text-teal-900 font-mono text-xs font-semibold transition-all cursor-pointer shadow-sm"
          >
            <span>Summary</span>
            {isSummaryOpen ? <ChevronUp className="h-3.5 w-3.5 text-teal-700" /> : <ChevronDown className="h-3.5 w-3.5 text-teal-700" />}
          </button>
        )}
      </div>
    </header>
  );
}
