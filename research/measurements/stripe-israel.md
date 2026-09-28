# Measurement: Stripe account countries and Connect cross-border payouts for Israel (BOARD-LOOP rank 9, ZERO-TESTS rows 3-4)

**Date:** 2026-09-27 (tick 1); extended 2026-09-28 (tick 2)
**Status (updated by tick 2, 28.9.2026): NEEDS_MORE.** Tick 1's FAILS_TEST (§3) is held open, not reversed. Stripe
Global Payouts lists Israel as a recipient country, for individuals and companies, from US or UK senders. That meets
condition 1 of tick 1's two-part reopen rule (RENDERED). Condition 2, whether Polar pays through Global Payouts, is
unread. Connect cross-border payouts still exclude Israel. See "Tick 2 reading" at the end.
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

---

## Tick 2 reading (28.9.2026)

**Ordered by:** `research/channel-loop/ZERO-TESTS.md:23` (row 14: "whether Global Payouts can reach a recipient in Israel —
the one route `research/measurements/stripe-israel.md` leaves open"), and the reopen trigger in §3 above.
**Grades:** as defined at the top of this file. RENDERED means quoted from a stored capture with its line. UNKNOWN means
the capture does not say. Nothing below comes from general knowledge.

### T2.1 What was read

| File | What it is |
|---|---|
| `research/rendered/stripe-global-payouts-recipients.txt` (618 lines) | extracted text of `https://docs.stripe.com/global-payouts/recipient-requirements`, read in full |
| `research/rendered/stripe-global-payouts-recipients.html` (1,298 lines) | raw HTML. Line 1287 is the server-rendered table. Line 1290 is `window.__INITIAL_STATE__`, which holds the page's Markdoc source for **all four** tabs of the table |
| `research/rendered/stripe-global-payouts-recipients.meta.json` | capture metadata |

Metadata: `url` `https://docs.stripe.com/global-payouts/recipient-requirements`, `fetchedAt` **`2026-09-28T00:52:01.825Z`**,
`status` 200, `byteLength` 476285, `sha256` `00a235165f8667b951f0a53328da1eb230681b94f3bd6f671b616a5a82f90bb7`,
`truncated` false, `firstFetch` true. `redacted` 1 is the same docs sample secret as in tick 1
(`"secret":"[redacted:stripe-secret-key]"` next to a public `pk_test_` key). It has no bearing on anything below.

**Why the HTML is needed.** The page has two drop-downs, "Sender country" and "Business type" (`.txt:67-75`). The text
extraction shows only the default tab, which is a United States sender paying a Company recipient. The **Individual** rows
are not in the `.txt`. They are in HTML line 1290. There the Markdoc tree holds a `TabGroup` labelled `"Sender country"`
with items `united-states` and `united-kingdom`. Each of those holds a `TabGroup` labelled `"Business type"` with items
`company` and `individual`, and each of those holds one table. To reproduce:

```
sed -n 1290p research/rendered/stripe-global-payouts-recipients.html | grep -o -E '"id":"(united-states|united-kingdom|company|individual)","title":"[A-Za-z ]+"|\["Israel"\]\},\{[^]]*\["ILS"\]\},\{[^]]*\["Local bank method"\]\},\{[^]]*\["[^"]*"\]' | sed -E 's/\{"\\u0024\\u0024mdtype":"Tag","name":"TableCell","attributes":\{\},"children"://g'
```

It prints, in document order:

```
"id":"united-states","title":"United States"
"id":"company","title":"Company"
["Israel"]},["ILS"]},["Local bank method"]},["Email, company name"]
"id":"individual","title":"Individual"
["Israel"]},["ILS"]},["Local bank method"]},["Email, name"]
"id":"united-kingdom","title":"United Kingdom"
"id":"company","title":"Company"
["Israel"]},["ILS"]},["Local bank method"]},["Email, company name"]
"id":"individual","title":"Individual"
["Israel"]},["ILS"]},["Local bank method"]},["Email, name"]
```

**Mechanical counts:**
- `grep -c -i israel` over the `.txt` returns 1, at line 292.
- In the HTML, line 1287 has 1 `Israel`: the visible table row.
- Line 1290 has 5. Four are the table rows above. The fifth is the same `"IL":{"name":"Israel",...}` entry in the
  country-name dictionary that tick 1 found in the cross-border capture. That dictionary is a list of names, not a list of
  supported countries, and it is not used as evidence here.

### T2.2 Questions, quotes and grades

#### Q7. Can Stripe Global Payouts send money to a recipient in Israel? — **Yes, to a company or an individual, from a US or UK sender. RENDERED.**

The default tab (US sender, Company recipient), `stripe-global-payouts-recipients.txt:292-295`:
> 292: Israel
> 293: ILS
> 294: Local bank method
> 295: Email, company name

The column headers, `.txt:77-80`:
> 77: Recipient country
> 78: Currency
> 79: Payout method
> 80: Required information

The same row is the only `Israel` in the server-rendered markup at `.html:1287`:
`<td …>Israel</td><td …>ILS</td><td …>Local bank method</td><td …>Email, company name</td>` (class attributes shortened).

All four tabs, from `.html:1290` (the command above, with cell wrappers stripped):

| Sender country (tab) | Business type (tab) | Israel row | Character offset in line 1290 |
|---|---|---|---|
| United States | Company | `Israel` · `ILS` · `Local bank method` · `Email, company name` | 25779 |
| United States | Individual | `Israel` · `ILS` · `Local bank method` · `Email, name` | 72619 |
| United Kingdom | Company | `Israel` · `ILS` · `Local bank method` · `Email, company name` | 119528 |
| United Kingdom | Individual | `Israel` · `ILS` · `Local bank method` · `Email, name` | 165523 |

The page's framing, `.txt:57-58` and `:64`:
> 57: Public preview Recipient requirements Public preview
> 58: Learn the information required to onboard recipients, by country, business type, and payout method.
> 64: Requirements vary by your country, and by your recipient’s country, business type, and payout method.

- Israel is listed as a Global Payouts recipient country in all four tabs. **RENDERED.**
- The currency is ILS only. Each tab has one Israel row and no USD row. **RENDERED.**
- The method is "Local bank method", not Wire and not Card. **RENDERED.**
- The page is marked "Public preview" (`:57`). **RENDERED.** What preview status means for access, terms or durability:
  **UNKNOWN.**

#### Q8. Which countries are listed? — **RENDERED.**

- **Senders ("your country"):** there are two, `.txt:67-70`:
  > 67: Sender country :
  > 69: United States
  > 70: United Kingdom
- **Recipients:** the US-sender tables have 103 rows covering 101 countries. The United States appears three times, once
  each for Local bank method, Wire and Card (`.txt:572-585`). The UK-sender tables have 101 rows covering the same 101
  countries (counted from `.html:1290`). The list runs from Albania (`.txt:82`) to Vietnam (`.txt:592`). It is alphabetical
  except for Peru (`:397`), which sits between Mozambique and Namibia. Israel falls between Ireland (`:287`) and Italy (`:297`).
- **The Israel row is identical for US and UK senders.** Across the whole list, only the United States and Mozambique rows
  differ between the two senders' Company tables. **RENDERED** (compared from `.html:1290`).
- **Stablecoin route**, a separate table, `.txt:598` and `:604-607`:
  > 598: USDC payouts are available to businesses located in the United States, sending to recipients with a crypto wallet anywhere in the world. If your business is in New York, sign up to get notified about access .
  > 604: Global
  > 605: USDC ( stablecoin )
  > 606: Crypto Private preview
  > 607: Email, name (or company name, for business recipients), address

  This route names no country. It is open only to US senders and is marked "Private preview". It is not a bank payout,
  and nothing below relies on it.

#### Q9. What does a recipient in Israel have to provide? — **An email and a name (individual), or an email and a company name (company). RENDERED. Anything beyond the table: UNKNOWN.**

- Individual recipient: `Email, name`. Company recipient: `Email, company name`. The same for both senders. **RENDERED**
  (table above).
- The column lists no address, ID, tax ID or phone number for Israel. It does list those where they apply to other
  countries, for example `.txt:170` Costa Rica "Email, ID, company name", `.txt:435` Pakistan "Email, ID, company name,
  address (not a PO box)", and `.txt:135` Bhutan "Email, company name, address, phone number". **RENDERED.**
- The bank-account fields for "Local bank method" are not named in the column. Which fields are asked: **UNKNOWN.**
- Whether the recipient must open a Stripe account, pass identity verification or face a camera or selfie step:
  **NOT ON THIS PAGE. UNKNOWN.** The page says only that this information is required "to onboard recipients" (`:58`).
- Fees, FX spread, payout timing and minimums: **NOT ON THIS PAGE. UNKNOWN.**
- Per-payout paperwork: the page names none. Whether any exists: **UNKNOWN.**
- Who carries compliance: this page does not say. The tick-1 capture says of Global Payouts: "Manage your own legal and
  compliance requirements. This might require a Money Transmitter license if you manage your customers’ funds."
  (`stripe-cross-border-payouts.txt:120`). The burden falls on the sending platform, not the recipient.
  **RENDERED (tick-1 capture).**

#### Q10. Does it matter for (a) Algora paying a bounty solver in Israel (owner step 4)? — **It removes the Stripe-side objection. Whether Algora uses this route: UNKNOWN.**

What is RENDERED across the two Stripe captures:
- Connect cross-border payouts do not reach Israel self-serve (tick 1, `stripe-cross-border-payouts.txt:92`, `:96`). That
  page points platforms to the alternative:
  > 96: Stripe doesn’t support self-serve cross-border payouts to countries outside the listed regions. Contact sales to discuss alternatives, or use Global Payouts.
  > 140: Service agreement : You can’t make cross-border payouts to connected accounts under a recipient service agreement . For those accounts, use Global payouts .
- Global Payouts does reach Israel: an individual recipient gives "Email, name" and is paid in ILS by "Local bank method",
  from a US or UK sender (Q7).

Tick 1 left a conflict open (§3): "Algora's code lists Israel and the rendered Stripe page does not". That conflict is
**resolved at the product level**. There is now a rendered Stripe route by which a platform based in the US or UK pays an
Israeli individual, so the rendered Stripe pages no longer count against step 4. **RENDERED.**

What is not rendered:
- **Whether Algora pays Israeli solvers through Global Payouts.** It might instead use a Connect Express account paid some
  other way, or a route arranged with Stripe sales ("Contact sales to discuss alternatives", `:96`). **UNKNOWN.** The
  capture never names Algora. Step 4 as written (`docs/OWNER_STEPS.he.md:196-213`) is Stripe Connect **Express**
  onboarding, and the Algora code the repo cites gives Israelis an Express account (REJECTED.md:1411-1414; scout grade, not
  rendered here). This page describes onboarding a *recipient*, not an Express connected account. Line 140 links the two
  only for accounts "under a recipient service agreement". Whether Algora's Israeli accounts are of that kind cannot be read
  here.
- **Whether Algora sends from the US or the UK.** **UNKNOWN.** The only Algora capture, `research/rendered/algora-terms.txt:502-504`
  (fetched 2026-09-26T00:44:35Z), says:
  > 502: These Terms shall be governed and construed in accordance with the
  > 503: laws of State of Delaware without regard to its conflict
  > 504: of law provisions.

  That is a governing-law clause. It does not say where Algora's business is located, so it does not settle which sender
  country applies.
- **Effect on step 4.** Tick 1 asked that this page be rendered and read before the owner is asked for step 4's KYC (§3).
  It has now been read, and it does not block step 4. Step 4 stays paused for a different reason, the board's weekly Algora
  supply count (`docs/OWNER_STEPS.he.md:200-204`), and this reading does not change that.
- **What would settle (a):** read Algora's payout code next to the `lib/algora/psp/connect_countries.ex` file cited at
  REJECTED.md:1411-1414 (`https://raw.githubusercontent.com/algora-io/algora/main/lib/algora/psp/connect_countries.ex`,
  recorded in `research/colony-sweep/screen-2/primeintellect-bounties.md:42`) and find which Stripe API sends an Israeli
  solver's money. The other way to settle it is the first real payout under step 4, recorded as a ledger line with a
  transaction id.

#### Q11. Does it matter for (b) Polar paying a seller in Israel? — **Only if Polar pays through Global Payouts from the US or UK. That is UNKNOWN.**

- **RENDERED:** if Polar sends from the US or the UK, Stripe offers it a product, Global Payouts, that reaches an Israeli
  individual or company in ILS.
- **UNKNOWN:** whether Polar uses Global Payouts, and which country Polar sends from. Neither Stripe capture names Polar,
  and no Polar page has been rendered. The premise at BOARD-LOOP.md:145 is that Polar will "route payouts through Stripe
  Connect Express cross-border". That claim is scout grade, and it describes the route tick 1 found closed to Israel. If
  Polar's docs still say that, the first kill clause stands.
- **What would settle (b):** render and read Polar's own payout documentation. The only Polar URL recorded in the repo is
  `https://polar.sh/docs/merchant-of-record/supported-countries` (scout grade,
  `research/colony-sweep/scouts/licensing-ip--dual-licensing.md:125`). The reading must answer three things:
  (1) whether Israel is listed;
  (2) which Stripe mechanism pays sellers there: Global Payouts or recipient accounts, or Connect Express cross-border;
  (3) which country Polar pays from.

#### Q12. Does this reopen tick 1's FAILS_TEST? — **Half. Condition 1 of 2 is met. The verdict is held open, not reversed.**

Tick 1's rule (§3, "Reopen only if both of these hold"):
1. "that page lists Israel as a Global Payouts recipient country". **Met. RENDERED** (`.txt:292-295`; `.html:1290`, all four tabs).
2. "Polar's own payout documentation says Polar pays through Global Payouts". **Not read. UNKNOWN.**

By that rule, tick 1's verdict is not formally reopened, and it is not reversed. What does change is the broad reading of
FAILS_TEST as "Stripe cannot pay an Israeli through a platform". The Global Payouts page now contradicts that reading.

The first kill clause at BOARD-LOOP.md:148 ("Stripe's cross-border payout page excludes Israel") is still literally met.
The cross-border page has not changed, and Global Payouts is a different product with a different compliance model
(tick-1 capture `:118-120`). Whether that clause still kills candidate 9 now depends only on which of the two products
Polar uses.

### T2.3 Owner steps and money (additions to §4)

- **No new owner step.** This reading opens nothing and asks no KYC.
- For an Israeli Global Payouts recipient, the page lists only "Email, name" for an individual. As far as this page goes,
  that fits the owner's rules: no camera, no customer contact, no per-item paperwork. Identity verification, camera steps
  and per-payout forms are **NOT ON THIS PAGE**, so the fit is unverified beyond the table.
- Money: this page has no price. Who pays Global Payouts fees (the sender or the recipient), and how much: **UNKNOWN.** No
  Global Payouts pricing page is named in this capture.

### T2.4 Verdict for the board (tick 2): **NEEDS_MORE**

- **ZERO-TESTS row 14, "whether Global Payouts can reach a recipient in Israel": yes. RENDERED.** Israel, ILS, Local bank
  method. An individual gives "Email, name"; a company gives "Email, company name". Senders are in the US or the UK. The
  page is marked "Public preview".
- **Candidate 9 (Polar):** tick 1's FAILS_TEST is held open, not reversed. Reopen condition 1 is met; condition 2 is unread.
  One reading settles it: Polar's payout documentation (Q11).
  - If it names Connect Express cross-border for Israel, FAILS_TEST stands on clause 1.
  - If it names Global Payouts, or a recipient-agreement account paid through Global Payouts, and Polar sends from the US
    or the UK, clause 1 falls. The candidate then faces its three remaining kill clauses: acceptable use, a camera step,
    and all-in cost against Freemius and Gumroad.
- **Owner step 4 (Algora):** the Stripe-side objection tick 1 raised is cleared at the product level. Whether Algora uses
  this route is UNKNOWN. It is settled by reading Algora's payout code (Q10) or by the first payout. Step 4 stays paused on
  the board's supply count, not on this reading.
- The kill or admit call is still a board decision (Fable tier under CLAUDE.md's routing rule). This file supplies the
  reading only.

## Tick 3 cross-reference (28.9.2026): Polar

Polar verdict: **NEEDS_MORE.** Polar's supported-countries page lists Israel for payouts (`polar-supported-countries.txt:246`) and
pays from a US platform through Stripe Connect Express accounts under a recipient service agreement (`:392`, `:399-405`), but it
never names Global Payouts; Israeli-individual onboarding, acceptable use and all-in cost are still unread. Details, quotes and
the next check: `research/measurements/polar-rail.md`.
