/**
 * .github/workflows/prize-intake.yml — the weekly ₪0 read of the mlcontests list (CHANNEL_LOOP.md §4 row 13).
 * An instrument: it reads one public file and commits numbers, nothing else. These tests pin what would go wrong
 * silently — a secret or a second network call creeping in, the reading committed to a feature branch, a commit that
 * retriggers CI, half a reading committed — and then run the commit step in bash against a stub `git`
 * (the pattern of brand-mail-workflow.test.ts), so a guard that lost a condition fails even while its words remain.
 */
import { afterAll, describe, expect, it } from "vitest";
import { spawnSync } from "node:child_process";
import { chmodSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { parse } from "yaml";
import { summarisePrizeIntake } from "../../revenue/prize-intake.js";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const WORKFLOW = join(ROOT, ".github", "workflows", "prize-intake.yml");
const FIXTURE_TEXT = readFileSync(join(ROOT, "src", "__tests__", "fixtures", "mlcontests-competitions-trimmed.json"), "utf8");
const text = () => readFileSync(WORKFLOW, "utf8");
const wf = () => parse(text()) as Record<string, any>;

type Step = { name?: string; id?: string; uses?: string; run?: string; if?: string; with?: Record<string, unknown>; env?: Record<string, string> };
const steps = (): Step[] => wf().jobs.read.steps;
const stepNamed = (prefix: string): Step => {
  const s = steps().find((x) => x.name?.startsWith(prefix));
  if (!s) throw new Error(`no step "${prefix}"`);
  return s;
};

describe("prize-intake.yml — what it is allowed to do", () => {
  it("runs weekly, on dispatch, and once when the instrument itself lands on main", () => {
    const on = wf().on;
    expect(Object.keys(on).sort()).toEqual(["push", "schedule", "workflow_dispatch"]);
    expect(on.schedule).toHaveLength(1);
    const [minute, hour, dom, month, dow] = on.schedule[0].cron.split(" ");
    // Weekly: one fixed day of the week, every month; not on the hour (GitHub delays top-of-the-hour schedules).
    expect([dom, month]).toEqual(["*", "*"]);
    expect(dow).toMatch(/^[0-6]$/);
    expect(Number(minute)).toBeGreaterThan(0);
    expect(Number(hour)).toBeGreaterThanOrEqual(0);
    expect(on.push.branches).toEqual(["main"]);
    expect([...on.push.paths].sort()).toEqual([".github/workflows/prize-intake.yml", "scripts/prize-intake.ts", "src/revenue/prize-intake.ts"]);
  });

  it("needs no secret and asks only to write contents", () => {
    expect(wf().permissions).toEqual({ contents: "write" });
    expect(text()).not.toMatch(/secrets\./);
    expect(text()).not.toMatch(/environment:/);
  });

  it("has its own concurrency group, so it never displaces a colony tick", () => {
    expect(wf().concurrency).toEqual({ group: "prize-intake", "cancel-in-progress": false });
    const colony = parse(readFileSync(join(ROOT, ".github", "workflows", "colony.yml"), "utf8")) as Record<string, any>;
    expect(colony.concurrency.group).not.toBe(wf().concurrency.group);
  });

  it("reads and commits on main, whichever branch a dispatch came from", () => {
    const checkout = steps().find((s) => s.uses?.startsWith("actions/checkout@"));
    expect(checkout?.with).toMatchObject({ ref: "main", "fetch-depth": 0 });
  });

  it("makes its one request through the tested script, and no other network step", () => {
    expect(stepNamed("Read the mlcontests list").run).toBe("pnpm exec tsx scripts/prize-intake.ts");
    const runs = steps().map((s) => s.run ?? "").join("\n");
    expect(runs).not.toMatch(/\bcurl\b|\bwget\b|https?:\/\//);
    expect(steps().some((s) => "continue-on-error" in s)).toBe(false);
  });

  it("commits only the state file, marked [skip ci], and only after a successful read", () => {
    const commit = stepNamed("Commit the reading");
    expect(commit.if).toBeUndefined(); // default success(): a failed read never reaches the commit
    expect(commit.run).toMatch(/git add "\$JSON"/);
    expect(commit.run).toMatch(/JSON=state\/colony\/prize-intake\.json/);
    expect(commit.run).toMatch(/\[skip ci\]/);
    expect(commit.run).not.toMatch(/git add (-A|\.|-f)|git stash|--autostash|--force|git push -f/);
  });
});

describe("prize-intake.yml — the commit step, run in bash against a stub git", () => {
  const scratch = mkdtempSync(join(tmpdir(), "prize-intake-wf-"));
  afterAll(() => rmSync(scratch, { recursive: true, force: true }));
  let n = 0;

  /** A fresh directory with a stub `git` on PATH; every call is logged. `git diff --cached --quiet` says "changed" unless told otherwise. */
  function sandbox(opts: { changed?: boolean; pushFails?: number } = {}) {
    const dir = join(scratch, String(n++));
    const bin = join(dir, "bin");
    mkdirSync(bin, { recursive: true });
    const log = join(dir, "stub.log");
    const pushes = join(dir, "pushes");
    writeFileSync(log, "");
    writeFileSync(pushes, "0");
    writeFileSync(
      join(bin, "git"),
      `#!/usr/bin/env bash
{ printf 'git'; for a in "$@"; do printf ' [%s]' "$a"; done; printf '\\n'; } >> "$STUB_LOG"
case "$1 $2" in
  "diff --cached") exit ${opts.changed === false ? 0 : 1} ;;
esac
if [ "$1" = push ]; then
  count=$(cat "${pushes}"); echo $((count + 1)) > "${pushes}"
  [ "$count" -lt ${opts.pushFails ?? 0} ] && exit 1
fi
exit 0
`,
    );
    chmodSync(join(bin, "git"), 0o755);
    return { dir, bin, log };
  }

  function run(box: ReturnType<typeof sandbox>) {
    const r = spawnSync("bash", ["--noprofile", "--norc", "-e", "-o", "pipefail", "-c", stepNamed("Commit the reading").run!], {
      cwd: box.dir,
      env: { PATH: `${box.bin}:${process.env.PATH ?? ""}`, STUB_LOG: box.log },
      encoding: "utf8",
    });
    return { status: r.status, out: `${r.stdout}${r.stderr}`, calls: readFileSync(box.log, "utf8").split("\n").filter(Boolean) };
  }

  const withReading = (box: ReturnType<typeof sandbox>) => {
    mkdirSync(join(box.dir, "state", "colony"), { recursive: true });
    writeFileSync(join(box.dir, "state", "colony", "prize-intake.json"), JSON.stringify(summarisePrizeIntake(FIXTURE_TEXT, "2026-09-29T05:41:00Z")));
    return box;
  };

  it("refuses to commit when the script reported success but the file is missing", () => {
    const r = run(sandbox());
    expect(r.status).toBe(1);
    expect(r.out).toMatch(/refusing to commit/);
    expect(r.calls.some((c) => c.startsWith("git [commit]"))).toBe(false);
  });

  it("commits the reading with its numbers in the subject and [skip ci], then pushes", () => {
    const r = run(withReading(sandbox()));
    expect(r.status, r.out).toBe(0);
    expect(r.calls).toContain("git [add] [state/colony/prize-intake.json]");
    const commit = r.calls.find((c) => c.startsWith("git [commit]"));
    expect(commit).toBe("git [commit] [-m] [measure(prize-intake): 9 open of 14 listed; AI rule not stated by the list [skip ci]]");
    expect(r.calls.filter((c) => c === "git [push]")).toHaveLength(1);
  });

  it("does not commit an unchanged reading", () => {
    const r = run(withReading(sandbox({ changed: false })));
    expect(r.status).toBe(0);
    expect(r.out).toMatch(/unchanged/);
    expect(r.calls.some((c) => c.startsWith("git [commit]"))).toBe(false);
  });

  it("rebases and retries a rejected push, and fails after three rejections", () => {
    const once = run(withReading(sandbox({ pushFails: 1 })));
    expect(once.status, once.out).toBe(0);
    expect(once.calls).toContain("git [pull] [--rebase]");
    const never = run(withReading(sandbox({ pushFails: 99 })));
    expect(never.status).toBe(1);
    expect(never.calls.filter((c) => c === "git [push]")).toHaveLength(3);
  });
});
