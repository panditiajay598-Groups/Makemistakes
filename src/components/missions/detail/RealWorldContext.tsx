import React from "react";
import { Building2, Activity } from "lucide-react";
import { CompanyContext } from "./detailTypes";

interface RealWorldContextProps {
  companies: CompanyContext[];
}

export default function RealWorldContext({ companies }: RealWorldContextProps) {
  return (
    <section className="rounded-3xl border border-[#232323] bg-[#111111] p-6 sm:p-8 space-y-6">
      
      <div className="flex items-center justify-between border-b border-[#232323] pb-4">
        <div className="flex items-center gap-2">
          <Building2 className="h-5 w-5 text-amber-400" />
          <h2 className="font-display text-xl font-bold text-zinc-100 tracking-tight">
            Real-World Production Context
          </h2>
        </div>
        <span className="font-mono text-xs text-zinc-500 hidden sm:inline">
          Used by High-Growth Scale-Ups & Tech Giants
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {companies.map((company) => (
          <div
            key={company.name}
            className="p-5 rounded-2xl bg-[#0d0d0d] border border-[#232323] hover:border-amber-500/30 transition-colors space-y-3 group"
          >
            <div className="flex items-center justify-between">
              <span className="font-display font-bold text-zinc-100 text-base group-hover:text-amber-400 transition-colors">
                {company.name}
              </span>
              <span className="font-mono text-[10px] text-amber-400 font-bold bg-amber-500/10 px-2.5 py-0.5 rounded border border-amber-500/20 flex items-center gap-1">
                <Activity className="h-3 w-3" />
                {company.scaleMetric}
              </span>
            </div>

            <p className="text-xs text-zinc-400 font-sans leading-relaxed">
              {company.description}
            </p>
          </div>
        ))}
      </div>

    </section>
  );
}
