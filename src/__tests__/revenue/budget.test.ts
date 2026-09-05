import { describe, it, expect, beforeEach, afterEach } from "vitest";
import type BetterSqlite3 from "better-sqlite3";
import { createInMemoryDb } from "../orchestration/test-db.js";
import {
  DEFAULT_OWNER_FLOAT_AGOROT,
  OWNER_FLOAT_SOURCE,
  assertCanSpend,
  ownerFloatState,
  recordFloatSpend,
  setOwnerFloatIls,
} from "../../revenue/budget.js";
import { seedDefaultPortfolio } from "../../revenue/portfolio.js";
import { agorotFromIls } from "../../revenue/money.js";
import { setFxRate } from "../../revenue/money.js";

describe("the owner's ₪200 float", () => {
  let db: BetterSqlite3.Database;
  beforeEach(() => { db = createInMemoryDb(); seedDefaultPortfolio(db); });
  afterEach(() => { db.close(); });

  const spend = (ils: number, id: string, purpose = "chrome web store developer fee") =>
    recordFloatSpend(db, { lineId: "dev-extensions", amountMinor: agorotFromIls(ils), currency: "ILS", externalId: id, purpose });

  it("starts at ₪200 with nothing spent", () => {
    const s = ownerFloatState(db);
    expect(s.capAgorot).toBe(DEFAULT_OWNER_FLOAT_AGOROT);
    expect(s.capAgorot).toBe(20_000);
    expect(s.spentAgorot).toBe(0);
    expect(s.remainingAgorot).toBe(20_000);
  });

  it("counts a spend against the ceiling and leaves the rest", () => {
    spend(18, "gp-1");
    const s = ownerFloatState(db);
    expect(s.spentAgorot).toBe(1_800);
    expect(s.remainingAgorot).toBe(18_200);
    expect(s.spendCount).toBe(1);
  });

  it("refuses a spend that would exceed what the owner authorised", () => {
    spend(190, "big-1");
    expect(() => spend(20, "over-1")).toThrow(/refusing to spend/);
    // And the refusal explains the state rather than just failing.
    expect(() => spend(20, "over-2")).toThrow(/₪10\.00 remains|remains/);
    expect(ownerFloatState(db).spentAgorot).toBe(19_000);
  });

  it("records nothing when it refuses", () => {
    expect(() => spend(500, "way-over")).toThrow();
    expect(ownerFloatState(db).spendCount).toBe(0);
  });

  it("demands a receipt, because it is his money", () => {
    expect(() => recordFloatSpend(db, {
      lineId: "dev-extensions", amountMinor: 500, currency: "ILS", externalId: "  ", purpose: "something",
    })).toThrow(/receipt id/);
  });

  it("demands to know what the money bought", () => {
    expect(() => recordFloatSpend(db, {
      lineId: "dev-extensions", amountMinor: 500, currency: "ILS", externalId: "r-1", purpose: "  ",
    })).toThrow(/what the money bought/);
  });

  it("will not charge the same receipt twice", () => {
    spend(10, "dup-1");
    expect(() => spend(10, "dup-1")).toThrow(/already recorded/);
    expect(ownerFloatState(db).spentAgorot).toBe(1_000);
  });

  it("enforces the ceiling in shekels when the charge is in dollars", () => {
    setFxRate(db, "USD", 3.7);
    // $50 is ₪185 — inside the cap. $60 would be ₪222, outside it.
    recordFloatSpend(db, {
      lineId: "dev-extensions", amountMinor: 5000, currency: "USD", externalId: "usd-1", purpose: "domain",
    });
    expect(ownerFloatState(db).spentAgorot).toBe(18_500);
    expect(() => recordFloatSpend(db, {
      lineId: "dev-extensions", amountMinor: 6000, currency: "USD", externalId: "usd-2", purpose: "another domain",
    })).toThrow(/refusing to spend/);
  });

  it("lets only the owner change the ceiling, and recomputes against it", () => {
    spend(150, "s-1");
    expect(() => spend(100, "s-2")).toThrow();
    setOwnerFloatIls(db, 400);
    expect(ownerFloatState(db).remainingAgorot).toBe(25_000);
    expect(() => spend(100, "s-3")).not.toThrow();
    expect(() => setOwnerFloatIls(db, -1)).toThrow(/non-negative/);
  });

  it("shows up as an ordinary cost so the board and auditor see it", () => {
    spend(25, "visible-1");
    const row = db.prepare(
      "SELECT kind, source, amount_agorot, note FROM revenue_ledger WHERE external_id = ?",
    ).get("visible-1") as { kind: string; source: string; amount_agorot: number; note: string };
    expect(row.kind).toBe("cost");
    expect(row.source).toBe(OWNER_FLOAT_SOURCE);
    expect(row.amount_agorot).toBeLessThan(0);
    expect(row.note).toContain("owner float:");
  });

  it("rejects a nonsensical amount rather than guessing", () => {
    expect(() => assertCanSpend(db, 0, "nothing")).toThrow(/positive whole number/);
    expect(() => assertCanSpend(db, -100, "negative")).toThrow(/positive whole number/);
    expect(() => assertCanSpend(db, 1.5, "fractional")).toThrow(/positive whole number/);
  });
});
