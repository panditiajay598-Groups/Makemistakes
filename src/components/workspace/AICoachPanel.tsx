"use client";

import React, { useState } from "react";
import { Bot, Sparkles, Send, Lightbulb, AlertTriangle, MessageSquare, CheckCircle2 } from "lucide-react";

interface AICoachPanelProps {
  currentStep: number;
  activeFile: string;
  code: string;
  recentMistakes: string[];
  onRequestHint: () => void;
  messages: Array<{ sender: "user" | "coach"; text: string }>;
  onSendMessage: (msg: string) => void;
}

export default function AICoachPanel({
  currentStep,
  activeFile,
  code,
  recentMistakes,
  onRequestHint,
  messages,
  onSendMessage,
}: AICoachPanelProps) {
  const [input, setInput] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    onSendMessage(input.trim());
    setInput("");
  };

  return (
    <div className="bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden shadow-lg flex flex-col font-mono text-xs">
      
      {/* Header Bar */}
      <div className="bg-zinc-900/90 border-b border-zinc-800 px-3.5 py-2.5 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2 text-zinc-100 font-bold">
          <Bot className="h-4 w-4 text-amber-400" />
          <span>Socratic AI Coach</span>
        </div>
        <button
          onClick={onRequestHint}
          className="px-2.5 py-1 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-lg text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-colors"
        >
          <Lightbulb className="h-3 w-3 fill-amber-400" />
          <span>Hint</span>
        </button>
      </div>

      {/* Persistent Understanding & Mistakes Bar */}
      <div className="p-3 bg-zinc-900/40 border-b border-zinc-800/80 space-y-2 text-[11px]">
        <div className="flex items-center justify-between text-zinc-400">
          <span>Current Understanding:</span>
          <span className="text-emerald-400 font-bold flex items-center gap-1">
            <CheckCircle2 className="h-3 w-3" /> Step {currentStep} Active
          </span>
        </div>

        {recentMistakes.length > 0 && (
          <div className="p-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-300 space-y-1">
            <div className="font-bold flex items-center gap-1 text-[10px] text-red-400 uppercase">
              <AlertTriangle className="h-3 w-3" /> Recent Mistake Detected:
            </div>
            <p className="text-[11px] font-sans">{recentMistakes[recentMistakes.length - 1]}</p>
          </div>
        )}
      </div>

      {/* Chat Messages Window */}
      <div className="p-3 space-y-3 h-[240px] overflow-y-auto bg-zinc-950/80 font-sans text-xs">
        {messages.map((m, idx) => (
          <div
            key={idx}
            className={`flex items-start gap-2 ${m.sender === "user" ? "flex-row-reverse" : "flex-row"}`}
          >
            {m.sender === "coach" ? (
              <div className="h-6 w-6 rounded-md bg-amber-500/20 border border-amber-500/30 text-amber-400 flex items-center justify-center font-bold text-[10px] shrink-0">
                AI
              </div>
            ) : (
              <div className="h-6 w-6 rounded-md bg-zinc-800 border border-zinc-700 text-zinc-300 flex items-center justify-center font-bold text-[10px] shrink-0">
                You
              </div>
            )}

            <div
              className={`p-3 rounded-2xl max-w-[85%] text-xs leading-relaxed ${
                m.sender === "user"
                  ? "bg-amber-500 text-zinc-950 font-medium font-mono"
                  : "bg-zinc-900 border border-zinc-800 text-zinc-200"
              }`}
            >
              {m.text}
            </div>
          </div>
        ))}
      </div>

      {/* Interactive Input Form */}
      <form
        onSubmit={handleSubmit}
        className="p-2.5 bg-zinc-900/90 border-t border-zinc-800 flex items-center gap-2 shrink-0"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={`Ask AI Coach about ${activeFile}...`}
          className="flex-1 bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-1.5 text-zinc-100 placeholder:text-zinc-500 outline-none focus:border-amber-500 font-mono text-xs"
        />
        <button
          type="submit"
          className="p-2 bg-amber-500 hover:bg-amber-400 text-zinc-950 rounded-lg cursor-pointer transition-colors shrink-0"
          title="Send Question"
        >
          <Send className="h-3.5 w-3.5" />
        </button>
      </form>

    </div>
  );
}
