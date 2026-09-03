/**
 * Revenue Colony — the criteria registry
 *
 * The owner asked for at least a hundred agents searching by criteria, with a
 * supervisor over each group of criteria, run through the chain of command.
 * This file is that mandate as data: 14 criterion groups of 8 criteria each,
 * 112 in total, each one a self-contained search brief a scout can be given
 * with no further context.
 *
 * It lives in src/ rather than in a workflow script so both executors can use
 * the same list: the standalone sweep (a Workflow fan-out, run today) and the
 * automaton's own orchestrator (planner -> task_graph -> workers, once it is
 * provisioned). The chain of command over these scouts is the same one in
 * org.ts — scouts are workers, each group has a supervisor, each supervisor is
 * checked by an auditor, and the board decides what gets built.
 *
 * Adding a criterion here is how the colony widens its search. Nothing else
 * needs to change.
 */

import type { CustomRoleDef } from "../orchestration/planner.js";

export interface Criterion {
  /** Stable id, unique across all groups. Used as the sweep bookkeeping key. */
  id: string;
  /** The group this criterion belongs to. */
  groupId: string;
  /** The search brief handed to the scout verbatim. Self-contained by design. */
  brief: string;
}

export interface CriterionGroup {
  id: string;
  title: string;
  criteria: Criterion[];
}

/** KV keys for sweep bookkeeping, alongside REVENUE_KV in types.ts. */
export const SWEEP_KV = {
  /** + criterion id, value = ISO timestamp of the last completed scout run */
  lastSweptPrefix: "revenue.sweep.last_swept.",
  /** + group id, value = ISO timestamp of the last supervisor report */
  lastSupervisedPrefix: "revenue.sweep.last_supervised.",
  lastBoardSweepDecision: "revenue.sweep.last_board_decision",
} as const;

/** How long a criterion stays fresh before it is worth re-searching. */
export const SWEEP_INTERVAL_DAYS = 30;

type RawGroup = { id: string; title: string; criteria: [string, string][] };

const RAW_GROUPS: RawGroup[] = [
  {
    id: 'storefronts',
    title: 'Storefronts and marketplaces that pay an Israeli software-only seller',
    criteria: [
      ['gumroad', 'Gumroad in 2026: fee structure, payout countries and rails for Israel, which digital product categories actually sell and at what price, evidence of real seller earnings, and what Gumroad forbids.'],
      ['lemonsqueezy-payhip', 'Lemon Squeezy (post Stripe acquisition) and Payhip: merchant-of-record status, whether an Israeli seller can onboard today, VAT/tax handling, fees, payout rails, and current status of new signups.'],
      ['paddle', 'Paddle as merchant of record: exact onboarding and approval bar for a new Israeli seller, documents demanded, review time, product types accepted and refused, payout to an Israeli bank, and reports of rejections.'],
      ['etsy-digital', 'Etsy digital downloads: Israeli seller eligibility and the Payoneer path, fees, which digital goods sell (templates, planners, printables), saturation, and Etsy policy on AI-generated goods.'],
      ['asset-marketplaces', 'Creative Market, Envato/ThemeForest/CodeCanyon, TemplateMonster: acceptance bar, review time, exclusivity, revenue share, realistic per-item earnings, and payouts to Israel.'],
      ['creator-storefronts', 'Ko-fi, Buy Me a Coffee, Stan Store, Beacons, Sellfy: digital-product support, fees, payout rails available to Israel, and whether any of them work without an audience.'],
      ['theme-app-stores', 'Shopify Theme Store, Squarespace/Wix marketplaces, Webflow templates: approval bar, revenue share, demand signals, and payout countries.'],
      ['game-3d-assets', 'itch.io, Unity Asset Store, Unreal Marketplace/Fab, Roblox: payouts to Israel, what a software-only shop can produce, review bars, and realistic earnings evidence.'],
    ],
  },
  {
    id: 'plugin-ecosystems',
    title: 'Plugin, extension and template ecosystems',
    criteria: [
      ['chrome-extensions', 'Chrome Web Store after in-app payments shut down: how paid extensions are monetized now (ExtensionPay, own licensing), top-earning niches with evidence, review/permission bars, and manifest v3 constraints.'],
      ['figma', 'Figma plugins and widgets: the paid-plugin mechanism, Community payouts and eligible countries, what sells, and unserved gaps.'],
      ['notion-templates', 'Notion template economy: where they are sold, real price points, top-seller evidence, saturation, and whether an agent can produce genuinely useful templates at scale.'],
      ['obsidian-raycast', 'Obsidian plugins, Raycast extensions, Alfred workflows: monetization reality, licensing patterns, and audience size.'],
      ['ide-plugins', 'VS Code Marketplace and JetBrains Marketplace: paid plugin mechanics, JetBrains revenue share and payout countries, which paid plugins actually earn, and the review bar.'],
      ['shopify-apps', 'Shopify App Store: developer requirements, revenue share, review bar, app categories with demand and weak incumbents, and payouts to Israel.'],
      ['wordpress', 'WordPress plugin economy and Freemius: market size in 2026, freemium conversion norms, competition, and payout rails.'],
      ['chat-app-directories', 'Slack app directory, Discord App Directory, Telegram bot ecosystem: monetization paths, the App Directory review bar, and what a bot can charge for.'],
    ],
  },
  {
    id: 'agent-markets',
    title: 'Agent-native and AI marketplaces',
    criteria: [
      ['mcp-registries', 'MCP server registries and directories in 2026: how many are listed, whether anyone pays for MCP servers, hosted-MCP business models, and whether distribution there converts to money or only to attention.'],
      ['gpt-poe-stores', 'OpenAI GPT Store, Poe creator monetization, and similar AI app stores: payout status, eligible countries (Israel specifically), amounts creators report, and eligibility rules.'],
      ['inference-hosting', 'Hugging Face Spaces and Replicate: monetizable endpoints, pricing mechanics, what earns, payout rails, and the cost floor of serving a model.'],
      ['apify', 'Apify Store deeper: pay-per-event economics, evidence of actual actor revenue, rent-an-actor model, which categories are saturated and which are unserved, and payout to Israel.'],
      ['rapidapi', 'RapidAPI and alternative API marketplaces (APILayer, Zyla): seller payouts to Israel, categories with genuine paying buyers, pricing norms, and how much traffic a new listing gets.'],
      ['x402-economy', 'x402 in 2026: which services actually accept x402 payments, measurable transaction volume, who the machine buyers are, the CDP facilitator economics, and whether a paid API there earns anything real yet.'],
      ['agent-registries', 'ERC-8004, Virtuals, Olas, Fetch.ai and agent registries: distinguish real recurring revenue from token speculation, and say plainly whether any of it pays rent.'],
      ['skill-marketplaces', 'Claude skills/plugin marketplaces, awesome-lists, and agent-tool directories as distribution: do they convert to money, to users, or to nothing?'],
    ],
  },
  {
    id: 'data-apis',
    title: 'Data and API products',
    criteria: [
      ['israeli-open-data', 'Israeli open data: data.gov.il, Central Bureau of Statistics, Bank of Israel, municipal portals. Licence terms for commercial reuse, freshness, and which datasets a business would pay to have cleaned and served.'],
      ['company-registries', 'Company and business registry data (Israel and worldwide): what is legally redistributable, who buys it, existing sellers and their pricing.'],
      ['financial-data', 'Financial and market data APIs: the cheap end of the market, licensing constraints on redistribution, and where a small clean API still wins buyers.'],
      ['geo-address', 'Geo, address and postal data: Israeli address normalization and geocoding gaps, licence terms of the available sources, and buyers.'],
      ['transport-weather', 'Public transport (GTFS), weather, aviation and maritime feeds: commercial reuse terms, existing free competition, and whether any buyer pays.'],
      ['tax-rate-apis', 'Tax and regulatory reference data as an API (VAT rates, thresholds, filing dates, currency and interest rates): existing sellers, pricing, and whether an accurate, well-maintained feed has real buyers.'],
      ['sports-media-data', 'Sports, gaming and media metadata: licensing landmines, who sells it, and whether a clean legal slice exists.'],
      ['ai-training-data', 'Datasets for AI training: marketplaces, licensing and provenance requirements, buyer types, and whether a small seller can participate legally.'],
    ],
  },
  {
    id: 'israel-bureaucracy',
    title: 'Israeli bureaucracy, tax and rights — the colony home turf',
    criteria: [
      ['allocation-numbers', 'Israel Invoices / allocation numbers (חשבוניות ישראל, מספר הקצאה): the 2026 threshold timeline, who is affected, which tools exist today, what is missing, and whether anyone would pay for tooling around it.'],
      ['vat-reporting', 'Israeli VAT (מע״מ) reporting: online filing, deadlines, penalties, what small businesses get wrong, existing software, and the gap a free tool plus a small Pro tier could fill.'],
      ['bituach-leumi', 'National Insurance (ביטוח לאומי) for the self-employed: 2026 rates and ceilings, advance payments, benefits and grants, and which calculators people search for.'],
      ['income-tax-refunds', 'Israeli income tax: 2026 brackets, credit points (נקודות זיכוי), and the tax-refund (החזרי מס) industry — who charges what, what is automatable, and what legally requires a licensed representative.'],
      ['worker-rights', 'Israeli employment rights calculators: severance (פיצויי פיטורים), notice, recuperation pay (דמי הבראה), vacation, sick pay, minimum wage. Search demand and existing tools.'],
      ['business-registration', 'Opening and running a business in Israel: עוסק פטור/מורשה registration, Companies Registrar, business licensing, forms and fees — and which steps a software tool can genuinely simplify.'],
      ['fees-and-benefits', 'Municipal tax (ארנונה) discounts, customs and personal imports, government fees, and benefit entitlements: calculators, eligibility checkers, and search demand.'],
      ['israeli-smb-software', 'The Israeli SMB software landscape: Green Invoice, iCount, Rivhit, Morning, Hashavshevet. Pricing, APIs, affiliate or partner programmes, and the unserved gaps a free tool could occupy.'],
    ],
  },
  {
    id: 'vertical-niches',
    title: 'Vertical SMB niches worldwide',
    criteria: [
      ['ecommerce-sellers', 'Tools that Amazon, Shopify and Etsy sellers pay for: repeatedly requested gaps, price points, and how new tools get discovered.'],
      ['accountants', 'Tools bookkeepers and accountants pay for: reconciliation, document intake, client portals, deadline tracking. What is missing at the small end.'],
      ['real-estate', 'Real-estate agent tooling: listing generation, comparables, client follow-up. What is bought at under $50/month.'],
      ['hospitality', 'Restaurants, cafes and hotels: menu, ordering, reservation, review and compliance tooling at the small end.'],
      ['fitness-wellness', 'Gyms, studios, trainers, therapists: scheduling, intake, forms and payments — where incumbents overcharge.'],
      ['trades-contractors', 'Contractors and trades: quoting, invoicing, scheduling, permits. What is genuinely bought by one-person operations.'],
      ['recruiting-hr', 'Recruiters and small HR teams: sourcing, screening, scheduling, compliance documents. Note the legal risk of automated candidate screening.'],
      ['legal-admin', 'Law firms and paralegal admin: document assembly, deadline calculators, court-form automation. Be explicit about where this becomes unauthorized practice of law.'],
    ],
  },
  {
    id: 'content-seo',
    title: 'Content and SEO assets that earn without a human',
    criteria: [
      ['programmatic-calculators', 'Calculator and tool sites as a business: real traffic and revenue evidence, how they monetize, how long they take to rank, and the survivors versus the casualties of recent Google updates.'],
      ['converter-utility-sites', 'Converter and utility sites: monetization, ad rates, competition from incumbents, and whether a new entrant can still rank.'],
      ['directories-comparison', 'Directory and comparison sites: affiliate economics, build cost, maintenance burden, and evidence of ones that actually earn.'],
      ['ad-networks', 'AdSense, Ezoic, Mediavine, Raptive: entry thresholds in 2026, RPM for Hebrew/Israeli traffic versus English, payout to Israel, and policy risk for AI-assisted content.'],
      ['affiliate-networks', 'Affiliate networks and programmes that accept Israeli publishers and content sites: approval bars, payout rails, and which verticals pay enough to matter.'],
      ['hebrew-seo', 'Hebrew SEO opportunity: keyword volumes for Israeli business and tax queries, the incumbents (Kol Zchut, Green Invoice magazine, accountants blogs), and where a small site can actually win.'],
      ['ai-content-policy', 'Google policy and observed treatment of AI-generated content through 2026, AI Overviews impact on tool-site traffic, and what survives versus what gets deindexed.'],
      ['newsletters-communities', 'Newsletters and paid communities: can they run without a human voice, what sponsors pay, platform payout rails, and honest assessment of whether this fits an operator who does not talk to people.'],
    ],
  },
  {
    id: 'bounties-grants',
    title: 'Bounties, grants, prizes and creator funds',
    criteria: [
      ['oss-bounties', 'Algora, Gitcoin, Polar, BOSS and OSS bounty platforms: actual payout volume, typical bounty sizes, how work is claimed and reviewed, and payout rails for Israel.'],
      ['bug-bounty', 'Bug bounty via authorized programmes only (HackerOne, Bugcrowd, Intigriti): eligibility, KYC, payout to Israel, realistic earnings for automated analysis, and the rules that forbid unauthorized testing.'],
      ['ml-competitions', 'Kaggle and other ML competitions: prize money, eligibility rules, compute costs, and whether prizes pay to Israel.'],
      ['hackathons', 'Online hackathons with cash prizes that accept solo and AI-assisted entries: real prize pools, judging, and how payouts are made.'],
      ['protocol-grants', 'Protocol and ecosystem grants (Optimism RetroPGF, Arbitrum, Base, Solana, Filecoin, Ethereum Foundation): what is funded, application burden, whether an autonomous project qualifies, and KYC requirements.'],
      ['ai-credits-programs', 'AI and cloud credit programmes, accelerators and agent grants: what is available to a solo builder, what they demand in return, and whether credits reduce our real costs.'],
      ['data-challenges', 'Academic, civic and corporate data challenges with prize money: eligibility for a non-institutional entrant and payout mechanics.'],
      ['creator-funds', 'Creator funds and payouts beyond TikTok — YouTube Partner, Reddit, Medium, Substack, X, Pinterest, Snapchat: eligibility for Israel, payout rails, and whether faceless or AI-assisted content qualifies.'],
    ],
  },
  {
    id: 'crypto-native',
    title: 'Crypto-native income, judged sceptically',
    criteria: [
      ['paid-agent-services', 'Selling agent or API services for stablecoins: who actually pays, settlement costs, and honest current volume rather than promise.'],
      ['infra-services', 'Running paid infrastructure (RPC, indexing, data availability, oracles): capital and ops cost, competition, and whether it can run unattended.'],
      ['onchain-analytics', 'On-chain analytics products (Dune dashboards, alert bots, portfolio tools): who pays and how much.'],
      ['trading-strategies', 'Automated trading, MEV and yield strategies: assess honestly and expect to REJECT — the colony must not gamble the owner money. State the risk in numbers.'],
      ['digital-collectibles', 'NFTs and digital collectibles in 2026: market reality, and whether anything here is honest value rather than hype.'],
      ['israel-offramp', 'Crypto to ILS in practice: exchanges serving Israel, bank acceptance of crypto proceeds, reporting duties, and the friction that would block us receiving stablecoin revenue.'],
      ['agent-payment-networks', 'Agent-to-agent payment networks and machine commerce: measured volume, real buyers, and time horizon.'],
      ['crypto-tooling-grants', 'Grants and bounties specifically for crypto tooling and open-source infrastructure, and their KYC demands.'],
    ],
  },
  {
    id: 'licensing-ip',
    title: 'Licensable assets and intellectual property',
    criteria: [
      ['stock-media', 'Stock photo, video and illustration platforms: which accept AI-generated work and under what labelling, contributor earnings evidence, and payouts to Israel.'],
      ['music-sfx', 'Music and sound-effect libraries: AI-generated audio acceptance, licensing terms, earnings evidence, and payout rails.'],
      ['fonts-icons', 'Fonts and icon sets, including Hebrew typefaces: marketplaces, licensing models, the production cost, and whether Hebrew fonts are an underserved niche.'],
      ['datasets', 'Selling datasets: marketplaces, provenance and licensing requirements, buyers, and the legal line between collecting and redistributing.'],
      ['dual-licensing', 'Dual-licensing open-source libraries (AGPL plus commercial): who succeeds at it, the revenue shape, and whether it needs a sales human.'],
      ['3d-print-on-demand', '3D models and print-on-demand digital goods: platforms, payouts to Israel, and whether the work is genuinely software-only.'],
      ['white-label', 'White-labelling and reselling our own tools to accountants, bookkeepers and Israeli SaaS vendors: how such deals are normally structured and whether any can close without a human conversation.'],
      ['ai-output-rights', 'Who owns AI-generated output, and what each marketplace requires you to disclose: the legal picture in 2026 for selling AI-made assets commercially.'],
    ],
  },
  {
    id: 'productized-services',
    title: 'Productized services that need no human in the loop',
    criteria: [
      ['automated-audits', 'Automated audit reports as a product (SEO, Lighthouse, accessibility, security headers, Core Web Vitals): who buys them, at what price, and which incumbents already give them away free.'],
      ['monitoring-alerting', 'Monitoring and alerting as a product: uptime, price changes, regulatory changes, competitor changes, domain and certificate expiry. Pricing and buyers.'],
      ['document-generation', 'Document and form generation (contracts, invoices, letters, official forms): demand, and the precise line where this becomes regulated legal or tax advice in Israel.'],
      ['data-enrichment', 'Data cleaning, enrichment and deduplication as a service: buyers, pricing, and the privacy law that constrains it.'],
      ['compliance-scanners', 'Compliance scanning: cookie/GDPR, accessibility (EN 301 549, WCAG, Israeli standard 5568), and the Israeli accessibility regulations for websites. Who is legally obliged to comply and who sells to them.'],
      ['localization', 'Translation and localization pipelines, especially English-to-Hebrew and Hebrew-to-English: quality bar, existing tools, and buyers who pay for RTL-correct output.'],
      ['pdf-ocr', 'PDF, OCR and document-extraction pipelines including Hebrew OCR: accuracy reality, existing services, and paying buyers.'],
      ['api-middleware', 'Selling API wrappers, middleware and integration glue on marketplaces: what sells, and how quickly official APIs make it obsolete.'],
    ],
  },
  {
    id: 'distribution',
    title: 'Distribution and discovery without a human',
    criteria: [
      ['launch-platforms', 'Product Hunt, Hacker News, Indie Hackers, Reddit: the actual rules on self-promotion and automation, what a launch delivers in traffic, and what gets an account banned.'],
      ['directories', 'Tool and startup directories: which ones drive measurable traffic in 2026, submission rules, and whether automated submission is permitted.'],
      ['seo-2026', 'SEO for small tool sites in 2026: what still ranks under AI Overviews, how long a new domain takes, and the honest expected traffic curve.'],
      ['app-store-aso', 'Discovery inside app and bot stores: Chrome, Telegram, Slack, Shopify, Apify. What drives installs and what the listing quality bar is.'],
      ['israeli-channels', 'Reaching Israeli small businesses: WhatsApp channels, Telegram channels, Facebook groups for עצמאים, and forums. Group rules on promotion, and whether an automated poster is allowed at all — assume not unless proven.'],
      ['email-acquisition', 'Building an email list without a human: what is legal under Israeli spam law (חוק הספאם) and GDPR, and what actually converts.'],
      ['short-video', 'Short-video top of funnel (TikTok, Reels, Shorts) for a business audience: reach, conversion to a website visit, and whether faceless machine-made content performs.'],
      ['partnerships-integrations', 'Being listed inside someone else`s product (integration directories, partner pages, API marketplaces): how listings are obtained and whether any require a human conversation.'],
    ],
  },
  {
    id: 'store-promotion',
    title: 'Promoting hundreds of storefronts, without a human and without becoming spam',
    criteria: [
      ['promotion-at-scale', 'The core question of the final goal: how does anyone promote 100-900 separate storefronts when per-store human effort is impossible? Find operators who actually run portfolios at that scale — domain and template portfolios, plugin publishers, Apify Actor publishers, print-on-demand shops — and describe what they really do rather than what they sell courses about. Where exactly does portfolio promotion stop being marketing and become a spam cluster in the eyes of Google, the marketplaces and the ad networks? Quote the policies that draw that line.'],
      ['answer-engine-optimisation', 'Being found through AI answers rather than search results: ChatGPT, Perplexity, Google AI Overviews, Claude. What is actually known in 2026 about why a page gets cited, whether llms.txt is read by anyone, whether structured data helps, and — the question that decides whether this matters — does a citation send measurable traffic and buyers, or does the answer engine satisfy the user and keep them? Prefer studies and creator-reported measurements over agency blog posts, and say which is which.'],
      ['marketplace-ranking', 'The algorithms INSIDE marketplaces, which are not SEO: Etsy search, Apify Store ranking, Chrome Web Store, RapidAPI, npm, Notion and Figma galleries. For each: what ranks a listing that has zero sales, zero reviews and no history, how long the cold start lasts, and whether ranking is driven by existing usage (which makes a new listing structurally invisible). Name the levers a publisher genuinely controls.'],
      ['machine-discovery', 'Being found by other agents rather than by people: MCP server registries, the x402 Bazaar and CDP facilitator listings, .well-known descriptors, schema.org/JSON-LD, agent cards on ERC-8004, llms.txt and robots directives for AI crawlers. For each: is it read by anything today, what does listing require, does it produce actual paying callers, and what is the measurable volume? This repo already serves paid x402 endpoints that no agent can discover, so treat "does listing produce buyers" as the deciding question.'],
      ['first-reviews-honestly', 'The social-proof cold start: how a new store gets its first ratings and reviews without buying or faking any. What each major platform permits — review requests, follow-up messages, incentives, samples — and quote the clauses, because this is the single easiest place to violate terms and the constitution at once. Also: how much a first review is actually worth in conversion, and whether a store can sell at all with none.'],
      ['cross-promotion', 'A portfolio promoting itself: internal linking between our own stores, a shared hub site, bundles, footers, one newsletter across many products. What is legitimate and what Google treats as a private blog network or a link scheme — quote the guideline. Whether marketplaces permit cross-listing between a seller own products. And the honest question: does cross-promotion between low-traffic stores move anything, or is it zero times zero?'],
      ['paid-acquisition-floor', 'We have a total float of ₪200, once. Establish whether any paid channel is reachable at all: minimum spends, account requirements and realistic 2026 CPC/CPM for Google Ads, Meta, Reddit, X, LinkedIn, Telegram Ads and the Israeli networks, plus whether each serves Israeli advertisers and demands a business entity. Expect the answer to be no, and measure it precisely enough that nobody re-proposes paid ads for a year. If any channel is genuinely reachable for ₪200, say exactly what it would buy.'],
      ['attribution-without-analytics', 'How we learn which promotion worked when no analytics is deployed and the ledger only records completed sales. Options and their honesty: marketplace-provided seller stats, referrer and UTM data surviving to checkout, server log counting, privacy-preserving analytics that need no consent banner under Israeli and EU law, and per-store landing URLs. What can be measured without collecting personal data at all, and what a store must NOT do to attribute a sale.'],
    ],
  },
  {
    id: 'payment-rails',
    title: 'Payment and payout rails for an Israeli operator — the feasibility gate',
    criteria: [
      ['paddle-onboarding', 'Paddle for an Israeli seller: exact onboarding steps, documents, timelines, rejection reasons, payout mechanics, and fees. This gates our existing Pro tier.'],
      ['stripe-alternatives', 'Card processing for a site selling to Israelis: Tranzila, Cardcom, Meshulam, PayPlus, Grow, Isracard gateways. Requirements for a small seller, fees, and whether a legal entity is required.'],
      ['paypal-israel', 'PayPal for an Israeli business: account requirements, withdrawal to an Israeli bank, fees, and known freezing problems.'],
      ['payoneer-wise', 'Payoneer and Wise for receiving marketplace payouts in Israel: account requirements, fees, currency conversion, and which marketplaces pay through them.'],
      ['telegram-stars', 'Telegram Stars end to end: pricing, the app-store cut, the Fragment withdrawal path to TON, minimums, hold periods, and converting to shekels.'],
      ['app-store-payouts', 'Google Play, Apple App Store and Chrome Web Store payouts to Israeli developers: registration fees, tax forms, and thresholds.'],
      ['israeli-tax-registration', 'When an Israeli individual must register as עוסק פטור or עוסק מורשה, VAT treatment of digital exports, income reporting duties, and what happens if revenue arrives before registration. This is the single most likely blocker to real money.'],
      ['invoicing-obligations', 'Invoicing obligations for an Israeli seller of digital products to Israeli and foreign buyers, and how a merchant of record changes who must invoice whom.'],
    ],
  },
  {
    id: 'risk-governance',
    title: 'Risk, compliance and the governance the colony itself needs',
    criteria: [
      ['automation-tos', 'Platform terms on automation, bots and multi-account operation across the platforms we touch: GitHub, Apify, Telegram, Netlify, Google, Cloudflare, marketplaces. Quote the actual clauses.'],
      ['ai-disclosure', 'Where AI-generated content and AI-operated accounts must be disclosed: platform rules and emerging law (EU AI Act transparency duties) through 2026.'],
      ['owner-kyc-catalogue', 'Build the exhaustive catalogue of steps that unavoidably require the human owner: identity verification, bank details, tax forms, phone verification, app-store enrolment. For each: which platform, why it is unavoidable, how long it takes, and what it unlocks.'],
      ['selling-as-individual', 'Israeli law on an individual selling digital products: registration thresholds, occasional versus regular income, and the practical enforcement picture.'],
      ['privacy-exposure', 'Privacy exposure for tools that touch personal data: Israeli Privacy Protection Law and its 2025 amendment, GDPR, and how to design tools that hold no personal data at all.'],
      ['consumer-protection', 'Refund and consumer-protection duties for digital goods: Israeli consumer law, EU distance selling, and what marketplaces enforce on sellers.'],
      ['agent-failure-modes', 'Documented failure modes of autonomous agent systems in production: runaway spend, hallucinated progress or revenue, prompt injection, silent stalls, infinite loops, credential leaks. For each, name the concrete guardrail, test or watchdog we should add to this repo.'],
      ['audit-trail', 'What an accountant and a tax authority will later demand as evidence of income: records, invoices, platform statements, and how our ledger should be structured now so it satisfies them later.'],
    ],
  },
];

export const CRITERIA_GROUPS: CriterionGroup[] = RAW_GROUPS.map((g) => ({
  id: g.id,
  title: g.title,
  criteria: g.criteria.map(([id, brief]) => ({ id: `${g.id}/${id}`, groupId: g.id, brief })),
}));

export const ALL_CRITERIA: Criterion[] = CRITERIA_GROUPS.flatMap((g) => g.criteria);

export function groupById(id: string): CriterionGroup | undefined {
  return CRITERIA_GROUPS.find((g) => g.id === id);
}

export function criterionById(id: string): Criterion | undefined {
  return ALL_CRITERIA.find((c) => c.id === id);
}

/**
 * Which criteria are due for a fresh search.
 *
 * Pure on purpose: the caller supplies what it read from the KV store, so this
 * is testable without a database and identical for both executors.
 */
export function criteriaDueForSweep(
  lastSwept: Map<string, string>,
  nowMs: number,
  intervalDays: number = SWEEP_INTERVAL_DAYS,
): Criterion[] {
  const cutoff = nowMs - intervalDays * 24 * 60 * 60 * 1000;
  return ALL_CRITERIA.filter((c) => {
    const seen = lastSwept.get(c.id);
    if (!seen) return true;
    const at = Date.parse(seen);
    return !Number.isFinite(at) || at < cutoff;
  });
}

const SCOUT_RULES = [
  "Every finding needs a real URL you actually opened, with a date. Never invent a number, a price, a user count or a revenue figure.",
  "\"Unknown\" is a valid and useful answer. A criterion that is genuinely empty is worth reporting as empty.",
  "Judge payability to Israel explicitly (yes / no / unknown) with evidence. A \"no\" is a first-class finding: a line that cannot pay an Israeli is worth zero however good the idea.",
  "Judge terms-of-service risk: green (clearly permitted), amber (unclear or restricted), red (violates terms, law, or the constitution). Never recommend amber or red as a build.",
  "Name the buyer. \"Everyone\" means you have not found the buyer yet.",
  "Catalogue every step that would unavoidably need the human owner, and never invent one that does not exist.",
].join("\n- ");

/**
 * The role a scout is given. One scout, one criterion, no other context needed
 * — which is what lets 112 of them run at once without stepping on each other.
 */
export function scoutRoleFor(criterion: Criterion): CustomRoleDef {
  const group = groupById(criterion.groupId);
  return {
    name: `scout-${criterion.id.replace("/", "-")}`,
    description: `Scout for criterion ${criterion.id}`,
    systemPrompt: [
      `# Worker-scout: ${criterion.id}`,
      "",
      `You report to the supervisor of the "${criterion.groupId}" criterion group.`,
      `Group: ${group?.title ?? criterion.groupId}`,
      "",
      "<criterion>",
      criterion.brief,
      "</criterion>",
      "",
      "Search this and only this, exhaustively. Depth on one criterion beats breadth across many;",
      "the other 111 criteria have their own scouts.",
      "",
      "<rules>",
      `- ${SCOUT_RULES}`,
      "</rules>",
      "",
      "Return findings as structured data: name, what it is, the buyer, demand evidence with URLs,",
      "money model, honest monthly ceiling in ILS for a new entrant with no audience, build hours,",
      "owner blockers, Israel payability, ToS risk, competition, kill criteria, confidence.",
    ].join("\n"),
    allowedTools: ["web_search", "web_fetch", "read_file", "write_file", "remember_fact", "recall_facts"],
    deniedTools: ["exec", "transfer_credits", "spawn_child", "fund_child", "revenue_record", "revenue_decide"],
    model: "tier:fast",
    maxTurnsPerTask: 20,
    treasuryLimits: { maxSingleTransfer: 0, maxDailySpend: 0 },
    rationale: "A scout gathers evidence. It cannot spend, cannot record money, and cannot decide anything.",
  };
}

/** The supervisor over one criterion group. Merges, verifies, ranks, rejects. */
export function sweepSupervisorRoleFor(group: CriterionGroup): CustomRoleDef {
  return {
    name: `sweep-supervisor-${group.id}`,
    description: `Supervisor of the ${group.criteria.length} scouts in the "${group.id}" criterion group`,
    systemPrompt: [
      `# Supervisor: ${group.title}`,
      "",
      `${group.criteria.length} scouts report to you, one per criterion. You search nothing yourself.`,
      "",
      "<mandate>",
      "- Merge and deduplicate across your scouts; the same opportunity often appears under several criteria.",
      "- Verify before you promote: spot-check the strongest claims yourself. A finding with no real URL, or a number no source supports, is demoted or rejected.",
      "- Reject ruthlessly: not payable to Israel, amber or red on terms, needs the owner to talk to a human, cannot be built by software alone, or an honest ceiling under ₪300/month.",
      "- Score survivors on evidence x Israel payability x build feasibility x margin, and rank them. At most six survive.",
      "- For each survivor, give the single concrete first action — not a plan.",
      "- Name the scouts whose work was thin or unsourced. Your auditor checks whether you were honest about this.",
      "</mandate>",
      "",
      "<must_never>",
      "- Promote a finding you did not verify",
      "- Pad the ranking to fill six slots",
      "- Hide a scout's weak work to make the group look productive",
      "</must_never>",
    ].join("\n"),
    allowedTools: ["web_search", "web_fetch", "read_file", "write_file", "remember_fact", "recall_facts"],
    deniedTools: ["exec", "transfer_credits", "spawn_child", "fund_child", "revenue_record"],
    model: "tier:smart",
    maxTurnsPerTask: 24,
    treasuryLimits: { maxSingleTransfer: 0, maxDailySpend: 0 },
    rationale: "Separation of duties: the supervisor ranks but never searches, and cannot record money.",
  };
}

/** The auditor over one supervisor. Its job is to refute, not to agree. */
export function sweepAuditorRoleFor(group: CriterionGroup): CustomRoleDef {
  return {
    name: `sweep-auditor-${group.id}`,
    description: `Auditor checking the "${group.id}" supervisor`,
    systemPrompt: [
      `# Auditor: ${group.title}`,
      "",
      "You do not report to the supervisor you are checking. You report to the chief auditor.",
      "Your job is to refute, not to agree. Default to scepticism: what you cannot verify is not confirmed.",
      "",
      "<mandate>",
      "- Open the cited evidence yourself. If a URL does not support the claim, or does not exist, say so.",
      "- Attack the Israel payability claim hardest. This is where optimism kills a line: a marketplace that serves Israeli buyers may not pay Israeli sellers.",
      "- Attack the monthly ceiling. Ask what a new entrant with no audience, no reviews and no backlinks earns in month one — not what the market leader earns.",
      "- Attack the build estimate and the claim that no human is needed.",
      "- Verdict: confirmed only if the evidence holds; downgraded if real but overstated, with corrected numbers; refuted otherwise.",
      "- Report the supervisor's own errors and the angles the group missed entirely.",
      "</mandate>",
      "",
      "<must_never>",
      "- Confirm a finding you did not check yourself",
      "- Edit any record",
      "</must_never>",
    ].join("\n"),
    allowedTools: ["web_search", "web_fetch", "read_file", "write_file"],
    deniedTools: ["exec", "transfer_credits", "spawn_child", "fund_child", "revenue_record", "revenue_decide"],
    model: "tier:smart",
    maxTurnsPerTask: 20,
    treasuryLimits: { maxSingleTransfer: 0, maxDailySpend: 0 },
    rationale: "An auditor that can edit records is not an auditor.",
  };
}

/** The goal the board files to sweep one criterion group through the chain. */
export function sweepGoalSpec(group: CriterionGroup): { title: string; description: string; strategy: string } {
  return {
    title: `Sweep criterion group: ${group.title}`,
    description: [
      `Criterion group id: ${group.id}. ${group.criteria.length} criteria, one scout each.`,
      "",
      "Run the chain of command over this group:",
      `1. Spawn one scout per criterion (${group.criteria.map((c) => c.id).join(", ")}).`,
      "2. The group supervisor merges, verifies, ranks and rejects.",
      "3. The group auditor attacks the supervisor's ranking.",
      "4. Report the audited ranking to the board.",
      "",
      "Success: every criterion has a sourced report, the ranking is audited, and each survivor",
      "carries a buyer, an honest ceiling, a first action and kill criteria. A group that honestly",
      "yields nothing is a successful sweep — record the dead ends so the colony does not re-search them.",
    ].join("\n"),
    strategy: "parallel-scouts-then-review",
  };
}

// ── Sweep bookkeeping against the colony database ──
// Kept here rather than in the runner so both executors record freshness the
// same way: the standalone Workflow sweep and the automaton's orchestrator.

interface KvDb {
  prepare(sql: string): {
    get(...params: unknown[]): unknown;
    all(...params: unknown[]): unknown[];
    run(...params: unknown[]): unknown;
  };
}

/** Every criterion's last completed scout run, read from the kv table. */
export function readLastSwept(db: KvDb): Map<string, string> {
  const rows = db
    .prepare("SELECT key, value FROM kv WHERE key LIKE ?")
    .all(`${SWEEP_KV.lastSweptPrefix}%`) as { key: string; value: string }[];
  const out = new Map<string, string>();
  for (const row of rows) out.set(row.key.slice(SWEEP_KV.lastSweptPrefix.length), row.value);
  return out;
}

/** Record that a criterion was searched. Called after the scout's report lands. */
export function markSwept(db: KvDb, criterionId: string, atIso: string): void {
  db.prepare("INSERT OR REPLACE INTO kv (key, value, updated_at) VALUES (?, ?, datetime('now'))")
    .run(`${SWEEP_KV.lastSweptPrefix}${criterionId}`, atIso);
}

/** Record that a group's supervisor filed its report. */
export function markSupervised(db: KvDb, groupId: string, atIso: string): void {
  db.prepare("INSERT OR REPLACE INTO kv (key, value, updated_at) VALUES (?, ?, datetime('now'))")
    .run(`${SWEEP_KV.lastSupervisedPrefix}${groupId}`, atIso);
}

export interface SweepCoverage {
  groupId: string;
  title: string;
  total: number;
  swept: number;
  due: number;
  lastSupervisedIso: string | null;
}

/** What the board sees: how much of the search space is actually covered. */
export function sweepCoverage(db: KvDb, nowMs: number, intervalDays: number = SWEEP_INTERVAL_DAYS): SweepCoverage[] {
  const lastSwept = readLastSwept(db);
  const due = new Set(criteriaDueForSweep(lastSwept, nowMs, intervalDays).map((c) => c.id));
  return CRITERIA_GROUPS.map((g) => {
    const row = db
      .prepare("SELECT value FROM kv WHERE key = ?")
      .get(`${SWEEP_KV.lastSupervisedPrefix}${g.id}`) as { value: string } | undefined;
    return {
      groupId: g.id,
      title: g.title,
      total: g.criteria.length,
      swept: g.criteria.filter((c) => lastSwept.has(c.id)).length,
      due: g.criteria.filter((c) => due.has(c.id)).length,
      lastSupervisedIso: row?.value ?? null,
    };
  });
}

// ── Reconciling the database with what is actually on disk ──
//
// The durable record of a completed sweep is the scout's report file, not a kv
// row: the workflow writes the file, and nothing in the workflow can reach the
// colony database. So the two drift, and they drifted badly — the checkpoint
// claimed 30 swept while 39 reports sat in the directory, because marking is a
// separate manual step that nobody remembers to run.
//
// The file names carry the criterion id (`<group>--<criterion>.md`), so the
// directory listing is a complete, self-describing record. These helpers turn it
// back into state. Parsing is split from the filesystem so the mapping can be
// tested without a directory.

/** Where scout reports are written, relative to the repo root. */
export const SCOUT_REPORT_DIR = "research/colony-sweep/scouts";

/** The file a scout writes for a criterion. */
export function scoutReportFilename(criterionId: string): string {
  return `${criterionId.replace("/", "--")}.md`;
}

/**
 * Criterion ids for the report files in a directory listing.
 *
 * Unknown names are returned separately rather than dropped: a file that maps to
 * no criterion means either a renamed criterion or a stray file, and silently
 * ignoring it is how a registry and its evidence lose touch.
 */
export function criteriaFromReportFilenames(filenames: string[]): { known: string[]; unknown: string[] } {
  const byId = new Map(ALL_CRITERIA.map((c) => [c.id, c]));
  const known: string[] = [];
  const unknown: string[] = [];
  for (const name of filenames) {
    if (!name.endsWith(".md")) continue;
    const id = name.slice(0, -3).replace("--", "/");
    if (byId.has(id)) known.push(id);
    else unknown.push(name);
  }
  return { known, unknown };
}
