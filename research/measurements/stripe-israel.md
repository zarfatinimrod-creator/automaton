# Measurement: Stripe account countries and Connect cross-border payouts for Israel (BOARD-LOOP rank 9, ZERO-TESTS rows 3-4)

**Date:** 2026-09-27
**Ordered by:** `research/channel-loop/BOARD-LOOP.md:143-148` (candidate 9, "Polar.sh as a second merchant-of-record
rail — ₪0 test only, not a channel") and `research/channel-loop/ZERO-TESTS.md:12-13` (row 3: "whether Israel is a Stripe
account country"; row 4: "whether a Connect Express account in Israel can receive cross-border payouts").
**Kill rule being tested (BOARD-LOOP.md:148):** "Kill if: Stripe's cross-border payout page excludes Israel; Polar's
acceptable-use excludes the products; an Israeli individual cannot complete onboarding without a camera step; or the
all-in cost is not better than Freemius or Gumroad." This file reads only the first clause. The other three rest on
Polar's pages, which are not among the captures read here.
**Also answers:** the open question in `docs/REJECTED.md:1420-1424`, which asked someone to open `https://stripe.com/global` and
check whether Israel appears in the supported-countries list.

## Grades
- **RENDERED**: the sentence is quoted from the stored capture, with its line number (`grep -n`).
- **UNKNOWN**: the capture does not answer the question. Nothing below comes from general knowledge. The one
  definitional fact this reading uses from outside the page is labelled where it appears (Q2).

---

## 1. What was read

| File | What it is |
|---|---|
| `research/rendered/stripe-global.txt` (1,174 lines) | extracted text of `https://stripe.com/global`. I read the country list and the lines around it (lines 600-1000) in full, and grepped the rest. |
| `research/rendered/stripe-global.html` | raw HTML, read only for list structure: 51 `GlobalCountryListItem` entries, their flag `alt` codes and their link targets |
| `research/rendered/stripe-global.meta.json` | capture metadata |
| `research/rendered/stripe-cross-border-payouts.txt` (159 lines) | extracted text of `https://docs.stripe.com/connect/cross-border-payouts`, read in full |
| `research/rendered/stripe-cross-border-payouts.html` | raw HTML, read only for link targets and for the single `Israel` string it contains |
| `research/rendered/stripe-cross-border-payouts.meta.json` | capture metadata |

From the `.meta.json` files (both captured by `.github/workflows/render-watch.yml`, `status` 200, `truncated` false, `firstFetch` true):

| Capture | `url` | `fetchedAt` | `byteLength` | `sha256` |
|---|---|---|---|---|
| stripe-global | `https://stripe.com/global` | **`2026-09-27T22:46:01.871Z`** | 501118 | `6434ff9d0c50657151bacff7c2083c8c5b2140b113f9d10eaa6cf6f64b399cb5` |
| stripe-cross-border-payouts | `https://docs.stripe.com/connect/cross-border-payouts` | **`2026-09-27T22:46:03.216Z`** | 356880 | `096b5fad23453a7a2e4e4b1c339e607b0d6ffb247d2406f4f21576ed5587e956` |

The cross-border capture's meta records `"redacted": 1`. The redacted string is the sample secret key that Stripe's docs page
embeds next to a public `pk_test_` sample key in its page config. It has no bearing on anything below.

**Mechanical searches:**
- `grep -n -i "israel"` over `stripe-global.txt`, `stripe-global.html` and `stripe-cross-border-payouts.txt` returns **0 hits** in each.
- `stripe-cross-border-payouts.html` has **1 hit**, at HTML line 1204:
  `"IL":{"name":"Israel","name_with_article":null}`. It sits inside a page-framework `"countries"` dictionary of 249 ISO
  code→name entries. That dictionary also holds `"IR":{"name":"Iran"...}` and `"IQ":{"name":"Iraq"...}`, so it is a
  lookup table of country names, not a list of supported countries.
- In `stripe-global.html`, no one of the 51 country-list entries has flag code `IL`.

---

## 2. Questions, quotes and grades

### Q1. Is Israel listed as a country where a business can open a Stripe account? — **No. RENDERED.**

The list's heading and its claim, `stripe-global.txt:607-609`:
> 607: Global availability
> 609: Stripe is currently supported in the following countries/regions, with more to come. Once Stripe is supported in your country/region, you’ll be able to sell to customers anywhere in the world.

The list runs from line 611 (`Australia`) to line 725 (`United States`), 51 entries. The list is alphabetical, and Israel would
fall between Ireland and Italy. Here is that stretch, `stripe-global.txt:651-667`:
> 651: Hong Kong
> 653: Hungary
> 655: India
> 657: Preview
> 659: Indonesia
> 661: Preview
> 663: Ireland
> 665: Italy
> 667: Japan

Israel does not appear. The list's last entries, `stripe-global.txt:719-725`:
> 719: Thailand
> 721: United Arab Emirates
> 723: United Kingdom
> 725: United States

**How the list works (HTML):** each ordinary entry links to `https://dashboard.stripe.com/register?country=<CODE>`
(for example `?country=IE`, `?country=IT`). The two "Preview" entries, India and Indonesia, link to `/contact/sales`. The five
"Extended network" entries (Côte d'Ivoire, Ghana, Kenya, Nigeria, South Africa; the badge first appears at `stripe-global.txt:625`)
link to `paystack.com`. None of these paths names Israel either.

What the page offers a business outside the list, `stripe-global.txt:727-729`:
> 727: Is your business outside of a supported country/region?
> 729: Use Stripe Treasury with stablecoins to manage your money globally— accessible from the USA and 100+ additional countries/regions . Payments not supported yet.

It also offers Stripe Atlas, `stripe-global.txt:741-743`:
> 741: Stripe Atlas
> 743: Incorporate a US company from anywhere in the world with just a few clicks. You'll be able to open a US bank account, accept payments, and fundraise in two business days.

- The stablecoin route says "Payments not supported yet" (line 729), so it is not an income rail. **RENDERED.**
- Atlas's price and ongoing obligations: **NOT ON THIS PAGE. UNKNOWN.**
- The locale selector at lines 747-993 also leaves out Israel. It does list Mainland China (line 885), which is not in the
  supported list, so the selector says nothing about support and is not used as evidence here.

### Q2. Is Israel listed among the countries that can receive Connect cross-border payouts? — **No. Israel is not named. RENDERED.**

The page lists regions, not countries. `stripe-cross-border-payouts.txt:90-96`:
> 90: Use cross-border payouts to transfer funds to connected accounts in their local currencies when your platform and connected accounts are in different supported regions.
> 92: Platforms based in the US, UK, EEA, Canada, or Switzerland can transfer funds to connected accounts in any of those regions, regardless of the payment settlement currency. For example:
> 93: A platform in the UK can pay out to a seller in the US.
> 94: A platform in Germany can pay out to a seller in Canada.
> 96: Stripe doesn’t support self-serve cross-border payouts to countries outside the listed regions. Contact sales to discuss alternatives, or use Global Payouts.

The comparison table's platform-location row repeats the regions, `stripe-cross-border-payouts.txt:107-109`:
> 107: Platform location
> 108: US, UK, EEA, CA, and CH
> 109: US, UK

- Recipients must be connected accounts "in any of those regions" (line 92). Countries "outside the listed regions" get
  no self-serve cross-border payouts (line 96). "Israel" appears 0 times in the page text. **RENDERED.**
- **The one fact from outside the page:** Israel is not a member of the EEA. The page does not list the EEA's members.
  This is a matter of definition, not an inference about Stripe policy. It is stated here openly so a verifier can check it.
- The page does not say whether a Connect **Express** account can be opened in Israel at all, as distinct from receiving
  cross-border payouts. **NOT ON THIS PAGE. UNKNOWN.**

### Q3. Is there a service-agreement or account-type restriction (recipient service agreement, Express only, and so on)?

**Recipient service agreement: RENDERED.** `stripe-cross-border-payouts.txt:139-140`:
> 139: Limitations
> 140: Service agreement : You can’t make cross-border payouts to connected accounts under a recipient service agreement . For those accounts, use Global payouts .

In the HTML, "recipient service agreement" links to `https://stripe.com/connect-account/legal/recipient`, and "Global payouts"
links to `https://docs.stripe.com/global-payouts`.

**Supported funds flows: RENDERED.** `stripe-cross-border-payouts.txt:141-143`:
> 141: Supported funds flows : Cross border payments supports the following funds flows Separate charges and transfers without on _ behalf _ of
> 142: Top-ups and transfers
> 143: Destination charges without on _ behalf _ of

**Express only / Standard / Custom: NOT ON THIS PAGE. UNKNOWN.** `grep -n -i -E "express|standard|custom account|controller"`
over the page text returns 0 hits. The page names no connected-account type.

### Q4. Can Israel be paid through the page's own alternative, Global Payouts? — **NOT ON THIS PAGE. UNKNOWN.**

The page defers the answer to a page that was not captured. `stripe-cross-border-payouts.txt:98`:
> 98: Global Payouts allows platforms in certain countries to transfer funds to recipients in any supported country . Use the following table to choose between cross-border payouts and Global Payouts.

In the HTML, "any supported country" links to `/global-payouts/recipient-requirements`, which resolves to
`https://docs.stripe.com/global-payouts/recipient-requirements`. The product's behaviour, `stripe-cross-border-payouts.txt:103-105`:
> 103: Behavior
> 104: Onboard users to your platform and split payments or pay out balances to them.
> 105: Send money directly to the bank account of a third party.

Its compliance row, `stripe-cross-border-payouts.txt:118-120`:
> 118: Compliance
> 119: Shift legal and compliance requirements to Stripe using the Stripe Money Transmitter license.
> 120: Manage your own legal and compliance requirements. This might require a Money Transmitter license if you manage your customers’ funds.

The platforms that can use Global Payouts are in the US or UK (line 109). Whether Israel is a recipient country is not on this page.

### Q5. What would a cross-border payout to Israel cost? — **NOT ON THIS PAGE. UNKNOWN.**

`stripe-cross-border-payouts.txt:137-138`:
> 137: Pricing
> 138: Cross-border payout fees depend on the location of the recipient. See Connect payout pricing .

The link target is `https://stripe.com/connect/pricing#payouts`. It was not captured.

### Q6. Does this explain why Algora's code (`docs/REJECTED.md:1411-1414`) and Polar's docs (`BOARD-LOOP.md:145`) list Israel? — **NOT ON THIS PAGE. UNKNOWN.**

Neither capture mentions Polar or Algora. Line 140 does name one route by which a platform can still pay a connected
account that cross-border payouts cannot reach: accounts "under a recipient service agreement" go through Global Payouts.
Whether Polar or Algora use that route for Israel, or a sales-negotiated arrangement (line 96: "Contact sales to discuss
alternatives"), cannot be read from these captures.

---

## 3. Verdict for the board: **FAILS_TEST**

- **ZERO-TESTS row 3** ("whether Israel is a Stripe account country"): **No. RENDERED.** Israel is absent from the
  51-entry supported list (`stripe-global.txt:609-725`, and between Ireland and Italy at 663-665) and has no
  `register?country=IL` link. This settles the question `docs/REJECTED.md:1420-1424` left open: as of `fetchedAt`
  2026-09-27T22:46:01Z, **a standalone Stripe account for an Israeli business is not offered**. The provisional
  rejections that rest on it (REJECTED.md:1425-1426: Substack, beehiiv, Medium Partner, Polar) should be re-read against
  this page, not left provisional. Doing that is outside this file's scope.
- **ZERO-TESTS row 4** ("whether a Connect Express account in Israel can receive cross-border payouts"): **No, not
  self-serve. RENDERED** (`stripe-cross-border-payouts.txt:92`, `:96`). Recipients must be in the US, UK, EEA, Canada or
  Switzerland, and Israel is not named. Accounts under a recipient service agreement are excluded outright (`:140`).
- This meets the first kill clause at **BOARD-LOOP.md:148** ("Stripe's cross-border payout page excludes Israel"). The
  exclusion is by omission: the page never names Israel and limits self-serve payouts to five named regions. Candidate 9's
  premise at BOARD-LOOP.md:145 ("route payouts through Stripe Connect Express cross-border") is contradicted by the rendered page.
- The kill itself is a board decision (Fable tier under CLAUDE.md's routing rule). This file supplies the reading only.

**Reopen trigger (named in the capture, not read):** `https://docs.stripe.com/global-payouts/recipient-requirements`
(the "any supported country" link, `stripe-cross-border-payouts.txt:98`). Reopen only if both of these hold:
1. that page lists Israel as a Global Payouts recipient country, and
2. Polar's own payout documentation says Polar pays through Global Payouts. Polar's page is not named in these captures.

Supporting pages if reopened: `https://stripe.com/connect/pricing#payouts` (the fee, `:138`) and
`https://stripe.com/connect-account/legal/recipient` (the agreement, `:140`).

**Consequence for owner step 4 (Stripe Express via Algora), which BOARD-LOOP.md:145 said this test pre-checks:** the
rendered page does not show how an Israeli Express account would be paid. Algora's code lists Israel (REJECTED.md:1411-1414)
and the rendered Stripe page does not, and these captures cannot settle that conflict. Before the owner is asked for step 4's
KYC, the same recipient-requirements page should be rendered and read. Asking first would repeat the repo's named defect: a
claim nobody checked.

---

## 4. What the owner would have to do if admitted, and whether it costs money

**As tested: nothing.** The candidate fails, so no owner step is proposed. No account is opened and no KYC is asked.

**If reopened through Global Payouts:** the steps come from BOARD-LOOP.md:147, not from these captures.
- **One-time:** a Polar organisation under the brand "Mehudak", with Stripe onboarding in the owner's legal identity.
  BOARD-LOOP marks this as inferred and unverified. Existing owner steps 2 and 7 would also be needed.
- **Recurring:** none named on these pages. Whether any per-payout paperwork applies is **NOT ON THIS PAGE**.
- **Camera step:** **NOT ON THIS PAGE.** Onboarding identity requirements sit behind the uncaptured link "Required
  verification information" (`stripe-cross-border-payouts.txt:146`, which resolves to
  `https://docs.stripe.com/connect/required-verification-information`).

**Money:**
- Opening a supported-country account: "Create an account and start accepting payments—no contracts or banking details
  required." (`stripe-global.txt:735`). This applies only to listed countries, which excludes Israel (Q1).
- Cross-border or Global Payouts fees: **NOT ON THIS PAGE** (`:138`). Whether they are deducted from payouts or billed to the
  owner is also not on the page.
- Stripe Atlas (`stripe-global.txt:743`), the page's only route for a business outside the list to "accept payments": its
  price is **NOT ON THIS PAGE**. Buying it would be an owner cost, and the ₪0 rule of 27.9.2026 bars that until the ledger
  shows income. Incorporating a US company would also bring new recurring obligations; those are not on this page either.
- The cost of owner step 2 is measured separately in `research/measurements/step2-cost.md`, not here.
