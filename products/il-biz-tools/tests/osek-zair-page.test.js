// osek-zair.html: every number traces to a primary text, 2026 stays refused, and the page says what it is not.
//
// Three chains are proved here, all from files in the repository:
//   1. page -> config: every run of text with a digit in it (main, FAQ JSON-LD) is a config string the page renders
//      (a fact, a condition, a cite, the source line) or one of a few fixed strings that may restate only the rate,
//      the caps and the years; the title and descriptions restate only those too;
//   2. config -> capture: every number in a fact is in the quotes it cites, every quote from a text capture is at
//      the cited lines of that capture, every gazette quote (an image-only PDF) is in the dated read record, on the
//      pages it cites (page bounds from the record) and inside the section it names, and each capture is the bytes
//      the render stored (sha256 against its .meta.json);
//   3. build: the page ships as itself while osek-zair.json is verified, is withheld by the existing gate the day it
//      is not, and the unverified 2026 cap (osek-zair-unverified.json) never ships and is never loaded.
import { describe, it, expect, beforeAll, afterAll, afterEach, vi } from 'vitest';
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { join } from 'node:path';
import {
  OSEK_ZAIR_CONFIG as config,
  offeredYears,
  citeHe,
  citesHe,
  trackSourceLineHe,
} from '../src/lib/osek-zair.js';
import { formatILS } from '../src/lib/money.js';
import { dateHe } from '../src/lib/source-line.js';
import { PAGE_RATE_SOURCES, CONFIG_PUBLISH_RULES, aiDeclarationProblems } from '../src/lib/publish-gate.js';
import { AI_DECLARATION, FIGURES_CLAIM } from '../src/lib/ai-declaration.js';
import { textOf, elementById, faqDetails, faqJsonLd, jsonLdBlocks } from './helpers/html.js';
import { copyProduct, removeCopy, runBuild, listFiles, readIn, editIn, fillContact, productRoot } from './helpers/product-copy.js';
import { MASCULINE_SINGULAR, TAX_CLAIM } from './helpers/hebrew.js';

const PAGE = 'osek-zair.html';
const repoRoot = join(productRoot, '..', '..');
const read = (p) => readFileSync(join(productRoot, p), 'utf8');
const readRepo = (p) => readFileSync(join(repoRoot, p), 'utf8');
const html = read(PAGE);
const unverified = JSON.parse(read('src/config/osek-zair-unverified.json'));

/** The numbers in a text, as atoms: "120,000" -> 120000, "29.9.2026" -> 29, 9, 2026, "17(5א)" -> 17, 5. */
const atoms = (text) => {
  const out = new Set();
  for (const m of String(text).replace(/(\d),(?=\d{3}(?!\d))/g, '$1').matchAll(/\d+/g)) out.add(String(Number(m[0])));
  return out;
};
const atomsOf = (texts) => new Set(texts.flatMap((t) => [...atoms(t)]));
const missing = (needed, have) => [...needed].filter((a) => !have.has(a));

/** A capture line as the tests read it: bidi marks become spaces, whitespace collapses (as in the config's quotes). */
const norm = (s) => String(s).replace(/[‎‏‪-‮⁦-⁩﻿]/g, ' ').replace(/\s+/g, ' ').trim();
const linesOf = (path, [from, to]) => norm(readRepo(path).split('\n').slice(from - 1, to).join(' '));
/** A quote's parts: a quote may skip text with " … ". */
const fragments = (quote) => quote.split('…').map((f) => norm(f)).filter(Boolean);

const FACTS = Object.entries(config.facts);
const ALL_CITED = [
  ...FACTS.map(([id, f]) => [`facts.${id}`, f]),
  ...config.conditions.map((c) => [`conditions.${c.id}`, c]),
  ...Object.entries(config.pendingYears).map(([y, p]) => [`pendingYears.${y}`, p]),
];
const pagesOf = (cite) => cite.pages ?? [cite.page];
const GAZETTE_CITES = ALL_CITED.flatMap(([where, item]) => item.cite.filter((c) => c.doc === 'gazette').map((c) => [where, c]));

/** Every index of `needle` in `hay`. */
const occurrences = (hay, needle) => {
  const out = [];
  for (let i = hay.indexOf(needle); i >= 0; i = hay.indexOf(needle, i + 1)) out.push(i);
  return out;
};

/**
 * The gazette as the dated read record transcribes it, flattened, with where each printed page begins and ends.
 * The bounds are the config's (documents.gazette.recordPages, read off the page images); each bound must occur
 * exactly once in the transcription, in page order, or the spans below would not mean anything.
 */
const RECORD = norm(readRepo(config.check.record));
const GAZETTE_PAGES = config.documents.gazette.recordPages;
const PAGE_SPANS = (() => {
  const spans = {};
  let cursor = 0;
  for (const [page, { from, to }] of Object.entries(GAZETTE_PAGES).sort(([a], [b]) => Number(a) - Number(b))) {
    const start = RECORD.indexOf(from, cursor);
    const endAt = start < 0 ? -1 : RECORD.indexOf(to, start);
    spans[page] = { start, end: endAt < 0 ? -1 : endAt + to.length, from, to };
    cursor = Math.max(cursor, spans[page].end);
  }
  return spans;
})();
const TRANSCRIPT = (() => {
  const pages = Object.values(PAGE_SPANS);
  return { start: Math.min(...pages.map((p) => p.start)), end: Math.max(...pages.map((p) => p.end)) };
})();

describe('the documents: each is the capture the render stored', () => {
  for (const [id, doc] of Object.entries(config.documents)) {
    it(`${id}: the url, the bytes (sha256) and the capture file match the render's .meta.json`, () => {
      const meta = JSON.parse(readRepo(doc.meta));
      expect(meta.url).toBe(doc.url);
      expect(meta.sha256).toBe(doc.sha256);
      expect(meta.status).toBe(200);
      expect(createHash('sha256').update(readFileSync(join(repoRoot, meta.bodyPath))).digest('hex')).toBe(doc.sha256);
      expect(existsSync(join(repoRoot, doc.capture)), doc.capture).toBe(true);
      expect(doc.url.startsWith('https://www.capitax.co.il/')).toBe(true);
    });
  }

  it('the numbers in each document\'s name are in the capture\'s own identifying lines', () => {
    for (const [id, doc] of Object.entries(config.documents)) {
      const own = doc.idLines ? atoms(linesOf(doc.idText ?? doc.capture, doc.idLines)) : new Set();
      expect(missing(atoms(doc.he), own), id).toEqual([]);
    }
    expect(config.documents.gazette.idLines).toBeDefined();
    expect(config.documents.regulations.idLines).toBeDefined();
    expect(config.documents.draft.idLines).toBeDefined();
  });

  it('the draft regulations are named a draft, and the capture says so', () => {
    const draft = config.documents.draft;
    expect(draft.he.startsWith('טיוטת תקנות')).toBe(true);
    expect(linesOf(draft.capture, [60, 60])).toContain('טיוטת תקנות מטעם משרד האוצר');
    expect(draft.grade).toMatch(/draft/);
  });

  it('the gazette has no text layer: its .txt holds only the page headers, so its quotes come from the read record', () => {
    expect(config.documents.gazette.textLayer).toBe(false);
    expect(norm(readRepo(config.documents.gazette.idText))).toBe('171 31.5.2023 3045 31.5.2023 3045 172 173 31.5.2023 3045');
  });
});

describe('the check: a dated read, with a record that shows it', () => {
  const record = readRepo(config.check.record);

  it('a read on a date not in the future, and a source line that says so', () => {
    expect(config.check.how).toBe('read');
    expect(config.check.on).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(new Date(config.check.on).getTime()).toBeLessThanOrEqual(Date.now());
    expect(trackSourceLineHe()).toBe(
      `מקור: ${config.documents.gazette.he} ו${config.documents.report.he} (עותקים באתר capitax.co.il) · נבדק: ${dateHe(config.check.on)}`,
    );
  });

  it('the records carry the date, every document address and the figures', () => {
    expect(record).toContain(config.check.on);
    const both = `${record}\n${readRepo(config.check.review.record)}`;
    for (const doc of Object.values(config.documents)) expect(both, doc.url).toContain(doc.url);
    for (const figure of ['120,000', '30%', '25%']) expect(record).toContain(figure);
  });

  it('every gazette quote is in the record word for word (the PDF is an image; the record is where it was read)', () => {
    const flat = norm(record);
    for (const [where, item] of ALL_CITED) {
      for (const cite of item.cite.filter((c) => c.doc === 'gazette')) {
        for (const f of fragments(cite.quote)) expect(flat.includes(f), `${where}: "${f}"`).toBe(true);
      }
    }
  });

  it('the earlier read of 28.9.2026 is on record too', () => {
    expect(readRepo(config.check.earlier.record)).toContain(dateHe(config.check.earlier.on));
  });

  it('the review read of the same day is on record, with the pages it re-read', () => {
    const review = readRepo(config.check.review.record);
    expect(review).toContain(config.check.review.on);
    for (const page of Object.keys(GAZETTE_PAGES)) expect(review).toContain(page);
  });

  it('the record marks where each gazette page begins and ends, once each, in page order', () => {
    expect(Object.keys(GAZETTE_PAGES)).toEqual(['171', '172', '173']);
    for (const [page, span] of Object.entries(PAGE_SPANS)) {
      expect(span.start, `p.${page} from "${span.from}"`).toBeGreaterThanOrEqual(0);
      expect(span.end, `p.${page} to "${span.to}"`).toBeGreaterThan(span.start);
      for (const bound of [span.from, span.to]) {
        expect(occurrences(RECORD, bound).filter((i) => i >= TRANSCRIPT.start).length, `p.${page}: "${bound}"`).toBe(1);
      }
    }
    expect(PAGE_SPANS['171'].end).toBeLessThan(PAGE_SPANS['172'].start);
    expect(PAGE_SPANS['172'].end).toBeLessThanOrEqual(PAGE_SPANS['173'].start);
  });
});

describe('config -> capture: every figure in a fact is in the text it cites', () => {
  it('every quote from a text capture is at the cited lines', () => {
    for (const [where, item] of ALL_CITED) {
      for (const cite of item.cite.filter((c) => c.doc !== 'gazette')) {
        const doc = config.documents[cite.doc];
        expect(doc?.textLayer, `${where}: ${cite.doc}`).toBe(true);
        const text = linesOf(doc.capture, cite.lines);
        for (const f of fragments(cite.quote)) expect(text.includes(f), `${where}: ${doc.capture}:${cite.lines.join('-')} "${f}"`).toBe(true);
      }
    }
  });

  it('every gazette cite names a page the capture has', () => {
    const pages = atoms(readRepo(config.documents.gazette.idText));
    for (const [where, cite] of GAZETTE_CITES) {
      for (const p of pagesOf(cite)) expect(pages.has(String(p)), `${where}: page ${p}`).toBe(true);
      expect(cite.label, where).toMatch(/\S/);
    }
  });

  it('every gazette quote is on the pages it cites, and every page it cites holds part of it', () => {
    for (const [where, cite] of GAZETTE_CITES) {
      const pages = pagesOf(cite).map(String);
      pages.forEach((p, i) => i && expect(Number(p), `${where}: pages ${pages} are not consecutive`).toBe(Number(pages[i - 1]) + 1));
      const lo = PAGE_SPANS[pages[0]].start;
      const hi = PAGE_SPANS[pages[pages.length - 1]].end;
      const hits = fragments(cite.quote).map((f) => occurrences(RECORD, f).filter((i) => i >= lo && i + f.length <= hi).map((i) => [i, i + f.length]));
      hits.forEach((h, k) => expect(h.length, `${where} (${cite.label}): "${fragments(cite.quote)[k]}" is not on p.${pages.join('–')}`).toBeGreaterThan(0));
      for (const p of pages) {
        const { start, end } = PAGE_SPANS[p];
        expect(hits.some((h) => h.some(([a, b]) => a < end && b > start)), `${where} (${cite.label}): nothing quoted is on p.${p}`).toBe(true);
      }
    }
  });

  it('a gazette quote given with its section lies inside that section, and the label names it', () => {
    const header = /87[א-ת]\. /g;
    const withSection = GAZETTE_CITES.filter(([, c]) => c.section);
    expect(withSection.length).toBeGreaterThan(3);
    for (const [where, cite] of withSection) {
      expect(cite.label, where).toContain(cite.section);
      const starts = occurrences(RECORD, `${cite.section}. `).filter((i) => i >= TRANSCRIPT.start && i < TRANSCRIPT.end);
      expect(starts.length, `${where}: section ${cite.section} heads the record once`).toBe(1);
      header.lastIndex = starts[0] + 1;
      const next = header.exec(RECORD);
      const end = next && next.index < TRANSCRIPT.end ? next.index : TRANSCRIPT.end;
      for (const f of fragments(cite.quote)) {
        expect(occurrences(RECORD, f).some((i) => i > starts[0] && i + f.length <= end), `${where}: "${f}" outside ${cite.section}`).toBe(true);
      }
    }
  });

  it('a cite that names the Economic Efficiency Law comes with a text capture that names it (the gazette pages do not)', () => {
    const LAW = 'חוק ההתייעלות הכלכלית';
    expect(RECORD.slice(TRANSCRIPT.start, TRANSCRIPT.end)).not.toContain(LAW);
    let named = 0;
    for (const [where, item] of ALL_CITED) {
      if (!item.cite.some((c) => c.label?.includes(LAW))) continue;
      named += 1;
      expect(item.cite.some((c) => c.doc !== 'gazette' && c.quote.includes(LAW)), where).toBe(true);
    }
    expect(named).toBeGreaterThan(2);
  });

  it('every number in a fact is in its quotes, and every number in a cite\'s label is in that cite\'s quote or pages', () => {
    for (const [where, item] of ALL_CITED) {
      expect(item.cite.length, where).toBeGreaterThan(0);
      const quoted = atomsOf(item.cite.map((c) => c.quote));
      expect(missing(atoms(item.he), quoted), `${where}: ${item.he}`).toEqual([]);
      for (const cite of item.cite) {
        const own = atomsOf([cite.quote, cite.section ?? '', ...(cite.doc === 'gazette' ? pagesOf(cite).map(String) : [])]);
        expect(missing(atoms(cite.label ?? ''), own), `${where}: ${cite.label}`).toEqual([]);
      }
    }
  });

  it('the rate and the caps the calculation uses are the numbers the facts state', () => {
    expect(config.facts.rate.he).toContain(`${config.rate * 100}%`);
    expect(config.facts.yearOfExit.he).toContain(`${config.yearOfExitRate * 100}% מהסכום שבהגדרת "עוסק פטור"`);
    for (const [year, { cap }] of Object.entries(config.years)) {
      expect(config.facts.cap.he).toContain(cap.toLocaleString('en-US'));
      expect(config.facts.cap.he).toContain(year);
    }
  });

  it('"עוסק זעיר" is in none of the Tax Authority captures, as the name fact says', () => {
    for (const id of ['report', 'letter', 'regulations']) expect(readRepo(config.documents[id].capture), id).not.toContain('עוסק זעיר');
    for (const [, item] of ALL_CITED) for (const c of item.cite) expect(c.quote).not.toContain('עוסק זעיר');
  });
});

describe('2026: refused on the page, its unverified cap never shown and never shipped', () => {
  const cap2026 = unverified.years['2026'].cap;
  const forms = [String(cap2026), cap2026.toLocaleString('en-US'), formatILS(cap2026, { decimals: 0 })];

  it('the unverified file holds the 2026 cap and the VAT section, and says it is not verified', () => {
    expect(unverified.verified).toBe(false);
    expect(Object.keys(unverified.years)).toEqual(Object.keys(config.pendingYears));
    for (const y of Object.keys(config.pendingYears)) expect(config.years[y], y).toBeUndefined();
    expect(unverified.vatLawSense.section).toBe('31(3)');
  });

  it('the 2026 value is the osek patur ceiling of 2026, the amount the cap is tied to by statute (secondary grade)', () => {
    const osek = JSON.parse(read('src/config/osek-patur.json'));
    if (osek.year === 2026) expect(cap2026).toBe(osek.ceiling);
    expect(unverified.years['2026'].grade).toMatch(/secondary/);
  });

  it('the page, its script and the module never state it, and never cite the VAT section', () => {
    for (const f of [PAGE, 'assets/page-osek-zair.js', 'src/lib/osek-zair.js', 'src/config/osek-zair.json']) {
      const text = read(f);
      for (const form of forms) expect(text.includes(form), `${f} contains ${form}`).toBe(false);
      expect(text, f).not.toContain('31(3)');
    }
  });

  it('nothing the page loads names the unverified file', () => {
    for (const f of ['assets/page-osek-zair.js', 'src/lib/osek-zair.js', PAGE]) expect(read(f), f).not.toContain('osek-zair-unverified');
  });

  it('the year list offers 2026 as not computed, and the page picks a verified year by default', () => {
    const select = elementById(html, 'year');
    const options = [...select.matchAll(/<option value="([^"]+)"( selected)?>([^<]*)<\/option>/g)].map((m) => ({ value: m[1], selected: !!m[2], label: m[3] }));
    expect(options.map((o) => o.value)).toEqual(offeredYears().map((y) => y.year));
    for (const o of options) {
      const offered = offeredYears().find((y) => y.year === o.value);
      expect(o.label, o.value).toBe(offered.available ? o.value : `${o.value} – הכלי לא מחשב`);
    }
    expect(options.filter((o) => o.selected).map((o) => o.value)).toEqual([config.defaultYear]);
    expect(config.years[config.defaultYear]).toBeDefined();
  });

  it('the page states why 2026 is not computed, in the config\'s words, with its source', () => {
    const p = config.pendingYears['2026'];
    expect(textOf(html)).toContain(p.he);
    expect(textOf(html)).toContain(`מקור: ${citesHe(p.cite)}`);
  });
});

describe('page -> config: every number on the page is one the config renders', () => {
  const head = /<head>[\s\S]*?<\/head>/.exec(html)[0];
  const main = elementById(html, 'main');
  const metas = [...head.matchAll(/<meta (?:name|property)="(?:description|og:title|og:description)" content="([^"]*)"/g)].map((m) => m[1]);
  const title = /<title>([^<]*)<\/title>/.exec(head)[1];
  const ld = jsonLdBlocks(html).flatMap((b) => (b.mainEntity ?? []).flatMap((q) => [q.name, q.acceptedAnswer.text]));

  /** The only numbers a page-authored string may carry: the rates, the caps and the years, as the config has them. */
  const CORE = new Set(
    [config.rate * 100, config.yearOfExitRate * 100, ...Object.values(config.years).map((y) => y.cap), ...Object.keys(config.years), ...Object.keys(config.pendingYears)].map(String),
  );
  /** Page-authored strings with a digit in them: the lead, the h1, a table label, a question, one list item. */
  const FIXED = [
    'בדקו אם ניכוי של 30% מהמחזור משאיר לכם הכנסה חייבת נמוכה יותר מדיווח רגיל עם ההוצאות בפועל.',
    'תקרת המחזור של בעל עסק זעיר: 120,000 ₪ בשנות המס 2024 ו-2025.',
    'בעל עסק זעיר: ניכוי 30% מהמחזור או הוצאות בפועל?',
    'ניכוי במסלול בעל עסק זעיר (30% מהמחזור)',
    'מתי מסלול ה-30% מפסיד?',
    'הוא לא בודק את התנאים שלמעלה, לא מחשב מס ולא מחשב לשנת המס 2026.',
  ];
  /** Every config string the page renders, as it renders it. */
  const RENDERED = [
    ...FACTS.flatMap(([, f]) => [f.he, `מקור: ${citesHe(f.cite)}`]),
    ...config.conditions.map((c) => `${c.he} (${citesHe(c.cite)})`),
    ...Object.values(config.pendingYears).flatMap((p) => [p.he, `מקור: ${citesHe(p.cite)}`]),
    config.secondary.vatSense.he,
    trackSourceLineHe(),
  ];
  /** A text with every allowed string taken out, longest first: what is left was written on the page alone. */
  const leftover = (text) => [...RENDERED, ...FIXED].sort((a, b) => b.length - a.length).reduce((t, a) => t.split(a).join(' '), text);
  // The year <select> is checked option by option below (the year list test); its labels are bare years.
  const mainText = textOf(main.replace(elementById(main, 'year'), ''));

  it('every run of text with a digit in main and in the FAQ JSON-LD is a config string or a fixed string', () => {
    for (const [where, text] of [['main', mainText], ...ld.map((t) => ['JSON-LD', t])]) {
      const rest = leftover(text);
      expect(rest.match(/[^.?!:;()]*\d[^.?!:;()]*/g) ?? [], `${where}: ${text.slice(0, 80)}`).toEqual([]);
    }
  });

  it('the fixed strings are on the page, and restate only the rates, the caps and the years', () => {
    const everything = [mainText, ...ld].join(' ');
    for (const f of FIXED) {
      expect(everything, f).toContain(f);
      expect(missing(atoms(f), CORE), f).toEqual([]);
    }
  });

  it('the title and the descriptions restate only the rates, the caps and the years', () => {
    for (const text of [title, ...metas]) expect(missing(atoms(text), CORE), text).toEqual([]);
  });

  it('an invented figure anywhere in main fails the check (the check is not a pool of every number in the config)', () => {
    const invented = `${mainText} ברוב המקרים המסלול חוסך לכם 25% מהמס, ו-80% מהעסקים משלמים פחות מ-120,000 ₪.`;
    expect(leftover(invented)).toMatch(/\d/);
  });

  it('the page has numbers at all, so the check above is not vacuous', () => {
    expect(atoms(textOf(main)).size).toBeGreaterThan(10);
  });

  it('the lead states the rate and the cap with their years, and the source line sits right after it, linking the copies', () => {
    const lead = /<p class="lead">[\s\S]*?<\/p>/.exec(html)[0];
    expect(textOf(lead)).toContain(`${config.rate * 100}%`);
    expect(textOf(lead)).toContain('120,000 ₪');
    // Section 87ד(ג) lets someone registered on 1 January deduct in the year they cross the cap: no "only".
    expect(textOf(lead)).not.toMatch(/רק למחזור|פתוח רק/);
    for (const y of Object.keys(config.years)) expect(textOf(lead)).toContain(y);
    const line = elementById(html, 'track-source');
    expect(html.indexOf(line)).toBe(html.indexOf(lead) + lead.length + 3);
    expect(textOf(line)).toBe(trackSourceLineHe());
    for (const id of config.sourceLine) expect(line).toContain(`href="${config.documents[id].url}"`);
  });

  it('every fact the page relies on is on it word for word, with its sources', () => {
    const text = textOf(html);
    for (const [id, f] of FACTS) {
      expect(text, id).toContain(f.he);
      expect(text, id).toContain(`מקור: ${citesHe(f.cite)}`);
    }
  });

  it('the conditions list is the config\'s list, in order, each with its section and document', () => {
    const list = elementById(html, 'conditions');
    const items = [...list.matchAll(/<li>([\s\S]*?)<\/li>/g)].map((m) => textOf(m[1]));
    expect(items).toEqual(config.conditions.map((c) => `${c.he} (${citesHe(c.cite)})`));
  });

  it('the conditions the law sets that the task named are there: admissible books, the 25% related-party limit', () => {
    const ids = config.conditions.map((c) => c.id);
    expect(ids).toEqual(['resident', 'registered', 'employees', 'books', 'personal', 'employer', 'transparent', 'related', 'control', 'minister']);
    expect(config.conditions.find((c) => c.id === 'books').he).toContain('פנקסים קבילים');
    expect(config.conditions.find((c) => c.id === 'related').he).toMatch(/25%.*קרוב.*מעסיק.*בשלוש שנות המס הקודמות/);
  });

  it('the 25% condition keeps the statute\'s "from one of these" (87ה(א)(6)), not one pooled limit', () => {
    const related = config.conditions.find((c) => c.id === 'related').he;
    expect(related).toContain('התקבלו מאחד מאלה:');
    expect(related).not.toMatch(/קרוב שלכם \([^)]*\) או ממי/);
  });

  it('registration: the law\'s instruction to the officer is not told as a fact; the Authority\'s account and the deadline are', () => {
    const registered = config.conditions.find((c) => c.id === 'registered');
    expect(registered.he).not.toContain('עוסק פטור נרשם כך גם בלי להגיש בקשה');
    expect(registered.he).toContain('החוק מורה לפקיד השומה');
    expect(registered.he).toContain('לפי רשות המסים');
    expect(registered.he).toContain('סעיף 131');
    expect(registered.cite.some((c) => c.doc === 'report' && c.lines[0] === 548 && c.lines[1] === 553)).toBe(true);
  });

  it('the conditions intro names the 87ד(ג) exception instead of saying no condition may fail', () => {
    const conditions = /<h2>התנאים שהחוק קובע<\/h2>\s*<p>([\s\S]*?)<\/p>/.exec(html)[1];
    expect(textOf(conditions)).toContain('חוץ מהחריג לשנה שבה חדלתם להיות בעלי עסק זעיר');
  });
});

describe('what the page says it is not', () => {
  const text = textOf(html);

  it('never states a tax amount or a saving in tax, anywhere on the page (JSON-LD and head included)', () => {
    expect(textOf(html)).not.toMatch(TAX_CLAIM);
    expect(html).not.toMatch(TAX_CLAIM);
  });

  it('the turnover field says what turnover is (87ב), what the tool does not know about it, and the 87ז(א) power', () => {
    expect(textOf(/<label for="turnover">([\s\S]*?)<\/label>/.exec(html)[1])).toContain('כהגדרתו בחוק מע״מ');
    const hint = textOf(elementById(html, 'turnover-hint'));
    expect(hint).toContain(config.facts.turnover.he);
    expect(config.facts.turnover.he).toContain('לא קראנו');
    expect(hint).toContain(config.facts.turnoverDraft.he);
    expect(config.facts.turnoverDraft.he).toMatch(/טיוטה.*לא קראנו אם התקנות הותקנו/);
  });

  it('the table says it takes income from the business to equal the turnover entered, and why the gap does not move', () => {
    const note = textOf(elementById(html, 'table-assumption'));
    expect(note).toContain(config.facts.assumption.he);
    expect(note).toContain(`מקור: ${citesHe(config.facts.assumption.cite)}`);
  });

  it('the expenses hint keeps "ומס מקביל" and says plainly what the tool cannot tell (section 47א)', () => {
    const hint = textOf(elementById(html, 'expenses-hint'));
    expect(hint).toContain(config.facts.expensesHint.he);
    expect(config.facts.expensesHint.he).toContain('תשלומי ביטוח לאומי ומס מקביל');
    expect(config.facts.expensesHint.he).toMatch(/לא קראנו.*הכלי לא/);
  });

  it('"when does the 30% track lose?" also names 87ד(ב), on the page and in the JSON-LD, and the not-done list says so', () => {
    const q = 'מתי מסלול ה-30% מפסיד?';
    const visible = faqDetails(elementById(html, 'faq')).find((d) => d.question === q);
    for (const f of ['whenLoses', 'assetSale']) {
      expect(textOf(visible.answerHtml), f).toContain(config.facts[f].he);
      expect(faqJsonLd(html).get(q), f).toContain(config.facts[f].he);
    }
    const notDone = textOf(elementById(html, 'not-done'));
    expect(notDone).toContain('במכירת נכס ששימש בעסק');
    expect(notDone).toContain('כשהמחזור עולה על התקרה');
  });

  it('leaving the track: the rule and its 87ד(ג) clause, both with their sources', () => {
    const leaving = textOf(elementById(html, 'leaving'));
    for (const f of ['coolingOff', 'coolingOffYearOfExit']) {
      expect(leaving, f).toContain(`${config.facts[f].he} (מקור: ${citesHe(config.facts[f].cite)})`);
    }
  });

  it('the description claims nothing about what people search for', () => {
    const description = /<meta name="description" content="([^"]*)"/.exec(html)[1];
    expect(description).not.toMatch(/מחפשים/);
    expect(description).toContain("נקרא לפעמים 'עוסק זעיר'");
  });

  it('taxable income, not tax - and why, on the page', () => {
    const why = textOf(elementById(html, 'why-not-tax'));
    expect(why).toContain('הכלי מציג הכנסה חייבת ולא מס');
    expect(why).toContain(config.facts.threshold.he);
    expect(why).toContain(config.facts.personalCredits.he);
  });

  it('not an accountant, not tax advice', () => {
    expect(text).toContain('הכלי אינו ייעוץ מס ואינו מחליף רואה חשבון או יועץ מס.');
    const footer = /<footer class="site-footer">[\s\S]*?<\/footer>/.exec(html)[0];
    expect(textOf(footer)).toContain('המידע באתר אינו מהווה ייעוץ מס');
  });

  it('"עוסק זעיר" in VAT law is a different thing, said without a section number nobody read', () => {
    expect(text).toContain(config.facts.name.he);
    expect(text).toContain(config.secondary.vatSense.he);
    expect([...atoms(config.secondary.vatSense.he)]).toEqual([]);
  });

  it('"עוסק זעיר" appears only as the search phrase: in the description, the question about it and the two answers', () => {
    const q = 'האם "עוסק זעיר" הוא אותו דבר?';
    const allowed = [config.facts.name.he, config.secondary.vatSense.he, q];
    let rest = textOf(elementById(html, 'main'));
    for (const a of allowed) rest = rest.split(a).join('');
    expect(rest).not.toContain('עוסק זעיר');
    const title = /<title>([^<]*)<\/title>/.exec(html)[1];
    expect(title).not.toContain('עוסק זעיר');
  });

  it('never calls the track new, and never says the figures were checked against an official source', () => {
    expect(text).not.toMatch(/(?:מסלול|מעמד|רפורמה|מודל)\s+ה?חדש/);
    expect(html).not.toMatch(/מאומתים|יאומת|מול\s+ה?מקור\s+ה?רשמי/);
    expect(text).not.toContain(FIGURES_CLAIM);
  });

  it('runs in the browser and sends nothing: no network, no storage in what the page loads', () => {
    for (const f of ['assets/page-osek-zair.js', 'src/lib/osek-zair.js']) {
      expect(read(f), f).not.toMatch(/fetch\(|XMLHttpRequest|sendBeacon|WebSocket|EventSource|localStorage|sessionStorage|indexedDB|document\.cookie/);
    }
    expect(text).toContain('הכול מחושב בדפדפן שלכם: המספרים שתזינו לא נשמרים ולא נשלחים לשום מקום.');
  });

  it('addresses the reader in the plural, never in the masculine singular', () => {
    const main = textOf(elementById(html, 'main'));
    expect(main).not.toMatch(MASCULINE_SINGULAR);
    for (const t of jsonLdBlocks(html).flatMap((b) => (b.mainEntity ?? []).flatMap((q) => [q.name, q.acceptedAnswer.text]))) expect(t).not.toMatch(MASCULINE_SINGULAR);
    for (const s of [...FACTS.map(([, f]) => f.he), ...config.conditions.map((c) => c.he)]) expect(s).not.toMatch(MASCULINE_SINGULAR);
  });
});

describe('the FAQ and its JSON-LD', () => {
  it('each visible question has a JSON-LD twin with the same answer, and no twin is left over', () => {
    const visible = faqDetails(elementById(html, 'faq')).map((d) => [d.question, textOf(d.answerHtml)]);
    const ld = faqJsonLd(html);
    expect(visible.length).toBeGreaterThanOrEqual(5);
    expect([...ld.keys()]).toEqual(visible.map(([q]) => q));
    for (const [q, a] of visible) expect(ld.get(q), q).toBe(a);
  });

  it('the FAQ answers the questions the tool raises: the cap, when the 30% track loses, the name, filing, leaving', () => {
    const questions = faqDetails(elementById(html, 'faq')).map((d) => d.question);
    expect(questions).toEqual([
      'מהי תקרת המחזור לבעל עסק זעיר?',
      'מתי מסלול ה-30% מפסיד?',
      'האם "עוסק זעיר" הוא אותו דבר?',
      'האם בעל עסק זעיר פטור מדוח שנתי?',
      'מה קורה אם יוצאים מהמסלול?',
      'האם זה ייעוץ מס?',
    ]);
  });
});

describe('the site around it', () => {
  it('the AI declaration is in the footer, exactly, and nothing hides it', () => {
    expect(aiDeclarationProblems(html, { stylesheets: { 'assets/style.css': read('assets/style.css') } })).toEqual([]);
    expect(html).toContain(AI_DECLARATION);
  });

  it('the publish gate knows the page and its one verified config, and both configs ship only while verified', () => {
    expect(PAGE_RATE_SOURCES[PAGE]).toEqual(['src/config/osek-zair.json']);
    expect(CONFIG_PUBLISH_RULES['src/config/osek-zair.json']).toBe('verified');
    expect(CONFIG_PUBLISH_RULES['src/config/osek-zair-unverified.json']).toBe('verified');
  });

  it('the home page names the tool without its figures: index.html renders no config, so the gate could not withhold them', () => {
    const index = read('index.html');
    expect(PAGE_RATE_SOURCES['index.html']).toEqual([]);
    const card = /<a class="card tool-card" href="osek-zair\.html">([\s\S]*?)<\/a>/.exec(index)[1];
    expect(textOf(card)).not.toMatch(/\d/);
    expect(textOf(card)).not.toContain('מקור');
    const lead = textOf(/<p class="lead">([\s\S]*?)<\/p>/.exec(index)[1]);
    expect(lead).toContain('בעל עסק זעיר');
    expect(lead).not.toMatch(/2024|2025|30%|120,000/);
  });

  it('the home page lists it, the sitemap lists it, and every page with the main navigation links to it', () => {
    expect(read('index.html')).toMatch(/<a class="card tool-card" href="osek-zair\.html">/);
    expect(read('sitemap.xml')).toContain('<loc>https://il-biz-tools.netlify.app/osek-zair.html</loc>');
    for (const p of readdirSync(productRoot).filter((f) => f.endsWith('.html'))) {
      const src = read(p);
      if (!src.includes('aria-label="ניווט ראשי"')) continue;
      expect(src, p).toMatch(/<li><a href="osek-zair\.html"(?: aria-current="page")?>בעל עסק זעיר<\/a><\/li>/);
    }
    expect(html).toContain('<li><a href="osek-zair.html" aria-current="page">בעל עסק זעיר</a></li>');
  });

  it('npm run check:html checks it as a tool page and passes', () => {
    const r = spawnSync(process.execPath, [join(productRoot, 'scripts/check-html.js')], { encoding: 'utf8' });
    expect(r.status, r.stderr).toBe(0);
    expect(r.stdout).toContain(`ok ${PAGE}`);
  });
});

// No browser can be installed here, so the page script runs against a stub DOM built from the page's own ids, with
// every network and storage API trapped.
describe('the page script, against a stub DOM', () => {
  const script = read('assets/page-osek-zair.js');
  const selectors = [...new Set([...script.matchAll(/\$\('(#[\w-]+)'\)/g)].map((m) => m[1]))];

  function makeEl(id) {
    const listeners = {};
    return {
      id, value: '', textContent: '', className: '', hidden: false,
      addEventListener(type, fn) { (listeners[type] ??= []).push(fn); },
      fire(type) { for (const fn of listeners[type] ?? []) fn({ target: this, preventDefault() {} }); },
    };
  }

  async function load() {
    vi.resetModules();
    const els = new Map(selectors.map((s) => [s, makeEl(s)]));
    els.get('#year').value = config.defaultYear;
    const used = [];
    const trap = (name) => new Proxy(function () {}, {
      get: (_, key) => { used.push(`${name}.${String(key)}`); return undefined; },
      apply: () => { used.push(name); throw new Error(`${name} called`); },
    });
    for (const name of ['fetch', 'XMLHttpRequest', 'WebSocket', 'EventSource', 'localStorage', 'sessionStorage', 'indexedDB']) vi.stubGlobal(name, trap(name));
    vi.stubGlobal('navigator', { sendBeacon: trap('sendBeacon') });
    const initPage = vi.fn();
    vi.doMock('../assets/common.js', () => ({ initPage, $: (sel) => { if (!els.has(sel)) throw new Error(`no ${sel}`); return els.get(sel); } }));
    await import('../assets/page-osek-zair.js');
    const set = (sel, value) => { els.get(sel).value = value; els.get(sel).fire('input'); };
    return { el: (s) => els.get(s), set, used, initPage };
  }

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.doUnmock('../assets/common.js');
  });

  it('every element the script reaches for is an id on the page', () => {
    expect(selectors.length).toBeGreaterThan(5);
    for (const s of selectors) expect(html, s).toContain(`id="${s.slice(1)}"`);
  });

  it('asks for the turnover first, then compares; says when the 30% track loses; touches no network or storage', async () => {
    const page = await load();
    expect(page.initPage).toHaveBeenCalledOnce();
    expect(page.el('#cap-status').textContent).toBe('הזינו את מחזור העסקאות בשנה כדי לבדוק אותו מול התקרה.');
    expect(page.el('#verdict').hidden).toBe(true);
    page.set('#turnover', '100000');
    page.set('#expenses', '45000');
    expect(page.el('#cap-status').className).toBe('status-box ok');
    expect(page.el('#out-track').textContent).toBe(formatILS(70000, { decimals: 0 }));
    expect(page.el('#out-regular').textContent).toBe(formatILS(55000, { decimals: 0 }));
    expect(page.el('#out-by').textContent).toBe(formatILS(15000, { decimals: 0 }));
    expect(page.el('#verdict').hidden).toBe(false);
    expect(page.el('#verdict').className).toBe('status-box warn');
    expect(page.el('#verdict').textContent).toContain('מסלול בעל עסק זעיר מפסיד');
    expect(page.used).toEqual([]);
  });

  it('over the cap: no comparison; 2026: the refusal, and every cell empty', async () => {
    const page = await load();
    page.set('#turnover', String(config.years[config.defaultYear].cap + 1));
    page.set('#expenses', '0');
    expect(page.el('#cap-status').className).toBe('status-box over');
    expect(page.el('#out-track').textContent).toBe('—');
    page.set('#year', '2026');
    expect(page.el('#cap-status').textContent).toBe(config.pendingYears['2026'].he);
    for (const s of ['#out-deduction', '#out-track', '#out-regular', '#out-by']) expect(page.el(s).textContent, s).toBe('—');
    expect(page.el('#verdict').hidden).toBe(true);
    expect(page.used).toEqual([]);
  });
});

describe('the build', () => {
  const copies = [];
  const fresh = () => {
    const dir = copyProduct();
    copies.push(dir);
    fillContact(dir);
    return dir;
  };
  afterAll(() => copies.forEach(removeCopy));

  let site;
  beforeAll(() => {
    const dir = fresh();
    const r = runBuild(dir);
    if (r.status !== 0) throw new Error(`build failed: ${r.stderr}`);
    site = join(dir, '_site');
  });

  it('ships the page as itself, with its module and its verified config, and lists it in the sitemap', () => {
    const files = listFiles(site);
    const built = readIn(site, PAGE);
    expect(built).toContain('id="track-source"');
    expect(built).not.toContain('לא מאומת');
    for (const f of ['assets/page-osek-zair.js', 'src/lib/osek-zair.js', 'src/config/osek-zair.json']) expect(files, f).toContain(f);
    expect(readIn(site, 'sitemap.xml')).toContain('osek-zair.html');
  });

  it('never ships the unverified file, and no shipped page, script or config states the 2026 cap', () => {
    const files = listFiles(site);
    expect(files).not.toContain('src/config/osek-zair-unverified.json');
    const cap2026 = unverified.years['2026'].cap;
    for (const f of [PAGE, 'assets/page-osek-zair.js', 'src/lib/osek-zair.js', 'src/config/osek-zair.json']) {
      const text = readIn(site, f);
      for (const form of [String(cap2026), cap2026.toLocaleString('en-US')]) expect(text.includes(form), `${f}: ${form}`).toBe(false);
    }
  });

  it('the day osek-zair.json is not verified, the existing gate withholds the page and drops it from the sitemap', () => {
    const dir = fresh();
    editIn(dir, 'src/config/osek-zair.json', (s) => s.replace('"verified": true', '"verified": false'));
    const r = runBuild(dir);
    expect(r.status, r.stderr).toBe(0);
    const out = join(dir, '_site');
    const withheld = readIn(out, PAGE);
    expect(withheld).toContain('לא מאומת');
    expect(withheld).not.toContain('120,000');
    expect(withheld).not.toContain('30%');
    // The notice takes the page title up to its first "–": nothing before it may carry a figure or a year.
    expect(/<title>([^<]*)<\/title>/.exec(withheld)[1]).not.toMatch(/\d/);
    expect(textOf(/<h1>([\s\S]*?)<\/h1>/.exec(withheld)[1])).not.toMatch(/\d/);
    expect(readIn(out, 'sitemap.xml')).not.toContain('osek-zair.html');
    expect(listFiles(out)).not.toContain('src/config/osek-zair.json');
    expect(r.stdout).toContain('withheld osek-zair.html');
  });

  it('a shipped script that loads the unverified file stops the build', () => {
    const dir = fresh();
    editIn(dir, 'assets/page-osek-zair.js', (s) => `${s}\nexport const leak = () => fetch('src/config/osek-zair-unverified.json');\n`);
    const r = runBuild(dir);
    expect(r.status).toBe(1);
    expect(r.stderr).toContain('src/config/osek-zair-unverified.json');
  });
});
