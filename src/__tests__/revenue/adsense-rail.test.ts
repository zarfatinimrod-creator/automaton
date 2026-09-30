import { describe, it, expect } from "vitest";
import {
  ADSENSE_PAYEE_ACCOUNT,
  LINE_RAILS,
  linesMissingAdsenseRail,
  platformConcentration,
  railConcentration,
} from "../../revenue/rails.js";
import { DEFAULT_PORTFOLIO, TARGET_BASIS, type TargetBasis } from "../../revenue/portfolio.js";
import { agorotFromIls } from "../../revenue/money.js";
import type { RevenueLineSeed } from "../../revenue/types.js";

/**
 * P-3 (research/channel-loop/RULING-2026-09-30-video.md 16(c) items 5 and 7, fold step 10): AdSense is one shared rail
 * in portfolio accounting. One AdSense account per payee name serves every channel of that payee
 * (research/rendered/yk2-yt-9914702.txt:63, :67), so a ban there takes every AdSense-paid line at once — a dedicated
 * Google account per channel isolates the login, not the payee.
 */

const seed = (id: string, ils: number): RevenueLineSeed => ({ ...DEFAULT_PORTFOLIO[0]!, id, targetMonthlyAgorot: agorotFromIls(ils) });
const note = "x".repeat(40);

// Two AdSense-paid lines behind different logins (T1's dedicated brand Google account; a games site), and one Gumroad
// line. Counted per login, the largest account holds 40% and nothing fires; counted as the one payee, AdSense holds 60%.
const SEEDS = [seed("yt", 300), seed("games", 300), seed("tools", 400)];
const RAILS = {
  yt: { payin: "adsense", payout: "bank-transfer", payoutEvidence: "none", note, platformAccount: "youtube:t1-brand-account", observable: true },
  games: { payin: "adsense", payout: "bank-transfer", payoutEvidence: "none", note, platformAccount: "games:developer-site", observable: true },
  tools: { payin: "gumroad", payout: "bank-transfer", payoutEvidence: "rendered", note, platformAccount: "gumroad:one-seller-account", observable: true },
} as typeof LINE_RAILS;

describe("P-3: one AdSense rail, counted once", () => {
  it("counts every AdSense-paid line under the one payee account, whatever login the line has", () => {
    const c = platformConcentration(SEEDS, RAILS);
    expect(c.platforms.map((p) => p.platformAccount).sort()).toEqual([ADSENSE_PAYEE_ACCOUNT, "gumroad:one-seller-account"].sort());
    const adsense = c.platforms.find((p) => p.platformAccount === ADSENSE_PAYEE_ACCOUNT)!;
    expect(adsense.lineIds.sort()).toEqual(["games", "yt"]);
    expect(adsense.share).toBeCloseTo(0.6, 6);
    expect(c.verdict).toBe("concentrated");
    expect(c.overexposed.map((p) => p.platformAccount)).toEqual([ADSENSE_PAYEE_ACCOUNT]);
    expect(c.platforms.reduce((n, p) => n + p.share, 0)).toBeCloseTo(1, 6);
  });

  it("the rail view carries AdSense as one payin rail with both lines", () => {
    const c = railConcentration(SEEDS, RAILS);
    const adsense = c.payin.find((r) => r.rail === "adsense")!;
    expect(adsense.lineIds.sort()).toEqual(["games", "yt"]);
    expect(c.overexposed.some((o) => o.side === "payin" && o.rail === "adsense")).toBe(true);
  });

  it("leaves a line that is not AdSense-paid under its own account", () => {
    const c = platformConcentration(SEEDS, RAILS);
    expect(c.platforms.find((p) => p.platformAccount === "gumroad:one-seller-account")!.lineIds).toEqual(["tools"]);
  });
});

describe("P-3: every AdSense-paid line carries the rail", () => {
  const basis = (rail: string): TargetBasis => ({ ils: 0, grade: "inferred", basis: "b", rail, acquisitionChannel: "c", killFloorFraction: 0.25 });

  it("names a line whose target basis is paid by AdSense but whose rail is not adsense", () => {
    const b = { yt: basis("AdSense for YouTube, one payee account"), tools: basis("Gumroad") };
    const r = { yt: { ...RAILS.yt!, payin: "affiliate-networks" }, tools: RAILS.tools! } as typeof LINE_RAILS;
    expect(linesMissingAdsenseRail(b, r)).toEqual(["yt"]);
  });

  it("names a line on the adsense rail whose basis does not say AdSense pays it", () => {
    const b = { yt: basis("YouTube Partner Program"), tools: basis("Gumroad") };
    expect(linesMissingAdsenseRail(b, { yt: RAILS.yt!, tools: RAILS.tools! } as typeof LINE_RAILS)).toEqual(["yt"]);
  });

  it("accepts lines whose basis and rail agree", () => {
    const b = { yt: basis("adsense (the one payee account)"), tools: basis("Gumroad") };
    expect(linesMissingAdsenseRail(b, { yt: RAILS.yt!, tools: RAILS.tools! } as typeof LINE_RAILS)).toEqual([]);
  });

  it("holds for the shipped portfolio", () => {
    expect(linesMissingAdsenseRail(TARGET_BASIS, LINE_RAILS)).toEqual([]);
  });
});
