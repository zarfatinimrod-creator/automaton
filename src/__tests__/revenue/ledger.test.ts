import { describe, it, expect, beforeEach, afterEach } from "vitest";
import type BetterSqlite3 from "better-sqlite3";
import { createInMemoryDb } from "../orchestration/test-db.js";
import {
  computeLineMetrics,
  computePortfolioSummary,
  getLine,
  gumroadHandRefundRefusal,
  gumroadHandSaleRefusal,
  insertLineFromSeed,
  insertReview,
  latestKpis,
  listLedger,
  listLines,
  listReviews,
  recordKpi,
  recordLedgerEntry,
  setHumanSetupDone,
  setLineBudget,
  setLineTier,
  setRevenueColonyEnabled,
  setTargets,
  updateLineFromSeed,
  updateLineStatus,
} from "../../revenue/ledger.js";
import { createHash } from "node:crypto";
import {
  setFxRate,
  toAgorot,
  formatIls,
  agorotFromIls,
  isStoredForm,
  storedExternalId,
  STORED_EXTERNAL_ID_RE,
} from "../../revenue/money.js";
import { DEFAULT_PORTFOLIO, KILLED_LINES, seedDefaultPortfolio, syncPortfolio } from "../../revenue/portfolio.js";
import { createRevenueTools } from "../../revenue/tools.js";
import type { RevenueLineSeed } from "../../revenue/types.js";
import type { ToolContext } from "../../types.js";

function seed(overrides: Partial<RevenueLineSeed> = {}): RevenueLineSeed {
  return {
    id: "test-line",
    name: "Test line",
    category: "micro_saas",
    tier: "core",
    directorRole: "director-test-line",
    operatingLoop: "build, ship, measure, iterate",
    kpis: ["sales"],
    killCriteria: ["no sales"],
    scaleCriteria: ["target reached"],
    targetMonthlyAgorot: agorotFromIls(1000),
    budgetMonthlyCents: 1000,
    humanSetup: [],
    skillName: null,
    ...overrides,
  };
}

describe("revenue/ledger", () => {
  let db: BetterSqlite3.Database;

  beforeEach(() => {
    db = createInMemoryDb();
  });

  afterEach(() => {
    db.close();
  });

  it("inserts a seed once and never overwrites it", () => {
    expect(insertLineFromSeed(db, seed())).toBe(true);
    expect(insertLineFromSeed(db, seed({ name: "changed" }))).toBe(false);
    expect(getLine(db, "test-line")?.name).toBe("Test line");
    expect(getLine(db, "test-line")?.status).toBe("proposed");
  });

  it("parks lines with human setup in awaiting_setup", () => {
    insertLineFromSeed(db, seed({ humanSetup: ["open account"] }));
    expect(getLine(db, "test-line")?.status).toBe("awaiting_setup");
    setHumanSetupDone(db, "test-line", true);
    expect(getLine(db, "test-line")?.humanSetupDone).toBe(true);
  });

  it("rejects invalid ids and illegal transitions", () => {
    expect(() => insertLineFromSeed(db, seed({ id: "Bad Id!" }))).toThrow(/Invalid revenue line id/);
    insertLineFromSeed(db, seed());
    expect(() => updateLineStatus(db, "test-line", "scaling")).toThrow(/Illegal revenue line transition/);
    updateLineStatus(db, "test-line", "building");
    expect(getLine(db, "test-line")?.status).toBe("building");
  });

  it("lets a line awaiting setup become a ₪0 measurement, but never live (RULING-2026-09-28-floors.md §9)", () => {
    // A public page with an instrument needs no identity step; money still needs a platform payment id first.
    insertLineFromSeed(db, seed({ humanSetup: ["open account"] }));
    expect(getLine(db, "test-line")?.status).toBe("awaiting_setup");
    expect(() => updateLineStatus(db, "test-line", "live")).toThrow(/Illegal revenue line transition/);
    updateLineStatus(db, "test-line", "measuring");
    expect(getLine(db, "test-line")?.status).toBe("measuring");
  });

  it("records ledger entries idempotently and normalises to agorot", () => {
    insertLineFromSeed(db, seed());
    setFxRate(db, "USD", 3.5);
    const first = recordLedgerEntry(db, {
      lineId: "test-line", kind: "sale", amountMinor: 1000, currency: "usd", source: "Stripe", externalId: "ch_1",
    });
    expect(first).not.toBeNull();
    expect(first!.amountAgorot).toBe(3500);
    expect(first!.source).toBe("stripe");
    const dup = recordLedgerEntry(db, {
      lineId: "test-line", kind: "sale", amountMinor: 1000, currency: "USD", source: "stripe", externalId: "ch_1",
    });
    expect(dup).toBeNull();
    expect(listLedger(db, { lineId: "test-line" })).toHaveLength(1);
  });

  it("stores costs and refunds as negative amounts", () => {
    insertLineFromSeed(db, seed());
    const cost = recordLedgerEntry(db, { lineId: "test-line", kind: "cost", amountMinor: 250, currency: "ILS", source: "manual" });
    const refund = recordLedgerEntry(db, { lineId: "test-line", kind: "refund", amountMinor: 500, currency: "ILS", source: "manual", externalId: "r1" });
    expect(cost!.amountAgorot).toBe(-250);
    expect(refund!.amountAgorot).toBe(-500);
  });

  it("promotes a building line to live on its first real sale", () => {
    insertLineFromSeed(db, seed());
    updateLineStatus(db, "test-line", "building");
    recordLedgerEntry(db, { lineId: "test-line", kind: "sale", amountMinor: 9900, currency: "ILS", source: "manual", externalId: "s1" });
    const line = getLine(db, "test-line")!;
    expect(line.status).toBe("live");
    expect(line.launchedAt).not.toBeNull();
  });

  it("computes 30-day and 7-day metrics with trend and attainment", () => {
    insertLineFromSeed(db, seed({ targetMonthlyAgorot: 100_000 }));
    const now = new Date("2026-09-02T12:00:00.000Z");
    const daysAgo = (d: number) => new Date(now.getTime() - d * 86_400_000).toISOString();
    updateLineStatus(db, "test-line", "building");
    recordLedgerEntry(db, { lineId: "test-line", kind: "sale", amountMinor: 30_000, currency: "ILS", source: "manual", externalId: "a", occurredAt: daysAgo(20) });
    recordLedgerEntry(db, { lineId: "test-line", kind: "sale", amountMinor: 20_000, currency: "ILS", source: "manual", externalId: "b", occurredAt: daysAgo(3) });
    recordLedgerEntry(db, { lineId: "test-line", kind: "refund", amountMinor: 5_000, currency: "ILS", source: "manual", externalId: "c", occurredAt: daysAgo(2) });
    recordLedgerEntry(db, { lineId: "test-line", kind: "cost", amountMinor: 10_000, currency: "ILS", source: "manual", externalId: "d", occurredAt: daysAgo(1) });
    recordLedgerEntry(db, { lineId: "test-line", kind: "sale", amountMinor: 99_000, currency: "ILS", source: "manual", externalId: "old", occurredAt: daysAgo(40) });

    const m = computeLineMetrics(db, getLine(db, "test-line")!, now.toISOString());
    expect(m.revenue30dAgorot).toBe(50_000);
    expect(m.revenue7dAgorot).toBe(20_000);
    expect(m.refunds30dAgorot).toBe(5_000);
    expect(m.cost30dAgorot).toBe(10_000);
    expect(m.net30dAgorot).toBe(35_000);
    expect(m.transactions30d).toBe(2);
    expect(m.targetAttainment).toBeCloseTo(0.45, 5);
    // 7d net 15,000 × 30/7 ≈ 64,286 vs 30d net 45,000 → trend ≈ 1.43
    expect(m.trend).toBeGreaterThan(1.4);
    expect(m.trend).toBeLessThan(1.5);
    expect(m.daysSinceLastRevenue).toBeCloseTo(3, 1);
  });

  it("summarises the portfolio against the target", () => {
    insertLineFromSeed(db, seed({ id: "line-a", targetMonthlyAgorot: 100_000 }));
    insertLineFromSeed(db, seed({ id: "line-b", targetMonthlyAgorot: 100_000 }));
    setTargets(db, 200_000, 500_000);
    recordLedgerEntry(db, { lineId: "line-a", kind: "sale", amountMinor: 50_000, currency: "ILS", source: "manual", externalId: "pa" });
    recordLedgerEntry(db, { lineId: "line-b", kind: "sale", amountMinor: 30_000, currency: "ILS", source: "manual", externalId: "pb" });
    const s = computePortfolioSummary(db);
    expect(s.total30dAgorot).toBe(80_000);
    expect(s.attainment).toBeCloseTo(0.4, 5);
    expect(s.stretchMonthlyAgorot).toBe(500_000);
    expect(s.counts.live).toBe(0); // proposed lines with sales stay proposed (only building → live is automatic)
    expect(listLines(db)).toHaveLength(2);
  });

  it("keeps a review trail and KPI snapshots", () => {
    insertLineFromSeed(db, seed());
    const r = insertReview(db, {
      lineId: "test-line", level: "supervisor", reviewer: "supervisor-test-line",
      periodStart: "2026-09-01T00:00:00.000Z", periodEnd: "2026-09-02T00:00:00.000Z",
      metrics: { revenue30dAgorot: 0 }, decision: "hold", rationale: "nothing yet",
    });
    expect(listReviews(db, { lineId: "test-line" })[0].id).toBe(r.id);
    recordKpi(db, "test-line", "visitors", 12, "count");
    recordKpi(db, "test-line", "visitors", 30, "count");
    expect(latestKpis(db, "test-line").visitors.value).toBe(30);
  });

  it("money helpers format and convert", () => {
    expect(formatIls(123_456)).toBe("₪1,234.56");
    expect(formatIls(-50)).toBe("-₪0.50");
    expect(toAgorot(db, 100, "ILS")).toBe(100);
    expect(toAgorot(db, 100, "USD")).toBe(360);
    expect(() => setFxRate(db, "USD", 0)).toThrow();
  });
});


describe("the ledger will not book money nobody paid", () => {
  let db: BetterSqlite3.Database;
  beforeEach(() => {
    db = createInMemoryDb();
    insertLineFromSeed(db, seed());
  });
  afterEach(() => { db.close(); });

  const entry = (over: Partial<Parameters<typeof recordLedgerEntry>[1]> = {}) => ({
    lineId: "test-line", kind: "sale" as const, amountMinor: 10_000,
    currency: "ILS", source: "manual", ...over,
  });

  it("refuses money in without the platform's transaction id", () => {
    // MISSION rule 2. Without an id the entry is unverifiable AND undeduplicated:
    // the idempotency check has nothing to key on, so the same imagined sale can
    // be booked again and again.
    for (const kind of ["sale", "subscription", "payout"] as const) {
      expect(() => recordLedgerEntry(db, entry({ kind }))).toThrow(/externalId is required/);
      expect(() => recordLedgerEntry(db, entry({ kind, externalId: "   " }))).toThrow(/externalId is required/);
    }
  });

  it("refuses a refund without one either, so refunds cannot be double-counted", () => {
    expect(() => recordLedgerEntry(db, entry({ kind: "refund" }))).toThrow(/externalId is required/);
  });

  it("still lets us record our own costs, which have no platform receipt", () => {
    const cost = recordLedgerEntry(db, entry({ kind: "cost", amountMinor: 500 }));
    expect(cost?.amountMinor).toBe(-500);
    expect(cost?.externalId).toBeNull();
  });

  it("points the caller at the rule rather than just failing", () => {
    expect(() => recordLedgerEntry(db, entry())).toThrow(/MISSION rule 2/);
  });

  it("records nothing at all when it refuses", () => {
    expect(() => recordLedgerEntry(db, entry())).toThrow();
    const count = db.prepare("SELECT COUNT(*) AS c FROM revenue_ledger").get() as { c: number };
    expect(count.c).toBe(0);
  });
});

// RULING-2026-10-11-ledger-sale-ids.md (FABLE_QUEUE row 26), fold 7: the ledger is committed to a public repository, so a
// Gumroad sale id is stored as `sha256:` and the unkeyed SHA-256 of the platform's id, applied in recordLedgerEntry first,
// whichever path books it. The ids below are invented strings, as every fixture here is.
describe("a Gumroad sale id is stored as its digest, and still keys the row", () => {
  let db: BetterSqlite3.Database;
  beforeEach(() => {
    db = createInMemoryDb();
    insertLineFromSeed(db, seed());
  });
  afterEach(() => { db.close(); });

  const RAW = "fake-sale-Q1w2E3==";
  const hex = (text: string) => createHash("sha256").update(text, "utf8").digest("hex");
  const gumroad = (externalId: string, over: Partial<Parameters<typeof recordLedgerEntry>[1]> = {}) => ({
    lineId: "test-line", kind: "sale" as const, amountMinor: 7_900, currency: "USD", source: "gumroad", externalId, ...over,
  });
  const storedIds = () =>
    (db.prepare("SELECT source, external_id AS externalId FROM revenue_ledger ORDER BY rowid").all() as { source: string; externalId: string | null }[]);

  it("(a) stores sha256 of the raw id, in the stored form, and never the raw string", () => {
    const booked = recordLedgerEntry(db, gumroad(RAW));
    expect(booked?.externalId).toBe(`sha256:${hex(RAW)}`);
    const [row] = storedIds();
    expect(row).toEqual({ source: "gumroad", externalId: `sha256:${hex(RAW)}` });
    expect(row!.externalId).toMatch(STORED_EXTERNAL_ID_RE);
    expect(row!.externalId).not.toContain(RAW);
    expect(JSON.stringify(db.prepare("SELECT * FROM revenue_ledger").all())).not.toContain(RAW);
  });

  it("(b) booking the same raw id again is a duplicate, also with the source's case or the id's spaces changed", () => {
    expect(recordLedgerEntry(db, gumroad(RAW))).not.toBeNull();
    expect(recordLedgerEntry(db, gumroad(RAW))).toBeNull();
    expect(recordLedgerEntry(db, gumroad(`  ${RAW} `, { source: "Gumroad" }))).toBeNull();
    expect(storedIds()).toHaveLength(1);
    // The function trims as the ledger does, so the connector's untrimmed String(sale.id) keys the same row.
    expect(storedExternalId("gumroad", ` ${RAW}\n`)).toBe(`sha256:${hex(RAW)}`);
    expect(storedExternalId("Gumroad", RAW)).toBe(`sha256:${hex(RAW)}`);
    expect(storedExternalId("gumroad", "   ")).toBeNull();
  });

  it("(c) booking the stored form directly is a duplicate of the raw id, and the other way round", () => {
    expect(recordLedgerEntry(db, gumroad(RAW))).not.toBeNull();
    expect(recordLedgerEntry(db, gumroad(`sha256:${hex(RAW)}`))).toBeNull();
    expect(recordLedgerEntry(db, gumroad(`sha256:${hex("fake-sale-2")}`))).not.toBeNull();
    expect(recordLedgerEntry(db, gumroad("fake-sale-2"))).toBeNull();
    expect(storedIds()).toHaveLength(2);
  });

  it("(d) a sale, its refund and its fee share one digest, and each stored form is a duplicate of itself", () => {
    const sale = recordLedgerEntry(db, gumroad(RAW));
    const refund = recordLedgerEntry(db, gumroad(`${RAW}:refund`, { kind: "refund" }));
    const fee = recordLedgerEntry(db, gumroad(`${RAW}:fee`, { kind: "cost", amountMinor: 790 }));
    const x = hex(RAW);
    expect([sale?.externalId, refund?.externalId, fee?.externalId]).toEqual([`sha256:${x}`, `sha256:${x}:refund`, `sha256:${x}:fee`]);
    for (const [id, kind] of [[`sha256:${x}`, "sale"], [`sha256:${x}:refund`, "refund"], [`sha256:${x}:fee`, "cost"]] as const) {
      expect(id).toMatch(STORED_EXTERNAL_ID_RE);
      expect(isStoredForm("gumroad", id)).toBe(true);
      expect(storedExternalId("gumroad", id)).toBe(id);
      expect(recordLedgerEntry(db, gumroad(id, { kind }))).toBeNull();
    }
    expect(storedIds().map((r) => r.externalId)).toEqual([`sha256:${x}`, `sha256:${x}:refund`, `sha256:${x}:fee`]);
    expect(isStoredForm("gumroad", RAW)).toBe(false);
    expect(isStoredForm("gumroad", `${RAW}:refund`)).toBe(false);
  });

  it("(e) a stripe and a manual id are stored as given (the digested set is gumroad alone)", () => {
    expect(recordLedgerEntry(db, gumroad("ch_fake1", { source: "stripe" }))?.externalId).toBe("ch_fake1");
    expect(recordLedgerEntry(db, gumroad("m-fake-1", { source: "manual", currency: "ILS" }))?.externalId).toBe("m-fake-1");
    expect(storedIds()).toEqual([{ source: "stripe", externalId: "ch_fake1" }, { source: "manual", externalId: "m-fake-1" }]);
    expect(isStoredForm("stripe", "ch_fake1")).toBe(true);
    expect(storedExternalId("stripe", " ch_fake1 ")).toBe(" ch_fake1 ");
    expect(storedExternalId("gumroad", null)).toBeNull();
  });

  it("(f) a chain-shaped id booked under gumroad in USD is digested, not refused, and no refusal prints a raw gumroad id", () => {
    const evm = `0x${"ab".repeat(32)}`;
    const solana = "5".repeat(87);
    expect(recordLedgerEntry(db, gumroad(evm))?.externalId).toBe(`sha256:${hex(evm)}`);
    expect(recordLedgerEntry(db, gumroad(solana))?.externalId).toBe(`sha256:${hex(solana)}`);
    // Every refusal a gumroad entry can meet after the id is read: USDC, whose id must be a chain id (a digest never is,
    // even of a chain-shaped string), a cost in USDC, and a currency no rule books.
    const refusals: Parameters<typeof recordLedgerEntry>[1][] = [
      gumroad(RAW, { currency: "USDC", occurredAt: "2026-10-01T00:00:00Z" }),
      gumroad(evm, { currency: "USDC", occurredAt: "2026-10-01T00:00:00Z" }),
      gumroad(evm, { currency: "USDC", occurredAt: "2026-10-01T00:00:00Z", kind: "cost" }),
      gumroad(RAW, { currency: "XYZ" }),
    ];
    for (const input of refusals) {
      let message = "";
      try {
        recordLedgerEntry(db, input);
      } catch (error) {
        message = (error as Error).message;
      }
      expect(message, JSON.stringify(input)).not.toBe("");
      expect(message).not.toContain(RAW);
      expect(message).not.toContain(evm);
    }
    expect(storedIds()).toHaveLength(2);
  });
});

// Tick 63 (7.10.2026). A seed sync wrote every column of an existing line from portfolio.ts, the board's budget
// allocation among them: on the committed colony.db, where the board review had allocated 0 to the four lines (none is
// working yet), `colony.ts sync-portfolio` set them to 4000, 4000, 3000 and 4000 cents until the next daily review.
// The sync now runs before every scheduled tick, so it must keep what a decision recorded in the database owns.
describe("a seed sync keeps what the board decided in the database", () => {
  let db: BetterSqlite3.Database;
  beforeEach(() => { db = createInMemoryDb(); });
  afterEach(() => { db.close(); });

  it("keeps the board's budget allocation when the seed carries another figure", () => {
    insertLineFromSeed(db, seed({ budgetMonthlyCents: 1000 }));
    setLineBudget(db, "test-line", 0);
    const out = syncPortfolio(db, [seed({ budgetMonthlyCents: 4000, operatingLoop: "a changed loop, which does sync" })], []);
    expect(out.updated).toEqual(["test-line"]);
    expect(getLine(db, "test-line")!.budgetMonthlyCents).toBe(0);
    expect(getLine(db, "test-line")!.operatingLoop).toBe("a changed loop, which does sync");
    setLineBudget(db, "test-line", 700);
    expect(updateLineFromSeed(db, seed({ budgetMonthlyCents: 4000 }))).toBe(true);
    expect(getLine(db, "test-line")!.budgetMonthlyCents).toBe(700);
  });

  // Tick 63 review: this test first pinned the seed's 2500 here. With the sync running before every scheduled tick, a
  // line added to portfolio.ts then held its seed's 4000 cents through every hourly tick until the daily board review,
  // and for good while the colony was switched off (measured on a copy of the committed colony.db). A seed's figure is
  // not an allocation (rules.ts allocateBudget), so a line the sync inserts starts at 0 and the board review allocates.
  it("starts a line it inserts at budget 0, for the board review to allocate", () => {
    const out = syncPortfolio(db, [seed({ id: "new-line", budgetMonthlyCents: 2500 })], []);
    expect(out.inserted).toEqual(["new-line"]);
    expect(getLine(db, "new-line")!.budgetMonthlyCents).toBe(0);
    // The first scheduled run on an empty database: the whole real portfolio, every seed carrying a budget, enters at 0.
    db.prepare("DELETE FROM revenue_lines").run();
    expect(DEFAULT_PORTFOLIO.every((s) => s.budgetMonthlyCents > 0)).toBe(true);
    expect(syncPortfolio(db).inserted.sort()).toEqual(DEFAULT_PORTFOLIO.map((s) => s.id).sort());
    expect(listLines(db).map((l) => [l.id, l.budgetMonthlyCents]).filter(([, cents]) => cents !== 0)).toEqual([]);
  });

  it("keeps the tier revenue_decide set, which the allocation weighs, and lists the difference", () => {
    insertLineFromSeed(db, seed({ tier: "core" }));
    setLineTier(db, "test-line", "experimental");
    const out = syncPortfolio(db, [seed({ tier: "core" })], []);
    expect(getLine(db, "test-line")!.tier).toBe("experimental");
    expect(out.tierDiffers).toEqual([{ id: "test-line", stored: "experimental", seed: "core" }]);
    expect(syncPortfolio(db, [seed({ tier: "experimental" })], []).tierDiffers).toEqual([]);
  });

  // Tick 63 review: the test below uses a live line, whose kill fields are null, so a sync that cleared them, or that
  // brought a killed line back, survived it (the review's probe mutants R63-X1 and R63-X4). The board review kills a
  // line by its criteria (heartbeat.ts) while portfolio.ts still lists it, and the hourly sync refreshes that line.
  it("keeps a line the board killed killed, with its kill time and reason, while portfolio.ts still lists it", () => {
    const listed = DEFAULT_PORTFOLIO[0];
    insertLineFromSeed(db, listed);
    updateLineStatus(db, listed.id, "killed", { reason: "kill criteria met: no stranger used it in 30 days", force: true });
    const before = getLine(db, listed.id)!;
    expect(before.killedAt).toBeTruthy();
    const out = syncPortfolio(db, [{ ...listed, operatingLoop: "a refreshed loop" }], []);
    expect(out.updated).toEqual([listed.id]);
    expect(out.killed).toEqual([]);
    const after = getLine(db, listed.id)!;
    expect(after.operatingLoop).toBe("a refreshed loop");
    expect({ status: after.status, killedAt: after.killedAt, killReason: after.killReason })
      .toEqual({ status: "killed", killedAt: before.killedAt, killReason: "kill criteria met: no stranger used it in 30 days" });
  });

  // Tick 63 review: with kv revenue.enabled = 0 the tick returns before it writes anything (runner.ts tick), and before
  // the sync was added to the scheduled run a switched-off colony's run changed no line. The sync keeps that.
  it("changes nothing while the colony is switched off, and applies everything once it is on again", () => {
    const dead = KILLED_LINES[0];
    insertLineFromSeed(db, seed());
    insertLineFromSeed(db, seed({ id: dead.id }));
    setRevenueColonyEnabled(db, false);
    const lines = () => db.prepare("SELECT * FROM revenue_lines ORDER BY id").all();
    const kv = () => db.prepare("SELECT key, value FROM kv ORDER BY key").all();
    const [linesBefore, kvBefore] = [lines(), kv()];
    const seeds = [seed({ operatingLoop: "a changed loop" }), seed({ id: "new-line" })];
    const off = syncPortfolio(db, seeds);
    expect(off).toEqual({ disabled: true, inserted: [], updated: [], killed: [], unknown: [], tierDiffers: [] });
    expect(lines()).toEqual(linesBefore);
    expect(kv()).toEqual(kvBefore);
    setRevenueColonyEnabled(db, true);
    const on = syncPortfolio(db, seeds);
    expect(on.disabled).toBe(false);
    expect(on.inserted).toEqual(["new-line"]);
    expect(on.updated).toEqual(["test-line"]);
    expect(on.killed.map((k) => k.id)).toEqual([dead.id]);
    expect(getLine(db, "test-line")!.operatingLoop).toBe("a changed loop");
  });

  it("keeps the line's status, setup-done flag, launch, creation and kill fields, and replaces portfolio.ts's columns", () => {
    insertLineFromSeed(db, seed({ humanSetup: ["open account"] }));
    setHumanSetupDone(db, "test-line", true);
    updateLineStatus(db, "test-line", "building");
    updateLineStatus(db, "test-line", "live");
    const before = getLine(db, "test-line")!;
    expect(before.launchedAt).toBeTruthy();
    const next = seed({
      name: "Renamed",
      category: "paid_api",
      directorRole: "director-renamed",
      operatingLoop: "a new loop",
      kpis: ["k1", "k2"],
      killCriteria: ["new kill"],
      scaleCriteria: ["new scale"],
      targetMonthlyAgorot: agorotFromIls(1234),
      humanSetup: ["a new step"],
      skillName: "revenue-renamed",
      status: "proposed",
    });
    expect(updateLineFromSeed(db, next)).toBe(true);
    const after = getLine(db, "test-line")!;
    expect({ status: after.status, humanSetupDone: after.humanSetupDone, launchedAt: after.launchedAt, createdAt: after.createdAt,
      killedAt: after.killedAt, killReason: after.killReason, tier: after.tier, budgetMonthlyCents: after.budgetMonthlyCents })
      .toEqual({ status: "live", humanSetupDone: true, launchedAt: before.launchedAt, createdAt: before.createdAt,
        killedAt: before.killedAt, killReason: before.killReason, tier: before.tier, budgetMonthlyCents: before.budgetMonthlyCents });
    expect({ name: after.name, category: after.category, directorRole: after.directorRole, operatingLoop: after.operatingLoop,
      kpis: after.kpis, killCriteria: after.killCriteria, scaleCriteria: after.scaleCriteria,
      targetMonthlyAgorot: after.targetMonthlyAgorot, humanSetup: after.humanSetup, skillName: after.skillName })
      .toEqual({ name: "Renamed", category: "paid_api", directorRole: "director-renamed", operatingLoop: "a new loop",
        kpis: ["k1", "k2"], killCriteria: ["new kill"], scaleCriteria: ["new scale"],
        targetMonthlyAgorot: agorotFromIls(1234), humanSetup: ["a new step"], skillName: "revenue-renamed" });
  });

  it("on the real portfolio: every budget the board set survives, and an already-killed line is not killed again", () => {
    seedDefaultPortfolio(db);
    for (const dead of KILLED_LINES) {
      insertLineFromSeed(db, seed({ id: dead.id, targetMonthlyAgorot: 0 }));
      updateLineStatus(db, dead.id, "killed", { reason: dead.reason, force: true });
    }
    for (const line of listLines(db)) setLineBudget(db, line.id, 0);
    expect(DEFAULT_PORTFOLIO.every((s) => s.budgetMonthlyCents > 0)).toBe(true);
    const out = syncPortfolio(db);
    expect(out.disabled).toBe(false);
    expect(out.updated.sort()).toEqual(DEFAULT_PORTFOLIO.map((s) => s.id).sort());
    expect(out.inserted).toEqual([]);
    expect(out.killed).toEqual([]);
    expect(out.tierDiffers).toEqual([]);
    expect(listLines(db)).toHaveLength(DEFAULT_PORTFOLIO.length + KILLED_LINES.length);
    expect(listLines(db).filter((l) => l.budgetMonthlyCents !== 0).map((l) => l.id)).toEqual([]);
  });
});

// Tick 76 (CHANNEL_LOOP §9 "Queued 12.10 (tick 74)" item 2). The hourly sync re-reads every Gumroad sale the ledger holds
// with no refund row under `<the sale's stored id>:refund` and books the refund Gumroad reports under that id, on the
// sale's line (tick 74, readLateGumroadRefunds); the ledger deduplicates on (source, external_id) alone. A Gumroad refund
// booked by hand under any other id leaves its sale open, and the next sync books the same refund again. So the agent's
// revenue_record refuses it, changing nothing, unless its id, stored, is `sha256:<hex>:refund` of a Gumroad sale the
// ledger holds, on that sale's line. Every booking here goes through the real tool's execute. The ids are invented.
describe("revenue_record books a Gumroad refund only where the sync will find it (tick 76)", () => {
  let db: BetterSqlite3.Database;
  beforeEach(() => {
    db = createInMemoryDb();
    insertLineFromSeed(db, seed());
    insertLineFromSeed(db, seed({ id: "other-line", directorRole: "director-other-line" }));
  });
  afterEach(() => { db.close(); });

  const SALE = "fake-sale-T76a==";
  const hex = (text: string) => createHash("sha256").update(text, "utf8").digest("hex");
  const ctx = () => ({ db: { raw: db }, identity: { name: "tester" } }) as unknown as ToolContext;
  const record = (args: Record<string, unknown>) =>
    createRevenueTools().find((t) => t.name === "revenue_record")!.execute(
      // Gumroad's created_at for the sale: a gumroad sale booked by hand carries it (RULING-2026-10-13 §3, tick 77).
      { line_id: "test-line", kind: "refund", amount_minor: 7_900, currency: "USD", source: "gumroad", occurred_at: "2026-10-01T10:00:00.000Z", ...args },
      ctx(),
    );
  const bookSale = async (externalId = SALE, lineId = "test-line") =>
    expect(await record({ kind: "sale", external_id: externalId, line_id: lineId })).toContain("Recorded sale");
  type Row = { kind: string; lineId: string; source: string; amountMinor: number; externalId: string | null };
  const rows = (): Row[] =>
    db.prepare(
      "SELECT kind, line_id AS lineId, source, amount_minor AS amountMinor, external_id AS externalId FROM revenue_ledger ORDER BY rowid",
    ).all() as Row[];
  const refunds = () => rows().filter((r) => r.kind === "refund");

  it("a raw `<sale id>:refund` of a booked sale books, on the sale's line, under the sale's digest with :refund", async () => {
    await bookSale();
    expect(await record({ external_id: `${SALE}:refund` })).toContain("Recorded refund");
    expect(refunds()).toEqual([
      { kind: "refund", lineId: "test-line", source: "gumroad", amountMinor: -7_900, externalId: `sha256:${hex(SALE)}:refund` },
    ]);
  });

  it("the stored form `sha256:<hex>:refund` books too, and so does a sale booked in the stored form", async () => {
    await bookSale(`sha256:${hex(SALE)}`);
    expect(await record({ external_id: `sha256:${hex(SALE)}:refund` })).toContain("Recorded refund");
    expect(refunds().map((r) => r.externalId)).toEqual([`sha256:${hex(SALE)}:refund`]);
  });

  it("a refund under an unrelated id is refused, names the form and why, and books nothing", async () => {
    await bookSale();
    const out = await record({ external_id: "fake-refund-T76-other" });
    expect(out).toMatch(/^Error: /);
    expect(out).toContain('"<sale id>:refund"');
    expect(out).toContain("sha256:<hex>:refund");
    expect(out).toContain("the hourly sync re-reads every Gumroad sale the ledger holds with no refund under that id and would book its refund again");
    expect(out).toContain(`stored as sha256:${hex("fake-refund-T76-other")}`);
    expect(out).toContain("Nothing was recorded.");
    expect(out).not.toContain("fake-refund-T76-other");
    expect(rows()).toHaveLength(1);
    expect(refunds()).toEqual([]);
  });

  it("the sale's own id with no suffix, or with :fee, is no refund id: refused, not reported as a duplicate of the sale", async () => {
    await bookSale();
    for (const id of [SALE, `sha256:${hex(SALE)}`, `${SALE}:fee`, `sha256:${hex(SALE)}:fee`]) {
      const out = await record({ external_id: id });
      expect(out, id).toMatch(/^Error: a gumroad refund is booked under its sale's own id/);
      expect(out, id).not.toContain("Duplicate");
    }
    expect(rows()).toHaveLength(1);
  });

  it("a refund whose sale is not in the ledger is refused, by the sale's stored id, and books nothing", async () => {
    await bookSale("fake-sale-T76-booked");
    const out = await record({ external_id: `${SALE}:refund` });
    expect(out).toMatch(/^Error: /);
    expect(out).toContain(`no Gumroad sale sha256:${hex(SALE)} is in the ledger`);
    expect(out).toContain("Book the sale first.");
    expect(out).not.toContain(SALE);
    expect(refunds()).toEqual([]);
    // A sale the ledger holds under another kind is no sale: the sync re-reads booked sales alone.
    expect(await record({ kind: "subscription", external_id: "fake-sub-T76" })).toContain("Recorded subscription");
    expect(await record({ external_id: "fake-sub-T76:refund" })).toContain(`no Gumroad sale sha256:${hex("fake-sub-T76")} is in the ledger`);
    expect(refunds()).toEqual([]);
  });

  it("a refund on another line than its sale's is refused, naming the sale's line, and books nothing", async () => {
    await bookSale();
    const out = await record({ external_id: `${SALE}:refund`, line_id: "other-line" });
    expect(out).toMatch(/^Error: /);
    expect(out).toContain(`the Gumroad sale sha256:${hex(SALE)} is booked on test-line`);
    expect(out).toContain("other-line is another line");
    expect(refunds()).toEqual([]);
    // On the sale's own line it books.
    expect(await record({ external_id: `${SALE}:refund` })).toContain("Recorded refund");
    expect(refunds().map((r) => r.lineId)).toEqual(["test-line"]);
  });

  it("the source's case changes nothing: a Gumroad refund under an unrelated id is refused", async () => {
    await bookSale();
    expect(await record({ source: "Gumroad", external_id: "fake-refund-T76-case" })).toMatch(/^Error: a gumroad refund is booked under/);
    expect(refunds()).toEqual([]);
  });

  it("a refund from any other source, and a Gumroad sale or cost, are untouched by the rule", async () => {
    expect(await record({ source: "stripe", external_id: "re_fake_T76" })).toContain("Recorded refund");
    expect(await record({ source: "manual", currency: "ILS", external_id: "m-refund-T76" })).toContain("Recorded refund");
    expect(await record({ source: "lemonsqueezy", external_id: "fake-order-T76:refund" })).toContain("Recorded refund");
    expect(await record({ kind: "cost", amount_minor: 790, external_id: "fake-cost-T76" })).toContain("Recorded cost");
    expect(await record({ kind: "sale", external_id: "fake-sale-T76-plain" })).toContain("Recorded sale");
    expect(refunds().map((r) => [r.source, r.externalId])).toEqual([
      ["stripe", "re_fake_T76"], ["manual", "m-refund-T76"], ["lemonsqueezy", "fake-order-T76:refund"],
    ]);
  });

  it("a second refund under the same id stays a duplicate, raw or stored, on any line: Nothing changed", async () => {
    await bookSale();
    expect(await record({ external_id: `${SALE}:refund` })).toContain("Recorded refund");
    const dup = `Duplicate: gumroad/sha256:${hex(SALE)}:refund was already recorded. Nothing changed.`;
    expect(await record({ external_id: `${SALE}:refund` })).toBe(dup);
    expect(await record({ external_id: `sha256:${hex(SALE)}:refund` })).toBe(dup);
    expect(await record({ external_id: `${SALE}:refund`, line_id: "other-line" })).toBe(dup);
    expect(refunds()).toHaveLength(1);
  });

  // Rows in the form the ledger held before RULING-2026-10-11-ledger-sale-ids.md, put in by SQL: the sync keys them by
  // their digests (openGumroadSales), and so does the rule.
  const insertRaw = (rowId: string, kind: "sale" | "refund", externalId: string) =>
    db.prepare(
      `INSERT INTO revenue_ledger (id, line_id, kind, amount_minor, currency, amount_agorot, source, external_id, occurred_at, recorded_at, note)
       VALUES (?, 'test-line', ?, ?, 'USD', ?, 'gumroad', ?, '2026-10-01T10:00:00.000Z', '2026-10-01T10:00:00.000Z', NULL)`,
    ).run(rowId, kind, kind === "refund" ? -7_900 : 7_900, kind === "refund" ? -28_440 : 28_440, externalId);

  it("a sale booked before the digest ruling, its raw id in the row, is found by its digest: its refund books", async () => {
    insertRaw("fake-row-T76-1", "sale", SALE);
    expect(await record({ external_id: `${SALE}:refund` })).toContain("Recorded refund");
    expect(refunds().map((r) => r.externalId)).toEqual([`sha256:${hex(SALE)}:refund`]);
  });

  it("a refund already booked before the digest ruling, under its raw id, is not booked a second time", async () => {
    insertRaw("fake-row-T76-2", "sale", SALE);
    insertRaw("fake-row-T76-3", "refund", `${SALE}:refund`);
    const out = await record({ external_id: `${SALE}:refund` });
    expect(out).toMatch(/^Error: /);
    expect(out).toContain(`the refund of the Gumroad sale sha256:${hex(SALE)} is already in the ledger`);
    expect(out).not.toContain(SALE);
    expect(refunds()).toHaveLength(1);
  });

  it("a Gumroad refund with no id meets the ledger's own rule-2 refusal, not this rule's", async () => {
    await bookSale();
    expect(await record({})).toMatch(/^Error: externalId is required for a refund/);
    expect(refunds()).toEqual([]);
  });

  it("the line is compared as the ledger books it, trimmed", async () => {
    await bookSale();
    expect(gumroadHandRefundRefusal(db, { lineId: " test-line ", kind: "refund", source: "gumroad", externalId: `${SALE}:refund` })).toBeNull();
    expect(gumroadHandRefundRefusal(db, { lineId: "other-line", kind: "refund", source: "gumroad", externalId: `${SALE}:refund` }))
      .toContain("other-line is another line");
  });

  // The tick-76 review: rows of another source under a Gumroad stored id are no Gumroad rows. Source manual stores an id
  // as given, so its rows here sit under `sha256:<hex>` and `sha256:<hex>:refund` with no Gumroad sale behind them.
  it("a manual row under a Gumroad refund's or sale's stored id is no Gumroad row: the refund is still refused, no sale", async () => {
    const H = `sha256:${hex(SALE)}`;
    expect(await record({ source: "manual", kind: "sale", external_id: H })).toContain("Recorded sale");
    expect(await record({ source: "manual", external_id: `${H}:refund` })).toContain("Recorded refund");
    const out = await record({ external_id: `${H}:refund` });
    expect(out).toMatch(/^Error: /);
    expect(out).toContain(`no Gumroad sale ${H} is in the ledger`);
    expect(rows().filter((r) => r.source === "gumroad")).toEqual([]);
  });

  it("a manual sale under a Gumroad sale's stored id does not decide the refund's line: the Gumroad sale's line does", async () => {
    const H = `sha256:${hex(SALE)}`;
    expect(await record({ source: "manual", kind: "sale", external_id: H, line_id: "other-line" })).toContain("Recorded sale");
    await bookSale();
    const out = await record({ external_id: `${SALE}:refund`, line_id: "other-line" });
    expect(out).toMatch(/^Error: /);
    expect(out).toContain(`the Gumroad sale ${H} is booked on test-line`);
    expect(refunds()).toEqual([]);
  });

  it("a refund of a booked Gumroad sale under any other source is refused: Gumroad money is booked under gumroad only", async () => {
    await bookSale();
    const tries: [string, string][] = [
      ["manual", `sha256:${hex(SALE)}:refund`],
      ["manual", `${SALE}:refund`],
      [" Manual ", ` ${SALE}:refund `],
      ["stripe", `${SALE}:refund`],
    ];
    for (const [source, id] of tries) {
      const out = await record({ source, external_id: id });
      expect(out, `${source} ${id}`).toMatch(/^Error: /);
      expect(out, `${source} ${id}`).toContain(`the Gumroad sale sha256:${hex(SALE)} is in the ledger`);
      expect(out, `${source} ${id}`).toContain("Gumroad money is booked only under source gumroad");
      expect(out, `${source} ${id}`).toContain("Book it under source gumroad. Nothing was recorded.");
      expect(out, `${source} ${id}`).not.toContain(SALE);
    }
    expect(refunds()).toEqual([]);
    // Under gumroad, as the rule says, it books; with that refund booked, one under manual is refused still.
    expect(await record({ external_id: `${SALE}:refund` })).toContain("Recorded refund");
    expect(await record({ source: "manual", external_id: `${SALE}:refund` })).toContain("Gumroad money is booked only under source gumroad");
    expect(refunds().map((r) => r.source)).toEqual(["gumroad"]);
  });

  it("the tool's description says Gumroad money is booked under source gumroad only", () => {
    const tool = createRevenueTools().find((t) => t.name === "revenue_record")!;
    expect(tool.description).toContain("Gumroad money is booked only under source gumroad");
  });

  it("the tool's description and its external_id text state the rule", () => {
    const tool = createRevenueTools().find((t) => t.name === "revenue_record")!;
    expect(tool.description).toContain("A gumroad refund is booked only under <sale id>:refund");
    const params = tool.parameters as { properties: Record<string, { description: string }> };
    expect(params.properties.external_id!.description).toContain("A gumroad refund's id is <sale id>:refund");
  });
});

// RULING-2026-10-13-gumroad-refund-reread.md §3 item 1 (fold 5, FABLE_QUEUE row 32; tick 77): the hourly sync's own
// listing and its late-refund re-read take their reach from the day the ledger dates a Gumroad sale, so a sale booked by
// hand at now, days after Gumroad made it, lies where no listing returns it and its refund is never read. revenue_record
// refuses a gumroad sale whose occurred_at is missing, blank or not a time Date.parse reads, before anything is written.
// Other sources and kinds keep their default of now. Every id is invented.
describe("revenue_record books a Gumroad sale only with the time Gumroad made it (RULING-2026-10-13 §3, case i)", () => {
  let db: BetterSqlite3.Database;
  beforeEach(() => {
    db = createInMemoryDb();
    insertLineFromSeed(db, seed());
  });
  afterEach(() => { db.close(); });

  const SALE = "fake-sale-T77a==";
  const CREATED = "2026-10-01T10:00:00.000Z";
  const REFUSAL =
    "a gumroad sale booked by hand carries the time Gumroad made it — the sale's created_at as GET /v2/sales returns " +
    "it — as occurred_at: the hourly sync's listing and its late-refund re-read take their reach from that day, and a " +
    "sale dated at its booking lies where no listing returns it, so its refund could never be read " +
    "(RULING-2026-10-13 §3). Nothing was recorded.";
  const hex = (text: string) => createHash("sha256").update(text, "utf8").digest("hex");
  const ctx = () => ({ db: { raw: db }, identity: { name: "tester" } }) as unknown as ToolContext;
  const tool = () => createRevenueTools().find((t) => t.name === "revenue_record")!;
  const record = (args: Record<string, unknown>) =>
    tool().execute({ line_id: "test-line", kind: "sale", amount_minor: 7_900, currency: "USD", source: "gumroad", external_id: SALE, ...args }, ctx());
  type Row = { kind: string; source: string; externalId: string | null; occurredAt: string };
  const rows = (): Row[] =>
    db.prepare("SELECT kind, source, external_id AS externalId, occurred_at AS occurredAt FROM revenue_ledger ORDER BY rowid").all() as Row[];
  /** A time stamped by the ledger's default of now, between two readings of the clock. */
  const isNow = (iso: string, before: string, after: string) => iso >= before && iso <= after;

  it("a gumroad sale with no occurred_at is refused, with the reason, and nothing is written", async () => {
    expect(await record({})).toBe(`Error: ${REFUSAL}`);
    expect(rows()).toEqual([]);
  });

  it("a blank occurred_at, or one Date.parse cannot read, is refused the same way", async () => {
    for (const occurredAt of ["", "   ", "not-a-time", "2026-13-45T00:00:00Z"]) {
      expect(await record({ occurred_at: occurredAt }), occurredAt).toBe(`Error: ${REFUSAL}`);
    }
    expect(rows()).toEqual([]);
  });

  it("the source's case and spaces change nothing: Gumroad and ' gumroad ' are refused too, and no id is printed", async () => {
    for (const source of ["Gumroad", " gumroad "]) {
      const out = await record({ source });
      expect(out, source).toBe(`Error: ${REFUSAL}`);
      expect(out).not.toContain(SALE);
      expect(out).not.toContain(hex(SALE));
    }
    expect(rows()).toEqual([]);
  });

  it("with Gumroad's created_at it is recorded, dated at it", async () => {
    expect(await record({ occurred_at: CREATED })).toContain("Recorded sale");
    expect(rows()).toEqual([{ kind: "sale", source: "gumroad", externalId: `sha256:${hex(SALE)}`, occurredAt: CREATED }]);
  });

  it("a stripe or manual sale with no occurred_at is recorded, dated now (regression)", async () => {
    const before = new Date().toISOString();
    expect(await record({ source: "stripe", external_id: "ch_fake_T77" })).toContain("Recorded sale");
    expect(await record({ source: "manual", currency: "ILS", external_id: "m-sale-T77" })).toContain("Recorded sale");
    const after = new Date().toISOString();
    const booked = rows();
    expect(booked.map((r) => [r.source, r.externalId])).toEqual([["stripe", "ch_fake_T77"], ["manual", "m-sale-T77"]]);
    for (const r of booked) expect(isNow(r.occurredAt, before, after), r.occurredAt).toBe(true);
  });

  it("a gumroad cost, subscription or refund with no occurred_at keeps the default of now (unchanged behaviour)", async () => {
    expect(await record({ occurred_at: CREATED })).toContain("Recorded sale");
    const before = new Date().toISOString();
    expect(await record({ kind: "cost", amount_minor: 790, external_id: `${SALE}:fee` })).toContain("Recorded cost");
    expect(await record({ kind: "subscription", external_id: "fake-sub-T77" })).toContain("Recorded subscription");
    expect(await record({ kind: "refund", external_id: `${SALE}:refund` })).toContain("Recorded refund");
    const after = new Date().toISOString();
    const later = rows().slice(1);
    expect(later.map((r) => r.kind)).toEqual(["cost", "subscription", "refund"]);
    for (const r of later) expect(isNow(r.occurredAt, before, after), `${r.kind} ${r.occurredAt}`).toBe(true);
  });

  it("gumroadHandSaleRefusal: the refusal for a gumroad sale without a readable time, null for every other kind or source", () => {
    const base = { kind: "sale" as const, source: "gumroad" };
    expect(gumroadHandSaleRefusal(base)).toBe(REFUSAL);
    expect(gumroadHandSaleRefusal({ ...base, occurredAt: "not-a-time" })).toBe(REFUSAL);
    expect(gumroadHandSaleRefusal({ ...base, occurredAt: CREATED })).toBeNull();
    expect(gumroadHandSaleRefusal({ ...base, occurredAt: "2026-10-01T13:00:00+03:00" })).toBeNull();
    for (const kind of ["subscription", "payout", "refund", "cost"] as const) {
      expect(gumroadHandSaleRefusal({ ...base, kind }), kind).toBeNull();
    }
    for (const source of ["stripe", "manual", "lemonsqueezy", "gumroad-like"]) {
      expect(gumroadHandSaleRefusal({ ...base, source }), source).toBeNull();
    }
  });

  it("the tool's description and its occurred_at text say a gumroad sale's occurred_at is Gumroad's created_at, required", () => {
    const t = tool();
    expect(t.description).toContain(
      "A gumroad sale booked by hand needs occurred_at, Gumroad's created_at for that sale as GET /v2/sales returns it; without it, or with a time that cannot be read, it is refused",
    );
    const params = t.parameters as { properties: Record<string, { description: string }> };
    expect(params.properties.occurred_at!.description).toContain(
      "A gumroad sale's occurred_at is Gumroad's created_at for that sale, as GET /v2/sales returns it, and is required",
    );
  });
});
