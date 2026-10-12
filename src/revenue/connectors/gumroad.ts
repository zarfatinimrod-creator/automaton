/**
 * Gumroad connector — reads sales (read-only).
 *
 * Env: GUMROAD_ACCESS_TOKEN, GUMROAD_DEFAULT_LINE (optional).
 * Product mapping key: `gumroad:<product_id>`.
 * Cursor: YYYY-MM-DD, the newest day a booked sale was created on (Gumroad filters by day); with none it is taken as
 * 30 days back (FIRST_READ_DAYS), so the first read lists from 31 days back. Only a real date no later than tomorrow in
 * UTC becomes or stays the cursor (`isCursorDay`, the tick-71 review): a stored cursor that is not one is replaced by the
 * first read's, and the sync says so.
 *
 * `fetchSince` lists from the day before its cursor and reads through the shared pager (`listGumroadSalesSince`) to
 * the last page (tick 71; until then it read one page of ten and moved its cursor past the rest). The day before,
 * because the recorded source says `created_at >= after` but not in which zone the day starts: a sale made later on the
 * cursor's own day is listed however the day is read, and a sale listed again is a duplicate the ledger drops on its
 * stored id (`recordLedgerEntry`, `(source, external_id)`). A listing refused part-way, or longer than the page cap,
 * books the pages it read, keeps its cursor, so no sale it did not read is passed, and says so in `problem`, which the
 * sync reports as a `gumroad:` error. The index's order is not recorded, so nothing here depends on it. The sync's page
 * cap is its own, MAX_LEDGER_SYNC_PAGES, and a next_page_key the pager has already asked for ends the listing as a loop.
 *
 * A refund made later (tick 74, CHANNEL_LOOP §9 tick-71 item 2): that listing books a refund only when it lists the
 * refunded sale, which it does for about a day after the sale, so `runLedgerSync` also calls `readLateGumroadRefunds`,
 * which lists again from the day before the oldest sale the ledger holds whose refund it does not, and books the refunds
 * it finds there. The index picks sales by `created_at` (the sync passes no other filter) and reports each as it stands
 * when read (`refunded: stripe_refunded`, below), so a listing from before a sale reads its refund whenever it was made.
 * No recorded source bounds how late that is, so the re-read has no window: the period Gumroad applies (none, 7, 14, 30
 * or 183 days, 30 by default and kept, research/measurements/refund-law-il.md:85-89) bounds the request, measured at the
 * request (`insideWindow`, products/il-biz-tools/scripts/gumroad-pro-product.js:813-816), not the refund; the responder
 * reads a request up to REFUND_LOOKBACK_DAYS (60) after it came and retries a refund refused for balance — the first on
 * a new account is — "until it happens" (scripts/brand_mail.py:46-49, :82-83, :197; RULING-2026-10-05-refund-state.md:
 * 282-283); and Gumroad refunds at its own discretion (refund-law-il.md:122-128). Its cost is pages: one per ten sales
 * since that oldest sale, at every sync whose own listing starts after it, under MAX_LEDGER_SYNC_PAGES. Past that cap
 * (5,000 sales since the oldest open sale) the re-read stops at every sync and says so, and it cannot move on by itself
 * while that sale stays open: a bound or a slower schedule would be a ruling's, because no recorded source gives one. No
 * other recorded read serves: a licence verify needs the buyer's key, GET /v2/sales/:id the raw sale id the ledger does
 * not keep, a ping a server. The reach is taken from the day the ledger dates each open sale, which for a sale booked by
 * hand is the day it was booked unless a time was given (revenue_record and `colony.ts record` default to now), so a
 * sale booked days after Gumroad made it can lie before every listing's reach: an open sale that a listing read to its
 * end should have returned by that day, and that no listing returned, is reported by its stored id and day as a
 * `gumroad:` error at every sync while it has no refund row, never passed in silence (the tick-74 review).
 *
 * The same sync also reads the Pro product's refund rate over the trailing 90 days (`gumroadRefundRate90d`,
 * RULING-2026-09-30-documents (d) and fold action 6): refunded / sales, a number for the board and never a reason to
 * refuse a refund. The fields are Gumroad's API v2 sale object as its public source writes it (antiwork/gumroad
 * 0656875c5fbfbf1a7f339f4716a0b9059539d790, app/models/purchase.rb#as_json, version 2): `created_at` (:1018),
 * `product_id: link.external_id` (:1050), `refunded: stripe_refunded` (:1052), `partially_refunded:
 * stripe_partially_refunded` (:1053), `chargedback: chargedback_not_reversed?` (:1054), `disputed: chargedback?`
 * (:1079; `chargedback?` is `chargeback_date.present?` and `chargedback_not_reversed?` adds `!chargeback_reversed?`,
 * :1313-1314). The index (app/controllers/api/v2/sales_controller.rb) filters `created_at >=
 * after` (:282) and `link_id` on `product_id` (:285), answers ten sales a page (RESULTS_PER_PAGE, :14) and pages with
 * `next_page_key` / `page_key` (base_controller.rb:163-167, sales_controller.rb:91-98); every answer carries
 * `success` (base_controller.rb:42-44).
 *
 * No entry carries a raw sale id: the sale, its refund and its fee are booked as `sha256:<hex>`, `sha256:<hex>:refund`
 * and `sha256:<hex>:fee`, the unkeyed SHA-256 of `sale.id` (`storedExternalId`, RULING-2026-10-11-ledger-sale-ids.md),
 * because the ledger is committed to a public repository and a sale id is an identifier of a buyer's purchase.
 */

import { readFileSync } from "node:fs";
import { join } from "node:path";
import { fetchJson, UNASSIGNED_LINE_ID, type RevenueConnector } from "./types.js";
import { storedExternalId } from "../money.js";
import type { LedgerEntryInput } from "../types.js";

/**
 * The ledger entries one Gumroad sale object books on `lineId`: the sale, its refund when `refunded` is true, its
 * Gumroad fee when there is one. Their ids are the stored form only (RULING-2026-10-11-ledger-sale-ids.md C1): the raw
 * `sale.id` leaves this function in no field. `colony.ts verify-gumroad` compares the ledger with these same entries.
 */
export function gumroadSaleEntries(sale: any, lineId: string): LedgerEntryInput[] {
  const createdAt = String(sale.created_at ?? "");
  const price = Math.abs(Number(sale.price ?? 0)); // cents
  const currency = String(sale.currency ?? "usd").toUpperCase();
  const occurredAt = Number.isNaN(Date.parse(createdAt)) ? new Date().toISOString() : new Date(createdAt).toISOString();
  const saleId = sale.id === undefined || sale.id === null ? null : storedExternalId("gumroad", String(sale.id));
  const entries: LedgerEntryInput[] = [
    { lineId, kind: "sale", amountMinor: price, currency, source: "gumroad", externalId: saleId, occurredAt, note: sale.product_name ?? null },
  ];
  // A sale with no id has no family: the ledger refuses the sale itself (MISSION rule 2), and a refund or fee keyed on
  // the digest of "undefined" or "null" would be an id the platform never gave.
  if (saleId === null) return entries;
  if (sale.refunded === true) {
    entries.push({ lineId, kind: "refund", amountMinor: price, currency, source: "gumroad", externalId: `${saleId}:refund`, occurredAt, note: "refunded" });
  }
  const fee = Math.abs(Number(sale.gumroad_fee ?? 0));
  if (fee > 0) {
    entries.push({ lineId, kind: "cost", amountMinor: fee, currency, source: "gumroad", externalId: `${saleId}:fee`, occurredAt, note: "gumroad fee" });
  }
  return entries;
}

const DAY_MS = 86_400_000;
/**
 * With no cursor, the first read's window: the trailing 30 days (the day the cursor would be), from the day before;
 * `verify-gumroad` starts there too while the ledger has no Gumroad row.
 */
export const FIRST_READ_DAYS = 30;
const DAY_RE = /^\d{4}-\d{2}-\d{2}$/;

/** A YYYY-MM-DD day moved by whole days, in UTC. */
export const shiftDay = (day: string, days: number): string =>
  new Date(Date.parse(`${day}T00:00:00.000Z`) + days * DAY_MS).toISOString().slice(0, 10);

/**
 * Whether `day` may be the cursor: a real YYYY-MM-DD date (Date.parse accepts "2026-02-30" as 2026-03-02, so it must
 * read back as itself) no later than `latestDay`, tomorrow in UTC (a created_at written east of UTC is up to a day
 * ahead). A shape alone let "2026-13-45" in, which makes `shiftDay` throw at every later sync, and a date in the future,
 * which starts every later listing past every real sale (the tick-71 review).
 */
function isCursorDay(day: string, latestDay: string): boolean {
  const t = Date.parse(`${day}T00:00:00.000Z`);
  return DAY_RE.test(day) && !Number.isNaN(t) && new Date(t).toISOString().slice(0, 10) === day && day <= latestDay;
}

/**
 * The ledger sync's page cap: 5,000 sales since the day before its cursor, a window normally a day or two long. Well
 * above MAX_REFUND_RATE_PAGES, so a long stop is read through and the cursor moves on; still a cap, because Gumroad's rate
 * limits are not recorded (research/measurements/gumroad-license-decision.md:25) and a stuck sync asks again every hour.
 */
export const MAX_LEDGER_SYNC_PAGES = 500;

/** The sync's line for a listing `fetchSince` could not read to its end. No token, no sale id, no word for refunds. */
function incompleteListing(listing: Exclude<GumroadSalesListing, { ok: true }>, after: string, read: number, cursorDay: string): string {
  const why = listing.problem === "refused"
    ? `the sales listing since ${after} was refused at page ${listing.page} (HTTP ${listing.status})`
    : listing.problem === "looped"
      ? `the sales listing since ${after} loops (page ${listing.pages} names as its next a page already asked for)`
      : `the sales listing since ${after} runs past ${listing.pages} pages`;
  const rest = listing.problem !== "too_many_pages"
    ? "the next sync asks again from the same day"
    : `the sales after page ${listing.pages} are not read, and no later sync reads them while the cursor is kept: past ` +
      "the cap the sync cannot move on by itself";
  return `${why}: the ${read} sale(s) read before it stopped are booked (one read again is a duplicate), and the cursor ` +
    `stays at ${cursorDay}, so no sale it did not read is passed; ${rest}`;
}

export const gumroadConnector: RevenueConnector = {
  source: "gumroad",
  isConfigured: (env) => Boolean(env.GUMROAD_ACCESS_TOKEN),
  async fetchSince({ cursor, env, resolveLine, fetchImpl = fetch }) {
    const token = env.GUMROAD_ACCESS_TOKEN;
    if (!token) return { entries: [], unmapped: [] };
    const now = Date.now();
    const latestDay = new Date(now + DAY_MS).toISOString().slice(0, 10);
    const cursorDay = cursor && isCursorDay(cursor, latestDay)
      ? cursor
      : new Date(now - FIRST_READ_DAYS * DAY_MS).toISOString().slice(0, 10);
    // From the day before the cursor's, whatever day or zone the index takes `after` in (the header).
    const after = shiftDay(cursorDay, -1);
    // A stored cursor that is no day to read from is replaced, and said: the sales before the first read's window that
    // it may have passed are not read again.
    const replaced = cursor && cursorDay !== cursor
      ? `the stored cursor "${cursor.slice(0, 32)}" is no real day up to tomorrow (UTC), so this sync read from ${after} as ` +
        "a first read does; a sale created before that day and not booked yet is not read"
      : null;
    const read: unknown[] = [];
    const listing = await listGumroadSalesSince({ token, after, fetchImpl, maxPages: MAX_LEDGER_SYNC_PAGES, onPage: (sales) => { read.push(...sales); } });

    const entries: LedgerEntryInput[] = [];
    const unmapped = new Set<string>();
    let newestDay = cursorDay;
    for (const sale of read as any[]) {
      const productId = String(sale.product_id ?? "");
      const lineId = resolveLine(`gumroad:${productId}`) ?? env.GUMROAD_DEFAULT_LINE ?? UNASSIGNED_LINE_ID;
      if (lineId === UNASSIGNED_LINE_ID && productId) unmapped.add(`gumroad:${productId}`);
      const day = String(sale.created_at ?? "").slice(0, 10);
      if (isCursorDay(day, latestDay) && day > newestDay) newestDay = day;
      entries.push(...gumroadSaleEntries(sale, lineId));
    }
    if (listing.ok) return { entries, nextCursor: newestDay, listedFrom: after, listedToEnd: true, unmapped: [...unmapped], ...(replaced ? { problem: replaced } : {}) };
    // The pages read are booked; the cursor stays (and a first read keeps the window it asked for), because the sales
    // not read may lie on any day of it.
    const stop = incompleteListing(listing, after, read.length, cursorDay);
    return { entries, nextCursor: cursorDay, listedFrom: after, unmapped: [...unmapped], problem: replaced ? `${replaced}; ${stop}` : stop };
  },
};

// ─── The late refund (tick 74, CHANNEL_LOOP §9 tick-71 item 2) ─────────────────────────────────────────────────

/** A sale the ledger holds whose refund it does not: the line it was booked on and the time it was booked at. */
export interface OpenGumroadSale {
  lineId: string;
  occurredAt: string;
}

export interface LateRefundRead {
  /** The day the re-read listed from, or null when it asked for nothing. */
  after: string | null;
  /** The `:refund` entries of the open sales Gumroad now reports refunded, each on the line its sale was booked on. */
  entries: LedgerEntryInput[];
  /** Set when the re-read could not be read to its end; the sync reports it as a `gumroad:` error. Never an id or the token. */
  problem: string | null;
  /**
   * One line for each open sale whose refund state no listing read: a listing read to its end reaches the day the ledger
   * dates it, and neither listing returned it (the tick-74 review's blocking finding). The sync reports each as a
   * `gumroad:` error. Each names the sale by its stored form and its day only, as verify-gumroad does; never a raw id or
   * the token.
   */
  unlisted: string[];
}

/** The sync's line for a re-read `readLateGumroadRefunds` could not read to its end. */
function lateRefundStop(listing: Exclude<GumroadSalesListing, { ok: true }>, after: string, read: number): string {
  const why = listing.problem === "refused"
    ? `the late-refund re-read since ${after} was refused at page ${listing.page} (HTTP ${listing.status})`
    : listing.problem === "looped"
      ? `the late-refund re-read since ${after} loops (page ${listing.pages} names as its next a page already asked for)`
      : `the late-refund re-read since ${after} runs past ${listing.pages} pages`;
  const rest = listing.problem === "too_many_pages"
    ? `a refund on a sale after page ${listing.pages} is not booked, and no later sync reads past that page while the ` +
      "oldest open sale holds the re-read's day: past the cap the re-read cannot move on by itself, and this is said at " +
      "every sync"
    : "a refund on a sale it did not read is booked by a later sync's re-read, which asks again from the same day";
  return `${why}: the refunds among the ${read} sale(s) it read are booked (one booked already is a duplicate), and the ` +
    `cursor is not moved by it; ${rest}`;
}

/** The sync's line for an open sale no listing returned, though a listing read to its end reaches the sale's day. */
function unlistedSale(id: string, day: string, from: string): string {
  return `the sale ${id}, dated ${day} in the ledger, is in no listing since ${from}, which reaches that day: its refund ` +
    "state cannot be read, so a refund of it is not booked (one way this happens is a sale booked by hand days after " +
    "Gumroad made it, dated at its booking). Check it with verify-gumroad; if Gumroad reports it refunded, book the " +
    `refund by hand as ${id}:refund. Said at every sync while it has no refund row`;
}

/**
 * The refunds `fetchSince` cannot see: a refund Gumroad made after the sync's own listing stopped reaching its sale.
 *
 * The reach is the ledger's, not a refund window: the re-read lists from the day before the oldest sale in `open` (the
 * sales the ledger holds whose refund it does not), because no recorded source bounds how long after a sale a refund can
 * land (the header). It asks for nothing when there is no open sale with a readable time, or when the sync's own listing
 * (from `listedFrom`) reached them all: that listing reads every sale created from the day after its `after`, whichever
 * zone the index starts the day in. What it books is what `gumroadSaleEntries` books for a refunded sale — its `:refund`
 * entry, nothing for a partial refund — on the line the sale was booked on, and only for a sale in `open`: the refund of a
 * sale the ledger never booked would take off money the ledger never counted. It never moves the cursor. A refused,
 * looping or capped re-read books the refunds on the pages it read and says so in `problem`.
 *
 * Both reaches are taken from the day the ledger dates a sale, which is Gumroad's `created_at` only for a sale the
 * connector booked. An open sale that a listing read to its end should have returned by that day (the re-read reaches
 * every open sale with a day; the sync's own listing, `listed` with `listedToEnd`, those dated after its `after`), and
 * that neither returned, is in `unlisted`: its refund state cannot be read, and it is said, not passed.
 */
export async function readLateGumroadRefunds(params: {
  token: string;
  open: ReadonlyMap<string, OpenGumroadSale>;
  listedFrom: string;
  /** The stored ids of the sales the sync's own listing returned: their refund state was read by it. */
  listed: ReadonlySet<string>;
  /** Whether the sync's own listing was read to its last page. */
  listedToEnd: boolean;
  fetchImpl?: typeof fetch;
}): Promise<LateRefundRead> {
  const { token, open, listedFrom, listed, listedToEnd, fetchImpl = fetch } = params;
  const days = new Map<string, string>();
  let oldest: string | null = null;
  for (const [id, sale] of open) {
    // A time Date.parse cannot read places its sale on no day: it is left out, as verify-gumroad leaves it out of its
    // `after`. The connector books every sale at an ISO time; only a row booked by hand can lack one.
    const t = Date.parse(sale.occurredAt);
    if (Number.isNaN(t)) continue;
    const day = new Date(t).toISOString().slice(0, 10);
    days.set(id, day);
    if (oldest === null || day < oldest) oldest = day;
  }
  if (oldest === null) return { after: null, entries: [], problem: null, unlisted: [] };
  // The re-read's reach, and the only bound on it: the day before the oldest open sale's day in the ledger (the day
  // before, as `fetchSince` asks, because the zone `after`'s day starts in is not recorded). No refund window shortens it
  // (the header). A sale the connector booked is dated at its `created_at`, so every one created before that day is
  // refunded in the ledger already; a refund of a sale never booked is not booked here (below). A sale booked by hand is
  // dated at its booking unless a time was given, so it may have been created before that day, and then no listing from
  // its date returns it: it is reported in `unlisted` (`unlistedOf`). Nothing is asked when the sync's own listing asked
  // from that day or earlier.
  const after = shiftDay(oldest, -1);
  // Each open sale with a day that a listing read to its end reaches and neither listing returned. `rereadFrom` is the
  // re-read's `after` when it was read to its end (it reaches every open sale with a day), else null; the sync's own
  // listing reaches a sale dated from the day after its `after`, whichever zone the index starts the day in.
  const unlistedOf = (returned: ReadonlySet<string>, rereadFrom: string | null): string[] => {
    const out: string[] = [];
    for (const [id, day] of days) {
      if (returned.has(id)) continue;
      if (rereadFrom !== null) out.push(unlistedSale(id, day, rereadFrom));
      else if (listedToEnd && day > listedFrom) out.push(unlistedSale(id, day, listedFrom));
    }
    return out;
  };
  if (after >= listedFrom) return { after: null, entries: [], problem: null, unlisted: unlistedOf(listed, null) };

  const entries: LedgerEntryInput[] = [];
  const returned = new Set(listed);
  let read = 0;
  const listing = await listGumroadSalesSince({
    token,
    after,
    fetchImpl,
    maxPages: MAX_LEDGER_SYNC_PAGES,
    onPage: (sales) => {
      read += sales.length;
      for (const sale of sales as any[]) {
        const id = sale?.id;
        const key = id === undefined || id === null ? null : storedExternalId("gumroad", String(id));
        const booked = key === null ? undefined : open.get(key);
        if (!booked) continue;
        returned.add(key!);
        entries.push(...gumroadSaleEntries(sale, booked.lineId).filter((e) => e.kind === "refund"));
      }
    },
  });
  return {
    after,
    entries,
    problem: listing.ok ? null : lateRefundStop(listing, after, read),
    unlisted: unlistedOf(returned, listing.ok ? after : null),
  };
}

// ─── The Pro product's refund rate (RULING-2026-09-30-documents (d), fold action 6) ─────────────────────────────

export const GUMROAD_REFUND_RATE_KPI = "gumroadRefundRate90d";
export const REFUND_RATE_WINDOW_DAYS = 90;
/** The line the Pro product belongs to when the product map does not name one: site.json is il-biz-tools' own. */
export const PRO_LINE_ID = "il-biz-tools";
export const DEFAULT_PRO_SITE_DIR = join("products", "il-biz-tools");
/**
 * Ten sales a page (sales_controller.rb:14): 100 pages is 1,000 sales in 90 days. Past it the count is not complete.
 * The shared pager's default cap, so also `verify-gumroad`'s; the ledger sync has its own (MAX_LEDGER_SYNC_PAGES).
 */
export const MAX_REFUND_RATE_PAGES = 100;

export interface RefundRateCount {
  /** Sales of the Pro product created inside the window. */
  sales: number;
  /** Of those, the ones Gumroad reports wholly refunded (`refunded`). */
  refunded: number;
  /**
   * Of those, the ones Gumroad reports partly refunded (`partially_refunded`). Counted as sales and NOT as refunded: the
   * ruling's measure is `refunded`, and Gumroad sets `refunded` only once the refunds cover the whole charge, with
   * `partially_refunded` otherwise, never both (antiwork/gumroad app/modules/purchase/refundable.rb:317-318, :406-412).
   */
  partiallyRefunded: number;
  /**
   * Of those, the ones with a chargeback filed (`disputed`, purchase.rb:1079), reversed or not. Shown beside the rate and
   * NOT counted as refunded: the ruling's measure is `refunded` alone. Counted on its own field, so a sale that is also
   * refunded is in both counts.
   */
  disputed: number;
  /** Of those, the ones whose chargeback was not reversed (`chargedback`, purchase.rb:1054): money that did go back. */
  chargedback: number;
  /** Pro sales with no readable `created_at`: they cannot be placed in the window, so they are left out and counted here. */
  undated: number;
  windowDays: number;
  /** The window's end: the sync's own time. Its start is `windowDays` before it, inclusive. */
  windowEnd: string;
}

/**
 * Count the Pro product's sales and refunds in the trailing window, measured from each sale's own `created_at`: a
 * sale counts when `windowEnd - windowDays <= created_at <= windowEnd`. Sales of any other product are left out, even
 * when Gumroad returns them.
 */
export function countProRefunds(
  sales: readonly unknown[],
  productId: string,
  nowIso: string,
  windowDays: number = REFUND_RATE_WINDOW_DAYS,
): RefundRateCount {
  const end = Date.parse(nowIso);
  const start = end - windowDays * DAY_MS;
  const out: RefundRateCount = {
    sales: 0,
    refunded: 0,
    partiallyRefunded: 0,
    disputed: 0,
    chargedback: 0,
    undated: 0,
    windowDays,
    windowEnd: new Date(end).toISOString(),
  };
  for (const raw of sales) {
    if (!raw || typeof raw !== "object") continue;
    const sale = raw as Record<string, unknown>;
    if (String(sale.product_id ?? "") !== productId) continue;
    const t = typeof sale.created_at === "string" ? Date.parse(sale.created_at) : Number.NaN;
    if (Number.isNaN(t)) {
      out.undated += 1;
      continue;
    }
    if (t < start || t > end) continue;
    out.sales += 1;
    if (sale.refunded === true) out.refunded += 1;
    else if (sale.partially_refunded === true) out.partiallyRefunded += 1;
    if (sale.disputed === true) out.disputed += 1;
    if (sale.chargedback === true) out.chargedback += 1;
  }
  return out;
}

/** refunded / sales, or null when there is no sale to divide by. Never NaN, never Infinity. */
export function refundRate(count: Pick<RefundRateCount, "sales" | "refunded">): number | null {
  return count.sales > 0 ? count.refunded / count.sales : null;
}

/**
 * The KPI row's unit carries its two counts, the product, the window, and the counts shown beside the rate but not
 * counted as refunded (partly refunded, disputed, chargebacks not reversed).
 */
export function refundRateUnit(count: RefundRateCount, productId: string): string {
  return (
    `refunded ${count.refunded} of ${count.sales} sales · gumroad:${productId} · ` +
    `${count.windowDays} days to ${count.windowEnd} · partly refunded ${count.partiallyRefunded} · ` +
    `disputed ${count.disputed} · chargedback ${count.chargedback}`
  );
}

const REFUND_RATE_UNIT_RE =
  /^refunded (\d+) of (\d+) sales · (gumroad:\S*) · (\d+) days to (\S+) · partly refunded (\d+) · disputed (\d+) · chargedback (\d+)$/;

export interface RefundRateUnit {
  refunded: number;
  sales: number;
  productKey: string;
  windowDays: number;
  windowEnd: string;
  partiallyRefunded: number;
  disputed: number;
  chargedback: number;
}

export function parseRefundRateUnit(unit: unknown): RefundRateUnit | null {
  const m = typeof unit === "string" ? REFUND_RATE_UNIT_RE.exec(unit) : null;
  if (!m) return null;
  return {
    refunded: Number(m[1]),
    sales: Number(m[2]),
    productKey: m[3]!,
    windowDays: Number(m[4]),
    windowEnd: m[5]!,
    partiallyRefunded: Number(m[6]),
    disputed: Number(m[7]),
    chargedback: Number(m[8]),
  };
}

type RefundCounts = Pick<RefundRateCount, "sales" | "refunded" | "partiallyRefunded" | "disputed" | "chargedback" | "windowDays">;

/** Whether two readings carry the same counts over the same window length: the sync writes a new row only when not. */
export function sameRefundCounts(a: RefundCounts, b: RefundCounts): boolean {
  return (
    a.sales === b.sales &&
    a.refunded === b.refunded &&
    a.partiallyRefunded === b.partiallyRefunded &&
    a.disputed === b.disputed &&
    a.chargedback === b.chargedback &&
    a.windowDays === b.windowDays
  );
}

/** The Pro product's Gumroad id from the site's config (written by the product-creation job), or "" while unset. */
export function readProProductId(siteDir: string = DEFAULT_PRO_SITE_DIR): { productId: string; problem: string | null } {
  try {
    const raw = JSON.parse(readFileSync(join(siteDir, "src", "config", "site.json"), "utf8")) as { gumroad?: { productId?: unknown } };
    const id = raw.gumroad?.productId;
    return { productId: typeof id === "string" ? id.trim() : "", problem: null };
  } catch (error) {
    return { productId: "", problem: `site.json unreadable (${(error as Error).message})` };
  }
}

/**
 * Read every Pro sale Gumroad lists from one day before the window (so the day filter's time zone never cuts off a sale
 * inside it), then count exactly on each sale's own time. A refused page, more pages than MAX_REFUND_RATE_PAGES, or a
 * repeated next_page_key is an error: a partial count is never passed off as a rate.
 */
export async function readProRefundCount(params: {
  token: string;
  productId: string;
  nowIso: string;
  fetchImpl?: typeof fetch;
}): Promise<{ ok: true; count: RefundRateCount } | { ok: false; detail: string }> {
  const { token, productId, nowIso, fetchImpl = fetch } = params;
  const after = new Date(Date.parse(nowIso) - (REFUND_RATE_WINDOW_DAYS + 1) * DAY_MS).toISOString().slice(0, 10);
  const listing = await listGumroadSalesSince({ token, after, productId, fetchImpl });
  if (listing.ok) return { ok: true, count: countProRefunds(listing.sales, productId, nowIso) };
  if (listing.problem === "refused") {
    return { ok: false, detail: `GET /v2/sales for the Pro product was refused (HTTP ${listing.status}, page ${listing.page})` };
  }
  if (listing.problem === "looped") {
    return { ok: false, detail: `GET /v2/sales for the Pro product loops (page ${listing.pages} names as its next a page already asked for), so the count would not be complete` };
  }
  return { ok: false, detail: `more than ${MAX_REFUND_RATE_PAGES} pages of Pro sales since ${after}, so the count would not be complete` };
}

export type GumroadSalesListing =
  | { ok: true; sales: unknown[]; pages: number }
  | { ok: false; problem: "refused"; status: number; page: number }
  | { ok: false; problem: "too_many_pages"; pages: number }
  /** Page `pages` named as its next a page_key already asked for: the pages from it on would repeat (the tick-71 review). */
  | { ok: false; problem: "looped"; pages: number };

/**
 * Every sale `GET /v2/sales` lists from `after` (a day; Gumroad keeps `created_at >= after`), of one product when
 * `productId` is given, following `next_page_key` to the last page. A refused page, more than `maxPages` pages, or a
 * next_page_key already asked for (a loop) is not a listing: the caller gets which, never a partial list passed off as
 * the whole (what was read before the stop
 * reaches only an `onPage` caller). The token goes in the query, as the index asks, and nowhere else. Shared by the
 * refund-rate read, `colony.ts verify-gumroad` (RULING-2026-10-11-ledger-sale-ids.md, fold 6) and, since tick 71, the
 * ledger sync's `fetchSince`.
 */
export async function listGumroadSalesSince(params: {
  token: string;
  after: string;
  productId?: string;
  fetchImpl?: typeof fetch;
  maxPages?: number;
  /**
   * Called with each answered page's sales, in order, before the next page is asked for: what a caller read, also when
   * the listing is then refused or runs past the cap (tick 71: `fetchSince` books it, `verify-gumroad` names it).
   */
  onPage?: (sales: unknown[], page: number) => void;
}): Promise<GumroadSalesListing> {
  const { token, after, productId, fetchImpl = fetch, maxPages = MAX_REFUND_RATE_PAGES, onPage } = params;
  const sales: unknown[] = [];
  const asked = new Set<string>();
  let pageKey: string | null = null;
  for (let page = 1; page <= maxPages; page += 1) {
    const q = new URLSearchParams({ access_token: token });
    if (productId !== undefined) q.set("product_id", productId);
    q.set("after", after);
    if (pageKey) q.set("page_key", pageKey);
    const res = await fetchJson(fetchImpl, `https://api.gumroad.com/v2/sales?${q}`);
    if (!res.ok || res.body?.success !== true || !Array.isArray(res.body.sales)) {
      return { ok: false, problem: "refused", status: res.status, page };
    }
    sales.push(...res.body.sales);
    onPage?.(res.body.sales, page);
    pageKey = typeof res.body.next_page_key === "string" && res.body.next_page_key ? res.body.next_page_key : null;
    if (!pageKey) return { ok: true, sales, pages: page };
    if (asked.has(pageKey)) return { ok: false, problem: "looped", pages: page };
    asked.add(pageKey);
  }
  return { ok: false, problem: "too_many_pages", pages: maxPages };
}
