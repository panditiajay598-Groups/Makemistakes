import {
  getOrCreateTransporter,
  getTransporterPoolSize,
  _resetTransportersForTesting,
} from "../src/lib/emailTransporter";

interface TestCheck {
  name: string;
  passed: boolean;
  details: string;
}

const checks: TestCheck[] = [];

function assert(name: string, condition: boolean, details: string) {
  checks.push({ name, passed: condition, details });
  if (condition) {
    console.log(`  [PASS] ${name}`);
  } else {
    console.error(`  [FAIL] ${name}: ${details}`);
  }
}

async function runSmtpVerification() {
  console.log("==================================================================");
  console.log("TASK 10 VERIFICATION: SMTP TRANSPORTER REUSE & POOLING AUDIT");
  console.log("==================================================================");

  _resetTransportersForTesting();

  // Test 1: Equivalent configurations reuse the same transporter instance
  console.log("\n--- Group 1: Transporter Instance Reuse ---");
  const configA = {
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: { user: "support@makemistakes.in", pass: "secretpass1" },
  };

  const t1 = getOrCreateTransporter(configA);
  const t2 = getOrCreateTransporter(configA);

  assert(
    "1.1 Identical SMTP configuration reuses the exact same transporter instance",
    t1 === t2,
    `Reference equality: ${t1 === t2}`
  );

  assert(
    "1.2 Transporter pool size remains 1 after repeated equivalent requests",
    getTransporterPoolSize() === 1,
    `Pool size: ${getTransporterPoolSize()}`
  );

  // Test 2: Incompatible configurations create isolated transporters
  console.log("\n--- Group 2: Configuration Isolation ---");
  const configB = {
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: { user: "secondary@makemistakes.in", pass: "secretpass2" },
  };

  const configC = {
    host: "smtp.sendgrid.net",
    port: 587,
    secure: false,
    auth: { user: "apikey", pass: "sgkey123" },
  };

  const t3 = getOrCreateTransporter(configB);
  const t4 = getOrCreateTransporter(configC);

  assert(
    "2.1 Different user account creates an isolated transporter instance",
    t1 !== t3,
    `t1 !== t3: ${t1 !== t3}`
  );

  assert(
    "2.2 Different host/port creates an isolated transporter instance",
    t1 !== t4 && t3 !== t4,
    `t1 !== t4: ${t1 !== t4}`
  );

  assert(
    "2.3 Transporter pool accurately tracks distinct configurations",
    getTransporterPoolSize() === 3,
    `Pool size: ${getTransporterPoolSize()}`
  );

  // Test 2.4: Password rotation creates a new transporter without exposing secret
  const configARotated = {
    ...configA,
    auth: { user: "support@makemistakes.in", pass: "new_rotated_password" },
  };
  const tRotated = getOrCreateTransporter(configARotated);
  assert(
    "2.4 Credential rotation creates new isolated transporter instance without stale reuse",
    tRotated !== t1 && tRotated !== t2,
    `tRotated !== t1: ${tRotated !== t1}`
  );

  // Test 3: Validation and Error Handling
  console.log("\n--- Group 3: Input Validation & Secret Protection ---");
  let failedAsExpected = false;
  try {
    getOrCreateTransporter({ host: "", port: 0, secure: false });
  } catch (err: any) {
    failedAsExpected = true;
  }

  assert(
    "3.1 Missing host or port throws controlled validation error",
    failedAsExpected,
    `Validation error caught: ${failedAsExpected}`
  );

  // Test 4: Reset & Lifecycle Cleanup
  console.log("\n--- Group 4: Lifecycle Cleanup ---");
  _resetTransportersForTesting();
  assert(
    "4.1 _resetTransportersForTesting clears the pool cleanly",
    getTransporterPoolSize() === 0,
    `Pool size after reset: ${getTransporterPoolSize()}`
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
    console.error("\n❌ Task 10 SMTP transporter reuse verification FAILED.");
    process.exit(1);
  } else {
    console.log("\n✅ All Task 10 SMTP transporter reuse verification checks PASSED cleanly.");
    process.exit(0);
  }
}

runSmtpVerification().catch((err) => {
  console.error("Fatal error during Task 10 verification:", err);
  process.exit(1);
});
