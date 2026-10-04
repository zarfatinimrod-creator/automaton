# Brief for the Fable sitting of 30.9.2026 (~07:11 UTC): FABLE_QUEUE rows 16 and 17

**What this is.** An Opus clerk gathered the evidence and points to it here. The clerk rules on nothing. Every
`file:line` below was opened on 29.9.2026 and checked with `grep -n -F` (or by printing the line) before it was written.
Anything that could not be opened is marked UNVERIFIED. Commit hashes were checked with `git log -1`.
An Opus checker then re-opened every pointer against the tree at `0ac5d1e` (terms audit round 4, which landed after the
clerk wrote) and corrected what had moved or overreached.

**Grades.** `rendered`: a render-watch capture that a session read. `github`: code or docs read on GitHub. Where a note
quotes GitHub, the note is the pointer, and the clerk did not reopen the source ("github, via note"). `snippet`: a
search-engine snippet. `repo`: our own code or notes. `inference`: reasoning, not a text. `none`: no source.
**Provenance marks.** `[against-bar]` marks a capture fetched from a site whose terms, read afterwards, bar automated
access. That covers every tiktok.com and gumroad.com capture. `[no-terms]` marks a capture from a site with no terms on
file, which covers every nevo.co.il law page. `[against-bar]` is applied only to TikTok and Gumroad, the two sites row
16(d) names. The same condition holds for other captures cited below whose sites the audit later barred: the YouTube Help
pages behind RC's AdSense findings (`yk2-yt-9914702`, `support.google.com`; `google.com` is `BARRED`) and Wix's partner
agreement (`dev.wix.com`; `wix.com` is `BARRED`). A site's own terms page may be fetched once by rule (`TERMS-AUDIT-2026-09-29.md:9`).

**Who reads what.** The row-16 agent reads Parts A and C. The row-17 agent reads Parts B and C. Both read the three
blocks below. Row 16 writes `research/channel-loop/RULING-video-channels.md` (`logs/FABLE_QUEUE.md:40`). Row 17 writes
`research/channel-loop/RULING-2026-09-30-documents.md` (`:41`).

**Standing rules (repo).**
- **The sitting.** At most 2 agents (`logs/CHANNEL_LOOP.md:50`). A Fable fan-out killed the quota twice
  (`FABLE_QUEUE.md:18-19`).
- **The owner.**
  - Only one-time identity and payout steps (`MISSION.md:411-413`), and "Never invent a step that isn't required" (`:416`).
  - "no selling, no talking, no camera, no manual ops" (`:211`). The owner does not talk to customers (`:420`).
  - Never "a per-item owner action" (`CHANNEL_LOOP.md:76`).
  - KILL-4 covers "per-item owner paperwork, an owner conversation, a recurring cost" (`research/channel-loop/BOARD-LOOP.md:67`).
- **Honesty.** "no ToS violations" (`MISSION.md:435`). Charging "for something already free, is a violation" (`:437-438`).
- **Money.** ₪0 until the ledger shows it works. Fees that come out of a sale are not the owner paying (`:352-360`).
- **Portfolio.** "one platform banning us … must not be able to take the company down" (`:44-45`).
- **Invoices.** "An invoice issued to an Israeli customer must name the עוסק" (`:302-303`).
- **Step 8 (the brand mailbox) is not done.** `research/owner-asks/sent.json` has an empty `sent` list, and there is no
  `state/colony/brand-mail.json`.
- **Step 2 is not done.** It is asked only when a paid product is ready (`CHANNEL_LOOP.md:216-217`; `MISSION.md:356-357`).
- **The terms rule since tick 19.** "read a site's terms for an automated-access bar before its first line is queued"
  (`CHANNEL_LOOP.md:284`). It is now a CI check (`research/channel-loop/terms-verdicts.json:2`;
  `src/__tests__/revenue/render-watch-terms-barred.test.ts` exists).

**Links between the two rows. Read these before ruling.**
1. **Gumroad (16(d) against 17(b) and 17(d)).**
   - Gumroad's terms bar "any manual or automated software ... to 'scrape' or download data from any web pages contained
     in the Services" (`research/rendered/gumroad-terms.txt:326`; also `:343`; rendered `[against-bar]`).
   - Every rendered Gumroad fact in row 17 (b) and (d) rests on those 13 captures, the terms page itself included. The
     note says so twice (`research/measurements/refund-law-il.md:1132-1142`, `:1150`).
   - [inference] If 16(d) rules the captures unusable, what is left for 17(b) and 17(d) is Gumroad's source code at
     github grade. That code is read under GitHub's research condition (`TERMS-AUDIT-2026-09-29.md:25`).
   - Pro sells on Gumroad (`CHANNEL_LOOP.md:132`). 16(d) asks exactly whether the captures may be read "for our own
     compliance questions" (`FABLE_QUEUE.md:40`).
2. **nevo (16(d) against all of row 17).**
   - Row 17's law texts are nevo captures, and nevo is `NO_TERMS`: "the law pages already captured stay readable, new
     nevo lines wait" (`terms-verdicts.json:257-262`).
   - Row 17 (a) still lacks the general VAT regulations (nevo 271_005, the periodic-report exemption,
     `osek-patur-documents.md:1116-1117`).
   - Whether any fresher law text can be fetched turns on 16(d)'s general policy. Tick 22's candidate routes: the
     `lawsofisrael` GitHub mirror, text as of 2023 (`:1153-1161`); Wikisource, `CONDITIONAL_UNMET` (`:1163-1181`); the
     Knesset (`:1184-1187`). Round 4 (tick 23) found the Knesset's terms page behind a bot challenge, so the Knesset is
     `NO_TERMS` and its terms stay unread (`TERMS-AUDIT-2026-09-29.md:275`).
3. **The page-view counter (16(a) against 17(c)).**
   - The only terms-clean TikTok kill signal named is "a count on our own site, e.g. visits to a TikTok-only path named
     in the bio" (`research/tiktok/08-reads/tt2-render-check.md:325-329`).
   - [inference] That count would be read by the page-view reader whose three calls are 17(c).
   - The reader counts only the site's own page paths. Anything else becomes `(other)` (`src/revenue/page-views.ts:163-165`),
     and its query selects only the path and a count (`:201`), so it reads no referrer.
   - [inference] So a TikTok-only path counts only if it is a page on the site.
4. **The portal ruling and the terms audit (16(d) against loop ruling (e2)).**
   - (e2)'s C1 says a clause that bars "only scraping, crawling, data-mining or **collecting others' content**" does not bar
     operating our own account. A clause naming "automated means" for "**any access**" does bar it
     (`RULING-2026-09-29-loop.md:324-328`). Its REOPEN fires on "a rendered clause names agents or automated means for any
     access" (`:390-391`).
   - The audit has now read clauses on these venues that the board may place on either side of that line (the
     placement is not made here):
     - CrazyGames: a robot or other automated tool may not be used "to access, acquire, copy or monitor any portion of
       the Website/Platform" (`TERMS-AUDIT-2026-09-29.md:193`; ToS;DR snapshot, github, via note). The clause names
       "access".
     - Wix: no "access to Wix Services, User Accounts … through any means or technology (e.g. scraping and crawling),
       other than our publicly supported interfaces" (`research/rendered/terms-wix.html:842`, rendered). The clause
       names "access".
     - Astro: its terms exclude "using any data mining, robots or similar data gathering or extraction methods"
       (`TERMS-AUDIT-2026-09-29.md:13`, github). The clause names data gathering and extraction, not access.
   - Only Wix's clause is rendered; the REOPEN speaks of "a rendered clause".
   - Neither row asks whether a render-watch bar is also an (e2) C1 bar. 16(d) is the row nearest to the question.
5. **The step-8 Google account (16(c) against 17(d)).**
   - The T1 account conflict rides row 16 (`CHANNEL_LOOP.md:274-275`).
   - The refund responder in 17(d) runs on the step-8 mailbox (`scripts/brand_mail.py:2-3`, `:44-46`).
   - [inference] Settling "one account for several venues" against "a dedicated account" decides what that one Google
     account carries.

---

## Part A — Row 16, the video-channels board (`FABLE_QUEUE.md:40`)

Inputs named by the row: `research/tiktok/08-sales-marketing-lessons.md` §7.1 and §8 (cited below as **N**);
`research/tiktok/08-reads/*.md`; `research/colony-sweep/scouts/content-seo--ai-content-policy.md` §5;
`research/youtube-kids/ASSESSMENT.md` (**YK**) and `RENDER-CHECK-2026-09-28.md` (**RC**); `products/parent-guides/`.
**Tick 19, 20 and 21 additions (row 16 (d)): Gumroad, and the whole terms audit.**

### A(a) TikTok presence at all (§7.1 q1, F1)
**Question:** `FABLE_QUEUE.md:40` (a). It asks for one brand account with one fixed batch of silent demos, or none, and
for who watches the FYF-ineligible signal without recurring owner viewing.

**The offer as proposed (repo).** One brand account and one fixed batch of 3–4 gate-passed silent demo clips. The owner
uploads them in the app in a single sitting, with content disclosure on, comments off, and a bio naming the free validator
(N:618-624). A clickable bio link for a new profile is "unverified (grade none)" (N:623-624; A7 at N:699).

**What TikTok's rules allow (rendered `[against-bar]`, from the guidelines in force since 24.9.2026,
`tiktok-policy.md:37`).**
- "Nothing in TikTok's rules stops a faceless, screen-recorded demo of our own product with a generic synthetic voice"
  (`08-reads/tiktok-policy.md:28-31`).
- Generic TTS is exempt from AI disclosure (A6 at `tiktok-policy.md:86`). The clerk found "text-to-speech (TTS) narration, when the T…"
  percent-encoded in `tt-src-tiktok-com-community-guidelines-en-integrity-authenticity.html` `[against-bar]`.
- The rule that bites is **commercial disclosure**. Promoting "your own business, product, or service" needs the
  disclosure setting. Without it TikTok may "reduce its visibility", and repeated failure can bring a ban
  (`tiktok-policy.md:32-35`; C1-C2 at `:123-124`; N:430-432).
- The Hebrew route is captions only, because Kokoro has no Hebrew voice (N:426-429).

**Against.**
- **Calibration.**
  - TJ has 20,711 followers after 439 videos.
  - @tiktok.estimtes, a brand-named Hebrew tool account, whose only captured video is ad-flagged: 7,543 plays, 7 likes,
    21 followers (N:519-528).
  - N's own line: "Nothing here reopens TikTok as a line" (N:529).
- **The posting route.**
  - It is "Manual in-app posting by the owner, or nothing" (N:507). Unaudited API clients post `SELF_ONLY`.
  - TikTok's Developer Terms list as "Not acceptable" "A utility tool to help upload contents to the account(s) you or
    your team manages" (N:507; github, via note).
  - "Both manual routes are recurring owner work" (N:509-513).
- **A new owner step.** It needs the step-8 mailbox and a phone, and stops at any selfie or face-based age check. No such
  step exists in `docs/OWNER_STEPS.he.md` (N:629-630).
- **Recurring viewing.** Content check lite and the FYF notice "both need the account holder's eyes" (N:450-452). A yes
  "must say who looks, how often, and for how long, or name a kill signal the agent can read without the owner"
  (N:632-636).
- **The agent cannot read TikTok for a kill signal.** Terms §3.4 also bars automated "export". The terms-clean signal is
  a count on our own site (`tt2-render-check.md:53-56`, `:325-329`). The checker's caveat: TikTok's developer route is
  unread (`:54-56`, none).
- **Listed as REJECTED in N §8.4 (the note's own list):** recurring manual TikTok posting by the owner (N:739); paid lead ads, Spark Ads and
  boosting (N:736); self-hosted Postiz or our own API client (N:740); paid publishers (N:741); mass faceless pipelines
  and several accounts (N:760).
- **Risk to paid creator routes (tt2).** The Branded Content Policy's prohibited industries include "Professional
  services" (`tt2-render-check.md:44-49`). Whether tax software counts is an inference (none).
- **Riders on F1.**
  - BookTok for the Indiebook ebooks: "if F1 says no, it is closed with TikTok" (N:711-714).
  - A(e) below, which is a literal-terms risk to any brand account.

**Options.** (i) Yes: one fixed batch, with who looks, how often and for how long named, or an agent-readable kill signal
(the own-site count). (ii) No: TikTok closed, BookTok with it.
**Changes.**
- (i): a new proposed owner step in `src/revenue/owner-steps.ts` and `docs/OWNER_STEPS.he.md`; N12's checklist (N:683);
  [inference] one TikTok-only page path for the counter (Link 3).
- (ii): a `docs/REJECTED.md` entry with a reopen trigger. [clerk note] REJECTED's current reason "quotes the TikTok API
  for Business portal, not the Content Posting API" (N:515-517), so the new entry would correct that reason.
**Open.** Whether a new brand profile gets a bio link (none). Whether the AI label changes reach (`tiktok-policy.md:47-49`).

### A(b) UGC hosts: narrow the parasite-SEO RED ruling, or keep it (§7.1 q2, F2)
**The proposal (repo).** "a handful of substantive, AI-disclosed Hebrew guides by Mehudak on a site built for user
content such as Medium, each linking to the free tool". The aim is to reach that site's readers, "not borrowing its
authority". It needs a brand-only account, which is a new proposed owner step. "no SEO lift is expected". "Reddit stays RED
either way" (N:637-648).

**The ruling to narrow.**
- The scout: "hosting our content on someone else's high-authority domain is site reputation abuse **regardless of
  editorial oversight or first-party involvement** (E5) … **RED.**" (`content-seo--ai-content-policy.md:89-93`).
- E5 is graded "RENDERED (3P) ×2", and Google's own page was BLOCKED (`:29`).
- The group note names "Medium/dev.to/Hashnode cross-posting" among what the policy prohibits
  (`research/colony-sweep/groups/store-promotion.md:24-27`).

**Other evidence.**
- Medium's AI rule survives only in a third-party summary: "Disclosed AI content: General distribution only (NOT Boost
  eligible)" (N:641-645; github, secondary). Medium's own page was not read.
- TJ's one parasite-SEO video (Medium, LinkedIn and Reddit) is his "gray-hat" class (`08-reads/tj-tiktok.md:77`, `:262`).
- medium.com has **no** entry in `terms-verdicts.json` (clerk grep: 0 hits). Its terms are unread.

**Options.** Narrow the ruling, with the proposal's conditions: disclosed AI, brand-only account, reach not authority,
no Reddit. Or keep RED.
**Open.**
- Does "reach, not authority" survive E5's "regardless of … first-party involvement"?
- Medium's own AI and automation terms (none).
- Who would post: a runner, which is a terms question, or the owner, which is a recurring step.

### A(c) YouTube Kids: made-for-kids content, a parent-guide channel, both or neither
**The recommendation (repo).** "**Recommendation: D.** Open no YouTube channel for either reading of 'YouTube Kids'. T1
remains the colony's only YouTube test" (YK:335-337).

| Option | Mean score | Verdict |
|---|---|---|
| A (English, for kids) | 1.5 | NO_GO |
| A-he (Hebrew, for kids) | 0.5 | NO_GO |
| B (parent guides) | 2.8 | NO_GO |
| D (T1 stays the only YouTube test) | 7.7 | GO |

The scores are YK:330-333. The render check: "D stands" (RC:116).

**Five items YK queued for this sitting (YK:494-505).**
1. Confirm or overturn D, and record A, A-he and B in `REJECTED.md` with the §9.3 reopen triggers.
2. The step-8 account against RED-TEAM §2.2's dedicated account.
3. A standing ruling on MISSION rule 4 "for audiences who cannot yet read".
4. render-watch against YouTube ToS clause 120.
5. Constraint 8 for B, and B as ₪0 web pages (the reviser: NO).

**What the render check adds.**
- **Shared AdSense.** One AdSense account per payee name serves every channel of that payee, so a kids-channel action
  "could therefore reach the account T1 would use". Every rendered reach is a "may" (RC:139-145).
- **Account separation does not isolate payments** (RC:146-148).
- **Voice licence.** "no Hebrew voice has both its weights licence and its training-data terms rendered as commercial"
  (RC:110).
- **Proposed only (RC:161-173):** P-1, a narration-licence gate (it would test Kokoro too). P-2, a second "Made for Kids"
  override kills the YouTube line. P-3, AdSense counted as one rail.

**The parents' sample.**
- It is on main now: "held unpublished. There is no upload code" (`products/parent-guides/README.md:7`).
- YK allows only "English Kokoro narration, or Hebrew on-screen text" (YK:487).
- The renderer still defaults to a voice: `--voice` default `"ef_dora"` (`products/parent-guides/render.py:295`). RC calls
  this "a live scope question for the board" (RC:152-155).
- RC:152 says the product "exists only in a worktree so far". That is stale.

**ToS:120 is now inside 16(d).** `youtube.com`, `blog.youtube` and `google.com` are in `TERMS_BARRED`
(`scripts/render-watch.mjs:350-352`). YK's pre-ruling fetch of `howyoutubeworks/kids-and-teens/` (RC:156) is blocked in code.

**The T1 account conflict rides this row.**
- `research/breadth/BOARD.md:96-98` gives the one step-8 Google account to YouTube Stage A and Search Console ("one
  account, several venues").
- `research/faceless-youtube/RED-TEAM.md:110-112` wants T1's Google account "**dedicated**", with "no Search Console …
  for any other line on it".
- The lines ruling deferred it here (`RULING-2026-09-29-lines.md:243-244`) and left the wording alone: "row 16 owns it"
  (`:277`).
- The standing ask says the step-8 account "also serves YouTube Stage A and Search Console" (`CHANNEL_LOOP.md:203-204`).
- A dedicated account costs "one more Google account and a phone verification" (YK:478-479).

**Options.** Confirm D (A, A-he and B to `REJECTED.md`), or open A or B. Account: one step-8 account, or a dedicated T1
account. Parents' sample: English Kokoro narration or Hebrew on-screen text as YK allows (YK:487), or widen to voiced
Hebrew.

### A(d) TikTok's terms and our fetches; Gumroad; the general terms policy (with tick 19, 20 and 21 additions)
**Questions** (`FABLE_QUEUE.md:40` (d)).
1. Are plain-GET research renders of public TikTok pages allowed at all?
2. Is P1b, a headless browser, killed?
3. The general policy:
   - May the runner fetch a site whose terms are unread, silent, or conditional on robots.txt?
   - Should it read robots.txt?
   - Do paused venues (Indiebook, Teach Simple, Astro) stay live candidates when only a person can read their pages?
4. The same for Gumroad, and whether the captures already made may be read for our own compliance questions.

**TikTok (rendered unless marked).**
- **The clause.** US Terms §3.4: "scrape, crawl, export or otherwise extract any data or content in any form, for any
  purpose, from the Platform using any automated system or software, including automated “bots,” except as approved in
  writing by TikTok USDS Joint Venture" (`research/rendered/tt2-terms-of-service-us.txt:63` `[against-bar]`).
- **No carve-out.** "research" occurs 0 times, "API" 0 times (`tt2-render-check.md:180-181`).
- **The runner is US access.** It was served `VGeo-US` (`:166-167`). The terms claim that logged-out access forms a
  contract (`:168-170`). Whether that binds a bot in law was not read (none).
- **The other versions (github, OTA mirrors, via note).** The EEA/UK and rest-of-world terms carry the same ban
  (`:184-196`).
- **The reader's verdict on P1b.** "It breaches §3.4 … N16 must not add a P1b job", and the kill is PROPOSED
  (`:216-222`). A pause of the plain-GET queue (P1, P3, P7, P8) is PROPOSED too, and "Fable also decides whether the
  stored captures remain citable" (`:225-228`).
- **Routes the reader calls clean** (`:229-236`):
  - policy text from the Open Terms Archive mirrors on GitHub;
  - written approval (the research programme is unread);
  - off-platform material;
  - a human viewer, which would be a new owner step. oEmbed is unread (none).
- **What was fetched.**
  - The loop says the runner fetched "about 110 TikTok pages on 28.9" (`CHANNEL_LOOP.md:285`), in render commits
    `65b3e82` ("97 page(s) changed") and `9761972` ("40 page(s) changed"), both checked with `git log`.
  - The clerk counts **75** stored captures whose meta URL is a tiktok.com host, across `research/rendered/*.meta.json`.
- **The code.** It refuses tiktok.com in both modes, redirects included (`scripts/render-watch.mjs:142-158`). tiktok.com
  has no entry in `terms-verdicts.json`; it is refused by its own code path.

**Gumroad (rendered `[against-bar]`).**
- **The clause.** It bars software used "to 'scrape' or download data from any web pages contained in the Services". The
  only carve-out is a revocable permission for "public search engines" (`gumroad-terms.txt:326`); `:343` repeats it.
- **What was fetched.**
  - The runner fetched 13 pages: ZERO-TESTS rows 155, 162-163, 175-177 and 180-186. Rows 180-186 were dispatched "after
    the terms had been captured but before anyone read that clause" (`CHANNEL_LOOP.md:284`).
  - The clerk counts 13 captures with a gumroad.com meta URL.
- **The pause.** Paused as `TERMS_BARRED` (`render-watch.mjs:337`). "The Gumroad API (`api.gumroad.com`, used by
  `gumroad-pro-product.js`) is not a web page and is outside this pause" (`CHANNEL_LOOP.md:284`).

**The audit (ticks 20-23; `research/channel-loop/TERMS-AUDIT-2026-09-29.md`, cited below as TA).**
- **The rule it enforces.** A line may be active only for `NOT_BARRED` or `CONDITIONAL_MET`, or when it is a
  `TERMS_PENDING` site's own terms page (`terms-verdicts.json:2`). So today the answer to "unread or silent" is **no** in
  code, pending this ruling. The audit puts that question to row 16(d) (TA:9).
- **Counts** (checker tally of `terms-verdicts.json` at `0ac5d1e`, 84 sites): 30 `BARRED`, 6 `CONDITIONAL_MET`,
  3 `CONDITIONAL_UNMET`, 12 `NOT_BARRED`, 1 `TERMS_PENDING` (un.org), 32 `NO_TERMS`. Round 2 reports "141 lines are
  paused and 52 stay active" (TA:183). Round 3 barred Wavedash, left YPay `NOT_BARRED` but paused, and recorded five
  terms pages refused or failed (TA:250). Round 4 (tick 23) barred Tipalti ("You may not download or save a copy of the
  Site", TA:274) and set the Knesset to `NO_TERMS` after its terms page answered with a bot challenge (TA:275).
- **robots.txt.** render-watch never reads it. Google's terms allow automated access only while robots.txt is
  respected, so `google.com` and `googlesource.com` are paused (`render-watch.mjs:352-353`).
- **The user agent.** The runner sends a copied Chrome User-Agent (`render-watch.mjs:189-190`). Wikimedia's policy, quoted
  only by third parties, says "Do not copy a browser's user agent for your bot" (`osek-patur-documents.md:1179-1181`;
  github, via note; the policy itself is unread).
- **GitHub, the fallback for everything.** It is `CONDITIONAL_MET`: "Researchers may use public, non-personal information
  … only if any publications resulting from that research are open access" (TA:25). [clerk note] Whether the repo stays
  public is an open owner decision (`CHANNEL_LOOP.md:227-229`). [inference] A private repo would bear on "open access".
- **Which queued venues the runner can no longer read** (`CHANNEL_LOOP.md:143`, tick 21):
  - **Terms bar it:** CrazyGames (6), Astro (7), Wix (11), Y8 (14, conditional), Spreadshirt (17), PayPal (21),
    Indiebook (22), Facer (23), Teach Simple (28), Teachers Pay Teachers, Freemius, Pexels, Pixabay and Gumroad.
  - **No terms on file, paused:** StreetLib (24), Zazzle (25), Society6 (27), KiezelPay and Pebble (19), n8n (20),
    nevo, kolzchut.
  - **Still readable:** Displate (26), GameDistribution (14), Superteam (15), Polar (9), Apify, Draft2Digital, GitHub,
    Trolley, and the government pages whose terms allow it.
  - Y8's pause rests on "You may not use Our Websites: (i) For Your own commercial gain", and "whether research for a
    commercial venue decision is 'commercial gain' is unsettled" (`terms-verdicts.json:428-432`).
  - Tipalti (CrazyGames' billing onboarding, `CHANNEL_LOOP.md:242`) became unreadable in round 4 (TA:274), after `:143`
    was written.
- **The clauses behind the three named venues.**
  - Indiebook: "אין לאסוף נתונים מן האתר באמצעות תוכנות מסוג Crawlers Robots" (`research/rendered/indiebook-terms.txt:169`).
  - Teach Simple: "spider, crawl, or scrape" (`teachsimple-terms-of-service.txt:363`).
  - Astro: "(iii) using any data mining, robots or similar data gathering or extraction methods" (TA:13, github).
- **Whether those venues stay candidates (repo).**
  - The loop board's admission order is Displate, Indiebook, Teach Simple, CrazyGames, "each conditional on its own
    step-8 answer" (`RULING-2026-09-29-loop.md:159-162`).
  - (e2) C1 reads Indiebook's robots clause and Teach Simple's scrape ban as not barring operation of our own account
    (`:326-327`).
  - Astro's written question goes by GitHub Discussion from the step-7 machine account (`:372-373`).
  - The NEEDS_MORE policy already dispatches a render only for "a queued URL that can kill or admit without step 8"
    (`CHANNEL_LOOP.md:88-92`).
- **The captures already made.**
  - The loop keeps them: "their captures already made stay" (`CHANNEL_LOOP.md:143`), and the nevo captures "stay
    readable" (`terms-verdicts.json:261`).
  - The stored AMO results were redacted, and git history keeps the earlier versions (TA:9).
  - Row 17 relies on the Gumroad and nevo captures (Links 1-2).

**Options (as the row names them).**
- **TikTok.**
  - (i) Plain GETs of public pages are allowed.
  - (ii) All tiktok.com fetches are barred, and policy text comes from the GitHub mirrors only.
  - P1b: confirm the proposed kill, or not.
- **Stored captures:** citable; usable for our own compliance only; or quarantined.
- **Unread or silent terms:** fetch-once-for-terms (today's rule); allow when silent; or allow only with robots.txt read
  and an identifying user agent.
- **Paused venues:** stay candidates on written answers, or are demoted.
- **Gumroad:** the same choices.

**Changes.**
- `TERMS_BARRED` and `terms-verdicts.json` with its test.
- The tiktok.com refusal in `render-watch.mjs`.
- `CHANNEL_LOOP.md` §4 head and §9.
- Provenance lines in `refund-law-il.md`.
- A `docs/REJECTED.md` entry for P1b.

### A(e) The rest-of-world ban on "commercial solicitation", for A(a)
**Text (github, OTA AU mirror, via note).** Two lines of the rest-of-world terms:
- "market, rent or lease the Services for a fee or charge, or use the Services to advertise or perform any commercial
  solicitation" (`tt2-render-check.md:198-199`);
- "use the Services, without our express written consent, for any commercial or unauthorized purpose, including
  communicating or facilitating any commercial advertisement or solicitation or spamming" (`:200-201`).

**Business Accounts.** They fall under the same Terms. The Business Products (Data) Terms say the ToS "apply when you use
TikTok Business Accounts Tools" (`:202-205`). Whether switching to a Business Account counts as "express written consent"
is "not stated anywhere read (none)" (`:206-207`).

**The checker's two lines (github).**
- Against the literal reading: TikTok lists its Terms among the "General Commercial Terms" of the business products.
- For it: "YOU AGREE NOT TO USE OUR PLATFORM FOR ANY COMMERCIAL OR BUSINESS PURPOSES". "The reconciliation stays none"
  (`:208-214`).

**For coexistence (rendered `[against-bar]`).** The Community Guidelines require disclosure when "Promoting your own business, product, or
service" (`tiktok-policy.md:123`). That shows TikTok "expects businesses to promote themselves, so in practice the two
coexist. But no text read here grants the consent line 62 asks for" (`tt2-render-check.md:335-336`).
**Options.** Read the guidelines as operative, so disclosed own-brand demos are allowed. Or read the literal terms as a
bar, which closes A(a). Or ask TikTok in writing: no TikTok contact address is captured (none).

---

## Part B — Row 17, the documents decider (`FABLE_QUEUE.md:41`)

Inputs: `research/measurements/osek-patur-documents.md` (**OP**) and `research/measurements/refund-law-il.md` (**RL**).
Each has sections for ticks 17, 18, 19 and 20; OP also has one for tick 22.
**Captures, all `[no-terms]` except Gumroad's `[against-bar]`:**
- **R-BK:** `nevo-books-instructions.txt`, the income-tax books instructions. No update stamp; the live page lists no
  amendment after 26.9.2019 (OP:49-50).
- **R-VAT:** `nevo-vat-law.txt`, stamped 13-07-2026 (`:3`).
- **R-VR:** `nevo-vat-bookkeeping-regs.txt`.
- **R-REG:** `nevo-vat-registration-regs.txt`, stamped 10-12-2024 (`:3`).
- **R-ESIG:** `nevo-electronic-signature-law.txt`, stamped 02-04-2026 (`:3`).
- **R-CPL:** `nevo-consumer-protection-law-70305.txt`, stamped 02-08-2026 (`:3`).
- **R-COMP:** `nevo-computers-law.txt`, stamped 18-09-2023 (`:3`).
- **R-TERMS:** `gumroad-terms.txt`.

### B(a) Does loop ruling (e)3 survive §18ב? The key in a GitHub secret, a certified signature, or KILL-4
**What is being tested (repo).**
- **The ruling.** (e)3 lets the runner issue payee-billing documents after step 2 under six conditions, "The owner does
  nothing per document" among them (`RULING-2026-09-29-loop.md:264-281`).
- **Its REOPEN.** If the bookkeeping read shows "the עוסק must personally sign or issue each document", then Y8, Wix and
  Indiebook "are killed under KILL-4 together" (`:307-309`).
- **Which venues it touches.** Payee-billing: Y8, Wix, Indiebook. Self-billing, needing nothing from us: CrazyGames,
  GameDistribution (`:265-269`).

**§18ב, rendered.**
- **The route.** A taxpayer "רשאי לשלוח באמצעות מחשב … (1) שובר קבלה … (2) חשבונית כאמור בסעיף 9(א)" (R-BK:2233-2235).
- **Its conditions:**
  - a one-time registered-mail notice "לפני משלוח המסמך הממוחשב הראשון" (R-BK:2239);
  - the recipient's prior consent (R-BK:2240);
  - with a secured signature, payment "באחד מאמצעים אלה בלבד": card, a crossed cheque, or "(3) העברה ישירה מחשבון הבנק
    של הלקוח לזכות חשבון הבנק של הנישום" (R-BK:2241-2244).
- **The document.** A computerised document is signed "בחתימה אלקטרונית מאושרת או בחתימה אלקטרונית מאובטחת, של עורך
  התיעוד" (R-BK:1207). "תעוד פנים" is a record of an action done "על-ידי הנישום, או מטעמו" (R-BK:1187).

**Sole control, rendered.**
- A secured signature is "הופקה באמצעי חתימה הניתן לשליטתו הבלעדית של בעל אמצעי החתימה" (R-ESIG:31).
- The means may be "תוכנה, חפץ או מידע ייחודיים" (R-ESIG:11). The holder is "מי שהופק לו אמצעי חתימה" (R-ESIG:13).
- The holder must prevent use "בלא הרשאתו" (R-ESIG:104).
- An approved certificate is issued "לאדם מסוים" (R-ESIG:300) and names "שמו של בעל התעודה ומספר הזהות שלו" (R-ESIG:311).
- OP's verdict: "not settled by the text. The words point both ways, and no text read defines 'control'" (OP:401-420).
  [inference, OP:411-413] A key in a GitHub environment secret "can also be reached by the platform and by any repository
  administrator".

**Tick 19 additions (rendered unless marked).**
- **The receipt-on-request premise.** VAT bookkeeping reg 12 is "(בוטלה)" from 1.1.1991 (R-VR:455, :582-586); the queue
  says to drop that premise (`FABLE_QUEUE.md:41`).
- **Two documents per payout.** "45. עוסק חייב להוציא לקונה חשבונית עסקה על כל עסקה … גם אם הם פטורים ממס" (R-VAT:656).
  [inference] So a payout may need a §45 transaction invoice and a receipt. Reg 2(א)(3) reads "חשבונית" as "חשבונית עסקה" (R-VR:120).
  [inference] Both documents could go by the §18ב route (OP:794-803). (e)3 condition 3's field list would then need the
  service description and the customer's address added (OP:799-802).
- **A ₪0 guard.** The tax invoice's own required heading is "הכותרת 'חשבונית מס', המלים 'עוסק מורשה'" (R-VR:179). §50(א)
  charges a non-entitled person who issues "מסמך הנחזה כחשבונית מס" (R-VAT:739), and §117(א)(5) applies (R-VAT:1541).
  [clerk note] The existing generator already offers only קבלה, חשבונית עסקה and the two combined (`products/il-biz-tools/src/lib/invoice.js:4-8`).
  The clerk's grep of `src/` and `scripts/` found no runner payout-document generator.
- **A second hurdle for the key.** The VAT law's secured signature holds "ובלבד שהונפקה על ידי המדינה או על ידי מי שהמדינה
  הסמיכה לכך" (R-VAT:37). The books instructions carry their own, unnarrowed definition (R-BK:1221). Which one governs
  is open (OP:810-817).
- **Perhaps a second letter.** Reg 2(א)(2) reads "המנהל" for the assessing officer (R-VR:119), so the one-time notice may
  also go to the VAT Director: one more registered letter, with postage (OP:818-820).
- **Wix.**
  - It pays "against a lawful tax invoice to be issued by the Party receiving" (`wix-partner-agreement-body.txt:385`).
  - The law's "חשבונית מס שהוצאה לו כדין" (R-VAT:565) tilts toward a tax invoice. §47א's buyer demands a tax invoice
    only "ממוכר שהוא עוסק מורשה" (R-VAT:722, :724), which tilts the other way.
  - "The texts do not decide between the two" (OP:821-846).
  - The held question still asks about "a receipt … in place of a tax invoice" (`research/owner-asks/questions.json:43`).

**Tick 20 additions (rendered unless marked).**
- **A premise risk for step 2.**
  - Reg 13 registers listed classes as authorised dealers "גם אם על פי סכום מחזור עסקותיו … הוא היה" small (R-REG:133).
    13(1) lists "הנדסאי … טכנאי … יועץ לארגון, יועץ לניהול" (R-REG:135), and 13(7) makes any company authorised (R-REG:163).
  - Step 2's occupation line: "פיתוח תוכנה ומכירת כלים דיגיטליים" (`docs/OWNER_STEPS.he.md:146`). The list names
    titles, not tasks ([inference], OP:1065-1068).
  - The proposed ₪0 guard: the generator keys on the class recorded from the registration approval (OP:1069-1072).
- **One question for both taxes.** Reg 1 reaches every dealer except "עוסק שרישומו לפי תקנה 15א" (R-VR:106). 15א is the
  occasional-deal registrant (R-REG:176). [inference] So the §18ב question is one question for income tax and VAT
  (OP:1050-1053).
- **Wix's written-no branch is weaker.**
  - Reg 11 excludes "עוסק הפטור ממס על פי סעיף 31(3)" (R-REG:123).
  - §58 is discretionary (R-VAT:785), and the definition names §58 registrants only if "ואינו עוסק פטור" (R-VAT:91).
  - [inference] So a no leads to incorporating, a long-shot §58 letter, or Wix out (OP:1054-1062). OP calls that "not a
    simple cost decision", against (e)3's "a cost decision for the owner" (`RULING-2026-09-29-loop.md:295`).
  - If authorised status were reached, periodic reports would follow even with no activity (R-VAT:852, :856).
- **A yearly owner filing.** The exempt dealer declares turnover "עד 31 בינואר בכל שנה" (R-REG:173). That is one filing a
  year, not one per payout ([inference], OP:1073-1077).
- **Step 2's wording is unverified.**
  - Its "אונליין" (`OWNER_STEPS.he.md:130`) is not in reg 2(א)(1), which provides "ביד אישית, או באמצעות רואה חשבון, עורך
    דין, יועץ מס …" (R-REG:43).
  - Its "דיווח **פעם בשנה**" (`OWNER_STEPS.he.md:156`) is rendered only for the declaration. The report exemption would
    be a ministerial order (R-VAT:862) in the unread general regulations (OP:1116-1117).

**Options (as the row names them).**
- (i) A GitHub-environment key counts as sole control: the secured route, restricted to the three payment channels.
- (ii) Only an approved, certified signature: a paid certificate naming the holder by ID, which is a ₪0-rule and identity
  question.
- (iii) Every payee-billing document is per-payout owner paperwork, which is the REOPEN: KILL-4 for Y8, Wix and
  Indiebook together.
- (iv) Another ₪0 route with zero owner minutes. The clerk found none named in the notes read. OP's list of
  alternatives holds only a paper receipt the owner signs, the KILL-4 path, and the self-billing venues (OP:176-179).
**Also put to the ruling by the notes (options, not proposals of this brief):** whether to adopt the no-"חשבונית מס"
guard and the class guard; whether to reword (e)3's Wix sentence and the held question; whether the notice and the
January filing join the step-2 batch.
**Open.**
- [clerk inference] PayPal is none of §18ב(ד)'s three channels (R-BK:2241-2244). Y8 pays "by PayPal ($100 minimum) or
  bank ($500)" (`CHANNEL_LOOP.md:155`), so on the secured route only Y8's bank route fits. Indiebook pays by Israeli bank
  transfer (`CHANNEL_LOOP.md:163`).
- Tax Authority practice on a runner-held key: no text was read.
- The cost of a certificate: not rendered.

### B(b) Confirm lines ruling (h) on the rendered 14ג(ד) and 14ה; rule on 14ט; what the ₪79 key is; who is the עוסק
**Ruling (h) as it stands (repo).** Keep a bounded window of at least 14 days, Gumroad's 30-day default. `enable` refuses
unless the window is read back, shown on the page, and a responder is scheduled. The page "names Gumroad's policy and no
law" (`RULING-2026-09-29-lines.md:374-379`). Its REOPEN: "(i) The primary text of 14ג(ד) is rendered" (`:452-456`).

**14ג and 14ה, rendered.**
- Item (3) excludes "מידע כהגדרתו בחוק המחשבים, התשנ"ה-1995" (R-CPL:718).
- The clock runs "עד ארבעה עשר ימים מיום קבלת הנכס או מיום קבלת המסמך … לפי המאוחר מביניהם" (R-CPL:708).
- The fee cap is the lower of 5% or ₪100, so ₪3.95 on ₪79, and nothing for a defect (RL:388, :552-553).
- "מידע" is defined as "נתונים, סימנים, מושגים או הוראות, למעט תוכנה" (R-COMP:15).

**What the key is (open).** The same Computers Law groups "סיסמה, קוד גישה או מידע דומה" (R-COMP:61). RL lists the
readings: information, software, a right or a service (RL:741-766). Also open:
- whether a per-sale key is "טובין שיוצרו במיוחד בעבור הצרכן" (R-CPL:720);
- if Pro is a service, whether it is an "עסקה מתמשכת" (R-CPL:467), which decides the clock at R-CPL:710.

RL's effect line: "a window of at least 14 days … with no fee stays within 14ג(ג) and 14ה whichever characterisation
the board adopts" (RL:757-759).

**14ט, rendered.**
- It applies to a right to cancel "לפי חוק זה או לפי חוזה" (R-CPL:857), by email "(3) בדואר אלקטרוני" (R-CPL:863) and
  internet (R-CPL:867).
- A web seller must build "בדף הראשי של אתר האינטרנט שלו" a dedicated link (R-CPL:871).
- Disclosure in writing (R-CPL:875), "(1) בחשבונית, בקבלה או בהודעת תשלום" (R-CPL:879).

**Who is the "עוסק" (rendered `[against-bar]` for Gumroad).**
- R-CPL's "עוסק" is "מי שמוכר נכס או נותן שירות דרך עיסוק, כולל יצרן" (R-CPL:41).
- Gumroad's side:
  - Gumroad is "the merchant of record", and the owner "shall not issue any invoice or make any demand for payment to any
    Buyer" (R-TERMS:131).
  - Gumroad "will be treated as the seller … for purposes of any relevant Indirect Tax" (R-TERMS:148).
- The owner's side:
  - Each product "is licensed by you through Gumroad to the relevant Buyer" (R-TERMS:163).
  - The owner must "comply with all applicable laws … related to consumer protection" (R-TERMS:246).
- [inference] Both may be an עוסק (RL:1095-1102, :1535).

**What Gumroad's texts give the buyer** (RL:1024-1047, :1532-1537):
- **No cancellation mechanism for a one-time sale.** The buyer's route is replying to the receipt.
- **The receipt.** It shows the seller's contact, which is the support address (rendered).
- **Seller-set receipt text (github, via note).**
  - The refund policy's fine print, settable by `PUT /v2/refund_policy`.
  - A custom receipt text, dashboard only.
- **The invoice.** The buyer generates it, and it names "Gumroad, Inc." as supplier (github, via note).
- **The refund email** is in English (github, via note).
- **Currency.** An ILS listing may be charged in USD (R-TERMS:208).
- **VAT.** Israel is in none of Gumroad's tax lists (github, via note).
- **The page today.** The FAQ names one way to cancel: "משיבים למייל הקבלה מ-Gumroad"
  (`products/il-biz-tools/invoice.html:248`).

**Options.**
- Confirm (h) as it stands, or shorten the window after ruling the key "מידע". "none" "would need its own sitting"
  (`RULING-2026-09-29-lines.md:453`).
- On 14ט:
  - (i) The owner is an עוסק. The home page gets the dedicated link and disclosure, and the fine print carries a Hebrew
    14ט(ד) statement.
  - (ii) Gumroad alone is the עוסק. Nothing is added.
  - (iii) Both, with the owner covering what Gumroad does not.

### B(c) The page-view reader's three calls, and `POSTHOG_READ_KEY`
**The rule being implemented (repo).**
- "M-instrument: two consecutive weekly page-view KPI writes by D0+21; otherwise an instrument fault — fixed, clock
  restarted, recorded".
- At D0+56, between the two bars there is "one extension to D0+112, same read, same two outcomes; there is no second
  extension" (`RULING-2026-09-28-floors.md:221-228`; KILL-1 at `BOARD-LOOP.md:64`).
- The read path is "a strict no-op until the PostHog project, a read-only `POSTHOG_READ_KEY` and a recorded D0 exist"
  (`CHANNEL_LOOP.md:132`; commit `b855713` checked).

**The calls, from the builders' logs** (in Hebrew, quotes translated by the clerk; the fixes log has no heading "Decisions for the board". The content
is its §4, `logs/2026-09-29-pageview-kpi-reader-fixes.md:57-83`).
1. **A backfilled gap clears the fault without a clock restart** ("הכרעה ללוח (Fable)", `:67-70`). The reason given:
   the site kept counting and PostHog kept the events, so a late read is the same measurement. Only M-instrument locks, by
   write time. Related choices:
   - the row date is the write time, not the week's end (`:59-61`);
   - a one-day grace, `READ_GRACE_MS` (`:65-66`);
   - in the domain period, a measured kill takes precedence over a later gap (`:71-72`).
2. **The M-instrument deadline is 00:00 UTC of day 21**, not 21 days plus the read lag (`:62-64`). With weeks anchored to
   D0, only weeks 1-2 can be written by D0+21.
3. **At D0+112 the "same read" is weeks 9-16.** The builder called this "my interpretation" (`פרשנות שלי`). A second
   middle band gives `extension_exhausted`, because "the ruling does not say what happens in the middle the second time"
   (`logs/2026-09-29-pageview-kpi-reader.md:65-68`).
4. **`POSTHOG_READ_KEY`** is a personal key created in a signed-in user's settings. Pasting a secret needs a repo admin,
   "that is, today, the owner's step-6 sitting". "**It is not on the owner's list**, and I did not add it: this is a
   proposal for the next Fable sitting" (`:80-83`).
   - The clerk's grep finds no "posthog" in `docs/OWNER_STEPS.he.md` or `src/revenue/owner-steps.ts`.
   - Step 6's secrets table today (`OWNER_STEPS.he.md:365-377`): `GUMROAD_ACCESS_TOKEN`, `APIFY_TOKEN`, `BRAND_GITHUB_TOKEN`.
   - Whether the connected PostHog account can mint the key was not checked, since that would be a live read (`:81-82`).

**Options.** Confirm or reverse each of calls 1-3. For call 4: add the key to step 6, which weighs `MISSION.md:416`; or
have the agent mint it through the connector; or leave it unset, which leaves the reader a no-op.

### B(d) The refund responder: the reserve, the dashboard-only line, the mailbox, the balance (new in tick 19, for (h))
**The terms (rendered `[against-bar]`).** Above a 15% refund rate Gumroad may "hold in reserve an amount equal to 25% of
Supplier's funds … for 90 days on a rolling basis". Above 25% the account "may be suspended" (R-TERMS:264). The queue:
1 refund in 6 sales crosses the first line (`FABLE_QUEUE.md:41`; 16.7%, clerk arithmetic).

**"Only" through the dashboard.** The article says "Please only issue refunds from your Gumroad dashboard. Our system does
not support refunds issued directly from Stripe or PayPal". The clerk decoded `gumroad-help-issue-refund.html` line 51
`[against-bar]`. RL reads the "only" by that stated reason (RL:1538). `PUT /v2/sales/:id/refund` is documented at github
grade only (`Sales.tsx:373-380`, via note), and it "has never been run" (RL:1111).

**Tick 20 additions (RL:1539-1541).**
- **The mailbox.** Receipt replies go to the Support email when one is set, and the API does not expose that field. So
  the guard can only be an owner-step instruction: leave Support blank, or set it to the brand mailbox.
- **The balance.** [inference, RL:1539] One ₪79 sale nets about ₪65.93, so the first refund on a new account is refused
  by the dashboard and the API alike (RL:1437, :1443-1446).
- **The cost.** [inference, at 3.6 ILS per USD] A refund costs the owner about ₪3.37, below the ₪3.95 cap (RL:1436, :1541).
- **Gumroad's own refunds.** Gumroad "uses your stated policy when handling refunds or disputes on your behalf", and such
  refunds would likely count toward the 15% and 25% lines (RL:1541, [inference]).
- **The clock.** 14ה(ב)(1) runs 14 days "מיום קבלת ההודעה על הביטול" (R-CPL:797).

**What is built (repo).**
- `respond-refunds` in `scripts/brand_mail.py:44-46`. When the refund command fails, the buyer is "not answered, left for
  the next run" (`:1286`).
- `MIN_REFUND_DAYS = 14` (`products/il-biz-tools/scripts/gumroad-pro-product.js:96`).
- The sale opens only after step 8 and the responder (`CHANNEL_LOOP.md:132`).

**Options (as the row and RL:1539 name them).** The responder stays as is; it sends a holding reply; it becomes a dashboard step,
which is a per-item owner action (`CHANNEL_LOOP.md:76`); or it waits, meaning sales wait for a covering balance. Also: the
Support-email instruction in step 3.

---

## Part C — What is not for this sitting, and what is missing

**Row 18 goes to the 1.10 sitting.** It is "the first sitting with a free slot: 30.9 is full with rows 16-17"
(`FABLE_QUEUE.md:42`; `CHANNEL_LOOP.md:277`).
- Its note, `research/measurements/actions-spending-limit.md`, says "Nothing for FABLE_QUEUE row 17" (`:224`).
- Tick 22 rendered its option (i)(b), a $0 budget with "Stop usage" (`:511-517`; `FABLE_QUEUE.md:42`).
- [inference] Nothing in rows 16-17 depends on it; the note says so for row 17 (`:224`).

**What a ruling would need that no file holds.**
1. **A(a), A(e).**
   - Any TikTok text granting the "express written consent" of rest-of-world line 62 (`tt2-render-check.md:364-366`).
   - TikTok's developer terms on oEmbed and on analytics access (none).
   - Whether a new profile gets a bio link (none).
2. **A(b).** Medium's own AI and automation terms; medium.com has no verdict entry.
3. **A(c).** YK's pre-ruling YouTube fetch, now blocked by `TERMS_BARRED`.
4. **A(d).**
   - Nevo's terms: none anywhere (OP:1129-1141).
   - The Knesset's terms: row 225 met a bot challenge, so they stay unread (TA:275).
   - Wikimedia's Robot and User-Agent policies, both unread (OP:1179-1181).
   - (Tipalti's website terms, listed here by the clerk as row 224, were read in round 4: `BARRED`, TA:274.)
5. **B(a).**
   - The general VAT regulations (nevo 271_005, OP:1117; a grep finds no ZERO-TESTS row or `urls.txt` line for it).
   - The 1991 gazette (TAK-5321).
   - Tax Authority practice on runner-held keys.
   - Any certificate price.
6. **B(b), B(d).**
   - Whether the ILS listing is charged in shekels. It is read from the first sale's `buyer_presentment` (RL:1537).
   - Gumroad's own contact article, `gumroad-help-contact`: "Not fetchable: paused" (RL:1508).

**Housekeeping for the Opus fold, not rulings.**
- **Citation drift in OP's tick-22 section.** OP cites `terms-verdicts.json:248-253` and `:252` for nevo, which is now at
  `:257-262` (the note at `:261`). It cites `:113-116` for github.com, now at `:114-117`, and `:407-411` for www.gov.il as
  `TERMS_PENDING`; www.gov.il is now at `:422-427` and its verdict is `NO_TERMS`.
- **FABLE_QUEUE row 17 names a heading that does not exist.** "Decisions for the board" is not in
  `logs/2026-09-29-pageview-kpi-reader-fixes.md` (clerk grep: 0 hits). The content is its §4 and the builder's §4
  (B(c) above).
- **RC:152 is stale.** It says `products/parent-guides/` "exists only in a worktree", but it is on main.
- **CHANNEL_LOOP.md:278 is incomplete.** It describes row 17's tick-19 growth only. The tick-20 additions (reg 13, reg 15,
  the mailbox, the balance) are in `FABLE_QUEUE.md:41` and the two notes, not in the loop file's row-17 summary (only the
  step-2 wording point appears, at `CHANNEL_LOOP.md:319`).
- **CHANNEL_LOOP.md:143 has not caught up with ticks 22-23.** It is still headed "Tick 21". Round 3 (Wavedash barred,
  TA:254; YPay paused, TA:250) is in the status line (`CHANNEL_LOOP.md:22`) but not at `:143`; Wavedash was already dead
  on G3 (`:266`). Round 4 (Tipalti barred, TA:274; the Knesset `NO_TERMS`, TA:275) is in neither.
- **tiktok.com has no row in `terms-verdicts.json`.** It is refused by its own code path.
