import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";
import {
  OWNER_STEPS,
  linesWithNoOwnerStep,
  ownerStepById,
  ownerStepMinutes,
  ownerStepsForLine,
  ownerStepsInOrder,
} from "../../revenue/owner-steps.js";
import { DEFAULT_PORTFOLIO } from "../../revenue/portfolio.js";

const repoRoot = path.resolve(__dirname, "../../..");
const doc = fs.readFileSync(path.join(repoRoot, "docs/OWNER_STEPS.he.md"), "utf-8");

describe("the owner's checklist is seven steps and stays seven", () => {
  it("has exactly seven steps, with stable numbers 1..7", () => {
    // MISSION rule 1: never invent a step. The failure mode is drift, not a bad
    // decision — the chief audit found six catalogue items written out as
    // eleven, because "register as osek patur" was repeated once per line and an
    // accountant conversation had been added by someone reasoning about tax. An
    // eighth step should require a decision, so it fails the build.
    expect(OWNER_STEPS).toHaveLength(7);
    expect(OWNER_STEPS.map((s) => s.number).sort((a, b) => a - b)).toEqual([1, 2, 3, 4, 5, 6, 7]);
    expect(new Set(OWNER_STEPS.map((s) => s.id)).size).toBe(7);
  });

  it("runs in the order the board ruled: 1, 2, 3, 5, 7, 4, 6", () => {
    // BOARD.md §5. The numbers stay fixed so an earlier conversation about
    // "step 4" still means the same step; only the order moved.
    expect(ownerStepsInOrder().map((s) => s.number)).toEqual([1, 2, 3, 5, 7, 4, 6]);
    expect(ownerStepsInOrder().map((s) => s.id)).toEqual([
      "merge-pr", "tax-file", "gumroad", "domain", "github-org", "algora-stripe", "ci-tokens",
    ]);
    expect(OWNER_STEPS.map((s) => s.order).sort((a, b) => a - b)).toEqual([1, 2, 3, 4, 5, 6, 7]);
  });

  it("lets the Apify half of step 6 be done straight after step 1", () => {
    // It is the only early part in the list and it is the reason the list has
    // one at all: the token starts the 30-day stranger count a month earlier
    // than the rest of the checklist would allow, and it needs no identity check.
    const early = OWNER_STEPS.filter((s) => s.earlyPart);
    expect(early.map((s) => s.id)).toEqual(["ci-tokens"]);
    expect(early[0].earlyPart!.afterStep).toBe("merge-pr");
    expect(early[0].earlyPart!.what).toMatch(/APIFY_TOKEN/);
  });

  it("keeps each step to the identity, KYC or payout work a platform actually requires", () => {
    for (const step of OWNER_STEPS) {
      expect(step.unlocks.length, `${step.id} does not say what it unlocks`).toBeGreaterThan(60);
      expect(step.minutes[0]).toBeGreaterThan(0);
      expect(step.minutes[1]).toBeGreaterThanOrEqual(step.minutes[0]);
    }
    // Six of the seven map to a chief-audit catalogue item. The seventh is the
    // PR merge, which is consent rather than identity — and it is correctly
    // absent from that catalogue, so a null here is the honest value.
    const catalogued = OWNER_STEPS.filter((s) => s.catalogueRef !== null);
    expect(catalogued).toHaveLength(6);
    expect(ownerStepById("merge-pr")!.catalogueRef).toBeNull();
    expect(new Set(catalogued.map((s) => s.catalogueRef)).size).toBe(6);
  });

  it("costs about two and a half hours in total", () => {
    const { min, max } = ownerStepMinutes();
    expect(min).toBeGreaterThan(100);
    expect(max).toBeLessThan(200);
  });
});

describe("every line's human setup maps to a step, and every step unlocks a line", () => {
  it("leaves no live line blocked on a step that is not on the list", () => {
    // A line whose blocker is not in the checklist is a line the owner will
    // never unblock, and nobody would notice: the board would park it in
    // awaiting_setup forever and report it as "waiting on the owner".
    expect(linesWithNoOwnerStep()).toEqual([]);
    for (const line of DEFAULT_PORTFOLIO) {
      expect(ownerStepsForLine(line.id).length, `${line.id} maps to no owner step`).toBeGreaterThan(0);
    }
  });

  it("names only live lines in a step's unlocks", () => {
    // The mirror failure: a killed line left in a step keeps an owner step alive
    // for work nobody will do.
    const live = new Set(DEFAULT_PORTFOLIO.map((l) => l.id));
    for (const step of OWNER_STEPS) {
      expect(step.lines.length, `${step.id} unlocks no line`).toBeGreaterThan(0);
      for (const id of step.lines) {
        expect(live.has(id), `owner step ${step.id} names "${id}", which is not a live revenue line`).toBe(true);
      }
    }
  });

  it("gives every line with a humanSetup entry at least one step to point at", () => {
    for (const line of DEFAULT_PORTFOLIO) {
      if (line.humanSetup.length === 0) continue;
      const steps = ownerStepsForLine(line.id);
      expect(steps.length, `${line.id} has ${line.humanSetup.length} setup notes and no step`).toBeGreaterThan(0);
      // Each note should be at least as specific as naming its step, so the
      // owner reading the report can find it in the Hebrew document.
      for (const note of line.humanSetup) {
        expect(note).toMatch(/owner step \d/i);
      }
    }
  });

  it("routes each line to the steps that actually gate it", () => {
    expect(ownerStepsForLine("oss-bounties").map((s) => s.id))
      .toEqual(["merge-pr", "tax-file", "github-org", "algora-stripe", "ci-tokens"]);
    expect(ownerStepsForLine("pcn874").map((s) => s.id))
      .toEqual(["merge-pr", "tax-file", "gumroad", "domain", "github-org", "ci-tokens"]);
    // The org must come before Algora: a bounty pull request is a published
    // byline, and the machine account created in step 7 is what signs it.
    const bounty = ownerStepsForLine("oss-bounties");
    expect(bounty.findIndex((s) => s.id === "github-org"))
      .toBeLessThan(bounty.findIndex((s) => s.id === "algora-stripe"));
  });
});

describe("the Hebrew document has not drifted from the code", () => {
  it("carries the same seven numbered headings", () => {
    const numbers = [...doc.matchAll(/^##\s*צעד\s*(\d+)\s*—/gm)].map((m) => Number(m[1]));
    expect(numbers.sort((a, b) => a - b)).toEqual(OWNER_STEPS.map((s) => s.number).sort((a, b) => a - b));
  });

  it("states the same execution order the code sorts by", () => {
    // The document tells the owner "1 → 2 → 3 → 5 → 7 → 4 → 6". If the code is
    // reordered and the document is not, the owner does the wrong thing first —
    // and the wrong thing first here costs a month of the Apify count.
    const stated = doc.match(/(\d(?:\s*→\s*\d){6})/);
    expect(stated, "docs/OWNER_STEPS.he.md no longer states an execution order").toBeTruthy();
    const order = stated![1].split("→").map((n) => Number(n.trim()));
    expect(order).toEqual(ownerStepsInOrder().map((s) => s.number));
  });

  it("still tells the owner the Apify token may go in right after step 1", () => {
    expect(doc).toMatch(/Apify/);
    expect(doc).toMatch(/מיד אחרי צעד 1|אחרי צעד 1/);
  });
});
