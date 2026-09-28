# Spreadshirt (candidate 17) — the ₪0 test could not be read from a runner

**Status: REFUSED 28.9.2026 (tick 5, render-watch run 26, commit `815c2e5`).** All six Spreadshirt pages the breadth board
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
