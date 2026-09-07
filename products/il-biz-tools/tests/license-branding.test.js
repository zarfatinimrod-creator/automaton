import { describe, it, expect, beforeAll } from 'vitest';
import { webcrypto } from 'node:crypto';
import { parseLicense, signingInput, bytesToB64url, verifyLicense, storeLicense, loadStoredLicense } from '../src/lib/license.js';
import { applyBranding, emptyBranding, isValidAccent, isValidLogo, normalizeBranding, DEFAULT_ACCENT, MAX_LOGO_BYTES } from '../src/lib/branding.js';

const subtle = webcrypto.subtle;
const b64url = (bytes) => Buffer.from(bytes).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

let publicJwk;
let otherPublicJwk;
let goodKey;
let forgedKey;

async function issue(privateKey, payload) {
  const signedPart = b64url(Buffer.from(JSON.stringify(payload), 'utf8'));
  const sig = await subtle.sign({ name: 'ECDSA', hash: 'SHA-256' }, privateKey, signingInput(signedPart));
  return `ILBIZ1.${signedPart}.${bytesToB64url(new Uint8Array(sig))}`;
}

beforeAll(async () => {
  globalThis.atob ??= (s) => Buffer.from(s, 'base64').toString('binary');
  globalThis.btoa ??= (s) => Buffer.from(s, 'binary').toString('base64');

  const pair = await subtle.generateKey({ name: 'ECDSA', namedCurve: 'P-256' }, true, ['sign', 'verify']);
  const other = await subtle.generateKey({ name: 'ECDSA', namedCurve: 'P-256' }, true, ['sign', 'verify']);
  const pub = await subtle.exportKey('jwk', pair.publicKey);
  const otherPub = await subtle.exportKey('jwk', other.publicKey);
  publicJwk = { kty: pub.kty, crv: pub.crv, x: pub.x, y: pub.y };
  otherPublicJwk = { kty: otherPub.kty, crv: otherPub.crv, x: otherPub.x, y: otherPub.y };

  goodKey = await issue(pair.privateKey, { p: 'il-biz-pro', sub: 'buyer@example.com', iat: 1788400000 });
  // Same payload, signed by a key we do not trust: this is the forgery attempt.
  forgedKey = await issue(other.privateKey, { p: 'il-biz-pro', sub: 'thief@example.com', iat: 1788400000 });
});

describe('licence verification', () => {
  it('accepts a key signed by the owner', async () => {
    const result = await verifyLicense(goodKey, publicJwk, subtle);
    expect(result.valid).toBe(true);
    expect(result.payload.sub).toBe('buyer@example.com');
  });

  it('rejects a key signed by anyone else', async () => {
    const result = await verifyLicense(forgedKey, publicJwk, subtle);
    expect(result.valid).toBe(false);
    expect(result.reason).toBe('bad_signature');
  });

  it('rejects a tampered payload', async () => {
    const [prefix, payload, sig] = goodKey.split('.');
    const swapped = b64url(Buffer.from(JSON.stringify({ p: 'il-biz-pro', sub: 'someone-else', iat: 1 }), 'utf8'));
    expect(payload).not.toBe(swapped);
    const result = await verifyLicense(`${prefix}.${swapped}.${sig}`, publicJwk, subtle);
    expect(result.valid).toBe(false);
  });

  it('rejects junk without throwing', async () => {
    for (const junk of ['', 'nonsense', 'ILBIZ1.abc', null, undefined, 42, 'ILBIZ1.!!!.!!!']) {
      const result = await verifyLicense(junk, publicJwk, subtle);
      expect(result.valid).toBe(false);
    }
  });

  it('refuses to validate anything when no public key is configured', async () => {
    const result = await verifyLicense(goodKey, null, subtle);
    expect(result.valid).toBe(false);
    expect(result.reason).toBe('no_public_key_configured');
  });

  it('will not accept a key issued for a different product', async () => {
    expect(parseLicense('ILBIZ1.' + b64url(Buffer.from(JSON.stringify({ p: 'other' }))) + '.x')).toBeNull();
  });

  it('stores and reloads a key, surviving a storage that throws', () => {
    const mem = new Map();
    const storage = { getItem: (k) => mem.get(k) ?? null, setItem: (k, v) => mem.set(k, v), removeItem: (k) => mem.delete(k) };
    expect(storeLicense(goodKey, storage)).toBe(true);
    expect(loadStoredLicense(storage)).toBe(goodKey);
    storeLicense(null, storage);
    expect(loadStoredLicense(storage)).toBeNull();

    const hostile = { getItem() { throw new Error('blocked'); }, setItem() { throw new Error('blocked'); } };
    expect(loadStoredLicense(hostile)).toBeNull();
    expect(storeLicense(goodKey, hostile)).toBe(false);
  });
});

describe('branding', () => {
  const png = 'data:image/png;base64,iVBORw0KGgo=';

  it('validates accents and logos', () => {
    expect(isValidAccent('#1f3a5f')).toBe(true);
    expect(isValidAccent('red')).toBe(false);
    expect(isValidAccent('#fff')).toBe(false);
    expect(isValidLogo(png)).toBe(true);
    expect(isValidLogo('data:text/html;base64,PHNjcmlwdD4=')).toBe(false);
    expect(isValidLogo('https://example.com/logo.png')).toBe(false);
    expect(isValidLogo('data:image/png;base64,' + 'A'.repeat(MAX_LOGO_BYTES))).toBe(false);
  });

  it('drops anything invalid instead of passing it through', () => {
    expect(normalizeBranding(null)).toEqual(emptyBranding());
    expect(normalizeBranding({ logo: 'javascript:alert(1)', accent: 'nope' })).toEqual(emptyBranding());
    expect(normalizeBranding({ logo: png, accent: '#abcdef' })).toEqual({ logo: png, accent: '#abcdef' });
  });

  it('applies branding only when the licence is active', () => {
    const store = new Map();
    const logoEl = { hidden: true, removeAttribute() { this.src = undefined; }, set src(v) { store.set('src', v); }, get src() { return store.get('src'); } };
    const root = {
      querySelector: () => logoEl,
      style: { props: new Map(), setProperty(k, v) { this.props.set(k, v); }, removeProperty(k) { this.props.delete(k); } },
    };

    const off = applyBranding(root, { logo: png, accent: '#abcdef' }, false);
    expect(off.applied).toBe(false);
    expect(logoEl.hidden).toBe(true);
    expect(root.style.props.has('--brand-accent')).toBe(false);

    const on = applyBranding(root, { logo: png, accent: '#abcdef' }, true);
    expect(on).toMatchObject({ applied: true, accent: '#abcdef', hasLogo: true });
    expect(logoEl.hidden).toBe(false);
    expect(root.style.props.get('--brand-accent')).toBe('#abcdef');

    const noLogo = applyBranding(root, { accent: '#123456' }, true);
    expect(noLogo.hasLogo).toBe(false);
    expect(logoEl.hidden).toBe(true);
  });

  it('falls back to the default accent', () => {
    expect(normalizeBranding({}).accent).toBe(DEFAULT_ACCENT);
  });
});

describe('the honesty constraint', () => {
  it('keeps the previously free features free: they must not be behind the licence', async () => {
    const { readFileSync } = await import('node:fs');
    const page = readFileSync(new URL('../assets/page-invoice.js', import.meta.url), 'utf8');
    // renderClients and nextDocumentNumber were always free. If either ever moves
    // inside the Pro block, we would be charging for something buyers already have.
    // The slice is the Pro section only - the init sequence that follows it calls
    // both unconditionally, which is exactly the behaviour we want to keep.
    const proBlock = page.slice(page.indexOf('let proActive'), page.indexOf('// --- init'));
    expect(proBlock.length).toBeGreaterThan(500);
    expect(proBlock).not.toContain('renderClients');
    expect(proBlock).not.toContain('nextDocumentNumber');

    // ...and the free path still calls them, unconditionally.
    const init = page.slice(page.indexOf('// --- init'));
    expect(init).toContain('renderClients()');
    expect(init).toContain('nextDocumentNumber(');
  });

  it('never offers checkout without a way to verify what it sells', async () => {
    const { readFileSync } = await import('node:fs');
    const page = readFileSync(new URL('../assets/page-invoice.js', import.meta.url), 'utf8');
    expect(page).toContain('isProConfigured(site) && site?.pro?.publicKey');
  });

  it('ships with Pro disabled until the owner generates a keypair', async () => {
    const { readFileSync } = await import('node:fs');
    const config = JSON.parse(readFileSync(new URL('../src/config/site.json', import.meta.url), 'utf8'));
    expect(config.pro.publicKey).toBeNull();
    expect(config.paddle.clientToken).toBe('');
  });
});
