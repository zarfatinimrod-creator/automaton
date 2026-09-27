/**
 * Revenue Colony — the owner's float
 *
 * **The float is ₪0.** On 27.9.2026 the owner set the rule in their own words:
 * start without spending money; once money comes in and they see that it works
 * and earns, they are ready to put money in; until then, find ways where they
 * pay nothing, "not even one shekel". So nothing in the colony may spend the
 * owner's money by default, and `assertCanSpend` refuses every amount.
 *
 * History, kept because a suspended authorisation is not a forgotten one: on
 * 3.9.2026 the owner authorised a one-off pot capped at ₪200 for unavoidable
 * one-off fees (a developer-account fee, a domain, a store listing charge). That
 * ₪200 is SUSPENDED by the 27.9 rule. It comes back only when two things are
 * both true: the ledger shows income, and the owner says so. The colony does not
 * decide that the first condition implies the second. Only the owner raises the
 * ceiling, through `setOwnerFloatIls`; a session that calls it without the
 * owner's words in hand is working around the owner, not for them.
 *
 * What stays true whatever the ceiling is, so it is still enforced here:
 *
 * 1. **The cap is a total, not a monthly allowance.** If the owner raises it
 *    and means a monthly amount, they can say so; guessing the more generous
 *    reading with someone else's money is not ours to do.
 * 2. **Spending from the float requires a receipt.** Ordinary cost entries may
 *    omit an external id, because our own compute has no platform receipt. This
 *    is different: it is real money leaving a real account, and a spend nobody
 *    can trace is exactly what an owner should refuse to fund.
 * 3. **The float never becomes a subscription.** A recurring charge against a
 *    fixed pot is a slow death with a fixed end date: the colony would be paying
 *    rent out of revenue it does not yet have.
 */

import type { Database } from "better-sqlite3";
import { recordLedgerEntry } from "./ledger.js";
import { agorotFromIls, formatIls, toAgorot } from "./money.js";
import type { LedgerEntry } from "./types.js";

/**
 * The owner's authorised ceiling, in agorot: ₪0, by the owner's rule of
 * 27.9.2026. The ₪200 of 3.9.2026 is suspended, not the default. The kv store
 * holds an override, and only the owner's word puts one there (`setOwnerFloatIls`).
 */
export const DEFAULT_OWNER_FLOAT_AGOROT = 0;

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

/**
 * Raise or lower the float. Only the owner decides this: call it only with the
 * owner's own words recorded (MISSION.md), never because the ledger started to
 * show income — income is the owner's condition for deciding, not the decision.
 */
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
  if (state.capAgorot === 0) {
    throw new Error(
      `refusing to spend ${formatIls(agorot)} on "${purpose}": the owner's float is ₪0. Their rule of 27.9.2026 is ` +
      "to start without spending money and to put money in only once income arrives and they see it works — until " +
      "then they pay nothing, not even one shekel. The ₪200 authorised on 3.9.2026 is suspended until the ledger " +
      "shows income AND the owner says so; only the owner raises the ceiling (setOwnerFloatIls). Find the free way " +
      "or ask them; do not work around this.",
    );
  }
  if (agorot > state.remainingAgorot) {
    throw new Error(
      `refusing to spend ${formatIls(agorot)} on "${purpose}": the owner authorised ` +
      `${formatIls(state.capAgorot)} in total, ${formatIls(state.spentAgorot)} is already spent, ` +
      `and ${formatIls(state.remainingAgorot)} remains. Ask them before going further; do not work around this.`,
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
      "a spend from the owner's float needs the platform's receipt id: it is their money, " +
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
