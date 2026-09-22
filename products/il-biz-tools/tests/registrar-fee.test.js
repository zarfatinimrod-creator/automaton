import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { annualDeadlines, deadlineMessage, feeAmountDisclosure } from '../src/lib/registrar-fee.js';
import config from '../src/config/registrar-fee.json' with { type: 'json' };

describe('reduced-rate deadline calculator', () => {
  it('counts the days left while the window is open', () => {
    const r = annualDeadlines('2026-02-10', config);
    expect(r.phase).toBe('reduced');
    expect(r.windowOpen).toBe(true);
    expect(r.reducedRateDeadline).toBe('2026-03-31');
    expect(r.fullRateFrom).toBe('2026-04-01');
    expect(r.daysToReducedRateDeadline).toBe(49);
  });

  it('treats the last day of the window as still open', () => {
    const r = annualDeadlines('2026-03-31', config);
    expect(r.windowOpen).toBe(true);
    expect(r.daysToReducedRateDeadline).toBe(0);
    expect(deadlineMessage(r)).toContain('היום הוא היום האחרון');
  });

  it('switches to the full rate on 1 April and points at next year', () => {
    const r = annualDeadlines('2026-04-01', config);
    expect(r.phase).toBe('full');
    expect(r.windowOpen).toBe(false);
    expect(r.reducedRateDeadline).toBe('2026-03-31');
    expect(r.nextReducedRateDeadline).toBe('2027-03-31');
    expect(r.nextFullRateFrom).toBe('2027-04-01');
    expect(r.daysToNextReducedRateDeadline).toBe(364);
  });

  it('answers for a date late in the year', () => {
    const r = annualDeadlines('2026-09-07', config);
    expect(r.windowOpen).toBe(false);
    expect(r.nextReducedRateDeadline).toBe('2027-03-31');
    expect(r.daysToNextReducedRateDeadline).toBe(205);
  });

  it('handles a leap year without drifting a day', () => {
    const r = annualDeadlines('2028-02-10', config);
    expect(r.reducedRateDeadline).toBe('2028-03-31');
    expect(r.daysToReducedRateDeadline).toBe(50);
  });

  it('refuses junk rather than guessing', () => {
    expect(annualDeadlines('', config)).toBeNull();
    expect(annualDeadlines('nonsense', config)).toBeNull();
    expect(annualDeadlines('2026-02-30', config)).toBeNull();
    expect(annualDeadlines('2026-13-01', config)).toBeNull();
    expect(annualDeadlines('2026-01-01', {})).toBeNull();
    expect(deadlineMessage(null)).toContain('לא תקין');
  });

  it('reads the dates from config rather than hard-coding March', () => {
    const shifted = { deadline: { reducedRateThrough: '06-30', fullRateFrom: '07-01' } };
    const r = annualDeadlines('2026-05-01', shifted);
    expect(r.reducedRateDeadline).toBe('2026-06-30');
    expect(r.fullRateFrom).toBe('2026-07-01');
  });
});

describe('the fee amounts are gated, not badged', () => {
  it('hands out no amount at all while the source is unverified', () => {
    const d = feeAmountDisclosure({ verified: false, renderAmounts: true, amountsAwaitingVerification: { reducedIls: 1 } });
    expect(d.publishable).toBe(false);
    expect(d.amounts).toBeNull();
    expect(d.reason).toBe('unverified');
    expect(d.message).toContain('לא אומתו');
  });

  it('still hands out nothing when verified but rendering is switched off', () => {
    const d = feeAmountDisclosure({ verified: true, renderAmounts: false, amountsAwaitingVerification: { reducedIls: 1 } });
    expect(d.publishable).toBe(false);
    expect(d.amounts).toBeNull();
    expect(d.reason).toBe('render_disabled');
  });

  it('releases the amounts only when both flags are explicitly true', () => {
    const d = feeAmountDisclosure({
      verified: true,
      renderAmounts: true,
      amountsAwaitingVerification: { forYear: 2026, reducedIls: 1, fullIls: 2 },
    });
    expect(d.publishable).toBe(true);
    expect(d.amounts).toEqual({ forYear: 2026, reducedIls: 1, fullIls: 2 });
  });

  it('fails closed on an empty or missing config', () => {
    expect(feeAmountDisclosure(undefined).publishable).toBe(false);
    expect(feeAmountDisclosure({}).amounts).toBeNull();
  });

  it('shipped config: whatever its flags say, the disclosure and the page agree', () => {
    const d = feeAmountDisclosure(config);
    const html = readFileSync(new URL('../registrar-fee.html', import.meta.url), 'utf8');
    const a = config.amountsAwaitingVerification ?? {};
    const printed = [a.reducedIls, a.fullIls]
      .filter((n) => typeof n === 'number')
      .flatMap((n) => [String(n), n.toLocaleString('en-US')]);
    if (!d.publishable) {
      // MISSION rule 4: an unverified legal figure never reaches a published page.
      for (const needle of printed) expect(html).not.toContain(needle);
      expect(html).toContain('לא אומתו מול מקור ראשוני');
    }
  });

  it('the page script cannot print an amount it was never handed', () => {
    const js = readFileSync(new URL('../assets/page-registrar-fee.js', import.meta.url), 'utf8');
    expect(js).toContain('feeAmountDisclosure(config)');
    expect(js).not.toMatch(/amountsAwaitingVerification/);
  });
});

describe('the free reminder form', () => {
  const html = readFileSync(new URL('../registrar-fee.html', import.meta.url), 'utf8');

  it('ships disabled, with no endpoint to post to', () => {
    expect(html).toContain('<fieldset disabled');
    expect(html).not.toMatch(/<form[^>]+action=/);
    expect(html).toContain('100 צפיות בשבוע');
  });

  it('carries the §30א(ג) disclosure and a refusal box at the point of capture', () => {
    expect(html).toContain('30א(ג)');
    expect(html).toContain('id="reminder-refuse"');
    expect(html).toContain('אני מסרב/ת לקבל דברי פרסומת');
  });

  it('says what is stored, for how long, and how to delete it (Amendment 13)', () => {
    expect(html).toContain('תיקון 13');
    expect(html).toContain('24 חודשים');
    expect(html).toContain('איך מוחקים');
  });

  it('marks the legal wording as an unreviewed draft', () => {
    expect(html).toContain('טרם נבדק משפטית');
  });
});
