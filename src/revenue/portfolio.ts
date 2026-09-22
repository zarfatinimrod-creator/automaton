/**
 * Revenue Colony — default portfolio
 *
 * The portfolio the board operates. Every line is something an AI director can
 * build, list, price and operate end to end. The only human involvement is the
 * owner's one-time checklist (`src/revenue/owner-steps.ts`, written out for him
 * in `docs/OWNER_STEPS.he.md`); the board parks a line in `awaiting_setup` until
 * he confirms with `revenue_setup_done`.
 *
 * Targets are ILS agorot per 30 days. Budgets are credit cents per month and
 * are re-allocated by the board on every review; the values here are only the
 * initial split.
 *
 * ─── Board decision, 7.9.2026 (research/colony-sweep/BOARD.md §3) ───────────
 *
 * Nine lines summing to ₪16,500 became four lines summing to **₪1,500**, plus
 * ₪700 the board refused to commit to (`CONDITIONAL_TARGETS`). Six lines were
 * killed outright and are recorded in `KILLED_LINES` with the board's reason and
 * the evidence that would reopen each one — a killed line does not disappear,
 * because a portfolio that forgets what it rejected re-proposes it.
 *
 * The ₪1,500 is the chief audit's ₪2,200 with the conditions made explicit. It
 * is a sum of audited ceilings that **no buyer has confirmed**; it is the honest
 * planning number and it is still a hypothesis. Against the owner's ₪20,000 that
 * is 7.5% committed, 11% with the conditionals.
 */

import type { Database } from "better-sqlite3";
import { removeQueuedGoals } from "./goal-queue.js";
import { getLine, insertLineFromSeed, listLines, updateLineFromSeed, updateLineStatus } from "./ledger.js";
import { agorotFromIls } from "./money.js";
import type { RevenueLineSeed } from "./types.js";

export const DEFAULT_PORTFOLIO: RevenueLineSeed[] = [
  {
    id: "apify-actors",
    name: "Apify Actors on one creator account (published free while the stranger count runs)",
    category: "paid_api",
    tier: "core",
    directorRole: "director-apify-actors",
    operatingLoop: [
      "Publish `products/apify-il-open-data` to Apify Store FREE through CI (`apify push` from a workflow holding APIFY_TOKEN; the container cannot reach apify.com, GitHub Actions runners can), and count runs by strangers for 30 days.",
      "The listing states that the source is free at data.gov.il and that anything ever charged for is the maintained, English-keyed normalisation and uptime — never the data itself.",
      "Loop: publish free → a daily stats job writes strangerRuns30d and strangerUsers30d through recordKpi → read the count at day 30 → under 10 stranger users, this line stays an instrument and no second Actor is built; 10-49, keep counting and fix what the runs show; 50+, build one Actor on the most-requested dataset and put Apify KYC to the owner; 200+, design pricing.",
      "Minimum permissions on every Actor: Apify says full-permission Actors 'might even be excluded from search results' in autonomous-agent workflows, and this line's buyers are agents.",
    ].join(" "),
    kpis: ["strangerRuns30d", "strangerUsers30d", "actors published", "quality score", "monthly payout in ILS"],
    // VERIFIED from apify-docs (monthly-payouts.mdx): payouts are $20 minimum for
    // PayPal and Wise, $100 for other methods; invoices generate on the 11th and
    // auto-approve on the 14th. A loss-making Actor has its profit set to $0 for
    // the month rather than being netted against winners, so publishing many
    // Actors carries no downside drag on the payout.
    //
    // Apify's Store search "evaluates parameters similar to those in the Actor
    // quality score", whose categories include Popularity and History of success
    // (how_store_works.md). Accumulated usage is a ranking input, so a portfolio
    // of dead listings actively harms the next one — which is an argument for the
    // kill discipline below rather than for publishing more. It is also the whole
    // reason to start the clock today: developer-level history cannot be bought
    // or copied, and it is one of the three non-public inputs MISSION constraint 8
    // says a line must have.
    //
    // Maintenance is the real constraint and Apify quantifies it: why_publish.md
    // says reserve ~2 hours per week per public Actor with a publicly visible
    // support response time. Any plan here is bounded by that, not by build hours.
    //
    // And the thesis under this line is contradicted: apify.com/swerve/supermarket-prices
    // already scrapes the statutory Israeli price files across 25 chains into one
    // normalised schema, refreshed daily, alongside swerve/madlan-analytics and
    // swerve/yad2-scraper. The niche is occupied. That is why the first thing
    // built here is a measurement and not a product.
    killCriteria: [
      "strangerUsers30d under 10 at day 30 → instrument only: no second Actor, no KYC request to the owner, permanently unless the count later crosses 50",
      "revenue_ledger holds no Apify payout 90 days after the first priced Actor goes live",
      "two Actors deprecated for failing health checks in one month",
      "Store terms violation notice",
      "any Actor priced below its own platform usage cost — Apify zeroes a negative-profit Actor's payout for the whole month",
    ],
    scaleCriteria: [
      "strangerUsers30d at or above 50 → one more Actor on the most-requested dataset, and Apify KYC goes to the owner",
      "strangerUsers30d at or above 200 → design pricing, with the free-source disclosure on the listing",
      "30-day payout at or above target",
    ],
    // Board §3: RETARGET ₪3,000 → ₪200. The ₪1,500 that five groups' survivors
    // collapsed into is recorded in TARGET_BASIS as the contested upper bound, not
    // as the target. See CONTESTED_UPPER_BOUNDS.
    targetMonthlyAgorot: agorotFromIls(200),
    budgetMonthlyCents: 4000,
    // Board §3, humanSetup split: publishing free needs only the token. Apify's
    // own Store Publishing Terms (§10.1.2-10.1.3) gate payout, pricing AND x402
    // eligibility on KYC — so KYC is real, but it is deferred to the moment
    // stranger runs exist (chief audit §4B.7-8), not asked for today.
    // "Register as osek patur" is gone from every line: it is owner step 2, once.
    humanSetup: [
      "Sign up at Apify with the brand as the username — the Store URL apify.com/<username>/… is public — and paste APIFY_TOKEN as a GitHub Actions secret (owner step 6; this half may be done straight after step 1). Nothing else: publishing free and counting stranger runs needs no identity verification. Apify KYC and a PayPal payout are deferred until stranger runs exist.",
    ],
    skillName: "revenue-apify-actors",
  },
  {
    id: "il-biz-tools",
    name: "Hebrew small-business web tools (invoices, receipts, VAT, net salary)",
    category: "micro_saas",
    tier: "core",
    directorRole: "director-il-biz-tools",
    operatingLoop: [
      "Ship a Hebrew/RTL web app with free calculators and paid exports for Israeli freelancers (osek patur / osek murshe):",
      "receipt and invoice generator matching Israeli formats, VAT and advance-payment calculators, net-salary calculator, Bituach Leumi estimator, osek patur threshold tracker, and the redaction feature folded in from risk-governance.",
      "The paid tier is sold through GUMROAD, not Paddle: Gumroad is the only merchant of record with rendered proof of ILS payout to an Israeli bank. Retire the Paddle block in src/config/site.json and put a Gumroad checkout link on the Pro box in place of 'בקרוב'.",
      "Every page that depends on tax-2026.json stays UNPUBLISHED until its rates are confirmed against two independent GitHub-hosted implementations and `verified` flips to true. Publishing an unverified rate is selling a wrong number.",
      "Loop: deploy under the domain → one Hebrew SERP read before any SEO hour → cookieless page views through the PostHog snippet, written weekly as KPIs → improve the tool with the best visit-to-pay ratio → repeat.",
    ].join(" "),
    kpis: ["weekly page views (cookieless)", "free tool uses", "paid conversions", "MRR in ILS", "refund rate"],
    killCriteria: [
      "revenue_ledger under ₪200 in 30 days after 90 days live with the domain deployed",
      "weekly page views under 100 for 8 consecutive weeks after deployment",
      "refund rate above 15% for two reviews",
      "Gumroad account rejected or the seller review fails",
    ],
    scaleCriteria: ["30-day revenue at or above target with 50%+ margin", "conversion above 2% on paid pages"],
    // Board §3: RETARGET ₪1,500 → ₪400, and the grade STAYS `contradicted` until
    // a page-view or Search Console reading exists. The audited band is ₪200-400
    // with ₪0 through month 12, and the evidence in this line's own basis argues
    // against any number above it: a competing Israeli legal site's own Search
    // Console export shows its severance calculator at 0 impressions over 16
    // months while sibling pages show 58k-81k.
    targetMonthlyAgorot: agorotFromIls(400),
    budgetMonthlyCents: 4000,
    humanSetup: [
      "Open a Gumroad account in your legal identity with the BRAND as the store name, add an Israeli bank account with the holder's name in Latin characters, and mint one access token (owner step 3)",
      "Buy the company domain at a registrar with WHOIS privacy on by default (owner step 5)",
      "Link the repo in Netlify and paste GUMROAD_ACCESS_TOKEN as a GitHub Actions secret (owner step 6)",
    ],
    skillName: "revenue-il-biz-tools",
  },
  {
    id: "oss-bounties",
    name: "Open-source bounties on Algora, from the brand machine account",
    category: "service",
    tier: "growth",
    directorRole: "director-oss-bounties",
    operatingLoop: [
      "ALGORA ONLY. Find funded bounties the way the payer publishes them: GitHub issues carrying algora-pbc[bot] bounty comments, found by GitHub search — the one host this container reaches.",
      "Filter before attempting: exclude repositories whose CONTRIBUTING or policy files ban AI-authored pull requests, require TypeScript / Python / docs / tests, and emit at most two candidates.",
      "EVERY pull request is opened from the BRAND MACHINE ACCOUNT, never from the owner's GitHub handle — a PR is a published byline and the mandate forbids his name on it (board §5, owner step 7).",
      "Disclose AI authorship on every pull request, attach a short demo video per claim, attempt at most two in parallel, and stop on a maintainer's first request.",
      "Loop: scan daily → attempt at most two → only claim what is merged → record the payout with its bounty id → repeat. Devpost is optional and conditional on the owner's answer about per-win paperwork; it is not part of this loop today.",
    ].join(" "),
    kpis: ["bounties attempted", "pull requests merged", "payouts in ILS", "acceptance rate"],
    killCriteria: [
      "revenue_ledger holds no Algora payout 90 days after the first attempted bounty",
      "acceptance rate under 25% over 10 attempts",
      "a maintainer policy ban on AI-authored PRs found in more than half of the candidate repositories in a month",
    ],
    scaleCriteria: ["30-day revenue at or above target", "acceptance rate above 60%"],
    // Board §3: RETARGET ₪1,500 → ₪300. The whole audited group is ₪800 and
    // Algora's share of it is ₪300. This line keeps its rank on MISSION
    // constraint 7 rather than on its ceiling: it is the only line whose
    // acquisition runs backwards — the payer posts the job, funds it in advance
    // and publishes the acceptance criteria, so no stranger has to find us — and
    // the only code-level Israeli payability proof the 121-criterion sweep
    // produced (lib/algora/psp/connect_countries.ex lists {"Israel","IL"} and
    // routes it to a Stripe Connect Express account, rendered twice).
    targetMonthlyAgorot: agorotFromIls(300),
    budgetMonthlyCents: 3000,
    humanSetup: [
      "Create the brand machine account on GitHub alongside your personal one and add it to the organisation (owner step 7)",
      "Sign in to Algora AS THE BRAND MACHINE ACCOUNT and complete Stripe Connect Express onboarding in your legal identity — individual, ID, Israeli address, Israeli bank account (owner step 4, done after step 7)",
    ],
    skillName: "revenue-oss-bounties",
  },
  {
    id: "pcn874",
    name: "PCN874 builder — spreadsheet to a validated מע\"מ detailed-report file",
    category: "digital_product",
    tier: "core",
    directorRole: "director-pcn874",
    operatingLoop: [
      "Turn a bookkeeper's spreadsheet into a PCN874 file the Tax Authority accepts: a validator first, then the builder.",
      "SPEC BEFORE CODE: render the 874 record layout from at least two independent open-source implementations found by GitHub code search into products/pcn874/spec/FORMAT.md with both sources cited. gov.il and both commercial mirrors are egress-blocked from this container. NO LEGAL FIGURE SHIPS UNTIL TWO SOURCES AGREE — a wrong file is the user's VAT exposure, not ours.",
      "Two channels, both named before the build: (a) Hebrew long-tail organic on the exact statutory terms, measured by a SERP pull BEFORE the build; (b) an open-source `pcn874` core under the brand GitHub org and npm scope, so GitHub and npm search carry the free tier.",
      "Sold through Gumroad in ILS. Loop: validator with fixtures → free open-source core → paid builder → measure which of the two channels brought the buyer → repeat.",
    ].join(" "),
    kpis: ["weekly page views (cookieless)", "npm downloads", "GitHub stars and clones", "paid conversions", "MRR in ILS"],
    killCriteria: [
      "revenue_ledger under ₪150 in 30 days after 90 days live",
      "no independent second source for the 874 record layout found in 30 days — the product does not ship at all in that case",
      "weekly page views under 100 for 8 consecutive weeks after publication",
    ],
    scaleCriteria: ["30-day revenue at or above target", "npm downloads of the free core above 200 in 30 days"],
    // Board §3: ADD at ₪600, grade `inferred`, basis = chief audit §2.1 #2.
    // The only line in the whole sweep with a verified, dated, legally created
    // cohort: VAT-registered עוסקים and the bookkeepers who file for them. Its
    // buyer exists because the law made it, which is MISSION constraint 8 shape
    // 2 — an obligation somebody must discharge and cannot get free.
    targetMonthlyAgorot: agorotFromIls(600),
    budgetMonthlyCents: 4000,
    humanSetup: [
      "Open a Gumroad account in your legal identity with the BRAND as the store name and mint one access token (owner step 3) — the same account il-biz-tools uses",
      "Create the GitHub organisation under the brand name so the open-source core and the npm scope carry it and not your username (owner step 7)",
    ],
    skillName: "revenue-pcn874",
  },
];

/** Insert every default line that is not already present. Returns how many were inserted. */
export function seedDefaultPortfolio(db: Database, seeds: RevenueLineSeed[] = DEFAULT_PORTFOLIO): number {
  let inserted = 0;
  for (const seed of seeds) {
    if (insertLineFromSeed(db, seed)) inserted += 1;
  }
  return inserted;
}

export function portfolioTargetAgorot(seeds: RevenueLineSeed[] = DEFAULT_PORTFOLIO): number {
  return seeds.reduce((sum, s) => sum + s.targetMonthlyAgorot, 0);
}

/**
 * Where each target number came from.
 *
 * MISSION rule 5 is "serious means measured". A target with no stated basis is
 * a wish with a currency symbol, and the failure mode is specific: numbers get
 * chosen so the portfolio adds up to the goal, and then the goal looks reachable
 * because the arithmetic was fitted to it rather than derived.
 *
 * So every line states its basis and an evidence grade, a test asserts the
 * numbers here match the portfolio, and the board report prints how much of the
 * total rests on nothing. `unevidenced` is not a sin — it is a research task
 * that has not been done yet, and it should be visible until it is.
 *
 * Two fields were added by the board on 7.9.2026 and they are not decoration.
 * MISSION constraint 7 says **a line may not be built before its acquisition
 * channel is named**, and the whole portfolio sits on three rails of which two
 * are unverified at the account level. Both facts used to live in prose that no
 * test could read, so `rail` and `acquisitionChannel` are required here and
 * `target-basis.test.ts` refuses a line that leaves either blank.
 */
/**
 * How much a target's number can be trusted.
 *
 * `contradicted` was added 2026-09-04 by the synthesis critic, and it is the one
 * that earns its place. Three lines were graded `measured` while the evidence
 * cited in their own `basis` field argued AGAINST the number — `paid-apis` was
 * carrying a target 200x the arithmetic written in its own basis. There was no
 * grade for that. `unevidenced` was wrong (evidence exists), `inferred` was wrong
 * (it does not support the number), and `measured` was laundering a refutation
 * into a forecast. A number its own source argues against is a distinct state and
 * it must never be summed with a merely uncertain one.
 */
export type TargetGrade = "measured" | "inferred" | "unevidenced" | "contradicted";

export interface TargetBasis {
  /** Must equal the line's targetMonthlyAgorot, in whole shekels. */
  ils: number;
  grade: TargetGrade;
  basis: string;
  /** Required for `measured`: where the number can be checked. */
  source?: string;
  /** How the money reaches us. Cross-checked against `rails.ts` by its own test. */
  rail: string;
  /** MISSION constraint 7: how a stranger finds this line. Never blank. */
  acquisitionChannel: string;
  /**
   * A larger figure that exists in the evidence and that the board refused to
   * commit to. Recorded so it cannot come back as a target without someone
   * deciding to, and so the owner sees the range rather than only the floor.
   */
  contestedUpperBoundIls?: number;
}

export const TARGET_BASIS: Record<string, TargetBasis> = {
  "apify-actors": {
    // Board §3, accepting chief audit §5.3: ₪200, with ₪1,500 recorded as the
    // contested upper bound. There is no argument for ₪3,000 the board was
    // willing to sign — "what the board measures against" was a target fitted to
    // the goal, which is the exact failure TARGET_BASIS exists to prevent.
    ils: 200, grade: "inferred",
    contestedUpperBoundIls: 1500,
    basis:
      "Five groups' survivors collapse into ONE Apify creator account. The auditors' two corrected 12-month ceilings for that account are ₪1,500 (store-promotion) and ₪200 (agent-markets); the board committed to ₪200 and records ₪1,500 as the CONTESTED UPPER BOUND, not as a target. The ₪1,500 rests on a generic 5-8 Actor scraper set at ~2 h/week/Actor priced off an unverified marketing mean ($470/developer/month across ~3,000 developers, a power-law MEAN and not in Apify's own documentation). The ₪200 rests on the only real base rate anyone rendered: 8.7 users per Actor. Month one is ₪0 and the first ledger entry is ~month 9. The line is kept as the constraint-7 instrument at forecast ₪0: publish free, count strangers for 30 days, start the developer-level history-of-success clock that MISSION constraint 8 names as a non-public input.",
    source: "research/colony-sweep/CHIEF-AUDIT.md §2.1 #1; audits/agent-markets.md and audits/store-promotion.md",
    rail: "Apify Store → PayPal or Wise (payout deferred: KYC only after stranger runs exist)",
    acquisitionChannel:
      "Apify Store search and Apify MCP-server search — platform search that ranks on accumulated history, which is precisely why the clock starts now and why nothing is priced before it has run.",
  },
  "il-biz-tools": {
    // Board §3: retarget to ₪400; the grade STAYS `contradicted` until a page-view
    // or Search Console reading exists. A number nobody has measured against a
    // channel nobody has tested does not get promoted for being smaller.
    ils: 400, grade: "contradicted",
    basis:
      "Audited band ₪200-400 with ₪0 through month 12 as things stand (chief audit §2.1 #3). The evidence in this very field argues against any number here: a competing Israeli legal site's own Google Search Console export, checked into a public repo, shows its severance-calculator page at 0 clicks and 0 impressions over 16 months while sibling pages show 58k-81k; head terms belong to funded incumbents (Morning, iCount, Invoice4u, Kol Zchut) and to btl.gov.il's own free simulators. Three preconditions before any SEO hour: deploy, buy the domain, read one Hebrew SERP. The grade stays `contradicted` until a page-view or Search Console reading exists — a smaller unmeasured number is still unmeasured.",
    source: "research/colony-sweep/CHIEF-AUDIT.md §2.1 #3; research/colony-sweep/audits/israel-bureaucracy.md §2.3",
    rail: "Gumroad (merchant of record, ILS payout rendered from Gumroad's own source). Paddle retired from this line by board §3.",
    acquisitionChannel:
      "Hebrew long-tail organic, measured rather than assumed: one SERP pull now, cookieless page views from PostHog written weekly as KPIs, Search Console only later and only if the owner chooses to add the property.",
  },
  "oss-bounties": {
    // Regraded 2026-09-04 and retargeted by the board 7.9.2026. Payability here
    // is the one code-level proof in the sweep: Algora's own
    // lib/algora/psp/connect_countries.ex contains {"Israel","IL"} and
    // account_type/1 special-cases only Brazil, so an Israeli contributor falls
    // through to a Stripe Connect Express account. Every other payability verdict
    // in this repo is a snippet, an inference from absence, or an UNKNOWN.
    ils: 300, grade: "inferred",
    basis:
      "The bounties-grants group is swept and audited: its five ranked lines fell from ₪7,800 to ₪800 combined, and Algora's own share of that is ₪300 (chief audit §2.1 #6). Month one is ₪0; money arrives 2-5 days after a first rewarded PR, which is weeks away. What IS verified, at code level and re-rendered independently, is Israeli payability — Algora's connect_countries.ex lists Israel and routes it to Stripe Connect Express. This is the only line in the portfolio whose acquisition problem runs backwards: the payer posts the job publicly, funds it in advance and publishes the acceptance criteria, so no stranger has to find us. Under MISSION constraint 7 that property outranks the ceiling, which is why the line keeps its rank at ₪300.",
    source: "research/colony-sweep/CHIEF-AUDIT.md §2.1 #6; research/colony-sweep/audits/bounties-grants.md; research/colony-sweep/CRITIC-synthesis.md §5",
    rail: "Stripe Connect Express via Algora (connect_countries.ex rendered twice). Unverified at the ACCOUNT level until owner step 4 succeeds.",
    acquisitionChannel:
      "The payer posts the job: bounties are GitHub issues carrying algora-pbc[bot] bounty comments, found by GitHub search — the only host this container reaches, and the only channel in the portfolio that does not need a stranger to find us first.",
  },
  pcn874: {
    // Board §3: ADD at ₪600. The band is ₪300-600 and the board took the top of
    // it, which needs saying out loud: it is the only line in the sweep whose
    // cohort is verified, dated and created by law rather than inferred from a
    // market. That is a reason to believe the band, not a reason to exceed it.
    ils: 600, grade: "inferred",
    basis:
      "Chief audit §2.1 #2: audited ceiling ₪600, band ₪300-600, month one ₪0, Israel payability YES via Gumroad (rendered `Israel | ILS`). The only line in the sweep with a verified, dated, legally created cohort — VAT-registered עוסקים filing the מע\"מ detailed report, and the bookkeepers who file for them — confirmed across CPA circulars. Graded GREEN with a harm asymmetry the target does not capture: a wrong file is the USER's VAT exposure, so no legal figure ships until the 874 record layout is rendered from two independent open-source implementations. Known headwinds already priced in: the dependency this displaces is stale (Feb 2024, no validatePcn874()), and ITA easements (sub-₪5,000 aggregation, deferral to 2027) shrink the pain.",
    source: "research/colony-sweep/CHIEF-AUDIT.md §2.1 #2",
    rail: "Gumroad (merchant of record, ILS payout rendered). Shared with il-biz-tools — see railConcentration(), which now reports this as concentrated.",
    acquisitionChannel:
      "Two, both named before the build: Hebrew long-tail organic on the exact statutory terms (measured by the SERP pull that precedes the build), and an open-source `pcn874` core under the brand GitHub org and npm scope so GitHub and npm search carry the free tier.",
  },
};

/**
 * Targets the board did NOT commit to.
 *
 * The chief audit's portfolio figure is ₪2,200/month at twelve months. ₪1,500 of
 * it is committed above; the remaining ₪700 depends on something that has not
 * happened, and the board's rule is that the owner is never told a conditional
 * number as a plan (BOARD.md §6.2, ruling on chief audit §5.1). These are
 * therefore not lines, carry no budget, and are excluded from
 * `portfolioTargetAgorot()` — they exist so the ₪700 is visible rather than
 * quietly folded into the total or quietly lost.
 */
export interface ConditionalTarget {
  id: string;
  name: string;
  ils: number;
  /** The specific thing that must be true before this becomes a line. */
  conditionalOn: string;
  rail: string;
  acquisitionChannel: string;
  source: string;
}

export const CONDITIONAL_TARGETS: ConditionalTarget[] = [
  {
    id: "registrar-reminder",
    name: "Company-registrar annual-fee deadline reminder",
    ils: 300,
    conditionalOn:
      "The static registrar fee/deadline page on il-biz-tools reaches 100 weekly page views. Below that the product is not built: the Registrar emails the deadline itself, so demand is the whole question.",
    rail: "Gumroad",
    acquisitionChannel: "The same Hebrew long-tail organic as il-biz-tools; the registrar term is measured in the same SERP pull.",
    source: "research/colony-sweep/CHIEF-AUDIT.md §2.1 #4 (band ₪150-300, at the bar, not above it); BOARD.md §2 build #6",
  },
  {
    id: "devpost-hackathons",
    name: "Devpost sponsored AI hackathons",
    ils: 400,
    conditionalOn:
      "The owner answers YES to signing a winner-eligibility form, a W-8BEN and a prize affidavit within ~2 business days of every win (BOARD.md §8 question 1; default is NO) AND an intake wave finds at least 3 events per quarter that explicitly permit AI-built entries with no human-authorship attestation. Two mandate collisions, not one: recurring owner paperwork breaks MISSION §1's one-time rule, and the 'meaningful human creativity' attestation cannot be signed honestly for agent-built work.",
    rail: "PayPal / Payoneer / Wise against a W-8BEN, ≤60 days (snippet-grade, re-read per event)",
    acquisitionChannel: "Devpost's own event listings — the payer posts the job, as with bounties.",
    source: "research/colony-sweep/CHIEF-AUDIT.md §2.1 #5; BOARD.md §2 (deliberately not on the build list) and §8",
  },
];

/**
 * Lines the board killed on 7.9.2026, kept because a portfolio that forgets what
 * it rejected re-proposes it. `docs/REJECTED.md` §"Board decision, 7.9.2026"
 * carries the same six with the full reasoning; this is the machine-readable
 * half, and `target-basis.test.ts` asserts none of them carries a target.
 */
export interface KilledLine {
  id: string;
  name: string;
  /** Always 0. A killed line has no target, and the test enforces it. */
  targetMonthlyAgorot: 0;
  /** What it was carrying when the board killed it, so the haircut is legible. */
  formerTargetIls: number;
  killedOn: string;
  reason: string;
  /** The specific evidence that would reopen it (BOARD.md §7.2). */
  reopensIf: string;
  /** The playbook removed with it, if any. */
  skillRemoved: string | null;
  /** Something that stays on disk at ₪0 cost without being a line. */
  standby?: string;
}

export const KILLED_LINES: KilledLine[] = [
  {
    id: "templates",
    name: "Spreadsheet and Notion business templates on Etsy and an own store",
    targetMonthlyAgorot: 0,
    formerTargetIls: 3000,
    killedOn: "2026-09-07",
    reason:
      "No channel, no rail, no evidence. Etsy needs an identity-verified shop plus Payoneer KYC, and Payoneer's own Israel payability was corrected from YES to UNKNOWN by the payment-rails audit. It is also an account-per-store platform, which MISSION constraint 2 rejects before anyone asks whether it would earn. The storefronts audit closed Etsy.",
    reopensIf:
      "A rendered Etsy page showing Israeli seller payouts through a route this repo can verify, AND a storefront model that does not need one verified identity per store.",
    skillRemoved: "revenue-templates",
  },
  {
    id: "paid-apis",
    name: "Paid developer APIs over x402 and an API marketplace",
    targetMonthlyAgorot: 0,
    formerTargetIls: 1200,
    killedOn: "2026-09-07",
    reason:
      "Killed as a revenue line: its own basis divides x402 out to roughly ₪6 per provider per month, and 91.2% of listings never reach ten calls a month. ₪1,200 was about 200x the most favourable per-provider arithmetic available.",
    reopensIf:
      "A rendered per-provider median at or above ₪100/month on x402scan or the Bazaar series, OR BILS opening beyond the institutional pilot. Any USDC that arrives before then is booked, not planned.",
    skillRemoved: "revenue-paid-apis",
    standby:
      "products/x402-il-api stays deployed only while it costs ₪0/month, as a RAIL ON STANDBY rather than a line: any USDC that arrives is booked through src/revenue/connectors/x402-local.ts, and nothing is planned on it.",
  },
  {
    id: "agent-services",
    name: "x402 services for other agents (zero-KYC line)",
    targetMonthlyAgorot: 0,
    formerTargetIls: 800,
    killedOn: "2026-09-07",
    reason:
      "The same refuted x402 evidence as paid-apis, without even the marketplace tier that line leaned on. It also fails 'never sell what is already free': the Israeli identifier detector it would meter exists free inside this repository.",
    reopensIf: "The same trigger as paid-apis, and a metered product whose free equivalent does not already ship in this repo.",
    skillRemoved: "revenue-agent-services",
  },
  {
    id: "telegram-bots",
    name: "Telegram bots paid with Stars",
    targetMonthlyAgorot: 0,
    formerTargetIls: 1500,
    killedOn: "2026-09-07",
    reason:
      "A MANDATE COLLISION, not a weak ceiling. Fragment's payout KYC is ID plus SELFIE — a camera step the owner's brief forbids, the same collision that closed Bugcrowd and the Paddle liveness video. Withdrawal to an Israeli resident is unverified on top of that. A product whose only rail collides with the mandate is not a line.",
    reopensIf: "A rendered Fragment page offering withdrawal to an Israeli resident without a selfie or liveness step.",
    skillRemoved: "revenue-telegram-bots",
    standby: "products/telegram-il-tools-bot stays on disk and is PARKED — it is not deleted, and it leaves the CI matrix only if a product is ever removed.",
  },
  {
    id: "dev-extensions",
    name: "Browser and editor extensions with a paid pro tier",
    targetMonthlyAgorot: 0,
    formerTargetIls: 2500,
    killedOn: "2026-09-07",
    reason:
      "No named channel with evidence behind it. The Chrome Web Store was rejected twice; the VS Code marketplace was never audited and its ranking is unread; no auditor ranked this line. Its basis still claimed 'plugin-ecosystems has not been swept' — it has been, and its one survivor (WordPress.org) is ₪0-200 behind a rendered 100-200x day-one search handicap.",
    reopensIf:
      "A rendered VS Code marketplace ranking mechanism that does not gate discovery on existing installs, or a rendered change to WordPress.org's class-plugin-search.php removing the active_installs weight.",
    skillRemoved: "revenue-dev-extensions",
  },
  {
    id: "hebrew-content",
    name: "Hebrew evergreen guides and calculators with affiliate and ad revenue",
    targetMonthlyAgorot: 0,
    formerTargetIls: 1500,
    killedOn: "2026-09-07",
    reason:
      "content-seo: fifteen criteria, ZERO survivors. Every money model here is a multiplier on traffic the colony has no channel to bring, and a multiplier on zero is zero. The working tools this line would have written are build #4 — they belong to il-biz-tools, which at least has a rail.",
    reopensIf:
      "A measured Hebrew organic channel: il-biz-tools showing 100+ weekly page views from search. Until a page of ours is found by a stranger, content is a cost.",
    skillRemoved: "revenue-hebrew-content",
  },
];

export interface TargetBasisSummary {
  totalIls: number;
  measuredIls: number;
  inferredIls: number;
  unevidencedIls: number;
  /** Targets the cited evidence argues against. Worse than unevidenced. */
  contradictedIls: number;
  /** Lines whose target rests on nothing measured yet. */
  unevidencedLines: string[];
  /** Lines whose own basis refutes their target. */
  contradictedLines: string[];
}

/**
 * What the portfolio's targets actually rest on. The board report prints this
 * so nobody reads a sum of wishes as a forecast.
 */
export function summarizeTargetBasis(
  seeds: RevenueLineSeed[] = DEFAULT_PORTFOLIO,
  basis: Record<string, TargetBasis> = TARGET_BASIS,
): TargetBasisSummary {
  const out: TargetBasisSummary = {
    totalIls: 0, measuredIls: 0, inferredIls: 0, unevidencedIls: 0, contradictedIls: 0,
    unevidencedLines: [], contradictedLines: [],
  };
  for (const seed of seeds) {
    const ils = Math.round(seed.targetMonthlyAgorot / 100);
    out.totalIls += ils;
    const entry = basis[seed.id];
    const grade: TargetGrade = entry?.grade ?? "unevidenced";
    if (grade === "measured") out.measuredIls += ils;
    else if (grade === "inferred") out.inferredIls += ils;
    else if (grade === "contradicted") {
      out.contradictedIls += ils;
      out.contradictedLines.push(seed.id);
    } else {
      out.unevidencedIls += ils;
      out.unevidencedLines.push(seed.id);
    }
  }
  return out;
}

export interface PortfolioSyncResult {
  inserted: string[];
  updated: string[];
  killed: { id: string; reason: string }[];
  /** Lines in the database that this file knows nothing about. Never touched. */
  unknown: string[];
}

/**
 * Make a colony database say what this file says.
 *
 * A board decision that lives only in code is a decision the owner never sees:
 * `state/colony/REPORT.md` and the manager's screen read the DATABASE for the
 * line table, the owner's steps and the blockers, and read this file only for
 * the target basis. On 7.9.2026 that gap would have produced a report claiming
 * ₪1,500 of committed targets above a table of nine lines totalling ₪16,500,
 * with the owner still being asked to open an Etsy shop.
 *
 * So the decision is applied rather than described: new lines are inserted,
 * surviving lines are refreshed from their seed, and killed lines are moved to
 * `killed` with the board's reason attached. Nothing else is touched — a line in
 * the database that this file does not know about is reported, not deleted,
 * because deleting a line the board never ruled on would lose its ledger history
 * silently.
 */
export function syncPortfolio(
  db: Database,
  seeds: RevenueLineSeed[] = DEFAULT_PORTFOLIO,
  killed: KilledLine[] = KILLED_LINES,
): PortfolioSyncResult {
  const out: PortfolioSyncResult = { inserted: [], updated: [], killed: [], unknown: [] };

  for (const seed of seeds) {
    if (insertLineFromSeed(db, seed)) out.inserted.push(seed.id);
    else if (updateLineFromSeed(db, seed)) out.updated.push(seed.id);
  }

  for (const dead of killed) {
    const line = getLine(db, dead.id);
    if (!line) continue;
    // Queued goals go whether or not the status change is new: a build goal for
    // a dead line is work nobody decided to do, and the first regenerated report
    // printed exactly that — "Goal queue: agent-services:build" under a portfolio
    // that no longer had an agent-services.
    removeQueuedGoals(db, dead.id);
    if (line.status === "killed") continue;
    updateLineStatus(db, dead.id, "killed", { reason: dead.reason, force: true });
    out.killed.push({ id: dead.id, reason: dead.reason });
  }

  const known = new Set([...seeds.map((s) => s.id), ...killed.map((k) => k.id)]);
  out.unknown = listLines(db).filter((l) => !known.has(l.id)).map((l) => l.id);
  return out;
}

/** ₪/month the board committed to: the sum of the live lines' targets. */
export function committedTargetIls(seeds: RevenueLineSeed[] = DEFAULT_PORTFOLIO): number {
  return Math.round(portfolioTargetAgorot(seeds) / 100);
}

/** ₪/month that exists in the audit but depends on a condition nobody has met. */
export function conditionalTargetIls(targets: ConditionalTarget[] = CONDITIONAL_TARGETS): number {
  return targets.reduce((sum, t) => sum + t.ils, 0);
}
