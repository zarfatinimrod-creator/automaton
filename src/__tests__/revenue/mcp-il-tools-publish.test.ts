import { afterAll, describe, expect, it } from "vitest";
import { spawnSync } from "node:child_process";
import { chmodSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { parse } from "yaml";

/**
 * The free MCP server (products/mcp-il-tools) is published by ONE manual dispatch of
 * .github/workflows/mcp-il-tools-publish.yml, once the owner has done step 7 (the "mehudak"
 * GitHub organisation owns this repo) and step 9 (an npm account "mehudak" plus the NPM_TOKEN
 * repository secret). Nothing publishes it before then.
 *
 * These tests pin the things that would go wrong silently: a name the registry would refuse,
 * a field that prints a person's name on npm, a trigger that publishes without anyone pressing
 * the button, and a token that leaks into a command line.
 *
 * Sources for the registry rules (modelcontextprotocol/registry, read 28.9.2026 at main
 * bf4e88c and at the release tag v1.8.1 = f52dc85):
 *   - internal/api/handlers/v0/auth/github_oidc.go buildPermissions: a GitHub Actions OIDC
 *     token grants publish on io.github.<repository_owner>/* and nothing else.
 *   - internal/validators/registries/npm.go validateNPMPackage: fetches
 *     registry.npmjs.org/<identifier>/<version> and requires its "mcpName" to equal the
 *     server.json "name".
 *   - pkg/model/constants.go CurrentSchemaVersion = "2025-12-11"; the schema file
 *     internal/validators/schemas/2025-12-11.json caps "description" at 100 characters.
 */

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const PRODUCT = join(ROOT, "products", "mcp-il-tools");
const WORKFLOW = join(ROOT, ".github", "workflows", "mcp-il-tools-publish.yml");

const readJson = (path: string) => JSON.parse(readFileSync(path, "utf8")) as Record<string, any>;
const pkg = () => readJson(join(PRODUCT, "package.json"));
const server = () => readJson(join(PRODUCT, "server.json"));
const workflowText = () => readFileSync(WORKFLOW, "utf8");
const workflow = () => parse(workflowText()) as Record<string, any>;

type Step = { name?: string; uses?: string; run?: string; if?: string; env?: Record<string, string>; with?: Record<string, unknown> };
const jobs = () => Object.entries(workflow().jobs as Record<string, { steps: Step[]; permissions?: Record<string, string>; needs?: string | string[] }>);
const allSteps = () => jobs().flatMap(([, job]) => job.steps);
const runs = () => allSteps().map((s) => s.run ?? "").filter(Boolean);

/** Every string in the parsed workflow, with the key path that leads to it. Comments are not strings. */
function strings(node: unknown, path: string[] = []): { path: string[]; value: string }[] {
  if (typeof node === "string") return [{ path, value: node }];
  if (Array.isArray(node)) return node.flatMap((v, i) => strings(v, [...path, String(i)]));
  if (node && typeof node === "object") return Object.entries(node).flatMap(([k, v]) => strings(v, [...path, k]));
  return [];
}

// A command at the start of a line, so `echo "would run npm publish"` in a dry-run summary does not count.
const PUBLISH_RE = /^\s*npm publish\b(?![^\n]*--dry-run)/m;
const REGISTRY_LOGIN_RE = /^\s*"?(\S*\/)?mcp-publisher"?\s+login\b/m;
const REGISTRY_PUBLISH_RE = /^\s*"?(\S*\/)?mcp-publisher"?\s+publish\b/m;

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

describe("the publish workflow", () => {
  it("parses, and runs only when someone dispatches it", () => {
    const wf = workflow();
    expect(Object.keys(wf.on)).toEqual(["workflow_dispatch"]);
  });

  it("has a dry_run boolean input that defaults to true", () => {
    const input = workflow().on.workflow_dispatch.inputs.dry_run;
    expect(input.type).toBe("boolean");
    expect(input.default).toBe(true);
  });

  it("grants only contents: read at the top level", () => {
    expect(workflow().permissions).toEqual({ contents: "read" });
  });

  it("grants id-token: write on exactly one job, the one that logs in to the registry", () => {
    const withIdToken = jobs().filter(([, job]) => job.permissions?.["id-token"] === "write");
    expect(withIdToken.map(([id]) => id)).toHaveLength(1);
    const [, job] = withIdToken[0];
    expect(job.steps.some((s) => REGISTRY_LOGIN_RE.test(s.run ?? ""))).toBe(true);
    // ...and the npm publish is NOT in that job: without an OIDC token npm cannot attach provenance.
    expect(job.steps.some((s) => PUBLISH_RE.test(s.run ?? ""))).toBe(false);
  });

  it("guards first: the owner check (step 7) and the NPM_TOKEN check (step 9) come before any other step", () => {
    const [first] = jobs().filter(([, job]) => !job.needs);
    expect(first, "one job with no `needs` runs first").toBeDefined();
    const [, job] = first;
    const guardIdx = (re: RegExp) => job.steps.findIndex((s) => re.test(`${s.run ?? ""}\n${JSON.stringify(s.env ?? {})}`));
    const owner = guardIdx(/github\.repository_owner/);
    const token = guardIdx(/secrets\.NPM_TOKEN/);
    expect(owner).toBeGreaterThanOrEqual(0);
    expect(token).toBeGreaterThanOrEqual(0);
    expect(Math.max(owner, token)).toBeLessThan(2); // steps 0 and 1: nothing runs before them
    expect(job.steps[owner].run).toMatch(/mehudak/);
    expect(job.steps[owner].run).toMatch(/step 7/);
    expect(job.steps[owner].run).toMatch(/exit 1/);
    expect(job.steps[token].run).toMatch(/step 9/);
    expect(job.steps[token].run).toMatch(/exit 1/);
    // Both only fail a real run: a dry run on a personal repo with no token must still go green.
    expect(job.steps[owner].run).toMatch(/DRY_RUN/);
    expect(job.steps[token].run).toMatch(/DRY_RUN/);
    // Every other job waits for this one, so no job slips past the guards.
    for (const [id, other] of jobs()) {
      if (id === first[0]) continue;
      expect([other.needs].flat(), id).toContain(first[0]);
    }
  });

  it("never passes --provenance (it would link the npm page to the repo and its history)", () => {
    for (const run of runs()) expect(run).not.toMatch(/--provenance/);
    for (const { path, value } of strings(workflow())) {
      if (/provenance/i.test(path.join("."))) expect(value, path.join(".")).toBe("false");
    }
  });

  it("skips npm publish, the registry login and the registry publish on a dry run", () => {
    const gated = allSteps().filter((s) => [PUBLISH_RE, REGISTRY_LOGIN_RE, REGISTRY_PUBLISH_RE].some((re) => re.test(s.run ?? "")));
    expect(gated.length).toBe(3);
    for (const s of gated) expect(s.if, s.name).toMatch(/!\s*inputs\.dry_run/);
  });

  it("publishes to npm as public, once per version", () => {
    const publish = allSteps().filter((s) => PUBLISH_RE.test(s.run ?? ""));
    expect(publish).toHaveLength(1);
    expect(publish[0].run).toMatch(/npm publish --access public/);
    expect(publish[0].if).toMatch(/already/);
    expect(runs().join("\n")).toMatch(/npm view /);
  });

  it("refuses a tarball with anything outside dist/, src/, README.md, package.json and LICENSE", () => {
    const pack = runs().find((r) => /npm pack --dry-run --json/.test(r));
    expect(pack).toBeDefined();
    for (const bad of ["tests/", "node_modules/", ".env"]) expect(pack).toContain(bad);
  });

  it("checks that the version triple, mcpName and the npm identifier agree before publishing", () => {
    const check = runs().find((r) => /mcpName/.test(r) && /packages\[0\]\.version/.test(r));
    expect(check).toBeDefined();
    expect(check).toMatch(/identifier/);
  });

  it("downloads mcp-publisher from a pinned release, not `latest`, and checks its sha256", () => {
    const text = runs().join("\n") + "\n" + JSON.stringify(strings(workflow()).map((s) => s.value));
    expect(text).not.toMatch(/releases\/latest/);
    expect(text).toMatch(/releases\/download\/\$\{?MCP_PUBLISHER_VERSION\}?/);
    const env = jobs().flatMap(([, job]) => [(job as any).env ?? {}]).reduce((a, b) => ({ ...a, ...b }), {});
    expect(env.MCP_PUBLISHER_VERSION).toMatch(/^v\d+\.\d+\.\d+$/);
    expect(env.MCP_PUBLISHER_SHA256).toMatch(/^[0-9a-f]{64}$/);
    expect(text).toMatch(/sha256sum -c/);
  });

  it("references secrets.NPM_TOKEN only as an env value, never inline in a run: line", () => {
    const hits = strings(workflow()).filter((s) => /secrets\.NPM_TOKEN/.test(s.value));
    expect(hits.length).toBeGreaterThan(0);
    for (const { path } of hits) expect(path.at(-2), path.join(".")).toBe("env");
    for (const run of runs()) expect(run).not.toMatch(/secrets\./);
  });
});

/*
 * The checks above read the workflow's text. These run its guard and check steps, the way the runner
 * would (bash, the step's env), against fixtures in a temp directory, so a guard that compares against the
 * wrong name or a check that lost a condition fails here even when the words are still in the file.
 * `npm` is replaced by a stub on PATH: nothing is packed from, or asked of, the real registry.
 */
describe("the workflow's guard and check steps, executed", () => {
  const scratch = mkdtempSync(join(tmpdir(), "mcp-publish-steps-"));
  afterAll(() => rmSync(scratch, { recursive: true, force: true }));
  let n = 0;

  const npmJob = () => workflow().jobs.npm as { steps: (Step & { id?: string })[] };
  const step = (prefix: string) => {
    const s = npmJob().steps.find((x) => (x.name ?? "").startsWith(prefix));
    if (!s?.run) throw new Error(`no step named "${prefix}..." with a run block in the npm job`);
    return s;
  };

  /** A fresh directory with a stub `npm`: `npm pack` prints $FAKE_PACK, `npm view` prints $FAKE_VIEW or fails. */
  function sandbox() {
    const dir = join(scratch, String(n++));
    const bin = join(dir, "bin");
    spawnSync("mkdir", ["-p", bin]);
    const npm = join(bin, "npm");
    writeFileSync(npm, `#!/usr/bin/env bash
case "$1" in
  pack) printf '%s' "$FAKE_PACK" ;;
  view) if [ -n "\${FAKE_VIEW:-}" ]; then printf '%s\\n' "$FAKE_VIEW"; else echo "npm error 404" >&2; exit 1; fi ;;
  *) echo "stub npm: unexpected $*" >&2; exit 2 ;;
esac
`);
    chmodSync(npm, 0o755);
    writeFileSync(join(dir, "output"), "");
    writeFileSync(join(dir, "summary"), "");
    return { dir, bin };
  }

  /** Run a step: its env expressions resolved from `vars`, plus the runner files, plus `extra`. */
  function run(s: Step, box: { dir: string; bin: string }, vars: Record<string, string>, extra: Record<string, string> = {}) {
    const env: Record<string, string> = {
      PATH: `${box.bin}:${dirname(process.execPath)}:${process.env.PATH ?? ""}`,
      HOME: box.dir,
      GITHUB_OUTPUT: join(box.dir, "output"),
      GITHUB_STEP_SUMMARY: join(box.dir, "summary"),
      RUNNER_TEMP: box.dir,
    };
    for (const [k, v] of Object.entries(s.env ?? {})) {
      const expr = /^\$\{\{\s*(.+?)\s*\}\}$/.exec(String(v));
      env[k] = expr ? (vars[expr[1]] ?? "") : String(v);
    }
    const r = spawnSync("bash", ["--noprofile", "--norc", "-e", "-o", "pipefail", "-c", s.run!], { cwd: box.dir, env: { ...env, ...extra }, encoding: "utf8" });
    return { status: r.status, out: `${r.stdout}${r.stderr}`, output: readFileSync(env.GITHUB_OUTPUT, "utf8") };
  }

  describe("the owner guard (step 7)", () => {
    const guard = (owner: string, dry: boolean) =>
      run(step("Guard - the mehudak"), sandbox(), { "github.repository_owner": owner, "inputs.dry_run": String(dry) });

    it("passes a real run when the mehudak organisation owns the repository", () => {
      expect(guard("mehudak", false).status).toBe(0);
    });
    it("stops a real run from any other owner, naming step 7, without printing that owner", () => {
      const r = guard("some-personal-account", false);
      expect(r.status).toBe(1);
      expect(r.out).toMatch(/::error::Owner step 7 is not done yet/);
      expect(r.out).not.toContain("some-personal-account");
    });
    it("lets a dry run continue from any owner, with a notice", () => {
      const r = guard("some-personal-account", true);
      expect(r.status).toBe(0);
      expect(r.out).toMatch(/::notice::.*step 7/);
    });
  });

  describe("the NPM_TOKEN guard (step 9)", () => {
    const guard = (token: string, dry: boolean) =>
      run(step("Guard - the NPM_TOKEN"), sandbox(), { "secrets.NPM_TOKEN": token, "inputs.dry_run": String(dry) });

    it("passes a real run when the secret is set, without printing it", () => {
      const r = guard("npm_secretvalue", false);
      expect(r.status).toBe(0);
      expect(r.out).not.toContain("npm_secretvalue");
    });
    it("stops a real run when the secret is empty, naming step 9", () => {
      const r = guard("", false);
      expect(r.status).toBe(1);
      expect(r.out).toMatch(/::error::Owner step 9 is not done yet/);
    });
    it("lets a dry run continue without the secret, with a notice", () => {
      const r = guard("", true);
      expect(r.status).toBe(0);
      expect(r.out).toMatch(/::notice::.*step 9/);
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
      return run(step("Check - versions"), box, {});
    }

    it("passes the committed files and hands their name and version to the later steps", () => {
      const r = check();
      expect(r.status, r.out).toBe(0);
      expect(r.output).toContain(`name=${pkg().name}\n`);
      expect(r.output).toContain(`version=${pkg().version}\n`);
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

  describe("the tarball check", () => {
    const CLEAN = ["LICENSE", "README.md", "dist/israeli.js", "dist/server.js", "package.json", "src/israeli.ts", "src/server.ts"];
    function packCheck(files: string[]) {
      const box = sandbox();
      const pack = [{ name: "@mehudak/mcp-il-tools", version: "0.1.0", size: 1, filename: "x.tgz", files: files.map((path) => ({ path })) }];
      return run(step("Check - the tarball"), box, {}, { FAKE_PACK: JSON.stringify(pack) });
    }

    it("passes the files the package is meant to ship", () => {
      const r = packCheck(CLEAN);
      expect(r.status, r.out).toBe(0);
    });
    it.each([["tests/server.test.ts"], ["node_modules/zod/index.js"], [".env"], [".env.local"], ["src/.env"], ["tsconfig.json"], ["docs/notes.md"], ["dist/tests/x.js"]])(
      "fails when the tarball also holds %s",
      (extra) => {
        const r = packCheck([...CLEAN, extra]);
        expect(r.status).toBe(1);
        expect(r.out).toContain(`::error::the tarball contains ${extra}`);
      },
    );
  });

  describe("the already-on-npm check", () => {
    // The step the publish `if:` reads its `already` output from.
    const viewStep = () => {
      const publish = npmJob().steps.find((s) => PUBLISH_RE.test(s.run ?? ""))!;
      const id = /steps\.([\w-]+)\.outputs\.already/.exec(publish.if ?? "")?.[1];
      const s = npmJob().steps.find((x) => x.id === id);
      if (!s) throw new Error(`the npm publish step's if: does not read a step's "already" output (${publish.if})`);
      return s;
    };
    const vars = { "steps.meta.outputs.name": "@mehudak/mcp-il-tools", "steps.meta.outputs.version": "0.1.0" };

    it("reports already=true when npm has this exact version, so the publish is skipped", () => {
      const r = run(viewStep(), sandbox(), vars, { FAKE_VIEW: "0.1.0" });
      expect(r.status).toBe(0);
      expect(r.output).toBe("already=true\n");
    });
    it("reports already=false when npm has no such package (404)", () => {
      const r = run(viewStep(), sandbox(), vars);
      expect(r.status).toBe(0);
      expect(r.output).toBe("already=false\n");
    });
  });
});
