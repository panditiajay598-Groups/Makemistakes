"use client";

import React from "react";
import { History, CheckCircle2, Lock, Sparkles, ExternalLink, Trophy } from "lucide-react";
import { motion } from "framer-motion";

export default function SprintHistorySection() {
  const sprintHistory = [
    {
      sprintNumber: 1,
      title: "Problem Discovery & Validation",
      status: "completed",
      score: "9.0 / 10",
      reputation: "+150 PTS",
      rank: "Founding Engineer Candidate",
      deliverables: ["Discovery Brief", "User Personas", "Pain Point Matrix"],
    },
    {
      sprintNumber: 2,
      title: "Solution Design & Architecture",
      status: "current",
      score: "In Progress",
      reputation: "+150 PTS (Pending)",
      rank: "Associate Product Engineer",
      deliverables: ["System Topology", "PostgreSQL DDL", "API Routes"],
    },
    {
      sprintNumber: 3,
      title: "Build MVP & Core Mechanics",
      status: "locked",
      score: "Locked",
      reputation: "+200 PTS",
      rank: "Product Engineer",
      deliverables: ["Source Code", "Live Preview", "Deployment SLA"],
    },
    {
      sprintNumber: 4,
      title: "User Testing & Bug Hunting",
      status: "locked",
      score: "Locked",
      reputation: "+200 PTS",
      rank: "Senior Product Engineer",
      deliverables: ["Test Suite", "Bug Tracker", "QA Report"],
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6 max-w-4xl mx-auto py-4 font-sans text-left"
    >
      <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
        <div>
          <h2 className="font-display text-2xl font-bold text-zinc-100 flex items-center gap-2">
            <History className="h-5 w-5 text-amber-400" />
            Sprint History &amp; Revisit Archive
          </h2>
          <p className="text-xs text-zinc-400 font-sans">
            Revisit past Sprint deliverables, engineering scores, and mentor feedback.
          </p>
        </div>
        <span className="font-mono text-xs text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20 font-bold">
          Sprint 1 Completed
        </span>
      </div>

      <div className="space-y-3">
        {sprintHistory.map((item) => {
          const isDone = item.status === "completed";
          const isCurrent = item.status === "current";

          return (
            <div
              key={item.sprintNumber}
              className={`p-5 rounded-2xl border transition-all ${
                isDone
                  ? "bg-zinc-950/80 border-emerald-500/30 text-zinc-200"
                  : isCurrent
                  ? "bg-zinc-900 border-amber-500/40 text-zinc-100 ring-1 ring-amber-500/20"
                  : "bg-zinc-950/40 border-zinc-800/60 text-zinc-600 opacity-70"
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-amber-400">
                      Sprint {item.sprintNumber}
                    </span>
                    <h3 className="font-display text-base font-bold text-zinc-100">
                      {item.title}
                    </h3>
                  </div>
                  <span className="font-mono text-[11px] text-zinc-500 block">Rank: {item.rank}</span>
                </div>

                <div className="flex items-center gap-3 font-mono text-xs shrink-0">
                  <span className={isDone ? "text-emerald-400 font-bold" : isCurrent ? "text-amber-400 font-bold" : "text-zinc-500"}>
                    Score: {item.score}
                  </span>

                  <span
                    className={`text-[10px] px-2.5 py-1 rounded border uppercase font-bold ${
                      isDone
                        ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                        : isCurrent
                        ? "bg-amber-500/20 text-amber-400 border-amber-500/30"
                        : "bg-zinc-900 text-zinc-600 border-zinc-800"
                    }`}
                  >
                    {item.status}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}
