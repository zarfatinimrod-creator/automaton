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
import { describeStall, findStalledLines, type StalledLine } from "./watchdog.js";
import { DEFAULT_PORTFOLIO, labelledKpis, summarizeTargetBasis, TARGET_BASIS } from "./portfolio.js";
import {
  frozenOwnerStepsForLine,
  heldOwnerStepsForLine,
  heldSecretRows,
  openOwnerStepsForLine,
  SECRET_ROW_GATE_SHORT,
  type SecretGateSite,
} from "./owner-steps.js";
import { DEFAULT_MEASUREMENTS_DIR, ingestAlgoraSupplyMeasurement, ingestApifyMeasurement, type IngestResult } from "./measurements.js";
import { BRAND_MAIL_PROBE_FILE, readBrandMailProbe, type BrandMailReading } from "./brand-mail.js";
import { PRIZE_INTAKE_FILE, readPrizeIntake, type PrizeIntakeReading } from "./prize-intake.js";
import {
  DEFAULT_PAGE_VIEW_CLOCK_FILE,
  DEFAULT_PAGE_VIEW_SITE_DIR,
  evaluatePageViewLines,
  readPageViews,
  readSite,
  type PageViewReadResult,
} from "./page-views-reader.js";
import type { PageViewGateReading, PageViewVerdict } from "./page-views.js";
import { REFUND_RATE_WINDOW_DAYS } from "./connectors/gumroad.js";
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
  lastGumroadRefundRateRead,
  runAudit,
  runBoardReview,
  runLedgerSync,
  runSupervisorReview,
  type AuditResult,
  type BoardReviewResult,
  type GumroadRefundRateRead,
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

/**
 * The hourly schedule missing this long means the loop stopped, not that it was
 * quiet. Six hours is five missed runs — long enough not to fire on a delayed
 * cron, short enough that a broken workflow is caught the same day.
 */
export const LOOP_GAP_ALERT_MS = 6 * 60 * 60 * 1000;

/** A live line with no money moving for this long has stopped earning. */
export const SILENT_LINE_ALERT_DAYS = 14;

export interface LivenessFinding {
  kind: "loop_gap" | "silent_line";
  detail: string;
}

/**
 * Watch the loop itself.
 *
 * A dead colony looks exactly like a quiet one: the report still renders, the
 * numbers are still there, and nothing says the last tick was a week ago. The
 * scheduled workflow is the sole writer, so if it breaks, silence is the only
 * symptom. Call this at the START of a tick, before markRan overwrites the
 * evidence of how long the loop was down.
 */
export function checkLiveness(db: Database, nowMs: number): LivenessFinding[] {
  const findings: LivenessFinding[] = [];

  // markRan stores an ISO string, not epoch ms — Number() here would be NaN and
  // the watchdog would silently never fire, which is the exact failure it exists
  // to catch.
  const last = getKv(db, lastRunKey("revenue_ledger_sync"));
  const lastMs = last ? Date.parse(last) : NaN;
  if (Number.isFinite(lastMs)) {
    const gap = nowMs - lastMs;
    if (gap > LOOP_GAP_ALERT_MS) {
      const hours = Math.round(gap / (60 * 60 * 1000));
      findings.push({
        kind: "loop_gap",
        detail:
          `the loop did not run for ${hours} hours (last ledger sync ${new Date(lastMs).toISOString()}). ` +
          "Check the colony workflow in Actions: a failing schedule is invisible from the numbers alone.",
      });
    }
  }

  const cutoff = new Date(nowMs - SILENT_LINE_ALERT_DAYS * 24 * 60 * 60 * 1000).toISOString();
  const silent = db
    .prepare(
      `SELECT r.id AS id, MAX(l.occurred_at) AS last_money
         FROM revenue_lines r
         LEFT JOIN revenue_ledger l
           ON l.line_id = r.id AND l.kind IN ('sale', 'subscription', 'payout')
        WHERE r.status = 'live'
        GROUP BY r.id
       HAVING last_money IS NULL OR last_money < ?`,
    )
    .all(cutoff) as { id: string; last_money: string | null }[];
  for (const line of silent) {
    findings.push({
      kind: "silent_line",
      detail: line.last_money
        ? `${line.id} is live but has taken no money since ${line.last_money.slice(0, 10)}`
        : `${line.id} is live but has never taken money`,
    });
  }

  return findings;
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
  /** Where measurement jobs commit their JSON (default state/colony/measurements, relative to the cwd). */
  measurementsDir?: string;
  /** Where the brand-mail probe commits its numbers (default state/colony/brand-mail.json, relative to the cwd). */
  brandMailFile?: string;
  /** Where the weekly prize-intake read commits its numbers (default state/colony/prize-intake.json, relative to the cwd). */
  prizeIntakeFile?: string;
  /** The site whose page views are read (default products/il-biz-tools, relative to the cwd). */
  pageViewSiteDir?: string;
  /** The page-view clocks: D0 and the domain deploy day per line (default state/colony/page-view-clock.json). */
  pageViewClockFile?: string;
  /** The site whose Gumroad Pro product the refund rate is read for (default products/il-biz-tools, relative to the cwd). */
  proSiteDir?: string;
}

export interface TickResult {
  at: string;
  enabled: boolean;
  ran: TaskName[];
  skipped: TaskName[];
  ledgerSync: LedgerSyncResult | null;
  /** Measurement files read into KPI snapshots this tick (with the ledger sync, hourly). */
  measurements: IngestResult[];
  supervisor: SupervisorReviewResult | null;
  board: BoardReviewResult | null;
  audit: AuditResult | null;
  stuckGoals: StuckGoal[];
  liveness: LivenessFinding[];
  stalledLines: StalledLine[];
  /** The brand-mailbox probe's numbers (owner step 8), read every tick; absent until a probe has run. */
  brandMail: BrandMailReading;
  /** The weekly mlcontests read (CHANNEL_LOOP.md §4 row 13): an instrument, one report line, never a blocker. */
  prizeIntake: PrizeIntakeReading;
  /** The PostHog page-view read (with the ledger sync); null when the sync was not due. */
  pageViews: PageViewReadResult | null;
  /** The il-biz-tools / pcn874 page-view gates on the recorded weeks, every tick. A verdict is for the board to apply. */
  pageViewGates: PageViewGateReading[];
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
    measurements: [],
    supervisor: null,
    board: null,
    audit: null,
    stuckGoals: [],
    liveness: [],
    stalledLines: [],
    brandMail: { file: options.brandMailFile ?? BRAND_MAIL_PROBE_FILE, status: "absent", line: null, blockers: [] },
    prizeIntake: readPrizeIntake(options.prizeIntakeFile ?? PRIZE_INTAKE_FILE, nowMs),
    pageViews: null,
    pageViewGates: [],
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

  // Before anything writes a last_run: the gap is the evidence.
  result.liveness = checkLiveness(db, nowMs);
  for (const finding of result.liveness) result.blockers.push(finding.detail);

  const shouldRun = (task: TaskName): boolean => {
    if (force || isDue(db, task, nowMs)) return true;
    result.skipped.push(task);
    return false;
  };

  if (shouldRun("revenue_ledger_sync")) {
    result.ledgerSync = await runLedgerSync(db, options.env ?? process.env, options.fetchImpl, {
      nowIso,
      proSiteDir: options.proSiteDir,
    });
    markRan(db, "revenue_ledger_sync", nowMs);
    result.ran.push("revenue_ledger_sync");
    if (result.ledgerSync.unmapped.length) {
      result.blockers.push(
        `${result.ledgerSync.unmapped.length} platform product(s) have no revenue line: ${result.ledgerSync.unmapped.join(", ")}. Map them so their sales are counted.`,
      );
    }
    for (const error of result.ledgerSync.errors) result.blockers.push(`ledger sync: ${error}`);

    // Measurement jobs never open colony.db (the tick commits it too); their numbers enter the KPIs here.
    const measurementsDir = options.measurementsDir ?? DEFAULT_MEASUREMENTS_DIR;
    for (const ingest of [ingestApifyMeasurement, ingestAlgoraSupplyMeasurement]) {
      const m = ingest(db, measurementsDir);
      result.measurements.push(m);
      if (m.status === "invalid") result.blockers.push(`measurement ${m.file}: ${m.detail}`);
    }

    // The page-view KPI (RULING-2026-09-29-loop.md (b)): one row per line per completed week, read from PostHog by the
    // tick itself. A no-op that says what is missing until the read key, the project id, the counter and D0 all exist.
    result.pageViews = await readPageViews(db, {
      env: options.env ?? process.env,
      fetchImpl: options.fetchImpl,
      nowIso,
      siteDir: options.pageViewSiteDir ?? DEFAULT_PAGE_VIEW_SITE_DIR,
      clockFile: options.pageViewClockFile ?? DEFAULT_PAGE_VIEW_CLOCK_FILE,
    });
    if (result.pageViews.status === "error") result.blockers.push(`page views: ${result.pageViews.detail}`);
  }

  // The gates read the rows every tick, like the brand-mail probe: an instrument fault stays a blocker until it is
  // fixed and the clock restarted, a reader that is down stays a blocker until it reads the missing weeks (never a
  // clock restart: RULING-2026-09-30-documents (c)), and a due verdict stays in the report until the board applies it.
  const pageViewGates = evaluatePageViewLines(db, {
    nowIso,
    siteDir: options.pageViewSiteDir ?? DEFAULT_PAGE_VIEW_SITE_DIR,
    clockFile: options.pageViewClockFile ?? DEFAULT_PAGE_VIEW_CLOCK_FILE,
  });
  result.pageViewGates = pageViewGates.readings;
  for (const problem of pageViewGates.problems) result.blockers.push(`page-view clock: ${problem}`);
  // A recorded D0 means a clock is running: a reader that cannot read is then a blocker at once, not only when the
  // missing weeks turn overdue. Before D0 "not configured" is today's expected state and stays a report line.
  const running = result.pageViewGates.filter((g) => g.anchorDay).map((g) => `${g.lineId} from ${g.anchorDay}`);
  if (running.length && result.pageViews && (result.pageViews.status === "not_configured" || result.pageViews.status === "counter_off")) {
    result.blockers.push(`page views: ${PAGE_VIEW_STATUS_WORDS[result.pageViews.status]} while a clock runs (${running.join(", ")}) — ${result.pageViews.detail}`);
  }
  for (const g of result.pageViewGates) {
    if (g.verdict === "instrument_fault") result.blockers.push(`page views ${g.lineId}: instrument fault — ${g.notes.join("; ")}`);
    if (g.verdict === "reader_down") result.blockers.push(`page views ${g.lineId}: reader down — ${g.notes.join("; ")}`);
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

  // Alive is not working. A line that should be producing and is not gets named
  // here, or the report shows a healthy portfolio doing nothing.
  result.stalledLines = findStalledLines(db, nowMs);
  for (const stall of result.stalledLines) result.blockers.push(describeStall(stall));

  result.stuckGoals = findStuckGoals(db, nowMs);
  for (const goal of result.stuckGoals) {
    result.blockers.push(
      `goal "${goal.title}" (${goal.lineId ?? "unassigned"}) has been queued ${goal.ageDays} days with no executor. ` +
      "Directors need an inference-capable runtime; provision the automaton or run it with an API key.",
    );
  }

  // Read every tick, not only when the ledger sync is due: an unanswered accessibility mail stays a blocker in every
  // report until it is answered, and its age is counted to this tick, not to the probe (brand-mail.ts).
  result.brandMail = readBrandMailProbe(options.brandMailFile ?? BRAND_MAIL_PROBE_FILE, nowMs);
  result.blockers.push(...result.brandMail.blockers);

  for (const line of listLines(db)) {
    if (line.status === "awaiting_setup" && !line.humanSetupDone) {
      result.blockers.push(
        `${line.id} is waiting on the owner: steps ${askedNowList(line.id)} of docs/OWNER_STEPS.he.md` +
          notAskedNowNote(line.id) + "; " +
          line.humanSetup.join("; "),
      );
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

    // What the plan rests on, not just what it adds up to. A sum of targets is
    // not a forecast, and the difference has to be visible to the owner.
    const basis = summarizeTargetBasis();
    const goalIls = Math.round(s.targetMonthlyAgorot / 100);
    out.push("### What the plan rests on");
    out.push("");
    out.push(`| | |`);
    out.push(`|---|---|`);
    out.push(`| Line targets, summed | ₪${basis.totalIls.toLocaleString("en")} against a ₪${goalIls.toLocaleString("en")} goal |`);
    out.push(`| Of that, **measured** | ₪${basis.measuredIls.toLocaleString("en")} |`);
    out.push(`| Inferred | ₪${basis.inferredIls.toLocaleString("en")} |`);
    out.push(`| **Resting on nothing yet** | ₪${basis.unevidencedIls.toLocaleString("en")} |`);
    out.push(`| **Contradicted by their own basis** | ₪${basis.contradictedIls.toLocaleString("en")} |`);
    out.push("");
    // A larger figure the board refused to commit to is printed beside the target, never summed into it
    // (RULING-2026-09-28-floors.md §9: "the report prints it beside the ₪0").
    const contested = DEFAULT_PORTFOLIO.filter((seed) => typeof TARGET_BASIS[seed.id]?.contestedUpperBoundIls === "number").map(
      (seed) =>
        `\`${seed.id}\` ₪${TARGET_BASIS[seed.id]!.contestedUpperBoundIls!.toLocaleString("en")} (target ₪${Math.round(seed.targetMonthlyAgorot / 100).toLocaleString("en")})`,
    );
    if (contested.length) out.push(`Contested upper bounds, not targets and not in the sum: ${contested.join(", ")}.`);
    if (basis.contradictedLines.length) {
      out.push("");
      out.push(
        `Contradicted targets: ${basis.contradictedLines.map((l) => `\`${l}\``).join(", ")}. ` +
        "These are not merely unproven — the evidence cited in each line's own basis field argues " +
        "against its number. They are worse than the unevidenced ones and must not be summed with them.",
      );
    }
    if (basis.unevidencedLines.length) {
      out.push(
        `Unevidenced targets: ${basis.unevidencedLines.map((l) => `\`${l}\``).join(", ")}. ` +
        "These are research tasks that have not been done, not forecasts. Until a sweep measures them, " +
        `the honest reachable figure is the measured ₪${basis.measuredIls.toLocaleString("en")}, not the ₪${basis.totalIls.toLocaleString("en")} total.`,
      );
      out.push("");
    }
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
    // A KPI whose reading is biased is printed with its label, measured or not (research/breadth/BOARD.md Q5).
    const labelled = labelledKpis(db, lines.map((l) => l.id));
    if (labelled.length) {
      out.push("Labelled measurements — each is printed with its label wherever it is printed:");
      out.push("");
      for (const k of labelled) {
        const reading = k.value === null ? "no reading yet" : `${k.value}${k.unit ? ` ${k.unit}` : ""}`;
        out.push(`- \`${k.lineId}\` ${k.kpi}: ${reading} — ${k.label}. Rule: ${k.rule}.`);
      }
      out.push("");
    }
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
  // Beside the sales the Gumroad sync books: the Pro refund rate (RULING-2026-09-30-documents (d), fold action 6).
  const refundRateLine = describeGumroadRefundRate(db, result.ledgerSync?.gumroadRefundRate ?? null);
  if (refundRateLine) out.push(`- ${refundRateLine}`);
  if (result.supervisor) {
    out.push(`- Supervisors reviewed ${result.supervisor.reviewed} line(s), escalating ${result.supervisor.escalations.length}`);
  }
  if (result.audit && (result.audit.sampled || result.audit.chiefAuditRan)) {
    out.push(`- Audit sampled ${result.audit.sampled} review(s), flagged ${result.audit.flagged}${result.audit.chiefAuditRan ? "; chief audit ran" : ""}`);
  }
  if (result.brandMail?.line) out.push(`- ${result.brandMail.line}`);
  if (result.prizeIntake?.line) out.push(`- ${result.prizeIntake.line}`);
  if (result.pageViews) out.push(`- Page views: ${PAGE_VIEW_STATUS_WORDS[result.pageViews.status]} — ${result.pageViews.detail}`);
  for (const g of result.pageViewGates ?? []) out.push(`- ${describePageViewGate(g)}`);
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
      out.push(
        `Owner steps still open for \`${line.id}\` (docs/OWNER_STEPS.he.md): ${askedNowList(line.id)}` +
          notAskedNowNote(line.id),
      );
      const heldRows = heldSecretRowsNote(line.id);
      if (heldRows) out.push(heldRows);
      for (const step of line.humanSetup) out.push(`- [ ] ${step}`);
      out.push("");
    }
    out.push(
      "When you finish a step, tell Claude which step is done and when. Claude records it " +
        "(`scripts/colony.ts setup-done <line> --evidence \"...\"`) and commits state/colony, which moves the line " +
        "out of awaiting_setup and queues its build goal. The scheduled loop runs `tick --no-feed` and does not build.",
    );
    out.push("");
  }

  out.push("---");
  out.push("");
  out.push(
    "Revenue here is only what reached the ledger with a platform transaction id; costs may be entered by hand " +
      "without one. Projections are never counted.",
  );
  return out.join("\n") + "\n";
}

const PAGE_VIEW_STATUS_WORDS: Record<PageViewReadResult["status"], string> = {
  not_configured: "not configured",
  counter_off: "counter off",
  no_clock: "no D0",
  up_to_date: "up to date",
  recorded: "recorded",
  error: "error",
};

/** The page-view verdicts the board applies; typed, so a verdict the gates no longer return fails the typecheck. */
const PAGE_VIEW_BOARD_VERDICTS: readonly PageViewVerdict[] = ["pause", "pass", "extend", "kill"];

/** One report line per page-view line: the verdict, its clock, why, and the weekly readings. */
export function describePageViewGate(g: PageViewGateReading): string {
  const clock = g.period ? ` (${g.period} period from ${g.anchorDay}, day ${g.day})` : "";
  const weeks = g.weeks.length ? `; weeks: ${g.weeks.map((w) => `w${w.week} ${w.views}`).join(", ")}` : "";
  const tail = PAGE_VIEW_BOARD_VERDICTS.includes(g.verdict)
    ? " — a reading for the board to apply"
    : g.verdict === "reader_down"
      ? " — a blocker until the reader reads the missing weeks; never a clock restart"
      : "";
  return `Page views \`${g.lineId}\`: ${g.verdict}${clock} — ${g.notes.join("; ")}${weeks}${tail}`;
}

const REFUND_RATE_TAIL = "a number for the board, never a reason to refuse a refund";

function refundRateReading(
  rate: number,
  c: { refunded: number; sales: number; partiallyRefunded: number; disputed: number; chargedback: number },
): string {
  return (
    `${rate.toFixed(3)} — ${c.refunded} refunded of ${c.sales} sales (the rate counts \`refunded\` only; also in the ` +
    `window: partly refunded ${c.partiallyRefunded}, disputed ${c.disputed}, chargebacks not reversed ${c.chargedback})`
  );
}

/**
 * The report's refund-rate line. This sync's read when the ledger sync ran; otherwise the last sync's read, whatever
 * it found, with its time (GUMROAD_REFUND_RATE_LAST_READ_KEY); nothing when no sync has read yet. It never prints a
 * rate without its counts, never a rate for no sales, and never an older rate once a later read found none.
 */
export function describeGumroadRefundRate(db: Database, read: GumroadRefundRateRead | null): string | null {
  const last = read ? null : lastGumroadRefundRateRead(db);
  const r = read ?? last;
  if (!r) return null;
  const when = last ? ` (last read ${last.at})` : "";
  const head = `Gumroad Pro refund rate, trailing ${REFUND_RATE_WINDOW_DAYS} days${when}`;
  switch (r.status) {
    case "recorded":
      return `${head}: ${refundRateReading(r.rate!, r.count!)} — ${REFUND_RATE_TAIL}`;
    case "no_sales":
      return `${head}: no rate — ${r.detail}`;
    case "not_configured":
      return `Gumroad Pro refund rate${when}: not configured — ${r.detail}`;
    case "no_product":
    case "error":
      return `Gumroad Pro refund rate${when}: not read — ${r.detail}`;
  }
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

/**
 * The checklist step numbers a line still waits on and the owner is asked for
 * now, in execution order. Done steps drop out, and so do steps the owner froze
 * and steps held by a precondition the colony has not met: the report asks only
 * for what the owner is actually being asked to do.
 */
function openOwnerSteps(lineId: string): number[] {
  return openOwnerStepsForLine(lineId).map((s) => s.number);
}

/** The asked-now list as the report prints it; says so plainly when it is empty. */
function askedNowList(lineId: string): string {
  const open = openOwnerSteps(lineId);
  return open.length ? open.join(", ") : "none asked now";
}

/**
 * The site facts a secret row's gate reads (owner-steps.ts `askedOnlyWhen`). A site.json that cannot be read holds
 * every gated row back, so a row is never asked before the thing it opens exists.
 */
function secretGateSite(siteDir: string = DEFAULT_PAGE_VIEW_SITE_DIR): SecretGateSite {
  try {
    return readSite(siteDir);
  } catch {
    return { projectId: "" };
  }
}

/**
 * The secret rows of an asked-now step that a gate still holds back, as one report line, or "" when there are none.
 * Today that is step 6's POSTHOG_READ_KEY until the colony has created the brand's PostHog project and written its id
 * to site.json (research/channel-loop/RULING-2026-09-30-documents.md (c) call 4): named with its reason, never as
 * something to do. Once the id is written the line disappears and step 6 is asked with the row.
 */
export function heldSecretRowsNote(lineId: string, site: SecretGateSite = secretGateSite()): string {
  const parts = openOwnerStepsForLine(lineId).flatMap((step) =>
    heldSecretRows(step, site).map(
      (row) => `step ${step.number}'s \`${row.name}\` row ${SECRET_ROW_GATE_SHORT[row.askedOnlyWhen!]}`,
    ),
  );
  return parts.length ? `Not asked yet: ${parts.join("; ")}.` : "";
}

/**
 * A frozen or held step still gates the line, so it is named — but outside the
 * asked-now list, with the reason it is not asked for, never as something to
 * do. A frozen step names the rule that froze it; a held step names its
 * precondition's short form. In execution order; empty when there is neither.
 */
function notAskedNowNote(lineId: string): string {
  const notAsked = [...frozenOwnerStepsForLine(lineId), ...heldOwnerStepsForLine(lineId)]
    .sort((a, b) => a.order - b.order);
  if (notAsked.length === 0) return "";
  const parts = notAsked.map((s) =>
    s.frozen ? `step ${s.number} frozen by ${s.frozen.rule}` : `step ${s.number} ${s.precondition!.short}`,
  );
  return ` (not asked now: ${parts.join("; ")})`;
}
