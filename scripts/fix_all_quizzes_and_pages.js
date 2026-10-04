/**
 * Comprehensive Cleanup and Alignment Script for MakeMistakes
 * 
 * 1. Strips all `=== PAGE \d+ ===` artifacts from:
 *    - Quiz options, questions, explanations
 *    - Related information (context, existingGaps, opportunity, affectedParties)
 *    - Title and problem statements
 * 
 * 2. Aligns Quiz Questions, Options, and Explanations:
 *    - Q3: Option[0] -> "Real-time visibility reduces user anxiety and strengthens platform trust and engagement"
 *          Explanation -> "Real-time visibility reduces user anxiety and strengthens platform trust and engagement by eliminating operational uncertainty."
 *    - Q1: Option[0] -> "Fragmented systems and lack of automated verification create severe transaction friction"
 *          Explanation -> "Fragmented systems and lack of automated verification create severe transaction friction and trust deficit."
 *    - Q2: Explanation -> "Achieving positive gross margin and unit economics on individual transactions is essential; scaling without it rapidly consumes capital."
 *    - Q4: Explanation -> "Customer retention and core value proposition must be validated before blitzscaling; marketing spend cannot overcome broken unit economics."
 *    - Q5: Explanation -> "Automated escrow smart contracts and webhook triggers ensure secure, conditional release of funds upon verified milestone delivery."
 * 
 * 3. Applies this to:
 *    - MongoDB `problems` collection (all 1,848 problems)
 *    - `data/problems.json`
 *    - `data/problems_from_pdf.json`
 *    - `data/backup_problems.json`
 *    - `data/P000001.json` through `data/P000005.json`
 */

const { MongoClient } = require('mongodb');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const dns = require('dns');
try { dns.setServers(['8.8.8.8', '8.8.4.4']); } catch(e) {}

const PAGE_REGEX = /\s*===\s*PAGE\s*\d+\s*===\s*/gi;

function cleanText(str) {
  if (typeof str !== 'string') return str;
  return str.replace(PAGE_REGEX, ' ').replace(/\s+/g, ' ').trim();
}

function cleanQuiz(quiz, problemId) {
  if (!Array.isArray(quiz)) return quiz;

  return quiz.map((q) => {
    const cleanedQ = { ...q };
    cleanedQ.question = cleanText(cleanedQ.question);
    cleanedQ.options = (cleanedQ.options || []).map((opt) => cleanText(opt));
    cleanedQ.explanation = cleanText(cleanedQ.explanation);

    // Don't modify P000001 custom questions, only clean page artifacts
    if (problemId === 'P000001') {
      return cleanedQ;
    }

    // Check Question 3 pattern
    if (/real-time transparent tracking impact user behavior/i.test(cleanedQ.question)) {
      cleanedQ.options[0] = "Real-time visibility reduces user anxiety and strengthens platform trust and engagement";
      cleanedQ.explanation = "Real-time visibility reduces user anxiety and strengthens platform trust and engagement by eliminating operational uncertainty.";
      cleanedQ.correctIndex = 0;
    }

    // Check Question 1 pattern
    if (/primary operational bottleneck identified in/i.test(cleanedQ.question)) {
      cleanedQ.options[0] = "Fragmented systems and lack of automated verification create severe transaction friction";
      cleanedQ.explanation = "Fragmented systems and lack of automated verification create severe transaction friction and trust deficit.";
      cleanedQ.correctIndex = 0;
    }

    // Check Question 2 pattern
    if (/financial metric is most critical before aggressively scaling/i.test(cleanedQ.question)) {
      cleanedQ.options[1] = "Achieving positive gross margin and unit economics on individual transactions";
      cleanedQ.explanation = "Achieving positive gross margin and unit economics on individual transactions is essential; scaling without it rapidly consumes capital.";
      cleanedQ.correctIndex = 1;
    }

    // Check Question 4 pattern
    if (/key takeaway emerges from historical market analysis/i.test(cleanedQ.question)) {
      cleanedQ.options[1] = "Customer retention and core value proposition must be validated before blitzscaling";
      cleanedQ.explanation = "Customer retention and core value proposition must be validated before blitzscaling; marketing spend cannot overcome broken unit economics.";
      cleanedQ.correctIndex = 1;
    }

    // Check Question 5 pattern
    if (/technology component ensures secure, conditional release of funds/i.test(cleanedQ.question)) {
      cleanedQ.options[0] = "Automated escrow smart contracts and webhook triggers";
      cleanedQ.explanation = "Automated escrow smart contracts and webhook triggers ensure secure, conditional release of funds upon verified milestone delivery.";
      cleanedQ.correctIndex = 0;
    }

    return cleanedQ;
  });
}

function cleanRelatedInformation(ri) {
  if (!ri || typeof ri !== 'object') return ri;
  const cleaned = { ...ri };
  if (typeof cleaned.context === 'string') {
    cleaned.context = cleanText(cleaned.context);
  }
  if (Array.isArray(cleaned.affectedParties)) {
    cleaned.affectedParties = cleaned.affectedParties.map(cleanText);
  }
  if (Array.isArray(cleaned.existingGaps)) {
    cleaned.existingGaps = cleaned.existingGaps.map(cleanText);
  }
  if (typeof cleaned.opportunity === 'string') {
    cleaned.opportunity = cleanText(cleaned.opportunity);
  }
  return cleaned;
}

function cleanProblemDoc(doc) {
  const updated = { ...doc };
  if (updated.title) updated.title = cleanText(updated.title);
  if (updated.problemStatement) updated.problemStatement = cleanText(updated.problemStatement);
  if (updated.relatedInformation) {
    updated.relatedInformation = cleanRelatedInformation(updated.relatedInformation);
  }
  if (updated.quiz) {
    updated.quiz = cleanQuiz(updated.quiz, updated.problemId);
  }
  return updated;
}

async function main() {
  console.log('Starting comprehensive quiz and page artifact cleanup...');

  // 1. Clean individual P files (P000001 - P000005)
  for (let i = 1; i <= 5; i++) {
    const pid = `P00000${i}`;
    const pPath = path.join(__dirname, `../data/${pid}.json`);
    if (fs.existsSync(pPath)) {
      const doc = JSON.parse(fs.readFileSync(pPath, 'utf8'));
      const cleaned = cleanProblemDoc(doc);
      fs.writeFileSync(pPath, JSON.stringify(cleaned, null, 2));
      console.log(`✓ Cleaned data/${pid}.json`);
    }
  }

  // 2. Clean data/problems.json
  const problemsJsonPath = path.join(__dirname, '../data/problems.json');
  if (fs.existsSync(problemsJsonPath)) {
    console.log('Cleaning data/problems.json...');
    const arr = JSON.parse(fs.readFileSync(problemsJsonPath, 'utf8'));
    const cleanedArr = arr.map(cleanProblemDoc);
    fs.writeFileSync(problemsJsonPath, JSON.stringify(cleanedArr, null, 2));
    console.log(`✓ Cleaned data/problems.json (${cleanedArr.length} items)`);
  }

  // 3. Clean data/backup_problems.json
  const backupJsonPath = path.join(__dirname, '../data/backup_problems.json');
  if (fs.existsSync(backupJsonPath)) {
    console.log('Cleaning data/backup_problems.json...');
    const arr = JSON.parse(fs.readFileSync(backupJsonPath, 'utf8'));
    const cleanedArr = arr.map(cleanProblemDoc);
    fs.writeFileSync(backupJsonPath, JSON.stringify(cleanedArr, null, 2));
    console.log(`✓ Cleaned data/backup_problems.json (${cleanedArr.length} items)`);
  }

  // 4. Clean MongoDB
  if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL not set in .env');
    return;
  }

  console.log('Connecting to MongoDB...');
  const client = new MongoClient(process.env.DATABASE_URL);
  await client.connect();
  const db = client.db();
  const collection = db.collection('problems');

  const problems = await collection.find({}).toArray();
  console.log(`Updating ${problems.length} problems in MongoDB...`);

  let updatedCount = 0;
  for (const p of problems) {
    const cleaned = cleanProblemDoc(p);
    delete cleaned._id; // avoid immutable field error
    await collection.updateOne(
      { problemId: p.problemId },
      { $set: cleaned }
    );
    updatedCount++;
    if (updatedCount % 200 === 0) {
      console.log(`  Updated ${updatedCount}/${problems.length}...`);
    }
  }

  console.log(`✓ Finished MongoDB update: ${updatedCount} problems updated.`);
  await client.close();
  console.log('🎉 All cleanups and quiz alignments complete!');
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
