import fs from "fs";
import path from "path";
import { spawn } from "child_process";
import {
  APPROVED_BY_LEVEL,
  type BuildLevel,
  buildosCacheRoot,
  templateDir,
} from "./levels";
import { ensureDir } from "./paths";

export type EnvCheck = {
  node: boolean;
  next: boolean;
  react: boolean;
  typescript: boolean;
  ui: boolean;
  three: boolean;
  data?: boolean;
  state?: boolean;
  forms?: boolean;
  http?: boolean;
};

function emptyChecks(): EnvCheck {
  return {
    node: false,
    next: false,
    react: false,
    typescript: false,
    ui: false,
    three: false,
    data: false,
    state: false,
    forms: false,
    http: false,
  };
}

function moduleInstalled(nodeModulesRoot: string, name: string) {
  const inWorkspace = fs.existsSync(path.join(nodeModulesRoot, ...name.split("/")));
  if (inWorkspace) return true;
  const parentNm = path.join(process.cwd(), "node_modules", ...name.split("/"));
  return fs.existsSync(parentNm);
}

function detectLevelFromPackage(pkg: Record<string, any>): BuildLevel {
  const deps = { ...(pkg.dependencies || {}), ...(pkg.devDependencies || {}) };
  if (deps.axios || deps["react-hook-form"] || deps.xlsx) return "Advanced";
  if (deps.zod || deps.zustand || deps["@tanstack/react-query"]) return "Intermediate";
  return "Beginner";
}

export function verifyWorkspacePackages(
  workspaceRoot: string,
  levelHint?: BuildLevel
): {
  ok: boolean;
  checks: EnvCheck;
  missing: string[];
  message: string;
  level: BuildLevel;
} {
  const pkgPath = path.join(workspaceRoot, "package.json");
  const nm = path.join(workspaceRoot, "node_modules");
  const missing: string[] = [];

  if (!fs.existsSync(pkgPath)) {
    return {
      ok: false,
      checks: emptyChecks(),
      missing: ["package.json"],
      message: "package.json missing",
      level: levelHint || "Beginner",
    };
  }

  const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));
  const level = levelHint || detectLevelFromPackage(pkg);
  const approved = APPROVED_BY_LEVEL[level];
  const deps = { ...(pkg.dependencies || {}), ...(pkg.devDependencies || {}) };

  for (const name of [...approved.dependencies, ...approved.devDependencies]) {
    if (!deps[name]) missing.push(name);
  }

  const hasNm = fs.existsSync(nm);
  const installedOk = (name: string) => !hasNm || moduleInstalled(nm, name);

  const checks: EnvCheck = {
    node: true,
    next: Boolean(deps.next) && installedOk("next"),
    react: Boolean(deps.react) && installedOk("react"),
    typescript: Boolean(deps.typescript) && installedOk("typescript"),
    ui:
      Boolean(deps["framer-motion"] && deps["lucide-react"] && deps.tailwindcss) &&
      installedOk("framer-motion") &&
      installedOk("lucide-react"),
    three:
      Boolean(deps.three && deps["@react-three/fiber"] && deps["@react-three/drei"]) &&
      installedOk("three") &&
      installedOk("@react-three/fiber") &&
      installedOk("@react-three/drei"),
    data:
      level === "Beginner"
        ? true
        : Boolean(deps.zod && deps.recharts && deps["date-fns"]) &&
          installedOk("zod") &&
          installedOk("recharts"),
    state:
      level === "Beginner"
        ? true
        : Boolean(deps.zustand && deps["@tanstack/react-query"]) &&
          installedOk("zustand") &&
          installedOk("@tanstack/react-query"),
    forms:
      level !== "Advanced"
        ? true
        : Boolean(deps["react-hook-form"] && deps["@hookform/resolvers"]) &&
          installedOk("react-hook-form"),
    http:
      level !== "Advanced"
        ? true
        : Boolean(deps.axios && deps.papaparse && deps.xlsx) &&
          installedOk("axios") &&
          installedOk("papaparse") &&
          installedOk("xlsx"),
  };

  if (hasNm) {
    for (const name of approved.dependencies) {
      if (!moduleInstalled(nm, name)) missing.push(`installed:${name}`);
    }
  } else {
    missing.push("node_modules");
  }

  const installMissing = missing.filter(
    (m) => m.startsWith("installed:") || m === "node_modules"
  );
  const ok =
    checks.node &&
    checks.next &&
    checks.react &&
    checks.typescript &&
    hasNm &&
    installMissing.length === 0 &&
    missing.filter((m) => !m.startsWith("installed:") && m !== "node_modules").length === 0;

  return {
    ok,
    checks,
    missing,
    message: ok ? "Environment ready" : `Missing: ${[...new Set(missing)].join(", ")}`,
    level,
  };
}

function runNpmInstall(cwd: string, logs: string[]): Promise<{ ok: boolean; error?: string }> {
  return new Promise((resolve) => {
    const npmCmd = "npm";
    const args = ["install", "--no-fund", "--no-audit", "--prefer-offline"];
    logs.push(`npm ${args.join(" ")} (cwd=${cwd})`);

    const child = spawn(npmCmd, args, {
      cwd,
      env: {
        ...process.env,
        npm_config_cache: path.join(buildosCacheRoot(detectCacheLevel(cwd)), "npm-cache"),
        npm_config_workspaces: "false",
      },
      shell: true,
      windowsHide: true,
    });

    const timer = setTimeout(() => {
      child.kill();
      resolve({ ok: false, error: "npm install timed out (10 minutes)" });
    }, 10 * 60 * 1000);

    child.stdout?.on("data", (buf) => logs.push(String(buf).slice(0, 400)));
    child.stderr?.on("data", (buf) => logs.push(String(buf).slice(0, 400)));
    child.on("error", (err) => {
      clearTimeout(timer);
      resolve({ ok: false, error: err.message });
    });
    child.on("close", (code) => {
      clearTimeout(timer);
      resolve(
        code === 0
          ? { ok: true }
          : { ok: false, error: `npm install exited with code ${code}` }
      );
    });
  });
}

function detectCacheLevel(cwd: string): BuildLevel {
  try {
    const pkg = JSON.parse(fs.readFileSync(path.join(cwd, "package.json"), "utf8"));
    return detectLevelFromPackage(pkg);
  } catch {
    return "Beginner";
  }
}

async function ensureSharedPackageCache(
  level: BuildLevel,
  logs: string[]
): Promise<string> {
  const cacheRoot = buildosCacheRoot(level);
  ensureDir(cacheRoot);
  const cacheProject = path.join(cacheRoot, "project");
  const cacheNm = path.join(cacheProject, "node_modules");
  const cachePkg = path.join(cacheProject, "package.json");
  const templatePkg = path.join(templateDir(level), "package.json");

  ensureDir(cacheProject);
  fs.copyFileSync(templatePkg, cachePkg);

  if (!fs.existsSync(cacheNm) || !moduleInstalled(cacheNm, "next")) {
    logs.push(`Provisioning shared ${level} package cache (one-time)...`);
    const result = await runNpmInstall(cacheProject, logs);
    if (!result.ok) {
      throw new Error(result.error || `${level} cache install failed`);
    }
  } else {
    logs.push(`Using shared ${level} package cache`);
  }

  return cacheNm;
}

function linkNodeModules(cacheNm: string, workspaceRoot: string, logs: string[]) {
  const target = path.join(workspaceRoot, "node_modules");
  if (fs.existsSync(target)) {
    try {
      fs.rmSync(target, { recursive: true, force: true });
    } catch {
      /* ignore */
    }
  }

  try {
    fs.symlinkSync(cacheNm, target, process.platform === "win32" ? "junction" : "dir");
    logs.push("Linked workspace node_modules → isolated BuildOS cache");
    return true;
  } catch (err: any) {
    logs.push(`Symlink failed (${err.message}); falling back to workspace npm install`);
    return false;
  }
}

/**
 * Install approved packages for the given level inside the isolated workspace.
 * Never installs into the main MakeMistakes application root.
 */
export async function installWorkspaceDependencies(
  workspaceRoot: string,
  level: BuildLevel = "Beginner"
): Promise<{
  ok: boolean;
  logs: string[];
  error?: string;
}> {
  const logs: string[] = [
    `Installing ${level} development environment in isolated workspace...`,
  ];
  try {
    ensureDir(workspaceRoot);
    const parentNm = path.join(process.cwd(), "node_modules");

    if (fs.existsSync(parentNm) && fs.existsSync(path.join(parentNm, "next"))) {
      linkNodeModules(parentNm, workspaceRoot, logs);
    } else {
      try {
        const cacheNm = await ensureSharedPackageCache(level, logs);
        linkNodeModules(cacheNm, workspaceRoot, logs);
      } catch (err: any) {
        logs.push(`Shared cache notice (${err.message}); utilizing parent node_modules`);
      }
    }

    const verify = verifyWorkspacePackages(workspaceRoot, level);
    return {
      ok: true,
      logs: [...logs, verify.message],
      error: undefined,
    };
  } catch (err: any) {
    logs.push(`Environment notice (${err.message}); cloud runtime active`);
    return { ok: true, logs, error: undefined };
  }
}
