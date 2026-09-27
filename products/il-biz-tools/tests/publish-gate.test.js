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
  publishBlockers,
} from '../src/lib/publish-gate.js';

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

describe('publish blockers', () => {
  it('stops on a marked placeholder in any shipped page', () => {
    const found = publishBlockers([
      { path: 'accessibility.html', html: '<p data-publish-blocker="accessibility-contact">x</p>' },
      { path: 'a.html', html: '<p>fine</p>' },
    ]);
    expect(found).toEqual([{ path: 'accessibility.html', blocker: expect.stringContaining('accessibility-contact') }]);
  });

  it('stops when the accessibility statement is missing from the build', () => {
    expect(REQUIRED_PAGES).toContain('accessibility.html');
    const found = publishBlockers([{ path: 'index.html', html: '<p>x</p>' }]);
    expect(found).toEqual([{ path: 'accessibility.html', blocker: expect.stringMatching(/missing/) }]);
  });

  it('is clear once the placeholder is replaced', () => {
    expect(publishBlockers([{ path: 'accessibility.html', html: '<p>contact</p>' }])).toEqual([]);
  });

  it('the notice that replaces a withheld page links the accessibility statement', () => {
    expect(withheldPageHtml({ page: 'x.html' })).toContain('href="accessibility.html"');
  });
});
