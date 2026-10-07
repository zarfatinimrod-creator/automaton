import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { parse } from "yaml";

const repoRoot = path.resolve(__dirname, "../../..");
const cliSource = fs.readFileSync(path.join(repoRoot, "scripts/colony.ts"), "utf-8");
const workflow = fs.readFileSync(path.join(repoRoot, ".github/workflows/colony.yml"), "utf-8");

/** Option names declared in the CLI's parseArgs block. */
function declaredOptions(): Set<string> {
  const block = cliSource.slice(cliSource.indexOf("options: {"), cliSource.indexOf("const command ="));
  return new Set([...block.matchAll(/^\s+"?([a-z][\w-]*)"?:\s*\{\s*type:/gm)].map((m) => m[1]));
}

/** Flags the scheduled workflow actually passes to the CLI. */
function flagsUsedByWorkflow(): string[] {
  const lines = workflow.split("\n").filter((l) => l.includes("scripts/colony.ts"));
  expect(lines.length).toBeGreaterThan(0);
  return [...new Set(lines.flatMap((l) => [...l.matchAll(/--([a-z][\w-]*)/g)].map((m) => m[1])))];
}

describe("the scheduled workflow and the CLI agree on flags", () => {
  it("declares every flag the workflow passes", () => {
    // node:util parseArgs has no --no-<flag> negation: it throws
    // ERR_PARSE_ARGS_UNKNOWN_OPTION on an undeclared name. The workflow ran
    // `tick --no-feed` while the CLI declared only `feed`, so the first
    // scheduled run would have died parsing its own arguments — and nothing
    // would have noticed, because nothing else runs this command.
    const declared = declaredOptions();
    expect(declared.size).toBeGreaterThan(5);
    for (const flag of flagsUsedByWorkflow()) {
      expect(declared, `workflow passes --${flag}, which the CLI does not declare`).toContain(flag);
    }
  });

  it("keeps the negative flags the workflow depends on", () => {
    expect(declaredOptions()).toContain("no-feed");
  });

  it("documents in --help every flag the workflow uses", () => {
    const usage = cliSource.slice(cliSource.indexOf("const USAGE ="), cliSource.indexOf("function fail("));
    for (const flag of flagsUsedByWorkflow()) {
      expect(usage, `--${flag} is passed by the workflow but absent from the usage text`).toContain(`--${flag}`);
    }
  });
});

describe("the wave-args helper the sweep depends on", () => {
  const cli = cliSource;

  it("declares --wave-args as a string option", () => {
    expect(cli).toContain('"wave-args": { type: "string" }');
  });

  it("refuses to emit args for a wave with nothing left to sweep", () => {
    // Launching a wave whose every criterion is already swept spends the search
    // budget re-answering answered questions, which is the exact failure
    // args.exclude exists to prevent.
    expect(cli).toContain("is already swept — nothing for a wave to do");
  });

  it("prints the args on stdout and the human summary on stderr", () => {
    // The JSON is meant to be piped or copied into the Workflow tool; mixing the
    // summary into it would make that fail.
    expect(cli).toContain("console.log(JSON.stringify({ groups: wanted, exclude }))");
    expect(cli).toMatch(/console\.error\(`\\n\$\{remaining\} unswept/);
  });
});

// Tick 63 (7.10.2026): the scheduled run ran only `tick --no-feed`, and the tick seeds only an empty database, so a text
// changed in src/revenue/portfolio.ts never reached colony.db, REPORT.md or dashboard.html. The run now applies
// sync-portfolio first, in the same job, so the tick's report prints the new texts and the commit step takes the database.
describe("the scheduled run applies portfolio.ts before its tick", () => {
  type Step = { name?: string; run?: string; if?: string; "continue-on-error"?: unknown };
  const workflowsDir = path.join(repoRoot, ".github/workflows");

  it("runs sync-portfolio in the tick job, after the install, before the tick and the commit, on the tick's database", () => {
    const wf = parse(workflow) as { jobs: Record<string, { steps: Step[] }> };
    expect(Object.keys(wf.jobs)).toEqual(["tick"]);
    const steps = wf.jobs.tick.steps;
    const at = (re: RegExp) => steps.findIndex((s) => re.test(s.run ?? ""));
    const install = at(/^pnpm install --frozen-lockfile/);
    const sync = at(/pnpm exec tsx scripts\/colony\.ts sync-portfolio\n/);
    const tick = at(/pnpm exec tsx scripts\/colony\.ts tick --no-feed/);
    const commit = at(/git add -f state\/colony\n/);
    expect([install, sync, tick, commit].every((i) => i >= 0), JSON.stringify({ install, sync, tick, commit })).toBe(true);
    expect(install).toBeLessThan(sync);
    expect(sync).toBeLessThan(tick);
    expect(tick).toBeLessThan(commit);
    // Every scheduled run, and a failed sync stops the run rather than committing a report from stale texts. The command
    // alone, with no option: no --db, so it writes the default state/colony/colony.db, the file the tick reads and the
    // commit step stages.
    expect(steps[sync].if).toBeUndefined();
    expect(steps[sync]["continue-on-error"]).toBeUndefined();
    expect(steps[sync].run).toBe("set -euo pipefail\npnpm exec tsx scripts/colony.ts sync-portfolio\n");
    expect(steps[tick].run).not.toMatch(/--db/);
  });

  it("is so in every workflow that runs a colony tick", () => {
    // The CLI by its path, or by package.json's `colony` script (tick 63 review: a `pnpm colony tick` escaped the path form).
    const cli = String.raw`(?:scripts/colony\.ts|(?:pnpm|npm) (?:run )?colony(?: --)?)`;
    const TICK = new RegExp(`${cli} tick\\b`);
    const SYNC = new RegExp(`${cli} sync-portfolio\\b`);
    for (const l of ["pnpm exec tsx scripts/colony.ts tick --no-feed", "pnpm colony tick", "pnpm run colony -- tick", "npm run colony tick"]) {
      expect(TICK.test(l), l).toBe(true);
    }
    expect(SYNC.test("pnpm colony sync-portfolio")).toBe(true);
    expect(TICK.test("pnpm exec tsx scripts/colony.ts sync-portfolio")).toBe(false);
    const ticking = fs.readdirSync(workflowsDir).filter((f) => /\.ya?ml$/.test(f)).filter((f) => {
      const runs = fs.readFileSync(path.join(workflowsDir, f), "utf-8").split("\n").filter((l) => !/^\s*#/.test(l));
      return runs.some((l) => TICK.test(l));
    });
    expect(ticking).toEqual(["colony.yml"]);
    for (const f of ticking) {
      const lines = fs.readFileSync(path.join(workflowsDir, f), "utf-8").split("\n").filter((l) => !/^\s*#/.test(l));
      const sync = lines.findIndex((l) => SYNC.test(l));
      const tick = lines.findIndex((l) => TICK.test(l));
      expect(sync, `${f} runs a tick without sync-portfolio before it`).toBeGreaterThan(-1);
      expect(sync).toBeLessThan(tick);
    }
  });
});
