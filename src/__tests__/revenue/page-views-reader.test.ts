import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import type BetterSqlite3 from "better-sqlite3";
import { createInMemoryDb } from "../orchestration/test-db.js";
import { seedDefaultPortfolio } from "../../revenue/portfolio.js";
import { PAGE_VIEW_KPI, QUERY_API_PRICED, maskPricedBody, type QueryApiFiring } from "../../revenue/page-views.js";
import { recordKpi } from "../../revenue/ledger.js";
import {
  MAX_WEEKS_PER_READ,
  evaluatePageViewLines,
  pageViewSeries,
  pageViewUnit,
  parsePageViewUnit,
  readPageViewClock,
  readPageViews,
  serializePageViewClock,
  sitePages,
  withQueryApiFiring,
} from "../../revenue/page-views-reader.js";
import { describePageViewGate, renderReport, tick } from "../../revenue/runner.js";

// Fixtures shaped like PostHog's documented query response (contents/docs/sql/index.mdx, via Context7
// /posthog/posthog.com, 29.9.2026). No test here reaches PostHog: every request goes to a fake fetch.
const fixtureText = (name: string): string => readFileSync(join(__dirname, "fixtures", name), "utf8");

const KEY = "phx_test_key_never_real_0123456789";
const ENV = { POSTHOG_READ_KEY: KEY, POSTHOG_PROJECT_ID: "12345" };
const D0 = "2026-10-05";

interface Call {
  url: string;
  init: RequestInit;
}

function fakeFetch(respond: (call: Call, n: number) => Response): { fetchImpl: typeof fetch; calls: Call[] } {
  const calls: Call[] = [];
  const fetchImpl = (async (url: string | URL, init: RequestInit = {}) => {
    const call = { url: String(url), init };
    calls.push(call);
    return respond(call, calls.length);
  }) as typeof fetch;
  return { fetchImpl, calls };
}

const ok = (name = "posthog-hogql-pageviews.json"): Response =>
  new Response(fixtureText(name), { status: 200, headers: { "content-type": "application/json" } });

/** A small site with the same shape as products/il-biz-tools: pages, site.json, and a publish gate. */
function makeSite(dir: string, posthog: Record<string, unknown> = {}, siteUrl = "https://il-biz-tools.netlify.app"): void {
  mkdirSync(join(dir, "src", "config"), { recursive: true });
  mkdirSync(join(dir, "src", "lib"), { recursive: true });
  writeFileSync(
    join(dir, "src", "config", "site.json"),
    JSON.stringify({ siteUrl, posthog: { projectKey: "phc_public_project_token_0000000000", apiHost: "https://eu.i.posthog.com", projectId: "", ...posthog } }),
  );
  writeFileSync(join(dir, "src", "config", "vat.json"), JSON.stringify({ verified: true }));
  writeFileSync(join(dir, "src", "config", "tax-2026.json"), JSON.stringify({ verified: false }));
  const page = (head = "") => `<!doctype html><html><head><meta charset="utf-8">${head}<title>t</title></head><body></body></html>`;
  for (const p of ["index.html", "vat.html", "pcn874.html", "accessibility.html", "net-salary.html"]) writeFileSync(join(dir, p), page());
  writeFileSync(join(dir, "404.html"), page('<meta name="robots" content="noindex">'));
  writeFileSync(
    join(dir, "src", "lib", "publish-gate.js"),
    `export const PAGE_RATE_SOURCES = {
  'index.html': [], 'vat.html': ['src/config/vat.json'], 'pcn874.html': [], 'accessibility.html': [],
  'net-salary.html': ['src/config/tax-2026.json'], '404.html': [],
};
export function publishPlan(pages, configs, map = PAGE_RATE_SOURCES) {
  const publish = [], withhold = [];
  for (const page of pages) {
    const unverified = (map[page] ?? []).filter((p) => configs?.[p]?.verified !== true);
    if (unverified.length) withhold.push({ page, unverified }); else publish.push(page);
  }
  return { publish, withhold };
}
`,
  );
}

function writeClock(file: string, lines: Record<string, unknown>): void {
  writeFileSync(file, JSON.stringify(lines));
}

const kpiRows = (db: BetterSqlite3.Database, lineId: string) =>
  db
    .prepare("SELECT value, unit, captured_at AS capturedAt FROM revenue_kpi_snapshots WHERE line_id = ? AND kpi = ? ORDER BY captured_at")
    .all(lineId, PAGE_VIEW_KPI) as { value: number; unit: string; capturedAt: string }[];

describe("readPageViews — PostHog's query API → one KPI row per line per week", () => {
  let db: BetterSqlite3.Database;
  let dir: string;
  let siteDir: string;
  let clockFile: string;

  beforeEach(() => {
    db = createInMemoryDb();
    seedDefaultPortfolio(db);
    dir = mkdtempSync(join(tmpdir(), "page-views-"));
    siteDir = join(dir, "site");
    makeSite(siteDir);
    clockFile = join(dir, "page-view-clock.json");
    writeClock(clockFile, {
      "il-biz-tools": { d0: D0, d0Evidence: "runner 200 + clean grep (test)" },
      pcn874: { d0: D0, d0Evidence: "rides the il-biz-tools deploy (test)" },
    });
  });
  afterEach(() => {
    db.close();
    rmSync(dir, { recursive: true, force: true });
  });

  const read = (env: Record<string, string | undefined>, fetchImpl: typeof fetch, nowIso = "2026-10-19T12:00:00.000Z") =>
    readPageViews(db, { env, fetchImpl, nowIso, siteDir, clockFile });

  it("is a no-op returning 'not configured' without the read key — today's state — and calls nothing", async () => {
    const { fetchImpl, calls } = fakeFetch(() => ok());
    const r = await read({}, fetchImpl);
    expect(r.status).toBe("not_configured");
    expect(r.detail).toMatch(/POSTHOG_READ_KEY/);
    expect(r.detail).toMatch(/POSTHOG_PROJECT_ID|projectId/);
    expect(calls).toHaveLength(0);
    expect(kpiRows(db, "il-biz-tools")).toEqual([]);
  });

  it("is 'not configured' without a project id, even with the key", async () => {
    const { fetchImpl, calls } = fakeFetch(() => ok());
    const r = await read({ POSTHOG_READ_KEY: KEY }, fetchImpl);
    expect(r.status).toBe("not_configured");
    expect(r.detail).toMatch(/project id/);
    expect(r.detail).not.toContain(KEY);
    expect(calls).toHaveLength(0);
  });

  it("is 'not configured' with a project id but no key — from the variable or from site.json — and sends nothing", async () => {
    const env = fakeFetch(() => ok());
    const a = await read({ POSTHOG_PROJECT_ID: "12345" }, env.fetchImpl);
    expect(a.status).toBe("not_configured");
    expect(a.detail).toMatch(/POSTHOG_READ_KEY is not set/);
    expect(a.detail).not.toMatch(/project id/);
    expect(env.calls).toHaveLength(0);

    makeSite(siteDir, { projectId: "777" });
    const site = fakeFetch(() => ok());
    const b = await read({ POSTHOG_READ_KEY: "  " }, site.fetchImpl);
    expect(b.status).toBe("not_configured");
    expect(b.detail).toMatch(/POSTHOG_READ_KEY is not set/);
    expect(site.calls).toHaveLength(0);
    expect(kpiRows(db, "il-biz-tools")).toEqual([]);
  });

  it("reads nothing while the site's counter is off: a week of zeros nobody measured is not a reading", async () => {
    makeSite(siteDir, { projectKey: "" });
    const { fetchImpl, calls } = fakeFetch(() => ok());
    const r = await read(ENV, fetchImpl);
    expect(r.status).toBe("counter_off");
    expect(calls).toHaveLength(0);
  });

  it("reads nothing before D0 is recorded", async () => {
    rmSync(clockFile);
    const { fetchImpl, calls } = fakeFetch(() => ok());
    const r = await read(ENV, fetchImpl);
    expect(r.status).toBe("no_clock");
    expect(calls).toHaveLength(0);
  });

  it("queries each completed week once and writes one row per line per week, dated by the write", async () => {
    const { fetchImpl, calls } = fakeFetch(() => ok());
    const r = await read(ENV, fetchImpl);
    expect(r.status).toBe("recorded");
    expect(calls).toHaveLength(2); // weeks 1 and 2; one query serves both lines

    const call = calls[0]!;
    expect(call.url).toBe("https://eu.posthog.com/api/projects/12345/query/");
    expect(call.init.method).toBe("POST");
    expect((call.init.headers as Record<string, string>).Authorization).toBe(`Bearer ${KEY}`);
    const body = JSON.parse(String(call.init.body));
    expect(body.query.kind).toBe("HogQLQuery");
    expect(body.query.query).toContain("properties.$host = 'il-biz-tools.netlify.app'");
    expect(body.query.query).toContain("toDateTime('2026-10-05 00:00:00', 'UTC')");
    // The paths are bucketed inside the query, from the site's own page list.
    expect(body.query.query).toContain("'/pcn874', '/pcn874.html'");
    expect(body.query.query).toContain("LIKE '/preview/%', '/preview/'");
    expect(body.query.query).toContain("'(other)') AS pathname");

    const site = kpiRows(db, "il-biz-tools");
    const pcn = kpiRows(db, "pcn874");
    expect(site.map((k) => k.value)).toEqual([10, 10]);
    expect(pcn.map((k) => k.value)).toEqual([5, 5]);
    // Both weeks were read by this tick, and the rows say so: the week is in the unit, the write time in captured_at.
    expect(site.map((k) => k.capturedAt)).toEqual(["2026-10-19T12:00:00.000Z", "2026-10-19T12:00:00.000Z"]);
    expect(parsePageViewUnit(pcn[1]!.unit)).toEqual({ host: "il-biz-tools.netlify.app", anchorDay: D0, week: 2 });
    expect(r.recorded).toContainEqual({ lineId: "pcn874", week: 2, views: 5, anchorDay: D0 });
    // What was not counted is reported, per week: the fixture's /preview/ 12, noindex 3 (404 + net-salary), other 1.
    expect(r.weeks[0]).toMatchObject({ anchorDay: D0, week: 1, excluded: { preview: 12, noindex: 3, "not-a-site-page": 1 } });
    expect(r.weeks[0]!.byPage).toEqual({ "index.html": 3, "accessibility.html": 1, "vat.html": 6, "pcn874.html": 5 });
    expect(r.detail).toContain("w1 from 2026-10-05: il-biz-tools 10, pcn874 5 (not counted: preview 12, noindex 3, other paths 1)");
  });

  it("records each week once: a second run in the same week calls nothing, the next week calls once", async () => {
    const first = fakeFetch(() => ok());
    await read(ENV, first.fetchImpl);
    const again = fakeFetch(() => ok());
    const r = await read(ENV, again.fetchImpl, "2026-10-19T13:00:00.000Z");
    expect(r.status).toBe("up_to_date");
    expect(again.calls).toHaveLength(0);
    const next = fakeFetch(() => ok("posthog-hogql-empty.json"));
    const r3 = await read(ENV, next.fetchImpl, "2026-10-26T12:00:00.000Z");
    expect(r3.status).toBe("recorded");
    expect(next.calls).toHaveLength(1);
    // The empty answer is a real zero for week 3: the query ran and nothing matched.
    expect(pageViewSeries(db, "il-biz-tools", "il-biz-tools.netlify.app", D0)).toEqual([
      { week: 1, views: 10, writtenAt: "2026-10-19T12:00:00.000Z" },
      { week: 2, views: 10, writtenAt: "2026-10-19T12:00:00.000Z" },
      { week: 3, views: 0, writtenAt: "2026-10-26T12:00:00.000Z" },
    ]);
  });

  it("the series reads only its own host, and a week written twice keeps its first write time and its latest value", () => {
    const host = "il-biz-tools.netlify.app";
    recordKpi(db, "il-biz-tools", PAGE_VIEW_KPI, 7, pageViewUnit(host, D0, 1), "2026-10-12T06:17:00.000Z");
    recordKpi(db, "il-biz-tools", PAGE_VIEW_KPI, 999, pageViewUnit("il-biz-tools--branch.netlify.app", D0, 2), "2026-10-19T06:17:00.000Z");
    recordKpi(db, "il-biz-tools", PAGE_VIEW_KPI, 8, pageViewUnit(host, D0, 1), "2026-10-13T06:17:00.000Z");
    expect(pageViewSeries(db, "il-biz-tools", host, D0)).toEqual([{ week: 1, views: 8, writtenAt: "2026-10-12T06:17:00.000Z" }]);
  });

  it("an HTTP failure records nothing and says why, without the key", async () => {
    const { fetchImpl } = fakeFetch(() => new Response(JSON.stringify({ type: "authentication_error", detail: "Invalid personal API key." }), { status: 401 }));
    const r = await read(ENV, fetchImpl);
    expect(r.status).toBe("error");
    expect(r.detail).toMatch(/HTTP 401/);
    expect(r.detail).toMatch(/Invalid personal API key/);
    expect(r.detail).not.toContain(KEY);
    expect(kpiRows(db, "il-biz-tools")).toEqual([]);
  });

  it("a week that cannot be read stops the read; weeks read before it stay, the rest wait for the next tick", async () => {
    const { fetchImpl } = fakeFetch((_c, n) =>
      n === 1 ? ok() : new Response(JSON.stringify({ ...JSON.parse(fixtureText("posthog-hogql-pageviews.json")), hasMore: true }), { status: 200 }),
    );
    const r = await read(ENV, fetchImpl);
    expect(r.status).toBe("error");
    expect(r.detail).toMatch(/cut short/);
    expect(r.detail).toMatch(/read before it, and kept: w1 from 2026-10-05/);
    expect(kpiRows(db, "il-biz-tools").map((k) => k.value)).toEqual([10]);
  });

  it("a network error that quotes the key is reported with the key scrubbed", async () => {
    const fetchImpl = (async () => {
      throw new Error(`connect ECONNREFUSED while sending Authorization: Bearer ${KEY}`);
    }) as unknown as typeof fetch;
    const r = await read(ENV, fetchImpl);
    expect(r.status).toBe("error");
    expect(r.detail).toContain("Bearer [key]");
    expect(r.detail).not.toContain(KEY);
  });

  it("reads no line that is not seeded, even with a clock for it", async () => {
    db.prepare("DELETE FROM revenue_lines WHERE id = ?").run("pcn874");
    writeClock(clockFile, { pcn874: { d0: D0, d0Evidence: "test" } });
    const { fetchImpl, calls } = fakeFetch(() => ok());
    const r = await read(ENV, fetchImpl);
    expect(r.status).toBe("no_clock");
    expect(calls).toHaveLength(0);
    expect(kpiRows(db, "pcn874")).toEqual([]);
  });

  it(`reads at most ${MAX_WEEKS_PER_READ} weeks in one call and leaves the rest for the next tick`, async () => {
    const { fetchImpl, calls } = fakeFetch(() => ok("posthog-hogql-empty.json"));
    // D0 + 25 weeks + a day: 25 completed weeks under one anchor.
    const r = await read(ENV, fetchImpl, "2027-03-30T12:00:00.000Z");
    expect(calls).toHaveLength(MAX_WEEKS_PER_READ);
    expect(r.status).toBe("recorded");
    expect(r.detail).toMatch(/5 week\(s\) left for the next tick/);
    expect(kpiRows(db, "il-biz-tools")).toHaveLength(MAX_WEEKS_PER_READ);
  });

  it("takes the project id from site.json when the environment has none, and refuses one that is not numeric", async () => {
    makeSite(siteDir, { projectId: "777" });
    const a = fakeFetch(() => ok());
    await read({ POSTHOG_READ_KEY: KEY }, a.fetchImpl);
    expect(a.calls[0]!.url).toBe("https://eu.posthog.com/api/projects/777/query/");

    const b = fakeFetch(() => ok());
    const r = await read({ POSTHOG_READ_KEY: KEY, POSTHOG_PROJECT_ID: "12345/../../evil" }, b.fetchImpl, "2026-10-26T12:00:00.000Z");
    expect(r.status).toBe("error");
    expect(r.detail).toMatch(/project id/);
    expect(b.calls).toHaveLength(0);
  });

  it("sends the key only to PostHog's own cloud query hosts", async () => {
    makeSite(siteDir, { apiHost: "https://posthog.example.com" });
    const { fetchImpl, calls } = fakeFetch(() => ok());
    const r = await read(ENV, fetchImpl);
    expect(r.status).toBe("error");
    expect(r.detail).toMatch(/apiHost/);
    expect(calls).toHaveLength(0);

    makeSite(siteDir, { apiHost: "https://us.i.posthog.com" });
    const us = fakeFetch(() => ok());
    await read(ENV, us.fetchImpl);
    expect(us.calls[0]!.url).toBe("https://us.posthog.com/api/projects/12345/query/");
  });

  it("a restarted clock is a new series: rows under the old D0 are not read under the new one", async () => {
    await read(ENV, fakeFetch(() => ok()).fetchImpl);
    writeClock(clockFile, {
      "il-biz-tools": { d0: "2026-10-19", d0Evidence: "instrument fixed, clock restarted (test)" },
      pcn874: { d0: D0, d0Evidence: "test" },
    });
    expect(pageViewSeries(db, "il-biz-tools", "il-biz-tools.netlify.app", "2026-10-19")).toEqual([]);
    const { fetchImpl, calls } = fakeFetch(() => ok("posthog-hogql-empty.json"));
    await read(ENV, fetchImpl, "2026-10-26T12:00:00.000Z");
    // One query per anchor: week 1 of the restarted il-biz-tools clock, week 3 of pcn874's.
    expect(calls).toHaveLength(2);
    expect(pageViewSeries(db, "il-biz-tools", "il-biz-tools.netlify.app", "2026-10-19")).toEqual([
      { week: 1, views: 0, writtenAt: "2026-10-26T12:00:00.000Z" },
    ]);
    expect(pageViewSeries(db, "pcn874", "il-biz-tools.netlify.app", D0).map((w) => w.week)).toEqual([1, 2, 3]);
  });
});

describe("sitePages — the real il-biz-tools tree", () => {
  it("counts published pages and marks the 404 page and a withheld page noindex", async () => {
    const pages = await sitePages(join("products", "il-biz-tools"));
    const byName = new Map(pages.map((p) => [p.page, p.noindex]));
    expect(byName.get("pcn874.html")).toBe(false);
    expect(byName.get("vat.html")).toBe(false);
    expect(byName.get("index.html")).toBe(false);
    expect(byName.get("404.html")).toBe(true);
    // tax-2026.json is `"verified": false` today, so the build ships net-salary.html as a noindex notice.
    const tax = JSON.parse(readFileSync(join("products", "il-biz-tools", "src", "config", "tax-2026.json"), "utf8"));
    expect(byName.get("net-salary.html")).toBe(tax.verified !== true);
  });

  it("the committed site.json keeps the counter and the reader off: no project key, no project id", () => {
    const site = JSON.parse(readFileSync(join("products", "il-biz-tools", "src", "config", "site.json"), "utf8"));
    expect(site.posthog.projectKey).toBe("");
    expect(site.posthog.projectId).toBe("");
  });
});

describe("readPageViewClock and the unit format", () => {
  let dir: string;
  beforeEach(() => {
    dir = mkdtempSync(join(tmpdir(), "page-view-clock-"));
  });
  afterEach(() => rmSync(dir, { recursive: true, force: true }));

  it("an absent file is no clock, not a problem", () => {
    const r = readPageViewClock(join(dir, "none.json"));
    expect(r.problems).toEqual([]);
    expect(r.clocks["il-biz-tools"]).toEqual({ d0: null, domainDeployDay: null });
  });

  it("refuses a D0 without its evidence, a day that is not a day, and a domain deploy before D0", () => {
    const file = join(dir, "clock.json");
    writeClock(file, {
      "il-biz-tools": { d0: D0 },
      pcn874: { d0: "5.10.2026", d0Evidence: "x" },
    });
    let r = readPageViewClock(file);
    expect(r.clocks["il-biz-tools"].d0).toBeNull();
    expect(r.clocks.pcn874.d0).toBeNull();
    expect(r.problems.join(" ")).toMatch(/il-biz-tools.*has no d0Evidence/);
    expect(r.problems.join(" ")).toMatch(/pcn874.*5\.10\.2026/);

    writeClock(file, { "il-biz-tools": { d0: D0, d0Evidence: "x", domainDeployDay: "2026-10-01", domainEvidence: "y" } });
    r = readPageViewClock(file);
    expect(r.clocks["il-biz-tools"].domainDeployDay).toBeNull();
    expect(r.problems.join(" ")).toMatch(/before D0/);

    writeFileSync(file, "{not json");
    expect(readPageViewClock(file).problems.join(" ")).toMatch(/not JSON/);
  });

  it("the committed clock starts nothing: D0 is recorded on the deploy day, not before", () => {
    const r = readPageViewClock(join("state", "colony", "page-view-clock.json"));
    expect(r.problems).toEqual([]);
    expect(r.clocks["il-biz-tools"]).toEqual({ d0: null, domainDeployDay: null });
    expect(r.clocks.pcn874).toEqual({ d0: null, domainDeployDay: null });
  });

  it("the unit names host, anchor and week, and parses back", () => {
    const unit = pageViewUnit("il-biz-tools.netlify.app", D0, 7);
    expect(parsePageViewUnit(unit)).toEqual({ host: "il-biz-tools.netlify.app", anchorDay: D0, week: 7 });
    expect(parsePageViewUnit("users")).toBeNull();
    expect(parsePageViewUnit(null)).toBeNull();
  });
});

describe("the colony tick — the KPI step reads, the gates read the rows", () => {
  let db: BetterSqlite3.Database;
  let dir: string;
  let siteDir: string;
  let clockFile: string;
  let measurementsDir: string;

  beforeEach(() => {
    db = createInMemoryDb();
    seedDefaultPortfolio(db);
    dir = mkdtempSync(join(tmpdir(), "page-views-tick-"));
    siteDir = join(dir, "site");
    makeSite(siteDir);
    clockFile = join(dir, "page-view-clock.json");
    measurementsDir = join(dir, "measurements");
    mkdirSync(measurementsDir);
  });
  afterEach(() => {
    db.close();
    rmSync(dir, { recursive: true, force: true });
  });

  const runTick = (nowIso: string, env: Record<string, string>, fetchImpl: typeof fetch) =>
    tick(db, {
      nowIso,
      force: true,
      feedGoals: false,
      env,
      fetchImpl,
      measurementsDir,
      pageViewSiteDir: siteDir,
      pageViewClockFile: clockFile,
      brandMailFile: join(dir, "brand-mail.json"),
      prizeIntakeFile: join(dir, "prize-intake.json"),
    });

  it("today (no key, no D0): the tick calls nothing, writes nothing, and says so in one line per line", async () => {
    const { fetchImpl, calls } = fakeFetch(() => ok());
    const result = await runTick("2026-10-19T12:00:00.000Z", {}, fetchImpl);
    expect(calls).toHaveLength(0);
    expect(result.pageViews?.status).toBe("not_configured");
    expect(result.pageViewGates.map((g) => g.verdict)).toEqual(["no_clock", "no_clock"]);
    expect(result.blockers.join("\n")).not.toMatch(/page views/i);
    const report = renderReport(db, result);
    expect(report).toMatch(/Page views: not configured/);
    expect(report).toMatch(/Page views `pcn874`: no_clock/);
  });

  it("configured with a D0: two weekly writes per line, and the gates read them as instrumented", async () => {
    writeClock(clockFile, {
      "il-biz-tools": { d0: D0, d0Evidence: "test" },
      pcn874: { d0: D0, d0Evidence: "test" },
    });
    const { fetchImpl, calls } = fakeFetch(() => ok());
    const result = await runTick("2026-10-19T12:00:00.000Z", ENV, fetchImpl);
    expect(calls).toHaveLength(2);
    expect(result.pageViews?.status).toBe("recorded");
    const gates = new Map(result.pageViewGates.map((g) => [g.lineId, g]));
    expect(gates.get("il-biz-tools")).toMatchObject({ verdict: "measuring", instrumented: true, period: "netlify" });
    expect(gates.get("pcn874")?.weeks.map(({ week, views }) => ({ week, views }))).toEqual([{ week: 1, views: 5 }, { week: 2, views: 5 }]);
    expect(result.blockers.join("\n")).not.toMatch(/page views/i);
    const report = renderReport(db, result);
    expect(report).toMatch(/Page views `il-biz-tools`: measuring .*w1 10, w2 10/);
    // The report shows what each week's read left out, and why.
    expect(report).toContain("- Page views: recorded — 4 row(s) — w1 from 2026-10-05: il-biz-tools 10, pcn874 5 (not counted: preview 12, noindex 3, other paths 1); w2 from 2026-10-05:");
    // The KPI is printed with its label, like every biased reading (research/breadth/BOARD.md Q5).
    expect(report).toContain("- `pcn874` weeklyPageViews: 5 page views · il-biz-tools.netlify.app · week 2 from 2026-10-05 — cookieless page views");
  });

  it("the scheduled tick passes the read key and the project id to the reader", () => {
    const yml = readFileSync(join(".github", "workflows", "colony.yml"), "utf8");
    expect(yml).toContain("POSTHOG_READ_KEY: ${{ secrets.POSTHOG_READ_KEY }}");
    expect(yml).toContain("POSTHOG_PROJECT_ID: ${{ vars.POSTHOG_PROJECT_ID }}");
  });

  it("a D0 with no reads by day 21 is an instrument fault, and the tick names it as a blocker", async () => {
    writeClock(clockFile, { "il-biz-tools": { d0: D0, d0Evidence: "test" } });
    const result = await runTick("2026-10-27T12:00:00.000Z", {}, fakeFetch(() => ok()).fetchImpl);
    const fault = result.pageViewGates.find((g) => g.lineId === "il-biz-tools");
    expect(fault?.verdict).toBe("instrument_fault");
    expect(result.blockers.join("\n")).toMatch(/page views il-biz-tools: instrument fault/);
  });

  it("a domain clock with no reads by domain day 21 is reader_down, not an instrument fault (the deadline is D0's)", async () => {
    // RULING-2026-10-06-domain-clock: the domain deploy is a new clock, not a new instrument, so no M-instrument
    // deadline runs from it; with no read key the domain weeks are overdue, which is the reader down.
    writeClock(clockFile, { "il-biz-tools": { d0: D0, d0Evidence: "test", domainDeployDay: "2027-01-04", domainEvidence: "test" } });
    const result = await runTick("2027-01-25T12:00:00.000Z", {}, fakeFetch(() => ok()).fetchImpl);
    const gate = result.pageViewGates.find((g) => g.lineId === "il-biz-tools");
    expect(gate?.period).toBe("domain");
    expect(gate?.verdict).toBe("reader_down");
    const blockers = result.blockers.join("\n");
    expect(blockers).toMatch(/page views il-biz-tools: reader down/);
    expect(blockers).not.toMatch(/instrument fault/);
  });

  it("a reader that stops after instrumentation is reader_down: a blocker by that name, never an instrument fault", async () => {
    writeClock(clockFile, { "il-biz-tools": { d0: D0, d0Evidence: "test" } });
    // Day 14: weeks 1-2 read on time — instrumented.
    await runTick("2026-10-19T12:00:00.000Z", ENV, fakeFetch(() => ok()).fetchImpl);
    // Day 30: the key is refused, and weeks 3-4 are a day past readable.
    const refused = fakeFetch(() => new Response(JSON.stringify({ detail: "Invalid personal API key." }), { status: 401 }));
    const result = await runTick("2026-11-04T12:00:00.000Z", ENV, refused.fetchImpl);
    const gate = result.pageViewGates.find((g) => g.lineId === "il-biz-tools");
    expect(gate?.verdict).toBe("reader_down");
    expect(gate?.instrumented).toBe(true);
    const blockers = result.blockers.join("\n");
    expect(blockers).toMatch(/page views il-biz-tools: reader down — the day-56 read over weeks 1-8 cannot be made: week\(s\) 3, 4 still have no reading/);
    expect(blockers).not.toMatch(/page views il-biz-tools: instrument fault/);
    const report = renderReport(db, result);
    expect(report).toMatch(/Page views `il-biz-tools`: reader_down \(netlify period from 2026-10-05, day 30\)/);
    expect(report).toMatch(/Page views `il-biz-tools`: reader_down .* — a blocker until the reader reads the missing weeks; never a clock restart$/m);
  });

  it("the report hands the board its readings, the second-\"between\" pause among them", () => {
    const base = { lineId: "pcn874", period: "netlify" as const, anchorDay: D0, day: 112, weeks: [], instrumented: true };
    const pause = describePageViewGate({
      ...base,
      verdict: "pause",
      notes: ["weeks 9-16: 36 page views in total", "one extension, not passed: paused as under 5; re-enters at the domain deploy"],
    });
    expect(pause).toMatch(/: pause .*one extension, not passed: paused as under 5; re-enters at the domain deploy — a reading for the board to apply$/);
    for (const verdict of ["pass", "extend", "kill"] as const) {
      expect(describePageViewGate({ ...base, verdict, notes: [] })).toMatch(/a reading for the board to apply$/);
    }
    for (const verdict of ["instrument_fault", "reader_down", "measuring"] as const) {
      expect(describePageViewGate({ ...base, verdict, notes: [] })).not.toMatch(/for the board to apply/);
    }
  });

  it("a reader that cannot read while a clock runs is a blocker at once, not only when weeks turn overdue", async () => {
    writeClock(clockFile, { pcn874: { d0: D0, d0Evidence: "test" } });
    // Day 3: no gate is due yet, but the key is missing and the clock is running.
    const a = await runTick("2026-10-08T12:00:00.000Z", { POSTHOG_PROJECT_ID: "12345" }, fakeFetch(() => ok()).fetchImpl);
    expect(a.pageViewGates.find((g) => g.lineId === "pcn874")?.verdict).toBe("uninstrumented");
    expect(a.blockers.join("\n")).toMatch(/page views: not configured while a clock runs \(pcn874 from 2026-10-05\) — POSTHOG_READ_KEY is not set/);

    makeSite(siteDir, { projectKey: "" });
    const b = await runTick("2026-10-08T13:00:00.000Z", ENV, fakeFetch(() => ok()).fetchImpl);
    expect(b.blockers.join("\n")).toMatch(/page views: counter off while a clock runs/);
  });

  it("a read error is a blocker", async () => {
    writeClock(clockFile, { pcn874: { d0: D0, d0Evidence: "test" } });
    const failing = fakeFetch(() => new Response(JSON.stringify({ detail: "Invalid personal API key." }), { status: 401 }));
    const result = await runTick("2026-10-19T12:00:00.000Z", ENV, failing.fetchImpl);
    expect(result.pageViews?.status).toBe("error");
    expect(result.blockers.join("\n")).toMatch(/page views: week 1 from 2026-10-05 not read: PostHog query failed: HTTP 401/);
  });

  it("evaluatePageViewLines reads the same rows the reader wrote", async () => {
    writeClock(clockFile, { pcn874: { d0: D0, d0Evidence: "test" } });
    await readPageViews(db, { env: ENV, fetchImpl: fakeFetch(() => ok()).fetchImpl, nowIso: "2026-10-19T12:00:00.000Z", siteDir, clockFile });
    const { readings, problems } = evaluatePageViewLines(db, { nowIso: "2026-10-19T12:00:00.000Z", siteDir, clockFile });
    expect(problems).toEqual([]);
    expect(readings.find((g) => g.lineId === "pcn874")?.weeks).toEqual([
      { week: 1, views: 5, writtenAt: "2026-10-19T12:00:00.000Z" },
      { week: 2, views: 5, writtenAt: "2026-10-19T12:00:00.000Z" },
    ]);
    expect(readings.find((g) => g.lineId === "il-biz-tools")?.verdict).toBe("no_clock");
  });
});

describe("a priced query API — RULING-2026-10-07-posthog-organisation §4(1) R1, in the reader", () => {
  let db: BetterSqlite3.Database;
  let dir: string;
  let siteDir: string;
  let clockFile: string;
  const NOW = "2026-10-19T12:00:00.000Z";
  const CLOCKS = {
    "il-biz-tools": { d0: D0, d0Evidence: "runner 200 + clean grep (test)" },
    pcn874: { d0: D0, d0Evidence: "rides the il-biz-tools deploy (test)" },
  };

  beforeEach(() => {
    db = createInMemoryDb();
    seedDefaultPortfolio(db);
    dir = mkdtempSync(join(tmpdir(), "page-views-priced-"));
    siteDir = join(dir, "site");
    makeSite(siteDir);
    clockFile = join(dir, "page-view-clock.json");
    writeClock(clockFile, CLOCKS);
  });
  afterEach(() => {
    db.close();
    rmSync(dir, { recursive: true, force: true });
  });

  const read = (fetchImpl: typeof fetch, nowIso = NOW) => readPageViews(db, { env: ENV, fetchImpl, nowIso, siteDir, clockFile });
  const answer = (status: number, name: string): Response => new Response(fixtureText(name), { status, headers: { "content-type": "application/json" } });
  const firing = (over: Partial<QueryApiFiring> = {}): QueryApiFiring => ({
    at: NOW,
    reason: QUERY_API_PRICED,
    status: 402,
    matched: "HTTP 402",
    body: "{}",
    clearedOn: null,
    clearedReason: null,
    ...over,
  });
  /** The clock file with its one firing cleared (or not) by hand, as a person would edit it. */
  const clearBy = (clearedOn: unknown, clearedReason: unknown): void => {
    const data = JSON.parse(readFileSync(clockFile, "utf8"));
    data.queryApi.priced[0] = { ...data.queryApi.priced[0], clearedOn, clearedReason };
    writeFileSync(clockFile, serializePageViewClock(data));
  };

  for (const [status, name, matched] of [
    [402, "posthog-query-402.json", "HTTP 402"],
    [403, "posthog-query-403-billing.json", 'HTTP 403 naming "plan"'],
    [429, "posthog-query-429-billing.json", 'HTTP 429 naming "quota"'],
    [200, "posthog-hogql-pageviews-billed.json", "HTTP 200 carrying a billed-usage field (billed_usage)"],
  ] as const) {
    it(`${matched}: sends nothing more, writes reader_down with reason query_api_priced, and sets the flag`, async () => {
      const before = readPageViewClock(clockFile).clocks;
      const { fetchImpl, calls } = fakeFetch(() => answer(status, name));
      const r = await read(fetchImpl);
      expect(calls).toHaveLength(1); // week 2 is never asked
      expect(r.status).toBe("error");
      expect(r.reason).toBe(QUERY_API_PRICED);
      expect(r.detail.startsWith(`reader_down — query_api_priced: week 1 from ${D0} not read: PostHog's query API answered as priced (${matched}; the answer began "`)).toBe(true);
      expect(r.detail).toContain(`the flag is set in ${clockFile} (queryApi.priced) (RULING-2026-10-07-posthog-organisation §4(1) R1)`);
      expect(r.detail).not.toContain(KEY);
      expect(kpiRows(db, "il-biz-tools")).toEqual([]);
      const after = readPageViewClock(clockFile);
      expect(after.problems).toEqual([]);
      expect(after.clocks).toEqual(before);
      expect(after.queryApi).toEqual([firing({ status, matched, body: maskPricedBody(fixtureText(name), KEY) })]);
    });
  }

  it("weeks read before the priced answer stay; the next week is not asked", async () => {
    const { fetchImpl, calls } = fakeFetch((_c, n) => (n === 1 ? ok() : answer(402, "posthog-query-402.json")));
    const r = await read(fetchImpl);
    expect(calls).toHaveLength(2);
    expect(r.reason).toBe(QUERY_API_PRICED);
    expect(r.detail).toMatch(/^reader_down — query_api_priced: week 2 from 2026-10-05 not read: .*; read before it, and kept: w1 from 2026-10-05/);
    expect(kpiRows(db, "il-biz-tools").map((k) => k.value)).toEqual([10]);
    expect(kpiRows(db, "pcn874").map((k) => k.value)).toEqual([5]);
  });

  it("every later tick sends nothing while the firing has no hand clearance", async () => {
    await read(fakeFetch(() => answer(402, "posthog-query-402.json")).fetchImpl);
    for (const nowIso of ["2026-10-19T13:00:00.000Z", "2026-10-26T12:00:00.000Z", "2027-01-04T12:00:00.000Z"]) {
      const { fetchImpl, calls } = fakeFetch(() => ok());
      const r = await read(fetchImpl, nowIso);
      expect(calls, nowIso).toHaveLength(0);
      expect(r.status).toBe("error");
      expect(r.reason).toBe(QUERY_API_PRICED);
      expect(r.detail).toBe(
        `reader_down — query_api_priced since ${NOW} (HTTP 402): no query is sent while ${clockFile} queryApi.priced holds a firing no hand has ` +
          "cleared (clearedOn, a UTC day, and clearedReason, naming the REOPEN record; RULING-2026-10-07-posthog-organisation §4(1) R1)",
      );
    }
    expect(readPageViewClock(clockFile).queryApi).toHaveLength(1);
  });

  it("a rate-limit 429 is not a trigger: an ordinary failed read, no flag, and the next tick reads", async () => {
    const text = readFileSync(clockFile, "utf8");
    const r = await read(fakeFetch(() => answer(429, "posthog-query-429-rate-limit.json")).fetchImpl);
    expect(r.status).toBe("error");
    expect(r.reason).toBeUndefined();
    expect(r.detail).toBe("week 1 from 2026-10-05 not read: PostHog query failed: HTTP 429: Request was throttled. Expected available in 3 seconds.");
    expect(readFileSync(clockFile, "utf8")).toBe(text);
    const next = fakeFetch(() => ok());
    expect((await read(next.fetchImpl, "2026-10-19T13:00:00.000Z")).status).toBe("recorded");
    expect(next.calls).toHaveLength(2);
  });

  it("a 403 that names no billing word is a refusal, not R1", async () => {
    const refused = new Response(JSON.stringify({ type: "authentication_error", code: "permission_denied", detail: "You do not have permission to perform this action." }), { status: 403 });
    const r = await read(fakeFetch(() => refused).fetchImpl);
    expect(r.reason).toBeUndefined();
    expect(r.detail).toMatch(/^week 1 from 2026-10-05 not read: PostHog query failed: HTTP 403: You do not have permission/);
    expect(readPageViewClock(clockFile).queryApi).toEqual([]);
  });

  it("the record and the detail carry the body masked: never the key, an address's local part or a token", async () => {
    const address = ["someone", "example.com"].join("@");
    const token = ["phc", "T".repeat(24)].join("_");
    const body = JSON.stringify({ detail: `Upgrade required for key ${KEY}; contact ${address}; project ${token}` });
    await read(fakeFetch(() => new Response(body, { status: 403 })).fetchImpl);
    const [f] = readPageViewClock(clockFile).queryApi!;
    expect(f!.matched).toBe('HTTP 403 naming "upgrade"');
    expect(f!.body).toBe('{"detail":"Upgrade required for key [key]; contact [redacted:email]@example.com; project [redacted:posthog-key]"}');
    const text = readFileSync(clockFile, "utf8");
    for (const secret of [KEY, address, token]) expect(text).not.toContain(secret);
  });

  it("a hand clears the firing with a dated reason naming the REOPEN record, and the next tick reads", async () => {
    await read(fakeFetch(() => answer(402, "posthog-query-402.json")).fetchImpl);
    // Cleared on the day it fired: a clearance may not come before the firing's day, and that day itself is fine.
    clearBy("2026-10-19", "REOPEN record: research/channel-loop/RULING-2026-11-02-posthog-query-api.md, a stated free tier");
    const clock = readPageViewClock(clockFile);
    expect(clock.problems).toEqual([]);
    expect(clock.queryApi![0]).toMatchObject({ clearedOn: "2026-10-19", clearedReason: "REOPEN record: research/channel-loop/RULING-2026-11-02-posthog-query-api.md, a stated free tier" });
    const { fetchImpl, calls } = fakeFetch(() => ok());
    const r = await read(fetchImpl, "2026-10-26T12:00:00.000Z");
    expect(r.status).toBe("recorded");
    expect(r.reason).toBeUndefined();
    expect(calls).toHaveLength(3);
  });

  for (const [clearedOn, clearedReason, problem] of [
    [null, "RULING-2026-11-02-posthog-query-api", /has a clearedReason but no clearedOn/],
    ["2026-10-20", null, /clearedOn 2026-10-20 has no clearedReason naming the REOPEN record \(a RULING-YYYY-MM-DD-… file\)/],
    ["2026-10-20", "checked, all fine", /clearedOn 2026-10-20 has no clearedReason naming the REOPEN record/],
    ["2026-10-20", "RULING-2026-11-02", /has no clearedReason naming the REOPEN record/],
    ["20.10.2026", "RULING-2026-11-02-posthog-query-api", /clearedOn is not a UTC day \(YYYY-MM-DD\): 20\.10\.2026/],
    ["2026-10-18", "RULING-2026-11-02-posthog-query-api", /clearedOn 2026-10-18 is before the day it fired, 2026-10-19/],
  ] as const) {
    it(`a clearance that is not a dated reason keeps the flag: ${String(clearedOn)} / ${String(clearedReason)}`, async () => {
      await read(fakeFetch(() => answer(402, "posthog-query-402.json")).fetchImpl);
      clearBy(clearedOn, clearedReason);
      const clock = readPageViewClock(clockFile);
      expect(clock.problems.join(" ")).toMatch(problem);
      expect(clock.problems.join(" ")).toMatch(/queryApi\.priced\[0\] .*: the flag stays set until a hand clears it with a dated reason/);
      expect(clock.queryApi![0]!.clearedOn).toBeNull();
      const { fetchImpl, calls } = fakeFetch(() => ok());
      const r = await read(fetchImpl, "2026-10-26T12:00:00.000Z");
      expect(calls).toHaveLength(0);
      expect(r.reason).toBe(QUERY_API_PRICED);
    });
  }

  for (const [label, block] of [
    ["priced not a list", { priced: "none" }],
    ["the block a list", []],
    ["an entry without at", { priced: [{ reason: "query_api_priced" }] }],
    ["an entry with another reason", { priced: [{ at: NOW, reason: "rate_limited" }] }],
    ["an entry whose at is a day, not an ISO instant", { priced: [{ at: "2026-10-19", reason: "query_api_priced" }] }],
    ["an entry whose at is no time at all", { priced: [{ at: "2026-13-45T00:00:00.000Z", reason: "query_api_priced" }] }],
    ["an entry that is not an object", { priced: [null] }],
  ] as const) {
    it(`fails closed on a queryApi block it cannot read (${label}): nothing is sent`, async () => {
      writeClock(clockFile, { ...CLOCKS, queryApi: block });
      const clock = readPageViewClock(clockFile);
      expect(clock.queryApi).toBeNull();
      expect(clock.problems.join(" ")).toMatch(/queryApi.*the reader sends nothing until a hand fixes it/);
      const { fetchImpl, calls } = fakeFetch(() => ok());
      const r = await read(fetchImpl);
      expect(calls).toHaveLength(0);
      expect(r.status).toBe("error");
      expect(r.detail).toBe(`${clockFile}'s queryApi block cannot be read (see the page-view clock problems): it holds the flag that stops a priced query API, so nothing is sent until a hand fixes it`);
    });
  }

  it("a clock file that is not JSON sends nothing either", async () => {
    writeFileSync(clockFile, "{not json");
    expect(readPageViewClock(clockFile).queryApi).toBeNull();
    const { fetchImpl, calls } = fakeFetch(() => ok());
    expect((await read(fetchImpl)).status).toBe("error");
    expect(calls).toHaveLength(0);
  });

  it("says so when the flag cannot be written: the next tick would query again", async () => {
    mkdirSync(`${clockFile}.tmp-${process.pid}`); // the temp file's path is taken, so the write fails (even as root)
    const r = await read(fakeFetch(() => answer(402, "posthog-query-402.json")).fetchImpl);
    expect(r.reason).toBe(QUERY_API_PRICED);
    expect(r.detail).toMatch(new RegExp(`the flag could NOT be written to ${clockFile.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")} \\(.+\\): write the firing there by hand, or the next tick queries again`));
    expect(readPageViewClock(clockFile).queryApi).toEqual([]);
  });

  it("the tick: the priced answer is a blocker by its name, and the gates read the flag — no instrument fault on day 22", async () => {
    const runTick = (nowIso: string, fetchImpl: typeof fetch) =>
      tick(db, {
        nowIso,
        force: true,
        feedGoals: false,
        env: ENV,
        fetchImpl,
        measurementsDir: join(dir, "measurements"),
        pageViewSiteDir: siteDir,
        pageViewClockFile: clockFile,
        brandMailFile: join(dir, "brand-mail.json"),
        prizeIntakeFile: join(dir, "prize-intake.json"),
      });
    mkdirSync(join(dir, "measurements"));
    const first = await runTick(NOW, fakeFetch(() => answer(402, "posthog-query-402.json")).fetchImpl);
    expect(first.blockers.join("\n")).toMatch(/page views: reader_down — query_api_priced: week 1 from 2026-10-05 not read/);
    // Day 22: weeks 1-3 unread. Without the flag this is the M-instrument fault; with it the deadline is suspended.
    const later = fakeFetch(() => ok());
    const result = await runTick("2026-10-27T12:00:00.000Z", later.fetchImpl);
    expect(later.calls).toHaveLength(0);
    const gate = result.pageViewGates.find((g) => g.lineId === "il-biz-tools");
    expect(gate?.verdict).toBe("reader_down");
    expect(gate?.notes.join(" ")).toContain(`the query API answered as priced on ${NOW} (query_api_priced`);
    const blockers = result.blockers.join("\n");
    expect(blockers).toMatch(/page views: reader_down — query_api_priced since 2026-10-19T12:00:00\.000Z \(HTTP 402\)/);
    expect(blockers).toMatch(/page views il-biz-tools: reader down/);
    expect(blockers).not.toMatch(/page views (il-biz-tools|pcn874): instrument fault/);
  });
});

describe("the clock file's layout — the reader writes it only to add a firing", () => {
  const COMMITTED = join("state", "colony", "page-view-clock.json");

  it("the committed file round-trips byte for byte, and its queryApi block is empty", () => {
    const text = readFileSync(COMMITTED, "utf8");
    expect(serializePageViewClock(JSON.parse(text))).toBe(text);
    expect(JSON.parse(text).queryApi).toEqual({ priced: [] });
    const r = readPageViewClock(COMMITTED);
    expect(r.problems).toEqual([]);
    expect(r.queryApi).toEqual([]);
    // The _comment says what the block is and who clears it.
    expect(JSON.parse(text)._comment).toMatch(/queryApi\.priced is the persistent flag of a priced query API \(RULING-2026-10-07-posthog-organisation\.md §4\(1\) R1\)/);
    expect(JSON.parse(text)._comment).toMatch(/only a hand clears one, never by deleting it: set its clearedOn \(a UTC day, not before the day of at\) and its clearedReason/);
  });

  it("a firing changes the queryApi line and nothing else, in place; a second one is appended", () => {
    const text = readFileSync(COMMITTED, "utf8");
    const f1: QueryApiFiring = { at: "2026-11-02T06:11:00.000Z", reason: QUERY_API_PRICED, status: 402, matched: "HTTP 402", body: "{}", clearedOn: null, clearedReason: null };
    const next = withQueryApiFiring(text, f1);
    const [was, now] = [text.split("\n"), next.split("\n")];
    expect(now).toHaveLength(was.length);
    expect(now.filter((line, i) => line !== was[i])).toEqual([
      '  "queryApi": { "priced": [{ "at": "2026-11-02T06:11:00.000Z", "reason": "query_api_priced", "status": 402, "matched": "HTTP 402", "body": "{}", "clearedOn": null, "clearedReason": null }] }',
    ]);
    expect(serializePageViewClock(JSON.parse(next))).toBe(next);
    const f2 = { ...f1, at: "2026-12-07T06:11:00.000Z" };
    expect(JSON.parse(withQueryApiFiring(next, f2)).queryApi.priced).toEqual([f1, f2]);
    // A file written before the block existed gains it, after every other key.
    expect(Object.keys(JSON.parse(withQueryApiFiring(JSON.stringify({ a: 1, pcn874: { d0: null } }), f1)))).toEqual(["a", "pcn874", "queryApi"]);
    expect(() => withQueryApiFiring(JSON.stringify({ queryApi: { priced: 1 } }), f1)).toThrow(/queryApi is not/);
    expect(() => withQueryApiFiring("[]", f1)).toThrow(/not a JSON object/);
  });
});
