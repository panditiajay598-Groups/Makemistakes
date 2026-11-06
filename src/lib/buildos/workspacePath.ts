import path from "path";

export function resolveWorkspaceFile(workspaceRoot: string, relativePath: string): string {
  const normalized = relativePath.replace(/\\/g, "/").replace(/^\/+/, "");
  if (!normalized || normalized.includes("\0")) {
    throw new Error("Invalid file path");
  }
  if (normalized.split("/").some((segment) => segment === ".." || segment === ".")) {
    throw new Error("Path traversal is not allowed");
  }
  const absolutePath = path.resolve(workspaceRoot, normalized);
  const root = path.resolve(workspaceRoot);
  if (absolutePath !== root && !absolutePath.startsWith(root + path.sep)) {
    throw new Error("File is outside workspace");
  }
  return absolutePath;
}
