import React from "react";
import { Bot, Sparkles, MessageSquare, CheckCircle2, ShieldAlert } from "lucide-react";

interface AICoachPreviewProps {
  guidelines: string[];
}

export default function AICoachPreview({ guidelines }: AICoachPreviewProps) {
  return (
    <section className="rounded-3xl border border-amber-500/30 bg-[#111111] p-6 sm:p-8 space-y-6 shadow-xl relative overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#232323] pb-4 relative z-10">
        <div className="flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Bot className="h-5 w-5" />
          </div>
          <div>
            <h2 className="font-display text-xl font-bold text-zinc-100 tracking-tight flex items-center gap-2">
              Senior AI Engineering Coach
            </h2>
            <p className="text-xs text-zinc-400 font-mono">
              Socratic Teaching Style • Code Reviews & Assumptions Verification
            </p>
          </div>
        </div>

        <span className="font-mono text-xs font-bold text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20 self-start sm:self-auto flex items-center gap-1.5">
          <Sparkles className="h-3.5 w-3.5" /> Active in Workspace
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10">
        
        {/* Style callout */}
        <div className="p-5 rounded-2xl bg-[#0d0d0d] border border-[#232323] space-y-3">
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-amber-400">
            <MessageSquare className="h-4 w-4" />
            <span>How Your AI Coach Interacts</span>
          </div>
          <p className="text-xs text-zinc-300 font-sans leading-relaxed">
            Your Senior AI Coach will never give raw copy-paste code solutions. Instead, it reviews your implementation, asks probing questions about concurrency edge cases, and provides progressive hints.
          </p>
        </div>

        {/* Guidelines list */}
        <div className="space-y-2">
          {guidelines.map((g, i) => (
            <div
              key={i}
              className="p-3 rounded-xl bg-[#0d0d0d] border border-[#232323] flex items-center gap-2.5 text-xs font-mono text-zinc-300"
            >
              <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
              <span>{g}</span>
            </div>
          ))}
        </div>

      </div>

    </section>
  );
}
