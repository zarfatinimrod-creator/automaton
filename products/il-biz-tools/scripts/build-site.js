// Copy only the files the public site needs into _site/.
//
// Netlify publishing "." served package.json, README.md, tests/ and scripts/ to
// anyone who guessed the URL. The redirect rules only masked those paths; the
// files were still uploaded. An explicit allowlist is the honest fix, and it
// keeps local development working by opening index.html directly - nothing in
// the source tree moves.
import { cp, mkdir, rm, readdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const out = join(root, '_site');

const DIRS = ['assets', 'src/lib', 'src/config'];
const FILES = ['robots.txt', 'sitemap.xml', 'netlify.toml'];

await rm(out, { recursive: true, force: true });
await mkdir(out, { recursive: true });

for (const name of await readdir(root)) {
  if (name.endsWith('.html')) await cp(join(root, name), join(out, name));
}
for (const dir of DIRS) {
  if (existsSync(join(root, dir))) await cp(join(root, dir), join(out, dir), { recursive: true });
}
for (const file of FILES) {
  if (existsSync(join(root, file))) await cp(join(root, file), join(out, file));
}

const published = await readdir(out);
console.log(`built _site/ with: ${published.join(', ')}`);
