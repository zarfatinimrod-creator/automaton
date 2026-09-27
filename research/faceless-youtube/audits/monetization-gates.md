# AUDIT: monetization-gates (scout report `research/faceless-youtube/scouts/monetization-gates.md`)

**Date:** 2026-09-25. **Auditor tier** (Opus). Separation of duties: I checked, I built nothing.
**Search budget:** 4 allowed, **4 used** (listed in §6). Other network use: 2 GitHub code searches, 1 WebFetch
(dipak7.com.np, EGRESS_BLOCKED, not retried).
**Grades:** RENDERED = primary page text I read in `research/rendered/`. CODE = a repo file or third-party
GitHub file I read. SNIPPET = search-engine summary, weaker. INFERENCE = my reasoning. UNKNOWN.

---

## 0. Verdict on the scout

> **The scout's headline stands: a new channel will not be monetized in 30 days, and the first real payout is
> months away at best, or never.** I re-derived every number it gives and the arithmetic is correct. The rendered
> quotes say what the scout says they say. It disclosed its budget overrun.
>
> **Five things are wrong or overstated, and two of them change how MISSION should read the report:**
>
> 1. **"Payability is the thing the English variant changes" is a framing error.** `docs/REJECTED.md` (reason 2)
>    already says "Israel *is* YPP-eligible". Moving from TikTok to YouTube is what gave the old verdict a way to
>    pay Israel. Switching to English did not. What English does change is who watches: an English channel can
>    reach Tier-1 viewers, where high RPMs come from. It also makes the Hebrew-RTL reopen condition moot. The
>    scout never checked the three-part reopen trigger against this variant.
> 2. **The owner is left with recurring tax work, and the scout says there is none.** At the target (₪240,000 a
>    year) he is past the עוסק פטור ceiling. The same file the scout cites for the תיק עוסק step says so two lines
>    later, and it adds periodic מע"מ reporting [CODE research/tiktok/01-monetization-israel.md:375-378].
>    "Recurring owner work: in principle none" is false at the income level the mission is aiming for.
> 3. **The best-case timeline leaves out two delays:**
>    - Uploads from an unaudited API project are locked to private. That is now settled at CODE grade (§3), so an
>      "owner does nothing" pipeline cannot publish at all until an audit passes. That eats into the 129-day window
>      before the old threshold goes away.
>    - The address PIN goes to Israel by post.
>
>    Also, one snippet suggests applications need to be in about a month *before* 1 Feb 2027, not just before it.
>    The "realistic 10–14+ months" is narrower than the scout's own inputs allow. They give roughly 11–25 months
>    for the channels that make it at all.
> 4. **The rule on AI personas is narrower than the scout claims.** It applies to content that "presents itself as
>    a human expert providing advice". Some niches clear RPM > $7 without touching it: software/SaaS tutorials,
>    tech explainers and business documentaries. The sibling `rpm-evidence` scout says exactly this. Where the reel's
>    method really breaks review is elsewhere: scripts modelled on competitors, templated stock-plus-Sora output
>    [RENDERED youtube-monetization-policies.txt:140, 204, 210].
> 5. **Israel's eligibility for the YPP tiers is weaker than even the scout's "medium-low".** I tested the scout's
>    search-7 method with Israel left out of the query and three other countries named in it. The summarizer
>    "confirmed" exactly the three countries I named (§6, search 4). So search 7 carries no weight. What is left is
>    prior repo research built on snippets, Hebrew versions of the help pages, and Israeli SEO guides (SNIPPET).
>    Probably yes, but not verified. One URL settles it (§7).
>
> **Net effect on the decision:** none of this overturns "not in 30 days". It lowers the best case and adds a
> recurring tax burden. It also moves the real question away from whether Israel can be paid and onto two others:
> can content an agent builds pass the inauthentic-content review, and can the API audit pass. Both belong to
> sibling scouts. The monetization gate is not the binding one.

---

## 1. Claim-by-claim

| # | Scout claim (short) | Verdict | Why |
|---|---|---|---|
| 1 | AdSense for YouTube cycle: finalized 7th–12th, threshold on the 20th, paid 21st–26th, wire ≤15 business days, no early pay | **UPHELD** | Verbatim at [RENDERED youtube-ypp-payout.txt:86-90, 98-104, 110-122, 130-132] and [RENDERED adsense-payment-7164703.txt:48, 95-103]. |
| 2 | Wire in USD/EUR; fields; no Israel row; Israeli methods and threshold unknown | **UPHELD as stated**, with inflation elsewhere | The USD/EUR text is at line **40**, not 42. The page also says "Wire transfer payments are currently only available to a number of countries" [RENDERED adsense-payment-3372975.txt:774]. So the verdict box's "pays monthly by international wire… (RENDERED)" is not rendered **for Israel**. Hebrew SEO guides (search 3) describe bank transfer, $100, USD/EUR: SNIPPET. Also missed: "it's not possible to change your payment currency" [RENDERED youtube-ypp-payout.txt:176-178]. The first setup choice is permanent. |
| 3 | YPP thresholds: 1,000 subs + 4,000 h/12 mo or 10M Shorts/90 d; lower tier 500 + 3 uploads + 3,000 h or 3M | **UPHELD (SNIPPET)** | No rendered page. The rendered policy page links "YouTube Partner Program overview & eligibility" to `/youtube/answer/72851` (href in the rendered HTML), which is the page that settles it. SNIPPET is the right grade. |
| 4 | From 1 Feb 2027: 8,000 h or 20M Shorts; existing members grandfathered if they accept by 31 Jan 2027 | **UPHELD (SNIPPET, well corroborated)** | Search 1 returned tbreak.com, business-standard.com (URL dated 2026-08-11), streamer.guide, adventpr.com, alanspicer.com and spatehiphopnews.com (2026/08), all agreeing. None official. New detail: "Review alone takes about a month, so creators planning to apply under the current requirements need to move quickly before the February 1, 2027 deadline". That hints the cut-off may apply to review, not submission. |
| 5 | Israel on the YPP and expanded-YPP lists | **UNVERIFIABLE** | Search 4 showed the method is broken. I named Iraq/Ireland/Italy and left Israel out, and the summary "confirmed" exactly the three I named. So the scout's search 7 is an echo and has no evidential weight. What remains: prior repo research [CODE bounties-grants--creator-funds.md:67-75] (snippet-based), help pages in Hebrew (`support.google.com/youtube/answer/9914702?hl=iw`, from search 3), and Israeli guides (mako.co.il, danielzrihen.co.il; SNIPPET). Plausible, not established. |
| 6 | Reviewers check theme / most viewed / newest / watch time / metadata; AI templated mass production not monetizable; AI personas on health/legal/finance not monetizable; new channels to evade demonetization → termination | **UPHELD** | Every quote checked against [RENDERED youtube-monetization-policies.txt:80-98, 140, 242-252, 288]. Nuance: the page says "our reviewers". The "human" line (64) is about ad-suitability review of videos, not the YPP channel review. |
| 7 | The reel's RPM > $7 filter steers into finance/health/legal and hits the AI-persona rule, so the fastest route is the most likely to fail review | **WEAKENED** | (a) The rule covers content that "presents itself as a human expert providing advice" [RENDERED …:244]. A faceless explainer is not automatically a persona. (b) RPM > $7 also includes software/SaaS, tech and business documentaries, which the sibling scout names as the niches that pass both filters [CODE research/faceless-youtube/scouts/rpm-evidence.md:30-33, 113-120]. (c) The conclusion still holds by another route. Prompt 3 ("Model [viral competitor video] script") and templated stock-plus-Sora output hit :140, :204 and :210. The collision is real. The mechanism the scout named is not the main one. |
| 8 | "Monetized in 30 days" is false: ~40–60k long-form views + 1,000 subs + ~30-day review, from zero | **UPHELD** | Re-derived: 4,000 h × 60 / 6 min = 40,000; / 4 min = 60,000. It holds across any plausible threshold error. Even the lower tier (500 subs + 3,000 h) is out of reach in 30 days. |
| 9 | Best case: first payout ~mid-May 2027 if the old threshold is reached by ~15 Jan 2027. Realistic 10–14+ months or never | **WEAKENED** | Date arithmetic checks: 129 days to 1 Feb 2027; 26 Apr + 15 business days ≈ 17 May. Four things are wrong or missing. **(i)** The start clock ignores the API private lock (§3): public uploads need a passed audit or a third-party audited publisher, so 1 Oct 2026 is not a realistic public start. **(ii)** Search 1 hints that approval, not submission, may have to land before 1 Feb, which would pull the target to about 1 Jan. **(iii)** The PIN goes by post to Israel and payments wait for it (nav titles only [RENDERED youtube-ypp-payout.txt:210-216]; delay UNKNOWN). **(iv)** The scout's own inputs (254 days to 22 months to 1,000 subs, plus ~1 month review, plus ~2 months pay cycle) give ~11 to ~25 months, not "10–14+". |
| 10 | No distribution of time-to-YPP exists; vidIQ's 40.6% is survivor-selected; 254 days vs 22 months conflict | **UPHELD** | The scout's own weakness analysis is correct. I found nothing better and did not spend budget trying. |
| 11 | US withholding: 24% of worldwide with no tax info; 30% of US with info but no treaty; treaty rate with W-8BEN; Art. 14 10%/15%; category and ITIN unknown | **UPHELD (SNIPPET)** | Consistent with repo research. One wording differs: tiktok/01:359 says "30%" without a W-8BEN; the scout reconciles it (24% applies with no tax info at all). Missed: the W-8BEN has a line for a foreign TIN, so "ITIN needed?" may resolve to "an Israeli ID number suffices". That is memory-grade, and the URL to settle it is in §7. The treaty category is still UNKNOWN. |
| 12 | Fraction kept: 93–97% / 79–91% / 76% | **UPHELD (arithmetic)** | Re-derived all nine cells. Caveats: it assumes the 10% treaty category (15% gives 89.5–95.5%). It also ignores that the treaty's double-tax relief may make US withholding creditable in Israel, so the real loss is ≤ the table's figure. |
| 13 | BrandConnect → Creator Partnerships (2026-03-24); needs YPP; Israel not named, so "placed ads" unavailable before YPP and possibly after | **UNVERIFIABLE** | SNIPPET only, and I spent no search on it. "Needs YPP" is enough for the 30-day verdict. "Israel not named" is not the same as excluded, because the snippet itself says "since expanded". Missed reading: "placed advertisements I can run" can also mean *paid promotion* of the channel (Google Ads / Promote). REJECTED.md rejects paid ads on arithmetic, and whether ad-driven watch time counts toward YPP is UNKNOWN. |
| 14 | Affiliate links are the only day-1 monetization; networks reachable from Israel pay by PayPal or **wire (CJ)**; Amazon leans unusable; ClickBank/Digistore AMBER | **WEAKENED** | The cited source does not say CJ pays by wire. It says CJ's payability "rests entirely on Payoneer, which this repo has already downgraded to UNKNOWN" [CODE content-seo--affiliate-networks.md:86-97]. The rail it actually finds payable is Skimlinks/Sovrn via PayPal, with Net-90 and a $65 threshold [ibid.:62-81], all SNIPPET inside that file. Grading it "CODE" hides that the evidence underneath is snippet. |
| 15 | Owner's one-time steps (11 listed); legal name goes to Google/IRS/banks/tax authority, not viewers | **WEAKENED** | Missing or wrong: **(a)** At target he needs **עוסק מורשה** with periodic מע"מ reporting, not עוסק פטור. That is recurring work, or a paid accountant, and the cited file says so [CODE tiktok/01-monetization-israel.md:375-378]. **(b)** The PIN arrives by post. **(c)** The payment currency is permanent once set [RENDERED youtube-ypp-payout.txt:176-178]. **(d)** The colony's own Manager Google account needs creating, and whose phone verifies it is unstated. MISSION rule 1 forbids opening accounts in his name. **(e)** For the fan-funding tier, first-time users must accept the Commerce Product Module [RENDERED youtube-monetization-policies.txt:72], another contract only he can accept. **(f)** "Not to viewers" is still INFERENCE (see claim 16). |
| 16 | Legal-name exposure via counter-notices / brand contracts / trader disclosure not ruled out | **UPHELD (UNKNOWN)** | Search 2 found no YouTube-specific answer. The DSA Art. 30 mechanism (platforms display a trader's name, address, email and phone) applies where consumers contract with traders (SNIPPET). So the exposure is most likely on the fan-funding / Shopping side, not ad revenue. Mitigation the scout did not state: a standing rule of **no DMCA counter-notices** and only own or licensed footage. That closes the counter-notice route by policy, without research. |
| 17 | Upload quota: 100 videos.insert per day at cost 1, but the page also says 1600; unaudited-upload restriction unknown | **WEAKENED (now resolved)** | The "1600" line sits in Google's auto-generated "Page Summary" widget [RENDERED youtube-api-quota-cost.txt:153-165]. The page body says cost 1 per call and 100 a day [:169-173]. The private lock is **settled at CODE grade**: several GitHub READMEs quote the official `videos.insert` page, "All videos uploaded via the videos.insert endpoint from unverified API projects created after 28 July 2020 will be restricted to private viewing mode" (porjo/youtubeuploader README; cubxxw/blog, checked 2026-07-31). The sibling `upload-automation` scout already has it [CODE upload-automation.md:23-28]. |
| 18 | ₪20,000 ≈ $5,405; ~772k views at $7 RPM, 540k at $10 | **UPHELD (arithmetic)** | 20,000 / 3.7 = 5,405.4, then ×1000/7 = 772k. Wording nit: RPM is per *all* views, so "monetized views" is the wrong noun. The figure is total views. |

---

## 2. Grade inflation

1. **§0 point 1:** "AdSense for YouTube pays monthly by international wire in USD or EUR, and I read that on the rendered
   pages *(RENDERED)*". Read as "this reaches Israel", it is inflated. The same rendered page says wire goes only to "a
   number of countries" (:774) and names none. For Israel it is SNIPPET at best.
2. **Claim 14, graded CODE:** it cites a repo file whose content is snippet-grade. It also misreports that file: CJ is
   paid via Payoneer (UNKNOWN), not wire.
3. **Claim 5 / search 7:** graded "SNIPPET, medium-low". A search-summary echo of the query's own terms (reproduced in
   my search 4) is not medium-low. It is zero. The claim needs to rest on something else.
4. **§9 "exactly one shot per owner identity":** presented as backed by [RENDERED :288]. That line covers channels
   already "demonetized or terminated" and "during your suspension period". The same page points to "how to reapply
   to join the program" [RENDERED youtube-monetization-policies.txt:348]. A rejected application is not shown to burn
   the identity.
5. **Claim 17, "the page contradicts itself":** the contradiction is between an auto-generated summary box and the
   authoritative body. That is not self-contradiction by the primary text.
6. **§0.3 / §2, "a human reviewer":** the rendered text says "our reviewers". Its only "human" sentence is about the
   ad-suitability review of individual videos (:64).
7. **Claim 15, "Recurring owner work: in principle none":** it is graded as an inference from a source that states the
   opposite for the target income level.

---

## 3. Angles missed that could change the decision

1. **Reopen-trigger accounting.** The 2026-09-03 rejection reopens on three conditions: a platform that pays Israel for
   honest content, Hebrew RTL that works, and a commercial-use TTS licence. For an English channel the RTL condition does
   not apply. The repo now has a Kokoro (Apache-2.0) TTS engine in the MoneyPrinterTurbo fork (task list; licence not
   re-checked by me). So the only open condition is the one the policy scout owns: can the content honestly pass
   :80-84, :140, :204, :210, :244. The monetization scout should have said so. It means the monetization gate is not
   the one that decides this.
2. **The API private lock is on the critical path for time.** Every day the audit is pending, the public clock is not
   running. With 129 days to 1 Feb 2027 and about a month of review, the audit's duration can decide whether the old
   threshold is reachable at all. It needs a timeline entry, not a "tangential" note.
3. **Israeli tax at the target is recurring:** עוסק מורשה, מע"מ reporting, annual income reporting, Bituach Leumi
   advances. Either the owner does it (against the mandate) or a paid accountant does, at a cost the ledger has to
   carry. Also: incoming-wire fees at Israeli banks are UNKNOWN. And by memory only, not claimed, a service exported to
   a foreign company may be zero-rated for VAT. An accountant settles it.
4. **The currency choice is permanent** [RENDERED youtube-ypp-payout.txt:176-178]. It belongs on the owner's checklist
   with a recommended value, not left to a default.
5. **The counter-notice exposure can be closed by policy.** Never file a DMCA counter-notification, and use only own
   or licensed footage. The one known route to a public-ish disclosure of the legal name then never fires.
6. **The alternative reading of "placed advertisements":** paying to promote the channel. Already rejected by
   REJECTED.md's arithmetic, and whether ad-driven watch time counts toward YPP is UNKNOWN. If anyone proposes buying
   the threshold, it has to be killed by name.
7. **A failed review can be retried.** The page points to reapplication (:348). That lowers the cost of one failed
   review and softens the scout's "exactly one shot" framing. A pattern of evasion is still fatal (:288).
8. **The 1 Feb 2027 cut-off cuts two ways under constraint 8.** Grandfathered YPP membership, meaning "existing members
   keep the lower maintenance requirements" (SNIPPET), is itself an accumulated, non-public platform position. That is
   a stronger constraint-8 asset than subscriber count. It is only worth anything if the content passes review, so it
   argues for a *fast honest test*, not for a fast launch.

---

## 4. What I verified by re-derivation

- 129 days, 2026-09-25 → 2027-02-01. ✓
- 4,000 h at 6 / 4 min AVD = 40,000 / 60,000 views. 8,000 h = 80,000 / 120,000. ✓
- Required pace: 1,000 h/month (4 months), 333 h/month (12 months), 667 h/month (365 days). ✓
- $100 / $7 RPM = 14,286 views. ✓ The ~mid-May 2027 landing (26 Apr + 15 business days ≈ 17 May). ✓
- Withholding table, all nine cells. ✓ ₪20,000 / 3.7 = $5,405, which is 772k / 540k / 360k views. ✓
- Every rendered line cited in claims 1, 2, 6 and 17 was opened. The quotes match. Claim 2 has a 2-line offset.

## 5. What would still settle the open points (not re-derivable here)

See §7 for the URLs. In order of value:
1. The YPP availability list, for Israel.
2. The AdSense for YouTube payment-method page, for Israel's rails and currency.
3. The 2027 update on the official blog or help page, for whether the cut-off applies to submission or review.
4. The non-US tax-info FAQ, for treaty category and TIN.
5. The PIN overview, for the verification threshold and mail timing.

## 6. Search log: 4 of 4 used

1. `YouTube Partner Program February 2027 8,000 watch hours new applicants pending applications existing members`:
   corroborated claim 4 across six secondary outlets. New hint on the review timing.
2. `YouTube trader status EU Digital Services Act channel About page shows name address creators monetizing`: no
   YouTube-specific result. The DSA Art. 30 display mechanism came back as SNIPPET (verasafe.com,
   eu-digital-services-act.com, envato help).
3. `יוטיוב מונטיזציה ישראל אדסנס תשלום העברה בנקאית דולר W-8BEN`: Israeli guides (danielzrihen.co.il, mako.co.il,
   netolink.co.il, shamanu.co.il) describe AdSense bank payouts to Israelis, a $100 minimum, USD/EUR. SNIPPET, SEO
   and guru tier. Also a Hebrew help page, `support.google.com/youtube/answer/9914702?hl=iw`.
4. `YouTube Partner Program availability list of locations "Iraq" "Ireland" "Italy"`: an **echo test**. The summary
   "confirmed" exactly the three named countries and said nothing independent. That discredits scout search 7 as
   evidence for Israel.

Non-search: GitHub code search `"unverified API projects created after 28 July 2020"` found five READMEs quoting the
official `videos.insert` page. That is the basis for claim 17. A GitHub code search for a YPP country list found
nothing. WebFetch of dipak7.com.np was EGRESS_BLOCKED and not retried.

## 7. URLs to render (verbatim as seen; "href" = relative link in a rendered primary page, resolved against support.google.com)

- https://support.google.com/youtube/answer/7101720?hl=en: YPP availability list (search 4, verbatim). **Settles Israel.**
- https://support.google.com/youtube/answer/13429240?hl=en&co=GENIE.Platform%3DDesktop: expanded YPP (search 4, verbatim)
- https://support.google.com/youtube/troubleshooter/13536952?hl=en: expanded-YPP eligibility checker (search 4, verbatim)
- https://support.google.com/youtube/answer/72851?hl=en&co=GENIE.Platform%3DAndroid: YPP thresholds (scout, verbatim; also href `/youtube/answer/72851` in youtube-monetization-policies.html)
- https://support.google.com/youtube/answer/14727140: "Meet YouTube's revenue thresholds for payment" (href `/youtube/answer/14727140#thresholdvalue` in youtube-ypp-payout.html)
- https://support.google.com/youtube/answer/14728152: "Add your payment method for AdSense for YouTube" (href in youtube-ypp-payout.html). **Settles Israel's rails.**
- https://support.google.com/youtube/answer/157667: "Address verification (PIN) overview" (href in youtube-ypp-payout.html)
- https://support.google.com/adsense/answer/14131950: "Submit your non-US tax info to Google" (href in adsense-payment-7164703.html)
- https://support.google.com/adsense/answer/10735961: "FAQs about submitting US tax info in AdSense" (href in adsense-payment-7164703.html; also scout search 4)
- https://support.google.com/youtube/answer/10390801?hl=en: US tax on YouTube earnings (scout, verbatim)
- https://www.irs.gov/pub/irs-trty/israel.pdf: US–Israel treaty text, Art. 14 (scout, verbatim)
- https://blog.youtube/news-and-events/youtube-partner-program-updates-2027-new-opportunities-earn/: official 2027 announcement (scout, verbatim)
- https://support.google.com/youtube/answer/12843009?hl=en: 2027 terms (scout, verbatim)
- https://support.google.com/youtube/answer/1727191: "Monetization is disabled for my channel" (reapply rules; href in youtube-monetization-policies.html)
- https://support.google.com/youtube/answer/9385307?hl=en&co=GENIE.CountryCode%3DUS: Creator Partnerships (scout, verbatim)
- https://developers.google.com/youtube/v3/docs/videos/insert: private-lock primary text (verbatim in GitHub READMEs)
- https://developers.google.com/youtube/v3/revision_history#july-28,-2020: private-lock announcement (verbatim in porjo/youtubeuploader README)
