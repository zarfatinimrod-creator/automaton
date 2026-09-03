import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { ALL_CRITERIA, CRITERIA_GROUPS } from "../../revenue/criteria.js";
import { renderSweepWorkflow, SWEEP_WORKFLOW_PATH } from "../../revenue/sweep-workflow.js";

const repoRoot = path.resolve(__dirname, "../../..");
const generatedPath = path.join(repoRoot, SWEEP_WORKFLOW_PATH);

describe("sweep workflow generation", () => {
  const rendered = renderSweepWorkflow();

  it("matches the file checked into the repo", () => {
    // If this fails the registry changed without regenerating:
    //   pnpm exec tsx scripts/gen-sweep-workflow.ts
    expect(fs.existsSync(generatedPath)).toBe(true);
    expect(fs.readFileSync(generatedPath, "utf-8")).toBe(rendered);
  });

  it("parses as a workflow script body", () => {
    // Workflow scripts are an async function body: top-level `return` is legal
    // there but not in a module, so `node --check` would wrongly reject it.
    const body = rendered.replace(/^export const meta/m, "const meta");
    expect(() => new vm.Script(`(async () => {${body}})`)).not.toThrow();
  });

  it("declares meta as a pure literal, which the tool requires", () => {
    const meta = rendered.slice(rendered.indexOf("export const meta"), rendered.indexOf("const MISSION"));
    expect(meta).toContain("name: 'colony-criteria-sweep'");
    expect(meta).not.toMatch(/\$\{|\bconcat\(|\.\.\./);
    for (const title of ["Scouts", "Supervisors", "Auditors", "Board"]) {
      expect(meta).toContain(`title: '${title}'`);
      // Titles are matched exactly against either a phase() call or the
      // per-agent `phase:` option, which is what stages inside pipeline() use
      // to avoid racing on the global phase() state.
      expect(
        rendered.includes(`phase('${title}')`) || rendered.includes(`phase: '${title}'`),
      ).toBe(true);
    }
  });

  it("inlines every criterion from the registry, since the script cannot import", () => {
    for (const c of ALL_CRITERIA) {
      expect(rendered).toContain(JSON.stringify(c.brief).slice(1, -1));
    }
    for (const g of CRITERIA_GROUPS) expect(rendered).toContain(`"${g.title}"`);
  });

  it("supports waves, because a full fan-out does not fit in one usage window", () => {
    // The first full run died on the session limit with 123 of 128 agents
    // unstarted. Waves are the fix, and the board must not judge a slice.
    expect(rendered).toContain("const BOARD_ONLY = WAVE.board === true");
    expect(rendered).toContain("WAVE.groups.indexOf(g.id) !== -1");
    expect(rendered).toContain("no criterion group matched args.groups");
    const waveGuard = rendered.slice(rendered.indexOf("// A wave stops here"), rendered.indexOf("const chief = await agent"));
    expect(waveGuard).toContain("return {");
  });

  it("spawns one agent per criterion plus a supervisor and auditor per group", () => {
    const parsed = JSON.parse(
      rendered.slice(rendered.indexOf("const ALL_GROUPS = ") + "const ALL_GROUPS = ".length, rendered.indexOf("\n\n// Waves.")),
    ) as { id: string; criteria: [string, string][] }[];
    expect(parsed).toHaveLength(CRITERIA_GROUPS.length);
    expect(parsed.reduce((n, g) => n + g.criteria.length, 0)).toBe(ALL_CRITERIA.length);
    expect(rendered).toContain("label: 'supervisor:' + g.id");
    expect(rendered).toContain("label: 'auditor:' + g.id");
  });

  it("routes models the way CLAUDE.md requires: Opus for sweeps, Fable for judgement", () => {
    const scoutStage = rendered.slice(rendered.indexOf("const groupResults"), rendered.indexOf("const groups ="));
    expect(scoutStage).not.toContain("model: 'fable'");
    const boardStage = rendered.slice(rendered.indexOf("const chief = await agent"));
    expect(boardStage.match(/model: 'fable'/g)).toHaveLength(2);
  });

  it("keeps the constitution in front of every agent", () => {
    expect(rendered).toContain("Constitution: honest value only");
    expect(rendered).toContain("Payability to Israel is a hard gate");
  });
});
