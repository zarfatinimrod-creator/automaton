/**
 * Revenue Colony — the facts of the owner's status report, from the colony database and the code alone.
 *
 * The owner asked twice for a detailed status report (logs/2026-10-07-owner-status-report.md is the second), and both
 * times ten agents gathered the same facts by hand: the money, the lines, the owner's steps and how alive the loop is.
 * This module reads them; scripts/owner-report.ts prints them, as prose or with --json as one object.
 *
 * It reuses what REPORT.md is built from and does no money arithmetic of its own: the 30-day figures are
 * computePortfolioSummary's, the all-time figures are the same per-line sums (ledger.ts sumWindow, sumUnconverted) over
 * every row the ledger holds, and amounts print through formatIls. The steps are owner-steps.ts's, in its order, with its
 * minutes and its reasons for not asking a step now.
 *
 * The repository is public, so nothing a ledger row carries beyond its amount is read out: no external (platform
 * transaction) id, no note, no source — counts and sums only. Nothing here writes: every call it makes is a SELECT, and
 * the script opens the database read-only.
 */

import type { Database } from "better-sqlite3";
import {
  computePortfolioSummary,
  hasRevenueTables,
  isRevenueColonyEnabled,
  listLines,
  listReviews,
  sumUnconverted,
  sumWindow,
} from "./ledger.js";
import { formatIls } from "./money.js";
import {
  followUpSecretRows,
  frozenOwnerStepsForLine,
  heldFollowUpSecretRows,
  heldOwnerStepsForLine,
  heldSecretRows,
  isOwnerStepOpen,
  openOwnerStepsForLine,
  openSetupItems,
  ownerStepById,
  ownerStepMinutes,
  ownerStepsInOrder,
  SECRET_ROW_GATE_SHORT,
  type OwnerStep,
  type SecretGateSite,
} from "./owner-steps.js";
import { readSite } from "./page-views-reader.js";
import { checkLiveness, LOOP_GAP_ALERT_MS } from "./runner.js";
import type { RevenueLineStatus, RevenueLineTier } from "./types.js";

const DAY_MS = 86_400_000;
const HOUR_MS = 60 * 60 * 1000;

/** Later than any row's occurred_at, so the all-time window holds every row, a future-dated one included. */
const END_OF_TIME = "9999-12-31T23:59:59.999Z";

/** The kv key the tick writes when the ledger sync runs (runner.ts markRan; heartbeat.ts uses the same shape). */
const LEDGER_SYNC_LAST_RUN_KEY = "revenue.last_run.revenue_ledger_sync";

/** One window of the ledger, converted money apart from wallet money, as ledger.ts sums it. Agorot, all positive. */
export interface MoneyWindow {
  /** Converted sales, subscriptions and payouts. */
  revenueAgorot: number;
  /** Converted refunds, out. */
  refundsAgorot: number;
  /** Converted costs, out. */
  costAgorot: number;
  /** Converted revenue rows (sales, subscriptions, payouts). */
  revenueRows: number;
  /** Wallet money (USDC at its value on the day of receipt), revenue less refunds; in no target. */
  unconvertedAgorot: number;
}

export interface OwnerReportStep {
  number: number;
  id: string;
  order: number;
  minutes: [number, number];
  lines: string[];
  /** The half that may be done earlier, with its minutes and the step it may follow. */
  earlyPart: { minutes: number; afterStep: number } | null;
}

export interface OwnerReportStepNotAsked {
  number: number;
  id: string;
  order: number;
  minutes: [number, number];
  /** "done", "frozen" or "held" — in that precedence, as owner-steps.ts reads them. */
  state: "done" | "frozen" | "held";
  /** The reason the code gives: the done date, the rule that froze it, or the precondition's short form. */
  reason: string;
}

export interface OwnerReportLine {
  id: string;
  tier: RevenueLineTier;
  status: RevenueLineStatus;
  targetMonthlyAgorot: number;
  /** Credit cents per month: the board's current allocation. */
  budgetMonthlyCents: number;
  setupDone: boolean;
  /** Owner step numbers this line waits on that are asked now, in execution order. */
  stepsAskedNow: number[];
  /** Steps that gate this line but are frozen or held, with the reason, in execution order. */
  stepsNotAskedNow: { number: number; reason: string }[];
  /** How many of the line's setup items are still asked (owner-steps.ts openSetupItems). */
  openSetupItems: number;
}

export interface OwnerReport {
  asOf: string;
  money: {
    allTime: MoneyWindow;
    last30d: MoneyWindow;
    /** computePortfolioSummary's figures, as REPORT.md prints them. */
    revenueLessRefunds30dAgorot: number;
    net30dAgorot: number;
    targetMonthlyAgorot: number;
    attainment: number;
    rows: { total: number; converted: number; unconverted: number; onNoKnownLine: number };
  };
  lines: OwnerReportLine[];
  killedLines: string[];
  ownerSteps: {
    askedNow: OwnerReportStep[];
    totalMinutesAskedNow: { min: number; max: number };
    notAskedNow: OwnerReportStepNotAsked[];
    /** Secret rows of steps asked now that a gate still holds back, with the gate's reason. */
    heldSecretRows: { step: number; row: string; reason: string }[];
    /** Rows done steps still owe: asked alone once their gate holds, named with the reason before that. */
    owedRows: { step: number; row: string; askedNow: boolean; reason: string | null }[];
  };
  health: {
    enabled: boolean;
    lastLedgerSyncAt: string | null;
    hoursSinceLedgerSync: number | null;
    loopGapAlertHours: number;
    /** The staleness blocker the tick would raise now (runner.ts checkLiveness), or null when it would not. */
    loopGapBlocker: string | null;
    latestBoardReviewAt: string | null;
  };
}

function stepNumber(id: OwnerStep["id"]): number {
  return ownerStepById(id)?.number ?? 0;
}

/** Why a step is not asked now, as the report says it (runner.ts notAskedNowNote); done first, then frozen, then held. */
function notAskedNow(step: OwnerStep): Pick<OwnerReportStepNotAsked, "state" | "reason"> {
  if (step.doneOn) return { state: "done", reason: `done on ${step.doneOn.date}` };
  if (step.frozen) return { state: "frozen", reason: `frozen by ${step.frozen.rule}` };
  return { state: "held", reason: step.precondition?.short ?? "held" };
}

/** The ledger's own per-line sums over [sinceIso, untilIso], over every line in the database. */
function moneyWindow(db: Database, lineIds: string[], sinceIso: string, untilIso: string): MoneyWindow {
  const out: MoneyWindow = { revenueAgorot: 0, refundsAgorot: 0, costAgorot: 0, revenueRows: 0, unconvertedAgorot: 0 };
  for (const id of lineIds) {
    const w = sumWindow(db, id, sinceIso, untilIso);
    out.revenueAgorot += w.revenue;
    out.refundsAgorot += w.refunds;
    out.costAgorot += w.cost;
    out.revenueRows += w.count;
    out.unconvertedAgorot += sumUnconverted(db, id, sinceIso, untilIso);
  }
  return out;
}

/** The site facts a secret row's gate reads; an unreadable site.json holds every gated row back (runner.ts secretGateSite). */
export function gateSite(siteDir?: string): SecretGateSite {
  try {
    return readSite(siteDir);
  } catch {
    return { projectId: "" };
  }
}

function getKv(db: Database, key: string): string | undefined {
  const row = db.prepare("SELECT value FROM kv WHERE key = ?").get(key) as { value: string } | undefined;
  return row?.value;
}

export function buildOwnerReport(
  db: Database,
  opts: { nowIso?: string; site?: SecretGateSite } = {},
): OwnerReport {
  if (!hasRevenueTables(db)) throw new Error("not a colony database: it has no revenue_lines table");
  const nowIso = opts.nowIso ?? new Date().toISOString();
  const nowMs = Date.parse(nowIso);
  if (Number.isNaN(nowMs)) throw new Error(`not a date: ${nowIso}`);
  const site = opts.site ?? gateSite();

  // ── Money ──
  const all = listLines(db);
  const ids = all.map((l) => l.id);
  const summary = computePortfolioSummary(db, nowIso);
  // computeLineMetrics' own 30-day window; the test holds these sums to computePortfolioSummary's.
  const last30d = moneyWindow(db, ids, new Date(nowMs - 30 * DAY_MS).toISOString(), nowIso);
  const rowCounts = db
    .prepare(
      `SELECT COUNT(*) AS total, COALESCE(SUM(unconverted = 1), 0) AS unconverted,
              COALESCE(SUM(line_id NOT IN (SELECT id FROM revenue_lines)), 0) AS orphans
         FROM revenue_ledger`,
    )
    .get() as { total: number; unconverted: number; orphans: number };

  // ── Lines ──
  const lines: OwnerReportLine[] = all
    .filter((l) => l.status !== "killed")
    .map((l) => ({
      id: l.id,
      tier: l.tier,
      status: l.status,
      targetMonthlyAgorot: l.targetMonthlyAgorot,
      budgetMonthlyCents: l.budgetMonthlyCents,
      setupDone: l.humanSetupDone,
      stepsAskedNow: openOwnerStepsForLine(l.id).map((s) => s.number),
      stepsNotAskedNow: [...frozenOwnerStepsForLine(l.id), ...heldOwnerStepsForLine(l.id)]
        .sort((a, b) => a.order - b.order)
        .map((s) => ({ number: s.number, reason: notAskedNow(s).reason })),
      openSetupItems: openSetupItems(l).length,
    }));

  // ── Owner steps ──
  const ordered = ownerStepsInOrder();
  const asked = ordered.filter(isOwnerStepOpen);
  const minutes = ownerStepMinutes(asked);

  // ── Health ──
  const lastSync = getKv(db, LEDGER_SYNC_LAST_RUN_KEY) ?? null;
  const lastSyncMs = lastSync ? Date.parse(lastSync) : NaN;
  const latestBoard = listReviews(db, { level: "board", limit: 1 })[0];

  return {
    asOf: nowIso,
    money: {
      allTime: moneyWindow(db, ids, "", END_OF_TIME),
      last30d,
      revenueLessRefunds30dAgorot: summary.total30dAgorot,
      net30dAgorot: summary.net30dAgorot,
      targetMonthlyAgorot: summary.targetMonthlyAgorot,
      attainment: summary.attainment,
      rows: {
        total: Number(rowCounts.total),
        converted: Number(rowCounts.total) - Number(rowCounts.unconverted),
        unconverted: Number(rowCounts.unconverted),
        onNoKnownLine: Number(rowCounts.orphans),
      },
    },
    lines,
    killedLines: all.filter((l) => l.status === "killed").map((l) => l.id),
    ownerSteps: {
      askedNow: asked.map((s) => ({
        number: s.number,
        id: s.id,
        order: s.order,
        minutes: s.minutes,
        lines: s.lines,
        earlyPart: s.earlyPart ? { minutes: s.earlyPart.minutes, afterStep: stepNumber(s.earlyPart.afterStep) } : null,
      })),
      totalMinutesAskedNow: minutes,
      notAskedNow: ordered
        .filter((s) => !isOwnerStepOpen(s))
        .map((s) => ({ number: s.number, id: s.id, order: s.order, minutes: s.minutes, ...notAskedNow(s) })),
      heldSecretRows: asked.flatMap((s) =>
        heldSecretRows(s, site).map((row) => ({ step: s.number, row: row.name, reason: SECRET_ROW_GATE_SHORT[row.askedOnlyWhen!] })),
      ),
      owedRows: [
        ...followUpSecretRows(site).map(({ step, row }) => ({ step: step.number, row: row.name, askedNow: true, reason: null })),
        ...heldFollowUpSecretRows(site).map(({ step, row }) => ({
          step: step.number,
          row: row.name,
          askedNow: false,
          reason: SECRET_ROW_GATE_SHORT[row.askedOnlyWhen!],
        })),
      ],
    },
    health: {
      enabled: isRevenueColonyEnabled(db),
      lastLedgerSyncAt: Number.isFinite(lastSyncMs) ? new Date(lastSyncMs).toISOString() : null,
      // As checkLiveness rounds the gap it reports.
      hoursSinceLedgerSync: Number.isFinite(lastSyncMs) ? Math.round((nowMs - lastSyncMs) / HOUR_MS) : null,
      loopGapAlertHours: LOOP_GAP_ALERT_MS / HOUR_MS,
      loopGapBlocker: checkLiveness(db, nowMs).find((f) => f.kind === "loop_gap")?.detail ?? null,
      latestBoardReviewAt: latestBoard?.createdAt ?? null,
    },
  };
}

function minutesText([a, b]: [number, number]): string {
  return a === b ? `${a} min` : `${a}-${b} min`;
}

/** The report as English prose, in the order the owner's report needs it: money, lines, owner steps, colony health. */
export function renderOwnerReport(r: OwnerReport): string {
  const out: string[] = [];
  const m = r.money;
  out.push(`# Owner report — from the colony database and the code, as of ${r.asOf}`);
  out.push("");

  out.push("## Money");
  out.push("");
  out.push("| | All time | Last 30 days |");
  out.push("|---|---|---|");
  const row = (label: string, pick: (w: MoneyWindow) => string) => out.push(`| ${label} | ${pick(m.allTime)} | ${pick(m.last30d)} |`);
  row("In, converted (sales, subscriptions, payouts)", (w) => formatIls(w.revenueAgorot));
  row("Out, converted refunds", (w) => formatIls(w.refundsAgorot));
  row("Out, converted costs", (w) => formatIls(w.costAgorot));
  row("In, unconverted (wallet, less refunds; in no target)", (w) => formatIls(w.unconvertedAgorot));
  row("Converted revenue rows", (w) => String(w.revenueRows));
  out.push("");
  out.push(
    `30 days as REPORT.md prints them: converted revenue less refunds ${formatIls(m.revenueLessRefunds30dAgorot)}, ` +
      `net ${formatIls(m.net30dAgorot)}, against a ${formatIls(m.targetMonthlyAgorot)} target (${(m.attainment * 100).toFixed(1)}%).`,
  );
  out.push(
    `Ledger rows: ${m.rows.total} (converted ${m.rows.converted}, unconverted ${m.rows.unconverted})` +
      (m.rows.onNoKnownLine ? `; ${m.rows.onNoKnownLine} on no line in the database, so in none of the sums above.` : "."),
  );
  out.push("");

  out.push(`## Revenue lines (${r.lines.length} not killed; killed: ${r.killedLines.length ? r.killedLines.join(", ") : "none"})`);
  out.push("");
  out.push("| Line | Tier | Status | Target/month | Budget | Setup done | Owner steps asked now | Gating, not asked now | Open setup items |");
  out.push("|---|---|---|---|---|---|---|---|---|");
  for (const l of r.lines) {
    out.push(
      `| \`${l.id}\` | ${l.tier} | ${l.status} | ${formatIls(l.targetMonthlyAgorot)} | ${l.budgetMonthlyCents}c | ` +
        `${l.setupDone ? "yes" : "no"} | ${l.stepsAskedNow.join(", ") || "none"} | ` +
        `${l.stepsNotAskedNow.map((s) => `step ${s.number}: ${s.reason}`).join("; ") || "none"} | ${l.openSetupItems} |`,
    );
  }
  out.push("");

  const s = r.ownerSteps;
  out.push(
    `## Owner steps (docs/OWNER_STEPS.he.md): ${s.askedNow.length} asked now, ` +
      `${s.totalMinutesAskedNow.min}-${s.totalMinutesAskedNow.max} minutes in all`,
  );
  out.push("");
  s.askedNow.forEach((st, i) => {
    const early = st.earlyPart ? `; its early part, ${st.earlyPart.minutes} min, may follow step ${st.earlyPart.afterStep}` : "";
    out.push(`${i + 1}. Step ${st.number} (\`${st.id}\`): ${minutesText(st.minutes)}${early} — lines ${st.lines.join(", ")}`);
  });
  out.push("");
  out.push("Not asked now:");
  out.push("");
  for (const st of s.notAskedNow) out.push(`- Step ${st.number} (\`${st.id}\`, ${minutesText(st.minutes)}): ${st.reason}`);
  for (const h of s.heldSecretRows) out.push(`- Step ${h.step}'s \`${h.row}\` row ${h.reason}`);
  for (const o of s.owedRows) {
    out.push(
      o.askedNow
        ? `- Asked now, alone: step ${o.step}'s \`${o.row}\` row, which the done step still owes`
        : `- Owed by done step ${o.step}: the \`${o.row}\` row ${o.reason}`,
    );
  }
  out.push("");

  const h = r.health;
  out.push("## Colony health");
  out.push("");
  out.push(`- Colony enabled: ${h.enabled ? "yes" : "no (kv revenue.enabled = 0)"}`);
  out.push(
    h.lastLedgerSyncAt
      ? `- Last ledger sync: ${h.lastLedgerSyncAt}, ${h.hoursSinceLedgerSync} hours ago; the loop-gap blocker fires after ` +
          `${h.loopGapAlertHours} hours: ${h.loopGapBlocker ? `firing — ${h.loopGapBlocker}` : "not firing"}`
      : "- Last ledger sync: never recorded (the loop-gap blocker has nothing to measure from)",
  );
  out.push(`- Latest board review: ${h.latestBoardReviewAt ?? "none recorded"}`);
  return out.join("\n") + "\n";
}
