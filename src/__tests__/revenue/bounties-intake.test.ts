import { describe, it, expect } from "vitest";
import {
  ALGORA_BOT_LOGIN,
  DEFAULT_ATTEMPT_WINDOW_DAYS,
  KILL_ACCEPTANCE_RATE,
  MAX_PARALLEL_ATTEMPTS,
  COLONY_AGENT_HOURS_PER_MONTH,
  defaultIntakeConfig,
  deriveBountyFloor,
  parseAlgoraBotComment,
  scoreBounty,
  selectBounties,
  type BountyCandidate,
} from "../../revenue/bounties/intake.js";
import { DEFAULT_PORTFOLIO } from "../../revenue/portfolio.js";

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
    expect(f.floorIlsPerHour).toBeCloseTo(37.5, 6);
    expect(f.floorUsdPerHour).toBeCloseTo(37.5 / 3.6, 6);
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
    const sel = selectBounties(three, { attempting: [], now: NOW });
    expect(sel.slots).toBe(2);
    expect(sel.shortlist).toHaveLength(2);
    expect(sel.shortlist.map((s) => s.id)).toEqual(["a#1", "b#2"]);
  });

  it("puts the overflow in `skipped` with an explicit reason rather than dropping it", () => {
    const sel = selectBounties(three, { attempting: [], now: NOW });
    const overflow = sel.skipped.find((s) => s.id === "c#3")!;
    expect(overflow.eligible).toBe(false);
    expect(overflow.skipped.map((k) => k.rule)).toContain("no-slot-free");
    expect(sel.shortlist.length + sel.skipped.length).toBe(three.length);
  });

  it("leaves one slot when one attempt is already open", () => {
    const sel = selectBounties(three, { attempting: ["z#9"], now: NOW });
    expect(sel.slots).toBe(1);
    expect(sel.shortlist).toHaveLength(1);
    expect(sel.notes.join(" ")).toMatch(/1 of 2 parallel attempts are open/);
  });

  it("shortlists nothing when both attempts are open, and says the cap is why", () => {
    const sel = selectBounties(three, { attempting: ["z#9", "y#8"], now: NOW });
    expect(sel.slots).toBe(0);
    expect(sel.shortlist).toEqual([]);
    expect(sel.notes.join(" ")).toMatch(/parallel cap is full/);
    expect(sel.skipped.every((s) => s.skipped.some((k) => k.rule === "no-slot-free"))).toBe(true);
  });

  it("cannot be pushed over the cap by more candidates", () => {
    const many = Array.from({ length: 20 }, (_, i) =>
      candidate({ id: `m#${i}`, issueNumber: i + 1, amount: 500, estimatedHours: 3, botComment: { author: ALGORA_BOT_LOGIN, body: botBody(500, i + 1) } }),
    );
    expect(selectBounties(many, { attempting: [], now: NOW }).shortlist.length).toBeLessThanOrEqual(MAX_PARALLEL_ATTEMPTS);
  });

  it("does not re-offer something already being attempted", () => {
    const sel = selectBounties(three, { attempting: ["a#1"], now: NOW });
    expect(sel.shortlist.map((s) => s.id)).not.toContain("a#1");
    expect(sel.skipped.find((s) => s.id === "a#1")!.skipped.map((k) => k.rule)).toContain("already-attempting");
  });

  it("orders deterministically: score, then rate, then id", () => {
    const a = selectBounties(three, { attempting: [], now: NOW }).shortlist.map((s) => s.id);
    const b = selectBounties([...three].reverse(), { attempting: [], now: NOW }).shortlist.map((s) => s.id);
    expect(a).toEqual(b);
  });

  it("reports the permanent stop list at colony level", () => {
    const sel = selectBounties(three, { attempting: [], stoppedRepos: ["acme/widget"], now: NOW });
    expect(sel.shortlist).toEqual([]);
    expect(sel.notes.join(" ")).toMatch(/permanently off-limits/);
  });

  it("carries the config it used, so a reader can check the floor it applied", () => {
    const sel = selectBounties([], { attempting: [], now: NOW });
    expect(sel.config.maxParallelAttempts).toBe(2);
    expect(sel.config.floorIlsPerHour).toBeCloseTo(37.5, 6);
    expect(sel.config.requiredStacks).toEqual(["typescript", "javascript", "python", "docs", "tests"]);
  });
});
