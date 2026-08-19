"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Sparkles,
  Trophy,
  Code2,
  Terminal,
  ArrowLeft,
  Check,
} from "lucide-react";

interface StepMissionZeroChallengeProps {
  onNext: () => void;
  onBack: () => void;
}

export default function StepMissionZeroChallenge({
  onNext,
  onBack,
}: StepMissionZeroChallengeProps) {
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  const challengeOptions = [
    {
      id: 1,
      code: "CREATE TABLE users (id UUID PRIMARY KEY, email TEXT UNIQUE);",
      description: "PostgreSQL UUID v4 with unique index for scalable distributed auth.",
      correct: true,
      explanation: "Excellent! UUID v4 prevents ID enumeration attacks and scales across distributed DB clusters.",
    },
    {
      id: 2,
      code: "CREATE TABLE users (id INT PRIMARY KEY AUTO_INCREMENT, email TEXT);",
      description: "Auto-incrementing integer without unique constraint on email.",
      correct: false,
      explanation: "Caution! Lacks UNIQUE constraint on email (duplicate registrations) and exposes sequential user IDs.",
    },
    {
      id: 3,
      code: "CREATE TABLE users (user_data JSONB PRIMARY KEY);",
      description: "Raw JSONB blob set as primary key.",
      correct: false,
      explanation: "Incorrect! JSONB is invalid as a primary key constraint in relational PostgreSQL databases.",
    },
  ];

  const handleSubmitChallenge = () => {
    if (selectedOption === null) return;
    const choice = challengeOptions.find((o) => o.id === selectedOption);
    if (choice?.correct) {
      setIsCorrect(true);
      setIsSubmitted(true);
    } else {
      setIsCorrect(false);
      setIsSubmitted(true);
    }
  };

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
          <span>Back to Blueprint</span>
        </button>

        <div className="flex items-center gap-2">
          <span className="font-bold text-teal-800 bg-teal-50 px-3 py-1 rounded-full border border-teal-200 flex items-center gap-1.5">
            <Trophy className="h-3.5 w-3.5 text-teal-700" />
            MISSION ZERO
          </span>
          <span className="font-semibold text-zinc-700">Step 5 of 6</span>
        </div>
      </div>

      {/* Main Mission Zero Card */}
      <div className="bg-white border border-teal-200/80 p-6 sm:p-8 rounded-3xl space-y-6 shadow-xl shadow-zinc-200/40 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-100 pb-4">
          <div>
            <span className="font-mono text-xs font-bold text-teal-800 uppercase tracking-widest block">
              FIRST MISTAKE CHALLENGE
            </span>
            <h1 className="font-serif text-2xl sm:text-4xl font-bold text-zinc-900 tracking-tight mt-1">
              Mission Zero: Validate Your User Table Schema
            </h1>
          </div>

          <div className="h-12 w-12 rounded-2xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-700 shadow-sm shrink-0 font-mono font-bold text-sm">
            #0
          </div>
        </div>

        {/* Challenge Description */}
        <div className="bg-zinc-50 border border-zinc-200 p-4 rounded-2xl space-y-2">
          <span className="font-mono text-[10px] text-teal-800 font-bold uppercase tracking-wider block">
            CHALLENGE BRIEF
          </span>
          <p className="text-xs sm:text-sm text-zinc-700 font-sans leading-relaxed">
            Before launching your first product workspace, evaluate these PostgreSQL table DDL statements. Select the production-ready schema for user authentication.
          </p>
        </div>

        {/* Challenge Options List */}
        <div className="space-y-3 pt-1">
          {challengeOptions.map((opt) => {
            const isSelected = selectedOption === opt.id;
            return (
              <div
                key={opt.id}
                onClick={() => {
                  if (!isSubmitted) setSelectedOption(opt.id);
                }}
                className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-2 font-mono text-xs ${
                  isSelected
                    ? "bg-teal-50/60 border-teal-300 ring-2 ring-teal-700/20 shadow-sm"
                    : "bg-zinc-50 border-zinc-200 hover:border-teal-200"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-teal-800">Option {opt.id}</span>
                  {isSelected && (
                    <div className="h-5 w-5 rounded-full bg-teal-700 text-white flex items-center justify-center">
                      <Check className="h-3 w-3 stroke-[3]" />
                    </div>
                  )}
                </div>

                <div className="bg-zinc-900 text-teal-300 p-3 rounded-xl font-mono text-xs leading-relaxed shadow-inner">
                  {opt.code}
                </div>

                <p className="text-zinc-600 font-sans text-xs pt-1">{opt.description}</p>
              </div>
            );
          })}
        </div>

        {/* Feedback Alert Box */}
        {isSubmitted && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`p-5 rounded-2xl border flex items-start gap-3.5 text-xs font-sans ${
              isCorrect
                ? "bg-emerald-50 border-emerald-200 text-emerald-900"
                : "bg-amber-50 border-amber-200 text-amber-900"
            }`}
          >
            {isCorrect ? (
              <CheckCircle2 className="h-5 w-5 text-emerald-700 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="h-5 w-5 text-amber-700 shrink-0 mt-0.5" />
            )}
            <div className="space-y-1">
              <span className="font-bold block text-sm">
                {isCorrect ? "🎉 Mission Zero Completed! (+100 PTS)" : "Mistake Recorded — Learn & Proceed!"}
              </span>
              <p className="leading-relaxed">
                {challengeOptions.find((o) => o.id === selectedOption)?.explanation}
              </p>
            </div>
          </motion.div>
        )}

        {/* Footer Actions */}
        <div className="pt-4 border-t border-zinc-100 flex items-center justify-between">
          {!isSubmitted ? (
            <button
              onClick={handleSubmitChallenge}
              disabled={selectedOption === null}
              className="group inline-flex h-12 items-center justify-center gap-2 rounded-full bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs font-sans px-7 transition-all cursor-pointer shadow-md shadow-teal-700/20 border-none disabled:opacity-40"
            >
              <span>Validate Schema Answer</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          ) : (
            <button
              onClick={onNext}
              className="group inline-flex h-13 w-full sm:w-auto items-center justify-center gap-3 rounded-full bg-teal-700 hover:bg-teal-800 px-9 text-sm font-bold text-white transition-all cursor-pointer shadow-lg shadow-teal-700/20 border-none font-sans"
            >
              <span>Initialize Mission Control →</span>
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
