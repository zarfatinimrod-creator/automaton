import { spawnSync } from "node:child_process";
import { readdirSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

/**
 * The mutation plans kept beside the tests: src/__tests__/revenue/mutations/<script>.json, each one scripts/mutate.mjs's
 * --plan format. Until tick 51 every plan lived in a builder's scratch folder and died with it, so each reviewer and
 * fixer of ticks 47-50 re-derived the previous agent's mutations from the prose of its log. Kept here, a plan can be
 * run again by anyone (README.md beside the plans), and this test keeps them true to the code: each plan has the shape
 * mutate.mjs reads, and `mutate.mjs --check` says every mutation in it would still apply (the find text is in the file
 * once, or at its nth; the replacement differs; the test paths exist). A refactor that moves a find text fails here
 * until the plan follows the code. It runs no mutation: a full run is for a build's review (minutes per plan).
 *
 * --allow-dirty: the check is of the plans against the files as they are on disk. Without it a file with uncommitted
 * changes (a script being edited, before its commit) would fail every plan that names it for a reason that is not the
 * plan's; in CI the tree is clean and the two are the same check.
 */

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const DIR = join(ROOT, "src", "__tests__", "revenue", "mutations");
const MUTATE = join(ROOT, "scripts", "mutate.mjs");
const PLANS = readdirSync(DIR).filter((f) => f.endsWith(".json")).sort();
const KEYS = new Set(["id", "file", "find", "replace", "test", "note", "nth"]);

type Entry = Record<string, unknown>;

describe("src/__tests__/revenue/mutations: the kept mutation plans", () => {
  it("has a plan for each script whose builds were reviewed with mutations, and a README", () => {
    for (const name of [
      "address-kinds.json",
      "capture-check.json",
      "freeze-capture.json",
      "loop-edit.json",
      "mutate.json",
      "page-views.json",
      "prize-apply-reading.json",
      "prize-dispatch.json",
      "queue-zero-test.json",
      "remask-captures.json",
      "remask-run.json",
      "render-dispatch.json",
      "render-watch.json",
      "robots-verdict.json",
      "sim-tree.json",
      "terms-saved-copies.json",
      "trim-capture.json",
    ]) {
      expect(PLANS).toContain(name);
    }
    expect(readdirSync(DIR)).toContain("README.md");
  });

  describe.each(PLANS)("%s", (name) => {
    const plan = JSON.parse(readFileSync(join(DIR, name), "utf8")) as Entry[];

    it("is a non-empty array of {id, file, find, replace, test, note[, nth]} with unique ids", () => {
      expect(Array.isArray(plan)).toBe(true);
      expect(plan.length).toBeGreaterThan(0);
      const ids = new Set<string>();
      for (const m of plan) {
        const where = `${name} ${String(m.id)}`;
        expect(Object.keys(m).filter((k) => !KEYS.has(k)), where).toEqual([]);
        for (const k of ["id", "file", "find", "replace", "note"]) expect(typeof m[k], `${where}: ${k}`).toBe("string");
        expect((m.find as string).length, where).toBeGreaterThan(0);
        expect(m.replace, where).not.toBe(m.find);
        expect((m.note as string).trim().length, `${where}: a note says what behaviour the mutation breaks`).toBeGreaterThan(0);
        const tests = [m.test].flat();
        expect(tests.length, `${where}: test`).toBeGreaterThan(0);
        for (const t of tests) expect(typeof t, `${where}: test`).toBe("string");
        if (m.nth !== undefined) expect(Number.isInteger(m.nth) && (m.nth as number) > 0, `${where}: nth`).toBe(true);
        expect(ids.has(m.id as string), `${where}: duplicate id`).toBe(false);
        ids.add(m.id as string);
      }
    });

    it("every mutation would apply to the code as it is (mutate.mjs --check exits 0)", () => {
      const r = spawnSync(process.execPath, [MUTATE, "--check", "--allow-dirty", "--plan", join(DIR, name)], { cwd: ROOT, encoding: "utf8" });
      expect(r.status, `${r.stdout}${r.stderr}`).toBe(0);
      expect(r.stdout).toMatch(new RegExp(`--check: ${plan.length} of ${plan.length} would apply\\n`));
    });
  });
});
