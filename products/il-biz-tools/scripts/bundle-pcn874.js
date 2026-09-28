// Regenerate src/vendor/pcn874/ from products/pcn874/src (see src/lib/pcn874-bundle.js).
//
//   node scripts/bundle-pcn874.js           write the bundle
//   node scripts/bundle-pcn874.js --check   exit 1 if the committed bundle is stale; write nothing
//
// scripts/build-site.js runs the --check comparison itself and refuses to
// publish a stale bundle, so running this after any change under
// products/pcn874/src is what keeps the site building.
import { mkdir, readdir, rm, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { PCN874_MODULES, PCN874_VENDOR_DIR, bundlePcn874, bundleProblems, fsBundleAccess } from '../src/lib/pcn874-bundle.js';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
if (args.some((a) => a !== '--check')) {
  console.error(`unknown argument(s): ${args.filter((a) => a !== '--check').join(' ')} (the only option is --check)`);
  process.exit(2);
}
const access = fsBundleAccess(root);

if (args.includes('--check')) {
  const problems = bundleProblems(access);
  if (problems.length) {
    console.error('the pcn874 bundle is stale - run node scripts/bundle-pcn874.js:');
    for (const p of problems) console.error(`  - ${p}`);
    process.exit(1);
  }
  console.log(`${PCN874_VENDOR_DIR}/ matches products/pcn874/src`);
  process.exit(0);
}

const { files, problems } = bundlePcn874(access.readSource);
if (problems.length) {
  console.error('cannot bundle pcn874:');
  for (const p of problems) console.error(`  - ${p}`);
  process.exit(1);
}
const dir = join(root, PCN874_VENDOR_DIR);
await mkdir(dir, { recursive: true });
const keep = new Set(PCN874_MODULES.map((m) => `${m}.js`));
for (const name of await readdir(dir)) if (!keep.has(name)) await rm(join(dir, name), { recursive: true, force: true });
for (const { path, text } of files) {
  await writeFile(join(root, path), text, 'utf8');
  console.log(`wrote ${path}`);
}
