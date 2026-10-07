#!/usr/bin/env -S node --import tsx
/**
 * The facts of the owner's status report — money, revenue lines, owner steps, colony health — from the colony database
 * and the code alone (src/revenue/owner-report.ts), so the next report starts from one command instead of ten agents.
 *
 *   pnpm exec tsx scripts/owner-report.ts [--db <path>] [--json] [--now <iso>]
 *
 * --db defaults to state/colony/colony.db in this checkout. The database is opened read-only and must exist; nothing is
 * written to it (SQLite may create the gitignored -wal and -shm files beside a WAL-mode database it reads). Ledger rows
 * are read out as counts and sums only: never an external id, a note or a source. --json prints the same facts as one
 * object. --now overrides the clock (testing). Exit 0 on a report, 1 on an error, 2 on bad arguments.
 */
import { existsSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { parseArgs } from "node:util";
import Database from "better-sqlite3";
import { buildOwnerReport, gateSite, renderOwnerReport } from "../src/revenue/owner-report.js";

const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const DEFAULT_DB = join(REPO_ROOT, "state", "colony", "colony.db");
const SITE_DIR = join(REPO_ROOT, "products", "il-biz-tools");

export function main(argv: string[]): number {
  let values: { db?: string; json?: boolean; now?: string };
  try {
    ({ values } = parseArgs({
      args: argv,
      options: { db: { type: "string" }, json: { type: "boolean", default: false }, now: { type: "string" } },
    }));
  } catch (err) {
    console.error(`owner-report: ${(err as Error).message}`);
    console.error("usage: pnpm exec tsx scripts/owner-report.ts [--db <path>] [--json] [--now <iso>]");
    return 2;
  }
  const dbPath = values.db ? resolve(values.db) : DEFAULT_DB;
  if (!existsSync(dbPath)) {
    console.error(`owner-report: no database at ${dbPath}`);
    return 1;
  }
  let db: Database.Database | undefined;
  try {
    db = new Database(dbPath, { readonly: true, fileMustExist: true });
    const report = buildOwnerReport(db, { nowIso: values.now, site: gateSite(SITE_DIR) });
    process.stdout.write(values.json ? JSON.stringify(report, null, 2) + "\n" : renderOwnerReport(report));
    return 0;
  } catch (err) {
    console.error(`owner-report: ${(err as Error).message}`);
    return 1;
  } finally {
    db?.close();
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  process.exit(main(process.argv.slice(2)));
}
