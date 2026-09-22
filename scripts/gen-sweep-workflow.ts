#!/usr/bin/env -S node --import tsx
/**
 * Generate workflows/colony-criteria-sweep.js from the criteria registry.
 *
 *   pnpm exec tsx scripts/gen-sweep-workflow.ts          # write
 *   pnpm exec tsx scripts/gen-sweep-workflow.ts --check  # fail if stale
 *
 * A Workflow script cannot import anything, so the criteria have to be inlined
 * into it. This keeps the inlined copy honest: src/revenue/criteria.ts stays
 * the single source of truth, and a stale generated file is a failing check
 * rather than a search space that quietly stopped matching the registry.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { renderSweepWorkflow, SWEEP_WORKFLOW_PATH } from "../src/revenue/sweep-workflow.js";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const target = path.join(repoRoot, SWEEP_WORKFLOW_PATH);
const rendered = renderSweepWorkflow();
const check = process.argv.includes("--check");

const current = fs.existsSync(target) ? fs.readFileSync(target, "utf-8") : null;

if (check) {
  if (current === rendered) {
    console.log(`${SWEEP_WORKFLOW_PATH} is up to date.`);
    process.exit(0);
  }
  console.error(
    current === null
      ? `${SWEEP_WORKFLOW_PATH} is missing. Run: pnpm exec tsx scripts/gen-sweep-workflow.ts`
      : `${SWEEP_WORKFLOW_PATH} is stale. Run: pnpm exec tsx scripts/gen-sweep-workflow.ts`,
  );
  process.exit(1);
}

fs.mkdirSync(path.dirname(target), { recursive: true });
fs.writeFileSync(target, rendered);
console.log(
  current === rendered
    ? `${SWEEP_WORKFLOW_PATH} unchanged.`
    : `${SWEEP_WORKFLOW_PATH} written (${rendered.split("\n").length} lines).`,
);
