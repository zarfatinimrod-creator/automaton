// "Does this invoice need an allocation number?"
//
// Israel's CTC invoicing model (חשבוניות ישראל): a domestic B2B tax invoice above
// the threshold, measured BEFORE VAT, must carry a 9-digit allocation number
// issued by the Tax Authority. Without one the RECIPIENT cannot deduct input VAT
// - which is why the buyer usually cares more than the seller.
//
// This tool answers the threshold question only. It does not request allocation
// numbers, does not talk to the Tax Authority, and is not tax advice.

export const SCOPE_NOTE =
  'החובה חלה על עסקאות B2B מקומיות בלבד. חשבונית ללקוח פרטי, לגוף ממשלתי או ללקוח בחו״ל אינה נכללת.';

/** The threshold in force on `dateIso`, or null before the model started. */
export function thresholdOn(dateIso, config) {
  const list = config?.thresholds;
  if (!Array.isArray(list) || list.length === 0) return null;
  const date = String(dateIso ?? '').slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return null;

  let current = null;
  for (const entry of [...list].sort((a, b) => a.from.localeCompare(b.from))) {
    if (date >= entry.from) current = entry;
  }
  return current;
}

/** The next threshold change after `dateIso`, so a business can see what is coming. */
export function nextChangeAfter(dateIso, config) {
  const date = String(dateIso ?? '').slice(0, 10);
  const upcoming = (config?.thresholds ?? [])
    .filter((e) => e.from > date)
    .sort((a, b) => a.from.localeCompare(b.from));
  return upcoming[0] ?? null;
}

/**
 * Strict amount parsing. Deliberately NOT money.js `parseAmount`, which maps bad
 * input to 0 - fine for a calculator that shows ₪0.00, wrong here.
 * `Number('')` and `Number(null)` are both 0, so a naive
 * coercion would answer "no allocation number needed" for an empty field - a
 * confident wrong answer on a tool whose entire job is a yes/no. Empty input is
 * reported as empty, junk as invalid, and neither gets a verdict.
 * @returns {{ok:true, value:number}|{ok:false, empty:boolean}}
 */
function parseStrictAmount(raw) {
  if (raw === null || raw === undefined) return { ok: false, empty: true };
  if (typeof raw === 'string') {
    const trimmed = raw.trim();
    if (trimmed === '') return { ok: false, empty: true };
    const parsed = Number(trimmed);
    if (!Number.isFinite(parsed) || parsed < 0) return { ok: false, empty: false };
    return { ok: true, value: parsed };
  }
  if (typeof raw !== 'number' || !Number.isFinite(raw) || raw < 0) return { ok: false, empty: false };
  return { ok: true, value: raw };
}

/**
 * @param {{amountBeforeVat:number|string, dateIso:string, isDomesticB2B:boolean}} input
 * @returns {{required:boolean|null, reason:string, threshold:object|null, next:object|null, marginIls:number|null}}
 */
export function checkAllocationNumber(input, config) {
  const parsed = parseStrictAmount(input?.amountBeforeVat);
  const dateIso = input?.dateIso;
  const threshold = thresholdOn(dateIso, config);
  const next = nextChangeAfter(dateIso, config);

  if (!parsed.ok) {
    return {
      required: null,
      reason: parsed.empty ? 'הזינו סכום לפני מע״מ.' : 'סכום לא תקין. הזינו סכום במספרים, לפני מע״מ.',
      threshold, next, marginIls: null,
    };
  }
  const amount = parsed.value;
  if (!threshold) {
    return { required: null, reason: 'התאריך שהוזן קודם לתחילת מודל חשבוניות ישראל, או שאינו תקין.', threshold: null, next, marginIls: null };
  }
  if (input?.isDomesticB2B === false) {
    return {
      required: false,
      reason: `לא נדרש מספר הקצאה. ${SCOPE_NOTE}`,
      threshold, next, marginIls: null,
    };
  }

  const required = amount > threshold.amountIls;
  const marginIls = Number((amount - threshold.amountIls).toFixed(2));

  return {
    required,
    reason: required
      ? `נדרש מספר הקצאה: הסכום לפני מע״מ עולה על הסף של ${threshold.amountIls.toLocaleString('he-IL')} ₪ שבתוקף מ-${threshold.from}. בלי מספר הקצאה תקין, מקבל החשבונית לא יוכל לנכות מס תשומות.`
      : `לא נדרש מספר הקצאה: הסכום לפני מע״מ אינו עולה על הסף של ${threshold.amountIls.toLocaleString('he-IL')} ₪ שבתוקף מ-${threshold.from}.`,
    threshold,
    next,
    marginIls,
  };
}

/** How close this invoice sits to the line - the number a business actually plans around. */
export function proximityWarning(result) {
  if (!result || result.required === null || !result.threshold) return null;
  const t = result.threshold.amountIls;
  const margin = result.marginIls;
  if (margin === null) return null;
  const within = Math.abs(margin) <= t * 0.1;
  if (!within) return null;
  return result.required
    ? 'הסכום קרוב מאוד לסף מלמעלה. שווה לוודא שהמערכת שלכם מבקשת מספר הקצאה אוטומטית.'
    : 'הסכום קרוב מאוד לסף מלמטה. תוספת קטנה לחשבונית תחייב מספר הקצאה.';
}
