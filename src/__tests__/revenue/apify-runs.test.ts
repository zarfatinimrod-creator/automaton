import { describe, expect, it } from "vitest";
// @ts-expect-error — plain ESM script, no type declarations by design (same as check-deps-freshness.mjs)
import { summariseRuns, classifyStarter, daysBetween, dayKey, toMs, DAY_MS, WINDOW_DAYS } from "../../../scripts/apify-runs.mjs";

/**
 * The measurement MISSION.md constraint 7 asks for: how many strangers ran the
 * free Apify Actor. These tests pin the arithmetic, because the number is going
 * to be read as evidence and a quietly wrong window would be worse than no
 * number at all.
 */

const NOW = Date.parse("2026-09-07T12:00:00.000Z");
const at = (isoOrOffsetDays: string | number) =>
  typeof isoOrOffsetDays === "number" ? new Date(NOW + isoOrOffsetDays * DAY_MS).toISOString() : isoOrOffsetDays;

type RunFixture = { status?: string; startedAt?: string | null; userId?: string; meta?: { origin?: string } };
const run = (over: RunFixture = {}): RunFixture => ({
  status: "SUCCEEDED",
  startedAt: at(-1),
  userId: "stranger-1",
  meta: { origin: "WEB" },
  ...over,
});

const OURS = "our-account-id";

describe("toMs", () => {
  it("accepts the three shapes a timestamp arrives in", () => {
    expect(toMs(NOW)).toBe(NOW);
    expect(toMs(new Date(NOW))).toBe(NOW);
    expect(toMs("2026-09-07T12:00:00.000Z")).toBe(NOW);
  });

  it("returns null rather than NaN for anything unusable", () => {
    expect(toMs(null)).toBeNull();
    expect(toMs(undefined)).toBeNull();
    expect(toMs("")).toBeNull();
    expect(toMs("   ")).toBeNull();
    expect(toMs("not a date")).toBeNull();
    expect(toMs(new Date("nonsense"))).toBeNull();
  });
});

describe("dayKey and daysBetween", () => {
  it("buckets by UTC date", () => {
    expect(dayKey(Date.parse("2026-09-07T23:59:59.999Z"))).toBe("2026-09-07");
    expect(dayKey(Date.parse("2026-09-08T00:00:00.000Z"))).toBe("2026-09-08");
  });

  it("includes both ends", () => {
    const days = daysBetween(Date.parse("2026-09-05T18:00:00Z"), Date.parse("2026-09-07T01:00:00Z"));
    expect(days).toEqual(["2026-09-05", "2026-09-06", "2026-09-07"]);
  });

  it("spans a month boundary without dropping a day", () => {
    const days = daysBetween(Date.parse("2026-08-31T00:00:00Z"), Date.parse("2026-09-02T00:00:00Z"));
    expect(days).toEqual(["2026-08-31", "2026-09-01", "2026-09-02"]);
  });
});

describe("classifyStarter", () => {
  it("separates our own runs from a stranger's", () => {
    expect(classifyStarter({ userId: OURS }, OURS)).toBe("own");
    expect(classifyStarter({ userId: "someone-else" }, OURS)).toBe("stranger");
  });

  // The honest half. Without our own id nothing can be told apart, and claiming
  // a stranger where none is known is how a fake buyer signal gets manufactured.
  it("admits it cannot tell rather than guessing", () => {
    expect(classifyStarter({ userId: "someone-else" }, null)).toBe("unknown");
    expect(classifyStarter({}, OURS)).toBe("unknown");
    expect(classifyStarter({ userId: "   " }, OURS)).toBe("unknown");
  });
});

describe("summariseRuns — an Actor nobody has run", () => {
  const empty = summariseRuns([], NOW, { ownUserId: OURS });

  it("reports zero, prominently, instead of an empty shrug", () => {
    expect(empty.totalRuns).toBe(0);
    expect(empty.runsLast30Days).toBe(0);
    expect(empty.strangerRunsLast30Days).toBe(0);
    expect(empty.byStatus).toEqual({});
    expect(empty.byStarter).toEqual({ own: 0, stranger: 0, unknown: 0 });
    expect(empty.firstRunAt).toBeNull();
    expect(empty.lastRunAt).toBeNull();
  });

  it("still zero-fills every day of the window, so a chart shows a flat zero line", () => {
    // 30 whole days plus the partial oldest day = 31 UTC dates touched.
    const days = Object.keys(empty.byDay);
    expect(days).toHaveLength(31);
    expect(days[0]).toBe("2026-08-08");
    expect(days[days.length - 1]).toBe("2026-09-07");
    expect(Object.values(empty.byDay).every((n) => n === 0)).toBe(true);
  });

  it("stamps the measurement and its window", () => {
    expect(empty.measuredAt).toBe("2026-09-07T12:00:00.000Z");
    expect(empty.window).toEqual({
      days: WINDOW_DAYS,
      start: "2026-08-08T12:00:00.000Z",
      end: "2026-09-07T12:00:00.000Z",
    });
  });

  it("survives a caller that hands it nothing at all", () => {
    expect(summariseRuns(undefined, NOW).totalRuns).toBe(0);
    expect(summariseRuns(null, NOW).totalRuns).toBe(0);
  });

  it("refuses a `now` it cannot use, instead of silently producing NaN dates", () => {
    expect(() => summariseRuns([], "not a date")).toThrow(/not a usable timestamp/);
  });
});

describe("summariseRuns — the 30-day boundary", () => {
  const exactlyOnEdge = at(-WINDOW_DAYS);
  const oneMsOlder = new Date(NOW - WINDOW_DAYS * DAY_MS - 1).toISOString();

  it("counts a run sitting exactly on the edge (inclusive)", () => {
    const s = summariseRuns([run({ startedAt: exactlyOnEdge })], NOW, { ownUserId: OURS });
    expect(s.totalRuns).toBe(1);
    expect(s.runsLast30Days).toBe(1);
  });

  it("excludes a run one millisecond older, but never loses it from the total", () => {
    const s = summariseRuns([run({ startedAt: oneMsOlder })], NOW, { ownUserId: OURS });
    expect(s.totalRuns).toBe(1);
    expect(s.runsLast30Days).toBe(0);
    expect(s.byStatus).toEqual({ SUCCEEDED: 1 });
    expect(s.byStatusLast30Days).toEqual({});
    // It is out of the window, so it contributes to no day bucket.
    expect(Object.values(s.byDay).reduce((a, b) => a + Number(b), 0)).toBe(0);
  });

  it("keeps a run timestamped slightly ahead of us — that is clock skew, not the future", () => {
    const s = summariseRuns([run({ startedAt: at(0.001) })], NOW, { ownUserId: OURS });
    expect(s.runsLast30Days).toBe(1);
    expect(s.byDay["2026-09-07"]).toBe(1);
  });

  it("honours a different window when asked", () => {
    const runs = [run({ startedAt: at(-2) }), run({ startedAt: at(-20) })];
    expect(summariseRuns(runs, NOW, { ownUserId: OURS, windowDays: 7 }).runsLast30Days).toBe(1);
    expect(summariseRuns(runs, NOW, { ownUserId: OURS }).runsLast30Days).toBe(2);
  });

  it("counts an undated run in the total and nowhere else", () => {
    const s = summariseRuns([run({ startedAt: null }), run({ startedAt: "garbage" })], NOW, { ownUserId: OURS });
    expect(s.totalRuns).toBe(2);
    expect(s.undatedRuns).toBe(2);
    expect(s.runsLast30Days).toBe(0);
    expect(s.byStatus).toEqual({ SUCCEEDED: 2 });
    expect(s.firstRunAt).toBeNull();
  });
});

describe("summariseRuns — status grouping", () => {
  const runs = [
    run({ status: "SUCCEEDED", startedAt: at(-1) }),
    run({ status: "SUCCEEDED", startedAt: at(-2) }),
    run({ status: "SUCCEEDED", startedAt: at(-40) }),
    run({ status: "FAILED", startedAt: at(-3) }),
    run({ status: "ABORTED", startedAt: at(-4) }),
    run({ status: "TIMED-OUT", startedAt: at(-45) }),
    run({ status: undefined, startedAt: at(-5) }),
  ];
  const s = summariseRuns(runs, NOW, { ownUserId: OURS });

  it("groups every status all-time", () => {
    expect(s.byStatus).toEqual({ SUCCEEDED: 3, ABORTED: 1, FAILED: 1, "TIMED-OUT": 1, UNKNOWN: 1 });
    expect(s.totalRuns).toBe(7);
  });

  it("groups the window separately, so an old failure does not colour this month", () => {
    expect(s.byStatusLast30Days).toEqual({ SUCCEEDED: 2, ABORTED: 1, FAILED: 1, UNKNOWN: 1 });
    expect(s.runsLast30Days).toBe(5);
  });

  it("orders statuses by count so the biggest bucket reads first", () => {
    expect(Object.keys(s.byStatus)[0]).toBe("SUCCEEDED");
  });

  it("records the first and last run seen", () => {
    expect(s.firstRunAt).toBe(at(-45));
    expect(s.lastRunAt).toBe(at(-1));
  });
});

describe("summariseRuns — by-day buckets", () => {
  const runs = [
    run({ startedAt: "2026-09-07T00:00:01.000Z" }),
    run({ startedAt: "2026-09-07T11:59:59.000Z" }),
    run({ startedAt: "2026-09-05T08:00:00.000Z" }),
    run({ startedAt: "2026-08-31T23:59:59.999Z" }),
  ];
  const s = summariseRuns(runs, NOW, { ownUserId: OURS });

  it("counts each UTC day and leaves the quiet days at zero", () => {
    expect(s.byDay["2026-09-07"]).toBe(2);
    expect(s.byDay["2026-09-06"]).toBe(0);
    expect(s.byDay["2026-09-05"]).toBe(1);
    expect(s.byDay["2026-08-31"]).toBe(1);
  });

  it("keeps the days in date order", () => {
    const keys = Object.keys(s.byDay);
    expect([...keys].sort((a, b) => a.localeCompare(b))).toEqual(keys);
  });

  it("adds up to the window count", () => {
    expect(Object.values(s.byDay).reduce((a, b) => a + Number(b), 0)).toBe(s.runsLast30Days);
    expect(s.runsLast30Days).toBe(4);
  });
});

describe("summariseRuns — strangers versus us, which is the whole point", () => {
  const runs = [
    run({ userId: OURS, startedAt: at(-1), meta: { origin: "DEVELOPMENT" } }),
    run({ userId: OURS, startedAt: at(-2), meta: { origin: "CLI" } }),
    run({ userId: "stranger-a", startedAt: at(-3), meta: { origin: "WEB" } }),
    run({ userId: "stranger-b", startedAt: at(-4), meta: { origin: "API" } }),
    run({ userId: "stranger-c", startedAt: at(-40), meta: { origin: "WEB" } }),
    run({ userId: undefined, startedAt: at(-5), meta: undefined }),
  ];
  const s = summariseRuns(runs, NOW, { ownUserId: OURS });

  it("does not let our own smoke tests masquerade as demand", () => {
    expect(s.byStarter).toEqual({ own: 2, stranger: 3, unknown: 1 });
    expect(s.strangerRunsLast30Days).toBe(2);
    expect(s.runsLast30Days).toBe(5);
  });

  it("groups where the run came from", () => {
    expect(s.byOrigin).toEqual({ WEB: 2, API: 1, CLI: 1, DEVELOPMENT: 1, UNKNOWN: 1 });
  });

  it("claims no strangers at all when it does not know which account is ours", () => {
    const blind = summariseRuns(runs, NOW);
    expect(blind.byStarter).toEqual({ own: 0, stranger: 0, unknown: 6 });
    expect(blind.strangerRunsLast30Days).toBe(0);
    // ...while still counting the runs themselves.
    expect(blind.runsLast30Days).toBe(5);
  });
});
