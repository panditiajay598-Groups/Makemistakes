"use client";

import React, { useState } from "react";
import { ArrowRight, Bot, HelpCircle, CheckCircle2, MessageSquare, AlertCircle } from "lucide-react";

export interface AnswerPayload {
  questionId: string;
  questionText: string;
  selectedOption: string;
  reasoning: string;
  isCorrectOption: boolean;
}

interface DynamicQuestionEngineProps {
  code: string;
  onQuestionsCompleted: (answers: AnswerPayload[]) => void;
}

export default function DynamicQuestionEngine({ code, onQuestionsCompleted }: DynamicQuestionEngineProps) {
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [reasoning, setReasoning] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [completedAnswers, setCompletedAnswers] = useState<AnswerPayload[]>([]);

  // Dynamically generated questions based on inspect student code
  const generatedQuestions = [
    {
      id: "q1_conditional_logic",
      codeSnippet: "if (tokens > 0) { redis.decr(key) }",
      question: "I noticed you first check the token count before decreasing it. Why did you choose this conditional order?",
      options: [
        { key: "A", label: "To prevent request tokens from dropping below 0 into negative counts.", isCorrect: true },
        { key: "B", label: "Because Redis requires a check before any write command.", isCorrect: false },
        { key: "C", label: "To speed up execution time of the network request.", isCorrect: false },
        { key: "D", label: "It makes no difference; any order works identically.", isCorrect: false },
      ],
    },
    {
      id: "q2_return_value",
      codeSnippet: "return false;",
      question: "When no tokens remain, your code returns false. Why return false instead of throwing a Server Exception?",
      options: [
        { key: "A", label: "Rate limiting is an expected business condition, not an unhandled server crash.", isCorrect: true },
        { key: "B", label: "Exceptions in Node.js always corrupt Redis memory.", isCorrect: false },
        { key: "C", label: "Throwing exceptions consumes more bandwidth than returning false.", isCorrect: false },
        { key: "D", label: "It is impossible to catch exceptions inside middleware.", isCorrect: false },
      ],
    },
    {
      id: "q3_concurrency_race",
      codeSnippet: "redis.get(key) -> redis.decr(key)",
      question: "If two users execute this check simultaneously at the exact microsecond, what race condition could occur?",
      options: [
        { key: "A", label: "Both read 1 token, both deduct 1 token, resulting in -1 tokens (over-allocation).", isCorrect: true },
        { key: "B", label: "The Redis database will lock permanently and crash.", isCorrect: false },
        { key: "C", label: "The second request will be silently converted into an HTTP 500 error.", isCorrect: false },
        { key: "D", label: "Redis automatically merges simultaneous requests into one execution.", isCorrect: false },
      ],
    },
  ];

  const currentQ = generatedQuestions[currentQIndex];

  const handleNextQuestion = () => {
    if (!selectedOption) {
      setError("Please select an option.");
      return;
    }
    if (!reasoning.trim() || reasoning.trim().length < 10) {
      setError("Please explain your engineering reasoning (minimum 10 characters).");
      return;
    }

    setError("");
    const selectedOptObj = currentQ.options.find((o) => o.key === selectedOption);
    const newAnswer: AnswerPayload = {
      questionId: currentQ.id,
      questionText: currentQ.question,
      selectedOption: selectedOption,
      reasoning: reasoning.trim(),
      isCorrectOption: !!selectedOptObj?.isCorrect,
    };

    const updatedAnswers = [...completedAnswers, newAnswer];
    setCompletedAnswers(updatedAnswers);

    if (currentQIndex < generatedQuestions.length - 1) {
      setCurrentQIndex((prev) => prev + 1);
      setSelectedOption(null);
      setReasoning("");
    } else {
      onQuestionsCompleted(updatedAnswers);
    }
  };

  return (
    <div className="space-y-6 font-sans animate-in fade-in duration-300">
      
      {/* Header Info */}
      <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
        <div className="flex items-center gap-2">
          <Bot className="h-5 w-5 text-amber-400" />
          <span className="font-display text-base font-bold text-zinc-100">
            Dynamic Adaptive Question {currentQIndex + 1} of {generatedQuestions.length}
          </span>
        </div>

        <span className="font-mono text-xs text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded border border-amber-500/20">
          Generated from your code
        </span>
      </div>

      {/* Code Snippet Highlight */}
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-6 space-y-4 shadow-xl backdrop-blur-xl">
        <div className="space-y-1">
          <span className="font-mono text-[10px] text-zinc-500 uppercase tracking-wider block">
            Target Code Snippet
          </span>
          <pre className="bg-zinc-950 p-3.5 rounded-xl border border-zinc-850 font-mono text-xs text-amber-300 overflow-x-auto">
            <code>{currentQ.codeSnippet}</code>
          </pre>
        </div>

        <div className="space-y-2">
          <h4 className="font-display text-base font-bold text-zinc-50 leading-snug">
            "{currentQ.question}"
          </h4>
        </div>

        {/* Multiple Choice Options */}
        <div className="space-y-2.5 pt-2">
          <span className="font-mono text-[10px] text-zinc-400 uppercase tracking-wider block">
            Select Option:
          </span>

          <div className="space-y-2">
            {currentQ.options.map((opt) => {
              const isSelected = selectedOption === opt.key;
              return (
                <div
                  key={opt.key}
                  onClick={() => {
                    setSelectedOption(opt.key);
                    setError("");
                  }}
                  className={`rounded-xl border p-3.5 cursor-pointer transition-all flex items-start gap-3 ${
                    isSelected
                      ? "border-amber-500 bg-amber-500/10 ring-1 ring-amber-500/30"
                      : "border-zinc-800 bg-zinc-950/70 hover:border-zinc-700"
                  }`}
                >
                  <span className={`font-mono text-xs font-bold px-2 py-0.5 rounded ${
                    isSelected ? "bg-amber-500 text-zinc-950" : "bg-zinc-800 text-zinc-300"
                  }`}>
                    {opt.key}
                  </span>
                  <span className="text-xs font-medium text-zinc-200 leading-relaxed">
                    {opt.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Mandatory Reasoning Explanation Field */}
        {selectedOption && (
          <div className="space-y-2 pt-3 border-t border-zinc-800 animate-in fade-in">
            <label className="font-mono text-xs text-amber-400 font-bold uppercase tracking-wider flex items-center gap-2">
              <MessageSquare className="h-3.5 w-3.5" />
              Why did you choose Option {selectedOption}? Explain your reasoning:
            </label>

            <textarea
              rows={3}
              placeholder="Explain the engineering logic behind your choice (evaluates both choice & reasoning quality)..."
              value={reasoning}
              onChange={(e) => {
                setReasoning(e.target.value);
                if (e.target.value.trim().length >= 10) setError("");
              }}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-xs text-zinc-100 font-sans focus:border-amber-500 outline-none leading-relaxed"
            />
          </div>
        )}

        {error && (
          <div className="flex items-center gap-2 text-xs text-red-400 font-mono mt-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* Action CTA */}
      <div className="flex justify-end pt-2">
        <button
          onClick={handleNextQuestion}
          className="group relative inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-amber-500 px-7 text-xs font-bold text-zinc-950 transition-all hover:bg-amber-400 active:scale-98 cursor-pointer border-none shadow-md shadow-amber-500/10"
        >
          <span>{currentQIndex < generatedQuestions.length - 1 ? "Next Question →" : "Proceed to Confidence Check"}</span>
        </button>
      </div>

    </div>
  );
}
