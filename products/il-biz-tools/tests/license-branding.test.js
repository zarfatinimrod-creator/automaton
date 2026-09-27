import { describe, it, expect } from 'vitest';
import { applyBranding, emptyBranding, isValidAccent, isValidLogo, normalizeBranding, DEFAULT_ACCENT, MAX_LOGO_BYTES } from '../src/lib/branding.js';

// The licence itself (Gumroad's key, checked against Gumroad) is tested in
// tests/license.test.js and, through the real page, in tests/page-invoice.test.js.

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
    // The decision lives in src/lib/gumroad.js (proButtonState) and is tested
    // there; the page must defer to it rather than re-deriving the condition.
    expect(page).toContain('proButtonState(site)');
    expect(page).toContain('proCta.disabled = !proState.enabled');
    expect(page).not.toContain('paddle');
  });

  it('ships with Pro disabled until the product-creation job writes the product url and id', async () => {
    const { readFileSync } = await import('node:fs');
    const config = JSON.parse(readFileSync(new URL('../src/config/site.json', import.meta.url), 'utf8'));
    expect(config.gumroad.productUrl).toBe('');
    expect(config.gumroad.productId).toBe('');
    // The signing keypair is retired with Option C: no `pro` block, no public key.
    expect(config.pro).toBeUndefined();
    expect(config.paddle).toBeUndefined();
  });
});
