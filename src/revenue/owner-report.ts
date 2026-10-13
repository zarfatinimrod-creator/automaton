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
 *
 * "Shortest path to a first payment" (tick 69, 11.10.2026: the owner asked "can you make me money now?" on 7.10 and
 * 11.10, and each answer was a fresh synthesis): for each line the database holds and has not killed, every owner step
 * that gates it in owner-steps.ts, in the code's `order`, with its minutes, whether it needs an identity check
 * (`identity`; on this line's path, `identityOnLine`: step 6's identity part is apify-actors' alone), its state (asked
 * now, held by a precondition, frozen, done) and gate, and the first sentence of what it
 * unlocks; then what the line also waits on (owner-steps.ts LINE_PAYMENT_WAITS: the scheduled reads, and any owner action
 * outside the eight steps). From those it names the smallest set of steps after which a line can take a payment: a
 * line's set is every step that gates it, done and frozen steps aside (a frozen step's line goes without it at ₪0, which
 * is what `frozen.freeInstead` says), and a line that also needs an owner action outside the eight steps is not counted.
 * The steps print in the code's order beside OWNER_STEP_ORDER_RULED, which states the order the board ruled on 12.10
 * (research/channel-loop/RULING-2026-10-12-owner-step-order.md): the code's `order` is the one checklist's, and the free
 * steps come first because of the gates (step 1 done, step 5 frozen, steps 2 and 3 held until a paid product is ready),
 * not because of a second order.
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
  hasPendingPrecondition,
  heldFollowUpSecretRows,
  identityOnLine,
  heldOwnerStepsForLine,
  heldSecretRows,
  isOwnerStepOpen,
  LINE_PAYMENT_WAITS,
  openOwnerStepsForLine,
  openSetupItems,
  OWNER_STEP_ORDER_RULED,
  ownerStepById,
  ownerStepMinutes,
  ownerStepsForLine,
  ownerStepsInOrder,
  secretRowHoldReason,
  type LinePaymentWait,
  type OwnerStep,
  type OwnerStepIdentity,
  type SecretGateSite,
} from "./owner-steps.js";
import { checkLiveness, gatedRowsFirst, lastRunKey, LOOP_GAP_ALERT_MS, secretGateSite } from "./runner.js";
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

/** One owner step as it stands for a line on the path to its first payment. */
export interface PathStep {
  number: number;
  id: string;
  order: number;
  minutes: [number, number];
  /** In owner-steps.ts's precedence: done, then frozen, then held by a pending precondition; otherwise asked now. */
  state: "asked" | "held" | "frozen" | "done";
  /** What keeps a held or frozen step from being asked (and, for a frozen one, what replaces it free); the done date; null when asked. */
  gate: string | null;
  identity: OwnerStepIdentity;
  /** Whether the step checks the owner's identity on this line's path (owner-steps.ts `identityOnLine`). */
  identityHere: OwnerStepIdentity["needs"];
  /** The first sentence of the step's `unlocks`. */
  unlocks: string;
}

export interface PathLine {
  id: string;
  /** awaiting_setup with setup not done in the database, as the rest of the report reads it. */
  waitsOnOwner: boolean;
  /** Every owner step that gates the line (owner-steps.ts `lines`), in the code's order. */
  steps: PathStep[];
  /** What the line also waits on (owner-steps.ts LINE_PAYMENT_WAITS); none when the code knows of nothing. */
  waits: LinePaymentWait[];
  /** The steps still between the line and a payment: its steps, done and frozen ones aside, in the code's order. */
  toPay: { steps: number[]; minutes: { min: number; max: number } };
  /** Why the eight steps alone cannot make the line payable; empty when they can. */
  notByStepsAlone: string[];
}

export interface PathCandidate {
  line: string;
  steps: number[];
  minutes: { min: number; max: number };
}

export interface FirstPaymentPath {
  /** Every step's number in the code's order (owner-steps.ts `order`). */
  codeOrder: number[];
  /** OWNER_STEP_ORDER_RULED: printed beside the code's order, the order the board ruled on 12.10. */
  orderRuled: string;
  lines: PathLine[];
  /** The line(s) whose remaining steps take the fewest owner minutes, ties included; empty when no line can be paid by the steps alone. */
  smallest: PathCandidate[];
  /** The other candidates at the smallest set's lower bound: the pick between them rests on the upper bound alone. */
  closeBehind: PathCandidate[];
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
    /**
     * Secret rows of steps asked now that a gate, or the step that makes them, still holds back, with the reason
     * (owner-steps.ts secretRowHoldReason): the gated rows first, then the made ones (ruling 12.10 §2(5)).
     */
    heldSecretRows: { step: number; row: string; reason: string }[];
    /**
     * Rows done steps still owe: asked alone once their gate holds (askedNow, printed under its own heading before "Not
     * asked now", as renderReport's "## Asked now: one row of a done step"), named with the reason before that.
     */
    owedRows: { step: number; row: string; askedNow: boolean; reason: string | null }[];
  };
  firstPayment: FirstPaymentPath;
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

/** A text's first sentence: up to the first full stop that a space or the end follows, or the whole text without one. */
export function firstSentence(text: string): string {
  const m = /^.*?\.(?=\s|$)/s.exec(text.trim());
  return m ? m[0] : text.trim();
}

/** A step as it stands on a line's path, in owner-steps.ts's precedence (done, frozen, held), else asked now. */
function pathStep(step: OwnerStep, lineId: string): PathStep {
  const base = {
    number: step.number,
    id: step.id,
    order: step.order,
    minutes: step.minutes,
    identity: step.identity,
    identityHere: identityOnLine(step, lineId),
    unlocks: firstSentence(step.unlocks),
  };
  if (step.doneOn) return { ...base, state: "done", gate: `done on ${step.doneOn.date}` };
  if (step.frozen) {
    return { ...base, state: "frozen", gate: `frozen by ${step.frozen.rule}; instead: ${firstSentence(step.frozen.freeInstead)}` };
  }
  if (hasPendingPrecondition(step)) return { ...base, state: "held", gate: step.precondition!.short };
  return { ...base, state: "asked", gate: null };
}

/**
 * The path to a first payment for each line the database holds and has not killed, and the smallest set of steps that
 * makes one of them payable. Computed from owner-steps.ts (steps, order, minutes, identity, gates, waits) alone; the
 * database supplies which lines exist and whether each still waits on the owner.
 */
export function buildFirstPaymentPath(
  dbLines: { id: string; waitsOnOwner: boolean }[],
  steps: OwnerStep[] = ownerStepsInOrder(),
  waits: Record<string, LinePaymentWait[]> = LINE_PAYMENT_WAITS,
): FirstPaymentPath {
  const lines: PathLine[] = dbLines.map(({ id, waitsOnOwner }) => {
    const gating = ownerStepsForLine(id, steps);
    // Done steps are behind the line; a frozen step's line goes without it at ₪0 (`frozen.freeInstead`).
    const needed = gating.filter((s) => !s.doneOn && !s.frozen);
    const lineWaits = waits[id] ?? [];
    const notByStepsAlone = lineWaits.filter((w) => w.kind === "owner-later").map((w) => w.what);
    if (gating.length === 0) notByStepsAlone.push("owner-steps.ts names no step for this line, so nothing here says what it needs");
    return {
      id,
      waitsOnOwner,
      steps: gating.map((s) => pathStep(s, id)),
      waits: lineWaits,
      toPay: { steps: needed.map((s) => s.number), minutes: ownerStepMinutes(needed) },
      notByStepsAlone,
    };
  });
  const candidates = lines.filter((l) => l.notByStepsAlone.length === 0);
  const fewest = (a: PathLine, b: PathLine) =>
    a.toPay.minutes.min - b.toPay.minutes.min || a.toPay.minutes.max - b.toPay.minutes.max || a.toPay.steps.length - b.toPay.steps.length;
  const best = [...candidates].sort(fewest)[0];
  const candidate = (l: PathLine): PathCandidate => ({ line: l.id, steps: l.toPay.steps, minutes: l.toPay.minutes });
  return {
    codeOrder: ownerStepsInOrder(steps).map((s) => s.number),
    orderRuled: OWNER_STEP_ORDER_RULED,
    lines,
    smallest: best ? candidates.filter((l) => fewest(l, best) === 0).map(candidate) : [],
    closeBehind: best
      ? candidates
          .filter((l) => fewest(l, best) !== 0 && l.toPay.minutes.min === best.toPay.minutes.min)
          .sort(fewest)
          .map(candidate)
      : [],
  };
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
        gatedRowsFirst(heldSecretRows(s, site)).map((row) => ({ step: s.number, row: row.name, reason: secretRowHoldReason(row, site)! })),
      ),
      owedRows: [
        ...followUpSecretRows(site).map(({ step, row }) => ({ step: step.number, row: row.name, askedNow: true, reason: null })),
        ...heldFollowUpSecretRows(site).map(({ step, row }) => ({
          step: step.number,
          row: row.name,
          askedNow: false,
          reason: secretRowHoldReason(row, site)!,
        })),
      ],
    },
    firstPayment: buildFirstPaymentPath(lines.map((l) => ({ id: l.id, waitsOnOwner: l.waitsOnOwner }))),
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

const IDENTITY_WORD: Record<OwnerStepIdentity["needs"], string> = { yes: "yes", part: "in one part", no: "no" };

/** A step's identity check on one line's path: the step's own word, or "no" with the lines its identity part serves. */
function identityHereText(s: PathStep): string {
  if (s.identityHere === s.identity.needs) return IDENTITY_WORD[s.identityHere];
  return `no on this line (its identity part is for ${(s.identity.partLines ?? []).map((l) => `\`${l}\``).join(", ")} only)`;
}

/** "steps 8, 2, 3, 6" or "step 6": numbers in the order given (the code's). */
function stepsText(numbers: number[]): string {
  return `${numbers.length === 1 ? "step" : "steps"} ${numbers.join(", ")}`;
}

/** The "Shortest path to a first payment" section, as lines of the report. */
export function renderFirstPayment(p: FirstPaymentPath): string[] {
  const out: string[] = [];
  out.push("## Shortest path to a first payment (owner-steps.ts, portfolio.ts)");
  out.push("");
  out.push(`Steps in the code's order (owner-steps.ts \`order\`): ${p.codeOrder.join(" → ")}.`);
  out.push(`${p.orderRuled.charAt(0).toUpperCase()}${p.orderRuled.slice(1)}.`);
  out.push("");
  // Each step's identity check once, in the code's order, as the step asks it; each line's list says whether its path meets it.
  const seen = new Map<number, PathStep>();
  for (const l of p.lines) for (const s of l.steps) if (!seen.has(s.number)) seen.set(s.number, s);
  const all = [...seen.values()].sort((a, b) => a.order - b.order);
  out.push("Identity checks, step by step:");
  out.push("");
  for (const s of all) out.push(`- Step ${s.number} (\`${s.id}\`): ${IDENTITY_WORD[s.identity.needs]} — ${s.identity.what}`);
  out.push("");
  for (const l of p.lines) {
    out.push(`### \`${l.id}\`${l.waitsOnOwner ? "" : " (the database no longer has it waiting on the owner)"}`);
    out.push("");
    const item = (s: PathStep) =>
      `step ${s.number} (\`${s.id}\`), ${minutesText(s.minutes)}, identity check: ${identityHereText(s)}` +
      (s.gate ? ` — ${s.gate.replace(/\.$/, "")}` : "") +
      `. Unlocks: ${s.unlocks}`;
    const block = (label: string, state: PathStep["state"][]) => {
      const these = l.steps.filter((s) => state.includes(s.state));
      if (!these.length) return;
      out.push(`${label}:`);
      for (const s of these) out.push(`- ${s.state === "asked" ? "" : `${s.state}: `}${item(s)}`);
    };
    if (!l.steps.length) out.push("No owner step in owner-steps.ts names this line.");
    block("Asked now, in the code's order", ["asked"]);
    block("Held or frozen, with the gate", ["held", "frozen"]);
    block("Done", ["done"]);
    if (l.waits.length) out.push("Also waits on:");
    for (const w of l.waits) {
      out.push(`- ${w.kind === "read" ? "a read the colony takes, not an owner step" : "an owner action outside the eight steps"}: ${w.what} (${w.rule})`);
    }
    out.push(
      l.toPay.steps.length
        ? `Owner steps still between it and a payment: ${stepsText(l.toPay.steps)}, ${l.toPay.minutes.min}-${l.toPay.minutes.max} min` +
            (l.steps.some((s) => s.state === "frozen") ? " (a frozen step left out: the line goes without it at ₪0)" : "") +
            (l.notByStepsAlone.length ? "; the eight steps alone do not make it payable." : ".")
        : `No owner step is still between it and a payment${l.notByStepsAlone.length ? "; the eight steps alone do not make it payable." : "."}`,
    );
    out.push("");
  }
  out.push("### The smallest set");
  out.push("");
  if (!p.smallest.length) {
    out.push("No line can take a payment by the eight owner steps alone: each needs something outside them (above).");
  } else {
    p.smallest.forEach((c, i) => {
      const line = p.lines.find((l) => l.id === c.line)!;
      const ids = line.steps.filter((s) => c.steps.includes(s.number) && s.identityHere !== "no");
      const what = c.steps.length
        ? `${stepsText(c.steps)} (in the code's order), ${c.minutes.min}-${c.minutes.max} minutes in all: after ${c.steps.length === 1 ? "it" : "them"}`
        : "no owner step is left:";
      out.push(
        `${i ? "Or, at the same minutes: " : ""}${i ? what : what.charAt(0).toUpperCase() + what.slice(1)}` +
          ` \`${c.line}\` can take a payment` +
          (line.waits.length ? `, once ${line.waits.length === 1 ? "its read" : "its reads"} above ${line.waits.length === 1 ? "passes" : "pass"}` : "") +
          "." +
          (ids.length ? ` Identity checks among them: ${ids.map((s) => `step ${s.number} (${IDENTITY_WORD[s.identityHere]})`).join(", ")}.` : "") +
          (line.waitsOnOwner
            ? ""
            : ` The database no longer has \`${c.line}\` waiting on the owner, so the owner-steps section above asks none of these for it.`),
      );
    });
  }
  for (const c of p.closeBehind) {
    out.push(
      `Close behind, at the same lower bound: \`${c.line}\`, ${stepsText(c.steps)}, ${c.minutes.min}-${c.minutes.max} min; ` +
        "the upper bound alone decides between them.",
    );
  }
  for (const l of p.lines.filter((x) => x.notByStepsAlone.length)) {
    out.push(`Not counted: \`${l.id}\` — its payment also needs ${l.notByStepsAlone.join("; ")}.`);
  }
  out.push("");
  return out;
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

  out.push(...renderFirstPayment(r.firstPayment));

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
