import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import type BetterSqlite3 from "better-sqlite3";
import { createInMemoryDb } from "../orchestration/test-db.js";
import { GUMROAD_REFUND_RATE_LAST_READ_KEY, runLedgerSync } from "../../revenue/heartbeat.js";
import { insertLineFromSeed, latestKpis, recordKpi, recordLedgerEntry, updateLineStatus } from "../../revenue/ledger.js";
import { agorotFromIls } from "../../revenue/money.js";
import { renderReport, tick } from "../../revenue/runner.js";
import { findStalledLines } from "../../revenue/watchdog.js";
import {
  GUMROAD_REFUND_RATE_KPI,
  MAX_REFUND_RATE_PAGES,
  countProRefunds,
  parseRefundRateUnit,
  refundRate,
  refundRateUnit,
} from "../../revenue/connectors/gumroad.js";

// RULING-2026-09-30-documents (d) and "Fold actions for Opus" step 6: the Pro product's refund rate over the trailing
// 90 days, refunded / sales, from GET /v2/sales (`refunded` on the sale object), written as a KPI row with its two
// counts, printed by the report beside sales. A number for the board — never a reason to refuse a refund.
//
// The sale objects below have the fields Gumroad's API v2 serializer writes (antiwork/gumroad 0656875c,
// app/models/purchase.rb#as_json: created_at :1018, product_id :1050, refunded :1052, partially_refunded :1053) and the
// page shape its sales index answers with (app/controllers/api/v2/sales_controller.rb: RESULTS_PER_PAGE = 10 at :14,
// `created_at >= after` at :282; base_controller.rb: { success: true, sales, next_page_key } at :42-44, :53-58, :163-167).
// No test reaches Gumroad: every request goes to the fake below.

const DAY = 86_400_000;
const NOW_ISO = "2026-09-30T12:00:00.000Z";
const NOW = Date.parse(NOW_ISO);
const PRO = "pro-product-id";
const OTHER = "some-other-product";
const iso = (ms: number): string => new Date(ms).toISOString();

type Sale = {
  id: string;
  product_id: string;
  created_at: string;
  refunded: boolean;
  partially_refunded: boolean;
  chargedback: boolean;
  disputed: boolean;
  price: number;
};
const sale = (id: string, over: Partial<Sale> = {}): Sale => ({
  id,
  product_id: PRO,
  created_at: iso(NOW - 5 * DAY),
  refunded: false,
  partially_refunded: false,
  chargedback: false,
  disputed: false,
  price: 7900,
  ...over,
});

/** The ruling's fixture: six sales of Pro inside the window, one of them refunded. */
const sixOneRefunded = (): Sale[] => [
  sale("s1", { refunded: true }),
  sale("s2"),
  sale("s3"),
  sale("s4"),
  sale("s5"),
  sale("s6"),
];

interface Call { url: string }

interface FakeOptions {
  /** Every request answered with this HTTP status and `success: false` (default 200: answered). */
  status?: number;
  /** The refund-rate read's pages from this one on (1-based) are refused; earlier pages are answered. */
  refuseFromPage?: number;
  /** How a refused page is refused: an HTTP 500, or an HTTP 200 whose body says `success: false`. */
  refuseWith?: "http" | "success_false";
  /** Every page of the refund-rate read carries a next_page_key, forever. */
  endless?: boolean;
}

/**
 * A fake Gumroad. The refund-rate read (a request carrying product_id) is answered from `sales` in pages of ten with a
 * page_key, and deliberately ignores product_id and after, so the reader's own product and window filters are what the
 * tests exercise. The ledger's own read (no product_id) is answered with no sales, to keep the ledger out of it.
 */
function fakeGumroad(sales: Sale[], opts: FakeOptions = {}): { fetchImpl: typeof fetch; calls: Call[] } {
  const { status = 200, refuseFromPage, refuseWith = "http", endless = false } = opts;
  const calls: Call[] = [];
  const fetchImpl = (async (url: string | URL) => {
    const u = new URL(String(url));
    calls.push({ url: String(url) });
    if (status !== 200) return new Response(JSON.stringify({ success: false, message: "nope" }), { status });
    if (!u.searchParams.has("product_id")) return new Response(JSON.stringify({ success: true, sales: [] }), { status: 200 });
    const start = Number(u.searchParams.get("page_key") ?? 0);
    const pageNo = start / 10 + 1;
    if (refuseFromPage !== undefined && pageNo >= refuseFromPage) {
      return refuseWith === "http"
        ? new Response(JSON.stringify({ success: false, message: "nope" }), { status: 500 })
        : new Response(JSON.stringify({ success: false, message: "nope" }), { status: 200 });
    }
    const page = sales.slice(start, start + 10);
    const body: Record<string, unknown> = { success: true, sales: page };
    if (endless || start + 10 < sales.length) body.next_page_key = String(start + 10);
    return new Response(JSON.stringify(body), { status: 200 });
  }) as typeof fetch;
  return { fetchImpl, calls };
}

/** The refund-rate read's requests among a fake's calls (the ledger's own read carries no product_id). */
const refundReads = (calls: Call[]): URL[] => calls.map((c) => new URL(c.url)).filter((u) => u.searchParams.has("product_id"));

function makeSite(dir: string, productId: string): string {
  mkdirSync(join(dir, "src", "config"), { recursive: true });
  writeFileSync(join(dir, "src", "config", "site.json"), JSON.stringify({ siteUrl: "https://il-biz-tools.netlify.app", gumroad: { productId } }));
  return dir;
}

function refundRateRows(db: BetterSqlite3.Database): { lineId: string; value: number; unit: string; capturedAt: string }[] {
  return db
    .prepare(`SELECT line_id AS lineId, value, unit, captured_at AS capturedAt FROM revenue_kpi_snapshots WHERE kpi = ? ORDER BY captured_at, rowid`)
    .all(GUMROAD_REFUND_RATE_KPI) as { lineId: string; value: number; unit: string; capturedAt: string }[];
}

describe("countProRefunds / refundRate: the arithmetic", () => {
  it("6 sales with 1 refunded is 1/6, 0.167 to three places (the ruling's fixture)", () => {
    const c = countProRefunds(sixOneRefunded(), PRO, NOW_ISO);
    expect(c).toMatchObject({ sales: 6, refunded: 1, partiallyRefunded: 0 });
    expect(refundRate(c)).toBeCloseTo(1 / 6, 12);
    expect(refundRate(c)!.toFixed(3)).toBe("0.167");
  });

  it("has no rate at all when there are no sales in the window: null, never NaN or a division by zero", () => {
    const c = countProRefunds([], PRO, NOW_ISO);
    expect(c).toMatchObject({ sales: 0, refunded: 0 });
    expect(refundRate(c)).toBeNull();
    const onlyOld = countProRefunds([sale("old", { created_at: iso(NOW - 200 * DAY), refunded: true })], PRO, NOW_ISO);
    expect(onlyOld.sales).toBe(0);
    expect(refundRate(onlyOld)).toBeNull();
  });

  it("measures the window from each sale's own created_at: exactly 90 days old is in, a millisecond older is out", () => {
    const edge = [
      sale("at-90d", { created_at: iso(NOW - 90 * DAY), refunded: true }),
      sale("past-90d", { created_at: iso(NOW - 90 * DAY - 1), refunded: true }),
      sale("now", { created_at: NOW_ISO }),
      sale("after-now", { created_at: iso(NOW + 1), refunded: true }),
    ];
    expect(countProRefunds(edge, PRO, NOW_ISO)).toMatchObject({ sales: 2, refunded: 1 });
  });

  it("counts only the Pro product: another product's sales and refunds are left out even when Gumroad returns them", () => {
    const mixed = [...sixOneRefunded(), sale("x1", { product_id: OTHER, refunded: true }), sale("x2", { product_id: OTHER, refunded: true })];
    expect(countProRefunds(mixed, PRO, NOW_ISO)).toMatchObject({ sales: 6, refunded: 1 });
  });

  it("counts a partly refunded sale as a sale, not as refunded, and carries how many there were", () => {
    // Gumroad sets `refunded` only once the refunds cover the whole charge, and `partially_refunded` otherwise; the two
    // never hold together (antiwork/gumroad app/modules/purchase/refundable.rb:317-318, :406-412).
    const c = countProRefunds([...sixOneRefunded(), sale("p1", { partially_refunded: true })], PRO, NOW_ISO);
    expect(c).toMatchObject({ sales: 7, refunded: 1, partiallyRefunded: 1 });
    expect(refundRate(c)).toBeCloseTo(1 / 7, 12);
  });

  it("counts disputes and chargebacks beside the rate, never in it, and carries both counts in the row's unit", () => {
    // `disputed: chargedback?` (a chargeback was filed) and `chargedback: chargedback_not_reversed?` (it was not reversed)
    // are fields of the same sale object (antiwork/gumroad purchase.rb:1079, :1054, :1313-1314). The ruling's measure is
    // `refunded` alone, so a chargeback lowers nothing and raises nothing: it is shown.
    const sales = [
      ...sixOneRefunded(),
      sale("lost", { disputed: true, chargedback: true }),
      sale("won", { disputed: true }),
      sale("old-dispute", { created_at: iso(NOW - 120 * DAY), disputed: true, chargedback: true }),
      sale("other", { product_id: OTHER, disputed: true, chargedback: true }),
    ];
    const c = countProRefunds(sales, PRO, NOW_ISO);
    expect(c).toMatchObject({ sales: 8, refunded: 1, partiallyRefunded: 0, disputed: 2, chargedback: 1 });
    expect(refundRate(c)).toBeCloseTo(1 / 8, 12);
    expect(parseRefundRateUnit(refundRateUnit(c, PRO))).toMatchObject({ refunded: 1, sales: 8, disputed: 2, chargedback: 1 });
  });

  it("leaves out a sale with no readable created_at, and says how many", () => {
    const c = countProRefunds([...sixOneRefunded(), sale("u1", { created_at: "" }), sale("u2", { created_at: "not a date", refunded: true })], PRO, NOW_ISO);
    expect(c).toMatchObject({ sales: 6, refunded: 1, undated: 2 });
  });
});

describe("the Gumroad connector's sync writes gumroadRefundRate90d", () => {
  let db: BetterSqlite3.Database;
  let dir: string;
  beforeEach(() => {
    db = createInMemoryDb();
    dir = mkdtempSync(join(tmpdir(), "refund-rate-"));
  });
  afterEach(() => {
    db.close();
    rmSync(dir, { recursive: true, force: true });
  });

  const ENV = { GUMROAD_ACCESS_TOKEN: "test-token-not-real" };

  it("writes one KPI row on the Pro product's line: the rate as the value, its two counts in the unit, dated by the sync", async () => {
    const { fetchImpl } = fakeGumroad(sixOneRefunded());
    const result = await runLedgerSync(db, ENV, fetchImpl, { nowIso: NOW_ISO, proSiteDir: makeSite(dir, PRO) });
    expect(result.gumroadRefundRate).toMatchObject({ status: "recorded", lineId: "il-biz-tools", rate: 1 / 6 });
    const rows = refundRateRows(db);
    expect(rows).toHaveLength(1);
    expect(rows[0]!.lineId).toBe("il-biz-tools");
    expect(rows[0]!.value).toBeCloseTo(0.167, 3);
    expect(rows[0]!.capturedAt).toBe(NOW_ISO);
    expect(parseRefundRateUnit(rows[0]!.unit)).toEqual({
      refunded: 1,
      sales: 6,
      productKey: `gumroad:${PRO}`,
      windowDays: 90,
      windowEnd: NOW_ISO,
      partiallyRefunded: 0,
      disputed: 0,
      chargedback: 0,
    });
  });

  it("puts the row on the line the product map gives the Pro product, beside where its sales are booked", async () => {
    db.prepare("INSERT OR REPLACE INTO kv (key, value, updated_at) VALUES (?, ?, datetime('now'))").run(
      "revenue.product_map",
      JSON.stringify({ [`gumroad:${PRO}`]: "pcn874" }),
    );
    const { fetchImpl } = fakeGumroad(sixOneRefunded());
    await runLedgerSync(db, ENV, fetchImpl, { nowIso: NOW_ISO, proSiteDir: makeSite(dir, PRO) });
    expect(refundRateRows(db).map((r) => r.lineId)).toEqual(["pcn874"]);
  });

  it("asks Gumroad for the Pro product's sales from a day before the window, and reads every page", async () => {
    // 12 sales: Gumroad answers ten a page, so two pages. Two of the twelve are refunded, one on each page.
    const twelve = Array.from({ length: 12 }, (_, i) => sale(`s${i}`, { refunded: i === 0 || i === 11 }));
    const { fetchImpl, calls } = fakeGumroad(twelve);
    const result = await runLedgerSync(db, ENV, fetchImpl, { nowIso: NOW_ISO, proSiteDir: makeSite(dir, PRO) });
    const reads = calls.map((c) => new URL(c.url)).filter((u) => u.searchParams.has("product_id"));
    expect(reads).toHaveLength(2);
    for (const u of reads) {
      expect(u.origin + u.pathname).toBe("https://api.gumroad.com/v2/sales");
      expect(u.searchParams.get("product_id")).toBe(PRO);
      expect(u.searchParams.get("after")).toBe("2026-07-01"); // 91 days before 30.9: the window's first day and one more
    }
    expect(reads[1]!.searchParams.get("page_key")).toBe("10");
    expect(result.gumroadRefundRate).toMatchObject({ status: "recorded", count: { sales: 12, refunded: 2 } });
  });

  it("writes no row and says there is no rate when the window holds no Pro sale", async () => {
    const { fetchImpl } = fakeGumroad([sale("x1", { product_id: OTHER, refunded: true }), sale("old", { created_at: iso(NOW - 120 * DAY) })]);
    const result = await runLedgerSync(db, ENV, fetchImpl, { nowIso: NOW_ISO, proSiteDir: makeSite(dir, PRO) });
    expect(result.gumroadRefundRate).toMatchObject({ status: "no_sales", rate: null, count: { sales: 0, refunded: 0 } });
    expect(refundRateRows(db)).toEqual([]);
  });

  it("reads nothing while the Pro product does not exist (site.json gumroad.productId empty)", async () => {
    const { fetchImpl, calls } = fakeGumroad(sixOneRefunded());
    const result = await runLedgerSync(db, ENV, fetchImpl, { nowIso: NOW_ISO, proSiteDir: makeSite(dir, "") });
    expect(result.gumroadRefundRate?.status).toBe("no_product");
    expect(calls.some((c) => new URL(c.url).searchParams.has("product_id"))).toBe(false);
    expect(refundRateRows(db)).toEqual([]);
  });

  it("reads nothing without the Gumroad token", async () => {
    const { fetchImpl, calls } = fakeGumroad(sixOneRefunded());
    const result = await runLedgerSync(db, {}, fetchImpl, { nowIso: NOW_ISO, proSiteDir: makeSite(dir, PRO) });
    expect(result.gumroadRefundRate?.status).toBe("not_configured");
    expect(calls).toEqual([]);
  });

  it("writes no partial rate when a page is refused, and does not turn the failure into a sync error", async () => {
    const { fetchImpl } = fakeGumroad(sixOneRefunded(), { status: 500 });
    const result = await runLedgerSync(db, ENV, fetchImpl, { nowIso: NOW_ISO, proSiteDir: makeSite(dir, PRO) });
    expect(result.gumroadRefundRate?.status).toBe("error");
    expect(result.errors.join("\n")).not.toMatch(/refund/i);
    expect(refundRateRows(db)).toEqual([]);
  });

  for (const refuseWith of ["http", "success_false"] as const) {
    it(`writes no rate from the pages read so far when a later page is refused (${refuseWith})`, async () => {
      // 12 sales, two pages: page 1 is answered (ten sales, one refunded), page 2 is refused. Ten sales is a count, not
      // the count; a rate from it would be passed off as the product's.
      const twelve = Array.from({ length: 12 }, (_, i) => sale(`s${i}`, { refunded: i === 0 }));
      const { fetchImpl, calls } = fakeGumroad(twelve, { refuseFromPage: 2, refuseWith });
      const result = await runLedgerSync(db, ENV, fetchImpl, { nowIso: NOW_ISO, proSiteDir: makeSite(dir, PRO) });
      expect(refundReads(calls)).toHaveLength(2);
      expect(result.gumroadRefundRate).toMatchObject({ status: "error", rate: null, count: null, rowWritten: false });
      expect(result.gumroadRefundRate?.detail).toMatch(/page 2/);
      expect(result.errors.join("\n")).not.toMatch(/refund/i);
      expect(refundRateRows(db)).toEqual([]);
    });
  }

  it(`stops after exactly ${MAX_REFUND_RATE_PAGES} pages when Gumroad keeps paging, and writes no rate from them`, async () => {
    const { fetchImpl, calls } = fakeGumroad(sixOneRefunded(), { endless: true });
    const result = await runLedgerSync(db, ENV, fetchImpl, { nowIso: NOW_ISO, proSiteDir: makeSite(dir, PRO) });
    expect(refundReads(calls)).toHaveLength(MAX_REFUND_RATE_PAGES);
    expect(result.gumroadRefundRate).toMatchObject({ status: "error", rate: null, count: null, rowWritten: false });
    expect(result.gumroadRefundRate?.detail).toMatch(new RegExp(`more than ${MAX_REFUND_RATE_PAGES} pages`));
    expect(refundRateRows(db)).toEqual([]);
  });

  it("writes a new row only when the counts change: re-reading the same sales an hour later writes none", async () => {
    const site = makeSite(dir, PRO);
    const first = await runLedgerSync(db, ENV, fakeGumroad(sixOneRefunded()).fetchImpl, { nowIso: NOW_ISO, proSiteDir: site });
    expect(first.gumroadRefundRate).toMatchObject({ status: "recorded", rowWritten: true });
    const hourLater = iso(NOW + 60 * 60_000);
    const again = await runLedgerSync(db, ENV, fakeGumroad(sixOneRefunded()).fetchImpl, { nowIso: hourLater, proSiteDir: site });
    expect(again.gumroadRefundRate).toMatchObject({ status: "recorded", rowWritten: false, rate: 1 / 6 });
    expect(refundRateRows(db)).toHaveLength(1);
    // The last read is still the newest: it carries the second sync's time, whatever the row's.
    expect(JSON.parse(db.prepare("SELECT value FROM kv WHERE key = ?").pluck().get(GUMROAD_REFUND_RATE_LAST_READ_KEY) as string)).toMatchObject({
      status: "recorded",
      at: hourLater,
    });
    const moreRefunds = [...sixOneRefunded(), sale("s7", { refunded: true })];
    const changed = await runLedgerSync(db, ENV, fakeGumroad(moreRefunds).fetchImpl, { nowIso: iso(NOW + 2 * 60 * 60_000), proSiteDir: site });
    expect(changed.gumroadRefundRate).toMatchObject({ status: "recorded", rowWritten: true, count: { sales: 7, refunded: 2 } });
    expect(refundRateRows(db).map((r) => r.value)).toEqual([1 / 6, 2 / 7]);
  });

  it("writes the row again when a rate comes back after a read that found no sale, even with the same counts", async () => {
    const site = makeSite(dir, PRO);
    const oneOfTwo = (at: number) => [sale("a", { created_at: iso(at), refunded: true }), sale("b", { created_at: iso(at) })];
    await runLedgerSync(db, ENV, fakeGumroad(oneOfTwo(NOW - 5 * DAY)).fetchImpl, { nowIso: NOW_ISO, proSiteDir: site });
    const lapsed = await runLedgerSync(db, ENV, fakeGumroad(oneOfTwo(NOW - 5 * DAY)).fetchImpl, { nowIso: iso(NOW + 100 * DAY), proSiteDir: site });
    expect(lapsed.gumroadRefundRate?.status).toBe("no_sales");
    const back = await runLedgerSync(db, ENV, fakeGumroad(oneOfTwo(NOW + 110 * DAY)).fetchImpl, { nowIso: iso(NOW + 120 * DAY), proSiteDir: site });
    expect(back.gumroadRefundRate).toMatchObject({ status: "recorded", rowWritten: true, rate: 0.5 });
    expect(refundRateRows(db).map((r) => r.capturedAt)).toEqual([NOW_ISO, iso(NOW + 120 * DAY)]);
  });

  it("does not hide a stalled line from the watchdog: a line whose last sale was 30 days ago is still stalled after a sync", async () => {
    insertLineFromSeed(db, {
      id: "il-biz-tools",
      name: "il-biz-tools",
      category: "micro_saas",
      tier: "core",
      directorRole: "director-il-biz-tools",
      operatingLoop: "build, ship, measure",
      kpis: ["sales"],
      killCriteria: ["none"],
      scaleCriteria: ["none"],
      targetMonthlyAgorot: agorotFromIls(1000),
      budgetMonthlyCents: 1000,
      humanSetup: [],
      skillName: null,
    });
    db.prepare("UPDATE revenue_lines SET created_at = ? WHERE id = ?").run(iso(NOW - 60 * DAY), "il-biz-tools");
    updateLineStatus(db, "il-biz-tools", "live", { force: true });
    const soldAt = iso(NOW - 30 * DAY);
    recordLedgerEntry(db, { lineId: "il-biz-tools", kind: "sale", amountMinor: 7900, currency: "ILS", source: "gumroad", externalId: "g-1", occurredAt: soldAt });
    const stalled = () => findStalledLines(db, NOW).find((l) => l.lineId === "il-biz-tools");
    expect(stalled()).toMatchObject({ lastSignal: "ledger", daysSinceProgress: 30 });

    const { fetchImpl } = fakeGumroad([sale("g-1", { created_at: soldAt })]);
    const result = await runLedgerSync(db, ENV, fetchImpl, { nowIso: NOW_ISO, proSiteDir: makeSite(dir, PRO) });
    expect(result.gumroadRefundRate).toMatchObject({ status: "recorded", rowWritten: true, lineId: "il-biz-tools" });
    expect(refundRateRows(db)).toHaveLength(1);
    expect(stalled()).toMatchObject({ lastSignal: "ledger", daysSinceProgress: 30 });
  });
});

describe("the report prints the refund rate beside sales, and never makes it a blocker", () => {
  let db: BetterSqlite3.Database;
  let dir: string;
  beforeEach(() => {
    db = createInMemoryDb();
    dir = mkdtempSync(join(tmpdir(), "refund-rate-report-"));
  });
  afterEach(() => {
    db.close();
    rmSync(dir, { recursive: true, force: true });
  });

  const ENV = { GUMROAD_ACCESS_TOKEN: "test-token-not-real" };
  const run = (sales: Sale[], opts: { status?: number; nowIso?: string } = {}) => {
    const { fetchImpl } = fakeGumroad(sales, { status: opts.status });
    return tick(db, { nowIso: opts.nowIso ?? NOW_ISO, env: ENV, fetchImpl, proSiteDir: makeSite(dir, PRO), feedGoals: false });
  };
  const reportLines = (report: string) => report.split("\n");

  it("prints the rate with its two counts on the line after the ledger sync's", async () => {
    const report = renderReport(db, await run(sixOneRefunded()));
    const lines = reportLines(report);
    const at = lines.findIndex((l) => l.startsWith("- Ledger sync:"));
    expect(at).toBeGreaterThanOrEqual(0);
    expect(lines[at + 1]).toMatch(/^- Gumroad Pro refund rate, trailing 90 days: 0\.167 — 1 refunded of 6 sales/);
  });

  it("says there is no rate when there are no sales, and never prints NaN or Infinity", async () => {
    const report = renderReport(db, await run([]));
    expect(report).toMatch(/Gumroad Pro refund rate, trailing 90 days: no rate — no Pro sale in the window/);
    expect(report).not.toMatch(/NaN|Infinity/);
  });

  it("prints the disputes and chargebacks beside the rate, which counts `refunded` only", async () => {
    const report = renderReport(db, await run([...sixOneRefunded(), sale("lost", { disputed: true, chargedback: true }), sale("won", { disputed: true })]));
    expect(report).toMatch(
      /Gumroad Pro refund rate, trailing 90 days: 0\.125 — 1 refunded of 8 sales \(the rate counts `refunded` only; also in the window: partly refunded 0, disputed 2, chargebacks not reversed 1\)/,
    );
  });

  it("prints the last sync's reading, with the time it was read, when the sync was not due this tick", async () => {
    await run(sixOneRefunded());
    const later = await run([], { nowIso: iso(NOW + 10 * 60_000) }); // ten minutes on: the hourly sync is not due
    expect(later.ledgerSync).toBeNull();
    expect(renderReport(db, later)).toMatch(new RegExp(`Gumroad Pro refund rate, trailing 90 days \\(last read ${NOW_ISO}\\): 0\\.167 — 1 refunded of 6 sales`));
  });

  it("never prints an older rate once a later sync found no sale: 1 of 2, then 100 days on no sale, then a tick with no sync", async () => {
    const oneOfTwo = [sale("a", { refunded: true }), sale("b")]; // both five days before NOW
    const first = await run(oneOfTwo);
    expect(first.ledgerSync?.gumroadRefundRate?.rate).toBe(0.5);
    const hundredDays = iso(NOW + 100 * DAY);
    const lapsed = await run(oneOfTwo, { nowIso: hundredDays }); // the same two sales, now 105 days old
    expect(lapsed.ledgerSync?.gumroadRefundRate?.status).toBe("no_sales");
    const tenMinutes = await run(oneOfTwo, { nowIso: iso(NOW + 100 * DAY + 10 * 60_000) });
    expect(tenMinutes.ledgerSync).toBeNull();
    const report = renderReport(db, tenMinutes);
    expect(report).not.toContain("0.500");
    expect(report).toContain(`Gumroad Pro refund rate, trailing 90 days (last read ${hundredDays}): no rate — no Pro sale in the window`);
    // The row of 30.9 stays in the history, dated and with its window in its unit; it is not the report's reading.
    expect(latestKpis(db, "il-biz-tools")[GUMROAD_REFUND_RATE_KPI]?.unit).toContain(`90 days to ${NOW_ISO}`);
  });

  it("prints a failed read, with its time, on a tick with no sync, and no rate from before it", async () => {
    await run(sixOneRefunded());
    await run(sixOneRefunded(), { nowIso: iso(NOW + 60 * 60_000), status: 500 });
    const report = renderReport(db, await run([], { nowIso: iso(NOW + 70 * 60_000) }));
    expect(report).toContain(`Gumroad Pro refund rate (last read ${iso(NOW + 60 * 60_000)}): not read — `);
    expect(report).not.toContain("0.167");
  });

  it("is never a blocker: not at a rate of one half, not above Gumroad's thresholds, not when the read fails", async () => {
    const half = [sale("a", { refunded: true }), sale("b", { refunded: true }), sale("c", { refunded: true }), sale("d"), sale("e"), sale("f")];
    const high = await run(half);
    expect(high.ledgerSync?.gumroadRefundRate?.rate).toBe(0.5);
    expect(high.blockers.join("\n")).not.toMatch(/refund/i);
    db.close();
    db = createInMemoryDb();
    const failed = await run(sixOneRefunded(), { status: 500 });
    expect(failed.ledgerSync?.gumroadRefundRate?.status).toBe("error");
    expect(failed.blockers.join("\n")).not.toMatch(/refund/i);
    expect(renderReport(db, failed)).toMatch(/Gumroad Pro refund rate: not read — /);
  });

  it("reads the last sync's read, not the KPI rows: a row with no read behind it prints nothing", () => {
    recordKpi(
      db,
      "il-biz-tools",
      GUMROAD_REFUND_RATE_KPI,
      0.5,
      `refunded 1 of 2 sales · gumroad:${PRO} · 90 days to 2026-09-01T00:00:00.000Z · partly refunded 0 · disputed 0 · chargedback 0`,
      "2026-09-01T00:00:00.000Z",
    );
    const report = renderReport(db, { ...emptyTick(), enabled: true });
    expect(report).not.toMatch(/Gumroad Pro refund rate/);
    expect(report).not.toContain("0.500");
  });
});

function emptyTick(): Parameters<typeof renderReport>[1] {
  return {
    at: NOW_ISO,
    enabled: false,
    ran: [],
    skipped: [],
    ledgerSync: null,
    measurements: [],
    supervisor: null,
    board: null,
    audit: null,
    stuckGoals: [],
    liveness: [],
    stalledLines: [],
    brandMail: { file: "x", status: "absent", line: null, blockers: [] },
    prizeIntake: { file: "x", status: "absent", line: "" },
    pageViews: null,
    pageViewGates: [],
    blockers: [],
    summary: null,
  };
}
