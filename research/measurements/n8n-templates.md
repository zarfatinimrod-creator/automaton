# n8n paid templates (candidate 20) — the catalogue read, the Creator Hub rules not reached

**Status: READ 28.9.2026 (captures of ~13:18 UTC, render-watch commit `815c2e5`). Tick 6 (28.9.2026): still
NEEDS_MORE.** The Notion Creator Hub capture is a JavaScript shell. n8n's GitHub docs source is a three-sentence stub
that points back to it, with no rule on paid templates, AI, payout or identity. See the Tick 6 section. Half of the ₪0 test is answered
(ordering; whether paid templates appear). The other half (the AI rule, the paid-unlock condition) is not on either page.
**Tick 7 (28.9.2026): still NEEDS_MORE.** The forum thread renders: its posts are in the `.html` crawler view, while the
`.txt` lost them. A creator reports the product saying a paid template needs verified-creator status (June 2025). A
reply that is not from n8n staff says verification needs two more free templates, about three in all. The thread states
no fee, payout, identity or template AI rule. See the Tick 7 section.

## What was read

- `research/rendered/n8n-templates-search.json` — `https://api.n8n.io/api/templates/search?rows=100&page=1`, status 200,
  fetchedAt 2026-09-28T13:18:11.356Z, 2,243,312 bytes, not truncated; parsed with python3.
- `research/rendered/n8n-creators.txt` (126 lines) — `https://n8n.io/creators/`, status 200, fetchedAt
  2026-09-28T13:18:12.494Z; its `.html` (36 lines) was grepped for link targets and to confirm absences.
- The scout's claims: `research/breadth/scouts/automation-marketplaces.json`, n8n candidate (verdict WEAK).

## Findings — catalogue API

- Top level: `totalWorkflows` = 12,574; `workflows` = 100 items; `filters` = 3 facets (`categories` 31 values, `apps` 423,
  `nodes` 488). There is no price facet. [RENDERED]
- Workflow fields: `id, name, totalViews, price, purchaseUrl, user, description, createdAt, nodes`. `user` holds
  `id, name, username, bio, verified, links, avatar`. There is no `paid` boolean. [RENDERED]
- **Priced templates on the first page: 0 of 100.** `price` is `0` on 82 and absent on 18 (all 18 created between 2025-06-10
  and 2025-08-16); `purchaseUrl` is `null` on all 100. [RENDERED] The schema has a price and a checkout link, so priced
  listings exist as a concept. Whether the default query leaves them out or they only rank below 100 cannot be told. [INFERENCE]
- The only Gumroad presence: 2 free templates from one creator organisation (positions 67 and 73, `price` 0) paste a
  Gumroad storefront link into the description. The free template works as a funnel. [RENDERED]
- **Ordering follows none of the returned fields.** The rank correlation (Spearman) between position and `totalViews` is
  −0.30, so higher-viewed templates tend to come earlier. It is 0.02 against `createdAt` and 0.02 against `id`, and no
  field is monotonic. The first ten have a median of 2,284 views against the page's 135, and the most-viewed (214,907)
  sits at position 28. The newest `createdAt` is 2026-07-23, two months before the capture, so it is not recency. [RENDERED]
  It looks like an opaque relevance/popularity score applied on the server (the facets carry search-engine
  `highlighted`/`sampled` fields). [INFERENCE]
- **Views (lifetime `totalViews`, n=100):** min 14, p25 37, median 135, p75 3,121, p90 29,301, max 214,907, mean 13,049.
  46 have under 100 views, 68 under 1,000 and 20 have 10,000 or more. By `createdAt`: 1 from 2024, 81 from 2025, 18 from 2026.
  67 distinct creators; 85 of 100 from verified creators. [RENDERED]
- As a proxy for buyer supply: these are reader counts on free templates, not purchases. Readership is skewed. Even in
  the best-placed slots, half the listings have under 135 lifetime views. A new creator's paid listing starts with no
  views, in a ranking that favours views. [INFERENCE]

## Findings — creators page

- Title and framing: "Verified n8n Automation Workflows Creators" (`n8n-creators.txt:1`); "Only the best Verified n8n
  Automation Workflows Creators" (`:66`). Nav: "Templates Explore +10k workflow automation templates" (`:7`). [RENDERED]
- Directory head: nine creators with 133 to 346 templates each (`:69-103`; names not recorded), so the top is held by
  high-volume publishers. [RENDERED]
- Who can be a creator: no eligibility rule is stated. There is only "Become a verified creator" (`:107`) and "Join now"
  (`:117`), which links to `https://creators.n8n.io/` (`n8n-creators.html:35`). [RENDERED]
- The benefits are all non-monetary: "Have a direct connection to our product team and see new functionalities
  first-hand" (`:109`); "Earn the prestigious Verified Creator Badge to highlight your expertise" (`:111`); "Join a private
  Discord channel…" (`:113`); "Be listed in our Creators Directory and get noticed by the n8n community" (`:115`). [RENDERED]
- AI-generated-content rule: **absent**. The text has none. In the HTML, the only "AI-generated" string is in a listed
  creator's bio about their own product. [RENDERED]
- Paid templates, paid unlock, revenue share, payout method or countries, fee, identity or camera step: **none on the
  page**. HTML counts: "Gumroad" 0, "payout" 0, "commission" 0, "KYC" 0. Every "paid", "revenue" and "purchase" hit is in a
  creator bio. One bio offers support "With any purchase of  my n8n template" (sic, two spaces) (`n8n-creators.html:36`), which shows that
  creators sell templates, not that a program exists. [RENDERED]
- Submission: not described. The page config names `creatorsPortal: "https://creators.n8n.io/hub"` and
  `creatorHubDocument: "https://n8n.notion.site/n8n-Creator-hub-7bd2cbe0fce0449198ecb23ff4a2f76f"` (`html:36`). Its
  `productApi` block lists only read endpoints (search, filters, workflows, categories, creators). [RENDERED] That points to
  a portal form, one account-holder click per template, but it is not shown. [INFERENCE]

## Against the scout

- "12,572 workflows" (snippet) against 12,574 rendered: confirmed. `price` and `purchaseUrl` field names: confirmed, but
  none is populated on page 1.
- `gate_buyer_supply` PASS (github grade) → **UNKNOWN for paid listings**: the catalogue that reaches the editor shows zero
  priced templates in its first 100.
- `gate_ai_allowed_honest` and the "paid option after 3 submissions" snippet: still unread, and not held by this page.

**Verdict for row 20 (n8n paid templates): NEEDS_MORE.** The ordering half of the ₪0 test is answered, and the answer
is unfavourable: the ranking is opaque, tilted toward views and not toward recency, and none of the first 100 default
results has a price. The premise that buyers arrive from inside the editor is therefore unproven for paid listings. The
two decisive gates (the AI rule and the paid-unlock condition) are not on the creators page. Its pitch to creators offers
a badge, a Discord and a directory listing, and no money. It is not a fail, because no text refuted paid or AI-made
templates. **Next check:** render `https://n8n.notion.site/n8n-Creator-hub-7bd2cbe0fce0449198ecb23ff4a2f76f` (the
`creatorHubDocument` in `n8n-creators.html:36`) and read the AI rule, the paid-unlock condition and any payout terms.
Notion renders on the client, so if the runner gets a shell, the fallback is the scout's GitHub `submit-templates.md` raw URL.

## Tick 6 (28.9.2026): the Creator Hub, by the GitHub route

**The Notion capture is a shell (confirmed).** [RENDERED] `research/rendered/n8n-creator-hub-notion.txt` (ZERO-TESTS row 60) is
one line: "Notion". Meta: `https://n8n.notion.site/n8n-Creator-hub-7bd2cbe0fce0449198ecb23ff4a2f76f`, status 200, fetchedAt
2026-09-28T16:12:01.493Z, 20,034 bytes. The `.html` holds `<title>Notion</title>` and Notion's generic meta (`og:url`
`https://app.notion.com`). Its noscript reads "JavaScript must be enabled in order to use Notion." "Creator", "template",
"paid" and "submit" get 0 hits. `scripts/render-watch.mjs` is GET-only and runs no browser: no Notion page can render.

**The GitHub source (the scout's `primary_urls_to_render[3]`).** Evidence grade: **github**. The file is
`https://raw.githubusercontent.com/n8n-io/n8n-docs/main/docs/reusable-content/.gitbook/includes/workflows/templates/submit-templates.md`,
fetched 28.9 ~16:17 UTC by WebFetch and curl: status 200, 401 bytes, sha256 `f061ea35…`. Apart from its frontmatter it
holds three sentences:
- `:4` "You can submit your workflows to n8n's template library."
- `:6` "n8n is working on a creator program, and developing a marketplace of templates. This is an ongoing project, and
  details are likely to change."
- `:8` "Refer to [n8n Creator hub](https://www.notion.so/n8n/n8n-Creator-hub-7bd2cbe0fce0449198ecb23ff4a2f76f) for
  information on how to submit templates and become a creator."
- Dating. The file's history page (`https://github.com/n8n-io/n8n-docs/commits/main/<same path>`, as WebFetch summarised
  it) shows "GitBook Docs Release (#4876)" `4f6df31` on 24.6.2026 and two renames on 24.7.2026 (`5c9a7aa`, `f0f70e5`). The
  hub itself dates from n8n@1.18.0: "**Release date:** 2023-11-22" and "This release introduces the n8n Creator hub"
  (`docs/changelog/release-notes-1.x.md:5972,5975,5982`). [INFERENCE] The wording "working on a creator program" has been
  carried since late 2023, and it survived the July 2026 docs migration unchanged.
- GitHub code search over `n8n-io/n8n-docs` (28.9): "Creator hub" is in these two files only. There are 0 hits for
  "paid templates", "purchaseUrl", "sell templates", "AI-generated" or "AI generated", and for "paid" under `docs/workflows`.

**The questions, answered from this source** (github grade):
- Who can submit: "You can submit your workflows" (`:4`). No eligibility condition is stated.
- AI-generated-content rule: **absent**, from both the file and the docs-wide search.
- Paid templates, paid unlock, revenue share, payout method and countries: **absent**. The only commercial phrase is
  "developing a marketplace of templates" (`:6`), and it is stated as work in progress.
- Fee, identity or camera step: none stated. Portal or API: neither is described. Submission is handed to the hub
  (`:8`), and n8n-docs holds no submission API, which agrees with the scout.
- [SNIPPET, no source URL] The tick's one WebSearch returned a summary saying "To set templates as paid, creators need to
  be verified creators". That conflicts with the scout's snippet "A paid option is only available once you have submitted
  3 templates". Neither claim is confirmed. The search also surfaced a thread that renders on the server:
  `https://community.n8n.io/t/requirements-for-becoming-a-verified-creator/134401`.

**Verdict for row 20: NEEDS_MORE**, unchanged. The GitHub route is a dead end for the rules: n8n's own docs defer every
term to a Notion page this runner cannot render. What they do say leans against a paid channel. As of July 2026 the creator
program and the marketplace are still "ongoing" and "details are likely to change" (`:6`). This is not a fail, because
nothing refutes priced templates (the API has `price` and `purchaseUrl`) or AI-made ones.
**Single next check:** render `https://community.n8n.io/t/requirements-for-becoming-a-verified-creator/134401`. It is a
Discourse forum page; whether a plain GET returns the posts is itself part of the test. Read the condition that unlocks
paid templates (verified status, or 3 accepted templates) and any AI rule stated in a staff reply. The scout's thread
`https://community.n8n.io/t/change-the-price-of-one-of-my-paid-templates/52125` is the fallback, from the same host.

## Tick 7 reading (28.9.2026)

**Capture:** `research/rendered/n8n-verified-creator-requirements.txt` (9 lines) and its `.html` (973 lines), ZERO-TESTS
row 67. URL `https://community.n8n.io/t/requirements-for-becoming-a-verified-creator/134401`, status 200, fetchedAt
2026-09-28T17:19:23.769Z, 284,387 bytes, not truncated, sha256 `ae29fe40…`, first fetch.

**Does a plain GET return the posts? Yes, but only in the HTML.** [RENDERED] The `.txt` holds the title (`.txt:1`) and
seven stylesheet-tag fragments (`:3-9`), and no post. The extractor took the `>` in each `media="(width >= 40rem)"`
(`.html:582`) for the end of a tag. The `.html` holds Discourse's crawler view in
`<noscript data-path="/t/requirements-for-becoming-a-verified-creator/134401">` (`.html:615`), with both posts as
`crawler-post` blocks (`:655`, `:684`). It also holds the whole thread as JSON in `data-preloaded` (`:603`). [INFERENCE]
This runner can read Discourse threads. The render-watch text extractor needs a fix for a `>` inside an attribute.

**The thread.** [RENDERED] It sits in the Questions category and was opened 2025-06-18 (`.html:648`). It has 2 posts and
a system close, and 801 views. It is closed with no accepted answer: `\"views\":801,`, `\"has_accepted_answer\":false`,
and "This topic was automatically closed 90 days after the last reply. New replies are no longer allowed." (all
`.html:603`).
- Post 1, by a creator ([name removed]), 2025-06-18: "I tried uploading my second template but was unable to set it as
  paid. That’s strange because the first template n8n allowed me to set as paid. It says I need to be a verified creator
  for that but I was not a verified creator when I posted my first template." (`.html:674`). "Curious why this is
  happening and what is the requirement to become a verified creator?" (`:675`).
- Post 2, by a community member ([name removed]), the same day (`.html:696`): "Looks like the policy has changed for
  submitting workflows." (`:705`). "You’ll need to create two more free workslows to be eligable for the creator
  program." (sic, `:706`). It then links the Notion Creator Hub (`:707`).
- Post 2's author is **not n8n staff**. That post's record holds `\"staff\":false`, `\"moderator\":false`,
  `\"admin\":false`, `\"trust_level\":2` and `\"user_title\":\"Top Supporter\"` (`.html:603`).

**The questions, answered at forum grade.**
- **Who may sell paid templates: verified creators only.** [RENDERED, a user reporting the product's own message] "It
  says I need to be a verified creator for that" (`:674`). The same user had priced a first template before being
  verified, so the rule was new in June 2025 [INFERENCE from `:674`]. The reply agrees that "the policy has changed"
  (`:705`).
- **How to become verified.** [RENDERED, from a non-staff member] "two more free workslows to be eligable for the creator
  program" (sic, `:706`).
  - [INFERENCE] The poster already had one template, so that makes three. This fits the scout's snippet "A paid option is
    only available once you have submitted 3 templates". It also fits the Tick 6 search summary, "creators need to be
    verified creators". The two claims describe one rule: about three free templates make a creator eligible, and
    verification unlocks pricing.
  - [INFERENCE] "Eligable" reads as eligible to apply or be reviewed, not as an automatic unlock. One related topic
    reads the same way, from its title only: "Requesting feedback for Verified Creator status on my published n8n
    workflows" (created 2026-02-24; `.html:768`, `:603`).
- **Fees, payout, identity: none stated.** [RENDERED] There are 0 hits for Stripe, Gumroad, payout, KYC, identity,
  commission and revenue. Every "fee" hit is inside "feedback", "feed" or a file hash.
- **AI rule for templates: none stated.** [RENDERED] The only AI rule on the page is the forum's own flag, "AI Generated".
  Its text reads: "This post looks like it's AI-generated. It reads like pasted AI output: generic, padded, not actually
  addressing the issue." It carries `\"applies_to\":[\"Post\"]` and links the policy thread
  `/t/this-forum-is-for-humans-by-humans/305091` (all `.html:603`). [INFERENCE] It governs forum posts, not the template
  library.
- [INFERENCE] This matches the catalogue in §Findings. In the first 100 templates, 85 are by verified creators and none
  is priced.

**Verdict for row 20: NEEDS_MORE**, unchanged. The paid-unlock half now has a forum-grade answer, and it is costly:
- Pricing needs verified-creator status, per a user quoting the product in June 2025.
- Verification needs about three free templates first, per a non-staff reply.
- Every paid n8n listing therefore sits behind at least three free ones and a review whose criteria nobody has read.

That path costs ₪0 and can be walked honestly under the brand, so it is not a kill. Still open: the AI rule for
templates, fees and payout, and whether verification asks for identity. The source is 15 months old, is not staff,
and says the policy was changing.

**Single next check:** render
`https://community.n8n.io/t/requesting-feedback-for-verified-creator-status-on-my-published-n8n-workflows/269435`. It is
the related topic at `.html:768`, created 2026-02-24 (`.html:603`), and the newest thread on the subject in the capture.
Look for any staff reply on what verification requires, whether AI-generated templates are accepted, and whether
identity or payout details are asked. Read the `.html` crawler view, not the `.txt`. Suggested slug:
`n8n-verified-creator-feedback-2026`.
