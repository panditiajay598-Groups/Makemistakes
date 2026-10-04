const { MongoClient } = require('mongodb');
require('dotenv').config();
const dns = require('dns');
try { dns.setServers(['8.8.8.8', '8.8.4.4']); } catch(e) {}

(async () => {
  const client = new MongoClient(process.env.DATABASE_URL);
  await client.connect();
  const db = client.db();
  const problems = await db.collection('problems').find({}).toArray();
  
  const questionMap = new Map();
  let problemsWithPageTag = 0;
  
  for (const p of problems) {
    if (!p.quiz || !Array.isArray(p.quiz)) continue;
    let hasPageTag = false;
    p.quiz.forEach(q => {
      // Check for page tag
      if (q.options?.some(o => /=== PAGE/i.test(o)) || /=== PAGE/i.test(q.explanation || '')) {
        hasPageTag = true;
      }
      
      const qNorm = q.question.replace(/['"].*?['"]/g, '<STMT>').replace(/\s+/g, ' ').trim();
      if (!questionMap.has(qNorm)) {
        questionMap.set(qNorm, { count: 0, sample: q, problemId: p.problemId });
      }
      questionMap.get(qNorm).count++;
    });
    if (hasPageTag) problemsWithPageTag++;
  }
  
  console.log('Total problems in DB:', problems.length);
  console.log('Problems with === PAGE artifact:', problemsWithPageTag);
  console.log('Unique question patterns:', questionMap.size);
  
  for (const [pattern, info] of questionMap.entries()) {
    console.log('\n======================================================');
    console.log(`Pattern (${info.count} occurrences, e.g. ${info.problemId}):`);
    console.log('Q:', info.sample.question);
    console.log('Options:');
    info.sample.options.forEach((opt, idx) => {
      console.log(`  [${idx}] ${opt} ${idx === info.sample.correctIndex ? '<<< CORRECT' : ''}`);
    });
    console.log('Explanation:', info.sample.explanation);
  }
  
  await client.close();
})().catch(err => {
  console.error(err);
  process.exit(1);
});
