import path from "node:path";

export type WorkspaceTopics =
  | "authentication"
  | "api"
  | "database"
  | "dashboard"
  | "navigation"
  | "styling"
  | "testing"
  | "execution";

export type WorkspacePackageSummary = {
  projectName: string | null;
  dependencies: string[];
  frameworks: string[];
  languages: string[];
  styling: string[];
  databases: string[];
  authentication: string[];
  integrations: string[];
  buildTools: string[];
};

const TOPIC_TERMS: Record<WorkspaceTopics, RegExp> = {
  authentication: /\b(auth(?:entication|orization)?|login|log\s?in|sign\s?in|register|registration|oauth|google|session|token)\b/i,
  api: /\b(api|backend|frontend|endpoint|route|request|fetch|http|communicat(?:e|ion))\b/i,
  database: /\b(database|db|model|schema|query|mongo(?:db)?|postgres(?:ql)?|mysql|sqlite|prisma)\b/i,
  dashboard: /\bdashboard\b/i,
  navigation: /\b(navigation|navbar|nav bar|menu|header)\b/i,
  styling: /\b(style|styling|css|theme|tailwind|design system)\b/i,
  testing: /\b(test|testing|spec|jest|vitest|playwright)\b/i,
  execution: /\b(error|exception|crash|broken|fail(?:ed|ure)?|stack trace|debug|build|runtime|not working)\b/i,
};

const TOPIC_PATH_HINTS: Record<WorkspaceTopics, RegExp> = {
  authentication: /auth|login|signin|sign-in|register|session|middleware|user|account/i,
  api: /(^|[/_.-])(api|backend|endpoint|route|client|fetch|http)([/_.-]|$)/i,
  database: /(^|[/_.-])(db|database|model|schema|prisma|mongo|migration|repository)([/_.-]|$)/i,
  dashboard: /(^|[/_.-])(dashboard|overview|analytics|admin)([/_.-]|$)/i,
  navigation: /(^|[/_.-])(nav|navbar|navigation|menu|header)([/_.-]|$)/i,
  styling: /(^|[/_.-])(styles?|theme|tailwind|css|design-system)([/_.-]|$)/i,
  testing: /(^|[/_.-])(tests?|specs?|__tests__)([/_.-]|$)/i,
  execution: /(^|[/_.-])(error|debug|logger|logs?|build|runtime)([/_.-]|$)/i,
};

const CONFIG_PATHS = new Set([
  "package.json",
  "tsconfig.json",
  "jsconfig.json",
  "next.config.js",
  "next.config.mjs",
  "next.config.ts",
  "vite.config.js",
  "vite.config.ts",
  "webpack.config.js",
  "postcss.config.js",
  "postcss.config.mjs",
  "tailwind.config.js",
  "tailwind.config.ts",
  "prisma/schema.prisma",
]);

const IMPORT_PATTERN =
  /(?:import\s+(?:[^"'()]*?\s+from\s+)?|export\s+[^"'()]*?\s+from\s+|require\s*\(|import\s*\()\s*["']([^"']+)["']/g;
const SOURCE_EXTENSIONS = [".tsx", ".ts", ".jsx", ".js", ".mjs", ".json", ".css"];

function isSafeVersion(value: unknown): value is string {
  return typeof value === "string" && /^[\^~<>=*0-9.xX| -]{1,32}$/.test(value);
}

function packageNamesByPattern(names: string[], pattern: RegExp): string[] {
  return names.filter((name) => pattern.test(name)).slice(0, 20);
}

function dependencyName(dependency: string): string {
  const versionSeparator = dependency.lastIndexOf("@");
  return dependency.startsWith("@")
    ? dependency.slice(0, versionSeparator > 0 ? versionSeparator : undefined)
    : dependency.slice(0, versionSeparator > 0 ? versionSeparator : undefined);
}

export function inferWorkspaceTopics(question: string): WorkspaceTopics[] {
  return (Object.entries(TOPIC_TERMS) as Array<[WorkspaceTopics, RegExp]>)
    .filter(([, pattern]) => pattern.test(question))
    .map(([topic]) => topic);
}

export function selectRelevantWorkspacePaths(
  paths: string[],
  question: string,
  activeFile: string,
  limit = 5
): string[] {
  const topics = inferWorkspaceTopics(question);
  const words = question.toLowerCase().split(/[^a-z0-9]+/).filter((word) => word.length > 2);
  const ranked = paths
    .filter((file) => !/(^|\/)(?:\.env(?:[._-]|$)|secrets?(?:[._/-]|$)|credentials?(?:[._/-]|$)|private[-_]?keys?(?:[._/-]|$)|service[-_]?accounts?(?:[._/-]|$))/i.test(file))
    .map((file) => {
      const normalized = file.toLowerCase();
      const basename = path.posix.basename(normalized);
      let score = words.reduce((total, word) => total + (normalized.includes(word) ? 2 : 0), 0);
      for (const topic of topics) {
        if (TOPIC_PATH_HINTS[topic].test(normalized)) score += 8;
      }
      if (CONFIG_PATHS.has(normalized)) score += 3;
      if (/^(app|pages|src)\//.test(normalized)) score += 1;
      if (/\.(test|spec)\.[jt]sx?$/.test(basename) && !topics.includes("testing")) score -= 2;
      return { file, score };
    })
    .filter((item) => item.score > 0)
    .sort((left, right) => right.score - left.score || left.file.localeCompare(right.file));
  const selected: string[] = [];
  const add = (file: string) => {
    if (paths.includes(file) && !selected.includes(file) && selected.length < limit) selected.push(file);
  };
  add(activeFile);
  for (const { file } of ranked) add(file);
  return selected;
}

export function resolveWorkspaceImports(
  sourcePath: string,
  source: string,
  availablePaths: string[],
  limit = 3
): string[] {
  const available = new Set(availablePaths);
  const resolved: string[] = [];
  for (const match of source.matchAll(IMPORT_PATTERN)) {
    const specifier = match[1];
    if (!specifier || (!specifier.startsWith(".") && !specifier.startsWith("@/") && !specifier.startsWith("~/"))) continue;

    const base = specifier.startsWith("@/") || specifier.startsWith("~/")
      ? specifier.slice(2)
      : path.posix.normalize(path.posix.join(path.posix.dirname(sourcePath), specifier));
    const candidates = [
      base,
      ...SOURCE_EXTENSIONS.map((extension) => `${base}${extension}`),
      ...SOURCE_EXTENSIONS.map((extension) => `${base}/index${extension}`),
    ];
    const matchPath = candidates.find((candidate) => available.has(candidate));
    if (matchPath && !resolved.includes(matchPath)) resolved.push(matchPath);
    if (resolved.length >= limit) break;
  }
  return resolved;
}

export function summarizeWorkspacePackages(
  manifestContent: string,
  paths: string[]
): WorkspacePackageSummary {
  let manifest: Record<string, unknown> = {};
  try {
    const parsed: unknown = JSON.parse(manifestContent);
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      manifest = parsed as Record<string, unknown>;
    }
  } catch {
    manifest = {};
  }

  const dependencies = [
    manifest.dependencies,
    manifest.devDependencies,
  ].flatMap((value) =>
    value && typeof value === "object" && !Array.isArray(value)
      ? Object.entries(value as Record<string, unknown>)
          .filter(([name, version]) =>
            /^(?:@[a-z0-9._-]+\/)?[a-z0-9._-]+$/i.test(name) && isSafeVersion(version)
          )
          .map(([name, version]) => `${name}@${version}`)
      : []
  ).slice(0, 80);
  const names = dependencies.map(dependencyName).filter(Boolean);
  const scripts = manifest.scripts && typeof manifest.scripts === "object" && !Array.isArray(manifest.scripts)
    ? Object.keys(manifest.scripts as Record<string, unknown>)
        .filter((name) => /^[a-z][a-z0-9:_-]{0,40}$/i.test(name))
        .slice(0, 20)
    : [];
  const languages = new Set<string>();
  if (paths.some((file) => /\.tsx?$/.test(file))) languages.add("TypeScript");
  if (paths.some((file) => /\.jsx?$/.test(file))) languages.add("JavaScript");
  if (paths.some((file) => /\.css$/i.test(file))) languages.add("CSS");

  return {
    projectName: typeof manifest.name === "string" && /^[a-zA-Z0-9@._/-]{1,100}$/.test(manifest.name)
      ? manifest.name
      : null,
    dependencies,
    frameworks: packageNamesByPattern(names, /^(next|react|vue|svelte|angular|vite|express|fastify|nestjs)$/i),
    languages: [...languages],
    styling: packageNamesByPattern(names, /tailwind|styled-components|emotion|sass|less|bootstrap/i),
    databases: packageNamesByPattern(names, /mongo|mongoose|prisma|drizzle|sequelize|typeorm|pg$|mysql|sqlite|redis/i),
    authentication: packageNamesByPattern(names, /auth|passport|clerk|firebase|supabase|jsonwebtoken|jose|bcrypt/i),
    integrations: packageNamesByPattern(names, /stripe|github|google|aws|twilio|sendgrid|nodemailer/i),
    buildTools: [...scripts.map((name) => `script:${name}`), ...packageNamesByPattern(names, /typescript|eslint|webpack|vite|swc|babel|jest|vitest|playwright/i)].slice(0, 30),
  };
}

export function summarizeWorkspaceStructure(paths: string[], truncated: boolean): string {
  const rootFolders = new Set<string>();
  const configFiles: string[] = [];
  const sourceFolders = new Set<string>();
  for (const file of paths) {
    const segments = file.split("/");
    if (segments.length > 1) rootFolders.add(segments[0]);
    else if (CONFIG_PATHS.has(file)) configFiles.push(file);
    if (/^(src|app|pages|components|lib|api|server|client|prisma|tests?)\//i.test(file)) {
      sourceFolders.add(segments.length > 1 ? segments.slice(0, 2).join("/") : segments[0]);
    }
    if (CONFIG_PATHS.has(file) && !configFiles.includes(file)) configFiles.push(file);
  }
  return [
    `Root folders observed: ${[...rootFolders].sort().join(", ") || "none"}.`,
    `Source organization observed: ${[...sourceFolders].sort().slice(0, 30).join(", ") || "no recognized source folders"}.`,
    `Configuration files observed: ${configFiles.sort().slice(0, 30).join(", ") || "none"}.`,
    truncated ? "File listing was truncated at the configured scan limits." : "File listing completed within configured scan limits.",
  ].join("\n");
}

export function summarizeImplementationEvidence(source: string): string {
  const exports = [...source.matchAll(/\bexport\s+(?:default\s+)?(?:async\s+)?(?:function|class|const|let|var|interface|type)\s+([A-Za-z_$][\w$]*)/g)]
    .slice(0, 12)
    .map((match) => match[1]);
  const apiMethods = [...source.matchAll(/\bexport\s+async\s+function\s+(GET|POST|PUT|PATCH|DELETE)\b/g)]
    .map((match) => match[1]);
  const markers: string[] = [];
  if (/\bTODO\b|__WRITE_ME__|throw\s+new\s+Error\(["']Not implemented/i.test(source)) markers.push("placeholder or TODO markers are present");
  if (/\b(?:describe|it|test)\s*\(/.test(source)) markers.push("test declarations are present");
  if (/\b(?:authenticate|authorization|session|signIn|signOut)\b/i.test(source)) markers.push("authentication-related identifiers are present");
  return [
    exports.length ? `Named exports observed: ${exports.join(", ")}.` : "",
    apiMethods.length ? `HTTP handlers observed: ${[...new Set(apiMethods)].join(", ")}.` : "",
    markers.length ? `Implementation signals: ${markers.join("; ")}.` : "",
    "These are source-level signals only; they do not prove feature completeness or successful execution.",
  ].filter(Boolean).join(" ");
}

export function wrapUntrustedWorkspaceFile(filePath: string, content: string): string {
  const safePath = filePath.replace(/[<>]/g, "_");
  const safeContent = content
    .replace(/<\/?workspace-file\b/gi, "[workspace-file-tag]")
    .replace(/<\/?untrusted-workspace-data\b/gi, "[untrusted-data-tag]");
  return `<untrusted-workspace-data path="${safePath}">\n${safeContent}\n</untrusted-workspace-data>`;
}

export function limitWorkspaceContext(context: string, maxChars: number): string {
  return context.slice(0, Math.max(0, maxChars));
}

export function redactWorkspaceSecrets(value: string): string {
  return value
    .replace(/mongodb(?:\+srv)?:\/\/[^\s/@:]+(?::[^\s/@]*)?@[^\s/]+(?:\/[^\s]*)?/gi, "[REDACTED DATABASE URI]")
    .replace(/\bAKIA[0-9A-Z]{16}\b/g, "[REDACTED AWS KEY]")
    .replace(/\bAIza[0-9A-Za-z_-]{30,}\b/g, "[REDACTED API KEY]")
    .replace(/\b(?:sk|pk)_(?:live|test)_[A-Za-z0-9]{10,}\b/g, "[REDACTED PAYMENT KEY]")
    .replace(/\bxox[baprs]-[A-Za-z0-9-]{10,}\b/g, "[REDACTED TOKEN]")
    .replace(/-----BEGIN [A-Z ]*PRIVATE KEY-----[\s\S]*?-----END [A-Z ]*PRIVATE KEY-----/g, "[REDACTED PRIVATE KEY]")
    .replace(/\bBearer\s+[A-Za-z0-9._~+/-]+=*/gi, "******")
    .replace(/((?:api[_-]?key|secret|password|passwd|token|access[_-]?token|client[_-]?secret)\s*[:=]\s*["']?)[^\s"',;}]+/gi, "$1[REDACTED]")
    .replace(/\b(sk-[A-Za-z0-9_-]{12,}|gh[pousr]_[A-Za-z0-9_]{20,})\b/g, "[REDACTED CREDENTIAL]");
}
