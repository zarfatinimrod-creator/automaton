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
  /**
   * The single account or identity a ban, a KYC failure or a terms change would
   * land on. Added 2026-09-04 because the synthesis critic showed this file could
   * not see the risk it was built for: Apify carries the top-or-only survivor of
   * FOUR of the seven audited groups, and `railConcentration` reported one line,
   * because it keys by line id and all four collapse into `apify-actors`. Rails
   * measure how the money moves; this measures what a single email from a
   * platform takes away.
   */
  platformAccount: string;
  /**
   * Whether this colony can actually observe the platform — its dashboard, its
   * API, its KPIs. `apify.com` and `api.apify.com` are EGRESS_BLOCKED from this
   * container, confirmed independently by three auditors, so every kill
   * criterion on the largest line in the code sits behind a wall we cannot see
   * through. MISSION rule 5 says no line survives on hope.
   */
  observable: boolean;
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
    platformAccount: "apify:one-creator-account",
    observable: false,
  },
  "il-biz-tools": {
    payin: "paddle",
    payout: "bank-transfer",
    note: "Paddle is merchant of record, so it collects and remits. But ILS is NOT a Paddle payout currency: an Israeli seller takes USD by international SWIFT at 5% + $0.50 per transaction, a $15 SWIFT fee, the receiving bank's own charge and ~1.5% FX, against a $100 minimum paid on the 1st and landing by the 15th. This entry previously said the payout lands in an Israeli bank account, which is true only in the sense that the money eventually arrives.",
    platformAccount: "paddle:one-seller-account",
    observable: true,
  },
  templates: {
    payin: "etsy",
    payout: "payoneer",
    note: "Etsy Payments is said to reach Israel through Payoneer. BOTH HALVES ARE OPEN: docs/REJECTED.md records Etsy Payments for Israel as UNVERIFIED, and the payment-rails audit corrected Payoneer's own Israel payability from YES to UNKNOWN. This entry previously called it 'the only documented route', which chained two unknowns together and described the result as documented.",
    platformAccount: "etsy:one-shop",
    observable: true,
  },
  "paid-apis": {
    payin: "x402",
    payout: "crypto-wallet",
    note: "USDC settles straight to a wallet the automaton controls. No platform can freeze it, and no KYC gates it.",
    platformAccount: "self:wallet-and-host",
    observable: true,
  },
  "agent-services": {
    payin: "x402",
    payout: "crypto-wallet",
    note: "Same rail as paid-apis by design — this line exists to sell work, not to diversify the rail.",
    platformAccount: "self:wallet-and-host",
    observable: true,
  },
  "telegram-bots": {
    payin: "telegram-stars",
    payout: "ton-wallet",
    note: "Stars convert through Fragment to TON. Whether Fragment withdrawal is open to an Israeli resident is unverified.",
    platformAccount: "telegram:one-bot-owner",
    observable: true,
  },
  "dev-extensions": {
    payin: "paddle",
    payout: "bank-transfer",
    note: "Deliberately reuses the il-biz-tools merchant account: licence keys, not a second merchant onboarding.",
    platformAccount: "microsoft:one-publisher",
    observable: true,
  },
  "hebrew-content": {
    payin: "affiliate-networks",
    payout: "payoneer",
    note: "Impact, PartnerStack and Amazon Associates pay Israel through PayPal or Payoneer against a tax form.",
    platformAccount: "affiliate:several-accounts",
    observable: true,
  },
  "oss-bounties": {
    payin: "bounty-platform",
    payout: "unknown",
    note: "Algora's own source lists Israel for Stripe Connect Express, but the Stripe-Israel question is reopened in docs/REJECTED.md. Unknown until a human opens stripe.com/global.",
    platformAccount: "algora:one-connect-account",
    observable: true,
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

export interface PlatformShare {
  platformAccount: string;
  lineIds: string[];
  targetAgorot: number;
  share: number;
  /** False when the colony cannot observe the platform it depends on. */
  observable: boolean;
}

export interface PlatformConcentration {
  platforms: PlatformShare[];
  overexposed: PlatformShare[];
  /** Share of the portfolio target riding on platforms we cannot observe. */
  unobservableShare: number;
  threshold: number;
  verdict: "ok" | "concentrated";
  reason: string;
}

/**
 * How much of the portfolio one platform account can take away.
 *
 * `railConcentration` answers "how does the money move" and was blind to this:
 * four separate audited candidates across four groups all live on one Apify
 * creator identity — one KYC, one payout method, one set of Store terms — and a
 * single clause (§2.2.4.2(i), no off-platform promotion) has already closed a
 * play two of them counted on. MISSION.md requires that one platform banning us
 * must not take the company down; that is a statement about accounts, not rails.
 */
export function platformConcentration(
  seeds: RevenueLineSeed[] = DEFAULT_PORTFOLIO,
  rails: Record<string, LineRails> = LINE_RAILS,
  threshold: number = RAIL_CONCENTRATION_THRESHOLD,
): PlatformConcentration {
  const total = seeds.reduce((n, s) => n + s.targetMonthlyAgorot, 0);
  const by = new Map<string, { lineIds: string[]; targetAgorot: number; observable: boolean }>();
  for (const seed of seeds) {
    const rail = rails[seed.id];
    if (!rail) continue;
    const row = by.get(rail.platformAccount) ?? { lineIds: [], targetAgorot: 0, observable: true };
    row.lineIds.push(seed.id);
    row.targetAgorot += seed.targetMonthlyAgorot;
    row.observable = row.observable && rail.observable;
    by.set(rail.platformAccount, row);
  }

  const platforms: PlatformShare[] = [...by.entries()]
    .map(([platformAccount, row]) => ({ platformAccount, ...row, share: total > 0 ? row.targetAgorot / total : 0 }))
    .sort((a, b) => b.share - a.share);

  const overexposed = platforms.filter((p) => p.share > threshold);
  const unobservableShare = platforms.filter((p) => !p.observable).reduce((n, p) => n + p.share, 0);
  const pct = (n: number) => `${Math.round(n * 100)}%`;

  const parts: string[] = [];
  if (overexposed.length) {
    parts.push(
      overexposed
        .map((p) => `${p.platformAccount} carries ${pct(p.share)} of the portfolio target across ${p.lineIds.join(", ")}`)
        .join("; ") + ". MISSION.md requires that one platform banning us does not take the company down.",
    );
  }
  if (unobservableShare > 0) {
    parts.push(
      `${pct(unobservableShare)} of the target rides on platforms this colony cannot observe: ${platforms
        .filter((p) => !p.observable)
        .map((p) => p.platformAccount)
        .join(", ")}. Their KPIs and kill criteria cannot be checked from here.`,
    );
  }

  return {
    platforms,
    overexposed,
    unobservableShare,
    threshold,
    verdict: overexposed.length > 0 ? "concentrated" : "ok",
    reason: parts.length
      ? parts.join(" ")
      : `No single platform account carries more than ${pct(threshold)} of the portfolio target, and every platform is observable from here.`,
  };
}

/** Lines whose payout route is not known to reach Israel. Money earned here may not be collectable. */
export function linesWithUnknownPayout(rails: Record<string, LineRails> = LINE_RAILS): string[] {
  return Object.entries(rails)
    .filter(([, r]) => r.payout === "unknown")
    .map(([id]) => id);
}

// ── Rails we have evaluated but do not yet use ──
//
// The concentration check above measures the rails in service. This is the
// shelf: routes a scout or auditor established are real, that nothing has
// adopted yet. It exists because the productized-services audit found one
// buried in a paragraph grading scout quality — its supervisor wrote that
// Freemius "belongs in the rails catalogue and should outlive this group" and
// then filed it nowhere. A rail that reaches Israel is too scarce to lose in a
// report card.

export interface CandidateRail {
  id: string;
  what: string;
  /** Why it matters to a portfolio whose Israeli rails are thin. */
  whyItMatters: string;
  /** What has to be true before a line may depend on it. */
  beforeUse: string;
  /** How strong the evidence is, stated rather than implied. */
  evidence: "rendered" | "snippet" | "vendor-claim";
  source: string;
}

export const CANDIDATE_RAILS: CandidateRail[] = [
  {
    id: "gumroad-ils",
    what: "Gumroad as a merchant-of-record checkout that pays an Israeli bank account in ILS.",
    whyItMatters:
      "This is the strongest payability evidence the 120-criterion sweep produced. Not a snippet and not an inference from absence: Gumroad's own production source file _13-getting-paid.html.erb carries a row reading Israel | ILS under the heading 'We currently support bank payouts in the following countries'. Every other ILS-native claim in this repo is unverified — Paddle does not even pay out in ILS, and an Israeli seller there takes USD by SWIFT with fees stacked on it. Gumroad supplies no buyers (its Discover gate requires a sale to already exist), so it is a rail and not a storefront, and that is exactly what makes it worth cataloguing here.",
    beforeUse:
      "Confirm the take rate against app/models/purchase.rb rather than a blog — the audit found the supervisor's figure wrong on the fixed leg ($0.50 vs $0.80) — and confirm what an osek patur needs to provide at signup.",
    evidence: "rendered",
    source: "research/colony-sweep/audits/storefronts.md §1",
  },
  {
    id: "freemius",
    what: "Merchant-of-record checkout for software and plugins. Israeli-founded, pays out in ILS with no conversion fee, by wire, Wise, Payoneer or PayPal, with a fully self-serve checkout and no buyer contact.",
    whyItMatters:
      "Our Israeli rails are thin and correlated: PayPal (now carrying 18% Israeli VAT on its fees since 6 July 2026), Payoneer, and ILS deposit through a storefront. MISSION.md requires that one rail failing does not take the company down, and an ILS-native merchant of record is the most direct answer to the payability gate that killed four candidates in the productized-services group alone.",
    beforeUse:
      "A human opens Freemius's own pricing and payout pages and confirms the ILS payout and fee structure, and confirms it accepts a seller who is an osek patur rather than a company. Nothing here is rendered.",
    evidence: "snippet",
    source: "research/colony-sweep/scouts/productized-services--localization.md, via research/colony-sweep/audits/productized-services.md §5.3",
  },
];
