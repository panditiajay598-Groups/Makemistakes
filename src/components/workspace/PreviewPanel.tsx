"use client";

import React, { useState } from "react";
import { Globe, Send, RefreshCw, Layers, CheckCircle2, AlertOctagon, Code, ShieldCheck } from "lucide-react";

interface PreviewPanelProps {
  step: number;
}

export default function PreviewPanel({ step }: PreviewPanelProps) {
  const [ipAddress, setIpAddress] = useState("192.168.1.42");
  const [requestCount, setRequestCount] = useState(0);
  const [lastStatus, setLastStatus] = useState<number | null>(200);
  const [isSending, setIsSending] = useState(false);
  const [headers, setHeaders] = useState<Record<string, string>>({
    "Content-Type": "application/json",
    "X-RateLimit-Limit": "10 req/min",
    "X-RateLimit-Remaining": "9",
    "X-RateLimit-Reset": "58s",
  });

  const handleSendBurst = (count: number) => {
    setIsSending(true);
    let newCount = requestCount + count;
    setRequestCount(newCount);

    setTimeout(() => {
      setIsSending(false);
      if (newCount > 10) {
        setLastStatus(429);
        setHeaders({
          "Content-Type": "application/json",
          "X-RateLimit-Limit": "10 req/min",
          "X-RateLimit-Remaining": "0",
          "Retry-After": "60",
        });
      } else {
        setLastStatus(200);
        setHeaders({
          "Content-Type": "application/json",
          "X-RateLimit-Limit": "10 req/min",
          "X-RateLimit-Remaining": String(10 - newCount),
          "X-RateLimit-Reset": "45s",
        });
      }
    }, 400);
  };

  const handleResetSimulator = () => {
    setRequestCount(0);
    setLastStatus(200);
    setHeaders({
      "Content-Type": "application/json",
      "X-RateLimit-Limit": "10 req/min",
      "X-RateLimit-Remaining": "10",
      "X-RateLimit-Reset": "60s",
    });
  };

  return (
    <div className="bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden shadow-lg flex flex-col font-mono text-xs">
      
      {/* Header bar */}
      <div className="bg-zinc-900/90 border-b border-zinc-800 px-3 py-2 flex items-center justify-between shrink-0 select-none">
        <div className="flex items-center gap-2 text-zinc-100 font-bold">
          <Globe className="h-3.5 w-3.5 text-amber-400" />
          <span>Live API Traffic & Throttle Simulator</span>
        </div>

        <button
          onClick={handleResetSimulator}
          className="text-zinc-400 hover:text-zinc-100 text-[11px] flex items-center gap-1 bg-zinc-800 px-2 py-0.5 rounded cursor-pointer border border-zinc-700"
        >
          <RefreshCw className="h-3 w-3" /> Reset Traffic
        </button>
      </div>

      {/* Simulator Body */}
      <div className="p-4 space-y-4 bg-zinc-950/90">
        
        {/* Input Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="sm:col-span-2 space-y-1">
            <label className="text-zinc-500 text-[10px] uppercase font-bold">Simulated Client IP</label>
            <input
              type="text"
              value={ipAddress}
              onChange={(e) => setIpAddress(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-1.5 text-zinc-200 outline-none focus:border-amber-500 font-mono text-xs"
            />
          </div>

          <div className="space-y-1 flex flex-col justify-end">
            <button
              onClick={() => handleSendBurst(1)}
              disabled={isSending}
              className="w-full py-1.5 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-zinc-950 font-bold rounded-lg flex items-center justify-center gap-1.5 cursor-pointer transition-all shadow-md shadow-amber-500/20"
            >
              <Send className="h-3.5 w-3.5" />
              <span>Send Request</span>
            </button>
          </div>
        </div>

        {/* Burst Actions */}
        <div className="flex items-center gap-2 pt-1 border-t border-zinc-900">
          <span className="text-zinc-500 text-[10px] uppercase font-bold shrink-0">Burst Test:</span>
          <button
            onClick={() => handleSendBurst(5)}
            disabled={isSending}
            className="px-2.5 py-1 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 rounded border border-zinc-800 font-mono text-[11px] cursor-pointer"
          >
            +5 Requests
          </button>
          <button
            onClick={() => handleSendBurst(12)}
            disabled={isSending}
            className="px-2.5 py-1 bg-zinc-900 hover:bg-zinc-800 text-amber-400 rounded border border-zinc-800 font-mono text-[11px] cursor-pointer"
          >
            +12 Burst Requests (Trigger 429)
          </button>
        </div>

        {/* Response Preview Box */}
        <div className="p-3 bg-zinc-900/60 border border-zinc-800/80 rounded-xl space-y-3">
          
          <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
            <div className="flex items-center gap-2">
              <span className="text-zinc-500 uppercase text-[10px] font-bold">Status Response:</span>
              {lastStatus === 200 ? (
                <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-bold text-[11px] flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" /> 200 OK
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded bg-red-500/10 text-red-400 border border-red-500/30 font-bold text-[11px] flex items-center gap-1">
                  <AlertOctagon className="h-3 w-3" /> 429 Too Many Requests
                </span>
              )}
            </div>

            <span className="text-zinc-500 text-[11px]">Total Sent: <strong className="text-zinc-200">{requestCount}</strong></span>
          </div>

          {/* Response Headers Table */}
          <div className="space-y-1">
            <div className="text-zinc-500 text-[10px] uppercase font-bold">HTTP Response Headers</div>
            <div className="bg-zinc-950 p-2.5 rounded-lg border border-zinc-800 space-y-1 font-mono text-[11px]">
              {Object.entries(headers).map(([key, val]) => (
                <div key={key} className="flex items-center justify-between">
                  <span className="text-amber-400">{key}:</span>
                  <span className="text-zinc-300">{val}</span>
                </div>
              ))}
            </div>
          </div>

          {/* JSON Payload preview */}
          <div className="space-y-1">
            <div className="text-zinc-500 text-[10px] uppercase font-bold">JSON Response Body</div>
            <pre className="bg-zinc-950 p-2.5 rounded-lg border border-zinc-800 text-zinc-300 font-mono text-[11px] overflow-x-auto">
              {lastStatus === 200
                ? JSON.stringify({ success: true, message: "Request allowed by rate limiter", clientIp: ipAddress, timestamp: new Date().toISOString() }, null, 2)
                : JSON.stringify({ error: "Too Many Requests", code: 429, message: "Rate limit exceeded. Please retry after 60 seconds." }, null, 2)}
            </pre>
          </div>

        </div>

      </div>

    </div>
  );
}
