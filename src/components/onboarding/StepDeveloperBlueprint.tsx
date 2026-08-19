"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Bot,
  Brain,
  Rocket,
  CheckCircle2,
  Calendar,
  Layers,
  ArrowLeft,
} from "lucide-react";
import { UserOnboardingProfile } from "@/lib/onboardingStore";

interface StepDeveloperBlueprintProps {
  profile: UserOnboardingProfile | null;
  onNext: () => void;
  onBack: () => void;
}

export default function StepDeveloperBlueprint({
  profile,
  onNext,
  onBack,
}: StepDeveloperBlueprintProps) {
  const roleTitle = profile?.whoAreYouRole || "Founding Product Engineer";
  const productTitle = profile?.currentProduct || "AI Co-Pilot & Workspace Assistant";

  const roadmapMonths = [
    { month: "Month 1–2", title: "Product Architecture & API Design", detail: "System topology, PostgreSQL schemas, and Next.js REST API routes." },
    { month: "Month 3–4", title: "Full-Stack Core & Auth", detail: "Multi-tenant authentication, state queues, and database migrations." },
    { month: "Month 5–6", title: "AI Integration & Production Ship", detail: "Vector embeddings, LLM agent pipelines, and deployment." },
  ];

  const skillRadar = [
    { label: "Problem Solving", score: 85 },
    { label: "System Architecture", score: 82 },
    { label: "API Design & REST", score: 88 },
    { label: "Database Schemas", score: 78 },
    { label: "AI & Automation", score: 84 },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="w-full max-w-4xl mx-auto py-4 font-sans text-left space-y-8 select-none"
    >
      {/* Top Navigation */}
      <div className="flex items-center justify-between font-mono text-xs text-zinc-500">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-zinc-600 hover:text-zinc-900 transition-colors cursor-pointer bg-transparent border-none font-mono text-xs font-semibold"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Product Selection</span>
        </button>

        <div className="flex items-center gap-2">
          <span className="font-bold text-teal-800 bg-teal-50 px-3 py-1 rounded-full border border-teal-200 flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-teal-700" />
            DEVELOPER BLUEPRINT
          </span>
          <span className="font-semibold text-zinc-700">Step 4 of 6</span>
        </div>
      </div>

      {/* Main Blueprint Card Header */}
      <div className="bg-white border border-teal-200/80 p-6 sm:p-8 rounded-3xl space-y-6 shadow-xl shadow-zinc-200/40 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-100 pb-4">
          <div>
            <span className="font-mono text-xs font-bold text-teal-800 uppercase tracking-widest block">
              YOUR PERSONALIZED BLUEPRINT
            </span>
            <h1 className="font-serif text-2xl sm:text-4xl font-bold text-zinc-900 tracking-tight mt-1">
              Engineering Profile &amp; Target Roadmap
            </h1>
          </div>

          <div className="h-12 w-12 rounded-2xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-700 shadow-sm shrink-0">
            <Rocket className="h-6 w-6" />
          </div>
        </div>

        {/* Customized Track Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-sans">
          <div className="bg-zinc-50 p-4 rounded-2xl border border-zinc-200 space-y-1">
            <span className="font-mono text-[10px] text-zinc-500 uppercase block font-bold">Assigned Engineering Track</span>
            <h3 className="font-serif text-base font-bold text-zinc-900">{roleTitle}</h3>
            <p className="text-zinc-600 text-[11px]">
              Customized based on your Developer Identity discovery responses.
            </p>
          </div>

          <div className="bg-zinc-50 p-4 rounded-2xl border border-zinc-200 space-y-1">
            <span className="font-mono text-[10px] text-zinc-500 uppercase block font-bold">First Target Product</span>
            <h3 className="font-serif text-base font-bold text-teal-800">{productTitle}</h3>
            <p className="text-zinc-600 text-[11px]">
              You will build and deploy this product across your upcoming sprints.
            </p>
          </div>
        </div>

        {/* Assigned AI Mentor Section */}
        <div className="bg-teal-50/60 border border-teal-200/80 p-5 rounded-2xl space-y-2 flex items-start gap-4">
          <div className="relative shrink-0">
            <div className="h-10 w-10 rounded-xl bg-teal-700 text-white font-mono font-bold text-sm flex items-center justify-center">
              Nova
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-emerald-500 border-2 border-white animate-pulse" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-serif text-sm font-bold text-zinc-900">Nova</span>
              <span className="text-[10px] font-mono text-teal-700 bg-white px-2 py-0.5 rounded border border-teal-200 font-bold">
                Assigned Senior Mentor
              </span>
            </div>
            <p className="text-xs text-zinc-700 italic font-sans leading-relaxed">
              &quot;Welcome aboard! I&apos;ll be your senior engineering mentor throughout MakeMistakes. I will review your code PRs, guide your architecture decisions, and help you debug complex bugs.&quot;
            </p>
          </div>
        </div>

        {/* 6-Month Career Milestone Roadmap */}
        <div className="space-y-3 pt-2">
          <span className="font-mono text-xs font-bold text-zinc-900 uppercase tracking-wider block">
            6-Month Milestone Progression
          </span>

          <div className="space-y-2.5">
            {roadmapMonths.map((m, idx) => (
              <div key={idx} className="p-3.5 rounded-2xl bg-zinc-50 border border-zinc-200 flex items-center justify-between text-xs font-sans">
                <div className="flex items-center gap-3">
                  <div className="h-7 w-7 rounded-lg bg-white border border-zinc-200 text-teal-700 font-mono font-bold text-[11px] flex items-center justify-center shrink-0">
                    {idx + 1}
                  </div>
                  <div>
                    <span className="font-bold text-zinc-900 block">{m.title}</span>
                    <span className="text-[11px] text-zinc-600">{m.detail}</span>
                  </div>
                </div>
                <span className="font-mono text-[10px] text-teal-800 bg-white px-2.5 py-1 rounded-full border border-zinc-200 font-semibold shrink-0">
                  {m.month}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-4 border-t border-zinc-100 flex justify-end">
          <button
            onClick={onNext}
            className="group relative inline-flex h-13 w-full sm:w-auto items-center justify-center gap-3 rounded-full bg-teal-700 hover:bg-teal-800 px-9 text-sm font-bold text-white transition-all cursor-pointer shadow-lg shadow-teal-700/20 border-none font-sans"
          >
            <span>Confirm Blueprint &amp; Start Mission Zero →</span>
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
