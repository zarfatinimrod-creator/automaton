/**
 * Revenue Colony — persistence layer
 *
 * Revenue lines, the ledger (every shekel in or out), reviews (the decision
 * trail of the chain of command) and KPI snapshots. All functions take the
 * raw better-sqlite3 handle so they can be used from heartbeat tasks, tools,
 * and tests alike.
 */

import type { Database } from "better-sqlite3";
import { ulid } from "ulid";
import { toAgorot } from "./money.js";
import {
  DEFAULT_REVENUE_COLONY_CONFIG,
  REVENUE_KV,
  type CommandLevel,
  type LedgerEntry,
  type LedgerEntryInput,
  type LedgerKind,
  type LineMetrics,
  type PortfolioSummary,
  type ReviewDecision,
  type ReviewInput,
  type ReviewRecord,
  type RevenueLine,
  type RevenueLineSeed,
  type RevenueLineStatus,
  type RevenueLineTier,
} from "./types.js";

const DAY_MS = 86_400_000;

export const LINE_STATUSES: RevenueLineStatus[] = [
  "proposed",
  "awaiting_setup",
  "building",
  "live",
  "scaling",
  "paused",
  "killed",
];

export const ACTIVE_LINE_STATUSES: ReadonlySet<RevenueLineStatus> = new Set([
  "building",
  "live",
  "scaling",
]);

export const REVENUE_POSITIVE_KINDS: ReadonlySet<string> = new Set(["sale", "subscription", "payout"]);

// ─── Helpers ─────────────────────────────────────────────────────

export function hasRevenueTables(db: Database): boolean {
  const row = db
    .prepare("SELECT name FROM sqlite_master WHERE type = 'table' AND name = 'revenue_lines'")
    .get() as { name: string } | undefined;
  return Boolean(row);
}

function parseJsonArray(raw: unknown): string[] {
  if (typeof raw !== "string") return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((v): v is string => typeof v === "string") : [];
  } catch {
    return [];
  }
}

function parseJsonObject(raw: unknown): Record<string, unknown> {
  if (typeof raw !== "string") return {};
  try {
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : {};
  } catch {
    return {};
  }
}

function rowToLine(row: any): RevenueLine {
  return {
    id: row.id,
    name: row.name,
    category: row.category,
    tier: row.tier,
    status: row.status,
    directorRole: row.director_role,
    operatingLoop: row.operating_loop,
    kpis: parseJsonArray(row.kpis),
    killCriteria: parseJsonArray(row.kill_criteria),
    scaleCriteria: parseJsonArray(row.scale_criteria),
    targetMonthlyAgorot: Number(row.target_monthly_agorot ?? 0),
    budgetMonthlyCents: Number(row.budget_monthly_cents ?? 0),
    humanSetup: parseJsonArray(row.human_setup),
    humanSetupDone: Number(row.human_setup_done ?? 0) === 1,
    skillName: row.skill_name ?? null,
    launchedAt: row.launched_at ?? null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    killedAt: row.killed_at ?? null,
    killReason: row.kill_reason ?? null,
  };
}

function rowToLedger(row: any): LedgerEntry {
  return {
    id: row.id,
    lineId: row.line_id,
    kind: row.kind,
    amountMinor: Number(row.amount_minor),
    currency: row.currency,
    amountAgorot: Number(row.amount_agorot),
    source: row.source,
    externalId: row.external_id ?? null,
    occurredAt: row.occurred_at,
    recordedAt: row.recorded_at,
    note: row.note ?? null,
  };
}

function rowToReview(row: any): ReviewRecord {
  return {
    id: row.id,
    lineId: row.line_id ?? null,
    level: row.level,
    reviewer: row.reviewer,
    periodStart: row.period_start,
    periodEnd: row.period_end,
    metrics: parseJsonObject(row.metrics),
    decision: row.decision,
    rationale: row.rationale,
    reviewedReviewId: row.reviewed_review_id ?? null,
    createdAt: row.created_at,
  };
}

// ─── Config (KV-backed) ──────────────────────────────────────────

function getKv(db: Database, key: string): string | undefined {
  const row = db.prepare("SELECT value FROM kv WHERE key = ?").get(key) as { value: string } | undefined;
  return row?.value;
}

function setKv(db: Database, key: string, value: string): void {
  db.prepare(
    "INSERT OR REPLACE INTO kv (key, value, updated_at) VALUES (?, ?, datetime('now'))",
  ).run(key, value);
}

export function isRevenueColonyEnabled(db: Database): boolean {
  const raw = getKv(db, REVENUE_KV.enabled);
  if (raw === undefined) return DEFAULT_REVENUE_COLONY_CONFIG.enabled;
  return raw === "1" || raw === "true";
}

export function setRevenueColonyEnabled(db: Database, enabled: boolean): void {
  setKv(db, REVENUE_KV.enabled, enabled ? "1" : "0");
}

export function getTargetMonthlyAgorot(db: Database): number {
  const raw = Number(getKv(db, REVENUE_KV.target));
  return Number.isFinite(raw) && raw > 0 ? Math.floor(raw) : DEFAULT_REVENUE_COLONY_CONFIG.targetMonthlyAgorot;
}

export function getStretchMonthlyAgorot(db: Database): number {
  const raw = Number(getKv(db, REVENUE_KV.stretch));
  return Number.isFinite(raw) && raw > 0 ? Math.floor(raw) : DEFAULT_REVENUE_COLONY_CONFIG.stretchMonthlyAgorot;
}

export function setTargets(db: Database, targetAgorot: number, stretchAgorot?: number): void {
  if (!Number.isFinite(targetAgorot) || targetAgorot <= 0) {
    throw new Error("target must be a positive number of agorot");
  }
  setKv(db, REVENUE_KV.target, String(Math.floor(targetAgorot)));
  if (stretchAgorot !== undefined) {
    if (!Number.isFinite(stretchAgorot) || stretchAgorot < targetAgorot) {
      throw new Error("stretch must be >= target");
    }
    setKv(db, REVENUE_KV.stretch, String(Math.floor(stretchAgorot)));
  }
}

export function getProductMap(db: Database): Record<string, string> {
  const parsed = parseJsonObject(getKv(db, REVENUE_KV.productMap));
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(parsed)) {
    if (typeof v === "string") out[k] = v;
  }
  return out;
}

export function mapProductToLine(db: Database, source: string, productId: string, lineId: string): void {
  const map = getProductMap(db);
  map[`${source}:${productId}`] = lineId;
  setKv(db, REVENUE_KV.productMap, JSON.stringify(map));
}

export function getConnectorCursor(db: Database, source: string): string | undefined {
  return getKv(db, `${REVENUE_KV.connectorCursorPrefix}${source}`);
}

export function setConnectorCursor(db: Database, source: string, cursor: string): void {
  setKv(db, `${REVENUE_KV.connectorCursorPrefix}${source}`, cursor);
}

// ─── Revenue lines ───────────────────────────────────────────────

const LINE_ID_RE = /^[a-z0-9][a-z0-9-]{1,63}$/;

export function assertLineId(id: string): string {
  const trimmed = id.trim();
  if (!LINE_ID_RE.test(trimmed)) {
    throw new Error(`Invalid revenue line id "${id}": use lowercase letters, digits and dashes (2-64 chars)`);
  }
  return trimmed;
}

export function listLines(
  db: Database,
  filter?: { status?: RevenueLineStatus[]; tier?: RevenueLineTier[] },
): RevenueLine[] {
  const rows = db
    .prepare("SELECT * FROM revenue_lines ORDER BY created_at ASC")
    .all() as any[];
  let lines = rows.map(rowToLine);
  if (filter?.status?.length) {
    const set = new Set(filter.status);
    lines = lines.filter((l) => set.has(l.status));
  }
  if (filter?.tier?.length) {
    const set = new Set(filter.tier);
    lines = lines.filter((l) => set.has(l.tier));
  }
  return lines;
}

export function getLine(db: Database, id: string): RevenueLine | undefined {
  const row = db.prepare("SELECT * FROM revenue_lines WHERE id = ?").get(id) as any | undefined;
  return row ? rowToLine(row) : undefined;
}

/**
 * Insert a line from a seed. Returns false if the id already exists (existing
 * lines are never overwritten — the board changes them through explicit
 * decisions so the audit trail stays honest).
 */
export function insertLineFromSeed(db: Database, seed: RevenueLineSeed): boolean {
  const id = assertLineId(seed.id);
  if (getLine(db, id)) return false;
  const now = new Date().toISOString();
  const status: RevenueLineStatus = seed.status ?? (seed.humanSetup.length > 0 ? "awaiting_setup" : "proposed");
  db.prepare(
    `INSERT INTO revenue_lines
      (id, name, category, tier, status, director_role, operating_loop, kpis, kill_criteria,
       scale_criteria, target_monthly_agorot, budget_monthly_cents, human_setup, human_setup_done,
       skill_name, launched_at, created_at, updated_at, killed_at, kill_reason)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NULL, ?, ?, NULL, NULL)`,
  ).run(
    id,
    seed.name,
    seed.category,
    seed.tier,
    status,
    seed.directorRole,
    seed.operatingLoop,
    JSON.stringify(seed.kpis),
    JSON.stringify(seed.killCriteria),
    JSON.stringify(seed.scaleCriteria),
    Math.max(0, Math.floor(seed.targetMonthlyAgorot)),
    Math.max(0, Math.floor(seed.budgetMonthlyCents)),
    JSON.stringify(seed.humanSetup),
    0,
    seed.skillName ?? null,
    now,
    now,
  );
  return true;
}

export const LINE_TRANSITIONS: Record<RevenueLineStatus, RevenueLineStatus[]> = {
  proposed: ["awaiting_setup", "building", "killed", "paused"],
  awaiting_setup: ["proposed", "building", "killed", "paused"],
  building: ["live", "paused", "killed", "awaiting_setup"],
  live: ["scaling", "paused", "killed", "building"],
  scaling: ["live", "paused", "killed"],
  paused: ["proposed", "building", "live", "killed"],
  killed: [],
};

export function updateLineStatus(
  db: Database,
  id: string,
  status: RevenueLineStatus,
  opts?: { reason?: string; force?: boolean },
): RevenueLine {
  const line = getLine(db, id);
  if (!line) throw new Error(`Revenue line not found: ${id}`);
  if (line.status === status) return line;
  if (!opts?.force && !LINE_TRANSITIONS[line.status].includes(status)) {
    throw new Error(`Illegal revenue line transition ${line.status} → ${status} for ${id}`);
  }
  const now = new Date().toISOString();
  const launchedAt = status === "live" && !line.launchedAt ? now : line.launchedAt;
  const killedAt = status === "killed" ? now : null;
  db.prepare(
    `UPDATE revenue_lines
     SET status = ?, launched_at = ?, killed_at = ?, kill_reason = ?, updated_at = ?
     WHERE id = ?`,
  ).run(status, launchedAt, killedAt, status === "killed" ? (opts?.reason ?? "killed by board") : null, now, id);
  return getLine(db, id)!;
}

export function setHumanSetupDone(db: Database, id: string, done: boolean): RevenueLine {
  const line = getLine(db, id);
  if (!line) throw new Error(`Revenue line not found: ${id}`);
  db.prepare("UPDATE revenue_lines SET human_setup_done = ?, updated_at = ? WHERE id = ?")
    .run(done ? 1 : 0, new Date().toISOString(), id);
  return getLine(db, id)!;
}

export function setLineBudget(db: Database, id: string, budgetMonthlyCents: number): void {
  db.prepare("UPDATE revenue_lines SET budget_monthly_cents = ?, updated_at = ? WHERE id = ?")
    .run(Math.max(0, Math.floor(budgetMonthlyCents)), new Date().toISOString(), id);
}

export function setLineTier(db: Database, id: string, tier: RevenueLineTier): void {
  db.prepare("UPDATE revenue_lines SET tier = ?, updated_at = ? WHERE id = ?")
    .run(tier, new Date().toISOString(), id);
}

export function setLineTarget(db: Database, id: string, targetMonthlyAgorot: number): void {
  db.prepare("UPDATE revenue_lines SET target_monthly_agorot = ?, updated_at = ? WHERE id = ?")
    .run(Math.max(0, Math.floor(targetMonthlyAgorot)), new Date().toISOString(), id);
}

// ─── Ledger ──────────────────────────────────────────────────────

/**
 * Kinds that move money through someone else's system, and therefore always
 * have a transaction id on the other side. `cost` is the exception: our own
 * compute and infrastructure spending has no platform receipt to quote.
 */
const PLATFORM_MEDIATED_KINDS: readonly LedgerKind[] = ["sale", "subscription", "payout", "refund"];

/**
 * Record a ledger entry. Idempotent on (source, externalId): a second call
 * with the same pair returns null instead of double-counting.
 *
 * MISSION rule 2: a shekel counts when it is recorded with a platform
 * transaction id. So money in — and refunds out — must carry one. Without it
 * an entry is unverifiable AND undeduplicated, because the idempotency check
 * has nothing to key on: the same imagined sale can be booked repeatedly and
 * the portfolio would show revenue nobody ever paid. That is the one failure
 * this whole system exists to prevent.
 */
export function recordLedgerEntry(db: Database, input: LedgerEntryInput): LedgerEntry | null {
  if (!Number.isFinite(input.amountMinor) || !Number.isInteger(input.amountMinor)) {
    throw new Error("amountMinor must be an integer number of minor units");
  }
  if (!input.lineId.trim()) throw new Error("lineId is required");
  const source = input.source.trim().toLowerCase();
  if (!source) throw new Error("source is required");
  const externalId = input.externalId?.trim() || null;

  if (!externalId && PLATFORM_MEDIATED_KINDS.includes(input.kind)) {
    throw new Error(
      `externalId is required for a ${input.kind}: money only counts when it carries the platform's ` +
      "transaction id (MISSION rule 2). Without one the entry cannot be verified against the platform " +
      "and cannot be deduplicated, so the same amount can be booked twice. Only 'cost' may omit it.",
    );
  }

  if (externalId) {
    const existing = db
      .prepare("SELECT id FROM revenue_ledger WHERE source = ? AND external_id = ?")
      .get(source, externalId) as { id: string } | undefined;
    if (existing) return null;
  }

  // Costs and refunds are stored as negative amounts regardless of the sign the caller passed.
  const signedMinor = input.kind === "cost" || input.kind === "refund"
    ? -Math.abs(input.amountMinor)
    : Math.abs(input.amountMinor);

  const now = new Date().toISOString();
  const entry: LedgerEntry = {
    id: ulid(),
    lineId: input.lineId.trim(),
    kind: input.kind,
    amountMinor: signedMinor,
    currency: input.currency.trim().toUpperCase(),
    amountAgorot: toAgorot(db, signedMinor, input.currency),
    source,
    externalId,
    occurredAt: input.occurredAt ?? now,
    recordedAt: now,
    note: input.note ?? null,
  };

  db.prepare(
    `INSERT INTO revenue_ledger
      (id, line_id, kind, amount_minor, currency, amount_agorot, source, external_id, occurred_at, recorded_at, note)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  ).run(
    entry.id,
    entry.lineId,
    entry.kind,
    entry.amountMinor,
    entry.currency,
    entry.amountAgorot,
    entry.source,
    entry.externalId,
    entry.occurredAt,
    entry.recordedAt,
    entry.note,
  );

  // First positive revenue on a building line promotes it to live automatically:
  // "live" is defined by money, not by a status the director sets.
  if (REVENUE_POSITIVE_KINDS.has(entry.kind) && entry.amountAgorot > 0) {
    const line = getLine(db, entry.lineId);
    if (line && line.status === "building") {
      updateLineStatus(db, line.id, "live");
    }
  }

  return entry;
}

export function listLedger(
  db: Database,
  opts?: { lineId?: string; sinceIso?: string; limit?: number },
): LedgerEntry[] {
  const clauses: string[] = [];
  const params: unknown[] = [];
  if (opts?.lineId) {
    clauses.push("line_id = ?");
    params.push(opts.lineId);
  }
  if (opts?.sinceIso) {
    clauses.push("occurred_at >= ?");
    params.push(opts.sinceIso);
  }
  const where = clauses.length ? `WHERE ${clauses.join(" AND ")}` : "";
  const limit = Math.max(1, Math.min(5000, Math.floor(opts?.limit ?? 500)));
  const rows = db
    .prepare(`SELECT * FROM revenue_ledger ${where} ORDER BY occurred_at DESC LIMIT ?`)
    .all(...params, limit) as any[];
  return rows.map(rowToLedger);
}

interface WindowSums {
  revenue: number;
  refunds: number;
  cost: number;
  count: number;
}

function sumWindow(db: Database, lineId: string, sinceIso: string, untilIso: string): WindowSums {
  const rows = db
    .prepare(
      `SELECT kind, COALESCE(SUM(amount_agorot), 0) AS total, COUNT(*) AS count
       FROM revenue_ledger
       WHERE line_id = ? AND occurred_at >= ? AND occurred_at <= ?
       GROUP BY kind`,
    )
    .all(lineId, sinceIso, untilIso) as Array<{ kind: string; total: number; count: number }>;

  const sums: WindowSums = { revenue: 0, refunds: 0, cost: 0, count: 0 };
  for (const row of rows) {
    if (REVENUE_POSITIVE_KINDS.has(row.kind)) {
      sums.revenue += Number(row.total);
      sums.count += Number(row.count);
    } else if (row.kind === "refund") {
      sums.refunds += Math.abs(Number(row.total));
    } else if (row.kind === "cost") {
      sums.cost += Math.abs(Number(row.total));
    }
  }
  return sums;
}

function daysBetween(fromIso: string | null, nowMs: number): number | null {
  if (!fromIso) return null;
  const ms = Date.parse(fromIso);
  if (Number.isNaN(ms)) return null;
  return Math.max(0, (nowMs - ms) / DAY_MS);
}

export function computeLineMetrics(db: Database, line: RevenueLine, nowIso = new Date().toISOString()): LineMetrics {
  const nowMs = Date.parse(nowIso);
  const since30 = new Date(nowMs - 30 * DAY_MS).toISOString();
  const since7 = new Date(nowMs - 7 * DAY_MS).toISOString();

  const w30 = sumWindow(db, line.id, since30, nowIso);
  const w7 = sumWindow(db, line.id, since7, nowIso);

  const lastRevenueRow = db
    .prepare(
      `SELECT MAX(occurred_at) AS ts FROM revenue_ledger
       WHERE line_id = ? AND kind IN ('sale','subscription','payout') AND amount_agorot > 0`,
    )
    .get(line.id) as { ts: string | null } | undefined;

  const net30 = w30.revenue - w30.refunds - w30.cost;
  const runRate7 = (w7.revenue - w7.refunds) * (30 / 7);
  const trend = w30.revenue - w30.refunds > 0 ? runRate7 / (w30.revenue - w30.refunds) : (runRate7 > 0 ? Infinity : 1);

  return {
    lineId: line.id,
    status: line.status,
    revenue30dAgorot: w30.revenue,
    revenue7dAgorot: w7.revenue,
    refunds30dAgorot: w30.refunds,
    cost30dAgorot: w30.cost,
    net30dAgorot: net30,
    transactions30d: w30.count,
    trend: Number.isFinite(trend) ? Number(trend.toFixed(3)) : 99,
    daysSinceCreated: daysBetween(line.createdAt, nowMs) ?? 0,
    daysSinceLaunch: daysBetween(line.launchedAt, nowMs),
    daysSinceLastRevenue: daysBetween(lastRevenueRow?.ts ?? null, nowMs),
    targetMonthlyAgorot: line.targetMonthlyAgorot,
    targetAttainment: line.targetMonthlyAgorot > 0 ? (w30.revenue - w30.refunds) / line.targetMonthlyAgorot : 0,
  };
}

export function computePortfolioSummary(db: Database, nowIso = new Date().toISOString()): PortfolioSummary {
  const lines = listLines(db);
  const metrics = lines.map((line) => computeLineMetrics(db, line, nowIso));
  const counts = Object.fromEntries(LINE_STATUSES.map((s) => [s, 0])) as Record<RevenueLineStatus, number>;
  for (const line of lines) counts[line.status] += 1;

  const total30 = metrics.reduce((s, m) => s + m.revenue30dAgorot - m.refunds30dAgorot, 0);
  const total7 = metrics.reduce((s, m) => s + m.revenue7dAgorot, 0);
  const cost30 = metrics.reduce((s, m) => s + m.cost30dAgorot, 0);
  const target = getTargetMonthlyAgorot(db);

  return {
    asOf: nowIso,
    targetMonthlyAgorot: target,
    stretchMonthlyAgorot: getStretchMonthlyAgorot(db),
    total30dAgorot: total30,
    total7dAgorot: total7,
    totalCost30dAgorot: cost30,
    net30dAgorot: total30 - cost30,
    attainment: target > 0 ? total30 / target : 0,
    runRateMonthlyAgorot: Math.round(total7 * (30 / 7)),
    lines: metrics,
    counts,
  };
}

// ─── Reviews (decision trail) ────────────────────────────────────

export function insertReview(db: Database, input: ReviewInput): ReviewRecord {
  const review: ReviewRecord = {
    id: ulid(),
    lineId: input.lineId,
    level: input.level,
    reviewer: input.reviewer,
    periodStart: input.periodStart,
    periodEnd: input.periodEnd,
    metrics: input.metrics,
    decision: input.decision,
    rationale: input.rationale,
    reviewedReviewId: input.reviewedReviewId ?? null,
    createdAt: new Date().toISOString(),
  };
  db.prepare(
    `INSERT INTO revenue_reviews
      (id, line_id, level, reviewer, period_start, period_end, metrics, decision, rationale, reviewed_review_id, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  ).run(
    review.id,
    review.lineId,
    review.level,
    review.reviewer,
    review.periodStart,
    review.periodEnd,
    JSON.stringify(review.metrics),
    review.decision,
    review.rationale,
    review.reviewedReviewId,
    review.createdAt,
  );
  return review;
}

export function listReviews(
  db: Database,
  opts?: { lineId?: string | null; level?: CommandLevel; sinceIso?: string; decision?: ReviewDecision; limit?: number },
): ReviewRecord[] {
  const clauses: string[] = [];
  const params: unknown[] = [];
  if (opts?.lineId !== undefined) {
    if (opts.lineId === null) clauses.push("line_id IS NULL");
    else {
      clauses.push("line_id = ?");
      params.push(opts.lineId);
    }
  }
  if (opts?.level) {
    clauses.push("level = ?");
    params.push(opts.level);
  }
  if (opts?.sinceIso) {
    clauses.push("created_at >= ?");
    params.push(opts.sinceIso);
  }
  if (opts?.decision) {
    clauses.push("decision = ?");
    params.push(opts.decision);
  }
  const where = clauses.length ? `WHERE ${clauses.join(" AND ")}` : "";
  const limit = Math.max(1, Math.min(1000, Math.floor(opts?.limit ?? 100)));
  const rows = db
    .prepare(`SELECT * FROM revenue_reviews ${where} ORDER BY created_at DESC LIMIT ?`)
    .all(...params, limit) as any[];
  return rows.map(rowToReview);
}

export function getReviewById(db: Database, id: string): ReviewRecord | undefined {
  const row = db.prepare("SELECT * FROM revenue_reviews WHERE id = ?").get(id) as any | undefined;
  return row ? rowToReview(row) : undefined;
}

export function latestReviewForLine(db: Database, lineId: string, level?: CommandLevel): ReviewRecord | undefined {
  return listReviews(db, { lineId, level, limit: 1 })[0];
}

// ─── KPI snapshots ───────────────────────────────────────────────

export function recordKpi(db: Database, lineId: string, kpi: string, value: number, unit?: string): void {
  if (!Number.isFinite(value)) throw new Error(`KPI value must be finite: ${kpi}=${value}`);
  db.prepare(
    "INSERT INTO revenue_kpi_snapshots (id, line_id, kpi, value, unit, captured_at) VALUES (?, ?, ?, ?, ?, ?)",
  ).run(ulid(), lineId, kpi.trim(), value, unit ?? null, new Date().toISOString());
}

export function latestKpis(db: Database, lineId: string): Record<string, { value: number; unit: string | null; capturedAt: string }> {
  const rows = db
    .prepare(
      `SELECT kpi, value, unit, captured_at AS capturedAt
       FROM revenue_kpi_snapshots
       WHERE line_id = ?
       ORDER BY captured_at DESC, rowid DESC`,
    )
    .all(lineId) as Array<{ kpi: string; value: number; unit: string | null; capturedAt: string }>;
  const out: Record<string, { value: number; unit: string | null; capturedAt: string }> = {};
  for (const row of rows) {
    if (!(row.kpi in out)) out[row.kpi] = { value: row.value, unit: row.unit, capturedAt: row.capturedAt };
  }
  return out;
}

export function pruneKpiSnapshots(db: Database, keepDays = 90): number {
  const cutoff = new Date(Date.now() - keepDays * DAY_MS).toISOString();
  const result = db.prepare("DELETE FROM revenue_kpi_snapshots WHERE captured_at < ?").run(cutoff);
  return result.changes;
}
