/**
 * Money helpers for the revenue colony.
 *
 * Everything is integer minor units. ILS agorot is the reporting currency.
 */

import type { Database } from "better-sqlite3";
import { REVENUE_KV } from "./types.js";

/** Fallback ILS per one unit of currency when no rate is stored in KV. */
export const DEFAULT_FX_ILS: Record<string, number> = {
  ILS: 1,
  USD: 3.6,
  USDC: 3.6,
  EUR: 3.9,
  GBP: 4.5,
};

/** Minor units per major unit for supported currencies. */
export const MINOR_UNITS: Record<string, number> = {
  ILS: 100,
  USD: 100,
  USDC: 100,
  EUR: 100,
  GBP: 100,
};

export function normalizeCurrency(currency: string): string {
  return currency.trim().toUpperCase();
}

export function getFxRate(db: Database, currency: string): number {
  const code = normalizeCurrency(currency);
  if (code === "ILS") return 1;
  const row = db
    .prepare("SELECT value FROM kv WHERE key = ?")
    .get(`${REVENUE_KV.fxPrefix}${code}`) as { value: string } | undefined;
  if (row?.value) {
    const parsed = Number(row.value);
    if (Number.isFinite(parsed) && parsed > 0) return parsed;
  }
  const fallback = DEFAULT_FX_ILS[code];
  // No invented rate: a code with neither a stored rate nor a default of its own is refused, never valued at 3.6.
  if (fallback === undefined) throw new Error(`no rate for ${code}: none is stored and it has no default, and no rate is invented`);
  return fallback;
}

export function setFxRate(db: Database, currency: string, ilsPerUnit: number): void {
  if (!Number.isFinite(ilsPerUnit) || ilsPerUnit <= 0) {
    throw new Error(`Invalid FX rate for ${currency}: ${ilsPerUnit}`);
  }
  db.prepare(
    "INSERT OR REPLACE INTO kv (key, value, updated_at) VALUES (?, ?, datetime('now'))",
  ).run(`${REVENUE_KV.fxPrefix}${normalizeCurrency(currency)}`, String(ilsPerUnit));
}

/** Convert minor units of `currency` to ILS agorot using the stored rate. */
export function toAgorot(db: Database, amountMinor: number, currency: string): number {
  return toAgorotAtRate(amountMinor, currency, getFxRate(db, currency));
}

/** Convert minor units of `currency` to ILS agorot at a given rate (ILS per unit). */
export function toAgorotAtRate(amountMinor: number, currency: string, ilsPerUnit: number): number {
  const minor = MINOR_UNITS[normalizeCurrency(currency)] ?? 100;
  // minor → major → ILS → agorot
  return Math.round((amountMinor / minor) * ilsPerUnit * 100);
}

// ─── Unconverted money (RULING-2026-09-28-bounty-rail.md §6.2) ───

/**
 * Currencies that arrive in the owner's wallet rather than his bank. A ledger row in one of them is flagged
 * `unconverted`: it is booked at its shekel value on the day of receipt, shown as its own number, and no target, floor
 * or rule counts it. §6.2 describes no conversion flow ("whether and how USDC becomes ILS is the owner's later
 * decision"), so nothing un-flags a row.
 */
export const UNCONVERTED_CURRENCIES: ReadonlySet<string> = new Set(["USDC"]);

/**
 * Money that reaches a bank or a payment platform's balance, never a wallet: the fiat codes with a rate and minor units
 * of their own above. The ledger books these two sets and refuses every other code (USDT, SOL, USDbC, EURC, PYUSD…):
 * booking one as converted would put wallet money into targets at an invented rate.
 */
export const CONVERTED_CURRENCIES: ReadonlySet<string> = new Set(["ILS", "USD", "EUR", "GBP"]);

export function isUnconvertedCurrency(currency: string): boolean {
  return UNCONVERTED_CURRENCIES.has(normalizeCurrency(currency));
}

/**
 * Sources that pay into a wallet, never a bank. Their money is USDC (§6.2), so a fiat entry from one of them is
 * refused: x402 settles USDC, and a Superteam bounty pays USDC to the claimed wallet.
 */
export const WALLET_SOURCES: ReadonlySet<string> = new Set(["x402", "superteam"]);

const EVM_TX_HASH_RE = /^0x[0-9a-fA-F]{64}$/;
/** A Solana transaction signature: 64 bytes in base58 (no 0, O, I or l), 86 to 88 characters. */
const SOLANA_SIGNATURE_RE = /^[1-9A-HJ-NP-Za-km-z]{86,88}$/;

/**
 * An on-chain transaction id in its one canonical form, or null when `id` is not one: an EVM hash lower-cased (hex is
 * case-blind, so one transfer has one id), a Solana signature as given (base58 is case-sensitive).
 */
export function chainTxId(id: string | null | undefined): string | null {
  const text = id?.trim() ?? "";
  if (EVM_TX_HASH_RE.test(text)) return text.toLowerCase();
  if (SOLANA_SIGNATURE_RE.test(text)) return text;
  return null;
}

const ISRAEL_DAY = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Asia/Jerusalem",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

/** A date and time with no zone, as SQLite's datetime('now') writes it: "YYYY-MM-DD HH:MM:SS". */
const ZONELESS_RE = /^\d{4}-\d{2}-\d{2}[ T]\d{2}:\d{2}(?::\d{2}(?:\.\d+)?)?$/;

/**
 * An instant as ISO UTC. A time with no zone is UTC — SQLite's datetime('now') writes UTC without saying so — and is
 * never read in the machine's own zone, which would date a receipt by wherever the code happens to run.
 */
export function toIsoInstant(text: string): string {
  const trimmed = text.trim();
  const ms = Date.parse(ZONELESS_RE.test(trimmed) ? `${trimmed.replace(" ", "T")}Z` : trimmed);
  if (Number.isNaN(ms)) throw new Error(`receipt time is not a date: ${text}`);
  return new Date(ms).toISOString();
}

/** The Israeli calendar day (YYYY-MM-DD) of an instant: the day whose rate values a receipt. */
export function receiptDay(iso: string): string {
  return ISRAEL_DAY.format(new Date(toIsoInstant(iso)));
}

const DAY_RE = /^\d{4}-\d{2}-\d{2}$/;

function fxDayKey(currency: string, day: string): string {
  if (!DAY_RE.test(day) || new Date(`${day}T00:00:00.000Z`).toISOString().slice(0, 10) !== day) {
    throw new Error(`Invalid day for an FX rate: ${day} (use YYYY-MM-DD)`);
  }
  return `${REVENUE_KV.fxPrefix}${normalizeCurrency(currency)}.${day}`;
}

/**
 * The rate recorded for one day, or null. Never a fallback: an undated rate or DEFAULT_FX_ILS is not the value on the
 * day of receipt, and §6.2 books at that value. A receipt whose day has no rate is held, not guessed.
 */
export function getFxRateOn(db: Database, currency: string, day: string): number | null {
  const row = db.prepare("SELECT value FROM kv WHERE key = ?").get(fxDayKey(currency, day)) as { value: string } | undefined;
  const parsed = Number(row?.value);
  return row?.value && Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

/**
 * Record the rate (ILS per unit) of one day, e.g. the Bank of Israel representative rate for that day. Only for a
 * wallet currency (a converted booking reads the undated rate, so a dated one would be ignored), and only for a day
 * that has come in Israel: a rate for a later day is a guess the ledger would later treat as that day's real rate.
 */
export function setFxRateOn(db: Database, currency: string, day: string, ilsPerUnit: number, nowIso = new Date().toISOString()): void {
  const key = fxDayKey(currency, day);
  if (!isUnconvertedCurrency(currency)) {
    throw new Error(
      `a day's rate is recorded only for wallet money (${[...UNCONVERTED_CURRENCIES].join(", ")}); ` +
      `${normalizeCurrency(currency)} is booked at its undated rate and would never read it`,
    );
  }
  const today = receiptDay(nowIso);
  if (day > today) throw new Error(`${day} has not come yet in Israel (today is ${today}): a rate for it would be a guess`);
  if (!Number.isFinite(ilsPerUnit) || ilsPerUnit <= 0) {
    throw new Error(`Invalid FX rate for ${currency} on ${day}: ${ilsPerUnit}`);
  }
  db.prepare("INSERT OR REPLACE INTO kv (key, value, updated_at) VALUES (?, ?, datetime('now'))").run(key, String(ilsPerUnit));
}

export function formatIls(agorot: number): string {
  const sign = agorot < 0 ? "-" : "";
  const abs = Math.abs(agorot);
  const whole = Math.floor(abs / 100);
  const frac = abs % 100;
  return `${sign}₪${whole.toLocaleString("en-US")}.${String(frac).padStart(2, "0")}`;
}

export function agorotFromIls(ils: number): number {
  return Math.round(ils * 100);
}
