import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { createHash } from "node:crypto";
import type BetterSqlite3 from "better-sqlite3";
import { createInMemoryDb } from "../orchestration/test-db.js";
import { insertLineFromSeed, recordLedgerEntry } from "../../revenue/ledger.js";
import { agorotFromIls } from "../../revenue/money.js";
import { renderGumroadVerify, verifyGumroadLedger } from "../../revenue/gumroad-verify.js";

// RULING-2026-10-11-ledger-sale-ids.md C3 (decision 2 item 8, fold 6): the re-derivation as code. It lists the account's
// sales with the token, digests each id, and matches the ledger's Gumroad rows; it prints counts, stored forms and days,
// never a raw id, an email or the token. Every id and the token below are invented; no test reaches Gumroad.

const TOKEN = "fake-token-Zx9";
const sha = (text: string) => `sha256:${createHash("sha256").update(text, "utf8").digest("hex")}`;
const DAY = "2026-10-05";
const AT = `${DAY}T09:30:00Z`;

type FakeSale = { id: string; price: number; currency: string; created_at: string; refunded: boolean; gumroad_fee: number; email?: string };
const sale = (id: string, over: Partial<FakeSale> = {}): FakeSale => ({
  id, price: 7900, currency: "usd", created_at: AT, refunded: false, gumroad_fee: 0, email: "fake-buyer-email-field", ...over,
});

/** The index as the connector's header reads it: `created_at >= after` (sales_controller.rb:282), ten a page, page_key. */
function fakeIndex(sales: FakeSale[]): { fetchImpl: typeof fetch; urls: URL[] } {
  const urls: URL[] = [];
  const fetchImpl = (async (url: string | URL) => {
    const u = new URL(String(url));
    urls.push(u);
    // A listing that starts too late drops the older sales, as the real index does. A sale with no readable created_at
    // is listed whatever the filter, so the test that gives one can reach the comparison.
    const after = u.searchParams.get("after") ?? "";
    const since = sales.filter((s) => Number.isNaN(Date.parse(s.created_at)) || new Date(s.created_at).toISOString().slice(0, 10) >= after);
    const start = Number(u.searchParams.get("page_key") ?? 0);
    const body: Record<string, unknown> = { success: true, sales: since.slice(start, start + 10) };
    if (start + 10 < since.length) body.next_page_key = String(start + 10);
    return new Response(JSON.stringify(body), { status: 200 });
  }) as typeof fetch;
  return { fetchImpl, urls };
}

describe("verifyGumroadLedger: the ledger's Gumroad rows against the account's own listing", () => {
  let db: BetterSqlite3.Database;
  beforeEach(() => {
    db = createInMemoryDb();
    insertLineFromSeed(db, {
      id: "il-biz-tools", name: "T", category: "digital_product", tier: "growth", directorRole: "d", operatingLoop: "x",
      kpis: [], killCriteria: [], scaleCriteria: [], targetMonthlyAgorot: agorotFromIls(100), budgetMonthlyCents: 0, humanSetup: [], skillName: null,
    });
  });
  afterEach(() => {
    db.close();
  });

  const book = (externalId: string, over: Partial<Parameters<typeof recordLedgerEntry>[1]> = {}) =>
    recordLedgerEntry(db, { lineId: "il-biz-tools", kind: "sale", amountMinor: 7900, currency: "USD", source: "gumroad", externalId, occurredAt: AT, ...over });
  const run = (sales: FakeSale[], token: string | null = TOKEN) => {
    const fake = fakeIndex(sales);
    return { fake, result: verifyGumroadLedger(db, { token: token ?? undefined, fetchImpl: fake.fetchImpl, nowIso: "2026-10-11T12:00:00Z" }) };
  };
  /** Nothing the command prints names a raw id, an email or the token. */
  const clean = (text: string, ...raw: string[]) => {
    for (const r of [...raw, TOKEN, "fake-buyer-email-field"]) expect(text).not.toContain(r);
  };

  it("without the token: not configured, and nothing is fetched", async () => {
    book("fake-s1");
    const { fake, result } = run([sale("fake-s1")], null);
    expect(await result).toMatchObject({ status: "not_configured", after: null, ledgerRows: 1, findings: 0 });
    expect(fake.urls).toHaveLength(0);
    expect(renderGumroadVerify(await result)).toContain("not configured");
  });

  it("a booked sale, its refund and its fee, all listed: clean, matched by digest, from a day before the oldest row", async () => {
    book("fake-s1");
    book("fake-s1:refund", { kind: "refund" });
    book("fake-s1:fee", { kind: "cost", amountMinor: 790 });
    // Rows of other sources, older than every Gumroad row, are neither compared nor where the listing starts.
    book("fake-stripe-1", { source: "stripe", occurredAt: "2026-09-20T10:00:00Z" });
    book("fake-manual-1", { source: "manual", occurredAt: "2026-09-21T10:00:00Z" });
    const { fake, result } = run([sale("fake-s1", { refunded: true, gumroad_fee: 790 })]);
    const r = await result;
    expect(r).toMatchObject({ status: "clean", ledgerRows: 3, listedSales: 1, matchedRows: 3, findings: 0, after: "2026-10-04", pages: 1 });
    expect([...r.unexplained, ...r.differing, ...r.refundState, ...r.unbooked]).toEqual([]);
    expect(fake.urls[0]!.searchParams.get("after")).toBe("2026-10-04");
    clean(renderGumroadVerify(r) + JSON.stringify(r), "fake-s1");
  });

  it("rows on two days: the listing starts a day before the older one, so both sales are listed and match", async () => {
    book("fake-new");
    book("fake-old", { occurredAt: "2026-10-02T08:00:00Z" });
    const { fake, result } = run([sale("fake-old", { created_at: "2026-10-02T08:00:00Z" }), sale("fake-new")]);
    expect(await result).toMatchObject({ status: "clean", after: "2026-10-01", ledgerRows: 2, listedSales: 2, matchedRows: 2, findings: 0 });
    expect(fake.urls[0]!.searchParams.get("after")).toBe("2026-10-01");
  });

  it("a row booked with a zone offset is compared on its UTC day, and the listing starts a day before that", async () => {
    book("fake-s1", { occurredAt: "2026-10-05T01:00:00+03:00" });
    const { fake, result } = run([sale("fake-s1", { created_at: "2026-10-04T22:00:00Z" })]);
    expect(await result).toMatchObject({ status: "clean", after: "2026-10-03", matchedRows: 1, differing: [], findings: 0 });
    expect(fake.urls[0]!.searchParams.get("after")).toBe("2026-10-03");
  });

  it("a sale whose created_at cannot be read is matched on amount and currency, with no day to compare", async () => {
    book("fake-s1");
    const r = await run([sale("fake-s1", { created_at: "not-a-date" })]).result;
    expect(r).toMatchObject({ status: "clean", matchedRows: 1, differing: [], findings: 0 });
  });

  it("a row no listed sale explains is a finding, named by its stored form only", async () => {
    book("fake-s1");
    book("fake-extra");
    const r = await run([sale("fake-s1")]).result;
    expect(r.status).toBe("findings");
    expect(r.unexplained).toEqual([{ externalId: sha("fake-extra"), day: DAY }]);
    expect(r.findings).toBe(1);
    const text = renderGumroadVerify(r);
    expect(text).toContain(`- unexplained: ${sha("fake-extra")} ${DAY}`);
    expect(text).toContain("Findings: 1.");
    clean(text + JSON.stringify(r), "fake-s1", "fake-extra");
  });

  it("a matched row whose amount, currency or day differs is a finding, with the fields that differ", async () => {
    book("fake-s1", { amountMinor: 7000 });
    book("fake-s2", { currency: "EUR" });
    book("fake-s3", { occurredAt: "2026-10-07T00:00:00Z" });
    book("fake-s4");
    const r = await run([sale("fake-s1"), sale("fake-s2"), sale("fake-s3"), sale("fake-s4")]).result;
    expect(r.differing).toEqual([
      { externalId: sha("fake-s1"), day: DAY, fields: ["amount"] },
      { externalId: sha("fake-s2"), day: DAY, fields: ["currency"] },
      { externalId: sha("fake-s3"), day: "2026-10-07", fields: ["day"] },
    ]);
    expect(r).toMatchObject({ matchedRows: 4, findings: 3, status: "findings" });
  });

  it("a booked sale whose fee row is missing differs; a fee row for a sale with no fee is unexplained", async () => {
    book("fake-s1");
    book("fake-s2");
    book("fake-s2:fee", { kind: "cost", amountMinor: 50 });
    const r = await run([sale("fake-s1", { gumroad_fee: 790 }), sale("fake-s2")]).result;
    expect(r.differing).toEqual([{ externalId: `${sha("fake-s1")}:fee`, day: DAY, fields: ["fee row missing"] }]);
    expect(r.unexplained).toEqual([{ externalId: `${sha("fake-s2")}:fee`, day: DAY }]);
    expect(r.findings).toBe(2);
  });

  it("a refund row whose sale is not refunded, and a refunded sale with no refund row, are findings", async () => {
    book("fake-s1");
    book("fake-s1:refund", { kind: "refund" });
    book("fake-s2");
    const r = await run([sale("fake-s1", { refunded: false }), sale("fake-s2", { refunded: true })]).result;
    expect(r.refundState).toEqual([
      { externalId: `${sha("fake-s1")}:refund`, day: DAY, problem: "a refund row whose sale Gumroad does not report refunded" },
      { externalId: `${sha("fake-s2")}:refund`, day: DAY, problem: "a refunded sale with no refund row" },
    ]);
    expect(r.unexplained).toEqual([]);
    expect(r).toMatchObject({ findings: 2, status: "findings" });
  });

  it("a refund row whose sale is not listed at all is unexplained, not a refund-state finding", async () => {
    book("fake-s1");
    book("fake-gone:refund", { kind: "refund" });
    const r = await run([sale("fake-s1")]).result;
    expect(r.unexplained).toEqual([{ externalId: `${sha("fake-gone")}:refund`, day: DAY }]);
    expect(r.refundState).toEqual([]);
    expect(r).toMatchObject({ findings: 1, status: "findings" });
  });

  it("a listed sale no row books is counted, not a finding, and its refund and fee are not counted twice", async () => {
    book("fake-s1");
    const r = await run([sale("fake-s1"), sale("fake-s9", { refunded: true, gumroad_fee: 790 })]).result;
    expect(r.unbooked).toEqual([{ externalId: sha("fake-s9"), day: DAY }]);
    expect(r).toMatchObject({ status: "clean", findings: 0, listedSales: 2 });
    expect(renderGumroadVerify(r)).toContain("listed sales no row books (unbooked; a count, not a finding): 1");
  });

  it("a raw id that reached the ledger by SQL is matched and printed by its digest; a row with no id is unexplained", async () => {
    db.prepare(
      `INSERT INTO revenue_ledger (id, line_id, kind, amount_minor, currency, amount_agorot, source, external_id, occurred_at, recorded_at, note)
       VALUES ('r1', 'il-biz-tools', 'sale', 7900, 'USD', 28440, 'gumroad', 'fake-raw-1', ?, ?, NULL),
              ('r2', 'il-biz-tools', 'cost', -100, 'USD', -360, 'gumroad', NULL, ?, ?, NULL)`,
    ).run(AT, AT, AT, AT);
    const r = await run([sale("fake-raw-1")]).result;
    expect(r.matchedRows).toBe(1);
    expect(r.unexplained).toEqual([{ externalId: null, day: DAY }]);
    clean(renderGumroadVerify(r) + JSON.stringify(r), "fake-raw-1");
  });

  it("with no Gumroad row the listing starts where the connector's first read does, 31 days back", async () => {
    const { fake, result } = run([sale("fake-s1")]);
    expect(await result).toMatchObject({ status: "clean", after: "2026-09-10", unbooked: [{ externalId: sha("fake-s1"), day: DAY }] });
    expect(fake.urls[0]!.searchParams.get("after")).toBe("2026-09-10");
  });

  it("pages to the end: a sale on the third page matches", async () => {
    const sales = Array.from({ length: 25 }, (_, i) => sale(`fake-p${i}`));
    book("fake-p24");
    const { fake, result } = run(sales);
    expect(await result).toMatchObject({ status: "clean", matchedRows: 1, pages: 3, listedSales: 25 });
    expect(fake.urls).toHaveLength(3);
  });

  it("a refused listing is incomplete: nothing verified, the status and page named, no token in the line", async () => {
    book("fake-s1");
    const fetchImpl = (async () => new Response(JSON.stringify({ success: false }), { status: 401 })) as unknown as typeof fetch;
    const r = await verifyGumroadLedger(db, { token: TOKEN, fetchImpl });
    expect(r).toMatchObject({ status: "incomplete", findings: 0, matchedRows: 0 });
    expect(r.detail).toContain("HTTP 401, page 1");
    clean(renderGumroadVerify(r) + JSON.stringify(r), "fake-s1");
  });
});

// Tick 71 (CHANNEL_LOOP §9 tick-69 item 2): the listing runs from a day before the oldest Gumroad row, so it only grows,
// and past the pager's cap (MAX_REFUND_RATE_PAGES pages of ten) the command says "incomplete". No recorded source shows
// an upper bound the index accepts, or the order it lists sales in, so the window is not cut into chunks: the result
// names exactly the part read (pages, sales, the days they were created on) and the part not read, and verifies nothing.
describe("verifyGumroadLedger on a listing it could not read to the end: what was read and what was not, exactly", () => {
  let db: BetterSqlite3.Database;
  beforeEach(() => {
    db = createInMemoryDb();
    insertLineFromSeed(db, {
      id: "il-biz-tools", name: "T", category: "digital_product", tier: "growth", directorRole: "d", operatingLoop: "x",
      kpis: [], killCriteria: [], scaleCriteria: [], targetMonthlyAgorot: agorotFromIls(100), budgetMonthlyCents: 0, humanSetup: [], skillName: null,
    });
    // The ledger's oldest Gumroad row is on 2026-09-01, so the listing starts on 2026-08-31.
    recordLedgerEntry(db, { lineId: "il-biz-tools", kind: "sale", amountMinor: 7900, currency: "USD", source: "gumroad", externalId: "fake-v-0", occurredAt: "2026-09-01T10:00:00Z" });
  });
  afterEach(() => {
    db.close();
  });

  /** `n` sales, one every half hour from 2026-09-01T10:00Z on, listed NEWEST first; page `refusePage` (if any) refused with 500. */
  function index(n: number, refusePage?: number) {
    const sales = Array.from({ length: n }, (_, i) => sale(`fake-v-${i}`, { created_at: new Date(Date.parse("2026-09-01T10:00:00Z") + i * 1_800_000).toISOString() })).reverse();
    const urls: URL[] = [];
    const fetchImpl = (async (url: string | URL) => {
      const u = new URL(String(url));
      urls.push(u);
      const start = Number(u.searchParams.get("page_key") ?? 0);
      if (refusePage !== undefined && start / 10 + 1 === refusePage) return new Response(JSON.stringify({ success: false }), { status: 500 });
      const body: Record<string, unknown> = { success: true, sales: sales.slice(start, start + 10) };
      if (start + 10 < sales.length) body.next_page_key = String(start + 10);
      return new Response(JSON.stringify(body), { status: 200 });
    }) as typeof fetch;
    return { sales, fetchImpl, urls };
  }
  const verify = (fetchImpl: typeof fetch) => verifyGumroadLedger(db, { token: TOKEN, fetchImpl, nowIso: "2026-10-11T12:00:00Z" });
  /** Nothing the command prints names a raw id, an email or the token (as the first describe's `clean`). */
  const clean = (text: string, ...raw: string[]) => {
    for (const r of [...raw, TOKEN, "fake-buyer-email-field"]) expect(text).not.toContain(r);
  };
  const dayOfSale = (s: FakeSale) => s.created_at.slice(0, 10);

  it("a window longer than the page cap: incomplete, nothing verified, the 100 pages read and their days named, the rest not", async () => {
    const { sales, fetchImpl, urls } = index(1005);
    const r = await verify(fetchImpl);
    expect(urls).toHaveLength(100);
    expect(urls[0]!.searchParams.get("after")).toBe("2026-08-31");
    // Read: the first 1,000 the index listed, newest first here, so the sixth to the 1,005th sale, and not the five oldest.
    const readDays = sales.slice(0, 1000).map(dayOfSale).sort();
    expect(readDays[0]).toBe("2026-09-01");
    expect(readDays.at(-1)).toBe("2026-09-22");
    expect(r).toMatchObject({ status: "incomplete", after: "2026-08-31", pages: 0, listedSales: 0, matchedRows: 0, findings: 0, unbooked: [], unexplained: [] });
    expect(r.readBeforeStop).toEqual({ pages: 100, sales: 1000, earliestDay: "2026-09-01", latestDay: "2026-09-22" });
    expect(r.detail).toBe(
      "more than 100 pages of sales since 2026-08-31. Read: 100 page(s), 1000 sale(s), created 2026-09-01 to 2026-09-22; " +
        "not read: every page after page 100. Which days the unread pages' sales fall on is not known (the order the index " +
        "lists sales in is not recorded), so nothing was verified",
    );
    const text = renderGumroadVerify(r);
    expect(text).toContain(`incomplete — ${r.detail}.`);
    clean(text + JSON.stringify(r), "fake-v-0", "fake-v-5");
  });

  it("page 2 refused: page 1 named as read, page 2 and after as not read", async () => {
    const { fetchImpl } = index(25, 2);
    const r = await verify(fetchImpl);
    expect(r).toMatchObject({ status: "incomplete", findings: 0, matchedRows: 0 });
    expect(r.readBeforeStop).toEqual({ pages: 1, sales: 10, earliestDay: "2026-09-01", latestDay: "2026-09-01" });
    expect(r.detail).toBe(
      "GET /v2/sales was refused (HTTP 500, page 2). Read: 1 page(s), 10 sale(s), created 2026-09-01 to 2026-09-01; " +
        "not read: page 2 and any page after it. Which days the unread pages' sales fall on is not known (the order the " +
        "index lists sales in is not recorded), so nothing was verified",
    );
  });

  it("page 1 refused: nothing read, and it says so", async () => {
    const r = await verify(index(25, 1).fetchImpl);
    expect(r.readBeforeStop).toEqual({ pages: 0, sales: 0, earliestDay: null, latestDay: null });
    expect(r.detail).toContain("GET /v2/sales was refused (HTTP 500, page 1). Read: 0 page(s), 0 sale(s); not read: page 1 and any page after it.");
  });

  // The tick-71 review (fix): the shared pager stops at a next_page_key it has already asked for.
  it("a listing whose next_page_key repeats: incomplete, the two pages read named, the rest not", async () => {
    const { sales } = index(25);
    const urls: URL[] = [];
    const fetchImpl = (async (url: string | URL) => {
      const u = new URL(String(url));
      urls.push(u);
      const start = u.searchParams.has("page_key") ? 10 : 0;
      return new Response(JSON.stringify({ success: true, sales: sales.slice(start, start + 10), next_page_key: "fake-key-10" }), { status: 200 });
    }) as typeof fetch;
    const r = await verify(fetchImpl);
    expect(urls).toHaveLength(2);
    expect(r).toMatchObject({ status: "incomplete", pages: 0, listedSales: 0, matchedRows: 0, findings: 0 });
    expect(r.readBeforeStop).toEqual({ pages: 2, sales: 20, earliestDay: "2026-09-01", latestDay: "2026-09-01" });
    expect(r.detail).toBe(
      "GET /v2/sales loops (page 2 names as its next a page already asked for). Read: 2 page(s), 20 sale(s), created " +
        "2026-09-01 to 2026-09-01; not read: every page after page 2. Which days the unread pages' sales fall on is not " +
        "known (the order the index lists sales in is not recorded), so nothing was verified",
    );
  });

  it("a complete listing names no part read before a stop", async () => {
    const r = await verify(index(25).fetchImpl);
    expect(r).toMatchObject({ status: "clean", pages: 3, listedSales: 25, readBeforeStop: null });
  });
});
