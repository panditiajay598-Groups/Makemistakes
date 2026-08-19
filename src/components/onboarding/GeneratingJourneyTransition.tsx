"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  CheckCircle2,
  Rocket,
  Terminal,
  Cpu,
  Layers,
  Brain,
  ShieldCheck,
  Globe,
  Zap,
  ChevronRight,
  Code2,
  Sliders,
} from "lucide-react";
import { BuilderProfileMetrics } from "./BuilderAssessment";
import { saveOnboardingProfile, getOnboardingProfile } from "@/lib/onboardingStore";

interface GeneratingJourneyTransitionProps {
  assessmentMetrics: BuilderProfileMetrics | null;
  onFinishTransition: () => void;
}

// 5 Premium Title Alternatives specified in requirements
const TITLE_ALTERNATIVES = [
  "Generating Your Personalized Journey...",
  "Preparing Your Product Journey...",
  "Creating Your Engineering Roadmap...",
  "Building Your Learning Experience...",
  "Personalizing Your Product Journey...",
  "Setting Up Your BuildOS...",
];

// Subtitle variations tailored for executive engineering feel
const SUBTITLE_VARIATIONS = [
  "We're combining your goals, product choice, and engineering mindset to create a personalized product-building journey.",
  "Synthesizing your developer identity, architectural choices, and Mission Zero metrics into a custom BuildOS workspace.",
  "Constructing your 8-sprint agile product roadmap with dedicated AI Senior Mentor Nova guidance.",
];

export default function GeneratingJourneyTransition({
  assessmentMetrics,
  onFinishTransition,
}: GeneratingJourneyTransitionProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [progressPercentage, setProgressPercentage] = useState(0);
  const [isReady, setIsReady] = useState(false);
  const [selectedTitleIndex, setSelectedTitleIndex] = useState(0);
  const [activeSubtitle, setActiveSubtitle] = useState(SUBTITLE_VARIATIONS[0]);
  const [userProfile, setUserProfile] = useState<any>(null);

  // Load contextual info from onboarding store
  useEffect(() => {
    const prof = getOnboardingProfile();
    setUserProfile(prof);
  }, []);

  const steps = [
    {
      id: 1,
      label: "Analyzing your Developer Identity...",
      detail: "Synthesizing career vision, technical experience, and learning style",
      category: "Developer Identity",
      percentage: 20,
    },
    {
      id: 2,
      label: "Preparing your Builder Profile...",
      detail: "Evaluating problem solving, debugging, and system architecture metrics",
      category: "Builder Assessment",
      percentage: 40,
    },
    {
      id: 3,
      label: "Generating product roadmap...",
      detail: "Structuring Sprint 1–8 milestones, technical specs, and deliverables",
      category: "Product Track",
      percentage: 60,
    },
    {
      id: 4,
      label: "Planning your first missions...",
      detail: "Configuring problem discovery, solution wireframes, and customer briefs",
      category: "Agile Sprints",
      percentage: 80,
    },
    {
      id: 5,
      label: "Configuring BuildOS workspace...",
      detail: "Provisioning Senior AI Engineering Mentor Nova & workspace environment",
      category: "BuildOS OS",
      percentage: 100,
    },
  ];

  // 1. Smooth Loading Progress & Step Animation (Duration ~2.5s total)
  useEffect(() => {
    // Increment percentage smoothly to 100%
    const progressInterval = setInterval(() => {
      setProgressPercentage((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + 1;
      });
    }, 24); // 100 steps * 24ms = 2.4 seconds

    // Step timeline progression (500ms intervals)
    const stepInterval = setInterval(() => {
      setCurrentStepIndex((prev) => {
        if (prev < steps.length) {
          return prev + 1;
        }
        clearInterval(stepInterval);
        return prev;
      });
    }, 500);

    return () => {
      clearInterval(progressInterval);
      clearInterval(stepInterval);
    };
  }, [steps.length]);

  // 2. Persist state and trigger 800ms completion pause when progress reaches 100%
  useEffect(() => {
    if (progressPercentage >= 100 && currentStepIndex >= steps.length) {
      setIsReady(true);

      // Persist complete onboarding state into localStorage / onboardingStore
      saveOnboardingProfile({
        onboardingCompleted: true,
        foundingJourneyCompleted: true,
        mission0Completed: true,
        missionZeroCompleted: true,
        missionControlInitialized: true,
        promotionRank: "Associate Product Engineer",
        engineeringReputation: 250,
        startingLevel: "Founding Engineer Candidate",
        experienceLevel: "Intermediate",
        currentSprintId: "sprint-1",
        currentSprintTitle: "Sprint 1: Problem Discovery",
        nextSprintTitle: "Sprint 2: Solution Design",
        currentTask: "Validate customer problem & construct user personas",
        startingMissionId: "sprint-1",
        startingMissionTitle: "Sprint 1: Problem Discovery",
        badges: ["Founding Candidate", "Associate Product Engineer", "Mission Zero Hero"],
        assessmentScores: {
          problemSolving: assessmentMetrics?.problemSolving === "Advanced" ? 94 : 85,
          debugging: assessmentMetrics?.debugging === "Advanced" ? 92 : 82,
          frontend: 86,
          backend: 88,
          databases: assessmentMetrics?.architecture === "Advanced" ? 93 : 81,
          apiDesign: 90,
          systemThinking: assessmentMetrics?.planning === "Advanced" ? 95 : 84,
          communication: 91,
          criticalThinking: 89,
          productThinking: assessmentMetrics?.userThinking === "Advanced" ? 96 : 87,
          decisionMaking: 90,
        },
      });

      // Pause for exactly 800ms before auto-navigating to /dashboard
      const finishTimer = setTimeout(() => {
        onFinishTransition();
      }, 800);

      return () => clearTimeout(finishTimer);
    }
  }, [progressPercentage, currentStepIndex, steps.length, assessmentMetrics, onFinishTransition]);

  // Floating particles generator for ambient background effect
  const particles = Array.from({ length: 14 }).map((_, i) => ({
    id: i,
    size: Math.random() * 4 + 2,
    x: Math.random() * 100,
    y: Math.random() * 100,
    duration: Math.random() * 6 + 6,
    delay: Math.random() * 2,
  }));

  return (
    <div className="fixed inset-0 z-50 bg-zinc-950 text-white font-sans selection:bg-teal-500 selection:text-black flex flex-col items-center justify-center p-4 sm:p-6 overflow-hidden select-none">
      
      {/* ========================================================================= */}
      {/* BACKGROUND GRAPHICS: SOFT GRADIENTS, FLOATING PARTICLES, MESH GRID */}
      {/* ========================================================================= */}
      
      {/* Soft Ambient Radial Gradients */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_35%,rgba(13,148,136,0.22),transparent_70%)] pointer-events-none" />
      <div className="absolute top-1/4 left-1/4 h-[500px] w-[500px] rounded-full bg-teal-500/10 blur-[120px] pointer-events-none animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 h-[500px] w-[500px] rounded-full bg-emerald-500/10 blur-[120px] pointer-events-none animate-pulse" />
      <div className="absolute top-1/2 right-1/3 h-[350px] w-[350px] rounded-full bg-cyan-500/10 blur-[100px] pointer-events-none" />

      {/* Modern Cyber Grid Mask Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#18181b_1px,transparent_1px),linear-gradient(to_bottom,#18181b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-25 pointer-events-none" />

      {/* Floating Particle Animation Layer */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {particles.map((p) => (
          <motion.div
            key={p.id}
            initial={{ opacity: 0.1, y: `${p.y}%`, x: `${p.x}%` }}
            animate={{
              opacity: [0.1, 0.6, 0.1],
              y: [`${p.y}%`, `${(p.y - 20 + 100) % 100}%`],
            }}
            transition={{
              duration: p.duration,
              repeat: Infinity,
              delay: p.delay,
              ease: "linear",
            }}
            style={{ width: p.size, height: p.size }}
            className="absolute rounded-full bg-teal-400/60 shadow-[0_0_8px_rgba(45,212,191,0.8)]"
          />
        ))}
      </div>

      {/* ========================================================================= */}
      {/* MAIN CONTAINER: GLASSMORPHISM CARD */}
      {/* ========================================================================= */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-2xl bg-zinc-900/90 border border-zinc-800/90 p-6 sm:p-10 rounded-3xl backdrop-blur-2xl shadow-2xl shadow-teal-950/60 relative z-10 space-y-7 text-left overflow-hidden"
      >
        
        {/* Subtle top reflective shine line */}
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-teal-500/50 to-transparent" />

        {/* ------------------------------------------------------------------------- */}
        {/* HEADER SECTION: LOGO, TITLE showcase & SWITCHER */}
        {/* ------------------------------------------------------------------------- */}
        <div className="space-y-4">
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-teal-950 to-zinc-900 border border-teal-700/60 flex items-center justify-center text-teal-400 shadow-inner shadow-teal-500/20">
                <Sparkles className="h-6 w-6 animate-pulse text-teal-300" />
              </div>

              <div>
                <span className="font-mono text-[10px] uppercase font-bold text-teal-400 tracking-wider block">
                  MakeMistakes AI Engine
                </span>
                <span className="text-xs text-zinc-400 font-mono">
                  Personalized Journey Generator v6.0
                </span>
              </div>
            </div>

            {/* Title Alternative Switcher Pill */}
            <div className="relative group">
              <button
                onClick={() => setSelectedTitleIndex((prev) => (prev + 1) % TITLE_ALTERNATIVES.length)}
                className="font-mono text-[11px] font-bold text-teal-300 bg-teal-950/80 border border-teal-800/80 hover:border-teal-600 px-3.5 py-1.5 rounded-full flex items-center gap-2 transition-all cursor-pointer shadow-sm"
                title="Click to toggle title variation"
              >
                <Sliders className="h-3 w-3 text-teal-400" />
                <span>Title {selectedTitleIndex + 1}/6</span>
              </button>
            </div>
          </div>

          {/* Main Animated Title */}
          <div>
            <AnimatePresence mode="wait">
              <motion.h1
                key={selectedTitleIndex}
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 6 }}
                transition={{ duration: 0.25 }}
                className="font-serif text-2xl sm:text-4xl font-bold text-white tracking-tight leading-tight"
              >
                {TITLE_ALTERNATIVES[selectedTitleIndex]}
              </motion.h1>
            </AnimatePresence>

            <p className="text-xs sm:text-sm text-zinc-400 font-sans mt-2.5 leading-relaxed">
              {activeSubtitle}
            </p>
          </div>

          {/* User Input Context Pills */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-800/80 border border-zinc-700/60 font-mono text-[11px] text-teal-300">
              <Code2 className="h-3 w-3 text-teal-400" />
              <span>Track: <strong className="text-white">{userProfile?.currentProduct || "AI Workspace Assistant"}</strong></span>
            </span>

            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-800/80 border border-zinc-700/60 font-mono text-[11px] text-emerald-300">
              <Brain className="h-3 w-3 text-emerald-400" />
              <span>Identity: <strong className="text-white">{userProfile?.whoAreYouRole || "Associate Product Engineer"}</strong></span>
            </span>

            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-800/80 border border-zinc-700/60 font-mono text-[11px] text-cyan-300">
              <Zap className="h-3 w-3 text-cyan-400" />
              <span>Mission Zero: <strong className="text-white">Validated ✓</strong></span>
            </span>
          </div>

        </div>

        {/* ------------------------------------------------------------------------- */}
        {/* PROGRESS BAR & PERCENTAGE DISPLAY */}
        {/* ------------------------------------------------------------------------- */}
        <div className="space-y-2.5 pt-1">
          <div className="flex items-center justify-between font-mono text-xs text-zinc-400">
            <span className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-teal-400 animate-ping" />
              <span>Building Your BuildOS Environment</span>
            </span>
            <span className="text-teal-400 font-bold text-sm">{progressPercentage}%</span>
          </div>

          {/* Premium Progress Track */}
          <div className="h-3 w-full bg-zinc-950/80 rounded-full overflow-hidden border border-zinc-800 p-0.5 relative shadow-inner">
            <motion.div
              className="h-full bg-gradient-to-r from-teal-500 via-emerald-400 to-cyan-400 rounded-full relative"
              style={{ width: `${progressPercentage}%` }}
              transition={{ ease: "easeOut" }}
            >
              {/* Animated highlight shimmer on leading edge */}
              <div className="absolute top-0 right-0 bottom-0 w-4 bg-white/40 blur-[2px] animate-pulse" />
            </motion.div>
          </div>
        </div>

        {/* ------------------------------------------------------------------------- */}
        {/* ANIMATED LOADING STEPS LIST (Steps 1 to 5) */}
        {/* ------------------------------------------------------------------------- */}
        <div className="space-y-2.5 pt-1">
          {steps.map((step, idx) => {
            const isCompleted = idx < currentStepIndex || progressPercentage >= step.percentage;
            const isCurrent = idx === currentStepIndex && progressPercentage < 100;

            return (
              <motion.div
                key={step.id}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.08, duration: 0.3 }}
                className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between font-sans text-xs ${
                  isCompleted
                    ? "bg-teal-950/30 border-teal-900/60 text-zinc-200"
                    : isCurrent
                    ? "bg-zinc-800/80 border-teal-500/60 text-white shadow-lg ring-1 ring-teal-500/30"
                    : "bg-zinc-900/40 border-zinc-800/60 text-zinc-500"
                }`}
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  
                  {/* Step Icon / Number Indicator */}
                  <div
                    className={`h-8 w-8 rounded-xl flex items-center justify-center font-mono text-xs font-bold shrink-0 transition-all ${
                      isCompleted
                        ? "bg-teal-500 text-zinc-950 shadow-md shadow-teal-500/30"
                        : isCurrent
                        ? "bg-teal-950 text-teal-300 border border-teal-600 animate-pulse shadow-md"
                        : "bg-zinc-800 text-zinc-600 border border-zinc-700"
                    }`}
                  >
                    {isCompleted ? (
                      <motion.div
                        initial={{ scale: 0.5, rotate: -45 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ type: "spring", stiffness: 400 }}
                      >
                        <CheckCircle2 className="h-4 w-4 stroke-[3]" />
                      </motion.div>
                    ) : (
                      step.id
                    )}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`font-bold block text-xs truncate ${isCompleted || isCurrent ? "text-white" : "text-zinc-500"}`}>
                        {step.label}
                      </span>
                    </div>

                    <span className="text-[10px] font-mono text-zinc-400 block truncate mt-0.5">
                      {step.detail}
                    </span>
                  </div>

                </div>

                {/* Step Status Badges */}
                <div className="shrink-0 ml-3">
                  {isCompleted && (
                    <motion.span
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="font-mono text-[10px] font-bold text-teal-300 bg-teal-950/90 border border-teal-800/80 px-2.5 py-1 rounded-full flex items-center gap-1 shadow-sm"
                    >
                      <span>✓ Completed</span>
                    </motion.span>
                  )}

                  {isCurrent && (
                    <span className="font-mono text-[10px] font-bold text-teal-400 bg-teal-950/60 border border-teal-700/60 px-2.5 py-1 rounded-full animate-pulse flex items-center gap-1.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-teal-400 animate-ping" />
                      <span>Processing...</span>
                    </span>
                  )}

                  {!isCompleted && !isCurrent && (
                    <span className="font-mono text-[10px] text-zinc-600 bg-zinc-900 border border-zinc-800 px-2 py-0.5 rounded">
                      Queued
                    </span>
                  )}
                </div>

              </motion.div>
            );
          })}
        </div>

        {/* ------------------------------------------------------------------------- */}
        {/* COMPLETION ANNOUNCEMENT BANNER (Triggers at 100%) */}
        {/* ------------------------------------------------------------------------- */}
        <AnimatePresence>
          {isReady && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ type: "spring", stiffness: 350, damping: 25 }}
              className="p-4 rounded-2xl bg-emerald-950/90 border border-emerald-500/70 text-emerald-200 font-sans text-xs font-bold flex items-center justify-between gap-3 shadow-xl shadow-emerald-950/50"
            >
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-xl bg-emerald-900 border border-emerald-600 flex items-center justify-center text-emerald-300 shrink-0">
                  <Rocket className="h-5 w-5 animate-bounce" />
                </div>
                <div>
                  <span className="block font-bold text-white text-sm">
                    🚀 Your first product is waiting.
                  </span>
                  <span className="block text-[11px] font-mono text-emerald-300 font-normal">
                    ✅ Your personalized journey is ready. Navigating to BuildOS Dashboard...
                  </span>
                </div>
              </div>

              <span className="font-mono text-[10px] text-emerald-300 bg-emerald-900/80 px-2.5 py-1 rounded-full border border-emerald-700 animate-pulse shrink-0">
                Opening Dashboard →
              </span>
            </motion.div>
          )}
        </AnimatePresence>

      </motion.div>
    </div>
  );
}
