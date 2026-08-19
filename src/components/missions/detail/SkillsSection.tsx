import React from "react";
import { Zap, Award } from "lucide-react";

interface SkillsSectionProps {
  skills: string[];
}

export default function SkillsSection({ skills }: SkillsSectionProps) {
  return (
    <section className="rounded-3xl border border-[#232323] bg-[#111111] p-6 sm:p-8 space-y-6">
      
      <div className="flex items-center gap-2 border-b border-[#232323] pb-4">
        <Zap className="h-5 w-5 text-amber-400" />
        <h2 className="font-display text-xl font-bold text-zinc-100 tracking-tight">
          Engineering Skills Demonstrated
        </h2>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {skills.map((skill) => (
          <div
            key={skill}
            className="p-4 rounded-2xl bg-[#0d0d0d] border border-[#232323] hover:border-amber-500/30 transition-colors space-y-1.5"
          >
            <div className="flex items-center gap-1.5 text-amber-400 font-mono text-xs font-bold">
              <Award className="h-3.5 w-3.5" />
              <span>Verified Skill</span>
            </div>
            <p className="text-xs text-zinc-200 font-display font-semibold truncate">
              {skill}
            </p>
          </div>
        ))}
      </div>

    </section>
  );
}
