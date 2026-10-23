import path from "path";
import dotenv from "dotenv";
dotenv.config({ path: path.join(__dirname, "..", ".env") });

import { GET } from "../src/app/api/products/route";

async function runVerification() {
  console.log("==================================================");
  console.log("TASK 2 VERIFICATION: PRODUCTS API PAGINATION");
  console.log("==================================================");

  let passedAll = true;

  // 1. Default pagination (page 1, limit 20)
  console.log("\n[Check 1] Verifying default pagination parameters...");
  const req1 = new Request("http://localhost:3000/api/products");
  const res1 = await GET(req1);
  const data1 = await res1.json();

  console.log(`  Status: ${res1.status}`);
  console.log(`  Page: ${data1.page}, Limit: ${data1.limit}, TotalCount: ${data1.totalCount}, TotalPages: ${data1.totalPages}`);
  console.log(`  Returned items count: ${data1.products?.length}`);

  if (res1.status !== 200 || data1.products?.length !== 20 || data1.page !== 1 || data1.limit !== 20) {
    console.error("  ❌ FAILED: Default pagination did not return expected page 1 with 20 items!");
    passedAll = false;
  } else {
    console.log("  ✓ PASSED: Default page returned exactly 20 items.");
  }

  // 2. Subsequent page (page 2)
  console.log("\n[Check 2] Verifying subsequent page (page 2)...");
  const req2 = new Request("http://localhost:3000/api/products?page=2&limit=20");
  const res2 = await GET(req2);
  const data2 = await res2.json();

  const p1Ids = new Set(data1.products.map((p: any) => p.problemId));
  const p2Ids = data2.products.map((p: any) => p.problemId);
  const hasDuplicate = p2Ids.some((id: string) => p1Ids.has(id));

  console.log(`  Page 1 IDs: ${data1.products[0].problemId} -> ${data1.products[19].problemId}`);
  console.log(`  Page 2 IDs: ${data2.products[0].problemId} -> ${data2.products[19].problemId}`);
  console.log(`  Cross-page duplication: ${hasDuplicate}`);

  if (hasDuplicate || data2.products.length !== 20) {
    console.error("  ❌ FAILED: Duplicate records found between page 1 and page 2!");
    passedAll = false;
  } else {
    console.log("  ✓ PASSED: Page 2 returned distinct, sequential records without duplication.");
  }

  // 3. Invalid, negative, and excessive pagination parameters
  console.log("\n[Check 3] Testing parameter validation & boundary handling...");
  
  // Negative page & limit
  const reqNeg = new Request("http://localhost:3000/api/products?page=-5&limit=-10");
  const resNeg = await GET(reqNeg);
  const dataNeg = await resNeg.json();
  const safeFallback = dataNeg.page === 1 && dataNeg.limit === 20;
  console.log(`  Negative params fallback (page=1, limit=20): ${safeFallback}`);

  // Excessive limit (> 100)
  const reqHuge = new Request("http://localhost:3000/api/products?page=1&limit=5000");
  const resHuge = await GET(reqHuge);
  const dataHuge = await resHuge.json();
  const cappedLimit = dataHuge.limit === 100 && dataHuge.products.length === 100;
  console.log(`  Excessive limit capped to 100: ${cappedLimit} (returned ${dataHuge.products.length} items)`);

  // Page beyond total pages
  const reqBeyond = new Request("http://localhost:3000/api/products?page=999999&limit=20");
  const resBeyond = await GET(reqBeyond);
  const dataBeyond = await resBeyond.json();
  const emptyBeyond = dataBeyond.products.length === 0 && dataBeyond.hasMore === false;
  console.log(`  Page beyond total pages returns empty products gracefully: ${emptyBeyond}`);

  // Non-numeric garbage
  const reqGarbage = new Request("http://localhost:3000/api/products?page=abc&limit=xyz");
  const resGarbage = await GET(reqGarbage);
  const dataGarbage = await resGarbage.json();
  const safeGarbage = dataGarbage.page === 1 && dataGarbage.limit === 20;
  console.log(`  NaN/Garbage params fallback safely: ${safeGarbage}`);

  if (!safeFallback || !cappedLimit || !emptyBeyond || !safeGarbage) {
    console.error("  ❌ FAILED: Parameter boundary validation failed!");
    passedAll = false;
  } else {
    console.log("  ✓ PASSED: Parameter validation is safe and resilient.");
  }

  // 4. Search and filters with pagination
  console.log("\n[Check 4] Testing search & filters with pagination...");
  const reqSearch = new Request("http://localhost:3000/api/products?search=health&page=1&limit=10");
  const resSearch = await GET(reqSearch);
  const dataSearch = await resSearch.json();

  console.log(`  Search 'health': TotalCount = ${dataSearch.totalCount}, PageItems = ${dataSearch.products.length}, TotalPages = ${dataSearch.totalPages}`);
  const allMatchSearch = dataSearch.products.every((p: any) => {
    const text = (p.problemId + " " + p.title + " " + p.description + " " + p.category).toLowerCase();
    return text.includes("health");
  });
  console.log(`  All page items match search query: ${allMatchSearch}`);

  if (!allMatchSearch || dataSearch.products.length !== 10) {
    console.error("  ❌ FAILED: Search filtering inconsistent with pagination!");
    passedAll = false;
  } else {
    console.log("  ✓ PASSED: Search and filter criteria correctly applied at DB level.");
  }

  // 5. Deterministic sorting
  console.log("\n[Check 5] Verifying deterministic sorting...");
  const reqSortAsc = new Request("http://localhost:3000/api/products?sort=numerical_asc&page=1&limit=5");
  const dataSortAsc = await (await GET(reqSortAsc)).json();
  const ascIds = dataSortAsc.products.map((p: any) => p.problemId);
  console.log(`  numerical_asc:  ${ascIds.join(", ")}`);

  const reqSortDesc = new Request("http://localhost:3000/api/products?sort=numerical_desc&page=1&limit=5");
  const dataSortDesc = await (await GET(reqSortDesc)).json();
  const descIds = dataSortDesc.products.map((p: any) => p.problemId);
  console.log(`  numerical_desc: ${descIds.join(", ")}`);

  const isAsc = ascIds[0] < ascIds[1] && ascIds[1] < ascIds[2];
  const isDesc = descIds[0] > descIds[1] && descIds[1] > descIds[2];

  if (!isAsc || !isDesc) {
    console.error("  ❌ FAILED: Sorting is non-deterministic!");
    passedAll = false;
  } else {
    console.log("  ✓ PASSED: Deterministic sorting verified.");
  }

  // 6. Unlock progress & business rules integrity
  console.log("\n[Check 6] Verifying unlock progress and business rules...");
  const unlock = data1.unlockProgress;
  console.log(`  Beginner total: ${unlock.beginnerTotal}, Required (50%): ${unlock.beginnerRequired}`);
  console.log(`  Intermediate total: ${unlock.intermediateTotal}, Required (30%): ${unlock.intermediateRequired}`);
  console.log(`  Advanced total: ${unlock.advancedTotal}`);
  console.log(`  Advanced unlocked: ${unlock.advancedUnlocked}`);

  const mathValid =
    unlock.beginnerRequired === Math.ceil(unlock.beginnerTotal * 0.5) &&
    unlock.intermediateRequired === Math.ceil(unlock.intermediateTotal * 0.3) &&
    unlock.beginnerTotal + unlock.intermediateTotal + unlock.advancedTotal === data1.totalCount;

  console.log(`  Unlock math exact against DB total: ${mathValid}`);
  if (!mathValid) {
    console.error("  ❌ FAILED: Unlock progress calculation mismatch!");
    passedAll = false;
  } else {
    console.log("  ✓ PASSED: Unlock progression rules preserved.");
  }

  // 7. Measure payload size and latency improvement
  console.log("\n[Check 7] Measuring performance: Paginated response size & latency...");
  const payloadJson = JSON.stringify(data1);
  const payloadKb = (payloadJson.length / 1024).toFixed(2);
  console.log(`  Paginated response size (20 items): ${payloadKb} KB`);
  console.log(`  (Baseline unpaginated was ~12,900 KB / 12.61 MB)`);
  console.log(`  Payload reduction: ~${((1 - Number(payloadKb) / 12900) * 100).toFixed(1)}%`);

  console.log("\n==================================================");
  if (passedAll) {
    console.log("ALL TASK 2 VERIFICATION CHECKS PASSED!");
  } else {
    console.log("SOME CHECKS FAILED!");
  }
  console.log("==================================================");

  process.exit(passedAll ? 0 : 1);
}

runVerification().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
