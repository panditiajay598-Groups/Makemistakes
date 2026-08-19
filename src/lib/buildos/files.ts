import fs from "fs";
import path from "path";
import {
  ensureDir,
  isEditableRelativePath,
  resolveWorkspaceFile,
  resolveTemplateDir,
} from "./paths";
import type { BuildLevel } from "./levels";

const SKIP_COPY = new Set(["node_modules", ".next", ".git"]);
const SKIP_TREE = new Set(["node_modules", ".next", ".git", ".buildos-meta.json"]);

export function assertTemplateExists(level: BuildLevel = "Beginner") {
  const dir = resolveTemplateDir(level);
  const pkg = path.join(dir, "package.json");
  if (!fs.existsSync(pkg)) {
    throw new Error(`${level} template package.json missing`);
  }
}

/** Recursively copy level template into a fresh workspace (no node_modules). */
export function copyTemplateToWorkspace(destRoot: string, level: BuildLevel = "Beginner") {
  assertTemplateExists(level);
  ensureDir(destRoot);
  copyDir(resolveTemplateDir(level), destRoot);
}

function copyDir(src: string, dest: string) {
  ensureDir(dest);
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    if (SKIP_COPY.has(entry.name)) continue;
    const from = path.join(src, entry.name);
    const to = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDir(from, to);
    } else if (entry.isFile()) {
      fs.copyFileSync(from, to);
    }
  }
}

export type WorkspaceFileNode =
  | { type: "file"; name: string; path: string }
  | { type: "dir"; name: string; path: string; children: WorkspaceFileNode[] };

export function listWorkspaceTree(root: string): WorkspaceFileNode[] {
  return readDirNodes(root, "");
}

function readDirNodes(absDir: string, rel: string): WorkspaceFileNode[] {
  if (!fs.existsSync(absDir)) return [];
  const entries = fs.readdirSync(absDir, { withFileTypes: true });
  const nodes: WorkspaceFileNode[] = [];

  for (const entry of entries.sort((a, b) => a.name.localeCompare(b.name))) {
    if (SKIP_TREE.has(entry.name)) continue;
    const childRel = rel ? `${rel}/${entry.name}` : entry.name;
    const childAbs = path.join(absDir, entry.name);
    if (entry.isDirectory()) {
      nodes.push({
        type: "dir",
        name: entry.name,
        path: childRel,
        children: readDirNodes(childAbs, childRel),
      });
    } else if (entry.isFile() && isEditableRelativePath(childRel)) {
      nodes.push({ type: "file", name: entry.name, path: childRel });
    }
  }
  return nodes;
}

export function readWorkspaceTextFile(root: string, relativePath: string): string {
  if (!isEditableRelativePath(relativePath)) {
    throw new Error("File type not allowed");
  }
  const abs = resolveWorkspaceFile(root, relativePath);
  if (!fs.existsSync(abs)) throw new Error("File not found");
  return fs.readFileSync(abs, "utf8");
}

export function writeWorkspaceTextFile(
  root: string,
  relativePath: string,
  content: string,
  level: BuildLevel = "Beginner"
) {
  if (!isEditableRelativePath(relativePath)) {
    throw new Error("File type not allowed");
  }
  const abs = resolveWorkspaceFile(root, relativePath);
  ensureDir(path.dirname(abs));
  let finalContent = content;
  if (relativePath.replace(/\\/g, "/") === "package.json") {
    finalContent = lockApprovedPackageJson(content, level);
  }
  fs.writeFileSync(abs, finalContent, "utf8");
}

export function createWorkspaceFile(
  root: string,
  relativePath: string,
  content = "",
  level: BuildLevel = "Beginner"
) {
  writeWorkspaceTextFile(root, relativePath, content, level);
}

export function deleteWorkspaceFile(root: string, relativePath: string) {
  if (!isEditableRelativePath(relativePath)) {
    throw new Error("File type not allowed");
  }
  const protectedFiles = new Set(["package.json", "app/page.tsx", "app/layout.tsx"]);
  if (protectedFiles.has(relativePath.replace(/\\/g, "/"))) {
    throw new Error("This core file cannot be deleted");
  }
  const abs = resolveWorkspaceFile(root, relativePath);
  if (!fs.existsSync(abs)) throw new Error("File not found");
  const stat = fs.statSync(abs);
  if (stat.isDirectory()) {
    fs.rmSync(abs, { recursive: true, force: true });
  } else {
    fs.unlinkSync(abs);
  }
}

export function readAllEditableFiles(root: string): Record<string, string> {
  const out: Record<string, string> = {};
  const walk = (nodes: WorkspaceFileNode[]) => {
    for (const n of nodes) {
      if (n.type === "file") {
        out[n.path] = readWorkspaceTextFile(root, n.path);
      } else {
        walk(n.children);
      }
    }
  };
  walk(listWorkspaceTree(root));
  return out;
}

/** Students cannot change the approved dependency set for their level. */
export function lockApprovedPackageJson(
  incoming: string,
  level: BuildLevel = "Beginner"
): string {
  const templatePkg = JSON.parse(
    fs.readFileSync(path.join(resolveTemplateDir(level), "package.json"), "utf8")
  );
  let parsed: Record<string, unknown>;
  try {
    parsed = JSON.parse(incoming);
  } catch {
    return JSON.stringify(templatePkg, null, 2) + "\n";
  }
  return (
    JSON.stringify(
      {
        ...parsed,
        name: typeof parsed.name === "string" ? parsed.name : templatePkg.name,
        private: true,
        scripts: templatePkg.scripts,
        dependencies: templatePkg.dependencies,
        devDependencies: templatePkg.devDependencies,
      },
      null,
      2
    ) + "\n"
  );
}
