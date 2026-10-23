import path from "path";

import dotenv from "dotenv";
dotenv.config({ path: path.join(__dirname, "..", ".env") });

import { GET as getProfile, POST as postProfile } from "../src/app/api/settings/profile/route";
import { GET as getPreferences, POST as postPreferences } from "../src/app/api/settings/preferences/route";
import { GET as exportData } from "../src/app/api/settings/export-data/route";
import { POST as deleteAccount } from "../src/app/api/settings/delete-account/route";
import { signSessionToken, SESSION_COOKIE_NAME } from "../src/lib/authSession";
import { getDb } from "../src/lib/mongodb";

interface TestCase {
  name: string;
  passed: boolean;
  details: string;
}

async function runSettingsIsolationTests() {
  console.log("==================================================================");
  console.log("SECURITY VERIFICATION: SETTINGS API USER ISOLATION & AUTHORIZATION");
  console.log("==================================================================");

  const results: TestCase[] = [];
  const db = await getDb();
  const profilesCol = db.collection("user_profiles");
  const prefsCol = db.collection("user_preferences");
  const journeysCol = db.collection("user_journeys");

  const userA = {
    userId: "test_settings_user_a_id",
    email: "test_settings_user_a@example.com",
    role: "student",
  };

  const userB = {
    userId: "test_settings_user_b_id",
    email: "test_settings_user_b@example.com",
    role: "student",
  };

  const tokenA = signSessionToken({ userId: userA.userId, email: userA.email, role: userA.role });
  const tokenB = signSessionToken({ userId: userB.userId, email: userB.email, role: userB.role });

  try {
    // -------------------------------------------------------------
    // SETUP FIXTURES
    // -------------------------------------------------------------
    console.log("\n[Setup] Cleaning test records and initializing fixtures...");
    await profilesCol.deleteMany({ userId: { $in: [userA.email, userA.userId, userB.email, userB.userId] } });
    await prefsCol.deleteMany({ userId: { $in: [userA.email, userA.userId, userB.email, userB.userId] } });
    await journeysCol.deleteMany({ userId: { $in: [userA.email, userA.userId, userB.email, userB.userId] } });

    // Seed User B initial private profile & preferences
    await profilesCol.insertOne({
      userId: userB.email,
      fullName: "User B Private Name",
      bio: "User B Private Bio",
      email: userB.email,
      location: "Private Island",
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await prefsCol.insertOne({
      userId: userB.email,
      theme: "dark",
      compactMode: true,
      defaultDashboard: "/dashboard/journey",
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // -------------------------------------------------------------
    // TEST 1: Anonymous requests blocked across all 4 routes
    // -------------------------------------------------------------
    console.log("\n[Test 1] Testing unauthenticated access attempts...");
    const anonProfileRes = await getProfile(new Request("http://localhost:3000/api/settings/profile", { method: "GET" }));
    const anonPrefRes = await getPreferences(new Request("http://localhost:3000/api/settings/preferences", { method: "GET" }));
    const anonExportRes = await exportData(new Request("http://localhost:3000/api/settings/export-data", { method: "GET" }));
    const anonDeleteRes = await deleteAccount(new Request("http://localhost:3000/api/settings/delete-account", {
      method: "POST",
      body: JSON.stringify({ confirmation: "DELETE" }),
    }));

    const t1Passed =
      anonProfileRes.status === 401 &&
      anonPrefRes.status === 401 &&
      anonExportRes.status === 401 &&
      anonDeleteRes.status === 401;

    results.push({
      name: "1. Anonymous Access Strictly Blocked (401)",
      passed: t1Passed,
      details: `Profile: ${anonProfileRes.status}, Prefs: ${anonPrefRes.status}, Export: ${anonExportRes.status}, Delete: ${anonDeleteRes.status}`,
    });

    // -------------------------------------------------------------
    // TEST 2: Query parameter spoofing blocked for anonymous
    // -------------------------------------------------------------
    console.log("\n[Test 2] Testing unauthenticated spoofing with ?userId=userB...");
    const spoofProfile = await getProfile(new Request(`http://localhost:3000/api/settings/profile?userId=${encodeURIComponent(userB.email)}`, { method: "GET" }));
    const spoofExport = await exportData(new Request(`http://localhost:3000/api/settings/export-data?userId=${encodeURIComponent(userB.email)}`, { method: "GET" }));

    const t2Passed = spoofProfile.status === 401 && spoofExport.status === 401;
    results.push({
      name: "2. Anonymous Query Parameter Spoofing Blocked (401)",
      passed: t2Passed,
      details: `Spoofed Profile: ${spoofProfile.status}, Spoofed Export: ${spoofExport.status}`,
    });

    // -------------------------------------------------------------
    // TEST 3: Cross-user read spoofing blocked (User A session passing ?userId=userB)
    // -------------------------------------------------------------
    console.log("\n[Test 3] Testing cross-user read attempt: User A passing ?userId=userB...");
    const crossProfileRes = await getProfile(new Request(`http://localhost:3000/api/settings/profile?userId=${encodeURIComponent(userB.email)}`, {
      method: "GET",
      headers: { Cookie: `${SESSION_COOKIE_NAME}=${tokenA}` },
    }));
    const crossProfileData = await crossProfileRes.json();

    // User A should NOT see User B's profile ("User B Private Name"), but rather User A's profile / default
    const t3Passed =
      crossProfileRes.status === 200 &&
      crossProfileData.profile?.fullName !== "User B Private Name" &&
      crossProfileData.profile?.email === userA.email;

    results.push({
      name: "3. Cross-User Profile Read Spoofing Blocked",
      passed: t3Passed,
      details: `Returned profile email: '${crossProfileData.profile?.email}' (User B data was NOT exposed)`,
    });

    // -------------------------------------------------------------
    // TEST 4: Cross-user export spoofing blocked (User A session passing ?userId=userB)
    // -------------------------------------------------------------
    console.log("\n[Test 4] Testing cross-user export attempt: User A passing ?userId=userB...");
    const crossExportRes = await exportData(new Request(`http://localhost:3000/api/settings/export-data?userId=${encodeURIComponent(userB.email)}`, {
      method: "GET",
      headers: { Cookie: `${SESSION_COOKIE_NAME}=${tokenA}` },
    }));
    const crossExportData = await crossExportRes.json();

    const t4Passed =
      crossExportRes.status === 200 &&
      crossExportData.user === userA.email &&
      crossExportData.profile?.fullName !== "User B Private Name";

    results.push({
      name: "4. Cross-User Data Export Blocked",
      passed: t4Passed,
      details: `Exported user identity: '${crossExportData.user}', email: '${crossExportData.email}'`,
    });

    // -------------------------------------------------------------
    // TEST 5: Cross-user overwrite attempt blocked (User A session passing body.userId=userB)
    // -------------------------------------------------------------
    console.log("\n[Test 5] Testing cross-user write attempt: User A submitting profile with body.userId=userB...");
    const maliciousSaveRes = await postProfile(new Request("http://localhost:3000/api/settings/profile", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: `${SESSION_COOKIE_NAME}=${tokenA}`,
      },
      body: JSON.stringify({
        userId: userB.email, // Attacker tries to overwrite User B
        profile: {
          fullName: "HACKED NAME",
          bio: "HACKED BIO",
        },
      }),
    }));
    const maliciousSaveData = await maliciousSaveRes.json();

    // Check that User B's actual record in DB was untouched!
    const userBDoc = await profilesCol.findOne({ userId: userB.email });
    const userADoc = await profilesCol.findOne({ userId: userA.email });

    const t5Passed =
      maliciousSaveRes.status === 200 &&
      maliciousSaveData.userId === userA.email &&
      userBDoc?.fullName === "User B Private Name" &&
      userADoc?.fullName === "HACKED NAME";

    results.push({
      name: "5. Cross-User Profile Overwrite Blocked",
      passed: t5Passed,
      details: `User B in DB preserved: '${userBDoc?.fullName}', User A updated: '${userADoc?.fullName}'`,
    });

    // -------------------------------------------------------------
    // TEST 6: User A updating preferences normally
    // -------------------------------------------------------------
    console.log("\n[Test 6] Testing User A preferences update...");
    const prefUpdateRes = await postPreferences(new Request("http://localhost:3000/api/settings/preferences", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: `${SESSION_COOKIE_NAME}=${tokenA}`,
      },
      body: JSON.stringify({
        preferences: {
          theme: "dark",
          compactMode: true,
          defaultDashboard: "/dashboard/portfolio",
        },
      }),
    }));
    const prefUpdateData = await prefUpdateRes.json();

    const t6Passed =
      prefUpdateRes.status === 200 &&
      prefUpdateData.preferences?.theme === "dark" &&
      prefUpdateData.preferences?.compactMode === true;

    results.push({
      name: "6. Authenticated User Preferences Saved Accurately",
      passed: t6Passed,
      details: `Saved theme: '${prefUpdateData.preferences?.theme}', compactMode: ${prefUpdateData.preferences?.compactMode}`,
    });

    // -------------------------------------------------------------
    // TEST 7: Authorization Bearer header support on settings routes
    // -------------------------------------------------------------
    console.log("\n[Test 7] Testing Bearer token header support...");
    const bearerPrefRes = await getPreferences(new Request("http://localhost:3000/api/settings/preferences", {
      method: "GET",
      headers: { Authorization: `Bearer ${tokenA}` },
    }));
    const bearerPrefData = await bearerPrefRes.json();

    const t7Passed =
      bearerPrefRes.status === 200 &&
      bearerPrefData.exists === true &&
      bearerPrefData.preferences?.theme === "dark";

    results.push({
      name: "7. Authorization Bearer Token Authentication",
      passed: t7Passed,
      details: `Status ${bearerPrefRes.status}, retrieved theme: '${bearerPrefData.preferences?.theme}'`,
    });

    // -------------------------------------------------------------
    // TEST 8: Invalid confirmation phrase rejected
    // -------------------------------------------------------------
    console.log("\n[Test 8] Testing invalid delete confirmation phrase...");
    const badConfirmRes = await deleteAccount(new Request("http://localhost:3000/api/settings/delete-account", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: `${SESSION_COOKIE_NAME}=${tokenA}`,
      },
      body: JSON.stringify({
        confirmation: "delete", // lowercase, invalid
      }),
    }));

    const t8Passed = badConfirmRes.status === 400;
    results.push({
      name: "8. Invalid Delete Confirmation Phrase Rejected (400)",
      passed: t8Passed,
      details: `Status: ${badConfirmRes.status} (strictly requires exact 'DELETE')`,
    });

    // -------------------------------------------------------------
    // TEST 9: Cross-user delete account attempt blocked (User A passing body.userId=userB)
    // -------------------------------------------------------------
    console.log("\n[Test 9] Testing cross-user delete attempt: User A passing body.userId=userB...");
    // Seed dummy journey for User B
    await journeysCol.insertOne({
      userId: userB.email,
      problemId: "P000001",
      status: "in_progress",
    });

    const maliciousDeleteRes = await deleteAccount(new Request("http://localhost:3000/api/settings/delete-account", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: `${SESSION_COOKIE_NAME}=${tokenA}`,
      },
      body: JSON.stringify({
        userId: userB.email, // Attacker tries to delete User B's account
        confirmation: "DELETE",
      }),
    }));

    // Verify User B's records are intact!
    const userBProfileAfter = await profilesCol.findOne({ userId: userB.email });
    const userBJourneyAfter = await journeysCol.findOne({ userId: userB.email });

    const t9Passed =
      maliciousDeleteRes.status === 200 &&
      userBProfileAfter !== null &&
      userBJourneyAfter !== null;

    results.push({
      name: "9. Cross-User Account Deletion Blocked",
      passed: t9Passed,
      details: `User B profile exists: ${!!userBProfileAfter}, User B journey exists: ${!!userBJourneyAfter}`,
    });

  } finally {
    console.log("\n[Cleanup] Cleaning test user records...");
    await profilesCol.deleteMany({ userId: { $in: [userA.email, userA.userId, userB.email, userB.userId] } });
    await prefsCol.deleteMany({ userId: { $in: [userA.email, userA.userId, userB.email, userB.userId] } });
    await journeysCol.deleteMany({ userId: { $in: [userA.email, userA.userId, userB.email, userB.userId] } });
  }

  // -------------------------------------------------------------
  // SUMMARY REPORT
  // -------------------------------------------------------------
  console.log("\n==================================================================");
  console.log("SETTINGS API USER ISOLATION RESULTS SUMMARY");
  console.log("==================================================================");
  let allPassed = true;
  for (const r of results) {
    const status = r.passed ? "✅ PASS" : "❌ FAIL";
    if (!r.passed) allPassed = false;
    console.log(`${status} - ${r.name}`);
    console.log(`   ${r.details}`);
  }

  console.log("==================================================================");
  console.log(`OVERALL STATUS: ${allPassed ? "ALL 9 TESTS PASSED" : "TESTS FAILED"}`);
  console.log("==================================================================");

  if (!allPassed) {
    process.exit(1);
  }

  process.exit(0);
}

runSettingsIsolationTests().catch((err) => {
  console.error("Test execution fatal error:", err);
  process.exit(1);
});
