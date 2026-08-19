"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft, Terminal, Sparkles } from "lucide-react";

interface OnboardingHeaderProps {
  currentStep?: number;
  totalSteps?: number;
  onBack?: () => void;
}

export default function OnboardingHeader({
  currentStep = 1,
  onBack,
}: OnboardingHeaderProps) {
  const getStepTitle = (step: number) => {
    switch (step) {
      case 1:
        return "Welcome";
      case 2:
        return "Developer Identity";
      case 3:
        return "Choose Product";
      case 4:
        return "Builder Assessment (Mission Zero)";
      case 5:
        return "Developer Blueprint";
      case 6:
        return "Mission Control";
      default:
        return "Onboarding";
    }
  };

  return (
    <header className="w-full border-b border-zinc-200/80 bg-[#FAF9F5]/90 backdrop-blur-xl sticky top-0 z-40 transition-colors select-none">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-3.5 flex items-center justify-between gap-4">
        {/* Left: Brand Logo */}
        <div className="flex items-center gap-4 min-w-[140px]">
          {currentStep > 1 && onBack ? (
            <button
              onClick={onBack}
              className="group flex items-center gap-2 text-xs font-mono text-zinc-600 hover:text-zinc-900 transition-colors bg-transparent border-none cursor-pointer p-0 font-medium"
            >
              <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-1" />
              <span>Back</span>
            </button>
          ) : (
            <Link href="/" className="flex items-center gap-2.5 no-underline group">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-teal-700 text-white font-mono font-bold text-xs shadow-sm">
                <Terminal className="h-4 w-4 text-white" />
              </div>
              <span className="font-bold text-sm text-zinc-900 tracking-tight font-sans">
                Make<span className="text-teal-700">Mistakes</span>
              </span>
            </Link>
          )}
        </div>

        {/* Center: Dynamic Pill Badge */}
        <div className="flex items-center gap-2 bg-white border border-zinc-200/80 rounded-full px-4 py-1 shadow-sm">
          <div className="h-4 w-4 rounded-full bg-teal-700 text-white flex items-center justify-center font-mono text-[9px] font-bold">
            {currentStep}
          </div>
          <span className="font-mono text-xs font-bold text-teal-800">
            {getStepTitle(currentStep)}
          </span>
        </div>

        {/* Right: The Founding Journey Indicator */}
        <div className="flex items-center gap-2 min-w-[140px] justify-end">
          <span className="font-mono text-xs text-teal-800 bg-teal-50 border border-teal-200 px-3 py-1 rounded-full flex items-center gap-1.5 font-medium">
            <Sparkles className="h-3 w-3 text-teal-700 animate-pulse" />
            <span>The Founding Journey</span>
          </span>
        </div>
      </div>
    </header>
  );
}
