"use client";

import React, { useState } from "react";
import { MessageSquare, ThumbsUp, CheckCircle2, Send, Plus, Pin, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { DiscussionThread } from "./types";

export default function SprintDiscussionSection() {
  const [threads, setThreads] = useState<DiscussionThread[]>([
    {
      id: "disc-1",
      title: "Sprint Announcement: Sprint 2 Architecture Checklist released",
      author: "Nova (Senior Mentor)",
      authorRank: "Senior Staff Engineer",
      avatar: "N",
      timestamp: "2h ago",
      category: "Announcement",
      repliesCount: 8,
      isHelpful: true,
      content:
        "Welcome to Sprint 2! Make sure to isolate your PostgreSQL schema definitions before configuring the Redis Lua rate limiting script.",
    },
    {
      id: "disc-2",
      title: "How do you handle Redis connection retry backoff during network partition?",
      author: "Rahul M.",
      authorRank: "Associate Product Engineer",
      avatar: "R",
      timestamp: "4h ago",
      category: "Question",
      repliesCount: 5,
      isHelpful: true,
      content:
        "When ioredis drops connection during high concurrency tests, should we fall back to allowed HTTP 200 or block requests with 503?",
    },
    {
      id: "disc-3",
      title: "Idea: Adding a token refill rate calculator widget to BuildOS",
      author: "Priya S.",
      authorRank: "Product Engineer",
      avatar: "P",
      timestamp: "1d ago",
      category: "Idea",
      repliesCount: 3,
      isHelpful: false,
      content:
        "Having a live calculator for Token Bucket refill rates based on windowMs and limit would make designing limits much faster.",
    },
  ]);

  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [showNewThreadForm, setShowNewThreadForm] = useState(false);

  const handleCreateThread = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;

    const created: DiscussionThread = {
      id: `disc-${Date.now()}`,
      title: newTitle,
      author: "Sai (You)",
      authorRank: "Associate Product Engineer",
      avatar: "S",
      timestamp: "Just now",
      category: "Question",
      repliesCount: 0,
      isHelpful: false,
      content: newContent,
    };

    setThreads([created, ...threads]);
    setNewTitle("");
    setNewContent("");
    setShowNewThreadForm(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6 max-w-4xl mx-auto py-4 font-sans text-left"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-3">
        <div>
          <h2 className="font-display text-2xl font-bold text-zinc-100 flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-amber-400" />
            Sprint 2 Engineering Discussions
          </h2>
          <p className="text-xs text-zinc-400 font-sans">
            GitHub Discussions style thread board scoped to Sprint 2.
          </p>
        </div>

        <button
          onClick={() => setShowNewThreadForm(!showNewThreadForm)}
          className="h-10 px-4 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs font-mono rounded-xl transition-all cursor-pointer border-none flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          <span>New Discussion</span>
        </button>
      </div>

      {/* New Discussion Form */}
      {showNewThreadForm && (
        <form onSubmit={handleCreateThread} className="bg-zinc-900/80 border border-amber-500/30 p-5 rounded-2xl space-y-3">
          <span className="font-mono text-xs font-bold text-amber-400 block uppercase">Start a Discussion</span>
          <input
            type="text"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="Discussion title..."
            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-xs text-zinc-100 font-sans focus:outline-none focus:border-amber-500"
          />
          <textarea
            rows={3}
            value={newContent}
            onChange={(e) => setNewContent(e.target.value)}
            placeholder="Details or questions..."
            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-xs text-zinc-100 font-sans focus:outline-none focus:border-amber-500 resize-none"
          />
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowNewThreadForm(false)}
              className="px-4 py-2 bg-zinc-950 text-zinc-400 text-xs rounded-xl border border-zinc-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-amber-500 text-zinc-950 font-bold text-xs rounded-xl border-none cursor-pointer"
            >
              Post Discussion
            </button>
          </div>
        </form>
      )}

      {/* Discussions Threads List */}
      <div className="space-y-3">
        {threads.map((t) => (
          <div
            key={t.id}
            className="p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-3 hover:border-zinc-700 transition-colors"
          >
            <div className="flex items-center justify-between border-b border-zinc-800/80 pb-2">
              <div className="flex items-center gap-2.5">
                <div className="h-7 w-7 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center font-mono font-bold text-amber-400 text-xs">
                  {t.avatar}
                </div>
                <div>
                  <span className="font-display text-xs font-bold text-zinc-100 block">{t.author}</span>
                  <span className="font-mono text-[9px] text-zinc-500 block">{t.authorRank}</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span
                  className={`font-mono text-[9px] px-2 py-0.5 rounded border font-bold ${
                    t.category === "Announcement"
                      ? "bg-purple-500/20 text-purple-400 border-purple-500/30"
                      : t.category === "Question"
                      ? "bg-amber-500/20 text-amber-400 border-amber-500/30"
                      : "bg-blue-500/20 text-blue-400 border-blue-500/30"
                  }`}
                >
                  {t.category}
                </span>
                <span className="font-mono text-[10px] text-zinc-500">{t.timestamp}</span>
              </div>
            </div>

            <h3 className="font-display text-sm font-bold text-zinc-100">{t.title}</h3>
            <p className="text-xs text-zinc-300 font-sans leading-relaxed">{t.content}</p>

            <div className="flex items-center justify-between pt-2 border-t border-zinc-800/60 font-mono text-xs text-zinc-400">
              <div className="flex items-center gap-3">
                <button className="flex items-center gap-1 hover:text-amber-400 bg-transparent border-none cursor-pointer p-0 text-zinc-400">
                  <ThumbsUp className="h-3.5 w-3.5" />
                  <span>Helpful</span>
                </button>
                <span>{t.repliesCount} replies</span>
              </div>

              {t.isHelpful && (
                <span className="text-[10px] text-emerald-400 flex items-center gap-1 font-bold">
                  <CheckCircle2 className="h-3 w-3" /> Answered
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
