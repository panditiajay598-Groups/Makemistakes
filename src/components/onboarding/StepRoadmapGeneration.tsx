"use client";

import React, { useState, useEffect } from "react";
import { Check, Sparkles, Bot, Layers, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { StepRoadmapGenProps } from "./types";

export default function StepRoadmapGeneration({ onNext }: StepRoadmapGenProps) {
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [progress, setProgress] = useState(0);

  const steps = [
    "Understanding your goals",
    "Analyzing assessment",
    "Identifying strengths",
    "Finding weaknesses",
    "Creating roadmap",
  ];

  useEffect(() => {
    let currentStep = 0;
    const interval = setInterval(() => {
      if (currentStep < steps.length) {
        setCompletedSteps((prev) => [...prev, currentStep]);
        currentStep++;
        setProgress(Math.round((currentStep / steps.length) * 100));
      } else {
        clearInterval(interval);
        setTimeout(() => {
          onNext();
        }, 800);
      }
    }, 900);

    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.4 }}
      className="space-y-10 max-w-xl mx-auto py-10 px-4 text-center"
    >
      {/* Animated AI Core Graphic */}
      <div className="relative h-24 w-24 mx-auto flex items-center justify-center">
        <div className="absolute inset-0 rounded-3xl bg-amber-500/20 blur-xl animate-pulse" />
        <div className="h-20 w-20 rounded-2xl bg-zinc-900 border border-amber-500/50 flex items-center justify-center text-amber-400 shadow-2xl relative z-10">
          <Bot className="h-10 w-10 animate-bounce" />
        </div>
      </div>

      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3.5 py-1 text-xs font-mono font-medium text-amber-400">
          <Sparkles className="h-3.5 w-3.5 animate-spin text-amber-400" />
          <span>GENERATING ROADMAP</span>
        </div>
        <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-zinc-50 tracking-tight">
          Building Your Journey
        </h2>
        <p className="text-xs sm:text-sm text-zinc-400 font-sans">
          Synthesizing your skill assessment, product interests, and time commitment.
        </p>
      </div>

      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-mono text-zinc-400">
          <span>Synthesizing product engineering path...</span>
          <span className="text-amber-400 font-bold">{progress}%</span>
        </div>
        <div className="h-2 w-full bg-zinc-900 rounded-full overflow-hidden border border-zinc-800">
          <motion.div
            className="h-full bg-gradient-to-r from-amber-500 via-amber-400 to-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.5)]"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      {/* Checklist Steps */}
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6 backdrop-blur-xl space-y-3.5 text-left">
        {steps.map((text, idx) => {
          const isDone = completedSteps.includes(idx);
          const isCurrent = completedSteps.length === idx;

          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="flex items-center justify-between text-sm font-sans"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`h-6 w-6 rounded-full flex items-center justify-center font-mono text-xs transition-all ${
                    isDone
                      ? "bg-emerald-500/20 border border-emerald-500/40 text-emerald-400"
                      : isCurrent
                      ? "bg-amber-500/20 border border-amber-500/40 text-amber-400 animate-pulse"
                      : "bg-zinc-950 border border-zinc-800 text-zinc-600"
                  }`}
                >
                  {isDone ? <Check className="h-3.5 w-3.5 stroke-[3]" /> : idx + 1}
                </div>
                <span
                  className={`font-medium transition-colors ${
                    isDone ? "text-zinc-200" : isCurrent ? "text-amber-300 font-bold" : "text-zinc-500"
                  }`}
                >
                  {text}
                </span>
              </div>

              {isDone && (
                <span className="font-mono text-xs text-emerald-400 font-semibold">✓ Done</span>
              )}
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
