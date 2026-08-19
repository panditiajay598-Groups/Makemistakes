/**
 * BuildOS acceptance smoke test (Node, no Next server required for file isolation).
 * Usage: node scripts/test-buildos.mjs
 */
const fs = require("fs");
const path = require("path");
const { spawn } = require("child_process");

const ROOT = process.cwd();
const TEMPLATE = path.join(ROOT, "templates", "make-mistakes-beginner-template");
const WORKSPACES = path.join(ROOT, "data", "student-workspaces");
const CACHE = path.join(ROOT, "data", "buildos-cache", "beginner-nextjs");

function safe(s) {
  return String(s)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9._@+-]+/g, "_")
    .slice(0, 120);
}

function wsDir(userId, problemId) {
  return path.join(WORKSPACES, safe(userId), safe(problemId));
}

function copyDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    if (entry.name === "node_modules" || entry.name === ".next") continue;
    const from = path.join(src, entry.name);
    const to = path.join(dest, entry.name);
    if (entry.isDirectory()) copyDir(from, to);
    else fs.copyFileSync(from, to);
  }
}

function runNpm(cwd) {
  return new Promise((resolve) => {
    const npmCmd = process.platform === "win32" ? "npm.cmd" : "npm";
    const child = spawn(npmCmd, ["install", "--no-fund", "--no-audit", "--prefer-offline"], {
      cwd,
      env: {
        ...process.env,
        npm_config_cache: path.join(CACHE, "npm-cache"),
        npm_config_workspaces: "false",
      },
      shell: process.platform === "win32",
      windowsHide: true,
    });
    let out = "";
    child.stdout.on("data", (d) => (out += d));
    child.stderr.on("data", (d) => (out += d));
    child.on("close", (code) => resolve({ code, out }));
  });
}

async function ensureSharedCache() {
  const project = path.join(CACHE, "project");
  const nm = path.join(project, "node_modules");
  fs.mkdirSync(project, { recursive: true });
  fs.copyFileSync(path.join(TEMPLATE, "package.json"), path.join(project, "package.json"));
  if (!fs.existsSync(path.join(nm, "next"))) {
    console.log("Installing shared Beginner cache (may take a few minutes)...");
    const r = await runNpm(project);
    if (r.code !== 0) throw new Error("cache npm install failed: " + r.out.slice(-800));
  } else {
    console.log("Shared cache already present");
  }
  return nm;
}

function linkNm(cacheNm, root) {
  const target = path.join(root, "node_modules");
  if (fs.existsSync(target)) fs.rmSync(target, { recursive: true, force: true });
  fs.symlinkSync(cacheNm, target, process.platform === "win32" ? "junction" : "dir");
}

async function ensure(userId, problemId) {
  const root = wsDir(userId, problemId);
  const created = !fs.existsSync(path.join(root, "package.json"));
  if (created) {
    if (fs.existsSync(root)) fs.rmSync(root, { recursive: true, force: true });
    copyDir(TEMPLATE, root);
  }
  const cacheNm = await ensureSharedCache();
  if (!fs.existsSync(path.join(root, "node_modules"))) linkNm(cacheNm, root);
  const checks = {
    node: true,
    next: fs.existsSync(path.join(root, "node_modules", "next")),
    react: fs.existsSync(path.join(root, "node_modules", "react")),
    typescript: fs.existsSync(path.join(root, "node_modules", "typescript")),
    three: fs.existsSync(path.join(root, "node_modules", "three")),
  };
  return { root, created, checks };
}

async function main() {
  console.log("Beginner template exists:", fs.existsSync(path.join(TEMPLATE, "package.json")));

  const a = await ensure("USER_A_TEST", "P000003");
  console.log("P000003 created:", a.created, "checks:", a.checks);
  let page = fs.readFileSync(path.join(a.root, "app", "page.tsx"), "utf8");
  page = page.replace("Your product starts here", "Invoice helper for P000003");
  fs.writeFileSync(path.join(a.root, "app", "page.tsx"), page);

  const b = await ensure("USER_A_TEST", "P000004");
  console.log("P000004 created:", b.created, "checks:", b.checks);
  const page4 = fs.readFileSync(path.join(b.root, "app", "page.tsx"), "utf8");
  console.log("Isolation P000004 clean:", !page4.includes("Invoice helper for P000003"));

  const c = await ensure("USER_A_TEST", "P000003");
  const page3 = fs.readFileSync(path.join(c.root, "app", "page.tsx"), "utf8");
  console.log("Persistence P000003:", page3.includes("Invoice helper for P000003"));
  console.log("Main app node_modules untouched check: next present in app:", fs.existsSync(path.join(ROOT, "node_modules", "next")));
  console.log("DONE");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
