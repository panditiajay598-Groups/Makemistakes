import React from "react";

interface TechTagProps {
  name: string;
  className?: string;
  onClick?: () => void;
  isActive?: boolean;
}

export default function TechTag({
  name,
  className = "",
  onClick,
  isActive = false,
}: TechTagProps) {
  return (
    <span
      onClick={onClick}
      className={`inline-flex items-center px-2 py-0.5 rounded-md font-mono text-[11px] font-medium transition-all ${
        onClick ? "cursor-pointer hover:border-zinc-500 hover:text-zinc-100" : ""
      } ${
        isActive
          ? "bg-amber-500/15 text-amber-400 border border-amber-500/40"
          : "bg-[#161616] text-zinc-400 border border-[#2a2a2a] hover:bg-[#1f1f1f]"
      } ${className}`}
    >
      <span className="opacity-60 text-[10px] mr-1">#</span>
      {name}
    </span>
  );
}
