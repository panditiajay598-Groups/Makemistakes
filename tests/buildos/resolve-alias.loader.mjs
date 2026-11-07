import { existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const workspaceRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../..");

/**
 * Minimal, dependency-free Node module-resolution loader so the BuildOS
 * security tests can import the real TypeScript source under
 * `node --experimental-strip-types`:
 *
 *  - maps the `@/` tsconfig alias to `./src/`, and
 *  - appends `.ts` to extensionless relative imports that resolve to an
 *    existing `.ts` file.
 */
export async function resolve(specifier, context, nextResolve) {
  let candidate = specifier;

  if (specifier.startsWith("@/")) {
    candidate = "./src/" + specifier.slice(2);
  }

  if (!/\.[a-z0-9]+$/i.test(candidate) && !candidate.endsWith("/")) {
    const base = candidate.startsWith("./") || candidate.startsWith("../")
      ? resolve(dirname(context.parentURL ? fileURLToPath(context.parentURL) : workspaceRoot), candidate)
      : resolve(workspaceRoot, candidate);
    const tsPath = base + ".ts";
    if (existsSync(tsPath)) {
      candidate = tsPath;
    }
  }

  return nextResolve(candidate, context);
}
