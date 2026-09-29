// What the PCN874 page lets a user share after a check (TikTok note N7b, N15).
//
// The user carries their own result to whoever files for them. The share text
// holds the error and warning counts and the names of the rules that fired -
// never a value from the file, never the file's name - then the page's address
// alone on its last line, marked ?via=share. No emoji and nothing above U+FFFF:
// the wa.me -> api.whatsapp.com redirect is reported to turn such characters
// into U+FFFD (research/tiktok/08-sales-marketing-lessons.md §6.3).
//
// The page ships navigator.share only. The api.whatsapp.com fallback link is
// built and tested here but stays behind WHATSAPP_FALLBACK_ENABLED, off until
// an Android and an iOS device test is recorded (the note's release gate).
import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { validatePcn874 } from '../src/vendor/pcn874/validate.js';
import { parsePcn874 } from '../src/vendor/pcn874/parse.js';
import {
  PCN874_PAGE_URL,
  SHARE_URL,
  WHATSAPP_FALLBACK_ENABLED,
  WHATSAPP_DEVICE_TEST_RECORD,
  shareSummary,
  shareText,
  whatsappHref,
} from '../src/lib/pcn874-share.js';
import { productRoot } from './helpers/product-copy.js';

const fixtureDir = join(productRoot, '..', 'pcn874', 'tests', 'fixtures');
const fixtures = readdirSync(fixtureDir).filter((f) => f.endsWith('.txt'));
const fixture = (name) => readFileSync(join(fixtureDir, name), 'utf8');
const textFor = (content) => shareText(shareSummary(validatePcn874(content)));

/** Every value a file carries in its fields that could identify it: not zeros, not a lone letter or sign. */
function fileValues(content) {
  const values = new Set();
  for (const r of parsePcn874(content).records) {
    for (const v of Object.values(r.fields)) if (v.length >= 3 && !/^0+$/.test(v) && !/^[+-]+$/.test(v)) values.add(v);
    if (r.kind === 'unknown' && r.raw.length >= 3) values.add(r.raw);
  }
  return [...values];
}

describe('the address it points to', () => {
  it('is the page\'s own canonical address, with ?via=share', () => {
    const html = readFileSync(join(productRoot, 'pcn874.html'), 'utf8');
    expect(html).toContain(`<link rel="canonical" href="${PCN874_PAGE_URL}">`);
    const site = JSON.parse(readFileSync(join(productRoot, 'src/config/site.json'), 'utf8'));
    expect(PCN874_PAGE_URL).toBe(`${site.siteUrl}/pcn874.html`);
    expect(SHARE_URL).toBe(`${PCN874_PAGE_URL}?via=share`);
  });
});

describe('the share text', () => {
  it('carries the counts and the names of the rules that fired', () => {
    const result = validatePcn874(fixture('invalid-detail-semantics.txt'));
    const text = shareText(shareSummary(result));
    const errors = result.counts.error;
    expect(text).toContain(`${errors} שגיאות`);
    for (const rule of new Set(result.findings.map((f) => f.rule))) expect(text).toContain(rule);
  });

  it('says a clean file is clean, and never that it will be accepted', () => {
    const text = textFor(fixture('valid-minimal.txt'));
    expect(text).toContain('לא נמצאו שגיאות ולא אזהרות');
    expect(text).toContain('לא אישור שהקובץ יתקבל');
    expect(text).toContain('אינו ייעוץ מס');
  });

  it('never carries a value from the file, whatever the file', () => {
    for (const name of fixtures) {
      const content = fixture(name);
      const text = textFor(content);
      for (const value of fileValues(content)) expect(text, `${name}: ${value}`).not.toContain(value);
    }
  });

  it('never carries a marker planted in the file\'s free-text field', () => {
    const lines = fixture('valid-mixed.txt').split('\n');
    // refGroup is A(4) at offset 18 of a transaction record: plant "QZ#W" there (a warning).
    lines[1] = `${lines[1].slice(0, 18)}QZ#W${lines[1].slice(22)}`;
    const text = textFor(lines.join('\n'));
    expect(text).toContain('detail.refGroup.alphanumeric');
    expect(text).not.toContain('QZ#W');
  });

  it('ends with the address alone on its own line', () => {
    for (const name of ['valid-minimal.txt', 'invalid-counts.txt', 'invalid-representative-file.txt']) {
      const lines = textFor(fixture(name)).split('\n');
      expect(lines.at(-1)).toBe(SHARE_URL);
      expect(lines.at(-2)).not.toContain('http');
    }
  });

  it('has no emoji and no character above U+FFFF', () => {
    for (const name of fixtures) {
      const text = textFor(fixture(name));
      for (const ch of text) expect(ch.codePointAt(0), `${name}: ${JSON.stringify(ch)}`).toBeLessThanOrEqual(0xffff);
      expect(text).not.toMatch(/\p{Extended_Pictographic}/u);
    }
  });

  it('names the file as one dealer\'s file and pitches nothing to anyone', () => {
    for (const name of fixtures) {
      const text = textFor(fixture(name));
      expect(text).toContain('של עוסק אחד');
      expect(text).not.toMatch(/רואי חשבון|מייצגים ורואי|כמה לקוחות|לכל הלקוחות/);
      expect(text).not.toMatch(/₪|מחיר|Pro\b|gumroad|לקנות|רכישה/i);
    }
  });

  it('says a representatives\' file is not supported rather than grading it', () => {
    const text = textFor(fixture('invalid-representative-file.txt'));
    expect(text).toContain("קובץ מייצגים (נספח ב')");
    expect(text).toContain('אינו בודק');
  });

  it('lists at most ten rule names, and says how many more there were', () => {
    const summary = { verdict: 'invalid', errors: 30, warnings: 0, rules: Array.from({ length: 14 }, (_, i) => `detail.rule${i}.digits`) };
    const text = shareText(summary);
    expect(text).toContain('detail.rule9.digits');
    expect(text).not.toContain('detail.rule10.digits');
    expect(text).toContain('ועוד 4');
  });

  it('builds the summary from the result\'s counts and rule ids only', () => {
    const summary = shareSummary(validatePcn874(fixture('warnings-only.txt')));
    expect(Object.keys(summary).sort()).toEqual(['errors', 'rules', 'verdict', 'warnings']);
    for (const r of summary.rules) expect(r).toMatch(/^(file|header|detail|footer|totals)\.[A-Za-z.]+$/);
  });
});

describe('the WhatsApp fallback link (built, off by default)', () => {
  it('decodes back to exactly the share text, Hebrew intact and the address on its own last line', () => {
    const text = textFor(fixture('invalid-detail-semantics.txt'));
    const href = whatsappHref(text);
    expect(href.startsWith('https://api.whatsapp.com/send?text=')).toBe(true);
    const decoded = decodeURIComponent(href.slice('https://api.whatsapp.com/send?text='.length));
    expect(decoded).toBe(text);
    expect(decoded).toContain('בדיקת מבנה של קובץ PCN874');
    expect(decoded.split('\n').at(-1)).toBe(SHARE_URL);
    expect(href).toContain('%0A');
    expect(href).not.toContain('wa.me');
  });

  it('stays off until an Android and an iOS device test is recorded', () => {
    const record = join(productRoot, WHATSAPP_DEVICE_TEST_RECORD);
    if (WHATSAPP_FALLBACK_ENABLED) {
      expect(existsSync(record), `${WHATSAPP_DEVICE_TEST_RECORD} must record the device tests before the fallback ships`).toBe(true);
      const t = readFileSync(record, 'utf8');
      expect(t).toMatch(/Android/);
      expect(t).toMatch(/iOS/);
    } else {
      expect(WHATSAPP_FALLBACK_ENABLED).toBe(false);
    }
  });
});
