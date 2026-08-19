const dns = require("dns");
try {
  dns.setServers(["8.8.8.8", "8.8.4.4", "1.1.1.1"]);
} catch (e) {}

const path = require("path");
const fs = require("fs");

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
  console.error("❌ ERROR: DATABASE_URL environment variable is missing.");
  process.exit(1);
}

const { MongoClient } = require("mongodb");

async function backupAndReset() {
  console.log("=================== PROBLEM LIBRARY BACKUP & RESET ===================");
  const client = new MongoClient(DATABASE_URL);
  
  try {
    await client.connect();
    const db = client.db();
    console.log(`✅ Connected to Database: "${db.databaseName}"`);

    // 1. Inspect Collections
    const collections = await db.listCollections().toArray();
    const collectionNames = collections.map((c) => c.name);
    console.log(`📋 Existing Collections in DB: [${collectionNames.join(", ")}]`);

    const problemsCollection = db.collection("problems");
    const initialCount = await problemsCollection.countDocuments();
    console.log(`📊 Current Problem Records Count: ${initialCount}`);

    // 2. STEP 1 — BACKUP FIRST
    console.log("\n📦 Step 1: Creating backup of 'problems' collection...");
    const backupDir = path.join(__dirname, "../data");
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }

    const allProblems = await problemsCollection.find({}).toArray();
    const backupFilePath = path.join(backupDir, "backup_problems.json");
    fs.writeFileSync(backupFilePath, JSON.stringify(allProblems, null, 2), "utf8");

    // Verify Backup File
    if (!fs.existsSync(backupFilePath)) {
      throw new Error("❌ Backup verification failed: File was not written!");
    }
    const backupStat = fs.statSync(backupFilePath);
    const backupData = JSON.parse(fs.readFileSync(backupFilePath, "utf8"));
    if (backupData.length !== initialCount) {
      throw new Error(`❌ Backup verification failed: Expected ${initialCount} records, but backed up ${backupData.length}`);
    }
    console.log(`✅ BACKUP VERIFIED: Saved ${backupData.length} documents to '${backupFilePath}' (${(backupStat.size / (1024 * 1024)).toFixed(2)} MB)`);

    // 3. STEP 2 — INSPECT USER PROGRESS & UNRELATED COLLECTIONS
    console.log("\n🔍 Step 2: Inspecting User Progress & Unrelated Collections...");
    const completionsCollection = db.collection("problem_completions");
    const completionCount = await completionsCollection.countDocuments();
    console.log(`🛡️  User Progress Records ('problem_completions'): ${completionCount} documents preserved.`);

    // 4. STEP 3 — DELETE ONLY PROBLEMS COLLECTION RECORDS
    console.log("\n🗑️  Step 3: Executing deleteMany({}) on 'problems' collection ONLY...");
    const deleteResult = await problemsCollection.deleteMany({});
    console.log(`✅ Deleted ${deleteResult.deletedCount} documents from 'problems' collection.`);

    // 5. STEP 4 — PRESERVE / RECREATE INDEXES
    console.log("\n⚙️  Step 4: Ensuring indexes on 'problems' collection...");
    await problemsCollection.createIndex({ problemId: 1 }, { unique: true, name: "idx_unique_problemId" });
    await problemsCollection.createIndex({ "source.name": 1 }, { name: "idx_source_name" });
    await problemsCollection.createIndex({ "source.type": 1 }, { name: "idx_source_type" });
    await problemsCollection.createIndex({ category: 1 }, { name: "idx_category" });
    await problemsCollection.createIndex({ "learning.level": 1 }, { name: "idx_learning_level" });
    await problemsCollection.createIndex({ status: 1 }, { name: "idx_status" });

    const updatedIndexes = await problemsCollection.indexes();
    console.log("✅ Preserved / Created Indexes on 'problems':");
    updatedIndexes.forEach((idx) => console.log(`   - ${idx.name}: ${JSON.stringify(idx.key)}`));

    // 6. STEP 5 — FINAL VERIFICATION OF RESET
    console.log("\n🏁 Step 5: Final Reset Verification...");
    const finalProblemCount = await problemsCollection.countDocuments();
    const finalCompletionCount = await completionsCollection.countDocuments();
    const finalCollections = await db.listCollections().toArray();

    console.log(`   - Problems Collection Document Count: ${finalProblemCount}`);
    console.log(`   - User Progress ('problem_completions') Count: ${finalCompletionCount}`);
    console.log(`   - All Collections Still Present: [${finalCollections.map((c) => c.name).join(", ")}]`);

    if (finalProblemCount !== 0) {
      throw new Error("❌ Reset failed: Problems collection still contains documents!");
    }

    console.log("\n🎉 RESET SUCCESSFUL! The Problem Library has been safely emptied and indexes preserved.");
  } catch (err) {
    console.error("❌ ERROR during backup/reset operation:", err);
    process.exit(1);
  } finally {
    await client.close();
  }
}

backupAndReset();
