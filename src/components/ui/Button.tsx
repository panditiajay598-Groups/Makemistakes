"use client";

import React from "react";
import { motion, HTMLMotionProps } from "framer-motion";
import { LucideIcon } from "lucide-react";

interface ButtonProps extends Omit<HTMLMotionProps<"button">, "children"> {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "outline" | "ghost" | "teal";
  size?: "sm" | "md" | "lg";
  icon?: LucideIcon;
  iconPosition?: "left" | "right";
  className?: string;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = "primary",
  size = "md",
  icon: Icon,
  iconPosition = "right",
  className = "",
  ...props
}) => {
  const sizeClasses = {
    sm: "px-4 py-1.5 text-xs rounded-full gap-1.5 font-medium",
    md: "px-5 py-2 text-sm rounded-full gap-2 font-medium",
    lg: "px-7 py-3 text-base rounded-full gap-2.5 font-semibold",
  };

  const variantClasses = {
    primary:
      "bg-teal-700 hover:bg-teal-800 text-white shadow-sm border border-teal-800 transition-all",
    teal:
      "bg-teal-600 hover:bg-teal-700 text-white shadow-sm border border-teal-700 transition-all",
    secondary:
      "bg-zinc-900 hover:bg-black text-white shadow-sm border border-zinc-900 transition-all",
    outline:
      "bg-white hover:bg-zinc-50 text-zinc-800 border border-zinc-300 shadow-sm transition-all",
    ghost:
      "bg-transparent hover:bg-zinc-100 text-zinc-700 hover:text-zinc-900 border border-transparent transition-all",
  };

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      className={`inline-flex items-center justify-center transition-all cursor-pointer select-none ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {Icon && iconPosition === "left" && <Icon className="w-4 h-4" />}
      <span>{children}</span>
      {Icon && iconPosition === "right" && <Icon className="w-4 h-4" />}
    </motion.button>
  );
};
