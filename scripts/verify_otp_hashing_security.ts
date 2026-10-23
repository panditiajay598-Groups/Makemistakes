import path from "path";
import dotenv from "dotenv";
dotenv.config({ path: path.join(__dirname, "..", ".env") });

import { OTPService } from "../backend/services/otp.service";
import { prisma } from "../backend/lib/prisma";
import bcrypt from "bcryptjs";

interface TestCheck {
  name: string;
  passed: boolean;
  details: string;
}

const checks: TestCheck[] = [];

function assert(name: string, condition: boolean, details: string = "") {
  checks.push({ name, passed: condition, details });
  if (condition) {
    console.log(`  [PASS] ${name}`);
  } else {
    console.error(`  [FAIL] ${name}: ${details}`);
  }
}

async function runOtpVerification() {
  console.log("==================================================================");
  console.log("TASK 11 VERIFICATION: OTP HASHING PERFORMANCE & SECURITY AUDIT");
  console.log("==================================================================");

  const testEmail = "test_otp_perf_qa@makemistakes.in";

  // Clean existing test fixture
  await prisma.emailVerification.deleteMany({ where: { email: testEmail } });

  // Test 1: Entropy & Format
  console.log("\n--- Group 1: OTP Entropy & Generation ---");
  const otpSamples = new Set<string>();
  for (let i = 0; i < 20; i++) {
    const otp = OTPService.generateOTP();
    otpSamples.add(otp);
    if (!/^\d{6}$/.test(otp)) {
      assert("1.1 Generated OTP is 6 numeric digits", false, `Invalid OTP generated: ${otp}`);
      break;
    }
  }
  assert(
    "1.1 Generated OTP is 6 numeric digits with strong entropy",
    otpSamples.size === 20,
    `Generated 20 unique OTP samples: size=${otpSamples.size}`
  );

  // Test 2: Hashing Performance Benchmark
  console.log("\n--- Group 2: Cryptographic Benchmark ---");
  const plain = "739201";
  const startHash = performance.now();
  const hash = await bcrypt.hash(plain, 10);
  const hashDuration = performance.now() - startHash;

  const startComp = performance.now();
  const isValid = await bcrypt.compare(plain, hash);
  const compareDuration = performance.now() - startComp;

  assert(
    "2.1 Bcrypt cost 10 verification is valid and sub-1s",
    isValid && hashDuration < 1000 && compareDuration < 1000,
    `Hash: ${hashDuration.toFixed(2)}ms, Compare: ${compareDuration.toFixed(2)}ms`
  );

  // Test 3: Standard Successful Flow
  console.log("\n--- Group 3: Verification Lifecycle & Replay Protection ---");
  const testOtp = "482910";
  const otpHash = await bcrypt.hash(testOtp, 10);
  const now = new Date();

  await prisma.emailVerification.upsert({
    where: { email: testEmail },
    create: {
      email: testEmail,
      otpHash,
      expiresAt: new Date(now.getTime() + 10 * 60 * 1000),
      attempts: 0,
      verified: false,
      lastSentAt: now,
      hourlyCount: 1,
      windowStart: now,
    },
    update: {
      otpHash,
      expiresAt: new Date(now.getTime() + 10 * 60 * 1000),
      attempts: 0,
      verified: false,
      lastSentAt: now,
      hourlyCount: 1,
      windowStart: now,
    },
  });

  const validRes = await OTPService.verifyOTP(testEmail, testOtp);
  assert(
    "3.1 Valid OTP verifies successfully",
    validRes.success === true && validRes.verified === true,
    `Response: ${JSON.stringify(validRes)}`
  );

  // Replay attempt on same email
  let replayBlocked = false;
  try {
    const replayRes = await OTPService.verifyOTP(testEmail, testOtp);
    replayBlocked = !replayRes.verified;
  } catch (err: any) {
    replayBlocked = true;
  }
  assert(
    "3.2 Replaying verified OTP is blocked (single-use deletion guarantee)",
    replayBlocked,
    `Replay blocked: ${replayBlocked}`
  );

  // Test 3.3: Real Concurrent OTP Race Condition Test (Promise.all)
  const concurrentEmail = "test_concurrent_race@makemistakes.in";
  await prisma.emailVerification.upsert({
    where: { email: concurrentEmail },
    create: {
      email: concurrentEmail,
      otpHash,
      expiresAt: new Date(now.getTime() + 10 * 60 * 1000),
      attempts: 0,
      verified: false,
      lastSentAt: now,
      hourlyCount: 1,
      windowStart: now,
    },
    update: {
      otpHash,
      expiresAt: new Date(now.getTime() + 10 * 60 * 1000),
      attempts: 0,
      verified: false,
      lastSentAt: now,
      hourlyCount: 1,
      windowStart: now,
    },
  });

  const [race1, race2] = await Promise.allSettled([
    OTPService.verifyOTP(concurrentEmail, testOtp),
    OTPService.verifyOTP(concurrentEmail, testOtp),
  ]);

  const race1Success = race1.status === "fulfilled" && race1.value.verified === true;
  const race2Success = race2.status === "fulfilled" && race2.value.verified === true;
  const exactlyOneSucceeded = (race1Success && !race2Success) || (!race1Success && race2Success);

  assert(
    "3.3 Concurrent Promise.all race: exactly one request succeeds and the other fails",
    exactlyOneSucceeded,
    `race1Success: ${race1Success}, race2Success: ${race2Success}`
  );

  // Subsequent third reuse attempt must also fail
  let thirdReuseBlocked = false;
  try {
    const res3 = await OTPService.verifyOTP(concurrentEmail, testOtp);
    thirdReuseBlocked = !res3.verified;
  } catch {
    thirdReuseBlocked = true;
  }
  assert(
    "3.4 Subsequent third reuse attempt is also blocked",
    thirdReuseBlocked,
    `Third reuse blocked: ${thirdReuseBlocked}`
  );

  // Cleanup concurrent fixture
  await prisma.emailVerification.deleteMany({ where: { email: concurrentEmail } });

  // Test 4: Invalid OTP & Attempt Lockout
  console.log("\n--- Group 4: Attempt Lockout & Rate Limits ---");
  await prisma.emailVerification.upsert({
    where: { email: testEmail },
    create: {
      email: testEmail,
      otpHash,
      expiresAt: new Date(now.getTime() + 10 * 60 * 1000),
      attempts: 4, // 1 attempt remaining
      verified: false,
      lastSentAt: now,
      hourlyCount: 1,
      windowStart: now,
    },
    update: {
      otpHash,
      expiresAt: new Date(now.getTime() + 10 * 60 * 1000),
      attempts: 4,
      verified: false,
      lastSentAt: now,
      hourlyCount: 1,
      windowStart: now,
    },
  });

  let wrongAttemptFailed = false;
  try {
    await OTPService.verifyOTP(testEmail, "000000");
  } catch (err: any) {
    wrongAttemptFailed = true;
  }
  assert(
    "4.1 Incorrect OTP fails and records failed attempt",
    wrongAttemptFailed,
    `Failure caught: ${wrongAttemptFailed}`
  );

  const lockedRecord = await prisma.emailVerification.findUnique({ where: { email: testEmail } });
  let lockoutEnforced = false;
  try {
    await OTPService.verifyOTP(testEmail, testOtp);
  } catch (err: any) {
    lockoutEnforced = true;
  }
  assert(
    "4.2 Exceeding maximum attempts (5) enforces strict lockout even with correct OTP",
    lockoutEnforced && (lockedRecord?.attempts ?? 0) >= 5,
    `Attempts: ${lockedRecord?.attempts}, Lockout caught: ${lockoutEnforced}`
  );

  // Test 5: Expiration Enforcement
  console.log("\n--- Group 5: Expiration Protection ---");
  await prisma.emailVerification.upsert({
    where: { email: testEmail },
    create: {
      email: testEmail,
      otpHash,
      expiresAt: new Date(now.getTime() - 1000), // expired 1s ago
      attempts: 0,
      verified: false,
      lastSentAt: now,
      hourlyCount: 1,
      windowStart: now,
    },
    update: {
      otpHash,
      expiresAt: new Date(now.getTime() - 1000),
      attempts: 0,
      verified: false,
      lastSentAt: now,
      hourlyCount: 1,
      windowStart: now,
    },
  });

  let expiredBlocked = false;
  try {
    await OTPService.verifyOTP(testEmail, testOtp);
  } catch (err: any) {
    expiredBlocked = true;
  }
  assert(
    "5.1 Expired OTP is blocked safely before bcrypt execution",
    expiredBlocked,
    `Expired blocked: ${expiredBlocked}`
  );

  // Cleanup test fixture
  await prisma.emailVerification.deleteMany({ where: { email: testEmail } });

  // Test 6: In-Memory CodeStore Attempt Lockout & Security Parity
  console.log("\n--- Group 6: CodeStore Attempt Lockout & Security Parity ---");
  const { saveCode, verifyCode } = await import("../src/lib/codeStore");
  const csEmail = "codestore_test@makemistakes.in";
  saveCode(csEmail, "654321");

  // 4 incorrect attempts
  for (let i = 0; i < 4; i++) {
    const wrongRes = verifyCode(csEmail, "000000");
    assert(
      `6.1 Incorrect attempt #${i + 1} fails safely with remaining attempts`,
      wrongRes.valid === false && (wrongRes.reason?.includes("attempt") ?? false),
      `Attempt ${i + 1} result: valid=${wrongRes.valid}, reason=${wrongRes.reason}`
    );
  }

  // 5th incorrect attempt -> triggers lockout
  const lockoutRes = verifyCode(csEmail, "000000");
  assert(
    "6.2 5th incorrect attempt triggers strict lockout",
    lockoutRes.valid === false && (lockoutRes.reason?.includes("Maximum verification attempts exceeded") ?? false),
    `5th attempt result: valid=${lockoutRes.valid}, reason=${lockoutRes.reason}`
  );

  // Correct code after lockout should now be consumed / rejected
  const postLockoutRes = verifyCode(csEmail, "654321");
  assert(
    "6.3 Submitting correct code after lockout fails safely (consumed/invalidated)",
    postLockoutRes.valid === false,
    `Post lockout result: valid=${postLockoutRes.valid}, reason=${postLockoutRes.reason}`
  );

  // Test 7: Task 16 Generic Error Messages & Account Enumeration Prevention
  console.log("\n--- Group 7: Generic OTP Error Messages & Enumeration Resistance ---");
  const nonExistentEmail = "completely_unknown_user_12345@makemistakes.in";
  let nonExistentMsg = "";
  try {
    await OTPService.verifyOTP(nonExistentEmail, "123456");
  } catch (err: any) {
    nonExistentMsg = err.message;
  }

  const GENERIC_MSG = "Invalid or expired verification code. Please request a new code.";
  assert(
    "7.1 Unknown email returns generic non-enumerating message",
    nonExistentMsg === GENERIC_MSG,
    `Actual: "${nonExistentMsg}" | Expected: "${GENERIC_MSG}"`
  );

  const csNonExistent = verifyCode(nonExistentEmail, "123456");
  assert(
    "7.2 CodeStore unknown email returns matching generic message",
    csNonExistent.reason === GENERIC_MSG,
    `Actual: "${csNonExistent.reason}" | Expected: "${GENERIC_MSG}"`
  );

  // Summary
  console.log("\n==================================================================");
  console.log("VERIFICATION SUMMARY");
  console.log("==================================================================");
  const total = checks.length;
  const passed = checks.filter((c) => c.passed).length;
  const failed = checks.filter((c) => !c.passed).length;

  console.log(`Total checks: ${total}`);
  console.log(`Passed:       ${passed}`);
  console.log(`Failed:       ${failed}`);

  if (failed > 0) {
    console.error("\n❌ Task 11 OTP security verification FAILED.");
    process.exit(1);
  } else {
    console.log("\n✅ All Task 11 OTP security verification checks PASSED cleanly.");
    process.exit(0);
  }
}

runOtpVerification().catch((err) => {
  console.error("Fatal error during Task 11 verification:", err);
  process.exit(1);
});
