"use client";

import React, { useState, useEffect } from "react";
import { ArrowRight, Lock, EyeOff, ShieldAlert, AlertCircle, RefreshCw } from "lucide-react";

export interface TabSwitchLog {
  switchCount: number;
  timeAwaySeconds: number;
  reasons: string[];
}

interface AssessmentModeContainerProps {
  onBeginQuestions: () => void;
  onLogSwitch: (log: TabSwitchLog) => void;
  children?: React.ReactNode;
}

export default function AssessmentModeContainer({
  onBeginQuestions,
  onLogSwitch,
  children,
}: AssessmentModeContainerProps) {
  const [isStarted, setIsStarted] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [switchReason, setSwitchReason] = useState("Needed documentation");
  const [customReason, setCustomReason] = useState("");
  const [switchCount, setSwitchCount] = useState(0);
  const [totalTimeAway, setTotalTimeAway] = useState(0);
  const [awayStartTime, setAwayStartTime] = useState<number | null>(null);

  // Security Guards: Disable copy, paste, right click, & shortcuts during assessment
  useEffect(() => {
    if (!isStarted) return;

    const handleCopy = (e: ClipboardEvent) => {
      e.preventDefault();
    };
    const handlePaste = (e: ClipboardEvent) => {
      e.preventDefault();
    };
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      // Disable F12, Ctrl+Shift+I, Ctrl+Shift+C, Ctrl+U, Ctrl+S, Ctrl+P
      if (
        e.key === "F12" ||
        (e.ctrlKey && e.shiftKey && ["I", "C", "J"].includes(e.key.toUpperCase())) ||
        (e.ctrlKey && ["U", "S", "P"].includes(e.key.toUpperCase()))
      ) {
        e.preventDefault();
      }
    };

    document.addEventListener("copy", handleCopy);
    document.addEventListener("paste", handlePaste);
    document.addEventListener("contextmenu", handleContextMenu);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("copy", handleCopy);
      document.removeEventListener("paste", handlePaste);
      document.removeEventListener("contextmenu", handleContextMenu);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isStarted]);

  // Tab Switch / Visibility Change Listener
  useEffect(() => {
    if (!isStarted) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        setIsPaused(true);
        setAwayStartTime(Date.now());
        setSwitchCount((prev) => prev + 1);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [isStarted]);

  const handleResume = () => {
    let duration = 0;
    if (awayStartTime) {
      duration = Math.round((Date.now() - awayStartTime) / 1000);
      setTotalTimeAway((prev) => prev + duration);
    }

    const finalReason = switchReason === "Other" ? customReason || "Other" : switchReason;

    onLogSwitch({
      switchCount: switchCount,
      timeAwaySeconds: totalTimeAway + duration,
      reasons: [finalReason],
    });

    setIsPaused(false);
    setAwayStartTime(null);
  };

  const handleStart = () => {
    setIsStarted(true);
    onBeginQuestions();
  };

  return (
    <div className="relative space-y-6 font-sans">
      
      {/* Tab Switch Pause Modal */}
      {isPaused && (
        <div className="fixed inset-0 z-50 bg-zinc-950/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-lg p-6 space-y-5 shadow-2xl">
            <div className="flex items-center gap-3 border-b border-zinc-800 pb-3">
              <div className="h-10 w-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <ShieldAlert className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-display text-lg font-bold text-zinc-100">
                  Assessment Paused
                </h3>
                <p className="text-xs text-zinc-400 font-mono">
                  We noticed that you left the assessment.
                </p>
              </div>
            </div>

            <div className="space-y-3 text-xs text-zinc-300 font-sans">
              <span className="font-bold text-zinc-200 block">Why did you leave?</span>

              <div className="space-y-2">
                {[
                  "Needed documentation",
                  "Internet issue",
                  "Accidentally switched",
                  "Needed to check something",
                  "Other",
                ].map((opt) => (
                  <label
                    key={opt}
                    className="flex items-center gap-2.5 p-2.5 rounded-xl bg-zinc-950 border border-zinc-800 cursor-pointer hover:border-zinc-700"
                  >
                    <input
                      type="radio"
                      name="switchReason"
                      value={opt}
                      checked={switchReason === opt}
                      onChange={(e) => setSwitchReason(e.target.value)}
                      className="accent-amber-500"
                    />
                    <span className="text-zinc-200">{opt}</span>
                  </label>
                ))}
              </div>

              {switchReason === "Other" && (
                <input
                  type="text"
                  placeholder="Please specify reason..."
                  value={customReason}
                  onChange={(e) => setCustomReason(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-100 focus:border-amber-500 outline-none"
                />
              )}
            </div>

            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[11px] font-mono text-amber-300">
              ℹ️ MakeMistakes uses transparency over punishment. Your reason and duration away will be logged in your Proof-of-Work record.
            </div>

            <button
              onClick={handleResume}
              className="w-full h-11 bg-amber-500 text-zinc-950 font-bold text-xs rounded-xl hover:bg-amber-400 transition-colors cursor-pointer border-none"
            >
              Resume Assessment
            </button>
          </div>
        </div>
      )}

      {/* Screen 2: Pre-Assessment Activation Banner */}
      {!isStarted && (
        <div className="space-y-6 text-center max-w-xl mx-auto animate-in fade-in slide-in-from-bottom-3 duration-300">
          <div className="rounded-2xl border border-amber-500/40 bg-zinc-900/80 p-8 space-y-5 shadow-2xl backdrop-blur-xl">
            <div className="h-14 w-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mx-auto">
              <EyeOff className="h-7 w-7 animate-pulse" />
            </div>

            <div className="space-y-2">
              <span className="font-mono text-xs text-amber-400 font-bold uppercase tracking-wider block">
                Stage 2: Assessment Mode Enabled
              </span>
              <h3 className="font-display text-2xl font-bold text-zinc-50">
                Your implementation has been hidden.
              </h3>
            </div>

            <p className="text-xs sm:text-sm text-zinc-300 font-sans leading-relaxed bg-zinc-950 p-4 rounded-xl border border-zinc-800">
              Now let's verify that you truly understand what you built. Professional engineers should be able to explain their own code without reading it line by line.
            </p>

            <button
              onClick={handleStart}
              className="group relative inline-flex h-12 w-full items-center justify-center gap-3 rounded-xl bg-amber-500 text-sm font-bold text-zinc-950 transition-all hover:bg-amber-400 active:scale-98 cursor-pointer border-none shadow-lg shadow-amber-500/20"
            >
              <span>Begin Questions</span>
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </button>
          </div>
        </div>
      )}

      {/* When started, render child question components */}
      {isStarted && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="flex items-center justify-between text-xs font-mono bg-zinc-950 p-3 rounded-xl border border-zinc-800 text-zinc-400">
            <span className="flex items-center gap-2 text-amber-400 font-bold">
              <Lock className="h-3.5 w-3.5" /> Assessment Mode Active (Code Hidden)
            </span>
            {switchCount > 0 && (
              <span className="text-zinc-500">
                Switches: {switchCount} ({totalTimeAway}s away)
              </span>
            )}
          </div>

          {children}
        </div>
      )}

    </div>
  );
}
