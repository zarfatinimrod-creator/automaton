import { describe, it, expect } from 'vitest';
import {
  isValidProductUrl,
  gumroadProductUrl,
  isProConfigured,
  proButtonState,
  openProCheckout,
} from '../src/lib/gumroad.js';
import {
  buildAnalyticsSnippet,
  buildAnalyticsSnippets,
  buildPlausibleSnippet,
  buildPostHogSnippet,
  installAnalytics,
} from '../src/lib/analytics.js';
import site from '../src/config/site.json' with { type: 'json' };

const READY = { gumroad: { productUrl: 'https://kelim.gumroad.com/l/pro' }, pro: { publicKey: { x: 'k' } } };

describe('gumroad product url', () => {
  it('accepts an https product page and nothing else', () => {
    expect(isValidProductUrl('https://kelim.gumroad.com/l/pro')).toBe(true);
    expect(isValidProductUrl('http://kelim.gumroad.com/l/pro')).toBe(false);
    expect(isValidProductUrl('javascript:alert(1)')).toBe(false);
    expect(isValidProductUrl('/l/pro')).toBe(false);
    expect(isValidProductUrl('')).toBe(false);
    expect(isValidProductUrl(null)).toBe(false);
  });
  it('trims whitespace but keeps the url intact', () => {
    expect(gumroadProductUrl({ gumroad: { productUrl: '  https://x.gumroad.com/l/p  ' } })).toBe('https://x.gumroad.com/l/p');
  });
});

describe('pro button states', () => {
  it('ships not-for-sale: no product url means an honest "בקרוב"', () => {
    expect(isProConfigured(site)).toBe(false);
    const s = proButtonState(site);
    expect(s.state).toBe('unconfigured');
    expect(s.enabled).toBe(false);
    expect(s.href).toBeNull();
    expect(s.label).toBe('בקרוב');
    expect(s.note).toContain('לא נמכר');
  });

  it('stays shut on a malformed product url instead of linking somewhere random', () => {
    const s = proButtonState({ gumroad: { productUrl: 'gumroad.com/l/pro' }, pro: { publicKey: { x: 'k' } } });
    expect(s.state).toBe('invalid_url');
    expect(s.enabled).toBe(false);
    expect(s.href).toBeNull();
  });

  it('refuses to sell a licence key nothing can verify', () => {
    const s = proButtonState({ gumroad: { productUrl: 'https://kelim.gumroad.com/l/pro' }, pro: { publicKey: null } });
    expect(s.state).toBe('no_public_key');
    expect(s.enabled).toBe(false);
    expect(s.href).toBeNull();
  });

  it('opens only when there is both a shop and a way to verify what it sells', () => {
    const s = proButtonState(READY);
    expect(s.state).toBe('ready');
    expect(s.enabled).toBe(true);
    expect(s.href).toBe('https://kelim.gumroad.com/l/pro');
    expect(s.label).toBe('שדרוג ל-Pro');
  });
});

describe('opening the checkout', () => {
  it('navigates to the product page in a new tab, with no opener', () => {
    const calls = [];
    const win = { open: (...args) => calls.push(args) };
    expect(openProCheckout(READY, win)).toBe('https://kelim.gumroad.com/l/pro');
    expect(calls).toHaveLength(1);
    expect(calls[0][0]).toBe('https://kelim.gumroad.com/l/pro');
    expect(calls[0][2]).toContain('noopener');
  });
  it('throws rather than opening anything when unconfigured', () => {
    const win = { open: () => { throw new Error('should not be called'); } };
    expect(() => openProCheckout(site, win)).toThrow(/not configured/);
    expect(() => openProCheckout({ gumroad: { productUrl: 'https://x.gumroad.com/l/p' } }, win)).toThrow(/not configured/);
  });
});

describe('analytics', () => {
  it('is off by default - no key, no snippet, no third-party request', () => {
    expect(buildAnalyticsSnippets(site)).toEqual([]);
    expect(buildAnalyticsSnippet(site)).toBeNull();
    expect(installAnalytics(site, null)).toBe(false);
  });
  it('builds a plausible tag', () => {
    const s = buildPlausibleSnippet({ analytics: { provider: 'plausible', plausibleDomain: 'example.co.il' } });
    expect(s.src).toContain('plausible.io');
    expect(s.attrs['data-domain']).toBe('example.co.il');
  });
  it('ignores a provider without credentials', () => {
    expect(buildPlausibleSnippet({ analytics: { provider: 'plausible' } })).toBeNull();
  });
  it('emits no posthog snippet until a project key exists', () => {
    expect(buildPostHogSnippet({})).toBeNull();
    expect(buildPostHogSnippet({ posthog: { projectKey: '' } })).toBeNull();
  });
  it('builds a cookieless posthog snippet: no cookies, no storage, page views only', () => {
    const s = buildPostHogSnippet({ posthog: { projectKey: 'phc_1' } });
    expect(s.inline).toContain('phc_1');
    expect(s.inline).toContain('eu.i.posthog.com');
    expect(s.inline).toContain('"cookieless_mode":"always"');
    expect(s.inline).toContain('"persistence":"memory"');
    expect(s.inline).toContain('"autocapture":false');
    expect(s.inline).toContain('"capture_pageview":true');
    expect(s.inline).toContain('"disable_session_recording":true');
  });
  it('honours a self-hosted api host', () => {
    const s = buildPostHogSnippet({ posthog: { projectKey: 'phc_1', apiHost: 'https://ph.example.com' } });
    expect(s.inline).toContain('ph.example.com');
  });
  it('installs both providers when both are configured', () => {
    const added = [];
    const doc = { createElement: () => ({ setAttribute() {} }), head: { appendChild: (el) => added.push(el) } };
    const cfg = { analytics: { provider: 'plausible', plausibleDomain: 'x.co.il' }, posthog: { projectKey: 'phc_1' } };
    expect(installAnalytics(cfg, doc)).toBe(true);
    expect(added).toHaveLength(2);
  });
});
