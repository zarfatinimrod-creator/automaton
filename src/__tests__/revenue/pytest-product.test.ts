import { spawnSync } from "node:child_process";
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
writeFileSync(
  STUB,
  `#!/usr/bin/env bash
if [ "$1" = -m ] && [ "$2" = venv ]; then echo "venv $3" >> "$STUB_LOG"; mkdir -p "$3/bin"; cp "$0" "$3/bin/python"; exit 0; fi
if [ "$1" = -m ] && [ "$2" = pip ]; then echo "pip \${*:3}" >> "$STUB_LOG"; exit "\${STUB_PIP_EXIT:-0}"; fi
if [ "$1" = -m ] && [ "$2" = pytest ]; then
  echo "pytest cwd=$PWD args=\${*:3}" >> "$STUB_LOG"; printf '%s\\n' "\${STUB_PYTEST_OUT:-}"; exit "\${STUB_PYTEST_EXIT:-0}"
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

type Opts = { root?: string; venvs: string; out?: string; pytestOut?: string; pytestExit?: number; pipExit?: number };
function run(args: string[], o: Opts) {
  const stubLog = join(o.venvs, "stub.log");
  mkdirSync(o.venvs, { recursive: true });
  const env: Record<string, string | undefined> = {
    ...process.env,
    PYTEST_PRODUCT_PYTHON: STUB,
    PYTEST_PRODUCT_VENVS: o.venvs,
    PYTEST_PRODUCT_OUT: o.out ?? join(o.venvs, "out"),
    STUB_LOG: stubLog,
    STUB_PYTEST_OUT: o.pytestOut ?? "3 passed in 0.10s",
    STUB_PYTEST_EXIT: String(o.pytestExit ?? 0),
    STUB_PIP_EXIT: String(o.pipExit ?? 0),
  };
  if (o.root) env.PYTEST_PRODUCT_ROOT = o.root;
  else delete env.PYTEST_PRODUCT_ROOT;
  const r = spawnSync("bash", [SCRIPT, ...args], { env, encoding: "utf8" });
  const calls = existsSync(stubLog) ? readFileSync(stubLog, "utf8").trim().split("\n").filter(Boolean) : [];
  return { code: r.status, stdout: r.stdout, stderr: r.stderr, all: r.stdout + r.stderr, calls };
}
const venvDirs = (venvs: string) => readdirSync(venvs).filter((d) => d !== "stub.log" && d !== "out");

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
    expect(call).toBe(`pytest cwd=${join(root, "products/toy")} args=-q -k thing`);
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
