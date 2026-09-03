import { describe, it, expect } from "vitest";
import {
  LINE_RAILS,
  RAIL_CONCENTRATION_THRESHOLD,
  linesWithUnknownPayout,
  railConcentration,
} from "../../revenue/rails.js";
import { DEFAULT_PORTFOLIO } from "../../revenue/portfolio.js";
import { agorotFromIls } from "../../revenue/money.js";
import type { RevenueLineSeed } from "../../revenue/types.js";

describe("payment rails", () => {
  it("maps every line in the shipped portfolio", () => {
    // A line with no rail is silently excluded from the concentration maths,
    // which would make the check pass by omission — the one failure mode a
    // concentration check must not have.
    for (const seed of DEFAULT_PORTFOLIO) {
      expect(LINE_RAILS[seed.id], `no rail recorded for ${seed.id}`).toBeDefined();
    }
  });

  it("maps no line that is not in the portfolio", () => {
    const ids = new Set(DEFAULT_PORTFOLIO.map((s) => s.id));
    for (const id of Object.keys(LINE_RAILS)) expect(ids.has(id), `${id} is not a portfolio line`).toBe(true);
  });

  it("gives every rail a reason a supervisor could argue with", () => {
    for (const [id, rail] of Object.entries(LINE_RAILS)) {
      expect(rail.note.length, id).toBeGreaterThan(30);
    }
  });

  it("passes on today's portfolio — the finding was that nothing checked, not that it failed", () => {
    const c = railConcentration();
    expect(c.verdict).toBe("ok");
    expect(c.overexposed).toEqual([]);
  });

  it("shares sum to one on each side", () => {
    const c = railConcentration();
    const sum = (rows: { share: number }[]) => rows.reduce((n, r) => n + r.share, 0);
    expect(sum(c.payin)).toBeCloseTo(1, 6);
    expect(sum(c.payout)).toBeCloseTo(1, 6);
  });

  it("fires when one rail carries more than half the target, and names the lines", () => {
    const seeds = [
      { ...DEFAULT_PORTFOLIO[0]!, id: "a", targetMonthlyAgorot: agorotFromIls(9000) },
      { ...DEFAULT_PORTFOLIO[0]!, id: "b", targetMonthlyAgorot: agorotFromIls(1000) },
    ] as RevenueLineSeed[];
    const rails = {
      a: { payin: "paddle", payout: "bank-transfer", note: "x".repeat(40) },
      b: { payin: "etsy", payout: "payoneer", note: "x".repeat(40) },
    } as typeof LINE_RAILS;

    const c = railConcentration(seeds, rails);
    expect(c.verdict).toBe("concentrated");
    expect(c.overexposed.map((o) => o.rail).sort()).toEqual(["bank-transfer", "paddle"]);
    expect(c.reason).toContain("a");
    expect(c.reason).toMatch(/MISSION\.md/);
  });

  it("does not fire at exactly the threshold", () => {
    const seeds = [
      { ...DEFAULT_PORTFOLIO[0]!, id: "a", targetMonthlyAgorot: agorotFromIls(1000) },
      { ...DEFAULT_PORTFOLIO[0]!, id: "b", targetMonthlyAgorot: agorotFromIls(1000) },
    ] as RevenueLineSeed[];
    const rails = {
      a: { payin: "paddle", payout: "bank-transfer", note: "x".repeat(40) },
      b: { payin: "etsy", payout: "payoneer", note: "x".repeat(40) },
    } as typeof LINE_RAILS;
    expect(railConcentration(seeds, rails, RAIL_CONCENTRATION_THRESHOLD).verdict).toBe("ok");
  });

  it("names oss-bounties as the line whose payout route is unknown", () => {
    // Writing "stripe" there would launder an open question into a fact — the
    // Stripe-Israel claim is reopened in docs/REJECTED.md.
    expect(linesWithUnknownPayout()).toEqual(["oss-bounties"]);
  });
});
