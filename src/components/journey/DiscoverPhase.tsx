"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  BookmarkCheck,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  Clock,
  Sparkles,
  Pill,
  Bell,
  HeartPulse,
  Award,
} from "lucide-react";

import { getProblemContent, ProblemData } from "@/lib/problemContent";
import { getJourneyUserId } from "@/lib/journeyUser";

interface DiscoverPhaseProps {
  onComplete: () => void;
  onBackToJourney?: () => void;
  problemData?: ProblemData | null;
  userId?: string;
}

export default function DiscoverPhase({
  onComplete,
  onBackToJourney,
  problemData,
  userId,
}: DiscoverPhaseProps) {
  const content = getProblemContent(problemData);
  const QUESTIONS = content.questions;
  const pid = problemData?.problemId ?? "";
  const effectiveUserId = (userId || getJourneyUserId()).toString().trim().toLowerCase();

  const [userAnswers, setUserAnswers] = useState<Record<number, number>>({});
  const [isSaved, setIsSaved] = useState(false);
  const [submissionState, setSubmissionState] = useState<{
    submitted: boolean;
    isAllCorrect: boolean;
    incorrectQuestions: number[];
  }>({
    submitted: false,
    isAllCorrect: false,
    incorrectQuestions: [],
  });

  // Load saved quiz answers from Server API
  React.useEffect(() => {
    setUserAnswers({});
    setSubmissionState({ submitted: false, isAllCorrect: false, incorrectQuestions: [] });

    if (!pid) return;

    let isSubscribed = true;

    async function loadData() {
      try {
        const res = await fetch(`/api/journey/user-data?userId=${encodeURIComponent(effectiveUserId)}&problemId=${encodeURIComponent(pid)}`);
        if (res.ok) {
          const json = await res.json();
          const dData = json?.phases?.discover;
          if (isSubscribed && dData) {
            if (dData.quizAnswers) setUserAnswers(dData.quizAnswers);
            if (typeof dData.completed === "boolean") {
              setSubmissionState({
                submitted: dData.completed,
                isAllCorrect: dData.completed,
                incorrectQuestions: [],
              });
            }
          }
        }
      } catch (err) {
        console.warn("[DiscoverPhase] Server load warning:", err);
      }
    }

    loadData();

    return () => {
      isSubscribed = false;
    };
  }, [pid, effectiveUserId]);

  const persistData = (answers: Record<number, number>, completed: boolean, score: number) => {
    if (!pid) return;
    fetch("/api/journey/user-data", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: effectiveUserId,
        problemId: pid,
        phase: "discover",
        data: { quizAnswers: answers, completed, score },
      }),
    }).catch((err) => console.warn("[DiscoverPhase] Server save warning:", err));
  };

  const handleSelectOption = (questionId: number, optionIndex: number) => {
    const updated = {
      ...userAnswers,
      [questionId]: optionIndex,
    };
    setUserAnswers(updated);
    persistData(updated, submissionState.isAllCorrect, 0);

    if (submissionState.submitted && !submissionState.isAllCorrect) {
      setSubmissionState({
        submitted: false,
        isAllCorrect: false,
        incorrectQuestions: [],
      });
    }
  };

  const handleSaveProgress = () => {
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  const allQuestionsAnswered = QUESTIONS.every(
    (q) => userAnswers[q.id] !== undefined
  );

  const handleSubmit = () => {
    if (!allQuestionsAnswered) return;

    const incorrect: number[] = [];
    QUESTIONS.forEach((q) => {
      if (userAnswers[q.id] !== q.correctIndex) {
        incorrect.push(q.id);
      }
    });

    if (incorrect.length === 0) {
      setSubmissionState({
        submitted: true,
        isAllCorrect: true,
        incorrectQuestions: [],
      });
      onComplete();
    } else {
      setSubmissionState({
        submitted: true,
        isAllCorrect: false,
        incorrectQuestions: incorrect,
      });
    }
  };

  return (
    <div className="w-full text-zinc-900 font-sans antialiased selection:bg-teal-700 selection:text-white pb-20">
      {/* ============================================================ */}
      {/* HEADER                                                       */}
      {/* ============================================================ */}
      <header className="w-full pb-6 border-b border-zinc-200/60 mb-14">
        <div className="flex items-center justify-between">
          <Link
            href="/dashboard/journey"
            onClick={(e) => {
              if (onBackToJourney) {
                e.preventDefault();
                onBackToJourney();
              }
            }}
            className="inline-flex items-center gap-2 text-xs font-mono font-medium text-zinc-500 hover:text-zinc-900 transition-colors group cursor-pointer"
          >
            <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-1" />
            <span>← Back to Journey</span>
          </Link>

          <button
            onClick={handleSaveProgress}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-zinc-200 bg-white hover:bg-zinc-50 text-xs font-mono font-semibold text-zinc-700 shadow-sm transition-all cursor-pointer"
          >
            <BookmarkCheck className="h-3.5 w-3.5 text-teal-700" />
            <span>{isSaved ? "Progress Saved!" : "Save Progress"}</span>
          </button>
        </div>
      </header>

      {/* ============================================================ */}
      {/* HERO SECTION (TWO COLUMN: 60% LEFT, 40% RIGHT 3D ILLUST)     */}
      {/* ============================================================ */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center mb-14">
        {/* Left Column (60% width) - Left Aligned */}
        <div className="lg:col-span-7 space-y-6 text-left">
          <div>
            <span className="inline-flex items-center gap-2 text-[11px] font-mono font-semibold tracking-wider text-teal-800 bg-teal-50 border border-teal-100 px-3 py-1 rounded-full uppercase">
              PHASE 1 OF 8 • DISCOVER
            </span>
          </div>

          <h1 className="font-serif text-4xl sm:text-6xl lg:text-7xl font-bold text-zinc-900 tracking-tight leading-[1.08]">
            Understanding the Problem
          </h1>

          <div>
            <p className="font-sans text-xl sm:text-2xl font-bold text-teal-800 tracking-tight">
              {content.title}
            </p>
          </div>

          <div>
            <p className="text-base sm:text-lg text-zinc-600 leading-relaxed font-sans max-w-2xl">
              {content.subtitle}
            </p>
          </div>
        </div>

        {/* Right Column (40% width) - Large Floating 3D Graphic */}
        <div className="lg:col-span-5 flex items-center justify-end relative">
          {/* Soft Radial Ambient Glow */}
          <div className="absolute inset-0 bg-gradient-to-tr from-teal-100/50 via-amber-100/40 to-emerald-100/50 rounded-full blur-3xl -z-10 transform scale-125" />

          {/* Floating Composition */}
          <div className="relative w-full max-w-sm aspect-square flex items-center justify-center">
            {content.isMedicationReminder ? (
              <>
                {/* 3D Medicine Bottle */}
                <div className="relative z-10 w-48 h-64 bg-gradient-to-b from-teal-700 via-teal-800 to-teal-950 rounded-3xl shadow-2xl p-6 flex flex-col justify-between border border-teal-500/30 transform -rotate-3 hover:rotate-0 transition-transform duration-500">
                  <div className="flex items-center justify-between border-b border-teal-500/40 pb-3">
                    <div className="h-3 w-16 bg-teal-400/40 rounded-full" />
                    <HeartPulse className="h-4 w-4 text-teal-300 animate-pulse" />
                  </div>
                  <div className="space-y-3 text-center py-4">
                    <div className="h-12 w-12 mx-auto rounded-2xl bg-teal-600/60 border border-teal-400/30 flex items-center justify-center text-teal-100 shadow-inner">
                      <Pill className="h-7 w-7" />
                    </div>
                    <div>
                      <p className="text-[11px] font-mono text-teal-100 font-bold uppercase tracking-wider">Lisinopril 10mg</p>
                      <p className="text-[10px] text-teal-300 mt-0.5">Take 1 tablet with water</p>
                    </div>
                  </div>
                  <div className="h-3.5 bg-teal-600/50 rounded-full" />
                </div>

                {/* Floating 3D Pill Capsules */}
                <div className="absolute -top-4 -right-2 z-20 bg-gradient-to-r from-amber-400 to-rose-400 w-16 h-9 rounded-full shadow-lg border border-white/50 flex items-center justify-center transform rotate-45 animate-bounce">
                  <div className="w-1/2 h-full border-r border-white/40" />
                </div>
                <div className="absolute bottom-6 -right-4 z-20 bg-gradient-to-r from-emerald-400 to-teal-400 w-12 h-7 rounded-full shadow-md border border-white/50 transform -rotate-12">
                  <div className="w-1/2 h-full border-r border-white/40" />
                </div>

                {/* Floating Alarm Clock Graphic */}
                <div className="absolute -bottom-5 -left-4 z-20 bg-white border border-zinc-200/90 rounded-2xl p-4 shadow-xl flex items-center gap-3.5 transform rotate-6 hover:scale-105 transition-transform">
                  <div className="h-11 w-11 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 shrink-0">
                    <Clock className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-xs font-mono font-bold text-zinc-900">8:00 AM Reminder</p>
                    <p className="text-[10px] text-teal-700 font-medium">Daily Dose Due</p>
                  </div>
                </div>

                {/* Floating Caregiver Notification Card */}
                <div className="absolute -top-6 -left-6 z-20 bg-white/95 backdrop-blur-md border border-zinc-200/90 rounded-2xl p-3.5 shadow-lg flex items-center gap-3 transform -rotate-6">
                  <div className="h-8 w-8 rounded-lg bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600 shrink-0">
                    <Bell className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-[10px] font-mono font-bold text-zinc-800">15m Unconfirmed</p>
                    <p className="text-[9px] text-rose-600 font-semibold">Caregiver Alert Triggered</p>
                  </div>
                </div>
              </>
            ) : (
              /* BuildOS Problem Card for all database problems */
              <div className="relative z-10 w-64 h-72 bg-gradient-to-b from-teal-900 via-zinc-900 to-zinc-950 rounded-3xl shadow-2xl p-6 flex flex-col justify-between border border-teal-500/30 transform hover:scale-105 transition-transform duration-500">
                <div className="flex items-center justify-between border-b border-teal-500/30 pb-3">
                  <span className="text-[10px] font-mono font-bold text-teal-400 uppercase tracking-widest">
                    {content.category}
                  </span>
                  <Sparkles className="h-4 w-4 text-amber-400 animate-pulse" />
                </div>

                <div className="space-y-3 my-auto">
                  <div className="h-10 w-10 rounded-2xl bg-teal-500/20 border border-teal-400/40 flex items-center justify-center text-teal-300">
                    <Award className="h-6 w-6" />
                  </div>
                  <p className="text-xs font-sans text-teal-100 font-medium line-clamp-3 leading-relaxed">
                    &quot;{content.problemStatement}&quot;
                  </p>
                </div>

                <div className="pt-3 border-t border-zinc-800 flex items-center justify-between">
                  <span className="text-[10px] font-mono text-zinc-400">PHASE 01 • DISCOVER</span>
                  <span className="text-[10px] font-mono text-emerald-400 font-bold">ACTIVE</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* PROBLEM DESCRIPTION (FULL-WIDTH READABLE ARTICLE SECTION)    */}
      {/* ============================================================ */}
      <section className="mb-14">
        <article className="w-full text-zinc-800 font-sans text-lg sm:text-xl leading-[1.9] space-y-8 font-normal">
          {content.articleParagraphs.map((para, idx) => (
            <p
              key={idx}
              className={
                idx === 0
                  ? "first-letter:text-5xl first-letter:font-serif first-letter:font-bold first-letter:text-teal-800 first-letter:float-left first-letter:mr-3.5 first-letter:leading-none"
                  : ""
              }
            >
              {para}
            </p>
          ))}
        </article>
      </section>

      {/* ============================================================ */}
      {/* QUIZ SECTION (ROUNDED CONTAINER WITH 5 EQUAL HORIZONTAL CARDS) */}
      {/* ============================================================ */}
      <section className="bg-white border border-zinc-200/80 rounded-3xl p-8 sm:p-12 shadow-sm mb-10">
        {/* Header Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-zinc-100">
          <div className="space-y-1">
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-zinc-900 tracking-tight">
              Quick Knowledge Check
            </h2>
            <p className="text-xs sm:text-sm text-zinc-500 font-sans">
              &quot;Let&apos;s see if you understood the problem before we begin designing a solution.&quot;
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs font-mono font-semibold px-3 py-1 rounded-full bg-zinc-100 text-zinc-700 border border-zinc-200">
              5 Questions
            </span>
            <span className="inline-flex items-center gap-1.5 text-xs font-mono font-bold px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800">
              <Sparkles className="h-3.5 w-3.5 text-amber-500" />
              10 XP Each
            </span>
          </div>
        </div>

        {/* 5 Equal-Width Quiz Cards in a Single Horizontal Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 pt-8">
          {QUESTIONS.map((q) => {
            const selectedOption = userAnswers[q.id];
            const isIncorrect =
              submissionState.submitted &&
              submissionState.incorrectQuestions.includes(q.id);

            return (
              <div
                key={q.id}
                className={`rounded-2xl border p-5 bg-white flex flex-col justify-between space-y-4 transition-all hover:shadow-md ${
                  isIncorrect
                    ? "border-rose-300 bg-rose-50/20"
                    : selectedOption !== undefined
                    ? "border-teal-300 bg-teal-50/20"
                    : "border-zinc-200/80"
                }`}
              >
                <div className="space-y-3">
                  {/* Card top bar */}
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono font-bold text-teal-800 bg-teal-50 border border-teal-100 px-2 py-0.5 rounded">
                      Question {q.questionNumber}
                    </span>
                    <span className="text-[10px] font-mono font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                      +{q.xp} XP
                    </span>
                  </div>

                  <h3 className="font-sans text-xs sm:text-sm font-semibold text-zinc-900 leading-snug">
                    {q.question}
                  </h3>
                </div>

                {/* 4 Radio Options */}
                <div className="space-y-2 pt-1">
                  {q.options.map((opt, optIdx) => {
                    const isChecked = selectedOption === optIdx;

                    return (
                      <label
                        key={optIdx}
                        className={`flex items-start gap-2 p-2.5 rounded-xl border text-[11px] leading-tight transition-all cursor-pointer ${
                          isChecked
                            ? "bg-teal-50 border-teal-300 text-teal-950 font-medium shadow-xs"
                            : "bg-zinc-50/60 border-zinc-200/80 text-zinc-700 hover:bg-zinc-100/80"
                        }`}
                      >
                        <input
                          type="radio"
                          name={`card-quiz-${q.id}`}
                          checked={isChecked}
                          onChange={() => handleSelectOption(q.id, optIdx)}
                          className="mt-0.5 h-3.5 w-3.5 text-teal-700 border-zinc-300 focus:ring-teal-500 shrink-0 cursor-pointer"
                        />
                        <span>{opt}</span>
                      </label>
                    );
                  })}
                </div>

                {isIncorrect && (
                  <div className="p-2.5 bg-rose-100/80 border border-rose-200 rounded-xl text-[10px] text-rose-900 flex items-start gap-1.5">
                    <AlertCircle className="h-3 w-3 text-rose-600 shrink-0 mt-0.5" />
                    <span>{q.explanation}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* ============================================================ */}
      {/* BOTTOM ACTION (CENTER ALIGNED LARGE PRIMARY BUTTON)           */}
      {/* ============================================================ */}
      <footer className="flex flex-col items-center justify-center space-y-4 pt-4 text-center mb-10">
        {submissionState.submitted && !submissionState.isAllCorrect && (
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-center gap-3 text-xs text-amber-900 max-w-md w-full">
            <AlertCircle className="h-4 w-4 text-amber-600 shrink-0" />
            <span className="flex-1 text-left">
              {submissionState.incorrectQuestions.length} question(s) need review. Adjust your choices above and retry.
            </span>
            <button
              onClick={handleSubmit}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-amber-700 text-white font-mono font-medium hover:bg-amber-800 transition-colors shrink-0 cursor-pointer"
            >
              <RefreshCw className="h-3 w-3" />
              Retry
            </button>
          </div>
        )}

        {submissionState.submitted && submissionState.isAllCorrect && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center gap-3 text-xs text-emerald-900 font-semibold max-w-md w-full">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
            <span>All 5 questions verified! Unlocking Phase 2 — Research...</span>
          </div>
        )}

        <button
          onClick={handleSubmit}
          disabled={!allQuestionsAnswered}
          className={`inline-flex items-center gap-3 px-10 py-4 rounded-full font-semibold font-sans text-base transition-all shadow-md ${
            allQuestionsAnswered
              ? "bg-teal-800 hover:bg-teal-700 text-white cursor-pointer hover:shadow-lg hover:scale-105"
              : "bg-zinc-200 text-zinc-400 cursor-not-allowed border border-zinc-300 shadow-none"
          }`}
        >
          <span>Continue to Research →</span>
        </button>

        {!allQuestionsAnswered && (
          <p className="text-xs font-mono text-zinc-400">
            Answer all 5 questions to proceed ({Object.keys(userAnswers).length}/5 answered)
          </p>
        )}
      </footer>
    </div>
  );
}
