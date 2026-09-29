// What pcn874.html lets a user share after a check (TikTok note N7b).
//
// The user carries their own result to whoever files for them; the page never
// sends anything itself. The text holds only the error and warning counts and
// the ids of the rules that fired - never a value from the file and never the
// file's name - then the page's address alone on the last line, with ?via=share.
// No emoji: the wa.me -> api.whatsapp.com redirect is reported to turn emoji
// into U+FFFD (research/tiktok/08-sales-marketing-lessons.md §6.3), and nothing
// here is above U+FFFF.
//
// Pure: no DOM, no network, no storage. assets/page-pcn874.js calls
// navigator.share with this text, and only when the user presses the button.
import { looksLikeRepresentativeFile } from './pcn874-report.js';

/** The page's canonical address (tests hold it to pcn874.html and site.json). */
export const PCN874_PAGE_URL = 'https://il-biz-tools.netlify.app/pcn874.html';

/** The address a share carries, marked so a visit from a share can be told apart. */
export const SHARE_URL = `${PCN874_PAGE_URL}?via=share`;

/**
 * The api.whatsapp.com fallback, for browsers without navigator.share. OFF:
 * the note's release gate says it goes public only after an Android and an iOS
 * device test is recorded (RTL text intact, the contact picker opens, the link
 * preview noted), and the colony has no phones to run one. Until then the page
 * ships navigator.share only, and the button is hidden where it is missing.
 * Turning this on without the record at WHATSAPP_DEVICE_TEST_RECORD fails
 * tests/pcn874-share.test.js.
 */
export const WHATSAPP_FALLBACK_ENABLED = false;

/** Where the device test must be recorded before the fallback may be turned on (relative to this product). */
export const WHATSAPP_DEVICE_TEST_RECORD = 'docs/whatsapp-share-device-test.md';

const MAX_RULES = 10;

/**
 * The only facts a share may carry, taken from a validation result: its
 * verdict, its two counts and the ids of the rules that fired, in order.
 *
 * @param {{counts: {error: number, warning: number}, findings: {rule: string}[], parsed?: object}} result  validatePcn874(...)
 */
export function shareSummary(result) {
  const errors = result.counts.error;
  const warnings = result.counts.warning;
  // The same verdict the page shows (buildReport in pcn874-report.js).
  const verdict = looksLikeRepresentativeFile(result.parsed) ? 'unsupported' : errors > 0 ? 'invalid' : warnings > 0 ? 'warnings' : 'clean';
  const rules = [...new Set(result.findings.map((f) => String(f.rule)))].filter((r) => /^[A-Za-z.]+$/.test(r));
  return { verdict, errors, warnings, rules };
}

const errorsHe = (n) => (n === 1 ? 'שגיאה אחת' : `${n} שגיאות`);
const warningsHe = (n) => (n === 1 ? 'אזהרה אחת' : `${n} אזהרות`);

function countsHe({ errors, warnings }) {
  if (errors === 0 && warnings === 0) return 'לא נמצאו שגיאות ולא אזהרות מבנה.';
  if (errors === 0) return `לא נמצאו שגיאות מבנה; נמצאו ${warningsHe(warnings)}.`;
  const verb = errors === 1 ? 'נמצאה' : 'נמצאו';
  return warnings === 0 ? `${verb} ${errorsHe(errors)}.` : `${verb} ${errorsHe(errors)} ו${warnings === 1 ? '' : '-'}${warningsHe(warnings)}.`;
}

/**
 * The text a user shares. Lines: what was checked; the counts; the rules;
 * what this is not; the address, alone, last.
 *
 * @param {{verdict: string, errors: number, warnings: number, rules: string[]}} summary  shareSummary(...)
 */
export function shareText(summary) {
  const lines = ['בדיקת מבנה של קובץ PCN874 (דוח מע״מ מפורט), בבודק שנועד לקובץ של עוסק אחד:'];
  if (summary.verdict === 'unsupported') {
    lines.push("הקובץ נראה כמו קובץ מייצגים (נספח ב'), שהבודק אינו בודק; הממצאים הם השוואה לנספח א' בלבד.");
  }
  lines.push(countsHe(summary));
  if (summary.rules.length) {
    const shown = summary.rules.slice(0, MAX_RULES);
    const more = summary.rules.length - shown.length;
    lines.push(`הכללים שדווחו: ${shown.join(', ')}${more > 0 ? ` ועוד ${more}` : ''}.`);
    lines.push('הסבר לכל כלל נמצא בדף הבודק, ברשימה «כל הכללים שהבודק בודק».');
  }
  lines.push('זו בדיקת מבנה בלבד, ולא אישור שהקובץ יתקבל ברשות המסים. אינו ייעוץ מס.');
  lines.push(SHARE_URL);
  return lines.join('\n');
}

/** The api.whatsapp.com link for a text (the fallback; see WHATSAPP_FALLBACK_ENABLED). Never wa.me. */
export function whatsappHref(text) {
  return `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
}
