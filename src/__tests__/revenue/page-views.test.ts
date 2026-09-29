import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it, expect } from "vitest";
import {
  DAY_MS,
  OTHER_BUCKET,
  PAGE_VIEW_GATES,
  PREVIEW_BUCKET,
  QUERY_ROW_LIMIT,
  READ_GRACE_MS,
  READ_LAG_MS,
  classifyPath,
  completedWeeks,
  countWeek,
  endWeekOfDay,
  evaluatePageViewGates,
  hasConsecutiveWrites,
  lineForPage,
  pageViewQuery,
  sitePaths,
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

describe("pageViewQuery — one week, one host, UTC literals, bucketed paths, its own LIMIT", () => {
  it("counts $pageview on the canonical host inside the week, with the timezone stated", () => {
    const q = pageViewQuery("il-biz-tools.netlify.app", weekWindow("2026-10-05", 1), PAGES);
    expect(q.kind).toBe("HogQLQuery");
    expect(q.query).toContain("event = '$pageview'");
    expect(q.query).toContain("properties.$host = 'il-biz-tools.netlify.app'");
    expect(q.query).toContain("timestamp >= toDateTime('2026-10-05 00:00:00', 'UTC')");
    expect(q.query).toContain("timestamp < toDateTime('2026-10-12 00:00:00', 'UTC')");
    expect(q.query).toContain("GROUP BY pathname");
    // PostHog's default is LIMIT 100 (docs/data-warehouse/sql); the query states its own.
    expect(q.query).toMatch(new RegExp(`LIMIT ${QUERY_ROW_LIMIT}$`));
  });

  it("buckets paths inside the query: /preview/… into one row, site pages as themselves, everything else into (other)", () => {
    const q = pageViewQuery("il-biz-tools.netlify.app", weekWindow("2026-10-05", 1), PAGES);
    expect(q.query).toContain(`properties.$pathname = '/preview' OR properties.$pathname LIKE '/preview/%', '${PREVIEW_BUCKET}'`);
    expect(q.query).toContain("properties.$pathname IN ('/404', '/404.html', '/accessibility', '/accessibility.html', '/', '/index', '/index.html',");
    expect(q.query).toContain(`'${OTHER_BUCKET}') AS pathname`);
    // However many invented paths are sent, the answer has at most one row per site path plus the two buckets.
    expect(sitePaths(PAGES).length + 2).toBeLessThan(QUERY_ROW_LIMIT);
  });

  it("every bucket the query can return classifies back to the right page, or to the right exclusion", () => {
    for (const path of sitePaths(PAGES)) {
      const page = path === "/" || path.startsWith("/index") ? "index.html" : `${path.slice(1).replace(/\.html$/, "")}.html`;
      const known = PAGES.find((p) => p.page === page)!;
      expect(classifyPath(path, PAGES), path).toEqual(
        known.noindex ? { counted: false, reason: "noindex" } : { counted: true, page, lineId: lineForPage(page) },
      );
    }
    expect(sitePaths(PAGES)).toHaveLength(2 * PAGES.length + 1); // "/" as well as "/index" and "/index.html"
    expect(classifyPath(PREVIEW_BUCKET, PAGES)).toEqual({ counted: false, reason: "preview" });
    expect(classifyPath(OTHER_BUCKET, PAGES)).toEqual({ counted: false, reason: "not-a-site-page" });
  });

  it("never interpolates a page name that is not a plain lowercase name", () => {
    const hostile: SitePage[] = [...PAGES, { page: "x') OR 1=1 --.html", noindex: false }, { page: "Upper.html", noindex: false }];
    const q = pageViewQuery("il-biz-tools.netlify.app", weekWindow("2026-10-05", 1), hostile);
    expect(q.query).not.toContain("OR 1=1");
    expect(q.query).not.toContain("Upper");
    // No site pages at all still makes a valid query: every path lands in a bucket.
    expect(pageViewQuery("il-biz-tools.netlify.app", weekWindow("2026-10-05", 1), []).query).not.toContain(" IN (");
  });

  it("refuses a host that is not a plain hostname, so nothing is interpolated into the query unchecked", () => {
    for (const bad of ["il-biz-tools.netlify.app' OR 1=1 --", "https://il-biz-tools.netlify.app", "localhost", "", "IL.example.com"]) {
      expect(() => pageViewQuery(bad, weekWindow("2026-10-05", 1), PAGES), bad).toThrow(/hostname/);
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
  const D0_MS = Date.parse(`${D0}T00:00:00Z`);
  const netlify = { d0: D0, domainDeployDay: null };
  const HOUR = 3_600_000;
  const at = (day: number, plusMs = 12 * HOUR): string => new Date(D0_MS + day * DAY_MS + plusMs).toISOString();
  /** Readings for weeks 1.. written on time: each at its end plus the lag (the first tick that may read it). */
  const onTime = (week: number): string => new Date(D0_MS + week * 7 * DAY_MS + READ_LAG_MS).toISOString();
  const weeks = (...views: number[]): WeeklyReading[] => views.map((v, i) => ({ week: i + 1, views: v, writtenAt: onTime(i + 1) }));
  const eight = [1, 2, 3, 4, 5, 6, 7, 8];

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
    const gappy = [{ week: 1, views: 0, writtenAt: onTime(1) }, { week: 3, views: 0, writtenAt: onTime(3) }];
    expect(evaluatePageViewGates("il-biz-tools", netlify, gappy, at(60)).verdict).toBe("instrument_fault");
  });

  it("M-instrument: no two consecutive writes by D0+21 is an instrument fault, never a fail", () => {
    const r = evaluatePageViewGates("il-biz-tools", netlify, weeks(0), at(PAGE_VIEW_GATES.instrumentByDay, 0));
    expect(r.verdict).toBe("instrument_fault");
    expect(r.notes.join(" ")).toMatch(/never a fail/);
    expect(evaluatePageViewGates("il-biz-tools", netlify, weeks(0), at(20, 23 * HOUR)).verdict).toBe("uninstrumented");
    expect(evaluatePageViewGates("il-biz-tools", netlify, weeks(0, 0), at(21)).verdict).toBe("measuring");
  });

  it("M-instrument is judged on when the rows were written: a late backfill does not wipe the fault", () => {
    // Day 21, nothing written: the fault.
    expect(evaluatePageViewGates("il-biz-tools", netlify, [], at(21)).verdict).toBe("instrument_fault");
    // A key added on day 30 reads weeks 1-4 in one tick. They were not written by day 21, so the fault stands.
    const day30 = at(30, 0);
    const late = [1, 2, 3, 4].map((week) => ({ week, views: 3, writtenAt: day30 }));
    const r = evaluatePageViewGates("il-biz-tools", netlify, late, at(30, HOUR));
    expect(r.verdict).toBe("instrument_fault");
    expect(r.instrumented).toBe(false);
    expect(r.notes.join(" ")).toMatch(/weeks written by then: none.*restart the clock.*written later does not undo it/);
    // Written on day 20 (inside the deadline) counts, whichever weeks it covers.
    const day20 = at(20, 0);
    expect(evaluatePageViewGates("il-biz-tools", netlify, [1, 2].map((week) => ({ week, views: 0, writtenAt: day20 })), at(21)).verdict).toBe("measuring");
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

  it("the day-56 read waits for week 8's reading: no fault at the stroke of day 56, and none inside the grace", () => {
    const seven = weeks(0, 0, 0, 0, 0, 0, 0);
    // The first hourly tick of day 56 (00:17): week 8 has ended but is not readable for another 6 hours.
    const r = evaluatePageViewGates("il-biz-tools", netlify, seven, at(56, 17 * 60_000));
    expect(r.verdict).toBe("measuring");
    expect(r.notes[0]).toMatch(/due on day 56, once week 8 is read/);
    // Readable, not read yet, inside the grace: still waiting.
    const waiting = evaluatePageViewGates("il-biz-tools", netlify, seven, at(56, READ_LAG_MS + READ_GRACE_MS - 60_000));
    expect(waiting.verdict).toBe("measuring");
    expect(waiting.notes[0]).toMatch(/waits for week\(s\) 8/);
    // Past the lag and the grace with week 8 still missing: the reader is down.
    const fault = evaluatePageViewGates("il-biz-tools", netlify, seven, at(56, READ_LAG_MS + READ_GRACE_MS + 60_000));
    expect(fault.verdict).toBe("instrument_fault");
    expect(fault.notes[0]).toMatch(/week\(s\) 8 still have no reading/);
    // With week 8 in, the read is made.
    expect(evaluatePageViewGates("il-biz-tools", netlify, weeks(0, 0, 0, 0, 0, 0, 0, 0), at(56, READ_LAG_MS + 60_000)).verdict).toBe("pause");
  });

  it("M-reach between the two → one extension, re-read over weeks 9-16 at D0+112, and no second", () => {
    expect(evaluatePageViewGates("il-biz-tools", netlify, weeks(...eight), at(56)).verdict).toBe("extend");
    expect(evaluatePageViewGates("il-biz-tools", netlify, weeks(...eight, 9, 9), at(70)).verdict).toBe("extend");
    // Day 111: the second read is not due yet, whatever weeks 9-15 say.
    expect(evaluatePageViewGates("il-biz-tools", netlify, weeks(...eight, 1, 0, 0, 0, 1, 0, 1), at(111)).verdict).toBe("extend");
    // Day 112, 17 minutes in: week 16 is not readable yet — still the extension, not a fault.
    expect(evaluatePageViewGates("il-biz-tools", netlify, weeks(...eight, 1, 0, 0, 0, 1, 0, 1), at(112, 17 * 60_000)).verdict).toBe("extend");
    expect(evaluatePageViewGates("il-biz-tools", netlify, weeks(...eight, 1, 0, 0, 0, 1, 0, 1, 1), at(112)).verdict).toBe("pause");
    expect(evaluatePageViewGates("il-biz-tools", netlify, weeks(...eight, 50, 60, 70, 80, 100, 120, 100, 100), at(112)).verdict).toBe("pass");
    const between = evaluatePageViewGates("il-biz-tools", netlify, weeks(...eight, ...eight), at(112));
    expect(between.verdict).toBe("extension_exhausted");
    expect(between.notes.join(" ")).toMatch(/no second extension/);
    // Week 16 missing past the grace: the second read cannot be made.
    const noSixteen = evaluatePageViewGates("il-biz-tools", netlify, weeks(...eight, 1, 1, 1, 1, 1, 1, 1), at(113, 8 * HOUR));
    expect(noSixteen.verdict).toBe("instrument_fault");
    expect(noSixteen.notes.join(" ")).toMatch(/day-112 read over weeks 9-16 cannot be made: week\(s\) 16/);
  });

  it("a read must end on a whole week from the anchor", () => {
    expect(endWeekOfDay(56)).toBe(8);
    expect(endWeekOfDay(112)).toBe(16);
    expect(() => endWeekOfDay(111)).toThrow(RangeError);
  });

  it("a missing week that is overdue is an instrument fault — never read as zero — and clears when it is read", () => {
    const gap = weeks(0, 0, 0, 0, 0, 0, 0, 0).filter((w) => w.week !== 6);
    const r = evaluatePageViewGates("il-biz-tools", netlify, gap, at(56));
    expect(r.verdict).toBe("instrument_fault");
    expect(r.notes[0]).toMatch(/week\(s\) 6 still have no reading/);
    // Between the second write and day 56: weeks 1-2 written, then nothing — a fault a day after week 3 was readable.
    expect(evaluatePageViewGates("il-biz-tools", netlify, weeks(5, 5), at(21, READ_LAG_MS + READ_GRACE_MS - 60_000)).verdict).toBe("measuring");
    const stopped = evaluatePageViewGates("il-biz-tools", netlify, weeks(5, 5), at(30));
    expect(stopped.verdict).toBe("instrument_fault");
    expect(stopped.notes[0]).toMatch(/week\(s\) 3, 4 still have no reading/);
    // The reader comes back and reads weeks 3-4 late: PostHog kept the events, so the measurement is whole again.
    const backfilled = [...weeks(5, 5), { week: 3, views: 5, writtenAt: at(30) }, { week: 4, views: 5, writtenAt: at(30) }];
    expect(evaluatePageViewGates("il-biz-tools", netlify, backfilled, at(30, 13 * HOUR)).verdict).toBe("measuring");
  });

  it("after a final netlify-period verdict a later gap is a note, not a fault", () => {
    const r = evaluatePageViewGates("pcn874", netlify, weeks(0, 0, 10, 40, 90, 100, 110, 100), at(70));
    expect(r.verdict).toBe("pass");
    expect(r.notes.join(" ")).toMatch(/after the final read no gate of this period waits on later weeks, but week\(s\) 9 /);
  });

  describe("the domain period (PUBLISH-10: its clock starts at the domain deploy)", () => {
    const DOMAIN = "2027-01-04";
    const domain = { d0: D0, domainDeployDay: DOMAIN };
    const DOMAIN_MS = Date.parse(`${DOMAIN}T00:00:00Z`);
    const atDomain = (day: number): string => new Date(DOMAIN_MS + day * DAY_MS + 12 * HOUR).toISOString();
    const dWeeks = (...views: number[]): WeeklyReading[] =>
      views.map((v, i) => ({ week: i + 1, views: v, writtenAt: new Date(DOMAIN_MS + (i + 1) * 7 * DAY_MS + READ_LAG_MS).toISOString() }));

    it("under 100 a week for 8 consecutive measured weeks → kill", () => {
      const r = evaluatePageViewGates("il-biz-tools", domain, dWeeks(99, 50, 0, 10, 20, 30, 40, 99), atDomain(57));
      expect(r.period).toBe("domain");
      expect(r.anchorDay).toBe(DOMAIN);
      expect(r.verdict).toBe("kill");
      expect(evaluatePageViewGates("il-biz-tools", domain, dWeeks(99, 50, 0, 10, 100, 30, 40, 99), atDomain(57)).verdict).toBe("continue");
    });

    it("a missing week is never 'under 100': it breaks the run, and once overdue it is an instrument fault", () => {
      const gap = dWeeks(1, 1, 1, 1, 1, 1, 1, 1, 1).filter((w) => w.week !== 5);
      const r = evaluatePageViewGates("pcn874", domain, gap, atDomain(64));
      expect(r.verdict).toBe("instrument_fault");
      expect(r.notes[0]).toMatch(/week\(s\) 5 still have no reading/);
      // Read late, the run is whole and measured: now it is a kill.
      const whole = [...gap, { week: 5, views: 1, writtenAt: atDomain(64) }];
      expect(evaluatePageViewGates("pcn874", domain, whole, atDomain(64)).verdict).toBe("kill");
    });

    it("a reader that stops after instrumentation cannot hide the kill: weeks 1-2, then nothing, by day 200 is a fault", () => {
      const r = evaluatePageViewGates("il-biz-tools", domain, dWeeks(3, 3), atDomain(200));
      expect(r.verdict).toBe("instrument_fault");
      expect(r.notes[0]).toMatch(/week\(s\) 3, 4, 5/);
      expect(evaluatePageViewGates("il-biz-tools", domain, dWeeks(3, 3), atDomain(15)).verdict).toBe("continue");
    });

    it("the netlify.app period never reaches the 8-week kill, however low the views", () => {
      expect(evaluatePageViewGates("pcn874", netlify, weeks(1, 1, 1, 1, 1, 1, 1, 1), at(56)).verdict).toBe("extend");
    });
  });
});
