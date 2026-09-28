import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it, expect } from "vitest";
import { WEB_ARM_REACH, evaluateWebArm, type WebArmReading } from "../../revenue/experiments.js";

// research/faceless-youtube/PREREG-DECISIONS.md §3.6: the loop writes the web arm's readings here — D0 with its two
// conditions, the discovery routes opened, own-view exceptions, the daily series, the foreign-shaped count, and at
// D0+56 the verdict of evaluateWebArm — "so an auditor re-runs it on the same numbers". This test is that re-run, and
// it takes nothing the loop typed on trust that the file's own dates can check: the day is counted from D0 (or from
// the last fixed instrument fault, §3.1(3)) to readAt, D0 is the later of its two conditions (§3.5), and the count has
// to fit the daily series inside the 56-day window.
const FILE = join("research", "faceless-youtube", "readings", "web-arm.json");
const DAY_MS = 86_400_000;

interface WebArmReadings {
  floor: typeof WEB_ARM_REACH;
  canonicalUrl: string | null;
  d0: {
    publicDeploy: { at: string | null; evidence: string | null };
    discoverySubmission: { at: string | null; route: string | null };
    date: string | null;
  };
  routesOpened: { route: string; openedAt: string; detail: string }[];
  ownViewExceptions: { at: string; detail: string }[];
  instrumentFaults: { at: string; detail: string; fixedAt: string | null }[];
  dailyCountedEvents: { date: string; count: number }[];
  foreignShapedEventsExcluded: number | null;
  read: (WebArmReading & { readAt: string; verdict: string }) | null;
}

const readings = (): WebArmReadings => JSON.parse(readFileSync(FILE, "utf8")) as WebArmReadings;

// Timestamps are ISO 8601 UTC ("…Z"); dates are UTC calendar dates. A date that rolls over (2026-02-30) is refused.
const isUtcTimestamp = (s: string): boolean =>
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?Z$/.test(s) &&
  !Number.isNaN(Date.parse(s)) &&
  new Date(s).toISOString().slice(0, 10) === s.slice(0, 10);
const isUtcDate = (s: string): boolean => /^\d{4}-\d{2}-\d{2}$/.test(s) && isUtcTimestamp(`${s}T00:00:00Z`);
const dateOf = (ts: string): string => ts.slice(0, 10);
const daysFrom = (from: string, to: string): number =>
  (Date.parse(`${to}T00:00:00Z`) - Date.parse(`${from}T00:00:00Z`)) / DAY_MS;

/** Every way the file disagrees with itself or with §3; empty when it holds. */
function auditWebArmReadings(r: WebArmReadings): string[] {
  const p: string[] = [];
  const ts = (label: string, v: string | null): void => {
    if (v !== null && !isUtcTimestamp(v)) p.push(`${label} is not an ISO 8601 UTC timestamp: ${v}`);
  };
  ts("d0.publicDeploy.at", r.d0.publicDeploy.at);
  ts("d0.discoverySubmission.at", r.d0.discoverySubmission.at);
  r.routesOpened.forEach((x, i) => ts(`routesOpened[${i}].openedAt`, x.openedAt));
  r.ownViewExceptions.forEach((x, i) => ts(`ownViewExceptions[${i}].at`, x.at));
  r.instrumentFaults.forEach((x, i) => {
    ts(`instrumentFaults[${i}].at`, x.at);
    ts(`instrumentFaults[${i}].fixedAt`, x.fixedAt);
  });
  if (r.d0.date !== null && !isUtcDate(r.d0.date)) p.push(`d0.date is not a UTC date: ${r.d0.date}`);
  r.dailyCountedEvents.forEach((d, i) => {
    if (!isUtcDate(d.date)) p.push(`dailyCountedEvents[${i}].date is not a UTC date: ${d.date}`);
    if (!Number.isInteger(d.count) || d.count < 0) p.push(`dailyCountedEvents[${i}].count is not a count: ${d.count}`);
  });
  if (new Set(r.dailyCountedEvents.map((d) => d.date)).size !== r.dailyCountedEvents.length) {
    p.push("dailyCountedEvents repeats a date");
  }
  if (r.read !== null) ts("read.readAt", r.read.readAt);
  if (p.length > 0) return p; // everything below computes with these values

  // D0 (§3.5): the UTC date of the later of the two conditions, recorded exactly when both are.
  const { publicDeploy, discoverySubmission, date } = r.d0;
  if (publicDeploy.at !== null && publicDeploy.evidence === null) p.push("d0.publicDeploy has a time but no evidence");
  if (discoverySubmission.at !== null && discoverySubmission.route === null) {
    p.push("d0.discoverySubmission has a time but no route");
  }
  const later = (a: string, b: string): string => (Date.parse(a) >= Date.parse(b) ? a : b);
  const d0 =
    publicDeploy.at !== null && discoverySubmission.at !== null
      ? dateOf(later(publicDeploy.at, discoverySubmission.at))
      : null;
  if (date !== d0) p.push(`d0.date is ${date}, but its two conditions give ${d0}`);
  if (r.read === null) return p; // nothing read yet: the normal state before D0+56
  if (d0 === null) return [...p, "a read is recorded with no D0"];

  // The clock restarts at each fixed instrument fault (§3.1(3)); the day is counted from the clock start to readAt.
  const clockStart = r.instrumentFaults
    .flatMap((f) => (f.fixedAt === null ? [] : [dateOf(f.fixedAt)]))
    .reduce((a, b) => (b > a ? b : a), d0);
  const { day, engagedStrangerViews: n, readAt, verdict } = r.read;
  const elapsed = daysFrom(clockStart, dateOf(readAt));
  if (day !== elapsed) p.push(`read.day is ${day}, but readAt is day ${elapsed} from the clock start ${clockStart}`);

  if (n !== null) {
    if (r.instrumentFaults.some((f) => f.fixedAt === null && Date.parse(f.at) <= Date.parse(readAt))) {
      p.push("a count is recorded while an instrument fault is open: the arm is unmeasured (§3.1(3))");
    }
    if (r.canonicalUrl === null) p.push("a count is recorded with no canonicalUrl");
    if (r.foreignShapedEventsExcluded === null) p.push("a count is recorded with no foreignShapedEventsExcluded");
    // N counts the 56 days [clockStart, clockStart + 56). Whether the daily series is before or after subtracting
    // own-view exceptions (§3.4(a)) is not ruled, so N must lie between the two: sum - exceptions <= N <= sum.
    const inWindow = (d: string): boolean => {
      const k = daysFrom(clockStart, d);
      return k >= 0 && k < WEB_ARM_REACH.day;
    };
    const sum = r.dailyCountedEvents.filter((d) => inWindow(d.date)).reduce((s, d) => s + d.count, 0);
    const own = r.ownViewExceptions.filter((e) => inWindow(dateOf(e.at))).length;
    if (n > sum || n < sum - own) {
      p.push(`engagedStrangerViews ${n} does not fit the daily series: expected ${sum - own}..${sum} in the window`);
    }
  }
  const expected = evaluateWebArm({ day: elapsed, engagedStrangerViews: n });
  if (verdict !== expected) p.push(`verdict is ${verdict}, but evaluateWebArm gives ${expected} on the file's numbers`);
  return p;
}

// A complete, consistent record: D0 = 2 Oct 2026 (the later condition), read on 27 Nov 2026 = day 56. The window is
// 2 Oct..26 Nov, so the 27 Nov count is outside it and N = 2 + 4 = 6.
function complete(): WebArmReadings {
  const r = readings();
  r.canonicalUrl = "https://name.netlify.app/";
  r.d0 = {
    publicDeploy: { at: "2026-10-01T09:00:00Z", evidence: "runner probe 200; identifier grep clean" },
    discoverySubmission: { at: "2026-10-02T08:00:00Z", route: "sitemap.xml" },
    date: "2026-10-02",
  };
  r.routesOpened = [{ route: "sitemap.xml", openedAt: "2026-10-02T08:00:00Z", detail: "robots.txt Sitemap: line" }];
  r.dailyCountedEvents = [
    { date: "2026-10-05", count: 2 },
    { date: "2026-11-20", count: 4 },
    { date: "2026-11-27", count: 9 },
  ];
  r.foreignShapedEventsExcluded = 0;
  r.read = { day: 56, engagedStrangerViews: 6, readAt: "2026-11-27T10:00:00Z", verdict: "stage_a_may_be_asked" };
  return r;
}

const problems = (edit: (r: WebArmReadings) => void): string[] => {
  const r = complete();
  edit(r);
  return auditWebArmReadings(r);
};

describe("the web arm's readings file (PREREG-DECISIONS.md §3.6)", () => {
  it("carries every field the section lists, under the pre-registered floor", () => {
    const r = readings();
    expect(r.floor).toEqual(WEB_ARM_REACH);
    expect(Object.keys(r.d0).sort()).toEqual(["date", "discoverySubmission", "publicDeploy"]);
    for (const k of ["routesOpened", "ownViewExceptions", "instrumentFaults", "dailyCountedEvents"] as const) {
      expect(Array.isArray(r[k])).toBe(true);
    }
    expect("foreignShapedEventsExcluded" in r && "read" in r && "canonicalUrl" in r).toBe(true);
  });

  it("passes the auditor's re-run on its own numbers", () => {
    expect(auditWebArmReadings(readings())).toEqual([]);
  });
});

describe("the auditor's re-run of the web arm readings", () => {
  it("accepts a complete, consistent record", () => {
    expect(auditWebArmReadings(complete())).toEqual([]);
  });

  it("counts the day from the dates, not from the day the loop typed", () => {
    // Read on day 40 (11 Nov) but recorded as day 56: the verdict the loop wrote no longer follows.
    const p = problems((r) => (r.read!.readAt = "2026-11-11T10:00:00Z"));
    expect(p.some((x) => x.startsWith("read.day is 56, but readAt is day 40"))).toBe(true);
    expect(p.some((x) => x.includes("evaluateWebArm gives not_due"))).toBe(true);
  });

  it("puts D0 on the later of the two conditions, and only when both are recorded (§3.5)", () => {
    expect(problems((r) => (r.d0.date = "2026-10-01"))).toContain(
      "d0.date is 2026-10-01, but its two conditions give 2026-10-02",
    );
    const noRoute = problems((r) => {
      r.d0.discoverySubmission = { at: null, route: null };
      r.d0.date = "2026-10-01";
    });
    expect(noRoute).toContain("d0.date is 2026-10-01, but its two conditions give null");
    const forgotten = problems((r) => {
      r.read = null;
      r.d0.date = null;
    });
    expect(forgotten).toContain("d0.date is null, but its two conditions give 2026-10-02");
  });

  it("restarts the clock at a fixed instrument fault, and reads nothing while one is open (§3.1(3))", () => {
    const fault = { at: "2026-10-10T12:00:00Z", detail: "counter found broken", fixedAt: "2026-10-12T09:00:00Z" };
    // Still counted from D0 after the fix: wrong.
    expect(problems((r) => r.instrumentFaults.push(fault)).some((x) => x.startsWith("read.day is 56"))).toBe(true);
    // Counted from the fix (12 Oct + 56 = 7 Dec); the window drops 5 Oct and keeps 20 and 27 Nov: N = 13.
    const restarted = problems((r) => {
      r.instrumentFaults.push(fault);
      r.read = { day: 56, engagedStrangerViews: 13, readAt: "2026-12-07T10:00:00Z", verdict: "stage_a_may_be_asked" };
    });
    expect(restarted).toEqual([]);
    // An open fault: a count is refused, and only "unmeasured" is a valid record.
    const open = { ...fault, fixedAt: null };
    expect(problems((r) => r.instrumentFaults.push(open))).toContain(
      "a count is recorded while an instrument fault is open: the arm is unmeasured (§3.1(3))",
    );
    const unmeasured = problems((r) => {
      r.instrumentFaults.push(open);
      r.read = { day: 56, engagedStrangerViews: null, readAt: "2026-11-27T10:00:00Z", verdict: "unmeasured" };
    });
    expect(unmeasured).toEqual([]);
  });

  it("refuses a verdict evaluateWebArm does not give", () => {
    expect(problems((r) => (r.read!.verdict = "stage_a_never_asked"))).toEqual([
      "verdict is stage_a_never_asked, but evaluateWebArm gives stage_a_may_be_asked on the file's numbers",
    ]);
  });

  it("fits the count to the daily series inside the 56-day window", () => {
    expect(problems((r) => (r.read!.engagedStrangerViews = 7)).some((x) => x.includes("expected 6..6"))).toBe(true);
    const withOwnView = (n: number) =>
      problems((r) => {
        r.ownViewExceptions.push({ at: "2026-10-20T15:00:00Z", detail: "opened the canonical URL in a browser" });
        r.read!.engagedStrangerViews = n;
        r.read!.verdict = evaluateWebArm({ day: 56, engagedStrangerViews: n });
      });
    expect(withOwnView(5)).toEqual([]);
    expect(withOwnView(6)).toEqual([]);
    expect(withOwnView(4).some((x) => x.includes("expected 5..6"))).toBe(true);
  });

  it("requires what D0 and a count stand on", () => {
    expect(problems((r) => (r.d0.publicDeploy.evidence = null))).toContain(
      "d0.publicDeploy has a time but no evidence",
    );
    expect(problems((r) => (r.d0.discoverySubmission.route = null))).toContain(
      "d0.discoverySubmission has a time but no route",
    );
    expect(problems((r) => (r.canonicalUrl = null))).toContain("a count is recorded with no canonicalUrl");
    expect(problems((r) => (r.foreignShapedEventsExcluded = null))).toContain(
      "a count is recorded with no foreignShapedEventsExcluded",
    );
    expect(problems((r) => r.dailyCountedEvents.push({ date: "2026-10-05", count: 1 }))).toContain(
      "dailyCountedEvents repeats a date",
    );
    expect(problems((r) => (r.dailyCountedEvents[0].count = -1))).toContain(
      "dailyCountedEvents[0].count is not a count: -1",
    );
  });

  it("takes only UTC timestamps and real dates", () => {
    const local = "2026-10-02T11:00:00+03:00";
    const timestamped: [string, (r: WebArmReadings) => void][] = [
      ["d0.publicDeploy.at", (r) => (r.d0.publicDeploy.at = local)],
      ["d0.discoverySubmission.at", (r) => (r.d0.discoverySubmission.at = local)],
      ["routesOpened[0].openedAt", (r) => (r.routesOpened[0].openedAt = local)],
      ["ownViewExceptions[0].at", (r) => r.ownViewExceptions.push({ at: local, detail: "x" })],
      ["instrumentFaults[0].at", (r) => r.instrumentFaults.push({ at: local, detail: "x", fixedAt: null })],
      [
        "instrumentFaults[0].fixedAt",
        (r) => r.instrumentFaults.push({ at: "2026-10-02T09:00:00Z", detail: "x", fixedAt: local }),
      ],
      ["read.readAt", (r) => (r.read!.readAt = local)],
    ];
    for (const [label, edit] of timestamped) {
      expect(problems(edit)).toEqual([`${label} is not an ISO 8601 UTC timestamp: ${local}`]);
    }
    expect(problems((r) => (r.d0.date = "2026-10-2"))).toEqual(["d0.date is not a UTC date: 2026-10-2"]);
    expect(problems((r) => (r.dailyCountedEvents[0].date = "2026-02-30"))).toEqual([
      "dailyCountedEvents[0].date is not a UTC date: 2026-02-30",
    ]);
  });
});
