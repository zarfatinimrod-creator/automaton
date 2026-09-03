#!/usr/bin/env -S node --import tsx
/**
 * Revenue colony — standalone CLI.
 *
 *   pnpm exec tsx scripts/colony.ts tick
 *   pnpm exec tsx scripts/colony.ts status
 *   pnpm exec tsx scripts/colony.ts record --line paid-apis --kind sale --amount 200 --currency USD --source x402 --external-id 0xabc
 *   pnpm exec tsx scripts/colony.ts setup-done apify-actors --evidence "owner confirmed 2026-09-03"
 *
 * The governance half of the colony needs only a SQLite file: no wallet, no
 * Conway key, no inference. This is what the scheduled workflow runs, and what
 * the owner can run locally to see the board's reasoning.
 */

import fs from "node:fs";
import path from "node:path";
import { parseArgs } from "node:util";
import { createDatabase } from "../src/state/database.js";
import {
  getLine,
  listLines,
  recordLedgerEntry,
  setHumanSetupDone,
  setTargets,
  updateLineStatus,
} from "../src/revenue/ledger.js";
import { agorotFromIls, formatIls } from "../src/revenue/money.js";
import { seedDefaultPortfolio } from "../src/revenue/portfolio.js";
import { getRevenueStatus } from "../src/revenue/status.js";
import { renderCommitSummary, renderReport, tick, type TickResult } from "../src/revenue/runner.js";
import { enqueueGoal } from "../src/revenue/goal-queue.js";
import {
  ALL_CRITERIA,
  CRITERIA_GROUPS,
  criteriaDueForSweep,
  criterionById,
  markSupervised,
  markSwept,
  readLastSwept,
  sweepCoverage,
} from "../src/revenue/criteria.js";
import type { LedgerKind } from "../src/revenue/types.js";

const DEFAULT_DB = "state/colony/colony.db";
const DEFAULT_REPORT = "state/colony/REPORT.md";

const USAGE = `colony — the revenue colony's governance loop

Usage: pnpm exec tsx scripts/colony.ts <command> [options]

Commands:
  tick                 Run one cycle: ledger sync, supervisor review, board review, audit.
                       Each step runs only when its own interval says it is due.
  status               Print the portfolio status block.
  report               Re-render the report from current state without ticking.
  seed                 Seed the default portfolio (no-op for lines that exist).
  record               Record one ledger entry by hand.
  setup-done <lineId>  Mark a line's one-time owner setup as done and queue its build goal.
  target               Set the monthly target (and optional stretch target) in shekels.
  criteria             Show the search criteria and how much of the space is covered.

Common options:
  --db <path>          SQLite file (default ${DEFAULT_DB})
  --report <path>      Report file written by tick/report (default ${DEFAULT_REPORT})
  --json               Print machine-readable JSON instead of prose

tick options:
  --force              Ignore interval gating and run every step
  --no-feed            Do not file a goal (use when no orchestrator can execute one)
  --no-seed            Do not seed the portfolio even if the colony is empty
  --now <iso>          Override the clock (testing)

record options:
  --line <id>          Revenue line id                                  (required)
  --kind <kind>        sale | subscription | payout | refund | cost     (required)
  --amount <n>         Amount in MINOR units: 1990 = $19.90             (required)
  --currency <code>    ILS | USD | USDC | EUR | GBP                     (required)
  --source <name>      stripe | lemonsqueezy | gumroad | x402 | manual  (required)
  --external-id <id>   Platform transaction id — makes the entry idempotent
  --note <text>        Free text
  --occurred-at <iso>  Defaults to now

setup-done options:
  --evidence <text>    Where and when the owner confirmed                (required)
  --undo               Mark setup as NOT done and park the line again

target options:
  --ils <n>            Monthly target in shekels                         (required)
  --stretch <n>        Stretch target in shekels

criteria options:
  --due                List only the criteria due for a fresh search
  --group <id>         Restrict to one criterion group
  --briefs             Print each criterion's full search brief
  --mark <id>          Record a criterion as swept now (id, or a group id for all of it)
  --supervised <id>    Record that a group's supervisor filed its report
`;

function fail(message: string): never {
  console.error(`Error: ${message}`);
  process.exit(1);
}

function openDb(dbPath: string) {
  const resolved = path.resolve(dbPath);
  fs.mkdirSync(path.dirname(resolved), { recursive: true });
  return createDatabase(resolved);
}

function writeReport(reportPath: string, body: string): void {
  const resolved = path.resolve(reportPath);
  fs.mkdirSync(path.dirname(resolved), { recursive: true });
  fs.writeFileSync(resolved, body);
}

function num(value: string | undefined, name: string): number {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) fail(`--${name} must be a number`);
  return parsed;
}

async function main(): Promise<void> {
  const { values, positionals } = parseArgs({
    args: process.argv.slice(2),
    allowPositionals: true,
    options: {
      db: { type: "string", default: DEFAULT_DB },
      report: { type: "string", default: DEFAULT_REPORT },
      json: { type: "boolean", default: false },
      force: { type: "boolean", default: false },
      feed: { type: "boolean", default: true },
      seed: { type: "boolean", default: true },
      now: { type: "string" },
      line: { type: "string" },
      kind: { type: "string" },
      amount: { type: "string" },
      currency: { type: "string" },
      source: { type: "string" },
      "external-id": { type: "string" },
      note: { type: "string" },
      "occurred-at": { type: "string" },
      evidence: { type: "string" },
      undo: { type: "boolean", default: false },
      ils: { type: "string" },
      stretch: { type: "string" },
      due: { type: "boolean", default: false },
      group: { type: "string" },
      briefs: { type: "boolean", default: false },
      mark: { type: "string" },
      supervised: { type: "string" },
      help: { type: "boolean", default: false },
    },
  });

  const command = positionals[0];
  if (!command || values.help) {
    console.log(USAGE);
    return;
  }

  const db = openDb(values.db!);
  try {
    switch (command) {
      case "tick": {
        const result: TickResult = await tick(db.raw, {
          nowIso: values.now,
          force: values.force,
          feedGoals: values.feed,
          seed: values.seed,
        });
        writeReport(values.report!, renderReport(db.raw, result));
        if (values.json) {
          console.log(JSON.stringify(result, null, 2));
        } else {
          console.log(renderCommitSummary(result));
          if (result.ran.length) console.log(`Ran: ${result.ran.join(", ")}`);
          if (result.skipped.length) console.log(`Not due: ${result.skipped.join(", ")}`);
          for (const blocker of result.blockers) console.log(`Blocked: ${blocker}`);
          console.log(`Report written to ${values.report}`);
        }
        break;
      }

      case "status": {
        const status = getRevenueStatus(db.raw, { maxLines: 40 });
        console.log(status || "Revenue colony has no data yet. Run `tick` to seed it.");
        break;
      }

      case "report": {
        const result = await tick(db.raw, { nowIso: values.now, force: false, feedGoals: false, seed: false });
        // A report-only run must not consume the intervals it just checked.
        writeReport(values.report!, renderReport(db.raw, result));
        console.log(`Report written to ${values.report}`);
        break;
      }

      case "seed": {
        const inserted = seedDefaultPortfolio(db.raw);
        console.log(inserted > 0 ? `Seeded ${inserted} revenue line(s).` : "Portfolio already seeded; nothing added.");
        for (const line of listLines(db.raw)) {
          console.log(`  ${line.id} [${line.tier}/${line.status}] target ${formatIls(line.targetMonthlyAgorot)}`);
        }
        break;
      }

      case "record": {
        const lineId = values.line ?? fail("--line is required");
        const kind = (values.kind ?? fail("--kind is required")) as LedgerKind;
        const amount = num(values.amount, "amount");
        if (!Number.isInteger(amount) || amount === 0) fail("--amount must be a non-zero integer in minor units");
        const currency = values.currency ?? fail("--currency is required");
        const source = values.source ?? fail("--source is required");
        if (!getLine(db.raw, lineId)) fail(`no revenue line "${lineId}"`);

        const entry = recordLedgerEntry(db.raw, {
          lineId,
          kind,
          amountMinor: amount,
          currency,
          source,
          externalId: values["external-id"] ?? null,
          occurredAt: values["occurred-at"],
          note: values.note ?? null,
        });
        if (!entry) {
          console.log(`Already recorded: ${source}/${values["external-id"]}. Nothing changed.`);
        } else {
          console.log(`Recorded ${entry.kind} ${formatIls(entry.amountAgorot)} on ${entry.lineId} via ${entry.source}.`);
          const line = getLine(db.raw, lineId)!;
          console.log(`  ${line.id} is now ${line.status}.`);
        }
        break;
      }

      case "setup-done": {
        const lineId = positionals[1] ?? values.line ?? fail("pass the line id: colony setup-done <lineId>");
        const line = getLine(db.raw, lineId) ?? fail(`no revenue line "${lineId}"`);
        if (values.undo) {
          setHumanSetupDone(db.raw, lineId, false);
          if (line.status !== "killed" && line.status !== "awaiting_setup") {
            updateLineStatus(db.raw, lineId, "awaiting_setup", { force: true });
          }
          console.log(`${lineId}: setup marked incomplete; line parked in awaiting_setup.`);
          break;
        }
        const evidence = values.evidence
          ?? fail("--evidence is required: say where and when the owner confirmed the setup");
        setHumanSetupDone(db.raw, lineId, true);
        if (line.status === "awaiting_setup") updateLineStatus(db.raw, lineId, "proposed");
        const queued = enqueueGoal(db.raw, { lineId, phase: "build", extra: `owner setup confirmed: ${evidence}` });
        console.log(`${lineId}: setup confirmed (${evidence}).`);
        console.log(queued ? "Build goal queued." : "A goal for this line was already queued or active.");
        break;
      }

      case "target": {
        const ils = num(values.ils, "ils");
        const stretch = values.stretch === undefined ? undefined : num(values.stretch, "stretch");
        setTargets(db.raw, agorotFromIls(ils), stretch === undefined ? undefined : agorotFromIls(stretch));
        console.log(`Target set to ${formatIls(agorotFromIls(ils))}/month${stretch !== undefined ? `, stretch ${formatIls(agorotFromIls(stretch))}` : ""}.`);
        break;
      }

      case "criteria": {
        const nowMs = values.now ? Date.parse(values.now) : Date.now();
        if (!Number.isFinite(nowMs)) fail("--now must be an ISO timestamp");

        if (values.mark) {
          const atIso = new Date(nowMs).toISOString();
          const group = CRITERIA_GROUPS.find((g) => g.id === values.mark);
          const targets = group ? group.criteria : [criterionById(values.mark) ?? fail(`no criterion or group "${values.mark}"`)];
          for (const c of targets) markSwept(db.raw, c.id, atIso);
          console.log(`Marked ${targets.length} criteri${targets.length === 1 ? "on" : "a"} swept at ${atIso}.`);
          break;
        }
        if (values.supervised) {
          const group = CRITERIA_GROUPS.find((g) => g.id === values.supervised)
            ?? fail(`no criterion group "${values.supervised}"`);
          markSupervised(db.raw, group.id, new Date(nowMs).toISOString());
          console.log(`Group "${group.id}" marked supervised at ${new Date(nowMs).toISOString()}.`);
          break;
        }

        const coverage = sweepCoverage(db.raw, nowMs);
        const dueIds = new Set(criteriaDueForSweep(readLastSwept(db.raw), nowMs).map((c) => c.id));
        const groups = values.group
          ? [CRITERIA_GROUPS.find((g) => g.id === values.group) ?? fail(`no criterion group "${values.group}"`)]
          : CRITERIA_GROUPS;

        if (values.json) {
          console.log(JSON.stringify({ totalCriteria: ALL_CRITERIA.length, due: dueIds.size, coverage }, null, 2));
          break;
        }

        console.log(`Search space: ${ALL_CRITERIA.length} criteria in ${CRITERIA_GROUPS.length} groups, one scout each, one supervisor per group.`);
        console.log(`Due for a fresh search: ${dueIds.size}.\n`);
        for (const g of groups) {
          const cov = coverage.find((c) => c.groupId === g.id)!;
          const supervised = cov.lastSupervisedIso ? `supervised ${cov.lastSupervisedIso.slice(0, 10)}` : "never supervised";
          console.log(`## ${g.id} — ${g.title}`);
          console.log(`   ${cov.swept}/${cov.total} swept, ${cov.due} due, ${supervised}`);
          for (const c of g.criteria) {
            const isDue = dueIds.has(c.id);
            if (values.due && !isDue) continue;
            console.log(`   ${isDue ? "[ ]" : "[x]"} ${c.id}`);
            if (values.briefs) console.log(`       ${c.brief}`);
          }
          console.log("");
        }
        break;
      }

      default:
        console.log(USAGE);
        fail(`unknown command "${command}"`);
    }
  } finally {
    db.close();
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.stack ?? error.message : String(error));
  process.exit(1);
});
