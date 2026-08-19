/**
 * DEFINITIVE FIX: Bump all localStorage key names from v1 to v2.
 * Old keys: makemistakes_design_data_${pid}
 * New keys: makemistakes_design_v2_data_${pid}
 *
 * This permanently invalidates ALL stale MedReminder data saved under old keys,
 * regardless of what problemId was stored in the data.
 */
const fs = require('fs');
const path = require('path');

const dir = 'src/components/journey';

// Map of phase files → old key fragment → new key fragment
const keyRenames = [
  {
    file: 'DesignPhase.tsx',
    oldKey: 'makemistakes_design_data_',
    newKey: 'makemistakes_design_v2_data_',
    oldVarLine: 'const storageKey = `makemistakes_design_data_${pid}`',
    newVarLine: 'const storageKey = `makemistakes_design_v2_data_${pid}`',
  },
  {
    file: 'ResearchPhase.tsx',
    oldKey: 'makemistakes_research_data_',
    newKey: 'makemistakes_research_v2_data_',
    oldVarLine: 'const storageKey = `makemistakes_research_data_${pid}`',
    newVarLine: 'const storageKey = `makemistakes_research_v2_data_${pid}`',
  },
  {
    file: 'PlanPhase.tsx',
    oldKey: 'makemistakes_plan_data_',
    newKey: 'makemistakes_plan_v2_data_',
    oldVarLine: 'const storageKey = `makemistakes_plan_data_${pid}`',
    newVarLine: 'const storageKey = `makemistakes_plan_v2_data_${pid}`',
  },
  {
    file: 'TestPhase.tsx',
    oldKey: 'makemistakes_test_data_',
    newKey: 'makemistakes_test_v2_data_',
    oldVarLine: 'const storageKey = `makemistakes_test_data_${pid}`',
    newVarLine: 'const storageKey = `makemistakes_test_v2_data_${pid}`',
  },
  {
    file: 'DeployPhase.tsx',
    oldKey: 'makemistakes_deploy_data_',
    newKey: 'makemistakes_deploy_v2_data_',
    oldVarLine: 'const storageKey = `makemistakes_deploy_data_${pid}`',
    newVarLine: 'const storageKey = `makemistakes_deploy_v2_data_${pid}`',
  },
  {
    file: 'ImprovePhase.tsx',
    oldKey: 'makemistakes_improve_data_',
    newKey: 'makemistakes_improve_v2_data_',
    oldVarLine: 'const storageKey = `makemistakes_improve_data_${pid}`',
    newVarLine: 'const storageKey = `makemistakes_improve_v2_data_${pid}`',
  },
  {
    file: 'LaunchPhase.tsx',
    oldKey: 'makemistakes_launch_data_',
    newKey: 'makemistakes_launch_v2_data_',
    oldVarLine: 'const storageKey = pid ? `makemistakes_launch_data_${pid}` : null',
    newVarLine: 'const storageKey = pid ? `makemistakes_launch_v2_data_${pid}` : null',
  },
];

// Also fix PortfolioShowcase which reads multiple phase keys
const portfolioFile = path.join(dir, 'PortfolioShowcase.tsx');

let totalChanged = 0;

keyRenames.forEach(({ file, oldVarLine, newVarLine }) => {
  const fp = path.join(dir, file);
  let content = fs.readFileSync(fp, 'utf8');

  if (content.includes(newVarLine)) {
    console.log(`Skip (already v2): ${file}`);
    return;
  }
  if (!content.includes(oldVarLine)) {
    console.log(`WARNING: Could not find key line in ${file}`);
    console.log(`  Looking for: ${oldVarLine}`);
    return;
  }

  content = content.replace(oldVarLine, newVarLine);
  fs.writeFileSync(fp, content, 'utf8');
  console.log(`✓ Bumped to v2: ${file}`);
  totalChanged++;
});

// Fix PortfolioShowcase — it reads all 5 phase keys
let portfolioContent = fs.readFileSync(portfolioFile, 'utf8');
const portfolioFixes = [
  ['makemistakes_research_data_${pid}', 'makemistakes_research_v2_data_${pid}'],
  ['makemistakes_design_data_${pid}',   'makemistakes_design_v2_data_${pid}'],
  ['makemistakes_plan_data_${pid}',     'makemistakes_plan_v2_data_${pid}'],
  ['makemistakes_test_data_${pid}',     'makemistakes_test_v2_data_${pid}'],
  ['makemistakes_improve_data_${pid}',  'makemistakes_improve_v2_data_${pid}'],
];
let portfolioChanged = false;
portfolioFixes.forEach(([oldK, newK]) => {
  if (portfolioContent.includes(oldK) && !portfolioContent.includes(newK)) {
    portfolioContent = portfolioContent.split(oldK).join(newK);
    portfolioChanged = true;
  }
});
if (portfolioChanged) {
  fs.writeFileSync(portfolioFile, portfolioContent, 'utf8');
  console.log(`✓ Bumped to v2: PortfolioShowcase.tsx`);
  totalChanged++;
}

// Also update the cleanup in journey page to match v2 keys
const journeyPageFile = 'src/app/journey/[id]/page.tsx';
let journeyContent = fs.readFileSync(journeyPageFile, 'utf8');

// Update the cleanup to also look for OLD v1 keys and remove them
const OLD_CLEANUP = 'const CLEANUP_DONE_KEY = "makemistakes_storage_v2_cleaned";';
const NEW_CLEANUP = 'const CLEANUP_DONE_KEY = "makemistakes_storage_v3_cleaned"; // v3 = also purges v1 keys with stale content';

if (!journeyContent.includes(NEW_CLEANUP)) {
  journeyContent = journeyContent.replace(OLD_CLEANUP, NEW_CLEANUP);
  
  // Also update the filter to catch both v1 and v2 old keys
  const OLD_FILTER = ".filter((k) => k.startsWith(\"makemistakes_\") && k !== CLEANUP_DONE_KEY)";
  const NEW_FILTER = `.filter((k) => k.startsWith("makemistakes_") && k !== CLEANUP_DONE_KEY)`;
  // Already fine
  
  fs.writeFileSync(journeyPageFile, journeyContent, 'utf8');
  console.log(`✓ Updated cleanup version: page.tsx`);
  totalChanged++;
}

console.log(`\n✅ Total files changed: ${totalChanged}`);
console.log('\nAll phases now use v2 storage keys.');
console.log('Old stale data (v1 keys) will never be found or loaded.');
console.log('First visit to the app will run cleanup and remove all v1 keys.');
