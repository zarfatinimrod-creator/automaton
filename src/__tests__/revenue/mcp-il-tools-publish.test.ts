import { afterAll, describe, expect, it } from "vitest";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { chmodSync, existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { parse } from "yaml";

/**
 * The free MCP server (products/mcp-il-tools) is published by ONE manual dispatch of
 * .github/workflows/mcp-il-tools-publish.yml, on main, once the owner has done step 7 (the
 * "mehudak" GitHub organisation owns this repo) and step 9 (the npm user "mehudak", a granular
 * token of that user, and the GitHub environment "npm-publish" holding it). Nothing publishes it
 * before then. The steps themselves are in products/mcp-il-tools/MAINTAINING.md.
 *
 * These tests pin the things that would go wrong silently: a name the registry would refuse,
 * a field or a token that prints a person's name on npm, a run that publishes from a branch or
 * without approval, a job that slips past a failed guard, and a README that stops being true
 * the day it is published. The second half runs the workflow's own step scripts in bash against
 * stubs, so a guard that lost a condition fails here even while its words are still in the file.
 *
 * Sources for the registry rules (modelcontextprotocol/registry, read 28.9.2026 at main
 * bf4e88c and at the release tag v1.8.1 = f52dc85):
 *   - internal/api/handlers/v0/auth/github_oidc.go buildPermissions: a GitHub Actions OIDC
 *     token grants publish on io.github.<repository_owner>/* and nothing else.
 *   - internal/validators/registries/npm.go validateNPMPackage: fetches
 *     registry.npmjs.org/<url.PathEscape(identifier)>/<version> and requires its "mcpName" to
 *     equal the server.json "name". That is the only ownership check.
 *   - pkg/model/constants.go CurrentSchemaVersion = "2025-12-11"; the schema file
 *     internal/validators/schemas/2025-12-11.json caps "description" at 100 characters.
 */

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const PRODUCT = join(ROOT, "products", "mcp-il-tools");
const WORKFLOW = join(ROOT, ".github", "workflows", "mcp-il-tools-publish.yml");

const readJson = (path: string) => JSON.parse(readFileSync(path, "utf8")) as Record<string, any>;
const pkg = () => readJson(join(PRODUCT, "package.json"));
const server = () => readJson(join(PRODUCT, "server.json"));
const readme = () => readFileSync(join(PRODUCT, "README.md"), "utf8");
const workflowText = () => readFileSync(WORKFLOW, "utf8");
const workflow = () => parse(workflowText()) as Record<string, any>;

type Step = {
  name?: string;
  id?: string;
  uses?: string;
  run?: string;
  if?: string;
  env?: Record<string, string>;
  with?: Record<string, unknown>;
  "working-directory"?: string;
};
type Job = {
  steps: Step[];
  needs?: string | string[];
  if?: string;
  environment?: string;
  permissions?: Record<string, string>;
  env?: Record<string, string>;
  defaults?: { run?: { "working-directory"?: string } };
};

const JOB_IDS = ["check", "registry-validate", "npm-publish", "registry-publish"] as const;
const jobs = () => workflow().jobs as Record<string, Job>;
const job = (id: string): Job => {
  const j = jobs()[id];
  if (!j) throw new Error(`the workflow has no job "${id}"`);
  return j;
};
const needsOf = (j: Job) => [j.needs ?? []].flat();
const allSteps = () => Object.values(jobs()).flatMap((j) => j.steps);
const runs = () => allSteps().map((s) => s.run ?? "").filter(Boolean);
const stepNamed = (jobId: string, prefix: string): Step => {
  const s = job(jobId).steps.find((x) => (x.name ?? "").startsWith(prefix));
  if (!s) throw new Error(`no step named "${prefix}..." in job ${jobId}`);
  return s;
};
const indexOf = (jobId: string, match: (s: Step) => boolean) => job(jobId).steps.findIndex(match);

/** Every string in the parsed workflow, with the key path that leads to it. Comments are not strings. */
function strings(node: unknown, path: string[] = []): { path: string[]; value: string }[] {
  if (typeof node === "string") return [{ path, value: node }];
  if (Array.isArray(node)) return node.flatMap((v, i) => strings(v, [...path, String(i)]));
  if (node && typeof node === "object") return Object.entries(node).flatMap(([k, v]) => strings(v, [...path, k]));
  return [];
}

// A command at the start of a line, so `echo "would run npm publish"` in a summary does not count.
const PUBLISH_RE = /^\s*npm publish\b(?![^\n]*--dry-run)/m;
const REGISTRY_LOGIN_RE = /^\s*"?(\S*\/)?mcp-publisher"?\s+login\b/m;
const REGISTRY_PUBLISH_RE = /^\s*"?(\S*\/)?mcp-publisher"?\s+publish\b/m;
const REGISTRY_VALIDATE_RE = /^\s*"?(\S*\/)?mcp-publisher"?\s+validate\b/m;
const REAL_RUN_ON_MAIN = "${{ !inputs.dry_run && github.ref == 'refs/heads/main' }}";
const SHA_PINNED = /^[\w.-]+\/[\w.-]+@[0-9a-f]{40}$/;
// modelcontextprotocol/registry release v1.8.1, asset mcp-publisher_linux_amd64.tar.gz, digest from the release page.
const PIN = { version: "v1.8.1", sha256: "a06c9096dcb9727c13555b6be26c7effa707b01f06a4c561ba7a3635443cf2cc" };

describe("server.json and package.json agree, under the namespace the OIDC login grants", () => {
  it("names the server io.github.mehudak/<name>, and package.json's mcpName is the same string", () => {
    expect(server().name).toMatch(/^io\.github\.mehudak\/[a-zA-Z0-9._-]+$/);
    expect(pkg().mcpName).toBe(server().name);
  });

  it("carries no websiteUrl (mehudak.com is not owned: step 5 is frozen by the ₪0 rule)", () => {
    expect(server()).not.toHaveProperty("websiteUrl");
  });

  it("keeps the versions in step: package.json, server.json, its npm package, and the server's own serverInfo", () => {
    const v = pkg().version;
    expect(server().version).toBe(v);
    expect(server().packages[0].version).toBe(v);
    const src = readFileSync(join(PRODUCT, "src", "server.ts"), "utf8");
    expect(src).toMatch(new RegExp(`name: "il-tools", version: "${v.replace(/\./g, "\\.")}"`));
  });

  it("points its one package at this npm package, on the only npm base URL the registry accepts, over stdio", () => {
    const p = server().packages;
    expect(p).toHaveLength(1);
    expect(p[0]).toMatchObject({
      registryType: "npm",
      registryBaseUrl: "https://registry.npmjs.org",
      identifier: pkg().name,
      transport: { type: "stdio" },
    });
  });

  it("uses the registry's current schema, and fits its 100-character description limit", () => {
    expect(server().$schema).toBe("https://static.modelcontextprotocol.io/schemas/2025-12-11/server.schema.json");
    expect(server().description.length).toBeGreaterThan(0);
    expect(server().description.length).toBeLessThanOrEqual(100);
  });

  it("package.json has no field that would print the repository's owner or a person on npm", () => {
    for (const field of ["repository", "homepage", "author", "bugs", "contributors"]) {
      expect(pkg(), field).not.toHaveProperty(field);
    }
    expect(pkg().publishConfig?.provenance).not.toBe(true);
  });

  it("ships the MIT text that package.json declares, with the brand as the copyright line", () => {
    // MIT requires the notice to travel with every copy; npm puts LICENSE in the tarball whatever `files` says.
    expect(pkg().license).toBe("MIT");
    const text = readFileSync(join(PRODUCT, "LICENSE"), "utf8");
    expect(text).toMatch(/^MIT License\n\nCopyright \(c\) 2026 Mehudak\n/);
    expect(text).toContain("The above copyright notice and this permission notice shall be included");
  });
});

describe("README.md is the npm page; the maintainer notes stay out of the tarball", () => {
  it("says nothing that stops being true once the package is published, and nothing internal", () => {
    // npm keeps a README with each version for good; a stale line means publishing a new version to fix it.
    const text = readme();
    for (const bad of [/not on npm/i, /has not happened/i, /not (yet )?(published|listed)/i, /status on \d/i, /owner step/i, /NPM_TOKEN/, /KILLED_LINES/, /src\/revenue/, /\]\(\.\.?\//, /\]\(#publishing\)/]) {
      expect(text).not.toMatch(bad);
    }
    expect(text).toContain('"args": ["-y", "@mehudak/mcp-il-tools"]');
    expect(text).toContain("io.github.mehudak/il-tools");
  });

  it("keeps the status, the runbook and the step 9 settings in MAINTAINING.md, which `files` does not ship", () => {
    expect(pkg().files).toEqual(["dist", "src", "README.md"]);
    const notes = readFileSync(join(PRODUCT, "MAINTAINING.md"), "utf8");
    expect(notes).toMatch(/not published/);
    for (const setting of ["Read and write (publish and stage)", "All Packages", "Bypass two-factor authentication", "npm-publish", "Selected branches", "Required reviewers"]) {
      expect(notes).toContain(setting);
    }
  });
});

describe("the publish workflow: triggers, jobs and who holds what", () => {
  it("parses, and runs only when someone dispatches it", () => {
    expect(Object.keys(workflow().on)).toEqual(["workflow_dispatch"]);
  });

  it("has a dry_run boolean input that defaults to true", () => {
    const input = workflow().on.workflow_dispatch.inputs.dry_run;
    expect(input.type).toBe("boolean");
    expect(input.default).toBe(true);
  });

  it("grants only contents: read at the top level", () => {
    expect(workflow().permissions).toEqual({ contents: "read" });
  });

  it("has exactly four jobs: check, registry-validate, npm-publish, registry-publish", () => {
    expect(Object.keys(jobs()).sort()).toEqual([...JOB_IDS].sort());
  });

  it("chains the jobs so that none runs unless the ones before it succeeded", () => {
    expect(needsOf(job("check"))).toEqual([]);
    expect(needsOf(job("registry-validate"))).toEqual(["check"]);
    expect(needsOf(job("npm-publish")).sort()).toEqual(["check", "registry-validate"]);
    expect(needsOf(job("registry-publish")).sort()).toEqual(["npm-publish", "registry-validate"]);
    // No `if` anywhere may override the implicit success(): always()/failure()/cancelled() would let a
    // job or step run after a failed guard.
    for (const { path, value } of strings(workflow())) {
      if (path.at(-1) === "if") expect(value, path.join(".")).not.toMatch(/always\(\)|failure\(\)|cancelled\(\)|success\(\)\s*\|\|/);
    }
  });

  it("runs the two publishing jobs only for a real run started from main, and the other two on every run", () => {
    expect(job("npm-publish").if).toBe(REAL_RUN_ON_MAIN);
    expect(job("registry-publish").if).toBe(REAL_RUN_ON_MAIN);
    expect(job("check").if).toBeUndefined();
    expect(job("registry-validate").if).toBeUndefined();
  });

  it("puts npm publish, the registry login and the registry publish only in those two jobs, once each", () => {
    for (const [re, jobId] of [[PUBLISH_RE, "npm-publish"], [REGISTRY_LOGIN_RE, "registry-publish"], [REGISTRY_PUBLISH_RE, "registry-publish"]] as const) {
      const where = Object.entries(jobs()).flatMap(([id, j]) => j.steps.filter((s) => re.test(s.run ?? "")).map(() => id));
      expect(where, String(re)).toEqual([jobId]);
    }
  });

  it("grants id-token: write to registry-publish alone, which runs a SHA-pinned checkout, the pinned binary, login github-oidc and publish, nothing else", () => {
    const withIdToken = Object.entries(jobs()).filter(([, j]) => j.permissions?.["id-token"] === "write");
    expect(withIdToken.map(([id]) => id)).toEqual(["registry-publish"]);
    const steps = job("registry-publish").steps;
    expect(steps).toHaveLength(4);
    expect(steps[0].uses).toMatch(/^actions\/checkout@[0-9a-f]{40}$/);
    expect(steps[0].with?.["persist-credentials"]).toBe(false);
    expect(steps[1].name).toMatch(/^Install mcp-publisher/);
    // Exactly github-oidc: the io.github.<repository_owner>/* grant holds for that login method only.
    expect(steps[2].run).toMatch(/^\s*"\$RUNNER_TEMP\/mcp-publisher" login github-oidc\s*$/m);
    expect(steps[2].run!.trim().split("\n")).toEqual(["set -euo pipefail", '"$RUNNER_TEMP/mcp-publisher" login github-oidc']);
    expect(steps[3].run).toMatch(/^\s*"\$RUNNER_TEMP\/mcp-publisher" publish\s*$/m);
    for (const s of steps) {
      expect(s.uses ?? "", s.name).not.toMatch(/setup-node/);
      expect(s.run ?? "", s.name).not.toMatch(/\bnpm\b|\bnode\b/);
      if (s.uses) expect(s.uses).toMatch(SHA_PINNED);
    }
  });

  it("gives NPM_TOKEN to npm-publish alone: environment npm-publish, no permissions, no checkout, every action SHA-pinned", () => {
    const j = job("npm-publish");
    expect(j.environment).toBe("npm-publish");
    expect(j.permissions).toEqual({});
    for (const s of j.steps) {
      expect(s.uses ?? "", s.name).not.toMatch(/checkout|setup-node/);
      if (s.uses) expect(s.uses, s.name).toMatch(SHA_PINNED);
    }
    // The order: token present, npmrc, token is mehudak's, tarball, publish, wait.
    const order = [
      indexOf("npm-publish", (s) => /^Guard - the npm-publish environment holds NPM_TOKEN/.test(s.name ?? "")),
      indexOf("npm-publish", (s) => /_authToken=\$\{NODE_AUTH_TOKEN\}/.test(s.run ?? "")),
      indexOf("npm-publish", (s) => /npm whoami/.test(s.run ?? "")),
      indexOf("npm-publish", (s) => /download-artifact/.test(s.uses ?? "")),
      indexOf("npm-publish", (s) => PUBLISH_RE.test(s.run ?? "")),
      indexOf("npm-publish", (s) => /registry\.npmjs\.org\/\$\{NAME/.test(s.run ?? "")),
    ];
    expect(order).toEqual([0, 1, 2, 3, 4, 5]);
  });

  it("references the secret only in npm-publish step env, and elsewhere only as the boolean `secrets.NPM_TOKEN != ''`", () => {
    const hits = strings(workflow()).filter((s) => /secrets\./.test(s.value));
    expect(hits.length).toBeGreaterThan(0);
    for (const { path, value } of hits) {
      const where = path.join(".");
      expect(path[0], where).toBe("jobs");
      expect(path[2], where).toBe("steps"); // never a job-level or workflow-level env
      expect(path.at(-2), where).toBe("env");
      if (path[1] === "npm-publish") expect(value, where).toBe("${{ secrets.NPM_TOKEN }}");
      else expect(value, where).toBe("${{ secrets.NPM_TOKEN != '' }}");
    }
    for (const run of runs()) expect(run).not.toMatch(/secrets\./);
    // NODE_AUTH_TOKEN is set on exactly the whoami step and the publish step.
    const withAuth = job("npm-publish").steps.filter((s) => s.env && "NODE_AUTH_TOKEN" in s.env);
    expect(withAuth.map((s) => (PUBLISH_RE.test(s.run ?? "") ? "publish" : /npm whoami/.test(s.run ?? "") ? "whoami" : s.name))).toEqual(["whoami", "publish"]);
  });

  it("never passes --provenance (it would link the npm page to the repo and its history)", () => {
    for (const run of runs()) expect(run).not.toMatch(/--provenance/);
    for (const { path, value } of strings(workflow())) {
      if (/provenance/i.test(path.join("."))) expect(value, path.join(".")).toBe("false");
    }
    expect(job("npm-publish").permissions?.["id-token"]).toBeUndefined();
  });

  it("publishes to npm the checked tarball, as public, with no lifecycle scripts and no dist-tag, once per version", () => {
    const publish = stepNamed("npm-publish", "Publish to npm");
    const lines = publish.run!.split("\n").map((l) => l.trim());
    expect(lines.filter((l) => /^npm publish\b/.test(l))).toEqual(['npm publish "$FILE" --access public --ignore-scripts']);
    expect(publish.if).toBe("${{ needs.check.outputs.already != 'true' }}");
    expect(publish.env?.NPM_CONFIG_PROVENANCE).toBe("false");
    // The sha512 comparison comes before the publish line.
    expect(publish.run!.indexOf("openssl dgst -sha512")).toBeGreaterThan(-1);
    expect(publish.run!.indexOf("openssl dgst -sha512")).toBeLessThan(publish.run!.indexOf("npm publish"));
  });
});

describe("the publish workflow: the check job", () => {
  it("guards first: owner (step 7), main for a real run, and no NPM_TOKEN outside the environment, before any action runs", () => {
    const steps = job("check").steps;
    expect(steps.slice(0, 3).map((s) => s.name)).toEqual([
      "Guard - the mehudak organisation owns this repository (owner step 7)",
      "Guard - a real run starts from main",
      "Guard - NPM_TOKEN is not a repository or organisation secret (owner step 9)",
    ]);
    expect(steps.findIndex((s) => s.uses)).toBe(3);
    // The owner comes from the runner's default variable, not an env: mapping the log header would print.
    const owner = steps[0];
    expect(owner.run).toMatch(/\$\{GITHUB_REPOSITORY_OWNER\}/);
    for (const v of Object.values(owner.env ?? {})) expect(v).not.toMatch(/repository_owner/);
  });

  it("installs without lifecycle scripts, tests and builds, then checks, then packs, then asks npm", () => {
    const steps = job("check").steps;
    const at = (re: RegExp) => steps.findIndex((s) => re.test(s.run ?? "") || re.test(s.name ?? "") || re.test(s.uses ?? ""));
    const order = [
      at(/actions\/checkout@v4/),
      at(/actions\/setup-node@v4/),
      at(/^npm ci --ignore-scripts\b/),
      at(/^npm test$/),
      at(/^npm run build$/),
      at(/^Check - versions/),
      at(/^Check - README\.md/),
      at(/^Pack - the tarball/),
      at(/^Check - is this version already on npm/),
      at(/upload-artifact/),
    ];
    expect(order.every((i) => i >= 0), JSON.stringify(order)).toBe(true);
    expect([...order].sort((a, b) => a - b)).toEqual(order);
    expect(runs().filter((r) => /npm (ci|install)\b/.test(r)).every((r) => /--ignore-scripts/.test(r))).toBe(true);
  });

  it("hands the tarball on only for a real run that will publish it", () => {
    const upload = job("check").steps.find((s) => /upload-artifact/.test(s.uses ?? ""))!;
    expect(upload.if).toBe("${{ !inputs.dry_run && steps.npmview.outputs.already != 'true' }}");
    expect(upload.with?.path).toBe("${{ runner.temp }}/pack/${{ steps.pack.outputs.tarball }}");
    const download = job("npm-publish").steps.find((s) => /download-artifact/.test(s.uses ?? ""))!;
    expect(download.with?.name).toBe(upload.with?.name);
  });

  it("runs the product's commands from products/mcp-il-tools", () => {
    for (const id of ["check", "registry-validate", "registry-publish"]) {
      expect(job(id).defaults?.run?.["working-directory"], id).toBe("products/mcp-il-tools");
    }
  });
});

describe("the publish workflow: mcp-publisher and the registry", () => {
  it("pins mcp-publisher to release v1.8.1 and its sha256, once, for both jobs that download it", () => {
    expect(workflow().env.MCP_PUBLISHER_VERSION).toBe(PIN.version);
    expect(workflow().env.MCP_PUBLISHER_SHA256).toBe(PIN.sha256);
    const text = workflowText();
    expect(text).not.toMatch(/releases\/latest/);
    const installs = allSteps().filter((s) => (s.name ?? "").startsWith("Install mcp-publisher"));
    expect(installs).toHaveLength(2);
    expect(installs[1].run).toBe(installs[0].run);
    for (const s of installs) expect(s["working-directory"]).toBe("${{ runner.temp }}");
    const run = installs[0].run!;
    expect(run).toMatch(/releases\/download\/\$\{MCP_PUBLISHER_VERSION\}/);
    expect(run).toContain('echo "${MCP_PUBLISHER_SHA256}  ${ASSET}" | sha256sum -c -');
    expect(run).toContain('if ! grep -qx "${MCP_PUBLISHER_SHA256}  ${ASSET}" "$SUMS"; then');
  });

  it("validates server.json against the live registry on every run, dry or real, before anything is published", () => {
    const steps = job("registry-validate").steps;
    expect(job("registry-validate").permissions).toEqual({ contents: "read" });
    const install = steps.findIndex((s) => (s.name ?? "").startsWith("Install mcp-publisher"));
    const validate = steps.findIndex((s) => REGISTRY_VALIDATE_RE.test(s.run ?? ""));
    expect(install).toBeGreaterThanOrEqual(0);
    expect(validate).toBeGreaterThan(install);
    expect(steps[validate].if).toBeUndefined();
    for (const s of steps) {
      expect(s.run ?? "").not.toMatch(REGISTRY_LOGIN_RE);
      expect(s.run ?? "").not.toMatch(REGISTRY_PUBLISH_RE);
    }
  });
});

/*
 * The checks above read the workflow. These run its step scripts the way the runner would (bash, the
 * workflow's, job's and step's env with their ${{ }} expressions filled in), in a temp directory, against
 * stubs for npm, curl, sleep and uname on PATH. Nothing is asked of npm, GitHub or the registry.
 */
describe("the workflow's steps, executed", () => {
  const scratch = mkdtempSync(join(tmpdir(), "mcp-publish-steps-"));
  afterAll(() => rmSync(scratch, { recursive: true, force: true }));
  let n = 0;
  const urlFile = (url: string) => url.replace(/[/:%@]/g, "_");

  type Box = { dir: string; bin: string; curl: string; log: string };
  /** A fresh directory with stubs. Every stub call is appended to `log`; curl serves files from `curl/`. */
  function sandbox(): Box {
    const dir = join(scratch, String(n++));
    const bin = join(dir, "bin");
    const curl = join(dir, "curl");
    mkdirSync(bin, { recursive: true });
    mkdirSync(curl, { recursive: true });
    const stub = (name: string, body: string) => {
      writeFileSync(join(bin, name), `#!/usr/bin/env bash\n${body}`);
      chmodSync(join(bin, name), 0o755);
    };
    stub("npm", `echo "npm $*" >> "$STUB_LOG"
case "$1" in
  pack) printf '%s' "$FAKE_PACK" ;;
  view) printf '%s\\n' "\${FAKE_VIEW:-}"; exit "\${FAKE_VIEW_STATUS:-0}" ;;
  whoami) if [ -n "\${FAKE_WHOAMI:-}" ]; then printf '%s\\n' "$FAKE_WHOAMI"; else echo "npm error code E401" >&2; exit 1; fi ;;
  publish) exit 0 ;;
  --version) echo 10.9.7 ;;
  *) echo "stub npm: unexpected $*" >&2; exit 2 ;;
esac
`);
    stub("curl", `out=""; url=""
while [ $# -gt 0 ]; do
  case "$1" in
    -o) out="$2"; shift 2 ;;
    -H|--max-time|--retry) shift 2 ;;
    -*) shift ;;
    *) url="$1"; shift ;;
  esac
done
echo "curl $url" >> "$STUB_LOG"
src="$FAKE_CURL_DIR/$(printf '%s' "$url" | sed 's#[/:%@]#_#g')"
[ -f "$src" ] || { echo "curl: (22) The requested URL returned error: 404" >&2; exit 22; }
if [ -n "$out" ]; then cp "$src" "$out"; else cat "$src"; fi
`);
    stub("sleep", `echo "sleep $*" >> "$STUB_LOG"\n`);
    stub("uname", `case "$1" in -s) echo "\${FAKE_UNAME_S:-Linux}" ;; -m) echo "\${FAKE_UNAME_M:-x86_64}" ;; *) echo Linux ;; esac\n`);
    const log = join(dir, "stub.log");
    for (const f of ["output", "summary", "stub.log"]) writeFileSync(join(dir, f), "");
    return { dir, bin, curl, log };
  }

  /** Run a step: workflow, job and step env with `${{ expr }}` taken from `vars`, the runner files, then `extra`. */
  function run(jobId: string, s: Step, box: Box, vars: Record<string, string> = {}, extra: Record<string, string> = {}) {
    const env: Record<string, string> = {
      PATH: `${box.bin}:${dirname(process.execPath)}:${process.env.PATH ?? ""}`,
      HOME: box.dir,
      GITHUB_OUTPUT: join(box.dir, "output"),
      GITHUB_STEP_SUMMARY: join(box.dir, "summary"),
      RUNNER_TEMP: box.dir,
      STUB_LOG: box.log,
      FAKE_CURL_DIR: box.curl,
    };
    for (const layer of [workflow().env ?? {}, job(jobId).env ?? {}, s.env ?? {}]) {
      for (const [k, v] of Object.entries(layer as Record<string, string>)) {
        const expr = /^\$\{\{\s*(.+?)\s*\}\}$/.exec(String(v));
        env[k] = expr ? (vars[expr[1]] ?? "") : String(v);
      }
    }
    const r = spawnSync("bash", ["--noprofile", "--norc", "-e", "-o", "pipefail", "-c", s.run!], { cwd: box.dir, env: { ...env, ...extra }, encoding: "utf8" });
    return {
      status: r.status,
      out: `${r.stdout}${r.stderr}`,
      output: readFileSync(env.GITHUB_OUTPUT, "utf8"),
      calls: readFileSync(box.log, "utf8").split("\n").filter(Boolean),
    };
  }

  describe("the owner guard (step 7)", () => {
    const guard = (owner: string, dry: boolean) =>
      run("check", stepNamed("check", "Guard - the mehudak"), sandbox(), { "inputs.dry_run": String(dry) }, { GITHUB_REPOSITORY_OWNER: owner });

    it("passes a real run when the mehudak organisation owns the repository", () => {
      expect(guard("mehudak", false).status).toBe(0);
    });
    it("stops a real run from any other owner, naming step 7, without printing that owner", () => {
      const r = guard("some-personal-account", false);
      expect(r.status).toBe(1);
      expect(r.out).toMatch(/::error::Owner step 7 is not done yet/);
      expect(r.out).not.toContain("some-personal-account");
    });
    it("compares case-sensitively, as the registry's permission prefix does", () => {
      expect(guard("Mehudak", false).status).toBe(1);
    });
    it("lets a dry run continue from any owner, with a notice", () => {
      const r = guard("some-personal-account", true);
      expect(r.status).toBe(0);
      expect(r.out).toMatch(/::notice::.*step 7/);
    });
  });

  describe("the main-branch guard", () => {
    const guard = (ref: string, dry: boolean) =>
      run("check", stepNamed("check", "Guard - a real run starts from main"), sandbox(), { "inputs.dry_run": String(dry) }, { GITHUB_REF: ref });

    it("passes a real run from main", () => {
      expect(guard("refs/heads/main", false).status).toBe(0);
    });
    it.each([["refs/heads/claude/new-session-x"], ["refs/tags/v0.1.0"], ["refs/heads/main-2"]])("stops a real run from %s", (ref) => {
      const r = guard(ref, false);
      expect(r.status).toBe(1);
      expect(r.out).toMatch(/::error::A real run publishes only from main/);
    });
    it("lets a dry run start from any branch", () => {
      expect(guard("refs/heads/claude/new-session-x", true).status).toBe(0);
    });
  });

  describe("the NPM_TOKEN placement guard", () => {
    const guard = (outside: string, dry: boolean) =>
      run("check", stepNamed("check", "Guard - NPM_TOKEN is not"), sandbox(), { "secrets.NPM_TOKEN != ''": outside, "inputs.dry_run": String(dry) });

    it("passes when no repository or organisation secret NPM_TOKEN exists", () => {
      expect(guard("false", false).status).toBe(0);
    });
    it.each([[true], [false]])("fails when one exists (dry run: %s), because every branch could read it", (dry) => {
      const r = guard("true", dry);
      expect(r.status).toBe(1);
      expect(r.out).toMatch(/::error::NPM_TOKEN is stored as a repository or organisation secret/);
    });
    it("fails closed on anything but the literal false", () => {
      expect(guard("", false).status).toBe(1);
    });
  });

  describe("the consistency check", () => {
    function check(edit: (p: Record<string, any>, s: Record<string, any>) => void = () => {}) {
      const box = sandbox();
      const p = pkg();
      const s = server();
      edit(p, s);
      writeFileSync(join(box.dir, "package.json"), JSON.stringify(p));
      writeFileSync(join(box.dir, "server.json"), JSON.stringify(s));
      return run("check", stepNamed("check", "Check - versions"), box);
    }

    it("passes the committed files and hands their name, version and server name to the later steps", () => {
      const r = check();
      expect(r.status, r.out).toBe(0);
      expect(r.output).toContain(`name=${pkg().name}\n`);
      expect(r.output).toContain(`version=${pkg().version}\n`);
      expect(r.output).toContain(`server=${server().name}\n`);
    });
    it.each([
      ["package.json version alone", (p: any) => (p.version = "9.9.9")],
      ["server.json version alone", (_: any, s: any) => (s.version = "9.9.9")],
      ["packages[0].version alone", (_: any, s: any) => (s.packages[0].version = "9.9.9")],
      ["mcpName", (p: any) => (p.mcpName = "io.github.mehudak/other")],
      ["identifier", (_: any, s: any) => (s.packages[0].identifier = "@mehudak/other")],
      ["a namespace outside io.github.mehudak/", (p: any, s: any) => (p.mcpName = s.name = "com.mehudak/il-tools")],
      ["an author field", (p: any) => (p.author = "A Person")],
      ["a repository field", (p: any) => (p.repository = "github:someone/automaton")],
    ])("fails when %s disagrees or is added", (_label, edit) => {
      const r = check(edit);
      expect(r.status).toBe(1);
      expect(r.out).toMatch(/::error/);
    });
  });

  describe("the README check", () => {
    function readmeCheck(text: string) {
      const box = sandbox();
      writeFileSync(join(box.dir, "README.md"), text);
      return run("check", stepNamed("check", "Check - README.md"), box);
    }

    it("passes the committed README", () => {
      const r = readmeCheck(readme());
      expect(r.status, r.out).toBe(0);
    });
    it.each([
      ["**Status on 28.9.2026:** see below."],
      ["This package is not on npm yet."],
      ["One manual run publishes it, and that run has not happened."],
      ["Registry name (planned, not listed in any registry yet)."],
      ["It stops until owner step 9 is done."],
      ["saved as the repository secret NPM_TOKEN"],
      ["(`KILLED_LINES` in `src/revenue/portfolio.ts`)"],
      ["[`products/x402-il-api`](../x402-il-api)"],
    ])("fails a README containing %s", (line) => {
      const r = readmeCheck(`${readme()}\n${line}\n`);
      expect(r.status).toBe(1);
      expect(r.out).toMatch(/::error file=products\/mcp-il-tools\/README\.md::/);
    });
  });

  describe("the pack step", () => {
    const CLEAN = ["LICENSE", "README.md", "dist/israeli.js", "dist/server.js", "package.json", "src/israeli.ts", "src/server.ts"];
    const INTEGRITY = "sha512-AAAA";
    function pack(files: string[], integrity: string | null = INTEGRITY) {
      const box = sandbox();
      const out = [{ name: "@mehudak/mcp-il-tools", version: "0.1.0", size: 1, filename: "mehudak-mcp-il-tools-0.1.0.tgz", integrity, files: files.map((path) => ({ path })) }];
      return run("check", stepNamed("check", "Pack - the tarball"), box, {}, { FAKE_PACK: JSON.stringify(out) });
    }

    it("packs without lifecycle scripts, passes the files the package is meant to ship, and hands on the file name and integrity", () => {
      const r = pack(CLEAN);
      expect(r.status, r.out).toBe(0);
      expect(r.output).toBe(`tarball=mehudak-mcp-il-tools-0.1.0.tgz\nintegrity=${INTEGRITY}\n`);
      expect(r.calls[0]).toMatch(/^npm pack --ignore-scripts --json --pack-destination \S+\/pack$/);
    });
    it.each([["tests/server.test.ts"], ["node_modules/zod/index.js"], [".env"], [".env.local"], ["src/.env"], ["tsconfig.json"], ["docs/notes.md"], ["dist/tests/x.js"], ["MAINTAINING.md"]])(
      "fails when the tarball also holds %s",
      (extra) => {
        const r = pack([...CLEAN, extra]);
        expect(r.status).toBe(1);
        expect(r.out).toContain(`::error::the tarball contains ${extra}`);
        expect(r.output).toBe("");
      },
    );
    it("fails when npm reports no sha512 integrity", () => {
      expect(pack(CLEAN, null).status).toBe(1);
      expect(pack(CLEAN, "sha1-abc").status).toBe(1);
    });
  });

  describe("the already-on-npm check", () => {
    const LOCAL = "sha512-local";
    const vars = { "steps.meta.outputs.name": "@mehudak/mcp-il-tools", "steps.meta.outputs.version": "0.1.0", "steps.pack.outputs.integrity": LOCAL };
    const view = (fake: string, status = 0) => run("check", stepNamed("check", "Check - is this version already on npm"), sandbox(), vars, { FAKE_VIEW: fake, FAKE_VIEW_STATUS: String(status) });
    const manifest = (user: string, integrity = LOCAL) => JSON.stringify({ name: "@mehudak/mcp-il-tools", version: "0.1.0", _npmUser: { name: user, email: "x@example.com" }, dist: { integrity } });

    it("reports already=false when npm answers E404", () => {
      const r = view(JSON.stringify({ error: { code: "E404", summary: "Not Found" } }), 1);
      expect(r.status, r.out).toBe(0);
      expect(r.output).toBe("already=false\n");
    });
    it("reports already=false when npm answers nothing (older npm, missing version)", () => {
      const r = view("", 0);
      expect(r.status, r.out).toBe(0);
      expect(r.output).toBe("already=false\n");
    });
    it.each([[JSON.stringify({ error: { code: "E500" } })], ["not json"]])("fails, rather than guess, when npm errs otherwise (%s)", (fake) => {
      const r = view(fake, 1);
      expect(r.status).toBe(1);
      expect(r.output).toBe("");
    });
    it("reports already=true only for our own, byte-identical version", () => {
      const r = view(manifest("mehudak"), 0);
      expect(r.status, r.out).toBe(0);
      expect(r.output).toBe("already=true\n");
    });
    it("fails when the version was published by another npm user, without naming that user", () => {
      const r = view(manifest("some-squatter"), 0);
      expect(r.status).toBe(1);
      expect(r.out).toMatch(/not published by the npm user mehudak/);
      expect(r.out).not.toContain("some-squatter");
      expect(r.output).toBe("");
    });
    it("fails when our version on npm is not the tarball this commit packs, and says to bump the version", () => {
      const r = view(manifest("mehudak", "sha512-other"), 0);
      expect(r.status).toBe(1);
      expect(r.out).toMatch(/Change the version/);
    });
  });

  describe("the npm-publish job", () => {
    const vars = {
      "needs.check.outputs.name": "@mehudak/mcp-il-tools",
      "needs.check.outputs.version": "0.1.0",
      "needs.check.outputs.server": "io.github.mehudak/il-tools",
      "needs.check.outputs.tarball": "mehudak-mcp-il-tools-0.1.0.tgz",
    };

    it("stops when the environment has no NPM_TOKEN, naming step 9 and the token settings", () => {
      const guard = stepNamed("npm-publish", "Guard - the npm-publish environment holds NPM_TOKEN");
      const empty = run("npm-publish", guard, sandbox(), { "secrets.NPM_TOKEN": "" });
      expect(empty.status).toBe(1);
      expect(empty.out).toMatch(/::error::Owner step 9 is not done yet/);
      for (const s of ["Read and write (publish and stage)", "All Packages", "Bypass two-factor authentication"]) expect(empty.out).toContain(s);
      const set = run("npm-publish", guard, sandbox(), { "secrets.NPM_TOKEN": "npm_secretvalue" });
      expect(set.status).toBe(0);
      expect(set.out).not.toContain("npm_secretvalue");
    });

    it("writes an .npmrc that reads the token from NODE_AUTH_TOKEN and holds no token itself", () => {
      const box = sandbox();
      const r = run("npm-publish", stepNamed("npm-publish", "Point npm at the registry"), box, vars);
      expect(r.status, r.out).toBe(0);
      expect(readFileSync(join(box.dir, ".npmrc"), "utf8")).toBe("registry=https://registry.npmjs.org/\n//registry.npmjs.org/:_authToken=${NODE_AUTH_TOKEN}\n");
    });

    describe("the token owner check", () => {
      const whoami = (who: string) => run("npm-publish", stepNamed("npm-publish", "Check - NPM_TOKEN is the npm user mehudak"), sandbox(), { ...vars, "secrets.NPM_TOKEN": "npm_x" }, who ? { FAKE_WHOAMI: who } : {});
      it("passes a token of the npm user mehudak", () => {
        expect(whoami("mehudak").status).toBe(0);
      });
      it("fails a token of any other account, without printing that account", () => {
        const r = whoami("personal-name");
        expect(r.status).toBe(1);
        expect(r.out).toMatch(/::error::NPM_TOKEN does not authenticate as the npm user mehudak/);
        expect(r.out).not.toContain("personal-name");
      });
      it("fails an expired or revoked token", () => {
        expect(whoami("").status).toBe(1);
      });
    });

    describe("the publish step", () => {
      function publish(tamper: boolean) {
        const box = sandbox();
        mkdirSync(join(box.dir, "tarball"));
        const bytes = Buffer.from("the packed tarball");
        writeFileSync(join(box.dir, "tarball", vars["needs.check.outputs.tarball"]), tamper ? Buffer.from("something else") : bytes);
        const integrity = `sha512-${createHash("sha512").update(bytes).digest("base64")}`;
        const r = run("npm-publish", stepNamed("npm-publish", "Publish to npm"), box, { ...vars, "needs.check.outputs.integrity": integrity, "secrets.NPM_TOKEN": "npm_x" });
        return { ...r, file: join(box.dir, "tarball", vars["needs.check.outputs.tarball"]) };
      }

      it("publishes exactly the checked tarball: public, no lifecycle scripts, no dist-tag, no provenance", () => {
        const r = publish(false);
        expect(r.status, r.out).toBe(0);
        expect(r.calls).toEqual([`npm publish ${r.file} --access public --ignore-scripts`]);
      });
      it("publishes nothing when the tarball it received is not the one the check job packed", () => {
        const r = publish(true);
        expect(r.status).toBe(1);
        expect(r.calls).toEqual([]);
      });
    });

    describe("the wait for npm", () => {
      const URL = "https://registry.npmjs.org/@mehudak%2Fmcp-il-tools/0.1.0";
      function wait(body: string | null) {
        const box = sandbox();
        if (body !== null) writeFileSync(join(box.curl, urlFile(URL)), body);
        return run("npm-publish", stepNamed("npm-publish", "Wait until npm serves"), box, vars);
      }
      const served = (mcpName: string) => JSON.stringify({ name: "@mehudak/mcp-il-tools", version: "0.1.0", mcpName });

      it("asks the exact URL the registry reads, and passes once it serves our mcpName", () => {
        const r = wait(served("io.github.mehudak/il-tools"));
        expect(r.status, r.out).toBe(0);
        expect(r.calls).toEqual([`curl ${URL}`]);
      });
      it("keeps asking for five minutes, then fails, when the version carries another mcpName", () => {
        const r = wait(served("io.github.someone/else"));
        expect(r.status).toBe(1);
        expect(r.calls.filter((c) => c.startsWith("curl "))).toHaveLength(30);
        expect(r.calls.filter((c) => c === "sleep 10")).toHaveLength(30);
        expect(r.out).toMatch(/::error::.*does not serve mcpName io\.github\.mehudak\/il-tools/);
      });
      it("fails when npm never serves the version", () => {
        expect(wait(null).status).toBe(1);
      });
    });
  });

  describe("the mcp-publisher install", () => {
    const BASE = `https://github.com/modelcontextprotocol/registry/releases/download/${PIN.version}`;
    const ASSET = "mcp-publisher_linux_amd64.tar.gz";
    const SUMS = `registry_${PIN.version.slice(1)}_checksums.txt`;

    /** A release with a real tar.gz holding a fake mcp-publisher; `pinOf` picks the archive whose sha the pin names. */
    function install(opts: { tamper?: boolean; sumsListsIt?: boolean; arch?: string } = {}) {
      const box = sandbox();
      const make = (label: string) => {
        const src = join(box.dir, `src-${label}`);
        mkdirSync(src);
        writeFileSync(join(src, "mcp-publisher"), `#!/bin/sh\necho "mcp-publisher ${label} $*"\n`);
        chmodSync(join(src, "mcp-publisher"), 0o755);
        const out = join(box.dir, `${label}.tar.gz`);
        spawnSync("tar", ["-czf", out, "-C", src, "mcp-publisher"]);
        return { path: out, sha: createHash("sha256").update(readFileSync(out)).digest("hex") };
      };
      const good = make("good");
      const served = opts.tamper ? make("tampered") : good;
      writeFileSync(join(box.curl, urlFile(`${BASE}/${ASSET}`)), readFileSync(served.path));
      const listed = opts.sumsListsIt === false ? "0".repeat(64) : good.sha;
      writeFileSync(join(box.curl, urlFile(`${BASE}/${SUMS}`)), `${"1".repeat(64)}  mcp-publisher_darwin_arm64.tar.gz\n${listed}  ${ASSET}\n`);
      const step = stepNamed("registry-validate", "Install mcp-publisher");
      return run("registry-validate", step, box, {}, { MCP_PUBLISHER_SHA256: good.sha, FAKE_UNAME_M: opts.arch ?? "x86_64" });
    }

    it("downloads the pinned release, checks it against the pin and the release's checksums file, and runs it", () => {
      const r = install();
      expect(r.status, r.out).toBe(0);
      expect(r.out).toContain("mcp-publisher good --version");
      expect(r.calls).toEqual([`curl ${BASE}/${ASSET}`, `curl ${BASE}/${SUMS}`]);
    });
    it("fails when the downloaded archive is not the pinned one", () => {
      const r = install({ tamper: true });
      expect(r.status).not.toBe(0);
      expect(r.out).not.toContain("mcp-publisher tampered");
    });
    it("fails when the release's checksums file does not list the pinned digest", () => {
      const r = install({ sumsListsIt: false });
      expect(r.status).toBe(1);
      expect(r.out).toMatch(/::error::registry_1\.8\.1_checksums\.txt from the release does not list/);
    });
    it("fails on anything but linux amd64", () => {
      expect(install({ arch: "aarch64" }).status).toBe(1);
    });
    it("leaves no binary behind in the repository's product directory", () => {
      expect(existsSync(join(PRODUCT, "mcp-publisher"))).toBe(false);
    });
  });
});
