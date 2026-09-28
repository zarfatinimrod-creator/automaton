import { describe, it, expect } from "vitest";
import {
  ALGORA_BOT_LOGIN,
  DEFAULT_ATTEMPT_WINDOW_DAYS,
  brandAccountProblems,
  KILL_ACCEPTANCE_RATE,
  MAX_PARALLEL_ATTEMPTS,
  COLONY_AGENT_HOURS_PER_MONTH,
  capacityBaseAddends,
  capacityBaseIls,
  defaultIntakeConfig,
  deriveBountyFloor,
  parseAlgoraBotComment,
  scoreBounty,
  selectBounties,
  type BountyCandidate,
} from "../../revenue/bounties/intake.js";
import { DEFAULT_PORTFOLIO, KILLED_LINES, TARGET_BASIS, committedTargetIls } from "../../revenue/portfolio.js";

const NOW = "2026-09-07T12:00:00.000Z";

/**
 * The bounty-comment body, built from the only text the sweep actually rendered:
 * Algora's own `lib/algora/bot_templates/bot_templates.ex`, quoted in
 * research/colony-sweep/scouts/bounties-grants--oss-bounties.md. The dollar line
 * is NOT rendered anywhere — algora.io is EGRESS_BLOCKED — so the fixture keeps
 * it deliberately plain and the parser stays loose about it.
 */
function botBody(amountUsd: number, issue: number): string {
  return [
    `## 💎 $${amountUsd.toLocaleString("en-US")} bounty`,
    "",
    "### Steps to solve:",
    `1. **Start working**: Comment \`/attempt #${issue}\` with your implementation plan`,
    `2. **Submit work**: Create a pull request including \`/claim #${issue}\` in the PR body`,
    "3. **Receive payment**: 100% of the bounty is received 2-5 days post-reward.",
    "",
    "To claim a bounty, you need to **provide a short demo video** of your changes in your pull request.",
  ].join("\n");
}

function candidate(over: Partial<BountyCandidate> = {}): BountyCandidate {
  const issueNumber = over.issueNumber ?? 42;
  const amount = over.amount ?? 250;
  return {
    id: over.id ?? `acme/widget#${issueNumber}`,
    repo: over.repo ?? "acme/widget",
    issueNumber,
    issueTitle: over.issueTitle ?? "parseDate() throws on ISO week dates",
    issueText:
      over.issueText ??
      [
        "### Steps to reproduce",
        "Call `parseDate('2026-W12-3')` in TypeScript.",
        "",
        "Expected: a Date for 18 March 2026.",
        "Actual: it throws `RangeError`.",
        "",
        "Acceptance criteria:",
        "- [ ] `parseDate` returns the right Date for ISO week strings",
        "- [ ] a regression test covers it",
      ].join("\n"),
    labels: over.labels ?? ["bug", "typescript", "good first issue"],
    amount,
    currency: over.currency ?? "USD",
    assignedTo: over.assignedTo ?? null,
    botComment: "botComment" in over ? over.botComment : { author: ALGORA_BOT_LOGIN, body: botBody(amount, issueNumber) },
    policy: over.policy ?? "unknown",
    estimatedHours: over.estimatedHours ?? 4,
    ...(over.attemptsByOthers ? { attemptsByOthers: over.attemptsByOthers } : {}),
  };
}

describe("the algora-pbc[bot] comment parser", () => {
  it("reads the amount, the issue number and both commands from the bot's own template", () => {
    const parsed = parseAlgoraBotComment({ author: ALGORA_BOT_LOGIN, body: botBody(250, 42) });
    expect(parsed.fromAlgoraBot).toBe(true);
    expect(parsed.amountUsd).toBe(250);
    expect(parsed.issueNumber).toBe(42);
    expect(parsed.attemptCommand).toBe("/attempt #42");
    expect(parsed.claimCommand).toBe("/claim #42");
    expect(parsed.demoVideoRequired).toBe(true);
    expect(parsed.state).toBe("open");
  });

  it("reads thousands separators and decimals", () => {
    expect(parseAlgoraBotComment({ body: "## 💎 $2,500 bounty\n`/attempt #7`" }).amountUsd).toBe(2500);
    expect(parseAlgoraBotComment({ body: "USD 1,250.50 bounty\n/claim #7" }).amountUsd).toBe(1250.5);
  });

  it("does not trust an author who is not the bot", () => {
    const parsed = parseAlgoraBotComment({ author: "helpful-stranger", body: botBody(500, 9) });
    expect(parsed.fromAlgoraBot).toBe(false);
    // It still parses — the caller decides. Refusing to read a comment is not
    // the same as refusing to believe it.
    expect(parsed.amountUsd).toBe(500);
  });

  it("recognises a comment saying the bounty was already paid", () => {
    const parsed = parseAlgoraBotComment({
      author: ALGORA_BOT_LOGIN,
      body: "The bounty has been paid to @somebody. 100% of the $250 bounty was rewarded.",
    });
    expect(parsed.state).toBe("rewarded");
  });

  it("recognises Algora's actual payout sentence (notify_transfer.ex, read 27.9.2026)", () => {
    const parsed = parseAlgoraBotComment({
      author: ALGORA_BOT_LOGIN,
      body: "🎉🎈 @solver has been awarded **$250** by **Acme Inc**! 🎈🎊",
    });
    expect(parsed.state).toBe("rewarded");
    expect(parsed.amountUsd).toBe(250);
  });

  it("does not read the bounty template's 'post-reward' line as a payout", () => {
    expect(parseAlgoraBotComment({ author: ALGORA_BOT_LOGIN, body: botBody(250, 42) }).state).toBe("open");
  });

  it("recognises a comment that is not a bounty comment at all", () => {
    const parsed = parseAlgoraBotComment({ author: ALGORA_BOT_LOGIN, body: "Thanks for opening this issue!" });
    expect(parsed.state).toBe("not-a-bounty-comment");
    expect(parsed.amountUsd).toBeNull();
    expect(parsed.issueNumber).toBeNull();
  });

  it("quotes what it matched, so a reason can cite the payer", () => {
    const parsed = parseAlgoraBotComment({ author: ALGORA_BOT_LOGIN, body: botBody(250, 42) });
    expect(parsed.quotes).toContain("/attempt #42");
    expect(parsed.quotes.join(" ")).toMatch(/demo video/i);
  });
});

describe("the pay floor, derived from the board's own numbers", () => {
  it("derives ₪37.50 per estimated hour from ₪300, ₪1,500, 160 agent-hours and a 25% acceptance rate", () => {
    const f = deriveBountyFloor();
    expect(f.lineTargetIls).toBe(300);
    expect(f.portfolioTargetIls).toBe(1500);
    expect(f.lineShare).toBeCloseTo(0.2, 6);
    expect(f.colonyAgentHoursPerMonth).toBe(160);
    expect(f.lineAgentHoursPerMonth).toBeCloseTo(32, 6);
    expect(f.realizedIlsPerHour).toBeCloseTo(9.375, 6);
    expect(f.killAcceptanceRate).toBe(0.25);
    expect(f.floorIlsPerHour).toBe(37.5);
    expect(f.floorUsdPerHour).toBeCloseTo(37.5 / 3.6, 6);
  });

  it("derives the ₪1,500 capacity base from the committed portfolio, naming its four addends (breadth board Part B(a))", () => {
    // research/breadth/BOARD.md Part B(a), 28.9.2026: the base is derived in code, not held. Each committed line adds
    // its target when the target is above ₪0; a line the board planned at ₪0 while keeping a build budget adds its
    // contested upper bound instead. Today: apify-actors 200 + il-biz-tools 400 (contested, budget kept) +
    // oss-bounties 300 + pcn874 600 = ₪1,500 — the same number as before, no longer held as a constant.
    expect(capacityBaseAddends()).toEqual([
      { lineId: "apify-actors", ils: 200, from: "target" },
      { lineId: "il-biz-tools", ils: 400, from: "contested-upper-bound" },
      { lineId: "oss-bounties", ils: 300, from: "target" },
      { lineId: "pcn874", ils: 600, from: "target" },
    ]);
    expect(capacityBaseIls()).toBe(1500);
    // The committed sum is still ₪1,100; the base differs from it only by il-biz-tools' contested ₪400.
    expect(committedTargetIls()).toBe(1100);
    expect(deriveBountyFloor().portfolioTargetIls).toBe(capacityBaseIls());
    expect(deriveBountyFloor().reasoning).toMatch(
      /derived from the committed portfolio, with a ₪0-planned line that keeps a build budget counted at its contested upper bound/,
    );
    expect(deriveBountyFloor().reasoning).not.toMatch(/held until the board rules/);
  });

  it("never lets a contested bound raise a positive target (apify-actors counts ₪200, not its ₪1,500)", () => {
    expect(capacityBaseAddends().find((a) => a.lineId === "apify-actors")).toEqual({
      lineId: "apify-actors",
      ils: 200,
      from: "target",
    });
  });

  it("moves with a week-4 retarget: oss-bounties at ₪100 → base ₪1,300, floor ₪32.50", () => {
    const retargeted = DEFAULT_PORTFOLIO.map((s) => (s.id === "oss-bounties" ? { ...s, targetMonthlyAgorot: 10_000 } : s));
    expect(capacityBaseIls(retargeted)).toBe(1300);
    const f = deriveBountyFloor({ seeds: retargeted });
    expect(f.lineTargetIls).toBe(100);
    expect(f.portfolioTargetIls).toBe(1300);
    expect(f.floorIlsPerHour).toBe(32.5);
  });

  it("drops a killed line: without oss-bounties the base is ₪1,200 and the arithmetic gives ₪30.00", () => {
    const withoutBounties = DEFAULT_PORTFOLIO.filter((s) => s.id !== "oss-bounties");
    expect(capacityBaseIls(withoutBounties)).toBe(1200);
    expect(deriveBountyFloor({ lineTargetIls: 300, portfolioTargetIls: capacityBaseIls(withoutBounties) }).floorIlsPerHour).toBe(30);
  });

  // Review of the breadth-board builder diff, finding 8: "a killed line contributes 0" held only by convention (a
  // killed seed is expected to leave DEFAULT_PORTFOLIO). The rule now holds in code: a seed whose id is in
  // KILLED_LINES adds 0 even while it is still in `seeds`, target and budget notwithstanding.
  it("counts a seed whose id is in KILLED_LINES as 0, even while it is still in the seeds", () => {
    const killedId = KILLED_LINES[0]!.id;
    const bounties = DEFAULT_PORTFOLIO.find((s) => s.id === "oss-bounties")!;
    const withKilledSeed = [...DEFAULT_PORTFOLIO, { ...bounties, id: killedId }];
    expect(capacityBaseAddends(withKilledSeed).find((a) => a.lineId === killedId)).toEqual({
      lineId: killedId,
      ils: 0,
      from: "killed",
    });
    expect(capacityBaseIls(withKilledSeed)).toBe(1500);
    expect(deriveBountyFloor({ seeds: withKilledSeed }).floorIlsPerHour).toBe(37.5);
  });

  it("drops oss-bounties by killing it, not by filtering it: base ₪1,200, floor ₪30.00", () => {
    const killed = new Set([...KILLED_LINES.map((k) => k.id), "oss-bounties"]);
    expect(capacityBaseIls(DEFAULT_PORTFOLIO, TARGET_BASIS, killed)).toBe(1200);
    expect(deriveBountyFloor({ lineTargetIls: 300, portfolioTargetIls: capacityBaseIls(DEFAULT_PORTFOLIO, TARGET_BASIS, killed) }).floorIlsPerHour).toBe(30);
  });

  it("counts a ₪0 line with no build budget as 0, contested bound or not", () => {
    const noBudget = DEFAULT_PORTFOLIO.map((s) => (s.id === "il-biz-tools" ? { ...s, budgetMonthlyCents: 0 } : s));
    expect(capacityBaseAddends(noBudget).find((a) => a.lineId === "il-biz-tools")).toEqual({
      lineId: "il-biz-tools",
      ils: 0,
      from: "none",
    });
    expect(capacityBaseIls(noBudget)).toBe(1100);
  });

  it("rounds the floor to the agora, so a bounty paying exactly the floor is not refused on float dust", () => {
    // ₪1,100 / 160h / 0.25 is 27.500000000000004 in floating point.
    expect(deriveBountyFloor({ portfolioTargetIls: 1100 }).floorIlsPerHour).toBe(27.5);
  });

  it("re-derives itself from the portfolio, so a board retarget moves the floor", () => {
    // The point of deriving rather than picking: if the board halves the line's
    // target, the floor halves with it and nobody has to remember to edit it.
    const f = deriveBountyFloor({ lineTargetIls: 150, portfolioTargetIls: 1500 });
    expect(f.lineShare).toBeCloseTo(0.1, 6);
    expect(f.floorIlsPerHour).toBeCloseTo(37.5, 6); // share and target move together
    const g = deriveBountyFloor({ colonyAgentHoursPerMonth: 320 });
    expect(g.floorIlsPerHour).toBeCloseTo(18.75, 6);
  });

  it("keeps its inputs equal to the values they were copied from", () => {
    const seed = DEFAULT_PORTFOLIO.find((s) => s.id === "oss-bounties")!;
    expect(seed.targetMonthlyAgorot / 100).toBe(deriveBountyFloor().lineTargetIls);
    expect(seed.killCriteria.join(" ")).toMatch(/acceptance rate under 25%/);
    expect(KILL_ACCEPTANCE_RATE).toBe(0.25);
    expect(COLONY_AGENT_HOURS_PER_MONTH).toBe(160);
  });

  it("shows its arithmetic in words", () => {
    const f = deriveBountyFloor();
    expect(f.reasoning).toMatch(/₪300/);
    expect(f.reasoning).toMatch(/32\.0 of MISSION constraint 4's 160 agent-hours/);
    expect(f.reasoning).toMatch(/₪37\.50 per estimated hour/);
  });

  it("allows about ten and a half hours on the ~\\$110 average bounty the audit accepted", () => {
    const f = deriveBountyFloor();
    const hours = (110 * f.usdIls) / f.floorIlsPerHour;
    expect(hours).toBeGreaterThan(10);
    expect(hours).toBeLessThan(11);
  });
});

describe("scoreBounty — every rule", () => {
  const state = { attempting: [] as string[], now: NOW };

  it("accepts a bounty that clears every rule and says why", () => {
    const s = scoreBounty(candidate(), state);
    expect(s.eligible).toBe(true);
    expect(s.skipped).toEqual([]);
    expect(s.amountIls).toBeCloseTo(900, 2);
    expect(s.ilsPerHour).toBeCloseTo(225, 2);
    expect(s.stacks).toContain("typescript");
    expect(s.acceptanceCriteria.length).toBeGreaterThan(0);
    expect(s.reasons.join(" ")).toMatch(/clears the ₪37\.5\/h floor/);
  });

  it("skips a repository whose policy forbids AI-authored work", () => {
    const s = scoreBounty(candidate({ policy: "forbidden" }), state);
    expect(s.eligible).toBe(false);
    expect(s.skipped.map((k) => k.rule)).toContain("repo-policy-forbids-ai");
  });

  it("attempts a repository whose policy is silent, and says it will disclose anyway", () => {
    const s = scoreBounty(candidate({ policy: "unknown" }), state);
    expect(s.eligible).toBe(true);
    expect(s.reasons.join(" ")).toMatch(/never as `allowed`/);
  });

  it("never attempts again in a repository whose maintainer asked us to stop", () => {
    const s = scoreBounty(candidate(), { attempting: [], stoppedRepos: ["acme/widget"], now: NOW });
    expect(s.eligible).toBe(false);
    const reason = s.skipped.find((k) => k.rule === "stopped-on-maintainer-request")!;
    expect(reason.detail).toMatch(/permanently/);
  });

  it("skips an issue the maintainer already assigned", () => {
    const s = scoreBounty(candidate({ assignedTo: "some-contributor" }), state);
    expect(s.skipped.map((k) => k.rule)).toContain("assigned-to-someone-else");
  });

  it("skips a bounty with no payer comment at all", () => {
    const s = scoreBounty(candidate({ botComment: undefined }), state);
    expect(s.skipped.map((k) => k.rule)).toContain("no-algora-bot-comment");
  });

  it("skips a bounty comment somebody other than the bot wrote", () => {
    const s = scoreBounty(candidate({ botComment: { author: "random-user", body: botBody(250, 42) } }), state);
    expect(s.skipped.map((k) => k.rule)).toContain("bot-comment-not-from-algora");
  });

  it("skips a bounty the bot says was already paid", () => {
    const s = scoreBounty(
      candidate({ botComment: { author: ALGORA_BOT_LOGIN, body: "The $250 bounty has been paid. /claim #42" } }),
      state,
    );
    expect(s.skipped.map((k) => k.rule)).toContain("bounty-already-rewarded");
  });

  it("skips a comment carrying neither /attempt nor /claim", () => {
    const s = scoreBounty(candidate({ botComment: { author: ALGORA_BOT_LOGIN, body: "A $250 reward is available." } }), state);
    expect(s.skipped.map((k) => k.rule)).toContain("bot-comment-carries-no-commands");
  });

  it("skips a bounty whose amount the payer's comment does not confirm", () => {
    const s = scoreBounty(candidate({ amount: 250, botComment: { author: ALGORA_BOT_LOGIN, body: botBody(50, 42) } }), state);
    const reason = s.skipped.find((k) => k.rule === "bot-amount-disagrees")!;
    expect(reason.detail).toMatch(/\$50/);
  });

  it("skips a bounty whose amount cannot be read from the payer's comment", () => {
    const s = scoreBounty(
      candidate({ botComment: { author: ALGORA_BOT_LOGIN, body: "Steps: comment `/attempt #42` then `/claim #42`." } }),
      state,
    );
    expect(s.skipped.map((k) => k.rule)).toContain("bot-amount-unparseable");
  });

  it("skips an issue with no testable acceptance criterion", () => {
    const s = scoreBounty(candidate({ issueText: "The date parsing feels wrong in TypeScript. Someone should look at it.", issueTitle: "dates" }), state);
    const reason = s.skipped.find((k) => k.rule === "no-testable-acceptance-criterion")!;
    expect(reason.detail).toMatch(/MISSION rule 4/);
  });

  it("skips work outside TypeScript / Python / docs / tests", () => {
    const s = scoreBounty(
      candidate({
        labels: ["rust", "help wanted"],
        issueTitle: "Rewrite the allocator",
        issueText: "Steps to reproduce: run the Rust benchmark. Expected: under 2ms. Actual: 40ms.",
      }),
      state,
    );
    expect(s.skipped.map((k) => k.rule)).toContain("not-our-stack");
  });

  it("skips work that needs a conversation, a design review or a signature", () => {
    for (const [text, label] of [
      ["Before starting, please hop on a call with the maintainers.", "call"],
      ["This needs design review before any code is written.", "design"],
      ["Contributors must sign our CLA before we can merge.", "cla"],
      ["Come discuss this with the team on our Discord first.", "discord"],
    ] as const) {
      const s = scoreBounty(candidate({ issueText: `${candidate().issueText}\n${text}` }), state);
      expect(s.skipped.map((k) => k.rule), label).toContain("needs-a-human");
    }
  });

  it("skips work needing an account or hardware the colony does not have", () => {
    for (const text of [
      "You will need an AWS account to run the integration tests.",
      "A Figma file access is required to match the design.",
      "Reproducing needs a physical device.",
    ]) {
      const s = scoreBounty(candidate({ issueText: `${candidate().issueText}\n${text}` }), state);
      expect(s.skipped.map((k) => k.rule), text).toContain("needs-an-account-we-do-not-have");
    }
  });

  it("skips a bounty paying below the derived floor", () => {
    // $10 for 4 hours is ₪36 total, ₪9/h — a quarter of the floor.
    const s = scoreBounty(candidate({ amount: 10, estimatedHours: 4, botComment: { author: ALGORA_BOT_LOGIN, body: botBody(10, 42) } }), state);
    const reason = s.skipped.find((k) => k.rule === "below-pay-floor")!;
    expect(reason.detail).toMatch(/floor of ₪37\.5\/h/);
    expect(reason.detail).toMatch(/MISSION constraint 4/);
  });

  it("accepts a bounty exactly at the floor", () => {
    // ₪37.5/h × 4h = ₪150 = $41.666… at 3.6.
    const amount = (37.5 * 4) / 3.6;
    const s = scoreBounty(
      candidate({ amount, estimatedHours: 4, botComment: { author: ALGORA_BOT_LOGIN, body: `$${amount} bounty /attempt #42 /claim #42` } }),
      state,
    );
    expect(s.skipped.map((k) => k.rule)).not.toContain("below-pay-floor");
  });

  it("skips a bounty another solver attempted inside the window, and only penalises older attempts", () => {
    const recent = scoreBounty(candidate({ attemptsByOthers: [{ actor: "rival", at: "2026-09-05T00:00:00.000Z" }] }), state);
    expect(recent.skipped.map((k) => k.rule)).toContain("contested-recently");

    const old = scoreBounty(candidate({ attemptsByOthers: [{ actor: "rival", at: "2026-07-01T00:00:00.000Z" }] }), state);
    expect(old.eligible).toBe(true);
    expect(old.competitors).toBe(1);
    expect(old.reasons.join(" ")).toMatch(/outside the 7-day window/);
  });

  it("takes the attempt window from config", () => {
    const cfg = defaultIntakeConfig({ attemptWindowDays: 120 });
    const s = scoreBounty(candidate({ attemptsByOthers: [{ actor: "rival", at: "2026-07-01T00:00:00.000Z" }] }), state, cfg);
    expect(s.skipped.map((k) => k.rule)).toContain("contested-recently");
    expect(DEFAULT_ATTEMPT_WINDOW_DAYS).toBe(7);
  });

  it("skips a currency with no stored rate, and an estimate of zero hours", () => {
    const fx = scoreBounty(candidate({ currency: "JPY" }), state);
    expect(fx.skipped.map((k) => k.rule)).toContain("unsupported-currency");
    const hours = scoreBounty(candidate({ estimatedHours: 0 }), state);
    expect(hours.skipped.map((k) => k.rule)).toContain("no-estimate");
  });

  it("reports every rule that refused a candidate, not just the first", () => {
    const s = scoreBounty(candidate({ policy: "forbidden", assignedTo: "someone", amount: 5, botComment: { author: ALGORA_BOT_LOGIN, body: botBody(5, 42) } }), state);
    const rules = s.skipped.map((k) => k.rule);
    expect(rules).toContain("repo-policy-forbids-ai");
    expect(rules).toContain("assigned-to-someone-else");
    expect(rules).toContain("below-pay-floor");
  });

  it("scores a better-paid, better-specified bounty above a marginal one", () => {
    const rich = scoreBounty(candidate({ id: "a#1", amount: 500, estimatedHours: 3, botComment: { author: ALGORA_BOT_LOGIN, body: botBody(500, 42) } }), state);
    const thin = scoreBounty(candidate({ id: "b#2", amount: 60, estimatedHours: 4, botComment: { author: ALGORA_BOT_LOGIN, body: botBody(60, 42) } }), state);
    expect(rich.score).toBeGreaterThan(thin.score);
  });
});

describe("selectBounties — the two-in-parallel cap", () => {
  const three = [
    candidate({ id: "a#1", amount: 500, estimatedHours: 3, botComment: { author: ALGORA_BOT_LOGIN, body: botBody(500, 1) }, issueNumber: 1 }),
    candidate({ id: "b#2", amount: 400, estimatedHours: 3, botComment: { author: ALGORA_BOT_LOGIN, body: botBody(400, 2) }, issueNumber: 2 }),
    candidate({ id: "c#3", amount: 300, estimatedHours: 3, botComment: { author: ALGORA_BOT_LOGIN, body: botBody(300, 3) }, issueNumber: 3 }),
  ];

  it("never shortlists more than two", () => {
    expect(MAX_PARALLEL_ATTEMPTS).toBe(2);
    const sel = selectBounties(three, { supplyVerdict: "keep", attempting: [], now: NOW });
    expect(sel.slots).toBe(2);
    expect(sel.shortlist).toHaveLength(2);
    expect(sel.shortlist.map((s) => s.id)).toEqual(["a#1", "b#2"]);
  });

  it("puts the overflow in `skipped` with an explicit reason rather than dropping it", () => {
    const sel = selectBounties(three, { supplyVerdict: "keep", attempting: [], now: NOW });
    const overflow = sel.skipped.find((s) => s.id === "c#3")!;
    expect(overflow.eligible).toBe(false);
    expect(overflow.skipped.map((k) => k.rule)).toContain("no-slot-free");
    expect(sel.shortlist.length + sel.skipped.length).toBe(three.length);
  });

  it("leaves one slot when one attempt is already open", () => {
    const sel = selectBounties(three, { supplyVerdict: "keep", attempting: ["z#9"], now: NOW });
    expect(sel.slots).toBe(1);
    expect(sel.shortlist).toHaveLength(1);
    expect(sel.notes.join(" ")).toMatch(/1 of 2 parallel attempts are open/);
  });

  it("shortlists nothing when both attempts are open, and says the cap is why", () => {
    const sel = selectBounties(three, { supplyVerdict: "keep", attempting: ["z#9", "y#8"], now: NOW });
    expect(sel.slots).toBe(0);
    expect(sel.shortlist).toEqual([]);
    expect(sel.notes.join(" ")).toMatch(/parallel cap is full/);
    expect(sel.skipped.every((s) => s.skipped.some((k) => k.rule === "no-slot-free"))).toBe(true);
  });

  it("cannot be pushed over the cap by more candidates", () => {
    const many = Array.from({ length: 20 }, (_, i) =>
      candidate({ id: `m#${i}`, issueNumber: i + 1, amount: 500, estimatedHours: 3, botComment: { author: ALGORA_BOT_LOGIN, body: botBody(500, i + 1) } }),
    );
    expect(selectBounties(many, { supplyVerdict: "keep", attempting: [], now: NOW }).shortlist.length).toBeLessThanOrEqual(MAX_PARALLEL_ATTEMPTS);
  });

  it("does not re-offer something already being attempted", () => {
    const sel = selectBounties(three, { supplyVerdict: "keep", attempting: ["a#1"], now: NOW });
    expect(sel.shortlist.map((s) => s.id)).not.toContain("a#1");
    expect(sel.skipped.find((s) => s.id === "a#1")!.skipped.map((k) => k.rule)).toContain("already-attempting");
  });

  it("orders deterministically: score, then rate, then id", () => {
    const a = selectBounties(three, { supplyVerdict: "keep", attempting: [], now: NOW }).shortlist.map((s) => s.id);
    const b = selectBounties([...three].reverse(), { supplyVerdict: "keep", attempting: [], now: NOW }).shortlist.map((s) => s.id);
    expect(a).toEqual(b);
  });

  it("reports the permanent stop list at colony level", () => {
    const sel = selectBounties(three, { supplyVerdict: "keep", attempting: [], stoppedRepos: ["acme/widget"], now: NOW });
    expect(sel.shortlist).toEqual([]);
    expect(sel.notes.join(" ")).toMatch(/permanently off-limits/);
  });

  it("carries the config it used, so a reader can check the floor it applied", () => {
    const sel = selectBounties([], { supplyVerdict: "keep", attempting: [], now: NOW });
    expect(sel.config.maxParallelAttempts).toBe(2);
    expect(sel.config.floorIlsPerHour).toBeCloseTo(37.5, 6);
    expect(sel.config.requiredStacks).toEqual(["typescript", "javascript", "python", "docs", "tests"]);
  });
});

describe("the intake is gated on the board's clock (RULING-2026-09-28-bounty-rail.md §5.2 item 8)", () => {
  const eligible = candidate();

  it("emits nothing while the week-4 reading of the corrected series is pending — and nothing when nobody said", () => {
    for (const state of [{ attempting: [], now: NOW }, { attempting: [], now: NOW, supplyVerdict: "pending" as const }]) {
      const sel = selectBounties([eligible], state);
      expect(sel.shortlist).toEqual([]);
      expect(sel.skipped[0]!.skipped.map((k) => k.rule)).toContain("board-clock-pending");
      expect(sel.notes.join(" ")).toMatch(/week-4/);
    }
  });

  it("emits nothing, ever, after a kill", () => {
    const sel = selectBounties([eligible], { attempting: [], now: NOW, supplyVerdict: "kill" });
    expect(sel.shortlist).toEqual([]);
    expect(sel.skipped[0]!.skipped.map((k) => k.rule)).toContain("line-killed");
  });

  it("emits normally once the board kept or retargeted the line", () => {
    for (const supplyVerdict of ["keep", "retarget"] as const) {
      expect(selectBounties([eligible], { attempting: [], now: NOW, supplyVerdict }).shortlist.map((s) => s.id)).toEqual([eligible.id]);
    }
  });
});

describe("not-a-payer is a refusal (RULING-2026-09-28-bounty-rail.md §5.2 item 2)", () => {
  it("never attempts a repository graded not-a-payer", () => {
    const s = scoreBounty(candidate({ policy: "not-a-payer" }), { attempting: [], now: NOW });
    expect(s.eligible).toBe(false);
    expect(s.skipped.map((k) => k.rule)).toContain("repo-not-a-payer");
  });
});

describe("the brand machine account (BOARD-2 §2.1.3(c))", () => {
  it("accepts a machine user whose login does not end in 'bot'", () => {
    expect(brandAccountProblems({ login: "acme-colony", type: "User" })).toEqual([]);
    // "bot" inside the login is fine; the board's rule and Algora's %bot query are about the ending.
    expect(brandAccountProblems({ login: "robotics-team", type: "User" })).toEqual([]);
  });

  it("refuses a login ending in 'bot', in any case", () => {
    expect(brandAccountProblems({ login: "acme-bot", type: "User" }).join(" ")).toMatch(/ends in "bot"/);
    expect(brandAccountProblems({ login: "AcmeBOT", type: "User" })).toHaveLength(1);
  });

  it("refuses a GitHub App or an organisation — it must be a User", () => {
    expect(brandAccountProblems({ login: "acme-colony", type: "Bot" }).join(" ")).toMatch(/not "User"/);
    expect(brandAccountProblems({ login: "acme-colony", type: "Organization" })).toHaveLength(1);
    // An App's login is "name[bot]" — it ends in "]", so only the type check fires; that is the one that matters.
    expect(brandAccountProblems({ login: "acme[bot]", type: "Bot" })).toHaveLength(1);
  });
});
