import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { findOwnedResource } from "../../src/lib/security/ownedResource.ts";
import { authenticatedIdentityFromSession } from "../../src/lib/security/identity.ts";
import { resolveWorkspaceFile } from "../../src/lib/buildos/workspacePath.ts";
import { scanWorkspaceTreeBounded } from "../../src/lib/buildos/boundedWorkspaceTree.ts";

function makeIdentity(userId) {
  return authenticatedIdentityFromSession({
    userId,
    email: userId,
    iat: 1,
    exp: 2,
  });
}

function makeWorkspaceFixture(root, userId, projectId, marker) {
  const workspaceRoot = path.join(root, userId, projectId);
  fs.mkdirSync(path.join(workspaceRoot, "src"), { recursive: true });
  fs.writeFileSync(path.join(workspaceRoot, "src", "marker.ts"), `export const marker = "${marker}";`);
  return {
    userId,
    projectId,
    workspaceRoot,
  };
}

async function retrieveWorkspace(identity, projectId, records, requestedOwnerId, onRead) {
  const owned = await findOwnedResource(identity.userIds, async (userId) =>
    records.get(`${userId}:${projectId}`) || null
  );
  if (!owned) return null;

  const root = owned.resource.workspaceRoot;
  onRead?.(root, requestedOwnerId);
  const listing = scanWorkspaceTreeBounded(root, {
    maxDepth: 8,
    maxFiles: 20,
    maxEntries: 50,
  }, (filePath) => /\.(?:ts|tsx|js|jsx|json|css|md|mjs)$/.test(filePath), new Set());
  const paths = [];
  const visit = (nodes) => nodes.forEach((node) => {
    if (node.type === "file") paths.push(node.path);
    else visit(node.children);
  });
  visit(listing.tree);
  const file = paths.find((filePath) => filePath.endsWith("marker.ts"));
  return file ? fs.readFileSync(resolveWorkspaceFile(root, file), "utf8") : "";
}

test("authenticated student can retrieve only their own project's workspace files", async (t) => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "nova-isolation-"));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  const studentA = makeWorkspaceFixture(root, "student-a", "project-a", "student-a-private");
  const studentB = makeWorkspaceFixture(root, "student-b", "project-b", "student-b-private");
  const records = new Map([
    [`${studentA.userId}:${studentA.projectId}`, studentA],
    [`${studentB.userId}:${studentB.projectId}`, studentB],
  ]);
  let scannedRoot = "";
  const content = await retrieveWorkspace(
    makeIdentity("student-a"),
    "project-a",
    records,
    "student-b",
    (rootPath) => { scannedRoot = rootPath; }
  );

  assert.match(content, /student-a-private/);
  assert.doesNotMatch(content, /student-b-private/);
  assert.equal(scannedRoot, studentA.workspaceRoot);
});

test("project context is isolated and an unauthorized project fails closed before reading files", async (t) => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "nova-project-isolation-"));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  const projectA = makeWorkspaceFixture(root, "student-a", "project-a", "project-a-only");
  const projectB = makeWorkspaceFixture(root, "student-a", "project-b", "project-b-only");
  const records = new Map([
    [`${projectA.userId}:${projectA.projectId}`, projectA],
    [`${projectB.userId}:${projectB.projectId}`, projectB],
  ]);
  let reads = 0;
  const projectAContent = await retrieveWorkspace(
    makeIdentity("student-a"),
    "project-a",
    records,
    undefined,
    () => { reads++; }
  );
  assert.match(projectAContent, /project-a-only/);
  assert.doesNotMatch(projectAContent, /project-b-only/);

  const unauthorized = await retrieveWorkspace(
    makeIdentity("student-b"),
    "project-a",
    records,
    undefined,
    () => { reads++; }
  );
  assert.equal(unauthorized, null);
  assert.equal(reads, 1);
});

test("workspace file resolution rejects paths escaping the authorized project root", (t) => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "nova-path-boundary-"));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  const projectRoot = path.join(root, "student-a", "project-a");
  fs.mkdirSync(projectRoot, { recursive: true });

  assert.throws(
    () => resolveWorkspaceFile(projectRoot, "../../student-b/project-b/src/marker.ts"),
    /Path traversal is not allowed|outside workspace/
  );
  assert.equal(
    resolveWorkspaceFile(projectRoot, "src/marker.ts"),
    path.join(projectRoot, "src", "marker.ts")
  );
});
