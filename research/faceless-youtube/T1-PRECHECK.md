# T1 pre-check — Upload-Post as the audited YouTube publisher (27.9.2026)

**T1 is worth the owner's minutes: ONLY IF the same sitting also includes the analytics-only read consent
(red team §2.1 fix (b), about 10-15 more minutes).** On uploading alone the answer is now YES. One dated,
public field test shows Upload-Post's **free plan** uploading to YouTube **through the API** with the requested
visibility honoured, so no private lock. On measuring, the answer is NO: no public source shows Upload-Post
returning YouTube watch time, traffic source or subscriber status. The experiment's K0/K3 gates cannot be read
through Upload-Post, so asking the owner only for T1 would buy an experiment the colony cannot read.

Grades: **CODE** = read in source (vendor repo = first-party and self-interested; other repos = third-party;
`research/rendered/` = a rendered primary page in this repo). **SNIPPET** = WebSearch result text, never
CONFIRMED. **UNKNOWN** = no evidence either way. **INFERENCE** = my reasoning, marked as such.
Budget: WebSearch 5 of 5. Every Upload-Post host and both third-party review hosts returned a proxy 403 on
their one attempt (list at the end). All CODE below was read in this session from raw.githubusercontent.com or
the local fork.

---

## What changed since VERDICT / RED-TEAM / audits

| Point | Before (DIGEST claim 8, audit §2.4, red team §3) | Now |
|---|---|---|
| Upload-Post uploads land non-private | UNKNOWN | **CODE, third-party field test** (Q1): an `unlisted` request came back `unlisted`, not `private`, on 23.8.2026 |
| Free tier includes API access | contested (vendor SNIPPET vs `cabin-visuals` line 86) | **Resolved for yes** (Q2): a real API upload on a free account returned `"usage":{"count":1,"limit":10}`; the vendor's own repos say so too |
| Long-form on the free tier | not shown | still **UNKNOWN**; no per-plan duration or size cap exists in any code read |
| Upload-Post analytics can feed K0/K3 | open (red team §2.1 fix (a)) | **Not evidenced, and probably not** (Q3); the traffic-source and follower splits are documented for TikTok only |
| API fields | CODE (n8n node) | re-confirmed in four vendor codebases; one naming trap and one T1 trap found (Q4) |

---

## Q1. Is Upload-Post's YouTube client audited, so `privacyStatus=public` stays public?

**Answer.** No public statement names YouTube, and YouTube publishes no list of audited clients (red team §2.7).
Upload-Post's audit status is therefore **UNKNOWN as a label**. The property T1 actually needs is "no private lock
on this path", and **one public, dated field test says the lock does not apply**. No public report of an
Upload-Post upload locked as private was found.

**Evidence**

1. **CODE, third-party field test.** `JulienCr/avolo-shorts`, `docs/superpowers/specs/2026-08-18-publication-reseaux-design.md`
   §2.4, lines 218-238 (French; translation mine):
   > "**Mesuré le 23 août 2026 : le verrou ne s'applique pas par ce chemin.** Un envoi réel, sur le compte de Julien,
   > `POST /api/upload` avec `platform[]=youtube` et **`privacyStatus=unlisted`** — délibérément pas `public` […] Le
   > verrou d'un projet non audité force `private` **quel que soit ce qui est demandé** […] La page de la vidéo […] rend
   > `"isPrivate":false` et `"isUnlisted":true` […] et l'oEmbed de YouTube la résout (200, auteur « La Scène Avolo »)"

   ("Measured 23 August 2026: the lock does not apply on this path. A real upload on Julien's account … with
   privacyStatus=unlisted — deliberately not public … an unaudited project's lock forces private whatever is
   requested … the video page returns isPrivate:false and isUnlisted:true … and YouTube's oEmbed resolves it (200).")
   The response it quotes: `{"success":true,"results":{"youtube":{"success":true,…,"status":"completed"}}}`.
   - The logic holds against our rendered primary pages. An unverified project's uploads *"will be restricted to
     private viewing mode"* [CODE, `research/rendered/youtube-api-videos-insert.txt:219-222`], so an `unlisted`
     result rules out the lock at upload time. **INFERENCE:** it does not rule out a lock applied hours later. The
     same author's connector still says, in a docblock possibly written before the measurement: *"Mais personne n'a
     encore regardé sortir une vraie vidéo publique par ce chemin"* ("nobody has yet watched a real public video go
     out this way") (`src/server/publication/upload-post.ts:40-41`). T1's 72-hour window covers that gap.
   - Limits: it is one Shorts-tool upload by one account, with the video ID redacted. We cannot reproduce it from here.
2. **SNIPPET, first-party (search 1, upload-post.com homepage):** *"UploadPost integrates directly with the official,
   verified APIs of platforms like TikTok, Instagram, and Facebook using secure OAuth. Our app is verified with these
   platforms and adheres to their reviews and audits."* **YouTube is not named.** The search tool's own summary ("a
   verified application that has already passed platform audits") is its gloss, not a vendor quote.
3. **CODE, vendor.** The vendor's API exposes `youtubePrivacyStatus: z.enum(["public", "private", "unlisted"])`
   (`Upload-Post/upload-post-mcp` `src/tools/upload.ts:212-215`). **INFERENCE (weak):** a vendor whose client were
   locked would be selling a dead option, and the avolo author reasons the same way (§2.4, line 213: *"ce qu'un projet
   non audité ne peut pas offrir"*, "what an unaudited project cannot offer").
4. **CODE, third-party assertion without evidence.** `muzzamilhassan/automation`
   `research/youtube-upload-quota-research-2026-09.md:68-71`: *"Third-party platforms with their OWN audited quota —
   They upload via their audited API projects"*, with Upload-Post in the table. This is an assumption, not a
   measurement, so it adds nothing.
5. **Absence of contrary reports (UNKNOWN, weak).** The official n8n node's issue tracker has 4 issues, all about
   timeouts, Instagram, Twitter and package install; none is a YouTube lock. A semantic GitHub issue search for
   Upload-Post YouTube private/lock returned 0 results, and code search found no such report. WebSearch 2 returned
   only the generic Google help page and an unrelated `tokland/youtube-upload` issue.
6. **The mechanism, from rendered primary pages.** *"Creators who use an unverified API client to upload video will
   receive an email explaining that their video is locked as private, and that they can avoid the restriction by
   using an official or audited client."* [`research/rendered/youtube-api-revision-history.txt:877-880`]. Such
   videos cannot be appealed [`youtube-private-lock-help.txt:84`].

**Consequence for T1.** The risk that T1 fails on the lock is now low, not unknown. Pass must still be defined by
observables only (red team §2.7): public from a logged-out view, oEmbed 200 (the avolo method), no "locked as
private" email, and still public at 72 hours.

---

## Q2. Does the free tier include API access, and long-form YouTube?

**Answer.**
- **API access on the free tier: YES.** A real API call on a free account shows it (CODE, third-party), and the
  vendor's own repos say it (CODE, first-party). The contrary claim ("API access requires Professional ~$33/mo")
  now stands alone against a measurement.
- **Long-form on the free tier: UNKNOWN.** No tier-specific duration or size cap appears anywhere in vendor code.
  The only field-tested free upload came from a Shorts tool.

**What the free tier allows, as far as public sources show**

| Item | Value | Grade / source |
|---|---|---|
| Uploads | 10 per month, **counted per platform**: *"one publish to 3 platforms counts as 3"* | CODE, vendor: `Upload-Post/skill-autoshorts` README.md:280, SKILL.md:304 |
| Measured cap on a real free account | `"usage":{"count":1,"limit":10}` returned by the API | CODE, third-party: avolo spec §2.5, lines 257-260 |
| Profiles | 2 | SNIPPET (search 3); CODE, third-party table: avolo spec line 254 |
| API key / REST / SDKs | *"Free plan, no credit card. Get an API key and try the whole thing before paying."* | CODE, vendor: `Upload-Post/upload-post-plugin` README.md:40 (also :9) |
| API pipeline on free | *"The free tier (10 uploads/month) is enough to validate the pipeline; paid plans for production volume."* | CODE, vendor: skill-autoshorts README.md:276 (the pipeline is API-driven) |
| Analytics | *"Every plan, including Free, has full API access, scheduling and analytics. Paid plans add TikTok."* | SNIPPET (search 3, vendor pages; the tool paraphrases, so not attributable to one page) |
| TikTok | not on free | SNIPPET (search 3); CODE, third-party: `ColinGPT9/clips-studio` docs/UPLOAD-POST.md:24, 253-254; avolo line 254 |
| FFmpeg jobs | *"Quotas: Free 30min/mo, Basic 300min, Pro 1000min, Advanced 3000min, Business 10000min."* | CODE, vendor: `Upload-Post/upload-post-skill` SKILL.md:237 |
| A daily cap on free | *"`quota_exceeded` \| Free-plan daily limit hit"*; the value is not given | CODE, vendor: upload-post-plugin README.md:123 → **UNKNOWN value** |
| YouTube size/length | *"Max size: 256GB / Max duration: 12 hours"*; these are YouTube's own ceilings, not a plan limit | CODE, vendor: upload-post-skill `references/requirements.md:67-71` |
| Paid (for the owner's decision only) | Basic $24/mo ($16 annual), unlimited uploads, 5 profiles | SNIPPET (search 3), consistent with earlier audits |

**Contrary source, still unreadable here.** `JulianMcOmie/cabin-visuals` `docs/research-social-upload-apis.md:86`:
*"Free: 10 uploads/mo; Basic $16/mo; **API access requires Professional ~$33/mo**"*, citing postqued.com and
linkstartai.com (both returned a proxy 403 on their one attempt). **INFERENCE:** probably stale or wrong. It
contradicts a live API response on a free account, and "Professional ~$33" matches no tier in current vendor
snippets.

**Long-form, specifically.**
- `mutonby/vibetube` README.md:10-12, 229-235 publishes 16:9 videos with chapters to YouTube through Upload-Post
  (CODE, third-party). Its plan is not stated.
- The MCP server caps *inline base64* bytes at 100 MB (`UPLOAD_POST_MAX_INLINE_MB`, upload-post-mcp README.md:226).
  That applies to MCP only, not to the REST multipart `/api/upload` the colony would call.
- **UNKNOWN:** a free-tier file-size cap on REST uploads. A 9-12 minute 1080p render is roughly 100-400 MB
  (INFERENCE).
- The channel-side gate is separate: uploads over 15 minutes need the channel phone-verified (VERDICT A3, SNIPPET
  grade there).

**Budget fit (INFERENCE, arithmetic).** T1 (1) plus the six test videos is 7 YouTube uploads, within 10 a month,
provided nothing is cross-posted (each extra platform costs one upload).

---

## Q3. Does Upload-Post expose analytics that can read K0 and K3?

**Answer.**
- **Analytics via API: YES, and YouTube is included** (CODE, vendor).
- **Per-video YouTube views: probably yes.** Third-party clients map YouTube to `views` / `view_count`.
- **Watch time for YouTube: UNKNOWN.**
- **Split by traffic source: UNKNOWN**, documented for TikTok only.
- **Split by subscribed status (UNSUBSCRIBED): UNKNOWN**, documented for TikTok only, as followers vs non-followers.

No code, fixture or snippet shows any YouTube watch-time, traffic-source or subscriber field. **Plan on red team
§2.1 fix (b)**: an analytics-only Cloud project consent for `yt-analytics.readonly` on the brand account, no
upload scopes, no audit.

**Evidence**
1. **CODE, vendor.** Analytics tools exist: `get_analytics`, `get_total_impressions`, `get_post_analytics`,
   `get_cached_post_analytics`, `get_platform_metrics` (`upload-post-mcp` `src/tools/analytics.ts`). `youtube` is in
   `AnalyticsPlatform` (`src/schemas.ts:70-80`). The plugin's matrix marks YouTube analytics ✅ (`upload-post-plugin`
   FEATURES.md:13).
2. **CODE, vendor. The extras are TikTok's.** `get_post_analytics` (analytics.ts:76-77):
   > "`post_metrics` carries whatever each platform reports, so its shape is not the same everywhere: on TikTok it
   > adds `retention` (the curve, second by second), `impression_sources` (For You, following, search, profile…),
   > `audience_types` (followers vs non-followers), `new_followers` won by the post, `reach` and the watch times
   > (`average_time_watched`, `total_time_watched`, `full_video_watched_rate`)"

   Near-identical wording appears in the npm SDK types (`index.d.ts:1243-1248`). The field is typed as
   `/** Counters plus, on TikTok, retention / impression_sources / audience_types and watch times. */
   post_metrics?: Record<string, any>` (:1259-1260). The n8n node says the same (`UploadPost.node.ts:2183`). Audience insights are TikTok-only by schema:
   `const AudiencePlatform = z.enum(["tiktok"])` (`src/tools/audience.ts:15-16`).
3. **CODE, third-party. What YouTube actually returns, as seen by integrators.**
   - `CatharsisDev/CatharsisDashboard` `src/lib/uploadpost.ts:51-53`: *"YouTube uses `view_count`"*.
   - Same file, lines 149-153: *"YouTube = lifetime … platforms that don't support windowing (e.g. YouTube lifetime)
     still return their default scope"*.
   - `itzmhizterlouis/marble-backend` `app/analytics.py:39`: `"youtube": (("views", "view_count"), "Views")`.
   - The vendor's own `skill-autoshorts` reads only `views`/`impressions`/`reach` plus likes/comments from
     `post_metrics` (`autoshorts.py:706-727`).
4. **CODE, third-party reading of vendor docs.** `YbicG/Marketing-Autopilot` `docs/spikes/upload-post.md:74-75`:
   - *"`GET /api/uploadposts/platform-metrics` (no auth) lists each platform's metric names. **Confirmed in docs**"*
   - *"The exact keys inside `post_metrics` per platform: **unverified — call `/api/uploadposts/platform-metrics` on
     day 1**"*
   - Also: live analytics are rate-limited to *"100 requests / 5 minutes"* (upload-post-mcp README.md:103). That is
     harmless at 7 videos.
5. **UNKNOWN.** GitHub code search for `api.upload-post.com` with `estimatedMinutesWatched` / `watch_time` /
   `averageViewDuration` returned 0 results. WebSearch 4 found nothing Upload-Post-specific.
6. **INFERENCE.** K0 and K3 need YouTube Analytics dimensions: traffic source, and `subscribedStatus == UNSUBSCRIBED`
   for watch time (VERDICT §9; DIGEST:214, 241).
   - A wrapper can return those only if its Google consent includes an analytics scope *and* it queries those
     dimensions. Nothing shows Upload-Post does either.
   - Lifetime `view_count` per video would give a total-views floor for K0. It would not give stranger views, so
     the K0 threshold as written cannot be computed from it.

**Consequence.** Red team §2.1 fix (a) is very unlikely to succeed. The cheap way to close it before asking the
owner is to read the metrics list at the URL below (documented as unauthenticated). This container cannot reach
it: one attempt, proxy 403. If YouTube's `available_metrics` there lacks watch time and any source or subscriber
split, fix (b) goes into the owner's Stage A list: one step, named, ~10-15 min, analytics scope only.

---

## Q4. What the API accepts for YouTube

**Answer.** Everything T1 needs is supported (all CODE, vendor, in four independent codebases).
- **Visibility:** `privacyStatus` (public / unlisted / private).
- **AI disclosure:** `containsSyntheticMedia`.
- **Title and description:** `title` (required for YouTube) with a `youtube_title` override, and
  `youtube_description`.
- **Scheduling on YouTube's side:** `youtube_publish_at`.
- **Also:** `selfDeclaredMadeForKids`, tags, `categoryId`, thumbnail, playlist, subtitles, languages,
  paid-placement flag and notify-subscribers.

**Evidence**
- **Form fields as sent by the REST client** (`Upload-Post/n8n-nodes-upload-post` `nodes/UploadPost/UploadPost.node.ts`):
  - lines 696-770: `formData.privacyStatus`, `formData.containsSyntheticMedia = String(containsSyntheticMedia)`,
    `formData.selfDeclaredMadeForKids`, `tags[]`, `categoryId`, `thumbnail_url`, `youtube_playlist_id`,
    `youtube_notify_subscribers`, `youtube_publish_at`;
  - title/description overrides: `field: 'youtube_title'` (:229) and `field: 'youtube_description'` (:250);
  - :5745: *"Schedule the YouTube video to go public at this ISO-8601 datetime. Privacy should be private."*
- **Python SDK** (`Upload-Post/upload-post-pip` README.md:576-590): `privacyStatus` *"public, unlisted,
  private"*; `containsSyntheticMedia` *"AI/synthetic content flag"*; `youtube_publish_at` *"RFC3339 time; uploads as
  private and schedules on YouTube"*.
- **Node SDK types** (`Upload-Post/upload-post-npm` `index.d.ts`):
  - :46 `title` *"Required for YouTube"*;
  - :26 `YouTubePrivacyStatus = 'public' | 'unlisted' | 'private'`;
  - :312 `youtubeContainsSyntheticMedia?: boolean`;
  - :327-328 *"RFC3339 time. Uploads the video as private until this instant (Studio: Scheduled)"*
    `youtubePublishAt?: string`.
- **MCP** (`upload-post-mcp` `src/tools/upload.ts:212-230`): `youtubeContainsSyntheticMedia: z.boolean().optional()
  .describe("YouTube AI/synthetic content disclosure.")`.
- **Limits** (CODE, third-party reading of vendor docs): YouTube *"Title ≤100, description ≤5000"*
  (Marketing-Autopilot spike :37).
- **The colony's fork** (`zarfatinimrod-creator/MoneyPrinterTurbo` `app/services/upload_post.py:78-86`, identical
  locally and on GitHub): sends `youtube_title` (truncated to 100), `youtube_description`, `tags[]`, `privacyStatus`
  (default `"public"`) and hard-codes `('containsSyntheticMedia', "true")`.
- **YouTube-side counterparts exist** (rendered primary page): `status.publishAt` and `status.containsSyntheticMedia`
  [`research/rendered/youtube-api-videos-insert.txt:364, 368`].

**Two traps**
1. **Naming.** The vendor's own skill reference lists the YouTube field as `privacy_status` (`upload-post-skill`
   `references/platforms.md:31`). The executing code (n8n formData, the pip SDK, the fork) sends `privacyStatus`.
   Use `privacyStatus`, and read the result back rather than trusting the response.
2. **Defaults.** `containsSyntheticMedia` defaults to **false** in the n8n node (:722), so it must be set explicitly
   (the fork does).

**A trap for T1 itself (INFERENCE from the SDK text above).** A video sent with `youtube_publish_at` is *private
until that instant*, which looks exactly like a lock during the window. T1 must upload with an immediate
`privacyStatus=public` and no `youtube_publish_at`. Upload-Post's own `scheduled_date` holds the file on its side
instead (upload-post-skill SKILL.md:72, 155-164) and does not have this ambiguity.

---

## What the pre-check implies for T1's design (INFERENCE, for the main thread to decide)

1. **Pass criteria** (red team §2.7): after an immediate public upload,
   - the video page shows it public to a logged-out viewer and YouTube oEmbed returns 200;
   - no "locked as private" email arrives;
   - it is still public at 72 hours.
   Drop "publisher's audited status confirmed"; it is unobservable.
2. **Make T1 exercise the long-form path:** a horizontal (16:9), non-Short, honest test video, so the free-tier
   long-form question (Q2) is answered by T1 rather than by video 1 of 6.
3. **Owner's Stage A ask becomes A1-A4 plus one analytics step** (Q3), unless the metrics list shows YouTube source
   and subscriber splits, which no source suggests. Without that step the experiment cannot be read (MISSION rule 5).
4. **Brand Account connection through Upload-Post's OAuth: UNKNOWN.** The only mention is third-party advice
   (*"Use a brand account for the project rather than your personal channel."*, `YbicG/Marketing-Autopilot`
   `apps/web/src/app/settings/accounts/page.tsx:35`). If Upload-Post's Google consent offers no channel picker,
   T1 fails for a reason unrelated to the lock. Record it that way.
5. **Scope, per the verdict:** no paid tier and no cross-posting. With 10 uploads a month counted per platform, one
   extra platform per video would exhaust the month.

---

## URLs that would settle it (as seen in sources read; none opened from here)

| Question | URL | Where it was seen | Tried here |
|---|---|---|---|
| Q3: YouTube's metric names | `https://api.upload-post.com/api/uploadposts/platform-metrics` | base `https://api.upload-post.com/api` (upload-post-npm `index.js:6`) + path `/uploadposts/platform-metrics` (`index.js:1351`; n8n node :1411); "(no auth)" per Marketing-Autopilot spike :74 | 1 attempt, proxy 403 |
| Q3: per-post analytics fields | `https://docs.upload-post.com/api/get-analytics/` | Marketing-Autopilot spike :74 | not tried (docs host blocked) |
| Q2/Q3/Q4: whole API, LLM-readable | `https://docs.upload-post.com/llm.txt` | upload-post-skill SKILL.md:13 | 1 attempt, proxy 403 |
| Q2: plan limits (file size, daily cap) | `https://docs.upload-post.com/resources/pricing-and-limits/` | Marketing-Autopilot spike :70 | not tried |
| Q4: upload fields | `https://docs.upload-post.com/api/upload-video/` | Marketing-Autopilot spike :3, :37 | not tried |
| Q4: AI labels | `https://docs.upload-post.com/guides/ai-content-labeling/` | Marketing-Autopilot spike :32 | not tried |
| Q2: vendor pricing | `https://www.upload-post.com/pricing-comparison/` | search 3; muzzamilhassan research :123; earlier audits | pricing page: 1 attempt on www.upload-post.com, proxy 403 |
| Q2: the contrary claim | `https://www.linkstartai.com/en/agents/upload-post`, `https://postqued.com/blog/best-upload-post-alternatives` | cabin-visuals :86, :124 | 1 attempt each, proxy 403 |
| Q1: vendor's "verified" wording | `https://www.upload-post.com/` | search 1 | host blocked |
| Q1 (indirect): privacy policy, which YouTube API clients must publish | `https://upload-post.com/privacy` | upload-post-mcp README.md:241 | not tried |
| Q1: the field test itself (readable) | `https://github.com/JulienCr/avolo-shorts` → `docs/superpowers/specs/2026-08-18-publication-reseaux-design.md` §2.4-2.5 | GitHub code search | read in full |

## Method and sources

- **Vendor repos read** (github.com/Upload-Post, 13 public repos):
  - `upload-post-mcp`: README; `src/server.ts`, `src/schemas.ts`, `src/tools/{analytics,upload,audience}.ts`;
  - `upload-post-skill`: SKILL.md, `references/{platforms,requirements}.md`;
  - `upload-post-npm`: README, `index.d.ts`, `index.js`;
  - `upload-post-pip` README;
  - `n8n-nodes-upload-post`: README, `nodes/UploadPost/UploadPost.node.ts`, and its issues;
  - `upload-post-plugin`: README, FEATURES.md, `skills/analyze-performance/SKILL.md`, `agents/post-debugger.md`;
  - `skill-autoshorts`: README, SKILL.md, `autoshorts.py`;
  - `viraloop` README; `avatar-mix` README.
- **Third-party repos read:** JulienCr/avolo-shorts (spec, connector, lessons, scheduling spec);
  YbicG/Marketing-Autopilot (spike, accounts page); CatharsisDev/CatharsisDashboard;
  koushik1133/glen-villa-final; itzmhizterlouis/marble-backend; robertnowell/video-essay; mutonby/vibetube;
  ColinGPT9/clips-studio; muzzamilhassan/automation; JulianMcOmie/cabin-visuals; api-evangelist/upload-post
  (OpenAPI; the schemas are untyped `object`); zarfatinimrod-creator/MoneyPrinterTurbo.
- **WebSearch, 5 of 5:**
  1. audit/verified: vendor "verified … like TikTok, Instagram, and Facebook";
  2. private-lock reports: none Upload-Post-specific;
  3. free plan API: vendor snippets say yes;
  4. YouTube analytics fields: nothing;
  5. privacy-policy "YouTube API Services": nothing Upload-Post-specific.
- **Blocked, one attempt each, not retried:** api.upload-post.com, docs.upload-post.com, www.upload-post.com,
  www.linkstartai.com, postqued.com (all `CONNECT tunnel failed, response 403`). api.github.com was also refused for
  non-session repos; files were read from raw.githubusercontent.com instead.
- All fetched content was treated as data. Nothing in it was followed as an instruction.
