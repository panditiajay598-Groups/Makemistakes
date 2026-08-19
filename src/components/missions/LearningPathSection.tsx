"use client";

import React from "react";
import { Check, Lock, ChevronRight, Layers, Sparkles } from "lucide-react";

interface Milestone {
  id: number;
  title: string;
  category: string;
  status: "completed" | "active" | "locked";
  description: string;
}

export default function LearningPathSection() {
  const path: Milestone[] = [
    {
      id: 1,
      title: "Backend Foundations",
      category: "Node.js & HTTP",
      status: "completed",
      description: "Asynchronous I/O, event loops, & server handlers",
    },
    {
      id: 2,
      title: "In-Memory Caching & Rate Limiting",
      category: "Redis & Lua",
      status: "active",
      description: "Atomic sliding window logs & throttling headers",
    },
    {
      id: 3,
      title: "Distributed Job Queues",
      category: "BullMQ & Retries",
      status: "locked",
      description: "Exponential backoff, dead letter queues, & locks",
    },
    {
      id: 4,
      title: "High-Throughput Event Streaming",
      category: "Kafka & Consumer Groups",
      status: "locked",
      description: "Partition balancing & exactly-once processing",
    },
    {
      id: 5,
      title: "Distributed Mutexes & Consensus",
      category: "Raft & Redlock",
      status: "locked",
      description: "Pessimistic locking across multi-region clusters",
    },
  ];

  return (
    <div className="bg-[#0f0f0f] border border-[#232323] rounded-3xl p-6 space-y-5 font-mono text-xs shadow-xl select-none">
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] text-amber-400 font-bold uppercase tracking-wider bg-amber-500/10 px-2.5 py-0.5 rounded border border-amber-500/20">
              PROGRESSION ROADMAP
            </span>
            <span className="text-zinc-500 text-[11px]">Backend Engineering Track</span>
          </div>
          <h3 className="font-display text-xl font-bold text-zinc-100">
            Continue Your Learning Path
          </h3>
        </div>

        <span className="text-amber-400 font-bold bg-[#161616] px-3 py-1 rounded-lg border border-[#2a2a2a]">
          Milestone 2 of 5 Active
        </span>
      </div>

      {/* Path Horizontal / Vertical Timeline */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-3 pt-2">
        {path.map((item) => {
          const isDone = item.status === "completed";
          const isActive = item.status === "active";
          const isLocked = item.status === "locked";

          return (
            <div
              key={item.id}
              className={`p-4 rounded-2xl border flex flex-col justify-between space-y-3 transition-all ${
                isActive
                  ? "bg-amber-500/10 border-amber-500/50 text-zinc-100 shadow-lg shadow-amber-500/10"
                  : isDone
                  ? "bg-[#141414] border-[#262626] text-zinc-300"
                  : "bg-[#090909] border-[#1e1e1e] opacity-50 text-zinc-600"
              }`}
            >
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                    Step 0{item.id}
                  </span>

                  {isDone ? (
                    <div className="h-5 w-5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center font-bold">
                      <Check className="h-3 w-3" />
                    </div>
                  ) : isActive ? (
                    <div className="h-5 w-5 rounded-full bg-amber-500 text-zinc-950 flex items-center justify-center font-black text-[10px] animate-pulse">
                      ●
                    </div>
                  ) : (
                    <div className="h-5 w-5 rounded-full bg-[#161616] border border-[#262626] text-zinc-600 flex items-center justify-center">
                      <Lock className="h-3 w-3" />
                    </div>
                  )}
                </div>

                <div className={`font-bold font-sans text-xs ${isActive ? "text-amber-400" : isDone ? "text-zinc-200" : "text-zinc-500"}`}>
                  {item.title}
                </div>

                <div className="text-[11px] text-zinc-500 font-mono">
                  {item.category}
                </div>
              </div>

              <p className="text-[11px] font-sans text-zinc-400 leading-tight">
                {item.description}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
