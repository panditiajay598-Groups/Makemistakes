"use client";

import React from "react";
import Link from "next/link";
import { Trophy, Sparkles, CheckCircle2, ArrowRight, LayoutDashboard, Rocket, ShieldCheck } from "lucide-react";
import { MissionData } from "./missionsData";

interface MissionCompletionProps {
  mission: MissionData;
  onContinueNextMission: () => void;
  onReturnToDashboard: () => void;
}

export default function MissionCompletion({
  mission,
  onContinueNextMission,
  onReturnToDashboard,
}: MissionCompletionProps) {
  return (
    <div className="max-w-3xl mx-auto space-y-8 py-10 px-4 sm:px-6 text-center">
      
      {/* Premium Completion Card */}
      <section className="bg-white border border-teal-200/80 p-8 sm:p-12 rounded-3xl space-y-8 shadow-2xl shadow-zinc-200/50 relative overflow-hidden">
        
        {/* Top Badge Graphic */}
        <div className="space-y-4 flex flex-col items-center">
          <div className="h-20 w-20 rounded-3xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-700 shadow-md shadow-teal-700/10">
            <Trophy className="h-10 w-10 text-teal-700" />
          </div>

          <div className="space-y-1">
            <span className="font-mono text-xs text-teal-800 font-bold bg-teal-50 px-3.5 py-1.5 rounded-full border border-teal-200 inline-block uppercase tracking-wider">
              MISSION {mission.number} COMPLETED
            </span>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-zinc-900 tracking-tight pt-2">
              {mission.title}
            </h1>
            <p className="text-xs sm:text-sm text-zinc-600 font-mono">
              Product: <strong className="text-teal-800 font-semibold">{mission.productName}</strong>
            </p>
          </div>
        </div>

        {/* Reputation Earned */}
        <div className="bg-teal-50/70 border border-teal-200/80 p-5 rounded-2xl max-w-md mx-auto flex items-center justify-between text-xs font-mono">
          <span className="text-teal-900 font-bold flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-amber-500" />
            Engineering Reputation Earned
          </span>
          <span className="text-teal-800 font-black text-sm">+{mission.xpReward} PTS</span>
        </div>

        {/* Skills Strengthened */}
        <div className="space-y-3 pt-2 text-left max-w-lg mx-auto">
          <span className="font-mono text-[10px] text-zinc-500 font-bold uppercase tracking-wider block text-center">
            SKILLS STRENGTHENED
          </span>
          <div className="flex flex-wrap justify-center gap-2">
            {mission.skills.map((skill, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-50 border border-zinc-200 text-xs font-mono text-zinc-800 font-semibold"
              >
                <CheckCircle2 className="h-3.5 w-3.5 text-teal-700" />
                {skill}
              </span>
            ))}
          </div>
        </div>

        {/* Next Mission Unlocked Card */}
        <div className="p-6 rounded-2xl bg-zinc-50 border border-zinc-200 text-left space-y-3 max-w-lg mx-auto">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[10px] text-teal-800 font-bold uppercase tracking-wider flex items-center gap-1.5">
              <Rocket className="h-3.5 w-3.5 text-teal-700" />
              UNLOCKED NEXT MISSION
            </span>
            <span className="font-mono text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              UNLOCKED ✓
            </span>
          </div>
          <div>
            <h4 className="font-serif text-base font-bold text-zinc-900">
              {mission.nextMissionTitle}
            </h4>
            <p className="text-xs text-zinc-600 font-sans mt-0.5">
              Ready to begin when you are. Advance your career progression to the next milestone.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <button
            onClick={onContinueNextMission}
            className="w-full sm:w-auto inline-flex h-13 items-center justify-center gap-2.5 rounded-full bg-teal-700 hover:bg-teal-800 text-white px-9 text-xs sm:text-sm font-bold transition-all cursor-pointer border-none shadow-lg shadow-teal-700/25 font-sans"
          >
            <span>Continue to Next Mission</span>
            <ArrowRight className="h-4 w-4" />
          </button>

          <button
            onClick={onReturnToDashboard}
            className="w-full sm:w-auto inline-flex h-13 items-center justify-center gap-2.5 rounded-full bg-white border border-zinc-300 hover:bg-zinc-100 text-zinc-900 px-8 text-xs sm:text-sm font-bold transition-all cursor-pointer shadow-sm font-sans"
          >
            <LayoutDashboard className="h-4 w-4 text-teal-700" />
            <span>Return to Dashboard</span>
          </button>
        </div>

      </section>

    </div>
  );
}
