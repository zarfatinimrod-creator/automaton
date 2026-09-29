import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it, expect } from "vitest";
import {
  PAGE_VIEW_GATES,
  QUERY_ROW_LIMIT,
  classifyPath,
  completedWeeks,
  countWeek,
  evaluatePageViewGates,
  hasConsecutiveWrites,
  lineForPage,
  pageViewQuery,
  weekWindow,
  type HogQLQueryResponse,
  type SitePage,
  type WeeklyReading,
} from "../../revenue/page-views.js";

// The fixtures are shaped like PostHog's documented query response — `results` ("an array of result arrays"),
// `columns`, `types`, `hogql`, `clickhouse` — from contents/docs/sql/index.mdx (HogQLQueryResponse and its response
// example), read through Context7 (/posthog/posthog.com) on 29.9.2026. The rows are invented; the shape is not.
const fixture = (name: string): HogQLQueryResponse =>
  JSON.parse(readFileSync(join(__dirname, "fixtures", name), "utf8")) as HogQLQueryResponse;

// The site as the reader sees it today: net-salary.html is withheld (tax-2026.json is unverified) and ships as a
// noindex notice; 404.html carries noindex in its source.
const PAGES: SitePage[] = [
  { page: "404.html", noindex: true },
  { page: "accessibility.html", noindex: false },
  { page: "index.html", noindex: false },
  { page: "net-salary.html", noindex: true },
  { page: "pcn874.html", noindex: false },
  { page: "vat.html", noindex: false },
];

describe("classifyPath — which views count, and for which line", () => {
  it("counts pcn874.html for the pcn874 line and every other published page for il-biz-tools", () => {
    expect(lineForPage("pcn874.html")).toBe("pcn874");
    expect(lineForPage("vat.html")).toBe("il-biz-tools");
    expect(classifyPath("/pcn874.html", PAGES)).toEqual({ counted: true, page: "pcn874.html", lineId: "pcn874" });
    expect(classifyPath("/vat.html", PAGES)).toEqual({ counted: true, page: "vat.html", lineId: "il-biz-tools" });
  });

  it("reads the home page and Netlify's pretty URLs as the same page", () => {
    for (const p of ["/", "/index.html", "/index"]) expect(classifyPath(p, PAGES)).toMatchObject({ counted: true, page: "index.html" });
    expect(classifyPath("/pcn874", PAGES)).toMatchObject({ counted: true, page: "pcn874.html", lineId: "pcn874" });
  });

  it("never counts /preview/ — the path every colony- and owner-facing link uses", () => {
    expect(classifyPath("/preview/vat.html", PAGES)).toEqual({ counted: false, reason: "preview" });
    expect(classifyPath("/preview/pcn874.html", PAGES)).toEqual({ counted: false, reason: "preview" });
    expect(classifyPath("/preview", PAGES)).toEqual({ counted: false, reason: "preview" });
  });

  it("never counts a noindex page: the 404 page and a withheld page's notice", () => {
    expect(classifyPath("/404.html", PAGES)).toEqual({ counted: false, reason: "noindex" });
    expect(classifyPath("/net-salary.html", PAGES)).toEqual({ counted: false, reason: "noindex" });
    expect(classifyPath("/net-salary", PAGES)).toEqual({ counted: false, reason: "noindex" });
  });

  it("does not count a path that is not a page the site serves", () => {
    for (const p of ["/no-such-page", "/assets/common.js", "/src/config/site.json", "/VAT.html", "vat.html", "", null, undefined, 3]) {
      expect(classifyPath(p, PAGES)).toEqual({ counted: false, reason: "not-a-site-page" });
    }
  });
});

describe("weeks — seven days from the clock's anchor day, read after a lag", () => {
  it("week 1 is the anchor day and the six after it, in UTC", () => {
    expect(weekWindow("2026-10-05", 1)).toEqual({ week: 1, start: "2026-10-05T00:00:00.000Z", end: "2026-10-12T00:00:00.000Z" });
    expect(weekWindow("2026-10-05", 8).end).toBe("2026-11-30T00:00:00.000Z");
  });

  it("a week is read only once it has ended and six hours have passed", () => {
    expect(completedWeeks("2026-10-05", "2026-10-12T05:59:59.000Z")).toEqual([]);
    expect(completedWeeks("2026-10-05", "2026-10-12T06:00:00.000Z").map((w) => w.week)).toEqual([1]);
    expect(completedWeeks("2026-10-05", "2026-11-30T12:00:00.000Z").map((w) => w.week)).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
    expect(completedWeeks("2026-10-05", "2026-10-01T00:00:00.000Z")).toEqual([]);
  });

  it("refuses a day that is not a UTC calendar day", () => {
    expect(() => weekWindow("2026-02-30", 1)).toThrow(/calendar day/);
    expect(() => weekWindow("5.10.2026", 1)).toThrow(/calendar day/);
    expect(() => weekWindow("2026-10-05", 0)).toThrow(RangeError);
  });
});

describe("pageViewQuery — one week, one host, UTC literals, its own LIMIT", () => {
  it("counts $pageview per path on the canonical host inside the week, with the timezone stated", () => {
    const q = pageViewQuery("il-biz-tools.netlify.app", weekWindow("2026-10-05", 1));
    expect(q.kind).toBe("HogQLQuery");
    expect(q.query).toContain("event = '$pageview'");
    expect(q.query).toContain("properties.$host = 'il-biz-tools.netlify.app'");
    expect(q.query).toContain("timestamp >= toDateTime('2026-10-05 00:00:00', 'UTC')");
    expect(q.query).toContain("timestamp < toDateTime('2026-10-12 00:00:00', 'UTC')");
    expect(q.query).toContain("GROUP BY pathname");
    // PostHog's default is LIMIT 100 (docs/data-warehouse/sql); the query states its own.
    expect(q.query).toMatch(new RegExp(`LIMIT ${QUERY_ROW_LIMIT}$`));
  });

  it("refuses a host that is not a plain hostname, so nothing is interpolated into the query unchecked", () => {
    for (const bad of ["il-biz-tools.netlify.app' OR 1=1 --", "https://il-biz-tools.netlify.app", "localhost", "", "IL.example.com"]) {
      expect(() => pageViewQuery(bad, weekWindow("2026-10-05", 1)), bad).toThrow(/hostname/);
    }
  });
});

describe("countWeek — a query response → page views per line", () => {
  const w1 = weekWindow("2026-10-05", 1);

  it("splits the documented response shape into the two lines and lists what it excluded", () => {
    const c = countWeek(fixture("posthog-hogql-pageviews.json"), w1, PAGES);
    // il-biz-tools: / 3 + /accessibility.html 1 + /vat.html 6; pcn874: /pcn874 1 + /pcn874.html 4.
    expect(c.views).toEqual({ "il-biz-tools": 10, pcn874: 5 });
    expect(c.byPage).toEqual({ "index.html": 3, "accessibility.html": 1, "vat.html": 6, "pcn874.html": 5 });
    expect(c.excluded).toEqual({ preview: 12, noindex: 3, "not-a-site-page": 1 });
    expect(c.week).toBe(1);
  });

  it("reads a response with no rows as a real zero: the query ran and nothing matched", () => {
    const c = countWeek(fixture("posthog-hogql-empty.json"), w1, PAGES);
    expect(c.views).toEqual({ "il-biz-tools": 0, pcn874: 0 });
  });

  it("refuses what it cannot read instead of calling it zero", () => {
    const ok = fixture("posthog-hogql-pageviews.json");
    expect(() => countWeek({ error: "boom" } as HogQLQueryResponse, w1, PAGES)).toThrow(/error/);
    expect(() => countWeek({ ...ok, columns: ["path", "count()"] }, w1, PAGES)).toThrow(/columns/);
    expect(() => countWeek({ ...ok, results: [["/vat.html", -1]] }, w1, PAGES)).toThrow(/count/);
    expect(() => countWeek({ ...ok, results: [["/vat.html", 1.5]] }, w1, PAGES)).toThrow(/count/);
    expect(() => countWeek({ ...ok, hasMore: true }, w1, PAGES)).toThrow(/cut short/);
    const full = Array.from({ length: QUERY_ROW_LIMIT }, (_, i) => [`/p${i}`, 1]);
    expect(() => countWeek({ ...ok, results: full }, w1, PAGES)).toThrow(/cut short/);
  });

  it("accepts a count PostHog serialises as a numeric string", () => {
    const c = countWeek({ columns: ["pathname", "views"], results: [["/vat.html", "12"]] }, w1, PAGES);
    expect(c.views["il-biz-tools"]).toBe(12);
  });
});

describe("evaluatePageViewGates — the ruling's gates on the weekly readings", () => {
  const D0 = "2026-10-05";
  const netlify = { d0: D0, domainDeployDay: null };
  const at = (day: number): string => new Date(Date.parse(`${D0}T00:00:00Z`) + day * 86_400_000 + 12 * 3_600_000).toISOString();
  const weeks = (...views: number[]): WeeklyReading[] => views.map((v, i) => ({ week: i + 1, views: v }));

  it("runs nothing without a D0", () => {
    const r = evaluatePageViewGates("il-biz-tools", { d0: null, domainDeployDay: null }, [], at(60));
    expect(r.verdict).toBe("no_clock");
    expect(r.period).toBeNull();
  });

  it("does not start before its anchor day", () => {
    expect(evaluatePageViewGates("il-biz-tools", netlify, [], at(-3)).verdict).toBe("not_started");
  });

  it("reads no gate until two consecutive weekly writes exist (CHANNEL_LOOP §2 'Instrumented')", () => {
    expect(hasConsecutiveWrites([1, 3])).toBe(false);
    expect(hasConsecutiveWrites([2, 3])).toBe(true);
    const r = evaluatePageViewGates("il-biz-tools", netlify, weeks(0), at(10));
    expect(r.verdict).toBe("uninstrumented");
    expect(r.instrumented).toBe(false);
    // Even past day 56, one lonely zero is never a pause.
    expect(evaluatePageViewGates("il-biz-tools", netlify, [{ week: 1, views: 0 }, { week: 3, views: 0 }], at(60)).verdict).toBe("instrument_fault");
  });

  it("M-instrument: no two consecutive writes by D0+21 is an instrument fault, never a fail", () => {
    const r = evaluatePageViewGates("il-biz-tools", netlify, weeks(0), at(PAGE_VIEW_GATES.instrumentByDay));
    expect(r.verdict).toBe("instrument_fault");
    expect(r.notes.join(" ")).toMatch(/never a fail/);
    expect(evaluatePageViewGates("il-biz-tools", netlify, weeks(0, 0), at(21)).verdict).toBe("measuring");
  });

  it("M-reach at D0+56: under 5 page views over weeks 1-8 → pause", () => {
    const r = evaluatePageViewGates("il-biz-tools", netlify, weeks(0, 1, 0, 0, 2, 0, 1, 0), at(56));
    expect(r.verdict).toBe("pause");
    expect(r.notes[0]).toMatch(/4 page views in total/);
    // A day early it is not due.
    expect(evaluatePageViewGates("il-biz-tools", netlify, weeks(0, 1, 0, 0, 2, 0, 1), at(55)).verdict).toBe("measuring");
  });

  it("M-reach at D0+56: 100 a week or more over weeks 5-8 → pass", () => {
    const r = evaluatePageViewGates("pcn874", netlify, weeks(0, 0, 10, 40, 90, 100, 110, 100), at(56));
    expect(r.verdict).toBe("pass");
    expect(evaluatePageViewGates("pcn874", netlify, weeks(0, 0, 10, 40, 90, 100, 110, 99), at(56)).verdict).toBe("extend");
  });

  it("M-reach between the two → one extension, re-read over weeks 9-16 at D0+112, and no second", () => {
    const eight = [1, 2, 3, 4, 5, 6, 7, 8];
    expect(evaluatePageViewGates("il-biz-tools", netlify, weeks(...eight), at(56)).verdict).toBe("extend");
    expect(evaluatePageViewGates("il-biz-tools", netlify, weeks(...eight, 9, 9), at(100)).verdict).toBe("extend");
    expect(evaluatePageViewGates("il-biz-tools", netlify, weeks(...eight, 1, 0, 0, 0, 1, 0, 1, 1), at(112)).verdict).toBe("pause");
    expect(evaluatePageViewGates("il-biz-tools", netlify, weeks(...eight, 50, 60, 70, 80, 100, 120, 100, 100), at(112)).verdict).toBe("pass");
    const between = evaluatePageViewGates("il-biz-tools", netlify, weeks(...eight, ...eight), at(112));
    expect(between.verdict).toBe("extension_exhausted");
    expect(between.notes.join(" ")).toMatch(/no second extension/);
  });

  it("a due read with a missing week is an instrument fault — the missing week is never read as zero", () => {
    const gap = weeks(0, 0, 0, 0, 0, 0, 0, 0).filter((w) => w.week !== 6);
    const r = evaluatePageViewGates("il-biz-tools", netlify, gap, at(56));
    expect(r.verdict).toBe("instrument_fault");
    expect(r.notes[0]).toMatch(/week\(s\) 6 of 1-8/);
  });

  it("the domain period: under 100 a week for 8 consecutive measured weeks → kill (PUBLISH-10: its clock starts at the domain deploy)", () => {
    const domain = { d0: D0, domainDeployDay: "2027-01-04" };
    const atDomain = (day: number): string => new Date(Date.parse("2027-01-04T00:00:00Z") + day * 86_400_000).toISOString();
    const r = evaluatePageViewGates("il-biz-tools", domain, weeks(99, 50, 0, 10, 20, 30, 40, 99), atDomain(60));
    expect(r.period).toBe("domain");
    expect(r.anchorDay).toBe("2027-01-04");
    expect(r.verdict).toBe("kill");
    expect(evaluatePageViewGates("il-biz-tools", domain, weeks(99, 50, 0, 10, 100, 30, 40, 99), atDomain(60)).verdict).toBe("continue");
    // A missing week breaks the run: unmeasured is not "under 100".
    const gap = weeks(1, 1, 1, 1, 1, 1, 1, 1, 1).filter((w) => w.week !== 5);
    expect(evaluatePageViewGates("pcn874", domain, gap, atDomain(70)).verdict).toBe("continue");
    // The netlify.app period never reaches the 8-week kill, however low the views.
    expect(evaluatePageViewGates("pcn874", netlify, weeks(1, 1, 1, 1, 1, 1, 1, 1), at(56)).verdict).toBe("extend");
  });
});
