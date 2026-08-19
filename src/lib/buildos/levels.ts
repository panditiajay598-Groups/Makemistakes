import path from "path";

const ROOT = process.cwd();

export type BuildLevel = "Beginner" | "Intermediate" | "Advanced";
export type TemplateId = "beginner-nextjs" | "intermediate-nextjs" | "advanced-nextjs";

export type TemplateConfig = {
  id: TemplateId;
  level: BuildLevel;
  dirName: string;
  label: string;
  /** Extra env badges beyond Node/Next/React/TS/UI/3D */
  extraChecks: string[];
};

export const TEMPLATES: Record<BuildLevel, TemplateConfig> = {
  Beginner: {
    id: "beginner-nextjs",
    level: "Beginner",
    dirName: "make-mistakes-beginner-template",
    label: "Beginner",
    extraChecks: [],
  },
  Intermediate: {
    id: "intermediate-nextjs",
    level: "Intermediate",
    dirName: "make-mistakes-intermediate-template",
    label: "Intermediate",
    extraChecks: ["data", "state"],
  },
  Advanced: {
    id: "advanced-nextjs",
    level: "Advanced",
    dirName: "make-mistakes-advanced-template",
    label: "Advanced",
    extraChecks: ["data", "state", "forms", "http"],
  },
};

export function normalizeBuildLevel(raw?: string | null): BuildLevel {
  const v = String(raw || "")
    .trim()
    .toLowerCase();
  if (v === "intermediate" || v === "medium") return "Intermediate";
  if (v === "advanced" || v === "expert" || v === "hard") return "Advanced";
  return "Beginner";
}

export function getTemplate(level: BuildLevel): TemplateConfig {
  return TEMPLATES[level] || TEMPLATES.Beginner;
}

export function templateDir(level: BuildLevel): string {
  return path.join(ROOT, "templates", getTemplate(level).dirName);
}

export function buildosCacheRoot(level: BuildLevel): string {
  return path.join(ROOT, "data", "buildos-cache", getTemplate(level).id);
}

/** Approved runtime deps declared in each level's package.json (verification list). */
export const APPROVED_BY_LEVEL: Record<
  BuildLevel,
  { dependencies: string[]; devDependencies: string[] }
> = {
  Beginner: {
    dependencies: [
      "next",
      "react",
      "react-dom",
      "framer-motion",
      "lucide-react",
      "three",
      "@react-three/fiber",
      "@react-three/drei",
    ],
    devDependencies: [
      "typescript",
      "@types/node",
      "@types/react",
      "@types/react-dom",
      "@types/three",
      "tailwindcss",
      "@tailwindcss/postcss",
    ],
  },
  Intermediate: {
    dependencies: [
      "next",
      "react",
      "react-dom",
      "framer-motion",
      "lucide-react",
      "three",
      "@react-three/fiber",
      "@react-three/drei",
      "zod",
      "zustand",
      "@tanstack/react-query",
      "recharts",
      "date-fns",
      "clsx",
    ],
    devDependencies: [
      "typescript",
      "@types/node",
      "@types/react",
      "@types/react-dom",
      "@types/three",
      "tailwindcss",
      "@tailwindcss/postcss",
    ],
  },
  Advanced: {
    dependencies: [
      "next",
      "react",
      "react-dom",
      "framer-motion",
      "lucide-react",
      "three",
      "@react-three/fiber",
      "@react-three/drei",
      "zod",
      "zustand",
      "@tanstack/react-query",
      "recharts",
      "date-fns",
      "clsx",
      "axios",
      "react-hook-form",
      "@hookform/resolvers",
      "papaparse",
      "xlsx",
      "immer",
      "nanoid",
    ],
    devDependencies: [
      "typescript",
      "@types/node",
      "@types/react",
      "@types/react-dom",
      "@types/three",
      "@types/papaparse",
      "tailwindcss",
      "@tailwindcss/postcss",
    ],
  },
};
