"use client";

import React from "react";
import { ArrowRight, CheckCircle2, Layers, Cpu, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";

interface StepBuildingJourneyProps {
  onNext: () => void;
}

export default function StepBuildingJourney({ onNext }: StepBuildingJourneyProps) {
  const steps = [
    { title: "Sprint 1: Problem Discovery & Architecture", desc: "Map business specs, write API schemas, and design databases.", icon: Layers },
    { title: "Sprint 2: Production Code & Debugging", desc: "Build backend routes, handle auth, fix performance bottlenecks.", icon: Cpu },
    { title: "Sprint 3: Proof-of-Work Verification", desc: "Run automated telemetry suites and publish verified code portfolio.", icon: ShieldCheck },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
      className="space-y-8 max-w-3xl mx-auto py-8 px-4 text-center"
    >
      <div className="space-y-3">
        <span className="font-mono text-xs font-semibold text-teal-800 uppercase tracking-widest bg-teal-50 px-3 py-1 rounded-full border border-teal-200">
          YOUR BUILDING JOURNEY
        </span>
        <h2 className="font-serif text-3xl sm:text-5xl text-zinc-900 leading-tight">
          How You Will Build &amp; Graduate
        </h2>
        <p className="text-sm sm:text-base text-zinc-600 font-sans max-w-lg mx-auto">
          3 structured sprints from zero to a verified production portfolio.
        </p>
      </div>

      <div className="space-y-4 text-left">
        {steps.map((s, idx) => {
          const Icon = s.icon;
          return (
            <div key={idx} className="bg-white border border-zinc-200/80 p-6 rounded-3xl space-y-2 shadow-xl shadow-zinc-200/40 flex items-start gap-4">
              <div className="h-10 w-10 rounded-xl bg-teal-50 border border-teal-200 text-teal-700 flex items-center justify-center shrink-0">
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-serif text-base font-bold text-zinc-900">{s.title}</h3>
                <p className="text-xs text-zinc-600 font-sans leading-relaxed">{s.desc}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="pt-4">
        <button
          onClick={onNext}
          className="group inline-flex h-12 items-center justify-center gap-2 rounded-full bg-teal-700 hover:bg-teal-800 px-8 text-sm font-bold text-white transition-all cursor-pointer border-none shadow-md shadow-teal-700/20"
        >
          <span>View Engineering Roadmap</span>
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </button>
      </div>
    </motion.div>
  );
}
