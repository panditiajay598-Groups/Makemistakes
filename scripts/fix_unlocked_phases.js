const dns = require('dns');
try { dns.setServers(['8.8.8.8', '8.8.4.4']); } catch(e) {}
const fs = require('fs');
const env = fs.readFileSync('.env', 'utf8');
let dbUrl = '';
env.split('\n').forEach(l => {
  if (l.startsWith('DATABASE_URL=')) dbUrl = l.slice(13).trim().replace(/^['"]|['"]$/g, '');
});
const { MongoClient } = require('mongodb');

async function fix() {
  const client = new MongoClient(dbUrl);
  await client.connect();
  const db = client.db();
  const collection = db.collection('user_journeys');

  const all = await collection.find({}).toArray();
  console.log(`Analyzing ${all.length} journey records...`);

  for (const doc of all) {
    const isDiscoverDone = Boolean(doc.phases?.discover?.completed);
    const isResearchDone = isDiscoverDone && Array.isArray(doc.phases?.research?.sources) && doc.phases.research.sources.length > 0;
    const isDesignDone = isResearchDone && Boolean(doc.phases?.design?.productGoal?.trim());
    const isPlanDone = isDesignDone && Array.isArray(doc.phases?.plan?.modules) && doc.phases.plan.modules.length > 0;

    let maxStep = 1;
    if (isPlanDone) maxStep = 5;
    else if (isDesignDone) maxStep = 4;
    else if (isResearchDone) maxStep = 3;
    else if (isDiscoverDone) maxStep = 2;

    const currentPhase = typeof doc.currentPhase === 'number' ? doc.currentPhase : 1;
    if (currentPhase > maxStep) {
      console.log(`Fixing user ${doc.userId} for ${doc.problemId}: currentPhase ${currentPhase} -> ${maxStep}`);
      await collection.updateOne(
        { _id: doc._id },
        { $set: { currentPhase: maxStep, updatedAt: new Date() } }
      );
    }
  }

  console.log('Database sanitization complete!');
  await client.close();
}

fix().catch(console.error);
