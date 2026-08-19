"use client";

import React, { useState } from "react";
import { FileText, FileCode2, Edit3, Code, Bold, List, Sparkles } from "lucide-react";
import { MissionDeliverable } from "./missionsData";

interface SubmissionEditorProps {
  deliverables: MissionDeliverable[];
  drafts: Record<string, string>;
  researchNotes: string;
  onChangeDraft: (deliverableId: string, content: string) => void;
  onChangeResearchNotes: (notes: string) => void;
}

export default function SubmissionEditor({
  deliverables,
  drafts,
  researchNotes,
  onChangeDraft,
  onChangeResearchNotes,
}: SubmissionEditorProps) {
  const [activeTab, setActiveTab] = useState<"deliverables" | "research">("deliverables");

  const getTotalWordCount = () => {
    const text = Object.values(drafts).join(" ") + " " + researchNotes;
    return text.trim().split(/\s+/).filter(Boolean).length;
  };

  return (
    <div className="bg-white border border-zinc-200/80 rounded-3xl overflow-hidden shadow-xl shadow-zinc-200/40 flex flex-col h-full min-h-[500px]">
      
      {/* Editor Header Tabs */}
      <div className="px-6 py-4 border-b border-zinc-200/80 bg-zinc-50/70 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab("deliverables")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono transition-all cursor-pointer border ${
              activeTab === "deliverables"
                ? "bg-white border-teal-200 text-teal-900 font-bold shadow-xs"
                : "border-transparent text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100"
            }`}
          >
            <FileCode2 className="h-4 w-4 text-teal-700" />
            <span>Structured Deliverables</span>
          </button>

          <button
            onClick={() => setActiveTab("research")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono transition-all cursor-pointer border ${
              activeTab === "research"
                ? "bg-white border-teal-200 text-teal-900 font-bold shadow-xs"
                : "border-transparent text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100"
            }`}
          >
            <Edit3 className="h-4 w-4 text-teal-700" />
            <span>Research &amp; Notes</span>
          </button>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs text-zinc-500">
          <Sparkles className="h-3.5 w-3.5 text-teal-700" />
          <span>{getTotalWordCount()} Words</span>
        </div>
      </div>

      {/* Editor Content Area */}
      <div className="p-6 overflow-y-auto flex-1 space-y-6">
        {activeTab === "deliverables" ? (
          <div className="space-y-6">
            {deliverables.map((del) => {
              const val = drafts[del.id] || "";
              const wordCount = val.trim().split(/\s+/).filter(Boolean).length;

              return (
                <div key={del.id} className="space-y-2.5 p-4 sm:p-5 rounded-2xl border border-zinc-200/90 bg-[#FAF9F5]/40 hover:border-teal-200 transition-colors">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-serif text-sm font-bold text-zinc-900">
                        {del.title}
                      </h4>
                      <p className="text-xs text-zinc-500 font-sans mt-0.5">
                        {del.description}
                      </p>
                    </div>
                    <span className="font-mono text-[10px] text-zinc-400">
                      {wordCount} words
                    </span>
                  </div>

                  <textarea
                    rows={4}
                    value={val}
                    onChange={(e) => onChangeDraft(del.id, e.target.value)}
                    placeholder={del.placeholder}
                    className="w-full p-4 rounded-xl border border-zinc-200/90 bg-white text-xs sm:text-sm font-mono text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-teal-700 focus:ring-1 focus:ring-teal-700 transition-all resize-y leading-relaxed"
                  />
                </div>
              );
            })}
          </div>
        ) : (
          <div className="space-y-3 h-full flex flex-col">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs text-zinc-500 font-bold uppercase">
                RESEARCH SCRATCHPAD &amp; TECHNICAL NOTES
              </span>
              <span className="text-[11px] font-mono text-zinc-400">Auto-saved to local session</span>
            </div>
            <textarea
              rows={12}
              value={researchNotes}
              onChange={(e) => onChangeResearchNotes(e.target.value)}
              placeholder="Jot down research insights, benchmark links, API thoughts, or schema drafts here..."
              className="w-full flex-1 p-4 rounded-2xl border border-zinc-200 bg-[#FAF9F5]/50 text-xs sm:text-sm font-mono text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-teal-700 focus:ring-1 focus:ring-teal-700 transition-all leading-relaxed"
            />
          </div>
        )}
      </div>

    </div>
  );
}
