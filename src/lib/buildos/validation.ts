import { validateWorkspaceDependencies, type WorkspaceValidationError } from "./validator";
import type { BuildLevel } from "./levels";

/**
 * Structured validation model for BuildOS.
 *
 * Validation is intentionally bounded and honest:
 *  - Static checks that can run without executing student code are actually run
 *    (imports, dependencies, configuration, task markers).
 *  - Checks that would require an installed toolchain (TypeScript, ESLint,
 *    build, tests) or a live runtime are reported as `blocked` / `skipped` /
 *    `not_executed` with an explicit reason. They are never reported as passed
 *    unless they actually ran.
 *
 * Student code is never executed in the MakeMistakes Node process. Runtime and
 * syntax validation happens inside the sandboxed preview iframe and is recorded
 * separately (preview_ready / runtime_error activity events).
 */

export type ValidationStatus =
  | "not_executed"
  | "running"
  | "passed"
  | "failed"
  | "skipped"
  | "blocked";

export type ValidationKind =
  | "config"
  | "imports"
  | "dependencies"
  | "markers"
  | "syntax"
  | "typescript"
  | "lint"
  | "build"
  | "tests"
  | "runtime";

export interface ValidationFinding {
  type: string;
  message: string;
  file?: string;
  importPath?: string;
}

export interface ValidationCheck {
  id: string;
  kind: ValidationKind;
  label: string;
  status: ValidationStatus;
  executed: boolean;
  startedAt: number;
  completedAt: number;
  /** Where the result came from, e.g. "static:import-resolution" or "blocked:toolchain-unavailable". */
  method: string;
  exitCode?: number;
  errors: ValidationFinding[];
  warnings: string[];
  affectedFiles: string[];
  /** Bounded human-readable output (terminal-style). Never unbounded. */
  output: string;
  /** Reason for blocked / skipped / not_executed. */
  note?: string;
}

export interface ValidationSummary {
  projectId: string;
  executionId: string;
  totalChecks: number;
  passed: number;
  failed: number;
  blocked: number;
  skipped: number;
  notExecuted: number;
  running: number;
  /** True only when every executed check passed and nothing is blocked/failed. */
  ok: boolean;
  checks: ValidationCheck[];
}

export type ValidationRunInput = {
  userId: string;
  problemId: string;
  executionId: string;
  files: Record<string, string>;
  level?: BuildLevel;
  mission?: { id: number; ownership: string; todoMarkers?: string[]; codeChecks?: string[] } | null;
  /** Per-check safety timeout in ms (default 6000). */
  timeoutMs?: number;
  /** Bounds per check (defaults applied). */
  limits?: { maxCheckOutputChars?: number; maxErrorsPerCheck?: number; maxChecks?: number };
  /** Optional replacement static-check definitions (used for focused/targeted validation and tests). */
  definitionsOverride?: StaticCheckDefinition[];
};

type StaticCheckResult = {
  status: ValidationStatus;
  exitCode?: number;
  errors: ValidationFinding[];
  warnings: string[];
  affectedFiles: string[];
  output: string;
  note?: string;
  method: string;
};

type StaticCheckDefinition = {
  id: string;
  kind: ValidationKind;
  label: string;
  run: (ctx: { files: Record<string, string>; level: BuildLevel; mission?: ValidationRunInput["mission"] }) =>
    StaticCheckResult | Promise<StaticCheckResult>;
};

/** Applied to every message/output/note before it is exposed to Nova or persisted. */
export function redactValidationSecrets(value: string): string {
  return value
    .replace(/mongodb(?:\+srv)?:\/\/[^\s/@:]+(?::[^\s/@]*)?@[^\s/]+(?:\/[^\s]*)?/gi, "[REDACTED DATABASE URI]")
    .replace(/\bAKIA[0-9A-Z]{16}\b/g, "[REDACTED AWS KEY]")
    .replace(/-----BEGIN [A-Z ]*PRIVATE KEY-----[\s\S]*?-----END [A-Z ]*PRIVATE KEY-----/g, "[REDACTED PRIVATE KEY]")
    .replace(/\bBearer\s+[A-Za-z0-9._~+/-]+=*/gi, "Bearer [REDACTED]")
    .replace(/((?:api[_-]?key|secret|password|passwd|token|access[_-]?token|client[_-]?secret)\s*[:=]\s*["']?)[^\s"',;}]+/gi, "$1[REDACTED]")
    .replace(/\b(sk-[A-Za-z0-9_-]{12,}|gh[pousr]_[A-Za-z0-9_]{20,})\b/g, "[REDACTED CREDENTIAL]");
}

function truncate(value: string, max: number): string {
  const s = redactValidationSecrets(String(value ?? "").replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, ""));
  return s.length > max ? `${s.slice(0, max)}…` : s;
}

function mapValidatorError(error: WorkspaceValidationError): ValidationFinding {
  return {
    type: error.type,
    message: truncate(error.message, 400),
    file: error.file,
    importPath: error.importPath,
  };
}

/** Detect which toolchain checks would apply for this project. */
export function detectValidationTooling(files: Record<string, string>): {
  hasTypeScript: boolean;
  hasLintConfig: boolean;
  hasBuildCommand: boolean;
  hasTestCommand: boolean;
  hasTestFiles: boolean;
  testFramework: string | null;
} {
  const paths = Object.keys(files);
  const hasTypeScript = paths.some((p) => p === "tsconfig.json" || /\.(ts|tsx)$/.test(p));
  const hasLintConfig = paths.some((p) =>
    /^eslint\.config\.[cm]?[jt]s$/i.test(p) || /(^|\/)\\.eslintrc(\.|$)/i.test(p)
  );

  let hasBuildCommand = false;
  let hasTestCommand = false;
  let testFramework: string | null = null;
  const pkgRaw = files["package.json"] || "";
  if (pkgRaw.trim()) {
    try {
      const pkg = JSON.parse(pkgRaw);
      const scripts = pkg?.scripts && typeof pkg.scripts === "object" ? pkg.scripts as Record<string, unknown> : {};
      hasBuildCommand = typeof scripts.build === "string" && Boolean(scripts.build);
      hasTestCommand = typeof scripts.test === "string" && Boolean(scripts.test);
      const testScript = String(scripts.test || "").toLowerCase();
      if (testScript.includes("jest")) testFramework = "jest";
      else if (testScript.includes("vitest")) testFramework = "vitest";
      else if (testScript.includes("playwright") || testScript.includes("@playwright")) testFramework = "playwright";
      else if (testScript.includes("mocha")) testFramework = "mocha";
    } catch {
      // Unparseable package.json is reported by the config check.
    }
  }
  const hasTestFiles = paths.some((p) => /\.(test|spec)\.[cm]?[jt]sx?$/.test(p));

  return { hasTypeScript, hasLintConfig, hasBuildCommand, hasTestCommand, hasTestFiles, testFramework };
}

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error("validation timed out")), ms);
    promise.then(
      (value) => { clearTimeout(timer); resolve(value); },
      (error) => { clearTimeout(timer); reject(error); }
    );
  });
}

const DEFAULT_MAX_CHECK_OUTPUT_CHARS = 2_000;
const DEFAULT_MAX_ERRORS_PER_CHECK = 12;
const DEFAULT_MAX_CHECKS = 24;

function entrypointExists(files: Record<string, string>): string | null {
  if (files["app/page.tsx"] !== undefined) return "app/page.tsx";
  if (files["page.tsx"] !== undefined) return "page.tsx";
  return null;
}

function buildStaticDefinitions(mission?: ValidationRunInput["mission"]): StaticCheckDefinition[] {
  const definitions: StaticCheckDefinition[] = [];

  // config — project configuration sanity (no execution).
  definitions.push({
    id: "config",
    kind: "config",
    label: "Project configuration",
    run: ({ files }) => {
      const errors: ValidationFinding[] = [];
      const warnings: string[] = [];
      const entrypoint = entrypointExists(files);
      if (!entrypoint) {
        errors.push({
          type: "MISSING_ENTRYPOINT",
          message: "No entrypoint found: expected app/page.tsx or page.tsx.",
          file: "app/page.tsx",
        });
      }
      const pkgRaw = files["package.json"] || "";
      if (!pkgRaw.trim()) {
        errors.push({ type: "MISSING_PACKAGE_MANIFEST", message: "package.json is missing from the workspace." });
      } else {
        try {
          JSON.parse(pkgRaw);
        } catch {
          errors.push({ type: "INVALID_PACKAGE_MANIFEST", message: "package.json is not valid JSON.", file: "package.json" });
        }
      }
      return {
        method: "static:config",
        status: errors.length === 0 ? "passed" : "failed",
        errors,
        warnings,
        affectedFiles: entrypoint ? [entrypoint, "package.json"] : ["package.json"],
        output: errors.length === 0 ? "Configuration OK." : errors.map((e) => `[${e.type}] ${e.message}`).join("\n"),
      };
    },
  });

  // imports / dependencies — reuse the established static validator (no execution).
  definitions.push({
    id: "imports",
    kind: "imports",
    label: "Imports and dependencies",
    run: ({ files, level }) => {
      const result = validateWorkspaceDependencies(files, level);
      const errors = result.errors.slice(0, DEFAULT_MAX_ERRORS_PER_CHECK).map(mapValidatorError);
      const output = result.valid
        ? `Imports and dependencies OK (${result.visitedFiles.length} files visited).`
        : result.errors.slice(0, DEFAULT_MAX_ERRORS_PER_CHECK)
            .map((e) => `[${e.type}] ${e.message}`)
            .join("\n");
      return {
        method: "static:import-resolution",
        status: result.valid ? "passed" : "failed",
        errors,
        warnings: [],
        affectedFiles: result.visitedFiles.slice(0, 30),
        output,
      };
    },
  });

  // markers — leftover task markers in student-owned files (static).
  if (mission) {
    definitions.push({
      id: "markers",
      kind: "markers",
      label: "Task implementation markers",
      run: ({ files }) => {
        const markers = mission.todoMarkers || [];
        const errors: ValidationFinding[] = [];
        const affectedFiles: string[] = [];
        for (const [filePath, content] of Object.entries(files)) {
          let hit: string | null = null;
          for (const marker of markers) {
            if (content.includes(marker)) { hit = marker; break; }
          }
          if (hit) {
            errors.push({
              type: "LEFTOVER_TASK_MARKER",
              message: `Replace leftover marker \`${truncate(hit, 80)}\` with a real implementation.`,
              file: filePath,
            });
            affectedFiles.push(filePath);
          }
        }
        return {
          method: "static:task-markers",
          status: errors.length === 0 ? "passed" : "failed",
          errors,
          warnings: [],
          affectedFiles,
          output: errors.length === 0
            ? "No leftover task markers."
            : errors.map((e) => `[${e.type}] ${e.message}`).join("\n"),
        };
      },
    });
  }

  return definitions;
}

function toolchainCheck(
  id: string,
  kind: ValidationKind,
  label: string,
  applies: boolean,
  reason: string,
  method: string
): ValidationCheck {
  const now = Date.now();
  return {
    id,
    kind,
    label,
    status: applies ? "blocked" : "skipped",
    executed: false,
    startedAt: now,
    completedAt: now,
    method,
    errors: [],
    warnings: [],
    affectedFiles: [],
    output: applies ? `Not executed: ${reason}` : "Not applicable to this project.",
    note: applies ? reason : "Project does not use this tooling.",
  };
}

async function runCheck(
  definition: StaticCheckDefinition,
  ctx: { files: Record<string, string>; level: BuildLevel; mission?: ValidationRunInput["mission"] },
  timeoutMs: number,
  maxOutputChars: number
): Promise<ValidationCheck> {
  const startedAt = Date.now();
  try {
    const result = await withTimeout(Promise.resolve(definition.run(ctx)), timeoutMs);
    const completedAt = Date.now();
    const errors = result.errors.slice(0, DEFAULT_MAX_ERRORS_PER_CHECK).map((e) => ({
      type: e.type,
      message: truncate(e.message, 400),
      file: e.file,
      importPath: e.importPath,
    }));
    return {
      id: definition.id,
      kind: definition.kind,
      label: definition.label,
      status: result.status,
      executed: result.status === "passed" || result.status === "failed",
      startedAt,
      completedAt,
      method: result.method,
      exitCode: result.status === "passed" ? 0 : result.exitCode,
      errors,
      warnings: result.warnings.slice(0, 10).map((w) => truncate(w, 300)),
      affectedFiles: result.affectedFiles.slice(0, 30),
      output: truncate(result.output, maxOutputChars),
      note: result.note ? truncate(result.note, 300) : undefined,
    };
  } catch (error) {
    const completedAt = Date.now();
    const timedOut = error instanceof Error && /timed out/i.test(error.message);
    return {
      id: definition.id,
      kind: definition.kind,
      label: definition.label,
      status: "blocked",
      executed: false,
      startedAt,
      completedAt,
      method: timedOut ? "guard:timeout" : "guard:interrupted",
      errors: [],
      warnings: [],
      affectedFiles: [],
      output: timedOut ? "Validation did not complete within the allowed time and was stopped." : "Validation was interrupted before completion.",
      note: timedOut ? "Validation timed out and was stopped; no result is claimed." : "Validation was interrupted; no result is claimed.",
    };
  }
}

/**
 * Run the bounded, honest validation pipeline for a workspace snapshot.
 * Static checks execute in-process and never run student code; toolchain
 * checks are reported as blocked/skipped, not silently passed.
 */
export async function runWorkspaceValidation(input: ValidationRunInput): Promise<ValidationSummary> {
  const timeoutMs = Math.max(1, input.timeoutMs || 6_000);
  const maxOutputChars = input.limits?.maxCheckOutputChars || DEFAULT_MAX_CHECK_OUTPUT_CHARS;
  const maxChecks = input.limits?.maxChecks || DEFAULT_MAX_CHECKS;
  const level: BuildLevel = input.level || "Beginner";

  const tooling = detectValidationTooling(input.files);
  const staticDefinitions = input.definitionsOverride || buildStaticDefinitions(input.mission ?? null);
  const checks: ValidationCheck[] = [];

  for (const definition of staticDefinitions) {
    if (checks.length >= maxChecks) break;
    checks.push(await runCheck(definition, { files: input.files, level, mission: input.mission ?? null }, timeoutMs, maxOutputChars));
  }

  // Toolchain-dependent checks: reported, never executed.
  const toolchain: Array<{ id: string; kind: ValidationKind; label: string; applies: boolean; reason: string }> = [
    { id: "typescript", kind: "typescript", label: "TypeScript type check", applies: tooling.hasTypeScript, reason: "No TypeScript toolchain is installed in the sandbox workspace; type checking would require execution not available here." },
    { id: "lint", kind: "lint", label: "ESLint", applies: tooling.hasLintConfig, reason: "No ESLint toolchain is installed in the sandbox workspace; linting would require execution not available here." },
    { id: "build", kind: "build", label: "Project build", applies: tooling.hasBuildCommand, reason: "A build command exists but running it would execute project scripts in an environment without an installed toolchain; build is not executed server-side." },
    { id: "tests", kind: "tests", label: "Test suite", applies: tooling.hasTestCommand || tooling.hasTestFiles, reason: tooling.testFramework ? `The ${tooling.testFramework} test runner is not installed in the sandbox workspace; tests are not executed here.` : "No test toolchain is installed in the sandbox workspace; tests are not executed here." },
    { id: "runtime", kind: "runtime", label: "Runtime execution", applies: true, reason: "Runtime validation runs inside the sandboxed preview iframe and is recorded separately via preview events; it cannot run in this Node process." },
  ];

  for (const tc of toolchain) {
    if (checks.length >= maxChecks) break;
    const now = Date.now();
    checks.push(toolchainCheck(tc.id, tc.kind, tc.label, tc.applies, tc.reason, `unsupported:${tc.id}`));
    // Allow a tiny delta so ordering is stable.
    checks[checks.length - 1].startedAt = now - 1;
    checks[checks.length - 1].completedAt = now;
  }

  const counts = checks.reduce(
    (acc, check) => {
      switch (check.status) {
        case "passed": acc.passed += 1; break;
        case "failed": acc.failed += 1; break;
        case "blocked": acc.blocked += 1; break;
        case "skipped": acc.skipped += 1; break;
        case "not_executed": acc.notExecuted += 1; break;
        case "running": acc.running += 1; break;
      }
      return acc;
    },
    { passed: 0, failed: 0, blocked: 0, skipped: 0, notExecuted: 0, running: 0 }
  );

  const executedChecks = checks.filter((c) => c.status === "passed" || c.status === "failed");
  // ok reflects executed checks only: no failures and at least one executed check.
  // Blocked/skipped checks are infrastructure/toolchain limitations, not failures.
  const ok = counts.failed === 0 && executedChecks.length > 0;

  return {
    projectId: input.problemId,
    executionId: input.executionId,
    totalChecks: checks.length,
    passed: counts.passed,
    failed: counts.failed,
    blocked: counts.blocked,
    skipped: counts.skipped,
    notExecuted: counts.notExecuted,
    running: counts.running,
    ok,
    checks,
  };
}

/** Compact, bounded, redacted representation safe to persist or send to Nova. */
export function summarizeValidation(summary: ValidationSummary, maxChecks = 30): string {
  const lines: string[] = [
    `Validation run ${summary.executionId} for project ${summary.projectId}: ${summary.totalChecks} checks — ${summary.passed} passed, ${summary.failed} failed, ${summary.blocked} blocked, ${summary.skipped} skipped, ${summary.notExecuted} not executed.`,
  ];
  for (const check of summary.checks.slice(0, maxChecks)) {
    const detail = check.status === "failed"
      ? check.errors.slice(0, 2).map((e) => `[${e.type}] ${e.message}`).join("; ")
      : check.status === "blocked" || check.status === "skipped"
        ? (check.note || check.output).slice(0, 240)
        : check.output.slice(0, 160);
    lines.push(`- ${check.label}: ${check.status}${detail ? ` — ${detail}` : ""}`);
  }
  return lines.join("\n");
}
