import { describe, it, expect } from "vitest";
import {
  DEFAULT_PORTFOLIO,
  TARGET_BASIS,
  portfolioTargetAgorot,
  summarizeTargetBasis,
} from "../../revenue/portfolio.js";

describe("every target states where its number came from", () => {
  it("has a basis entry for every line in the portfolio", () => {
    for (const line of DEFAULT_PORTFOLIO) {
      expect(TARGET_BASIS[line.id], `${line.id} has no TARGET_BASIS entry`).toBeDefined();
    }
  });

  it("has no basis entry for a line that no longer exists", () => {
    const ids = new Set(DEFAULT_PORTFOLIO.map((l) => l.id));
    for (const id of Object.keys(TARGET_BASIS)) {
      expect(ids, `TARGET_BASIS has a stale entry for "${id}"`).toContain(id);
    }
  });

  it("keeps the stated number equal to the line's actual target", () => {
    // This is the failure this file exists to catch: someone edits a target and
    // leaves its justification describing the old number.
    for (const line of DEFAULT_PORTFOLIO) {
      const basis = TARGET_BASIS[line.id];
      expect(basis.ils * 100, `${line.id}: basis says ₪${basis.ils}, line targets ₪${line.targetMonthlyAgorot / 100}`)
        .toBe(line.targetMonthlyAgorot);
    }
  });

  it("makes a measured claim checkable", () => {
    for (const [id, basis] of Object.entries(TARGET_BASIS)) {
      expect(basis.basis.length, `${id}: basis text is too short to be a reason`).toBeGreaterThan(40);
      if (basis.grade === "measured") {
        expect(basis.source, `${id} is graded measured but cites no source`).toBeTruthy();
      }
    }
  });

  it("summarises the portfolio by how much of it rests on evidence", () => {
    const s = summarizeTargetBasis();
    expect(s.totalIls * 100).toBe(portfolioTargetAgorot());
    expect(s.measuredIls + s.inferredIls + s.unevidencedIls).toBe(s.totalIls);
    // Not asserting a particular split — that changes as the sweep proceeds.
    // Asserting only that unevidenced lines are named, so they stay visible.
    expect(s.unevidencedLines.length).toBeGreaterThan(0);
    for (const id of s.unevidencedLines) expect(TARGET_BASIS[id].grade).toBe("unevidenced");
  });

  it("treats a line with no basis entry as unevidenced rather than measured", () => {
    const seeds = [{ ...DEFAULT_PORTFOLIO[0], id: "brand-new" }];
    const s = summarizeTargetBasis(seeds, {});
    expect(s.unevidencedLines).toEqual(["brand-new"]);
    expect(s.measuredIls).toBe(0);
  });

  it("does not let the portfolio quietly claim it reaches the goal", () => {
    // The portfolio summing to exactly the target would mean the numbers were
    // fitted to the goal rather than derived from evidence. If a future change
    // makes it land exactly on ₪20,000, that is worth a second look.
    const s = summarizeTargetBasis();
    if (s.totalIls === 20_000) {
      expect(s.unevidencedIls, "portfolio sums to exactly ₪20,000 — every target must be evidenced for that to be believable").toBe(0);
    }
  });
});
