"use client";

import React from "react";
import { ArrowRight, Sparkles, Code2, Layers, Cpu, ShieldCheck, Rocket } from "lucide-react";
import { motion } from "framer-motion";

interface StepWelcomeProps {
  onNext: () => void;
}

export default function StepWelcome({ onNext }: StepWelcomeProps) {
  const bulletPoints = [
    { text: "Solve real problems", icon: Code2 },
    { text: "Build real products", icon: Rocket },
    { text: "Learn from mistakes", icon: Cpu },
    { text: "Ship production features", icon: Layers },
    { text: "Think like an engineer", icon: ShieldCheck },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="space-y-10 max-w-3xl mx-auto py-8 px-4 text-center"
    >
      {/* Eyebrow Badge */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1, duration: 0.4 }}
        className="inline-flex items-center gap-2 rounded-full border border-teal-200 bg-teal-50 px-4 py-1.5 text-xs font-mono font-semibold text-teal-800 shadow-sm"
      >
        <Sparkles className="h-3.5 w-3.5 text-teal-700 animate-pulse" />
        <span className="tracking-wide uppercase">The Founding Journey</span>
      </motion.div>

      {/* Main Heading & Vision Statement */}
      <div className="space-y-6">
        <h1 className="font-serif text-4xl sm:text-6xl md:text-7xl text-zinc-900 leading-[1.08] tracking-tight">
          Welcome to <br className="hidden sm:inline" />
          <span className="text-teal-700">
            MakeMistakes
          </span>
        </h1>

        <div className="space-y-2 text-lg sm:text-2xl font-serif text-zinc-700 tracking-tight">
          <p className="text-teal-800 font-semibold">Stop watching tutorials.</p>
          <p className="text-zinc-900 font-bold">Start building products people actually use.</p>
        </div>
      </div>

      {/* Bullet Points Container */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25, duration: 0.5 }}
        className="relative rounded-3xl border border-zinc-200/80 bg-white p-8 shadow-xl shadow-zinc-200/40 space-y-6 text-left max-w-xl mx-auto overflow-hidden group hover:border-teal-300 transition-colors"
      >
        <p className="font-mono text-xs text-zinc-400 uppercase tracking-widest font-bold border-b border-zinc-100 pb-3">
          Over the next few months you&apos;ll
        </p>

        <ul className="space-y-4">
          {bulletPoints.map((item, idx) => {
            const Icon = item.icon;
            return (
              <motion.li
                key={idx}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + idx * 0.08, duration: 0.4 }}
                className="flex items-center gap-3 text-sm sm:text-base text-zinc-800 font-sans"
              >
                <div className="h-8 w-8 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-700 shrink-0">
                  <Icon className="h-4 w-4" />
                </div>
                <span className="font-semibold text-zinc-900">{item.text}</span>
              </motion.li>
            );
          })}
        </ul>

        <div className="pt-4 border-t border-zinc-100 text-xs font-mono text-teal-800 flex items-center gap-2 font-medium">
          <span className="h-2 w-2 rounded-full bg-teal-600 animate-ping" />
          <span>Your first day as a Product Engineer starts here.</span>
        </div>
      </motion.div>

      {/* Primary CTA */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.4 }}
        className="pt-2 flex flex-col items-center gap-3"
      >
        <button
          onClick={onNext}
          className="group relative inline-flex h-13 items-center justify-center gap-3 rounded-full bg-teal-700 hover:bg-teal-800 px-10 text-base font-bold text-white transition-all active:scale-98 cursor-pointer shadow-lg shadow-teal-700/20 border-none font-sans"
        >
          <span>Begin Journey</span>
          <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
        </button>
      </motion.div>
    </motion.div>
  );
}
