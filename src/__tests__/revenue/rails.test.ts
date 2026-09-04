import { describe, it, expect } from "vitest";
import {
  LINE_RAILS,
  RAIL_CONCENTRATION_THRESHOLD,
  linesWithUnknownPayout,
  railConcentration,
  platformConcentration,
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

describe("platform concentration — the risk railConcentration was blind to", () => {
  it("sees that the largest single platform account is one we cannot observe", () => {
    // The synthesis critic's finding: Apify carries the top-or-only survivor of
    // four of seven audited groups, and railConcentration reported one line
    // because it keys by line id and all four collapse into `apify-actors`.
    const c = platformConcentration();
    const blind = c.platforms.filter((p) => !p.observable);
    expect(blind.length).toBeGreaterThan(0);
    expect(blind.map((p) => p.platformAccount)).toContain("apify:one-creator-account");
    expect(c.unobservableShare).toBeGreaterThan(0);
    expect(c.reason).toMatch(/cannot observe/);
  });

  it("groups lines by the account a ban would land on, not by the rail", () => {
    // paid-apis and agent-services are separate lines on separate targets but a
    // single wallet and host. One incident takes both.
    const c = platformConcentration();
    const self = c.platforms.find((p) => p.platformAccount === "self:wallet-and-host")!;
    expect(self.lineIds.sort()).toEqual(["agent-services", "paid-apis"]);
  });

  it("shares sum to one", () => {
    const c = platformConcentration();
    expect(c.platforms.reduce((n, p) => n + p.share, 0)).toBeCloseTo(1, 6);
  });

  it("fires when one account carries more than half the target", () => {
    const seeds = [
      { ...DEFAULT_PORTFOLIO[0]!, id: "a", targetMonthlyAgorot: agorotFromIls(9000) },
      { ...DEFAULT_PORTFOLIO[0]!, id: "b", targetMonthlyAgorot: agorotFromIls(1000) },
    ] as RevenueLineSeed[];
    const rails = {
      a: { payin: "paddle", payout: "bank-transfer", note: "x".repeat(40), platformAccount: "one:account", observable: true },
      b: { payin: "etsy", payout: "payoneer", note: "x".repeat(40), platformAccount: "other:account", observable: true },
    } as typeof LINE_RAILS;
    const c = platformConcentration(seeds, rails);
    expect(c.verdict).toBe("concentrated");
    expect(c.overexposed[0]!.platformAccount).toBe("one:account");
    expect(c.reason).toMatch(/MISSION\.md/);
  });

  it("records an account and an observability verdict for every mapped line", () => {
    for (const [id, rail] of Object.entries(LINE_RAILS)) {
      expect(rail.platformAccount, id).toMatch(/^[a-z-]+:[a-z-]+$/);
      expect(typeof rail.observable, id).toBe("boolean");
    }
  });
});
