/**
 * verify_problem_auth_and_unlock.ts
 *
 * Dedicated verification for Fix F-04: Journey Problem Identity Fallback Elimination.
 * Proves:
 * 1. Public catalog access for Beginner / Intermediate problems works for anonymous callers.
 * 2. Anonymous callers accessing locked Advanced problems receive HTTP 403 (locked: true).
 * 3. Client spoofing via ?userId=<eligible_user> without valid session is strictly ignored and rejected (403).
 * 4. Authenticated user with active journey session is exempted and gains access.
 * 5. Cross-user spoofing between two authenticated users is blocked.
 */

import { GET as problemGET } from "../src/app/api/journey/problem/route";
import { signSessionToken } from "../src/lib/authSession";
import { getDb } from "../src/lib/mongodb";

let passed = 0;
let failed = 0;

function assert(condition: boolean, msg: string) {
  if (condition) {
    console.log(`  [PASS] ${msg}`);
    passed++;
  } else {
    console.error(`  [FAIL] ${msg}`);
    failed++;
  }
}

async function run() {
  console.log("==================================================================");
  console.log("VERIFY FIX F-04: JOURNEY PROBLEM IDENTITY & UNLOCK INTEGRITY");
  console.log("==================================================================");

  const db = await getDb();
  const problemsCol = db.collection("problems");
  const journeysCol = db.collection("user_journeys");

  // Find a Beginner/Intermediate and an Advanced problem
  const beginnerProblem = await problemsCol.findOne({
    $or: [{ difficulty: "Beginner" }, { "learning.level": "Beginner" }],
  });
  const advancedProblem = await problemsCol.findOne({
    $or: [{ difficulty: "Advanced" }, { "learning.level": "Advanced" }],
  });

  if (!beginnerProblem || !advancedProblem) {
    console.error("Required problem fixtures not found in database.");
    process.exit(1);
  }

  const begId = beginnerProblem.problemId;
  const advId = advancedProblem.problemId;

  const eligibleUserEmail = "eligible_unlocked_user@makemistakes.test";
  const ineligibleUserEmail = "ineligible_user@makemistakes.test";

  const eligibleToken = signSessionToken({ userId: "uid_elig", email: eligibleUserEmail, role: "student" });
  const ineligibleToken = signSessionToken({ userId: "uid_inelig", email: ineligibleUserEmail, role: "student" });

  try {
    // --- Group 1: Public Problem Access ---
    console.log("\n--- Group 1: Public Catalog Access for Non-Advanced Problems ---");
    const reqBegAnon = new Request(`http://localhost:3000/api/journey/problem?id=${begId}`);
    const resBegAnon = await problemGET(reqBegAnon);
    const dataBegAnon = await resBegAnon.json();
    assert(resBegAnon.status === 200, "1.1 Anonymous request to Beginner problem succeeds (200)");
    assert(dataBegAnon.problemId === begId, "1.2 Beginner problem payload returned accurately");

    // --- Group 2: Anonymous Locked Advanced Access ---
    console.log("\n--- Group 2: Locked Advanced Problem Access (Anonymous) ---");
    const reqAdvAnon = new Request(`http://localhost:3000/api/journey/problem?id=${advId}`);
    const resAdvAnon = await problemGET(reqAdvAnon);
    const dataAdvAnon = await resAdvAnon.json();
    assert(resAdvAnon.status === 403, "2.1 Anonymous request to Advanced problem returns HTTP 403");
    assert(dataAdvAnon.locked === true, "2.2 Response contains locked: true");

    // --- Group 3: Spoofed ?userId Without Session Blocked ---
    console.log("\n--- Group 3: Spoofed ?userId Query Param Blocked ---");
    // Seed eligible user with in-progress journey on this advanced problem
    await journeysCol.insertOne({
      userId: eligibleUserEmail,
      problemId: advId,
      status: "in_progress",
      currentPhase: 3,
      updatedAt: new Date(),
    });

    // Anonymous attacker attempts to unlock by appending ?userId=eligible_unlocked_user
    const reqSpoof = new Request(
      `http://localhost:3000/api/journey/problem?id=${advId}&userId=${encodeURIComponent(eligibleUserEmail)}`
    );
    const resSpoof = await problemGET(reqSpoof);
    const dataSpoof = await resSpoof.json();
    assert(resSpoof.status === 403, "3.1 Spoofed ?userId without session is strictly rejected (403)");
    assert(dataSpoof.locked === true, "3.2 Advanced problem remains locked despite spoofed parameter");

    // --- Group 4: Authenticated Eligible User Exemption ---
    console.log("\n--- Group 4: Authenticated In-Progress Exemption ---");
    const reqElig = new Request(`http://localhost:3000/api/journey/problem?id=${advId}`, {
      headers: { Authorization: `Bearer ${eligibleToken}` },
    });
    const resElig = await problemGET(reqElig);
    const dataElig = await resElig.json();
    assert(resElig.status === 200, "4.1 Verified eligible user with active journey accesses problem (200)");
    assert(dataElig.problemId === advId, "4.2 Problem payload returned to verified user");

    // --- Group 5: Authenticated User Cross-Spoofing Blocked ---
    console.log("\n--- Group 5: Authenticated User Cross-Spoofing Blocked ---");
    // Ineligible user passes ?userId=eligibleUserEmail while logged in as ineligible user
    const reqCrossSpoof = new Request(
      `http://localhost:3000/api/journey/problem?id=${advId}&userId=${encodeURIComponent(eligibleUserEmail)}`,
      { headers: { Authorization: `Bearer ${ineligibleToken}` } }
    );
    const resCrossSpoof = await problemGET(reqCrossSpoof);
    const dataCrossSpoof = await resCrossSpoof.json();
    assert(resCrossSpoof.status === 403, "5.1 Ineligible user cannot unlock by passing eligible user's ID");
    assert(dataCrossSpoof.locked === true, "5.2 Identity strictly derived from authenticated session");

  } finally {
    // Cleanup
    await journeysCol.deleteMany({ userId: eligibleUserEmail, problemId: advId });
  }

  console.log("\n==================================================================");
  console.log(`Summary: ${passed} passed, ${failed} failed`);
  console.log("==================================================================");

  if (failed > 0) {
    process.exit(1);
  }
}

run().catch((err) => {
  console.error("Fatal error during problem auth verification:", err);
  process.exit(1);
});
