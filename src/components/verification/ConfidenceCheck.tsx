"use client";

import React, { useState } from "react";
import { ArrowRight, Gauge, CheckCircle2, AlertCircle, HelpCircle } from "lucide-react";

export interface ConfidencePayload {
  level: "100%" | "Mostly confident" | "Unsure" | "Probably fails";
  reason: string;
}

interface ConfidenceCheckProps {
  onConfidenceSubmitted: (payload: ConfidencePayload) => void;
}

export default function ConfidenceCheck({ onConfidenceSubmitted }: ConfidenceCheckProps) {
  const [level, setLevel] = useState<"100%" | "Mostly confident" | "Unsure" | "Probably fails">("Mostly confident");
  const [reason, setReason] = useState<string>("");
  const [error, setError] = useState<string>("");

  const options: Array<"100%" | "Mostly confident" | "Unsure" | "Probably fails"> = [
    "100%",
    "Mostly confident",
    "Unsure",
    "Probably fails",
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim() || reason.trim().length < 8) {
      setError("Please briefly explain why you feel this confidence level (minimum 8 characters).");
      return;
    }
    setError("");
    onConfidenceSubmitted({ level, reason: reason.trim() });
  };

  return (
    <div className="space-y-6 font-sans animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
        <div className="flex items-center gap-2">
          <Gauge className="h-5 w-5 text-amber-400" />
          <h3 className="font-display text-lg font-bold text-zinc-100">
            Stage 5: Engineering Confidence Check
          </h3>
        </div>
        <span className="font-mono text-xs text-zinc-400 bg-zinc-950 px-2.5 py-1 rounded border border-zinc-800">
          Judgment Calibration
        </span>
      </div>

      <p className="text-xs text-zinc-300 font-sans leading-relaxed bg-zinc-950 p-4 rounded-xl border border-zinc-850">
        Before running automated tests, professional engineers evaluate their confidence to calibrate self-assessment vs. reality.
      </p>

      {/* Main Form Card */}
      <form onSubmit={handleSubmit} className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-6 space-y-5 shadow-xl backdrop-blur-xl">
        <div className="space-y-2">
          <label className="font-display text-base font-bold text-zinc-50 block">
            How confident are you that this implementation will pass automated tests?
          </label>
        </div>

        {/* 4 Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {options.map((opt) => {
            const isSelected = level === opt;
            return (
              <div
                key={opt}
                onClick={() => setLevel(opt)}
                className={`rounded-xl border p-4 cursor-pointer transition-all flex items-center justify-between ${
                  isSelected
                    ? "border-amber-500 bg-amber-500/10 ring-1 ring-amber-500/30"
                    : "border-zinc-800 bg-zinc-950/70 hover:border-zinc-700"
                }`}
              >
                <span className={`font-mono text-sm font-bold ${isSelected ? "text-amber-400" : "text-zinc-200"}`}>
                  {opt}
                </span>

                <div className={`h-5 w-5 rounded-full flex items-center justify-center border transition-colors ${
                  isSelected ? "border-amber-500 bg-amber-500 text-zinc-950" : "border-zinc-700 bg-zinc-900"
                }`}>
                  {isSelected && <CheckCircle2 className="h-3 w-3 stroke-[3]" />}
                </div>
              </div>
            );
          })}
        </div>

        {/* Text prompt: Why */}
        <div className="space-y-2 pt-2">
          <label className="font-mono text-xs text-amber-400 font-bold uppercase tracking-wider block">
            Why do you feel this level of confidence?
          </label>
          <textarea
            rows={3}
            placeholder="Explain why you expect it to pass or where edge cases might fail..."
            value={reason}
            onChange={(e) => {
              setReason(e.target.value);
              if (e.target.value.trim().length >= 8) setError("");
            }}
            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-xs text-zinc-100 font-sans focus:border-amber-500 outline-none leading-relaxed"
          />
        </div>

        {error && (
          <div className="flex items-center gap-2 text-xs text-red-400 font-mono mt-1">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="group relative inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-amber-500 px-8 text-xs font-bold text-zinc-950 transition-all hover:bg-amber-400 active:scale-98 cursor-pointer border-none shadow-md shadow-amber-500/10"
          >
            <span>Evaluate Readiness Score →</span>
          </button>
        </div>
      </form>

    </div>
  );
}
