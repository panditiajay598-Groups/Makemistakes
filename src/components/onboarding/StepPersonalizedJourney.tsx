"use client";

import React from "react";
import {
  Sparkles,
  Rocket,
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldCheck,
  Zap,
  Layers,
  ChevronRight,
  Target,
  Cpu,
} from "lucide-react";
import { motion } from "framer-motion";
import { StepPersonalizedJourneyProps } from "./types";

export default function StepPersonalizedJourney({
  userName = "Sai",
  selectedInterests = ["AI SaaS", "Developer Tools"],
  onNext,
}: StepPersonalizedJourneyProps) {
  const assignedTrack = selectedInterests && selectedInterests[0] ? selectedInterests[0] : "AI SaaS Platform";

  const stages = [
    {
      stage: 1,
      title: "Product Foundations",
      weeks: "4 Weeks",
      desc: "Understand problem discovery, user research, PRD specs, and core architecture setup.",
      missions: "100+ Missions",
      active: true,
    },
    {
      stage: 2,
      title: "Build Your First Product",
      weeks: "6 Weeks",
      desc: "Full-stack implementation of UI components, REST/GraphQL APIs, and database schemas.",
      missions: "200+ Missions",
      active: false,
    },
    {
      stage: 3,
      title: "Ship Features",
      weeks: "4 Weeks",
      desc: "Integrate authentication, payments, push notifications, and background job queues.",
      missions: "150+ Missions",
      active: false,
    },
    {
      stage: 4,
      title: "Handle Real Users",
      weeks: "5 Weeks",
      desc: "Deploy to production, handle live analytics, rate limiting, and session security.",
      missions: "120+ Missions",
      active: false,
    },
    {
      stage: 5,
      title: "Production Engineering",
      weeks: "6 Weeks",
      desc: "Debug production bugs under pressure, fix memory leaks, and optimize slow SQL queries.",
      missions: "250+ Missions",
      active: false,
    },
    {
      stage: 6,
      title: "Scale Your Product",
      weeks: "5 Weeks",
      desc: "Distributed caching, vector database search, concurrency locks, and load balancing.",
      missions: "150+ Missions",
      active: false,
    },
    {
      stage: 7,
      title: "Launch & Grow",
      weeks: "4 Weeks",
      desc: "Startup operations, growth metrics, V2 feature planning, and recruiter-ready portfolio.",
      missions: "100+ Missions",
      active: false,
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4 }}
      className="space-y-8 max-w-4xl mx-auto py-4 px-4"
    >
      {/* Header Greeting */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-4 py-1.5 text-xs font-mono font-medium text-amber-400">
          <Sparkles className="h-3.5 w-3.5 text-amber-400 animate-pulse" />
          <span>YOUR TAILORED ROADMAP</span>
        </div>

        <h2 className="font-display text-4xl sm:text-6xl font-extrabold text-zinc-50 tracking-tight">
          Hello {userName} 👋 <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500">
            Here's your roadmap.
          </span>
        </h2>

        <p className="text-sm sm:text-base text-zinc-400 font-sans max-w-xl mx-auto">
          Assigned Ecosystem Track: <strong className="text-amber-400">{assignedTrack}</strong>. Instead of isolated exercises, every mission advances a real product.
        </p>
      </div>

      {/* Product Ecosystem Overview Banner */}
      <div className="rounded-2xl border border-amber-500/30 bg-gradient-to-r from-zinc-900 via-zinc-950 to-zinc-900 p-6 backdrop-blur-xl flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
        <div className="space-y-2 text-left">
          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] text-amber-400 font-bold bg-amber-500/10 px-2.5 py-0.5 rounded border border-amber-500/20">
              TARGET ECOSYSTEM
            </span>
            <span className="font-mono text-xs text-zinc-400">34 Total Weeks</span>
          </div>
          <h3 className="font-display text-2xl font-bold text-zinc-100">{assignedTrack} Ecosystem</h3>
          <p className="text-xs text-zinc-400 font-sans max-w-md">
            You'll progress through 7 distinct product-building stages, shipping real feature sets from discovery to multi-region scaling.
          </p>
        </div>

        <div className="flex items-center gap-4 shrink-0 bg-zinc-950 p-4 rounded-xl border border-zinc-800">
          <div className="text-center font-mono space-y-0.5">
            <span className="text-xs text-zinc-500 block uppercase">Total Vision</span>
            <span className="text-xl font-bold text-amber-400">2,000+</span>
            <span className="text-[10px] text-zinc-400 block">Product Missions</span>
          </div>
        </div>
      </div>

      {/* 7 Stages Vertical Timeline */}
      <div className="space-y-4 text-left">
        <span className="font-mono text-xs text-zinc-400 font-bold uppercase tracking-wider block">
          7 Progressive Product Building Stages
        </span>

        <div className="space-y-3">
          {stages.map((stg) => (
            <motion.div
              key={stg.stage}
              whileHover={{ scale: 1.005 }}
              className={`rounded-2xl p-5 border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                stg.active
                  ? "bg-zinc-900 border-amber-500/80 shadow-lg shadow-amber-500/10 ring-1 ring-amber-500/40"
                  : "bg-zinc-950/60 border-zinc-800/80 hover:border-zinc-700"
              }`}
            >
              <div className="flex items-start sm:items-center gap-4">
                {/* Stage Badge */}
                <div
                  className={`h-11 w-11 rounded-xl border flex items-center justify-center font-mono font-bold text-sm shrink-0 ${
                    stg.active
                      ? "bg-amber-500 text-zinc-950 border-amber-400 shadow-md shadow-amber-500/20"
                      : "bg-zinc-900 text-zinc-400 border-zinc-800"
                  }`}
                >
                  S{stg.stage}
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-3 flex-wrap">
                    <h4 className="font-display text-base font-bold text-zinc-100">{stg.title}</h4>
                    {stg.active && (
                      <span className="font-mono text-[10px] text-amber-400 font-bold bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                        STARTING HERE
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-zinc-400 font-sans leading-relaxed">{stg.desc}</p>
                </div>
              </div>

              {/* Weeks & Missions Tag */}
              <div className="flex items-center gap-3 shrink-0 self-end sm:self-center font-mono text-xs">
                <span className="px-3 py-1 rounded-lg bg-zinc-900 border border-zinc-800 text-amber-400 font-bold">
                  {stg.weeks}
                </span>
                <span className="text-zinc-500 text-[11px] hidden md:inline">{stg.missions}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Primary CTA: Launch Mission 1 */}
      <div className="pt-6 flex flex-col items-center gap-3">
        <button
          onClick={onNext}
          className="group relative inline-flex h-14 items-center justify-center gap-3 rounded-2xl bg-amber-500 hover:bg-amber-400 px-10 text-base font-bold text-zinc-950 transition-all cursor-pointer shadow-xl shadow-amber-500/20 border-none font-sans"
        >
          <Rocket className="h-5 w-5 fill-current" />
          <span>Start Mission 1</span>
          <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
        </button>

        <span className="font-mono text-xs text-zinc-500">
          Mission 1: Validate Your First Product Idea • Dashboard unlocks upon completion
        </span>
      </div>
    </motion.div>
  );
}
