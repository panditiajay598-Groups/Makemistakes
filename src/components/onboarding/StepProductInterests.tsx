"use client";

import React, { useState } from "react";
import { Check, ArrowRight, Bot, Cpu, Layers, Layout, Globe, Lock, Workflow, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { StepProductInterestsProps } from "./types";

export default function StepProductInterests({ selectedInterests, onNext }: StepProductInterestsProps) {
  const [selected, setSelected] = useState<string[]>(
    selectedInterests && selectedInterests.length > 0
      ? selectedInterests
      : ["AI SaaS", "Developer Tools", "Productivity"]
  );

  const interestOptions = [
    { id: "AI SaaS", label: "AI SaaS & LLM Apps", icon: Bot },
    { id: "Developer Tools", label: "Developer Tools & APIs", icon: Cpu },
    { id: "Productivity", label: "Productivity & Workspaces", icon: Layout },
    { id: "Fintech", label: "Fintech & Payment Systems", icon: Lock },
    { id: "Infrastructure", label: "Backend Infrastructure", icon: Layers },
    { id: "Web3", label: "Distributed Systems & Cloud", icon: Globe },
    { id: "Automation", label: "AI Agents & Workflows", icon: Workflow },
    { id: "Fullstack Systems", label: "Fullstack Web Systems", icon: Sparkles },
  ];

  const toggleInterest = (id: string) => {
    if (selected.includes(id)) {
      if (selected.length > 1) {
        setSelected(selected.filter((i) => i !== id));
      }
    } else {
      setSelected([...selected, id]);
    }
  };

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
        <span className="font-mono text-xs font-semibold text-teal-800 uppercase tracking-widest bg-teal-50 px-3 py-1 rounded-full border border-teal-200">
          ACT 2 — DISCOVER
        </span>
        <h2 className="font-serif text-3xl sm:text-5xl text-zinc-900 leading-tight">
          Which domains excite you?
        </h2>
        <p className="text-sm text-zinc-600 font-sans max-w-lg mx-auto bg-white border border-zinc-200 p-3.5 rounded-xl italic shadow-sm">
          &quot;Select product domains you want to build missions for.&quot;
        </p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {interestOptions.map((opt) => {
          const Icon = opt.icon;
          const isSelected = selected.includes(opt.id);

          return (
            <motion.div
              key={opt.id}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={() => toggleInterest(opt.id)}
              className={`relative rounded-2xl p-4.5 border transition-all cursor-pointer flex items-center justify-between gap-3 shadow-sm ${
                isSelected
                  ? "bg-white border-teal-700 shadow-md shadow-teal-700/10 ring-2 ring-teal-700/20"
                  : "bg-white border-zinc-200/80 hover:border-zinc-300 hover:bg-zinc-50/50"
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`h-10 w-10 rounded-xl border flex items-center justify-center shrink-0 ${
                    isSelected
                      ? "bg-teal-50 border-teal-200 text-teal-700"
                      : "bg-zinc-50 border-zinc-200 text-zinc-500"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <span className="font-serif text-sm font-bold text-zinc-900">{opt.label}</span>
              </div>

              <div
                className={`h-5 w-5 rounded-lg border flex items-center justify-center shrink-0 transition-colors ${
                  isSelected
                    ? "bg-teal-700 border-teal-700 text-white"
                    : "border-zinc-300 bg-zinc-50 text-transparent"
                }`}
              >
                <Check className="h-3.5 w-3.5 stroke-[3]" />
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Footer CTA */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-zinc-200">
        <div className="flex items-center gap-2 font-mono text-xs text-zinc-600">
          <span className="h-2 w-2 rounded-full bg-teal-600 animate-pulse" />
          <span>
            <strong className="text-teal-800">{selected.length}</strong> domain{selected.length > 1 ? "s" : ""} selected
          </span>
        </div>

        <button
          onClick={() => onNext(selected)}
          className="w-full sm:w-auto group inline-flex h-12 items-center justify-center gap-2 rounded-full bg-teal-700 hover:bg-teal-800 px-8 text-sm font-bold text-white transition-all cursor-pointer border-none shadow-md shadow-teal-700/20"
        >
          <span>Continue</span>
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </button>
      </div>
    </motion.div>
  );
}
