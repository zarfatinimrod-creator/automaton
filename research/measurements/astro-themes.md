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
