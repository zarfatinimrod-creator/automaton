import { describe, it, expect, beforeEach, afterEach } from "vitest";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { createDatabase } from "../../state/database.js";
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
import { agorotFromIls, getFxRateOn, receiptDay, setFxRate, setFxRateOn } from "../../revenue/money.js";
import { extractTxHash, usdcReceiptEntry } from "../../revenue/connectors/usdc.js";
import { readLocalTransfers } from "../../revenue/connectors/x402-local.js";
import { runLedgerSync } from "../../revenue/heartbeat.js";
import { decideLine } from "../../revenue/rules.js";
import { renderCommitSummary, renderReport, tick } from "../../revenue/runner.js";
import { renderDashboard } from "../../revenue/dashboard.js";
import { seedDefaultPortfolio } from "../../revenue/portfolio.js";
import { DEFAULT_DECISION_POLICY, type RevenueLineSeed } from "../../revenue/types.js";

/**
 * RULING-2026-09-28-bounty-rail.md §6.2, the USDC booking rule, in code (tick 37). docs/OWNER_STEPS.he.md tells the
 * owner: a USDC receipt is booked at its shekel value on the day of receipt, with the on-chain transaction id, marked
 * unconverted; the screen shows converted and unconverted money as two separate numbers; no target leans on
 * unconverted money; the wallet key never enters the repo or a secret, and the machine never moves funds.
 */

const NOW = "2026-09-30T12:00:00.000Z";
const DAY = "2026-09-29";
const AT = `${DAY}T10:00:00.000Z`;
const HASH_A = `0x${"a1".repeat(32)}`;
const HASH_B = `0x${"b2".repeat(32)}`;

function seed(overrides: Partial<RevenueLineSeed> = {}): RevenueLineSeed {
  return {
    id: "usdc-line",
    name: "A line paid in USDC",
    category: "service",
    tier: "experimental",
    directorRole: "director-usdc-line",
    operatingLoop: "x",
    kpis: [],
    killCriteria: [],
    scaleCriteria: [],
    targetMonthlyAgorot: agorotFromIls(1000),
    budgetMonthlyCents: 0,
    humanSetup: [],
    skillName: null,
    ...overrides,
  };
}

function insertTransfer(db: BetterSqlite3.Database, id: string, cents: number, description: string, createdAt: string): void {
  db.prepare("INSERT INTO transactions (id, type, amount_cents, description, created_at) VALUES (?, 'transfer_in', ?, ?, ?)")
    .run(id, cents, description, createdAt);
}

describe("USDC: the ledger row (§6.2)", () => {
  let db: BetterSqlite3.Database;
  beforeEach(() => { db = createInMemoryDb(); insertLineFromSeed(db, seed()); });
  afterEach(() => { db.close(); });

  it("books a USDC receipt at the receipt day's rate, flagged unconverted", () => {
    setFxRate(db, "USDC", 4.0); // today's undated rate: must NOT be the one used
    setFxRateOn(db, "USDC", DAY, 3.71);
    const entry = recordLedgerEntry(db, {
      lineId: "usdc-line", kind: "sale", amountMinor: 25_000, currency: "USDC", source: "x402", externalId: HASH_A, occurredAt: AT,
    })!;
    expect(entry.currency).toBe("USDC");
    expect(entry.externalId).toBe(HASH_A);
    expect(entry.unconverted).toBe(true);
    expect(entry.amountAgorot).toBe(92_750); // $250.00 × 3.71 = ₪927.50
    const [stored] = listLedger(db, { lineId: "usdc-line" });
    expect(stored.unconverted).toBe(true);
    expect(stored.amountAgorot).toBe(92_750);
  });

  it("does not flag shekel or card money", () => {
    const entry = recordLedgerEntry(db, {
      lineId: "usdc-line", kind: "sale", amountMinor: 1990, currency: "USD", source: "stripe", externalId: "ch_1", occurredAt: AT,
    })!;
    expect(entry.unconverted).toBe(false);
    expect(listLedger(db, { lineId: "usdc-line" })[0].unconverted).toBe(false);
  });

  it("refuses to value USDC with no rate recorded for that day, rather than invent one", () => {
    setFxRate(db, "USDC", 3.6); // an undated rate exists; it is not the day's rate
    setFxRateOn(db, "USDC", "2026-09-28", 3.7); // the day before is not the day either
    expect(() => recordLedgerEntry(db, {
      lineId: "usdc-line", kind: "sale", amountMinor: 100, currency: "usdc", source: "x402", externalId: HASH_A, occurredAt: AT,
    })).toThrow(/no ILS rate recorded for USDC on 2026-09-29/);
    expect(listLedger(db)).toHaveLength(0);
  });

  it("dates a receipt by the Israeli calendar day", () => {
    expect(receiptDay("2026-09-29T20:59:00.000Z")).toBe("2026-09-29");
    expect(receiptDay("2026-09-29T21:30:00.000Z")).toBe("2026-09-30"); // 00:30 in Israel (UTC+3 in September)
    expect(receiptDay("2026-12-01T22:30:00.000Z")).toBe("2026-12-02"); // 00:30 in Israel (UTC+2 in winter)
  });

  it("stores a day's rate only for a real day and a positive rate", () => {
    expect(() => setFxRateOn(db, "USDC", "2026-9-29", 3.7)).toThrow();
    expect(() => setFxRateOn(db, "USDC", "2026-02-30", 3.7)).toThrow();
    expect(() => setFxRateOn(db, "USDC", DAY, 0)).toThrow();
    expect(getFxRateOn(db, "USDC", DAY)).toBeNull();
    setFxRateOn(db, "usdc", DAY, 3.7);
    expect(getFxRateOn(db, "USDC", DAY)).toBe(3.7);
  });

  it("never lets unconverted money make a line live", () => {
    // `live` starts the kill floor's 90-day clock and asks the board for a target set from that reading
    // (rules.ts target_unset): a target would then rest on unconverted money.
    updateLineStatus(db, "usdc-line", "building");
    setFxRateOn(db, "USDC", DAY, 3.7);
    recordLedgerEntry(db, { lineId: "usdc-line", kind: "payout", amountMinor: 5000, currency: "USDC", source: "superteam", externalId: HASH_A, occurredAt: AT });
    expect(getLine(db, "usdc-line")?.status).toBe("building");
    recordLedgerEntry(db, { lineId: "usdc-line", kind: "sale", amountMinor: 5000, currency: "ILS", source: "stripe", externalId: "ch_2", occurredAt: AT });
    expect(getLine(db, "usdc-line")?.status).toBe("live");
  });

  it("refuses a USDC cost: the colony never moves funds out of the wallet", () => {
    setFxRateOn(db, "USDC", DAY, 3.7);
    expect(() => recordLedgerEntry(db, {
      lineId: "usdc-line", kind: "cost", amountMinor: 100, currency: "USDC", source: "manual", occurredAt: AT,
    })).toThrow(/never moves funds/);
  });
});

describe("USDC: the shared helper any USDC connector uses", () => {
  let db: BetterSqlite3.Database;
  beforeEach(() => { db = createInMemoryDb(); });
  afterEach(() => { db.close(); });

  it("reads the on-chain transaction id from a [tx:0x…] tag, and nothing shorter or longer", () => {
    expect(extractTxHash(`x402 payment [line:paid-apis] [tx:${HASH_A}]`)).toBe(HASH_A);
    expect(extractTxHash(`[tx:${HASH_A.toUpperCase().replace("0X", "0x")}]`)).toBe(HASH_A);
    expect(extractTxHash(`[tx:${HASH_A.slice(0, 65)}]`)).toBeNull();
    expect(extractTxHash(`[tx:${HASH_A}ff]`)).toBeNull();
    expect(extractTxHash(`${HASH_A}`)).toBeNull(); // a bare hash is not a tag
    expect(extractTxHash("x402 payment [line:paid-apis]")).toBeNull();
  });

  it("builds a USDC ledger input keyed on the on-chain hash", () => {
    setFxRateOn(db, "USDC", DAY, 3.7);
    const booking = usdcReceiptEntry(db, { lineId: "l", amountMinor: 1234, txHash: HASH_A, receivedAt: AT, source: "superteam", note: "bounty" });
    expect(booking).toEqual({
      status: "bookable",
      entry: { lineId: "l", kind: "sale", amountMinor: 1234, currency: "USDC", source: "superteam", externalId: HASH_A, occurredAt: AT, note: "bounty" },
    });
  });

  it("holds a receipt with no on-chain id, and one with no rate for its day", () => {
    const noHash = usdcReceiptEntry(db, { lineId: "l", amountMinor: 1, txHash: null, receivedAt: AT, source: "x402" });
    expect(noHash).toMatchObject({ status: "held", reason: "no_tx_hash", day: DAY });
    const noRate = usdcReceiptEntry(db, { lineId: "l", amountMinor: 1, txHash: HASH_A, receivedAt: AT, source: "x402" });
    expect(noRate).toMatchObject({ status: "held", reason: "no_rate_for_day", day: DAY });
    if (noRate.status === "held") expect(noRate.detail).toContain(`colony.ts fx --currency USDC --date ${DAY}`);
  });
});

describe("USDC: the x402 connector", () => {
  let db: BetterSqlite3.Database;
  beforeEach(() => { db = createInMemoryDb(); insertLineFromSeed(db, seed({ id: "paid-apis" })); });
  afterEach(() => { db.close(); });

  it("books a tagged transfer as USDC with its on-chain id, not the local row id", () => {
    setFxRateOn(db, "USDC", DAY, 3.7);
    insertTransfer(db, "local-1", 250, `x402 payment [line:paid-apis] [tx:${HASH_A}]`, AT);
    const read = readLocalTransfers(db, "2026-09-01T00:00:00.000Z");
    expect(read.held).toEqual([]);
    expect(read.entries).toHaveLength(1);
    expect(read.entries[0]).toMatchObject({ lineId: "paid-apis", currency: "USDC", externalId: HASH_A, amountMinor: 250, source: "x402" });
    expect(read.nextCursor).toBe(AT);
  });

  it("holds a receipt whose day has no rate: not booked, read again by its row id, booked once the rate is recorded", async () => {
    const early = `${DAY}T08:00:00.000Z`;
    const later = "2026-09-30T09:00:00.000Z";
    setConnectorCursor(db, "x402", "2026-09-01T00:00:00.000Z"); // not 30 days before the real now
    setFxRateOn(db, "USDC", "2026-09-30", 3.7);
    insertTransfer(db, "local-0", 100, "creator funding", early); // untagged: funding, never revenue
    insertTransfer(db, "local-1", 250, `x402 payment [line:paid-apis] [tx:${HASH_A}]`, AT);
    insertTransfer(db, "local-2", 300, `x402 payment [line:paid-apis] [tx:${HASH_B}]`, later);

    const first = await runLedgerSync(db, {}, undefined);
    expect(first.recorded).toBe(1); // the 30.9 receipt; 29.9 has no rate
    expect(first.errors.join("\n")).toMatch(/x402: USDC receipt local-1 held: no ILS rate recorded for USDC on 2026-09-29/);
    expect(listLedger(db).map((e) => e.externalId)).toEqual([HASH_B]);

    const again = await runLedgerSync(db, {}, undefined);
    expect(again.recorded).toBe(0);
    expect(again.errors.join("\n")).toMatch(/local-1 held/); // still visible every sync, not reported once and lost

    setFxRateOn(db, "USDC", DAY, 3.6);
    const third = await runLedgerSync(db, {}, undefined);
    expect(third.recorded).toBe(1);
    expect(third.duplicates).toBe(0); // the cursor passed the booked row; only the held one is read again
    expect(third.errors).toEqual([]);
    expect(listLedger(db).find((e) => e.externalId === HASH_A)?.amountAgorot).toBe(900); // $2.50 × 3.6
  });

  it("holds a tagged transfer that carries no on-chain id", () => {
    setFxRateOn(db, "USDC", DAY, 3.7);
    insertTransfer(db, "local-1", 250, "x402 payment [line:paid-apis]", AT);
    const read = readLocalTransfers(db, "2026-09-01T00:00:00.000Z");
    expect(read.entries).toEqual([]);
    expect(read.held).toMatchObject([{ rowId: "local-1", reason: "no_tx_hash" }]);
    // The cursor does not wait for it (review of tick 37, defect 3): a row that can never be booked as written would
    // otherwise stop every later receipt from being read. It is read again by its id instead.
    expect(read.nextCursor).toBe(AT);
  });

  it("reads a held row again by its id once the cursor has passed it", () => {
    setFxRateOn(db, "USDC", DAY, 3.7);
    insertTransfer(db, "local-1", 250, `x402 payment [line:paid-apis] [tx:${HASH_A}]`, AT);
    insertTransfer(db, "local-2", 250, "x402 payment [line:paid-apis]", AT);
    const read = readLocalTransfers(db, AT, ["local-2"]);
    expect(read.entries).toEqual([]); // local-1 is behind the cursor and was never held
    expect(read.held).toMatchObject([{ rowId: "local-2", reason: "no_tx_hash" }]);
    expect(read.nextCursor).toBe(AT);
  });
});

describe("USDC: no target, floor or rule counts unconverted money", () => {
  let db: BetterSqlite3.Database;
  beforeEach(() => { db = createInMemoryDb(); insertLineFromSeed(db, seed()); setFxRateOn(db, "USDC", DAY, 4); });
  afterEach(() => { db.close(); });

  const usdc = (externalId: string, cents: number, occurredAt = AT) =>
    recordLedgerEntry(db, { lineId: "usdc-line", kind: "sale", amountMinor: cents, currency: "USDC", source: "x402", externalId, occurredAt });
  const ils = (externalId: string, agorot: number, occurredAt = AT) =>
    recordLedgerEntry(db, { lineId: "usdc-line", kind: "sale", amountMinor: agorot, currency: "ILS", source: "stripe", externalId, occurredAt });

  it("line metrics: converted revenue in every rule input, unconverted as its own number", () => {
    ils("ch_old", 10_000, "2026-08-21T10:00:00.000Z"); // 40 days before NOW
    usdc(HASH_A, 50_000); // $500 × 4 = ₪2,000, yesterday
    const m = computeLineMetrics(db, getLine(db, "usdc-line")!, NOW);
    expect(m.revenue30dAgorot).toBe(0);
    expect(m.revenue7dAgorot).toBe(0);
    expect(m.net30dAgorot).toBe(0);
    expect(m.transactions30d).toBe(0);
    expect(m.targetAttainment).toBe(0);
    expect(Math.round(m.daysSinceLastRevenue!)).toBe(40);
    expect(m.unconverted30dAgorot).toBe(200_000);
  });

  it("an unconverted refund comes off the unconverted number, not the converted one", () => {
    ils("ch_1", 30_000);
    usdc(HASH_A, 50_000);
    recordLedgerEntry(db, { lineId: "usdc-line", kind: "refund", amountMinor: 10_000, currency: "USDC", source: "x402", externalId: HASH_B, occurredAt: AT });
    const m = computeLineMetrics(db, getLine(db, "usdc-line")!, NOW);
    expect(m.revenue30dAgorot).toBe(30_000);
    expect(m.refunds30dAgorot).toBe(0);
    expect(m.unconverted30dAgorot).toBe(160_000);
  });

  it("portfolio: the ₪20,000 test and the run-rate count converted shekels only", () => {
    ils("ch_1", 200_000);
    usdc(HASH_A, 50_000);
    const s = computePortfolioSummary(db, NOW);
    expect(s.total30dAgorot).toBe(200_000);
    expect(s.total7dAgorot).toBe(200_000);
    expect(s.attainment).toBeCloseTo(0.1, 10);
    expect(s.net30dAgorot).toBe(200_000);
    expect(s.unconverted30dAgorot).toBe(200_000);
  });

  it("a live line past grace earning only USDC is judged on its converted money: the kill floor fires, scale does not", () => {
    updateLineStatus(db, "usdc-line", "live", { force: true });
    db.prepare("UPDATE revenue_lines SET launched_at = ? WHERE id = ?").run("2026-06-01T00:00:00.000Z", "usdc-line");
    usdc(HASH_A, 100_000); // ₪4,000 unconverted against a ₪1,000 target
    const line = getLine(db, "usdc-line")!;
    const d = decideLine(line, computeLineMetrics(db, line, NOW), DEFAULT_DECISION_POLICY, { previousDecision: null });
    expect(d.triggered).toContain("below_kill_floor");
    expect(d.decision).toBe("kill");
  });
});

describe("USDC: the report and the manager's screen show two numbers, never one", () => {
  let db: BetterSqlite3.Database;
  beforeEach(() => { db = createInMemoryDb(); seedDefaultPortfolio(db); setFxRateOn(db, "USDC", DAY, 3.7); });
  afterEach(() => { db.close(); });

  const bookBoth = () => {
    recordLedgerEntry(db, { lineId: "oss-bounties", kind: "payout", amountMinor: 200_000, currency: "ILS", source: "stripe", externalId: "po_1", occurredAt: AT });
    recordLedgerEntry(db, { lineId: "oss-bounties", kind: "payout", amountMinor: 10_000, currency: "USDC", source: "superteam", externalId: HASH_A, occurredAt: AT });
  };

  it("the board report: converted and unconverted as separate rows and columns; the target % on converted", async () => {
    bookBoth();
    const result = await tick(db, { nowIso: NOW, force: true, feedGoals: false });
    const report = renderReport(db, result);
    expect(report).toContain("| 30-day revenue, converted (not in the wallet) | **₪2,000.00** |");
    expect(report).toContain("| 30-day revenue, unconverted (wallet; in no target) | ₪370.00 |");
    expect(report).toContain("(10.0%)");
    expect(report).toContain("| Line | Tier | Status | 30d converted | 30d unconverted | Target | Last supervisor call |");
    expect(report).toMatch(/\| `oss-bounties` \| [^|]+ \| [^|]+ \| ₪2,000\.00 \| ₪370\.00 \|/);
    expect(report).not.toContain("₪2,370.00");
    expect(renderCommitSummary(result)).toContain("30d ₪2,000.00 converted, ₪370.00 unconverted");
  });

  it("the manager's screen: converted money leads, unconverted stands beside it as its own number", () => {
    bookBoth();
    const h = renderDashboard(db, { nowIso: NOW });
    expect(h).toContain("החברה הרוויחה ₪2,000.00 בכסף מומר ב-30 הימים האחרונים, ובארנק ₪370.00 לא מומר, שלא נספר בשום יעד.");
    expect(h).toContain("כסף לא מומר (ארנק)");
    expect(h).toContain("₪370.00");
    expect(h).toContain("<th>30 יום, מומר</th><th>30 יום, לא מומר</th>");
    expect(h).toMatch(/<td class="num">₪2,000\.00<\/td>\s*<td class="num">₪370\.00<\/td>/); // the line's own two cells
    expect(h).not.toContain("₪2,370.00");
  });

  it("the manager's screen with USDC only: no converted shekel earned, and the wallet number still shown", () => {
    recordLedgerEntry(db, { lineId: "oss-bounties", kind: "payout", amountMinor: 10_000, currency: "USDC", source: "superteam", externalId: HASH_A, occurredAt: AT });
    const h = renderDashboard(db, { nowIso: NOW });
    expect(h).toContain("החברה עדיין לא הרוויחה שקל מומר");
    expect(h).toContain("כסף לא מומר (ארנק)");
    expect(h).toContain("₪370.00");
  });
});

describe("USDC: the day's rate is recorded through the CLI the held receipt names", () => {
  const repoRoot = path.resolve(__dirname, "../../..");
  const run = (dbPath: string, ...args: string[]) =>
    spawnSync(process.execPath, ["--import", "tsx", "scripts/colony.ts", "fx", "--db", dbPath, ...args], { cwd: repoRoot, encoding: "utf-8" });

  it("stores the rate for that day and refuses a malformed one", () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "usdc-fx-"));
    const dbPath = path.join(dir, "colony.db");
    try {
      const ok = run(dbPath, "--currency", "USDC", "--date", DAY, "--rate", "3.71");
      expect(ok.status, ok.stderr).toBe(0);
      expect(ok.stdout).toContain(`USDC on ${DAY}: 3.71 ILS`);
      const bad = run(dbPath, "--currency", "USDC", "--date", "29.9.2026", "--rate", "3.71");
      expect(bad.status).not.toBe(0);
      const missing = run(dbPath, "--currency", "USDC", "--date", DAY);
      expect(missing.status).not.toBe(0);
      const db = createDatabase(dbPath);
      try {
        expect(getFxRateOn(db.raw, "USDC", DAY)).toBe(3.71);
      } finally {
        db.close();
      }
    } finally {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  }, 60_000);
});

describe("USDC: nothing reads a wallet key and nothing moves funds", () => {
  // A cheap structural guard for the last sentence of §6.2. The colony's code and its CLI import nothing that holds or
  // uses a key (the automaton's own wallet, chain and payment modules, or a chain client library), and name no
  // key-reading or fund-moving call. The scheduled workflows pass no secret named like a key, seed or wallet.
  const repoRoot = path.resolve(__dirname, "../../..");
  const walk = (dir: string): string[] => fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
    e.isDirectory() ? walk(path.join(dir, e.name)) : e.name.endsWith(".ts") ? [path.join(dir, e.name)] : []);
  const files = [...walk(path.join(repoRoot, "src/revenue")), path.join(repoRoot, "scripts/colony.ts")];
  const FORBIDDEN_IMPORT = /from\s+["'](?:[./]*\/(?:identity\/(?:wallet|chain)|conway\/(?:x402|topup|client))(?:\.js)?|viem(?:\/[\w/-]*)?|ethers|@solana\/web3\.js|web3)["']/;
  const FORBIDDEN_CALL = /\b(?:privateKey|private_key|PRIVATE_KEY|mnemonic|seedPhrase|signTransaction|sendTransaction|sendRawTransaction|writeContract|signTypedData|getWallet|loadWalletAccount)\b/;

  it("scans a real set of files", () => {
    expect(files.length).toBeGreaterThan(30);
    expect(FORBIDDEN_IMPORT.test('import { getWallet } from "../identity/wallet.js";')).toBe(true);
    expect(FORBIDDEN_IMPORT.test('import { createWalletClient } from "viem";')).toBe(true);
    expect(FORBIDDEN_CALL.test("const k = account.privateKey;")).toBe(true);
  });

  it("finds no wallet import and no key-reading or fund-moving call in the colony", () => {
    const offenders = files.flatMap((file) => fs.readFileSync(file, "utf-8").split("\n")
      .map((text, i) => ({ file: path.relative(repoRoot, file), line: i + 1, text }))
      .filter(({ text }) => FORBIDDEN_IMPORT.test(text) || FORBIDDEN_CALL.test(text)));
    expect(offenders).toEqual([]);
  });

  it("passes no key-, seed- or wallet-named secret to any workflow", () => {
    const dir = path.join(repoRoot, ".github/workflows");
    const names = fs.readdirSync(dir).flatMap((f) =>
      [...fs.readFileSync(path.join(dir, f), "utf-8").matchAll(/secrets\.([A-Z0-9_]+)/g)].map((m) => m[1]));
    expect(names.length).toBeGreaterThan(0);
    expect(names.filter((n) => /PRIVATE|MNEMONIC|SEED|WALLET/.test(n))).toEqual([]);
  });
});
