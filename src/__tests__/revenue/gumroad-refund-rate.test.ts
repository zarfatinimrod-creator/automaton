import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import type BetterSqlite3 from "better-sqlite3";
import { createInMemoryDb } from "../orchestration/test-db.js";
import { runLedgerSync } from "../../revenue/heartbeat.js";
import { recordKpi } from "../../revenue/ledger.js";
import { renderReport, tick } from "../../revenue/runner.js";
import {
  GUMROAD_REFUND_RATE_KPI,
  countProRefunds,
  parseRefundRateUnit,
  refundRate,
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

type Sale = { id: string; product_id: string; created_at: string; refunded: boolean; partially_refunded: boolean; price: number };
const sale = (id: string, over: Partial<Sale> = {}): Sale => ({
  id,
  product_id: PRO,
  created_at: iso(NOW - 5 * DAY),
  refunded: false,
  partially_refunded: false,
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

/**
 * A fake Gumroad. The refund-rate read (a request carrying product_id) is answered from `sales` in pages of ten with a
 * page_key, and deliberately ignores product_id and after, so the reader's own product and window filters are what the
 * tests exercise. The ledger's own read (no product_id) is answered with no sales, to keep the ledger out of it.
 */
function fakeGumroad(sales: Sale[], { status = 200 }: { status?: number } = {}): { fetchImpl: typeof fetch; calls: Call[] } {
  const calls: Call[] = [];
  const fetchImpl = (async (url: string | URL) => {
    const u = new URL(String(url));
    calls.push({ url: String(url) });
    if (status !== 200) return new Response(JSON.stringify({ success: false, message: "nope" }), { status });
    if (!u.searchParams.has("product_id")) return new Response(JSON.stringify({ success: true, sales: [] }), { status: 200 });
    const start = Number(u.searchParams.get("page_key") ?? 0);
    const page = sales.slice(start, start + 10);
    const body: Record<string, unknown> = { success: true, sales: page };
    if (start + 10 < sales.length) body.next_page_key = String(start + 10);
    return new Response(JSON.stringify(body), { status: 200 });
  }) as typeof fetch;
  return { fetchImpl, calls };
}

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

  it("prints the last recorded reading, with its date, when the sync was not due this tick", async () => {
    await run(sixOneRefunded());
    const later = await run([], { nowIso: iso(NOW + 10 * 60_000) }); // ten minutes on: the hourly sync is not due
    expect(later.ledgerSync).toBeNull();
    expect(renderReport(db, later)).toMatch(new RegExp(`Gumroad Pro refund rate, trailing 90 days \\(last recorded ${NOW_ISO}\\): 0\\.167 — 1 refunded of 6 sales`));
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

  it("the latest row is what a later report reads, even when an older one exists", () => {
    recordKpi(db, "il-biz-tools", GUMROAD_REFUND_RATE_KPI, 0.5, `refunded 1 of 2 sales · gumroad:${PRO} · 90 days to 2026-09-01T00:00:00.000Z · partly refunded 0`, "2026-09-01T00:00:00.000Z");
    recordKpi(db, "il-biz-tools", GUMROAD_REFUND_RATE_KPI, 0.25, `refunded 1 of 4 sales · gumroad:${PRO} · 90 days to 2026-09-20T00:00:00.000Z · partly refunded 0`, "2026-09-20T00:00:00.000Z");
    const report = renderReport(db, { ...emptyTick(), enabled: true });
    expect(report).toContain("(last recorded 2026-09-20T00:00:00.000Z): 0.250 — 1 refunded of 4 sales");
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
