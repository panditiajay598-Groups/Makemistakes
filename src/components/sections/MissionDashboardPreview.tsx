"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Terminal,
  Play,
  Search,
  Inbox,
  Bookmark,
  MessageSquare,
  CheckCircle,
  MoreHorizontal,
  ChevronDown,
  Sparkles,
  Bot,
  Zap,
  Code2,
} from "lucide-react";

export default function MissionDashboardPreview() {
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <div className="relative w-full rounded-3xl hero-canvas-bg p-4 sm:p-8 md:p-12 shadow-xl overflow-hidden">
      {/* Central Wide Inner App Window (Matches Twist Hero App Layout) */}
      <div className="relative max-w-5xl mx-auto bg-white rounded-2xl border border-zinc-200/80 shadow-2xl overflow-hidden text-zinc-900 font-sans">
        
        {/* Play Overlay Pill Button (Exactly matching Twist Play Button) */}
        {!isPlaying && (
          <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/5 backdrop-blur-[1px]">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsPlaying(true)}
              className="flex items-center gap-2.5 px-6 py-3 rounded-full bg-zinc-800 text-white font-medium text-sm shadow-2xl hover:bg-zinc-900 transition-all cursor-pointer"
            >
              <Play className="w-4 h-4 fill-white ml-0.5" />
              <span>Play</span>
            </motion.button>
          </div>
        )}

        {/* Top App Header Bar */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-zinc-200 bg-zinc-50 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-teal-700 text-white font-bold flex items-center justify-center text-xs">
              M
            </div>
            <span className="font-bold text-zinc-900">MakeMistakes</span>
            <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />
          </div>

          <div className="flex items-center gap-4 text-zinc-500 font-mono text-[11px]">
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>Mission 04: Realtime Redis Rate Limiter</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-teal-700 text-white font-semibold text-[11px] flex items-center gap-1">
              <CheckCircle className="w-3 h-3" />
              Mark done
            </span>
            <MoreHorizontal className="w-4 h-4 text-zinc-400" />
          </div>
        </div>

        {/* Main App Workspace Layout (Sidebar + Mission Thread Area) */}
        <div className="grid grid-cols-12 min-h-[380px] bg-white">
          {/* Left Channel Sidebar (3 cols) */}
          <div className="col-span-3 border-r border-zinc-200 bg-zinc-50/50 p-4 space-y-4 text-xs font-sans">
            <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-zinc-200/50 text-zinc-700">
              <Search className="w-3.5 h-3.5 text-zinc-400" />
              <span>Search</span>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-teal-50 text-teal-800 font-medium">
                <Inbox className="w-4 h-4 text-teal-700" />
                <span>Active Missions</span>
              </div>
              <div className="flex items-center gap-2 px-2 py-1.5 text-zinc-600 hover:bg-zinc-100 rounded-lg">
                <Bookmark className="w-4 h-4 text-zinc-400" />
                <span>Saved Pitfalls</span>
              </div>
              <div className="flex items-center gap-2 px-2 py-1.5 text-zinc-600 hover:bg-zinc-100 rounded-lg">
                <MessageSquare className="w-4 h-4 text-zinc-400" />
                <span>Socratic AI Chat</span>
              </div>
            </div>

            <div className="pt-2 border-t border-zinc-200 space-y-1">
              <span className="px-2 text-[10px] font-semibold text-zinc-400 uppercase tracking-wider block">Missions</span>
              <div className="px-2 py-1 text-zinc-700 font-mono text-[11px]"># 01-nextjs-auth</div>
              <div className="px-2 py-1 text-teal-800 font-mono text-[11px] font-bold bg-teal-50 rounded"># 04-redis-rate-limiter</div>
              <div className="px-2 py-1 text-zinc-700 font-mono text-[11px]"># 08-postgres-indexes</div>
              <div className="px-2 py-1 text-zinc-700 font-mono text-[11px]"># 12-docker-compose</div>
            </div>
          </div>

          {/* Right Mission Discussion & Code Thread (9 cols) */}
          <div className="col-span-9 p-6 space-y-4">
            <div>
              <h2 className="text-xl font-bold text-zinc-900 font-sans">
                Mission 04: Realtime Redis Rate Limiter
              </h2>
              <p className="text-xs text-zinc-500 mt-0.5">
                42 participants • #Distributed-Systems Track
              </p>
            </div>

            {/* Simulated Socratic Hint Thread */}
            <div className="flex items-start gap-3 pt-2">
              <div className="w-8 h-8 rounded-full bg-teal-600 text-white font-bold flex items-center justify-center text-xs shrink-0">
                AI
              </div>
              <div className="space-y-2 text-xs text-zinc-700">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-zinc-900">Nova Socratic Coach</span>
                  <span className="text-zinc-400 text-[10px]">1d</span>
                </div>
                <p className="text-zinc-800 leading-relaxed max-w-xl">
                  "Notice your current rate limiter reads from Redis, compares in JS memory, and then increments Redis. What happens if 50 requests arrive simultaneously between line 4 and line 7?"
                </p>
                <div className="p-3 bg-zinc-950 text-emerald-400 rounded-xl font-mono text-[11px] space-y-1 max-w-lg">
                  <div><span className="text-purple-400">const</span> current = <span className="text-cyan-300">await</span> redis.get(key);</div>
                  <div className="text-rose-400">// ⚠️ Non-atomic read/write race condition under 500 RPS</div>
                  <div><span className="text-purple-400">await</span> redis.eval(LUA_SCRIPT, 1, key); <span className="text-zinc-500">// Fixed!</span></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Floating Mobile Card Overlay (Matching Twist's Floating Mobile Screen on right) */}
        <div className="hidden lg:block absolute right-6 bottom-4 w-72 bg-white border border-zinc-200 rounded-2xl shadow-2xl p-4 z-20">
          <div className="flex items-center justify-between text-xs text-zinc-400 border-b border-zinc-100 pb-2 mb-3">
            <span className="font-semibold text-zinc-700">9:30</span>
            <div className="flex items-center gap-1 text-zinc-800">
              <Zap className="w-3 h-3 text-teal-600" />
              <span className="font-mono text-[10px]">Proof of Work</span>
            </div>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-zinc-900">Mission Scorecard</span>
              <span className="text-emerald-600 font-mono font-bold">100/100</span>
            </div>
            <p className="text-[11px] text-zinc-500">
              Passed 1,000 req/sec load test suite. Zero race conditions detected.
            </p>
            <div className="pt-2 border-t border-zinc-100 flex items-center justify-between text-[10px] font-mono text-teal-700">
              <span>Verified Certificate</span>
              <span>LinkedIn Ready ✓</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
