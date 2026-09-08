# GROUP REPORT — store-promotion

**Supervisor:** store-promotion supervisor (Opus 5). **Date:** 2026-09-03.
**Scouts assigned:** 8. **Scouts that delivered a usable report:** 5.5 — see "Scout quality" below.

> **Editor's note, added after the wave closed.** The supervisor wrote its coverage line from what
> reached it inside the wave. Since then the two missing criteria have been researched inline and
> their reports are on disk: `paid-acquisition-floor` (paid advertising rejected at any budget) and
> `marketplace-ranking` (which also produced a correction to `portfolio.ts`). The
> `attribution-without-analytics` report also landed after the supervisor filed. **All 8 of this
> group's criteria now have a scout report.** The synthesis below was written without those three
> and has not been re-run against them; where they disagree, the individual scout files are the
> later evidence. Nothing in them contradicts the five survivors or the six constraints — the
> paid-acquisition report independently reached constraint 3 from the cost side.
**Group question:** promoting hundreds of storefronts, without a human and without becoming spam.

---

## Headline

**There is almost no money in this group, and none of it comes from "promotion".**

Promotion at portfolio scale is dead by arithmetic before it is dead by policy. Apify's own
marketing playbook is a 27-step per-Actor checklist; at 900 listings that is ~24,300 manual
acts. Every step in it that *could* be automated — Reddit, Quora, Hacker News, Stack Overflow,
Medium/dev.to/Hashnode cross-posting — is precisely the set that Google's site-reputation-abuse
policy and Reddit's content policy prohibit. The vendor recommending it does not make it legal.

What survives is not a promotion activity at all. It is **one lever**: the ranking inputs that a
marketplace computes from things a machine can honestly maintain — listing text, uptime, schema
congruence, freshness, real usage. That lever exists on exactly one platform where we have
verified that listings turn into money: **Apify Store**.

The honest combined ceiling of everything that survived below is **≈₪15,500/month at the
optimistic end, with only the top line above `medium` confidence**. This group does not reach
₪20,000 on its own and should not be sold to the owner as if it might.

---

## What I verified myself this session (not scout-reported)

Unlike the payment-rails supervisor I had working search and a working `raw.githubusercontent.com`
route. Every claim below I re-fetched personally on 2026-09-03:

| Claim | Result |
|---|---|
| x402 Bazaar daily time series | **VERIFIED verbatim.** `2026-09-03: listings 15,333, providers 1,772, calls30d 302,072, payers30d 44,063, priceMedian 0.01` |
| Apify store T&C: similar functionality permitted | **VERIFIED.** "Creating an Actor that offers similar functionality or an outcome similar to another Actor is permitted." |
| Apify 80% share / payout minimums / KYC | **VERIFIED.** "80% of the fees paid by Users for your Actor, minus Platform usage costs"; "minimum amount payable is USD 20 for PayPal and USD 100 for any other payout option"; "you must successfully complete identity verification and the Know Your Customer (KYC) process." |
| Apify: any cap on Actors per developer | **VERIFIED ABSENT.** No such clause in the T&Cs. |
| Apify Store search fields + default sort | **VERIFIED.** Searches `title, name, description, username, readme`; `sortBy` = `relevance` (default), `popularity`, `newest`, `lastUpdate`. |
| Apify market size | **VERIFIED (search).** $1.4M/month paid across ~3,000 community developers (~$470 avg); top independent creators >$10k/mo; rentals closed to new listings 2026-04-01, model retired 2026-10-01. |
| Chrome Web Store duplicate-extension ban | **VERIFIED**, and the archived doc self-dates **2022-11-01**: "We don't allow any developer, related developer accounts, or their affiliates to submit multiple extensions that provide duplicate experiences or functionality on the Chrome Web Store." |
| WordPress guideline 12 | **VERIFIED.** "unnecessary affiliate links, tags to competitors plugins, use of over 12 tags total, blackhat SEO, and keyword stuffing"; **no plugin-count cap exists.** |
| Amazon Solicitations API | **VERIFIED.** "send non-critical solicitations to buyers"; 1 req/sec burst 5; **the seller supplies no message body** — the template is Amazon's, so incentives and sentiment-gating are structurally impossible. |
| x402 Bazaar indexing bug (issue #2112) | **VERIFIED OPEN, no maintainer response.** Eight successful settlements, `EXTENSION-RESPONSES` header never emitted, service never indexed. |
| AEO tooling price floor | **VERIFIED.** Otterly $29/$189/$489; Peec $95/$245/$495. |
| Judge.me Forever Free | **VERIFIED.** $0/mo with unlimited orders AND unlimited review requests; single $15 paid tier. |

**Demotions I made as a result:** none of the above failed. The demotions below are for claims
nobody could source, not for claims that broke.

---

## Merge and dedupe

| Duplicate across scouts | Kept | Why |
|---|---|---|
| Apify Store (promotion-at-scale, marketplace-ranking, agent-discovery) — three scouts, three angles | **one merged line** | Scout 1 had the terms, scout 3 had the ranking mechanism, scout 4 had the comparative market size. The merged line is the group's only strong finding; presenting it three times would inflate the portfolio. |
| llms.txt (AEO scout + agent-discovery scout) | agent-discovery | Same Ahrefs 137k-domain study, but the agent-discovery scout carried the per-bot counts (OpenAI: robots.txt 3,990 fetches vs llms.txt 7). Both concluded "dead"; they agree. |
| Chrome Web Store (promotion-at-scale = RED portfolio ban; marketplace-ranking = install-locked) | both, as one rejection | Two independent kill reasons for the same platform. |
| Reddit/community seeding (promotion-at-scale trap, AEO citation seeding) | AEO scout | Same prohibition; AEO scout quantified what is being given up (~40% of AI citations). |
| Etsy/POD (promotion-at-scale, marketplace-ranking) | both merged | Scout 1: multi-shop operator literature is an evasion manual. Scout 3: ranking is conversion-history-locked and Israeli payability unverified. Three independent kills. |

---

## RANKED SURVIVORS (5)

Five, not six. Padding to six would mean promoting the x402 Bazaar listing (₪100/month ceiling)
or the MCP-registry funnel (₪300 and no direct rail), and both fail the group's own floor.

---

### 1. Apify Store multi-Actor portfolio, ranked by machine-maintainable quality — score 82

**The only channel in this group where listing demonstrably converts to money, and we are already on it.**

The mechanism is verified end to end: the Store's default sort is `relevance` computed over
`title / name / description / username / readme` — all publisher-controlled text — with `newest`
and `lastUpdate` as two further sorts that structurally favour a fresh listing. A zero-run Actor
is therefore **not** structurally invisible here, which is not true of any other marketplace in
this sweep. The T&Cs impose no cap on Actors per developer and explicitly permit entering an
occupied niche. Quality score inputs (reliability, congruency across title/description/schema/docs,
pricing transparency, limited permissions, uptime) are exactly the inputs a software agent can
maintain across dozens of listings without a single act of outbound marketing.

- **Buyer:** Apify platform users buying data/automation runs — the same buyer already paying
  `products/apify-il-open-data`. Apify bills them and pays us.
- **Money:** pay-per-event; 80% of user fees minus platform costs. Rentals are closing
  (2026-10-01) — build pay-per-event only.
- **Honest ceiling ₪4,000/month.** Derivation, stated so it can be attacked: $1.4M/month across
  ~3,000 community developers = ~$470 (~₪1,700) average, and the average is inflated by a long
  tail earning zero. A disciplined 20–40 Actor portfolio in thin niches at 2–3× the average is
  ₪3,400–₪5,100. Anything above that requires being a top creator, which is not a plan.
- **Israel payable: YES.** PayPal min $20 / bank wire min $100, sent from the Czech Republic by
  SWIFT. No country exclusion appears in the T&Cs. (Israel is not *named* as supported — this is
  the one soft spot, and it is the same shape as Paddle, which the rails group already cleared.)
- **ToS: GREEN.** Explicitly permitted by rendered terms. The one RED adjacent to it — Apify's own
  `parasite_seo.md` playbook — is excluded below.
- **Build:** ~40h for the Actor factory + listing-text generator + uptime watchdog; ~4h per Actor after.
- **Kill:** if after 90 days and ~40 published Actors combined payout is under USD 150/month, or if
  three consecutive Actors are deprecated by Apify's automated tests, stop the portfolio and keep
  only the Actors with repeat usage.
- **Risk to name:** Actors failing automated tests for 3 days get a maintenance label and are
  removed 28 days later. A portfolio is a maintenance liability, not a passive asset. The uptime
  watchdog is not optional — it is the product.

**First step (one action):** `GET https://api.apify.com/v2/store?limit=100&search=<term>&sortBy=relevance`
across ~50 candidate dataset terms, writing listings-count and top-result run-counts per term to
`research/apify-niche-density.json` — i.e. measure supply per query before writing a line of Actor code.

---

### 2. Hebrew-first AI-answer visibility **monitoring** (not "optimisation"), billed through Paddle — score 68

The AEO market is real and priced: Otterly $29/$189/$489, Peec $95/$245/$495, Profound $499+.
Agencies charge $1,500–3,000/month retainers. The floor is $29 and it is English-only.

**The constitution decides the product shape here.** Our own sibling scouts killed the two things
this category normally sells: llms.txt is fetched on 3% of domains that publish it, and Ahrefs'
controlled test of 1,885 pages found JSON-LD moved AI citations by −4.6% / +2.2% / +2.4% — noise.
So we **may not sell optimisation advice**; we would be selling a placebo. What we may sell is a
**measurement**: run a fixed prompt set through the Anthropic and OpenAI **APIs** monthly, and
report whether the brand was named, with the sampling method stated in plain Hebrew on the page.
That is verifiable, falsifiable, and honest. Any recommendation shipped alongside it must carry
its own evidence grade.

- **Buyer:** Israeli SMB store owners and one-person SEO freelancers; `localseoisrael.co.il`
  already sells this service locally, which is the only direct evidence a Hebrew buyer exists.
- **Israel payable: YES** — Paddle is already live on `products/il-biz-tools`.
- **ToS: GREEN**, *conditional*: official APIs only. Scraping the consumer ChatGPT surface would be
  RED and would also make the number a lie about what was measured.
- **Ceiling ₪4,000/month** (~₪75/mo × ~50 subscribers). **Build 30h.**
- **Kill:** fewer than 10 paying subscribers at 90 days, or the API-sampled prompt set correlates
  too weakly with real assistant answers to describe honestly — in which case kill it *even if it
  is selling*.
- **Weakness, stated plainly:** every demand number in this category is published by someone selling
  AEO tooling. The moat is language and price, not technology, and it is copyable in weeks.

**First step (one action):** run one fixed 15-prompt Hebrew set through the Anthropic and OpenAI
APIs against 20 real Israeli SMB brand names and record name-mention rate per brand — proving the
signal is measurable *before* any UI exists. If brands are named ~never, there is nothing to sell.

---

### 3. WordPress.org plugin + Paddle/Freemius Pro tier — score 58

WordPress.org caps nothing: no clause anywhere in the 18 guidelines limits plugins per developer,
and the directory's own search is the distribution channel — zero outbound marketing, which is
exactly the property this group is looking for. What *is* policed is the readme (guideline 12:
≤12 tags, no competitor tags, no keyword stuffing, "written for people, not bots"), and that is a
constraint a generator can satisfy by construction.

- **Money:** free plugin as the channel, paid Pro via Paddle (merchant of record, already live).
- **Ceiling ₪4,000/month.** **Build 40h.** **Israel payable YES. ToS GREEN.**
- **Honest correction to the scout:** this is a **3–5 plugin play, not a 300 plugin play.** Every
  plugin passes human review, and active-install growth is slow for a no-brand entrant. Anyone
  presenting this as portfolio-scale is presenting a fantasy.
- **Kill:** if the first plugin does not reach 500 active installs within 120 days of approval, the
  directory-search distribution assumption is false for us — publish no more.

**First step (one action):** query `https://api.wordpress.org/plugins/info/1.2/?action=query_plugins&request[search]=<term>`
across ~40 candidate terms and record result count and top-10 active-install counts per term, to
find high-demand/thin-supply keywords before choosing what to build.

---

### 4. RapidAPI Hub as a second storefront for the already-built Israeli-data endpoints — score 52

`products/x402-il-api` exists and works. Its endpoints can be relisted on RapidAPI Hub as ordinary
subscription tiers with almost no new code. The point is not that RapidAPI ranks us — Popularity
is usage-driven and closed to a new listing — but that two of the three metrics shown next to every
listing (**Average Latency 30d, Service Level 30d**) are pure engineering quality that a new API can
top on day one, and that the honest edge is being the only listing for a specific national dataset.

- **Money:** subscription tiers; RapidAPI takes a flat 25%; **PayPal is the only payout route**, plus
  ~2% PayPal fee capped ~$20; transactions are paid out in the first week of the *second* following
  month, so cash lags ~60 days.
- **Ceiling ₪1,500/month. Build 16h. Israel payable YES** (via PayPal). **ToS GREEN.**
- **Confidence: low on evidence** — `docs.rapidapi.com` is egress-blocked; fee and payout terms come
  from search snippets of the vendor's own zendesk, not a rendered page.
- **Kill:** 60 days after listing at 99.9% service level and sub-300ms latency with zero paying
  subscribers ⇒ the quality metrics do not compensate for a cold popularity score; delist.

**First step (one action):** search RapidAPI Hub for `Israel` and record every existing listing with
its Popularity score, subscriber tier prices and category — establishing whether the national-dataset
niche is genuinely empty before porting anything.

---

### 5. Amazon Solicitations API review-request agent, sold as SaaS — score 40

Ranked last and included only because the primary source is unusually strong. Amazon ships a
first-party API whose only job is asking a buyer for a review, and **the seller supplies no message
body** — so it is structurally impossible to ask for a *positive* review, attach an incentive, or
gate on sentiment. That makes it the one review-acquisition surface that cannot be built dishonestly
even by accident. Rate limit 1 req/sec, burst 5.

- **Buyer:** Amazon FBA/FBM sellers and small agencies who currently click "Request a Review" by hand.
- **Money:** ~$15–29/month via Paddle. **Ceiling ₪2,000/month. Build 35h. Israel payable YES. ToS GREEN.**
- **Why it ranks last, honestly:** the market is mature and partly free (FeedbackWhiz, eComEngine,
  SellerLabs, Jungle Scout, plus free extensions clicking the same button); the API is public to
  everyone so there is no moat in the call; and **the owner blocker is the worst in the group** —
  SP-API public-app approval requires a developer profile tied to a legal entity plus a
  security/data-protection questionnaire a human completes and signs. That is more than KYC.
- **Kill:** fewer than 10 paying sellers within 60 days of launch, **or** SP-API public-app approval
  not granted within 45 days of submission — whichever comes first.

**First step (one action):** submit the SP-API developer-profile application and record the response
SLA — the approval, not the code, is the binding constraint, and 35 build hours must not be spent
before it clears.

---

## The constraints — the group's real output

These are not revenue lines. They are the rules that decide whether any storefront portfolio lives.
They cost nothing and they override product enthusiasm.

1. **Unique data per storefront, never variable substitution.** Google names the failure mode in
   four policies at once (scaled content abuse, doorway abuse, site reputation abuse, expired domain
   abuse). Doorway abuse explicitly covers "having multiple websites with slight variations to the
   URL and home page". **Kill on sight any proposal where storefront N and N+1 differ only by a
   substituted city/niche/keyword.** *(Evidence grade: snippet + a GitHub mirror; developers.google.com
   is egress-blocked. A human must open the spam-policies page to make these quotes load-bearing.)*
2. **One consolidated domain, in-context internal links — never a network of microsites.** This is a
   4-hour edit to `il-biz-tools` with no revenue attached, and it removes a deindexing risk that
   could take the whole property out of Google.
3. **Never automate community posting.** Reddit, Quora, Hacker News, Stack Overflow, Medium, dev.to,
   Hashnode — off limits at any scale beyond a handful, regardless of who recommends it, **including
   Apify's own `parasite_seo.md` and its 27-step checklist.** This is the single largest citation
   lever in existence (Reddit ≈40% of AI citations) and it is structurally closed to us: faking it is
   astroturfing, earning it requires a human posting under their own name, and the owner does neither.
   That is the ceiling on this whole group and no on-page work gets around it.
4. **Five honest reviews per SKU is the target, not "many".** Spiegel/Northwestern: purchase
   likelihood at five reviews is +270% vs zero, with essentially all the lift inside the first ~10.
   At a 5–15% review rate that is ~50 delivered orders per SKU. There is no cleverer legal lever than
   "ask every buyer, once, automatically". *(Snippet-grade; the Spiegel page is egress-blocked.)*
5. **Review gating is RED everywhere at once** — Google, Trustpilot, Amazon, FTC 16 CFR 465, EU
   Omnibus. Any sibling proposal containing an NPS pre-screen, a "smart send", or a happy-path branch
   before a public review request is auto-rejected, however it is worded.
6. **llms.txt: ship it as one hour of hygiene, forecast zero.** 97% of published files are never
   fetched; crawlers never probe for it on domains that lack it; OpenAI fetched robots.txt 3,990 times
   against llms.txt 7. Never sell it — that would be selling a placebo.

---

## REJECTED (and why)

| Line | Verdict |
|---|---|
| **Chrome Web Store extension portfolio** | **RED, structurally banned.** Verified verbatim: no developer, related account or affiliate may submit multiple extensions with duplicate experiences or functionality. Separately, minimum-functionality policy bans "template extensions that only vary slightly". Dead twice over. |
| **Chrome Web Store, single extension** | Rejected on ranking, not policy: install-count-locked, no documented cold-start lane, and Google publishes nothing official about ranking. Ceiling not defensible. |
| **Multi-shop Etsy / print-on-demand** | **RED.** The entire operator literature at 5+ shops is about defeating Etsy's account-linking detection (anti-detect browsers, separate payment instruments and addresses) — manipulation of platform processes. Etsy ranking is conversion-history-locked; Israeli payability unverified. Three independent kills. |
| **Amazon Merch on Demand** | Rejected: tier ladder starts at 10 live designs and advances only by sales; Israel absent from every eligible-marketplace list seen; manually reviewed human application. |
| **Amazon Vine** | Rejected: requires Brand Registry, which requires a registered trademark — a multi-month human/legal process. Sanctioned but out of reach. |
| **Ad-monetised storefront portfolios (AdSense / MFA)** | Rejected: AdSense forbids pages with more advertising than content; the MFA ecosystem is advertiser-side blocklisted. No honest demand side exists. |
| **Shopify/WooCommerce review-request SaaS** | Rejected: **price floor is zero.** Judge.me's Forever Free plan is verified to include unlimited orders and unlimited review requests, with a single flat $15 tier. The only remaining differentiator anyone markets is review gating, which is RED. |
| **llms.txt as a service / generator** | Rejected: selling a placebo. 97% never fetched; Google documented it has no effect on Search or AI Overviews. |
| **Reddit / YouTube citation seeding** | **RED, permanently.** Astroturfing under Reddit's content policy and our constitution. |
| **x402 Bazaar listing as a revenue line** | Rejected on ceiling: the *entire* registry turned over 302,072 calls in 30 days at a $0.01 median ≈ **$3,020/month gross shared by 1,772 providers** (~₪6/provider/month), with 91.2% of listings failing 10 calls a month. Verified first-hand. Additionally, issue #2112 is open with no maintainer response and indexing appears broken for external EOA payees — which is our configuration. Keep the 1-hour config change as hygiene; **never model revenue from it.** |
| **MCP server on the public registries** | Rejected on ceiling (₪300) and rail: registries pay nothing, reportedly <5% of servers earn anything, and the official registry README names no consuming client and publishes no usage numbers. Ship `products/mcp-il-tools` as a funnel; do not fund it as a line. |
| **npm package hygiene funnel** | Rejected as a line: ₪0 direct, npm pays nothing. Real as distribution — two of npm's three ranking components (quality, maintenance) are publisher hygiene, so a clean new package is not penalised for being new. Keep as a funnel note. |
| **ERC-8004 agent identity + A2A agent card** | Rejected: 22,000+ registered agents against no measured buyer traffic; a July 2026 scan found 65 agent cards across 22,341 domains, only 10 conformant. On-chain registration burns gas against zero measured demand. The JSON file alone is ~1h and harmless. |
| **Notion Marketplace localized templates** | Rejected: the entire play rests on one unrendered sentence ("only new submissions are considered" for featured refreshes), plus a creator waitlist reviewed by Notion staff on an unbounded timeline. A channel gated behind an unbounded human queue is not agent-operable. |
| **Webflow / Framer template marketplaces** | Rejected: evidence is vendor-adjacent blogs only, no marketplace size, no revenue share, no payout-country data, and both curate submissions — so a mass-produced portfolio would not pass review anyway. Israeli payability UNKNOWN. |
| **Figma Community** | Rejected: every documented ranking input (users, views, saves, likes, comments) is accumulated usage and there is no editorial or "newest" lane. Clean example of a payable platform (Stripe, Israel listed) worth zero to a new entrant. |
| **Cloudflare pay-per-crawl** | Rejected: private beta gated behind "leading industry partners" or a Cloudflare representative — **a human conversation the mission forbids** — no published payout-country terms, and we have no crawl-worthy corpus. |
| **ChatGPT Shopping / Agentic Commerce enrolment for our own stores** | Rejected: US-only with OpenAI business verification of a US entity. Survives only as software sold to US merchants who apply themselves, which scored below the AEO line and duplicates it. |
| **G2 / Capterra incentivised review campaigns** | Rejected as a line (it is a cost, not revenue) and marked **AMBER** as an enabler: the permission is narrow, conditional (nominal, sentiment-neutral, offered to all, disclosed) and known only from snippets. Do not run one until a human reads the current guidelines in full. |
| **Applying AEO to our own shipped storefronts** | Rejected as a *line* — no independent buyer and ~zero traffic to uplift. Keep the 8 hours as hygiene under constraint 2, not as a revenue entry. |

---

## Unresolved payability gates (block proposals, do not block the survivors above)

- **Shopify Partner payouts to Israel — UNKNOWN.** No supported-country list found; virtual accounts
  like Payoneer are reportedly not accepted, which removes the usual Israeli workaround. **Every
  Shopify-App-Store-billed proposal in this group is blocked until a human opens the Partner payout
  page from an Israeli account.** Mitigation is architectural and free: sell direct via Paddle.
- **Apify payouts to Israel — YES, but by absence.** No country restriction appears in the terms and
  payment is PayPal or SWIFT from the Czech Republic; Israel is not *named*. Confirm at first payout.
- **Etsy Payments for Israel — UNVERIFIED**, and moot given three other kills.

## Evidence gaps a human or unblocked agent must close

Priority order. Each one currently carries weight it has not earned:

1. `https://developers.google.com/search/docs/essentials/spam-policies` — all four spam definitions
   in constraint 1 are snippet/mirror grade.
2. `https://apify.com/partners/actor-developers` — first-party confirmation of $1.4M/month and the
   developer count, before anyone plans against ~$470/developer.
3. `https://developer.chrome.com/docs/webstore/program-policies/spam-and-abuse/` — my rendered copy
   self-dates **2022-11-01** from an archived repo. The ban is almost certainly still live, but the
   date must be honest.
4. `https://docs.rapidapi.com/docs/payouts-and-finance` — survivor #4's entire fee and payout model.
5. `https://help.shopify.com/en/partners/manage-account/manage-payouts-invoices/payout-method` — the
   Israel gate above.
6. `https://spiegel.medill.northwestern.edu/how-online-reviews-influence-sales/` — the +270% figure
   that constraint 4 is built on.

---

## Scout quality — reported honestly, because the auditor will check

**Two of eight scouts returned nothing at all.** Six reports reached me; the sweep assigned eight
criteria to this group. I do not know which two criteria went unscouted and I am not going to
invent coverage for them — this group is **6/8 covered at best**.

**A third report arrived truncated.** The `cross-promotion` scout's report cuts off mid-sentence at
its second finding (`"demandEvidence": "SNIPPET, 2026-09-03: ` — and nothing after). Its first two
findings are usable and are folded into constraint 2 and the Apify line; the rest of its work never
arrived. **Effective coverage: 5.5 of 8.**

Within what did arrive:

- **`marketplace-internal-ranking` — thin in five of seven findings.** Its Apify and npm findings are
  excellent and rendered from primary sources. Its **Notion, RapidAPI, Chrome Web Store, Figma and
  Etsy** findings are all self-labelled low confidence and sourced entirely to vendor blogs and
  help-centre snippets — one of them (Notion) rests on a single unrendered sentence. To its credit it
  labelled every one of them itself rather than dressing them up.
- **`AI-answers / AEO` — structurally self-interested sourcing.** Nearly every number it cites is
  published by a company selling AEO tooling or services, and it says so. Its two independent-ish
  sources (Pew on click-through, Adobe on retail conversion) point in opposite directions on whether
  the channel matters at all. Directional only; I priced survivor #2 off *competitor pricing*, which
  I verified myself, not off its traffic claims.
- **`social-proof cold start` — one rendered source carrying six findings.** The Amazon API model is
  genuinely primary and I re-verified it. Every policy clause in the rest of the report — Google,
  Trustpilot, FTC, eCFR, Capterra, Vine pricing — is snippet-grade because those hosts are blocked.
  Its Vine numbers must not be published anywhere buyer-facing.
- **`promotion-at-scale` and `agent-discovery` — the two strongest.** Both went to GitHub for primary
  policy text rather than accepting snippets, both flagged their own gaps, and the agent-discovery
  scout produced the single most useful number in the sweep: it did the arithmetic that kills its own
  best finding. That is the standard.

---

## What I would tell the board

Do **one** thing from this group: the Apify Actor portfolio, built as a factory with an uptime
watchdog, sized honestly at ₪4,000/month. Everything else here is either a constraint that costs
nothing and prevents a catastrophe, or a second-tier line that should not be started until the first
one has produced a real transaction id.

And say the hard part out loud: **this group cannot reach ₪20,000/month.** Its structural ceiling is
set by a lever we are forbidden to pull — roughly half of all AI citations and most marketplace social
proof come from human community participation the owner does not do. That is not a research failure.
It is the answer.
