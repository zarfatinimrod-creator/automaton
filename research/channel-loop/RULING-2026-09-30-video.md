# Ruling — the video-channels board, 30.9.2026 (FABLE_QUEUE row 16)

**Sitting:** 30.9.2026, ~07:11 UTC; one of the day's two Fable agents; one decider. No subagents, no web, no git writes,
no edit to any other file. This dated file supersedes the name `RULING-video-channels.md` in `logs/FABLE_QUEUE.md:40`.
The main thread folds it ("Fold actions for Opus"); row 17's decider applies §16(d) D1 directly.
**Tree:** `46c79f8` (`git log -1 --format=%h`), working tree clean.
**Read:** `MISSION.md` in full; `research/channel-loop/SITTING-2026-09-30-BRIEF.md:1-92`, Part A (`:93-366`), Part C
(`:597-641`); `logs/FABLE_QUEUE.md:40`; `research/channel-loop/RULING-2026-09-29-loop.md` (a), (c), (e2), (f) and its
REOPEN. Every pointer below was reopened with `sed -n` or `grep -n -F` and carries its grade (`rendered`, `github`,
`snippet`, `repo`, `inference`, `none`, as `BRIEF:9-11` defines them). The marks `[against-bar]` and `[no-terms]` are kept
as `BRIEF:12-17` defines them. One pointer moved since the brief: RC's Kokoro lines are now
`kokoro-82m-model-card.txt:235` and `:241` (re-rendered 29.9 11:27Z; the drift `CHANNEL_LOOP.md:319` warns of).
**Standing rules applied.** One-time identity and payout steps only, never a per-item action, "Never invent a step that
isn't required" (`MISSION.md:411-420`, repo); "no selling, no talking, no camera, no manual ops" (`:211`); no ToS
violations (`:434-439`); ₪0, fees out of a sale allowed (`:352-360`); no account in the owner's name, the brand as the
only public face (`:276-279`, `:339`); promotion structural, never per-store (`:140-149`); one platform banning us must not
take the company down (`:44-45`); KILL-4 (`research/channel-loop/BOARD-LOOP.md:67`, repo).
**Money today:** ₪0.00 in the ledger (`logs/CHANNEL_LOOP.md:22`, repo). Nothing here is revenue.

---

## 16(d) TikTok's terms and our fetches; Gumroad; the general terms policy

### D1 — Captures already made: the answer row 17 needs

**RULING (apply as written).**
1. A capture marked `[against-bar]` — every tiktok.com and gumroad.com capture, and by the same rule the youtube.com,
   support.google.com and wix.com pages fetched before their bars — **stays on disk, readable and citable at rendered
   grade with the mark kept**, for exactly two uses: **(i) a question about our own compliance** with that site's rules or
   with the law; **(ii) a decision not to do something.** It may **not** be re-fetched, may not be an input to a product, a
   listing, content, a ranking or a line's growth, and may not be quoted in anything public.
2. A capture marked `[no-terms]` (the 10 nevo law pages) is **unrestricted**: there was no bar to fetch against.
3. **For row 17, mechanically:** every Gumroad-rendered fact in `research/measurements/refund-law-il.md` and
   `osek-patur-documents.md` (the refund window, the receipt, the support address, currency, fees, the API page, the terms
   themselves) stands at rendered grade `[against-bar]`, because each is a compliance question about selling Pro on
   Gumroad; every nevo fact stands at rendered grade `[no-terms]`. Neither may be refreshed by a fetch. Gumroad's refresh
   route is its source on GitHub (`antiwork/gumroad`; `github.com` is `CONDITIONAL_MET`, `terms-verdicts.json:114-118`,
   repo). nevo's refresh route is D2(v), and until it exists the `lawsofisrael` mirror (2023 text) is the only fresh read.
4. Inside the TikTok set, the **user-content captures are quarantined** beyond rule 1: the 27 `tt-video-*`/`tt-profile-*`
   pages, the 33 `tt-oembed-*` responses and the `tt-src-tiktok-com-discover*`/`-tag-*` pages (75 tiktok.com-host captures
   in all: 72 `www.`, 2 `support.`, 1 `ads.`; counted from `research/rendered/*.meta.json`, repo). No new finding cites
   them. Existing citations in the N note stay with the mark: every one supports a decision not to act (16(a)). No file
   is deleted — the record of the breach is the honest record, and git keeps it anyway.

**BASIS.**
- The clauses bar the act, not possession: TikTok bars "scrape, crawl, export or otherwise extract … using any automated
  system" (`research/rendered/tt2-terms-of-service-us.txt:63`, rendered `[against-bar]`); Gumroad bars software used "to
  'scrape' or download data from any web pages" (`research/rendered/gumroad-terms.txt:326`; `:343` "access, 'scrape,'
  'crawl' or 'spider' any pages", rendered `[against-bar]`). Reading a file already on disk is no further access to the
  site. [inference]
- The mandate's rule is one of conduct toward platforms and buyers (`MISSION.md:434-439`). A past breach is answered by
  stopping (done: `scripts/render-watch.mjs:142-158`, `:337`, repo), recording it (the marks; `refund-law-il.md:1132-1142`,
  `:1150`, repo) and not profiting from it. Using a site's own rules to comply with them is the opposite of profiting;
  refusing to read them would leave Pro's sale less lawful. What the clauses protect — the platform's content and data as a
  resource — is exactly what rules 1 and 4 refuse to use. [inference]
- The AMO precedent redacted third parties' personal data (`research/channel-loop/TERMS-AUDIT-2026-09-29.md:9`, repo).
  TikTok captures carry public handles only and the reads limit naming (`research/tiktok/08-reads/tiktok-policy.md:1-12`,
  repo). No redaction is needed.
- nevo has no terms anywhere: no link in ten captures, no footer, no GitHub copy (`osek-patur-documents.md:1129-1141`,
  rendered and github), and law texts are public domain (`TERMS-AUDIT-2026-09-29.md:250`, repo).

**REOPEN IF** a site sends a written demand about the captures (then delete the named captures and record it), or a
rendered clause of either site bars possession or use of downloaded material rather than the download.

### D2 — Fetching, from now on

**RULING.**
- **(i) TikTok: no fetch of any tiktok.com host, in either mode, for any purpose, permanently** — policy pages and the
  `/oembed` endpoint included. **P1b is KILLED** (confirmed). P1, P3, P6, P7 and P8 are **retired**, not paused; P4 is
  retired too, since youtube.com is `BARRED` (`render-watch.mjs:350`, repo); P2 and P5 continue only on hosts that pass the
  terms gate. Policy text comes from the Open Terms Archive mirrors on GitHub. The refusal in code stays
  (`render-watch.mjs:276-280`); its "pending row 16(d)" comments become "ruled 30.9". `tiktok.com` gets a `BARRED` entry in
  `terms-verdicts.json` so the file is complete (Part C, `BRIEF:640`).
- **(ii) Gumroad: no fetch of any gumroad.com web page.** `TERMS_BARRED` stays (`render-watch.mjs:337`). **The API,
  `api.gumroad.com`, stays outside the bar**: it is the interface Gumroad provides to sellers, not "a web page contained in
  the Services", and `gumroad-pro-product.js` may keep calling it (`CHANNEL_LOOP.md:284`, repo). The weekly line for
  `gumroad-terms` stays retired: the terms bar even the terms page, and they are on file.
- **(iii) One fetch for terms** (`TERMS-AUDIT-2026-09-29.md:9`) is **confirmed and bounded**: a site with no verdict
  entry, its terms URL, plain mode, once, slug `terms-…`; and once each for a document those terms incorporate as a
  condition (Wikimedia's Robot and User-Agent policies, `osek-patur-documents.md:1176-1180`, github). Never for a site
  already `BARRED`.
- **(iv) Unread or silent terms: no fetch.** Today's rule (`terms-verdicts.json:2`; `scripts/queue-zero-test.mjs:88-89`,
  repo) is confirmed. Silence is not allowance, and fetch-then-read is this repo's twice-recorded failure
  (`CHANNEL_LOOP.md:284-285`). `NO_TERMS` splits in two, by a note in the entry: **refusal-type** — the terms page answered
  403 or a bot challenge (`www.gov.il` `:427-432`; `kolzchut.org.il` `:204-208`; `knesset.gov.il` `:198-202`;
  `TERMS-AUDIT-2026-09-29.md:275`) — the refusal is the site's answer, and those lines are retired until a GitHub-hosted copy
  of their terms is read; **exhaustive-negative** — a recorded search found none (nevo, `osek-patur-documents.md:1129-1141`)
  — fetchable only under (v).
- **(v) robots.txt: yes, build it.** render-watch reads `/robots.txt` once per host per run, honours `Disallow` for its own
  name and for `*`, records the result in `.meta.json`, and sends an **identifying User-Agent** naming the brand and a brand
  URL (`MehudakRenderWatch/1.0 (+https://il-biz-tools.netlify.app)`), never the owner's username or the repository URL
  (`MISSION.md:276-279`). The copied Chrome UA (`render-watch.mjs:189-190`, repo) goes. Once that ships: a new verdict
  value `NO_TERMS_ROBOTS_OK` is active-eligible, set only for exhaustive-negative sites by a script that reads the site's
  robots.txt for the queued paths; `googlesource.com` becomes `CONDITIONAL_MET` (its condition is robots.txt,
  `research/colony-sweep/scouts/risk-governance--automation-tos.md:106`, github); `google.com` stays `BARRED` (YouTube's
  terms bar the Help pages outright, `research/faceless-youtube/scouts/discovery.md:209-211`, github);
  `wikisource.org` becomes `CONDITIONAL_MET` when the two Wikimedia policies are read and the UA complies
  (`osek-patur-documents.md:1176-1180`, github). Until it ships nothing changes for nevo. The `lawsofisrael` mirror is
  usable now by one clone read, no weekly line (`:1153-1161`, github); the Knesset has no route (`:1184-1187`;
  `TERMS-AUDIT-2026-09-29.md:275`).

**BASIS.** §3.4 has no research or API carve-out ("research" 0, "API" 0, `research/tiktok/08-reads/tt2-render-check.md:180-181`,
rendered); the EEA and ROW texts carry the same ban (`:184-196`, github); the runner is US access (`:166-170`, rendered);
the only exception is written approval, unread (`:232-236`). The reader proposed the P1b kill and the pause and left the
captures to this sitting (`:216-228`). oEmbed: the Developer Terms are unread (`:53-56`, none), so it sits inside the bar.

**REOPEN IF** TikTok's Developer Terms at github grade (OTA) name oEmbed or another route as an approved automated access
(then that route only); or a Gumroad terms version in `antiwork/gumroad` drops clause (e).

### D3 — Is a render-watch bar also a loop-ruling (e2) C1 bar? No, not by itself

**RULING.** Two different acts: render-watch *reads others' pages*; C1 is about *operating our own account*
(`RULING-2026-09-29-loop.md:304-308`, repo). A clause that bars scraping, crawling, monitoring, copying or data-gathering
bars the first and not the second. A clause naming automated means, or "any means", for **any access** to the site or to
accounts bars both, until a written yes. Placement, with grades:
- **CrazyGames** (github, ToS;DR snapshot, `TERMS-AUDIT-2026-09-29.md:193`): "automated data gathering or extraction
  tools, program, algorithm or methodology to access … any portion of the Website/Platform … without our prior written
  consent". "Program … to access … any portion" reaches a runner-driven portal. **C1 bar pending the venue's written yes**
  — which is what (e2) already required; the question is drafted (`research/owner-asks/questions.json`, venue 1, repo).
  Not a KILL: the clause is not rendered, so (e2)'s REOPEN ("a rendered clause", `:370-371`) does not fire, and the
  clause's own escape is the written consent being asked for.
- **Wix** (rendered, `research/rendered/terms-wix.html:842`, the site terms fetched once by rule): "access to Wix
  Services, User Accounts … through any means or technology (e.g. scraping and crawling), other than our publicly supported
  interfaces". **C1 bar for a runner-driven browser on the Dev Center; not a bar for Wix's documented developer APIs and
  CLI**, which are publicly supported interfaces. The Wix line proceeds by API only, or by a written yes for the browser.
- **Astro** (github, `TERMS-AUDIT-2026-09-29.md:13`): data mining, robots, data gathering. **Not a C1 bar.** (e2) stands:
  the written question goes by GitHub Discussion from the step-7 machine account (`RULING-2026-09-29-loop.md:352-353`).
- **Indiebook** (`research/rendered/indiebook-terms.txt:169`, rendered) and **Teach Simple**
  (`teachsimple-terms-of-service.txt:363`, rendered): collecting and scraping. **Not C1 bars**, as (e2) held (`:306-307`).
- **Spreadshirt/Spreadshop** (github, `TERMS-AUDIT-2026-09-29.md:228`, `:230`): "monitor the activity on or copy
  information or pages". **Not a C1 bar for uploads**; the drafted question on automated uploads stands (venue 3); a
  written no is KILL-4 (`research/breadth/BOARD.md:75`, repo).
- **Facer**: KILLED 29.9 (f) (`RULING-2026-09-29-loop.md:396`, `:414`; `docs/REJECTED.md:1262-1265`, repo). Unchanged.
- **Gumroad** `:343` names "access … any pages", but our account runs through the API Gumroad provides; a provided interface
  is not "other means". C1 met for the API route.

**Status of the seven venues the audit made unreadable.** Unreadability by the runner is **not a gate failure**; it moves
each venue's ₪0 test to its written answer and to GitHub-hosted copies (loop ruling (b), `CHANNEL_LOOP.md:88-92`).
CrazyGames (6): **candidate**, order 4, conditional on its written yes; Tipalti's page is barred too
(`TERMS-AUDIT-2026-09-29.md:274`), so Israel payability joins the written question or a GitHub-hosted Tipalti document.
Astro (7): **candidate**, ranked last, waits on step 7. Wix (11): **candidate**, NEEDS_MORE, API route only. Spreadshirt
(17): **parked** as tick 8 left it, behind the step-8 question. Indiebook (22): **candidate**, order 2. Teach Simple (28):
**candidate**, order 3. Facer (23): **KILLED**, no change. Nothing is demoted for unreadability alone; nothing is admitted
(the 29.9 order, `RULING-2026-09-29-loop.md:139-142`, stands).

**REOPEN IF** a rendered clause of CrazyGames, Astro, Indiebook, Teach Simple or Spreadshirt names automated means for
any access (KILL-4 per (e2)); or a venue's written answer is a no.

---

## 16(a) TikTok presence: NO — no brand account, no fixed batch; BookTok closes with it

**RULING.** The brand opens no TikTok account; the one-batch variant is refused too. BookTok for the Indiebook ebooks is
closed (`research/tiktok/08-sales-marketing-lessons.md:711-714`, repo). `docs/REJECTED.md:24-67` is amended and its stale
reason corrected: `:40` quotes the API for Business portal; the operative text is the Developer Terms' "Not acceptable"
line for own-account upload tools (N `:507`, github via note; `:515-517`, repo).

**BASIS.**
1. **A new owner step nothing requires.** The only route is manual in-app posting (N `:507`, github via note; `:509-513`,
   repo); the sign-up needs the step-8 mailbox and a phone and stops at any face-based age check (N `:629-630`); no such
   step exists in `docs/OWNER_STEPS.he.md` (grep, repo). Rule 1: a step is required only by a line worth having
   (`MISSION.md:416`), and the evidence says this one is not: TJ, 20,711 followers after 439 videos; @tiktok.estimtes, 7
   likes on 7,543 ad-flagged plays, 21 followers (N `:519-529`, rendered `[against-bar]`); "Nothing here reopens TikTok as
   a line" (`:529`).
2. **No owner-free kill signal that measures anything.** TikTok's own checks need the account holder's eyes (N `:450-452`,
   `:632-636`; N12 at `:683`): recurring owner viewing (`MISSION.md:211`). The agent cannot read TikTok: §3.4 bars automated
   export (`tt2-render-check.md:325-329`, rendered). The one clean signal, a count of a TikTok-only path on our own site, is
   feasible (`src/revenue/page-views.ts:163-165`, `:201`, repo: site paths only, no referrer), but a new profile's bio link
   is unverified (grade none, N `:699`), so the path would be typed from plain text: near-zero measured against
   near-zero. [inference]
3. **The ROW terms an Israeli account signs bar the account's only purpose** on the text as read, and no consent text
   exists: 16(e).
4. **Constraint 4**: one venue, one product, posted by hand, is per-store promotion with no structural leverage
   (`MISSION.md:140-149`).
5. Also against, rendered `[against-bar]`: the commercial-disclosure regime and its ban on repeat failure
   (`tiktok-policy.md:123-124`); "Professional services" among Branded Content's prohibited industries
   (`tt2-render-check.md:44-49`; whether tax software counts: none).

Nothing in TikTok's rules forbids the content itself (`tiktok-policy.md:28-37`, rendered `[against-bar]`). The refusal
rests on the owner step, the missing signal, 16(e) and value.

**REOPEN IF all three hold:** (1) a TikTok text at github grade (OTA) or rendered from a non-tiktok host grants businesses
the consent of ROW line 62, or states that a Business Account or the disclosure setting is that consent; (2) an audited
own-account posting route exists (the Developer Terms' "Not acceptable" line changes); (3) a bio link on a new brand
profile is verified. Or the owner asks for a TikTok presence as a mandate change — then it is a numbered step with a
phone only and a stop at any camera.

---

## 16(b) UGC hosts: RED stays for the purpose it names; the guides proposal is PARKED behind one check

**RULING.** The scout's RED (`research/colony-sweep/scouts/content-seo--ai-content-policy.md:89-93`, rendered 3P) bars
**parasite SEO**: hosting our content on another's domain to use its authority. That stands, and Reddit stays RED (N
`:648`; `research/colony-sweep/groups/store-promotion.md:24-27`, repo). A brand account posting a handful of substantive,
AI-disclosed Hebrew guides *for the host's own readers*, with no SEO purpose, is not what E5 describes ("hosted to exploit
a host's authority", `:29`), so E5 does not close it. **But it is not opened.** It is **PARKED** behind the one check that
decides it: **Medium's own terms and AI policy at rendered grade.** `medium.com` has no verdict entry (grep, repo); its AI
rule is known only from a secondary summary (N `:642-645`, github, secondary); D2(iv) forbids a fetch of an unread site.
Queue `terms-medium` under the once rule. If the terms allow **automated posting by a disclosed brand account** — a runner
through Medium's public interface, never a per-item owner step — the proposal enters `CHANNEL_LOOP.md` §4 as an ordinary
candidate with a ₪0 test and C1-C8; if silent, one written question; if they bar it, KILL-4. No owner step is asked now:
a brand-only account (N `:641`) is asked only if the candidate is admitted.

**BASIS.** Who posts is the deciding fact and it is missing: a runner is a terms question (none); the owner is a recurring
step (KILL-4, `BOARD-LOOP.md:67`). "No SEO lift is expected" (N `:646`) removes E5's purpose and most of the value, which
is why this is a park and not an admission. [inference]

**REOPEN IF** Medium's rendered terms bar automated posting (KILL-4), or its AI policy bars disclosed AI content from
general distribution (then the value is nil and it closes).

---

## 16(c) YouTube Kids: D confirmed; A, A-he and B rejected; T1 gets a dedicated Google account

**RULING.**
1. **D stands** (`research/youtube-kids/ASSESSMENT.md:330-337`; `RENDER-CHECK-2026-09-28.md:116`, repo). No YouTube
   channel for either reading. A, A-he and B go to `docs/REJECTED.md` with §9.3's triggers (`ASSESSMENT.md:439-468`) as a
   Fable-confirmed entry.
2. **Standing ruling on rule 4 for audiences who cannot yet read.** Honest value toward pre-readers cannot be evaluated
   without a reviewer of developmental quality outside the colony, which the mandate forbids (`ASSESSMENT.md:459-464`;
   `MISSION.md:12`, `:211`, `:420`). **No colony line targets an audience that cannot read the AI declaration.** Only the
   owner can change this; nothing here asks them to.
3. **ToS:120** is settled by 16(d): `youtube.com` and `google.com` stay `BARRED` (`render-watch.mjs:350-352`); YK's
   pre-ruling fetch (`RENDER-CHECK:156`) is not made; the `yk2-*` captures stay readable under D1.
4. **Constraint 8 for B: NO.** A dated render history of Google's help pages is a derivative of public pages, and the
   runner may no longer make it (`google.com` `BARRED`): B's only input is both public and unavailable. **B as ₪0 web
   pages: NO** (the reviser's verdict): no non-public input, no acquisition channel (constraint 7), and the pages could not
   be kept accurate without the barred re-render.
5. **The account: DEDICATED.** The step-8 Google account carries the brand mailbox, the accessibility contact, the refund
   responder (`scripts/brand_mail.py:2-3`, `:44-46`, repo) and Search Console. **T1's channel gets its own brand Google
   account, under the sub-brand name, opened at Stage A** — already held until the day-56 web read
   (`ASSESSMENT.md:473-480`). `research/faceless-youtube/RED-TEAM.md:110-112` stands; `research/breadth/BOARD.md:96-98`,
   `CHANNEL_LOOP.md:203-204`, `src/revenue/owner-steps.ts:201-207` and `docs/OWNER_STEPS.he.md:460` lose "YouTube Stage A"
   from step 8's uses. Grounds: the step-8 account is the colony's most load-bearing account — seven written questions,
   il-biz-tools' publish gate, every venue's verification mail (`owner-steps.ts:207`, repo); T1 is an experiment with
   pre-registered kills, and YouTube's own text says a monetisation violation may reach "all or any of your accounts"
   (`research/rendered/youtube-monetization-policies.txt:342`, rendered, fetched before the bar; `T1-PROTOCOL.md:90-93`);
   `MISSION.md:44-45` decides it. The cost — one more Google account, phone verification only, ₪0, no camera, at Stage A
   (`ASSESSMENT.md:478-479`) — is a one-time step the mandate allows (`:411-413`), and it is required in rule 1's sense
   because the alternative fails a mandate rule. AdSense stays one shared rail regardless (`RENDER-CHECK:139-148`,
   rendered): the dedicated account isolates the login and the enforcement radius, not the payee — P-3 below.
6. **The parents' sample** stays a held demonstration, not a line, no upload (`products/parent-guides/README.md:7`;
   `products/README.md:14`, repo). §9.4's mode list (`ASSESSMENT.md:487`) gains a third mode **for the held sample only**:
   Hebrew narration through Kokoro-82M's official voices with Phonikud G2P, which RC found licence-clean
   (`RENDER-CHECK:7-20`, github). The default `--voice ef_dora` (`render.py:295`) may stay. Nothing voiced in Hebrew
   publishes: it needs P-1 and a native listener's approval (`README.md:116`), and the mandate has no listener. That
   strengthens D.
7. **P-1 adopted** as a publication-gate rule: narration only from a voice whose weights licence and training-data
   statement are both rendered; an author's rendered statement counts for the training data
   (`kokoro-82m-model-card.txt:235`, `:241`, rendered) — demanding upstream providers' terms is a regress no model passes
   [inference]; `he_shaul`/`voices-hebrew.bin` refused by name (`yk2-hf-kokoro-hebrew-nc.txt:60`, `:70`, rendered).
   **P-2 adopted**: a second Made-for-Kids override kills the YouTube line (one appeal, never a re-upload,
   `ASSESSMENT.md:420-423`). **P-3 adopted**: AdSense is one shared rail in portfolio accounting.

**REOPEN IF** Google refuses a second account on the owner's phone (then Stage A waits; no other identity is used and the
mailbox account is not substituted without a sitting); or a rendered YouTube text shows channel enforcement never reaches
the Google account (then the dedicated account becomes optional, not required).

---

## 16(e) The rest-of-world "commercial solicitation" ban: a bar on the text as read; a second ground for 16(a)

**RULING.** ROW lines 61-62 bar using the Services "to advertise or perform any commercial solicitation" and, without
"express written consent", "for any commercial or unauthorized purpose" (`tt2-render-check.md:198-201`, github, OTA AU
mirror); a Business Account is under the same Terms (`:202-205`, github); the ROW liability text says "YOU AGREE NOT TO USE
OUR PLATFORM FOR ANY COMMERCIAL OR BUSINESS PURPOSES" (`:212-213`, github); TikTok also lists these Terms among its
"General Commercial Terms" (`:209-211`, github), and "the reconciliation stays none" (`:214`). The Community Guidelines'
disclosure regime shows TikTok tolerates own-brand promotion in practice (`tiktok-policy.md:123`, rendered
`[against-bar]`; `tt2-render-check.md:335-336`), but no text read grants the consent line 62 names (`:206-207`,
`:364-366`, none). The mandate reads the text (`MISSION.md:434-439`); where text and practice conflict and the consent is
unfound, the colony does not act. **An account whose only purpose is promoting our product is on the bar side until the
consent text is found.** Not the sole ground for (a) — the owner step, the signal and value come first — but an
independent one.

**The one check that settles it:** a TikTok text at github grade (OTA) or rendered from a non-tiktok host stating that a
Business Account, the disclosure setting, or TikTok for Business enrolment is the consent of ROW line 62. The checker's
re-run of `org:OpenTermsArchive path:TikTok "Business Account"` returned 11 hits on 28.9 (`:364-366`) that were not read
through; that read is Opus work, off tiktok.com.

---

## Summary

| Item | Ruling |
|---|---|
| 16(d) D1 | `[against-bar]` captures: keep, read, cite for our own compliance and for decisions not to act; no re-fetch, no product, content or public use; TikTok user content quarantined. `[no-terms]` (nevo): unrestricted |
| 16(d) D2 | No tiktok.com fetch ever; P1b KILLED; P1/P3/P4/P6/P7/P8 retired. No gumroad.com page; the API outside. Once-for-terms confirmed. Unread or silent: no. Build robots.txt + identifying UA; then `NO_TERMS_ROBOTS_OK` for exhaustive-negative sites (nevo) |
| 16(d) D3 | A render-watch bar is not a C1 bar by itself. CrazyGames and Wix's browser route: C1 bar pending a written yes (Wix by API is fine). Astro, Indiebook, Teach Simple, Spreadshirt: not C1 bars. Facer: killed. Unreadability is not a gate failure; the seven keep their statuses |
| 16(a) | NO TikTok account; BookTok closed; REJECTED amended, reason corrected |
| 16(b) | RED stands for parasite SEO; the guides proposal PARKED behind Medium's rendered terms; Reddit RED |
| 16(c) | D confirmed; A, A-he, B rejected; pre-reader audiences closed; ToS:120 by (d); B as web pages NO; T1: dedicated Google account at Stage A; sample held, third mode for the held sample; P-1, P-2, P-3 adopted |
| 16(e) | A bar on the text as read; consent text unfound; second ground for (a) |

## Fold actions for Opus

Every step is ₪0, on Opus, in a worktree, with the base check first; none needs the owner. Run
`npx vitest run src/__tests__/revenue/render-watch-terms-barred.test.ts` after steps 1-3 and `pnpm typecheck` after 9-11.

1. **`scripts/render-watch.mjs`**: in the comment blocks at `:142-158` and `:328-334` and in the parse error text at
   `:278-280`, replace "pending logs/FABLE_QUEUE.md row 16(d)" with "ruled: research/channel-loop/RULING-2026-09-30-video.md
   16(d) D2". No behaviour change.
2. **`research/channel-loop/terms-verdicts.json`**: add `"tiktok.com": {"verdict": "BARRED", "source":
   "research/rendered/tt2-terms-of-service-us.txt:63 (US §3.4); EEA and ROW via OTA mirrors (tt2-render-check.md:184-196);
   ruling 30.9 16(d)", "checked": "2026-09-30"}`; add a `"note"` of the form `"refusal-type: the terms page answered <403|bot
   challenge>; retired until a GitHub-hosted copy is read (ruling 30.9 16(d) D2(iv))"` to `www.gov.il`, `kolzchut.org.il`,
   `knesset.gov.il`; change nevo's note to `"exhaustive-negative (osek-patur-documents.md:1129-1141); fetchable only under
   NO_TERMS_ROBOTS_OK once render-watch honours robots.txt with an identifying UA (ruling 30.9 16(d) D2(v))"`. The test's
   `:164` assertion (nevo `NO_TERMS`) still holds.
3. **`research/rendered/urls.txt`**: the 13 Gumroad lines (`:578-631`) — change `# paused (tick 19 …)` to `# retired (ruling
   30.9 16(d) D2(ii): Gumroad's terms bar any fetch; refresh from antiwork/gumroad on GitHub)`; the Knesset line (`:718-719`)
   to `# retired (ruling 30.9 16(d) D2(iv): the site refused the runner)`; the nevo lines keep `# paused`, reason text
   `(NO_TERMS, exhaustive-negative; waits on robots.txt support, ruling 30.9 16(d) D2(v))`. Check:
   `node scripts/queue-zero-test.mjs --apply-verdicts --dry-run` reports 0 lines to pause.
4. **`research/channel-loop/ZERO-TESTS.md`**: rows 155, 162-163, 175-177, 180-186 → status "RETIRED 30.9 (16(d) D2(ii));
   captures stay readable for compliance, `[against-bar]`"; row 225 → "RETIRED 30.9 (16(d) D2(iv))". No row for nevo
   271_005 yet: its only written URL is the `lawsofisrael` listing (`osek-patur-documents.md:1117`), so first read that
   listing by clone and record whether the mirror holds the text; a nevo row waits on D2(v).
5. **`research/tiktok/08-sales-marketing-lessons.md` §9 (`:766`)**: a dated paragraph at the top: P1b KILLED; P1, P3, P4,
   P6, P7, P8 RETIRED; P2 and P5 only on hosts passing the terms gate; the quarantine list of D1(4). Add one "Ruled 30.9"
   line under the verdict headings of `08-reads/tt2-render-check.md` and `08-reads/tiktok-policy.md` pointing here.
6. **`research/measurements/refund-law-il.md:1132-1142`, `:1150` and `osek-patur-documents.md` tick-22 section**: append
   "Ruled 30.9 (16(d) D1): these captures stay in use for compliance questions at rendered grade `[against-bar]`; no re-fetch;
   refresh from antiwork/gumroad (github)". Fix the citation drift Part C names (`BRIEF:627-629`): nevo `:248-253`→`:257-262`,
   github `:113-116`→`:114-118`, www.gov.il `:407-411`→`:427-432` and its verdict `NO_TERMS`.
7. **`docs/REJECTED.md`**: (a) under the TikTok entry (`:24-67`), a dated amendment: brand account NO (16(a)); the reason at
   `:40` corrected to the Developer Terms' "Not acceptable" own-account upload line (N `:507`); P1b killed; BookTok closed;
   the ROW commercial-solicitation bar (16(e)); the three-part REOPEN. (b) a new entry "YouTube Kids: A, A-he and B — REJECTED
   30.9.2026 (Fable-confirmed)" with §9.3's triggers verbatim (`ASSESSMENT.md:441-468`), the standing rule-4 ruling for
   pre-readers, and "B as ₪0 web pages: NO".
8. **`logs/CHANNEL_LOOP.md`**: §1 Never (`:73-85`): add "a fetch of any tiktok.com or gumroad.com page, or of a site whose
   terms are unread or refused (ruling 30.9 16(d))"; §4 head (`:143`): replace "their captures already made stay" with D1's
   rule in one sentence and add the seven statuses of D3; rows 6, 7, 11, 17, 22, 23, 28: one status clause each from D3;
   §6 `:203-204`: "(it also serves Search Console; YouTube Stage A uses a dedicated brand Google account, ruling 30.9 16(c))";
   §7: record P1b, the TikTok brand account, and A/A-he/B; §8 (`:270-273`): row 16 done, this file; §9 `:284-285`: PAUSED →
   RULED with a pointer; §9: two new items — the robots.txt + identifying-UA build (D2(v)) and the `terms-medium` once-fetch
   (16(b)); also close the tick-21 heading drift Part C names (`BRIEF:637-639`).
9. **The step-8 wording**: `src/revenue/owner-steps.ts:207` `unlocks` — "the same account later serves YouTube Stage A (…)
   and Search Console: one account, several venues" → "the same account later serves Search Console; YouTube Stage A uses a
   dedicated brand Google account (ruling 30.9 16(c))"; `docs/OWNER_STEPS.he.md:460` likewise in Hebrew;
   `research/breadth/BOARD.md:96-98` a dated note, not a rewrite. The held Stage A ask text (`T1-PROTOCOL.md:90-93` and
   wherever §6 lists it) gains: "a dedicated brand Google account under the sub-brand name; phone verification only; if
   Google asks for more than a phone, or refuses a second account on that phone, stop and tell us". Run the owner-steps and
   owner-asks tests under `src/__tests__/revenue/`.
10. **P-1, P-2, P-3 in code**: `src/revenue/publication-gate.ts` — a narration gate: `voice` must be in an allowlist of
    Kokoro-82M official voices with `licenceEvidence` naming `kokoro-82m-model-card.txt:235`, `:241` (pin a dated copy, per
    `CHANNEL_LOOP.md:319`); `he_shaul` and `voices-hebrew.bin` refused by name (`yk2-hf-kokoro-hebrew-nc.txt:60`, `:70`).
    T1's kill criteria (`src/revenue/experiments.ts`, YK §9.2): a second `madeForKids` override → KILL, one appeal, no
    re-upload. `src/revenue/portfolio.ts`: a shared `rail: "adsense"` on every AdSense-paid line, counted once. Targeted
    vitest files for each.
11. **`products/README.md:14`, `products/parent-guides/README.md`, `research/youtube-kids/ASSESSMENT.md:487`**: add the
    third mode "Hebrew narration through Kokoro-82M's official voices with Phonikud G2P — held sample only; publication needs
    P-1 and a native listener's approval (ruling 30.9 16(c))".
12. **`scripts/render-watch.mjs` build (D2(v))**: robots.txt per host per run, honoured for `MehudakRenderWatch` and `*`,
    result in `.meta.json` (`robots: allowed | disallowed | none`), the identifying UA at `:189-190` (never a username or
    repo URL), refusal when disallowed; tests. Then: `NO_TERMS_ROBOTS_OK` added to `queue-zero-test.mjs:88` and the test's
    `:133`/`:146`; `googlesource.com` → `CONDITIONAL_MET`; nevo lines un-paused after its robots.txt is read and recorded;
    the two Wikimedia policies fetched once each under D2(iii) and `wikisource.org` re-judged.
13. **`logs/FABLE_QUEUE.md:40`**: DONE 30.9, this file (the row's `RULING-video-channels.md` name superseded).

## Owner asks

**None new.** One existing, held ask is amended (step 9): the T1 Stage A ask — unnumbered, held until the day-56 web read
— now includes opening a **dedicated brand Google account under the sub-brand name**, phone verification only; if Google
asks for more than a phone or refuses a second account on that phone, stop. Checked against the constraints: ₪0; opened by
the owner, not in the owner's name (a sub-brand); no camera, selfie or video; one-time; nothing public carries the owner's
name. Step 8 is unchanged and still first among the free steps (`CHANNEL_LOOP.md:203-204`).

## What stays open

1. The consent text of ROW line 62 (16(e)): the 11 OTA hits of 28.9 are unread. Off tiktok.com, Opus work.
2. TikTok's Developer Terms on oEmbed and analytics (`tt2-render-check.md:53-56`, none): github grade would do.
3. Medium's own terms and AI policy: the one check for 16(b), via a `terms-medium` once-fetch.
4. Whether Google issues a second account on the owner's phone: known only at Stage A; the REOPEN in 16(c) covers it.
5. **The repo-public decision** (`CHANNEL_LOOP.md:227-229`) now has a consequence the owner should know when they decide:
   GitHub's research condition is met only while "publications resulting from that research are open access"
   (`TERMS-AUDIT-2026-09-29.md:25`); a private repository would make `github.com` `CONDITIONAL_UNMET` and close the fallback
   every barred site now depends on. Not an ask; a fact for the existing decision.
6. nevo 271_005 (the general VAT regulations, row 17 (a)): no route until D2(v) ships or the `lawsofisrael` mirror is shown
   to hold it (step 4).
7. The Knesset gazette PDFs: no route; the site refused the runner (`TERMS-AUDIT-2026-09-29.md:275`).
8. Wikimedia's Robot and User-Agent policies: unread; D2(iii) allows one fetch each once the identifying UA exists.
9. P-1's premise — an author's rendered data statement counts — would REOPEN if a rendered term of a named upstream TTS
   provider bars reuse of its synthetic audio for commercial training.
