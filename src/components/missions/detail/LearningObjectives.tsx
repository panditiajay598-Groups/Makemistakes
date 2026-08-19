import React from "react";
import { CheckCircle2, Target } from "lucide-react";

interface LearningObjectivesProps {
  objectives: string[];
}

export default function LearningObjectives({ objectives }: LearningObjectivesProps) {
  return (
    <section className="rounded-3xl border border-[#232323] bg-[#111111] p-6 sm:p-8 space-y-6">
      
      <div className="flex items-center gap-2 border-b border-[#232323] pb-4">
        <Target className="h-5 w-5 text-amber-400" />
        <h2 className="font-display text-xl font-bold text-zinc-100 tracking-tight">
          Learning Objectives & Engineering Outcomes
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {objectives.map((obj, idx) => (
          <div
            key={idx}
            className="p-4 rounded-2xl bg-[#0d0d0d] border border-[#232323] flex items-start gap-3 text-xs font-sans"
          >
            <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
            <span className="text-zinc-300 font-medium leading-relaxed">{obj}</span>
          </div>
        ))}
      </div>

    </section>
  );
}
