import { describe, it, expect } from "vitest";
import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import {
  MANIFEST_FIELDS,
  REPO_ROOT,
  exitCode,
  failingGates,
  formatResult,
  loadManifest,
  runPublicationCheck,
} from "../../../scripts/publication-check.js";
import type { VideoManifest } from "../../revenue/publication-gate.js";

/**
 * scripts/publication-check.ts on the T1 manifest the chart-explainer renderer actually wrote (a copy lives in the
 * product's test fixtures). The state it pins: rendered, every mechanical gate passing, and exactly the three
 * judgement gates (G3 originality, G4 fact-check, G5 promise match) failing until separate auditor agents fill them.
 */

const FIXTURE = resolve(REPO_ROOT, "products/chart-explainer/tests/fixtures/t1-manifest.fixture.json");
const fixture = (): VideoManifest => loadManifest(FIXTURE);

describe("the T1 manifest through the gate", () => {
  it("fails on G3, G4 and G5 only: the audits are pending and nothing else is wrong", () => {
    const result = runPublicationCheck(fixture());
    expect(result.pass).toBe(false);
    expect(failingGates(result)).toEqual(["G3", "G4", "G5"]);
    expect(exitCode(result, ["G3", "G4", "G5"])).toBe(0);
    expect(exitCode(result, null)).toBe(1);
  });

  it("passes once auditors other than the author sign all three verdicts", () => {
    const v = {
      ...fixture(),
      originality: { auditor: "opus-auditor", verdict: "PASS" as const },
      factCheck: { auditor: "opus-auditor", verdict: "PASS" as const, figuresChecked: 12 },
      promiseMatch: { auditor: "opus-auditor", verdict: "PASS" as const },
    };
    expect(runPublicationCheck(v)).toEqual({ pass: true, failures: [] });
  });

  it("does not accept the author auditing their own video", () => {
    const self = { auditor: "opus-builder", verdict: "PASS" as const };
    const v = { ...fixture(), originality: self, factCheck: { ...self, figuresChecked: 12 }, promiseMatch: self };
    expect(failingGates(runPublicationCheck(v))).toEqual(["G3", "G4", "G5"]);
  });

  it("a missing licence snapshot adds G1, and --expect then refuses the run", () => {
    const result = runPublicationCheck(fixture(), () => false);
    expect(failingGates(result)).toEqual(["G1", "G3", "G4", "G5"]);
    expect(exitCode(result, ["G3", "G4", "G5"])).toBe(1);
  });

  it("prints one line per failure under a verdict line", () => {
    const lines = formatResult(fixture(), runPublicationCheck(fixture()));
    expect(lines[0]).toMatch(/^t1-typescript-javascript: FAIL \(3 failure\(s\)\)$/);
    expect(lines.slice(1).map((l) => l.slice(0, 9))).toEqual(["  FAIL G3", "  FAIL G4", "  FAIL G5"]);
  });
});

describe("the manifest shape", () => {
  it("the fixture carries exactly the VideoManifest fields, in order", () => {
    const raw = JSON.parse(readFileSync(FIXTURE, "utf8")) as Record<string, unknown>;
    expect(Object.keys(raw)).toEqual([...MANIFEST_FIELDS]);
  });

  it("refuses a file that is not a whole VideoManifest", () => {
    const dir = mkdtempSync(join(tmpdir(), "pubcheck-"));
    const raw = JSON.parse(readFileSync(FIXTURE, "utf8")) as Record<string, unknown>;
    delete raw.narration;
    writeFileSync(join(dir, "m.json"), JSON.stringify(raw));
    expect(() => loadManifest(join(dir, "m.json"))).toThrow(/missing narration/);
  });
});

describe("the command line", () => {
  it("exits 0 with --expect G3,G4,G5 on the fixture and prints the three failures", () => {
    const out = execFileSync(process.execPath, ["--import", "tsx", "scripts/publication-check.ts", FIXTURE, "--expect", "G3,G4,G5"], {
      cwd: REPO_ROOT,
      encoding: "utf8",
    });
    expect(out).toContain("FAIL G4");
    expect(out).toContain("-> as expected");
  });
});

describe("the render workflow (chart-explainer-render.yml)", () => {
  const wf = readFileSync(resolve(REPO_ROOT, ".github/workflows/chart-explainer-render.yml"), "utf8");
  const triggers = wf.slice(wf.indexOf("\non:"), wf.indexOf("\npermissions:"));

  it("is dispatch-only: no schedule, no push, no pull_request", () => {
    expect(triggers).toMatch(/workflow_dispatch:/);
    expect(triggers).not.toMatch(/schedule:|push:|pull_request/);
  });

  it("uses no secrets, commits nothing, and keeps its output as the run's own artifact", () => {
    expect(wf).not.toMatch(/secrets\./);
    expect(wf).not.toMatch(/git (commit|push)/);
    expect(wf).toMatch(/permissions:\n {2}contents: read/);
    expect(wf).toMatch(/actions\/upload-artifact@v4/);
    for (const f of ["*.mp4", "*.srt", "page/", "figures.json", "manifest.json"]) expect(wf).toContain(`out/render/${f}`);
  });

  it("starts the G9 clock before checkout and passes it to the renderer, under a 60-minute job cap", () => {
    expect(wf.indexOf("CLOCK_START=$(date +%s)")).toBeLessThan(wf.indexOf("actions/checkout"));
    expect(wf).toMatch(/--clock-start "\$CLOCK_START"/);
    expect(wf).toMatch(/timeout-minutes: 60/);
  });

  it("reads the dispatch input through the environment, never interpolated into a script", () => {
    const runBlocks = wf.split(/\n\s+run: /).slice(1).map((b) => b.split(/\n\s+- /)[0]);
    expect(runBlocks.length).toBeGreaterThanOrEqual(4); // the split found the steps; the check is not vacuous
    for (const b of runBlocks) expect(b).not.toContain("${{");
  });
});

describe("the test workflow (chart-explainer-ci.yml)", () => {
  it("runs pytest when the product changes", () => {
    const wf = readFileSync(resolve(REPO_ROOT, ".github/workflows/chart-explainer-ci.yml"), "utf8");
    expect(wf).toMatch(/products\/chart-explainer\/\*\*/);
    expect(wf).toMatch(/python -m pytest/);
    expect(wf).not.toMatch(/secrets\./);
  });
});
