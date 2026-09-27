# SCOUT: upload automation — can software publish to the channel with the owner touching nothing after setup?

**Date:** 2026-09-25. **Scout tier** (Opus). **Search budget:** 6 allowed, **6 used** (log in §12).
**Question:** can software publish to one faceless English YouTube channel with no owner action after a one-time
setup? If not, what is the least owner involvement possible? Anonymity is part of the question.

**Grades.** RENDERED means I read the primary page's own text. That covers the GitHub-runner captures in
`research/rendered/`, fetched 2026-09-25 per their `.meta.json`. CODE means a repository file I read, either
this repo's or a third-party one on GitHub; a third-party file quoting Google is a **secondary copy**, and I say
so each time. SNIPPET means a search engine's summary of a page I could not open, which is weaker. INFERENCE
means my own reasoning. UNKNOWN means unknown.

---

## 0. Verdict

> **Technically yes, and it is two separate approvals deep. Neither is in our hands, and the first one is
> uncertain for the honest version of this pipeline.**
>
> 1. **Quota is no longer the obstacle.** The default quota is **100 `videos.insert` calls per day, in a bucket
>    of their own, costing 1 per call**. The other 10,000 units are left for thumbnails, updates and polling
>    *(RENDERED)*. One long-form channel needs about one call a day.
> 2. **The obstacle is the private lock.** *"All videos uploaded via the `videos.insert` endpoint from
>    unverified API projects created after 28 July 2020 will be restricted to private viewing mode. To lift
>    this restriction, each project must undergo an audit"*. YouTube's help page says a video locked this way
>    **cannot be appealed and must be re-uploaded**. *(CODE: a third-party verbatim copy of Google's revision
>    history, fetched 2026-09-08, and the same wording quoted in nine repositories. SNIPPET for the help
>    page's no-appeal wording.)* So the cheap fallback ("upload privately by API, then the owner flips the
>    video public") **probably does not work**. The evidence here conflicts; see §2.3.
> 3. **The OAuth half is solved.** Publish the consent screen to **"In production"** and leave it unverified.
>    The owner then clicks past an "unverified app" warning **once**, and the refresh token does not
>    expire after 7 days. Kept in a GitHub Actions secret, it lasts until it is revoked, goes unused for 6
>    months, or is pushed out by the cap of 100 tokens per client. *(CODE: several third-party quotes of
>    Google's OAuth documentation, all agreeing.)* In "Testing" status the token dies every 7 days.
> 4. **The audit is a written Google form**, followed by email from "a member of YouTube's API Services
>    team" *(RENDERED)*. No phone or video call is documented. It has **no published timeline**. One
>    first-hand report went from 3 Sep to 17 Sep (2020, a quota request, "after some small corrections").
>    The other reports say "weeks to months" and are unsourced.
> 5. **The load-bearing uncertainty: an honest audit application may fail on this use case.** The Developer
>    Policies require that users "expressly consent to those actions prior to their actual execution". They
>    forbid automating "uploads … without the user's prior specific and express consent" *(CODE: the
>    OpenTermsArchive copy of the Developer Policies)*. A pipeline built so that the owner never sees a video
>    is exactly what those clauses describe. Whether one standing, written, specific authorisation from the
>    owner satisfies them is **UNKNOWN**. We may not misdescribe the pipeline to pass (constitution).
> 6. **The least-involvement path is a third-party publisher whose project is already audited**, used on
>    its **free tier**. Upload-Post's free tier is reported as **10 uploads/month, no card** *(SNIPPET: the
>    vendor's own site)*, which covers about 2 long-form videos a week. Its official client sends
>    `privacyStatus`, `publishAt` and `containsSyntheticMedia` *(CODE)*. **Whether its uploads really land
>    public is UNKNOWN until one test upload.** A paid tier (~$16–24/month) is a subscription, so it is the
>    owner's decision each time and never the float's *(CODE: MISSION)*.
> 7. **Owner time:** about **45–75 minutes once** (Google project, consent, phone verification, one or two
>    OAuth connections, pasting the audit form), plus **possibly a few emails** if the YouTube API team
>    writes back. After that, **zero per month** on either automated route. The manual Studio fallback
>    costs **about 1 hour per 8 videos per month, every month** *(INFERENCE)*. That is recurring manual work,
>    which MISSION rules out unless the owner opts in.
> 8. **Anonymity holds under normal operation:** a Brand Account channel shows the brand name, not his.
>    **One real leak:** a DMCA **counter-notification** needs his *"full legal name"* and *"complete physical
>    address"*, and YouTube *"is required to share the counter notification with the claimant"* *(CODE:
>    OpenTermsArchive copy of YouTube's Copyright policy)*. That matters for a channel built on stock
>    footage. The rule follows directly: **never counter-notify in his name**. Take the takedown, or pay a
>    lawyer to file.

**Consequence for the go/no-go (INFERENCE):** publishing is **not the reason to say no** to this line, because a
zero-touch route plausibly exists. It is also **not proven**. Build nothing downstream until two cheap tests pass
(§8): one upload through an audited third party, and one audit application with an honest use-case description.

---

## 1. `videos.insert` quota: the rendered facts

From `research/rendered/youtube-api-quota-cost.txt` (https://developers.google.com/youtube/v3/determine_quota_cost,
page "Last updated 2026-09-15 UTC" [RENDERED :531]):

- *"Projects that enable the YouTube Data API have a default quota allocation of 100 search.list calls, 100
  videos.insert calls, and 10,000 units per day combined for all other endpoints … Daily quotas reset at midnight
  Pacific Time (PT)."* [RENDERED research/rendered/youtube-api-quota-cost.txt:169]
- *"The search.list and videos.insert methods have their own quota buckets. Each of these methods has a default
  daily limit of 100 per day. The quota cost is 1 per call."* [RENDERED :173]
- Table row `videos` / `insert`: *"100 quota per day. Each call costs 1 quota."* [RENDERED :495–497]. Next to it:
  `videos.update` 50 [:499–501], `thumbnails.set` 50 [:471–475].
- *"Every API request, even if invalid, will cost at least one quota point."* [RENDERED :157]
- **Internal contradiction:** the page's auto-generated "Page Summary" still says *"methods like videos.insert
  have the highest cost of 1600 points"* [RENDERED :163]. The body text and the table say otherwise. I treat the
  summary as stale. A third-party verbatim copy of Google's revision history agrees with the body: on
  **2025-12-04** the upload cost fell "from approximately 1600 units to approximately 100 units", and from
  **2026-06-01** `videos.insert` and `search.list` "will be charged to their own respective quota buckets"
  [CODE, secondary: `mattmezstitchlab/byaime-one-page` `research/sources/freshness-03-youtube-revision-2026.md`
  @cc0890d, lines 371–379, "Fetched: 2026-09-08"].
- The same audits page repeats the 100/100/10,000 allocation, and says more quota needs an audit
  [RENDERED research/rendered/youtube-api-compliance-audits.txt:169–171; page "Last updated 2026-09-14 UTC" :195].

**So:** the earlier colony figure of "~6 uploads/day" (`research/colony-sweep/scouts/distribution--short-video.md:70`
already flagged it as stale; many READMEs still repeat it) is **two revisions out of date**. One upload a day uses 1% of the upload bucket.
Quota decides nothing here. *(INFERENCE from RENDERED.)*

---

## 2. The private lock on unaudited projects

### 2.1 Exact wording and where it comes from

> "All videos uploaded via the `videos.insert` endpoint from unverified API projects created after **28 July
> 2020** will be restricted to private viewing mode. To lift this restriction, each project must undergo an
> audit to verify compliance with the Terms of Service.
>
> Creators who use an unverified API client to upload video will receive an email explaining that their video
> is locked as private, and that they can avoid the restriction by using an official or audited client."

- Source: Google's **YouTube Data API revision history, entry "July 28, 2020"**. I read it in a third-party
  verbatim copy [CODE, secondary: `mattmezstitchlab/byaime-one-page` `freshness-03-youtube-revision-2026.md`
  @cc0890d, lines 851–861]. The same first paragraph is quoted in `porjo/youtubeuploader` README (linking
  `https://developers.google.com/youtube/v3/revision_history#july-28,-2020`) and in `thegoldenmule/timeline`
  `docs/research/11-youtube-upload.md` @5fbfb17. The latter attributes it to the `videos.insert` reference page
  https://developers.google.com/youtube/v3/docs/videos/insert. Google's own page is egress-blocked here.
  **Grade: CODE (secondary copy), high confidence.** Several independent copies agree word for word.
- The email a creator receives, quoted by a user on 2020-09-09: *"your video has been locked as private. This is
  because it was uploaded to YouTube using a third-party service that hasn't yet been through our verification
  process."* [RENDERED-ish: GitHub issue page `tokland/youtube-upload#306`, read through WebFetch's summariser. I
  treat it as SNIPPET-strength.]
- **"Unverified" means the YouTube API compliance audit, not Google OAuth app verification.** The entry links
  "undergo an audit" to the Audit and Quota Extension Form. Two third-party guides keep the two processes apart
  explicitly: `kleZ799/clipmint` `docs/youtube-upload.md` @8527f0a, §3 table, and
  `totallyfacelessmafia/Ambient-Channel` `docs/youtube-api-verification.md` @137c68e [CODE].

### 2.2 Can a locked video be flipped public in Studio? Probably not.

- YouTube help "Videos locked as private" (https://support.google.com/youtube/answer/7300965), as summarised by
  search: *"For videos that have been locked as private due to upload via an unverified API service, you will
  not be able to appeal. You'll need to re-upload the video via a verified API service or via the YouTube
  app/site. … the unverified API service can also apply for an API audit."* [SNIPPET, search 1]
- The same sentences appear verbatim in the README of `FujiwaraChoki/MoneyPrinter` and at least nine forks, e.g.
  `Troptrap/MoneyPrinter-Enhanced` README [CODE, secondary copy of the help page]. `sapphirefountains/erpnext_enhancements`
  `docs/marketing-platform-approvals.md` @70d2318 lines 389–395 reads it the same way: *"the lock cannot be
  appealed … Do not bulk-upload a back catalogue before the audit clears."* [CODE]
- **Contrary claims (weaker):** three 2026 repositories say "flip them public in YouTube Studio with one tap":
  `emin-grbo/ai-post-scheduler` `Setup-human-YouTube.md`, `SubliminalCoding/ClawStudio-Open` `src/youtube/auth.ts`,
  `kleZ799/clipmint` `docs/youtube-upload.md` lines 27–29. None cites a source or shows a screenshot [CODE,
  unsourced].
- **An anomaly worth knowing:** clipmint reports that *"ClipMint's own project, unaudited, uploaded a public video
  that stayed public in testing on 17 September 2026"* and advises treating the lock as something that
  *"can happen rather than something that always does"* [CODE, a single self-report].
- **My reading:** the help page's "cannot appeal / re-upload" is the stronger evidence, so **plan as if a locked
  video is lost**. Enforcement may be inconsistent, and nothing should be designed on that
  hope. *(INFERENCE; medium confidence. Settled by rendering 7300965, or by one throwaway test upload.)*

### 2.3 What that kills

- **"Upload privately by API, the owner flips it public monthly":** probably dead (§2.2).
- **`publishAt` scheduling from an unaudited project:** `publishAt` *"can be set only if the privacy status of the
  video is private"* [CODE: Google's discovery document, `googleapis/google-api-go-client`
  `youtube/v3/youtube-api.json`, revision `20260923`, schema `VideoStatus.publishAt`]. For a locked video the flip
  to public at the scheduled time is exactly what is blocked. `thegoldenmule/timeline` states *"publishAt scheduling
  cannot work"* before the audit [CODE, secondary]. *(INFERENCE that the two combine this way; not tested.)*

---

## 3. The audit: what it is, what it asks, how long, form or conversation

### 3.1 The process as Google states it [RENDERED research/rendered/youtube-api-compliance-audits.txt]

- *"To begin an audit of your project, fill out and submit the YouTube API Services - Audit and Quota Extension
  Form. A member of YouTube's API Services team will contact you as soon as possible."* [:175]
- Other forms: an additional quota extension within 12 months of an audit [:179], appeals [:183], periodic audits
  *"If you have been contacted by us"* [:187], and change of control [:191].
- The form is https://support.google.com/youtube/contact/yt_api_form (linked from the revision history
  [CODE, secondary copy lines 615–621, 851–854]; the form page itself is egress-blocked).

### 3.2 Written form or a conversation?

- **Written form first, then email.** "Will contact you" [RENDERED :175]. A first-hand account (Will Usher,
  IEEE VIS 2020 infrastructure write-up): *"This process can take a few weeks depending on the application and how
  quickly you respond to their requests for additional information … We requested this increase on Sep 3, and after
  some small corrections were granted 5M units per day on Sep 17. This request was made on an unverified 'testing'
  application"*. For a public application *"there were more requests"* [CODE: `Twinklebear/Twinklebear.github.io`
  `content/blog/2020-11-13-vis2020-streaming-infrastructure.md` @a108add lines 880–888. First-hand, but 2020 and
  about quota].
- The Developer Policies let YouTube ask for test access: provide *"account(s) necessary to access all features or
  functions of the current, in-production version(s) of your API Clients"* on request [CODE: OpenTermsArchive
  `pga-versions` `YouTube/Developer Terms.md`, §III.H, line ~407].
- **No phone or video call is documented anywhere I read.** *(UNKNOWN whether one ever happens.)*

### 3.3 What it asks for (secondary; the form itself was not readable)

According to third-party preparation notes, the form wants the Cloud **project number**, a plain-language **use
case**, **each endpoint used and why**, **how users authorise**, **how data is stored and deleted**, **expected daily
and peak volume**, and links to the **privacy policy and terms** (and a homepage). Some applicants attach an unlisted
**screen-recording demo**. Sources: `thegoldenmule/timeline` §6; `kleZ799/clipmint` §3.1; `Ambient-Channel`
"Compliance audit" section [CODE, secondary, consistent with each other]. `emin-grbo/ai-post-scheduler` claims
it takes "~10 minutes" and says Content Manager / Google Ads ID fields may be left blank [CODE, unsourced].

**Implication (INFERENCE):** the privacy policy and homepage need a public page on the brand's own domain. MISSION
already makes the company domain a prerequisite ("פרסום בעילום שם" section), so this adds no new owner step. The
agents can write every answer. The owner has to be signed in as the project's owner to submit, unless the form
accepts any submitter; that is UNKNOWN.

### 3.4 Time

- Google publishes **no SLA** [RENDERED: none stated on the audits page; SNIPPET search 2: "Google publishes no
  processing time"].
- Reports: two weeks (Usher, 2020, first-hand); "a couple of weeks to a couple of months" (clipmint, unsourced);
  "weeks to months" (Ambient-Channel, unsourced); "routinely approved in 1–2 weeks" (ai-post-scheduler, unsourced).
  **Treat it as unknown, 2–8 weeks** *(INFERENCE)*.

### 3.5 Would an honest application for *this* pipeline pass? UNKNOWN, and this is the crux

Developer Policies text [CODE: OpenTermsArchive `pga-versions` `YouTube/Developer Terms.md`, current main branch;
archive date not retrieved]:

- §III.E (line 271): *"API Clients must clearly identify any actions that they take to insert, share, update, or
  delete data or content on the authorizing user's behalf. In addition, the user must expressly consent to those
  actions prior to their actual execution."*
- §III.I.2 (line 419): *"you must not automate or trigger views, uploads, comments, likes, dislikes, or other actions
  without the user's prior specific and express consent"*.
- §III.C (line 105): *"users must have final control over the data that will be published"*. Design principle 3
  (line 39): users *"have final authority over any actions the API Client takes to insert … their data"*.
- §III.I.11 (line 437): must not *"confuse, deceive … spam"*.
- Permitted commercial use (line 390): *"Promoting your own business or artistic enterprise by uploading original
  audiovisual content to YouTube or maintaining channel(s) on YouTube"*.

**Reading (INFERENCE):**

- The clauses do not ban scheduled uploads. They require **prior, specific, express consent**.
- A reviewer could accept a single-user tool whose owner authorised a specific, reviewable queue in writing:
  "upload the videos in this list on these dates, with these titles".
- A reviewer could equally read "the owner never sees the videos" as failing "final control".
- A dishonest description ("the user reviews every upload") would break the constitution and §III.D.2.a (*"must
  not mask or misrepresent your identity or your API Client's identity"*, line 159). **So only the honest
  application is on the table, and its outcome is unknown.**
- **Design that makes the honest answer strong:** a short monthly list the owner approves once, plus a
  kill-switch. That is recurring owner work, though only minutes. The pure zero-touch design is the weaker
  application.

---

## 4. OAuth: "Testing" versus "In production, unverified", and months of unattended uploads

| State | What happens | Grade / source |
|---|---|---|
| **Testing** (External) | *"A Google Cloud Platform project with an OAuth consent screen configured for an external user type and a publishing status of 'Testing' is issued a refresh token expiring in 7 days"*. A weekly GitHub Actions job would die weekly | CODE, secondary: Google's OAuth 2.0 doc (https://developers.google.com/identity/protocols/oauth2) quoted identically in `avantifellows/plio-backend` `docs/research/e2e-stack-survey.md`, `thefrederiksen/devthrottle` `tools/cc-gmail/docs/connect-a-google-account.md`, `shelomito12/gmail-push-to-discord` README |
| **In production, unverified** | No 7-day expiry. One *"Google hasn't verified this app"* screen at consent (Advanced → continue). A cap of **100 users for the project's lifetime**. Publishing *"does not submit anything to Google for review"* | CODE, secondary: devthrottle `connect-a-google-account.md` step 5; `TysAIs/xPST` `docs/setup-youtube.md` (*"YouTube scopes are classified as **sensitive** … That warning does not stop a refresh token from being issued"*); `englishfox90/PFRSentinel` `docs/dev/YOUTUBE_UPLOADS.md` |
| Personal-use exemption | *"If the app is for your personal use (fewer than 100 users), you and your limited number of users can continue using the app without going through verification."* | CODE, secondary quote in devthrottle of Google's "when verification is not needed" page (https://support.google.com/cloud/answer/13464323) |
| Scope class | `youtube.upload` / `youtube` / `youtube.force-ssl` are **sensitive, not restricted**, so no annual security assessment applies | CODE, secondary: `thegoldenmule/timeline` §1, citing https://support.google.com/cloud/answer/13464321 |
| Token death conditions in production | Revoked by the user; **unused for 6 months**; **100 refresh tokens per account per client** (the oldest is silently dropped); a password change revokes only tokens that carry Gmail scopes | CODE, secondary: plio-backend and devthrottle quoting Google |

**Can the owner consent once, and a GitHub Actions job upload for months? Yes, on the OAuth side** *(CODE,
secondary; high confidence)*. The pattern is standard. Do the OAuth once on a desktop, then copy the refresh
token to a headless host [CODE: `porjo/youtubeuploader` README line 61: *"generate the token file locally first,
then simply copy the token file … to the remote host"*]. Our version: the owner runs one consent in a browser, and
the token goes into a **GitHub Actions encrypted secret**.

Caveats:

- devthrottle is candid that it *"ha[s] not run a published External personal app for more than seven days to
  watch the token survive"* [CODE]. I found no first-hand report of a *YouTube* production-unverified token
  surviving for months. **UNKNOWN, low risk.**
- Developer Policies §III.D.1.c.4 (line 165): credentials may be shared *"with agents operating solely on your
  behalf and under a written duty of confidentiality"*, but must not be *"embed[ded] … in open source projects"*
  [CODE]. **The client secret and refresh token must never enter this repository**, only Actions secrets
  *(INFERENCE applied to our repo)*.
- §III.D (line 221): quota may be curtailed after **90 consecutive days of inactivity** [CODE]. A weekly
  uploader never hits it.
- §III.D.1.c.3 (line 163): **exactly one API project per API client** [CODE]. That fits one channel and one
  project, and it is incompatible with any multi-channel farm (MISSION constraint 3).
- **Which account consents.** The Brand Account channel is chosen at consent, and a Manager of the Brand Account
  can upload *(INFERENCE; the Google account chooser behaviour was not verified)*. Someone with a real Google
  account must click Allow. Agents cannot create or hold a Google account (phone verification, and MISSION's "never
  open an account in the owner's name"). **So the owner performs the consent.**

---

## 5. The API field for altered/synthetic content: yes, `status.containsSyntheticMedia`

- **Google's discovery document** (`googleapis/google-api-go-client`, `youtube/v3/youtube-api.json`, `"revision":
  "20260923"`), schema `VideoStatus`: `"containsSyntheticMedia": {"description": "Indicates if the video contains
  altered or synthetic media.", "type": "boolean"}` [CODE, first-party generated artefact; high confidence].
  Google's PHP client (`googleapis/google-api-php-client-services` `src/YouTube/VideoStatus.php`) carries the
  same property with `setContainsSyntheticMedia()` [CODE].
- **Settable on insert.** Revision history, **October 30, 2024**: *"To indicate whether a video contains A/S
  content, set the `status.containsSyntheticMedia` property. This property can be set when calling the
  `videos.insert` or `videos.update` methods."* [CODE, secondary copy, lines 396–411]
- **In use:** `porjo/youtubeuploader` (metaJSON `"containsSyntheticMedia": false`, README line 157), Upload-Post's
  official n8n node (`formData.containsSyntheticMedia`, `UploadPost.node.ts` lines 722/732), AutoGPT's Ayrshare block
  (`youtube_options["containsSyntheticMedia"]`, `post_to_youtube.py` line 276), and MoneyPrinterTurbo
  `app/services/upload_post.py` (hard-codes `"true"`) [CODE].
- **The help page speaks only of Studio:** *"the 'AI use' setting is available to creators using YouTube Studio on a
  computer or mobile device"* and *"In the Attributes section, under 'AI use,' select Yes"* [RENDERED
  research/rendered/youtube-altered-synthetic-disclosure.txt:77, :157]. The API field is not mentioned there. The
  mapping of API field to Studio toggle is asserted by `thegoldenmule/timeline` §3 [CODE, secondary]. Also:
  *"Disclosing AI content won't limit a video's audience or impact its eligibility to earn money"* [RENDERED :173],
  and *"Creators who consistently choose not to disclose … may be subject to … suspension from the YouTube
  Partner Program"* [RENDERED :193].
- **Implication (INFERENCE):** the pipeline can declare disclosure at upload with no owner action. Set it `true`
  whenever a Sora-type realistic clip is used. The reel's own prompt 4 makes that the normal case.

---

## 6. Fallbacks if our own project stays private-locked

### 6.1 A third-party publisher with an already-audited project (least owner time)

| Service | What I could establish | Grade |
|---|---|---|
| **Upload-Post** | Free tier *"10 uploads per month, with 2 profiles, scheduling … API access to … YouTube … The free plan requires no credit card"*. Basic $24/mo ($16/mo annual), unlimited uploads, 5 profiles | SNIPPET (search 3, vendor's own pages upload-post.com) |
| | API call shape: `POST https://api.upload-post.com/api/upload` with `Authorization: Apikey …`, `user`, `platform[]`, `privacyStatus`, `containsSyntheticMedia`, `youtube_publish_at` (*"Schedule the YouTube video to go public at this ISO-8601 datetime. Privacy should be private."*) | CODE: `Upload-Post/n8n-nodes-upload-post` `UploadPost.node.ts` lines 699–769, 5742–5745; `harry0703/MoneyPrinterTurbo` `app/services/upload_post.py` lines 84–125 |
| **Ayrshare** | Premium $149/mo, one profile (earlier colony finding); API supports `visibility`, `containsSyntheticMedia`, `publishAt` | SNIPPET (`research/colony-sweep/scouts/distribution--short-video.md:82`); CODE (AutoGPT `post_to_youtube.py` lines 20–22, 97–98, 251–279) |
| **Publer** | Free tier: 3 social accounts; paid from ~$4–5/mo; "schedules videos and Shorts" | SNIPPET (search 6, affiliate/comparison blogs) |
| **Metricool** | Free: 1 brand, 20 posts/month; YouTube videos and Shorts on paid plans "from $20" | SNIPPET (search 6) |
| **Buffer** | Free: 3 channels, 10 posts per channel | SNIPPET (search 6); long-form YouTube support UNKNOWN |
| **Postiz (self-hosted)** | Uses *our own* OAuth app, so it inherits our private lock. *"Postiz solves scheduling, not access"* | CODE (prior colony finding, `distribution--short-video.md:86`) |

- **Whether any of these vendors' uploads land public is UNKNOWN.** The revision history says creators can
  *"avoid the restriction by using an official or audited client"* [CODE, secondary]. A commercial service that
  advertises public YouTube publishing is almost certainly audited *(INFERENCE)*, but I saw no vendor statement,
  and none of their docs were readable (docs.upload-post.com is egress-blocked).
- **Also UNKNOWN:** long-form limits on the free tiers (file size, duration), watermarks, API access on the free
  plan (the snippet says yes for Upload-Post), and whether the free tier survives.
- **MISSION fit:** a **free tier is not a subscription** and can be used. **A paid tier is a recurring cost, so it is
  the owner's decision every time and never a draw on the ₪200 float** ("What it must never become is a
  subscription", MISSION.md:264) [CODE]. A third party also holds a live token to his channel, which is a
  dependency and a trust risk *(INFERENCE)*.
- **Owner steps:** sign in (or have agents create a brand-email account on the vendor, if that is allowed under
  MISSION rule 1; the agents cannot do the Google side), then click "connect YouTube" once, which is an OAuth
  consent. About 5–10 minutes *(INFERENCE)*.

### 6.2 YouTube Studio, a monthly batch by hand (recurring owner work)

- Studio takes **up to 15 files at once**. **There is no bulk-scheduling screen**: each video needs its title,
  description, visibility "Schedule", date and time set individually [SNIPPET, search 5, scheduler-vendor blogs;
  Google page https://support.google.com/youtube/answer/1270709?hl=en not readable].
- **Owner minutes (INFERENCE).** Per video: download the file, paste a prepared title, description and tags, set
  audience (not made for kids), set the AI-use toggle, add the thumbnail, set the schedule. About **5–8 minutes**,
  plus upload wait. At 8 long-form videos a month that is **~45–75 minutes/month**. At the reel's daily calendar
  (30/month) it is **~3–4 hours/month**.
- **MISSION verdict:** this is **recurring manual ops**, which the mandate rules out ("no manual ops", "Everything
  else is ours", MISSION.md:319–327). Admissible only if the owner explicitly opts in. As a default it makes the
  line "not a line" *(INFERENCE)*.

### 6.3 Excluded

- **Driving Studio with a headless browser**, to impersonate the official client. It evades the audit the
  platform set up, so it is a ToS and constitution problem. *(INFERENCE; I did not quote YouTube's ToS on
  automated access, so it is not graded above that.)*
- **Multiple Cloud projects or channels to multiply quota or reach:** §III.D.1.c.3 plus MISSION constraint 3 [CODE].

---

## 7. Anonymity

| Surface | Public? | Grade |
|---|---|---|
| Channel name, picture and handle on a **Brand Account** | Brand only. *"A YouTube channel connected to a Brand Account can use a different name than the one that you use on your Google Account"*. If the channel is on the personal account instead, *"the channel will use your Google Account name and photo"* | SNIPPET (search 4; https://support.google.com/youtube/answer/7286468?hl=en, answer/4628007) |
| Managers/owners of the Brand Account | Not shown to viewers | INFERENCE (no page read says so either way) |
| "About" tab business email / country / links | Only what is entered. Enter brand-domain email only, or nothing | INFERENCE |
| Cloud project, OAuth consent screen, audit form | Seen by Google and by the person consenting (the owner himself). The consent screen shows the support email he configures, so use a brand address | INFERENCE |
| AdSense payee, tax forms, address PIN | Google-internal (see sibling scout `monetization-gates.md` §8) | CODE (repo) |
| **DMCA counter-notification** | **Leaks.** *"Make sure that you include your complete physical address and full legal name … Do not enter a company or channel name."* and *"Legally, we're required to share the counter notification with the claimant. If disclosing personal information is a concern, an authorized representative (such as an attorney) can submit on the uploader's behalf"* | CODE: OpenTermsArchive captures of YouTube's Copyright Claims Policy (`vlopses-us-versions`, `-gb-`, `-ie-`, `-au-` `YouTube/Copyright Claims Policy.md`) |
| Third-party publisher (§6.1) | The vendor learns the channel and the account email. Not public | INFERENCE |
| Phone verification | The number goes to Google, not to viewers | INFERENCE |

**Rule this implies (INFERENCE):** the colony must **never file a counter-notification in the owner's name**.
Accept the takedown and remove the asset, or use a paid representative. The owner decides. Stock-footage
channels do attract false claims (rejection §5 of `docs/REJECTED.md` on stock licensing), so this is not
hypothetical. Content ID *disputes* (as opposed to DMCA counter-notices) were not checked for identity
disclosure: **UNKNOWN**.

---

## 8. The least-owner-involvement design, and the cheapest tests

### 8.1 Owner's one-time steps for the publishing half only (INFERENCE unless marked)

1. **Google account with 2-Step Verification**; **Brand Account** channel under the brand name. This overlaps the
   sibling scout's steps 1–3, so it is not new.
2. **Phone-verify the channel** (SMS code). This unlocks uploads **longer than 15 minutes** and **custom
   thumbnails** [CODE, secondary: `thegoldenmule/timeline` §8 citing https://support.google.com/youtube/answer/171664].
   ~3 min.
3. **Google Cloud project** → enable YouTube Data API v3 → consent screen *External* → **Publish app** → Desktop
   OAuth client → download the JSON. The agents give him click-by-click instructions. ~20–30 min [CODE,
   secondary: devthrottle and ai-post-scheduler guides].
4. **One consent**: run a local script (or a device-code page), choose the Brand channel, click past the unverified
   warning, Allow. The agents store the refresh token as a GitHub Actions secret. ~5 min.
5. **Submit the audit form** from his Google session with answers the agents drafted. ~15 min. **Follow-up emails
   may arrive.** Whether the agents may answer them from a brand mailbox or he must is an owner decision; it
   touches MISSION rule 1 ("never answer an identity check").
6. **Optional, parallel:** connect the channel to one audited third-party publisher on its free tier (§6.1).
   ~5–10 min.

**Total: ~45–75 minutes once, plus possible audit emails.** After that, **zero minutes per month** if either route
works. If both fail, the only remaining route is §6.2 at ~1 hour a month per 8 videos. That is his call, and by
default it is a no.

"Advanced features" (e.g. higher daily upload limits, clickable description links) reportedly need channel
history **or ID/video verification** [CODE, secondary: timeline §8 citing https://support.google.com/youtube/answer/9890437].
If "video verification" means filming his face, **it conflicts with "no camera"**. Waiting for channel history
is the alternative. **UNKNOWN which method applies.**

### 8.2 Cheapest tests before anything else is built (constraint 7 asks for the test first)

- **T1, audited third party, 1 upload.** Connect the channel to Upload-Post's free tier. Upload one short, honest,
  throwaway long-form test with `privacyStatus: unlisted` and `containsSyntheticMedia: true`. Read back its status.
  **Pass:** it stays unlisted/public and is not "locked". Cost ₪0, 1 of 10 free uploads.
- **T2, our own project, 1 upload.** One throwaway video through our unaudited project. Observe "locked as private"
  or not, and whether Studio lets it be changed. This settles §2.2 for ₪0 and burns one throwaway video.
  **Do not upload any real video through an unaudited project** (it cannot be appealed).
- **T3, honest audit application.** Submit with the true description: single channel, owned by the applicant;
  videos generated by software from a monthly queue the owner authorises in writing; AI disclosure set on every
  upload; no third-party users; no data retained beyond video IDs. **Pass:** approved. **Fail:** we learn that
  zero-touch self-publishing is not available honestly, and §6.1 becomes the only zero-touch route.

T1 and T3 can run in parallel. T2 is optional if T1 passes.

### 8.3 What this does not answer

It does not answer whether the channel will earn (sibling scout `monetization-gates.md`) or whether the content
survives the inauthentic-content policy. A perfect publisher for a channel that cannot be monetised is worth ₪0.

---

## 9. MISSION check

- **Constraint 3 (no account farm):** one channel, one Cloud project, one optional third-party connection. §III.D.1.c.3
  forbids sharing one project across clients. Nothing here scales by multiplying accounts. **Pass.**
- **Constraint 7 (acquisition channel named first):** publishing is plumbing, not acquisition. This report names the
  cheapest *publishing* test (§8.2), not the discovery test. **Not answered here.**
- **Constraint 8 (non-public input):** an audited API project plus a channel's accumulated upload history is a
  non-public, compounding input of the "platform history" kind. It is weak, because anyone can apply *(INFERENCE)*.
- **Float / subscriptions:** free tiers only. Any paid scheduler is the owner's recurring decision. **Pass if
  honoured.**
- **Anonymity:** holds, except for DMCA counter-notifications (§7). **Pass, with one standing rule.**
- **Owner does nothing:** true after setup on the automated routes; false on the Studio fallback.

---

## 10. What I could not verify

1. **Whether a "locked as private" video can be changed to public in Studio.** Google's help page (SNIPPET, and
   repo copies) says no appeal, re-upload; three 2026 repos say one click. Settle with
   https://support.google.com/youtube/answer/7300965 or test T2.
2. **Whether the lock is applied consistently in 2026.** One self-report says an unaudited upload stayed public
   (clipmint, 2026-09-17).
3. **The audit form's actual questions**, who may submit it, whether it can be answered in writing only, and the
   current turnaround. The form page (https://support.google.com/youtube/contact/yt_api_form) is egress-blocked.
4. **Whether an honest, fully automated single-owner uploader passes the audit** under §III.E / §III.I.2. No report
   either way.
5. **Whether any third-party publisher's YouTube uploads land public**, and their free-tier long-form limits
   (Upload-Post docs blocked).
6. **Google's own OAuth text on the 7-day expiry, production tokens and the personal-use exemption.** Read only in
   third-party quotes; https://developers.google.com/identity/protocols/oauth2 and
   https://support.google.com/cloud/answer/13464323 not rendered. No first-hand report of a YouTube
   production-unverified refresh token surviving for months.
7. **The API ToS §9.1 upload-certification notice** ("By clicking 'upload' …"), and how it applies to a client with no
   click. Seen only in `thegoldenmule/timeline`; https://developers.google.com/youtube/terms/api-services-terms-of-service
   not rendered.
8. **The archive date of the OpenTermsArchive Developer Policies copy** (GitHub commits API call failed). The live
   page https://developers.google.com/youtube/terms/developer-policies was not rendered.
9. **The "advanced features" verification method** (ID vs video selfie vs history); https://support.google.com/youtube/answer/9890437.
10. **Content ID dispute identity disclosure** (as distinct from DMCA counter-notification).
11. **Whether a Brand Account Manager (not Owner) can grant the OAuth consent** for uploads to that channel.

---

## 11. Sources

**RENDERED (this repo's runner captures, fetched 2026-09-25)**
- `research/rendered/youtube-api-quota-cost.txt` (https://developers.google.com/youtube/v3/determine_quota_cost): lines 157, 163, 169, 173, 471–475, 495–501, 531.
- `research/rendered/youtube-api-compliance-audits.txt` (https://developers.google.com/youtube/v3/guides/quota_and_compliance_audits): lines 157–191, 195.
- `research/rendered/youtube-altered-synthetic-disclosure.txt`: lines 77, 79, 151–193.

**CODE: first-party generated artefacts**
- `googleapis/google-api-go-client` `youtube/v3/youtube-api.json` (discovery doc, revision 20260923): `VideoStatus.containsSyntheticMedia`, `.publishAt`, `.privacyStatus`; OAuth scope list.
- `googleapis/google-api-php-client-services` `src/YouTube/VideoStatus.php`.

**CODE: third-party copies of Google/YouTube text (secondary)**
- `mattmezstitchlab/byaime-one-page` `research/sources/freshness-03-youtube-revision-2026.md` @cc0890d (copy of https://developers.google.com/youtube/v3/revision_history, fetched 2026-09-08): lines 295, 367–379, 396–411, 615–625, 851–861.
- OpenTermsArchive `pga-versions` `YouTube/Developer Terms.md` (copy of https://developers.google.com/youtube/terms/developer-policies): lines 39, 105, 159–165, 221, 271, 390, 399–407, 419, 437.
- OpenTermsArchive `vlopses-us-versions` / `-gb-` / `-ie-` / `-au-` `YouTube/Copyright Claims Policy.md`.
- `porjo/youtubeuploader` README (lines 45–51, 61, 131–157).
- `FujiwaraChoki/MoneyPrinter`-derived READMEs (e.g. `Troptrap/MoneyPrinter-Enhanced`) quoting https://support.google.com/youtube/answer/7300965.
- `avantifellows/plio-backend` `docs/research/e2e-stack-survey.md`; `thefrederiksen/devthrottle` `tools/cc-gmail/docs/connect-a-google-account.md` @9d836f3 (OAuth expiry, production/unverified, personal-use exemption).
- `thegoldenmule/timeline` `docs/research/11-youtube-upload.md` @5fbfb17 (research dated 2026-09-09; §1, §3, §6, §8).

**CODE: third-party implementations, experience reports and plans (weaker: self-reported or unsourced)**
- `Twinklebear/Twinklebear.github.io` `content/blog/2020-11-13-vis2020-streaming-infrastructure.md` @a108add (first-hand audit timing, 2020).
- `kleZ799/clipmint` `docs/youtube-upload.md` @8527f0a; `emin-grbo/ai-post-scheduler` `Setup-human-YouTube.md` @73edbac; `SubliminalCoding/ClawStudio-Open` `src/youtube/auth.ts`; `SeanSwan/-SS-PT-New` `docs/ai-workflow/brainstorms/youtube-production-studio-blueprint-2026-08-11.md` lines 123–127; `sapphirefountains/erpnext_enhancements` `docs/marketing-platform-approvals.md` lines 386–403; `totallyfacelessmafia/Ambient-Channel` `docs/youtube-api-verification.md`.
- `Upload-Post/n8n-nodes-upload-post` `nodes/UploadPost/UploadPost.node.ts`; `harry0703/MoneyPrinterTurbo` `app/services/upload_post.py`; `Significant-Gravitas/AutoGPT` `autogpt_platform/backend/backend/blocks/ayrshare/post_to_youtube.py`.
- GitHub issue pages `porjo/youtubeuploader#86` and `tokland/youtube-upload#306` (via WebFetch summariser).

**CODE: this repo**
- `MISSION.md` (lines 119–191, 211–230, 255–304, 319–327); `docs/REJECTED.md` lines 68–138; `research/colony-sweep/scouts/distribution--short-video.md` lines 70–94; `research/faceless-youtube/scouts/monetization-gates.md` §0, §8; `research/faceless-youtube/00-owner-reel-2026-09-25.md`.

**SNIPPET (search summaries)**
- Search 1: https://support.google.com/youtube/answer/7300965 ("Videos locked as private"), https://github.com/tokland/youtube-upload/issues/306.
- Search 2: no usable timing data; https://www.outstand.so/blog/youtube-api-pricing-quota (egress-blocked on fetch).
- Search 3: https://www.upload-post.com/pricing-comparison/, https://www.upload-post.com/buffer-pricing/, https://docs.upload-post.com/api/overview/ (the vendor's own marketing, so self-interested).
- Search 4: https://support.google.com/youtube/answer/4628007?hl=en-118&co=GENIE.Platform%3DDesktop, https://support.google.com/youtube/answer/7286468?hl=en.
- Search 5: https://support.google.com/youtube/answer/1270709?hl=en, https://www.brandghost.ai/blog/posts/youtube-bulk-scheduling (a scheduler vendor).
- Search 6: https://publer.com/blog/metricool-vs-publer/, https://metricool.com/metricool-vs-buffer/, https://bestsocialmediascheduler.com/best/youtube-scheduler (vendors and affiliates, self-interested).

---

## 12. Search log (6 of 6)

1. `"locked as private" "unverified" API upload YouTube Studio change visibility public`: help page 7300965 wording.
2. `YouTube API compliance audit approved lift private upload restriction personal project how long weeks experience`: nothing beyond "no published processing time".
3. `upload-post.com pricing free plan uploads per month YouTube API`: free tier of 10/month.
4. `YouTube Brand Account channel name public does it reveal owner personal Google account name to viewers`: Brand Account name separation.
5. `YouTube Studio upload up to 15 videos at once schedule each video publish time bulk`: 15 at once, no bulk scheduling.
6. `Buffer vs Metricool vs Publer free plan YouTube long-form video scheduling 2026 limits price`: free-tier limits.

GitHub code search (the `search_code` tool), raw.githubusercontent.com fetches and WebFetch on github.com are **not**
WebSearch and were used freely. Blocked hosts hit once each and not retried: www.outstand.so, docs.upload-post.com.
