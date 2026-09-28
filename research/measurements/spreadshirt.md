# Spreadshirt (candidate 17) — the ₪0 test could not be read from a runner

**Status: REFUSED 28.9.2026 (tick 5, render-watch run 26, commit `815c2e5`); tick 6 tried a second route (official
GitHub org read, container curl egress-blocked, 3 snippets) — still NEEDS_MORE, no gate passed or killed. Tick 7 (runner
render ~17:19 UTC): still NEEDS_MORE. The 2018 Spreadshop upload post (200) shows that "50 a day" was the limit from 1.2.2018
(today's limit is UNKNOWN), and it adds three 2018 rules: human review, originality with proof of rights, and a ban on
circumventing accounts. It says nothing on automation, AI, fees or eligibility. The API Design Details page answered 406
again to a request that already asked for `text/html`, so that route is closed. See "Tick 7 reading". Tick 8 (runner
render ~18:36 UTC): still NEEDS_MORE. The Spreadshop legal-information page (200) is only an imprint. It links no partner
terms, seller agreement or content policy, and it says nothing on automation, AI, fees, countries, payout or identity. It
adds two things: the counterparty depends on the region chosen (NA/Oceania: Spreadshirt, Inc.; Europe: sprd.net AG), and a
contact address, `contact@spreadshop.com`. The docs route has nothing left to render for KILL-4, so the single next check is
now the step-8 written question, and it has a recipient. See "Tick 8 reading".** All six Spreadshirt pages the breadth board
named (ZERO-TESTS rows 40-45) came back without a body: five HTTP 403 and one HTTP 406. Nothing below is a finding about
Spreadshirt's terms; it is a finding about the route.

## What was requested and what came back

- spreadshirt-partner-terms: status 403, fetchedAt 2026-09-28T13:17:58.474Z, error HTTP 403 Forbidden
- spreadshirt-commission-payment: status 403, fetchedAt 2026-09-28T13:17:59.629Z, error HTTP 403 Forbidden
- spreadshirt-tax-forms-non-us: status 403, fetchedAt 2026-09-28T13:18:00.706Z, error HTTP 403 Forbidden
- spreadshirt-partner-taxation-2024: status 403, fetchedAt 2026-09-28T13:18:01.773Z, error HTTP 403 Forbidden
- spreadshirt-ai-designs-2024: status 403, fetchedAt 2026-09-28T13:18:02.840Z, error HTTP 403 Forbidden
- spreadshirt-developer: status 406, fetchedAt 2026-09-28T13:18:04.034Z, error HTTP 406 Not Acceptable

`help.spreadshirt.com` (Zendesk) and `spreadshirt.com` refuse the GitHub runner's fetch; `developer.spreadshirt.net` answers
406 to the runner's `Accept` header. The captures hold no page text, so the gates the board set for candidate 17 — automation
and AI terms, the payout rail and whether Israel is paid, the W-8BEN form, the AI-design rules, whether an upload API exists
(a written "no" on automated uploads is KILL-4) — are all still UNKNOWN [RENDERED: the status codes; nothing else].

## What this means [INFERENCE]

- The runner route is closed for Spreadshirt. Re-trying the same URLs would spend a render on the same 403.
- The board's own fallback applies (`research/breadth/BOARD.md` Q1 rank 4): one written question on automated uploads from
  the step-8 brand mailbox, once step 8 exists. Until then candidate 17 stays queued, unread.
- Two free routes are worth one try before the question: (a) Spreadshirt's public GitHub organisation, if its API docs or
  terms are mirrored there (WebFetch to github.com works from this container); (b) a different `Accept`/user-agent for
  `developer.spreadshirt.net`, since 406 is a content-negotiation refusal, not a block. Neither has been tried.

## Related refusals in the same run

- tipalti-payees-faq: status 403, fetchedAt 2026-09-28T13:17:48.345Z, error HTTP 403 Forbidden — this page gates owner step 10 (CrazyGames developer account plus Tipalti onboarding; ZERO-TESTS row 33). Tipalti's
  help centre is also Zendesk. The Israel-as-payee and camera questions for CrazyGames and Wix stay UNKNOWN.
- eu-dsa-2022-2065: status 202, fetchedAt 2026-09-28T13:18:16.985Z, error - — EUR-Lex returned a 1-line shell (`…`), not the regulation. The DSA Articles 30-31 question (breadth
  board Q10) is unread; the regulation's text is also published at data.europa.eu and in several GitHub mirrors, which a
  later render can try.

**Verdict for candidate 17 (Spreadshirt): NEEDS_MORE (unread — route refused).** Not a fail: no gate was tested.

## Tick 6 (28.9.2026): a second route

**What each route returned.**
- **GitHub (WebFetch/raw, worked).** `github.com/spreadshirt` is the company's org (Leipzig, links developer.spreadshirt.net):
  40 repos, all infrastructure except three API-related ones. No API reference, OpenAPI spec, partner terms or upload tool
  in it. `github.com/spreadgroup` holds one repo (`user-admin-ui`). The api.github.com search API is scoped out here (403).
- **curl, browser `Accept`/UA, once per host (failed before Spreadshirt).** developer.spreadshirt.net, help.spreadshirt.com,
  www.spreadshirt.com and archive.org: `CONNECT tunnel failed, response 403`. The proxy log reads "gateway answered 403 to
  CONNECT (policy denial or upstream failure)". This is this container's egress policy, so the 406-is-the-Accept-header
  hypothesis is **still untested**. WebFetch: `EGRESS_BLOCKED` for www.spreadshirt.com, developer.spreadshirt.net and
  www.spreadshop.com.
- **WebSearch, 3 of 3 used:** Israel payout; automated upload; AI policy. Results are below.

**Findings.**
1. Upload API [github]. `spreadshirt/shop-api-example-integration` (last commit 26.7.2019, archived 12.2.2025). Its README
   reads: "This is an example integration of the new Shop-API which is currently in beta testing". `src/index.php` uses
   `https://api.spreadshirt.net/api/v1` with `Authorization: SprdAuth apiKey="…"`. The only calls are GET
   `shops/{id}/sellables`, `sellables/{id}` and `productTypes/{id}`, plus POST/PUT `baskets`. **There is no design or idea
   call.** Spreadshirt's own example of its 2019 Shop API is read plus basket only.
2. Upload API, historical [github]. `spreadshirt/SpreadKit` is an iOS client for API v1 (commits 12.3–8.8.2013, archived).
   It POSTs a design and PUTs the image to `design.uploadUrl`, signed with SprdAuth `sig`. README: "In order to be able to,
   for example, create products and baskets, you need to apply for an API key at the SDN". That is 13-year-old
   customer-product code. It shows only that API v1 once accepted design creation, not that a partner may publish to the
   Marketplace or a Spreadshop by API today.
3. Automation terms [snippet; not attributed]. The search engine's summary states that "uploading with an image pointer is no
   longer supported for security reasons" and that "the only way to automate this is to hack in by scraping the upload page
   UI". The summary does not say which result either line comes from. The likeliest source is a forum thread titled
   "Upload designs via API - Feature requests" (`spreadshirt.com/forum/t/upload-designs-via-api/2649`). A feature request
   under that title implies no such API. Neither line is a written Spreadshirt "no" on automated uploads, so **KILL-4 is not
   triggered**. The partner T&C snippet only says uploaders "represent and warrant … that you have all necessary rights".
   Conflict: one snippet gives a "50 daily design limit"; the scout's blog snippet gives 200/day (2020). Unresolved.
4. Israel payout [snippet]. The earlier finding is confirmed: "two payment options: direct deposit to a US Bank account or a
   PayPal transfer". With PayPal, "payout will be made in the currency of your shop". Payouts are monthly, and international
   partners "must submit a W-8 form" (help articles 207905515 and 11874067093404). **No country list, and Israel is neither
   named nor excluded:** UNKNOWN. The rail is still PayPal Israel (row 21).
5. AI rules [snippet]. Also confirmed: AI designs are allowed "if the terms of use of the respective AI provider permit
   unrestricted commercial use", on both the Marketplace and a Spreadshop (blog 2024-06-07). Spreadshirt notes "recurring
   problems with designs created with the help of AI". New (2025): a customer AI tool that changes Marketplace designs by
   prompt, with a partner opt-out, paying commission "based on the original design price" (help article 22671191443868; the
   third-party pivot-to-ai.com piece of 19.8.2025). [INFERENCE] Opt out: otherwise a buyer's AI edit ships under our design.
6. DSA Articles 30-31 (Q10): not attempted this tick. Unread [none].

**URLs a runner might try where the 403s failed (all seen in results or in code this tick, none guessed):**
- `https://developer.spreadshirt.net/bin/view/API/Spreadshirt%20Public%20Shop%20API%20Documentation/API%20REST%20Resources/Design%20Details/`
  (the XWiki docs; the 406 was on the root; send `Accept: text/html`)
- `https://developer.spreadshirt.net/display/API/Security` (cited in the official example's error message; older path)
- `https://www.spreadshop.com/blog/2018/01/30/new-upload-guidelines/` (spreadshop.com, a host the runner has not tried)
- `https://service.spreadshirt.com/hc/en-us/articles/115000994005-Payment-methods` (a second Zendesk host; may be buyer-side)
- `https://www.spreadshirt.com/forum/t/upload-designs-via-api/2649` (forum; same domain as the 403s)
- New help ids on the refused host: `…/articles/21157128171932-New-process-for-uploading-your-designs-to-the-marketplace`,
  `…/articles/22671191443868-AI-function-for-customers-in-Product-Designer` and `…/articles/207153559-Payment-Methods`

**Verdict for candidate 17 (Spreadshirt): NEEDS_MORE.** The second route turned GitHub into evidence. Spreadshirt's own example
of its Shop API (2019) is read plus basket, with no sanctioned design-upload path for a partner. An unattributed snippet
says automation means scraping the upload UI. That is still not a written "no", so no gate is killed, and under the
CrazyGames precedent nothing short of a written "yes" passes it. Israel stays UNKNOWN: PayPal is the only non-US rail and no
country list was seen. **Single next check:** one runner render of the XWiki Design Details URL above with a browser
`Accept: text/html`. If it answers, it shows whether API v1 still creates designs and for whom. If it returns 406 again,
this route is closed and candidate 17 waits for the step-8 written question.

## Tick 7 reading (28.9.2026)

**What came back (render-watch, 28.9.2026 ~17:19 UTC).** Citations: `txt:<line>` = `research/rendered/spreadshop-upload-guidelines-2018.txt`,
`html:<line>` = the `.html` beside it.
- **spreadshop-upload-guidelines-2018 (row 64): status 200.** fetchedAt 2026-09-28T17:19:18.312Z, 103,153 bytes, `truncated`
  false, `firstFetch` true, sha256 `52efe9f8…`. Read in full: 200 lines, article `txt:21-85`, reader comments `txt:105-174`,
  footer `txt:176-200`. The byline and the reader comments carry personal names; they are written [name removed] below.
  [RENDERED]
- **spreadshirt-api-design-details (row 63): status 406 again.** fetchedAt 2026-09-28T17:19:16.482Z, byteLength 0, error
  "HTTP 406 Not Acceptable" [RENDERED: meta]. The runner already sends `accept:
  "text/html,application/xhtml+xml,application/xml;q=0.9,application/json;q=0.9,*/*;q=0.8"` and a desktop Chrome
  user-agent (repo code: `scripts/render-watch.mjs:612`, `:131-132`). So tick 6's hypothesis, that the 406 came from the
  runner's `Accept` header and a browser `text/html` would get past it, is refuted: this request already put `text/html`
  first [INFERENCE]. By tick 6's own rule this route is closed.

**Date grade: everything from this page is a 2018 rule.** `article:published_time` is 2018-01-30T10:51:58+00:00 (html:25),
matching the byline date `txt:25` "January 30, 2018", and `article:modified_time` is 2025-01-17T01:40:03+00:00 (html:26)
[RENDERED]. The capture does not show what the 2025 edit changed. The body still announces a rule "Beginning 01.02.2018"
(`txt:43`) and points to an older post ("More info regarding the limit can be found in a blog post from October.",
`txt:33`, linking `https://www.spreadshirt.com/blog/2017/10/09/new-limit-design-uploads/`, html:259). Each finding below
is therefore what Spreadshirt announced in January 2018, not proof of today's rule. The share image sits at
`files/2021/06/MDS-723-BP-Upload-limit-50_…jpg` (html:296). That path shows when the image was uploaded, not that 50 was
still the limit in 2021. [INFERENCE]

**(1) The daily limit: where the 50 comes from (2018).**
- `txt:37` "To speed up the design review process, we will implement a limit on the number of daily design uploads:" /
  `txt:39` "50 designs max. per day" / `txt:41` "Partners reaching the 50 daily design limit will be notified in the upload
  section and will have to wait until the next day to upload more designs." / `txt:43` "Beginning 01.02.2018". [RENDERED, 2018]
- Tick 6's "50 daily design limit" snippet is this sentence (`txt:41`) word for word, so it is a 2018 rule. The 200/day
  figure is the scout's 2020 snippet, which no capture holds. The two are not in conflict, because they come from
  different years. The limit in force today is **UNKNOWN**. [INFERENCE]
- Reset time: a reader comment ([name removed]) says "It just reset at midnight GMT" (`txt:136`). That is a user's
  observation, not a Spreadshirt statement. [RENDERED comment, 2018]
- Scope: Spreadshirt ties the review to the Marketplace ("designs make it to the Marketplace significantly quicker",
  `txt:83`). A reader comment claims shop designs publish "immediately" (`txt:122`) yet still count toward the cap
  (`txt:124` "I bumped up against the limit"). Whether shop-only uploads count against the cap is UNKNOWN from Spreadshirt's
  own text. [RENDERED comment / UNKNOWN]

**(2) Why the limit exists: people review every Marketplace design (2018).**
- `txt:27` "The logjam is due to a handful of Partners uploading hundreds of designs every day." `txt:31` "Our design review
  team is hard at work examining thousands and thousands of designs each day." [RENDERED, 2018]
- The cap was built against high-volume uploaders. A pipeline that uploads at volume is the pattern the rule targets, and
  `MISSION.md:378-379` ("no low-effort flooding that a platform would call spam") already forbids it. A brand that uploads a
  few original designs a day fits both. [INFERENCE]

**(3) Automation or API upload rule: not on this page, so KILL-4 is untested.**
- "API", "automat", "script" and "bot" each get 0 hits. The page neither allows nor bans automated uploads. [RENDERED absent]
- The one account rule is `txt:81` "If you’re worried about your fellow users utilizing multiple accounts, we’re on it. We’ll
  be banning these accounts if they’re found to be violating or circumventing the rules." [RENDERED, 2018] The rule for us is
  one brand account, and never a second account to get round the cap. [INFERENCE]

**(4) Source and originality rules (2018), the nearest thing to an AI rule.**
- `txt:47` "Spreadshirt will also be rejecting designs that come from third-party platforms, including", followed by Pixabay,
  Freepik, PngTree, Openclipart, Wikimedia, AdobeStock, Fotolia, Shutterstock, 123rf and Colourbox (`txt:49-67`). [RENDERED]
- `txt:69` "These designs will only be allowed if they’ve been reworked prior to uploading, interpreted differently, and if
  Partner have valid proof that they can use the design. Spreadshirt will also reject any designs that have purely been
  downloaded from another source." [RENDERED]
- The page lists as insufficient "An original, unaltered image" (`txt:73`), "A minor color change" (`txt:75`) and "A minor
  transformation (including mirroring or rotation)" (`txt:77`). [RENDERED]
- There is no AI rule: "AI" as a word and "artificial" each get 0 hits, and the post predates the 2024 AI blog (row 44, still a
  403, known only from a snippet). [RENDERED absent] Both years point the same way: the partner must be able to prove the
  right to use each design. For a pipeline that means no stock or clip-art inputs, AI output only under a provider licence
  that permits commercial use (tick 6, finding 5), and one record per design of how it was made. [INFERENCE]

**(5) Fees, and who may upload.**
- The page states no fees. Its two "fee" hits are "feedback" (`txt:27`) and "Inline Feedbacks" (`txt:112`), and "commission",
  "price", "royalt", "payout", "PayPal" and "tax" each get 0 hits. [RENDERED absent]
- On who may upload, the page says only "Partners" (`txt:27`, `:31`, `:41`). "country", "Israel" and "identity" each get 0
  hits. Eligibility, individual versus company, and whether an agent may operate the account are UNKNOWN. [RENDERED absent]

**(6) A host that answers.** www.spreadshop.com answered the runner 200, while www.spreadshirt.com, help.spreadshirt.com and
developer.spreadshirt.net refused the runner (tick 5; developer.spreadshirt.net again in tick 7). [RENDERED: metas] The page's footer links "Legal Information" at
`https://www.spreadshop.com/legal-information/` (html:708) on that same host. Its Help link goes to
`https://help.spreadshop.com/hc/en-us` (html:196), a Zendesk help centre like the two that answered 403 (help.spreadshirt.com
here, help.tipalti.com for Wix). [RENDERED / INFERENCE]

**Verdict for candidate 17 (Spreadshirt): NEEDS_MORE.** The 2018 post explains the 50-versus-200 conflict: 50 a day was the
limit from 1.2.2018, and today's limit is UNKNOWN. It adds three real rules, each dated 2018: people review every
Marketplace design, a design needs originality and proof of rights, and accounts that circumvent the rules are banned. None of
them kills the channel, and all three fit honest value. The page says nothing on automation, AI, fees or eligibility, so
KILL-4 is still untested, the AI rule is still snippet-only, and Israel is still UNKNOWN. The API route is closed: row 63
answered 406 twice, and the second request already asked for `text/html`.

**Single next check:** one runner render of `https://www.spreadshop.com/legal-information/` (footer link,
`spreadshop-upload-guidelines-2018.html:708`), suggested slug `spreadshop-legal-information`. Of the Spreadshirt group's hosts,
it is the only one that has answered the runner, and the partner terms (row 40, a 403) are where a written rule on automated
uploads, AI and the EU/NA account split would sit. Read it for the terms text or a link to it, any automation or AI clause, and
who may be a partner (country, individual or company). If it is only an imprint, or it links back to the 403 host, candidate 17
waits for the step-8 written question.

## Tick 8 reading (28.9.2026)

**What came back (render-watch, 28.9.2026 ~18:36 UTC).** Citations: `txt:<line>` = `research/rendered/spreadshop-legal-information.txt`,
`html:<line>` = the `.html` beside it.
- **spreadshop-legal-information (ZERO-TESTS row 99): status 200.** fetchedAt 2026-09-28T18:36:13.850Z, 156,335 bytes,
  `truncated` false, `firstFetch` true, sha256 `c12729c5…`. Read in full: 131 lines, with the page body at `txt:13-92` and the
  footer at `txt:94-131`. The page carries no date. It names one person twice (managing director and editorial contact,
  `txt:71-73`, `:79-81`), written [name removed] here. [RENDERED]

**(1) It is only an imprint. It links no partner terms and no design or content policy.**
- The footer's "Legal" column holds three links, "Imprint", "Privacy Policy" and "CCPA" (`txt:115-118`), and "Imprint" points to
  this page itself: `<a href="https://www.spreadshop.com/legal-information/">Imprint</a>` (html:87). [RENDERED]
- The body lists the operators (`txt:14`), the contracting party by region (`txt:16-20`), two addresses, two e-mails, phones,
  faxes, a commercial register and VAT number (`txt:24-88`), and one line on consumer arbitration: "We are neither required nor
  prepared to participate in a dispute settlement procedure before consumer arbitration panel." (`txt:92`). [RENDERED]
- The meta description promises more than the page holds: "Find important legal information about Spreadshop, including our
  terms of service, privacy policies, and seller agreements." (html:1). Yet the body contains no terms or seller agreement and
  links none. In the text, "agreement" and "condition" get 0 hits, and "Terms" appears once, in the page title (`txt:1`). In the
  whole `.html`, no `href` goes to a terms, GTC, agreement, guideline or content-policy page. The CMS map embedded at html:87
  (280 slugs) has no such slug either: its only legal slugs are `legal-information` and `privacy-policy`. [RENDERED absent]
- It links only two items back toward Spreadshirt: the "DMCA Notice" (`txt:40`) at `https://www.spreadshirt.com/dmca-notice-C6804`
  (html:35), on the host that refused the runner, and the partner "Login" at `https://partner.spreadshirt.com/login` (html:12).
  [RENDERED] The partner terms (row 40, `…/terms-and-conditions-for-shop-partner-C2376`, a 403) cannot be reached from this page.
  By tick 7's own rule ("If it is only an imprint, or it links back to the 403 host, candidate 17 waits for the step-8
  written question", `spreadshirt.md:192-193`), the render route for KILL-4 is closed. [INFERENCE]

**(2) The one new fact: the region chosen decides who the contract is with.**
- `txt:16` "If you choose North America / Oceania as the region for your Spreadshop, your contractual partner for the opening and
  operation of the Spreadshop is Spreadshirt, Inc." / `txt:18` "If you choose Europe as the region for your Spreadshop, your
  contractual partner for the opening and operation of the Spreadshop is sprd.net AG ." / `txt:20` "For the Spreadconnect/SPOD
  service, your contractual partner is Spreadshirt Print On Demand GmbH." [RENDERED]
- This is the "EU/NA account split" that row 40 asked about. It exists, and the region picked at registration sets the
  counterparty. The page names only these two regions. Israel is in neither, and whether a partner resident elsewhere may
  pick one, and which, is **UNKNOWN**. [RENDERED / INFERENCE]

**(3) KILL-4, AI, fees, eligibility, payout, identity: none of them is on the page.**
- In the text, "automat", "API", "upload" and "design" get 0 hits each. "AI" appears once, as the footer link "AI Guide"
  (`txt:125`). "fee", "commission", "payout", "PayPal", "tax", "country", "Israel" and "identity" get 0 hits each.
  [RENDERED absent]
- In the `.html`, the one "automat" hit is a CMS blurb, "Spreadshop has unique features to help you automate and sell your
  merch." (html:87). It is marketing copy, not a rule on automated uploads. [RENDERED] So KILL-4 is still untested, the AI
  rule is still snippet-only (tick 6, finding 5), and Israel is still UNKNOWN.

**(4) New: a contact route for the step-8 question.** `research/owner-asks/brand-mailbox-questions.md:102` says "Contact
route: not in any capture". This capture now has one.
- `contact@spreadshop.com` is the "E-Mail" of Spreadshirt, Inc. (`txt:24`, `:34-36`; `mailto:` at html:31). [RENDERED]
- The "Spreadshop Contact Form" (`txt:106`) is `https://www.spreadshop.com/contact/` (html:87). [RENDERED] E-mail is the better
  route: a form may demand a personal name or phone, and then it may not be submitted (`brand-mailbox-questions.md:22-23`).
  [INFERENCE]
- `legal@spreadconnect.com` (`txt:61`) belongs to Spreadshirt Print On Demand GmbH (`txt:50-61`), which runs the
  Spreadconnect/SPOD service (`txt:20`), not Spreadshop. It is not used. [RENDERED / INFERENCE]
- Caveat: the address belongs to the NA/Oceania counterparty. The question asks for a platform rule, not for account action,
  so either entity can answer it. [INFERENCE]

**(5) Leads on the host that answers. They are recorded, not queued, and none of them can move the verdict.** The CMS
map at html:87 carries help-centre slugs on www.spreadshop.com, including
`helpcenter/earning-money-with-spreadshop/payment-of-your-earnings` and
`helpcenter/getting-started/how-should-i-choose-the-region-during-registration`. The footer "AI Guide" is
`https://www.spreadshop.com/ai-print-on-demand/` (html:87). [RENDERED] They could speak to payout and Israel, region
eligibility and AI. None of them is the partner terms, though, so none can settle KILL-4. This page prints the two help
pages only as slugs, not as URLs, so any URL built from them would be an inference. [INFERENCE]

**Verdict for candidate 17 (Spreadshirt): NEEDS_MORE.** The legal-information page is an imprint. It links no partner terms,
seller agreement or design/content policy, and it is silent on automated uploads, AI, fees, countries, payout and identity.
KILL-4 is untested, and the renders cannot test it: the terms sit on the 403 host, and the API docs answered 406 twice. It
adds the region-based counterparty and a contact address. No gate is passed or killed.

**Single next check: the step-8 written question.** Its pre-send condition is met: "send unless the queued renders (rows
63-64, …) have produced a written rule on uploads" (`brand-mailbox-questions.md:103-104`), and rows 63, 64 and 99 produced
none. It waits for owner step 8 and the brand connector (`brand-mailbox-questions.md:9-11`). It is the only question in this
message. The payout and EU-display questions stay held until after a yes (`brand-mailbox-questions.md:124-125`).

- **Recipient:** `contact@spreadshop.com` (`spreadshop-legal-information.txt:36`).
- **Subject:** Question: automated design uploads by a partner

```text
Hello Spreadshirt partner team,

Mehudak (מהודק) is a small design brand considering the Spreadshirt Marketplace and a Spreadshop. Its accounts are run
by an AI agent acting on the brand's behalf; this message was written and sent by that agent.

One question, yes or no: may a partner upload and publish designs through an automated process, either an API or an
automated browser session run on the partner's behalf? If there is an API for this, a link to its documentation would
answer the question too. We are asking for your current rule only, not for an exception or a commitment.

Thank you,
Mehudak (מהודק)
```

The text is the draft at `brand-mailbox-questions.md:107-119`, verbatim. **For the main thread**, since this reader may edit
only the two measurement files: `brand-mailbox-questions.md:102-104` should name this recipient in place of "not in any
capture". **Yes** passes the automation gate. **No** is KILL-4 (`brand-mailbox-questions.md:121-123`).
