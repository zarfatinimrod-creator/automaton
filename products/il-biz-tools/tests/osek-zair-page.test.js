// osek-zair.html: every number traces to a primary text, 2026 stays refused, and the page says what it is not.
//
// Three chains are proved here, all from files in the repository:
//   1. page -> config: every number the page shows (title, description, main, FAQ JSON-LD) is a number in a
//      config string the page renders (a fact, a condition, a cite, the source line, a year);
//   2. config -> capture: every number in a fact is in the quotes it cites, every quote from a text capture is at
//      the cited lines of that capture, every gazette quote (an image-only PDF) is in the dated read record, and
//      each capture is the bytes the render stored (sha256 against its .meta.json);
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
import { MASCULINE_SINGULAR } from './helpers/hebrew.js';

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
    const gz = config.documents.gazette;
    expect(missing(atoms(gz.he), atoms(linesOf(gz.idText, gz.idLines))), 'gazette').toEqual([]);
    const regs = config.documents.regulations;
    expect(missing(atoms(regs.he), atoms(linesOf(regs.capture, regs.idLines))), 'regulations').toEqual([]);
    for (const id of ['report', 'letter']) expect([...atoms(config.documents[id].he)], id).toEqual([]);
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

  it('the record carries the date, every document address and the figures', () => {
    expect(record).toContain(config.check.on);
    for (const doc of Object.values(config.documents)) expect(record, doc.url).toContain(doc.url);
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
    for (const [where, item] of ALL_CITED) {
      for (const cite of item.cite.filter((c) => c.doc === 'gazette')) {
        for (const p of pagesOf(cite)) expect(pages.has(String(p)), `${where}: page ${p}`).toBe(true);
        expect(cite.label, where).toMatch(/\S/);
      }
    }
  });

  it('every number in a fact is in its quotes, and every number in a cite\'s label is in that cite\'s quote or pages', () => {
    for (const [where, item] of ALL_CITED) {
      expect(item.cite.length, where).toBeGreaterThan(0);
      const quoted = atomsOf(item.cite.map((c) => c.quote));
      expect(missing(atoms(item.he), quoted), `${where}: ${item.he}`).toEqual([]);
      for (const cite of item.cite) {
        const own = atomsOf([cite.quote, ...(cite.doc === 'gazette' ? pagesOf(cite).map(String) : [])]);
        expect(missing(atoms(cite.label ?? ''), own), `${where}: ${cite.label}`).toEqual([]);
      }
    }
  });

  it('the rate and the caps the calculation uses are the numbers the facts state', () => {
    expect(config.facts.rate.he).toContain(`${config.rate * 100}%`);
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

  const rendered = [
    ...FACTS.map(([, f]) => f.he),
    ...config.conditions.map((c) => c.he),
    ...ALL_CITED.flatMap(([, item]) => item.cite.map((c) => citeHe(c))),
    ...Object.values(config.pendingYears).map((p) => p.he),
    ...Object.values(config.documents).map((d) => d.he),
    trackSourceLineHe(),
    ...offeredYears().map((y) => y.year),
    config.secondary.vatSense.he,
  ];

  it('the title, the description, the main content and the FAQ JSON-LD hold no number the config does not render', () => {
    const have = atomsOf(rendered);
    for (const [where, text] of [['title', title], ...metas.map((m) => ['meta', m]), ['main', textOf(main)], ...ld.map((t) => ['JSON-LD', t])]) {
      expect(missing(atoms(text), have), `${where}: ${text.slice(0, 120)}`).toEqual([]);
    }
  });

  it('the page has numbers at all, so the check above is not vacuous', () => {
    expect(atoms(textOf(main)).size).toBeGreaterThan(10);
  });

  it('the lead states the rate and the cap with their years, and the source line sits right after it, linking the copies', () => {
    const lead = /<p class="lead">[\s\S]*?<\/p>/.exec(html)[0];
    expect(textOf(lead)).toContain(`${config.rate * 100}%`);
    expect(textOf(lead)).toContain('120,000 ₪');
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
});

describe('what the page says it is not', () => {
  const text = textOf(html);

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
    expect(readIn(out, PAGE)).toContain('לא מאומת');
    expect(readIn(out, PAGE)).not.toContain('120,000');
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
