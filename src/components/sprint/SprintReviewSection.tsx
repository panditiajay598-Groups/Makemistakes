"use client";

import React, { useState } from "react";
import { CheckCircle2, AlertCircle, Lightbulb, GitPullRequest, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";

interface SprintReviewSectionProps {
  hasSubmitted?: boolean;
  onProceedToShip?: () => void;
}

export default function SprintReviewSection({
  hasSubmitted = true,
  onProceedToShip,
}: SprintReviewSectionProps) {
  const reviewData = {
    prNumber: "#002",
    title: "PR #002: System Topology & Database Schema Implementation",
    author: "Sai (Associate Product Engineer)",
    overallScore: 8.6,
    strengths: [
      "Good separation of modules between Client UI, API routes, and database layer",
      "Clear API RESTful structure for submission processing",
      "Valid atomic token bucket rationale for Redis rate limiting",
    ],
    issues: [
      "Authentication flow needs explicit JWT token expiration verification",
      "Database schema normalization can be enhanced for sprint_submissions foreign keys",
    ],
    suggestions: [
      "Reduce duplicate status endpoints across /api/user and /api/sprints",
      "Improve naming consistency in database migration constraints",
    ],
  };

  if (!hasSubmitted) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="space-y-6 max-w-3xl mx-auto py-8 text-center font-sans"
      >
        <div className="bg-white border border-zinc-200/80 p-8 rounded-3xl space-y-4 shadow-xl shadow-zinc-200/40">
          <div className="h-12 w-12 rounded-2xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-700 mx-auto font-mono font-bold">
            PR
          </div>
          <h2 className="font-serif text-2xl font-bold text-zinc-900">Review Pending</h2>
          <p className="text-sm text-zinc-600 max-w-md mx-auto">
            Complete your task in the Build workspace and submit it to generate your Pull Request Code Review.
          </p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6 max-w-4xl mx-auto py-4 font-sans text-left"
    >
      {/* PR Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 pb-4">
        <div>
          <div className="flex items-center gap-2 font-mono text-xs">
            <span className="bg-emerald-50 border border-emerald-200 text-emerald-800 font-bold px-3 py-1 rounded-full flex items-center gap-1.5">
              <GitPullRequest className="h-3.5 w-3.5 text-emerald-700" />
              {reviewData.prNumber} • Open
            </span>
            <span className="text-zinc-500">Author: <strong className="text-zinc-900">{reviewData.author}</strong></span>
          </div>
          <h2 className="font-serif text-xl sm:text-2xl font-bold text-zinc-900 mt-1">
            {reviewData.title}
          </h2>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-white border border-zinc-200 px-4 py-2 rounded-2xl text-center shadow-sm">
            <span className="text-[10px] font-mono text-zinc-500 uppercase block">Engineering Score</span>
            <span className="font-mono text-lg font-bold text-teal-800">{reviewData.overallScore} / 10</span>
          </div>
        </div>
      </div>

      {/* PR Feedback Card */}
      <div className="bg-white border border-zinc-200/80 p-6 rounded-3xl space-y-6 shadow-xl shadow-zinc-200/40">
        {/* Strengths */}
        <div className="space-y-2">
          <span className="font-mono text-xs font-bold text-emerald-800 flex items-center gap-1.5 uppercase">
            <CheckCircle2 className="h-4 w-4 text-emerald-700" /> STRENGTHS
          </span>
          <ul className="space-y-1.5 text-xs text-zinc-700">
            {reviewData.strengths.map((str, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-emerald-700 font-bold">✓</span>
                <span>{str}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Issues Found */}
        <div className="space-y-2 border-t border-zinc-100 pt-4">
          <span className="font-mono text-xs font-bold text-rose-800 flex items-center gap-1.5 uppercase">
            <AlertCircle className="h-4 w-4 text-rose-700" /> ISSUES FOUND
          </span>
          <ul className="space-y-1.5 text-xs text-zinc-700">
            {reviewData.issues.map((iss, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-rose-700 font-bold">•</span>
                <span>{iss}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Suggestions */}
        <div className="space-y-2 border-t border-zinc-100 pt-4">
          <span className="font-mono text-xs font-bold text-blue-800 flex items-center gap-1.5 uppercase">
            <Lightbulb className="h-4 w-4 text-blue-700" /> SUGGESTIONS
          </span>
          <ul className="space-y-1.5 text-xs text-zinc-700">
            {reviewData.suggestions.map((sug, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-blue-700 font-bold">→</span>
                <span>{sug}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Actions Bar */}
        <div className="pt-4 border-t border-zinc-100 flex items-center justify-between">
          <span className="font-mono text-xs text-emerald-800 flex items-center gap-1 font-bold">
            <ShieldCheck className="h-4 w-4 text-emerald-700" /> Senior Review Status: Verified
          </span>

          <div className="flex items-center gap-3">
            <button
              onClick={() => onProceedToShip && onProceedToShip()}
              className="h-12 px-6 bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs font-sans rounded-full transition-all cursor-pointer border-none flex items-center gap-2 shadow-lg shadow-teal-700/20"
            >
              <span>Approve PR &amp; Proceed to Ship →</span>
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
