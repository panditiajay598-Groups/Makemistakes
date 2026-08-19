"use client";

import React from "react";
import { BookOpen, ExternalLink, FileText, Video, Code } from "lucide-react";
import { MissionResource } from "./missionsData";

interface ResourceSectionProps {
  resources: MissionResource[];
}

export default function ResourceSection({ resources }: ResourceSectionProps) {
  const getResourceIcon = (type: MissionResource["type"]) => {
    switch (type) {
      case "video":
        return Video;
      case "documentation":
        return Code;
      case "guide":
        return FileText;
      default:
        return BookOpen;
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 font-mono text-xs text-teal-800 font-bold uppercase tracking-wider">
        <BookOpen className="h-4 w-4 text-teal-700" />
        <span>HELPFUL RESOURCES & REFERENCES</span>
      </div>

      <div className="grid grid-cols-1 gap-2.5">
        {resources.map((res) => {
          const Icon = getResourceIcon(res.type);
          return (
            <a
              key={res.id}
              href={res.url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-3.5 rounded-2xl border border-zinc-200/90 bg-zinc-50/80 hover:bg-teal-50/50 hover:border-teal-200 transition-all flex items-start justify-between gap-3 group no-underline text-zinc-900"
            >
              <div className="flex items-start gap-3">
                <div className="h-8 w-8 rounded-xl bg-white border border-zinc-200 flex items-center justify-center text-teal-700 shrink-0 group-hover:scale-105 transition-transform shadow-xs">
                  <Icon className="h-4 w-4 text-teal-700" />
                </div>
                <div>
                  <h5 className="font-sans text-xs font-bold text-zinc-900 group-hover:text-teal-900 transition-colors">
                    {res.title}
                  </h5>
                  <p className="text-[11px] text-zinc-500 font-sans mt-0.5 leading-snug">
                    {res.description}
                  </p>
                </div>
              </div>
              <ExternalLink className="h-3.5 w-3.5 text-zinc-400 group-hover:text-teal-700 shrink-0 mt-1 transition-colors" />
            </a>
          );
        })}
      </div>
    </div>
  );
}
