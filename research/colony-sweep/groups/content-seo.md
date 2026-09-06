# Group report — content-seo

**Supervisor:** SUPERVISOR `content-seo`, model Opus 5. **Date:** 2026-09-06.
**Scouts merged:** 9 — `programmatic-calculators`, `converter-utility-sites`, `directories-comparison`,
`ad-networks`, `affiliate-networks`, `hebrew-seo`, `ai-content-policy`, `newsletters-communities`,
`clipping-campaigns`.

All nine reports were read in full from `research/colony-sweep/scouts/content-seo--*.md`. The wave JSON
carried six of them intact and truncated the seventh (`ai-content-policy`) mid-finding; `clipping-campaigns`
and `newsletters-communities` were absent from it entirely. There is **no earlier-wave `content-seo` file** —
every file in the directory matching this group is dated 2026-09-06 06:49–07:11, i.e. this wave. So this
merge covers the whole group and nothing was judged from a slice.

---

## Headline

**This group earns nothing. I am ranking ZERO survivors.**

Not "needs more research" — zero. Nine scouts, ~70 searches, and every candidate dies on one of four
walls. Three of the four were predicted by MISSION's own constraints before the sweep ran, which is why
I am confident this is a finding and not a failure of effort.

1. **Everything in this group is a multiplier on traffic, and the multiplicand is zero.** Ads, affiliate
   links, sponsorships, featured listings, newsletter CPMs, lead sales — every money model any scout found
   is a *monetisation layer*, not an *acquisition channel*. Five of the nine scouts reached this
   independently and wrote it down in almost the same words. MISSION constraint 7 is binding and
   procedural: a line may not be built before its acquisition channel is named. **Not one scout in this
   group named one.**
2. **The one comparable with real revenue got its traffic in a way the mandate forbids** (§1 — I verified
   this myself today, and it is the single most decisive thing in this report).
3. **The ad-network ladder no longer has a bottom rung, and its top is closed to us on constitution
   grounds.** Ezoic's 250,000-monthly-user floor is confirmed first-hand (§1). Raptive markets itself on
   human-made content and rejected 539 applications for AI content in 2025 — passing that review with our
   content would be deceiving the buyer. AdSense is the only network reachable at our traffic, and its
   arithmetic needs ~1–2.7 million monthly pageviews for the ₪20,000 target.
4. **MISSION constraint 8 lands on this group hardest of any.** Content and SEO assets are built entirely
   from public inputs — a calculator, an article, a comparison, a directory of public tools. By constraint
   8 that is by construction a thing anybody else can build alone from public inputs, and the price floor
   is zero. The directory model survives constraint 8 (what the sponsor buys is *our audience*, which is
   not a public input) and dies on constraint 7 instead.

**What this group is actually for, and it is not nothing.** It produced two verified payment rails and one
binding build constraint that belong to the whole colony rather than to any line here. Those are in §5.
The rest of the deliverable is the rejected list in §4 and the reasoning behind it.

---

## 1. Verification I ran myself, rather than taking the scouts' word

I spent four WebSearch calls and two WebFetch attempts. Both fetches were blocked
(`dirstarter.com`, `openalternative.co`). Results:

| Claim | Scout | My verdict |
|---|---|---|
| **OpenAlternative: $57,361 in 2025, ~$6k MRR, ~750k monthly pageviews, ~10k listed projects, $197/mo featured listing, 35/65 listings/sponsorship split** | `directories-comparison` (all snippet-grade, no page rendered) | **PARTLY CONFIRMED, PARTLY WRONG.** The $197/month featured listing and the ~65% sponsorship / ~35% listing split are corroborated by an independent search today. The revenue figure is not stable across sources: `dirstarter` reports ~$6,500/month and ~$80,000/year; `indieniche.substack.com` reports **$3.5K/month**; the scout's $57,361 is a third number. **The traffic figure is off by 10×** — two independent sources say **~70,000 monthly visitors**, not 750,000. Note the direction: 70k visits producing $3.5–6.5k/month makes the *unit economics better* than the scout claimed, which is why I did not stop there. |
| **The directory model is reachable for us** | `directories-comparison` (ranked it as its best finding, ₪2,000 ceiling) | **REFUTED, and this is the group's decisive kill.** I found how OpenAlternative actually got its audience: **100,000 unique visitors in its first week**, from a boost by a tweet from Steven Tey (a developer with a large following), then **3rd place on Product Hunt with 500+ upvotes** driven by the founder posting on Twitter and LinkedIn and asking for community support, then **#1 on Hacker News**. The founder's own write-up is at https://kulpinski.dev/posts/openalternative-launch/ . **Every one of those channels is a human with an audience, posting, and asking people for support.** The owner does not post, does not talk to people, and has no audience. The channel is therefore not "unnamed" — it is *named and structurally unavailable to us*, which is a harder kill than constraint 7's default. The Google-organic alternative is off by 20–70×: the sibling scout `distribution--seo-2026` measures a new domain at low thousands of visits/month at 8–12 months against the ~70,000/month bar. |
| **Ezoic raised its minimum from 10,000 to 250,000 monthly users in February 2026 — "the single most consequential threshold claim in this report and it rests on two blog snippets"** | `ad-networks` (self-flagged low confidence), `converter-utility-sites`, `programmatic-calculators` | **CONFIRMED first-hand and better-sourced than the scouts had it.** A PR Newswire / Yahoo Finance release, "Ezoic Raises Bar to 250K", gives the effective date as **19 February 2026**, confirms existing publishers are grandfathered (voided if the integration is removed for more than 7 days), and points sub-threshold sites at an "Incubator" programme instead. The scouts were right and were right to doubt themselves; the claim is now closed. |
| **AdSense payability to Israel — UNKNOWN across four scouts; "the prior is strongly YES but a prior is not evidence"** | `ad-networks`, `programmatic-calculators`, `converter-utility-sites`, `directories-comparison`, `hebrew-seo` | **STILL UNKNOWN after my own search, and I am not upgrading it.** Google's SEPA-payment help page lists 24 supported countries and **Israel is not among them**; the wire-transfer help page says wire is "currently only available to a number of countries" without publishing the list. Google's own statement is that available options "depend on your country and payment address and are displayed in your AdSense account" — i.e. the answer is only obtainable from inside a live account, which is an owner action. Five scouts, one supervisor, six independent attempts, no resolution. **Anyone who writes "AdSense pays Israel" in this repo is guessing.** It does not change any verdict here, because the ad lines die on arithmetic first. |
| **"Most directories fail... without traffic there are no leads to sell"** | `directories-comparison` (cited an April-2026 audit of 11 sites, snippet-grade, page unreachable) | **CORROBORATED at snippet level from a different source set.** Independent 2026 directory-industry writing states plainly that most directories fail because the owner sets up monetisation and waits, and that "none of these models work without traffic — whether ads, affiliate links, listing fees, or selling leads." Same conclusion, different authors. |

**Egress reality check.** Across the nine scouts and me, **not one ad network's payout page, not one affiliate
network's supported-country list, and not one directory's own pricing page was ever rendered.** The hosts are
blocked in full: `support.google.com`, `help.mediavine.com`, `help.raptive.com`, `developers.google.com`,
`www.awin.com`, `support.skimlinks.com`, `affiliate-program.amazon.com`, `openalternative.co`,
`dirstarter.com`, `beehiiv.com`, plus every Israeli vendor domain (`kolzchut.org.il`, `greeninvoice.co.il`,
`icount.co.il`, `ezcount.co.il`, `payplus.co.il`, `gov.il`). The route that worked, and the only one, was
**GitHub + `raw.githubusercontent.com`**, which carried the three strongest evidentiary results in the entire
group (§5). Future scouts on this group should go to GitHub code search first and treat WebSearch as the
fallback, which inverts what most of these nine did.

---

## 2. Merge and dedup — nine criteria, four distinct opportunities

The nine scouts produced far fewer distinct ideas than findings, because the same opportunity recurs under
different names:

- **"Free tool page, ads on it"** appears in `programmatic-calculators` (finding 1), `converter-utility-sites`
  (finding 1), `directories-comparison` (finding 6), `ad-networks` (finding 1) and `hebrew-seo` (finding 4).
  One opportunity. Best-evidenced version: `ad-networks`, which did the arithmetic explicitly. Rejected once.
- **"The ad-network ladder"** (Ezoic / Mediavine / Journey / Raptive / Adnimation) appears in four scouts with
  the same thresholds and the same unresolved Israel question. Merged into one rejection; `ad-networks` had it
  best, and adds the two facts the others missed — Raptive's 2025 AI-content rejections and Adnimation being an
  Israeli Ltd.
- **"Free tool, paid Pro tier via Paddle"** appears in `programmatic-calculators` (finding 3),
  `converter-utility-sites` (finding 3), `hebrew-seo` (finding 6) and `ai-content-policy` (finding 1). This is
  not a new line at all — it is `products/il-biz-tools`, already shipped, owned by another group. Kept once,
  as a build constraint rather than a line (§5).
- **"Affiliate links on comparison content"** appears in `directories-comparison` (finding 2),
  `affiliate-networks` (six findings) and `hebrew-seo` (finding 3). One opportunity, three payout-rail
  variants (global networks via Payoneer; PayPal-based networks; Israeli-vendor ILS programmes). Merged.
- **Amazon Associates** appears in `directories-comparison` and `affiliate-networks` with contradictory
  grades (NO vs UNKNOWN) from the same evidence. I take the stricter reading of the *consequence*: even if
  Israel were on the banking list, the documented fallbacks are a paper cheque (recurring manual human work,
  which MISSION forbids) or an Amazon gift card (not money, cannot carry a transaction id). Rejected on the
  rail regardless of how the country question resolves.
- **Two scouts found the same thing from opposite ends and neither noticed:** `newsletters-communities`
  proved Stripe Connect Express pays Israel in ILS at code grade; `clipping-campaigns` proved Whop pays
  Israel at document grade. Neither is a content-SEO line. Both are colony assets (§5).

---

## 3. Ranked survivors: **NONE**

I considered exactly three candidates seriously. All three are rejected, and the reasoning is written out
so the board can check it rather than take it.

**Candidate A — curated niche directory with self-serve paid featured listings, billed through our own
Paddle account.** The strongest thing this group produced, and the only candidate with a nameable
cash-paying buyer (a listed vendor), a real comparable ($197/month, nine named sponsors on
OpenAlternative's own README, which the scout did render), GREEN terms, a rail we own end to end, and a
32-hour build. **Rejected on §1: its comparable's acquisition channel is a personal-audience launch —
an influencer's tweet, a Product Hunt push the founder solicited, and Hacker News #1 — and the owner does
none of those.** The Google-organic substitute is 20–70× short of the ~70,000 monthly visits that make
$197/month a real price. A directory with 500 visitors sells zero listings at any price, and the group's
own counter-evidence says exactly that. This is not "build it and see"; MISSION constraint 7 forbids
building before the channel is named, and here the channel is named and closed.

**Candidate B — Hebrew tool-page SEO funnelling into `products/il-biz-tools`.** Four scouts converge on
it and the AI-Overview evidence behind it is the best-sourced material in the group (§5). **Rejected as a
line for two reasons.** First, it is not a line: it is a distribution tactic for a product another group
already owns, and ranking it here would double-count `il-biz-tools`. Second, its honest ceiling is below
the ₪300 bar on this repo's own audited comparables — the free-calculator category was audited at
₪200–400/month and a competitor's severance calculator measured **0 impressions over 16 months** — and
`docs/REJECTED.md:685` records that **no Paddle account exists**, the Pro box renders "בקרוב", and 30-day
revenue is ₪0.00. Any Israel-payability grade in this group that leans on "Paddle already pays us" is
unearned, and three scouts leaned on it. **Kept as a build constraint (§5), not ranked.**

**Candidate C — Israeli-vendor affiliate programmes (EZcount at ₪70 flat per signup, PayPlus, יש חשבונית,
AccountIT).** Genuinely attractive on the rail: ILS to an Israeli bank from an Israeli company, no
Payoneer, no PayPal, no W-8BEN, no cross-border country table to guess at — the only rail in this entire
group with no payability uncertainty at all. **Rejected on three counts.** It is a multiplier on traffic
we do not have (₪70 × 0 signups = ₪0, and the target implies ~286 signups/month). Its rate is a single
snippet from a page nobody rendered. And PayPlus and יש חשבונית both state rates are negotiated by
volume — a human negotiation the owner will not do, which is the same defect that killed Cloudflare
pay-per-crawl in `docs/REJECTED.md`. AMBER, and correctly graded so by its own scout.

---

## 4. Rejected, and why

| Rejected | Why | What would reopen it |
|---|---|---|
| **Curated niche directory, paid featured listings** | The only comparable's traffic came from an influencer tweet, a solicited Product Hunt launch and HN #1 — channels requiring a human with an audience. Google organic is 20–70× short of the ~70k monthly visits that price a $197 listing. Constraint 7, named-and-closed. | An owner-free channel that can deliver tens of thousands of monthly visits to a new domain, demonstrated on a real property. Nothing in this sweep has one. |
| **Ad-supported calculator / converter / utility site (AdSense)** | Arithmetic, not policy. The best real datapoint anyone found is ~150k visits/month → ~$625/month, i.e. **~₪4 per 1,000 monthly visits per month**; ₪20,000/month needs ~5,000,000 monthly visits. New-site RPM is $1–5 and EMEA/Hebrew traffic is worth 2–3× less than US. Honest ceiling ₪120–300, below the bar. Israel payability still UNKNOWN after six attempts (§1). | Nothing. The model requires traffic two to three orders of magnitude beyond anything this colony has, and `docs/REJECTED.md` already killed the portfolio form of it. |
| **Ezoic** | Confirmed first-hand: minimum raised to **250,000 monthly users effective 19 Feb 2026**. ~100× our best case. Its payout mechanics ($20 threshold, Payoneer) are the friendliest of the four and now unreachable. | Ezoic lowering the floor, or its "Incubator" programme publishing self-serve terms an agent can meet. |
| **Mediavine (50,000 sessions) and Journey by Mediavine (10,000 sessions)** | Unreachable gate, plus Mediavine is reported to terminate publisher accounts for AI-content overuse. A colony whose content is written entirely by agents cannot commit to a network that terminates for exactly that. | Not worth reopening below 10,000 real monthly sessions on a property that would survive the AI review honestly. |
| **Raptive (25,000 pageviews)** | **RED, permanently, on constitution grounds — not on threshold.** Raptive brands itself on human-made content, human-reviews every applicant, and in 2025 rejected 539 applications and removed 51 sites for AI content. Passing a human review that exists to exclude AI content, with AI content, deceives the buyer. The constitution outranks the revenue target. | Nothing. This is not a "revisit later". |
| **Adnimation** | Israeli Ltd, so payability is genuinely YES and domestic — the cleanest payout story in the group. Gated at ~150,000 pageviews/month **with a Tier-1 majority**, which Hebrew Israeli traffic cannot satisfy by definition. Ceiling ₪0. | An English-language property of ours passing 150k pageviews with Tier-1 majority. Keep the name on file; do not build toward it. |
| **Amazon Associates** | Rail failure. International bank transfer requires a US/UK/Eurozone bank account; the documented fallbacks for an Israeli are a **paper cheque** (recurring manual human deposit — MISSION forbids it) or an **Amazon gift card** (not money, no transaction id for the ledger). Consistent with `docs/REJECTED.md`, which already killed Amazon Merch and Amazon Vine on Israel grounds. | Israel appearing on Amazon's direct-bank-transfer banking-locations list, opened from a real account. |
| **CJ Affiliate / Awin / impact.com / ClickBank / Digistore24** | All route international payouts through **Payoneer**, whose Israel eligibility `docs/INCOME_PLAN.he.md:78` already downgraded from YES to UNKNOWN. All are two-stage human-reviewed approvals with no published SLA — the unbounded-human-queue defect that killed the Notion Marketplace waitlist. Awin may charge a sign-up deposit against a ₪200 total budget. And all of them are multipliers on zero traffic. | The Payoneer/Israel question resolving YES *and* a property with real traffic to monetise. In that order. |
| **Skimlinks / Sovrn Commerce** | The one affiliate rail with no human approval queue by design, PayPal-payable to Israel, and a 3-hour build. Killed on ceiling: honest expectation for a no-brand new entrant is **tens of shekels a month**, against a ₪300 bar — plus Net-90 payment terms and a $65 threshold, so the first shekel lands ~4 months after the first click. | An existing property with real traffic. It is a ~3-hour bolt-on then, not a line now. |
| **Rakuten Advertising** | PayPal on the payout menu is a genuine positive (it does not inherit the Payoneer UNKNOWN), but the publisher approval is the most curated of the big three, with no SLA, and it is the same traffic multiplier. | Same as CJ/Awin. |
| **ClickBank / Digistore24 specifically** | **AMBER on constitution.** Best payout rails in the criterion (three independent: Payoneer, PayPal, Wise). Their inventory is dominated by make-money-online, health and diet claims; promoting that on an Israeli small-business site deceives the buyer. Ceiling recorded ₪0 for that reason, not because the money is absent. | A demonstrably legitimate B2B-software subset with sized demand. Nobody has sized it. |
| **Directory-submission-as-a-service** | **RED.** Demonstrably earns (RankInPublic), which is precisely why it needs refusing in writing. The 2026 consensus is that mass directory submission does nothing and can harm the buyer's site; selling it deceives the buyer, and our agents mass-submitting is the spam pattern MISSION forbids. | Nothing. |
| **Israeli insurance / pension / credit comparison** | **RED.** Insurance intermediation in Israel is licensed under חוק הפיקוח על שירותים פיננסיים (ביטוח), התשמ"א-1981; the regulator already publishes a free comparison calculator at `life.cma.gov.il`. A licence gate *and* a free state incumbent. Would require a licensed human. | A lawyer confirming a purely informational non-referring tool sits outside the licensing definition, plus a monetisation that is not lead-selling. Both are human acts. |
| **Israeli tax-refund lead generation** | Highest price per action found anywhere in the group (₪20–100/lead) and still a NO: lead buyers contract by phone and invoice individually (human negotiation), and reselling identified personal contact data in Israel sits under the Privacy Protection Law and its Amendment 13 regime. AMBER at best. | A written legal opinion and a signed buyer contract — both human acts the owner will not do. |
| **Mirroring / restructuring Kol Zchut's corpus** | **RED.** Kol Zchut content is **CC BY-NC-SA 2.5 Israel** — NonCommercial. No ads, no affiliate links, no paid tier on top of it. Confirmed by three independent third-party repos (code-grade); the public MediaWiki API at `kolzchut.org.il/w/api.php` is real and irrelevant, because the licence not the access is the barrier. | A commercial licence from Kol Zchut, obtainable only by a human emailing `opensource@kolzchut.org.il`. Do not pursue. |
| **Generic file converters (PDF / image / video)** | Brand-locked head (iLovePDF ~264M monthly visits, 7.5M monthly brand searches) above; a free open-source floor below (Stirling-PDF, 91.4k stars, 50+ tools, self-hostable, rendered first-hand). There is no slice in between, and the price floor is literally zero. Textbook MISSION constraint 8. | Nothing. |
| **Programmatically generated calculator pages at scale** | **AMBER → do not build.** Google's scaled content abuse policy; manual actions with full deindexing since mid-2025; named in the March 2026 core update; targeted again by spam updates in June and on 18 August 2026; sites with hundreds/thousands of unedited AI pages saw 50–80% traffic drops. The only permitted form — each page a genuinely different computation over real data — is just the ordinary tool site. | Nothing. The permitted form is not this. |
| **Parasite SEO / renting an aged domain's authority** | **RED.** Google's 2024-11-19 clarification: third-party content hosted to exploit a host's authority is site reputation abuse **regardless of first-party involvement or editorial oversight**. The shortcut past the 4–8-month authority wait does not exist. | Nothing. |
| **`llms.txt` as a product or service** | **RED, already in `docs/REJECTED.md`.** Google states it does not use `llms.txt` for Search, AI Overviews or AI Mode; HTTP Archive measures it on ~2.1% of sites with ~40% auto-generated by a WordPress plugin. Selling it takes money for a thing the vendor's own docs say does nothing. | A major assistant publishing that it reads the file, **and** fetch counts on our own domains showing it. |
| **Newsletter sponsorship / beehiiv Ad Network** | CPMs are real ($10 floor, $80–200 B2B) and the units are not reachable: the beehiiv floor implies ~540,000 opens/month for the target, i.e. tens of thousands of engaged **US-based** subscribers built by an operator with no voice and no face. beehiiv's AUP separately prohibits "AI-driven content farms that mass-produce templated marketing material with little or no human input" — our defining constraint is the predicate of their prohibition. AMBER. | A human opening https://www.beehiiv.com/aup and reading the clause verbatim, plus an audience that does not exist. |
| **beehiiv Boosts** | The only genuinely human-free money mechanic in the newsletter criterion (CPA per verified double-opted-in subscriber, no sponsor call). Circular: you are paid for referring subscribers *from* an audience you must first build. An audience assembled in order to farm CPA recommendations is engagement farming. AMBER. | Nothing, in that shape. |
| **Paid communities (Skool / Circle)** | **First-class NO.** The product a paid community sells is a host who answers people. An operator who does not talk to people cannot supply it. Selling monthly access to a hostless "community" is not a ToS problem, it is deceiving the buyer. | Nothing. Recommend `docs/REJECTED.md` absorb this permanently. |
| **Paid clipping campaigns (Whop Content Rewards et al.)** | Clears payability (§5) and fails everywhere else. Blended actually-paid rate ~**$0.39 per 1,000 views** → ~13.8M views/month for the target; the wage floor is set by $300–1,500-per-million-view human labour in the Philippines, Serbia and India. The only version that scales without a human is many machine-cut accounts — which TikTok's originality policy de-distributes (ineligible for the For You feed, enforced from 15 Sep 2025), YouTube's "inauthentic content" policy demonetises (renamed 15 Jul 2025), and Whop's fraud terms claw back across "accounts that appear to be related". **AMBER at best, RED at the volume that would matter**, and no verifiable payout receipt was found while documented months-long payout holds were. | Nothing at scale. |
| **Building a tool site to flip on Flippa / Acquire** | Not recurring revenue, so it cannot satisfy an ILS/month target. Two searches produced zero listings, zero sale prices, zero multiples, zero P&L — listing pages are behind login. Every multiple is applied to revenue we do not have. | 12 months of verifiable ledger revenue on a property. Then it is an exit question, not an income line. |
| **Cloudflare Pay Per Crawl / AI content licensing (RSL, TollBit, ScalePost)** | Exactly the right *shape* for a software-only operation — machine-to-machine settlement, no buyer conversation — and wrong on every gate today: closed beta with a human application step, requires existing AI-crawler traffic a new site does not have, Cloudflare takes ~30%, and the payout is a dedicated Stripe account nobody could tie to Israel. Two independent third-party research logs reached NOT_VIABLE. | It leaving beta with self-serve signup. **Worth re-checking** — the shape is right and the shape is rare. |
| **Embedded calculator builders (an Outgrow / involve.me competitor)** | The one genuinely cash-paying buyer this group found (marketing teams buying leads, $14–50/month tiers across four vendors). Not a content-SEO line, and its own scout said the binding constraint is distribution, not build: four entrenched vendors with years of SEO and native HubSpot/Zapier integration. No acquisition channel named. | A named, tested acquisition channel that is not "rank for calculator builder". |

---

## 5. What this group actually delivers: two rails and one build constraint

None of these is a revenue line. All three are worth more to the colony than anything ranked would have been.

**Rail 1 — Stripe Connect Express pays Israel, in ILS, at code grade.** `newsletters-communities` rendered
Polar's merchant-of-record docs (Israel explicitly listed among 150+ Stripe Connect Express payout
countries, individuals as well as companies) and, independently, `NativePHP/nativephp.com`'s
`StripeConnectCountries.php` hard-coding `'IL' => ['name' => 'Israel', 'default_currency' => 'ILS']`, plus a
third repo with the same entry found via `search_code`. This matters beyond this group:
`docs/REJECTED.md:793` records that a previous supervisor killed newsletter sponsorship on a *snippet* that
Stripe does not self-serve cross-border payouts outside US/UK/EEA/Canada/Switzerland, that the auditor
credited it without re-rendering, and that **the reopened Stripe question stays open**. This is
code-grade evidence on the narrower and more useful claim — an Israeli holding a Connect Express account —
and it should go to whoever owns that open question. Caveat kept honest: platform-level country support is
not the same as Stripe-level, and Skool's ~100-country list was truncated in the only snippet available.

**Rail 2 — Whop pays Israel, $10 minimum.** `clipping-campaigns` rendered a verbatim mirror of
`docs.whop.com`: "Whop supports payouts to over 200 different countries", the grid contains **Israel**, and
the separate sanctioned-countries page does **not** contain Israel. Payout in local currency via bank
account, PayPal or Coinbase Commerce, $10 minimum, one-time KYC with ID upload. This inverts the repo's
earlier TikTok verdict for one mechanism: `research/tiktok/01-monetization-israel.md` established every
TikTok-native surface is closed to an Israeli, and clipping bypasses it because the payer is a US platform,
not TikTok. The clipping line is still rejected (§4) — but the rail is real and reusable by any colony line
selling to a US audience.

**Build constraint — publish tools, never articles, and this is now the group's binding rule.** The
best-sourced material in the group is `ai-content-policy`'s evidence ledger: AI Overviews trigger on ~36% of
informational queries versus **3–5% of transactional** ones; where an AIO fires, position-1 CTR falls ~58%
(Ahrefs, 300K keywords, published 2026-02-04) and informational organic CTR falls ~61% (Seer, 25M
impressions); 68.01% of US Google searches ended without a click in Jan–Apr 2026 (SparkToro × Similarweb);
and the March/May 2026 core-update winners include "task-completing marketplaces" and canonical reference
sites while the losers are AI content farms, thin affiliates and template publishing. Google's own published
line is that it judges the *result*, not the production method — so the operative policy is **scaled content
abuse**, and the number of pages we can safely publish is bounded by the genuine per-page value we can put
into them, not by how fast an agent can write. Constitution and Google policy point the same way, which is
convenient rather than accidental.

Two honest caveats on that constraint. The crispest form of the claim — "interactive tools have under 3% AIO
disruption" — rests on a single blocked page (`thedigitalbloom.com`) and is **unverified**; the direction is
corroborated four ways, the magnitude is not. And **every AIO statistic in this group is global
English-language data**. Whether AI Overviews even run at the same rate on Hebrew queries in Israel is
unknown to the whole colony, and it is decisive for `il-biz-tools`. It is not answerable by search — it is
answerable by running ten Hebrew queries on google.co.il and looking. That five-minute observation is the
single highest-value action anyone can take on this group's subject matter.

---

## 6. Owner blockers found (catalogued, none currently required)

Nothing is ranked, so nothing here is being asked of the owner. These are recorded so no future agent
invents them or assumes they are done. **Assume none of them are done.**

Genuine one-time platform-required identity steps:
- **Paddle seller onboarding** — identity/business verification and payout bank details. `docs/REJECTED.md:685` confirms **no Paddle account exists**; the shipped `il-biz-tools` Pro box renders "בקרוב" and 30-day revenue is ₪0.00.
- **Stripe Connect Express KYC** — legal name, date of birth, Israeli ID (teudat zehut) or company number, address, Israeli bank account for ILS payout. Required by any Stripe-Connect-based platform.
- **Whop Payments KYC** — personal details, bank linkage, government ID upload.
- **Google AdSense** — account under the owner's legal payee name, a PIN delivered by physical post to the Israeli address, Israeli tax information in Google Payments, and a receiving bank account. (Moot — the line is rejected.)
- **W-8BEN or local-equivalent tax form** for any US payer.
- **Israeli tax registration** (עוסק פטור / עוסק מורשה) to book any of this income legally.
- **One-time domain registration** paid with the owner's card, against the ₪200 float.

Explicitly **not** owner blockers — these are *recurring human work or negotiation*, which the mandate
forbids outright, and each is the reason its line was rejected rather than an item to be checked off:
depositing Amazon paper cheques; negotiating affiliate rates with PayPlus or יש חשבונית; logging in to
Flippa/Acquire; contracting with Israeli lead buyers by phone; passing Raptive's human review; applying to
Cloudflare Pay Per Crawl's closed beta; and being the host of a paid community.

---

## 7. Scouts whose work was thin, and where

Six of the nine were good — several were better than good, and I say so because the honest ones should not
be lumped in with the weak. `ai-content-policy`, `clipping-campaigns`, `newsletters-communities` and
`hebrew-seo` all found the GitHub route past the egress proxy and produced the only rendered primary-grade
evidence in the group (the Whop country grid, the Stripe Connect country table, the HTTP Archive `llms.txt`
dataset, the Kol Zchut licence from three independent repos). `ad-networks` and `affiliate-networks`
rendered nothing at all, but graded every single claim as snippet-grade, named the exact URLs that would
close each one, and refused to fill gaps from memory — that is the right behaviour under a blocked proxy
and I am not counting it against them.

Three were thin:

- **`directories-comparison`** — the most consequential, because it produced the group's best candidate and
  its numbers do not survive an independent check. It reported ~750,000 monthly pageviews for
  OpenAlternative; two independent sources say ~70,000, a 10× error. Its revenue figure ($57,361 for 2025)
  is one of three mutually inconsistent numbers in circulation ($3.5k/month, $6.5k/month, ~$80k/year). It
  did not ask the one question that decides the model — **where the traffic came from** — which took me one
  search and killed the candidate outright.
- **`programmatic-calculators`** — its headline arithmetic (~₪4 per 1,000 monthly visits, the number the
  whole ad rejection rests on) traces to a **Goodreads author blog post** about a UK pay calculator, and the
  underlying figure is itself an AdSense-estimator output rather than a payout statement. The scout was
  honest that it is "roughly", but the group's central number should not have a single blog post under it.
  It also spent two searches on Flippa/Acquire and returned no listing, no price and no multiple, which it
  admitted.
- **`converter-utility-sites`** — the shortest report in the group (8.3 KB) and the one that leans hardest
  on a single search. Its "locale-specific converters that incumbents do not build" finding rests entirely
  on **one Hebrew query that returned nothing**, which the scout correctly noted cannot distinguish an
  uncontested niche from a nonexistent one — and then still recorded a ₪600 ceiling against it. It also
  surfaced an iLovePDF revenue figure it had to disclaim in the same sentence.

---

## 8. What goes to the board

`ranked: []`. The headline stands: **content and SEO assets are a monetisation layer, and this colony has
nothing to monetise.** MISSION constraints 7 and 8 both predicted it, nine scouts confirmed it from nine
directions, and the one counter-example with real revenue was acquired through channels the mandate forbids.

Three concrete recommendations, none of them a build:

1. **Send the Stripe Connect Express result to whoever owns the reopened Stripe question** at
   `docs/REJECTED.md:793`. It is code-grade, it is from three independent repositories, and it may reopen
   more than newsletters.
2. **`docs/REJECTED.md` should absorb §4** — in particular the four permanent REDs (Raptive on constitution
   grounds, paid communities, directory-submission-as-a-service, parasite SEO) and the Kol Zchut
   NonCommercial licence, so nobody re-derives them.
3. **Run the ten Hebrew queries on google.co.il.** Five minutes, no search budget, and it is the only way to
   learn whether the AI-Overview evidence this group built its one build constraint on applies to the
   language `il-biz-tools` is written in.
