import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";

const repoRoot = path.resolve(__dirname, "../../..");
const cliSource = fs.readFileSync(path.join(repoRoot, "scripts/colony.ts"), "utf-8");
const workflow = fs.readFileSync(path.join(repoRoot, ".github/workflows/colony.yml"), "utf-8");

/** Option names declared in the CLI's parseArgs block. */
function declaredOptions(): Set<string> {
  const block = cliSource.slice(cliSource.indexOf("options: {"), cliSource.indexOf("const command ="));
  return new Set([...block.matchAll(/^\s+"?([a-z][\w-]*)"?:\s*\{\s*type:/gm)].map((m) => m[1]));
}

/** Flags the scheduled workflow actually passes to the CLI. */
function flagsUsedByWorkflow(): string[] {
  const lines = workflow.split("\n").filter((l) => l.includes("scripts/colony.ts"));
  expect(lines.length).toBeGreaterThan(0);
  return [...new Set(lines.flatMap((l) => [...l.matchAll(/--([a-z][\w-]*)/g)].map((m) => m[1])))];
}

describe("the scheduled workflow and the CLI agree on flags", () => {
  it("declares every flag the workflow passes", () => {
    // node:util parseArgs has no --no-<flag> negation: it throws
    // ERR_PARSE_ARGS_UNKNOWN_OPTION on an undeclared name. The workflow ran
    // `tick --no-feed` while the CLI declared only `feed`, so the first
    // scheduled run would have died parsing its own arguments — and nothing
    // would have noticed, because nothing else runs this command.
    const declared = declaredOptions();
    expect(declared.size).toBeGreaterThan(5);
    for (const flag of flagsUsedByWorkflow()) {
      expect(declared, `workflow passes --${flag}, which the CLI does not declare`).toContain(flag);
    }
  });

  it("keeps the negative flags the workflow depends on", () => {
    expect(declaredOptions()).toContain("no-feed");
  });

  it("documents in --help every flag the workflow uses", () => {
    const usage = cliSource.slice(cliSource.indexOf("const USAGE ="), cliSource.indexOf("function fail("));
    for (const flag of flagsUsedByWorkflow()) {
      expect(usage, `--${flag} is passed by the workflow but absent from the usage text`).toContain(`--${flag}`);
    }
  });
});

describe("the wave-args helper the sweep depends on", () => {
  const cli = cliSource;

  it("declares --wave-args as a string option", () => {
    expect(cli).toContain('"wave-args": { type: "string" }');
  });

  it("refuses to emit args for a wave with nothing left to sweep", () => {
    // Launching a wave whose every criterion is already swept spends the search
    // budget re-answering answered questions, which is the exact failure
    // args.exclude exists to prevent.
    expect(cli).toContain("is already swept — nothing for a wave to do");
  });

  it("prints the args on stdout and the human summary on stderr", () => {
    // The JSON is meant to be piped or copied into the Workflow tool; mixing the
    // summary into it would make that fail.
    expect(cli).toContain("console.log(JSON.stringify({ groups: wanted, exclude }))");
    expect(cli).toMatch(/console\.error\(`\\n\$\{remaining\} unswept/);
  });
});
