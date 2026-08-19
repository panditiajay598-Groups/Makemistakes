"use client";

import React, { useState } from "react";
import { Lightbulb, Lock, ChevronRight, Sparkles, Check, HelpCircle } from "lucide-react";

interface HintPanelProps {
  currentStep: number;
}

export default function HintPanel({ currentStep }: HintPanelProps) {
  const [unlockedLevel, setUnlockedLevel] = useState<number>(0);

  const hintsByStep: Record<number, { level1: string; level2: string; level3: string }> = {
    1: {
      level1: "Check if Redis server is reachable before instantiating the connection pool.",
      level2: "Use `ioredis` with options like `maxRetriesPerRequest: 3` and fallback defaults.",
      level3: "Ensure your exported `redis` client matches `process.env.REDIS_HOST || 'localhost'`.",
    },
    2: {
      level1: "The key parameter should encapsulate the client IP address or API token.",
      level2: "Read the current count from Redis using `await redis.get(key)`.",
      level3: "If `current` count >= `limit`, return `false`. Otherwise `await redis.incr(key)` and return `true`.",
    },
    3: {
      level1: "HTTP middleware must intercept request headers before forwarding to handlers.",
      level2: "Extract `x-forwarded-for` header or fallback to client IP `127.0.0.1`.",
      level3: "If `evaluateRateLimit(ip)` returns false, immediately return `new Response('Too Many Requests', { status: 429 })`.",
    },
    4: {
      level1: "High concurrency causes race conditions when reads and writes are not atomic.",
      level2: "Consider bundling rate evaluation into a Redis Lua script using `redis.eval()`.",
      level3: "Execute `INCR` and `EXPIRE` atomically inside Lua to handle 10,000 req/s load.",
    },
  };

  const currentHints = hintsByStep[currentStep] || hintsByStep[2];

  const handleUnlockNext = () => {
    if (unlockedLevel < 3) {
      setUnlockedLevel(unlockedLevel + 1);
    }
  };

  return (
    <div className="bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden shadow-lg font-mono text-xs">
      
      {/* Header */}
      <div className="bg-zinc-900/90 border-b border-zinc-800 px-3.5 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-2 text-zinc-100 font-bold">
          <Lightbulb className="h-4 w-4 text-amber-400 fill-amber-400/20" />
          <span>Progressive Hint System</span>
        </div>
        <span className="text-zinc-400 text-[11px]">
          Level {unlockedLevel} / 3
        </span>
      </div>

      {/* Hints List */}
      <div className="p-3 space-y-3 bg-zinc-950">
        
        {/* Hint 1 */}
        <div className={`p-3 rounded-xl border transition-all ${
          unlockedLevel >= 1 ? "bg-zinc-900/80 border-amber-500/30 text-zinc-200" : "bg-zinc-950 border-zinc-900 opacity-60"
        }`}>
          <div className="flex items-center justify-between font-bold text-[11px] mb-1">
            <span className={unlockedLevel >= 1 ? "text-amber-400" : "text-zinc-500"}>
              Hint 1 — Small Clue
            </span>
            {unlockedLevel >= 1 ? (
              <Check className="h-3.5 w-3.5 text-emerald-400" />
            ) : (
              <Lock className="h-3.5 w-3.5 text-zinc-600" />
            )}
          </div>
          {unlockedLevel >= 1 ? (
            <p className="text-zinc-300 font-sans text-xs">{currentHints.level1}</p>
          ) : (
            <p className="text-zinc-600 italic text-[11px]">Click 'Unlock Hint 1' to reveal initial clue.</p>
          )}
        </div>

        {/* Hint 2 */}
        <div className={`p-3 rounded-xl border transition-all ${
          unlockedLevel >= 2 ? "bg-zinc-900/80 border-amber-500/30 text-zinc-200" : "bg-zinc-950 border-zinc-900 opacity-60"
        }`}>
          <div className="flex items-center justify-between font-bold text-[11px] mb-1">
            <span className={unlockedLevel >= 2 ? "text-amber-400" : "text-zinc-500"}>
              Hint 2 — Specific Pattern
            </span>
            {unlockedLevel >= 2 ? (
              <Check className="h-3.5 w-3.5 text-emerald-400" />
            ) : (
              <Lock className="h-3.5 w-3.5 text-zinc-600" />
            )}
          </div>
          {unlockedLevel >= 2 ? (
            <p className="text-zinc-300 font-sans text-xs">{currentHints.level2}</p>
          ) : (
            <p className="text-zinc-600 italic text-[11px]">Unlock Level 1 first to reveal Level 2.</p>
          )}
        </div>

        {/* Hint 3 */}
        <div className={`p-3 rounded-xl border transition-all ${
          unlockedLevel >= 3 ? "bg-zinc-900/80 border-amber-500/30 text-zinc-200" : "bg-zinc-950 border-zinc-900 opacity-60"
        }`}>
          <div className="flex items-center justify-between font-bold text-[11px] mb-1">
            <span className={unlockedLevel >= 3 ? "text-amber-400" : "text-zinc-500"}>
              Hint 3 — Near-Complete Guidance
            </span>
            {unlockedLevel >= 3 ? (
              <Check className="h-3.5 w-3.5 text-emerald-400" />
            ) : (
              <Lock className="h-3.5 w-3.5 text-zinc-600" />
            )}
          </div>
          {unlockedLevel >= 3 ? (
            <p className="text-zinc-300 font-sans text-xs">{currentHints.level3}</p>
          ) : (
            <p className="text-zinc-600 italic text-[11px]">Deep technical breakdown. (Does not reveal raw solution).</p>
          )}
        </div>

        {/* Unlock Button */}
        {unlockedLevel < 3 && (
          <button
            onClick={handleUnlockNext}
            className="w-full py-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 font-bold rounded-xl flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
          >
            <Lightbulb className="h-3.5 w-3.5" />
            <span>Unlock Hint Level {unlockedLevel + 1}</span>
          </button>
        )}

      </div>

    </div>
  );
}
