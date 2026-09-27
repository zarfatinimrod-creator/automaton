import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import type BetterSqlite3 from "better-sqlite3";
import { createInMemoryDb } from "../orchestration/test-db.js";
import { ingestAlgoraSupplyMeasurement, ingestApifyMeasurement } from "../../revenue/measurements.js";
import { latestKpis } from "../../revenue/ledger.js";
import { seedDefaultPortfolio } from "../../revenue/portfolio.js";

describe("ingestApifyMeasurement — measurement file → KPI snapshots", () => {
  let db: BetterSqlite3.Database;
  let dir: string;
  const write = (body: unknown) => writeFileSync(join(dir, "apify-runs.json"), typeof body === "string" ? body : JSON.stringify(body));

  beforeEach(() => {
    db = createInMemoryDb();
    seedDefaultPortfolio(db);
    dir = mkdtempSync(join(tmpdir(), "measurements-"));
  });
  afterEach(() => {
    db.close();
    rmSync(dir, { recursive: true, force: true });
  });

  it("does nothing when no measurement exists yet — the normal state before a token", () => {
    const r = ingestApifyMeasurement(db, dir);
    expect(r.status).toBe("absent");
    expect(latestKpis(db, "apify-actors")).toEqual({});
  });

  it("records strangerUsers30d from the Actor-object block, and the runs-list count under its own caveat", () => {
    write({ measuredAt: "2026-10-01T06:00:00.000Z", strangerRunsLast30Days: 0, users: { strangerUsers30d: 7 } });
    const r = ingestApifyMeasurement(db, dir);
    expect(r.status).toBe("recorded");
    const k = latestKpis(db, "apify-actors");
    expect(k.strangerUsers30d.value).toBe(7);
    expect(k.strangerRuns30d.value).toBe(0);
    expect(k.strangerRuns30d.unit).toMatch(/scope unverified/);
  });

  it("records each measurement once: the same measuredAt is skipped, a newer one is recorded", () => {
    write({ measuredAt: "2026-10-01T06:00:00.000Z", users: { strangerUsers30d: 7 } });
    expect(ingestApifyMeasurement(db, dir).status).toBe("recorded");
    expect(ingestApifyMeasurement(db, dir).status).toBe("unchanged");
    write({ measuredAt: "2026-10-02T06:00:00.000Z", users: { strangerUsers30d: 9 } });
    expect(ingestApifyMeasurement(db, dir).status).toBe("recorded");
    expect(latestKpis(db, "apify-actors").strangerUsers30d.value).toBe(9);
  });

  it("does not record an unknown users count as zero", () => {
    write({ measuredAt: "2026-10-01T06:00:00.000Z", strangerRunsLast30Days: 2, users: { strangerUsers30d: null } });
    const r = ingestApifyMeasurement(db, dir);
    expect(r.recorded).toEqual(["strangerRuns30d"]);
    expect(latestKpis(db, "apify-actors").strangerUsers30d).toBeUndefined();
  });

  it("reports a broken file instead of throwing", () => {
    write("{not json");
    expect(ingestApifyMeasurement(db, dir).status).toBe("invalid");
    write({ users: { strangerUsers30d: 3 } });
    expect(ingestApifyMeasurement(db, dir).detail).toMatch(/measuredAt/);
  });
});

describe("ingestAlgoraSupplyMeasurement — the weekly supply count → claimableBounties (BOARD-2 §2.2)", () => {
  let db: BetterSqlite3.Database;
  let dir: string;
  const write = (body: unknown) => writeFileSync(join(dir, "algora-supply.json"), typeof body === "string" ? body : JSON.stringify(body));

  beforeEach(() => {
    db = createInMemoryDb();
    seedDefaultPortfolio(db);
    dir = mkdtempSync(join(tmpdir(), "measurements-supply-"));
  });
  afterEach(() => {
    db.close();
    rmSync(dir, { recursive: true, force: true });
  });

  it("does nothing before the weekly job has written a reading", () => {
    expect(ingestAlgoraSupplyMeasurement(db, dir).status).toBe("absent");
    expect(latestKpis(db, "oss-bounties")).toEqual({});
  });

  it("records claimableBounties on the oss-bounties line", () => {
    write({ measuredAt: "2026-09-28T06:30:00.000Z", claimableBounties: 4, labelledOpenIssues: 561 });
    const r = ingestAlgoraSupplyMeasurement(db, dir);
    expect(r).toMatchObject({ status: "recorded", recorded: ["claimableBounties"] });
    const k = latestKpis(db, "oss-bounties");
    expect(k.claimableBounties.value).toBe(4);
    expect(k.claimableBounties.unit).toMatch(/≥ \$50/);
  });

  it("records a real zero as 0 — the job writes nothing when it cannot measure, so a file is always a reading", () => {
    write({ measuredAt: "2026-09-28T06:30:00.000Z", claimableBounties: 0 });
    expect(ingestAlgoraSupplyMeasurement(db, dir).status).toBe("recorded");
    expect(latestKpis(db, "oss-bounties").claimableBounties.value).toBe(0);
  });

  it("records each weekly reading once, per measuredAt", () => {
    write({ measuredAt: "2026-09-28T06:30:00.000Z", claimableBounties: 4 });
    expect(ingestAlgoraSupplyMeasurement(db, dir).status).toBe("recorded");
    expect(ingestAlgoraSupplyMeasurement(db, dir).status).toBe("unchanged");
    write({ measuredAt: "2026-10-05T06:30:00.000Z", claimableBounties: 2 });
    expect(ingestAlgoraSupplyMeasurement(db, dir).status).toBe("recorded");
    expect(latestKpis(db, "oss-bounties").claimableBounties.value).toBe(2);
    const n = db.prepare("SELECT COUNT(*) AS n FROM revenue_kpi_snapshots WHERE line_id = 'oss-bounties' AND kpi = 'claimableBounties'").get() as { n: number };
    expect(n.n).toBe(2);
  });

  it("keeps its measuredAt apart from the Apify one", () => {
    writeFileSync(join(dir, "apify-runs.json"), JSON.stringify({ measuredAt: "2026-10-09T06:00:00.000Z", users: { strangerUsers30d: 1 } }));
    expect(ingestApifyMeasurement(db, dir).status).toBe("recorded");
    write({ measuredAt: "2026-09-28T06:30:00.000Z", claimableBounties: 4 });
    expect(ingestAlgoraSupplyMeasurement(db, dir).status).toBe("recorded");
  });

  it("does not record a missing count, and reports a broken file", () => {
    write({ measuredAt: "2026-09-28T06:30:00.000Z" });
    expect(ingestAlgoraSupplyMeasurement(db, dir)).toMatchObject({ status: "recorded", recorded: [] });
    expect(latestKpis(db, "oss-bounties").claimableBounties).toBeUndefined();
    write("{nope");
    expect(ingestAlgoraSupplyMeasurement(db, dir).status).toBe("invalid");
  });
});

describe("the tick reads measurement files into KPIs", () => {
  it("waits, without a blocker, when the line is not seeded yet — and records on the next tick", async () => {
    const { tick } = await import("../../revenue/runner.js");
    const db = createInMemoryDb();
    const dir = mkdtempSync(join(tmpdir(), "measurements-fresh-"));
    try {
      writeFileSync(join(dir, "apify-runs.json"), JSON.stringify({ measuredAt: "2026-10-01T06:00:00.000Z", users: { strangerUsers30d: 4 } }));
      expect(ingestApifyMeasurement(db, dir).status).toBe("absent");
      const first = await tick(db, { nowIso: "2026-10-01T07:00:00.000Z", measurementsDir: dir, env: {} });
      expect(first.blockers.join(" ")).not.toMatch(/measurement/);
      seedDefaultPortfolio(db);
      expect(ingestApifyMeasurement(db, dir).status).toBe("recorded");
    } finally {
      db.close();
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it("records the Apify measurement during the hourly ledger sync", async () => {
    const { tick } = await import("../../revenue/runner.js");
    const db = createInMemoryDb();
    const dir = mkdtempSync(join(tmpdir(), "measurements-tick-"));
    try {
      writeFileSync(join(dir, "apify-runs.json"), JSON.stringify({ measuredAt: "2026-10-01T06:00:00.000Z", users: { strangerUsers30d: 12 } }));
      seedDefaultPortfolio(db); // production's colony.db already holds the lines
      const result = await tick(db, { nowIso: "2026-10-01T07:00:00.000Z", measurementsDir: dir, env: {} });
      // Apify recorded; no Algora supply file yet, which is not a blocker.
      expect(result.measurements.map((m) => m.status)).toEqual(["recorded", "absent"]);
      expect(latestKpis(db, "apify-actors").strangerUsers30d.value).toBe(12);
      expect(result.blockers.join(" ")).not.toMatch(/algora-supply/);
    } finally {
      db.close();
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it("records the Algora supply reading beside the Apify one, and names a broken file as a blocker", async () => {
    const { tick } = await import("../../revenue/runner.js");
    const db = createInMemoryDb();
    const dir = mkdtempSync(join(tmpdir(), "measurements-tick-supply-"));
    try {
      writeFileSync(join(dir, "algora-supply.json"), JSON.stringify({ measuredAt: "2026-09-28T06:30:00.000Z", claimableBounties: 5 }));
      seedDefaultPortfolio(db);
      const result = await tick(db, { nowIso: "2026-10-01T07:00:00.000Z", measurementsDir: dir, env: {} });
      expect(result.measurements.map((m) => m.status)).toEqual(["absent", "recorded"]);
      expect(latestKpis(db, "oss-bounties").claimableBounties.value).toBe(5);

      writeFileSync(join(dir, "algora-supply.json"), "{broken");
      const next = await tick(db, { nowIso: "2026-10-01T09:00:00.000Z", measurementsDir: dir, env: {} });
      expect(next.blockers.join(" ")).toMatch(/algora-supply\.json: not JSON/);
    } finally {
      db.close();
      rmSync(dir, { recursive: true, force: true });
    }
  });
});
