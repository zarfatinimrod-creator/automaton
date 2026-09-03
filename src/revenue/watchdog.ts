/**
 * Revenue Colony — the no-progress watchdog
 *
 * The heartbeat proves an agent is alive. The liveness check in runner.ts
 * proves the loop is running and that live lines are still taking money.
 * Neither can tell working from warm.
 *
 * Every documented autonomous-agent stall of 2026 looks the same from the
 * outside: the process is up, the heartbeat is green, the status says
 * "in progress", and nothing has actually happened for days. A line sitting in
 * `building` with no KPI snapshot, no ledger row and no review is indis-
 * tinguishable from one being actively built — unless something asks when it
 * last produced anything.
 *
 * This asks. It only reads what the database can prove: a KPI snapshot, a
 * ledger entry, or a review. It deliberately does NOT infer progress from
 * timestamps a worker controls, because a stalled worker that still writes
 * `updated_at` is exactly the case being caught.
 */

import type { Database } from "better-sqlite3";
import type { RevenueLineStatus } from "./types.js";

/** A line that should be producing something and has not, for this long. */
export const STALL_DAYS = 7;

/** Statuses where silence is a problem. Others are legitimately quiet. */
const WORKING_STATUSES: readonly RevenueLineStatus[] = ["building", "live", "scaling"];

export interface StalledLine {
  lineId: string;
  status: RevenueLineStatus;
  /** Days since the newest hard signal, or since the line was created. */
  daysSinceProgress: number;
  /** What the newest signal was, or null when the line has never produced one. */
  lastSignal: "kpi" | "ledger" | "review" | null;
  lastSignalAt: string | null;
}

interface SignalRow {
  id: string;
  status: RevenueLineStatus;
  created_at: string;
  kpi_at: string | null;
  ledger_at: string | null;
  review_at: string | null;
}

const DAY_MS = 86_400_000;

/**
 * Lines that are supposed to be working and have produced nothing for
 * `stallDays`. Ordered by how long they have been silent, worst first.
 */
export function findStalledLines(db: Database, nowMs: number, stallDays = STALL_DAYS): StalledLine[] {
  const placeholders = WORKING_STATUSES.map(() => "?").join(", ");
  const rows = db
    .prepare(
      `SELECT r.id AS id, r.status AS status, r.created_at AS created_at,
              (SELECT MAX(captured_at) FROM revenue_kpi_snapshots k WHERE k.line_id = r.id) AS kpi_at,
              (SELECT MAX(occurred_at)  FROM revenue_ledger      l WHERE l.line_id = r.id) AS ledger_at,
              (SELECT MAX(period_end)   FROM revenue_reviews     v WHERE v.line_id = r.id) AS review_at
         FROM revenue_lines r
        WHERE r.status IN (${placeholders})`,
    )
    .all(...WORKING_STATUSES) as SignalRow[];

  const out: StalledLine[] = [];
  for (const row of rows) {
    const signals: [StalledLine["lastSignal"], string | null][] = [
      ["kpi", row.kpi_at],
      ["ledger", row.ledger_at],
      ["review", row.review_at],
    ];
    let lastSignal: StalledLine["lastSignal"] = null;
    let lastMs = Number.NEGATIVE_INFINITY;
    for (const [kind, at] of signals) {
      if (!at) continue;
      const ms = Date.parse(at);
      if (Number.isFinite(ms) && ms > lastMs) {
        lastMs = ms;
        lastSignal = kind;
      }
    }

    // A line that has never produced anything is measured from its creation,
    // not treated as fine. "Never started" is the worst kind of stalled.
    const since = Number.isFinite(lastMs) ? lastMs : Date.parse(row.created_at);
    if (!Number.isFinite(since)) continue;

    const days = Math.floor((nowMs - since) / DAY_MS);
    if (days >= stallDays) {
      out.push({
        lineId: row.id,
        status: row.status,
        daysSinceProgress: days,
        lastSignal,
        lastSignalAt: lastSignal ? new Date(lastMs).toISOString() : null,
      });
    }
  }
  return out.sort((a, b) => b.daysSinceProgress - a.daysSinceProgress);
}

/** One line the board report can print, phrased so the problem is unambiguous. */
export function describeStall(line: StalledLine): string {
  const where = `${line.lineId} has been ${line.status} for ${line.daysSinceProgress} days`;
  return line.lastSignal
    ? `${where} with no KPI, sale or review since its last ${line.lastSignal} on ${line.lastSignalAt!.slice(0, 10)}. ` +
      "Alive is not the same as working: something should have produced a number by now."
    : `${where} and has never produced a KPI, a sale or a review. It was started and then nothing happened.`;
}
