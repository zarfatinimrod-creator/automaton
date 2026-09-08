import { describe, it, expect, beforeEach, afterEach } from "vitest";
import type BetterSqlite3 from "better-sqlite3";
import { createInMemoryDb } from "../orchestration/test-db.js";
import { describeStall, findStalledLines, STALL_DAYS } from "../../revenue/watchdog.js";
import { insertLineFromSeed, insertReview, recordKpi, recordLedgerEntry, updateLineStatus } from "../../revenue/ledger.js";
import { agorotFromIls } from "../../revenue/money.js";
import type { RevenueLineSeed, RevenueLineStatus } from "../../revenue/types.js";

const DAY = 86_400_000;
const t0 = Date.parse("2026-09-03T00:00:00.000Z");
const ago = (days: number) => new Date(t0 - days * DAY).toISOString();

function seed(id: string): RevenueLineSeed {
  return {
    id, name: id, category: "micro_saas", tier: "core", directorRole: `director-${id}`,
    operatingLoop: "build, ship, measure", kpis: ["sales"], killCriteria: ["none"],
    scaleCriteria: ["none"], targetMonthlyAgorot: agorotFromIls(1000),
    budgetMonthlyCents: 1000, humanSetup: [], skillName: null,
  };
}


// recordKpi always stamps the current time, so back-date through the real
// writer instead of hand-rolling an INSERT that could drift from the schema.
function kpiAt(db: BetterSqlite3.Database, lineId: string, kpi: string, value: number, at: string) {
  recordKpi(db, lineId, kpi, value);
  db.prepare("UPDATE revenue_kpi_snapshots SET captured_at = ? WHERE line_id = ? AND kpi = ?").run(at, lineId, kpi);
}

describe("revenue/watchdog — telling working apart from warm", () => {
  let db: BetterSqlite3.Database;

  const addLine = (id: string, status: RevenueLineStatus, createdDaysAgo = 60) => {
    insertLineFromSeed(db, seed(id));
    db.prepare("UPDATE revenue_lines SET created_at = ? WHERE id = ?").run(ago(createdDaysAgo), id);
    if (status !== "proposed") updateLineStatus(db, id, status, { force: true });
  };

  beforeEach(() => { db = createInMemoryDb(); });
  afterEach(() => { db.close(); });

  it("names a line that was started and then did nothing", () => {
    addLine("ghost", "building");
    const stalled = findStalledLines(db, t0);
    expect(stalled).toHaveLength(1);
    expect(stalled[0]).toMatchObject({ lineId: "ghost", status: "building", lastSignal: null });
    expect(describeStall(stalled[0])).toContain("never produced");
  });

  it("counts a KPI snapshot as progress", () => {
    addLine("measured", "building");
    kpiAt(db, "measured", "signups", 3, ago(1));
    expect(findStalledLines(db, t0)).toHaveLength(0);
  });

  it("counts a sale as progress", () => {
    addLine("selling", "live");
    recordLedgerEntry(db, {
      lineId: "selling", kind: "sale", amountMinor: 4900, currency: "ILS",
      source: "manual", externalId: "tx-1", occurredAt: ago(2),
    });
    expect(findStalledLines(db, t0)).toHaveLength(0);
  });

  it("counts a review as progress, since a supervisor looked at it", () => {
    addLine("reviewed", "building");
    insertReview(db, {
      lineId: "reviewed", level: "supervisor", reviewer: "supervisor",
      periodStart: ago(4), periodEnd: ago(3), decision: "hold", rationale: "early", metrics: {},
    });
    expect(findStalledLines(db, t0)).toHaveLength(0);
  });

  it("goes off once the newest signal ages past the threshold", () => {
    addLine("stale", "building");
    kpiAt(db, "stale", "signups", 1, ago(STALL_DAYS + 3));
    const stalled = findStalledLines(db, t0);
    expect(stalled).toHaveLength(1);
    expect(stalled[0].lastSignal).toBe("kpi");
    expect(stalled[0].daysSinceProgress).toBe(STALL_DAYS + 3);
    expect(describeStall(stalled[0])).toContain("Alive is not the same as working");
  });

  it("holds its fire right up to the threshold", () => {
    addLine("borderline", "building");
    kpiAt(db, "borderline", "signups", 1, ago(STALL_DAYS - 1));
    expect(findStalledLines(db, t0)).toHaveLength(0);
  });

  it("uses the newest signal, not the first one it finds", () => {
    addLine("mixed", "live");
    kpiAt(db, "mixed", "signups", 1, ago(40));
    recordLedgerEntry(db, {
      lineId: "mixed", kind: "sale", amountMinor: 100, currency: "ILS",
      source: "manual", externalId: "tx-2", occurredAt: ago(1),
    });
    expect(findStalledLines(db, t0)).toHaveLength(0);
  });

  it("leaves alone the statuses that are legitimately quiet", () => {
    // A line waiting on the owner, or killed, is not stalled — it is parked.
    for (const status of ["proposed", "awaiting_setup", "paused", "killed"] as const) {
      addLine(`quiet-${status.replace("_", "-")}`, status);
    }
    expect(findStalledLines(db, t0)).toHaveLength(0);
  });

  it("orders the worst offender first", () => {
    addLine("bad", "building", 90);
    addLine("worse", "building", 200);
    kpiAt(db, "bad", "x", 1, ago(10));
    const stalled = findStalledLines(db, t0);
    expect(stalled.map((s) => s.lineId)).toEqual(["worse", "bad"]);
  });

  it("does not trust a timestamp a stalled worker could keep touching", () => {
    // updated_at is written by whatever last touched the row, including a
    // worker that is doing nothing useful. Only hard artifacts count.
    addLine("busywork", "building");
    db.prepare("UPDATE revenue_lines SET updated_at = ? WHERE id = ?").run(new Date(t0).toISOString(), "busywork");
    expect(findStalledLines(db, t0)).toHaveLength(1);
  });
});
