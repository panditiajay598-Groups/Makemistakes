"use client";

import React, { useState } from "react";
import {
  ArrowRight,
  CheckCircle2,
  Clock,
  Sparkles,
  Brain,
  Check,
  ChevronRight,
  HelpCircle,
  Zap,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { StepDiscoveryProps } from "./types";

export default function StepDiscovery({
  selectedLevel = "Explorer",
  onNext,
}: StepDiscoveryProps) {
  const [activePart, setActivePart] = useState<"intro" | "quiz" | "result">("intro");
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [arrangedSteps, setArrangedSteps] = useState([
    { id: "step-1", text: "Receive User HTTP Request", order: 1 },
    { id: "step-3", text: "Store Data in Database", order: 3 },
    { id: "step-2", text: "Validate API Token & Payload", order: 2 },
  ]);

  const questions = [
    {
      part: "Part 1 — Core Architecture",
      type: "mcq",
      question: "Which component is primarily responsible for holding state in a scalable backend server?",
      options: [
        "Database / Cache Store (e.g. PostgreSQL, Redis)",
        "CSS Stylesheet",
        "DNS Name Server",
        "HTML Document Parser",
      ],
      correct: 0,
    },
    {
      part: "Part 2 — Scenario Reasoning",
      type: "scenario",
      question: "Scenario: An e-commerce API suddenly crashes during a flash sale due to traffic spikes. What is the most effective immediate architectural guardrail?",
      options: [
        "Implement an API Rate Limiter / Queue",
        "Increase font size on the checkout button",
        "Disable database indexes",
        "Send an email asking users to stop clicking",
      ],
      correct: 0,
    },
    {
      part: "Part 3 — Practical Micro Challenge",
      type: "practical",
      question: "Arrange the execution order for handling an API request securely:",
    },
  ];

  const handleSelectOption = (qIdx: number, optIdx: number) => {
    setAnswers((prev) => ({ ...prev, [qIdx]: optIdx.toString() }));
    if (qIdx < questions.length - 1) {
      setTimeout(() => {
        setCurrentQuestion(qIdx + 1);
      }, 250);
    } else {
      setTimeout(() => {
        setActivePart("result");
      }, 350);
    }
  };

  const moveStepUp = (index: number) => {
    if (index === 0) return;
    const updated = [...arrangedSteps];
    const temp = updated[index];
    updated[index] = updated[index - 1];
    updated[index - 1] = temp;
    setArrangedSteps(updated);
  };

  const handleFinishPractical = () => {
    setActivePart("result");
  };

  const handleContinue = () => {
    onNext("Explorer");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-8 max-w-2xl mx-auto py-2"
    >
      {/* Header */}
      <div className="space-y-3 text-center max-w-xl mx-auto">
        <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3.5 py-1 text-xs font-mono font-medium text-amber-400">
          <Sparkles className="h-3.5 w-3.5" />
          <span>STARTING POINT DISCOVERY</span>
        </div>
        <h2 className="font-display text-3xl sm:text-5xl font-extrabold tracking-tight text-zinc-50">
          Discover Your Starting Point
        </h2>
        <p className="text-xs sm:text-sm text-zinc-400 font-sans leading-relaxed">
          Skip what you already know. Focus strictly on what you need to build next.
        </p>
      </div>

      <AnimatePresence mode="wait">
        {activePart === "intro" && (
          /* Minimalist Intro Screen (Single Focal Area, No stacked cards) */
          <motion.div
            key="intro"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.25 }}
            className="rounded-2xl border border-zinc-800 bg-gradient-to-b from-zinc-900/80 to-zinc-950 p-6 sm:p-8 backdrop-blur-xl space-y-6 shadow-2xl"
          >
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-amber-400 font-mono text-xs font-bold uppercase tracking-wider">
                <Brain className="h-4 w-4" />
                <span>Personalized Diagnostic</span>
              </div>
              <h3 className="font-display text-xl font-bold text-zinc-100">
                Why We Ask These 3 Quick Questions
              </h3>
              <p className="text-xs sm:text-sm text-zinc-300 font-sans leading-relaxed">
                This isn't a pass/fail exam—it's an intelligent assessment to customize your starting challenge and eliminate wasted time on concepts you've already mastered.
              </p>
            </div>

            {/* Simple Inline Highlights */}
            <div className="space-y-3 pt-1">
              <div className="flex items-center gap-3 text-xs text-zinc-200">
                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                <span>Skip repetitive introductory tutorials</span>
              </div>
              <div className="flex items-center gap-3 text-xs text-zinc-200">
                <CheckCircle2 className="h-4 w-4 text-amber-400 shrink-0" />
                <span>Calibrate AI mentor feedback to your experience level</span>
              </div>
              <div className="flex items-center gap-3 text-xs text-zinc-200">
                <CheckCircle2 className="h-4 w-4 text-amber-400 shrink-0" />
                <span>Lock in the optimal difficulty for Mission 0</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-zinc-850 text-xs font-mono text-zinc-400">
              <div className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-amber-400" />
                <span>Estimated Time: 2 Mins</span>
              </div>

              <button
                onClick={() => setActivePart("quiz")}
                className="group flex h-11 items-center justify-center gap-2.5 rounded-xl bg-amber-500 px-7 text-xs font-bold text-zinc-950 transition-all hover:bg-amber-400 cursor-pointer border-none shadow-md shadow-amber-500/10"
              >
                <span>Begin Assessment</span>
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
              </button>
            </div>
          </motion.div>
        )}

        {activePart === "quiz" && (
          /* One Question at a Time View with Progress Bar */
          <motion.div
            key={`question-${currentQuestion}`}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25 }}
            className="rounded-2xl border border-zinc-800 bg-gradient-to-b from-zinc-900/90 to-zinc-950 p-6 sm:p-8 backdrop-blur-xl space-y-6 shadow-2xl"
          >
            {/* Top Question Progress Indicator */}
            <div className="space-y-2 border-b border-zinc-800/80 pb-4">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-amber-400 font-bold uppercase tracking-wider">
                  {questions[currentQuestion].part}
                </span>
                <span className="text-zinc-400">
                  Question <strong className="text-zinc-100">{currentQuestion + 1}</strong> of {questions.length}
                </span>
              </div>

              {/* Progress Line */}
              <div className="w-full bg-zinc-850 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-amber-400 h-full transition-all duration-300 ease-out rounded-full"
                  style={{
                    width: `${((currentQuestion + 1) / questions.length) * 100}%`,
                  }}
                />
              </div>
            </div>

            {/* Question Text */}
            <h3 className="font-display text-lg sm:text-xl font-bold text-zinc-50 leading-snug">
              {questions[currentQuestion].question}
            </h3>

            {questions[currentQuestion].type !== "practical" ? (
              /* One Question Options List */
              <div className="space-y-3 pt-1">
                {questions[currentQuestion].options?.map((opt, idx) => {
                  const isSelected = answers[currentQuestion] === idx.toString();
                  return (
                    <motion.button
                      key={idx}
                      whileHover={{ x: 3 }}
                      type="button"
                      onClick={() => handleSelectOption(currentQuestion, idx)}
                      className={`w-full p-4 rounded-xl border text-left text-xs sm:text-sm font-medium transition-all flex items-center justify-between cursor-pointer ${
                        isSelected
                          ? "border-amber-500 bg-amber-500/20 text-amber-300 shadow-md shadow-amber-500/10"
                          : "border-zinc-800 bg-zinc-950/80 text-zinc-200 hover:border-zinc-700 hover:bg-zinc-900"
                      }`}
                    >
                      <span className="pr-4">{opt}</span>
                      {isSelected ? (
                        <CheckCircle2 className="h-4 w-4 text-amber-400 shrink-0" />
                      ) : (
                        <ChevronRight className="h-4 w-4 text-zinc-600 shrink-0" />
                      )}
                    </motion.button>
                  );
                })}
              </div>
            ) : (
              /* Part 3: Practical Micro Challenge */
              <div className="space-y-4 pt-1">
                <div className="space-y-2.5">
                  {arrangedSteps.map((step, idx) => (
                    <div
                      key={step.id}
                      className="flex items-center justify-between p-4 rounded-xl border border-zinc-800 bg-zinc-950/90 text-xs sm:text-sm text-zinc-200"
                    >
                      <div className="flex items-center gap-3">
                        <span className="font-mono font-bold text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded border border-amber-500/20">
                          Step #{idx + 1}
                        </span>
                        <span>{step.text}</span>
                      </div>
                      {idx > 0 && (
                        <button
                          type="button"
                          onClick={() => moveStepUp(idx)}
                          className="text-xs font-mono text-amber-400 hover:text-amber-300 bg-amber-500/10 px-3 py-1.5 rounded-lg border border-amber-500/20 cursor-pointer transition-colors"
                        >
                          Move Up ↑
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={handleFinishPractical}
                  className="w-full h-12 rounded-xl bg-amber-500 text-xs font-bold text-zinc-950 transition-all hover:bg-amber-400 cursor-pointer border-none flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 mt-2"
                >
                  <span>Submit Challenge &amp; Reveal Level</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            )}
          </motion.div>
        )}

        {activePart === "result" && (
          /* Single Spotlight Result View */
          <motion.div
            key="result"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="rounded-2xl border border-amber-500/40 bg-gradient-to-b from-zinc-900/90 via-zinc-950 to-zinc-950 p-6 sm:p-8 backdrop-blur-xl space-y-6 shadow-2xl shadow-amber-500/10"
          >
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <span className="font-mono text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4" />
                Assessment Complete
              </span>
              <span className="font-mono text-xs text-zinc-400">Level Identified</span>
            </div>

            <div className="space-y-2">
              <span className="text-xs font-mono text-amber-400 uppercase tracking-wider block font-bold">
                Recommended Starting Level
              </span>
              <h3 className="font-display text-3xl sm:text-4xl font-extrabold text-zinc-50 flex items-center gap-3">
                <span>🧭</span> Explorer Level
              </h3>
            </div>

            <div className="space-y-3 rounded-xl bg-zinc-950/90 p-5 border border-zinc-850 text-xs text-zinc-300 font-sans leading-relaxed">
              <span className="font-mono text-[11px] text-zinc-400 font-bold uppercase tracking-wider block">
                Diagnostic Analysis:
              </span>
              <ul className="space-y-2.5 list-none p-0 m-0 text-zinc-300">
                <li className="flex items-start gap-2.5">
                  <span className="text-amber-400 font-bold">•</span>
                  <span>Solid understanding of system state and backend communication patterns.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-amber-400 font-bold">•</span>
                  <span>Ready for practical scenario reasoning and live micro-challenges.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-emerald-400 font-bold">•</span>
                  <span><strong>Mission 0</strong> calibrated to introduce your AI mentor feedback loop.</span>
                </li>
              </ul>
            </div>

            <div className="flex justify-center pt-2">
              <button
                onClick={handleContinue}
                className="group flex h-12 w-full sm:w-auto items-center justify-center gap-2.5 rounded-xl bg-amber-500 px-9 text-sm font-bold text-zinc-950 transition-all hover:bg-amber-400 cursor-pointer border-none shadow-lg shadow-amber-500/20"
              >
                <span>Confirm &amp; Proceed to Journey</span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
