"use client";

import React, { useState, useRef, useEffect } from "react";
import { Terminal as TerminalIcon, Trash2, Copy, Play, Check, ChevronRight } from "lucide-react";

interface TerminalPanelProps {
  logs: string[];
  onClearLogs: () => void;
  onRunCustomCommand?: (cmd: string) => void;
}

export default function TerminalPanel({ logs, onClearLogs, onRunCustomCommand }: TerminalPanelProps) {
  const [commandInput, setCommandInput] = useState("");
  const [copied, setCopied] = useState(false);
  const logEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  const handleCopyLogs = () => {
    navigator.clipboard.writeText(logs.join("\n"));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCommandSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commandInput.trim()) return;

    if (commandInput.trim() === "clear") {
      onClearLogs();
      setCommandInput("");
      return;
    }

    if (onRunCustomCommand) {
      onRunCustomCommand(commandInput.trim());
    }

    setCommandInput("");
  };

  return (
    <div className="bg-zinc-950 border border-zinc-800 rounded-xl flex flex-col h-[220px] overflow-hidden shadow-lg font-mono text-xs">
      
      {/* Terminal Header */}
      <div className="bg-zinc-900/90 border-b border-zinc-800 px-3 py-1.5 flex items-center justify-between shrink-0 select-none">
        <div className="flex items-center gap-2 text-zinc-300 font-bold">
          <TerminalIcon className="h-3.5 w-3.5 text-amber-400" />
          <span>Integrated Terminal & Output Logs</span>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={handleCopyLogs}
            className="p-1 rounded text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors cursor-pointer"
            title="Copy Logs"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
          </button>
          <button
            onClick={onClearLogs}
            className="p-1 rounded text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors cursor-pointer"
            title="Clear Output"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Terminal Body */}
      <div className="flex-1 p-3 overflow-y-auto space-y-1 bg-zinc-950/95 font-mono text-[11px] leading-relaxed">
        {logs.length === 0 ? (
          <div className="text-zinc-600 italic py-2">
            Terminal output ready. Click <strong>"Run Tests"</strong> or type <code>npm test</code> to execute assertions.
          </div>
        ) : (
          logs.map((log, idx) => {
            let style = "text-zinc-300";
            if (log.includes("✓") || log.includes("PASS") || log.includes("SUCCESS")) {
              style = "text-emerald-400 font-semibold";
            } else if (log.includes("✗") || log.includes("FAIL") || log.includes("ERROR")) {
              style = "text-red-400 font-semibold";
            } else if (log.includes("===") || log.includes("CONGRATULATIONS")) {
              style = "text-amber-400 font-bold";
            } else if (log.startsWith("$")) {
              style = "text-zinc-400 font-semibold";
            }

            return (
              <div key={idx} className={`${style} whitespace-pre-wrap`}>
                {log}
              </div>
            );
          })
        )}
        <div ref={logEndRef} />
      </div>

      {/* Interactive Command Line Bar */}
      <form
        onSubmit={handleCommandSubmit}
        className="bg-zinc-950 border-t border-zinc-900 px-3 py-1.5 flex items-center gap-2 shrink-0"
      >
        <ChevronRight className="h-3.5 w-3.5 text-amber-400 shrink-0" />
        <span className="text-emerald-400 font-bold shrink-0">$</span>
        <input
          type="text"
          value={commandInput}
          onChange={(e) => setCommandInput(e.target.value)}
          placeholder="Try 'npm test', 'redis-cli ping', or 'clear'..."
          className="w-full bg-transparent text-zinc-100 placeholder:text-zinc-600 outline-none font-mono text-xs border-none"
        />
        <button
          type="submit"
          className="px-2 py-0.5 rounded bg-zinc-900 hover:bg-zinc-800 text-zinc-300 font-mono text-[10px] border border-zinc-800 cursor-pointer"
        >
          Exec
        </button>
      </form>

    </div>
  );
}
