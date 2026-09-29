// What the PCN874 validator page says about a file, in Hebrew.
//
// The validator is products/pcn874's own (bundled into src/vendor/pcn874/ by
// scripts/bundle-pcn874.js). It reports in English, each finding with a stable
// rule id. This module does not judge anything: it turns the validator's
// result into rows - where (line), which record, which field, how severe, and
// the rule that failed in Hebrew - and keeps the validator's own English
// beside each row. Every rule the validator can emit has a Hebrew line here;
// tests/pcn874-report.test.js reads the rule ids out of validate.js and fails
// on one without a line.
//
// Pure: no DOM, no network, no storage. The page glue (assets/page-pcn874.js)
// renders what buildReport returns.
import {
  HEADER,
  DETAIL,
  FOOTER,
  RECORD_TYPES,
  REPRESENTATIVE_INITIAL_RECORD_TYPE,
  REPRESENTATIVE_SUMMARY_RECORD_TYPE,
} from '../vendor/pcn874/layout.js';
import { decodePcn874Bytes } from '../vendor/pcn874/parse.js';
import { COUNTERPARTY_ROWS } from '../vendor/pcn874/validate.js';

export const SEVERITY_HE = Object.freeze({ error: 'שגיאה', warning: 'אזהרה', info: 'מידע' });

const SPECS = { header: HEADER, detail: DETAIL, footer: FOOTER };

// The layout names most fields in Hebrew; these are the ones it leaves blank
// (our wording, not the circular's). Sign fields are named after their amount.
const FIELD_NAMES = {
  'header.recordType': 'סוג רשומה',
  'header.reportType': 'סוג הדוח',
  'footer.recordType': 'סוג רשומה',
};

/** Hebrew name of a field of a header / detail / footer record, or null if there is no such field. */
export function fieldHebrew(kind, id) {
  const field = SPECS[kind]?.fields.find((f) => f.id === id);
  if (!field) return null;
  if (field.hebrew) return field.hebrew;
  if (field.class === 'sign' && field.signs) return `סימן (+/-) של «${fieldHebrew(kind, field.signs)}»`;
  return FIELD_NAMES[`${kind}.${id}`] ?? null;
}

const letters = (side) =>
  Object.entries(RECORD_TYPES)
    .filter(([, v]) => v.side === side)
    .map(([k]) => k)
    .join(', ');

const typeName = (letter) => (RECORD_TYPES[letter] ? `${letter} (${RECORD_TYPES[letter].hebrew})` : letter);

/** Rules whose Hebrew is written out one by one. */
const RULES = {
  'file.empty': 'הקובץ ריק: אין בו אף רשומה. נדרשות לפחות רשומת כותרת ורשומת סגירה.',
  'file.record.unknown': 'התו הראשון בשורה אינו סוג רשומה מוכר (O לכותרת, X לסגירה, או אחד מסוגי רשומות הפירוט בטבלת הערכים).',
  'file.header.missing': 'אין בקובץ רשומת כותרת (שורה שמתחילה ב-O).',
  'file.header.duplicate': 'יש בקובץ יותר מרשומת כותרת אחת.',
  'file.header.position': 'רשומת הכותרת אינה השורה הראשונה בקובץ.',
  'file.footer.missing': 'אין בקובץ רשומת סגירה (שורה שמתחילה ב-X).',
  'file.footer.duplicate': 'יש בקובץ יותר מרשומת סגירה אחת.',
  'file.footer.position': 'רשומת הסגירה אינה השורה האחרונה בקובץ.',
  'file.detail.none': 'אין בקובץ רשומות פירוט. תקופה בלי עסקאות אפשרית, ולכן זו אזהרה בלבד.',
  'file.encoding.ascii': 'יש בקובץ תווים שאינם ASCII (למשל אותיות עבריות). החוזר אינו מגדיר קידוד לקובץ, ולכן זו אזהרה.',
  'file.byteWidth':
    'יש רשומות שרוחבן בבתים (UTF-8) גדול מרוחבן בתווים, כך שקורא שסופר בתים ימצא את השדות שאחרי התו החריג מוזזים. החוזר אינו אומר אם הקורא של רשות המסים סופר בתים או תווים, ולכן זו אזהרה.',
  'file.lineEnding.mixed': 'הקובץ מערבב סוגים שונים של סוף שורה (LF, CRLF, CR). אזהרה.',
  'header.length': `אורך רשומת הכותרת אינו ${HEADER.length} תווים בדיוק, כפי שקובע נספח א' בחוזר.`,
  'detail.length': `אורך רשומת הפירוט אינו ${DETAIL.length} תווים בדיוק, כפי שקובע נספח א' בחוזר.`,
  'footer.length': `אורך רשומת הסגירה אינו ${FOOTER.length} תווים בדיוק, כפי שקובע נספח א' בחוזר.`,
  'header.reportMonth.calendar': 'תקופת הדיווח אינה חודש קיים בפורמט YYYYMM (שנה ואחריה חודש).',
  'header.generationDate.calendar':
    'תאריך יצירת הקובץ אינו תאריך קיים בפורמט YYYYMMDD. החוזר סותר את עצמו לגבי הפורמט של שדה זה, ולכן זו אזהרה בלבד.',
  'footer.recordType.literal':
    "רשומת הסגירה מתחילה ב-Z, רשומת הסיכום של קובץ מייצגים (נספח ב'). קובץ של עוסק יחיד נסגר ב-X, והבודק בודק רק קובץ כזה.",
  'footer.licensedDealerId.matchesHeader':
    'מספר העוסק ברשומת הסגירה שונה מזה שבכותרת. החוזר אינו קובע במפורש ששני המספרים זהים, ולכן זו אזהרה בלבד.',
  'detail.S.counterpartyExpected':
    "עסקה מזוהה (S) שבה מספר העוסק של הלקוח הוא אפסים. נספח ג' מסמן את השדה כחובה: מעל 5,000 שקלים לפני מע״מ זו שגיאה, ובסכום נמוך יותר אזהרה. סף 5,000 השקלים הוא של החוזר משנת 2009, שאומר בעצמו שהנתון עשוי להשתנות.",
  'detail.L.vatIdZeros': 'עסקה לא מזוהה (L): מספר הצד שכנגד חייב להיות אפסים. עסקה עם לקוח מזוהה נרשמת כסוג S.',
  'detail.K.vatIdZeros': 'קופה קטנה (K) מאגדת כמה ספקים, ולכן מספר הצד שכנגד חייב להיות אפסים.',
  'detail.K.refNumberInvoiceCount': 'בקופה קטנה (K) שדה האסמכתא מציין את מספר החשבוניות ברשומה, ונמצאו בו אפסים. אזהרה.',
  'detail.R.refNumberZeros':
    "ברשימון יבוא (R) נספח ג' קובע אפסים במספר האסמכתא, ונמצא בו מספר. החוזר אינו חד-משמעי בנקודה זו, ולכן זו אזהרה בלבד.",
  'detail.Y.vatZeros': 'ייצוא (Y) אינו נושא מע״מ, ולכן שדה סכום המע״מ חייב להיות אפסים.',
  'totals.salesRecordCount': `מספר רשומות העסקאות שבכותרת שונה ממספר רשומות העסקאות (${letters('sale')}) שבקובץ.`,
  'totals.inputsCount': `מספר רשומות התשומות שבכותרת שונה ממספר רשומות התשומות (${letters('input')}) שבקובץ.`,
  'totals.pettyCashCap':
    "סך המע״מ ברשומות קופה קטנה (K) עולה על התקרה שבהערה ה' לנספח ג' (2% מסך המע״מ בקובץ או 2,000 שקלים, הגבוה מביניהם) – גם לפי הקריאה המקלה ביותר של החוזר, שבה ה-2% מחושבים על המע״מ של כל הרשומות. זו אזהרה רק כי 2% ו-2,000 השקלים הם נתוני החוזר משנת 2009, והחוזר עצמו אומר שהם עשויים להשתנות.",
};

/** Field rules: `<record>.<field>.<kind>`. A sign rule gets the name of the amount it signs. */
const FIELD_RULES = {
  literal: (f) => `ערך שגוי ב«${f}»: נספח א' בחוזר קובע לשדה הזה ערך קבוע אחד.`,
  sign: (amount) => `בשדה הסימן של «${amount}» מותר רק + או -.`,
  signOfZero: (amount) => `סימן מינוס לסכום אפס ב«${amount}». לפי החוזר, כשהסכום אפס הסימן הוא +.`,
  digits: (f) => `ב«${f}» מותרות ספרות בלבד, לכל רוחב השדה (שדה קצר יותר מתמלא באפסים מובילים).`,
  alphanumeric: (f) =>
    `ב«${f}» יש תו שאינו אות לטינית או ספרה. החוזר אינו מגדיר אילו תווים מותרים בשדה כזה, ולכן זו אזהרה בלבד.`,
  known: () => `סוג הרשומה אינו אחד מ-${Object.keys(RECORD_TYPES).length} הערכים שבטבלת הערכים של החוזר.`,
};

/**
 * A transaction record has ONE sign and TWO amounts (the invoice total and its
 * VAT), and the validator reports `detail.*.signOfZero` two ways: an error when
 * both amounts are zero, a warning when only the invoice total is - a VAT-only
 * credit, which is written in minus. The two must not read alike: "the sign
 * should be +" said of a real credit would have the user turn it into a charge.
 */
const detailSignOfZero = (amount, severity) =>
  severity === 'warning'
    ? `«${amount}» הוא אפס אבל «${fieldHebrew('detail', 'totalVat')}» אינו אפס – כמו בזיכוי של מע״מ בלבד – והסימן הוא מינוס. ` +
      'החוזר קובע שכשהסכום אפס הסימן הוא +, אבל ברשומת פירוט יש סימן אחד לשני סכומים, והחוזר אינו אומר לאיזה מהם הכלל מתכוון. ' +
      'זיכוי נרשם במינוס: אין לשנות את הסימן בלי לבדוק את המסמך.'
    : `סימן מינוס ברשומה שבה גם «${amount}» וגם «${fieldHebrew('detail', 'totalVat')}» הם אפס. לפי החוזר, כשהסכום אפס הסימן הוא +.`;

const RESERVED_FIELDS = new Set(['differentRateSalesAmount', 'differentRateSalesVat']);

/**
 * The failed rule, in Hebrew; null for a rule id this page does not know
 * (the page then says so and shows the validator's English only).
 *
 * @param {string} rule  the finding's rule id
 * @param {{severity?: string}} [finding]  the finding itself, where one rule id
 *   means different things at different severities (`detail.*.signOfZero`)
 */
export function ruleHebrew(rule, finding = {}) {
  const id = String(rule ?? '');
  if (Object.prototype.hasOwnProperty.call(RULES, id)) return RULES[id];

  const field = fieldRuleHebrew(id, finding);
  if (field !== undefined) return field;

  const counterparty = /^detail\.([A-Z])\.counterpartyExpected$/.exec(id);
  const row = counterparty && Object.prototype.hasOwnProperty.call(COUNTERPARTY_ROWS, counterparty[1]) ? COUNTERPARTY_ROWS[counterparty[1]] : null;
  if (row) {
    const letter = counterparty[1];
    const base = `ברשומה מסוג ${typeName(letter)} נספח ג' מחייב את מספר העוסק של הצד שכנגד, והשדה הוא אפסים.`;
    if (row.severity !== 'warning') return base;
    return letter === 'H'
      ? `${base} ברשומה מסוג H זו אזהרה בלבד: ההערה בחוזר מפנה להנחיות שע״ם, שאינן בידינו.`
      : `${base} בסוג רשומה זה הבודק מדווח על כך כאזהרה בלבד.`;
  }

  const reserved = /^header\.([A-Za-z]+)\.reserved$/.exec(id);
  if (reserved && RESERVED_FIELDS.has(reserved[1])) {
    return `שדה שמור לשימוש עתידי («${fieldHebrew('header', reserved[1])}») אינו אפסים. החוזר קובע בו אפסים "לשימוש עתידי", ולכן זו אזהרה בלבד.`;
  }
  return null;
}

/**
 * The Hebrew of a field rule (`<record>.<field>.<kind>`) from the layout alone,
 * without the rule-by-rule texts above: `footer.recordType.literal` has one of
 * those (its "Z" case), and the rule reference also needs the plain field rule.
 * undefined when the id is not a field rule; null when it names no known field.
 */
export function fieldRuleHebrew(rule, finding = {}) {
  const field = /^(header|detail|footer)\.([A-Za-z]+)\.(literal|sign|signOfZero|digits|alphanumeric|known)$/.exec(String(rule ?? ''));
  if (!field) return undefined;
  const spec = SPECS[field[1]].fields.find((f) => f.id === field[2]);
  const named = field[3] === 'sign' || field[3] === 'signOfZero' ? spec?.signs : field[2];
  const name = spec && named ? fieldHebrew(field[1], named) : null;
  if (!name) return null;
  if (field[1] === 'detail' && field[3] === 'signOfZero') return detailSignOfZero(name, finding?.severity);
  return FIELD_RULES[field[3]](name);
}

/** The record a finding is about, when it names one (`detail[i]`, `unknown[i]`, or header/footer by line). */
function recordOf(finding, parsed) {
  const records = parsed?.records ?? [];
  const m = /^(detail|unknown)\[(\d+)\]$/.exec(finding.record);
  if (m) return records[Number(m[2])] ?? null;
  if (finding.record === 'header' || finding.record === 'footer') {
    return records.find((r) => r.kind === finding.record && r.line === finding.line) ?? records.find((r) => r.kind === finding.record) ?? null;
  }
  return null;
}

/** Hebrew for the finding's `record` (`file`, `header`, `footer`, `detail[i]`, `unknown[i]`). */
function recordHebrew(finding, parsed) {
  const m = /^(detail|unknown)\[(\d+)\]$/.exec(finding.record);
  if (finding.record === 'header') return 'רשומת כותרת (O)';
  if (finding.record === 'footer') {
    // Named by its real first character: a representatives' file closes with Z, not X.
    const letter = recordOf(finding, parsed)?.raw?.charAt(0);
    return `רשומת סגירה (${letter || 'X'})`;
  }
  if (finding.record === 'file') return 'כל הקובץ';
  if (m?.[1] === 'unknown') return 'רשומה מסוג לא מוכר';
  if (m?.[1] === 'detail') {
    const record = parsed?.records?.[Number(m[2])];
    const letter = record?.fields?.recordType ?? record?.raw?.charAt(0);
    return RECORD_TYPES[letter] ? `רשומת פירוט ${typeName(letter)}` : 'רשומת פירוט';
  }
  return finding.record;
}

const recordKindOf = (record) => (record === 'header' || record === 'footer' ? record : /^detail\[/.test(record) ? 'detail' : null);

function fieldLabel(finding) {
  if (!finding.field) return '';
  const kind = recordKindOf(finding.record);
  const name = kind ? fieldHebrew(kind, finding.field) : null;
  return name ? `${name} (${finding.field})` : finding.field;
}

/** An "A" record: the initial entry of a representatives' file, which this page does not check. */
export const REPRESENTATIVE_INITIAL_HE =
  "רשומה שמתחילה ב-A היא רשומת הפתיחה של קובץ מייצגים (נספח ב' בחוזר), שמייצג מגיש בשם כמה עוסקים. הבודק בודק רק קובץ של עוסק יחיד (נספח א'), ובו אין רשומה כזו.";

const NOT_UTF8_BYTE_WIDTH_HE =
  'הרוחב בבתים נמדד על הטקסט אחרי שנקרא כ-UTF-8, אבל הקובץ אינו UTF-8 (ראו ההערה בראש התוצאה), ולכן הממצא הזה אינו מתאר את רוחב הרשומות בקובץ עצמו.';

/** The failed rule in Hebrew, for this finding in this file. */
function rowRuleHebrew(finding, parsed, reading) {
  if (finding.rule === 'file.record.unknown' && recordOf(finding, parsed)?.raw?.charAt(0) === REPRESENTATIVE_INITIAL_RECORD_TYPE) {
    return REPRESENTATIVE_INITIAL_HE;
  }
  if (finding.rule === 'file.byteWidth' && reading?.utf8 === false) return NOT_UTF8_BYTE_WIDTH_HE;
  return ruleHebrew(finding.rule, finding);
}

/** One finding as the page lists it. */
function rowOf(finding, parsed, reading) {
  return {
    line: finding.line,
    where: finding.line === null ? 'כל הקובץ' : `שורה ${finding.line}`,
    record: recordHebrew(finding, parsed),
    field: fieldLabel(finding),
    severity: finding.severity,
    severityHe: SEVERITY_HE[finding.severity] ?? finding.severity,
    rule: finding.rule,
    ruleHe: rowRuleHebrew(finding, parsed, reading),
    message: finding.message,
    officialText: finding.officialText ?? null,
    openQuestion: finding.openQuestion ?? null,
  };
}

const count = (n, one, many) => (n === 1 ? one : `${n} ${many}`);
const errorsHe = (n) => count(n, 'שגיאה אחת', 'שגיאות');
const warningsHe = (n) => count(n, 'אזהרה אחת', 'אזהרות');
/** The file's size in records - the total, not how many records have findings. */
const inFileHe = (n) => (n === 0 ? 'בקובץ שאין בו אף רשומה' : n === 1 ? 'בקובץ של רשומה אחת' : `בקובץ של ${n} רשומות`);

/** Said under every result, whatever it is. */
export const NOT_ACCEPTANCE_HE = 'זו בדיקת מבנה בלבד, ולא אישור שהקובץ יתקבל ברשות המסים; מה שהבודק אינו בודק מפורט למעלה, ב«מה נבדק ומה לא».';

/** What a warning is, said after every result that has one. It is not a pass. */
export const WARNING_MEANING_HE =
  'אזהרה אינה נספרת כאן כשגיאה כי החוזר אינו מכריע – ייתכן שרשות המסים תדחה את הקובץ בגללה; כדאי לבדוק כל אזהרה.';

/** Notes about the reading itself (not findings: the circular declares no encoding). */
export const READING_NOTES_HE = Object.freeze({
  notUtf8:
    'הקובץ אינו בקידוד UTF-8 (למשל קובץ עברי שנשמר ב-Windows-1255). הבודק קורא אותו כ-UTF-8, ולכן כל בית שאינו UTF-8 תקין מוצג בממצאים כ-� (U+FFFD), וממצא על רוחב רשומה בבתים מתאר את הטקסט אחרי הקריאה ולא את הקובץ שעל הדיסק.',
  bom:
    'הקובץ מתחיל בסימן סדר בתים (BOM, התו הבלתי נראה U+FEFF), שחלק מהעורכים מוסיפים כששומרים ב-UTF-8. הבודק קורא אותו כתו הראשון של השורה הראשונה, ולכן השורה הראשונה אינה מזוהה כרשומת כותרת גם אם בעורך היא נראית כמו O. החוזר אינו מזכיר BOM; שמירה בלי BOM מונעת את השאלה.',
  representative:
    "הקובץ נראה כמו קובץ מייצגים (נספח ב' בחוזר: רשומת פתיחה A ורשומת סיכום Z), שהבודק אינו בודק – הוא בודק רק קובץ של עוסק יחיד (נספח א'). הממצאים שלמטה הם השוואה לנספח א', ולכן אינם אומרים אם קובץ המייצגים תקין.",
});

/** An Appendix B (representatives') file: an "A" initial record, or a closing record that starts with "Z". */
export function looksLikeRepresentativeFile(parsed) {
  return (parsed?.records ?? []).some(
    (r) =>
      (r.kind === 'unknown' && r.raw.charAt(0) === REPRESENTATIVE_INITIAL_RECORD_TYPE) ||
      (r.kind === 'footer' && r.raw.charAt(0) === REPRESENTATIVE_SUMMARY_RECORD_TYPE),
  );
}

/**
 * The page's view of a validation result.
 *
 * @param {import('../vendor/pcn874/validate.js').ValidationResult} result  validatePcn874(...)
 * @param {{maxRows?: number, reading?: {utf8?: boolean, bom?: boolean}}} [options]  rows beyond maxRows are
 *   counted, not listed; `reading` is what decodePcn874Bytes said about the file's bytes
 * @returns {{verdict: 'invalid'|'warnings'|'clean'|'unsupported', summary: string, notes: string[], rows: object[], total: number}}
 */
export function buildReport(result, { maxRows = 2000, reading = {} } = {}) {
  const { error, warning } = result.counts;
  const records = result.parsed?.records?.length ?? 0;
  const representative = looksLikeRepresentativeFile(result.parsed);
  const verdict = representative ? 'unsupported' : error > 0 ? 'invalid' : warning > 0 ? 'warnings' : 'clean';

  const notes = [];
  if (reading?.utf8 === false) notes.push(READING_NOTES_HE.notUtf8);
  if (reading?.bom === true || result.parsed?.records?.[0]?.raw?.charCodeAt(0) === 0xfeff) notes.push(READING_NOTES_HE.bom);

  const warn = warning === 0 ? '' : warning === 1 ? ' ואזהרה אחת' : ` ו-${warning} אזהרות`;
  let summary;
  if (verdict === 'unsupported') {
    const found =
      error > 0
        ? `${error === 1 ? 'נמצאה' : 'נמצאו'} ${errorsHe(error)}${warn}`
        : warning > 0
          ? `${warning === 1 ? 'נמצאה' : 'נמצאו'} ${warningsHe(warning)}`
          : 'לא נמצאו ממצאים';
    summary = `${READING_NOTES_HE.representative} בהשוואה לנספח א' ${found} ${inFileHe(records)}.`;
  } else if (verdict === 'invalid') {
    summary = `${error === 1 ? 'נמצאה' : 'נמצאו'} ${errorsHe(error)}${warn} ${inFileHe(records)}. הקובץ אינו תואם למבנה שבחוזר של רשות המסים.`;
    if (warning > 0) summary += ` ${WARNING_MEANING_HE}`;
  } else if (verdict === 'warnings') {
    summary = `לא נמצאו שגיאות מבנה ${inFileHe(records)}; יש ${warningsHe(warning)}. ${WARNING_MEANING_HE}`;
  } else {
    summary = `לא נמצאו שגיאות ולא אזהרות מבנה ${inFileHe(records)}.`;
  }
  summary = `${summary} ${NOT_ACCEPTANCE_HE}`;

  const order = (f) => (f.line === null ? -1 : f.line);
  const sorted = result.findings
    .map((f, i) => ({ f, i }))
    .sort((a, b) => order(a.f) - order(b.f) || a.i - b.i)
    .map(({ f }) => f);
  const rows = sorted.slice(0, maxRows).map((f) => rowOf(f, result.parsed, reading));
  return { verdict, summary, notes, rows, total: result.findings.length };
}

/**
 * The largest file the page reads, in bytes. A record is 60 characters (the
 * header 129), so 25 MB is over 400,000 records. The validator runs on the
 * page's own thread and a 62 MB file was measured at 6.8 s and about 680 MB of
 * memory, so a much larger file picked by mistake would freeze the tab; the
 * page refuses it before reading a byte.
 */
export const MAX_FILE_BYTES = 25 * 1024 * 1024;

/**
 * Read a File (from an <input type=file>) with the File API only - nothing
 * leaves the browser - and decode it exactly as the pcn874 CLI does
 * (decodePcn874Bytes: UTF-8, invalid bytes replaced, a leading BOM KEPT, plus
 * whether the bytes were UTF-8 and whether they start with a BOM). The CLI and
 * the page must read the same file the same way, or they would report
 * different things about it.
 *
 * @returns {Promise<{text: string, utf8: boolean, bom: boolean}>}
 */
export async function readPcn874File(file) {
  return decodePcn874Bytes(new Uint8Array(await file.arrayBuffer()));
}
