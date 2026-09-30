/**
 * USDC receipts → ledger input: the one path every USDC connector takes (x402-local.ts today; any later wallet-paid
 * venue, such as a Superteam payout, the same way).
 *
 * The rule is RULING-2026-09-28-bounty-rail.md §6.2, and docs/OWNER_STEPS.he.md tells the owner the same: a USDC receipt
 * enters the ledger at its shekel value on the day of receipt, with the on-chain transaction hash as its platform
 * transaction id, flagged unconverted. The ledger sets the flag and applies the day's rate (ledger.ts
 * recordLedgerEntry); this helper makes sure a receipt that cannot meet the rule is HELD, with the reason, instead of
 * being booked some other way:
 *   - no on-chain hash: MISSION rule 2 — money counts only with the platform's transaction id, and a local row id is
 *     not one;
 *   - no rate recorded for the receipt's day: the value on that day is unknown, and no rate is invented (money.ts
 *     getFxRateOn has no fallback).
 *
 * Nothing here reads a wallet or moves funds: a receipt is a row somebody else's system already wrote.
 */

import type { Database } from "better-sqlite3";
import { chainTxId, getFxRateOn, receiptDay, toIsoInstant } from "../money.js";
import type { LedgerEntryInput, LedgerSource } from "../types.js";

export interface UsdcReceipt {
  lineId: string;
  /** "sale" for a buyer's payment, "payout" for a prize or bounty paid to the wallet. */
  kind?: "sale" | "payout";
  /** USDC in cents (2 decimals), as MINOR_UNITS.USDC reads it. */
  amountMinor: number;
  /** The on-chain transaction id (an EVM hash or a Solana signature), or null when the source did not give one. */
  txHash: string | null;
  /** When the USDC arrived: ISO, or a zone-less UTC time as SQLite writes it. Its Israeli calendar day picks the rate. */
  receivedAt: string;
  source: LedgerSource;
  note?: string | null;
}

export type UsdcHoldReason = "no_tx_hash" | "no_rate_for_day";

export type UsdcBooking =
  | { status: "bookable"; entry: LedgerEntryInput }
  | { status: "held"; reason: UsdcHoldReason; day: string; detail: string };

const TX_TAG_RE = /\[tx:(0x[0-9a-fA-F]{64})\]/;

/** The on-chain hash from a `[tx:0x<64 hex>]` tag, lower-cased so one transfer has one id; null without the tag. */
export function extractTxHash(description: string): string | null {
  return TX_TAG_RE.exec(description)?.[1].toLowerCase() ?? null;
}

export function usdcReceiptEntry(db: Database, receipt: UsdcReceipt): UsdcBooking {
  const receivedAt = toIsoInstant(receipt.receivedAt);
  const day = receiptDay(receivedAt);
  // The ledger refuses a USDC row whose id is not an on-chain transaction id; a malformed one is held like a missing one.
  const txId = chainTxId(receipt.txHash);
  if (!txId) {
    return {
      status: "held",
      reason: "no_tx_hash",
      day,
      detail: "no on-chain transaction id: money counts only with the platform's transaction id (MISSION rule 2), and a local row id is not one",
    };
  }
  if (getFxRateOn(db, "USDC", day) === null) {
    return {
      status: "held",
      reason: "no_rate_for_day",
      day,
      detail:
        `no ILS rate recorded for USDC on ${day}; it is booked at that day's value and no rate is invented. ` +
        `Record it with: pnpm exec tsx scripts/colony.ts fx --currency USDC --date ${day} --rate <ILS per USDC>`,
    };
  }
  return {
    status: "bookable",
    entry: {
      lineId: receipt.lineId,
      kind: receipt.kind ?? "sale",
      amountMinor: receipt.amountMinor,
      currency: "USDC",
      source: receipt.source,
      externalId: txId,
      occurredAt: receivedAt,
      note: receipt.note ?? null,
    },
  };
}
