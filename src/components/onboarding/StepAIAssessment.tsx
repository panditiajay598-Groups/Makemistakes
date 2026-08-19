"use client";

import React, { useState } from "react";
import { Sparkles, Clock, ArrowRight, CheckCircle2, Target, Code2, Bug, Terminal, Cpu, Layers } from "lucide-react";
import { motion } from "framer-motion";
import { StepAIAssessmentProps } from "./types";

interface QuestionTask {
  id: number;
  typeLabel: string;
  category: string;
  question: string;
  codeSnippet?: string;
  options: { label: string; text: string; insight: string }[];
}

export default function StepAIAssessment({ onNext }: StepAIAssessmentProps) {
  const [phase, setPhase] = useState<"intro" | "interview" | "results">("intro");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [activeInsight, setActiveInsight] = useState<string | null>(null);

  const tasks: QuestionTask[] = [
    {
      id: 1,
      typeLabel: "Task 1: Understand a Product",
      category: "Product & Architecture",
      question: "A payment gateway sends webhook retries when orders are placed. How do you prevent double-charging users?",
      options: [
        {
          label: "A",
          text: "Enforce Idempotency Keys in database transactions with unique constraints on idempotency_key.",
          insight: "Platform analysis: Strong architectural understanding of idempotent operations.",
        },
        {
          label: "B",
          text: "Check if order status is already 'PAID' in memory before calling payment service.",
          insight: "Platform analysis: Memory checks work locally, but distributed environments need atomic database locks.",
        },
        {
          label: "C",
          text: "Disable webhook retries on the payment gateway provider dashboard.",
          insight: "Platform analysis: Disabling retries risks losing legitimate payment notifications during transient network glitches.",
        },
      ],
    },
    {
      id: 2,
      typeLabel: "Task 2: Explain a Concept",
      category: "System Thinking & Logic",
      question: "Why should background tasks (like sending welcome emails) be offloaded to worker queues rather than processed inside the API request thread?",
      options: [
        {
          label: "A",
          text: "To avoid blocking the main event loop, keep HTTP latency fast, and enable automatic retries.",
          insight: "Platform analysis: Excellent grasp of asynchronous queue patterns and API latency SLAs.",
        },
        {
          label: "B",
          text: "Because Node.js cannot make HTTP calls inside an express route handler.",
          insight: "Platform analysis: Node.js can make HTTP calls, but doing so synchronously degrades response latency.",
        },
      ],
    },
    {
      id: 3,
      typeLabel: "Task 3: Read Code",
      category: "Code Analysis",
      question: "Inspect this async worker queue handler. What issue will occur under heavy burst traffic?",
      codeSnippet: `async function processQueue(jobs) {
  for (const job of jobs) {
    await sendNotification(job); // Blocking sequential execution!
    db.updateJobStatus(job.id, 'done');
  }
}`,
      options: [
        {
          label: "A",
          text: "Sequential await creates a bottleneck; should use Promise.allSettled with worker concurrency pools.",
          insight: "Platform analysis: Great eye for concurrency bottlenecks in backend loops.",
        },
        {
          label: "B",
          text: "The syntax error on line 3 prevents processQueue from compiling.",
          insight: "Platform analysis: The syntax is valid, but the execution pattern limits throughput.",
        },
      ],
    },
    {
      id: 4,
      typeLabel: "Task 4: Find the Bug",
      category: "Debugging & Reliability",
      question: "Users complain their shopping session disappears when refreshing across load balancers. Where is the bug?",
      codeSnippet: `// In-Memory Middleware
const userSession = memoryCache.get(sessionId);
if (!userSession) {
  memoryCache.set(sessionId, newSession, { ttl: 60 });
}`,
      options: [
        {
          label: "A",
          text: "In-memory cache is local to single instance; missing distributed cache like Redis.",
          insight: "Platform analysis: Spot-on diagnosis of stateful vs stateless server design.",
        },
        {
          label: "B",
          text: "The TTL should be set to 60000 instead of 60 seconds.",
          insight: "Platform analysis: Session store duration is secondary to cross-instance state isolation.",
        },
      ],
    },
  ];

  const handleSelectOption = (insight: string) => {
    setActiveInsight(insight);
    setTimeout(() => {
      setActiveInsight(null);
      if (currentIndex < tasks.length - 1) {
        setCurrentIndex(currentIndex + 1);
      } else {
        setPhase("results");
      }
    }, 1200);
  };

  const currentTask = tasks[currentIndex];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4 }}
      className="space-y-8 max-w-3xl mx-auto py-4 px-4"
    >
      {/* PHASE 1: INTRO */}
      {phase === "intro" && (
        <div className="space-y-8 text-center max-w-2xl mx-auto py-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-teal-200 bg-teal-50 px-4 py-1.5 text-xs font-mono font-semibold text-teal-800 shadow-sm">
            <Sparkles className="h-3.5 w-3.5 text-teal-700" />
            <span>ACT 2 — EVALUATE</span>
          </div>

          <div className="space-y-3">
            <h2 className="font-serif text-3xl sm:text-5xl text-zinc-900 leading-tight">
              Let&apos;s map your engineering level
            </h2>
            <p className="text-sm sm:text-base text-zinc-600 font-sans max-w-md mx-auto">
              Answer 4 short engineering scenarios so MakeMistakes AI can tailor your initial Sprint 1 tasks.
            </p>
          </div>

          <div className="bg-white border border-zinc-200/80 p-6 rounded-3xl text-left space-y-4 shadow-xl shadow-zinc-200/40">
            <div className="flex items-center justify-between text-xs font-mono text-zinc-500 border-b border-zinc-100 pb-3">
              <span className="flex items-center gap-1.5 text-teal-800 font-semibold">
                <Clock className="h-3.5 w-3.5 text-teal-700" /> 3-4 minutes
              </span>
              <span>4 Interactive Tasks</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-sans text-zinc-700">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-teal-700 shrink-0" />
                <span>Understand a Product</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-teal-700 shrink-0" />
                <span>Explain a Concept</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-teal-700 shrink-0" />
                <span>Read Code Snippet</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-teal-700 shrink-0" />
                <span>Find the Bug</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => setPhase("interview")}
            className="group inline-flex h-12 items-center justify-center gap-2 rounded-full bg-teal-700 hover:bg-teal-800 px-8 text-sm font-bold text-white transition-all cursor-pointer border-none shadow-md shadow-teal-700/20"
          >
            <span>Start Assessment</span>
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </button>
        </div>
      )}

      {/* PHASE 2: INTERVIEW */}
      {phase === "interview" && (
        <div className="space-y-6 max-w-2xl mx-auto">
          {/* Progress & Category */}
          <div className="flex items-center justify-between text-xs font-mono text-zinc-500">
            <span className="text-teal-800 font-bold bg-teal-50 border border-teal-200 px-2.5 py-0.5 rounded-full">
              {currentTask.typeLabel}
            </span>
            <span>Task {currentIndex + 1} of {tasks.length}</span>
          </div>

          {/* Question Card */}
          <div className="bg-white border border-zinc-200 p-6 rounded-3xl space-y-4 shadow-xl shadow-zinc-200/40 text-left">
            <h3 className="font-serif text-lg font-bold text-zinc-900 leading-snug">
              {currentTask.question}
            </h3>

            {currentTask.codeSnippet && (
              <pre className="bg-teal-900/90 text-teal-50 p-4 rounded-xl font-mono text-xs overflow-x-auto border border-teal-800">
                <code>{currentTask.codeSnippet}</code>
              </pre>
            )}

            {/* Options */}
            <div className="space-y-3 pt-2">
              {currentTask.options.map((opt) => (
                <button
                  key={opt.label}
                  onClick={() => handleSelectOption(opt.insight)}
                  disabled={activeInsight !== null}
                  className="w-full text-left p-4 rounded-2xl border border-zinc-200 hover:border-teal-700 hover:bg-teal-50/30 bg-white transition-all flex items-start gap-3 cursor-pointer group shadow-sm disabled:opacity-50"
                >
                  <span className="h-6 w-6 rounded-lg bg-teal-50 border border-teal-200 text-teal-800 font-mono font-bold text-xs flex items-center justify-center shrink-0 group-hover:bg-teal-700 group-hover:text-white transition-colors">
                    {opt.label}
                  </span>
                  <span className="text-xs sm:text-sm text-zinc-800 font-sans leading-relaxed pt-0.5 font-medium">
                    {opt.text}
                  </span>
                </button>
              ))}
            </div>

            {/* Active Insight Toast */}
            {activeInsight && (
              <div className="p-3 rounded-xl bg-teal-50 border border-teal-200 text-teal-800 text-xs font-mono animate-in fade-in duration-200">
                {activeInsight}
              </div>
            )}
          </div>
        </div>
      )}

      {/* PHASE 3: EVALUATION RESULTS SUMMARY */}
      {phase === "results" && (
        <div className="space-y-8 text-center max-w-2xl mx-auto py-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-teal-200 bg-teal-50 px-4 py-1.5 text-xs font-mono font-semibold text-teal-800 shadow-sm">
            <CheckCircle2 className="h-4 w-4 text-teal-700" />
            <span>Assessment Complete</span>
          </div>

          <div className="space-y-2">
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-zinc-900 tracking-tight">
              Assessment Complete
            </h2>
            <p className="text-sm text-zinc-600 font-sans max-w-md mx-auto">
              Your responses have been used to personalize your upcoming Sprint roadmap. No grades or ranks—just a clear engineering path forward.
            </p>
          </div>

          <div className="bg-white border border-zinc-200 p-6 rounded-3xl text-left space-y-4 shadow-xl shadow-zinc-200/40">
            <h4 className="font-mono text-xs font-bold text-teal-800 uppercase tracking-wider">
              Summary:
            </h4>
            <ul className="space-y-2.5 text-xs font-sans text-zinc-800">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-teal-700 shrink-0" />
                <span>Strong problem discovery &amp; product architecture fundamentals.</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-teal-700 shrink-0" />
                <span>Ready to start Sprint 1: Problem Discovery.</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-teal-700 shrink-0" />
                <span>Position: <strong className="text-zinc-900 font-bold">Founding Engineer Candidate</strong>.</span>
              </li>
            </ul>
          </div>

          <button
            onClick={() => onNext({ problemSolving: 85, debugging: 80, frontend: 82, backend: 85, databases: 78, apiDesign: 88, systemThinking: 84, communication: 90 })}
            className="group inline-flex h-12 items-center justify-center gap-2 rounded-full bg-teal-700 hover:bg-teal-800 px-8 text-sm font-bold text-white transition-all cursor-pointer border-none font-sans shadow-md shadow-teal-700/20"
          >
            <span>Build Your Journey</span>
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </button>
        </div>
      )}
    </motion.div>
  );
}
