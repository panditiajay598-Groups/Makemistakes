"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Map,
  Globe,
  ShieldCheck,
  Users,
  Settings,
  Terminal,
  Lock,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Clock,
  ArrowRight,
  Zap,
  Circle,
  Package2,
} from "lucide-react";
import { getOnboardingProfile, UserOnboardingProfile } from "@/lib/onboardingStore";
import { getJourneyUserId } from "@/lib/journeyUser";
import {
  getOrInitJourneyProgress,
  isPhaseUnlocked,
  isPhaseCompleted,
  isMissionCompleted,
  getPhaseProgress,
  getOverallProgress,
} from "@/lib/productJourney/journeyStore";
import { PHASE_ORDER, PHASE_DEFINITIONS } from "@/lib/productJourney/phases";
import { MAKEMISTAKES_PRODUCT } from "@/lib/productJourney/sampleProduct";
import { JourneyProgress, PhaseId } from "@/lib/productJourney/types";

export default function JourneyRoadmapPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserOnboardingProfile | null>(null);
  const [progress, setProgress] = useState<JourneyProgress | null>(null);
  const [expandedPhases, setExpandedPhases] = useState<Set<PhaseId>>(new Set());

  const product = MAKEMISTAKES_PRODUCT;

  useEffect(() => {
    const activeProf = getOnboardingProfile();
    setProfile(activeProf);
    if (!activeProf?.onboardingCompleted) {
      router.push("/onboarding");
      return;
    }
    const p = getOrInitJourneyProgress(product);
    setProgress(p);
    // Auto-expand the active phase
    setExpandedPhases(new Set([p.currentPhaseId]));
  }, [router]);

  const navItems = [
    { id: "buildos",   label: "BuildOS",          icon: LayoutDashboard, href: "/dashboard" },
    { id: "journey",   label: "Product Journey",  icon: Map,             href: "/dashboard/journey" },
    { id: "products",  label: "Products",          icon: Globe,           href: "#" },
    { id: "portfolio", label: "Portfolio",         icon: ShieldCheck,     href: "#" },
    { id: "network",   label: "Builder Network",   icon: Users,           href: "#" },
    { id: "settings",  label: "Settings",          icon: Settings,        href: "#" },
  ];

  const userInitial = profile?.whoAreYouRole?.charAt(0)?.toUpperCase() ?? "N";

  const togglePhase = (phaseId: PhaseId) => {
    setExpandedPhases((prev) => {
      const next = new Set(prev);
      next.has(phaseId) ? next.delete(phaseId) : next.add(phaseId);
      return next;
    });
  };

  const overall = progress ? getOverallProgress(progress, product) : { completed: 0, total: 0 };
  const overallPct = overall.total > 0 ? Math.round((overall.completed / overall.total) * 100) : 0;

  return (
    <div className="h-screen bg-[#F5F5F0] text-zinc-900 font-sans antialiased selection:bg-teal-700 selection:text-white flex flex-col lg:flex-row overflow-hidden">

      {/* ================================================================ */}
      {/* SIDEBAR                                                            */}
      {/* ================================================================ */}
      <aside className="w-full lg:w-[210px] h-auto lg:h-screen bg-white border-b lg:border-b-0 lg:border-r border-zinc-200 flex flex-col justify-between shrink-0 py-6 px-4 overflow-y-auto lg:sticky lg:top-0 z-30">
        <div className="flex flex-col gap-6">
          <Link
            href="/"
            className="flex items-center gap-2.5 text-zinc-900 font-bold no-underline group px-1"
          >
            <div className="h-8 w-8 rounded-xl bg-teal-700 flex items-center justify-center text-white font-black text-xs font-mono shadow-sm shadow-teal-700/20 group-hover:scale-105 transition-transform shrink-0">
              <Terminal className="h-4 w-4 text-white" />
            </div>
            <div className="leading-tight">
              <span className="font-bold text-base block text-zinc-900 tracking-tight">BuildOS</span>
              <span className="text-[10px] font-mono text-teal-700 block font-semibold -mt-0.5">
                MakeMistakes OS v6.0
              </span>
            </div>
          </Link>

          <nav className="flex flex-col gap-1">
            {navItems.map((item) => {
              const Icon     = item.icon;
              const isActive = item.id === "journey";
              return (
                <button
                  key={item.id}
                  onClick={() => { if (item.href !== "#") router.push(item.href); }}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs sm:text-[13px] font-sans transition-all cursor-pointer border ${
                    isActive
                      ? "bg-teal-50 border-teal-100 text-teal-900 font-semibold"
                      : "text-zinc-500 hover:text-zinc-800 hover:bg-zinc-50 border-transparent font-normal"
                  }`}
                >
                  <Icon
                    className={`h-4 w-4 shrink-0 ${
                      isActive ? "text-teal-700" : "text-zinc-400"
                    }`}
                  />
                  <span className="truncate">{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="px-1 pt-4">
          <div className="h-9 w-9 rounded-full bg-zinc-800 flex items-center justify-center text-white text-xs font-bold font-mono select-none">
            {userInitial}
          </div>
        </div>
      </aside>

      {/* ================================================================ */}
      {/* MAIN CONTENT                                                       */}
      {/* ================================================================ */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-y-auto">

        {/* Header */}
        <header className="h-14 border-b border-zinc-200 bg-white px-7 flex items-center justify-between shrink-0 sticky top-0 z-20">
          <div>
            <h1 className="text-sm font-bold text-zinc-900 tracking-tight font-sans">
              Product Journey
            </h1>
            <p className="text-[11px] text-zinc-400 font-sans -mt-0.5">
              {product.name}
            </p>
          </div>
          {/* Overall progress pill */}
          <div className="flex items-center gap-2.5">
            <div className="w-20 h-1.5 bg-zinc-100 border border-zinc-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-teal-600 rounded-full transition-all"
                style={{ width: `${overallPct}%` }}
              />
            </div>
            <span className="text-[11px] font-mono text-zinc-400">{overallPct}%</span>
          </div>
        </header>

        {/* Journey Timeline */}
        <main className="flex-1 overflow-y-auto p-6 sm:p-8">
          <div className="max-w-xl mx-auto space-y-2">

            {/* Product header */}
            <div className="flex items-center gap-3 mb-6">
              <div className="h-9 w-9 rounded-xl bg-zinc-900 flex items-center justify-center shrink-0">
                <Package2 className="h-4 w-4 text-white" />
              </div>
              <div>
                <h2 className="font-serif text-sm font-bold text-zinc-900">
                  {product.name}
                </h2>
                <p className="text-[10px] font-mono text-zinc-400 mt-0.5">
                  {product.category}
                </p>
              </div>
            </div>

            {/* ── Phase cards ── */}
            {PHASE_ORDER.map((phaseId, idx) => {
              if (!progress) return null;

              const def        = PHASE_DEFINITIONS[phaseId];
              const unlocked   = isPhaseUnlocked(phaseId, progress);
              const completed  = isPhaseCompleted(phaseId, progress);
              const isActive   = progress.currentPhaseId === phaseId;
              const isExpanded = expandedPhases.has(phaseId);
              const phaseData  = product.phases.find((p) => p.phaseId === phaseId);
              const { completed: doneMissions, total: totalMissions } = getPhaseProgress(
                phaseId, progress, product
              );

              return (
                <div key={phaseId} className="relative">
                  {/* Vertical connector */}
                  {idx < PHASE_ORDER.length - 1 && (
                    <div
                      className={`absolute left-[17px] top-full w-px h-2 z-10 ${
                        completed ? "bg-emerald-200" : "bg-zinc-200"
                      }`}
                    />
                  )}

                  <div
                    className={`rounded-xl border overflow-hidden transition-all duration-200 ${
                      completed
                        ? "border-emerald-200 bg-emerald-50/30"
                        : isActive
                        ? "border-teal-200 bg-teal-50/30 shadow-sm"
                        : unlocked
                        ? "border-zinc-200 bg-white"
                        : "border-zinc-100 bg-zinc-50/60"
                    }`}
                  >
                    {/* Phase row */}
                    <button
                      onClick={() => unlocked && togglePhase(phaseId)}
                      disabled={!unlocked}
                      className={`w-full flex items-center gap-3 px-4 py-3.5 text-left transition-colors ${
                        unlocked
                          ? "cursor-pointer hover:bg-black/[0.015]"
                          : "cursor-default"
                      }`}
                    >
                      {/* Phase icon */}
                      <div
                        className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 text-sm ${
                          completed
                            ? "bg-emerald-100"
                            : isActive
                            ? "bg-teal-100"
                            : unlocked
                            ? "bg-zinc-100"
                            : "bg-zinc-100"
                        }`}
                      >
                        {completed ? (
                          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                        ) : !unlocked ? (
                          <Lock className="h-3.5 w-3.5 text-zinc-300" />
                        ) : (
                          <span>{def.emoji}</span>
                        )}
                      </div>

                      {/* Phase info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span
                            className={`text-sm font-semibold ${
                              completed
                                ? "text-emerald-800"
                                : isActive
                                ? "text-teal-900"
                                : unlocked
                                ? "text-zinc-700"
                                : "text-zinc-400"
                            }`}
                          >
                            {def.label}
                          </span>
                          {isActive && (
                            <span className="text-[9px] font-mono font-bold text-teal-700 bg-teal-100 px-1.5 py-0.5 rounded uppercase tracking-wide">
                              Active
                            </span>
                          )}
                          {completed && (
                            <span className="text-[9px] font-mono font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded uppercase tracking-wide">
                              Done
                            </span>
                          )}
                        </div>
                        <p
                          className={`text-[11px] mt-0.5 leading-relaxed ${
                            unlocked ? "text-zinc-500" : "text-zinc-400"
                          }`}
                        >
                          {unlocked
                            ? def.purpose
                            : "Complete the previous phase to unlock"}
                        </p>
                      </div>

                      {/* Right: count + chevron */}
                      <div className="shrink-0 flex items-center gap-2.5">
                        {unlocked && (
                          <span className="text-[10px] font-mono text-zinc-400">
                            {doneMissions}/{totalMissions}
                          </span>
                        )}
                        {unlocked && (
                          isExpanded
                            ? <ChevronDown className="h-3.5 w-3.5 text-zinc-400" />
                            : <ChevronRight className="h-3.5 w-3.5 text-zinc-400" />
                        )}
                      </div>
                    </button>

                    {/* ── Mission list (expanded) ── */}
                    {isExpanded && unlocked && phaseData && (
                      <div className="border-t border-zinc-100">
                        {phaseData.missions.map((mission, mIdx) => {
                          const mDone     = isMissionCompleted(mission.id, progress);
                          const isCurrent =
                            mission.id === progress.currentMissionId && isActive;
                          // A mission is locked if the previous one isn't done yet
                          const prevMission = phaseData.missions.find(
                            (m) => m.order === mission.order - 1
                          );
                          const mLocked =
                            mission.order > 1 &&
                            !mDone &&
                            !isMissionCompleted(prevMission?.id ?? "", progress);

                          return (
                            <div
                              key={mission.id}
                              className={`flex items-center gap-3 px-4 py-3 ${
                                mIdx < phaseData.missions.length - 1
                                  ? "border-b border-zinc-100"
                                  : ""
                              } ${isCurrent ? "bg-teal-50/50" : ""}`}
                            >
                              {/* Mission status icon */}
                              <div
                                className={`h-6 w-6 rounded-md flex items-center justify-center shrink-0 ${
                                  mDone
                                    ? "bg-emerald-100"
                                    : isCurrent
                                    ? "bg-teal-100"
                                    : "bg-zinc-100"
                                }`}
                              >
                                {mDone ? (
                                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                                ) : isCurrent ? (
                                  <Zap className="h-3.5 w-3.5 text-teal-600" />
                                ) : mLocked ? (
                                  <Lock className="h-3 w-3 text-zinc-300" />
                                ) : (
                                  <Circle className="h-3.5 w-3.5 text-zinc-300" />
                                )}
                              </div>

                              {/* Mission info */}
                              <div className="flex-1 min-w-0">
                                <p
                                  className={`text-xs font-semibold truncate ${
                                    mDone
                                      ? "text-emerald-800"
                                      : isCurrent
                                      ? "text-teal-900"
                                      : mLocked
                                      ? "text-zinc-400"
                                      : "text-zinc-700"
                                  }`}
                                >
                                  {mission.title}
                                </p>
                                <div className="flex items-center gap-2 mt-0.5">
                                  <span className="text-[10px] font-mono text-zinc-400 flex items-center gap-1">
                                    <Clock className="h-2.5 w-2.5" />
                                    {mission.estimatedTime}
                                  </span>
                                  <span
                                    className={`text-[10px] font-mono ${
                                      mission.difficulty === "Beginner"
                                        ? "text-emerald-600"
                                        : mission.difficulty === "Intermediate"
                                        ? "text-amber-600"
                                        : "text-rose-600"
                                    }`}
                                  >
                                    {mission.difficulty}
                                  </span>
                                </div>
                              </div>

                              {/* Go CTA for current mission */}
                              {isCurrent && (
                                <button
                                  onClick={async () => {
                                    const phaseStepMap: Record<string, number> = {
                                      discover: 1,
                                      research: 2,
                                      design: 3,
                                      plan: 4,
                                      build: 5,
                                      test: 6,
                                      launch: 7,
                                      improve: 8,
                                    };
                                    const stepNum = phaseStepMap[phaseId] || 1;
                                    try {
                                      const res = await fetch(
                                        `/api/journey/active?userId=${encodeURIComponent(getJourneyUserId())}`
                                      );
                                      if (res.ok) {
                                        const data = await res.json();
                                        if (data.problemId) {
                                          window.location.href = `/journey/${data.problemId}?step=${stepNum}`;
                                          return;
                                        }
                                      }
                                    } catch (e) {}
                                    window.location.href = `/journey/P000001?step=${stepNum}`;
                                  }}
                                  className="flex items-center gap-1 text-[10px] font-mono text-teal-700 hover:text-teal-900 transition-colors cursor-pointer shrink-0"
                                >
                                  Go <ArrowRight className="h-3 w-3" />
                                </button>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {/* ── Version 1.0 Released milestone ── */}
            <div className="flex items-center gap-3 pt-1 pl-1">
              <div className="h-8 w-8 rounded-lg bg-zinc-100 border border-zinc-200 flex items-center justify-center shrink-0 text-sm">
                🏁
              </div>
              <div>
                <p className="text-xs font-semibold text-zinc-500">
                  Version 1.0 Released
                </p>
                <p className="text-[10px] font-mono text-zinc-400 mt-0.5">
                  Complete all phases to ship your product
                </p>
              </div>
            </div>

          </div>
        </main>
      </div>
    </div>
  );
}
