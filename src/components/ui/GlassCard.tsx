"use client";

import React from "react";
import { motion } from "framer-motion";

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  glowColor?: "purple" | "cyan" | "emerald" | "amber" | "teal" | "none" | "rose" | "zinc";
  hoverEffect?: boolean;
  spotlight?: boolean;
  onClick?: () => void;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  className = "",
  hoverEffect = true,
  onClick,
}) => {
  return (
    <motion.div
      onClick={onClick}
      whileHover={hoverEffect ? { y: -3, transition: { duration: 0.2 } } : undefined}
      className={`relative overflow-hidden rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-sm hover:shadow-md transition-all duration-300 ${
        onClick ? "cursor-pointer" : ""
      } ${className}`}
    >
      <div className="relative z-10">{children}</div>
    </motion.div>
  );
};
