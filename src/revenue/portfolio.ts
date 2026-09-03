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
    kpis: ["actors published", "monthly runs", "paying users", "quality score", "monthly payout in ILS"],
    killCriteria: ["under ₪500 in 30 days after 60 days live with 10+ Actors", "two Actors deprecated for failing health checks in one month", "Store terms violation notice"],
    scaleCriteria: ["30-day payout at or above target", "any single Actor above ₪1,500 per month"],
    targetMonthlyAgorot: agorotFromIls(5000),
    budgetMonthlyCents: 6000,
    humanSetup: [
      "Create an Apify account in your name and complete Apify KYC (government ID, proof of address, tax document)",
      "Open a PayPal account in your name (PayPal Israel) and link it as the Apify payout method (minimum payout $20)",
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
    targetMonthlyAgorot: agorotFromIls(5000),
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
    kpis: ["API calls per day", "paying subscribers", "x402 paid requests", "error rate", "monthly revenue in ILS"],
    killCriteria: ["under ₪400 in 30 days after 60 days live", "error rate above 2% for two reviews"],
    scaleCriteria: ["30-day revenue at or above target", "10+ paying subscribers or 5+ recurring paying agents"],
    targetMonthlyAgorot: agorotFromIls(2500),
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
    killCriteria: ["under ₪300 in 30 days after 60 days live", "no unique paying agent in 30 days"],
    scaleCriteria: ["30-day revenue at or above target", "5+ recurring paying agents"],
    targetMonthlyAgorot: agorotFromIls(1500),
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
    kpis: ["bots live", "daily active users", "Stars received", "paying users"],
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
      "Loop: research keyword gaps → publish 3-5 guides or calculators per week → track impressions, clicks and affiliate conversions → double down on what converts → repeat. Expect months, not weeks.",
    ].join(" "),
    kpis: ["indexed pages", "weekly organic visits", "affiliate clicks", "affiliate revenue in ILS"],
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
