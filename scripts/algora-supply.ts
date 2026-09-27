#!/usr/bin/env -S node --import tsx
/**
 * Count CLAIMABLE Algora bounties on GitHub and write the weekly reading — research/colony-sweep/BOARD-2.md §2.2,
 * the first build step of the `oss-bounties` line.
 *
 *   pnpm exec tsx scripts/algora-supply.ts
 *   pnpm exec tsx scripts/algora-supply.ts --out-json /tmp/s.json --out-md /tmp/s.md --max-wait-minutes 5
 *
 * Writes `state/colony/measurements/algora-supply.json` (the hourly tick reads it into the KPI `claimableBounties`)
 * and `research/measurements/algora-supply.md` (the human-readable table), both regenerated each run, the weekly
 * series carried forward inside the JSON.
 *
 * Uses GITHUB_TOKEN when present (Actions provides it; no owner secret is involved), otherwise the unauthenticated
 * limits — which a full count will usually exhaust, and then the run stops and says so.
 *
 * Exit 0 only when both files were written. On any API failure, an exhausted rate-limit budget or a partial search,
 * NOTHING is written and the exit code is 1: a week that could not be measured is a missing reading, never a zero.
 * The one gap accepted is GitHub counting issues it never serves — the same ids on two full passes, at most
 * max(5, 1%) of its total — and that gap is written beside the count as `searchUnserved` (supply-github.ts).
 *
 * Requests go to api.github.com only (the client refuses any other host). Algora's own site is never requested:
 * its terms forbid automated access (research/rendered/algora-terms.txt:258-260).
 */
import { writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { parseArgs } from "node:util";
import { DEFAULT_SUPPLY_JSON, DEFAULT_SUPPLY_MD, runAlgoraSupply } from "../src/revenue/bounties/supply-github.js";

const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");

function notice(message: string): void {
  console.log(message);
  const summary = process.env.GITHUB_STEP_SUMMARY;
  if (summary) {
    try {
      writeFileSync(summary, `${message}\n`, { flag: "a" });
    } catch {
      /* a summary we cannot write is not worth failing a measurement over */
    }
  }
}

async function main(argv: string[]): Promise<number> {
  const { values } = parseArgs({
    args: argv,
    options: {
      "out-json": { type: "string" },
      "out-md": { type: "string" },
      "max-wait-minutes": { type: "string" },
    },
    allowPositionals: false,
  });
  const maxWaitMinutes = values["max-wait-minutes"] === undefined ? undefined : Number(values["max-wait-minutes"]);
  if (maxWaitMinutes !== undefined && !(Number.isFinite(maxWaitMinutes) && maxWaitMinutes >= 0)) {
    throw new Error("--max-wait-minutes must be a non-negative number");
  }
  const result = await runAlgoraSupply({
    env: process.env,
    outJson: resolve(values["out-json"] ?? resolve(REPO_ROOT, DEFAULT_SUPPLY_JSON)),
    outMd: resolve(values["out-md"] ?? resolve(REPO_ROOT, DEFAULT_SUPPLY_MD)),
    maxWaitMs: maxWaitMinutes === undefined ? undefined : maxWaitMinutes * 60_000,
    log: (m) => console.error(m),
  });
  notice(result.message);
  return result.code;
}

main(process.argv.slice(2)).then(
  (code) => process.exit(code),
  (error) => {
    console.error(`Algora supply NOT measured: ${error instanceof Error ? error.message : String(error)}. Nothing was written.`);
    process.exit(1);
  },
);
