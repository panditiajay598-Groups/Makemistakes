import React from "react";
import { ShieldCheck, Check } from "lucide-react";

interface AcceptanceCriteriaProps {
  criteria: string[];
}

export default function AcceptanceCriteria({ criteria }: AcceptanceCriteriaProps) {
  return (
    <section className="rounded-3xl border border-[#232323] bg-[#111111] p-6 sm:p-8 space-y-6">
      
      <div className="flex items-center justify-between border-b border-[#232323] pb-4">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-emerald-400" />
          <h2 className="font-display text-xl font-bold text-zinc-100 tracking-tight">
            Acceptance & Verification Criteria
          </h2>
        </div>
        <span className="font-mono text-xs text-emerald-400 font-bold bg-emerald-500/10 px-2.5 py-0.5 rounded border border-emerald-500/30">
          Automated Test Gates
        </span>
      </div>

      <div className="space-y-3">
        {criteria.map((item, idx) => (
          <div
            key={idx}
            className="p-4 rounded-2xl bg-[#0d0d0d] border border-[#232323] flex items-start gap-3 font-mono text-xs"
          >
            <div className="h-5 w-5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
              <Check className="h-3 w-3" />
            </div>
            <span className="text-zinc-300 font-sans leading-relaxed">{item}</span>
          </div>
        ))}
      </div>

    </section>
  );
}
