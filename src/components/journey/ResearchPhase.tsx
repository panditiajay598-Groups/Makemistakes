"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  BookmarkCheck,
  Search,
  FileText,
  CheckSquare,
  Plus,
  Upload,
  FilePlus,
  CheckCircle2,
  Sparkles,
  Link as LinkIcon,
  Image as ImageIcon,
  StickyNote,
  AlertCircle,
  Trash2,
  Edit2,
  ExternalLink,
  ShieldCheck,
} from "lucide-react";

import { ProblemData } from "@/lib/problemContent";

interface ResearchPhaseProps {
  onComplete: () => void;
  onBackToJourney?: () => void;
  problemData?: ProblemData | null;
}

interface ResearchQuestion {
  id: string;
  number: string;
  title: string;
  helperText: string;
  placeholder: string;
  limit: number;
}

const RESEARCH_QUESTIONS: ResearchQuestion[] = [
  {
    id: "q1",
    number: "01",
    title: "What products already exist that solve this problem?",
    helperText:
      "Research existing applications, websites, or products related to medication reminders.",
    placeholder: "Type your research here...",
    limit: 1000,
  },
  {
    id: "q2",
    number: "02",
    title: "Who are the biggest competitors?",
    helperText: "List the products or companies users currently rely on.",
    placeholder: "List competitors, companies, or alternative methods...",
    limit: 1000,
  },
  {
    id: "q3",
    number: "03",
    title: "What features do these competitors provide?",
    helperText:
      "List the most valuable features you discovered during your research.",
    placeholder: "Detail feature sets, notification types, schedules...",
    limit: 1000,
  },
  {
    id: "q4",
    number: "04",
    title: "What problems or complaints do users have?",
    helperText:
      "Research reviews from App Store, Play Store, Reddit, forums or social media. Summarize common complaints.",
    placeholder: "Summarize user frustrations, negative reviews, friction points...",
    limit: 1000,
  },
  {
    id: "q5",
    number: "05",
    title: "What opportunities do you see?",
    helperText:
      "If you were building this product today, what would you improve?",
    placeholder: "Describe gaps in existing tools and your proposed improvements...",
    limit: 1000,
  },
  {
    id: "q6",
    number: "06",
    title: "Research Summary",
    helperText:
      "Summarize everything you learned. Explain why this product still has room for innovation.",
    placeholder: "Write your final synthesis and core product take-away...",
    limit: 1500,
  },
];

const INITIAL_CHECKLIST = [
  { id: "c1", label: "Competitors researched", checked: false },
  { id: "c2", label: "Reviews analyzed", checked: false },
  { id: "c3", label: "Features compared", checked: false },
  { id: "c4", label: "User complaints collected", checked: false },
  { id: "c5", label: "Opportunities identified", checked: false },
];

function validateAndCleanUrl(rawUrl: string): string | null {
  let cleaned = rawUrl.trim();
  if (!cleaned) return null;

  if (!cleaned.startsWith("http://") && !cleaned.startsWith("https://")) {
    cleaned = "https://" + cleaned;
  }

  try {
    const urlObj = new URL(cleaned);
    if (
      (urlObj.protocol === "http:" || urlObj.protocol === "https:") &&
      urlObj.hostname.includes(".")
    ) {
      return urlObj.toString();
    }
  } catch {
    return null;
  }
  return null;
}

interface ResearchPhaseProps {
  onComplete: () => void;
  onBackToJourney?: () => void;
  problemData?: ProblemData | null;
  userId?: string;
}

import { getJourneyUserId } from "@/lib/journeyUser";

export default function ResearchPhase({
  onComplete,
  onBackToJourney,
  problemData,
  userId,
}: ResearchPhaseProps) {
  const pid = problemData?.problemId ?? "";
  const effectiveUserId = (userId || getJourneyUserId()).toString().trim().toLowerCase();
  const storageKey = pid && effectiveUserId ? `makemistakes_research_${effectiveUserId}_${pid}` : null;

  // Mandatory Research Evidence URL state
  const [sources, setSources] = useState<string[]>([]);
  const [urlInput, setUrlInput] = useState("");
  const [urlError, setUrlError] = useState("");
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  // Notebook Answers & Checklist state
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [checklist, setChecklist] = useState(INITIAL_CHECKLIST);
  const [attachedResources, setAttachedResources] = useState<
    { id: string; type: "link" | "screenshot" | "note"; title: string }[]
  >([]);
  const [isSaved, setIsSaved] = useState(false);
  const [showResourceInput, setShowResourceInput] = useState<
    "link" | "screenshot" | "note" | null
  >(null);
  const [resourceValue, setResourceValue] = useState("");

  // Load saved data from Server API + localStorage fallback
  useEffect(() => {
    // Step 1: Reset ALL state to empty defaults (clears previous problem's data)
    setSources([]);
    setUrlInput("");
    setUrlError("");
    setEditingIndex(null);
    setAnswers({});
    setChecklist(INITIAL_CHECKLIST);
    setAttachedResources([]);
    setIsSaved(false);
    setShowResourceInput(null);
    setResourceValue("");

    if (!pid) return;

    let isSubscribed = true;

    async function loadData() {
      try {
        const res = await fetch(`/api/journey/user-data?userId=${encodeURIComponent(effectiveUserId)}&problemId=${encodeURIComponent(pid)}`);
        if (res.ok) {
          const json = await res.json();
          const rData = json?.phases?.research;
          if (isSubscribed && rData) {
            if (Array.isArray(rData.sources)) setSources(rData.sources);
            if (rData.answers) setAnswers(rData.answers);
            if (Array.isArray(rData.checklist) && rData.checklist.length > 0) setChecklist(rData.checklist);
            if (Array.isArray(rData.attachedResources)) setAttachedResources(rData.attachedResources);
            return;
          }
        }
      } catch (err) {
        console.warn("[ResearchPhase] Server load warning:", err);
      }

      // Fallback to local storage
      if (storageKey) {
        try {
          const saved = localStorage.getItem(storageKey);
          if (saved && isSubscribed) {
            const parsed = JSON.parse(saved);
            if (Array.isArray(parsed.sources)) setSources(parsed.sources);
            if (parsed.answers) setAnswers(parsed.answers);
            if (parsed.checklist) setChecklist(parsed.checklist);
            if (parsed.attachedResources) setAttachedResources(parsed.attachedResources);
          }
        } catch {}
      }
    }

    loadData();

    return () => {
      isSubscribed = false;
    };
  }, [pid, effectiveUserId, storageKey]);

  const persistData = (
    srcs: string[],
    ans: Record<string, string>,
    chk: typeof INITIAL_CHECKLIST,
    res: typeof attachedResources
  ) => {
    if (!pid) return;
    const payload = {
      sources: srcs,
      answers: ans,
      checklist: chk,
      attachedResources: res,
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
        phase: "research",
        data: payload,
      }),
    }).catch((err) => console.warn("[ResearchPhase] Server save warning:", err));
  };

  const handleSaveProgress = () => {
    persistData(sources, answers, checklist, attachedResources);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  const handleAddOrUpdateSource = () => {
    if (!urlInput.trim()) {
      setUrlError("Please enter a research URL.");
      return;
    }
    const cleaned = validateAndCleanUrl(urlInput);
    if (!cleaned) {
      setUrlError("Please enter a valid URL (e.g. https://google.com or github.com)");
      return;
    }
    setUrlError("");

    let updated: string[];
    if (editingIndex !== null) {
      updated = [...sources];
      updated[editingIndex] = cleaned;
      setEditingIndex(null);
    } else {
      updated = [...sources, cleaned];
    }

    setSources(updated);
    setUrlInput("");
    persistData(updated, answers, checklist, attachedResources);
  };

  const handleEditSource = (index: number) => {
    setEditingIndex(index);
    setUrlInput(sources[index] || "");
    setUrlError("");
  };

  const handleRemoveSource = (index: number) => {
    const updated = sources.filter((_, i) => i !== index);
    setSources(updated);
    if (editingIndex === index) {
      setEditingIndex(null);
      setUrlInput("");
    }
    persistData(updated, answers, checklist, attachedResources);
  };

  const handleAnswerChange = (id: string, val: string) => {
    const updated = { ...answers, [id]: val };
    setAnswers(updated);
    persistData(sources, updated, checklist, attachedResources);
  };

  const handleToggleChecklist = (id: string) => {
    const updated = checklist.map((item) =>
      item.id === id ? { ...item, checked: !item.checked } : item
    );
    setChecklist(updated);
    persistData(sources, answers, updated, attachedResources);
  };

  const handleAddResource = () => {
    if (!showResourceInput || !resourceValue.trim()) return;
    const newRes = {
      id: Date.now().toString(),
      type: showResourceInput,
      title: resourceValue.trim(),
    };
    const updated = [...attachedResources, newRes];
    setAttachedResources(updated);
    persistData(sources, answers, checklist, updated);
    setResourceValue("");
    setShowResourceInput(null);
  };

  const hasSources = sources.length > 0;

  return (
    <div className="w-full text-zinc-900 font-sans antialiased selection:bg-teal-700 selection:text-white pb-20">
      {/* ============================================================ */}
      {/* PAGE HEADER                                                  */}
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
            <span>{isSaved ? "Research Saved!" : "Save Progress"}</span>
          </button>
        </div>
      </header>

      {/* ============================================================ */}
      {/* HERO SECTION (65% LEFT, 35% RIGHT 3D ILLUSTRATION)           */}
      {/* ============================================================ */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center mb-12">
        {/* Left (65%) */}
        <div className="lg:col-span-8 space-y-6 text-left">
          <div>
            <span className="inline-flex items-center gap-2 text-[11px] font-mono font-semibold tracking-wider text-teal-800 bg-teal-50 border border-teal-100 px-3 py-1 rounded-full uppercase">
              PHASE 2 OF 8 • RESEARCH
            </span>
          </div>

          <h1 className="font-serif text-4xl sm:text-6xl font-bold text-zinc-900 tracking-tight leading-[1.08]">
            Research the Existing Market
          </h1>

          <p className="text-base sm:text-lg text-zinc-600 leading-relaxed font-sans max-w-2xl">
            Before designing a product, understand what already exists, what users struggle with, and where opportunities lie.
          </p>
        </div>

        {/* Right (35%) — Floating 3D Research Illustration */}
        <div className="lg:col-span-4 flex items-center justify-end relative">
          <div className="absolute inset-0 bg-gradient-to-br from-teal-100/60 via-amber-100/40 to-emerald-100/50 rounded-full blur-3xl -z-10 transform scale-125" />

          <div className="relative w-full max-w-xs aspect-square flex items-center justify-center">
            <div className="relative z-10 w-44 h-56 bg-white border border-zinc-200/90 rounded-2xl shadow-xl p-5 flex flex-col justify-between transform -rotate-3 hover:rotate-0 transition-transform duration-500">
              <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
                <div className="h-2.5 w-16 bg-teal-700 rounded-full" />
                <FileText className="h-4 w-4 text-teal-700" />
              </div>
              <div className="space-y-2 py-2">
                <div className="h-2 w-28 bg-zinc-200 rounded" />
                <div className="h-2 w-20 bg-zinc-200 rounded" />
                <div className="h-2 w-24 bg-zinc-200 rounded" />
                <div className="h-2 w-16 bg-teal-100 rounded" />
              </div>
              <div className="pt-2 border-t border-zinc-100 flex items-center justify-between">
                <span className="text-[9px] font-mono text-zinc-400">Market Insights</span>
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
              </div>
            </div>

            <div className="absolute -top-4 -right-3 z-20 bg-gradient-to-tr from-teal-600 to-teal-800 p-4 rounded-2xl shadow-xl text-white transform rotate-12 animate-bounce border border-white/30">
              <Search className="h-7 w-7" />
            </div>

            <div className="absolute -bottom-4 -left-4 z-20 bg-white border border-zinc-200 rounded-2xl p-3.5 shadow-lg flex items-center gap-3 transform rotate-6">
              <div className="h-9 w-9 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-700 shrink-0">
                <CheckSquare className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-mono font-bold text-zinc-900">Competitor Audit</p>
                <p className="text-[10px] text-teal-700 font-medium">6 Insights Collected</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* MANDATORY SECTION: RESEARCH EVIDENCE (BEFORE QUESTIONS)      */}
      {/* ============================================================ */}
      <section className="bg-white border border-zinc-200/80 rounded-2xl p-7 shadow-xs space-y-6 mb-12">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-zinc-100">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono font-bold text-rose-700 bg-rose-50 border border-rose-100 px-2 py-0.5 rounded uppercase">
                Mandatory Requirement
              </span>
              <h2 className="font-serif text-2xl font-bold text-zinc-900 tracking-tight">
                Research Evidence
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-zinc-500 font-sans leading-relaxed max-w-3xl">
              Every engineering decision should be backed by research. Before answering the questions below, provide at least one source that you used during your research.
            </p>
          </div>

          {/* Status Badge & Sources Count */}
          <div className="flex items-center gap-2.5 shrink-0">
            {hasSources ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-mono font-semibold">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                ✓ Research Source Added ({sources.length})
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-mono font-semibold">
                <AlertCircle className="h-3.5 w-3.5 text-amber-600" />
                0 Sources Added
              </span>
            )}
          </div>
        </div>

        {/* Input Field & Form */}
        <div className="space-y-4 max-w-3xl">
          <div className="space-y-1.5">
            <label className="block text-xs font-bold font-mono text-zinc-800 uppercase tracking-wider">
              Research Source URL <span className="text-rose-600">*</span>
            </label>
            <p className="text-xs text-zinc-500 font-sans">
              Paste the URL of the website, article, documentation, competitor website, Play Store page, App Store page, Reddit discussion, GitHub repository, YouTube video, or any other source you used during your research.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-2.5">
            <div className="relative flex-1">
              <LinkIcon className="absolute left-3.5 top-3.5 h-4 w-4 text-zinc-400" />
              <input
                type="url"
                value={urlInput}
                onChange={(e) => {
                  setUrlInput(e.target.value);
                  if (urlError) setUrlError("");
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddOrUpdateSource();
                  }
                }}
                placeholder="https://..."
                className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-xs sm:text-sm font-mono text-zinc-800 placeholder-zinc-400 bg-zinc-50/50 focus:bg-white focus:outline-none transition-all ${
                  urlError
                    ? "border-rose-300 focus:border-rose-500 bg-rose-50/20"
                    : "border-zinc-300 focus:border-teal-600"
                }`}
              />
            </div>

            <button
              type="button"
              onClick={handleAddOrUpdateSource}
              className="inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl bg-teal-800 hover:bg-teal-700 text-white text-xs font-mono font-semibold transition-all cursor-pointer shrink-0 shadow-sm"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>{editingIndex !== null ? "Update Source" : "Add Source"}</span>
            </button>
          </div>

          {/* Validation Error Message */}
          {urlError && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />
              <span>{urlError}</span>
            </div>
          )}

          {/* List of Added Sources */}
          {sources.length > 0 && (
            <div className="space-y-2.5 pt-2">
              <div className="flex items-center justify-between text-xs font-mono text-zinc-400">
                <span>COLLECTED SOURCES ({sources.length})</span>
                <span>Actions</span>
              </div>

              {sources.map((src, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3.5 rounded-xl border border-zinc-200 bg-zinc-50/70 hover:bg-white transition-all text-xs font-mono"
                >
                  <div className="flex items-center gap-2.5 min-w-0 flex-1 pr-3">
                    <span className="h-5 w-5 rounded-full bg-teal-100 text-teal-800 text-[10px] font-bold flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <a
                      href={src}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-teal-700 hover:text-teal-900 font-medium truncate underline flex items-center gap-1"
                    >
                      <span className="truncate">{src}</span>
                      <ExternalLink className="h-3 w-3 shrink-0" />
                    </a>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleEditSource(idx)}
                      className="p-1.5 text-zinc-500 hover:text-teal-700 hover:bg-teal-50 rounded-lg transition-colors cursor-pointer"
                      title="Edit URL"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRemoveSource(idx)}
                      className="p-1.5 text-zinc-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                      title="Remove URL"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}

              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setEditingIndex(null);
                    setUrlInput("");
                    setUrlError("");
                  }}
                  className="inline-flex items-center gap-1.5 text-xs font-mono text-teal-700 hover:text-teal-900 font-semibold cursor-pointer"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Add Another Source</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ============================================================ */}
      {/* MAIN CONTENT — 6 RESEARCH QUESTIONS (2-COLUMN GRID DESKTOP)   */}
      {/* ============================================================ */}
      <section className="mb-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {RESEARCH_QUESTIONS.map((q) => {
            const currentText = answers[q.id] ?? "";
            const charCount = currentText.length;

            return (
              <div
                key={q.id}
                className="bg-white border border-zinc-200/80 rounded-2xl p-7 shadow-xs space-y-4 flex flex-col justify-between hover:border-zinc-300 transition-all"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono font-bold text-teal-800 bg-teal-50 border border-teal-100 px-2.5 py-0.5 rounded">
                      QUESTION {q.number}
                    </span>
                    <span className="text-[10px] font-mono text-zinc-400">
                      {charCount} / {q.limit} chars
                    </span>
                  </div>

                  <h3 className="font-sans text-base sm:text-lg font-bold text-zinc-900 leading-snug">
                    {q.title}
                  </h3>

                  <p className="text-xs text-zinc-500 font-sans leading-relaxed">
                    {q.helperText}
                  </p>
                </div>

                <div className="pt-2">
                  <textarea
                    rows={5}
                    value={currentText}
                    onChange={(e) =>
                      handleAnswerChange(q.id, e.target.value)
                    }
                    placeholder={q.placeholder}
                    className="w-full p-4 rounded-xl border border-zinc-200 text-xs sm:text-sm font-sans text-zinc-800 placeholder-zinc-400 bg-zinc-50/50 focus:bg-white focus:border-teal-500 focus:outline-none transition-all resize-y leading-relaxed"
                  />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ============================================================ */}
      {/* BOTTOM SECTION — TWO SIDE-BY-SIDE BLOCKS                     */}
      {/* ============================================================ */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        {/* Left Block: Attach Supporting Research (Optional) */}
        <div className="bg-white border border-zinc-200/80 rounded-2xl p-7 shadow-xs space-y-5 flex flex-col justify-between">
          <div className="space-y-1">
            <h3 className="font-serif text-xl font-bold text-zinc-900 tracking-tight">
              Attach Supporting Research (Optional)
            </h3>
            <p className="text-xs text-zinc-500 font-sans">
              Attach resources that helped during your research.
            </p>
          </div>

          {/* Attached Resources Display */}
          {attachedResources.length > 0 && (
            <div className="space-y-2">
              {attachedResources.map((res) => (
                <div
                  key={res.id}
                  className="flex items-center justify-between p-3 bg-teal-50/50 border border-teal-100 rounded-xl text-xs"
                >
                  <span className="font-medium text-teal-900 flex items-center gap-2">
                    {res.type === "link" && <LinkIcon className="h-3.5 w-3.5 text-teal-700" />}
                    {res.type === "screenshot" && <ImageIcon className="h-3.5 w-3.5 text-teal-700" />}
                    {res.type === "note" && <StickyNote className="h-3.5 w-3.5 text-teal-700" />}
                    {res.title}
                  </span>
                  <span className="text-[10px] font-mono text-teal-700 uppercase bg-teal-100 px-2 py-0.5 rounded">
                    {res.type}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Interactive input box if adding a resource */}
          {showResourceInput && (
            <div className="p-3.5 bg-zinc-50 border border-zinc-200 rounded-xl space-y-2">
              <p className="text-xs font-semibold text-zinc-700 capitalize">
                Add {showResourceInput}:
              </p>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={resourceValue}
                  onChange={(e) => setResourceValue(e.target.value)}
                  placeholder={
                    showResourceInput === "link"
                      ? "https://..."
                      : showResourceInput === "screenshot"
                      ? "Screenshot title or file name..."
                      : "Type quick note..."
                  }
                  className="flex-1 px-3 py-1.5 rounded-lg border border-zinc-300 text-xs font-sans focus:outline-none focus:border-teal-500"
                />
                <button
                  type="button"
                  onClick={handleAddResource}
                  className="px-3 py-1.5 bg-teal-700 text-white rounded-lg text-xs font-semibold hover:bg-teal-800 transition-colors cursor-pointer"
                >
                  Save
                </button>
              </div>
            </div>
          )}

          {/* 3 Outline Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => setShowResourceInput("link")}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-zinc-300 bg-white hover:bg-zinc-50 text-xs font-sans font-medium text-zinc-700 transition-all cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5 text-teal-700" />
              <span>+ Add Link</span>
            </button>

            <button
              type="button"
              onClick={() => setShowResourceInput("screenshot")}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-zinc-300 bg-white hover:bg-zinc-50 text-xs font-sans font-medium text-zinc-700 transition-all cursor-pointer"
            >
              <Upload className="h-3.5 w-3.5 text-teal-700" />
              <span>Upload Screenshot</span>
            </button>

            <button
              type="button"
              onClick={() => setShowResourceInput("note")}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-zinc-300 bg-white hover:bg-zinc-50 text-xs font-sans font-medium text-zinc-700 transition-all cursor-pointer"
            >
              <FilePlus className="h-3.5 w-3.5 text-teal-700" />
              <span>Add Note</span>
            </button>
          </div>
        </div>

        {/* Right Block: Research Checklist */}
        <div className="bg-white border border-zinc-200/80 rounded-2xl p-7 shadow-xs space-y-5 flex flex-col justify-between">
          <div className="space-y-1">
            <h3 className="font-serif text-xl font-bold text-zinc-900 tracking-tight">
              Research Checklist
            </h3>
            <p className="text-xs text-zinc-500 font-sans">
              Verify completion before proceeding to design.
            </p>
          </div>

          <div className="space-y-3 pt-1">
            {checklist.map((item) => (
              <label
                key={item.id}
                className={`flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer ${
                  item.checked
                    ? "bg-teal-50/70 border-teal-200 text-teal-950 font-medium"
                    : "bg-zinc-50/50 border-zinc-200 text-zinc-700 hover:bg-zinc-100/60"
                }`}
              >
                <input
                  type="checkbox"
                  checked={item.checked}
                  onChange={() => handleToggleChecklist(item.id)}
                  className="h-4 w-4 text-teal-700 border-zinc-300 rounded focus:ring-teal-500 shrink-0 cursor-pointer"
                />
                <span className="text-xs sm:text-sm font-sans">{item.label}</span>
              </label>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* BOTTOM ACTION (CENTER ALIGNED PRIMARY BUTTON & VALIDATION)    */}
      {/* ============================================================ */}
      <footer className="flex flex-col items-center justify-center space-y-4 pt-4 text-center">
        {!hasSources && (
          <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-center gap-2 max-w-md w-full">
            <AlertCircle className="h-4 w-4 text-amber-600 shrink-0" />
            <span>Add at least one research source before continuing.</span>
          </div>
        )}

        <button
          type="button"
          onClick={() => {
            if (!hasSources) return;
            persistData(sources, answers, checklist, attachedResources);
            onComplete();
          }}
          disabled={!hasSources}
          className={`inline-flex items-center gap-3 px-10 py-4 rounded-full font-semibold font-sans text-base transition-all shadow-md ${
            hasSources
              ? "bg-teal-800 hover:bg-teal-700 text-white cursor-pointer hover:shadow-lg hover:scale-105"
              : "bg-zinc-200 text-zinc-400 cursor-not-allowed border border-zinc-300 shadow-none"
          }`}
        >
          <span>Continue to Design →</span>
        </button>

        <p className="text-xs font-mono text-zinc-400">
          {hasSources
            ? `✓ ${sources.length} research source(s) verified. Ready to proceed.`
            : "Add at least one research source before continuing."}
        </p>
      </footer>
    </div>
  );
}
