"use client";

import React, { useState } from "react";
import {
  Target,
  Clock,
  ArrowRight,
  Sparkles,
  HelpCircle,
  MessageSquare,
  Check,
  Send,
} from "lucide-react";
import { motion } from "framer-motion";

interface SprintCurrentTaskSectionProps {
  onStartBuilding: () => void;
  onOpenHelpDrawer: () => void;
}

export default function SprintCurrentTaskSection({
  onStartBuilding,
  onOpenHelpDrawer,
}: SprintCurrentTaskSectionProps) {
  const [acceptanceCriteria, setAcceptanceCriteria] = useState([
    { id: 1, label: "User flow completed", checked: true },
    { id: 2, label: "System diagram created", checked: false },
    { id: 3, label: "Database schema defined", checked: false },
    { id: 4, label: "API endpoints planned", checked: false },
  ]);

  const [comments, setComments] = useState([
    {
      id: 1,
      author: "Rahul M.",
      rank: "Associate Engineer",
      text: "Should we use PostgreSQL UUID v4 or auto-incrementing serial for user IDs?",
      timestamp: "2h ago",
    },
    {
      id: 2,
      author: "Nova (Senior Mentor)",
      rank: "Senior Staff Engineer",
      text: "UUID v4 is recommended for distributed systems to prevent ID enumeration attacks.",
      timestamp: "1h ago",
    },
  ]);
  const [newComment, setNewComment] = useState("");

  const toggleCriterion = (id: number) => {
    setAcceptanceCriteria((prev) =>
      prev.map((c) => (c.id === id ? { ...c, checked: !c.checked } : c))
    );
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    setComments((prev) => [
      ...prev,
      {
        id: Date.now(),
        author: "Sai (You)",
        rank: "Associate Product Engineer",
        text: newComment,
        timestamp: "Just now",
      },
    ]);
    setNewComment("");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6 max-w-4xl mx-auto py-4 font-sans text-left"
    >
      {/* Task Header */}
      <div className="rounded-3xl border border-teal-200/80 bg-white p-6 sm:p-8 space-y-6 shadow-xl shadow-zinc-200/40 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-100 pb-4">
          <div className="flex items-center gap-2 font-mono text-xs">
            <span className="bg-teal-50 border border-teal-200 text-teal-800 font-bold px-3 py-1 rounded-full flex items-center gap-1.5">
              <Target className="h-3.5 w-3.5 text-teal-700" />
              Task 2 of 4 • In Progress
            </span>
            <span className="text-zinc-500">Difficulty: <strong className="text-teal-800">Intermediate</strong></span>
          </div>

          <div className="flex items-center gap-2 font-mono text-xs text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 font-semibold">
            <Clock className="h-3.5 w-3.5 text-emerald-700" />
            <span>Est. Time: 45 Minutes</span>
          </div>
        </div>

        {/* Task Title & Brief */}
        <div className="space-y-3">
          <h1 className="font-serif text-2xl sm:text-4xl font-bold text-zinc-900 tracking-tight">
            Design System Architecture &amp; Database Schemas
          </h1>
          <p className="text-sm sm:text-base text-zinc-700 font-sans leading-relaxed bg-zinc-50 border border-zinc-200 p-4 rounded-2xl">
            <strong className="text-teal-800 block font-mono text-xs uppercase mb-1 font-bold">TASK BRIEF</strong>
            Design the system architecture for MakeMistakes. Your goal is to break the platform into scalable modules, specify database schemas, and define API endpoints before writing code.
          </p>
        </div>

        {/* Why This Matters */}
        <div className="bg-teal-50/50 border border-teal-200/60 p-5 rounded-2xl space-y-2">
          <span className="font-mono text-xs font-bold text-teal-800 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-teal-700" />
            WHY THIS MATTERS
          </span>
          <p className="text-xs text-zinc-700 font-sans leading-relaxed">
            Every successful software product begins with a clear architecture. This Sprint teaches you how experienced product engineers plan systems before implementation to avoid costly technical debt.
          </p>
        </div>

        {/* Acceptance Criteria Checklist */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between border-b border-zinc-100 pb-2">
            <span className="font-mono text-xs font-bold text-zinc-900 uppercase tracking-wider">
              Acceptance Criteria Checklist
            </span>
            <span className="font-mono text-xs text-zinc-500">
              {acceptanceCriteria.filter((c) => c.checked).length} of {acceptanceCriteria.length} Completed
            </span>
          </div>

          <div className="space-y-2">
            {acceptanceCriteria.map((item) => (
              <div
                key={item.id}
                onClick={() => toggleCriterion(item.id)}
                className={`p-3.5 rounded-xl border text-xs font-sans flex items-center justify-between cursor-pointer transition-all ${
                  item.checked
                    ? "bg-emerald-50/60 border-emerald-200 text-zinc-900 font-medium"
                    : "bg-zinc-50 border-zinc-200 text-zinc-600 hover:border-zinc-300"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`h-4.5 w-4.5 rounded-md flex items-center justify-center transition-all ${
                      item.checked
                        ? "bg-emerald-700 text-white font-bold"
                        : "border border-zinc-300 bg-white"
                    }`}
                  >
                    {item.checked && <Check className="h-3 w-3 stroke-[3]" />}
                  </div>
                  <span className={item.checked ? "line-through text-zinc-500" : "text-zinc-800"}>
                    {item.label}
                  </span>
                </div>

                <span className="font-mono text-[10px] text-zinc-500 font-semibold">
                  {item.checked ? "✓ Verified" : "Pending"}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Embedded Contextual Help Trigger & Start Building Primary CTA */}
        <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-zinc-100">
          <button
            onClick={onOpenHelpDrawer}
            className="text-xs font-mono text-teal-800 hover:text-teal-900 flex items-center gap-2 bg-zinc-50 border border-zinc-200 px-4 py-2 rounded-full cursor-pointer font-medium"
          >
            <HelpCircle className="h-4 w-4 text-teal-700" />
            <span>Need Help &amp; Resources? (Architecture Guide, Templates)</span>
          </button>

          <button
            onClick={onStartBuilding}
            className="group relative inline-flex h-13 w-full sm:w-auto items-center justify-center gap-3 rounded-full bg-teal-700 hover:bg-teal-800 px-9 text-sm font-bold text-white transition-all cursor-pointer shadow-lg shadow-teal-700/20 border-none font-sans"
          >
            <span>Start Building</span>
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </button>
        </div>
      </div>

      {/* Task Discussion Thread */}
      <div className="rounded-3xl border border-zinc-200/80 bg-white p-6 space-y-4 shadow-xl shadow-zinc-200/40">
        <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
          <span className="font-mono text-xs font-bold text-teal-800 uppercase tracking-wider flex items-center gap-2">
            <MessageSquare className="h-4 w-4 text-teal-700" />
            Task 2 Discussion &amp; Engineering Q&amp;A
          </span>
          <span className="font-mono text-xs text-zinc-500">{comments.length} Comments</span>
        </div>

        <div className="space-y-3 font-sans text-xs">
          {comments.map((c) => (
            <div key={c.id} className="bg-zinc-50 p-4 rounded-2xl border border-zinc-200 space-y-1">
              <div className="flex items-center justify-between text-[11px] font-mono">
                <span className="font-bold text-zinc-900">{c.author} <span className="text-zinc-500">({c.rank})</span></span>
                <span className="text-zinc-500">{c.timestamp}</span>
              </div>
              <p className="text-zinc-700 leading-relaxed pt-0.5">{c.text}</p>
            </div>
          ))}
        </div>

        <form onSubmit={handleAddComment} className="flex items-center gap-2 pt-1">
          <input
            type="text"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Ask a question about Task 2..."
            className="flex-1 bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2.5 text-xs text-zinc-900 font-sans focus:outline-none focus:border-teal-700"
          />
          <button
            type="submit"
            className="h-10 px-5 bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs font-sans rounded-full border-none cursor-pointer flex items-center gap-1.5 shadow-sm"
          >
            <Send className="h-3.5 w-3.5" />
            <span>Reply</span>
          </button>
        </form>
      </div>
    </motion.div>
  );
}
