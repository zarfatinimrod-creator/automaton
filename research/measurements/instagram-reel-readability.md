# Can an Instagram reel the owner sends be read by this colony? — measured 22.9.2026

**Verdict: NO, by any route this repository has. Not from the container, and not from a GitHub Actions
runner — which is the trick that beat gov.il, Freemius and the Apify API.** The owner has now sent three
reels (two on 6.9.2026, one on 22.9.2026). The first two were recorded as "לא קריא מכאן" without evidence;
this file is the evidence, so that nobody spends a fourth attempt on it.

## What was tried, in order

1. **`WebFetch` from the container** → `EGRESS_BLOCKED` for `www.instagram.com`. Same class as gov.il and
   Freemius: the agent proxy refuses the CONNECT. One attempt, no routing around it.
2. **`render-watch.yml` with a one-run URL override, from a GitHub Actions runner** (run #9,
   2026-09-22T18:20:56Z, job `render`, conclusion success). This is the mechanism that rendered the Tax
   Authority's PCN874 circular and Freemius's supported-countries page. Result, from
   `research/rendered/owner-reel-2026-09-22.meta.json`: **HTTP 200**, `text/html`, **632,429 bytes**, no error.
   And yet the page carries nothing:
   - `<title>Instagram</title>` — the generic shell title, not the post.
   - **Zero `og:` meta tags.** No `og:title`, no `og:description`, no `og:video`. A reel page served to a
     browser carries the caption in `og:description`; this response carries no meta tags at all.
   - `edge_media_to_caption`: 0 occurrences. `video_url`: 0. `owner`: 0. `accessibility_caption`: 0.
   - Deterministic text extraction: **10 bytes**. Zero Hebrew characters in 632 KB.
   - The shortcode `DdjemLTTOH` appears (it is in the URL the shell echoes), and `isLoggedIn` and
     `challenge` are present — the markers of the logged-out/anti-automation shell.
   In other words Instagram answers a datacenter IP with a valid-looking empty page rather than a 403. A
   200 here is not content; anyone grading this capture must read the meta file, not the status code.
3. **`mcp__higgsfield__video_analysis_create`** — the one video-understanding tool available in the session.
   Its schema accepts **only** a YouTube URL or the UUID of a file already uploaded to that service. An
   Instagram URL cannot be passed to it. (Its sibling `media_import_url` would consume the owner's credits
   on a maybe, and MISSION forbids spending the owner's money — not attempted.)

## What was deliberately NOT tried

**Third-party Instagram mirrors and scrapers** (the `ddinstagram`/`imginn` class of site) that re-serve
logged-in content to logged-out clients. They exist and one of them might work. They also exist by
breaking the platform's terms, and `MISSION.md` puts honest value above the revenue target: we do not get
our inputs by routing around a login wall. Recorded as a decision, not an oversight.

## The consequence, stated plainly

**A reel is not an input this colony can consume.** Every future session should skip steps 1–3 above and
do the one thing that works: ask the owner for the content in words. The precedent is 6.9.2026 — the owner
typed a single word, **"clipping"**, and that one word was enough to open a criterion, sweep it, and reach
a verdict (`docs/REJECTED.md`, `content-seo`: the whole group died because every money model in it is a
multiplier on traffic the colony has no way to bring without the owner's voice).

**What to ask for, in this order of usefulness:** (1) the method in a word or a sentence; (2) the caption
text pasted; (3) the account name, which is usually enough to find the method by search. A screenshot is
readable by a session with vision, but only if it is attached in the conversation — a link to one is not.

## Note on the stored capture

`research/rendered/owner-reel-2026-09-22.{html,txt,meta.json}` was written by CI and is kept as the
evidence above. The stored URL includes the `?stkn=` share token from the owner's own share link; it is a
per-post share token, not an account credential, and it is recorded here so the owner knows it is in the
repository.
