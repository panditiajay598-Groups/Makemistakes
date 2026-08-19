import React from "react";
import { BarChart2, Star, Clock, AlertTriangle, Cpu } from "lucide-react";
import { MissionDetailData } from "./detailTypes";

interface MissionStatsProps {
  stats: MissionDetailData["stats"];
}

export default function MissionStats({ stats }: MissionStatsProps) {
  return (
    <section className="rounded-3xl border border-[#232323] bg-[#111111] p-6 sm:p-8 space-y-6">
      
      <div className="flex items-center justify-between border-b border-[#232323] pb-4">
        <div className="flex items-center gap-2">
          <BarChart2 className="h-5 w-5 text-amber-400" />
          <h2 className="font-display text-xl font-bold text-zinc-100 tracking-tight">
            Mission Analytics & Benchmarks
          </h2>
        </div>
        <span className="font-mono text-xs text-zinc-500 hidden sm:inline">
          Live Platform Insights
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 font-mono">
        
        <div className="p-4 rounded-2xl bg-[#0d0d0d] border border-[#232323] space-y-1">
          <span className="text-[10px] text-zinc-500 uppercase font-bold">COMPLETION RATE</span>
          <div className="text-xl font-bold text-emerald-400">{stats.completionRate}</div>
        </div>

        <div className="p-4 rounded-2xl bg-[#0d0d0d] border border-[#232323] space-y-1">
          <span className="text-[10px] text-zinc-500 uppercase font-bold">AVG TIME SPENT</span>
          <div className="text-xl font-bold text-zinc-100">{stats.avgTimeSpent}</div>
        </div>

        <div className="p-4 rounded-2xl bg-[#0d0d0d] border border-[#232323] space-y-1">
          <span className="text-[10px] text-zinc-500 uppercase font-bold">STUDENT RATING</span>
          <div className="text-xl font-bold text-amber-400 flex items-center gap-1">
            <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
            <span>4.9 / 5.0</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#0d0d0d] border border-[#232323] space-y-1">
          <span className="text-[10px] text-zinc-500 uppercase font-bold">DIFFICULTY RATING</span>
          <div className="text-xl font-bold text-zinc-100">{stats.difficultyRating}</div>
        </div>

      </div>

      {/* Common mistake callout */}
      <div className="p-4 rounded-2xl bg-orange-500/10 border border-orange-500/30 flex items-start gap-3 text-xs">
        <AlertTriangle className="h-5 w-5 text-orange-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <span className="font-mono font-bold text-orange-400 uppercase text-[11px]">Most Common Engineering Mistake</span>
          <p className="text-zinc-300 font-sans leading-relaxed">
            {stats.commonMistake}
          </p>
        </div>
      </div>

    </section>
  );
}
