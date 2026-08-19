"use client";

import React, { useState } from "react";
import {
  ArrowRight,
  CheckCircle2,
  Clock,
  Sparkles,
  Bot,
  Trophy,
  Award,
  Zap,
  Code2,
  ShieldCheck,
  Target,
  Flame,
  Check,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { completeMissionZero } from "@/lib/onboardingStore";
import { StepMissionZeroProps } from "./types";

export default function StepMissionZero({
  onCompleteMission,
}: StepMissionZeroProps) {
  const [stage, setStage] = useState<"briefing" | "challenge" | "complete">("briefing");
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [aiFeedback, setAiFeedback] = useState<string | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);

  const checklist = [
    "Understand how the MakeMistakes AI feedback loop operates",
    "Meet and interact with your personal AI mentor",
    "Identify and repair an unhandled production API mistake",
    "Earn your first milestone achievement badge and XP",
  ];

  const codeSnippet = `// Mission 0 Micro Challenge: API Rate Limiter
function checkRateLimit(userIp: string) {
  let requestCount = getRequests(userIp);
  
  if (requestCount > 100) {
    // ❌ MISTAKE: Allowing request instead of blocking!
    return { status: 200, message: "Allowed" }; 
  }
  
  return { status: 200, message: "Allowed" };
}`;

  const challengeOptions = [
    {
      text: "Change line 6 to return { status: 429, message: 'Too Many Requests' }",
      correct: true,
      feedback: "🎯 Spot on! Returning 429 Too Many Requests correctly blocks excess traffic. You just fixed your first production bug!",
    },
    {
      text: "Increase limit from 100 to 10,000 requests",
      correct: false,
      feedback: "💡 Great attempt! Increasing the threshold doesn't stop attackers when they exceed it. We must return HTTP status 429.",
    },
    {
      text: "Remove the requestCount check entirely",
      correct: false,
      feedback: "⚠️ Removing the check leaves the server unprotected. Try returning HTTP status 429 when limits are exceeded.",
    },
  ];

  const handleSelectOption = (idx: number) => {
    setSelectedOption(idx);
    setAiFeedback(challengeOptions[idx].feedback);
    if (challengeOptions[idx].correct) {
      setIsCompleted(true);
    }
  };

  const handleFinishMission0 = () => {
    completeMissionZero(100, "First Mistake");
    onCompleteMission();
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
          <Sparkles className="h-3.5 w-3.5 animate-pulse" />
          <span>MISSION 0 BRIEFING</span>
        </div>
        <h2 className="font-display text-3xl sm:text-5xl font-extrabold tracking-tight text-zinc-50">
          Welcome to Mission 0
        </h2>
        <p className="text-xs sm:text-sm text-zinc-400 font-sans leading-relaxed">
          Your initial mission assignment: experience the AI feedback loop and complete your first challenge.
        </p>
      </div>

      <AnimatePresence mode="wait">
        {stage === "briefing" && (
          /* Mission Briefing Layout */
          <motion.div
            key="briefing"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.25 }}
            className="rounded-2xl border border-amber-500/30 bg-gradient-to-b from-zinc-900/90 via-zinc-950 to-zinc-950 p-6 sm:p-8 backdrop-blur-xl space-y-7 shadow-2xl shadow-amber-500/5 relative overflow-hidden"
          >
            {/* Top Telemetry / Mission Telemetry Cards Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3.5 rounded-xl border border-zinc-800 bg-zinc-950/80 text-center space-y-1">
                <span className="font-mono text-[10px] text-zinc-500 uppercase block font-semibold">Objective</span>
                <span className="text-xs font-bold text-zinc-200 block truncate">Fix Rate Limit</span>
              </div>

              <div className="p-3.5 rounded-xl border border-zinc-800 bg-zinc-950/80 text-center space-y-1">
                <span className="font-mono text-[10px] text-zinc-500 uppercase block font-semibold">Estimated Time</span>
                <span className="text-xs font-bold text-amber-400 block flex items-center justify-center gap-1">
                  <Clock className="h-3 w-3" /> 15–20 Mins
                </span>
              </div>

              <div className="p-3.5 rounded-xl border border-zinc-800 bg-zinc-950/80 text-center space-y-1">
                <span className="font-mono text-[10px] text-zinc-500 uppercase block font-semibold">Difficulty</span>
                <span className="text-xs font-bold text-emerald-400 block">Fundamentals</span>
              </div>

              <div className="p-3.5 rounded-xl border border-zinc-800 bg-zinc-950/80 text-center space-y-1">
                <span className="font-mono text-[10px] text-zinc-500 uppercase block font-semibold">Rewards</span>
                <span className="text-xs font-bold text-purple-400 block flex items-center justify-center gap-1">
                  <Zap className="h-3 w-3 fill-purple-400" /> +100 XP
                </span>
              </div>
            </div>

            {/* Mission Objective Detail Box */}
            <div className="space-y-4 rounded-xl bg-zinc-950/90 p-5 border border-zinc-850">
              <div className="flex items-center gap-2 text-xs font-mono font-bold text-amber-400 uppercase tracking-wider">
                <Target className="h-4 w-4" />
                <span>Mission Objective & Deliverables</span>
              </div>

              <div className="space-y-3">
                {checklist.map((item, idx) => (
                  <div key={idx} className="flex items-start gap-3 text-xs sm:text-sm text-zinc-200">
                    <CheckCircle2 className="h-4.5 w-4.5 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Prominent High-Emphasis "Begin Mission 0" Action CTA */}
            <div className="flex flex-col items-center gap-3 pt-2">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setStage("challenge")}
                className="group relative inline-flex h-14 w-full sm:w-auto items-center justify-center gap-3.5 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-300 px-10 text-base font-extrabold text-zinc-950 shadow-2xl shadow-amber-500/30 hover:from-amber-400 hover:to-amber-200 cursor-pointer border-none"
              >
                <span>Begin Mission 0</span>
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </motion.button>
              <span className="font-mono text-xs text-zinc-500">
                Unlock full platform access upon completion
              </span>
            </div>
          </motion.div>
        )}

        {stage === "challenge" && (
          /* Interactive Micro Challenge View */
          <motion.div
            key="challenge"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.25 }}
            className="rounded-2xl border border-zinc-800 bg-gradient-to-b from-zinc-900/90 to-zinc-950 p-6 sm:p-8 backdrop-blur-xl space-y-6 shadow-2xl"
          >
            {/* AI Mentor Banner */}
            <div className="flex items-center gap-3 border-b border-zinc-800 pb-3">
              <div className="h-10 w-10 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0">
                <Bot className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-display text-sm font-bold text-zinc-100">
                  AI Mentor — Micro Challenge
                </h3>
                <p className="text-xs text-zinc-400 font-sans">
                  Inspect the code snippet below and select the correct fix.
                </p>
              </div>
            </div>

            {/* Code Sandbox Preview */}
            <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-4 font-mono text-xs text-amber-300 leading-relaxed overflow-x-auto shadow-inner">
              <pre className="p-0 m-0">{codeSnippet}</pre>
            </div>

            {/* Options */}
            <div className="space-y-3">
              <span className="font-mono text-xs text-zinc-400 font-bold uppercase tracking-wider block">
                How will you fix this mistake?
              </span>
              {challengeOptions.map((opt, idx) => {
                const isSelected = selectedOption === idx;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectOption(idx)}
                    className={`w-full p-4 rounded-xl border text-left text-xs sm:text-sm font-medium transition-all flex items-center justify-between cursor-pointer ${
                      isSelected
                        ? opt.correct
                          ? "border-emerald-500 bg-emerald-500/20 text-emerald-300 shadow-md shadow-emerald-500/10"
                          : "border-amber-500 bg-amber-500/20 text-amber-300"
                        : "border-zinc-800 bg-zinc-950/80 text-zinc-200 hover:border-zinc-700 hover:bg-zinc-900"
                    }`}
                  >
                    <span>{opt.text}</span>
                    {isSelected && (
                      <span className="font-mono text-[10px] font-bold uppercase px-2.5 py-1 rounded bg-zinc-900">
                        {opt.correct ? "✓ Solved" : "Retry"}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* AI Feedback Panel */}
            {aiFeedback && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-xl border border-blue-500/30 bg-blue-500/10 p-4 text-xs text-blue-200 space-y-1.5"
              >
                <div className="flex items-center gap-2 font-bold font-mono text-blue-400">
                  <Bot className="h-4 w-4" />
                  <span>AI Mentor Feedback:</span>
                </div>
                <p className="leading-relaxed font-sans text-zinc-300">{aiFeedback}</p>
              </motion.div>
            )}

            {isCompleted && (
              <div className="pt-2 flex justify-center">
                <button
                  onClick={() => setStage("complete")}
                  className="group flex h-12 items-center justify-center gap-2 rounded-xl bg-emerald-500 px-8 text-xs font-bold text-zinc-950 transition-all hover:bg-emerald-400 cursor-pointer border-none shadow-lg shadow-emerald-500/20"
                >
                  <span>Claim Mission Reward</span>
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </button>
              </div>
            )}
          </motion.div>
        )}

        {stage === "complete" && (
          /* Reward Celebration View */
          <motion.div
            key="complete"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="rounded-2xl border border-amber-500/40 bg-gradient-to-b from-zinc-900/90 via-zinc-950 to-zinc-950 p-6 sm:p-8 backdrop-blur-xl space-y-6 text-center shadow-2xl shadow-amber-500/10"
          >
            <div className="space-y-3">
              <div className="h-16 w-16 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 mx-auto shadow-inner">
                <Trophy className="h-8 w-8 animate-bounce" />
              </div>

              <span className="font-mono text-xs font-bold text-amber-400 uppercase tracking-wider block">
                MISSION 0 COMPLETED!
              </span>

              <h3 className="font-display text-3xl font-extrabold text-zinc-50">
                🎉 Congratulations, Builder!
              </h3>

              <p className="text-xs sm:text-sm text-zinc-300 font-sans leading-relaxed max-w-md mx-auto">
                You've completed your first challenge, experienced the AI feedback loop, and unlocked the MakeMistakes learning dashboard.
              </p>
            </div>

            {/* Unlocked Reward Chips */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 rounded-xl border border-amber-500/30 bg-amber-500/10 text-center space-y-1">
                <Award className="h-5 w-5 text-amber-400 mx-auto" />
                <span className="font-mono text-[10px] text-zinc-400 block uppercase">Badge</span>
                <span className="text-xs font-bold text-amber-300 block">First Mistake</span>
              </div>

              <div className="p-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-center space-y-1">
                <Zap className="h-5 w-5 text-emerald-400 mx-auto" />
                <span className="font-mono text-[10px] text-zinc-400 block uppercase">XP Earned</span>
                <span className="text-xs font-bold text-emerald-300 block">+100 XP</span>
              </div>

              <div className="p-3 rounded-xl border border-blue-500/30 bg-blue-500/10 text-center space-y-1">
                <ShieldCheck className="h-5 w-5 text-blue-400 mx-auto" />
                <span className="font-mono text-[10px] text-zinc-400 block uppercase">Dashboard</span>
                <span className="text-xs font-bold text-blue-300 block">Unlocked</span>
              </div>

              <div className="p-3 rounded-xl border border-purple-500/30 bg-purple-500/10 text-center space-y-1">
                <Code2 className="h-5 w-5 text-purple-400 mx-auto" />
                <span className="font-mono text-[10px] text-zinc-400 block uppercase">Mission 1</span>
                <span className="text-xs font-bold text-purple-300 block">Unlocked</span>
              </div>
            </div>

            <div className="flex flex-col items-center gap-3 pt-2">
              <button
                onClick={handleFinishMission0}
                className="group relative inline-flex h-13 items-center justify-center gap-3 rounded-xl bg-amber-500 px-9 text-sm font-bold text-zinc-950 transition-all hover:bg-amber-400 cursor-pointer border-none shadow-xl shadow-amber-500/20"
              >
                <span>Enter Dashboard</span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
