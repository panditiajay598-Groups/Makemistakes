"use client";

import React from "react";
import { CheckCircle2, Award, Zap, ArrowRight, Sparkles, ShieldCheck } from "lucide-react";

interface SuccessDialogProps {
  isOpen: boolean;
  stepNumber: number;
  xpEarned: number;
  unlockedSkill: string;
  nextObjective: string;
  onContinue: () => void;
}

export default function SuccessDialog({
  isOpen,
  stepNumber,
  xpEarned,
  unlockedSkill,
  nextObjective,
  onContinue,
}: SuccessDialogProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-zinc-950/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl p-6 space-y-6 text-center font-mono">
        
        {/* Celebration Badge */}
        <div className="mx-auto h-16 w-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center shadow-lg shadow-emerald-500/20">
          <CheckCircle2 className="h-8 w-8" />
        </div>

        {/* Title & Subtitle */}
        <div className="space-y-1">
          <span className="text-emerald-400 font-bold uppercase text-xs tracking-wider">
            Step {stepNumber} Verified & Complete!
          </span>
          <h2 className="text-zinc-100 font-bold text-2xl tracking-tight font-sans">
            Outstanding Engineering!
          </h2>
          <p className="text-zinc-400 text-xs font-sans">
            Your implementation passed all unit tests and defended AI code review cleanly.
          </p>
        </div>

        {/* Rewards Box */}
        <div className="grid grid-cols-2 gap-3 p-4 rounded-2xl bg-zinc-950 border border-zinc-800 text-left text-xs">
          
          <div className="space-y-1">
            <div className="text-zinc-500 text-[10px] uppercase font-bold flex items-center gap-1">
              <Award className="h-3.5 w-3.5 text-amber-400" /> XP Earned
            </div>
            <div className="text-amber-400 font-bold text-lg">+{xpEarned} XP</div>
          </div>

          <div className="space-y-1">
            <div className="text-zinc-500 text-[10px] uppercase font-bold flex items-center gap-1">
              <Zap className="h-3.5 w-3.5 text-emerald-400" /> Skill Unlocked
            </div>
            <div className="text-zinc-100 font-bold truncate" title={unlockedSkill}>
              {unlockedSkill}
            </div>
          </div>

        </div>

        {/* Next Objective Card */}
        <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-left space-y-1">
          <div className="text-amber-400 font-bold uppercase text-[10px] flex items-center gap-1">
            <Sparkles className="h-3.5 w-3.5" /> Next Objective
          </div>
          <p className="text-zinc-200 text-xs font-sans font-medium">{nextObjective}</p>
        </div>

        {/* Continue Action */}
        <button
          onClick={onContinue}
          className="w-full py-4 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold rounded-2xl flex items-center justify-center gap-2 text-sm transition-all cursor-pointer shadow-lg shadow-amber-500/25 hover:scale-[1.01]"
        >
          <span>Continue to Step {stepNumber + 1}</span>
          <ArrowRight className="h-4 w-4" />
        </button>

      </div>
    </div>
  );
}
