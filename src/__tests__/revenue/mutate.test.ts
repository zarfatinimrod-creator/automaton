import { spawn, spawnSync } from "node:child_process";
import { chmodSync, existsSync, lstatSync, mkdirSync, mkdtempSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { afterAll, describe, expect, it } from "vitest";

/**
 * scripts/mutate.mjs — the mutation-test harness. Every build on this project ends with someone breaking the code on
 * purpose to prove a test catches it; until tick 34 each builder and reviewer wrote that loop by hand (ticks 29, 32 and
 * 33 each had one in a scratch folder). What must hold:
 *   - a baseline run of every distinct test command first: a mutation "killed" by an already-failing test proves nothing;
 *   - the edit is exact: the text found once (or the --nth one), never zero or several matches, never a no-op;
 *   - the verdict is the runner's exit code (non-zero killed, zero survived), and a non-zero exit with no sign a test ran
 *     (a crash, "No test files found", no summary line) is "killed?", not a clean kill;
 *   - the file is restored byte for byte after every run, also after a crash and on SIGTERM/SIGINT of the harness, and a
 *     restore that does not match the original's hash exits 4 with the original bytes saved elsewhere;
 *   - a file with uncommitted changes is refused unless --allow-dirty, so `git checkout -- <file>` is always a way back.
 * Added after the tick-34 reviews (every one of these was shown to fail on the first version):
 *   - a run has a time limit, and when the runner exits its whole process group is killed before the restore: a hung
 *     mutant, a leftover holding the output pipe, or a leftover that writes the file later cannot outlive the run;
 *   - on a signal the runner is stopped first and the file restored after (SIGQUIT too), never the other way round;
 *   - the restore does not follow links, recreates a deleted file with its mode, and refuses to overwrite bytes that are
 *     neither the original nor the mutation (someone's edit), with exit 4;
 *   - one run per checkout (a lock), the bytes read are checked against git's index, and git reads paths literally;
 *   - the checkout is compared before and after every run, and the baseline runs again at the end: tests that write to
 *     the tree or that fail the second time void the verdicts;
 *   - a run where no test ran (all skipped, "No test files found") never passes a baseline, whatever --cmd is.
 * Everything runs in a scratch git repository with a toy module and a stub runner (runner.mjs) that checks the toy and
 * prints a vitest-like summary. Markers put into the toy by a mutation make the stub misbehave on purpose: CRASH kills
 * it with SIGKILL, NOFILES prints vitest's "No test files found", HANG makes it wait (for the signal tests), CLOBBER
 * replaces the toy with a directory so the restore cannot write it, and so on (each is named where it is used).
 * Nothing touches the network.
 */

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const HARNESS = join(ROOT, "scripts", "mutate.mjs");
const REAL_GIT = spawnSync("sh", ["-c", "command -v git"], { encoding: "utf8" }).stdout.trim();

const scratch = mkdtempSync(join(tmpdir(), "mutate-test-"));
afterAll(() => rmSync(scratch, { recursive: true, force: true }));

const EMPTY_GITCONFIG = join(scratch, "gitconfig");
writeFileSync(EMPTY_GITCONFIG, "");
const BIN = join(scratch, "bin");
mkdirSync(BIN, { recursive: true });
// A stub `npx` for the default command: records its arguments, then runs the toy's runner (or prints nothing, exit 0).
writeFileSync(
  join(BIN, "npx"),
  `#!/usr/bin/env bash
echo "npx $*" >> "$RUN_LOG"
[ "\${NPX_MODE:-}" = silent ] && exit 0
exec node runner.mjs
`,
);
chmodSync(join(BIN, "npx"), 0o755);

const TOY = `export function add(a, b) {
  return a + b;
}

export function isPositive(n) {
  return n > 0;
}
`;
const TOY2 = `export const greet = (name) => "hi " + name;
`;
const RUNNER = `import { appendFileSync, chmodSync, copyFileSync, existsSync, mkdirSync, readFileSync, renameSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { spawn } from "node:child_process";
if (process.env.RUN_LOG) appendFileSync(process.env.RUN_LOG, ["run", ...process.argv.slice(2)].join(" ") + "\\n");
// A copy of a file as this run saw it, numbered by the run (1 is the baseline, 2 the first mutation's run).
if (process.env.SNAPSHOT_SRC) {
  const n = readFileSync(process.env.RUN_LOG, "utf8").split("\\n").filter(Boolean).length;
  copyFileSync(process.env.SNAPSHOT_SRC, process.env.SNAPSHOT_DST + "." + n);
}
if (process.env.TOUCH_TOY2) appendFileSync("src/toy2.mjs", "// touched by the runner\\n");
// A vitest-like summary, or pytest's last line with PYTEST_STYLE.
const summary = (failed, passed) =>
  process.env.PYTEST_STYLE
    ? "==== " + (failed ? failed + " failed, " : "") + passed + " passed in 0.12s ===="
    : " Test Files  " + (failed ? "1 failed" : "1 passed") + " (1)\\n      Tests  " + (failed ? failed + " failed | " : "") + passed + " passed (" + (failed + passed) + ")";
if (process.env.RUNNER_FAILS) { console.log(summary(1, 3)); process.exit(1); }
if (process.env.SKIPALL) { console.log(" Test Files  1 skipped (1)\\n      Tests  3 skipped (3)"); process.exit(0); }
if (process.env.NOFILES_OK) { console.log("No test files found, exiting with code 0"); process.exit(0); }
if (process.env.HANGBASE) await new Promise((r) => setTimeout(r, 60000));
// Tests that leave state behind: they pass the first time and fail every time after.
if (process.env.STATEFUL_MARK) {
  if (existsSync(process.env.STATEFUL_MARK)) { console.log(summary(4, 0)); process.exit(1); }
  writeFileSync(process.env.STATEFUL_MARK, "ran");
}
if (existsSync("scripts/run.sh") && readFileSync("scripts/run.sh", "utf8").includes("DELETEME")) rmSync("scripts/run.sh");
const src = readFileSync("src/toy.mjs", "utf8");
if (src.includes("CHMODX")) chmodSync("src/toy.mjs", 0o755);
if (src.includes("TOUCHOTHER")) appendFileSync("src/toy2.mjs", "// touched\\n");
if (src.includes("TOUCHIGNORED")) appendFileSync("cache/data.txt", "more\\n");
if (src.includes("FAILCRASH")) { console.log(summary(1, 3)); process.kill(process.pid, "SIGKILL"); }
if (src.includes("CRASH")) process.kill(process.pid, "SIGKILL");
if (src.includes("NOFILES")) { console.log("No test files found, exiting with code 1"); process.exit(1); }
if (src.includes("NOLOAD")) {
  if (process.env.PYTEST_STYLE) { console.log("!!!! Interrupted: 1 error during collection !!!!\\n==== 1 error in 0.05s ===="); process.exit(2); }
  console.log(" Test Files  1 failed (1)\\n      Tests  no tests"); process.exit(1);
}
if (src.includes("EXIT1PASS")) { console.log(summary(0, 4)); process.exit(1); }
if (src.includes("SKIPPED")) { console.log("      Tests  4 skipped (4)"); process.exit(0); }
if (src.includes("NOISYFAIL")) console.log("No test files found, exiting with code 1");
if (src.includes("QUOTEINTERRUPT")) console.log("!!!! Interrupted: 1 error during collection !!!!");
if (src.includes("FAKESUMMARY")) console.log("      Tests  4 passed (4)");
// A mutant that never ends: a synchronous loop no test timeout can interrupt.
if (src.includes("LOOPFOREVER")) { writeFileSync(process.env.HANG_MARK, String(process.pid)); for (;;) {} }
// A leftover that holds the runner's stdout after the runner itself has exited.
if (src.includes("PIPEHOLD")) {
  const c = spawn("sleep", ["30"], { stdio: ["ignore", "inherit", "inherit"] });
  writeFileSync(process.env.HANG_MARK, String(c.pid));
  console.log(summary(1, 3)); process.exit(1);
}
// A leftover that left the process group (setsid) and still holds stdout: out of the harness's reach.
if (src.includes("PIPEESCAPE")) {
  const c = spawn("sleep", ["30"], { detached: true, stdio: ["ignore", "inherit", "inherit"] });
  c.unref();
  writeFileSync(process.env.HANG_MARK, String(c.pid));
  console.log(summary(1, 3)); process.exit(1);
}
// A leftover that does not hold the pipe and writes the mutated bytes back 1.5s later.
if (src.includes("LATEWRITE")) {
  const code = "setTimeout(() => require('fs').writeFileSync('src/toy.mjs', process.env.LATE_BYTES), 1500)";
  const c = spawn(process.execPath, ["-e", code], { stdio: "ignore", env: { ...process.env, LATE_BYTES: src } });
  c.unref();
  writeFileSync(process.env.HANG_MARK, String(c.pid));
  console.log(summary(1, 3)); process.exit(1);
}
if (src.includes("HANG")) {
  if (src.includes("HANGHARD")) process.on("SIGTERM", () => {});
  else if (src.includes("HANGWRITEBACK")) {
    // Writes what it read (the mutation) back when told to stop: a restore done before it is dead is undone.
    process.on("SIGTERM", () => { writeFileSync("src/toy.mjs", src); writeFileSync(process.env.HANG_MARK + ".term", "SIGTERM"); process.exit(143); });
  } else process.on("SIGTERM", () => { writeFileSync(process.env.HANG_MARK + ".term", "SIGTERM"); process.exit(143); });
  writeFileSync(process.env.HANG_MARK, String(process.pid));
  setTimeout(() => process.exit(0), 60000);
} else {
  const { add, isPositive } = await import("./src/toy.mjs");
  const { greet } = await import("./src/toy2.mjs");
  if (src.includes("CLOBBER")) { rmSync("src/toy.mjs"); mkdirSync("src/toy.mjs"); }
  if (src.includes("SWAPLINK")) { rmSync("src/toy.mjs"); symlinkSync("other.txt", "src/toy.mjs"); }
  if (src.includes("SWAPDIR")) { renameSync("src", "src-moved"); mkdirSync("elsewhere", { recursive: true }); symlinkSync("elsewhere", "src"); }
  if (src.includes("EDITDURING")) appendFileSync("src/toy.mjs", "// edited during the run\\n");
  const results = [add(2, 3) === 5, isPositive(1) === true, isPositive(-1) === false, greet("x") === "hi x"];
  const failed = results.filter((r) => !r).length;
  for (let i = 0; i < 12; i++) console.log("noise line " + i);
  console.log(summary(failed, results.length - failed));
  process.exit(failed ? 1 : 0);
}
`;

const gitEnv = {
  GIT_CONFIG_GLOBAL: EMPTY_GITCONFIG,
  GIT_CONFIG_NOSYSTEM: "1",
  GIT_AUTHOR_NAME: "toy",
  GIT_AUTHOR_EMAIL: "toy@example.invalid",
  GIT_COMMITTER_NAME: "toy",
  GIT_COMMITTER_EMAIL: "toy@example.invalid",
  GIT_CEILING_DIRECTORIES: scratch,
};

function git(cwd: string, ...args: string[]): string {
  const r = spawnSync("git", args, { cwd, env: { ...process.env, ...gitEnv }, encoding: "utf8" });
  if (r.status !== 0) throw new Error(`git ${args.join(" ")}: ${r.stderr}`);
  return r.stdout;
}

let repos = 0;
/** A committed scratch repository with the toy modules and the stub runner, plus `extra` files (with `modes`). */
function makeRepo(extra: Record<string, string | Buffer> = {}, modes: Record<string, number> = {}): string {
  repos += 1;
  const dir = join(scratch, `repo-${repos}`);
  const files: Record<string, string | Buffer> = { "src/toy.mjs": TOY, "src/toy2.mjs": TOY2, "runner.mjs": RUNNER, ...extra };
  for (const [p, content] of Object.entries(files)) {
    mkdirSync(dirname(join(dir, p)), { recursive: true });
    writeFileSync(join(dir, p), content);
  }
  for (const [p, mode] of Object.entries(modes)) chmodSync(join(dir, p), mode);
  git(dir, "init", "-q");
  git(dir, "add", "-A");
  git(dir, "commit", "-q", "-m", "toy");
  return dir;
}

const runLog = (repo: string) => join(repo, "..", `${repo.split("/").pop()}.runs`);
const runs = (repo: string): string[] =>
  existsSync(runLog(repo)) ? readFileSync(runLog(repo), "utf8").split("\n").filter(Boolean) : [];

function env(repo: string, extra: Record<string, string> = {}): Record<string, string | undefined> {
  return { ...process.env, ...gitEnv, PATH: `${BIN}:${process.env.PATH}`, RUN_LOG: runLog(repo), ...extra };
}

function harness(repo: string, args: string[], extra: Record<string, string> = {}) {
  const r = spawnSync(process.execPath, [HARNESS, ...args], { cwd: repo, env: env(repo, extra), encoding: "utf8" });
  return { code: r.status, stdout: r.stdout, stderr: r.stderr, all: r.stdout + r.stderr };
}

/** The report line of one mutation: it starts with the mutation's id. */
function line(out: string, id: string): string {
  const found = out.split("\n").find((l) => l.startsWith(`${id} `));
  if (!found) throw new Error(`no report line for ${id} in:\n${out}`);
  return found;
}

/** The "why:" line printed under a mutation's report line. */
function why(out: string, id: string): string {
  const lines = out.split("\n");
  const at = lines.indexOf(line(out, id));
  const next = lines[at + 1] ?? "";
  if (!next.trim().startsWith("why:")) throw new Error(`no why: line under ${id} in:\n${out}`);
  return next;
}

const STUB = ["--cmd", "node runner.mjs"];
const one = (find: string, replace: string, ...more: string[]) => ["--file", "src/toy.mjs", "--find", find, "--replace", replace, ...more, ...STUB];
const toyBytes = (repo: string) => readFileSync(join(repo, "src/toy.mjs"));
const clean = (repo: string) => git(repo, "status", "--porcelain", "--untracked-files=all");
const pause = (ms: number) => new Promise((r) => setTimeout(r, ms));
const lockOf = (repo: string) => join(repo, ".git", "mutate.lock");

/** Starts the harness without waiting, for the tests that signal it or run a second one beside it. */
function startHarness(repo: string, args: string[], extra: Record<string, string> = {}) {
  const child = spawn(process.execPath, [HARNESS, ...args], { cwd: repo, env: env(repo, extra) });
  let out = "";
  child.stdout.on("data", (d) => (out += d));
  child.stderr.on("data", (d) => (out += d));
  const closed = new Promise<number | null>((done) => child.on("close", (code) => done(code)));
  return { child, closed, out: () => out };
}

describe("scripts/mutate.mjs: killed and survived, judged by the exit code", () => {
  it("killed: the runner exits non-zero with a failed test; exit 0; the file is restored byte for byte", () => {
    const repo = makeRepo();
    const r = harness(repo, one("a + b", "a - b"));
    expect(r.code).toBe(0);
    expect(line(r.stdout, "M1")).toMatch(/^M1\s+killed\s+exit 1\b.*src\/toy\.mjs/);
    expect(r.stdout).toMatch(/1 applied: 1 killed, 0 survived, 0 killed\?, 0 timeout; 0 not applied; 0 not run/);
    expect(toyBytes(repo).equals(Buffer.from(TOY))).toBe(true);
    expect(clean(repo)).toBe("");
    // One baseline run, the mutation's run, then the baseline again (it must still pass: repeatable tests).
    expect(runs(repo)).toEqual(["run", "run", "run"]);
    expect(existsSync(lockOf(repo))).toBe(false);
  });

  it("survived: the runner exits 0 on the mutated code; exit 1; the file is restored", () => {
    const repo = makeRepo();
    const r = harness(repo, one("n > 0", "n >= 0", "--note", "zero counts as positive"));
    expect(r.code).toBe(1);
    expect(line(r.stdout, "M1")).toMatch(/^M1\s+survived\s+exit 0\b.*src\/toy\.mjs.*zero counts as positive/);
    expect(r.stdout).toMatch(/1 applied: 0 killed, 1 survived, 0 killed\?, 0 timeout; 0 not applied; 0 not run/);
    expect(toyBytes(repo).equals(Buffer.from(TOY))).toBe(true);
    expect(clean(repo)).toBe("");
  });

  it("records the exit code, the duration and the last lines of output of each run (--json)", () => {
    const repo = makeRepo();
    const out = join(scratch, "one.json");
    const r = harness(repo, [...one("a + b", "a - b"), "--json", out, "--tail", "3"]);
    expect(r.code).toBe(0);
    const j = JSON.parse(readFileSync(out, "utf8"));
    expect(j.exitCode).toBe(0);
    expect(j.baseline).toHaveLength(1);
    expect(j.baseline[0]).toMatchObject({ command: ["node", "runner.mjs"], exit: 0, ok: true });
    expect(j.baselineAgain).toHaveLength(1);
    expect(j.baselineAgain[0]).toMatchObject({ command: ["node", "runner.mjs"], exit: 0, ok: true });
    expect(j.results).toHaveLength(1);
    const m = j.results[0];
    expect(m).toMatchObject({ id: "M1", file: "src/toy.mjs", find: "a + b", replace: "a - b", status: "killed", exit: 1 });
    expect(typeof m.durationMs).toBe("number");
    expect(m.durationMs).toBeGreaterThanOrEqual(0);
    expect(m.tail).toHaveLength(3);
    expect(m.tail[2]).toMatch(/Tests\s+1 failed \| 3 passed \(4\)/);
    // No --timeout: a run may take ten times its baseline, and never less than a minute.
    expect(m.timeoutMs).toBe(60_000);
  });
});

describe("scripts/mutate.mjs: killed? — a non-zero exit with no sign a test failed", () => {
  it("a runner that crashes (SIGKILL) is killed?, not killed; exit 1; the file is restored", () => {
    const repo = makeRepo();
    const r = harness(repo, one("a + b", "a + b /*CRASH*/"));
    expect(r.code).toBe(1);
    expect(line(r.stdout, "M1")).toMatch(/^M1\s+killed\?\s+SIGKILL\b/);
    expect(r.stdout).toMatch(/SIGKILL/);
    expect(r.stdout).toMatch(/1 applied: 0 killed, 0 survived, 1 killed\?/);
    expect(toyBytes(repo).equals(Buffer.from(TOY))).toBe(true);
    expect(clean(repo)).toBe("");
  });

  it('vitest\'s "No test files found" is killed? and says so', () => {
    const repo = makeRepo();
    const r = harness(repo, one("a + b", "a + b /*NOFILES*/"));
    expect(r.code).toBe(1);
    expect(line(r.stdout, "M1")).toMatch(/^M1\s+killed\?\s+exit 1\b/);
    expect(why(r.stdout, "M1")).toMatch(/vitest said "No test files found"/);
    expect(toyBytes(repo).equals(Buffer.from(TOY))).toBe(true);
  });

  it('vitest\'s "Tests  no tests" (a test file failed to load) is killed? and says so', () => {
    const repo = makeRepo();
    const r = harness(repo, one("a + b", "a + b /*NOLOAD*/"));
    expect(r.code).toBe(1);
    expect(line(r.stdout, "M1")).toMatch(/^M1\s+killed\?\s+exit 1\b/);
    expect(why(r.stdout, "M1")).toMatch(/failed to load/);
  });

  it("a runner that dies before any summary line (a syntax error the mutation made) is killed?", () => {
    const repo = makeRepo();
    const r = harness(repo, one("a + b", "a + "));
    expect(r.code).toBe(1);
    expect(line(r.stdout, "M1")).toMatch(/^M1\s+killed\?\s+exit 1\b/);
    expect(why(r.stdout, "M1")).toMatch(/no test summary/i);
    expect(toyBytes(repo).equals(Buffer.from(TOY))).toBe(true);
  });

  it("a runner killed by a signal after printing a failed test is still killed?: the exit code is not its verdict", () => {
    const repo = makeRepo();
    const r = harness(repo, one("a + b", "a + b /*FAILCRASH*/"));
    expect(r.code).toBe(1);
    expect(line(r.stdout, "M1")).toMatch(/^M1\s+killed\?\s+SIGKILL\b/);
    expect(why(r.stdout, "M1")).toMatch(/killed by SIGKILL/);
  });

  it("exit 1 with a summary that counts no failed test is killed?, not killed", () => {
    const repo = makeRepo();
    const r = harness(repo, one("a + b", "a + b /*EXIT1PASS*/"));
    expect(r.code).toBe(1);
    expect(line(r.stdout, "M1")).toMatch(/^M1\s+killed\?\s+exit 1\b/);
    expect(why(r.stdout, "M1")).toMatch(/counts no failed test: Tests\s+4 passed \(4\)/);
  });

  it('a failed Tests line is a clean kill even when the output also says "No test files found" (a test printed it)', () => {
    const repo = makeRepo();
    const r = harness(repo, one("a + b", "a - b /*NOISYFAIL*/"));
    expect(r.code).toBe(0);
    expect(line(r.stdout, "M1")).toMatch(/^M1\s+killed\s+exit 1\b/);
  });

  it("the runner's last Tests line decides, not a summary-like line a test printed before it", () => {
    const repo = makeRepo();
    const r = harness(repo, one("a + b", "a - b /*FAKESUMMARY*/"));
    expect(r.code).toBe(0);
    expect(line(r.stdout, "M1")).toMatch(/^M1\s+killed\s+exit 1\b/);
  });

  it("reads pytest's summary line too (for --cmd scripts/pytest-product.sh ...)", () => {
    const repo = makeRepo();
    const py = { PYTEST_STYLE: "1" };
    const killed = harness(repo, one("a + b", "a - b"), py);
    expect(killed.code).toBe(0);
    expect(line(killed.stdout, "M1")).toMatch(/^M1\s+killed\s+exit 1\b/);

    const noFailure = harness(repo, one("a + b", "a + b /*EXIT1PASS*/"), py);
    expect(noFailure.code).toBe(1);
    expect(why(noFailure.stdout, "M1")).toMatch(/counts no failed test: .*4 passed in 0\.12s/);

    const collection = harness(repo, one("a + b", "a + b /*NOLOAD*/"), py);
    expect(collection.code).toBe(1);
    expect(line(collection.stdout, "M1")).toMatch(/^M1\s+killed\?\s+exit 2\b/);
    expect(why(collection.stdout, "M1")).toMatch(/error during collection/);

    // A real failure whose output also quotes a collection-error line (a test printed it): the summary decides.
    const quoted = harness(repo, one("a + b", "a - b /*QUOTEINTERRUPT*/"), py);
    expect(quoted.code).toBe(0);
    expect(line(quoted.stdout, "M1")).toMatch(/^M1\s+killed\s+exit 1\b/);
  });

  it("exit 0 where no test ran (every test skipped) is survived, and says no test ran", () => {
    const repo = makeRepo();
    const r = harness(repo, one("a + b", "a + b /*SKIPPED*/"));
    expect(r.code).toBe(1);
    expect(line(r.stdout, "M1")).toMatch(/^M1\s+survived\s+exit 0\b/);
    expect(why(r.stdout, "M1")).toMatch(/no test ran|skipped/);
  });
});

describe("scripts/mutate.mjs: not applied — the edit must be exact", () => {
  it("zero matches: not applied, nothing runs, exit 2", () => {
    const repo = makeRepo();
    const r = harness(repo, one("a * b", "a / b"));
    expect(r.code).toBe(2);
    expect(line(r.stdout, "M1")).toMatch(/^M1\s+not applied\b/);
    expect(r.stdout).toMatch(/not found/);
    expect(r.stdout).toMatch(/0 applied: .*; 1 not applied/);
    expect(runs(repo)).toEqual([]);
    expect(toyBytes(repo).equals(Buffer.from(TOY))).toBe(true);
  });

  it("two matches: not applied and the count is named; --nth picks one; an --nth past the count is not applied", () => {
    const repo = makeRepo();
    const two = harness(repo, one("return ", "return !"));
    expect(two.code).toBe(2);
    expect(line(two.stdout, "M1")).toMatch(/not applied/);
    expect(two.stdout).toMatch(/found 2 times/);
    expect(runs(repo)).toEqual([]);

    // The second "return " is isPositive's: `return !n > 0` makes isPositive(1) false, and a test fails.
    const snap = join(scratch, "nth.snapshot");
    const second = harness(repo, one("return ", "return !", "--nth", "2"), { SNAPSHOT_SRC: "src/toy.mjs", SNAPSHOT_DST: snap });
    expect(second.code).toBe(0);
    expect(line(second.stdout, "M1")).toMatch(/^M1\s+killed\s+exit 1\b/);
    expect(readFileSync(`${snap}.2`, "utf8")).toBe(TOY.replace("return n > 0", "return !n > 0"));
    expect(toyBytes(repo).equals(Buffer.from(TOY))).toBe(true);

    const past = harness(repo, one("return ", "return !", "--nth", "3"));
    expect(past.code).toBe(2);
    expect(line(past.stdout, "M1")).toMatch(/not applied/);
  });

  it("a replacement identical to the text found: not applied, exit 2", () => {
    const repo = makeRepo();
    const r = harness(repo, one("a + b", "a + b"));
    expect(r.code).toBe(2);
    expect(line(r.stdout, "M1")).toMatch(/not applied/);
    expect(r.stdout).toMatch(/identical/);
    expect(runs(repo)).toEqual([]);
  });

  it("a path outside the repository, a directory and a missing file: not applied", () => {
    const repo = makeRepo();
    const outside = join(scratch, "outside.mjs");
    writeFileSync(outside, TOY);
    const r1 = harness(repo, ["--file", outside, "--find", "a + b", "--replace", "a - b", ...STUB]);
    expect(r1.code).toBe(2);
    expect(r1.stdout).toMatch(/outside the repository/);
    expect(readFileSync(outside, "utf8")).toBe(TOY);

    const r2 = harness(repo, ["--file", "src", "--find", "a + b", "--replace", "a - b", ...STUB]);
    expect(r2.code).toBe(2);
    expect(r2.stdout).toMatch(/not a regular file/);

    const r3 = harness(repo, ["--file", "src/nope.mjs", "--find", "a + b", "--replace", "a - b", ...STUB]);
    expect(r3.code).toBe(2);
    expect(r3.stdout).toMatch(/no such file/);
    expect(runs(repo)).toEqual([]);
  });
});

describe("scripts/mutate.mjs: the baseline comes first", () => {
  it("a failing baseline stops everything with exit 2: no mutation is applied, and the report and --json still come", () => {
    const repo = makeRepo();
    const out = join(scratch, "failing-baseline.json");
    const r = harness(repo, [...one("a + b", "a - b"), "--json", out], { RUNNER_FAILS: "1" });
    expect(r.code).toBe(2);
    expect(r.all).toMatch(/baseline/i);
    expect(r.all).toMatch(/proves nothing/);
    expect(r.stderr).not.toMatch(/TypeError/);
    expect(runs(repo)).toEqual(["run"]); // the baseline only
    expect(line(r.stdout, "M1")).toMatch(/^M1\s+not run\b/);
    expect(why(r.stdout, "M1")).toMatch(/baseline failed/);
    expect(r.stdout).toMatch(/0 applied: 0 killed, 0 survived, 0 killed\?, 0 timeout; 0 not applied; 1 not run/);
    const j = JSON.parse(readFileSync(out, "utf8"));
    expect(j.exitCode).toBe(2);
    expect(j.results[0]).toMatchObject({ id: "M1", status: "not run" });
    expect(toyBytes(repo).equals(Buffer.from(TOY))).toBe(true);
  });

  it("a baseline where every test was skipped fails (no test ran), whatever the command", () => {
    const repo = makeRepo();
    const r = harness(repo, one("a + b", "a - b"), { SKIPALL: "1" });
    expect(r.code).toBe(2);
    expect(r.all).toMatch(/baseline FAILED/);
    expect(r.all).toMatch(/skipped/);
    expect(runs(repo)).toEqual(["run"]);
  });

  it('a --cmd baseline that says "No test files found" fails even with exit 0 (vitest --passWithNoTests)', () => {
    const repo = makeRepo();
    const r = harness(repo, one("a + b", "a - b"), { NOFILES_OK: "1" });
    expect(r.code).toBe(2);
    expect(r.all).toMatch(/baseline FAILED/);
    expect(r.all).toMatch(/No test files found/);
    expect(runs(repo)).toEqual(["run"]);
  });

  it("a baseline past --timeout fails (exit 2): nothing is mutated", () => {
    const repo = makeRepo();
    const t0 = Date.now();
    const r = harness(repo, [...one("a + b", "a - b"), "--timeout", "2"], { HANGBASE: "1" });
    expect(Date.now() - t0).toBeLessThan(20_000);
    expect(r.code).toBe(2);
    expect(r.all).toMatch(/timed out after 2\.0s/);
    expect(line(r.stdout, "M1")).toMatch(/not run/);
    expect(runs(repo)).toEqual(["run"]);
    expect(toyBytes(repo).equals(Buffer.from(TOY))).toBe(true);
  }, 30_000);

  it("a baseline that changes the checkout stops with exit 2, naming the path: nothing is mutated", () => {
    const repo = makeRepo();
    const plan = writePlan(repo, [
      { file: "src/toy.mjs", find: "a + b", replace: "a - b" },
      { file: "src/toy2.mjs", find: '"hi "', replace: '"yo "' },
    ]);
    // The runner appends to toy2.mjs on every run: a later run would see what an earlier one left.
    const r = harness(repo, ["--plan", plan, ...STUB], { TOUCH_TOY2: "1" });
    expect(r.code).toBe(2);
    expect(r.stderr).toMatch(/changed the checkout/);
    expect(r.stderr).toContain("src/toy2.mjs");
    expect(line(r.stdout, "M1")).toMatch(/not run/);
    expect(line(r.stdout, "M2")).toMatch(/not run/);
    expect(runs(repo)).toEqual(["run"]);
    expect(toyBytes(repo).equals(Buffer.from(TOY))).toBe(true);
    expect(readFileSync(join(repo, "src/toy2.mjs"), "utf8")).not.toContain('"yo "');
  });

  it("runs the baseline again at the end: tests that fail the second time void every kill (exit 2)", () => {
    const repo = makeRepo();
    const mark = join(scratch, "stateful.mark");
    // A comment-only mutation: it cannot break a test, so its "kill" can only come from state an earlier run left.
    const r = harness(repo, one("return a + b;", "return a + b; // a comment, changed"), { STATEFUL_MARK: mark });
    expect(r.code).toBe(2);
    expect(line(r.stdout, "M1")).toMatch(/^M1\s+killed\?\s/);
    expect(why(r.stdout, "M1")).toMatch(/baseline failed when run again/);
    expect(r.all).toMatch(/not repeatable/);
    expect(runs(repo)).toEqual(["run", "run", "run"]);
    expect(toyBytes(repo).equals(Buffer.from(TOY))).toBe(true);
  });

  it("the default command is npx vitest run <test paths>; a vitest baseline with no Tests line stops with exit 2", () => {
    const repo = makeRepo();
    const r = harness(repo, ["--file", "src/toy.mjs", "--find", "a + b", "--replace", "a - b", "--test", "tests/toy.test.ts"]);
    expect(r.code).toBe(0);
    expect(runs(repo).filter((l) => l.startsWith("npx"))).toEqual([
      "npx vitest run tests/toy.test.ts",
      "npx vitest run tests/toy.test.ts",
      "npx vitest run tests/toy.test.ts",
    ]);

    const silent = makeRepo();
    const s = harness(silent, ["--file", "src/toy.mjs", "--find", "a + b", "--replace", "a - b", "--test", "t.test.ts"], {
      NPX_MODE: "silent",
    });
    expect(s.code).toBe(2);
    expect(s.all).toMatch(/baseline/i);
    expect(s.all).toMatch(/no test ran|no test summary/i);
    expect(runs(silent)).toEqual(["npx vitest run t.test.ts"]);
  });
});

describe("scripts/mutate.mjs: restore, always", () => {
  it("restores byte for byte, CRLF line ends and bytes that are not UTF-8 included", () => {
    const blob = Buffer.concat([Buffer.from("line one\r\nKEY=1\r\n"), Buffer.from([0xff, 0xfe, 0x00, 0x80]), Buffer.from("\r\nend")]);
    const repo = makeRepo({ "data/blob.bin": blob });
    const snap = join(scratch, "blob.snapshot");
    const r = harness(repo, ["--file", "data/blob.bin", "--find", "KEY=1", "--replace", "KEY=22", ...STUB], {
      SNAPSHOT_SRC: "data/blob.bin",
      SNAPSHOT_DST: snap,
    });
    // The runner does not read the blob, so the mutation survives; what matters is the bytes.
    expect(r.code).toBe(1);
    const mutated = Buffer.concat([Buffer.from("line one\r\nKEY=22\r\n"), Buffer.from([0xff, 0xfe, 0x00, 0x80]), Buffer.from("\r\nend")]);
    expect(readFileSync(`${snap}.2`).equals(mutated)).toBe(true);
    expect(readFileSync(join(repo, "data/blob.bin")).equals(blob)).toBe(true);
    expect(clean(repo)).toBe("");
  });

  it("exit 4, loudly, when the restore cannot bring the original back; the original bytes are saved elsewhere", () => {
    const repo = makeRepo();
    const r = harness(repo, [
      "--plan",
      writePlan(repo, [
        { file: "src/toy.mjs", find: "a + b", replace: "a + b /*CLOBBER*/" },
        { file: "src/toy2.mjs", find: '"hi "', replace: '"yo "' },
      ]),
      ...STUB,
    ]);
    expect(r.code).toBe(4);
    expect(r.stderr).toMatch(/RESTORE FAILED/);
    expect(r.stderr).toContain("git checkout -- src/toy.mjs");
    const saved = r.stderr.match(/original bytes saved to (\S+)/);
    expect(saved).not.toBeNull();
    expect(readFileSync(saved![1]).equals(Buffer.from(TOY))).toBe(true);
    // It stops there: the second mutation never ran (baseline + the first mutation only).
    expect(runs(repo)).toEqual(["run", "run"]);
    expect(readFileSync(join(repo, "src/toy2.mjs"), "utf8")).toBe(TOY2);
  });

  it.each([
    ["SIGTERM", 143],
    ["SIGINT", 130],
    ["SIGQUIT", 131],
  ] as const)("restores the file when the harness itself gets %s mid-run, and stops the runner", async (sig, expected) => {
    const repo = makeRepo();
    const mark = join(scratch, `hang-${sig}.pid`);
    const child = spawn(process.execPath, [HARNESS, ...one("a + b", "a + b /*HANG*/")], {
      cwd: repo,
      env: env(repo, { HANG_MARK: mark }),
    });
    let out = "";
    child.stdout.on("data", (d) => (out += d));
    child.stderr.on("data", (d) => (out += d));
    const closed = new Promise<number | null>((done) => child.on("close", (code) => done(code)));

    await waitFor(() => existsSync(mark) && readFileSync(mark, "utf8").length > 0, 20_000);
    // Mid-run: the mutation is on disk while the runner waits.
    expect(readFileSync(join(repo, "src/toy.mjs"), "utf8")).toContain("HANG");
    const runnerPid = Number(readFileSync(mark, "utf8"));
    child.kill(sig);
    const code = await closed;

    expect(code).toBe(expected);
    expect(toyBytes(repo).equals(Buffer.from(TOY))).toBe(true);
    expect(clean(repo)).toBe("");
    expect(out).toMatch(/restored/);
    // The runner itself was sent SIGTERM (a chance to clean up), not only killed later.
    expect(readFileSync(`${mark}.term`, "utf8")).toBe("SIGTERM");
    await waitFor(() => !alive(runnerPid), 5_000);
  }, 30_000);

  it("a runner that ignores SIGTERM is killed with SIGKILL, and the harness still exits after restoring", async () => {
    const repo = makeRepo();
    const mark = join(scratch, "hang-hard.pid");
    const child = spawn(process.execPath, [HARNESS, ...one("a + b", "a + b /*HANGHARD*/")], {
      cwd: repo,
      env: env(repo, { HANG_MARK: mark }),
    });
    const closed = new Promise<number | null>((done) => child.on("close", (code) => done(code)));
    await waitFor(() => existsSync(mark) && readFileSync(mark, "utf8").length > 0, 20_000);
    const runnerPid = Number(readFileSync(mark, "utf8"));
    child.kill("SIGTERM");
    expect(await closed).toBe(143);
    expect(toyBytes(repo).equals(Buffer.from(TOY))).toBe(true);
    await waitFor(() => !alive(runnerPid), 5_000);
  }, 30_000);

  it("on a signal it stops the runner before restoring: a runner that writes the file when told to stop cannot undo the restore", async () => {
    const repo = makeRepo();
    const mark = join(scratch, "hang-writeback.pid");
    const h = startHarness(repo, one("a + b", "a + b /*HANGWRITEBACK*/"), { HANG_MARK: mark });
    await waitFor(() => existsSync(mark) && readFileSync(mark, "utf8").length > 0, 20_000);
    h.child.kill("SIGINT");
    expect(await h.closed).toBe(130);
    expect(readFileSync(`${mark}.term`, "utf8")).toBe("SIGTERM"); // it did write, before the restore
    expect(toyBytes(repo).equals(Buffer.from(TOY))).toBe(true);
    expect(clean(repo)).toBe("");
  }, 30_000);

  it("a target an earlier run changed (an ignored file the checkout check cannot see) is not applied, not mutated from stale bytes", () => {
    const repo = makeRepo({ ".gitignore": "cache/\n" });
    mkdirSync(join(repo, "cache"));
    writeFileSync(join(repo, "cache/data.txt"), "data\n");
    const plan = writePlan(repo, [
      { file: "src/toy.mjs", find: "a + b", replace: "a - b /*TOUCHIGNORED*/" },
      { file: "cache/data.txt", find: "data", replace: "DATA" },
    ]);
    const r = harness(repo, ["--plan", plan, "--allow-dirty", ...STUB]);
    expect(r.code).toBe(2);
    expect(line(r.stdout, "M1")).toMatch(/^M1\s+killed\s/);
    expect(line(r.stdout, "M2")).toMatch(/not applied/);
    expect(why(r.stdout, "M2")).toMatch(/changed on disk/);
    expect(readFileSync(join(repo, "cache/data.txt"), "utf8")).toBe("data\nmore\n");
  });

  it("a mutation run that changes another file in the checkout stops everything with exit 4; the rest are not run", () => {
    const repo = makeRepo();
    const plan = writePlan(repo, [
      { file: "src/toy.mjs", find: "a + b", replace: "a - b /*TOUCHOTHER*/" },
      { file: "src/toy2.mjs", find: '"hi "', replace: '"yo "' },
    ]);
    const r = harness(repo, ["--plan", plan, ...STUB]);
    expect(r.code).toBe(4);
    expect(line(r.stdout, "M1")).toMatch(/^M1\s+killed\s/);
    expect(line(r.stdout, "M2")).toMatch(/^M2\s+not run\b/);
    expect(r.stderr).toMatch(/the run of M1 changed the checkout/);
    expect(r.stderr).toContain("src/toy2.mjs");
    expect(runs(repo)).toEqual(["run", "run"]);
    expect(toyBytes(repo).equals(Buffer.from(TOY))).toBe(true);
    expect(readFileSync(join(repo, "src/toy2.mjs"), "utf8")).not.toContain('"yo "');
  });
});

describe("scripts/mutate.mjs: nothing a run starts outlives it", () => {
  it("a run past --timeout is stopped with its whole process group and recorded as timeout (exit 1); the file is restored", () => {
    const repo = makeRepo();
    const mark = join(scratch, "loop.pid");
    const out = join(scratch, "loop.json");
    const t0 = Date.now();
    const r = harness(repo, [...one("a + b", "a + b /*LOOPFOREVER*/"), "--timeout", "2", "--json", out], { HANG_MARK: mark });
    expect(Date.now() - t0).toBeLessThan(20_000);
    expect(r.code).toBe(1);
    expect(line(r.stdout, "M1")).toMatch(/^M1\s+timeout\s/);
    expect(why(r.stdout, "M1")).toMatch(/2\.0s/);
    expect(r.stdout).toMatch(/1 applied: 0 killed, 0 survived, 0 killed\?, 1 timeout; 0 not applied; 0 not run/);
    expect(JSON.parse(readFileSync(out, "utf8")).results[0]).toMatchObject({ status: "timeout", timeoutMs: 2000 });
    expect(toyBytes(repo).equals(Buffer.from(TOY))).toBe(true);
    expect(clean(repo)).toBe("");
    expect(alive(Number(readFileSync(mark, "utf8")))).toBe(false);
  }, 30_000);

  it("does not wait on a leftover process that holds the runner's output: the group is killed when the runner exits", () => {
    const repo = makeRepo();
    const mark = join(scratch, "pipehold.pid");
    const t0 = Date.now();
    const r = harness(repo, one("a + b", "a - b /*PIPEHOLD*/"), { HANG_MARK: mark });
    expect(Date.now() - t0).toBeLessThan(15_000); // the leftover sleeps 30s
    expect(r.code).toBe(0);
    expect(line(r.stdout, "M1")).toMatch(/^M1\s+killed\s/);
    expect(toyBytes(repo).equals(Buffer.from(TOY))).toBe(true);
    expect(alive(Number(readFileSync(mark, "utf8")))).toBe(false);
  }, 60_000);

  it("finishes when the runner exits even if a process outside its group holds the output (a grace period, not for ever)", () => {
    const repo = makeRepo();
    const mark = join(scratch, "pipeescape.pid");
    const t0 = Date.now();
    try {
      const r = harness(repo, one("a + b", "a - b /*PIPEESCAPE*/"), { HANG_MARK: mark });
      expect(Date.now() - t0).toBeLessThan(15_000); // the escaped leftover sleeps 30s
      expect(r.code).toBe(0);
      expect(line(r.stdout, "M1")).toMatch(/^M1\s+killed\s/); // the summary printed before the exit was kept
      expect(toyBytes(repo).equals(Buffer.from(TOY))).toBe(true);
    } finally {
      try {
        process.kill(Number(readFileSync(mark, "utf8")), "SIGKILL");
      } catch {
        /* already gone */
      }
    }
  }, 60_000);

  it("a leftover process that would write the mutation back later is killed before the restore", async () => {
    const repo = makeRepo();
    const mark = join(scratch, "latewrite.pid");
    const r = harness(repo, one("a + b", "a - b /*LATEWRITE*/"), { HANG_MARK: mark });
    expect(r.code).toBe(0);
    await pause(3000); // the leftover would have written at 1.5s
    expect(toyBytes(repo).equals(Buffer.from(TOY))).toBe(true);
    expect(clean(repo)).toBe("");
    expect(alive(Number(readFileSync(mark, "utf8")))).toBe(false);
  }, 30_000);
});

describe("scripts/mutate.mjs: the restore writes the file, never through what replaced it", () => {
  it("a file the run deleted is recreated with its mode (an executable stays 100755)", () => {
    const repo = makeRepo({ "scripts/run.sh": "#!/bin/sh\necho hi\n" }, { "scripts/run.sh": 0o755 });
    const r = harness(repo, ["--file", "scripts/run.sh", "--find", "echo hi", "--replace", "echo DELETEME", ...STUB]);
    expect(r.code).toBe(1); // nothing tests run.sh: survived
    expect(line(r.stdout, "M1")).toMatch(/survived/);
    expect(readFileSync(join(repo, "scripts/run.sh"), "utf8")).toBe("#!/bin/sh\necho hi\n");
    expect(statSync(join(repo, "scripts/run.sh")).mode & 0o777).toBe(0o755);
    expect(clean(repo)).toBe("");
  });

  it("a file whose mode the run changed gets its mode back", () => {
    const repo = makeRepo();
    const r = harness(repo, one("a + b", "a + b /*CHMODX*/"));
    expect(r.code).toBe(1);
    expect(line(r.stdout, "M1")).toMatch(/survived/);
    expect(statSync(join(repo, "src/toy.mjs")).mode & 0o777).toBe(0o644);
    expect(clean(repo)).toBe("");
  });

  it("a file the run replaced with a symlink: the link is removed and the file recreated; the link's target is untouched", () => {
    const repo = makeRepo({ "src/other.txt": "other\n" });
    const r = harness(repo, one("a + b", "a + b /*SWAPLINK*/"));
    expect(r.code).toBe(1);
    expect(line(r.stdout, "M1")).toMatch(/survived/);
    expect(readFileSync(join(repo, "src/other.txt"), "utf8")).toBe("other\n");
    expect(lstatSync(join(repo, "src/toy.mjs")).isFile()).toBe(true);
    expect(toyBytes(repo).equals(Buffer.from(TOY))).toBe(true);
    expect(clean(repo)).toBe("");
  });

  it("a directory the run replaced with a link: exit 4, and nothing is written where the link points", () => {
    const repo = makeRepo();
    const r = harness(repo, one("a + b", "a + b /*SWAPDIR*/"));
    expect(r.code).toBe(4);
    expect(r.stderr).toMatch(/RESTORE FAILED/);
    expect(existsSync(join(repo, "elsewhere", "toy.mjs"))).toBe(false);
    const saved = r.stderr.match(/original bytes saved to (\S+)/);
    expect(readFileSync(saved![1]).equals(Buffer.from(TOY))).toBe(true);
  });

  it("bytes that are neither the original nor the mutation (an edit during the run) are left alone and saved: exit 4", () => {
    const repo = makeRepo();
    const r = harness(repo, one("a + b", "a + b /*EDITDURING*/"));
    expect(r.code).toBe(4);
    expect(r.stderr).toMatch(/RESTORE FAILED: src\/toy\.mjs: it changed during the run/);
    const now = readFileSync(join(repo, "src/toy.mjs"), "utf8");
    expect(now).toContain("EDITDURING");
    expect(now).toContain("// edited during the run");
    const saved = r.stderr.match(/original bytes saved to (\S+)/);
    expect(readFileSync(saved![1]).equals(Buffer.from(TOY))).toBe(true);
    const found = r.stderr.match(/bytes found there saved to (\S+)/);
    expect(readFileSync(found![1], "utf8")).toBe(now);
  });
});

describe("scripts/mutate.mjs: one run per checkout", () => {
  it("refuses to start while another mutate run holds the checkout's lock (exit 2, nothing runs, the lock is left)", () => {
    const repo = makeRepo();
    writeFileSync(lockOf(repo), `${process.pid}\n`);
    const r = harness(repo, one("a + b", "a - b"));
    expect(r.code).toBe(2);
    expect(r.stderr).toMatch(new RegExp(`another mutate run \\(pid ${process.pid}\\)`));
    expect(runs(repo)).toEqual([]);
    expect(readFileSync(lockOf(repo), "utf8")).toBe(`${process.pid}\n`);
  });

  it("takes over a lock whose process is gone, and removes its own lock when done", () => {
    const repo = makeRepo();
    const dead = spawnSync(process.execPath, ["-e", ""]).pid;
    writeFileSync(lockOf(repo), `${dead}\n`);
    const r = harness(repo, one("a + b", "a - b"));
    expect(r.code).toBe(0);
    expect(existsSync(lockOf(repo))).toBe(false);
  });

  it("a second run started while the first has a mutation on disk is refused, and the first finishes clean", async () => {
    const repo = makeRepo();
    const mark = join(scratch, "concurrent.pid");
    const first = startHarness(repo, one("a + b", "a + b /*HANG*/"), { HANG_MARK: mark });
    await waitFor(() => existsSync(mark) && readFileSync(mark, "utf8").length > 0, 20_000);
    const second = harness(repo, ["--file", "src/toy2.mjs", "--find", '"hi "', "--replace", '"yo "', ...STUB]);
    expect(second.code).toBe(2);
    expect(second.stderr).toMatch(/another mutate run/);
    first.child.kill("SIGTERM");
    expect(await first.closed).toBe(143);
    expect(toyBytes(repo).equals(Buffer.from(TOY))).toBe(true);
    expect(clean(repo)).toBe("");
  }, 30_000);
});

describe("scripts/mutate.mjs: git is the way back", () => {
  it("refuses a file with uncommitted changes (not applied, exit 2) and leaves the edit alone; --allow-dirty mutates it and restores the edit", () => {
    const repo = makeRepo();
    const dirty = TOY.replace("export function add", "// a local edit\nexport function add");
    writeFileSync(join(repo, "src/toy.mjs"), dirty);

    const r = harness(repo, one("a + b", "a - b"));
    expect(r.code).toBe(2);
    expect(line(r.stdout, "M1")).toMatch(/not applied/);
    expect(r.stdout).toMatch(/uncommitted changes/);
    expect(r.stdout).toMatch(/--allow-dirty/);
    expect(runs(repo)).toEqual([]);
    expect(readFileSync(join(repo, "src/toy.mjs"), "utf8")).toBe(dirty);

    const a = harness(repo, [...one("a + b", "a - b"), "--allow-dirty"]);
    expect(a.code).toBe(0);
    expect(line(a.stdout, "M1")).toMatch(/killed/);
    expect(readFileSync(join(repo, "src/toy.mjs"), "utf8")).toBe(dirty);
  });

  it("refuses a file git does not track", () => {
    const repo = makeRepo();
    writeFileSync(join(repo, "src/new.mjs"), "export const x = 1;\n");
    const r = harness(repo, ["--file", "src/new.mjs", "--find", "1", "--replace", "2", ...STUB]);
    expect(r.code).toBe(2);
    expect(r.stdout).toMatch(/not tracked by git/);
    expect(runs(repo)).toEqual([]);
  });

  it("reads the path literally, not as a glob: an ignored gen/[id].ts is not tracked just because gen/i.ts is", () => {
    const repo = makeRepo({ "gen/i.ts": "export const i = 1;\n", ".gitignore": "gen/\\[id\\].ts\n" });
    writeFileSync(join(repo, "gen/[id].ts"), "export const id = 1;\n");
    expect(clean(repo)).toBe(""); // ignored: git status says nothing about it
    const r = harness(repo, ["--file", "gen/[id].ts", "--find", "1", "--replace", "2", ...STUB]);
    expect(r.code).toBe(2);
    expect(r.stdout).toMatch(/not tracked by git/);
    expect(runs(repo)).toEqual([]);
    expect(readFileSync(join(repo, "gen/[id].ts"), "utf8")).toBe("export const id = 1;\n");
  });

  it("mutates a tracked file whose name looks like a glob (like Heebo[wght].ttf) even when the glob matches others too", () => {
    const repo = makeRepo({ "gen/[id].ts": "export const id = 1;\n", "gen/i.ts": "export const i = 1;\n", "gen/d.ts": "export const d = 1;\n" });
    const r = harness(repo, ["--file", "gen/[id].ts", "--find", "1", "--replace", "2", ...STUB]);
    expect(r.code).toBe(1); // applied; nothing tests it, so it survives
    expect(line(r.stdout, "M1")).toMatch(/^M1\s+survived\s/);
    expect(readFileSync(join(repo, "gen/[id].ts"), "utf8")).toBe("export const id = 1;\n");
    expect(clean(repo)).toBe("");
  });

  it("checks the bytes it read against git's index: a git status that says clean is not enough", () => {
    const repo = makeRepo();
    const dirty = `// a local edit\n${TOY}`;
    writeFileSync(join(repo, "src/toy.mjs"), dirty);
    // A git whose status always says clean (as a status taken a moment before another run's write would).
    const shim = join(scratch, "git-shim");
    mkdirSync(shim, { recursive: true });
    writeFileSync(join(shim, "git"), `#!/usr/bin/env bash\nfor a in "$@"; do [ "$a" = status ] && exit 0; done\nexec "${REAL_GIT}" "$@"\n`);
    chmodSync(join(shim, "git"), 0o755);
    const r = harness(repo, one("a + b", "a - b"), { PATH: `${shim}:${BIN}:${process.env.PATH}` });
    expect(r.code).toBe(2);
    expect(line(r.stdout, "M1")).toMatch(/not applied/);
    expect(why(r.stdout, "M1")).toMatch(/not what git has/);
    expect(runs(repo)).toEqual([]);
    expect(readFileSync(join(repo, "src/toy.mjs"), "utf8")).toBe(dirty);
  });
});

function writePlan(repo: string, plan: unknown): string {
  const p = join(repo, "..", `${repo.split("/").pop()}-plan.json`);
  writeFileSync(p, JSON.stringify(plan));
  return p;
}

describe("scripts/mutate.mjs: --plan", () => {
  it("runs several mutations across files in order, one baseline per distinct command, and writes --json", () => {
    const repo = makeRepo();
    const out = join(scratch, "plan.json.out");
    const plan = writePlan(repo, [
      { file: "src/toy.mjs", find: "a + b", replace: "a - b", note: "add subtracts" },
      { file: "src/toy.mjs", find: "n > 0", replace: "n >= 0", note: "zero is positive", id: "zero" },
      { file: "src/toy2.mjs", find: '"hi "', replace: '"yo "', test: "t2.test.ts", note: "greeting" },
    ]);
    const r = harness(repo, ["--plan", plan, "--json", out, ...STUB]);
    expect(r.code).toBe(1);
    expect(line(r.stdout, "M1")).toMatch(/^M1\s+killed\s+exit 1\b.*src\/toy\.mjs.*add subtracts/);
    expect(line(r.stdout, "zero")).toMatch(/^zero\s+survived\s+exit 0\b.*zero is positive/);
    expect(line(r.stdout, "M3")).toMatch(/^M3\s+killed\s+exit 1\b.*src\/toy2\.mjs.*greeting/);
    expect(r.stdout).toMatch(/3 applied: 2 killed, 1 survived, 0 killed\?, 0 timeout; 0 not applied; 0 not run/);
    // Two baselines (the test paths make a second command), the three mutations in order, then both baselines again.
    expect(runs(repo)).toEqual(["run", "run t2.test.ts", "run", "run", "run t2.test.ts", "run", "run t2.test.ts"]);
    const j = JSON.parse(readFileSync(out, "utf8"));
    expect(j.results.map((m: { id: string; status: string }) => [m.id, m.status])).toEqual([
      ["M1", "killed"],
      ["zero", "survived"],
      ["M3", "killed"],
    ]);
    expect(j.counts).toMatchObject({ applied: 3, killed: 2, survived: 1, "killed?": 0, "not applied": 0 });
    expect(j.exitCode).toBe(1);
    expect(toyBytes(repo).equals(Buffer.from(TOY))).toBe(true);
    expect(clean(repo)).toBe("");
  });

  it("runs the applicable mutations when one is not applied, and exits 2", () => {
    const repo = makeRepo();
    const plan = writePlan(repo, [
      { file: "src/toy.mjs", find: "a + b", replace: "a - b" },
      { file: "src/toy.mjs", find: "not in the file", replace: "x" },
    ]);
    const r = harness(repo, ["--plan", plan, ...STUB]);
    expect(r.code).toBe(2);
    expect(line(r.stdout, "M1")).toMatch(/killed/);
    expect(line(r.stdout, "M2")).toMatch(/not applied/);
    expect(runs(repo)).toEqual(["run", "run", "run"]);
  });

  it("keeps its exit code and still writes --json when its stdout is closed early (piped into head -n 1)", () => {
    const repo = makeRepo();
    const out = join(scratch, "epipe.json");
    const plan = writePlan(repo, [
      { file: "src/toy.mjs", find: "a + b", replace: "a - b" },
      { file: "src/toy2.mjs", find: '"hi "', replace: '"yo "' },
    ]);
    const cmd = `"${process.execPath}" "${HARNESS}" --plan "${plan}" --json "${out}" --cmd "node runner.mjs" | head -n 1 >/dev/null; exit \${PIPESTATUS[0]}`;
    const r = spawnSync("bash", ["-c", cmd], { cwd: repo, env: env(repo), encoding: "utf8" });
    expect(r.stderr).not.toMatch(/EPIPE/);
    expect(r.status).toBe(0);
    expect(JSON.parse(readFileSync(out, "utf8")).exitCode).toBe(0);
    expect(clean(repo)).toBe("");
  });
});

/**
 * --check (tick 51): the plans kept under src/__tests__/revenue/mutations/ are checked in CI without running a single
 * mutation, so a refactor that moves a find text fails until the plan is updated. It is step 2 alone: the file
 * tracked and unmodified, the find exactly once (or at nth), a replacement that differs, and the test paths present.
 * No lock, no baseline, no run.
 */
describe("scripts/mutate.mjs: --check runs the checks and nothing else", () => {
  const T = "t.test.ts";

  it("a plan whose every mutation would apply: exit 0, each id ok; no test runs, and no lock is taken", () => {
    const repo = makeRepo({ [T]: "" });
    // A live process holds the lock: a real run would be refused (exit 2); --check does not take it.
    writeFileSync(lockOf(repo), `${process.pid}\n`);
    const plan = writePlan(repo, [
      { file: "src/toy.mjs", find: "a + b", replace: "a - b", test: T, id: "add" },
      { file: "src/toy.mjs", find: "return ", replace: "return !", nth: 2, test: [T], id: "second" },
    ]);
    const r = harness(repo, ["--check", "--plan", plan]);
    expect(r.code).toBe(0);
    expect(line(r.stdout, "add")).toMatch(/^add\s+ok\b.*src\/toy\.mjs/);
    expect(line(r.stdout, "second")).toMatch(/^second\s+ok\b/);
    expect(r.stdout).toMatch(/--check: 2 of 2 would apply/);
    expect(runs(repo)).toEqual([]);
    expect(readFileSync(lockOf(repo), "utf8")).toBe(`${process.pid}\n`);
    expect(toyBytes(repo).equals(Buffer.from(TOY))).toBe(true);
    expect(clean(repo)).toBe("");
  });

  it("a stale find: exit 1, naming the id and why; the other entries are still checked; nothing runs", () => {
    const repo = makeRepo({ [T]: "" });
    const plan = writePlan(repo, [
      { file: "src/toy.mjs", find: "a + b", replace: "a - b", test: T, id: "fine" },
      { file: "src/toy.mjs", find: "a * b", replace: "a / b", test: T, id: "moved" },
    ]);
    const r = harness(repo, ["--check", "--plan", plan]);
    expect(r.code).toBe(1);
    expect(line(r.stdout, "fine")).toMatch(/^fine\s+ok\b/);
    expect(line(r.stdout, "moved")).toMatch(/^moved\s+would not apply: --find text not found in src\/toy\.mjs/);
    expect(r.stdout).toMatch(/--check: 1 of 2 would apply; 1 would not/);
    expect(runs(repo)).toEqual([]);
  });

  it("each step-2 check fails on its own: a missing test path, two matches, an identical replacement, a dirty file", () => {
    const repo = makeRepo({ [T]: "" });
    writeFileSync(join(repo, "src/toy2.mjs"), `${TOY2}// a local edit\n`);
    const plan = writePlan(repo, [
      { file: "src/toy.mjs", find: "a + b", replace: "a - b", test: [T, "gone.test.ts"], id: "notest" },
      { file: "src/toy.mjs", find: "return ", replace: "return !", test: T, id: "twice" },
      { file: "src/toy.mjs", find: "n > 0", replace: "n > 0", test: T, id: "same" },
      { file: "src/toy2.mjs", find: '"hi "', replace: '"yo "', test: T, id: "dirty" },
      { file: "src/toy.mjs", find: "n > 0", replace: "n >= 0", test: T, id: "good" },
    ]);
    const r = harness(repo, ["--check", "--plan", plan]);
    expect(r.code).toBe(1);
    expect(line(r.stdout, "notest")).toMatch(/would not apply: no such test path: gone\.test\.ts$/);
    expect(line(r.stdout, "twice")).toMatch(/would not apply: .*found 2 times/);
    expect(line(r.stdout, "same")).toMatch(/would not apply: .*identical/);
    expect(line(r.stdout, "dirty")).toMatch(/would not apply: .*uncommitted changes/);
    expect(line(r.stdout, "good")).toMatch(/^good\s+ok\b/);
    expect(r.stdout).toMatch(/--check: 1 of 5 would apply; 4 would not/);
    expect(runs(repo)).toEqual([]);
    // --allow-dirty is honoured as a real run would honour it.
    const dirtyOnly = writePlan(repo, [{ file: "src/toy2.mjs", find: '"hi "', replace: '"yo "', test: T, id: "dirty" }]);
    expect(harness(repo, ["--check", "--allow-dirty", "--plan", dirtyOnly]).code).toBe(0);
  });

  it("never runs the test command, even one whose baseline would fail; the single-mutation form too", () => {
    const repo = makeRepo();
    const real = harness(repo, one("a + b", "a - b"), { RUNNER_FAILS: "1" });
    expect(real.code).toBe(2); // the failing baseline a real run meets
    const before = runs(repo).length;
    const r = harness(repo, ["--check", ...one("a + b", "a - b")], { RUNNER_FAILS: "1" });
    expect(r.code).toBe(0);
    expect(line(r.stdout, "M1")).toMatch(/^M1\s+ok\b/);
    expect(runs(repo)).toHaveLength(before);
    const stale = harness(repo, ["--check", ...one("a * b", "a / b")], { RUNNER_FAILS: "1" });
    expect(stale.code).toBe(1);
    expect(line(stale.stdout, "M1")).toMatch(/would not apply/);
    expect(runs(repo)).toHaveLength(before);
  });

  it("under --cmd the test paths are the command's own arguments (pytest-product.sh reads them from the product), not checked", () => {
    const repo = makeRepo();
    const r = harness(repo, ["--check", ...one("a + b", "a - b", "--test", "tests/test_from_the_product.py")]);
    expect(r.code).toBe(0);
    expect(line(r.stdout, "M1")).toMatch(/^M1\s+ok\b/);
  });

  it("--json with --check is a usage error (exit 2): --check writes no JSON, so a path given is refused, not ignored", () => {
    const repo = makeRepo();
    const out = join(scratch, "check-out.json");
    const r = harness(repo, ["--check", ...one("a + b", "a - b"), "--json", out]);
    expect(r.code).toBe(2);
    expect(r.stderr).toMatch(/usage error: --check writes no --json/);
    expect(r.stdout).not.toMatch(/--check:/);
    expect(existsSync(out)).toBe(false);
    expect(runs(repo)).toEqual([]);
  });
});

describe("scripts/mutate.mjs: usage errors exit 2 and run nothing", () => {
  it.each([
    ["no arguments", []],
    ["an unknown flag", ["--bogus", ...STUB]],
    ["--find without --replace", ["--file", "src/toy.mjs", "--find", "a + b", ...STUB]],
    ["--replace without --file", ["--find", "a + b", "--replace", "a - b", ...STUB]],
    ["--plan mixed with --file", ["--plan", "p.json", "--file", "src/toy.mjs", ...STUB]],
    ["--nth 0", ["--file", "src/toy.mjs", "--find", "a + b", "--replace", "a - b", "--nth", "0", ...STUB]],
    ["the default command with no --test (it would run the whole suite)", ["--file", "src/toy.mjs", "--find", "a + b", "--replace", "a - b"]],
    ["an empty --cmd", ["--file", "src/toy.mjs", "--find", "a + b", "--replace", "a - b", "--cmd", " "]],
    ["the default command spelled out with no --test", ["--file", "src/toy.mjs", "--find", "a + b", "--replace", "a - b", "--cmd", "npx vitest run"]],
    ["--timeout 0", ["--file", "src/toy.mjs", "--find", "a + b", "--replace", "a - b", "--timeout", "0", ...STUB]],
    ["--json in a directory that does not exist", ["--file", "src/toy.mjs", "--find", "a + b", "--replace", "a - b", "--json", "/nonexistent-dir/out.json", ...STUB]],
  ])("%s", (_name, args) => {
    const repo = makeRepo();
    const r = harness(repo, args as string[]);
    expect(r.code).toBe(2);
    expect(r.stderr).toMatch(/usage/i);
    expect(runs(repo)).toEqual([]);
    expect(toyBytes(repo).equals(Buffer.from(TOY))).toBe(true);
  });

  it("a plan that is not JSON, or has an entry without replace, is a usage error naming it", () => {
    const repo = makeRepo();
    const bad = join(scratch, "bad-plan.json");
    writeFileSync(bad, "[{");
    expect(harness(repo, ["--plan", bad, ...STUB]).code).toBe(2);
    const noReplace = writePlan(repo, [{ file: "src/toy.mjs", find: "a + b", replace: "a - b" }, { file: "src/toy.mjs", find: "n > 0" }]);
    const r = harness(repo, ["--plan", noReplace, ...STUB]);
    expect(r.code).toBe(2);
    expect(r.stderr).toMatch(/entry 2/);
    expect(runs(repo)).toEqual([]);
  });

  it("outside a git repository", () => {
    const plain = join(scratch, "plain");
    mkdirSync(join(plain, "src"), { recursive: true });
    writeFileSync(join(plain, "src/toy.mjs"), TOY);
    const r = spawnSync(process.execPath, [HARNESS, "--file", "src/toy.mjs", "--find", "a + b", "--replace", "a - b", ...STUB], {
      cwd: plain,
      env: { ...process.env, ...gitEnv },
      encoding: "utf8",
    });
    expect(r.status).toBe(2);
    expect(r.stderr).toMatch(/git repository/);
    expect(readFileSync(join(plain, "src/toy.mjs"), "utf8")).toBe(TOY);
  });
});

async function waitFor(cond: () => boolean, ms: number): Promise<void> {
  const until = Date.now() + ms;
  while (!cond()) {
    if (Date.now() > until) throw new Error(`condition not met in ${ms}ms`);
    await new Promise((r) => setTimeout(r, 50));
  }
}

/** Alive and not a zombie (a killed child whose parent exited may linger as one until it is reaped). */
function alive(pid: number): boolean {
  try {
    const stat = readFileSync(`/proc/${pid}/stat`, "utf8");
    return stat.slice(stat.lastIndexOf(")") + 2)[0] !== "Z";
  } catch {
    return false;
  }
}
