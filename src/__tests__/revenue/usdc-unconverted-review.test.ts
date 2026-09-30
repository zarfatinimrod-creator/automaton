import { describe, it, expect, beforeEach, afterEach } from "vitest";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import type BetterSqlite3 from "better-sqlite3";
import { createInMemoryDb } from "../orchestration/test-db.js";
import {
  computeLineMetrics,
  computePortfolioSummary,
  getLine,
  insertLineFromSeed,
  listLedger,
  recordLedgerEntry,
  setConnectorCursor,
  updateLineStatus,
} from "../../revenue/ledger.js";
import { agorotFromIls, getFxRate, receiptDay, setFxRate, setFxRateOn } from "../../revenue/money.js";
import { usdcReceiptEntry } from "../../revenue/connectors/usdc.js";
import { readLocalTransfers } from "../../revenue/connectors/x402-local.js";
import { runLedgerSync } from "../../revenue/heartbeat.js";
import { createRevenueTools } from "../../revenue/tools.js";
import { getRevenueStatus } from "../../revenue/status.js";
import { renderBoardDirective } from "../../revenue/org.js";
import { renderDashboard } from "../../revenue/dashboard.js";
import { renderReport, tick } from "../../revenue/runner.js";
import { seedDefaultPortfolio } from "../../revenue/portfolio.js";
import type { RevenueLineSeed } from "../../revenue/types.js";
import type { ToolContext } from "../../types.js";

/**
 * The review of tick 37's USDC build (two reviewers, 30.9.2026): each block below is one defect they showed, written
 * as a test before its fix. The rule is RULING-2026-09-28-bounty-rail.md §6.2 and docs/OWNER_STEPS.he.md:486-490.
 */

const NOW = "2026-09-30T12:00:00.000Z";
const DAY = "2026-09-29";
const AT = `${DAY}T10:00:00.000Z`;
const HASH_A = `0x${"a1".repeat(32)}`;
const HASH_B = `0x${"b2".repeat(32)}`;
/** A Solana transaction signature: 64 bytes in base58, 88 characters here. */
const SOL_SIG = "5VERv8NMvzbJMEkV8xnrLkEaWRtSz9CosKDYjCJjBRnbJLgp8uirBgmQpjKhoR4tjF3ZpRzrFmBV6UjKdiSZkQUW";

function seed(id: string): RevenueLineSeed {
  return {
    id, name: id, category: "service", tier: "experimental", directorRole: `director-${id}`, operatingLoop: "x",
    kpis: [], killCriteria: [], scaleCriteria: [], targetMonthlyAgorot: agorotFromIls(1000), budgetMonthlyCents: 0,
    humanSetup: [], skillName: null,
  };
}

function insertTransfer(db: BetterSqlite3.Database, id: string, cents: number, description: string, createdAt: string, type = "transfer_in"): void {
  db.prepare("INSERT INTO transactions (id, type, amount_cents, description, created_at) VALUES (?, ?, ?, ?, ?)")
    .run(id, type, cents, description, createdAt);
}

const tools = () => Object.fromEntries(createRevenueTools().map((t) => [t.name, t]));
const ctxOf = (db: BetterSqlite3.Database) => ({ db: { raw: db }, identity: { name: "tester" } }) as unknown as ToolContext;

describe("review 1: money from a wallet rail, or with an on-chain id, is never booked as converted", () => {
  let db: BetterSqlite3.Database;
  beforeEach(() => { db = createInMemoryDb(); insertLineFromSeed(db, seed("paid-apis")); updateLineStatus(db, "paid-apis", "building"); });
  afterEach(() => { db.close(); });

  it("refuses an x402 or superteam receipt booked in a fiat currency, and the line stays building", () => {
    expect(() => recordLedgerEntry(db, {
      lineId: "paid-apis", kind: "sale", amountMinor: 250, currency: "USD", source: "x402", externalId: "x402-sale-1", occurredAt: AT,
    })).toThrow(/pays into a wallet/);
    expect(() => recordLedgerEntry(db, {
      lineId: "paid-apis", kind: "payout", amountMinor: 250, currency: "USD", source: "Superteam", externalId: "st-1", occurredAt: AT,
    })).toThrow(/pays into a wallet/);
    expect(listLedger(db)).toHaveLength(0);
    expect(getLine(db, "paid-apis")!.status).toBe("building");
    expect(computePortfolioSummary(db, NOW).total30dAgorot).toBe(0);
  });

  it("refuses a fiat entry whose id is an on-chain transaction id, from any source", () => {
    expect(() => recordLedgerEntry(db, {
      lineId: "paid-apis", kind: "sale", amountMinor: 250, currency: "USD", source: "manual", externalId: HASH_A, occurredAt: AT,
    })).toThrow(/on-chain transaction id/);
    expect(() => recordLedgerEntry(db, {
      lineId: "paid-apis", kind: "sale", amountMinor: 250, currency: "ILS", source: "manual", externalId: SOL_SIG, occurredAt: AT,
    })).toThrow(/on-chain transaction id/);
    expect(listLedger(db)).toHaveLength(0);
  });

  it("the agent's revenue_record tool refuses the same, and its description says USDC is the wallet currency", async () => {
    const out = await tools().revenue_record.execute(
      { line_id: "paid-apis", kind: "sale", amount_minor: 250, currency: "USD", source: "x402", external_id: HASH_A, occurred_at: AT }, ctxOf(db));
    expect(out).toMatch(/^Error: /);
    expect(listLedger(db)).toHaveLength(0);
    const params = JSON.stringify(createRevenueTools().find((t) => t.name === "revenue_record")!.parameters);
    expect(params).toMatch(/x402 and superteam take USDC only/);
  });
});

describe("review 2: one on-chain transfer is one ledger row", () => {
  let db: BetterSqlite3.Database;
  beforeEach(() => {
    db = createInMemoryDb(); insertLineFromSeed(db, seed("paid-apis")); setFxRateOn(db, "USDC", DAY, 3.7);
    setConnectorCursor(db, "x402", "2026-09-01T00:00:00.000Z"); // the first sync would otherwise read from 30 days before the real now
  });
  afterEach(() => { db.close(); });

  it("an EVM hash is one id whatever its letter case, and is stored lower-cased", () => {
    const upper = `0x${"A1".repeat(32)}`;
    const a = recordLedgerEntry(db, { lineId: "paid-apis", kind: "sale", amountMinor: 250, currency: "USDC", source: "x402", externalId: upper, occurredAt: AT });
    const b = recordLedgerEntry(db, { lineId: "paid-apis", kind: "sale", amountMinor: 250, currency: "USDC", source: "x402", externalId: HASH_A, occurredAt: AT });
    expect(a?.externalId).toBe(HASH_A);
    expect(b).toBeNull();
    expect(listLedger(db)).toHaveLength(1);
  });

  it("a chain id is global: the same hash under another source is a duplicate, not a second receipt", async () => {
    recordLedgerEntry(db, { lineId: "paid-apis", kind: "sale", amountMinor: 250, currency: "USDC", source: "manual", externalId: HASH_A, occurredAt: AT });
    insertTransfer(db, "local-1", 250, `x402 payment [line:paid-apis] [tx:${HASH_A}]`, AT);
    const sync = await runLedgerSync(db, {}, undefined);
    expect(sync.recorded).toBe(0);
    expect(sync.duplicates).toBe(1);
    expect(listLedger(db)).toHaveLength(1);
    expect(computeLineMetrics(db, getLine(db, "paid-apis")!, NOW).unconverted30dAgorot).toBe(925);
  });
});

describe("review 3: the x402 connector never pins its cursor on a held receipt", () => {
  let db: BetterSqlite3.Database;
  beforeEach(() => {
    db = createInMemoryDb(); insertLineFromSeed(db, seed("paid-apis")); setFxRateOn(db, "USDC", DAY, 3.7);
    setConnectorCursor(db, "x402", "2026-09-01T00:00:00.000Z");
  });
  afterEach(() => { db.close(); });

  it("a no-hash receipt is held and reported at every sync, while 510 paid receipts after it are all booked", async () => {
    insertTransfer(db, "held", 100, "x402 payment [line:paid-apis]", `${DAY}T00:00:00.000Z`);
    for (let i = 0; i < 510; i++) {
      const ts = new Date(Date.parse(`${DAY}T01:00:00.000Z`) + i * 1000).toISOString();
      insertTransfer(db, `r${i}`, 100, `x402 payment [line:paid-apis] [tx:0x${i.toString(16).padStart(64, "0")}]`, ts);
    }
    const first = await runLedgerSync(db, {}, undefined);
    const second = await runLedgerSync(db, {}, undefined);
    const third = await runLedgerSync(db, {}, undefined);
    expect(listLedger(db, { limit: 10_000 })).toHaveLength(510);
    for (const sync of [first, second, third]) expect(sync.errors.join("\n")).toMatch(/USDC receipt held held: no on-chain transaction id/);
    expect(third.recorded).toBe(0);
  });

  it("two held receipts are both still reported on the second sync, and each is booked once it can be", async () => {
    insertTransfer(db, "no-rate", 250, `x402 payment [line:paid-apis] [tx:${HASH_A}]`, "2026-09-28T10:00:00.000Z");
    insertTransfer(db, "no-hash", 250, "x402 payment [line:paid-apis]", "2026-09-28T11:00:00.000Z");
    insertTransfer(db, "booked", 300, `x402 payment [line:paid-apis] [tx:${HASH_B}]`, AT);
    const first = await runLedgerSync(db, {}, undefined);
    expect(first.recorded).toBe(1);
    const second = await runLedgerSync(db, {}, undefined);
    expect(second.errors.join("\n")).toMatch(/receipt no-rate held/);
    expect(second.errors.join("\n")).toMatch(/receipt no-hash held/);

    setFxRateOn(db, "USDC", "2026-09-28", 3.6);
    const third = await runLedgerSync(db, {}, undefined);
    expect(third.recorded).toBe(1);
    expect(third.errors.join("\n")).not.toMatch(/no-rate/);
    expect(third.errors.join("\n")).toMatch(/receipt no-hash held/);
    expect(listLedger(db).find((e) => e.externalId === HASH_A)?.amountAgorot).toBe(900);
  });

  it("names the remedy for a no-hash receipt: its hash as a [tx:…] tag", () => {
    insertTransfer(db, "no-hash", 250, "x402 payment [line:paid-apis]", AT);
    const read = readLocalTransfers(db, "2026-09-01T00:00:00.000Z");
    expect(read.held).toMatchObject([{ rowId: "no-hash", reason: "no_tx_hash" }]);
    expect(read.held[0].detail).toMatch(/\[tx:0x…\] tag/);
    expect(read.nextCursor).toBe(AT);
  });

  it("a full page does not skip rows that share its last timestamp", () => {
    const t0 = `${DAY}T01:00:00.000Z`;
    const tLast = `${DAY}T02:00:00.000Z`;
    for (let i = 0; i < 499; i++) insertTransfer(db, `a${String(i).padStart(3, "0")}`, 100, "funding", t0);
    insertTransfer(db, "z1", 100, "funding", tLast);
    insertTransfer(db, "z2", 100, "funding", tLast); // the 501st row, at the same time as the 500th
    const read = readLocalTransfers(db, "2026-09-01T00:00:00.000Z");
    expect(read.nextCursor).toBe(t0);
  });
});

describe("review 4: a runtime timestamp with no zone is UTC", () => {
  it("receiptDay reads SQLite's datetime('now') form as UTC, on a machine set to Israel time", () => {
    const repoRoot = path.resolve(__dirname, "../../..");
    const code = "import { receiptDay } from './src/revenue/money.ts'; console.log(receiptDay('2026-09-29 22:30:00'));";
    const out = spawnSync(process.execPath, ["--import", "tsx", "--input-type=module", "-e", code], {
      cwd: repoRoot, encoding: "utf-8", env: { ...process.env, TZ: "Asia/Jerusalem" },
    });
    expect(out.status, out.stderr).toBe(0);
    expect(out.stdout.trim()).toBe("2026-09-30"); // 22:30 UTC on 29.9 is 01:30 on 30.9 in Israel
  }, 60_000);

  it("the connector stores the receipt time as ISO UTC and values it at its Israeli day's rate", () => {
    const db = createInMemoryDb();
    try {
      insertLineFromSeed(db, seed("paid-apis"));
      setFxRateOn(db, "USDC", "2026-09-29", 3.5);
      setFxRateOn(db, "USDC", "2026-09-30", 3.9);
      insertTransfer(db, "t1", 100, `x402 payment [line:paid-apis] [tx:${HASH_A}]`, "2026-09-29 22:30:00");
      const read = readLocalTransfers(db, "2026-09-01T00:00:00.000Z");
      expect(read.entries[0].occurredAt).toBe("2026-09-29T22:30:00.000Z");
      expect(recordLedgerEntry(db, read.entries[0])!.amountAgorot).toBe(390);
    } finally {
      db.close();
    }
  });

  it("the ledger stores a USDC receipt time as ISO UTC too", () => {
    const db = createInMemoryDb();
    try {
      insertLineFromSeed(db, seed("paid-apis"));
      setFxRateOn(db, "USDC", "2026-09-30", 3.9);
      const e = recordLedgerEntry(db, { lineId: "paid-apis", kind: "sale", amountMinor: 100, currency: "USDC", source: "manual", externalId: HASH_A, occurredAt: "2026-09-29 22:30:00" })!;
      expect(e.occurredAt).toBe("2026-09-29T22:30:00.000Z");
    } finally {
      db.close();
    }
  });
});

describe("review 5: a USDC entry must say when it arrived", () => {
  let db: BetterSqlite3.Database;
  beforeEach(() => { db = createInMemoryDb(); insertLineFromSeed(db, seed("paid-apis")); setFxRateOn(db, "USDC", receiptDay(new Date().toISOString()), 3.9); });
  afterEach(() => { db.close(); });

  it("refuses a USDC entry with no occurredAt instead of valuing it at the recording day", () => {
    expect(() => recordLedgerEntry(db, { lineId: "paid-apis", kind: "sale", amountMinor: 100, currency: "USDC", source: "x402", externalId: HASH_A }))
      .toThrow(/occurred_at|occurred-at|when it arrived/);
    expect(listLedger(db)).toHaveLength(0);
  });

  it("the tool says so and books nothing", async () => {
    const out = await tools().revenue_record.execute(
      { line_id: "paid-apis", kind: "sale", amount_minor: 100, currency: "USDC", source: "x402", external_id: HASH_A }, ctxOf(db));
    expect(out).toMatch(/^Error: .*occurred_at/);
    expect(listLedger(db)).toHaveLength(0);
  });
});

describe("review 6: a day's rate only for a wallet currency, and never for a day that has not come", () => {
  let db: BetterSqlite3.Database;
  beforeEach(() => { db = createInMemoryDb(); });
  afterEach(() => { db.close(); });

  it("refuses a future Israeli day, judged by the Israeli date of now", () => {
    expect(() => setFxRateOn(db, "USDC", "2027-01-15", 3.2)).toThrow(/has not come/);
    expect(() => setFxRateOn(db, "USDC", "2026-10-01", 3.7, "2026-09-30T20:59:00.000Z")).toThrow(/has not come/); // 23:59 on 30.9 in Israel
    expect(() => setFxRateOn(db, "USDC", "2026-10-01", 3.7, "2026-09-30T21:00:00.000Z")).not.toThrow(); // 00:00 on 1.10 in Israel
  });

  it("refuses a dated rate for a converted currency, which no booking would ever read", () => {
    expect(() => setFxRateOn(db, "USD", DAY, 9.99)).toThrow(/USDC/);
  });

  it("the CLI refuses both", () => {
    const repoRoot = path.resolve(__dirname, "../../..");
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "usdc-fx-review-"));
    const run = (...args: string[]) =>
      spawnSync(process.execPath, ["--import", "tsx", "scripts/colony.ts", "fx", "--db", path.join(dir, "colony.db"), ...args], { cwd: repoRoot, encoding: "utf-8" });
    try {
      expect(run("--currency", "USDC", "--date", "2099-01-15", "--rate", "3.2").status).not.toBe(0);
      expect(run("--currency", "USD", "--date", DAY, "--rate", "9.99").status).not.toBe(0);
    } finally {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  }, 60_000);
});

describe("review 7: USDC is labelled unconverted wherever the agent, the board or the owner reads it", () => {
  let db: BetterSqlite3.Database;
  const recent = new Date(Date.now() - 3_600_000).toISOString();
  beforeEach(() => {
    db = createInMemoryDb();
    insertLineFromSeed(db, seed("paid-apis"));
    setFxRateOn(db, "USDC", receiptDay(recent), 3.7);
  });
  afterEach(() => { db.close(); });

  it("revenue_line_detail: the ledger row says unconverted, and the 30-day number says converted", async () => {
    recordLedgerEntry(db, { lineId: "paid-apis", kind: "payout", amountMinor: 10_000, currency: "USDC", source: "superteam", externalId: HASH_A, occurredAt: recent });
    const text = String(await tools().revenue_line_detail.execute({ line_id: "paid-apis" }, ctxOf(db)));
    expect(text).toMatch(/Recent ledger: \S+ payout ₪370\.00 unconverted via superteam/);
    expect(text).toContain("30d converted revenue ₪0.00");
    expect(text).toContain("30d unconverted (wallet, in no target) ₪370.00");
  });

  it("revenue_record says the entry is unconverted", async () => {
    const out = await tools().revenue_record.execute(
      { line_id: "paid-apis", kind: "sale", amount_minor: 500, currency: "USDC", source: "x402", external_id: HASH_A, occurred_at: recent }, ctxOf(db));
    expect(out).toMatch(/^Recorded sale ₪18\.50 unconverted \(500 USDC\)/);
  });

  it("the status block and the board directive label converted money, and print the wallet number apart", () => {
    recordLedgerEntry(db, { lineId: "paid-apis", kind: "payout", amountMinor: 10_000, currency: "USDC", source: "superteam", externalId: HASH_A, occurredAt: recent });
    const status = getRevenueStatus(db);
    expect(status).toContain("30d converted revenue ₪0.00");
    expect(status).toContain("unconverted (wallet, in no target) ₪370.00");
    const directive = renderBoardDirective(computePortfolioSummary(db), [], []);
    expect(directive).toContain("30d converted revenue ₪0.00");
    expect(directive).toContain("unconverted (wallet, in no target) ₪370.00");
  });

  it("colony.ts record says the entry is unconverted", () => {
    const repoRoot = path.resolve(__dirname, "../../..");
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "usdc-record-review-"));
    const dbPath = path.join(dir, "colony.db");
    const cli = (...args: string[]) =>
      spawnSync(process.execPath, ["--import", "tsx", "scripts/colony.ts", ...args, "--db", dbPath], { cwd: repoRoot, encoding: "utf-8" });
    try {
      expect(cli("seed").status).toBe(0);
      expect(cli("fx", "--currency", "USDC", "--date", receiptDay(recent), "--rate", "3.7").status).toBe(0);
      const out = cli("record", "--line", "oss-bounties", "--kind", "payout", "--amount", "10000", "--currency", "USDC",
        "--source", "superteam", "--external-id", HASH_A, "--occurred-at", recent);
      expect(out.status, out.stderr).toBe(0);
      expect(out.stdout).toContain("Recorded payout ₪370.00 unconverted");
    } finally {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  }, 60_000);
});

describe("review 8: a credit purchase is money leaving the wallet, never a receipt", () => {
  it("the x402 connector reads transfer_in rows only", () => {
    const db = createInMemoryDb();
    try {
      insertLineFromSeed(db, seed("paid-apis"));
      setFxRateOn(db, "USDC", DAY, 3.7);
      insertTransfer(db, "cp1", 500, `credits [line:paid-apis] [tx:${HASH_A}]`, AT, "credit_purchase");
      const read = readLocalTransfers(db, "2026-09-01T00:00:00.000Z");
      expect(read.entries).toEqual([]);
      expect(read.held).toEqual([]);
    } finally {
      db.close();
    }
  });
});

describe("review 9: tests the builder's own mutations survived", () => {
  let db: BetterSqlite3.Database;
  beforeEach(() => { db = createInMemoryDb(); insertLineFromSeed(db, seed("paid-apis")); });
  afterEach(() => { db.close(); });

  it("R2: the unconverted 30-day number leaves out a USDC receipt older than 30 days", () => {
    setFxRateOn(db, "USDC", "2026-08-21", 4);
    setFxRateOn(db, "USDC", DAY, 4);
    recordLedgerEntry(db, { lineId: "paid-apis", kind: "sale", amountMinor: 10_000, currency: "USDC", source: "x402", externalId: HASH_A, occurredAt: "2026-08-21T10:00:00.000Z" });
    recordLedgerEntry(db, { lineId: "paid-apis", kind: "sale", amountMinor: 1_000, currency: "USDC", source: "x402", externalId: HASH_B, occurredAt: AT });
    expect(computeLineMetrics(db, getLine(db, "paid-apis")!, NOW).unconverted30dAgorot).toBe(4_000);
    expect(computePortfolioSummary(db, NOW).unconverted30dAgorot).toBe(4_000);
  });

  it("R7: the shared helper picks the Israeli day, not the UTC day", () => {
    setFxRateOn(db, "USDC", "2026-09-30", 3.8); // only the next Israeli day has a rate
    const booking = usdcReceiptEntry(db, { lineId: "paid-apis", amountMinor: 100, txHash: HASH_A, receivedAt: "2026-09-29T21:30:00.000Z", source: "x402" });
    expect(booking.status).toBe("bookable");
  });

  it("the shared helper holds a malformed hash as having none", () => {
    setFxRateOn(db, "USDC", DAY, 3.8);
    expect(usdcReceiptEntry(db, { lineId: "paid-apis", amountMinor: 100, txHash: "0xabc", receivedAt: AT, source: "x402" }))
      .toMatchObject({ status: "held", reason: "no_tx_hash" });
    expect(usdcReceiptEntry(db, { lineId: "paid-apis", amountMinor: 100, txHash: SOL_SIG, receivedAt: AT, source: "superteam" }))
      .toMatchObject({ status: "bookable", entry: { externalId: SOL_SIG } });
  });
});

describe("honesty 1: the manager's screen headline and subhead are true when only USDC has arrived", () => {
  let db: BetterSqlite3.Database;
  beforeEach(() => { db = createInMemoryDb(); seedDefaultPortfolio(db); setFxRateOn(db, "USDC", DAY, 3.7); });
  afterEach(() => { db.close(); });

  it("says no converted shekel, names the wallet money, and does not say no line can receive money", () => {
    recordLedgerEntry(db, { lineId: "oss-bounties", kind: "payout", amountMinor: 10_000, currency: "USDC", source: "superteam", externalId: HASH_A, occurredAt: AT });
    const h = renderDashboard(db, { nowIso: NOW });
    expect(h).toContain("החברה עדיין לא הרוויחה שקל מומר, ובארנק ₪370.00 לא מומר, שלא נספר בשום יעד.");
    expect(h).not.toContain("לא יכול לקבל כסף");
  });

  it("with no money at all the headline and subhead are as before", () => {
    const h = renderDashboard(db, { nowIso: NOW });
    expect(h).toContain("החברה עדיין לא הרוויחה שקל מומר.");
    expect(h).toContain("אף אחד מהם לא יכול לקבל כסף.");
  });

  it("with converted money the headline says converted, and adds the wallet number when there is one", () => {
    recordLedgerEntry(db, { lineId: "oss-bounties", kind: "payout", amountMinor: 200_000, currency: "ILS", source: "stripe", externalId: "po_1", occurredAt: AT });
    expect(renderDashboard(db, { nowIso: NOW })).toContain("החברה הרוויחה ₪2,000.00 בכסף מומר ב-30 הימים האחרונים.");
    recordLedgerEntry(db, { lineId: "oss-bounties", kind: "payout", amountMinor: 10_000, currency: "USDC", source: "superteam", externalId: HASH_A, occurredAt: AT });
    expect(renderDashboard(db, { nowIso: NOW }))
      .toContain("החברה הרוויחה ₪2,000.00 בכסף מומר ב-30 הימים האחרונים, ובארנק ₪370.00 לא מומר, שלא נספר בשום יעד.");
  });
});

describe("honesty 2: only named currencies are booked; nothing is valued at an invented rate", () => {
  let db: BetterSqlite3.Database;
  beforeEach(() => { db = createInMemoryDb(); insertLineFromSeed(db, seed("paid-apis")); setFxRateOn(db, "USDC", DAY, 3.7); });
  afterEach(() => { db.close(); });

  it("refuses USDT, SOL, USDbC, EURC and PYUSD, and books none of them as converted", () => {
    const codes = ["USDT", "SOL", "USDbC", "EURC", "PYUSD"];
    codes.forEach((currency, i) => {
      expect(() => recordLedgerEntry(db, {
        lineId: "paid-apis", kind: "payout", amountMinor: 10_000, currency, source: "manual", externalId: `id-${i}`, occurredAt: AT,
      }), currency).toThrow(/no rule books/);
    });
    expect(listLedger(db)).toHaveLength(0);
    expect(computePortfolioSummary(db, NOW).total30dAgorot).toBe(0);
  });

  it("has no fallback rate for an unknown code; a rate somebody stored is used", () => {
    expect(() => getFxRate(db, "XYZ")).toThrow(/no rate/);
    setFxRate(db, "CAD", 2.7);
    expect(getFxRate(db, "CAD")).toBe(2.7);
  });
});

describe("honesty 3: an unconverted row carries an on-chain transaction id, whoever books it", () => {
  let db: BetterSqlite3.Database;
  beforeEach(() => { db = createInMemoryDb(); insertLineFromSeed(db, seed("paid-apis")); setFxRateOn(db, "USDC", DAY, 3.7); });
  afterEach(() => { db.close(); });

  it("refuses a USDC entry whose id is not an EVM hash or a Solana signature", () => {
    for (const externalId of ["whatever", "0xabc", `${HASH_A}ff`, SOL_SIG.slice(0, 40), `${SOL_SIG.slice(0, 87)}0`]) {
      expect(() => recordLedgerEntry(db, {
        lineId: "paid-apis", kind: "payout", amountMinor: 10_000, currency: "USDC", source: "superteam", externalId, occurredAt: AT,
      }), externalId).toThrow(/on-chain transaction id/);
    }
    expect(listLedger(db)).toHaveLength(0);
  });

  it("books a Solana signature as given: base58 is case-sensitive", () => {
    const e = recordLedgerEntry(db, { lineId: "paid-apis", kind: "payout", amountMinor: 10_000, currency: "USDC", source: "superteam", externalId: SOL_SIG, occurredAt: AT })!;
    expect(e.externalId).toBe(SOL_SIG);
    expect(e.unconverted).toBe(true);
  });
});

describe("honesty 4: products/x402-il-api/scripts/tag-payment.md says only what the code does", () => {
  const repoRoot = path.resolve(__dirname, "../../..");
  const doc = fs.readFileSync(path.join(repoRoot, "products/x402-il-api/scripts/tag-payment.md"), "utf-8");
  const walk = (dir: string): string[] => fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
    e.name === "__tests__" ? [] : e.isDirectory() ? walk(path.join(dir, e.name)) : e.name.endsWith(".ts") ? [path.join(dir, e.name)] : []);

  it("no code writes a transfer_in row, and the doc says so instead of claiming the runtime does", () => {
    const writers = walk(path.join(repoRoot, "src")).filter((f) => /type:\s*["']transfer_in["']|VALUES\s*\([^)]*'transfer_in'/.test(fs.readFileSync(f, "utf-8")));
    expect(writers).toEqual([]);
    expect(doc).not.toMatch(/The runtime records the inbound transfer/);
    expect(doc).toMatch(/Nothing writes these rows yet/);
  });

  it("the payment goes to the X402_PAY_TO address, not the automaton's wallet; credit purchases are not read", () => {
    expect(doc).not.toMatch(/automaton's wallet/);
    expect(doc).toMatch(/X402_PAY_TO/);
    expect(doc).not.toMatch(/imports every `transfer_in` or\s+`credit_purchase`/);
  });
});

describe("honesty 7: converted money is not called 'bank'", () => {
  let db: BetterSqlite3.Database;
  beforeEach(() => { db = createInMemoryDb(); seedDefaultPortfolio(db); });
  afterEach(() => { db.close(); });

  it("the report and the screen say 'not in the wallet', the one thing the ledger knows", async () => {
    const report = renderReport(db, await tick(db, { nowIso: NOW, force: true, feedGoals: false }));
    expect(report).toContain("| 30-day revenue, converted (not in the wallet) |");
    expect(report).not.toMatch(/\(bank\)/);
    const h = renderDashboard(db, { nowIso: NOW });
    expect(h).toContain("כסף מומר (לא בארנק), 30 יום");
    expect(h).not.toContain("(בנק)");
  });
});
