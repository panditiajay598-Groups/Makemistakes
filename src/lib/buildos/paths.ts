import path from "path";
import fs from "fs";
import {
  type BuildLevel,
  type TemplateId,
  getTemplate,
  templateDir as levelTemplateDir,
} from "./levels";

const ROOT = process.cwd();

/** @deprecated Prefer level-aware helpers from levels.ts */
export const TEMPLATE_ID = "beginner-nextjs" as const;
/** @deprecated Prefer templateDir(level) */
export const TEMPLATE_DIR = path.join(ROOT, "templates", "make-mistakes-beginner-template");
export const WORKSPACES_ROOT = path.join(ROOT, "data", "student-workspaces");
/** @deprecated Prefer buildosCacheRoot(level) */
export const BUILDOS_CACHE_ROOT = path.join(ROOT, "data", "buildos-cache", TEMPLATE_ID);

export type WorkspaceStatus =
  | "created"
  | "installing"
  | "ready"
  | "running"
  | "stopped"
  | "archived"
  | "error";

export {
  type BuildLevel,
  type TemplateId,
  APPROVED_BY_LEVEL,
  normalizeBuildLevel,
  getTemplate,
  templateDir,
  buildosCacheRoot,
} from "./levels";

/** Legacy flat lists = Beginner approved set */
export const APPROVED_DEPENDENCIES = [
  "next",
  "react",
  "react-dom",
  "framer-motion",
  "lucide-react",
  "three",
  "@react-three/fiber",
  "@react-three/drei",
] as const;

export const APPROVED_DEV_DEPENDENCIES = [
  "typescript",
  "@types/node",
  "@types/react",
  "@types/react-dom",
  "@types/three",
  "tailwindcss",
  "@tailwindcss/postcss",
] as const;

export const ALLOWED_FILE_EXTENSIONS = new Set([
  ".ts",
  ".tsx",
  ".js",
  ".jsx",
  ".json",
  ".css",
  ".md",
  ".mjs",
]);

export function safeSegment(raw: string, max = 120): string {
  const cleaned = String(raw || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9._@+-]+/g, "_")
    .replace(/_+/g, "_")
    .replace(/^[._]+|[._]+$/g, "");
  return (cleaned || "unknown").slice(0, max);
}

export function workspaceKey(userId: string, problemId: string): string {
  return `${safeSegment(userId)}__${safeSegment(problemId)}`;
}

export function workspaceDir(userId: string, problemId: string): string {
  return path.join(WORKSPACES_ROOT, safeSegment(userId), safeSegment(problemId));
}

export function ensureDir(dir: string) {
  fs.mkdirSync(dir, { recursive: true });
}

export function resolveTemplateDir(level: BuildLevel = "Beginner"): string {
  const dir = levelTemplateDir(level);
  if (!fs.existsSync(dir)) {
    throw new Error(`Template missing for ${level}: ${dir}`);
  }
  return dir;
}

export function resolveWorkspaceFile(workspaceRoot: string, relativePath: string): string {
  const normalized = relativePath.replace(/\\/g, "/").replace(/^\/+/, "");
  if (!normalized || normalized.includes("\0")) {
    throw new Error("Invalid file path");
  }
  if (normalized.split("/").some((p) => p === ".." || p === ".")) {
    throw new Error("Path traversal is not allowed");
  }
  const abs = path.resolve(workspaceRoot, normalized);
  const root = path.resolve(workspaceRoot);
  if (abs !== root && !abs.startsWith(root + path.sep)) {
    throw new Error("File is outside workspace");
  }
  return abs;
}

export function isEditableRelativePath(relativePath: string): boolean {
  const normalized = relativePath.replace(/\\/g, "/");
  if (
    normalized.startsWith("node_modules/") ||
    normalized.startsWith(".next/") ||
    normalized === "node_modules" ||
    normalized === ".next" ||
    normalized === ".buildos-meta.json" ||
    normalized.startsWith(".git/")
  ) {
    return false;
  }
  const ext = path.extname(normalized).toLowerCase();
  if (!ext) return false;
  return ALLOWED_FILE_EXTENSIONS.has(ext);
}

export function templateIdForLevel(level: BuildLevel): TemplateId {
  return getTemplate(level).id;
}
