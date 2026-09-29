// The AI declaration on every page the site ships.
//
// The constitution: "You must never deny what you are. Never misrepresent your actions." MISSION rule 4:
// nothing that deceives a buyer. The site and its tools are written and kept up by AI agents working for the
// brand מהודק, and until 29.9.2026 no page said so (logs/2026-09-28-tiktok-now-actions.md flagged it).
//
// Two things are proved here, both against the real build run in a throwaway copy:
//   1. every HTML page that ships - the real pages, a withheld page's notice, the 404 - carries the one
//      declaration in its site footer, visible, word for word, and the publish stops when one does not;
//   2. the declaration and the FAQ answer that expands it make no claim outside ALLOWED_CLAIMS below, and each
//      allowed claim is re-checked against what actually ships. The allowlist lives here, not in the module
//      that holds the text, so changing what the site claims means changing this file on purpose.
//
// The review of 29.9.2026 found four holes, each pinned by a test below: the withheld page's notice implied the
// other tools were verified against the official source; a CSS class (print-only), a hidden child element, an
// inline style or a closed <details> hid the line and the gate passed it; the FAQ's figures sentence stayed as it
// was when a page it names shipped as a withheld notice; and the figures gate switched itself off when one word
// of the sentence changed, and accepted any line starting "מקור: ".
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import {
  AI_DECLARATION,
  AI_DECLARATION_ATTR,
  AI_DECLARATION_HTML,
  WHO_BUILDS_ID,
  WHO_BUILDS_QUESTION,
  WHO_BUILDS_ANSWER,
  whoBuildsAnswer,
  FIGURES_SOURCE_SENTENCE,
  figuresSourceSentence,
  FIGURE_SOURCE_PAGES,
  NOT_TAX_ADVICE,
  BRAND_HE,
} from '../src/lib/ai-declaration.js';
import {
  aiDeclarationProblems,
  figureSourceProblems,
  withShippedFiguresSentence,
  declarationScriptProblems,
  withheldPageHtml,
  PAGE_RATE_SOURCES,
} from '../src/lib/publish-gate.js';
import { sourceLineHe } from '../src/lib/source-line.js';
import { cssRules } from '../src/lib/a11y-check.js';
import { copyProduct, removeCopy, runBuild, listFiles, readIn, editIn, fillContact, productRoot } from './helpers/product-copy.js';
import { textOf, elementById, faqDetails, faqJsonLd, jsonLdBlocks, ancestorsAt } from './helpers/html.js';

const read = (p) => readFileSync(join(productRoot, p), 'utf8');
const sourcePages = readdirSync(productRoot).filter((f) => f.endsWith('.html')).sort();

/** The stylesheets the pages link, as the gate takes them: published path -> CSS text. */
const STYLES = { 'assets/style.css': read('assets/style.css') };
/** The same, from a built directory. */
const stylesIn = (dir) => Object.fromEntries(listFiles(dir).filter((f) => f.endsWith('.css')).map((f) => [f, readIn(dir, f)]));

const FIGURE_PAGES = Object.keys(FIGURE_SOURCE_PAGES);
/** Every set of figure pages that could ship as themselves, from none to all three. */
const SUBSETS = FIGURE_PAGES.reduce((acc, page) => [...acc, ...acc.map((s) => [...s, page])], [[]]);

/** Rate configs as the build reads them, by path. */
const sourceConfigs = () => Object.fromEntries([...new Set(Object.values(PAGE_RATE_SOURCES).flat())].map((p) => [p, JSON.parse(read(p))]));

const copies = [];
const fresh = () => {
  const dir = copyProduct();
  copies.push(dir);
  return dir;
};
afterAll(() => copies.forEach(removeCopy));

/** Sentences of a Hebrew paragraph: split after . ? or ! followed by white space. */
const sentences = (text) => text.split(/(?<=[.?!])\s+/).map((s) => s.trim()).filter(Boolean);

/**
 * Everything the declaration may say, and what backs each sentence. A sentence not listed here fails the test;
 * a listed one is re-checked below against the built site where code can check it.
 */
const ALLOWED_CLAIMS = {
  [AI_DECLARATION]:
    'Who builds and keeps the site: AI agents working for the brand. Backed by the history: every commit that touches ' +
    'products/il-biz-tools carries a Claude-Session trailer (30 of 30 on 29.9.2026, before this change). It claims no ' +
    'human review and names no person.',
  ...Object.fromEntries(
    SUBSETS.filter((s) => s.length).map((s) => [
      figuresSourceSentence(s),
      `Names only ${s.join(', ')}: the figure pages that ship as themselves in that build. The build writes the sentence ` +
        'from that list and refuses a page whose line is not exactly sourceLineHe(config): a source, and either a dated ' +
        'check or that no date was recorded. It does not say a figure was checked against its source.',
    ]),
  ),
  [NOT_TAX_ADVICE]: 'The wording every page footer already carried before 29.9.2026, kept as it was.',
};

/** Shapes of claims no sentence here may make: human review, guarantees, verification against an authority. */
const FORBIDDEN_CLAIMS = [
  { id: 'human review', pattern: /בידי אדם|על ידי אדם|בני אדם|אנשי מקצוע|צוות|מומחה|רואה חשבון|רואי חשבון|רו["״]ח|עורך דין|עורכי דין|יועץ מס|יועצי מס|בדיקה אנושית|פיקוח אנושי|ידנית/ },
  { id: 'guarantee', pattern: /מדויק|מדוייק|מובטח|אחריות|ערבות|100%|תמיד|לתמיד|בלי טעויות|ללא טעויות|אמין/ },
  { id: 'verified against a source', pattern: /אומת|מאומת|מאושר|רשמי|מוסמך|נבדק(?:ו|ים)?\s+מול|נבדק:|בזמן אמת|אוטומטית/ },
  { id: 'a byline', pattern: /נכתב על ידי|פותח על ידי|built by|made by/i },
];

/** The check part of vat.html's source line, inside the line itself (the page's JSON-LD quotes it too). */
const RATE_LINE_CHECK = /(id="rate-source">[^\n]*?)הושווה לתוצאות חיפוש: 7\.9\.2026/;

/** What no shipped page may say about figures: that they, or other tools, were verified against the official source. */
const VERIFIED_AGAINST_OFFICIAL = /מאומתים|יאומת|מול\s+ה?מקור\s+ה?רשמי/;

describe('the declaration text: only allowlisted claims', () => {
  const texts = {
    footer: AI_DECLARATION,
    ...Object.fromEntries(SUBSETS.map((s) => [`the FAQ answer when ${s.length ? s.join(' + ') : 'no figure page'} ships`, whoBuildsAnswer(s)])),
  };

  it('the footer line is one allowlisted sentence, and the FAQ answer is the allowlisted sentences for what ships', () => {
    expect(sentences(AI_DECLARATION)).toEqual([AI_DECLARATION]);
    expect(WHO_BUILDS_ANSWER).toBe(whoBuildsAnswer(FIGURE_PAGES));
    expect(sentences(WHO_BUILDS_ANSWER)).toEqual([AI_DECLARATION, FIGURES_SOURCE_SENTENCE, NOT_TAX_ADVICE]);
    for (const s of SUBSETS) {
      const figures = figuresSourceSentence(s);
      expect(sentences(whoBuildsAnswer(s))).toEqual(figures ? [AI_DECLARATION, figures, NOT_TAX_ADVICE] : [AI_DECLARATION, NOT_TAX_ADVICE]);
    }
    for (const [where, text] of Object.entries(texts)) {
      for (const s of sentences(text)) expect(Object.keys(ALLOWED_CLAIMS), `${where}: "${s}"`).toContain(s);
    }
  });

  it('the figures sentence names exactly the pages it is given, in Hebrew list form, and none when none ships', () => {
    const tail = 'ליד הנתון מופיעים המקור שלו ומה נבדק בו ומתי – או שתאריך הבדיקה לא תועד.';
    expect(FIGURES_SOURCE_SENTENCE).toBe(`בדפי המע״מ, תקרת עוסק פטור ומספר ההקצאה, ${tail}`);
    expect(figuresSourceSentence(['osek-patur.html', 'allocation.html'])).toBe(`בדפי תקרת עוסק פטור ומספר ההקצאה, ${tail}`);
    expect(figuresSourceSentence(['vat.html', 'osek-patur.html'])).toBe(`בדפי המע״מ ותקרת עוסק פטור, ${tail}`);
    expect(figuresSourceSentence(['allocation.html'])).toBe(`בדף מספר ההקצאה, ${tail}`);
    expect(figuresSourceSentence(['vat.html'])).toBe(`בדף המע״מ, ${tail}`);
    expect(figuresSourceSentence([])).toBeNull();
    expect(figuresSourceSentence(['net-salary.html', 'index.html'])).toBeNull();
    expect(whoBuildsAnswer([])).toBe(`${AI_DECLARATION} ${NOT_TAX_ADVICE}`);
  });

  it('says it plainly: AI agents, the brand, and nothing that sounds like a person', () => {
    expect(AI_DECLARATION).toContain('סוכני בינה מלאכותית (AI)');
    expect(AI_DECLARATION).toContain(`המותג ${BRAND_HE}`);
    expect(BRAND_HE).toBe('מהודק');
    for (const [where, text] of Object.entries(texts)) {
      // The only Latin word is "AI"; the only name is the brand.
      expect(text.match(/[A-Za-z]+/g) ?? [], where).toEqual(['AI']);
      expect(text, where).not.toMatch(/@|https?:/);
    }
  });

  it('makes no claim of human review, no guarantee, and no claim that a figure was verified against its source', () => {
    for (const [where, text] of Object.entries(texts)) {
      for (const { id, pattern } of FORBIDDEN_CLAIMS) expect(text, `${where}: ${id}`).not.toMatch(pattern);
    }
  });

  it('never talks to the reader in the masculine singular', () => {
    for (const text of Object.values(texts)) expect(text).not.toMatch(/(?:^|[\s(])(?:אתה|שלך|לך|עליך|תבדוק|תשתמש)(?=[\s.,)]|$)/);
  });

  it('keeps the wording the footers already had for "not tax advice"', () => {
    expect(NOT_TAX_ADVICE).toBe('המידע באתר אינו מהווה ייעוץ מס.');
    for (const p of sourcePages.filter((x) => x !== '404.html')) {
      const footer = /<footer class="site-footer">[\s\S]*?<\/footer>/.exec(read(p))?.[0] ?? '';
      expect(textOf(footer), p).toContain('המידע באתר אינו מהווה ייעוץ מס');
    }
  });
});

describe('the gate itself (aiDeclarationProblems)', () => {
  const page = (footerInner, { head = '', footerAttrs = '', containerClass = 'container', containerAttrs = '' } = {}) =>
    `<!doctype html><html lang="he" dir="rtl"><head>${head}</head><body><main><h1>x</h1></main>
<footer class="site-footer"${footerAttrs}><div class="${containerClass}"${containerAttrs}>© כלים לעסק ${footerInner}</div></footer></body></html>`;
  const withAttr = (attr) => AI_DECLARATION_HTML.replace(`${AI_DECLARATION_ATTR}>`, `${AI_DECLARATION_ATTR} ${attr}>`);
  /** The gate's verdict on a page that links one stylesheet, x.css, holding `css`. */
  const styled = (css, inner = AI_DECLARATION_HTML, opts = {}) =>
    aiDeclarationProblems(page(inner, { ...opts, head: '<link rel="stylesheet" href="x.css">' }), { stylesheets: { 'x.css': css } }).join(' ');

  it('accepts the declaration in the site footer, as the module writes it, with or without the real stylesheet', () => {
    expect(aiDeclarationProblems(page(AI_DECLARATION_HTML))).toEqual([]);
    expect(styled(STYLES['assets/style.css'])).toBe('');
  });

  it('refuses a page with no site footer, a footer without it, an altered one, a hidden one, or one outside the footer', () => {
    expect(aiDeclarationProblems('<html><body><main>x</main></body></html>').join(' ')).toMatch(/no site footer/);
    expect(aiDeclarationProblems(page('')).join(' ')).toMatch(/missing/);
    const altered = AI_DECLARATION_HTML.replace(AI_DECLARATION, AI_DECLARATION.replace('.', ' ונבדקו בידי רואה חשבון.'));
    expect(aiDeclarationProblems(page(altered)).join(' ')).toMatch(/altered/);
    for (const hidden of ['hidden', 'aria-hidden="true"', 'style="display:none"', 'inert']) {
      expect(aiDeclarationProblems(page(withAttr(hidden))).join(' '), hidden).toMatch(/hidden/);
    }
    expect(aiDeclarationProblems(page(AI_DECLARATION_HTML, { footerAttrs: ' hidden' })).join(' ')).toMatch(/hidden/);
    const outside = page('').replace('<main><h1>x</h1>', `<main><h1>x</h1>${AI_DECLARATION_HTML}`);
    expect(aiDeclarationProblems(outside).join(' ')).toMatch(/missing|outside/);
  });

  it('does not count a declaration inside a comment or a script', () => {
    expect(aiDeclarationProblems(page(`<!-- ${AI_DECLARATION_HTML} -->`)).join(' ')).toMatch(/missing/);
    expect(aiDeclarationProblems(page(`<script>/* ${AI_DECLARATION_HTML} */</script>`)).join(' ')).toMatch(/missing/);
  });

  it('a withheld page\'s notice carries it, with the stylesheet the notice links', () => {
    const notice = withheldPageHtml({ page: 'x.html', title: 'x', unverified: ['src/config/x.json'] });
    expect(aiDeclarationProblems(notice, { stylesheets: STYLES })).toEqual([]);
  });

  // Review 29.9, finding 2: each of these passed the gate.
  it('refuses the line moved into a print-only element: the real stylesheet hides .print-only on screen', () => {
    const printOnly = AI_DECLARATION_HTML.replace('class="ai-declaration"', 'class="ai-declaration print-only"');
    const verdict = styled(STYLES['assets/style.css'], printOnly);
    expect(verdict).toMatch(/\.print-only/);
    expect(verdict).toMatch(/hidden/);
  });

  it('refuses a hidden child, and any child element at all: the marked element holds the text and nothing else', () => {
    expect(aiDeclarationProblems(page(AI_DECLARATION_HTML.replace(AI_DECLARATION, `<span hidden>${AI_DECLARATION}</span>`)))).not.toEqual([]);
    expect(aiDeclarationProblems(page(AI_DECLARATION_HTML.replace(AI_DECLARATION, `<span>${AI_DECLARATION}</span>`)))).not.toEqual([]);
  });

  it('refuses any inline style on the line or around it: opacity, font-size, an off-screen position', () => {
    for (const style of ['opacity:0', 'font-size:0', 'position:absolute;right:-9999px', 'color:red']) {
      expect(aiDeclarationProblems(page(withAttr(`style="${style}"`))).join(' '), style).toMatch(/hidden/);
      expect(aiDeclarationProblems(page(AI_DECLARATION_HTML, { containerAttrs: ` style="${style}"` })).join(' '), `container ${style}`).toMatch(/hidden/);
    }
  });

  it('refuses a wrapper that can fold it away: a closed <details>, a <dialog>, a popover', () => {
    expect(aiDeclarationProblems(page(`<details><summary>מידע</summary>${AI_DECLARATION_HTML}</details>`)).join(' ')).toMatch(/<details>/);
    expect(aiDeclarationProblems(page(`<dialog>${AI_DECLARATION_HTML}</dialog>`)).join(' ')).toMatch(/<dialog>/);
    expect(aiDeclarationProblems(page(AI_DECLARATION_HTML, { containerAttrs: ' popover' })).join(' ')).toMatch(/hidden/);
  });

  it('refuses a stylesheet rule that hides it or an element around it, however the rule selects it', () => {
    const cases = {
      'a class on the container': ['.quiet { opacity: 0 }', { containerClass: 'container quiet' }],
      'the marker attribute': ['[data-ai-declaration] { font-size: 0 }', {}],
      'tag selectors': ['footer p { visibility: hidden }', {}],
      'the footer, inside @media screen': ['@media screen { .site-footer { display: none } }', {}],
      'a query that includes screen': ['@media print, screen { .site-footer { display: none } }', {}],
      'off screen': ['.site-footer .ai-declaration { position: absolute; right: -9999px }', {}],
      'transparent text': ['.site-footer { color: transparent }', {}],
      'a zero font shorthand': ['.ai-declaration { font: 0/0 a }', {}],
      'a clip': ['.ai-declaration { clip-path: inset(50%) }', {}],
      'a one-pixel box': ['.ai-declaration { height: 1px; overflow: hidden }', {}],
      'a pseudo-class': ['.ai-declaration:not(.x) { display: none !important }', {}],
    };
    for (const [name, [css, opts]] of Object.entries(cases)) expect(styled(css, AI_DECLARATION_HTML, opts), name).toMatch(/hidden/);
  });

  it('lets through print-only rules and rules for other elements', () => {
    expect(styled('@media print { .site-footer, .no-print { display: none !important; } }')).toBe('');
    expect(styled('.print-only { display: none; } .site-footer a { opacity: .5 } .doc footer { display: none }')).toBe('');
  });

  it('reads inline <style> too, and refuses a stylesheet it was not given or one that imports another', () => {
    const inline = page(AI_DECLARATION_HTML, { head: '<style>.site-footer { display: none }</style>' });
    expect(aiDeclarationProblems(inline).join(' ')).toMatch(/hidden/);
    const linked = page(AI_DECLARATION_HTML, { head: '<link rel="stylesheet" href="assets/other.css">' });
    expect(aiDeclarationProblems(linked, { stylesheets: STYLES }).join(' ')).toMatch(/assets\/other\.css/);
    expect(styled('@import url("more.css");')).toMatch(/@import/);
  });
});

describe('scripts that could hide it after the build checked it', () => {
  it('names a shipped script that refers to the declaration or the site footer', () => {
    expect(declarationScriptProblems([{ path: 'assets/a.js', js: "document.querySelector('.ai-declaration')?.remove();" }]).join(' ')).toMatch(/assets\/a\.js/);
    expect(declarationScriptProblems([{ path: 'assets/b.js', js: "document.querySelector('.site-footer').hidden = true;" }])).not.toEqual([]);
    expect(declarationScriptProblems([{ path: 'assets/c.js', js: 'export const x = 1;' }])).toEqual([]);
  });

  it('no script the pages load today does', () => {
    const scripts = readdirSync(join(productRoot, 'assets')).filter((f) => f.endsWith('.js')).map((f) => ({ path: `assets/${f}`, js: read(`assets/${f}`) }));
    expect(declarationScriptProblems(scripts)).toEqual([]);
  });
});

describe('every page in the source tree carries it (what `npm run serve` shows)', () => {
  it.each(sourcePages)('%s', (p) => {
    expect(aiDeclarationProblems(read(p), { stylesheets: STYLES })).toEqual([]);
  });

  it('the stylesheet never hides it on screen (print hides the whole site footer, which is the document the user prints)', () => {
    for (const r of cssRules(read('assets/style.css'))) {
      if (!/site-footer|ai-declaration/.test(r.selector)) continue;
      expect(r.decls.display ?? '', r.selector).not.toMatch(/none/);
      expect(r.decls.visibility ?? '', r.selector).not.toMatch(/hidden|collapse/);
      expect(r.decls.opacity ?? '1', r.selector).not.toMatch(/^0(?:\.0*)?$/);
      expect(r.decls['font-size'] ?? '1', r.selector).not.toMatch(/^0(?:[a-z%]*)$/);
    }
  });

  // Review 29.9, finding 6: print hides the site footer, and the findings printout is the tool's own analysis that
  // goes on to whoever files the report, so it says who built the tool. A customer's receipt is theirs and does not.
  it('the printed PCN874 findings carry the line in their print header (unmarked: the gate keys on the site footer)', () => {
    const header = elementById(read('pcn874.html'), 'pcn-print-header');
    expect(textOf(header)).toContain(AI_DECLARATION);
    expect(header).not.toContain(AI_DECLARATION_ATTR);
    expect(elementById(read('invoice.html'), 'preview')).not.toContain(AI_DECLARATION);
    expect(read('assets/page-invoice.js')).not.toContain(AI_DECLARATION);
  });
});

describe('the notice that ships in place of a withheld page', () => {
  // Review 29.9, finding 1: it said the page's figures "לא אומתו מול המקור הרשמי" and linked "חזרה לכלים שכן מאומתים",
  // which says the other tools were verified against the official source. Their own source lines say a figure was
  // compared with search results, or that no check date was recorded.
  const notice = withheldPageHtml({ page: 'net-salary.html', title: 'שכר נטו', unverified: ['src/config/tax-2026.json'] });

  it('says only that its data file is not marked as checked, and links home', () => {
    expect(notice).not.toMatch(VERIFIED_AGAINST_OFFICIAL);
    expect(notice).not.toContain('שכן');
    expect(textOf(notice)).toContain('אינו מסומן כנבדק');
    expect(notice).toMatch(/<a href="\.\/">חזרה לדף הבית<\/a>/);
    expect(notice).toContain('tax-2026.json');
  });
});

/** Every built HTML file must carry the declaration: checked with the gate and, independently, with the test helpers. */
function assertEveryBuiltPageDeclares(out) {
  const built = listFiles(out).filter((f) => f.endsWith('.html'));
  // No page is lost on the way: everything in the source tree ships, as itself or as a withheld notice.
  expect(built).toEqual(sourcePages);
  const stylesheets = stylesIn(out);
  for (const f of built) {
    const html = readIn(out, f);
    expect(aiDeclarationProblems(html, { stylesheets }), f).toEqual([]);
    const footer = /<footer class="site-footer">[\s\S]*?<\/footer>/.exec(html)?.[0];
    expect(footer, `${f} has a site footer`).toBeDefined();
    expect(textOf(footer), f).toContain(AI_DECLARATION);
    // The footer's copy, not the one a FAQ answer or its JSON-LD may also carry.
    const at = html.indexOf(footer) + footer.indexOf(AI_DECLARATION);
    for (const el of ancestorsAt(html, at)) expect(el.attrs, `${f}: <${el.tag}${el.attrs}>`).not.toMatch(/\s(?:hidden|inert|style)(?:\s|=|$)|aria-hidden="true"/);
    // Review 29.9, finding 1: no shipped page says figures, or other tools, were verified against the official source.
    expect(html, f).not.toMatch(VERIFIED_AGAINST_OFFICIAL);
  }
  return built;
}

/** The #who-builds answer of a built index.html, on the page and in its JSON-LD. */
const whoBuildsOf = (html) => ({
  visible: textOf(faqDetails(elementById(html, 'faq')).find((d) => d.question === WHO_BUILDS_QUESTION)?.answerHtml ?? ''),
  jsonLd: faqJsonLd(html).get(WHO_BUILDS_QUESTION),
});

describe('the built site: every page declares it', () => {
  let site;
  let preview;
  beforeAll(() => {
    const a = fresh();
    fillContact(a);
    const r = runBuild(a);
    if (r.status !== 0) throw new Error(`publish build failed: ${r.stderr}`);
    site = join(a, '_site');
    const b = fresh();
    const p = runBuild(b, '--preview');
    if (p.status !== 0) throw new Error(`preview build failed: ${p.stderr}`);
    preview = join(b, '_preview');
  });

  it('the publish build (_site/): every page, the withheld notice and the 404 included', () => {
    const built = assertEveryBuiltPageDeclares(site);
    // Today net-salary.html ships as a withheld notice (tax-2026.json is not verified): the notice is covered too.
    expect(readIn(site, 'net-salary.html')).toContain('לא מאומת');
    expect(built).toContain('404.html');
  });

  it('the preview build of today\'s tree (_preview/)', () => {
    assertEveryBuiltPageDeclares(preview);
  });

  it('index.html answers "who builds and keeps the site?" with the full declaration, on the page and in its FAQPage JSON-LD', () => {
    const html = readIn(site, 'index.html');
    expect(elementById(html, WHO_BUILDS_ID)).toContain(`<summary>${WHO_BUILDS_QUESTION}</summary>`);
    expect(whoBuildsOf(html)).toEqual({ visible: WHO_BUILDS_ANSWER, jsonLd: WHO_BUILDS_ANSWER });
  });

  it('pcn874.html, the page that says who runs the site, says it there as well, on the page and in the JSON-LD', () => {
    const html = readIn(site, 'pcn874.html');
    const answer = /<summary>למה הבודק חינמי\?<\/summary><p>([\s\S]*?)<\/p>/.exec(html)?.[1] ?? '';
    expect(answer).toContain('את האתר מפעילה מהודק (Mehudak).');
    expect(answer).toContain(AI_DECLARATION);
    expect(faqJsonLd(html).get('למה הבודק חינמי?')).toBe(answer);
    expect(textOf(elementById(html, 'pcn-print-header'))).toContain(AI_DECLARATION);
  });

  // Review 29.9, finding 5: "נבדק: <date>" is what sourceLineHe writes for a figure read at its source (check.how
  // "read"), which the FAQ sentence covers; the pattern allows it, so moving a figure to a primary read stays green.
  it('each named page carries exactly the source line its config gives, in one of the three forms the sentence covers', () => {
    for (const [page, { id }] of Object.entries(FIGURE_SOURCE_PAGES)) {
      const html = readIn(site, page);
      const config = JSON.parse(read(PAGE_RATE_SOURCES[page][0]));
      const line = textOf(elementById(html, id));
      expect(line, page).toBe(sourceLineHe(config));
      expect(line, page).toMatch(/^מקור: .+ · (?:נבדק: \d{1,2}\.\d{1,2}\.\d{4}|הושווה לתוצאות חיפוש: \d{1,2}\.\d{1,2}\.\d{4}|תאריך הבדיקה לא תועד)$/);
    }
    expect(sourceLineHe({ verified: true, source: 'https://www.gov.il/x', check: { on: '2026-10-01', how: 'read', record: 'r.md' } })).toMatch(
      /^מקור: .+ · (?:נבדק: \d{1,2}\.\d{1,2}\.\d{4}|הושווה לתוצאות חיפוש: \d{1,2}\.\d{1,2}\.\d{4}|תאריך הבדיקה לא תועד)$/,
    );
    // And the gate agrees on the real shipped set.
    const shipped = listFiles(site).filter((f) => f.endsWith('.html')).map((path) => ({ path, html: readIn(site, path) }));
    const asThemselves = shipped.map((p) => p.path).filter((p) => p !== 'net-salary.html');
    expect(figureSourceProblems(shipped, { asThemselves, configs: sourceConfigs() })).toEqual([]);
  });

  it('no JSON-LD on any shipped page names a person as author, creator or publisher', () => {
    for (const f of listFiles(site).filter((x) => x.endsWith('.html'))) {
      const walk = (node) => {
        if (!node || typeof node !== 'object') return;
        for (const key of ['author', 'creator', 'publisher', 'contributor', 'editor']) {
          const v = node[key];
          for (const who of Array.isArray(v) ? v : v ? [v] : []) expect(who?.['@type'], `${f}: ${key}`).not.toBe('Person');
        }
        for (const v of Object.values(node)) walk(v);
      };
      for (const block of jsonLdBlocks(readIn(site, f))) walk(block);
    }
  });
});

describe('the figures sentence follows what ships (withShippedFiguresSentence, figureSourceProblems)', () => {
  const index = read('index.html');
  const shippedSource = () => sourcePages.map((path) => ({ path, html: read(path) }));

  it('rewrites the sentence on the page and in the JSON-LD to name only the pages given, and drops it for none', () => {
    expect(withShippedFiguresSentence(index, FIGURE_PAGES)).toBe(index);
    for (const s of SUBSETS) {
      const html = withShippedFiguresSentence(index, s);
      expect(whoBuildsOf(html), s.join('+') || 'none').toEqual({ visible: whoBuildsAnswer(s), jsonLd: whoBuildsAnswer(s) });
      expect(() => jsonLdBlocks(html)).not.toThrow();
    }
  });

  it('passes the source tree as it is, with every page shipping as itself', () => {
    expect(figureSourceProblems(shippedSource(), { configs: sourceConfigs() })).toEqual([]);
  });

  // Review 29.9, finding 3: vat.json flipped to unverified shipped "בדפי המע״מ…" beside a vat.html with no figure.
  it('refuses the three-page sentence when a named page ships as a withheld notice', () => {
    const shipped = shippedSource();
    const asThemselves = sourcePages.filter((p) => p !== 'vat.html');
    const problems = figureSourceProblems(shipped, { asThemselves, configs: sourceConfigs() }).join(' ');
    expect(problems).toMatch(/index\.html: /);
    expect(problems).toContain(figuresSourceSentence(['osek-patur.html', 'allocation.html']));
  });

  // Review 29.9, finding 4: rewording one word switched the gate off, and any "מקור: …" line passed.
  it('stays on when the answer is reworded, and refuses the reworded answer', () => {
    const shipped = shippedSource().map((p) =>
      p.path === 'index.html' ? { ...p, html: p.html.split('ליד הנתון מופיעים').join('ליד כל נתון מופיעים') } : p,
    );
    const problems = figureSourceProblems(shipped, { configs: sourceConfigs() }).join(' ');
    expect(problems).toMatch(new RegExp(`index\\.html: .*#${WHO_BUILDS_ID}`));
  });

  it('refuses a source line that is not exactly the one its config gives', () => {
    const shipped = shippedSource().map((p) =>
      p.path === 'vat.html' ? { ...p, html: p.html.replace(RATE_LINE_CHECK, '$1נבדק מול המקור') } : p,
    );
    expect(textOf(elementById(shipped.find((p) => p.path === 'vat.html').html, 'rate-source'))).toContain('נבדק מול המקור');
    expect(figureSourceProblems(shipped, { configs: sourceConfigs() }).join(' ')).toMatch(/vat\.html: .*#rate-source/);
  });

  it('refuses a JSON-LD twin that says something else than the visible answer', () => {
    const shipped = shippedSource().map((p) => {
      if (p.path !== 'index.html') return p;
      const twin = `"text": "${WHO_BUILDS_ANSWER}"`;
      if (!p.html.includes(twin)) throw new Error('JSON-LD twin not found');
      return { ...p, html: p.html.replace(twin, `"text": "${AI_DECLARATION}"`) };
    });
    expect(figureSourceProblems(shipped, { configs: sourceConfigs() }).join(' ')).toMatch(/index\.html: .*JSON-LD/);
  });
});

describe('the build refuses a page without it', () => {
  const cases = {
    'removed from the 404 page': ['404.html', (h) => h.replace(AI_DECLARATION_HTML, '')],
    'altered on vat.html': ['vat.html', (h) => h.replace(AI_DECLARATION, AI_DECLARATION.replace('.', ' ונבדקו בידי רואה חשבון.'))],
    'hidden on invoice.html': ['invoice.html', (h) => h.replace(`${AI_DECLARATION_ATTR}>`, `${AI_DECLARATION_ATTR} hidden>`)],
    // Review 29.9, finding 2: the reviewer's mutation. .print-only is display:none on screen, and print hides the footer.
    'made print-only on vat.html': ['vat.html', (h) => h.replace('<p class="ai-declaration" ', '<p class="ai-declaration print-only" ')],
    'wrapped in a hidden child on osek-patur.html': ['osek-patur.html', (h) => h.replace(`>${AI_DECLARATION}<`, `><span hidden>${AI_DECLARATION}</span><`)],
    'folded into a closed <details> on allocation.html': [
      'allocation.html',
      (h) => h.replace(AI_DECLARATION_HTML, `<details><summary>מי בונה</summary>${AI_DECLARATION_HTML}</details>`),
    ],
  };
  for (const [name, [page, edit]] of Object.entries(cases)) {
    it(`refuses to publish: ${name}; the preview reports it`, () => {
      const dir = fresh();
      fillContact(dir);
      editIn(dir, page, (h) => {
        const next = edit(h);
        if (next === h) throw new Error(`edit "${name}" changed nothing`);
        return next;
      });
      const r = runBuild(dir);
      expect(r.status, r.stdout).toBe(1);
      expect(r.stderr).toContain('refusing to build');
      expect(r.stderr).toMatch(new RegExp(`${page.replace('.', '\\.')}: .*AI declaration`));
      const p = runBuild(dir, '--preview');
      expect(p.status).toBe(0);
      expect(p.stdout).toMatch(new RegExp(`${page.replace('.', '\\.')}: .*AI declaration`));
    });
  }

  it('refuses to publish when a shipped script refers to the declaration', () => {
    const dir = fresh();
    fillContact(dir);
    editIn(dir, 'assets/common.js', (s) => `${s}\nexport const quiet = () => document.querySelector('.ai-declaration')?.remove();\n`);
    const r = runBuild(dir);
    expect(r.status).toBe(1);
    expect(r.stderr).toMatch(/assets\/common\.js: .*ai-declaration/);
  });

  it('refuses to publish when a named page ships without its source line, so the figures sentence cannot outlive its backing', () => {
    const dir = fresh();
    fillContact(dir);
    editIn(dir, 'osek-patur.html', (h) => {
      const next = h.replace(/\s*<p class="note" id="ceiling-source">[\s\S]*?<\/p>/, '');
      if (next === h) throw new Error('source line not found');
      return next;
    });
    const r = runBuild(dir);
    expect(r.status).toBe(1);
    expect(r.stderr).toMatch(/osek-patur\.html: .*ceiling-source/);
  });

  it('refuses to publish a source line reworded away from what its config gives', () => {
    const dir = fresh();
    fillContact(dir);
    editIn(dir, 'vat.html', (h) => {
      const next = h.replace(RATE_LINE_CHECK, '$1נבדק: 7.9.2026');
      if (next === h) throw new Error('source line text not found');
      return next;
    });
    const r = runBuild(dir);
    expect(r.status).toBe(1);
    expect(r.stderr).toMatch(/vat\.html: .*rate-source/);
  });

  it('a named page withheld for an unverified figure still publishes, and the sentence then names only the pages that ship with a line', () => {
    const dir = fresh();
    fillContact(dir);
    editIn(dir, 'src/config/vat.json', (s) => s.replace('"verified": true', '"verified": false'));
    const r = runBuild(dir);
    expect(r.status, r.stderr).toBe(0);
    const out = join(dir, '_site');
    expect(readIn(out, 'vat.html')).toContain('לא מאומת');
    assertEveryBuiltPageDeclares(out);
    const remaining = ['osek-patur.html', 'allocation.html'];
    expect(whoBuildsOf(readIn(out, 'index.html'))).toEqual({ visible: whoBuildsAnswer(remaining), jsonLd: whoBuildsAnswer(remaining) });
    for (const f of listFiles(out).filter((x) => x.endsWith('.html'))) expect(readIn(out, f), f).not.toContain(FIGURES_SOURCE_SENTENCE);
  });

  it('with all three named pages withheld, the answer drops the figures sentence and still publishes', () => {
    const dir = fresh();
    fillContact(dir);
    for (const config of ['vat.json', 'osek-patur.json', 'allocation-number.json']) {
      editIn(dir, `src/config/${config}`, (s) => s.replace('"verified": true', '"verified": false'));
    }
    const r = runBuild(dir);
    expect(r.status, r.stderr).toBe(0);
    const out = join(dir, '_site');
    expect(whoBuildsOf(readIn(out, 'index.html'))).toEqual({ visible: whoBuildsAnswer([]), jsonLd: whoBuildsAnswer([]) });
    assertEveryBuiltPageDeclares(out);
  });
});
