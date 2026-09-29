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
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import {
  AI_DECLARATION,
  AI_DECLARATION_ATTR,
  AI_DECLARATION_HTML,
  WHO_BUILDS_QUESTION,
  WHO_BUILDS_ANSWER,
  FIGURES_SOURCE_SENTENCE,
  FIGURE_SOURCE_PAGES,
  NOT_TAX_ADVICE,
  BRAND_HE,
} from '../src/lib/ai-declaration.js';
import { aiDeclarationProblems, figureSourceProblems, withheldPageHtml, PAGE_RATE_SOURCES } from '../src/lib/publish-gate.js';
import { sourceLineHe } from '../src/lib/source-line.js';
import { cssRules } from '../src/lib/a11y-check.js';
import { copyProduct, removeCopy, runBuild, listFiles, readIn, editIn, fillContact, productRoot } from './helpers/product-copy.js';
import { textOf, elementById, faqDetails, faqJsonLd, jsonLdBlocks, ancestorsAt } from './helpers/html.js';

const read = (p) => readFileSync(join(productRoot, p), 'utf8');
const sourcePages = readdirSync(productRoot).filter((f) => f.endsWith('.html')).sort();

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
  [FIGURES_SOURCE_SENTENCE]:
    'Only the three pages that print a source line (src/lib/source-line.js): each built page carries it, and it says a ' +
    'source and either a dated check or that no date was recorded. It does not say a figure was checked against its source.',
  [NOT_TAX_ADVICE]: 'The wording every page footer already carried before 29.9.2026, kept as it was.',
};

/** Shapes of claims no sentence here may make: human review, guarantees, verification against an authority. */
const FORBIDDEN_CLAIMS = [
  { id: 'human review', pattern: /בידי אדם|על ידי אדם|בני אדם|אנשי מקצוע|צוות|מומחה|רואה חשבון|רואי חשבון|רו["״]ח|עורך דין|עורכי דין|יועץ מס|יועצי מס|בדיקה אנושית|פיקוח אנושי|ידנית/ },
  { id: 'guarantee', pattern: /מדויק|מדוייק|מובטח|אחריות|ערבות|100%|תמיד|לתמיד|בלי טעויות|ללא טעויות|אמין/ },
  { id: 'verified against a source', pattern: /אומת|מאומת|מאושר|רשמי|מוסמך|נבדק(?:ו|ים)?\s+מול|נבדק:|בזמן אמת|אוטומטית/ },
  { id: 'a byline', pattern: /נכתב על ידי|פותח על ידי|built by|made by/i },
];

describe('the declaration text: only allowlisted claims', () => {
  const texts = { footer: AI_DECLARATION, 'the FAQ answer': WHO_BUILDS_ANSWER };

  it('the footer line is one allowlisted sentence, and the FAQ answer is exactly the allowlisted three', () => {
    expect(sentences(AI_DECLARATION)).toEqual([AI_DECLARATION]);
    expect(sentences(WHO_BUILDS_ANSWER)).toEqual([AI_DECLARATION, FIGURES_SOURCE_SENTENCE, NOT_TAX_ADVICE]);
    for (const [where, text] of Object.entries(texts)) {
      for (const s of sentences(text)) expect(Object.keys(ALLOWED_CLAIMS), `${where}: "${s}"`).toContain(s);
    }
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
  const page = (footerInner) => `<!doctype html><html lang="he" dir="rtl"><body><main><h1>x</h1></main>
<footer class="site-footer"><div class="container">© כלים לעסק ${footerInner}</div></footer></body></html>`;

  it('accepts the declaration in the site footer, as the module writes it', () => {
    expect(aiDeclarationProblems(page(AI_DECLARATION_HTML))).toEqual([]);
  });

  it('refuses a page with no site footer, a footer without it, an altered one, a hidden one, or one outside the footer', () => {
    expect(aiDeclarationProblems('<html><body><main>x</main></body></html>').join(' ')).toMatch(/no site footer/);
    expect(aiDeclarationProblems(page('')).join(' ')).toMatch(/missing/);
    const altered = AI_DECLARATION_HTML.replace(AI_DECLARATION, AI_DECLARATION.replace('.', ' ונבדקו בידי רואה חשבון.'));
    expect(aiDeclarationProblems(page(altered)).join(' ')).toMatch(/altered/);
    for (const hidden of ['hidden', 'aria-hidden="true"', 'style="display:none"', 'inert']) {
      const html = page(AI_DECLARATION_HTML.replace(`${AI_DECLARATION_ATTR}>`, `${AI_DECLARATION_ATTR} ${hidden}>`));
      expect(aiDeclarationProblems(html).join(' '), hidden).toMatch(/hidden/);
    }
    const hiddenFooter = page(AI_DECLARATION_HTML).replace('<footer class="site-footer">', '<footer class="site-footer" hidden>');
    expect(aiDeclarationProblems(hiddenFooter).join(' ')).toMatch(/hidden/);
    const outside = page('').replace('<main><h1>x</h1>', `<main><h1>x</h1>${AI_DECLARATION_HTML}`);
    expect(aiDeclarationProblems(outside).join(' ')).toMatch(/missing|outside/);
  });

  it('does not count a declaration inside a comment or a script', () => {
    expect(aiDeclarationProblems(page(`<!-- ${AI_DECLARATION_HTML} -->`)).join(' ')).toMatch(/missing/);
    expect(aiDeclarationProblems(page(`<script>/* ${AI_DECLARATION_HTML} */</script>`)).join(' ')).toMatch(/missing/);
  });

  it('a withheld page\'s notice carries it', () => {
    expect(aiDeclarationProblems(withheldPageHtml({ page: 'x.html', title: 'x', unverified: ['src/config/x.json'] }))).toEqual([]);
  });
});

describe('every page in the source tree carries it (what `npm run serve` shows)', () => {
  it.each(sourcePages)('%s', (p) => {
    expect(aiDeclarationProblems(read(p))).toEqual([]);
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
});

/** Every built HTML file must carry the declaration: checked with the gate and, independently, with the test helpers. */
function assertEveryBuiltPageDeclares(out) {
  const built = listFiles(out).filter((f) => f.endsWith('.html'));
  // No page is lost on the way: everything in the source tree ships, as itself or as a withheld notice.
  expect(built).toEqual(sourcePages);
  for (const f of built) {
    const html = readIn(out, f);
    expect(aiDeclarationProblems(html), f).toEqual([]);
    const footer = /<footer class="site-footer">[\s\S]*?<\/footer>/.exec(html)?.[0];
    expect(footer, `${f} has a site footer`).toBeDefined();
    expect(textOf(footer), f).toContain(AI_DECLARATION);
    // The footer's copy, not the one a FAQ answer or its JSON-LD may also carry.
    const at = html.indexOf(footer) + footer.indexOf(AI_DECLARATION);
    for (const el of ancestorsAt(html, at)) expect(el.attrs, `${f}: <${el.tag}${el.attrs}>`).not.toMatch(/\s(?:hidden|inert)(?:\s|=|$)|aria-hidden="true"|display:\s*none/);
  }
  return built;
}

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
    const entry = faqDetails(elementById(html, 'faq')).find((d) => d.question === WHO_BUILDS_QUESTION);
    expect(entry, 'the visible FAQ entry').toBeDefined();
    expect(textOf(entry.answerHtml)).toBe(WHO_BUILDS_ANSWER);
    expect(faqJsonLd(html).get(WHO_BUILDS_QUESTION)).toBe(WHO_BUILDS_ANSWER);
  });

  it('pcn874.html, the page that says who runs the site, says it there as well, on the page and in the JSON-LD', () => {
    const html = readIn(site, 'pcn874.html');
    const answer = /<summary>למה הבודק חינמי\?<\/summary><p>([\s\S]*?)<\/p>/.exec(html)?.[1] ?? '';
    expect(answer).toContain('את האתר מפעילה מהודק (Mehudak).');
    expect(answer).toContain(AI_DECLARATION);
    expect(faqJsonLd(html).get('למה הבודק חינמי?')).toBe(answer);
  });

  it('the figures sentence is true of what ships: each named page carries its source line, and it never says "נבדק:"', () => {
    for (const [page, id] of Object.entries(FIGURE_SOURCE_PAGES)) {
      const html = readIn(site, page);
      const config = JSON.parse(read(PAGE_RATE_SOURCES[page][0]));
      const line = textOf(elementById(html, id));
      expect(line, page).toBe(sourceLineHe(config));
      expect(line, page).toMatch(/^מקור: .+ · (?:הושווה לתוצאות חיפוש: \d{1,2}\.\d{1,2}\.\d{4}|תאריך הבדיקה לא תועד)$/);
    }
    // And the gate agrees on the real shipped set.
    const shipped = listFiles(site).filter((f) => f.endsWith('.html')).map((path) => ({ path, html: readIn(site, path) }));
    expect(figureSourceProblems(shipped, ['net-salary.html'])).toEqual([]);
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

describe('the build refuses a page without it', () => {
  const cases = {
    'removed from the 404 page': ['404.html', (h) => h.replace(AI_DECLARATION_HTML, '')],
    'altered on vat.html': ['vat.html', (h) => h.replace(AI_DECLARATION, AI_DECLARATION.replace('.', ' ונבדקו בידי רואה חשבון.'))],
    'hidden on invoice.html': ['invoice.html', (h) => h.replace(`${AI_DECLARATION_ATTR}>`, `${AI_DECLARATION_ATTR} hidden>`)],
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

  it('a named page withheld for an unverified figure still publishes: the notice shows no figure for the sentence to be about', () => {
    const dir = fresh();
    fillContact(dir);
    editIn(dir, 'src/config/vat.json', (s) => s.replace('"verified": true', '"verified": false'));
    const r = runBuild(dir);
    expect(r.status, r.stderr).toBe(0);
    expect(readIn(join(dir, '_site'), 'vat.html')).toContain('לא מאומת');
    assertEveryBuiltPageDeclares(join(dir, '_site'));
  });
});
