"use client";

import React, { useState } from "react";
import { BookOpen, Search, ExternalLink, X, FileText, Code2, Layers, Bookmark, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface SprintHelpDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SprintHelpDrawer({ isOpen, onClose }: SprintHelpDrawerProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCat, setSelectedCat] = useState("All");

  const resources = [
    {
      title: "PostgreSQL Database Schema Normalization & Indexing Guide",
      category: "Architecture",
      readTime: "8 min",
      description: "Best practices for primary keys, foreign key constraints, and B-Tree indexing.",
    },
    {
      title: "Redis Atomic Token Bucket Rate Limiter Template",
      category: "Templates",
      readTime: "5 min",
      description: "Lua script for single-pass evaluation of client rate limits under concurrency.",
    },
    {
      title: "Next.js App Router API Routes Throttling Spec",
      category: "Documentation",
      readTime: "10 min",
      description: "Implementing edge middleware, request throttling, and custom HTTP headers.",
    },
    {
      title: "System Topology Visual Reference",
      category: "Cheat Sheets",
      readTime: "4 min",
      description: "Standard C4 model architecture diagram visual cheat sheet.",
    },
  ];

  const categories = ["All", "Architecture", "Templates", "Documentation", "Cheat Sheets"];

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex justify-end bg-zinc-950/70 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, x: 300 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 300 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-md bg-zinc-900 border-l border-zinc-800 h-full p-6 space-y-5 overflow-y-auto shadow-2xl font-sans"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
            <div className="flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-amber-400" />
              <span className="font-mono text-xs font-bold text-zinc-100 uppercase tracking-wider">
                Contextual Help &amp; Resources
              </span>
            </div>
            <button
              onClick={onClose}
              className="text-zinc-400 hover:text-zinc-100 bg-transparent border-none cursor-pointer p-1"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="h-3.5 w-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search guides, docs, templates..."
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-9 pr-3 py-2 text-xs text-zinc-100 font-sans focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 font-mono text-[11px]">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCat(cat)}
                className={`px-2.5 py-1 rounded-full cursor-pointer transition-all border ${
                  selectedCat === cat
                    ? "bg-amber-500/10 text-amber-400 border-amber-500/30 font-bold"
                    : "bg-zinc-950 text-zinc-500 border-zinc-800"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Resources List */}
          <div className="space-y-3">
            {resources
              .filter(
                (r) =>
                  (selectedCat === "All" || r.category === selectedCat) &&
                  (r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    r.description.toLowerCase().includes(searchQuery.toLowerCase()))
              )
              .map((r, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 hover:border-zinc-700 transition-colors space-y-1.5 text-xs font-sans group cursor-pointer"
                >
                  <div className="flex items-center justify-between font-mono text-[10px]">
                    <span className="text-amber-400 font-bold uppercase">{r.category}</span>
                    <span className="text-zinc-500">{r.readTime}</span>
                  </div>
                  <h4 className="font-display font-bold text-zinc-100 group-hover:text-amber-400 transition-colors flex items-center justify-between">
                    <span>{r.title}</span>
                    <ExternalLink className="h-3.5 w-3.5 text-zinc-500 shrink-0" />
                  </h4>
                  <p className="text-zinc-400 text-[11px] leading-relaxed">{r.description}</p>
                </div>
              ))}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
