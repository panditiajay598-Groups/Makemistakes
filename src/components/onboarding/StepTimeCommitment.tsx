"use client";

import React, { useState, useEffect } from "react";
import { Clock, Zap, Flame, Rocket, Check, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { StepTimeCommitmentProps } from "./types";

export default function StepTimeCommitment({ selectedTime, onNext }: StepTimeCommitmentProps) {
  const [current, setCurrent] = useState(selectedTime || "10–20 Hours");

  const commitments = [
    {
      id: "2–4 Hours",
      label: "2–4 Hours / week",
      pace: "Casual Builder",
      desc: "Great for busy professionals or students exploring product engineering at a steady weekend pace.",
      icon: Clock,
      color: "text-blue-400 border-blue-500/30 bg-blue-500/10",
      key: "1",
    },
    {
      id: "5–10 Hours",
      label: "5–10 Hours / week",
      pace: "Steady Engineer",
      desc: "Recommended standard pace. Build and ship 1 to 2 core product features every week.",
      icon: Zap,
      color: "text-emerald-400 border-emerald-500/30 bg-emerald-500/10",
      key: "2",
    },
    {
      id: "10–20 Hours",
      label: "10–20 Hours / week",
      pace: "Intensive Sprint",
      desc: "Fast-track journey. Tackle production bugs, database scaling, and full-stack systems rapidly.",
      icon: Flame,
      color: "text-amber-400 border-amber-500/30 bg-amber-500/10",
      key: "3",
    },
    {
      id: "20+ Hours",
      label: "20+ Hours / week",
      pace: "Founding Mode",
      desc: "Full immersive velocity. Prepare for startup launching or elite engineering role placement.",
      icon: Rocket,
      color: "text-purple-400 border-purple-500/30 bg-purple-500/10",
      key: "4",
    },
  ];

  // Keyboard listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const found = commitments.find((c) => c.key === e.key);
      if (found) {
        setCurrent(found.id);
      } else if (e.key === "Enter" && current) {
        onNext(current);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [current, onNext, commitments]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4 }}
      className="space-y-8 max-w-3xl mx-auto py-4 px-4"
    >
      {/* Header */}
      <div className="text-center space-y-3">
        <span className="font-mono text-xs font-semibold text-amber-400 uppercase tracking-widest bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
          Pacing & Cadence
        </span>
        <h2 className="font-display text-3xl sm:text-5xl font-extrabold text-zinc-50 tracking-tight">
          How much time can you dedicate every week?
        </h2>
        <p className="text-sm text-zinc-400 font-sans max-w-md mx-auto">
          We adjust your mission schedules and weekly roadmap goals according to your availability.
        </p>
      </div>

      {/* Options List */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {commitments.map((item) => {
          const Icon = item.icon;
          const isSelected = current === item.id;

          return (
            <motion.div
              key={item.id}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={() => setCurrent(item.id)}
              className={`relative rounded-2xl p-5 border transition-all cursor-pointer flex flex-col justify-between space-y-4 ${
                isSelected
                  ? "bg-zinc-900 border-amber-500/80 shadow-xl shadow-amber-500/10 ring-1 ring-amber-500/40"
                  : "bg-zinc-950/60 border-zinc-800/80 hover:border-zinc-700 hover:bg-zinc-900/40"
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className={`h-11 w-11 rounded-xl border flex items-center justify-center ${item.color}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-display text-base font-bold text-zinc-100">{item.label}</h3>
                    <span className="font-mono text-[10px] text-amber-400 font-semibold uppercase bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                      {item.pace}
                    </span>
                  </div>
                </div>

                <div
                  className={`h-6 w-6 rounded-full border flex items-center justify-center shrink-0 transition-colors ${
                    isSelected
                      ? "bg-amber-500 border-amber-400 text-zinc-950"
                      : "border-zinc-800 bg-zinc-900 text-transparent"
                  }`}
                >
                  <Check className="h-3.5 w-3.5 stroke-[3]" />
                </div>
              </div>

              <p className="text-xs text-zinc-400 font-sans leading-relaxed">{item.desc}</p>
            </motion.div>
          );
        })}
      </div>

      {/* Footer CTA */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-zinc-900">
        <span className="font-mono text-xs text-zinc-500">
          Press [1-4] or select an option to set weekly schedule
        </span>
        <button
          onClick={() => onNext(current)}
          className="w-full sm:w-auto group inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-amber-500 hover:bg-amber-400 px-8 text-sm font-bold text-zinc-950 transition-all cursor-pointer border-none"
        >
          <span>Continue</span>
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </button>
      </div>
    </motion.div>
  );
}
