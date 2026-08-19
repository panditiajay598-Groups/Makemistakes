"use client";

import React, { useState } from "react";
import {
  Target,
  Clock,
  Command,
  HelpCircle,
  Edit3,
  ChevronRight,
  Send,
} from "lucide-react";

interface SprintRightSidebarProps {
  currentTaskTitle?: string;
  estimatedTime?: string;
  deadline?: string;
  progressPercent?: number;
  onOpenShortcuts?: () => void;
  onOpenHelp?: () => void;
}

export default function SprintRightSidebar({
  currentTaskTitle = "Design System Architecture",
  estimatedTime = "45 Minutes Remaining",
  deadline = "Today",
  progressPercent = 25,
  onOpenShortcuts,
  onOpenHelp,
}: SprintRightSidebarProps) {
  const [quickNote, setQuickNote] = useState("Remember to handle atomic locks in Redis Lua script for rate limiting.");
  const [noteSaved, setNoteSaved] = useState(false);
  const [mentorInput, setMentorInput] = useState("");
  const [mentorMessages, setMentorMessages] = useState<string[]>([
    "Great work validating the problem in Sprint 1. Today we're designing the architecture for Sprint 2.",
  ]);

  const handleSaveNote = () => {
    setNoteSaved(true);
    setTimeout(() => setNoteSaved(false), 1500);
  };

  const handleSendMentorMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mentorInput.trim()) return;
    const userMsg = mentorInput;
    setMentorMessages((prev) => [...prev, `You: ${userMsg}`]);
    setMentorInput("");

    setTimeout(() => {
      setMentorMessages((prev) => [
        ...prev,
        `Nova: Excellent question on ${userMsg.slice(0, 20)}... Always isolate your database schema constraints before writing API routes.`,
      ]);
    }, 1000);
  };

  return (
    <aside className="w-full lg:w-72 bg-white border-l border-zinc-200/80 p-4 space-y-5 shrink-0 overflow-y-auto select-none font-sans shadow-sm">
      {/* 1. Today's Goal Card */}
      <div className="bg-white border border-zinc-200/80 p-4 rounded-2xl space-y-2 shadow-sm">
        <div className="flex items-center justify-between">
          <span className="font-mono text-[10px] text-teal-800 font-bold uppercase tracking-wider flex items-center gap-1.5">
            <Target className="h-3.5 w-3.5 text-teal-700" /> TODAY&apos;S GOAL
          </span>
          <span className="font-mono text-[10px] text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-bold">
            +150 PTS
          </span>
        </div>

        <h4 className="font-serif text-xs font-bold text-zinc-900 leading-snug">
          {currentTaskTitle}
        </h4>

        <div className="space-y-1.5 pt-1">
          <div className="flex items-center justify-between text-[11px] font-mono text-zinc-600">
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3 text-zinc-500" /> {estimatedTime}
            </span>
            <span className="text-zinc-500">Due: <strong className="text-zinc-800">{deadline}</strong></span>
          </div>

          <div className="h-1.5 w-full bg-zinc-100 rounded-full overflow-hidden border border-zinc-200">
            <div className="h-full bg-teal-700 rounded-full" style={{ width: `${progressPercent}%` }} />
          </div>
        </div>
      </div>

      {/* 2. Engineering Mentor Nova (🟢 Online) */}
      <div className="bg-white border border-teal-200/80 p-4 rounded-2xl space-y-3 shadow-sm">
        <div className="flex items-center justify-between border-b border-zinc-100 pb-2">
          <div className="flex items-center gap-2">
            <div className="relative">
              <div className="h-7 w-7 rounded-lg bg-teal-700 text-white font-mono font-bold text-xs flex items-center justify-center">
                Nova
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full bg-emerald-500 border border-white animate-pulse" />
            </div>
            <div>
              <span className="font-serif text-xs font-bold text-zinc-900 block">Nova</span>
              <span className="font-mono text-[9px] text-teal-700 font-semibold block">🟢 ONLINE</span>
            </div>
          </div>
          <span className="font-mono text-[9px] text-teal-800 bg-teal-50 px-1.5 py-0.5 rounded border border-teal-200 font-bold">
            MENTOR
          </span>
        </div>

        <div className="bg-teal-50/50 p-3 rounded-xl border border-teal-200/60 space-y-2 max-h-36 overflow-y-auto font-sans text-xs">
          {mentorMessages.map((msg, idx) => (
            <p
              key={idx}
              className={`leading-relaxed italic ${
                msg.startsWith("You:") ? "text-zinc-600 font-mono text-[11px]" : "text-teal-950 font-medium"
              }`}
            >
              &quot;{msg}&quot;
            </p>
          ))}
        </div>

        <form onSubmit={handleSendMentorMessage} className="flex items-center gap-1.5 pt-1">
          <input
            type="text"
            value={mentorInput}
            onChange={(e) => setMentorInput(e.target.value)}
            placeholder="Ask Nova a question..."
            className="flex-1 bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-1.5 text-xs text-zinc-900 font-sans focus:outline-none focus:border-teal-700"
          />
          <button
            type="submit"
            className="h-8 w-8 rounded-xl bg-teal-700 hover:bg-teal-800 text-white flex items-center justify-center border-none cursor-pointer shadow-sm"
          >
            <Send className="h-3.5 w-3.5" />
          </button>
        </form>
      </div>

      {/* 3. Quick Notes Pad */}
      <div className="bg-white border border-zinc-200/80 p-4 rounded-2xl space-y-2 shadow-sm">
        <div className="flex items-center justify-between">
          <span className="font-mono text-[10px] text-zinc-600 font-bold uppercase tracking-wider flex items-center gap-1.5">
            <Edit3 className="h-3.5 w-3.5 text-teal-700" /> QUICK SCRATCHPAD
          </span>
          {noteSaved && <span className="font-mono text-[9px] text-emerald-700 font-semibold">Saved ✓</span>}
        </div>

        <textarea
          rows={3}
          value={quickNote}
          onChange={(e) => {
            setQuickNote(e.target.value);
            handleSaveNote();
          }}
          placeholder="Jot down notes or hypotheses..."
          className="w-full bg-zinc-50 border border-zinc-200 rounded-xl p-2.5 text-xs text-zinc-800 font-sans focus:outline-none focus:border-teal-700 resize-none"
        />
      </div>

      {/* 4. Keyboard Shortcuts & Help Buttons */}
      <div className="space-y-2 pt-1 border-t border-zinc-200/80">
        <button
          onClick={onOpenShortcuts}
          className="w-full flex items-center justify-between p-2.5 rounded-xl bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 text-xs font-mono text-zinc-700 hover:text-zinc-900 transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <Command className="h-3.5 w-3.5 text-teal-700" />
            <span>Shortcuts Reference</span>
          </div>
          <kbd className="text-[10px] bg-white px-1.5 py-0.5 rounded border border-zinc-200 text-zinc-500">
            ?
          </kbd>
        </button>

        <button
          onClick={onOpenHelp}
          className="w-full flex items-center justify-between p-2.5 rounded-xl bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 text-xs font-mono text-zinc-700 hover:text-zinc-900 transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <HelpCircle className="h-3.5 w-3.5 text-teal-700" />
            <span>Need Help?</span>
          </div>
          <ChevronRight className="h-3.5 w-3.5 text-zinc-400" />
        </button>
      </div>
    </aside>
  );
}
