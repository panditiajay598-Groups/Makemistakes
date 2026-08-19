"use client";

import React from "react";
import { Award, CheckCircle2, AlertCircle, Lightbulb, ShieldCheck, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

export default function SprintEngineeringReviewSection() {
  const reviewData = {
    overallScore: 8.6,
    maxScore: 10,
    strengths: [
      "Good separation of modules between Client UI, API routes, and database layer",
      "Clear API RESTful structure for submission processing",
      "Valid atomic token bucket rationale for Redis rate limiting",
    ],
    improvements: [
      "Authentication flow needs explicit JWT token expiration verification",
      "Database schema normalization can be enhanced for sprint_submissions foreign keys",
    ],
    suggestions: [
      "Reduce duplicate status endpoints across /api/user and /api/sprints",
      "Improve naming consistency in database migration constraints",
    ],
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
            <Award className="h-5 w-5 text-amber-400" />
            Engineering Code &amp; Architecture Review
          </h2>
          <p className="text-xs text-zinc-400 font-sans">
            Senior Engineering evaluation of your Sprint 1 &amp; Sprint 2 deliverables.
          </p>
        </div>
        <span className="font-mono text-xs text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20 font-bold">
          Verified Feedback
        </span>
      </div>

      {/* Score Hero Card */}
      <div className="bg-zinc-900/80 border border-amber-500/30 p-6 rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl relative overflow-hidden">
        <div className="space-y-2">
          <span className="font-mono text-xs font-bold text-amber-400 uppercase tracking-wider bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
            Senior Engineering Score
          </span>
          <h3 className="font-display text-3xl font-extrabold text-zinc-50">
            {reviewData.overallScore} <span className="text-zinc-500 text-lg">/ {reviewData.maxScore}</span>
          </h3>
          <p className="text-xs text-zinc-300">
            Strong architecture foundation. Meets senior engineering quality standards.
          </p>
        </div>

        <div className="h-24 w-24 rounded-2xl bg-amber-500/10 border border-amber-500/40 flex items-center justify-center font-mono font-bold text-2xl text-amber-400 shadow-xl shrink-0">
          8.6
        </div>
      </div>

      {/* Strengths */}
      <div className="bg-zinc-900/60 border border-zinc-800 p-6 rounded-3xl space-y-3">
        <div className="flex items-center gap-2 text-emerald-400 font-mono text-xs font-bold uppercase tracking-wider">
          <CheckCircle2 className="h-4 w-4" />
          <span>Strengths</span>
        </div>
        <ul className="space-y-2 text-xs font-sans text-zinc-200">
          {reviewData.strengths.map((str, idx) => (
            <li key={idx} className="flex items-start gap-2">
              <span className="text-emerald-400 font-bold">✓</span>
              <span>{str}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Improvements */}
      <div className="bg-zinc-900/60 border border-zinc-800 p-6 rounded-3xl space-y-3">
        <div className="flex items-center gap-2 text-amber-400 font-mono text-xs font-bold uppercase tracking-wider">
          <AlertCircle className="h-4 w-4" />
          <span>Needs Improvement</span>
        </div>
        <ul className="space-y-2 text-xs font-sans text-zinc-200">
          {reviewData.improvements.map((imp, idx) => (
            <li key={idx} className="flex items-start gap-2">
              <span className="text-amber-400 font-bold">•</span>
              <span>{imp}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Suggestions */}
      <div className="bg-zinc-900/60 border border-zinc-800 p-6 rounded-3xl space-y-3">
        <div className="flex items-center gap-2 text-blue-400 font-mono text-xs font-bold uppercase tracking-wider">
          <Lightbulb className="h-4 w-4" />
          <span>Actionable Suggestions</span>
        </div>
        <ul className="space-y-2 text-xs font-sans text-zinc-200">
          {reviewData.suggestions.map((sug, idx) => (
            <li key={idx} className="flex items-start gap-2">
              <span className="text-blue-400 font-bold">→</span>
              <span>{sug}</span>
            </li>
          ))}
        </ul>
      </div>
    </motion.div>
  );
}
