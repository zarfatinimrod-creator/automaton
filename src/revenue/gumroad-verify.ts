/**
 * The re-derivation of the ledger's Gumroad rows (RULING-2026-10-11-ledger-sale-ids.md, C3 and decision 2 item 8).
 *
 * The ledger stores a Gumroad sale's id as `sha256:<hex>`, the unkeyed SHA-256 of the platform's own id, so the row is
 * verified by whoever holds the platform's credential: list the account's sales with the token, digest each id, and
 * match the ledger's rows. This is that check as code, read-only: it writes nothing, and `colony.ts verify-gumroad`
 * runs it on a query-only handle. Without the token it fetches nothing.
 *
 * What it reports, as counts, stored forms and days — never a raw sale id, an email or the token:
 * - a ledger row no listed sale explains (a finding);
 * - a matched row whose amount, currency or day differs from what the connector books for that sale, and a booked sale
 *   whose fee row is missing (a finding);
 * - a refund row whose sale Gumroad does not report refunded, and a refunded sale whose refund row is missing (a
 *   finding);
 * - a listed sale no row books ("unbooked"): a count, not a finding. Since tick 71 `fetchSince` reads every page (until
 *   then it read one page of ten, the ruling's "What this does not decide" 6), so it counts the sales the connector has
 *   not booked yet: made since the last sync, older than its first read, or past a listing the sync reported stopped.
 *   Whether it becomes a finding once `enable` opens the Pro sale is a ruling's, and no state in the repository records
 *   that `enable` has run.
 *
 * The listing is one read, from a day before the oldest Gumroad row to now, so it grows with the ledger. Past the pager's
 * cap (MAX_REFUND_RATE_PAGES pages of ten) it is "incomplete" and nothing is verified; the result then names the part
 * read (`readBeforeStop`: pages, sales, the days they were created on) and the part not read. It is not cut into date
 * chunks: no recorded source shows an upper bound the index accepts, or the order it lists sales in (tick 71).
 */

import type { Database } from "better-sqlite3";
import { FIRST_READ_DAYS, gumroadSaleEntries, listGumroadSalesSince, shiftDay } from "./connectors/gumroad.js";
import { storedExternalId } from "./money.js";
import type { LedgerEntryInput } from "./types.js";

export type GumroadVerifyStatus = "not_configured" | "incomplete" | "clean" | "findings";

/** One row or one sale, named by its stored form only (null for a row booked without an id). */
export interface GumroadVerifyItem {
  externalId: string | null;
  day: string;
}

export interface GumroadVerifyResult {
  status: GumroadVerifyStatus;
  /** One line: why nothing was verified, or what was compared. Never a raw id or the token. */
  detail: string;
  /** The day the listing started from (`after`), or null when nothing was fetched. */
  after: string | null;
  pages: number;
  ledgerRows: number;
  listedSales: number;
  matchedRows: number;
  /** Ledger rows no listed sale explains. A finding. */
  unexplained: GumroadVerifyItem[];
  /** Matched rows that differ from the sale, and booked sales whose fee row is missing. A finding. */
  differing: (GumroadVerifyItem & { fields: string[] })[];
  /** A refund row whose sale is not refunded, or a refunded sale with no refund row. A finding. */
  refundState: (GumroadVerifyItem & { problem: string })[];
  /** Listed sales no row books. A count, not a finding (see the header). */
  unbooked: GumroadVerifyItem[];
  findings: number;
  /**
   * On an incomplete listing, what the pager read before it stopped: its pages, their sales and the first and last day
   * those were created on (null when none has a readable `created_at`). Every page after them is the part not read, and
   * which days its sales fall on is not known. Null on every other status.
   */
  readBeforeStop: { pages: number; sales: number; earliestDay: string | null; latestDay: string | null } | null;
}

interface LedgerRow {
  amountMinor: number;
  currency: string;
  externalId: string | null;
  occurredAt: string;
}

/**
 * The UTC day of a stored time. `recordLedgerEntry` keeps `occurred_at` as it was given, so a row booked by hand with an
 * offset (`2026-10-05T01:00:00+03:00`) is read as the instant it names, the day the connector books for the same sale;
 * a time without a zone is read as written.
 */
const dayOf = (iso: string): string => {
  const t = /(?:Z|[+-]\d{2}:?\d{2})$/i.test(iso) ? Date.parse(iso) : Number.NaN;
  return Number.isNaN(t) ? iso.slice(0, 10) : new Date(t).toISOString().slice(0, 10);
};
const baseOf = (id: string): string => id.replace(/:(?:refund|fee)$/, "");

function empty(status: GumroadVerifyStatus, detail: string, after: string | null, ledgerRows: number): GumroadVerifyResult {
  return { status, detail, after, pages: 0, ledgerRows, listedSales: 0, matchedRows: 0, unexplained: [], differing: [], refundState: [], unbooked: [], findings: 0, readBeforeStop: null };
}

/** Compare the ledger's Gumroad rows with every sale the account lists from one day before the oldest of them. */
export async function verifyGumroadLedger(
  db: Database,
  params: { token: string | undefined; nowIso?: string; fetchImpl?: typeof fetch },
): Promise<GumroadVerifyResult> {
  const rows = db.prepare(
    `SELECT amount_minor AS amountMinor, currency, external_id AS externalId, occurred_at AS occurredAt
     FROM revenue_ledger WHERE source = 'gumroad' ORDER BY occurred_at, rowid`,
  ).all() as LedgerRow[];
  const token = params.token?.trim();
  if (!token) return empty("not_configured", "GUMROAD_ACCESS_TOKEN is not set: nothing fetched, nothing verified", null, rows.length);

  // One day before the oldest row, as the refund-rate read does, so Gumroad's day filter never cuts off a booked sale;
  // with no Gumroad row, where the connector's first read starts: FIRST_READ_DAYS back, plus one.
  const nowDay = dayOf(new Date(params.nowIso ? Date.parse(params.nowIso) : Date.now()).toISOString());
  const days = rows.map((r) => dayOf(r.occurredAt)).filter((d) => /^\d{4}-\d{2}-\d{2}$/.test(d)).sort();
  const after = shiftDay(days[0] ?? shiftDay(nowDay, -FIRST_READ_DAYS), -1);

  const read: unknown[] = [];
  const listing = await listGumroadSalesSince({ token, after, fetchImpl: params.fetchImpl, onPage: (sales) => { read.push(...sales); } });
  if (!listing.ok) {
    // One listing, cut nowhere (the header): name exactly the pages read and their days, and the pages not read.
    const pagesRead = listing.problem === "refused" ? listing.page - 1 : listing.pages;
    const created = read
      .map((s) => Date.parse(String((s as { created_at?: unknown } | null)?.created_at ?? "")))
      .filter((t) => !Number.isNaN(t))
      .map((t) => new Date(t).toISOString().slice(0, 10))
      .sort();
    const readBeforeStop = { pages: pagesRead, sales: read.length, earliestDay: created[0] ?? null, latestDay: created.at(-1) ?? null };
    const why = listing.problem === "refused"
      ? `GET /v2/sales was refused (HTTP ${listing.status}, page ${listing.page})`
      : `more than ${listing.pages} pages of sales since ${after}`;
    const span = readBeforeStop.earliestDay ? `, created ${readBeforeStop.earliestDay} to ${readBeforeStop.latestDay}` : "";
    const unread = listing.problem === "refused" ? `page ${listing.page} and any page after it` : `every page after page ${listing.pages}`;
    const detail =
      `${why}. Read: ${pagesRead} page(s), ${read.length} sale(s)${span}; not read: ${unread}. Which days the unread ` +
      "pages' sales fall on is not known (the order the index lists sales in is not recorded), so nothing was verified";
    return { ...empty("incomplete", detail, after, rows.length), readBeforeStop };
  }

  // What the connector books for each listed sale, keyed on the stored id (lineId plays no part in the comparison).
  const expected = new Map<string, { entry: LedgerEntryInput; datable: boolean }>();
  const listed = new Set<string>();
  for (const sale of listing.sales as any[]) {
    if (!sale || typeof sale !== "object" || sale.id === undefined || sale.id === null) continue;
    const datable = !Number.isNaN(Date.parse(String(sale.created_at ?? "")));
    for (const entry of gumroadSaleEntries(sale, "")) {
      expected.set(entry.externalId!, { entry, datable });
      if (entry.kind === "sale") listed.add(entry.externalId!);
    }
  }

  const result: GumroadVerifyResult = {
    status: "clean", detail: "", after, pages: listing.pages, ledgerRows: rows.length, listedSales: listed.size,
    matchedRows: 0, unexplained: [], differing: [], refundState: [], unbooked: [], findings: 0, readBeforeStop: null,
  };
  const booked = new Set<string>();
  for (const row of rows) {
    // A raw id (the chief auditor's C4 finding) is matched by its digest, and named by it: no raw id is ever printed.
    const id = storedExternalId("gumroad", row.externalId);
    const day = dayOf(row.occurredAt);
    if (id === null) {
      result.unexplained.push({ externalId: null, day });
      continue;
    }
    booked.add(id);
    const hit = expected.get(id);
    if (!hit) {
      if (id.endsWith(":refund") && listed.has(baseOf(id))) {
        result.refundState.push({ externalId: id, day, problem: "a refund row whose sale Gumroad does not report refunded" });
      } else {
        result.unexplained.push({ externalId: id, day });
      }
      continue;
    }
    result.matchedRows += 1;
    const fields: string[] = [];
    if (Math.abs(row.amountMinor) !== hit.entry.amountMinor) fields.push("amount");
    if (row.currency !== hit.entry.currency) fields.push("currency");
    if (hit.datable && day !== dayOf(hit.entry.occurredAt!)) fields.push("day");
    if (fields.length) result.differing.push({ externalId: id, day, fields });
  }

  for (const [id, { entry }] of expected) {
    if (booked.has(id)) continue;
    const day = dayOf(entry.occurredAt!);
    if (entry.kind === "sale") {
      result.unbooked.push({ externalId: id, day });
    } else if (booked.has(baseOf(id))) {
      // The sale is booked and one of its own rows is not.
      if (entry.kind === "refund") result.refundState.push({ externalId: id, day, problem: "a refunded sale with no refund row" });
      else result.differing.push({ externalId: id, day, fields: ["fee row missing"] });
    }
  }

  result.findings = result.unexplained.length + result.differing.length + result.refundState.length;
  result.status = result.findings > 0 ? "findings" : "clean";
  result.detail =
    `${rows.length} ledger row(s) compared with ${listed.size} sale(s) Gumroad lists since ${after} ` +
    `(${listing.pages} page(s)): ${result.matchedRows} matched, ${result.findings} finding(s)`;
  return result;
}

/** The command's prose: counts, then one line per finding with its stored form and day. */
export function renderGumroadVerify(result: GumroadVerifyResult): string {
  const head = "Gumroad ledger verification (RULING-2026-10-11-ledger-sale-ids.md C3)";
  if (result.status === "not_configured") return `${head}: not configured — ${result.detail}.`;
  if (result.status === "incomplete") return `${head}: incomplete — ${result.detail}.`;
  const name = (item: GumroadVerifyItem) => `${item.externalId ?? "(a row booked with no id)"} ${item.day}`;
  const lines = [
    `${head}: ${result.detail}.`,
    `  rows no listed sale explains: ${result.unexplained.length}`,
    `  rows that differ from their sale (amount, currency, day, a missing fee row): ${result.differing.length}`,
    `  refund rows whose sale is not refunded, and refunded sales with no refund row: ${result.refundState.length}`,
    `  listed sales no row books (unbooked; a count, not a finding): ${result.unbooked.length}`,
    ...result.unexplained.map((i) => `  - unexplained: ${name(i)}`),
    ...result.differing.map((i) => `  - differs (${i.fields.join(", ")}): ${name(i)}`),
    ...result.refundState.map((i) => `  - refund state: ${name(i)} — ${i.problem}`),
    `Findings: ${result.findings}.`,
  ];
  return lines.join("\n");
}
