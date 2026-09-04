# The kill list — what was investigated and rejected, and why

A colony that re-proposes the same dead idea every sweep is not searching, it is looping.
This file is the memory that prevents that. Every entry names what was checked, what killed
it, and what evidence would have to change for it to come back.

**Read this before promoting a candidate.** The sweep's supervisors and board are expected
to check a candidate against this file; a rejection that gets re-proposed without new
evidence is a supervisor failure, not a new finding.

Three standing rules govern entries here:

1. **A rejection needs a reason with a source**, not a hunch. "Probably not worth it" is not
   a rejection, it is an absence of research.
2. **Name what would reopen it.** A market closed to Israel today can open; a policy can
   change. An entry with no reopening condition is either wrong or permanent, and it should
   say which.
3. **Evidence grade travels with the claim.** Much of this repo's research is done from a
   network that cannot open most pages (see `docs/CRITERIA_SWEEP.md`). A rejection resting on
   search snippets is still a rejection, but it says so.

---

## TikTok, as a revenue line — REJECTED 2026-09-03

**Verdict: there is no TikTok revenue surface that is simultaneously (a) open to an Israeli
resident, (b) payable without the owner appearing on camera or speaking to anyone, and
(c) compatible with TikTok's own terms.** Every path fails at least one of the three, most
fail two.

Full report with per-claim confidence: `research/tiktok/01-monetization-israel.md`.

| Surface | Why it is closed |
|---|---|
| Creator Rewards Program | Israel is not on the eligible-country list (~7-8 countries). Doubly closed: the originality rules exclude compilations, reposts, light re-edits and text-to-video slideshows — the native output of an automated pipeline. |
| TikTok Shop (seller / affiliate / digital goods) | No Israel market among ~24 seller markets. Affiliate is residency-gated to those markets. Digital goods are prohibited outside an invite-only codes-based category. |
| LIVE gifts | Region plausibly open, but the LIVE Monetization Guidelines demonetize passive, unattended, static and looped streams — the only kind a machine could run. |
| Subscriptions, Series, Effect Creator Rewards | Published country lists; Israel on none of them. |
| Creator Marketplace | Possibly open to Israel — unverified, sources copy each other. Dead anyway: brand deals mean briefs, negotiation, contracts and invoices, which is a person talking to people. |
| Content Posting API | TikTok "is currently unable to onboard personal accounts or individual developers". Unaudited clients can only post privately (`SELF_ONLY`). |

**The arithmetic, for the record.** Even in the counterfactual where Creator Rewards were
open to Israel: ₪20,000/month ≈ $5,400, and at a creator-reported $0.20-$1.20 RPM that is
roughly **6.75 million qualified views every month**, forever, from content the programme's
own originality rules exclude.

**What remains legitimate:** TikTok as unpaid top-of-funnel to a product we own — and even
that is constrained by the ToS clause barring automated interaction and by the posting-API
gate, so it cannot be an automated posting pipeline.

**Explicitly forbidden, so that no future session proposes them as clever:** VPN or region
spoofing to fake eligibility; buying or renting aged accounts; unofficial posting bots;
account farms and coordinated cross-posting; listing digital goods in categories that forbid
them; publishing AI-generated content without the required label. Each of these is a terms
violation, and the constitution in `MISSION.md` outranks the revenue target.

**What would reopen it:** TikTok adding Israel to the Creator Rewards or Shop country lists,
or opening the Content Posting API to individuals. Re-check the five claims marked 🟡 in the
report from a network that can reach TikTok's own domains before acting on any of it.

**Evidence grade: snippets only.** The research network blocked every `*.tiktok.com` host, so
no TikTok policy page was opened directly. The country-list findings are consistent across
many independent sources and are graded high confidence; the Creator Marketplace question is
explicitly unresolved.

---

## Automated faceless-video pipelines, as a revenue line — REJECTED 2026-09-03

The owner sent https://github.com/harry0703/MoneyPrinterTurbo and asked us to find things
like it. We did, in depth. Full report: `research/tiktok/06-faceless-video-tooling.md`.

**The tool is real.** 120,072 stars, 18,388 forks, MIT, pushed 2026-09-02, 17 open issues.
Pipeline: topic → LLM script → TTS → Pexels/Pixabay/Coverr clips → subtitles → ffmpeg MP4 →
optional auto-publish, across 15+ LLM and 9 TTS providers. This is not a screenshot with a
Gumroad link; the engineering is sound. The class also includes MoneyPrinterV2 (31.8k★,
AGPL), MoneyPrinter (13.9k★), ShortGPT (7.9k★), and a separate *repurposer* tier — OpusClip,
Klap, Submagic — which needs a human creator upstream and is therefore a different thing.

**It is rejected as income for five independent reasons, each sufficient on its own:**

1. **No pipe to us.** Israel is not eligible for TikTok Creator Rewards (see the TikTok
   entry above), so that platform cannot pay us at all.
2. **YouTube's policy defines this output as ineligible.** The 2025-07-15 rename of
   "repetitious content" to **"inauthentic content"** covers "repetitive or mass-produced
   content". Israel *is* YPP-eligible, so this is where the policy actually bites: the
   output of a one-click generator is the named category, not an edge case.
3. **Enforcement targets our exact shape.** Google's published spam-cluster detection groups
   channels by synchronised upload schedules, templated formats and shared infrastructure,
   and terminates whole networks — roughly 50,000 clusters and 130,000 channels in six
   months. "Many agents, one codebase" is this classifier's canonical positive example. In
   January 2026 YouTube removed 16 channels holding 35M subscribers and 4.7B views in a
   single action.
4. **The arithmetic fails even if paid.** Shorts RPM of roughly $0.01-0.07 per 1,000 views
   means about **77 million views a month** for ₪20,000.
5. **The licensing trap is structural.** Pexels' API guidelines require a prominent Pexels
   link and photographer credit on every API-sourced use and forbid systematic bulk copying;
   no generated video honours this. Free stock carries no model releases, so a machine-written
   script over a machine-picked clip of an identifiable person is the highest-probability
   legal exposure in the class.

**And the receipts do not exist.** 120k stars over two and a half years, and the scout found
**zero verified earnings reports**. One review site openly admits it never benchmarked
earnings. Reach is real — a sample of ~15,000 trending channels found 278 pure-slop channels
with 63 billion views — but reach we cannot honestly convert is a statistic about other
people's risk appetite, not a business.

**Hebrew, specifically.** MoneyPrinterTurbo's own `docs/voice-list.txt` carries 494 voices, of
which exactly **two** are Hebrew (`he-IL-AvriNeural`, `he-IL-HilaNeural`). Its issue #1205
documents no RTL directionality and no suitable fonts, unanswered by the maintainer. Hebrew
subtitles do not work out of the box — and Hebrew is our entire audience. On TTS: ElevenLabs
v3 (Creator, $22/month) is the only engine worth our name on it, and it reportedly mishandles
mixed Hebrew-English, which is exactly our content; Google Chirp 3 HD is the safe-but-flat
option; **free Edge TTS is a Microsoft terms grey area and must not be used commercially.**
At volume the honest answer is captions and no narration.

**What is NOT rejected: the same tooling as a distribution channel.** Our own screen
recordings of our own tools, our own expertise, low volume, reviewed before publishing,
captions rather than synthetic narration. That is ordinary marketing: it dodges all five
traps, and we are paid by customers rather than by views. Use the repurposer tier ($0-22/month),
never auto-posting. Ranked honestly by effort-to-reach for our audience:
**Google/SEO > Facebook groups > LinkedIn > YouTube > TikTok.**

**Named traps, so no future session rediscovers them as clever:**
- *"Just make 50 channels"* — turns marketing into a spam cluster and invites network-wide
  termination. It is the failure mode, not the scale-up.
- *"Sell the pipeline to Israeli creators"* — charging people for a route into demonetisation.
  A constitution violation, not a product idea.
- *"But it gets 63 billion views"* — see above.

**What would reopen it:** a platform paying Israel for content this pipeline can legally and
honestly produce, plus Hebrew RTL support that works, plus a TTS licence that permits
commercial use. All three, not one.

**Evidence grade: mixed.** GitHub metrics and the repo's own files were read directly. Vendor
pricing pages were egress-blocked and are medium confidence. The TikTok-Israel ineligibility
is the one load-bearing fact the scout could not source first-party and is flagged for
re-verification.

---

## Two standing walls in the Israeli-bureaucracy space — established 2026-09-03

Not rejections of a single idea, but constraints that kill whole families of them. A candidate in
this space must clear both before it is ranked. Source:
`research/colony-sweep/groups/israel-bureaucracy.md`.

**1. The Tax Authority is a gate, not a platform.** Every idea that *calls* the ITA — requesting
allocation numbers, transmitting VAT reports, pulling withholding certificates, filing refunds —
dies on software-house registration plus signed documents plus a discretionary approval, or on a
licensed מייצג / יועץ מס. These are not one-time KYC steps the owner can do once and be finished
with; they are ongoing human and professional dependencies, which MISSION §1 puts out of scope.
Build *around* the ITA, never *into* it.

**2. The state is our free competitor, and that is not a pricing problem.** The ITA publishes a
free allocation-number request service, a free supplier-invoice verification service, a free
PCN874 simulator, a free work-grant eligibility checker and a free personal-import calculator;
Bituach Leumi publishes its own simulators. Anything we charge for must be something the state
publishes only as HTML or PDF, or must be bulk, automation or export — never the single answer a
citizen can already get free. **Charging for a free answer is a constitution violation, not a
pricing decision.**

**The ceiling, and then the audited ceiling.** The supervisor put the whole group at
₪4,000-7,000/month at maturity with its best single build — a PCN874 builder — at about ₪2,500.
Its auditor (`research/colony-sweep/audits/israel-bureaucracy.md`) cut that build to **₪300-600
at 12-month maturity and ₪0 in month one**, and the three reasons all hold up:

- The supervisor's own `firstStep` told a builder to check that **`validatePcn874()`** covers the
  needed record types. The auditor rendered the package: its only exports are `EntryType` and
  `pcnGenerator`. **The function does not exist.** It is a fabricated symbol inside an instruction
  written to be executed verbatim — and this group had flagged exactly that failure in someone
  else's public skill ("a fake Amendment 157 and invented endpoints") before committing it.
- The open-source accelerator it leaned on is frozen at 0.4.1 from **February 2024**, with
  validation still in its TODO, and it predates the entire allocation-number era — no
  allocation-number field at all.
- The buyer is being eroded from both sides, and both erosions sit in the supervisor's own top
  source. The ITA already exempted this cohort from itemising invoices under ₪5,000 (aggregate
  under fixed supplier code 77777772) and lets an individual osek **defer the whole obligation to
  1.1.2027** — which removes the product's two selling points, complexity and deadline. Meanwhile
  the allocation-number ladder reaching ₪5,000 on 1.6.2026 pushes the same cohort into invoicing
  suites, **and every suite that solves allocation numbers already emits PCN874**.

The group's own conclusion stands and gets stronger: this is the colony's home turf and **it
cannot reach ₪20,000 on its own.** It earns credibility and traffic that other groups monetise.
Treating it as the flagship would be a mistake — recorded so no future session quietly re-assumes
it.

**The unpriced risk the whole group carries.** A wrong PCN874 is a wrong VAT filing, and the harm
lands on the user, not on us. No line here carries a disclaimer, an accuracy bound or a liability
analysis, while a Paddle refund policy is a binding commitment. In a group whose entire product
surface is regulated numbers derived from search snippets, that is the largest thing nobody
costed.

**Evidence grade: the worst in any group so far, and not the scouts' fault.** gov.il, btl.gov.il,
kolzchut.org.il, data.gov.il, ica.justice.gov.il and every Israeli vendor domain are egress-blocked.
Nine agents rendered zero primary Israeli sources. What carried the group was GitHub code and repo
search, which is unblocked and free — future scouts on Israeli criteria should lead with it.

---

## Paid advertising, at any budget — REJECTED 2026-09-03

Not "too expensive for now". **Structurally incompatible with the portfolio model**, and it would
stay that way if the float were a hundred times larger. Full working:
`research/colony-sweep/scouts/store-promotion--paid-acquisition-floor.md`.

**The budget argument, briefly.** ₪200 is about $54. At Meta's practical floor of $50-150/day it
buys 0.4 to 1.1 days; Google Ads needs $1,000-2,500/month before its campaigns have enough data to
learn, so ₪200 is 5.4% of one month at the low end and 1.1% of what Smart Bidding wants.

**The argument that matters.** These platforms optimise against conversion volume. A new store has
no conversion history, so a sub-threshold budget is consumed entirely by the learning phase and
produces **no signal at all** — a threshold effect, not a linear one. Spending less does not buy a
smaller result; it buys nothing.

**And the portfolio arithmetic closes it.** Paid acquisition is a recurring per-store cost, which
is the exact opposite of MISSION constraint 1. At even $1/day per store: 100 stores is
$3,000/month, and 878 stores — the count the final goal requires — is **$26,340/month against a
target of ₪83,333 (~$22,500)**. The cheapest possible ad spend on every store exceeds the revenue
those stores are meant to produce.

**What would reopen it:** a single line earning enough to fund its own ads above the learning
threshold, judged on that line's own ledger. Never a portfolio-wide ad budget, and never the
owner's float.

**Evidence grade: snippet.** Platform pages are egress-blocked; the figures come from marketing
blogs citing them, and they agree with each other. The conclusion survives an order-of-magnitude
error in any single figure. LinkedIn, Telegram Ads and the Israeli networks are unchecked — they
do not change the portfolio argument, which is platform-independent.

---

## The store-promotion sweep — nineteen rejections, 2026-09-03

The `store-promotion` group asked one question: how do we promote hundreds of storefronts
without a human and without becoming spam? Its answer was that **almost nothing in the
category survives**, and the value of the group is this list plus the six constraints that
came with it. The constraints are code now — `src/revenue/constraints.ts`, screened against
the shipped portfolio by a test — because a rule that lives only in a report gets re-argued
every sweep. Full report: `research/colony-sweep/groups/store-promotion.md`.

**The structural finding, which outranks every entry below.** Roughly 40% of AI citations
and most marketplace social proof come from human community participation. That lever is
closed to us by the mission itself, not by a policy we might route around. It is the ceiling
on this whole group. **This group cannot reach ₪20,000/month.** That is a finding, not a
research failure, and it should not be re-attempted from a different angle.

**The supervisor's ceilings did not survive audit, and the audited numbers are the ones to
plan against.** The supervisor summed its five survivors to ≈₪15,500/month while its own
headline said "almost no money here" — 78% of the target from a group it had just called
empty. The auditor corrected the same five to **₪3,000/month combined, and ₪0 in month one
for every one of them** (`research/colony-sweep/audits/store-promotion.md`). It also found
twelve errors in the report, including a selective quotation that dropped `popularity` from
Apify's own sort options — the one value contradicting the report's central claim.

| Rejected | Why | What would reopen it |
|---|---|---|
| **Chrome Web Store extension portfolio** | RED, structurally banned. Verified verbatim: no developer, related account or affiliate may submit multiple extensions with duplicate experiences or functionality. The minimum-functionality policy separately bans "template extensions that only vary slightly". Dead twice over. | Google removing the duplicate-experience clause. The rendered copy self-dates 2022-11-01 from an archived repo, so a human should confirm the live text before anyone quotes the date. |
| **Chrome Web Store, one extension** | Not policy — ranking. Install-count-locked with no documented cold-start lane, and Google publishes nothing official about how ranking works. The ceiling is not defensible. | Google publishing ranking inputs a new listing can influence. |
| **Multi-shop Etsy / print-on-demand** | RED. The entire operator literature above ~5 shops is about defeating Etsy's account-linking detection — anti-detect browsers, separate payment instruments and addresses. That is manipulation of platform processes. Ranking is also conversion-history-locked, and Israeli payability is unverified. Three independent kills. | Nothing at portfolio scale. A single shop is a different question and is not rejected here. |
| **Amazon Merch on Demand** | The tier ladder starts at 10 live designs and advances only by sales; Israel appears on no eligible-marketplace list we saw; the application is human-reviewed. | Israel appearing on the eligible list. |
| **Amazon Vine** | Requires Brand Registry, which requires a registered trademark — a multi-month human and legal process. Sanctioned, but out of reach. | The owner registering a trademark, which he has not been asked to do and which the mission does not require. |
| **Ad-monetised storefront portfolios (AdSense / MFA)** | AdSense forbids pages with more advertising than content, and the made-for-advertising ecosystem is blocklisted advertiser-side. There is no honest demand side. | Nothing. The model requires the thing the policy prohibits. |
| **Shopify / WooCommerce review-request SaaS** | The price floor is zero. Judge.me's Forever Free plan is verified to include unlimited orders *and* unlimited review requests, against a single flat $15 tier. The only differentiator anyone still markets is review gating, which is RED in five regimes at once. | Judge.me metering its free tier. Even then the gating constraint stands. |
| **llms.txt as a service, or a generator for it** | Selling a placebo. 97% of published files are never fetched; crawlers do not probe for it on domains that lack it; OpenAI fetched robots.txt 3,990 times against llms.txt 7. Google has said it affects neither Search nor AI Overviews. | A major assistant publishing that it reads the file, *and* fetch counts on our own domains showing it. The counts are the test, not the announcement. |
| **Reddit / YouTube citation seeding** | RED, permanently. Astroturfing under Reddit's content policy and under our own constitution. | Nothing. |
| **x402 Bazaar listing, as a revenue line** | Ceiling. The entire registry turned over 302,072 calls in 30 days at a $0.01 median — about $3,020/month gross shared by 1,772 providers, roughly ₪6 per provider per month, with 91.2% of listings failing to reach 10 calls a month. Verified first-hand. Issue #2112 is open with no maintainer response and indexing appears broken for external EOA payees, which is our configuration. | Registry volume rising by two orders of magnitude. Keep the one-hour config change as hygiene; never model revenue from it. |
| **MCP server on the public registries, as a line** | Ceiling ₪300 and no rail: registries pay nothing, reportedly under 5% of servers earn anything, and the official registry README names no consuming client and publishes no usage numbers. | A registry shipping a payment rail, or a named client publishing install numbers. Ship `products/mcp-il-tools` as a funnel meanwhile — that decision stands. |
| **npm package hygiene, as a line** | ₪0 direct. npm pays nothing. | Nothing — but it is real as *distribution*: two of npm's three ranking components (quality, maintenance) are publisher hygiene, so a clean new package is not penalised for being new. Kept as a funnel note. |
| **ERC-8004 agent identity + A2A agent card, as a line** | 22,000+ registered agents against no measured buyer traffic. A July 2026 scan found 65 agent cards across 22,341 domains, only 10 of them conformant. On-chain registration burns gas against zero measured demand. | Measured buyer traffic arriving through an agent registry. The JSON file alone is ~1h and harmless, so ship that if it is ever cheap to. |
| **Notion Marketplace localized templates** | The whole play rests on one unrendered sentence about featured refreshes, plus a creator waitlist reviewed by Notion staff on an unbounded timeline. A channel gated behind an unbounded human queue is not agent-operable. | The waitlist closing, or Notion publishing a review SLA. |
| **Webflow / Framer template marketplaces** | Evidence is vendor-adjacent blogs only: no marketplace size, no revenue share, no payout-country data. Both curate submissions, so a mass-produced portfolio would not pass review regardless. Israeli payability UNKNOWN. | Primary docs on revenue share and payout countries. |
| **Figma Community** | Every documented ranking input — users, views, saves, likes, comments — is accumulated usage, and there is no editorial or "newest" lane. A clean example of a payable platform (Stripe, Israel listed) that is worth zero to a new entrant. | A newest or editorial surface appearing. |
| **Cloudflare pay-per-crawl** | Private beta gated behind "leading industry partners" or a Cloudflare representative — **a human conversation the mission forbids** — with no published payout-country terms. We also have no crawl-worthy corpus. | Open self-serve signup with published terms. |
| **ChatGPT Shopping / Agentic Commerce enrolment for our own stores** | US-only, with OpenAI business verification of a US entity. | Israel becoming eligible. It survives only as software sold to US merchants who apply themselves, which scored below the AEO line and duplicates it. |
| **G2 / Capterra incentivised review campaigns** | Rejected as a line — it is a cost, not revenue — and marked **AMBER** as an enabler. The permission is narrow and conditional (nominal, sentiment-neutral, offered to all, disclosed) and known to us only from snippets. | A human reading the current guidelines in full. Until then, do not run one. |
| **Applying AEO to our own shipped storefronts, as a line** | No independent buyer and roughly zero traffic to uplift. | Nothing — but keep the ~8 hours as hygiene under the one-domain constraint, not as a revenue entry. |

### Payability gates this group opened and could not close

- **Shopify Partner payouts to Israel — UNKNOWN.** No supported-country list found, and virtual
  accounts such as Payoneer are reportedly not accepted, which removes the usual Israeli
  workaround. **Every Shopify-App-Store-billed proposal is blocked** until a human opens the
  Partner payout page from an Israeli account. The mitigation is architectural and free: sell
  direct via Paddle.
- **Apify payouts to Israel — YES, but by absence.** No country restriction appears in the terms;
  payment is PayPal or SWIFT from the Czech Republic. Israel is not *named*. Confirm at first payout.
- **Etsy Payments for Israel — UNVERIFIED**, and moot given three other kills above.

### The four that survived audit, so this list is not read as "nothing works"

Supervisor's ceiling → audited ceiling:

- **Apify Store multi-Actor portfolio** — ₪4,000 → **₪1,500**. Apify pays $1.4M/month across ~3,000
  developers, a mean of ~$470 (~₪1,730) on a power-law distribution, so the median earns far less
  and the supervisor had set a brand-new entrant above the mean of everyone already there. The
  "zero-run listings are not structurally invisible" claim is also overstated: `how_store_works.md`
  says store search ranking correlates with the quality score, whose categories include Popularity
  (users, saves, return usage) and History of success. Five of eight categories are controllable on
  day one — disadvantaged, not invisible, and not the clean exception the report claimed.
- **Hebrew-first AI-answer visibility monitoring** — ₪4,000 → **₪0-500**. The price floor is zero,
  not $29: Semrush's checker is free with three checks a day and no account, Ahrefs' is free, and AI
  Rank Lab gives 25 free prompts — all covering more engines than the proposed 15-prompt, two-engine
  product. This is the exact test the supervisor used to kill the Shopify review SaaS and did not run
  on its own candidate.
- **WordPress.org plugin with a Paddle Pro tier** — ₪4,000 → **₪1,000**. Guideline 5 forbids
  trialware outright: no code inside a directory-hosted plugin may be locked behind payment. Building
  it compliantly means the Pro code ships outside the directory, which is a real design constraint the
  report never mentioned. The review queue stood at 4,715 plugins, 3,854 older than a week.
- **RapidAPI Hub as a second storefront for the existing Israeli endpoints** — ₪1,500 → **₪500**, and
  ₪0 for at least 90 days: 25% marketplace fee since 15 Nov 2025, PayPal-only payout, and a documented
  ~60-day payout lag on top.

**The Amazon Solicitations API review agent was ranked fifth and is now rejected outright.** The API
property is real — the seller supplies no message body, so it cannot be built dishonestly. But
registration needs an Amazon Professional selling account at **$39.99/month, recurring**, against this
repo's ₪200 total enforced budget, and Amazon seller identity verification is commonly a **live video
call**. MISSION.md says the owner does not appear on camera. That is a mandate violation, not a KYC
carve-out, and no ceiling makes it eligible.

**Two things the group missed that outrank all four.** Its own `cross-promotion` scout wrote the
refutation of the entire ranking: "cross-promotion is a multiplier on traffic, and a multiplier on
zero is zero — the colony's acquisition problem is upstream of this criterion." And four of the five
survivors have nothing to do with Israel or Hebrew, so they compete with the whole world on generic
ground, while the one that uses our actual asset has no distribution. The obvious candidate the
ranking never constructed is the intersection: Israeli-dataset Actors on Apify Store, extending
`products/apify-il-open-data`, where the niche is thin and the knowledge is already ours.

> **Correction, 2026-09-03, from `research/colony-sweep/audits/productized-services.md`.** That
> last sentence is wrong and it was repeated across this repo. **Someone already constructed the
> intersection.** `apify.com/swerve/supermarket-prices` is an Israeli statutory price-file scraper
> across 25 chains, normalising portal dialects into one schema, refreshed daily — and the same
> creator runs `swerve/madlan-analytics` and `swerve/yad2-scraper`. That is an Israeli-dataset
> Actor portfolio, already on the Store. The niche is not thin and it is not unoccupied.
> *(Snippet grade: `apify.com` is EGRESS_BLOCKED here, so the listings were seen in search results,
> not rendered. A human must open the first URL to close it — but a claim that a niche is empty
> cannot survive the first search finding it occupied.)*

---

## The risk-governance group produced no revenue line — audited 2026-09-03

Its supervisor ranked three candidates. Its auditor cut all three, and the numbers are the
point: **₪150, ₪200 and ₪0 of ceiling, all three UNKNOWN rather than YES on Israeli
payability.** This never reached the kill list until now, which is a fold-in failure, not a
research one — the audit is dated the same day as the group report and sat in
`research/colony-sweep/audits/risk-governance.md` unused.

**The group's real output was never a portfolio.** It is the owner-KYC catalogue, the Apify
finding that KYC gates Actor *pricing* and x402 eligibility rather than only payout, and the
governance standards the rest of the colony inherits. Those are worth more than the three
candidates were, and the group should be read that way.

| Rejected | Why | What would reopen it |
|---|---|---|
| **Browser-only Hebrew document redaction** | Downgraded to ₪150/month, and the moat argument is a category error. The supervisor ranked it partly because the best Hebrew NER prior art is a 0-star student project — but the product's own identifiers (ת״ז, phone, IBAN, email, address) are regex and checksum work, not NER, so Israeli NER is irrelevant to four of the five. Worse, **the detector already exists in this repo**: `products/x402-il-api/src/israeli.ts` implements the ת״ז checksum, the full phone regex set and the Bank of Israel institution codes. The claimed technical moat is already written and already open source. | A measured buyer. The Hebrew gap in Presidio, `wuming` and `worka-ai/pii` is real and independently confirmed — what is missing is anyone paying for it. |
| **WordPress AI-disclosure plugin** | Downgraded to ₪200/month, ToS GREEN → AMBER, and the number is not a corrected estimate — it was derived from the wrong instrument. The supervisor reasoned from GitHub stars while its own `firstStep` said the right metric is `active_installs`; WordPress users install from wp-admin and never see GitHub. Both `api.wordpress.org` and `wordpress.org` are egress-blocked, so **demand here is entirely unmeasured**. The lead competitor is also far stronger than reported: `eu-ai-act-ready` is at v2.2.3 with 76 commits, WPML translations and a commercial domain. | An `active_installs` reading from `api.wordpress.org`, from a network that can open it. Until then there is no demand number at all, in either direction. |
| **C2PA / IPTC provenance-signing API** | Refuted to ₪0. The make-or-break question — whether a solo Israeli operator can obtain a trust-listed signing certificate — is unresolved and unresolvable from here, and the supervisor said itself that this is "not a detail, it is the whole product". The one new datum points the wrong way: `contentauth/c2pa-mcp` refers to curated "Interim Trust Lists". The demand evidence is a repo with 2 commits, abandoned four days after creation. And hosted signing means holding customers' media on our servers, which contradicts the zero-PII standard this same group published and the reasoning that made DSAR SaaS RED. | A published, self-serve route to a C2PA trust list for an individual. Not a research question — a policy change. |

**The pattern worth naming.** In both audited groups the supervisor ranked a candidate it had
already argued against in its own text — here, "last, and I would not start it" followed by a
rank; in `store-promotion`, a line whose price floor it had just proved was zero. A ranked list
with a floor of six invites padding. The instruction to supervisors is "at most 6 survive", and
it should be read as a ceiling only: **a group whose honest answer is one line, or none, must
say so.**

---

## The payment-rails group earns nothing either — audited 2026-09-03

The same fold-in failure as `risk-governance`: the audit has been on disk since the group
report and nothing had read it. Its verdict on six candidates: **zero confirmed on external
evidence, one confirmed on reasoning, five downgraded, and all six ceilings corrected to ₪0.**
One `israelPayable` corrected from YES to UNKNOWN (Payoneer). It also opened four cited URLs
and found that they do not support the claims attached to them.

**The correction that matters most is not a rejection — it is a schedule.** The group's headline
was "payment rails are not the bottleneck; demand is", and this repo has been repeating it. The
auditor's reading, which the evidence supports:

> The critical path is not "four one-time owner steps". It is **one** owner step (the tax file),
> then a **Paddle application that may be refused**, then roughly **10–16 hours of
> webhook-to-ledger engineering that no entry budgeted**. Until then this colony's rails carry
> ₪0 and the ledger stays empty.

That is not an argument against starting. It is an argument against believing money begins to
move the moment the owner finishes his checklist. `src/revenue/ledger.ts` already has the
`(source, external_id)` uniqueness machinery those rails have to feed, and **not one candidate
in the group referenced the schema it would have to write into** — which is how a rail can look
finished and deliver nothing.

The group's own honest self-assessment — it said out loud that almost nothing was rendered — is
its best feature, and the auditor said so.

---

## `productized-services` — one ranked line, refuted to ₪0, audited 2026-09-03

The audit is at `research/colony-sweep/audits/productized-services.md`. Its supervisor was the
most disciplined so far — it counted its scout files rather than asserting coverage, and it killed
five criteria correctly on a price-floor-of-zero test. Then it did not run that test on its own
number one, which is the same error the `store-promotion` audit recorded one group earlier.

**The ranked line — Israeli statutory price-transparency data sold pay-per-event on Apify — is
₪0, twice over:**

- **The price floor is zero.** The same GitHub organisation whose scraper the supervisor read,
  `OpenIsraeliSupermarkets`, also runs `daily-publish-supermarket-data` — a cron job publishing a
  **new Kaggle dataset version every midnight** — plus a public website, a public API host, a
  FastAPI REST server, and a status page monitoring all three. The free alternative is not a
  library the buyer must operate; it is already-parsed data, versioned daily, with an API. The
  proposed product is a strictly smaller offer at a strictly higher price.
- **The slot is taken.** See the correction above: `swerve/supermarket-prices` already ships this
  exact specification.

**And it was never net-new anyway.** The report conceded the line is a slice of the ₪1,500 Apify
ceiling this file already assigned to `store-promotion`. A board reading the ranked list would
have added ₪500 to the portfolio total. It must not.

**What survived is worth more than the ranked line**, and two items are now acted on rather than
filed:

1. **Freemius belongs in the rails catalogue** — Israeli-founded, ILS payouts with no conversion
   fee, pays by Wire / Wise / Payoneer / PayPal, fully self-serve checkout with no buyer contact.
   The supervisor found it, said it "should outlive this group", and then left it in a section
   grading its own scouts. Our Israeli rails are thin (PayPal, now with 18% VAT on fees;
   Payoneer; Etsy/Gumroad ILS deposit), and MISSION requires that one rail failing does not take
   the company down. It is now recorded in `src/revenue/rails.ts`.
2. **The group's structural finding:** in this category the engine is always free and the paid
   layer is always brand and sales. That is a rule about where our software can and cannot earn,
   and it survives the rejection of every candidate under it.

**The single action the auditor asked for, and it is the right one:** publish
`products/apify-il-open-data` free, today, and count runs from strangers for 30 days. Zero owner
involvement, zero build, zero money — and every Apify ceiling in this repo, ₪1,500 and ₪500 and
₪3,000 alike, resolves either to ₪0 or to a measurement on its result. It is the cheapest test of
MISSION constraint 7 anywhere in the project.

---

## `agent-markets` — the negative findings are the best in the sweep, the positive one is refuted, audited 2026-09-03

The audit is at `research/colony-sweep/audits/agent-markets.md`. Its supervisor read a smart-contract
config and a JSON schema instead of marketing copy, ranked exactly one line out of eight criteria,
and said plainly that seven produced nothing. Seven of its eight rejections are well-sourced and
hold. Its one ranked line does not survive two searches.

**The decisive finding, and it is the second time today two auditors reached it independently:
Israeli data on Apify Store is not unoccupied ground.** The ranked line rested on the sentence
"the scout's searches for Israeli government open-data Actors returned no competitor". Apify Store
already carries at least five Israeli-data Actors — **two of them wrapping the identical
`data.gov.il/api/3/action/datastore_search` endpoint our own shipped product wraps**, one priced at
$7.50 per 1,000 results, and one advertising coverage of **33 Israeli data sources**, which is more
than the supervisor's own estimate of how many distinct Israeli datasets exist to serve.

With the "no competitor" premise gone, the Hebrew-schema moat and the supply estimate go with it,
and what remains is a paid convenience wrapper over a free, keyless, documented public API.
Corrected ceiling **₪600 → ₪200/month at twelve months, ₪0 for the first nine** — below the sweep's
own ₪300 rejection bar, so by the group's own rule it should have been rejected rather than ranked.
*(Snippet grade: `apify.com` is EGRESS_BLOCKED, so these are canonical Store URLs and their search
descriptions. That is enough to refute a claim of absence.)*

### Two facts from this audit that outlive the rejection

1. **Apify prohibits the funnel play by name.** Store Publishing Terms §2.2.4.2(i), rendered from
   Apify's own docs repo: a publisher may not *"directly or indirectly offer, link to, or promote
   any product or service outside of the Platform in your Actors or in any other content you
   publish on Apify Store."* Two lines in this repo rested partly on a listing being a funnel and
   neither had read the terms. This is now the seventh promotion constraint in
   `src/revenue/constraints.ts`, written as a per-platform check rather than a fact about Apify:
   an app store, a plugin directory and a registry all have a reason to stop a listing exporting
   its buyer.
2. **KYC is the fifth agentic-payments requirement**, not just a payout gate: *"The Actor's
   developer must have finished identity verification (KYC). Until this verification is complete,
   their Actors remain ineligible."* Already reflected in the `apify-actors` owner setup.

The Store Publishing Terms also carry **no country or jurisdiction restriction of any kind** — the
auditor confirmed the absence directly, which strengthens the Israel-payable verdict this repo has
been treating as inferred.

---

## `bounties-grants` — keep the framing, kill the numbers, audited 2026-09-03

The audit is at `research/colony-sweep/audits/bounties-grants.md`. Its supervisor produced the best
framing in the sweep — it refused to score on headline prizes and scored on what a line can produce
every month, which is the right instinct against a monthly target: a ₪90,000 grant that lands once
is a cash event, not an income line. Then three of its five ceilings turned out to rest on numbers
that appear nowhere in its own evidence.

**Corrected total: ₪7,800/month → ₪800/month at twelve months, with ₪0 in month one on every line.**

| Refuted | Why |
|---|---|
| **Base / Talent Protocol Builder Rewards** | The base rate was invented — its own scout said so first — and the ceiling it was given **exceeds what the top of the entire Base leaderboard receives** at any plausible ETH price. Its `firstStep` is also the group's only spend proposal: a mainnet deploy plus a Basename registration, paid from the ₪200 float, on a line whose corrected ceiling is about ₪60/month and whose own scout wrote "do not build for this". |
| **Tenstorrent tt-metal bounties** | The `firstStep` points at an issue **someone else has already submitted a PR for**. |
| **Kaggle Community Competition Creator Prize** | A programme that ran for five months in 2022. |

### What survives, and two of them are worth more than the ceilings were

1. **The structural findings hold.** Prizes are not revenue. The authorised bug-bounty branch is
   dead on platform terms rather than economics — HackerOne bans automated report delivery outright
   and Bugcrowd requires a live webcam selfie before a single submission, which is our operating
   model prohibited twice. And 2026 is the year open source turned against agent-authored
   contributions: curl closed its bug bounty after 20 AI-generated non-vulnerabilities in 21 days.
   Any bounty line needs an intake filter excluding repos hostile to AI contributions — the Algora
   filter is the group's one reusable artefact.
2. **Free-inference tiers are the finding that changes the company's arithmetic**, and the report
   put them in its rejection table. Google AI Studio (1M tokens/day) and Cloudflare Workers AI
   (10k neurons/day) cut **the colony's only cost that scales with traffic**, with **zero owner
   blockers** — no company, no application, no KYC. That is real ₪/month against MISSION constraint
   1, it belongs to no other group, and nobody has to win anything for it to pay.
3. **TaskBounty and the agent-native bounty category were dropped without a word**, despite the
   scout naming it as structurally different because payout is gated on automated sandbox
   verification rather than a maintainer's mood.
4. **This is the only group whose rails are genuinely independent** — PayPal/Payoneer/Wise, Stripe
   Connect Express, and a self-custodied wallet. MISSION requires that one rail failing cannot take
   the company down, and this group satisfies it better than any other and never claimed the credit.

### Two things nobody priced, and they apply to the whole group

**Every line pays the owner as a natural person.** Thirty percent US withholding by default without
a W-8BEN, Israeli personal income tax on foreign prize income, transfer fees and ILS conversion on
top. All five ceilings were gross, some by a large margin.

**And it is not clear this money is bookable at all.** MISSION counts money only "in the ledger with
a real platform transaction id". A hackathon prize arrives as a PayPal transfer initiated by a
sponsor's finance team; a Tenstorrent bounty by an unspecified rail. Whether either produces a
platform transaction id — and if not, how the ledger and the manager's screen record it honestly —
is unanswered, and it applies to every line here.

### The one place constraint 7 comes out favourable

This is the only group in the sweep where the acquisition constraint points the right way: **a prize
sponsor announces the event and publishes the judging, so the buyer finds us rather than the
reverse.** The report was entitled to make that argument and did not. It is rare enough in this
sweep to be worth naming.

---

## `crypto-native` — zero rankable lines, confirmed; four reasons corrected, audited 2026-09-04

The audit is at `research/colony-sweep/audits/crypto-native.md`. Its verdict on the ranking is the
same as its supervisor's — **no line in this group reaches ₪300/month, and the auditor found nothing
the supervisor missed that would.** But it reached that verdict partly by luck, and **a wrong reason
is a re-open trigger nobody notices**, which is why the corrections matter more than the confirmation.

### The x402 numbers do not reconcile, and this repo now holds three of them

| Figure | Source | Implies |
|---|---|---|
| ~$800k/day at ~$0.32/call | what `portfolio.ts` carried after a correction on 3.9 | large market |
| ~$37k/day | **x402scan**, the ecosystem's own explorer: $1.11M across 3.69M transactions in 30 days, May 2026 | small market |
| ~$3,020/month network-wide | the Bazaar registry's own 30-day series, 302,072 calls at a $0.01 median across 1,772 providers, verified first-hand | tiny market |

They differ by more than an order of magnitude and **cannot all be right**. Nobody has reconciled
them, and this file previously presented the first as settled. What all three agree on is the only
thing the decision needs: **per-provider revenue is single-digit shekels a month**, and 91.2% of
listings never reach ten calls a month. The `paid-apis` basis now carries all three side by side
rather than the most flattering one.

The auditor also caught a method problem behind this: the supervisor's two most load-bearing numbers
came from **two anonymous, unaudited GitHub markdown files**, and it wrote "CONFIRMED" against them.
What was confirmed is that the files say what the scout said they say — not that the numbers are
true. "Quoted accurately" and "verified" are different claims and the sweep has been conflating them.

### BILS — the one 2026 development that would change this group's shape, and it was in a single clause

The supervisor dismissed it as "institution-only". That holds today. What the group never rendered:
**BILS is live, 1:1 shekel-backed with reserves in segregated Israeli bank accounts, audited by EY,
custodied through Fireblocks, issued on Solana by a CMA-licensed financial asset service provider
(Bits of Gold), approved April 2026 after a two-year review.** That is a shekel-denominated on-chain
settlement rail that exists.

**If BILS opens beyond the institutional pilot, this group's central finding — "the rail pays but
there is no shekel-native buyer" — changes shape.** It is now a re-open trigger.

### The Israeli crypto tax-report line was killed on a number that does not hold

The stated reason was that Israel's crypto voluntary-disclosure window drew "a reported 58 filers".
The auditor could not corroborate that figure at all in Hebrew or English, and **it is the wrong
denominator even if true**: voluntary disclosure (גילוי מרצון) is a criminal-immunity procedure for
people confessing past undeclared holdings. It counts confessions, not compliance. The buyer of a
tax-report tool files a normal annual return with crypto gains — a different population entirely.

And the group missed the largest demand event in the space: **CARF**. Israel is among the 48
jurisdictions where crypto-asset service providers began collecting customer and transaction data on
**1 January 2026**, with the first cross-border exchange landing in **2027**. Israeli holders are
about to become automatically visible to the Tax Authority, which is precisely the condition under
which compliance tooling gets bought. No scout in the group mentions CARF once.

**The line is still not ranked**, and for a reason that survives: a filing-ready Israeli crypto
computation edges into regulated advice, and a wrong number costs the buyer money with our name on
it. That is AMBER on its own. But the record now says **"demand unmeasured, AMBER on regulated
advice"** rather than "demand measured at 58" — so when CARF data lands in 2027 it is not mistaken
for a case already refuted.

### Re-open triggers for this group

1. BILS opening beyond the institutional pilot.
2. A rendered Bits of Gold fee schedule — it gates every crypto number in the portfolio.
3. CARF data landing in 2027 against the corrected tax-report reason above.

---

## `storefronts` — one fact worth staking money on, and a #1 ranking refuted from the same repo, audited 2026-09-04

The audit is at `research/colony-sweep/audits/storefronts.md`.

### The finding worth keeping, and it is the strongest payability evidence in the sweep

**Gumroad pays an Israeli bank account in ILS.** Rendered from Gumroad's own production source,
`_13-getting-paid.html.erb`, under the heading "We currently support bank payouts in the following
countries": a row reading `Israel | ILS`. Not a snippet, not an inference from absence — the file
that renders the help page.

That is the second code-level Israeli payability proof in the whole 120-criterion sweep, alongside
Algora's `connect_countries.ex`. Both belong in the rails catalogue. Neither is a storefront thesis.

### Why the ranking is refuted, from a file in the repository the supervisor itself rendered

Gumroad was ranked #1 on the case that Gumroad Discover is "a genuine platform-search acquisition
channel priced purely on performance". Same repo, same branch,
`app/modules/product/recommendations.rb`:

```ruby
def recommendable_reasons
  reasons = { alive:, not_archived:, reviews_displayed:, not_sold_out:, taxonomy_filled:,
              sale_made: sales.counts_towards_volume.exists? }
```

`recommendable?` requires **all** of them, and `merchant_center_feed_service.rb` names it as the
Discover gate. **A product must already have made a sale to be recommendable.** Discover cannot
source a new product's first sale — ever.

That is MISSION constraint 7 written in someone else's source code, and it is the cleanest statement
of the problem this whole sweep keeps circling: the platform-search channels we are counting on are
gated on already having sold.

It is also the exact condition on which this same supervisor rejected Ko-fi — *"it supplies no
buyers… ceiling ₪200, below the ₪300 floor"* — while ranking Gumroad first at ₪700.

**Corrected: ₪250/month gross at twelve months** (~₪195 net of the true 13–29% take), ₪0 in months
1–3, first payout not before ~$100 gross plus a 1–3 week review. That is below the group's own ₪300
floor. **The honest classification is not "best storefront" but "the colony's best-verified
zero-cost, Israel-payable, merchant-of-record checkout rail"** — which is worth real money here, just
not as a source of buyers.

### Unity Asset Store — REFUTED to ₪0

Israel payability UNKNOWN rather than YES, no programmatic path to list a package at all — the
disqualifier for a software-only operation — and the supervisor claimed *"I re-verified the payout
mechanics today"* while stating in the same entry that `unity.com` is egress-blocked. All five Unity
primary URLs are unreachable.

### The pattern, now on its fourth group

The supervisor applied its own rejection criteria inconsistently three times in one report: Webflow
and Payhip were rejected for lacking a programmatic listing path while Unity was ranked without the
check; Envato was rejected for human-facing support obligations while Unity was ranked without it;
Ko-fi was rejected for supplying no buyers while Gumroad was ranked first on a buyer-supply mechanism
that provably cannot fire. It also **invented an owner blocker** (a W-8BEN) inside a list of
otherwise-verbatim ones, against MISSION's explicit instruction never to add extras.

And it wrote a kill criterion that cannot fail honestly: 25 Discover-attributed views in 60 days,
when Discover views are structurally zero before the first sale. The test would have reported on the
gate, not on the channel it claimed to be testing.

---

## `plugin-ecosystems` — the tenth group, the tenth cut, audited 2026-09-04

The audit is at `research/colony-sweep/audits/plugin-ecosystems.md`. Its supervisor earned real
credit — it **measured** the Obsidian cohort instead of arguing about it (newest plugins: median 27
users, while every paid success there was listed in 2020–21), and it read all eight scout files off
disk rather than trusting the wave's JSON, which carried seven. Its one ranked line still does not
survive intact.

| | Supervisor | Audited |
|---|---|---|
| WordPress plugin + Paddle Pro | ₪1,000/month | **₪0–200/month in the first 12 months** |
| Israel payable | YES, "proven" | **UNKNOWN** |
| Owner KYC needed | none | **Paddle identity/KYC, payout details and domain approval, all outstanding** |

### "Paddle already ships il-biz-tools" is false, and the disproof is in our own repo

The supervisor called payability *proven rather than inferred* on that basis. But
`products/il-biz-tools/src/config/site.json` holds `{"clientToken": "", "priceId": "",
"environment": "sandbox"}` — empty credentials, sandbox — the Pro box renders **"בקרוב"** with the
token unset, the product README lists sign-up, identity/KYC, payout details and domain approval
under steps only the owner can do, and 30-day revenue is ₪0.00 with no transaction id anywhere in
`state/`.

**Paddle *code* ships. No Paddle *account* exists.** That distinction had been quietly collapsing
across several groups, and `src/revenue/rails.ts` now says it in the entry itself.

### The acquisition channel is refuted from WordPress's own ranking code

This was the line's load-bearing differentiator: "backed by a named platform-search acquisition
channel". The auditor opened `class-plugin-search.php` in `WordPress/wordpress.org` — the repository
the supervisor cited without opening this file — and read the Elasticsearch `function_score`. Three
of its six factors are accumulated history a new entrant cannot have:

| factor | new plugin | an ordinary established one | handicap |
|---|---:|---:|---:|
| `active_installs` (log2p ×0.375) | 0.30 | 2.58 | **8.6×** |
| `support_threads_resolved` (log2p ×0.25) | 0.33 | 1.16 | **3.5×** |
| `rating` (sqrt ×0.25) | 0.79 | 4.74 | **6.0×** |

They compose multiplicatively: **roughly a 100–200× score handicap before the query-relevance term
is even applied.** The two factors a newcomer can max — `plugin_modified` and `tested` — are already
maxed by every maintained competitor, so they buy parity, not advantage. And the cold-start lane is
worse than assumed: the "Newest" tab was removed from the directory navigation in the redesign.

That is install-count-locked ranking — **the identical mechanism this same supervisor used to kill
"Chrome Web Store, single paid extension" in the same report.** Fifth group in a row where a
supervisor did not run its own test on its own winner.

## `distribution` — the group that was supposed to answer constraint 7, and answers ₪0, audited 2026-09-04

Full audit: `research/colony-sweep/audits/distribution.md`. Supervisor report:
`research/colony-sweep/groups/distribution.md`. Eleventh group audited, eleventh cut.

This is the group `MISSION.md` constraint 7 depends on — *nobody knows how a stranger finds any of
this, and until they do every ceiling in the repo is ₪0*. It was swept last on purpose, because it
is the only unswept group where an answer would change the plan rather than lengthen the kill list.
**It changed the plan.**

**The supervisor's headline is the finding, and it is right:** distribution is not a revenue line at
all. It is the precondition for every other group's revenue. Across 8 scouts and ~40 findings there
is **no buyer who pays us for distribution**. Every candidate is a channel that would convert on a
rail we already own.

**The structural result, which is what makes this group matter:**

> Every human-audience channel is closed to us by the platform's own written rules, and every
> machine-audience channel ranks on prior success. Those are not two problems. They are one problem
> with two faces, and between them they close the entire surface.

- Hacker News forbids "generated text or AI-edited text" verbatim, and has no write API.
- Product Hunt names "bots… or other artificial activity" as prohibited, and requires a photographed
  personal account with a maker present in the comments through the day.
- Reddit's Responsible Builder Policy requires bots to disclose themselves and forbids
  "substantially similar content across subreddits" — **the compliant bot is the one that may not
  promote**.
- Facebook removed the Groups publishing API and `publish_to_groups` on 2024-04-22.
- WhatsApp has no Channels publishing API, and business-initiated messages need prior opt-in.
- Israeli SMB and municipal business groups are joined by a human sending a WhatsApp message.
- Apify Store, Chrome Web Store, Shopify App Store and Gumroad Discover rank on installs, ratings,
  popularity or a prior sale — the last three already proven from platform source code.

`sindresorhus/awesome` was re-tested and the rejection holds verbatim: its PR template rejects
AI-generated pull requests and requires four substantive reviews. The `awesome` route in
`docs/AWESOME_ROUTE.md` remains what it always said it was — a research source, never a channel.

### Both survivors fall below the repo's own reject bar

| Candidate | Supervisor | Audited | israelPayable |
|---|---|---|---|
| Apify Store listing built for the four day-one quality-score categories | ₪500 | **₪200**, and ₪0 for the first 90+ days | YES (holds; snippet-grade on the PayPal leg) |
| Hebrew transactional tool pages on `il-biz-tools` | ₪400 | **₪0** through month 12 | YES → **UNKNOWN** |

`src/revenue/criteria.ts:362` rejects "an honest ceiling under ₪300/month". Corrected, both are
below it. **Net-new contribution to the ₪20,000 target: ₪0**, and the two survivors sit inside
ceilings other groups already counted, so they must not be added to the portfolio total.

Three supervisor errors worth keeping, because they are the same errors as every other group's:

1. **It monetised a product it never opened.** The Hebrew-pages ceiling rests on "the already-shipped
   Paddle Pro tier, ₪79 one-time". `site.json` holds empty Paddle credentials, `invoice.html:111`
   renders a disabled "בקרוב" button, and `isProConfigured()` returns false. **There is no
   checkout.** A conversion rate times an unbuyable product is ₪0 — the recurring defect `MISSION.md`
   names by name.
2. **It used its own kill criterion as its expected value.** 300 clicks/month at month 8 is the
   floor below which the line dies; the ceiling arithmetic treats it as the forecast.
3. **It took the more favourable of two conflicting sibling audits without disclosing the conflict** —
   claiming a ₪500 share of an Apify whole that `audits/agent-markets.md` had already refuted to ₪200.

### What this group did settle

- **Israeli §30א at ₪1,000 per message closes cold list-building** as an acquisition channel outright.
- **The MCP Registry publishes with no human review** (`mcp-publisher login github` → `publish`),
  and an **n8n verified community node** is submitted through a portal, not a conversation. Both are
  channels an agent can actually walk end to end. Neither has a measured ceiling yet, and neither is
  a buyer — but they are the only two doors in the whole group that are not locked.
- **Apify's quality score ranks on both Store search and MCP server search**, and four of its eight
  categories (Reliability, Popularity, Feedback, History of success) cannot be moved on day one.
  That is the same day-one handicap already proven for Gumroad and WordPress, now on a fourth
  platform.

### One thing to hold carefully: the Stripe kill in this group is narrower than it looks

The supervisor killed newsletter sponsorship (beehiiv, Paved) on *"Stripe doesn't support self-serve
cross-border payouts to countries outside"* US/UK/EEA/Canada/Switzerland, and the auditor credited
it. **It was reached by WebSearch snippet with `docs.stripe.com` egress-blocked, and the auditor did
not re-render it either.** It is also a *different claim* from the open question at the end of this
file: a platform's ability to self-serve a cross-border payout is not the same product as an Israeli
holding a Connect Express account, which Algora's public source shows working today. Both can be
true at once. **The reopened Stripe question stays open**, and this kill is provisional on the same
thirty-second owner check as the four rejections listed there.

### What goes to the board

`ranked: []`, headline unchanged. The auditor's recommendation, which matches task #20 already
standing: publish `apify-il-open-data` **free** and count runs from strangers for 30 days. Free
publishing needs no KYC, no price and no README polish, and it starts the one clock — History of
success — that cannot be bought. Route the push through GitHub Actions, since `apify.com`,
`api.apify.com` and `console.apify.com` are all egress-blocked from this container (re-confirmed
this session).

## `data-apis` — zero survivors, ranked zero by the supervisor itself, audited 2026-09-04

Full audit: `research/colony-sweep/audits/data-apis.md`. Supervisor report:
`research/colony-sweep/groups/data-apis.md`. Twelfth group audited.

**The first supervisor in the whole sweep to rank nothing at all**, without an auditor having to
cut it there. Its own words: *"Not 'small', not 'needs more research' — zero."* The auditor's
response is the right one — *"a zero-survivor report is the cheapest possible report to write and
the hardest to falsify, so it deserves more scrutiny than a ranked one, not less"* — and it then
tried to break both of the supervisor's kills and **found stronger evidence for both**.

Three walls, each independently sufficient:

1. **The issuer is the free competitor.** CBS, Bank of Israel, data.gov.il, SEC EDGAR, GLEIF, UK
   Companies House, the EU's TEDB, Open-Meteo, Israel's MOT GTFS — every one publishes its own free
   API or bulk file. A perfect licence on a free substrate is not a business.
2. **The applied layer is free too, and usually MIT.** `@il-address/core` eats the address product,
   `@skills-il/boi-exchange-mcp` eats the Bank of Israel FX product, `vatnode/eu-vat-rates-data-js`
   eats the VAT-rates product, Hasadna's Open Bus eats Israeli transit — and **CBS itself publishes
   an indexation-calculator API endpoint**, which killed the group's own highest-ranked scout
   recommendation.
3. **Where money exists, access is human-gated.** TASE Data Hub, IGDB, TMDB, MetaBrainz, MOT SIRI,
   Snowflake Marketplace, Datarade, OpenCorporates — a signed contract, a discretionary approval or
   a sales conversation. That is not the identity/KYC exception `MISSION.md` permits. It disqualifies.

That is the price-floor-of-zero finding for a **sixth** group: what an agent can build alone from
public inputs, anyone can build alone from public inputs.

### The hole the auditor found, and it is the most interesting thing in the group

**Israeli government tenders were never enumerated by any of the eight scouts** — although
`products/apify-il-open-data`'s own README already lists "government tenders" among its datasets and
"procurement intelligence" among its target buyers. The market exists and is priced:

- **Govi (`govi.co.il`) sells Israeli government-tender alerts at ₪249 + VAT per month**, no
  commitment, after a 14-day trial.
- The Israel Export Institute sells tender alerts at ₪1,500/year to members or ~$1,000/year to the
  public, plus ₪550/month for an analyst add-on.
- The Tel Aviv Chamber of Commerce runs a free weekly alert as membership marketing.

**This is a direct counterexample to the wall this whole group is built on.** The issuer
(`mr.gov.il`, `data.gov.il`) publishes the tenders free, and people pay monthly anyway — for the
alerting layer. Every group so far has concluded that a free substrate sets the price at zero; here
is a live Israeli business charging ₪249/month on top of one.

**It is deliberately NOT ranked, and the auditor's reasons are good ones:** Govi is an entrenched
incumbent, part of what buyers pay for is a human analyst reading the tender, and **no buyer has
been observed paying us**. It is a lead, not a line. But "this vertical was never examined" is a
real hole in a report concluding the group is empty, and **the group is not CLOSED until tenders has
been swept once** (task #25).

### What else the audit corrected

- **The AWS Data Exchange blocker is factually wrong, in the direction of pessimism** — the report
  overstated what it requires.
- Two claims marked "verified" are snippet-grade; the Open-Meteo floor is misstated; RapidAPI
  payability was left more unknown than the evidence supports.
- **The report never tells the board that its own rejections condemn two shipped products** —
  `products/apify-il-open-data` and `products/il-biz-tools` both sit on substrate this group has
  just declared worthless. That handoff has to be made before task #20 spends thirty days measuring.
- **The x402 rail was never considered by anyone in the group.** Every payability discussion here is
  about KYC-gated marketplaces, while `products/x402-il-api` sells per-request with no account and no
  KYC. Several rejections rest on a payout uncertainty that rail does not have. Whether x402 demand
  exists is a separate and probably fatal question — but the group never asked it.
- **Free MCP servers were counted only as competitors, never as a channel**, though the colony
  already ships `products/mcp-il-tools` into exactly that surface.

### The method fix, now permanent

Nine agents in this group reported "no Israeli primary source could be rendered" and stopped. Nobody
tried **GitHub code search over third-party repos that call the blocked endpoint**. One such call
produced first-hand, code-grade evidence for the group's single most decisive claim. When a host is
egress-blocked, stop searching for documentation about it and search for code that calls it — repos
hard-code the URL, the parameters and the response shape. *"The site is blocked" and "the fact is
unreachable" are different sentences.* This is now rule 9 of the scout brief in
`src/revenue/sweep-workflow.ts`.

## The pattern across three platforms, and it is the most important thing the sweep has produced

Three times now, a "platform search will find us" claim has died in the platform's own source code,
and each time from a different mechanism:

| Platform | The gate, in their code | Found by |
|---|---|---|
| **Gumroad** | `recommendable?` requires `sale_made: sales.counts_towards_volume.exists?` — Discover cannot source a first sale, ever | `audits/storefronts.md` |
| **Apify** | Store search correlates with a quality score whose categories include Popularity (users, saves, return usage) and History of success | `audits/store-promotion.md`, `audits/agent-markets.md` |
| **WordPress.org** | `function_score` weights `active_installs`, `support_threads_resolved` and `rating` — a 100–200× handicap on day one | `audits/plugin-ecosystems.md` |

Three platforms, three independent auditors, three different implementations, one property:
**platform search ranks on prior success, so it cannot deliver the first customer.** MISSION
constraint 7 said nobody knows how a stranger finds us. It is now stronger than that — we have
checked, three times, and the answer is that the channel the whole plan leans on is closed to a
day-one listing by construction.

The shapes that survive this are the ones constraint 8 names: an input that is not public,
accumulated history that compounds, an obligation someone must discharge, or work performed on
demand for a payer who announces the job.

---

## Earlier rejections

Kept in `docs/INCOME_PLAN.he.md` §4 with one-line reasons: Envato (bans AI files, 50%
commission), Discord Premium Apps (US/UK/EU developers only), Figma plugins (not approving
new sellers), Raycast (no payment mechanism), GPT Store (US-only revenue programme),
Smithery ($30/month, pays nothing), Olas/Pearl (macOS-only, maintenance mode), Medium
Partner (bans AI writing behind the paywall, pays via Stripe), Substack and beehiiv
(Stripe — see the note below), bulk AI content and templated YouTube
channels (penalised and demonetised through 2026), Google Play (£/$25 plus identity plus 12
testers for 14 days — not worth a first experiment), freelance marketplaces and RLHF work
(require an identified human who talks to clients).

Shopify apps are **not** rejected — they are parked as a future candidate, gated on a
manual review of one to four weeks and a selfie KYC.

### A standing claim that has to be re-opened: "Stripe does not serve Israeli accounts"

Several rejections above lean on it, and **the repo now contradicts itself about it in three
places**:

- The Figma entry a few rows up describes Figma as "a payable platform (Stripe, Israel listed)".
- `research/colony-sweep/scouts/payment-rails--stripe-alternatives.md` says the sources
  *conflict*: Stripe supports ILS and pays out to Israeli bank accounts, and only the
  supported-*merchant*-country question is unresolved.
- `research/colony-sweep/scouts/bounties-grants--oss-bounties.md` renders Algora's own source
  file `lib/algora/psp/connect_countries.ex`, which lists `{"Israel","IL"}` among its Stripe
  Connect countries, with `account_type/1` giving Israelis a Connect **Express** account. That
  is a platform paying contributors today, and its code is public.

The careful reading: **Stripe Connect through a platform appears to work for an Israeli; a
standalone Israeli Stripe merchant account is still unverified.** Those are different products
and the repo has been treating them as one.

**Nothing may be rejected on this ground until it is settled.** What settles it: open
`https://stripe.com/global` and check whether Israel appears in the supported-countries list.
**That page cannot be opened from this container** — `stripe.com` returns `EGRESS_BLOCKED`,
confirmed 2026-09-03 — so no agent here can close this. It is an owner step, and a thirty-second
one.
Until then the claim marks a line for checking, not for killing — and the rejections above that
rest on it (Substack, beehiiv, Medium Partner, Polar) are provisional, not closed.
