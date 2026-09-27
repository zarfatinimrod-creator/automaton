import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import {
  A11Y_CHECKS,
  checkPageA11y,
  checkStylesheetA11y,
  contrastRatio,
  resolveColor,
  cssRules,
} from '../src/lib/a11y-check.js';
import { withheldPageHtml } from '../src/lib/publish-gate.js';

const read = (p) => readFileSync(new URL(`../${p}`, import.meta.url), 'utf8');
const checksOf = (html) => checkPageA11y(html).map((p) => p.check);

const page = (body, head = '<title>דף</title>') =>
  `<!doctype html><html lang="he" dir="rtl"><head>${head}</head><body><main>${body}</main></body></html>`;

describe('page checks', () => {
  it('passes a minimal correct page', () => {
    expect(checkPageA11y(page('<h1>כותרת</h1><label for="a">סכום</label><input id="a"><button>שלח</button><a href="x.html">קישור</a>'))).toEqual([]);
  });

  it('catches a page without lang/dir or title', () => {
    expect(checksOf('<html><head></head><body><main><h1>x</h1></main></body></html>')).toEqual(expect.arrayContaining(['lang-dir', 'title']));
  });

  it('catches a viewport that blocks zoom', () => {
    expect(checksOf(page('<h1>x</h1>', '<title>t</title><meta name="viewport" content="width=device-width, user-scalable=no">'))).toContain('zoom');
    expect(checksOf(page('<h1>x</h1>', '<title>t</title><meta name="viewport" content="width=device-width, maximum-scale=1">'))).toContain('zoom');
    expect(checksOf(page('<h1>x</h1>', '<title>t</title><meta name="viewport" content="width=device-width, initial-scale=1">'))).toEqual([]);
  });

  it('catches an image without alt, but accepts an empty alt', () => {
    expect(checksOf(page('<h1>x</h1><img src="a.png">'))).toContain('img-alt');
    expect(checksOf(page('<h1>x</h1><img src="a.png" alt="">'))).toEqual([]);
  });

  it('catches an unlabelled control and accepts every legitimate way of naming one', () => {
    expect(checksOf(page('<h1>x</h1><input id="a">'))).toContain('control-names');
    expect(checksOf(page('<h1>x</h1><select id="s"></select>'))).toContain('control-names');
    expect(checksOf(page('<h1>x</h1><input aria-label="סכום">'))).toEqual([]);
    expect(checksOf(page('<h1>x</h1><span id="l">סכום</span><input aria-labelledby="l">'))).toEqual([]);
    expect(checksOf(page('<h1>x</h1><label>סכום <input type="checkbox"></label>'))).toEqual([]);
    expect(checksOf(page('<h1>x</h1><input type="hidden" name="x">'))).toEqual([]);
  });

  it('catches nameless buttons and links', () => {
    expect(checksOf(page('<h1>x</h1><button></button>'))).toContain('button-names');
    expect(checksOf(page('<h1>x</h1><button aria-label="סגור">×</button>'))).toEqual([]);
    expect(checksOf(page('<h1>x</h1><a href="x.html"></a>'))).toContain('link-names');
    expect(checksOf(page('<h1>x</h1><a href="x.html"><img src="l.png" alt="בית"></a>'))).toEqual([]);
  });

  it('wants exactly one h1 and no skipped heading level', () => {
    expect(checksOf(page('<h2>x</h2>'))).toContain('headings');
    expect(checksOf(page('<h1>x</h1><h1>y</h1>'))).toContain('headings');
    expect(checksOf(page('<h1>x</h1><h3>y</h3>'))).toContain('headings');
    expect(checksOf(page('<h1>x</h1><h2>y</h2><h3>z</h3><h2>w</h2>'))).toEqual([]);
  });

  it('catches duplicate ids, a missing main, an unnamed nav and a positive tabindex', () => {
    expect(checksOf(page('<h1>x</h1><p id="a"></p><p id="a"></p>'))).toContain('unique-ids');
    expect(checksOf('<html lang="he" dir="rtl"><head><title>t</title></head><body><h1>x</h1></body></html>')).toContain('landmarks');
    expect(checksOf(page('<h1>x</h1><nav><a href="a.html">a</a></nav>'))).toContain('landmarks');
    expect(checksOf(page('<h1>x</h1><a href="a.html" tabindex="3">a</a>'))).toContain('tabindex');
    expect(checksOf(page('<h1>x</h1><div tabindex="-1">a</div>'))).toEqual([]);
  });
});

describe('stylesheet checks', () => {
  it('computes WCAG 2.0 contrast', () => {
    expect(contrastRatio('#000000', '#ffffff')).toBeCloseTo(21, 5);
    expect(contrastRatio('#ffffff', '#ffffff')).toBeCloseTo(1, 5);
    expect(contrastRatio('#767676', '#ffffff')).toBeGreaterThanOrEqual(4.5);
  });

  it('resolves custom properties and short hex', () => {
    expect(resolveColor('var(--a)', { '--a': 'var(--b)', '--b': '#fff' })).toBe('#ffffff');
    expect(resolveColor('inherit', {})).toBeNull();
  });

  it('ignores print-only rules when reading screen colours', () => {
    const rules = cssRules('body { background: #111111; } @media print { @page { size: A4; } body { background: #fff; } }');
    expect(rules.filter((r) => r.selector === 'body').map((r) => r.decls.background)).toEqual(['#111111']);
  });

  it('flags a removed focus outline', () => {
    const { problems } = checkStylesheetA11y('a:focus { outline: none; } input:focus, select:focus, textarea:focus { outline: 2px solid #000; }');
    expect(problems.map((p) => p.check)).toContain('focus-visible');
  });

  it('flags the palette this site shipped with before 27.9.2026', () => {
    const old = read('assets/style.css')
      .replace(/--brand: #[0-9a-f]{6}/, '--brand: #0f6fff')
      .replace(/--ok: #[0-9a-f]{6}/, '--ok: #1a8f4e')
      .replace(/--warn: #[0-9a-f]{6}/, '--warn: #c77d00');
    const failing = checkStylesheetA11y(old).problems.filter((p) => p.check === 'contrast').map((p) => p.message);
    expect(failing.join('\n')).toMatch(/links on the page/);
    expect(failing.join('\n')).toMatch(/orange badge/);
    expect(failing.join('\n')).toMatch(/green badge/);
  });
});

describe('this product, as it ships', () => {
  const pages = readdirSync(new URL('..', import.meta.url)).filter((f) => f.endsWith('.html'));

  it('every page passes every page check', () => {
    for (const p of pages) expect(checkPageA11y(read(p)), p).toEqual([]);
  });

  it('the notice that replaces a withheld page passes too', () => {
    expect(checkPageA11y(withheldPageHtml({ page: 'net-salary.html', title: 'שכר נטו', unverified: ['x.json'] }))).toEqual([]);
  });

  it('the stylesheet passes: focus stays visible and every text pair reaches 4.5:1', () => {
    const { problems, pairs } = checkStylesheetA11y(read('assets/style.css'));
    expect(problems).toEqual([]);
    expect(pairs.length).toBeGreaterThan(20);
  });
});

describe('the accessibility statement', () => {
  const html = read('accessibility.html');
  const listed = [...html.matchAll(/<li data-check="([^"]+)">([^<]*)<\/li>/g)].map((m) => ({ id: m[1], he: m[2] }));

  it('lists exactly the checks the build runs, word for word - nothing more, nothing less', () => {
    expect(listed).toEqual(A11Y_CHECKS);
  });

  it('claims no conformance it has not got', () => {
    expect(html).toContain('לא</strong> עבר בדיקת נגישות מלאה לפי תקן ישראלי 5568');
    // The one place conformance is mentioned is the sentence denying it.
    const count = (s) => html.split(s).length - 1;
    expect(count('איננו מצהירים שהאתר עומד בתקן')).toBe(1);
    expect(count('עומד בתקן')).toBe(1);
    expect(html).not.toMatch(/תואם (ל)?תקן|נגיש במלואו|נגישות מלאה לכל/);
  });

  it('says when the checks ran and what was not checked', () => {
    expect(html).toContain('27 בספטמבר 2026');
    expect(html).toContain('מה לא נבדק');
    expect(html).toContain('קורא מסך');
  });

  it('holds the contact as a marked placeholder, not an invented address', () => {
    expect(html).toMatch(/data-publish-blocker="accessibility-contact"/);
    expect(html).not.toMatch(/mailto:|@[a-z0-9-]+\.[a-z]{2,}/i);
    expect(html).not.toMatch(/tel:|\b0\d{1,2}-?\d{7}\b/);
  });

  it('is linked from the footer of every other page that has one', () => {
    for (const p of readdirSync(new URL('..', import.meta.url)).filter((f) => f.endsWith('.html'))) {
      const src = read(p);
      if (p === 'accessibility.html' || !src.includes('site-footer')) continue;
      expect(src, p).toContain('href="accessibility.html"');
    }
  });
});
