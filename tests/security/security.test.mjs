import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import test from "node:test";
import { getSmtpCredentials } from "../../src/lib/security/emailConfiguration.ts";
import { connectToConfiguredMongo } from "../../src/lib/security/mongoConnection.ts";
import { getSessionSecret } from "../../src/lib/security/sessionSecret.ts";
import { authenticatedIdentityFromSession } from "../../src/lib/security/identity.ts";
import { findOwnedResource } from "../../src/lib/security/ownedResource.ts";
import {
  consumeGithubOAuthState,
  createGithubOAuthState,
  decryptGithubAccessToken,
  encryptGithubAccessToken,
} from "../../src/lib/security/githubOAuth.ts";
import {
  activateCapturedPayment,
  activatePaymentOnce,
  constantTimeHexMatch,
  isCapturedPaymentValid,
  isWebhookSignatureValid,
  sandboxPaymentsEnabled,
} from "../../src/lib/security/paymentSecurity.ts";
import {
  canUseDevelopmentEmailPreview,
  consumeOtpOnce,
  invalidateOtpAfterDeliveryFailure,
  isOtpExpired,
  otpAttemptAllowed,
  otpSuccessPayload,
  publicOtpError,
} from "../../src/lib/security/otpSecurity.ts";
import { authenticatedSubscriptionUserId } from "../../src/lib/security/subscriptionSecurity.ts";

test("SMTP account eligibility requires only configured credentials", () => {
  assert.deepEqual(getSmtpCredentials("test@example.test", "synthetic-test-password"), {
    user: "test@example.test",
    password: "synthetic-test-password",
  });
  assert.equal(getSmtpCredentials("test@example.test", undefined), null);
  assert.equal(getSmtpCredentials(undefined, "synthetic-test-password"), null);
});

test("MongoDB connection only attempts the configured URI and propagates failure", async () => {
  const uri = "mongodb://isolated-test.invalid/testdb?replicaSet=test";
  const connectionError = new Error("simulated connection failure");
  const attemptedUris = [];

  await assert.rejects(
    connectToConfiguredMongo(uri, async (configuredUri) => {
      attemptedUris.push(configuredUri);
      throw connectionError;
    }),
    (error) => error === connectionError
  );
  assert.deepEqual(attemptedUris, [uri]);

  await assert.rejects(
    connectToConfiguredMongo(undefined, async (configuredUri) => {
      attemptedUris.push(configuredUri);
      return configuredUri;
    }),
    /DATABASE_URL is not configured/
  );
  assert.deepEqual(attemptedUris, [uri]);
});

test("production session secret is mandatory and validated", () => {
  assert.throws(() => getSessionSecret({ NODE_ENV: "production" }), /must be configured/);
  assert.throws(
    () => getSessionSecret({ NODE_ENV: "production", JWT_ACCESS_SECRET: "short" }),
    /at least 32 bytes/
  );
  assert.throws(
    () =>
      getSessionSecret({
        NODE_ENV: "production",
        JWT_ACCESS_SECRET: "makemistakes_secure_session_secret_2026",
      }),
    /legacy development signing key/
  );
  assert.equal(
    getSessionSecret({ NODE_ENV: "production", JWT_ACCESS_SECRET: "a".repeat(32) }),
    "a".repeat(32)
  );
});

test("unauthenticated sessions do not create an authenticated identity", () => {
  assert.equal(authenticatedIdentityFromSession(null), null);
  assert.equal(
    authenticatedIdentityFromSession({
      userId: "student-1",
      email: "  STUDENT@example.test ",
      iat: 1,
      exp: 2,
    }).primaryUserId,
    "student@example.test"
  );
});

test("resource lookup only returns workspaces owned by session identities", async () => {
  const workspaces = new Map([
    ["student-b:P000001", { userId: "student-b", problemId: "P000001" }],
  ]);
  const studentA = ["student-a", "student-a@example.test"];
  const unauthorized = await findOwnedResource(studentA, async (userId) =>
    workspaces.get(`${userId}:P000001`) || null
  );
  assert.equal(unauthorized, null);

  const authorized = await findOwnedResource(["student-b"], async (userId) =>
    workspaces.get(`${userId}:P000001`) || null
  );
  assert.equal(authorized?.resource.userId, "student-b");
});

test("GitHub OAuth state is unpredictable, session-bound, expiring, and one-time", async () => {
  const states = [];
  const db = {
    collection: () => ({
      createIndex: async () => "expiresAt_1",
      insertOne: async (document) => states.push(document),
      findOneAndDelete: async (query) => {
        const index = states.findIndex(
          (document) =>
            document.stateHash === query.stateHash &&
            document.sessionUserId === query.sessionUserId &&
            document.expiresAt > query.expiresAt.$gt
        );
        return index < 0 ? null : states.splice(index, 1)[0];
      },
    }),
  };
  const identity = {
    primaryUserId: "student@example.test",
    session: { userId: "session-user-1" },
  };
  const state = await createGithubOAuthState(db, identity, "owner@example.test", "P000001");
  assert.match(state, /^[A-Za-z0-9_-]{43}$/);
  assert.equal(states[0].userId, "owner@example.test");
  assert.notEqual(states[0].stateHash, state);

  const unauthorized = await consumeGithubOAuthState(
    db,
    state,
    { ...identity, session: { userId: "session-user-2" } }
  );
  assert.equal(unauthorized, null);

  const expired = await consumeGithubOAuthState(
    db,
    state,
    identity,
    new Date(states[0].expiresAt.getTime() + 1)
  );
  assert.equal(expired, null);

  const consumed = await consumeGithubOAuthState(db, state, identity);
  assert.deepEqual(consumed, { userId: "owner@example.test", problemId: "P000001" });
  assert.equal(await consumeGithubOAuthState(db, state, identity), null);
});

test("GitHub credentials are authenticated ciphertext and decrypt only with their key", () => {
  const previousKey = process.env.GITHUB_TOKEN_ENCRYPTION_KEY;
  process.env.GITHUB_TOKEN_ENCRYPTION_KEY = Buffer.alloc(32, 7).toString("base64");
  try {
    const token = "github-token-secret";
    const encrypted = encryptGithubAccessToken(token);
    assert.notEqual(encrypted, token);
    assert.equal(decryptGithubAccessToken(encrypted).token, token);
    assert.equal(decryptGithubAccessToken(encrypted).wasEncrypted, true);

    process.env.GITHUB_TOKEN_ENCRYPTION_KEY = Buffer.alloc(32, 8).toString("base64");
    assert.throws(() => decryptGithubAccessToken(encrypted));
  } finally {
    if (previousKey === undefined) {
      delete process.env.GITHUB_TOKEN_ENCRYPTION_KEY;
    } else {
      process.env.GITHUB_TOKEN_ENCRYPTION_KEY = previousKey;
    }
  }
});

test("OTP production responses hide OTP and preview URLs; email preview is development-only", () => {
  const result = { devOtp: "123456", previewUrl: "https://ethereal.example/message" };
  assert.equal(canUseDevelopmentEmailPreview({ NODE_ENV: "production" }), false);
  assert.equal(canUseDevelopmentEmailPreview({ NODE_ENV: "test" }), false);
  assert.equal(canUseDevelopmentEmailPreview({ NODE_ENV: "development" }), true);
  const productionResponse = otpSuccessPayload(result, { NODE_ENV: "production" }, "development");
  assert.equal("devOtp" in productionResponse, false);
  assert.equal("previewUrl" in productionResponse, false);
  assert.equal(JSON.stringify(publicOtpError("EMAIL_DELIVERY_FAILED: code 123456", "send")).includes("123456"), false);
  assert.deepEqual(publicOtpError("EMAIL_DELIVERY_FAILED: provider detail", "send"), {
    status: 503,
    message: "Unable to send a verification email. Please try again later.",
  });
  assert.equal(otpSuccessPayload(result, { NODE_ENV: "development" }, "development").previewUrl, result.previewUrl);
});

test("OTP expires at its deadline, locks after five attempts, and can be consumed only once", async () => {
  const deadline = new Date("2026-01-01T00:10:00.000Z");
  assert.equal(isOtpExpired(deadline, deadline.getTime() - 1), false);
  assert.equal(isOtpExpired(deadline, deadline.getTime()), true);
  assert.equal(otpAttemptAllowed(4), true);
  assert.equal(otpAttemptAllowed(5), false);

  let stored = true;
  const consume = () =>
    consumeOtpOnce(async () => {
      if (!stored) return { count: 0 };
      stored = false;
      return { count: 1 };
    });
  assert.equal(await consume(), true);
  assert.equal(await consume(), false);

  let invalidated = false;
  const deliveryFailureHandled = await invalidateOtpAfterDeliveryFailure(
    async () => {
      invalidated = true;
      return { count: 1 };
    },
    async () => ({ count: 0 })
  );
  assert.equal(deliveryFailureHandled, true);
  assert.equal(invalidated, true);
});

test("payments reject production sandbox, bad signatures, and amount/order/status mismatches", () => {
  assert.equal(
    sandboxPaymentsEnabled({ NODE_ENV: "production", PAYMENT_SANDBOX_ENABLED: "true" }),
    false
  );
  assert.equal(
    sandboxPaymentsEnabled({ NODE_ENV: "development", PAYMENT_SANDBOX_ENABLED: "true" }),
    true
  );
  assert.equal(constantTimeHexMatch("sandbox_sig_auto_generate", "a".repeat(64)), false);
  assert.equal(constantTimeHexMatch("a".repeat(63), "a".repeat(64)), false);

  const order = { amount: 99900, currency: "INR", gatewayOrderId: "order_test_1" };
  const captured = {
    id: "pay_test_1",
    order_id: "order_test_1",
    status: "captured",
    amount: 99900,
    currency: "INR",
  };
  assert.equal(isCapturedPaymentValid(order, captured), true);
  assert.equal(isCapturedPaymentValid(order, captured, "attacker-payment"), false);
  assert.equal(isCapturedPaymentValid(order, { ...captured, amount: 1 }), false);
  assert.equal(isCapturedPaymentValid(order, { ...captured, currency: "USD" }), false);
  assert.equal(isCapturedPaymentValid(order, { ...captured, order_id: "other_order" }), false);
  assert.equal(isCapturedPaymentValid(order, { ...captured, status: "authorized" }), false);

  const payload = JSON.stringify({ event: "payment.captured" });
  const signature = createHmacForTest(payload, "webhook-secret");
  assert.equal(isWebhookSignatureValid(payload, signature, "webhook-secret"), true);
  assert.equal(isWebhookSignatureValid(payload, "bad-signature", "webhook-secret"), false);
  assert.equal(isWebhookSignatureValid(payload, signature, ""), false);
});

test("payment activation grants entitlements once only after the caller validates payment", async () => {
  let paid = false;
  let creditGrants = 0;
  const activate = () =>
    activatePaymentOnce(
      async () => {
        if (paid) return false;
        paid = true;
        return true;
      },
      async () => {
        creditGrants += 1000;
        return { activated: true };
      },
      async () => ({ alreadyProcessed: true })
    );

  assert.deepEqual(await activate(), { activated: true });
  assert.deepEqual(await activate(), { alreadyProcessed: true });
  assert.equal(creditGrants, 1000);
});

test("uncaptured or mismatched gateway payments cannot invoke entitlement activation", async () => {
  const order = { amount: 99900, currency: "INR", gatewayOrderId: "order_test_2" };
  let creditsGranted = false;
  await assert.rejects(
    activateCapturedPayment(
      order,
      {
        id: "pay_test_2",
        order_id: "order_test_2",
        status: "authorized",
        amount: 99900,
        currency: "INR",
      },
      "pay_test_2",
      async () => {
        creditsGranted = true;
      }
    ),
    /PAYMENT_UNVERIFIED/
  );
  assert.equal(creditsGranted, false);
});

test("subscription lookup derives identity from session only", () => {
  assert.equal(authenticatedSubscriptionUserId(null), null);
  assert.equal(authenticatedSubscriptionUserId({ userId: "student-a" }), "student-a");
  assert.equal(
    authenticatedSubscriptionUserId({ userId: "student-a", email: "student-b@example.test" }),
    "student-a"
  );
});

function createHmacForTest(payload, secret) {
  return createHmac("sha256", secret).update(payload).digest("hex");
}
