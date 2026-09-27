/**
 * Revenue Colony — measurement files → KPI snapshots.
 *
 * Measurement jobs (e.g. `apify-publish.yml` count-runs) write small JSON files under
 * `state/colony/measurements/` and commit them; they do not open `colony.db`, because the hourly tick commits that
 * binary file too and two writers would race over it. The tick reads the files here and records their numbers
 * through `recordKpi`, which is where the lines' kill and scale criteria look.
 *
 * Each measurement is recorded once: the file's own `measuredAt` is remembered in kv, and a file whose
 * `measuredAt` is not newer is skipped. A missing file is the normal state before a token exists and is not a
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

/** The Apify count-runs measurement (scripts/apify-runs.mjs) → the `apify-actors` line's KPIs. */
export function ingestApifyMeasurement(db: Database, dir: string = DEFAULT_MEASUREMENTS_DIR, lineId = "apify-actors"): IngestResult {
  const file = join(dir, "apify-runs.json");
  const out: IngestResult = { file, status: "absent", recorded: [] };
  if (!existsSync(file)) return out;

  let data: { measuredAt?: unknown; users?: { strangerUsers30d?: unknown }; strangerRunsLast30Days?: unknown };
  try {
    data = JSON.parse(readFileSync(file, "utf8"));
  } catch (error) {
    return { ...out, status: "invalid", detail: `not JSON: ${error instanceof Error ? error.message : String(error)}` };
  }
  const measuredAt = typeof data.measuredAt === "string" && !Number.isNaN(Date.parse(data.measuredAt)) ? data.measuredAt : null;
  if (!measuredAt) return { ...out, status: "invalid", detail: "no usable measuredAt" };
  // Before the portfolio is seeded (a fresh database's first tick) the line does not exist yet. Nothing is marked as
  // ingested, so the next tick records it; this is not a broken file and not a blocker.
  if (!getLine(db, lineId)) return { ...out, status: "absent", detail: `revenue line ${lineId} not seeded yet; retried next tick` };

  const key = `revenue.measurement.apify.measured_at`;
  const last = kvGet(db, key);
  if (last && Date.parse(last) >= Date.parse(measuredAt)) return { ...out, status: "unchanged" };

  const users = data.users?.strangerUsers30d;
  if (typeof users === "number" && Number.isFinite(users)) {
    recordKpi(db, lineId, "strangerUsers30d", users, "users");
    out.recorded.push("strangerUsers30d");
  }
  // The runs-list stranger count is our token's view and its scope is unverified; its unit says so, and the board's
  // thresholds read strangerUsers30d, never this.
  const runs = data.strangerRunsLast30Days;
  if (typeof runs === "number" && Number.isFinite(runs)) {
    recordKpi(db, lineId, "strangerRuns30d", runs, "runs, our token's view (scope unverified)");
    out.recorded.push("strangerRuns30d");
  }
  kvSet(db, key, measuredAt);
  return { ...out, status: "recorded" };
}
