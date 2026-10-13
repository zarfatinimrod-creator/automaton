/**
 * Placing a hand-booked Gumroad sale on the day Gumroad made it (RULING-2026-10-13-gumroad-refund-reread.md §3 items 2
 * and 3, fold 6; FABLE_QUEUE row 32).
 *
 * The hourly sync's own listing and its late-refund re-read take their reach from the day the ledger dates each open
 * Gumroad sale (connectors/gumroad.ts; heartbeat.ts `openGumroadSales`). The connector dates every sale it books at
 * Gumroad's `created_at`; a sale booked by hand days after Gumroad made it, dated at its booking, lies where no listing
 * returns it, its refund is never read, and the sync says so at every sync (the unlisted line). Since the ruling a hand
 * booking must carry `created_at` (ledger.ts `gumroadHandSaleRefusal`); a row booked before that, or a mistake, is
 * closed here.
 *
 * It is placed, not flagged or silenced: the row's `occurred_at` — and that of its `:refund` and `:fee` rows, which the
 * connector dates at the sale — is set to the `created_at` of the one sale Gumroad's own listing returns whose digest
 * is the row's stored id. The value comes from the live listing alone; the day given (`listedFrom`) only says where the
 * listing starts. It writes only when the listing was read to its end (through the shared pager, under the sync's cap,
 * MAX_LEDGER_SYNC_PAGES) and exactly one listed sale matches; it prints the stored form, the old and new days and the
 * rows moved, never a raw id, an address or the token. After it the next re-read returns the sale and the unlisted line
 * ends by itself, and `verify-gumroad` finds the row's day as Gumroad's.
 *
 * The colony runs it — a session, or the tick's workflow through its `place_sale` dispatch input
 * (.github/workflows/colony.yml), in the job that holds the token — never the owner, who does no manual ops and never
 * touches a sale (MISSION rule 1). The old value stays in the history of the committed colony.db. It is the one write to
 * an existing ledger row: one column, one source, one sale's family, a value the platform gives; no amount, id, line or
 * kind moves.
 */

import type { Database } from "better-sqlite3";
import { listGumroadSalesSince, MAX_LEDGER_SYNC_PAGES } from "./connectors/gumroad.js";
import { storedExternalId } from "./money.js";

/** A Gumroad sale's stored id: `sha256:` and 64 lower-case hex digits, with no `:refund` or `:fee`. */
const STORED_SALE_ID_RE = /^sha256:[0-9a-f]{64}$/;
const DAY_RE = /^\d{4}-\d{2}-\d{2}$/;
const DAY_MS = 86_400_000;

/**
 * Whether `day` is a real YYYY-MM-DD date (it must read back as itself: Date.parse takes "2026-02-30" as 2026-03-02) no
 * later than `latestDay`. The check `isCursorDay` makes in connectors/gumroad.ts, which does not export it; duplicated
 * here rather than edited there. `colony.ts verify-gumroad --since` checks its day with it too.
 */
export function isListingDay(day: string, latestDay: string): boolean {
  const t = Date.parse(`${day}T00:00:00.000Z`);
  return DAY_RE.test(day) && !Number.isNaN(t) && new Date(t).toISOString().slice(0, 10) === day && day <= latestDay;
}

/** Tomorrow in UTC from `nowIso` (else the clock): a `created_at` written east of UTC is up to a day ahead. */
export function latestListingDay(nowIso?: string): string {
  const now = nowIso ? Date.parse(nowIso) : Date.now();
  return new Date((Number.isNaN(now) ? Date.now() : now) + DAY_MS).toISOString().slice(0, 10);
}

export type PlaceGumroadSaleStatus = "not_configured" | "invalid" | "not_placed" | "unchanged" | "placed";

export interface PlaceGumroadSaleResult {
  status: PlaceGumroadSaleStatus;
  /**
   * The command's exit code: 0 placed, or already on Gumroad's day; 1 an argument refused (nothing fetched); 2 no token
   * (nothing fetched); 3 not placed (nothing written).
   */
  exitCode: 0 | 1 | 2 | 3;
  /** What the command prints, a line each: stored forms and days only, never a raw id, an address or the token. */
  lines: string[];
}

/** The UTC day the sync's reaches read a stored time on (`readLateGumroadRefunds` parses it as this does). */
function dayOf(occurredAt: string): string {
  const t = Date.parse(occurredAt);
  return Number.isNaN(t) ? "an unreadable time" : new Date(t).toISOString().slice(0, 10);
}

const result = (status: PlaceGumroadSaleStatus, exitCode: PlaceGumroadSaleResult["exitCode"], lines: string[]): PlaceGumroadSaleResult =>
  ({ status, exitCode, lines });

/**
 * Place the hand-booked Gumroad sale `id` (its stored form) on the day Gumroad made it, read from Gumroad's own listing
 * from `listedFrom`. See the header for what it writes and when.
 */
export async function placeGumroadSale(
  db: Database,
  params: { id: string; listedFrom: string; token: string | undefined; fetchImpl?: typeof fetch; nowIso?: string },
): Promise<PlaceGumroadSaleResult> {
  const token = params.token?.trim();
  if (!token) {
    return result("not_configured", 2, ["place-gumroad-sale: not configured — GUMROAD_ACCESS_TOKEN is not set: nothing fetched, nothing written."]);
  }
  const id = params.id.trim();
  // The id given is never echoed: a raw sale id typed by mistake would land in a log.
  if (!STORED_SALE_ID_RE.test(id)) {
    return result("invalid", 1, [
      "--id must be a Gumroad sale's stored id, sha256: and 64 lower-case hex digits with no :refund or :fee (as the " +
      "ledger, verify-gumroad and the sync's unlisted line print it); the id given is not, and is not printed",
    ]);
  }
  const latestDay = latestListingDay(params.nowIso);
  if (!isListingDay(params.listedFrom, latestDay)) {
    return result("invalid", 1, [
      `--listed-from must be a real day, YYYY-MM-DD, no later than ${latestDay} (tomorrow in UTC): the day Gumroad's ` +
      "listing starts from, on or before the day Gumroad made the sale",
    ]);
  }

  // The sale's family as the ledger holds it under source gumroad: the sale, its refund and its fee, by stored id; a row
  // from before RULING-2026-10-11-ledger-sale-ids.md, its raw id in the row, is found by its digest.
  const family = (db.prepare(
    `SELECT kind, external_id AS externalId, occurred_at AS occurredAt FROM revenue_ledger
     WHERE source = 'gumroad' AND external_id IS NOT NULL ORDER BY rowid`,
  ).all() as { kind: string; externalId: string; occurredAt: string }[])
    .map((row) => ({ ...row, storedId: storedExternalId("gumroad", row.externalId)! }))
    .filter((row) => row.storedId === id || row.storedId === `${id}:refund` || row.storedId === `${id}:fee`);
  const sales = family.filter((row) => row.kind === "sale" && row.storedId === id);
  if (sales.length !== 1) {
    return result("not_placed", 3, [
      sales.length === 0
        ? `no Gumroad sale ${id} is in the ledger: nothing to place, nothing fetched, nothing written.`
        : `${sales.length} Gumroad sale rows in the ledger have the stored id ${id}: which one to place is not known, ` +
          "nothing fetched, nothing written.",
    ]);
  }
  const sale = sales[0]!;

  const read: unknown[] = [];
  const listing = await listGumroadSalesSince({
    token, after: params.listedFrom, fetchImpl: params.fetchImpl, maxPages: MAX_LEDGER_SYNC_PAGES,
    onPage: (page) => { read.push(...page); },
  });
  if (!listing.ok) {
    const why = listing.problem === "refused"
      ? `GET /v2/sales since ${params.listedFrom} was refused (HTTP ${listing.status}, page ${listing.page})`
      : listing.problem === "looped"
        ? `GET /v2/sales since ${params.listedFrom} loops (page ${listing.pages} names as its next a page already asked for)`
        : `GET /v2/sales since ${params.listedFrom} runs past ${listing.pages} pages`;
    return result("not_placed", 3, [
      `${why}: the listing was not read to its end, so a sale on a page not read may be the one or another with its id; ` +
      `${id} was not placed, nothing written.`,
    ]);
  }
  const matches = (read as any[]).filter(
    (s) => s && s.id !== undefined && s.id !== null && storedExternalId("gumroad", String(s.id)) === id,
  );
  if (matches.length !== 1) {
    return result("not_placed", 3, [
      matches.length === 0
        ? `no sale Gumroad lists since ${params.listedFrom} has the stored id ${id} (${read.length} sale(s), ` +
          `${listing.pages} page(s)): list from an earlier day, or the row's id is not a Gumroad sale's; nothing written.`
        : `${matches.length} sales Gumroad lists since ${params.listedFrom} have the stored id ${id}: which day is ` +
          "Gumroad's is not known, nothing written.",
    ]);
  }
  const created = Date.parse(String(matches[0].created_at ?? ""));
  if (Number.isNaN(created)) {
    return result("not_placed", 3, [`the sale Gumroad lists with the stored id ${id} has no created_at Date.parse reads: nothing written.`]);
  }
  // Gumroad's time, in the form the connector books it at (gumroadSaleEntries): the re-read, verify-gumroad and the
  // ledger's windows then read the row as they read a sale the connector booked.
  const occurredAt = new Date(created).toISOString();
  const oldDay = dayOf(sale.occurredAt);
  const newDay = occurredAt.slice(0, 10);
  if (oldDay === newDay) {
    return result("unchanged", 0, [`${id} is already dated ${newDay}, the day Gumroad made it: nothing written.`]);
  }
  const update = db.prepare("UPDATE revenue_ledger SET occurred_at = ? WHERE source = 'gumroad' AND external_id = ?");
  db.transaction(() => {
    for (const row of family) update.run(occurredAt, row.externalId);
  })();
  return result("placed", 0, [
    `placed ${id}: ${oldDay} → ${newDay}`,
    `  rows moved: ${family.map((row) => `${row.storedId} (${row.kind})`).join(", ")}`,
  ]);
}
