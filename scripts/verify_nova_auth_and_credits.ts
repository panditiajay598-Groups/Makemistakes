/**
 * verify_nova_auth_and_credits.ts
 *
 * Dedicated verification for Fix F-02: Nova AI Authentication & AI-Credit Enforcement.
 * Proves:
 * 1. Anonymous callers receive HTTP 401 Unauthorized before provider execution.
 * 2. Anonymous calls cause zero credit transactions in the database.
 * 3. Authenticated user with credits has 1 credit deducted per request.
 * 4. User with 0 remaining credits receives HTTP 402 Payment Required.
 * 5. User A cannot spend User B's credits (deduction is derived strictly from verified session).
 */

import { POST as novaPOST } from "../src/app/api/nova/chat/route";
import { signSessionToken, resolveOrCreateUser } from "../src/lib/authSession";
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
  console.log("VERIFY FIX F-02: NOVA AI AUTHENTICATION & CREDIT ENFORCEMENT");
  console.log("==================================================================");

  const timestamp = Date.now();
  const emailA = `nova_qa_user_a_${timestamp}@makemistakes.test`;
  const emailB = `nova_qa_user_b_${timestamp}@makemistakes.test`;

  const userA = await resolveOrCreateUser(emailA);
  const userB = await resolveOrCreateUser(emailB);

  const tokenA = signSessionToken({ userId: userA.id, email: emailA, role: "student" });
  const tokenB = signSessionToken({ userId: userB.id, email: emailB, role: "student" });

  const headersA = {
    Authorization: `Bearer ${tokenA}`,
    "Content-Type": "application/json",
  };

  try {
    // --- Group 1: Anonymous Request Blocked (401) ---
    console.log("\n--- Group 1: Anonymous Request Rejection ---");
    const countBeforeAnon = await prisma.aiCreditTransaction.count();

    const reqAnon = new Request("http://localhost:3000/api/nova/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: [{ role: "user", content: "How do I build a rate limiter?" }],
      }),
    });
    const resAnon = await novaPOST(reqAnon);
    const dataAnon = await resAnon.json();

    assert(resAnon.status === 401, "1.1 Anonymous request returns HTTP 401 Unauthorized");
    assert(dataAnon.error === "UNAUTHORIZED", "1.2 Error payload indicates UNAUTHORIZED");

    const countAfterAnon = await prisma.aiCreditTransaction.count();
    assert(
      countBeforeAnon === countAfterAnon,
      "1.3 Anonymous request generated zero AI credit transactions"
    );

    // --- Group 2: Authenticated User AI Credit Deduction ---
    console.log("\n--- Group 2: Authenticated AI Credit Deduction ---");
    const balanceBeforeA = await prisma.aiCreditBalance.findUnique({ where: { userId: userA.id } });
    const initialRemainingA = balanceBeforeA?.remainingCredits ?? 100;

    const reqAuthA = new Request("http://localhost:3000/api/nova/chat", {
      method: "POST",
      headers: headersA,
      body: JSON.stringify({
        messages: [{ role: "user", content: "Explain React useEffect in one sentence" }],
        context: { productName: "TestApp" },
      }),
    });
    const resAuthA = await novaPOST(reqAuthA);
    const dataAuthA = await resAuthA.json();

    assert(resAuthA.status === 200, "2.1 Authenticated request succeeds with HTTP 200");
    assert(dataAuthA.ok === true && typeof dataAuthA.message === "string", "2.2 Valid AI response message returned");

    const balanceAfterA = await prisma.aiCreditBalance.findUnique({ where: { userId: userA.id } });
    assert(
      balanceAfterA?.remainingCredits === initialRemainingA - 1,
      `2.3 Exactly 1 credit deducted (from ${initialRemainingA} to ${balanceAfterA?.remainingCredits})`
    );

    // Check transaction record
    const latestTx = await prisma.aiCreditTransaction.findFirst({
      where: { userId: userA.id },
      orderBy: { createdAt: "desc" },
    });
    assert(
      latestTx !== null && latestTx.amount === -1 && latestTx.type === "NOVA_QUERY",
      "2.4 AI credit transaction logged with amount -1 and type NOVA_QUERY"
    );

    // Verify User B's balance was untouched
    const balanceB = await prisma.aiCreditBalance.findUnique({ where: { userId: userB.id } });
    assert(
      balanceB?.remainingCredits === 100,
      "2.5 User B's credit balance was completely untouched"
    );

    // --- Group 3: Exhausted Credits (402) ---
    console.log("\n--- Group 3: Exhausted Credit Enforcement (402) ---");
    // Manually set User A's remaining credits to 0
    await prisma.aiCreditBalance.update({
      where: { userId: userA.id },
      data: { remainingCredits: 0, usedCredits: 100 },
    });

    const reqExhausted = new Request("http://localhost:3000/api/nova/chat", {
      method: "POST",
      headers: headersA,
      body: JSON.stringify({
        messages: [{ role: "user", content: "Give me another hint" }],
      }),
    });
    const resExhausted = await novaPOST(reqExhausted);
    const dataExhausted = await resExhausted.json();

    assert(resExhausted.status === 402, "3.1 Request with 0 credits returns HTTP 402 Payment Required");
    assert(
      dataExhausted.error === "INSUFFICIENT_CREDITS",
      "3.2 Error code indicates INSUFFICIENT_CREDITS"
    );

    // Verify balance remains 0 (not negative)
    const balanceFinalA = await prisma.aiCreditBalance.findUnique({ where: { userId: userA.id } });
    assert(
      balanceFinalA?.remainingCredits === 0,
      "3.3 Credit balance did not go negative after 402 rejection"
    );

  } finally {
    // Cleanup test fixtures
    await prisma.aiCreditTransaction.deleteMany({ where: { userId: { in: [userA.id, userB.id] } } });
    await prisma.aiCreditBalance.deleteMany({ where: { userId: { in: [userA.id, userB.id] } } });
    await prisma.subscription.deleteMany({ where: { userId: { in: [userA.id, userB.id] } } });
    await prisma.user.deleteMany({ where: { id: { in: [userA.id, userB.id] } } });
  }

  console.log("\n==================================================================");
  console.log(`Summary: ${passed} passed, ${failed} failed`);
  console.log("==================================================================");

  if (failed > 0) {
    process.exit(1);
  }
}

run().catch((err) => {
  console.error("Fatal error during Nova auth verification:", err);
  process.exit(1);
});
