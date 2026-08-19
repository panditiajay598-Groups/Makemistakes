import React from "react";
import { Difficulty } from "./types";
import { Shield, Zap, Flame, Award } from "lucide-react";

interface DifficultyBadgeProps {
  difficulty: Difficulty;
  showIcon?: boolean;
  className?: string;
}

export default function DifficultyBadge({
  difficulty,
  showIcon = true,
  className = "",
}: DifficultyBadgeProps) {
  const getConfig = (diff: Difficulty) => {
    switch (diff) {
      case "Easy":
        return {
          bg: "bg-emerald-500/10",
          text: "text-emerald-400",
          border: "border-emerald-500/30",
          icon: Shield,
        };
      case "Medium":
        return {
          bg: "bg-amber-500/10",
          text: "text-amber-400",
          border: "border-amber-500/30",
          icon: Zap,
        };
      case "Hard":
        return {
          bg: "bg-orange-500/10",
          text: "text-orange-400",
          border: "border-orange-500/30",
          icon: Flame,
        };
      case "Expert":
        return {
          bg: "bg-purple-500/10",
          text: "text-purple-400",
          border: "border-purple-500/30",
          icon: Award,
        };
      default:
        return {
          bg: "bg-zinc-800",
          text: "text-zinc-400",
          border: "border-zinc-700",
          icon: Shield,
        };
    }
  };

  const config = getConfig(difficulty);
  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[11px] font-mono font-semibold tracking-wide uppercase ${config.bg} ${config.text} ${config.border} ${className}`}
    >
      {showIcon && <Icon className="h-3 w-3 shrink-0" />}
      <span>{difficulty}</span>
    </span>
  );
}
