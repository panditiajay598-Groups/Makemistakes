const { MongoClient } = require('mongodb');
require('dotenv').config();
const dns = require('dns');
try { dns.setServers(['8.8.8.8', '8.8.4.4']); } catch(e) {}

(async () => {
  const client = new MongoClient(process.env.DATABASE_URL);
  await client.connect();
  const db = client.db();
  const problems = await db.collection('problems').find({}).toArray();
  
  console.log('Auditing', problems.length, 'problems...');
  
  const issues = [];
  const templates = new Map();
  
  for (const p of problems) {
    if (!p.quiz || !Array.isArray(p.quiz)) {
      issues.push({ problemId: p.problemId, type: 'NO_QUIZ' });
      continue;
    }
    
    p.quiz.forEach((q, qIdx) => {
      // 1. Check correctIndex
      if (typeof q.correctIndex !== 'number' || q.correctIndex < 0 || q.correctIndex >= q.options.length) {
        issues.push({ problemId: p.problemId, qId: q.id, type: 'BAD_CORRECT_INDEX', val: q.correctIndex });
      }
      
      // 2. Check PAGE artifacts in options
      q.options.forEach((opt, oIdx) => {
        if (/===\s*PAGE/i.test(opt)) {
          issues.push({ problemId: p.problemId, qId: q.id, type: 'PAGE_IN_OPTION', optIdx: oIdx, text: opt });
        }
      });
      
      // 3. Check PAGE artifacts in explanation
      if (/===\s*PAGE/i.test(q.explanation || '')) {
        issues.push({ problemId: p.problemId, qId: q.id, type: 'PAGE_IN_EXPLANATION', text: q.explanation });
      }
      
      // 4. Track unique question/options combos
      const correctText = q.options[q.correctIndex] || '';
      const tKey = `${q.question.replace(/['"].*?['"]/g, '<X>')}|${correctText}|${q.explanation}`;
      if (!templates.has(tKey)) {
        templates.set(tKey, { count: 0, question: q.question, correctOption: correctText, explanation: q.explanation, samplePid: p.problemId });
      }
      templates.get(tKey).count++;
    });
  }
  
  console.log('Total issues found:', issues.length);
  const issueCounts = {};
  issues.forEach(i => {
    issueCounts[i.type] = (issueCounts[i.type] || 0) + 1;
  });
  console.log('Issue counts by type:', issueCounts);
  
  console.log('\n--- Unique Question Templates (' + templates.size + ') ---');
  for (const [key, t] of templates.entries()) {
    console.log(`\n[Count: ${t.count}, e.g. ${t.samplePid}]`);
    console.log(`Q: ${t.question.substring(0, 90)}`);
    console.log(`Correct: "${t.correctOption}"`);
    console.log(`Expl:    "${t.explanation.substring(0, 90)}"`);
  }
  
  await client.close();
})().catch(err => {
  console.error(err);
  process.exit(1);
});
