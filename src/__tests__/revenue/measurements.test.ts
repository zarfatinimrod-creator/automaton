import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import type BetterSqlite3 from "better-sqlite3";
import { createInMemoryDb } from "../orchestration/test-db.js";
import { ingestApifyMeasurement } from "../../revenue/measurements.js";
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
      expect(result.measurements.map((m) => m.status)).toEqual(["recorded"]);
      expect(latestKpis(db, "apify-actors").strangerUsers30d.value).toBe(12);
    } finally {
      db.close();
      rmSync(dir, { recursive: true, force: true });
    }
  });
});
