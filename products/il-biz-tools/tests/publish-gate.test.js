import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import {
  PAGE_RATE_SOURCES,
  isVerified,
  unverifiedSourcesFor,
  unregisteredPages,
  publishPlan,
  withheldPageHtml,
  filterSitemap,
  CONFIG_PUBLISH_RULES,
  configShipPlan,
  REQUIRED_PAGES,
  CONTACT_PAGE,
  publishBlockers,
  contactHrefProblem,
} from '../src/lib/publish-gate.js';
import { statementWithContact, TEST_CONTACT_ADDRESS, TEST_CONTACT_LINK } from './helpers/product-copy.js';

const readConfig = (name) => JSON.parse(readFileSync(new URL(`../src/config/${name}`, import.meta.url), 'utf8'));

describe('verified flag', () => {
  it('only an explicit true counts', () => {
    expect(isVerified({ verified: true })).toBe(true);
    expect(isVerified({ verified: 'true' })).toBe(false);
    expect(isVerified({ verified: false })).toBe(false);
    expect(isVerified({})).toBe(false);
    expect(isVerified(undefined)).toBe(false);
  });
});

describe('the gate', () => {
  const map = { 'a.html': ['cfg/a.json'], 'b.html': ['cfg/b.json'], 'c.html': [] };
  const configs = { 'cfg/a.json': { verified: true }, 'cfg/b.json': { verified: false } };

  it('withholds a page whose source is unverified and publishes the rest', () => {
    const plan = publishPlan(['a.html', 'b.html', 'c.html'], configs, map);
    expect(plan.publish).toEqual(['a.html', 'c.html']);
    expect(plan.withhold).toEqual([{ page: 'b.html', unverified: ['cfg/b.json'] }]);
  });

  it('fails closed when a config cannot be read at all', () => {
    expect(unverifiedSourcesFor('a.html', {}, map)).toEqual(['cfg/a.json']);
  });

  it('names pages nobody classified instead of guessing for them', () => {
    expect(unregisteredPages(['a.html', 'zz.html'], map)).toEqual(['zz.html']);
    expect(unregisteredPages(['c.html'], map)).toEqual([]);
  });
});

describe('the notice that ships instead', () => {
  const html = withheldPageHtml({ page: 'net-salary.html', title: 'שכר נטו', unverified: ['src/config/tax-2026.json'] });

  it('carries the לא מאומת banner, no figures and no index', () => {
    expect(html).toContain('לא מאומת');
    expect(html).toContain('noindex');
    expect(html).not.toContain('₪');
    expect(html).not.toContain('%');
  });

  it('says which file is waiting for verification', () => {
    expect(html).toContain('tax-2026.json');
  });
});

describe('the sitemap that ships', () => {
  it('drops the withheld urls and keeps the rest', () => {
    const xml = readFileSync(new URL('../sitemap.xml', import.meta.url), 'utf8');
    const filtered = filterSitemap(xml, ['net-salary.html']);
    expect(filtered).not.toContain('net-salary.html');
    expect(filtered).toContain('vat.html');
    expect(filtered).toContain('registrar-fee.html');
  });
});

describe('this product, as configured today', () => {
  it('registers every html page in the map', () => {
    const pages = readdirSync(new URL('..', import.meta.url)).filter((f) => f.endsWith('.html'));
    expect(unregisteredPages(pages, PAGE_RATE_SOURCES)).toEqual([]);
  });

  it('keeps the net-salary page off the public site while tax-2026.json is unverified', () => {
    const tax = readConfig('tax-2026.json');
    const configs = { 'src/config/tax-2026.json': tax };
    const withheld = unverifiedSourcesFor('net-salary.html', configs);
    expect(withheld.length === 0).toBe(tax.verified === true);
  });

  it('publishes the pages whose rates are verified', () => {
    const configs = {
      'src/config/vat.json': readConfig('vat.json'),
      'src/config/osek-patur.json': readConfig('osek-patur.json'),
      'src/config/allocation-number.json': readConfig('allocation-number.json'),
    };
    for (const page of ['vat.html', 'osek-patur.html', 'invoice.html', 'allocation.html']) {
      expect(unverifiedSourcesFor(page, configs)).toEqual([]);
    }
  });

  it('lets the registrar page through because it renders no figure from its config', () => {
    expect(PAGE_RATE_SOURCES['registrar-fee.html']).toEqual([]);
  });

  it('gives every config file in src/config a publish rule, so a new one is a decision', () => {
    const files = readdirSync(new URL('../src/config', import.meta.url)).filter((f) => f.endsWith('.json'));
    for (const f of files) expect(Object.keys(CONFIG_PUBLISH_RULES), f).toContain(`src/config/${f}`);
  });

  it('never lets the unverified figure files out whole', () => {
    expect(CONFIG_PUBLISH_RULES['src/config/tax-2026.json']).toBe('verified');
    const registrar = CONFIG_PUBLISH_RULES['src/config/registrar-fee.json'];
    expect(registrar.unverifiedFields).not.toContain('amountsAwaitingVerification');
    expect(registrar.unverifiedFields).not.toContain('notes');
  });
});

describe('the config gate', () => {
  const rules = {
    'cfg/rates.json': 'verified',
    'cfg/meta.json': 'no-figures',
    'cfg/dates.json': { unverifiedFields: ['verified', 'deadline'] },
  };

  it('ships a verified config whole and a no-figures config as is', () => {
    const plan = configShipPlan(['cfg/rates.json', 'cfg/meta.json'], {
      'cfg/rates.json': { verified: true, rate: 0.18 },
      'cfg/meta.json': { siteName: 'x' },
    }, rules);
    expect(plan.refuse).toEqual([]);
    expect(plan.ship.map((s) => [s.path, s.projected])).toEqual([['cfg/meta.json', false], ['cfg/rates.json', false]]);
  });

  it('refuses an unverified config a shipped page loads - it does not ship it', () => {
    const plan = configShipPlan(['cfg/rates.json'], { 'cfg/rates.json': { verified: false, rate: 0.18 } }, rules);
    expect(plan.ship).toEqual([]);
    expect(plan.refuse[0].path).toBe('cfg/rates.json');
    expect(plan.refuse[0].reason).toMatch(/verified/);
  });

  it('cuts an allowed unverified config down to the named keys', () => {
    const plan = configShipPlan(['cfg/dates.json'], {
      'cfg/dates.json': { verified: false, deadline: { a: 1 }, amounts: { reduced: 1338 }, notes: 'internal' },
    }, rules);
    expect(plan.refuse).toEqual([]);
    expect(plan.ship).toEqual([{ path: 'cfg/dates.json', content: { verified: false, deadline: { a: 1 } }, projected: true }]);
  });

  it('ships the same config whole once it is verified', () => {
    const full = { verified: true, deadline: { a: 1 }, amounts: { reduced: 1338 } };
    const plan = configShipPlan(['cfg/dates.json'], { 'cfg/dates.json': full }, rules);
    expect(plan.ship[0].content).toEqual(full);
  });

  it('fails closed on a config with no rule, or one that cannot be read', () => {
    const plan = configShipPlan(['cfg/new.json', 'cfg/rates.json'], { 'cfg/new.json': { verified: true } }, rules);
    expect(plan.ship).toEqual([]);
    expect(plan.refuse.map((r) => r.path)).toEqual(['cfg/new.json', 'cfg/rates.json']);
    expect(plan.refuse[0].reason).toMatch(/no entry/);
    expect(plan.refuse[1].reason).toMatch(/cannot be read/);
  });

  it('the real registrar config ships dates and flags, never an amount', () => {
    const real = readConfig('registrar-fee.json');
    const plan = configShipPlan(['src/config/registrar-fee.json'], { 'src/config/registrar-fee.json': real });
    if (real.verified === true) return;
    const shipped = JSON.stringify(plan.ship[0].content);
    expect(Object.keys(plan.ship[0].content).sort()).toEqual(['deadline', 'renderAmounts', 'updated', 'verified']);
    for (const n of [real.amountsAwaitingVerification.reducedIls, real.amountsAwaitingVerification.fullIls]) {
      expect(shipped).not.toContain(String(n));
    }
  });
});

// ---------------------------------------------------------------------------
// Publish blockers.
//
// The accessibility statement needs a contact, none exists yet, and the site
// must not go out until one does. The gate therefore checks two things, and a
// publish needs both: nothing on any shipped page still looks like the
// placeholder (the marker, however it is written, or the placeholder's words),
// AND the statement carries a real contact link. Removing the marker is not
// enough - that was the hole: the check tested the action that clears it, not
// the contact the statement needs.

const STATEMENT = readFileSync(new URL('../accessibility.html', import.meta.url), 'utf8');
const statementPage = (html) => ({ path: 'accessibility.html', html });
/** The statement with its placeholder paragraph replaced by `p`. */
const withContactParagraph = (p) => statementPage(statementWithContact(STATEMENT, p));
/** The statement with a contact link in place of the placeholder. */
const withContact = (link) => withContactParagraph(`<p>פניות בנושא נגישות: ${link}</p>`);
const blockersOf = (...pages) => publishBlockers(pages).map((b) => `${b.path}: ${b.blocker}`);
const CLEAN = withContact(TEST_CONTACT_LINK);

describe('publish blockers: today', () => {
  it('refuses the statement as it is in the repo, naming the placeholder and the missing contact', () => {
    const found = blockersOf(statementPage(STATEMENT));
    expect(found).toEqual(
      expect.arrayContaining([
        expect.stringMatching(/accessibility\.html: placeholder "accessibility-contact"/),
        expect.stringMatching(/accessibility\.html: .*no accessibility contact/),
      ]),
    );
  });

  it('stops when the accessibility statement is missing from the build', () => {
    expect(REQUIRED_PAGES).toContain('accessibility.html');
    expect(CONTACT_PAGE).toBe('accessibility.html');
    const found = publishBlockers([{ path: 'index.html', html: '<p>x</p>' }]);
    expect(found).toEqual([{ path: 'accessibility.html', blocker: expect.stringMatching(/missing/) }]);
  });

  it('is clear once the statement has a well-formed contact and nothing of the placeholder is left', () => {
    expect(blockersOf(CLEAN, { path: 'a.html', html: '<p>fine</p>' })).toEqual([]);
  });

  it('the notice that replaces a withheld page links the accessibility statement', () => {
    expect(withheldPageHtml({ page: 'x.html' })).toContain('href="accessibility.html"');
  });
});

describe('publish blockers: the marker, however it is written', () => {
  const variants = {
    'double-quoted': '<p data-publish-blocker="accessibility-contact">x</p>',
    'single-quoted': "<p data-publish-blocker='accessibility-contact'>x</p>",
    unquoted: '<p data-publish-blocker=accessibility-contact>x</p>',
    'unquoted, last before >': '<p class=x data-publish-blocker=accessibility-contact>x</p>',
    'no value': '<p data-publish-blocker>x</p>',
    'empty value': '<p data-publish-blocker="">x</p>',
    'spaces around =': '<p data-publish-blocker = "accessibility-contact">x</p>',
    'upper case': '<p DATA-Publish-Blocker="accessibility-contact">x</p>',
    'right after a quoted value': '<p class="x"data-publish-blocker="accessibility-contact">x</p>',
    'inside a comment': '<!-- <p data-publish-blocker="accessibility-contact">x</p> -->',
  };
  for (const [name, html] of Object.entries(variants)) {
    it(`refuses a ${name} marker, in the statement or in any other page`, () => {
      expect(blockersOf(CLEAN, { path: 'a.html', html })).toEqual([expect.stringMatching(/^a\.html: .*placeholder/)]);
      const statement = statementPage(CLEAN.html.replace('<main class="container">', `<main class="container">${html}`));
      expect(blockersOf(statement)).toEqual([expect.stringMatching(/^accessibility\.html: .*placeholder/)]);
    });
  }

  it('names the placeholder id when the marker is unquoted', () => {
    const [found] = blockersOf(CLEAN, { path: 'a.html', html: '<p data-publish-blocker=accessibility-contact>x</p>' });
    expect(found).toContain('"accessibility-contact"');
  });
});

describe('publish blockers: the placeholder words', () => {
  it('refuses when the marker is deleted but the placeholder paragraph stays', () => {
    const page = statementPage(STATEMENT.replace(' data-publish-blocker="accessibility-contact"', ''));
    expect(page.html).not.toContain('data-publish-blocker');
    const found = blockersOf(page);
    expect(found).toEqual(
      expect.arrayContaining([
        expect.stringMatching(/placeholder text "ממלא מקום"/),
        expect.stringMatching(/no accessibility contact/),
      ]),
    );
  });

  const spellings = {
    plain: 'ממלא מקום',
    'non-breaking space': 'ממלא&nbsp;מקום',
    'numeric nbsp': 'ממלא&#160;מקום',
    'U+00A0': 'ממלא מקום',
    maqaf: 'ממלא־מקום',
    'split by a tag': 'ממלא <b>מקום</b>',
    'bidi mark inside': 'ממ‏לא מקום',
    'entity-encoded letters': '&#1502;&#1502;&#1500;&#1488; &#x5DE;&#x5E7;&#x5D5;&#x5DD;',
    'the other phrase': 'לא לפרסום',
  };
  for (const [name, text] of Object.entries(spellings)) {
    it(`refuses the placeholder words written with ${name}, even beside a real contact`, () => {
      const statement = withContactParagraph(`<p>${text}</p><p>פניות: ${TEST_CONTACT_LINK}</p>`);
      expect(blockersOf(statement)).toEqual([expect.stringMatching(/^accessibility\.html: placeholder text/)]);
      expect(blockersOf(CLEAN, { path: 'a.html', html: `<p>${text}</p>` })).toEqual([
        expect.stringMatching(/^a\.html: placeholder text/),
      ]);
    });
  }
});

describe('publish blockers: the statement must carry a real contact', () => {
  it('refuses when the whole contact section is deleted', () => {
    const html = STATEMENT.replace(/<section class="card">\s*<h2>פנייה בנושא נגישות<\/h2>[\s\S]*?<\/section>/, '');
    expect(html).not.toContain('פנייה בנושא נגישות</h2>');
    expect(blockersOf(statementPage(html))).toEqual([expect.stringMatching(/no accessibility contact/)]);
  });

  it('refuses a contact paragraph with no link at all (the old test helper\'s stub)', () => {
    expect(blockersOf(withContactParagraph('<p>פנייה לדוגמה, לבדיקה בלבד.</p>'))).toEqual([
      expect.stringMatching(/no accessibility contact/),
    ]);
  });

  it('refuses an ordinary link that is not marked as the contact', () => {
    const link = TEST_CONTACT_LINK.replace(' data-a11y-contact', '');
    expect(blockersOf(withContact(link))).toEqual([expect.stringMatching(/no accessibility contact/)]);
  });

  const stubs = {
    'no href': '<a data-a11y-contact>פנייה</a>',
    'empty href': '<a data-a11y-contact href="">פנייה</a>',
    'fragment href': '<a data-a11y-contact href="#">פנייה</a>',
    'bare mailto:': '<a data-a11y-contact href="mailto:">פנייה</a>',
    'mailto: without a domain': '<a data-a11y-contact href="mailto:negishut">פנייה</a>',
    'mailto: at example.com': '<a data-a11y-contact href="mailto:someone@example.com">someone@example.com</a>',
    'mailto: at a .test domain': '<a data-a11y-contact href="mailto:a@brand.test">a@brand.test</a>',
    'https: at example.org': '<a data-a11y-contact href="https://example.org/contact">טופס</a>',
    'https: at localhost': '<a data-a11y-contact href="https://localhost/contact">טופס</a>',
    'https: to an IP address': '<a data-a11y-contact href="https://127.0.0.1/contact">טופס</a>',
    'plain http:': '<a data-a11y-contact href="http://il-biz-tools.netlify.app/contact">טופס</a>',
    'javascript:': '<a data-a11y-contact href="javascript:void(0)">פנייה</a>',
    'a relative link': '<a data-a11y-contact href="contact.html">פנייה</a>',
    'tel: too short': '<a data-a11y-contact href="tel:123">123</a>',
    'no visible text': `<a data-a11y-contact href="mailto:${TEST_CONTACT_ADDRESS}"></a>`,
    'only an image for text': `<a data-a11y-contact href="mailto:${TEST_CONTACT_ADDRESS}"><img src="x.png" alt=""></a>`,
    'hidden attribute': `<a data-a11y-contact hidden href="mailto:${TEST_CONTACT_ADDRESS}">${TEST_CONTACT_ADDRESS}</a>`,
    'aria-hidden': `<a data-a11y-contact aria-hidden="true" href="mailto:${TEST_CONTACT_ADDRESS}">${TEST_CONTACT_ADDRESS}</a>`,
    'display:none': `<a data-a11y-contact style="display:none" href="mailto:${TEST_CONTACT_ADDRESS}">${TEST_CONTACT_ADDRESS}</a>`,
    'a hidden parent': `<span hidden>${TEST_CONTACT_LINK}</span>`,
    'marker on the paragraph, not the link': `<span data-a11y-contact>${TEST_CONTACT_LINK.replace(' data-a11y-contact', '')}</span>`,
  };
  for (const [name, link] of Object.entries(stubs)) {
    it(`refuses a stub contact: ${name}`, () => {
      const found = blockersOf(withContact(link));
      expect(found.length).toBeGreaterThan(0);
      expect(found.every((f) => f.startsWith('accessibility.html: '))).toBe(true);
    });
  }

  it('refuses a real contact that is commented out, scripted or outside <main>', () => {
    expect(blockersOf(withContact(`<!-- ${TEST_CONTACT_LINK} -->`))).toEqual([expect.stringMatching(/no accessibility contact/)]);
    const scripted = withContact(`<script>document.write('${TEST_CONTACT_LINK}')</script>`);
    expect(blockersOf(scripted)).toEqual([expect.stringMatching(/no accessibility contact/)]);
    const inFooter = statementPage(
      statementWithContact(STATEMENT, '').replace('<footer class="site-footer"><div class="container">', `<footer class="site-footer"><div class="container">${TEST_CONTACT_LINK}`),
    );
    expect(blockersOf(inFooter)).toEqual([expect.stringMatching(/outside <main>/)]);
  });

  it('refuses when one of two marked contacts is a stub', () => {
    const found = blockersOf(withContact(`${TEST_CONTACT_LINK} או <a data-a11y-contact href="mailto:">כאן</a>`));
    expect(found).toEqual([expect.stringMatching(/mailto:/)]);
  });

  it('accepts a mailto:, an https: or a tel: contact written in any valid attribute form', () => {
    for (const link of [
      TEST_CONTACT_LINK,
      `<a href='mailto:${TEST_CONTACT_ADDRESS}?subject=נגישות' data-a11y-contact>כתבו לנו</a>`,
      `<a data-a11y-contact=yes href=mailto:${TEST_CONTACT_ADDRESS}>כתבו לנו</a>`,
      '<a data-a11y-contact href="https://il-biz-tools.netlify.app/contact">טופס פנייה</a>',
      '<a data-a11y-contact href="tel:+972-0-000-0000">טלפון</a>',
    ]) {
      expect(blockersOf(withContact(link)), link).toEqual([]);
    }
  });
});

describe('contactHrefProblem', () => {
  const ok = [
    'mailto:test-only@il-biz-tools.netlify.app',
    'MAILTO:test-only@il-biz-tools.netlify.app',
    'mailto:test-only@il-biz-tools.netlify.app?subject=x',
    'mailto:test-only&#64;il-biz-tools.netlify.app',
    'https://il-biz-tools.netlify.app/contact',
    'tel:+972-0-000-0000',
    'tel:0000000',
  ];
  for (const href of ok) it(`accepts ${href}`, () => expect(contactHrefProblem(href)).toBeNull());

  const bad = [
    undefined,
    '',
    '   ',
    '#',
    'mailto:',
    'mailto:@il-biz-tools.netlify.app',
    'mailto:a@b',
    'mailto:a@example.com',
    'mailto:a@mail.example.net',
    'mailto:a@x.invalid',
    'mailto:a@x.local',
    'mailto:a@il-biz-tools.netlify.app,b@il-biz-tools.netlify.app',
    'https://',
    'https://user:pw@il-biz-tools.netlify.app/',
    'https://example.com/',
    'https://www.example.org/x',
    'https://brand.example/x',
    'https://10.0.0.1/',
    'http://il-biz-tools.netlify.app/',
    'tel:',
    'tel:12345',
    'tel:+972-abc',
    'javascript:alert(1)',
    'data:text/html,x',
    'contact.html',
  ];
  for (const href of bad) it(`refuses ${JSON.stringify(href)}`, () => expect(typeof contactHrefProblem(href)).toBe('string'));
});
