// Offline licence verification.
//
// The site is static: there is no server to ask "did this person pay?". A
// licence key is therefore a short signed token. The owner's private key signs
// keys after a purchase; the site holds only the public key and verifies the
// signature with Web Crypto. Nobody can mint a key without the private key.
//
// This is client-side gating, which a determined user can bypass by editing
// JavaScript. That is true of every static site and is not a reason to pretend
// otherwise: the buyer gets exactly what they paid for, and the honest majority
// are not inconvenienced.

const PREFIX = 'ILBIZ1';
export const PRODUCT = 'il-biz-pro';
export const LICENSE_STORAGE_KEY = 'ilbiz.license';

const enc = new TextEncoder();

function b64urlToBytes(s) {
  const pad = s.length % 4 === 0 ? '' : '='.repeat(4 - (s.length % 4));
  const b64 = s.replace(/-/g, '+').replace(/_/g, '/') + pad;
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i += 1) out[i] = bin.charCodeAt(i);
  return out;
}

export function bytesToB64url(bytes) {
  let bin = '';
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

/**
 * Split a key into its parts without verifying the signature.
 * Returns null when the key is not even shaped like one.
 */
export function parseLicense(key) {
  if (typeof key !== 'string') return null;
  const parts = key.trim().split('.');
  if (parts.length !== 3 || parts[0] !== PREFIX) return null;
  let payload;
  try {
    payload = JSON.parse(new TextDecoder().decode(b64urlToBytes(parts[1])));
  } catch {
    return null;
  }
  if (!payload || payload.p !== PRODUCT) return null;
  return { payload, signedPart: parts[1], signature: parts[2] };
}

/** Build the exact bytes that get signed. Shared by the issuer and the verifier. */
export function signingInput(signedPart) {
  return enc.encode(`${PREFIX}.${signedPart}`);
}

/**
 * Verify a licence key against the public key.
 * Returns {valid, reason, payload}. Never throws.
 */
export async function verifyLicense(key, publicKeyJwk, subtle = globalThis.crypto?.subtle) {
  const parsed = parseLicense(key);
  if (!parsed) return { valid: false, reason: 'not_a_license_key' };
  if (!publicKeyJwk || !publicKeyJwk.x) return { valid: false, reason: 'no_public_key_configured' };
  if (!subtle) return { valid: false, reason: 'web_crypto_unavailable' };

  try {
    const pub = await subtle.importKey(
      'jwk',
      { ...publicKeyJwk, key_ops: ['verify'], ext: true },
      { name: 'ECDSA', namedCurve: 'P-256' },
      false,
      ['verify'],
    );
    const ok = await subtle.verify(
      { name: 'ECDSA', hash: 'SHA-256' },
      pub,
      b64urlToBytes(parsed.signature),
      signingInput(parsed.signedPart),
    );
    if (!ok) return { valid: false, reason: 'bad_signature' };
    return { valid: true, payload: parsed.payload };
  } catch {
    return { valid: false, reason: 'verification_failed' };
  }
}

export function loadStoredLicense(storage = globalThis.localStorage) {
  try {
    return storage?.getItem(LICENSE_STORAGE_KEY) ?? null;
  } catch {
    return null;
  }
}

export function storeLicense(key, storage = globalThis.localStorage) {
  try {
    if (key) storage?.setItem(LICENSE_STORAGE_KEY, key);
    else storage?.removeItem(LICENSE_STORAGE_KEY);
    return true;
  } catch {
    return false;
  }
}
