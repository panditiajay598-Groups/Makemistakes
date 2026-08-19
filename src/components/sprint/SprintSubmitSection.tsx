"use client";

import React, { useState } from "react";
import {
  Send,
  Trophy,
  ArrowRight,
  FileCode2,
  Eye,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

interface SprintSubmitSectionProps {
  onSprintSubmitted?: () => void;
}

export default function SprintSubmitSection({ onSprintSubmitted }: SprintSubmitSectionProps) {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewItem, setPreviewItem] = useState<{ title: string; content: string } | null>(null);

  const deliverables = [
    {
      title: "Sprint 1 Discovery Brief",
      type: "Product Brief",
      status: "Submitted ✓",
      content: "Problem Thesis: Students watch tutorials but fail to build products. Recommendation: Build MakeMistakes simulator.",
    },
    {
      title: "System Architecture Diagram (Topology)",
      type: "C4 Diagram",
      status: "Submitted ✓",
      content: "Client UI -> Next.js API Routes -> Redis Token Bucket Rate Limiter -> PostgreSQL DB.",
    },
    {
      title: "PostgreSQL Database Schema DDL",
      type: "SQL Script",
      status: "Ready ✓",
      content: "CREATE TABLE users (id UUID PRIMARY KEY, promotion_rank VARCHAR(100)); CREATE TABLE sprint_submissions...",
    },
    {
      title: "API Route Definitions (/api/sprints)",
      type: "TypeScript",
      status: "Ready ✓",
      content: "export async function POST(req: Request) { /* Submit Sprint Deliverables */ }",
    },
  ];

  const handleSubmitSprint = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
      if (onSprintSubmitted) onSprintSubmitted();
    }, 1200);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6 max-w-4xl mx-auto py-4 font-sans text-left relative"
    >
      <div className="flex items-center justify-between border-b border-zinc-200 pb-3">
        <div>
          <h2 className="font-serif text-2xl font-bold text-zinc-900 flex items-center gap-2">
            <Send className="h-5 w-5 text-teal-700" />
            5. Submit Sprint Deliverables
          </h2>
          <p className="text-xs text-zinc-600 font-sans">
            Validate deliverables checklist, review submission preview, and submit Sprint 2.
          </p>
        </div>
        <span className="font-mono text-xs text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 font-bold">
          {isSubmitted ? "Submitted ✓" : "Ready for Submission"}
        </span>
      </div>

      {!isSubmitted ? (
        /* STEP 1: Deliverables Checklist & Submit Button */
        <div className="bg-white border border-zinc-200/80 p-6 sm:p-8 rounded-3xl space-y-6 shadow-xl shadow-zinc-200/40">
          <div className="space-y-2">
            <span className="font-mono text-xs font-bold text-teal-800 uppercase tracking-wider bg-teal-50 px-3 py-1 rounded-full border border-teal-200">
              Deliverables Checklist
            </span>
            <h3 className="font-serif text-xl font-bold text-zinc-900">
              Review Deliverables Before Final Submission
            </h3>
          </div>

          <div className="space-y-2.5 font-mono text-xs">
            {deliverables.map((del, idx) => (
              <div key={idx} className="p-3.5 rounded-2xl bg-zinc-50 border border-zinc-200 flex items-center justify-between">
                <div className="flex items-center gap-2.5 text-zinc-900">
                  <FileCode2 className="h-4 w-4 text-teal-700 shrink-0" />
                  <div>
                    <span className="font-bold block">{del.title}</span>
                    <span className="text-[10px] text-zinc-500">{del.type}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-emerald-700 font-bold">{del.status}</span>
                  <button
                    onClick={() => setPreviewItem({ title: del.title, content: del.content })}
                    className="h-7 px-2.5 bg-white hover:bg-zinc-100 text-zinc-700 rounded-lg border border-zinc-200 font-mono text-[11px] flex items-center gap-1 cursor-pointer shadow-sm"
                  >
                    <Eye className="h-3 w-3" /> Preview
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-4 border-t border-zinc-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <span className="font-mono text-xs text-zinc-600">
              Prerequisites: <strong className="text-emerald-700 font-bold">4 of 4 Acceptance Criteria Passed</strong>
            </span>

            <button
              onClick={handleSubmitSprint}
              disabled={isSubmitting}
              className="group relative inline-flex h-13 w-full sm:w-auto items-center justify-center gap-3 rounded-full bg-teal-700 hover:bg-teal-800 text-white font-bold text-sm font-sans transition-all cursor-pointer shadow-lg shadow-teal-700/20 border-none disabled:opacity-50"
            >
              <Send className="h-4 w-4" />
              <span>{isSubmitting ? "Submitting Sprint..." : "Submit Sprint 2 Deliverables"}</span>
            </button>
          </div>
        </div>
      ) : (
        /* STEP 2: After Submission Dashboard */
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white border border-emerald-200 p-6 sm:p-8 rounded-3xl space-y-6 shadow-xl shadow-zinc-200/40 relative overflow-hidden"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-100 pb-4">
            <div className="space-y-1">
              <span className="font-mono text-xs text-emerald-800 font-bold uppercase tracking-wider bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                🎉 SPRINT 2 COMPLETED &amp; SUBMITTED
              </span>
              <h3 className="font-serif text-2xl sm:text-3xl font-bold text-zinc-900">
                Sprint 2 Submitted Successfully!
              </h3>
            </div>

            <div className="h-14 w-14 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 shadow-sm shrink-0">
              <Trophy className="h-7 w-7 text-emerald-700" />
            </div>
          </div>

          {/* After Submission Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs">
            <div className="bg-zinc-50 p-4 rounded-2xl border border-zinc-200 space-y-1">
              <span className="text-[10px] text-zinc-500 uppercase block">Engineering Score</span>
              <span className="text-xl font-bold text-teal-800">9.2 / 10</span>
            </div>

            <div className="bg-zinc-50 p-4 rounded-2xl border border-zinc-200 space-y-1">
              <span className="text-[10px] text-zinc-500 uppercase block">Reputation Earned</span>
              <span className="text-xl font-bold text-emerald-700">+150 PTS</span>
            </div>

            <div className="bg-zinc-50 p-4 rounded-2xl border border-zinc-200 space-y-1">
              <span className="text-[10px] text-zinc-500 uppercase block">Promotion Progress</span>
              <span className="text-xl font-bold text-teal-800">72%</span>
            </div>

            <div className="bg-zinc-50 p-4 rounded-2xl border border-zinc-200 space-y-1">
              <span className="text-[10px] text-zinc-500 uppercase block">Unlocked</span>
              <span className="text-xs font-bold text-emerald-700 block">Sprint 3: Build MVP</span>
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <Link
              href="/dashboard"
              className="group inline-flex h-13 items-center justify-center gap-3 rounded-full bg-teal-700 hover:bg-teal-800 px-8 text-sm font-bold text-white transition-all cursor-pointer shadow-lg shadow-teal-700/20 border-none font-sans no-underline"
            >
              <span>Continue to BuildOS Dashboard</span>
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </motion.div>
      )}

      {/* Preview Modal */}
      <AnimatePresence>
        {previewItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/60 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg bg-white border border-zinc-200 p-6 rounded-3xl space-y-4 shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
                <span className="font-mono text-xs font-bold text-teal-800">{previewItem.title}</span>
                <button
                  onClick={() => setPreviewItem(null)}
                  className="text-zinc-400 hover:text-zinc-700 bg-transparent border-none cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="bg-zinc-900 p-4 rounded-2xl border border-zinc-800 font-mono text-xs text-teal-300 leading-relaxed max-h-48 overflow-y-auto shadow-inner">
                {previewItem.content}
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={() => setPreviewItem(null)}
                  className="px-5 py-2 bg-teal-700 text-white font-bold text-xs rounded-full border-none cursor-pointer font-sans shadow-sm"
                >
                  Close Preview
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
