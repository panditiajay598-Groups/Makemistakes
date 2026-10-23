import path from "path";

import dotenv from "dotenv";
dotenv.config({ path: path.join(__dirname, "..", ".env") });

import { getDb } from "../src/lib/mongodb";
import { POST as completePost } from "../src/app/api/journey/complete/route";
import { JUSTIFIED_INDEXES } from "../src/lib/dbIndexes";

async function runCompletionApiTests() {
  console.log("==================================================");
  console.log("TASK 5 VERIFICATION: COMPLETION API INDEX AUDIT");
  console.log("==================================================");

  let passedAll = true;
  const db = await getDb();
  const completionsCol = db.collection("problem_completions");

  // -------------------------------------------------------------------------
  // Check 1: Centralized index registration verification
  // -------------------------------------------------------------------------
  console.log("\n[Check 1] Verifying centralized index registration for completions...");
  const completionDef = JUSTIFIED_INDEXES.find(
    (def) => def.collection === "problem_completions" && def.options.name === "userId_1_problemId_1"
  );

  if (!completionDef) {
    console.error("  ❌ FAILED: problem_completions index missing from JUSTIFIED_INDEXES!");
    passedAll = false;
  } else {
    console.log(`  ✓ PASSED: Found index in JUSTIFIED_INDEXES: ${completionDef.options.name}`);
    console.log(`    Keys: ${JSON.stringify(completionDef.spec)} | unique: ${!!completionDef.options.unique}`);
  }

  // -------------------------------------------------------------------------
  // Check 2: Physical existence of completion index in MongoDB
  // -------------------------------------------------------------------------
  console.log("\n[Check 2] Verifying physical index in MongoDB database...");
  const indexes = await completionsCol.indexes();
  const physicalIdx = indexes.find((i) => i.name === "userId_1_problemId_1");

  if (!physicalIdx || !physicalIdx.unique) {
    console.error("  ❌ FAILED: Physical index on problem_completions missing or non-unique!");
    passedAll = false;
  } else {
    console.log(`  ✓ PASSED: Physical index verified on MongoDB Atlas: "${physicalIdx.name}" (unique=${!!physicalIdx.unique})`);
  }

  // -------------------------------------------------------------------------
  // Check 3: Functional POST /api/journey/complete execution & idempotency
  // -------------------------------------------------------------------------
  console.log("\n[Check 3] Testing POST /api/journey/complete execution & idempotency...");
  const testUserId = "test_qa_completion_user_task5@example.com";
  const testProblemId = "P000001";

  try {
    // Clean up any pre-existing test document
    await completionsCol.deleteOne({ userId: testUserId, problemId: testProblemId });

    // Request 1: First completion
    const req1 = new Request("http://localhost:3000/api/journey/complete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: testUserId, problemId: testProblemId }),
    });

    const res1 = await completePost(req1);
    const data1 = await res1.json();

    const check3A =
      res1.status === 200 &&
      data1.success === true &&
      data1.completedProblem?.problemId === testProblemId &&
      data1.nextProblem !== undefined;

    console.log(`  First completion status: ${res1.status}, success: ${data1.success}`);
    console.log(`  Completed problem: ${data1.completedProblem?.problemId}`);
    console.log(`  Next problem selected: ${data1.nextProblem?.problemId}`);

    if (!check3A) {
      console.error("  ❌ FAILED: First completion failed!");
      passedAll = false;
    } else {
      console.log("  ✓ PASSED: Initial completion succeeded with valid response payload.");
    }

    // Verify document in DB
    const docAfter1 = await completionsCol.findOne({ userId: testUserId, problemId: testProblemId });
    if (!docAfter1 || docAfter1.status !== "completed") {
      console.error("  ❌ FAILED: Completion document was not saved!");
      passedAll = false;
    }

    // Request 2: Idempotent second completion for the same user and problem
    const req2 = new Request("http://localhost:3000/api/journey/complete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: testUserId, problemId: testProblemId }),
    });

    const res2 = await completePost(req2);
    const data2 = await res2.json();

    const check3B =
      res2.status === 200 &&
      data2.success === true &&
      data2.completedProblem?.problemId === testProblemId;

    console.log(`  Second completion status: ${res2.status}, success: ${data2.success}`);

    if (!check3B) {
      console.error("  ❌ FAILED: Idempotent repeat completion failed!");
      passedAll = false;
    } else {
      console.log("  ✓ PASSED: Repeat completion executed idempotently without errors.");
    }

    // Verify total count for this user + problem is still exactly 1
    const totalMatching = await completionsCol.countDocuments({ userId: testUserId, problemId: testProblemId });
    if (totalMatching !== 1) {
      console.error(`  ❌ FAILED: Duplicate completion documents created: ${totalMatching}!`);
      passedAll = false;
    } else {
      console.log(`  ✓ PASSED: Exactly 1 document exists in problem_completions for user + problem.`);
    }

  } finally {
    // Cleanup test record
    await completionsCol.deleteOne({ userId: testUserId, problemId: testProblemId });
  }

  // -------------------------------------------------------------------------
  // Check 4: User isolation in completions
  // -------------------------------------------------------------------------
  console.log("\n[Check 4] Testing user isolation in completions...");
  const userA = "test_user_a_task5@example.com";
  const userB = "test_user_b_task5@example.com";

  try {
    await completionsCol.deleteMany({ userId: { $in: [userA, userB] } });

    // Complete P000001 for User A
    const reqA = new Request("http://localhost:3000/api/journey/complete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: userA, problemId: "P000001" }),
    });
    await completePost(reqA);

    // Verify User B has 0 completions
    const countB = await completionsCol.countDocuments({ userId: userB });
    if (countB !== 0) {
      console.error("  ❌ FAILED: User B has completions from User A!");
      passedAll = false;
    } else {
      console.log("  ✓ PASSED: User A completion did not leak to User B.");
    }
  } finally {
    await completionsCol.deleteMany({ userId: { $in: [userA, userB] } });
  }

  console.log("\n==================================================");
  if (passedAll) {
    console.log("ALL TASK 5 COMPLETION API AUDIT TESTS PASSED!");
  } else {
    console.log("SOME TASK 5 TESTS FAILED!");
  }
  console.log("==================================================");

  process.exit(passedAll ? 0 : 1);
}

runCompletionApiTests().catch((err) => {
  console.error("Fatal error in completion API verification:", err);
  process.exit(1);
});
