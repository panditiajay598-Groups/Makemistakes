import { APPROVED_BY_LEVEL, BuildLevel } from "./levels";

export type ValidationErrorType =
  | "MISSING_ENTRYPOINT"
  | "MISSING_LOCAL_FILE"
  | "PATH_CASING_MISMATCH"
  | "EXPORT_IMPORT_MISMATCH"
  | "MISSING_PACKAGE";

export interface WorkspaceValidationError {
  type: ValidationErrorType;
  message: string;
  file: string;
  importPath?: string;
  suggestedAction?: string;
}

export interface WorkspaceValidationResult {
  valid: boolean;
  errors: WorkspaceValidationError[];
  visitedFiles: string[];
}

/** Supported extensions for local imports */
const LOCAL_EXTENSIONS = [".tsx", ".ts", ".jsx", ".js", "/index.tsx", "/index.ts", "/index.jsx", "/index.js"];

/**
 * Normalizes relative import paths based on current file location.
 */
function resolveImportPath(currentFile: string, importPath: string): string {
  const currentDir = currentFile.includes("/") ? currentFile.substring(0, currentFile.lastIndexOf("/")) : "";

  let rawPath = importPath;
  if (rawPath.startsWith("@/")) {
    rawPath = rawPath.replace(/^@\//, "");
  } else if (rawPath.startsWith("./") || rawPath.startsWith("../")) {
    const parts = (currentDir ? `${currentDir}/${rawPath}` : rawPath).split("/");
    const stack: string[] = [];
    for (const part of parts) {
      if (part === "." || part === "") continue;
      if (part === "..") {
        if (stack.length > 0) stack.pop();
      } else {
        stack.push(part);
      }
    }
    rawPath = stack.join("/");
  }

  return rawPath;
}

/**
 * Validates whether a local import resolves to an exact file in the workspace.
 */
function findWorkspaceFile(
  workspaceFiles: Record<string, string>,
  resolvedPath: string
): { found: boolean; exactMatch: string | null; casingMismatch: boolean } {
  const fileKeys = Object.keys(workspaceFiles);

  const candidatePaths = [
    resolvedPath,
    resolvedPath.replace(/^app\//, ""),
    resolvedPath.startsWith("app/") ? resolvedPath : `app/${resolvedPath}`,
  ];

  // 1. Direct exact match across candidates
  for (const basePath of candidatePaths) {
    if (workspaceFiles[basePath] !== undefined) {
      return { found: true, exactMatch: basePath, casingMismatch: false };
    }
    for (const ext of LOCAL_EXTENSIONS) {
      const candidate = basePath + ext;
      if (workspaceFiles[candidate] !== undefined) {
        return { found: true, exactMatch: candidate, casingMismatch: false };
      }
    }
  }

  // 2. Check case-insensitive match to detect casing mismatch
  for (const basePath of candidatePaths) {
    const lowerResolved = basePath.toLowerCase();
    for (const key of fileKeys) {
      const lowerKey = key.toLowerCase();
      if (lowerKey === lowerResolved) {
        return { found: true, exactMatch: key, casingMismatch: true };
      }
      for (const ext of LOCAL_EXTENSIONS) {
        if (lowerKey === (lowerResolved + ext).toLowerCase()) {
          return { found: true, exactMatch: key, casingMismatch: true };
        }
      }
    }
  }

  return { found: false, exactMatch: null, casingMismatch: false };
}

/**
 * Parses imports and exports from file content.
 */
function parseImportsAndExports(content: string) {
  const imports: Array<{ path: string; named: string[]; defaultImport: string | null }> = [];
  const defaultExport = /export\s+default\s+/g.test(content);
  const namedExports = new Set<string>();

  // Extract named exports
  const exportFuncMatches = content.matchAll(/export\s+(?:function|const|let|var|class)\s+([a-zA-Z0-9_$]+)/g);
  for (const match of exportFuncMatches) {
    namedExports.add(match[1]);
  }

  // Extract named export lists: export { foo, bar };
  const exportListMatches = content.matchAll(/export\s+\{([^}]+)\}/g);
  for (const match of exportListMatches) {
    match[1].split(",").forEach((s) => {
      const item = s.trim().split(/\s+as\s+/)[0].trim();
      if (item) namedExports.add(item);
    });
  }

  // Extract import statements
  // e.g. import { Navbar } from "./Navbar"; or import Navbar from "./Navbar";
  const importRegex = /import\s+(?:type\s+)?(?:([\w$]+)\s*,?\s*)?(?:\{([^}]+)\})?\s*from\s*["']([^"']+)["']/g;
  let match: RegExpExecArray | null;

  while ((match = importRegex.exec(content)) !== null) {
    const defaultImport = match[1] ? match[1].trim() : null;
    const namedRaw = match[2] ? match[2] : "";
    const importPath = match[3];

    const named = namedRaw
      ? namedRaw
          .split(",")
          .map((s) => s.trim().split(/\s+as\s+/)[0].trim())
          .filter(Boolean)
      : [];

    imports.push({ path: importPath, named, defaultImport });
  }

  return { imports, defaultExport, namedExports };
}

/**
 * Validates workspace dependencies before preview runtime launch.
 */
export function validateWorkspaceDependencies(
  workspaceFiles: Record<string, string>,
  level: BuildLevel = "Beginner"
): WorkspaceValidationResult {
  const errors: WorkspaceValidationError[] = [];
  const visited = new Set<string>();

  // Part 1 & 6 — Entrypoint Validation
  const entrypoint = workspaceFiles["app/page.tsx"] ? "app/page.tsx" : workspaceFiles["page.tsx"] ? "page.tsx" : null;

  if (!entrypoint) {
    errors.push({
      type: "MISSING_ENTRYPOINT",
      message: "Entrypoint missing: app/page.tsx not found in workspace",
      file: "app/page.tsx",
      suggestedAction: "Create app/page.tsx in your workspace to render your application.",
    });
    return { valid: false, errors, visitedFiles: [] };
  }

  const approvedPkgs = APPROVED_BY_LEVEL[level] || APPROVED_BY_LEVEL.Beginner;
  const approvedSet = new Set([
    ...approvedPkgs.dependencies,
    ...approvedPkgs.devDependencies,
    "react",
    "react-dom",
    "framer-motion",
    "lucide-react",
    "three",
    "@react-three/fiber",
    "@react-three/drei",
    "next",
    "typescript",
    "tailwindcss",
  ]);

  const queue = [entrypoint];

  while (queue.length > 0) {
    const currentFile = queue.shift()!;
    if (visited.has(currentFile)) continue;
    visited.add(currentFile);

    const content = workspaceFiles[currentFile];
    if (content === undefined) continue;

    const { imports } = parseImportsAndExports(content);

    for (const imp of imports) {
      const isLocal = imp.path.startsWith(".") || imp.path.startsWith("@/");

      if (isLocal) {
        // Part 2 — Local Import Resolution
        const resolvedPath = resolveImportPath(currentFile, imp.path);
        const matchResult = findWorkspaceFile(workspaceFiles, resolvedPath);

        if (!matchResult.found) {
          errors.push({
            type: "MISSING_LOCAL_FILE",
            message: `Missing local import "${imp.path}" referenced in ${currentFile}`,
            file: currentFile,
            importPath: imp.path,
            suggestedAction: `Create ${resolvedPath}.tsx in your BuildOS workspace.`,
          });
        } else if (matchResult.casingMismatch && matchResult.exactMatch) {
          // Part 3 — Case-Sensitive Path Validation
          errors.push({
            type: "PATH_CASING_MISMATCH",
            message: `Filename casing mismatch for "${imp.path}" in ${currentFile}. Workspace file is "${matchResult.exactMatch}".`,
            file: currentFile,
            importPath: imp.path,
            suggestedAction: `Update import statement in ${currentFile} to match exact casing "${matchResult.exactMatch}".`,
          });
        } else if (matchResult.exactMatch) {
          const targetFile = matchResult.exactMatch;
          if (!visited.has(targetFile)) {
            queue.push(targetFile);
          }

          // Part 4 — Export / Import Validation
          const targetContent = workspaceFiles[targetFile];
          if (targetContent) {
            const targetParsed = parseImportsAndExports(targetContent);

            // Check named imports
            for (const namedImp of imp.named) {
              if (!targetParsed.namedExports.has(namedImp) && !targetParsed.defaultExport) {
                errors.push({
                  type: "EXPORT_IMPORT_MISMATCH",
                  message: `Named import "${namedImp}" from "${imp.path}" in ${currentFile} is not exported by ${targetFile}`,
                  file: currentFile,
                  importPath: imp.path,
                  suggestedAction: `Export "${namedImp}" from ${targetFile} or update import statement.`,
                });
              }
            }

            // Check default import
            if (imp.defaultImport && !targetParsed.defaultExport && targetParsed.namedExports.size > 0) {
              const available = Array.from(targetParsed.namedExports).join(", ");
              errors.push({
                type: "EXPORT_IMPORT_MISMATCH",
                message: `Default import "${imp.defaultImport}" from "${imp.path}" in ${currentFile} failed because ${targetFile} has no default export. Available exports: ${available}`,
                file: currentFile,
                importPath: imp.path,
                suggestedAction: `Add "export default" to ${targetFile} or use named import { ${available} }.`,
              });
            }
          }
        }
      } else {
        // Part 5 — External Package Dependency Validation
        const pkgName = imp.path.startsWith("@")
          ? imp.path.split("/").slice(0, 2).join("/")
          : imp.path.split("/")[0];

        if (!approvedSet.has(pkgName) && !pkgName.startsWith("next/")) {
          errors.push({
            type: "MISSING_PACKAGE",
            message: `External package "${pkgName}" referenced in ${currentFile} is not approved or available in ${level} runtime.`,
            file: currentFile,
            importPath: imp.path,
            suggestedAction: `Use pre-installed packages or upgrade BuildOS difficulty level.`,
          });
        }
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    visitedFiles: Array.from(visited),
  };
}
