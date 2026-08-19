/**
 * MakeMistakes BuildOS — Problem Statements Administrative Import Script
 * 
 * Pipeline:
 * Uploaded Source PDF -> Extract -> Normalize -> Validate -> Deduplicate -> data/problems.json -> MongoDB
 * 
 * Target Collection: `problems`
 */

const dns = require("dns");
try {
  dns.setServers(["8.8.8.8", "8.8.4.4", "1.1.1.1"]);
} catch (e) {
  // Ignore if custom dns servers cannot be set
}

const { MongoClient } = require("mongodb");
const fs = require("fs");
const path = require("path");

// Load .env file
const envPath = path.join(__dirname, "../.env");
if (fs.existsSync(envPath)) {
  const envConfig = fs.readFileSync(envPath, "utf8");
  envConfig.split("\n").forEach((line) => {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*["']?(.*?)["']?\s*$/);
    if (match && !process.env[match[1]]) {
      process.env[match[1]] = match[2];
    }
  });
}

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error("❌ ERROR: DATABASE_URL is not set in .env file.");
  process.exit(1);
}

async function runImport() {
  console.log("==================================================");
  console.log("   MakeMistakes Problem Statement Import Pipeline  ");
  console.log("==================================================\n");

  const jsonPath = path.join(__dirname, "../data/problems.json");
  if (!fs.existsSync(jsonPath)) {
    console.error(`❌ ERROR: Intermediate dataset not found at ${jsonPath}`);
    process.exit(1);
  }

  const rawData = fs.readFileSync(jsonPath, "utf8");
  const dataset = JSON.parse(rawData);

  console.log(`📦 Loaded intermediate dataset: ${dataset.length} records from data/problems.json\n`);

  // Step 1: Validation & Deduplication Pass
  const validRecords = [];
  const invalidRecords = [];
  const duplicateRecords = [];
  const seenIds = new Set();
  const seenStatements = new Set();

  for (const record of dataset) {
    const { problemId, problemStatement, source, metadata } = record;
    let isValid = true;
    let errorMsg = "";

    // Required fields check
    if (!problemId || typeof problemId !== "string" || !problemId.startsWith("P")) {
      isValid = false;
      errorMsg += "Invalid or missing problemId. ";
    }

    if (!problemStatement || typeof problemStatement !== "string" || problemStatement.trim() === "") {
      isValid = false;
      errorMsg += "Empty or missing problemStatement. ";
    }

    if (!source || !source.name || !["Fix My Itch by Razorpay", "Loot Drop"].includes(source.name)) {
      isValid = false;
      errorMsg += "Invalid or missing source.name. ";
    }

    if (!source || !source.type || !["open_problem", "failed_startup"].includes(source.type)) {
      isValid = false;
      errorMsg += "Invalid or missing source.type. ";
    }

    // Numerical validations if present
    if (metadata.itchScore !== null && typeof metadata.itchScore !== "number") {
      isValid = false;
      errorMsg += "itchScore must be numeric or null. ";
    }

    if (metadata.funding !== null && typeof metadata.funding !== "number") {
      isValid = false;
      errorMsg += "funding must be numeric or null. ";
    }

    if (metadata.years) {
      if (metadata.years.start !== null && typeof metadata.years.start !== "number") {
        isValid = false;
        errorMsg += "years.start must be numeric or null. ";
      }
      if (metadata.years.end !== null && typeof metadata.years.end !== "number") {
        isValid = false;
        errorMsg += "years.end must be numeric or null. ";
      }
    }

    if (!isValid) {
      invalidRecords.push({ problemId, error: errorMsg });
      continue;
    }

    // Check duplicate ID
    if (seenIds.has(problemId)) {
      duplicateRecords.push({ problemId, reason: "Duplicate problemId" });
      continue;
    }
    seenIds.add(problemId);

    // Check duplicate Statement
    const normStmt = problemStatement.replace(/\s+/g, " ").trim().toLowerCase();
    if (seenStatements.has(normStmt)) {
      duplicateRecords.push({ problemId, title: record.title, reason: "Duplicate normalized problem statement" });
    }
    seenStatements.add(normStmt);

    // Format dates to BSON Date
    const formattedDoc = {
      ...record,
      createdAt: new Date(record.createdAt),
      updatedAt: new Date(record.updatedAt)
    };

    validRecords.push(formattedDoc);
  }

  console.log("📊 VALIDATION & DEDUPLICATION SUMMARY:");
  console.log(`   - Total records found:   ${dataset.length}`);
  console.log(`   - Valid records:         ${validRecords.length}`);
  console.log(`   - Invalid records:       ${invalidRecords.length}`);
  console.log(`   - Duplicates detected:   ${duplicateRecords.length}\n`);

  if (invalidRecords.length > 0) {
    console.warn("⚠️ Invalid Records Report:", invalidRecords);
  }

  // Step 2: Connect to MongoDB
  console.log("🔌 Connecting to MongoDB Atlas...");
  const client = new MongoClient(DATABASE_URL);

  try {
    await client.connect();
    console.log("✅ Connected to MongoDB Atlas successfully.\n");

    const db = client.db();
    const collection = db.collection("problems");

    // Step 3: Create Indexes
    console.log("⚡ Creating database indexes on 'problems' collection...");
    
    // Unique index on problemId
    await collection.createIndex({ problemId: 1 }, { unique: true, name: "idx_unique_problemId" });
    
    // Secondary query indexes
    await collection.createIndex({ "source.name": 1 }, { name: "idx_source_name" });
    await collection.createIndex({ "source.type": 1 }, { name: "idx_source_type" });
    await collection.createIndex({ category: 1 }, { name: "idx_category" });
    await collection.createIndex({ "metadata.sector": 1 }, { name: "idx_metadata_sector" });
    await collection.createIndex({ "learning.level": 1 }, { name: "idx_learning_level" });
    await collection.createIndex({ status: 1 }, { name: "idx_status" });

    // Text search index
    try {
      await collection.createIndex(
        { title: "text", problemStatement: "text" },
        { name: "idx_text_search", weights: { title: 10, problemStatement: 5 } }
      );
      console.log("   ✓ Text index created on title & problemStatement.");
    } catch (err) {
      console.warn("   ⚠️ Text index creation notice:", err.message);
    }

    console.log("✅ All required indexes created.\n");

    // Step 4: Perform Idempotent Bulk Upsert
    console.log("🚀 Importing records via bulkWrite() with upsert...");

    const batchSize = 500;
    let totalUpserted = 0;

    for (let b = 0; b < validRecords.length; b += batchSize) {
      const batch = validRecords.slice(b, b + batchSize);
      const operations = batch.map((doc) => ({
        updateOne: {
          filter: { problemId: doc.problemId },
          update: { $set: doc },
          upsert: true
        }
      }));

      const result = await collection.bulkWrite(operations, { ordered: false });
      totalUpserted += (result.upsertedCount + result.modifiedCount + result.matchedCount);
    }

    console.log(`✅ Bulk import completed. Processed ${validRecords.length} records.\n`);

    // Step 5: Post-Import Database Verification
    console.log("==================================================");
    console.log("            DATABASE VERIFICATION REPORT          ");
    console.log("==================================================");

    const totalCount = await collection.countDocuments();
    const fixMyItchCount = await collection.countDocuments({ "source.name": "Fix My Itch by Razorpay" });
    const lootDropCount = await collection.countDocuments({ "source.name": "Loot Drop" });
    const unclassifiedCount = await collection.countDocuments({ status: "unclassified" });
    const emptyStatements = await collection.countDocuments({
      $or: [{ problemStatement: null }, { problemStatement: "" }]
    });

    console.log(`   ✓ Total records in MongoDB 'problems': ${totalCount}`);
    console.log(`   ✓ Fix My Itch by Razorpay records:    ${fixMyItchCount}`);
    console.log(`   ✓ Loot Drop records:                  ${lootDropCount}`);
    console.log(`   ✓ Unclassified records:               ${unclassifiedCount}`);
    console.log(`   ✓ Duplicates in dataset:               ${duplicateRecords.length}`);
    console.log(`   ✓ Invalid records:                    ${invalidRecords.length}`);
    console.log(`   ✓ Empty problem statements:           ${emptyStatements}\n`);

    // Fetch 3 Sample Documents
    console.log("==================================================");
    console.log("             SAMPLE MONGODB DOCUMENTS             ");
    console.log("==================================================");

    const sampleFixMyItch = await collection.findOne({ "source.name": "Fix My Itch by Razorpay" });
    const sampleLootDrop1 = await collection.findOne({ "source.name": "Loot Drop" });
    const sampleLootDrop2 = await collection.findOne(
      { "source.name": "Loot Drop" },
      { skip: 10 }
    );

    console.log("\n📄 Sample 1 (Fix My Itch by Razorpay):");
    console.log(JSON.stringify(sampleFixMyItch, null, 2));

    console.log("\n📄 Sample 2 (Loot Drop #1):");
    console.log(JSON.stringify(sampleLootDrop1, null, 2));

    console.log("\n📄 Sample 3 (Loot Drop #2):");
    console.log(JSON.stringify(sampleLootDrop2, null, 2));

  } catch (err) {
    console.error("❌ ERROR during import:", err);
  } finally {
    await client.close();
    console.log("\n👋 Disconnected from MongoDB Atlas.");
  }
}

runImport();
