/**
 * x402 / Conway credits connector — reads the automaton's own transactions
 * table for inbound transfers tagged with a revenue line.
 *
 * A director that sells a paid endpoint records inbound USDC/credits with a
 * description containing `[line:<id>]`; this connector turns those rows into
 * ledger entries without a network call.
 *
 * x402 settles in USDC, so every tagged row is a USDC receipt and goes through
 * the shared USDC path (usdc.ts, RULING-2026-09-28-bounty-rail.md §6.2): its id
 * is the on-chain hash from a `[tx:0x…]` tag in the description, it is valued at
 * its receipt day's rate, and the ledger flags it unconverted. A receipt that
 * cannot be booked so (no hash, or no rate for its day) is held: not booked,
 * listed in `held`, and read again by its row id at every sync (the caller keeps
 * the ids: ledger.ts getX402HeldRows) until it can be booked. The cursor never
 * waits for a held row: a receipt that can never be booked as written (no hash)
 * would otherwise stop every receipt after it from being read.
 *
 * Only `transfer_in` rows are read. A `credit_purchase` is the automaton spending
 * wallet USDC on Conway credits (src/agent/tools.ts): money leaving, not a receipt.
 */

import type { Database } from "better-sqlite3";
import { extractLineTag } from "./types.js";
import { extractTxHash, usdcReceiptEntry, type UsdcHoldReason } from "./usdc.js";
import type { LedgerEntryInput } from "../types.js";

export interface HeldReceipt {
  rowId: string;
  reason: UsdcHoldReason;
  detail: string;
}

/** Rows read per sync. The cursor moves on from each page, so a longer backlog is read over the next syncs. */
export const X402_PAGE_SIZE = 500;

type TransferRow = { id: string; type: string; amountCents: number | null; description: string; timestamp: string };

const COLUMNS = "id, type, amount_cents AS amountCents, description, created_at AS timestamp";

export function readLocalTransfers(
  db: Database,
  cursorIso: string | undefined,
  heldRowIds: readonly string[] = [],
): { entries: LedgerEntryInput[]; nextCursor?: string; held: HeldReceipt[] } {
  const since = cursorIso ?? new Date(Date.now() - 30 * 86_400_000).toISOString();
  const fresh = db
    .prepare(
      `SELECT ${COLUMNS} FROM transactions
       WHERE type = 'transfer_in' AND created_at > ?
       ORDER BY created_at ASC, id ASC
       LIMIT ${X402_PAGE_SIZE}`,
    )
    .all(since) as TransferRow[];
  const freshIds = new Set(fresh.map((r) => r.id));
  const again = heldRowIds.length === 0 ? [] : (db
    .prepare(
      `SELECT ${COLUMNS} FROM transactions
       WHERE type = 'transfer_in' AND id IN (SELECT value FROM json_each(?))
       ORDER BY created_at ASC, id ASC`,
    )
    .all(JSON.stringify(heldRowIds)) as TransferRow[]).filter((r) => !freshIds.has(r.id));

  const entries: LedgerEntryInput[] = [];
  const held: HeldReceipt[] = [];
  for (const row of [...again, ...fresh]) {
    const lineId = extractLineTag(row.description);
    if (!lineId) continue; // untagged transfers are funding, not revenue
    const amount = Math.abs(Math.floor(Number(row.amountCents ?? 0)));
    if (amount <= 0) continue;
    const booking = usdcReceiptEntry(db, {
      lineId,
      amountMinor: amount,
      txHash: extractTxHash(row.description),
      receivedAt: row.timestamp,
      source: "x402",
      note: row.description,
    });
    if (booking.status === "bookable") {
      entries.push(booking.entry);
    } else {
      const remedy = booking.reason === "no_tx_hash"
        ? "; add the settlement's hash to that row's description as a [tx:0x…] tag and it is booked at the next sync"
        : "";
      held.push({ rowId: row.id, reason: booking.reason, detail: `${booking.detail}${remedy}` });
    }
  }

  // The cursor reads `created_at > cursor`. After a full page it stops before the page's last timestamp, so rows that
  // share it but fell past the limit are read next time (the ledger skips the ones already booked).
  let nextCursor = fresh.length ? fresh[fresh.length - 1].timestamp : since;
  if (fresh.length === X402_PAGE_SIZE) {
    const last = nextCursor;
    const earlier = [...fresh].reverse().find((r) => r.timestamp < last);
    if (earlier) nextCursor = earlier.timestamp;
  }
  return { entries, nextCursor, held };
}
