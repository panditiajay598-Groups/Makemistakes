"use client";

import React, { useState } from "react";
import {
  Rocket,
  CheckCircle2,
  Send,
  Trophy,
  ArrowRight,
  ShieldCheck,
  Target,
  FileText,
  Clock,
  Sparkles,
  HelpCircle,
  Edit3,
  Check,
  ChevronRight,
  Flame,
  Users,
  AlertCircle,
  Lightbulb,
  Layers,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { StepMissionOneProps } from "./types";
import { completeSprintOne } from "@/lib/onboardingStore";

export default function StepMissionOne({ onCompleteMission }: StepMissionOneProps) {
  // Mode selection state
  const [learningMode, setLearningMode] = useState<"guided" | "assisted" | "independent" | null>(null);

  // Active step in Sprint 1 (0 = Mode Select, 1 to 6 = Discovery Steps, 7 = Final Brief Review)
  const [currentStep, setCurrentStep] = useState(0);

  // Form selections & inputs
  const [selectedProblems, setSelectedProblems] = useState<string[]>([
    "Students only watch tutorials",
    "Lack of real-world projects",
    "No feedback on their work",
  ]);
  const [whyReasoning, setWhyReasoning] = useState(
    "Passive video watching creates a false sense of progress. Without building real products and getting feedback, concepts don't stick."
  );
  const [selectedUsers, setSelectedUsers] = useState<string[]>([
    "Engineering Students",
    "Bootcamp Graduates",
    "Self-Taught Developers",
  ]);
  const [priorities, setPriorities] = useState<Record<string, "High" | "Medium" | "Low">>({
    "Students only watch tutorials": "High",
    "Lack of real-world projects": "High",
    "No feedback on their work": "Medium",
  });
  const [evidenceChoices, setEvidenceChoices] = useState<string[]>([
    "I experienced it myself",
    "College experience",
  ]);
  const [evidenceText, setEvidenceText] = useState("");
  const [productSolutions, setProductSolutions] = useState<string[]>([
    "Product Simulations",
    "Real User Feedback",
  ]);

  // UI helpers
  const [showInspiration, setShowInspiration] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editMode, setEditMode] = useState(false);

  // Problem Cards Options
  const problemOptions = [
    "Students only watch tutorials",
    "They don't practice enough",
    "Fear of making mistakes",
    "Lack of real-world projects",
    "No feedback on their work",
    "They don't know what to build",
  ];

  // User Personas Options
  const userPersonaOptions = [
    "Engineering Students",
    "Bootcamp Graduates",
    "Self-Taught Developers",
    "Working Professionals",
    "Career Switchers",
    "Founders",
    "Freelancers",
  ];

  // Evidence Options
  const evidenceOptions = [
    "I experienced it myself",
    "Friends experienced it",
    "College experience",
    "Online discussions",
    "Social media",
  ];

  // Solution Decision Options
  const solutionOptions = [
    "AI Mentor",
    "Hands-on Projects",
    "Product Simulations",
    "Team Projects",
    "Real User Feedback",
    "Interview Practice",
  ];

  const toggleSelection = (list: string[], item: string, setter: (val: string[]) => void) => {
    if (list.includes(item)) {
      if (list.length > 1) setter(list.filter((i) => i !== item));
    } else {
      setter([...list, item]);
    }
  };

  const handleFinalSubmission = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      completeSprintOne(150, "Associate Product Engineer");
      setIsSubmitting(false);
      onCompleteMission();
    }, 1000);
  };

  // Helper auto-generated Summary Brief text
  const generatedBrief = {
    problem: `Students struggle to transition into engineers because: ${selectedProblems.join(", ")}. ${whyReasoning}`,
    targetUsers: selectedUsers.join(", "),
    priorities: Object.entries(priorities)
      .map(([k, v]) => `${k} (${v} Priority)`)
      .join("; "),
    evidence: `${evidenceChoices.join(", ")}${evidenceText ? ` — ${evidenceText}` : ""}`,
    recommendation: `Build MakeMistakes prioritizing ${productSolutions.join(" & ")}.`,
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4 }}
      className="space-y-6 max-w-5xl mx-auto py-4 px-4 text-left font-sans"
    >
      {/* Top Banner Header */}
      <div className="rounded-3xl border border-zinc-800 bg-zinc-900/80 p-6 sm:p-8 backdrop-blur-xl space-y-4 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-4">
          <div className="flex items-center gap-2 font-mono text-xs">
            <span className="bg-amber-500/10 border border-amber-500/30 text-amber-400 font-bold px-3 py-1 rounded-full flex items-center gap-1.5">
              <Rocket className="h-3.5 w-3.5" />
              Sprint 1 • Task 1 of 3
            </span>
            <span className="text-zinc-400">Mode: <strong className="text-amber-400 capitalize">{learningMode || "Guided"}</strong></span>
          </div>

          <div className="flex items-center gap-2 font-mono text-xs text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
            <Clock className="h-3.5 w-3.5" />
            <span>Est. Time: 15–20 Minutes</span>
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="font-display text-2xl sm:text-4xl font-extrabold text-zinc-50 tracking-tight">
            Sprint 1: Guided Product Discovery
          </h1>
          <p className="text-sm text-zinc-300 font-sans leading-relaxed">
            Investigate why students finish tutorials but struggle to build software products independently. By the end of this Sprint, the platform will compile your findings into a live **Discovery Brief**.
          </p>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* STEP 0: LEARNING MODE SELECTION */}
      {/* ========================================================================= */}
      {currentStep === 0 && (
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <div className="rounded-3xl border border-zinc-800 bg-zinc-900/60 p-6 sm:p-8 backdrop-blur-xl space-y-6">
            <div className="space-y-2 text-center max-w-xl mx-auto">
              <span className="font-mono text-xs font-bold text-amber-400 uppercase tracking-wider bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
                Learning Preference
              </span>
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-zinc-100">
                How would you like to complete this Sprint?
              </h2>
              <p className="text-xs text-zinc-400">You can change this preference anytime in settings.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
              {/* Guided Mode */}
              <div
                onClick={() => setLearningMode("guided")}
                className={`p-5 rounded-2xl border cursor-pointer transition-all space-y-3 ${learningMode === "guided" || learningMode === null
                  ? "bg-zinc-900 border-emerald-500/80 ring-1 ring-emerald-500/40 shadow-xl"
                  : "bg-zinc-950/60 border-zinc-800 hover:border-zinc-700"
                  }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded border border-emerald-500/20 font-bold">
                    🟢 Guided Mode (Recommended)
                  </span>
                </div>
                <h3 className="font-display text-base font-bold text-zinc-100">Step-by-Step Guidance</h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  We'll guide you step by step with cards, personas, and prompts. Perfect if you're new to product building.
                </p>
              </div>

              {/* Assisted Mode */}
              <div
                onClick={() => setLearningMode("assisted")}
                className={`p-5 rounded-2xl border cursor-pointer transition-all space-y-3 ${learningMode === "assisted"
                  ? "bg-zinc-900 border-amber-500/80 ring-1 ring-amber-500/40 shadow-xl"
                  : "bg-zinc-950/60 border-zinc-800 hover:border-zinc-700"
                  }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded border border-amber-500/20 font-bold">
                    🟡 Assisted Mode
                  </span>
                </div>
                <h3 className="font-display text-base font-bold text-zinc-100">Hints &amp; Frameworks</h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  We'll provide hint cards and framework templates, but you'll make all product decisions.
                </p>
              </div>

              {/* Independent Mode */}
              <div
                onClick={() => setLearningMode("independent")}
                className={`p-5 rounded-2xl border cursor-pointer transition-all space-y-3 ${learningMode === "independent"
                  ? "bg-zinc-900 border-rose-500/80 ring-1 ring-rose-500/40 shadow-xl"
                  : "bg-zinc-950/60 border-zinc-800 hover:border-zinc-700"
                  }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs text-rose-400 bg-rose-500/10 px-2.5 py-1 rounded border border-rose-500/20 font-bold">
                    🔴 Independent Mode
                  </span>
                </div>
                <h3 className="font-display text-base font-bold text-zinc-100">Unrestricted Workspace</h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Complete the Sprint without step-by-step guidance. Recommended for experienced builders.
                </p>
              </div>
            </div>

            <div className="pt-2 flex justify-center">
              <button
                onClick={() => setCurrentStep(1)}
                className="group inline-flex h-13 items-center justify-center gap-3 rounded-2xl bg-amber-500 hover:bg-amber-400 px-10 text-sm font-bold text-zinc-950 transition-all cursor-pointer shadow-xl shadow-amber-500/20 border-none font-sans"
              >
                <span>Begin Sprint 1 Discovery</span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* ========================================================================= */}
      {/* STEPS 1 TO 6: GUIDED DISCOVERY WORKFLOW + LIVE BRIEF PANEL */}
      {/* ========================================================================= */}
      {currentStep >= 1 && currentStep <= 6 && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* LEFT 7 COLS: GUIDED QUESTION STEP */}
          <div className="lg:col-span-7 space-y-6">

            {/* Step Header */}
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <span className="font-mono text-xs text-amber-400 font-bold uppercase tracking-wider">
                Step {currentStep} of 6
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowInspiration(!showInspiration)}
                  className="text-xs font-mono text-zinc-400 hover:text-amber-400 flex items-center gap-1.5 bg-zinc-900 border border-zinc-800 px-3 py-1 rounded-full cursor-pointer transition-colors"
                >
                  <Lightbulb className="h-3.5 w-3.5 text-amber-400" />
                  <span>Need Inspiration?</span>
                </button>
              </div>
            </div>

            {/* Inspiration Hint Box */}
            <AnimatePresence>
              {showInspiration && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-amber-500/10 border border-amber-500/30 p-4 rounded-2xl space-y-2 text-xs font-sans text-amber-200"
                >
                  <div className="flex items-center gap-2 font-mono font-bold text-amber-400">
                    <Sparkles className="h-4 w-4" />
                    <span>Real Product Team Example (Stripe &amp; Linear)</span>
                  </div>
                  <p className="leading-relaxed">
                    "When product teams at Linear or Stripe begin discovery, they don't guess code features. They identify the root cause of friction, list user personas, and test hypotheses before writing code."
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* STEP 1: Understand the Problem */}
            {currentStep === 1 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
                <div className="bg-zinc-900/60 border border-zinc-800 p-6 rounded-3xl space-y-4">
                  <div className="bg-zinc-950 p-4 rounded-2xl border border-zinc-800 text-xs font-sans text-zinc-300 space-y-1">
                    <span className="font-mono text-[10px] text-amber-400 font-bold uppercase block">Product Brief Memo</span>
                    <p className="text-zinc-400">
                      "We've spoken to hundreds of engineering students. Many complete tutorials but still struggle to build software independently. Your first assignment is to investigate why."
                    </p>
                  </div>

                  <div className="space-y-2">
                    <h3 className="font-display text-lg font-bold text-zinc-100">
                      What do you think is the biggest problem?
                    </h3>
                    <p className="text-xs text-zinc-400 font-sans">Select all that apply.</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {problemOptions.map((opt) => {
                      const isSelected = selectedProblems.includes(opt);
                      return (
                        <button
                          key={opt}
                          onClick={() => toggleSelection(selectedProblems, opt, setSelectedProblems)}
                          className={`p-3.5 rounded-2xl border text-left font-sans text-xs transition-all cursor-pointer flex items-center justify-between ${isSelected
                            ? "bg-amber-500/10 border-amber-500 text-amber-300 font-semibold ring-1 ring-amber-500/40"
                            : "bg-zinc-950/60 border-zinc-800 text-zinc-300 hover:border-zinc-700"
                            }`}
                        >
                          <span>{opt}</span>
                          {isSelected && <Check className="h-4 w-4 text-amber-400 font-bold shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={() => setCurrentStep(2)}
                    className="h-12 px-8 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs font-mono rounded-xl transition-all cursor-pointer border-none flex items-center gap-2"
                  >
                    <span>Next: Explain Reasoning →</span>
                  </button>
                </div>
              </motion.div>
            )}

            {/* STEP 2: Why? */}
            {currentStep === 2 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
                <div className="bg-zinc-900/60 border border-zinc-800 p-6 rounded-3xl space-y-4">
                  <div className="space-y-1">
                    <h3 className="font-display text-lg font-bold text-zinc-100">
                      Why did you choose these problems?
                    </h3>
                    <p className="text-xs text-zinc-400 font-sans">
                      Explain your reasoning in your own words (2–3 sentences). Don't worry about being perfect.
                    </p>
                  </div>

                  <textarea
                    rows={4}
                    value={whyReasoning}
                    onChange={(e) => setWhyReasoning(e.target.value)}
                    placeholder="Share your reasoning..."
                    className="w-full rounded-2xl border border-zinc-800 bg-zinc-950 p-4 text-xs text-zinc-100 placeholder:text-zinc-600 focus:border-amber-500 focus:outline-none font-sans transition-all resize-none"
                  />
                </div>

                <div className="flex justify-between items-center">
                  <button
                    onClick={() => setCurrentStep(1)}
                    className="text-xs font-mono text-zinc-400 hover:text-zinc-200"
                  >
                    ← Back
                  </button>
                  <button
                    onClick={() => setCurrentStep(3)}
                    className="h-12 px-8 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs font-mono rounded-xl transition-all cursor-pointer border-none flex items-center gap-2"
                  >
                    <span>Next: Identify Users →</span>
                  </button>
                </div>
              </motion.div>
            )}

            {/* STEP 3: Identify Users */}
            {currentStep === 3 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
                <div className="bg-zinc-900/60 border border-zinc-800 p-6 rounded-3xl space-y-4">
                  <div className="space-y-1">
                    <h3 className="font-display text-lg font-bold text-zinc-100">
                      Who are the primary target users?
                    </h3>
                    <p className="text-xs text-zinc-400 font-sans">Select all personas affected by this problem.</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {userPersonaOptions.map((persona) => {
                      const isSelected = selectedUsers.includes(persona);
                      return (
                        <button
                          key={persona}
                          onClick={() => toggleSelection(selectedUsers, persona, setSelectedUsers)}
                          className={`p-3.5 rounded-2xl border text-left font-sans text-xs transition-all cursor-pointer flex items-center justify-between ${isSelected
                            ? "bg-amber-500/10 border-amber-500 text-amber-300 font-semibold ring-1 ring-amber-500/40"
                            : "bg-zinc-950/60 border-zinc-800 text-zinc-300 hover:border-zinc-700"
                            }`}
                        >
                          <span>{persona}</span>
                          {isSelected && <Check className="h-4 w-4 text-amber-400 font-bold shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <button
                    onClick={() => setCurrentStep(2)}
                    className="text-xs font-mono text-zinc-400 hover:text-zinc-200"
                  >
                    ← Back
                  </button>
                  <button
                    onClick={() => setCurrentStep(4)}
                    className="h-12 px-8 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs font-mono rounded-xl transition-all cursor-pointer border-none flex items-center gap-2"
                  >
                    <span>Next: Pain Point Priorities →</span>
                  </button>
                </div>
              </motion.div>
            )}

            {/* STEP 4: Pain Point Prioritization */}
            {currentStep === 4 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
                <div className="bg-zinc-900/60 border border-zinc-800 p-6 rounded-3xl space-y-4">
                  <div className="space-y-1">
                    <h3 className="font-display text-lg font-bold text-zinc-100">
                      Which problems create the biggest impact?
                    </h3>
                    <p className="text-xs text-zinc-400 font-sans">Set priorities for your selected problems.</p>
                  </div>

                  <div className="space-y-3">
                    {selectedProblems.map((prob) => {
                      const currentPrio = priorities[prob] || "High";
                      return (
                        <div
                          key={prob}
                          className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 flex items-center justify-between gap-3 text-xs font-sans"
                        >
                          <span className="text-zinc-200 font-medium">{prob}</span>
                          <div className="flex items-center gap-1">
                            {(["High", "Medium", "Low"] as const).map((level) => (
                              <button
                                key={level}
                                onClick={() => setPriorities((prev) => ({ ...prev, [prob]: level }))}
                                className={`px-2.5 py-1 rounded font-mono text-[10px] font-bold cursor-pointer transition-all ${currentPrio === level
                                  ? level === "High"
                                    ? "bg-rose-500/20 text-rose-400 border border-rose-500/40"
                                    : level === "Medium"
                                      ? "bg-amber-500/20 text-amber-400 border border-amber-500/40"
                                      : "bg-blue-500/20 text-blue-400 border border-blue-500/40"
                                  : "bg-zinc-900 text-zinc-500 border border-zinc-800 hover:text-zinc-300"
                                  }`}
                              >
                                {level}
                              </button>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <button
                    onClick={() => setCurrentStep(3)}
                    className="text-xs font-mono text-zinc-400 hover:text-zinc-200"
                  >
                    ← Back
                  </button>
                  <button
                    onClick={() => setCurrentStep(5)}
                    className="h-12 px-8 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs font-mono rounded-xl transition-all cursor-pointer border-none flex items-center gap-2"
                  >
                    <span>Next: Gather Evidence →</span>
                  </button>
                </div>
              </motion.div>
            )}

            {/* STEP 5: Evidence */}
            {currentStep === 5 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
                <div className="bg-zinc-900/60 border border-zinc-800 p-6 rounded-3xl space-y-4">
                  <div className="space-y-1">
                    <h3 className="font-display text-lg font-bold text-zinc-100">
                      What makes you believe this problem exists?
                    </h3>
                    <p className="text-xs text-zinc-400 font-sans">Select evidence sources.</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {evidenceOptions.map((ev) => {
                      const isSelected = evidenceChoices.includes(ev);
                      return (
                        <button
                          key={ev}
                          onClick={() => toggleSelection(evidenceChoices, ev, setEvidenceChoices)}
                          className={`p-3.5 rounded-2xl border text-left font-sans text-xs transition-all cursor-pointer flex items-center justify-between ${isSelected
                            ? "bg-amber-500/10 border-amber-500 text-amber-300 font-semibold ring-1 ring-amber-500/40"
                            : "bg-zinc-950/60 border-zinc-800 text-zinc-300 hover:border-zinc-700"
                            }`}
                        >
                          <span>{ev}</span>
                          {isSelected && <Check className="h-4 w-4 text-amber-400 font-bold shrink-0" />}
                        </button>
                      );
                    })}
                  </div>

                  <div className="space-y-1 pt-2">
                    <label className="text-xs font-mono text-zinc-400 block">Optional details:</label>
                    <input
                      type="text"
                      value={evidenceText}
                      onChange={(e) => setEvidenceText(e.target.value)}
                      placeholder="Tell us more if you'd like..."
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-xs text-zinc-100 font-sans focus:outline-none focus:border-amber-500 transition-colors"
                    />
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <button
                    onClick={() => setCurrentStep(4)}
                    className="text-xs font-mono text-zinc-400 hover:text-zinc-200"
                  >
                    ← Back
                  </button>
                  <button
                    onClick={() => setCurrentStep(6)}
                    className="h-12 px-8 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs font-mono rounded-xl transition-all cursor-pointer border-none flex items-center gap-2"
                  >
                    <span>Next: Product Thinking →</span>
                  </button>
                </div>
              </motion.div>
            )}

            {/* STEP 6: Product Thinking (Solutions) */}
            {currentStep === 6 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
                <div className="bg-zinc-900/60 border border-zinc-800 p-6 rounded-3xl space-y-4">
                  <div className="space-y-1">
                    <h3 className="font-display text-lg font-bold text-zinc-100">
                      If you were building MakeMistakes, what would you build first?
                    </h3>
                    <p className="text-xs text-zinc-400 font-sans">Select feature recommendations.</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {solutionOptions.map((sol) => {
                      const isSelected = productSolutions.includes(sol);
                      return (
                        <button
                          key={sol}
                          onClick={() => toggleSelection(productSolutions, sol, setProductSolutions)}
                          className={`p-3.5 rounded-2xl border text-left font-sans text-xs transition-all cursor-pointer flex items-center justify-between ${isSelected
                            ? "bg-amber-500/10 border-amber-500 text-amber-300 font-semibold ring-1 ring-amber-500/40"
                            : "bg-zinc-950/60 border-zinc-800 text-zinc-300 hover:border-zinc-700"
                            }`}
                        >
                          <span>{sol}</span>
                          {isSelected && <Check className="h-4 w-4 text-amber-400 font-bold shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <button
                    onClick={() => setCurrentStep(5)}
                    className="text-xs font-mono text-zinc-400 hover:text-zinc-200"
                  >
                    ← Back
                  </button>
                  <button
                    onClick={() => setCurrentStep(7)}
                    className="h-12 px-8 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs font-mono rounded-xl transition-all cursor-pointer border-none flex items-center gap-2"
                  >
                    <span>Generate Discovery Brief →</span>
                  </button>
                </div>
              </motion.div>
            )}
          </div>

          {/* RIGHT 5 COLS: LIVE DISCOVERY BRIEF PANEL */}
          <div className="lg:col-span-5 rounded-3xl border border-amber-500/30 bg-zinc-900/80 p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2 font-mono text-xs font-bold text-amber-400">
                <FileText className="h-4 w-4" />
                <span>LIVE DISCOVERY BRIEF</span>
              </div>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                Updating Live
              </span>
            </div>

            <div className="space-y-4 text-xs font-sans">
              <div className="bg-zinc-950 p-3.5 rounded-xl border border-zinc-800 space-y-1">
                <span className="font-mono text-[10px] text-zinc-500 uppercase font-bold block">1. Problem Thesis</span>
                <p className="text-zinc-200 leading-relaxed">{generatedBrief.problem}</p>
              </div>

              <div className="bg-zinc-950 p-3.5 rounded-xl border border-zinc-800 space-y-1">
                <span className="font-mono text-[10px] text-zinc-500 uppercase font-bold block">2. Target Users</span>
                <p className="text-zinc-200">{generatedBrief.targetUsers}</p>
              </div>

              <div className="bg-zinc-950 p-3.5 rounded-xl border border-zinc-800 space-y-1">
                <span className="font-mono text-[10px] text-zinc-500 uppercase font-bold block">3. Pain Point Priorities</span>
                <p className="text-zinc-200">{generatedBrief.priorities}</p>
              </div>

              <div className="bg-zinc-950 p-3.5 rounded-xl border border-zinc-800 space-y-1">
                <span className="font-mono text-[10px] text-zinc-500 uppercase font-bold block">4. Evidence</span>
                <p className="text-zinc-200">{generatedBrief.evidence}</p>
              </div>

              <div className="bg-zinc-950 p-3.5 rounded-xl border border-zinc-800 space-y-1">
                <span className="font-mono text-[10px] text-zinc-500 uppercase font-bold block">5. Recommendation</span>
                <p className="text-amber-300 font-medium">{generatedBrief.recommendation}</p>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* STEP 7: DISCOVERY BRIEF READY (REVIEW, EDIT & SUBMIT) */}
      {/* ========================================================================= */}
      {currentStep === 7 && (
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <div className="rounded-3xl border border-emerald-500/40 bg-zinc-900/80 p-6 sm:p-8 backdrop-blur-xl space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20 flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  DISCOVERY BRIEF READY
                </span>
                <span className="font-mono text-xs text-zinc-400">Sprint 1 Deliverables</span>
              </div>

              <button
                onClick={() => setEditMode(!editMode)}
                className="text-xs font-mono text-amber-400 hover:text-amber-300 flex items-center gap-1.5 bg-zinc-950 border border-zinc-800 px-3 py-1 rounded-xl cursor-pointer"
              >
                <Edit3 className="h-3.5 w-3.5" />
                <span>{editMode ? "Lock Editing" : "Edit Brief"}</span>
              </button>
            </div>

            <div className="space-y-4 font-sans text-xs">
              <div className="bg-zinc-950 p-4 rounded-2xl border border-zinc-800 space-y-1">
                <span className="font-mono text-[10px] text-amber-400 font-bold uppercase block">Problem Thesis</span>
                {editMode ? (
                  <textarea
                    rows={2}
                    value={whyReasoning}
                    onChange={(e) => setWhyReasoning(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-2 text-xs text-zinc-100 font-sans"
                  />
                ) : (
                  <p className="text-zinc-200 leading-relaxed">{generatedBrief.problem}</p>
                )}
              </div>

              <div className="bg-zinc-950 p-4 rounded-2xl border border-zinc-800 space-y-1">
                <span className="font-mono text-[10px] text-amber-400 font-bold uppercase block">Target Personas</span>
                <p className="text-zinc-200">{generatedBrief.targetUsers}</p>
              </div>

              <div className="bg-zinc-950 p-4 rounded-2xl border border-zinc-800 space-y-1">
                <span className="font-mono text-[10px] text-amber-400 font-bold uppercase block">Prioritized Pain Points</span>
                <p className="text-zinc-200">{generatedBrief.priorities}</p>
              </div>

              <div className="bg-zinc-950 p-4 rounded-2xl border border-zinc-800 space-y-1">
                <span className="font-mono text-[10px] text-amber-400 font-bold uppercase block">Evidence Gathered</span>
                <p className="text-zinc-200">{generatedBrief.evidence}</p>
              </div>

              <div className="bg-zinc-950 p-4 rounded-2xl border border-zinc-800 space-y-1">
                <span className="font-mono text-[10px] text-amber-400 font-bold uppercase block">Recommendation</span>
                <p className="text-amber-300 font-semibold">{generatedBrief.recommendation}</p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-zinc-800">
              <button
                onClick={() => setCurrentStep(1)}
                className="text-xs font-mono text-zinc-400 hover:text-zinc-200"
              >
                ← Back to Questions
              </button>

              <button
                onClick={handleFinalSubmission}
                disabled={isSubmitting}
                className="group relative inline-flex h-13 items-center justify-center gap-3 rounded-2xl bg-amber-500 hover:bg-amber-400 px-9 text-sm font-bold text-zinc-950 transition-all cursor-pointer shadow-xl shadow-amber-500/20 border-none font-sans"
              >
                <Send className="h-4 w-4" />
                <span>{isSubmitting ? "Submitting Discovery Brief..." : "Submit Discovery Brief & Finish Sprint 1"}</span>
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
