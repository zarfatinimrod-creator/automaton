# Ruling — T1's P1 and P2 after the youtube.com bar: the Data API read, 16(d), `stayedPublic()`, T1-PROTOCOL's rows; the kids sub-brand, 7.10.2026 — `logs/FABLE_QUEUE.md` row 24

**Sitting.** 7.10.2026 ~07:11 UTC, beside row 25 (the PostHog organisation step; not touched here beyond the brief's
"Links between the two rows"). One decider: the deciding model of the sitting. No subagents, no web fetch, no connector,
no `gh`, no git command that writes, no edit outside this file; the main thread commits and folds on Opus. The owner is
"the owner".

**Tree.** `ac637a3` on `claude/new-session-j071dx` (`git log --oneline -1`, read-only). The brief
(`research/channel-loop/SITTING-2026-10-07-BRIEF.md`) was checked at `19d203a`; `git diff --stat 19d203a..HEAD` touches 89
files, of which five are in this row's subject: `scripts/render-watch.mjs`, `scripts/queue-zero-test.mjs`,
`research/channel-loop/terms-verdicts.json`, `logs/CHANNEL_LOOP.md`, `research/channel-loop/RULING-2026-10-06-robots-and-terms.md`.
Every pointer below was re-opened at HEAD with `sed -n`, `cat -n` or `grep -n`; the ones that moved are listed under
"Pointers moved since `19d203a`". The only code run: `grep -c -F` counts over five developers.google.com captures on disk
(D1(1)(i)) and `grep -n` over the tree; no script was executed, nothing was fetched.

**Read.** `MISSION.md` in full (493 lines); the brief's header (`:1-143`), Part A (`:144-502`) and Part C (`:776-957`);
`logs/FABLE_QUEUE.md:48`; `research/faceless-youtube/T1-PROTOCOL.md:1-137` (the whole file);
`research/channel-loop/RULING-2026-10-04-kids-youtube.md` `:236-250`, `:273-292`, `:318-360`, `:378-405`, `:427-460`,
`:500-520`, `:540-583`; `research/channel-loop/RULING-2026-09-30-video.md:20-140`, `:218-230`; `src/revenue/youtube-madeforkids.ts`
(175 lines, whole); `scripts/youtube-madeforkids-readback.ts` (163 lines, whole); `src/revenue/experiments.ts` `:1-135`,
`:155-256`; `research/youtube-kids/KIDS-LINE.md` `:170-186`, `:246-256`, `:296-314`; `research/measurements/kids-subbrand-candidates.txt`,
`kids-subbrand-candidates.json` and `kids-subbrand-check.md` (whole); `scripts/render-watch.mjs:505-585`;
`research/channel-loop/RULING-2026-10-06-robots-and-terms.md:1-60`, `:162-215`, `:339-434` (the house form); and, cited where
used: `src/__tests__/revenue/youtube-madeforkids.test.ts`, `brand-check.test.ts`, `experiments.test.ts`,
`kids-explainers-kills.test.ts`; `scripts/brand-check.mjs`; `scripts/queue-zero-test.mjs`; `research/youtube-kids/ASSESSMENT.md:415-433`;
`research/faceless-youtube/scouts/{discovery,upload-automation,policy}.md`, `REGRADE.md`, `VERDICT.md`, `RED-TEAM.md`,
`T1-PRECHECK.md`, `PREREG-DECISIONS.md`; `research/channel-loop/TERMS-AUDIT-2026-09-29.md:119`, `terms-verdicts.json`,
`RULING-2026-09-29-lines.md`, `BOARD-LOOP.md`, `SITTING-2026-10-01-BRIEF.md:20-35`; `research/measurements/t1-subbrand-candidates.txt`,
`t1-subbrand-check.md`, `brand-candidates.txt`, `brand-name-check.md`, `brand-name-decision.md`; `logs/CHANNEL_LOOP.md`;
`src/revenue/{publisher-guard,publication-gate,youtube-analytics,owner-steps}.ts`, `scripts/youtube-analytics.ts`;
`.github/workflows/colony.yml:20-23`, `brand-check.yml:22-30`; `state/colony/REPORT.md:9-13`.

**Grades** as the 30.9 ruling defines them and the brief restates (`BRIEF:14-20`): `rendered`, `github`, `github via note`,
`rendered via note`, `snippet`, `repo`, `inference` (always marked), `none`. **Marks.** `[against-bar]` (D1(1),
`RULING-2026-09-30-video.md:27-31`): readable at rendered grade for a compliance question or a decision not to do something,
never a product input. Every developers.google.com capture named here is `[against-bar]` by inference
(`termsBarred("developers.google.com")` → `google.com`, code; D1 names only support.google.com —
`SITTING-2026-10-01-BRIEF.md:23-25`). **Every such capture is live** (`research/rendered/FROZEN.sha256` has no YouTube or
Google-developer entry; its `:183-185` are a VRP FAQ), so each is described in words with `grep -c -F` counts and is never
cited by line. `[D1(1)(ii)]` marks the YouTube column of `research/measurements/t1-subbrand-check.md` (`:10-11`), read here
only to decide not to re-probe.

**Standing rules applied.** The owner does only the batched one-time steps: "Never invent a step that isn't required."
(`MISSION.md:436`); "**Never** open an account in the owner's name, answer an identity check, or mark setup done on our own
initiative." (`:437-439`); "The owner does not talk to customers." (`:440`); the owner's brief, "אני לא מדבר עם אנשים"
(`:12`). ₪0: "The ceiling in `src/revenue/budget.ts` is ₪0" (`:352-353`), "**Nothing is bought.**" (`:354`). Honest value
outranks the target: "no ToS violations, nothing that deceives a buyer" (`:455-456`). The brand is the only public face
(`:276`, `:310`). YouTube is two lines, and the kids line is "for children who can read the declaration" (`:405-423`,
`:419-420`). The loop's Never: "a fetch of any tiktok.com or gumroad.com page, or of a site whose terms are unread or
refused (ruling 30.9 16(d), …)" (`logs/CHANNEL_LOOP.md:79`); "a portal operated by the runner without the venue's written
yes" (`:81-86`). The 30.9 ruling's own: "Silence is not allowance, and fetch-then-read is this repo's twice-recorded
failure" (`RULING-2026-09-30-video.md:83-84`). Serious means measured: "An experiment nobody can read is not an
experiment" (`T1-PROTOCOL.md:86-87`; `MISSION.md:461`). The chain of command is real: "an auditor can recompute them from
the same numbers" (`:442-449`, rule 3).

**Money today.** ₪0.00 in the 30-day window, converted and unconverted (`state/colony/REPORT.md:9-10`; the HEAD commit's
subject, `ac637a3`). Nothing in this file is revenue; nothing in it fetches, publishes or spends.

**Short names** as the brief's (`BRIEF:60-70`): `KIDS-RULING`, `VIDEO-RULING`, `LINES-RULING`, `ROBOTS-RULING`,
`T1-PROTOCOL`, `KIDS-LINE`, `ASSESSMENT`, `TERMS-AUDIT`; "the read-back" is `src/revenue/youtube-madeforkids.ts`, "the
read-back script" `scripts/youtube-madeforkids-readback.ts`; "the kids list" is
`research/measurements/kids-subbrand-candidates.txt` with its `.json` and `kids-subbrand-check.md`. **The labels** are the
brief's (`BRIEF:162`): (a) does the Data API read answer P1/P2 as written; (b) is the API a fetch of a barred site under
16(d); (c) what T1-PROTOCOL's rows should say; (d) `stayedPublic()` as the K-T1k read; (e) the kids sub-brand.

---

## 1. (a) Does the Data API read answer P1 and P2 as written? Yes for "public" and "still public"; the cause of a departure is not in the field, and P1 and P2 never needed it

**The question as asked** (`FABLE_QUEUE.md:48`): "does the Data API read answer P1/P2 as written (public, not
auto-privated, the designation)".

**Facts read.**
- P1 as written: "The upload returns public, not private | the publisher's API response and the video's public URL"
  (`T1-PROTOCOL.md:77`, before its 4.10 flag). P2: "It is still public 72 hours later | the public URL, fetched from a runner
  at +72 h" (`:78`). P3: "the brand mailbox (the manager account's)" (`:79`). P4: "No auto-privating and no forced sign-out
  within 72 h | channel state via the publisher; the manager account" (`:80`). "T1 **fails** on any of P1-P4" (`:83`); every
  reading is "recorded with timestamps" (`:72-73`). Repo.
- Their origin: RED-TEAM §2.7 names the observables and nothing else — "video public, not locked, no "locked as private"
  email …, no auto-private/sign-out event … within 72 h. Define pass by those alone." (`RED-TEAM.md:187-189`, repo). The
  instrument "the public URL, fetched from a runner" is the 27.9 protocol's wording, not the red team's binding amendment.
  [inference from the two texts]
- The upload is sent `privacyStatus = public` with no `youtube_publish_at`, because a scheduled video "stays private until
  its time, which is indistinguishable from a lock" (`T1-PROTOCOL.md:59-64`, repo).
- What the read-back reads: one host, `READ_HOST = "www.googleapis.com"` (`youtube-madeforkids.ts:31-33`); `part:
  "id,status"` with the ids and the key (`:89-96`); per video `id`, `madeForKids`, `privacyStatus`, `readAt` (`:45-53`); a
  video not returned, or whose status has no boolean `madeForKids`, reads null, "never as false" (`:99-101`);
  `privacyStatus` is null whenever the status has no string value (`:113`); an error body throws (`:105-107`), as does a body
  with no `items` (`:108`). Per upload it keeps `first` (the first read carrying a designation), `latest`, `contradictedAt`
  and `leftPublicAt`, the last "When a read first found the upload not public (private, unlisted, or not returned) right
  after a read found it public" (`:55-69`, `:139-145`), never cleared. Repo.
- The read-back's own grades (`:21-28`): rendered, `[against-bar]`, that `madeForKids` "enables any user to retrieve" a
  video's made-for-kids status and that the guide's steps are `videos.list` with "at minimum, the id and status parts";
  inference until the first live read: the endpoint URL, the envelope, that a key without OAuth returns the field for a
  public video, the 50-id ceiling. `ASSESSMENT.md:428-430` grades the keyed read the same way. Repo.
- The live captures, in words (rendered, `[against-bar]` by inference; `grep -c -F` run here): `youtube-api-videos-insert.txt`
  names `status.privacyStatus`, `status.publishAt` and `status.selfDeclaredMadeForKids` once each, and `status.madeForKids`
  and `status.uploadStatus` not at all; `youtube-api-revision-history.txt` has one line saying the `madeForKids` property
  enables any user to retrieve the status; `yk2-dev-made-for-kids-status.txt` names the "videos.list endpoint" on three
  lines, "the id and status parts" on one and `status.madeForKids` on two. The five metas carry `fetchedAt` 28.9 23:21Z
  (the guide) and 29.9 11:26-11:27Z (the four API pages), before the 29.9 14:01:49Z bar (`52dafb4`); none has a `trimmed`
  block (0 matches each).
- The read-back keeps no cause: "private" is a state, not an actor. No file reads a rejection reason, a failure reason or a
  lock notice from the API (Part C 9, repo). The protocol already treats a private state inside the window as a fail
  whatever caused it: the no-`publishAt` rule exists because a scheduled private and a locked private cannot be told apart
  (`T1-PROTOCOL.md:63-64`, repo).
- The designation is not P1's or P2's question: it is §6 rule 2's own read — "After each upload a reader fetches
  `status.madeForKids` … `true` is the only passing reading" on the kids line, `false` expected on T1's
  (`KIDS-RULING:279-284`) — already in code as `ExperimentReadings.madeForKidsReadback` (`experiments.ts:41-62`) and gating
  the kids line's first upload (`publisher-guard.ts:172-183`: T1's first upload must have `t1Passed === true` and read back
  `"false"`). Repo.
- The publisher's half of P1: Upload-Post's quoted response is
  `{"success":true,"results":{"youtube":{"success":true,…,"status":"completed"}}}` (`T1-PRECHECK.md:50`, github via note),
  elided; it "carries no audience field" (`experiments.ts:55-56`); whether it carries `privacyStatus` is in no file (Part C
  10, none). Its uploads honoured the requested visibility on the free tier in one dated third-party test
  (`T1-PROTOCOL.md:20-22`, repo; `T1-PRECHECK.md:45-55`, github via note).
- ASSESSMENT closed the watch page as a route before this row: "**Not a route:** reading the public watch page, which is
  automated access to the Service (ToS:120, §5 item 2)." (`ASSESSMENT.md:433`, repo).

**Options weighed.**
1. *Keep the watch page for P1's second half and P2.* A youtube.com fetch from a runner, barred since 29.9
   (`render-watch.mjs:535`; `terms-verdicts.json:852-857`), and "not a route" by ASSESSMENT. Rejected on the loop's Never
   (`CHANNEL_LOOP.md:79`).
2. *The publisher's response alone for P1, and the publisher's analytics for P2.* The response carries success and an id,
   not a visibility field at any grade; the analytics are lifetime views (`T1-PROTOCOL.md:22-23`), which do not say public.
   Rejected: P1 and P2 would be unmeasured, which is a fail under MISSION rule 5.
3. *`videos.list` `part=id,status` on the Stage A key for both: P1's API half at the first read after the publisher's
   response, P2 at ≥ 72 h.* The field is the one the upload set; the read is the one §6 rule 2 already makes after every
   upload; the host is not barred (`termsBarred("www.googleapis.com")` is null, `youtube-madeforkids.test.ts:49-52`).
   Chosen, with the limits in the ruling.
4. *Add a cause read so P1 can say "auto-privated".* No API field for it is on file at any grade; the window's fail rule never
   needed the cause (RED-TEAM §2.7; the no-`publishAt` rule). Rejected as unneeded; P4 and P3 carry the cause where the
   publisher or a mailbox notice gives one.

**RULING.**
1. **P1 as written is answered by two readings, and the second is the Data API's.** P1 = (the publisher's response says
   success for YouTube and returns the video's id) AND (the first `videos.list` read of that id on the Stage A key finds
   `status.privacyStatus` = `public`). The first read follows the publisher's response in the same colony run that
   recorded it. A first read that is not `public` — `private`, `unlisted`, or null because the video was not returned —
   fails P1 whatever the cause, exactly as a scheduled private would have. "The video's public URL" is struck as an
   instrument.
2. **P2 as written is answered by the same field at ≥ 72 h.** P2 = `stayedPublic(entry, 72) === true` over the reads the
   read-back keeps for that upload (decision 4 of §4 says what that means); any departure from `public` inside the window
   fails it on the fact, whatever caused it. "The public URL, fetched from a runner at +72 h" is struck.
3. **"Not auto-privated" is not a separate reading.** The field carries the state and no actor; P1 and P2 fail on the state.
   The cause, where one is given, is P4's (the publisher's channel and connection state) or P3's (a "locked as private"
   mail). Nothing is built to read a cause from the API.
4. **The designation is not part of P1 or P2.** It stays §6 rule 2's read, `madeForKidsReadback`, taken by the same call; its
   grade (rendered that any user may retrieve it; inference that a key without OAuth returns it for a public video) is
   unchanged and is settled by the first live read ("Not ruled here" 4, `KIDS-RULING:546-548`). T1 cannot pass into the kids
   line's start without both P1-P4 and a `"false"` read-back (`publisher-guard.ts:180-182`), so coupling the two readings in
   one call loses nothing.

**What this does not decide.** Whether Upload-Post's response carries `privacyStatus` (grade none; P1's publisher half reads
success and the id only, and nothing more is assumed). Whether the keyed read returns `privacyStatus` and `madeForKids` for a
public video: inference until the first live read, as every file grades it. Who writes
`state/colony/measurements/youtube-videos.json`, the ids the read-back reads (`youtube-madeforkids-readback.ts:11-12`): no
publisher exists (`experiments.ts:110-112`); the build that uploads writes the id, and decision 1 binds it to do so in the
same run.

## 2. (b) Is a keyed Data API call a fetch of a barred site under 16(d)? No — and it is still not allowed until the API's own terms are read at github grade

**The question as asked** (`FABLE_QUEUE.md:48`): "is the API a fetch of a barred site under 16(d) (the terms gate reads
pages; the API has its own terms, unread: a GitHub-hosted copy of the YouTube API Services Terms is the premise to read
first)".

**Facts read.**
- The bar: `youtube.com` is in `TERMS_BARRED` because "YouTube's terms bar accessing the Service "using any automated
  means (such as robots, botnets or scrapers)" except search engines or with written permission" (`render-watch.mjs:535`,
  citing `scouts/discovery.md:209-211`, github via note of the OTA ToS copy); `google.com` because "YouTube's terms bar the
  YouTube Help pages outright … but the Help pages' bar stands" (`:537`). "A host on this list gets no request of any kind
  — not its pages, and not its robots.txt either" (`:517-518`). `termsBarred()` (`:578-583`) matches a listed domain or any
  subdomain. Repo.
- Hosts: the brief's checker ran `termsBarred()` and got `null` for `www.googleapis.com`, `youtubeanalytics.googleapis.com`
  and `oauth2.googleapis.com`, `google.com` for `developers.google.com` and `accounts.google.com`, `youtube.com` for
  `www.youtube.com` (`BRIEF:51-58`, repo); the read-back test asserts the first (`youtube-madeforkids.test.ts:49-52`). No
  verdict entry exists for any googleapis host (`grep -c -i googleapis research/channel-loop/terms-verdicts.json` = 0, run
  here). Repo.
- 16(d) D2(ii) on Gumroad: "**The API, `api.gumroad.com`, stays outside the bar**: it is the interface Gumroad provides to
  sellers, not "a web page contained in the Services"" (`VIDEO-RULING:75-77`). D2(iv): "**Unread or silent terms: no fetch.**
  … Silence is not allowance" (`:83-84`). D2(iii): one fetch for terms, "Never for a site already `BARRED`." (`:79-82`). D3:
  a clause naming automated means "for **any access** to the site or to accounts bars both, until a written yes"; Wix's
  "publicly supported interfaces" are not barred; "a provided interface is not "other means"" (`:113-116`, `:123-126`,
  `:135-136`). `VIDEO-RULING` names no googleapis host and no "Data API" (grep, 0, run here; the brief's A(b) found the
  same). Repo.
- The gate reads lines, not calls: "A line may be queued, and stay active, only when its site's terms were read and allow a
  runner (NOT_BARRED or CONDITIONAL_MET)" (`queue-zero-test.mjs:75-77`); a barred host always fails (`:240-241`);
  `ACTIVE_VERDICTS` is `NOT_BARRED`, `CONDITIONAL_MET`, `NO_TERMS_ROBOTS_OK` (`:110`). `render-watch.mjs` says of itself
  "The Gumroad API is not a web page and is not fetched by this script" (`:514-515`) and "The Pexels API is not fetched by
  this script" (`:555`). Repo.
- The API's terms are unread: no file under `research/channel-loop/terms/` is YouTube's or Google's (nine files — PostHog,
  Apify, GitHub, Codabench, OpenReview, ansperformance; listed here); no capture, no `urls.txt` line, no note quotes a
  clause of the YouTube API Services Terms of Service (Part C 1, repo). The discovery scout downloaded Open Terms Archive's
  `YouTube/Developer Terms.md` from `OpenTermsArchive/vlopses-us-versions` and wrote "This file bundles the YouTube API
  Services Terms and the Developer Policies" (`discovery.md:10-15`, github via note); the upload scout's copy of the same
  filename in OTA `pga-versions` is "copy of https://developers.google.com/youtube/terms/developer-policies"
  (`upload-automation.md:475`, github via note). The two scouts disagree on what the bundle holds. [inference: one GitHub
  read settles it]
- What the Developer Policies say, from the live capture `youtube-developer-policies.txt` (rendered, `[against-bar]` by
  inference; 800 lines; `grep -c -F` run here): "API Services Terms" on 7 lines; "api key" (any case) on 0;
  "Non-Authorized Data" on 3; "30 calendar days" on 3; "robots.txt" on 1; "90 consecutive days" on 1; "component of the
  Agreement" on 1; the path `api-services-terms-of-service` on 2; "unauthorized" on 2 (both data-protection duties,
  `BRIEF` A(b)). In words: it defines Non-Authorized Data as API Data an API Client can reach without user credentials; it
  lets a client store limited amounts of it "for as long as is necessary for the purposes of the API Client but not longer
  than 30 calendar days", after which the client deletes or refreshes it, with "statistics" as the example; it binds "You
  and your API Clients" not to scrape YouTube or Google Applications, public search engines excepted under robots.txt; it
  ties a quota extension to an API Compliance Audit, the audit's only role in the text; it does not mention API keys. The
  same duties at github-via-note grade: III.E.6 scraping (`discovery.md:212-214`), III.E.4.b's 30-day limit on statistics
  (`:228-229`), credentials never "embed[ded] … in open source projects" (`upload-automation.md:256-259`), "exactly one API
  project per API client" (`:262-263`); and at rendered-via-note grade a possible identity request at the Developers
  Console and a ban that follows the person (`REGRADE.md:77-78`).
- The YouTube ToS's "Service" is "the YouTube platform and the products, services and features we make available to you
  as part of the platform" (`TERMS-AUDIT:119`, quoting "live OTA line 63", github via note); the audit held that the
  Policies' scraping bar "binds only an API developer, and the project has ruled out its own API project
  (research/faceless-youtube/VERDICT.md:227 …)" and breaks off at "If it ever" (`:119`). `VERDICT.md:227-228`: "**Not owner
  steps, by decision:** own Google Cloud project + API audit (needs per-item/batch confirmation and audit correspondence →
  mandate violation …)". Since 4.10 a Data API key "created in the same analytics-only Cloud project on the brand account,
  about a minute" is a Stage A line (`T1-PROTOCOL.md:116-120`; `KIDS-RULING:508-511`), so the audit's premise has moved.
  Repo.
- Quota: the live `youtube-api-quota-cost.txt` (rendered, `[against-bar]` by inference) has one sentence naming "10,000
  units per day combined for all other endpoints" (1 match) and a method-table entry reading `videos` / `list` / `1`; the
  sentence is quoted at `upload-automation.md:74-76` (rendered via note) and upheld at `DIGEST.md:217` (repo). The
  read-back makes `ceil(ids / 50)` calls per run (`youtube-madeforkids-readback.ts:98-100`) and never retries: a non-200 or
  a parse error returns 1 with nothing written (`:111-119`). The colony workflow runs hourly (`.github/workflows/colony.yml:23`,
  `cron: "17 * * * *"`). Repo.
- No live call has been made and none can be: "No workflow runs this script and no package script names it"
  (`youtube-madeforkids-readback.ts:21-23`), asserted (`youtube-madeforkids.test.ts:377-383`); a grep of
  `.github/workflows` and `package.json` for `madeforkids|youtube-analytics|googleapis` is empty (run here);
  `state/colony/measurements/` holds only `algora-supply.json` (listed here). The script follows redirects by default
  (`:103`: `fetchImpl(url, { signal })`, no `redirect` option; `FetchLike` at `:60`). Repo.
- Money: no file gives the key or the Cloud project a money cost (Part C 7, none); "Nothing is bought." (`MISSION.md:354`).

**Options weighed.**
1. *The API call is a fetch of youtube.com, so 16(d) bars it until a written yes.* The host is `www.googleapis.com`, which
   `termsBarred()` does not match (code), and the call goes to the interface Google provides to API clients under a
   separate agreement, not to "the Service" whose pages the ToS protects (D2(ii)'s Gumroad reasoning; D3's "provided
   interface"). Rejected.
2. *The API call is outside 16(d) altogether — a provided interface, usable now.* Its terms are unread, and D2(iv) and
   `CHANNEL_LOOP.md:79` refuse a fetch of a site whose terms are unread; "silence is not allowance". Gumroad's API was
   allowed with its terms on file and read (D1(3), D2(ii)). Rejected.
3. *Read the terms at github grade first, write a verdict entry, then allow the call on the Stage A key under stated
   conditions.* The only permitted route to the text is a GitHub-hosted copy: developers.google.com is under `google.com`,
   barred, and D2(iii) forbids a terms fetch of a `BARRED` site. The same read settles what the Policies ask of a keyed,
   user-less client. Chosen.
4. *The colony makes its own Google Cloud project and key.* Not available: the colony holds no Google account and may open
   none (`MISSION.md:437-439`); the project is the owner's Stage A click. Rejected on standing rules; the key is Stage A's
   or nothing.

**RULING.**
1. **A keyed `videos.list` call to `www.googleapis.com` is not a fetch of a barred site under 16(d).** `TERMS_BARRED` bars
   youtube.com, blog.youtube and google.com and their subdomains; googleapis.com is none of them (`termsBarred()`,
   `render-watch.mjs:578-583`; the test at `youtube-madeforkids.test.ts:49-52` stays). D2(ii) and D3 apply by their reasoning:
   the Data API is the interface Google provides to API clients, under its own agreement, not "the Service" whose pages
   the ToS protects. Nothing here re-opens youtube.com, support.google.com or developers.google.com: those stay barred and
   their captures stay D1(1).
2. **It is a fetch of a site whose terms are unread, so no live call is made until they are read — at github grade, never by
   a fetch of developers.google.com.** An Opus reader with an adversarial Opus verifier (the PostHog note's method) reads
   the Open Terms Archive copy of YouTube's API Services Terms of Service and Developer Policies on GitHub — first
   `OpenTermsArchive/vlopses-us-versions` `YouTube/Developer Terms.md`, and if that holds the Policies only, the OTA file
   that holds the Terms of Service (the Policies name it by the path `api-services-terms-of-service`) — pinned by commit
   and sha256, excerpted as exact original line ranges into `research/channel-loop/terms/youtube-api-services-terms-<date>.md`
   on the form of `posthog-terms-2026-10-04.md`, and writes a `terms-verdicts.json` entry for `googleapis.com` (verdict,
   source, checked, `copying`). The verdict is `NOT_BARRED` or `CONDITIONAL_MET` only if the Terms allow a keyed read of a
   video's status by its own uploader's project with no condition the colony does not meet; otherwise `CONDITIONAL_UNMET`
   with the clause, and the main thread re-briefs Stage A's key line before Stage A is asked. The reader answers, each
   with the clause and its line: (i) whether an API Client that has no users and reads only its own channel's video status
   owes the user-facing duties (a ToS link, a privacy policy, the identity the Console may ask for); (ii) what "exactly one
   API project per API client" means for one Cloud project holding both the analytics consent and the Data API key; (iii)
   whether a status read of the client's own upload without user credentials is Non-Authorized Data under the 30-day
   retention rule, and if so what the state file may keep past 30 days (the colony's own timestamps and verdicts, or the
   raw field values refreshed on every run); (iv) whether any clause requires an audit for the default quota (the capture
   says, in words, that the audit is the route to an extension); (v) whether a suspension clause reaches the brand
   account's other uses; (vi) whether the Terms bar anything the read-back does today. Grade: github. Until the entry
   exists the read-back script refuses to run — not only without the key (`:73-77`) but also when `terms-verdicts.json` has
   no `googleapis.com` entry whose verdict is active-eligible (fail closed, as `brand-check.mjs:70-74` reads the same file for
   youtube.com) — and no workflow names it (the assertion at `:377-383` stays until the entry exists and a fold wires the
   run).
3. **Conditions of every live call, once allowed.** (i) **The key is Stage A's only:** `YOUTUBE_DATA_API_KEY`, created by
   the owner in the analytics-only Cloud project on the dedicated brand Google account (`T1-PROTOCOL.md:93-99`,
   `:116-120`), never on the owner's personal account, never a key or project the colony makes, held as a GitHub secret,
   "never hard-coded, never committed, never printed" (`youtube-madeforkids-readback.ts:7-10`). (ii) **Quota is bounded in
   code:** one run per colony workflow run at most (hourly, `colony.yml:23`), `ceil(ids / 50)` calls of 1 unit each, no retry
   on a refusal — under 24 units a day for up to 50 uploads against a default of 10,000; a `403` or `429` is logged with
   nothing written and the run ends, as today (`:111-119`). (iii) **No page fetch, no redirect:** `READ_HOST` stays the only
   host (`:101`), and the fetch is made with `redirect: "error"` so a redirect to any other host is refused and logged,
   never followed. (iv) **The Developer Policies bind the colony as an API Client from the day the key exists:** no scraping
   of YouTube or Google Applications (already the case under `TERMS_BARRED`; the pre-bar captures on disk are D1(1) and are
   never re-fetched), credentials never in the repository, and the retention rule as the reader settles it under decision
   2(iii). (v) **Not an upload project:** the key reads; uploads go through the audited publisher (`T1-PROTOCOL.md:8-14`),
   unchanged. (vi) **No cost:** if the Console asks for billing, a card or an identity document for the key, Stage A stops at
   that line and tells us, as `:97-99` already says for the account; nothing is paid.
4. **The loop's Never gains the explicit clause**, so the gate is text and code, not memory: beside `CHANNEL_LOOP.md:79`,
   "a keyed API call to a host whose API terms are unread (ruling 7.10 row 24 (b))".

**What this does not decide.** The content of the API Services Terms of Service — every answer under decision 2 is the
reader's, at github grade; this ruling fixes the questions and the fail-closed default. Whether the compliance audit, the
per-client project rule or an identity request at the Console changes Stage A's cost in owner minutes: re-briefed only if
the read says so. The analytics reader's own OAuth route (`scripts/youtube-analytics.ts`; `oauth2.googleapis.com`, and the
discovery document on `accounts.google.com`, which is under `google.com` — `:35`; `BRIEF:363`): the same `googleapis.com`
entry covers its API host, but a document on a barred host is not this row's; the main thread queues it with the terms
read. The `copying` field of youtube.com and google.com (Part C, "Not for this sitting").

## 3. (c) What T1-PROTOCOL's rows should say — the replacement text

**The question as asked** (`FABLE_QUEUE.md:48`): "what T1-PROTOCOL's rows should say". The kids ruling gave no wording
(Part C 14); its fold 7 and "Not ruled here" 11 name "P2/P4" from a quote that matches P2 only (`KIDS-RULING:382-383`,
`:512-513`, `:564-565`); `KIDS-LINE.md:311-314` corrected the attribution to P1 and P2 and flagged P4's note. The rows moved
to `:77`, `:78`, `:80` at `dc2b45d` (`BRIEF:167-171`, confirmed at HEAD).

**Facts read.** The current rows (`T1-PROTOCOL.md:77`, `:78`, `:80`) are quoted verbatim in the ruling below. P3 (`:79`) and
P5 (`:81`) are unchanged; the table header is `:75-76`, the fail rule `:83-87`, Stage A `:89-133` with the Data API key at
`:116-120` and the kids click-set at `:121-130`, Recording `:134-137`. Repo. On P4's "the manager account": a runner signed
in to youtube.com or YouTube Studio is automated access to the Service (the clause at `render-watch.mjs:535`) and a
runner-operated portal without the venue's written yes (`CHANNEL_LOOP.md:81-86`), so that instrument cannot be a runner's;
the manager account's *mailbox* is P3's instrument and is read once step 8 exists (`CHANNEL_LOOP.md:88`). [inference from
the three texts] The kids ruling's remedy rule already says "never a Studio session" (`KIDS-RULING:283`). The pre-check
read no publisher endpoint that reports the YouTube connection's state (grade none).

**Options weighed.** (1) *Keep the flags and add a line under the table:* two rows would keep saying the opposite of the
ruling, with a pointer (`render-watch.mjs:426`) already stale. Rejected. (2) *Rewrite the three rows; keep every other row
and the fail rule byte for byte; add one sentence each to the Data API key bullet and to Recording; let P4 name only
instruments a runner may use.* Chosen.

**RULING.** Apply by exact find/replace on the full line; each current line is one table row and becomes one table row
(three cells, as now).

(1) **P1.** Current line (`T1-PROTOCOL.md:77`):

```
| P1 | The upload returns public, not private | the publisher's API response and the video's public URL [flag, 4.10.2026: reading the video's public URL is a watch-page fetch, and youtube.com is barred (`TERMS_BARRED`, `scripts/render-watch.mjs:426`), so that half of the read must move off the watch page; the 4.10 kids ruling suggests the same Data API call as P2 (`videos.list`, `part=status`, `privacyStatus`), for T1's own row to confirm. The ruling names P2 and P4 as the watch-page reads (fold 7; "Not ruled here" 11), but the second one is this row, not P4. Not ruled: T1's own protocol, row 16's domain] |
```

New line:

```
| P1 | The upload returns public, not private | the publisher's API response (success for YouTube, with the video id it returns) **and** the first Data API read of that id on the Stage A key — `videos.list`, `part=id,status`, `scripts/youtube-madeforkids-readback.ts` — finding `status.privacyStatus` = `public`; the read follows the response in the same colony run. A first read that is not `public` (private, unlisted, not returned) fails P1 whatever the cause, as a scheduled private would. Never the video's public URL: youtube.com is barred (`TERMS_BARRED`, `scripts/render-watch.mjs:535`). Ruled 7.10.2026, `research/channel-loop/RULING-2026-10-07-t1-watch-reads-and-kids-subbrand.md` (a), (c) |
```

(2) **P2.** Current line (`T1-PROTOCOL.md:78`):

```
| P2 | It is still public 72 hours later | the public URL, fetched from a runner at +72 h [flag, 4.10.2026: youtube.com is barred (`TERMS_BARRED`, `scripts/render-watch.mjs:426`), so this read must move off the watch page; the 4.10 kids ruling suggests the same Data API call as the made-for-kids read-back (`videos.list`, `part=status`, `privacyStatus`, on the Stage A API key below), for T1's own row to confirm; flagged by `research/channel-loop/RULING-2026-10-04-kids-youtube.md` (fold 7; "Not ruled here" 11), not ruled: T1's own protocol, row 16's domain] |
```

New line:

```
| P2 | It is still public 72 hours later | the Data API, through the reads the read-back keeps for the upload: `stayedPublic(entry, 72)` in `src/revenue/youtube-madeforkids.ts` — `true` once a read at least 72 h after the first designation read found it still `public` with no departure between; `false` on any departure from `public` (private, unlisted or not returned), whatever the cause; `null` while unread. Reads are taken every colony run, so the clock is as good as their spacing and never earlier than +72 h. Never the public URL fetched from a runner (youtube.com is barred). Ruled 7.10.2026, the same ruling (a), (c), (d) |
```

(3) **P4.** Current line (`T1-PROTOCOL.md:80`):

```
| P4 | No auto-privating and no forced sign-out within 72 h | channel state via the publisher; the manager account [note, 4.10.2026: the 4.10 kids ruling (fold 7; "Not ruled here" 11) names this row among the watch-page reads, but it reads no watch page (channel state comes through the publisher and the manager account), so it carries no flag; the second watch-page read is P1's, flagged there. If an auto-privating read is ever added here, it uses P2's Data API call (`privacyStatus`), never the watch page (youtube.com is barred)] |
```

New line:

```
| P4 | No auto-privating and no forced sign-out within 72 h | the publisher's API, as far as it reports the channel connection's state and the upload's status (no such endpoint was read: grade none until the publisher build reads one), and the brand mailbox's notices (P3's instrument). A departure from `public` inside 72 h already fails P2 on the fact (`privacyStatus`); P4 records the cause when the publisher or a notice gives one. No runner signs in to youtube.com or YouTube Studio (automated access to the Service is barred, `TERMS_BARRED`; `logs/CHANNEL_LOOP.md:81-86`) and no owner click is asked. Ruled 7.10.2026, the same ruling (c) |
```

(4) **The Data API key bullet** (`:116-120`) gains, after "(`ASSESSMENT.md:423-426`).": "P1's API half and P2 run on the same
key and the same call (ruled 7.10.2026, the same ruling (a)-(d)); the first live call waits on the API's terms read at
github grade and a `googleapis.com` entry in `research/channel-loop/terms-verdicts.json` (ruling (b))."

(5) **Recording** (`:136-137`): after "with its timestamp and source," add: "`t1Passed` is `firstUploadWindow(...).passed`
(`src/revenue/youtube-madeforkids.ts`, ruled 7.10.2026): P1's API half and P2 from the read-back state, P1's publisher half
from the publisher's response, P3 and P4 from the mailbox and the publisher, each recorded with its `readAt`;".

(6) **The kids click-set** (`:124`): "under the kids sub-brand (never `chartsplained`, never `mehudak`; the YouTube handle is
tried here, and if it is taken the next name in list order is used)" becomes "under the kids sub-brand `worldincharts`
(ruled 7.10.2026, the same ruling (e); the owner may veto; never `chartsplained`, never `mehudak`; the YouTube handle
`@worldincharts` is tried here, and if it is taken the next name in list order that is free on all three probes is used —
today `askthechart`)".

**What this does not decide.** The publisher's endpoint for P4 (grade none; the publisher build reads it, or P4 says it
has none). Whether `docs/VIDEO_PUBLISHING_CHECKLIST.md:18`'s "or a manual upload by whoever is signed in to the brand Google
account" survives the mandate's per-item rule: not this row; the main thread may queue it. The P3 mailbox reader: step
8's (`CHANNEL_LOOP.md:88`).

## 4. (d) `stayedPublic()` as the K-T1k read, and what `experiments.ts` records

**The question as asked** (`FABLE_QUEUE.md:48`): "Also `stayedPublic()` (72 hours later) as the K-T1k read."

**Facts read.**
- The function (`youtube-madeforkids.ts:165-175`): doc "Whether an upload stayed public for `hours` (K-T1k, and T1's P2
  "still public 72 hours later", read through the API, never the watch page): true once its first designation read and
  its latest read, at least `hours` apart, both found it public and no read since a public one found it otherwise; false
  once one did …; null while that is not yet known. Reads are periodic, so the answer is as good as their spacing." Code:
  `leftPublicAt !== null` → false (`:172`); `first` or `latest` not `public` → null (`:173`); span ≥ hours → true, else
  null (`:174`). `first` is the first read carrying a `madeForKids` boolean (`:58`, `:141`); `leftPublicAt` does not depend
  on `first` (`:144`), so with no designation read the function returns false or null, never true (the brief's A(d),
  confirmed). Repo.
- K-T1k as ruled: "the kids channel's own first-upload window, P1-P4 as T1's … but read through the publisher's response
  and the Data API (`videos.list part=status`, `privacyStatus`), never a fetch of the watch page (youtube.com is barred) —
  fails → kill" (`KIDS-RULING:401-403`); in code `experiments.ts:164-165`, `:246`; `firstUploadKill: "K-T1k"` (`:179`);
  `t1Passed === false` pushes the kill (`:242-249`). The kids kills test pins `{ id, declaresMadeForKids, firstUploadKill,
  gates }` (`kids-explainers-kills.test.ts:60-73`) and asserts the K-T1k note says "never a fetch of the watch page" (`:178`);
  T1's pin covers `gates` only (`experiments.test.ts:129-135`). Repo.
- `t1Passed: boolean | null` — "one honest test video through the audited publisher stayed public for 72 h … null = not run
  yet" (`experiments.ts:23-28`); no code produces it (the brief's A(c); `grep -rn stayedPublic src/ scripts/` run here finds
  only the definition outside the test). The publisher guard reads it for the kids line's start (`publisher-guard.ts:180`).
  Repo.
- The tests (`youtube-madeforkids.test.ts:190-209`): null before 72 h, true at 72 h, false after a departure (never
  cleared), false when not returned, null when never public. No test pairs a null designation with a `public` read: the
  fixtures with a null designation have null `privacyStatus` (`:119`, `:170`, `:205`) or `private` (`:80`). Repo.
- The uploads file carries `publishedAt` for the analytics reader (`scripts/youtube-analytics.ts:8`), and `stayedPublic()`
  never sees it (`:171`). The read after each upload is a precondition of uploading (`KIDS-RULING:451-453`, §10 rule 1); a
  due null freezes and escalates (`:454-456`); it kills at K0 (`:457-459`). Repo.

**Options weighed.**
1. *Anchor the 72 h on `publishedAt`.* Needs the publisher build to write it and a second clock source; the API read taken
   in the same run as the publisher's response is at most one run late, so the first-read anchor is later than publish,
   never earlier — a conservative proxy. Rejected as unneeded.
2. *Decouple P2 from the designation (a `firstPublicAt` field so a read with no `madeForKids` still starts the clock).* An
   upload whose designation is unread is already an instrument fault that freezes the next upload (§10 rule 2), and T1
   cannot pass into the kids line without a `"false"` read-back (`publisher-guard.ts:181-182`); a P2 that could say true
   while the designation stays unread would let the window pass on a half-working instrument. Rejected; the coupling is a
   feature, and the missing fixture is added to say so.
3. *Keep `stayedPublic()` as the K-T1k and P2 read; add a pure `firstUploadWindow()` that derives P1's API half and P2 from
   the state and takes P1's publisher half, P3 and P4 as caller-supplied readings; `t1Passed` becomes its `passed`.* Pure,
   fixture-tested, re-derivable by an auditor from the same state; no interface or pin changes. Chosen.

**RULING.**
1. **`stayedPublic(entry, 72)` is the K-T1k read and T1's P2 read**, as its doc says, with the anchor confirmed: the clock
   starts at the first read that carried a designation, which the read-back takes in the same colony run as the
   publisher's response (§1 decision 1); 72 h is counted from that read, so P2 is never judged early and at worst one run
   late. Its three answers map as: `true` → P2 passes; `false` → P2 fails (any departure, never cleared); `null` → unread
   (P2 undecided; past the window it is an instrument fault under KILL-1 — fixed and read, never a pass).
2. **A read with no designation does not start the clock, by design.** The test gains the missing fixture: a `public` read
   whose `madeForKids` is null, followed by `public` reads 72 h on, gives `null`, never `true`; a departure after it still
   gives `false`. The doc at `:165-170` says so in one sentence.
3. **`experiments.ts` records `t1Passed` as the output of one pure function, not a typed-in boolean.**
   `firstUploadWindow(entry, publisherAccepted, p3, p4, hours = 72)` in `src/revenue/youtube-madeforkids.ts`, beside
   `stayedPublic()`: `entry` is the read-back's `UploadReadback` for the line's first upload, or null; `publisherAccepted`
   is P1's publisher half (true: the response said success for YouTube and returned the id; false: it did not; null: no
   response recorded); `p3` and `p4` are the protocol's readings (true, false, or null while unread). It returns
   `{ p1, p2, p3, p4, passed }`: `p1` = false if `publisherAccepted === false`, or if `entry.first` is a designation read
   whose `privacyStatus` is not `"public"`; true if `publisherAccepted === true` and `entry.first.privacyStatus === "public"`;
   else null. `p2` = `stayedPublic(entry, hours)` (null when `entry` is null). `passed` = false if any of the four is false;
   true if all four are true; else null. `ExperimentReadings.t1Passed` is that `passed`, and its doc comment
   (`experiments.ts:23-28`) says so; the readings interface, both pins and the K-T1k note (`:246`, asserted at
   `kids-explainers-kills.test.ts:178`) are untouched. The four readings and their `readAt` are recorded beside `t1Passed`
   in the experiment's state when the publisher build writes it (`T1-PROTOCOL.md` Recording, §3 decision (5)), so an
   auditor re-derives the verdict from the same numbers (MISSION rule 3).
4. **Cadence.** Once §2 decision 2 allows a live call, the read-back runs once per colony workflow run (hourly) for both
   YouTube lines; the 72 h anchor and the "as good as their spacing" sentence then mean "to the hour".

**What this does not decide.** The publisher build, which is what will call `firstUploadWindow()` and write the readings;
the shape of the state file past 30 days (§2 decision 2(iii)); whether K-T1k's window should differ from T1's in hours (it
does not: "P1-P4 as T1's").

## 5. (e) The kids sub-brand: `worldincharts`

**The question as asked** (`FABLE_QUEUE.md:48`): "Pick the kids sub-brand from
`research/measurements/kids-subbrand-candidates.json` (the 4.10 probe: 2 of 5 free on .com and GitHub, YouTube not probed
while barred, first all-free `worldincharts`; §7 rule 4 criteria; the owner's veto stands as for T1)."

**Facts read.**
- The measurement (repo; a runner's status codes): `measuredAt` 2026-10-04T09:28:53.632Z; probes `com`, `github`,
  `netlify`; YouTube refused by name (`kids-subbrand-candidates.json:2-11`); `allFree` `worldincharts`, `askthechart`;
  `firstAllFree` `worldincharts`; `unknown` empty (`:13-18`). `chartfacts`, `graphfacts` and `chartcorner` are taken on
  .com (200) and free on GitHub and Netlify (`:56-109`; `kids-subbrand-check.md:9-16`). The row's "2 of 5 free on .com and
  GitHub" is short: all five are free on GitHub; two are free on all three probes (`218ffca`'s subject; `BRIEF:431-433`).
  "This file is a measurement, not a choice: the fold records the name, and the owner may veto it."
  (`kids-subbrand-check.md:19-20`). The Netlify reading is grade none until a fold reads it (`:18-19`).
- The rule in the list's header: "The FIRST name free on all three is the kids sub-brand. At Stage A the owner tries its
  YouTube handle inside the one sitting; if the handle is taken, the next name in list order that is free on all three is
  used. If none of the five is free, the loop writes the next five by the same criteria and re-runs; no owner action at any
  point." (`kids-subbrand-candidates.txt:8-10`). The criteria (`:11-15`): "short topic words a child can read, plain English,
  usable as a YouTube handle and a .com; sayable, spelled one obvious way, no owner name, no claim the colony cannot back;
  no "kids" or "children" in the name, and none of §2 rule 2's words (no song, rhyme, story or poem; no character, mascot,
  puppet, toy or unboxing; no "learn colours", "ABC", "numbers", preschool or toddler framing)". Never `chartsplained`,
  never the brand's own name (`:3-4`). The names in order: `worldincharts`, `askthechart`, `chartfacts`, `graphfacts`,
  `chartcorner` (`:16-20`). Repo.
- §7 rule 4 (`KIDS-RULING:350-355`) and `KIDS-LINE.md:175-184` restate the rule and the YouTube refusal; the test pins five
  names (`brand-check.test.ts:251`), bars the brand, the T1 sub-brand and every T1 candidate (`:262-270`) and a word list
  (`:272-275`); the T1 list may grow in rounds of five (`:285-287`). Each of the five names has 0 hits for the banned list
  (`BRIEF:465-466`; confirmed by reading `:273` against the names).
- Who picks: for T1 the rule governed and a fold recorded the name (`LINES-RULING:240-241`, `:273-276`; `29418de`;
  `PREREG-DECISIONS.md:547-549`; `T1-PROTOCOL.md:32-36`), with "The owner may veto by saying so; nothing is asked."
  (`LINES-RULING:276`). For the company brand, "The choice among the survivors is Fable's; the owner may veto."
  (`brand-candidates.txt:3`; `brand-name-check.md:34`). `CHANNEL_LOOP.md:140` says "the pick is a sitting's call, as T1's
  was: FABLE_QUEUE row 24 (e)" — the "as T1's was" is wrong on the record (`BRIEF:468-477`). Repo.
- The audience: "children who can read the declaration" (`KIDS-RULING:149`; `MISSION.md:419-420`); no reading age is on file
  (`KIDS-RULING:128`). §2 rule 2's exclusions (`:129-132`). §6 rule 3: on made-for-kids content "Comments and
  notifications are off by YouTube's rule"; "the channel has no Posts, no memberships, no mailing list" (`:285-287`, repo;
  the YouTube rule itself is `[against-bar]`). The line's shape: "one question answered from one of T1's cleared open
  datasets, charts drawn by code" (`:122-124`). The mandate: the owner does not talk to people (`MISSION.md:12`, `:440`);
  the colony answers no child.
- Why a sub-brand: "a failed experiment does not sit on the brand's search results" (`RED-TEAM.md:112-113`;
  `KIDS-RULING:322-324`). The owner meets the name at Stage A when trying the handle (`T1-PROTOCOL.md:123-125`); owner
  documents carry no sub-brand (`docs/OWNER_STEPS.he.md` and `src/revenue/owner-steps.ts`: 0 hits for
  `worldincharts|sub-brand|kids`, run here); proposed steps stay out of `owner-steps.ts` (`:99-101`). Repo.
- The T1 list's YouTube column, `[D1(1)(ii)]`: in the 30.9 run three of the five names free on .com, GitHub and Netlify had
  their handle taken (`t1-subbrand-check.md:15-24`); the column "stays on disk … as the record of the breach and the reason
  not to re-probe" (`:10-11`). Read here only for that reason: the handle is a real risk, and Stage A is where it is met.
- Not on file: any search for an existing business, channel or mark under either name (Part C 17); YouTube's handle-format
  rules at a permitted grade (Part C 18); a fold location for the kids name (Part C 23).
- A push that changes any `*-candidates.txt` re-runs `brand-check.yml` (`:24-29`, the glob at `:29`; `KIDS-LINE.md:180-181`):
  a runner probe of rdap.verisign.com, api.github.com and `*.netlify.app`, none of which has a terms verdict of its own
  (Part C 22). Repo.

**Options weighed.**
1. *`worldincharts`* (13 letters; "world in charts"). First free on all three probes, so the list's own rule names it. Three
   plain words a child who can read can read and say; the words name what the channel is — the world, in charts — which is
   the line's shape (one question, one open dataset, charts drawn by code) and claims nothing the colony cannot back.
   Spelled one obvious way; no owner name, no "kids", none of §2 rule 2's words; not in the test's banned regex. Chosen.
2. *`askthechart`* (11 letters). Also all-free and readable, and "ask" matches the one-question format. But "ask" is an
   invitation: on a made-for-kids channel comments are off by rule, the channel has no Posts and no mailbox for children,
   and the colony answers nobody (`MISSION.md:12`; §6 rule 3) — a standing invitation nobody can honour is a small claim
   the name cannot back, on a channel for children, where honest value outranks everything. [inference] Kept as next in
   line, not picked.
3. *Any of the three taken on .com.* The rule and the criteria ("usable as … a .com") exclude them, and a name whose .com
   belongs to someone else can send a parent to a stranger. Rejected.
4. *Defer the pick to Stage A.* Nothing is gained: the owner meets the name there either way, and the rule already says what
   happens if the handle is taken. Rejected — the design file, the Stage A text and the loop row need a name now so the
   batched ask is complete when it is made.

**RULING.**
1. **The kids sub-brand is `worldincharts`.** Grounds: the list's rule (first free on all three probes, measured 4.10
   09:28Z); the §7 rule 4 criteria, met on every point above; and that, against `askthechart`, it invites nothing the
   channel cannot give. The YouTube handle to try at Stage A is `@worldincharts`.
2. **Who picks, settled:** the rule picks, and a sitting confirms when asked — as happened for T1 by a fold and here by this
   sitting. `CHANNEL_LOOP.md:140`'s "the pick is a sitting's call, as T1's was" is corrected in the fold: T1's name was
   recorded by the rule (`29418de`), not picked by a sitting.
3. **The owner's veto stands as for T1.** "The owner may veto by saying so; nothing is asked." The owner meets the name
   inside the Stage A ask (`T1-PROTOCOL.md:123-125`), never alone and never as a reminder; no owner-steps entry is made
   (proposed clicks stay out of `owner-steps.ts`, `:99-101`); a veto moves the pick to the next name free on all three,
   `askthechart`, with no re-run.
4. **If the handle is taken at Stage A:** the owner tries `@askthechart` in the same sitting; if that is taken too, the kids
   channel is not created in that sitting and nothing is substituted — it waits as the held click-set
   (`KIDS-RULING:341-346`) while the loop writes round 2 of five names by the same criteria, re-runs the three probes and
   records the next first-free name; the brand-check test's `toHaveLength(5)` (`:251`) then becomes `% 5` as the T1 list's
   (`:287`). No owner re-ask: the second channel is tried again only inside the next batched sitting, if one exists.
5. **One cheap check before Stage A, recorded, no owner action:** a single web search for `worldincharts` at snippet grade
   (a search engine's result page, not a fetch of a barred site; no page is rendered), written as one dated line in
   `KIDS-LINE.md` §7 rule 4. If it finds a live YouTube channel, a business in charts, data or children's education, or a
   registered mark under the name, the pick moves to `askthechart` by the same rule, recorded the same way, nothing asked.
   A name no search finds is not thereby proved free — the Stage A handle try is the real check, as it was for T1.
6. **Where the name goes, and where it does not:** `KIDS-LINE.md` §7 rule 4 (`:175-184`) gains a dated line in
   `PREREG-DECISIONS.md:547-549`'s form; `T1-PROTOCOL.md:124` names it (§3 decision (6)); `CHANNEL_LOOP.md:140` closes its
   parenthesis; `brand-check.test.ts:245-276` pins the measured `firstAllFree` and this ruling. The candidates list and the
   two generated files are **not edited**: a push to `*-candidates.txt` re-runs the probes (`brand-check.yml:29`), and the
   measurement files are the workflow's output, not the record.

**What this does not decide.** Any existing user of either name beyond decision 5's one search (Part C 17). YouTube's
handle-format rules at a permitted grade; the kids list's Netlify probe on a line with no web arm, and the probe hosts'
own verdicts (Part C 20-22) — the probes were set by §7 rule 4 and `LINES-RULING` (e) and are not re-opened here; the main
thread may queue the verdict question. Whether a channel's name or handle can be changed after Stage A, and at what cost
(Part C 25; one snippet, `upload-automation.md:351`). A reading age (Part C 26). Any other use of `t1-subbrand-check.md`'s
YouTube column than the one made here.

---

## Pointers moved since `19d203a`

- `scripts/render-watch.mjs` (132 lines changed): the `TERMS_BARRED` block sits one line higher than the brief says — the
  array opens at `:520` (brief `:521`); youtube.com `:535`, blog.youtube `:536`, google.com `:537` (brief `:536-538`); "no
  request of any kind" `:517-518` (brief `:518-519`); the Gumroad-API sentence `:514-515`; upload-post.com `:552`,
  pexels.com `:555` (brief `:553`, `:556`); `termsBarred()` doc `:577`, function `:578-583` (brief `:578`, `:579-584`). Every
  citation above uses the HEAD lines.
- `scripts/queue-zero-test.mjs` (47 lines changed): the gate sentence "A line may be queued, and stay active, only when …"
  is `:75-77` (brief `:71-75`); the barred-host refusal `:240-241` (brief `:197-198`); the pause comment `:289-290` (brief
  `:236-237`).
- `logs/CHANNEL_LOOP.md` (24 lines changed): `:26`, `:51`, `:74-88`, `:106-111`, `:134-140`, `:243-256` hold; the tick-57 plan
  sentence the brief cites at `:426` is gone — `:426` now holds the tick-28 entry, and the tick-57 plan appears as "Was
  planned for tick 57 (done 6.10 …)" at `:446`.
- `research/channel-loop/RULING-2026-10-06-robots-and-terms.md` (+26 lines): amendment 2 appended at `:468`; `:360-362` and
  `:413-415` hold.
- `research/channel-loop/terms-verdicts.json` (28 lines changed): youtube.com `:852-857`, google.com `:256-261`, github.com
  `:249-255`, upload-post.com `:779`, blog.youtube `:100` hold.
- Unchanged since `19d203a` (absent from `git diff --name-only`): `T1-PROTOCOL.md`, `KIDS-RULING`, `VIDEO-RULING`,
  `KIDS-LINE.md`, the read-back and its script, `experiments.ts`, the kids list and its two files, `brand-check.mjs`, the four
  tests cited, `ASSESSMENT.md`, the scouts, `LINES-RULING`, `BOARD-LOOP.md`. The brief's own corrections (the row's `:74-77`
  → `:77`, `:78`, `:80`; `render-watch.mjs:426` → now `:535`) are confirmed.
- Stale pointers found outside the brief's list, housekeeping only: `research/channel-loop/BOARD-LOOP.md:118` and `:210`
  cite `T1-PROTOCOL.md:71-96` (Stage A is `:89-133`); `research/channel-loop/SITTING-2026-10-01-BRIEF.md:558` cites
  `T1-PROTOCOL.md:78` for P5 (now `:81`) — a brief, not maintained.

## What this ruling does not decide (collected)

1. The text of the YouTube API Services Terms of Service and the answers to §2 decision 2(i)-(vi): the Opus reader's, at
   github grade.
2. Whether a keyed, unauthenticated `videos.list` returns `privacyStatus` and `madeForKids` for a public video: the first
   live read ("Not ruled here" 4).
3. Upload-Post's response fields beyond success and the id, and its endpoint for the connection's state (P4): grade none
   until the publisher build reads them.
4. The publisher build itself, who writes `youtube-videos.json`, and the state file's shape past 30 days.
5. The `accounts.google.com` discovery document the analytics reader names (`scripts/youtube-analytics.ts:35`) — a document
   on a barred host; queued beside the terms read.
6. The kids list's Netlify probe and the probe hosts' verdicts; the Netlify 404's grade (Part C 20-22).
7. Existing users of `worldincharts` beyond one recorded search; handle-format rules; renaming after Stage A; a reading age.
8. The `copying` field of youtube.com and google.com; the manual-upload sentence in `docs/VIDEO_PUBLISHING_CHECKLIST.md:18`;
   row 25.

## Folds for Opus

Every step is ₪0, on Opus, in a worktree with the base check first (`CLAUDE.md`, "Agent worktrees"); none needs the owner;
`scripts/verify.sh` on the named tests after each; no edit to any ruling except the dated line named in fold 7; the main
thread owns `logs/CHECKPOINT.md`, `logs/CHANNEL_LOOP.md` and `logs/FABLE_QUEUE.md` (folds 9 and 10 are its own).

1. **`research/faceless-youtube/T1-PROTOCOL.md`** — `:77`, `:78`, `:80`: replace each row with the new row in §3 decisions
   (1)-(3), find/replace on the full line; `:118-120`: append §3 (4)'s sentence to the Data API key bullet; `:124`: §3 (6)'s
   kids sub-brand text; `:136-137`: §3 (5)'s Recording sentence. No other line.
2. **`src/revenue/youtube-madeforkids.ts`** — `:165-170`: one sentence in `stayedPublic()`'s doc — the clock starts at the
   first designation read, taken in the same colony run as the publisher's response, so it is never early and at worst one
   run late; a read with no designation does not start it. After `:175`: `firstUploadWindow()` and its
   `FirstUploadWindow` type as §4 decision 3 specifies. **`src/__tests__/revenue/youtube-madeforkids.test.ts`** — after
   `:209`: the missing fixture (a `public` read with `madeForKids` null, then `public` reads 72 h on → `null`; a departure
   after it → `false`); a `firstUploadWindow` describe covering true, false and null for each reading, `passed`'s three
   answers, and `entry` null. A mutation plan `src/__tests__/revenue/mutations/youtube-madeforkids.json` (none exists
   today) with at least the `>=` at `:174`, the `!== null` at `:172`, and each false branch of `firstUploadWindow`; run under
   `scripts/sim-tree.sh`.
3. **`src/revenue/experiments.ts`** — `:23-28`: `t1Passed`'s doc says it is `firstUploadWindow(...).passed` and names this
   ruling; nothing else in the file (the pins at `experiments.test.ts:135` and `kids-explainers-kills.test.ts:73` and the
   note at `:246` are untouched; `kids-explainers-kills.test.ts:178` still passes).
4. **`scripts/youtube-madeforkids-readback.ts`** — `:60`: `FetchLike`'s init gains `redirect?: "error"`; `:103`: pass
   `redirect: "error"`; `:72-81`: a third refusal (exit 2) when `research/channel-loop/terms-verdicts.json` has no
   `googleapis.com` entry whose verdict is in `ACTIVE_VERDICTS` (`queue-zero-test.mjs:110`) — read the file as
   `brand-check.mjs:58-64` does, failing closed on a missing or unreadable file; `:21-23`: the header names both gates.
   **`youtube-madeforkids.test.ts:374-390`** — assert the refusal with a verdicts fixture lacking the entry, with
   `CONDITIONAL_UNMET`, and that with `NOT_BARRED` the key gate applies next; assert the fetch init carries
   `redirect: "error"`.
5. **The terms read (an Opus reader and an adversarial Opus verifier, the PostHog note's method)** — the OTA GitHub copy of
   YouTube's API Services Terms and Developer Policies (first `OpenTermsArchive/vlopses-us-versions` `YouTube/Developer
   Terms.md`; if the Terms of Service are not in it, the OTA file that holds the path `api-services-terms-of-service`),
   pinned by commit and sha256, excerpted as exact line ranges into
   `research/channel-loop/terms/youtube-api-services-terms-<date>.md`; a `googleapis.com` entry in `terms-verdicts.json`
   (verdict, source, checked, `copying`), with the six answers of §2 decision 2 in the excerpt file; never a fetch of
   developers.google.com. If the verdict is not active-eligible, the main thread re-briefs Stage A's key line before Stage
   A is asked. Only after this entry exists may a later fold wire the read-back into `colony.yml` (hourly), which also
   changes the no-workflow assertion at `youtube-madeforkids.test.ts:377-383` into an assertion of the gate.
6. **`research/youtube-kids/KIDS-LINE.md`** — `:311-314`, item 11, becomes: "11. T1's reads of the watch page: ruled
   7.10.2026 (`research/channel-loop/RULING-2026-10-07-t1-watch-reads-and-kids-subbrand.md` (a)-(d)): P1's second half and
   P2 read `status.privacyStatus` through `videos.list part=id,status` on the Stage A key, P2 as `stayedPublic(entry, 72)`;
   P4 reads the publisher and the brand mailbox and never a runner's sign-in; the rows are `T1-PROTOCOL.md:77`, `:78`,
   `:80` (the ruling named `:75`, `:77` on an older tree)." `:251`: `T1-PROTOCOL.md:72-82` → "`:75-81`, fail rule `:83-87`".
   `:175-184`, §7 rule 4, gains after `:184`: "**Recorded 7.10.2026** (ruling (e)): the kids sub-brand is **`worldincharts`**,
   the first name free on all three probes in the 4.10 09:28Z run (`research/measurements/kids-subbrand-check.md`,
   `218ffca`); the owner may veto; next in line `askthechart`; the handle `@worldincharts` is tried at Stage A. One web
   search for the name before Stage A, recorded here: <date>, <result>." (the search line is filled by the fold that runs
   it, snippet grade).
7. **`research/channel-loop/RULING-2026-10-04-kids-youtube.md`** — do not rewrite; the main thread adds one dated line under
   "Not ruled here" 11 (`:564-565`): "Ruled 7.10 (`RULING-2026-10-07-t1-watch-reads-and-kids-subbrand.md`): P1 and P2, not
   P2 and P4; the rows are `T1-PROTOCOL.md:77`, `:78`, `:80`; `render-watch.mjs:426` is `:535`."
8. **`src/__tests__/revenue/brand-check.test.ts`** — in `:245-276`: assert `kids-subbrand-candidates.json`'s `firstAllFree`
   is `worldincharts` and `allFree` is `["worldincharts", "askthechart"]` (the measured record this ruling rests on), and
   that `KIDS-LINE.md` names this ruling's file; leave `:251` at five until a round 2 exists, then `% 5` as `:287`.
9. **`logs/CHANNEL_LOOP.md`** (main thread, `scripts/loop-edit.mjs`) — `:140`: replace "the pick is a sitting's call, as
   T1's was: FABLE_QUEUE row 24 (e)" with "ruled 7.10 (row 24 (e)): `worldincharts`, next `askthechart`; the owner may
   veto; one recorded web search before Stage A"; `:79`: append "; a keyed API call to a host whose API terms are unread
   (ruling 7.10 row 24 (b))"; §9: add items 2, 4, 5 and 6 above as open closures.
10. **`logs/FABLE_QUEUE.md:48`** (main thread, `loop-edit.mjs set-status`): DONE 7.10, this file.
11. **Housekeeping, optional:** `research/channel-loop/BOARD-LOOP.md:118`, `:210` (`T1-PROTOCOL.md:71-96` → `:89-133`).

## Amendment 1 (7.10 ~08:30 UTC, tick 61, main thread): P1's first read is the first read, designated or not

**Finding.** §1 decision 1 says a first read that is not `public` — "`private`, `unlisted`, or null because the video was not
returned" — fails P1. §4 decision 3 defines `p1` through `entry.first`, which `src/revenue/youtube-madeforkids.ts` keeps as
"the first read that carried a designation"; a read that returned nothing, or returned the video without a designation,
never becomes `entry.first`, and the entry records no earlier read at all. The code builder and its reviewer measured the
gap (fold 2, `logs/2026-10-07-channel-loop-tick-61-t1-code.md`): a not-returned or undesignated private first read followed
by designated public reads at +1 h and +73 h gives `passed = true`. §1 says that upload failed P1. The two sections
disagree; §1 is the protocol's reading and wins.

**Decided.**

1. **The entry records its first read, whatever it carried.** `UploadReadback` gains `firstRead: { readAt, returned,
   privacyStatus } | null` — the first read the read-back takes for that id, in the same colony run as the publisher's
   response (§1 decision 1): `returned` false and `privacyStatus` null when the video was not in the response; otherwise
   the status read. It is written once and never changed; `first` (the first designation read) stays as it is and keeps
   anchoring `stayedPublic()`'s clock (§4 decisions 1-2 stand).
2. **`firstUploadWindow()`'s `p1` reads `firstRead`, not `first`:** false if `publisherAccepted === false`, or if `firstRead`
   exists and (`returned === false` or `privacyStatus !== "public"`); true if `publisherAccepted === true` and
   `firstRead.privacyStatus === "public"`; else null. `p2`, `p3`, `p4` and `passed` are unchanged. The fixture the builder
   measured (a not-returned first read, then designated public reads) now gives `p1 = false` and `passed = false`.
3. **Fold for Opus:** `youtube-madeforkids.ts` (the field, its doc, the merge in `applyReads` or its equivalent, `firstUploadWindow`),
   `youtube-madeforkids.test.ts` (the measured fixture as a regression test; `firstRead` written once; an undesignated
   public first read gives `p1 = true` while `p2` stays null until a designation read), the mutation plan
   `mutations/youtube-madeforkids.json` (the `returned === false` branch and the `firstRead` write-once rule), and the one
   sentence in `T1-PROTOCOL.md`'s Recording text that names the readings, if it names `first`. No other file.
