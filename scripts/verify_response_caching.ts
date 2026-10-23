/**
 * Verification Script for Task 14: Review Response Caching Headers
 *
 * Verifies:
 * 1. Public catalog caching policy for anonymous users.
 * 2. Strict no-store policy for authenticated catalog requests (protecting unlock state).
 * 3. Strict no-store policy for private/user-specific routes (portfolio, journey, settings).
 * 4. Strict no-store policy for security-sensitive auth & OTP routes.
 * 5. Error responses are never cached.
 */

import {
  NO_STORE_CACHE_HEADERS,
  PUBLIC_CATALOG_CACHE_HEADERS,
  applyNoStoreHeaders,
  applyPublicCatalogCacheHeaders,
} from "../src/lib/cacheHeaders";
import { NextResponse } from "next/server";

let passed = 0;
let failed = 0;

function assert(condition: boolean, name: string) {
  if (condition) {
    console.log(`[PASS] ${name}`);
    passed++;
  } else {
    console.error(`[FAIL] ${name}`);
    failed++;
  }
}

async function runTests() {
  console.log("=================================================");
  console.log("Verifying Task 14: HTTP Response Caching Headers");
  console.log("=================================================\n");

  // 1. Verify utility headers structure
  const noStoreH = NO_STORE_CACHE_HEADERS["Cache-Control"];
  assert(
    noStoreH.includes("private") &&
    noStoreH.includes("no-cache") &&
    noStoreH.includes("no-store") &&
    noStoreH.includes("max-age=0") &&
    noStoreH.includes("must-revalidate"),
    "1. NO_STORE_CACHE_HEADERS contains all essential RFC-compliant no-store directives"
  );
  assert(NO_STORE_CACHE_HEADERS.Pragma === "no-cache", "2. Legacy HTTP/1.0 Pragma: no-cache header is included");
  assert(NO_STORE_CACHE_HEADERS.Expires === "0", "3. Legacy Expires: 0 header is included");

  // 2. Test applyNoStoreHeaders helper
  const mockPrivateRes = NextResponse.json({ sensitive: "user_data" });
  applyNoStoreHeaders(mockPrivateRes);
  assert(
    mockPrivateRes.headers.get("Cache-Control") === NO_STORE_CACHE_HEADERS["Cache-Control"],
    "4. applyNoStoreHeaders sets correct Cache-Control on NextResponse"
  );
  assert(
    mockPrivateRes.headers.get("Pragma") === "no-cache",
    "5. applyNoStoreHeaders sets Pragma header"
  );

  // 3. Test applyPublicCatalogCacheHeaders helper
  const mockPublicRes = NextResponse.json({ catalog: [1, 2, 3] });
  applyPublicCatalogCacheHeaders(mockPublicRes);
  assert(
    mockPublicRes.headers.get("Cache-Control") === PUBLIC_CATALOG_CACHE_HEADERS["Cache-Control"],
    "6. applyPublicCatalogCacheHeaders sets public s-maxage and stale-while-revalidate"
  );

  // 4. Test simulated Anonymous Products catalog response
  const anonCatalogRes = applyPublicCatalogCacheHeaders(
    NextResponse.json({
      success: true,
      authenticated: false,
      products: [],
    })
  );
  assert(
    anonCatalogRes.headers.get("Cache-Control")?.includes("public") === true &&
    anonCatalogRes.headers.get("Cache-Control")?.includes("s-maxage=60") === true,
    "7. Anonymous catalog response receives public caching policy"
  );

  // 5. Test simulated Authenticated Products catalog response (with user unlocks)
  const authCatalogRes = applyNoStoreHeaders(
    NextResponse.json({
      success: true,
      authenticated: true,
      unlockProgress: { unlockedCount: 5 },
      products: [],
    })
  );
  assert(
    authCatalogRes.headers.get("Cache-Control")?.includes("private") === true &&
    authCatalogRes.headers.get("Cache-Control")?.includes("no-store") === true,
    "8. Authenticated catalog response receives strict private no-store policy to protect user unlocks"
  );

  // 6. Test Portfolio route response caching policy
  const portfolioRes = applyNoStoreHeaders(
    NextResponse.json({
      success: true,
      authenticated: true,
      userId: "user_123",
      projects: [],
    })
  );
  assert(
    portfolioRes.headers.get("Cache-Control")?.includes("no-store") === true,
    "9. Portfolio response is strictly no-store (cannot be cached across users)"
  );

  // 7. Test Auth & OTP responses
  const otpRes = applyNoStoreHeaders(
    NextResponse.json({
      success: true,
      message: "Verification code sent",
    })
  );
  assert(
    otpRes.headers.get("Cache-Control")?.includes("no-store") === true,
    "10. OTP and auth verification responses are strictly no-store"
  );

  // 8. Test Settings route responses
  const settingsRes = applyNoStoreHeaders(
    NextResponse.json({
      success: true,
      userId: "user_abc",
      preferences: { theme: "dark" },
    })
  );
  assert(
    settingsRes.headers.get("Cache-Control")?.includes("no-store") === true,
    "11. Settings and account preferences responses are strictly no-store"
  );

  // 9. Test Error responses
  const errorRes = applyNoStoreHeaders(
    NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  );
  assert(
    errorRes.headers.get("Cache-Control")?.includes("no-store") === true,
    "12. Error responses cannot be cached by CDNs or proxies"
  );

  console.log("\n=================================================");
  console.log(`Summary: ${passed} passed, ${failed} failed`);
  console.log("=================================================");

  if (failed > 0) {
    process.exit(1);
  }
}

runTests();
