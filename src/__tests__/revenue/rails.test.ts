import { describe, it, expect } from "vitest";
import {
  CANDIDATE_RAILS,
  DEFAULT_MERCHANT_OF_RECORD,
  LINE_RAILS,
  MERCHANT_OF_RECORD_RAILS,
  RAIL_CONCENTRATION_THRESHOLD,
  linesWithUnknownPayout,
  linesWithUnverifiedPayout,
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

  it("reports the portfolio the board knowingly concentrated, rather than passing it", () => {
    // Until 7.9.2026 this expected "ok". The board's ruling changed the answer
    // and not the check: il-biz-tools moved from Paddle to Gumroad and pcn874
    // was added on Gumroad too, so two of four lines ride one merchant account —
    // ₪600 of the ₪1,100 committed since the 28.9.2026 board planned il-biz-tools
    // at ₪0 (RULING-2026-09-28-floors.md §9; it was ₪1,000 of ₪1,500 before).
    // BOARD.md §2 accepts that knowingly, because exactly
    // one rendered ILS rail exists — and the mitigation is to render Freemius as
    // a second one, not to silence this check. A green light here would be the
    // dishonest outcome, so the test asserts the warning and names the lines.
    const c = railConcentration();
    expect(c.verdict).toBe("concentrated");
    const gumroad = c.overexposed.find((o) => o.rail === "gumroad" && o.side === "payin");
    expect(gumroad, "gumroad carries two of four lines and the check must say so").toBeDefined();
    expect(gumroad!.lineIds.sort()).toEqual(["il-biz-tools", "pcn874"]);
    expect(gumroad!.share).toBeCloseTo(600 / 1100, 6);
    expect(c.reason).toMatch(/MISSION\.md/);
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

  it("knows every line's payout route, and says which ones are unverified for an Israeli (RULING-2026-09-28-bounty-rail.md §2.5)", () => {
    // Until 28.9.2026 oss-bounties was `unknown`. The board re-described it from Algora's own code: a Stripe Connect
    // Express account, evidence grade `code` — the country is listed, the mechanism that reaches Israel is not rendered.
    expect(linesWithUnknownPayout()).toEqual([]);
    // apify-actors: no page this repo rendered names Israel for an Apify payout (payability is "YES, but by absence").
    expect(linesWithUnverifiedPayout().sort()).toEqual(["apify-actors", "oss-bounties"]);
    expect(LINE_RAILS["oss-bounties"]).toMatchObject({ payout: "stripe-connect-express", payoutEvidence: "code" });
    expect(LINE_RAILS["oss-bounties"]!.note).toMatch(/payments\.ex:299-303/);
    expect(LINE_RAILS["oss-bounties"]!.note).toMatch(/service agreement/);
    expect(LINE_RAILS["oss-bounties"]!.note).toMatch(/held|credit/);
    expect(LINE_RAILS["il-biz-tools"]!.payoutEvidence).toBe("rendered");
    expect(LINE_RAILS.pcn874!.payoutEvidence).toBe("rendered");
    expect(LINE_RAILS["apify-actors"]!.payoutEvidence).toBe("none");
    expect(LINE_RAILS["apify-actors"]!.note).toMatch(/names Israel/);
  });

  it("gives every line a payout evidence grade", () => {
    for (const [id, rail] of Object.entries(LINE_RAILS)) {
      expect(["ledger", "rendered", "code", "none"], id).toContain(rail.payoutEvidence);
    }
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
    // il-biz-tools and pcn874 are separate lines with separate buyers and
    // separate targets, behind ONE Gumroad seller account. One suspension email
    // takes both, and ₪600 of the ₪1,100 the board committed to (il-biz-tools is
    // planned at ₪0 since 28.9.2026 and still rides the same account).
    const c = platformConcentration();
    const gumroad = c.platforms.find((p) => p.platformAccount === "gumroad:one-seller-account")!;
    expect(gumroad.lineIds.sort()).toEqual(["il-biz-tools", "pcn874"]);
    expect(c.verdict).toBe("concentrated");
    expect(c.overexposed.map((p) => p.platformAccount)).toContain("gumroad:one-seller-account");
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

describe("the merchant of record — Gumroad by default, Paddle only if the owner says so", () => {
  it("makes Gumroad the default and Paddle an option", () => {
    // Eight group reports assumed "Paddle already ships / already pays us" and
    // no test could contradict them. This one can: the default is code, the
    // option is code, and the difference between them is who may choose it.
    expect(DEFAULT_MERCHANT_OF_RECORD).toBe("gumroad");
    const byId = Object.fromEntries(MERCHANT_OF_RECORD_RAILS.map((r) => [r.id, r]));
    expect(byId.gumroad.status).toBe("default");
    expect(byId.gumroad.chosenBy).toBe("the board");
    expect(byId.gumroad.evidence).toBe("rendered");
    expect(byId.paddle.status).toBe("option");
    expect(byId.paddle.chosenBy).toBe("the owner, and only the owner");
  });

  it("names three risks on Paddle, because an option with no stated cost is a recommendation", () => {
    const paddle = MERCHANT_OF_RECORD_RAILS.find((r) => r.id === "paddle")!;
    expect(paddle.risks).toHaveLength(3);
    expect(paddle.risks.join(" ")).toMatch(/SELFIE VIDEO/i);
    expect(paddle.risks.join(" ")).toMatch(/DISCRETIONARY/i);
    expect(paddle.risks.join(" ")).toMatch(/not a Paddle payout currency/i);
    // A default with risks nobody wrote down is the same failure in reverse.
    expect(MERCHANT_OF_RECORD_RAILS.find((r) => r.status === "default")!.risks).toEqual([]);
  });

  it("puts no live line on Paddle", () => {
    // The ruling is only real if nothing depends on it. il-biz-tools was the
    // line that did, and it moved.
    for (const [id, rail] of Object.entries(LINE_RAILS)) {
      expect(rail.payin, `${id} is still on Paddle`).not.toBe("paddle");
    }
  });

  it("turns the Freemius check into a render task rather than an owner errand", () => {
    // MISSION rule 1 says never invent an owner step. "A human opens Freemius's
    // pricing page" was one — and Freemius is the mitigation for the Gumroad
    // concentration above, so it is not optional work, it is simply ours.
    const freemius = CANDIDATE_RAILS.find((r) => r.id === "freemius")!;
    expect(freemius.beforeUse).toMatch(/GITHUB CODE SEARCH/i);
    expect(freemius.beforeUse).not.toMatch(/A human opens/i);
  });
});
