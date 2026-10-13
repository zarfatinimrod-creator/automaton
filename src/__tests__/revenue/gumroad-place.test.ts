import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { createHash } from "node:crypto";
import { createInMemoryDb } from "../orchestration/test-db.js";
import { recordLedgerEntry, setConnectorCursor, sumWindow } from "../../revenue/ledger.js";
import { runLedgerSync } from "../../revenue/heartbeat.js";
import { verifyGumroadLedger } from "../../revenue/gumroad-verify.js";
import { isListingDay, placeGumroadSale } from "../../revenue/gumroad-place.js";

// RULING-2026-10-13-gumroad-refund-reread.md §3 item 3 (fold 6, FABLE_QUEUE row 32; tick 77): a Gumroad sale booked by
// hand days after Gumroad made it, dated at its booking, lies where no listing returns it, and the sync says so at every
// sync. `placeGumroadSale` places it on the day Gumroad made it, from Gumroad's own listing: the row's occurred_at, and
// its :refund and :fee rows', become the created_at of the one listed sale whose digest is the row's stored id. Case (g)
// runs through the real runLedgerSync over the tick-74 suite's fake index: after the placement the next re-read lists from
// the day before Gumroad's day, returns the sale, and the sync says nothing. No test reaches Gumroad; every id and token
// is invented.

const sha = (text: string) => createHash("sha256").update(text, "utf8").digest("hex");
const TOKEN = "fake-token-T77g";
const ENV_A = { GUMROAD_ACCESS_TOKEN: TOKEN, GUMROAD_DEFAULT_LINE: "fake-line-a" };
const NO_PRO = { proSiteDir: "/nonexistent/no-pro-site-t77" }; // no Pro product: the refund-rate read fetches nothing
const ADDRESS = "fake-buyer-email-field-t77";

type Sale = {
  id: string; product_id: string; price: number; currency: string; created_at: string; gumroad_fee: number;
  refunded: boolean; partially_refunded: boolean; email: string;
};
const sale = (n: number, createdAt: string, over: Partial<Sale> = {}): Sale => ({
  id: `fake-sale-t77-${n}`, product_id: "fake-product-t77", price: 7900, currency: "usd", created_at: createdAt, gumroad_fee: 0,
  refunded: false, partially_refunded: false, email: ADDRESS, ...over,
});
const storedOf = (s: Sale) => `sha256:${sha(s.id)}`;

/**
 * The tick-74 suite's fake index: `sales` read at each request (a test flips `refunded` between syncs), pages of ten in
 * created order with next_page_key, `success` on every answer, `created_at >= after` from the day's start in UTC. For
 * the `after` days named: `refuse` refuses page 1; `endless` names a next page for ever; `loop` names one key twice;
 * `refusePage` refuses that page of any listing.
 */
function index(sales: Sale[], opts: { refuse?: string; endless?: string; loop?: string; refusePage?: number } = {}) {
  const urls: URL[] = [];
  const fetchImpl = (async (url: string | URL) => {
    const u = new URL(String(url));
    urls.push(u);
    const after = u.searchParams.get("after") ?? "";
    const key = u.searchParams.get("page_key");
    const start = Number(key ?? 0);
    if (after === opts.refuse || (opts.refusePage !== undefined && start / 10 + 1 === opts.refusePage)) {
      return new Response(JSON.stringify({ success: false, message: "fake refusal" }), { status: 500 });
    }
    const listed = sales.filter((s) => Date.parse(s.created_at) >= Date.parse(`${after}T00:00:00Z`))
      .sort((a, b) => Date.parse(a.created_at) - Date.parse(b.created_at));
    if (after === opts.loop) {
      return new Response(JSON.stringify({ success: true, sales: key ? [] : listed, next_page_key: "fake-key-t77" }), { status: 200 });
    }
    const body: Record<string, unknown> = { success: true, sales: listed.slice(start, start + 10) };
    if (start + 10 < listed.length || after === opts.endless) body.next_page_key = String(start + 10);
    return new Response(JSON.stringify(body), { status: 200 });
  }) as typeof fetch;
  return { fetchImpl, urls };
}
/** A fetch no test may reach: placeGumroadSale refuses before it lists. */
const noFetch = (() => { throw new Error("fake-fetch-t77: no request may be made"); }) as unknown as typeof fetch;
/** The `after` of each request since `from`, in order (page_key requests included). */
const afters = (urls: URL[], from = 0) => urls.slice(from).map((u) => u.searchParams.get("after"));

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
const sync = (fetchImpl: typeof fetch) => runLedgerSync(db, ENV_A, fetchImpl, NO_PRO);
type Row = { kind: string; lineId: string; source: string; amountMinor: number; externalId: string; occurredAt: string };
const rows = (): Row[] =>
  db.prepare(
    `SELECT kind, line_id AS lineId, source, amount_minor AS amountMinor, external_id AS externalId, occurred_at AS occurredAt
     FROM revenue_ledger ORDER BY rowid`,
  ).all() as Row[];
const refundsOf = (s: Sale) => rows().filter((r) => r.externalId === `${storedOf(s)}:refund`);
/** Book a Gumroad sale by hand, as revenue_record does: the raw id (the ledger stores its digest) and a time given. */
const bookByHand = (s: Sale, occurredAt: string, kind: "sale" | "subscription" | "refund" | "cost" = "sale", suffix = "") =>
  expect(recordLedgerEntry(db, {
    lineId: "fake-line-a", kind, amountMinor: kind === "cost" ? 790 : s.price, currency: "USD", source: "gumroad",
    externalId: `${s.id}${suffix}`, occurredAt,
  })).not.toBeNull();
/** A row in the form the ledger held before RULING-2026-10-11-ledger-sale-ids.md: the raw id, put in by SQL. */
const insertRaw = (rowId: string, kind: "sale" | "refund", externalId: string, occurredAt: string, source = "gumroad") =>
  db.prepare(
    `INSERT INTO revenue_ledger (id, line_id, kind, amount_minor, currency, amount_agorot, source, external_id, occurred_at, recorded_at, note)
     VALUES (?, 'fake-line-a', ?, ?, 'USD', ?, ?, ?, ?, ?, NULL)`,
  ).run(rowId, kind, kind === "refund" ? -7900 : 7900, kind === "refund" ? -28440 : 28440, source, externalId, occurredAt, occurredAt);

/** The sync's line for the hand-booked sale before it is placed: its stored id, its ledger day, and the listing's day. */
const unlistedLead = (s: Sale, day: string, from: string) =>
  `gumroad: the sale ${storedOf(s)}, dated ${day} in the ledger, is in no listing since ${from}, which reaches that day`;

describe("case (g): a hand-booked Gumroad sale placed on Gumroad's day is returned by the next re-read, and the sync says nothing (RULING-2026-10-13 §3)", () => {
  it("refunded: unlisted before; placed from Gumroad's listing; the next day's first sync re-reads from the day before Gumroad's day, books its refund once on its line, and errors is []", async () => {
    setConnectorCursor(db, "gumroad", "2026-10-05");
    const hand = sale(7, "2026-10-01T10:00:00Z", { refunded: true });
    bookByHand(hand, "2026-10-04T12:00:00.000Z");
    const { fetchImpl, urls } = index([hand]);

    at("2026-10-12T00:17:00Z");
    const before = await sync(fetchImpl);
    expect(before.errors).toHaveLength(1);
    expect(before.errors[0]!.startsWith(unlistedLead(hand, "2026-10-04", "2026-10-03"))).toBe(true);
    expect(refundsOf(hand)).toEqual([]);

    at("2026-10-12T00:30:00Z");
    const n = urls.length;
    const placed = await placeGumroadSale(db, { id: storedOf(hand), listedFrom: "2026-09-30", token: TOKEN, fetchImpl, nowIso: "2026-10-12T00:30:00Z" });
    expect(placed).toMatchObject({ status: "placed", exitCode: 0 });
    expect(placed.lines[0]).toBe(`placed ${storedOf(hand)}: 2026-10-04 → 2026-10-01`);
    expect(afters(urls, n)).toEqual(["2026-09-30"]);
    expect(rows().map((r) => [r.kind, r.occurredAt])).toEqual([["sale", "2026-10-01T10:00:00.000Z"]]);

    at("2026-10-13T00:17:00Z");
    const m = urls.length;
    const after = await sync(fetchImpl);
    expect(after).toMatchObject({ recorded: 1, duplicates: 0, errors: [] });
    // The sync's own listing from the day before its cursor, then the re-read from the day before Gumroad's day.
    expect(afters(urls, m)).toEqual(["2026-10-04", "2026-09-30"]);
    expect(refundsOf(hand)).toEqual([{
      kind: "refund", lineId: "fake-line-a", source: "gumroad", amountMinor: -7900, externalId: `${storedOf(hand)}:refund`,
      occurredAt: "2026-10-01T10:00:00.000Z",
    }]);
    // verify-gumroad now finds the ledger as Gumroad reports it: the row's day is Gumroad's, and its refund is booked.
    expect(await verifyGumroadLedger(db, { token: TOKEN, fetchImpl, nowIso: "2026-10-13T00:20:00Z" }))
      .toMatchObject({ status: "clean", findings: 0, matchedRows: 2, differing: [], unexplained: [], refundState: [] });

    // Closed: a later sync books nothing more and says nothing.
    at("2026-10-13T06:17:00Z");
    expect(await sync(fetchImpl)).toMatchObject({ recorded: 0, duplicates: 0, errors: [] });
    expect(refundsOf(hand)).toHaveLength(1);
  });

  it("not refunded: placed, the next day's first sync returns it and says nothing, and so does a later sync that day", async () => {
    setConnectorCursor(db, "gumroad", "2026-10-05");
    const hand = sale(8, "2026-10-01T10:00:00Z");
    bookByHand(hand, "2026-10-04T12:00:00.000Z");
    const { fetchImpl, urls } = index([hand]);
    at("2026-10-12T00:17:00Z");
    const before = await sync(fetchImpl);
    expect(before.errors).toHaveLength(1);
    expect(before.errors[0]!.startsWith(unlistedLead(hand, "2026-10-04", "2026-10-03"))).toBe(true);

    expect(await placeGumroadSale(db, { id: storedOf(hand), listedFrom: "2026-09-30", token: TOKEN, fetchImpl, nowIso: "2026-10-12T00:30:00Z" }))
      .toMatchObject({ status: "placed", exitCode: 0 });

    at("2026-10-13T00:17:00Z");
    const m = urls.length;
    expect(await sync(fetchImpl)).toMatchObject({ recorded: 0, duplicates: 0, errors: [] });
    expect(afters(urls, m)).toEqual(["2026-10-04", "2026-09-30"]);
    at("2026-10-13T12:17:00Z");
    expect((await sync(fetchImpl)).errors).toEqual([]);
    expect(rows().map((r) => [r.kind, r.occurredAt])).toEqual([["sale", "2026-10-01T10:00:00.000Z"]]);
  });

  it("placed before its first sync: that sync's re-read lists from the day before Gumroad's day, and the sale is never called unlisted", async () => {
    setConnectorCursor(db, "gumroad", "2026-10-05");
    const hand = sale(9, "2026-10-01T10:00:00Z", { refunded: true });
    bookByHand(hand, "2026-10-04T12:00:00.000Z");
    const { fetchImpl, urls } = index([hand]);
    at("2026-10-12T00:10:00Z");
    expect(await placeGumroadSale(db, { id: storedOf(hand), listedFrom: "2026-09-25", token: TOKEN, fetchImpl, nowIso: "2026-10-12T00:10:00Z" }))
      .toMatchObject({ status: "placed", exitCode: 0 });
    at("2026-10-12T00:17:00Z");
    const m = urls.length;
    expect(await sync(fetchImpl)).toMatchObject({ recorded: 1, duplicates: 0, errors: [] });
    expect(afters(urls, m)).toEqual(["2026-10-04", "2026-09-30"]);
    expect(refundsOf(hand).map((r) => [r.lineId, r.occurredAt])).toEqual([["fake-line-a", "2026-10-01T10:00:00.000Z"]]);
  });
});

describe("placeGumroadSale writes only Gumroad's own created_at, only on a complete listing with exactly one match (RULING-2026-10-13 §3 item 3)", () => {
  const NOW = "2026-10-12T00:30:00Z";
  const hand = () => sale(1, "2026-10-01T10:00:00Z");
  const place = (id: string, fetchImpl: typeof fetch, over: { listedFrom?: string; token?: string | undefined; nowIso?: string } = {}) =>
    placeGumroadSale(db, { id, listedFrom: "2026-09-30", token: TOKEN, fetchImpl, nowIso: NOW, ...over });
  const occurred = () => rows().map((r) => [r.kind, r.externalId, r.occurredAt]);
  /** No line names the raw id, the token or an address. */
  const free = (lines: string[], ...raws: string[]) => {
    for (const secret of [...raws, TOKEN, ADDRESS]) expect(lines.join("\n")).not.toContain(secret);
  };

  it("without the token: not configured, exit 2, no request made, nothing written", async () => {
    const s = hand();
    bookByHand(s, "2026-10-04T12:00:00.000Z");
    const before = occurred();
    for (const token of [undefined, "", "   "]) {
      const out = await place(storedOf(s), noFetch, { token });
      expect(out, String(token)).toMatchObject({ status: "not_configured", exitCode: 2 });
      expect(out.lines.join(" ")).toContain("not configured");
    }
    expect(occurred()).toEqual(before);
  });

  it("an id that is not a sale's stored form is refused, exit 1, no request made, and the id is not echoed", async () => {
    const s = hand();
    bookByHand(s, "2026-10-04T12:00:00.000Z");
    for (const id of [s.id, `${storedOf(s)}:refund`, `${storedOf(s)}:fee`, storedOf(s).toUpperCase(), `sha256:${sha(s.id).slice(1)}`, ""]) {
      const out = await place(id, noFetch);
      expect(out, id).toMatchObject({ status: "invalid", exitCode: 1 });
      expect(out.lines.join(" ")).toContain("--id must be a Gumroad sale's stored id");
      free(out.lines, s.id);
      if (id) expect(out.lines.join(" ")).not.toContain(id);
    }
  });

  it("a listed-from that is no real day up to tomorrow (UTC) is refused, exit 1, no request made; tomorrow is a day", async () => {
    const s = hand();
    bookByHand(s, "2026-10-04T12:00:00.000Z");
    for (const listedFrom of ["2026-02-30", "2026-13-01", "20260930", "2026-9-30", "", "2026-10-14"]) {
      const out = await place(storedOf(s), noFetch, { listedFrom });
      expect(out, listedFrom).toMatchObject({ status: "invalid", exitCode: 1 });
      expect(out.lines.join(" ")).toContain("--listed-from must be a real day");
    }
    const { fetchImpl, urls } = index([s]);
    expect(await place(storedOf(s), fetchImpl, { listedFrom: "2026-10-13" })).toMatchObject({ status: "not_placed", exitCode: 3 });
    expect(afters(urls)).toEqual(["2026-10-13"]);
    expect(isListingDay("2026-10-13", "2026-10-13")).toBe(true);
    expect(isListingDay("2026-10-14", "2026-10-13")).toBe(false);
    expect(isListingDay("2026-02-29", "2026-10-13")).toBe(false);
    expect(isListingDay("2024-02-29", "2026-10-13")).toBe(true);
  });

  it("no Gumroad sale under that stored id in the ledger (none, another kind, another source): not placed, exit 3, no request made", async () => {
    const s = hand();
    expect((await place(storedOf(s), noFetch)).exitCode).toBe(3);
    bookByHand(s, "2026-10-04T12:00:00.000Z", "subscription");
    insertRaw("fake-row-t77-m", "sale", storedOf(s), "2026-10-04T12:00:00.000Z", "manual");
    const before = occurred();
    const out = await place(storedOf(s), noFetch);
    expect(out).toMatchObject({ status: "not_placed", exitCode: 3 });
    expect(out.lines.join(" ")).toContain(`no Gumroad sale ${storedOf(s)} is in the ledger`);
    expect(occurred()).toEqual(before);
  });

  it("two Gumroad sale rows under one stored id (a raw row from before the digest ruling beside its digest): not placed, exit 3, nothing written", async () => {
    const s = hand();
    bookByHand(s, "2026-10-04T12:00:00.000Z");
    insertRaw("fake-row-t77-r", "sale", s.id, "2026-10-04T12:00:00.000Z");
    const before = occurred();
    const out = await place(storedOf(s), noFetch);
    expect(out).toMatchObject({ status: "not_placed", exitCode: 3 });
    expect(out.lines.join(" ")).toContain(`2 Gumroad sale rows in the ledger have the stored id ${storedOf(s)}`);
    expect(occurred()).toEqual(before);
    free(out.lines, s.id);
  });

  it("a listing refused at page 1, refused at page 2 after page 1 returned the sale, looping, or past the cap: not placed, exit 3, nothing written", async () => {
    const s = hand();
    bookByHand(s, "2026-10-04T12:00:00.000Z");
    const before = occurred();
    // Twelve later sales give the listing a second page, refused after page 1 returned the sale.
    const others = Array.from({ length: 12 }, (_, i) => sale(100 + i, `2026-10-02T${String(10 + i).padStart(2, "0")}:00:00Z`));
    const cases: [string, ReturnType<typeof index>, string][] = [
      ["refused at page 1", index([s], { refuse: "2026-09-30" }), "refused (HTTP 500, page 1)"],
      ["refused at page 2", index([s, ...others], { refusePage: 2 }), "refused (HTTP 500, page 2)"],
      ["looped", index([s], { loop: "2026-09-30" }), "loops"],
      ["past the cap", index([s], { endless: "2026-09-30" }), "runs past 500 pages"],
    ];
    for (const [name, ix, words] of cases) {
      const out = await place(storedOf(s), ix.fetchImpl);
      expect(out, name).toMatchObject({ status: "not_placed", exitCode: 3 });
      expect(out.lines.join(" "), name).toContain(words);
      expect(out.lines.join(" "), name).toContain("nothing written");
      expect(occurred(), name).toEqual(before);
      free(out.lines, s.id);
    }
  });

  it("no listed sale with its stored id: not placed, exit 3, nothing written, though another sale was listed", async () => {
    const s = hand();
    bookByHand(s, "2026-10-04T12:00:00.000Z");
    const before = occurred();
    const out = await place(storedOf(s), index([sale(2, "2026-10-01T09:00:00Z")]).fetchImpl);
    expect(out).toMatchObject({ status: "not_placed", exitCode: 3 });
    expect(out.lines.join(" ")).toContain(`no sale Gumroad lists since 2026-09-30 has the stored id ${storedOf(s)}`);
    expect(occurred()).toEqual(before);
  });

  it("two listed sales with its stored id, or the one with a created_at Date.parse cannot read: not placed, exit 3, nothing written", async () => {
    const s = hand();
    bookByHand(s, "2026-10-04T12:00:00.000Z");
    const before = occurred();
    const twice = await place(storedOf(s), index([s, { ...s, created_at: "2026-10-02T10:00:00Z" }]).fetchImpl);
    expect(twice).toMatchObject({ status: "not_placed", exitCode: 3 });
    expect(twice.lines.join(" ")).toContain(`2 sales Gumroad lists since 2026-09-30 have the stored id ${storedOf(s)}`);
    // An index that lists a sale with no readable created_at (the fake index filters on it, so this one lists all).
    const unreadable = { ...s, created_at: "not-a-time" };
    const fetchImpl = (async () => new Response(JSON.stringify({ success: true, sales: [unreadable] }), { status: 200 })) as unknown as typeof fetch;
    const out = await place(storedOf(s), fetchImpl);
    expect(out).toMatchObject({ status: "not_placed", exitCode: 3 });
    expect(out.lines.join(" ")).toContain("no created_at Date.parse reads");
    expect(occurred()).toEqual(before);
  });

  it("placed: the sale, its :refund and its :fee rows, raw rows from before the digest ruling among them, all on Gumroad's created_at; no other row moves", async () => {
    const s = sale(3, "2026-10-01T10:00:00Z");
    const other = sale(4, "2026-10-01T11:00:00Z");
    bookByHand(s, "2026-10-04T12:00:00.000Z");
    bookByHand(s, "2026-10-05T12:00:00.000Z", "cost", ":fee");
    insertRaw("fake-row-t77-3r", "refund", `${s.id}:refund`, "2026-10-06T12:00:00.000Z");
    bookByHand(other, "2026-10-04T12:00:00.000Z");
    // A manual row under the sale's stored id is no Gumroad row: it does not move.
    insertRaw("fake-row-t77-3m", "refund", `${storedOf(s)}:refund`, "2026-10-07T12:00:00.000Z", "manual");
    const { fetchImpl, urls } = index([other, s]);
    // listedFrom is only where the listing starts: the day written is Gumroad's, not this one.
    const out = await place(storedOf(s), fetchImpl, { listedFrom: "2026-09-28" });
    expect(out).toMatchObject({ status: "placed", exitCode: 0 });
    expect(afters(urls)).toEqual(["2026-09-28"]);
    expect(out.lines).toEqual([
      `placed ${storedOf(s)}: 2026-10-04 → 2026-10-01`,
      `  rows moved: ${storedOf(s)} (sale), ${storedOf(s)}:fee (cost), ${storedOf(s)}:refund (refund)`,
    ]);
    free(out.lines, s.id, other.id);
    expect(rows().map((r) => [r.source, r.kind, r.occurredAt])).toEqual([
      ["gumroad", "sale", "2026-10-01T10:00:00.000Z"],
      ["gumroad", "cost", "2026-10-01T10:00:00.000Z"],
      ["gumroad", "refund", "2026-10-01T10:00:00.000Z"],
      ["gumroad", "sale", "2026-10-04T12:00:00.000Z"],
      ["manual", "refund", "2026-10-07T12:00:00.000Z"],
    ]);
    // The ids, amounts and lines are as they were: one column moved.
    expect(rows().map((r) => [r.lineId, r.amountMinor, r.externalId])).toEqual([
      ["fake-line-a", 7900, storedOf(s)],
      ["fake-line-a", -790, `${storedOf(s)}:fee`],
      ["fake-line-a", -7900, `${s.id}:refund`],
      ["fake-line-a", 7900, storedOf(other)],
      ["fake-line-a", -7900, `${storedOf(s)}:refund`],
    ]);
  });

  it("another source's rows under the sale's exact stored id and its :refund's do not move with it: only the source tells them apart (the tick-77 review's R-X1)", async () => {
    const s = sale(10, "2026-10-01T10:00:00Z");
    bookByHand(s, "2026-10-04T12:00:00.000Z");
    bookByHand(s, "2026-10-05T12:00:00.000Z", "cost", ":fee");
    insertRaw("fake-row-t77-10r", "refund", `${storedOf(s)}:refund`, "2026-10-06T12:00:00.000Z");
    // Manual rows whose external_id is exactly the Gumroad sale's and its refund's stored id.
    insertRaw("fake-row-t77-10ms", "sale", storedOf(s), "2026-10-07T12:00:00.000Z", "manual");
    insertRaw("fake-row-t77-10mr", "refund", `${storedOf(s)}:refund`, "2026-10-08T12:00:00.000Z", "manual");
    const out = await place(storedOf(s), index([s]).fetchImpl);
    expect(out).toMatchObject({ status: "placed", exitCode: 0 });
    expect(out.lines).toEqual([
      `placed ${storedOf(s)}: 2026-10-04 → 2026-10-01`,
      `  rows moved: ${storedOf(s)} (sale), ${storedOf(s)}:fee (cost), ${storedOf(s)}:refund (refund)`,
    ]);
    expect(rows().map((r) => [r.source, r.kind, r.externalId, r.occurredAt])).toEqual([
      ["gumroad", "sale", storedOf(s), "2026-10-01T10:00:00.000Z"],
      ["gumroad", "cost", `${storedOf(s)}:fee`, "2026-10-01T10:00:00.000Z"],
      ["gumroad", "refund", `${storedOf(s)}:refund`, "2026-10-01T10:00:00.000Z"],
      ["manual", "sale", storedOf(s), "2026-10-07T12:00:00.000Z"],
      ["manual", "refund", `${storedOf(s)}:refund`, "2026-10-08T12:00:00.000Z"],
    ]);
  });

  it("a row from before the digest ruling, its raw id in the row, is placed by its digest", async () => {
    const s = sale(5, "2026-10-01T10:00:00Z");
    insertRaw("fake-row-t77-5", "sale", s.id, "2026-10-04T12:00:00.000Z");
    const out = await place(storedOf(s), index([s]).fetchImpl);
    expect(out).toMatchObject({ status: "placed", exitCode: 0 });
    expect(out.lines[0]).toBe(`placed ${storedOf(s)}: 2026-10-04 → 2026-10-01`);
    expect(out.lines[1]).toBe(`  rows moved: ${storedOf(s)} (sale)`);
    free(out.lines, s.id);
    expect(rows().map((r) => [r.externalId, r.occurredAt])).toEqual([[s.id, "2026-10-01T10:00:00.000Z"]]);
  });

  it("a sale already on Gumroad's day is left as it is: exit 0, nothing written, though its time differs", async () => {
    const s = hand();
    bookByHand(s, "2026-10-01T23:00:00.000Z");
    const out = await place(storedOf(s), index([s]).fetchImpl);
    expect(out).toMatchObject({ status: "unchanged", exitCode: 0 });
    expect(out.lines).toEqual([`${storedOf(s)} is already dated 2026-10-01, the day Gumroad made it: nothing written.`]);
    expect(occurred()).toEqual([["sale", storedOf(s), "2026-10-01T23:00:00.000Z"]]);
  });

  it("a sale whose stored time Date.parse reads on Gumroad's day but which is not in the connector's form is written with Gumroad's time, not left as placed (the tick-77 review's finding 2)", async () => {
    // Each passes the hand-sale guard (Date.parse reads it on 2026-03-03), but sumWindow compares the text, and none is in
    // the window of its own day: "2026-02-31" sorts before March (and after February's end, so it is in no month),
    // "2026-03-03 05:00" before the day's start ("T" sorts after a space), "2026-03-03T23:59:59Z" after its end.
    const forms: [number, string, string][] = [
      [11, "2026-02-31", "2026-03-03T05:00:00Z"],
      [12, "2026-03-03 05:00", "2026-03-03T09:00:00Z"],
      [13, "2026-03-03T23:59:59Z", "2026-03-03T12:00:00Z"],
    ];
    const listedSales = forms.map(([n, , createdAt]) => sale(n, createdAt));
    forms.forEach(([, stored], i) => bookByHand(listedSales[i]!, stored));
    const counted = (from: string, to: string) => sumWindow(db, "fake-line-a", from, to).count;
    const windows = () => [
      counted("2026-02-01T00:00:00.000Z", "2026-02-28T23:59:59.999Z"),
      counted("2026-03-01T00:00:00.000Z", "2026-03-31T23:59:59.999Z"),
      counted("2026-03-03T00:00:00.000Z", "2026-03-03T23:59:59.999Z"),
    ];
    expect(windows()).toEqual([0, 2, 0]);
    const { fetchImpl } = index(listedSales);
    for (const [i, s] of listedSales.entries()) {
      const out = await place(storedOf(s), fetchImpl, { listedFrom: "2026-02-25" });
      expect(out, forms[i]![1]).toMatchObject({ status: "placed", exitCode: 0 });
      expect(out.lines, forms[i]![1]).toEqual([
        `placed ${storedOf(s)}: a time not in the connector's form (read as 2026-03-03) → 2026-03-03`,
        `  rows moved: ${storedOf(s)} (sale)`,
      ]);
      free(out.lines, s.id, forms[i]![1]);
    }
    expect(occurred()).toEqual([
      ["sale", storedOf(listedSales[0]!), "2026-03-03T05:00:00.000Z"],
      ["sale", storedOf(listedSales[1]!), "2026-03-03T09:00:00.000Z"],
      ["sale", storedOf(listedSales[2]!), "2026-03-03T12:00:00.000Z"],
    ]);
    expect(windows()).toEqual([0, 3, 3]);
    // Now in the connector's form and on Gumroad's day: a second run writes nothing.
    expect(await place(storedOf(listedSales[0]!), fetchImpl, { listedFrom: "2026-02-25" }))
      .toMatchObject({ status: "unchanged", exitCode: 0 });
  });

  it("a sale dated by hand at a time Date.parse cannot read is placed, its old day said as unreadable", async () => {
    const s = hand();
    insertRaw("fake-row-t77-u", "sale", storedOf(s), "the fourth");
    const out = await place(storedOf(s), index([s]).fetchImpl);
    expect(out).toMatchObject({ status: "placed", exitCode: 0 });
    expect(out.lines[0]).toBe(`placed ${storedOf(s)}: an unreadable time → 2026-10-01`);
    expect(occurred()).toEqual([["sale", storedOf(s), "2026-10-01T10:00:00.000Z"]]);
  });
});

// RULING-2026-10-13 "What this does not decide" 4 and fold 7 (optional, read-only): verify-gumroad lists from a day before
// the oldest row, the same reach a hand-booked sale may lie before; `since` lets it list from an earlier day, and never
// from a later one (a later start would report every row before it as unexplained).
describe("verifyGumroadLedger's since: an earlier day to list from, never a later one (RULING-2026-10-13, fold 7)", () => {
  it("a hand-booked row dated after Gumroad's day: from the default day it is unexplained; from since it is found and its day differs", async () => {
    const s = sale(6, "2026-10-01T10:00:00Z");
    bookByHand(s, "2026-10-04T12:00:00.000Z");
    const { fetchImpl, urls } = index([s]);
    const narrow = await verifyGumroadLedger(db, { token: TOKEN, fetchImpl, nowIso: "2026-10-12T00:00:00Z" });
    expect(narrow).toMatchObject({ after: "2026-10-03", status: "findings", unexplained: [{ externalId: storedOf(s), day: "2026-10-04" }] });
    const wide = await verifyGumroadLedger(db, { token: TOKEN, fetchImpl, nowIso: "2026-10-12T00:00:00Z", since: "2026-09-30" });
    expect(wide).toMatchObject({ after: "2026-09-30", status: "findings", unexplained: [], differing: [{ externalId: storedOf(s), day: "2026-10-04", fields: ["day"] }] });
    expect(afters(urls)).toEqual(["2026-10-03", "2026-09-30"]);
  });

  it("a since later than the default day changes nothing: the listing starts a day before the oldest row", async () => {
    const s = sale(6, "2026-10-04T10:00:00Z");
    bookByHand(s, "2026-10-04T10:00:00.000Z");
    const { fetchImpl, urls } = index([s]);
    const out = await verifyGumroadLedger(db, { token: TOKEN, fetchImpl, nowIso: "2026-10-12T00:00:00Z", since: "2026-10-10" });
    expect(out).toMatchObject({ after: "2026-10-03", status: "clean", matchedRows: 1 });
    expect(afters(urls)).toEqual(["2026-10-03"]);
  });

  it("with no Gumroad row, since moves the first read's day earlier too", async () => {
    const { fetchImpl, urls } = index([]);
    const out = await verifyGumroadLedger(db, { token: TOKEN, fetchImpl, nowIso: "2026-10-12T00:00:00Z", since: "2026-08-01" });
    expect(out).toMatchObject({ after: "2026-08-01", status: "clean" });
    expect(afters(urls)).toEqual(["2026-08-01"]);
  });
});
