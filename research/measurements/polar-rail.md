# Measurement: Polar (polar.sh) as a sales rail for an Israeli seller (ZERO-TESTS row 17, BOARD-LOOP candidate 9)

**Status: after tick 4 (28.9.2026): FAILS_TEST (selfie required by Polar's own docs, see the last section); the reading below was NEEDS_MORE before that check.** Fees pass the ₪0 rule; the products fit the acceptable-use summary but the
binding list is uncaptured; the Stripe capture has no Israel entry, so the camera gate is still unread. See "Tick 4 reading" at the end.
Earlier status (tick 3): **MEASURED 28.9.2026** from the stored capture, `fetchedAt` **`2026-09-28T01:55:22.949Z`**. Verdict: NEEDS_MORE (end of file).
**Ordered by:** `research/channel-loop/ZERO-TESTS.md:26` (row 17: "whether Polar pays a seller in Israel and through which
Stripe mechanism") and Q11 of `research/measurements/stripe-israel.md`.
**Grades:** [RENDERED] is quoted from the capture with its line. [INFERENCE] is reasoned, not read; check it before relying on it.

## What was read
- `research/rendered/polar-supported-countries-2026-09-28.txt` (431 lines), read in full: extracted text of
  `https://polar.sh/docs/merchant-of-record/supported-countries`.
- `.meta.json`: `status` 200, `fetchedAt` `2026-09-28T01:55:22.949Z`, `byteLength` 386196, `truncated` false, `firstFetch` true,
  `sha256` `05cc3bd8e7361715b43bfc21ae25c67ca3ff9015d90185eef299bd91a9a31688` (since the one-time re-mask of 5.10.2026, one address masked; before it `80ca9109…`).
- `.html`, read only for link targets and to confirm the Israel entry: 2 hits, the rendered `<li>🇮🇱 Israel` (HTML line 446)
  and the same list item in the page's own script bundle (line 527).
- Searches over the `.txt`: `grep -n -i israel` gives 1 hit (`:246`). `grep -n -w IL` gives 0. "Global Payouts" gives 0.

## What the page says [RENDERED]
1. **Israel is on the payout list.** Under the heading "Payouts" (`:140`), `polar-supported-countries-2026-09-28.txt:142`: "Polar uses
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

## Tick 4 reading (28.9.2026): acceptable use, fees, and Stripe's verification requirements

**Ordered by:** `research/channel-loop/ZERO-TESTS.md:28-30` (rows 19-21). **Grades:** as at the top of this file.
**Read in full:** the three `.txt` files below, plus their `.html` (for link targets and, for Stripe, the page state). All have `status`
200, `truncated` false and `firstFetch` true. For Stripe, `redacted` 65 means 65 copies of `[redacted:stripe-secret-key]` (the docs sample key).
- `polar-acceptable-use-2026-09-28.txt` (177 lines), `.../merchant-of-record/acceptable-use/introduction`, `fetchedAt` `2026-09-28T07:15:22.367Z`, sha256 `73feedd2721f…` (re-masked 5.10.2026, one address; was `8b94125b7f68…`)
- `polar-fees-2026-09-28.txt` (330 lines), `.../merchant-of-record/fees`, `fetchedAt` `2026-09-28T07:15:23.537Z`, sha256 `468d494c9cb9…` (re-masked 5.10.2026, one address; was `f1a66d91b3ff…`)
- `stripe-connect-required-verification.txt` (79 lines), `docs.stripe.com/connect/required-verification-information`, `2026-09-28T07:15:21.014Z`, sha256 `60805c9a4ea0…`

### (1) Acceptable use
- [RENDERED] `polar-acceptable-use-2026-09-28.txt:140`: "Polar is built for software companies, so the policy covers digital goods and services such as:";
  `:142` "Software & SaaS"; `:144` "Digital products: templates, eBooks, code, icons, fonts, design assets, and similar".
- [RENDERED] `:148`: "It also lists what isn’t supported — for example physical goods, human services, marketplaces, and high-risk or
  regulated categories — along with businesses that require a closer review."
- [RENDERED] This page is only a summary. `:156-157`: "Read the full Acceptable Use Policy" / "The complete and binding list of acceptable,
  prohibited, and restricted products." The link points to `https://polar.sh/legal/acceptable-use-policy` (`.html:401`), which was not captured.
- [RENDERED] `:154`: "Every organization is reviewed against the AUP before its first payout and monitored continuously afterwards. Learn
  more in Account Reviews ."
- [RENDERED] **AI rule: none in the capture.** The only "AI" in the text is the docs chatbot footer at `:177` ("Responses are generated
  using AI and may contain mistakes."), which is not policy. "AI-generated" and "artificial intelligence" get 0 hits in the `.html`. "Hebrew" and "Israel": 0.
- [INFERENCE] The calculators with a Pro licence and the small software tools fall under "Software & SaaS". Templates and digital downloads
  are named outright. The VAT-report validator/generator is software too, but `:148` does not define "regulated categories", and
  only the binding list can say whether a tax-filing tool is one. Nothing is shown banned, and nothing is cleared against the binding list.

### (2) Fees
- [RENDERED] `polar-fees-2026-09-28.txt:147-149` "Starter" / "Free" / "5% + 50¢"; `:140` "a free Starter plan plus three optional paid plans";
  `:213` "Organizations created on or after May 27, 2026 start on Starter (5% + 50¢)." The Early Member rate (`:203-210`) is for older organizations only.
- [RENDERED] `:220` "+1.5% for international cards (non-US)"; `:222` "+0.5% for subscription payments — Early Member only . Starter,
  Pro, Growth, and Scale have no separate subscription fee."; `:224` "We also reserve the right to pass on any other fees Stripe might impose in the future."
- [RENDERED] Fees are charged on the VAT-inclusive total. The worked example (`:230-267`) takes Starter's "$2.38" and "$0.56" from
  "$37.5", which is $30 plus 25% VAT.
- [RENDERED] Payouts. `:288` "Polar does not add any extra fees or markup"; `:291-297` "Fees (Stripe)" / "$2 per month of active payout(s)"
  / "0.25% + $0.25 per payout" / "Cross border fees (currency conversion): 0.25% (EU) - 1% in other countries." Withdrawals are
  manual (`:289`), and Polar forces a payout after "several months" of no withdrawal (`:290`).
- [RENDERED] Other deductions. `:280` disputes: "$15 per dispute regardless of outcome and is deducted from your balance directly". `:273`:
  the fee is not returned on a refund. `:274`: Polar may refund "up to 60 days after the purchase".
- [RENDERED] Not on the page: minimum payout, payout currency, payout schedule (`grep -i "minimum|currency|USD|ILS"` finds only `:297`).
- [INFERENCE] **₪0 rule: passes on Starter.** There is no monthly fee, and every rendered fee comes out of a sale, a payout or a dispute.
  The $2 applies "per month of active payout(s)", so it should not reach a month without a payout. The page does not say whether it is
  deducted or billed. On a non-US card, before payout costs, Starter takes $1.09 of a $9 sale (12.1%) and $2.39 of a $29 sale (8.2%).
  Israel is outside the EU, so conversion is probably up to 1%. The comparison with Freemius and Gumroad was not made this tick.

### (3) Stripe: US platform, account country Israel, express, recipient, individual
- [RENDERED] **The capture does not hold the Israel entry.** The `.txt` is page chrome only: the title (`:1`, `:5`), the Connect
  sidebar (`:30-72`) and a breadcrumb that ends at `:79` "Capabilities and information requirements". It has no requirement, no
  country and no form. `grep -i israel` returns 0.
- [RENDERED] The `.html` keeps the page source as state (line 1043, `window.__INITIAL_STATE__`, 909,787 chars). Its agent partial says
  the page "allows the user to select connected account fields and regions using a form, and then makes API requests to fetch and
  display the requirements". The per-setup table is fetched at runtime from `https://docs.stripe.com/_endpoint/get-requirements-for-setups`,
  so it is not in the capture. The same state has a recipient rule: "if `tosType=recipient`, force `transfers` and remove all other capabilities except `crypto_transfers`".
- [RENDERED] The state holds static country notes for 19 partials (AE AU BR CA CH CZ EE EU GB HK IE IN JP LV MX NZ SG TH US), none
  for IL. The only "Israel" in the file is the `"IL":{"name":"Israel",...}` country-name dictionary, the same one ticks 1-2 found. It is not evidence.
- [RENDERED] Selfie text exists, but every passage is scoped to one country or region. The CA notes (`reqinfo--CA`) say "proof of
  liveness, which entails taking a selfie and uploading a government-issued ID document using Stripe Identity". Similar passages sit
  under TH, SG, BR and EU. None applies to IL or to all countries.
- [RENDERED] Polar's own deep link (`polar-supported-countries-2026-09-28.html:519`) is `#US+RS+express+recipient+individual+transfers`. Its
  account country is RS (Serbia), not IL.
- **What would hold the answer** (the page's own flow): first `https://docs.stripe.com/_endpoint/get-requirement-selections-for-platform-country?platformCountry=US`,
  read `country_map.IL` (`dashboard_types`, `tos_types`, `entity_type_structures`); then
  `https://docs.stripe.com/_endpoint/get-requirements-for-setups?account-setup-A[apiVersion]=v1&account-setup-A[platformCountry]=US&account-setup-A[accountCountry]=IL&account-setup-A[dashboardType]=express&account-setup-A[tosType]=recipient&account-setup-A[legalEntityType]=individual&account-setup-A[capabilities][0]=transfers`.
  [INFERENCE] These are plain GETs, so the render watch should capture them even though the JS page came back empty.
- [INFERENCE, scout grade, not rendered] `research/breadth/scouts/storefront-rails.json:207` quotes Polar's docs source
  (`account-reviews.mdx`): "The organization owner verifies their identity with a passport, ID card, or driver's license along with a
  selfie — … through Stripe Identity". It also quotes Polar's code: `'require_live_capture': True, 'require_matching_selfie': True`.
  If true, Polar asks for the selfie itself, whatever Stripe lists for IL.

## Verdict for Polar as a sales rail (tick 4): **NEEDS_MORE**
The fees pass the ₪0 rule: Starter is free, and every fee comes out of a sale, a payout or a dispute. The products sit inside the
categories the acceptable-use summary names, but the binding list and any AI rule were not captured. The camera gate is still
unread on any rendered page: Stripe's capture has no Israel entry, and a scout (github grade) reports that Polar's own account review
requires a Stripe Identity selfie. **Next check:** render `https://polar.sh/docs/merchant-of-record/account-reviews` (linked at
`polar-acceptable-use-2026-09-28.txt:154`). If it says the organization owner must verify with a selfie, the camera kill clause
(`BOARD-LOOP.md:148`) is met on Polar's own page, and the verdict becomes FAILS_TEST with no further Stripe reading.

## Tick 4 verdict (28.9.2026, main thread): FAILS_TEST on the camera gate

Polar's own docs, read from its public repository at github grade (WebFetch of
`https://raw.githubusercontent.com/polarsource/polar/main/docs/merchant-of-record/account-reviews.mdx`, 28.9.2026):
"The organization owner verifies their identity with a passport, ID card, or driver's license along with a selfie —
secure, easy, and quick through Stripe Identity."

The owner's brief forbids a camera step, and the kill clause at `research/channel-loop/BOARD-LOOP.md:148` is met on
Polar's own page, whatever Stripe would ask an Israeli recipient. **Polar is killed as a sales rail.** It reopens only
if Polar documents an owner verification without a selfie. The storefront scout of the breadth sweep reached the same
finding independently (`research/breadth/scouts/storefront-rails.json`, the Polar entry, which also quotes
`require_matching_selfie: True` in Polar's Stripe integration code).
