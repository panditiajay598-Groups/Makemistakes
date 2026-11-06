import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const sourceRoot = path.join(projectRoot, "src");
const fixtureRoot = path.join(projectRoot, "tests", "nova", "routeFixtures");

function resolveFile(basePath) {
  const candidates = [
    basePath,
    `${basePath}.ts`,
    `${basePath}.tsx`,
    `${basePath}.js`,
    `${basePath}.mjs`,
    path.join(basePath, "index.ts"),
  ];
  return candidates.find((candidate) => fs.existsSync(candidate) && fs.statSync(candidate).isFile());
}

export async function resolve(specifier, context, nextResolve) {
  if (specifier === "next/server") {
    return {
      url: pathToFileURL(path.join(projectRoot, "node_modules", "next", "server.js")).href,
      shortCircuit: true,
    };
  }
  if (specifier === "@/lib/mongodb") {
    return { url: pathToFileURL(path.join(fixtureRoot, "mockMongo.mjs")).href, shortCircuit: true };
  }
  if (specifier === "@/lib/paymentService") {
    return { url: pathToFileURL(path.join(fixtureRoot, "mockPaymentService.mjs")).href, shortCircuit: true };
  }
  if (specifier === "@backend/lib/prisma") {
    return { url: pathToFileURL(path.join(fixtureRoot, "mockPrisma.mjs")).href, shortCircuit: true };
  }
  if (specifier.startsWith("@/")) {
    const resolved = resolveFile(path.join(sourceRoot, specifier.slice(2)));
    if (resolved) return { url: pathToFileURL(resolved).href, shortCircuit: true };
  }
  if (specifier.startsWith("@backend/")) {
    const resolved = resolveFile(path.join(projectRoot, "backend", specifier.slice("@backend/".length)));
    if (resolved) return { url: pathToFileURL(resolved).href, shortCircuit: true };
  }
  if (specifier.startsWith(".") && context.parentURL?.startsWith("file:")) {
    const parentPath = fileURLToPath(context.parentURL);
    const resolved = resolveFile(path.resolve(path.dirname(parentPath), specifier));
    if (resolved) return { url: pathToFileURL(resolved).href, shortCircuit: true };
  }
  return nextResolve(specifier, context);
}
