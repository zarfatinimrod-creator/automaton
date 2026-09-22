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
});
