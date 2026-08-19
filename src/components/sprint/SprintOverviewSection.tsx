"use client";

import React from "react";
import {
  Play,
  ArrowRight,
  Clock,
  Sparkles,
} from "lucide-react";
import { motion } from "framer-motion";

interface SprintOverviewSectionProps {
  sprintNumber?: number;
  sprintTitle?: string;
  progressPercent?: number;
  currentTaskTitle?: string;
  estimatedTime?: string;
  deadline?: string;
  onResume: () => void;
}

export default function SprintOverviewSection({
  sprintNumber = 2,
  sprintTitle = "Solution Design & Architecture",
  progressPercent = 25,
  currentTaskTitle = "Design System Architecture",
  estimatedTime = "45 Minutes Remaining",
  deadline = "Today",
  onResume,
}: SprintOverviewSectionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6 max-w-4xl mx-auto py-4 font-sans text-left"
    >
      {/* Hero Overview Card */}
      <div className="rounded-3xl border border-teal-200/80 bg-white p-6 sm:p-8 space-y-6 shadow-xl shadow-zinc-200/40 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-100 pb-4">
          <div className="flex items-center gap-2 font-mono text-xs">
            <span className="bg-teal-50 border border-teal-200 text-teal-800 font-bold px-3 py-1 rounded-full flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-teal-700" />
              Sprint {sprintNumber} Landing
            </span>
            <span className="text-zinc-500">Status: <strong className="text-emerald-700">In Progress</strong></span>
          </div>

          <div className="flex items-center gap-2 font-mono text-xs text-teal-800 bg-teal-50 px-3 py-1 rounded-full border border-teal-200 font-bold">
            <Clock className="h-3.5 w-3.5 text-teal-700" />
            <span>{estimatedTime}</span>
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="font-serif text-2xl sm:text-4xl font-bold text-zinc-900 tracking-tight">
            Sprint {sprintNumber}: {sprintTitle}
          </h1>
          <p className="text-sm text-zinc-600 font-sans leading-relaxed">
            Transform validated customer problems into robust system architectures, API endpoints, and database schemas.
          </p>
        </div>

        {/* Sprint Overview Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs pt-2">
          <div className="bg-zinc-50 p-3.5 rounded-2xl border border-zinc-200 space-y-1">
            <span className="text-[10px] text-zinc-500 uppercase block">Progress</span>
            <span className="text-base font-bold text-teal-700">{progressPercent}%</span>
          </div>

          <div className="bg-zinc-50 p-3.5 rounded-2xl border border-zinc-200 space-y-1">
            <span className="text-[10px] text-zinc-500 uppercase block">Current Task</span>
            <span className="text-xs font-bold text-zinc-900 truncate block">{currentTaskTitle}</span>
          </div>

          <div className="bg-zinc-50 p-3.5 rounded-2xl border border-zinc-200 space-y-1">
            <span className="text-[10px] text-zinc-500 uppercase block">Estimated Time</span>
            <span className="text-xs font-bold text-emerald-700 block">{estimatedTime}</span>
          </div>

          <div className="bg-zinc-50 p-3.5 rounded-2xl border border-zinc-200 space-y-1">
            <span className="text-[10px] text-zinc-500 uppercase block">Deadline</span>
            <span className="text-xs font-bold text-zinc-800 block">{deadline}</span>
          </div>
        </div>

        {/* Primary CTA */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-zinc-100">
          <div className="text-xs font-mono text-zinc-500">
            <span>Next Task: <strong className="text-zinc-900 font-bold">Task 2 • {currentTaskTitle}</strong></span>
          </div>

          <button
            onClick={onResume}
            className="group relative inline-flex h-13 w-full sm:w-auto items-center justify-center gap-3 rounded-full bg-teal-700 hover:bg-teal-800 px-8 text-sm font-bold text-white transition-all cursor-pointer shadow-lg shadow-teal-700/20 border-none font-sans"
          >
            <Play className="h-4 w-4 fill-current" />
            <span>Resume Sprint</span>
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
