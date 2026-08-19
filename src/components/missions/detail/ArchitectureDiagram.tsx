import React from "react";
import { Layers, ShieldCheck, ArrowRight, Activity } from "lucide-react";

export default function ArchitectureDiagram() {
  return (
    <section className="rounded-3xl border border-[#232323] bg-[#111111] p-6 sm:p-8 space-y-6">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#232323] pb-4">
        <div className="flex items-center gap-2">
          <Layers className="h-5 w-5 text-amber-400" />
          <h2 className="font-display text-xl font-bold text-zinc-100 tracking-tight">
            Target System Architecture Topology
          </h2>
        </div>
        <span className="font-mono text-xs text-amber-400 font-bold bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20 flex items-center gap-1.5 self-start sm:self-auto">
          <ShieldCheck className="h-3.5 w-3.5" />
          Atomic Sub-5ms Subsystem
        </span>
      </div>

      {/* SVG System Architecture Diagram */}
      <div className="rounded-2xl bg-[#090909] border border-[#232323] p-6 flex flex-col items-center justify-center relative overflow-hidden">
        
        {/* Subtle grid bg */}
        <div className="absolute inset-0 bg-[radial-gradient(#262626_1px,transparent_1px)] [background-size:16px_16px] opacity-30 pointer-events-none" />

        {/* Diagram Flow Nodes */}
        <div className="w-full max-w-4xl space-y-8 relative z-10 py-4">
          
          {/* Main flow row */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center text-center font-mono text-xs">
            
            {/* 1. Client Node */}
            <div className="p-4 rounded-xl bg-[#141414] border border-[#2a2a2a] space-y-1 shadow-md">
              <div className="text-zinc-400 text-[10px] uppercase font-bold">Origin</div>
              <div className="text-zinc-100 font-bold flex items-center justify-center gap-1">
                <span>💻 HTTP Client</span>
              </div>
              <div className="text-[10px] text-zinc-500">100,000 req/min</div>
            </div>

            {/* Arrow 1 */}
            <div className="hidden md:flex flex-col items-center justify-center text-zinc-500">
              <span className="text-[9px] text-amber-400 font-bold">100k req/min</span>
              <ArrowRight className="h-4 w-4 text-amber-400" />
            </div>

            {/* 2. API Gateway & Rate Limiter Node */}
            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/40 space-y-1 shadow-lg ring-1 ring-amber-500/20">
              <div className="text-amber-400 text-[10px] uppercase font-bold">Interceptor</div>
              <div className="text-amber-400 font-bold">⚡ API Rate Limiter</div>
              <div className="text-[10px] text-amber-300">Lua Script Evaluation</div>
            </div>

            {/* Arrow 2 */}
            <div className="hidden md:flex flex-col items-center justify-center text-zinc-500">
              <span className="text-[9px] text-emerald-400 font-bold">&lt; 3.2ms</span>
              <ArrowRight className="h-4 w-4 text-emerald-400" />
            </div>

            {/* 3. Redis Cache Cluster */}
            <div className="p-4 rounded-xl bg-[#141414] border border-[#2a2a2a] space-y-1 shadow-md">
              <div className="text-zinc-400 text-[10px] uppercase font-bold">Atomic Store</div>
              <div className="text-red-400 font-bold">🔴 Redis 7 (ZSET)</div>
              <div className="text-[10px] text-zinc-500">Sliding Window Log</div>
            </div>

          </div>

          {/* Sub-flow row: Protected Database & Queue */}
          <div className="pt-4 border-t border-[#1f1f1f] grid grid-cols-1 md:grid-cols-2 gap-4">
            
            <div className="p-4 rounded-xl bg-[#111111] border border-[#232323] flex items-center justify-between text-xs font-mono">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                <span className="text-zinc-200 font-bold">🐘 PostgreSQL Protected DB</span>
              </div>
              <span className="text-[10px] text-emerald-400 font-bold">0 Connection Drops</span>
            </div>

            <div className="p-4 rounded-xl bg-[#111111] border border-[#232323] flex items-center justify-between text-xs font-mono">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-amber-400" />
                <span className="text-zinc-200 font-bold">⚙️ Async BullMQ Job Queue</span>
              </div>
              <span className="text-[10px] text-amber-400 font-bold">Controlled Concurrency</span>
            </div>

          </div>

        </div>

        {/* Legend */}
        <div className="w-full pt-4 border-t border-[#1f1f1f] flex flex-wrap items-center justify-between text-[11px] font-mono text-zinc-500 gap-2">
          <span>Target Performance Metric: <strong className="text-emerald-400 font-bold">&lt; 5ms P99 Latency</strong></span>
          <span>Security Layer: <strong className="text-amber-400">Atomic Redis Lua Scripting</strong></span>
        </div>

      </div>

    </section>
  );
}
