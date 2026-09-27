# AUDIT: rpm-evidence (scout report `research/faceless-youtube/scouts/rpm-evidence.md`)

**Date:** 2026-09-25. **Auditor tier** (Opus). Separation of duties: I checked and built nothing.
**Search budget:** at most 4. **I used 4.** One of them (search 3) was refused with an API error because the
search tool cannot reach reddit.com. I count it anyway. The log is in §6.
**Grades:** RENDERED = primary page text I read in `research/rendered/`. CODE = a repo file I read.
SNIPPET = a search-engine summary, which is weaker. INFERENCE = my reasoning. UNKNOWN = not known.

---

## 0. Verdict on the scout

> **The scout's headline holds. No RPM figure for any niche is established by a primary or disclosure-grade
> source, and at any plausible RPM the ₪20,000 target needs roughly 0.4M–2.4M monetized-channel views every
> month.** I re-derived every cell of both arithmetic tables independently, and all of them match to rounding.
> I opened every rendered line it cites. Every quote is verbatim, apart from one 2-line offset (§1, claim 7).
> My own searches found the same vendor-tier sources. `fluxnote.io` came back in both of my RPM searches that
> returned results, just as it did in the scout's. So the pages that agree with each other are fewer and less
> independent than the scout's source list suggests.
>
> **Four findings are overstated, and two things were missed that bear on the decision:**
>
> 1. **The AI-persona rule is narrower than claim 3 says.** It covers content that "presents itself as a human
>    expert providing advice" [RENDERED youtube-monetization-policies.txt:244]. That is not every AI-narrated
>    video in a finance niche. A finance or business *documentary* with no persona and no advice is not named
>    by it. So the set of niches that pass both filters is wider than claim 4 says, not narrower. The rules that
>    actually hit the reel's method are :140 (templated AI mass production), :204 (readings of material you did
>    not create) and :210 (content that "mimics existing formats"). The `monetization-gates` and `policy` audits
>    reached the same result independently.
> 2. **"Geography moves RPM more than niche does" is not supported.** In the scout's own snippets the two
>    spreads are of the same order. By niche: $1.61 entertainment against $29.30 finance, about 18×. By country:
>    "10–20×". No source compares the two effects.
> 3. **The scout left a rendered first-party line unused, and it answers part of its own question.** "Disclosing
>    AI content won't limit a video's audience or impact its eligibility to earn money" [RENDERED
>    youtube-altered-synthetic-disclosure.txt:173]. My search 2 also found no advertiser setting that excludes
>    AI-generated *creator* videos. It found only settings for labelling one's own AI *ads* (SNIPPET, evidence of
>    absence only). Together these support the scout's reading that the faceless or AI penalty works through
>    policy, as demonetization, and not through a lower rate. But that part of the question is now
>    RENDERED-backed on one side, where the scout had it as UNKNOWN.
> 4. **Constraint 8 is misread in claim 15.** MISSION's qualifying shape 1 is "accumulated operating history on
>    a platform where history is a ranking input" (MISSION.md:219-222). For a channel, that means its watch and
>    subscriber history, which starts accruing with the first public upload. It does not mean the RPM figure.
>    An RPM is a private *measurement*, not a moat.
> 5. **Missed, and decision-relevant: the portfolio framing.** MISSION says the target is reached "by several
>    lines summing to it, not by one line carrying it" (MISSION.md:35-40). The row that matters for a go/no-go
>    is ₪5,000, not ₪20,000. At $7–$10 that is 142k–254k views a month, about 1.2× to 6.4× the 12-month
>    qualification volume every month. That is still a large bar, but it is not the "7–25×" headline.
> 6. **Missed: seasonality.** Every figure in the tables is an annual-average RPM. Vendor-tier snippets put
>    January 30–60% below December. The gates scout's best case puts the first monetized months at
>    February–April 2027, the trough. A kill criterion that reads the first month's RPM would misread it.
>
> **Net effect:** nothing here overturns "not established, and far from the target". The corrections point both
> ways. The persona rule is less restrictive than stated, and one instrument for measuring competition exists
> (§3, angle 4). But seasonality and English tech audiences' skew toward low-RPM geographies (SNIPPET) push the
> other way. The binding question is still whether honest, non-templated content can pass review. That belongs
> to the policy scout, not to RPM.

---

## 1. Claim-by-claim (load-bearing claims tested; the non-load-bearing ones checked more briefly)

| # | Scout claim (short) | Verdict | Why |
|---|---|---|---|
| 1 | No RPM from a primary or disclosure-grade source; all SNIPPET from sellers; no screenshot | **UPHELD** | It accurately describes what was found. My searches 1 and 4 returned the same tier: fluxnote.io (again), identitykit.in, miraflow.ai, makeaivideo.ai, gyre.pro, hub.gigastar.io (which sells creator-revenue investments) and tubeanalytics. No dataset, no method. |
| 2 | Direction consistent (finance/insurance/RE/business/software above $7; entertainment/gaming below $5); levels disagree ($7–9 … $20–40+) | **UPHELD (SNIPPET)** | The six finance figures match the scout's §2 table rows. Caveat: the "consistency" is between pages from a handful of AI-video vendors who plausibly copy each other, and the summarizer merges pages. So it is weaker than "across unrelated vendors" (§2 of the scout) implies. |
| 3 | AI-persona rule bars monetization on health/legal/finance/politics, so the RPM > $7 filter "selects into the niches where an AI-narrated channel is least allowed to monetize" | **WEAKENED** | The quote is verbatim at [RENDERED :244]. The same paragraph scopes it to "channels that use AI-generated **personas**" and "content that presents itself as a **human expert providing advice**". The examples are an AI "doctor", "AI-generated podcast hosts offering financial guidance" and "AI personas giving legal advice" [RENDERED :248-252]. "AI-narrated" ≠ "AI persona presenting as a human expert giving advice". It bites personal-finance advice and insurance-advice formats. It does not obviously bite a finance-history or company-collapse documentary. The scout's §2 also adds "real estate" to the covered set, and the rendered text does not name it. Grading the conclusion RENDERED is inflation: the quote is rendered, but the extension is INFERENCE. |
| 4 | Survivors = software/SaaS tutorials, tech/AI-tool explainers, business documentaries; $7+ plausible with Tier-1 audience, not established; the AI/tech $8–20 figure is a CPM | **WEAKENED** | "Plausible, not established" and "the $8–20 is a CPM as relayed" stand. The enumeration is wrong in two directions. (a) It is too narrow: non-advice, no-persona finance and economics explainers are not excluded by :244 (claim 3). (b) The survivors are the niches most exposed to low-RPM geographies. Search 1 (SNIPPET, fluxnote/identitykit, vendor tier): "If fewer than 40% of views come from the US, UK, Australia, or Western Europe, your blended RPM will stay low regardless of niche", and tech RPM for Indian audiences is given as "$0.72–2.16". No source gives the South-Asian share of an English software-tutorial audience (UNKNOWN). (c) "AI-tool explainers" built from vendor pages and stock clips sit on :204 ("readings of other materials you did not originally create") and :140. Only screen recordings of software the agent actually runs are faceless by nature. |
| 5 | RPM = after-share revenue per 1,000 views incl. Premium etc.; CPM before share; 55% kept (not opened) | **UPHELD (SNIPPET)** | Nothing in `research/rendered/` defines RPM or states 55/45 (I grepped all of it). It is labelled non-load-bearing, but it is the **denominator of every table**: if RPM divided by monetized playbacks, every view count would rise. It is correctly graded SNIPPET, and rendering `9314357` is correctly the first priority. |
| 6 | Geography dominates RPM: US $8–20+, UK $7–16, India $0.80–3; US 10–20× India; direction consistent, size unmeasured | **WEAKENED** | The direction is supported (SNIPPET; my search 1 agrees). "Dominates" and §0.4's "moves RPM more than niche does" are a comparative that no source makes, and the scout's own numbers do not support it: niche spread ≈ 18× ($1.61 → $29.30), country spread 10–20×. The two also interact, because niche selects audience geography. The $4.40 blended example uses the US floor ($8); at the US ceiling ($20) the same 50/50 split gives $10.40. It is fairly labelled "illustration", but it was picked from the pessimistic end. |
| 7 | No faceless-vs-face RPM comparison exists; the documented penalty is channel-level demonetization (a spike at $0) | **UPHELD**, with a missed source | The quotes check out: :138 "Image slideshows…", :156 "applies to your channel as a whole", :244, :336. Offset: the "AI-generated content made with generic or unoriginal templates" bullet is at **:140**, not inside :136-138. Missed: [RENDERED youtube-altered-synthetic-disclosure.txt:173] "Disclosing AI content won't limit a video's audience or impact its eligibility to earn money". It was on the list of rendered pages the scout was told to read, and it is absent from its source table. It rules out the AI *label* as a mechanism for a per-view penalty. Search 2 found no advertiser control that excludes AI-generated creator content (SNIPPET, absence). Grade note: "no source compares" is UNKNOWN/absence, and "spike at $0" is INFERENCE. Only the rule text is RENDERED. |
| 8 | ₪20,000 ≈ $5,405 → 569k–711k views at $10, 813k–1.02M at $7, 379k–474k at $15, 1.14M–1.42M at $5 (keep 95%→76%); ₪1,000 → 28k–51k at $7–10 | **UPHELD (arithmetic)** | Re-derived independently: keep 95% → 1,896,633 / 1,137,980 / 812,843 / 568,990 / 379,327 at $3/$5/$7/$10/$15; keep 76% → 2,370,792 / 1,422,475 / 1,016,054 / 711,238 / 474,158. ₪1,000 at $7–$10: 28,450–50,803. ₪5,000 at $7: 203,211–254,013. Caveats: (a) at the 15% treaty category the best case is 92.5% (50% US), and ₪20,000 at $7 becomes 834,812; (b) US withholding may be creditable in Israel (gates audit, claim 12), so real loss ≤ table; (c) seasonality (§3); (d) §0.7 says "76%–97%" while the tables top out at 95%. The 97% case is 30% US revenue, which the scout itself argues is unlikely for a high-RPM channel. That is a minor inconsistency. The basis (after US withholding, before Israeli tax) matches what the ledger would record on receipt, so it is the right basis. |
| 9 | At $7, the target = 7–25× the entire YPP qualification volume (40k–120k) every month; a 30/month calendar lowers per-video need to 27k–34k, "but that pattern is what the inauthentic-content and spam-cluster rules watch for" | **WEAKENED** | Arithmetic ✓: 812,843/120,000 = 6.8; 1,016,054/40,000 = 25.4; /30 = 27.1k–33.9k. The policy half is overstated. The rendered rules at :114-140 target interchangeable or templated *substance*, not upload *frequency*. The spam-cluster signal the scout cites (REJECTED.md:89, "synchronised upload schedules") groups **several channels** and is not about one channel posting daily. The real limit is capacity: 30 "materially varied" [RENDERED :120] researched long-form videos a month from an agent pipeline, which is where the :140 mass-production signal comes from. Cadence alone is not the named violation. |
| 10 | English long-form improves the arithmetic ~2 orders of magnitude over the Shorts variant (77M) | **UPHELD** | 77M / 772k–540k (like-for-like, before withholding) = 100×–143×; against the after-withholding range it is 76×–135×. Caveat: the 77M was at the *top* of the Shorts range ($0.07), so the comparison, if anything, understates the gap. |
| 11 | Repo's "$25–45 finance" RPM may be a mislabelled CPM (vendor says "$15–$45 CPM") | **UNVERIFIABLE** | The only evidence is a shared upper bound ($45). The scout's own search 6 relays "finance, software, and business … **$20 to $40+ per 1,000 views** through ad revenue alone" as an RPM, so an RPM reading of $25–45 is not contradicted by its own data. Low confidence is correct. But downstream `prompt-critique.md:104` restates it as "**probably** a CPM mislabelled as RPM". That is grade inflation in propagation. |
| 12 | Josh Mayo $29.30/1,000 views, one on-camera self-report via SEO relays; BI blocked | **UPHELD (SNIPPET, low)** | Correctly weighted. Whether "per 1,000 views" there is RPM is itself only relayed. |
| 13 | Adavia Davis $40–60k/month, multi-channel sleep history, no RPM, constraint-3 shape | **UPHELD (SNIPPET, low)** | Nuance: a few distinct channels by one operator is not self-evidently an "account farm" (constraint 3). The relevant repo trap is REJECTED.md's "Just make 50 channels" and the spam-cluster signal. The conclusion (it is not evidence for a high-RPM niche) stands. |
| 14 | Own post-YPP RPM is the only reliable figure and the constraint-8 non-public input; a first test measures reach and country share, not RPM | **WEAKENED** | "Only reliable figure" and "a test cannot measure RPM pre-YPP" stand (INFERENCE). The constraint-8 identification is wrong. MISSION.md:219-222 defines the qualifying input as *accumulated history on a platform where history is a ranking input*. For YouTube that is the channel's watch-time and subscriber history (and, per the gates audit, possibly grandfathered YPP terms). It starts accruing at the first public upload, before YPP. "Whether Analytics shows geography before monetization" is correctly left UNKNOWN; nothing rendered here settles it. |

---

## 2. Grade inflation

1. **Claim 3, graded RENDERED.** The quote is rendered. The conclusion ("the filter selects into the niches where an
   AI-*narrated* channel is least allowed to monetize") stretches a persona-and-advice rule into a topic rule. That is
   INFERENCE, and it is over-broad. It has already propagated: `prompt-critique.md:117` repeats "the RPM > $7 filter selects
   into finance, insurance, health and legal".
2. **Claim 7, graded RENDERED.** Only the policy quotes are rendered. "No source compares faceless and on-camera RPM" is
   evidence of absence (UNKNOWN), and "a spike at $0 RPM" is INFERENCE.
3. **Claim 6, "dominates" / "more than niche", graded SNIPPET.** No snippet makes that comparison. The scout's own numbers
   put the two effects at the same order.
4. **Claim 4's "survivor" list, graded INFERENCE, is fine as a grade.** But its premise (claim 3) is overstated, so the
   list inherits the error.
5. **Downstream, not the scout's own grade.** Claim 11's "may be a CPM" (low confidence) became "probably" in
   `prompt-critique.md:104`.
6. **§2 of the scout calls the vendor pages "unrelated".** `fluxnote.io` appears across several of the scout's searches
   and in both of my RPM searches that returned results. The corroboration comes from a small, commercially aligned
   publisher set, not from independent sources.

---

## 3. Angles the scout missed that could change the decision

1. **Portfolio framing (MISSION.md:35-40).** No line is supposed to carry ₪20,000. The ₪5,000 row is what a go/no-go
   should read: at $7 that is 203k–254k views a month, at $10 it is 142k–178k (keep 95% → 76%). That is 1.2×–6.4× the
   12-month qualification volume, every month. Hard, but a different order from "7–25×". The scout's conclusion that
   the variant "does not make the target reachable by itself" is true, and MISSION says no line should be expected to.
2. **The rendered AI-disclosure line** [RENDERED youtube-altered-synthetic-disclosure.txt:173]. Disclosure does not affect
   eligibility to earn. My search 2 (SNIPPET) found no advertiser-side control that excludes AI-generated creator content.
   The only content-exclusion pages seen are Google Ads' general theme and suitability controls, and "digital content
   labels" stopped applying to YouTube in September 2024 per the summary. Together these suggest the AI-format RPM
   penalty is the policy channel (demonetization), not the ad-rate channel. That favours an *honest, disclosed* AI
   pipeline over a hidden one.
3. **Seasonality (SNIPPET, vendor tier: fluxnote.io "YouTube RPM by Month 2026: December Pays 3x January", gyre.pro,
   hub.gigastar.io).** Q4 is 30–80% above the annual average, and January is 30–60% below December (finance −25%). The
   gates scout's best-case first monetized months (Feb–Apr 2027) fall in the trough. A kill or scale rule must compare
   against the same month, or against a stated seasonal factor, never against the first month's raw RPM.
4. **Competition can be measured, not guessed.** The scout says no dataset measures creator competition (true). But the
   YouTube Data API gives "100 search.list calls … and 10,000 units per day combined for all other endpoints"
   [RENDERED youtube-api-quota-cost.txt:169, :173]. With it an agent can count recent videos per query and their view and
   channel sizes (videos.list/channels.list) from public data. That is the honest replacement for reel prompt 1, and it is
   a zero-cost part of the constraint-7 test. Its use must stay within the API's terms (the compliance-audit page is
   rendered; I did not re-check this use against it).
5. **English software and AI-tool tutorials skew toward low-RPM geographies (SNIPPET, direction only).** This bites
   exactly the niches the scout says survive. The Tier-1 share is the single number that decides whether "$7+" applies,
   and the first cheap test can measure it. That makes audience-country share, not RPM, the test's pass/fail metric.
6. **Revenue outside AdSense was not examined.** Software niches plausibly earn more from affiliate programs than from
   ads, which would cut the view requirement (UNKNOWN; I spent no search on it, and any figure would be guru-tier). It
   is constrained anyway: the payable affiliate rails from Israel are narrow (gates audit claim 14: Skimlinks/Sovrn via
   PayPal, all SNIPPET), and sponsorships need negotiation, which REJECTED.md already rules out for this mandate. It
   probably does not flip the verdict. It is unexamined, not refuted.
7. **Video length and mid-roll eligibility were not examined** as an RPM lever the pipeline controls (UNKNOWN here).

---

## 4. What I verified by re-derivation or re-reading

- All 15 cells of the ₪1,000/₪5,000/₪20,000 × $3–$15 table at keep 95% and 76%, the keep-85% row, and the per-video
  table (4/8/30 uploads) ✓. The gross-USD table ✓.
- 7–25× (6.8×–25.4×) ✓. 27k–34k per video at 30/month ✓. The ~2 orders of magnitude against 77M ✓.
- Rendered lines :114-140, :156, :204, :210, :244, :248-252, :336 of `youtube-monetization-policies.txt` (meta: fetched
  2026-09-25T14:48:17Z, status 200, not truncated) ✓. Offset at :140.
- `docs/REJECTED.md:43` (₪20,000 ≈ $5,400), `:89` (synchronised schedules), `:95` (77M) ✓. The scout cites :88-91 and
  :94-95; both are within ±1 line.
- `monetization-gates.md` §4 withholding table and §5 gate volumes ✓. The scout's inputs match their source.
- `research/tiktok/06-faceless-video-tooling.md:332` "$25–45 finance" ✓. `content-seo--converter-utility-sites.md:17`
  "Americas typically 2–3x EMEA/APAC" ✓.
- No RPM definition anywhere in `research/rendered/` (grep of all .txt) ✓.

## 5. URLs that would settle what remains (verbatim as seen in search results)

1. `https://support.google.com/youtube/answer/9314357/understand-ad-revenue-analytics`: the RPM definition and
   denominator (the scout's #1, and still the top priority, since every table rests on it).
2. `https://support.google.com/google-ads/answer/7515513?hl=en`: "About content exclusions for Video campaigns". Settles
   whether an advertiser can exclude AI-labelled creator videos, the only mechanism by which a faceless or AI format
   could get a lower *rate*.
3. `https://support.google.com/google-ads/answer/12764663?hl=en`: "About content suitability" (same question).
4. `https://hub.gigastar.io/learn/articles/youtube-revenue-seasonality/`: seasonality. The publisher sells creator-revenue
   investments, but it may cite a portfolio dataset.
5. `https://www.identitykit.in/blog/youtube-rpm-india-niche-2026`: India tech RPM (vendor or SEO tier. Read it to see
   whether it states a sample).

## 6. Search log: 4 of 4 used

1. `English tech tutorial YouTube channel audience mostly India low RPM analytics creator`: identitykit.in, fluxnote.io
   (×3), shanbabar.com, wildandfreetools.com, Wikipedia pages of Indian tech creators. SNIPPET, SEO and vendor tier.
   Direction on geography only. No audience-share figure.
2. `Google Ads option exclude AI-generated YouTube videos advertisers brand suitability AI labeled content CPM`:
   support.google.com/google-ads (content suitability, video content exclusions, AI content labels), mediapost.com,
   DV360 docs. No advertiser control to exclude AI-generated creator content was found (SNIPPET, absence).
3. `my RPM software tutorial channel …` with `allowed_domains: reddit.com`: **API error 400**, domain not accessible to
   the search tool. No results. Counted.
4. `YouTube RPM seasonality January drop versus Q4 December percent creator analytics`: fluxnote.io, miraflow.ai,
   makeaivideo.ai, gyre.pro, hub.gigastar.io, tubeanalytics.net, alanspicer.com. SNIPPET, vendor tier. Q4 peak, January
   −30% to −60%.

No WebFetch was attempted (every useful host found is on the egress blocklist or is vendor tier). No repo file other than
this one was edited. No git.
