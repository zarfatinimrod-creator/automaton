import { spawnSync } from "node:child_process";
import { chmodSync, existsSync, lstatSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, readlinkSync, realpathSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { afterAll, describe, expect, it } from "vitest";

/**
 * scripts/sim-tree.sh — run a command in a throwaway copy of the checkout at a ref. Ticks 48, 49 and 50 each had a
 * builder, a reviewer and a fixer rebuild the same tree by hand (`git archive | tar -x`, `git init`, a commit, a link
 * to node_modules) to simulate a command that writes for real (`remask-captures.mjs --apply`, `freeze-capture.mjs
 * --apply`). What must hold:
 *   - the tree is the ref's committed files, never the checkout's uncommitted or untracked ones;
 *   - it is a git repository of its own with one commit naming the ref and its sha, and node_modules is a link to the
 *     checkout's (none when the checkout has none);
 *   - the command runs in the tree with SIM_TREE set, and its exit code is sim-tree's;
 *   - the tree is removed after a pass, kept (and its path printed) after a failure or with --keep;
 *   - a refusal (no repository, an unknown ref, an existing or in-repository --dir, no command) exits 2 having created
 *     nothing;
 *   - whatever the command does inside the tree, the checkout's `git status` is byte for byte what it was.
 * Everything runs on scratch repositories built here, except one read-only run on the real checkout.
 */

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const SCRIPT = join(ROOT, "scripts", "sim-tree.sh");

const scratch = realpathSync(mkdtempSync(join(tmpdir(), "sim-tree-test-")));
afterAll(() => rmSync(scratch, { recursive: true, force: true }));

const EMPTY_GITCONFIG = join(scratch, "gitconfig");
writeFileSync(EMPTY_GITCONFIG, "");
// No global identity: sim-tree must pass its own (-c user.name/-c user.email) for the tree's commit.
const gitEnv = { GIT_CONFIG_GLOBAL: EMPTY_GITCONFIG, GIT_CONFIG_NOSYSTEM: "1", GIT_CEILING_DIRECTORIES: scratch };
const who = ["-c", "user.name=toy", "-c", "user.email=toy", "-c", "commit.gpgsign=false"];

function git(cwd: string, ...args: string[]): string {
  const r = spawnSync("git", args, { cwd, env: { ...process.env, ...gitEnv }, encoding: "utf8" });
  if (r.status !== 0) throw new Error(`git ${args.join(" ")}: ${r.stderr}`);
  return r.stdout;
}

let made = 0;
/**
 * A scratch repository: file.txt "v1" (tagged v1), then "v2" (HEAD), then an uncommitted "dirty" edit and an
 * untracked file; a fake node_modules directory unless `noModules`. Each one gets its own TMPDIR, so a test can see
 * that nothing was left in it.
 */
function makeRepo(opts: { noModules?: boolean } = {}) {
  made += 1;
  const base = join(scratch, `case-${made}`);
  const repo = join(base, "repo");
  const tmp = join(base, "tmp");
  mkdirSync(repo, { recursive: true });
  mkdirSync(tmp, { recursive: true });
  git(repo, "init", "-q");
  writeFileSync(join(repo, "file.txt"), "v1\n");
  writeFileSync(join(repo, ".gitignore"), "node_modules\n");
  git(repo, "add", "-A");
  git(repo, ...who, "commit", "-q", "-m", "one");
  git(repo, "tag", "v1");
  const v1 = git(repo, "rev-parse", "HEAD").trim();
  writeFileSync(join(repo, "file.txt"), "v2\n");
  git(repo, ...who, "commit", "-q", "-am", "two");
  const v2 = git(repo, "rev-parse", "HEAD").trim();
  writeFileSync(join(repo, "file.txt"), "dirty\n");
  writeFileSync(join(repo, "untracked.txt"), "not committed\n");
  if (!opts.noModules) {
    mkdirSync(join(repo, "node_modules", "fake-dep"), { recursive: true });
    writeFileSync(join(repo, "node_modules", "fake-dep", "index.js"), "module.exports = 1;\n");
  }
  return { repo, tmp, v1, v2 };
}

function sim(cwd: string, tmp: string, args: string[]) {
  const r = spawnSync("bash", [SCRIPT, ...args], { cwd, env: { ...process.env, ...gitEnv, TMPDIR: tmp }, encoding: "utf8" });
  return { code: r.status, stdout: r.stdout, stderr: r.stderr };
}

/** The tree path sim-tree printed before the command. */
function treeOf(stderr: string): string {
  const m = /^sim-tree: tree (\/\S+)$/m.exec(stderr);
  if (!m) throw new Error(`no "sim-tree: tree <path>" line in:\n${stderr}`);
  return m[1];
}

const status = (repo: string) => git(repo, "status", "--porcelain", "--untracked-files=all");
const sh = (script: string) => ["--", "bash", "-c", script];

describe("scripts/sim-tree.sh: the tree", () => {
  it("holds the ref's committed files, not the checkout's uncommitted edit or untracked file", () => {
    const { repo, tmp } = makeRepo();
    const head = sim(repo, tmp, sh("cat file.txt; ls"));
    expect(head.code).toBe(0);
    expect(head.stdout).toMatch(/^v2\n/);
    expect(head.stdout).not.toContain("dirty");
    expect(head.stdout).not.toContain("untracked.txt");
    const old = sim(repo, tmp, ["--ref", "v1", ...sh("cat file.txt")]);
    expect(old.code).toBe(0);
    expect(old.stdout).toBe("v1\n");
  });

  it("is a repository of its own whose one commit names the ref and its sha, with a clean status", () => {
    const { repo, tmp, v1, v2 } = makeRepo();
    const r = sim(repo, tmp, ["--ref", "v1", ...sh("git log --format=%s; echo ---; git status --porcelain --untracked-files=all")]);
    expect(r.code).toBe(0);
    const [log, st] = r.stdout.split("---\n");
    const subjects = log.trim().split("\n");
    expect(subjects).toHaveLength(1);
    expect(subjects[0]).toContain("v1");
    expect(subjects[0]).toContain(v1);
    expect(subjects[0]).not.toContain(v2);
    // The node_modules link is not an untracked file in the tree.
    expect(st).toBe("");
    expect(r.stderr).toContain(`sim-tree: from v1 at ${v1}`);
  });

  it("commits every tracked file, one .gitignore matches (force-added) too, and the node_modules link is never untracked", () => {
    const { repo, tmp } = makeRepo();
    // A .gitignore that does not name node_modules, and a tracked file it does name.
    writeFileSync(join(repo, ".gitignore"), "build/\n");
    mkdirSync(join(repo, "build"));
    writeFileSync(join(repo, "build", "kept.txt"), "forced\n");
    git(repo, "add", "-f", ".gitignore", "build/kept.txt");
    git(repo, ...who, "commit", "-q", "-m", "three");
    const r = sim(repo, tmp, sh("git ls-files; echo ---; git status --porcelain --untracked-files=all; [ -L node_modules ] && echo linked"));
    expect(r.code).toBe(0);
    const [files, rest] = r.stdout.split("---\n");
    expect(files.split("\n").filter(Boolean).sort()).toEqual([".gitignore", "build/kept.txt", "file.txt"]);
    expect(rest).toBe("linked\n");
  });

  it("links node_modules to the checkout's, and has none when the checkout has none", () => {
    const { repo, tmp } = makeRepo();
    const r = sim(repo, tmp, sh('readlink node_modules; [ -L node_modules ] && cat node_modules/fake-dep/index.js'));
    expect(r.code).toBe(0);
    expect(r.stdout).toBe(`${join(realpathSync(repo), "node_modules")}\nmodule.exports = 1;\n`);
    const bare = makeRepo({ noModules: true });
    const n = sim(bare.repo, bare.tmp, sh("[ -e node_modules ] || [ -L node_modules ]; echo $?"));
    expect(n.code).toBe(0);
    expect(n.stdout).toBe("1\n");
  });

  it("runs the command in the tree, with SIM_TREE set to it", () => {
    const { repo, tmp } = makeRepo();
    const r = sim(repo, tmp, sh('pwd -P; echo "$SIM_TREE"'));
    expect(r.code).toBe(0);
    const tree = treeOf(r.stderr);
    expect(tree.startsWith(`${tmp}/sim-tree.`)).toBe(true);
    expect(r.stdout).toBe(`${tree}\n${tree}\n`);
  });
});

describe("scripts/sim-tree.sh: the exit code and the tree's removal", () => {
  it("exits 0 when the command does, and removes the tree", () => {
    const { repo, tmp } = makeRepo();
    const r = sim(repo, tmp, ["--", "true"]);
    expect(r.code).toBe(0);
    const tree = treeOf(r.stderr);
    expect(r.stderr).toMatch(/the command exited 0/);
    expect(existsSync(tree)).toBe(false);
    expect(readdirSync(tmp)).toEqual([]);
  });

  it("exits with the command's code (3), and keeps the tree, naming its path", () => {
    const { repo, tmp } = makeRepo();
    const r = sim(repo, tmp, sh("echo kept > marker.txt; exit 3"));
    expect(r.code).toBe(3);
    const tree = treeOf(r.stderr);
    expect(r.stderr).toMatch(/the command exited 3/);
    expect(r.stderr).toMatch(new RegExp(`kept ${tree.replace(/[.]/g, "\\.")}`));
    expect(readFileSync(join(tree, "marker.txt"), "utf8")).toBe("kept\n");
    rmSync(tree, { recursive: true, force: true });
  });

  it("keeps the tree with --keep even when the command passes, naming its path", () => {
    const { repo, tmp } = makeRepo();
    const r = sim(repo, tmp, ["--keep", "--", "true"]);
    expect(r.code).toBe(0);
    const tree = treeOf(r.stderr);
    expect(r.stderr).toContain(`kept ${tree}`);
    expect(readFileSync(join(tree, "file.txt"), "utf8")).toBe("v2\n");
    rmSync(tree, { recursive: true, force: true });
  });

  it("--dir puts the tree at that path (and removes it after a pass)", () => {
    const { repo, tmp } = makeRepo();
    const dir = join(dirname(repo), "named-tree");
    const r = sim(repo, tmp, ["--dir", dir, ...sh("pwd -P; cat file.txt")]);
    expect(r.code).toBe(0);
    expect(treeOf(r.stderr)).toBe(dir);
    expect(r.stdout).toBe(`${dir}\nv2\n`);
    expect(existsSync(dir)).toBe(false);
    expect(readdirSync(tmp)).toEqual([]);
  });

  it("a relative --dir is made absolute, and kept with --keep", () => {
    const { repo, tmp } = makeRepo();
    const r = sim(repo, tmp, ["--keep", "--dir", "../rel-tree", "--", "true"]);
    expect(r.code).toBe(0);
    const dir = join(dirname(repo), "rel-tree");
    expect(treeOf(r.stderr)).toBe(dir);
    expect(lstatSync(dir).isDirectory()).toBe(true);
    rmSync(dir, { recursive: true, force: true });
  });
});

describe("scripts/sim-tree.sh: refusals exit 2 and create nothing", () => {
  const refused = (r: { code: number | null; stderr: string }, why: RegExp, tmp: string) => {
    expect(r.code).toBe(2);
    expect(r.stderr).toMatch(why);
    expect(r.stderr).not.toMatch(/^sim-tree: tree /m);
    expect(readdirSync(tmp)).toEqual([]);
  };

  it("outside a git repository", () => {
    const { tmp } = makeRepo();
    const nowhere = join(dirname(tmp), "not-a-repo");
    mkdirSync(nowhere);
    refused(sim(nowhere, tmp, ["--", "true"]), /not inside a git repository/, tmp);
  });

  it("an unknown ref", () => {
    const { repo, tmp } = makeRepo();
    const before = status(repo);
    refused(sim(repo, tmp, ["--ref", "no-such-ref", "--", "true"]), /unknown ref: no-such-ref/, tmp);
    expect(status(repo)).toBe(before);
  });

  it("a --dir that already exists (left as it was)", () => {
    const { repo, tmp } = makeRepo();
    const dir = join(dirname(repo), "exists");
    mkdirSync(dir);
    writeFileSync(join(dir, "keep.txt"), "mine\n");
    refused(sim(repo, tmp, ["--dir", dir, "--", "true"]), /already exists/, tmp);
    expect(readdirSync(dir)).toEqual(["keep.txt"]);
    expect(readFileSync(join(dir, "keep.txt"), "utf8")).toBe("mine\n");
  });

  it("a --dir inside the repository", () => {
    const { repo, tmp } = makeRepo();
    const before = status(repo);
    refused(sim(repo, tmp, ["--dir", join(repo, "sub", "tree"), "--", "true"]), /inside the repository/, tmp);
    expect(existsSync(join(repo, "sub"))).toBe(false);
    refused(sim(repo, tmp, ["--dir", "inner", "--", "true"]), /inside the repository/, tmp);
    expect(existsSync(join(repo, "inner"))).toBe(false);
    expect(status(repo)).toBe(before);
  });

  it("a TMPDIR inside the repository (the default tree would be inside it)", () => {
    const { repo, tmp } = makeRepo();
    const inner = join(repo, "node_modules", "tmp");
    mkdirSync(inner);
    const r = sim(repo, inner, ["--", "true"]);
    expect(r.code).toBe(2);
    expect(r.stderr).toMatch(/inside the repository/);
    expect(readdirSync(inner)).toEqual([]);
    expect(readdirSync(tmp)).toEqual([]);
  });

  it("no command after --, no --, or an unknown option", () => {
    const { repo, tmp } = makeRepo();
    refused(sim(repo, tmp, ["--"]), /no command after --/, tmp);
    refused(sim(repo, tmp, ["true"]), /the command goes after --/, tmp);
    refused(sim(repo, tmp, []), /no command after --/, tmp);
    refused(sim(repo, tmp, ["--bogus", "--", "true"]), /unknown option: --bogus/, tmp);
    refused(sim(repo, tmp, ["--ref"]), /--ref needs a value/, tmp);
  });
});

describe("scripts/sim-tree.sh: a failed build", () => {
  it("removes the half-built tree, exits with the failing step's code, and never runs the command", () => {
    const { repo, tmp } = makeRepo();
    const bin = join(dirname(tmp), "fakebin");
    mkdirSync(bin);
    const realGit = spawnSync("sh", ["-c", "command -v git"], { encoding: "utf8" }).stdout.trim();
    // A git whose init fails (exit 7) and which is the real git otherwise.
    writeFileSync(join(bin, "git"), `#!/usr/bin/env bash\nfor a in "$@"; do [ "$a" = init ] && exit 7; done\nexec "${realGit}" "$@"\n`);
    chmodSync(join(bin, "git"), 0o755);
    const marker = join(dirname(tmp), "ran");
    const r = spawnSync("bash", [SCRIPT, "--", "touch", marker], {
      cwd: repo,
      env: { ...process.env, ...gitEnv, TMPDIR: tmp, PATH: `${bin}:${process.env.PATH}` },
      encoding: "utf8",
    });
    expect(r.status).toBe(7);
    expect(r.stderr).toMatch(/sim-tree: building the tree failed; removed \//);
    expect(readdirSync(tmp)).toEqual([]);
    expect(existsSync(marker)).toBe(false);
  });
});

describe("scripts/sim-tree.sh: the checkout is never touched", () => {
  it("keeps the checkout's status byte for byte whatever the command does in the tree", () => {
    const { repo, tmp } = makeRepo();
    const before = status(repo);
    const dirty = readFileSync(join(repo, "file.txt"));
    const script = [
      "echo changed > file.txt",
      "rm .gitignore",
      "echo new > new.txt",
      "mkdir -p deep/er && echo x > deep/er/y.txt",
      "git add -A && git -c user.name=t -c user.email=t -c commit.gpgsign=false commit -qm sim",
      "git tag from-the-tree",
    ].join(" && ");
    const r = sim(repo, tmp, sh(script));
    expect(r.code).toBe(0);
    expect(status(repo)).toBe(before);
    expect(readFileSync(join(repo, "file.txt")).equals(dirty)).toBe(true);
    expect(git(repo, "tag", "--list")).toBe("v1\n");
    expect(git(repo, "log", "--format=%s")).toBe("two\none\n");
    // The link was removed with the tree, not followed: the checkout's node_modules is still there.
    expect(readFileSync(join(repo, "node_modules", "fake-dep", "index.js"), "utf8")).toBe("module.exports = 1;\n");
  });

  it("the real checkout: a read-only command reports the checkout's HEAD sha and leaves its status as it was", () => {
    const before = git(ROOT, "status", "--porcelain", "--untracked-files=all");
    const head = git(ROOT, "rev-parse", "HEAD").trim();
    const tmp = mkdtempSync(join(scratch, "real-tmp-"));
    const r = sim(ROOT, tmp, ["--", "git", "rev-parse", "HEAD"]);
    expect(r.code).toBe(0);
    expect(r.stderr).toContain(`sim-tree: from HEAD at ${head}`);
    // The tree is a repository of its own: its HEAD is its one commit, whose subject names the checkout's sha.
    expect(r.stdout).toMatch(/^[0-9a-f]{40}\n$/);
    expect(r.stdout.trim()).not.toBe(head);
    expect(git(ROOT, "status", "--porcelain", "--untracked-files=all")).toBe(before);
    expect(readdirSync(tmp)).toEqual([]);
  }, 120_000);
});
