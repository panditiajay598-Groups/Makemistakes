"use client";

import React, { useEffect, useState } from "react";
import { CheckCircle2, ArrowRight, Trophy, Sparkles, FolderCheck } from "lucide-react";

interface ProblemCompletionModalProps {
  completedProblem: {
    problemId: string;
    title: string;
  };
  nextProblem: {
    problemId: string;
    title: string;
    category?: string;
    level?: string | null;
  } | null;
  onStartNextChallenge: (nextProblemId: string) => void;
  onViewPortfolio: () => void;
  /** Seconds before auto-starting the next problem. Default 3. */
  autoStartSeconds?: number;
}

export default function ProblemCompletionModal({
  completedProblem,
  nextProblem,
  onStartNextChallenge,
  onViewPortfolio,
  autoStartSeconds = 3,
}: ProblemCompletionModalProps) {
  const isAllCompleted = !nextProblem;
  const [secondsLeft, setSecondsLeft] = useState(autoStartSeconds);

  const getProblemNumberLabel = (pid?: string) => {
    if (!pid) return "Problem";
    const numMatch = pid.match(/\d+/);
    if (numMatch) {
      const numInt = parseInt(numMatch[0], 10);
      return `Problem ${numInt < 10 ? `0${numInt}` : numInt}`;
    }
    return pid;
  };

  // Auto-advance to next problem after a short celebration
  useEffect(() => {
    if (isAllCompleted || !nextProblem) return;

    setSecondsLeft(autoStartSeconds);
    const tick = window.setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          window.clearInterval(tick);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => window.clearInterval(tick);
  }, [isAllCompleted, nextProblem, autoStartSeconds]);

  useEffect(() => {
    if (isAllCompleted || !nextProblem) return;
    if (secondsLeft !== 0) return;
    onStartNextChallenge(nextProblem.problemId);
  }, [secondsLeft, isAllCompleted, nextProblem, onStartNextChallenge]);

  return (
    <div className="fixed inset-0 z-50 bg-zinc-950/70 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 overflow-y-auto animate-in fade-in duration-300">
      <div className="w-full max-w-lg bg-white rounded-3xl border border-zinc-200 shadow-2xl overflow-hidden text-zinc-900 my-auto">
        <div className="h-2.5 bg-gradient-to-r from-teal-600 via-emerald-500 to-teal-700 w-full" />

        <div className="p-8 sm:p-10 text-center flex flex-col items-center justify-center space-y-5">
          <div className="relative">
            <div className="h-20 w-20 rounded-full bg-emerald-50 border-2 border-emerald-200 flex items-center justify-center text-emerald-600 shadow-inner">
              <CheckCircle2 className="h-10 w-10 text-emerald-600 stroke-[2.5]" />
            </div>
            <div className="absolute -top-1 -right-1 bg-amber-400 text-amber-950 p-1.5 rounded-full shadow-sm">
              <Sparkles className="h-4 w-4 fill-amber-950" />
            </div>
          </div>

          <span className="inline-flex items-center gap-1.5 text-xs font-mono font-bold tracking-widest text-emerald-800 bg-emerald-100/70 border border-emerald-200 px-3.5 py-1 rounded-full uppercase">
            {isAllCompleted ? "ALL CHALLENGES COMPLETED" : "PROBLEM COMPLETED"}
          </span>

          <div className="space-y-2 w-full">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 tracking-tight">
              {isAllCompleted ? "Outstanding Work!" : "Great work!"}
            </h2>
            <div className="w-full bg-zinc-50 border border-zinc-200/80 rounded-2xl p-4 text-center space-y-1">
              <span className="text-[10px] font-mono font-semibold text-zinc-400 uppercase tracking-wider block">
                {getProblemNumberLabel(completedProblem.problemId)}
              </span>
              <h3 className="text-sm sm:text-base font-bold text-zinc-900 leading-snug">
                {completedProblem.title}
              </h3>
            </div>
          </div>

          {isAllCompleted ? (
            <>
              <p className="text-xs sm:text-sm text-zinc-500 max-w-sm mx-auto leading-relaxed">
                You have completed every available product challenge in the MakeMistakes Problem Library.
              </p>
              <button
                type="button"
                onClick={onViewPortfolio}
                className="w-full py-3.5 px-6 rounded-2xl bg-teal-800 hover:bg-teal-700 text-white font-bold text-sm transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer"
              >
                <FolderCheck className="h-4 w-4" />
                <span>View Portfolio</span>
              </button>
            </>
          ) : (
            <>
              <div className="w-full rounded-2xl border border-teal-100 bg-gradient-to-b from-teal-50/80 to-white p-5 space-y-3 text-left">
                <div className="flex items-center gap-2">
                  <div className="h-9 w-9 rounded-xl bg-teal-100 border border-teal-200 flex items-center justify-center text-teal-700 shrink-0">
                    <Trophy className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-[10px] font-mono font-bold tracking-widest text-teal-700 uppercase">
                      Next challenge
                    </p>
                    <p className="text-[11px] font-mono text-zinc-400">
                      {getProblemNumberLabel(nextProblem.problemId)}
                    </p>
                  </div>
                </div>
                <h3 className="text-sm sm:text-base font-extrabold text-zinc-900 leading-snug">
                  {nextProblem.title}
                </h3>
                <div className="flex flex-wrap items-center gap-2">
                  {nextProblem.level ? (
                    <span className="inline-flex text-[11px] font-mono font-bold text-teal-800 bg-teal-100/70 border border-teal-200 px-2.5 py-0.5 rounded-full uppercase">
                      {nextProblem.level}
                    </span>
                  ) : null}
                  {nextProblem.category ? (
                    <span className="text-xs text-zinc-400 font-mono">{nextProblem.category}</span>
                  ) : null}
                </div>
              </div>

              <p className="text-xs text-zinc-500 font-sans">
                Starting automatically in{" "}
                <span className="font-mono font-bold text-teal-800">{secondsLeft}s</span>
              </p>

              <button
                type="button"
                onClick={() => onStartNextChallenge(nextProblem.problemId)}
                className="w-full py-4 px-6 rounded-2xl bg-teal-800 hover:bg-teal-700 text-white font-bold text-sm sm:text-base transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.02]"
              >
                <span>Start Next Problem</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
