"use client";

import React from "react";
import { FileText, Target, AlertTriangle, Users, BarChart2, ShieldCheck, Globe } from "lucide-react";
import { motion } from "framer-motion";

export default function SprintProductBriefSection() {
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
            <FileText className="h-5 w-5 text-amber-400" />
            Product Brief
          </h2>
          <p className="text-xs text-zinc-400 font-sans">
            Full product context &amp; specifications before starting Sprint 2.
          </p>
        </div>
        <span className="font-mono text-xs text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20 font-bold">
          Verified Context
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-sans">
        {/* Product Card */}
        <div className="bg-zinc-900/60 border border-zinc-800 p-5 rounded-2xl space-y-2">
          <div className="flex items-center gap-2 text-amber-400 font-mono font-bold">
            <Globe className="h-4 w-4" />
            <span>PRODUCT</span>
          </div>
          <h3 className="font-display text-base font-bold text-zinc-100">MakeMistakes Simulator</h3>
          <p className="text-zinc-400 text-xs leading-relaxed">
            Product Engineering Simulator where students build real software products inside simulated agile sprints.
          </p>
        </div>

        {/* Problem Card */}
        <div className="bg-zinc-900/60 border border-zinc-800 p-5 rounded-2xl space-y-2">
          <div className="flex items-center gap-2 text-rose-400 font-mono font-bold">
            <AlertTriangle className="h-4 w-4" />
            <span>CORE PROBLEM</span>
          </div>
          <h3 className="font-display text-base font-bold text-zinc-100">Tutorial-Hell Bottleneck</h3>
          <p className="text-zinc-400 text-xs leading-relaxed">
            Students spend months watching videos, copying code, and memorizing syntax, but freeze when building software products independently.
          </p>
        </div>

        {/* Goal Card */}
        <div className="bg-zinc-900/60 border border-zinc-800 p-5 rounded-2xl space-y-2">
          <div className="flex items-center gap-2 text-emerald-400 font-mono font-bold">
            <Target className="h-4 w-4" />
            <span>PRODUCT GOAL</span>
          </div>
          <h3 className="font-display text-base font-bold text-zinc-100">Scalable Engineering Operating System</h3>
          <p className="text-zinc-400 text-xs leading-relaxed">
            Design and architect BuildOS to support real-time collaboration, automated verification, and AI mentoring.
          </p>
        </div>

        {/* Constraints Card */}
        <div className="bg-zinc-900/60 border border-zinc-800 p-5 rounded-2xl space-y-2">
          <div className="flex items-center gap-2 text-purple-400 font-mono font-bold">
            <ShieldCheck className="h-4 w-4" />
            <span>TECHNICAL CONSTRAINTS</span>
          </div>
          <h3 className="font-display text-base font-bold text-zinc-100">Performance &amp; Scale SLAs</h3>
          <p className="text-zinc-400 text-xs leading-relaxed">
            Must handle 10,000 req/s bursts, sub-5ms Redis latency, PostgreSQL transactional ACID compliance, and multi-tenant isolation.
          </p>
        </div>

        {/* Target Users Card */}
        <div className="bg-zinc-900/60 border border-zinc-800 p-5 rounded-2xl space-y-2">
          <div className="flex items-center gap-2 text-blue-400 font-mono font-bold">
            <Users className="h-4 w-4" />
            <span>TARGET USERS</span>
          </div>
          <p className="text-zinc-300 text-xs font-mono">
            • Computer Science Students<br />
            • Bootcamp Graduates<br />
            • Self-Taught Developers<br />
            • Career Switchers
          </p>
        </div>

        {/* Success Metrics Card */}
        <div className="bg-zinc-900/60 border border-zinc-800 p-5 rounded-2xl space-y-2">
          <div className="flex items-center gap-2 text-teal-400 font-mono font-bold">
            <BarChart2 className="h-4 w-4" />
            <span>SUCCESS METRICS</span>
          </div>
          <p className="text-zinc-300 text-xs font-mono">
            • 90%+ Sprint 1 to Sprint 2 Conversion<br />
            • 100% Submission Verification Rate<br />
            • Student Portfolio Readiness Score &gt; 8.5/10
          </p>
        </div>
      </div>
    </motion.div>
  );
}
