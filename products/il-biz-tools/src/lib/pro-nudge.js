// One factual line after a free print (research/tiktok/08-sales-marketing-lessons.md §8.1 N3).
// It says how a print comes out, never that one happened: `afterprint` fires on a cancelled print dialog too.
//
// Someone who tried their logo in the on-screen preview and then printed gets a
// document without it - that is the free tier, and the print stylesheet makes
// sure of it. The line says so, and what Pro adds, at the price Gumroad
// reported. It is shown:
//   - only after a print, only while the shop is ready, never to a licence
//     holder, and only when the preview was actually tried;
//   - at most once per browser session (sessionStorage);
//   - never again once closed (localStorage).
// No modal, no timer, no countdown. Storage may be blocked (private modes,
// site data off): every read and write is wrapped, and a flag in memory still
// keeps it to once per page.
import { DEFAULT_ACCENT } from './branding.js';

export const NUDGE_SHOWN_KEY = 'ilbiz.proNudge.shown';
export const NUDGE_DISMISSED_KEY = 'ilbiz.proNudge.dismissed';

export function proNudgeText(price) {
  return `בהדפסה ובשמירה כ-PDF המסמך יוצא בלי המיתוג שניסיתם. Pro מוסיף את הלוגו וצבע המותג למסמך המודפס – ${price}, תשלום חד-פעמי.`;
}

/** The preview was tried: a logo, or a colour other than the default. */
export function brandingTried(branding) {
  return Boolean(branding?.logo) || (typeof branding?.accent === 'string' && branding.accent !== DEFAULT_ACCENT);
}

const read = (storage, key) => {
  try {
    return storage?.getItem(key) ?? null;
  } catch {
    return null;
  }
};

const write = (storage, key) => {
  try {
    storage?.setItem(key, '1');
  } catch {
    /* storage blocked: the in-memory flag still holds for this page */
  }
};

export function createProNudge({ session, local }) {
  let shownOnThisPage = false;
  return {
    shouldShow({ ready, proActive, tried }) {
      if (!ready || proActive || !tried || shownOnThisPage) return false;
      return read(session, NUDGE_SHOWN_KEY) === null && read(local, NUDGE_DISMISSED_KEY) === null;
    },
    markShown() {
      shownOnThisPage = true;
      write(session, NUDGE_SHOWN_KEY);
    },
    dismiss() {
      shownOnThisPage = true;
      write(local, NUDGE_DISMISSED_KEY);
    },
  };
}
