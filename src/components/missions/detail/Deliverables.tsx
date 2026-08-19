import React from "react";
import { FolderCheck, CheckCircle2 } from "lucide-react";

interface DeliverablesProps {
  deliverables: string[];
}

export default function Deliverables({ deliverables }: DeliverablesProps) {
  return (
    <section className="rounded-3xl border border-[#232323] bg-[#111111] p-6 sm:p-8 space-y-6">
      
      <div className="flex items-center gap-2 border-b border-[#232323] pb-4">
        <FolderCheck className="h-5 w-5 text-amber-400" />
        <h2 className="font-display text-xl font-bold text-zinc-100 tracking-tight">
          Student Deliverables & Proof of Work Artifacts
        </h2>
      </div>

      <div className="space-y-3">
        {deliverables.map((item, idx) => (
          <div
            key={idx}
            className="p-4 rounded-2xl bg-[#0d0d0d] border border-[#232323] flex items-center justify-between gap-4 font-mono text-xs"
          >
            <div className="flex items-center gap-3">
              <span className="h-6 w-6 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center font-bold text-[11px]">
                {idx + 1}
              </span>
              <span className="text-zinc-200 font-sans font-medium">{item}</span>
            </div>
            <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-bold shrink-0">
              Required
            </span>
          </div>
        ))}
      </div>

    </section>
  );
}
