/**
 * Revenue Colony — the owner's float
 *
 * The owner has authorised a small pot of his own money, capped at ₪200, for
 * the unavoidable one-off fees that block a line from earning at all: a
 * developer-account fee, a domain, a store listing charge. Until now the rule
 * was absolute — never spend the owner's money — so this is the one place that
 * rule is relaxed, and it is relaxed under a checked ceiling rather than a
 * promise.
 *
 * Two deliberate choices, both conservative, both stated so the owner can
 * correct them:
 *
 * 1. **The cap is a total, not a monthly allowance.** ₪200 once. If he means
 *    ₪200 every month he can say so and `setOwnerFloatIls` raises it; guessing
 *    the more generous reading with someone else's money is not ours to do.
 * 2. **Spending from the float requires a receipt.** Ordinary cost entries may
 *    omit an external id, because our own compute has no platform receipt. This
 *    is different: it is real money leaving a real account, and a spend nobody
 *    can trace is exactly what an owner should refuse to fund.
 *
 * What the float must never become is a subscription. ₪200 against a recurring
 * charge is a slow death with a fixed end date, and the colony would be paying
 * rent it cannot cover out of revenue it does not yet have.
 */

import type { Database } from "better-sqlite3";
import { recordLedgerEntry } from "./ledger.js";
import { agorotFromIls, formatIls, toAgorot } from "./money.js";
import type { LedgerEntry } from "./types.js";

/** The owner's authorised ceiling, in agorot. Overridable via the kv store. */
export const DEFAULT_OWNER_FLOAT_AGOROT = agorotFromIls(200);

/** Ledger `source` that marks a spend as coming from the owner's own money. */
export const OWNER_FLOAT_SOURCE = "owner-float";

const FLOAT_CAP_KEY = "revenue.owner_float_agorot";

export interface OwnerFloatState {
  capAgorot: number;
  spentAgorot: number;
  remainingAgorot: number;
  spendCount: number;
}

function getCap(db: Database): number {
  const row = db.prepare("SELECT value FROM kv WHERE key = ?").get(FLOAT_CAP_KEY) as { value: string } | undefined;
  const parsed = row?.value ? Number(row.value) : NaN;
  return Number.isFinite(parsed) && parsed >= 0 ? Math.floor(parsed) : DEFAULT_OWNER_FLOAT_AGOROT;
}

/** Raise or lower the float. Only the owner decides this. */
export function setOwnerFloatIls(db: Database, ils: number): void {
  if (!Number.isFinite(ils) || ils < 0) throw new Error("the float must be a non-negative number of shekels");
  db.prepare("INSERT OR REPLACE INTO kv (key, value, updated_at) VALUES (?, ?, datetime('now'))")
    .run(FLOAT_CAP_KEY, String(agorotFromIls(ils)));
}

/** What is left of the owner's money. Spend is summed from the ledger itself. */
export function ownerFloatState(db: Database): OwnerFloatState {
  const capAgorot = getCap(db);
  const row = db
    .prepare(
      `SELECT COALESCE(SUM(ABS(amount_agorot)), 0) AS spent, COUNT(*) AS n
         FROM revenue_ledger WHERE source = ? AND kind = 'cost'`,
    )
    .get(OWNER_FLOAT_SOURCE) as { spent: number; n: number };
  const spentAgorot = Math.round(row.spent);
  return {
    capAgorot,
    spentAgorot,
    remainingAgorot: Math.max(0, capAgorot - spentAgorot),
    spendCount: row.n,
  };
}

/**
 * Throws unless this spend fits inside what the owner authorised. Call it
 * before committing to anything, not after — a refusal after the charge is not
 * a control, it is a record of a mistake.
 */
export function assertCanSpend(db: Database, agorot: number, purpose: string): void {
  if (!Number.isInteger(agorot) || agorot <= 0) {
    throw new Error("a spend must be a positive whole number of agorot");
  }
  const state = ownerFloatState(db);
  if (agorot > state.remainingAgorot) {
    throw new Error(
      `refusing to spend ${formatIls(agorot)} on "${purpose}": the owner authorised ` +
      `${formatIls(state.capAgorot)} in total, ${formatIls(state.spentAgorot)} is already spent, ` +
      `and ${formatIls(state.remainingAgorot)} remains. Ask him before going further; do not work around this.`,
    );
  }
}

export interface FloatSpendInput {
  lineId: string;
  /** Positive amount in the platform's minor units. */
  amountMinor: number;
  currency: string;
  /** The platform's receipt or transaction id. Required — this is real money. */
  externalId: string;
  /** What it bought, in plain words, for the owner to read. */
  purpose: string;
  occurredAt?: string;
}

/**
 * Record a spend of the owner's money. Checks the ceiling first, requires a
 * receipt, and writes it to the ledger like any other cost so the board, the
 * auditor and the dashboard all see it without special-casing.
 */
export function recordFloatSpend(db: Database, input: FloatSpendInput): LedgerEntry {
  if (!input.externalId?.trim()) {
    throw new Error(
      "a spend from the owner's float needs the platform's receipt id: it is his money, " +
      "and a charge nobody can trace is what an owner should refuse to fund",
    );
  }
  if (!input.purpose?.trim()) {
    throw new Error("say what the money bought — the owner reads this");
  }

  // Convert through the ledger's own rate table so the ceiling is enforced in
  // shekels even when the charge is in dollars, and so one conversion path
  // exists rather than a second hard-coded rate.
  const agorot = Math.abs(Math.round(toAgorot(db, Math.abs(input.amountMinor), input.currency)));
  assertCanSpend(db, agorot, input.purpose);

  const entry = recordLedgerEntry(db, {
    lineId: input.lineId,
    kind: "cost",
    amountMinor: Math.abs(input.amountMinor),
    currency: input.currency,
    source: OWNER_FLOAT_SOURCE,
    externalId: input.externalId.trim(),
    occurredAt: input.occurredAt,
    note: `owner float: ${input.purpose.trim()}`,
  });
  if (!entry) {
    throw new Error(
      `this spend was already recorded (${OWNER_FLOAT_SOURCE}/${input.externalId.trim()}). ` +
      "Nothing was charged twice.",
    );
  }
  return entry;
}
