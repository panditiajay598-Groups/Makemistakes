import React from "react";
import { AlertCircle, TrendingDown, Cpu, Layers } from "lucide-react";
import { MissionDetailData } from "./detailTypes";

interface ProblemOverviewProps {
  problem: MissionDetailData["problemStatement"];
}

export default function ProblemOverview({ problem }: ProblemOverviewProps) {
  return (
    <section className="rounded-3xl border border-[#232323] bg-[#111111] p-6 sm:p-8 space-y-6">
      
      {/* Section Header */}
      <div className="flex items-center gap-2 border-b border-[#232323] pb-4">
        <AlertCircle className="h-5 w-5 text-amber-400" />
        <h2 className="font-display text-xl font-bold text-zinc-100 tracking-tight">
          Engineering Specification & Context
        </h2>
      </div>

      <div className="space-y-6">
        
        {/* What Problem Exists */}
        <div className="space-y-2">
          <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
            1. What problem exists?
          </h3>
          <p className="text-sm text-zinc-300 font-sans leading-relaxed">
            {problem.what}
          </p>
        </div>

        {/* Impact Breakdown Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* Business Impact */}
          <div className="p-5 rounded-2xl bg-[#0d0d0d] border border-[#232323] space-y-2">
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-orange-400">
              <TrendingDown className="h-4 w-4 shrink-0" />
              <span>Business Impact</span>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed font-sans">
              {problem.businessImpact}
            </p>
          </div>

          {/* Engineering Impact */}
          <div className="p-5 rounded-2xl bg-[#0d0d0d] border border-[#232323] space-y-2">
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-purple-400">
              <Cpu className="h-4 w-4 shrink-0" />
              <span>Engineering System Impact</span>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed font-sans">
              {problem.engineeringImpact}
            </p>
          </div>

        </div>

        {/* Who Experiences This & How Companies Solve */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          
          <div className="space-y-2">
            <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-zinc-400">
              Who experiences this problem?
            </h3>
            <p className="text-xs text-zinc-300 font-sans leading-relaxed">
              {problem.who}
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-zinc-400">
              How production engineering teams solve it
            </h3>
            <p className="text-xs text-zinc-300 font-sans leading-relaxed">
              {problem.howCompaniesSolve}
            </p>
          </div>

        </div>

      </div>
    </section>
  );
}
