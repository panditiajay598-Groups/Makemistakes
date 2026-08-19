"use client";

import React, { useState } from "react";
import { Check, ArrowRight, Briefcase, Cpu, Rocket, Sparkles, FolderCode, Users, Globe, Terminal } from "lucide-react";
import { motion } from "framer-motion";
import { StepGoalsProps } from "./types";

export default function StepGoals({ selectedGoals, onNext }: StepGoalsProps) {
  const [selected, setSelected] = useState<string[]>(
    selectedGoals && selectedGoals.length > 0
      ? selectedGoals
      : ["Get My First Job", "Build Products Used By Thousands"]
  );

  const goalOptions = [
    { id: "Get My First Job", label: "Get My First Job", icon: Briefcase, color: "text-teal-700" },
    { id: "Become Full Stack Engineer", label: "Become Full Stack Engineer", icon: Cpu, color: "text-blue-700" },
    { id: "Build My Startup", label: "Build My Startup", icon: Rocket, color: "text-purple-700" },
    { id: "Become AI Engineer", label: "Become AI Engineer", icon: Sparkles, color: "text-emerald-700" },
    { id: "Launch My First SaaS", label: "Launch My First SaaS", icon: Globe, color: "text-rose-700" },
    { id: "Improve My Portfolio", label: "Improve My Portfolio", icon: FolderCode, color: "text-amber-700" },
    { id: "Become Technical Founder", label: "Become Technical Founder", icon: Terminal, color: "text-teal-800" },
    { id: "Build Products Used By Thousands", label: "Build Products Used By Thousands", icon: Users, color: "text-indigo-700" },
  ];

  const toggleGoal = (id: string) => {
    if (selected.includes(id)) {
      if (selected.length > 1) {
        setSelected(selected.filter((g) => g !== id));
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
          What brought you here today?
        </h2>
        <p className="text-sm text-zinc-600 font-sans max-w-lg mx-auto bg-white border border-zinc-200 p-3.5 rounded-xl italic shadow-sm">
          &quot;What are you aiming to build or achieve?&quot;
        </p>
      </div>

      {/* Multi-select Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {goalOptions.map((goal) => {
          const Icon = goal.icon;
          const isSelected = selected.includes(goal.id);

          return (
            <motion.div
              key={goal.id}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={() => toggleGoal(goal.id)}
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
                  <Icon className={`h-5 w-5 ${isSelected ? "text-teal-700" : goal.color}`} />
                </div>
                <span className="font-serif text-sm font-bold text-zinc-900">{goal.label}</span>
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

      {/* Selection Status & Footer CTA */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-zinc-200">
        <div className="flex items-center gap-2 font-mono text-xs text-zinc-600">
          <span className="h-2 w-2 rounded-full bg-teal-600 animate-pulse" />
          <span>
            <strong className="text-teal-800">{selected.length}</strong> goal{selected.length > 1 ? "s" : ""} selected
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
