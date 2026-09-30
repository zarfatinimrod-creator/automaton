/**
 * Revenue Colony — shared types
 *
 * The revenue colony is the income engine layered on top of the automaton's
 * orchestration primitives (goals → planner → task graph → workers).
 *
 * Chain of command (top to bottom):
 *   board          — the parent automaton. Owns the portfolio, the target,
 *                    budgets, and every launch / kill decision.
 *   director       — one per revenue line. Owns that line's operating loop and
 *                    submits goals for it.
 *   supervisor     — one per director. Reviews the director's output against
 *                    the line's KPIs on a fixed cadence and files a decision.
 *   worker         — executes the tasks the planner emits for a goal.
 *   auditor        — samples supervisor reviews and re-derives the decision
 *                    from the raw ledger. Flags disagreements.
 *   chief_auditor  — audits the auditors: checks that audits happened and that
 *                    flags were acted on by the board.
 *
 * All money is normalised to ILS agorot (1 ILS = 100 agorot) so that the
 * portfolio can be compared against a shekel target regardless of the
 * currency a platform paid in.
 */

export type RevenueLineTier = "core" | "growth" | "experimental";

export type RevenueLineStatus =
  | "proposed"        // in the portfolio, not yet started
  | "awaiting_setup"  // blocked on a one-time human action (account, KYC, bank)
  | "building"        // director has an active build goal
  | "measuring"       // a pre-registered measurement experiment: judged by its own gates (experiments.ts), never by the revenue floor, never counted as live
  | "live"            // product/service is shipped and can take payments
  | "scaling"         // board approved scale; extra budget allocated
  | "paused"          // deliberately on hold (board decision)
  | "killed";         // terminated; kept for audit history

export type RevenueCategory =
  | "digital_product"
  | "micro_saas"
  | "paid_api"
  | "agent_service"
  | "content"
  | "service"
  | "other";

export type CommandLevel =
  | "board"
  | "director"
  | "supervisor"
  | "worker"
  | "auditor"
  | "chief_auditor";

export type ReviewDecision =
  | "hold"      // keep going, nothing to change
  | "scale"     // allocate more budget / spawn more workers
  | "pivot"     // keep the line but change the offer / channel
  | "kill"      // terminate the line
  | "escalate"  // needs the board (or the creator) to decide
  | "approve"   // auditor agrees with the reviewed decision
  | "reject"    // board rejected a proposal
  | "flag";     // auditor disagrees with the reviewed decision

export type LedgerKind = "sale" | "subscription" | "payout" | "refund" | "cost";

export type LedgerSource =
  | "stripe"
  | "lemonsqueezy"
  | "gumroad"
  | "paddle"
  | "x402"
  | "conway"
  | "manual"
  | string;

export interface RevenueLine {
  id: string;
  name: string;
  category: RevenueCategory;
  tier: RevenueLineTier;
  status: RevenueLineStatus;
  directorRole: string;
  operatingLoop: string;
  kpis: string[];
  killCriteria: string[];
  scaleCriteria: string[];
  targetMonthlyAgorot: number;
  budgetMonthlyCents: number;
  humanSetup: string[];
  humanSetupDone: boolean;
  skillName: string | null;
  launchedAt: string | null;
  createdAt: string;
  updatedAt: string;
  killedAt: string | null;
  killReason: string | null;
}

/**
 * One item of a line's one-time setup list, linked to the owner steps it belongs to (owner-steps.ts `number`, the
 * number the owner sees). The report asks an item until every one of its `steps` is done. `contextSteps` are steps its
 * text names without being part of them — an order note ("straight after step 1"), a step it says is not asked (the
 * frozen step 5) — and never keep it asked. owner-steps.test.ts holds the two lists to exactly the steps the text names.
 */
export interface HumanSetupItem {
  text: string;
  steps: number[];
  contextSteps?: number[];
}

export type RevenueLineSeed = Omit<
  RevenueLine,
  "status" | "humanSetupDone" | "launchedAt" | "createdAt" | "updatedAt" | "killedAt" | "killReason"
> & {
  status?: RevenueLineStatus;
  /** `humanSetup` as linked items, in the same order; the ledger stores only the texts. */
  humanSetupItems?: HumanSetupItem[];
};

export interface LedgerEntry {
  id: string;
  lineId: string;
  kind: LedgerKind;
  amountMinor: number;
  currency: string;
  amountAgorot: number;
  source: LedgerSource;
  externalId: string | null;
  occurredAt: string;
  recordedAt: string;
  note: string | null;
}

export interface LedgerEntryInput {
  lineId: string;
  kind: LedgerKind;
  amountMinor: number;
  currency: string;
  source: LedgerSource;
  externalId?: string | null;
  occurredAt?: string;
  note?: string | null;
}

export interface LineMetrics {
  lineId: string;
  status: RevenueLineStatus;
  revenue30dAgorot: number;
  revenue7dAgorot: number;
  refunds30dAgorot: number;
  cost30dAgorot: number;
  net30dAgorot: number;
  transactions30d: number;
  /** Ratio of 7-day run-rate (×30/7) to 30-day revenue. 1.0 = flat. */
  trend: number;
  daysSinceCreated: number;
  daysSinceLaunch: number | null;
  daysSinceLastRevenue: number | null;
  targetMonthlyAgorot: number;
  /** revenue30d / target, 0..∞ */
  targetAttainment: number;
}

export interface PortfolioSummary {
  asOf: string;
  targetMonthlyAgorot: number;
  stretchMonthlyAgorot: number;
  total30dAgorot: number;
  total7dAgorot: number;
  totalCost30dAgorot: number;
  net30dAgorot: number;
  /** total30d / target */
  attainment: number;
  /** 7d run-rate extrapolated to a month */
  runRateMonthlyAgorot: number;
  lines: LineMetrics[];
  counts: Record<RevenueLineStatus, number>;
}

export interface ReviewRecord {
  id: string;
  lineId: string | null;
  level: CommandLevel;
  reviewer: string;
  periodStart: string;
  periodEnd: string;
  metrics: Record<string, unknown>;
  decision: ReviewDecision;
  rationale: string;
  reviewedReviewId: string | null;
  createdAt: string;
}

export interface ReviewInput {
  lineId: string | null;
  level: CommandLevel;
  reviewer: string;
  periodStart: string;
  periodEnd: string;
  metrics: Record<string, unknown>;
  decision: ReviewDecision;
  rationale: string;
  reviewedReviewId?: string | null;
}

export interface DecisionPolicy {
  /**
   * Days after launch before a line can be killed for low revenue. `launchedAt` is set when a line becomes `live`, and
   * `live` means the first ledger entry with a platform id (MISSION rule 2) — so this is 90 days from the first shekel.
   * Every line in the portfolio states 90 (board ruling 28.9.2026, research/channel-loop/RULING-2026-09-28-floors.md §8).
   */
  graceDays: number;
  /** Days a line may sit in `building` before the supervisor escalates. */
  buildGraceDays: number;
  /**
   * 30-day revenue floor after the grace period, as a fraction (0 < f ≤ 1) of the LINE'S OWN target; below it → kill.
   * Replaced a fixed ₪500 on 28.9.2026: after the 7.9 retarget the fixed floor exceeded three of the four targets, so a
   * line at its own target would have been killed. A fraction moves with every retarget and can never sit above the
   * target. Lines override it through TARGET_BASIS.killFloorFraction (portfolio.ts → policyForLine).
   */
  killFloorFraction: number;
  /** cost30d > revenue30d × ratio (after 21 days) → pivot, then kill. */
  killCostRatio: number;
  /** Minimum net margin (net/revenue) to be eligible for scale. */
  minMarginForScale: number;
  /** Fraction of target that qualifies a line for scale. */
  scaleAttainment: number;
  /** trend below this (e.g. 0.4 = revenue collapsing) → escalate. */
  collapseTrend: number;
  /** Days without any revenue on a live line before escalation. */
  staleDays: number;
  /** Max lines simultaneously in building/live with tier=experimental. */
  maxExperiments: number;
}

export const DEFAULT_DECISION_POLICY: DecisionPolicy = {
  graceDays: 90,
  buildGraceDays: 30,
  killFloorFraction: 0.25, // the softer of the two ratios the lines state (pcn874 ₪150/₪600); il-biz-tools overrides to 0.5
  killCostRatio: 2,
  minMarginForScale: 0.5,
  scaleAttainment: 1.0,
  collapseTrend: 0.4,
  staleDays: 21,
  maxExperiments: 3,
};

export interface LineDecision {
  lineId: string;
  decision: ReviewDecision;
  rationale: string;
  triggered: string[];
}

export interface RevenueColonyConfig {
  enabled: boolean;
  targetMonthlyAgorot: number;
  stretchMonthlyAgorot: number;
  policy: DecisionPolicy;
}

export const DEFAULT_REVENUE_COLONY_CONFIG: RevenueColonyConfig = {
  enabled: true,
  targetMonthlyAgorot: 2_000_000, // 20,000 ILS
  stretchMonthlyAgorot: 5_000_000, // 50,000 ILS
  policy: DEFAULT_DECISION_POLICY,
};

/** KV keys used by the revenue colony. */
export const REVENUE_KV = {
  enabled: "revenue.enabled",
  target: "revenue.target_monthly_agorot",
  stretch: "revenue.stretch_monthly_agorot",
  fxPrefix: "revenue.fx.", // + CURRENCY, value = ILS per unit
  goalQueue: "revenue.goal_queue",
  lastBoardDirective: "revenue.last_board_directive",
  productMap: "revenue.product_map", // JSON { "<source>:<productId>": "<lineId>" }
  connectorCursorPrefix: "revenue.connector_cursor.", // + source
} as const;
