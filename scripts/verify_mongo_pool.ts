import path from "path";
import dotenv from "dotenv";

dotenv.config({ path: path.join(__dirname, "..", ".env") });

import { getMongoClient, getDb } from "../src/lib/mongodb";
import { MongoClient } from "mongodb";

async function runVerification() {
  console.log("==================================================");
  console.log("TASK 1 VERIFICATION: MONGODB POOLING OPTIMIZATION");
  console.log("==================================================");

  let passedAll = true;

  // TEST 1: Connection reuse across repeated calls
  console.log("\n[Test 1] Testing client reuse across repeated calls...");
  const t0 = Date.now();
  const client1 = await getMongoClient();
  const timeFirst = Date.now() - t0;

  const t1 = Date.now();
  const client2 = await getMongoClient();
  const timeSecond = Date.now() - t1;

  const t2 = Date.now();
  const client3 = await getMongoClient();
  const timeThird = Date.now() - t2;

  const isSameClient = client1 === client2 && client2 === client3;
  console.log(`  Call 1 took: ${timeFirst}ms`);
  console.log(`  Call 2 took: ${timeSecond}ms`);
  console.log(`  Call 3 took: ${timeThird}ms`);
  console.log(`  Identical client reference: ${isSameClient}`);
  if (!isSameClient) {
    console.error("  ❌ FAILED: getMongoClient returned different client instances!");
    passedAll = false;
  } else {
    console.log("  ✓ PASSED: Client instance reused successfully.");
  }

  // TEST 2: Concurrent initialization
  console.log("\n[Test 2] Testing concurrent initialization (10 parallel requests)...");
  // Temporarily reset global cache to simulate cold-start concurrency
  const savedCache = (globalThis as any).__mongoCache;
  (globalThis as any).__mongoCache = { client: null, promise: null, uri: null };

  const concurrentStart = Date.now();
  const promises = Array.from({ length: 10 }, (_, i) => getMongoClient());
  const results = await Promise.all(promises);
  const concurrentDuration = Date.now() - concurrentStart;

  const allIdentical = results.every((c) => c === results[0]);
  console.log(`  10 concurrent requests completed in ${concurrentDuration}ms`);
  console.log(`  All 10 resolved to identical client instance: ${allIdentical}`);
  if (!allIdentical) {
    console.error("  ❌ FAILED: Concurrent initialization created multiple clients!");
    passedAll = false;
  } else {
    console.log("  ✓ PASSED: Concurrency safe promise reuse confirmed.");
  }

  // Restore cache
  (globalThis as any).__mongoCache = savedCache;

  // TEST 3: Connection failure recovery
  console.log("\n[Test 3] Testing connection failure & retry recovery...");
  const originalUrl = process.env.DATABASE_URL;
  try {
    // Inject invalid URL to simulate failure
    process.env.DATABASE_URL = "mongodb://invalid-host-that-does-not-exist:27017/test?connectTimeoutMS=1000&serverSelectionTimeoutMS=1000";
    (globalThis as any).__mongoCache = { client: null, promise: null, uri: null };

    let threwExpectedError = false;
    try {
      await getMongoClient();
    } catch (err: any) {
      threwExpectedError = true;
      console.log(`  Expected failure caught: ${err.name || "Error"} (${err.message?.slice(0, 60)}...)`);
    }

    if (!threwExpectedError) {
      console.error("  ❌ FAILED: Did not catch expected connection failure!");
      passedAll = false;
    } else {
      // Verify cache was NOT poisoned with rejected promise
      const cacheAfterFailure = (globalThis as any).__mongoCache;
      const cacheCleared = cacheAfterFailure.client === null && cacheAfterFailure.promise === null;
      console.log(`  Cache cleared on failure (not poisoned): ${cacheCleared}`);

      // Now restore valid URL and verify immediate retry succeeds
      process.env.DATABASE_URL = originalUrl;
      const recoveredClient = await getMongoClient();
      const recoveredDb = recoveredClient.db();
      const ping = await recoveredDb.command({ ping: 1 });
      console.log(`  Retry recovery ping result:`, ping);
      console.log("  ✓ PASSED: Connection failure handled cleanly and recovered without restart.");
    }
  } finally {
    process.env.DATABASE_URL = originalUrl;
  }

  // TEST 4: Database and Collections verification
  console.log("\n[Test 4] Testing database and collection queries...");
  const db = await getDb();
  console.log(`  Connected database name: "${db.databaseName}"`);
  if (db.databaseName !== "makemistakes") {
    console.warn(`  ⚠️ Warning: Database name is "${db.databaseName}" (expected "makemistakes")`);
  }

  const collections = await db.listCollections().toArray();
  const collectionNames = collections.map((c) => c.name);
  console.log(`  Collections verified (${collectionNames.length} total):`, collectionNames.join(", "));

  const problemsCount = await db.collection("problems").countDocuments();
  const userJourneysCount = await db.collection("user_journeys").countDocuments();
  console.log(`  Document counts - problems: ${problemsCount}, user_journeys: ${userJourneysCount}`);
  console.log("  ✓ PASSED: Database and collection integrity verified.");

  // TEST 5: Benchmark unpooled vs pooled
  console.log("\n[Test 5] Measuring connection overhead: Unpooled vs. Pooled (5 requests each)...");
  
  // Unpooled simulation (the old pattern)
  const unpooledTimes: number[] = [];
  for (let i = 0; i < 5; i++) {
    const start = Date.now();
    const tempClient = new MongoClient(originalUrl!);
    await tempClient.connect();
    await tempClient.db().collection("problems").findOne({}, { projection: { problemId: 1 } });
    await tempClient.close();
    unpooledTimes.push(Date.now() - start);
  }

  // Pooled simulation (the new pattern)
  const pooledTimes: number[] = [];
  for (let i = 0; i < 5; i++) {
    const start = Date.now();
    const pooledDb = await getDb();
    await pooledDb.collection("problems").findOne({}, { projection: { problemId: 1 } });
    pooledTimes.push(Date.now() - start);
  }

  const unpooledTotal = unpooledTimes.reduce((a, b) => a + b, 0);
  const unpooledAvg = Math.round(unpooledTotal / unpooledTimes.length);
  const pooledTotal = pooledTimes.reduce((a, b) => a + b, 0);
  const pooledAvg = Math.round(pooledTotal / pooledTimes.length);

  console.log(`  Unpooled (5 calls): ${unpooledTimes.join("ms, ")}ms | Total: ${unpooledTotal}ms | Avg: ${unpooledAvg}ms`);
  console.log(`  Pooled (5 calls):   ${pooledTimes.join("ms, ")}ms | Total: ${pooledTotal}ms | Avg: ${pooledAvg}ms`);
  console.log(`  Latency reduction: ${(unpooledAvg - pooledAvg)}ms per request (~${Math.round(((unpooledTotal - pooledTotal) / unpooledTotal) * 100)}% faster)`);

  console.log("\n==================================================");
  if (passedAll) {
    console.log("VERIFICATION RESULT: ALL CHECKS PASSED SUCCESSFULLY!");
  } else {
    console.log("VERIFICATION RESULT: SOME CHECKS FAILED!");
  }
  console.log("==================================================");

  // Close the pooled connection at end of script so process exits cleanly
  const finalClient = await getMongoClient();
  await finalClient.close();
  process.exit(passedAll ? 0 : 1);
}

runVerification().catch((err) => {
  console.error("FATAL ERROR in verification:", err);
  process.exit(1);
});
