// N3 of the TikTok sales note (research/tiktok/08-sales-marketing-lessons.md §8.1): one factual line after a
// free print, once per session, closable for good, never a modal and never a timer. The page wiring is tested in
// tests/page-invoice.test.js; this file tests the rules.
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import {
  createProNudge,
  proNudgeText,
  brandingTried,
  NUDGE_SHOWN_KEY,
  NUDGE_DISMISSED_KEY,
} from '../src/lib/pro-nudge.js';
import { DEFAULT_ACCENT } from '../src/lib/branding.js';
import { memoryStorage } from './fixtures/gumroad-verify.js';

const PNG = 'data:image/png;base64,iVBORw0KGgo=';
const READY = { ready: true, proActive: false, tried: true };

/** A storage whose every call throws, as a browser with site data blocked does. */
const throwing = () => ({
  getItem() { throw new Error('SecurityError'); },
  setItem() { throw new Error('SecurityError'); },
  removeItem() { throw new Error('SecurityError'); },
});

describe('the line itself', () => {
  it('states what happened and what Pro adds, with the configured price and "one-time"', () => {
    expect(proNudgeText('‏79 ‏₪')).toBe('המסמך הודפס או נשמר כ-PDF בלי המיתוג שניסיתם. Pro מוסיף את הלוגו וצבע המותג למסמך המודפס – ‏79 ‏₪, תשלום חד-פעמי.');
  });

  it('uses none of the words the note rejects', () => {
    const text = proNudgeText('X');
    for (const word of ['מבצע', 'הנחה', 'רק היום', 'לזמן מוגבל', 'מיידי', 'לכל החיים', 'אחרון']) expect(text).not.toContain(word);
  });
});

describe('when it may show', () => {
  it('after a print, in the ready state, without a licence, when the preview was tried', () => {
    const nudge = createProNudge({ session: memoryStorage(), local: memoryStorage() });
    expect(nudge.shouldShow(READY)).toBe(true);
  });

  it('never while there is nothing to buy, never to a licence holder, never to someone who tried nothing', () => {
    const nudge = createProNudge({ session: memoryStorage(), local: memoryStorage() });
    expect(nudge.shouldShow({ ...READY, ready: false })).toBe(false);
    expect(nudge.shouldShow({ ...READY, proActive: true })).toBe(false);
    expect(nudge.shouldShow({ ...READY, tried: false })).toBe(false);
  });

  it('once per session: after it has shown, the same session never sees it again', () => {
    const session = memoryStorage();
    const first = createProNudge({ session, local: memoryStorage() });
    first.markShown();
    expect(first.shouldShow(READY)).toBe(false);
    expect(session.getItem(NUDGE_SHOWN_KEY)).not.toBeNull();
    // A reload in the same tab is the same session.
    expect(createProNudge({ session, local: memoryStorage() }).shouldShow(READY)).toBe(false);
    // A new session may see it once more.
    expect(createProNudge({ session: memoryStorage(), local: memoryStorage() }).shouldShow(READY)).toBe(true);
  });

  it('closed is closed for good: the dismissal is kept in localStorage across sessions', () => {
    const local = memoryStorage();
    createProNudge({ session: memoryStorage(), local }).dismiss();
    expect(local.getItem(NUDGE_DISMISSED_KEY)).not.toBeNull();
    expect(createProNudge({ session: memoryStorage(), local }).shouldShow(READY)).toBe(false);
  });

  it('with storage blocked it neither throws nor repeats within the page', () => {
    const nudge = createProNudge({ session: throwing(), local: throwing() });
    expect(nudge.shouldShow(READY)).toBe(true);
    expect(() => nudge.markShown()).not.toThrow();
    expect(nudge.shouldShow(READY)).toBe(false);
    expect(() => nudge.dismiss()).not.toThrow();
    expect(createProNudge({ session: null, local: null }).shouldShow(READY)).toBe(true);
  });
});

describe('what counts as having tried the preview', () => {
  it('a logo, or a colour other than the default', () => {
    expect(brandingTried({ logo: PNG, accent: DEFAULT_ACCENT })).toBe(true);
    expect(brandingTried({ logo: null, accent: '#abcdef' })).toBe(true);
    expect(brandingTried({ logo: null, accent: DEFAULT_ACCENT })).toBe(false);
    expect(brandingTried(null)).toBe(false);
  });
});

describe('no modal and no timer', () => {
  it('the module and the page use no timer, dialog or alert for it', () => {
    for (const path of ['../src/lib/pro-nudge.js', '../assets/page-invoice.js']) {
      const code = readFileSync(new URL(path, import.meta.url), 'utf8');
      expect(code, path).not.toMatch(/setTimeout|setInterval|showModal|alert\(/);
    }
    const html = readFileSync(new URL('../invoice.html', import.meta.url), 'utf8');
    expect(html).not.toMatch(/<dialog|alertdialog/);
  });
});
