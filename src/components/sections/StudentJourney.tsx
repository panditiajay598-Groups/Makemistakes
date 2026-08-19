"use client";

import React from "react";
import { Compass, Hammer, Terminal, Shield, Trophy, CheckCircle } from "lucide-react";

export default function StudentJourney() {
  const stages = [
    {
      level: "STAGE 01",
      name: "Explorer",
      xp: "0 - 1,500 XP",
      icon: Compass,
      badge: "Level 1-3",
      desc: "Master syntax, DOM manipulation, async loops, and git workflows.",
      projects: ["UI State Engine", "CLI Task Runner", "Async API Fetcher"],
    },
    {
      level: "STAGE 02",
      name: "Builder",
      xp: "1,500 - 5,000 XP",
      icon: Hammer,
      badge: "Level 4-7",
      desc: "Build fullstack web apps, DB schemas, JWT auth, and REST APIs.",
      projects: ["SaaS Auth Service", "Prisma ORM Layer", "WebSockets Chat"],
    },
    {
      level: "STAGE 03",
      name: "Developer",
      xp: "5,000 - 10,000 XP",
      icon: Terminal,
      badge: "Level 8-11",
      desc: "Optimize queries, implement Redis caching, & write unit tests.",
      projects: ["Redis Token Bucket", "BullMQ Async Queue", "Docker Microservices"],
    },
    {
      level: "STAGE 04",
      name: "Engineer",
      xp: "10,000 - 20,000 XP",
      icon: Shield,
      badge: "Level 12-15",
      desc: "Survive load tests, patch race conditions, & enforce zero-trust security.",
      projects: ["K8s Pipeline", "Atomic Lua Scripts", "Global Edge CDN"],
    },
    {
      level: "STAGE 05",
      name: "Industry Ready",
      xp: "20,000+ XP",
      icon: Trophy,
      badge: "Level 16+",
      desc: "Claim your cryptographically verified Proof-of-Work portfolio.",
      projects: ["Verified Scorecard", "Architecture Audit", "Startup Referrals"],
    },
  ];

  return (
    <section id="journey" className="py-20 bg-[#FAF9F5]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-mono font-semibold uppercase tracking-wider text-teal-800 bg-teal-100 px-3 py-1 rounded-full">
            Progression Roadmap
          </span>
          <h2 className="text-3xl sm:text-5xl font-serif text-zinc-900 mt-4 tracking-tight">
            Your path to becoming an engineer
          </h2>
          <p className="text-zinc-600 text-base sm:text-lg mt-3 font-sans">
            Track your XP, unlock technical ranks, and build verified competency.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {stages.map((stage, idx) => {
            const Icon = stage.icon;
            return (
              <div key={idx} className="bg-white rounded-2xl border border-zinc-200 p-5 shadow-sm space-y-4 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest">{stage.level}</span>
                    <span className="text-xs font-mono font-semibold text-teal-800 bg-teal-50 px-2 py-0.5 rounded">
                      {stage.badge}
                    </span>
                  </div>

                  <div className="w-9 h-9 rounded-lg bg-zinc-100 flex items-center justify-center text-zinc-800">
                    <Icon className="w-4 h-4" />
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-zinc-900 font-sans">{stage.name}</h3>
                    <span className="text-xs font-mono text-teal-700">{stage.xp}</span>
                  </div>

                  <p className="text-xs text-zinc-600 leading-relaxed">{stage.desc}</p>
                </div>

                <div className="pt-3 border-t border-zinc-100 space-y-1.5 font-mono text-[11px]">
                  <span className="text-zinc-400 text-[10px] uppercase block">Milestones</span>
                  {stage.projects.map((proj, pIdx) => (
                    <div key={pIdx} className="flex items-center gap-1.5 text-zinc-700">
                      <CheckCircle className="w-3 h-3 text-teal-600 shrink-0" />
                      <span className="truncate">{proj}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
