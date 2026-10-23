/**
 * verify_journey_authorization.ts
 *
 * Dedicated verification for Fix F-01: Journey User-Data Authorization & User Isolation.
 * Proves:
 * 1. Anonymous GET is rejected with HTTP 401.
 * 2. Anonymous POST/write is rejected with HTTP 401.
 * 3. User A can read and update User A's data.
 * 4. User A cannot read User B's data by spoofing ?userId=UserB.
 * 5. User A cannot overwrite User B's data by spoofing body.userId=UserB.
 * 6. User B's data remains intact and unchanged after attempted cross-user tampering.
 * 7. Identical phase writes correctly skip database updates (skippedWrite: true).
 * 8. Advancement to new phases correctly updates the database.
 */

import { GET as journeyGET, POST as journeyPOST } from "../src/app/api/journey/user-data/route";
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
  console.log("VERIFY FIX F-01: JOURNEY USER-DATA AUTHORIZATION & ISOLATION");
  console.log("==================================================================");

  const problemId = "P000001";
  const userAEmail = "journey_test_user_a@makemistakes.test";
  const userBEmail = "journey_test_user_b@makemistakes.test";

  const tokenA = signSessionToken({ userId: "uid_a", email: userAEmail, role: "student" });
  const tokenB = signSessionToken({ userId: "uid_b", email: userBEmail, role: "student" });

  const headersA = {
    Authorization: `Bearer ${tokenA}`,
    "Content-Type": "application/json",
  };
  const headersB = {
    Authorization: `Bearer ${tokenB}`,
    "Content-Type": "application/json",
  };

  const db = await getDb();
  const collection = db.collection("user_journeys");

  // Setup: clean existing test fixtures
  await collection.deleteMany({ userId: { $in: [userAEmail, userBEmail, "uid_a", "uid_b"] } });

  try {
    // --- Group 1: Anonymous Access Strictly Rejected ---
    console.log("\n--- Group 1: Anonymous Access Rejection (401) ---");
    const reqAnonGet = new Request(`http://localhost:3000/api/journey/user-data?problemId=${problemId}`);
    const resAnonGet = await journeyGET(reqAnonGet);
    assert(resAnonGet.status === 401, "1.1 Anonymous GET is rejected with HTTP 401");

    const reqAnonPost = new Request("http://localhost:3000/api/journey/user-data", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ problemId, phase: "discover", data: { score: 10 } }),
    });
    const resAnonPost = await journeyPOST(reqAnonPost);
    assert(resAnonPost.status === 401, "1.2 Anonymous POST is rejected with HTTP 401");

    // --- Group 2: Authenticated Reads and Writes for User B ---
    console.log("\n--- Group 2: Authenticated Seeding for User B ---");
    const userBData = { score: 99, notes: "Secret private notes of User B" };
    const reqBInit = new Request("http://localhost:3000/api/journey/user-data", {
      method: "POST",
      headers: headersB,
      body: JSON.stringify({
        problemId,
        phase: "research",
        currentPhase: 2,
        data: userBData,
      }),
    });
    const resBInit = await journeyPOST(reqBInit);
    const dataBInit = await resBInit.json();
    assert(resBInit.status === 200 && dataBInit.success === true, "2.1 User B saves journey data successfully");

    // Verify User B document in database
    const docB = await collection.findOne({ userId: userBEmail, problemId });
    assert(docB !== null && docB.phases?.research?.score === 99, "2.2 User B data is persisted correctly");

    // --- Group 3: Cross-User Read Spoofing Blocked ---
    console.log("\n--- Group 3: Cross-User Read Spoofing Blocked ---");
    // User A passes ?userId=userB in URL query
    const reqASpoofGet = new Request(
      `http://localhost:3000/api/journey/user-data?problemId=${problemId}&userId=${encodeURIComponent(userBEmail)}`,
      { headers: headersA }
    );
    const resASpoofGet = await journeyGET(reqASpoofGet);
    const dataASpoofGet = await resASpoofGet.json();
    assert(resASpoofGet.status === 200, "3.1 User A request returns 200");
    assert(
      dataASpoofGet.userId === userAEmail && dataASpoofGet.exists === false,
      "3.2 User A cannot see User B's journey (returns User A's clean state, not User B's)"
    );
    assert(!dataASpoofGet.phases?.research?.notes, "3.3 User B's secret notes are NOT leaked to User A");

    // --- Group 4: Cross-User Write Spoofing Blocked ---
    console.log("\n--- Group 4: Cross-User Write Spoofing Blocked ---");
    // User A attempts to overwrite User B's document by specifying body.userId = userBEmail
    const reqASpoofPost = new Request("http://localhost:3000/api/journey/user-data", {
      method: "POST",
      headers: headersA,
      body: JSON.stringify({
        userId: userBEmail, // MALICIOUS SPOOF
        problemId,
        phase: "research",
        data: { score: 0, notes: "HACKED BY USER A" },
      }),
    });
    const resASpoofPost = await journeyPOST(reqASpoofPost);
    const dataASpoofPost = await resASpoofPost.json();
    assert(resASpoofPost.status === 200 && dataASpoofPost.success === true, "4.1 User A save executes");
    assert(
      dataASpoofPost.userId === userAEmail,
      "4.2 Save was scoped to User A's verified session identity, NOT spoofed User B"
    );

    // Verify User B's document was NOT overwritten
    const docBAfter = await collection.findOne({ userId: userBEmail, problemId });
    assert(
      docBAfter !== null && docBAfter.phases?.research?.notes === "Secret private notes of User B",
      "4.3 User B's document remains intact and untampered in database"
    );

    // Verify User A has their own separate document
    const docA = await collection.findOne({ userId: userAEmail, problemId });
    assert(
      docA !== null && docA.phases?.research?.notes === "HACKED BY USER A",
      "4.4 User A's write was safely isolated to User A's own record"
    );

    // --- Group 5: Unchanged Write Optimization ---
    console.log("\n--- Group 5: Unchanged Write Optimization ---");
    // Submitting identical data again for User A
    const reqAIdempotent = new Request("http://localhost:3000/api/journey/user-data", {
      method: "POST",
      headers: headersA,
      body: JSON.stringify({
        problemId,
        phase: "research",
        data: { score: 0, notes: "HACKED BY USER A" },
      }),
    });
    const resAIdempotent = await journeyPOST(reqAIdempotent);
    const dataAIdempotent = await resAIdempotent.json();
    assert(
      resAIdempotent.status === 200 && dataAIdempotent.skippedWrite === true,
      "5.1 Identical phase save skips database write (skippedWrite: true)"
    );

    // Advancing phase for User A
    const reqAAdvance = new Request("http://localhost:3000/api/journey/user-data", {
      method: "POST",
      headers: headersA,
      body: JSON.stringify({
        problemId,
        phase: "design",
        currentPhase: 3,
        data: { productGoal: "Build a secure product" },
      }),
    });
    const resAAdvance = await journeyPOST(reqAAdvance);
    const dataAAdvance = await resAAdvance.json();
    assert(
      resAAdvance.status === 200 && !dataAAdvance.skippedWrite && dataAAdvance.currentPhase === 3,
      "5.2 Advancing to new phase updates database accurately"
    );

  } finally {
    // Cleanup
    await collection.deleteMany({ userId: { $in: [userAEmail, userBEmail, "uid_a", "uid_b"] } });
  }

  console.log("\n==================================================================");
  console.log(`Summary: ${passed} passed, ${failed} failed`);
  console.log("==================================================================");

  if (failed > 0) {
    process.exit(1);
  }
}

run().catch((err) => {
  console.error("Unhandled error:", err);
  process.exit(1);
});
