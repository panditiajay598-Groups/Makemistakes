import React from "react";

export default function MissionDetailSkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      {/* Hero skeleton */}
      <div className="rounded-3xl border border-[#232323] bg-[#111111] p-8 space-y-4">
        <div className="h-4 w-40 bg-[#1e1e1e] rounded" />
        <div className="h-8 w-2/3 bg-[#242424] rounded-md" />
        <div className="h-4 w-full bg-[#181818] rounded" />
        <div className="flex gap-2">
          <div className="h-6 w-20 bg-[#1e1e1e] rounded" />
          <div className="h-6 w-20 bg-[#1e1e1e] rounded" />
        </div>
        <div className="h-12 w-48 bg-[#282828] rounded-xl pt-4" />
      </div>

      {/* Grid skeletons */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-8">
          <div className="h-64 rounded-3xl bg-[#111111] border border-[#232323]" />
          <div className="h-64 rounded-3xl bg-[#111111] border border-[#232323]" />
        </div>
        <div className="lg:col-span-4">
          <div className="h-96 rounded-3xl bg-[#111111] border border-[#232323]" />
        </div>
      </div>
    </div>
  );
}
