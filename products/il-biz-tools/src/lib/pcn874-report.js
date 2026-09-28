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
import { HEADER, DETAIL, FOOTER, RECORD_TYPES } from '../vendor/pcn874/layout.js';

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
  'file.byteWidth': 'יש רשומות שרוחבן בבתים (UTF-8) גדול מרוחבן בתווים, כך שקורא שסופר בתים ימצא את השדות שאחרי התו החריג מוזזים. אזהרה.',
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
    "עסקה מזוהה (S) שבה מספר העוסק של הלקוח הוא אפסים. נספח ג' מסמן את השדה כחובה: מעל 5,000 שקלים לפני מע״מ זו שגיאה, ובסכום נמוך יותר אזהרה.",
  'detail.L.vatIdZeros': 'עסקה לא מזוהה (L): מספר הצד שכנגד חייב להיות אפסים. עסקה עם לקוח מזוהה נרשמת כסוג S.',
  'detail.K.vatIdZeros': 'קופה קטנה (K) מאגדת כמה ספקים, ולכן מספר הצד שכנגד חייב להיות אפסים.',
  'detail.K.refNumberInvoiceCount': 'בקופה קטנה (K) שדה האסמכתא מציין את מספר החשבוניות ברשומה, ונמצאו בו אפסים. אזהרה.',
  'detail.R.refNumberZeros':
    "ברשימון יבוא (R) נספח ג' קובע אפסים במספר האסמכתא, ונמצא בו מספר. החוזר אינו חד-משמעי בנקודה זו, ולכן זו אזהרה בלבד.",
  'detail.Y.vatZeros': 'ייצוא (Y) אינו נושא מע״מ, ולכן שדה סכום המע״מ חייב להיות אפסים.',
  'totals.salesRecordCount': `מספר רשומות העסקאות שבכותרת שונה ממספר רשומות העסקאות (${letters('sale')}) שבקובץ.`,
  'totals.inputsCount': `מספר רשומות התשומות שבכותרת שונה ממספר רשומות התשומות (${letters('input')}) שבקובץ.`,
  'totals.pettyCashCap':
    "סך המע״מ ברשומות קופה קטנה (K) עולה על התקרה שבהערה ה' לנספח ג' (2% מסך המע״מ בקובץ או 2,000 שקלים, הגבוה מביניהם). אזהרה בלבד: החוזר אינו מגדיר על איזה סך מחושבים ה-2%, והבודק מחשב על הסך הרחב ביותר.",
};

/** Field rules: `<record>.<field>.<kind>`. A sign rule gets the name of the amount it signs. */
const FIELD_RULES = {
  literal: (f) => `ערך שגוי ב«${f}»: נספח א' בחוזר קובע לשדה הזה ערך קבוע אחד.`,
  sign: (amount) => `בשדה הסימן של «${amount}» מותר רק + או -.`,
  signOfZero: (amount) => `סימן מינוס לסכום אפס ב«${amount}». לפי החוזר, כשהסכום אפס הסימן הוא +.`,
  digits: (f) => `ב«${f}» מותרות ספרות בלבד, לכל רוחב השדה (שדה קצר יותר מתמלא באפסים מובילים).`,
  alphanumeric: (f) =>
    `ב«${f}» יש תו שאינו אות לטינית או ספרה. החוזר אינו מגדיר אילו תווים מותרים בשדה כזה, ולכן זו אזהרה בלבד.`,
  known: () => 'סוג הרשומה אינו אחד מאחד-עשר הערכים שבטבלת הערכים של החוזר.',
};

const COUNTERPARTY_TYPES = new Set(['M', 'I', 'T', 'C', 'P', 'H']);
const RESERVED_FIELDS = new Set(['differentRateSalesAmount', 'differentRateSalesVat']);

/**
 * The failed rule, in Hebrew; null for a rule id this page does not know
 * (the page then says so and shows the validator's English only).
 */
export function ruleHebrew(rule) {
  const id = String(rule ?? '');
  if (Object.prototype.hasOwnProperty.call(RULES, id)) return RULES[id];

  const field = /^(header|detail|footer)\.([A-Za-z]+)\.(literal|sign|signOfZero|digits|alphanumeric|known)$/.exec(id);
  if (field) {
    const spec = SPECS[field[1]].fields.find((f) => f.id === field[2]);
    const named = field[3] === 'sign' || field[3] === 'signOfZero' ? spec?.signs : field[2];
    const name = spec && named ? fieldHebrew(field[1], named) : null;
    return name ? FIELD_RULES[field[3]](name) : null;
  }

  const counterparty = /^detail\.([A-Z])\.counterpartyExpected$/.exec(id);
  if (counterparty && COUNTERPARTY_TYPES.has(counterparty[1])) {
    const base = `ברשומה מסוג ${typeName(counterparty[1])} נספח ג' מחייב את מספר העוסק של הצד שכנגד, והשדה הוא אפסים.`;
    return counterparty[1] === 'H'
      ? `${base} ברשומה מסוג H זו אזהרה בלבד: ההערה בחוזר מפנה להנחיות שע״ם, שאינן בידינו.`
      : base;
  }

  const reserved = /^header\.([A-Za-z]+)\.reserved$/.exec(id);
  if (reserved && RESERVED_FIELDS.has(reserved[1])) {
    return `שדה שמור לשימוש עתידי («${fieldHebrew('header', reserved[1])}») אינו אפסים. החוזר קובע בו אפסים "לשימוש עתידי", ולכן זו אזהרה בלבד.`;
  }
  return null;
}

/** Hebrew for the finding's `record` (`file`, `header`, `footer`, `detail[i]`, `unknown[i]`). */
function recordHebrew(finding, parsed) {
  const m = /^(detail|unknown)\[(\d+)\]$/.exec(finding.record);
  if (finding.record === 'header') return 'רשומת כותרת (O)';
  if (finding.record === 'footer') return 'רשומת סגירה (X)';
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

/** One finding as the page lists it. */
function rowOf(finding, parsed) {
  return {
    line: finding.line,
    where: finding.line === null ? 'כל הקובץ' : `שורה ${finding.line}`,
    record: recordHebrew(finding, parsed),
    field: fieldLabel(finding),
    severity: finding.severity,
    severityHe: SEVERITY_HE[finding.severity] ?? finding.severity,
    rule: finding.rule,
    ruleHe: ruleHebrew(finding.rule),
    message: finding.message,
    officialText: finding.officialText ?? null,
    openQuestion: finding.openQuestion ?? null,
  };
}

const count = (n, one, many) => (n === 1 ? one : `${n} ${many}`);
const errorsHe = (n) => count(n, 'שגיאה אחת', 'שגיאות');
const warningsHe = (n) => count(n, 'אזהרה אחת', 'אזהרות');
const inRecordsHe = (n) => (n === 1 ? 'ברשומה אחת' : `ב-${n} רשומות`);

/** Said under every result, whatever it is. */
export const NOT_ACCEPTANCE_HE = 'זו בדיקת מבנה בלבד, ולא אישור שהקובץ יתקבל ברשות המסים.';

/**
 * The page's view of a validation result.
 *
 * @param {import('../vendor/pcn874/validate.js').ValidationResult} result  validatePcn874(...)
 * @param {{maxRows?: number}} [options]  rows beyond maxRows are counted, not listed
 * @returns {{verdict: 'invalid'|'warnings'|'clean', summary: string, rows: object[], total: number}}
 */
export function buildReport(result, { maxRows = 2000 } = {}) {
  const { error, warning } = result.counts;
  const records = result.parsed?.records?.length ?? 0;
  const verdict = error > 0 ? 'invalid' : warning > 0 ? 'warnings' : 'clean';

  let summary;
  if (verdict === 'invalid') {
    const warn = warning === 0 ? '' : warning === 1 ? ' ואזהרה אחת' : ` ו-${warning} אזהרות`;
    summary = `${error === 1 ? 'נמצאה' : 'נמצאו'} ${errorsHe(error)}${warn} ${inRecordsHe(records)}. הקובץ אינו תואם למבנה שבחוזר של רשות המסים.`;
  } else if (verdict === 'warnings') {
    summary =
      `לא נמצאו שגיאות מבנה ${inRecordsHe(records)}; יש ${warningsHe(warning)}. ` +
      'אזהרה אינה פוסלת את הקובץ: היא מסמנת מקום שהחוזר אינו מכריע בו.';
  } else {
    summary = `לא נמצאו שגיאות ולא אזהרות מבנה ${inRecordsHe(records)}.`;
  }
  summary = `${summary} ${NOT_ACCEPTANCE_HE}`;

  const order = (f) => (f.line === null ? -1 : f.line);
  const sorted = result.findings
    .map((f, i) => ({ f, i }))
    .sort((a, b) => order(a.f) - order(b.f) || a.i - b.i)
    .map(({ f }) => f);
  const rows = sorted.slice(0, maxRows).map((f) => rowOf(f, result.parsed));
  return { verdict, summary, rows, total: result.findings.length };
}

/**
 * Decode the file's bytes the way the pcn874 CLI reads a file
 * (`readFileSync(path, 'utf8')`): UTF-8, invalid bytes replaced, and a leading
 * byte-order mark KEPT - the CLI keeps it, so the page must too, or the two
 * would report different things about the same file.
 */
export function decodePcn874(bytes) {
  return new TextDecoder('utf-8', { ignoreBOM: true }).decode(bytes);
}

/** Read a File (from an <input type=file>) with the File API only. Nothing leaves the browser. */
export async function readPcn874File(file) {
  return decodePcn874(new Uint8Array(await file.arrayBuffer()));
}
