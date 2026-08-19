"use client";

import React, { useState } from "react";
import { BookOpen, ExternalLink, FileText, ChevronRight, X, Layers, Cpu, Server } from "lucide-react";

interface DocResource {
  id: string;
  title: string;
  category: string;
  summary: string;
  content: string;
}

export default function ResourcesPanel() {
  const [selectedDoc, setSelectedDoc] = useState<DocResource | null>(null);

  const docs: DocResource[] = [
    {
      id: "redis-commands",
      title: "Redis INCR & Lua Atomic Scripts",
      category: "Redis Docs",
      summary: "Atomic operations in Redis to prevent race conditions during high concurrency.",
      content: `### Redis Atomic Rate Limiting Guide\n\nWhen multiple HTTP workers evaluate rate limits concurrently, standard GET -> INCR sequences suffer from race conditions.\n\n#### Redis EVAL & Lua Scripts\nBy wrapping evaluation inside a Lua script executed with \`redis.eval()\`, Redis guarantees single-threaded atomic execution across all requests:\n\n\`\`\`lua\nlocal current = redis.call('INCR', KEYS[1])\nif current == 1 then\n  redis.call('EXPIRE', KEYS[1], ARGV[1])\nend\nreturn current\n\`\`\`\n\n- **INCR**: Atomically increments counter by 1.\n- **EXPIRE**: Sets TTL window in seconds on key creation.\n- **SLA**: Guarantees atomic sub-2ms response latency.`,
    },
    {
      id: "node-async",
      title: "Node.js Non-Blocking IO & Promises",
      category: "Node Docs",
      summary: "Managing asynchronous microsecond operations without blocking event loops.",
      content: `### Node.js Async Best Practices\n\nHigh-throughput APIs depend on non-blocking async primitives:\n\n1. **Always handle connection pool errors**: Wrap Redis client calls in try/catch or async middleware error handlers.\n2. **Avoid synchronous blocks**: Never execute blocking file system calls or synchronous CPU loops inside HTTP request handlers.\n3. **Connection reuse**: Export a single shared Redis singleton instance rather than creating new client sockets per request.`,
    },
    {
      id: "typescript-types",
      title: "TypeScript Strict API Handlers",
      category: "TypeScript Docs",
      summary: "Type safe Request & Response wrappers with explicit HTTP return schemas.",
      content: `### TypeScript Response Typing\n\nEnsure strict typing for rate limiting middleware responses:\n\n\`\`\`typescript\nexport interface RateLimitResult {\n  allowed: boolean;\n  limit: number;\n  remaining: number;\n  resetSeconds: number;\n}\n\`\`\``,
    },
    {
      id: "architecture-sliding-window",
      title: "Sliding Window vs Token Bucket Architecture",
      category: "Architecture Notes",
      summary: "Comparing fixed window, sliding log, and token bucket rate limiters under load.",
      content: `### Architecture Comparison\n\n- **Fixed Window**: Simple counter per minute. Prone to boundary traffic bursts (2x limit at minute rollover).\n- **Sliding Window Log**: Tracks timestamped logs per request. Highly accurate but memory intensive.\n- **Token Bucket**: Replenishes tokens at constant rate. Optimal balance of memory & burst tolerance for production APIs.`,
    },
  ];

  return (
    <div className="bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden shadow-lg font-mono text-xs">
      
      {/* Header */}
      <div className="bg-zinc-900/90 border-b border-zinc-800 px-3.5 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-2 text-zinc-100 font-bold">
          <BookOpen className="h-4 w-4 text-amber-400" />
          <span>Technical Documentation & Reference</span>
        </div>
        <span className="text-zinc-500 text-[10px] uppercase font-bold">No Distractions</span>
      </div>

      {/* Docs List */}
      <div className="p-3 space-y-2 bg-zinc-950">
        {docs.map((doc) => (
          <div
            key={doc.id}
            onClick={() => setSelectedDoc(doc)}
            className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800/80 hover:border-amber-500/40 hover:bg-zinc-900 transition-all cursor-pointer group select-none"
          >
            <div className="flex items-center justify-between font-bold text-xs mb-1">
              <span className="text-amber-400 group-hover:text-amber-300 flex items-center gap-1.5">
                <FileText className="h-3.5 w-3.5" />
                {doc.title}
              </span>
              <span className="text-[10px] text-zinc-500 bg-zinc-950 px-2 py-0.5 rounded border border-zinc-800">
                {doc.category}
              </span>
            </div>
            <p className="text-zinc-400 text-[11px] font-sans leading-tight">
              {doc.summary}
            </p>
          </div>
        ))}
      </div>

      {/* Embedded Document Viewer Modal */}
      {selectedDoc && (
        <div className="fixed inset-0 z-50 bg-zinc-950/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden font-mono text-xs">
            
            {/* Modal Header */}
            <div className="p-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-950/80">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px] font-bold">
                  {selectedDoc.category}
                </span>
                <h3 className="font-bold text-zinc-100 text-sm">{selectedDoc.title}</h3>
              </div>
              <button
                onClick={() => setSelectedDoc(null)}
                className="p-1 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto font-sans text-zinc-300 leading-relaxed text-sm space-y-4">
              <div className="prose prose-invert max-w-none whitespace-pre-line font-mono text-xs">
                {selectedDoc.content}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-zinc-800 bg-zinc-950/80 flex justify-end">
              <button
                onClick={() => setSelectedDoc(null)}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs rounded-xl cursor-pointer transition-colors"
              >
                Close Docs
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
