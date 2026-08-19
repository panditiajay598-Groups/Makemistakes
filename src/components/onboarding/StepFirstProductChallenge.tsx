"use client";

import React, { useState } from "react";
import { ArrowRight, Sparkles, Code2, Bug, CheckCircle2, ShieldCheck, Play } from "lucide-react";
import { motion } from "framer-motion";

interface StepFirstProductChallengeProps {
  onNext: () => void;
}

export default function StepFirstProductChallenge({ onNext }: StepFirstProductChallengeProps) {
  const [fixed, setFixed] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
      className="space-y-8 max-w-3xl mx-auto py-8 px-4 text-center"
    >
      <div className="space-y-3">
        <span className="font-mono text-xs font-semibold text-teal-800 uppercase tracking-widest bg-teal-50 px-3 py-1 rounded-full border border-teal-200">
          PRODUCT THINKING CHALLENGE
        </span>
        <h2 className="font-serif text-3xl sm:text-5xl text-zinc-900 leading-tight">
          Try Your First Debug Challenge
        </h2>
        <p className="text-sm sm:text-base text-zinc-600 font-sans max-w-lg mx-auto">
          Here is how missions work on MakeMistakes. Test fixing a simulated queue bug below.
        </p>
      </div>

      {/* Code Challenge Card */}
      <div className="rounded-3xl bg-teal-900 text-white p-6 shadow-xl text-left space-y-4 max-w-xl mx-auto border border-teal-800">
        <div className="flex items-center justify-between border-b border-teal-800 pb-3 text-xs font-mono">
          <span className="flex items-center gap-1.5 text-teal-200">
            <Code2 className="h-4 w-4 text-teal-300" />
            <span>queue_handler.ts</span>
          </span>
          <button
            onClick={() => setFixed(!fixed)}
            className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 cursor-pointer border ${
              fixed
                ? "bg-emerald-500/20 text-emerald-300 border-emerald-400/40"
                : "bg-white text-teal-900 hover:bg-teal-50 border-white"
            }`}
          >
            {fixed ? (
              <>
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-300" /> Fix Passed (+150 XP)
              </>
            ) : (
              <>
                <Play className="h-3 w-3 fill-current" /> Apply Fix
              </>
            )}
          </button>
        </div>

        <pre className="font-mono text-xs text-teal-50 bg-teal-950/80 p-4 rounded-2xl overflow-x-auto leading-relaxed">
          <code>
            {`async function processUserJobs(jobs) {
  // Bug: Sequential blocking loop causes HTTP timeout under burst traffic
  ${
    fixed
      ? `await Promise.allSettled(jobs.map(j => sendNotification(j))); // Fixed with Concurrency Pool`
      : `for (const job of jobs) { await sendNotification(job); } // Blocking bug`
  }
}`}
          </code>
        </pre>

        <div className="flex items-center justify-between text-xs font-mono pt-1 text-teal-200">
          <span className="flex items-center gap-1">
            <ShieldCheck className="h-4 w-4 text-emerald-300" />
            <span>TELEMETRY: {fixed ? "PASSED" : "FAILING"}</span>
          </span>
          {fixed && <span className="text-amber-300 font-bold">+150 REPUTATION</span>}
        </div>
      </div>

      <div className="pt-2">
        <button
          onClick={onNext}
          className="group inline-flex h-13 items-center justify-center gap-3 rounded-full bg-teal-700 hover:bg-teal-800 px-8 text-sm font-bold text-white transition-all cursor-pointer shadow-lg shadow-teal-700/20 border-none font-sans"
        >
          <span>Continue to Role Selection</span>
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </button>
      </div>
    </motion.div>
  );
}
