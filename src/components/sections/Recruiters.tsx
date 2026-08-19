"use client";

import React from "react";
import { ShieldCheck, Calendar, Activity, GitBranch, Terminal } from "lucide-react";

export default function Recruiters() {
  const points = [
    {
      title: "Full Iteration History",
      desc: "Recruiters don't just see the final code. They see every bug you encountered and how you solved it—proving your debugging resilience.",
      icon: GitBranch
    },
    {
      title: "Real Telemetry Data",
      desc: "Every system you build runs through simulated stress testing. Your profile contains real logs showing system latency under heavy traffic.",
      icon: Activity
    },
    {
      title: "Architectural Decision Logs",
      desc: "Read transcripts of your code reviews. See how you respond to structural feedback from senior engineer reviews.",
      icon: Terminal
    },
    {
      title: "Verifiable Raw Commits",
      desc: "Direct integration with Github commits proves that you wrote the code yourself, eliminating plagiarism doubts.",
      icon: ShieldCheck
    }
  ];

  return (
    <section id="recruiters" className="bg-zinc-950 py-24 border-b border-zinc-900 relative">
      <div className="mx-auto max-w-7xl px-6 md:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: Visual Mockup of Recruiter Interface */}
          <div className="lg:col-span-6">
            <div className="w-full rounded-xl border border-zinc-800 bg-zinc-900/10 p-1 shadow-2xl">
              
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800 bg-zinc-950/20">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-zinc-800" />
                  <span className="h-2 w-2 rounded-full bg-zinc-800" />
                  <span className="h-2 w-2 rounded-full bg-zinc-800" />
                  <span className="font-mono text-[9px] text-zinc-500 uppercase tracking-widest pl-1">Recruiter Verification Portal</span>
                </div>
                <span className="text-[10px] font-mono text-zinc-400 bg-emerald-500/10 border border-emerald-500/25 px-2 py-0.5 rounded text-emerald-500">
                  Verified Builder
                </span>
              </div>

              {/* Recruiter Interface content */}
              <div className="p-5 space-y-4 font-sans text-xs bg-zinc-950">
                
                {/* Profile Header */}
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-semibold text-zinc-200 font-display">Sarah Jenkins</h4>
                    <p className="text-[10px] text-zinc-500">Graduate Portfolio Profile</p>
                  </div>
                  <span className="font-mono text-[10px] text-zinc-500">ID: MM-2094</span>
                </div>

                {/* Grid stats */}
                <div className="grid grid-cols-3 gap-2 text-center border-y border-zinc-900 py-3 my-2 font-mono">
                  <div>
                    <span className="block text-[9px] text-zinc-500 uppercase">Commits</span>
                    <span className="text-zinc-200 text-xs font-bold">42 Verified</span>
                  </div>
                  <div>
                    <span className="block text-[9px] text-zinc-500 uppercase">Avg Latency</span>
                    <span className="text-emerald-500 text-xs font-bold">1.4ms</span>
                  </div>
                  <div>
                    <span className="block text-[9px] text-zinc-500 uppercase">Pass SLA</span>
                    <span className="text-emerald-500 text-xs font-bold">100%</span>
                  </div>
                </div>

                {/* Iterations timeline log */}
                <div className="space-y-2">
                  <span className="font-mono text-[9px] text-zinc-500 uppercase">System Iterations Trace</span>
                  
                  <div className="space-y-1.5 font-mono text-[10px]">
                    <div className="flex justify-between items-center bg-zinc-900/60 p-2 rounded border border-zinc-800/40">
                      <span className="text-zinc-400">Iteration 3: Mutex Optimization</span>
                      <span className="text-emerald-500">PASS (1.4ms SLA)</span>
                    </div>
                    <div className="flex justify-between items-center bg-zinc-900/40 p-2 rounded opacity-70">
                      <span className="text-zinc-500">Iteration 2: Global Mutex bottleneck</span>
                      <span className="text-amber-500">WARN (82ms SLA)</span>
                    </div>
                    <div className="flex justify-between items-center bg-zinc-900/40 p-2 rounded opacity-50">
                      <span className="text-zinc-500">Iteration 1: Initial map implementation</span>
                      <span className="text-red-400">FAIL (Race Crash)</span>
                    </div>
                  </div>
                </div>

              </div>

            </div>
          </div>

          {/* Right Column: Copy explanation */}
          <div className="lg:col-span-6 space-y-6">
            <span className="text-xs font-bold tracking-widest text-amber-500 uppercase font-mono">
              why recruiters care
            </span>
            <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-zinc-50 leading-[1.1]">
              Recruiters don't trust certificates. They trust evidence.
            </h2>
            <p className="text-zinc-400 font-sans text-sm sm:text-base leading-relaxed">
              In a market saturated with generic certificates, hiring managers struggle to verify if candidates can actually build software. MakeMistakes gives them raw, verifiable proof of execution.
            </p>

            {/* Grid checklist */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
              {points.map((pt, idx) => {
                const Icon = pt.icon;
                return (
                  <div key={idx} className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="h-6 w-6 bg-zinc-900 border border-zinc-800 rounded flex items-center justify-center">
                        <Icon className="h-3.5 w-3.5 text-amber-500" />
                      </div>
                      <h4 className="text-xs font-bold text-zinc-200 font-display">{pt.title}</h4>
                    </div>
                    <p className="text-[11px] text-zinc-500 font-sans leading-relaxed">
                      {pt.desc}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
