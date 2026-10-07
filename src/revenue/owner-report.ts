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
 * minutes and its reasons for not asking a step now — asked, as renderReport asks them, only for the lines the database
 * still has waiting on the owner (awaiting_setup, setup not done): a step open in the code whose every line is killed or
 * set up is named, with its lines' state, and not asked or counted.
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
import { checkLiveness, lastRunKey, LOOP_GAP_ALERT_MS, secretGateSite } from "./runner.js";
import type { RevenueLineStatus, RevenueLineTier } from "./types.js";

const DAY_MS = 86_400_000;
const HOUR_MS = 60 * 60 * 1000;

/** Later than any row's occurred_at, so the all-time window holds every row, a future-dated one included. */
const END_OF_TIME = "9999-12-31T23:59:59.999Z";

/** The kv key the tick writes when the ledger sync runs: runner.ts's own key builder, so a rename there moves this too. */
const LEDGER_SYNC_LAST_RUN_KEY = lastRunKey("revenue_ledger_sync");

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
  /** The step's lines that the database still has waiting on the owner (awaiting_setup, setup not done). */
  lines: string[];
  /** The step's other lines in owner-steps.ts, with their state in the database ("killed", "set up (live)", …). */
  linesNotWaiting: { id: string; state: string }[];
  /** The half that may be done earlier, with its minutes and the step it may follow. */
  earlyPart: { minutes: number; afterStep: number } | null;
}

export interface OwnerReportStepNotAsked {
  number: number;
  id: string;
  order: number;
  minutes: [number, number];
  /**
   * "done", "frozen" or "held" — in that precedence, as owner-steps.ts reads them; "no-line-waiting" for a step open in
   * owner-steps.ts that no line in the database still waits on (each of its lines killed, set up or absent).
   */
  state: "done" | "frozen" | "held" | "no-line-waiting";
  /** The reason the code gives — the done date, the rule that froze it, the precondition's short form — or its lines' state. */
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
  /** awaiting_setup with its setup not done: the lines renderReport lists under "What the owner has to do". */
  waitsOnOwner: boolean;
  /** Owner step numbers this line waits on that are asked now, in execution order; none when it no longer waits. */
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
    /**
     * Rows done steps still owe: asked alone once their gate holds (askedNow, printed under its own heading before "Not
     * asked now", as renderReport's "## Asked now: one row of a done step"), named with the reason before that.
     */
    owedRows: { step: number; row: string; askedNow: boolean; reason: string | null }[];
  };
  health: {
    enabled: boolean;
    lastLedgerSyncAt: string | null;
    /** Rounded as checkLiveness rounds it; negative when the recorded sync is later than the report's clock. */
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

/** The site facts a secret row's gate reads; an unreadable site.json holds every gated row back. runner.ts's own reader, the one renderReport uses. */
export function gateSite(siteDir?: string): SecretGateSite {
  return secretGateSite(siteDir);
}

type DbLine = ReturnType<typeof listLines>[number];

/** A line the owner is still asked for: renderReport's `waiting` (awaiting_setup, setup not done). */
function waitsOnOwner(line: DbLine | undefined): boolean {
  return Boolean(line && line.status === "awaiting_setup" && !line.humanSetupDone);
}

/** How a line that does not wait on the owner stands in the database, for the step that names it. */
function lineState(line: DbLine | undefined): string {
  if (!line) return "not in the database";
  if (line.status === "killed") return "killed";
  return line.humanSetupDone ? `set up (${line.status})` : line.status;
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
  const nowMs = Date.parse(opts.nowIso ?? new Date().toISOString());
  if (Number.isNaN(nowMs)) throw new Error(`not a date: ${opts.nowIso}`);
  // One form for every window bound and for asOf: occurred_at compares as text, so "+03:00" or "Oct 7 2026" would not.
  const nowIso = new Date(nowMs).toISOString();
  const site = opts.site ?? gateSite();

  // ── Money ──
  const all = listLines(db);
  const ids = all.map((l) => l.id);
  const byId = new Map(all.map((l) => [l.id, l]));
  const waits = (id: string) => waitsOnOwner(byId.get(id));
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
      waitsOnOwner: waitsOnOwner(l),
      stepsAskedNow: waitsOnOwner(l) ? openOwnerStepsForLine(l.id).map((s) => s.number) : [],
      stepsNotAskedNow: [...frozenOwnerStepsForLine(l.id), ...heldOwnerStepsForLine(l.id)]
        .sort((a, b) => a.order - b.order)
        .map((s) => ({ number: s.number, reason: notAskedNow(s).reason })),
      openSetupItems: openSetupItems(l).length,
    }));

  // ── Owner steps ──
  const ordered = ownerStepsInOrder();
  const open = ordered.filter(isOwnerStepOpen);
  // Asked only for a line the database still has waiting, as renderReport asks: a killed or set-up line needs no step.
  const asked = open.filter((s) => s.lines.some(waits));
  const minutes = ownerStepMinutes(asked);
  const notWaiting = (s: OwnerStep) => s.lines.filter((id) => !waits(id)).map((id) => ({ id, state: lineState(byId.get(id)) }));

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
        lines: s.lines.filter(waits),
        linesNotWaiting: notWaiting(s),
        earlyPart: s.earlyPart ? { minutes: s.earlyPart.minutes, afterStep: stepNumber(s.earlyPart.afterStep) } : null,
      })),
      totalMinutesAskedNow: minutes,
      notAskedNow: ordered
        .filter((s) => !asked.includes(s))
        .map((s) => ({
          number: s.number,
          id: s.id,
          order: s.order,
          minutes: s.minutes,
          ...(isOwnerStepOpen(s)
            ? {
                state: "no-line-waiting" as const,
                reason:
                  "open in owner-steps.ts, but no line in the database waits on it (" +
                  notWaiting(s).map((l) => `${l.id} ${l.state}`).join(", ") +
                  ")",
              }
            : notAskedNow(s)),
        })),
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
  out.push("| Line | Tier | Status | Target/month | Budget, credit cents/month | Setup done | Owner steps asked now | Gating, not asked now | Open setup items |");
  out.push("|---|---|---|---|---|---|---|---|---|");
  for (const l of r.lines) {
    out.push(
      `| \`${l.id}\` | ${l.tier} | ${l.status} | ${formatIls(l.targetMonthlyAgorot)} | ${l.budgetMonthlyCents} | ` +
        `${l.setupDone ? "yes" : "no"} | ` +
        `${l.stepsAskedNow.join(", ") || (l.waitsOnOwner ? "none" : "none: the line no longer waits on the owner")} | ` +
        `${l.stepsNotAskedNow.map((s) => `step ${s.number}: ${s.reason}`).join("; ") || "none"} | ${l.openSetupItems} |`,
    );
  }
  out.push("");

  const s = r.ownerSteps;
  const owedAsked = s.owedRows.filter((o) => o.askedNow);
  const owedHeld = s.owedRows.filter((o) => !o.askedNow);
  out.push(
    `## Owner steps (docs/OWNER_STEPS.he.md): ${s.askedNow.length} asked now, ` +
      `${s.totalMinutesAskedNow.min}-${s.totalMinutesAskedNow.max} minutes in all` +
      (owedAsked.length ? `, and ${owedAsked.length} row(s) of done steps asked alone` : ""),
  );
  out.push("");
  s.askedNow.forEach((st, i) => {
    const early = st.earlyPart ? `; its early part, ${st.earlyPart.minutes} min, may follow step ${st.earlyPart.afterStep}` : "";
    const others = st.linesNotWaiting.length
      ? ` (owner-steps.ts also names ${st.linesNotWaiting.map((l) => `${l.id}, ${l.state}`).join("; ")})`
      : "";
    out.push(`${i + 1}. Step ${st.number} (\`${st.id}\`): ${minutesText(st.minutes)}${early} — lines ${st.lines.join(", ")}${others}`);
  });
  out.push("");
  if (owedAsked.length) {
    out.push("Asked now, alone (rows done steps still owe):");
    out.push("");
    for (const o of owedAsked) out.push(`- Step ${o.step}'s \`${o.row}\` row: step ${o.step} is done, and this row was held back then`);
    out.push("");
  }
  out.push("Not asked now:");
  out.push("");
  for (const st of s.notAskedNow) out.push(`- Step ${st.number} (\`${st.id}\`, ${minutesText(st.minutes)}): ${st.reason}`);
  for (const h of s.heldSecretRows) out.push(`- Step ${h.step}'s \`${h.row}\` row ${h.reason}`);
  for (const o of owedHeld) out.push(`- Owed by done step ${o.step}: the \`${o.row}\` row ${o.reason}`);
  out.push("");

  const h = r.health;
  out.push("## Colony health");
  out.push("");
  out.push(`- Colony enabled: ${h.enabled ? "yes" : "no (kv revenue.enabled = 0)"}`);
  out.push(
    h.lastLedgerSyncAt
      ? `- Last ledger sync: ${h.lastLedgerSyncAt}, ` +
          (h.hoursSinceLedgerSync! < 0
            ? `${-h.hoursSinceLedgerSync!} hours after this report's clock (a sync time in the future)`
            : `${h.hoursSinceLedgerSync} hours ago`) +
          "; the loop-gap blocker fires after " +
          `${h.loopGapAlertHours} hours: ${h.loopGapBlocker ? `firing — ${h.loopGapBlocker}` : "not firing"}`
      : "- Last ledger sync: never recorded (the loop-gap blocker has nothing to measure from)",
  );
  out.push(`- Latest board review: ${h.latestBoardReviewAt ?? "none recorded"}`);
  return out.join("\n") + "\n";
}
