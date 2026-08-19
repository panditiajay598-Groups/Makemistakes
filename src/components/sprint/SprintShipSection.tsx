"use client";

import React, { useState } from "react";
import {
  Send,
  CheckCircle2,
  GitMerge,
  Trophy,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  PackageCheck,
  FileCode2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

interface SprintShipSectionProps {
  onSprintCompleted?: () => void;
}

export default function SprintShipSection({ onSprintCompleted }: SprintShipSectionProps) {
  const [isMerged, setIsMerged] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const deliverables = [
    { title: "Sprint 1 Discovery Brief", status: "Verified ✓" },
    { title: "System Architecture Diagram (Topology)", status: "Verified ✓" },
    { title: "PostgreSQL Database Schema DDL", status: "Verified ✓" },
    { title: "API Route Definitions (/api/sprints)", status: "Verified ✓" },
  ];

  const handleMergeAndShip = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsMerged(true);
      if (onSprintCompleted) onSprintCompleted();
    }, 1200);
  };

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
            <GitMerge className="h-5 w-5 text-amber-400" />
            Ship &amp; Merge Pull Request (Sprint 2)
          </h2>
          <p className="text-xs text-zinc-400 font-sans">
            Validate deliverables, merge your changes, and unlock Sprint 3.
          </p>
        </div>
        <span className="font-mono text-xs text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20 font-bold">
          {isMerged ? "Merged ✓" : "Ready to Merge"}
        </span>
      </div>

      {!isMerged ? (
        /* Step 1 & 2: Deliverables Validation & Merge Action */
        <div className="bg-zinc-900/80 border border-zinc-800 p-6 sm:p-8 rounded-3xl space-y-6 shadow-2xl">
          <div className="space-y-2">
            <span className="font-mono text-xs font-bold text-amber-400 uppercase tracking-wider bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
              PR #002 Deliverables Checklist
            </span>
            <h3 className="font-display text-xl font-bold text-zinc-100">
              Validate Attached Artifacts Before Merging
            </h3>
          </div>

          <div className="space-y-2.5 font-mono text-xs">
            {deliverables.map((del, idx) => (
              <div key={idx} className="p-3.5 rounded-2xl bg-zinc-950 border border-zinc-800 flex items-center justify-between">
                <div className="flex items-center gap-2.5 text-zinc-200">
                  <FileCode2 className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span>{del.title}</span>
                </div>
                <span className="text-emerald-400 font-bold">{del.status}</span>
              </div>
            ))}
          </div>

          <div className="pt-4 border-t border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <span className="font-mono text-xs text-zinc-400">
              PR Status: <strong className="text-emerald-400">Approved by Senior Review</strong>
            </span>

            <button
              onClick={handleMergeAndShip}
              disabled={isSubmitting}
              className="group relative inline-flex h-13 w-full sm:w-auto items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-zinc-950 font-bold text-sm font-sans transition-all cursor-pointer shadow-xl shadow-amber-500/20 border-none disabled:opacity-50"
            >
              <GitMerge className="h-4 w-4" />
              <span>{isSubmitting ? "Merging Pull Request..." : "Merge Pull Request & Ship Sprint 2"}</span>
            </button>
          </div>
        </div>
      ) : (
        /* Step 3 & 4: Sprint Complete & Unlocked Next Sprint */
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-zinc-900/90 border border-emerald-500/40 p-6 sm:p-8 rounded-3xl space-y-6 shadow-2xl relative overflow-hidden"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-4">
            <div className="space-y-1">
              <span className="font-mono text-xs text-emerald-400 font-bold uppercase tracking-wider bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                🎉 SPRINT 2 SHIPPED &amp; MERGED
              </span>
              <h3 className="font-display text-2xl sm:text-3xl font-extrabold text-zinc-50">
                Pull Request #002 Merged!
              </h3>
            </div>

            <div className="h-14 w-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shadow-xl shrink-0">
              <Trophy className="h-7 w-7 text-emerald-400" />
            </div>
          </div>

          {/* Metrics Summary */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs">
            <div className="bg-zinc-950 p-4 rounded-2xl border border-zinc-800 space-y-1">
              <span className="text-[10px] text-zinc-500 uppercase block">Engineering Score</span>
              <span className="text-xl font-bold text-amber-400">9.2 / 10</span>
            </div>

            <div className="bg-zinc-950 p-4 rounded-2xl border border-zinc-800 space-y-1">
              <span className="text-[10px] text-zinc-500 uppercase block">Reputation Earned</span>
              <span className="text-xl font-bold text-emerald-400">+150 PTS</span>
            </div>

            <div className="bg-zinc-950 p-4 rounded-2xl border border-zinc-800 space-y-1">
              <span className="text-[10px] text-zinc-500 uppercase block">Promotion Progress</span>
              <span className="text-xl font-bold text-amber-400">72%</span>
            </div>

            <div className="bg-zinc-950 p-4 rounded-2xl border border-zinc-800 space-y-1">
              <span className="text-[10px] text-zinc-500 uppercase block">Unlocked</span>
              <span className="text-xs font-bold text-emerald-400 block">Sprint 3: Build MVP</span>
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <Link
              href="/dashboard"
              className="group inline-flex h-13 items-center justify-center gap-3 rounded-2xl bg-amber-500 hover:bg-amber-400 px-8 text-sm font-bold text-zinc-950 transition-all cursor-pointer shadow-xl shadow-amber-500/20 border-none font-sans no-underline"
            >
              <span>Continue to BuildOS Dashboard</span>
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
