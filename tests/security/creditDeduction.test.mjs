import assert from "node:assert/strict";
import test from "node:test";
import {
  deductCreditsAtomically,
} from "../../src/lib/security/creditDeduction.ts";

/**
 * Creates an in-memory concurrent store simulating MongoDB's atomic document-level
 * update operations and transaction logging.
 */
function createMockCreditStore(initialData = {}) {
  // Map of userId -> { remainingCredits, totalCredits, usedCredits }
  const balances = new Map();
  const transactions = [];
  let transientFailuresRemaining = 0;
  let transientErrorType = new Error("WriteConflict: simulated write conflict");

  for (const [uid, b] of Object.entries(initialData)) {
    balances.set(uid, { ...b });
  }

  // Mutex/document lock simulation per user
  const userLocks = new Map();

  async function withUserLock(userId, fn) {
    while (userLocks.get(userId)) {
      await userLocks.get(userId);
    }
    let resolveLock;
    const lockPromise = new Promise((resolve) => {
      resolveLock = resolve;
    });
    userLocks.set(userId, lockPromise);
    try {
      return await fn();
    } finally {
      userLocks.delete(userId);
      resolveLock();
    }
  }

  const store = {
    balances,
    transactions,

    setTransientFailures(count, error) {
      transientFailuresRemaining = count;
      if (error) transientErrorType = error;
    },

    async decrementIfSufficient(userId, cost) {
      if (transientFailuresRemaining > 0) {
        transientFailuresRemaining--;
        throw transientErrorType;
      }

      // Simulate non-zero network/event-loop latency to expose race conditions
      await new Promise((r) => setTimeout(r, Math.floor(Math.random() * 3) + 1));

      // MongoDB document write lock guarantees atomic evaluation of filter: { remainingCredits: { $gte: cost } }
      return withUserLock(userId, async () => {
        const doc = balances.get(userId);
        if (!doc) return false;
        if (doc.remainingCredits >= cost) {
          doc.remainingCredits -= cost;
          doc.usedCredits += cost;
          return true;
        }
        return false;
      });
    },

    async getBalance(userId) {
      const doc = balances.get(userId);
      return doc ? { ...doc } : null;
    },

    async initializeBalanceIfMissing(userId, defaultCredits = 100) {
      return withUserLock(userId, async () => {
        if (!balances.has(userId)) {
          balances.set(userId, {
            totalCredits: defaultCredits,
            usedCredits: 0,
            remainingCredits: defaultCredits,
          });
          return true;
        }
        // Simulates Prisma P2002 Unique constraint race
        const err = new Error("Unique constraint failed on the fields: (`userId`)");
        err.code = "P2002";
        throw err;
      });
    },

    async recordTransaction(userId, amount, type, referenceId, balanceAfter) {
      transactions.push({
        userId,
        amount,
        type,
        referenceId,
        balanceAfter,
        timestamp: Date.now(),
      });
    },
  };

  return store;
}

// ============================================================================
// SUITE 1: INPUT VALIDATION & SAFETY BOUNDARIES
// ============================================================================

test("credit deduction rejects missing or invalid userId", async () => {
  const store = createMockCreditStore({ u1: { remainingCredits: 100, totalCredits: 100, usedCredits: 0 } });

  assert.deepEqual(await deductCreditsAtomically(store, ""), { success: false, reason: "UNAUTHORIZED" });
  assert.deepEqual(await deductCreditsAtomically(store, "   "), { success: false, reason: "UNAUTHORIZED" });
  assert.deepEqual(await deductCreditsAtomically(store, null), { success: false, reason: "UNAUTHORIZED" });
  assert.deepEqual(await deductCreditsAtomically(store, undefined), { success: false, reason: "UNAUTHORIZED" });
});

test("credit deduction rejects non-positive or non-integer costs", async () => {
  const store = createMockCreditStore({ u1: { remainingCredits: 100, totalCredits: 100, usedCredits: 0 } });

  assert.deepEqual(await deductCreditsAtomically(store, "u1", 0), { success: false, reason: "INVALID_COST" });
  assert.deepEqual(await deductCreditsAtomically(store, "u1", -5), { success: false, reason: "INVALID_COST" });
  assert.deepEqual(await deductCreditsAtomically(store, "u1", 1.5), { success: false, reason: "INVALID_COST" });
  assert.deepEqual(await deductCreditsAtomically(store, "u1", NaN), { success: false, reason: "INVALID_COST" });
  assert.deepEqual(await deductCreditsAtomically(store, "u1", Infinity), { success: false, reason: "INVALID_COST" });
});

// ============================================================================
// SUITE 2: FUNCTIONAL ACCURACY & CONSERVATION OF CREDITS
// ============================================================================

test("single valid deduction decrements remaining credits and logs transaction", async () => {
  const store = createMockCreditStore({
    user_test: { remainingCredits: 50, totalCredits: 50, usedCredits: 0 },
  });

  const res = await deductCreditsAtomically(store, "user_test", 5, "nova_chat");

  assert.equal(res.success, true);
  assert.equal(res.remainingCredits, 45);

  const balance = await store.getBalance("user_test");
  assert.equal(balance.remainingCredits, 45);
  assert.equal(balance.usedCredits, 5);
  assert.equal(balance.totalCredits, 50);

  assert.equal(store.transactions.length, 1);
  assert.deepEqual(store.transactions[0], {
    userId: "user_test",
    amount: -5,
    type: "NOVA_QUERY",
    referenceId: "nova_chat",
    balanceAfter: 45,
    timestamp: store.transactions[0].timestamp,
  });
});

test("insufficient balance fails without modifying balance or creating transaction", async () => {
  const store = createMockCreditStore({
    user_broke: { remainingCredits: 3, totalCredits: 100, usedCredits: 97 },
  });

  const res = await deductCreditsAtomically(store, "user_broke", 5, "nova_chat");

  assert.equal(res.success, false);
  assert.equal(res.reason, "INSUFFICIENT_CREDITS");
  assert.equal(res.remainingCredits, 3);

  const balance = await store.getBalance("user_broke");
  assert.equal(balance.remainingCredits, 3);
  assert.equal(balance.usedCredits, 97);
  assert.equal(store.transactions.length, 0);
});

test("self-healing initializes missing balance record and completes deduction", async () => {
  const store = createMockCreditStore({});

  const res = await deductCreditsAtomically(store, "user_new", 10, "first_query", {
    defaultInitialCredits: 100,
  });

  assert.equal(res.success, true);
  assert.equal(res.remainingCredits, 90);

  const balance = await store.getBalance("user_new");
  assert.equal(balance.remainingCredits, 90);
  assert.equal(balance.usedCredits, 10);
  assert.equal(balance.totalCredits, 100);
  assert.equal(store.transactions.length, 1);
});

// ============================================================================
// SUITE 3: CONCURRENCY & ZERO-OVERSPENDING GUARANTEE
// ============================================================================

test("concurrency: 50 simultaneous requests competing for 5 credits prevent overspending", async () => {
  const store = createMockCreditStore({
    race_user: { remainingCredits: 5, totalCredits: 10, usedCredits: 5 },
  });

  // Launch 50 concurrent requests simultaneously
  const requests = Array.from({ length: 50 }, (_, i) =>
    deductCreditsAtomically(store, "race_user", 1, `concurrent_query_${i}`, {
      retryDelayMs: 2,
    })
  );

  const results = await Promise.all(requests);

  const successes = results.filter((r) => r.success === true);
  const failures = results.filter((r) => r.success === false);

  assert.equal(successes.length, 5, "Exactly 5 requests should have succeeded");
  assert.equal(failures.length, 45, "Exactly 45 requests should have failed due to insufficient credits");

  failures.forEach((f) => {
    assert.equal(f.reason, "INSUFFICIENT_CREDITS");
  });

  const finalBalance = await store.getBalance("race_user");
  assert.equal(finalBalance.remainingCredits, 0, "Remaining credits must be exactly 0, never negative");
  assert.equal(finalBalance.usedCredits, 10, "Used credits must have increased by exactly 5");
  assert.equal(store.transactions.length, 5, "Exactly 5 audit transactions must be recorded");

  const totalDeducted = store.transactions.reduce((sum, t) => sum + Math.abs(t.amount), 0);
  assert.equal(totalDeducted, 5, "Total deducted amount must equal 5");
});

test("concurrency: 100 simultaneous requests with sufficient balance all succeed", async () => {
  const store = createMockCreditStore({
    bulk_user: { remainingCredits: 150, totalCredits: 150, usedCredits: 0 },
  });

  const requests = Array.from({ length: 100 }, (_, i) =>
    deductCreditsAtomically(store, "bulk_user", 1, `bulk_query_${i}`, {
      retryDelayMs: 1,
    })
  );

  const results = await Promise.all(requests);

  const successes = results.filter((r) => r.success === true);
  assert.equal(successes.length, 100);

  const finalBalance = await store.getBalance("bulk_user");
  assert.equal(finalBalance.remainingCredits, 50);
  assert.equal(finalBalance.usedCredits, 100);
  assert.equal(store.transactions.length, 100);
});

test("concurrency: concurrent multi-cost deductions maintain exact invariants", async () => {
  const store = createMockCreditStore({
    multi_user: { remainingCredits: 20, totalCredits: 20, usedCredits: 0 },
  });

  // 10 requests of cost 3 = 30 total demand for 20 credits
  const requests = Array.from({ length: 10 }, (_, i) =>
    deductCreditsAtomically(store, "multi_user", 3, `multi_cost_${i}`, {
      retryDelayMs: 2,
    })
  );

  const results = await Promise.all(requests);

  const successes = results.filter((r) => r.success === true);
  const failures = results.filter((r) => r.success === false);

  // 20 credits / 3 cost per query = at most 6 queries can succeed (6 * 3 = 18, 2 remaining)
  assert.equal(successes.length, 6, "At most 6 queries can succeed");
  assert.equal(failures.length, 4, "Remaining 4 queries must fail");

  const finalBalance = await store.getBalance("multi_user");
  assert.equal(finalBalance.remainingCredits, 2, "Remaining balance must be exactly 20 - 18 = 2");
  assert.equal(finalBalance.usedCredits, 18);
  assert.equal(store.transactions.length, 6);
});

// ============================================================================
// SUITE 4: RETRY LOGIC ON TRANSIENT FAILURES
// ============================================================================

test("retry logic: recovers transparently from transient WriteConflict", async () => {
  const store = createMockCreditStore({
    user_conflict: { remainingCredits: 50, totalCredits: 50, usedCredits: 0 },
  });

  // Configure 2 transient failures before succeeding on attempt 3
  store.setTransientFailures(2, new Error("WriteConflict error"));

  const res = await deductCreditsAtomically(store, "user_conflict", 2, "retry_query", {
    maxRetries: 3,
    retryDelayMs: 5,
  });

  assert.equal(res.success, true);
  assert.equal(res.remainingCredits, 48);

  const balance = await store.getBalance("user_conflict");
  assert.equal(balance.remainingCredits, 48);
  assert.equal(balance.usedCredits, 2);
  assert.equal(store.transactions.length, 1);
});

test("retry logic: fails safely when errors exceed maxRetries", async () => {
  const store = createMockCreditStore({
    user_fail: { remainingCredits: 50, totalCredits: 50, usedCredits: 0 },
  });

  // Configure 5 failures, but maxRetries is only 2
  store.setTransientFailures(5, new Error("Continuous database timeout"));

  const res = await deductCreditsAtomically(store, "user_fail", 2, "failing_query", {
    maxRetries: 2,
    retryDelayMs: 2,
  });

  assert.equal(res.success, false);
  assert.equal(res.reason, "TRANSACTION_FAILED");

  // Balance must remain intact
  const balance = await store.getBalance("user_fail");
  assert.equal(balance.remainingCredits, 50);
  assert.equal(balance.usedCredits, 0);
  assert.equal(store.transactions.length, 0);
});

test("retry logic: concurrent balance initialization handles P2002 race seamlessly", async () => {
  const store = createMockCreditStore({});

  // Two concurrent calls for a brand new user
  const [res1, res2] = await Promise.all([
    deductCreditsAtomically(store, "user_concurrent_new", 1, "query_1", { retryDelayMs: 5 }),
    deductCreditsAtomically(store, "user_concurrent_new", 1, "query_2", { retryDelayMs: 5 }),
  ]);

  assert.equal(res1.success, true);
  assert.equal(res2.success, true);

  const balance = await store.getBalance("user_concurrent_new");
  assert.equal(balance.totalCredits, 100);
  assert.equal(balance.remainingCredits, 98);
  assert.equal(balance.usedCredits, 2);
  assert.equal(store.transactions.length, 2);
});

