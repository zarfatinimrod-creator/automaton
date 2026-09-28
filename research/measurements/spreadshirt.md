# Spreadshirt (candidate 17) — the ₪0 test could not be read from a runner

**Status: REFUSED 28.9.2026 (tick 5, render-watch run 26, commit `815c2e5`); tick 6 tried a second route (official
GitHub org read, container curl egress-blocked, 3 snippets) — still NEEDS_MORE, no gate passed or killed.** All six Spreadshirt pages the breadth board
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
