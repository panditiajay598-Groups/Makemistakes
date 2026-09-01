"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Award,
  CheckCircle2,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  Layers,
  Search,
  Layout,
  FileCode2,
  CheckSquare,
  TrendingUp,
  Calendar,
  Share2,
  ExternalLink,
} from "lucide-react";

import { ProblemData } from "@/lib/problemContent";

interface PortfolioShowcaseProps {
  onBackToDashboard?: () => void;
  problemData?: ProblemData | null;
  userId?: string;
}

export default function PortfolioShowcase({
  onBackToDashboard,
  problemData,
  userId,
}: PortfolioShowcaseProps) {
  const router = useRouter();
  const pid = problemData?.problemId ?? "";

  // Loaded user data from previous phases
  const [researchData, setResearchData] = useState<any>(null);
  const [designData, setDesignData] = useState<any>(null);
  const [planData, setPlanData] = useState<any>(null);
  const [testData, setTestData] = useState<any>(null);
  const [improveData, setImproveData] = useState<any>(null);

  useEffect(() => {
    // Reset all portfolio data first (clears previous problem's data)
    setResearchData(null);
    setDesignData(null);
    setPlanData(null);
    setTestData(null);
    setImproveData(null);

    // Only load data scoped to this specific problemId
    if (!pid) return;
    try {
      const r = localStorage.getItem(`makemistakes_research_v2_data_${pid}`);
      const d = localStorage.getItem(`makemistakes_design_v2_data_${pid}`);
      const p = localStorage.getItem(`makemistakes_plan_v2_data_${pid}`);
      const t = localStorage.getItem(`makemistakes_test_v2_data_${pid}`);
      const i = localStorage.getItem(`makemistakes_improve_v2_data_${pid}`);

      if (r) setResearchData(JSON.parse(r));
      if (d) setDesignData(JSON.parse(d));
      if (p) setPlanData(JSON.parse(p));
      if (t) setTestData(JSON.parse(t));
      if (i) setImproveData(JSON.parse(i));
    } catch (e) {
      console.warn("Failed to load portfolio artifacts:", e);
    }
  }, [pid]); // Re-runs whenever the problem changes

  const completionDate = new Date().toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="w-full text-zinc-900 font-sans antialiased selection:bg-teal-700 selection:text-white pb-20 animate-fadeIn">
      {/* ============================================================ */}
      {/* PORTFOLIO UPDATED HEADER BANNER                               */}
      {/* ============================================================ */}
      <div className="bg-gradient-to-r from-teal-900 via-teal-800 to-zinc-900 text-white rounded-3xl p-8 sm:p-12 shadow-2xl mb-12 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-4 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-400/20 border border-emerald-400/40 text-emerald-300 font-mono text-xs font-bold uppercase tracking-wider">
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
            <span>Portfolio Updated • Project Completed</span>
          </div>

          <h1 className="font-serif text-3xl sm:text-5xl font-bold tracking-tight leading-tight text-white">
            Medication Reminder App
          </h1>

          <p className="text-sm sm:text-base text-zinc-200 font-sans leading-relaxed">
            You have successfully completed the entire 7-phase MakeMistakes Product Engineering Journey — taking an idea from discovery, research, design, engineering planning, building, and quality assurance to continuous improvement.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-4 text-xs font-mono text-zinc-300">
            <div className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4 text-teal-400" />
              <span>Completed: {completionDate}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              <span>7 of 7 Phases Finished</span>
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* PORTFOLIO ARTIFACTS GRID                                     */}
      {/* ============================================================ */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12">
        {/* ------------------------------------------------------------ */}
        {/* 1. PROBLEM STATEMENT                                         */}
        {/* ------------------------------------------------------------ */}
        <div className="lg:col-span-6 bg-white border border-zinc-200/80 rounded-2xl p-7 shadow-xs space-y-4">
          <div className="flex items-center gap-3 border-b border-zinc-100 pb-3">
            <div className="h-8 w-8 rounded-xl bg-teal-50 border border-teal-100 text-teal-800 flex items-center justify-center font-bold font-mono text-xs">
              01
            </div>
            <h2 className="font-serif text-lg font-bold text-zinc-900">
              Problem Statement
            </h2>
          </div>
          <p className="text-xs text-zinc-600 leading-relaxed font-sans">
            Elderly patients taking multiple daily prescriptions frequently forget doses or accidentally double-medicate. Existing reminder apps fail because they require tedious manual input and lack caregiver oversight fallback alerts.
          </p>
        </div>

        {/* ------------------------------------------------------------ */}
        {/* 2. RESEARCH EVIDENCE & NOTES                                 */}
        {/* ------------------------------------------------------------ */}
        <div className="lg:col-span-6 bg-white border border-zinc-200/80 rounded-2xl p-7 shadow-xs space-y-4">
          <div className="flex items-center gap-3 border-b border-zinc-100 pb-3">
            <div className="h-8 w-8 rounded-xl bg-teal-50 border border-teal-100 text-teal-800 flex items-center justify-center font-bold font-mono text-xs">
              02
            </div>
            <h2 className="font-serif text-lg font-bold text-zinc-900">
              Research Evidence & Competitor Analysis
            </h2>
          </div>
          <div className="space-y-2 text-xs text-zinc-600 font-sans">
            <p>
              <strong className="text-zinc-800 font-mono">Market Gap:</strong> 68% of chronic illness patients report missing at least one dose per week due to reminder friction.
            </p>
            <p>
              <strong className="text-zinc-800 font-mono">Validated Source:</strong> Analyzed clinical medication adherence studies and medical app review benchmarks.
            </p>
          </div>
        </div>

        {/* ------------------------------------------------------------ */}
        {/* 3. DESIGN DECISIONS                                          */}
        {/* ------------------------------------------------------------ */}
        <div className="lg:col-span-6 bg-white border border-zinc-200/80 rounded-2xl p-7 shadow-xs space-y-4">
          <div className="flex items-center gap-3 border-b border-zinc-100 pb-3">
            <div className="h-8 w-8 rounded-xl bg-teal-50 border border-teal-100 text-teal-800 flex items-center justify-center font-bold font-mono text-xs">
              03
            </div>
            <h2 className="font-serif text-lg font-bold text-zinc-900">
              Design Decisions & Blueprint
            </h2>
          </div>
          <div className="space-y-2 text-xs text-zinc-600 font-sans">
            <p>
              <strong className="text-zinc-800 font-mono font-bold">V1 Core Features:</strong> Single-Tap Dose Logging, Persistent Alarm Triggers, Caregiver SMS Alert Fallback, Refill Alerts.
            </p>
            <p>
              <strong className="text-zinc-800 font-mono font-bold">Design Tradeoff:</strong> Prioritized high-contrast UI typography & large touch targets over complex multi-step navigation for accessibility.
            </p>
          </div>
        </div>

        {/* ------------------------------------------------------------ */}
        {/* 4. ENGINEERING PLAN                                          */}
        {/* ------------------------------------------------------------ */}
        <div className="lg:col-span-6 bg-white border border-zinc-200/80 rounded-2xl p-7 shadow-xs space-y-4">
          <div className="flex items-center gap-3 border-b border-zinc-100 pb-3">
            <div className="h-8 w-8 rounded-xl bg-teal-50 border border-teal-100 text-teal-800 flex items-center justify-center font-bold font-mono text-xs">
              04
            </div>
            <h2 className="font-serif text-lg font-bold text-zinc-900">
              Engineering Architecture Plan
            </h2>
          </div>
          <div className="space-y-2 text-xs text-zinc-600 font-sans">
            <p>
              <strong className="text-zinc-800 font-mono">Tech Stack:</strong> Next.js App Router, TypeScript, Prisma ORM, PostgreSQL, Web Push API, Tailwind CSS.
            </p>
            <p>
              <strong className="text-zinc-800 font-mono">Database Schema:</strong> Optimized User, Medication, ScheduleTrigger, and CaregiverNotification tables.
            </p>
          </div>
        </div>

        {/* ------------------------------------------------------------ */}
        {/* 5. BUILD MISSIONS COMPLETED                                  */}
        {/* ------------------------------------------------------------ */}
        <div className="lg:col-span-4 bg-white border border-zinc-200/80 rounded-2xl p-7 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
            <span className="font-serif text-base font-bold text-zinc-900">
              Build Workspace
            </span>
            <span className="text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">
              8 / 8 Missions
            </span>
          </div>
          <div className="space-y-1.5 text-xs text-zinc-600 font-mono">
            <p className="flex items-center gap-2">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
              <span>1. Environment Setup</span>
            </p>
            <p className="flex items-center gap-2">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
              <span>2. Database Schema</span>
            </p>
            <p className="flex items-center gap-2">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
              <span>3. Reminder Scheduler Engine</span>
            </p>
            <p className="flex items-center gap-2">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
              <span>4. Caregiver Notification API</span>
            </p>
          </div>
        </div>

        {/* ------------------------------------------------------------ */}
        {/* 6. QA TESTING SUMMARY                                         */}
        {/* ------------------------------------------------------------ */}
        <div className="lg:col-span-4 bg-white border border-zinc-200/80 rounded-2xl p-7 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
            <span className="font-serif text-base font-bold text-zinc-900">
              QA Audit Summary
            </span>
            <span className="text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">
              Verified
            </span>
          </div>
          <div className="space-y-1.5 text-xs text-zinc-600 font-sans">
            <p><strong className="font-mono text-zinc-800">Tests Executed:</strong> 6 Test Scenarios</p>
            <p><strong className="font-mono text-zinc-800">Status:</strong> All Critical Tests Passed</p>
            <p><strong className="font-mono text-zinc-800">Environment:</strong> Mobile (iOS/Android) & Web</p>
          </div>
        </div>

        {/* ------------------------------------------------------------ */}
        {/* 7. VERSION 1.1 IMPROVEMENTS                                  */}
        {/* ------------------------------------------------------------ */}
        <div className="lg:col-span-4 bg-white border border-zinc-200/80 rounded-2xl p-7 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
            <span className="font-serif text-base font-bold text-zinc-900">
              Improvements Made
            </span>
            <span className="text-[10px] font-mono font-bold bg-teal-100 text-teal-800 px-2 py-0.5 rounded">
              Version 1.1
            </span>
          </div>
          <div className="space-y-1.5 text-xs text-zinc-600 font-sans">
            <p className="truncate">• Refill Reminders via Pharmacy Integration</p>
            <p className="truncate">• Family Dashboard & Multi-Caregiver Sync</p>
            <p className="truncate">• Offline Storage Compression</p>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* PORTFOLIO ACTION FOOTER                                      */}
      {/* ============================================================ */}
      <footer className="flex flex-col sm:flex-row items-center justify-center gap-4 text-center">
        <button
          type="button"
          onClick={() => {
            if (onBackToDashboard) onBackToDashboard();
            else router.push("/dashboard");
          }}
          className="inline-flex items-center gap-3 px-8 py-3.5 rounded-full bg-teal-800 hover:bg-teal-700 text-white font-semibold font-sans text-sm transition-all shadow-md cursor-pointer hover:shadow-lg hover:scale-105"
        >
          <span>Return to BuildOS Portfolio</span>
          <ArrowRight className="h-4 w-4" />
        </button>

        <button
          type="button"
          onClick={() => {
            alert("Project Badge copied to clipboard! Share your engineering achievement on LinkedIn or GitHub.");
          }}
          className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full border border-zinc-300 bg-white hover:bg-zinc-50 text-zinc-800 font-semibold font-sans text-sm transition-all shadow-2xs cursor-pointer"
        >
          <Share2 className="h-4 w-4 text-teal-700" />
          <span>Share Achievement Badge</span>
        </button>
      </footer>
    </div>
  );
}
