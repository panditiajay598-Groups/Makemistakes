"use client";

import React from "react";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "purple" | "cyan" | "emerald" | "amber" | "rose" | "zinc" | "teal";
  size?: "sm" | "md";
  className?: string;
  icon?: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = "teal",
  size = "sm",
  className = "",
  icon,
}) => {
  const variantStyles = {
    teal: "bg-teal-50 text-teal-800 border-teal-200",
    purple: "bg-purple-50 text-purple-800 border-purple-200",
    cyan: "bg-sky-50 text-sky-800 border-sky-200",
    emerald: "bg-emerald-50 text-emerald-800 border-emerald-200",
    amber: "bg-amber-50 text-amber-800 border-amber-200",
    rose: "bg-rose-50 text-rose-800 border-rose-200",
    zinc: "bg-zinc-100 text-zinc-700 border-zinc-200",
  };

  const sizeStyles = {
    sm: "px-2.5 py-0.5 text-xs font-mono rounded-full",
    md: "px-3 py-1 text-sm font-mono rounded-full",
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 border font-medium select-none ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      <span>{children}</span>
    </span>
  );
};
