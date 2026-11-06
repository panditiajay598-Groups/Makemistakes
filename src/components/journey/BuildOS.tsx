"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import {
  Check,
  FileCode,
  FilePlus,
  Folder,
  Loader2,
  Play,
  Copy,
  Trash2,
  AlertTriangle,
  Send,
  Sparkles,
  Monitor,
  Tablet,
  Smartphone,
  PanelLeftClose,
  PanelLeftOpen,
  PanelRightClose,
  ChevronDown,
  ChevronUp,
  Compass,
  RefreshCw,
  UserRound,
} from "lucide-react";
import { getJourneyUserId } from "@/lib/journeyUser";
import { ProblemData } from "@/lib/problemContent";
import { deriveBuildWorkspace, validateMissionCode, BuildMission } from "@/lib/buildWorkspace";
import {
  CodeProposal,
  NovaImplementationPlanCard,
  NovaModeSelector,
  type NovaMode,
  type ProposalStatus,
} from "@/components/journey/buildos/BuildOSControls";
import type { ImplementationStepStatus, NovaImplementationPlan } from "@/lib/nova/implementationPlan";
import {
  NovaImplementationCard,
  NovaMessageContent,
} from "@/components/journey/buildos/NovaConversation";

type FileNode =
  | { type: "file"; name: string; path: string }
  | { type: "dir"; name: string; path: string; children: FileNode[] };

const subscribeToDesktopViewport = (onChange: () => void) => {
  const query = window.matchMedia("(min-width: 1024px)");
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
};

const getDesktopViewportSnapshot = () => window.matchMedia("(min-width: 1024px)").matches;
const subscribeToViewportWidth = (onChange: () => void) => {
  window.addEventListener("resize", onChange);
  return () => window.removeEventListener("resize", onChange);
};
const getViewportWidth = () => window.innerWidth;

export type RuntimeState = "IDLE" | "SAVING" | "STARTING" | "RUNNING" | "FAILED" | "STOPPED";

type Props = {
  problemId: string;
  productName?: string;
  problemData?: ProblemData | null;
  onReadyChange?: (ready: boolean) => void;
  onBackToJourney?: () => void;
  onComplete?: () => void;
  userId?: string;
};

const ROADMAP_PHASES = [
  {
    name: "Foundation & Setup",
    purpose: "Establish the product foundation.",
    matches: /\b(shell|foundation|setup|requirements?|problem definition|target audience|objectives?)\b/i,
  },
  {
    name: "Design & Architecture",
    purpose: "Define the experience and technical architecture.",
    matches: /\b(design|architecture|user flows?|information architecture|ui\/ux|wireframes?|technology decisions?|navbar|brand|hero)\b/i,
  },
  {
    name: "Core Features",
    purpose: "Build the essential product functionality.",
    matches: /\b(core|feature|form|list|detail|component|interface|interaction|business logic)\b/i,
  },
  {
    name: "Authentication & Integrations",
    purpose: "Connect identity, data, and external services.",
    matches: /\b(auth|sign.?in|authorization|database|api|integrat|external service|persist|sync)\b/i,
  },
  {
    name: "Dashboard & Workflows",
    purpose: "Complete the product's end-to-end workflows.",
    matches: /\b(dashboard|workflow|management|data handling|automation|application interaction)\b/i,
  },
  {
    name: "Polish & Deploy",
    purpose: "Prepare the product for release.",
    matches: /\b(polish|test|responsive|performance|bug|deploy|release|empty state)\b/i,
  },
] as const;

function getRoadmapPhaseIndex(mission: BuildMission): number {
  const taskText = `${mission.title} ${mission.whatThisMeans}`;
  if (ROADMAP_PHASES[5].matches.test(taskText)) return 5;
  if (ROADMAP_PHASES[3].matches.test(taskText)) return 3;
  if (ROADMAP_PHASES[4].matches.test(taskText)) return 4;
  if (ROADMAP_PHASES[1].matches.test(taskText)) return 1;
  if (ROADMAP_PHASES[0].matches.test(taskText)) return 0;
  return 2;
}

function flattenFiles(nodes: FileNode[], acc: string[] = []): string[] {
  for (const n of nodes) {
    if (n.type === "file") acc.push(n.path);
    else flattenFiles(n.children, acc);
  }
  return acc;
}

function stableProposalId(planId: string, stepId: string, filePath: string, code: string): string {
  const value = `${planId}\0${stepId}\0${filePath}\0${code}`;
  let hash = 2166136261;
  for (let index = 0; index < value.length; index++) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return `proposal-${(hash >>> 0).toString(16)}`;
}

function FileTree({
  nodes,
  active,
  onOpen,
  depth = 0,
}: {
  nodes: FileNode[];
  active: string;
  onOpen: (path: string) => void;
  depth?: number;
}) {
  if (nodes.length === 0) {
    return <p className="px-2 py-3 text-[11px] text-zinc-500">No workspace files found.</p>;
  }

  return (
    <ul className="space-y-0.5">
      {nodes.map((n) =>
        n.type === "dir" ? (
          <li key={n.path}>
            <div
              className="flex items-center gap-1.5 px-2 py-1 text-[11px] text-zinc-400 font-mono"
              style={{ paddingLeft: 8 + depth * 10 }}
            >
              <Folder className="h-3 w-3 text-green-500/80" />
              {n.name}
            </div>
            <FileTree nodes={n.children} active={active} onOpen={onOpen} depth={depth + 1} />
          </li>
        ) : (
          <li key={n.path}>
            <button
              type="button"
              onClick={() => onOpen(n.path)}
              className={`w-full flex items-center gap-1.5 px-2 py-1.5 text-left text-[11px] font-mono rounded ${
                active === n.path
                  ? "bg-green-900/50 text-green-200 font-semibold"
                  : "text-zinc-400 hover:bg-zinc-800/80 hover:text-zinc-200"
              }`}
              style={{ paddingLeft: 8 + depth * 10 }}
            >
              <FileCode className="h-3 w-3 shrink-0" />
              <span className="truncate">{n.name}</span>
            </button>
          </li>
        )
      )}
    </ul>
  );
}

type ResizeOrientation = "vertical" | "horizontal";

function PanelResizeHandle({
  orientation,
  label,
  value,
  min,
  max,
  reverseKeyboard = false,
  onResizeStart,
  onResizeBy,
  onReset,
}: {
  orientation: ResizeOrientation;
  label: string;
  value: number;
  min: number;
  max: number;
  reverseKeyboard?: boolean;
  onResizeStart: (event: React.PointerEvent<HTMLDivElement>) => void;
  onResizeBy: (delta: number) => void;
  onReset: () => void;
}) {
  const vertical = orientation === "vertical";

  return (
    <div
      role="separator"
      tabIndex={0}
      aria-label={label}
      aria-orientation={orientation}
      aria-valuenow={Math.round(value)}
      aria-valuemin={min}
      aria-valuemax={max}
      onPointerDown={onResizeStart}
      onDoubleClick={onReset}
      onKeyDown={(event) => {
        const key = event.key;
        if (key === "Home") {
          event.preventDefault();
          onReset();
          return;
        }

        const positiveKey = vertical ? "ArrowRight" : "ArrowUp";
        const negativeKey = vertical ? "ArrowLeft" : "ArrowDown";
        if (key !== positiveKey && key !== negativeKey) return;
        event.preventDefault();
        const direction = key === positiveKey ? 1 : -1;
        onResizeBy(direction * 24 * (reverseKeyboard ? -1 : 1));
      }}
      className={`group relative z-10 shrink-0 touch-none outline-none focus-visible:bg-emerald-500/30 ${
        vertical ? "w-1.5 cursor-col-resize" : "h-1.5 cursor-row-resize"
      }`}
      style={{ touchAction: "none" }}
    >
      <span
        aria-hidden="true"
        className={`absolute rounded-full bg-[#39433C] transition-colors group-hover:bg-emerald-500 group-focus-visible:bg-emerald-400 ${
          vertical ? "inset-y-0 left-[2px] w-[2px]" : "inset-x-0 top-[2px] h-[2px]"
        }`}
      />
    </div>
  );
}

function PreviewPane({
  previewHtml,
  runtimeState,
  runError,
  isRunInProgress,
  previewKey,
  previewRef,
  deviceMode,
  runProject,
  refreshPreview,
}: {
  previewHtml: string | null;
  runtimeState: RuntimeState;
  runError: string | null;
  isRunInProgress: boolean;
  previewKey: number;
  previewRef: React.RefObject<HTMLIFrameElement | null>;
  deviceMode: "desktop" | "tablet" | "mobile";
  runProject: () => void;
  refreshPreview: () => void;
}) {
  return (
    <div className="relative flex h-full min-h-0 min-w-0 justify-center overflow-auto bg-[#090B0A] p-2">
      <div
        className={`h-full min-h-0 shrink-0 overflow-hidden rounded bg-white shadow-lg transition-[width] duration-200 ${
          deviceMode === "mobile"
            ? "w-[375px] max-w-full"
            : deviceMode === "tablet"
            ? "w-[768px] max-w-full"
            : "w-full"
        }`}
      >
        {previewHtml && runtimeState !== "FAILED" ? (
          <iframe
            key={previewKey}
            ref={previewRef}
            srcDoc={previewHtml}
            title="BuildOS Preview Sandbox"
            className="h-full w-full border-none"
            sandbox="allow-scripts allow-modals"
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center bg-[#101310] p-6 text-center text-zinc-400">
            {runtimeState === "FAILED" ? (
              <>
                <AlertTriangle className="mb-2 h-7 w-7 text-rose-400" />
                <p className="text-xs font-semibold text-rose-200">Preview did not start</p>
                <p className="mt-1 max-w-sm text-[11px] text-zinc-400">{runError || "Review the Console for details, then try again."}</p>
                <button type="button" onClick={runProject} className="mt-3 rounded border border-zinc-700 px-3 py-1.5 text-[11px] text-zinc-200 hover:bg-zinc-800">Try again</button>
              </>
            ) : isRunInProgress ? (
              <>
                <Loader2 className="mb-2 h-6 w-6 animate-spin text-green-400" />
                <p className="text-xs font-semibold text-zinc-200">Preparing preview…</p>
                <p className="mt-1 max-w-sm text-[11px] text-zinc-500">BuildOS is validating files and loading the browser preview.</p>
              </>
            ) : (
              <>
                <Play className="mb-2 h-7 w-7 text-zinc-500" />
                <p className="text-xs font-semibold text-zinc-300">Run the project to open a preview</p>
                <p className="mt-1 max-w-sm text-[11px] text-zinc-500">
                  This is a browser-based React preview, not a full Next.js server.
                </p>
              </>
            )}
          </div>
        )}
      </div>
      <button
        type="button"
        onClick={refreshPreview}
        disabled={!previewHtml || runtimeState === "FAILED"}
        aria-label="Refresh preview"
        title="Refresh preview"
        className="absolute right-4 top-4 rounded border border-zinc-700 bg-[#101310] p-1.5 text-zinc-300 hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-40"
      >
        <RefreshCw className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

export default function BuildOS({ problemId, productName: propName, problemData, onReadyChange, onBackToJourney, onComplete, userId: propUserId }: Props) {
  const userId = useMemo(() => propUserId || getJourneyUserId(), [propUserId]);
  const workspace = useMemo(() => deriveBuildWorkspace(problemData), [problemData]);
  const isDesktop = useSyncExternalStore(subscribeToDesktopViewport, getDesktopViewportSnapshot, () => false);
  const viewportWidth = useSyncExternalStore(subscribeToViewportWidth, getViewportWidth, () => 0);
  const productName = propName || workspace.productName;

  // Determine difficulty level: Beginner, Intermediate, or Advanced
  const difficulty = useMemo<"Beginner" | "Intermediate" | "Advanced">(() => {
    const raw = (problemData?.difficulty || (problemData as any)?.learning?.level || "Beginner").toString().toLowerCase();
    if (raw.includes("adv") || raw.includes("expert")) return "Advanced";
    if (raw.includes("inter")) return "Intermediate";
    return "Beginner";
  }, [problemData]);

  // Build mode derived from difficulty (can later be from DB student profile)
  const buildMode = useMemo<"guided" | "assisted" | "independent">(() => {
    if (difficulty === "Advanced") return "independent";
    if (difficulty === "Intermediate") return "assisted";
    return "guided";
  }, [difficulty]);

  // Entire Previous Journey Context (Phases 1 - 4)
  const [journeyPhases, setJourneyPhases] = useState<any>(null);
  const [journeyLoading, setJourneyLoading] = useState(true);
  const [showBlueprint, setShowBlueprint] = useState(false);

  const [phase, setPhase] = useState<"booting" | "ready" | "error">("booting");
  const [logs, setLogs] = useState<string[]>(["Preparing BuildOS workspace..."]);
  const [tree, setTree] = useState<FileNode[]>([]);
  const [activePath, setActivePath] = useState("app/page.tsx");
  const [content, setContent] = useState("");
  const latestEditorContent = useRef("");
  const updateEditorContent = useCallback((nextContent: string) => {
    latestEditorContent.current = nextContent;
    setContent(nextContent);
  }, []);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);

  // Runtime State Machine
  const [runtimeState, setRuntimeState] = useState<RuntimeState>("IDLE");
  const [previewHtml, setPreviewHtml] = useState<string | null>(null);
  const [previewKey, setPreviewKey] = useState<number>(0);
  const [runError, setRunError] = useState<string | null>(null);

  // Active step / mission state
  const [activeMissionIndex, setActiveMissionIndex] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [dependencyBlockedSteps, setDependencyBlockedSteps] = useState<number[]>([]);
  const [validationResult, setValidationResult] = useState<{ ok: boolean; failures: string[] } | null>(null);

  // UI Panels & IDE State
  const [desktopExplorerOpen, setDesktopExplorerOpen] = useState(true);
  const [mobileExplorerOpen, setMobileExplorerOpen] = useState(false);
  const [desktopNovaPanelOpen, setDesktopNovaPanelOpen] = useState(true);
  const [mobileNovaPanelOpen, setMobileNovaPanelOpen] = useState(false);
  const showExplorer = isDesktop ? desktopExplorerOpen : mobileExplorerOpen;
  const showNovaPanel = isDesktop ? desktopNovaPanelOpen : mobileNovaPanelOpen;
  const [showRoadmapSection, setShowRoadmapSection] = useState(true);
  const [expandedRoadmapPhase, setExpandedRoadmapPhase] = useState<number | null>(null);
  const [roadmapHeight, setRoadmapHeight] = useState(48);
  const [explorerWidth, setExplorerWidth] = useState(320);
  const [novaPanelWidth, setNovaPanelWidth] = useState(360);
  const [bottomPanelHeight, setBottomPanelHeight] = useState(200);
  const [bottomPanelOpen, setBottomPanelOpen] = useState(true);
  const layoutKey = `buildos:layout:v1:${problemId || "default"}`;
  const [loadedLayoutKey, setLoadedLayoutKey] = useState<string | null>(null);
  const workspaceLayoutRef = useRef<HTMLDivElement>(null);
  const explorerPanelRef = useRef<HTMLElement>(null);
  const mainWorkspaceRef = useRef<HTMLElement>(null);
  const resizeCleanupRef = useRef<(() => void) | null>(null);
  const workspaceWidth = workspaceLayoutRef.current?.clientWidth || viewportWidth;
  const maxExplorerWidth = Math.max(
    260,
    Math.min(480, workspaceWidth - 320 - (showNovaPanel ? 280 : 0) - 12)
  );
  const displayedExplorerWidth = Math.min(explorerWidth, maxExplorerWidth);
  const maxNovaPanelWidth = Math.max(
    280,
    Math.min(480, workspaceWidth - 320 - (showExplorer ? displayedExplorerWidth : 0) - 12)
  );
  const displayedNovaPanelWidth = Math.min(novaPanelWidth, maxNovaPanelWidth);
  const [openTabs, setOpenTabs] = useState<string[]>(["app/page.tsx"]);
  const [activeConsoleTab, setActiveConsoleTab] = useState<"problems" | "console" | "terminal" | "tests" | "build">("console");
  const [workspaceMode, setWorkspaceMode] = useState<"code" | "preview" | "split">("split");
  const [splitRatio, setSplitRatio] = useState(50);
  const [deviceMode, setDeviceMode] = useState<"desktop" | "tablet" | "mobile">("desktop");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      try {
        const saved = window.localStorage.getItem(layoutKey);
        if (saved) {
          const layout = JSON.parse(saved) as Record<string, unknown>;
          if (typeof layout.explorerWidth === "number" && Number.isFinite(layout.explorerWidth)) {
            setExplorerWidth(Math.min(480, Math.max(260, layout.explorerWidth)));
          }
          if (typeof layout.novaPanelWidth === "number" && Number.isFinite(layout.novaPanelWidth)) {
            setNovaPanelWidth(Math.min(480, Math.max(280, layout.novaPanelWidth)));
          }
          if (typeof layout.bottomPanelHeight === "number" && Number.isFinite(layout.bottomPanelHeight)) {
            setBottomPanelHeight(Math.min(520, Math.max(150, layout.bottomPanelHeight)));
          }
          if (typeof layout.explorerOpen === "boolean") setDesktopExplorerOpen(layout.explorerOpen);
          if (typeof layout.novaOpen === "boolean") setDesktopNovaPanelOpen(layout.novaOpen);
          if (typeof layout.roadmapOpen === "boolean") setShowRoadmapSection(layout.roadmapOpen);
          if (typeof layout.roadmapHeight === "number" && Number.isFinite(layout.roadmapHeight)) {
            setRoadmapHeight(Math.min(70, Math.max(30, layout.roadmapHeight)));
          }
          if (typeof layout.bottomPanelOpen === "boolean") setBottomPanelOpen(layout.bottomPanelOpen);
          if (typeof layout.expandedRoadmapPhase === "number" && layout.expandedRoadmapPhase >= -1 && layout.expandedRoadmapPhase < ROADMAP_PHASES.length) {
            setExpandedRoadmapPhase(layout.expandedRoadmapPhase);
          }
        }
      } catch (error) {
        console.warn("[BuildOS] Could not restore workspace panel preferences.", {
          errorName: error instanceof Error ? error.name : "UnknownError",
        });
      }
      setLoadedLayoutKey(layoutKey);
    });
    return () => window.cancelAnimationFrame(frame);
  }, [layoutKey]);

  useEffect(() => {
    if (loadedLayoutKey !== layoutKey) return;
    const timer = window.setTimeout(() => {
      try {
        window.localStorage.setItem(
          layoutKey,
          JSON.stringify({
            explorerWidth,
            novaPanelWidth,
            bottomPanelHeight,
            explorerOpen: desktopExplorerOpen,
            novaOpen: desktopNovaPanelOpen,
            roadmapOpen: showRoadmapSection,
            roadmapHeight,
            expandedRoadmapPhase,
            bottomPanelOpen,
          })
        );
      } catch (error) {
        console.warn("[BuildOS] Could not save workspace panel preferences.", {
          errorName: error instanceof Error ? error.name : "UnknownError",
        });
      }
    }, 200);
    return () => window.clearTimeout(timer);
  }, [
    bottomPanelHeight,
    bottomPanelOpen,
    desktopExplorerOpen,
    desktopNovaPanelOpen,
    expandedRoadmapPhase,
    explorerWidth,
    layoutKey,
    loadedLayoutKey,
    novaPanelWidth,
    roadmapHeight,
    showRoadmapSection,
  ]);

  const resizePanelBy = useCallback((panel: "explorer" | "nova" | "console" | "split" | "roadmap", delta: number) => {
    if (panel === "explorer") {
      const availableWidth = workspaceLayoutRef.current?.clientWidth ?? window.innerWidth;
      const maxWidth = Math.max(
        260,
        Math.min(480, availableWidth - 320 - (showNovaPanel ? 280 : 0) - 12)
      );
      setExplorerWidth(Math.min(maxWidth, Math.max(260, displayedExplorerWidth + delta)));
      return;
    }

    if (panel === "nova") {
      const availableWidth = workspaceLayoutRef.current?.clientWidth ?? window.innerWidth;
      const maxWidth = Math.max(
        280,
        Math.min(480, availableWidth - 320 - (showExplorer ? displayedExplorerWidth : 0) - 12)
      );
      setNovaPanelWidth(Math.min(maxWidth, Math.max(280, displayedNovaPanelWidth + delta)));
      return;
    }

    if (panel === "split") {
      const availableWidth = mainWorkspaceRef.current?.clientWidth ?? window.innerWidth;
      setSplitRatio((ratio) => Math.min(70, Math.max(30, ratio + (delta / availableWidth) * 100)));
      return;
    }

    if (panel === "roadmap") {
      const availableHeight = explorerPanelRef.current?.clientHeight ?? window.innerHeight;
      setRoadmapHeight((height) => Math.min(70, Math.max(30, height + (delta / availableHeight) * 100)));
      return;
    }

    const availableHeight = mainWorkspaceRef.current?.clientHeight ?? window.innerHeight;
    const maxHeight = Math.max(150, Math.min(520, availableHeight - 180));
    setBottomPanelHeight((height) => Math.min(maxHeight, Math.max(150, height + delta)));
  }, [displayedExplorerWidth, displayedNovaPanelWidth, showExplorer, showNovaPanel]);

  const beginPanelResize = useCallback((
    panel: "explorer" | "nova" | "console" | "split" | "roadmap",
    event: React.PointerEvent<HTMLDivElement>
  ) => {
    event.preventDefault();
    resizeCleanupRef.current?.();

    const startX = event.clientX;
    const startY = event.clientY;
    const startExplorerWidth = displayedExplorerWidth;
    const startNovaWidth = displayedNovaPanelWidth;
    const startBottomHeight = bottomPanelHeight;
    const startSplitRatio = splitRatio;
    const startRoadmapHeight = roadmapHeight;
    const previousCursor = document.body.style.cursor;
    const previousUserSelect = document.body.style.userSelect;
    document.body.style.cursor = panel === "console" ? "row-resize" : "col-resize";
    document.body.style.userSelect = "none";

    const move = (moveEvent: PointerEvent) => {
      if (panel === "explorer") {
        const availableWidth = workspaceLayoutRef.current?.clientWidth ?? window.innerWidth;
        const maxWidth = Math.max(
          260,
          Math.min(480, availableWidth - 320 - (showNovaPanel ? 280 : 0) - 12)
        );
        setExplorerWidth(Math.min(maxWidth, Math.max(260, startExplorerWidth + moveEvent.clientX - startX)));
      } else if (panel === "nova") {
        const availableWidth = workspaceLayoutRef.current?.clientWidth ?? window.innerWidth;
        const maxWidth = Math.max(
          280,
          Math.min(480, availableWidth - 320 - (showExplorer ? displayedExplorerWidth : 0) - 12)
        );
        setNovaPanelWidth(Math.min(maxWidth, Math.max(280, startNovaWidth + startX - moveEvent.clientX)));
      } else if (panel === "split") {
        const availableWidth = mainWorkspaceRef.current?.clientWidth ?? window.innerWidth;
        const nextRatio = startSplitRatio + ((moveEvent.clientX - startX) / availableWidth) * 100;
        setSplitRatio(Math.min(70, Math.max(30, nextRatio)));
      } else if (panel === "roadmap") {
        const availableHeight = explorerPanelRef.current?.clientHeight ?? window.innerHeight;
        const nextHeight = startRoadmapHeight + ((moveEvent.clientY - startY) / availableHeight) * 100;
        setRoadmapHeight(Math.min(70, Math.max(30, nextHeight)));
      } else {
        const availableHeight = mainWorkspaceRef.current?.clientHeight ?? window.innerHeight;
        const maxHeight = Math.max(150, Math.min(520, availableHeight - 180));
        setBottomPanelHeight(Math.min(maxHeight, Math.max(150, startBottomHeight + startY - moveEvent.clientY)));
      }
    };

    const cleanup = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", cleanup);
      window.removeEventListener("pointercancel", cleanup);
      window.removeEventListener("blur", cleanup);
      document.body.style.cursor = previousCursor;
      document.body.style.userSelect = previousUserSelect;
      if (resizeCleanupRef.current === cleanup) resizeCleanupRef.current = null;
    };

    resizeCleanupRef.current = cleanup;
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", cleanup);
    window.addEventListener("pointercancel", cleanup);
    window.addEventListener("blur", cleanup);
  }, [
    bottomPanelHeight,
    displayedExplorerWidth,
    displayedNovaPanelWidth,
    roadmapHeight,
    splitRatio,
    showExplorer,
    showNovaPanel,
  ]);

  useEffect(() => () => resizeCleanupRef.current?.(), []);

  // Nova AI Chat & Code Proposals State
  const [proposalStatuses, setProposalStatuses] = useState<Record<string, ProposalStatus>>({});
  const [proposalBases, setProposalBases] = useState<Record<string, string | null>>({});
  const [proposalBaseErrors, setProposalBaseErrors] = useState<Record<string, string>>({});
  const [proposalPlanSteps, setProposalPlanSteps] = useState<Record<string, string>>({});
  const [applyingProposal, setApplyingProposal] = useState<string | null>(null);
  const [novaMode, setNovaMode] = useState<NovaMode>("UNDERSTAND");
  const [saveError, setSaveError] = useState<string | null>(null);
  const [novaMessages, setNovaMessages] = useState<Array<{ role: "user" | "assistant"; content: string }>>([
    {
      role: "assistant",
      content: `Welcome to **${workspace.productName}**. I'm Nova, your AI build mentor. Ask me about your current task, or choose Plan, Build, Understand, or Debug to get started.`,
    },
  ]);
  const [novaConversationId, setNovaConversationId] = useState<string | null>(null);
  const [novaConversationReadyFor, setNovaConversationReadyFor] = useState<string | null>(null);
  const [implementationPlan, setImplementationPlan] = useState<NovaImplementationPlan | null>(null);
  const novaConversationReady = novaConversationReadyFor === problemId;
  const [novaInput, setNovaInput] = useState("");
  const [novaLoading, setNovaLoading] = useState(false);

  useEffect(() => {
    let active = true;

    async function loadConversation() {
      try {
        const response = await fetch(`/api/nova/chat?problemId=${encodeURIComponent(problemId)}`);
        const data = await response.json();
        if (!response.ok || !data?.ok || typeof data.conversationId !== "string" || !Array.isArray(data.messages)) {
          throw new Error(data?.error || "Could not load Nova conversation.");
        }
        if (!active) return;
        setNovaConversationId(data.conversationId);
        setImplementationPlan(
          data.implementationPlan && typeof data.implementationPlan === "object"
            ? data.implementationPlan as NovaImplementationPlan
            : null
        );
        if (data.messages.length > 0) {
          setNovaMessages(data.messages
            .filter((message: unknown) =>
              Boolean(
                message &&
                typeof message === "object" &&
                ["user", "assistant"].includes((message as { role?: string }).role || "") &&
                typeof (message as { content?: unknown }).content === "string"
              )
            )
            .map((message: { role: "user" | "assistant"; content: string }) => ({
              role: message.role,
              content: message.content,
            })));
        } else {
          setNovaMessages([{
            role: "assistant",
            content: `Welcome to **${workspace.productName}**. I'm Nova, your AI build mentor. Ask me about your current task, or choose Plan, Build, Understand, or Debug to get started.`,
          }]);
        }
      } catch (error) {
        if (!active) return;
        console.error("[BuildOS] Could not restore Nova conversation.", error);
        setNovaConversationId(null);
        setNovaMessages([{
          role: "assistant",
          content: `Welcome to **${workspace.productName}**. I'm Nova, your AI build mentor. Ask me about your current task, or choose Plan, Build, Understand, or Debug to get started.`,
        }]);
      } finally {
        if (active) setNovaConversationReadyFor(problemId);
      }
    }

    void loadConversation();
    return () => {
      active = false;
    };
  }, [problemId, workspace.productName]);

  // Fetch full journey data (Phases 1-4) on mount
  useEffect(() => {
    let isMounted = true;
    async function loadJourneyContext() {
      const pid = problemId || problemData?.problemId || (problemData as any)?.id;
      if (!pid) {
        if (isMounted) setJourneyLoading(false);
        return;
      }

      // 1. Try localStorage cache for instant availability
      try {
        const rawLocal = localStorage.getItem(`make_mistakes_phases_${pid}`) || localStorage.getItem(`journey_phases_${pid}`);
        if (rawLocal) {
          const parsed = JSON.parse(rawLocal);
          if (isMounted && parsed) setJourneyPhases(parsed);
        }
      } catch {
        // ignore storage parse errors
      }

      // 2. Fetch authoritative state from DB
      try {
        const effectiveUid = propUserId || userId || getJourneyUserId();
        const res = await fetch(`/api/journey/user-data?userId=${encodeURIComponent(effectiveUid)}&problemId=${encodeURIComponent(pid)}`);
        if (res.ok) {
          const data = await res.json();
          if (data?.phases && isMounted) {
            setJourneyPhases(data.phases);
          }
        }
      } catch (err) {
        console.error("Failed to load journey context in BuildOS:", err);
      } finally {
        if (isMounted) setJourneyLoading(false);
      }
    }

    loadJourneyContext();
    return () => {
      isMounted = false;
    };
  }, [problemId, problemData?.problemId, propUserId, userId]);

  // Personalize Nova initial greeting once journey blueprint is loaded
  const hasPersonalizedGreeting = useRef(false);
  useEffect(() => {
    if (!novaConversationReady) return;
    if (!journeyPhases && journeyLoading) return;
    if (hasPersonalizedGreeting.current) return;
    hasPersonalizedGreeting.current = true;

    const welcome = {
      role: "assistant" as const,
      content: buildMode === "guided"
        ? `I'm here to help you learn as you build. I'll explain concepts, offer hints, and help debug without skipping the work you're here to practice.`
        : buildMode === "assisted"
          ? `You lead the implementation, and I'll help with architecture, debugging, and focused code proposals when useful.`
          : `You own the implementation. I'll help review your approach, uncover edge cases, and discuss trade-offs.`,
    };
    setNovaMessages((messages) =>
      messages.length === 1 && messages[0].role === "assistant" ? [welcome] : messages
    );
  }, [journeyPhases, journeyLoading, buildMode, novaConversationReady]);

  const parseNovaProposals = useCallback((text: string, messageIndex = 0) => {
    if (!text) return [];
    const proposals: Array<{ id: string; filePath: string; code: string }> = [];
    const regex = /```(?:tsx|jsx|typescript|javascript|ts|js)?[\r\n]+([\s\S]*?)```/g;
    let match;
    while ((match = regex.exec(text)) !== null) {
      const rawCode = match[1] || "";
      const fileHeaderMatch = rawCode.match(/(?:\/\/|\/\*)\s*FILE:\s*([^\r\n]+)/i);
      let filePath = "";
      if (fileHeaderMatch) {
        filePath = fileHeaderMatch[1].trim();
      } else {
        const lineMatch = rawCode.match(/^[\/\#\*]*\s*([a-zA-Z0-9_\-\/]+\.(?:tsx|ts|jsx|js|css|json))/m);
        if (lineMatch) filePath = lineMatch[1].trim();
      }

      if (filePath && rawCode.trim().length > 10) {
        proposals.push({
          id: stableProposalId(
            novaConversationId || "unplanned",
            String(messageIndex),
            filePath,
            rawCode
          ),
          filePath,
          code: rawCode
            .replace(/^\s*(?:\/\/|\/\*)\s*FILE:\s*[^\r\n]+\r?\n/i, "")
            .trim(),
        });
      }
    }
    return implementationPlan ? proposals.slice(0, 1) : proposals;
  }, [implementationPlan, novaConversationId]);

  useEffect(() => {
    const step = implementationPlan?.steps.find(
      (candidate) => candidate.id === implementationPlan.currentStepId
    );
    if (!step?.proposalId) return;
    for (const [messageIndex, message] of novaMessages.entries()) {
      if (message.role !== "assistant") continue;
      const proposal = parseNovaProposals(message.content, messageIndex)
        .find((candidate) => candidate.id === step.proposalId);
      if (proposal) {
        setProposalPlanSteps((previous) =>
          previous[proposal.id] === step.id
            ? previous
            : { ...previous, [proposal.id]: step.id }
        );
        setProposalStatuses((previous) =>
          previous[proposal.id]
            ? previous
            : {
                ...previous,
                [proposal.id]: ["executing", "completed", "validation_failed"].includes(step.status)
                  ? "applied"
                  : "pending",
              }
        );
        break;
      }
    }
  }, [implementationPlan, novaMessages, parseNovaProposals]);

  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const previewRef = useRef<HTMLIFrameElement>(null);
  const chatScrollRef = useRef<HTMLDivElement>(null);
  const shouldAutoScrollChatRef = useRef(true);

  useEffect(() => {
    if (!shouldAutoScrollChatRef.current) return;
    const frame = window.requestAnimationFrame(() => {
      const container = chatScrollRef.current;
      if (container) container.scrollTo({ top: container.scrollHeight, behavior: "smooth" });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [novaMessages, novaLoading]);

  const activeMission: BuildMission = workspace.missions[activeMissionIndex] || workspace.missions[0];
  const activeNovaConversationId = novaConversationReady ? novaConversationId : null;
  const displayedNovaMessages = novaConversationReady
    ? novaMessages
    : [{
        role: "assistant" as const,
        content: `Welcome to **${workspace.productName}**. I'm Nova, your AI build mentor. Ask me about your current task, or choose Plan, Build, Understand, or Debug to get started.`,
      }];
  const roadmapPhases = useMemo(
    () => ROADMAP_PHASES.map((phaseDefinition, phaseIndex) => ({
      ...phaseDefinition,
      index: phaseIndex,
      missions: workspace.missions
        .map((mission, missionIndex) => ({ mission, missionIndex }))
        .filter(({ mission }) => getRoadmapPhaseIndex(mission) === phaseIndex),
    })),
    [workspace.missions]
  );
  const activeRoadmapPhaseIndex = Math.max(
    0,
    roadmapPhases.findIndex(({ missions }) => missions.some(({ missionIndex }) => missionIndex === activeMissionIndex))
  );
  const completedMissionCount = completedSteps.filter((id) => workspace.missions.some((mission) => mission.id === id)).length;

  const pushLog = useCallback((line: string) => {
    setLogs((prev) => [...prev.slice(-80), line]);
  }, []);

  const saveFile = useCallback(async () => {
    setSaving(true);
    setSaveError(null);
    try {
      const res = await fetch("/api/buildos/files", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, problemId, path: activePath, content }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Save failed");
      if (latestEditorContent.current === content) setDirty(false);
      pushLog(`Saved ${activePath}`);
      return true;
    } catch (err: any) {
      const message = err.message || "Save failed";
      setSaveError(message);
      pushLog(`Save failed: ${message}`);
      return false;
    } finally {
      setSaving(false);
    }
  }, [userId, problemId, activePath, content, pushLog]);

  const persistImplementationStatus = async (
    stepId: string,
    status: ImplementationStepStatus,
    proposal?: { id: string; content?: string }
  ) => {
    if (!activeNovaConversationId) throw new Error("Nova conversation is not ready.");
    const response = await fetch("/api/nova/implementation", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        problemId,
        conversationId: activeNovaConversationId,
        stepId,
        status,
        proposalId: proposal?.id,
        proposalContent: proposal?.content,
      }),
    });
    const data = await response.json();
    if (!response.ok || !data.ok) {
      throw new Error(data.error || "Could not save implementation progress.");
    }
    setImplementationPlan(data.implementationPlan);
  };

  const applyNovaProposal = async (proposal: { id: string; filePath: string; code: string }) => {
    const proposedAgainst = proposalBases[proposal.id];
    if (proposedAgainst === undefined || proposalBaseErrors[proposal.id]) return;
    if (activePath === proposal.filePath && content !== proposedAgainst) {
      alert("This file changed after Nova prepared the proposal. Ask Nova for a revision before applying it.");
      return;
    }
    if (dirty && !(await saveFile())) return;

    setApplyingProposal(proposal.id);
    try {
      const stepId = proposalPlanSteps[proposal.id];
      if (stepId) {
        await persistImplementationStatus(stepId, "approved", { id: proposal.id });
        await persistImplementationStatus(stepId, "executing", { id: proposal.id });
      }
      const res = await fetch("/api/buildos/files", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          problemId,
          path: proposal.filePath,
          content: proposal.code,
          source: "nova_approved",
          ...(stepId ? {
            implementation: {
              conversationId: activeNovaConversationId,
              stepId,
              proposalId: proposal.id,
            },
          } : {}),
        }),
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        alert(`Failed to apply proposal: ${data.error || "Unknown error"}`);
        return;
      }

      if (!openTabs.includes(proposal.filePath)) {
        setOpenTabs((prev) => [...prev, proposal.filePath]);
      }
      setActivePath(proposal.filePath);
      updateEditorContent(proposal.code);
      setDirty(false);

      setProposalStatuses((prev) => ({ ...prev, [proposal.id]: "applied" }));
      setSaveError(null);

      const treeRes = await fetch(
        `/api/buildos/files?userId=${encodeURIComponent(userId)}&problemId=${encodeURIComponent(problemId)}`
      );
      if (treeRes.ok) {
        const treeData = await treeRes.json();
        if (treeData.tree) setTree(treeData.tree);
      }

      setLogs((prev) => [...prev, `[${new Date().toLocaleTimeString()}] ✓ Applied Nova code proposal to ${proposal.filePath}`]);
    } catch (err) {
      alert(`Failed to apply proposal: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setApplyingProposal(null);
    }
  };

  const activeRunIdRef = useRef<number>(0);
  const activeRunTaskIdRef = useRef<number>(activeMission.id);

  // Controlled, deterministic Run handler (MUST NOT BE CALLED AUTOMATICALLY)
  const runProject = useCallback(async () => {
    // Prevent duplicate concurrent runs
    if (runtimeState === "SAVING" || runtimeState === "STARTING") {
      return;
    }

    const currentRunId = Date.now();
    activeRunIdRef.current = currentRunId;
    activeRunTaskIdRef.current = activeMission.id;

    setRuntimeState("SAVING");
    setRunError(null);
    setLogs((prev) => [...prev.filter((l) => !l.startsWith("✓") && !l.startsWith("Error:") && !l.startsWith("Build failed")), `--- Run Execution ---`, "Saving workspace files..."]);

    // Save the active file before running; do not report a run after a failed save.
    const currentWorkspaceFiles: Record<string, string> = {};
    if (activePath && content !== undefined) {
      if (dirty && !(await saveFile())) {
        setRuntimeState("FAILED");
        setRunError("Could not save the active file. Resolve the save error before running.");
        return;
      }
      currentWorkspaceFiles[activePath] = content;
    }

    setRuntimeState("STARTING");

    // 2. Execute build & compile preview payload using user's current workspace
    try {
      const res = await fetch("/api/buildos/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          problemId,
          taskId: activeMission.id,
          runId: currentRunId,
          files: currentWorkspaceFiles,
        }),
      });
      const data = await res.json();

      if (activeRunIdRef.current !== currentRunId) return; // Stale run check

      if (!data.ok) {
        setRuntimeState("FAILED");
        setActiveConsoleTab("problems");
        setRunError(data.error || "Build failed");
        pushLog(data.error || "Build failed");
        return;
      }

      setPreviewHtml(data.previewHtml);
      setPreviewKey(Date.now());
      setRuntimeState("STARTING");
      (data.logs || []).forEach((l: string) => pushLog(l));
    } catch (err: any) {
      if (activeRunIdRef.current !== currentRunId) return;
      setRuntimeState("FAILED");
      setActiveConsoleTab("problems");
      setRunError(err.message || String(err));
      pushLog(err.message || String(err));
    }
  }, [userId, problemId, activePath, activeMission.id, content, dirty, runtimeState, pushLog, saveFile]);

  // Handle postMessage events from preview iframe sandbox
  useEffect(() => {
    const handlePreviewMessage = (event: MessageEvent) => {
      const data = event.data;
      if (!data || data.source !== "makemistakes-buildos-preview") return;
      if (!previewRef.current || event.source !== previewRef.current.contentWindow) return;

      // Filter out stale events from previous run executions
      if (data.runId && activeRunIdRef.current > 0 && String(data.runId) !== String(activeRunIdRef.current)) return;

      if (data.type === "ready") {
        setRuntimeState("RUNNING");
        pushLog("✓ Project running");
        pushLog("✓ Preview ready");
        void fetch("/api/nova/activity", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            problemId,
            taskId: activeRunTaskIdRef.current,
            type: "preview_ready",
            runId: String(data.runId || ""),
          }),
        }).then(async (response) => {
          if (!response.ok) console.warn("[BuildOS] Could not persist preview-ready history.");
        }).catch((error) => console.warn("[BuildOS] Could not persist preview-ready history.", error));
      } else if (data.type === "error") {
        setRuntimeState("FAILED");
        setActiveConsoleTab("problems");
        const name = data.name || "RuntimeError";
        const msg = data.message || "An unhandled JavaScript exception occurred in preview.";
        const fullErr = `Runtime Error (${name}): ${msg}`;
        setRunError(fullErr);
        pushLog(`Error: ${fullErr}`);
        void fetch("/api/nova/activity", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            problemId,
            taskId: activeRunTaskIdRef.current,
            type: "runtime_error",
            runId: String(data.runId || ""),
            error: fullErr,
          }),
        }).then(async (response) => {
          if (!response.ok) console.warn("[BuildOS] Could not persist preview runtime error.");
        }).catch((error) => console.warn("[BuildOS] Could not persist preview runtime error.", error));
      }
    };

    window.addEventListener("message", handlePreviewMessage);
    return () => window.removeEventListener("message", handlePreviewMessage);
  }, [problemId, pushLog, workspace.missions]);

  const ensure = useCallback(async () => {
    setPhase("booting");
    setLogs(["Installing development environment..."]);
    try {
      const res = await fetch("/api/buildos/workspace", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, problemId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Workspace failed");

      setTree(data.tree || []);
      for (const l of data.logs || []) {
        const line = String(l).trim();
        if (line) pushLog(line);
      }

      if (!data.environmentReady) {
        setPhase("error");
        pushLog(data.workspace?.lastError || "Environment provisioning failed");
        onReadyChange?.(false);
        return;
      }

      setPhase("ready");
      onReadyChange?.(true);

      let initialMissionIndex = 0;
      let restoredActiveTask = false;
      let restoredCompletedIds: number[] = [];
      try {
        const progressResponse = await fetch(
          `/api/nova/activity?problemId=${encodeURIComponent(problemId)}`
        );
        const progress = await progressResponse.json();
        if (!progressResponse.ok || !progress.ok) {
          throw new Error(progress.error || "Could not restore task progress.");
        }

        const completedIds = Array.isArray(progress.completedTaskIds)
          ? progress.completedTaskIds.filter((id: unknown): id is number =>
              Number.isInteger(id) && workspace.missions.some((mission) => mission.id === id)
            )
          : [];
        restoredCompletedIds = completedIds;
        setCompletedSteps(completedIds);
        setDependencyBlockedSteps(
          Array.isArray(progress.dependencyBlockedTaskIds)
            ? progress.dependencyBlockedTaskIds.filter((id: unknown): id is number =>
                Number.isInteger(id) && workspace.missions.some((mission) => mission.id === id)
              )
            : []
        );

        const selectedIndex = workspace.missions.findIndex((mission) =>
          mission.id === progress.activeTaskId && !completedIds.includes(mission.id)
        );
        if (selectedIndex >= 0) {
          initialMissionIndex = selectedIndex;
          restoredActiveTask = true;
        } else {
          const nextIndex = workspace.missions.findIndex((mission) =>
            mission.id === progress.nextTaskId
          );
          if (nextIndex >= 0) {
            initialMissionIndex = nextIndex;
          } else if (completedIds.length === workspace.missions.length) {
            initialMissionIndex = workspace.missions.length - 1;
          }
        }
      } catch (error) {
        console.warn("[BuildOS] Could not restore persisted task progress.", error);
        pushLog("Could not restore saved task progress. Showing the first available task.");
      }

      setActiveMissionIndex(initialMissionIndex);
      await loadStepFiles(initialMissionIndex);
      if (
        !restoredActiveTask &&
        workspace.missions[initialMissionIndex] &&
        !restoredCompletedIds.includes(workspace.missions[initialMissionIndex].id)
      ) {
        try {
          const response = await fetch("/api/nova/activity", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              problemId,
              taskId: workspace.missions[initialMissionIndex].id,
              type: "task_started",
            }),
          });
          if (!response.ok) throw new Error("Could not persist the active BuildOS task.");
        } catch (error) {
          console.warn("[BuildOS] Could not persist the active task.", error);
          pushLog("The selected task could not be saved; Nova may report the active task as unknown.");
        }
      }

      // STRICT REQUIREMENT: DO NOT CALL runProject() AUTOMATICALLY!
    } catch (err: any) {
      setPhase("error");
      pushLog(err.message || String(err));
      onReadyChange?.(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, problemId]);

  async function openFile(filePath: string, skipDirtyCheck = false) {
    if (!skipDirtyCheck && dirty && !(await saveFile())) {
      return;
    }
    const res = await fetch(
      `/api/buildos/files?userId=${encodeURIComponent(userId)}&problemId=${encodeURIComponent(problemId)}&path=${encodeURIComponent(filePath)}`
    );
    const data = await res.json();
    if (!res.ok) {
      pushLog(data.error || "Could not open file");
      return;
    }
    setActivePath(filePath);
    updateEditorContent(data.content || "");
    setDirty(false);
    setOpenTabs((prev) => (prev.includes(filePath) ? prev : [...prev, filePath]));
  }

  const closeTab = (path: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const remaining = openTabs.filter((t) => t !== path);
    setOpenTabs(remaining);
    if (activePath === path && remaining.length > 0) {
      openFile(remaining[remaining.length - 1], true);
    }
  };

  const activeMissionIndexRef = useRef(activeMissionIndex);
  useEffect(() => {
    activeMissionIndexRef.current = activeMissionIndex;
  }, [activeMissionIndex]);

  async function loadStepFiles(stepIdx: number) {
    const mission = workspace.missions[stepIdx];
    const mainFile = mission?.files && mission.files[0] ? mission.files[0] : "app/page.tsx";
    const targetMainFile =
      mainFile === "page.tsx"
        ? "app/page.tsx"
        : mainFile.startsWith("app/")
        ? mainFile
        : `app/${mainFile}`;

    await openFile(targetMainFile, true);
  }

  const handleSelectStep = async (idx: number) => {
    if (dirty && !(await saveFile())) return;
    const selectedMission = workspace.missions[idx];
    if (!selectedMission) return;
    try {
      const response = await fetch("/api/nova/activity", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          problemId,
          taskId: selectedMission.id,
          type: "task_started",
        }),
      });
      if (response.status === 409) {
        const data = await response.json();
        pushLog(data.error || "Complete the prerequisite tasks before selecting this task.");
        return;
      }
      if (!response.ok) throw new Error("Could not persist the selected task.");
    } catch (error) {
      console.warn("[BuildOS] Could not persist the selected task.", error);
      pushLog("The selected task could not be saved; Nova may report the active task as unknown.");
    }
    setActiveMissionIndex(idx);
    setValidationResult(null);
    await loadStepFiles(idx);
  };

  const createFile = async () => {
    const name = window.prompt("New file path (e.g. components/Card.tsx)");
    if (!name) return;
    const res = await fetch("/api/buildos/files", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId,
        problemId,
        path: name.replace(/^\/+/, ""),
        content: "// Write your code here\n",
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      pushLog(data.error || "Create failed");
      return;
    }
    setTree(data.tree || []);
    await openFile(name.replace(/^\/+/, ""), true);
  };

  const deleteFile = async () => {
    if (!window.confirm(`Delete ${activePath}?`)) return;
    const res = await fetch(
      `/api/buildos/files?userId=${encodeURIComponent(userId)}&problemId=${encodeURIComponent(problemId)}&path=${encodeURIComponent(activePath)}`,
      { method: "DELETE" }
    );
    const data = await res.json();
    if (!res.ok) {
      pushLog(data.error || "Delete failed");
      return;
    }
    setTree(data.tree || []);
    const next = flattenFiles(data.tree || [])[0];
    if (next) await openFile(next, true);
  };

  const handleValidateStep = async () => {
    if (dirty && !(await saveFile())) return;

    let check = validateMissionCode({
      mission: activeMission,
      files: { [activePath]: content },
      hasRun: runtimeState === "RUNNING" || Boolean(previewHtml),
    });

    if (check.ok) {
      try {
        const response = await fetch("/api/nova/activity", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ problemId, taskId: activeMission.id, type: "task_completed" }),
        });
        const data = await response.json();
        if (!response.ok || !data.ok) {
          check = {
            ok: false,
            failures: data.validation?.failures || [data.error || "Could not verify task completion against the saved workspace."],
          };
        }
      } catch {
        check = { ok: false, failures: ["Could not save verified task progress. Check your connection and try again."] };
      }
    }

    setValidationResult(check);
    const currentImplementationStep = implementationPlan?.steps.find(
      (step) => step.id === implementationPlan.currentStepId
    );
    if (
      currentImplementationStep &&
      ["executing", "validation_failed"].includes(currentImplementationStep.status)
    ) {
      try {
        await persistImplementationStatus(
          currentImplementationStep.id,
          check.ok ? "completed" : "validation_failed",
          currentImplementationStep.proposalId
            ? { id: currentImplementationStep.proposalId }
            : undefined
        );
      } catch (error) {
        console.error("[BuildOS] Could not persist implementation validation.", error);
        pushLog("Could not save implementation validation status.");
      }
    }

    if (check.ok) {
      if (!completedSteps.includes(activeMission.id)) {
        setCompletedSteps((prev) => [...prev, activeMission.id]);
      }
      try {
        const progressResponse = await fetch(
          `/api/nova/activity?problemId=${encodeURIComponent(problemId)}`
        );
        const progress = await progressResponse.json();
        if (!progressResponse.ok || !progress.ok) {
          throw new Error(progress.error || "Could not refresh task dependencies.");
        }
        setDependencyBlockedSteps(
          Array.isArray(progress.dependencyBlockedTaskIds)
            ? progress.dependencyBlockedTaskIds.filter((id: unknown): id is number =>
                Number.isInteger(id) && workspace.missions.some((mission) => mission.id === id)
              )
            : []
        );
      } catch (error) {
        console.warn("[BuildOS] Could not refresh task dependency state.", error);
        pushLog("Could not refresh prerequisite state. Reload BuildOS to update task availability.");
      }
      if (activeMissionIndex < workspace.missions.length - 1) {
        const nextIdx = activeMissionIndex + 1;
        await handleSelectStep(nextIdx);
      } else if (onComplete) {
        onComplete();
      }
    }
  };

  const rejectNovaProposal = (filePath: string, proposalId: string) => {
    setProposalStatuses((previous) => ({ ...previous, [proposalId]: "rejected" }));
    const stepId = proposalPlanSteps[proposalId];
    if (stepId) {
      void persistImplementationStatus(stepId, "rejected", { id: proposalId }).catch((error) => {
        console.error("[BuildOS] Could not persist implementation proposal rejection.", error);
        pushLog("Could not save Nova proposal rejection.");
      });
    }
    void fetch("/api/nova/activity", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        problemId,
        taskId: activeMission.id,
        type: "proposal_rejected",
        filePath,
      }),
    }).then((response) => {
      if (!response.ok) console.warn("[BuildOS] Could not persist Nova proposal rejection.");
    }).catch((error) => console.warn("[BuildOS] Could not persist Nova proposal rejection.", error));
  };

  const sendNovaMessage = async (textToSend?: string, modeOverride: NovaMode = novaMode) => {
    const query = textToSend || novaInput;
    if (!query.trim() || novaLoading || !novaConversationReady) return;

    shouldAutoScrollChatRef.current = true;
    const userMsg = { role: "user" as const, content: query.trim() };
    setNovaMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setNovaInput("");
    setNovaLoading(true);

    try {
      const res = await fetch("/api/nova/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMsg.content,
          conversationId: activeNovaConversationId,
          context: {
            problemId,
            activeTaskId: activeMission.id,
            activeFile: activePath,
            mentorMode: modeOverride,
            execution: {
              runtimeState,
              previewError: runError,
              saveError,
              validationResult: validationResult?.failures || [],
              logs: logs.slice(-16),
            },
          },
        }),
      });

      let data: any = null;
      try {
        data = await res.json();
      } catch {
        // Response was not JSON (e.g. Vercel 504 HTML Gateway Timeout)
      }

      if (res.ok && data?.ok && data.message) {
        if (typeof data.conversationId === "string") setNovaConversationId(data.conversationId);
        const responsePlan = data.implementationPlan && typeof data.implementationPlan === "object"
          ? data.implementationPlan as NovaImplementationPlan
          : null;
        if (responsePlan) setImplementationPlan(responsePlan);
        setNovaMessages((prev) => [...prev, { role: "assistant", content: data.message }]);
        const proposals = parseNovaProposals(data.message, novaMessages.length + 1);
        const proposalPlan = responsePlan || implementationPlan;
        const proposalStepId = proposalPlan?.currentStepId;
        for (const proposal of proposals) {
          setProposalStatuses((prev) => ({ ...prev, [proposal.id]: "pending" }));
          if (proposalStepId) {
            setProposalPlanSteps((prev) => ({ ...prev, [proposal.id]: proposalStepId }));
          }
        }
        if (proposalStepId && proposals.length > 0) {
          try {
            await persistImplementationStatus(proposalStepId, "awaiting_approval", {
              id: proposals[0].id,
              content: proposals[0].code,
            });
          } catch (error) {
            console.error("[BuildOS] Could not register Nova proposal for approval.", error);
            setProposalBaseErrors((prev) => ({
              ...prev,
              [proposals[0].id]: error instanceof Error ? error.message : "Could not register this proposal for approval.",
            }));
          }
        }
        await Promise.all(proposals.map(async (proposal) => {
          if (!flattenFiles(tree).includes(proposal.filePath)) {
            setProposalBases((prev) => ({ ...prev, [proposal.id]: null }));
            return;
          }
          try {
            const response = await fetch(
              `/api/buildos/files?problemId=${encodeURIComponent(problemId)}&path=${encodeURIComponent(proposal.filePath)}`
            );
            if (response.ok) {
              const file = await response.json();
              setProposalBases((prev) => ({ ...prev, [proposal.id]: String(file.content ?? "") }));
            } else if (response.status === 404) {
              setProposalBases((prev) => ({ ...prev, [proposal.id]: null }));
            } else {
              setProposalBaseErrors((prev) => ({ ...prev, [proposal.id]: "Could not load the current file. Applying is disabled until the comparison is available." }));
            }
          } catch {
            setProposalBaseErrors((prev) => ({ ...prev, [proposal.id]: "Could not load the current file. Applying is disabled until the comparison is available." }));
          }
        }));
      } else if (res.status === 504 || res.status === 408 || (!res.ok && !data)) {
        setNovaMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: "Generating complete code for an entire project exceeded the execution timeout limit. Please ask for one specific file or component at a time (e.g. 'Help me build the navbar' or 'Create the database schema') so I can generate clean, working code for you.",
          },
        ]);
      } else {
        const errorMsg = data?.error || data?.message || "I'm having trouble analyzing this step right now. Try asking for a specific component or smaller step.";
        setNovaMessages((prev) => [
          ...prev,
          { role: "assistant", content: errorMsg },
        ]);
      }
    } catch {
      setNovaMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Nova connection timed out. For large requests like generating entire projects, please ask for individual components or files one by one.",
        },
      ]);
    } finally {
      setNovaLoading(false);
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  useEffect(() => {
    const startTimer = window.setTimeout(ensure, 0);
    return () => {
      window.clearTimeout(startTimer);
      fetch("/api/buildos/lifecycle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, problemId, action: "stop" }),
      }).catch(() => {});
    };
  }, [ensure, userId, problemId]);

  useEffect(() => {
    if (!dirty) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      saveFile();
    }, 1200);
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [content, dirty]);

  const isRunInProgress = runtimeState === "SAVING" || runtimeState === "STARTING";

  useEffect(() => {
    if (!previewHtml || runtimeState !== "STARTING") return;
    const timer = window.setTimeout(() => {
      setRuntimeState((current) => current === "STARTING" ? "FAILED" : current);
      setRunError((current) => current || "Preview did not send a ready signal. Check the Console and try again.");
    }, 15_000);
    return () => window.clearTimeout(timer);
  }, [previewHtml, previewKey, runtimeState]);

  useEffect(() => {
    const handleWorkspaceShortcut = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "s") {
        event.preventDefault();
        if (dirty) void saveFile();
      } else if ((event.ctrlKey || event.metaKey) && (event.key === "`" || event.key === "~")) {
        event.preventDefault();
        setBottomPanelOpen((open) => !open);
      }
    };

    window.addEventListener("keydown", handleWorkspaceShortcut);
    return () => window.removeEventListener("keydown", handleWorkspaceShortcut);
  }, [dirty, saveFile]);

  return (
    <div className="buildos-shell relative flex h-full min-h-0 w-full flex-col select-none overflow-hidden bg-[#090B0A] font-sans text-[#F3F4F6]">
      {/* ==================== GLOBAL WORKSPACE HEADER ==================== */}
      <header className="z-10 flex h-[60px] shrink-0 items-center gap-2 border-b border-[#252D27] bg-[#101310] px-2 sm:px-4 text-xs">
        <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={() => isDesktop
              ? setDesktopExplorerOpen((open) => !open)
              : setMobileExplorerOpen((open) => {
                  if (!open) setMobileNovaPanelOpen(false);
                  return !open;
                })}
            aria-label={showExplorer ? "Collapse project explorer" : "Open project explorer"}
            aria-expanded={showExplorer}
            aria-controls="buildos-explorer"
            className={`p-1.5 rounded transition-colors ${
              showExplorer ? "bg-zinc-800 text-green-400" : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60"
            }`}
            title="Toggle project explorer"
          >
            {showExplorer ? <PanelLeftClose className="h-4 w-4" /> : <PanelLeftOpen className="h-4 w-4" />}
          </button>

          <div className="flex min-w-0 items-center gap-2">
            <div className="flex shrink-0 items-center gap-1.5 rounded border border-green-800/60 bg-green-950/80 px-2 py-1 text-[11px] font-bold tracking-wide text-green-300">
              <span className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse" />
              BuildOS
              <span className="rounded border border-green-800/60 px-1 py-px text-[8px] uppercase tracking-wider text-green-400">Beta</span>
            </div>
            {onBackToJourney ? (
              <button
                type="button"
                onClick={onBackToJourney}
                className="hidden items-center gap-1 text-[11px] text-zinc-400 hover:text-green-300 sm:flex"
              >
                Journey
              </button>
            ) : (
              <Link href="/dashboard/journey" className="hidden text-[11px] text-zinc-400 hover:text-green-300 sm:inline">
                Journey
              </Link>
            )}
            <span className="hidden text-zinc-700 sm:inline">/</span>
            <span className="hidden shrink-0 rounded border border-zinc-800 bg-zinc-900 px-1.5 py-1 font-mono text-[10px] text-zinc-400 sm:inline">
              {problemId || "P000001"}
            </span>
            <span className="max-w-[72px] truncate text-[11px] font-semibold text-zinc-200 sm:max-w-none">{productName}</span>
          </div>
        </div>

        <div className="hidden min-w-[220px] flex-1 flex-col items-center gap-1 lg:flex">
          <div className="flex items-center gap-2 text-[10px] font-medium text-zinc-300">
            <span>Phase {activeRoadmapPhaseIndex + 1} of 6</span>
            <span className="text-zinc-600">—</span>
            <span>{ROADMAP_PHASES[activeRoadmapPhaseIndex].name}</span>
            <span className="font-mono text-zinc-500">{completedMissionCount}/{workspace.missions.length}</span>
          </div>
          <div className="flex w-full max-w-[260px] gap-1" aria-label="Product roadmap progress">
            {ROADMAP_PHASES.map((phaseDefinition, index) => {
              const phase = roadmapPhases[index];
              const complete = phase.missions.length > 0 && phase.missions.every(({ mission }) => completedSteps.includes(mission.id));
              const current = index === activeRoadmapPhaseIndex;
              return (
                <span
                  key={phaseDefinition.name}
                  aria-hidden="true"
                  className={`h-1 flex-1 rounded-full ${complete ? "bg-emerald-400" : current ? "bg-emerald-500/80" : "bg-zinc-700"}`}
                />
              );
            })}
          </div>
        </div>

        <div className="flex flex-1 items-center justify-end gap-1.5 sm:gap-2">
          <div
            title={saving ? "Saving workspace" : saveError ? "Workspace save failed" : dirty ? "Unsaved changes" : "Workspace saved"}
            className={`flex shrink-0 items-center gap-1.5 text-[10px] font-mono ${saveError ? "text-rose-400" : dirty ? "text-amber-300" : "text-zinc-300"}`}
            aria-live="polite"
          >
            <span className={`h-2 w-2 rounded-full ${saving ? "animate-ping bg-amber-400" : saveError ? "bg-rose-400" : dirty ? "bg-amber-400" : "bg-emerald-400"}`} />
            <span className="hidden sm:inline">{saving ? "Saving…" : saveError ? "Save failed" : dirty ? "Unsaved" : "Saved"}</span>
          </div>
          <button
            type="button"
            onClick={saveFile}
            disabled={saving || !dirty}
            className="hidden items-center gap-1 rounded border border-zinc-800 bg-zinc-900 px-2.5 py-1.5 text-xs text-zinc-300 transition-colors hover:bg-zinc-800 disabled:opacity-40 sm:flex"
          >
            {saveError ? "Retry save" : "Save"}
          </button>

          <button
            type="button"
            onClick={runProject}
            disabled={isRunInProgress}
            className="flex items-center gap-1.5 rounded bg-emerald-500 px-2.5 py-1.5 text-xs font-bold text-zinc-950 shadow-sm transition-colors hover:bg-emerald-400 disabled:opacity-50 sm:px-3"
          >
            {isRunInProgress ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Play className="h-3.5 w-3.5 fill-current" />
            )}
            <span className="hidden min-[380px]:inline">{isRunInProgress ? "Running..." : runtimeState === "RUNNING" ? "Run Again" : "Run"}</span>
          </button>



          {onComplete && (
            <button
              type="button"
              onClick={onComplete}
              aria-label="Continue to the next journey phase"
              className="inline-flex items-center rounded border border-zinc-700 px-2 py-1.5 text-[11px] font-medium text-zinc-300 hover:bg-zinc-800 sm:px-2.5"
            >
              <span className="hidden min-[480px]:inline">Continue</span>
              <span className="min-[480px]:hidden">→</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => isDesktop
              ? setDesktopNovaPanelOpen((open) => !open)
              : setMobileNovaPanelOpen((open) => {
                  if (!open) setMobileExplorerOpen(false);
                  return !open;
                })}
            aria-label={showNovaPanel ? "Collapse Nova mentor" : "Open Nova mentor"}
            aria-expanded={showNovaPanel}
            aria-controls="buildos-nova"
            className={`flex items-center gap-1.5 rounded border px-2 py-1.5 text-xs font-medium transition-colors sm:px-2.5 ${
              showNovaPanel
                ? "bg-green-950 border-green-800/80 text-green-300"
                : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <Sparkles className="h-3.5 w-3.5 text-green-400" />
            <span className="hidden sm:inline">Nova AI</span>
          </button>
          <Link
            href="/dashboard/settings"
            aria-label="Open profile and settings"
            title="Profile and settings"
            className="hidden rounded-full border border-zinc-700 bg-zinc-900 p-1.5 text-zinc-300 hover:border-green-700 hover:text-green-300 sm:inline-flex"
          >
            <UserRound className="h-4 w-4" />
          </Link>
        </div>
      </header>

      {saveError && (
        <div role="alert" className="flex shrink-0 items-center justify-between gap-3 border-b border-rose-900/60 bg-rose-950/30 px-3 py-1.5 text-[11px] text-rose-200">
          <span>Workspace save failed: {saveError}</span>
          <button type="button" onClick={saveFile} className="shrink-0 underline underline-offset-2">Retry</button>
        </div>
      )}

      {/* ==================== BOOTING STATE ==================== */}
      {phase === "booting" && (
        <div className="flex-1 flex flex-col items-center justify-center gap-3 p-8 bg-[#101310]">
          <Loader2 className="h-8 w-8 animate-spin text-green-400" />
          <p className="text-sm font-semibold text-zinc-200">Initializing BuildOS IDE Workspace...</p>
          <p className="text-xs text-zinc-500 max-w-md text-center">
            Checking the existing workspace and preparing its files. Preview runs in a browser sandbox.
          </p>
        </div>
      )}

      {/* ==================== ERROR STATE ==================== */}
      {phase === "error" && (
        <div className="flex-1 flex flex-col items-center justify-center gap-3 p-8 bg-[#101310]">
          <AlertTriangle className="h-8 w-8 text-amber-400" />
          <p className="text-sm text-zinc-200">BuildOS Workspace Initialization Failed</p>
          <button
            type="button"
            onClick={ensure}
            className="rounded-lg bg-green-700 px-4 py-2 text-xs font-semibold text-white hover:bg-green-600"
          >
            Retry Workspace Setup
          </button>
        </div>
      )}

      {/* ==================== MAIN IDE WORKSPACE AREA ==================== */}
      {phase === "ready" && (
        <div ref={workspaceLayoutRef} className="relative flex min-h-0 flex-1 overflow-hidden">
          {!isDesktop && (showExplorer || showNovaPanel) && (
            <button
              type="button"
              aria-label="Close open workspace panel"
              onClick={() => {
                setMobileExplorerOpen(false);
                setMobileNovaPanelOpen(false);
              }}
              className="absolute inset-0 z-10 bg-black/50 lg:hidden"
            />
          )}

          {/* ==================== 1. LEFT ROADMAP AND PROJECT SIDEBAR ==================== */}
          {showExplorer && (
            <aside
              id="buildos-explorer"
              ref={explorerPanelRef}
              className="absolute inset-y-0 left-0 z-20 flex w-[min(88vw,480px)] min-h-0 shrink-0 select-none flex-col border-r border-[#252D27] bg-[#101310] shadow-2xl lg:relative lg:inset-auto lg:z-auto lg:w-auto lg:shadow-none"
              style={isDesktop ? { width: displayedExplorerWidth, flexBasis: displayedExplorerWidth } : undefined}
            >
              <section
                className="flex min-h-0 flex-col border-b border-[#252D27]"
                style={{ flex: `0 0 ${showRoadmapSection ? `${roadmapHeight}%` : "36px"}` }}
              >
                <div className="flex h-9 shrink-0 items-center justify-between border-b border-zinc-800/80 px-3">
                  <div className="flex min-w-0 items-center gap-2">
                    <Folder className="h-3.5 w-3.5 text-green-400" />
                    <span className="truncate text-[10px] font-bold uppercase tracking-wider text-zinc-300">Product Roadmap</span>
                    <span className="rounded bg-zinc-900 px-1.5 py-0.5 font-mono text-[9px] text-zinc-500">6 phases</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowRoadmapSection((open) => !open)}
                    aria-label={showRoadmapSection ? "Collapse product roadmap" : "Expand product roadmap"}
                    aria-expanded={showRoadmapSection}
                    aria-controls="buildos-roadmap"
                    className="rounded p-1 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200"
                  >
                    {showRoadmapSection ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronUp className="h-3.5 w-3.5" />}
                  </button>
                </div>
                {showRoadmapSection && (
                  <div id="buildos-roadmap" className="min-h-0 flex-1 overflow-y-auto p-2">
                    <ol className="space-y-1">
                      {roadmapPhases.map((roadmapPhase) => {
                        const doneCount = roadmapPhase.missions.filter(({ mission }) => completedSteps.includes(mission.id)).length;
                        const isComplete = roadmapPhase.missions.length > 0 && doneCount === roadmapPhase.missions.length;
                        const isActive = roadmapPhase.index === activeRoadmapPhaseIndex && !isComplete;
                        const expanded = expandedRoadmapPhase === roadmapPhase.index ||
                          (expandedRoadmapPhase === null && roadmapPhase.index === activeRoadmapPhaseIndex);
                        const status = isComplete ? "Completed" : isActive ? "In progress" : "Upcoming";
                        const panelId = `buildos-roadmap-phase-${roadmapPhase.index}`;

                        return (
                          <li key={roadmapPhase.name} className="overflow-hidden rounded-md">
                            <button
                              type="button"
                              onClick={() => setExpandedRoadmapPhase((current) =>
                                current === roadmapPhase.index ||
                                (current === null && roadmapPhase.index === activeRoadmapPhaseIndex)
                                  ? -1
                                  : roadmapPhase.index
                              )}
                              aria-expanded={expanded}
                              aria-controls={panelId}
                              className={`w-full rounded-md border px-2.5 py-2 text-left transition-colors ${
                                isComplete
                                  ? "border-emerald-900/50 bg-emerald-950/20 hover:bg-emerald-950/35"
                                  : isActive
                                  ? "border-emerald-700/70 bg-emerald-950/40"
                                  : "border-transparent bg-zinc-900/40 hover:border-zinc-800 hover:bg-zinc-900/70"
                              }`}
                            >
                              <span className="flex items-center gap-2">
                                <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-[9px] font-bold ${
                                  isComplete
                                    ? "border-emerald-500 bg-emerald-500 text-zinc-950"
                                    : isActive
                                    ? "border-emerald-400 text-emerald-300"
                                    : "border-zinc-700 text-zinc-500"
                                }`}>
                                  {isComplete ? "✓" : roadmapPhase.index + 1}
                                </span>
                                <span className="min-w-0 flex-1">
                                  <span className={`block truncate text-[10px] font-semibold ${
                                    isActive ? "text-emerald-200" : isComplete ? "text-emerald-300" : "text-zinc-400"
                                  }`}>
                                    {roadmapPhase.name}
                                  </span>
                                  <span className={`block text-[9px] ${isActive ? "text-emerald-400" : "text-zinc-600"}`}>
                                    {status}{roadmapPhase.missions.length > 0 ? ` · ${doneCount}/${roadmapPhase.missions.length} tasks` : ""}
                                  </span>
                                </span>
                                <ChevronDown className={`h-3 w-3 shrink-0 text-zinc-500 transition-transform ${expanded ? "rotate-180" : ""}`} />
                              </span>
                              <span className="mt-2 block h-1 overflow-hidden rounded-full bg-zinc-800">
                                <span
                                  className={`block h-full rounded-full ${isComplete ? "bg-emerald-400" : isActive ? "bg-emerald-500" : "bg-zinc-700"}`}
                                  style={{ width: `${roadmapPhase.missions.length ? (doneCount / roadmapPhase.missions.length) * 100 : 0}%` }}
                                />
                              </span>
                            </button>
                            {expanded && (
                              <div id={panelId} className="space-y-0.5 px-2 pb-1 pt-1">
                                <p className="px-1 pb-1 text-[9px] leading-relaxed text-zinc-500">{roadmapPhase.purpose}</p>
                                {roadmapPhase.missions.length ? roadmapPhase.missions.map(({ mission, missionIndex }) => {
                                  const completed = completedSteps.includes(mission.id);
                                  const current = activeMissionIndex === missionIndex;
                                  const locked = (
                                    missionIndex > activeMissionIndex + 1 ||
                                    dependencyBlockedSteps.includes(mission.id)
                                  ) && !completed;
                                  return (
                                    <button
                                      key={mission.id}
                                      type="button"
                                      onClick={() => !locked && void handleSelectStep(missionIndex)}
                                      disabled={locked}
                                      aria-current={current ? "step" : undefined}
                                      className={`flex w-full items-center gap-2 rounded px-2 py-1.5 text-left text-[10px] transition-colors ${
                                        current
                                          ? "bg-emerald-950/60 text-emerald-200"
                                          : completed
                                          ? "text-emerald-400 hover:bg-zinc-900"
                                          : locked
                                          ? "cursor-not-allowed text-zinc-700"
                                          : "text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200"
                                      }`}
                                    >
                                      <span aria-hidden="true" className="w-3 shrink-0 text-center">
                                        {completed ? "✓" : current ? "◉" : "○"}
                                      </span>
                                      <span className="min-w-0 flex-1 truncate">{mission.title}</span>
                                      {locked && <span className="text-[8px] uppercase text-zinc-600">Locked</span>}
                                    </button>
                                  );
                                }) : (
                                  <p className="px-2 py-1 text-[9px] italic text-zinc-600">
                                    No specific build tasks assigned for this product phase yet.
                                  </p>
                                )}
                              </div>
                            )}
                          </li>
                        );
                      })}
                    </ol>
                  </div>
                )}
              </section>
              {showRoadmapSection && (
                <PanelResizeHandle
                  orientation="horizontal"
                  label="Resize roadmap and project explorer"
                  value={roadmapHeight}
                  min={30}
                  max={70}
                  onResizeStart={(event) => beginPanelResize("roadmap", event)}
                  onResizeBy={(delta) => resizePanelBy("roadmap", delta)}
                  onReset={() => setRoadmapHeight(48)}
                />
              )}

              <section className="flex min-h-0 flex-1 flex-col">
                {/* Project Explorer */}
                <div className="flex h-9 shrink-0 items-center justify-between border-b border-zinc-800/80 px-3 text-xs font-semibold text-zinc-300">
                  <span className="uppercase tracking-wider text-[10px] text-zinc-400 font-mono">PROJECT EXPLORER</span>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={createFile}
                      className="p-1 text-zinc-400 hover:text-green-300 hover:bg-zinc-800/60 rounded"
                      aria-label="Create file"
                      title="New File"
                    >
                      <FilePlus className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={deleteFile}
                      className="p-1 text-zinc-400 hover:text-rose-400 hover:bg-zinc-800/60 rounded"
                      aria-label="Delete active file"
                      title="Delete File"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
                <div className="min-h-0 flex-1 overflow-y-auto p-2">
                  <FileTree nodes={tree} active={activePath} onOpen={(path) => openFile(path)} />
                </div>
              </section>
            </aside>
          )}

          {isDesktop && showExplorer && (
            <PanelResizeHandle
              orientation="vertical"
              label="Resize project explorer"
              value={displayedExplorerWidth}
              min={260}
              max={maxExplorerWidth}
              onResizeStart={(event) => beginPanelResize("explorer", event)}
              onResizeBy={(delta) => resizePanelBy("explorer", delta)}
              onReset={() => setExplorerWidth(320)}
            />
          )}

          {/* ==================== 2. CENTRAL CODE EDITOR & BOTTOM PANEL ==================== */}
          <main ref={mainWorkspaceRef} className="flex min-w-[320px] flex-1 flex-col bg-[#090B0A]">
            {/* Multi-Tab Bar */}
            <div className="flex items-center h-8 bg-[#101310] border-b border-zinc-800/80 overflow-x-auto shrink-0 select-none">
              {openTabs.map((tabPath) => {
                const isActive = activePath === tabPath;
                const fileName = tabPath.split("/").pop() || tabPath;
                return (
                  <div
                    key={tabPath}
                    onClick={() => openFile(tabPath)}
                    className={`group flex items-center gap-2 px-3 py-1.5 border-r border-zinc-800/80 text-xs font-mono cursor-pointer transition-colors ${
                      isActive
                        ? "bg-[#090B0A] text-green-300 font-semibold border-t-2 border-t-green-500"
                        : "bg-[#151A16] text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200"
                    }`}
                  >
                    <FileCode className="h-3.5 w-3.5 text-green-500/80 shrink-0" />
                    <span className="truncate max-w-[130px]">{fileName}</span>
                    {isActive && dirty && <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />}
                    {openTabs.length > 1 && (
                      <button
                        type="button"
                        onClick={(e) => closeTab(tabPath, e)}
                        className="opacity-0 group-hover:opacity-100 hover:text-rose-400 p-0.5 rounded text-zinc-500"
                      >
                        ×
                      </button>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="flex h-10 shrink-0 items-center justify-between gap-2 border-b border-zinc-800/80 bg-[#101310] px-2 sm:px-3">
              <div className="flex min-w-0 items-center gap-2 truncate text-[10px] text-zinc-500">
                <span className="hidden sm:inline">app</span>
                <span className="hidden sm:inline">›</span>
                <span className="truncate font-mono text-zinc-300">{activePath}</span>
              </div>
              <div className="flex shrink-0 items-center gap-1 rounded-md border border-zinc-800 bg-[#090B0A] p-0.5" role="group" aria-label="Workspace view">
                {(["code", "preview", "split"] as const).map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => setWorkspaceMode(mode)}
                    aria-pressed={workspaceMode === mode}
                    className={`rounded px-2 py-1 text-[10px] font-medium capitalize transition-colors ${
                      workspaceMode === mode
                        ? "bg-emerald-950 text-emerald-300 ring-1 ring-inset ring-emerald-700/70"
                        : "text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200"
                    }`}
                  >
                    {mode}
                  </button>
                ))}
              </div>
              {workspaceMode !== "code" && (
                <div className="hidden shrink-0 items-center gap-1 rounded border border-zinc-800 bg-zinc-900 p-0.5 sm:flex">
                  <button
                    type="button"
                    onClick={() => setDeviceMode("desktop")}
                    aria-label="Desktop preview viewport"
                    aria-pressed={deviceMode === "desktop"}
                    className={`rounded p-1 ${deviceMode === "desktop" ? "bg-zinc-800 text-green-300" : "text-zinc-400 hover:text-zinc-200"}`}
                  >
                    <Monitor className="h-3 w-3" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeviceMode("tablet")}
                    aria-label="Tablet preview viewport"
                    aria-pressed={deviceMode === "tablet"}
                    className={`rounded p-1 ${deviceMode === "tablet" ? "bg-zinc-800 text-green-300" : "text-zinc-400 hover:text-zinc-200"}`}
                  >
                    <Tablet className="h-3 w-3" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeviceMode("mobile")}
                    aria-label="Mobile preview viewport"
                    aria-pressed={deviceMode === "mobile"}
                    className={`rounded p-1 ${deviceMode === "mobile" ? "bg-zinc-800 text-green-300" : "text-zinc-400 hover:text-zinc-200"}`}
                  >
                    <Smartphone className="h-3 w-3" />
                  </button>
                </div>
              )}
            </div>

            <div className="flex min-h-0 flex-1 overflow-hidden">
              <section
                aria-label="Code editor"
                className={`relative min-h-0 min-w-0 flex-1 bg-[#090B0A] ${workspaceMode === "preview" ? "hidden" : ""}`}
                style={workspaceMode === "split" ? { flexBasis: `${splitRatio}%`, flexGrow: 0 } : undefined}
              >
                  <textarea
                    value={content}
                    onChange={(e) => {
                      updateEditorContent(e.target.value);
                      setDirty(true);
                    }}
                    spellCheck={false}
                    aria-label={`Code editor: ${activePath}`}
                    className="h-full w-full resize-none border-none bg-[#090B0A] p-4 font-mono text-xs leading-relaxed text-zinc-100 outline-none selection:bg-green-900/60"
                    placeholder="// Write your component code here..."
                  />
                  <div className="absolute right-3 top-2 flex items-center gap-2 rounded border border-zinc-800 bg-zinc-900/80 px-2.5 py-1 font-mono text-[10px] text-zinc-400 backdrop-blur">
                    <span>{activePath}</span>
                    <button
                      type="button"
                      onClick={handleCopyCode}
                      className="text-zinc-400 hover:text-zinc-200"
                      title="Copy Code"
                    >
                      {copied ? "Copied!" : <Copy className="h-3 w-3" />}
                    </button>
                  </div>
              </section>
              {workspaceMode === "split" && (
                <PanelResizeHandle
                  orientation="vertical"
                  label="Resize code editor and live preview"
                  value={splitRatio}
                  min={30}
                  max={70}
                  onResizeStart={(event) => beginPanelResize("split", event)}
                  onResizeBy={(delta) => resizePanelBy("split", delta)}
                  onReset={() => setSplitRatio(50)}
                />
              )}
              <section
                aria-label="Live preview"
                className={`min-h-0 min-w-0 flex-1 bg-[#090B0A] ${workspaceMode === "code" ? "hidden" : ""} ${workspaceMode === "split" ? "border-l border-[#252D27]" : ""}`}
              >
                <PreviewPane
                  previewHtml={previewHtml}
                  runtimeState={runtimeState}
                  runError={runError}
                  isRunInProgress={isRunInProgress}
                  previewKey={previewKey}
                  previewRef={previewRef}
                  deviceMode={deviceMode}
                  runProject={runProject}
                  refreshPreview={() => {
                    if (!previewHtml) return;
                    setRunError(null);
                    setRuntimeState("STARTING");
                    setPreviewKey(Date.now());
                  }}
                />
              </section>
            </div>

            {/* ==================== 3. BOTTOM DOCK (PREVIEW / CONSOLE / TESTS) ==================== */}
            {bottomPanelOpen && (
              <PanelResizeHandle
                orientation="horizontal"
                label="Resize developer console"
                value={bottomPanelHeight}
                min={150}
                max={Math.max(150, Math.min(520, (mainWorkspaceRef.current?.clientHeight ?? 800) - 180))}
                onResizeStart={(event) => beginPanelResize("console", event)}
                onResizeBy={(delta) => resizePanelBy("console", delta)}
                onReset={() => setBottomPanelHeight(200)}
              />
            )}
            <div
              className="flex min-h-0 shrink-0 flex-col border-t border-[#252D27] bg-[#101310]"
              id="buildos-bottom-panel"
              style={{
                height: bottomPanelOpen ? bottomPanelHeight : 36,
                flexBasis: bottomPanelOpen ? bottomPanelHeight : 36,
              }}
            >
              {/* Dock Tab Header Bar */}
              <div className="flex items-center justify-between gap-1 h-8 px-2 sm:px-3 bg-[#101310] border-b border-zinc-800/80 text-xs shrink-0">
                <div className="flex min-w-0 items-center gap-1 overflow-x-auto">
                  {([
                    ["problems", `Problems (${Number(Boolean(runError)) + Number(Boolean(saveError)) + (validationResult?.failures.length || 0)})`],
                    ["console", `Console (${logs.length})`],
                    ["terminal", "Terminal"],
                    ["tests", `Tests (${activeMission.tests.length})`],
                    ["build", "Build Output"],
                  ] as const).map(([tab, label]) => (
                    <button
                      key={tab}
                      type="button"
                      onClick={() => setActiveConsoleTab(tab)}
                      aria-pressed={activeConsoleTab === tab}
                      className={`shrink-0 px-1.5 sm:px-3 py-1 text-[10px] sm:text-xs font-semibold rounded-t border-b-2 transition-colors ${
                        activeConsoleTab === tab
                          ? "border-green-500 text-green-300 bg-[#101310]"
                          : "border-transparent text-zinc-400 hover:text-zinc-200"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => setBottomPanelOpen((open) => !open)}
                  aria-label={bottomPanelOpen ? "Collapse developer console" : "Expand developer console"}
                  aria-expanded={bottomPanelOpen}
                  aria-controls="buildos-bottom-panel"
                  title={bottomPanelOpen ? "Collapse console (Ctrl+`)" : "Expand console (Ctrl+`)"}
                  className="ml-2 rounded p-1 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200"
                >
                  {bottomPanelOpen ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronUp className="h-3.5 w-3.5" />}
                </button>
              </div>

              {bottomPanelOpen && (
                <div className="min-h-0 flex-1 overflow-y-auto bg-[#090B0A] p-3">
                  {activeConsoleTab === "problems" && (
                    <div className="space-y-2 text-[11px]">
                      {runError && <p className="rounded border border-rose-900/70 bg-rose-950/30 p-2 text-rose-300">Build/preview: {runError}</p>}
                      {saveError && <p className="rounded border border-rose-900/70 bg-rose-950/30 p-2 text-rose-300">Save: {saveError}</p>}
                      {validationResult?.failures.map((failure, index) => (
                        <p key={`${index}-${failure}`} className="rounded border border-amber-900/70 bg-amber-950/20 p-2 text-amber-200">
                          Mission validation: {failure}
                        </p>
                      ))}
                      {!runError && !saveError && !validationResult?.failures.length && (
                        <p className="text-zinc-500">No problems detected.</p>
                      )}
                    </div>
                  )}

                  {activeConsoleTab === "console" && (
                    <div className="space-y-1 font-mono text-xs">
                      <div className="mb-2 text-[10px] font-bold uppercase tracking-wider text-zinc-500">$ BuildOS Diagnostic Console</div>
                      {logs.map((log, index) => (
                        <div
                          key={`${index}-${log}`}
                          className={`text-[11px] leading-relaxed ${
                            log.startsWith("Error:") || log.startsWith("Build failed") || log.startsWith("✗")
                              ? "font-semibold text-rose-400"
                              : log.startsWith("✓")
                              ? "text-emerald-400"
                              : log.startsWith("---")
                              ? "font-bold text-green-400"
                              : "text-zinc-300"
                          }`}
                        >
                          {log}
                        </div>
                      ))}
                    </div>
                  )}

                  {activeConsoleTab === "terminal" && (
                    <div className="flex h-full min-h-16 items-center gap-2 font-mono text-[11px] text-zinc-500">
                      <span className="text-emerald-500">$</span>
                      Interactive terminal is not available in the hosted browser workspace.
                    </div>
                  )}

                  {activeConsoleTab === "tests" && (
                    <div className="space-y-3">
                      <div className="text-xs font-bold uppercase tracking-wider text-zinc-300">
                        Mission criteria · {activeMission.title}
                      </div>
                      <p className="text-[10px] text-zinc-500">Guidance criteria; BuildOS checks code markers and preview state locally.</p>
                      <div className="space-y-1.5">
                        {activeMission.tests.map((test, index) => (
                          <div key={index} className="flex items-center gap-2 rounded border border-zinc-800/80 bg-zinc-900/60 p-2 text-xs text-zinc-300">
                            <span aria-hidden="true" className="h-1.5 w-1.5 shrink-0 rounded-full bg-zinc-500" />
                            <span>{test}</span>
                          </div>
                        ))}
                      </div>
                      {validationResult && (
                        <div className="rounded border border-zinc-800 bg-zinc-900 p-3 text-xs">
                          {validationResult.ok ? (
                            <div className="font-semibold text-green-400">Local mission checks passed for Task {activeMissionIndex + 1}.</div>
                          ) : (
                            <div className="space-y-1 font-semibold text-rose-400">
                              <div>Validation Issues:</div>
                              {validationResult.failures.map((failure, index) => (
                                <div key={index} className="text-[11px] text-rose-300">• {failure}</div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {activeConsoleTab === "build" && (
                    <div className="space-y-1 font-mono text-[11px]">
                      {(logs.filter((log) => /build|compil|install|workspace|failed|error|preview/i.test(log)).length
                        ? logs.filter((log) => /build|compil|install|workspace|failed|error|preview/i.test(log))
                        : logs
                      ).map((log, index) => (
                        <div key={`${index}-${log}`} className={/failed|error/i.test(log) ? "text-rose-400" : "text-zinc-300"}>
                          {log}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Bottom Validation Action Bar */}
              {bottomPanelOpen && <div className="flex items-center justify-between px-4 py-1.5 bg-[#101310] border-t border-zinc-800/80 shrink-0">
                <div className="flex items-center gap-2 text-[11px] font-mono">
                  <span className="text-zinc-500">Mission {activeMissionIndex + 1}/{workspace.missions.length}</span>
                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                    activeMission.ownership === "provided"
                      ? "bg-zinc-800 text-zinc-400"
                      : "bg-green-950/80 text-green-400 border border-green-800/50"
                  }`}>
                    {activeMission.ownership === "provided" ? "📖 Study" : "✏️ Your Task"}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleValidateStep}
                  className="flex items-center gap-1.5 px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded text-xs transition-colors shadow-sm cursor-pointer"
                >
                  <Check className="h-3.5 w-3.5 stroke-[3]" />
                  <span>Submit &amp; Validate</span>
                </button>
              </div>}
            </div>
          </main>

          {isDesktop && showNovaPanel && (
            <PanelResizeHandle
              orientation="vertical"
              label="Resize Nova mentor panel"
              reverseKeyboard
              value={displayedNovaPanelWidth}
              min={280}
              max={maxNovaPanelWidth}
              onResizeStart={(event) => beginPanelResize("nova", event)}
              onResizeBy={(delta) => resizePanelBy("nova", delta)}
              onReset={() => setNovaPanelWidth(300)}
            />
          )}

          {/* ==================== 4. RIGHT NOVA AI COACH SIDEBAR ==================== */}
          {showNovaPanel && (
            <aside
              id="buildos-nova"
              className="absolute inset-y-0 right-0 z-20 flex w-[min(90vw,480px)] min-h-0 shrink-0 flex-col overflow-hidden border-l border-[#252D27] bg-[#101310] shadow-2xl lg:relative lg:inset-auto lg:z-auto lg:w-auto lg:shadow-none"
              style={isDesktop ? { width: displayedNovaPanelWidth, flexBasis: displayedNovaPanelWidth } : undefined}
            >
              {/* Nova Mentor Header — Build Mode */}
              <div className="shrink-0 border-b border-zinc-800/80 bg-[#151A16]">
                <div className="flex items-center justify-between gap-2 px-3 py-2">
                  <div className="flex min-w-0 items-center gap-2">
                    <Sparkles className="h-4 w-4 text-green-400" />
                    <span className="truncate font-bold text-xs text-zinc-100 uppercase tracking-wider">Nova AI Mentor</span>
                  </div>
                  <span className={`hidden shrink-0 rounded-full border px-2 py-0.5 font-mono text-[9px] font-semibold sm:inline-flex ${
                    buildMode === "guided"
                      ? "bg-emerald-950/80 text-emerald-300 border border-emerald-700/60"
                      : buildMode === "assisted"
                      ? "bg-amber-950/80 text-amber-300 border border-amber-700/60"
                      : "bg-green-950/80 text-green-300 border border-green-700/60"
                  }`}>
                    {buildMode === "guided" ? "📚 Guided Build" : buildMode === "assisted" ? "🔧 Assisted Build" : "🚀 Independent Build"}
                  </span>
                  <span className="hidden shrink-0 items-center gap-1 text-[9px] text-zinc-400 sm:flex" aria-live="polite">
                    <span className={`h-1.5 w-1.5 rounded-full ${novaLoading ? "animate-pulse bg-amber-400" : "bg-emerald-400"}`} />
                    {novaLoading ? "Working" : "Online"}
                  </span>
                  <button
                    type="button"
                    onClick={() => setMobileNovaPanelOpen(false)}
                    aria-label="Close Nova mentor"
                    className="rounded p-1 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200 lg:hidden"
                  >
                    <PanelRightClose className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              <NovaModeSelector value={novaMode} onChange={setNovaMode} disabled={novaLoading || !novaConversationReady} />

              {/* Collapsible project context */}
              <div className="shrink-0 border-b border-zinc-800/80 bg-[#101310]">
                <button
                  type="button"
                  onClick={() => setShowBlueprint((prev) => !prev)}
                  aria-expanded={showBlueprint}
                  aria-controls="buildos-blueprint"
                  className="w-full px-3 py-2.5 flex items-center justify-between text-left hover:bg-zinc-900/50 transition-colors focus-visible:outline focus-visible:outline-1 focus-visible:outline-inset focus-visible:outline-emerald-500"
                >
                  <div className="flex min-w-0 items-center gap-2 text-[11px] font-semibold text-emerald-300">
                    <Compass className="h-3.5 w-3.5" />
                    <span>Project context</span>
                    <span className="truncate font-normal text-zinc-500">{productName}</span>
                  </div>
                  {showBlueprint ? (
                    <ChevronUp className="h-3.5 w-3.5 text-zinc-400" />
                  ) : (
                    <ChevronDown className="h-3.5 w-3.5 text-zinc-400" />
                  )}
                </button>

                {showBlueprint && (
                  <div id="buildos-blueprint" className="max-h-56 space-y-2 overflow-y-auto border-t border-zinc-800/80 bg-[#0D100E] px-3 pb-3 pt-2.5 text-[11px]">
                    <div className="grid grid-cols-[76px_minmax(0,1fr)] gap-2">
                      <span className="text-[10px] font-medium text-zinc-500">Objective</span>
                      <p className="text-zinc-200">{journeyPhases?.design?.productGoal || problemData?.title || workspace.statement}</p>
                    </div>
                    <div className="grid grid-cols-[76px_minmax(0,1fr)] gap-2">
                      <span className="text-[10px] font-medium text-zinc-500">Phase</span>
                      <p className="text-zinc-300">{ROADMAP_PHASES[activeRoadmapPhaseIndex].name}</p>
                    </div>
                    <div className="grid grid-cols-[76px_minmax(0,1fr)] gap-2">
                      <span className="text-[10px] font-medium text-zinc-500">Current task</span>
                      <p className="text-zinc-300">{activeMission.title}</p>
                    </div>
                    {journeyPhases?.plan?.techDecisions && Object.values(journeyPhases.plan.techDecisions).some(Boolean) && (
                      <div className="grid grid-cols-[76px_minmax(0,1fr)] gap-2">
                        <span className="text-[10px] font-medium text-zinc-500">Tech stack</span>
                        <div className="flex flex-wrap gap-1">
                          {Object.entries(journeyPhases.plan.techDecisions).map(([k, v]) => (
                            v ? <span key={k} className="rounded border border-zinc-700/70 bg-zinc-900 px-1.5 py-0.5 text-[10px] text-zinc-300">
                              {k}: {String(v)}
                            </span> : null
                          ))}
                        </div>
                      </div>
                    )}
                    {(journeyPhases?.design?.selectedUsers?.length || journeyPhases?.design?.customUserRole) && (
                      <div className="grid grid-cols-[76px_minmax(0,1fr)] gap-2">
                        <span className="text-[10px] font-medium text-zinc-500">Audience</span>
                        <p className="text-zinc-400">{journeyPhases.design.selectedUsers?.join(", ") || journeyPhases.design.customUserRole}</p>
                      </div>
                    )}
                    {Array.isArray(journeyPhases?.plan?.modules) && journeyPhases.plan.modules.length > 0 && (
                      <div className="grid grid-cols-[76px_minmax(0,1fr)] gap-2">
                        <span className="text-[10px] font-medium text-zinc-500">Modules</span>
                        <p className="text-zinc-400">{journeyPhases.plan.modules.map((m: any) => m.name || m.title).filter(Boolean).join(" · ")}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Conversation composer and contextual help */}
              <div className="order-5 shrink-0 border-t border-zinc-800/80 bg-[#101310] p-2.5">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    sendNovaMessage();
                  }}
                  className="flex items-end gap-2"
                >
                  <textarea
                    rows={2}
                    value={novaInput}
                    disabled={novaLoading || !novaConversationReady}
                    onChange={(e) => setNovaInput(e.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) {
                        event.preventDefault();
                        event.currentTarget.form?.requestSubmit();
                      }
                    }}
                    aria-label="Message Nova"
                    placeholder="Ask Nova to explain, build, or debug..."
                    className="min-h-10 max-h-28 flex-1 resize-y overflow-y-auto rounded-md border border-zinc-700 bg-[#090B0A] px-3 py-2 text-xs leading-relaxed text-zinc-200 placeholder-zinc-500 outline-none transition-colors focus:border-emerald-600/80 focus:ring-1 focus:ring-emerald-700/40 disabled:opacity-50"
                  />
                  <button
                    type="submit"
                    disabled={!novaInput.trim() || novaLoading || !novaConversationReady}
                    aria-label={!novaConversationReady ? "Loading conversation" : novaLoading ? "Nova is responding" : "Send message"}
                    className="mb-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-emerald-500 text-zinc-950 transition-colors hover:bg-emerald-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-400 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    {novaLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
                  </button>
                </form>

                {/* Hint Ladder Buttons — prefer lower levels first */}
                <div className="mt-2 space-y-1.5">
                  <div className="text-[9px] font-semibold uppercase tracking-wider text-zinc-500">Available help</div>
                  <div className="flex flex-wrap gap-1.5 text-[10px]">
                    <button
                      type="button"
                      onClick={() => {
                        setNovaMode("UNDERSTAND");
                        void sendNovaMessage(`Explain the concept I need to understand for this task: "${activeMission.title}" — what is it, why does it exist, and how does it work?`, "UNDERSTAND");
                      }}
                      className="px-2 py-1 rounded bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-700/50 transition-colors cursor-pointer"
                      title="Get a concept explanation — no code"
                    >
                      💡 Explain
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setNovaMode("PLAN");
                        void sendNovaMessage(`Give me a directional hint to get started on "${activeMission.title}" without giving me the full solution`, "PLAN");
                      }}
                      className="px-2 py-1 rounded bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-700/50 transition-colors cursor-pointer"
                      title="Get a nudge in the right direction"
                    >
                      🧭 Give a Hint
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setNovaMode("BUILD");
                        void sendNovaMessage(`Show me a small focused example relevant to "${activeMission.title}" — not my full solution, just a pattern I can learn from`, "BUILD");
                      }}
                      className="px-2 py-1 rounded bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-700/50 transition-colors cursor-pointer"
                      title="See a small focused example"
                    >
                      📋 Example
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setNovaMode("DEBUG");
                        void sendNovaMessage(`I'm getting an error in ${activePath}. Here's my code:\n\n${content.slice(0, 800)}\n\n${runError ? `Preview error: ${runError}` : "Help me understand what may be wrong and how to fix it."}`, "DEBUG");
                      }}
                      className="px-2 py-1 rounded bg-rose-950/60 hover:bg-rose-950/80 text-rose-300 border border-rose-800/50 transition-colors cursor-pointer"
                      title="Debug a specific error with your code"
                    >
                      🐛 Debug
                    </button>
                    {buildMode !== "guided" && (
                      <button
                        type="button"
                        onClick={() => {
                          setNovaMode("VERIFY");
                          void sendNovaMessage(`Review my implementation in ${activePath} for ${activeMission.title}. Here's my code:\n\n${content.slice(0, 800)}\n\nAvailable local validation: ${validationResult ? (validationResult.ok ? "passed" : validationResult.failures.join("; ")) : "not run"}`, "VERIFY");
                        }}
                        className="px-2 py-1 rounded bg-green-950/60 hover:bg-green-950/80 text-green-300 border border-green-800/50 transition-colors cursor-pointer"
                        title="Get a code review"
                      >
                        🔍 Review
                      </button>
                    )}
                  </div>
                  {buildMode === "guided" && activeMission.ownership === "student" && (
                    <div className="text-[9px] text-amber-400/80 font-medium pt-0.5">
                      ⚠️ Guided Build: Try implementing before asking for code
                    </div>
                  )}
                </div>
              </div>

              {/* Independently scrolling conversation */}
              <div
                ref={chatScrollRef}
                onScroll={(event) => {
                  const container = event.currentTarget;
                  shouldAutoScrollChatRef.current =
                    container.scrollHeight - container.scrollTop - container.clientHeight < 96;
                }}
                aria-label="Nova conversation"
                aria-live="polite"
                className="order-4 min-h-0 flex-1 space-y-3 overflow-y-auto overscroll-contain bg-[#090B0A] p-3"
              >
                {implementationPlan && <NovaImplementationPlanCard plan={implementationPlan} />}
                {displayedNovaMessages.map((msg, i) => {
                  const proposals = msg.role === "assistant" ? parseNovaProposals(msg.content, i) : [];
                  const proposalSteps = msg.content.match(/^\s*\d+[.)]\s+(.+)$/gm)?.map((step) => step.replace(/^\s*\d+[.)]\s+/, "")) || [];
                  const proposalExplanation = proposals.length
                    ? msg.content
                        .replace(/```[\s\S]*?```/g, "\n")
                        .split(/\n\s*\n/)
                        .map((paragraph) => paragraph.trim())
                        .find((paragraph) =>
                          paragraph &&
                          !/^(?:#{1,4}\s|(?:[-*+•✓]|\d+[.)])\s|Files affected:)/i.test(paragraph)
                        )
                        ?.replace(/^#{1,4}\s+/, "")
                        .replace(/\s+/g, " ")
                        .trim()
                        .slice(0, 320) || ""
                    : "";
                  return (
                    <div key={i} className={`flex flex-col gap-2 ${msg.role === "user" ? "items-end" : "items-stretch"}`}>
                      <div
                        className={`p-2.5 rounded-lg text-xs leading-relaxed ${
                          msg.role === "user"
                            ? "ml-8 max-w-[90%] border border-emerald-800/60 bg-emerald-950/50 text-emerald-50"
                            : "w-full border border-zinc-800/80 bg-[#121613] text-zinc-200"
                        }`}
                      >
                        <NovaMessageContent content={msg.content} omitCodeBlocks={proposals.length > 0} />
                      </div>

                      {/* Render Interactive Code Proposals */}
                      {proposals.length > 0 && (
                        <NovaImplementationCard
                          objective={activeMission.title}
                          steps={proposalSteps}
                          files={proposals.map((proposal) => proposal.filePath)}
                          explanation={proposalExplanation}
                          expectedOutcome={activeMission.whatThisMeans}
                        />
                      )}
                      {proposals.map((prop) => {
                        return (
                          <CodeProposal
                            key={prop.id}
                            filePath={prop.filePath}
                            code={prop.code}
                            baseContent={proposalBases[prop.id]}
                            baseError={proposalBaseErrors[prop.id]}
                            status={proposalStatuses[prop.id] || "pending"}
                            applying={applyingProposal === prop.id}
                            onApply={() => applyNovaProposal(prop)}
                            onReject={() => rejectNovaProposal(prop.filePath, prop.id)}
                            onRequestRevision={() => {
                              rejectNovaProposal(prop.filePath, prop.id);
                              void sendNovaMessage(
                                `Please revise the proposal for ${prop.filePath}. Keep the change focused and explain what you changed.`,
                                "BUILD"
                              );
                            }}
                          />
                        );
                      })}
                    </div>
                  );
                })}
                {novaLoading && (
                  <div className="flex items-center gap-2 rounded-md border border-zinc-800/80 bg-[#121613] p-2.5 text-xs text-zinc-400">
                    <Loader2 className="h-3.5 w-3.5 animate-spin text-green-400" />
                    <span>Nova is thinking...</span>
                  </div>
                )}
              </div>
            </aside>
          )}
        </div>
      )}
    </div>
  );
}
