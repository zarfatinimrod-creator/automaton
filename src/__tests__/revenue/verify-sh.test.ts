import { spawnSync } from "node:child_process";
import { chmodSync, existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { afterAll, describe, expect, it } from "vitest";

/**
 * scripts/verify.sh — the check a contributor runs before pushing: typecheck, then the vitest paths (default
 * src/__tests__/revenue), each with its full output in a log file and its own exit code recorded. Two pushes of failing
 * tests on this project came from `npx vitest ... | grep ...`, which returns grep's status, not the tests'. So a pass
 * here comes only from the runners' exit codes, never from a grep of their output: the stubs below print a passing
 * summary and exit 1, and verify.sh must still fail. The output may only veto a pass (review of tick 33): an exit-0
 * test step with no "Tests" line, or with a summary that says "failed", fails too, so a verify.sh broken to ignore
 * the exit code still fails on the suite that tests it.
 */

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const SCRIPT = join(ROOT, "scripts", "verify.sh");

const scratch = mkdtempSync(join(tmpdir(), "verify-sh-test-"));
afterAll(() => rmSync(scratch, { recursive: true, force: true }));

let n = 0;
/** A stub command: prints `output`, records its arguments in <n>.args and its working directory in <n>.pwd, exits `code`. */
function stub(output: string, code: number): { cmd: string; argsFile: string; pwdFile: string } {
  n += 1;
  const path = join(scratch, `stub-${n}.sh`);
  const argsFile = join(scratch, `stub-${n}.args`);
  const pwdFile = join(scratch, `stub-${n}.pwd`);
  writeFileSync(
    path,
    `#!/usr/bin/env bash\nprintf '%s\\n' "$@" > '${argsFile}'\npwd > '${pwdFile}'\ncat <<'OUT'\n${output}\nOUT\nexit ${code}\n`,
  );
  chmodSync(path, 0o755);
  return { cmd: `bash ${path}`, argsFile, pwdFile };
}

const PASSING_SUMMARY = [
  " ✓ src/__tests__/revenue/a.test.ts (4 tests) 12ms",
  "",
  " Test Files  3 passed (3)",
  "      Tests  10 passed (10)",
  "   Start at  12:00:00",
].join("\n");

function run(
  typecheck: { cmd: string },
  tests: { cmd: string },
  args: string[] = [],
  out?: string,
  opts: { script?: string; extraEnv?: Record<string, string> } = {},
) {
  const env: Record<string, string | undefined> = {
    ...process.env,
    VERIFY_TYPECHECK_CMD: typecheck.cmd,
    VERIFY_TEST_CMD: tests.cmd,
    ...(opts.extraEnv ?? {}),
  };
  if (out) env.VERIFY_OUT = out;
  else delete env.VERIFY_OUT;
  if (!opts.extraEnv?.VERIFY_ROOT) delete env.VERIFY_ROOT;
  const r = spawnSync("bash", [opts.script ?? SCRIPT, ...args], { cwd: ROOT, env, encoding: "utf8" });
  return { code: r.status, stdout: r.stdout, stderr: r.stderr, all: r.stdout + r.stderr };
}

describe("scripts/verify.sh", () => {
  it("exits 0 when typecheck and tests both exit 0, and shows the Test Files and Tests lines", () => {
    const out = join(scratch, "out-pass");
    const r = run(stub("tsc: fine", 0), stub(PASSING_SUMMARY, 0), [], out);
    expect(r.code).toBe(0);
    expect(r.stdout).toContain("Test Files  3 passed (3)");
    expect(r.stdout).toContain("Tests  10 passed (10)");
    // Full output of each runner is kept, and the summary names where.
    expect(readFileSync(join(out, "typecheck.log"), "utf8")).toContain("tsc: fine");
    expect(readFileSync(join(out, "tests.log"), "utf8")).toContain("✓ src/__tests__/revenue/a.test.ts");
    expect(r.stdout).toContain(join(out, "typecheck.log"));
    expect(r.stdout).toContain(join(out, "tests.log"));
  });

  it("fails when the test runner PRINTS a passing summary but exits 1 (the grep-in-a-pipe failure mode)", () => {
    const r = run(stub("tsc: fine", 0), stub(PASSING_SUMMARY, 1), [], join(scratch, "out-liar"));
    expect(r.code).not.toBe(0);
    // The summary is still printed before the verdict, and the verdict names the step.
    expect(r.stdout).toContain("Tests  10 passed (10)");
    expect(r.all).toMatch(/FAILED: tests \(exit 1\)/);
    expect(r.all).not.toMatch(/FAILED:.*typecheck/);
  });

  it("fails when typecheck fails and the tests pass, names typecheck, and still runs the tests", () => {
    const out = join(scratch, "out-tc");
    const tests = stub(PASSING_SUMMARY, 0);
    const r = run(stub("src/x.ts(1,1): error TS2322: Type 'string' is not assignable", 2), tests, [], out);
    expect(r.code).not.toBe(0);
    expect(r.all).toMatch(/FAILED: typecheck \(exit 2\)/);
    expect(r.all).not.toMatch(/FAILED:.*tests/);
    expect(existsSync(join(out, "tests.log"))).toBe(true);
    expect(r.stdout).toContain("error TS2322");
  });

  it("names both steps when both fail", () => {
    const r = run(stub("error TS1", 1), stub("boom", 3), [], join(scratch, "out-both"));
    expect(r.code).not.toBe(0);
    expect(r.all).toMatch(/FAILED: typecheck \(exit 1\), tests \(exit 3\)/);
  });

  it("runs src/__tests__/revenue by default and passes extra arguments through as the test paths", () => {
    const def = stub(PASSING_SUMMARY, 0);
    expect(run(stub("", 0), def, [], join(scratch, "out-def")).code).toBe(0);
    expect(readFileSync(def.argsFile, "utf8").trim()).toBe("src/__tests__/revenue");

    const given = stub(PASSING_SUMMARY, 0);
    const paths = ["src/__tests__/revenue/a.test.ts", "src/__tests__/revenue/b.test.ts"];
    expect(run(stub("", 0), given, paths, join(scratch, "out-given")).code).toBe(0);
    expect(readFileSync(given.argsFile, "utf8").trim().split("\n")).toEqual(paths);
  });

  it("makes a fresh output directory when VERIFY_OUT is unset and prints where the logs are", () => {
    const r = run(stub("tsc: fine", 0), stub(PASSING_SUMMARY, 0));
    expect(r.code).toBe(0);
    const m = r.stdout.match(/(\S+\/tests\.log)/);
    expect(m).not.toBeNull();
    expect(readFileSync(m![1], "utf8")).toContain("Tests  10 passed (10)");
    rmSync(dirname(m![1]), { recursive: true, force: true });
  });

  it("says so when the test log has no summary line, instead of printing nothing", () => {
    const r = run(stub("", 0), stub("Error: cannot find module vitest", 1), [], join(scratch, "out-nosum"));
    expect(r.code).not.toBe(0);
    expect(r.stdout).toMatch(/no "Test Files" or "Tests" line/);
  });

  // Review of tick 33: a pass may only come from exit codes, but a grep may veto one.
  it("a test step that exits 0 and prints no Tests summary line fails: nothing shows any test ran", () => {
    const r = run(stub("tsc: fine", 0), stub("", 0), [], join(scratch, "out-silent"));
    expect(r.code).toBe(1);
    expect(r.all).toMatch(/FAILED: tests \(exit 0, but no "Tests" summary line/);
    expect(r.all).not.toMatch(/verify: passed/);
  });

  it("a Tests or Test Files line that says failed vetoes an exit-0 run (a broken runner or a broken verify.sh)", () => {
    const failedButZero = [" Test Files  1 failed | 2 passed (3)", "      Tests  3 failed | 6 passed (9)"].join("\n");
    const r = run(stub("tsc: fine", 0), stub(failedButZero, 0), [], join(scratch, "out-veto"));
    expect(r.code).toBe(1);
    expect(r.all).toMatch(/FAILED: tests \(exit 0, but the summary says failed\)/);
  });

  it("a command override of only spaces is a usage error (exit 2), not a step that 'exited 0'; nothing runs", () => {
    for (const env of [{ VERIFY_TYPECHECK_CMD: " " }, { VERIFY_TEST_CMD: "   " }]) {
      const tc = stub("tsc: fine", 0);
      const tests = stub(PASSING_SUMMARY, 0);
      const r = run(tc, tests, [], join(scratch, `out-empty-${n}`), { extraEnv: env });
      expect(r.code).toBe(2);
      expect(r.all).toMatch(/empty/);
      expect(r.all).not.toMatch(/verify: passed/);
      expect(existsSync(tc.argsFile)).toBe(false);
      expect(existsSync(tests.argsFile)).toBe(false);
    }
  });

  it("each step's header names the command that actually ran", () => {
    const tc = stub("tsc: fine", 0);
    const tests = stub(PASSING_SUMMARY, 0);
    const r = run(tc, tests, [], join(scratch, "out-cmd"));
    expect(r.code).toBe(0);
    expect(r.stdout).toContain(`== typecheck (${tc.cmd}): exit 0`);
    expect(r.stdout).toContain(`== tests (${tests.cmd} src/__tests__/revenue): exit 0`);
  });

  it("when the logs cannot be written it says so and exits 2 before running anything (no step is misnamed)", () => {
    const tc = stub("tsc: fine", 0);
    const tests = stub(PASSING_SUMMARY, 0);
    const r = run(tc, tests, [], "/proc/self");
    expect(r.code).toBe(2);
    expect(r.all).toMatch(/verify: cannot write logs in \/proc\/self/);
    expect(r.all).not.toMatch(/== typecheck/);
    expect(existsSync(tc.argsFile)).toBe(false);
  });

  it("VERIFY_ROOT names the checkout to verify, so a copy of verify.sh kept elsewhere checks that tree", () => {
    const elsewhere = join(scratch, "trusted-copy");
    rmSync(elsewhere, { recursive: true, force: true });
    mkdirSync(elsewhere, { recursive: true });
    writeFileSync(join(elsewhere, "verify.sh"), readFileSync(SCRIPT, "utf8"));
    const tree = join(scratch, "tree-to-verify");
    mkdirSync(tree, { recursive: true });
    const tc = stub("tsc: fine", 0);
    const tests = stub(PASSING_SUMMARY, 0);
    const r = run(tc, tests, [], join(scratch, "out-root"), { script: join(elsewhere, "verify.sh"), extraEnv: { VERIFY_ROOT: tree } });
    expect(r.code).toBe(0);
    expect(readFileSync(tc.pwdFile, "utf8").trim()).toBe(tree);
    expect(readFileSync(tests.pwdFile, "utf8").trim()).toBe(tree);
    expect(r.stdout).toContain(`verify: checking ${tree}`);
  });
});

// merge-worktree.sh's use of verify.sh is tested by running it: merge-worktree.test.ts.
