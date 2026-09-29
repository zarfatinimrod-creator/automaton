/**
 * Two readers of one file must agree. The colony reads state/colony/brand-mail.json with readBrandMailProbe
 * (src/revenue/brand-mail.ts); il-biz-tools, a standalone product, restates the same rules in JS as
 * brandMailboxGreen (products/il-biz-tools/scripts/gumroad-pro-product.js) to decide whether the Pro product may be
 * enabled (TikTok note N6). "Green" there must mean exactly "read, and no blocker" here: the same fixtures go through
 * both, so a rule changed on one side and not the other fails this file.
 */
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { A11Y_ANSWER_DAYS, PROBE_STALE_DAYS, readBrandMailProbe } from "../../revenue/brand-mail.js";
// @ts-expect-error - a standalone product's plain-JS script, no type declarations
import * as product from "../../../products/il-biz-tools/scripts/gumroad-pro-product.js";

const brandMailboxGreen = product.brandMailboxGreen as (reading: unknown, nowMs: number) => { green: boolean; reason: string };

const HOUR = 3_600_000;
const NOW = Date.UTC(2026, 9, 20, 12, 0, 0);
const iso = (ms: number) => new Date(ms).toISOString();

const good = (over: Record<string, unknown> = {}, a11y: Record<string, unknown> = {}) => ({
  configured: true,
  measuredAt: iso(NOW - 3 * HOUR),
  inbox: 5,
  unread: 2,
  repliesByVenue: { crazygames: 1, "nevo-il": 0 },
  accessibility: { received: 3, unanswered: 2, unansweredOver7Days: 0, oldestUnansweredAgeDays: 2.0, ...a11y },
  sentFolderFound: true,
  allMailFound: true,
  ...over,
});

/** name -> file content (a string is written as is; undefined means no file at all). */
const FIXTURES: Record<string, unknown> = {
  "green": good(),
  "green, nothing received": good({}, { received: 0, unanswered: 0, oldestUnansweredAgeDays: null }),
  "green, no venue asked yet": good({ repliesByVenue: {} }),
  "green, measured in the future (clock skew)": good({ measuredAt: iso(NOW + HOUR) }),
  "green, just inside the stale line": good({ measuredAt: iso(NOW - PROBE_STALE_DAYS * 24 * HOUR + HOUR) }),
  "no file": undefined,
  "not JSON": "{not json",
  "a JSON array": "[1,2]",
  "no measuredAt": good({ measuredAt: undefined }),
  "measuredAt not a date": good({ measuredAt: "yesterday" }),
  "unconfigured": { configured: false, measuredAt: iso(NOW - HOUR) },
  "configured is text": good({ configured: "yes" }),
  "stale": good({ measuredAt: iso(NOW - (PROBE_STALE_DAYS * 24 + 1) * HOUR) }),
  "inbox not a count": good({ inbox: -1 }),
  "unread fractional": good({ unread: 1.5 }),
  "repliesByVenue an array": good({ repliesByVenue: [1] }),
  "repliesByVenue null": good({ repliesByVenue: null }),
  "repliesByVenue value text": good({ repliesByVenue: { crazygames: "1" } }),
  "repliesByVenue key not a venue id": good({ repliesByVenue: { "Someone <a@b.c>": 1 } }),
  "repliesByVenue key upper case": good({ repliesByVenue: { CrazyGames: 1 } }),
  "no accessibility block": good({ accessibility: undefined }),
  "accessibility.received missing": good({}, { received: undefined }),
  "accessibility.unanswered negative": good({}, { unanswered: -1 }),
  "age negative": good({}, { oldestUnansweredAgeDays: -1 }),
  "age text": good({}, { oldestUnansweredAgeDays: "2" }),
  "sentFolderFound text": good({ sentFolderFound: "true" }),
  "allMailFound missing": good({ allMailFound: undefined }),
  "overdue by the probe's count": good({}, { unansweredOver7Days: 1, oldestUnansweredAgeDays: 9 }),
  "overdue by count, no age": good({}, { unansweredOver7Days: 1, oldestUnansweredAgeDays: null }),
  "overdue since the probe": good({ measuredAt: iso(NOW - 30 * HOUR) }, { oldestUnansweredAgeDays: A11Y_ANSWER_DAYS - 0.5 }),
  "not yet overdue since the probe": good({ measuredAt: iso(NOW - 3 * HOUR) }, { oldestUnansweredAgeDays: A11Y_ANSWER_DAYS - 0.5 }),
};

describe("brandMailboxGreen (il-biz-tools) agrees with readBrandMailProbe (the colony) on every fixture", () => {
  let dir: string;
  beforeAll(() => {
    dir = mkdtempSync(join(tmpdir(), "brand-mail-parity-"));
  });
  afterAll(() => rmSync(dir, { recursive: true, force: true }));

  for (const [name, content] of Object.entries(FIXTURES)) {
    it(name, () => {
      const file = join(dir, `${name.replace(/[^a-z0-9]+/gi, "-")}.json`);
      let parsed: unknown;
      if (content !== undefined) {
        const text = typeof content === "string" ? content : JSON.stringify(content);
        writeFileSync(file, text);
        try {
          parsed = JSON.parse(text);
        } catch {
          parsed = text; // the product's reader hands the raw text on, as readProbe does
        }
      }
      const colony = readBrandMailProbe(file, NOW);
      const colonyGreen = colony.status === "read" && colony.blockers.length === 0;
      expect(brandMailboxGreen(parsed, NOW).green, `${colony.status} ${colony.blockers.join(" | ")}`).toBe(colonyGreen);
    });
  }

  it("the fixtures reach both verdicts", () => {
    const verdicts = Object.values(FIXTURES).map((c) => brandMailboxGreen(typeof c === "string" ? c : c, NOW).green);
    expect(verdicts).toContain(true);
    expect(verdicts).toContain(false);
  });

  it("the two sides use the same two thresholds", () => {
    expect(product.PROBE_STALE_DAYS).toBe(PROBE_STALE_DAYS);
    expect(product.A11Y_ANSWER_DAYS).toBe(A11Y_ANSWER_DAYS);
  });
});
