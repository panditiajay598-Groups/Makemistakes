"use client";

import React from "react";
import {
  Server,
  Layout,
  Bot,
  Cloud,
  Cpu,
  Shield,
  Database,
  Smartphone,
  GitBranch,
  Terminal,
} from "lucide-react";
import { Category } from "./types";

interface CategoryItem {
  name: Category;
  count: number;
  icon: React.ComponentType<any>;
  description: string;
}

interface CategoryDiscoveryGridProps {
  selectedCategory: Category;
  onSelectCategory: (category: Category) => void;
  categoryCounts: Record<string, number>;
}

export default function CategoryDiscoveryGrid({
  selectedCategory,
  onSelectCategory,
  categoryCounts,
}: CategoryDiscoveryGridProps) {
  const categories: CategoryItem[] = [
    { name: "Backend", count: categoryCounts["Backend"] || 12, icon: Server, description: "APIs, concurrency, microservices" },
    { name: "Frontend", count: categoryCounts["Frontend"] || 8, icon: Layout, description: "React, state, rendering engines" },
    { name: "AI", count: categoryCounts["AI"] || 6, icon: Bot, description: "LLM gateways, streaming, token routers" },
    { name: "DevOps", count: categoryCounts["DevOps"] || 7, icon: Terminal, description: "CI/CD, Kubernetes, rolling updates" },
    { name: "Cloud", count: categoryCounts["Cloud"] || 5, icon: Cloud, description: "AWS, serverless, edge routing" },
    { name: "System Design", count: categoryCounts["System Design"] || 9, icon: Cpu, description: "Distributed queues & load balancers" },
    { name: "Security", count: categoryCounts["Security"] || 4, icon: Shield, description: "Row locks, OAuth, encryption" },
    { name: "Database", count: categoryCounts["Database"] || 7, icon: Database, description: "SQL tuning, indexing, EXPLAIN" },
    { name: "Mobile", count: categoryCounts["Mobile"] || 3, icon: Smartphone, description: "React Native, offline sync" },
    { name: "Open Source", count: categoryCounts["Open Source"] || 5, icon: GitBranch, description: "Rust & Go OSS contributions" },
  ];

  return (
    <div className="space-y-4">
      
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <span className="font-mono text-xs text-amber-400 font-bold uppercase tracking-wider">
            EXPLORE DOMAINS
          </span>
          <h3 className="font-display text-xl font-bold text-zinc-100 tracking-tight">
            Browse by Engineering Discipline
          </h3>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 font-mono text-xs">
        {categories.map((cat) => {
          const Icon = cat.icon;
          const isSelected = selectedCategory === cat.name;

          return (
            <div
              key={cat.name}
              onClick={() => onSelectCategory(isSelected ? "All" : cat.name)}
              className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between space-y-2 select-none ${
                isSelected
                  ? "bg-amber-500/10 border-amber-500/50 text-amber-400 shadow-lg shadow-amber-500/10"
                  : "bg-[#0d0d0d] border-[#222222] text-zinc-300 hover:border-[#333333] hover:bg-[#121212]"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className={`p-2 rounded-xl border ${isSelected ? "bg-amber-500/20 border-amber-500/30 text-amber-400" : "bg-[#161616] border-[#282828] text-zinc-400"}`}>
                  <Icon className="h-4 w-4" />
                </div>
                <span className="text-[10px] text-zinc-500 font-bold bg-[#141414] px-2 py-0.5 rounded border border-[#242424]">
                  {cat.count} specs
                </span>
              </div>

              <div className="space-y-0.5">
                <div className="font-bold text-sm text-zinc-100 font-sans">{cat.name}</div>
                <p className="text-[11px] text-zinc-500 font-sans line-clamp-1 leading-tight">
                  {cat.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}
