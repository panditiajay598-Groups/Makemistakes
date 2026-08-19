"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Check, Terminal, Activity, Zap, Trophy, Play, CheckCircle2, Sparkles, Bug } from "lucide-react";

export default function BrandingPanel() {
  const [isDebugFixed, setIsDebugFixed] = useState(false);
  const [xpGained, setXpGained] = useState(false);

  const handleRunDebug = () => {
    setIsDebugFixed(true);
    setXpGained(true);
    setTimeout(() => {
      setXpGained(false);
    }, 3000);
  };

  const benefits = [
    "Real startup challenges",
    "Senior AI coaching",
    "Verified Proof-of-Work portfolio"
  ];

  return (
    <div className="hidden lg:flex flex-col justify-between p-10 lg:p-12 bg-[#FAF9F5] text-zinc-900 border-r border-zinc-200/80 relative overflow-hidden h-full select-none">
      {/* Top Header & Logo */}
      <div className="relative z-10 space-y-6">
        <Link href="/" className="inline-flex items-center gap-2.5 no-underline group">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-700 text-white font-mono font-bold text-xs shadow-sm group-hover:bg-teal-800 transition-all">
            <Terminal className="h-4 w-4" />
          </div>
          <span className="font-bold text-xl text-zinc-900 tracking-tight font-sans">
            Make<span className="text-teal-700">Mistakes</span>
          </span>
        </Link>

        <div className="space-y-3.5 max-w-md pt-2">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center rounded-full bg-teal-50 border border-teal-200 px-3 py-0.5 text-xs font-mono font-semibold text-teal-700">
              MISSION ZERO
            </span>
            <span className="text-xs font-mono text-zinc-500 uppercase tracking-wider">
              Developer Academy
            </span>
          </div>

          <h1 className="font-serif text-3xl xl:text-4xl text-zinc-900 leading-[1.25] tracking-tight">
            Software engineering training that won&apos;t waste your time
          </h1>
          <p className="text-zinc-600 font-sans text-xs sm:text-sm leading-relaxed">
            MakeMistakes is an active learning platform that makes technical mastery easy from anywhere by using hands-on missions to organize your portfolio.
          </p>
        </div>

        {/* Benefits List */}
        <div className="space-y-2.5 pt-1">
          {benefits.map((item, idx) => (
            <div key={idx} className="flex items-center gap-2.5">
              <div className="flex h-4 w-4 items-center justify-center rounded-full bg-teal-100 text-teal-700 border border-teal-200">
                <Check className="h-2.5 w-2.5 stroke-[3]" />
              </div>
              <span className="text-xs font-medium text-zinc-700 font-sans">{item}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Developer Interactive Code Window & Telemetry Canvas */}
      <div className="relative z-10 my-auto py-6">
        {/* Code Editor Window in Rounded Teal Card */}
        <div className="rounded-2xl bg-teal-800 text-white p-4 shadow-xl max-w-md relative overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-3 py-2 border-b border-teal-700/60 text-xs">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-teal-600" />
                <div className="w-2.5 h-2.5 rounded-full bg-teal-600" />
                <div className="w-2.5 h-2.5 rounded-full bg-teal-600" />
              </div>
              <span className="text-teal-100 font-mono text-[11px] ml-1 flex items-center gap-1">
                <Terminal className="h-3 w-3 text-teal-300" />
                mission_zero.ts
              </span>
            </div>

            <button
              onClick={handleRunDebug}
              className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold flex items-center gap-1 transition-all cursor-pointer border ${
                isDebugFixed
                  ? "bg-emerald-400/20 text-emerald-300 border-emerald-400/40"
                  : "bg-white text-teal-900 hover:bg-teal-50 border-white"
              }`}
            >
              {isDebugFixed ? (
                <>
                  <CheckCircle2 className="h-3 w-3 text-emerald-300" /> Fixed (+500 XP)
                </>
              ) : (
                <>
                  <Play className="h-2.5 w-2.5 fill-current" /> Debug Line 14
                </>
              )}
            </button>
          </div>

          {/* Code Snippet Content */}
          <div className="p-3.5 font-mono text-[11px] leading-relaxed text-teal-50 bg-teal-900/60 rounded-xl mt-2 overflow-x-auto">
            <div>
              <span className="text-teal-300 font-semibold">async function</span>{" "}
              <span className="text-amber-300">initializeDeveloperIdentity</span>(
              <span className="text-teal-200">user</span>) {"{"}
            </div>
            <div className="pl-4 text-teal-300/70 italic">// Mission #001: Resolve memory leak in queue</div>
            <div className="pl-4">
              <span className="text-teal-300">const</span> <span className="text-white">academy</span> ={" "}
              <span className="text-teal-300">await</span> <span className="text-amber-300">joinMakeMistakes</span>();
            </div>
            <div className="pl-4">
              <span className="text-teal-300">const</span> <span className="text-white">identity</span> ={" "}
              <span className="text-amber-300">mintDeveloperProfile</span>({"{"}
            </div>
            <div className="pl-8">
              track: <span className="text-emerald-300">&apos;Industry-Ready Developer&apos;</span>,
            </div>
            <div className="pl-8">
              status: <span className="text-emerald-300">&apos;Mission Zero Active&apos;</span>,
            </div>
            <div className="pl-4">{"}"});</div>

            {/* Interactive Bug Line */}
            <div className="pl-4 my-1.5 py-1 rounded-lg px-2 flex items-center justify-between bg-teal-950/80">
              <span>
                <span className="text-teal-300">if</span> (<span className="text-white">identity.status</span> ==={" "}
                <span className="text-emerald-300">&apos;Ready&apos;</span>) {"{"}
              </span>
              {isDebugFixed ? (
                <span className="text-[9px] text-emerald-300 font-mono bg-emerald-900/80 px-2 py-0.5 rounded-full border border-emerald-400/40 flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3 text-emerald-300" /> PASSED
                </span>
              ) : (
                <span className="text-[9px] text-rose-300 font-mono bg-rose-900/80 px-2 py-0.5 rounded-full border border-rose-400/40 flex items-center gap-1 animate-pulse">
                  <Bug className="h-3 w-3" /> Memory Leak Bug
                </span>
              )}
            </div>

            <div className="pl-8">
              <span className="text-teal-300">return</span> <span className="text-amber-300">launchMissionZero</span>(<span className="text-white">identity</span>);
            </div>
            <div className="pl-4">{"}"}</div>
            <div>{"}"}</div>
          </div>

          {/* Telemetry Footer */}
          <div className="px-1 pt-3 flex items-center justify-between text-[10px] font-mono text-teal-100">
            <div className="flex items-center gap-1.5">
              <Activity className="h-3.5 w-3.5 text-emerald-300" />
              <span>TELEMETRY VERIFIED</span>
            </div>
            <div className="flex items-center gap-1 text-amber-300 font-semibold">
              <Trophy className="h-3.5 w-3.5" /> LVL 1 DEBUGGER
            </div>
          </div>
        </div>

        {/* Dynamic XP Gain Banner */}
        {xpGained && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 px-4 py-2 rounded-full bg-amber-400 text-teal-950 font-mono font-extrabold text-xs shadow-2xl flex items-center gap-2 z-30 animate-bounce">
            <Sparkles className="h-4 w-4 fill-teal-950" />
            <span>+500 XP UNLOCKED!</span>
          </div>
        )}
      </div>

      {/* Footer Statement */}
      <div className="relative z-10 pt-6 border-t border-zinc-200/80 text-[11px] text-zinc-500 font-sans flex justify-between items-center">
        <span>© MakeMistakes</span>
        <span>Evidence Over Credentials</span>
      </div>
    </div>
  );
}
