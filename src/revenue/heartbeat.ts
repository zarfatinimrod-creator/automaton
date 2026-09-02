/**
 * Revenue Colony — heartbeat tasks (the loop)
 *
 *   revenue_ledger_sync        hourly   pull money events from payment platforms into the ledger
 *   revenue_supervisor_review  6-hourly every supervisor re-derives its line's decision from the ledger
 *   revenue_board_review       daily    the board applies decisions, allocates budget, files goals
 *   revenue_audit              weekly   auditor re-checks supervisor reviews; chief auditor monthly
 *
 * The functions are exported individually so tools and tests can drive them
 * without the scheduler.
 */

import type { Database } from "better-sqlite3";
import type { HeartbeatLegacyContext, HeartbeatTaskFn, TickContext } from "../types.js";
import { createLogger } from "../observability/logger.js";
import { REMOTE_CONNECTORS, readLocalTransfers } from "./connectors/index.js";
import {
  computeLineMetrics,
  computePortfolioSummary,
  getConnectorCursor,
  getLine,
  getProductMap,
  hasRevenueTables,
  insertReview,
  isRevenueColonyEnabled,
  latestReviewForLine,
  listLines,
  listReviews,
  recordLedgerEntry,
  setConnectorCursor,
  setLineBudget,
  updateLineStatus,
  ACTIVE_LINE_STATUSES,
} from "./ledger.js";
import { enqueueGoal, feedNextGoal, lineGoalStatus, listQueuedGoals, removeQueuedGoals } from "./goal-queue.js";
import { renderBoardDirective } from "./org.js";
import { seedDefaultPortfolio } from "./portfolio.js";
import { allocateBudget, auditDecision, decideLine, describeDecision, experimentsToPause } from "./rules.js";
import {
  DEFAULT_DECISION_POLICY,
  REVENUE_KV,
  type DecisionPolicy,
  type LineDecision,
  type LineMetrics,
  type ReviewDecision,
  type RevenueLine,
} from "./types.js";

const logger = createLogger("revenue.heartbeat");

const DAY_MS = 86_400_000;

export const REVENUE_TASK_INTERVALS_MS = {
  revenue_ledger_sync: 60 * 60 * 1000,
  revenue_supervisor_review: 6 * 60 * 60 * 1000,
  revenue_board_review: 24 * 60 * 60 * 1000,
  revenue_audit: 7 * DAY_MS,
} as const;

const CHIEF_AUDIT_INTERVAL_MS = 30 * DAY_MS;
const DEFAULT_MONTHLY_COMPUTE_BUDGET_CENTS = 20_000;
const MAX_FAILED_GOALS_PER_LINE = 3;

// ─── KV helpers ─────────────────────────────────────────────────

function getKv(db: Database, key: string): string | undefined {
  const row = db.prepare("SELECT value FROM kv WHERE key = ?").get(key) as { value: string } | undefined;
  return row?.value;
}

function setKv(db: Database, key: string, value: string): void {
  db.prepare("INSERT OR REPLACE INTO kv (key, value, updated_at) VALUES (?, ?, datetime('now'))").run(key, value);
}

function deleteKv(db: Database, key: string): void {
  db.prepare("DELETE FROM kv WHERE key = ?").run(key);
}

function dueByInterval(db: Database, taskName: string, intervalMs: number, nowMs: number): boolean {
  const key = `revenue.last_run.${taskName}`;
  const last = getKv(db, key);
  if (last) {
    const lastMs = Date.parse(last);
    if (!Number.isNaN(lastMs) && nowMs - lastMs < intervalMs) return false;
  }
  setKv(db, key, new Date(nowMs).toISOString());
  return true;
}

export function getMonthlyComputeBudgetCents(db: Database): number {
  const raw = Number(getKv(db, "revenue.monthly_compute_budget_cents"));
  return Number.isFinite(raw) && raw >= 0 ? Math.floor(raw) : DEFAULT_MONTHLY_COMPUTE_BUDGET_CENTS;
}

export function setMonthlyComputeBudgetCents(db: Database, cents: number): void {
  if (!Number.isFinite(cents) || cents < 0) throw new Error("budget must be a non-negative number of cents");
  setKv(db, "revenue.monthly_compute_budget_cents", String(Math.floor(cents)));
}

export function requestBoardReview(db: Database, reason: string): void {
  setKv(db, "revenue.board_review_requested", reason);
}

function readyToRun(db: Database): boolean {
  return hasRevenueTables(db) && isRevenueColonyEnabled(db);
}

// ─── Ledger sync ────────────────────────────────────────────────

export interface LedgerSyncResult {
  recorded: number;
  duplicates: number;
  unmapped: string[];
  sources: string[];
  errors: string[];
}

export async function runLedgerSync(
  db: Database,
  env: NodeJS.ProcessEnv = process.env,
  fetchImpl?: typeof fetch,
): Promise<LedgerSyncResult> {
  const result: LedgerSyncResult = { recorded: 0, duplicates: 0, unmapped: [], sources: [], errors: [] };
  if (!readyToRun(db)) return result;

  const productMap = getProductMap(db);
  const resolveLine = (key: string): string | undefined => productMap[key];

  // Local x402 / credit transfers tagged with [line:<id>]
  try {
    const local = readLocalTransfers(db, getConnectorCursor(db, "x402"));
    for (const entry of local.entries) {
      const rec = recordLedgerEntry(db, entry);
      if (rec) result.recorded += 1; else result.duplicates += 1;
    }
    if (local.nextCursor) setConnectorCursor(db, "x402", local.nextCursor);
    if (local.entries.length) result.sources.push("x402");
  } catch (error) {
    result.errors.push(`x402: ${(error as Error).message}`);
  }

  for (const connector of REMOTE_CONNECTORS) {
    if (!connector.isConfigured(env)) continue;
    try {
      const fetched = await connector.fetchSince({
        cursor: getConnectorCursor(db, connector.source),
        env,
        resolveLine,
        fetchImpl,
      });
      for (const entry of fetched.entries) {
        const rec = recordLedgerEntry(db, entry);
        if (rec) result.recorded += 1; else result.duplicates += 1;
      }
      if (fetched.nextCursor) setConnectorCursor(db, connector.source, fetched.nextCursor);
      result.unmapped.push(...fetched.unmapped);
      result.sources.push(connector.source);
    } catch (error) {
      result.errors.push(`${connector.source}: ${(error as Error).message}`);
    }
  }

  result.unmapped = [...new Set(result.unmapped)];
  if (result.unmapped.length) {
    setKv(db, "revenue.unmapped_products", JSON.stringify(result.unmapped));
  } else {
    deleteKv(db, "revenue.unmapped_products");
  }
  setKv(db, "revenue.last_ledger_sync", JSON.stringify({ ...result, at: new Date().toISOString() }));
  return result;
}

// ─── Supervisor review ─────────────────────────────────────────

export interface SupervisorReviewResult {
  reviewed: number;
  decisions: LineDecision[];
  escalations: LineDecision[];
}

export function runSupervisorReview(
  db: Database,
  nowIso = new Date().toISOString(),
  policy: DecisionPolicy = DEFAULT_DECISION_POLICY,
): SupervisorReviewResult {
  const out: SupervisorReviewResult = { reviewed: 0, decisions: [], escalations: [] };
  if (!readyToRun(db)) return out;

  const nowMs = Date.parse(nowIso);
  const periodStart = new Date(nowMs - REVENUE_TASK_INTERVALS_MS.revenue_supervisor_review).toISOString();
  const lines = listLines(db).filter((l) => l.status !== "killed");

  for (const line of lines) {
    const metrics = computeLineMetrics(db, line, nowIso);
    const previous = latestReviewForLine(db, line.id, "supervisor");
    const decision = decideLine(line, metrics, policy, {
      previousDecision: previous?.decision ?? null,
      daysSincePreviousDecision: previous ? (nowMs - Date.parse(previous.createdAt)) / DAY_MS : null,
    });
    insertReview(db, {
      lineId: line.id,
      level: "supervisor",
      reviewer: `supervisor-${line.id}`,
      periodStart,
      periodEnd: nowIso,
      metrics: { ...metrics, triggered: decision.triggered },
      decision: decision.decision,
      rationale: decision.rationale,
    });
    out.reviewed += 1;
    out.decisions.push(decision);
    if (decision.decision !== "hold") out.escalations.push(decision);
  }

  if (out.escalations.length) {
    requestBoardReview(db, `supervisor escalations: ${out.escalations.map((d) => `${d.lineId}=${d.decision}`).join(", ")}`);
  }
  setKv(db, "revenue.last_supervisor_review", JSON.stringify({ at: nowIso, reviewed: out.reviewed, escalations: out.escalations.length }));
  return out;
}

// ─── Board review ──────────────────────────────────────────────

export interface BoardReviewResult {
  ran: boolean;
  directive: string;
  decisions: LineDecision[];
  actions: string[];
  goalFiled: { goalId: string; lineId: string; phase: string } | null;
  attainment: number;
}

export function runBoardReview(
  db: Database,
  opts: { nowIso?: string; policy?: DecisionPolicy; seed?: boolean } = {},
): BoardReviewResult {
  const nowIso = opts.nowIso ?? new Date().toISOString();
  const policy = opts.policy ?? DEFAULT_DECISION_POLICY;
  const empty: BoardReviewResult = { ran: false, directive: "", decisions: [], actions: [], goalFiled: null, attainment: 0 };
  if (!readyToRun(db)) return empty;

  const actions: string[] = [];
  if (opts.seed !== false && listLines(db).length === 0) {
    const seeded = seedDefaultPortfolio(db);
    if (seeded > 0) actions.push(`seeded default portfolio with ${seeded} revenue lines`);
  }

  const nowMs = Date.parse(nowIso);
  const lines = listLines(db);
  const metricsById = new Map<string, LineMetrics>();
  const decisionsById = new Map<string, LineDecision>();
  const decisions: LineDecision[] = [];

  for (const line of lines) {
    const metrics = computeLineMetrics(db, line, nowIso);
    metricsById.set(line.id, metrics);
    const previous = latestReviewForLine(db, line.id, "supervisor");
    const decision = decideLine(line, metrics, policy, { previousDecision: previous?.decision ?? null });
    decisionsById.set(line.id, decision);
    decisions.push(decision);
  }

  // 1) Apply decisions that change status.
  for (const line of lines) {
    const decision = decisionsById.get(line.id)!;
    switch (decision.decision) {
      case "kill": {
        if (line.status !== "killed") {
          updateLineStatus(db, line.id, "killed", { reason: decision.rationale, force: true });
          removeQueuedGoals(db, line.id);
          actions.push(`killed ${line.id}: ${decision.rationale}`);
        }
        break;
      }
      case "scale": {
        if (line.status === "live") {
          updateLineStatus(db, line.id, "scaling");
          enqueueGoal(db, { lineId: line.id, phase: "grow", extra: decision.rationale });
          actions.push(`scaling ${line.id}: ${decision.rationale}`);
        }
        break;
      }
      case "pivot": {
        if (enqueueGoal(db, { lineId: line.id, phase: "pivot", extra: decision.rationale })) {
          actions.push(`queued pivot goal for ${line.id}`);
        }
        break;
      }
      case "escalate": {
        if (line.status === "live" || line.status === "scaling") {
          if (enqueueGoal(db, { lineId: line.id, phase: "fix", extra: decision.rationale })) {
            actions.push(`queued fix goal for ${line.id}: ${decision.rationale}`);
          }
        } else if (line.status === "awaiting_setup") {
          actions.push(`waiting on creator for ${line.id}: ${line.humanSetup.join("; ")}`);
        } else if (line.status === "building") {
          const goal = lineGoalStatus(db, line.id);
          if (!goal || goal.status === "completed" || goal.status === "failed") {
            if (enqueueGoal(db, { lineId: line.id, phase: "build", extra: decision.rationale })) {
              actions.push(`re-queued build goal for ${line.id} (build overdue)`);
            }
          }
        }
        break;
      }
      default:
        break;
    }
  }

  // 2) Start lines that are ready: setup done (or not needed) and not yet building.
  for (const line of listLines(db)) {
    if (line.status === "proposed" || (line.status === "awaiting_setup" && line.humanSetupDone)) {
      if (line.humanSetup.length > 0 && !line.humanSetupDone) continue;
      if (enqueueGoal(db, { lineId: line.id, phase: "build" })) {
        actions.push(`queued build goal for ${line.id}`);
      }
    }
  }

  // 3) Handle failed goals: retry up to a limit, then pause and escalate to the creator.
  for (const line of listLines(db).filter((l) => ACTIVE_LINE_STATUSES.has(l.status))) {
    const goal = lineGoalStatus(db, line.id);
    if (!goal || goal.status !== "failed") continue;
    const seenKey = `revenue.failed_goal_seen.${goal.goalId}`;
    if (getKv(db, seenKey)) continue;
    setKv(db, seenKey, nowIso);
    const countKey = `revenue.failed_goal_count.${line.id}`;
    const count = Number(getKv(db, countKey) ?? 0) + 1;
    setKv(db, countKey, String(count));
    if (count >= MAX_FAILED_GOALS_PER_LINE) {
      updateLineStatus(db, line.id, "paused", { force: true });
      removeQueuedGoals(db, line.id);
      actions.push(`paused ${line.id} after ${count} failed goals; creator review needed`);
    } else {
      const phase = line.status === "building" ? "build" : "fix";
      if (enqueueGoal(db, { lineId: line.id, phase, extra: `previous goal ${goal.goalId} failed (attempt ${count + 1} of ${MAX_FAILED_GOALS_PER_LINE})` })) {
        actions.push(`re-queued ${phase} goal for ${line.id} after failure (${count}/${MAX_FAILED_GOALS_PER_LINE})`);
      }
    }
  }

  // 4) Portfolio constraint: too many experiments.
  for (const id of experimentsToPause(listLines(db), policy)) {
    updateLineStatus(db, id, "paused", { force: true });
    removeQueuedGoals(db, id);
    actions.push(`paused experiment ${id}: over the concurrent-experiment cap (${policy.maxExperiments})`);
  }

  // 5) Feed the orchestrator (a fed line becomes `building`, so it must precede allocation).
  let goalFiled: BoardReviewResult["goalFiled"] = null;
  try {
    goalFiled = feedNextGoal(db);
    if (goalFiled) actions.push(`filed ${goalFiled.phase} goal ${goalFiled.goalId} for ${goalFiled.lineId}`);
  } catch (error) {
    actions.push(`failed to file next goal: ${(error as Error).message}`);
    logger.warn("feedNextGoal failed", { error: (error as Error).message });
  }

  // 6) Budget allocation across lines that are actually working.
  const refreshed = listLines(db);
  const allocation = allocateBudget(getMonthlyComputeBudgetCents(db), refreshed, metricsById, decisionsById);
  for (const line of refreshed) {
    const cents = allocation.get(line.id) ?? 0;
    if (cents !== line.budgetMonthlyCents) setLineBudget(db, line.id, cents);
  }

  // 7) Record the board review and the directive.
  const summary = computePortfolioSummary(db, nowIso);
  const directive = renderBoardDirective(summary, decisions, actions);
  insertReview(db, {
    lineId: null,
    level: "board",
    reviewer: "board",
    periodStart: new Date(nowMs - REVENUE_TASK_INTERVALS_MS.revenue_board_review).toISOString(),
    periodEnd: nowIso,
    metrics: {
      total30dAgorot: summary.total30dAgorot,
      runRateMonthlyAgorot: summary.runRateMonthlyAgorot,
      attainment: summary.attainment,
      counts: summary.counts,
      queued: listQueuedGoals(db).length,
    },
    decision: decisions.some((d) => d.decision === "kill" || d.decision === "escalate" || d.decision === "pivot") ? "escalate" : "hold",
    rationale: directive,
  });
  for (const d of decisions.filter((d) => d.decision !== "hold")) {
    insertReview(db, {
      lineId: d.lineId,
      level: "board",
      reviewer: "board",
      periodStart: new Date(nowMs - REVENUE_TASK_INTERVALS_MS.revenue_board_review).toISOString(),
      periodEnd: nowIso,
      metrics: { ...(metricsById.get(d.lineId) ?? {}), triggered: d.triggered },
      decision: d.decision,
      rationale: d.rationale,
    });
  }
  setKv(db, REVENUE_KV.lastBoardDirective, directive);
  deleteKv(db, "revenue.board_review_requested");

  return { ran: true, directive, decisions, actions, goalFiled, attainment: summary.attainment };
}

// ─── Audit (auditor weekly, chief auditor monthly) ─────────────

export interface AuditResult {
  sampled: number;
  flagged: number;
  flagRate: number;
  chiefAuditRan: boolean;
  chiefFindings: string[];
}

export function runAudit(
  db: Database,
  nowIso = new Date().toISOString(),
  policy: DecisionPolicy = DEFAULT_DECISION_POLICY,
): AuditResult {
  const out: AuditResult = { sampled: 0, flagged: 0, flagRate: 0, chiefAuditRan: false, chiefFindings: [] };
  if (!readyToRun(db)) return out;

  const nowMs = Date.parse(nowIso);
  const since = new Date(nowMs - REVENUE_TASK_INTERVALS_MS.revenue_audit).toISOString();
  const reviews = listReviews(db, { level: "supervisor", sinceIso: since, limit: 200 });

  for (const review of reviews) {
    if (!review.lineId) continue;
    const line = getLine(db, review.lineId);
    if (!line) continue;
    const snapshot = review.metrics as unknown as LineMetrics;
    if (typeof snapshot.revenue30dAgorot !== "number") continue;
    const lineAtReview: RevenueLine = { ...line, status: snapshot.status ?? line.status };
    const recomputed = decideLine(lineAtReview, snapshot, policy, { previousDecision: null });
    // A pivot→kill sequence depends on history the auditor does not replay; accept kill after pivot.
    const filed = review.decision;
    const verdict = filed === "kill" && recomputed.decision === "pivot"
      ? { verdict: "approve" as const, reason: "kill after a prior pivot is within policy" }
      : auditDecision(filed, recomputed.decision);
    insertReview(db, {
      lineId: review.lineId,
      level: "auditor",
      reviewer: "auditor",
      periodStart: since,
      periodEnd: nowIso,
      metrics: { filed, recomputed: recomputed.decision, triggered: recomputed.triggered },
      decision: verdict.verdict,
      rationale: verdict.reason,
      reviewedReviewId: review.id,
    });
    out.sampled += 1;
    if (verdict.verdict === "flag") out.flagged += 1;
  }

  // Structural checks the auditor always runs.
  const dupRow = db.prepare(
    `SELECT COUNT(*) AS c FROM (
       SELECT source, external_id FROM revenue_ledger WHERE external_id IS NOT NULL
       GROUP BY source, external_id HAVING COUNT(*) > 1)`,
  ).get() as { c: number };
  if (dupRow.c > 0) out.chiefFindings.push(`${dupRow.c} duplicate external ids in the ledger`);

  const killedRevenue = db.prepare(
    `SELECT COUNT(*) AS c FROM revenue_ledger l JOIN revenue_lines r ON r.id = l.line_id
     WHERE r.status = 'killed' AND l.kind = 'cost' AND l.occurred_at > COALESCE(r.killed_at, '')`,
  ).get() as { c: number };
  if (killedRevenue.c > 0) out.chiefFindings.push(`${killedRevenue.c} cost entries on killed lines after their kill date`);

  out.flagRate = out.sampled > 0 ? out.flagged / out.sampled : 0;
  if (out.flagRate > 0.3 || out.chiefFindings.length) {
    requestBoardReview(db, `audit: flag rate ${(out.flagRate * 100).toFixed(0)}%; ${out.chiefFindings.join("; ")}`);
  }

  // Chief auditor: monthly.
  if (dueByInterval(db, "chief_audit", CHIEF_AUDIT_INTERVAL_MS, nowMs)) {
    out.chiefAuditRan = true;
    const monthAgo = new Date(nowMs - CHIEF_AUDIT_INTERVAL_MS).toISOString();
    const audits = listReviews(db, { level: "auditor", sinceIso: monthAgo, limit: 1000 });
    const weeksWithAudit = new Set(audits.map((a) => Math.floor((nowMs - Date.parse(a.createdAt)) / (7 * DAY_MS))));
    // Audits are only expected for the weeks the colony has actually been reviewing lines.
    const firstSupervisorReview = db
      .prepare("SELECT MIN(created_at) AS ts FROM revenue_reviews WHERE level = 'supervisor'")
      .get() as { ts: string | null } | undefined;
    const activeWeeks = firstSupervisorReview?.ts
      ? Math.min(4, Math.max(1, Math.ceil((nowMs - Date.parse(firstSupervisorReview.ts)) / (7 * DAY_MS))))
      : 0;
    if (activeWeeks > 0 && weeksWithAudit.size < Math.max(1, activeWeeks - 1)) {
      out.chiefFindings.push(`only ${weeksWithAudit.size} of the last ${activeWeeks} active weeks had an audit`);
    }
    const flags = audits.filter((a) => a.decision === "flag");
    let unaddressed = 0;
    for (const flag of flags) {
      const boardAfter = listReviews(db, { lineId: flag.lineId ?? undefined, level: "board", sinceIso: flag.createdAt, limit: 1 });
      if (boardAfter.length === 0) unaddressed += 1;
    }
    if (unaddressed > 0) out.chiefFindings.push(`${unaddressed} auditor flags without a subsequent board review`);
    insertReview(db, {
      lineId: null,
      level: "chief_auditor",
      reviewer: "chief-auditor",
      periodStart: monthAgo,
      periodEnd: nowIso,
      metrics: { audits: audits.length, flags: flags.length, unaddressed, weeksWithAudit: weeksWithAudit.size },
      decision: out.chiefFindings.length ? "flag" : "approve",
      rationale: out.chiefFindings.length ? out.chiefFindings.join("; ") : "audits complete and every flag was reviewed by the board",
    });
    if (out.chiefFindings.length) requestBoardReview(db, `chief audit: ${out.chiefFindings.join("; ")}`);
  }

  setKv(db, "revenue.last_audit", JSON.stringify({ at: nowIso, sampled: out.sampled, flagged: out.flagged, chiefAuditRan: out.chiefAuditRan }));
  return out;
}

// ─── Heartbeat task wrappers ───────────────────────────────────

function summarizeDecisions(decisions: LineDecision[]): string {
  return decisions.filter((d) => d.decision !== "hold").map(describeDecision).join("\n");
}

export const REVENUE_TASKS: Record<string, HeartbeatTaskFn> = {
  revenue_ledger_sync: async (_ctx: TickContext, taskCtx: HeartbeatLegacyContext) => {
    const db = taskCtx.db.raw;
    if (!readyToRun(db)) return { shouldWake: false };
    if (!dueByInterval(db, "revenue_ledger_sync", REVENUE_TASK_INTERVALS_MS.revenue_ledger_sync, Date.now())) {
      return { shouldWake: false };
    }
    try {
      const result = await runLedgerSync(db);
      if (result.unmapped.length) {
        return {
          shouldWake: true,
          message: `Revenue: ${result.recorded} new ledger entries; ${result.unmapped.length} product(s) have no revenue line mapping — call revenue_map_product: ${result.unmapped.slice(0, 5).join(", ")}`,
        };
      }
      return { shouldWake: false };
    } catch (error) {
      logger.error("revenue_ledger_sync failed", error instanceof Error ? error : undefined);
      return { shouldWake: false };
    }
  },

  revenue_supervisor_review: async (_ctx: TickContext, taskCtx: HeartbeatLegacyContext) => {
    const db = taskCtx.db.raw;
    if (!readyToRun(db)) return { shouldWake: false };
    if (!dueByInterval(db, "revenue_supervisor_review", REVENUE_TASK_INTERVALS_MS.revenue_supervisor_review, Date.now())) {
      return { shouldWake: false };
    }
    try {
      const result = runSupervisorReview(db);
      if (result.escalations.length) {
        return {
          shouldWake: true,
          message: `Revenue supervisors escalated ${result.escalations.length} line(s):\n${summarizeDecisions(result.escalations)}\nThe board review will run next tick; read revenue_status.`,
        };
      }
      return { shouldWake: false };
    } catch (error) {
      logger.error("revenue_supervisor_review failed", error instanceof Error ? error : undefined);
      return { shouldWake: false };
    }
  },

  revenue_board_review: async (ctx: TickContext, taskCtx: HeartbeatLegacyContext) => {
    const db = taskCtx.db.raw;
    if (!readyToRun(db)) return { shouldWake: false };
    const requested = getKv(db, "revenue.board_review_requested");
    const due = dueByInterval(db, "revenue_board_review", REVENUE_TASK_INTERVALS_MS.revenue_board_review, Date.now());
    if (!due && !requested) return { shouldWake: false };
    if (ctx.survivalTier === "critical" || ctx.survivalTier === "dead") {
      return { shouldWake: false };
    }
    try {
      const result = runBoardReview(db);
      const changed = result.actions.length > 0 || result.decisions.some((d) => d.decision !== "hold");
      if (!changed) return { shouldWake: false };
      return {
        shouldWake: true,
        message: `Board review complete (target attainment ${(result.attainment * 100).toFixed(1)}%).\n${result.directive}\nRead revenue_status, then act on any escalation; do not re-run the board review this turn.`,
      };
    } catch (error) {
      logger.error("revenue_board_review failed", error instanceof Error ? error : undefined);
      return { shouldWake: false };
    }
  },

  revenue_audit: async (_ctx: TickContext, taskCtx: HeartbeatLegacyContext) => {
    const db = taskCtx.db.raw;
    if (!readyToRun(db)) return { shouldWake: false };
    if (!dueByInterval(db, "revenue_audit", REVENUE_TASK_INTERVALS_MS.revenue_audit, Date.now())) {
      return { shouldWake: false };
    }
    try {
      const result = runAudit(db);
      if (result.flagRate > 0.3 || result.chiefFindings.length) {
        return {
          shouldWake: true,
          message: `Revenue audit: ${result.flagged}/${result.sampled} supervisor reviews flagged (${(result.flagRate * 100).toFixed(0)}%). ${result.chiefFindings.join("; ")}`.trim(),
        };
      }
      return { shouldWake: false };
    } catch (error) {
      logger.error("revenue_audit failed", error instanceof Error ? error : undefined);
      return { shouldWake: false };
    }
  },
};
