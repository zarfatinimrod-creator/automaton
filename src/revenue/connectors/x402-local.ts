/**
 * x402 / Conway credits connector — reads the automaton's own transactions
 * table for inbound transfers tagged with a revenue line.
 *
 * A director that sells a paid endpoint records inbound USDC/credits with a
 * description containing `[line:<id>]`; this connector turns those rows into
 * ledger entries without a network call.
 */

import type { Database } from "better-sqlite3";
import { extractLineTag, UNASSIGNED_LINE_ID } from "./types.js";
import type { LedgerEntryInput } from "../types.js";

export function readLocalTransfers(
  db: Database,
  cursorIso: string | undefined,
): { entries: LedgerEntryInput[]; nextCursor?: string } {
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
  let newest = since;
  for (const row of rows) {
    if (row.timestamp > newest) newest = row.timestamp;
    const lineId = extractLineTag(row.description);
    if (!lineId) continue; // untagged transfers are funding, not revenue
    const amount = Math.abs(Math.floor(Number(row.amountCents ?? 0)));
    if (amount <= 0) continue;
    entries.push({
      lineId: lineId ?? UNASSIGNED_LINE_ID,
      kind: "sale",
      amountMinor: amount,
      currency: "USD",
      source: "x402",
      externalId: row.id,
      occurredAt: row.timestamp,
      note: row.description,
    });
  }
  return { entries, nextCursor: newest };
}
