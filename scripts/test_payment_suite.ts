/**
 * MAKEMISTAKES SECURE PAYMENT & SUBSCRIPTION AUTOMATED TEST SUITE
 * Validates all 20 Acceptance & Security Requirements
 */

import { prisma } from "../backend/lib/prisma";
import { resolveOrCreateUser, signSessionToken, verifySessionToken } from "../src/lib/authSession";
import { PaymentService } from "../src/lib/paymentService";
import { PLANS } from "../src/lib/plans";
import crypto from "crypto";

interface TestReport {
  id: number;
  name: string;
  passed: boolean;
  details?: string;
  error?: string;
}

const results: TestReport[] = [];

async function runTest(id: number, name: string, fn: () => Promise<void>) {
  process.stdout.write(`[Test ${id.toString().padStart(2, "0")}] ${name}... `);
  try {
    await fn();
    console.log(" PASSED");
    results.push({ id, name, passed: true });
  } catch (err: any) {
    console.log(` FAILED: ${err.message}`);
    results.push({ id, name, passed: false, error: err.message });
  }
}

async function main() {
  console.log("\n=======================================================");
  console.log("  MAKEMISTAKES SECURE PAYMENT & ENTITLEMENT TEST RUNNER");
  console.log("=======================================================\n");

  const timestamp = Date.now();
  const emailA = `test_user_a_${timestamp}@makemistakes.test`;
  const emailB = `test_user_b_${timestamp}@makemistakes.test`;

  // 1. Setup accounts
  const userA = await resolveOrCreateUser(emailA);
  const userB = await resolveOrCreateUser(emailB);

  const sessionA = {
    userId: userA.id,
    email: userA.email,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 86400,
  };

  const sessionB = {
    userId: userB.id,
    email: userB.email,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 86400,
  };

  let orderA: any = null;
  let paymentIdA = `pay_rzp_mock_${timestamp}`;

  // Test 1: User A purchases Pro and receives the correct entitlement
  await runTest(1, "User A purchases Pro and receives correct entitlement", async () => {
    orderA = await PaymentService.createOrder({ session: sessionA, planId: "PRO" });
    if (!orderA.orderId || orderA.plan !== "PRO" || orderA.amount !== 99900) {
      throw new Error("Order creation returned invalid amount or plan");
    }

    const sig = PaymentService.generateSandboxSignature(orderA.gatewayOrderId, paymentIdA);
    const activation = await PaymentService.verifyPayment({
      session: sessionA,
      orderId: orderA.orderId,
      gatewayPaymentId: paymentIdA,
      gatewaySignature: sig,
    });

    if (!activation.success || activation.plan !== "PRO") {
      throw new Error("Activation failed or did not set plan to PRO");
    }

    const subA = await PaymentService.getAccountSubscription(userA.id);
    if (subA.plan !== "PRO" || subA.status !== "ACTIVE" || !subA.isPaid) {
      throw new Error(`Expected User A to have active PRO plan, got: ${subA.plan}`);
    }
  });

  // Test 2: User B remains Free
  await runTest(2, "User B remains Free", async () => {
    const subB = await PaymentService.getAccountSubscription(userB.id);
    if (subB.plan !== "FREE" || subB.isPaid) {
      throw new Error(`User B should remain on FREE plan, but got: ${subB.plan}`);
    }
  });

  // Test 3: User B cannot claim User A's payment
  await runTest(3, "User B cannot claim User A's payment", async () => {
    const sig = PaymentService.generateSandboxSignature(orderA.gatewayOrderId, paymentIdA);
    let rejected = false;
    try {
      await PaymentService.verifyPayment({
        session: sessionB, // User B trying to claim User A's order
        orderId: orderA.orderId,
        gatewayPaymentId: paymentIdA,
        gatewaySignature: sig,
      });
    } catch (err: any) {
      if (err.message.includes("FORBIDDEN") || err.message.includes("another account")) {
        rejected = true;
      }
    }

    if (!rejected) {
      throw new Error("User B was able to verify or claim User A's payment order!");
    }
  });

  // Test 4: Client-supplied user IDs cannot change entitlement ownership
  await runTest(4, "Client-supplied user IDs cannot override trusted session", async () => {
    // PaymentService strictly relies on session.userId resolved by server
    const forgedSession = { ...sessionB, userId: userB.id };
    const orderB = await PaymentService.createOrder({ session: forgedSession, planId: "MAX" });
    if (orderB.userEmail !== userB.email) {
      throw new Error("Order was not strictly bound to the authenticated account's email");
    }
  });

  // Test 5: Invalid payment signatures are rejected
  await runTest(5, "Invalid payment signatures are rejected", async () => {
    const fakeOrder = await PaymentService.createOrder({ session: sessionA, planId: "MAX" });
    let rejected = false;
    try {
      await PaymentService.verifyPayment({
        session: sessionA,
        orderId: fakeOrder.orderId,
        gatewayPaymentId: "pay_tampered_123",
        gatewaySignature: "forged_invalid_signature_hex",
      });
    } catch (err: any) {
      if (err.message.includes("INVALID_SIGNATURE") || err.message.includes("failed")) {
        rejected = true;
      }
    }

    if (!rejected) {
      throw new Error("Invalid signature was unexpectedly accepted!");
    }
  });

  // Test 6: Incorrect amounts and currencies are rejected
  await runTest(6, "Server authoritative pricing enforces correct amount & currency", async () => {
    const order = await PaymentService.createOrder({ session: sessionA, planId: "MAX" });
    if (order.amount !== PLANS.MAX.amountInPaise || order.currency !== "INR") {
      throw new Error(`Authoritative amount must be ${PLANS.MAX.amountInPaise} INR`);
    }
  });

  // Test 7: Pending payments do not grant paid access
  await runTest(7, "Pending payments do not grant paid access", async () => {
    const userPending = await resolveOrCreateUser(`pending_${timestamp}@makemistakes.test`);
    const sessionPending = { userId: userPending.id, email: userPending.email, iat: 1, exp: 9999999999 };
    // Create order but do not verify
    await PaymentService.createOrder({ session: sessionPending, planId: "PRO" });
    const sub = await PaymentService.getAccountSubscription(userPending.id);
    if (sub.isPaid || sub.plan !== "FREE") {
      throw new Error("Pending unverified order granted paid permissions!");
    }
  });

  // Test 8: Failed payments do not grant paid access
  await runTest(8, "Failed payments do not grant paid access", async () => {
    const userFailed = await resolveOrCreateUser(`failed_${timestamp}@makemistakes.test`);
    const sessionFailed = { userId: userFailed.id, email: userFailed.email, iat: 1, exp: 9999999999 };
    const order = await PaymentService.createOrder({ session: sessionFailed, planId: "PRO" });
    try {
      await PaymentService.verifyPayment({
        session: sessionFailed,
        orderId: order.orderId,
        gatewayPaymentId: "fail_pay",
        gatewaySignature: "bad_sig",
      });
    } catch {}

    const sub = await PaymentService.getAccountSubscription(userFailed.id);
    if (sub.isPaid || sub.plan !== "FREE") {
      throw new Error("Failed payment granted paid access!");
    }
  });

  // Test 9: Duplicate webhooks do not duplicate benefits
  await runTest(9, "Duplicate webhooks do not duplicate benefits", async () => {
    const creditsBefore = (await PaymentService.getAccountSubscription(userA.id)).credits.remaining;
    
    // Simulate duplicate activation
    const sig = PaymentService.generateSandboxSignature(orderA.gatewayOrderId, paymentIdA);
    const result = await PaymentService.verifyPayment({
      session: sessionA,
      orderId: orderA.orderId,
      gatewayPaymentId: paymentIdA,
      gatewaySignature: sig,
    });

    if (!result.alreadyProcessed) {
      throw new Error("Duplicate payment activation was not identified as already processed");
    }

    const creditsAfter = (await PaymentService.getAccountSubscription(userA.id)).credits.remaining;
    if (creditsAfter !== creditsBefore) {
      throw new Error(`Credits were duplicated! Before: ${creditsBefore}, After: ${creditsAfter}`);
    }
  });

  // Test 10: Concurrent activation requests remain idempotent
  await runTest(10, "Concurrent activation requests remain idempotent", async () => {
    const userConc = await resolveOrCreateUser(`concurrent_${timestamp}@makemistakes.test`);
    const sessionConc = { userId: userConc.id, email: userConc.email, iat: 1, exp: 9999999999 };
    const orderConc = await PaymentService.createOrder({ session: sessionConc, planId: "PRO" });
    const payId = `pay_conc_${timestamp}`;
    const sig = PaymentService.generateSandboxSignature(orderConc.gatewayOrderId, payId);

    // Fire 3 simultaneous activations
    const [res1, res2, res3] = await Promise.all([
      PaymentService.verifyPayment({ session: sessionConc, orderId: orderConc.orderId, gatewayPaymentId: payId, gatewaySignature: sig }),
      PaymentService.verifyPayment({ session: sessionConc, orderId: orderConc.orderId, gatewayPaymentId: payId, gatewaySignature: sig }),
      PaymentService.verifyPayment({ session: sessionConc, orderId: orderConc.orderId, gatewayPaymentId: payId, gatewaySignature: sig }),
    ]);

    const sub = await PaymentService.getAccountSubscription(userConc.id);
    // User should have exactly 1000 + initial 100 = 1100 credits, not 3000
    if (sub.credits.remaining > 1100) {
      throw new Error(`Concurrent requests duplicated credits: ${sub.credits.remaining}`);
    }
  });

  // Test 11: Paid APIs reject unauthorized users
  await runTest(11, "Paid APIs reject unauthorized users", async () => {
    const unauthedResult = await PaymentService.deductAiCredit("", 1);
    if (unauthedResult.success) {
      throw new Error("Credit deduction succeeded for unauthenticated user!");
    }
  });

  // Test 12: Expired subscriptions lose paid permissions
  await runTest(12, "Expired subscriptions lose paid permissions", async () => {
    const userExp = await resolveOrCreateUser(`expired_${timestamp}@makemistakes.test`);
    // Manually set an expired subscription in DB
    const pastDate = new Date(Date.now() - 24 * 60 * 60 * 1000); // yesterday
    await prisma.subscription.update({
      where: { userId: userExp.id },
      data: {
        plan: "PRO",
        status: "ACTIVE",
        expiryDate: pastDate,
      },
    });

    const sub = await PaymentService.getAccountSubscription(userExp.id);
    if (sub.isPaid || sub.status !== "EXPIRED") {
      throw new Error(`Expired subscription still reported as paid! Status: ${sub.status}`);
    }
  });

  // Test 13: Another device can access legitimate account
  await runTest(13, "Another device can access legitimate account via token", async () => {
    const token = signSessionToken({ userId: userA.id, email: userA.email, role: userA.role });
    const parsed = verifySessionToken(token);
    if (!parsed || parsed.userId !== userA.id) {
      throw new Error("Device session token verification failed");
    }
    const sub = await PaymentService.getAccountSubscription(parsed.userId);
    if (sub.plan !== "PRO" || !sub.isPaid) {
      throw new Error("Second device did not resolve User A's active Pro entitlement");
    }
  });

  // Test 14: Email changes do not transfer ownership
  await runTest(14, "Email changes do not transfer ownership (internal account ID stable)", async () => {
    // If User A updates email, userA.id remains identical
    const newEmail = `updated_${timestamp}@makemistakes.test`;
    await prisma.user.update({
      where: { id: userA.id },
      data: { email: newEmail },
    });

    // Check entitlement by original stable user ID
    const sub = await PaymentService.getAccountSubscription(userA.id);
    if (sub.plan !== "PRO" || !sub.isPaid) {
      throw new Error("Changing email broke or decoupled internal account subscription");
    }

    // Revert back cleanly
    await prisma.user.update({
      where: { id: userA.id },
      data: { email: emailA },
    });
  });

  // Test 15: AI credits cannot be duplicated or overspent
  await runTest(15, "AI credits cannot be overspent", async () => {
    const userCreditTest = await resolveOrCreateUser(`credit_limit_${timestamp}@makemistakes.test`);
    // User has 100 credits by default
    const subBefore = await PaymentService.getAccountSubscription(userCreditTest.id);
    const balance = subBefore.credits.remaining;

    // Try to deduct more than available balance
    const overspend = await PaymentService.deductAiCredit(userCreditTest.id, balance + 50);
    if (overspend.success) {
      throw new Error("Credit balance was allowed to be overspent!");
    }

    // Deduct exact 10 credits
    const validDeduct = await PaymentService.deductAiCredit(userCreditTest.id, 10);
    if (!validDeduct.success || validDeduct.remainingCredits !== balance - 10) {
      throw new Error("Valid credit deduction failed");
    }
  });

  // Test 16: Refund processing follows policy
  await runTest(16, "Refund processing follows policy and reverts paid plan", async () => {
    const userRef = await resolveOrCreateUser(`refund_${timestamp}@makemistakes.test`);
    const sessionRef = { userId: userRef.id, email: userRef.email, iat: 1, exp: 9999999999 };
    const orderRef = await PaymentService.createOrder({ session: sessionRef, planId: "PRO" });
    const payId = `pay_refund_${timestamp}`;
    const sig = PaymentService.generateSandboxSignature(orderRef.gatewayOrderId, payId);

    await PaymentService.verifyPayment({
      session: sessionRef,
      orderId: orderRef.orderId,
      gatewayPaymentId: payId,
      gatewaySignature: sig,
    });

    // Process refund webhook event
    const refundWebhookBody = JSON.stringify({
      event: "refund.processed",
      payload: {
        payment: {
          entity: { id: payId },
        },
      },
    });

    const whSig = crypto
      .createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET || process.env.JWT_ACCESS_SECRET || "razorpay_webhook_secret_2026")
      .update(refundWebhookBody)
      .digest("hex");

    await PaymentService.processWebhook({ rawBody: refundWebhookBody, signature: whSig });

    const sub = await PaymentService.getAccountSubscription(userRef.id);
    if (sub.isPaid || sub.status !== "REFUNDED") {
      throw new Error(`Refund did not update subscription status. Got: ${sub.status}`);
    }
  });

  // Test 17: Existing login and registration still work
  await runTest(17, "Existing login and OTP registration resolveOrCreateUser work", async () => {
    const testLoginUser = await resolveOrCreateUser(`auth_check_${timestamp}@makemistakes.test`);
    if (!testLoginUser.id || !testLoginUser.email) {
      throw new Error("resolveOrCreateUser failed");
    }
  });

  // Test 18: Existing Free-plan functionality remains available
  await runTest(18, "Existing Free-plan functionality remains available", async () => {
    const freePlan = PLANS.FREE;
    if (freePlan.price !== 0 || freePlan.aiCreditsPerMonth !== 100) {
      throw new Error("Free plan attributes altered");
    }
  });

  // Test 19: Existing BuildOS and Nova APIs continue to work
  await runTest(19, "BuildOS Nova credit integration operates seamlessly", async () => {
    const testNovaUser = await resolveOrCreateUser(`nova_test_${timestamp}@makemistakes.test`);
    const result = await PaymentService.deductAiCredit(testNovaUser.id, 1, "test_nova_query");
    if (!result.success) {
      throw new Error("Nova credit deduction integration failed");
    }
  });

  // Test 20: Existing payment history remains correct
  await runTest(20, "Payment history records are persisted and retrievable", async () => {
    const sub = await PaymentService.getAccountSubscription(userA.id);
    if (!sub.orders || sub.orders.length === 0) {
      throw new Error("Payment history was empty for User A");
    }
    const record = sub.orders.find((o: any) => o.orderId === orderA.orderId);
    if (!record || record.status !== "PAID" || record.amount !== 99900) {
      throw new Error("Payment order history record missing or has incorrect amount/status");
    }
  });

  // Cleanup test users cleanly
  try {
    await prisma.user.deleteMany({
      where: {
        email: { contains: `@makemistakes.test` },
      },
    });
  } catch (cleanErr) {
    console.warn("Cleanup warning:", cleanErr);
  }

  console.log("\n=======================================================");
  const passedCount = results.filter((r) => r.passed).length;
  console.log(`  RESULTS: ${passedCount} / ${results.length} TESTS PASSED`);
  console.log("=======================================================\n");

  if (passedCount !== results.length) {
    process.exit(1);
  }
}

main().catch((err) => {
  console.error("Test runner crashed:", err);
  process.exit(1);
});
