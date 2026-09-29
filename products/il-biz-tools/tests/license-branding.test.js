import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
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

  // N2 (research/tiktok/08-sales-marketing-lessons.md §8.1): in the ready state without a licence the buyer can try
  // the logo and colour on the on-screen preview. The print must not carry them - the free print stays as it was.
  function fakeRoot() {
    const store = new Map();
    const logoEl = { hidden: true, removeAttribute() { store.delete('src'); }, set src(v) { store.set('src', v); }, get src() { return store.get('src'); } };
    const attrs = new Map();
    return {
      logoEl,
      attrs,
      querySelector: () => logoEl,
      setAttribute(k, v) { attrs.set(k, String(v)); },
      removeAttribute(k) { attrs.delete(k); },
      style: { props: new Map(), setProperty(k, v) { this.props.set(k, v); }, removeProperty(k) { this.props.delete(k); } },
    };
  }

  it("a try-out shows the logo and colour on screen through the trial marker only, never the print variable", () => {
    const root = fakeRoot();
    const out = applyBranding(root, { logo: png, accent: '#abcdef' }, 'trial');
    expect(out).toMatchObject({ applied: true, mode: 'trial', hasLogo: true });
    expect(root.logoEl.hidden).toBe(false);
    expect(root.logoEl.src).toBe(png);
    expect(root.attrs.has('data-brand-trial')).toBe(true);
    expect(root.style.props.get('--brand-trial-accent')).toBe('#abcdef');
    expect(root.style.props.has('--brand-accent')).toBe(false);
  });

  it('switching from a try-out to Pro, or off, leaves no trial marker behind', () => {
    const root = fakeRoot();
    applyBranding(root, { logo: png, accent: '#abcdef' }, 'trial');
    applyBranding(root, { logo: png, accent: '#abcdef' }, 'pro');
    expect(root.attrs.has('data-brand-trial')).toBe(false);
    expect(root.style.props.has('--brand-trial-accent')).toBe(false);
    expect(root.style.props.get('--brand-accent')).toBe('#abcdef');

    applyBranding(root, { logo: png, accent: '#abcdef' }, 'trial');
    const off = applyBranding(root, { logo: png, accent: '#abcdef' }, 'off');
    expect(off).toMatchObject({ applied: false, mode: 'off' });
    expect(root.attrs.has('data-brand-trial')).toBe(false);
    expect(root.style.props.size).toBe(0);
    expect(root.logoEl.hidden).toBe(true);
  });

  it('still takes the old boolean: true is Pro, false is off', () => {
    const root = fakeRoot();
    expect(applyBranding(root, { accent: '#123456' }, true).mode).toBe('pro');
    expect(applyBranding(root, { accent: '#123456' }, false).mode).toBe('off');
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

describe('the print stylesheet keeps a try-out off paper (N2)', () => {
  const css = readFileSync(new URL('../assets/style.css', import.meta.url), 'utf8');
  /** The bodies of every `@media <kind> { ... }` block, braces balanced. */
  const mediaBlocks = (kind) => {
    const out = [];
    const re = new RegExp(`@media\\s+${kind}\\b[^{]*\\{`, 'g');
    let m;
    while ((m = re.exec(css))) {
      let depth = 1;
      let j = re.lastIndex;
      for (; j < css.length && depth > 0; j++) {
        if (css[j] === '{') depth++;
        else if (css[j] === '}') depth--;
      }
      out.push(css.slice(re.lastIndex, j - 1));
    }
    return out;
  };

  it('hides the trial logo in print', () => {
    const print = mediaBlocks('print').join('\n');
    expect(print).toMatch(/\.doc\[data-brand-trial\]\s+\.brand-logo\s*\{[^}]*display:\s*none\s*!important/);
  });

  // `.doc .brand-logo { display: block }` beats the browser's own [hidden] rule, so without this the free document's
  // empty, hidden logo still took its bottom margin while a try-out's (display:none in print) did not - the two
  // printouts differed by that margin (review 29.9, code 9; read from the CSS, not measured).
  it('a hidden logo takes no space, so a free print and a try-out print are the same document', () => {
    expect(css).toMatch(/\.doc \.brand-logo\[hidden\]\s*\{\s*display:\s*none;?\s*\}/);
    const rule = css.indexOf('.doc .brand-logo[hidden]');
    expect(rule).toBeGreaterThan(css.indexOf('.doc .brand-logo {'));
  });

  it('uses the trial accent only on screen, so the printed document is exactly the free one', () => {
    const screen = mediaBlocks('screen').join('\n');
    expect(screen).toContain('var(--brand-trial-accent)');
    let outside = css;
    for (const block of mediaBlocks('screen')) outside = outside.replace(block, '');
    expect(outside).not.toContain('--brand-trial-accent');
  });

  it('adds no watermark or mark of any kind to the printed document', () => {
    // Rules only: the comments are allowed to say what the rules must not do.
    expect(css.replace(/\/\*[\s\S]*?\*\//g, '')).not.toMatch(/watermark/i);
    for (const block of mediaBlocks('print')) expect(block).not.toMatch(/content\s*:/);
  });
});
