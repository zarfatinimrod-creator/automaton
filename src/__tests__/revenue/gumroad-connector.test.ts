import { describe, it, expect } from "vitest";
import { createHash } from "node:crypto";
import { createInMemoryDb } from "../orchestration/test-db.js";
import { insertLineFromSeed, recordLedgerEntry } from "../../revenue/ledger.js";
import { agorotFromIls, isStoredForm, storedExternalId, STORED_EXTERNAL_ID_RE } from "../../revenue/money.js";
import { gumroadConnector, gumroadSaleEntries, listGumroadSalesSince, MAX_REFUND_RATE_PAGES } from "../../revenue/connectors/gumroad.js";

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
