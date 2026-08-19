"use client";

import React, { useState } from "react";
import { BookOpen, Search, ExternalLink, FileText, Code2, Layers, Bookmark } from "lucide-react";
import { motion } from "framer-motion";
import { ResourceItem } from "./types";

export default function SprintResourcesSection() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  const resources: ResourceItem[] = [
    {
      id: "res-1",
      title: "PostgreSQL Database Schema Normalization & Indexing Guide",
      category: "Architecture",
      readTime: "8 min read",
      description: "Best practices for primary keys, foreign key constraints, and multi-column B-Tree indexes.",
      link: "#",
    },
    {
      id: "res-2",
      title: "Redis Atomic Token Bucket Rate Limiter Template",
      category: "Templates",
      readTime: "5 min read",
      description: "Lua script for single-pass evaluation of client rate limits under high concurrency.",
      link: "#",
    },
    {
      id: "res-3",
      title: "Next.js 14 App Router API Routes & Middleware Spec",
      category: "Documentation",
      readTime: "10 min read",
      description: "How to implement edge middleware, request throttling, and custom headers.",
      link: "#",
    },
    {
      id: "res-4",
      title: "System Topology & Component Diagram Cheat Sheet",
      category: "Cheat Sheets",
      readTime: "4 min read",
      description: "Standard Mermaid & C4 model architecture diagram visual reference.",
      link: "#",
    },
    {
      id: "res-5",
      title: "Example Sprint 2 Reference Architecture",
      category: "Examples",
      readTime: "12 min read",
      description: "Complete reference design document for high-scale multi-tenant SaaS products.",
      link: "#",
    },
  ];

  const categories = ["All", "Architecture", "Documentation", "Templates", "Cheat Sheets", "Examples"];

  const filteredResources = resources.filter((res) => {
    const matchesSearch =
      res.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      res.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = selectedCategory === "All" || res.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

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
            <BookOpen className="h-5 w-5 text-amber-400" />
            Engineering Resources &amp; Guides
          </h2>
          <p className="text-xs text-zinc-400 font-sans">
            Reference materials, architecture templates, and cheat sheets for Sprint 2.
          </p>
        </div>

        {/* Search Input */}
        <div className="relative">
          <Search className="h-3.5 w-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search docs &amp; templates..."
            className="w-full sm:w-64 bg-zinc-950 border border-zinc-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-zinc-100 font-sans focus:outline-none focus:border-amber-500"
          />
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 font-mono text-xs">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1 rounded-full cursor-pointer transition-all border ${
              selectedCategory === cat
                ? "bg-amber-500/10 text-amber-400 border-amber-500/30 font-bold"
                : "bg-zinc-950 text-zinc-500 border-zinc-800 hover:text-zinc-300"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Resources List */}
      <div className="space-y-3">
        {filteredResources.map((res) => (
          <div
            key={res.id}
            className="p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800 hover:border-zinc-700 transition-colors space-y-2 group"
          >
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10px] text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 font-bold">
                {res.category}
              </span>
              <span className="font-mono text-xs text-zinc-500">{res.readTime}</span>
            </div>

            <h3 className="font-display text-sm font-bold text-zinc-100 group-hover:text-amber-400 transition-colors flex items-center gap-2">
              {res.title}
              <ExternalLink className="h-3.5 w-3.5 text-zinc-500 group-hover:text-amber-400" />
            </h3>

            <p className="text-xs text-zinc-400 font-sans leading-relaxed">
              {res.description}
            </p>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
