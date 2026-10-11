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

function fakeIndex(sales: FakeSale[]): { fetchImpl: typeof fetch; urls: URL[] } {
  const urls: URL[] = [];
  const fetchImpl = (async (url: string | URL) => {
    const u = new URL(String(url));
    urls.push(u);
    const start = Number(u.searchParams.get("page_key") ?? 0);
    const body: Record<string, unknown> = { success: true, sales: sales.slice(start, start + 10) };
    if (start + 10 < sales.length) body.next_page_key = String(start + 10);
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
    const { fake, result } = run([sale("fake-s1", { refunded: true, gumroad_fee: 790 })]);
    const r = await result;
    expect(r).toMatchObject({ status: "clean", ledgerRows: 3, listedSales: 1, matchedRows: 3, findings: 0, after: "2026-10-04", pages: 1 });
    expect([...r.unexplained, ...r.differing, ...r.refundState, ...r.unbooked]).toEqual([]);
    expect(fake.urls[0]!.searchParams.get("after")).toBe("2026-10-04");
    clean(renderGumroadVerify(r) + JSON.stringify(r), "fake-s1");
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
