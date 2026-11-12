import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import {
  verifyWorkspacePackages,
  installWorkspaceDependencies,
} from "../../src/lib/buildos/install.ts";
import {
  getWorkspaceMeta,
  upsertWorkspaceMeta,
} from "../../src/lib/buildos/workspaceService.ts";

// ------------------------------------------------ helpers

const BEGINNER_DEPS = [
  "next",
  "react",
  "react-dom",
  "framer-motion",
  "lucide-react",
  "three",
  "@react-three/fiber",
  "@react-three/drei",
];

const BEGINNER_DEV_DEPS = [
  "typescript",
  "@types/node",
  "@types/react",
  "@types/react-dom",
  "@types/three",
  "tailwindcss",
  "@tailwindcss/postcss",
];

/**
 * Create a synthetic but structurally complete Beginner workspace: a package.json
 * declaring every approved dependency and a node_modules tree with stub entries
 * for each approved package (enough for verifyWorkspacePackages to pass).
 */
function makeCompleteWorkspace(root) {
  const dependencies = {};
  const devDependencies = {};
  for (const d of BEGINNER_DEPS) dependencies[d] = "1.0.0";
  for (const d of BEGINNER_DEV_DEPS) devDependencies[d] = "1.0.0";

  fs.writeFileSync(
    path.join(root, "package.json"),
    JSON.stringify({ name: "student-workspace", private: true, dependencies, devDependencies }, null, 2)
  );

  for (const d of [...BEGINNER_DEPS, ...BEGINNER_DEV_DEPS]) {
    fs.mkdirSync(path.join(root, "node_modules", ...d.split("/")), { recursive: true });
  }
}

function makeTempDir(t, prefix) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), prefix));
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }));
  return dir;
}

// ------------------------------------------------ provision / verify

test("verifyWorkspacePackages reports ready for a complete Beginner workspace", (t) => {
  const root = makeTempDir(t, "buildos-verify-ok-");
  makeCompleteWorkspace(root);

  const result = verifyWorkspacePackages(root, "Beginner");

  assert.equal(result.ok, true);
  assert.equal(result.checks.node, true);
  assert.equal(result.checks.next, true);
  assert.equal(result.checks.react, true);
  assert.equal(result.checks.typescript, true);
  assert.equal(result.checks.ui, true);
  assert.equal(result.checks.three, true);
  assert.equal(result.missing.length, 0);
  assert.match(result.message, /ready/i);
});

test("verifyWorkspacePackages reports failure when package.json is missing", (t) => {
  const root = makeTempDir(t, "buildos-verify-nopkg-");

  const result = verifyWorkspacePackages(root, "Beginner");

  assert.equal(result.ok, false);
  assert.ok(result.missing.includes("package.json"));
});

test("verifyWorkspacePackages reports failure when a required dependency is absent", (t) => {
  const root = makeTempDir(t, "buildos-verify-nodep-");
  makeCompleteWorkspace(root);

  // Remove `three` from both declarations and node_modules.
  const pkgPath = path.join(root, "package.json");
  const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));
  delete pkg.dependencies.three;
  fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2));
  fs.rmSync(path.join(root, "node_modules", "three"), { recursive: true, force: true });

  const result = verifyWorkspacePackages(root, "Beginner");

  assert.equal(result.ok, false);
  assert.ok(result.missing.some((m) => m.includes("three")));
});

test("verifyWorkspacePackages reports failure when node_modules is missing", (t) => {
  const root = makeTempDir(t, "buildos-verify-nonm-");
  makeCompleteWorkspace(root);
  fs.rmSync(path.join(root, "node_modules"), { recursive: true, force: true });

  const result = verifyWorkspacePackages(root, "Beginner");

  assert.equal(result.ok, false);
  assert.ok(result.missing.includes("node_modules"));
});

// ------------------------------------------------ install error handling

test("installWorkspaceDependencies reports ok:false and preserves the error when provisioning fails", async (t) => {
  const root = makeTempDir(t, "buildos-install-fail-");

  // Make ensureDir(workspaceRoot) throw by placing a regular file where a
  // directory component is expected, so the outer catch is exercised.
  const badRoot = path.join(root, "blocker", "workspace");
  fs.writeFileSync(path.join(root, "blocker"), "");

  const result = await installWorkspaceDependencies(badRoot, "Beginner");

  assert.equal(result.ok, false);
  assert.ok(result.error && result.error.length > 0, "expected a meaningful error message");
  assert.ok(Array.isArray(result.logs) && result.logs.length > 0);
});

test("installWorkspaceDependencies reports failure when node_modules link fails or verify fails", async (t) => {
  // A workspace whose package.json declares approved deps but has no usable
  // node_modules must not be reported as a successful install.
  const root = makeTempDir(t, "buildos-install-nonm-");
  const dependencies = {};
  for (const d of BEGINNER_DEPS) dependencies[d] = "1.0.0";
  fs.writeFileSync(
    path.join(root, "package.json"),
    JSON.stringify({ name: "x", private: true, dependencies }, null, 2)
  );

  const result = await installWorkspaceDependencies(root, "Beginner");

  // Either the symlink to an existing parent node_modules succeeded and the
  // approved Beginner set verified, or we must have reported an honest failure.
  if (result.ok) {
    assert.equal(fs.existsSync(path.join(root, "node_modules")), true);
  } else {
    assert.ok(result.error && result.error.length > 0);
  }
});

// ------------------------------------------------ meta persistence / recovery

test("workspace meta persists an error state and recovers to ready", async (t) => {
  const userId = `buildos-test-user-${Date.now()}`;
  const problemId = "P-TEST-RECOVERY";
  const workspaceRoot = path.join(
    process.cwd(),
    "data",
    "student-workspaces",
    userId,
    problemId
  );
  t.after(() => fs.rmSync(workspaceRoot, { recursive: true, force: true }));

  // 1. Write an error state with a meaningful lastError.
  await upsertWorkspaceMeta({
    userId,
    problemId,
    status: "error",
    lastError: "npm install timed out (10 minutes)",
  });
  const errored = await getWorkspaceMeta(userId, problemId);
  assert.equal(errored.status, "error");
  assert.equal(errored.lastError, "npm install timed out (10 minutes)");

  // 2. Recover to ready and confirm the error is cleared.
  await upsertWorkspaceMeta({ userId, problemId, status: "ready", lastError: null });
  const recovered = await getWorkspaceMeta(userId, problemId);
  assert.equal(recovered.status, "ready");
  assert.equal(recovered.lastError, null);
  assert.ok(recovered.updatedAt instanceof Date);
});
