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

export type RevenueLineSeed = Omit<
  RevenueLine,
  "status" | "humanSetupDone" | "launchedAt" | "createdAt" | "updatedAt" | "killedAt" | "killReason"
> & {
  status?: RevenueLineStatus;
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
  /** Days after launch before a line can be killed for low revenue. */
  graceDays: number;
  /** Days a line may sit in `building` before the supervisor escalates. */
  buildGraceDays: number;
  /** 30-day revenue floor (agorot) after the grace period; below this → kill. */
  killFloorAgorot: number;
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
  graceDays: 45,
  buildGraceDays: 30,
  killFloorAgorot: 50_000, // 500 ILS / 30d
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
