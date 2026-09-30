import { spawnSync } from "node:child_process";
import { chmodSync, existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { afterAll, describe, expect, it } from "vitest";

/**
 * scripts/merge-worktree.sh, run for real: a scratch repository with a bare remote, a worktree branch, and stub
 * `pnpm`/`npx` on PATH whose typecheck and vitest exit as each test chooses. What must hold (review of tick 33):
 *   - a failing typecheck or test stops the merge before push: the remote is unchanged, the branch and its worktree
 *     are kept;
 *   - the verdict comes from the verify.sh that was on the current branch BEFORE the merge, not from the branch's own
 *     copy (a branch that replaces verify.sh with `echo passed; exit 0` must not pass itself), also on the re-run
 *     after a conflict ("already merged");
 *   - VERIFY_TYPECHECK_CMD / VERIFY_TEST_CMD in the caller's environment do not replace the real commands.
 * Nothing here touches the network; git runs with an empty global config (no signing, no hooks).
 */

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const MERGE = readFileSync(join(ROOT, "scripts", "merge-worktree.sh"), "utf8");
const VERIFY = readFileSync(join(ROOT, "scripts", "verify.sh"), "utf8");

const scratch = mkdtempSync(join(tmpdir(), "merge-worktree-test-"));
afterAll(() => rmSync(scratch, { recursive: true, force: true }));

const BIN = join(scratch, "bin");
mkdirSync(BIN, { recursive: true });
// Each stub appends its call to $STUB_LOG. typecheck exits $STUB_TC_EXIT; vitest prints a summary and exits $STUB_TEST_EXIT.
writeFileSync(
  join(BIN, "pnpm"),
  `#!/usr/bin/env bash
echo "pnpm $*" >> "$STUB_LOG"
case " $* " in
  *" install "*) exit 0 ;;
  *" typecheck "*) echo "typecheck stub"; exit "\${STUB_TC_EXIT:-0}" ;;
esac
exit 0
`,
);
writeFileSync(
  join(BIN, "npx"),
  `#!/usr/bin/env bash
echo "npx $*" >> "$STUB_LOG"
if [ "\${STUB_TEST_EXIT:-0}" = 0 ]; then echo " Test Files  1 passed (1)"; echo "      Tests  2 passed (2)";
else echo " Test Files  1 failed (1)"; echo "      Tests  1 failed | 1 passed (2)"; fi
exit "\${STUB_TEST_EXIT:-0}"
`,
);
chmodSync(join(BIN, "pnpm"), 0o755);
chmodSync(join(BIN, "npx"), 0o755);
const EMPTY_GITCONFIG = join(scratch, "gitconfig");
writeFileSync(EMPTY_GITCONFIG, "");

const baseEnv = (extra: Record<string, string> = {}): Record<string, string | undefined> => {
  const env: Record<string, string | undefined> = {
    ...process.env,
    PATH: `${BIN}:${process.env.PATH}`,
    GIT_CONFIG_GLOBAL: EMPTY_GITCONFIG,
    GIT_CONFIG_NOSYSTEM: "1",
    GIT_AUTHOR_NAME: "Test",
    GIT_AUTHOR_EMAIL: "test@example.invalid",
    GIT_COMMITTER_NAME: "Test",
    GIT_COMMITTER_EMAIL: "test@example.invalid",
    ...extra,
  };
  for (const k of ["VERIFY_OUT", "VERIFY_ROOT", "VERIFY_TYPECHECK_CMD", "VERIFY_TEST_CMD", "MERGE_TRAILERS"]) {
    if (!(k in extra)) delete env[k];
  }
  return env;
};

function git(cwd: string, args: string[], env = baseEnv()) {
  const r = spawnSync("git", args, { cwd, env, encoding: "utf8" });
  if (r.status !== 0) throw new Error(`git ${args.join(" ")} failed in ${cwd}: ${r.stderr}`);
  return r.stdout.trim();
}

let n = 0;
/**
 * A fresh setup: remote.git (bare), main/ (a clone on branch main with scripts/verify.sh and scripts/merge-worktree.sh
 * as in this checkout, pushed), and a worktree wt/ on branch `feature` with one commit. `branchVerify`, when given,
 * replaces scripts/verify.sh in the branch's commit.
 */
function setup(opts: { branchVerify?: string; mainVerify?: string | null } = {}) {
  n += 1;
  const dir = join(scratch, `case-${n}`);
  const remote = join(dir, "remote.git");
  const main = join(dir, "main");
  const wt = join(dir, "wt");
  mkdirSync(dir, { recursive: true });
  git(dir, ["init", "-q", "--bare", "-b", "main", remote]);
  git(dir, ["clone", "-q", remote, main]);
  git(main, ["checkout", "-q", "-B", "main"]);
  mkdirSync(join(main, "scripts"), { recursive: true });
  writeFileSync(join(main, "scripts", "merge-worktree.sh"), MERGE);
  chmodSync(join(main, "scripts", "merge-worktree.sh"), 0o755);
  if (opts.mainVerify !== null) {
    writeFileSync(join(main, "scripts", "verify.sh"), opts.mainVerify ?? VERIFY);
    chmodSync(join(main, "scripts", "verify.sh"), 0o755);
  }
  writeFileSync(join(main, "README.md"), "base\n");
  git(main, ["add", "-A"]);
  git(main, ["commit", "-q", "-m", "base"]);
  git(main, ["push", "-q", "-u", "origin", "main"]);
  git(main, ["worktree", "add", "-q", wt, "-b", "feature"]);
  writeFileSync(join(wt, "feature.txt"), "the branch's work\n");
  if (opts.branchVerify !== undefined) {
    mkdirSync(join(wt, "scripts"), { recursive: true });
    writeFileSync(join(wt, "scripts", "verify.sh"), opts.branchVerify);
    chmodSync(join(wt, "scripts", "verify.sh"), 0o755);
  }
  git(wt, ["add", "-A"]);
  git(wt, ["commit", "-q", "-m", "feature work"]);
  const stubLog = join(dir, "stub.log");
  const remoteHead = () => git(dir, ["--git-dir", remote, "rev-parse", "refs/heads/main"]);
  const branchExists = () => spawnSync("git", ["rev-parse", "--verify", "-q", "refs/heads/feature"], { cwd: main, env: baseEnv() }).status === 0;
  return { dir, remote, main, wt, stubLog, remoteHead, branchExists };
}

function merge(s: ReturnType<typeof setup>, stubs: { tc?: number; tests?: number }, extra: Record<string, string> = {}) {
  const env = baseEnv({ STUB_LOG: s.stubLog, STUB_TC_EXIT: String(stubs.tc ?? 0), STUB_TEST_EXIT: String(stubs.tests ?? 0), ...extra });
  const r = spawnSync("bash", [join(s.main, "scripts", "merge-worktree.sh"), "feature", "Merge feature"], { cwd: s.main, env, encoding: "utf8" });
  const calls = existsSync(s.stubLog) ? readFileSync(s.stubLog, "utf8").trim().split("\n") : [];
  return { code: r.status, all: r.stdout + r.stderr, calls };
}

const GUTTED = '#!/usr/bin/env bash\necho "verify: passed"\nexit 0\n';

describe("scripts/merge-worktree.sh stops before push when verification fails", () => {
  it.each([
    ["the tests fail", { tests: 1 }],
    ["typecheck fails", { tc: 2 }],
  ])("%s: exit non-zero, remote unchanged, branch and worktree kept", (_label, stubs) => {
    const s = setup();
    const before = s.remoteHead();
    const r = merge(s, stubs);
    expect(r.code).not.toBe(0);
    expect(r.all).toMatch(/verify: FAILED/);
    expect(s.remoteHead()).toBe(before);
    expect(s.branchExists()).toBe(true);
    expect(existsSync(s.wt)).toBe(true);
    expect(r.all).not.toMatch(/== push/);
  });

  it("passes, pushes and cleans up when typecheck and tests pass", () => {
    const s = setup();
    const before = s.remoteHead();
    const r = merge(s, {});
    expect(r.code).toBe(0);
    expect(r.all).toMatch(/verify: passed/);
    expect(s.remoteHead()).not.toBe(before);
    expect(s.branchExists()).toBe(false);
    expect(existsSync(s.wt)).toBe(false);
    // The real commands ran, once each, after the install: install, typecheck, vitest.
    expect(r.calls.map((c) => c.split(" ").slice(0, 2).join(" "))).toEqual(["pnpm install", "pnpm -s", "npx vitest"]);
    expect(r.calls[2]).toBe("npx vitest run src/__tests__/revenue");
  });

  it("no longer runs vitest itself, nor decides anything from a grep", () => {
    expect(MERGE).not.toMatch(/npx vitest/);
    expect(MERGE).not.toMatch(/\|\s*grep[^\n]*\|\|\s*true/);
  });
});

describe("the branch being merged does not judge itself", () => {
  it("a branch that replaces verify.sh with `echo passed; exit 0` is still judged by the pre-merge verify.sh", () => {
    const s = setup({ branchVerify: GUTTED });
    const before = s.remoteHead();
    const r = merge(s, { tc: 2, tests: 1 });
    expect(r.code).not.toBe(0);
    expect(r.all).toMatch(/verify: FAILED: typecheck \(exit 2\), tests \(exit 1\)/);
    expect(s.remoteHead()).toBe(before);
    expect(s.branchExists()).toBe(true);
    // The merged tree does carry the branch's copy; it just was not the one that ran.
    expect(readFileSync(join(s.main, "scripts", "verify.sh"), "utf8")).toBe(GUTTED);
  });

  it("on the re-run after a conflict (already merged), the verify.sh from before the merge still judges", () => {
    const s = setup({ branchVerify: GUTTED });
    const before = s.remoteHead();
    git(s.main, ["merge", "-q", "--no-ff", "feature", "-m", "Merge feature (resolved by hand)"]);
    const r = merge(s, { tests: 1 });
    expect(r.all).toMatch(/already merged/);
    expect(r.code).not.toBe(0);
    expect(r.all).toMatch(/verify: FAILED: tests \(exit 1\)/);
    expect(s.remoteHead()).toBe(before);
    expect(s.branchExists()).toBe(true);
  });

  it("the merge that first adds verify.sh (none before it) runs the merged copy and says so", () => {
    const s = setup({ mainVerify: null, branchVerify: VERIFY });
    const r = merge(s, { tests: 1 });
    expect(r.all).toMatch(/no scripts\/verify\.sh before this merge/);
    expect(r.code).not.toBe(0);
    expect(r.all).toMatch(/verify: FAILED: tests \(exit 1\)/);
  });
});

describe("the caller's environment cannot replace the real commands", () => {
  it("VERIFY_TYPECHECK_CMD=true VERIFY_TEST_CMD=true in the environment: the real typecheck and vitest still run and fail", () => {
    const s = setup();
    const before = s.remoteHead();
    const r = merge(s, { tc: 2, tests: 1 }, { VERIFY_TYPECHECK_CMD: "true", VERIFY_TEST_CMD: "true", VERIFY_OUT: "/proc/self" });
    expect(r.code).not.toBe(0);
    expect(r.calls.some((c) => /^pnpm .*typecheck/.test(c))).toBe(true);
    expect(r.calls.some((c) => /^npx vitest run/.test(c))).toBe(true);
    expect(r.all).toMatch(/verify: FAILED: typecheck \(exit 2\), tests \(exit 1\)/);
    expect(s.remoteHead()).toBe(before);
  });
});
