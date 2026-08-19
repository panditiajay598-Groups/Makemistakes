import React from "react";
import { Cpu, Server, Code2, Database } from "lucide-react";
import { TechnologyDetail } from "./detailTypes";
import TechTag from "../TechTag";

interface TechnologyGridProps {
  technologies: TechnologyDetail[];
}

export default function TechnologyGrid({ technologies }: TechnologyGridProps) {
  return (
    <section className="rounded-3xl border border-[#232323] bg-[#111111] p-6 sm:p-8 space-y-6">
      
      <div className="flex items-center gap-2 border-b border-[#232323] pb-4">
        <Cpu className="h-5 w-5 text-amber-400" />
        <h2 className="font-display text-xl font-bold text-zinc-100 tracking-tight">
          Technologies & Ecosystem Tools
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {technologies.map((tech) => (
          <div
            key={tech.name}
            className="p-5 rounded-2xl bg-[#0d0d0d] border border-[#232323] hover:border-amber-500/30 transition-colors space-y-2.5"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TechTag name={tech.name} className="px-3 py-1 text-xs font-bold" />
                <span className="font-mono text-xs text-zinc-400 font-semibold">{tech.role}</span>
              </div>
              <span className="font-mono text-[10px] text-zinc-500 bg-[#161616] px-2 py-0.5 rounded border border-[#242424]">
                {tech.category}
              </span>
            </div>

            <p className="text-xs text-zinc-300 font-sans leading-relaxed">
              {tech.whyUsed}
            </p>
          </div>
        ))}
      </div>

    </section>
  );
}
