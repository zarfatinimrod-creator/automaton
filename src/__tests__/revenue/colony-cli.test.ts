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

// RULING-2026-10-11-ledger-sale-ids.md (FABLE_QUEUE row 26), folds 5, 6 and 7: `record` books a gumroad id as its digest
// and prints the stored form on a duplicate; `verify-gumroad` lists the account's sales with the token (a fake index
// here, preloaded over globalThis.fetch), digests each id and matches the ledger. Exit 2 without the token (nothing
// fetched), 0 clean, 3 with findings, 1 when the listing is refused; its output names rows by their stored form only,
// never the id or the token.
describe("record and verify-gumroad keep the raw Gumroad id and the token out of their output", () => {
  const FAKE_FETCH = path.join(repoRoot, "src/__tests__/revenue/fixtures/fake-gumroad-fetch.mjs");
  const TOKEN = "fake-token-Q7rT";
  const RAW = "fake-sale-K9p2==";
  const EXTRA = "fake-sale-extra==";
  const AT = "2026-10-05T09:30:00.000Z";
  const stored = (raw: string) => `sha256:${crypto.createHash("sha256").update(raw, "utf8").digest("hex")}`;
  let dir: string;
  let db: string;
  let salesFile: string;
  let logFile: string;

  const run = (args: string[], token: string | null, extra: NodeJS.ProcessEnv = {}) => {
    const env: NodeJS.ProcessEnv = { ...process.env, FAKE_GUMROAD_SALES: salesFile, FAKE_GUMROAD_LOG: logFile, ...extra };
    for (const k of ["LEMONSQUEEZY_API_KEY", "GUMROAD_ACCESS_TOKEN", "STRIPE_SECRET_KEY", "POSTHOG_READ_KEY", "POSTHOG_PROJECT_ID"]) delete env[k];
    if (token) env.GUMROAD_ACCESS_TOKEN = token;
    const out = spawnSync(process.execPath, ["--import", "tsx", "--import", FAKE_FETCH, "scripts/colony.ts", ...args, "--db", db], {
      cwd: repoRoot, encoding: "utf-8", env,
    });
    return { status: out.status, stdout: out.stdout, stderr: out.stderr };
  };
  const record = (externalId: string) =>
    run(["record", "--line", "il-biz-tools", "--kind", "sale", "--amount", "7900", "--currency", "USD", "--source", "gumroad", "--external-id", externalId, "--occurred-at", AT], null);
  const requests = () => (fs.existsSync(logFile) ? fs.readFileSync(logFile, "utf-8").split("\n").filter(Boolean).length : 0);
  const free = (text: string) => {
    for (const secret of [RAW, EXTRA, TOKEN]) expect(text).not.toContain(secret);
  };

  beforeAll(() => {
    dir = fs.mkdtempSync(path.join(os.tmpdir(), "colony-sale-ids-"));
    db = path.join(dir, "colony.db");
    salesFile = path.join(dir, "sales.json");
    logFile = path.join(dir, "requests.log");
    fs.writeFileSync(salesFile, JSON.stringify([{ id: RAW, price: 7900, currency: "usd", created_at: AT, refunded: false, gumroad_fee: 0, email: "fake-buyer-email-field" }]));
    const seeded = run(["seed"], null);
    expect(seeded.status, seeded.stderr).toBe(0);
  }, 60_000);
  afterAll(() => {
    fs.rmSync(dir, { recursive: true, force: true });
  });

  it("record: the second booking of a raw gumroad id says it is already recorded, by its stored form", () => {
    const first = record(RAW);
    expect(first.status, first.stderr).toBe(0);
    expect(first.stdout).toContain("Recorded sale");
    const again = record(RAW);
    expect(again.status, again.stderr).toBe(0);
    expect(again.stdout).toContain(`Already recorded: gumroad/${stored(RAW)}. Nothing changed.`);
    free(first.stdout + again.stdout + first.stderr + again.stderr);
    const conn = new Database(db, { readonly: true, fileMustExist: true });
    try {
      expect(conn.prepare("SELECT external_id AS id FROM revenue_ledger WHERE source = 'gumroad'").all()).toEqual([{ id: stored(RAW) }]);
    } finally {
      conn.close();
    }
  }, 60_000);

  it("verify-gumroad without the token: exit 2, not configured, no request made", () => {
    const out = run(["verify-gumroad"], null);
    expect(out.status, out.stderr).toBe(2);
    expect(out.stdout).toContain("not configured");
    expect(requests()).toBe(0);
  }, 60_000);

  it("verify-gumroad with the token: the booked sale matches its listed sale, exit 0, and the database is unchanged", () => {
    const bytes = crypto.createHash("sha256").update(fs.readFileSync(db)).digest("hex");
    const out = run(["verify-gumroad"], TOKEN);
    expect(out.status, out.stderr).toBe(0);
    expect(out.stdout).toContain("1 matched, 0 finding(s)");
    expect(out.stdout).toContain("Findings: 0.");
    expect(requests()).toBeGreaterThan(0);
    free(out.stdout + out.stderr);
    expect(crypto.createHash("sha256").update(fs.readFileSync(db)).digest("hex")).toBe(bytes);
  }, 60_000);

  it("verify-gumroad with a ledger row no listed sale explains: exit 3 and the finding, by its stored form, in prose and JSON", () => {
    expect(record(EXTRA).status).toBe(0);
    const out = run(["verify-gumroad"], TOKEN);
    expect(out.status, out.stderr).toBe(3);
    expect(out.stdout).toContain(`- unexplained: ${stored(EXTRA)} 2026-10-05`);
    expect(out.stdout).toContain("Findings: 1.");
    const json = run(["verify-gumroad", "--json"], TOKEN);
    expect(json.status).toBe(3);
    expect(JSON.parse(json.stdout)).toMatchObject({ status: "findings", findings: 1, unexplained: [{ externalId: stored(EXTRA), day: "2026-10-05" }] });
    free(out.stdout + out.stderr + json.stdout + json.stderr);
    expect(out.stdout + json.stdout).not.toContain("fake-buyer-email-field");
  }, 60_000);

  it("verify-gumroad when the listing is refused: exit 1, incomplete, nothing verified, the token in no line", () => {
    const out = run(["verify-gumroad"], TOKEN, { FAKE_GUMROAD_STATUS: "401" });
    expect(out.status, out.stderr).toBe(1);
    expect(out.stdout).toContain("incomplete — GET /v2/sales was refused (HTTP 401, page 1)");
    expect(out.stdout).not.toContain("Findings:");
    free(out.stdout + out.stderr);
  }, 60_000);

  it("is read-only: its handle is query-only, as report's is, and its help names the exit codes", () => {
    expect(cliSource).toContain('if (command === "verify-gumroad") return true;');
    expect(cliSource).toContain("Exit 0 clean, 3 with findings");
  });
});

// Tick 76 (CHANNEL_LOOP §9 "Queued 12.10 (tick 74)" item 2): `colony.ts record` refuses a Gumroad refund the hourly sync
// would book again — one whose id, stored, is not `sha256:<hex>:refund` of a Gumroad sale the ledger holds, on that
// sale's line — exiting 1 with nothing written. The real CLI on a temporary database; every id is invented.
describe("record books a Gumroad refund only where the sync will find it (tick 76)", () => {
  const SALE = "fake-sale-T76c==";
  const SALE_STORED = "fake-sale-T76s==";
  const stored = (raw: string) => `sha256:${crypto.createHash("sha256").update(raw, "utf8").digest("hex")}`;
  let dir: string;
  let db: string;

  const run = (args: string[]) => {
    const env: NodeJS.ProcessEnv = { ...process.env };
    for (const k of ["LEMONSQUEEZY_API_KEY", "GUMROAD_ACCESS_TOKEN", "STRIPE_SECRET_KEY", "POSTHOG_READ_KEY", "POSTHOG_PROJECT_ID"]) delete env[k];
    const out = spawnSync(process.execPath, ["--import", "tsx", "scripts/colony.ts", ...args, "--db", db], { cwd: repoRoot, encoding: "utf-8", env });
    return { status: out.status, stdout: out.stdout, stderr: out.stderr };
  };
  // Gumroad's created_at for the sale: a gumroad sale booked by hand carries it (RULING-2026-10-13 §3, tick 77).
  const record = (kind: string, externalId: string, line = "il-biz-tools", source = "gumroad") =>
    run(["record", "--line", line, "--kind", kind, "--amount", "7900", "--currency", "USD", "--source", source, "--external-id", externalId, "--occurred-at", "2026-10-01T10:00:00.000Z"]);
  const rows = () => {
    const conn = new Database(db, { readonly: true, fileMustExist: true });
    try {
      return conn.prepare("SELECT kind, line_id AS lineId, source, external_id AS externalId FROM revenue_ledger ORDER BY rowid").all() as
        { kind: string; lineId: string; source: string; externalId: string }[];
    } finally {
      conn.close();
    }
  };
  const refunds = () => rows().filter((r) => r.kind === "refund");

  beforeAll(() => {
    dir = fs.mkdtempSync(path.join(os.tmpdir(), "colony-refund-guard-"));
    db = path.join(dir, "colony.db");
    const seeded = run(["seed"]);
    expect(seeded.status, seeded.stderr).toBe(0);
    const sale = record("sale", SALE);
    expect(sale.status, sale.stderr).toBe(0);
  }, 60_000);
  afterAll(() => {
    fs.rmSync(dir, { recursive: true, force: true });
  });

  it("a refund under an unrelated id: exit 1, the form and the reason on stderr, nothing booked", () => {
    const out = record("refund", "fake-refund-T76c-other");
    expect(out.status).toBe(1);
    expect(out.stderr).toContain("Error: a gumroad refund is booked under its sale's own id");
    expect(out.stderr).toContain("would book its refund again");
    expect(out.stdout + out.stderr).not.toContain("fake-refund-T76c-other");
    expect(refunds()).toEqual([]);
  }, 60_000);

  it("a refund whose sale is not booked: exit 1, named by the sale's stored id, nothing booked", () => {
    const out = record("refund", "fake-sale-T76c-unbooked:refund");
    expect(out.status).toBe(1);
    expect(out.stderr).toContain(`Error: no Gumroad sale ${stored("fake-sale-T76c-unbooked")} is in the ledger`);
    expect(out.stdout + out.stderr).not.toContain("fake-sale-T76c-unbooked");
    expect(refunds()).toEqual([]);
  }, 60_000);

  it("a refund on another line than its sale's: exit 1, the sale's line named, nothing booked", () => {
    const out = record("refund", `${SALE}:refund`, "apify-actors");
    expect(out.status).toBe(1);
    expect(out.stderr).toContain(`Error: the Gumroad sale ${stored(SALE)} is booked on il-biz-tools`);
    expect(refunds()).toEqual([]);
  }, 60_000);

  it("the raw `<sale id>:refund` on the sale's line books; again, it is already recorded, by its stored form", () => {
    const first = record("refund", `${SALE}:refund`);
    expect(first.status, first.stderr).toBe(0);
    expect(first.stdout).toContain("Recorded refund");
    const again = record("refund", `${SALE}:refund`);
    expect(again.status, again.stderr).toBe(0);
    expect(again.stdout).toContain(`Already recorded: gumroad/${stored(SALE)}:refund. Nothing changed.`);
    expect(first.stdout + first.stderr + again.stdout + again.stderr).not.toContain(SALE);
    expect(refunds()).toEqual([{ kind: "refund", lineId: "il-biz-tools", source: "gumroad", externalId: `${stored(SALE)}:refund` }]);
  }, 60_000);

  it("the stored form `sha256:<hex>:refund` of a booked sale books", () => {
    expect(record("sale", SALE_STORED).status).toBe(0);
    const out = record("refund", `${stored(SALE_STORED)}:refund`);
    expect(out.status, out.stderr).toBe(0);
    expect(out.stdout).toContain("Recorded refund");
    expect(refunds().map((r) => r.externalId)).toEqual([`${stored(SALE)}:refund`, `${stored(SALE_STORED)}:refund`]);
  }, 60_000);

  it("a refund from another source is untouched by the rule", () => {
    const out = record("refund", "re_fake_T76c", "il-biz-tools", "stripe");
    expect(out.status, out.stderr).toBe(0);
    expect(out.stdout).toContain("Recorded refund");
    expect(refunds().map((r) => [r.source, r.externalId])).toEqual([
      ["gumroad", `${stored(SALE)}:refund`], ["gumroad", `${stored(SALE_STORED)}:refund`], ["stripe", "re_fake_T76c"],
    ]);
  }, 60_000);

  it("the usage text for record states the rule", () => {
    const usage = cliSource.slice(cliSource.indexOf("const USAGE ="), cliSource.indexOf("function fail("));
    expect(usage).toContain("A gumroad refund is booked only as <sale id>:refund");
  });

  // The tick-76 review. Each of these compares the whole ledger before and after, so it holds wherever it runs.
  it("--kind is one of the five ledger kinds, trimmed: Refund is refused, and 'refund ' meets the refund rule", () => {
    const before = rows();
    const odd = record("Refund", "fake-refund-T76c-kind");
    expect(odd.status).toBe(1);
    expect(odd.stderr).toContain("Error: --kind must be one of sale, subscription, payout, refund, cost");
    expect(odd.stdout).not.toContain("Recorded");
    const spaced = record("refund ", "fake-refund-T76c-kind");
    expect(spaced.status).toBe(1);
    expect(spaced.stderr).toContain("Error: a gumroad refund is booked under its sale's own id");
    expect(rows()).toEqual(before);
    const sale = record(" sale ", "fake-sale-T76c-trim");
    expect(sale.status, sale.stderr).toBe(0);
    expect(sale.stdout).toContain("Recorded sale");
    expect(rows()).toEqual([...before, { kind: "sale", lineId: "il-biz-tools", source: "gumroad", externalId: stored("fake-sale-T76c-trim") }]);
  }, 60_000);

  it("a refund of a booked Gumroad sale under --source manual: exit 1, nothing booked", () => {
    const before = rows();
    const out = record("refund", `${SALE}:refund`, "il-biz-tools", "manual");
    expect(out.status).toBe(1);
    expect(out.stderr).toContain(`Error: the Gumroad sale ${stored(SALE)} is in the ledger`);
    expect(out.stderr).toContain("Gumroad money is booked only under source gumroad");
    expect(out.stdout + out.stderr).not.toContain(SALE);
    expect(rows()).toEqual(before);
  }, 60_000);

  it("the usage text for record says Gumroad money is booked under source gumroad only", () => {
    const usage = cliSource.slice(cliSource.indexOf("const USAGE ="), cliSource.indexOf("function fail("));
    expect(usage).toContain("Gumroad money is booked only under --source gumroad");
  });
});

// RULING-2026-10-13-gumroad-refund-reread.md §3 (folds 5 and 6, FABLE_QUEUE row 32; tick 77). `record` refuses a gumroad
// sale without Gumroad's own time: exit 1, nothing written. `place-gumroad-sale --id <stored id> --listed-from <day>`
// lists the account's sales with the token (the fake index, preloaded over globalThis.fetch) and sets the row's
// occurred_at, and its :refund and :fee rows', to the created_at of the one listed sale whose digest is that stored id:
// exit 0 placed (or already on that day), 2 without the token (nothing fetched), 3 not placed (nothing written), 1 an
// argument refused. No line names the raw id, the token or an address. The real CLI on copies of one temporary
// database, removed in afterAll; every id and token is invented.
describe("record and place-gumroad-sale keep a hand-booked Gumroad sale on the day Gumroad made it (RULING-2026-10-13 §3)", () => {
  const FAKE_FETCH = path.join(repoRoot, "src/__tests__/revenue/fixtures/fake-gumroad-fetch.mjs");
  const TOKEN = "fake-token-T77p";
  const RAW = "fake-sale-T77p==";
  const OTHER = "fake-sale-T77q==";
  const HAND_AT = "2026-10-04T12:00:00.000Z";
  const CREATED = "2026-10-01T10:00:00Z";
  const NOW = "2026-10-12T00:30:00Z";
  const ADDRESS = "fake-buyer-email-field";
  const stored = (raw: string) => `sha256:${crypto.createHash("sha256").update(raw, "utf8").digest("hex")}`;
  const listed = (id: string, createdAt: string, over: Record<string, unknown> = {}) =>
    ({ id, price: 7900, currency: "usd", created_at: createdAt, refunded: false, gumroad_fee: 0, email: ADDRESS, ...over });
  let dir: string;
  let fixture: string;
  let throwing: string;

  type Opts = { token?: string | null; sales?: unknown[]; status?: number; preload?: string };
  const run = (db: string, args: string[], opts: Opts = {}) => {
    const salesFile = path.join(dir, "sales.json");
    const logFile = path.join(dir, "requests.log");
    fs.writeFileSync(salesFile, JSON.stringify(opts.sales ?? []));
    fs.rmSync(logFile, { force: true });
    const env: NodeJS.ProcessEnv = { ...process.env, FAKE_GUMROAD_SALES: salesFile, FAKE_GUMROAD_LOG: logFile };
    for (const k of ["LEMONSQUEEZY_API_KEY", "GUMROAD_ACCESS_TOKEN", "STRIPE_SECRET_KEY", "POSTHOG_READ_KEY", "POSTHOG_PROJECT_ID", "FAKE_GUMROAD_STATUS"]) delete env[k];
    if (opts.token !== null) env.GUMROAD_ACCESS_TOKEN = opts.token ?? TOKEN;
    if (opts.status) env.FAKE_GUMROAD_STATUS = String(opts.status);
    const out = spawnSync(process.execPath, ["--import", "tsx", "--import", opts.preload ?? FAKE_FETCH, "scripts/colony.ts", ...args, "--db", db], {
      cwd: repoRoot, encoding: "utf-8", env,
    });
    const requests = fs.existsSync(logFile) ? fs.readFileSync(logFile, "utf-8").split("\n").filter(Boolean).length : 0;
    return { status: out.status, stdout: out.stdout, stderr: out.stderr, requests };
  };
  const place = (db: string, opts: Opts = {}, listedFrom = "2026-09-30") =>
    run(db, ["place-gumroad-sale", "--id", stored(RAW), "--listed-from", listedFrom, "--now", NOW], opts);
  type Row = { kind: string; source: string; externalId: string | null; occurredAt: string };
  const rows = (db: string): Row[] => {
    const conn = new Database(db, { readonly: true, fileMustExist: true });
    try {
      return conn.prepare("SELECT kind, source, external_id AS externalId, occurred_at AS occurredAt FROM revenue_ledger ORDER BY rowid").all() as Row[];
    } finally {
      conn.close();
    }
  };
  const copy = (name: string) => {
    const to = path.join(dir, name);
    fs.copyFileSync(fixture, to);
    return to;
  };
  const free = (text: string) => {
    for (const secret of [RAW, OTHER, TOKEN, ADDRESS]) expect(text).not.toContain(secret);
  };
  const book = (db: string, kind: string, externalId: string, extra: string[], source = "gumroad") =>
    run(db, ["record", "--line", "il-biz-tools", "--kind", kind, "--amount", "7900", "--currency", "USD", "--source", source, "--external-id", externalId, ...extra]);

  beforeAll(() => {
    dir = fs.mkdtempSync(path.join(os.tmpdir(), "colony-place-sale-"));
    fixture = path.join(dir, "fixture.db");
    throwing = path.join(dir, "throwing-fetch.mjs");
    fs.writeFileSync(throwing, 'globalThis.fetch = () => { throw new Error("fake-fetch-T77: no request may be made"); };\n');
    const seeded = run(fixture, ["seed"]);
    expect(seeded.status, seeded.stderr).toBe(0);
    // A Gumroad sale booked by hand three days after Gumroad made it, and its refund booked by hand: both dated at the booking.
    for (const [kind, id] of [["sale", RAW], ["refund", `${RAW}:refund`]]) {
      const out = book(fixture, kind, id, ["--occurred-at", HAND_AT]);
      expect(out.status, out.stderr).toBe(0);
    }
  }, 60_000);
  afterAll(() => {
    fs.rmSync(dir, { recursive: true, force: true });
  });

  it("record: a gumroad sale with no --occurred-at, or one that is no time, exits 1 with the refusal and writes nothing; with Gumroad's time it books, dated at it; a stripe sale needs none", () => {
    const db = copy("record.db");
    const before = rows(db);
    for (const extra of [[], ["--occurred-at", "not-a-time"]]) {
      const out = book(db, "sale", "fake-sale-T77r==", extra);
      expect(out.status, extra.join(" ")).toBe(1);
      expect(out.stderr).toContain(
        "Error: a gumroad sale booked by hand carries the time Gumroad made it — the sale's created_at as GET /v2/sales returns it — as occurred_at",
      );
      expect(out.stderr).toContain("Nothing was recorded.");
      expect(out.stdout).not.toContain("Recorded");
      expect(out.stdout + out.stderr).not.toContain("fake-sale-T77r==");
    }
    expect(rows(db)).toEqual(before);
    const ok = book(db, "sale", "fake-sale-T77r==", ["--occurred-at", "2026-10-02T08:00:00.000Z"]);
    expect(ok.status, ok.stderr).toBe(0);
    expect(ok.stdout).toContain("Recorded sale");
    const stripe = book(db, "sale", "ch_fake_T77r", [], "stripe");
    expect(stripe.status, stripe.stderr).toBe(0);
    expect(stripe.stdout).toContain("Recorded sale");
    const added = rows(db).slice(before.length);
    expect(added.map((r) => [r.source, r.externalId])).toEqual([["gumroad", stored("fake-sale-T77r==")], ["stripe", "ch_fake_T77r"]]);
    expect(added[0]!.occurredAt).toBe("2026-10-02T08:00:00.000Z");
    expect(Date.now() - Date.parse(added[1]!.occurredAt)).toBeLessThan(120_000);
  }, 60_000);

  it("the usage text: a gumroad sale's --occurred-at is Gumroad's created_at and required; place-gumroad-sale and --since are listed", () => {
    const usage = cliSource.slice(cliSource.indexOf("const USAGE ="), cliSource.indexOf("function fail("));
    expect(usage).toContain("A gumroad sale needs it: Gumroad's created_at");
    expect(usage).toContain("  place-gumroad-sale   ");
    expect(usage).toContain("--id <stored id>");
    expect(usage).toContain("--listed-from <day>");
    expect(usage).toContain("--since <day>");
  });

  it("place-gumroad-sale without the token: exit 2, not configured, no request made (a fetch that throws), nothing written", () => {
    const db = copy("no-token.db");
    const before = rows(db);
    const out = place(db, { token: null, preload: throwing });
    expect(out.status, out.stderr).toBe(2);
    expect(out.stdout).toContain("not configured");
    expect(out.stderr).not.toContain("fake-fetch-T77");
    expect(rows(db)).toEqual(before);
    free(out.stdout + out.stderr);
  }, 60_000);

  it("with the listing returning the sale: exit 0, the sale and its :refund row both on Gumroad's created_at, stdout naming the stored form and both days only; run again, already on that day, nothing written", () => {
    const db = copy("place.db");
    const sales = [listed(OTHER, "2026-09-30T08:00:00Z"), listed(RAW, CREATED)];
    const out = place(db, { sales });
    expect(out.status, out.stderr).toBe(0);
    expect(out.stdout).toContain(`placed ${stored(RAW)}: 2026-10-04 → 2026-10-01`);
    expect(out.requests).toBe(1);
    free(out.stdout + out.stderr);
    // The rows changed: the command's handle is not query_only (it writes, so rendersOnly is false for it).
    const placed = rows(db).filter((r) => r.source === "gumroad").map((r) => [r.kind, r.externalId, r.occurredAt]);
    expect(placed).toEqual([
      ["sale", stored(RAW), "2026-10-01T10:00:00.000Z"],
      ["refund", `${stored(RAW)}:refund`, "2026-10-01T10:00:00.000Z"],
    ]);
    const again = place(db, { sales });
    expect(again.status, again.stderr).toBe(0);
    expect(again.stdout).toContain(`${stored(RAW)} is already dated 2026-10-01, the day Gumroad made it: nothing written`);
    expect(rows(db).filter((r) => r.source === "gumroad").map((r) => [r.kind, r.externalId, r.occurredAt])).toEqual(placed);
    free(again.stdout + again.stderr);
  }, 60_000);

  it("no listed sale with its stored id: exit 3, both rows unchanged", () => {
    const db = copy("no-match.db");
    const before = rows(db);
    const out = place(db, { sales: [listed(OTHER, CREATED)] });
    expect(out.status, out.stderr).toBe(3);
    expect(out.stdout).toContain("nothing written");
    expect(rows(db)).toEqual(before);
    free(out.stdout + out.stderr);
  }, 60_000);

  it("two listed sales with its stored id: exit 3, both rows unchanged", () => {
    const db = copy("two-match.db");
    const before = rows(db);
    const out = place(db, { sales: [listed(RAW, CREATED), listed(RAW, "2026-10-02T10:00:00Z")] });
    expect(out.status, out.stderr).toBe(3);
    expect(out.stdout).toContain("nothing written");
    expect(rows(db)).toEqual(before);
    free(out.stdout + out.stderr);
  }, 60_000);

  it("a listing refused at page 1: exit 3, both rows unchanged", () => {
    const db = copy("refused.db");
    const before = rows(db);
    const out = place(db, { sales: [listed(RAW, CREATED)], status: 500 });
    expect(out.status, out.stderr).toBe(3);
    expect(out.stdout).toContain("refused (HTTP 500, page 1)");
    expect(out.stdout).toContain("nothing written");
    expect(rows(db)).toEqual(before);
    free(out.stdout + out.stderr);
  }, 60_000);

  it("an --id not in the stored form, or a --listed-from that is no real day: exit 1, nothing fetched, the id not echoed", () => {
    const db = copy("bad-args.db");
    const before = rows(db);
    const raw = run(db, ["place-gumroad-sale", "--id", RAW, "--listed-from", "2026-09-30", "--now", NOW], { sales: [listed(RAW, CREATED)] });
    expect(raw.status).toBe(1);
    expect(raw.stderr).toContain("Error: --id must be a Gumroad sale's stored id");
    expect(raw.requests).toBe(0);
    free(raw.stdout + raw.stderr);
    const day = place(db, { sales: [listed(RAW, CREATED)] }, "2026-02-30");
    expect(day.status).toBe(1);
    expect(day.stderr).toContain("Error: --listed-from must be a real day");
    expect(day.requests).toBe(0);
    expect(rows(db)).toEqual(before);
  }, 60_000);

  it("verify-gumroad --since lists from that day, so the hand-booked row is found and its day differs; without it the row is unexplained; a --since that is no day exits 1", () => {
    const sales = [listed(RAW, CREATED, { refunded: true })];
    const wide = run(fixture, ["verify-gumroad", "--since", "2026-09-30", "--now", NOW], { sales });
    expect(wide.status, wide.stderr).toBe(3);
    expect(wide.stdout).toContain("since 2026-09-30");
    expect(wide.stdout).toContain(`- differs (day): ${stored(RAW)} 2026-10-04`);
    const narrow = run(fixture, ["verify-gumroad", "--now", NOW], { sales });
    expect(narrow.status, narrow.stderr).toBe(3);
    expect(narrow.stdout).toContain("since 2026-10-03");
    expect(narrow.stdout).toContain(`- unexplained: ${stored(RAW)} 2026-10-04`);
    const bad = run(fixture, ["verify-gumroad", "--since", "2026-02-30", "--now", NOW], { sales });
    expect(bad.status).toBe(1);
    expect(bad.stderr).toContain("Error: --since must be a real day");
    expect(bad.requests).toBe(0);
    free(wide.stdout + narrow.stdout + bad.stdout + bad.stderr);
  }, 60_000);

  it("place-gumroad-sale writes, so its handle is not opened query_only", () => {
    const fn = cliSource.slice(cliSource.indexOf("function rendersOnly("), cliSource.indexOf("function writeReport("));
    expect(fn.length).toBeGreaterThan(0);
    expect(fn).not.toContain("place-gumroad-sale");
    expect(cliSource).toContain('case "place-gumroad-sale": {');
  });
});

// RULING-2026-10-13-gumroad-refund-reread.md §3 item 3: the command runs where the token is, as a workflow_dispatch input
// of colony.yml, in the job that holds the token, before the tick; the input reaches the script through env, never
// expanded into its text, and a scheduled run does what it did.
describe("colony.yml places a hand-booked Gumroad sale only on a dispatch that names one (RULING-2026-10-13 §3)", () => {
  type Step = { name?: string; run?: string; if?: string; env?: Record<string, string>; "continue-on-error"?: unknown };
  type Workflow = {
    on: { schedule: { cron: string }[]; workflow_dispatch: { inputs: Record<string, { description: string; type: string; default: unknown }> } };
    jobs: Record<string, { steps: Step[] }>;
  };
  const wf = parse(workflow) as Workflow;
  const steps = wf.jobs.tick.steps;
  const at = (re: RegExp) => steps.findIndex((s) => re.test(s.run ?? ""));
  const placeAt = at(/pnpm exec tsx scripts\/colony\.ts place-gumroad-sale /);

  it("declares the place_sale input: a string, empty by default, saying what it takes", () => {
    expect(wf.on.workflow_dispatch.inputs.place_sale).toEqual({
      description: "<stored id> <YYYY-MM-DD>: place one hand-booked Gumroad sale on the day Gumroad made it (RULING-2026-10-13 §3)",
      type: "string",
      default: "",
    });
    // The schedule and the force input are as they were.
    expect(wf.on.schedule).toEqual([{ cron: "17 * * * *" }]);
    expect(Object.keys(wf.on.workflow_dispatch.inputs)).toEqual(["force", "place_sale"]);
  });

  it("runs in the tick job, after the install and before the tick, only on a dispatch that sets the input, with the token, the input in env", () => {
    // Before sync-portfolio too, so the sync step and the tick step stay adjacent (ledger.json's T63-W4 swaps them).
    const install = at(/^pnpm install --frozen-lockfile/);
    const sync = at(/pnpm exec tsx scripts\/colony\.ts sync-portfolio\n/);
    const tick = at(/pnpm exec tsx scripts\/colony\.ts tick --no-feed/);
    expect(placeAt).toBeGreaterThan(install);
    expect(placeAt).toBeLessThan(sync);
    expect(sync).toBeLessThan(tick);
    const step = steps[placeAt]!;
    expect(step.if).toBe("${{ github.event_name == 'workflow_dispatch' && inputs.place_sale != '' }}");
    expect(step["continue-on-error"]).toBeUndefined();
    expect(step.env).toEqual({ GUMROAD_ACCESS_TOKEN: "${{ secrets.GUMROAD_ACCESS_TOKEN }}", PLACE_SALE: "${{ inputs.place_sale }}" });
    expect(step.run!.startsWith("set -euo pipefail\n")).toBe(true);
    // No expression is expanded into the script's text: the input is read from PLACE_SALE alone.
    expect(step.run).not.toContain("${{");
    expect(step.run).not.toContain("inputs.");
    expect(steps[tick]!.env).not.toHaveProperty("PLACE_SALE");
  });

  it("its script passes the input's two words as two arguments, never runs what the input holds, refuses any other shape, and fails on the command's exit", () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "colony-place-step-"));
    try {
      const bin = path.join(tmp, "bin");
      fs.mkdirSync(bin);
      const argsFile = path.join(tmp, "args.txt");
      // A stand-in pnpm that records its arguments, one per line, and exits with STUB_EXIT.
      // (`for a;` walks the positional parameters, one line each.)
      fs.writeFileSync(path.join(bin, "pnpm"), '#!/usr/bin/env bash\nfor a; do printf \'%s\\n\' "$a"; done > "$ARGS_FILE"\nexit "${STUB_EXIT:-0}"\n', { mode: 0o755 });
      const runStep = (input: string, stubExit = 0) => {
        fs.rmSync(argsFile, { force: true });
        return spawnSync("bash", ["-c", steps[placeAt]!.run!], {
          cwd: tmp, encoding: "utf-8",
          env: { PATH: `${bin}:${process.env.PATH}`, PLACE_SALE: input, ARGS_FILE: argsFile, STUB_EXIT: String(stubExit) },
        });
      };
      const args = () => fs.readFileSync(argsFile, "utf-8").split("\n").filter(Boolean);
      const id = `sha256:${"a1".repeat(32)}`;
      const ok = runStep(`${id} 2026-09-30`);
      expect(ok.status, ok.stderr).toBe(0);
      expect(args()).toEqual(["exec", "tsx", "scripts/colony.ts", "place-gumroad-sale", "--id", id, "--listed-from", "2026-09-30"]);
      // A command substitution in the input is a word handed on as it is, never run.
      const sneaky = runStep("$(>pwned-T77) 2026-09-30");
      expect(sneaky.status, sneaky.stderr).toBe(0);
      expect(args()).toEqual(["exec", "tsx", "scripts/colony.ts", "place-gumroad-sale", "--id", "$(>pwned-T77)", "--listed-from", "2026-09-30"]);
      expect(fs.existsSync(path.join(tmp, "pwned-T77"))).toBe(false);
      for (const bad of ["only-one-word", `${id} 2026-09-30 extra`, "   "]) {
        const out = runStep(bad);
        expect(out.status, bad).toBe(1);
        expect(fs.existsSync(argsFile), bad).toBe(false);
      }
      // The command's own exit fails the step: 2 (no token) and 3 (not placed) stop the run before the tick.
      for (const code of [2, 3]) expect(runStep(`${id} 2026-09-30`, code).status).toBe(code);
    } finally {
      fs.rmSync(tmp, { recursive: true, force: true });
    }
  });
});
