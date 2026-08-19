"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Play, AlertCircle, RefreshCw } from "lucide-react";

export default function WhatIsMakeMistakes() {
  const [testState, setTestState] = useState<"idle" | "running" | "failed" | "fixing" | "success">("idle");
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (testState === "running") {
      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            setTestState("failed");
            return 100;
          }
          return prev + 20;
        });
      }, 200);
      return () => clearInterval(interval);
    } else if (testState === "fixing") {
      const timer = setTimeout(() => {
        setTestState("success");
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [testState]);

  const runSimulation = () => {
    setProgress(0);
    setTestState("running");
  };

  const applyFix = () => {
    setTestState("fixing");
  };

  return (
    <section id="about" className="bg-zinc-950 py-24 border-b border-zinc-900">
      <div className="mx-auto max-w-7xl px-6 md:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: Context Questions */}
          <div className="lg:col-span-6 space-y-8">
            <div className="space-y-4">
              <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-zinc-50">
                The place where developers become software builders.
              </h2>
              <p className="text-zinc-400 font-sans text-sm sm:text-base leading-relaxed">
                MakeMistakes isn't a coding course or a collection of videos. It is an active engineering sandbox where you write code to solve production-level problems.
              </p>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <h3 className="font-display text-base font-semibold text-zinc-200">What is MakeMistakes?</h3>
                <p className="text-zinc-400 font-sans text-xs sm:text-sm leading-relaxed">
                  It's a platform containing real startup-inspired engineering challenges. You develop solutions in your own local environment using Go, Rust, or Node.js.
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="font-display text-base font-semibold text-zinc-200">Why is it different?</h3>
                <p className="text-zinc-400 font-sans text-xs sm:text-sm leading-relaxed">
                  We don't offer certificates. Instead, our backend compiler spins up instances to test your service under extreme concurrent request spikes, simulating architectural bottlenecks and edge-case panics.
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="font-display text-base font-semibold text-zinc-200">What happens after signup?</h3>
                <p className="text-zinc-400 font-sans text-xs sm:text-sm leading-relaxed">
                  Choose a challenge, clone the workspace, write the code, and submit. If it fails, our virtual Senior AI Coach analyzes your approach, explains the concept, and directs you on how to refactor.
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Code Simulation Box */}
          <div className="lg:col-span-6">
            <div className="w-full rounded-xl border border-zinc-800 bg-zinc-900/30 p-1 shadow-xl">
              
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-zinc-800" />
                    <span className="h-2 w-2 rounded-full bg-zinc-800" />
                    <span className="h-2 w-2 rounded-full bg-zinc-800" />
                  </div>
                  <span className="font-mono text-[10px] text-zinc-500 uppercase tracking-widest pl-1">Interactive Sandbox Spec</span>
                </div>
                <span className="text-[10px] font-mono text-zinc-500">Go 1.22</span>
              </div>

              {/* Code Sandbox View */}
              <div className="p-4 bg-zinc-950 font-mono text-xs text-zinc-300 min-h-[220px] flex flex-col justify-between">
                
                {/* Visual state change */}
                <div className="space-y-2">
                  {testState === "idle" && (
                    <div className="text-zinc-500 leading-relaxed">
                      // Select a test suite configuration below to verify the local build.<br />
                      // Ready for simulation execution...
                    </div>
                  )}

                  {testState === "running" && (
                    <div className="space-y-1.5">
                      <div className="text-zinc-400">$ go test -v -race ./cache...</div>
                      <div className="text-zinc-500">Running concurrency tests: {progress}% completed</div>
                      <div className="w-full bg-zinc-900 h-1.5 rounded overflow-hidden">
                        <div className="bg-amber-500 h-full transition-all duration-200" style={{ width: `${progress}%` }} />
                      </div>
                    </div>
                  )}

                  {testState === "failed" && (
                    <div className="space-y-1.5">
                      <div className="text-zinc-400">$ go test -v -race ./cache...</div>
                      <div className="text-red-400 font-bold">--- FAIL: TestConcurrentAccess (1.42s)</div>
                      <div className="text-red-500/90 pl-3">panic: Go runtime: concurrent map read and map write</div>
                      <div className="bg-zinc-900/60 border border-zinc-800 p-2.5 rounded text-[11px] text-zinc-400 leading-relaxed font-sans mt-2">
                        <span className="text-amber-500 font-mono font-semibold">AI Coach:</span> "Go maps do not support concurrent operations natively. To fix this concurrent access crash, wrap your map read/write in a mutex or use a thread-safe implementation."
                      </div>
                    </div>
                  )}

                  {testState === "fixing" && (
                    <div className="flex flex-col items-center justify-center py-8 space-y-3">
                      <RefreshCw className="h-6 w-6 text-amber-500 animate-spin" />
                      <span className="text-zinc-400 font-sans text-xs">Applying mutex synchronization patch...</span>
                    </div>
                  )}

                  {testState === "success" && (
                    <div className="space-y-2">
                      <div className="text-zinc-400">$ go test -v -race ./cache...</div>
                      <div className="text-emerald-500 font-bold">=== RUN   TestConcurrentAccess</div>
                      <div className="text-emerald-500 font-bold">--- PASS: TestConcurrentAccess (0.84s)</div>
                      <div className="text-zinc-400">PASS</div>
                      <div className="text-emerald-500 flex items-center gap-1 font-semibold text-[11px] bg-emerald-500/5 border border-emerald-500/10 p-2.5 rounded leading-relaxed font-sans mt-2">
                        <span>SUCCESS: Code is fully synchronized and survived simulation stress-tests.</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Control Panel */}
                <div className="border-t border-zinc-900 pt-4 flex gap-3">
                  {testState === "idle" && (
                    <button
                      onClick={runSimulation}
                      className="flex items-center gap-1.5 bg-amber-500 text-zinc-950 text-xs font-semibold px-3 py-1.5 rounded transition-all hover:bg-amber-400 cursor-pointer border-none"
                    >
                      <Play className="h-3 w-3 fill-current" /> Run Concurrency Test
                    </button>
                  )}

                  {testState === "running" && (
                    <button className="flex items-center gap-1.5 bg-zinc-900 text-zinc-500 text-xs font-semibold px-3 py-1.5 rounded cursor-not-allowed border border-zinc-800" disabled>
                      Simulating load...
                    </button>
                  )}

                  {testState === "failed" && (
                    <button
                      onClick={applyFix}
                      className="flex items-center gap-1.5 bg-zinc-100 text-zinc-950 text-xs font-semibold px-3 py-1.5 rounded transition-all hover:bg-zinc-200 cursor-pointer border-none"
                    >
                      <Check className="h-3.5 w-3.5" /> Apply AI Coach Fix
                    </button>
                  )}

                  {testState === "success" && (
                    <button
                      onClick={() => setTestState("idle")}
                      className="flex items-center gap-1.5 bg-zinc-900 border border-zinc-800 text-zinc-400 text-xs font-semibold px-3 py-1.5 rounded transition-all hover:text-zinc-200 cursor-pointer"
                    >
                      Reset Sandbox
                    </button>
                  )}
                </div>

              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
