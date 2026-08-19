import React from "react";

export default function MissionSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, idx) => (
        <div
          key={idx}
          className="rounded-2xl border border-[#232323] bg-[#111111] p-5 space-y-4 animate-pulse"
        >
          {/* Top header block */}
          <div className="h-28 w-full bg-[#181818] rounded-xl" />

          {/* Title & Description */}
          <div className="space-y-2">
            <div className="h-5 w-3/4 bg-[#1e1e1e] rounded-md" />
            <div className="h-3 w-full bg-[#161616] rounded-md" />
            <div className="h-3 w-2/3 bg-[#161616] rounded-md" />
          </div>

          {/* Tags */}
          <div className="flex gap-2">
            <div className="h-5 w-16 bg-[#1e1e1e] rounded-md" />
            <div className="h-5 w-16 bg-[#1e1e1e] rounded-md" />
            <div className="h-5 w-16 bg-[#1e1e1e] rounded-md" />
          </div>

          {/* CTA */}
          <div className="pt-2 border-t border-[#232323]">
            <div className="h-10 w-full bg-[#1c1c1c] rounded-xl" />
          </div>
        </div>
      ))}
    </div>
  );
}
