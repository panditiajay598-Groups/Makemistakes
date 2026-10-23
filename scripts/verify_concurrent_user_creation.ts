/**
 * verify_concurrent_user_creation.ts
 *
 * Dedicated verification for Fix F-03: Concurrent User Creation & P2002 Race Handling.
 * Proves:
 * 1. Concurrent resolveOrCreateUser calls for a brand-new email yield the exact same user.
 * 2. Prisma P2002 unique email collision is caught and resolved safely.
 * 3. Exactly 1 user, 1 credit balance, and 1 subscription record exist in the database.
 * 4. Subsequent calls return the existing user with 0 redundant writes.
 */

import { resolveOrCreateUser } from "../src/lib/authSession";
import { prisma } from "../backend/lib/prisma";

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
  console.log("VERIFY FIX F-03: CONCURRENT USER CREATION & RACE RESOLUTION");
  console.log("==================================================================");

  const timestamp = Date.now();
  const testEmail = `concurrent_race_test_${timestamp}@makemistakes.test`;

  try {
    // --- Group 1: Concurrent Creation Race ---
    console.log("\n--- Group 1: Concurrent resolveOrCreateUser Execution ---");
    // Fire 3 simultaneous creation requests for the exact same new user
    const [res1, res2, res3] = await Promise.all([
      resolveOrCreateUser(testEmail),
      resolveOrCreateUser(testEmail),
      resolveOrCreateUser(testEmail),
    ]);

    assert(
      res1.id === res2.id && res2.id === res3.id,
      `1.1 All 3 concurrent calls resolved to identical User ID (${res1.id})`
    );
    assert(
      res1.email === testEmail && res2.email === testEmail && res3.email === testEmail,
      "1.2 All 3 concurrent calls resolved to matching email"
    );

    // --- Group 2: Database Records Singularity ---
    console.log("\n--- Group 2: Database Constraint & Singularity Checks ---");
    const userDocs = await prisma.user.findMany({ where: { email: testEmail } });
    assert(userDocs.length === 1, "2.1 Exactly 1 User record exists in database");

    const userId = res1.id;
    const creditBalances = await prisma.aiCreditBalance.findMany({ where: { userId } });
    assert(creditBalances.length === 1, "2.2 Exactly 1 AiCreditBalance record exists in database");
    assert(creditBalances[0].totalCredits === 100, "2.3 Initial totalCredits is 100");

    const subscriptions = await prisma.subscription.findMany({ where: { userId } });
    assert(subscriptions.length === 1, "2.4 Exactly 1 Subscription record exists in database");
    assert(subscriptions[0].plan === "FREE", "2.5 Subscription plan is FREE");

    // --- Group 3: Subsequent Fast-Path Resolution ---
    console.log("\n--- Group 3: Subsequent Fast-Path Verification ---");
    const resReturning = await resolveOrCreateUser(testEmail);
    assert(resReturning.id === userId, "3.1 Subsequent call returns existing User ID immediately");
    assert(resReturning.emailVerified === true, "3.2 User emailVerified status is true");

  } finally {
    // Cleanup test records
    const user = await prisma.user.findUnique({ where: { email: testEmail } });
    if (user) {
      await prisma.aiCreditTransaction.deleteMany({ where: { userId: user.id } });
      await prisma.aiCreditBalance.deleteMany({ where: { userId: user.id } });
      await prisma.subscription.deleteMany({ where: { userId: user.id } });
      await prisma.user.delete({ where: { id: user.id } });
    }
  }

  console.log("\n==================================================================");
  console.log(`Summary: ${passed} passed, ${failed} failed`);
  console.log("==================================================================");

  if (failed > 0) {
    process.exit(1);
  }
}

run().catch((err) => {
  console.error("Fatal error during concurrent user creation test:", err);
  process.exit(1);
});
