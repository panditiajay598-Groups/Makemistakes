"use client";

import React from "react";
import { ArrowRight, Sparkles, Target, Zap, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";

interface StepWhyMakeMistakesExistsProps {
  onNext: () => void;
}

export default function StepWhyMakeMistakesExists({ onNext }: StepWhyMakeMistakesExistsProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="space-y-8 max-w-3xl mx-auto py-8 px-4 text-center"
    >
      {/* Badge */}
      <div className="inline-flex items-center gap-2 rounded-full border border-teal-200 bg-teal-50 px-4 py-1.5 text-xs font-mono font-semibold text-teal-800 shadow-sm">
        <Target className="h-3.5 w-3.5 text-teal-700" />
        <span>ACT 1 — BELIEVE</span>
      </div>

      {/* Main Title */}
      <h2 className="font-serif text-3xl sm:text-5xl text-zinc-900 leading-tight">
        Why MakeMistakes Exists
      </h2>

      {/* Core Message Card */}
      <div className="bg-white border border-zinc-200/80 p-8 rounded-3xl text-left space-y-6 shadow-xl shadow-zinc-200/40 relative overflow-hidden">
        <p className="text-zinc-400 font-mono text-xs uppercase tracking-wider font-bold border-b border-zinc-100 pb-3">
          The Problem With Learning Code Today
        </p>

        <div className="space-y-4 text-base sm:text-lg text-zinc-700 font-sans leading-relaxed">
          <p>
            Most students spend years <strong className="text-teal-800 font-bold">watching tutorials</strong>, copying projects line by line, memorizing syntax, and still struggle when asked to build a real application from scratch.
          </p>
          <p>
            We created <strong className="text-zinc-900 font-bold">MakeMistakes</strong> to change that forever.
          </p>
          <p className="text-zinc-800">
            Here, you won&apos;t memorize technology stack definitions. You&apos;ll build products, make mistakes, debug production failures, and improve as an engineer every single day.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 border-t border-zinc-100 text-xs font-mono">
          <div className="bg-teal-50/50 p-3 rounded-xl border border-teal-200/60 flex items-center gap-2 text-teal-900 font-medium">
            <Zap className="h-4 w-4 text-teal-700 shrink-0" />
            <span>Zero Tutorial Hell</span>
          </div>
          <div className="bg-teal-50/50 p-3 rounded-xl border border-teal-200/60 flex items-center gap-2 text-teal-900 font-medium">
            <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
            <span>Real Software Products</span>
          </div>
          <div className="bg-teal-50/50 p-3 rounded-xl border border-teal-200/60 flex items-center gap-2 text-teal-900 font-medium">
            <Sparkles className="h-4 w-4 text-teal-700 shrink-0" />
            <span>Senior AI Mentorship</span>
          </div>
        </div>
      </div>

      {/* Primary Action Button */}
      <div className="pt-2">
        <button
          onClick={onNext}
          className="group inline-flex h-13 items-center justify-center gap-3 rounded-full bg-teal-700 hover:bg-teal-800 px-8 text-sm font-bold text-white transition-all cursor-pointer shadow-lg shadow-teal-700/20 border-none font-sans"
        >
          <span>Continue</span>
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </button>
      </div>
    </motion.div>
  );
}
