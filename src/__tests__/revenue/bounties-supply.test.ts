import { describe, it, expect } from "vitest";
import {
  BOUNTY_LABEL,
  MIN_CLAIMABLE_USD,
  REOPEN_TRIGGER,
  REWARDED_LABEL,
  SUPPLY_FILTERS,
  SUPPLY_THRESHOLDS,
  appendWeeklyReading,
  buildSupplyMeasurement,
  evaluateIssue,
  isoWeek,
  readAlgoraComments,
  readBoardVerdict,
  renderSupplyMarkdown,
  searchUnservedAllowance,
  type SupplyComment,
  type SupplyIssue,
  type SupplyReading,
} from "../../revenue/bounties/supply.js";
import { ALGORA_BOT_LOGIN } from "../../revenue/bounties/intake.js";
import { DEFAULT_PORTFOLIO, TARGET_BASIS } from "../../revenue/portfolio.js";

/**
 * The weekly claimable-supply count ordered by research/colony-sweep/BOARD-2.md §2.2.
 *
 * Every comment body below is Algora's own wording, read from `algora-io/algora` on GitHub
 * (raw.githubusercontent.com, 27.9.2026) — data, quoted so the filters are tested against the
 * payer's real text rather than against a shape this repo imagined:
 *   - the bounty comment: lib/algora/bot_templates/bot_templates.ex, `get_default_template(:bounty_created)`
 *     with the `PRIZE_POOL` placeholder "## 💎 $1,000 bounty [• name](…)";
 *   - the payout comment: lib/algora/bounties/jobs/notify_transfer.ex —
 *     "🎉🎈 @#{login} has been awarded **#{net_amount}** by **#{name}**! 🎈🎊" — posted after the
 *     same job adds the "💰 Rewarded" label;
 *   - the merged comment: lib/algora_web/controllers/webhooks/github_controller.ex —
 *     "🎉 The pull request of #{names} has been merged. The bounty can be rewarded [here](…)".
 * No fixture carries a link to Algora's own site: the template's payments link is left out on purpose.
 */

function bountyComment(amountUsd: number, issue: number): SupplyComment {
  return {
    author: ALGORA_BOT_LOGIN,
    body: [
      `## 💎 $${amountUsd.toLocaleString("en-US")} bounty [• Acme](https://example.invalid/acme)`,
      "### Steps to solve:",
      `1. **Start working**: Comment \`/attempt #${issue}\` with your implementation plan`,
      `2. **Submit work**: Create a pull request including \`/claim #${issue}\` in the PR body to claim the bounty`,
      "3. **Receive payment**: 100% of the bounty is received 2-5 days post-reward.",
      "",
      "### ❗ Important guidelines:",
      "- To claim a bounty, you need to **provide a short demo video** of your changes in your pull request",
      "- Low quality AI PRs will not receive review and will be closed",
    ].join("\n"),
  };
}

const payoutComment = (login = "solver", amount = "$250"): SupplyComment => ({
  author: ALGORA_BOT_LOGIN,
  body: `🎉🎈 @${login} has been awarded **${amount}** by **Acme Inc**! 🎈🎊`,
});

const mergedComment = (): SupplyComment => ({
  author: ALGORA_BOT_LOGIN,
  body: "🎉 The pull request of @solver has been merged. The bounty can be rewarded [here](https://example.invalid/claims/1)",
});

function issue(over: Partial<SupplyIssue> = {}): SupplyIssue {
  const number = over.number ?? 12;
  const repo = over.repo ?? "acme/widget";
  return {
    repo,
    number,
    title: over.title ?? "parseDate() throws on ISO week dates",
    url: over.url ?? `https://github.com/${repo}/issues/${number}`,
    state: over.state ?? "open",
    isPullRequest: over.isPullRequest ?? false,
    labels: over.labels ?? [BOUNTY_LABEL, "$250"],
    body: "body" in over ? (over.body as string | null) : "Expected: a Date. Actual: RangeError.",
    createdAt: over.createdAt ?? "2026-05-01T00:00:00Z",
    commentCount: over.commentCount ?? 1,
  };
}

const LIVE_REPO = { archived: false };
const SILENT_POLICY = { readme: "# Widget\nA date library." };

describe("evaluateIssue — the board's filters, cheapest first", () => {
  it("lists the board's filters in the order the data to check them costs", () => {
    const stages = SUPPLY_FILTERS.map((f) => f.stage);
    const order = ["search", "repo", "comments", "policy"];
    expect(stages.map((s) => order.indexOf(s))).toEqual([...stages.map((s) => order.indexOf(s))].sort((a, b) => a - b));
    expect(SUPPLY_FILTERS.map((f) => f.id)).toEqual([
      "not-an-open-labelled-issue",
      "rewarded-label",
      "archived-repo",
      "payout-comment",
      "no-algora-bounty-comment",
      "amount-unparseable",
      "amount-under-minimum",
      "policy-forbidden",
    ]);
    for (const f of SUPPLY_FILTERS) expect(f.why.length, f.id).toBeGreaterThan(20);
  });

  it("drops a pull request, a closed issue or an issue without the label before anything is fetched", () => {
    expect(evaluateIssue(issue({ isPullRequest: true }))).toMatchObject({ kind: "dropped", filter: "not-an-open-labelled-issue" });
    expect(evaluateIssue(issue({ state: "closed" }))).toMatchObject({ kind: "dropped", filter: "not-an-open-labelled-issue" });
    expect(evaluateIssue(issue({ labels: ["bug"] }))).toMatchObject({ kind: "dropped", filter: "not-an-open-labelled-issue" });
  });

  it("compares labels the way GitHub's label search does — case-insensitively", () => {
    expect(evaluateIssue(issue({ labels: ["💎 bounty"] }))).toEqual({ kind: "needs", need: "repo" });
    expect(evaluateIssue(issue({ labels: [BOUNTY_LABEL, "💰 rewarded"] }))).toMatchObject({ kind: "dropped", filter: "rewarded-label" });
  });

  it("drops a rewarded issue on its label alone — no repository or comment read is needed", () => {
    expect(evaluateIssue(issue({ labels: [BOUNTY_LABEL, REWARDED_LABEL] }))).toMatchObject({ kind: "dropped", filter: "rewarded-label" });
  });

  it("asks for the repository next, then drops an archived one without reading comments", () => {
    expect(evaluateIssue(issue())).toEqual({ kind: "needs", need: "repo" });
    expect(evaluateIssue(issue(), { repo: { archived: true } })).toMatchObject({ kind: "dropped", filter: "archived-repo" });
  });

  it("asks for comments once the repository is live", () => {
    expect(evaluateIssue(issue(), { repo: LIVE_REPO })).toEqual({ kind: "needs", need: "comments" });
  });

  it("drops an issue Algora already paid by comment, even with the label still on (the census's finding)", () => {
    const v = evaluateIssue(issue(), { repo: LIVE_REPO, comments: [bountyComment(250, 12), payoutComment()] });
    expect(v).toMatchObject({ kind: "dropped", filter: "payout-comment", amountUsd: 250 });
    if (v.kind === "dropped") expect(v.detail).toMatch(/has been awarded/);
  });

  it("does not take a payout claim from anybody but Algora's bot", () => {
    const fake = { ...payoutComment(), author: "helpful-stranger" };
    const v = evaluateIssue(issue(), { repo: LIVE_REPO, comments: [bountyComment(250, 12), fake] });
    expect(v).toEqual({ kind: "needs", need: "policy" });
  });

  it("keeps an issue whose solving pull request Algora already saw merged, and flags it — the board's list does not drop it", () => {
    const v = evaluateIssue(issue(), { repo: LIVE_REPO, comments: [bountyComment(250, 12), mergedComment()], policyDocs: {} });
    expect(v).toMatchObject({ kind: "claimable", amountUsd: 250 });
    expect(v.kind === "claimable" && v.solutionMerged).toMatch(/has been merged/);
    const plain = evaluateIssue(issue(), { repo: LIVE_REPO, comments: [bountyComment(250, 12)], policyDocs: {} });
    expect(plain).toMatchObject({ kind: "claimable", solutionMerged: null });
  });

  it("drops an issue with no bounty comment from Algora's bot — anybody can type a dollar sign", () => {
    expect(evaluateIssue(issue(), { repo: LIVE_REPO, comments: [] })).toMatchObject({ kind: "dropped", filter: "no-algora-bounty-comment" });
    const stranger = { ...bountyComment(500, 12), author: "helpful-stranger" };
    expect(evaluateIssue(issue(), { repo: LIVE_REPO, comments: [stranger] })).toMatchObject({ kind: "dropped", filter: "no-algora-bounty-comment" });
  });

  it("drops a bounty comment with no readable amount as unparseable, not as zero", () => {
    const noAmount = { author: ALGORA_BOT_LOGIN, body: "Comment `/attempt #12` to start. `/claim #12` in your PR." };
    const v = evaluateIssue(issue(), { repo: LIVE_REPO, comments: [noAmount] });
    expect(v).toMatchObject({ kind: "dropped", filter: "amount-unparseable", amountUsd: null });
  });

  it("keeps $50 and drops $49 — the board's floor is inclusive", () => {
    expect(MIN_CLAIMABLE_USD).toBe(50);
    expect(evaluateIssue(issue(), { repo: LIVE_REPO, comments: [bountyComment(49, 12)] })).toMatchObject({ kind: "dropped", filter: "amount-under-minimum", amountUsd: 49 });
    expect(evaluateIssue(issue(), { repo: LIVE_REPO, comments: [bountyComment(50, 12)] })).toEqual({ kind: "needs", need: "policy" });
  });

  it("drops a repository whose policy forbids AI-authored work", () => {
    const v = evaluateIssue(issue(), {
      repo: LIVE_REPO,
      comments: [bountyComment(250, 12)],
      policyDocs: { contributing: "AI-generated pull requests will be closed without review." },
    });
    expect(v).toMatchObject({ kind: "dropped", filter: "policy-forbidden", amountUsd: 250 });
    if (v.kind === "dropped") expect(v.detail).toMatch(/contributing/);
  });

  it("reads the issue's own text as policy too — a ban in the issue binds that bounty", () => {
    const v = evaluateIssue(issue({ body: "Please, no AI-generated PRs for this one." }), {
      repo: LIVE_REPO,
      comments: [bountyComment(250, 12)],
      policyDocs: SILENT_POLICY,
    });
    expect(v).toMatchObject({ kind: "dropped", filter: "policy-forbidden" });
  });

  it("counts a bounty that clears every filter, carrying its amount and the policy verdict", () => {
    const v = evaluateIssue(issue(), { repo: LIVE_REPO, comments: [bountyComment(1000, 12)], policyDocs: SILENT_POLICY });
    expect(v).toMatchObject({ kind: "claimable", amountUsd: 1000, policy: "unknown" });
  });
});

describe("readAlgoraComments", () => {
  it("finds the bounty, the payout and the merge in Algora's own wording", () => {
    const read = readAlgoraComments([bountyComment(300, 5), mergedComment(), payoutComment("x", "$300")]);
    expect(read.bounty?.amountUsd).toBe(300);
    expect(read.payout).toMatch(/has been awarded/);
    expect(read.merged).toMatch(/has been merged/);
  });

  it("does not mistake the bounty template's 'post-reward' line for a payout", () => {
    const read = readAlgoraComments([bountyComment(300, 5)]);
    expect(read.payout).toBeNull();
    expect(read.merged).toBeNull();
  });
});

// ── Aggregation ─────────────────────────────────────────────────────────────

function fixtureRun() {
  const a1 = issue({ repo: "acme/widget", number: 1, title: "Fix | the pipe" });
  const a2 = issue({ repo: "acme/widget", number: 2 });
  const a3 = issue({ repo: "acme/widget", number: 3, labels: [BOUNTY_LABEL, REWARDED_LABEL] });
  const b1 = issue({ repo: "old/archive", number: 7 });
  const c1 = issue({ repo: "strict/repo", number: 9 });
  const d1 = issue({ repo: "cheap/tickets", number: 4 });
  const repos = {
    "acme/widget": { archived: false, policyDocs: SILENT_POLICY },
    "old/archive": { archived: true },
    "strict/repo": { archived: false, policyDocs: { contributing: "We do not accept AI-generated contributions." } },
    "cheap/tickets": { archived: false },
  };
  const evaluated = [
    { issue: a1, verdict: evaluateIssue(a1, { repo: LIVE_REPO, comments: [bountyComment(250, 1)], policyDocs: SILENT_POLICY }) },
    { issue: a2, verdict: evaluateIssue(a2, { repo: LIVE_REPO, comments: [bountyComment(100, 2), payoutComment()] }) },
    { issue: a3, verdict: evaluateIssue(a3) },
    { issue: b1, verdict: evaluateIssue(b1, { repo: { archived: true } }) },
    { issue: c1, verdict: evaluateIssue(c1, { repo: LIVE_REPO, comments: [bountyComment(500, 9)], policyDocs: repos["strict/repo"].policyDocs }) },
    { issue: d1, verdict: evaluateIssue(d1, { repo: LIVE_REPO, comments: [bountyComment(20, 4)] }) },
  ];
  return { evaluated, repos };
}

const METHOD = { query: `is:issue is:open label:"${BOUNTY_LABEL}"`, searchTotalCount: 6, authenticated: true, requests: { search: 1, core: 9 }, rateLimitWaitSeconds: 0 };

describe("buildSupplyMeasurement", () => {
  it("counts claimable bounties and accounts for every labelled issue exactly once", () => {
    const { evaluated, repos } = fixtureRun();
    const m = buildSupplyMeasurement({ measuredAt: "2026-09-28T06:30:00.000Z", evaluated, repos, method: METHOD });
    expect(m.claimableBounties).toBe(1);
    expect(m.claimableUsd).toBe(250);
    expect(m.labelledOpenIssues).toBe(6);
    expect(m.repositories).toBe(4);
    const dropped = Object.values(m.droppedByFilter).reduce((a, b) => a + b, 0);
    expect(dropped + m.claimableBounties).toBe(m.labelledOpenIssues);
    expect(m.droppedByFilter).toMatchObject({
      "rewarded-label": 1,
      "archived-repo": 1,
      "payout-comment": 1,
      "amount-under-minimum": 1,
      "policy-forbidden": 1,
    });
    expect(m.droppedByFilter).not.toHaveProperty("solution-merged");
    expect(m.claimableWithoutMergedSolution).toBe(1);
    // The funnel walks the same numbers down to the count.
    expect(m.funnel[0]!.remaining).toBe(6 - m.funnel[0]!.dropped);
    expect(m.funnel.at(-1)!.remaining).toBe(1);
  });

  it("breaks the count down per repository, busiest claimable first", () => {
    const { evaluated, repos } = fixtureRun();
    const m = buildSupplyMeasurement({ measuredAt: "2026-09-28T06:30:00.000Z", evaluated, repos, method: METHOD });
    expect(m.byRepo[0]).toMatchObject({ repo: "acme/widget", labelledOpen: 3, claimable: 1, claimableUsd: 250, archived: false, policy: "unknown" });
    const strict = m.byRepo.find((r) => r.repo === "strict/repo")!;
    expect(strict.policy).toBe("forbidden");
    expect(strict.dropped).toEqual({ "policy-forbidden": 1 });
    expect(m.byRepo.find((r) => r.repo === "old/archive")!.archived).toBe(true);
    expect(m.claimable).toEqual([
      expect.objectContaining({ repo: "acme/widget", number: 1, amountUsd: 250, url: "https://github.com/acme/widget/issues/1" }),
    ]);
  });

  it("writes a real zero as 0 — a measured nothing, with its funnel", () => {
    const only = issue({ labels: [BOUNTY_LABEL, REWARDED_LABEL] });
    const m = buildSupplyMeasurement({
      measuredAt: "2026-09-28T06:30:00.000Z",
      evaluated: [{ issue: only, verdict: evaluateIssue(only) }],
      repos: {},
      method: { ...METHOD, searchTotalCount: 1 },
    });
    expect(m.claimableBounties).toBe(0);
    expect(m.droppedByFilter["rewarded-label"]).toBe(1);
  });

  it("refuses to build a measurement from an unfinished evaluation", () => {
    const i = issue();
    expect(() =>
      buildSupplyMeasurement({ measuredAt: "2026-09-28T06:30:00.000Z", evaluated: [{ issue: i, verdict: evaluateIssue(i) }], repos: {}, method: METHOD }),
    ).toThrow(/still needs repo/);
  });

  it("refuses to count fewer issues than the search reported", () => {
    const { evaluated, repos } = fixtureRun();
    expect(() => buildSupplyMeasurement({ measuredAt: "2026-09-28T06:30:00.000Z", evaluated, repos, method: { ...METHOD, searchTotalCount: 9 } })).toThrow(
      /6 of 9/,
    );
  });

  // GitHub search can count index entries it never serves (hidden, deleted or transferred issues). supply-github.ts
  // accepts such a gap only when two full passes served the identical set and it is within searchUnservedAllowance;
  // it arrives here as method.searchUnserved, and is carried beside the count, never into it.
  it("accepts a search that served fewer than it counted when the gap is recorded as searchUnserved", () => {
    const { evaluated, repos } = fixtureRun();
    const m = buildSupplyMeasurement({ measuredAt: "2026-09-28T06:30:00.000Z", evaluated, repos, method: { ...METHOD, searchTotalCount: 9, searchUnserved: 3 } });
    expect(m.labelledOpenIssues).toBe(6);
    expect(m.claimableBounties).toBe(1);
    expect(m.method.searchTotalCount).toBe(9);
    expect(m.method.searchUnserved).toBe(3);
  });

  it("still refuses a gap the recorded searchUnserved does not cover", () => {
    const { evaluated, repos } = fixtureRun();
    expect(() =>
      buildSupplyMeasurement({ measuredAt: "2026-09-28T06:30:00.000Z", evaluated, repos, method: { ...METHOD, searchTotalCount: 9, searchUnserved: 2 } }),
    ).toThrow(/6 of 9/);
  });

  it("refuses a recorded gap larger than a stale index explains, or one that is not a count", () => {
    const { evaluated, repos } = fixtureRun();
    const build = (searchTotalCount: number, searchUnserved: number) => () =>
      buildSupplyMeasurement({ measuredAt: "2026-09-28T06:30:00.000Z", evaluated, repos, method: { ...METHOD, searchTotalCount, searchUnserved } });
    expect(build(12, 6)).toThrow(/6 unserved.*allows 5/);
    expect(build(6, -1)).toThrow(/searchUnserved/);
    expect(build(7, 0.5)).toThrow(/searchUnserved/);
    expect(searchUnservedAllowance(12)).toBe(5);
  });

  it("carries the weekly history forward and adds this week's reading", () => {
    const { evaluated, repos } = fixtureRun();
    const previous: SupplyReading[] = [{ week: "2026-W39", measuredAt: "2026-09-21T06:30:00.000Z", claimable: 4 }];
    const m = buildSupplyMeasurement({ measuredAt: "2026-09-28T06:30:00.000Z", evaluated, repos, method: METHOD, previousHistory: previous });
    expect(m.history).toEqual([...previous, { week: "2026-W40", measuredAt: "2026-09-28T06:30:00.000Z", claimable: 1 }]);
    expect(m.boardReading.weeksRead).toBe(2);
    expect(m.boardReading.verdict).toBe("pending");
  });
});

describe("the weekly series and the board's week-4 reading", () => {
  it("keys readings by ISO week, including the 53-week year", () => {
    expect(isoWeek("2026-09-28T06:30:00.000Z")).toBe("2026-W40");
    expect(isoWeek("2026-01-01T00:00:00.000Z")).toBe("2026-W01");
    expect(isoWeek("2027-01-01T12:00:00.000Z")).toBe("2026-W53");
    expect(isoWeek("2025-12-29T00:00:00.000Z")).toBe("2026-W01");
  });

  it("keeps one reading per week — a manual re-run replaces that week's reading rather than adding a fifth", () => {
    let h: SupplyReading[] = [];
    h = appendWeeklyReading(h, { measuredAt: "2026-09-28T06:30:00.000Z", claimable: 3 });
    h = appendWeeklyReading(h, { measuredAt: "2026-09-30T10:00:00.000Z", claimable: 5 });
    h = appendWeeklyReading(h, { measuredAt: "2026-09-21T06:30:00.000Z", claimable: 1 });
    expect(h).toEqual([
      { week: "2026-W39", measuredAt: "2026-09-21T06:30:00.000Z", claimable: 1 },
      { week: "2026-W40", measuredAt: "2026-09-30T10:00:00.000Z", claimable: 5 },
    ]);
  });

  const weeks = (...counts: number[]): SupplyReading[] =>
    counts.map((claimable, i) => ({ week: `2026-W${40 + i}`, measuredAt: new Date(Date.UTC(2026, 8, 28 + 7 * i)).toISOString(), claimable }));

  it("stays pending until four weekly readings exist", () => {
    const r = readBoardVerdict(weeks(20, 20, 20));
    expect(r).toMatchObject({ weeksRead: 3, verdict: "pending", mean: null });
  });

  it("applies BOARD-2 §2.2 on the mean of the first four: ≥10 keeps ₪300, 3-9 retargets to ₪100, under 3 kills", () => {
    expect(readBoardVerdict(weeks(10, 10, 10, 10))).toMatchObject({ verdict: "keep", mean: 10 });
    expect(readBoardVerdict(weeks(12, 9, 9, 9))).toMatchObject({ verdict: "retarget", mean: 9.75 });
    expect(readBoardVerdict(weeks(3, 3, 3, 3))).toMatchObject({ verdict: "retarget", mean: 3 });
    expect(readBoardVerdict(weeks(5, 3, 2, 1))).toMatchObject({ verdict: "kill", mean: 2.75 });
    // Later weeks do not rewrite the week-4 reading.
    expect(readBoardVerdict(weeks(0, 0, 0, 0, 50, 50))).toMatchObject({ verdict: "kill", mean: 0, weeksRead: 6 });
  });

  it("says whether the four weeks were consecutive, as the board asked", () => {
    const gap: SupplyReading[] = [
      { week: "2026-W40", measuredAt: "2026-09-28T00:00:00.000Z", claimable: 1 },
      { week: "2026-W41", measuredAt: "2026-10-05T00:00:00.000Z", claimable: 1 },
      { week: "2026-W43", measuredAt: "2026-10-19T00:00:00.000Z", claimable: 1 },
      { week: "2026-W44", measuredAt: "2026-10-26T00:00:00.000Z", claimable: 1 },
    ];
    expect(readBoardVerdict(gap).consecutive).toBe(false);
    expect(readBoardVerdict(weeks(1, 1, 1, 1)).consecutive).toBe(true);
    expect(readBoardVerdict(weeks(1, 1, 1, 1)).text).toMatch(/killed/i);
  });
});

describe("renderSupplyMarkdown", () => {
  it("states the count, what was excluded and why, and the per-repository table", () => {
    const { evaluated, repos } = fixtureRun();
    const md = renderSupplyMarkdown(buildSupplyMeasurement({ measuredAt: "2026-09-28T06:30:00.000Z", evaluated, repos, method: METHOD }));
    expect(md).toMatch(/\*\*1 claimable bount/);
    expect(md).toMatch(/BOARD-2\.md §2\.2/);
    for (const f of SUPPLY_FILTERS) expect(md).toContain(`\`${f.id}\``);
    expect(md).toMatch(/\| `acme\/widget` \| 3 \| 1 \|/);
    expect(md).toMatch(/week 1 of 4/i);
  });

  it("says how many issues GitHub counted and did not serve, beside the number — never inside it", () => {
    const { evaluated, repos } = fixtureRun();
    const md = renderSupplyMarkdown(
      buildSupplyMeasurement({ measuredAt: "2026-09-28T06:30:00.000Z", evaluated, repos, method: { ...METHOD, searchTotalCount: 9, searchUnserved: 3 } }),
    );
    expect(md).toContain("GitHub counted 3 issues it did not serve; the claimable count could be up to 3 higher.");
    expect(md).toMatch(/\*\*1 claimable bounty\*\*/);
    expect(md).toMatch(/search reported 9 and served 6 \(3 unserved\)/);
  });

  it("renders a measurement from before the field existed without inventing a gap", () => {
    const { evaluated, repos } = fixtureRun();
    const m = buildSupplyMeasurement({ measuredAt: "2026-09-28T06:30:00.000Z", evaluated, repos, method: METHOD });
    expect(m.method.searchUnserved).toBe(0);
    const { searchUnserved: _dropped, ...olderMethod } = m.method;
    const md = renderSupplyMarkdown({ ...m, method: olderMethod });
    expect(md).not.toMatch(/did not serve|\d+ unserved/);
    expect(md).toMatch(/search reported 6\./);
  });

  it("escapes third-party titles so an issue title cannot break the table", () => {
    const { evaluated, repos } = fixtureRun();
    const md = renderSupplyMarkdown(buildSupplyMeasurement({ measuredAt: "2026-09-28T06:30:00.000Z", evaluated, repos, method: METHOD }));
    expect(md).not.toContain("Fix | the pipe");
    expect(md).toContain("Fix \\| the pipe");
  });

  it("links bounties on GitHub only — never to the payer's own site", () => {
    const { evaluated, repos } = fixtureRun();
    const md = renderSupplyMarkdown(buildSupplyMeasurement({ measuredAt: "2026-09-28T06:30:00.000Z", evaluated, repos, method: METHOD }));
    expect(md).not.toMatch(new RegExp(["algora", "io"].join("\\."), "i"));
  });
});

describe("the board's thresholds live on the oss-bounties line as data (BOARD-2 §2.1, §2.2)", () => {
  const line = DEFAULT_PORTFOLIO.find((s) => s.id === "oss-bounties")!;
  const kill = line.killCriteria.join("\n");
  const scale = line.scaleCriteria.join("\n");

  it("names claimableBounties as a KPI", () => {
    expect(line.kpis.join(" ")).toMatch(/claimableBounties/);
  });

  it("carries the week-4 thresholds with the same numbers the reader applies", () => {
    expect(SUPPLY_THRESHOLDS).toEqual({ weeks: 4, keepAtOrAbove: 10, killBelow: 3, keepTargetIls: 300, retargetIls: 100 });
    expect(scale).toMatch(/claimableBounties.*mean of the first four weekly readings at or above 10.*₪300 stands/s);
    expect(kill).toMatch(/claimableBounties.*from 3 to 9.*₪300 → ₪100.*contradicted/s);
    expect(kill).toMatch(/claimableBounties.*under 3.*killed/s);
    expect(kill).toContain(REOPEN_TRIGGER);
    expect(REOPEN_TRIGGER).toBe("≥10 claimable bounties a week for four consecutive weekly runs");
  });

  it("kills the line the same day on any Algora or maintainer action over automation (§2.1.3(d))", () => {
    expect(kill).toMatch(/Algora or maintainer action against the account on grounds of automation/);
    expect(kill).toMatch(/refused claim.*warning.*suspension/s);
    expect(kill).toMatch(/same day.*REJECTED\.md.*quoted/s);
  });

  it("states the brand account rule as a line fact (§2.1.3(c))", () => {
    expect(line.operatingLoop).toMatch(/must not end in "bot"/);
    expect(line.operatingLoop).toMatch(/GitHub User.*not a GitHub App/);
  });

  it("leaves the ₪300 target alone until the week-4 reading exists", () => {
    expect(line.targetMonthlyAgorot).toBe(30_000);
    expect(TARGET_BASIS["oss-bounties"]!.ils).toBe(300);
    expect(TARGET_BASIS["oss-bounties"]!.basis).toMatch(/BOARD-2 §2\.2/);
  });
});
