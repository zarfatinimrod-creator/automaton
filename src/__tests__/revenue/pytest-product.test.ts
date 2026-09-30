import { spawn, spawnSync } from "node:child_process";
import { chmodSync, existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { afterAll, describe, expect, it } from "vitest";

/**
 * scripts/pytest-product.sh <product> [pytest args...] — runs a Python product's tests in a venv it keeps, one per
 * product and requirements content, outside the repo. No test here touches the network or a real Python: a stub
 * `python` (PYTEST_PRODUCT_PYTHON) makes the venv, records the pip install and plays pytest with a chosen output and
 * exit code. The skip rule is read from the product's own CI workflow (.github/workflows/<product>-ci.yml): a job
 * that greps its log for "skipped" fails on a skip, so the script does too for that product.
 */

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const SCRIPT = join(ROOT, "scripts", "pytest-product.sh");

const scratch = mkdtempSync(join(tmpdir(), "pytest-product-test-"));
afterAll(() => rmSync(scratch, { recursive: true, force: true }));

const STUB = join(scratch, "python-stub");
// pip "installs" two packages into <venv>/site, STUB_PIP_SLEEP seconds apart; pytest refuses to run without both
// (a half-built venv), and writes STUB_JUNIT (default: a suite with no skips; "none": no file) to its --junitxml path.
const NO_SKIPS = '<testsuites><testsuite name="pytest" errors="0" failures="0" skipped="0" tests="3"></testsuite></testsuites>';
writeFileSync(
  STUB,
  `#!/usr/bin/env bash
if [ "$1" = -m ] && [ "$2" = venv ]; then echo "venv $3" >> "$STUB_LOG"; mkdir -p "$3/bin"; cp "$0" "$3/bin/python"; exit 0; fi
v="$(cd "$(dirname "$0")/.." 2>/dev/null && pwd)"
if [ "$1" = -m ] && [ "$2" = pip ]; then
  echo "pip \${*:3}" >> "$STUB_LOG"; mkdir -p "$v/site"; touch "$v/site/first"; sleep "\${STUB_PIP_SLEEP:-0}"
  [ "\${STUB_PIP_EXIT:-0}" = 0 ] || exit "$STUB_PIP_EXIT"; touch "$v/site/second" 2>/dev/null; exit 0
fi
if [ "$1" = -m ] && [ "$2" = pytest ]; then
  echo "pytest cwd=$PWD args=\${*:3}" >> "$STUB_LOG"
  [ -f "$v/site/second" ] || { echo "ModuleNotFoundError: No module named 'second'"; exit 2; }
  j=""; prev=""; for a in "$@"; do [ "$prev" = --junitxml ] && j="$a"; prev="$a"; done
  if [ -n "$j" ] && [ "\${STUB_JUNIT:-}" != none ]; then printf '%s\\n' "\${STUB_JUNIT:-${NO_SKIPS}}" > "$j"; fi
  printf '%s\\n' "\${STUB_PYTEST_OUT:-}"; exit "\${STUB_PYTEST_EXIT:-0}"
fi
echo "unexpected $*" >> "$STUB_LOG"; exit 99
`,
);
chmodSync(STUB, 0o755);

let n = 0;
/** A fake repository root with products/<name>/requirements*.txt and, optionally, a CI workflow for it. */
function fakeRoot(files: Record<string, string>): string {
  n += 1;
  const root = join(scratch, `root-${n}`);
  for (const [path, body] of Object.entries(files)) {
    mkdirSync(dirname(join(root, path)), { recursive: true });
    writeFileSync(join(root, path), body);
  }
  return root;
}

type Opts = {
  root?: string;
  venvs: string;
  out?: string;
  pytestOut?: string;
  pytestExit?: number;
  pipExit?: number;
  pipSleep?: number;
  junit?: string;
};
function envFor(o: Opts) {
  const env: Record<string, string | undefined> = {
    ...process.env,
    PYTEST_PRODUCT_PYTHON: STUB,
    PYTEST_PRODUCT_VENVS: o.venvs,
    PYTEST_PRODUCT_OUT: o.out ?? join(o.venvs, "out"),
    STUB_LOG: join(o.venvs, "stub.log"),
    STUB_PYTEST_OUT: o.pytestOut ?? "3 passed in 0.10s",
    STUB_PYTEST_EXIT: String(o.pytestExit ?? 0),
    STUB_PIP_EXIT: String(o.pipExit ?? 0),
    STUB_PIP_SLEEP: String(o.pipSleep ?? 0),
  };
  if (o.junit !== undefined) env.STUB_JUNIT = o.junit;
  else delete env.STUB_JUNIT;
  if (o.root) env.PYTEST_PRODUCT_ROOT = o.root;
  else delete env.PYTEST_PRODUCT_ROOT;
  return env;
}
const stubCalls = (venvs: string) => {
  const stubLog = join(venvs, "stub.log");
  return existsSync(stubLog) ? readFileSync(stubLog, "utf8").trim().split("\n").filter(Boolean) : [];
};
function run(args: string[], o: Opts) {
  mkdirSync(o.venvs, { recursive: true });
  const r = spawnSync("bash", [SCRIPT, ...args], { env: envFor(o), encoding: "utf8" });
  return { code: r.status, stdout: r.stdout, stderr: r.stderr, all: r.stdout + r.stderr, calls: stubCalls(o.venvs) };
}
/** The same run, not waiting: resolves when the script exits. */
function start(args: string[], o: Opts): Promise<{ code: number | null; all: string }> {
  mkdirSync(o.venvs, { recursive: true });
  return new Promise((done) => {
    const child = spawn("bash", [SCRIPT, ...args], { env: envFor(o) });
    let all = "";
    child.stdout.on("data", (d) => (all += d));
    child.stderr.on("data", (d) => (all += d));
    child.on("close", (code) => done({ code, all }));
  });
}
const venvDirs = (venvs: string) => readdirSync(venvs).filter((d) => d !== "stub.log" && d !== "out" && !d.endsWith(".lock"));

const TOY = { "products/toy/requirements.txt": "numpy==2.4.6\n", "products/toy/requirements-dev.txt": "-r requirements.txt\npytest\n" };

describe("pytest-product.sh refuses what is not a product", () => {
  const root = fakeRoot({ ...TOY, "products/nodeonly/package.json": "{}\n" });
  it.each([
    ["no argument", []],
    ["a name with a slash", ["toy/../toy"]],
    ["a path out of products/", ["../toy"]],
    ["..", [".."]],
    ["a product that does not exist", ["nope"]],
    ["a product with no requirements*.txt", ["nodeonly"]],
  ])("%s: exit 2, nothing created, python never called", (_label, args) => {
    const venvs = join(scratch, `refuse-${n++}`);
    const r = run(args, { root, venvs });
    expect(r.code).toBe(2);
    expect(r.stderr).not.toBe("");
    expect(r.calls).toEqual([]);
    expect(venvDirs(venvs)).toEqual([]);
  });
});

describe("pytest-product.sh keeps one venv per product and requirements content", () => {
  it("names the venv <product>-<12 hex of the requirements*.txt contents>, installs every requirements file once, reuses it", () => {
    const root = fakeRoot(TOY);
    const venvs = join(scratch, "venvs-stable");
    const first = run(["toy"], { root, venvs });
    expect(first.code).toBe(0);
    const dirs = venvDirs(venvs);
    expect(dirs).toHaveLength(1);
    expect(dirs[0]).toMatch(/^toy-[0-9a-f]{12}$/);
    const pip = first.calls.filter((c) => c.startsWith("pip "));
    expect(pip).toHaveLength(1);
    expect(pip[0]).toContain(join(root, "products/toy/requirements-dev.txt"));
    expect(pip[0]).toContain(join(root, "products/toy/requirements.txt"));

    const second = run(["toy"], { root, venvs });
    expect(second.code).toBe(0);
    expect(venvDirs(venvs)).toEqual(dirs);
    expect(second.calls.filter((c) => c.startsWith("venv ") || c.startsWith("pip "))).toHaveLength(1 + 1); // from the first run only
  });

  it("the same contents in another checkout give the same venv; a changed requirements file gives a new one", () => {
    const venvs = join(scratch, "venvs-hash");
    run(["toy"], { root: fakeRoot(TOY), venvs });
    run(["toy"], { root: fakeRoot(TOY), venvs });
    expect(venvDirs(venvs)).toHaveLength(1);
    run(["toy"], { root: fakeRoot({ ...TOY, "products/toy/requirements.txt": "numpy==2.4.7\n" }), venvs });
    expect(venvDirs(venvs)).toHaveLength(2);
  });

  it("a failed install leaves no venv that a later run would take as ready", () => {
    const root = fakeRoot(TOY);
    const venvs = join(scratch, "venvs-pipfail");
    const bad = run(["toy"], { root, venvs, pipExit: 1 });
    expect(bad.code).not.toBe(0);
    expect(bad.calls.some((c) => c.startsWith("pytest"))).toBe(false);
    const good = run(["toy"], { root, venvs });
    expect(good.code).toBe(0);
    expect(good.calls.filter((c) => c.startsWith("pip "))).toHaveLength(2); // retried, not skipped
  });
});

describe("pytest-product.sh runs pytest from the product directory and exits with pytest's code", () => {
  const root = fakeRoot(TOY);
  it.each([0, 1, 4, 5])("pytest exit %i -> script exit %i", (code) => {
    const venvs = join(scratch, `venvs-exit-${code}`);
    const r = run(["toy", "-q", "-k", "thing"], { root, venvs, pytestExit: code, pytestOut: `summary line for ${code}` });
    expect(r.code).toBe(code);
    const call = r.calls.find((c) => c.startsWith("pytest"));
    // The caller's arguments, then the script's own --junitxml (last, so a caller's --junitxml cannot replace it).
    expect(call).toBe(`pytest cwd=${join(root, "products/toy")} args=-q -k thing --junitxml ${join(venvs, "out", "junit.xml")}`);
    expect(r.stdout).toContain(`summary line for ${code}`); // the tail is printed
    expect(readFileSync(join(venvs, "out", "pytest.log"), "utf8")).toContain(`summary line for ${code}`);
  });
});

describe("pytest-product.sh fails on a skip exactly where the product's CI does", () => {
  const STRICT_CI = [
    "      - name: Tests (a failure or a skip fails the job)",
    "        run: |",
    "          python -m pytest -q -rs | tee \"$RUNNER_TEMP/pytest.log\"",
    "          if grep -Eq '[0-9]+ skipped' \"$RUNNER_TEMP/pytest.log\"; then exit 1; fi",
  ].join("\n");
  const LAX_CI = "      - run: python -m pytest -q\n";
  const SKIPPED = "5 passed, 1 skipped in 0.20s";

  it("a workflow that greps for skipped makes a passing run with a skip exit 1", () => {
    const root = fakeRoot({ ...TOY, ".github/workflows/toy-ci.yml": STRICT_CI });
    const r = run(["toy"], { root, venvs: join(scratch, "venvs-strict"), pytestOut: SKIPPED });
    expect(r.code).toBe(1);
    expect(r.all).toMatch(/skip/i);
    expect(r.all).toContain(".github/workflows/toy-ci.yml");
  });

  it("the same run passes where the workflow does not fail on skips, or there is no workflow", () => {
    const lax = fakeRoot({ ...TOY, ".github/workflows/toy-ci.yml": LAX_CI });
    expect(run(["toy"], { root: lax, venvs: join(scratch, "venvs-lax"), pytestOut: SKIPPED }).code).toBe(0);
    expect(run(["toy"], { root: fakeRoot(TOY), venvs: join(scratch, "venvs-noci"), pytestOut: SKIPPED }).code).toBe(0);
  });

  it("a strict product without skips passes, and a real failure keeps pytest's code", () => {
    const root = fakeRoot({ ...TOY, ".github/workflows/toy-ci.yml": STRICT_CI });
    expect(run(["toy"], { root, venvs: join(scratch, "venvs-strict-ok") }).code).toBe(0);
    const failed = run(["toy"], { root, venvs: join(scratch, "venvs-strict-fail"), pytestOut: "1 failed, 1 skipped", pytestExit: 1 });
    expect(failed.code).toBe(1);
  });

  // Review of tick 33: CI always prints the "N skipped" line (-q -rs); a caller's flags can hide it (-qq, -p no:terminal).
  // So the skips are read from the JUnit XML the script asks pytest for, which every output mode writes.
  const skipXml = (skipped: string) =>
    `<testsuites><testsuite name="pytest" errors="0" failures="0" skipped="1" tests="2"><testcase classname="t" name="a"/>` +
    `<testcase classname="t" name="b">${skipped}</testcase></testsuite></testsuites>`;
  it.each([
    ["-qq (a dot and an s, no summary line)", ["-qq"], ".s", skipXml('<skipped type="pytest.skip" message="because">t.py:3: because</skipped>')],
    ["-p no:terminal (no output at all)", ["-p", "no:terminal"], "", skipXml('<skipped type="pytest.skip" message="because" />')],
    ["a module skipped at collection (importorskip)", ["-qq"], "", skipXml('<skipped message="collection skipped">could not import x</skipped>')],
  ])("a strict product fails on a skip the output does not show: %s", (_label, args, out, junit) => {
    const root = fakeRoot({ ...TOY, ".github/workflows/toy-ci.yml": STRICT_CI });
    const r = run(["toy", ...args], { root, venvs: join(scratch, `venvs-hidden-${n++}`), pytestOut: out, junit });
    expect(r.code).toBe(1);
    expect(r.all).toMatch(/skipped/);
    expect(r.all).toContain("junit.xml");
  });

  it("an xfail is not a skip, as in CI (pytest prints it as xfailed, and CI greps for skipped)", () => {
    const root = fakeRoot({ ...TOY, ".github/workflows/toy-ci.yml": STRICT_CI });
    const junit = skipXml('<skipped type="pytest.xfail" message="known" />');
    const r = run(["toy"], { root, venvs: join(scratch, "venvs-xfail"), pytestOut: "1 passed, 1 xfailed in 0.02s", junit });
    expect(r.code).toBe(0);
  });

  it("a strict product whose pytest exits 0 but writes no JUnit XML fails: nothing shows whether a test was skipped", () => {
    const root = fakeRoot({ ...TOY, ".github/workflows/toy-ci.yml": STRICT_CI });
    const r = run(["toy"], { root, venvs: join(scratch, "venvs-nojunit"), junit: "none" });
    expect(r.code).toBe(1);
    expect(r.all).toMatch(/junit\.xml/);
    // A product whose CI allows skips does not need the file.
    expect(run(["toy"], { root: fakeRoot(TOY), venvs: join(scratch, "venvs-nojunit-lax"), junit: "none" }).code).toBe(0);
  });

  it("reads the real workflows: parent-guides fails on a skip, chart-explainer does not", () => {
    const pg = run(["parent-guides"], { venvs: join(scratch, "venvs-real-pg"), pytestOut: SKIPPED });
    expect(pg.code).toBe(1);
    expect(pg.all).toContain(".github/workflows/parent-guides-ci.yml");
    const ce = run(["chart-explainer"], { venvs: join(scratch, "venvs-real-ce"), pytestOut: SKIPPED });
    expect(ce.code).toBe(0);
    // Each real product's venv name carries its own requirements hash.
    expect(venvDirs(join(scratch, "venvs-real-pg"))[0]).toMatch(/^parent-guides-[0-9a-f]{12}$/);
    expect(venvDirs(join(scratch, "venvs-real-ce"))[0]).toMatch(/^chart-explainer-[0-9a-f]{12}$/);
  });
});

describe("pytest-product.sh builds a venv once when two runs start together (worktrees share the venv cache)", () => {
  it("the second run waits for the first build and reuses it: one venv, one install, both runs pass", async () => {
    const root = fakeRoot(TOY);
    const venvs = join(scratch, "venvs-race");
    const o = { root, venvs, pipSleep: 1.5 };
    const a = start(["toy"], { ...o, out: join(venvs, "out-a") });
    // Start B while A is inside its install.
    for (let i = 0; i < 100 && !stubCalls(venvs).some((c) => c.startsWith("pip ")); i++) await new Promise((r) => setTimeout(r, 50));
    expect(stubCalls(venvs).some((c) => c.startsWith("pip "))).toBe(true);
    const b = start(["toy"], { ...o, out: join(venvs, "out-b") });
    const [ra, rb] = await Promise.all([a, b]);
    expect(ra.code).toBe(0);
    expect(rb.code).toBe(0);
    const calls = stubCalls(venvs);
    expect(calls.filter((c) => c.startsWith("venv "))).toHaveLength(1);
    expect(calls.filter((c) => c.startsWith("pip "))).toHaveLength(1);
    expect(calls.filter((c) => c.startsWith("pytest "))).toHaveLength(2);
    expect(rb.all).toMatch(/\(reused\)/);
    // Later runs reuse the one complete venv.
    const c = run(["toy"], { root, venvs, out: join(venvs, "out-c") });
    expect(c.code).toBe(0);
    expect(c.stdout).toMatch(/\(reused\)/);
  }, 20_000);
});
