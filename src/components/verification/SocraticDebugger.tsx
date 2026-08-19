"use client";

import React, { useState } from "react";
import { ArrowRight, CheckCircle2, XCircle, Bot, Terminal, RefreshCw, Send, Sparkles } from "lucide-react";

interface TestItem {
  name: string;
  passed: boolean;
  message?: string;
}

interface SocraticDebuggerProps {
  onCompleteVerification: () => void;
}

export default function SocraticDebugger({ onCompleteVerification }: SocraticDebuggerProps) {
  const [isRunning, setIsRunning] = useState(true);
  const [testsPassed, setTestsPassed] = useState(false);
  const [studentDebugInput, setStudentDebugInput] = useState("");
  const [chatMessages, setChatMessages] = useState<Array<{ sender: "coach" | "student"; text: string }>>([]);

  const initialTests: TestItem[] = [
    { name: "Syntax Validation", passed: true },
    { name: "Unit Test: Redis Connection Initialization", passed: true },
    { name: "Integration: HTTP 429 Throttle Headers", passed: true },
    { name: "10,000 req/s Concurrency Stress Test", passed: false, message: "Race Condition: 2 requests read tokens=1 simultaneously before decrementing." },
  ];

  // Run test suite animation on mount
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setIsRunning(false);
      setChatMessages([
        {
          sender: "coach",
          text: "I noticed your implementation works great under normal traffic! However, when 10,000 requests arrive simultaneously, multiple requests read the same value before it changes. Let's investigate why: What do you think caused this race condition?",
        },
      ]);
    }, 1200);
    return () => clearTimeout(timer);
  }, []);

  const handleSendDebugAnswer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentDebugInput.trim()) return;

    const userText = studentDebugInput.trim();
    setStudentDebugInput("");

    setChatMessages((prev) => [
      ...prev,
      { sender: "student", text: userText },
    ]);

    setTimeout(() => {
      setChatMessages((prev) => [
        ...prev,
        {
          sender: "coach",
          text: "Spot on reasoning! Because non-atomic GET and DECR steps allow simultaneous requests to interleave. Using an atomic Redis Lua script guarantees sub-2ms isolation! I have updated your test status to PASSED.",
        },
      ]);
      setTestsPassed(true);
    }, 800);
  };

  return (
    <div className="space-y-6 font-sans animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
        <div className="flex items-center gap-2">
          <Terminal className="h-5 w-5 text-amber-400" />
          <h3 className="font-display text-lg font-bold text-zinc-100">
            Stage 7: Automated Test Suite &amp; Socratic Debugging
          </h3>
        </div>
        <span className="font-mono text-xs text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded border border-amber-500/20">
          Jest Verification
        </span>
      </div>

      {/* Test Runner Execution Card */}
      <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6 space-y-4 shadow-2xl font-mono text-xs">
        <div className="flex items-center justify-between text-zinc-400 border-b border-zinc-900 pb-2">
          <span>$ npx jest --suite=mission_rate_limiter</span>
          {isRunning && <span className="text-amber-400 animate-pulse">Running...</span>}
        </div>

        <div className="space-y-2">
          {initialTests.map((t, i) => {
            const isPassed = isRunning ? false : testsPassed ? true : t.passed;
            return (
              <div key={i} className="flex items-center justify-between p-2.5 rounded-lg bg-zinc-900/60 border border-zinc-850">
                <div className="flex items-center gap-2.5">
                  {isRunning ? (
                    <RefreshCw className="h-4 w-4 text-amber-400 animate-spin" />
                  ) : isPassed ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-400" />
                  )}
                  <span className={isPassed ? "text-zinc-200" : "text-red-300 font-bold"}>
                    {t.name}
                  </span>
                </div>

                <span className={isPassed ? "text-emerald-400" : "text-red-400"}>
                  {isRunning ? "Testing" : isPassed ? "PASSED" : "FAILED"}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Socratic Debugging Chat Session */}
      {!isRunning && (
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-6 space-y-4 shadow-xl backdrop-blur-xl animate-in fade-in">
          <div className="flex items-center gap-2 border-b border-zinc-800 pb-3">
            <Bot className="h-5 w-5 text-amber-400" />
            <h4 className="font-display text-base font-bold text-zinc-100">
              Socratic Senior AI Debugging Session
            </h4>
          </div>

          <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
            {chatMessages.map((msg, idx) => (
              <div
                key={idx}
                className={`p-3.5 rounded-xl border text-xs font-sans leading-relaxed ${
                  msg.sender === "coach"
                    ? "bg-zinc-950 border-amber-500/30 text-amber-200"
                    : "bg-amber-500/10 border-amber-500/30 text-zinc-100 ml-6 font-mono"
                }`}
              >
                <span className="font-mono text-[10px] uppercase font-bold block mb-1 text-zinc-400">
                  {msg.sender === "coach" ? "Senior AI Mentor" : "Your Reasoning Input"}
                </span>
                {msg.text}
              </div>
            ))}
          </div>

          {/* Input field for student reasoning during debugging */}
          {!testsPassed ? (
            <form onSubmit={handleSendDebugAnswer} className="flex gap-2 pt-2">
              <input
                type="text"
                placeholder="What do you think caused this race condition? Explain your hypothesis..."
                value={studentDebugInput}
                onChange={(e) => setStudentDebugInput(e.target.value)}
                className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-zinc-100 font-sans focus:border-amber-500 outline-none"
              />
              <button
                type="submit"
                className="h-10 px-5 rounded-xl bg-amber-500 text-zinc-950 font-bold text-xs hover:bg-amber-400 cursor-pointer border-none shrink-0"
              >
                Submit Hypothesis
              </button>
            </form>
          ) : (
            <div className="pt-2">
              <button
                onClick={onCompleteVerification}
                className="group relative inline-flex h-12 w-full items-center justify-center gap-3 rounded-xl bg-emerald-500 text-sm font-bold text-zinc-950 transition-all hover:bg-emerald-400 active:scale-98 cursor-pointer border-none shadow-lg shadow-emerald-500/20"
              >
                <span>Complete Step &amp; Save Proof of Work →</span>
              </button>
            </div>
          )}
        </div>
      )}

    </div>
  );
}
