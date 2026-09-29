// Regenerate the PCN874 rule reference inside pcn874.html from the validator's
// rule table (see src/lib/pcn874-rule-reference.js).
//
//   node scripts/pcn874-rule-reference.js           rewrite the section
//   node scripts/pcn874-rule-reference.js --check   exit 1 if the committed section is stale; write nothing
//
// scripts/build-site.js runs the same comparison and refuses to build a stale
// page, so running this after any change to products/pcn874's rules (and
// node scripts/bundle-pcn874.js) is what keeps the site building.
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { ruleReferenceProblems, withRuleReference } from '../src/lib/pcn874-rule-reference.js';

const page = join(dirname(fileURLToPath(import.meta.url)), '..', 'pcn874.html');
const args = process.argv.slice(2);
if (args.some((a) => a !== '--check')) {
  console.error(`unknown argument(s): ${args.filter((a) => a !== '--check').join(' ')} (the only option is --check)`);
  process.exit(2);
}
const html = readFileSync(page, 'utf8');

if (args.includes('--check')) {
  const problems = ruleReferenceProblems(html);
  if (problems.length) {
    console.error('the PCN874 rule reference is stale - run node scripts/pcn874-rule-reference.js:');
    for (const p of problems) console.error(`  - ${p}`);
    process.exit(1);
  }
  console.log('pcn874.html rule reference matches the validator\'s rule table');
  process.exit(0);
}

try {
  writeFileSync(page, withRuleReference(html), 'utf8');
} catch (e) {
  console.error(`cannot write the rule reference: ${e.message}`);
  process.exit(1);
}
console.log('wrote the rule reference into pcn874.html');
