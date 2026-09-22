import { describe, it, expect } from "vitest";
import {
  CONDITIONAL_TARGETS,
  DEFAULT_PORTFOLIO,
  KILLED_LINES,
  TARGET_BASIS,
  committedTargetIls,
  conditionalTargetIls,
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
    // Every shekel lands in exactly one band. The fourth, "contradicted", was
    // added after three lines turned out to be graded "measured" while the
    // evidence in their own basis field argued against the number — one of them
    // by about 200x. Leaving it out of this sum is how that stayed invisible.
    expect(s.measuredIls + s.inferredIls + s.unevidencedIls + s.contradictedIls).toBe(s.totalIls);
    expect(s.contradictedLines.length).toBeGreaterThan(0);
    // And the figure the board should be reading: nothing in this portfolio is
    // measured. No buyer has been measured on any line.
    expect(s.measuredIls).toBe(0);
    // The board of 7.9.2026 killed every unevidenced line rather than promoting
    // it, so this list is now empty — which is a result, not a reason to stop
    // checking. Any line that reappears here must be named.
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

describe("the board's decision of 7.9.2026, as arithmetic", () => {
  it("commits to ₪1,500 across four lines and to nothing else", () => {
    // BOARD.md §3: four lines — apify-actors 200, oss-bounties 300,
    // il-biz-tools 400, pcn874 600. The number is asserted rather than derived
    // so that changing a target is a decision somebody has to make in this file
    // too, with the board's reasoning in front of them.
    expect(DEFAULT_PORTFOLIO.map((l) => l.id).sort())
      .toEqual(["apify-actors", "il-biz-tools", "oss-bounties", "pcn874"]);
    expect(committedTargetIls()).toBe(1500);
    expect(portfolioTargetAgorot()).toBe(150_000);

    const byId = Object.fromEntries(DEFAULT_PORTFOLIO.map((l) => [l.id, l.targetMonthlyAgorot / 100]));
    expect(byId).toEqual({ "apify-actors": 200, "oss-bounties": 300, "il-biz-tools": 400, pcn874: 600 });
  });

  it("keeps the ₪700 the board did not commit to visible, and out of the total", () => {
    // The chief audit's figure is ₪2,200. Telling the owner ₪2,200 as a plan
    // would be telling him a conditional number as a commitment, which is the
    // one thing BOARD.md §6.2 amended the recommendation to prevent.
    expect(conditionalTargetIls()).toBe(700);
    expect(CONDITIONAL_TARGETS.map((t) => t.id).sort()).toEqual(["devpost-hackathons", "registrar-reminder"]);
    expect(committedTargetIls() + conditionalTargetIls()).toBe(2200);
    // And the conditionals are NOT lines: they carry no target in the portfolio.
    const lineIds = new Set(DEFAULT_PORTFOLIO.map((l) => l.id));
    for (const t of CONDITIONAL_TARGETS) {
      expect(lineIds.has(t.id), `${t.id} is conditional and must not be a portfolio line`).toBe(false);
      expect(t.conditionalOn.length, `${t.id} must name what would make it real`).toBeGreaterThan(40);
    }
  });

  it("records Apify's ₪1,500 as the contested upper bound rather than as a target", () => {
    // Chief audit §5.3 and BOARD.md §3. The failure this prevents is specific:
    // ₪3,000 used to sit here as "what the board measures against", which is a
    // target fitted to the goal.
    const apify = TARGET_BASIS["apify-actors"];
    expect(apify.ils).toBe(200);
    expect(apify.contestedUpperBoundIls).toBe(1500);
    expect(apify.basis).toMatch(/contested/i);
  });

  it("gives no killed line a positive target", () => {
    // A killed line with a target left on it is how a dead line comes back: the
    // number survives the decision and someone later reads the sum.
    expect(KILLED_LINES.map((k) => k.id).sort()).toEqual([
      "agent-services", "dev-extensions", "hebrew-content", "paid-apis", "telegram-bots", "templates",
    ]);
    const liveIds = new Set(DEFAULT_PORTFOLIO.map((l) => l.id));
    for (const killed of KILLED_LINES) {
      expect(killed.targetMonthlyAgorot, `${killed.id} is killed and still carries a target`).toBe(0);
      expect(liveIds.has(killed.id), `${killed.id} is killed and still in DEFAULT_PORTFOLIO`).toBe(false);
      expect(TARGET_BASIS[killed.id], `${killed.id} is killed and still has a TARGET_BASIS entry`).toBeUndefined();
      expect(killed.formerTargetIls, `${killed.id} must record what it was carrying`).toBeGreaterThan(0);
      expect(killed.reason.length, `${killed.id} must say why`).toBeGreaterThan(60);
      expect(killed.reopensIf.length, `${killed.id} must name the evidence that would reopen it`).toBeGreaterThan(30);
    }
    // The haircut, stated once: ₪16,500 of targets became ₪1,500.
    const killedIls = KILLED_LINES.reduce((n, k) => n + k.formerTargetIls, 0);
    expect(killedIls).toBe(10_500);
  });

  it("names a rail and an acquisition channel for every live line", () => {
    // MISSION constraint 7: a line may not be built before its acquisition
    // channel is named, and the first thing built on it is the cheapest test
    // that a stranger can find it. Constraint 2 and the rail-concentration check
    // need the rail for the same reason. Both used to live in prose.
    for (const line of DEFAULT_PORTFOLIO) {
      const basis = TARGET_BASIS[line.id];
      expect(basis.rail?.trim().length, `${line.id} names no rail`).toBeGreaterThan(10);
      expect(basis.acquisitionChannel?.trim().length, `${line.id} names no acquisition channel`).toBeGreaterThan(30);
      expect(basis.source, `${line.id} must cite where its ceiling came from`).toBeTruthy();
    }
    for (const t of CONDITIONAL_TARGETS) {
      expect(t.rail.trim().length, `${t.id} names no rail`).toBeGreaterThan(5);
      expect(t.acquisitionChannel.trim().length, `${t.id} names no acquisition channel`).toBeGreaterThan(20);
    }
  });

  it("keeps the x402 endpoint as a standby rail note rather than as a line", () => {
    // BOARD.md §3: products/x402-il-api may stay deployed only at ₪0/month cost.
    // Any USDC that arrives is booked; nothing is planned on it.
    const paidApis = KILLED_LINES.find((k) => k.id === "paid-apis")!;
    expect(paidApis.standby).toMatch(/x402-il-api/);
    expect(paidApis.standby).toMatch(/₪0\/month/);
    expect(DEFAULT_PORTFOLIO.some((l) => l.id === "paid-apis")).toBe(false);
  });
});
