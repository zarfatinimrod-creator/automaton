import { describe, it, expect, beforeEach, afterEach } from "vitest";
import type BetterSqlite3 from "better-sqlite3";
import { createInMemoryDb } from "../orchestration/test-db.js";
import { renderDashboard } from "../../revenue/dashboard.js";
import { recordLedgerEntry, setHumanSetupDone, updateLineStatus } from "../../revenue/ledger.js";
import { seedDefaultPortfolio, summarizeTargetBasis } from "../../revenue/portfolio.js";

const NOW = "2026-09-03T12:00:00.000Z";

describe("the manager's screen", () => {
  let db: BetterSqlite3.Database;
  beforeEach(() => { db = createInMemoryDb(); seedDefaultPortfolio(db); });
  afterEach(() => { db.close(); });

  const html = () => renderDashboard(db, { nowIso: NOW });

  it("says plainly that nothing has been earned, rather than decorating a zero", () => {
    const h = html();
    expect(h).toContain("החברה עדיין לא הרוויחה שקל");
    expect(h).toContain("מחכים להרשמות חד-פעמיות שלך");
  });

  it("reports revenue only once it is in the ledger, and the exact amount", () => {
    expect(html()).not.toContain("₪450.00");
    recordLedgerEntry(db, {
      lineId: "oss-bounties", kind: "sale", amountMinor: 45000, currency: "ILS",
      source: "stripe", externalId: "0xabc", occurredAt: NOW,
    });
    const h = html();
    expect(h).toContain("₪450.00");
    expect(h).toContain("החברה הרוויחה");
    expect(h).not.toContain("עדיין לא הרוויחה");
  });

  it("shows every target next to its evidence grade, never the total alone", () => {
    const h = html();
    expect(h).toContain("נמדד");
    expect(h).toContain("ללא ראיה");
    // The measured figure must appear wherever the total does.
    expect(h).toContain("הסכום הכן כרגע");
    // The fourth band: a target its own cited evidence argues against. The
    // screen must not let it read as merely unproven.
    expect(h).toContain("מוכחש");
  });

  it("can never print a measured figure larger than the basis it is derived from", () => {
    // The regression this exists to make impossible: state/colony/REPORT.md sat
    // for four days telling the owner "the honest reachable figure is the
    // measured ₪6,500" while TARGET_BASIS graded not one shekel measured. The
    // number came from an older render and nothing recomputed it. MISSION: a
    // dashboard that can show a number nobody earned is worse than no dashboard.
    const basis = summarizeTargetBasis();
    expect(basis.measuredIls).toBeLessThanOrEqual(basis.totalIls);
    expect(basis.measuredIls).toBe(0);

    const h = html();
    // Every ₪ figure the basis card prints must come from summarizeTargetBasis,
    // and the measured one must be exactly its measuredIls.
    const card = h.slice(h.indexOf('<div class="basis">'), h.indexOf("</div>", h.indexOf("הסכום הכן כרגע")));
    const measured = card.match(/נמדד<\/span>[^]*?<div>₪([\d,]+)<\/div>/);
    expect(measured, "the manager's screen no longer prints a measured figure").toBeTruthy();
    const printed = Number(measured![1].replace(/,/g, ""));
    expect(printed).toBe(basis.measuredIls);
    expect(printed).toBeLessThanOrEqual(basis.totalIls);
    // And the specific stale sentence must be gone for good.
    expect(h).not.toContain("₪6,500");
  });

  it("lists the owner's steps, and stops listing a line once its setup is done", () => {
    expect(html()).toContain("apify-actors".length ? "Apify" : "");
    const before = (html().match(/<details>/g) ?? []).length;
    setHumanSetupDone(db, "apify-actors", true);
    const after = (html().match(/<details>/g) ?? []).length;
    expect(after).toBe(before - 1);
  });

  it("escapes text that comes from the database", () => {
    db.prepare("UPDATE revenue_lines SET name = ? WHERE id = ?")
      .run('<script>alert("x")</script>', "oss-bounties");
    const h = html();
    expect(h).not.toContain('<script>alert("x")</script>');
    expect(h).toContain("&lt;script&gt;");
  });

  it("is a standalone page with no external requests", () => {
    const h = html();
    expect(h).toMatch(/^<!doctype html>/);
    expect(h).toContain('lang="he" dir="rtl"');
    // No CDN, no font host, no tracker: it must render from a git checkout.
    expect(h).not.toMatch(/<script src=|<link[^>]+href="http|fonts\.googleapis/);
  });

  it("keeps itself out of search engines", () => {
    expect(html()).toContain('name="robots" content="noindex"');
  });

  it("names a stalled line rather than showing a healthy portfolio doing nothing", () => {
    updateLineStatus(db, "pcn874", "building", { force: true });
    db.prepare("UPDATE revenue_lines SET created_at = ? WHERE id = ?")
      .run("2026-01-01T00:00:00.000Z", "pcn874");
    expect(html()).toContain("pcn874");
    expect(html()).toContain("ללא שום תוצר מאז שנפתח");
  });
});

describe("the dashboard shows what the money travels on", () => {
  it("names both rail sides and says which failure is worse", () => {
    const db = createInMemoryDb();
    seedDefaultPortfolio(db);
    const html = renderDashboard(db, { nowIso: "2026-09-03T12:00:00.000Z" });

    expect(html).toContain("על מה הכסף עובר");
    expect(html).toContain("gumroad");
    expect(html).toContain("bank-transfer");
    // The asymmetry is the point: a dead payin rail stops sales, a dead payout
    // rail strands money the ledger says we already have.
    expect(html).toMatch(/הלדג'ר אומר שיש לנו אותו/);
  });

  it("flags the line whose payout route is unknown rather than hiding it", () => {
    const db = createInMemoryDb();
    seedDefaultPortfolio(db);
    const html = renderDashboard(db, { nowIso: "2026-09-03T12:00:00.000Z" });
    expect(html).toContain("oss-bounties");
    expect(html).toContain("לא ניתן למשיכה");
  });
});

describe("the screen shows what one platform can take away", () => {
  it("names the platform the colony cannot observe, rather than leaving it to a table", () => {
    const db = createInMemoryDb();
    seedDefaultPortfolio(db);
    const html = renderDashboard(db, { nowIso: "2026-09-03T12:00:00.000Z" });

    expect(html).toContain("מה מייל אחד מפלטפורמה יכול לקחת");
    expect(html).toContain("apify:one-creator-account");
    // Every kill criterion on the largest line in the code sits behind an
    // egress-blocked domain. The owner should not have to infer that.
    expect(html).toMatch(/cannot observe|לא יכול|<strong>לא<\/strong>/);
  });

  it("distinguishes the platform question from the rail question in words", () => {
    const db = createInMemoryDb();
    seedDefaultPortfolio(db);
    const html = renderDashboard(db, { nowIso: "2026-09-03T12:00:00.000Z" });
    expect(html).toMatch(/מה חסימה אחת מוחקת/);
  });
});
