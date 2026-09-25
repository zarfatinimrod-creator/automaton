# Audit: scout "policy" (faceless-youtube reassessment, 2026-09-25)

**Auditor:** policy auditor (separate from the builder; I check, I do not build). **Date:** 2026-09-25.
**Report audited:** `research/faceless-youtube/scouts/policy.md` (538 lines, read in full).
**Search budget:** 3 of 4 WebSearch calls used. Only questions the renders could not answer were searched.

## Method

1. **Re-read every cited line of our own renders.** I read `research/rendered/youtube-monetization-policies.txt`
   (lines 1-360; fetchedAt 2026-09-25T14:48:17Z, status 200, not truncated) and
   `youtube-altered-synthetic-disclosure.txt` (lines 55-240) myself. I also read the parts of
   `youtube-ypp-payout.txt` and `youtube-api-compliance-audits.txt` that bear on this question.
2. **Re-fetched the Open Terms Archive (OTA) captures independently.** I used curl against
   `raw.githubusercontent.com/OpenTermsArchive/vlopses-us-versions/<sha>/YouTube/...` at every SHA the scout
   cites: Content Monetisation Policy at eec5862, 36fc028, 9792a12, 6cbbfba, 8653912 and d78290d; Community
   Guidelines at 9f3e242, 994fae0 and 4d29ee7; Terms of Service at `main`. All returned HTTP 200. I then
   grepped and diffed them myself.
   - The current OTA `main` Community Guidelines is **byte-identical** to 4d29ee7 (checked with `cmp`).
   - The current OTA `main` Monetisation Policy is byte-identical to d78290d.
3. **Capture dates.** I read the OTA commit-list pages on github.com through WebFetch. That tool passes the
   page through a summariser, so the dates are **medium grade**. The GitHub API was not enabled for this
   session.
4. **Repo files re-read:** `docs/REJECTED.md` §"Automated faceless-video pipelines" (lines 68-139),
   `research/tiktok/06-faceless-video-tooling.md:320-334`, and the constraints and rules in `MISSION.md`
   (lines 133-138 and 314-345).

Grades follow the brief. RENDERED means our render. I add **RENDERED-ARCHIVE** for OTA verbatim captures that I
fetched and read. They are third-party copies of YouTube's pages, so they are strong but not first-party.

---

## Verdicts on the scout's claims

### C1. The AI-template bullet (:114, :140): **UPHELD**
Both lines are verbatim at the cited line numbers [RENDERED research/rendered/youtube-monetization-policies.txt:114, :140].

### C2. The AI Personas rule, and "the reel's RPM>$7 niche filter selects into this set": **WEAKENED**
- The rule text is quoted correctly [RENDERED …monetization-policies.txt:242-252].
- The rule is scoped to a *persona*, not to a *topic*:
  - Sentence 1 reads "channels that use AI-generated personas to deliver information on sensitive topics".
  - Sentence 2 reads "any content that presents itself as a human expert providing advice".
  - All three examples are framed as characters: an AI "doctor", "AI-generated podcast hosts", "AI personas giving legal advice".
  - The reel's six prompts never ask for a persona (`00-owner-reel-2026-09-25.md:29-45`).
- **The scout's own source contradicts "selects straight into the sensitive-topic set"** (scout line 154).
  `research/tiktok/06-faceless-video-tooling.md:332` gives "$9–14 AI/education" next to "$25–45 finance".
  A non-sensitive niche therefore also clears the $7 bar. Those figures are SEO-tier and low-to-medium
  confidence, but they are the figures the scout chose to cite. So the filter makes finance *likely*. It does
  not make a sensitive topic *necessary*.
- **"A disclaimer does not cure it"** (scout lines 157 and 390) is half right:
  - Sentence 2 ("presents itself as a human expert") is directly negated by a clear statement that the narrator is synthetic and not a professional. The scout's own disclaimer 2 in §7 does exactly that.
  - Sentence 1 ("AI-generated personas to deliver information") is not cured by a disclaimer.
- Whether an unnamed, disclosed text-to-speech narrator counts as an "AI-generated persona" is **UNKNOWN**
  from the text. One snippet supports the narrower reading: Tubefilter's 2026-07-13 headline describes the
  target as "content with fake AI 'experts'" [SNIPPET, tubefilter.com, trade press].
- **Grade inflation:** the claim is graded RENDERED, but the half that carries the decision ("selects into
  this set") is INFERENCE from an SEO-tier table.

### C3. Community Guidelines Spam item 6 ("Automated or synthetic mass-production"): **UPHELD, with a scope correction**
- The quoted text is verbatim at the cited lines [RENDERED-ARCHIVE OTA Community Guidelines@4d29ee7:203-204],
  and 4d29ee7 is the current OTA `main`.
- The consequences are verified: "we may suspend your monetization or terminate your channel or account"
  (:215). "For some violations, we may remove the content and issue a warning or a strike" (:217). A first
  violation normally draws a *warning*, which can expire after optional policy training (:219). "3 strikes
  within 90 days" means termination (:221).
- **Scope correction:** item 6 targets "high volumes of similar content with minimal changes". It also has an
  explicit safe harbour: "While testing out new creation tools or posting a few variations of a video is ok"
  (:203). The scout's summary line 31-32 ("at any volume it moves into Community Guidelines spam") therefore
  overstates the risk. For **one low-cadence channel with materially varied videos**, the binding constraint
  is the monetization review, not Spam item 6.
- **Grade:** the claim is labelled RENDERED. The source is an OTA archive capture, not our render. The text is
  verified, so this is a labelling issue only.

### C4. Timeline: the policy tightened after the rejection's sources, and the page carries no 2026 banner: **UPHELD, with a timing correction to the prose**
- **Verified by my own greps:**
  - The 2025-09-09 capture (eec5862) contains no "AI", "AI-", "generative", "synthetic" or "artificial intelligence".
  - 36fc028 (2026-05-09) has no AI bullet and still says "relatively varied".
  - 9792a12 (2026-06-02) adds "AI-generated content made with generic templates…" (:77) and "materially varied".
  - 6cbbfba (2026-06-24) has no "AI Personas".
  - 8653912 (2026-07-14) has "AI Personas" and adds "or unoriginal" to the template bullet (d78290d:74).
  - Community Guidelines 9f3e242 (2026-05-20) has "Autogenerated content…" (:219) and no item 6. 994fae0 (2026-06-02) adds item 6.
  - No other OTA commit falls between 9f3e242 and 994fae0, or between 6cbbfba and 8653912. The capture windows the scout gives are therefore exact.
- The live page's dated notices are only 2025-07-15, 2025-03-10 and 2022-03-03 [RENDERED …:62-66]. The heading
  "Inauthentic content" survives only inside the 2025 banner (:62). The live headings are "Generic or
  Repetitive Content", "Reused content", "Unsatisfying or Off-putting Content" and "AI Personas…".
- **Timing correction:** both tightenings (2 June and 14 July 2026) happened **before** the 2026-09-03 rejection. Two passages in the scout's prose get this wrong:
  - Line 39: "tightened twice since the 2026-09-03 rejection was researched".
  - Line 470: "a collision the old verdict could not see".

  The old verdict *could* have seen both changes. It cited only the 2025-07-15 rename (`docs/REJECTED.md:84-87`), so
  **it was already stale on the day it was written.** The structured claim ("after the rejection's sources")
  is correct. The lesson for the process: a rejection that rests on policy must cite a dated render, and it
  needs a watch on the OTA commit feed.
- The date conflict between TechCrunch ("rolled out July 16") and the OTA capture of 14 July is partly
  explained by Tubefilter's article, dated 2026-07-13 [SNIPPET]: announced around 13 July, captured 14 July,
  with TechCrunch's date probably the rollout.

### C5. "Enforcement follows the owner … a failure burns the owner's single YouTube monetization identity": **WEAKENED**
- **:286 is quoted out of scope.** It sits under "Creator responsibility" (:280-290), and the "this policy" it
  refers to is "egregious behavior that has a large negative impact on the community" (:284). That is not the
  generic, repetitive or AI-persona rule.
- :288 forbids new or related channels used "to get around these restrictions … **during your suspension
  period**". That describes a *period*, not a permanent bar.
- The scout **did not cite the line that actually supports a person-wide scope**: "Violation of our YouTube
  channel monetization policies may result in monetization being suspended or permanently disabled on all
  or any of your accounts" [RENDERED …:342]. It says "may", and "permanently" is only one option.
- The same page points to "details about how to reapply to join the program" [RENDERED …:348]. A snippet
  from YouTube Help gives reapplication after 30 days for a first rejection and 90 days after that [SNIPPET,
  support.google.com/youtube/answer/9235730, not rendered].
- **Corrected reading:** a monetization-policy failure is **person-scoped and sticky**. It *may* suspend or
  permanently disable monetization on all of the owner's accounts (:342), it bars workaround channels during
  the suspension (:288), and a reapply path exists (:348). A Community Guidelines termination is harsher and
  applies at account level (the terminations page, answer/2802168, is not rendered). "Burns the identity" is
  the worst case, not the expected case. Permanence is **UNKNOWN**.
- **Grade inflation:** graded RENDERED, but the decisive sentence ("burns the owner's single … identity",
  scout lines 376-379) is INFERENCE, built partly on a clause from a different policy.

### C6. Reused content applies "even if you have permission"; a stock licence is no defence: **UPHELD**
Verbatim at :186 and :204. One caveat: stock B-roll under original narration is the ordinary "transformed" case (:160, :182). The rule bites when the footage *is* the content. The scout says this in its own body text.

### C7. Disclosure triggers and "won't limit audience or eligibility": **UPHELD**
Verbatim at disclosure.txt:63-71, :107-133, :173 and :189 [RENDERED].

### C8. Synthetic narration is not barred by itself; whether a stock TTS voice must be disclosed is ambiguous: **UPHELD, but the ambiguity is smaller than stated**
The operative "must disclose" list [RENDERED disclosure.txt:65-71] has three triggers: a real person, a real event or place, and a realistic scene. A generic text-to-speech narrator matches none of them. The only audio item on the must-disclose list is "AI generated music" (:131). So the text *leans* toward not required. Disclosing anyway costs nothing (:173), so the checklist item stands.

### C9. An unattended agent cannot be *promised* to be the "creator" with "original, authentic insights": **UPHELD (INFERENCE, correctly graded)**
- Every allowed AI example is assistive (:216, :224, :226).
- One missing line reinforces this: "We expect creators in the YouTube Partner Program to be who they say they are and not misrepresent themselves" [RENDERED …:294].
- Review is partly human: "an additional review that may be completed by a human" (:64), and reviewers look at the channel's main theme, most-viewed and newest videos, metadata and About section (:86-100).

### C10. Scraping or downloading a competitor's script breaches the ToS: **UPHELD**
- OTA ToS (main) :118 and :120 are verbatim.
- One addition: ToS item 9 forbids using "the Service to view or listen to Content other than for personal, non-commercial use" [RENDERED-ARCHIVE OTA ToS main:126]. An agent viewing competitors' videos to model scripts commercially is arguably outside that clause even without scraping.

### C11. Hollywood Reporter says YouTube favours faces: **UNVERIFIABLE**
Correctly graded SNIPPET and not load-bearing. I did not re-search it.

### C12. From 2027-02-01, the Shorts Creator Pool requires 10M qualified Shorts views in 90 days: **UPHELD**
Verbatim at OTA Content Monetisation Policy@d78290d:305. It is also stated without a date at :334. Graded RENDERED, but the source is RENDERED-ARCHIVE.

### C13. Community Guidelines Scams item 8, and Israeli Investment Advice Law applicability unknown: **UPHELD**
Item 8 is verbatim at CG@4d29ee7:207. The applicability of Israeli law is honestly marked unknown.

---

## Grade inflation

1. **C2** is graded RENDERED, but "RPM>$7 selects into this set" is INFERENCE from an SEO-tier table, and that
   table (tiktok/06:332) lists a non-sensitive niche above $7.
2. **C5** is graded RENDERED, but "burns the owner's single identity" is INFERENCE, and it leans on :286, which
   belongs to the Creator-responsibility (egregious behaviour) policy.
3. **C3, C4, C10, C12, C13** are graded RENDERED, but they come from Open Terms Archive captures, not from
   `research/rendered/`. I verified the text byte-for-byte, so the substance holds. The label should be
   RENDERED-ARCHIVE, and the OTA commit dates are summariser-grade.
4. The report header (lines 6-7) says "None of it rests on search snippets". That is true for the rule text. It
   is not true for the enforcement cases (§4.3) or the July-2026 date. Neither is load-bearing.

## Angles the scout missed that could move the decision

1. **The policy test runs last, not first (constraint 7).**
   - Compliance with every rule above is decided by a *human YPP review* (:64, :74, :86-100).
   - That review happens only after the channel reaches the eligibility thresholds. The sibling scout puts those "10 to 14+ months out, or never" (`scouts/monetization-gates.md:253`).
   - So the cheapest honest test of *this* question cannot run early. All the production and growth cost is spent before YouTube says yes or no.
   - This is the strongest policy-side argument against the line. The scout never frames it.
2. **Creator integrity (:294).** "Be who they say they are and not misrepresent themselves." Combined with the
   anonymity rule, the About section must say plainly that the channel is AI-produced by an unnamed operator,
   and never imply a human host. It is missing from the 22-item checklist, although item 8 comes close.
3. **The AdSense payments account is coupled.** "payment may be withheld and/or earnings may be deducted if
   your account violates the AdSense Program policies and either the AdSense Terms … or the AdSense for YouTube
   Terms" [RENDERED youtube-ypp-payout.txt:126]. :104 shows the two payments accounts can be separate or
   combined. If any other colony line pays through AdSense, a YouTube violation may hold that money too. The
   scout left this as unknown #10 without citing :104 or :126.
4. **Non-sensitive high-RPM niches exist in the repo's own data** (tiktok/06:332). This cuts *in favour* of the
   reel variant. The compliant channel does not have to give up the RPM filter entirely. It has to exclude the
   four named topics.
5. **Spam item 6 has a small-scale safe harbour** (:203), and a first violation draws a warning (:217-219). The
   termination risk for one low-cadence channel is lower than the scout's §0 suggests. The monetization
   review, not Community Guidelines spam, is the binding gate.
6. **Reapplication windows** (30 and 90 days, SNIPPET) decide whether a failed review can be recovered. That in
   turn decides whether "sticky" means lost months or a lost line.
7. **Process lesson:** the 3.9 rejection cited 2025 wording three months after YouTube had rewritten the page.
   Any verdict that rests on policy should carry the render's fetchedAt, and a watch on the OTA commit feed.

## Corrected bottom line

The scout's core conclusion survives:
- The reel as written (a competitor-modelled script, a daily template calendar, stock footage plus Sora, and any finance or health persona) collides with the current monetization rules.
- Only a narrow variant is defensible: one channel, no persona, not a sensitive topic, distinct original substance in every video, disclosed AI, low cadence.
- "Clearly inside" cannot be promised.

What changes:
- (a) The persona collision is **conditional**. A non-sensitive niche above $7 exists in the repo's own table, so it is not built into the reel.
- (b) A failure is **person-scoped and possibly, not certainly, permanent**. There is a reapply path.
- (c) The policy changed **before** the 3.9 rejection, not after it.
- (d) The decisive policy risk is **timing**. YouTube renders its verdict only at the YPP review, months into the line, so MISSION constraint 7 cannot be satisfied for the compliance question with a cheap early test.

## URLs that would settle open points (seen verbatim in search results or in rendered or archived text)

- https://support.google.com/youtube/answer/9235730?hl=en: the reapplication waiting periods after a YPP rejection (C5)
- https://support.google.com/youtube/answer/9564590?hl=en: the appeal path for a YPP suspension or rejection (C5)
- https://support.google.com/youtube/answer/2802168: channel and account terminations, linked at OTA CG:215 (C5, CG path)
- https://support.google.com/youtube/answer/2802032: the strike system, linked at OTA CG:221
- https://www.tubefilter.com/2026/07/13/youtube-inauthentic-content-monetization-policy-update/: the announcement date and the "fake AI experts" framing (C2, C4)
- https://techcrunch.com/2026/07/20/youtube-clarifies-policies-around-ai-slop-and-upsetting-videos/: the rollout date (C4)
- https://www.hollywoodreporter.com/business/digital/faceless-creators-youtube-ai-damage-1236617586/ (C11)

## Searches used (3)

1. The scope of the July 2026 "AI personas" rule for narrators and finance. Result: TechCrunch, metricool, outlierkit, androidheadlines, and vendor blogs. It did not settle the question.
2. YPP reapplication after rejection. Result: YouTube Help answer/9235730, snippet only (30 and 90 days).
3. Whether an AI voice-over counts as a persona. Result: the Tubefilter headline, dated 2026-07-13. The rest were vendor blogs (miraflow, clippie, aituber, tugan, alici), which sell AI video tools and were used for nothing.
