# SCOUT: RPM evidence. Which long-form niches credibly clear $7 RPM for a faceless English channel, and what view volume does the target need?

**Date:** 2026-09-25. **Tier:** scout (Opus). **Search budget:** 7 allowed, **7 used**. One of the 7 (search 5)
returned an API error and no results; I count it anyway (§9).
**Input tested:** reel prompt 1, "List 15 Faceless YouTube niches with low competition, high growth potential,
and high RPM metrics that must be >$7" (`research/faceless-youtube/00-owner-reel-2026-09-25.md:30`).

**Grades.** RENDERED means I read the primary page's own text (the GitHub-runner captures in `research/rendered/`).
CODE means a repo file I read. SNIPPET means a search engine's summary of pages I could not open. It is weaker,
and here it is usually weaker still, because the search tool returns one merged summary. In that summary a number
often cannot be tied to a single URL, and where it cannot, I say so. INFERENCE means my own reasoning. UNKNOWN
means unknown. **None of the RPM figures below is RENDERED.** Every page that carried one was either
egress-blocked or never offered by the searches.

---

## 0. Answer

> 1. **No niche is *credibly* established above $7 RPM for a faceless channel by anything I could read.** Every
>    RPM figure found is a SNIPPET from 2026-dated SEO pages. Nearly all of their publishers sell something:
>    AI-video generators, YouTube growth or research tools, or ad-funded "earnings calculator" sites. I saw no
>    analytics screenshot and no dataset with a stated method.
> 2. **The sources agree on direction and disagree on size.** Finance and investing, insurance, real estate,
>    business and marketing, and software/SaaS/tech sit at the top. Entertainment, gaming and "facts" sit at the
>    bottom. **Within a single search summary, finance was given as "$9–$11", "$10–$25" and (in another search)
>    "$11–$19".** The spread is itself the finding: these pages do not measure the same thing.
> 3. **The top of that list is the zone where a faceless AI-narrated channel is least allowed to monetize.**
>    YouTube's rendered policy: channels using "AI-generated personas to deliver information on sensitive topics …
>    such as health, legal issues, finances … will not be allowed to monetize" [RENDERED
>    research/rendered/youtube-monetization-policies.txt:244]. The reel's RPM > $7 filter selects straight into
>    that set, as the policy scout already found [CODE research/faceless-youtube/scouts/policy.md:142-160].
>    What survives both filters is **software/SaaS tutorials, tech explainers and business case-study
>    documentaries**. Their RPM evidence is weaker still: one of the two figures for "AI & Technology" is a
>    **CPM**, not an RPM.
> 4. **Audience geography moves RPM more than niche does** (SNIPPET, consistent in direction across many
>    sources: US "$8–$20+", UK "$7–$16", India "$0.80–$3"). An English channel does not choose its viewers. Its
>    Tier-1 share is UNKNOWN until it is measured, and every "finance RPM" quoted assumes a US-heavy audience.
>    The owner's own residence in Israel does not enter RPM at all (INFERENCE).
> 5. **I found no evidence that a faceless or AI-voice format earns a lower ad *rate*** (UNKNOWN; the ad
>    auction prices the viewer and the context, not the face). **The real faceless discount is a mass at zero.**
>    Under the rendered policies, the inauthentic-content, reused-content and AI-persona rules remove
>    monetization **from the whole channel** [RENDERED …:136-138, :156, :244]. That risk is higher for
>    templated, stock-footage, synthetic-voice output.
> 6. **"Low competition AND RPM > $7" is not a contradiction as a pair. The contradiction is in the triple
>    with volume.** A high RPM comes from the advertiser side. "Competition" in the reel means creators. But the
>    published high-RPM niches sit at the top of every "best faceless niches" list I was shown, so they are not
>    low-competition among faceless channels. A niche that really is low-competition (a narrow B2B tool, say)
>    has too small an audience to supply the volume in point 7 (INFERENCE).
> 7. **Volume.** ₪20,000/month ≈ $5,405 net. After US withholding (the gates scout's range: the owner keeps
>    76%–97%), that takes about **570,000–1,016,000 views every month at $7–$10 RPM**, and **380,000–474,000
>    even at $15**. That is 7 to 25 times the total views the whole YPP application needs over a year, and it
>    is needed every month. ₪1,000/month needs about **28,000–51,000 views/month at $7–$10**. That is the only
>    tier a first test could plausibly show (§6).

---

## 1. RPM is not CPM (keep them apart)

| Term | What it is | Source | Grade |
|---|---|---|---|
| **RPM** | "your total revenue (after YouTube's revenue share) per 1000 views". It includes "ads, channel memberships, YouTube Premium revenue, Super Chat, and Super Stickers" | Search 4, summarising `support.google.com/youtube/answer/9314357` ("Understand ad revenue analytics", YouTube Help) plus creator blogs | SNIPPET (first-party page seen in results, not opened) |
| **CPM** | "the cost per 1000 ad impressions **before** YouTube revenue share" | Same search | SNIPPET |
| **Creator share** | "creators get to keep 55% … and the 45% left goes to YouTube" | Search 4. The summary says "one source notes", with no first-party attribution | SNIPPET, weak. The 55/45 split for long-form watch-page ads is **not rendered** here |

**Why it matters for the arithmetic (INFERENCE).** RPM divides by *all* views, including views that served no
ad. CPM divides by ad impressions. So the view counts in §6 are **total channel views after monetization**, not
"monetized playbacks". If the denominator is all views, the table is correct as it stands. If it were monetized
playbacks, total views would have to be higher still. **The first-party page that settles this is
`support.google.com/youtube/answer/9314357`.** It is on a host the render-watch runner has already reached
(`research/rendered/youtube-ypp-payout.txt` came from `support.google.com`), so it should be rendered next.

**A correction for the repo (INFERENCE, flag only).** `research/tiktok/06-faceless-video-tooling.md:332` gives
long-form faceless RPMs as "$25–45 finance". Search 7 relays "Finance & Investing channels command **$15–$45
CPM**". The upper bounds match, so the repo's "$25–45 RPM" may be a CPM figure labelled as RPM. The policy
scout re-cites it [CODE research/faceless-youtube/scouts/policy.md:152]. It should not be used as an RPM until
a source says RPM.

---

## 2. RPM figures by niche: what was found, who published it, and how weak it is

I opened none of these pages. The publisher column comes from the result title or domain. "Sells" is an
INFERENCE from the domain or title, except for vidIQ, which the gates scout already recorded as selling a
channel-growth SaaS [CODE research/faceless-youtube/scouts/monetization-gates.md, §5].

| Niche | Figure (verbatim as relayed) | RPM or CPM | Where it appeared | Publisher sells? | Grade |
|---|---|---|---|---|---|
| Finance and investing | "$10–$25 per 1,000 views, with top investing and personal-finance channels clearing $30+" | RPM | Search 1 summary. Likely `outlierkit.com/blog/youtube-rpm-finance-niche` ("YouTube RPM Finance Niche 2026: Complete Earnings Guide with Real Data"), but the summary does not say which URL | outlierkit: appears to be a YouTube niche-research tool (INFERENCE) | SNIPPET, weak |
| Finance and investing | "Finance & Investing ($9–$11 RPM), Insurance ($9–$11 RPM), Real Estate ($8–$10 RPM), Investing Tips ($8–$10 RPM), and Marketing & Business ($7.5–$9.5 RPM)" | RPM | Search 1 summary. URL not attributable; candidates include `miraflow.ai` ("YouTube CPM Rates by Niche 2026") and `post-bridge.com` | miraflow: AI video generator. post-bridge: social scheduling tool (INFERENCE) | SNIPPET, weak |
| Personal finance (budgeting, investing, debt payoff) | "typically $7–$9 RPM", described as "slightly less than channels covering active trading or insurance" | RPM | Search 1 summary, same unattributed source | as above | SNIPPET, weak |
| Personal finance | "average … $11–$19, with top creators exceeding $26" | RPM | Search 6 summary, unattributed | unknown | SNIPPET, weak |
| **Personal finance, one named creator** | "Josh Mayo reported earning **$29.30 per 1,000 views** after focusing on high-value topics like credit cards and investing" | RPM ("per 1,000 views") | Search 1 and search 6 summaries, relayed by SEO pages. The original disclosure was not opened. The same summary cites a "Business Insider creator survey", whose syndication at `aol.com/much-money-youtubers-earn-according-202614965.html` is **EGRESS_BLOCKED** | Whether he sells a course: UNKNOWN. **It is a self-report from one creator, with a face, in credit cards, the affiliate-heaviest sub-niche.** It is not a faceless datapoint | SNIPPET, weak |
| Entertainment (the low anchor) | "Business Insider's creator survey found some entertainment channels earning as little as $1.61 per thousand views" | RPM (per 1,000 views) | Search 1 summary, relayed | BI is a news outlet; the relay is SEO-tier | SNIPPET, weak |
| Finance, software, business | "can earn $20 to $40+ per 1,000 views through ad revenue alone" | RPM (per 1,000 views) | Search 6 summary, unattributed | unknown | SNIPPET, weak |
| All niches | Title: "YouTube Pays $0.04–$29 Per 1K Views (By Niche, 2026)" | per 1K views | `post-bridge.com` (title, verbatim) | social tool (INFERENCE) | SNIPPET |
| All niches | Title: "YouTube RPM 2026: $0.50–$20 Per 1,000 Views — Niche, Country, Gaming & Shorts Data" | RPM | `ytmoneycalculator.com` (title, verbatim) | ad-funded calculator site (INFERENCE) | SNIPPET |
| **Faceless, all niches** | "Faceless YouTube revenue ranges from roughly $3–$40 RPM depending on niche and audience. Finance, business, AI, and software channels sit near the top. Entertainment, horror, gaming, and general facts sit lower." Also "$2 in entertainment to over $15 in finance and tech" | RPM | Search 2 summary. Pages: `faceless.my`, `fluxnote.io`, `frameloop.ai`, `unkoa.com`, `outlierkit.com` | faceless.my, frameloop.ai, fluxnote.io: faceless or AI-video tooling (INFERENCE) | SNIPPET, weak |
| Faceless business documentary | "earning some of the highest RPMs in the faceless space ($8–$18) because they attract business-minded viewers that advertisers in B2B, SaaS, and education sectors want to reach" | RPM | Search 7 summary. Pages: `virvid.ai`, `taletok.io`, `fliki.ai`, `genra.ai`, `tugan.ai` | **all AI-video generator vendors** (INFERENCE from domain and titles) | SNIPPET, weak |
| **AI and technology** | "AI & Technology channels earn **$8–$20 CPM**"; "Finance & Investing channels command **$15–$45 CPM**"; "Finance … RPM ranges of $10–15" | **CPM** for AI/tech and the finance upper band; RPM for the last | Search 7 summary, same vendors | AI-video vendors | SNIPPET, weak |
| Prior repo figure | "$2–4 gaming, $9–14 AI/education, $25–45 finance" (long-form faceless) | labelled RPM (see §1: possibly CPM) | [CODE research/tiktok/06-faceless-video-tooling.md:332], itself "SEO tier, low-medium" | — | CODE of SNIPPET |
| Web (not YouTube), for comparison | "finance, insurance, legal, B2B software $15–40+ with US traffic; same finance site with Asian traffic $3–8" | web page RPM | [CODE research/colony-sweep/scouts/content-seo--programmatic-calculators.md:29], monetizemore.com snippet | ad-ops vendor | CODE of SNIPPET |

**What the table does and does not show (INFERENCE).**
- **Direction: yes.** Across unrelated vendors, finance, insurance, real estate, business, software and tech
  are consistently placed above $7 and entertainment and gaming below $5. That consistency is worth something,
  but not much: these pages plausibly copy each other, and every one of them is published to sell the reader
  on starting a channel.
- **Level: no.** Finance appears as $7–$9, $9–$11, $10–$15, $10–$25, $11–$19 and $20–$40+. Nothing ties any
  figure to an audience mix, a year, a sample size or a format (faceless or not).
- **Faceless-specific evidence: none of disclosure grade.** Every "faceless RPM" figure came from a company
  selling faceless-video tooling (searches 2 and 7). The one faceless case said to be verified (Fortune, §5) is
  an ambient/sleep "history" channel. It earns on watch time, not RPM, and no RPM was relayed.
- **The niches the owner could actually run.** Finance, insurance, real estate, health and legal carry the
  AI-persona rule [RENDERED youtube-monetization-policies.txt:244] and the Israeli investment-advice UNKNOWN
  recorded by the policy scout [CODE research/faceless-youtube/scouts/policy.md, §7]. What remains is
  **software/SaaS tutorials, tech/AI-tool explainers and business case-study documentaries**. Their only
  numbers are "$8–$18" (business documentary, AI-video vendor, SNIPPET), "$8–$20 **CPM**" (AI/tech; RPM
  unknown and necessarily lower after the 45% share and unmonetized views) and a lumped "finance, software, and
  business … $20 to $40+" (SNIPPET, unattributed). **So the honest statement is: $7+ RPM is *plausible*
  for business/software/tech with a Tier-1-heavy audience, and *not established* by any source I could read.**

---

## 3. Is "low competition AND RPM > $7" internally consistent?

**It is not a logical contradiction, but it is an unstable gap that is almost certainly already closed for any
niche an LLM or a listicle can name (INFERENCE).**

1. **Two different markets.** RPM is set on the demand side: advertisers bidding for an audience (search 3
   summary: "RPM is higher in the USA because advertisers compete more aggressively for American audiences";
   SNIPPET). "Low competition" in the reel means the supply side: few creators making videos for that audience.
   A niche can in principle have many advertisers and few creators, so the pair is not self-contradictory.
2. **But the list the prompt would produce is public, so it is crowded.** The first result pages for faceless
   niches (searches 2 and 7) were entirely listicles: "18 Best Faceless YouTube Niches in 2026" (fliki.ai),
   "100 Ideas + CPM Data" (outlierkit.com), "20 Profitable Niches" (virvid.ai), "27 Faceless YouTube Channel
   Ideas" (taletok.io), "8 Profitable Niches" (udaanx.substack.com). All of them converge on finance, business,
   tech and AI (SNIPPET, titles verbatim). Every faceless aspirant is shown the same high-RPM list, so the
   niches on it are, by construction, not low-competition among faceless channels. An LLM asked for "15 low
   competition, RPM > $7 niches" has no creator-count or search-volume data. Its answer can only be a
   re-statement of that same public list (INFERENCE). That also fails MISSION constraint 8: nothing about it is
   a non-public input.
3. **Where a real gap can exist, it is small.** A genuinely under-served, high-RPM audience is a narrow one,
   such as tutorials for one specific B2B product. A niche that narrow can have a high RPM, but it cannot
   supply 570,000–1,000,000 views a month (§6). **The inconsistent combination is the triple: low competition,
   RPM > $7, and enough views to pay ₪20,000.** (INFERENCE)
4. **Evidence either way: I found no dataset that measures creator competition per niche** (UNKNOWN). The
   claim above rests on the structure of the listicle market (SNIPPET titles) and on arithmetic, not on a
   measured competition index.

---

## 4. Audience geography

| Claim | Source | Grade |
|---|---|---|
| "The United States typically has the highest YouTube RPM, often ranging from $8 to $20+ depending on niche. Finance and SaaS channels targeting American audiences can exceed $25 RPM" | Search 3 summary; pages `ytincome.in`, `incomefromviews.com`, `ytbearnings.com`, `ytface.com`, `milx.app` (calculator and SEO sites) | SNIPPET, weak |
| Title, verbatim: "YouTube RPM by Country 2026 – USA $8–$20, UK $7–$16, India $0.80–$3" | `incomefromviews.com/blog/youtube-rpm-by-country/` | SNIPPET (title only) |
| "US viewers can be worth 10–20× more than viewers from India or Southeast Asia" | Search 3 summary, unattributed | SNIPPET, weak |
| Web AdSense (not YouTube): "Americas typically 2–3x EMEA/APAC" | [CODE research/colony-sweep/scouts/content-seo--converter-utility-sites.md:17], monetizemore.com snippet | CODE of SNIPPET |

**What follows (INFERENCE).**
- The direction is consistent across every source in this repo and in this session: viewer country dominates.
  The size (2–3× for web, 10–20× for YouTube) is unmeasured.
- A channel's RPM is a blend: the sum over countries of (share of views × that country's RPM). Using only the
  snippet figures above, as illustration and not as data: 50% US views at $8 plus 50% India views at $0.80
  blends to about **$4.40**, below the reel's $7 floor, even in a niche whose "US RPM" clears it.
- **An English channel does not choose its audience.** Its Tier-1 share is UNKNOWN until the channel exists.
  It is also the one number that decides whether any niche figure above applies. **Every "finance RPM" figure
  quoted is implicitly a US-heavy figure.**
- **The owner's Israeli residence does not enter RPM.** RPM depends on the viewers, not the channel owner. The
  owner's residence enters only through withholding (§6) and payout (see the gates scout).

---

## 5. Does a faceless or AI-voice format earn a lower RPM?

**The ad rate: no evidence either way (UNKNOWN).** I found no source, weak or strong, that compares the RPM of
faceless or AI-voice channels with on-camera channels in the same niche. Mechanically (INFERENCE), an ad auction
prices the viewer and the content context; it does not see a face. So there is no reason to expect a
per-view discount *if the channel is monetized*.

**The real discount is a probability mass at zero, and it applies to the whole channel.** Rendered YouTube
policy:
- Not allowed to monetize: "Image slideshows, templated storylines, or scrolling text with minimal or no
  narrative, commentary, or educational value", and "AI-generated content made with generic or unoriginal
  templates giving the impression of mass production without adding the creator's original, authentic insights
  or perspective" [RENDERED research/rendered/youtube-monetization-policies.txt:136-138].
- "Our reused content policy applies to your channel as a whole … if we cannot clearly tell that you made the
  content, monetization may be removed from your entire channel" [RENDERED …:156]. Reviewers check "Videos /
  Channel description / Video title / Video descriptions" [RENDERED …:146-154].
- AI personas on "health, legal issues, finances, or politics": "channels uploading this content will not be
  allowed to monetize" [RENDERED …:244].
- Videos that miss the advertiser-friendly guidelines "may have limited ad earnings or no ad earnings"
  [RENDERED …:336].

INFERENCE: the reel's own pipeline raises exactly these risks. Prompt 3 says "Model [insert viral competitor
video] script", and prompt 4 uses stock footage plus Sora 2 clips. For such a channel, the expected RPM is
(probability the channel stays monetized) × (niche and geography RPM), and the first factor is UNKNOWN and below
one. **A faceless channel's RPM distribution therefore has a spike at $0 that an on-camera channel's does not.**
This is the policy scout's finding, restated in RPM terms; the rules are quoted there in full.

**The one "verified" faceless earner relayed (SNIPPET, second-hand).** Search 2 relays that "Adavia Davis, a
22-year-old college dropout, earns $40,000–$60,000 per month across **multiple** faceless channels focused on
ambient and sleep content — verified by Fortune magazine with AdSense screenshots", whose "most lucrative
channel is a 'Boring History' channel with six-hour 'history to sleep to' documentaries". The relay came from
SEO and tool-vendor pages. I did not see a Fortune URL, so I cannot list it for rendering. What it would show
even if true (INFERENCE):
- it is a **multi-channel** operation, the shape MISSION constraint 3 forbids;
- sleep content wins on **watch time**, not RPM;
- it is one survivor.

It is not evidence that a high-RPM faceless niche works.

---

## 6. Arithmetic: views a month for 1,000 / 5,000 / 20,000 ILS

**Inputs.**
- 3.7 ILS per USD (repo figure: [CODE docs/REJECTED.md:43] "₪20,000/month ≈ $5,400").
- The owner's fraction kept after US withholding, from the sibling scout [CODE
  research/faceless-youtube/scouts/monetization-gates.md §4], all SNIPPET or INFERENCE:
  - **95%**: W-8BEN with the US–Israel treaty at 10%, about 50% of revenue from US viewers. **This is the best
    case, not the base case.** A high-RPM English channel's revenue is plausibly US-heavy (§4), which lowers
    the kept share, and the gates scout's table gives 93% at 70% US revenue.
  - **85%**: W-8BEN without a treaty claim, 30% on the US share, about 50% US.
  - **76%**: no tax info on file, so 24% of all earnings is withheld.
- **Israeli income tax, Bituach Leumi and the bank's FX and wire costs are not deducted** (UNKNOWN,
  owner-specific). So the ILS targets below are pre-Israeli-tax. If the target is meant after tax, every figure
  rises.
- RPM is per total view (§1, SNIPPET), so these are total channel views in a month when the channel is
  already monetized. Views before YPP approval earn nothing.

**Gross USD the channel must earn in a month:**

| Target (net) | USD net | Keep 95% | Keep 85% | Keep 76% |
|---|---|---|---|---|
| ₪1,000 | $270 | $284 | $318 | $356 |
| ₪5,000 | $1,351 | $1,422 | $1,590 | $1,778 |
| ₪20,000 | $5,405 | $5,690 | $6,359 | $7,112 |

**Views needed every month (rounded to the nearest 1,000; range = keep 95% to keep 76%):**

| Target | RPM $3 | RPM $5 | RPM $7 | RPM $10 | RPM $15 |
|---|---|---|---|---|---|
| ₪1,000 | 95k–119k | 57k–71k | 41k–51k | 28k–36k | 19k–24k |
| ₪5,000 | 474k–593k | 284k–356k | 203k–254k | 142k–178k | 95k–119k |
| ₪20,000 | **1.90M–2.37M** | **1.14M–1.42M** | **813k–1.02M** | **569k–711k** | **379k–474k** |

(At keep 85% the ₪20,000 row is 2.12M / 1.27M / 908k / 636k / 424k.)

**Videos a month × views per video for ₪20,000** (keep 95% / keep 76%). This assumes each month's views come from
that month's uploads. In reality a back catalogue contributes, which lowers the per-video number over time, but
only after months of accumulation:

| RPM | 4 videos/month (1 a week) | 8 videos/month (2 a week) | 30 videos/month (reel prompt 5's daily calendar) |
|---|---|---|---|
| $3 | 474k / 593k each | 237k / 296k each | 63k / 79k each |
| $5 | 284k / 356k | 142k / 178k | 38k / 47k |
| $7 | 203k / 254k | 102k / 127k | 27k / 34k |
| $10 | 142k / 178k | 71k / 89k | 19k / 24k |
| $15 | 95k / 119k | 47k / 59k | 13k / 16k |

For ₪5,000, divide every cell by 4. For ₪1,000, divide by 20.

**What the tables say (INFERENCE).**
- **Scale against the entry gate.** The gates scout puts the YPP watch-hour gate at about 40,000–60,000 views
  over 12 months under the current rule, and 80,000–120,000 under the 8,000-hour rule from 1 Feb 2027 [CODE
  research/faceless-youtube/scouts/monetization-gates.md §5, AVD-assumption-based]. The ₪20,000 target at $7 RPM
  needs **813k–1.02M views in one month**. That is about **7× to 25× the entire qualification volume, every
  month, from one channel**. The gates scout's "~772,000 at $7" figure is the same arithmetic before
  withholding, and it matches.
- **The daily calendar does not rescue it.** 30 videos a month at 27k–34k views each is the lowest per-video
  bar in the table. It also means producing 30 distinct, "materially varied", original-substance long-form
  videos a month. That is the upload pattern the inauthentic-content rule and the spam-cluster signals watch
  for [RENDERED youtube-monetization-policies.txt:114-138; CODE docs/REJECTED.md:88-91 on "synchronised upload
  schedules"].
- **The RPM lever is smaller than the geography and policy levers.** Going from $7 to $15 RPM halves the
  volume. A 50/50 US/India audience can push a "$7+ niche" to about $4.40 (§4), and a demonetization sets it
  to $0 (§5).
- **The tier a first test can reveal is ₪1,000**: about 28k–51k views a month at $7–$10. Even that needs YPP
  first. The gates scout puts first payout at best around May 2027, realistically 10–14+ months away, or never.
- **Comparison with the rejected variant.** Shorts at $0.01–$0.07 needed about 77M views a month [CODE
  docs/REJECTED.md:94-95]. Long-form at $7–$10 needs about 0.57M–1.02M. **The English long-form variant
  improves the arithmetic by roughly two orders of magnitude.** That is the one material difference from the
  3.9 rejection this question can confirm. It does not by itself make the target reachable.

---

## 7. What this means for the go/no-go (for the supervisor; INFERENCE)

1. **The reel's niche prompt is the failure mode it looks like.** It asks an LLM for figures the LLM does not
   have. It returns the public listicle consensus (finance/insurance/business/tech). The top of that consensus
   is exactly where an AI-narrated channel is barred from monetizing.
2. **If the line proceeds at all, the niche is software/SaaS/tech/business-explainer, with no persona and no
   advice.** Its $7+ RPM is plausible but unmeasured. Of all the options it fits a faceless format most
   naturally: screen recordings are faceless by nature. That echoes what `docs/REJECTED.md` already left open
   ("our own screen recordings of our own tools").
3. **No external number can stand in for the channel's own analytics.** The only RPM that counts is the
   channel's own, after YPP. That is also the non-public input MISSION constraint 8 asks for, and it does not
   exist until the channel is monetized. A first cheap test can measure **reach and audience-country share**.
   It cannot measure RPM. Whether YouTube Analytics shows audience geography before monetization is my
   understanding, not verified (UNKNOWN).
4. **Plan on ₪1,000/month as the first honest milestone, not ₪20,000.** At the target, the view volume is 7–25×
   the qualification volume every month, and nothing in the evidence says a faceless channel gets there.

---

## 8. What I could not verify

1. **Any RPM figure from a primary or disclosure-grade source.** Every figure in §2 and §4 is SNIPPET. Most
   come from vendors of AI-video or growth tools, or from ad-funded calculator sites. No analytics screenshot
   was seen.
2. **YouTube's own RPM definition and the 55/45 split**: whether RPM divides by all views or monetized
   playbacks, and what is included. `support.google.com/youtube/answer/9314357` was seen, not opened.
3. **The Business Insider creator disclosures** (Josh Mayo's $29.30; the $1.61 entertainment figure). The AOL
   syndication is EGRESS_BLOCKED, and `businessinsider.com` is refused by the search tool's domain filter.
   Whether Mayo sells courses or affiliate products: UNKNOWN.
4. **The Fortune / Adavia Davis case.** It was relayed only by SEO and vendor pages. No Fortune URL appeared
   in results. The RPM of that channel is not given.
5. **Any faceless-versus-face RPM comparison.** None was found.
6. **Any measure of creator competition per niche.** None was found.
7. **The Tier-1 audience share an English faceless channel attracts.** It cannot be known before the channel
   exists.
8. **Whether the repo's "$25–45 finance" RPM [CODE research/tiktok/06:332] is really a CPM** (see §1).
9. **Israeli tax, Bituach Leumi and FX/wire costs** on the payout, and whether US withholding is creditable.
   All owner-specific, all UNKNOWN (the gates scout reached the same result).
10. **The treaty rate Google applies (10% vs 15%) and whether an ITIN is required** (inherited UNKNOWN from the
    gates scout).

---

## 9. Sources and search log

**Rendered and repo sources read**

| Source | Grade | Used for |
|---|---|---|
| research/rendered/youtube-monetization-policies.txt (support.google.com/youtube/answer/1311392, fetched 2026-09-25T14:48:17Z, status 200, not truncated) lines 62, 112-138, 146-156, 244, 336 | RENDERED | §0.3, §0.5, §5, §6 |
| research/rendered/youtube-ypp-payout.txt | RENDERED | confirms `support.google.com` is reachable by the runner (§1) |
| research/faceless-youtube/00-owner-reel-2026-09-25.md | CODE | prompts 1, 3, 4, 5 |
| research/faceless-youtube/scouts/monetization-gates.md §4-§6 | CODE (its own grades: SNIPPET/INFERENCE) | withholding range, gate volumes, first-payout timing |
| research/faceless-youtube/scouts/policy.md §1.5, §7 | CODE | AI-persona collision, YMYL |
| docs/REJECTED.md:43, :68-150 | CODE | 3.7 ILS/USD, Shorts arithmetic, reopen trigger |
| research/tiktok/06-faceless-video-tooling.md verdict box, :328-335 | CODE (SEO-tier inside) | prior long-form RPM figure |
| research/colony-sweep/scouts/content-seo--converter-utility-sites.md:14-23 | CODE (SNIPPET inside) | web geography 2–3× |
| research/colony-sweep/scouts/content-seo--programmatic-calculators.md:29 | CODE (SNIPPET inside) | web RPM by niche and geography |
| research/colony-sweep/scouts/content-seo--ad-networks.md:44-56 | CODE (SNIPPET inside) | Israel/Hebrew CPM has no numbers |

**Search log (7 of 7 used)**

| # | Query (short) | Result | Grade of what it gave |
|---|---|---|---|
| 1 | Business Insider creators RPM personal finance 2025 | influencermarketinghub, post-bridge, learningrevolution, outlierkit, miraflow, checktheworth, balancepro, aol.com (BI syndication) | SNIPPET, SEO tier; one BI relay |
| 2 | faceless channel RPM analytics Business Insider/Fortune/CNBC | fluxnote, unkoa, outlierkit, frameloop, faceless.my, tugan, miraflow, aliteq, becomeviral: all faceless-tool or guide sellers | SNIPPET; Fortune case relayed |
| 3 | RPM by audience country US vs India vs UK | ytincome.in, incomefromviews, dynamoi, ytbearnings, ytface, telepromptero, thesrzone, milx | SNIPPET, calculator/SEO tier |
| 4 | YouTube Help RPM definition, 55% share | support.google.com/youtube/answer/9314357 plus creator blogs (uppbeat, vidiq, mediacube, thoughtleaders) | SNIPPET, first-party URL identified |
| 5 | same as 6, with `allowed_domains: businessinsider.com` | **API error 400: domain not accessible to the search tool.** No results. Counted anyway | none |
| 6 | "Business Insider" YouTuber RPM tech/software/education/personal finance | influencermarketinghub, post-bridge, outlierkit, socialrails, creaticalc, stan.store, milx, ytmoneycalculator | SNIPPET, SEO tier |
| 7 | reddit faceless AI voiceover my RPM | fliki, genra, virvid (×2), outlierkit, tugan, taletok, a Gumroad listing, udaanx substack: **no Reddit result; all vendors** | SNIPPET, vendor tier |

Direct fetch attempted: `https://www.aol.com/much-money-youtubers-earn-according-202614965.html` returned
EGRESS_BLOCKED (one attempt, not retried).

---

## 10. URLs that would settle the load-bearing claims (verbatim as seen in search results)

1. `https://support.google.com/youtube/answer/9314357/understand-ad-revenue-analytics`: the RPM definition,
   its denominator, what it includes, and whether the 55% share is stated. **The highest priority.** The host
   is already reachable by render-watch.
2. `https://www.aol.com/much-money-youtubers-earn-according-202614965.html`: the Business Insider creator
   disclosures, with named RPMs.
3. `https://fluxnote.io/guides/how-much-do-faceless-youtube-channels-make-guide-2026`: to find the original
   Fortune URL behind the Adavia Davis claim.
4. `https://frameloop.ai/blog/faceless-youtube-statistics-2026`: the title claims "Success Rates". Read it to
   check whether any distribution has a stated method.
5. `https://outlierkit.com/blog/youtube-rpm-finance-niche`: it claims "Real Data". Read it to check whether it
   cites screenshots or a sample.
6. `https://creaticalc.com/blog/how-much-do-youtubers-make`: it claims "Forbes Data + Real Disclosures". Read
   it to check which disclosures, and whether RPM or CPM.
