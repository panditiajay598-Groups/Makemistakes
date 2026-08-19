import React from "react";
import { Search, X, Command } from "lucide-react";

interface MissionSearchProps {
  value: string;
  onChange: (query: string) => void;
  resultCount?: number;
  totalCount?: number;
}

export default function MissionSearch({
  value,
  onChange,
  resultCount,
  totalCount,
}: MissionSearchProps) {
  const inputRef = React.useRef<HTMLInputElement>(null);

  // Keyboard shortcut '/' or 'Cmd+K' to focus search
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        (e.key === "/" || (e.key === "k" && (e.metaKey || e.ctrlKey))) &&
        document.activeElement?.tagName !== "INPUT" &&
        document.activeElement?.tagName !== "TEXTAREA"
      ) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className="relative flex-1 w-full">
      <div className="relative flex items-center">
        <Search className="absolute left-4 h-4 w-4 text-zinc-500 pointer-events-none" />

        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Search engineering challenges..."
          className="w-full h-12 pl-11 pr-24 bg-[#111111] hover:bg-[#151515] focus:bg-[#141414] text-zinc-100 placeholder-zinc-500 text-xs font-mono rounded-2xl border border-[#232323] focus:border-amber-500/50 focus:outline-none transition-all shadow-inner"
        />

        {value ? (
          <button
            onClick={() => onChange("")}
            className="absolute right-3.5 p-1 rounded-md text-zinc-500 hover:text-zinc-200 hover:bg-[#232323] transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        ) : (
          <div className="absolute right-3.5 hidden sm:flex items-center gap-1 text-[10px] font-mono text-zinc-500 bg-[#1a1a1a] px-2 py-0.5 rounded border border-[#2c2c2c] pointer-events-none">
            <Command className="h-3 w-3" />
            <span>K</span>
          </div>
        )}
      </div>

      {value && resultCount !== undefined && (
        <div className="absolute -bottom-5 left-1 text-[10px] font-mono text-zinc-500">
          Showing <span className="text-amber-400 font-bold">{resultCount}</span> of {totalCount} engineering challenges
        </div>
      )}
    </div>
  );
}
