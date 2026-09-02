/**
 * Revenue Colony — decision rules
 *
 * Pure functions. No database access, no inference. The supervisor,
 * the board and the auditor all call the same rules so that an auditor can
 * re-derive any decision from the same numbers and catch drift.
 */

import {
  DEFAULT_DECISION_POLICY,
  type DecisionPolicy,
  type LineDecision,
  type LineMetrics,
  type ReviewDecision,
  type RevenueLine,
} from "./types.js";

export interface DecisionContext {
  /** The previous supervisor decision for this line, if any. */
  previousDecision?: ReviewDecision | null;
  /** Days since the previous decision was filed. */
  daysSincePreviousDecision?: number | null;
}

/**
 * Decide what should happen to a line given its metrics.
 *
 * Order matters: hard stops first, then growth, then health checks.
 */
export function decideLine(
  line: RevenueLine,
  metrics: LineMetrics,
  policy: DecisionPolicy = DEFAULT_DECISION_POLICY,
  ctx: DecisionContext = {},
): LineDecision {
  const triggered: string[] = [];
  const decide = (decision: ReviewDecision, rationale: string): LineDecision => ({
    lineId: line.id,
    decision,
    rationale,
    triggered,
  });

  if (line.status === "killed") {
    return decide("hold", "line is killed; nothing to review");
  }
  if (line.status === "paused") {
    return decide("hold", "line is paused by the board; supervisor does not act on paused lines");
  }
  if (line.status === "proposed" || line.status === "awaiting_setup") {
    if (line.status === "awaiting_setup" && !line.humanSetupDone) {
      triggered.push("awaiting_human_setup");
      return decide("escalate", `blocked on one-time human setup: ${line.humanSetup.join("; ") || "unspecified"}`);
    }
    return decide("hold", "line not started yet");
  }

  const net30 = metrics.net30dAgorot;
  const rev30 = metrics.revenue30dAgorot - metrics.refunds30dAgorot;

  // ── Building: escalate if the build drags on with no money ──
  if (line.status === "building") {
    if (metrics.daysSinceCreated >= policy.buildGraceDays && rev30 <= 0) {
      triggered.push("build_overdue");
      return decide(
        "escalate",
        `still building after ${metrics.daysSinceCreated.toFixed(0)} days with no revenue (grace ${policy.buildGraceDays}d); director must ship or the board should kill`,
      );
    }
    return decide("hold", "build in progress within grace period");
  }

  // ── Live / scaling ──
  const launchedDays = metrics.daysSinceLaunch ?? metrics.daysSinceCreated;

  // Hard kill: past grace and under the revenue floor.
  if (launchedDays >= policy.graceDays && rev30 < policy.killFloorAgorot) {
    triggered.push("below_kill_floor");
    return decide(
      "kill",
      `30-day revenue ${rev30} agorot is below the floor ${policy.killFloorAgorot} after ${launchedDays.toFixed(0)} days live (grace ${policy.graceDays}d)`,
    );
  }

  // Costs dominate revenue: pivot once, then kill.
  if (launchedDays >= 21 && metrics.cost30dAgorot > 0 && metrics.cost30dAgorot > rev30 * policy.killCostRatio) {
    triggered.push("cost_ratio_exceeded");
    if (ctx.previousDecision === "pivot") {
      return decide(
        "kill",
        `costs ${metrics.cost30dAgorot} agorot exceed ${policy.killCostRatio}× revenue ${rev30} for a second review after a pivot`,
      );
    }
    return decide(
      "pivot",
      `costs ${metrics.cost30dAgorot} agorot exceed ${policy.killCostRatio}× revenue ${rev30}; change the offer/channel or cut spend before the next review`,
    );
  }

  // Scale: hitting target with healthy margin.
  const margin = rev30 > 0 ? net30 / rev30 : 0;
  if (
    line.targetMonthlyAgorot > 0
    && metrics.targetAttainment >= policy.scaleAttainment
    && margin >= policy.minMarginForScale
    && line.status !== "scaling"
  ) {
    triggered.push("target_reached");
    return decide(
      "scale",
      `30-day revenue ${rev30} agorot reached ${(metrics.targetAttainment * 100).toFixed(0)}% of target with ${(margin * 100).toFixed(0)}% margin`,
    );
  }

  // Revenue collapsing relative to the 30-day baseline.
  if (rev30 > 0 && metrics.trend < policy.collapseTrend) {
    triggered.push("revenue_collapse");
    return decide(
      "escalate",
      `7-day run-rate is ${(metrics.trend * 100).toFixed(0)}% of the 30-day level; investigate channel/platform changes`,
    );
  }

  // Live but silent for too long.
  if (
    metrics.daysSinceLastRevenue !== null
    && metrics.daysSinceLastRevenue >= policy.staleDays
    && launchedDays >= policy.staleDays
  ) {
    triggered.push("stale_revenue");
    return decide(
      "escalate",
      `no revenue for ${metrics.daysSinceLastRevenue.toFixed(0)} days on a live line`,
    );
  }

  return decide("hold", "within policy; continue the operating loop");
}

/**
 * Portfolio-level constraint: limit concurrent experiments so the colony does
 * not spread compute across too many unproven lines. Returns the ids of the
 * experimental lines that should be paused (newest first beyond the cap).
 */
export function experimentsToPause(
  lines: RevenueLine[],
  policy: DecisionPolicy = DEFAULT_DECISION_POLICY,
): string[] {
  const active = lines
    .filter((l) => l.tier === "experimental" && (l.status === "building" || l.status === "live" || l.status === "scaling"))
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  if (active.length <= policy.maxExperiments) return [];
  return active.slice(policy.maxExperiments).map((l) => l.id);
}

/**
 * Allocate a monthly compute budget (credit cents) across active lines.
 *
 * Weights: tier (core 3, growth 2, experimental 1) × performance multiplier
 * (1 + clamp(targetAttainment, 0, 2)). Lines the rules say to kill get zero.
 * A floor guarantees each surviving line at least `floorCents` so an
 * experiment is never starved before it had a chance.
 */
export function allocateBudget(
  totalCents: number,
  lines: RevenueLine[],
  metricsById: Map<string, LineMetrics>,
  decisionsById: Map<string, LineDecision>,
  floorCents = 500,
): Map<string, number> {
  const out = new Map<string, number>();
  const eligible = lines.filter((l) => {
    if (!(l.status === "building" || l.status === "live" || l.status === "scaling")) return false;
    const d = decisionsById.get(l.id);
    return !(d && d.decision === "kill");
  });
  if (eligible.length === 0 || totalCents <= 0) {
    for (const l of lines) out.set(l.id, 0);
    return out;
  }

  const tierWeight = { core: 3, growth: 2, experimental: 1 } as const;
  const weights = eligible.map((l) => {
    const m = metricsById.get(l.id);
    const attainment = Math.max(0, Math.min(2, m?.targetAttainment ?? 0));
    const scaleBoost = decisionsById.get(l.id)?.decision === "scale" ? 1.5 : 1;
    return tierWeight[l.tier] * (1 + attainment) * scaleBoost;
  });
  const totalWeight = weights.reduce((s, w) => s + w, 0);

  const floorTotal = Math.min(totalCents, floorCents * eligible.length);
  const remaining = Math.max(0, totalCents - floorTotal);
  const perFloor = Math.floor(floorTotal / eligible.length);

  let allocated = 0;
  eligible.forEach((l, i) => {
    const share = perFloor + Math.floor((remaining * weights[i]) / totalWeight);
    out.set(l.id, share);
    allocated += share;
  });
  // Give rounding dust to the highest-weight line.
  const dust = totalCents - allocated;
  if (dust > 0) {
    let best = 0;
    weights.forEach((w, i) => { if (w > weights[best]) best = i; });
    out.set(eligible[best].id, (out.get(eligible[best].id) ?? 0) + dust);
  }
  for (const l of lines) if (!out.has(l.id)) out.set(l.id, 0);
  return out;
}

/**
 * Auditor check: does a filed decision agree with what the rules produce from
 * the raw numbers? Anything other than exact agreement is a flag, except that
 * a stricter human/board decision (kill/pause over hold) is accepted.
 */
export function auditDecision(
  filed: ReviewDecision,
  recomputed: ReviewDecision,
): { verdict: "approve" | "flag"; reason: string } {
  if (filed === recomputed) return { verdict: "approve", reason: "filed decision matches the rules" };
  const severity: Record<ReviewDecision, number> = {
    hold: 0, approve: 0, reject: 0, flag: 0, scale: 1, pivot: 2, escalate: 2, kill: 3,
  };
  if (severity[filed] > severity[recomputed] && recomputed !== "scale") {
    return { verdict: "approve", reason: `filed decision "${filed}" is stricter than the rules' "${recomputed}"; conservative deviations are allowed` };
  }
  return { verdict: "flag", reason: `filed "${filed}" but the rules derive "${recomputed}" from the same ledger` };
}

export function describeDecision(d: LineDecision): string {
  const flags = d.triggered.length ? ` [${d.triggered.join(", ")}]` : "";
  return `${d.lineId}: ${d.decision.toUpperCase()}${flags} — ${d.rationale}`;
}
