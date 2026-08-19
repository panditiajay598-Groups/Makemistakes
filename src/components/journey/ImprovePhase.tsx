"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  BookmarkCheck,
  CheckCircle2,
  AlertCircle,
  Plus,
  Trash2,
  Sparkles,
  TrendingUp,
  Award,
  Layers,
  CheckSquare,
  ShieldCheck,
  Star,
  Zap,
} from "lucide-react";

import { ProblemData } from "@/lib/problemContent";

interface ImprovePhaseProps {
  onComplete: () => void;
  onBackToJourney?: () => void;
  problemData?: ProblemData | null;
  userId?: string;
}

export interface BacklogItem {
  id: string;
  title: string;
  description: string;
  priority: "High Priority" | "Medium Priority" | "Low Priority";
}

const EMPTY_BACKLOG: BacklogItem[] = [
  {
    id: "b1",
    title: "",
    description: "",
    priority: "High Priority",
  },
  {
    id: "b2",
    title: "",
    description: "",
    priority: "Medium Priority",
  },
];

export default function ImprovePhase({
  onComplete,
  onBackToJourney,
  problemData,
  userId,
}: ImprovePhaseProps) {
  const pid = problemData?.problemId ?? "";
  const effectiveUserId = (userId || "default_user").toString().trim().toLowerCase();
  const storageKey = pid && effectiveUserId ? `makemistakes_improve_${effectiveUserId}_${pid}` : null;

  // Section 1: Version 1.1 Priority Backlog
  const [backlogItems, setBacklogItems] = useState<BacklogItem[]>(EMPTY_BACKLOG);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newPriority, setNewPriority] = useState<BacklogItem["priority"]>("High Priority");

  // Section 2: Engineering Retrospective
  const [biggestMistake, setBiggestMistake] = useState("");
  const [keyLesson, setKeyLesson] = useState("");
  const [futureVision, setFutureVision] = useState("");

  // Save State
  const [isSaved, setIsSaved] = useState(false);

  // Load from Server API + localStorage fallback
  useEffect(() => {
    // Step 1: Reset ALL state to empty defaults (clears previous problem's data)
    setBacklogItems(EMPTY_BACKLOG);
    setBiggestMistake("");
    setKeyLesson("");
    setFutureVision("");
    setIsSaved(false);

    if (!pid) return;

    let isSubscribed = true;

    async function loadData() {
      try {
        const res = await fetch(`/api/journey/user-data?userId=${encodeURIComponent(effectiveUserId)}&problemId=${encodeURIComponent(pid)}`);
        if (res.ok) {
          const json = await res.json();
          const iData = json?.phases?.improve;
          if (isSubscribed && iData) {
            if (Array.isArray(iData.backlogItems) && iData.backlogItems.length > 0) setBacklogItems(iData.backlogItems);
            if (iData.biggestMistake) setBiggestMistake(iData.biggestMistake);
            if (iData.keyLesson) setKeyLesson(iData.keyLesson);
            if (iData.futureVision) setFutureVision(iData.futureVision);
            return;
          }
        }
      } catch (err) {
        console.warn("[ImprovePhase] Server load warning:", err);
      }

      // Fallback to local storage
      if (storageKey) {
        try {
          const saved = localStorage.getItem(storageKey);
          if (saved && isSubscribed) {
            const parsed = JSON.parse(saved);
            if (Array.isArray(parsed.backlogItems)) setBacklogItems(parsed.backlogItems);
            if (parsed.biggestMistake) setBiggestMistake(parsed.biggestMistake);
            if (parsed.keyLesson) setKeyLesson(parsed.keyLesson);
            if (parsed.futureVision) setFutureVision(parsed.futureVision);
          }
        } catch {}
      }
    }

    loadData();

    return () => {
      isSubscribed = false;
    };
  }, [pid, effectiveUserId, storageKey]);

  const persistData = () => {
    if (!pid) return;
    const payload = {
      backlogItems,
      biggestMistake,
      keyLesson,
      futureVision,
    };

    if (storageKey) {
      try {
        localStorage.setItem(storageKey, JSON.stringify({ problemId: pid, userId: effectiveUserId, ...payload }));
      } catch {}
    }

    fetch("/api/journey/user-data", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: effectiveUserId,
        problemId: pid,
        phase: "improve",
        data: payload,
      }),
    }).catch((err) => console.warn("[ImprovePhase] Server save warning:", err));
  };

  const handleSaveProgress = () => {
    persistData();
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  const handleAddBacklogItem = () => {
    if (newTitle.trim()) {
      setBacklogItems([
        ...backlogItems,
        {
          id: Date.now().toString(),
          title: newTitle.trim(),
          description: newDesc.trim() || "Planned improvement for Version 1.1",
          priority: newPriority,
        },
      ]);
      setNewTitle("");
      setNewDesc("");
      setShowAddForm(false);
    }
  };

  const handleDeleteBacklogItem = (id: string) => {
    if (backlogItems.length > 1) {
      setBacklogItems(backlogItems.filter((b) => b.id !== id));
    }
  };

  const isBacklogValid = backlogItems.length >= 2;
  const isMistakeValid = biggestMistake.trim().length > 0;
  const isLessonValid = keyLesson.trim().length > 0;

  const isAllValid = isBacklogValid && isMistakeValid && isLessonValid;

  return (
    <div className="w-full text-zinc-900 font-sans antialiased selection:bg-teal-700 selection:text-white pb-20">
      {/* ============================================================ */}
      {/* HEADER                                                       */}
      {/* ============================================================ */}
      <header className="w-full pb-6 border-b border-zinc-200/60 mb-12">
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
            <span>{isSaved ? "Improvement Plan Saved!" : "Save Progress"}</span>
          </button>
        </div>
      </header>

      {/* ============================================================ */}
      {/* HERO SECTION                                                 */}
      {/* ============================================================ */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center mb-14">
        <div className="lg:col-span-8 space-y-6 text-left">
          <div>
            <span className="inline-flex items-center gap-2 text-[11px] font-mono font-semibold tracking-wider text-teal-800 bg-teal-50 border border-teal-100 px-3 py-1 rounded-full uppercase">
              PHASE 7 OF 7 • IMPROVE
            </span>
          </div>

          <h1 className="font-serif text-4xl sm:text-6xl font-bold text-zinc-900 tracking-tight leading-[1.08]">
            Build Version 1.1
          </h1>

          <p className="text-base sm:text-lg text-zinc-600 leading-relaxed font-sans max-w-2xl">
            Analyze user feedback, prioritize feature improvements, and document key engineering reflections to complete your product and update your portfolio.
          </p>
        </div>

        {/* Right 3D Illustration */}
        <div className="lg:col-span-4 flex items-center justify-end relative">
          <div className="absolute inset-0 bg-gradient-to-tr from-teal-100/60 via-amber-100/40 to-emerald-100/50 rounded-full blur-3xl -z-10 transform scale-125" />

          <div className="relative w-full max-w-xs aspect-square flex items-center justify-center">
            <div className="relative z-10 w-48 h-56 bg-white border border-zinc-200/90 rounded-3xl shadow-2xl p-5 flex flex-col justify-between transform rotate-2 hover:rotate-0 transition-transform duration-500">
              <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
                <div className="h-3 w-10 bg-teal-700 rounded-md" />
                <TrendingUp className="h-5 w-5 text-teal-700" />
              </div>
              <div className="space-y-3 py-2 text-center">
                <div className="h-12 w-12 rounded-2xl bg-amber-50 border border-amber-100 text-amber-600 mx-auto flex items-center justify-center">
                  <Star className="h-6 w-6 fill-amber-400" />
                </div>
                <div className="space-y-1">
                  <div className="h-2 w-28 bg-zinc-200 rounded mx-auto" />
                  <div className="h-2 w-20 bg-teal-600 rounded mx-auto" />
                </div>
              </div>
              <div className="pt-2 border-t border-zinc-100 flex items-center justify-between text-[10px] font-mono text-zinc-400">
                <span>Version 1.1</span>
                <span className="text-teal-700 font-bold">★ Final Phase</span>
              </div>
            </div>

            <div className="absolute -bottom-3 -left-2 z-20 bg-teal-800 text-white rounded-2xl p-3 shadow-lg flex items-center gap-2 transform -rotate-6 border border-white/40">
              <Award className="h-5 w-5 text-amber-300" />
              <span className="text-xs font-mono font-bold">Portfolio Ready</span>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* WORKSHEET GRID                                                */}
      {/* ============================================================ */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12">
        {/* CARD 1 — Version 1.1 Backlog */}
        <div className="lg:col-span-7 bg-white border border-zinc-200/80 rounded-2xl p-7 shadow-xs space-y-6 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <span className="h-7 w-7 rounded-full bg-teal-100 text-teal-800 text-xs font-mono font-bold flex items-center justify-center shrink-0">
                1
              </span>
              <h2 className="font-serif text-xl font-bold text-zinc-900 tracking-tight">
                Version 1.1 Priority Backlog
              </h2>
            </div>
            <p className="text-xs text-zinc-500 font-sans leading-relaxed">
              List the top improvements and features planned for the next release.
            </p>
          </div>

          <div className="space-y-3 pt-1">
            {backlogItems.map((item, idx) => (
              <div
                key={item.id}
                className="p-4 rounded-xl border border-zinc-200 bg-zinc-50/50 hover:bg-white transition-all space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="h-5 w-5 rounded-full bg-teal-100 text-teal-800 text-[11px] font-mono font-bold flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <input
                      type="text"
                      value={item.title}
                      onChange={(e) =>
                        setBacklogItems(
                          backlogItems.map((b) =>
                            b.id === item.id ? { ...b, title: e.target.value } : b
                          )
                        )
                      }
                      className="font-bold text-xs sm:text-sm text-zinc-900 bg-transparent focus:outline-none border-b border-transparent focus:border-teal-500"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                        item.priority === "High Priority"
                          ? "bg-rose-100 text-rose-800 border border-rose-200"
                          : item.priority === "Medium Priority"
                          ? "bg-amber-100 text-amber-800 border border-amber-200"
                          : "bg-teal-100 text-teal-800 border border-teal-200"
                      }`}
                    >
                      {item.priority}
                    </span>

                    {backlogItems.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleDeleteBacklogItem(item.id)}
                        className="p-1 text-zinc-400 hover:text-rose-600 transition-colors cursor-pointer"
                        title="Delete Backlog Item"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                <textarea
                  rows={2}
                  value={item.description}
                  onChange={(e) =>
                    setBacklogItems(
                      backlogItems.map((b) =>
                        b.id === item.id ? { ...b, description: e.target.value } : b
                      )
                    )
                  }
                  className="w-full text-xs text-zinc-600 bg-transparent focus:outline-none border-b border-transparent focus:border-teal-500 leading-relaxed"
                />
              </div>
            ))}
          </div>

          {showAddForm && (
            <div className="p-4 bg-zinc-50 border border-zinc-200 rounded-xl space-y-3">
              <p className="text-xs font-bold text-zinc-800">Add Improvement Item</p>
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Improvement title..."
                className="w-full px-3 py-1.5 rounded-lg border border-zinc-300 text-xs focus:outline-none focus:border-teal-500"
              />
              <textarea
                rows={2}
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                placeholder="Describe what will be improved..."
                className="w-full px-3 py-1.5 rounded-lg border border-zinc-300 text-xs focus:outline-none focus:border-teal-500"
              />
              <div className="flex items-center justify-between pt-1">
                <select
                  value={newPriority}
                  onChange={(e) =>
                    setNewPriority(e.target.value as BacklogItem["priority"])
                  }
                  className="px-3 py-1.5 rounded-lg border border-zinc-300 text-xs focus:outline-none"
                >
                  <option value="High Priority">High Priority</option>
                  <option value="Medium Priority">Medium Priority</option>
                  <option value="Planned">Planned</option>
                </select>
                <button
                  type="button"
                  onClick={handleAddBacklogItem}
                  className="px-4 py-1.5 bg-teal-800 text-white rounded-lg text-xs font-semibold hover:bg-teal-700 transition-colors cursor-pointer"
                >
                  Save Item
                </button>
              </div>
            </div>
          )}

          <div className="pt-2">
            <button
              type="button"
              onClick={() => setShowAddForm(!showAddForm)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-zinc-300 bg-white hover:bg-zinc-50 text-xs font-mono font-semibold text-zinc-700 shadow-2xs transition-all cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5 text-teal-700" />
              <span>Add Backlog Improvement</span>
            </button>
          </div>
        </div>

        {/* CARD 2 — Retrospective */}
        <div className="lg:col-span-5 bg-white border border-zinc-200/80 rounded-2xl p-7 shadow-xs space-y-6 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <span className="h-7 w-7 rounded-full bg-teal-100 text-teal-800 text-xs font-mono font-bold flex items-center justify-center shrink-0">
                2
              </span>
              <h2 className="font-serif text-xl font-bold text-zinc-900 tracking-tight">
                Learner Engineering Retrospective
              </h2>
            </div>
            <p className="text-xs text-zinc-500 font-sans leading-relaxed">
              Reflect on your mistakes and key engineering lessons learned.
            </p>
          </div>

          <div className="space-y-4 pt-1">
            {/* Biggest Mistake */}
            <div className="space-y-1">
              <label className="block text-xs font-bold font-mono text-zinc-800 uppercase tracking-wider">
                What mistake taught you the most? <span className="text-rose-600">*</span>
              </label>
              <textarea
                rows={3}
                value={biggestMistake}
                onChange={(e) => setBiggestMistake(e.target.value)}
                placeholder="e.g. Forgetting timezone DST offsets during scheduled reminder triggers..."
                className="w-full p-3 rounded-xl border border-zinc-200 text-xs font-sans text-zinc-800 placeholder-zinc-400 bg-zinc-50/50 focus:bg-white focus:border-teal-500 focus:outline-none transition-all leading-relaxed"
              />
            </div>

            {/* Key Lesson */}
            <div className="space-y-1">
              <label className="block text-xs font-bold font-mono text-zinc-800 uppercase tracking-wider">
                Key Lesson for your next project <span className="text-rose-600">*</span>
              </label>
              <textarea
                rows={3}
                value={keyLesson}
                onChange={(e) => setKeyLesson(e.target.value)}
                placeholder="e.g. Always write automated test cases for edge cases before writing production code..."
                className="w-full p-3 rounded-xl border border-zinc-200 text-xs font-sans text-zinc-800 placeholder-zinc-400 bg-zinc-50/50 focus:bg-white focus:border-teal-500 focus:outline-none transition-all leading-relaxed"
              />
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* BOTTOM ACTION & VALIDATION                                   */}
      {/* ============================================================ */}
      <footer className="flex flex-col items-center justify-center space-y-4 text-center">
        {!isAllValid && (
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 max-w-md w-full text-left space-y-1">
            <div className="flex items-center gap-2 font-bold text-amber-950">
              <AlertCircle className="h-4 w-4 text-amber-600 shrink-0" />
              <span>Complete the following to finish:</span>
            </div>
            <ul className="list-disc list-inside text-[11px] space-y-0.5 pl-5 text-amber-800">
              {!isBacklogValid && <li>Minimum 2 Backlog Improvements</li>}
              {!isMistakeValid && <li>Mistake retrospective explanation</li>}
              {!isLessonValid && <li>Key engineering lesson statement</li>}
            </ul>
          </div>
        )}

        <button
          type="button"
          onClick={() => {
            if (!isAllValid) return;
            persistData();
            onComplete();
          }}
          disabled={!isAllValid}
          className={`inline-flex items-center gap-3 px-10 py-4 rounded-full font-semibold font-sans text-base transition-all shadow-md ${
            isAllValid
              ? "bg-teal-800 hover:bg-teal-700 text-white cursor-pointer hover:shadow-lg hover:scale-105"
              : "bg-zinc-200 text-zinc-400 cursor-not-allowed border border-zinc-300 shadow-none"
          }`}
        >
          <span>Complete Product Journey & Add to Portfolio →</span>
        </button>
      </footer>
    </div>
  );
}
