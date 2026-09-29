# Measurement: Astro Theme Catalogue, paid lane (BOARD-LOOP rank 7, ZERO-TESTS row 2)

**Date:** 2026-09-27
**Gate being tested** (`research/channel-loop/BOARD-LOOP.md:132`): "Admit only if ordering has a recency or random
lane (not stars/installs) and submission needs no human review conversation."
**What ZERO-TESTS row 2 asks** (`research/channel-loop/ZERO-TESTS.md:11`): "how the catalogue orders paid themes
(recency or popularity), and how many exist".

Grades: **RENDERED** means quoted from the capture, or computed from its bytes with `jq`/`python3`. **UNKNOWN** means
the capture does not answer it. Nothing here comes from general knowledge.

---

## 1. What was read

| File | What it is |
|---|---|
| `research/rendered/astro-themes-paid.json` | raw body, 541,741 bytes, read in full and parsed with `jq` and `python3` |
| `research/rendered/astro-themes-paid.meta.json` | fetch metadata |

From the `.meta.json`: `"url": "https://portal.astro.build/api/themes?price[]=paid"`, `"fetchedAt":
"2026-09-27T22:46:00.774Z"`, `"status": 200`, `"contentType": "application/json"`, `"truncated": false`,
`"sha256": "9bd8dc2dce8e3f28692a5ba66f97318b69500549e6b34eadb95a402e93a0f768"`, `"firstFetch": true`.

**Line numbers.** The JSON is a single line with no trailing newline (`wc -l` = 0). Every `grep -n` hit is therefore
`line 1`, so each quote below also gives its **byte offset** from `grep -n -b -o`, in the form `L1:b<offset>`.

**Not read, because it was not captured.** BOARD-LOOP.md:132 also asked for "the unfiltered listing". The only
Astro URL in `research/rendered/urls.txt` is the one at line 244 (`https://portal.astro.build/api/themes?price[]=paid
astro-themes-paid`), so the free lane cannot be compared here.

---

## 2. The questions

### Q1. How many paid themes are listed? **RENDERED: 638**

- The body is a bare JSON array (`jq type` = `"array"`) with **638 elements** and **638 distinct `Theme.id`**, so
  there is one row per theme.
- `"paid":true` appears 638 times and `"paid":false` appears 0 times, so the `price[]=paid` filter was honoured.
- The first element (`L1:b1`) begins `{"Theme":{"id":1651,"slug":"astro-mag"`, and the last ends
  `..."ThemeTool":{"id":10,"value":"tailwind","name":"Tailwind"}}]`.
- There is no total, page or next-page field in the body, and the meta says `"truncated": false`. Whether the API
  silently caps a response is **NOT ON THIS PAGE**, but 638 is the count this response returned.
- The field set also shows **110 distinct authors**. The four largest hold 221 of the 638 themes (34.6%): Lexington
  Themes 99, Themefisher 42, Noel 40 and Waida Studio 40. 50 authors have exactly one theme. Category counts
  (`ThemeCategory.name`, one per row): Landing Page 428, Blog 106, Portfolio 33, Other 26, E-commerce 15, Minimal 13,
  Docs 4, and null 13.

### Q2. What fields exist that could determine ordering? **RENDERED**

All keys present in the response, from `jq '[.[].X|keys]|flatten|unique'`:

| Object | Keys |
|---|---|
| top level | `Author`, `Theme`, `ThemeCategory`, `ThemeHasCategory`, `ThemeHasTool`, `ThemeTool` |
| `Theme` | `authorId`, `description`, `featured`, `id`, `image`, `paid`, `slug`, `title`, `updatedAt` |
| `Author` | `avatar`, `createdAt`, `id`, `name`, `url` |

- **Candidate ordering fields that exist:** `Theme.updatedAt`, `Theme.id`, `Theme.featured` and `Author.createdAt`.
- **Fields that do not exist.** The key-strings `"stars"`, `"popularity"`, `"views"`, `"installs"`, `"downloads"`,
  `"price":`, `"demoUrl"`, `"repoUrl"`, `"buyUrl"` and `"sort` occur 0 times. `Theme` has **no `createdAt`**: all 638
  occurrences of `createdAt` are inside `Author`.
- The word "popular" occurs once, inside a description, not as a field (`L1:b532942`): `"description":"The premium
  version of the popular Astro idol starter template..."`.
- There are **no stars and no popularity/install metric anywhere in the response**.

### Q3. Does the API response itself show an order? **RENDERED for the API; UNKNOWN for what the site displays**

**The first 10 entries.** There is no stars field to compare, so the comparison is dates and ids.

| pos | offset | `Theme.id` | slug | `updatedAt` | `featured` |
|---|---|---|---|---|---|
| 0 | L1:b1 | 1651 | astro-mag | 2026-09-26T03:45:42.867Z | false |
| 1 | L1:b801 | 1650 | bento-creative-studio-astro-theme | 2026-09-26T03:44:57.128Z | false |
| 2 | L1:b1672 | 1658 | mobi-launch | 2026-09-26T03:40:49.345Z | false |
| 3 | L1:b2500 | 1584 | arstudio-architecture-studio-astro-website-theme | 2026-09-26T03:39:57.737Z | false |
| 4 | L1:b3441 | 1693 | small-business-starter-pro | 2026-09-26T03:39:10.633Z | false |
| 5 | L1:b4316 | 1517 | brokerage-showcase | 2026-09-26T03:35:41.710Z | false |
| 6 | L1:b5167 | 1580 | orion-construction-architecture-website-template-for-astro | 2026-09-26T03:34:35.093Z | false |
| 7 | L1:b6196 | 1655 | strukta-architecture-interior-design-astro-theme | 2026-09-26T03:33:20.895Z | false |
| 8 | L1:b7137 | 1645 | mnc | 2026-09-26T03:32:34.493Z | false |
| 9 | L1:b8050 | 1628 | verdict-personal-injury-law-firm-website-template | 2026-09-26T03:30:37.273Z | false |

- `updatedAt` is **strictly descending** across the first 10 entries, all within a 15-minute window on 26.9.2026.
- `id` is **not** monotonic (1651, 1650, 1658, 1584, 1693, ...). Across the whole array, 315 adjacent pairs step up
  in id, so id is not the sort key.
- None of the first 10 is featured.

**The whole array** is five consecutive runs, each descending by `updatedAt`:

| run | positions | themes | break into the next run (quoted) |
|---|---|---|---|
| 1 | 0-512 | 513 | pos 512 `{"Theme":{"id":213,"slug":"quantum"...` `"updatedAt":"2024-03-24T20:05:07.105Z"` (L1:b433571) → pos 513 `{"Theme":{"id":1213,"slug":"neutral-minimal-personal-blog-theme"...` `"updatedAt":"2026-05-29T22:07:08.502Z"` (L1:b434362) |
| 2 | 513-588 | 76 | pos 588 `"id":251,"slug":"astro-resume-01"` `"updatedAt":"2024-04-09T12:48:25.964Z"` (L1:b500314) → pos 589 `"id":240,"slug":"agency01"` `"updatedAt":"2026-02-28T23:59:59.000Z"` (L1:b501065) |
| 3 | 589-628 | 40 | pos 628 `"id":453,"slug":"astrobrew-pro"` `"updatedAt":"2024-10-31T14:50:15.731Z"` (L1:b533784) → pos 629 `"id":52,"slug":"astroship-pro"` `"updatedAt":"2026-02-28T23:59:59.000Z"` (L1:b534637) |
| 4 | 629-636 | 8 | pos 636 `"id":261,"slug":"newslettr"` `"updatedAt":"2024-04-16T10:01:56.354Z"` (L1:b540061) → pos 637 |
| 5 | 637 | 1 | `"id":1586,"slug":"form-lab-gym-fitness-coaching-astro-theme"` `"updatedAt":"2026-09-26T01:45:47.281Z"` (L1:b540770) |

What this shows:

- **Within each run, the order is `updatedAt` descending.** Run 1 holds 513 of 638 themes (80%).
- The key that separates the runs is **not in the response.** No field listed in Q2 differs systematically between
  runs: all 3 featured themes are in run 1, and run 5 is a single 2026 theme after the 2024 ones. So the primary sort
  key is **UNKNOWN**. Its existence is RENDERED; what it is, is not.
- **`featured` does not put a theme on top.** `"featured":true` occurs 3 times, at positions 340, 444 and 450:
  - `{"Theme":{"id":541,"slug":"cosmic-themes-all-access","title":"Cosmic Themes All Access"` (L1:b297179)
  - `{"Theme":{"id":207,"slug":"lexington-themes-bundle","title":"Lexington Full Access: every Astro theme"`
    (L1:b380953)
  - `{"Theme":{"id":339,"slug":"themefisher-astro-bundle","title":"Astro Themes All-Access Pass"` (L1:b385476)
- **New themes sit at the top in practice.** The 20 highest ids (1687-1764) are all at positions 4-49. The newest,
  `{"Theme":{"id":1764,"slug":"orianna","title":"Orianna"` (L1:b13297), is at position 15 with `"updatedAt":
  "2026-09-26T03:21:11.212Z"`.
- **Old themes sit there too.** 42 of 638 themes carry an `updatedAt` on 2026-09-26 (positions 0-40, plus 637). They
  include low-id themes such as 1517 and 1580, so a recent `updatedAt` is not the same as a new theme.
- **Some timestamps look administrative.** 94 themes carry exactly `"updatedAt":"2026-03-01T00:00:00.000Z"` and 23
  carry exactly `"updatedAt":"2026-02-28T23:59:59.000Z"`. That identical midnight values were written in bulk is an
  observation about the values, not something the page states. What bumps `updatedAt` (an author edit, a re-review,
  a sync) is **NOT ON THIS PAGE**.
- **Whether the catalogue page shows this order is NOT ON THIS PAGE.** The request carried no sort parameter. The
  scout already recorded (from site source, not this capture) that the astro.build listing "excludes featured themes
  from the main grid" (`research/channel-loop/scouts.json:283`), so the page is not a plain dump of this array.

### Q4. Where do paid themes link to buy? **UNKNOWN (the field does not exist); author-URL hosts RENDERED**

- `Theme` has **no purchase, demo or repository URL**. Its only URL is `image`, and all 638 images are on
  `storage.googleapis.com`. The buy link is **NOT ON THIS PAGE**. It presumably lives on a per-theme detail
  endpoint that was not captured.
- The only author-supplied link is `Author.url`, the author's profile link, not a per-theme buy link. Counted per
  theme by host:

| `Author.url` host | themes | authors |
|---|---|---|
| null (`"url":null`) | 124 | 38 of 110 |
| Gumroad: `portfolios.gumroad.com` | 17 | 1 |
| Lemon Squeezy | 0 | 0 |
| Etsy: `luxothemes.etsy.com` | 3 | 1 |
| `github.com` | 7 | 2 |
| 68 other hosts (authors' own sites; largest `lexingtonthemes.com` 99, `themefisher.com` 42, `noel.marketing` 40, `waidastudio.com` 40, `aerolaunch.app` 24) | 487 | rest |
| **total** | **638** | 110 |

- **Raw-string counts across the whole file:** `gumroad` 17, and all 17 are that `Author.url` value (for example
  L1:b1261 `"url":"https://portfolios.gumroad.com","name":"Portfolios"`). `lemonsqueezy` 0, `lemon` 0, `polar.sh` 0,
  `paddle` 0.
- **A Gumroad seller already ranks at position 1.** `{"Theme":{"id":1650,"slug":"bento-creative-studio-astro-theme"`
  (L1:b801) is by the author whose `Author.url` is `https://portfolios.gumroad.com`.
- **Two descriptions state a price** (the only `$<digit>` hits):
  - L1:b138966: `"Get 32 production-ready Astro 7 themes, every future release, lifetime updates, unlimited personal and
    client use, and a visual builder. One $199 payment."`
  - L1:b381070: `"Every Astro v7 + Tailwind theme, with Sanity and EmDash. New themes included, $99 once. NEW Lexington
    MCP."`

### Q5. Any sign of a submission process in the data? **UNKNOWN (NOT ON THIS PAGE)**

- **No field describes status, review or submission.** `status` 0 and `approved` 0 as strings. `submit` occurs once,
  inside a theme description: `...a working booking form ready to connect with services like Formsubmit.`
  (L1:b481097, match at b481213).
- **Author avatars.** 109 of the 110 distinct `Author` records have an `avatar` on `avatars.githubusercontent.com`,
  and the remaining one is on `lexingtonthemes.com`. That is consistent with authors being GitHub-linked accounts,
  but the capture does not say how authors sign in, and says nothing about human review. Grade UNKNOWN.
- `Author.createdAt` exists (for example `"createdAt":"2024-04-01T09:59:42.000Z"` for the first theme's author).
  That shows authors are accounts. It does not show what creating one requires.

---

## 3. Verdict for the board: **NEEDS_MORE**

**What this capture settles:**

- **The paid lane is real and sizeable: 638 themes, 110 authors.**
- **Its API has no stars, installs or popularity field.** The popularity-ordering kill condition (BOARD-LOOP.md:134,
  "Catalogue ordering is popularity-based with no lane a new theme can enter") has no field to act on in this
  response.
- **The API's own order is `updatedAt` descending within an unexposed primary grouping.** 80% of the paid themes sit
  in the first group, and the 20 newest ids are all in the top 50. That is recency-shaped, which is what the gate
  wants.
- **A Gumroad-linked seller already ranks at position 1.**

**What it does not settle, each a gate condition:**

1. **Is this the order a visitor sees?** And what is the hidden key that splits the five runs? The site re-sorts or
   filters at least the featured themes (scouts.json:283, from source, not this capture).
2. **Does submission need a human review conversation, and how do authors sign in?** Nothing in the data says.
3. **Is there a per-theme buy URL, and may it point to Gumroad?** Not a field here.

**Which page would settle it.** The capture names no further URL. The following come from the scout's reading of
astro.build's source (`research/channel-loop/scouts.json:280,283`), **not** from this capture:

- `https://github.com/withastro/astro.build/blob/main/src/pages/themes/[page].astro`: the grid's sort and filter
  (the scout cites lines 64 and 80-88). This settles item 1 and is reachable from this container, because GitHub is
  not blocked.
- `https://github.com/withastro/astro.build/blob/main/src/pages/themes/submit/index.astro`: the submit page, which
  the scout places at `portal.astro.build/themes/submit`. This settles item 2 (sign-in method and review) and is
  also on GitHub.
- For item 3, one theme's detail record on portal.astro.build, fetched by render-watch. Its exact path is not in
  this capture; read it from the same repo's `src/pages/themes/` before adding it to `urls.txt`.

A recency gate reading that relies on `updatedAt` should also note that 42 themes, old ones included, were re-stamped
on 26.9.2026. Any edit may therefore re-surface a theme. That helps a new seller as much as an incumbent. It is an
inference, and it is flagged as such.

---

## 4. What the owner would have to do if admitted, and what it costs

**One-time, all existing steps** (BOARD-LOOP.md:133: "None beyond existing steps 2, 3, 6b (GUMROAD_ACCESS_TOKEN), 7
(demo repo under the brand), optionally 5 for the demo domain"):

- **Step 3: the Gumroad seller account.** Gumroad's cut is taken from the buyer's money, and MISSION.md:351-352 says
  that is "not the owner paying". Cost: ₪0.
- **Step 6b: the `GUMROAD_ACCESS_TOKEN` secret.** Cost: ₪0.
- **Step 7: the brand GitHub organisation for the demo repo.** Cost: ₪0.
- **Step 5 (domain): frozen under the ₪0 rule** (MISSION.md:346-347). The demo runs on `*.netlify.app` instead.
  Cost: ₪0.
- **Step 2 (tax file and Bituach Leumi):** asked only "when a paid product is ready" (MISSION.md:348-349). **This is
  the one possible owner cost, and it is not settled:** ZERO-TESTS rows 7-9 are measuring it. Their snippet-grade
  figure (ZERO-TESTS.md:21-23) is not a rendered fact.

**Recurring:**

- **Per-theme submission.** Whether each new theme needs an owner click or a human review conversation is
  **UNKNOWN** (Q5). If it does, that is the recurring owner work MISSION forbids, and the line dies on KILL-4.
- **Featured placement.** The 3 `featured:true` rows are all large sellers' bundles. The scout attributes featured
  slots to a recurring Open Collective "Theme Sponsor" payment (scouts.json:283), which is forbidden
  (MISSION.md:264-266). **Do not buy it.** This capture also shows featured status does not lift a theme to the top
  of the API order.

**Money:** the capture shows **no listing fee field** and no price field. Whether listing costs anything is **NOT ON
THIS PAGE**. On present evidence, nothing in this lane requires the owner to pay first.

---

## 29.9 (GitHub read)

**Date:** 2026-09-29, fetched 03:18-03:24 UTC. **Reader:** Opus subagent, no git, no edits outside this section.
**Question (loop row 7):** how themes are submitted (G3), what a paid theme and its seller must show (G2, G7), how the
catalogue orders and features themes, any AI rule (G4), and whether the catalogue brings buyers (G5).

**Grades in this section.** **github** = the platform's own source or its own GitHub issues, read from GitHub.
Two sub-kinds: *raw* (bytes fetched from `raw.githubusercontent.com` with curl; the quotes are exact and carry line
numbers) and *webfetch* (a `github.com` page read through WebFetch, which returns converted text; wording that it
gave inside quotation marks is reproduced below, but a runner render should re-check it before anyone relies on
the exact words). **rendered** = computed from `research/rendered/astro-themes-paid.json` (27.9), cited as `L1:b<offset>`.
**snippet** = the one WebSearch. **repo** = this repo's earlier research. **none** = inference, flagged as such.

### A. What was read (exact URLs)

*Raw source, `withastro/astro.build` branch `main` (github/raw; 12-hex prefix of sha256, line count):*

| URL | sha256[:12] | lines |
|---|---|---|
| https://raw.githubusercontent.com/withastro/astro.build/main/src/pages/themes/%5Bpage%5D.astro | 5364d383cd2d | 156 |
| https://raw.githubusercontent.com/withastro/astro.build/main/src/pages/themes/index.astro | 1530fe117074 | 242 |
| https://raw.githubusercontent.com/withastro/astro.build/main/src/pages/themes/submit/index.astro | 49101d76729d | 3 |
| https://raw.githubusercontent.com/withastro/astro.build/main/src/pages/themes/details/%5Bslug%5D.astro | 72f73644fa1d | 110 |
| https://raw.githubusercontent.com/withastro/astro.build/main/src/pages/themes/author/%5Bid%5D/%5B...page%5D.astro | cfc0ebfb702c | 84 |
| https://raw.githubusercontent.com/withastro/astro.build/main/src/pages/themes/_components/ThemeCTAs.astro | 218810d8dbf2 | 75 |
| https://raw.githubusercontent.com/withastro/astro.build/main/src/pages/themes/_components/SubmitTheme.astro | c66c2e5a2809 | 22 |
| https://raw.githubusercontent.com/withastro/astro.build/main/src/pages/themes/_components/ThemeStats.astro | 5289c3ca2464 | 59 |
| https://raw.githubusercontent.com/withastro/astro.build/main/src/pages/themes/_components/ThemeCard.astro | ac6b44f735c9 | 57 |
| https://raw.githubusercontent.com/withastro/astro.build/main/src/pages/themes/_components/Avatar.astro | d512634c095e | 22 |
| https://raw.githubusercontent.com/withastro/astro.build/main/src/pages/themes/_components/ThemeAuthorProfile.astro | 242b0a7b784a | 51 |
| https://raw.githubusercontent.com/withastro/astro.build/main/src/pages/themes/_types/index.ts | b46cabdca9cf | 57 |
| https://raw.githubusercontent.com/withastro/astro.build/main/src/helpers/constants.ts | eb2242588c39 | 1 |
| https://raw.githubusercontent.com/withastro/astro.build/main/src/helpers/themes.ts | ca87ff08bc9a | 37 |
| https://raw.githubusercontent.com/withastro/astro.build/main/src/content/blog/themes-catalog-updates.mdx | 64e120d15241 | 76 |
| https://raw.githubusercontent.com/withastro/astro.build/main/src/content/pages/partnerships.mdx | 4f872cf5f4cd | 197 |
| https://raw.githubusercontent.com/withastro/astro.build/main/src/content/pages/terms.md | 4ec568210614 | 113 |

(Two guessed paths returned 404: `src/pages/themes/author/[id].astro` and `.../author/[id]/index.astro`. The GitHub
REST API, `codeload.github.com` and curl of `github.com` HTML returned 403 from this container, so no commit SHA is
recorded; the hashes above pin the bytes read.)

*github.com pages through WebFetch (github/webfetch):*
https://github.com/withastro/astro.build/tree/main/src/pages/themes ·
https://github.com/withastro/astro.build/tree/main/src/pages/themes/details ·
https://github.com/withastro/astro.build/tree/main/src/pages/themes/_components ·
https://github.com/withastro/astro.build/tree/main/src/pages/themes/author/%5Bid%5D ·
https://github.com/withastro/astro.build/tree/main/src/content/pages ·
https://github.com/withastro/astro.build/tree/main/src/helpers ·
https://github.com/orgs/withastro/repositories?q=portal ·
https://github.com/orgs/withastro/repositories?q=theme ·
https://github.com/withastro/astro.build/issues?q=is%3Aissue+theme+portal ·
https://github.com/withastro/astro.build/issues?q=is%3Aissue+theme+approved ·
https://github.com/withastro/astro.build/issues?q=is%3Aissue+theme+review ·
https://github.com/withastro/astro.build/issues?q=is%3Aissue+themes+AI ·
https://github.com/withastro/astro.build/issues/1178 ·
https://github.com/withastro/astro.build/issues/1226 ·
https://github.com/withastro/astro.build/issues/2387 ·
https://github.com/withastro/astro.build/issues/2390 ·
https://github.com/withastro/astro.build/commits/main/src/pages/themes/%5Bpage%5D.astro ·
https://github.com/withastro/astro.build/pull/1477 (its description failed to load) ·
https://github.com/MauCariApa-com/bloodstone/issues/1 ·
https://github.com/njbSaab/astro-njx-store/issues/1 ·
https://github.com/ashleycanva/stratum-free/issues/1 ·
https://github.com/mearashadowfax/DomusPicturae/issues/2

*The one WebSearch (snippet):* query `portal.astro.build submit theme review approved paid theme guidelines`.
Result URLs: https://hackmd.io/@sarah11918/BJMjDSMDZl ("Astro Theme Catalogue Review Guidelines - HackMD") ·
https://github.com/MauCariApa-com/bloodstone/issues/1 · https://github.com/njbSaab/astro-njx-store/issues/1 ·
https://github.com/ashleycanva/stratum-free/issues/1 · https://github.com/agnilem/parley-astro/issues/1 ·
https://github.com/njbSaab/astro-njx-saas/issues/1 · https://github.com/qubit-rider/astro-blog-starter/issues/1 ·
https://github.com/Angeloamenta/PReload-astro-theme/issues/1 · https://github.com/mearashadowfax/DomusPicturae/issues/2.
The HackMD pages were **not read** (not a GitHub host); they are the first render below.

**The portal's own source is not public.** `withastro` has no repository matching "portal" ("No repositories matched
your search", github/webfetch). The catalogue API, the submit form and the review queue all live on
`portal.astro.build`; `astro.build` only reads it: `export const THEMES_API_URL = import.meta.env.THEMES_API_URL ??
'https://portal.astro.build';` (`constants.ts:1`).

### B. Submission (G3)

- **A web form on the portal, not a PR or an API.** `return Astro.redirect('https://portal.astro.build/themes/submit');`
  (`submit/index.astro:2`). The sidebar: `Anyone can submit a theme to Astro.` with `cta={{ href:
  'https://portal.astro.build', text: 'Submit theme' }}` (`SubmitTheme.astro:13,16`). The 2022 announcement: `Gone are
  the days of filling out GitHub issue templates. The new submission form makes it simple to upload multiple preview
  images, select the tools used in your theme, and even includes a rich text editor for writing the full description of
  your theme.` (`themes-catalog-updates.mdx:60`). github/raw.
- **Sign-in is GitHub OAuth.** Issue #1178's title: `[GitHub OAuth Error on Astro Dev Portal] Unable to login to submit
  theme`; its body quotes the OAuth error `The redirect_uri MUST match the registered callback URL for this application`.
  The Author record carries GitHub identity: `githubId: number;` `username: string;` (`_types/index.ts:41-42`), and
  27.9's capture has 109 of 110 avatars on `avatars.githubusercontent.com` (rendered, §Q5 above). github/webfetch + raw.
- **Every theme is reviewed by a person, and every edit is re-reviewed.** The Theme type has `approved: boolean;`
  `denied: boolean;` `hidden: boolean;` (`_types/index.ts:25-27`, github/raw). Rejections arrive as a GitHub issue
  opened on the theme's own repository by an Astro maintainer's account (four read, all dated 18 Sep 2026). Shared
  wording (github/webfetch): `I just wanted to let you know why your theme was not approved for the Astro theme
  directory so you can make the changes and resubmit!` and `When you update and save your listing in the developer
  portal, your theme will automatically be re-submitted for review. Even if your site description requires no change,
  making a minor change and saving will trigger the submission process again, so you can just add/remove a blank line if
  necessary.` The reasons are numbered (`2.`, `3.`, `10.` appear), so a numbered checklist exists; it lives at
  `https://hackmd.io/@sarah11918/categories/astro-themes` (quoted in each issue), unread.
- **No write API is visible.** The public source calls only GET endpoints: `/api/themes/tools` (`[page].astro:29`),
  `/api/themes?${Astro.url.searchParams}` (`:83`), `/api/themes/featured` (`index.astro:37`),
  `/api/themes/details?slug=` (`details/[slug].astro:19`), `/api/themes/related?slug=` (`:26`),
  `/api/themes/author?id=` (`author/[id]/[...page].astro:27`) and `/api/themes/generate-checkout?themeId=`
  (`ThemeCTAs.astro:18`). Whether the portal has a token API for authors: **UNKNOWN** (source not public).
- **Terms.** `src/content/pages/terms.md` has no AI, agent or automation rule for posting (grep for `AI`, `artificial`,
  `machine`, `generated`, `bot`: 0 hits). Its only robot clause is about taking data out: `(iii) using any data mining,
  robots or similar data gathering or extraction methods` (`terms.md:65`). It forbids `Impersonate or post on behalf of
  any person or entity or otherwise misrepresent your affiliation` (`terms.md:56`) and `Mass or repeated promotions`
  (`terms.md:49`). github/raw.

### C. What a paid theme and its seller must show (G2, G7)

- **The buy button links out to whatever URL the author gives.** For a paid theme not sold through the portal:
  `theme.Theme.paid && theme.Theme.repoUrl && ( <a href={theme.Theme.repoUrl} ...` with the label
  `{theme.Theme.price > 0 ? `$${theme.Theme.price / 100} - ` : null} Buy now` (`ThemeCTAs.astro:30-40`). So the
  Gumroad product URL goes in the repository-URL field, and the price, if entered, shows on the button. The blog:
  `Whether a theme author uses [Gumroad](https://gumroad.com/) or sells on their own site, our catalog makes it easier to
  share your theme and have Astro users discover it.` (`themes-catalog-updates.mdx:49`). github/raw.
- **A second, Astro-run checkout exists.** `{theme.Theme.sellingThroughPortal ? ( <a href={new
  URL(`${THEMES_API_URL}/api/themes/generate-checkout?themeId=${theme.Theme.id}`)}` (`ThemeCTAs.astro:16-18`), with
  `stripeProductId?: string;` `stripePriceId?: string;` (`_types/index.ts:30-31`). This is a Stripe checkout run by
  the portal. How it pays authors is **UNKNOWN**. Israel is not a Stripe account country and Connect cross-border
  payouts exclude it (`research/measurements/stripe-israel.md`, rendered), so **the colony must use the Gumroad link path, not this one** (inference).
- **Links are nofollow.** `const linkRel = isOfficial ? undefined : 'nofollow ugc';` (`ThemeCTAs.astro:12`); the
  description sanitiser adds `rel="nofollow ugc"` to every non-Astro link (`themes.ts:34-35`). A listing gives no search
  ranking to the Gumroad page. github/raw.
- **The public name is `Author.name` and an avatar.** The card shows `src={theme.Author.avatar}` and
  `{theme.Author.name}` (`Avatar.astro:14,21`). The author page shows avatar, name, `Joined`, and `Website` =
  `author.url` (`ThemeAuthorProfile.astro:22-47`) and titles itself `Themes by ${author}` (`author/[id]/[...page].astro:51`).
  `githubId`, `username` and `email` exist on the record (`_types/index.ts:38-42`) but none of the components read
  displays them. github/raw. **A business name with its own avatar is accepted:** author 39 is `"name":"Lexington
  Themes"` with `"avatar":"https://lexingtonthemes.com/images/favicons/apple-touch-icon.png"` (rendered, L1:b27910).
  Whether the name is typed in the portal or copied from the GitHub profile that signs in: **UNKNOWN**.
- **Content rules on the demo** (github/webfetch, the 18.9 rejection issues): `The theme catalogue must not include any
  personalized or real-world content.`; `if a company marketing site, must not contain any information about a real
  company.`; `**Only use `example.com` for placeholder URLs and email addresses**`; and one issue asks to `upgrade your
  theme to Astro 7`. The snippet adds `New themes must use the current major version of Astro` and a README rule
  (snippet). None of these touches the seller's legal name.

### D. How the catalogue orders and features themes

- **The grid shows the API's order untouched, minus featured themes, 18 per page:** `data: allThemes.filter((theme) =>
  !theme.Theme.featured), pageSize: 18,` (`[page].astro:88-89`). There is no client-side sort. github/raw. So the
  27.9 reading (updatedAt descending inside runs, rendered) **is** what a visitor sees under the Paid filter, minus the
  3 featured rows: 635 themes on about 36 pages. (The commit list names "Update to 24 themes per page (#1497)", April
  2025, but the current file says 18; the file wins.)
- **The hidden run key is probably a field the list endpoint strips.** The type declares `stars: number;`
  `publishDate: Date;` `price: number;` `sellingThroughPortal: boolean;` (`_types/index.ts:22-29`), none of which
  appears in the 27.9 list response (rendered §Q2). Which one splits the five runs is **UNKNOWN** (none).
- **Featured = sponsors, shuffled, on the landing page only.** `tagline: 'Professional themes designed and developed by
  our sponsors'`, fetched from `/api/themes/featured` and `.sort(() => Math.random() - 0.5,)` (`index.astro:34-39`);
  the footer CTA is `'Become a theme sponsor'` → `https://opencollective.com/astrodotbuild/contribute/theme-sponsor-86430`
  (`index.astro:45-46`); `you can donate to Astro's Open Collective as a Theme Sponsor, and designate one or more of your
  themes to be listed on our main themes page` (`partnerships.mdx:123`). Paid placement: forbidden under ₪0 and
  MISSION.md:264-266, as before.
- **Does updatedAt reward frequent updates?** Mechanically, probably yes. The reviewer's text says any save
  re-submits for review (github/webfetch, above). The capture's September stamps come in clusters (rendered, computed
  29.9): 4.9 5 themes/3 authors in 10 min; 9.9 17 themes/**1** author in 19 min; 18.9 9 themes/3 authors in 10 min;
  26.9 **42 themes from 35 authors between 01:39 and 03:45 UTC**, and 18 of the 20 newest ids carry a 26.9 stamp. That
  many authors in one two-hour window fits a reviewer approving a queue, not 35 people each editing at night.
  Reading: approval (and perhaps the author's save) rewrites `updatedAt` and floats the theme to page 1 (none, an
  inference from timing). The 18.9 cluster matches the date of the four rejection issues.
- **Would exploiting it be honest? No.** A cosmetic save exists only to jump the order. It also spends a
  maintainer's review time and signals "recently updated" to buyers when nothing changed. That fails G4, and it is
  close to the terms' `Mass or repeated promotions` (`terms.md:49`). **Rule for the colony:** re-save a listing only
  when a real release ships (an Astro major upgrade, which the review requires anyway, or new page templates). One
  save per release, with the change named in the listing body. The honest version still gets some visibility, because
  Astro majors force real updates.
- **Visibility half-life (none, arithmetic on rendered counts).** 73 paid themes were re-stamped in September's four
  clusters, 42 of them on one night. A new theme on paid page 1 (18 slots) can be pushed to page 3 by a single batch.

### E. AI rule (G4)

- **No AI rule in the site source or terms** (grep, github/raw). The unread HackMD checklist might contain one
  (UNKNOWN).
- **Approved paid listings already advertise AI-built work** (rendered): `built AI-first with AGENTS.md and Claude Code
  workflows` (slug `apex-ai-first-astro-6-saas-template`, L1:b318525), and `built AI-first — ships with a documented
  design system and component guide so AI coding tools like Claude Code, Cursor, Antigravity...` (slug `sidrano`,
  L1:b115586). A plain "built by AI agents under the brand" line in the listing body would sit among these.

### F. Buyers (G5)

- The only statement is Astro's own claim: `The [Astro Theme Catalogue](/themes/) is often the first stop for visitors
  looking to get up and running with a pre-made Astro site quickly.` (`partnerships.mdx:121`, github/raw, a
  self-claim; its "over 500 free and paid options" is already stale against the 638 paid rows alone).
- Astro tracks buy clicks (`data-analytics-event="PDDOCXCA:1"`, `ThemeCTAs.astro:20,35`, sent to Fathom at `:66-71`),
  but no figure is public. **No sales, click or visitor number exists in anything read.** Sellers keep adding stock
  (Lexington 99 themes, AeroLaunch 24; rendered), which hints that someone sells (none).
- Bundles undercut single themes: `One $199 payment.` (L1:b138966) and `$99 once.` (L1:b381070) for all-access passes
  (rendered, 27.9).

### G. Gates

| Gate | Status | Grade | Evidence |
|---|---|---|---|
| G1 ₪0 up front | **PASS** | github | `Anyone can submit a theme to Astro.` (`SubmitTheme.astro:16`). No listing fee appears in the site source or the Theme type. The only paid thing is the optional sponsor slot, which the colony will not buy. The portal form's own pages are unread. |
| G2 Israeli individual, no camera | **PASS** (via Gumroad link) | github + repo | The catalogue pays nothing on the link path (`ThemeCTAs.astro:30-40`). Gumroad pays ILS with no camera step found (repo; github by absence, `research/breadth/BREADTH-SWEEP.md:175`). The portal's Stripe checkout path is excluded (Israel is not a Stripe country, `stripe-israel.md`, rendered). |
| G3 list without per-item owner click; terms allow agents | **UNKNOWN, leaning FAIL** | github | Terms half: **PASS** (no agent or AI bar; `terms.md:49,56,65`). Listing half: submission is a GitHub-OAuth web form with image uploads and a rich-text editor. Every theme and every edit goes through human review, and no write API is visible. A runner can do it only by driving a browser login on a brand GitHub *user* account, which nobody has proposed or tested. |
| G4 honest value, AI declared | **UNKNOWN** (venue half PASS) | github + rendered | No AI rule. Peers openly list AI-first builds (L1:b318525, L1:b115586). The value half needs a named differentiator (§H). The editorial rules (generic demo, example.com, current Astro major) are compatible. |
| G5 venue brings buyers | **UNKNOWN** | github (self-claim) | "first stop for visitors" is Astro's claim; no numbers. Links are nofollow. A new listing's page-1 time is days, not weeks (§D). |
| G6 one owner step unlocks many | **UNKNOWN, leaning FAIL** | github | Steps 3/6b/7 already exist. Each theme then needs a portal form session, plus another save after any rejection, unless G3's runner path exists. |
| G7 brand the only public name | **UNKNOWN, leaning PASS** | github + rendered | Only `Author.name`, avatar, Joined and Website are shown. A business name with its own avatar is live (L1:b27910). Unknown: whether the portal lets the name differ from the signing-in GitHub profile, and whether the owner's personal GitHub would be the one signing in. |

### H. Fit, and what it would cost

- **No colony product fits as-is.** Nothing in `products/` is an Astro theme. `il-biz-tools` is plain HTML with real
  Israeli business content, and the catalogue bars real-world content in demos.
- **The honest new item:** a **Hebrew-first, RTL Astro 7 theme** for small service businesses (clinic, accountant,
  studio). It would have logical-property CSS, an OFL Hebrew font stack, a he/en switch, and a generic accessibility-
  statement page template. Every contact is `example.com`. It must pass Lighthouse and axe cleanly, and state in the
  listing body that it was built by AI agents under the brand. **Why it is honest value:** of the 638 paid themes,
  **0** mention Hebrew and **1** mentions RTL (`Bilingual (EN/AR + RTL) Astro 7 theme for dermatology...`, slug
  `dermica-dermatology-aesthetics-clinic-theme`, L1:b124944; rendered). The free lane was not captured, so "free
  nowhere" is still unproven. **The trade:** the niche is unique but small, which makes G5 weaker still.
- **Build cost:** about **30-45 agent-hours** (≈4-6 agent-days, inside BOARD-LOOP's 4-7), ₪0. It reuses il-biz-tools'
  RTL markup (`dir="rtl"` on every page) and its accessibility-page pattern. After that, one real upgrade per Astro
  major (agent work, not owner work).
- **Owner time per theme if G3 fails:** one portal session per theme and per rejection, estimated 10-15 min (none).
  That is recurring owner work, KILL-4.

### I. Verdict: **NEEDS_MORE** (leaning KILL-PROPOSED on G3/G6)

GitHub settled the display order (the API order, featured removed, 18 per page), the buy path (any URL, so Gumroad
works), the review (human, per theme, per edit) and the terms (no AI or agent bar). It did not settle the one gate
that decides the line: **can the colony submit without the owner's hands?** The portal's source is not public.

**Pre-registered kill.** KILL-PROPOSED if the renders below show that submission is only the GitHub-OAuth form (no
author token or API), **or** that a paid theme needs something per theme that only a person can give (reviewer
access to paid code, a call, an identity check). In either case every theme is an owner session, so G3, G6 and
KILL-4 fail. **Queue on** only if a token or API route exists, or the board rules that a runner-driven login on a
brand GitHub user account is allowed. Even then, build only after the owner has opened Gumroad (BBU rule, unchanged).

### J. Next render URLs (runner, render-watch)

1. https://hackmd.io/@sarah11918/categories/astro-themes — the numbered review checklist (paid-theme rules, any AI
   rule, any per-theme requirement).
2. https://hackmd.io/@sarah11918/BJMjDSMDZl — "Astro Theme Catalogue Review Guidelines".
3. https://portal.astro.build/themes/submit — the form's fields and sign-in wall (is there anything besides GitHub OAuth?).
4. https://portal.astro.build/ — portal landing (author docs, any API or token mention).
5. https://portal.astro.build/api/themes/details?slug=bento-creative-studio-astro-theme — the Gumroad-linked seller's
   detail record: `repoUrl`/`buyUrl`/`price`/`stars`/`publishDate`/`sellingThroughPortal` (confirms the Gumroad link
   sits in `repoUrl`; may reveal the hidden run key).
6. https://portal.astro.build/api/themes — the unfiltered listing (27.9's unmet ask; free-lane Hebrew/RTL count).
7. https://portal.astro.build/api/themes/featured — the sponsor set.
8. https://astro.build/themes/1/?price%5B%5D=paid — a rendered page 1, to confirm on the page itself that display
   order equals API order minus featured.

---

## Tick 15 (rows 150-152 render)

**Read 29.9.2026 by an Opus reader.** Render commit `033f044`, fetchedAt 2026-09-29T03:53Z. All three captures returned
200. Short names: `GL` = `research/rendered/astro-themes-guidelines-hackmd` (row 150), `CAT` =
`…/astro-themes-categories-hackmd` (row 151), `SUB` = `…/astro-portal-themes-submit` (row 152). All three txt files were
read in full (GL 290 lines, CAT 173, SUB 35). The html files were grepped. Every quote below was checked with
`grep -n -F`.

**Status: KILL-PROPOSED on G3/G6.** Of the two pre-registered kill clauses (§I), clause 1 fires and clause 2 does not.

### What was captured
- **GL is the reviewers' guide, read in full.** Its title is `Astro Theme Catalogue Review Guidelines - HackMD`
  (GL.txt:1). It holds the numbered rejection reasons that the 18.9 issues cite (GL.txt:109-229). The author-facing guide
  is a separate note, not read: `Please also see the [Guide for Submissions](/J8pD89rBRsKckhxUZYQrGQ)` (GL.txt:113).
- **CAT did not render.** The note list is built in the browser. The text is HackMD modal chrome, for example
  `This template is not available.` (CAT.txt:9), and `Astro` occurs 0 times in CAT.html. Nothing is lost, because GL
  holds the checklist.
- **SUB served the portal's login page, not the form:** `<link rel="canonical" href="https://localhost:4321/login/">`
  (SUB.html:1).

### What the guidelines require
**Of every theme:**
- **A demo.** `We require that all themes contain a demo.` (GL.txt:48)
  - `The demo is a live, working deployment of the theme's repo (exactly as a new user will get when they start with the
    theme)` (GL.txt:13).
  - `The demo must be deployed at a domain that indicates that this site is clearly a generic theme, and must not be a
    person or organization's own site.` (GL.txt:213).
- **The current Astro major.** `we can only accept new themes using the current major version of Astro.` (GL.txt:115)
- **A listing in English, with images in any language.**
  - `Only static screenshots can be included in your listing.` (GL.txt:140).
  - `Your description must be in English` (GL.txt:169).
  - `Your images do not need to show English text.` (GL.txt:175).
  - `Your GitHub repo README does not need to be in English.` (GL.txt:176).
  - For the Hebrew RTL candidate (§H): the listing text is written in English, and the demo can stay in Hebrew.
- **Generic content only.**
  - `**Only use `example.com` for placeholder URLs and email addresses**.` (GL.txt:191).
  - `you must explicitly offer a generic template and guidance on how to use it` (GL.txt:215).
- **A low editorial bar.**
  - `The quality of the description text or images is not a consideration.` (GL.txt:33).
  - Reviewers are `not responsible for using additional tools to check accessibility` (GL.txt:57).

**Of paid themes:**
- **The buy link can be a payment page, and Gumroad is named.**
  - `The "Get Started" link points to the theme's open source repository or to a payment page for that theme`
    (GL.txt:15).
  - `If you are submitting a Gumroad payment link, please do not include paramaters such as `?wanted=true`.`
    (GL.txt:224). The reviewers name the Gumroad path themselves.
- **No access to the paid code is asked for.** The Astro version is checked from outside: `This may be possible to
  determine for paid themes using https://isAstro.pages.dev or looking for the generator meta tag in the page source.`
  (GL.txt:21).
- **A rejection is written into the paid listing itself.**
  - `## Template for Editing a paid theme's description` (GL.txt:247) and `YOUR THEME WAS NOT ACCEPTED. (REASON #10)`
    (GL.txt:249).
  - Otherwise the reviewer will `use the contact information on a paid theme if it exists` (GL.txt:63).
  - So the seller learns of a rejection only by logging in, or through the contact line on the listing.

**Of the author:** nothing about identity, legal name, payment, a call or a signature. These terms have 0 hits in GL.txt:
`token`, `API`, `CLI`, `pull request`, `identity`, `Stripe`, `price`.

### AI rule
There is one AI mention in GL, and it permits: `Machine/AI translations are OK!` (GL.txt:173). There is no rule on
AI-built themes or on agent-run accounts. The site terms have none either (§29.9 B).

### Is the submit page only a GitHub-OAuth form? **Yes, in every capture.**
- **The login wall offers GitHub and nothing else.**
  - `To submit themes, you have to be logged in.` (SUB.txt:9).
  - One button, `Sign in with GitHub` (SUB.txt:11), which is `<a href="/login/github/" class="button">` (SUB.html:7).
    SUB.html has one `class="button"` in total.
  - SUB.html has 0 hits for `api`, `token`, `oauth`, `password` and `email`.
- **The portal is where themes are created and edited:** `The Astro Dev Portal, the place to submit, create and update
  your themes for Astro.` (SUB.html:1).
- **Every fix in GL goes through that login.**
  - `Please log into https://portal.astro.build/` (GL.txt:123, 131, 142, 151, 171, 221).
  - `When you update and save your listing in the developer portal, your theme will automatically be re-submitted for
    review.` (GL.txt:101, 241).
- **Residual:** neither the logged-in form nor the portal root was seen. A token API there is not ruled out. It is
  only absent from three captures and from the site source (§29.9 B).

### Anything only a person can give? **Not per theme.**
- **No ID check, call, signature, fee or code access.**
- **Everything asked is agent work:** a demo deployment, static screenshots, English text, example.com content, a README,
  and the current Astro major.
- **The one human-bound item is the GitHub user session above.** It is needed once per theme and once per rejection fix
  (GL.txt:101).

### Kill verdict: **FIRES** (clause 1), **DOES NOT FIRE** (clause 2)
- **Clause 1 fires:** "submission is only the GitHub-OAuth form (no author token or API)". The sign-in wall is rendered
  grade. The missing token API is absence only.
- **Clause 2 does not fire:** "a paid theme needs something per theme that only a person can give". Nothing like that
  is in GL or SUB.

### Gates (changes from §G)
| Gate | Status | Grade | Evidence |
|---|---|---|---|
| G1 ₪0 up front | **PASS** (unchanged) | github + rendered | No fee or price appears in GL or SUB. |
| G2 Israeli individual, no camera | **PASS** (via Gumroad link), link half now **rendered** | rendered + repo | GL.txt:15 and :224. Gumroad's side is unchanged (repo). |
| G3 list without per-item owner click | **FAIL** (listing half); terms half PASS | rendered | The only route is a portal session behind `Sign in with GitHub` (SUB.txt:9, :11). |
| G4 honest value, AI declared | venue half **PASS, rendered**; value half UNKNOWN | rendered | GL.txt:173 and :33. |
| G5 venue brings buyers | **UNKNOWN** (unchanged) | none | Nothing in the captures. |
| G6 one owner step unlocks many | **FAIL** | rendered | Each theme needs a GitHub-login session, and so does each rejection fix (GL.txt:101). |
| G7 brand the only public name | **UNKNOWN, leaning PASS** (unchanged) | rendered | GL asks nothing about the author's identity. The demo domain must be generic (GL.txt:213). |

### Verdict: **KILL-PROPOSED** (G3, G6, KILL-4; pre-registered in §I)
Only one escape is left, and it is a board ruling (§I): may a runner drive a GitHub login on a brand GitHub *user*
account?
- **If the board says yes:** every theme would take zero owner minutes. G1, G2 and G4's venue half already pass.
  The row would go to QUEUE-ON, and the build would still wait until the owner has opened Gumroad (BBU rule).
- **If the board says no:** the kill stands.

Row 151 should come off `urls.txt`: the page is built in the browser and will always return chrome.

### Next URLs (seen in a capture)
1. **https://hackmd.io/J8pD89rBRsKckhxUZYQrGQ**, the author-facing "Guide for Submissions" (GL.txt:113; the relative
   href is resolved against hackmd.io). Needed only if the board opens the escape.
2. **https://portal.astro.build/**, the portal root (GL.txt:123 and five more). It is the last public page where an
   author token or API could be named.
