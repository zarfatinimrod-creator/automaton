#!/usr/bin/env -S node --import tsx
/**
 * The AI-allowed prize-event intake (logs/CHANNEL_LOOP.md §4 row 13) — an INSTRUMENT ONLY: one GET of the mlcontests
 * list, then three files. It files nothing, opens no account, spends nothing and publishes nothing.
 *
 *   pnpm exec tsx scripts/prize-intake.ts
 *   pnpm exec tsx scripts/prize-intake.ts --root /tmp/prize-intake-dry-run
 *
 * The three files, under the repository root (or --root):
 *   - state/colony/prize-intake.json — the list-count numbers, and per quarter the rules-page counts;
 *   - research/measurements/ai-allowed-events.md — the events with deadlines in the current or next calendar quarter,
 *     in a table whose last three cells a reading session fills from rendered rules pages. The job carries those
 *     cells forward by event URL and never fills one (src/revenue/ai-allowed-events.ts);
 *   - research/measurements/ai-allowed-events.urls.txt — the URLs of rows not yet graded, in render-watch's urls
 *     syntax; `node scripts/prize-dispatch.mjs` prints the lines whose site passes the terms gate, for render-watch.yml's
 *     `urls` input (never the whole file). Never appended to research/rendered/urls.txt; tiktok.com URLs are refused.
 *
 * Exit 0 only when all three were written. On a status other than 200, a redirect, a body that is not the list, a
 * list whose deadlines, prizes, launch dates or registration deadlines mostly stopped parsing, or a table the job
 * cannot read back (a session's cells are never overwritten), NOTHING is written and the exit code is 1: a week that
 * could not be read is a missing reading, never a zero.
 */
import { writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { parseArgs } from "node:util";
import { runPrizeIntake } from "../src/revenue/prize-intake.js";

const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");

function notice(message: string): void {
  console.log(message);
  const summary = process.env.GITHUB_STEP_SUMMARY;
  if (summary) {
    try {
      writeFileSync(summary, `${message}\n`, { flag: "a" });
    } catch {
      /* a summary we cannot write is not worth failing a reading over */
    }
  }
}

async function main(argv: string[]): Promise<number> {
  const { values } = parseArgs({ args: argv, options: { root: { type: "string" } }, allowPositionals: false });
  const result = await runPrizeIntake({ root: resolve(values.root ?? REPO_ROOT) });
  notice(result.message);
  return result.code;
}

main(process.argv.slice(2)).then(
  (code) => process.exit(code),
  (error) => {
    console.error(`Prize intake NOT measured: ${error instanceof Error ? error.message : String(error)}. Nothing was written.`);
    process.exit(1);
  },
);
