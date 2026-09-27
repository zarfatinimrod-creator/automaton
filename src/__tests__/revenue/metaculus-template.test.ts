import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
// @ts-expect-error — plain ESM script, no type declarations by design (same as apify-runs.mjs)
import { CHANNELS, GATES, SEASONS, evaluate, gradeSeason, leaderboardUrl, pickLeaderboard, summariseSeason } from "../../../scripts/metaculus-template.mjs";

/**
 * BOARD-2 §1.9 — the Metaculus TEST_FIRST. The pass and kill lines were written before the number existed; these
 * tests pin them, and pin the counterfactual arithmetic to Metaculus's own prize rule (`scoring/utils.py:224-231`,
 * `:527-548`), so a later reader cannot quietly move either.
 */

type Entry = { user: { username: string; is_bot?: boolean } | null; score: number; rank?: number; exclusion_status?: number; take?: number; prize?: number };
const e = (username: string, score: number, over: Partial<Entry> = {}): Entry => ({
  user: { username, is_bot: true },
  score,
  rank: 0,
  exclusion_status: 0,
  take: Math.max(score, 0) ** 2,
  prize: 0,
  ...over,
});
const board = (entries: Entry[], over: Record<string, unknown> = {}) => ({
  id: 1,
  project_name: "Spring 2026",
  is_primary_leaderboard: true,
  score_type: "peer_tournament",
  finalized: true,
  prize_pool: 50_000,
  entries,
  ...over,
});

describe("the pre-registered lines (BOARD-2 §1.9)", () => {
  it("are the board's numbers", () => {
    expect(GATES).toEqual({ passMinScoreExclusive: 0, passMaxRank: 15, passMinPrizeUsd: 400, killBelowPrizeUsd: 300 });
  });

  it("read the seasons the library names, at the route Metaculus's own source serves", () => {
    expect(SEASONS.map((s: { id: number }) => s.id)).toEqual([32916, 33022]);
    expect(leaderboardUrl(32916)).toBe("https://www.metaculus.com/api/leaderboards/project/32916/");
  });

  it("the workflow checks the script's constants against the pinned library, and never runs on main", () => {
    const wf = readFileSync(".github/workflows/metaculus-template.yml", "utf8");
    expect(wf).toContain('forecasting-tools==0.3.1');
    expect(wf).toMatch(/branches-ignore: \[main\]/);
    expect(wf).not.toMatch(/secrets\.|"Authorization"/); // unauthenticated: no secret, no auth header
  });
});

describe("summariseSeason — the counterfactual prize", () => {
  it("is the template's squared score over the paid entries' take plus its own, times the pool", () => {
    // Two paid humans-built bots with take 100² and 50², one excluded template bot at 50.
    const lb = board([
      e("alpha", 100, { rank: 1, prize: 40_000 }),
      e("beta", 50, { rank: 3, prize: 10_000 }),
      e("metac-gpt-5", 50, { rank: 2, exclusion_status: 1 }),
      e("metac-weak", -5, { rank: 9, exclusion_status: 1 }),
    ]);
    const s = summariseSeason(lb);
    expect(s.best.username).toBe("metac-gpt-5");
    const share = 2500 / (10_000 + 2500 + 2500);
    expect(s.counterfactualShare).toBeCloseTo(share, 10);
    expect(s.counterfactualPrizeUsd).toBe(Math.round(share * 50_000));
    expect(s.rankAmongEligible).toBe(2); // only alpha scored higher among eligible entries
    expect(s.paid).toBe(2);
    expect(s.templates.map((t: { username: string }) => t.username)).toEqual(["metac-gpt-5", "metac-weak"]);
  });

  it("gives a non-positive score no take, as Metaculus does", () => {
    const s = summariseSeason(board([e("alpha", 10, { prize: 50_000 }), e("metac-x", -3, { exclusion_status: 1 })]));
    expect(s.counterfactualPrizeUsd).toBe(0);
    expect(gradeSeason(s).grade).toBe("KILL");
  });

  it("ignores unpaid eligible entries in the denominator — they fell under the minimum prize", () => {
    const withTail = summariseSeason(board([e("alpha", 100, { prize: 50_000 }), e("tiny", 5), e("metac-x", 100, { exclusion_status: 1 })]));
    expect(withTail.counterfactualShare).toBeCloseTo(0.5, 10);
  });

  it("refuses to compute a leaderboard that does not pay by squared score, or has no template bot", () => {
    expect(summariseSeason(board([e("metac-x", 1)], { score_type: "relative_legacy_tournament" })).error).toMatch(/does not pay/);
    expect(summariseSeason(board([e("alpha", 1)])).error).toMatch(/no metac-/);
    expect(summariseSeason(null).error).toMatch(/no leaderboard/);
  });

  it("picks the primary leaderboard from the list the endpoint returns", () => {
    const side = board([], { id: 7, is_primary_leaderboard: false });
    const primary = board([], { id: 8 });
    expect(pickLeaderboard([side, primary]).id).toBe(8);
    expect(pickLeaderboard([side]).id).toBe(7);
    expect(pickLeaderboard("nope")).toBeNull();
  });
});

describe("gradeSeason", () => {
  const graded = (score: number, rank: number, prize: number) =>
    gradeSeason({ best: { score }, rankAmongEligible: rank, counterfactualPrizeUsd: prize }).grade;

  it("PASS needs score > 0, rank ≤ 15 and ≥ $400", () => {
    expect(graded(10, 15, 400)).toBe("PASS");
    expect(graded(10, 16, 400)).toBe("NEITHER");
    expect(graded(10, 15, 399)).toBe("NEITHER");
  });

  it("KILL fires on score ≤ 0 or under $300, whatever the rank", () => {
    expect(graded(0, 1, 5000)).toBe("KILL");
    expect(graded(10, 1, 299)).toBe("KILL");
    expect(graded(10, 40, 300)).toBe("NEITHER");
  });
});

describe("evaluate — the channel test and the verdict", () => {
  const ok = (lb: unknown) => ({ meta: { status: 200 }, body: lb });
  const refused = { meta: { status: 403, error: "HTTP 403 Forbidden" }, body: null };
  const notRun = { meta: null, body: null };
  const season = (s: { id: number }, attempts: unknown[]) => ({
    season: s,
    attempts: attempts.map((a, i) => ({ channel: CHANNELS[i].name, slugSuffix: CHANNELS[i].slugSuffix, ...(a as object) })),
  });
  const passing = board([e("alpha", 100, { prize: 40_000 }), e("metac-x", 90, { exclusion_status: 1 })]);

  it("is PENDING until every channel has been tried — one refusal is not the test", () => {
    const r = evaluate(SEASONS.map((s: { id: number }) => season(s, [refused, notRun])));
    expect(r.verdict).toBe("PENDING");
  });

  it("KILLs when every channel refused, in either season", () => {
    const r = evaluate([season(SEASONS[0], [refused, refused]), season(SEASONS[1], [refused, ok(passing)])]);
    expect(r.verdict).toBe("KILL");
    expect(r.seasons[0].grade.why).toMatch(/refused an unauthenticated GitHub runner/);
    expect(r.seasons[1].grade.grade).toBe("PASS");
  });

  it("grades the first channel that returned JSON, and PASSes only when both seasons pass", () => {
    const r = evaluate(SEASONS.map((s: { id: number }) => season(s, [refused, ok(passing)])));
    expect(r.verdict).toBe("PASS");
    const weak = board([e("alpha", 100, { prize: 40_000 }), e("metac-x", 8.4, { exclusion_status: 1 })]); // ≈ $350: no kill, no pass
    expect(evaluate([season(SEASONS[0], [ok(passing), notRun]), season(SEASONS[1], [ok(weak), notRun])]).verdict).toBe("NEITHER");
  });

  it("treats a 200 that is not JSON as a refusal of the data", () => {
    const r = evaluate(SEASONS.map((s: { id: number }) => season(s, [{ meta: { status: 200 }, body: null }, refused])));
    expect(r.verdict).toBe("KILL");
  });
});
