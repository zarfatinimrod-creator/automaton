# Measurement: Polar (polar.sh) as a sales rail for an Israeli seller (ZERO-TESTS row 17, BOARD-LOOP candidate 9)

**Status: MEASURED 28.9.2026** from the stored capture, `fetchedAt` **`2026-09-28T01:55:22.949Z`**. Verdict: NEEDS_MORE (end of file).
**Ordered by:** `research/channel-loop/ZERO-TESTS.md:26` (row 17: "whether Polar pays a seller in Israel and through which
Stripe mechanism") and Q11 of `research/measurements/stripe-israel.md`.
**Grades:** [RENDERED] is quoted from the capture with its line. [INFERENCE] is reasoned, not read; check it before relying on it.

## What was read
- `research/rendered/polar-supported-countries.txt` (431 lines), read in full: extracted text of
  `https://polar.sh/docs/merchant-of-record/supported-countries`.
- `.meta.json`: `status` 200, `fetchedAt` `2026-09-28T01:55:22.949Z`, `byteLength` 386196, `truncated` false, `firstFetch` true,
  `sha256` `80ca9109d36b1740c4c60a6115b05a1392fca4aff2a9cd704c45802c8837e954`.
- `.html`, read only for link targets and to confirm the Israel entry: 2 hits, the rendered `<li>🇮🇱 Israel` (HTML line 446)
  and the same list item in the page's own script bundle (line 527).
- Searches over the `.txt`: `grep -n -i israel` gives 1 hit (`:246`). `grep -n -w IL` gives 0. "Global Payouts" gives 0.

## What the page says [RENDERED]
1. **Israel is on the payout list.** Under the heading "Payouts" (`:140`), `polar-supported-countries.txt:142`: "Polar uses
   Stripe Connect Express to issue payouts to residents or businesses in any of the countries below. See Payout Accounts for
   how to connect one." The entry, `:246`: "🇮🇱 Israel", between Ireland (`:244`) and Italy (`:248`). The list runs from
   Albania (`:146`) to Vietnam (`:382`), 119 entries.
2. **Two scopes.** Buyers, `:136`: "We support payments globally except from countries with US sanctions (Cuba, Russia, Iran,
   North Korea, and Syria)." and `:137`: "As your Merchant of Record (MoR) we take on the liability for international sales
   taxes ." Sellers: only the flag list under "Payouts" (`:140-382`) is about receiving money.
3. **Mechanism: Stripe Connect Express, from a US platform.** `:392`: "all payments from customers are made to Polar (US).
   Stripe Connect Express is then used to issue payouts, and is supported in more countries via cross-border transfer than
   Stripe Payments standalone." Same line: "We only use the transfer and payout feature of Stripe Connect Express which is
   available in all of our supported countries ." `:144`: "All you need is to be in a country supported by Stripe Connect
   Express to receive payouts." The account shape: `:399` "Ensure Platform Country is set to United States (US) .", `:401`
   "Ensure Dashboard Type is set to express .", `:403` "Ensure Service Agreement is set to recipient .", `:405` "Ensure
   Capability is set to transfers ." The page never names Stripe Global Payouts.
4. **Individuals: yes, on a condition.** `:392`: "Yes, any individual or company operating in our supported countries can
   receive payouts from Polar even if Stripe standalone is invite-only there." `:396`: "Yes, given that Stripe Connect Express
   supports individual as a business type in your region." `:409` sends the reader to Stripe's "Business Type" toggle to find
   out. Whether "individual" is offered for Israel: not on this page.
5. **Fees, thresholds, minimums, payout currency, payout schedule:** not on this page. The only fee reference is the sidebar
   link "Fees" (`:86`), target `https://polar.sh/docs/merchant-of-record/fees`.
6. **Identity checks, a camera or selfie step, what may be sold:** not on this page. Linked but not rendered: "Payout
   Accounts" → `https://polar.sh/docs/features/finance/accounts`; "verification information" (`:397`) →
   `https://docs.stripe.com/connect/required-verification-information#US+RS+express+recipient+individual+transfers`;
   "Acceptable Use" → `https://polar.sh/docs/merchant-of-record/acceptable-use/introduction`; "Account reviews" →
   `https://polar.sh/docs/merchant-of-record/account-reviews`.

## What this means [INFERENCE — check before relying on it]
- Israel's presence no longer rests on Stripe's pages alone: Polar's own docs name it as a payout country, paid through a
  Stripe Connect Express account with a recipient service agreement on a US platform.
- That account shape matters against tick 1. Stripe's cross-border page says "You can’t make cross-border payouts to connected
  accounts under a recipient service agreement . For those accounts, use Global payouts ." (`stripe-cross-border-payouts.txt:140`).
  Polar's accounts are recipient accounts (`:403`), so the Stripe product that reaches Israel is most likely Global Payouts,
  which lists Israel for a US sender to an individual or a company (`stripe-israel.md` Q7). Polar's page calls it
  "cross-border transfer" (`:392`) and does not confirm this.
- So tick 1's reopen condition 2 ("Polar's own payout documentation says Polar pays through Global Payouts") is not literally
  met. What is met: Polar sends from the US (`:392`, `:399`), a Global Payouts sender country. Kill clause 1 at
  BOARD-LOOP.md:148 now reads against a route Polar does not appear to use for Israel. Whether that clears it is a board call.
- The individual question moves to one Stripe page (US platform, express, recipient, transfers, account country Israel). An
  osek patur is not addressed anywhere on this page.
- Payout currency is unknown. Stripe's Global Payouts row for Israel is ILS by local bank method (`stripe-israel.md` Q7), but
  that is Stripe's table, not Polar's statement.
- Brand rule: Stripe onboarding would be in the owner's legal identity. Whether buyers see that name or only a "Mehudak"
  organisation is not on this page. No fee is stated, so the ₪0 fit cannot be confirmed here.

## Verdict for Polar as a sales rail: **NEEDS_MORE**
Israel is on Polar's payout list, and Polar pays from a US platform through Stripe Connect Express recipient accounts, so the
Israel gate passes on Polar's own page. Three kill clauses remain unread: whether an Israeli individual can onboard (and
whether that needs a camera step), whether the products fall under acceptable use, and whether the all-in cost beats Freemius
or Gumroad. For an Israeli individual seller, the onboarding question is the gate.
**Next check:** render `https://docs.stripe.com/connect/required-verification-information` (the page Polar links at `:397`)
and read the entry for Platform US, account country Israel, express, recipient, transfers: is "individual" a business type,
and which identity documents does it require.
