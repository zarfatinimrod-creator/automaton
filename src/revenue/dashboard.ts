/**
 * Revenue Colony — the manager's screen
 *
 * A single self-contained HTML page the owner can open on his phone and see the
 * company: what it earns, what the plan rests on, what is stuck, and what needs
 * him.
 *
 * The reason this is generated code and not an app: it reads the same SQLite
 * ledger through the same helpers as the board report, so it **cannot display a
 * number that is not in the ledger**. MISSION is explicit that a dashboard able
 * to show money nobody earned is worse than no dashboard, because it makes the
 * one failure this system exists to prevent look like success. Deriving the page
 * instead of authoring it is what makes that guarantee structural rather than a
 * promise.
 *
 * It also has to be honest about zero. The company has earned nothing yet, so
 * the page leads with the state in a sentence rather than a big ₪0 in a tile
 * designed to look impressive, and every total travels with its evidence grade.
 */

import type { Database } from "better-sqlite3";
import { computePortfolioSummary, latestReviewForLine, listLines } from "./ledger.js";
import { formatIls } from "./money.js";
import { summarizeTargetBasis, TARGET_BASIS } from "./portfolio.js";
import { sweepCoverage } from "./criteria.js";
import { findStalledLines } from "./watchdog.js";
import { FINAL_GOAL_MONTHLY_ILS, MEASURED_ASSUMPTIONS, storesNeededFor } from "./growth.js";
import { ownerFloatState } from "./budget.js";
import type { LineMetrics } from "./types.js";

const esc = (v: unknown): string =>
  String(v).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));

const STATUS_HE: Record<string, string> = {
  proposed: "מוצע",
  awaiting_setup: "ממתין לך",
  building: "בבנייה",
  live: "חי",
  scaling: "בהגדלה",
  paused: "מושהה",
  killed: "נסגר",
};

const GRADE_HE: Record<string, string> = {
  measured: "נמדד",
  inferred: "מוסק",
  unevidenced: "ללא ראיה",
};

export interface DashboardOptions {
  nowIso?: string;
  /** Blockers from the tick that produced this page, if any. */
  blockers?: string[];
}

export function renderDashboard(db: Database, options: DashboardOptions = {}): string {
  const nowIso = options.nowIso ?? new Date().toISOString();
  const nowMs = Date.parse(nowIso);
  const summary = computePortfolioSummary(db, nowIso);
  const lines = listLines(db).filter((l) => l.status !== "killed");
  const metrics = new Map<string, LineMetrics>((summary?.lines ?? []).map((m) => [m.lineId, m]));
  const basis = summarizeTargetBasis();
  const stalled = findStalledLines(db, nowMs);
  const coverage = sweepCoverage(db, nowMs);
  const earnedAgorot = summary?.total30dAgorot ?? 0;
  const goalIls = Math.round((summary?.targetMonthlyAgorot ?? 0) / 100);

  const needsOwner = lines
    .filter((l) => !l.humanSetupDone && l.humanSetup.length > 0)
    .map((l) => ({ id: l.id, name: l.name, steps: l.humanSetup }));

  const storesNeeded = storesNeededFor(FINAL_GOAL_MONTHLY_ILS);
  const float = ownerFloatState(db);
  const liveLines = lines.filter((l) => l.status === "live" || l.status === "scaling").length;
  const sweptTotal = coverage.reduce((n, g) => n + g.swept, 0);
  const criteriaTotal = coverage.reduce((n, g) => n + g.total, 0);

  // The headline is a sentence about the state, not a figure in a tile. A real
  // zero deserves an explanation, not a decoration.
  const headline = earnedAgorot > 0
    ? `החברה הרוויחה ${formatIls(earnedAgorot)} ב-30 הימים האחרונים.`
    : "החברה עדיין לא הרוויחה שקל.";
  const subhead = earnedAgorot > 0
    ? `זה ${((earnedAgorot / Math.max(1, summary?.targetMonthlyAgorot ?? 1)) * 100).toFixed(1)}% מהיעד של ${formatIls(summary?.targetMonthlyAgorot ?? 0)} לחודש.`
    : needsOwner.length > 0
      ? `${needsOwner.length} מקורות הכנסה בנויים ומחכים להרשמות חד-פעמיות שלך. כל עוד הן לא בוצעו, אף אחד מהם לא יכול לקבל כסף.`
      : "אין קווים שממתינים לך — הבלימה היא אצלנו, לא אצלך.";

  const rows = lines.map((line) => {
    const m = metrics.get(line.id);
    const review = latestReviewForLine(db, line.id, "supervisor");
    const b = TARGET_BASIS[line.id];
    return `      <tr>
        <td><strong>${esc(line.name)}</strong><br><code>${esc(line.id)}</code></td>
        <td><span class="pill s-${esc(line.status)}">${esc(STATUS_HE[line.status] ?? line.status)}</span></td>
        <td class="num">${esc(formatIls(m?.revenue30dAgorot ?? 0))}</td>
        <td class="num">${esc(formatIls(line.targetMonthlyAgorot))}<br><span class="grade g-${esc(b?.grade ?? "unevidenced")}">${esc(GRADE_HE[b?.grade ?? "unevidenced"])}</span></td>
        <td>${esc(review?.decision ?? "—")}</td>
      </tr>`;
  }).join("\n");

  const ownerBlocks = needsOwner.length === 0
    ? '<p class="empty">אין כרגע צעד שממתין לך.</p>'
    : needsOwner.map((l) => `      <details>
        <summary>${esc(l.name)}</summary>
        <ol>${l.steps.map((st) => `<li>${esc(st)}</li>`).join("")}</ol>
      </details>`).join("\n");

  const blockerItems = (options.blockers ?? []).filter((b) => !b.includes("waiting on the owner"));
  const stallItems = stalled.map((s) =>
    `${s.lineId}: ${s.daysSinceProgress} ימים ללא ${s.lastSignal ? "התקדמות" : "שום תוצר מאז שנפתח"}`);

  return `<!doctype html>
<html lang="he" dir="rtl">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex">
<title>הקולוניה — מסך המנהל</title>
<style>
  :root { --bg:#f6f7f9; --card:#fff; --line:#e3e6ea; --ink:#16191d; --muted:#666e79;
          --ok:#1f7a4d; --warn:#a8620a; --bad:#a3242b; --accent:#2b5fd9; }
  @media (prefers-color-scheme: dark) {
    :root { --bg:#12151a; --card:#1a1f26; --line:#2b323b; --ink:#e8ebef; --muted:#98a1ac;
            --ok:#4fbf87; --warn:#e0a458; --bad:#e0737b; --accent:#7aa2f7; }
  }
  * { box-sizing:border-box; }
  body { margin:0; background:var(--bg); color:var(--ink); font:16px/1.6 system-ui,-apple-system,"Segoe UI",Arial,sans-serif; }
  .wrap { max-width:900px; margin:0 auto; padding:20px 16px 56px; }
  h1 { font-size:1.45rem; margin:.2em 0 .1em; }
  h2 { font-size:1.05rem; margin:1.8em 0 .5em; color:var(--muted); font-weight:600;
       text-transform:uppercase; letter-spacing:.04em; }
  .lede { font-size:1.05rem; color:var(--muted); margin:.2em 0 1.4em; }
  .card { background:var(--card); border:1px solid var(--line); border-radius:12px; padding:14px 16px; margin:10px 0; }
  table { width:100%; border-collapse:collapse; }
  th,td { text-align:right; padding:9px 6px; border-bottom:1px solid var(--line); vertical-align:top; }
  th { font-size:.8rem; color:var(--muted); font-weight:600; }
  td.num { font-variant-numeric:tabular-nums; white-space:nowrap; }
  code { font-size:.78rem; color:var(--muted); }
  .pill { display:inline-block; padding:2px 9px; border-radius:99px; font-size:.78rem; border:1px solid var(--line); white-space:nowrap; }
  .s-live,.s-scaling { color:var(--ok); border-color:var(--ok); }
  .s-awaiting_setup { color:var(--warn); border-color:var(--warn); }
  .s-building { color:var(--accent); border-color:var(--accent); }
  .grade { font-size:.72rem; }
  .g-measured { color:var(--ok); } .g-inferred { color:var(--warn); } .g-unevidenced { color:var(--bad); }
  .basis { display:grid; grid-template-columns:1fr auto; gap:6px 12px; }
  .basis div:nth-child(even) { font-variant-numeric:tabular-nums; text-align:left; }
  .note { color:var(--muted); font-size:.9rem; }
  .empty { color:var(--muted); }
  ul,ol { margin:.4em 0; padding-inline-start:1.2em; }
  li { margin:.3em 0; }
  details summary { cursor:pointer; font-weight:600; }
  footer { color:var(--muted); font-size:.8rem; margin-top:2em; border-top:1px solid var(--line); padding-top:12px; }
  .bar { height:8px; background:var(--line); border-radius:99px; overflow:hidden; margin:6px 0 2px; }
  .bar > i { display:block; height:100%; background:var(--accent); }
</style>
</head>
<body>
<div class="wrap">
  <h1>${esc(headline)}</h1>
  <p class="lede">${esc(subhead)}</p>

  <h2>מה התוכנית נשענת עליו</h2>
  <div class="card">
    <div class="basis">
      <div>סכום היעדים של כל הקווים</div><div>₪${basis.totalIls.toLocaleString("en")} מול מטרה של ₪${goalIls.toLocaleString("en")}</div>
      <div><span class="g-measured">נמדד</span> — מבוסס על ראיה שאפשר לבדוק</div><div>₪${basis.measuredIls.toLocaleString("en")}</div>
      <div><span class="g-inferred">מוסק</span></div><div>₪${basis.inferredIls.toLocaleString("en")}</div>
      <div><span class="g-unevidenced">ללא ראיה</span> — משימת מחקר, לא תחזית</div><div>₪${basis.unevidencedIls.toLocaleString("en")}</div>
    </div>
    ${basis.unevidencedLines.length ? `<p class="note">הסכום הכנה כרגע הוא <strong>₪${basis.measuredIls.toLocaleString("en")}</strong>, לא ₪${basis.totalIls.toLocaleString("en")}. ללא ראיה: ${basis.unevidencedLines.map((l) => `<code>${esc(l)}</code>`).join(", ")}.</p>` : ""}
  </div>

  <h2>מה מחכה לך (${needsOwner.length})</h2>
  <div class="card">
${ownerBlocks}
  </div>

  <h2>מקורות ההכנסה</h2>
  <div class="card">
    <table>
      <thead><tr><th>קו</th><th>מצב</th><th>30 יום</th><th>יעד</th><th>החלטת מפקח</th></tr></thead>
      <tbody>
${rows}
      </tbody>
    </table>
  </div>

  <h2>חסימות ותקיעות</h2>
  <div class="card">
    ${stallItems.length === 0 && blockerItems.length === 0
      ? '<p class="empty">אין חסימות פתוחות מלבד ההרשמות שלך.</p>'
      : `<ul>${[...stallItems, ...blockerItems].map((b) => `<li>${esc(b)}</li>`).join("")}</ul>`}
  </div>

  <h2>הכסף שלך</h2>
  <div class="card">
    <div class="basis">
      <div>מה שאישרת</div><div>${esc(formatIls(float.capAgorot))}</div>
      <div>מה שהוצא${float.spendCount ? ` (${float.spendCount} חיובים)` : ""}</div><div>${esc(formatIls(float.spentAgorot))}</div>
      <div>מה שנשאר</div><div>${esc(formatIls(float.remainingAgorot))}</div>
    </div>
    <p class="note">
      התקרה נבדקת בקוד לפני כל התחייבות, לא אחריה, וכל חיוב נרשם בלדג'ר עם מזהה קבלה.
      זה סכום חד-פעמי ולא הרשאה חודשית — אם התכוונת אחרת, תגיד ואשנה.
      ${float.spentAgorot === 0 ? "עוד לא הוצא שקל." : ""}
    </p>
  </div>

  <h2>המטרה הסופית</h2>
  <div class="card">
    <div class="basis">
      <div>מיליון ש״ח בשנה, בחודשים</div><div>₪${FINAL_GOAL_MONTHLY_ILS.toLocaleString("en")}</div>
      <div>חנויות שצריך להשיק כדי להגיע לשם</div><div>${storesNeeded.stores === null ? "לא ניתן בהנחות האלה" : storesNeeded.stores.toLocaleString("en")}</div>
      <div>מהן צפויות לעבוד</div><div>${storesNeeded.stores === null ? "—" : Math.round(storesNeeded.stores * MEASURED_ASSUMPTIONS.hitRate).toLocaleString("en")}</div>
      <div>קווים חיים כרגע</div><div>${liveLines}</div>
    </div>
    <p class="note">
      ההנחות: ${(MEASURED_ASSUMPTIONS.hitRate * 100).toFixed(0)}% מהחנויות מגיעות ל-₪${MEASURED_ASSUMPTIONS.hitCeilingIls.toLocaleString("en")} לחודש,
      השאר ל-₪${MEASURED_ASSUMPTIONS.missIls}, ותחזוקה של ₪${MEASURED_ASSUMPTIONS.maintenanceIlsPerStore} לחנות לחודש.
      זה מודל עם קלט מוצהר, לא תחזית — הקלט משתנה כשהמדידות משתנות.
      אם חנות עולה בתחזוקה יותר ממה שהיא מרוויחה בממוצע, עוד חנויות רק מפסידות יותר.
    </p>
  </div>

  <h2>כמה מהשוק כבר נסרק</h2>
  <div class="card">
    <div class="bar"><i style="width:${criteriaTotal ? ((sweptTotal / criteriaTotal) * 100).toFixed(1) : 0}%"></i></div>
    <p class="note">${sweptTotal} מתוך ${criteriaTotal} קריטריונים נסרקו, ב-${coverage.filter((g) => g.lastSupervisedIso).length} קבוצות שעברו פיקוח.</p>
  </div>

  <footer>
    נוצר מהלדג'ר ב-${esc(nowIso)}.
    כל מספר בדף הזה מגיע מ-<code>state/colony/colony.db</code> — אין כאן שדה שאפשר למלא ביד.
  </footer>
</div>
</body>
</html>
`;
}
