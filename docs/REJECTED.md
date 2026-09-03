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

**And the honest ceiling for the whole group: ₪4,000-7,000/month at maturity**, with the best
single build (a PCN874 builder) at about ₪2,500. This is the colony's home turf and it cannot
reach ₪20,000 on its own. It earns credibility and traffic that other groups monetise. Treating it
as the flagship would be a mistake — recorded here so no future session quietly re-assumes it.

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
