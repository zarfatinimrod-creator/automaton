import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { createHash } from "node:crypto";
import { createInMemoryDb } from "../orchestration/test-db.js";
import { getConnectorCursor, insertLineFromSeed, recordLedgerEntry, setConnectorCursor } from "../../revenue/ledger.js";
import { runLedgerSync } from "../../revenue/heartbeat.js";
import { verifyGumroadLedger } from "../../revenue/gumroad-verify.js";
import { tick } from "../../revenue/runner.js";
import { agorotFromIls, isStoredForm, storedExternalId, STORED_EXTERNAL_ID_RE } from "../../revenue/money.js";
import {
  gumroadConnector, gumroadSaleEntries, listGumroadSalesSince, MAX_LEDGER_SYNC_PAGES, MAX_REFUND_RATE_PAGES, readProRefundCount,
} from "../../revenue/connectors/gumroad.js";

// RULING-2026-10-11-ledger-sale-ids.md (FABLE_QUEUE row 26), folds 3, 6 and 7: the connector books a sale, its refund and
// its fee as sha256:X, sha256:X:refund and sha256:X:fee, X the unkeyed SHA-256 of the sale's own id, so the raw id leaves
// fetchSince in no entry; and the shared pager follows next_page_key to the end and stops at its cap. "g1" is an
// invented id, as every fixture in this suite is. No test reaches Gumroad.

const sha = (text: string) => createHash("sha256").update(text, "utf8").digest("hex");
const CREATED = "2026-10-05T09:30:00Z";

const oneSale = (over: Record<string, unknown> = {}) => ({
  id: "g1", product_id: "p1", product_name: "Planner", price: 1200, currency: "usd", created_at: CREATED,
  gumroad_fee: 120, refunded: true, ...over,
});

function fakeIndex(sales: unknown[]): typeof fetch {
  return (async () => new Response(JSON.stringify({ success: true, sales }), { status: 200 })) as unknown as typeof fetch;
}

describe("the Gumroad connector books the digest of a sale id, never the id", () => {
  it("a refunded sale with a fee: three entries, one digest, recomputed here from the raw id (the auditor's re-derivation in miniature)", async () => {
    const { entries, nextCursor, unmapped } = await gumroadConnector.fetchSince({
      cursor: "2026-10-01", env: { GUMROAD_ACCESS_TOKEN: "fake-token" }, resolveLine: () => undefined, fetchImpl: fakeIndex([oneSale()]),
    });
    const x = sha("g1");
    expect(entries.map((e) => [e.kind, e.externalId])).toEqual([
      ["sale", `sha256:${x}`],
      ["refund", `sha256:${x}:refund`],
      ["cost", `sha256:${x}:fee`],
    ]);
    expect(entries.map((e) => [e.amountMinor, e.currency, e.source, e.occurredAt])).toEqual([
      [1200, "USD", "gumroad", "2026-10-05T09:30:00.000Z"],
      [1200, "USD", "gumroad", "2026-10-05T09:30:00.000Z"],
      [120, "USD", "gumroad", "2026-10-05T09:30:00.000Z"],
    ]);
    expect(entries.map((e) => e.note)).toEqual(["Planner", "refunded", "gumroad fee"]);
    expect(JSON.stringify(entries)).not.toContain("g1");
    for (const e of entries) {
      expect(e.externalId).toMatch(STORED_EXTERNAL_ID_RE);
      expect(isStoredForm("gumroad", e.externalId)).toBe(true);
      expect(storedExternalId("gumroad", e.externalId)).toBe(e.externalId);
    }
    // The cursor is a day and the unmapped key a product id, as before: neither is a sale id.
    expect(nextCursor).toBe("2026-10-05");
    expect(unmapped).toEqual(["gumroad:p1"]);
  });

  it("an unrefunded sale with no fee is one entry, and the raw id appears in none", async () => {
    const { entries } = await gumroadConnector.fetchSince({
      cursor: "2026-10-01", env: { GUMROAD_ACCESS_TOKEN: "fake-token" }, resolveLine: () => "il-biz-tools",
      fetchImpl: fakeIndex([oneSale({ id: 98765, refunded: false, gumroad_fee: 0 })]),
    });
    expect(entries.map((e) => [e.lineId, e.kind, e.externalId])).toEqual([["il-biz-tools", "sale", `sha256:${sha("98765")}`]]);
    expect(JSON.stringify(entries)).not.toContain("98765");
  });

  it("the connector's digest and a raw id booked by hand are one key: the second booking is a duplicate", async () => {
    const db = createInMemoryDb();
    try {
      insertLineFromSeed(db, {
        id: "test-line", name: "T", category: "digital_product", tier: "growth", directorRole: "d", operatingLoop: "x",
        kpis: [], killCriteria: [], scaleCriteria: [], targetMonthlyAgorot: agorotFromIls(100), budgetMonthlyCents: 0, humanSetup: [], skillName: null,
      });
      const { entries } = await gumroadConnector.fetchSince({
        cursor: "2026-10-01", env: { GUMROAD_ACCESS_TOKEN: "fake-token" }, resolveLine: () => "test-line", fetchImpl: fakeIndex([oneSale()]),
      });
      for (const e of entries) expect(recordLedgerEntry(db, e)).not.toBeNull();
      expect(recordLedgerEntry(db, { lineId: "test-line", kind: "sale", amountMinor: 1200, currency: "USD", source: "gumroad", externalId: "g1" })).toBeNull();
      expect(recordLedgerEntry(db, { lineId: "test-line", kind: "refund", amountMinor: 1200, currency: "USD", source: "gumroad", externalId: "g1:refund" })).toBeNull();
      expect(recordLedgerEntry(db, { lineId: "test-line", kind: "cost", amountMinor: 120, currency: "USD", source: "gumroad", externalId: "g1:fee" })).toBeNull();
      expect(JSON.stringify(db.prepare("SELECT * FROM revenue_ledger").all())).not.toContain("g1");
    } finally {
      db.close();
    }
  });

  it("a sale with no id books no id of its own making: one sale entry with none, which the ledger refuses (rule 2)", () => {
    const db = createInMemoryDb();
    try {
      insertLineFromSeed(db, {
        id: "test-line", name: "T", category: "digital_product", tier: "growth", directorRole: "d", operatingLoop: "x",
        kpis: [], killCriteria: [], scaleCriteria: [], targetMonthlyAgorot: agorotFromIls(100), budgetMonthlyCents: 0, humanSetup: [], skillName: null,
      });
      // Missing, null, empty or blank: neither the digest of "undefined" or "null" nor a refund and fee family under it.
      for (const id of [undefined, null, "", "  "]) {
        const entries = gumroadSaleEntries(oneSale({ id }), "test-line");
        expect(entries.map((e) => [e.kind, e.externalId]), String(id)).toEqual([["sale", null]]);
        expect(() => recordLedgerEntry(db, entries[0]!)).toThrow(/externalId is required for a sale/);
      }
      expect(db.prepare("SELECT COUNT(*) AS n FROM revenue_ledger").get()).toEqual({ n: 0 });
    } finally {
      db.close();
    }
  });
});

describe("listGumroadSalesSince: the shared pager", () => {
  /** Pages of ten from `total` invented sales; `endless` keeps a next_page_key on every page. */
  function pagedIndex(total: number, endless = false): { fetchImpl: typeof fetch; urls: URL[] } {
    const urls: URL[] = [];
    const fetchImpl = (async (url: string | URL) => {
      const u = new URL(String(url));
      urls.push(u);
      const start = Number(u.searchParams.get("page_key") ?? 0);
      const sales = Array.from({ length: Math.max(0, Math.min(10, total - start)) }, (_, i) => ({ id: `s${start + i}` }));
      const body: Record<string, unknown> = { success: true, sales };
      if (endless || start + 10 < total) body.next_page_key = String(start + 10);
      return new Response(JSON.stringify(body), { status: 200 });
    }) as typeof fetch;
    return { fetchImpl, urls };
  }

  it("follows next_page_key to the last page and returns every sale", async () => {
    const { fetchImpl, urls } = pagedIndex(25);
    const listing = await listGumroadSalesSince({ token: "fake-token", after: "2026-09-01", fetchImpl });
    expect(listing.ok).toBe(true);
    if (!listing.ok) return;
    expect(listing.pages).toBe(3);
    expect((listing.sales as { id: string }[]).map((s) => s.id)).toEqual(Array.from({ length: 25 }, (_, i) => `s${i}`));
    expect(urls.map((u) => u.searchParams.get("page_key"))).toEqual([null, "10", "20"]);
    // No product filter unless one is asked for; the day and the token in the query, as the index reads them.
    expect(urls.every((u) => !u.searchParams.has("product_id") && u.searchParams.get("after") === "2026-09-01")).toBe(true);
  });

  it("filters on a product when given one", async () => {
    const { fetchImpl, urls } = pagedIndex(3);
    await listGumroadSalesSince({ token: "fake-token", after: "2026-09-01", productId: "p1", fetchImpl });
    expect(urls[0]!.searchParams.get("product_id")).toBe("p1");
  });

  it("stops at the page cap and says the listing is not complete", async () => {
    const { fetchImpl, urls } = pagedIndex(0, true);
    expect(await listGumroadSalesSince({ token: "fake-token", after: "2026-09-01", fetchImpl, maxPages: 4 })).toEqual({ ok: false, problem: "too_many_pages", pages: 4 });
    expect(urls).toHaveLength(4);
    const capped = pagedIndex(0, true);
    expect(await listGumroadSalesSince({ token: "fake-token", after: "2026-09-01", fetchImpl: capped.fetchImpl })).toMatchObject({ ok: false, problem: "too_many_pages" });
    expect(capped.urls).toHaveLength(MAX_REFUND_RATE_PAGES);
  });

  it("a refused page is no listing, and names its status and page", async () => {
    let n = 0;
    const fetchImpl = (async () => {
      n += 1;
      return n === 1
        ? new Response(JSON.stringify({ success: true, sales: [{ id: "a" }], next_page_key: "10" }), { status: 200 })
        : new Response(JSON.stringify({ success: false }), { status: 401 });
    }) as unknown as typeof fetch;
    expect(await listGumroadSalesSince({ token: "fake-token", after: "2026-09-01", fetchImpl })).toEqual({ ok: false, problem: "refused", status: 401, page: 2 });
  });
});

// Tick 71 (CHANNEL_LOOP §9 tick-69 item 2; RULING-2026-10-11-ledger-sale-ids.md "What this does not decide" 6): fetchSince
// read one page of ten and moved its cursor to the newest day on it, so a sync with more than ten sales since the cursor
// booked ten and passed the rest. It now reads through the shared pager to the last page, asks from the day before its
// cursor, and on a listing refused part-way or longer than the page cap books what it read and keeps its cursor. Every
// booking below goes through the real runLedgerSync and recordLedgerEntry on an in-memory ledger; no test reaches
// Gumroad, and every id and the token are invented.
describe("fetchSince reads every page since its cursor, and never passes a sale it did not read", () => {
  const TOKEN = "fake-token-T71";
  const ENV = { GUMROAD_ACCESS_TOKEN: TOKEN };
  const NO_PRO = { proSiteDir: "/nonexistent/no-pro-site-t71" }; // no Pro product: the refund-rate read fetches nothing
  const DAY_MS = 86_400_000;

  type FakeSale = { id: string; product_id: string; price: number; currency: string; created_at: string; gumroad_fee: number; refunded: boolean };
  const fakeSale = (i: number, createdAt: string): FakeSale => ({
    id: `fake-sale-t71-${i}`, product_id: "fake-product", price: 1000, currency: "usd", created_at: createdAt, gumroad_fee: 0, refunded: false,
  });
  /** `n` sales spread over the eight days 2026-10-02 to 2026-10-09, sale i at a minute of its own. */
  const spread = (n: number, from = 0): FakeSale[] =>
    Array.from({ length: n }, (_, k) => {
      const i = from + k;
      return fakeSale(i, new Date(Date.parse("2026-10-02T00:00:00Z") + (i % 8) * DAY_MS + i * 60_000).toISOString());
    });

  /**
   * How the index might take `after` (a day): the recorded source says `created_at >= after` (sales_controller.rb:282)
   * and does not say in which zone the day starts, so the tests hold under each reading: the day's start in UTC; the day
   * excluded (the next day's start); the day's start at UTC−12, the furthest zone west.
   */
  type Reading = "inclusive" | "exclusive" | "west";
  const listedFrom = (after: string, reading: Reading): number =>
    reading === "inclusive" ? Date.parse(`${after}T00:00:00Z`)
      : reading === "exclusive" ? Date.parse(`${after}T00:00:00Z`) + DAY_MS
        : Date.parse(`${after}T12:00:00Z`);

  /**
   * A fake index over `sales` (read at each request, so a test can add a sale between syncs): pages of ten with
   * next_page_key, `success` on every answer (base_controller.rb:42-44), in either order since the recorded sources do
   * not say which the index uses. `refuse(page)` returning a status refuses that page. The listing is worked out once
   * per `after` and number of sales (a test adds sales, never changes one), so a listing of thousands is not re-sorted
   * at every page.
   */
  function gumroadIndex(sales: FakeSale[], opts: { reading?: Reading; order?: "asc" | "desc"; refuse?: (page: number) => number | null } = {}) {
    const { reading = "inclusive", order = "asc", refuse = () => null } = opts;
    const urls: URL[] = [];
    let memo: { key: string; listed: FakeSale[] } | null = null;
    const fetchImpl = (async (url: string | URL) => {
      const u = new URL(String(url));
      urls.push(u);
      const start = Number(u.searchParams.get("page_key") ?? 0);
      const status = refuse(start / 10 + 1);
      if (status !== null) return new Response(JSON.stringify({ success: false, message: "fake refusal" }), { status });
      const after = u.searchParams.get("after") ?? "";
      if (memo?.key !== `${after}|${sales.length}`) {
        const from = listedFrom(after, reading);
        memo = {
          key: `${after}|${sales.length}`,
          listed: sales
            .filter((s) => { const t = Date.parse(s.created_at); return Number.isNaN(t) || t >= from; })
            .sort((a, b) => (order === "asc" ? 1 : -1) * ((Date.parse(a.created_at) || 0) - (Date.parse(b.created_at) || 0))),
        };
      }
      const listed = memo.listed;
      const body: Record<string, unknown> = { success: true, sales: listed.slice(start, start + 10) };
      if (start + 10 < listed.length) body.next_page_key = String(start + 10);
      return new Response(JSON.stringify(body), { status: 200 });
    }) as typeof fetch;
    return { fetchImpl, urls };
  }

  let db: ReturnType<typeof createInMemoryDb>;
  beforeEach(() => {
    db = createInMemoryDb();
  });
  afterEach(() => {
    db.close();
  });
  const gumroadIds = (): string[] =>
    (db.prepare("SELECT external_id AS id FROM revenue_ledger WHERE source = 'gumroad' ORDER BY rowid").all() as { id: string }[]).map((r) => r.id);
  const digestOf = (s: FakeSale) => `sha256:${sha(s.id)}`;
  const sync = (fetchImpl: typeof fetch) => runLedgerSync(db, ENV, fetchImpl, NO_PRO);

  for (const order of ["asc", "desc"] as const) {
    it(`25 sales over three pages (${order}): every one booked once, the cursor at the newest sale's day`, async () => {
      setConnectorCursor(db, "gumroad", "2026-10-01");
      const sales = spread(25);
      const { fetchImpl, urls } = gumroadIndex(sales, { order });
      const result = await sync(fetchImpl);
      expect(result).toMatchObject({ recorded: 25, duplicates: 0, errors: [] });
      expect(gumroadIds().sort()).toEqual(sales.map(digestOf).sort());
      expect(getConnectorCursor(db, "gumroad")).toBe("2026-10-09");
      // Three requests, chained by page_key; every one from the day before the cursor, of every product, the token in
      // the query only.
      expect(urls.map((u) => u.searchParams.get("page_key"))).toEqual([null, "10", "20"]);
      for (const u of urls) {
        expect(u.origin + u.pathname).toBe("https://api.gumroad.com/v2/sales");
        expect(u.searchParams.get("after")).toBe("2026-09-30");
        expect(u.searchParams.has("product_id")).toBe(false);
        expect(u.searchParams.get("access_token")).toBe(TOKEN);
      }
    });
  }

  for (const reading of ["inclusive", "exclusive", "west"] as const) {
    it(`a sale made on the cursor's day after the last sync is booked at the next one (after read ${reading}), and the first not again`, async () => {
      setConnectorCursor(db, "gumroad", "2026-10-01");
      const sales = [fakeSale(1, "2026-10-05T01:00:00Z")];
      const { fetchImpl, urls } = gumroadIndex(sales, { reading });
      expect(await sync(fetchImpl)).toMatchObject({ recorded: 1, errors: [] });
      expect(getConnectorCursor(db, "gumroad")).toBe("2026-10-05");
      sales.push(fakeSale(2, "2026-10-05T03:00:00Z")); // two hours later, the same day
      const second = await sync(fetchImpl);
      expect(second).toMatchObject({ recorded: 1, duplicates: 1, errors: [] });
      expect(urls.at(-1)!.searchParams.get("after")).toBe("2026-10-04"); // the day before the cursor's
      expect(gumroadIds()).toEqual(sales.map(digestOf));
      expect(getConnectorCursor(db, "gumroad")).toBe("2026-10-05");
    });
  }

  for (const order of ["asc", "desc"] as const) {
    it(`page 2 refused (${order}): page 1 booked, the cursor kept, the sync says so; the next sync books the rest and none twice`, async () => {
      setConnectorCursor(db, "gumroad", "2026-10-01");
      const sales = spread(25);
      const refused = gumroadIndex(sales, { order, refuse: (page) => (page === 2 ? 500 : null) });
      const first = await sync(refused.fetchImpl);
      expect(refused.urls).toHaveLength(2);
      expect(first).toMatchObject({ recorded: 10, duplicates: 0 });
      expect(getConnectorCursor(db, "gumroad")).toBe("2026-10-01");
      expect(first.errors).toHaveLength(1);
      expect(first.errors[0]).toMatch(/^gumroad: the sales listing since 2026-09-30 was refused at page 2 \(HTTP 500\): the 10 sale\(s\) read before it stopped are booked .* the cursor stays at 2026-10-01/);
      for (const s of sales) expect(first.errors[0]).not.toContain(s.id);
      expect(first.errors[0]).not.toContain(TOKEN);

      const second = await sync(gumroadIndex(sales, { order }).fetchImpl);
      expect(second).toMatchObject({ recorded: 15, duplicates: 10, errors: [] });
      expect(gumroadIds().sort()).toEqual(sales.map(digestOf).sort());
      expect(new Set(gumroadIds()).size).toBe(25);
      expect(getConnectorCursor(db, "gumroad")).toBe("2026-10-09");
    });
  }

  // The tick-71 review (fix): the sync has its own page cap, well above the refund-rate read's, so a listing of more than
  // MAX_REFUND_RATE_PAGES pages since the day before the cursor is read to its end and the cursor moves on; past
  // MAX_LEDGER_SYNC_PAGES it still holds, as the next test pins (the cap's pin moved from MAX_REFUND_RATE_PAGES with it).
  it(`a listing of ${MAX_REFUND_RATE_PAGES + 5} pages is read to its end: the sync's own cap is ${MAX_LEDGER_SYNC_PAGES} pages`, async () => {
    expect(MAX_LEDGER_SYNC_PAGES).toBe(500);
    setConnectorCursor(db, "gumroad", "2026-10-01");
    const sales = spread((MAX_REFUND_RATE_PAGES + 5) * 10);
    const { fetchImpl, urls } = gumroadIndex(sales, { order: "desc" });
    expect(await sync(fetchImpl)).toMatchObject({ recorded: (MAX_REFUND_RATE_PAGES + 5) * 10, duplicates: 0, errors: [] });
    expect(urls).toHaveLength(MAX_REFUND_RATE_PAGES + 5);
    expect(new Set(gumroadIds()).size).toBe((MAX_REFUND_RATE_PAGES + 5) * 10);
    expect(getConnectorCursor(db, "gumroad")).toBe("2026-10-09");
  });

  it(`a listing longer than ${MAX_LEDGER_SYNC_PAGES} pages: the pages read booked, the cursor kept, said at every sync, and nothing booked twice`, async () => {
    setConnectorCursor(db, "gumroad", "2026-10-01");
    const sales = spread(MAX_LEDGER_SYNC_PAGES * 10 + 5);
    const { fetchImpl, urls } = gumroadIndex(sales, { order: "desc" });
    const first = await sync(fetchImpl);
    expect(urls).toHaveLength(MAX_LEDGER_SYNC_PAGES);
    expect(first).toMatchObject({ recorded: MAX_LEDGER_SYNC_PAGES * 10, duplicates: 0 });
    expect(getConnectorCursor(db, "gumroad")).toBe("2026-10-01");
    expect(first.errors).toHaveLength(1);
    expect(first.errors[0]).toMatch(
      new RegExp(`^gumroad: the sales listing since 2026-09-30 runs past ${MAX_LEDGER_SYNC_PAGES} pages: the ${MAX_LEDGER_SYNC_PAGES * 10} sale\\(s\\) read before it stopped are booked .* the cursor stays at 2026-10-01`),
    );
    expect(first.errors[0]).not.toContain(TOKEN);
    const second = await sync(fetchImpl);
    expect(second).toMatchObject({ recorded: 0, duplicates: MAX_LEDGER_SYNC_PAGES * 10 });
    expect(second.errors).toEqual(first.errors);
    expect(gumroadIds()).toHaveLength(MAX_LEDGER_SYNC_PAGES * 10);
    expect(new Set(gumroadIds()).size).toBe(MAX_LEDGER_SYNC_PAGES * 10);
    expect(getConnectorCursor(db, "gumroad")).toBe("2026-10-01");
  });

  it("a first read refused at page 1 keeps the window it asked for: the cursor is set to the day after its `after`", async () => {
    const { fetchImpl, urls } = gumroadIndex(spread(3), { refuse: () => 401 });
    const result = await sync(fetchImpl);
    expect(result.recorded).toBe(0);
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0]).toMatch(/^gumroad: the sales listing since \d{4}-\d{2}-\d{2} was refused at page 1 \(HTTP 401\): the 0 sale\(s\)/);
    const after = urls[0]!.searchParams.get("after")!;
    expect(getConnectorCursor(db, "gumroad")).toBe(new Date(Date.parse(`${after}T00:00:00Z`) + DAY_MS).toISOString().slice(0, 10));
  });

  it("no sale since the cursor leaves the cursor where it is (it never steps back to the day it asked from)", async () => {
    setConnectorCursor(db, "gumroad", "2026-10-05");
    const result = await sync(gumroadIndex([]).fetchImpl);
    expect(result).toMatchObject({ recorded: 0, errors: [] });
    expect(getConnectorCursor(db, "gumroad")).toBe("2026-10-05");
  });

  it("a sale whose created_at is not a day is booked, and never becomes the cursor", async () => {
    setConnectorCursor(db, "gumroad", "2026-10-01");
    const odd = fakeSale(7, "not-a-date");
    expect(await sync(gumroadIndex([odd]).fetchImpl)).toMatchObject({ recorded: 1, errors: [] });
    expect(getConnectorCursor(db, "gumroad")).toBe("2026-10-01");
    expect(await sync(gumroadIndex([odd, fakeSale(8, "2026-10-05T09:00:00Z")]).fetchImpl)).toMatchObject({ recorded: 1, duplicates: 1 });
    expect(getConnectorCursor(db, "gumroad")).toBe("2026-10-05");
  });

  // The tick-71 review (blocking): a created_at shaped like a day was enough to become the cursor. A date in the future
  // (2099-01-01) started every later listing past every real sale, silently and for good; "2026-13-45" made shiftDay
  // throw at every later sync, so nothing was booked again. A day becomes, or stays, the cursor only when it is a real
  // date no later than tomorrow in UTC (a created_at written east of UTC can be a day ahead). The clock (Date alone) is
  // pinned here so "tomorrow" is one fixed day.
  describe("a day becomes the cursor only when it is a real date no later than tomorrow (UTC)", () => {
    const NOW = "2026-10-11T12:00:00.000Z"; // tomorrow is 2026-10-12; the first read's cursor is 2026-09-11, its after 2026-09-10
    beforeEach(() => {
      vi.useFakeTimers({ toFake: ["Date"] });
      vi.setSystemTime(new Date(NOW));
    });
    afterEach(() => {
      vi.useRealTimers();
    });

    it("a sale created in the future is booked and does not move the cursor, and a later real sale is still booked", async () => {
      setConnectorCursor(db, "gumroad", "2026-10-01");
      const sales = [fakeSale(1, "2099-01-01T10:00:00Z")];
      const { fetchImpl, urls } = gumroadIndex(sales);
      expect(await sync(fetchImpl)).toMatchObject({ recorded: 1, errors: [] });
      expect(getConnectorCursor(db, "gumroad")).toBe("2026-10-01");
      sales.push(fakeSale(2, "2026-10-06T10:00:00Z"));
      expect(await sync(fetchImpl)).toMatchObject({ recorded: 1, duplicates: 1, errors: [] });
      expect(urls.at(-1)!.searchParams.get("after")).toBe("2026-09-30");
      expect(gumroadIds()).toEqual(sales.map(digestOf));
      expect(getConnectorCursor(db, "gumroad")).toBe("2026-10-06");
    });

    it("tomorrow's day (a created_at written east of UTC) moves the cursor; the day after tomorrow does not", async () => {
      setConnectorCursor(db, "gumroad", "2026-10-01");
      expect(await sync(gumroadIndex([fakeSale(1, "2026-10-13T00:30:00Z")]).fetchImpl)).toMatchObject({ recorded: 1, errors: [] });
      expect(getConnectorCursor(db, "gumroad")).toBe("2026-10-01");
      expect(await sync(gumroadIndex([fakeSale(2, "2026-10-12T09:00:00+14:00")]).fetchImpl)).toMatchObject({ recorded: 1, errors: [] });
      expect(getConnectorCursor(db, "gumroad")).toBe("2026-10-12");
    });

    // "2026-13-45" is no date at all; "2026-02-30" is one Date.parse accepts and rolls over to 2026-03-02.
    for (const odd of ["2026-13-45T10:00:00Z", "2026-02-30T10:00:00Z"]) {
      it(`a created_at shaped like a day that is no such date (${odd.slice(0, 10)}) is booked, never becomes the cursor, and the next sync runs`, async () => {
        setConnectorCursor(db, "gumroad", "2026-02-01");
        const sales = [fakeSale(1, odd)];
        const { fetchImpl } = gumroadIndex(sales);
        expect(await sync(fetchImpl)).toMatchObject({ recorded: 1, errors: [] });
        expect(getConnectorCursor(db, "gumroad")).toBe("2026-02-01");
        sales.push(fakeSale(2, "2026-10-06T10:00:00Z"));
        expect(await sync(fetchImpl)).toMatchObject({ recorded: 1, duplicates: 1, errors: [] });
        expect(gumroadIds()).toEqual(sales.map(digestOf));
        expect(getConnectorCursor(db, "gumroad")).toBe("2026-10-06");
      });
    }

    it("a first read, with no cursor, lists from 31 days back (its cursor 30 days back, less a day) and books every page", async () => {
      const before = fakeSale(0, "2026-09-09T23:59:00Z"); // the day before the window: the index does not list it
      const inside = Array.from({ length: 24 }, (_, i) => fakeSale(i + 1, new Date(Date.parse("2026-09-10T00:30:00Z") + i * DAY_MS).toISOString()));
      const { fetchImpl, urls } = gumroadIndex([before, ...inside], { order: "desc" });
      const result = await sync(fetchImpl);
      expect(urls.map((u) => u.searchParams.get("after"))).toEqual(["2026-09-10", "2026-09-10", "2026-09-10"]);
      expect(result).toMatchObject({ recorded: 24, duplicates: 0, errors: [] });
      expect(gumroadIds().sort()).toEqual(inside.map(digestOf).sort());
      expect(getConnectorCursor(db, "gumroad")).toBe("2026-10-03");
    });

    // A cursor stored by the code before this fix (or set by hand) that is no real day up to tomorrow: the sync reads
    // from the first read's window, moves the cursor to a real day, and says once what it did and what it cannot see.
    for (const stored of ["2026-13-45", "2099-01-01", "2026-02-30", "not-a-day"]) {
      it(`a stored cursor that is no real day up to tomorrow (${stored}) falls back to the first read's window, and the sync says so once`, async () => {
        setConnectorCursor(db, "gumroad", stored);
        const sales = [fakeSale(1, "2026-09-10T01:00:00Z"), fakeSale(2, "2026-10-06T10:00:00Z")];
        const { fetchImpl, urls } = gumroadIndex(sales);
        const first = await sync(fetchImpl);
        expect(urls.map((u) => u.searchParams.get("after"))).toEqual(["2026-09-10"]);
        expect(first).toMatchObject({ recorded: 2, duplicates: 0 });
        expect(first.errors).toEqual([
          `gumroad: the stored cursor "${stored}" is no real day up to tomorrow (UTC), so this sync read from 2026-09-10 as a ` +
            "first read does; a sale created before that day and not booked yet is not read",
        ]);
        expect(getConnectorCursor(db, "gumroad")).toBe("2026-10-06");
        expect(await sync(fetchImpl)).toMatchObject({ recorded: 0, duplicates: 1, errors: [] });
      });
    }

    it("a stored cursor replaced on a listing then refused part-way: both are said, in one error, and the window is kept", async () => {
      setConnectorCursor(db, "gumroad", "2099-01-01");
      const sales = Array.from({ length: 15 }, (_, i) => fakeSale(i, new Date(Date.parse("2026-09-20T10:00:00Z") + i * 3_600_000).toISOString()));
      const first = await sync(gumroadIndex(sales, { refuse: (page) => (page === 2 ? 500 : null) }).fetchImpl);
      expect(first).toMatchObject({ recorded: 10, duplicates: 0 });
      expect(first.errors).toEqual([
        'gumroad: the stored cursor "2099-01-01" is no real day up to tomorrow (UTC), so this sync read from 2026-09-10 as a ' +
          "first read does; a sale created before that day and not booked yet is not read; the sales listing since " +
          "2026-09-10 was refused at page 2 (HTTP 500): the 10 sale(s) read before it stopped are booked (one read again is " +
          "a duplicate), and the cursor stays at 2026-09-11, so no sale it did not read is passed; the next sync asks again " +
          "from the same day",
      ]);
      expect(getConnectorCursor(db, "gumroad")).toBe("2026-09-11");
      expect(await sync(gumroadIndex(sales).fetchImpl)).toMatchObject({ recorded: 5, duplicates: 10, errors: [] });
    });
  });

  // The tick-71 review (fix): a next_page_key that names a page already asked for was followed up to the cap, 100
  // requests a sync, the cursor held for good. The pager now stops at the repeat; the sync books what it read, keeps its
  // cursor and says so, after two requests.
  it("a listing whose next_page_key repeats: the pages read booked once, the cursor kept, the sync says so, in two requests", async () => {
    setConnectorCursor(db, "gumroad", "2026-10-01");
    const sales = spread(20);
    const urls: URL[] = [];
    const fetchImpl = (async (url: string | URL) => {
      const u = new URL(String(url));
      urls.push(u);
      const start = u.searchParams.has("page_key") ? 10 : 0;
      return new Response(JSON.stringify({ success: true, sales: sales.slice(start, start + 10), next_page_key: "fake-key-10" }), { status: 200 });
    }) as typeof fetch;
    const result = await sync(fetchImpl);
    expect(urls.map((u) => u.searchParams.get("page_key"))).toEqual([null, "fake-key-10"]);
    expect(result).toMatchObject({ recorded: 20, duplicates: 0 });
    expect(result.errors).toEqual([
      "gumroad: the sales listing since 2026-09-30 loops (page 2 names as its next a page already asked for): the 20 " +
        "sale(s) read before it stopped are booked (one read again is a duplicate), and the cursor stays at 2026-10-01, " +
        "so no sale it did not read is passed; the next sync asks again from the same day",
    ]);
    expect(getConnectorCursor(db, "gumroad")).toBe("2026-10-01");
    expect(new Set(gumroadIds()).size).toBe(20);
  });

  it("the incomplete listing reaches the tick's blockers as a ledger-sync error, as any connector's error does", async () => {
    setConnectorCursor(db, "gumroad", "2026-10-01");
    const { fetchImpl } = gumroadIndex(spread(25), { refuse: (page) => (page === 3 ? 500 : null) });
    const result = await tick(db, { nowIso: "2026-10-11T12:00:00.000Z", env: ENV, fetchImpl, ...NO_PRO, feedGoals: false });
    expect(result.ledgerSync?.recorded).toBe(20);
    expect(result.blockers.filter((b) => b.startsWith("ledger sync: gumroad: the sales listing since 2026-09-30 was refused at page 3 (HTTP 500)"))).toHaveLength(1);
  });
});

// The tick-71 review (fix): a next_page_key already asked for names a page already read, so following it would read the
// same pages again up to the cap. The pager stops there and says which page named it; the refund-rate read says so too.
describe("listGumroadSalesSince stops at a next_page_key it has already asked for (tick 71 review)", () => {
  /** Answers page `n` (1-based) with one sale and the n-th of `keys` as its next_page_key. */
  function keyed(keys: string[]) {
    const urls: URL[] = [];
    const fetchImpl = (async (url: string | URL) => {
      const u = new URL(String(url));
      urls.push(u);
      const n = urls.length;
      return new Response(JSON.stringify({ success: true, sales: [{ id: `fake-loop-${n}` }], next_page_key: keys[n - 1] }), { status: 200 });
    }) as typeof fetch;
    return { fetchImpl, urls };
  }

  it("a page that names its own key as the next: two requests, every answered page handed on, and no listing", async () => {
    const { fetchImpl, urls } = keyed(["fake-key-a", "fake-key-a", "fake-key-a"]);
    const seen: number[] = [];
    const listing = await listGumroadSalesSince({ token: "fake-token", after: "2026-09-01", fetchImpl, onPage: (_, page) => seen.push(page) });
    expect(listing).toEqual({ ok: false, problem: "looped", pages: 2 });
    expect(urls.map((u) => u.searchParams.get("page_key"))).toEqual([null, "fake-key-a"]);
    expect(seen).toEqual([1, 2]);
  });

  it("a key asked for two pages back (a, b, a) is a loop too", async () => {
    const { fetchImpl, urls } = keyed(["fake-key-a", "fake-key-b", "fake-key-a", "fake-key-b"]);
    expect(await listGumroadSalesSince({ token: "fake-token", after: "2026-09-01", fetchImpl })).toEqual({ ok: false, problem: "looped", pages: 3 });
    expect(urls.map((u) => u.searchParams.get("page_key"))).toEqual([null, "fake-key-a", "fake-key-b"]);
  });

  it("the refund-rate read on a looping listing writes no count, and says the listing loops", async () => {
    const { fetchImpl, urls } = keyed(["fake-key-a", "fake-key-a"]);
    expect(await readProRefundCount({ token: "fake-token", productId: "fake-pro", nowIso: "2026-10-11T12:00:00.000Z", fetchImpl })).toEqual({
      ok: false,
      detail: "GET /v2/sales for the Pro product loops (page 2 names as its next a page already asked for), so the count would not be complete",
    });
    expect(urls).toHaveLength(2);
  });
});

describe("listGumroadSalesSince hands each answered page to onPage (tick 71)", () => {
  it("in order, also when a later page is refused, and never a refused page", async () => {
    let n = 0;
    const fetchImpl = (async () => {
      n += 1;
      if (n <= 2) return new Response(JSON.stringify({ success: true, sales: [{ id: `p${n}a` }, { id: `p${n}b` }], next_page_key: String(n * 10) }), { status: 200 });
      return new Response(JSON.stringify({ success: false }), { status: 503 });
    }) as unknown as typeof fetch;
    const seen: [number, string[]][] = [];
    const listing = await listGumroadSalesSince({
      token: "fake-token", after: "2026-09-01", fetchImpl, onPage: (sales, page) => seen.push([page, (sales as { id: string }[]).map((s) => s.id)]),
    });
    expect(listing).toEqual({ ok: false, problem: "refused", status: 503, page: 3 });
    expect(seen).toEqual([[1, ["p1a", "p1b"]], [2, ["p2a", "p2b"]]]);
  });
});

// Tick 74 (CHANNEL_LOOP §9 tick-71 item 2, the late refund): `fetchSince` lists from the day before its cursor, so a sale
// is listed again only for about a day, and its refund was booked only when the refunded sale was listed again. A refund
// made later was never booked: the ledger kept money that went back to the buyer. The listing filters on `created_at >=
// after` (sales_controller.rb:282) and reports `refunded` as the purchase stands when it is read (`refunded:
// stripe_refunded`, purchase.rb:1052), so a sale is read again by listing from before it; and nothing recorded bounds when
// a refund can land (a refund refused for balance is retried "until it happens", RULING-2026-10-05-refund-state.md:282-283;
// Gumroad refunds at its own discretion, research/measurements/refund-law-il.md:122-128). So the sync also re-reads from the
// day before the oldest sale the ledger holds whose refund it does not, whenever its own listing starts after that day,
// and books the refunds it finds on the sales' own lines. Every booking goes through the real runLedgerSync and
// recordLedgerEntry; the clock (Date alone) is pinned per sync; no test reaches Gumroad, and every id and the token are
// invented.
describe("a refund made long after its sale is booked by the sync's re-read, once (tick 74)", () => {
  const TOKEN = "fake-token-T74";
  const ENV_A = { GUMROAD_ACCESS_TOKEN: TOKEN, GUMROAD_DEFAULT_LINE: "fake-line-a" };
  const ENV_B = { GUMROAD_ACCESS_TOKEN: TOKEN, GUMROAD_DEFAULT_LINE: "fake-line-b" };
  const NO_PRO = { proSiteDir: "/nonexistent/no-pro-site-t74" }; // no Pro product: the refund-rate read fetches nothing
  const DAY_MS = 86_400_000;

  type Sale = {
    id: string; product_id: string; price: number; currency: string; created_at: string; gumroad_fee: number;
    refunded: boolean; partially_refunded: boolean;
  };
  const sale = (n: number, createdAt: string): Sale => ({
    id: `fake-sale-t74-${n}`, product_id: "fake-product-t74", price: 7900, currency: "usd", created_at: createdAt, gumroad_fee: 0,
    refunded: false, partially_refunded: false,
  });

  /**
   * A fake index over `sales`, read at each request (a test flips `refunded` between syncs, as Gumroad's purchase row
   * changes), pages of ten in created order with next_page_key, `success` on every answer. `reading` is how it takes
   * `after`: the day's start in UTC, or the day excluded (the recorded source does not say which zone the day starts
   * in). For the `after` days named: `refuse` refuses page 1; `endless` names a next page for ever; `loop` names one key
   * twice.
   */
  function index(sales: Sale[], opts: { reading?: "inclusive" | "exclusive"; refuse?: string; endless?: string; loop?: string } = {}) {
    const urls: URL[] = [];
    const fetchImpl = (async (url: string | URL) => {
      const u = new URL(String(url));
      urls.push(u);
      const after = u.searchParams.get("after") ?? "";
      const key = u.searchParams.get("page_key");
      if (after === opts.refuse) return new Response(JSON.stringify({ success: false, message: "fake refusal" }), { status: 500 });
      const from = Date.parse(`${after}T00:00:00Z`) + (opts.reading === "exclusive" ? DAY_MS : 0);
      const listed = sales.filter((s) => Date.parse(s.created_at) >= from).sort((a, b) => Date.parse(a.created_at) - Date.parse(b.created_at));
      if (after === opts.loop) {
        return new Response(JSON.stringify({ success: true, sales: key ? [] : listed, next_page_key: "fake-key-t74" }), { status: 200 });
      }
      const start = Number(key ?? 0);
      const body: Record<string, unknown> = { success: true, sales: listed.slice(start, start + 10) };
      if (start + 10 < listed.length || after === opts.endless) body.next_page_key = String(start + 10);
      return new Response(JSON.stringify(body), { status: 200 });
    }) as typeof fetch;
    return { fetchImpl, urls };
  }

  let db: ReturnType<typeof createInMemoryDb>;
  beforeEach(() => {
    db = createInMemoryDb();
    vi.useFakeTimers({ toFake: ["Date"] });
  });
  afterEach(() => {
    vi.useRealTimers();
    db.close();
  });
  const at = (iso: string) => vi.setSystemTime(new Date(iso));
  const sync = (fetchImpl: typeof fetch, env: Record<string, string> = ENV_A) => runLedgerSync(db, env, fetchImpl, NO_PRO);
  type Row = { kind: string; lineId: string; amountMinor: number; externalId: string; occurredAt: string };
  const rows = (): Row[] =>
    db.prepare(
      `SELECT kind, line_id AS lineId, amount_minor AS amountMinor, external_id AS externalId, occurred_at AS occurredAt
       FROM revenue_ledger WHERE source = 'gumroad' ORDER BY rowid`,
    ).all() as Row[];
  const refundsOf = (s: Sale) => rows().filter((r) => r.externalId === `sha256:${sha(s.id)}:refund`);
  /** The `after` of each request since `from`, in order (page_key requests included). */
  const afters = (urls: URL[], from: number) => urls.slice(from).map((u) => u.searchParams.get("after"));

  /**
   * Sale 1 on 2026-10-01 (booked on fake-line-a), sale 2 on 2026-10-05 (booked on fake-line-b): from then on the cursor
   * is 2026-10-05 and the sync's own listing starts at 2026-10-04, past sale 1.
   */
  async function twoSalesBooked(opts: Parameters<typeof index>[1] = {}) {
    setConnectorCursor(db, "gumroad", "2026-09-30");
    const s1 = sale(1, "2026-10-01T10:00:00Z");
    const s2 = sale(2, "2026-10-05T09:00:00Z");
    const sales = [s1];
    const ix = index(sales, opts);
    at("2026-10-01T12:00:00Z");
    expect(await sync(ix.fetchImpl, ENV_A)).toMatchObject({ recorded: 1, duplicates: 0, errors: [] });
    at("2026-10-05T12:00:00Z");
    sales.push(s2);
    expect(await sync(ix.fetchImpl, ENV_B)).toMatchObject({ recorded: 1, errors: [] });
    expect(getConnectorCursor(db, "gumroad")).toBe("2026-10-05");
    return { s1, s2, sales, ...ix };
  }

  it("a sale booked on day 1 and refunded on day 10: the refund is booked at the next sync, on the sale's own line, once across later syncs, and the cursor never moves for it", async () => {
    const { s1, fetchImpl, urls } = await twoSalesBooked();
    at("2026-10-10T12:00:00Z");
    s1.refunded = true;
    const n = urls.length;
    const late = await sync(fetchImpl, ENV_B);
    // Sale 2 is listed again by the sync's own listing (a duplicate); sale 1's refund is the one new row.
    expect(late).toMatchObject({ recorded: 1, duplicates: 1, errors: [] });
    // The sync's own listing from the day before its cursor, then the re-read from the day before sale 1.
    expect(afters(urls, n)).toEqual(["2026-10-04", "2026-09-30"]);
    // Every product, the token in the query, as the sync's own listing asks.
    for (const u of urls.slice(n)) {
      expect(u.searchParams.get("access_token")).toBe(TOKEN);
      expect(u.searchParams.has("product_id")).toBe(false);
    }
    // What gumroadSaleEntries books for a refunded sale, on the line the sale was booked on (not today's default line).
    expect(refundsOf(s1)).toEqual([
      { kind: "refund", lineId: "fake-line-a", amountMinor: -7900, externalId: `sha256:${sha(s1.id)}:refund`, occurredAt: "2026-10-01T10:00:00.000Z" },
    ]);
    expect(getConnectorCursor(db, "gumroad")).toBe("2026-10-05");
    // verify-gumroad, which caught this only when someone ran it, now finds the ledger as Gumroad reports it.
    const verified = await verifyGumroadLedger(db, { token: TOKEN, fetchImpl });
    expect(verified).toMatchObject({ status: "clean", findings: 0, refundState: [], matchedRows: 3 });

    // Later syncs book nothing more; with sale 1's refund booked the only open sale is sale 2, which the sync's own
    // listing reaches, so nothing more is asked.
    for (const now of ["2026-10-11T12:00:00Z", "2026-11-20T12:00:00Z"]) {
      at(now);
      const m = urls.length;
      expect(await sync(fetchImpl, ENV_B)).toMatchObject({ recorded: 0, duplicates: 1, errors: [] });
      expect(afters(urls, m)).toEqual(["2026-10-04"]);
    }
    expect(refundsOf(s1)).toHaveLength(1);
    expect(rows()).toHaveLength(3);
    expect(getConnectorCursor(db, "gumroad")).toBe("2026-10-05");
  });

  it("a refund 200 days after its sale (past 183, Gumroad's longest refund period) is booked too: no window cuts the re-read short", async () => {
    setConnectorCursor(db, "gumroad", "2026-01-04");
    const s1 = sale(1, "2026-01-05T08:00:00Z");
    const sales = [s1];
    const { fetchImpl, urls } = index(sales);
    at("2026-01-05T12:00:00Z");
    expect(await sync(fetchImpl)).toMatchObject({ recorded: 1, errors: [] });
    at("2026-02-01T12:00:00Z");
    sales.push(sale(2, "2026-02-01T09:00:00Z"));
    expect(await sync(fetchImpl)).toMatchObject({ recorded: 1, errors: [] });
    at("2026-07-24T12:00:00Z"); // 200 days after sale 1
    s1.refunded = true;
    const n = urls.length;
    expect(await sync(fetchImpl)).toMatchObject({ recorded: 1, duplicates: 1, errors: [] });
    expect(afters(urls, n)).toEqual(["2026-01-31", "2026-01-04"]);
    expect(refundsOf(s1)).toHaveLength(1);
    expect(getConnectorCursor(db, "gumroad")).toBe("2026-02-01");
  });

  it("the re-read reaches the sales the ledger holds: a refunded sale it never booked is not booked, neither its refund nor itself", async () => {
    const { sales } = await twoSalesBooked();
    // A sale created on 2026-10-02 that Gumroad lists only now (CHANNEL_LOOP §9 tick-71 item 3), already refunded.
    const unbooked = { ...sale(3, "2026-10-02T10:00:00Z"), refunded: true };
    sales.push(unbooked);
    at("2026-10-10T12:00:00Z");
    const { fetchImpl, urls } = index(sales);
    expect(await sync(fetchImpl, ENV_B)).toMatchObject({ recorded: 0, duplicates: 1, errors: [] });
    expect(afters(urls, 0)).toEqual(["2026-10-04", "2026-09-30"]); // the re-read listed it
    expect(rows().map((r) => r.externalId)).not.toContain(`sha256:${sha(unbooked.id)}`);
    expect(refundsOf(unbooked)).toEqual([]);
    expect(rows()).toHaveLength(2);
  });

  it("a partial refund books nothing, as gumroadSaleEntries books nothing for one; the whole refund later is booked once", async () => {
    const { s1, fetchImpl, urls } = await twoSalesBooked();
    at("2026-10-08T12:00:00Z");
    s1.partially_refunded = true;
    const n = urls.length;
    expect(await sync(fetchImpl, ENV_B)).toMatchObject({ recorded: 0, duplicates: 1, errors: [] });
    expect(afters(urls, n)).toEqual(["2026-10-04", "2026-09-30"]);
    expect(refundsOf(s1)).toEqual([]);
    // Gumroad sets `refunded` once the refunds cover the whole charge, and `partially_refunded` never with it
    // (refundable.rb:317-318, :406-412, as gumroad.ts cites them).
    at("2026-10-20T12:00:00Z");
    s1.partially_refunded = false;
    s1.refunded = true;
    expect(await sync(fetchImpl, ENV_B)).toMatchObject({ recorded: 1, duplicates: 1, errors: [] });
    expect(await sync(fetchImpl, ENV_B)).toMatchObject({ recorded: 0, duplicates: 1, errors: [] });
    expect(refundsOf(s1)).toHaveLength(1);
  });

  it("a sale on the day the sync's own listing starts from is re-read too: whether the index lists that day is not recorded", async () => {
    // The index excludes the `after` day here. Sale 1 on 2026-10-04 is booked; once the cursor is 2026-10-05 the sync
    // lists from 2026-10-04, which this index does not list, so only the re-read (from 2026-10-03) reads sale 1 again.
    setConnectorCursor(db, "gumroad", "2026-10-03");
    const s1 = sale(1, "2026-10-04T10:00:00Z");
    const sales = [s1];
    const { fetchImpl, urls } = index(sales, { reading: "exclusive" });
    at("2026-10-04T12:00:00Z");
    expect(await sync(fetchImpl)).toMatchObject({ recorded: 1, errors: [] });
    at("2026-10-05T12:00:00Z");
    sales.push(sale(2, "2026-10-05T09:00:00Z"));
    expect(await sync(fetchImpl)).toMatchObject({ recorded: 1, errors: [] });
    expect(getConnectorCursor(db, "gumroad")).toBe("2026-10-05");
    at("2026-10-10T12:00:00Z");
    s1.refunded = true;
    const n = urls.length;
    expect(await sync(fetchImpl)).toMatchObject({ recorded: 1, duplicates: 1, errors: [] });
    expect(afters(urls, n)).toEqual(["2026-10-04", "2026-10-03"]);
    expect(refundsOf(s1)).toHaveLength(1);
  });

  it("a refused re-read is a gumroad: sync problem: the sync's own listing is booked, the cursor kept, and the next sync books the refund", async () => {
    const { s1, sales } = await twoSalesBooked();
    at("2026-10-10T12:00:00Z");
    s1.refunded = true;
    const refused = index(sales, { refuse: "2026-09-30" });
    const first = await sync(refused.fetchImpl, ENV_B);
    expect(first).toMatchObject({ recorded: 0, duplicates: 1 });
    expect(first.errors).toEqual([
      "gumroad: the late-refund re-read since 2026-09-30 was refused at page 1 (HTTP 500): the refunds among the 0 " +
        "sale(s) it read are booked (one booked already is a duplicate), and the cursor is not moved by it; a refund " +
        "on a sale it did not read is booked by a later sync's re-read, which asks again from the same day",
    ]);
    expect(refundsOf(s1)).toEqual([]);
    expect(getConnectorCursor(db, "gumroad")).toBe("2026-10-05");
    const second = await sync(index(sales).fetchImpl, ENV_B);
    expect(second).toMatchObject({ recorded: 1, duplicates: 1, errors: [] });
    expect(refundsOf(s1)).toHaveLength(1);
    expect(getConnectorCursor(db, "gumroad")).toBe("2026-10-05");
  });

  it(`a re-read longer than ${MAX_LEDGER_SYNC_PAGES} pages books the refunds it read and says where it stopped`, async () => {
    const { s1, sales } = await twoSalesBooked();
    at("2026-10-10T12:00:00Z");
    s1.refunded = true;
    const { fetchImpl, urls } = index(sales, { endless: "2026-09-30" });
    const result = await sync(fetchImpl, ENV_B);
    expect(afters(urls, 0).filter((a) => a === "2026-09-30")).toHaveLength(MAX_LEDGER_SYNC_PAGES);
    expect(result).toMatchObject({ recorded: 1, duplicates: 1 });
    expect(result.errors).toEqual([
      `gumroad: the late-refund re-read since 2026-09-30 runs past ${MAX_LEDGER_SYNC_PAGES} pages: the refunds among ` +
        "the 2 sale(s) it read are booked (one booked already is a duplicate), and the cursor is not moved by it; a " +
        `refund on a sale after page ${MAX_LEDGER_SYNC_PAGES} is not booked while the re-read runs past the cap`,
    ]);
    expect(result.errors[0]).not.toContain(TOKEN);
    for (const s of sales) expect(result.errors[0]).not.toContain(s.id);
    expect(refundsOf(s1)).toHaveLength(1);
    expect(getConnectorCursor(db, "gumroad")).toBe("2026-10-05");
  });

  it("the sync's own listing refused: the re-read runs all the same and books the late refund", async () => {
    const { s1, sales } = await twoSalesBooked();
    at("2026-10-10T12:00:00Z");
    s1.refunded = true;
    const { fetchImpl, urls } = index(sales, { refuse: "2026-10-04" });
    const result = await sync(fetchImpl, ENV_B);
    expect(afters(urls, 0)).toEqual(["2026-10-04", "2026-09-30"]);
    expect(result).toMatchObject({ recorded: 1, duplicates: 0 });
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0]).toMatch(/^gumroad: the sales listing since 2026-10-04 was refused at page 1 \(HTTP 500\)/);
    expect(refundsOf(s1)).toHaveLength(1);
    expect(getConnectorCursor(db, "gumroad")).toBe("2026-10-05");
  });

  it("a Gumroad sale booked by hand at a time Date.parse cannot read is left out of the reach, and the sync runs", async () => {
    insertLineFromSeed(db, {
      id: "fake-line-a", name: "T", category: "digital_product", tier: "growth", directorRole: "d", operatingLoop: "x",
      kpis: [], killCriteria: [], scaleCriteria: [], targetMonthlyAgorot: agorotFromIls(100), budgetMonthlyCents: 0, humanSetup: [], skillName: null,
    });
    expect(recordLedgerEntry(db, {
      lineId: "fake-line-a", kind: "sale", amountMinor: 7900, currency: "USD", source: "gumroad", externalId: "fake-hand-t74-1", occurredAt: "not-a-time",
    })).not.toBeNull();
    const { s1, fetchImpl, urls } = await twoSalesBooked();
    at("2026-10-10T12:00:00Z");
    s1.refunded = true;
    const n = urls.length;
    expect(await sync(fetchImpl, ENV_B)).toMatchObject({ recorded: 1, duplicates: 1, errors: [] });
    expect(afters(urls, n)).toEqual(["2026-10-04", "2026-09-30"]);
    expect(refundsOf(s1)).toHaveLength(1);
  });

  it("a re-read whose next_page_key repeats books what it read and says it loops", async () => {
    const { s1, sales } = await twoSalesBooked();
    at("2026-10-10T12:00:00Z");
    s1.refunded = true;
    const { fetchImpl, urls } = index(sales, { loop: "2026-09-30" });
    const result = await sync(fetchImpl, ENV_B);
    expect(afters(urls, 0)).toEqual(["2026-10-04", "2026-09-30", "2026-09-30"]);
    expect(result).toMatchObject({ recorded: 1, duplicates: 1 });
    expect(result.errors).toEqual([
      "gumroad: the late-refund re-read since 2026-09-30 loops (page 2 names as its next a page already asked for): " +
        "the refunds among the 2 sale(s) it read are booked (one booked already is a duplicate), and the cursor is not " +
        "moved by it; a refund on a sale it did not read is booked by a later sync's re-read, which asks again from the same day",
    ]);
    expect(refundsOf(s1)).toHaveLength(1);
  });

  // The tick-74 review's blocking finding (probe PC): revenue_record and `colony.ts record` date a row at now unless told
  // otherwise, so a Gumroad sale booked by hand days after Gumroad made it is dated after it, and every listing whose
  // reach is taken from that date starts after the sale. Its refund state is then read by no listing: the sync says so.
  /** Book a Gumroad sale by hand, as revenue_record does: the raw id (the ledger stores its digest) and a time given. */
  const bookByHand = (s: Sale, occurredAt: string, lineId = "fake-line-a") =>
    expect(recordLedgerEntry(db, {
      lineId, kind: "sale", amountMinor: s.price, currency: "USD", source: "gumroad", externalId: s.id, occurredAt,
    })).not.toBeNull();
  /** The sync's line for an open sale no complete listing returned although its reach covers the sale's ledger day. */
  const unlistedLine = (s: Sale, day: string, from: string) =>
    `gumroad: the sale sha256:${sha(s.id)}, dated ${day} in the ledger, is in no listing since ${from}, which reaches ` +
    "that day: its refund state cannot be read, so a refund of it is not booked (one way this happens is a sale booked " +
    "by hand days after Gumroad made it, dated at its booking). Check it with verify-gumroad; if Gumroad reports it " +
    `refunded, book the refund by hand as sha256:${sha(s.id)}:refund. Said at every sync while it has no refund row`;

  it("a sale booked by hand three days after Gumroad made it, then refunded: the re-read cannot reach it, and the sync says so at every sync, by its stored id and ledger day, until its refund is booked", async () => {
    setConnectorCursor(db, "gumroad", "2026-10-05");
    const hand = { ...sale(7, "2026-10-01T10:00:00Z"), refunded: true };
    bookByHand(hand, "2026-10-04T12:00:00.000Z");
    const { fetchImpl, urls } = index([hand]);
    at("2026-10-12T12:00:00Z");
    const first = await sync(fetchImpl);
    // The sync's own listing from 2026-10-04 and the re-read from 2026-10-03: both start after the sale.
    expect(afters(urls, 0)).toEqual(["2026-10-04", "2026-10-03"]);
    expect(first).toMatchObject({ recorded: 0, duplicates: 0 });
    expect(first.errors).toEqual([unlistedLine(hand, "2026-10-04", "2026-10-03")]);
    expect(first.errors[0]).not.toContain(hand.id);
    expect(first.errors[0]).not.toContain(TOKEN);
    expect(refundsOf(hand)).toEqual([]);
    expect(getConnectorCursor(db, "gumroad")).toBe("2026-10-05");

    // Nothing has changed at the next sync, so it is said again.
    at("2026-10-13T12:00:00Z");
    expect((await sync(fetchImpl)).errors).toEqual([unlistedLine(hand, "2026-10-04", "2026-10-03")]);

    // Its refund booked by hand under the stored form the line names: the sale is closed, nothing is re-read or said.
    expect(recordLedgerEntry(db, {
      lineId: "fake-line-a", kind: "refund", amountMinor: hand.price, currency: "USD", source: "gumroad",
      externalId: `sha256:${sha(hand.id)}:refund`, occurredAt: "2026-10-13T12:00:00.000Z",
    })).not.toBeNull();
    const m = urls.length;
    expect(await sync(fetchImpl)).toMatchObject({ recorded: 0, duplicates: 0, errors: [] });
    expect(afters(urls, m)).toEqual(["2026-10-04"]);
    expect(refundsOf(hand)).toHaveLength(1);
  });

  it("the same hand-booked sale as the only open one, dated where the sync's own listing reaches it: no re-read is asked, and the sync says so all the same", async () => {
    setConnectorCursor(db, "gumroad", "2026-10-04");
    const hand = { ...sale(8, "2026-10-01T10:00:00Z"), refunded: true };
    bookByHand(hand, "2026-10-04T12:00:00.000Z");
    const { fetchImpl, urls } = index([hand]);
    at("2026-10-12T12:00:00Z");
    const result = await sync(fetchImpl);
    // The re-read would start on 2026-10-03, the sync's own `after`, so it is not asked (T74-G1).
    expect(afters(urls, 0)).toEqual(["2026-10-03"]);
    expect(result).toMatchObject({ recorded: 0, duplicates: 0 });
    expect(result.errors).toEqual([unlistedLine(hand, "2026-10-04", "2026-10-03")]);
    expect(refundsOf(hand)).toEqual([]);
  });
});
