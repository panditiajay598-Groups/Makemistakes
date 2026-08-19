import React from "react";

interface ProgressBarProps {
  progress: number; // 0 to 100
  label?: string;
  showPercentage?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export default function ProgressBar({
  progress,
  label,
  showPercentage = true,
  size = "md",
  className = "",
}: ProgressBarProps) {
  const clampedProgress = Math.min(100, Math.max(0, progress));

  const heightClass =
    size === "sm" ? "h-1.5" : size === "lg" ? "h-3" : "h-2";

  return (
    <div className={`space-y-1.5 ${className}`}>
      {(label || showPercentage) && (
        <div className="flex items-center justify-between text-xs font-mono">
          {label && <span className="text-zinc-400 font-sans">{label}</span>}
          {showPercentage && (
            <span className="text-amber-400 font-bold ml-auto">{clampedProgress}%</span>
          )}
        </div>
      )}
      <div
        className={`w-full bg-[#1c1c1c] rounded-full overflow-hidden border border-[#282828] ${heightClass}`}
      >
        <div
          className="h-full bg-amber-500 rounded-full transition-all duration-500 ease-out shadow-[0_0_10px_rgba(245,158,11,0.3)]"
          style={{ width: `${clampedProgress}%` }}
        />
      </div>
    </div>
  );
}
