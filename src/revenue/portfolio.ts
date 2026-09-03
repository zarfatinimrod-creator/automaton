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
    // UNVERIFIED (checked 2026-09-03): the "$470/developer/month average, ~$4k MRR
    // for the top independent creator" figures come from a partner/marketing page,
    // NOT from Apify's documentation, which states no revenue share and no typical
    // earnings. Same evidence class as the x402 number that proved 29x wrong. Not
    // disproved, and we have nothing better — but it must not be quoted as measured.
    // Revenue here is a portfolio effect either way, never one hit, and users lead
    // revenue by weeks, so the kill trigger watches users rather than shekels.
    //
    // VERIFIED from apify-docs (monthly-payouts.mdx): payouts are $20 minimum for
    // PayPal and Wise, $100 for other methods; invoices generate on the 11th and
    // auto-approve on the 14th. And the one that matters for the final goal — a
    // loss-making Actor has its profit set to $0 for the month, because "a single
    // Actor's loss doesn't reduce your total payout". Failures are FLOORED, not
    // netted against winners, so publishing many Actors carries no downside drag on
    // the payout. That makes this one of the few surfaces where the many-stores
    // model has no structural penalty for the ~95% that earn nothing.
    // See research/colony-sweep/scouts/agent-markets--apify.md.
    //
    // Corrected 2026-09-03 from Apify's own docs repo: an earlier comment here said
    // ranking is driven by existing usage and a new Actor is "structurally
    // invisible". Too strong. The quality score has eight categories and FIVE are
    // controllable on day one — reliability, ease of use, pricing transparency,
    // trustworthiness (least privilege) and congruency. Only popularity, feedback
    // and history-of-success need existing users. A new Actor is disadvantaged, not
    // invisible. See research/colony-sweep/scouts/store-promotion--marketplace-ranking.md.
    //
    // And the counterweight, from the store-promotion AUDIT the same day, because
    // the group supervisor pushed this correction much too far. Apify's own
    // how_store_works.md: "Search ranking evaluates parameters similar to those in
    // the Actor quality score. As a result, the two correlate strongly." So
    // accumulated usage IS a ranking input here, exactly as on the marketplaces we
    // rejected for that reason — Apify is LESS usage-locked than Etsy or Figma, not
    // exempt. "History of success" also means a portfolio of dead listings actively
    // harms the next one, which is a direct argument for the kill discipline below
    // rather than for publishing more.
    //
    // Maintenance is the real constraint, and Apify quantifies it: why_publish.md
    // says reserve ~2 hours per week per public Actor, with a publicly visible
    // support response time. Forty Actors is eighty hours a week, forever. Any plan
    // here is bounded by that, not by build hours.
    //
    // And the assumption underneath this line's whole thesis is now contradicted.
    // Three places in this repo said Israeli data on Apify Store is unoccupied
    // ground where our knowledge is the edge. The productized-services audit ran
    // one search: apify.com/swerve/supermarket-prices already scrapes the statutory
    // price files across 25 chains into one normalised schema, refreshed daily, and
    // the same creator runs swerve/madlan-analytics and swerve/yad2-scraper. That
    // is an Israeli-dataset Actor portfolio, shipped, by someone else. Snippet
    // grade — apify.com is egress-blocked here — but a claim that a niche is empty
    // does not survive the first search finding it occupied.
    //
    // What this changes: not the line, which still has the best-evidenced rail and
    // the only surface where a listing demonstrably converts. It changes the reason
    // to believe. The edge was never "nobody is there"; it has to be something we
    // can still say after meeting swerve. Until we know what that is, the honest
    // first move is the auditor's: publish products/apify-il-open-data free and
    // count runs from strangers for 30 days. Zero build, zero owner involvement,
    // zero money — and every Apify ceiling in this repo resolves to 0 or to a
    // measurement on its result.
    //
    // And a hard one: Actors requesting full permissions "might even be excluded
    // from search results" in autonomous-agent workflows. For a line whose buyers
    // are agents, minimum permissions is a launch requirement, not a nicety.
    killCriteria: ["under 25 monthly users across all Actors after 60 days live with 10+ Actors", "under ₪500 in 30 days after 90 days live", "two Actors deprecated for failing health checks in one month", "Store terms violation notice", "any Actor priced below its own platform usage cost — Apify zeroes a negative-profit Actor's payout for the whole month"],
    scaleCriteria: ["30-day payout at or above target", "any single Actor above ₪1,500 per month", "any Actor in the top 3 of its Store category"],
    // Audited down from ₪4,000 by the store-promotion auditor and left at ₪3,000
    // here deliberately: the auditor's ₪1,500 is its 12-month ceiling for a small
    // maintained set, and this target is what the board measures against, not a
    // forecast. If the line is still under ₪1,500 at 12 months the kill criteria
    // below fire long before the gap matters. What the audit did change is the
    // reason to believe: $1.4M/month across ~3,000 developers is a ~$470 mean on a
    // power-law distribution, so the median developer earns far less, and a new
    // entrant should not be planned above the mean of everyone already there.
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
    // Corrected 2026-09-03. This comment previously said the protocol runs at
    // ~$28k/day and ~$0.028 per call. Reported figures for mid-2026 are ~$800k/day
    // ($24M over 30 days) at ~$0.32 average per payment, across ~22,000 sellers and
    // ~94,000 buyers — so we were off by roughly 29x on volume and 11x on price.
    // See research/colony-sweep/scouts/agent-markets--x402-economy.md.
    //
    // The conclusion survives: $24M/month across 22,000 sellers is a MEAN of about
    // $1,090/seller/month, and in a power-law market the median earns far less. This
    // is still a small market per participant, and the marketplace subscriptions —
    // not x402 — carry this line; x402 is the zero-KYC option attached to it.
    //
    // What did change is the KPI. At $0.32/call the ₪1,200 target needs ~1,014 paid
    // calls a month, not ~11,600. The old kill criterion demanded 2,000 calls, which
    // at $0.32 is ~₪2,370 — nearly double this line's own target, so a line hitting
    // target exactly would have been killed by its own rule. Fixed below.
    kpis: ["API calls per day", "paying subscribers", "x402 paid requests", "error rate", "monthly revenue in ILS"],
    killCriteria: ["under 300 paid calls in 30 days after 60 days live (~₪355 at the ₪1.18/call protocol average — unambiguously failing, not merely below target)", "under ₪400 in 30 days after 90 days live", "error rate above 2% for two reviews"],
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
    // Narrowed 2026-09-03 from "Chrome/Edge and VS Code" to VS Code first, because
    // the store-promotion sweep rejected the Chrome Web Store twice over and this
    // line was still pointing at it. As a portfolio it is banned outright — no
    // developer, related account or affiliate may submit multiple extensions with
    // duplicate experiences — and as a single listing it is install-count-locked
    // with no documented cold-start lane and no published ranking. See
    // docs/REJECTED.md. Chrome is not forbidden here, but it may not be the
    // channel this line is planned around, and it must never be a portfolio.
    operatingLoop: [
      "Build VS Code extensions that fix a specific daily annoyance (RTL/Hebrew text handling, JSON/CSV tooling, Israeli-format helpers, privacy-first local dev tools) with a free core and a pro tier unlocked by a license key sold through the merchant-of-record store.",
      "Loop: ship the free core to the marketplace → collect installs and reviews → add one pro feature users ask for → measure license activations → repeat.",
      "A single Chrome extension is permitted once one VS Code extension has real users, and only as a second listing for a proven tool — never as a portfolio, which the Web Store bans by name.",
    ].join(" "),
    kpis: ["installs", "weekly active users", "license activations", "monthly revenue in ILS"],
    killCriteria: ["under ₪400 in 30 days after 60 days live", "marketplace listing rejected twice"],
    scaleCriteria: ["30-day revenue at or above target", "1,000+ weekly active users"],
    targetMonthlyAgorot: agorotFromIls(2500),
    budgetMonthlyCents: 2000,
    // The Chrome $5 developer fee is deliberately NOT an owner step. MISSION.md
    // restricts that catalogue to identity, KYC and payout steps a platform
    // legally requires of a human, and the store-promotion auditor caught this
    // group inventing exactly this kind of entry (a WordPress.org account, which
    // needs no verification at all). A $5 fee is a purchase, and the ₪200 owner
    // float in budget.ts exists so that the colony pays for things like it
    // instead of adding a line to the owner's list.
    humanSetup: [
      "Create a Microsoft/Azure DevOps publisher for VS Code (free, no identity verification) and reuse the merchant-of-record account from il-biz-tools for license keys",
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
