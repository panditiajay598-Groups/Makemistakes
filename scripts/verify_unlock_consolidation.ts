import path from "path";

import dotenv from "dotenv";
dotenv.config({ path: path.join(__dirname, "..", ".env") });

import {
  computeRequiredCount,
  computeUnlockProgress,
  isProblemLocked,
  formatAdvancedLockError,
  calculateUserCompletions,
  getCatalogMeta,
  evaluateUserUnlock,
  BEGINNER_UNLOCK_THRESHOLD,
  INTERMEDIATE_UNLOCK_THRESHOLD,
} from "../src/lib/unlockEligibility";
import { getDb } from "../src/lib/mongodb";
import { signSessionToken } from "../src/lib/authSession";
import { GET as getProblemRoute } from "../src/app/api/journey/problem/route";
import { GET as getProductsRoute } from "../src/app/api/products/route";

async function runUnlockConsolidationTests() {
  console.log("==================================================");
  console.log("TASK 3 VERIFICATION: UNLOCK LOGIC CONSOLIDATION");
  console.log("==================================================");

  let passedAll = true;

  // -------------------------------------------------------------------------
  // 1. Zero completions
  // -------------------------------------------------------------------------
  console.log("\n[Check 1] Zero completions evaluation...");
  const zeroTotals = { beginnerTotal: 180, intermediateTotal: 1024, advancedTotal: 644 };
  const zeroCompletions = { completedBeginner: 0, completedIntermediate: 0 };
  const zeroProgress = computeUnlockProgress(zeroTotals, zeroCompletions);

  const check1Valid =
    zeroProgress.beginnerRequired === 90 &&
    zeroProgress.intermediateRequired === 308 &&
    zeroProgress.advancedUnlocked === false &&
    zeroProgress.completedBeginner === 0 &&
    zeroProgress.completedIntermediate === 0;

  console.log(`  Beginner required: ${zeroProgress.beginnerRequired} (expected 90)`);
  console.log(`  Intermediate required: ${zeroProgress.intermediateRequired} (expected 308)`);
  console.log(`  Advanced unlocked: ${zeroProgress.advancedUnlocked} (expected false)`);
  if (!check1Valid) {
    console.error("  ❌ FAILED: Zero completions test failed!");
    passedAll = false;
  } else {
    console.log("  ✓ PASSED: Zero completions evaluates accurately.");
  }

  // -------------------------------------------------------------------------
  // 2. Immediately below thresholds
  // -------------------------------------------------------------------------
  console.log("\n[Check 2] Immediately below thresholds evaluation...");
  // Case A: 89 / 90 Beginner, 308 / 308 Intermediate
  const belowA = computeUnlockProgress(zeroTotals, { completedBeginner: 89, completedIntermediate: 308 });
  // Case B: 90 / 90 Beginner, 307 / 308 Intermediate
  const belowB = computeUnlockProgress(zeroTotals, { completedBeginner: 90, completedIntermediate: 307 });

  const check2Valid = belowA.advancedUnlocked === false && belowB.advancedUnlocked === false;
  console.log(`  89/90 Beginner, 308/308 Intermediate -> Unlocked: ${belowA.advancedUnlocked} (expected false)`);
  console.log(`  90/90 Beginner, 307/308 Intermediate -> Unlocked: ${belowB.advancedUnlocked} (expected false)`);
  if (!check2Valid) {
    console.error("  ❌ FAILED: Threshold boundary (below) evaluation failed!");
    passedAll = false;
  } else {
    console.log("  ✓ PASSED: Below-threshold conditions correctly block advanced unlocking.");
  }

  // -------------------------------------------------------------------------
  // 3. Exactly at thresholds
  // -------------------------------------------------------------------------
  console.log("\n[Check 3] Exactly at thresholds evaluation...");
  const exact = computeUnlockProgress(zeroTotals, { completedBeginner: 90, completedIntermediate: 308 });
  const check3Valid = exact.advancedUnlocked === true;
  console.log(`  90/90 Beginner, 308/308 Intermediate -> Unlocked: ${exact.advancedUnlocked} (expected true)`);
  if (!check3Valid) {
    console.error("  ❌ FAILED: Exactly-at-threshold evaluation failed!");
    passedAll = false;
  } else {
    console.log("  ✓ PASSED: Exactly meeting both thresholds unlocks advanced challenges.");
  }

  // -------------------------------------------------------------------------
  // 4. Above thresholds
  // -------------------------------------------------------------------------
  console.log("\n[Check 4] Above thresholds evaluation...");
  const above = computeUnlockProgress(zeroTotals, { completedBeginner: 120, completedIntermediate: 450 });
  const check4Valid = above.advancedUnlocked === true;
  console.log(`  120/90 Beginner, 450/308 Intermediate -> Unlocked: ${above.advancedUnlocked} (expected true)`);
  if (!check4Valid) {
    console.error("  ❌ FAILED: Above-threshold evaluation failed!");
    passedAll = false;
  } else {
    console.log("  ✓ PASSED: Exceeding thresholds maintains unlocked status.");
  }

  // -------------------------------------------------------------------------
  // 5. Correct percentage rounding (Math.ceil)
  // -------------------------------------------------------------------------
  console.log("\n[Check 5] Percentage rounding (Math.ceil) verification...");
  const ceilTests = [
    { total: 1, percent: BEGINNER_UNLOCK_THRESHOLD, expected: 1 }, // 0.5 -> 1
    { total: 3, percent: BEGINNER_UNLOCK_THRESHOLD, expected: 2 }, // 1.5 -> 2
    { total: 180, percent: BEGINNER_UNLOCK_THRESHOLD, expected: 90 }, // 90 -> 90
    { total: 1, percent: INTERMEDIATE_UNLOCK_THRESHOLD, expected: 1 }, // 0.3 -> 1
    { total: 4, percent: INTERMEDIATE_UNLOCK_THRESHOLD, expected: 2 }, // 1.2 -> 2
    { total: 1024, percent: INTERMEDIATE_UNLOCK_THRESHOLD, expected: 308 }, // 307.2 -> 308
  ];

  let check5Valid = true;
  for (const t of ceilTests) {
    const res = computeRequiredCount(t.total, t.percent);
    if (res !== t.expected) {
      console.error(`  ❌ Rounding error: total=${t.total}, pct=${t.percent}, expected=${t.expected}, got=${res}`);
      check5Valid = false;
    }
  }
  if (!check5Valid) {
    passedAll = false;
  } else {
    console.log("  ✓ PASSED: All ceiling rounding cases match mathematical specifications.");
  }

  // -------------------------------------------------------------------------
  // 6. Hardened empty / missing category counts (fail-closed check)
  // -------------------------------------------------------------------------
  console.log("\n[Check 6] Hardened empty / missing totals (fail-closed defense)...");
  // Case A: Both totals are zero
  const zeroBoth = computeUnlockProgress(
    { beginnerTotal: 0, intermediateTotal: 0, advancedTotal: 644 },
    { completedBeginner: 0, completedIntermediate: 0 }
  );
  // Case B: beginnerTotal is 0, intermediateTotal is valid
  const zeroBeginner = computeUnlockProgress(
    { beginnerTotal: 0, intermediateTotal: 1024, advancedTotal: 644 },
    { completedBeginner: 0, completedIntermediate: 500 }
  );
  // Case C: intermediateTotal is 0, beginnerTotal is valid
  const zeroIntermediate = computeUnlockProgress(
    { beginnerTotal: 180, intermediateTotal: 0, advancedTotal: 644 },
    { completedBeginner: 100, completedIntermediate: 0 }
  );

  const check6Valid =
    zeroBoth.advancedUnlocked === false &&
    zeroBeginner.advancedUnlocked === false &&
    zeroIntermediate.advancedUnlocked === false &&
    zeroBoth.beginnerRequired === 0 &&
    zeroBoth.intermediateRequired === 0;

  console.log(`  Both zero totals: reqB=0, reqI=0 -> advancedUnlocked: ${zeroBoth.advancedUnlocked} (expected false)`);
  console.log(`  Zero beginner total: advancedUnlocked: ${zeroBeginner.advancedUnlocked} (expected false)`);
  console.log(`  Zero intermediate total: advancedUnlocked: ${zeroIntermediate.advancedUnlocked} (expected false)`);

  if (!check6Valid) {
    console.error("  ❌ FAILED: Empty totals fail-closed defense failed!");
    passedAll = false;
  } else {
    console.log("  ✓ PASSED: Empty or missing prerequisite totals fail closed safely (Advanced remains locked).");
  }

  // -------------------------------------------------------------------------
  // 7. Individual problem lock eligibility rules
  // -------------------------------------------------------------------------
  console.log("\n[Check 7] Individual problem isLocked rules verification...");
  const lockCases = [
    { diff: "Beginner", unlocked: false, status: "not_started" as const, expected: false },
    { diff: "Intermediate", unlocked: false, status: "not_started" as const, expected: false },
    { diff: "Advanced", unlocked: false, status: "not_started" as const, expected: true },
    { diff: "Advanced", unlocked: false, status: "in_progress" as const, expected: false }, // started problems not locked
    { diff: "Advanced", unlocked: false, status: "completed" as const, expected: false }, // completed problems not locked
    { diff: "Advanced", unlocked: true, status: "not_started" as const, expected: false }, // unlocked advanced problems open
  ];

  let check7Valid = true;
  for (const c of lockCases) {
    const isLocked = isProblemLocked({
      difficulty: c.diff,
      advancedUnlocked: c.unlocked,
      userStatus: c.status,
    });
    if (isLocked !== c.expected) {
      console.error(`  ❌ Lock mismatch: diff=${c.diff}, unlocked=${c.unlocked}, status=${c.status}: expected ${c.expected}, got ${isLocked}`);
      check7Valid = false;
    }
  }
  if (!check7Valid) {
    passedAll = false;
  } else {
    console.log("  ✓ PASSED: Individual problem isLocked logic fully verified.");
  }

  // -------------------------------------------------------------------------
  // 8. Shared utility consistency with /api/products
  // -------------------------------------------------------------------------
  console.log("\n[Check 8] Verifying consistency between unlockEligibility and /api/products...");
  const db = await getDb();
  const directEval = await evaluateUserUnlock(db, null);
  const reqProd = new Request("http://localhost:3000/api/products?page=1&limit=5");
  const resProd = await (await getProductsRoute(reqProd)).json();

  const check8Valid =
    resProd.unlockProgress.beginnerTotal === directEval.unlockProgress.beginnerTotal &&
    resProd.unlockProgress.intermediateTotal === directEval.unlockProgress.intermediateTotal &&
    resProd.unlockProgress.advancedTotal === directEval.unlockProgress.advancedTotal &&
    resProd.unlockProgress.beginnerRequired === directEval.unlockProgress.beginnerRequired &&
    resProd.unlockProgress.intermediateRequired === directEval.unlockProgress.intermediateRequired &&
    resProd.unlockProgress.advancedUnlocked === directEval.unlockProgress.advancedUnlocked;

  console.log(`  /api/products totals: B=${resProd.unlockProgress.beginnerTotal}, I=${resProd.unlockProgress.intermediateTotal}, A=${resProd.unlockProgress.advancedTotal}`);
  console.log(`  evaluateUserUnlock:   B=${directEval.unlockProgress.beginnerTotal}, I=${directEval.unlockProgress.intermediateTotal}, A=${directEval.unlockProgress.advancedTotal}`);
  if (!check8Valid) {
    console.error("  ❌ FAILED: Discrepancy between /api/products and evaluateUserUnlock!");
    passedAll = false;
  } else {
    console.log("  ✓ PASSED: /api/products directly uses shared unlock engine with identical results.");
  }

  // -------------------------------------------------------------------------
  // 9. Consistency with /api/journey/problem
  // -------------------------------------------------------------------------
  console.log("\n[Check 9] Verifying /api/journey/problem unlock enforcement...");
  // Find an Advanced problem from catalog
  const catalogMeta = await getCatalogMeta(db);
  let advancedProblemId = "";
  for (const [pid, diff] of catalogMeta.problemDifficulties.entries()) {
    if (diff === "Advanced") {
      advancedProblemId = pid;
      break;
    }
  }

  console.log(`  Testing Advanced problem: ${advancedProblemId}`);
  // Unauthenticated request to advanced problem
  const reqAdvAnon = new Request(`http://localhost:3000/api/journey/problem?id=${advancedProblemId}`);
  const resAdvAnon = await getProblemRoute(reqAdvAnon);
  const dataAdvAnon = await resAdvAnon.json();

  const check9Valid =
    resAdvAnon.status === 403 &&
    dataAdvAnon.locked === true &&
    typeof dataAdvAnon.error === "string" &&
    dataAdvAnon.error.includes("Advanced problems are locked") &&
    dataAdvAnon.unlockProgress.advancedUnlocked === false;

  console.log(`  Unauthenticated Advanced access status: ${resAdvAnon.status} (expected 403)`);
  console.log(`  Locked flag returned: ${dataAdvAnon.locked}`);
  console.log(`  Error message format: ${dataAdvAnon.error?.slice(0, 50)}...`);
  if (!check9Valid) {
    console.error("  ❌ FAILED: /api/journey/problem did not enforce shared unlock rules properly!");
    passedAll = false;
  } else {
    console.log("  ✓ PASSED: /api/journey/problem enforces unified unlock rules via shared engine.");
  }

  // -------------------------------------------------------------------------
  // 10. Authenticated in-progress exemption
  // -------------------------------------------------------------------------
  console.log("\n[Check 10] In-progress advanced problem access exemption...");
  const testEmail = "test_task3_unlock_exemption@example.com";
  const testToken = signSessionToken({ userId: "test_task3_uid", email: testEmail, role: "student" });
  const journeysCol = db.collection("user_journeys");

  try {
    // Add active journey for this advanced problem
    await journeysCol.insertOne({
      userId: testEmail,
      problemId: advancedProblemId,
      status: "in_progress",
      currentPhase: 2,
      updatedAt: new Date(),
    });

    const reqAdvActive = new Request(`http://localhost:3000/api/journey/problem?id=${advancedProblemId}`, {
      headers: { Authorization: `Bearer ${testToken}` },
    });
    const resAdvActive = await getProblemRoute(reqAdvActive);
    const dataAdvActive = await resAdvActive.json();

    const check10Valid = resAdvActive.status === 200 && dataAdvActive.problemId === advancedProblemId;
    console.log(`  User with active journey access status: ${resAdvActive.status} (expected 200)`);
    console.log(`  Problem loaded successfully: ${dataAdvActive.problemId === advancedProblemId}`);

    if (!check10Valid) {
      console.error("  ❌ FAILED: User with active journey was improperly blocked!");
      passedAll = false;
    } else {
      console.log("  ✓ PASSED: User with active session on advanced challenge retains full access.");
    }
  } finally {
    await journeysCol.deleteOne({ userId: testEmail, problemId: advancedProblemId });
  }

  console.log("\n==================================================");
  if (passedAll) {
    console.log("ALL TASK 3 UNLOCK CONSOLIDATION TESTS PASSED!");
  } else {
    console.log("SOME UNLOCK TESTS FAILED!");
  }
  console.log("==================================================");

  process.exit(passedAll ? 0 : 1);
}

runUnlockConsolidationTests().catch((err) => {
  console.error("Fatal error in unlock consolidation tests:", err);
  process.exit(1);
});
