/**
 * Verification Script for Task 18: Optimize Workspace Generation
 *
 * Verifies:
 * 1. New workspace provision succeeds with proper structure.
 * 2. Concurrent generation requests for the same user + problem are deduplicated into a single operation.
 * 3. User edits are preserved and never overwritten by subsequent ensureWorkspace calls.
 * 4. Repeated ensureWorkspace calls for already-ready workspaces skip redundant writes.
 * 5. Strict user isolation: User A and User B workspaces remain completely separate.
 */

import path from "path";
import fs from "fs";
import dotenv from "dotenv";
dotenv.config({ path: path.join(__dirname, "..", ".env") });

import { ensureWorkspace, getWorkspaceMeta } from "../src/lib/buildos/workspaceService";
import { workspaceDir } from "../src/lib/buildos/paths";
import { getDb } from "../src/lib/mongodb";

let passed = 0;
let failed = 0;

function assert(condition: boolean, name: string, details?: string) {
  if (condition) {
    console.log(`  [PASS] ${name}`);
    passed++;
  } else {
    console.error(`  [FAIL] ${name}${details ? `: ${details}` : ""}`);
    failed++;
  }
}

async function runTask18Verification() {
  console.log("==================================================================");
  console.log("TASK 18 VERIFICATION: OPTIMIZE WORKSPACE GENERATION");
  console.log("==================================================================\n");

  const userA = "test_workspace_opt_user_a@makemistakes.in";
  const userB = "test_workspace_opt_user_b@makemistakes.in";
  const problemId = "P000001";

  const rootA = workspaceDir(userA, problemId);
  const rootB = workspaceDir(userB, problemId);

  // Clean test directories if they exist
  if (fs.existsSync(rootA)) fs.rmSync(rootA, { recursive: true, force: true });
  if (fs.existsSync(rootB)) fs.rmSync(rootB, { recursive: true, force: true });

  const db = await getDb();
  await db.collection("build_workspaces").deleteMany({
    userId: { $in: [userA, userB] },
  });

  // --- Group 1: Initial Provisioning & Concurrent Request Deduplication ---
  console.log("--- Group 1: Workspace Provisioning & In-Flight Concurrency Deduplication ---");
  const [res1, res2] = await Promise.all([
    ensureWorkspace(userA, problemId),
    ensureWorkspace(userA, problemId),
  ]);

  assert(
    res1.workspace.workspaceId === res2.workspace.workspaceId,
    "1.1 Concurrent requests share exact same provision result (deduplicated in-flight)"
  );
  assert(
    res1.workspace.status === "ready" || res1.workspace.status === "created",
    "1.2 Provisioned workspace status is valid"
  );
  assert(
    fs.existsSync(path.join(rootA, "package.json")),
    "1.3 Workspace filesystem structure created successfully"
  );

  // --- Group 2: User Edits Preservation ---
  console.log("\n--- Group 2: User Edits Preservation ---");
  const pagePath = path.join(rootA, "app", "page.tsx");
  const customUserCode = `export default function CustomUserProduct() {\n  return <div>Custom User SaaS App Built By Student</div>;\n}\n`;
  fs.mkdirSync(path.dirname(pagePath), { recursive: true });
  fs.writeFileSync(pagePath, customUserCode, "utf8");

  // Re-run ensureWorkspace on the existing workspace
  const reEnsure = await ensureWorkspace(userA, problemId);
  const pageContentAfter = fs.readFileSync(pagePath, "utf8");
  assert(
    pageContentAfter === customUserCode,
    "2.1 Subsequent ensureWorkspace preserves custom user edits in app/page.tsx without overwriting"
  );

  // --- Group 3: Redundant DB Write Elimination on Ready Workspace ---
  console.log("\n--- Group 3: Skip Redundant DB Write on Ready Workspace ---");
  const metaBefore = await getWorkspaceMeta(userA, problemId);
  const reEnsure2 = await ensureWorkspace(userA, problemId);
  assert(
    reEnsure2.workspace.updatedAt.getTime() === metaBefore?.updatedAt.getTime(),
    "3.1 Already-ready workspace reuses metadata without performing redundant database writes"
  );

  // --- Group 4: Strict User Isolation ---
  console.log("\n--- Group 4: Strict User Isolation ---");
  const resUserB = await ensureWorkspace(userB, problemId);
  assert(
    resUserB.workspace.workspaceId !== res1.workspace.workspaceId,
    "4.1 User B receives distinct isolated workspace ID"
  );
  assert(
    resUserB.root !== res1.root && !resUserB.root.includes(userA),
    "4.2 User B workspace filesystem root is isolated from User A"
  );

  // Cleanup test fixtures
  if (fs.existsSync(rootA)) fs.rmSync(rootA, { recursive: true, force: true });
  if (fs.existsSync(rootB)) fs.rmSync(rootB, { recursive: true, force: true });
  await db.collection("build_workspaces").deleteMany({
    userId: { $in: [userA, userB] },
  });

  console.log("\n==================================================================");
  console.log(`Summary: ${passed} passed, ${failed} failed`);
  console.log("==================================================================");

  if (failed > 0) {
    process.exit(1);
  }
}

runTask18Verification().catch((err) => {
  console.error("Fatal error during Task 18 verification:", err);
  process.exit(1);
});
