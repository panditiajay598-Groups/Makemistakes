import React from "react";
import { ShieldCheck, Github, ExternalLink, Award, Share2, Sparkles } from "lucide-react";
import { MissionDetailData } from "./detailTypes";
import TechTag from "../TechTag";

interface ProofOfWorkPreviewProps {
  pow: MissionDetailData["proofOfWorkSnippet"];
  techStack: string[];
}

export default function ProofOfWorkPreview({ pow, techStack }: ProofOfWorkPreviewProps) {
  return (
    <section className="rounded-3xl border border-[#232323] bg-[#111111] p-6 sm:p-8 space-y-6">
      
      <div className="flex items-center justify-between border-b border-[#232323] pb-4">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-emerald-400" />
          <h2 className="font-display text-xl font-bold text-zinc-100 tracking-tight">
            Proof of Work Certificate Preview
          </h2>
        </div>
        <span className="font-mono text-xs text-zinc-500 hidden sm:inline">
          Recruiter-Verified Engineering Output
        </span>
      </div>

      {/* Recruiter-ready Proof of Work Card */}
      <div className="rounded-2xl border border-emerald-500/30 bg-[#0c120e] p-6 space-y-5 shadow-xl relative overflow-hidden">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-emerald-500/20 pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-mono text-[10px] uppercase font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded border border-emerald-500/30 flex items-center gap-1">
                <ShieldCheck className="h-3 w-3" /> VERIFIED BUILDER ARTIFACT
              </span>
              <span className="font-mono text-xs text-zinc-400">Score: <strong className="text-emerald-400">{pow.score}/100</strong></span>
            </div>
            <h3 className="font-display text-lg font-bold text-zinc-100">
              {pow.title}
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={pow.githubRepo}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 bg-[#161616] hover:bg-[#202020] text-zinc-300 border border-[#2e2e2e] rounded-xl font-mono text-xs flex items-center gap-1.5 no-underline transition-colors"
            >
              <Github className="h-3.5 w-3.5" />
              <span>GitHub Repo</span>
              <ExternalLink className="h-3 w-3 text-zinc-500" />
            </a>
          </div>
        </div>

        {/* Metric achieved */}
        <div className="p-3.5 rounded-xl bg-[#141d17] border border-emerald-500/30 flex items-center justify-between text-xs font-mono">
          <span className="text-zinc-300">Verified Target Metric:</span>
          <span className="text-emerald-400 font-bold">{pow.keyMetricAchieved}</span>
        </div>

        {/* Reflection */}
        <div className="space-y-1 text-xs">
          <span className="font-mono text-zinc-400 font-bold uppercase text-[10px]">Engineering Reflection</span>
          <p className="text-zinc-300 font-sans leading-relaxed italic">
            "{pow.reflectionSummary}"
          </p>
        </div>

        {/* Tech tags */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-emerald-500/20 text-xs font-mono">
          <div className="flex items-center gap-1.5">
            {techStack.map((tech) => (
              <TechTag key={tech} name={tech} />
            ))}
          </div>

          <button className="px-3.5 py-1.5 bg-emerald-500 text-zinc-950 font-bold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer hover:bg-emerald-400">
            <Share2 className="h-3.5 w-3.5" />
            <span>Share to LinkedIn</span>
          </button>
        </div>

      </div>

    </section>
  );
}
