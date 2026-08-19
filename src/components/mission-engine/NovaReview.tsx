"use client";

import React from "react";
import {
  Bot,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  Lightbulb,
  ArrowRight,
  RefreshCw,
  Sparkles,
  Award,
} from "lucide-react";
import { NovaEvaluationResult, MissionData } from "./missionsData";

interface NovaReviewProps {
  mission: MissionData;
  evaluation: NovaEvaluationResult;
  onImproveSubmission: () => void;
  onCompleteMission: () => void;
}

export default function NovaReview({
  mission,
  evaluation,
  onImproveSubmission,
  onCompleteMission,
}: NovaReviewProps) {
  return (
    <div className="max-w-4xl mx-auto space-y-8 py-6 px-4 sm:px-6">
      
      {/* Nova Header Banner */}
      <section className="bg-white border border-teal-200/80 p-6 sm:p-8 rounded-3xl space-y-6 shadow-xl shadow-zinc-200/40 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-100 pb-5">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="h-12 w-12 rounded-2xl bg-teal-700 text-white font-mono font-bold text-base flex items-center justify-center shadow-md shadow-teal-700/20">
                Nova
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full bg-emerald-500 border-2 border-white animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-serif text-lg font-bold text-zinc-900">Nova</h3>
                <span className="font-mono text-[10px] text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200 font-bold">
                  Iteration {evaluation.iteration} Review
                </span>
              </div>
              <span className="text-xs font-mono text-zinc-500 block">Senior Engineering Mentor</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`font-mono text-xs font-bold px-3 py-1.5 rounded-full border ${
                evaluation.passed
                  ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                  : "bg-amber-50 border-amber-200 text-amber-900"
              }`}
            >
              {evaluation.passed ? "Criteria Satisfied ✓" : "Needs Iteration"}
            </span>
          </div>
        </div>

        {/* Overall Assessment */}
        <div className="p-4 rounded-2xl bg-teal-50/60 border border-teal-200/60 space-y-1">
          <span className="font-mono text-[10px] text-teal-800 font-bold uppercase tracking-wider block">
            EXECUTIVE EVALUATION
          </span>
          <p className="text-xs sm:text-sm font-sans font-medium text-teal-950 leading-relaxed italic">
            &quot;{evaluation.overallAssessment}&quot;
          </p>
        </div>
      </section>

      {/* 1. STRENGTHS */}
      {evaluation.strengths.length > 0 && (
        <section className="bg-white border border-zinc-200/80 p-6 rounded-3xl space-y-4 shadow-sm">
          <div className="flex items-center gap-2 font-mono text-xs text-emerald-800 font-bold uppercase tracking-wider border-b border-zinc-100 pb-3">
            <CheckCircle2 className="h-4 w-4 text-emerald-700" />
            <span>KEY STRENGTHS IDENTIFIED</span>
          </div>
          <div className="space-y-2.5">
            {evaluation.strengths.map((str, idx) => (
              <div key={idx} className="flex items-start gap-3 p-3.5 rounded-2xl bg-emerald-50/50 border border-emerald-200/60 text-xs font-sans text-emerald-950">
                <CheckCircle2 className="h-4 w-4 text-emerald-700 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{str}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 2. OBSERVATIONS & AREAS TO IMPROVE */}
      {evaluation.observations.length > 0 && (
        <section className="bg-white border border-zinc-200/80 p-6 rounded-3xl space-y-4 shadow-sm">
          <div className="flex items-center gap-2 font-mono text-xs text-amber-800 font-bold uppercase tracking-wider border-b border-zinc-100 pb-3">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
            <span>OBSERVATIONS &amp; TRADE-OFF GAPS</span>
          </div>
          <div className="space-y-2.5">
            {evaluation.observations.map((obs, idx) => (
              <div key={idx} className="flex items-start gap-3 p-3.5 rounded-2xl bg-amber-50/40 border border-amber-200/60 text-xs font-sans text-zinc-900">
                <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{obs}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 3. PROBING ARCHITECTURAL QUESTIONS */}
      {evaluation.probingQuestions.length > 0 && (
        <section className="bg-white border border-zinc-200/80 p-6 rounded-3xl space-y-4 shadow-sm">
          <div className="flex items-center gap-2 font-mono text-xs text-teal-800 font-bold uppercase tracking-wider border-b border-zinc-100 pb-3">
            <HelpCircle className="h-4 w-4 text-teal-700" />
            <span>NOVA&apos;S PROBING QUESTIONS</span>
          </div>
          <div className="space-y-2.5">
            {evaluation.probingQuestions.map((q, idx) => (
              <div key={idx} className="p-3.5 rounded-2xl bg-teal-50/40 border border-teal-200/60 text-xs font-sans text-teal-950 italic leading-relaxed">
                &quot;{q}&quot;
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 4. SENIOR ENGINEERING ADVICE */}
      {evaluation.engineeringAdvice && (
        <section className="bg-gradient-to-r from-teal-900 to-zinc-900 text-white p-6 rounded-3xl space-y-3 shadow-xl">
          <div className="flex items-center gap-2 font-mono text-xs text-teal-200 font-bold uppercase">
            <Sparkles className="h-4 w-4 text-teal-300" />
            <span>SENIOR MENTOR WISDOM</span>
          </div>
          <p className="text-xs sm:text-sm font-serif leading-relaxed text-zinc-100">
            {evaluation.engineeringAdvice}
          </p>
        </section>
      )}

      {/* ACTION BUTTONS */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
        <button
          onClick={onImproveSubmission}
          className="w-full sm:w-auto inline-flex h-13 items-center justify-center gap-2.5 rounded-full bg-white border border-zinc-300 hover:bg-zinc-100 text-zinc-900 px-8 text-xs sm:text-sm font-bold transition-all cursor-pointer shadow-sm font-sans"
        >
          <RefreshCw className="h-4 w-4 text-teal-700" />
          <span>Improve Submission (Iterate)</span>
        </button>

        <button
          onClick={onCompleteMission}
          className="w-full sm:w-auto inline-flex h-13 items-center justify-center gap-2.5 rounded-full bg-teal-700 hover:bg-teal-800 text-white px-9 text-xs sm:text-sm font-bold transition-all cursor-pointer border-none shadow-lg shadow-teal-700/25 font-sans"
        >
          <span>Complete Mission →</span>
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>

    </div>
  );
}
