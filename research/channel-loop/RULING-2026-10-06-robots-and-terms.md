# Ruling — robots.txt as a bar, the runner's contact, terms-page shells, full copies, 6.10.2026 — `logs/FABLE_QUEUE.md` row 21

**Sitting.** 6.10.2026 ~07:11 UTC, beside row 22. One decider: the deciding model of the sitting. No subagents, no web
fetch, no git command of any kind, no edit outside this file; the main thread folds on Opus. The owner is "the owner".

**Tree.** No git command was run, so no commit hash is recorded here. Every pointer below was opened in the working tree of
`claude/new-session-j071dx` during the sitting with `sed -n`, `grep -n` or `cat -n`, and the line quoted is the one seen.
One command was run against the store: `node scripts/capture-check.mjs --all` (read-only; it writes nothing).

**Read.** `MISSION.md` in full; `logs/FABLE_QUEUE.md:45` (row 21, the whole row); `research/rendered/robots-nevo-2026-09-30.txt:1-148`
and `robots-nevo.meta.json`, `robots-nevo-2026-09-30.meta.json`; `research/channel-loop/RULING-2026-09-30-video.md:1-150`
(header, 16(d) D1-D3), `:294-383` (folds, open items); `products/il-biz-tools/src/config/osek-zair.json:1-127`, `:248-250`
and its `vatLaw`/`nevo` lines; `osek-zair-unverified.json` in full (11 lines); `osek-patur.json:3`, `:11`;
`research/rendered/nevo-vat-law-2026-09-29.meta.json`, `nevo-vat-law.meta.json`, the `fetchedAt`/`status`/`robots` keys of
all ten `nevo-*.meta.json`, and `nevo-vat-law-2026-09-29.txt:93` by grep only; `logs/2026-09-29-osek-zair-2026.md` §1, §4
(`:107-143`) and its keyword lines; `research/rendered/terms-wikimedia-user-agent-policy-foundation.txt:320-350` and its meta;
`scripts/render-watch.mjs:25-50`, `:210-245` and every `User-Agent`/`MehudakRenderWatch`/`robots` line; `scripts/
queue-zero-test.mjs:20-62` and every `terms` line; `scripts/robots-verdict.mjs:1-60`; `scripts/capture-check.mjs:1-70`;
`scripts/freeze-capture.mjs:1-40`; `scripts/remask-captures.mjs:1-40`; `research/rendered/terms-israel-post.meta.json`, its
`.txt` (20 bytes) and `node scripts/capture-check.mjs terms-israel-post`; `terms-kaggle.meta.json`, `terms-streetlib-it.meta.json`
(keys); `research/channel-loop/TERMS-AUDIT-2026-09-29.md:95-135` (`:100` and `:129` in full); `research/rendered/
terms-worksheets4kids-2026-09-29.txt:185-205`; `terms-btl-2026-09-29.txt:293-313`; both metas' heads; `research/channel-loop/
terms-verdicts.json:1-6`, `:58-66`, `:91-99`, `:119-125`, `:310-318`, `:322-329`, `:402-409`, `:429-438`, `:570-582`,
`:675-700`, `:703-710`; `logs/CHANNEL_LOOP.md` `##` list, §3 rows naming il-biz-tools (`:134-135`), §6 (`:201-263`), §9
filtered (`:296-409`); `research/channel-loop/RULING-2026-10-05-refund-state.md:1-60`; `research/measurements/
osek-patur-documents.md:38`, `:55-62`, `:467-491`, `:1125-1195`; `research/channel-loop/RULING-2026-10-05-vat-services.md:15-35`;
`SITTING-2026-10-05-BRIEF.md:40-50`; `research/rendered/urls.txt` lines naming nevo, israelpost, kaggle, streetlib; `research/
rendered/README.md:1-45` and its storage lines; `research/rendered/FROZEN.sha256:119-121`, `:140-141`; `products/il-biz-tools/
osek-zair.html`, `index.html`, `osek-patur.html`, `README.md` lines carrying 122,833; `tests/osek-zair.test.js`,
`osek-zair-page.test.js:160-175`, `:860-880`, `statutory-sources.test.js` lines carrying 122833; `src/config/site.json`;
`src/__tests__/revenue/render-watch-robots.test.ts:80-105`.

**Grades** as the 30.9 ruling defines them: `rendered`, `github`, `repo`, `inference`, `none`; "github via audit" where the
only text is the audit's quotation. Marks kept: `[against-bar]`, `[no-terms]`; this ruling adds `[robots-bar]` (decision 1).

**Standing rules applied.** Honest value outranks the target: "No spam, no scams, no fake reviews, no manipulation, no ToS
violations" (`MISSION.md:455-456`, repo); the brand is the only public face, nothing carries the owner's identifiers, and
the repository URL carries them (`:276-279`, `:304-308`, `:310-312`); ₪0, "Nothing is bought." (`:354`); a surface "that can
show a number nobody earned is worse than no dashboard" (`:50-52`) — read here as: a page that shows a figure nobody has
verified from a permitted source is worse than a page that says it does not compute that year; "Never invent a step that
isn't required." (`:436`); the owner does one-time steps only (`:432-433`). The 30.9 ruling's own rule: "Silence is not
allowance, and fetch-then-read is this repo's twice-recorded failure" (`RULING-2026-09-30-video.md:83-84`, repo).

**Money today.** Not re-read this sitting. The 5.10 ruling records ₪0.00 in the ledger (`RULING-2026-10-05-refund-state.md:52`,
repo). Nothing in this file is revenue; nothing in it fetches, publishes or spends.

---

## 1. (a) Is a robots.txt Disallow a bar in D1's sense? Yes — the nevo captures move to D1(1); the 2026 cap loses its source

**The question as asked** (`FABLE_QUEUE.md:45`): "D1(2)'s premise is gone if a robots.txt Disallow is a bar: the ten nevo
captures of 29.9 were fetched with a copied Chrome UA against a robots.txt that disallows every bot not named Googlebot or
Bingbot (whether it read the same on 29.9 is unknown). Is robots.txt a bar in D1's sense? If so, the nevo captures move to
D1(1) … and osek-zair's 2026 year loses its source until a permitted text of the 2026 cap is read (the lawsofisrael mirror is
2023 text). Keep, drop 2026 from the page, or another route?"

**Facts read.**
- nevo's robots.txt, rendered 30.9 10:25Z (`robots-nevo.meta.json` `fetchedAt`; `robots: "allowed"`, the file itself):
  `User-agent: *` / `Disallow: /` (`robots-nevo-2026-09-30.txt:146-147`); a block headed `# Comprehensive AI Crawler Block` (`:69`) naming
  `anthropic-ai` (`:77-78`), `Claude-Web` (`:92-93`), `ClaudeBot` (`:95-96`), `GPTBot` (`:116-117`) and others, each
  `Disallow: /`; only `Googlebot` (`:1`) and `Bingbot` (`:35`) get `Allow: /law_html/law01/` and `Allow: /law_html/law00/`
  (`:30-33`, `:64-67`), and even they are refused `/law_html/law10/` (`:28`, `:62`). Rendered.
- The ten nevo page captures were fetched 29.9 between 08:59Z and 13:02Z (the ten `nevo-*.meta.json` `fetchedAt`; the VAT law
  at 10:46:51Z), all `status: 200`, none with a `robots` key: render-watch had no robots.txt support and sent a copied Chrome
  User-Agent until 30.9 (`RULING-2026-09-30-video.md:92`: "The copied Chrome UA (`render-watch.mjs:189-190`, repo) goes";
  `render-watch.mjs:225`: "It replaced a copied Chrome string on 30.9"). Repo.
- D1(2) rested on silence: "A capture marked `[no-terms]` (the 10 nevo law pages) is **unrestricted**: there was no bar to fetch
  against." (`:32`); its basis: "nevo has no terms anywhere" (`:59`). D1(1) is the other state: against-bar captures stay "for
  exactly two uses: **(i) a question about our own compliance** … **(ii) a decision not to do something.** It may **not** be
  re-fetched, may not be an input to a product, a listing, content, a ranking or a line's growth" (`:27-31`). Repo.
- The repo's own code already treats a Disallow as decisive for a fetch: "A URL it disallows is not fetched" (`render-watch.mjs:35`);
  the parser matches "the product token MehudakRenderWatch, else `*`" (`:33-34`); "A site that says no is recorded as saying no."
  (`:228`). `robots-verdict.mjs` refused `NO_TERMS_ROBOTS_OK` for nevo: "8 of 8 paths disallowed" (`terms-verdicts.json:433`). Repo.
- Evidence that the `*` Disallow predates 29.9, all found by the 29.9 GitHub search and so in existence before the fetch
  (github): a third-party refusal ledger lists nevo as one that "bans GPTBot, Google-Extended, Perplexity and '*' outright",
  marked `"verified_here": False` (`osek-patur-documents.md:1138`); another project reports a nevo page "accesso bloccato da
  robots.txt" (`:1139`); the mirror's own author writes "while the law information is public domain however the activity of
  using the website might be not under the terms of the website" (`:1140`). The 29.9 note itself recorded: "robots.txt is not
  terms, and render-watch never fetches it" (`:1141`).
- Wikimedia's policy, which this repo adopted as its UA standard on 30.9: "Do not copy a browser's user agent for your bot, as
  bot-like behavior with a browser's user agent will be assumed malicious." (`terms-wikimedia-user-agent-policy-foundation.txt:348`,
  rendered).
- What rests on the capture: `osek-zair.json` `documents.vatLaw` (`:64-73`, URL `/law_html/law01/271_001.htm`), `years.2026.cap:
  122833` (`:90-94`) with its own confession — "The 2026 cap is the one figure here not read in a primary text … accepted … as a
  recorded exception" (`:3`); cites at `:114`, `:120-121` (cap, cap2026) and `:248-250` (vatSense); the page text at
  `osek-zair.html:20`, `:93`, `:124`, `:126`, `:167`; `README.md:68`; tests `osek-zair.test.js:37`, `:71-82`, `:172`, `:249` and
  `osek-zair-page.test.js:164-170`, `:439`; a corroborating sentence in `osek-patur.json:11` ("Beside Kol Zchut: nevo's
  consolidated text … states the same 122,833"). The config's own rule: "A value leaves this file only when a rendered primary
  text states it" (`osek-zair-unverified.json:3`), and the 29.9 log's review found the first build had deleted the word
  "primary" to make nevo fit, then restored it and called 2026 an exception, not an application (`logs/2026-09-29-osek-zair-2026.md:125-130`). Repo.
- The alternatives on record: the `lawsofisrael` mirror is dated 2023-03-06 (`osek-patur-documents.md:1159`); he.wikisource.org
  "carries 2026 changes, and it can differ from nevo" (`:1167`), is `CONDITIONAL_UNMET` on the UA contact (`terms-verdicts.json:681-686`),
  and is a volunteer consolidation "with a lag on recent amendments" (`:1174`); gov.il's terms page answered 403
  (`terms-verdicts.json:707`); the Knesset has no route (`RULING-2026-09-30-video.md:380`). Statute text has no copyright
  (`osek-patur-documents.md:1147`); nevo's stamp and notes are its editorial layer (`:1148`). Github/repo.

**Options weighed.**
1. *Keep: robots.txt is not a contract, statute text is public domain, nevo wants the law pages indexed, one GET harmed nobody.*
   Each sentence is true and none answers the question. D1 is a rule of conduct toward sites (`:51-55`), not a copyright test.
   robots.txt is the one channel a site has to speak to robots, nevo spoke in it, and what it said to every robot not named
   Googlebot or Bingbot is `Disallow: /`. The Allow for two search engines sharpens, not softens, the point: nevo wants humans
   to find the law through search, and wants no other robot reading it. Our runner is "every other robot". Since 30.9 the
   runner's own code treats exactly this signal as a bar on itself; to call the same signal "no bar" when it is inconvenient
   to the capture already taken is the convenient reading, and the ruling rejects it.
2. *The UA question: a robot wearing a browser's UA matches no `User-agent` group — was it even addressed?* RFC 9309 and the
   repo's parser (`render-watch.mjs:33-34`) send a token that matches no group to `*`. A copied Chrome string matches no group,
   so on 29.9 the runner fell under `User-agent: *` / `Disallow: /` — the broadest line in the file. The named AI-crawler
   block does not need to be reached: it only shows the intent. And the disguise is the thing Wikimedia's policy calls
   "assumed malicious" (`:348`); it cannot be the thing that made the fetch allowed.
3. *The date question: does a 30.9 read say anything about 29.9?* Strictly, no file read on 30.9 proves the file's content
   23 hours and 39 minutes earlier (VAT law 10:46Z on 29.9; robots 10:25Z on 30.9). Three third-party records that existed
   before the fetch say nevo already banned `*` and blocked a page by robots.txt (`:1138-1139`), and a file of this shape (a
   curated list of two dozen AI crawlers) is not written in a day. But the ruling does not rest on probability. It rests on
   whose failing the unknown is: the runner did not look (`:1141` says so), and "Silence is not allowance" (`RULING-2026-09-30-video.md:83`).
   **A capture whose permission at fetch time cannot be shown, because the fetcher did not check, is treated as fetched
   against the bar.** The unknown is charged to the fetcher, never presumed in its favour. [inference]
4. *Move to D1(1) but let the 2026 cap stand as "already read".* No. D1(1) says an against-bar capture "may not be an input to
   a product" (`:30`). The 2026 cap is a product figure on a public page for people computing their tax. The one honest
   reading of D1 is the one that costs the product a year.

**RULING.**
1. **A robots.txt `Disallow` that reaches the runner — for its product token, or for `*` when it sends none — is a bar in D1's
   sense.** A page fetched when that Disallow stood, or when the runner cannot show it did not stand because it never read the
   file, is a capture taken against a bar.
2. **The ten nevo captures** (the nine live slugs at `nevo-*.meta.json` and the frozen `nevo-vat-law-2026-09-29.*`) **move from
   D1(2) to D1(1)**, marked **`[robots-bar]`** — a new mark, kept distinct from `[against-bar]` so the record says what kind of
   bar it was: a robots.txt Disallow, not a terms clause. The two D1(1) uses hold (our own compliance; a decision not to act);
   no re-fetch, no product input, no listing, content or ranking. D1(2) is **vacated** as to nevo; `[no-terms]` keeps its
   meaning for a site that is silent in every channel, robots.txt included, and today describes no capture in the store.
3. **No file is deleted** (D1(4), `:43`: "the record of the breach is the honest record"). Statute text carries no copyright
   (`:1147`) and nevo has no terms barring copying, so decision 4 does not reach these captures on copying grounds; they stay in
   full with the mark. The `robots-nevo` weekly probe stays (fetching `/robots.txt` is always allowed, `render-watch.mjs:1225`):
   it is the only way to learn if nevo changes its answer.
4. **osek-zair's 2026 year loses its source today.** No permitted text of the 2026 cap exists in the store: the 2023 mirror
   cannot hold a 1.1.2026 CPI step by construction; wikisource is `CONDITIONAL_UNMET` and, when met, is a consolidation and not
   the primary text the config's rule demands; gov.il and the Knesset refused or have no route. **2026 returns to `pendingYears`**
   in the pre-29.9 shape: offered as pending, not computed, with one sentence sourced to the gazette alone — the amount is
   indexed to the CPI on 1 January 2026 under §37(ב) and §126(א) (gazette p. 173, already cited at `osek-zair.json:122`), and
   the tool computes 2026 once a primary text stating the amount is read. **122,833 returns to `osek-zair-unverified.json`**
   with a `grade` naming this ruling and the `toVerify` of `:93` unchanged (Reshumot notice, a Tax Authority gov.il page, or a
   Tax Authority circular; wikisource may corroborate beside one, never replace it). `defaultYear` stays 2025.
5. **Every nevo cite leaves the product:** `documents.vatLaw`, the vatLaw entries in `facts.cap` and `facts.cap2026`, the three
   `facts.vatSense` cites (`:248-250`), the turnover note (`osek-zair.html:93`), `README.md:68`, and the corroborating sentence in
   `osek-patur.json:11`. `check.vatLaw` stays as history with one added sentence: read 29.9; marked `[robots-bar]` 6.10 (this
   ruling); no longer cited. `facts.vatSense` (that "עוסק זעיר" is a deleted VAT term) may stay only if the same fold re-cites
   it to a pinned excerpt of the `lawsofisrael` VAT blob at `aeca0b25` (`osek-patur-documents.md:38`, `:61-62`: the deletion dates
   from 2002, so a 2023 text is current for it), saved under `research/channel-loop/law/` in the PostHog excerpt shape
   (`CHANNEL_LOOP.md:341`, `:356`); otherwise it is dropped with the year.
6. **A second recorded exception is not the loop's to grant.** The primary-text rule stands as written; the 29.9 exception
   was the first and is now undone by its own source's bar.

**REOPEN IF** the weekly `robots-nevo` probe shows a nevo robots.txt that allows `MehudakRenderWatch` or `*` on
`/law_html/`, or nevo publishes terms that allow a runner: then `robots-verdict.mjs` may set `NO_TERMS_ROBOTS_OK` and a fresh
fetch may be a product input. The 29.9 captures keep `[robots-bar]` regardless — a later permission does not reach back.

**What this does not decide.** osek-patur.html's own 122,833 (`osek-patur.json:3`) rests on a 7.9 search-summary read, not on
nevo (`:11`: "a comparison with search results, not a read of the source"); removing the nevo sentence leaves it as it was
before 29.9. Whether a figure of that grade may stay on a public page is a question of its own, not in this row; it is named
under "Not decided". Whether other pre-30.9 captures on other hosts were taken against a Disallow is not judged site by site
here; the Folds order an audit, with the rule of decision 1(1).

## 2. (b) The runner's User-Agent contact: carry only what the brand holds; today that is nothing

**The question as asked:** "ruling D2(v) fixed render-watch's UA as `MehudakRenderWatch/1.0 (+https://il-biz-tools.netlify.app)`,
but that site is not deployed … so the UA's only contact is a subdomain we may not hold yet; Wikimedia's User-Agent Policy asks
for contact information … Keep the URL, add the brand mailbox once step 8 exists, or another contact?"

**Facts read.**
- The constant: `export const USER_AGENT = \`${ROBOTS_PRODUCT_TOKEN}/1.0 (+https://il-biz-tools.netlify.app)\`;`
  (`render-watch.mjs:230`), with the stated purpose "the brand's own URL, so a site can see who is asking and say no to it by
  name in its robots.txt" (`:222-223`). Pinned by `render-watch-robots.test.ts:80` and `:93` (the only URL in the string). Repo.
- The site is not deployed: il-biz-tools is "launch-ready except one gap", "deploy route: ask 1 (network) or the Netlify click
  in 6b" (`CHANNEL_LOOP.md:134`); ask 2 (network access for `*.netlify.app`) is unanswered (`:213-216`); step 8, the brand
  mailbox, is first among the free steps and not done (`:207-212`); step 7, the organisation, is not done (`:219-221`).
  `site.json:2` names `https://il-biz-tools.netlify.app` as the *target* `siteUrl`. Repo.
- Wikimedia: "Scripts should use an informative User-Agent string with contact information, or they may be blocked without
  notice." (`:334`); "The generic format is <client name>/<version> (<contact information>) <library/framework name>/<version>
  … Parts that are not applicable can be omitted." (`:344`); the example carries a URL and an address (`:342`). Rendered.
  wikisource's entry already turns on this: "its contact URL, il-biz-tools.netlify.app, is not live until the site deploys, so
  the condition stays unmet; it becomes CONDITIONAL_MET once the URL answers or the brand mailbox is in the UA" (`terms-verdicts.json:685`).
- The repository URL may not be the contact: it carries the owner's username (`MISSION.md:304-308`); the test already refuses
  `github` in the UA (`render-watch-robots.test.ts:88`). §9 records "the UA contact-URL check waits on row 21 (b)" (`CHANNEL_LOOP.md:354`).

**Options weighed.**
1. *Keep the URL; the deploy is coming.* The deploy waits on an owner click with no date; six days have passed since 30.9. Until
   then the string tells every host we fetch to contact a page that answers nothing — and a `*.netlify.app` name is first come,
   first served, so a URL the brand does not hold can come to point at a stranger. An identifying UA that may identify someone
   else is a false statement. Rejected.
2. *The brand mailbox.* It does not exist (step 8 undone). Nothing we do not hold goes in the string.
3. *The organisation or repository URL.* Step 7 undone; the repository URL carries the owner's identifier. Rejected on `MISSION.md:304-308`.
4. *The token alone, with the contact part omitted.* Wikimedia's own format allows omission (`:344`). It is less informative and
   wholly true. A site can still refuse the runner by name in robots.txt (`ROBOTS_PRODUCT_TOKEN`, `render-watch.mjs:219`),
   which is the refusal channel the runner honours. Chosen.

**RULING.**
1. **The contact element of the UA names only a surface the brand holds and that answers.** Today that is nothing, so the UA
   becomes **`MehudakRenderWatch/1.0 (robots.txt honoured; contact pending)`**: the token and version stay; the parenthesis
   states two true things and no URL. The test at `:93` changes from "exactly that URL" to "no URL".
2. **It changes on the first of two events, and again on the second.** (i) **A brand site is live at a URL the loop controls:**
   "live" means a deploy record written by the deploy workflow into a committed file (not by hand) *and* one render-watch
   capture of that URL with `status: 200` whose text carries the brand name — then `(+<URL>; …)`. (ii) **Step 8 is done:** the
   brand mailbox address joins, in Wikimedia's form `(<URL>; <address>)`, or stands alone if (i) has not happened. Each change
   bumps the version (`/1.1`, `/1.2`) so a host's logs tell the strings apart. The address is the brand's, never a personal one.
3. **wikisource stays `CONDITIONAL_UNMET`** until (i) or (ii); its note already says so. No Wikimedia host is fetched meanwhile
   (the two policies were fetched once under D2(iii) and are on file).

**What this does not decide.** Which surface deploys first, or when the owner answers ask 2 or step 8 — owner steps, listed
in §6, unchanged. Whether the brand mailbox in a UA sent to every host is a spam exposure worth taking: the address is the
public support address by design (step 8), so the ruling accepts it; the main thread may revisit when the mailbox exists.

## 3. (c) Terms pages the runner cannot read: five kinds, and a once-only JavaScript render of a shell

**The question as asked:** Israel Post's terms page "fits neither kind in D2(iv). May the runner render a terms page that is a
JS shell in js mode, once, to read it, when the host runs a bot manager (Radware here)? … Same question for any future terms
page that is a shell … which kind is a terms page that answered 404, a fetch that failed at the network (mr.gov.il), a
JavaScript shell (Israel Post), or a site whose terms defer to a refusal-type site's (data.gov.il, to gov.il)?"

**Facts read.**
- D2(iv)'s two kinds: refusal-type ("the terms page answered 403 or a bot challenge … the refusal is the site's answer, and
  those lines are retired until a GitHub-hosted copy of their terms is read") and exhaustive-negative ("a recorded search found
  none … fetchable only under (v)") (`RULING-2026-09-30-video.md:84-88`). `robots-verdict.mjs:25-27` reads a 2xx HTML page in
  place of a robots.txt as "the site refusing or not answering, not a file that says yes". Repo.
- Israel Post: `status: 200`, `byteLength: 4375`, `robots: "allowed"` for `https://doar.israelpost.co.il/content/term-of-use/`
  (`terms-israel-post.meta.json`); the text is 20 bytes; `capture-check` says `js-shell	10 characters of text, fewer than 1000;
  empty app root "<div id="root"></div>"; also Radware Bot Manager (ShieldSquare) connector "__uzdbm_1"; also reCAPTCHA
  "google.com/recaptcha/api.js"` (run this sitting, exit 3). The verdict note: "No challenge page was served, so tick 31's 'a bot
  challenge' overstated it" (`terms-verdicts.json:314`). The line is retired (`urls.txt:737`). Rendered/repo.
- capture-check's own rule: passive sensors and captcha scripts "sit on ordinary pages too (mr.gov.il's storefront carries the
  same Radware connector as Israel Post's terms), so they never decide a kind" (`capture-check.mjs:48-51`); `bot-challenge` is a
  challenge page's marker, or a captcha with "no sign at all of a JavaScript app" (`:30-33`). `--all` this sitting: "588 captures:
  status 73, ok 411, short 26, bot-challenge 4, js-shell 74"; three are terms pages: `terms-israel-post`, `terms-kaggle`
  (fetched 2026-10-06T07:15Z, `robots: "none"`, `TERMS_PENDING`, `terms-verdicts.json:322-327`), `terms-streetlib-it`
  (`NO_TERMS`, "legalpolicy is a JavaScript shell", `:580`; paused, `urls.txt:655`). Repo.
- The js rule: "--js REQUIRES --terms <slug>" (`queue-zero-test.mjs:27`); "`--terms ${terms} is the slug of the line being
  queued: the terms must be a different, earlier capture`" (`:320-322`); a shell "does not count" (`:30-32`); and the mode's
  purpose: "A Salesforce help-centre page, refused below as a shell for a plain line, is allowed with --js: rendering such a
  shell is what the mode is for." (`:35-36`). The 29.9 condition for js: "the target's terms must already be rendered and must
  not bar automated access, exactly as for a plain GET" (`:24-26`). Repo.
- In js mode render-watch holds every request the page makes to its host's robots.txt and aborts the disallowed ones unsent
  (`render-watch.mjs:1695-1707`, `:1653-1663`); the browser sends the identifying UA (`:1528`); "Nothing is done to get past a
  block — no proxy, no retry storm, no cookie games." (`:227-228`). Repo.
- The europa.eu verifier: "The site answers the runner with an anti-robot challenge, which is a technical access control.
  Solving it in JS mode would circumvent a measure aimed at robots [INFERENCE]." (`TERMS-AUDIT-2026-09-29.md:111`). Repo.
- The other cases: mr.gov.il "the terms page fetch failed (round 3)" (`terms-verdicts.json:406`); data.gov.il "its terms page
  defers site use to the gov.il terms (terms-data-gov-il.txt:19), which are unread" (`:123`); www.gov.il "refusal-type: the terms
  page answered 403" (`:707`). Repo.

**Options weighed.**
1. *No js render of any terms page, ever (today's rule).* Then a site whose terms are a shell can never be read by the runner,
   and D2(iv)'s "unread terms mean no fetch" makes the site permanently unfetchable for want of the one page that would tell us
   whether fetching is allowed. That is not caution; it is a rule that forbids learning the rules.
2. *Allow it freely as "what the mode is for".* No: a terms page's js render is the one recursive case the script refuses
   (`:320-322`), and it executes the site's scripts under the site's bot manager. It needs its own narrow gate, not the general one.
3. *Allow once, under conditions, as a reading act.* Reading a site's terms is the precondition for respecting them; D2(iii)
   already allows one plain fetch for terms; the mode is the way to read a page that a plain GET cannot. The bot manager does
   not change the answer: the runner arrives with its own name, runs the page as any client does, solves nothing, and if the
   manager or the invisible score decides to show it nothing, that *is* the site's answer and is recorded as one. What the
   europa.eu note forbids — solving a challenge — stays forbidden. Chosen.

**RULING.**
1. **A `NO_TERMS` or `TERMS_PENDING` site's terms page falls into one of five kinds, named by the first word of its note:**
   - **K1 refusal-type** (unchanged): the terms URL answered 401, 403 or 429, or a challenge page (`capture-check` `bot-challenge`).
     The site's answer is no. Retired until a GitHub-hosted copy is read. **No js attempt, ever**: a 403 to the plain GET is final,
     and trying the browser "to see if it gets through" is the evasion D2(iv) and the europa.eu note refuse.
   - **K2 exhaustive-negative** (unchanged): a recorded search found no terms anywhere. Fetchable only under `NO_TERMS_ROBOTS_OK`.
   - **K3 unanswered**: the terms URL answered 404 or 410, a 5xx, or the fetch failed at the network (mr.gov.il). The site has not
     answered on terms; this is neither a refusal nor a search. The `terms-` line stays, plain, on the weekly watch (D2(iii)'s one
     fetch not yet achieved); a 404 twice on the same written URL retires that URL as wrong, and a new one is queued only when
     written in a repo or GitHub-hosted file (urls.txt's one-rule). No other page of the site is fetched.
   - **K4 shell**: the terms URL answered 2xx with a page `capture-check` classifies `js-shell` (Israel Post, kaggle, streetlib.it).
     Passive sensors and captcha scripts on the shell are named, as capture-check names them, and do not change the kind.
     Fetchable under rule 2 below, once.
   - **K5 deferred**: the terms page is read and defers site use to another site's terms (data.gov.il to gov.il). The site takes
     the kind of the terms it points to — today K1 by reference — and becomes fetchable only when the governing terms are read
     (a GitHub-hosted copy of gov.il's terms, or that site's own change of kind). Its note names the governing site.
2. **A K4 terms page may be rendered in js mode once, as a reading act, under all of these:** (i) the plain capture of the same
   URL exists on disk and is `js-shell` — not `bot-challenge`, not `status`; (ii) that capture's meta says `robots: "allowed"`
   or `"none"` for the URL; (iii) the slug starts `terms-`, and the line is queued through a new `queue-zero-test.mjs` route
   (`--js --terms-shell`) that checks (i)-(iii) and refuses anything else — never by hand; (iv) the plain shell is frozen first
   with `freeze-capture.mjs --allow-flagged` (its own rule: "for a claim about the failure itself"), so the record of what the
   plain GET saw survives the rewrite; (v) the render runs under render-watch's existing js-mode limits: the identifying UA,
   every request held to its host's robots.txt, no challenge solved, no retry; (vi) **whatever comes back is the answer**: a read
   page sets the verdict on its text; an empty render, a block, or a challenge page is recorded in the note as "shell: rendered
   once <date>, <what came back>", the line is retired, and there is no second attempt in any mode and no fetch of any other
   page of the site. A bot manager on the host changes none of this; a challenge served *to the render* turns the site K1.
3. **Israel Post:** rule 2 applies as written. The plain capture of 30.9 (`terms-israel-post`) is frozen `--allow-flagged`, the
   line re-queued once with the js flag by the new route, read, and judged. Until that read, the site stays unread and nothing
   else on it is fetched (the registered-mail rate stays unread; the step-2 notice stays recorded, not asked — `terms-verdicts.json:314`).
   kaggle and streetlib.it are eligible under the same rule; whether to spend a render on them is the loop's ordering, not ruled here.

**What this does not decide.** Whether a *non-terms* page may be rendered in js mode on a host that runs a bot manager, once
its terms are read and allow a runner: the 29.9 condition governs (`queue-zero-test.mjs:24-26`), and nothing here loosens it.
Whether Israel Post's terms, once read, allow anything: unknown until read.

## 4. (d) Full copies of pages whose terms bar copying may not stay in the public repo; what stays is meta, hash and cited lines

**The question as asked:** "the repo is public and render-watch commits full copies of every page it reads. Some sites' terms
bar copying or republishing without barring access … May such captures stay committed in full, or only as a hash and the
lines a research file cites? (Moot if the owner makes the repo private, but that closes GitHub's own condition; see CHANNEL_LOOP §6.)"

**Facts read.**
- worksheets4kids: "בנוסף אין להפיץ, להעתיק, לשכפל, לפרסם, לחקות או לעבד פיסות קוד, גרפיקות, סרטונים, סימנים מסחריים או כל
  מדיה ותוכן אחר מבלי שיש ברשותכם אישור כתוב מראש." (`terms-worksheets4kids-2026-09-29.txt:195`, rendered); the verdict:
  "copy/publish bar, no access bar" (`terms-verdicts.json:694`).
- Bituach Leumi: "בכפוף לדיני זכויות יוצרים, אסור למשתמש להעתיק, להפיץ מחדש, לשדר מחדש או לפרסם חומר מוגן, ללא הסכמה מראש
  ובכתב מאת המוסד לביטוח לאומי." (`terms-btl-2026-09-29.txt:303`); two lines earlier it allows quotation: "המשתמש רשאי לעשות
  "שימוש הוגן" בחומר המוגן, לפי הכללים הקבועים בדין. שימוש הוגן כולל ציטוט סביר מתוך החומר המוגן." (`:299`) and "המצטט כאמור
  חייב לציין את המקור לציטוט" (`:301`). Rendered. The verdict: "copyright only; full-page republication in a public repo is a
  storage question" (`terms-verdicts.json:93`).
- Apify: GTC 5.2 forbids "(ii) reproduce, share, or distribute the Website or the Services" and "(iii) create derivative or
  analogous works, copies of the Website or Services or any part thereof"; "That bears on committing responses to a public repo,
  not on the GET" (`TERMS-AUDIT-2026-09-29.md:100`, github via audit); the saved copy is at `research/channel-loop/terms/
  apify-general-terms-2026-10-04.md:88` and "the storage caveat … stays with row 21 (d)" (`CHANNEL_LOOP.md:350`). Indiebook: ":165
  bars copying or publishing any part of the site … Storing the full page texts in this public repo sits against these; that is a
  separate question from access." (`TERMS-AUDIT-2026-09-29.md:129`, github via audit).
- The store's own words: "Everything here is third-party content, stored for citation only. … nothing here is redistributed as
  our own work, and no license is claimed over any of it. Read them, quote them with the URL, cite them — do not ship them."
  (`research/rendered/README.md:26-29`); "every capture is committed to this public repository" (`:81`). Repo.
- Precedents already in the repo: PostHog — "the site repo's licence asks that pages outside `/contents/` not be copied, so
  excerpts, not full copies" (`CHANNEL_LOOP.md:356`; `:341`); the one-time re-mask of 278 stored files in place, "git history
  keeps the earlier bytes" (`remask-captures.mjs:8-12`; `CHANNEL_LOOP.md:366`); frozen copies and the citation scan
  (`freeze-capture.mjs:9-13`). Repo.
- The owner's open decision: public or private (`CHANNEL_LOOP.md:239-241`); a private repo "makes github.com CONDITIONAL_UNMET
  and closes the GitHub-hosted route every barred or refusal-type site depends on", and meters the hourly workflows. Repo.

**Options weighed.**
1. *Keep full copies: they are "for citation only", intent governs.* Intent does not govern what a public repository does: a
   full page committed to it is available to anyone, which is what "להפיץ", "לפרסם", "distribute" and "copies … of any part"
   describe in plain words. The README's own instruction — quote and cite, do not ship — is already the excerpt rule; the store
   has not been following it for these sites.
2. *Wait for the owner's public/private decision.* The decision is the owner's and undated; the republication is ours and
   continuing. The loop cannot make the repo private, but it can stop publishing what it may not publish. Not waiting.
3. *Delete the captures.* It erases the record of what was read and breaks every citation by line. Rejected; the record is kept
   in a shape that is not a copy.
4. *Meta, hash and cited lines.* Keeps the evidentiary record (URL, date, hash, the lines a decision rests on), keeps every
   citation valid, ends the republication. Bituach Leumi's own terms describe exactly this as permitted: reasonable quotation
   with the source named (`:299`, `:301`). Chosen.

**RULING.**
1. **A capture from a site whose read terms bar copying, reproducing, distributing or publishing its content may not stay
   committed in full.** What stays, per capture: the `.meta.json` (every field, plus `trimmed: { on, ruling, keptLines,
   fullSha256 }`); a `.txt` of the **same line count** in which every line a decision-bearing file cites, with two lines of
   context either side, is kept verbatim and every other line is blank — so no citation by line moves and `freeze-capture.mjs
   --cited` stays at 0; the full body (`.html`, `.json`, `.pdf`) leaves the tree, its `sha256` staying in the meta as the
   verification hash. A frozen copy is trimmed the same way and `FROZEN.sha256` follows. **Git history keeps the earlier bytes;**
   whether to rewrite public history is the owner's, listed with the §6 public/private decision — a fact for that decision,
   not an ask.
2. **The site list is a field, not a memory.** `terms-verdicts.json` gains `"copying": "barred" | "allowed" | "unread"` per
   site, each `barred` with its clause cited. Set today from clauses read: `worksheets4kids.co.il` (`:195`), `btl.gov.il` (`:303`,
   quotation allowed by `:299`), `apify.com` (GTC 5.2(ii)-(iii)), `indiebook.co.il` (`:165`, via audit). Every other site is
   `unread` until an Opus pass reads its clause; `unread` is not `allowed`.
3. **The weekly line of a `copying: barred` site stops landing full copies.** Until render-watch can keep the body out of the
   tree, those lines are paused with the reason `# paused (copying barred: ruling 6.10 row 21 (d))`. The build that un-pauses
   them: for such a site render-watch commits meta and hash only and uploads the body as a workflow artifact (private to the
   repository's collaborators, 90-day retention), named by slug and sha256; a reader fetches the artifact, reads, and writes the
   quotation and its line into the research file — which is how a read becomes a finding already (`README.md:33-36`). This
   reaches the Apify store JSON too (a response of "the Services"); the audit's doubt that it is Apify-owned (`:100`,
   `[INFERENCE]`) is noted and does not win against the clause's "any part thereof".
4. **Scope by class.** The rule reaches `[against-bar]` and `[robots-bar]` captures as well, wherever the site's `copying` field
   says `barred`; D1(1)'s two uses and D1(4)'s quarantine are unchanged, and D1's "may not be quoted in anything public" (`:31`)
   is read as the product, listing and content surfaces, not the research record's cited lines, which are quotations with the
   source named. nevo is not reached on copying grounds (decision 1(3)).
5. **Who trims.** An Opus builder writes `scripts/trim-capture.mjs` (dry run by default; refuses a site without a `copying`
   field, refuses to blank a cited line, rewrites `FROZEN.sha256` for frozen copies, prints kinds and counts and never a
   capture's text) and the render-watch artifact route; the main thread runs the trim once, one commit, its message saying that
   history keeps the full bytes; a reviewer confirms the frozen-citations test and `freeze-capture.mjs --cited` are unchanged.

**What this does not decide.** Whether a page from a site whose terms are *silent* on copying may stay in full: silence is not
permission under copyright law either, but no clause was read against it this sitting, so the question is queued as the
`copying` audit, not ruled. TikTok's and Gumroad's copying clauses were not read this sitting; their `copying` field is set by
the audit, and D1(4) stands meanwhile. Whether the repo should be private: the owner's, with the §6 consequences as recorded.

---

## Folds

Every step is ₪0, on Opus, in a worktree with the base check first (`CLAUDE.md`, "Agent worktrees"); none needs the owner.
After each: `scripts/verify.sh` on the named test files; `node scripts/freeze-capture.mjs --cited` must report no change.

1. **`research/channel-loop/RULING-2026-09-30-video.md`** — do not rewrite; the main thread adds one dated line under D1(2):
   "Vacated as to nevo 6.10 (RULING-2026-10-06-robots-and-terms.md 1): a robots.txt Disallow is a bar; the ten nevo captures are
   `[robots-bar]`, D1(1)."
2. **`research/channel-loop/terms-verdicts.json`** — nevo's note gains: "`[robots-bar]` (ruling 6.10 row 21 (a)): the ten
   captures of 29.9 are D1(1) — compliance and decisions not to act only, never a product input"; add `"copying"` to every
   site (`barred` with clause for worksheets4kids.co.il, btl.gov.il, apify.com, indiebook.co.il; `unread` elsewhere); prefix each
   `NO_TERMS`/`TERMS_PENDING` note with its kind word (`refusal-type:` stays; `exhaustive-negative:` stays; `unanswered:` for
   mr.gov.il; `shell:` for israelpost.co.il, streetlib.com, streetlib.it, kaggle.com; `deferred to www.gov.il:` for data.gov.il);
   wikisource's note points at decision 2 for the two triggers.
3. **`products/il-biz-tools/src/config/osek-zair.json`** — remove `documents.vatLaw`, the vatLaw cites in `facts.cap` (`:114`),
   `facts.cap2026` (`:120-121`) and `facts.vatSense` (`:248-250`); move 2026 from `years` to `pendingYears` in the pre-29.9 shape
   with the gazette-only indexation sentence; `about` rewritten; `check.vatLaw` kept with the one added sentence of decision 1(5).
   `osek-zair-unverified.json`: 2026 cap 122,833 returns with `grade` "nevo capture `[robots-bar]` (ruling 6.10 row 21 (a)); not a
   product input" and the existing `toVerify`. `osek-patur.json:11`: delete the sentence from "Beside Kol Zchut:" to its end.
4. **`products/il-biz-tools/osek-zair.html`, `README.md:68`, `tests/osek-zair.test.js` (`:9`, `:37`, `:71-82`, `:172`, `:249`),
   `tests/osek-zair-page.test.js` (`:164-170`, `:439`)** — the page and tests follow the config: 2026 pending, no 122,833, no
   nevo; `facts.vatSense` either re-cited to a pinned `lawsofisrael` excerpt under `research/channel-loop/law/` or dropped.
   Run `products/il-biz-tools` tests and `statutory-sources.test.js` (unchanged, osek-patur's).
5. **`scripts/render-watch.mjs:230`** — `USER_AGENT` becomes `${ROBOTS_PRODUCT_TOKEN}/1.0 (robots.txt honoured; contact pending)`
   built from a `UA_CONTACT` constant that is empty today; comment `:222-228` says when it fills (decision 2(2)).
   `src/__tests__/revenue/render-watch-robots.test.ts:80`, `:93` — assert the new string and that the string holds no URL while
   `UA_CONTACT` is empty; when a URL is present, assert a `research/rendered/brand-<host>.meta.json` with `status: 200` exists.
6. **`scripts/queue-zero-test.mjs`** — add the `--js --terms-shell` route of decision 3(2): allowed only for a `terms-` slug
   whose plain capture exists, is `js-shell` by `capture-check`'s classifier, and whose meta says `robots` allowed or none;
   the written comment names this ruling; everything else refused with the reason. Tests beside the existing `--terms` tests.
7. **Israel Post, in order** — `node scripts/freeze-capture.mjs terms-israel-post --allow-flagged --why "plain GET saw a shell
   (ruling 6.10 row 21 (c))"`; re-queue `urls.txt:737` once through the new route; after the run, read, set the verdict, and
   retire the line whatever came back.
8. **`research/rendered/urls.txt`** — pause the active lines of worksheets4kids.co.il, btl.gov.il and apify.com with
   `# paused (copying barred: ruling 6.10 row 21 (d))` (through `scripts/urls-pause-comments.mjs` or `loop-edit.mjs`, never by
   hand-written Python); indiebook's are already paused.
9. **`scripts/trim-capture.mjs` (new) and render-watch's artifact route** — decision 4(1), 4(3), 4(5); then the one-time trim
   run by the main thread, one commit.
10. **Audit pass (Opus, one auditor, one verifier)** — (i) read every `NOT_BARRED`/`CONDITIONAL_MET`/`NO_TERMS` site's copying
    clause and set `copying`; (ii) list every capture fetched before 30.9 whose URL a later run's meta records as `robots:
    "disallowed"` or `"unreachable"`, and mark those bodies `[robots-bar]` under decision 1(1).
11. **`logs/CHANNEL_LOOP.md`** — §1 Never: "a product figure from a `[robots-bar]` or `[against-bar]` capture"; §9: close
    `:354` (the UA check) and `:350` (the Apify caveat) to this file; add items 6, 9 and 10 above; §6 `:239-241`: add the history
    consequence of decision 4(1). `logs/FABLE_QUEUE.md:45`: DONE 6.10, this file.

## Not decided

1. **osek-patur.html's 2026 ceiling** (`osek-patur.json:3`, "verified against secondary sources only", `README.md:57`): a public
   figure resting on a 7.9 search-summary read. Not in this row; it fails the standard osek-zair holds itself to, and the main
   thread should queue it as its own row rather than let decision 1 appear to have blessed it.
2. **Other hosts' pre-30.9 captures** against a Disallow: the rule is given (1(1)); the site-by-site marking is fold 10(ii).
3. **The `copying` status of every site not named in decision 4(2)**, TikTok and Gumroad included: fold 10(i). Silence is `unread`.
4. **The repo public or private**, and whether public history is rewritten: the owner's decision (`CHANNEL_LOOP.md:239-241`),
   with one more consequence recorded (decision 4(1)).
5. **Whether a non-terms page may be rendered in js mode on a bot-managed host** once its terms allow a runner: the 29.9
   condition stands untouched.
6. **Whether wikisource, once `CONDITIONAL_MET`, may ever stand in for a primary text** on a product page: not by the loop
   alone; the primary-text rule stands, and corroboration beside a primary text is its only product use.

## Amendment 1 (6.10 ~16:45 UTC, tick 56, main thread): decision 4(3)'s artifact is not private on a public repository

**Finding.** The fold-9 builder stated, and the decider accepts from GitHub's REST documentation of the artifacts endpoints
(not fetched from this container: the egress proxy answered 403 for docs.github.com on 6.10), that anyone with read access
to a repository can download its workflow artifacts, and on a public repository every signed-in user has read access.
Decision 4(3)'s "private to the repository's collaborators" holds only for a private repository. An artifact holding a
copying-barred body is therefore a republication, less discoverable than a commit and for 90 days instead of forever, which
decision 4(1) does not permit.

**Decided.**

1. **Fold 9 merges as reviewed.** Its tree-side route (a meta with a `trimmed` block, an emptied text of the same line
   count, the commit-step guard) is what the one-time trim and the next weekly run depend on, and its upload step fires only
   when a run captures a `copying: barred` page.
2. **The upload step is removed in the next build, before the next scheduled weekly run (Tuesday 13.10, 05:23 UTC):**
   render-watch writes no artifact directory, and the `trimmed` block of a capture stored under the route says the body was
   not retained (its sha256, byte and line counts stay). Until that build lands, no dispatch names a line of apify.com,
   btl.gov.il or worksheets4kids.co.il, the three copying-barred sites whose lines are active; fold 8 (pausing those lines)
   stays undone, moot a second time, because the window holds no scheduled run.
3. **No secret is asked of the owner for an encrypted artifact.** The main thread never holds a secret, so an encrypted copy
   could be read by the owner alone and would serve no reading of the loop's.
4. **What a copying-barred site's weekly line yields after (2) is change detection by hash.** A build that keeps, at fetch
   time, only the lines a `urls.txt` line names by pattern, the quotation class decision 4(1) permits, is **fold 12**, Opus,
   queued in `CHANNEL_LOOP.md` §9 and not yet briefed.
5. **The builder's departures from the fold-9 brief**, as it reported them: (i) a body cited by line stays, trimmed to its
   cited lines ±2 at the same line count, since decision 4(1)'s "cited lines" reaches a body as it reaches a text — stands;
   (ii) a line that names a non-active capture keeps its bare `:N`, "line N" and `html:N`/`txt:N` citations too — stands;
   (iii) `indiebook.md:108`'s "in full (body :29-269)" kept as a citation of 245 of `indiebook-terms.txt`'s 298 lines —
   **does not stand**: a range longer than 20 lines is a statement that the text was read, which the sha256 already proves,
   not a quotation, and keeping it republishes most of a copying-barred page. The rule: a cited range longer than 20 lines
   keeps nothing, and the dry run lists it as `wide` with the citing line. The build of (2) adds the rule and runs the trim's
   second pass; the 6.10 pass keeps those 245 lines until then, a stated interim.


## Amendment 2 (7.10 ~05:10 UTC, tick 60, main thread): decision 3's once-only js render admits a nav-only shell

**Finding.** Decision 3(1) names kind K4 as a page `capture-check` classifies `js-shell`, and 3(2)(i) requires the plain
capture to be `js-shell`. adaptionlabs.ai's terms page (captured 6.10 by the weekly render: status 200, 51,664 bytes of
HTML, 85 characters of text, all navigation) is the same thing seen from the other side — a shell whose content a script
would load — but the classifier graded it `short`, so the route refused it (`logs/CHANNEL_LOOP.md` §9 "Queued 6.10 (tick
54)" item (5)).

**Decided.**

1. **A new kind, `nav-shell`,** for a 200 capture whose HTML is at least 20,000 bytes, whose text is below the short
   threshold and holds at least three non-empty lines of at most six words each, and whose HTML carries at least one
   anchor or script tag per ten characters of text (`scripts/capture-check.mjs`, tick 60; the rule classifies
   adaptionlabs.ai's terms page alone — frozen 7.10 as `terms-adaptionlabs-2026-10-06` before its js render — in the
   store of 657 captures, every other capture keeping its kind). It is checked after
   status, bot-challenge and js-shell and before short.
2. **Decision 3(2)(i) reads "is `js-shell` or `nav-shell` by `capture-check`";** the once-only js render, the freeze of
   the plain shell before it, and "whatever comes back is the answer" apply alike. The written comment names the kind.
3. **Thin margins are a stated limit, not a defect:** CrunchDAO's four competition pages are, to the eye, the same shape
   (a title over a five-label menu, 100+ scripts) and stay `short` only because their title line runs to seven words or
   more (datacrunch's is exactly seven, counting its "|"); Wunder Fund's quick-start page (one line of four words, 42
   scripts) stays `short` by the three-line condition; StreetLib's help pages by the tag ratio. A future capture of theirs
   that flips is read by the once-only route like any other, and a synthetic soft-404 with a menu would be graded
   `nav-shell` and refused later by the status that the js render returns.
