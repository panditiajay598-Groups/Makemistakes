"use client";

import React from "react";
import {
  Rocket,
  Clock,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  BookOpen,
  Target,
  FileCode2,
  ShieldCheck,
} from "lucide-react";
import { MissionData } from "./missionsData";
import ResourceSection from "./ResourceSection";

interface MissionBriefProps {
  mission: MissionData;
  onStartWorking: () => void;
}

export default function MissionBrief({ mission, onStartWorking }: MissionBriefProps) {
  return (
    <div className="max-w-4xl mx-auto space-y-8 py-6 px-4 sm:px-6">
      
      {/* 1. HERO BRIEF HEADER */}
      <section className="bg-white border border-zinc-200/80 p-6 sm:p-8 rounded-3xl space-y-6 shadow-xl shadow-zinc-200/40 relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="font-mono text-xs text-teal-800 font-bold bg-teal-50 px-3 py-1 rounded-full border border-teal-200 flex items-center gap-1.5">
                <Rocket className="h-3.5 w-3.5 text-teal-700" />
                MISSION {mission.number} BRIEFING
              </span>
              <span className="font-mono text-xs text-zinc-600 bg-zinc-100 px-3 py-1 rounded-full border border-zinc-200">
                Product: <strong className="text-zinc-900 font-semibold">{mission.productName}</strong>
              </span>
            </div>

            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-zinc-900 tracking-tight">
              {mission.title}
            </h1>

            <div className="flex items-center gap-4 text-xs font-mono text-zinc-500 pt-1">
              <span className="flex items-center gap-1.5">
                <Clock className="h-4 w-4 text-teal-700" />
                Est. Time: <strong className="text-zinc-900">{mission.estimatedTime}</strong>
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5">
                <Sparkles className="h-4 w-4 text-amber-500" />
                Reward: <strong className="text-teal-800">+{mission.xpReward} PTS</strong>
              </span>
              <span>•</span>
              <span className="text-teal-800 font-bold">{mission.difficulty} Level</span>
            </div>
          </div>

          <div className="shrink-0 pt-2 md:pt-0">
            <button
              onClick={onStartWorking}
              className="group inline-flex h-13 items-center justify-center gap-3 rounded-full bg-teal-700 px-8 text-sm font-bold text-white transition-all hover:bg-teal-800 active:scale-98 cursor-pointer border-none shadow-lg shadow-teal-700/25 font-sans"
            >
              <span>Start Working →</span>
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </button>
          </div>
        </div>
      </section>

      {/* 2. LEARNING OUTCOMES */}
      <section className="bg-teal-50/60 border border-teal-200/80 p-6 rounded-3xl space-y-4 shadow-sm">
        <div className="flex items-center gap-2 font-mono text-xs text-teal-800 font-bold uppercase tracking-wider">
          <Sparkles className="h-4 w-4 text-teal-700" />
          <span>LEARNING OUTCOMES</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-sans">
          {mission.learningOutcomes.map((outcome, idx) => (
            <div key={idx} className="flex items-start gap-2.5 bg-white p-3.5 rounded-2xl border border-teal-200/60 text-zinc-800 font-medium">
              <CheckCircle2 className="h-4 w-4 text-teal-700 shrink-0 mt-0.5" />
              <span>{outcome}</span>
            </div>
          ))}
        </div>
      </section>

      {/* 3. BACKGROUND STORY & PROBLEM STATEMENT */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Background Story */}
        <section className="bg-white border border-zinc-200/80 p-6 rounded-3xl space-y-3 shadow-sm">
          <span className="font-mono text-xs text-zinc-500 font-bold uppercase tracking-wider block">
            BACKGROUND STORY
          </span>
          <p className="text-xs sm:text-sm text-zinc-700 font-sans leading-relaxed">
            {mission.backgroundStory}
          </p>
        </section>

        {/* Problem Statement */}
        <section className="bg-white border border-amber-200/80 p-6 rounded-3xl space-y-3 shadow-sm bg-amber-50/30">
          <span className="font-mono text-xs text-amber-800 font-bold uppercase tracking-wider block flex items-center gap-1.5">
            <AlertCircle className="h-4 w-4 text-amber-600" />
            PROBLEM STATEMENT
          </span>
          <p className="text-xs sm:text-sm text-zinc-800 font-sans font-medium leading-relaxed">
            {mission.problemStatement}
          </p>
        </section>

      </div>

      {/* 4. OBJECTIVES & DELIVERABLES */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Objectives */}
        <section className="bg-white border border-zinc-200/80 p-6 rounded-3xl space-y-4 shadow-sm">
          <div className="flex items-center gap-2 font-mono text-xs text-teal-800 font-bold uppercase tracking-wider border-b border-zinc-100 pb-3">
            <Target className="h-4 w-4 text-teal-700" />
            <span>CORE OBJECTIVES</span>
          </div>
          <ul className="space-y-2.5 text-xs font-sans text-zinc-700">
            {mission.objectives.map((obj, idx) => (
              <li key={idx} className="flex items-start gap-2.5">
                <span className="h-5 w-5 rounded-full bg-teal-50 border border-teal-200 text-teal-800 font-mono text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                  {idx + 1}
                </span>
                <span>{obj}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* Deliverables */}
        <section className="bg-white border border-zinc-200/80 p-6 rounded-3xl space-y-4 shadow-sm">
          <div className="flex items-center gap-2 font-mono text-xs text-teal-800 font-bold uppercase tracking-wider border-b border-zinc-100 pb-3">
            <FileCode2 className="h-4 w-4 text-teal-700" />
            <span>EXPECTED DELIVERABLES</span>
          </div>
          <div className="space-y-3 text-xs font-sans">
            {mission.deliverables.map((del) => (
              <div key={del.id} className="p-3 rounded-2xl bg-zinc-50 border border-zinc-200 space-y-1">
                <h5 className="font-bold text-zinc-900">{del.title}</h5>
                <p className="text-zinc-600 text-[11px] leading-snug">{del.description}</p>
              </div>
            ))}
          </div>
        </section>

      </div>

      {/* 5. RESOURCES & RULES */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        <div className="md:col-span-7">
          <ResourceSection resources={mission.resources} />
        </div>

        <div className="md:col-span-5 space-y-4 bg-white border border-zinc-200/80 p-6 rounded-3xl shadow-sm">
          <div className="flex items-center gap-2 font-mono text-xs text-zinc-800 font-bold uppercase tracking-wider border-b border-zinc-100 pb-3">
            <ShieldCheck className="h-4 w-4 text-teal-700" />
            <span>GUIDELINES & RULES</span>
          </div>
          <ul className="space-y-2 text-xs font-sans text-zinc-600">
            {mission.rules.map((rule, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-teal-700 font-bold">•</span>
                <span>{rule}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* 6. BOTTOM CTA BAR */}
      <div className="pt-4 flex justify-center">
        <button
          onClick={onStartWorking}
          className="group inline-flex h-14 items-center justify-center gap-3 rounded-full bg-teal-700 px-10 text-base font-bold text-white transition-all hover:bg-teal-800 active:scale-98 cursor-pointer border-none shadow-xl shadow-teal-700/25 font-sans"
        >
          <span>Start Working →</span>
          <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
        </button>
      </div>

    </div>
  );
}
