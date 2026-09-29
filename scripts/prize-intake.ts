#!/usr/bin/env -S node --import tsx
/**
 * The AI-allowed prize-event intake (logs/CHANNEL_LOOP.md §4 row 13) — an INSTRUMENT ONLY: one GET of the mlcontests
 * list, numbers written to state/colony/prize-intake.json. It files nothing, opens no account and spends nothing.
 *
 *   pnpm exec tsx scripts/prize-intake.ts
 *   pnpm exec tsx scripts/prize-intake.ts --out /tmp/prize-intake.json
 *
 * Exit 0 only when the file was written. On an HTTP error, a redirect, or a body that is not the list, NOTHING is
 * written and the exit code is 1: a week that could not be read is a missing reading, never a zero. The list carries
 * no field stating whether AI or automated solutions are allowed, so that count is written as null, never inferred
 * (src/revenue/prize-intake.ts).
 */
import { writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { parseArgs } from "node:util";
import { PRIZE_INTAKE_FILE, runPrizeIntake } from "../src/revenue/prize-intake.js";

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
  const { values } = parseArgs({ args: argv, options: { out: { type: "string" } }, allowPositionals: false });
  const result = await runPrizeIntake({ outFile: resolve(values.out ?? resolve(REPO_ROOT, PRIZE_INTAKE_FILE)) });
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
