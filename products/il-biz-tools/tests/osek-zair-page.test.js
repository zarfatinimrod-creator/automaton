// osek-zair.html: every number traces to the text it was read in, 2026 computes from nevo's consolidated VAT law (and
// the page says that is what the text is), later years stay refused, and the page says what it is not.
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
//      is not, and the unverified file (osek-zair-unverified.json) never ships and is never loaded.
import { describe, it, expect, beforeAll, afterAll, afterEach, vi } from 'vitest';
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { basename, join } from 'node:path';
import {
  OSEK_ZAIR_CONFIG as config,
  compareTracks,
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
      // A copy says where it is copied (the source line names the site); the one document that is not a copy is
      // nevo's consolidated VAT law, and its name says whose text it is.
      if (doc.copyOn) expect(doc.url.startsWith(`https://www.${doc.copyOn}/`), id).toBe(true);
      else expect(doc.url.startsWith('https://www.nevo.co.il/') && doc.he.includes('נבו'), id).toBe(true);
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
    expect(config.documents.vatLaw.idLines).toBeDefined();
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
      `מקור: ${config.documents.gazette.he} ו${config.documents.report.he} (עותקים באתר capitax.co.il); ${config.documents.vatLaw.he} · נבדק: ${dateHe(config.check.on)}`,
    );
  });

  it('the records carry the date, every document address and the figures', () => {
    expect(record).toContain(config.check.on);
    const both = `${record}\n${readRepo(config.check.review.record)}\n${readRepo(config.check.vatLaw.record)}`;
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

  it('the read of nevo\'s VAT law is on record: its date, address, capture, stamp, lines and the amount', () => {
    const r = readRepo(config.check.vatLaw.record);
    expect(r).toContain(config.check.vatLaw.on);
    const doc = config.documents.vatLaw;
    const file = basename(doc.capture);
    for (const s of [doc.url, doc.capture, '13-07-2026', '122,833']) expect(r, s).toContain(s);
    for (const line of [3, 89, 93, 484, 610, 782, 1637]) expect(r, `${file}:${line}`).toContain(`${file}:${line}`);
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

  it('"עוסק זעיר" is in none of the Tax Authority captures, as the name fact says; only the VAT-law fact quotes it', () => {
    for (const id of ['report', 'letter', 'regulations']) expect(readRepo(config.documents[id].capture), id).not.toContain('עוסק זעיר');
    for (const [where, item] of ALL_CITED) {
      for (const c of item.cite) {
        if (c.quote.includes('עוסק זעיר')) expect([where, c.doc], c.quote).toEqual(['facts.vatSense', 'vatLaw']);
      }
    }
  });
});

describe('2026: computed with the cap nevo\'s consolidated VAT law states, and the page says what that text is', () => {
  const vat = config.documents.vatLaw;
  const cap2026 = config.years['2026'].cap;
  const capture = readRepo(vat.capture).split('\n');

  it('the 2026 cap is the amount in the VAT law\'s "עוסק פטור" definition, at the line the config cites', () => {
    const def = config.facts.cap.cite.find((c) => c.doc === 'vatLaw');
    const line = norm(capture[def.lines[1] - 1]);
    expect(line.startsWith('" עוסק פטור " –'), line).toBe(true);
    const m = /אינו עולה על ([\d,]+) שקלים חדשים לשנה/.exec(line);
    expect(m, line).not.toBeNull();
    expect(Number(m[1].replace(/,/g, ''))).toBe(cap2026);
    expect(config.facts.cap2026.cite[0]).toEqual(def);
  });

  it('the capture is the VAT law with nevo\'s own stamp, and the document\'s name and grade say whose text it is', () => {
    expect(vat.url).toBe('https://www.nevo.co.il/law_html/law01/271_001.htm');
    expect(norm(capture[0])).toBe('חוק מס ערך מוסף, תשל"ו-1975');
    expect(norm(capture[2])).toBe('נוסח עדכני נכון ליום: 13-07-2026');
    expect(vat.he).toContain('נוסח משולב של אתר נבו');
    expect(vat.he).toContain('13-07-2026');
    expect(vat.copyOn).toBeUndefined();
    expect(vat.grade).toMatch(/not the official text/);
  });

  it('section 126(א) of the same text indexes the amount every 1 January, and the 2026 statement cites it', () => {
    const c126 = config.facts.cap2026.cite.find((c) => c.label === 'סעיף 126(א)');
    expect(c126.doc).toBe('vatLaw');
    expect(linesOf(vat.capture, c126.lines)).toContain('בהגדרה "עוסק פטור" ובסעיף 35 או לפיהם יותאמו ב-1 בינואר של כל שנה');
  });

  it('the 2026 cap is the osek patur ceiling while osek-patur.json is on 2026, the amount the cap is tied to by 87ב(1)', () => {
    const osek = JSON.parse(read('src/config/osek-patur.json'));
    // osek-patur.json moves to the next year's ceiling each January; from then on this comparison does not apply,
    // and the 2026 cap stays proved by the capture line (the test above), not by the tracker.
    if (osek.year === 2026) expect(cap2026).toBe(osek.ceiling);
    expect(config.facts.cap.cite[0].quote).toContain('הסכום הקבוע בהגדרה "עוסק פטור" שבסעיף 1 לחוק מס ערך מוסף');
  });

  it('the capture cited is a dated copy the weekly render never rewrites, byte for byte the render of 29.9.2026', () => {
    const meta = JSON.parse(readRepo(vat.meta));
    expect(basename(vat.capture)).toBe('nevo-vat-law-2026-09-29.txt');
    expect(meta.textPath).toBe(vat.capture);
    expect(meta.slug).toBe('nevo-vat-law-2026-09-29');
    expect(meta.frozen.on).toBe('2026-09-29');
    expect(meta.frozen.from).toBe('research/rendered/nevo-vat-law.meta.json');
    const lines = readRepo('research/rendered/urls.txt').split('\n').filter((l) => l.trim());
    const watched = lines.filter((l) => !l.trim().startsWith('#')).map((l) => l.trim().split(/\s+/)[1]);
    // A paused line keeps its URL and slug after the reason: "# paused (…) — <url>\t<slug>".
    const listed = lines.map((l) => l.trim().split(/\s+/).pop());
    expect(watched).not.toContain(meta.slug);
    expect(listed).not.toContain(meta.slug);
    // The live capture stays listed, so a render may rewrite it: active, or paused until nevo's
    // robots.txt is read (research/channel-loop/RULING-2026-09-30-video.md 16(d) D2(v)).
    const live = lines.find((l) => l.trim().split(/\s+/).pop() === 'nevo-vat-law');
    expect(live, 'nevo-vat-law line').toBeDefined();
    if (live.trim().startsWith('#')) expect(live).toMatch(/^# paused \(NO_TERMS, exhaustive-negative; waits on robots\.txt support, ruling 30\.9 16\(d\) D2\(v\)\)/);
    // No cite, record or note of this page points at the live capture, which the weekly render rewrites.
    for (const f of ['src/config/osek-zair.json', 'src/config/osek-zair-unverified.json', 'src/config/osek-patur.json']) {
      expect(read(f), f).not.toMatch(/nevo-vat-law\.(?:txt|html|meta\.json)/);
    }
  });

  it('2026 is the one figure accepted from a text that is not primary: it says so, names the primary check still owed, and the rule stays', () => {
    const y = config.years['2026'];
    expect(y.grade).toMatch(/not a primary text/);
    expect(y.grade).toContain('logs/2026-09-29-osek-zair-2026.md');
    expect(y.toVerify).toMatch(/Reshumot/);
    expect(y.toVerify).toMatch(/Tax Authority/);
    for (const year of ['2024', '2025']) expect(Object.keys(config.years[year]), year).toEqual(['cap']);
    expect(unverified.about).toContain('only when a rendered primary text states it');
    expect(unverified.about).toContain('years.2026.toVerify');
    expect(config.about).toContain('years.2026.toVerify');
    expect(readRepo(config.check.vatLaw.record)).toContain('years.2026.toVerify');
  });

  it('the page states the 2026 cap with the nevo source, says the text is nevo\'s consolidation and not the official publication, and links it', () => {
    expect(citesHe(config.facts.cap.cite)).toContain(vat.he);
    expect(textOf(elementById(html, 'cap-2026'))).toBe(`${config.facts.cap2026.he} (מקור: ${citesHe(config.facts.cap2026.cite)})`);
    expect(config.facts.cap2026.he).toContain('נוסח משולב שמפרסם אתר נבו');
    expect(config.facts.cap2026.he).toContain('נוסח עדכני נכון ליום 13-07-2026');
    expect(config.facts.cap2026.he).toContain('זה לא הפרסום הרשמי ברשומות');
    expect(elementById(html, 'track-source')).toContain(`<a href="${vat.url}">${vat.he}</a>`);
  });

  it('the minister\'s power to set a higher amount comes with what was not read, as the rate order does', () => {
    expect(config.facts.cap2026.he).toContain('ושר האוצר רשאי לקבוע סכום גבוה יותר; קביעה כזו לא קראנו.');
    expect(config.facts.cap2026.he).toContain('צו כזה לא קראנו.');
  });

  it('no line on the page or the home page says the tool does not compute 2026', () => {
    const text = textOf(html);
    expect(text).not.toMatch(/2026 – הכלי לא מחשב|לשנת המס 2026 הכלי לא מחשב|לא מחשב לשנת המס 2026/);
    expect(text).not.toContain('לא מופיע באף אחד מהמסמכים שקראנו');
    expect(textOf(read('index.html'))).not.toMatch(/לא מחשב(?:ת)? לשנת (?:המס )?2026/);
  });

  it('the year list offers 2026, 2025 and 2024, none marked as not computed, and the default stays 2025', () => {
    const select = elementById(html, 'year');
    const options = [...select.matchAll(/<option value="([^"]+)"( selected)?>([^<]*)<\/option>/g)].map((m) => ({ value: m[1], selected: !!m[2], label: m[3] }));
    expect(options.map((o) => o.value)).toEqual(offeredYears().map((y) => y.year));
    expect(options.map((o) => o.value)).toEqual(['2026', '2025', '2024']);
    for (const o of options) expect(o.label, o.value).toBe(o.value);
    expect(options.filter((o) => o.selected).map((o) => o.value)).toEqual([config.defaultYear]);
    expect(config.defaultYear).toBe('2025');
  });

  it('a later year stays refused: not offered, refused by the module, and the page says so', () => {
    expect(offeredYears().map((y) => y.year)).not.toContain('2027');
    expect(compareTracks({ year: '2027', turnover: 1, expenses: 0 })).toEqual({ status: 'refused', year: '2027', reason: 'unknown' });
    expect(textOf(elementById(html, 'not-done'))).toContain('לא מחשב לשנות המס שאחרי 2026');
    expect(faqJsonLd(html).get('מהי תקרת המחזור לבעל עסק זעיר?')).toMatch(/לשנות המס שאחרי 2026 הכלי לא מחשב\.$/);
  });

  it('the unverified file keeps the VAT section reference the capture contradicts for the law (31(3) is about עוסק פטור), says it is not verified, and nothing loads it', () => {
    expect(unverified.verified).toBe(false);
    expect(unverified.years).toBeUndefined();
    expect(unverified.vatLawSense.section).toBe('31(3)');
    // What the capture shows, and what the entry now says about it.
    expect(linesOf(vat.capture, [484, 484])).toContain('(3) עסקאות של עוסק פטור');
    expect(linesOf(vat.capture, [89, 89])).toBe('"עוסק זעיר" – (נמחקה)');
    for (const field of ['grade', 'why']) expect(unverified.vatLawSense[field], field).not.toContain('no capture of the VAT law');
    expect(unverified.vatLawSense.grade).toContain('contradicted by a rendered text');
    expect(unverified.vatLawSense.why).toContain('line 484');
    expect(unverified.vatLawSense.why).toContain('line 89');
    expect(unverified.vatLawSense.toVerify).not.toMatch(/Render a primary copy of the VAT law/);
    expect(unverified.vatLawSense.toVerify).toContain('nevo-vat-registration-regs');
    for (const f of [PAGE, 'assets/page-osek-zair.js', 'src/lib/osek-zair.js', 'src/config/osek-zair.json']) expect(read(f), f).not.toContain('31(3)');
    for (const f of ['assets/page-osek-zair.js', 'src/lib/osek-zair.js', PAGE]) expect(read(f), f).not.toContain('osek-zair-unverified');
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
  /** Page-authored strings with a digit in them: the lead, the h1, a table label, a question, one list item, and the
   *  sentence that closes the cap answer. */
  const FIXED = [
    'בדקו אם ניכוי של 30% מהמחזור משאיר לכם הכנסה חייבת נמוכה יותר מדיווח רגיל עם ההוצאות בפועל.',
    'תקרת המחזור של בעל עסק זעיר: 120,000 ₪ בשנות המס 2024 ו-2025, ו-122,833 ₪ בשנת המס 2026.',
    'בעל עסק זעיר: ניכוי 30% מהמחזור או הוצאות בפועל?',
    'ניכוי במסלול בעל עסק זעיר (30% מהמחזור)',
    'מתי מסלול ה-30% מפסיד?',
    'הוא לא בודק את התנאים שלמעלה, לא מחשב מס ולא מחשב לשנות המס שאחרי 2026.',
    'לשנות המס שאחרי 2026 הכלי לא מחשב.',
  ];
  /** Every config string the page renders, as it renders it. */
  const RENDERED = [
    ...FACTS.flatMap(([, f]) => [f.he, `מקור: ${citesHe(f.cite)}`]),
    ...config.conditions.map((c) => `${c.he} (${citesHe(c.cite)})`),
    ...Object.values(config.pendingYears).flatMap((p) => [p.he, `מקור: ${citesHe(p.cite)}`]),
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
    for (const { cap } of Object.values(config.years)) expect(textOf(lead)).toContain(`${cap.toLocaleString('en-US')} ₪`);
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

  it('"עוסק זעיר" in the VAT law: what nevo\'s text shows, cited to its lines, and nothing the capture contradicts', () => {
    const vat = config.documents.vatLaw;
    const capture = readRepo(vat.capture).split('\n');
    // The phrase is at exactly three lines of the capture: the deleted definition and two headings over repealed
    // sections. The fact says "only in three places", so a fourth would make it false.
    const at = capture.flatMap((l, i) => (norm(l).includes('עוסק זעיר') ? [i + 1] : []));
    expect(at).toEqual([89, 610, 782]);
    expect(norm(capture[88])).toBe('"עוסק זעיר" – (נמחקה)');
    expect(norm(capture[610])).toBe('42. (בוטל)');
    expect(norm(capture[782])).toBe('57. (בוטל)');
    const fact = config.facts.vatSense;
    expect(fact.cite.map((c) => [c.doc, ...c.lines])).toEqual([['vatLaw', 7, 89], ['vatLaw', 610, 611], ['vatLaw', 782, 783]]);
    expect(fact.he).toContain('מופיע רק בשלושה מקומות');
    expect(fact.he).toContain('"(נמחקה)"');
    expect(fact.he).toContain('"(בוטל)"');
    expect(fact.he).not.toContain('31');
    expect(text).toContain(config.facts.name.he);
    expect(text).toContain(`${fact.he} (מקור: ${citesHe(fact.cite)})`);
    expect(config.secondary).toBeUndefined();
  });

  it('the page never says the VAT law was not read while it cites and links it', () => {
    for (const t of [text, ...faqJsonLd(html).values()]) {
      expect(t).not.toContain('את נוסח חקיקת המע״מ עצמו לא קראנו');
      expect(t).not.toContain('את ההגדרה בחוק מס ערך מוסף עצמו לא קראנו');
      expect(t).not.toContain('הוא גם מונח בחקיקת המע״מ');
    }
    // The turnover note says which of nevo's lines were read, and that the turnover definition is not one of them.
    expect(config.facts.turnover.he).toContain('קראנו רק את השורות שהדף הזה מצטט');
    expect(config.facts.turnover.he).toContain('ואת ההגדרה של מחזור עסקאות לא קראנו');
  });

  it('"עוסק זעיר" appears only as the search phrase: in the description, the question about it and the two answers', () => {
    const q = 'האם "עוסק זעיר" הוא אותו דבר?';
    const allowed = [config.facts.name.he, config.facts.vatSense.he, q];
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
    expect(lead).not.toMatch(/2024|2025|30%|120,000|122,833/);
    // Nor which years the tool covers: the gate can withhold the page but not this sentence, so the lead leaves the
    // tool out of its "updated for 2026" and sends the reader to the page.
    expect(lead).not.toMatch(/כולל הבדיקה של בעל עסק זעיר/);
    expect(lead).toContain('חוץ מהבדיקה של בעל עסק זעיר, שאומרת בדף שלה לאילו שנות מס היא מחשבת');
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

  it('over the 2025 cap: no comparison; the same turnover in 2026 is within its cap and compares; 2027: refused, every cell empty', async () => {
    const page = await load();
    const turnover = config.years[config.defaultYear].cap + 1;
    page.set('#turnover', String(turnover));
    page.set('#expenses', '0');
    expect(page.el('#cap-status').className).toBe('status-box over');
    expect(page.el('#out-track').textContent).toBe('—');
    page.set('#year', '2026');
    const r = compareTracks({ year: '2026', turnover, expenses: 0 });
    expect(r.status).toBe('compared');
    const ils = (n) => formatILS(n, { decimals: Number.isInteger(n) ? 0 : 2 });
    expect(page.el('#cap-status').className).toBe('status-box ok');
    expect(page.el('#cap-status').textContent).toContain(`(${ils(config.years['2026'].cap)})`);
    expect(page.el('#out-deduction').textContent).toBe(ils(r.deduction));
    expect(page.el('#out-track').textContent).toBe(ils(r.trackTaxable));
    expect(page.el('#verdict').hidden).toBe(false);
    // A year the list does not offer (a stub can set any value): refused in words, nothing computed.
    page.set('#year', '2027');
    expect(page.el('#cap-status').textContent).toBe('לשנת המס 2027 אין בכלי נתונים, ולכן הוא לא מחשב.');
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

  it('never ships the unverified file; the 2026 cap ships in the verified config and on the page, with its nevo link', () => {
    const files = listFiles(site);
    expect(files).not.toContain('src/config/osek-zair-unverified.json');
    const shipped = JSON.parse(readIn(site, 'src/config/osek-zair.json'));
    expect(shipped.years['2026'].cap).toBe(config.years['2026'].cap);
    const built = readIn(site, PAGE);
    expect(built).toContain(`${config.years['2026'].cap.toLocaleString('en-US')} ₪`);
    expect(built).toContain(`href="${config.documents.vatLaw.url}"`);
    for (const f of [PAGE, 'assets/page-osek-zair.js', 'src/lib/osek-zair.js']) expect(readIn(site, f), f).not.toContain('osek-zair-unverified');
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
    expect(withheld).not.toContain('122,833');
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
