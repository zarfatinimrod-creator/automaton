import { describe, it, expect } from 'vitest';
import { isProConfigured, buildCheckoutOptions, loadPaddle } from '../src/lib/paddle.js';
import { buildAnalyticsSnippet, installAnalytics } from '../src/lib/analytics.js';
import site from '../src/config/site.json' with { type: 'json' };

describe('paddle pro gate', () => {
  it('is off by default (shows בקרוב)', () => {
    expect(isProConfigured(site)).toBe(false);
    expect(isProConfigured({})).toBe(false);
  });
  it('is on when token + price id are set', () => {
    const cfg = { paddle: { clientToken: 'test_x', priceId: 'pri_1', environment: 'sandbox' } };
    expect(isProConfigured(cfg)).toBe(true);
    const o = buildCheckoutOptions(cfg, { email: 'a@b.c', successUrl: 'https://x/ok' });
    expect(o.items).toEqual([{ priceId: 'pri_1', quantity: 1 }]);
    expect(o.settings.displayMode).toBe('overlay');
    expect(o.settings.locale).toBe('he');
    expect(o.customer.email).toBe('a@b.c');
    expect(o.settings.successUrl).toBe('https://x/ok');
  });
  it('refuses to load when unconfigured', async () => {
    await expect(loadPaddle({})).rejects.toThrow(/not configured/);
  });
});

describe('analytics', () => {
  it('is off by default', () => {
    expect(buildAnalyticsSnippet(site)).toBeNull();
    expect(installAnalytics(site, null)).toBe(false);
  });
  it('builds a plausible tag', () => {
    const s = buildAnalyticsSnippet({ analytics: { provider: 'plausible', plausibleDomain: 'example.co.il' } });
    expect(s.src).toContain('plausible.io');
    expect(s.attrs['data-domain']).toBe('example.co.il');
  });
  it('builds a posthog inline snippet', () => {
    const s = buildAnalyticsSnippet({ analytics: { provider: 'posthog', posthogKey: 'phc_1' } });
    expect(s.inline).toContain('phc_1');
    expect(s.inline).toContain('eu.i.posthog.com');
  });
  it('ignores a provider without credentials', () => {
    expect(buildAnalyticsSnippet({ analytics: { provider: 'plausible' } })).toBeNull();
  });
});
