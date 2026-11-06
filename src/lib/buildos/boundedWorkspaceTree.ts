import fs from "node:fs";
import path from "node:path";

export type BoundedWorkspaceFileNode =
  | { type: "file"; name: string; path: string }
  | { type: "dir"; name: string; path: string; children: BoundedWorkspaceFileNode[] };

export type BoundedWorkspaceTreeLimits = {
  maxDepth: number;
  maxFiles: number;
  maxEntries: number;
};

export type BoundedWorkspaceTree = {
  tree: BoundedWorkspaceFileNode[];
  fileCount: number;
  truncated: boolean;
};

export function scanWorkspaceTreeBounded(
  root: string,
  limits: BoundedWorkspaceTreeLimits,
  isAllowedFile: (relativePath: string) => boolean,
  ignoredNames: ReadonlySet<string>
): BoundedWorkspaceTree {
  let entriesRead = 0;
  let fileCount = 0;
  let truncated = false;

  const readNodes = (absoluteDir: string, relativeDir: string, depth: number): BoundedWorkspaceFileNode[] => {
    if (depth > limits.maxDepth) {
      truncated = true;
      return [];
    }

    let directory: fs.Dir;
    try {
      directory = fs.opendirSync(absoluteDir);
    } catch (error) {
      const code = error && typeof error === "object" && "code" in error
        ? error.code
        : undefined;
      if (code === "ENOENT") return [];
      if (code === "EACCES" || code === "EPERM") {
        truncated = true;
        return [];
      }
      throw error;
    }

    const nodes: BoundedWorkspaceFileNode[] = [];
    try {
      while (entriesRead < limits.maxEntries && fileCount < limits.maxFiles) {
        const entry = directory.readSync();
        if (!entry) break;
        entriesRead++;
        if (ignoredNames.has(entry.name)) continue;

        const relativePath = relativeDir ? `${relativeDir}/${entry.name}` : entry.name;
        const absolutePath = path.join(absoluteDir, entry.name);
        if (entry.isDirectory()) {
          nodes.push({
            type: "dir",
            name: entry.name,
            path: relativePath,
            children: readNodes(absolutePath, relativePath, depth + 1),
          });
        } else if (entry.isFile() && isAllowedFile(relativePath)) {
          nodes.push({ type: "file", name: entry.name, path: relativePath });
          fileCount++;
        }
      }

      if (entriesRead >= limits.maxEntries || fileCount >= limits.maxFiles) {
        truncated = true;
      }
    } finally {
      directory.closeSync();
    }
    return nodes;
  };

  return { tree: readNodes(root, "", 0), fileCount, truncated };
}
