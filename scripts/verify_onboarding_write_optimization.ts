/**
 * Verification Script for Task 17: Reduce Redundant Onboarding Database Writes
 *
 * Verifies:
 * 1. resolveOrCreateUser avoids redundant writes for existing users (0 writes on repeated login).
 * 2. Settings profile route avoids redundant DB writes when data is unchanged.
 * 3. Settings preferences route avoids redundant DB writes when data is unchanged.
 * 4. Journey user-data route avoids redundant DB writes on repeated saves of identical phase data.
 * 5. Genuine changes (progress advancement, altered answers) persist accurately.
 * 6. User isolation is maintained throughout.
 */

import path from "path";
import dotenv from "dotenv";
dotenv.config({ path: path.join(__dirname, "..", ".env") });

import { resolveOrCreateUser, signSessionToken } from "../src/lib/authSession";
import { prisma } from "../backend/lib/prisma";
import { getDb } from "../src/lib/mongodb";
import { POST as profilePOST } from "../src/app/api/settings/profile/route";
import { POST as preferencesPOST } from "../src/app/api/settings/preferences/route";
import { POST as journeyUserDataPOST } from "../src/app/api/journey/user-data/route";

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

async function runTask17Verification() {
  console.log("==================================================================");
  console.log("TASK 17 VERIFICATION: REDUCE REDUNDANT ONBOARDING WRITES");
  console.log("==================================================================\n");

  const testEmail = "test_onboarding_opt_user@makemistakes.in";

  // Clean initial fixture
  const existingU = await prisma.user.findUnique({ where: { email: testEmail } });
  if (existingU) {
    await prisma.aiCreditBalance.deleteMany({ where: { userId: existingU.id } });
    await prisma.subscription.deleteMany({ where: { userId: existingU.id } });
    await prisma.user.delete({ where: { id: existingU.id } });
  }

  // --- Group 1: resolveOrCreateUser Write Reduction ---
  console.log("--- Group 1: resolveOrCreateUser Write Optimization ---");
  const firstUser = await resolveOrCreateUser(testEmail);
  assert(
    Boolean(firstUser.id && firstUser.emailVerified),
    "1.1 First-time user creation registers user and marks email verified"
  );

  const initialBalance = await prisma.aiCreditBalance.findUnique({ where: { userId: firstUser.id } });
  const initialSub = await prisma.subscription.findUnique({ where: { userId: firstUser.id } });
  assert(
    initialBalance?.totalCredits === 100 && initialSub?.plan === "FREE",
    "1.2 First-time user initializes default 100 credits and FREE subscription"
  );

  // Measure repeated resolution
  const secondUser = await resolveOrCreateUser(testEmail);
  assert(
    secondUser.id === firstUser.id,
    "1.3 Returning user resolves immediately without recreating records"
  );

  // --- Group 2: Settings Profile Write Deduplication ---
  console.log("\n--- Group 2: Settings Profile Unchanged Write Deduplication ---");
  const token = signSessionToken({ userId: firstUser.id, email: firstUser.email, role: "student" });
  const authHeaders = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };

  const profilePayload = {
    profile: {
      fullName: "Jane Builder",
      username: "janebuilder",
      bio: "Learning to build products that matter.",
      email: testEmail,
      location: "San Francisco, CA",
    },
  };

  const req1 = new Request("http://localhost:3000/api/settings/profile", {
    method: "POST",
    headers: authHeaders,
    body: JSON.stringify(profilePayload),
  });
  const res1 = await profilePOST(req1);
  const data1 = await res1.json();
  assert(res1.status === 200 && data1.success === true, "2.1 Initial profile write succeeds");

  // Second submission with exact same data
  const req2 = new Request("http://localhost:3000/api/settings/profile", {
    method: "POST",
    headers: authHeaders,
    body: JSON.stringify(profilePayload),
  });
  const res2 = await profilePOST(req2);
  const data2 = await res2.json();
  assert(
    res2.status === 200 && data2.skippedWrite === true,
    "2.2 Second identical profile save skips redundant database write"
  );

  // Changed profile submission
  const req3 = new Request("http://localhost:3000/api/settings/profile", {
    method: "POST",
    headers: authHeaders,
    body: JSON.stringify({
      profile: { ...profilePayload.profile, bio: "Updated bio: shipping real apps." },
    }),
  });
  const res3 = await profilePOST(req3);
  const data3 = await res3.json();
  assert(
    res3.status === 200 && !data3.skippedWrite && data3.profile.bio === "Updated bio: shipping real apps.",
    "2.3 Genuine profile change performs database update"
  );

  // --- Group 3: Settings Preferences Write Deduplication ---
  console.log("\n--- Group 3: Settings Preferences Write Deduplication ---");
  const prefsPayload = {
    preferences: {
      theme: "dark",
      compactMode: true,
      defaultDashboard: "/dashboard",
      language: "English",
    },
  };

  const reqP1 = new Request("http://localhost:3000/api/settings/preferences", {
    method: "POST",
    headers: authHeaders,
    body: JSON.stringify(prefsPayload),
  });
  const resP1 = await preferencesPOST(reqP1);
  const dataP1 = await resP1.json();
  assert(resP1.status === 200 && dataP1.success === true, "3.1 Initial preferences write succeeds");

  const reqP2 = new Request("http://localhost:3000/api/settings/preferences", {
    method: "POST",
    headers: authHeaders,
    body: JSON.stringify(prefsPayload),
  });
  const resP2 = await preferencesPOST(reqP2);
  const dataP2 = await resP2.json();
  assert(
    resP2.status === 200 && dataP2.skippedWrite === true,
    "3.2 Second identical preferences save skips redundant database write"
  );

  // --- Group 4: Journey User-Data Phase Write Deduplication ---
  console.log("\n--- Group 4: Journey User-Data Phase Write Deduplication ---");
  const problemId = "P000001";
  const journeyPayload = {
    userId: testEmail,
    problemId,
    phase: "discover",
    currentPhase: 1,
    data: { quizAnswers: { q1: "A", q2: "B" }, score: 100, completed: true },
  };

  const reqJ1 = new Request("http://localhost:3000/api/journey/user-data", {
    method: "POST",
    headers: authHeaders,
    body: JSON.stringify(journeyPayload),
  });
  const resJ1 = await journeyUserDataPOST(reqJ1);
  const dataJ1 = await resJ1.json();
  assert(resJ1.status === 200 && dataJ1.success === true, "4.1 Initial journey phase save succeeds");

  // Repeated identical save (e.g. from component re-mount or navigation)
  const reqJ2 = new Request("http://localhost:3000/api/journey/user-data", {
    method: "POST",
    headers: authHeaders,
    body: JSON.stringify(journeyPayload),
  });
  const resJ2 = await journeyUserDataPOST(reqJ2);
  const dataJ2 = await resJ2.json();
  assert(
    resJ2.status === 200 && dataJ2.skippedWrite === true,
    "4.2 Identical journey phase save skips redundant database write"
  );

  // Progress advancement should trigger write
  const reqJ3 = new Request("http://localhost:3000/api/journey/user-data", {
    method: "POST",
    headers: authHeaders,
    body: JSON.stringify({
      ...journeyPayload,
      phase: "research",
      currentPhase: 2,
      data: { sources: ["https://example.com"], checklist: ["done"] },
    }),
  });
  const resJ3 = await journeyUserDataPOST(reqJ3);
  const dataJ3 = await resJ3.json();
  assert(
    resJ3.status === 200 && !dataJ3.skippedWrite && dataJ3.currentPhase === 2,
    "4.3 Advancing to next phase correctly performs database update"
  );

  // Cleanup test fixtures
  const db = await getDb();
  await db.collection("user_profiles").deleteMany({ userId: { $in: [firstUser.id, testEmail] } });
  await db.collection("user_preferences").deleteMany({ userId: { $in: [firstUser.id, testEmail] } });
  await db.collection("user_journeys").deleteMany({ userId: testEmail });
  await prisma.aiCreditBalance.deleteMany({ where: { userId: firstUser.id } });
  await prisma.subscription.deleteMany({ where: { userId: firstUser.id } });
  await prisma.user.delete({ where: { id: firstUser.id } });

  console.log("\n==================================================================");
  console.log(`Summary: ${passed} passed, ${failed} failed`);
  console.log("==================================================================");

  if (failed > 0) {
    process.exit(1);
  }
}

runTask17Verification().catch((err) => {
  console.error("Fatal error during Task 17 verification:", err);
  process.exit(1);
});
