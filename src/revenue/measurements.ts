/**
 * Revenue Colony — measurement files → KPI snapshots.
 *
 * Measurement jobs (`apify-publish.yml` count-runs, `algora-supply.yml`) write small JSON files under
 * `state/colony/measurements/` and commit them; they do not open `colony.db`, because the hourly tick commits that
 * binary file too and two writers would race over it. The tick reads the files here and records their numbers
 * through `recordKpi`, which is where the lines' kill and scale criteria look.
 *
 * Each measurement is recorded once: the file's own `measuredAt` is remembered in kv, and a file whose
 * `measuredAt` is not newer is skipped. A missing file is the normal state before a job has run and is not a
 * blocker. A number the file does not carry is not recorded — unknown is not zero.
 */

import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import type { Database } from "better-sqlite3";
import { getLine, recordKpi } from "./ledger.js";

export const DEFAULT_MEASUREMENTS_DIR = join("state", "colony", "measurements");

const kvGet = (db: Database, key: string): string | null =>
  (db.prepare("SELECT value FROM kv WHERE key = ?").get(key) as { value: string } | undefined)?.value ?? null;
const kvSet = (db: Database, key: string, value: string): void => {
  db.prepare("INSERT OR REPLACE INTO kv (key, value, updated_at) VALUES (?, ?, datetime('now'))").run(key, value);
};

export interface IngestResult {
  file: string;
  status: "absent" | "unchanged" | "recorded" | "invalid";
  recorded: string[];
  detail?: string;
}

const isCount = (v: unknown): v is number => typeof v === "number" && Number.isFinite(v);

/** The file half of every ingest, reading the file only: absent, invalid with why, or its data and its `measuredAt`. */
function readMeasurementFile<T extends { measuredAt?: unknown }>(
  file: string,
): { status: "absent" } | { status: "invalid"; detail: string } | { status: "read"; data: T; measuredAt: string } {
  if (!existsSync(file)) return { status: "absent" };
  let data: T;
  try {
    data = JSON.parse(readFileSync(file, "utf8"));
  } catch (error) {
    return { status: "invalid", detail: `not JSON: ${error instanceof Error ? error.message : String(error)}` };
  }
  const measuredAt = typeof data?.measuredAt === "string" && !Number.isNaN(Date.parse(data.measuredAt)) ? data.measuredAt : null;
  if (!measuredAt) return { status: "invalid", detail: "no usable measuredAt" };
  return { status: "read", data, measuredAt };
}

/** The files the tick ingests, in its order: `apify-runs.json` (ingestApifyMeasurement), `algora-supply.json` (ingestAlgoraSupplyMeasurement). */
export const MEASUREMENT_FILES = ["apify-runs.json", "algora-supply.json"] as const;

/**
 * A render's measurement check (runner.ts readOnly, `colony.ts report`; tick 64): each file the tick ingests, read as the
 * ingest reads it and recorded nowhere. Only the invalid ones are returned, with the ingest's own detail: an invalid
 * file is the one reading that is a tick's blocker ("measurement <file>: <detail>").
 */
export function invalidMeasurementFiles(dir: string = DEFAULT_MEASUREMENTS_DIR): IngestResult[] {
  return MEASUREMENT_FILES.flatMap((name) => {
    const file = join(dir, name);
    const read = readMeasurementFile(file);
    return read.status === "invalid" ? [{ file, status: "invalid" as const, recorded: [], detail: read.detail }] : [];
  });
}

/**
 * The shared half of every ingest: read the file, check `measuredAt`, wait for the line to be seeded, record once.
 * `record` returns the KPI names it wrote; it is called only for a measurement newer than the last one recorded.
 */
function ingestFile<T extends { measuredAt?: unknown }>(
  db: Database,
  file: string,
  lineId: string,
  kvKey: string,
  record: (data: T) => string[],
): IngestResult {
  const out: IngestResult = { file, status: "absent", recorded: [] };
  const read = readMeasurementFile<T>(file);
  if (read.status !== "read") return { ...out, ...read };
  const { data, measuredAt } = read;
  // Before the portfolio is seeded (a fresh database's first tick) the line does not exist yet. Nothing is marked as
  // ingested, so the next tick records it; this is not a broken file and not a blocker.
  if (!getLine(db, lineId)) return { ...out, status: "absent", detail: `revenue line ${lineId} not seeded yet; retried next tick` };

  const last = kvGet(db, kvKey);
  if (last && Date.parse(last) >= Date.parse(measuredAt)) return { ...out, status: "unchanged" };

  out.recorded.push(...record(data));
  kvSet(db, kvKey, measuredAt);
  return { ...out, status: "recorded" };
}

/** The Apify count-runs measurement (scripts/apify-runs.mjs) → the `apify-actors` line's KPIs. */
export function ingestApifyMeasurement(db: Database, dir: string = DEFAULT_MEASUREMENTS_DIR, lineId = "apify-actors"): IngestResult {
  type Apify = { measuredAt?: unknown; users?: { strangerUsers30d?: unknown }; strangerRunsLast30Days?: unknown };
  return ingestFile<Apify>(db, join(dir, MEASUREMENT_FILES[0]), lineId, "revenue.measurement.apify.measured_at", (data) => {
    const recorded: string[] = [];
    const users = data.users?.strangerUsers30d;
    if (isCount(users)) {
      recordKpi(db, lineId, "strangerUsers30d", users, "users");
      recorded.push("strangerUsers30d");
    }
    // The runs-list stranger count is our token's view and its scope is unverified; its unit says so, and the board's
    // thresholds read strangerUsers30d, never this.
    const runs = data.strangerRunsLast30Days;
    if (isCount(runs)) {
      recordKpi(db, lineId, "strangerRuns30d", runs, "runs, our token's view (scope unverified)");
      recorded.push("strangerRuns30d");
    }
    return recorded;
  });
}

/**
 * The weekly Algora supply count (scripts/algora-supply.ts, BOARD-2 §2.2) → `claimableBounties` on `oss-bounties`.
 *
 * The job writes nothing when it cannot measure, so a file here is always a real reading — including a real 0. The
 * week-4 thresholds read the series of these snapshots (one per weekly `measuredAt`); the file also carries the series
 * itself (`history`), so the reading survives a rebuilt database.
 */
export function ingestAlgoraSupplyMeasurement(db: Database, dir: string = DEFAULT_MEASUREMENTS_DIR, lineId = "oss-bounties"): IngestResult {
  type Supply = { measuredAt?: unknown; claimableBounties?: unknown; struck?: unknown };
  let struck = false;
  const file = join(dir, MEASUREMENT_FILES[1]);
  const result = ingestFile<Supply>(db, file, lineId, SUPPLY_MEASURED_AT_KEY, (data) => {
    // A file whose own reading was struck as an instrument fault (RULING-2026-09-28-bounty-rail.md §3.4) carries a count
    // that is not a reading: it is recorded in the file's instrumentFaults and never becomes a KPI.
    if (data.struck === true) {
      struck = true;
      return [];
    }
    if (!isCount(data.claimableBounties)) return [];
    recordKpi(db, lineId, "claimableBounties", data.claimableBounties, "claimable bounties (open, labelled, unarchived, unrewarded, ≥ $50, policy not forbidden, not not-a-payer)");
    return ["claimableBounties"];
  });
  if (struck) return { ...result, detail: "this file's reading is struck as an instrument fault; nothing recorded" };
  const moved = strikeIngestedFaults(db, file, lineId);
  return moved.length
    ? { ...result, detail: `moved the struck reading${moved.length === 1 ? "" : "s"} ${moved.join(", ")} out of claimableBounties into ${STRUCK_SUPPLY_KPI}` }
    : result;
}

const SUPPLY_MEASURED_AT_KEY = "revenue.measurement.algora_supply.measured_at";

/**
 * Where a supply reading goes when the file strikes it AFTER the tick already recorded it: kept in the database under
 * its own name — recorded, never averaged (BOARD-LOOP KILL-1) — and no longer served by `latestKpis` as the current
 * `claimableBounties`. RULING-2026-09-28-bounty-rail.md §3.4; review of 28.9.2026, finding 8.
 */
export const STRUCK_SUPPLY_KPI = "claimableBountiesStruck";

/**
 * The file was struck in place (same `measuredAt`), so the ingest above reads it as `unchanged` and never looks at it
 * again. When the last reading this database ingested is one the file now lists under `instrumentFaults`, every
 * `claimableBounties` snapshot recorded since that reading came from it (a snapshot is written only when `measuredAt`
 * advances); those are renamed to `STRUCK_SUPPLY_KPI`. If a corrected reading was ingested first, `latestKpis` already
 * serves it and nothing is renamed. Idempotent: a renamed snapshot no longer matches. Returns "week (count)" per fault
 * that moved at least one snapshot.
 */
function strikeIngestedFaults(db: Database, file: string, lineId: string): string[] {
  const last = kvGet(db, SUPPLY_MEASURED_AT_KEY);
  if (!last || !existsSync(file)) return [];
  let faults: unknown;
  try {
    faults = (JSON.parse(readFileSync(file, "utf8")) as { instrumentFaults?: unknown })?.instrumentFaults;
  } catch {
    return []; // an unreadable file is reported by the ingest itself
  }
  if (!Array.isArray(faults)) return [];
  const moved: string[] = [];
  for (const f of faults as Array<{ week?: unknown; measuredAt?: unknown; claimable?: unknown }>) {
    if (f?.measuredAt !== last || !isCount(f.claimable)) continue;
    const week = typeof f.week === "string" ? f.week : f.measuredAt;
    const changes = db
      .prepare(
        `UPDATE revenue_kpi_snapshots SET kpi = ?, unit = ?
         WHERE line_id = ? AND kpi = 'claimableBounties' AND captured_at >= ? AND value = ?`,
      )
      .run(STRUCK_SUPPLY_KPI, `struck as an instrument fault (${week}): not a reading, never averaged`, lineId, last, f.claimable).changes;
    if (changes > 0) moved.push(`${week} (${f.claimable})`);
  }
  return moved;
}
