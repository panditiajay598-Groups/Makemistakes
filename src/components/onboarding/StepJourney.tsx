"use client";

import React from "react";
import { ArrowRight, Lock, Unlock, Play, Trophy, Zap, Award, Sparkles, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";
import { StepJourneyProps } from "./types";

export default function StepJourney({
  selectedPath = "🤖 AI Engineering",
  onNext,
}: StepJourneyProps) {
  const missions = [
    {
      id: "mission-0",
      num: "Mission 0",
      title: "Understanding MakeMistakes",
      desc: "Meet your AI mentor, experience the feedback loop, and complete your first challenge.",
      status: "unlocked",
      xp: 100,
      isCurrent: true,
    },
    {
      id: "m-1",
      num: "Mission 1",
      title: "Problem Identification",
      desc: "Analyze real product failure cases and diagnose root causes.",
      status: "locked",
      xp: 150,
    },
    {
      id: "m-2",
      num: "Mission 2",
      title: "Solution Architecture",
      desc: "Design system boundaries and algorithmic approaches before writing code.",
      status: "locked",
      xp: 200,
    },
    {
      id: "m-3",
      num: "Mission 3",
      title: "AI Foundations & Prompting",
      desc: "Master prompt structure, token budgets, embeddings, and context mechanics.",
      status: "locked",
      xp: 250,
    },
    {
      id: "m-4",
      num: "Mission 4",
      title: "Programming Essentials",
      desc: "Learn core code structures required to construct AI-powered applications.",
      status: "locked",
      xp: 300,
    },
    {
      id: "m-5",
      num: "Mission 5",
      title: "Working with AI Models",
      desc: "Integrate LLM endpoints, structured outputs, and streaming responses.",
      status: "locked",
      xp: 350,
    },
    {
      id: "m-6",
      num: "Mission 6",
      title: "Backend & Data Infrastructure",
      desc: "Store, query, and retrieve structured and vector application data.",
      status: "locked",
      xp: 400,
    },
    {
      id: "m-7",
      num: "Mission 7",
      title: "Frontend Interface & UX",
      desc: "Build responsive, high-performance UI components users enjoy using.",
      status: "locked",
      xp: 450,
    },
    {
      id: "m-8",
      num: "Mission 8",
      title: "Full Product Architecture",
      desc: "Connect frontend, backend, auth, AI models, and databases into one system.",
      status: "locked",
      xp: 500,
    },
    {
      id: "m-9",
      num: "Mission 9",
      title: "Testing & Failure Mode Iteration",
      desc: "Stress-test, debug edge cases, and refine product stability.",
      status: "locked",
      xp: 600,
    },
    {
      id: "m-10",
      num: "Mission 10",
      title: "Launch Your Production AI Product 🚀",
      desc: "Deploy your production application and generate recruiter proof of work.",
      status: "locked",
      xp: 1000,
    },
  ];

  const totalXP = missions.reduce((acc, m) => acc + m.xp, 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-8 max-w-3xl mx-auto py-2"
    >
      {/* Header */}
      <div className="space-y-3 text-center max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3.5 py-1 text-xs font-mono font-medium text-amber-400">
          <Trophy className="h-3.5 w-3.5" />
          <span>GAME PROGRESSION ROADMAP</span>
        </div>

        <h2 className="font-display text-3xl sm:text-5xl font-extrabold tracking-tight text-zinc-50">
          Your Learning Journey
        </h2>
        <p className="text-xs sm:text-sm text-zinc-400 font-sans leading-relaxed max-w-lg mx-auto">
          A game-driven mission sequence customized for <strong className="text-amber-400">{selectedPath}</strong>. Complete each mission to unlock the next level.
        </p>

        {/* Game HUD Bar (Stats Summary) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 max-w-2xl mx-auto">
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-3 text-center space-y-0.5">
            <span className="font-mono text-[10px] text-zinc-500 uppercase block font-semibold">Track</span>
            <span className="text-xs font-bold text-zinc-200 block truncate px-1">{selectedPath.split(" ")[1] || selectedPath}</span>
          </div>

          <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-3 text-center space-y-0.5">
            <span className="font-mono text-[10px] text-zinc-500 uppercase block font-semibold">Progress</span>
            <span className="text-xs font-bold text-emerald-400 block">0 / 10 Completed</span>
          </div>

          <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-3 text-center space-y-0.5">
            <span className="font-mono text-[10px] text-zinc-500 uppercase block font-semibold">Completion</span>
            <span className="text-xs font-bold text-amber-400 block">0%</span>
          </div>

          <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-3 text-center space-y-0.5">
            <span className="font-mono text-[10px] text-zinc-500 uppercase block font-semibold">Total Rewards</span>
            <span className="text-xs font-bold text-purple-400 block flex items-center justify-center gap-1">
              <Zap className="h-3 w-3 fill-purple-400" /> {totalXP} XP
            </span>
          </div>
        </div>
      </div>

      {/* Vertical Mission Roadmap (Game Progression Layout) */}
      <div className="relative pl-6 sm:pl-10 space-y-4">
        {/* Continuous Connecting Line */}
        <div className="absolute left-3.5 sm:left-5 top-6 bottom-6 w-0.5 bg-gradient-to-b from-amber-500 via-zinc-800 to-zinc-900/50" />

        {missions.map((m, idx) => {
          const isUnlocked = m.status === "unlocked";
          const isCurrent = m.isCurrent;

          return (
            <motion.div
              key={m.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.04 }}
              className={`relative rounded-2xl border p-4 sm:p-5 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                isCurrent
                  ? "border-amber-500/80 bg-gradient-to-r from-amber-500/15 via-zinc-900/80 to-zinc-950 shadow-xl shadow-amber-500/10 ring-1 ring-amber-500/40"
                  : isUnlocked
                  ? "border-zinc-800 bg-zinc-900/50"
                  : "border-zinc-850/60 bg-zinc-950/40 opacity-70"
              }`}
            >
              {/* Timeline Node Icon on the vertical line */}
              <div
                className={`absolute -left-[31px] sm:-left-[37px] top-1/2 -translate-y-1/2 h-7 w-7 sm:h-8 sm:w-8 rounded-full border flex items-center justify-center font-mono text-xs font-bold transition-all shadow-md ${
                  isCurrent
                    ? "border-amber-400 bg-amber-500 text-zinc-950 ring-4 ring-amber-500/20 shadow-amber-500/30"
                    : isUnlocked
                    ? "border-emerald-500/50 bg-zinc-900 text-emerald-400"
                    : "border-zinc-800 bg-zinc-950 text-zinc-600"
                }`}
              >
                {isUnlocked ? (
                  isCurrent ? (
                    <Play className="h-3.5 w-3.5 fill-zinc-950 ml-0.5" />
                  ) : (
                    <Unlock className="h-3.5 w-3.5" />
                  )
                ) : (
                  <Lock className="h-3.5 w-3.5" />
                )}
              </div>

              {/* Node Main Details */}
              <div className="space-y-1 sm:space-y-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`font-mono text-[10px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${
                      isCurrent
                        ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                        : "bg-zinc-900 text-zinc-400 border-zinc-800"
                    }`}
                  >
                    {m.num}
                  </span>

                  {isCurrent && (
                    <span className="inline-flex items-center gap-1 font-mono text-[10px] font-bold text-amber-400 bg-amber-500/20 border border-amber-500/40 px-2 py-0.5 rounded-full">
                      <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-ping" />
                      CURRENT MISSION
                    </span>
                  )}

                  <h3
                    className={`font-display text-sm sm:text-base font-bold ${
                      isCurrent
                        ? "text-zinc-50 font-extrabold"
                        : isUnlocked
                        ? "text-zinc-200"
                        : "text-zinc-400"
                    }`}
                  >
                    {m.title}
                  </h3>
                </div>

                <p className="text-xs text-zinc-400 font-sans leading-relaxed">
                  {m.desc}
                </p>
              </div>

              {/* Node XP Reward Tag */}
              <div className="shrink-0 flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-zinc-850">
                <span className="inline-flex items-center gap-1 font-mono text-xs font-bold text-purple-400 bg-purple-500/10 px-3 py-1 rounded-lg border border-purple-500/20">
                  <Zap className="h-3 w-3 fill-purple-400" />
                  +{m.xp} XP
                </span>

                {isCurrent && (
                  <span className="font-mono text-xs font-bold text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/30 sm:hidden">
                    START
                  </span>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Action CTA */}
      <div className="flex flex-col items-center gap-3 pt-4">
        <button
          onClick={onNext}
          className="group relative inline-flex h-13 items-center justify-center gap-3 rounded-xl bg-amber-500 px-9 text-sm font-bold text-zinc-950 transition-all hover:bg-amber-400 active:scale-98 cursor-pointer shadow-xl shadow-amber-500/20 border-none"
        >
          <span>Continue to Mission 0</span>
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </button>
        <span className="font-mono text-xs text-zinc-500">
          Mission 0 takes 15–20 minutes to complete
        </span>
      </div>
    </motion.div>
  );
}
