"use client";

import React from "react";
import { ArrowRight, Bot, Check, Sparkles, Code2, Cpu, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";

interface StepMeetNovaV4Props {
  onNext: () => void;
}

export default function StepMeetNovaV4({ onNext }: StepMeetNovaV4Props) {
  const specializations = [
    "Artificial Intelligence & Multi-Agent Systems",
    "Backend & Distributed Infrastructure",
    "Frontend Engineering & UI Systems",
    "System Design & Database Architecture",
    "Production Debugging & Root Cause Analysis",
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="space-y-8 max-w-2xl mx-auto py-8 px-4 text-center"
    >
      {/* Eyebrow */}
      <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-4 py-1.5 text-xs font-mono font-medium text-amber-400">
        <Bot className="h-3.5 w-3.5" />
        <span>Senior AI Engineering Mentor</span>
      </div>

      {/* Main Mentor Card */}
      <div className="bg-zinc-900/60 border border-amber-500/30 p-8 rounded-3xl text-left space-y-6 shadow-2xl backdrop-blur-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Mentor Header Info */}
        <div className="flex items-center gap-4 border-b border-zinc-800 pb-5">
          <div className="relative">
            <div className="h-16 w-16 rounded-2xl bg-amber-500/10 border border-amber-500/40 flex items-center justify-center font-mono font-bold text-amber-400 text-xl shadow-lg shadow-amber-500/20">
              Nova
            </div>
            <span className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full bg-emerald-400 border-2 border-zinc-900 animate-pulse" />
          </div>

          <div>
            <h3 className="font-display text-2xl font-bold text-zinc-50">Nova</h3>
            <p className="text-xs font-mono text-amber-400">Senior Product Engineering Mentor @ MakeMistakes</p>
            <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 inline-block mt-1">
              🟢 ONLINE • Ready for Sprint 1
            </span>
          </div>
        </div>

        {/* Mentor Quote */}
        <div className="bg-zinc-950/80 p-4 rounded-2xl border border-zinc-800/80 space-y-2">
          <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest block">Mentor Manifesto</span>
          <p className="text-sm font-sans text-amber-200 italic leading-relaxed">
            "I won't just give you raw code answers. I will review your decisions, challenge your architectural assumptions, and help you think like an exceptional product engineer."
          </p>
        </div>

        {/* Specializations List */}
        <div className="space-y-3">
          <span className="text-xs font-mono text-zinc-400 uppercase tracking-wider font-bold block">
            Specializes In
          </span>

          <ul className="space-y-2 text-xs font-sans text-zinc-300">
            {specializations.map((spec, i) => (
              <li key={i} className="flex items-center gap-2.5">
                <Check className="h-3.5 w-3.5 text-amber-400 shrink-0 stroke-[3]" />
                <span>{spec}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="pt-2">
        <button
          onClick={onNext}
          className="group inline-flex h-13 items-center justify-center gap-3 rounded-2xl bg-amber-500 hover:bg-amber-400 px-8 text-sm font-bold text-zinc-950 transition-all cursor-pointer shadow-lg shadow-amber-500/20 border-none font-sans"
        >
          <span>Continue to Act 2</span>
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </button>
      </div>
    </motion.div>
  );
}
