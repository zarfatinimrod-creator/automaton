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
  hasPendingPrecondition,
  heldOwnerStepsForLine,
  identityOnLine,
  isOwnerStepOpen,
  LINE_PAYMENT_WAITS,
  openOwnerStepsForLine,
  openSetupItems,
  OWNER_STEP_ORDER_RULED,
  ownerStepById,
  ownerStepMinutes,
  ownerStepsForLine,
  ownerStepsInOrder,
} from "../../revenue/owner-steps.js";
import {
  buildFirstPaymentPath,
  buildOwnerReport,
  firstSentence,
  renderFirstPayment,
  renderOwnerReport,
  type FirstPaymentPath,
  type OwnerReport,
} from "../../revenue/owner-report.js";

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
    // A line gated by both a held and a frozen step lists them in execution order, not frozen-first. Since ruling 12.10
    // step 3 is held too, until the day-56 PASS.
    const ilb = r.lines.find((l) => l.id === "il-biz-tools")!;
    expect(ilb.stepsNotAskedNow.map((s) => s.number)).toEqual([2, 3, 5]);
    expect(ilb.stepsNotAskedNow[1].reason).toBe(ownerStepById("gumroad")!.precondition!.short);
    expect(ilb.stepsNotAskedNow[2].reason).toMatch(/^frozen by /);
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

  // Ruling 12.10 (RULING-2026-10-12-owner-step-order.md §2, "What the surfaces print after the fold"): asked now are
  // steps 8, 7 and 6, 43-53 minutes; step 3 is held with its gate; the rows steps 3 and 7 make are not asked yet.
  it("asks steps 8, 7 and 6 now, names step 3 held with its gate, and the rows other steps make as not asked yet (ruling 12.10)", () => {
    const text = renderOwnerReport(report(EMPTY_DB));
    const block = text.slice(text.indexOf("## Owner steps (docs/OWNER_STEPS.he.md)"), text.indexOf("## Shortest path to a first payment"));
    expect(block).toContain(
      "## Owner steps (docs/OWNER_STEPS.he.md): 3 asked now, 43-53 minutes in all\n\n" +
        "1. Step 8 (`brand-mailbox`): 10 min — lines apify-actors, il-biz-tools\n" +
        "2. Step 7 (`github-org`): 15-20 min — lines oss-bounties, pcn874\n" +
        "3. Step 6 (`ci-tokens`): 18-23 min; its early part, 8 min, may follow step 8 — lines apify-actors, il-biz-tools, oss-bounties, pcn874\n",
    );
    const notAsked = block.slice(block.indexOf("Not asked now:"));
    expect(notAsked).toContain(
      "- Step 2 (`tax-file`, 60-90 min): only when a paid product is ready, after the official cost check\n" +
        "- Step 3 (`gumroad`, 20 min): only when a paid product is ready — after the day-56 page-view PASS of il-biz-tools or pcn874, together with step 2\n" +
        "- Step 5 (`domain`, 10 min): frozen by the owner's ₪0 rule of 27.9.2026\n",
    );
    expect(notAsked).toContain(
      "- Step 6's `POSTHOG_READ_KEY` row waits until the colony has created the brand's PostHog project (posthog.projectId in products/il-biz-tools/src/config/site.json)\n" +
        "- Step 6's `GUMROAD_ACCESS_TOKEN` row waits until step 3, which makes it, is done\n" +
        "- Step 6's `BRAND_GITHUB_TOKEN` row waits until step 7, which makes it, is done\n" +
        "- Step 6's `ORG_BUDGETS_READ_TOKEN` row waits until step 7, which makes it, is done\n",
    );
    expect(notAsked).not.toContain("APIFY_TOKEN");
    // The smallest set is unchanged by the hold: a held step is still between the line and a payment.
    expect(text).toContain("Steps 8, 2, 3, 6 (in the code's order), 108-143 minutes in all: after them `il-biz-tools` can take a payment");
  });

  it("holds a gated secret row back until the site has its project, and asks it once it does", () => {
    const db = new Database(EMPTY_DB, { readonly: true });
    try {
      const held = buildOwnerReport(db, { nowIso: NOW, site: { projectId: "" } }).ownerSteps.heldSecretRows;
      const open = buildOwnerReport(db, { nowIso: NOW, site: { projectId: "12345" } }).ownerSteps.heldSecretRows;
      expect(held.map((h) => h.row)).toContain("POSTHOG_READ_KEY");
      // Once the project exists the gated row is asked; the rows steps 3 and 7 make still wait for those steps (ruling 12.10).
      expect(open.map((h) => h.row)).not.toContain("POSTHOG_READ_KEY");
      expect(open).toEqual([
        { step: 6, row: "GUMROAD_ACCESS_TOKEN", reason: "waits until step 3, which makes it, is done" },
        { step: 6, row: "BRAND_GITHUB_TOKEN", reason: "waits until step 7, which makes it, is done" },
        { step: 6, row: "ORG_BUDGETS_READ_TOKEN", reason: "waits until step 7, which makes it, is done" },
      ]);
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

// Tick 69 (11.10.2026): "how far are we from the first shekel?" was answered twice by a fresh synthesis (7.10, 11.10), and
// the second needed an adversarial verifier to take out 19 overstatements. The section reads it from the code instead.
describe("the shortest path to a first payment: owner-steps.ts's steps, gates and waits, per line", () => {
  const path = report(EMPTY_DB).firstPayment;
  const line = (p: FirstPaymentPath, id: string) => p.lines.find((l) => l.id === id)!;
  const text = renderOwnerReport(report(EMPTY_DB));
  const section = text.slice(text.indexOf("## Shortest path to a first payment"), text.indexOf("## Colony health"));

  // Ruling 12.10 (RULING-2026-10-12-owner-step-order.md §1, Fold 6): the board has ruled; the line beside the code's order
  // says what it ruled, and the section no longer "picks neither".
  it("prints the code's order and, beside it, the ruled line of 12.10", () => {
    expect(path.codeOrder).toEqual(ownerStepsInOrder().map((s) => s.number));
    expect(path.codeOrder).toEqual([1, 8, 2, 3, 5, 7, 4, 6]);
    expect(path.orderRuled).toBe(OWNER_STEP_ORDER_RULED);
    expect(section).toContain(
      "Steps in the code's order (owner-steps.ts `order`): 1 → 8 → 2 → 3 → 5 → 7 → 4 → 6.\n" +
        "The order is the code's, ruled 12.10.2026 (research/channel-loop/RULING-2026-10-12-owner-step-order.md, FABLE_QUEUE row 29): " +
        "the free steps come first because step 1 is done, step 5 is frozen and steps 2 and 3 are held until a paid product is ready — " +
        "for il-biz-tools and pcn874 the day-56 page-view PASS, or the day-112 read after its one extension, the floors ruling of 28.9 row 9 item 3.\n",
    );
    expect(section).not.toMatch(/under review|has not ruled/);
    // Between the owner-steps list and colony health, as one section.
    expect(text.indexOf("## Shortest path to a first payment")).toBeGreaterThan(text.indexOf("Not asked now:"));
  });

  it("lists, for each line not killed, every step that gates it in the code's order, with its state, gate, minutes, identity and unlocks", () => {
    expect(path.lines.map((l) => l.id)).toEqual(report(EMPTY_DB).lines.map((l) => l.id));
    for (const l of path.lines) {
      const steps = ownerStepsForLine(l.id);
      expect(l.steps.map((s) => s.number), l.id).toEqual(steps.map((s) => s.number));
      for (const [i, s] of steps.entries()) {
        const p = l.steps[i];
        expect(p.minutes).toEqual(s.minutes);
        expect(p.identity).toEqual(s.identity);
        expect(p.identityHere, `${l.id} step ${s.number} identity here`).toBe(identityOnLine(s, l.id));
        expect(s.unlocks.startsWith(p.unlocks), `${s.id} unlocks`).toBe(true);
        expect(p.unlocks.endsWith(".")).toBe(true);
        expect(p.unlocks.length).toBeLessThan(s.unlocks.length);
        const state = s.doneOn ? "done" : s.frozen ? "frozen" : hasPendingPrecondition(s) ? "held" : "asked";
        expect(p.state, `${l.id} step ${s.number}`).toBe(state);
        if (state === "asked") expect(p.gate).toBeNull();
        if (state === "held") expect(p.gate).toBe(s.precondition!.short);
        if (state === "done") expect(p.gate).toBe(`done on ${s.doneOn!.date}`);
      }
      expect(l.waits).toEqual(LINE_PAYMENT_WAITS[l.id]);
    }
    const domain = line(path, "il-biz-tools").steps.find((s) => s.id === "domain")!;
    expect(domain.state).toBe("frozen");
    expect(domain.gate).toBe("frozen by the owner's ₪0 rule of 27.9.2026; instead: Sites deploy on *.netlify.app (Netlify's free subdomain).");
    expect(line(path, "il-biz-tools").steps.find((s) => s.id === "tax-file")!.state).toBe("held");
    expect(line(path, "oss-bounties").steps.find((s) => s.id === "algora-stripe")!.state).toBe("held");
  });

  it("counts a line's remaining steps, done and frozen ones aside, with ownerStepMinutes", () => {
    const ilb = line(path, "il-biz-tools");
    expect(ilb.toPay.steps).toEqual([8, 2, 3, 6]);
    expect(ilb.toPay.minutes).toEqual(ownerStepMinutes(ownerStepsForLine("il-biz-tools").filter((s) => !s.doneOn && !s.frozen)));
    expect(ilb.toPay.minutes).toEqual({ min: 108, max: 143 });
    expect(line(path, "oss-bounties").toPay).toEqual({ steps: [2, 7, 4, 6], minutes: { min: 108, max: 148 } });
    expect(line(path, "pcn874").toPay).toEqual({ steps: [2, 3, 7, 6], minutes: { min: 113, max: 153 } });
    // Step 8 gates apify-actors since ruling 12.10 (§3(3)): its Apify account is opened with the brand mailbox.
    expect(line(path, "apify-actors").toPay).toEqual({ steps: [8, 2, 6], minutes: { min: 88, max: 123 } });
  });

  it("names the smallest set: il-biz-tools' four steps, not apify-actors' cheaper two, whose payout needs an owner action outside the steps", () => {
    expect(path.smallest).toEqual([{ line: "il-biz-tools", steps: [8, 2, 3, 6], minutes: { min: 108, max: 143 } }]);
    const apify = line(path, "apify-actors");
    expect(apify.notByStepsAlone).toEqual(LINE_PAYMENT_WAITS["apify-actors"]!.filter((w) => w.kind === "owner-later").map((w) => w.what));
    expect(apify.notByStepsAlone).toHaveLength(1);
    for (const id of ["il-biz-tools", "oss-bounties", "pcn874"]) expect(line(path, id).notByStepsAlone, id).toEqual([]);
    // Without the owner action, apify-actors' two steps are the fewest minutes: the exclusion is what decides.
    const noLater = Object.fromEntries(Object.entries(LINE_PAYMENT_WAITS).map(([id, ws]) => [id, ws.filter((w) => w.kind === "read")]));
    const lines = path.lines.map((l) => ({ id: l.id, waitsOnOwner: l.waitsOnOwner }));
    const withoutLater = buildFirstPaymentPath(lines, ownerStepsInOrder(), noLater);
    expect(withoutLater.smallest).toEqual([{ line: "apify-actors", steps: [8, 2, 6], minutes: { min: 88, max: 123 } }]);
    // On apify-actors' own path step 6's identity part is asked, and the smallest set counts it.
    expect(renderFirstPayment(withoutLater).join("\n")).toContain(
      "after them `apify-actors` can take a payment, once its read above passes. Identity checks among them: step 2 (yes), step 6 (in one part).\n",
    );
  });

  it("orders candidates by the fewest minutes at the low end, then at the high end, and lists ties", () => {
    const lines = [{ id: "il-biz-tools", waitsOnOwner: true }, { id: "oss-bounties", waitsOnOwner: true }];
    const none = { "il-biz-tools": [], "oss-bounties": [] };
    // 108-143 against 108-148: the high end decides, and the line it beat is named close behind.
    const close = buildFirstPaymentPath(lines, ownerStepsInOrder(), none);
    expect(close.smallest.map((c) => c.line)).toEqual(["il-biz-tools"]);
    expect(close.closeBehind).toEqual([{ line: "oss-bounties", steps: [2, 7, 4, 6], minutes: { min: 108, max: 148 } }]);
    // Step 4 at 15-20 makes oss-bounties 108-143 too: a tie, both listed in the database's order.
    const steps = ownerStepsInOrder().map((s) => (s.id === "algora-stripe" ? { ...s, minutes: [15, 10] as [number, number] } : s));
    const tied = buildFirstPaymentPath(lines, steps, none);
    expect(tied.smallest.map((c) => [c.line, c.minutes])).toEqual([
      ["il-biz-tools", { min: 108, max: 143 }],
      ["oss-bounties", { min: 108, max: 143 }],
    ]);
    // A tie is in the smallest set, not close behind it.
    expect(tied.closeBehind).toEqual([]);
    const tiedText = renderFirstPayment(tied).join("\n");
    expect(tiedText).toContain("\nOr, at the same minutes: steps 2, 7, 4, 6 (in the code's order), 108-143 minutes in all: after them `oss-bounties` can take a payment");
    // The low end decides before the high end: a line at 100-200 beats one at 108-143.
    const cheap = ownerStepsInOrder().map((s) => (s.id === "github-org" ? { ...s, minutes: [7, 77] as [number, number] } : s));
    expect(buildFirstPaymentPath(lines, cheap, none).smallest.map((c) => [c.line, c.minutes])).toEqual([["oss-bounties", { min: 100, max: 205 }]]);
    // A higher lower bound is not close behind, whatever its upper bound.
    expect(buildFirstPaymentPath(lines, cheap, none).closeBehind).toEqual([]);
  });

  it("names every other candidate at the smallest set's lower bound close behind it, fewest minutes first", () => {
    // Steps 7 and 4 moved so that all three paid-by-steps lines start at 108: il-biz-tools 108-143, pcn874 108-153,
    // oss-bounties 108-158. Listed in the database's order (oss-bounties before pcn874), printed by minutes.
    const steps = ownerStepsInOrder().map((s) =>
      s.id === "github-org" ? { ...s, minutes: [10, 20] as [number, number] } : s.id === "algora-stripe" ? { ...s, minutes: [20, 25] as [number, number] } : s,
    );
    const lines = ["il-biz-tools", "oss-bounties", "pcn874"].map((id) => ({ id, waitsOnOwner: true }));
    const p = buildFirstPaymentPath(lines, steps, { "il-biz-tools": [], "oss-bounties": [], pcn874: [] });
    expect(p.smallest).toEqual([{ line: "il-biz-tools", steps: [8, 2, 3, 6], minutes: { min: 108, max: 143 } }]);
    expect(p.closeBehind).toEqual([
      { line: "pcn874", steps: [2, 3, 7, 6], minutes: { min: 108, max: 153 } },
      { line: "oss-bounties", steps: [2, 7, 4, 6], minutes: { min: 108, max: 158 } },
    ]);
    const t = renderFirstPayment(p).join("\n");
    expect(t).toContain(
      "\nClose behind, at the same lower bound: `pcn874`, steps 2, 3, 7, 6, 108-153 min; the upper bound alone decides between them.\n" +
        "Close behind, at the same lower bound: `oss-bounties`, steps 2, 7, 4, 6, 108-158 min; the upper bound alone decides between them.\n",
    );
  });

  it("says so when the smallest set's line no longer waits on the owner in the database (review NOTE 7)", () => {
    const p = buildFirstPaymentPath([{ id: "il-biz-tools", waitsOnOwner: false }], ownerStepsInOrder(), { "il-biz-tools": [] });
    expect(p.smallest.map((c) => c.line)).toEqual(["il-biz-tools"]);
    expect(renderFirstPayment(p).join("\n")).toContain(
      "after them `il-biz-tools` can take a payment. Identity checks among them: step 2 (yes), step 3 (yes). The database no longer has `il-biz-tools` waiting on the owner, so the owner-steps section above asks none of these for it.\n",
    );
    const waiting = buildFirstPaymentPath([{ id: "il-biz-tools", waitsOnOwner: true }], ownerStepsInOrder(), { "il-biz-tools": [] });
    expect(renderFirstPayment(waiting).join("\n")).not.toContain("The database no longer has");
  });

  it("takes a step done since out of a line's set, and a line with no step left needs none", () => {
    const done = ownerStepsInOrder().map((s) => (s.id === "tax-file" ? { ...s, doneOn: { date: "2026-10-20", evidence: "test" } } : s));
    const p = buildFirstPaymentPath([{ id: "il-biz-tools", waitsOnOwner: true }], done);
    expect(p.lines[0].toPay).toEqual({ steps: [8, 3, 6], minutes: { min: 48, max: 53 } });
    expect(p.lines[0].steps.find((s) => s.id === "tax-file")).toMatchObject({ state: "done", gate: "done on 2026-10-20" });
    const allDone = ownerStepsInOrder().map((s) => ({ ...s, doneOn: { date: "2026-10-20", evidence: "test" } }));
    const q = buildFirstPaymentPath([{ id: "il-biz-tools", waitsOnOwner: true }], allDone, { "il-biz-tools": [] });
    expect(q.smallest).toEqual([{ line: "il-biz-tools", steps: [], minutes: { min: 0, max: 0 } }]);
    expect(renderFirstPayment(q).join("\n")).toContain("\nNo owner step is left: `il-biz-tools` can take a payment.\n");
  });

  it("counts no line owner-steps.ts does not know, and says so when no line can be paid by the steps alone", () => {
    const p = buildFirstPaymentPath([{ id: "no-such-line", waitsOnOwner: true }]);
    expect(p.lines[0].steps).toEqual([]);
    expect(p.lines[0].notByStepsAlone).toEqual(["owner-steps.ts names no step for this line, so nothing here says what it needs"]);
    expect(p.smallest).toEqual([]);
    const t = renderFirstPayment(p).join("\n");
    expect(t).toContain("No owner step in owner-steps.ts names this line.");
    expect(t).toContain("No line can take a payment by the eight owner steps alone: each needs something outside them (above).");
  });

  it("follows the database: a killed line is left out, a set-up line is marked, and the smallest set moves", () => {
    const r = report(STEPS_DB);
    expect(r.firstPayment.lines.map((l) => l.id)).not.toContain("il-biz-tools");
    expect(line(r.firstPayment, "pcn874").waitsOnOwner).toBe(false);
    expect(line(r.firstPayment, "oss-bounties").waitsOnOwner).toBe(true);
    expect(r.firstPayment.smallest).toEqual([{ line: "oss-bounties", steps: [2, 7, 4, 6], minutes: { min: 108, max: 148 } }]);
    const t = renderOwnerReport(r);
    expect(t).toContain("### `pcn874` (the database no longer has it waiting on the owner)\n");
    expect(t).toContain("### `oss-bounties`\n");
  });

  it("renders each line's steps by state, its waits, and its remaining steps, and the smallest set with its identity checks", () => {
    // One identity line per step, in the code's order, each said once.
    const ids = section.slice(section.indexOf("Identity checks, step by step:"), section.indexOf("### `"));
    const order = [...ids.matchAll(/^- Step (\d) \(/gm)].map((m) => Number(m[1]));
    expect(order).toEqual([1, 8, 2, 3, 5, 7, 4, 6]);
    expect(ids).toContain(`- Step 6 (\`ci-tokens\`): in one part — ${ownerStepById("ci-tokens")!.identity.what}\n`);
    expect(ids).toContain(`- Step 3 (\`gumroad\`): yes — ${ownerStepById("gumroad")!.identity.what}\n`);
    expect(ids).toContain(`- Step 7 (\`github-org\`): no — ${ownerStepById("github-org")!.identity.what}\n`);
    const ilb = section.slice(section.indexOf("### `il-biz-tools`"), section.indexOf("### `oss-bounties`"));
    expect(ilb).toContain("Asked now, in the code's order:\n- step 8 (`brand-mailbox`), 10 min, identity check: no. Unlocks: A Google account under the brand");
    // Step 6's identity part is Apify's Publish sitting: on il-biz-tools' path it asks no identity (review NOTE 5).
    expect(ilb).toContain(
      "- step 6 (`ci-tokens`), 18-23 min, identity check: no on this line (its identity part is for `apify-actors` only). Unlocks: Converts every 'the owner must push' recurring operation into a one-time step.\n",
    );
    expect(ilb).toContain("Held or frozen, with the gate:\n- held: step 2 (`tax-file`), 60-90 min, identity check: yes — only when a paid product is ready, after the official cost check. Unlocks: The legal right to receive any shekel at all.\n");
    // Ruling 12.10: step 3 is asked now no more; it is held, with its gate, between steps 2 and 5, and the asked list is 8, 6.
    expect(ilb).toContain(
      "- held: step 3 (`gumroad`), 20 min, identity check: yes — only when a paid product is ready — after the day-56 page-view PASS of il-biz-tools or pcn874, together with step 2. " +
        `Unlocks: ${firstSentence(ownerStepById("gumroad")!.unlocks)}\n- frozen: step 5 (\`domain\`)`,
    );
    const askedBlock = ilb.slice(ilb.indexOf("Asked now, in the code's order:"), ilb.indexOf("Held or frozen, with the gate:"));
    expect([...askedBlock.matchAll(/^- step (\d) /gm)].map((m) => Number(m[1]))).toEqual([8, 6]);
    expect(ilb).toContain("- frozen: step 5 (`domain`), 10 min, identity check: no — frozen by the owner's ₪0 rule of 27.9.2026; instead: Sites deploy on *.netlify.app (Netlify's free subdomain). Unlocks: Anonymity and search, both.\n");
    expect(ilb).toContain("Done:\n- done: step 1 (`merge-pr`), 2 min, identity check: no — done on 2026-09-22. Unlocks:");
    expect(ilb).toContain(`Also waits on:\n- a read the colony takes, not an owner step: ${LINE_PAYMENT_WAITS["il-biz-tools"]![0].what} (${LINE_PAYMENT_WAITS["il-biz-tools"]![0].rule})\n`);
    expect(ilb).toContain("Owner steps still between it and a payment: steps 8, 2, 3, 6, 108-143 min (a frozen step left out: the line goes without it at ₪0).\n");
    const oss = section.slice(section.indexOf("### `oss-bounties`"), section.indexOf("### `pcn874`"));
    expect(oss).toContain("Owner steps still between it and a payment: steps 2, 7, 4, 6, 108-148 min.\n");
    const apify = section.slice(section.indexOf("### `apify-actors`"), section.indexOf("### `il-biz-tools`"));
    expect(apify).toContain(`- an owner action outside the eight steps: ${LINE_PAYMENT_WAITS["apify-actors"]![1].what}`);
    expect(apify).toContain("Owner steps still between it and a payment: steps 8, 2, 6, 88-123 min; the eight steps alone do not make it payable.\n");
    expect(apify).toContain("- step 6 (`ci-tokens`), 18-23 min, identity check: in one part. Unlocks:");
    const smallest = section.slice(section.indexOf("### The smallest set"));
    expect(smallest).toContain(
      "Steps 8, 2, 3, 6 (in the code's order), 108-143 minutes in all: after them `il-biz-tools` can take a payment, once its read above passes. Identity checks among them: step 2 (yes), step 3 (yes).\n",
    );
    // The pick is close: oss-bounties shares the lower bound, and the section says so (review NOTE 6).
    expect(smallest).toContain(
      "\nClose behind, at the same lower bound: `oss-bounties`, steps 2, 7, 4, 6, 108-148 min; the upper bound alone decides between them.\n",
    );
    expect(smallest).not.toContain("The database no longer has");
    expect(smallest).toContain(`Not counted: \`apify-actors\` — its payment also needs ${LINE_PAYMENT_WAITS["apify-actors"]![1].what}.\n`);
    expect(smallest).not.toContain("Or, at the same minutes");
  });

  it("takes a text's first sentence: up to the first full stop a space or the end follows", () => {
    expect(firstSentence("Anonymity and search, both. A gTLD (.com or similar) at a registrar.")).toBe("Anonymity and search, both.");
    expect(firstSentence("It puts colony.yml on `main`. Then more.")).toBe("It puts colony.yml on `main`.");
    expect(firstSentence("  No full stop at all  ")).toBe("No full stop at all");
    expect(firstSentence("Ends here.")).toBe("Ends here.");
    expect(firstSentence("One line.\nAnother.")).toBe("One line.");
  });

  it("--json carries the same path the module builds", () => {
    const out = run(["--db", EMPTY_DB, "--now", NOW, "--json"]);
    expect(out.status, out.stderr).toBe(0);
    expect((JSON.parse(out.stdout) as OwnerReport).firstPayment).toEqual(report(EMPTY_DB).firstPayment);
  }, 60_000);
});
