import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { chmodSync, copyFileSync, mkdirSync, mkdtempSync, readFileSync, realpathSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { afterAll, describe, expect, it } from "vitest";
// @ts-expect-error — plain ESM script, no type declarations by design
import { buildMeta } from "../../../scripts/render-watch.mjs";
// @ts-expect-error — plain ESM script, no type declarations by design
import { frozenMeta, MANIFEST } from "../../../scripts/freeze-capture.mjs";

/**
 * scripts/remask-run.sh (logs/CHANNEL_LOOP.md §9, tick 52 item 1 = tick 50 item 2): the re-mask chain the main thread
 * ran by hand in ticks 49 and 50. Each test builds its own fixture repository at run time: a copy of the scripts the
 * chain runs (the script works in the repository it sits in, so the copy's REPO_ROOT is the fixture), a small
 * research/rendered with one capture holding an address assembled from parts and one frozen copy recorded in
 * FROZEN.sha256, and a first commit whose subject starts "render: re-mask" and carries the trailers the run must copy.
 * Step 7 runs the copied scripts/verify.sh with stand-in runners (VERIFY_TYPECHECK_CMD, VERIFY_TEST_CMD), so no test
 * suite runs inside a test. Nothing here touches this checkout's research/rendered: the last test proves it with git
 * status, before and after.
 */

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const COPY = [
  "remask-run.sh",
  "remask-captures.mjs",
  "freeze-capture.mjs",
  "render-watch.mjs",
  "capture-check.mjs",
  "queue-zero-test.mjs",
  "address-kinds.mjs",
  "verify.sh",
];
const DATE = "2026-10-06";
const realStatus = () => spawnSync("git", ["status", "--porcelain", "--untracked-files=all", "--", "research/rendered"], { cwd: ROOT, encoding: "utf8" }).stdout;
const REAL_BEFORE = realStatus();

const scratch = realpathSync(mkdtempSync(join(tmpdir(), "remask-run-test-")));
afterAll(() => rmSync(scratch, { recursive: true, force: true }));
const EMPTY_GITCONFIG = join(scratch, "gitconfig");
writeFileSync(EMPTY_GITCONFIG, "");

const at = (local: string, domain: string) => [local, domain].join(String.fromCharCode(64));
const LOCAL = ["fixture", "person"].join(".");
const DOMAIN = ["dept", "uni", "edu"].join(".");
const ADDRESS = at(LOCAL, DOMAIN);
const IDENTITY = at("fixture-bot", ["example", "invalid"].join("."));
// The trailers the fixture's earlier re-mask commit carries, which the run must copy verbatim.
const TRAILERS = [`Co-Authored-By: Fixture Bot <${IDENTITY}>`, "Fixture-Session: https://example.invalid/session/1"];
const gitEnv = {
  GIT_CONFIG_GLOBAL: EMPTY_GITCONFIG,
  GIT_CONFIG_NOSYSTEM: "1",
  GIT_CEILING_DIRECTORIES: scratch,
  GIT_AUTHOR_NAME: "Fixture Bot",
  GIT_AUTHOR_EMAIL: IDENTITY,
  GIT_COMMITTER_NAME: "Fixture Bot",
  GIT_COMMITTER_EMAIL: IDENTITY,
};
const sha = (b: Buffer | string) => createHash("sha256").update(b).digest("hex");

function git(cwd: string, ...args: string[]): string {
  const r = spawnSync("git", ["-c", "commit.gpgsign=false", ...args], { cwd, env: { ...process.env, ...gitEnv }, encoding: "utf8" });
  if (r.status !== 0) throw new Error(`git ${args.join(" ")}: ${r.stderr}`);
  return r.stdout.trim();
}

function meta(slug: string, body: string, ext: string) {
  return buildMeta({
    url: `https://site.example/${slug}`,
    slug,
    fetchedAt: "2026-09-28T20:35:42.598Z",
    status: 200,
    contentType: "text/html; charset=utf-8",
    byteLength: Buffer.byteLength(body),
    sha256: sha(body),
    bodyPath: `research/rendered/${slug}.${ext}`,
    textPath: `research/rendered/${slug}.txt`,
    redacted: 0,
  });
}

let made = 0;
/** A fixture repository: the chain's scripts, one capture with an address, one frozen copy, one earlier re-mask commit. */
function repo({ staleManifest = false, trailers = true } = {}) {
  const root = join(scratch, `repo-${(made += 1)}`);
  const dir = join(root, "research", "rendered");
  mkdirSync(join(root, "scripts"), { recursive: true });
  mkdirSync(dir, { recursive: true });
  for (const f of COPY) copyFileSync(join(ROOT, "scripts", f), join(root, "scripts", f));
  for (const f of ["remask-run.sh", "verify.sh"]) chmodSync(join(root, "scripts", f), 0o755);
  const w = (name: string, text: string) => writeFileSync(join(dir, name), text);
  const html = `<html><body>\n<p>Write to ${ADDRESS} for the rules.</p>\n</body></html>\n`;
  w("page.html", html);
  w("page.txt", `Write to ${ADDRESS} for the rules.\n`);
  w("page.meta.json", `${JSON.stringify(meta("page", html, "html"), null, 2)}\n`);
  const quiet = "<html><body>\n<p>No address here.</p>\n</body></html>\n";
  const quietMeta = meta("quiet", quiet, "html");
  w("quiet-2026-09-28.html", quiet);
  w("quiet-2026-09-28.txt", "No address here.\n");
  w("quiet-2026-09-28.meta.json", `${JSON.stringify(frozenMeta(quietMeta, { slug: "quiet", frozenSlug: "quiet-2026-09-28", on: "2026-09-30", commit: "abc1234", why: "cited" }), null, 2)}\n`);
  const recorded = ["html", "meta.json", "txt"].map((e) => `quiet-2026-09-28.${e}`).sort();
  w(MANIFEST, recorded.map((f) => `${staleManifest && f.endsWith(".txt") ? "0".repeat(64) : sha(readFileSync(join(dir, f)))}  ${f}\n`).join(""));
  w("urls.txt", "# fixture list\nhttps://site.example/page\tpage\n");
  writeFileSync(join(root, "notes.md"), "a tracked file\n");
  git(root, "init", "-q");
  git(root, "add", "-A");
  const subject = trailers ? "render: re-mask the fixture's captures, once" : "fixture: captures";
  git(root, "commit", "-q", "-m", `${subject}\n\nThe fixture's first commit.\n\n${trailers ? TRAILERS.join("\n") : ""}`);
  return { root, dir, head: git(root, "rev-parse", "HEAD") };
}
type Repo = ReturnType<typeof repo>;

function run(r: Repo, args: string[], env: Record<string, string | undefined> = {}, cwd = r.root) {
  const out = join(scratch, `out-${(made += 1)}`);
  const merged: Record<string, string | undefined> = {
    ...process.env,
    ...gitEnv,
    REMASK_RUN_FORBIDDEN_RE: "fixture-owner-name",
    REMASK_RUN_OUT: out,
    VERIFY_OUT: join(out, "verify"),
    VERIFY_TYPECHECK_CMD: "true",
    VERIFY_TEST_CMD: "echo Tests 1 passed",
    ...env,
  };
  for (const k of Object.keys(merged)) if (merged[k] === undefined) delete merged[k];
  const p = spawnSync("bash", [join(r.root, "scripts", "remask-run.sh"), ...args], { cwd, encoding: "utf8", env: merged as NodeJS.ProcessEnv, timeout: 120_000 });
  return { code: p.status, out: p.stdout, err: p.stderr, all: `${p.stdout}\n${p.stderr}`, dir: out };
}
const head = (r: Repo) => git(r.root, "rev-parse", "HEAD");
const status = (r: Repo) => git(r.root, "status", "--porcelain", "--untracked-files=all");
const page = (r: Repo) => readFileSync(join(r.dir, "page.txt"), "utf8");

describe("remask-run.sh", () => {
  it("runs the chain through and commits once, naming the date and the dry run's counts, with the earlier trailers", () => {
    const r = repo();
    const x = run(r, [DATE]);
    expect(x.code, x.all).toBe(0);
    for (let n = 1; n <= 9; n += 1) expect(x.err).toContain(`[${n}/9]`);
    expect(x.err).toMatch(/\[1\/9\] dry-run: exit 3/);
    expect(x.err).toMatch(/\[3\/9\] dry-run-again: exit 0/);
    expect(x.err).toMatch(/\[4\/9\] sha256sum: exit 0/);
    expect(git(r.root, "rev-list", "--count", `${r.head}..HEAD`)).toBe("1");
    expect(status(r)).toBe("");
    expect(page(r)).not.toContain(ADDRESS);
    expect(page(r)).toContain(`[redacted:email]${String.fromCharCode(64)}${DOMAIN}`);

    const message = git(r.root, "log", "-1", "--format=%B");
    const summary = readFileSync(join(x.dir, "dry-run-summary.txt"), "utf8").trim();
    expect(summary).toMatch(/^would change: 1 capture, 2 files \(1 \.html, 1 \.txt\); 2 addresses masked/);
    expect(message.split("\n")[0]).toBe(`render: re-mask the stored captures, ${DATE}; git history keeps the earlier bytes`);
    expect(message).toContain(`scripts/remask-run.sh ${DATE}: node scripts/remask-captures.mjs --apply --date ${DATE}`);
    expect(message).toContain(summary);
    expect(message).toContain("Git history keeps the earlier bytes of every file this commit changes.");
    expect(message.endsWith(`\n\n${TRAILERS.join("\n")}`)).toBe(true);
    expect(git(r.root, "log", "-1", "--format=%(trailers:only,unfold)").trim()).toBe(TRAILERS.join("\n"));
    expect(x.all).not.toContain(LOCAL);
    expect(message).not.toContain(LOCAL);

    // Run again: nothing left to re-mask, nothing committed.
    const y = run(r, [DATE]);
    expect(y.code, y.all).toBe(0);
    expect(y.err).toContain("nothing to re-mask");
    expect(y.err).not.toContain("[2/9]");
    expect(git(r.root, "rev-list", "--count", `${r.head}..HEAD`)).toBe("1");
  });

  it("refuses, running nothing, a dirty tree, an untracked file, a date that is not YYYY-MM-DD and a run outside the root", () => {
    const r = repo();
    const refused = (x: ReturnType<typeof run>) => {
      expect(x.code, x.all).toBe(2);
      expect(x.err).toContain("refused, nothing run");
      expect(x.err).not.toContain("[1/9]");
      expect(head(r)).toBe(r.head);
      expect(page(r)).toContain(ADDRESS);
    };
    writeFileSync(join(r.root, "notes.md"), "an uncommitted change\n");
    refused(run(r, [DATE]));
    git(r.root, "checkout", "-q", "--", "notes.md");
    writeFileSync(join(r.root, "untracked.txt"), "x\n");
    refused(run(r, [DATE]));
    rmSync(join(r.root, "untracked.txt"));
    expect(status(r)).toBe("");
    for (const bad of ["2026-13-01", "2026-02-30", "6.10.2026", "20261006", ""]) refused(run(r, bad ? [bad] : []));
    // From a subdirectory, even with --rendered given as an absolute path: only the root check stands in the way.
    const sub = run(r, [DATE, "--rendered", r.dir], {}, join(r.root, "research"));
    refused(sub);
    expect(sub.err).toContain("run it from the root of the repository");
    refused(run(r, [DATE], { REMASK_RUN_FORBIDDEN_RE: undefined }));
    refused(run(r, [DATE], { REMASK_RUN_FORBIDDEN_RE: "(" }));
    refused(run(r, [DATE, "--rendered", scratch]));
    // No earlier "render: re-mask" commit to copy trailers from: refused, never invented (--no-commit needs none).
    const bare = repo({ trailers: false });
    const x = run(bare, [DATE]);
    expect(x.code, x.all).toBe(2);
    expect(x.err).toContain("never writes its own");
    expect(head(bare)).toBe(bare.head);
  });

  it("--no-commit runs the chain and leaves the changes uncommitted", () => {
    const r = repo();
    const x = run(r, [DATE, "--no-commit"]);
    expect(x.code, x.all).toBe(0);
    expect(x.err).toContain("[8/9]");
    expect(x.err).toContain("--no-commit");
    expect(head(r)).toBe(r.head);
    expect(status(r).split("\n").map((l) => l.replace(/^\s*\S+\s+/, "")).sort()).toEqual(["research/rendered/page.html", "research/rendered/page.meta.json", "research/rendered/page.txt"]);
    expect(page(r)).not.toContain(ADDRESS);
  });

  it("stops at a failing step with that step's exit and commits nothing: a stale FROZEN.sha256 at step 4", () => {
    const r = repo({ staleManifest: true });
    const x = run(r, [DATE]);
    expect(x.code, x.all).toBe(1);
    expect(x.err).toMatch(/\[4\/9\] sha256sum: exit 1/);
    expect(x.err).toContain("[4/9] stopped");
    expect(x.err).not.toContain("[5/9]");
    expect(head(r)).toBe(r.head);
  });

  it("stops at step 3 when a second dry run still finds work (an apply that is not idempotent)", () => {
    const r = repo();
    // A stand-in for remask-captures whose dry run always finds work: what a non-idempotent apply looks like.
    writeFileSync(
      join(r.root, "scripts", "remask-captures.mjs"),
      [
        'import { writeFileSync } from "node:fs";',
        'export const domainKind = () => "organisation or university";',
        'if (process.argv.includes("--apply")) { writeFileSync("research/rendered/page.txt", "rewritten by the stand-in\\n"); process.exit(0); }',
        'console.log("would change: 1 capture, 1 file (1 .txt); 1 address masked");',
        "process.exit(3);",
        "",
      ].join("\n"),
    );
    git(r.root, "commit", "-q", "-am", "a stand-in remask-captures");
    const before = head(r);
    const x = run(r, [DATE]);
    expect(x.code, x.all).toBe(3);
    expect(x.err).toMatch(/\[3\/9\] dry-run-again: exit 3/);
    expect(x.err).toContain("not idempotent");
    expect(x.err).not.toContain("[4/9]");
    expect(head(r)).toBe(before);
  });

  it("stops at step 7 when verify fails, and at step 8 when an added line matches the owner-identifier pattern", () => {
    const r = repo();
    const v = run(r, [DATE], { VERIFY_TYPECHECK_CMD: "false" });
    expect(v.code, v.all).toBe(1);
    expect(v.err).toMatch(/\[7\/9\] verify: exit 1/);
    expect(v.err).not.toContain("[8/9]");
    expect(head(r)).toBe(r.head);

    const s = repo();
    const g = run(s, [DATE], { REMASK_RUN_FORBIDDEN_RE: "redacted:EMAIL" });
    expect(g.code, g.all).toBe(1);
    expect(g.err).toMatch(/\[8\/9\] research\/rendered\/page\.txt: 1 added line\(s\) match/);
    expect(g.err).not.toContain("[9/9]");
    expect(head(s)).toBe(s.head);
  });

  it("never touches this checkout's research/rendered", () => {
    expect(realStatus()).toBe(REAL_BEFORE);
  });
});
