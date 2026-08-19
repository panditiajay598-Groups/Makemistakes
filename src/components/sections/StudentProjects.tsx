"use client";

import React from "react";
import { ExternalLink, Github, Check, GitCommit, Play, Cpu } from "lucide-react";

export default function StudentProjects() {
  const projects = [
    {
      student: "Marcus Chen",
      role: "Backend Intern @ ScaleOps",
      project: "Distributed Cache Replicator",
      stack: "Go • Raft Consensus",
      github: "github.com/marcus/mm-cache",
      stats: "12,000 req/s SLA passed",
      logs: [
        "✓ Compiles on Go 1.22",
        "✓ Raft leader election stable in 150ms",
        "✓ Survives split-brain cluster simulation"
      ]
    },
    {
      student: "Sophia Patel",
      role: "Platform Engineer @ Vercel",
      project: "Token Bucket Rate Limiter",
      stack: "Rust • Axum Reverse Proxy",
      github: "github.com/sophia/rust-limiter",
      stats: "0.2ms latency overhead",
      logs: [
        "✓ Safe multi-threaded arc-mutex updates",
        "✓ Latency overhead verified < 0.5ms",
        "✓ Handled 250,000 requests"
      ]
    },
    {
      student: "Liam O'Connor",
      role: "Founding Engineer @ StreamFlow",
      project: "Event Queue Message broker",
      stack: "TypeScript • Node.js tcp",
      github: "github.com/liam/tcp-broker",
      stats: "99.8% message delivery SLA",
      logs: [
        "✓ Zero-loss memory buffer disk flush",
        "✓ Out-of-order sequence correction",
        "✓ Handled 45 concurrent tcp connections"
      ]
    }
  ];

  return (
    <section id="student-projects" className="bg-zinc-950 py-24 border-b border-zinc-900 relative">
      <div className="mx-auto max-w-7xl px-6 md:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-20">
          <span className="text-xs font-bold tracking-widest text-amber-500 uppercase font-mono">
            BUILDER PORTFOLIOS
          </span>
          <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-zinc-50">
            Real code shipped by real builders.
          </h2>
          <p className="text-zinc-400 font-sans text-sm sm:text-base leading-relaxed">
            No dummy homework templates. These are exact snapshots of student repositories and telemetry verification logs from the platform.
          </p>
        </div>

        {/* Project Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {projects.map((project, idx) => (
            <div
              key={idx}
              className="rounded-xl border border-zinc-800 bg-zinc-900/10 p-5 flex flex-col justify-between hover:border-zinc-700 transition-colors"
            >
              
              {/* Header */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-semibold text-zinc-150 font-display">{project.student}</h4>
                    <p className="text-[10px] text-zinc-500 font-sans">{project.role}</p>
                  </div>
                  <span className="text-[10px] font-mono text-amber-500 bg-amber-500/5 border border-amber-500/10 px-2 py-0.5 rounded">
                    {project.stats}
                  </span>
                </div>

                <div className="bg-zinc-950 border border-zinc-850 p-3 rounded font-mono text-[10px] space-y-2">
                  <div className="flex items-center justify-between text-zinc-400">
                    <span className="font-semibold text-zinc-200">{project.project}</span>
                    <span className="text-zinc-500">{project.stack}</span>
                  </div>
                  <div className="h-px bg-zinc-850 my-1" />
                  
                  {/* Console logs */}
                  <div className="space-y-1 text-zinc-450 text-[9px]">
                    {project.logs.map((log, lIdx) => (
                      <div key={lIdx} className="flex items-start gap-1">
                        <span className="text-emerald-500 font-bold">→</span>
                        <span>{log}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* GitHub Link */}
              <div className="flex items-center justify-between mt-6 pt-4 border-t border-zinc-850">
                <div className="flex items-center gap-1.5 font-mono text-[10px] text-zinc-500">
                  <Github className="h-3.5 w-3.5" />
                  <span>{project.github}</span>
                </div>
                <button className="flex items-center gap-1 font-mono text-[10px] text-zinc-450 hover:text-zinc-200 transition-colors bg-transparent border-none p-0 cursor-pointer">
                  <span>View Proof</span>
                  <ExternalLink className="h-3 w-3" />
                </button>
              </div>

            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
