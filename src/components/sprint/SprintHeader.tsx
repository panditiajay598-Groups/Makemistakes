"use client";

import React from "react";
import Link from "next/link";
import {
  Play,
  Search,
  ArrowRight,
  ChevronDown,
  Command,
  Terminal,
} from "lucide-react";

interface SprintHeaderProps {
  sprintNumber?: number;
  sprintTitle?: string;
  activeSection: string;
  progressPercent: number;
  onResume: () => void;
  onOpenSearch?: () => void;
}

export default function SprintHeader({
  sprintNumber = 2,
  sprintTitle = "Solution Design & Architecture",
  activeSection,
  progressPercent,
  onResume,
  onOpenSearch,
}: SprintHeaderProps) {
  return (
    <header className="h-16 border-b border-zinc-200/80 bg-[#FAF9F5]/90 backdrop-blur-xl px-4 sm:px-6 flex items-center justify-between shrink-0 sticky top-0 z-40">
      {/* Left: Brand & Sprint Selector */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard" className="flex items-center gap-2.5 no-underline group">
          <div className="h-7 w-7 rounded-lg bg-teal-700 flex items-center justify-center text-white font-black text-xs font-mono shadow-sm">
            <Terminal className="h-4 w-4 text-white" />
          </div>
          <span className="font-bold text-sm text-zinc-900 tracking-tight hidden sm:inline font-sans">
            Make<span className="text-teal-700">Mistakes</span>
          </span>
        </Link>

        <div className="h-4 w-px bg-zinc-200 hidden sm:block" />

        {/* Sprint Selector Dropdown Badge */}
        <div className="flex items-center gap-2 bg-white border border-zinc-200 px-3 py-1.5 rounded-full text-xs font-mono shadow-sm">
          <span className="h-2 w-2 rounded-full bg-teal-600 animate-pulse" />
          <span className="text-zinc-500 font-medium">Sprint {sprintNumber}:</span>
          <span className="font-bold text-teal-800 truncate max-w-[180px] sm:max-w-[240px]">
            {sprintTitle}
          </span>
          <ChevronDown className="h-3.5 w-3.5 text-zinc-400" />
        </div>
      </div>

      {/* Center: Search Trigger (Cmd+K) */}
      <div className="hidden md:flex items-center">
        <button
          onClick={onOpenSearch}
          className="flex items-center gap-3 bg-white hover:bg-zinc-50 border border-zinc-200 px-3.5 py-1.5 rounded-full text-xs font-mono text-zinc-500 hover:text-zinc-900 transition-all cursor-pointer w-64 justify-between shadow-sm"
        >
          <div className="flex items-center gap-2">
            <Search className="h-3.5 w-3.5 text-zinc-400" />
            <span>Search workspace &amp; docs...</span>
          </div>
          <kbd className="bg-zinc-100 border border-zinc-200 text-[10px] px-1.5 py-0.5 rounded font-mono text-zinc-600 flex items-center gap-0.5">
            <Command className="h-2.5 w-2.5" /> K
          </kbd>
        </button>
      </div>

      {/* Right: Progress & Resume Sprint CTA */}
      <div className="flex items-center gap-3">
        <div className="hidden lg:flex items-center gap-3 bg-white border border-zinc-200 px-3 py-1.5 rounded-full text-xs font-mono shadow-sm">
          <span className="text-zinc-500">Progress:</span>
          <div className="w-16 h-1.5 bg-zinc-100 rounded-full overflow-hidden border border-zinc-200">
            <div
              className="h-full bg-teal-700 rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <span className="font-bold text-teal-800">{progressPercent}%</span>
        </div>

        {/* Primary Resume Sprint Button */}
        <button
          onClick={onResume}
          className="group relative inline-flex h-9 items-center justify-center gap-2 rounded-full bg-teal-700 hover:bg-teal-800 px-4 text-xs font-bold text-white font-sans transition-all cursor-pointer shadow-md shadow-teal-700/20 border-none"
        >
          <Play className="h-3.5 w-3.5 fill-current" />
          <span>Resume Sprint</span>
          <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
        </button>
      </div>
    </header>
  );
}
