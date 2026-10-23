const path = require('path');
const dns = require('dns');

// Fallback to Google and Cloudflare DNS to avoid Windows ISP SRV query blocks
try {
  dns.setServers(['8.8.8.8', '1.1.1.1', '8.8.4.4']);
} catch (e) {
  // Use default
}

require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const { MongoClient } = require('mongodb');

async function runDiagnostics() {
  const dbUrl = process.env.DATABASE_URL;
  console.log('==================================================');
  console.log('MONGODB ATLAS HEALTH & STATUS DIAGNOSTIC');
  console.log('==================================================');
  console.log('URI:', dbUrl ? dbUrl.replace(/:([^:@]+)@/, ':****@') : 'UNDEFINED');

  if (!dbUrl) {
    console.error('ERROR: DATABASE_URL is not defined in .env!');
    process.exit(1);
  }

  const client = new MongoClient(dbUrl, {
    serverSelectionTimeoutMS: 8000,
    connectTimeoutMS: 8000,
  });

  const startTime = Date.now();

  try {
    console.log('\n[1/5] Testing Connectivity & Sleep Status...');
    const connStart = Date.now();
    await client.connect();
    const connDuration = Date.now() - connStart;
    console.log(`✓ Connected in ${connDuration}ms — Cluster is AWAKE and RESPONSIVE (Not sleeping)`);

    console.log('\n[2/5] Server Ping & Latency...');
    const pingStart = Date.now();
    const pingResult = await client.db('admin').command({ ping: 1 });
    const pingDuration = Date.now() - pingStart;
    console.log(`✓ Ping ok (${pingDuration}ms roundtrip):`, pingResult);

    console.log('\n[3/5] Inspecting "makemistakes" Database & Collections...');
    const db = client.db('makemistakes');
    const collections = await db.listCollections().toArray();
    console.log(`✓ Found ${collections.length} collections:`);

    const collectionStats = [];
    for (const col of collections) {
      const count = await db.collection(col.name).countDocuments();
      collectionStats.push({ Collection: col.name, Documents: count });
    }
    console.table(collectionStats);

    console.log('\n[4/5] Testing Read Operations...');
    const sampleJourney = await db.collection('user_journeys').findOne();
    console.log(`✓ Read test from 'user_journeys':`, sampleJourney ? `Found (ID: ${sampleJourney._id})` : 'Collection empty');

    const sampleProblem = await db.collection('ProblemStatement').findOne();
    console.log(`✓ Read test from 'ProblemStatement':`, sampleProblem ? `Found (ID: ${sampleProblem._id})` : 'Collection empty');

    console.log('\n[5/5] Testing Write & Clean-up (Permissions Check)...');
    const testCol = db.collection('__health_probe');
    const insertRes = await testCol.insertOne({ probe: true, time: new Date() });
    console.log(`✓ Insert test passed (ID: ${insertRes.insertedId})`);

    const deleteRes = await testCol.deleteOne({ _id: insertRes.insertedId });
    console.log(`✓ Delete test passed (${deleteRes.deletedCount} removed)`);

    console.log('\n==================================================');
    console.log(`SUMMARY: DATABASE IS FULLY FUNCTIONAL & OPERATIONAL!`);
    console.log(`Status: AWAKE | Read: OK | Write: OK | Total: ${Date.now() - startTime}ms`);
    console.log('==================================================');
  } catch (err) {
    console.error('\n❌ DIAGNOSTIC FAILED:', err.message);
  } finally {
    await client.close();
  }
}

runDiagnostics();
