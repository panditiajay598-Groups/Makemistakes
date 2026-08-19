import React from "react";
import { Category } from "./types";
import { Layers, Server, Code2, Sparkles, Cpu, Cloud, Database, Smartphone, GitBranch, ShieldCheck } from "lucide-react";

interface CategoryTabsProps {
  activeCategory: Category;
  onSelect: (category: Category) => void;
  counts?: Record<string, number>;
}

const CATEGORIES: { id: Category; label: string; icon?: any }[] = [
  { id: "All", label: "All Missions", icon: Layers },
  { id: "Backend", label: "Backend", icon: Server },
  { id: "System Design", label: "System Design", icon: Cpu },
  { id: "Database", label: "Database", icon: Database },
  { id: "DevOps", label: "DevOps", icon: Cpu },
  { id: "AI", label: "AI & ML", icon: Sparkles },
  { id: "Frontend", label: "Frontend", icon: Code2 },
  { id: "Cloud", label: "Cloud", icon: Cloud },
  { id: "Security", label: "Security", icon: ShieldCheck },
  { id: "Mobile", label: "Mobile", icon: Smartphone },
  { id: "Open Source", label: "Open Source", icon: GitBranch },
];

export default function CategoryTabs({
  activeCategory,
  onSelect,
  counts,
}: CategoryTabsProps) {
  return (
    <div className="w-full overflow-x-auto no-scrollbar py-1">
      <div className="flex items-center gap-2 min-w-max">
        {CATEGORIES.map((cat) => {
          const Icon = cat.icon;
          const isActive = activeCategory === cat.id;
          const count = counts ? counts[cat.id] : undefined;

          return (
            <button
              key={cat.id}
              onClick={() => onSelect(cat.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-mono font-medium transition-all flex items-center gap-2 cursor-pointer border ${
                isActive
                  ? "bg-amber-500 text-zinc-950 border-amber-400 font-bold shadow-md shadow-amber-500/20"
                  : "bg-[#111111] hover:bg-[#181818] text-zinc-400 hover:text-zinc-100 border-[#232323]"
              }`}
            >
              {Icon && <Icon className={`h-3.5 w-3.5 ${isActive ? "text-zinc-950" : "text-zinc-500"}`} />}
              <span>{cat.label}</span>
              {count !== undefined && (
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    isActive ? "bg-zinc-950/20 text-zinc-950 font-bold" : "bg-[#1f1f1f] text-zinc-500"
                  }`}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
