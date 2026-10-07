import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { spawnSync } from "node:child_process";
import crypto from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import Database from "better-sqlite3";
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

// Tick 64 (7.10.2026): `report` ran the tick with every due step, so a report run by hand ran the overdue ledger sync and
// stamped its time; the next report and the dashboard then said there was no open blocker while the hourly schedule had
// not run for hours. "the loop did not run for N hours" is the only instrument that shows GitHub dropping the schedule.
describe("a command that only renders writes nothing to the database", () => {
  const T0 = "2026-09-03T00:00:00.000Z";
  const plus = (hours: number) => new Date(Date.parse(T0) + hours * 3_600_000).toISOString();
  const LOOP_GAP = "the loop did not run for 7 hours (last ledger sync 2026-09-03T00:00:00.000Z)";
  let dir: string;
  let fixture: string;

  // No connector key reaches the CLI: every connector is skipped and the tick makes no network call.
  const env = { ...process.env };
  for (const k of ["LEMONSQUEEZY_API_KEY", "GUMROAD_ACCESS_TOKEN", "STRIPE_SECRET_KEY", "POSTHOG_READ_KEY", "POSTHOG_PROJECT_ID"]) delete env[k];
  const cli = (db: string, ...args: string[]) => {
    const out = spawnSync(
      process.execPath,
      ["--import", "tsx", "scripts/colony.ts", ...args, "--db", db, "--report", path.join(dir, "REPORT.md"), "--html", path.join(dir, "dashboard.html")],
      { cwd: repoRoot, encoding: "utf-8", env },
    );
    expect(out.status, `${args.join(" ")}: ${out.stderr}`).toBe(0);
    return out.stdout;
  };
  const sha = (file: string) => crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex");
  /** Every row of every table, and the schema. */
  const tables = (file: string): string => {
    const db = new Database(file, { readonly: true, fileMustExist: true });
    try {
      const names = (db.prepare("SELECT name FROM sqlite_master WHERE type = 'table' ORDER BY name").all() as { name: string }[]).map((t) => t.name);
      const rows = names.map((t) => `${t}\t${JSON.stringify(db.prepare(`SELECT * FROM "${t}" ORDER BY rowid`).all())}`);
      return [...rows, JSON.stringify(db.prepare("SELECT type, name, sql FROM sqlite_master ORDER BY name").all())].join("\n");
    } finally {
      db.close();
    }
  };
  const kv = (file: string, key: string) => {
    const db = new Database(file, { readonly: true, fileMustExist: true });
    try {
      return (db.prepare("SELECT value FROM kv WHERE key = ?").get(key) as { value: string } | undefined)?.value;
    } finally {
      db.close();
    }
  };
  const copy = (name: string) => {
    const to = path.join(dir, name);
    fs.copyFileSync(fixture, to);
    return to;
  };
  const read = (name: string) => fs.readFileSync(path.join(dir, name), "utf-8");

  beforeAll(() => {
    dir = fs.mkdtempSync(path.join(os.tmpdir(), "colony-render-only-"));
    fixture = path.join(dir, "fixture.db");
    cli(fixture, "tick", "--no-feed", "--now", T0); // seeds the portfolio and runs every step: the last ledger sync is T0
    expect(kv(fixture, "revenue.last_run.revenue_ledger_sync")).toBe(T0);
  }, 60_000);
  afterAll(() => {
    fs.rmSync(dir, { recursive: true, force: true });
  });

  it("report, 7 hours after the last ledger sync: the database is byte-identical and the report and dashboard say the loop did not run", () => {
    const db = copy("report.db");
    const [bytes, rows] = [sha(db), tables(db)];
    expect(cli(db, "report", "--now", plus(7))).toContain("Report written to");
    expect(sha(db)).toBe(bytes);
    expect(tables(db)).toBe(rows);
    expect(kv(db, "revenue.last_run.revenue_ledger_sync")).toBe(T0);
    const report = read("REPORT.md").split("\n");
    expect(report.some((l) => l.startsWith(`- ${LOOP_GAP}`))).toBe(true);
    expect(report).toContain("Due now, left for the scheduled tick: revenue_ledger_sync, revenue_supervisor_review");
    expect(report).not.toContain("Ran: revenue_ledger_sync, revenue_supervisor_review");
    expect(read("dashboard.html")).toContain(LOOP_GAP);
    // Run again: nothing was stamped, so the blocker is still there.
    cli(db, "report", "--now", plus(8));
    expect(sha(db)).toBe(bytes);
    expect(read("REPORT.md")).toContain("the loop did not run for 8 hours (last ledger sync 2026-09-03T00:00:00.000Z)");
  }, 60_000);

  it("status, dashboard, growth and criteria leave it byte-identical too, and the dashboard shows the blocker", () => {
    const db = copy("render.db");
    const bytes = sha(db);
    for (const args of [["status"], ["dashboard", "--now", plus(7)], ["growth"], ["criteria"], ["criteria", "--json", "--due"]]) {
      cli(db, ...args);
      expect(sha(db), args.join(" ")).toBe(bytes);
    }
    expect(read("dashboard.html")).toContain(LOOP_GAP);
    // The commands that do write are not refused: criteria --mark records its sweep.
    cli(db, "criteria", "--mark", "storefronts", "--now", plus(7));
    expect(sha(db)).not.toBe(bytes);
  }, 120_000);

  it("a scheduled tick on the same database records the sync, and the next report's blocker is gone", () => {
    const db = copy("tick.db");
    const bytes = sha(db);
    const out = cli(db, "tick", "--no-feed", "--now", plus(7));
    expect(out.split("\n")).toContain("Ran: revenue_ledger_sync, revenue_supervisor_review");
    expect(sha(db)).not.toBe(bytes);
    expect(kv(db, "revenue.last_run.revenue_ledger_sync")).toBe(plus(7));
    expect(read("REPORT.md").split("\n")).toContain("Ran: revenue_ledger_sync, revenue_supervisor_review");

    const after = sha(db);
    cli(db, "report", "--now", plus(7.1));
    expect(sha(db)).toBe(after);
    expect(read("REPORT.md")).not.toContain("the loop did not run");
    expect(read("dashboard.html")).not.toContain("the loop did not run");
  }, 60_000);

  it("opens the handle of every render-only command query_only before any command runs", () => {
    // Defence in depth beside readOnly: a write anywhere on a render path throws instead of landing.
    expect(cliSource).toMatch(/const db = openDb\(values\.db!\);\n {2}if \(rendersOnly\(command, values\)\) db\.raw\.pragma\("query_only = ON"\);\n/);
    expect(cliSource).toContain('if (["report", "dashboard", "status", "growth"].includes(command)) return true;');
    expect(cliSource).toContain('return command === "criteria" && !flags.mark && !flags.supervised && !flags.reconcile;');
  });
});

describe("colony.yml's header says what is true", () => {
  const header = workflow.slice(0, workflow.indexOf("\non:"));

  it("no longer says the file lives on a feature branch and does not run", () => {
    expect(header).not.toMatch(/feature branch|Until it is merged|DOES NOT RUN/);
  });

  it("says it runs hourly from main, that GitHub may drop a scheduled run, and which blocker shows it", () => {
    expect(header).toContain("It runs from the default branch (main)");
    expect(header).toContain("hourly at minute 17");
    expect(header).toContain("GitHub may\n# delay or drop a scheduled run");
    expect(header).toContain('The report\'s "the loop did not run for N hours" blocker is what shows it.');
    expect(header).toContain("#   pnpm exec tsx scripts/colony.ts sync-portfolio\n#   pnpm exec tsx scripts/colony.ts tick --no-feed\n");
    // The schedule the header describes is the one the file declares.
    expect((parse(workflow) as { on: { schedule: { cron: string }[] } }).on.schedule).toEqual([{ cron: "17 * * * *" }]);
  });

  it("names both writers of the last ledger sync: the tick and the automaton's heartbeat task (src/revenue/heartbeat.ts)", () => {
    expect(header).toContain("the last ledger sync, which only a tick (or the automaton's heartbeat task of the\n# same name) records");
    expect(header).not.toContain("which only a tick records");
  });
});
