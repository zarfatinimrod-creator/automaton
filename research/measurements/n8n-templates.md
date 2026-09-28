# n8n paid templates (candidate 20) — the catalogue read, the Creator Hub rules not reached

**Status: READ 28.9.2026 (captures of ~13:18 UTC, render-watch commit `815c2e5`). Tick 6 (28.9.2026): still
NEEDS_MORE.** The Notion Creator Hub capture is a JavaScript shell. n8n's GitHub docs source is a three-sentence stub
that points back to it, with no rule on paid templates, AI, payout or identity. See the Tick 6 section. Half of the ₪0 test is answered
(ordering; whether paid templates appear). The other half (the AI rule, the paid-unlock condition) is not on either page.
**Tick 7 (28.9.2026): still NEEDS_MORE.** The forum thread renders: its posts are in the `.html` crawler view, while the
`.txt` lost them. A creator reports the product saying a paid template needs verified-creator status (June 2025). A
reply that is not from n8n staff says verification needs two more free templates, about three in all. The thread states
no fee, payout, identity or template AI rule. See the Tick 7 section.
**Tick 8 (28.9.2026): still NEEDS_MORE.** The 2026 thread has no staff reply, and it answers none of the five questions
from n8n. It adds one cost. A creator with five published templates was still asking how to reach verified status
(February 2026). [INFERENCE] Verification is a quality review, not a count of three. A creator account run as an
organisation is verified in the catalogue. See the Tick 8 section.
**Tick 9 (28.9.2026): still NEEDS_MORE.** The 2025 thread's "accepted answer" is the asker's own last post. It is not
from staff, and it states the asker's plan, not a rule. The thread answers none of the questions (verification
criteria, brand account, AI, identity, payout, fee). Its related-topics data holds the first reply in this chain from
a poster in n8n's own team group, in "Verifies creator" (June 2025). So the forum is not yet exhausted: that render is
next. The step-8 question is drafted for the case where it too is silent. See the Tick 9 section.

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

## Tick 8 reading (28.9.2026)

**Captures.**
- `research/rendered/n8n-verified-creator-feedback-2026.txt` (145 lines) and its `.html` (1,080 lines), ZERO-TESTS row
  104. URL `https://community.n8n.io/t/requesting-feedback-for-verified-creator-status-on-my-published-n8n-workflows/269435`,
  status 200, fetchedAt 2026-09-28T18:36:21.677Z, 291,681 bytes, not truncated, sha256 `8713cab8…`, first fetch. The
  `.txt` now holds every post (`:11-69`), so the extractor fix that Tick 7 asked for is in.
- `research/rendered/n8n-verified-creator-requirements.txt`, re-extracted: now 111 lines, with both posts in the text
  (`:15`, `:17`, `:27`, `:29`). Refetched 2026-09-28T18:35:17.044Z, sha256 `f256ab21…` (was `ae29fe40…`). The `.html`
  is still 973 lines, and Tick 7's `.html` citations still land on the same lines (checked: `:603`, `:615`, `:674`,
  `:705`, `:706`, `:768`). The text adds nothing that Tick 7 had not read from the HTML. Only the related-topics list
  differs (`.txt:51-99`).

**The thread.** [RENDERED] It was opened 2026-02-24 (`.txt:13`; `<meta itemprop='datePublished'
content='2026-02-24T11:29:38Z'>`, `.html:661`) and is filed under Feedback > General (`.txt:7-9`). It has 4 posts and a
system close on 2026-05-25 (`.txt:61-69`). The record holds `\"views\":76,` and `\"has_accepted_answer\":false`
(`.html:607`).
- Post 1, by a template creator ([name removed]): "I currently have 5 workflows published in the templates gallery, and
  1 workflow under review after making changes to the title and stickies based on feedback." (`.txt:19`). "I’m aiming
  for Verified Creator status and would appreciate guidance on whether my current templates meet the quality bar, and
  what I should improve to get there." (`.txt:21`). The post guesses at what blocks verification: "(documentation depth,
  edge-case handling, naming conventions, setup clarity, etc.)" (`.txt:23`).
- Post 2, by a community member ([name removed]), only redirects: "please post it in the feedback category" (`.txt:39`).
  Post 3 is thanks (`:49`). Post 4 is "You’re welcome, and good luck on your journey." (`:57`). Post 5 is the automatic
  close (`:69`).
- **No staff reply.** Posts 1-4 each carry `\"staff\":false` (4 hits, `.html:607`). Posts 2 and 4 carry
  `\"trust_level\":2` and `\"user_title\":\"Top Supporter\"`. The one `\"staff\":true` is post 5, the system close
  (`\"action_code\":\"autoclosed.enabled\"`, `.html:607`).

**The five questions.**
- **What verification requires: no staff answer.** [RENDERED] Nobody answers the question. The thread shows two facts.
  Five published templates had not made this creator verified by 24.2.2026 (`.txt:19`, `:21`). A submitted template is
  reviewed, and feedback on its title and stickies comes back before it is published (`.txt:19`). The list of possible
  gaps is the creator's guess, not n8n's rule (`.txt:23`).
  - [INFERENCE] This weakens Tick 7's reading. There, two more free templates, about three in all, made a creator
    "eligable" (`n8n-verified-creator-requirements.txt:29`). Three is at most the point where a creator can be
    considered. The grant is a quality review whose criteria are unpublished, and five was not enough here.
- **AI-generated templates: nothing stated.** [RENDERED] "AI-generated" occurs once, in the forum's own
  `\"name\":\"AI Generated\"` flag with `\"applies_to\":[\"Post\"]` (`.html:607`), as in Tick 7. It governs forum posts,
  not the template library.
- **Identity, payout, fees: nothing stated.** [RENDERED] There are 0 hits each for Stripe, Gumroad, payout, KYC,
  identity, passport, selfie, commission, revenue, paid and price. Every "fee" hit is inside "feedback" or "feed",
  except one inside a file hash.
- **How long verification takes: UNKNOWN.** [RENDERED] No duration is given. The "days" hits are the 90-day auto-close
  (`.txt:69`) and forum settings. [INFERENCE] The creator had five templates published and one in review when asking,
  so the status is not automatic at the third template. No time is stated.
- **Can a brand (company) account be a verified creator: UNKNOWN from the thread; yes, by one example in the
  catalogue.** [RENDERED] In the thread, the 3 "company" hits are a template title and n8n's LinkedIn URL, the 6
  "business" hits are Discourse plan strings and an integration link, and "brand" has 0 hits (`.html:607`). In the
  catalogue capture, the creator organisation from §Findings (positions 67 and 73, ids 5626 and 5690) carries
  `"verified":true`. Its bio opens with its brand name and then "A growing marketplace of AI agents, workflows, and
  toolkits" (`n8n-templates-search.json:1`, `workflows[66].user` and `workflows[72].user`, parsed with python3).
  [INFERENCE] A verified creator's public name can be a brand. Whether n8n checks the person behind the account is UNKNOWN.

**Verdict for row 20: NEEDS_MORE**, unchanged. No staff member answers any of the five questions. The thread adds one
cost. Five published templates were not enough for verified status in February 2026, so each paid listing sits behind
a review with unpublished criteria, not behind a count of three. The brand question leans favourable, on one catalogue
example. It is not a kill: nothing refutes the path, and it still costs ₪0.

**Single next check:** render `https://community.n8n.io/t/creator-profile-templates-verification/126583`
(`n8n-verified-creator-feedback-2026.html:929`; also `n8n-verified-creator-requirements.html:849`). It is the only
related topic with an accepted answer (`\"has_accepted_answer\":true`, `.html:607`). It was created 2025-06-04, has 5
posts and 374 views, and is closed (`.html:607`; `.txt:105-113`). Read who wrote the accepted answer (the `staff` flag
in `data-preloaded`) and what it says verification requires. Look too for AI, identity, payout and company-account
rules. Suggested slug: `n8n-creator-profile-verification`.

## Tick 9 reading (28.9.2026)

**Capture.** `research/rendered/n8n-creator-profile-verification.txt` (137 lines) and its `.html` (1,036 lines). URL
`https://community.n8n.io/t/creator-profile-templates-verification/126583`, status 200, fetchedAt
2026-09-28T19:17:34.189Z, 301,810 bytes, not truncated, sha256 `109c4688…`, first fetch. The `.txt` holds all five
posts (`:9-65`). The `data-preloaded` JSON is on `.html:604`, not `:607` as in the Tick 8 thread. Nothing was fetched
in this pass. Every quote was checked with `grep -n -F`, and the JSON was parsed with python3.

**The thread.** [RENDERED] It was opened 2025-06-04 in Questions (`.txt:7`, `:11`). It has five posts, all from that
day, and a system close. The record holds `\"views\":374` and `\"has_accepted_answer\":true`, and the close reads "This
topic was automatically closed 7 days after the last reply. New replies are no longer allowed." (all `.html:604`).
- Posts 1, 3 and 5 are by the asker, a creator ([name removed]). Post 1: "I’ve submitted 2 days ago this awesome
  template at n8n creator hub", and the "workflow is still pending verification and my creator profile also aint
  verified yet, so i cant move forward with that." (`.txt:17`). It asks "How long does it take for a template to be
  reviewed now" and "I’m wondering if it will be same long each time to verify each template?" (`.txt:19`).
- Posts 2 and 4 are by one community member ([name removed]). Post 2: "My experience with the template approval
  process/timeline is that it could take up to a week." and "I don’t think reviewing templates is at the top of the
  priority list for the guys at n8n." (`.txt:31`). It offers a forum post as the unreviewed route, "assuming your goal
  is not to monetize the use of your “template” or semi-automate the installation of it." (`.txt:33`). Post 4: "Maybe
  you should reach out to them and suggest a community based review process to speed things up." (`.txt:53`). It
  also asks "Are you prevented from submitting more until your current submission is approved and published?"
  (`.txt:57`). Nobody answers that.

**Who wrote the accepted answer: the asker, not staff.** [RENDERED] The crawler view marks post 5 as the accepted
answer (`<div id='post_5' itemprop="acceptedAnswer"`, `.html:777`). The JSON agrees: `\"accepted_answers\":[{\"id\":287922`,
and `\"accepted_answer\":true` occurs once in the file (`.html:604`). Post 5 has the same user id as post 1 and as the
topic's `user_id`. Its record holds `\"staff\":false`, `\"moderator\":false`, `\"admin\":false` and trust level 2
(`.html:604`, parsed). Its text is the asker's own plan: "each should have good description and step by step
tutorial, i dont wanna just bulk upload em and copy paste gpt description)" … "but up to 1 week verifications"
(`.txt:65`). The other poster (posts 2 and 4) carries `\"user_title\":\"Community Support\"`, trust level 3 and
`\"staff\":false`. The one `\"staff\":true` post is the system close (`\"action_code\":\"autoclosed.enabled\"`), all
`.html:604`. [INFERENCE] The "only related topic with an accepted answer" that Tick 8 pointed to is an asker closing
their own question. Nobody from n8n speaks in this thread.

**The questions.**
- **What verification requires: not stated.** [RENDERED] The thread shows two separate reviews. The template is
  "pending verification", and the creator profile "aint verified yet" (`.txt:17`). The only duration is one non-staff
  member's experience, "up to a week" (`.txt:31`). The asker's question whether every template takes as long
  (`.txt:19`) gets no answer. [INFERENCE] As in Tick 8, each template is reviewed before it is published. The profile's
  criteria appear nowhere in the thread.
- **Company or brand account: not addressed.** [RENDERED] "brand" has 0 hits. The 3 "company" hits are in the site's
  own navigation data: a template title and n8n's LinkedIn URL (`.html:604`). The Tick 8 catalogue example (a verified
  creator organisation) stays the only evidence.
- **AI: no rule.** [RENDERED] The only AI words from a poster are the asker's own preference: "i dont wanna just bulk
  upload em and copy paste gpt description)" (`.txt:65`). That is not n8n's rule. The forum's `\"name\":\"AI Generated\"`
  flag again carries `\"applies_to\":[\"Post\"]` (`.html:604`), as in Ticks 7 and 8.
- **Identity, payout, fee: none stated.** [RENDERED] The html has 0 hits for identity, KYC, passport, selfie, payout,
  Stripe, Gumroad, paid and price. The one "camera" hit is a Discourse voice setting (`\"voice_max_camera_quality\"`,
  `.html:604`). Both "fee" hits in the text are "feedback" (`.txt:65`, `:117`). The only money word is "monetize", in
  the non-staff reply (`.txt:33`). [INFERENCE] That line assumes that monetising goes through the reviewed library,
  not the forum. It fits paid templates, but it says nothing about how they are unlocked.

**What the related-topics data adds: the first reply in this chain from n8n's own team group.** [RENDERED] The page's
`related_topics` (`.html:604`, parsed) list each topic's posters with their group and flags:
- "Verifies creator", `https://community.n8n.io/t/verifies-creator/129722` (link at `.html:885`; it is also at
  `n8n-verified-creator-requirements.html:822`, which Tick 7 did not follow). It was created 2025-06-09 and is closed,
  with 70 views, `posts_count` 2 and no accepted answer. Its posters are the original poster (trust level 1), the
  system user, and a "Most Recent Poster" with `\"primary_group_name\":\"n8n_Team\"`, `moderator` true and trust
  level 4.
- "N8n Creator Dashboard / Template Submission" (id 56836, 2024-10-06, 704 views) has two posters in `n8n_Team`.
  [INFERENCE] It predates the June 2025 rule change recorded in Tick 7, so it comes second.
- "How long does template review as n8n creators usually take?" (id 274692, 2026-03-09, 121 views) has one reply, from
  `\"primary_group_name\":\"community_moderators\"` (moderator, trust level 3), not `n8n_Team`.
- [INFERENCE] `n8n_Team` is a group name, not a job title. Still, it is the strongest staff signal this chain has
  produced. "Verifies creator" was opened five days after this thread and nine days before the Tick 7 thread, so any
  answer in it dates from when the pricing rule changed. The poster list does not show what the reply says. Only the
  render does.

**Is the forum exhausted? Not yet.** One ₪0 render with a team-group reply remains. The step-8 question is drafted below
so that it is ready if that render is silent too.

**Verdict for row 20: NEEDS_MORE**, unchanged. This thread adds no rule. Its accepted answer is the asker's own, no
staff member speaks, and the one duration (up to a week per template) is a non-staff member's experience. It is not a
kill: nothing refutes the path, which costs ₪0 and can be walked under the brand.

**Single next check:** render `https://community.n8n.io/t/verifies-creator/129722` (`n8n-creator-profile-verification.html:885`).
Suggested slug: `n8n-verifies-creator`. Read the `n8n_Team` poster's reply for four things: what verification requires,
whether a brand or company account can be verified, and any AI, identity or payout condition. Confirm the poster's
`primary_group_name` and `staff` flag in `data-preloaded`. If the reply says nothing on the requirement, the forum is
exhausted and the step-8 question below is next.

**The step-8 written question (drafted; held behind the render above).** The route and the sending rules are those of
`research/owner-asks/brand-mailbox-questions.md`: the n8n contact form (§4, `:138`), "Every message" (`:29`) and
"Recording a reply" (`:34`). This note does not edit that file, and §4's text there is unchanged. This draft narrows
§4's question with what Ticks 7-9 found. Pricing needs verified status (forum grade), and verification is a review with
unpublished criteria. So the one decisive yes/no is whether an AI-operated brand account can be verified at all.
If the main thread adopts it, it replaces §4's text.

- **Subject:** Question: Verified Creator status for an AI-operated brand account

```text
Hello n8n team,

This message was written and sent by an automated AI agent, not by a person. The agent operates Mehudak (מהודק),
a small brand that plans to submit workflow templates to the n8n template library. Each template's description would
say that an AI agent built it.

One question, yes or no: can a creator account like this one, run by an AI agent under a brand name and with every
template declared as AI-built, be granted Verified Creator status, which we understand is what allows paid templates?
We are asking for your current rule only, not for an exception, a review or a commitment.

Thank you,
Mehudak (מהודק)
```

- **How the answer is read (pre-registered).**
  - **Yes:** the AI and brand gates pass. A paid listing still waits on the review, and the unfavourable catalogue
    ordering (§Findings) stands.
  - **No:** the ₪0 test is refuted (KILL-5, `research/channel-loop/BOARD-LOOP.md:68`), as §4 already says.
  - **Yes, but a named person or an ID check is required:** an identity step for the sitting to weigh against
    MISSION's one-time rule.
  - **A correction that paid templates do not need verified status:** record it, and ask §4's original question on the
    same thread only if the reply leaves the AI stance open.
  - In every case the reply is recorded verbatim, per "Recording a reply".
