import { describe, it, expect, beforeEach, afterEach } from "vitest";
import type BetterSqlite3 from "better-sqlite3";
import { createInMemoryDb } from "../orchestration/test-db.js";
import { renderDashboard } from "../../revenue/dashboard.js";
import { recordLedgerEntry, setHumanSetupDone, updateLineStatus } from "../../revenue/ledger.js";
import { seedDefaultPortfolio } from "../../revenue/portfolio.js";

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
      lineId: "agent-services", kind: "sale", amountMinor: 45000, currency: "ILS",
      source: "x402", externalId: "0xabc", occurredAt: NOW,
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
    expect(h).toContain("הסכום הכנה כרגע");
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
      .run('<script>alert("x")</script>', "agent-services");
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
    updateLineStatus(db, "agent-services", "building", { force: true });
    db.prepare("UPDATE revenue_lines SET created_at = ? WHERE id = ?")
      .run("2026-01-01T00:00:00.000Z", "agent-services");
    expect(html()).toContain("agent-services");
    expect(html()).toContain("ללא שום תוצר מאז שנפתח");
  });
});
