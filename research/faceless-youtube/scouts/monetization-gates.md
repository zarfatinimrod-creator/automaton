# SCOUT: monetization gates — can ONE faceless English YouTube channel get an Israeli owner paid, and when?

**Date:** 2026-09-25. **Scout tier** (Opus). **Search budget:** 6 allowed, **7 used: one over budget, disclosed in §12.**
**Input tested:** reel prompt 6, "List 5 steps on how to get my YouTube channel monetized in the next 30 days.
Include placed advertisements that I can run on my channel as well." (`research/faceless-youtube/00-owner-reel-2026-09-25.md`).

**Grades:** RENDERED = I read the primary page's own text (the GitHub-runner captures in `research/rendered/`,
all fetched 2026-09-25 14:48–14:49 UTC per their `.meta.json`). CODE = a repo file I read. SNIPPET = a
search engine's summary of a page I could not open, which is weaker. INFERENCE = my reasoning. UNKNOWN = unknown.

---

## 0. Verdict

> **Yes, in principle it can get paid. No, not in 30 days. The earliest realistic first payout is spring
> 2027, and most attempts are likely never to get there.** None of the numbers that decide this are
> rendered, and the one piece of evidence on how channels are distributed is weak.
>
> 1. **The pipe exists.** Israel appears on the YouTube Partner Program (YPP) availability lists for both
>    tiers *(SNIPPET, medium-low: a search summary, not a quote from the list)*. AdSense for YouTube pays
>    monthly by international wire in USD or EUR, and I read that on the rendered pages *(RENDERED)*. That
>    is the one thing the English variant has that the rejected TikTok/Hebrew variant lacked.
> 2. **The gate is audience, and it doubles on 1 February 2027.** Ad revenue needs 1,000 subscribers plus
>    4,000 valid public watch hours in 12 months today. From 1 Feb 2027, new applicants need **8,000**
>    qualified watch hours in 365 days (or 20M Shorts views in 90 days) *(SNIPPET, several outlets; the
>    official YouTube Blog URL was seen but is egress-blocked)*. That is 129 days from today.
> 3. **Passing the threshold is not the same as getting paid.** A human reviewer then checks the channel's
>    main theme, most-viewed and newest videos, and metadata against the "inauthentic content" policy
>    *(RENDERED)*. The reel's own niche filter (RPM > $7) points at finance, health and legal niches. In
>    those niches YouTube names the exact case that can never be monetized: "AI-generated podcast hosts
>    offering financial guidance…" *(RENDERED)*.
> 4. **"Monetized in 30 days" is false as a plan.** It needs roughly 1,000 subscribers plus 4,000 watch
>    hours (on my assumptions, about 60,000 views of long-form video) *and* a review, all inside one month,
>    from zero. **"Placed advertisements"** (sponsorships through YouTube's brand-deal platform) require
>    YPP membership first *(SNIPPET)*, and Israel is not named in any snippet of that platform's countries.
> 5. **Best-case first money in the ledger: about May 2027**, if the channel reaches the old threshold by
>    mid-January 2027. **More likely: 10 to 14+ months, or never.** *(INFERENCE; the arithmetic is in §6.)*
> 6. **The owner's part is about 9 one-time steps.** No step puts his legal name on the channel if it is a
>    Brand Account. His name goes to Google, the IRS form, his bank and the Israeli tax authority, not to
>    viewers. *(Mostly SNIPPET/INFERENCE; see §8 for exposures I could not rule out.)*

In MISSION terms, the English, single-channel, long-form variant **does** change one thing: payability.
YPP reaches Israel and TikTok does not. It **does not** change the thing that decides the timeline, because
the entry ticket is accumulated audience history, which is constraint 8 shape 1, and it cannot be
shortened. Constraint 7 names the acquisition channel honestly: YouTube's own Browse and Search surfaces.
Those rank on prior success, and that is the same wall MISSION already records for Gumroad, Apify and
WordPress.org.

---

## 1. The YPP tiers, as far as I could establish them

| Tier | What it unlocks | Threshold (today) | Threshold from 1 Feb 2027 | Grade |
|---|---|---|---|---|
| Lower ("expanded YPP") | Fan funding (memberships, Super Thanks etc.), Shopping | 500 subscribers + 3 valid public uploads in last 90 days + (3,000 valid public watch hours / 12 months **or** 3M valid public Shorts views / 90 days) | Not reported as changing in any snippet I saw. UNKNOWN | SNIPPET |
| Full (ad revenue) | Watch-page ads, YouTube Premium revenue share | 1,000 subscribers + (4,000 valid public watch hours / 12 months **or** 10M valid public Shorts views / 90 days) | 1,000 subscribers + (**8,000** qualified watch hours / 365 days **or** **20M** qualified Shorts views / 90 days) | SNIPPET |

- Sources for the tiers: search summaries citing air.io, vidiq.com, tella.com, 1of10.com, nexlev.io and
  `support.google.com/youtube/answer/72851` (search 1). All of these except Google sell creator tools or
  services, so their numbers are marketing-adjacent. The official page is egress-blocked here.
- Sources for the 2027 change: search 2 returned tbreak.com, redsharknews.com, vidiq.com, cined.com,
  business-standard.com (URL dated 2026-08-11), newsshooter.com (URL dated **2026-08-10**) and two official
  URLs I could not open: `blog.youtube/news-and-events/youtube-partner-program-updates-2027-new-opportunities-earn/`
  (EGRESS_BLOCKED on WebFetch) and `support.google.com/youtube/answer/12843009`. One summary also says that
  "existing Partner Program members accept the new terms by January 31, 2027 and keep the lower maintenance
  requirements", and that new creators need "10 million in 90 days to share in Shorts ad and subscription
  revenue." I cannot reconcile that second sentence without the primary text. **SNIPPET, but several
  independent outlets agree, and two of them carry an August 2026 date in the URL.**
- **Other account requirements** (search 1 summary, aggregator): follow the monetization policies, live in an
  available country or region, have no active Community Guidelines strikes, have **2-Step Verification** on,
  have **advanced features access**, and link an active **AdSense for YouTube** account. *SNIPPET.*
- **Brand-deal platform:** YouTube BrandConnect was merged into **"YouTube Creator Partnerships"** on
  2026-03-24. Its requirements are 18+, YPP membership, an available country, no active strikes and
  compliance with the monetization policies. The launch countries named are US, India, Indonesia, UK,
  Brazil, Australia and Canada, "since expanded" to others. **Israel is not named.** *(SNIPPET, search 6.
  Official page seen: `support.google.com/youtube/answer/9385307`.)*

### Is Israel eligible?
- **No rendered page establishes it either way.** The rendered monetization-policies page says only:
  "Monetization features may not be available in all locations." Its one named exclusion is Russia
  [RENDERED research/rendered/youtube-monetization-policies.txt:312-314].
- Search 7 summary: "Israel, Italy, Jamaica, Japan, and Jordan are all available locations where the YouTube
  Partner Program is available… Israel, Italy, Japan, and Jordan are among the countries where the expanded
  YouTube Partner Program has rolled out." **SNIPPET, medium-low.** I put the country names in the query,
  and a summarizer can echo a query back. The official pages the search surfaced are
  `support.google.com/youtube/answer/7101720?hl=en` (availability),
  `support.google.com/youtube/answer/13429240` (expanded YPP) and
  `support.google.com/youtube/troubleshooter/13536952?hl=en` (expanded-YPP eligibility checker).
- Prior repo research agrees: YPP/AdSense Israel is "YES, medium confidence"
  [CODE research/colony-sweep/scouts/bounties-grants--creator-funds.md §1]. The content-seo auditor
  called AdSense-to-Israel "not UNKNOWN… over-conservative" [CODE research/colony-sweep/audits/content-seo.md:36-40].
- **My grade: ad-revenue tier YES (medium). Fan-funding tier YES (low-medium). Creator Partnerships UNKNOWN,
  leaning no.**

---

## 2. What a reviewer checks before money flows (this is where timeline and approval meet)

Reaching the threshold only lets the channel **apply**. The rendered policy text:

- "If you're making money on YouTube, your content should be original and 'authentic.' … Be your original
  creation… Not be mass-produced, generic, repetitive, or manipulative."
  [RENDERED research/rendered/youtube-monetization-policies.txt:80-84]
- "our reviewers may focus on your channel's: Main theme / Most viewed videos / Newest videos / Biggest
  proportion of watch time / Video metadata (including titles, thumbnails, and descriptions) / Channel's
  'About' section" [RENDERED …:86-98]
- Not allowed to monetize: "AI-generated content made with generic or unoriginal templates giving the
  impression of mass production without adding the creator's original, authentic insights or perspective"
  [RENDERED …:140]
- Allowed: "Content that utilizes creative tools to assist in delivering a unique, well-researched, or
  creative narrative, like using AI to edit your video scripts or generate a unique background visual"
  [RENDERED …:226]. "If you use automated tools or templates to help create your content, the final product
  must still demonstrate your creative vision" [RENDERED …:216]
- **AI Personas Related to Sensitive Topics:** "channels that use AI-generated personas to deliver information
  on sensitive topics… health, legal issues, finances, or politics… will not be allowed to monetize."
  Named examples: "An AI 'doctor'…", "**AI-generated podcast hosts offering financial guidance, investment
  tips, or wealth management advice**", "AI personas giving legal advice" [RENDERED …:242-252]
- Unsatisfying content: "mimics existing formats or stories to a degree that the videos feel interchangeable"
  [RENDERED …:210]. Reused: "Content that exclusively features readings of other materials you did not
  originally create" [RENDERED …:204]
- Since 2025-03-10 reviews "may receive an additional review that may be completed by a human"
  [RENDERED …:64]
- If a channel is demonetized, "you should not create new (or use existing) channels to get around these
  restrictions… Doing so could lead to termination of all channels." [RENDERED …:288]

**What this means for the reel (INFERENCE).** Prompt 1 filters for niches with "RPM metrics that must be
>$7". Prior repo research quotes secondary sources putting $9–14 on AI/education and $25–45 on finance
[CODE research/tiktok/06-faceless-video-tooling.md §3.5, low-medium confidence]. So the prompt steers
toward exactly the categories that §242-252 names. A faceless channel narrated by a synthetic voice and
giving financial "tips" is the named example, not an edge case. Prompt 3 ("Model [insert viral competitor
video] script") steers toward §204/§210. **The fastest route to the threshold, as the reel describes it,
is also the route most likely to fail review after the threshold.** Only a channel that avoids both, with
real research and its own perspective, is worth timing at all. That quality question belongs to a sibling
scout; here it matters only because a failed review means a timeline of never.

---

## 3. AdSense for YouTube payout to Israel

**Mechanics (RENDERED, `support.google.com/youtube/answer/14728151`, captured 2026-09-25):**

- Monthly cycle. Earnings are adjusted after month end for "Invalid traffic / Copyright claims and disputes /
  Certain ad campaign types / **Taxes on earnings from US viewers**", and "If you're outside of the US, you
  may also be liable to pay taxes to your country or region of residence."
  [RENDERED research/rendered/youtube-ypp-payout.txt:68-78]
- "Between the 7th–12th of the month: Earnings are finalized and posted in AdSense for YouTube." [RENDERED …:86-90]
- "On the 20th… Your total balance on the 20th must reach the payment threshold of your currency to be paid
  that month. If your balance doesn't meet the payment threshold, it's rolled over to the next month."
  [RENDERED …:98-102]
- "Between the 21st–26th of the month: Payment issued" [RENDERED …:110-114]. Arrival times: EFT up to 7 business
  days, Hyperwallet 1–2 days, **wire up to 15 business days**, check 2–4 weeks [RENDERED …:116-122]
- "Can I get paid early? No" [RENDERED …:130-132]
- Separate AdSense and AdSense for YouTube payments accounts each need to reach the threshold [RENDERED …:104]

**Method for an Israeli account (RENDERED, `support.google.com/adsense/answer/3372975`):** "Google sends your
earnings in U.S. dollars or Euros, depending on your account currency, via international wire transfer"
[RENDERED research/rendered/adsense-payment-3372975.txt:42]. Wire fields are account holder name, bank name,
SWIFT-BIC and IBAN, with optional intermediary bank details [RENDERED …:74-112]. The rendered page has **no
Israel row** (grep for "Israel" returns nothing). Whether EFT or Hyperwallet is offered in Israel is UNKNOWN.
The table that settles it is `support.google.com/adsense/answer/1714398?hl=en` (named in
`research/colony-sweep/scouts/content-seo--ad-networks.md`, still unrendered). **INFERENCE: plan on a USD wire
to an Israeli bank.**

**Minimum:** the rendered pages say "the payment threshold of your currency" and give no number. Prior repo
research: $100 for USD accounts [CODE bounties-grants--creator-funds.md §1, SNIPPET-grade there]. **The $100
figure stays SNIPPET.** The AdSense nav titles "Payment thresholds" and "Change your AdSense payment threshold"
exist [RENDERED research/rendered/adsense-payment-7164703.txt:154-156], but their pages were not captured.

**Holds:** violations can delay payment "up to 90 days" [RENDERED youtube-monetization-policies.txt:318-320].
"Payment hold because you haven't confirmed your personal information" is its own help article
[RENDERED adsense-payment-7164703.txt:174 (nav title only)].

**Timing, first payout (INFERENCE from the rendered cycle):** earnings accrued in month M are paid, at the
earliest, 21st–26th of M+1 plus up to 15 business days by wire. That is **~7–9 weeks after the start of the
first month whose cumulative balance crosses the threshold.**

---

## 4. US tax withholding, and what fraction the owner keeps

- The rendered payout page confirms US-viewer tax is deducted during finalization [RENDERED youtube-ypp-payout.txt:76].
  The AdSense tax nav includes "Submit your US tax info to Google", "Submit your non-US tax info to Google" and
  "Will I have to pay taxes on my AdSense earnings?" [RENDERED adsense-payment-7164703.txt:205-222 (titles only)].
- **Rates (SNIPPET, search 4, citing vidIQ, which sells a creator tool, and `support.google.com/youtube/answer/10390801`):**
  - **No tax info on file:** "Google may be required to withhold up to **24%** of their total earnings
    **worldwide**", not only the US share.
  - **Tax info, no treaty claim:** **30%** of earnings from US viewers.
  - **W-8BEN with a treaty claim:** the treaty rate on US-viewer earnings only.
- **US–Israel treaty (SNIPPET):** "Article 14 caps copyright and film royalties at **10%** and industrial
  royalties at 15%." Source: search summary; the treaty PDF `https://www.irs.gov/pub/irs-trty/israel.pdf` is
  EGRESS_BLOCKED. Which category Google applies to YouTube ad revenue is **UNKNOWN**. The 10% line is the
  plausible one (INFERENCE), not a verified fact.
- **Does the treaty claim need a US ITIN, or will an Israeli TIN do?** UNKNOWN. Prior repo research says an
  ITIN is "typically" needed and to "verify with an accountant" [CODE research/tiktok/01-monetization-israel.md:357-362].

**Fraction kept, before Israeli tax (INFERENCE; the US-viewer share of revenue is UNKNOWN, so it is a parameter):**

| US-viewer share of revenue | W-8BEN + treaty (10%) | W-8BEN, no treaty (30% of US) | No tax info (24% of all) |
|---|---|---|---|
| 30% | keeps 97% | keeps 91% | keeps 76% |
| 50% | keeps 95% | keeps 85% | keeps 76% |
| 70% | keeps 93% | keeps 79% | keeps 76% |

After that come: incoming-wire and FX spread at the Israeli bank (UNKNOWN), then Israeli income tax and
Bituach Leumi on the net as business income (owner-specific, UNKNOWN; I will not invent a bracket). Whether the
US withholding is creditable against Israeli tax is plausible under the treaty but UNKNOWN here. **The
load-bearing takeaway: file the W-8BEN with the treaty claim before the first payout. Otherwise 24% of
everything is withheld.** RPM figures are conventionally the creator's revenue per 1,000 views *after*
YouTube's share. That is my understanding, not something I could source this session, so treat it as UNKNOWN.

---

## 5. How long does a new faceless channel take to reach the threshold? The evidence, and how weak it is

| Claim | Publisher / seller | Weakness | Grade |
|---|---|---|---|
| "In vidIQ's July 2026 analysis, 40.6% of channels with at least one public subscriber had reached 1,000 subscribers" (research page titled "YouTube Subscriber Benchmarks 2026: 61M Channels") | vidIQ, **sells a channel-growth SaaS** | Denominator is channels with ≥1 public subscriber in vidIQ's index. It is survivor-selected, not "new channels started". It measures subscribers only, not the 4,000/8,000 watch hours. Not faceless-specific. Page EGRESS_BLOCKED, so I could not read the method. | SNIPPET, weak |
| "The average time to 1,000 subscribers is 254 days" | Unattributed in the summary (among vidIQ, indiy.com, scalelab.com, creaticalc.com, berryviral.com) | An average from an unknown sample. Survivors only, because channels that never reach 1,000 cannot contribute a time. | SNIPPET, very weak |
| "The average timeline to hit 1,000 subs is somewhere around 22 months" | Unattributed | Contradicts the 254 days by about 2.6×. That disagreement is itself the finding. | SNIPPET, very weak |
| "6 to 12 months when posting consistently" | AIR Media-Tech (per the summary), a creator-services / MCN firm that **sells monetization services** | Guru-tier. No sample. | SNIPPET, very weak |
| "Average YouTube monetization approval time is around 30 days" | Unattributed | Review duration only | SNIPPET, weak |

**Plainly:** I found **no distribution**, meaning no share of new channels that reach YPP within N months,
and nothing on faceless or AI-assisted channels at all. Every number comes from a company that sells growth
tools or services, and all of them are survivor-biased. Nobody should plan on any of these figures. The
honest instrument is our own channel's analytics after a small, bounded test (§9).

**Arithmetic on the watch-hour gate (INFERENCE; the average view duration, AVD, is an assumption, not data):**

| Target | Hours | Views needed at 4-min AVD | at 6-min AVD | Pace required |
|---|---|---|---|---|
| Old gate, beat the 1 Feb 2027 cut-off (~4 months) | 4,000 | 60,000 | 40,000 | ~1,000 h/month from a standing start |
| Old gate, 12-month window | 4,000 | 60,000 | 40,000 | ~333 h/month |
| New gate from 1 Feb 2027 | 8,000 | 120,000 | 80,000 | ~667 h/month sustained over 365 days |

Shorts views do not help a long-form application except through their own separate 10M/20M route. Prior
repo research puts Shorts RPM at $0.01–0.07 [CODE docs/REJECTED.md, faceless section].

---

## 6. Timeline to the first ledger transaction (INFERENCE)

**Best case** (start 2026-10-01): old threshold reached by ~2027-01-15, three and a half months from zero,
which is faster than any of the weak benchmarks above. Apply, and review takes up to ~30 days (SNIPPET), so
approval comes around mid-February 2027. Whether a channel that applies before 1 Feb 2027 but is reviewed
after it is held to the old or the new threshold is **UNKNOWN**. Ads run from late February. If March
earnings clear the ~$100 threshold (about 14,300 monetized views at the reel's own $7 RPM floor; RPM
unverified), March is finalized 7–12 April, paid 21–26 April, and the wire lands by **~mid-May 2027**.
**About 7.5 months from today, in the best case.**

**Realistic case:** the channel misses the old cut-off and faces 8,000 hours. The benchmarks, weak as they
are, put 1,000 subscribers alone at 8 to 22 months for the channels that get there. So first money arrives
**10 to 14+ months out, or never**, and "never" includes a failed inauthentic-content review.

**At target (INFERENCE):** ₪20,000 ≈ **$5,405/month** at 3.7 ILS/USD. That is **~772,000 monetized long-form
views a month at $7 RPM**, ~540,000 at $10, ~360,000 at $15, before withholding. The RPMs come from the reel's
own filter and repo secondary sources, not from measurement.

---

## 7. Reel prompt 6, tested

**"Monetized in the next 30 days": false as a plan.** It requires 1,000 subscribers plus 4,000 public watch
hours (roughly 40,000–60,000 long-form views on my assumptions) accumulated in under a month, *plus* a
review that summaries put at around a month. From 1 Feb 2027 the hour requirement doubles. A single viral
video can in principle do it. That is a lottery ticket, not a step, and the reel's own prompt is dated
("ideas that are relevant in 2025"). *(INFERENCE on SNIPPET thresholds.)*

**"Placed advertisements I can run on my channel":**

1. **YouTube ads.** They need the ad-revenue tier of YPP. Nothing runs before that. (SNIPPET)
2. **Sponsorships through YouTube Creator Partnerships (ex-BrandConnect).** They need YPP membership and an
   available country, and Israel is not named in any snippet (SNIPPET). Even where available, a brand deal is
   a negotiated campaign with a brief and brand review. MISSION rule 1 says "The owner does not talk to
   customers." An agent can correspond for the brand name, but the contract counterparty and payee would be
   the owner. Whether the platform shows the brand his legal name is UNKNOWN. **Verdict: not available in 30
   days, and not available until YPP plus an Israel country check.**
3. **Direct sponsorships by email.** No platform gate, but a brand-new channel has no audience to sell.
   Every deal is a negotiation, which is exactly the per-deal human work MISSION constraint 4 rules out at
   scale. INFERENCE: ~₪0 before thousands of views per video.
4. **Affiliate links in descriptions.** These need no YPP. The repo's affiliate scout found PayPal-paying and
   wire-paying networks reachable from Israel (CJ: wire). Amazon Associates is "UNKNOWN, leaning unusable"
   because its fallback payout is a cheque or gift card. ClickBank/Digistore24 are payable but AMBER on the
   constitution [CODE research/colony-sweep/scouts/content-seo--affiliate-networks.md:47-61, 86-166]. YouTube's
   own Shopping affiliate programme is reported to be expanding "to 35 markets by year-end" (SNIPPET, ppc.land).
   Israel is UNKNOWN. **This is the only "advertisement" that can run from day 1. With no traffic it is also
   worth ₪0 on day 1 (constraint 7).**

---

## 8. The owner's one-time steps, and which ones expose his legal name

| # | Step | Required by | Who sees the legal name | Grade |
|---|---|---|---|---|
| 1 | A personal Google Account (existing or new) | Everything | Google only | INFERENCE |
| 2 | **Turn on 2-Step Verification** on it | YPP requirement | Google (phone / security key) | SNIPPET |
| 3 | Create the channel as a **Brand Account** under the brand name, then add the colony's operator Google account as **Manager** so agents never need his password or his 2SV prompt | Anonymity rule (MISSION "פרסום בעילום שם") plus the "owner does nothing" rule | Public sees the brand name only (INFERENCE). **If the channel is created on the personal account itself, it may default to his account name.** Brand Account is the fix; I did not verify the default. | INFERENCE |
| 4 | **Advanced features** access (verification of the channel) | YPP requirement | Google only (phone or ID, method UNKNOWN) | SNIPPET |
| 5 | At threshold: apply to YPP and **accept the YPP terms**. This is a contract, so it is his act, not ours (MISSION rule 1: "Never… answer an identity check") | YPP | Google | SNIPPET / CODE (MISSION.md) |
| 6 | **Create/link an AdSense for YouTube account**: payee legal name, postal address, identity verification | Payout | Google only | RENDERED nav titles "Set up an AdSense for YouTube account…", "Enter your payments information", "Verify your identity" [youtube-ypp-payout.txt:198-202]; details UNKNOWN |
| 7 | **Address verification (PIN)**: a PIN mailed to his postal address, entered once | Payout | Google only | RENDERED nav titles [youtube-ypp-payout.txt:210-214]; trigger amount UNKNOWN |
| 8 | **Bank wire details**: account holder name, bank, SWIFT-BIC, IBAN, entered "exactly as they appear on file with your bank" | Payout | Google plus the banks | RENDERED [adsense-payment-3372975.txt:54-112] |
| 9 | **US tax form in AdSense (W-8BEN)** with the US–Israel treaty claim; possibly an ITIN (UNKNOWN) | Otherwise 24% of worldwide earnings is withheld | Google and IRS only | SNIPPET / CODE |
| 10 | Israeli side: open a **תיק עוסק** (עוסק פטור can be opened online) and register with ביטוח לאומי; report the income | Israeli law | רשות המסים / ביטוח לאומי, not public (INFERENCE) | CODE [research/tiktok/01-monetization-israel.md:363-370] |
| 11 | Optional, later: grant the colony's account **user access in AdSense** so payments can be read into the ledger with a transaction reference without him | MISSION rule 2 (ledger) | Google | RENDERED nav titles "Add a user to your account" [youtube-ypp-payout.txt:224], "Manage payments users in your AdSense account" [adsense-payment-7164703.txt:164] |

**Not required of him:** camera, voice, on-screen presence, public ID.

**Exposure vectors I could NOT rule out (all UNKNOWN; they need checking before launch, not after):**
- Whether a **copyright counter-notification** (likely with stock or Sora footage) passes the uploader's legal
  name and address to the claimant. My understanding of the US DMCA counter-notice is that it does, but I
  have no source for that this session.
- Whether Creator Partnerships or affiliate contracts show the brand his legal name.
- Whether YouTube shows any **trader/contact disclosure** on the channel page for monetizing channels in some
  jurisdictions.

**Recurring owner work:** in principle none after these steps. Unknowns: whether AdSense re-verifies identity,
and whether the W-8BEN expires and needs re-filing.

---

## 9. What MISSION requires before anything is built (constraints 3, 7, 8)

- **Constraint 3 (no account farm):** one channel satisfies it. The rendered policy also forbids spinning up
  replacement channels after a demonetization [RENDERED youtube-monetization-policies.txt:288]. So there is
  exactly **one** shot per owner identity, and a failed review is expensive.
- **Constraint 7 (acquisition channel):** YouTube Browse/Search/Suggested. It ranks on prior success, the
  same property MISSION records for three other platforms. **The cheapest test that a stranger can find it**
  (INFERENCE, proposed for the supervisor): one Brand Account channel with a small fixed batch of long-form
  videos. Measure **impressions and watch hours from non-owner traffic sources in YouTube Analytics** over a
  fixed window. That costs no money and needs no YPP. **Kill gate proposal:** if the trailing-28-day watch
  hours at day 60 are not on a pace of ≥667 h/month (the 8,000-hour gate), the line is not a revenue line on
  any horizon MISSION cares about.
- **Constraint 8 (non-public input):** accumulated channel history (subscribers, watch time, a clean
  policy record) is exactly shape 1, "accumulated operating history on a platform where history is a ranking
  input." That is the honest argument *for* starting early if the line is approved at all. The 1 Feb 2027
  doubling makes "early" worth something concrete, but only if the content passes §2.
- **Upload automation (tangential):** the rendered quota page gives a default of "100 videos.insert calls"
  per day in their own bucket, with a cost of 1 per call [RENDERED research/rendered/youtube-api-quota-cost.txt:169-173].
  The **same page** still says videos.insert costs 1600 points [RENDERED …:163]. The page contradicts itself,
  but either way one video a day fits. Whether uploads from an **unaudited** API project are restricted
  (for example forced private) is **UNKNOWN**. I have a recollection of such a rule and no source, so it must
  be checked before relying on API upload.

---

## 10. What I could not verify

1. **The YPP thresholds themselves.** Every figure is SNIPPET (aggregators plus summaries). `support.google.com`
   is not in the rendered set for answer/72851.
2. **The 1 Feb 2027 doubling.** SNIPPET from several outlets; the official blog and help URL are blocked. Also
   unknown: whether the lower (fan-funding) tier changes too, and whether an application pending on 1 Feb 2027
   is grandfathered.
3. **Israel on the YPP, expanded-YPP and Creator Partnerships country lists.** SNIPPET for the first two
   (echo risk); nothing at all for the third.
4. **The AdSense payment threshold for an Israeli account, and which payment methods Israel gets** (wire only?
   EFT? Hyperwallet?).
5. **The US–Israel treaty rate Google applies to YouTube revenue** (10% vs 15%), and **whether an ITIN is
   needed**.
6. **The US-viewer share of revenue** for an English channel, which drives §4. It is also unknown whether US
   withholding is creditable against Israeli tax.
7. **Any distribution of time-to-YPP for new channels.** None found. Every figure is vendor-published and
   survivor-biased.
8. **RPM for any niche.** Not measured. The reel's ">$7" is an input to a prompt, not data.
9. **YPP review duration** (SNIPPET "around 30 days", unattributed).
10. **Whether RPM is net of YouTube's share**, and what the split is. From memory only, so not claimed.
11. **Legal-name exposure** through counter-notifications, brand-deal contracts, or trader disclosure.
12. **Whether unaudited-API uploads are restricted.**

---

## 11. Sources

| Source | Grade | Used for |
|---|---|---|
| research/rendered/youtube-monetization-policies.txt (support.google.com/youtube/answer/1311392, fetched 2026-09-25T14:48:17Z) | RENDERED | §2, §9, Israel "not all locations" line |
| research/rendered/youtube-ypp-payout.txt (support.google.com/youtube/answer/14728151, 2026-09-25T14:49:01Z) | RENDERED | §3 cycle, §4 US-viewer tax line, §8 nav titles |
| research/rendered/adsense-payment-3372975.txt (support.google.com/adsense/answer/3372975) | RENDERED | §3 wire USD/EUR, wire fields, §8 step 8 |
| research/rendered/adsense-payment-7164703.txt (support.google.com/adsense/answer/7164703) | RENDERED | §3 cycle, holds, thresholds nav, tax nav, users nav |
| research/rendered/youtube-altered-synthetic-disclosure.txt (answer/14328491) | RENDERED | Read; Sora clips of realistic scenes need the "AI use" label (lines 63-79, 133). Not a payment gate, so not used above. |
| research/rendered/youtube-api-quota-cost.txt, youtube-api-compliance-audits.txt | RENDERED | §9 upload quota (and the page's self-contradiction) |
| docs/REJECTED.md faceless section; research/tiktok/06-faceless-video-tooling.md §3.2, 3.5, 6, 9 | CODE | Prior verdict, RPM secondary figures, reopen trigger |
| research/colony-sweep/scouts/bounties-grants--creator-funds.md §1 | CODE | Prior YPP/AdSense-Israel grade, $100 minimum |
| research/colony-sweep/audits/content-seo.md:36-40, 195-199 | CODE | AdSense-Israel grade, English-property angle |
| research/colony-sweep/scouts/content-seo--affiliate-networks.md | CODE | §7 affiliate payability to Israel |
| research/colony-sweep/scouts/content-seo--ad-networks.md S2 | CODE | Unrendered AdSense payment-methods-by-country URL |
| research/tiktok/01-monetization-israel.md:357-370 | CODE | W-8BEN/ITIN, תיק עוסק |
| MISSION.md constraints 3, 7, 8; rule 1; anonymity section | CODE | §0, §8, §9 |
| Search 1: air.io, vidiq.com, tella.com, 1of10.com, nexlev.io, milx.app, support.google.com/youtube/answer/72851 | SNIPPET | Tier thresholds, account requirements |
| Search 2: tbreak.com, redsharknews.com, vidiq.com, cined.com, business-standard.com, newsshooter.com (2026-08-10), blog.youtube (blocked), support.google.com/youtube/answer/12843009 | SNIPPET | 1 Feb 2027 doubling |
| Search 3: support.google.com/youtube/answer/13429240, vidiq.com, air.io | SNIPPET | Expanded tier thresholds; "138 / 99 countries" (unattributed) |
| Search 4: vidiq.com (sells tools), support.google.com/youtube/answer/10390801, support.google.com/adsense/answer/10735961, IRS treaty PDF (blocked) | SNIPPET | 24% / 30% / treaty rates; Israel Art. 14 10%/15% |
| Search 5: vidiq.com research (blocked), indiy.com, scalelab.com, creaticalc.com, berryviral.com, studiobinder.com, tubebuddy.com | SNIPPET | §5 timeline claims (weak) |
| Search 7: support.google.com/youtube/answer/7101720, …/13429240, troubleshooter/13536952, kristinagod.com (Medium), wildandfreetools.com | SNIPPET | Israel on YPP lists (echo risk) |
| Search 6 (BrandConnect): hireinfluence.com, ppc.land, support.google.com/youtube/answer/9385307, creamate.ai, socialrevver.com | SNIPPET | Creator Partnerships rename, requirements, countries |
| GitHub code search: jamalmazrui/AppHelpGuides YouTubeMusic.htm (a copied YouTube help guide) | CODE (third-party) | Checked for a YPP country list. It has only Music/Premium/podcast lists, **not YPP**, so it is not used as evidence. Dead end, recorded. |
| WebFetch attempts: air.io, blog.youtube, www.irs.gov, vidiq.com | — | All EGRESS_BLOCKED, one attempt each, not retried |

## 12. Search log: 7 calls against a budget of 6 (one over)

1. YPP thresholds, both tiers (aggregators plus a Google help URL)
2. The 1 Feb 2027 change (several outlets plus two blocked official URLs)
3. Expanded-tier countries: Israel not confirmed
4. US withholding plus the US–Israel treaty
5. Time to 1,000 subscribers / time to YPP: weak, vendor-published
6. BrandConnect / Creator Partnerships eligibility and countries
7. Israel on the YPP availability list: **this call exceeded the budget of 6.** I miscounted mid-task and
   believed one search remained after call 5. It produced only an echo-risk SNIPPET (§1), so the overage
   bought little. It is recorded here rather than hidden.

Non-search network use: 4 WebFetch attempts (air.io, blog.youtube, www.irs.gov, vidiq.com), all
EGRESS_BLOCKED, one attempt each, none retried. Two GitHub code searches and one raw.githubusercontent.com
download, which did not touch the WebSearch budget.
