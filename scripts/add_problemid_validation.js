/**
 * Adds problemId stamp validation to all phase useEffect loaders.
 * This ensures stale saved data (from a different problem) is always discarded.
 * Also purges orphaned global non-scoped keys from old buggy code.
 */
const fs = require('fs');
const path = require('path');

const dir = 'src/components/journey';

// For each phase, the relevant config: file, prefix, stateResets
const phases = [
  {
    file: 'ResearchPhase.tsx',
    pidLine: "const pid = problemData?.problemId ?? \"\";",
    searchFor: "if (Array.isArray(parsed.sources)) setSources(parsed.sources);",
    validation: `        // CRITICAL: Reject stale/corrupted data that belongs to a different problem
        if (parsed.problemId && parsed.problemId !== pid) {
          console.warn(\`[ResearchPhase] Stale data detected (saved for "\${parsed.problemId}", current is "\${pid}"). Discarding.\`);
          localStorage.removeItem(storageKey);
          return;
        }

        `,
  },
  {
    file: 'PlanPhase.tsx',
    pidLine: "const pid = problemData?.problemId ?? \"\";",
    searchFor: "if (Array.isArray(parsed.modules)) setModules(parsed.modules);",
    validation: `        // CRITICAL: Reject stale/corrupted data that belongs to a different problem
        if (parsed.problemId && parsed.problemId !== pid) {
          console.warn(\`[PlanPhase] Stale data detected (saved for "\${parsed.problemId}", current is "\${pid}"). Discarding.\`);
          localStorage.removeItem(storageKey);
          return;
        }

        `,
  },
  {
    file: 'TestPhase.tsx',
    pidLine: "const pid = problemData?.problemId ?? \"\";",
    searchFor: "if (parsed.whatValidating) setWhatValidating(parsed.whatValidating);",
    validation: `        // CRITICAL: Reject stale/corrupted data that belongs to a different problem
        if (parsed.problemId && parsed.problemId !== pid) {
          console.warn(\`[TestPhase] Stale data detected (saved for "\${parsed.problemId}", current is "\${pid}"). Discarding.\`);
          localStorage.removeItem(storageKey);
          return;
        }

        `,
  },
  {
    file: 'DeployPhase.tsx',
    pidLine: "const pid = problemData?.problemId ?? \"\";",
    searchFor: "if (parsed.githubRepoUrl) setGithubRepoUrl(parsed.githubRepoUrl);",
    validation: `        // CRITICAL: Reject stale/corrupted data that belongs to a different problem
        if (parsed.problemId && parsed.problemId !== pid) {
          console.warn(\`[DeployPhase] Stale data detected (saved for "\${parsed.problemId}", current is "\${pid}"). Discarding.\`);
          localStorage.removeItem(storageKey);
          return;
        }

        `,
  },
  {
    file: 'ImprovePhase.tsx',
    pidLine: "const pid = problemData?.problemId ?? \"\";",
    searchFor: "if (Array.isArray(parsed.backlogItems)) setBacklogItems(parsed.backlogItems);",
    validation: `        // CRITICAL: Reject stale/corrupted data that belongs to a different problem
        if (parsed.problemId && parsed.problemId !== pid) {
          console.warn(\`[ImprovePhase] Stale data detected (saved for "\${parsed.problemId}", current is "\${pid}"). Discarding.\`);
          localStorage.removeItem(storageKey);
          return;
        }

        `,
  },
];

// Also add problemId to persistData for phases that don't already have it
const persistFixes = [
  { file: 'ResearchPhase.tsx', search: 'sources,\n          answers,', replace: 'problemId: pid,\n          sources,\n          answers,' },
  { file: 'PlanPhase.tsx', search: 'modules,\n          techDecisions,', replace: 'problemId: pid,\n          modules,\n          techDecisions,' },
  { file: 'TestPhase.tsx', search: 'whatValidating,\n          goalOfTest,', replace: 'problemId: pid,\n          whatValidating,\n          goalOfTest,' },
  { file: 'DeployPhase.tsx', search: 'githubRepoUrl,\n          defaultBranch,', replace: 'problemId: pid,\n          githubRepoUrl,\n          defaultBranch,' },
  { file: 'ImprovePhase.tsx', search: 'backlogItems,\n          biggestMistake,', replace: 'problemId: pid,\n          backlogItems,\n          biggestMistake,' },
];

let totalFixed = 0;

phases.forEach(({ file, searchFor, validation }) => {
  const fp = path.join(dir, file);
  let content = fs.readFileSync(fp, 'utf8');
  if (content.includes('CRITICAL: Reject stale/corrupted')) {
    console.log(`Skip validation (already added): ${file}`);
    return;
  }
  if (!content.includes(searchFor)) {
    console.log(`WARNING: Could not find insertion point in ${file}: "${searchFor.substring(0, 60)}"`);
    return;
  }
  content = content.replace(searchFor, validation + searchFor);
  fs.writeFileSync(fp, content, 'utf8');
  console.log(`✓ Added problemId validation: ${file}`);
  totalFixed++;
});

persistFixes.forEach(({ file, search, replace }) => {
  const fp = path.join(dir, file);
  let content = fs.readFileSync(fp, 'utf8');
  if (content.includes('problemId: pid,')) {
    console.log(`Skip persistData fix (already has problemId): ${file}`);
    return;
  }
  if (!content.includes(search)) {
    console.log(`WARNING: Could not find persistData insertion point in ${file}`);
    return;
  }
  content = content.replace(search, replace);
  fs.writeFileSync(fp, content, 'utf8');
  console.log(`✓ Added problemId to persistData: ${file}`);
  totalFixed++;
});

console.log(`\nTotal fixes applied: ${totalFixed}`);

// Also report which stale global localStorage keys existed (browser side instruction)
console.log('\n=== BROWSER CLEANUP NEEDED ===');
console.log('Open browser console at http://localhost:3000 and run:');
console.log(`
// Clear ALL stale MakeMistakes localStorage keys
Object.keys(localStorage)
  .filter(k => k.startsWith('makemistakes_'))
  .forEach(k => {
    const val = localStorage.getItem(k);
    try {
      const parsed = JSON.parse(val);
      // Remove any key that has no problemId stamp (old stale data)
      if (!parsed.problemId) {
        console.log('Removing stale key:', k);
        localStorage.removeItem(k);
      }
    } catch(e) { localStorage.removeItem(k); }
  });
console.log('Cleanup done. Remaining keys:', Object.keys(localStorage).filter(k => k.startsWith('makemistakes_')));
`);
