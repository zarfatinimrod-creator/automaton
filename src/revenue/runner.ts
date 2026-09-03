/**
 * Revenue Colony — standalone runner
 *
 * The governance half of the colony (ledger → supervisor → board → audit) needs
 * only a SQLite handle: no inference, no Conway client, no wallet. This module
 * drives it on a schedule so the loop runs for real long before the automaton
 * runtime is provisioned, and keeps ticking wherever it is hosted.
 *
 * Director and worker EXECUTION still needs inference. This runner never
 * pretends otherwise: when a goal is filed with nothing able to execute it, the
 * tick reports that as a blocker rather than quietly moving on.
 */

import type { Database } from "better-sqlite3";
import {
  computePortfolioSummary,
  getLine,
  hasRevenueTables,
  isRevenueColonyEnabled,
  latestReviewForLine,
  listLines,
} from "./ledger.js";
import { formatIls } from "./money.js";
import {
  REVENUE_TASK_INTERVALS_MS,
  runAudit,
  runBoardReview,
  runLedgerSync,
  runSupervisorReview,
  type AuditResult,
  type BoardReviewResult,
  type LedgerSyncResult,
  type SupervisorReviewResult,
} from "./heartbeat.js";
import { listQueuedGoals } from "./goal-queue.js";
import { DEFAULT_DECISION_POLICY, type DecisionPolicy, type PortfolioSummary } from "./types.js";

const DAY_MS = 86_400_000;

/** A goal filed this long ago with nothing executing it is reported as stuck. */
export const NO_EXECUTOR_ALERT_DAYS = 2;

export type TaskName = keyof typeof REVENUE_TASK_INTERVALS_MS;

export const TASK_ORDER: TaskName[] = [
  "revenue_ledger_sync",
  "revenue_supervisor_review",
  "revenue_board_review",
  "revenue_audit",
];

// Same KV key shape the heartbeat scheduler uses, so a standalone tick and the
// automaton's own heartbeat cannot double-run the same task.
const lastRunKey = (task: TaskName): string => `revenue.last_run.${task}`;

function getKv(db: Database, key: string): string | undefined {
  const row = db.prepare("SELECT value FROM kv WHERE key = ?").get(key) as { value: string } | undefined;
  return row?.value;
}

function setKv(db: Database, key: string, value: string): void {
  db.prepare("INSERT OR REPLACE INTO kv (key, value, updated_at) VALUES (?, ?, datetime('now'))").run(key, value);
}

/** True when `task` is due at `nowMs`. Does not record the run — call `markRan`. */
export function isDue(db: Database, task: TaskName, nowMs: number): boolean {
  const last = getKv(db, lastRunKey(task));
  if (!last) return true;
  const lastMs = Date.parse(last);
  if (Number.isNaN(lastMs)) return true;
  return nowMs - lastMs >= REVENUE_TASK_INTERVALS_MS[task];
}

export function markRan(db: Database, task: TaskName, nowMs: number): void {
  setKv(db, lastRunKey(task), new Date(nowMs).toISOString());
}

export interface StuckGoal {
  goalId: string;
  lineId: string | null;
  title: string;
  ageDays: number;
  taskCount: number;
}

/**
 * Active goals that no orchestrator ever decomposed. A goal with zero rows in
 * task_graph has never been planned, so nothing is working on it.
 */
export function findStuckGoals(db: Database, nowMs: number, alertDays = NO_EXECUTOR_ALERT_DAYS): StuckGoal[] {
  let rows: Array<{ id: string; title: string; createdAt: string; taskCount: number }>;
  try {
    rows = db.prepare(
      `SELECT g.id AS id,
              g.title AS title,
              g.created_at AS createdAt,
              (SELECT COUNT(*) FROM task_graph t WHERE t.goal_id = g.id) AS taskCount
       FROM goals g
       WHERE g.status = 'active'`,
    ).all() as Array<{ id: string; title: string; createdAt: string; taskCount: number }>;
  } catch {
    return []; // no goals table (pre-v9 database)
  }

  const byGoal = new Map<string, string>();
  for (const row of db.prepare("SELECT key, value FROM kv WHERE key LIKE 'revenue.goal_for_line.%'").all() as Array<{ key: string; value: string }>) {
    byGoal.set(row.value, row.key.slice("revenue.goal_for_line.".length));
  }

  const stuck: StuckGoal[] = [];
  for (const row of rows) {
    if (row.taskCount > 0) continue; // something planned it; not our problem
    const createdMs = Date.parse(row.createdAt);
    const ageDays = Number.isNaN(createdMs) ? 0 : (nowMs - createdMs) / DAY_MS;
    if (ageDays < alertDays) continue;
    stuck.push({
      goalId: row.id,
      lineId: byGoal.get(row.id) ?? null,
      title: row.title,
      ageDays: Number(ageDays.toFixed(1)),
      taskCount: row.taskCount,
    });
  }
  return stuck;
}

export interface TickOptions {
  nowIso?: string;
  policy?: DecisionPolicy;
  /** Run every task regardless of its interval. */
  force?: boolean;
  /** false = keep governance running without filing a goal nothing can execute. */
  feedGoals?: boolean;
  env?: NodeJS.ProcessEnv;
  fetchImpl?: typeof fetch;
  /** Seed the default portfolio when the colony is empty (board review default). */
  seed?: boolean;
}

export interface TickResult {
  at: string;
  enabled: boolean;
  ran: TaskName[];
  skipped: TaskName[];
  ledgerSync: LedgerSyncResult | null;
  supervisor: SupervisorReviewResult | null;
  board: BoardReviewResult | null;
  audit: AuditResult | null;
  stuckGoals: StuckGoal[];
  blockers: string[];
  summary: PortfolioSummary | null;
}

/**
 * One cycle of the colony. Each task runs only when its interval says so, so an
 * hourly schedule does not run the daily board review 24 times a day.
 */
export async function tick(db: Database, options: TickOptions = {}): Promise<TickResult> {
  const nowIso = options.nowIso ?? new Date().toISOString();
  const nowMs = Date.parse(nowIso);
  const policy = options.policy ?? DEFAULT_DECISION_POLICY;
  const force = options.force === true;

  const result: TickResult = {
    at: nowIso,
    enabled: hasRevenueTables(db) && isRevenueColonyEnabled(db),
    ran: [],
    skipped: [],
    ledgerSync: null,
    supervisor: null,
    board: null,
    audit: null,
    stuckGoals: [],
    blockers: [],
    summary: null,
  };

  if (!result.enabled) {
    result.blockers.push(
      hasRevenueTables(db)
        ? "revenue colony is disabled (kv revenue.enabled = 0)"
        : "revenue tables are missing — open the database through createDatabase so migrations apply",
    );
    return result;
  }

  const shouldRun = (task: TaskName): boolean => {
    if (force || isDue(db, task, nowMs)) return true;
    result.skipped.push(task);
    return false;
  };

  if (shouldRun("revenue_ledger_sync")) {
    result.ledgerSync = await runLedgerSync(db, options.env ?? process.env, options.fetchImpl);
    markRan(db, "revenue_ledger_sync", nowMs);
    result.ran.push("revenue_ledger_sync");
    if (result.ledgerSync.unmapped.length) {
      result.blockers.push(
        `${result.ledgerSync.unmapped.length} platform product(s) have no revenue line: ${result.ledgerSync.unmapped.join(", ")}. Map them so their sales are counted.`,
      );
    }
    for (const error of result.ledgerSync.errors) result.blockers.push(`ledger sync: ${error}`);
  }

  if (shouldRun("revenue_supervisor_review")) {
    result.supervisor = runSupervisorReview(db, nowIso, policy);
    markRan(db, "revenue_supervisor_review", nowMs);
    result.ran.push("revenue_supervisor_review");
  }

  if (shouldRun("revenue_board_review")) {
    result.board = runBoardReview(db, {
      nowIso,
      policy,
      seed: options.seed,
      feedGoals: options.feedGoals,
    });
    markRan(db, "revenue_board_review", nowMs);
    result.ran.push("revenue_board_review");
  }

  if (shouldRun("revenue_audit")) {
    result.audit = runAudit(db, nowIso, policy);
    markRan(db, "revenue_audit", nowMs);
    result.ran.push("revenue_audit");
    if (result.audit.flagRate > 0.3) {
      result.blockers.push(`auditor flagged ${result.audit.flagged}/${result.audit.sampled} supervisor reviews`);
    }
    for (const finding of result.audit.chiefFindings) result.blockers.push(`chief audit: ${finding}`);
  }

  result.stuckGoals = findStuckGoals(db, nowMs);
  for (const goal of result.stuckGoals) {
    result.blockers.push(
      `goal "${goal.title}" (${goal.lineId ?? "unassigned"}) has been queued ${goal.ageDays} days with no executor. ` +
      "Directors need an inference-capable runtime; provision the automaton or run it with an API key.",
    );
  }

  for (const line of listLines(db)) {
    if (line.status === "awaiting_setup" && !line.humanSetupDone) {
      result.blockers.push(`${line.id} is waiting on the owner: ${line.humanSetup.join("; ")}`);
    }
  }

  result.summary = computePortfolioSummary(db, nowIso);
  return result;
}

/** Human-readable board report. This is what the owner reads in the git diff. */
export function renderReport(db: Database, result: TickResult): string {
  const out: string[] = [];
  const s = result.summary;

  out.push("# Revenue colony — board report");
  out.push("");
  out.push(`Generated ${result.at}`);
  out.push("");

  if (!result.enabled) {
    out.push("**The colony is not running.**");
    out.push("");
    for (const b of result.blockers) out.push(`- ${b}`);
    return out.join("\n") + "\n";
  }

  if (s) {
    const pct = (s.attainment * 100).toFixed(1);
    out.push("## Where we are");
    out.push("");
    out.push(`| | |`);
    out.push(`|---|---|`);
    out.push(`| 30-day revenue | **${formatIls(s.total30dAgorot)}** |`);
    out.push(`| Target | ${formatIls(s.targetMonthlyAgorot)} (${pct}%) |`);
    out.push(`| Stretch target | ${formatIls(s.stretchMonthlyAgorot)} |`);
    out.push(`| Run-rate from last 7 days | ${formatIls(s.runRateMonthlyAgorot)}/month |`);
    out.push(`| Costs (30d) | ${formatIls(s.totalCost30dAgorot)} |`);
    out.push(`| Net (30d) | ${formatIls(s.net30dAgorot)} |`);
    out.push("");
  }

  const lines = listLines(db).filter((l) => l.status !== "killed");
  if (lines.length) {
    out.push("## Revenue lines");
    out.push("");
    out.push("| Line | Tier | Status | 30d | Target | Last supervisor call |");
    out.push("|---|---|---|---|---|---|");
    const metrics = new Map((s?.lines ?? []).map((m) => [m.lineId, m]));
    for (const line of lines) {
      const m = metrics.get(line.id);
      const review = latestReviewForLine(db, line.id, "supervisor");
      out.push(
        `| \`${line.id}\` | ${line.tier} | ${line.status} | ${formatIls(m?.revenue30dAgorot ?? 0)} | ${formatIls(line.targetMonthlyAgorot)} | ${review?.decision ?? "—"} |`,
      );
    }
    out.push("");
  }

  const decisions = (result.board?.decisions ?? []).filter((d) => d.decision !== "hold");
  out.push("## This tick");
  out.push("");
  out.push(`Ran: ${result.ran.length ? result.ran.join(", ") : "nothing (everything within its interval)"}`);
  if (result.skipped.length) out.push(`Skipped as not yet due: ${result.skipped.join(", ")}`);
  out.push("");

  if (result.ledgerSync) {
    const ls = result.ledgerSync;
    out.push(`- Ledger sync: ${ls.recorded} new entries, ${ls.duplicates} already known, sources [${ls.sources.join(", ") || "none configured"}]`);
  }
  if (result.supervisor) {
    out.push(`- Supervisors reviewed ${result.supervisor.reviewed} line(s), escalating ${result.supervisor.escalations.length}`);
  }
  if (result.audit && (result.audit.sampled || result.audit.chiefAuditRan)) {
    out.push(`- Audit sampled ${result.audit.sampled} review(s), flagged ${result.audit.flagged}${result.audit.chiefAuditRan ? "; chief audit ran" : ""}`);
  }
  if (decisions.length) {
    out.push("");
    out.push("### Board decisions");
    out.push("");
    for (const d of decisions) out.push(`- **${d.lineId} → ${d.decision.toUpperCase()}** — ${d.rationale}`);
  }
  if (result.board?.actions.length) {
    out.push("");
    out.push("### Actions taken");
    out.push("");
    for (const a of result.board.actions) out.push(`- ${a}`);
  }
  out.push("");

  const queue = listQueuedGoals(db);
  if (queue.length) {
    out.push(`Goal queue: ${queue.map((q) => `${q.lineId}:${q.phase}`).join(", ")}`);
    out.push("");
  }

  if (result.blockers.length) {
    out.push("## Blocked on");
    out.push("");
    for (const b of result.blockers) out.push(`- ${b}`);
    out.push("");
  }

  const waiting = listLines(db).filter((l) => l.status === "awaiting_setup" && !l.humanSetupDone);
  if (waiting.length) {
    out.push("## What the owner has to do (one time, per line)");
    out.push("");
    for (const line of waiting) {
      out.push(`**${line.name}** (\`${line.id}\`)`);
      for (const step of line.humanSetup) out.push(`- [ ] ${step}`);
      out.push("");
    }
    out.push("When a line's steps are done, confirm it so the colony can start building:");
    out.push("");
    out.push("```bash");
    out.push(`pnpm exec tsx scripts/colony.ts setup-done ${waiting[0].id} --evidence "done on <date>"`);
    out.push("```");
    out.push("");
  }

  out.push("---");
  out.push("");
  out.push("Money here is only what reached the ledger with a platform transaction id. Projections are never counted.");
  return out.join("\n") + "\n";
}

/** One-line summary suitable for a commit message. */
export function renderCommitSummary(result: TickResult): string {
  if (!result.enabled) return "colony tick: disabled";
  const s = result.summary;
  const money = s ? formatIls(s.total30dAgorot) : "?";
  const decisions = (result.board?.decisions ?? []).filter((d) => d.decision !== "hold").length;
  const parts = [`30d ${money}`];
  if (result.ran.length) parts.push(`ran ${result.ran.length}`);
  if (decisions) parts.push(`${decisions} decision(s)`);
  if (result.blockers.length) parts.push(`${result.blockers.length} blocker(s)`);
  return `colony tick: ${parts.join(", ")}`;
}

export function summarizeLine(db: Database, lineId: string): string | null {
  const line = getLine(db, lineId);
  return line ? `${line.id} [${line.tier}/${line.status}] target ${formatIls(line.targetMonthlyAgorot)}` : null;
}
