/**
 * Revenue Colony — default portfolio
 *
 * The seed portfolio the board starts from. Every line is something an AI
 * director can build, list, price, and operate end to end. The only human
 * involvement is the one-time setup listed per line (accounts that must be in
 * the creator's name for legal/KYC reasons); the board parks such lines in
 * `awaiting_setup` until the creator confirms with `revenue_setup_done`.
 *
 * Targets are ILS agorot per 30 days. Budgets are credit cents per month and
 * are re-allocated by the board on every review; the values here are only the
 * initial split.
 */

import type { Database } from "better-sqlite3";
import { insertLineFromSeed } from "./ledger.js";
import { agorotFromIls } from "./money.js";
import type { RevenueLineSeed } from "./types.js";

export const DEFAULT_PORTFOLIO: RevenueLineSeed[] = [
  {
    id: "apify-actors",
    name: "Apify pay-per-event Actors (Israeli data sources + long-tail scrapers)",
    category: "paid_api",
    tier: "core",
    directorRole: "director-apify-actors",
    operatingLoop: [
      "Publish a portfolio of narrowly scoped, well-documented Actors on Apify Store priced pay-per-event (roughly $1-5 per 1,000 results):",
      "(a) Israeli public sources nobody serves in English (gov.il tenders, public company registrar records, job boards, real-estate listings where the site's terms allow it),",
      "(b) global long-tail sources that are under-covered in the store. Never scrape personal data or sites whose terms forbid it; prefer public records and business data.",
      "Loop: find under-served categories with the store's own search → build the Actor (Crawlee/TypeScript) with an input schema, README and tests → push → set pay-per-event pricing and allow agentic buyers →",
      "watch the daily health tests and quality score, auto-fix breaking site changes → answer issues in the Actor's issue tab → each week kill zero-run Actors and clone winners into adjacent niches → record the monthly payout invoice in the ledger.",
    ].join(" "),
    kpis: ["actors published", "monthly runs", "paying users", "quality score", "monthly payout in ILS", "per-Actor margin over platform usage cost"],
    // Apify's own partner page implies roughly $470/developer/month on average and
    // about $4k MRR for the single most successful independent creator, so revenue
    // here is a portfolio effect, never one hit. Users lead revenue by weeks, so the
    // kill trigger watches users, not shekels.
    //
    // Corrected 2026-09-03 from Apify's own docs repo: an earlier comment here said
    // ranking is driven by existing usage and a new Actor is "structurally
    // invisible". Too strong. The quality score has eight categories and FIVE are
    // controllable on day one — reliability, ease of use, pricing transparency,
    // trustworthiness (least privilege) and congruency. Only popularity, feedback
    // and history-of-success need existing users. A new Actor is disadvantaged, not
    // invisible. See research/colony-sweep/scouts/store-promotion--marketplace-ranking.md.
    //
    // And a hard one: Actors requesting full permissions "might even be excluded
    // from search results" in autonomous-agent workflows. For a line whose buyers
    // are agents, minimum permissions is a launch requirement, not a nicety.
    killCriteria: ["under 25 monthly users across all Actors after 60 days live with 10+ Actors", "under ₪500 in 30 days after 90 days live", "two Actors deprecated for failing health checks in one month", "Store terms violation notice", "any Actor priced below its own platform usage cost — Apify zeroes a negative-profit Actor's payout for the whole month"],
    scaleCriteria: ["30-day payout at or above target", "any single Actor above ₪1,500 per month", "any Actor in the top 3 of its Store category"],
    targetMonthlyAgorot: agorotFromIls(3000),
    budgetMonthlyCents: 6000,
    // Apify's binding Store Publishing Terms, read directly from their own docs
    // repo (sources/legal/latest/terms/store-publishing-terms-and-conditions.md
    // §10.1.2-10.1.3): KYC gates the payout AND becoming a Verified Creator.
    // Their agentic-payments eligibility partial adds that "the Actor's
    // developer must also have completed identity verification (KYC)... Until
    // they do, none of their Actors are eligible" — so x402 is NOT a way around
    // it on the sell side. Until the owner does this, we can publish free
    // Actors and nothing else: no price, no x402, no payout.
    humanSetup: [
      "Create an Apify account in your name and complete Apify KYC (government ID, proof of address, tax document, beneficial-ownership info). This one step gates ALL THREE of: receiving any payout, setting a price on an Actor, and x402/agentic eligibility. Publishing free Actors is the only thing possible before it.",
      "Open a PayPal account in your name (PayPal Israel) and link it as the Apify payout method (minimum payout $20 for PayPal and Wise, $100 for other methods)",
      "Register as osek patur (self-service online form) before the first payout",
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
      "receipt and invoice generator matching Israeli formats, VAT and advance-payment calculators, net-salary calculator, Bituach Leumi estimator, osek patur threshold tracker.",
      "Free tools drive search traffic; the paid tier (branded PDF exports, saved clients, monthly pack) is sold through a merchant-of-record checkout (Paddle lists Israel as a supported seller country) so VAT is handled by the platform.",
      "Loop: build one tool → publish with a Hebrew SEO page → measure visits and paid conversions via revenue_kpi → improve the tool with the best visit-to-pay ratio → repeat.",
    ].join(" "),
    kpis: ["weekly visitors", "free tool uses", "paid conversions", "MRR in ILS", "refund rate"],
    killCriteria: ["under ₪500 in 30 days after 45 days live", "refund rate above 15% for two reviews", "merchant account rejected"],
    scaleCriteria: ["30-day revenue at or above target with 50%+ margin", "conversion above 2% on paid pages"],
    // Wave 2 of the criteria sweep measured this funnel at ₪1,500/month merged,
    // not ₪5,000. The hard datum: a live Israeli legal site's own Google Search
    // Console export, checked into a public repo, shows its severance-calculator
    // page at 0 clicks and 0 impressions over 16 months while sibling pages show
    // 58k-81k. Head terms here are owned by funded incumbents (Morning, iCount,
    // Invoice4u, Kol Zchut, and btl.gov.il's own free simulators). This is
    // long-tail work, and the target now says so.
    targetMonthlyAgorot: agorotFromIls(1500),
    budgetMonthlyCents: 5000,
    humanSetup: [
      "Open a merchant-of-record seller account (Paddle; Lemon Squeezy as fallback) in your name and complete identity/tax verification",
      "Add an Israeli bank account (IBAN/SWIFT) or PayPal for payouts",
      "Register as osek patur (self-service online form) before the first payout",
    ],
    skillName: "revenue-il-biz-tools",
  },
  {
    id: "templates",
    name: "Spreadsheet and Notion business templates (Hebrew + English) on Etsy and an own store",
    category: "digital_product",
    tier: "growth",
    directorRole: "director-templates",
    operatingLoop: [
      "Produce finished, tested templates that solve one painful admin task: freelancer bookkeeping in Hebrew, Israeli VAT / osek patur tracker, rental-property tracking, event budget in ILS, small-business CRM and inventory sheets, Hebrew/RTL planners and Jewish-holiday printables.",
      "Sell on Etsy (Etsy Payments supports Israel via Payoneer; AI-assisted products must be disclosed and designed by the seller — no prompt packs or templated resale) and mirror on an own store through the merchant-of-record checkout.",
      "Loop: research what buyers search for → build the template with a walkthrough PDF and 'make a copy' link → publish with previews → track views-to-sales → iterate the listing (title, images, price) → build the next template in the best-selling category.",
    ].join(" "),
    kpis: ["templates published", "listing views", "sales per week", "average order value in ILS", "refund rate"],
    killCriteria: ["under ₪400 in 30 days after 45 days live with 20+ listings", "refund rate above 10%", "shop suspended"],
    scaleCriteria: ["30-day revenue at or above target", "a template with 20+ sales"],
    targetMonthlyAgorot: agorotFromIls(3000),
    budgetMonthlyCents: 2500,
    humanSetup: [
      "Open an Etsy shop in your name (ID verification) and enrol in Etsy Payments with a Payoneer account (KYC) linked to your Israeli bank",
    ],
    skillName: "revenue-templates",
  },
  {
    id: "paid-apis",
    name: "Paid developer APIs (Hebrew NLP, RTL PDF, Israeli validators) over x402 and an API marketplace",
    category: "paid_api",
    tier: "growth",
    directorRole: "director-paid-apis",
    operatingLoop: [
      "Expose small, reliable HTTP APIs developers and agents pay for per call: Hebrew nikud/transliteration, RTL-correct PDF and image rendering, Israeli ID/bank/phone validation, Hebrew date conversion, structured extraction, PDF→Markdown.",
      "Serve every endpoint over x402 (USDC on Base, no account needed by the buyer) and cross-list on an API marketplace with a free tier and metered paid tiers; share the code with the Apify line where possible.",
      "Loop: ship one endpoint with docs and tests → list it → track calls, paying subscribers and error rate → improve the endpoint with the most free-tier usage → repeat. Tag every inbound x402 payment with [line:paid-apis].",
    ].join(" "),
    // Genuine agent-to-API commerce across the whole x402 protocol is on the order
    // of $28k/day, at a median clearing price near $0.028 per call. Our earlier
    // ₪2,500 target implied capturing a fraction of all worldwide x402 traffic that
    // is not credible. The marketplace subscriptions, not x402, carry this line;
    // x402 is the zero-KYC option attached to it. Volume is the honest early signal
    // because revenue at these prices lags far behind usage.
    kpis: ["API calls per day", "paying subscribers", "x402 paid requests", "error rate", "monthly revenue in ILS"],
    killCriteria: ["under 2,000 paid calls in 30 days after 60 days live", "under ₪400 in 30 days after 90 days live", "error rate above 2% for two reviews"],
    scaleCriteria: ["30-day revenue at or above target", "10+ paying subscribers or 5+ recurring paying agents"],
    targetMonthlyAgorot: agorotFromIls(1200),
    budgetMonthlyCents: 3000,
    humanSetup: [
      "Create the API marketplace provider account in your name and add a PayPal payout method (x402 needs nothing; converting USDC to ILS later needs a one-time Israeli exchange account with KYC)",
    ],
    skillName: "revenue-paid-apis",
  },
  {
    id: "agent-services",
    name: "x402 services for other agents (zero-KYC line)",
    category: "agent_service",
    tier: "experimental",
    directorRole: "director-agent-services",
    operatingLoop: [
      "Run paid endpoints that other automatons and agents call with x402 micropayments in USDC: structured extraction from HTML/PDF, Hebrew↔English translation, JSON repair, agent-card verification, pay-per-prompt inference resale.",
      "Register the services on the agent card and in agent registries so they are discoverable; keep prices low (cents) and latency predictable. This is the only line that needs no human account at all; demand is thin today, so it runs on a small budget.",
      "Loop: ship one endpoint → announce in the registry → measure paid requests per day → add the endpoint agents ask for most → repeat. Tag every inbound payment with [line:agent-services].",
    ].join(" "),
    kpis: ["paid requests per day", "unique paying agents", "USDC received", "p95 latency"],
    killCriteria: ["under ₪300 in 30 days after 90 days live", "no unique paying agent in 30 days"],
    scaleCriteria: ["30-day revenue at or above target", "5+ recurring paying agents"],
    // Kept deliberately small: zero setup makes it the first line that can earn,
    // but protocol-wide volume caps what it can become. It funds compute, not rent.
    targetMonthlyAgorot: agorotFromIls(800),
    budgetMonthlyCents: 1500,
    humanSetup: [],
    skillName: "revenue-agent-services",
  },
  {
    id: "telegram-bots",
    name: "Telegram bots paid with Stars (Hebrew utility bots + file/format tools)",
    category: "micro_saas",
    tier: "experimental",
    directorRole: "director-telegram-bots",
    operatingLoop: [
      "Build small Telegram bots that do one useful thing well and charge per use or per month in Telegram Stars: PDF/image conversion, Hebrew text tools (nikud, transliteration), receipt and invoice bots for Israeli freelancers, reminder and form-filling helpers.",
      "The creator creates each bot once with BotFather (no KYC) and provides the token; Stars are withdrawn to a wallet the automaton controls; converting to ILS later needs the creator's one-time exchange account.",
      "Loop: ship one bot → list it in bot directories and the bot's own landing page → track daily active users and Stars received → improve the most-used bot → repeat.",
    ].join(" "),
    kpis: ["bots live", "daily active users", "Stars received", "paying users", "share of purchases made on desktop/web"],
    killCriteria: ["under ₪300 in 30 days after 60 days live", "no paying user in 30 days"],
    scaleCriteria: ["30-day revenue at or above target", "a bot with 100+ paying users"],
    targetMonthlyAgorot: agorotFromIls(1500),
    budgetMonthlyCents: 1500,
    humanSetup: [
      "Create the bot in Telegram with @BotFather from your own Telegram account (2 minutes) and hand over the bot token as TELEGRAM_BOT_TOKEN; no KYC, but a bot must belong to a Telegram user",
    ],
    skillName: "revenue-telegram-bots",
  },
  {
    id: "dev-extensions",
    name: "Browser and editor extensions with a paid pro tier (license keys)",
    category: "micro_saas",
    tier: "experimental",
    directorRole: "director-dev-extensions",
    operatingLoop: [
      "Build Chrome/Edge and VS Code extensions that fix a specific daily annoyance (RTL/Hebrew text handling, JSON/CSV tooling, Israeli-format helpers, privacy-first local dev tools) with a free core and a pro tier unlocked by a license key sold through the merchant-of-record store.",
      "Loop: ship the free core to the marketplace → collect installs and reviews → add one pro feature users ask for → measure license activations → repeat.",
    ].join(" "),
    kpis: ["installs", "weekly active users", "license activations", "monthly revenue in ILS"],
    killCriteria: ["under ₪400 in 30 days after 60 days live", "marketplace listing rejected twice"],
    scaleCriteria: ["30-day revenue at or above target", "1,000+ weekly active users"],
    targetMonthlyAgorot: agorotFromIls(2500),
    budgetMonthlyCents: 2000,
    humanSetup: [
      "Pay the one-time Chrome Web Store developer fee ($5) with a Google account that has 2-step verification; create a Microsoft/Azure DevOps publisher for VS Code (free); reuse the merchant-of-record account from il-biz-tools for license keys",
    ],
    skillName: "revenue-dev-extensions",
  },
  {
    id: "hebrew-content",
    name: "Hebrew evergreen guides and calculators with affiliate and ad revenue",
    category: "content",
    tier: "experimental",
    directorRole: "director-hebrew-content",
    operatingLoop: [
      "Publish genuinely useful Hebrew guides, first-hand tool tests and continuously refreshed calculators on a niche with buying intent (small-business software, personal finance and bureaucracy for Israelis) on a domain the automaton owns.",
      "Every page is original, fact-checked against primary sources and disclosed as AI-assisted; monetise with affiliate programs that pay Israel (Impact.com, PartnerStack, Amazon Associates via Payoneer) and, once traffic qualifies, an entry ad network. Volume AI content is penalised in 2026, so quality and freshness beat quantity.",
      "Loop: research keyword gaps → publish working tools first and prose only to explain a tool's own output → track impressions, clicks and conversions → double down on what converts → repeat. Expect months, not weeks.",
      "Monetisation order is fixed: conversion into our own products first, affiliate second, display ads last and only as a residual. Hebrew is a small market with low ad rates, so ads can never carry this line. Volume is not a KPI - a page count target is the exact production pattern search engines now penalise.",
    ].join(" "),
    kpis: ["working tools published", "weekly organic visits", "affiliate clicks", "affiliate revenue in ILS", "conversions into our own products"],
    killCriteria: ["under ₪300 in 30 days after 120 days live", "search traffic flat for 60 days after 100 pages"],
    scaleCriteria: ["30-day revenue at or above target", "10,000+ monthly organic visits"],
    targetMonthlyAgorot: agorotFromIls(1500),
    budgetMonthlyCents: 1500,
    humanSetup: [
      "Open the affiliate program accounts in your name (they require a tax form and a PayPal or Payoneer payout) and provide the affiliate IDs",
    ],
    skillName: "revenue-hebrew-content",
  },
  {
    id: "oss-bounties",
    name: "Open-source bounties",
    category: "service",
    tier: "experimental",
    directorRole: "director-oss-bounties",
    operatingLoop: [
      "Find funded bounties on open-source issues (bounty platforms attached to GitHub), pick ones that match the colony's strengths (TypeScript, Python, docs, tests), solve them to the maintainer's standard, open the pull request from the creator's account, and claim the payout when merged.",
      "Loop: scan new bounties daily → attempt at most two in parallel → only claim what is merged → record the payout with its bounty id → repeat.",
    ].join(" "),
    kpis: ["bounties attempted", "pull requests merged", "payouts in ILS", "acceptance rate"],
    killCriteria: ["under ₪500 in 30 days after 60 days live", "acceptance rate under 25% over 10 attempts"],
    scaleCriteria: ["30-day revenue at or above target", "acceptance rate above 60%"],
    targetMonthlyAgorot: agorotFromIls(1500),
    budgetMonthlyCents: 1000,
    humanSetup: [
      "Connect your GitHub account to a bounty platform and complete its payout onboarding (verify it pays to Israel before enabling this line)",
    ],
    skillName: "revenue-oss-bounties",
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
 */
export type TargetGrade = "measured" | "inferred" | "unevidenced";

export interface TargetBasis {
  /** Must equal the line's targetMonthlyAgorot, in whole shekels. */
  ils: number;
  grade: TargetGrade;
  basis: string;
  /** Required for `measured`: where the number can be checked. */
  source?: string;
}

export const TARGET_BASIS: Record<string, TargetBasis> = {
  "apify-actors": {
    ils: 3000, grade: "measured",
    basis: "Apify's own partner page implies roughly $470/developer/month on average, with about $4k MRR for the single most successful independent creator. Revenue is a portfolio effect across many Actors, never one hit.",
    source: "research/colony-sweep/scouts/ — apify criterion; portfolio comment above the line",
  },
  "il-biz-tools": {
    ils: 1500, grade: "measured",
    basis: "Sweep wave 2 measured the merged funnel at ₪1,500/month. A competing Israeli legal site's own Search Console export shows its severance calculator at 0 impressions over 16 months; head terms belong to funded incumbents and to the state's free simulators.",
    source: "research/colony-sweep/groups/israel-bureaucracy.md, ranked survivor #3",
  },
  "paid-apis": {
    ils: 1200, grade: "measured",
    basis: "Genuine agent-to-API commerce across the whole x402 protocol runs on the order of $28k/day at a median clearing price near $0.028 per call. Marketplace subscriptions carry this line; x402 is the zero-KYC option attached to it.",
    source: "portfolio comment above the line",
  },
  "agent-services": {
    ils: 800, grade: "measured",
    basis: "Same x402 volume evidence as paid-apis, applied to a line with no marketplace tier behind it.",
    source: "portfolio comment above the line",
  },
  templates: {
    ils: 3000, grade: "unevidenced",
    basis: "Carried over from the first plan. The storefronts group is only 5/8 swept and Etsy digital-download economics for a new Israeli seller have not been measured. Treat as a research task, not a forecast.",
  },
  "telegram-bots": {
    ils: 1500, grade: "unevidenced",
    basis: "Carried over from the first plan, and worse than unevidenced: the payment-rails wave found that Fragment withdrawal eligibility for an Israeli resident is unverified. If Stars cannot be withdrawn to Israel this line's ceiling is ₪0. One owner login settles it.",
  },
  "dev-extensions": {
    ils: 2500, grade: "unevidenced",
    basis: "Carried over from the first plan. The plugin-ecosystems group has not been swept; Chrome Web Store paid-extension economics after in-app payments shut down are unmeasured.",
  },
  "hebrew-content": {
    ils: 1500, grade: "inferred",
    basis: "Ad and affiliate revenue on Hebrew traffic, inferred from the content-seo group's unswept criteria and from wave 2's finding that Israeli head terms are held by incumbents. Ordering matters: own products first, affiliate second, ads last.",
  },
  "oss-bounties": {
    ils: 1500, grade: "unevidenced",
    basis: "Carried over from the first plan. The bounties-grants group has not been swept, and payability to Israel on the bounty platforms is unverified.",
  },
};

export interface TargetBasisSummary {
  totalIls: number;
  measuredIls: number;
  inferredIls: number;
  unevidencedIls: number;
  /** Lines whose target rests on nothing measured yet. */
  unevidencedLines: string[];
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
    totalIls: 0, measuredIls: 0, inferredIls: 0, unevidencedIls: 0, unevidencedLines: [],
  };
  for (const seed of seeds) {
    const ils = Math.round(seed.targetMonthlyAgorot / 100);
    out.totalIls += ils;
    const entry = basis[seed.id];
    const grade: TargetGrade = entry?.grade ?? "unevidenced";
    if (grade === "measured") out.measuredIls += ils;
    else if (grade === "inferred") out.inferredIls += ils;
    else {
      out.unevidencedIls += ils;
      out.unevidencedLines.push(seed.id);
    }
  }
  return out;
}
