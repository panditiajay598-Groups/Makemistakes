"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Sparkles,
  ArrowRight,
  Send,
  Loader2,
  AlertCircle,
  HelpCircle,
  RotateCcw,
  Tag,
  Gauge,
  Lightbulb,
} from "lucide-react";
import { ProblemData } from "@/lib/problemContent";
import { getJourneyUserId } from "@/lib/journeyUser";

interface ProblemUnderstandingScreenProps {
  problemId: string;
  productName: string;
  problemData?: ProblemData | null;
  onStartBuilding: () => void;
  canReturnToIDE?: boolean;
}

type QnAMessage = {
  role: "user" | "assistant";
  content: string;
};

const SUGGESTED_QUESTIONS = [
  "Why is this problem difficult?",
  "Who would actually use this product?",
  "What should I think about before coding?",
  "What are the biggest risks?",
  "Give me a real-world example.",
];

export default function ProblemUnderstandingScreen({
  problemId,
  productName,
  problemData,
  onStartBuilding,
  canReturnToIDE = false,
}: ProblemUnderstandingScreenProps) {
  const userId = getJourneyUserId();
  const rawStatement =
    problemData?.problemStatement ||
    (problemData as any)?.description ||
    `Build a functional solution for ${productName}.`;

  // Nova understanding state
  const [novaExplanation, setNovaExplanation] = useState<string | null>(null);
  const [novaLoading, setNovaLoading] = useState<boolean>(true);
  const [novaError, setNovaError] = useState<string | null>(null);

  // Q&A section state
  const [messages, setMessages] = useState<QnAMessage[]>([]);
  const [inputQuery, setInputQuery] = useState("");
  const [qnaLoading, setQnaLoading] = useState(false);

  // Debounce rapid clicks on Start Building
  const [isTransitioning, setIsTransitioning] = useState(false);
  const activeRequestIdRef = useRef<number>(0);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  const fetchNovaUnderstanding = useCallback(async () => {
    const requestId = ++activeRequestIdRef.current;
    setNovaLoading(true);
    setNovaError(null);

    try {
      const res = await fetch("/api/nova/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [
            {
              role: "user",
              content: `Please provide a deep problem breakdown and architectural understanding for '${productName}'. Problem Statement: "${rawStatement}". Break down what the problem is, who experiences it, why it matters, major pain points, product goals, constraints, success metrics, and what to think about before coding. Do not write full application code.`,
            },
          ],
          context: {
            mode: "problem_understanding",
            problemId,
            productName,
            problemStatement: rawStatement,
            userId,
          },
        }),
      });

      // Ignore stale responses if the user switched problems or triggered a new request
      if (activeRequestIdRef.current !== requestId) return;

      const data = await res.json();
      if (res.ok && data?.message) {
        setNovaExplanation(data.message);
        setNovaError(null);
      } else {
        throw new Error(data?.error || "Failed to generate explanation");
      }
    } catch (err: any) {
      if (activeRequestIdRef.current === requestId) {
        console.warn("[ProblemUnderstanding] Nova fetch error:", err);
        setNovaError("Nova couldn't explain this problem right now.");
      }
    } finally {
      if (activeRequestIdRef.current === requestId) {
        setNovaLoading(false);
      }
    }
  }, [problemId, productName, rawStatement, userId]);

  // Initial single automatic fetch per problemId
  useEffect(() => {
    setNovaExplanation(null);
    setMessages([]);
    fetchNovaUnderstanding();
  }, [fetchNovaUnderstanding]);

  // Ask Nova follow-up question
  const handleAskQuestion = async (queryText?: string) => {
    const q = (queryText || inputQuery).trim();
    if (!q || qnaLoading) return;

    setInputQuery("");
    const newHistory: QnAMessage[] = [...messages, { role: "user", content: q }];
    setMessages(newHistory);
    setQnaLoading(true);

    try {
      const res = await fetch("/api/nova/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [
            ...newHistory.map((m) => ({ role: m.role, content: m.content })),
          ],
          context: {
            mode: "problem_understanding",
            problemId,
            productName,
            problemStatement: rawStatement,
            userId,
          },
        }),
      });

      const data = await res.json();
      if (res.ok && data?.message) {
        setMessages((prev) => [...prev, { role: "assistant", content: data.message }]);
      } else {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: "I had trouble processing that question right now. Feel free to ask again or jump into the code!" },
        ]);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Connection issue. You can try again or proceed to building." },
      ]);
    } finally {
      setQnaLoading(false);
      setTimeout(() => chatBottomRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    }
  };

  const handleStartBuildingClick = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    onStartBuilding();
  };

  return (
    <div className="w-full h-full flex flex-col bg-[#07090e] text-zinc-100 selection:bg-teal-700 selection:text-white overflow-y-auto overflow-x-hidden relative">
      {/* Top Header */}
      <header className="sticky top-0 z-20 bg-[#0a0d14]/90 backdrop-blur-md border-b border-zinc-800/80 px-6 py-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-teal-950/80 border border-teal-800/60 text-teal-300 font-bold text-xs tracking-wide font-mono">
            <Sparkles className="h-3.5 w-3.5 text-teal-400" />
            BuildOS · Phase 5
          </div>
          <div className="h-4 w-px bg-zinc-800 hidden sm:block" />
          <span className="text-xs text-zinc-400 font-mono hidden sm:inline">
            {problemId} · {productName}
          </span>
        </div>

        {/* Top Direct CTA */}
        <button
          type="button"
          onClick={handleStartBuildingClick}
          disabled={isTransitioning}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-lg bg-teal-500 hover:bg-teal-400 text-zinc-950 text-xs font-bold transition-all cursor-pointer shadow hover:shadow-teal-500/20 active:scale-95 disabled:opacity-50"
        >
          <span>{isTransitioning ? "Preparing Workspace..." : canReturnToIDE ? "Return to Workspace" : "Start Building"}</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-5 py-8 sm:py-12 space-y-8">
        {/* Screen Title & Subtitle */}
        <div className="space-y-2 border-b border-zinc-800/60 pb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-950/60 border border-teal-800/50 text-teal-300 text-xs font-semibold">
            <Lightbulb className="h-3.5 w-3.5 text-teal-400" />
            Step 1 of 2 · Problem Framing
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            Understand the Problem
          </h1>
          <p className="text-zinc-400 text-sm sm:text-base leading-relaxed">
            Before you start building, let&apos;s understand what you&apos;re actually solving.
          </p>
        </div>

        {/* SECTION 1: YOUR PROBLEM */}
        <section className="bg-[#0c0f17] border border-zinc-800/80 rounded-2xl p-6 sm:p-7 space-y-4 shadow-xl shadow-black/40">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-teal-400" />
              <h2 className="text-xs font-bold font-mono uppercase tracking-wider text-teal-400">
                YOUR PROBLEM
              </h2>
            </div>

            {/* Problem Tags */}
            <div className="flex items-center gap-2 text-[11px] font-mono">
              {problemData?.category && (
                <span className="flex items-center gap-1 px-2.5 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-300">
                  <Tag className="h-3 w-3 text-zinc-500" />
                  {problemData.category}
                </span>
              )}
              {problemData?.difficulty && (
                <span className="flex items-center gap-1 px-2.5 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-teal-300">
                  <Gauge className="h-3 w-3 text-teal-400" />
                  {problemData.difficulty}
                </span>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight">
              {problemData?.title || productName}
            </h3>
            <p className="text-sm sm:text-[15px] text-zinc-300 leading-relaxed whitespace-pre-wrap font-sans bg-[#07090e] p-4 rounded-xl border border-zinc-800/60">
              {rawStatement}
            </p>
          </div>

          {problemData?.relatedInformation?.affectedParties && problemData.relatedInformation.affectedParties.length > 0 && (
            <div className="pt-2 flex flex-wrap items-center gap-2 text-xs">
              <span className="text-zinc-400 font-medium">Affected Audience:</span>
              {problemData.relatedInformation.affectedParties.map((party, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-0.5 rounded-full bg-teal-950/40 border border-teal-800/40 text-teal-200 text-[11px]"
                >
                  {party}
                </span>
              ))}
            </div>
          )}
        </section>

        {/* SECTION 2: NOVA'S UNDERSTANDING */}
        <section className="bg-[#0b0e16] border border-teal-900/40 rounded-2xl p-6 sm:p-7 space-y-5 shadow-xl">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-teal-400" />
              <h2 className="text-xs font-bold font-mono uppercase tracking-wider text-teal-300">
                NOVA&apos;S UNDERSTANDING
              </h2>
            </div>
            {!novaLoading && novaExplanation && (
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800/50 px-2 py-0.5 rounded">
                ✓ AI Analysis Synthesized
              </span>
            )}
          </div>

          {/* Loading State */}
          {novaLoading && (
            <div className="py-8 flex flex-col items-center justify-center gap-3 text-center">
              <Loader2 className="h-7 w-7 animate-spin text-teal-400" />
              <p className="text-sm text-zinc-300 font-medium">
                Nova is understanding your problem...
              </p>
              <p className="text-xs text-zinc-500 max-w-sm">
                Evaluating core user pain points, system constraints, and product success metrics.
              </p>
            </div>
          )}

          {/* Failure State */}
          {novaError && !novaLoading && (
            <div className="bg-rose-950/30 border border-rose-800/50 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <AlertCircle className="h-5 w-5 text-rose-400 shrink-0" />
                <div>
                  <p className="text-xs font-semibold text-rose-200">{novaError}</p>
                  <p className="text-[11px] text-zinc-400">
                    You can retry the analysis or jump directly into the code.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={fetchNovaUnderstanding}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold transition-colors cursor-pointer"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  Try Again
                </button>
                <button
                  type="button"
                  onClick={handleStartBuildingClick}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-500 hover:bg-teal-400 text-zinc-950 text-xs font-bold transition-colors cursor-pointer"
                >
                  Start Building →
                </button>
              </div>
            </div>
          )}

          {/* Rendered Explanation */}
          {!novaLoading && novaExplanation && (
            <div className="text-xs sm:text-sm text-zinc-200 leading-relaxed font-sans space-y-4 bg-[#06080d] p-5 sm:p-6 rounded-xl border border-zinc-800/80">
              <div className="prose prose-invert prose-teal max-w-none prose-sm whitespace-pre-wrap">
                {novaExplanation}
              </div>
            </div>
          )}
        </section>

        {/* SECTION 3: ASK NOVA ABOUT THIS PROBLEM */}
        <section className="bg-[#090b11] border border-zinc-800/70 rounded-2xl p-6 sm:p-7 space-y-4 shadow-lg">
          <div className="flex items-center gap-2">
            <HelpCircle className="h-4 w-4 text-teal-400" />
            <h2 className="text-xs font-bold font-mono uppercase tracking-wider text-zinc-300">
              ASK NOVA ABOUT THIS PROBLEM
            </h2>
          </div>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Have doubts about who uses this, why it&apos;s difficult, or what risks to anticipate? Ask Nova to clarify before you code.
          </p>

          {/* Quick Prompt Chips */}
          <div className="flex flex-wrap gap-2 pt-1">
            {SUGGESTED_QUESTIONS.map((chip, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleAskQuestion(chip)}
                disabled={qnaLoading}
                className="px-3 py-1.5 rounded-full bg-zinc-900/90 hover:bg-teal-950/60 text-zinc-300 hover:text-teal-300 border border-zinc-800 hover:border-teal-800/60 text-xs transition-all cursor-pointer disabled:opacity-40"
              >
                + {chip}
              </button>
            ))}
          </div>

          {/* Q&A Chat History */}
          {messages.length > 0 && (
            <div className="space-y-3 pt-3 border-t border-zinc-800/60 max-h-80 overflow-y-auto">
              {messages.map((m, i) => (
                <div
                  key={i}
                  className={`p-3.5 rounded-xl text-xs sm:text-sm leading-relaxed ${
                    m.role === "user"
                      ? "bg-teal-950/60 border border-teal-800/50 text-teal-100 ml-6"
                      : "bg-[#06080d] border border-zinc-800/80 text-zinc-200 mr-6 whitespace-pre-wrap"
                  }`}
                >
                  <span className="block font-mono text-[10px] uppercase font-bold text-zinc-500 mb-1">
                    {m.role === "user" ? "You" : "Nova AI"}
                  </span>
                  {m.content}
                </div>
              ))}
              {qnaLoading && (
                <div className="flex items-center gap-2 p-3 text-xs text-zinc-400 bg-[#06080d] rounded-xl border border-zinc-800/60">
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-teal-400" />
                  <span>Nova is analyzing...</span>
                </div>
              )}
              <div ref={chatBottomRef} />
            </div>
          )}

          {/* Custom Question Input */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleAskQuestion();
            }}
            className="flex items-center gap-2 pt-2"
          >
            <input
              type="text"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              placeholder="Ask anything about the problem statement, users, or technical risks..."
              className="flex-1 bg-zinc-900/90 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-zinc-200 placeholder-zinc-500 outline-none focus:border-teal-500/80 transition-colors"
            />
            <button
              type="submit"
              disabled={!inputQuery.trim() || qnaLoading}
              className="p-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-zinc-950 font-bold disabled:opacity-40 transition-colors cursor-pointer shadow"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </section>

        {/* SECTION 4: BOTTOM PRIMARY ACTION */}
        <div className="border-t border-zinc-800/80 pt-8 pb-12 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-center sm:text-left">
            <h4 className="text-sm font-bold text-white">Ready to begin engineering?</h4>
            <p className="text-xs text-zinc-400">
              Enter your isolated BuildOS cloud workspace with Monaco editor, real-time preview, and Nova code assistant.
            </p>
          </div>

          <button
            type="button"
            onClick={handleStartBuildingClick}
            disabled={isTransitioning}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-3 rounded-xl bg-teal-500 hover:bg-teal-400 text-zinc-950 text-sm font-extrabold transition-all cursor-pointer shadow-lg shadow-teal-500/20 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
          >
            <span>{isTransitioning ? "Preparing BuildOS..." : "Start Building"}</span>
            <ArrowRight className="h-4 w-4 stroke-[3]" />
          </button>
        </div>
      </main>
    </div>
  );
}
