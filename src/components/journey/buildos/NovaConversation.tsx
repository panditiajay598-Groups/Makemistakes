"use client";

import { useState, type ReactNode } from "react";
import { Check, Copy } from "lucide-react";

function renderInline(text: string): ReactNode[] {
  const parts: ReactNode[] = [];
  const pattern = /(\*\*[^*]+\*\*|`[^`]+`|\*[^*]+\*)/g;
  let cursor = 0;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(text)) !== null) {
    if (match.index > cursor) parts.push(text.slice(cursor, match.index));
    const token = match[0];
    const content = token.slice(token.startsWith("**") ? 2 : 1, token.startsWith("**") ? -2 : -1);
    if (token.startsWith("**")) {
      parts.push(<strong key={match.index} className="font-semibold text-zinc-100">{content}</strong>);
    } else if (token.startsWith("`")) {
      parts.push(<code key={match.index} className="rounded bg-black/40 px-1 py-0.5 font-mono text-[0.92em] text-emerald-200">{content}</code>);
    } else {
      parts.push(<em key={match.index} className="italic text-zinc-200">{content}</em>);
    }
    cursor = match.index + token.length;
  }

  if (cursor < text.length) parts.push(text.slice(cursor));
  return parts;
}

export function highlightCode(code: string): ReactNode[] {
  const tokens = /("(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|`(?:\\.|[^`\\])*`|\/\/.*|\/\*[\s\S]*?\*\/|\b(?:async|await|const|let|var|function|return|export|default|import|from|if|else|throw|new|class|extends|try|catch|finally|type|interface|true|false|null|undefined|const|public|private|static|typeof|void)\b|\b\d+(?:\.\d+)?\b)/g;
  const result: ReactNode[] = [];
  let cursor = 0;
  let match: RegExpExecArray | null;

  while ((match = tokens.exec(code)) !== null) {
    if (match.index > cursor) result.push(code.slice(cursor, match.index));
    const token = match[0];
    const className = token.startsWith("//") || token.startsWith("/*")
      ? "text-zinc-500 italic"
      : /^["'`]/.test(token)
        ? "text-amber-200"
        : /^\d/.test(token)
          ? "text-purple-300"
          : "text-sky-300";
    result.push(<span key={match.index} className={className}>{token}</span>);
    cursor = match.index + token.length;
  }

  if (cursor < code.length) result.push(code.slice(cursor));
  return result;
}

function CodeBlock({ code, language }: { code: string; language: string }) {
  const [copied, setCopied] = useState(false);

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch (error) {
      console.error("[Nova] Could not copy code block.", error);
    }
  };

  return (
    <section className="my-3 overflow-hidden rounded-md border border-zinc-700/70 bg-[#080A09]" aria-label={`${language || "Code"} block`}>
      <header className="flex items-center justify-between border-b border-zinc-800 px-3 py-1.5">
        <span className="text-[10px] font-medium uppercase tracking-wide text-zinc-500">{language || "Code"}</span>
        <button
          type="button"
          onClick={() => void copyCode()}
          className="inline-flex items-center gap-1 rounded px-1.5 py-1 text-[10px] text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100 focus-visible:outline focus-visible:outline-1 focus-visible:outline-emerald-500"
          aria-label={copied ? "Code copied" : "Copy code"}
        >
          {copied ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
          {copied ? "Copied" : "Copy"}
        </button>
      </header>
      <pre className="max-h-64 overflow-auto p-3 text-[11px] leading-5 text-zinc-200">
        <code className="font-mono">{highlightCode(code)}</code>
      </pre>
    </section>
  );
}

export function NovaMessageContent({
  content,
  omitCodeBlocks = false,
}: {
  content: string;
  omitCodeBlocks?: boolean;
}) {
  const lines = content.replace(/\r\n/g, "\n").split("\n");
  const blocks: ReactNode[] = [];
  let index = 0;

  while (index < lines.length) {
    const line = lines[index];
    const fence = line.match(/^\s*```([\w+-]*)\s*$/);
    if (fence) {
      const codeLines: string[] = [];
      index++;
      while (index < lines.length && !/^\s*```\s*$/.test(lines[index])) {
        codeLines.push(lines[index]);
        index++;
      }
      if (index < lines.length) index++;
      if (!omitCodeBlocks) {
        blocks.push(<CodeBlock key={`code-${index}`} code={codeLines.join("\n")} language={fence[1]} />);
      }
      continue;
    }

    if (!line.trim()) {
      index++;
      continue;
    }

    const heading = line.match(/^\s{0,3}(#{1,4})\s+(.+?)\s*#*\s*$/);
    const boldHeading = line.match(/^\s*\*\*(.+?)\*\*\s*$/);
    const labelHeading = line.match(/^\s*([A-Z][^.!?]{2,60}:)\s*$/);
    if (heading || boldHeading || labelHeading) {
      const level = heading?.[1].length || 3;
      const Tag = level <= 2 ? "h3" : "h4";
      blocks.push(
        <Tag key={`heading-${index}`} className="mb-1.5 mt-3 first:mt-0 text-[12px] font-semibold text-zinc-100">
          {renderInline(heading?.[2] || boldHeading?.[1] || labelHeading?.[1] || "")}
        </Tag>
      );
      index++;
      continue;
    }

    if (/^\s*(?:[-*_]\s*){3,}$/.test(line)) {
      blocks.push(<hr key={`rule-${index}`} className="my-3 border-zinc-700/80" />);
      index++;
      continue;
    }

    const firstListItem = line.match(/^\s*(?:[-*+•✓]|\d+[.)])\s+(.+)$/);
    if (firstListItem) {
      const ordered = /^\s*\d+[.)]\s+/.test(line);
      const items: string[] = [];
      while (index < lines.length) {
        const item = lines[index].match(/^\s*(?:[-*+•✓]|\d+[.)])\s+(.+)$/);
        if (!item || /^\s*\d+[.)]\s+/.test(lines[index]) !== ordered) break;
        items.push(item[1]);
        index++;
      }
      const List = ordered ? "ol" : "ul";
      blocks.push(
        <List
          key={`list-${index}`}
          className={`my-2 space-y-1 pl-5 text-[12px] leading-relaxed text-zinc-300 ${ordered ? "list-decimal" : "list-disc marker:text-emerald-500"}`}
        >
          {items.map((item, itemIndex) => <li key={`${index}-${itemIndex}`} className="pl-0.5">{renderInline(item)}</li>)}
        </List>
      );
      continue;
    }

    const paragraph: string[] = [];
    while (
      index < lines.length &&
      lines[index].trim() &&
      !/^\s*```/.test(lines[index]) &&
      !/^\s{0,3}#{1,4}\s/.test(lines[index]) &&
      !/^\s*(?:[-*+•✓]|\d+[.)])\s+/.test(lines[index]) &&
      !/^\s*(?:[-*_]\s*){3,}$/.test(lines[index])
    ) {
      paragraph.push(lines[index].trim());
      index++;
    }
    blocks.push(
      <p key={`paragraph-${index}`} className="my-1.5 text-[12px] leading-[1.65] text-zinc-300">
        {renderInline(paragraph.join(" "))}
      </p>
    );
  }

  return <div className="break-words">{blocks}</div>;
}

export function NovaImplementationCard({
  objective,
  steps,
  files,
  explanation,
  expectedOutcome,
}: {
  objective: string;
  steps: string[];
  files: string[];
  explanation: string;
  expectedOutcome: string;
}) {
  return (
    <section className="overflow-hidden rounded-md border border-emerald-900/70 bg-[#0E1510]" aria-label="Implementation overview">
      <div className="border-b border-emerald-950/80 px-3 py-2">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-emerald-300">Implementation overview</p>
        <p className="mt-1 text-[12px] font-medium text-zinc-100">{objective}</p>
      </div>
      <dl className="space-y-2 px-3 py-2.5 text-[11px] leading-relaxed">
        <div>
          <dt className="font-semibold text-zinc-300">Steps</dt>
          <dd>
            {steps.length > 0 ? (
              <ol className="mt-1 list-decimal space-y-0.5 pl-4 text-zinc-400">
                {steps.map((step, index) => <li key={`${index}-${step}`}>{step}</li>)}
              </ol>
            ) : <p className="mt-0.5 text-zinc-500">No numbered steps were included in Nova&apos;s response.</p>}
          </dd>
        </div>
        <div>
          <dt className="font-semibold text-zinc-300">Files affected</dt>
          <dd className="mt-1 flex flex-wrap gap-1">
            {files.map((file) => <code key={file} className="rounded bg-black/30 px-1.5 py-0.5 font-mono text-[10px] text-emerald-200">{file}</code>)}
          </dd>
        </div>
        {explanation && (
          <div>
            <dt className="font-semibold text-zinc-300">Explanation</dt>
            <dd className="mt-0.5 text-zinc-400">{explanation || "See Nova's response above for the explanation."}</dd>
          </div>
        )}
        {expectedOutcome && (
          <div>
            <dt className="font-semibold text-zinc-300">Expected outcome</dt>
            <dd className="mt-0.5 text-zinc-400">{expectedOutcome}</dd>
          </div>
        )}
      </dl>
    </section>
  );
}
