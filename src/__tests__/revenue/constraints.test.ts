import { describe, it, expect } from "vitest";
import {
  PROMOTION_CONSTRAINTS,
  constraintsBriefing,
  screenProposal,
} from "../../revenue/constraints.js";
import { DEFAULT_PORTFOLIO } from "../../revenue/portfolio.js";

describe("promotion constraints", () => {
  it("keeps every constraint enforceable: a rule, a reason, and wording that trips it", () => {
    for (const c of PROMOTION_CONSTRAINTS) {
      expect(c.rule.length, c.id).toBeGreaterThan(20);
      expect(c.because.length, c.id).toBeGreaterThan(40);
      expect(c.tripwires.length, c.id).toBeGreaterThan(0);
      // A constraint with no reopening condition is either wrong or permanent,
      // and docs/REJECTED.md's third rule says it must state which.
      expect(c.reopensIf.length, c.id).toBeGreaterThan(10);
      for (const wire of c.tripwires) {
        expect(wire, c.id).toBe(wire.toLowerCase());
      }
    }
  });

  it("has unique ids", () => {
    const ids = PROMOTION_CONSTRAINTS.map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("rejects the substitution portfolio, which is the failure the final goal invites", () => {
    const screen = screenProposal(
      "Generate 900 storefronts from one template, one page per city, swap the city name and the keyword.",
    );
    expect(screen.verdict).toBe("RED");
    expect(screen.hits.map((h) => h.constraintId)).toContain("unique-data-per-store");
  });

  it("rejects review gating however it is dressed up", () => {
    for (const wording of [
      "We use a smart send so only happy customers get the review request",
      "An NPS gate before the public ask",
      "סינון ביקורות לפני שליחה",
    ]) {
      expect(screenProposal(wording).verdict, wording).toBe("RED");
    }
  });

  it("rejects automated community posting even when a platform's own playbook recommends it", () => {
    const screen = screenProposal(
      "Follow the vendor's parasite seo checklist: cross-post to medium and answer on quora for each listing.",
    );
    expect(screen.verdict).toBe("RED");
    const ids = screen.hits.map((h) => h.constraintId);
    expect(ids).toContain("no-automated-community-posting");
  });

  it("passes a proposal that promotes only through what a marketplace itself ranks", () => {
    const screen = screenProposal(
      "Publish 30 Apify Actors with accurate titles, input schemas and READMEs, keep uptime green, and let Store relevance search do the distribution.",
    );
    expect(screen.verdict).toBe("GREEN");
    expect(screen.hits).toEqual([]);
  });

  it("never claims safety on a clean screen", () => {
    const clean = screenProposal("A perfectly ordinary proposal.");
    expect(clean.verdict).toBe("GREEN");
    expect(clean.caveat).toMatch(/never that the proposal is safe/);
  });

  it("reports AMBER, not RED, when only an AMBER constraint trips", () => {
    const screen = screenProposal("Bootstrap credibility with an incentivised review campaign on a directory.");
    expect(screen.verdict).toBe("AMBER");
    expect(screen.hits.every((h) => h.verdict === "AMBER")).toBe(true);
  });

  it("screens the shipped portfolio clean — a line that trips its own constraints must not be live", () => {
    for (const seed of DEFAULT_PORTFOLIO) {
      const text = [seed.name, seed.operatingLoop, ...(seed.killCriteria ?? []), ...(seed.scaleCriteria ?? [])].join(" ");
      const screen = screenProposal(text);
      expect(screen.verdict, `${seed.id}: ${JSON.stringify(screen.hits)}`).toBe("GREEN");
    }
  });

  it("briefs agents with the same rules the code enforces", () => {
    const brief = constraintsBriefing();
    for (const c of PROMOTION_CONSTRAINTS) {
      expect(brief).toContain(c.rule);
    }
  });
});
