// The Companies Registrar annual fee (אגרה שנתית לרשם החברות): the dates.
//
// Deliberately NOT the amounts. The repo's research corroborated a reduced and
// a full rate across six independent accountancy circulars, and its own author
// wrote that not one primary Israeli legal or government source was ever
// opened - "enough to decide where to build, not enough to publish to users as
// guidance". MISSION rule 4 settles it: an unverified legal figure is not
// published. So this module hands out the rule and the calendar, and
// feeAmountDisclosure() refuses to hand out a shekel amount while the config
// says the amounts are unverified.
//
// The dates carry the same evidence grade as the amounts, which is why the
// page says so out loud next to them. The difference is what a wrong one costs:
// a wrong date sends someone to check earlier than they needed to, a wrong
// amount is a number they will act on.

const MS_PER_DAY = 86_400_000;

function parseIsoDate(iso) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(iso ?? '').slice(0, 10));
  if (!m) return null;
  const [y, mo, d] = [Number(m[1]), Number(m[2]), Number(m[3])];
  const stamp = Date.UTC(y, mo - 1, d);
  const back = new Date(stamp);
  // Rejects 2026-02-30 and friends, which Date.UTC would silently roll over.
  if (back.getUTCFullYear() !== y || back.getUTCMonth() + 1 !== mo || back.getUTCDate() !== d) return null;
  return { y, mo, d, stamp };
}

function parseMonthDay(value) {
  const m = /^(\d{2})-(\d{2})$/.exec(String(value ?? ''));
  if (!m) return null;
  const mo = Number(m[1]);
  const d = Number(m[2]);
  if (mo < 1 || mo > 12 || d < 1 || d > 31) return null;
  return { mo, d };
}

const isoOf = (stamp) => new Date(stamp).toISOString().slice(0, 10);

/**
 * Where today sits in the annual fee cycle.
 *
 * @param {string} todayIso  yyyy-mm-dd
 * @param {object} config    src/config/registrar-fee.json
 * @returns {null|{
 *   today: string, year: number, phase: 'reduced'|'full',
 *   reducedRateDeadline: string, fullRateFrom: string, windowOpen: boolean,
 *   daysToReducedRateDeadline: number,
 *   nextReducedRateDeadline: string, daysToNextReducedRateDeadline: number,
 *   nextFullRateFrom: string
 * }}
 */
export function annualDeadlines(todayIso, config) {
  const today = parseIsoDate(todayIso);
  const reduced = parseMonthDay(config?.deadline?.reducedRateThrough);
  const full = parseMonthDay(config?.deadline?.fullRateFrom);
  if (!today || !reduced || !full) return null;

  const now = today.stamp;
  const reducedThisYear = Date.UTC(today.y, reduced.mo - 1, reduced.d);
  const fullThisYear = Date.UTC(today.y, full.mo - 1, full.d);
  const windowOpen = now <= reducedThisYear;
  const nextYear = windowOpen ? today.y : today.y + 1;

  return {
    today: isoOf(now),
    year: today.y,
    phase: windowOpen ? 'reduced' : 'full',
    windowOpen,
    reducedRateDeadline: isoOf(reducedThisYear),
    fullRateFrom: isoOf(fullThisYear),
    daysToReducedRateDeadline: Math.round((reducedThisYear - now) / MS_PER_DAY),
    nextReducedRateDeadline: isoOf(Date.UTC(nextYear, reduced.mo - 1, reduced.d)),
    daysToNextReducedRateDeadline: Math.round((Date.UTC(nextYear, reduced.mo - 1, reduced.d) - now) / MS_PER_DAY),
    nextFullRateFrom: isoOf(Date.UTC(nextYear, full.mo - 1, full.d)),
  };
}

/** Hebrew, for the page. Kept here so the wording is testable rather than buried in DOM glue. */
export function deadlineMessage(result) {
  if (!result) return 'לא ניתן לחשב – תאריך לא תקין.';
  const dmy = (iso) => iso.split('-').reverse().join('.');
  if (result.windowOpen) {
    const days = result.daysToReducedRateDeadline;
    const left = days === 0 ? 'היום הוא היום האחרון' : `נותרו ${days} ימים`;
    return `חלון התעריף המוזל פתוח: ${left} עד ${dmy(result.reducedRateDeadline)}. מ-${dmy(result.fullRateFrom)} חל התעריף המלא לשנת ${result.year}.`;
  }
  return `חלון התעריף המוזל לשנת ${result.year} נסגר ב-${dmy(result.reducedRateDeadline)}; מ-${dmy(result.fullRateFrom)} חל התעריף המלא. החלון המוזל הבא ייסגר ב-${dmy(result.nextReducedRateDeadline)} – בעוד ${result.daysToNextReducedRateDeadline} ימים.`;
}

/**
 * The amount gate. Returns amounts ONLY when the config says both that the
 * figures were verified against a primary source and that they may be shown.
 * Anything else returns publishable:false and no numbers at all - not "hidden
 * behind a badge", not present in the return value.
 */
export function feeAmountDisclosure(config) {
  const verified = config?.verified === true;
  const allowed = verified && config?.renderAmounts === true;
  if (!allowed) {
    return {
      publishable: false,
      amounts: null,
      reason: verified ? 'render_disabled' : 'unverified',
      sourceToCheck: config?.primarySourceToOpen?.name ?? 'רשם החברות',
      message:
        'שיעורי האגרה לא אומתו מול מקור ראשוני, ולכן הם לא מוצגים כאן. את הסכום המדויק לשנה הנוכחית יש לבדוק באתר רשות התאגידים (רשם החברות).',
    };
  }
  const a = config.amountsAwaitingVerification ?? {};
  return {
    publishable: true,
    amounts: { forYear: a.forYear, reducedIls: a.reducedIls, fullIls: a.fullIls },
    reason: 'verified',
    sourceToCheck: config?.primarySourceToOpen?.name ?? '',
    message: '',
  };
}
