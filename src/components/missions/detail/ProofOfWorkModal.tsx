import React from "react";
import { ShieldCheck, X, Github, ExternalLink, Share2, Award, Calendar, CheckCircle2 } from "lucide-react";
import { ProofOfWorkRecord } from "@/lib/attemptsStore";
import TechTag from "../TechTag";

interface ProofOfWorkModalProps {
  isOpen: boolean;
  pow: ProofOfWorkRecord | null;
  onClose: () => void;
}

export default function ProofOfWorkModal({
  isOpen,
  pow,
  onClose,
}: ProofOfWorkModalProps) {
  if (!isOpen || !pow) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-2xl bg-[#0e1410] border border-emerald-500/30 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl relative overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-emerald-500/20 pb-4">
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <span className="font-mono text-[10px] text-emerald-400 font-bold uppercase tracking-wider">
                VERIFIED PROOF OF WORK
              </span>
              <h3 className="font-display text-lg font-bold text-zinc-100">
                {pow.title}
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="h-8 w-8 rounded-xl bg-[#16221a] hover:bg-[#203226] text-zinc-400 hover:text-zinc-100 flex items-center justify-center border border-emerald-500/20 transition-colors cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content body */}
        <div className="space-y-4">
          {/* Key metrics grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-xs">
            <div className="p-3 rounded-xl bg-[#142018] border border-emerald-500/20 space-y-1">
              <span className="text-zinc-400 text-[10px]">VERIFIED SCORE</span>
              <div className="text-emerald-400 font-bold text-lg flex items-center gap-1">
                <Award className="h-4 w-4" />
                <span>{pow.score}/100</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-[#142018] border border-emerald-500/20 space-y-1">
              <span className="text-zinc-400 text-[10px]">COMPLETED DATE</span>
              <div className="text-zinc-200 font-bold text-sm flex items-center gap-1">
                <Calendar className="h-4 w-4 text-zinc-400" />
                <span>{pow.completedAt}</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-[#142018] border border-emerald-500/20 space-y-1">
              <span className="text-zinc-400 text-[10px]">BENCHMARK RESULT</span>
              <div className="text-emerald-300 font-bold text-xs truncate">
                {pow.verifiedMetric}
              </div>
            </div>
          </div>

          {/* Reflection */}
          <div className="p-4 rounded-2xl bg-[#131f17] border border-emerald-500/20 space-y-1.5">
            <span className="font-mono text-[10px] text-emerald-400 uppercase font-bold tracking-wider">
              Engineering Reflection Summary
            </span>
            <p className="text-zinc-200 font-sans text-xs leading-relaxed italic">
              "{pow.reflectionSummary}"
            </p>
          </div>

          {/* Stack */}
          <div className="space-y-2">
            <span className="font-mono text-[10px] text-zinc-400 uppercase font-bold">
              Verified Tech Stack
            </span>
            <div className="flex flex-wrap gap-1.5">
              {pow.techStack.map((tech) => (
                <TechTag key={tech} name={tech} />
              ))}
            </div>
          </div>
        </div>

        {/* Footer CTAs */}
        <div className="flex items-center justify-between gap-3 pt-4 border-t border-emerald-500/20">
          <a
            href={pow.githubRepo}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 bg-[#17241c] hover:bg-[#22362a] text-zinc-200 border border-emerald-500/30 rounded-xl font-mono text-xs font-semibold flex items-center gap-2 no-underline transition-colors"
          >
            <Github className="h-4 w-4 text-zinc-300" />
            <span>GitHub Repository</span>
            <ExternalLink className="h-3.5 w-3.5 text-zinc-400" />
          </a>

          <button
            onClick={() => {
              if (navigator.clipboard) {
                navigator.clipboard.writeText(window.location.href);
              }
            }}
            className="px-5 py-2 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-mono text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all cursor-pointer shadow-md shadow-emerald-500/20"
          >
            <Share2 className="h-3.5 w-3.5" />
            <span>Share Certificate</span>
          </button>
        </div>
      </div>
    </div>
  );
}
