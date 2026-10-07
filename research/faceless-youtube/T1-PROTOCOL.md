# T1 — the first and only test before any real video (faceless-YouTube experiment)

Written 27.9.2026 from `VERDICT.md` §9-§10 and `RED-TEAM.md` §2.1, §2.2, §2.5, §2.7, §2.8 (both Fable; the red team's
amendments are binding). **Status: not run. The owner has not been asked for anything.**

## What T1 answers, and why it is first

YouTube locks uploads made through an API project that has not passed its compliance audit: such videos are forced
private and the lock cannot be appealed [RENDERED `research/rendered/youtube-private-lock-help.txt`, cited in VERDICT §9].
Our own unaudited project is therefore not an upload route, and the honest zero-touch alternative — our own project
uploading on the owner's behalf — needs the owner's "prior specific and express consent" per upload (VERDICT §8).
The only owner-free route to a *public* upload is an already-audited third-party publisher. T1 finds out whether that
route exists, for the cost of one honest short video and one owner sign-in. If it does not, the experiment stops there
(gate `K-T1` in `src/revenue/experiments.ts`) — no renders, no channel work, nothing more from the owner.

## Order — nothing on this page happens out of turn (RED-TEAM §2.5)

1. ✅ Kill gates and the `measuring` status in code (`src/revenue/experiments.ts`, `c7e1d87`).
2. ✅ The publication gate G1-G10 in code (`src/revenue/publication-gate.ts`, `9a40ec3`).
3. ✅ Public-source pre-check of the publisher (`T1-PRECHECK.md`, 27.9): **uploading — yes** (one dated public field
   test: a free-plan API upload honoured its requested visibility, no private lock; free tier includes API access,
   10 uploads/month counted per platform); **measuring — no** (Upload-Post's audience splits are TikTok-only; for
   YouTube it exposes lifetime views and nothing that computes K0/K3). So T1 is worth the owner's minutes **only if the
   same sitting includes the analytics-only consent** below. Two unknowns T1 itself settles: whether long-form uploads
   work on the free tier, and whether Upload-Post's Google sign-in can select a Brand Account channel.
4. ⏳ **Next.** The web comparison arm (the page is built: `releases/t1/page.html`) — the same analyses as pages — read at day 56 with its own reach floor. It is a free prior:
   a web null does not prove a YouTube null, but zero stranger reach for the substance is a reason not to spend the
   owner's minutes. ~~(It needs the brand domain, owner step 5, which two other lines already wait on.)~~ Superseded
   28.9.2026 by `research/channel-loop/BOARD-LOOP.md` rank 5 and `PREREG-DECISIONS.md` §3: a `*.netlify.app`
   sub-brand host; D0 = public deploy **and** a recorded discovery submission; under 5 engaged stranger page views at
   D0+56 → Stage A is never asked (`evaluateWebArm`, `src/revenue/experiments.ts`).
   Prerequisite added 7.10.2026: the sub-brand's own PostHog project (`products/chart-explainer/counter.json`), live with its four settings read back, before the deploy that is D0 (ruling 7.10 §3, `research/channel-loop/RULING-2026-10-07-posthog-organisation.md`).
   At that deploy: the page's counter disclosure (`PREREG-DECISIONS.md:591-596`) stays as written, and it is true only after M2 of ruling 7.10 §2 (GeoIP off, "Discard client IP data" on), so the deploy waits on M2.
   **Sub-brand name (29.9.2026, `research/channel-loop/RULING-2026-09-29-lines.md` (e)): `chartsplained`, host
   `https://chartsplained.netlify.app`.** Round 1 (`chartexplained`, `plotnotes`, `axisnotes`, `dataplotted`,
   `linesandbars`) had no name free everywhere (runner, 08:54 UTC, `c752cfc`); round 2 found `chartsplained` and
   `datawalkthrough` free on all four, and `chartsplained` comes first in list order (`a7efa2b`). The owner may veto it; the
   next in line is `datawalkthrough`. The rule: the first name in `research/measurements/t1-subbrand-candidates.txt`
   that `scripts/brand-check.mjs` finds free on all four probes
   (.com, GitHub, YouTube handle, `<name>.netlify.app`), via `.github/workflows/brand-check.yml`; the result lands in
   `research/measurements/t1-subbrand-check.md`, and the same name serves the host and, later, the channel. The brand
   Google-account question (shared step-8 account or a dedicated one) is deferred to `logs/FABLE_QUEUE.md` row 16.
5. ✅ **The T1 video itself, built and gate-passed, held unpublished (27.9).** "Is TypeScript catching up with
   JavaScript on GitHub?" (GitHub Innovation Graph, CC0), 116.7 s. First audit: G3 PASS, G4 and G5 FAIL (numbers
   right; framing: GitHub's Octoverse 2025 headline unaddressed, the per-repository language counting unsaid, the "no"
   half after 0:30). Revision 1 answered every required change; re-audit G3/G4/G5 PASS on script `bf98a1b0…`;
   `checkPublication()` 0 failures. Evidence: `products/chart-explainer/releases/t1/`. [4.10.2026: that pass was G1-G10;
   G11 and G7-k came with the kids ruling and the release manifest lacked their five fields, so it failed. They were added
   without a re-render, as `manifest.py` writes them for T1 (`releases/t1/manifest.notes.json`); G1-G11 0 failures since,
   checked by `src/__tests__/revenue/publication-check.test.ts`.]
6. **Only then** Stage A is put to the owner, with the pre-check and the web result attached to the ask.
7. T1 runs. Six real videos are rendered only after it passes.

## The T1 video

- One honest, short explainer (about 60-120 s), 16:9 horizontal so it is not classed as a Short, built exactly like a
  real video: one question answered from one CC BY dataset, charts drawn by code, Kokoro narration, no music, no stock,
  no generative imagery.
- It must pass `checkPublication()` (G1-G10) like any other video: licence snapshot on disk, no advice, a separate
  auditor's fact-check, description attributing the dataset and licence.
- Upload parameters: `privacyStatus = public` (the executing code sends `privacyStatus`, not the `privacy_status` a
  vendor reference shows); `containsSyntheticMedia` set explicitly to **true** — the vendor's n8n node defaults it to false;
  the board ruled `true` for chart + synthetic-narration videos, with a fixed disclosure sentence in the description
  and Kokoro as the only allowed engine (PREREG-DECISIONS.md §2, enforced in G7); title and description as
  gated. **No `youtube_publish_at`:** a scheduled video stays private until its time, which is indistinguishable from a
  lock. Nothing cross-posted: the free tier counts each platform as an upload (T1 + six videos = 7 of 10).
- It is a real video, not a throwaway: if T1 passes it stays up and counts toward nothing but itself.
- The cross-surface checklist every brand video follows (YouTube, our own pages and, only if Fable's F1 says yes,
  TikTok) is `docs/VIDEO_PUBLISHING_CHECKLIST.md` (added 28.9.2026); its YouTube rows point back to this protocol
  and to `checkPublication()`.

## Pass and fail — observable facts only (RED-TEAM §2.7)

YouTube publishes no list of audited clients, so "the publisher is audited" is not a pass criterion. T1 **passes** when
all of these are true, recorded with timestamps:

| # | Check | How it is read |
|---|---|---|
| P1 | The upload returns public, not private | the publisher's API response (success for YouTube, with the video id it returns) **and** the first Data API read of that id on the Stage A key — `videos.list`, `part=id,status`, `scripts/youtube-madeforkids-readback.ts` — finding `status.privacyStatus` = `public`; the read follows the response in the same colony run. A first read that is not `public` (private, unlisted, not returned) fails P1 whatever the cause, as a scheduled private would. Never the video's public URL: youtube.com is barred (`TERMS_BARRED`, `scripts/render-watch.mjs:535`). Ruled 7.10.2026, `research/channel-loop/RULING-2026-10-07-t1-watch-reads-and-kids-subbrand.md` (a), (c) |
| P2 | It is still public 72 hours later | the Data API, through the reads the read-back keeps for the upload: `stayedPublic(entry, 72)` in `src/revenue/youtube-madeforkids.ts` — `true` once a read at least 72 h after the first designation read found it still `public` with no departure between; `false` on any departure from `public` (private, unlisted or not returned), whatever the cause; `null` while unread. Reads are taken every colony run, so the clock is as good as their spacing and never earlier than +72 h. Never the public URL fetched from a runner (youtube.com is barred). Ruled 7.10.2026, the same ruling (a), (c), (d) |
| P3 | No "locked as private" email reached the channel mailbox | the brand mailbox (the manager account's) |
| P4 | No auto-privating and no forced sign-out within 72 h | the publisher's API, as far as it reports the channel connection's state and the upload's status (no such endpoint was read: grade none until the publisher build reads one), and the brand mailbox's notices (P3's instrument). A departure from `public` inside 72 h already fails P2 on the fact (`privacyStatus`); P4 records the cause when the publisher or a notice gives one. No runner signs in to youtube.com or YouTube Studio (automated access to the Service is barred, `TERMS_BARRED`; `logs/CHANNEL_LOOP.md:81-86`) and no owner click is asked. Ruled 7.10.2026, the same ruling (c) |
| P5 | The instrument works: per-video views and watch time split by traffic source **and** by subscribed status | the publisher's analytics API if it has one; otherwise the analytics-only consent below |

T1 **fails** on any of P1-P4 — including the case where Upload-Post's sign-in cannot select the Brand Account channel,
which fails T1 for a reason unrelated to the lock and is recorded as such. Then `K-T1` fires: the experiment stays rejected unless the owner explicitly chooses a
paid publisher tier or per-batch confirmation — asked, never assumed, and never paid from the ₪200 float.
P5 failing does not fail T1; it adds one step to Stage A (below). An experiment nobody can read is not an experiment
(MISSION rule 5; `K0-unmeasured` and `K3-unmeasured` kill).

## Stage A — what the owner would be asked, as amended (NOT asked yet)

The judge wrote 20-40 minutes; the red team measured the omissions and made it **40-60 minutes, once** (plus, since 4.10.2026, about a minute for the Data API key and, if the kids channel is asked, about five more; both below):

- **A brand Google account is the channel's primary owner — not the owner's personal account** (RED-TEAM §2.2). A
  monetization-policy failure can suspend monetization "on all or any of your accounts"
  [RENDERED youtube-monetization-policies.txt:342]; the personal account stays out of that radius. Phone verification
  of the brand account is why this step is the owner's.
  **Amended 30.9.2026** (`research/channel-loop/RULING-2026-09-30-video.md` 16(c)): a dedicated brand Google account
  under the sub-brand name, not step 8's brand-mailbox account; phone verification only; if Google asks for more than a
  phone, or refuses a second account on that phone, stop and tell us.
- The channel is created as a Brand Account under the brand name the colony supplies; the colony's manager account is
  added as manager [RENDERED youtube-brand-account.txt:61]. 2-Step Verification on the manager account uses TOTP (the
  colony can hold it), not SMS (RED-TEAM §2.8).
- One sign-in to the publisher's free tier to connect the channel through its OAuth.
- **The analytics-only consent — in the same sitting, not later.** The pre-check found Upload-Post cannot return the
  K0/K3 split, so P5 is expected to fail: an analytics-only Google Cloud project on the brand account and one consent
  for `yt-analytics.readonly` — no upload scopes, no audit (RED-TEAM §2.1 fix b). About 10-15 minutes, inside the
  40-60. Asking for T1 without it would buy an experiment nobody can read. **The project's OAuth consent screen must
  be published ("In production"), not left in "Testing"**: a Testing project "is issued a refresh token expiring in
  7 days" [RENDERED google-oauth2.txt:542-544], which would stop the reader in week two and fire `K0-unmeasured`.
  The reader that consumes this consent is built (`src/revenue/youtube-analytics.ts`, `scripts/youtube-analytics.ts`,
  27.9) against Google's own report tables [RENDERED yt-analytics-channel-reports.txt:1004-1050]. Two facts from them:
  the traffic-source report has no `averageViewPercentage`, so the Search diagnostic is derived (minutes over views ×
  our video length) and labelled so; and it offers both `views` and `engagedViews`, so the RED-TEAM §2.4 pin is a
  choice between two real metrics. **Pinned 27.9 by the board: `engagedViews`** (PREREG-DECISIONS.md §1); an all-zero
  `engagedViews` beside real plays is an instrument fault (unmeasured), never a K0 FAIL.
- **The Data API key — in the same sitting** (added 4.10.2026: `research/channel-loop/RULING-2026-10-04-kids-youtube.md`
  fold 7, §6 rule 2, §10 rule 1). One API key created in the same analytics-only Cloud project on the brand account,
  about a minute (`research/youtube-kids/ASSESSMENT.md:427-430`). The `madeForKids` read-back after every upload
  (`videos.list`, `part=status`) runs on it; the analytics-only consent does not cover the Data API
  (`ASSESSMENT.md:423-426`). P1's API half and P2 run on the same key and the same call (ruled 7.10.2026, the same ruling (a)-(d)); the first live call waits on the API's terms read at github grade and a `googleapis.com` entry in `research/channel-loop/terms-verdicts.json` (ruling (b)). Stage A is not asked before that reader is built and fixture-tested (ruling §10 rule 1).
- **The kids channel, optional — a click-set inside this sitting, not a new step** (added 4.10.2026: ruling §7 rules
  1-2, §6 rule 1; the design is `research/youtube-kids/KIDS-LINE.md`). Only if `kids-explainers` has cleared its build
  gate (ruling §9) when Stage A is asked: a second Brand Account channel on this same dedicated account, under the
  kids sub-brand `worldincharts` (ruled 7.10.2026, the same ruling (e); the owner may veto; never `chartsplained`, never `mehudak`; the YouTube handle `@worldincharts` is tried here, and if it is taken the next
  name in list order that is free on all three probes is used — today `askthechart`), its audience set to made for kids **at channel level** in this sitting, and connected to
  the publisher like T1's. About five more minutes. If the kids line has not cleared its gate, it is not asked here; it
  waits as one held click-set in the batch. **If Google refuses the second channel, stop and tell us:** the kids channel
  waits and nothing is substituted (ruling §7 rule 5); T1's part of the sitting is unaffected. If the channel-level
  made-for-kids setting cannot be made in the sitting, the same: stop and tell us (the kids line is then killed,
  `K-mfk-designation`, ruling §8 rule 3).
- **Nothing** of AdSense, tax forms, PIN letters or YPP. Those are stage B, and stage B is not even put to the board
  below 1,200 stranger watch hours per 28 days (`k3EscalateAtOrAbove`, RED-TEAM §2.3).

## Recording

Every reading goes into the experiment's readings (`ExperimentReadings.t1Passed` and friends) and is kept in the repo
with its timestamp and source, `t1Passed` is `firstUploadWindow(...).passed` (`src/revenue/youtube-madeforkids.ts`, ruled 7.10.2026): P1's API half and P2 from the read-back state, P1's publisher half from the publisher's response, P3 and P4 from the mailbox and the publisher, each recorded with its `readAt`; so `evaluateExperiment()` can be re-run by an auditor on the same numbers.
