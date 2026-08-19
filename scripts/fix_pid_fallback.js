const fs = require('fs');
const path = require('path');
const dir = 'src/components/journey';
const files = ['ResearchPhase.tsx','PlanPhase.tsx','TestPhase.tsx','DeployPhase.tsx','ImprovePhase.tsx','PortfolioShowcase.tsx'];
const oldStr = 'problemData?.problemId || "medication-reminder"';
const newStr = 'problemData?.problemId ?? ""';
files.forEach(f => {
  const fp = path.join(dir, f);
  const orig = fs.readFileSync(fp, 'utf8');
  const fixed = orig.split(oldStr).join(newStr);
  fs.writeFileSync(fp, fixed, 'utf8');
  const changed = orig !== fixed;
  console.log(changed ? 'Fixed: ' + f : 'No change needed: ' + f);
});
console.log('Done.');
