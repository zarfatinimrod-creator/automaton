# AUDIT: upload-automation scout

**Date:** 2026-09-25. **Auditor tier:** Opus, separation of duties (this file checks; it builds nothing).
**Scout audited:** `research/faceless-youtube/scouts/upload-automation.md` (511 lines, read in full).
**Search budget:** 4 allowed, **4 used** (log in §8). Other checks used GitHub raw fetches and GitHub code search, which cost nothing from the shared budget.

**Grades used here.** RENDERED is primary page text I read myself, including `research/rendered/`. CODE is a repository file I read myself; a third-party repo quoting Google counts as a **secondary copy**. SNIPPET is search-engine summary text, which is weak. INFERENCE is my own reasoning. UNKNOWN means unknown.

---

## 0. Verdict

> **The scout's facts mostly hold. Its bottom line does not.** Every quote I re-opened says what the scout
> says it says, except one citation that points to the wrong line. The weak point is the answer to the question
> itself: "**~45–75 minutes once, then zero per month**".
>
> 1. **"Zero per month" on our own API project is contradicted by the scout's own sources.** The two
>    third-party compliance write-ups the scout cites both read the Developer Policies as requiring a
>    user-initiated upload with a UI. `thegoldenmule/timeline` §7 says: *"No batch or scheduled bulk
>    publishing without a per-item confirmation"*, and it treats the title, description and privacy fields
>    as *"mandatory UI, not agent-only fields"*. `kleZ799/clipmint` says: *"don't add 'upload all clips
>    automatically' or 'post on a timer without review'. Features like those are what would fail the
>    audit."* The policy text supports that reading, and the scout did not quote the clauses that carry it:
>    - III.C.2: a feature that initiates a YouTube action must be *"clearly initiated by the user"*.
>    - III.C.1: the RMF rule that an uploading client must let users *"set a title for each uploaded video"*.
>    - III.E.3.f: the client *"must clearly display an option for the user to choose"* the privacy status.
>
>    The scout's own §3.5 concedes that the strong honest design needs a monthly owner approval, which is
>    recurring work. Its §0.7 and §8.1 then say zero anyway.
> 2. **The least-involvement route is really the third-party publisher, and its key input is contested.**
>    The scout's only source for "Upload-Post free tier includes API access" is the vendor's own marketing. A
>    third-party research file dated 2026-07-24, which the scout did not surface, says *"API access requires
>    Professional ~$33/mo"*. Both sources are weak. Test T1 settles it for ₪0, and T1 has to run before
>    anything is built on this answer.
> 3. **The private lock is well sourced as written policy. That it is still enforced in 2026 is weaker than
>    "high".** The rendered audits page (last updated 2026-09-14) mentions the audit only for quota and never
>    mentions the lock. The lock text is a 2020 revision-history entry, plus third-party copies of the
>    `videos.insert` reference page. The only first-hand 2026 enforcement datapoint says the lock did **not**
>    apply (clipmint, 2026-09-17). Planning as if a locked video is lost is still the right call.
> 4. **The corrected answer to the scout's question is in §5.** In short: one-time owner work is about 15–25
>    minutes if T1 passes. Monthly work is zero only at 10 uploads a month or fewer. Above that, a
>    subscription is the owner's call each time. Otherwise the choice is recurring confirmation work or the
>    Studio fallback.

---

## 1. Claim verdicts

| # | Scout claim (short) | Load-bearing | Verdict | Why |
|---|---|---|---|---|
| 1 | Quota: 100 `videos.insert`/day, own bucket, cost 1; 10,000 units for other endpoints; midnight-PT reset; the "1600" page summary is stale | no | **UPHELD** | Verified verbatim [RENDERED research/rendered/youtube-api-quota-cost.txt:163, :169, :173, :495–497; youtube-api-compliance-audits.txt:169]. The 2025-12-04 and 2026-06-01 revision entries match [CODE, secondary: byaime copy lines 369–379]. |
| 2 | 2020 revision-history lock wording; creators get a "locked as private" email | **yes** | **UPHELD** (wording); enforcement confidence should be medium, not high | Verbatim at byaime `freshness-03` @cc0890d lines 849–861 [CODE, secondary]. No later revision entry from 2020 to 2026-09-01 changes it (I grepped the whole copy). The rendered audits page never mentions the lock [RENDERED youtube-api-compliance-audits.txt:157–191]. The only 2026 field report is contrary [CODE clipmint `docs/youtube-upload.md` @8527f0a lines 33–36]. |
| 3 | A locked video cannot be appealed and must be re-uploaded, so "API private, owner flips public" probably fails | **yes** | **UPHELD** (as SNIPPET, medium) | The no-appeal text appears verbatim in `Troptrap/MoneyPrinter-Enhanced` README line 82 [CODE, secondary]. My search 3 returned the same help-page wording and a statement that the video's state cannot be changed until re-upload [SNIPPET]. The three "one-click flip" repos cite nothing. |
| 4 | The audit is a written form; "a member … will contact you"; no call documented; no SLA; Usher, 3→17 Sep 2020 | **yes** | **UPHELD**, with an omission | Line :175 verified [RENDERED]. Usher verified [CODE Twinklebear @a108add lines 880–888]. The scout left out that Usher's *public* app took **23 days** and needed *"additional ToS and info on the app's website"*. Both of Usher's cases were chat-sync quota requests, so neither tests an upload audit. The scout also treats the audit as one-off. The same rendered page lists a **periodic audit** that fires *"If you have been contacted by us"* [RENDERED :187], and III.H lets YouTube demand test accounts on request [CODE OTA Developer Terms line 407]. Both are unscheduled recurring exposure. |
| 5 | Developer Policies consent clauses; whether an honest zero-touch uploader passes the audit is UNKNOWN | **yes** | **WEAKENED** | Quotes at lines 39, 159, 271 and 419 verified [CODE OTA `pga-versions` `YouTube/Developer Terms.md`]. The "final control" quote is at **line 103, not 105** (line 105 is about keyword suggestions). "UNKNOWN" is technically true, since nobody reports an audit outcome for this design. The evidence is not balanced, though. The scout left out III.C.1 (RMF) [line 89–93], III.C.2 (*"clearly initiated by the user"*) [lines 95–99] and III.E.3.f (privacy option displayed to the user) [line 277]. It also left out that its own two secondary sources read the policies as forbidding untouched scheduled uploads (§0.1). |
| 6 | Testing tokens expire in 7 days; production-unverified has one warning, a 100-user cap and no 7-day expiry; sensitive scopes, not restricted; so one consent feeds GitHub Actions for months | **yes** | **WEAKENED** (grade and confidence) | The mechanism is corroborated by several secondary quotes of Google's OAuth page [CODE devthrottle @9d836f3 lines 183–211, 312–344; timeline @5fbfb17 lines 9, 21–22]. The final sentence is **INFERENCE, not CODE**. devthrottle says outright: *"We have not run a published External personal app for more than seven days to watch the token survive."* Nobody reports a YouTube production-unverified token surviving for months. Also, III.E.4.a lets tokens be stored only for purposes consistent with *"the specific consent granted by an active user"* [CODE OTA line 283]. How that applies to an owner who never touches the client is UNKNOWN. |
| 7 | `status.containsSyntheticMedia` exists and can be set on insert and update | no | **UPHELD** | Discovery doc revision `20260923`, `VideoStatus.containsSyntheticMedia` boolean [CODE, first-party generated, fetched by me]. The 2024-10-30 revision entry says it *"can be set when calling the videos.insert or videos.update methods"* [CODE, secondary, byaime lines 395–411]. |
| 8 | Upload-Post free tier: 10 uploads/month, 2 profiles, API access incl. YouTube, no card; Basic $24 ($16 annual); API fields; public landing UNKNOWN | **yes** | **WEAKENED** | The API fields check out [CODE n8n node lines 697–768, 5745]. The free-tier API access is **contested**. `JulianMcOmie/cabin-visuals` `docs/research-social-upload-apis.md` (research date 2026-07-24), line 86, says *"Free: 10 uploads/mo; Basic $16/mo; API access requires Professional ~$33/mo"* [CODE, secondary, citing a competitor's roundup and a review site]. The vendor's own snippet (my search 1) says free includes API access and that annual billing saves 40% [SNIPPET, vendor]. On that snippet, Basic comes to ~$14.40/mo annual, not $16. Also, the local `MoneyPrinterTurbo/app/services/upload_post.py` docstring describes the YouTube target as *"YouTube Shorts"*, so nothing I read shows long-form uploads through Upload-Post. |
| 9 | Studio fallback: 15 files at once, no bulk scheduling; ~45–75 min/month for 8 videos, 3–4 h/month daily | **yes** | **UPHELD** (as INFERENCE), minor arithmetic | 5–8 min × 8 = 40–64 min; 5–8 min × 30 = 150–240 min = **2.5–4 h**, not 3–4 h. The "no bulk scheduling" source is a scheduler vendor's blog, which has an interest in saying so. |
| 10 | A paid scheduler is the owner's recurring decision and never the float | no | **UPHELD** | MISSION: *"What it must never become is a subscription … Any recurring cost is the owner's decision, every time"* [CODE MISSION.md, float section]. At 3.7 ILS/USD: $24 = ₪88.8/mo; Ayrshare $149 = ₪551.3/mo. |
| 11 | A Brand Account channel shows the brand name | no | **UPHELD** (as SNIPPET) | No contrary evidence. |
| 12 | A DMCA counter-notification leaks full legal name and address to the claimant | no | **UPHELD** | Verified [CODE OTA `vlopses-us-versions` `YouTube/Copyright Claims Policy.md` lines 79, 98, 116, 161]. |
| 13 | Credential sharing only with agents under confidentiality; not in open source; one project per client; 90-day inactivity | no | **UPHELD** | Lines 163, 165 and 221 verified [CODE OTA Developer Terms]. |
| 14 | Phone verification is one-time; "advanced features" may need ID or video verification, which would conflict with "no camera" | no | **WEAKENED** | There are three routes: channel history, **ID photo**, or a face-motion video. *"ID and video verification isn't available to all creators"* [SNIPPET, search 4, support.google.com/youtube/answer/9891124]. An ID photo is a one-time identity step, which is his by mandate, not a content camera. The scout missed that timeline §8 puts **monetization** in the advanced-features list [CODE, secondary, line 273]. That makes this gate matter to the go/no-go, not just to upload features. It also missed that one phone number verifies *"at most 2 channels per year"* (same line). |
| 15 | Minimum owner involvement: ~45–75 min once, then zero per month | **yes** | **WEAKENED** | See §5. The one-time sum adds up both routes: re-derived 43–63 min, padded to 75. If the third-party route works, own-project steps 3–5 are unnecessary and the one-time cost is ~15–25 min. "Zero per month" is unsupported on the own-project route (§0.1). On the third-party route it depends on T1 and on volume staying at 10 or fewer a month. |

---

## 2. Load-bearing checks in detail

### 2.1 The private lock (claims 2–3)

- **Wording: confirmed.** I fetched `mattmezstitchlab/byaime-one-page` `research/sources/freshness-03-youtube-revision-2026.md` @cc0890d
  ("Fetched: 2026-09-08"). Lines 849–861 carry the July 28, 2020 entry verbatim, as the scout quotes it. No later entry lifts or
  amends it. The 2026-06-01 entry covers only the quota buckets and says they *"simplif[y] the path to quota increases"* (line 371).
  [CODE, secondary]
- **Currency: weaker than claimed.**
  - The rendered page that is supposed to govern the audit never mentions the lock
    [RENDERED youtube-api-compliance-audits.txt:157–191]. Its own summary line frames the audit entirely as quota: *"To request quota
    beyond the default, an audit … is required"* [:159].
  - A revision-history entry is a historical record and cannot show that a rule is still enforced. `cabin-visuals` line 61 calls the
    lock *"confirmed still active in the revision history"*, which is exactly that mistake.
  - The only current-looking primary attribution is timeline's claim that the text sits on the `videos.insert` reference page
    [CODE, secondary, line 8]. Its wording differs slightly (*"each API project must"*), which suggests an independent copy of a page
    that is still live.
  - Against that stands one 2026 self-report of an unaudited public upload that stayed public (clipmint, 17 Sep 2026).
  - **Net:** the rule is written and probably live, and enforcement is unverified. The scout's action rule, "never upload a real video
    through an unaudited project", survives either way.
- **No-appeal: confirmed at the grade claimed.** `Troptrap/MoneyPrinter-Enhanced` README line 82: *"For videos that have been locked as
  private due to upload via an unverified API service, you will not be able to appeal. You'll need to re-upload …"*. That README then links
  **OAuth app verification** (cloud/answer/13463073) as the fix, which confuses the two processes. The quote is right; the source's
  advice is not.

### 2.2 The audit and the consent clauses (claims 4–5)

Policy text in the OpenTermsArchive copy [CODE, `pga-versions` main, `YouTube/Developer Terms.md`, fetched by me] that the scout did **not** quote:

- Lines 89–93, III.C.1: *"API Clients must also comply with the Requirements for Minimum Functionality … For example, the RMF states that
  an API Client that enables users to upload videos to YouTube must enable those users to set a title for each uploaded video."*
- Lines 95–99, III.C.2: any feature *"that initiates a user action related to a YouTube resource must be … clearly initiated by the user."*
- Line 277, III.E.3.f: *"If an API Client supports video uploads, the Client must clearly display an option for the user to choose one
  of those values"* (public, private or unlisted).

These are written for a client with a user interface. A cron job that picks titles and privacy itself and fires with no user action does
not fit them without argument. The two secondary sources the scout relied on for other facts read them this way:

- `thegoldenmule/timeline` @5fbfb17, lines 236–243. On III.E.3.d: *"The agent tool cannot publish on its own; the human confirms every
  upload."* On III.I.2: *"No batch or scheduled bulk publishing without a per-item confirmation."* On the RMF: *"Those three are mandatory
  UI, not agent-only fields."*
- `kleZ799/clipmint` @8527f0a, "The risks" item 3: *"don't add 'upload all clips automatically' or 'post on a timer without review'.
  Features like those are what would fail the audit."*

Neither is a Google statement, and neither reports a real audit outcome. They are still two independent, careful readings, and they point
the same way. **The honest audit application for a zero-touch uploader should be graded "likely to fail" (INFERENCE, medium), not "UNKNOWN".**
The design most likely to pass is a small approval UI where the owner confirms each item, or at least each batch. That is recurring owner
work, a few seconds to a minute per video *(INFERENCE)*. It is still far less than the Studio fallback.

**The third-party route does not make the clause disappear (INFERENCE).** III.I.2 binds the API client, which on that route is
Upload-Post. If YouTube audited Upload-Post, an API-first "post via our API" product, then YouTube has in effect accepted
account-holder-scripted uploads through that client. That would be evidence *for* the route's honesty. Upload-Post's audit status is
UNKNOWN. T1 tests whether uploads land public. It does not test whether YouTube approved the pattern, but a public landing through an
audited client is the platform's own sanctioned path (*"they can avoid the restriction by using an official or audited client"*, revision
history line 859–861).

### 2.3 OAuth (claim 6)

devthrottle @9d836f3 checks out word for word on the 7-day rule, the production-unverified behaviour and the personal-use exemption. It
also says the fact that matters here has **not** been tested (lines 342–345). The claim's conclusion, "one owner consent can feed a GitHub
Actions uploader for months", is plausible and supported by the absence of any other expiry rule in Google's list. That makes it INFERENCE,
not CODE at high confidence.

devthrottle also documents a Workspace **Internal** app that skips the unverified screen, the user cap and the 7-day expiry. Workspace is a
subscription, and it does not touch the YouTube lock, so it changes nothing here. I record it only so it is not rediscovered.

### 2.4 Upload-Post (claim 8)

- **API fields: confirmed.** In the n8n node, `applyYoutubeOptions` sends `privacyStatus`, `containsSyntheticMedia`,
  `selfDeclaredMadeForKids`, thumbnail, `youtube_publish_at` (lines 697–768), and the field description at line 5745 [CODE, vendor's
  official repo].
- **Free-tier API access: contested.** The vendor snippet says yes (search 1). `cabin-visuals` line 86 says Professional only. Neither
  outranks the other, and the vendor has the stronger motive to overstate its free tier. The scout reported only the vendor.
- **Long-form: not shown.** The MoneyPrinterTurbo integration is labelled Shorts. The n8n node's thumbnail and subtitle options imply
  regular videos, but nothing I read states a file-size or duration limit for the free tier.
- **Volume versus the reel.** The reel's prompt 5 asks for a 30-day calendar, which implies daily uploads. At 10 free uploads a month, the
  free tier carries about 2 a week. A daily cadence means a paid tier: $24/mo (≈ ₪88.8/mo) by the vendor's snippet, which is the owner's
  recurring decision by MISSION.

---

## 3. Grade inflation

1. **Claim 6** is graded CODE/high. Its conclusion ("for months") is INFERENCE. The best source says it has not been tested beyond 7 days.
2. **Claim 2** carries "high" confidence. That is right for the *wording* and overstated for *2026 enforcement*. The rendered audits page is
   silent on the lock, and the one 2026 field report is contrary.
3. **Claim 8** takes "free tier includes API access" from the vendor's own marketing and does not mention a contrary third-party source.
4. **Claim 4** is graded RENDERED as a whole. Only line :175 is rendered. The Usher timing is CODE (2020, quota, not uploads), and "no
   call documented" is absence of evidence.
5. **Claim 5** cites line 105 for "final control". The text is at line 103.
6. **Claim 9's** "no bulk scheduling" comes from a scheduler vendor's blog. It is correctly labelled INFERENCE, but the source's bias is not
   stated.

---

## 4. Angles the scout missed that could change the decision

1. **The RMF, III.C.2 and III.E.3.f UI requirements.** Together with the scout's own two sources, they point to an honest zero-touch audit
   application **failing**. That removes the own-project zero-touch route and leaves the third-party route as the only candidate for zero
   monthly owner work.
2. **The internal contradiction.** §3.5 says the strong honest design needs owner approval each month; §0.7, §8.1 and claim 15 say zero per
   month.
3. **Contrary evidence on Upload-Post's free API access** (`cabin-visuals` line 86). If the contrary source is right, the cheapest zero-touch
   route costs about $33/mo (≈ ₪122/mo), a subscription and so the owner's call, before the first view.
4. **Recurring audit exposure.** The periodic audit [RENDERED :187] and III.H test-account requests [CODE line 407] are unscheduled. Replies
   go to the account holder, and the owner "does not talk to people". Who answers them has to be decided **before** applying, not after.
5. **The public clock.** The own-project route delays the first public video by the audit's duration: no SLA, 2–8 weeks by the scout's own
   inference, and 23 days for Usher's public app. The sibling monetization audit already put this on the critical path to the 1 Feb 2027
   threshold (`audits/monetization-gates.md` §3 item 2). The third-party route starts the clock on day one if T1 passes, which is one more
   reason to run T1 first.
6. **Monetization is an "advanced feature"** (timeline §8, secondary). ID-photo verification is a non-camera route (SNIPPET), and it may not
   be offered in every country (SNIPPET: *"isn't available to all creators"*). Whether Israel gets it is UNKNOWN. This is a one-time owner
   identity step that belongs on the owner checklist; the scout filed it under "reportedly".
7. **Channel-custody risk on the third-party route** *(INFERENCE)*. A vendor holding a live refresh token is a single point of compromise
   for the channel. The mitigations are the revocation link Google requires and one scoped profile. It is worth a line in the kill criteria.
8. **The rendered audits page never mentions the private lock.** Render the `videos.insert` reference page (URL below) to settle whether the
   lock text is still live. That is the cheapest way to lift claim 2 from secondary copy to RENDERED.

---

## 5. The corrected answer to the scout's question

**Can software publish with the owner touching nothing after setup?** Possibly, and only through an audited third-party client. That is
unproven until T1 runs. On our own project the honest answer is **probably not**. The policy text and both compliance write-ups point to a
confirmation step for each item or batch. *(INFERENCE, medium.)*

| Route | One-time owner time | Monthly owner time | Money | Status |
|---|---|---|---|---|
| A. Audited third party, free tier | ~15–25 min: Brand Account and 2SV (overlap with sibling), phone verification ~3, vendor OAuth connect ~5–10 | **0**, if T1 passes and volume ≤ 10/month | ₪0; above 10/month or if free API is Professional-only: $24–33/mo ≈ ₪89–122/mo, the owner's decision | UNKNOWN until T1 |
| B. Own project, honest audit | ~45–60 min (scout §8.1 steps 2–5, re-derived 43–63) plus audit emails | **Not zero.** Likely per-item or per-batch confirmation (seconds to ~1 min/video), plus unscheduled periodic audits | ₪0 | Audit outcome likely negative for zero-touch; 2–8 weeks |
| C. Studio by hand | 0 beyond the channel | 40–64 min at 8 videos; 2.5–4 h at 30 | ₪0 | Works. Recurring manual ops, so out unless the owner opts in |

**The order stands, with one change.** Run T1 first and alone. If it passes, skip T3 unless volume needs more than the free tier. If T1
fails, T3 is only worth submitting with an honest design that includes an owner confirmation step. That is recurring owner work, and it
needs his explicit opt-in under MISSION rule 1.

---

## 6. URLs that would settle open points (verbatim as seen)

- https://developers.google.com/youtube/v3/docs/videos/insert — is the private-lock text live on the current reference page (claim 2)?
- https://developers.google.com/youtube/terms/required-minimum-functionality — the RMF upload UI requirements (§2.2).
- https://developers.google.com/youtube/terms/developer-policies — the live version of the OTA copy (archive date unknown).
- https://support.google.com/youtube/answer/7300965?hl=en — no-appeal wording (claim 3).
- https://www.upload-post.com/pricing-comparison/ — free-tier API access (claim 8, vendor side).
- https://www.linkstartai.com/en/agents/upload-post — the contrary third-party source cited by `cabin-visuals`.
- https://support.google.com/youtube/answer/9891124?hl=en&co=GENIE.Platform%3DDesktop — advanced-features verification routes (claim 14).
- https://developers.google.com/identity/protocols/oauth2 — the refresh-token expiry list (claim 6).

---

## 7. Sources I opened

- RENDERED: `research/rendered/youtube-api-quota-cost.txt` (:157–175, :460–535, meta), `research/rendered/youtube-api-compliance-audits.txt` (:140–195, meta, HTML hrefs).
- CODE, secondary (fetched raw by me today):
  - `mattmezstitchlab/byaime-one-page` @cc0890d `research/sources/freshness-03-youtube-revision-2026.md` (lines 300–415, 610–626, 840–866, whole-file grep).
  - OpenTermsArchive `pga-versions` main `YouTube/Developer Terms.md` (lines 39, 87–111, 159–165, 221, 271–283, 390, 407, 419, 437).
  - OpenTermsArchive `vlopses-us-versions` main `YouTube/Copyright Claims Policy.md` (lines 79–161).
  - `thegoldenmule/timeline` @5fbfb17 `docs/research/11-youtube-upload.md` (lines 1–25, 225–280).
  - `kleZ799/clipmint` @8527f0a `docs/youtube-upload.md` (whole file).
  - `thefrederiksen/devthrottle` @9d836f3 `tools/cc-gmail/docs/connect-a-google-account.md` (lines 183–215, 310–360).
  - `Twinklebear/Twinklebear.github.io` @a108add blog post (lines 876–890).
  - `porjo/youtubeuploader` master README (lines 40–62).
  - `Troptrap/MoneyPrinter-Enhanced` main README (line 82).
  - `JulianMcOmie/cabin-visuals` main `docs/research-social-upload-apis.md` (lines 1–6, 61–65, 86).
  - `davepoon/buildwithclaude` `plugins/all-skills/skills/upload-post/SKILL.md` (line 36).
- CODE, first-party or vendor: `googleapis/google-api-go-client` main `youtube/v3/youtube-api.json` (revision 20260923); `Upload-Post/n8n-nodes-upload-post` main `UploadPost.node.ts` (lines 695–770, 5745) and README; local `/home/user/MoneyPrinterTurbo/app/services/upload_post.py`.
- CODE, this repo: `MISSION.md` (lines 1–60, 110–200, 250–330); `research/faceless-youtube/00-owner-reel-2026-09-25.md`; `research/faceless-youtube/audits/monetization-gates.md` (lines 20–40, 105–120, 160–170).

## 8. Search log (4 of 4)

1. `upload-post.com free plan "API" access YouTube 10 uploads per month pricing` returned the vendor's own claim of API access on the free plan, and pricing of $24, $50 and $147 with 40% off annual [SNIPPET, vendor].
2. `YouTube API compliance audit rejected automated uploader "personal use" videos.insert private lock 2026` found no audit-rejection reports. Vendor blogs repeat the lock and a "2–4 weeks" timeline [SNIPPET, self-interested].
3. `"locked as private" "unverified API" YouTube Studio visibility greyed out cannot change public re-upload` repeated the help-page no-appeal wording, plus a summariser line that the state cannot be changed until re-upload [SNIPPET].
4. `YouTube "advanced features" eligibility "video verification" "valid ID" "channel history" how to get access` returned three routes: history, ID, or video. ID and video are "not available to all creators" [SNIPPET].

Not searches, and not counted: GitHub code search ×4 and raw.githubusercontent.com fetches. One WebFetch of `github.com/porjo/youtubeuploader/issues/86` found nothing beyond the 2020 lock email.
