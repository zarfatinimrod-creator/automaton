/**
 * Revenue Colony — payment rails, and how concentrated the portfolio is on them.
 *
 * MISSION.md is explicit that every line carries "its own buyer, its own payment
 * rail and its own kill criteria", and that "one rail failing, one platform
 * banning us or one market drying up must not" take the company down. That was
 * stated and never checked. The store-promotion auditor caught the gap from the
 * other side: it noticed the group presented five storefronts and delivered two
 * rails, and no code anywhere would have noticed.
 *
 * The rail is a property of our plan rather than of a ledger row, so it lives
 * here as a map rather than as a column on `revenue_lines`. No migration, and
 * nothing pretends a rail is an observed fact when it is a decision.
 *
 * Two rails matter and they fail independently:
 *  - `payin`  — how the buyer's money is collected. Losing it stops sales.
 *  - `payout` — how the money reaches the owner. Losing it strands money that
 *               was genuinely earned, which is the worse of the two failures
 *               because the ledger says we have it.
 */

import { DEFAULT_PORTFOLIO } from "./portfolio.js";
import type { RevenueLineSeed } from "./types.js";

export type PayinRail =
  | "paddle"
  | "etsy"
  | "apify"
  | "x402"
  | "telegram-stars"
  | "affiliate-networks"
  | "bounty-platform";

export type PayoutRail = "paypal" | "payoneer" | "bank-transfer" | "crypto-wallet" | "ton-wallet" | "unknown";

export interface LineRails {
  payin: PayinRail;
  payout: PayoutRail;
  /** Why this rail and not another — the sentence a supervisor would have to argue with. */
  note: string;
}

/**
 * The rail each line in DEFAULT_PORTFOLIO actually depends on.
 *
 * `unknown` is used where the repo genuinely does not know yet, and it is not a
 * placeholder to be filled in with a guess: `oss-bounties` is unknown because the
 * Stripe-Israel question is reopened (docs/REJECTED.md), and writing "stripe"
 * here would launder that open question into a fact.
 */
export const LINE_RAILS: Record<string, LineRails> = {
  "apify-actors": {
    payin: "apify",
    payout: "paypal",
    note: "Apify bills the user and pays the developer; PayPal at a $20 minimum, or SWIFT wire at $100.",
  },
  "il-biz-tools": {
    payin: "paddle",
    payout: "bank-transfer",
    note: "Paddle is merchant of record, so it collects and remits; payout lands in an Israeli bank account.",
  },
  templates: {
    payin: "etsy",
    payout: "payoneer",
    note: "Etsy Payments reaches Israel through Payoneer, which is the only documented route.",
  },
  "paid-apis": {
    payin: "x402",
    payout: "crypto-wallet",
    note: "USDC settles straight to a wallet the automaton controls. No platform can freeze it, and no KYC gates it.",
  },
  "agent-services": {
    payin: "x402",
    payout: "crypto-wallet",
    note: "Same rail as paid-apis by design — this line exists to sell work, not to diversify the rail.",
  },
  "telegram-bots": {
    payin: "telegram-stars",
    payout: "ton-wallet",
    note: "Stars convert through Fragment to TON. Whether Fragment withdrawal is open to an Israeli resident is unverified.",
  },
  "dev-extensions": {
    payin: "paddle",
    payout: "bank-transfer",
    note: "Deliberately reuses the il-biz-tools merchant account: licence keys, not a second merchant onboarding.",
  },
  "hebrew-content": {
    payin: "affiliate-networks",
    payout: "payoneer",
    note: "Impact, PartnerStack and Amazon Associates pay Israel through PayPal or Payoneer against a tax form.",
  },
  "oss-bounties": {
    payin: "bounty-platform",
    payout: "unknown",
    note: "Algora's own source lists Israel for Stripe Connect Express, but the Stripe-Israel question is reopened in docs/REJECTED.md. Unknown until a human opens stripe.com/global.",
  },
};

export interface RailShare<R extends string> {
  rail: R;
  lineIds: string[];
  targetAgorot: number;
  /** Share of the portfolio's total target, 0..1. */
  share: number;
}

export interface RailConcentration {
  payin: RailShare<PayinRail>[];
  payout: RailShare<PayoutRail>[];
  /** Rails carrying more than `threshold` of the portfolio target. */
  overexposed: { side: "payin" | "payout"; rail: string; share: number; lineIds: string[] }[];
  threshold: number;
  verdict: "ok" | "concentrated";
  reason: string;
}

/**
 * Half the portfolio target on one rail is the line I am drawing, and it is a
 * judgement rather than a measurement: at that point the rail failing costs more
 * than the target's whole first tier, which is what MISSION.md means by "must not
 * take the company down". Lower it and every early portfolio looks broken;
 * higher and the check never fires before it matters.
 */
export const RAIL_CONCENTRATION_THRESHOLD = 0.5;

export function railConcentration(
  seeds: RevenueLineSeed[] = DEFAULT_PORTFOLIO,
  rails: Record<string, LineRails> = LINE_RAILS,
  threshold: number = RAIL_CONCENTRATION_THRESHOLD,
): RailConcentration {
  const total = seeds.reduce((n, s) => n + s.targetMonthlyAgorot, 0);
  const tally = <R extends string>(pick: (r: LineRails) => R): RailShare<R>[] => {
    const by = new Map<R, { lineIds: string[]; targetAgorot: number }>();
    for (const seed of seeds) {
      const rail = rails[seed.id];
      if (!rail) continue;
      const key = pick(rail);
      const row = by.get(key) ?? { lineIds: [], targetAgorot: 0 };
      row.lineIds.push(seed.id);
      row.targetAgorot += seed.targetMonthlyAgorot;
      by.set(key, row);
    }
    return [...by.entries()]
      .map(([rail, row]) => ({ rail, ...row, share: total > 0 ? row.targetAgorot / total : 0 }))
      .sort((a, b) => b.share - a.share);
  };

  const payin = tally((r) => r.payin);
  const payout = tally((r) => r.payout);
  const overexposed = [
    ...payin.filter((r) => r.share > threshold).map((r) => ({ side: "payin" as const, rail: r.rail as string, share: r.share, lineIds: r.lineIds })),
    ...payout.filter((r) => r.share > threshold).map((r) => ({ side: "payout" as const, rail: r.rail as string, share: r.share, lineIds: r.lineIds })),
  ];

  const pct = (n: number) => `${Math.round(n * 100)}%`;
  return {
    payin,
    payout,
    overexposed,
    threshold,
    verdict: overexposed.length > 0 ? "concentrated" : "ok",
    reason:
      overexposed.length > 0
        ? `${overexposed
            .map((o) => `${o.rail} carries ${pct(o.share)} of the portfolio target on the ${o.side} side (${o.lineIds.join(", ")})`)
            .join("; ")}. MISSION.md requires that one rail failing does not take the company down.`
        : `No rail carries more than ${pct(threshold)} of the portfolio target on either side.`,
  };
}

/** Lines whose payout route is not known to reach Israel. Money earned here may not be collectable. */
export function linesWithUnknownPayout(rails: Record<string, LineRails> = LINE_RAILS): string[] {
  return Object.entries(rails)
    .filter(([, r]) => r.payout === "unknown")
    .map(([id]) => id);
}
