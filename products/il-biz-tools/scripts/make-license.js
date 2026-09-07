#!/usr/bin/env node
// Issue Pro licence keys. The owner runs this after a Paddle purchase.
//
//   node scripts/make-license.js init            # once: create the signing keypair
//   node scripts/make-license.js issue <buyer>   # per sale: print the key to send
//
// The private key is written to .license-key.json, which is gitignored and must
// never be committed. The public half goes into src/config/site.json, where the
// site uses it to verify keys offline.
import { readFile, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { webcrypto as crypto } from 'node:crypto';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const PRIVATE_FILE = join(root, '.license-key.json');
const CONFIG_FILE = join(root, 'src/config/site.json');
const PREFIX = 'ILBIZ1';
const PRODUCT = 'il-biz-pro';

const b64url = (bytes) =>
  Buffer.from(bytes).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

const [command, subject] = process.argv.slice(2);

if (command === 'init') {
  if (existsSync(PRIVATE_FILE)) {
    console.error(`${PRIVATE_FILE} already exists. Delete it only if you accept that every key you have issued stops verifying.`);
    process.exit(1);
  }
  const pair = await crypto.subtle.generateKey({ name: 'ECDSA', namedCurve: 'P-256' }, true, ['sign', 'verify']);
  const priv = await crypto.subtle.exportKey('jwk', pair.privateKey);
  const pub = await crypto.subtle.exportKey('jwk', pair.publicKey);

  await writeFile(PRIVATE_FILE, JSON.stringify(priv, null, 2));
  const config = JSON.parse(await readFile(CONFIG_FILE, 'utf8'));
  config.pro = { ...(config.pro ?? {}), publicKey: { kty: pub.kty, crv: pub.crv, x: pub.x, y: pub.y } };
  await writeFile(CONFIG_FILE, JSON.stringify(config, null, 2) + '\n');

  console.log(`Private signing key written to ${PRIVATE_FILE} (gitignored - back it up somewhere safe).`);
  console.log(`Public key written into ${CONFIG_FILE} - commit that one.`);
  process.exit(0);
}

if (command === 'issue') {
  if (!subject) {
    console.error('Usage: node scripts/make-license.js issue <buyer email or Paddle order id>');
    process.exit(1);
  }
  if (!existsSync(PRIVATE_FILE)) {
    console.error('No signing key yet. Run: node scripts/make-license.js init');
    process.exit(1);
  }
  const jwk = JSON.parse(await readFile(PRIVATE_FILE, 'utf8'));
  const key = await crypto.subtle.importKey('jwk', jwk, { name: 'ECDSA', namedCurve: 'P-256' }, false, ['sign']);

  const payload = { p: PRODUCT, sub: subject, iat: Math.floor(Date.now() / 1000) };
  const signedPart = b64url(Buffer.from(JSON.stringify(payload), 'utf8'));
  const signature = await crypto.subtle.sign(
    { name: 'ECDSA', hash: 'SHA-256' },
    key,
    Buffer.from(`${PREFIX}.${signedPart}`, 'utf8'),
  );

  console.log(`${PREFIX}.${signedPart}.${b64url(new Uint8Array(signature))}`);
  process.exit(0);
}

console.error('Usage: node scripts/make-license.js <init|issue> [buyer]');
process.exit(1);
