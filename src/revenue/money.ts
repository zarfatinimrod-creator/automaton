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
  return DEFAULT_FX_ILS[code] ?? 3.6;
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
  const code = normalizeCurrency(currency);
  const minor = MINOR_UNITS[code] ?? 100;
  const rate = getFxRate(db, code);
  // minor → major → ILS → agorot
  return Math.round((amountMinor / minor) * rate * 100);
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
