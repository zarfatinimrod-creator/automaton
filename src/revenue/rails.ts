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
  | "gumroad"
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
    note: "Apify bills the user and pays the developer; PayPal or Wise at a $20 minimum, other methods at $100. The payout side is DEFERRED by the board of 7.9.2026: publishing free and counting stranger runs needs no KYC and no payout method, and neither is requested from the owner until stranger runs exist. Note the fuse in Apify's own terms: an accrued balance is forfeited after twelve continuous months without KYC.",
    platformAccount: "apify:one-creator-account",
    observable: false,
  },
  "il-biz-tools": {
    payin: "gumroad",
    payout: "bank-transfer",
    note: "GUMROAD, not Paddle — changed by the board on 7.9.2026. Gumroad is the only merchant of record with rendered proof of ILS payout to an Israeli bank: its own production source file _13-getting-paid.html.erb carries a row reading `Israel | ILS`. Paddle was retired from this line for three reasons the audits rendered: no Paddle account exists (site.json holds empty sandbox credentials and the Pro box renders 'בקרוב'), ILS is not a Paddle payout currency at all, and Sumsub may demand a selfie video, which collides with the mandate. Gumroad's take is 12.9% + $0.80, plus 2.9% + $0.30 because an Israeli seller cannot attach their own Stripe — about 22% on a $9 product, which is why cheap products are not sold here.",
    platformAccount: "gumroad:one-seller-account",
    observable: true,
  },
  pcn874: {
    payin: "gumroad",
    payout: "bank-transfer",
    note: "The same single Gumroad seller account as il-biz-tools, and the board accepted that concentration KNOWINGLY: exactly one rendered ILS rail exists, so two of the four lines ride it and railConcentration() below now reports `concentrated`. The mitigation is to render Freemius as a second ILS rail (CANDIDATE_RAILS), not to invent a fourth rail or to hide the number.",
    platformAccount: "gumroad:one-seller-account",
    observable: true,
  },
  "oss-bounties": {
    payin: "bounty-platform",
    payout: "unknown",
    note: "Algora's own source file lib/algora/psp/connect_countries.ex lists {\"Israel\",\"IL\"} and routes it to a Stripe Connect Express account — rendered twice, and the only code-level Israeli payability proof the whole sweep produced. It stays `unknown` here because that settles the COUNTRY question and not the ACCOUNT one: no Connect account exists until owner step 4 succeeds, and writing a rail here before the form is submitted would launder an open question into a fact. Step 4 answers it either way, and the same form settles the Stripe-Israel question for every other Connect platform in docs/REJECTED.md.",
    platformAccount: "algora:one-connect-account",
    observable: true,
  },
};

// ── Merchant-of-record rails: which one a new ILS line uses, and who decides ──
//
// Board ruling, 7.9.2026 (BOARD.md §6.1 and §7.1): Gumroad becomes the DEFAULT
// merchant of record for ILS and Paddle becomes an OPTION the owner may choose,
// knowing three named risks. It is stated as code rather than as advice because
// eight group reports assumed "Paddle already ships / already pays us" and no
// test could contradict them.

/** The merchant of record a new ILS line uses unless the owner chooses otherwise. */
export const DEFAULT_MERCHANT_OF_RECORD: PayinRail = "gumroad";

export interface MerchantOfRecordRail {
  id: PayinRail;
  status: "default" | "option";
  what: string;
  /** Named, rendered risks. Empty for the default; never empty for an option. */
  risks: string[];
  /** Who may put this rail on a line. */
  chosenBy: "the board" | "the owner, and only the owner";
  evidence: "rendered" | "snippet" | "vendor-claim";
  source: string;
}

export const MERCHANT_OF_RECORD_RAILS: MerchantOfRecordRail[] = [
  {
    id: "gumroad",
    status: "default",
    what:
      "Merchant-of-record checkout that collects from the buyer, holds seven days, and pays out to an Israeli bank account in ILS above a $100 balance. Take: 12.9% + $0.80, plus 2.9% + $0.30 because an Israeli seller cannot attach their own Stripe.",
    risks: [],
    chosenBy: "the board",
    evidence: "rendered",
    source: "Gumroad's own _13-getting-paid.html.erb (`Israel | ILS`); research/colony-sweep/audits/storefronts.md §1",
  },
  {
    id: "paddle",
    status: "option",
    what:
      "Merchant-of-record checkout for software. Not on the owner's checklist and not on any line. It does the same job as Gumroad for the same products, and the board recommends against it — but the choice is his, and it is recorded here so the answer does not have to be re-derived each time it is raised.",
    risks: [
      "Sumsub identity verification may demand a short SELFIE VIDEO — a camera step the owner's brief forbids, and the same collision that killed telegram-bots.",
      "Approval is DISCRETIONARY and pre-revenue sellers have been refused; there is no self-serve guarantee at the end of the work.",
      "ILS is NOT a Paddle payout currency. An Israeli seller takes USD by international SWIFT: 5% + $0.50 per transaction, a $15 SWIFT fee, the receiving bank's charge and ~1.5% FX, against a $100 minimum paid on the 1st and landing by the 15th.",
    ],
    chosenBy: "the owner, and only the owner",
    evidence: "snippet",
    source: "research/colony-sweep/CHIEF-AUDIT.md §3.1 and §4A.2; BOARD.md §7.1",
  },
];

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
    what: "Merchant-of-record checkout for software, plugins and SaaS (AI-powered SaaS explicitly allowed — rendered from Freemius's own example repos). The contracting party is Freemius, Inc., New York law, arbitration in Tel Aviv for the non-Americas world; buyer prices are in USD with ILS as one of nine BUYER-side checkout currencies. Payout: PayPal, Payoneer, wire or Wise, $100 minimum, monthly with a ~40-day hold, ~10–11% all-in — every one of those payout facts is snippet-grade.",
    whyItMatters:
      "Our Israeli rails are thin and correlated: PayPal (now carrying 18% Israeli VAT on its fees since 6 July 2026), Payoneer, and ILS deposit through a storefront. MISSION.md requires that one rail failing must not take the company down, and today ₪1,000 of the ₪1,500 committed portfolio rides one Gumroad account.",
    beforeUse:
      "RENDERED 7.9.2026 by .github/workflows/render-watch.yml from Freemius's own docs (research/rendered/freemius-*.txt). PAYS ISRAEL = YES: 'Supported Countries for Payouts' lists Israel (supported-countries.txt line 308); the 'Unsupported' list holds the US-sanctioned states. PAYOUT METHODS: PayPal MassPay (default), Payoneer, wire (IBAN/SWIFT), Wise. CURRENCY: sales in ILS (like AUD, CAD, CHF, RSD, PLN) are converted to USD at purchase time and added to the USD balance (your-earnings.txt line 143); only USD, GBP and EUR keep separate payout methods (line 141); Wise and wire transfers support a payout CONVERSION currency — 'you can convert payouts to your local currency' (lines 147-154) — so an ILS bank payout is possible via Wise/wire, not via PayPal or Payoneer. The earlier 'pays in ILS, no conversion fee' claim stays REFUTED as stated. SCHEDULE: $100 minimum, paid on the 10th of each month; January earnings are calculated on 1 March and eligible on 10 March (lines 166-176), transfers take 3-6 business days (line 227) — roughly 40-70 days sale-to-cash; no Stripe Connect onboarding (line 184). ALLOWED: SaaS incl. 'REST APIs' and 'AI-powered services', downloadable software, plugins, extensions (allowed-prohibited.txt lines 100-106) — this is the one merchant of record that would take an x402/mcp-shaped product Gumroad forbids. PROHIBITED: non-software, SaaS fulfilled by human services, harmful AI content generation, medical advice, adult (lines 114-135). STILL NOT RENDERED: the platform fee (the earnings page says 'minus Freemius fees'; the pricing page is queued) and seller identity verification (the 'Verification' page is queued in research/rendered/urls.txt). GITHUB CODE SEARCH was exhausted before any page rendered (11 searches, 14 files). A line may now plan on Freemius as a USD-balance rail with an ILS payout via Wise or wire; railConcentration() stays 'concentrated' until a line actually rides it. Flagged, not resolved: under the EULA the seller's 'sole customer' is Freemius, Inc. (US), which cuts against zero-rating.",
    evidence: "rendered",
    source: "research/rendered/freemius-{supported-countries,your-earnings,allowed-prohibited}.txt (rendered 7.9.2026); research/measurements/freemius-rail.md",
  },
];
