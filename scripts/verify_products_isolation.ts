import path from "path";

import dotenv from "dotenv";
dotenv.config({ path: path.join(__dirname, "..", ".env") });

import { GET } from "../src/app/api/products/route";
import { signSessionToken, SESSION_COOKIE_NAME } from "../src/lib/authSession";
import { getDb } from "../src/lib/mongodb";

async function runSecurityIsolationTests() {
  console.log("==================================================");
  console.log("TASK 2 SECURITY FIX: USER ISOLATION VERIFICATION");
  console.log("==================================================");

  let passedAll = true;
  const db = await getDb();
  const journeysCol = db.collection("user_journeys");
  const completionsCol = db.collection("problem_completions");

  // Define isolated test user identities
  const userA = {
    userId: "test_isolated_user_a_id",
    email: "test_isolated_user_a@example.com",
    role: "student",
  };

  const userB = {
    userId: "test_isolated_user_b_id",
    email: "test_isolated_user_b@example.com",
    role: "student",
  };

  const victimUser = {
    userId: "test_victim_user_id",
    email: "test_victim_isolation@example.com",
  };

  const tokenA = signSessionToken({ userId: userA.userId, email: userA.email, role: userA.role });
  const tokenB = signSessionToken({ userId: userB.userId, email: userB.email, role: userB.role });

  try {
    // Setup clean test fixtures in database
    console.log("\n[Setup] Creating isolated test fixtures...");
    await journeysCol.deleteMany({ userId: { $in: [userA.email, userB.email, victimUser.email] } });
    await completionsCol.deleteMany({ userId: { $in: [userA.email, userB.email, victimUser.email] } });

    // User A has 2 completed problems (P000001, P000002) and 1 in-progress (P000003, phase 4)
    await completionsCol.insertMany([
      { userId: userA.email, problemId: "P000001", status: "completed", completedAt: new Date() },
      { userId: userA.email, problemId: "P000002", status: "completed", completedAt: new Date() },
    ]);
    await journeysCol.insertOne({
      userId: userA.email,
      problemId: "P000003",
      status: "in_progress",
      currentPhase: 4,
      updatedAt: new Date(),
    });

    // User B has 1 completed problem (P000005) and 0 in-progress
    await completionsCol.insertOne({
      userId: userB.email,
      problemId: "P000005",
      status: "completed",
      completedAt: new Date(),
    });

    // Victim User has 1 in-progress (P000010, phase 6)
    await journeysCol.insertOne({
      userId: victimUser.email,
      problemId: "P000010",
      status: "in_progress",
      currentPhase: 6,
      updatedAt: new Date(),
    });

    console.log("  ✓ Test fixtures ready: User A (2 completed, 1 in-progress), User B (1 completed), Victim (1 in-progress).");

    // -------------------------------------------------------------------------
    // TEST 1: Unauthenticated request without userId
    // -------------------------------------------------------------------------
    console.log("\n[Test 1] Testing unauthenticated visitor (no session, no params)...");
    const req1 = new Request("http://localhost:3000/api/products?page=1&limit=5");
    const res1 = await GET(req1);
    const data1 = await res1.json();

    const test1Passed =
      res1.status === 200 &&
      data1.authenticated === false &&
      data1.userMetrics.inProgressCount === 0 &&
      data1.userMetrics.completedCount === 0 &&
      data1.unlockProgress.completedBeginner === 0 &&
      data1.unlockProgress.advancedUnlocked === false &&
      data1.products.every((p: any) => p.userStatus === "not_started" && p.completedPhases === 0);

    console.log(`  Authenticated: ${data1.authenticated}`);
    console.log(`  Metrics: inProgress=${data1.userMetrics.inProgressCount}, completed=${data1.userMetrics.completedCount}`);
    console.log(`  Anonymous progress safely blank: ${test1Passed}`);
    if (!test1Passed) {
      console.error("  ❌ FAILED: Unauthenticated request leaked progress or queried shared default_user!");
      passedAll = false;
    } else {
      console.log("  ✓ PASSED: Unauthenticated visitor receives safe default zero-state without querying user records.");
    }

    // -------------------------------------------------------------------------
    // TEST 2: Unauthenticated spoof attempt with ?userId=victim
    // -------------------------------------------------------------------------
    console.log("\n[Test 2] Testing unauthenticated spoof attempt with ?userId=victim@example.com...");
    const req2 = new Request(`http://localhost:3000/api/products?userId=${encodeURIComponent(victimUser.email)}&page=1&limit=20`);
    const res2 = await GET(req2);
    const data2 = await res2.json();

    const test2Passed =
      data2.authenticated === false &&
      data2.userMetrics.inProgressCount === 0 &&
      data2.userMetrics.completedCount === 0 &&
      data2.products.every((p: any) => p.userStatus === "not_started");

    console.log(`  Authenticated: ${data2.authenticated}`);
    console.log(`  Victim inProgress leaked: ${data2.userMetrics.inProgressCount > 0}`);
    console.log(`  Spoofed ?userId ignored: ${test2Passed}`);
    if (!test2Passed) {
      console.error("  ❌ FAILED: Unauthenticated spoof attempt successfully read victim data!");
      passedAll = false;
    } else {
      console.log("  ✓ PASSED: Client-supplied ?userId strictly ignored; victim data completely isolated.");
    }

    // -------------------------------------------------------------------------
    // TEST 3: Authenticated User A via Authorization Header
    // -------------------------------------------------------------------------
    console.log("\n[Test 3] Testing authenticated User A (via Authorization: Bearer token)...");
    const req3 = new Request("http://localhost:3000/api/products?page=1&limit=5", {
      headers: { Authorization: `Bearer ${tokenA}` },
    });
    const res3 = await GET(req3);
    const data3 = await res3.json();

    const p1 = data3.products.find((p: any) => p.problemId === "P000001");
    const p3 = data3.products.find((p: any) => p.problemId === "P000003");

    const test3Passed =
      data3.authenticated === true &&
      data3.userMetrics.completedCount === 2 &&
      data3.userMetrics.inProgressCount === 1 &&
      p1?.userStatus === "completed" &&
      p3?.userStatus === "in_progress" &&
      p3?.currentPhase === 4;

    console.log(`  Authenticated: ${data3.authenticated}`);
    console.log(`  User A Metrics: completed=${data3.userMetrics.completedCount}, inProgress=${data3.userMetrics.inProgressCount}`);
    console.log(`  P000001 status: ${p1?.userStatus}, P000003 status: ${p3?.userStatus} (Phase ${p3?.currentPhase})`);
    if (!test3Passed) {
      console.error("  ❌ FAILED: User A did not receive expected authenticated progress!");
      passedAll = false;
    } else {
      console.log("  ✓ PASSED: User A receives User A's verified progress accurately.");
    }

    // -------------------------------------------------------------------------
    // TEST 4: Authenticated User A attempts to access User B data via ?userId=UserB
    // -------------------------------------------------------------------------
    console.log("\n[Test 4] Testing malicious parameter override: User A session passing ?userId=UserB...");
    const req4 = new Request(`http://localhost:3000/api/products?userId=${encodeURIComponent(userB.email)}&page=1&limit=10`, {
      headers: { Authorization: `Bearer ${tokenA}` },
    });
    const res4 = await GET(req4);
    const data4 = await res4.json();

    const p5UnderUserA = data4.products.find((p: any) => p.problemId === "P000005");

    const test4Passed =
      data4.authenticated === true &&
      data4.userMetrics.completedCount === 2 && // Still User A's 2, not User B's 1
      data4.userMetrics.inProgressCount === 1 && // Still User A's 1
      p5UnderUserA?.userStatus === "not_started"; // User B's completed P000005 must NOT be completed for User A

    console.log(`  Returned completed count: ${data4.userMetrics.completedCount} (User A has 2, User B has 1)`);
    console.log(`  P000005 status under User A session: ${p5UnderUserA?.userStatus}`);
    console.log(`  Override blocked: ${test4Passed}`);
    if (!test4Passed) {
      console.error("  ❌ FAILED: User A was able to access User B's progress via query parameter!");
      passedAll = false;
    } else {
      console.log("  ✓ PASSED: URL parameter override blocked. User A only sees User A's data.");
    }

    // -------------------------------------------------------------------------
    // TEST 5: Authenticated User B via Cookie Header
    // -------------------------------------------------------------------------
    console.log("\n[Test 5] Testing authenticated User B (via Cookie makemistakes_session)...");
    const req5 = new Request("http://localhost:3000/api/products?page=1&limit=10", {
      headers: { Cookie: `${SESSION_COOKIE_NAME}=${tokenB}` },
    });
    const res5 = await GET(req5);
    const data5 = await res5.json();

    const p5UnderUserB = data5.products.find((p: any) => p.problemId === "P000005");
    const p1UnderUserB = data5.products.find((p: any) => p.problemId === "P000001");

    const test5Passed =
      data5.authenticated === true &&
      data5.userMetrics.completedCount === 1 &&
      data5.userMetrics.inProgressCount === 0 &&
      p5UnderUserB?.userStatus === "completed" &&
      p1UnderUserB?.userStatus === "not_started";

    console.log(`  User B Metrics: completed=${data5.userMetrics.completedCount}, inProgress=${data5.userMetrics.inProgressCount}`);
    console.log(`  P000005 status for User B: ${p5UnderUserB?.userStatus}`);
    console.log(`  P000001 status for User B: ${p1UnderUserB?.userStatus}`);
    if (!test5Passed) {
      console.error("  ❌ FAILED: User B did not receive expected distinct progress!");
      passedAll = false;
    } else {
      console.log("  ✓ PASSED: User B receives distinct progress isolated from User A.");
    }

  } finally {
    // Clean up test fixtures safely
    console.log("\n[Cleanup] Removing isolated test fixtures...");
    await journeysCol.deleteMany({ userId: { $in: [userA.email, userB.email, victimUser.email] } });
    await completionsCol.deleteMany({ userId: { $in: [userA.email, userB.email, victimUser.email] } });
    console.log("  ✓ Cleaned up test records from database.");
  }

  console.log("\n==================================================");
  if (passedAll) {
    console.log("ALL USER ISOLATION SECURITY TESTS PASSED!");
  } else {
    console.log("SOME SECURITY TESTS FAILED!");
  }
  console.log("==================================================");

  process.exit(passedAll ? 0 : 1);
}

runSecurityIsolationTests().catch((err) => {
  console.error("Fatal security test error:", err);
  process.exit(1);
});
