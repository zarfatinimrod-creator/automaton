/**
 * scripts/owner-report.ts and src/revenue/owner-report.ts: the facts of the owner's status report, read from a colony
 * database built here with the colony's own helpers (never a state/colony/ file) and from owner-steps.ts.
 */
import { afterAll, describe, expect, it } from "vitest";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdtempSync, readFileSync, rmSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import Database from "better-sqlite3";
import { createDatabase } from "../../state/database.js";
import {
  computePortfolioSummary,
  insertReview,
  listLines,
  recordLedgerEntry,
  setHumanSetupDone,
  setLineBudget,
  updateLineStatus,
} from "../../revenue/ledger.js";
import { markRan } from "../../revenue/runner.js";
import { receiptDay, setFxRateOn, toAgorotAtRate } from "../../revenue/money.js";
import { DEFAULT_PORTFOLIO, seedDefaultPortfolio } from "../../revenue/portfolio.js";
import {
  frozenOwnerStepsForLine,
  heldOwnerStepsForLine,
  isOwnerStepOpen,
  openOwnerStepsForLine,
  openSetupItems,
  ownerStepById,
  ownerStepMinutes,
  ownerStepsInOrder,
} from "../../revenue/owner-steps.js";
import { buildOwnerReport, renderOwnerReport, type OwnerReport } from "../../revenue/owner-report.js";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const SCRIPT = join(ROOT, "scripts", "owner-report.ts");
const TMP = mkdtempSync(join(tmpdir(), "owner-report-"));
afterAll(() => rmSync(TMP, { recursive: true, force: true }));

const DAY_MS = 86_400_000;
// The real clock: setFxRateOn refuses a day that has not come yet in Israel, so the rows are dated back from now.
const NOW = new Date().toISOString();
const ago = (days: number) => new Date(Date.parse(NOW) - days * DAY_MS).toISOString();

// What a ledger row may carry and the output must never print.
const SALE_ID = "sale-ext-7Hq2Zp";
const OLD_SALE_ID = "sale-ext-old-K3m9";
const REFUND_ID = "refund-ext-W8v1";
const ORPHAN_ID = "sale-ext-orphan-P4t6";
const CHAIN_ID = "0x" + "ab12".repeat(16);
const EMAIL = "buyer.person@example.com";
const EMAIL_RE = /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/;
const USDC_RATE = 3.7;

function run(args: string[]) {
  return spawnSync(process.execPath, ["--import", "tsx", SCRIPT, ...args], { cwd: ROOT, encoding: "utf-8" });
}

function sha256(file: string): string {
  return createHash("sha256").update(readFileSync(file)).digest("hex");
}

/** A colony database with a converted sale (30 days), an older converted sale and cost, a refund and a USDC payout. */
function buildLedgerDb(file: string): void {
  const adb = createDatabase(file);
  const db = adb.raw;
  seedDefaultPortfolio(db);
  recordLedgerEntry(db, { lineId: "il-biz-tools", kind: "sale", amountMinor: 7900, currency: "ILS", source: "gumroad", externalId: SALE_ID, occurredAt: ago(2), note: `receipt to ${EMAIL}` });
  recordLedgerEntry(db, { lineId: "il-biz-tools", kind: "refund", amountMinor: 2000, currency: "ILS", source: "gumroad", externalId: REFUND_ID, occurredAt: ago(1), note: EMAIL });
  recordLedgerEntry(db, { lineId: "pcn874", kind: "sale", amountMinor: 10000, currency: "ILS", source: "gumroad", externalId: OLD_SALE_ID, occurredAt: ago(45) });
  recordLedgerEntry(db, { lineId: "pcn874", kind: "cost", amountMinor: 500, currency: "ILS", source: "manual", occurredAt: ago(40), note: `paid by ${EMAIL}` });
  const usdcAt = ago(3);
  setFxRateOn(db, "USDC", receiptDay(usdcAt), USDC_RATE, NOW);
  recordLedgerEntry(db, { lineId: "oss-bounties", kind: "payout", amountMinor: 5000, currency: "USDC", source: "superteam", externalId: CHAIN_ID, occurredAt: usdcAt });
  // A row on a line the database does not hold: counted as a row, in none of the per-line sums (as REPORT.md's).
  recordLedgerEntry(db, { lineId: "no-such-line", kind: "sale", amountMinor: 999, currency: "ILS", source: "gumroad", externalId: ORPHAN_ID, occurredAt: ago(1) });
  adb.close();
}

const LEDGER_DB = join(TMP, "ledger", "colony.db");
const EMPTY_DB = join(TMP, "empty", "colony.db");
const HEALTH_DB = join(TMP, "health", "colony.db");
const STEPS_DB = join(TMP, "steps", "colony.db");
const SYNC_AT = new Date(Date.parse(NOW) - 6 * 60 * 60 * 1000 - 40 * 60 * 1000).toISOString(); // 6 h 40 min ago: 7, rounded
const USDC_AGOROT = toAgorotAtRate(5000, "USDC", USDC_RATE);

// Built at collection, before any describe body reads them.
{
  buildLedgerDb(LEDGER_DB);
  const empty = createDatabase(EMPTY_DB);
  seedDefaultPortfolio(empty.raw);
  empty.close();
  const health = createDatabase(HEALTH_DB);
  seedDefaultPortfolio(health.raw);
  markRan(health.raw, "revenue_ledger_sync", Date.parse(SYNC_AT));
  updateLineStatus(health.raw, "oss-bounties", "killed", { reason: "test", force: true });
  setLineBudget(health.raw, "pcn874", 1234);
  insertReview(health.raw, { lineId: null, level: "board", reviewer: "board", periodStart: ago(1), periodEnd: NOW, metrics: {}, decision: "hold", rationale: `nothing to decide; ${EMAIL}` });
  health.close();
  // Two lines that no longer wait on the owner: one killed, one whose setup is recorded done (still awaiting_setup).
  const steps = createDatabase(STEPS_DB);
  seedDefaultPortfolio(steps.raw);
  updateLineStatus(steps.raw, "il-biz-tools", "killed", { reason: "test", force: true });
  setHumanSetupDone(steps.raw, "pcn874", true);
  steps.close();
}

function report(file: string): OwnerReport {
  const db = new Database(file, { readonly: true, fileMustExist: true });
  try {
    return buildOwnerReport(db, { nowIso: NOW, site: { projectId: "" } });
  } finally {
    db.close();
  }
}

describe("money: the ledger's own sums, converted apart from unconverted", () => {
  it("all time and the last 30 days, with a converted and an unconverted row", () => {
    const m = report(LEDGER_DB).money;
    expect(m.allTime).toEqual({ revenueAgorot: 17900, refundsAgorot: 2000, costAgorot: 500, revenueRows: 2, unconvertedAgorot: USDC_AGOROT });
    expect(m.last30d).toEqual({ revenueAgorot: 7900, refundsAgorot: 2000, costAgorot: 0, revenueRows: 1, unconvertedAgorot: USDC_AGOROT });
    expect(USDC_AGOROT).toBe(18500);
    expect(m.rows).toEqual({ total: 6, converted: 5, unconverted: 1, onNoKnownLine: 1 });
  });

  it("the 30-day sums are the ones REPORT.md prints (computePortfolioSummary)", () => {
    const r = report(LEDGER_DB);
    const db = new Database(LEDGER_DB, { readonly: true });
    try {
      const s = computePortfolioSummary(db, NOW);
      expect(r.money.last30d.revenueAgorot - r.money.last30d.refundsAgorot).toBe(s.total30dAgorot);
      expect(r.money.last30d.costAgorot).toBe(s.totalCost30dAgorot);
      expect(r.money.last30d.unconvertedAgorot).toBe(s.unconverted30dAgorot);
      expect(r.money.revenueLessRefunds30dAgorot).toBe(s.total30dAgorot);
      expect(r.money.net30dAgorot).toBe(s.net30dAgorot);
    } finally {
      db.close();
    }
  });

  it("prints the sums through formatIls and keeps the unconverted figure out of the converted ones", () => {
    const text = renderOwnerReport(report(LEDGER_DB));
    expect(text).toContain("| In, converted (sales, subscriptions, payouts) | ₪179.00 | ₪79.00 |");
    expect(text).toContain("| Out, converted refunds | ₪20.00 | ₪20.00 |");
    expect(text).toContain("| Out, converted costs | ₪5.00 | ₪0.00 |");
    expect(text).toContain("| In, unconverted (wallet, less refunds; in no target) | ₪185.00 | ₪185.00 |");
    expect(text).toContain("Ledger rows: 6 (converted 5, unconverted 1); 1 on no line in the database, so in none of the sums above.");
  });

  it("an empty ledger reads ₪0.00 and 0 rows", () => {
    const r = report(EMPTY_DB);
    const zero = { revenueAgorot: 0, refundsAgorot: 0, costAgorot: 0, revenueRows: 0, unconvertedAgorot: 0 };
    expect(r.money.allTime).toEqual(zero);
    expect(r.money.last30d).toEqual(zero);
    expect(r.money.rows.total).toBe(0);
    expect(renderOwnerReport(r)).toContain("Ledger rows: 0 (converted 0, unconverted 0).");
  });
});

describe("revenue lines: the database's lines with owner-steps.ts's steps for each", () => {
  it("lists every line not killed with its tier, status, target, budget and setup flag, and the killed ones by id", () => {
    const r = report(HEALTH_DB);
    const db = new Database(HEALTH_DB, { readonly: true });
    try {
      const stored = listLines(db);
      expect(r.lines.map((l) => l.id)).toEqual(stored.filter((l) => l.status !== "killed").map((l) => l.id));
      expect(r.killedLines).toEqual(["oss-bounties"]);
      for (const l of r.lines) {
        const s = stored.find((x) => x.id === l.id)!;
        expect(l).toMatchObject({ tier: s.tier, status: s.status, targetMonthlyAgorot: s.targetMonthlyAgorot, budgetMonthlyCents: s.budgetMonthlyCents, setupDone: s.humanSetupDone });
      }
      expect(r.lines.find((l) => l.id === "pcn874")!.budgetMonthlyCents).toBe(1234);
    } finally {
      db.close();
    }
    expect(renderOwnerReport(r)).toContain("killed: oss-bounties)");
  });

  it("gives each line the steps asked now and the gating steps not asked now, in execution order, with their reasons", () => {
    const r = report(EMPTY_DB);
    expect(r.lines.map((l) => l.id).sort()).toEqual(DEFAULT_PORTFOLIO.map((s) => s.id).sort());
    for (const l of r.lines) {
      expect(l.stepsAskedNow).toEqual(openOwnerStepsForLine(l.id).map((s) => s.number));
      const notAsked = [...frozenOwnerStepsForLine(l.id), ...heldOwnerStepsForLine(l.id)].sort((a, b) => a.order - b.order);
      expect(l.stepsNotAskedNow.map((s) => s.number)).toEqual(notAsked.map((s) => s.number));
      expect(l.openSetupItems).toBe(openSetupItems(DEFAULT_PORTFOLIO.find((s) => s.id === l.id)!).length);
    }
    // A line gated by both a held and a frozen step lists them in execution order, not frozen-first.
    const ilb = r.lines.find((l) => l.id === "il-biz-tools")!;
    expect(ilb.stepsNotAskedNow.map((s) => s.number)).toEqual([2, 5]);
    expect(ilb.stepsNotAskedNow[1].reason).toMatch(/^frozen by /);
  });
});

describe("owner steps: owner-steps.ts's order, minutes and reasons", () => {
  const steps = report(EMPTY_DB).ownerSteps;

  it("asks the open steps in execution order with their minutes, and totals them as ownerStepMinutes does", () => {
    const open = ownerStepsInOrder().filter(isOwnerStepOpen);
    expect(open.length).toBeGreaterThan(0);
    expect(steps.askedNow.map((s) => [s.number, s.minutes])).toEqual(open.map((s) => [s.number, s.minutes]));
    expect(steps.totalMinutesAskedNow).toEqual(ownerStepMinutes(open));
    for (const [i, s] of open.entries()) {
      expect(steps.askedNow[i].earlyPart).toEqual(
        s.earlyPart ? { minutes: s.earlyPart.minutes, afterStep: ownerStepById(s.earlyPart.afterStep)!.number } : null,
      );
    }
    expect(steps.askedNow.some((s) => s.earlyPart !== null)).toBe(true);
  });

  it("names every other step, in order, with the reason the code gives", () => {
    const rest = ownerStepsInOrder().filter((s) => !isOwnerStepOpen(s));
    expect(steps.notAskedNow.map((s) => s.number)).toEqual(rest.map((s) => s.number));
    for (const [i, s] of rest.entries()) {
      const reason = s.doneOn ? `done on ${s.doneOn.date}` : s.frozen ? `frozen by ${s.frozen.rule}` : s.precondition!.short;
      expect(steps.notAskedNow[i].reason).toBe(reason);
    }
    // Asked and not asked together are the whole checklist, in its order.
    expect([...steps.askedNow, ...steps.notAskedNow].sort((a, b) => a.order - b.order).map((s) => s.number)).toEqual(
      ownerStepsInOrder().map((s) => s.number),
    );
  });

  it("asks a step only for a line the database still has waiting on the owner, and names the rest with their lines' state", () => {
    const r = report(STEPS_DB);
    const state: Record<string, string> = { "il-biz-tools": "killed", pcn874: "set up (awaiting_setup)" };
    const waiting = new Set(DEFAULT_PORTFOLIO.map((l) => l.id).filter((id) => !(id in state)));
    expect(new Set(r.lines.filter((l) => l.waitsOnOwner).map((l) => l.id))).toEqual(waiting);
    const open = ownerStepsInOrder().filter(isOwnerStepOpen);
    const expected = open.filter((s) => s.lines.some((id) => waiting.has(id)));
    // Not vacuous: some open step has no waiting line left, and some asked step names a line that no longer waits.
    expect(expected.length).toBeLessThan(open.length);
    expect(r.ownerSteps.askedNow.map((s) => s.number)).toEqual(expected.map((s) => s.number));
    expect(r.ownerSteps.totalMinutesAskedNow).toEqual(ownerStepMinutes(expected));
    for (const [i, s] of expected.entries()) {
      expect(r.ownerSteps.askedNow[i].lines).toEqual(s.lines.filter((id) => waiting.has(id)));
      expect(r.ownerSteps.askedNow[i].linesNotWaiting).toEqual(s.lines.filter((id) => !waiting.has(id)).map((id) => ({ id, state: state[id] })));
    }
    expect(r.ownerSteps.askedNow.some((s) => s.linesNotWaiting.length > 0)).toBe(true);
    // A step open in the code that no waiting line needs is named with its lines' state, not asked and not counted.
    for (const s of open.filter((x) => !expected.includes(x))) {
      expect(r.ownerSteps.notAskedNow.find((n) => n.number === s.number)).toMatchObject({
        state: "no-line-waiting",
        reason: `open in owner-steps.ts, but no line in the database waits on it (${s.lines.map((id) => `${id} ${state[id]}`).join(", ")})`,
      });
    }
    expect([...r.ownerSteps.askedNow, ...r.ownerSteps.notAskedNow].sort((a, b) => a.order - b.order).map((s) => s.number)).toEqual(
      ownerStepsInOrder().map((s) => s.number),
    );
    // A line whose setup is done is asked nothing, while a waiting line keeps its steps.
    expect(r.lines.find((l) => l.id === "pcn874")).toMatchObject({ waitsOnOwner: false, stepsAskedNow: [] });
    expect(openOwnerStepsForLine("pcn874").length).toBeGreaterThan(0);
    for (const id of waiting) {
      expect(r.lines.find((l) => l.id === id)!.stepsAskedNow).toEqual(openOwnerStepsForLine(id).map((s) => s.number));
    }
    const text = renderOwnerReport(r);
    expect(text).toContain("| none: the line no longer waits on the owner |");
    expect(text).toContain("(owner-steps.ts also names pcn874, set up (awaiting_setup)");
  });

  it("prints a row a done step owes, once its gate holds, under its own heading before 'Not asked now', and counts it", () => {
    const base = report(EMPTY_DB);
    expect(renderOwnerReport(base)).not.toContain("Asked now, alone");
    const owedRows = [
      { step: 6, row: "OWED_ROW", askedNow: true, reason: null },
      { step: 6, row: "HELD_ROW", askedNow: false, reason: "waits until something exists" },
    ];
    const text = renderOwnerReport({ ...base, ownerSteps: { ...base.ownerSteps, owedRows } });
    const heading = text.indexOf("Asked now, alone (rows done steps still owe):");
    const asked = text.indexOf("- Step 6's `OWED_ROW` row: step 6 is done, and this row was held back then");
    const notAsked = text.indexOf("Not asked now:");
    const held = text.indexOf("- Owed by done step 6: the `HELD_ROW` row waits until something exists");
    expect(heading).toBeGreaterThan(-1);
    expect(asked).toBeGreaterThan(heading);
    expect(notAsked).toBeGreaterThan(asked);
    expect(held).toBeGreaterThan(notAsked);
    // The asked row is printed once, in its own block: not again among the rows not asked.
    expect(text.split("OWED_ROW").length - 1).toBe(1);
    expect(text).toContain("minutes in all, and 1 row(s) of done steps asked alone\n");
  });

  it("holds a gated secret row back until the site has its project, and asks it once it does", () => {
    const db = new Database(EMPTY_DB, { readonly: true });
    try {
      const held = buildOwnerReport(db, { nowIso: NOW, site: { projectId: "" } }).ownerSteps.heldSecretRows;
      const open = buildOwnerReport(db, { nowIso: NOW, site: { projectId: "12345" } }).ownerSteps.heldSecretRows;
      expect(held.map((h) => h.row)).toContain("POSTHOG_READ_KEY");
      expect(open).toEqual([]);
    } finally {
      db.close();
    }
  });
});

describe("colony health: the last ledger sync as the loop-gap blocker reads it, and the latest board review", () => {
  it("counts the hours since the last ledger sync as checkLiveness rounds them, and says the blocker fires past 6", () => {
    const h = report(HEALTH_DB).health;
    expect(h.enabled).toBe(true);
    expect(h.lastLedgerSyncAt).toBe(SYNC_AT);
    expect(h.hoursSinceLedgerSync).toBe(7);
    expect(h.loopGapAlertHours).toBe(6);
    expect(h.loopGapBlocker).toContain("the loop did not run for 7 hours");
    expect(h.latestBoardReviewAt).not.toBeNull();
    const text = renderOwnerReport(report(HEALTH_DB));
    expect(text).toContain(`- Last ledger sync: ${SYNC_AT}, 7 hours ago`);
    expect(text).toContain("firing — the loop did not run for 7 hours");
    expect(text).not.toMatch(EMAIL_RE); // a review's rationale is never printed
  });

  it("says so when the recorded sync is later than the report's clock, instead of a negative number of hours ago", () => {
    const db = new Database(HEALTH_DB, { readonly: true });
    try {
      const r = buildOwnerReport(db, { nowIso: new Date(Date.parse(SYNC_AT) - 3 * 60 * 60 * 1000).toISOString(), site: { projectId: "" } });
      expect(r.health.hoursSinceLedgerSync).toBe(-3);
      expect(r.health.loopGapBlocker).toBeNull();
      const text = renderOwnerReport(r);
      expect(text).toContain(`- Last ledger sync: ${SYNC_AT}, 3 hours after this report's clock (a sync time in the future);`);
      expect(text).not.toContain("-3 hours");
    } finally {
      db.close();
    }
  });

  it("reads no sync, no gap and no board review when none was ever recorded", () => {
    expect(report(EMPTY_DB).health).toMatchObject({ lastLedgerSyncAt: null, hoursSinceLedgerSync: null, loopGapBlocker: null, latestBoardReviewAt: null });
    expect(renderOwnerReport(report(EMPTY_DB))).toContain("- Last ledger sync: never recorded");
  });
});

describe("the script: read-only, and no row's identifiers printed", () => {
  it("prints text and --json with no external id, chain id or email-shaped string, and leaves the file byte-identical", () => {
    const before = sha256(LEDGER_DB);
    const text = run(["--db", LEDGER_DB, "--now", NOW]);
    const json = run(["--db", LEDGER_DB, "--now", NOW, "--json"]);
    expect(text.status, text.stderr).toBe(0);
    expect(json.status, json.stderr).toBe(0);
    expect(sha256(LEDGER_DB)).toBe(before);
    for (const out of [text.stdout, json.stdout]) {
      for (const id of [SALE_ID, OLD_SALE_ID, REFUND_ID, ORPHAN_ID, CHAIN_ID, CHAIN_ID.slice(2, 20), EMAIL, "superteam"]) {
        expect(out).not.toContain(id);
      }
      expect(out).not.toMatch(EMAIL_RE);
    }
    expect(text.stdout).toContain("| In, converted (sales, subscriptions, payouts) | ₪179.00 | ₪79.00 |");
  }, 60_000);

  it("--json parses into the same facts the module builds", () => {
    const out = run(["--db", LEDGER_DB, "--now", NOW, "--json"]);
    expect(out.status, out.stderr).toBe(0);
    const parsed = JSON.parse(out.stdout) as OwnerReport;
    const direct = report(LEDGER_DB);
    expect(parsed.asOf).toBe(NOW);
    expect(parsed.money).toEqual(direct.money);
    expect(parsed.lines).toEqual(direct.lines);
    expect(parsed.ownerSteps.askedNow).toEqual(direct.ownerSteps.askedNow);
    expect(parsed.health.latestBoardReviewAt).toBeNull();
    expect(parsed.health.lastLedgerSyncAt).toBeNull();
  }, 60_000);

  it("refuses a database that does not exist, and does not create it", () => {
    const missing = join(TMP, "missing", "colony.db");
    const out = run(["--db", missing]);
    expect(out.status).toBe(1);
    expect(existsSync(missing)).toBe(false);
  }, 60_000);

  it("reports --now as one ISO instant, whatever form Date.parse read it in", () => {
    // The same instant as NOW, written at +03:00: as text it sorts three hours later than NOW.
    const offset = new Date(Date.parse(NOW) + 3 * 60 * 60 * 1000).toISOString().replace("Z", "+03:00");
    expect(Date.parse(offset)).toBe(Date.parse(NOW));
    const db = new Database(LEDGER_DB, { readonly: true });
    try {
      const r = buildOwnerReport(db, { nowIso: offset, site: { projectId: "" } });
      expect(r.asOf).toBe(NOW);
      expect(r.money).toEqual(report(LEDGER_DB).money);
    } finally {
      db.close();
    }
  });

  it("exits 2 on an unknown option", () => {
    expect(run(["--db", EMPTY_DB, "--write"]).status).toBe(2);
  }, 60_000);
});
