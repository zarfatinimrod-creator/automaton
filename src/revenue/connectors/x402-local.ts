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
 * listed in `held`, and the cursor stays before it, so it is read — and reported —
 * again at every sync until it can be booked.
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

export function readLocalTransfers(
  db: Database,
  cursorIso: string | undefined,
): { entries: LedgerEntryInput[]; nextCursor?: string; held: HeldReceipt[] } {
  const since = cursorIso ?? new Date(Date.now() - 30 * 86_400_000).toISOString();
  const rows = db
    .prepare(
      `SELECT id, type, amount_cents AS amountCents, description, created_at AS timestamp
       FROM transactions
       WHERE type IN ('transfer_in', 'credit_purchase')
         AND created_at > ?
       ORDER BY created_at ASC
       LIMIT 500`,
    )
    .all(since) as Array<{ id: string; type: string; amountCents: number | null; description: string; timestamp: string }>;

  const entries: LedgerEntryInput[] = [];
  const held: HeldReceipt[] = [];
  let newest = since;
  let firstHeldAt: string | undefined;
  for (const row of rows) {
    if (row.timestamp > newest) newest = row.timestamp;
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
      held.push({ rowId: row.id, reason: booking.reason, detail: booking.detail });
      firstHeldAt ??= row.timestamp;
    }
  }

  // The cursor reads `created_at > cursor`, so it must stop strictly before the first held row. Rows after it are read
  // again next time; their on-chain ids make the ledger skip the ones already booked.
  const nextCursor = firstHeldAt === undefined
    ? newest
    : rows.reduce((c, r) => (r.timestamp < firstHeldAt! && r.timestamp > c ? r.timestamp : c), since);
  return { entries, nextCursor, held };
}
