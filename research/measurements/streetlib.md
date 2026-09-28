# Measurement: StreetLib (ebook aggregator), proposed channel-loop row 24

**Date:** 2026-09-28 (Opus reader). **Ordered by:** `research/channel-loop/ZERO-TESTS.md` rows 109-116 and
`research/breadth/REPLENISH-2026-09-28-2.md` §3.1 (the proposed kills (a)-(e) are quoted from there).

**Status: NEEDS_MORE.** No proposed kill fires on a rendered fact. **Kill (c) does not fire.** The AI rule as written
blocks AI books that are "not correctly categorized using the metadata", or that contain erroneous or low-quality
content. It does not block declared AI books and does not require human editing. **Kill (a) is open and at real risk.**
The January 2025 policy page says "no-upfront nor recurring costs". The earnings article, updated 18.3.2026, names
"Subscription and Lifetime Access options". The plans article the replenish named returns 404, and the pricing page is
an empty JS shell. **Kill (b) was not tested:** no capture says anything about payouts. **Kill (d) parks.** Titles go
through a dashboard form, and the terms page is an empty shell. A risk to G7 not in the proposed kills: the author
field wants "*Surname, Name*" and warns that nicknames can lead stores to refuse the book.

**Grades.** [RENDERED] = quoted from `research/rendered/`, file:line checked with `grep -n -F`. [INFERENCE] = reasoning.
UNKNOWN = not shown. No personal names appear in the captures. Short names: `421` =
`help-streetlib-com-article-421-streetlib-content-integrity-g`, `677` = `…-article-677-earnings`, `380` =
`…-article-380-publish-an-ebook`, `613` = `…-category-613-content-policy`.

## 1. What was read (fetchedAt 2026-09-28T20:35Z, first fetch)
| Capture | Result |
|---|---|
| `streetlib-com-legalpolicy`, `-pricing`, `-distribution-partners` (200) | **One identical shell.** All three have sha256 `7a29449c…` (`*.meta.json:8`). It holds only `<div id="root"></div>` (legalpolicy.html:28) and a JS bundle (`/assets/js/index-46a3fa32.js`, :20). No terms, prices or store list. |
| `help-streetlib-com-article-1523-distribution-plans` | **404** (`.meta.json:5`, `:10`). No body. |
| `677` earnings (125 txt lines, 1798 html) | txt in full; html for links (payments category :1717, changeover FAQ :1619) |
| `421` content integrity (137 / 1813) | txt in full; html for the Distribution Agreement link (:1648, again at :1667) |
| `613` content-policy category (93 / 1793) | txt in full. It lists three articles: integrity (:63), public domain (:65), adult (:67). None is about AI. |
| `380` publish an ebook (119 / 1810) | txt in full; html for the dashboard link (:1648), the options image (:1649) and the video |

## 2. Gate by gate
**G1 (₪0 up front): UNKNOWN, leaning FAIL; kill (a) does not fire on a rendered fact.**
- For: "revenue-share based business model , with no-upfront nor recurring costs" (421.txt:61). That page is dated "Last
  update: January 2025" (:63), last updated February 19, 2025 (:111). [RENDERED]
- Against: "Our Subscription and Lifetime Access options both offer an 85% royalty rate on net revenue." (677.txt:87),
  "Last updated on March 18, 2026" (:107). [RENDERED] No price is shown, and the page does not say whether either option
  is required. [INFERENCE] Both names read as paid author plans. The 85% also differs from the snippet-grade "10%
  commission" (REPLENISH §3.1). So the model has probably changed. If both options cost money and no commission-only
  route remains, (a) fires.
- Print only: "StreetLib distribution commission: This starts from 10% of the cover price, excluding VAT." (677.txt:97)
- The ISBN is free: "StreetLib will assign you one for free" (380.txt:67), with "a maximum limit of 5 per day and 100 in
  total" (:67). [RENDERED] That is enough for the ≤5 titles in BOARD Q4.
- The stores take their cut before net revenue: Google Play is "withholding a commission of 30% of the cover price"
  (677.txt:71); outside the EEA, Kobo "retains a 50% commission off the cover price" (:73). [RENDERED]

**G2 (Israeli individual paid, no camera): UNKNOWN; kill (b) not tested.** No capture names a payout method, minimum,
country list or identity check (grep for paypal/bank transfer/minimum/israel/identity/passport/selfie: 0 hits in 677,
380, 613). "from any country around the world" (421.txt:57) is about whom StreetLib serves, not payouts. The PayPal
fact is still at repo grade only (BILL API v4, REPLENISH §3.1). The payments category is `/category/97-payments`
(677.html:1717). It was not captured.

**G3 (no per-item owner click; terms allow agents): UNKNOWN; kill (d) parks.**
- The route: `log into your Dashboard and click on " Add content " at the top right` (380.txt:57), with "you will be
  asked to fill in fields" (:65). [RENDERED] The dashboard is `dashboard.streetlib.com` (380.html:1648). The replenish's
  traffic reading used `hub.streetlib.com`.
- The article lists no feed, API or bulk route. The choice after "Add content" is shown only as an image (380.html:1649),
  so the text does not prove that every title goes through a form.
- The terms on automated access are UNKNOWN (legalpolicy is a shell). Integrity blocks run "either automatically or with
  the intervention of our Content Management Team" (421.txt:77). [RENDERED]

**G4 (honest value, AI declared): PASS as written; kill (c) does not fire.** [RENDERED]
- "5-- Books created using artificial intelligence (AI) or automated processes that are not correctly categorized using
  the metadata available in the product sheet, and/or containing erroneous or low-quality content." (421.txt:87). The
  block applies to AI books that are not declared, or that are erroneous or low quality. It has no human-editing rule.
- Also blocked: "non-original contents or contents available online and replicable without limitation" (421.txt:81), and
  "Books that are summaries of other works." (:91). These match the Indiebook bar (restating free content is barred).
- StreetLib may remove such content "without prior notice to the publisher" (421.txt:101).
- Gap: the metadata list in 380 (ISBN through RELATED ARTICLES, :67-85) has no AI field. Where the AI declaration goes is
  UNKNOWN.

**G5 (the venue brings buyers): PASS in part.** "through a network of more than 50 retailers" (421.txt:55). Named in
the captures: Google Play (677.txt:71), Kobo (677.txt:73; 380.txt:73) and Amazon Kindle ("The maximum number of
keywords accepted by Amazon Kindle is seven (7)", 380.txt:75). **Apple is not named in any capture.** The eligibility
rules sit in the distribution-partners shell (UNKNOWN). "Publishing to all online bookstores takes between 24 and 72
hours." (380.txt:67)

**G7 (the brand is the only public name): UNKNOWN, with a rendered risk.** "It is necessary to insert the author’s name
using the *Surname, Name* format and to avoid the use of symbols, numbers, nicknames, codes, or series of characters that
could lead to the refusal of the book by the bookstores." (380.txt:71) [RENDERED] "USER RIGHTS . We need to know if you
are the author or publisher" (:77). [INFERENCE] "Mehudak" as the author may be refused by stores. A person-shaped pen
name would present a fictitious person, which breaks the honesty rule. This is not a proposed kill; the sitting should
consider it. Kill (e) (legal name and address shown to buyers) is UNKNOWN.

## 3. UNKNOWNs
Any required fee on the current platform. The payout rails, minimum, Israel and any camera step. The terms on automated
access. Where the AI declaration goes in the metadata. A brand as the only author name. Apple reach and title
eligibility. Kill (e).

## 4. Next check (one)
**https://help.streetlib.com/collection/1492-faq-on-platform-changeover**, linked as "FAQ on Platform Changeover"
(677.html:1619, 677.txt:47). It is the help centre's own section on the new platform, the one the 2026 "Subscription
and Lifetime Access options" (677.txt:87) belong to. It settles kill (a) or points to the article that does. Help Scout
pages render in full on the runner. If it shows only titles, render the one about plans or pricing.
- **Queued, only if (a) survives:** the Distribution Agreement PDF,
  `https://streetlib-agreements.s3.eu-west-1.amazonaws.com/StreetLib_SL_IT_Hub_20250130_en.pdf` (421.html:1648). The
  runner stores PDFs as text (`crazygames-developer-terms.pdf/.txt`). It is the governing text for (b), (d), (e) and §11.
  It is dated 30.1.2025, before the 2026 options, so it cannot close (a) by itself.
- **Held step-8 question (send only if both are silent on fees):** "Hello StreetLib team. We are Mehudak (מהודק), a
  small publisher based in Israel. Our catalogue is prepared and submitted by an automated AI system we operate, and
  every AI-generated title would be declared as such in its metadata. Can a publisher distribute ebooks on your current
  platform with no up-front or recurring payment, that is, without buying a Subscription or Lifetime Access option,
  with StreetLib taking only a share of each sale? Thank you. Mehudak (מהודק)"

## Tick 9 (row 129 render)

**Read 28.9.2026 by an Opus reader.** Capture: `streetlib-faq-platform-changeover` (200, fetchedAt 2026-09-28T21:03Z,
first fetch; 79 txt lines, 1,746 html lines). Short name `chg`. The txt was read in full. In the html I read the footer
menu object (:380-600), the JSON-LD (:67-69), the header menu, the article list (:1620-1645) and the sidebar (:1668-1675).
Every quote below was checked with `grep -n -F`.

**Status: NEEDS_MORE. The render settles nothing. It is a list of titles for the wrong changeover.**

**What the page is.** It is a Help Scout collection page. It shows six article titles and no article bodies:
- "Access to the old Plattform" (chg.txt:55);
- "General Information on the Changeover (mail sent on Feb 2nd 2024)" (:57);
- "StreetLib US" (:59);
- "Delayed selection of stores (Amazon, Tolino, Kobo)" (:61);
- "Completing the billing profiles" (:63);
- "Previous sales data" (:65).

It has one category, "BX Help in English" (:71). [RENDERED] The German footer says the StreetLib service in German-speaking
countries "angeboten von BookRix, Deutschland" (chg.html:600). This collection is the English twin of "FAQ zum Umzug auf
die neue Plattform" (chg.html:1605, :1607). [INFERENCE] This is the February 2024 move of BookRix ("BX") users onto
StreetLib. It is not the 2026 author options.

**A correction to the tick-9 pointer.** §4 said this page was "linked as 'FAQ on Platform Changeover' (677.html:1619,
677.txt:47)". That link is an item in the help centre's header menu (`<li id="faq-on-platform-changeover">`,
677.html:1619). The same item is at chg.html:1607 and on every help page. It is not a link from the earnings text, so it
never tied this collection to the "Subscription and Lifetime Access options" (677.txt:87).

**Absent from both files.** "paypal", "bank", "payout", "subscription" and "85%" each have 0 hits in the txt and in the
html. "lifetime" appears only in the footer menu.

**New at rendered grade: the footer names a Lifetime Pro Plan.** It sits in the footer menu object. That object is
script, so the txt does not show it.
- `label: 'Pricing',` / `link: 'https://www.streetlib.com/pricing'` (chg.html:391-392)
- `label: 'Lifetime Pro Plan',` / `link: 'https://www.streetlib.com/pro-plan-lifetime'` (chg.html:395-396)
- The Italian menu: `label: 'Prezzi',` / `link: 'https://www.streetlib.it/prezzi-servizi',` (chg.html:470-471)

The same footer is in the earlier captures too (for example 677.html:407), and the first reading missed it.
[INFERENCE] A product sold as a "Lifetime Pro Plan" exists. The word "Pro" suggests a lower tier, but whether that tier
is free, and whether any plan is needed to distribute, is still not shown.

**Kills (all but (e) are pre-registered on the board, §4 row 24):**
- **(a) Any distribution plan, subscription or per-title fee: UNSETTLED.** It still leans towards firing, a little more
  than before (a named "Lifetime Pro Plan", chg.html:395). There is no price and no word "required".
- **(b) The payout cannot reach an Israeli individual, or needs a camera step: UNSETTLED.** Nothing about payouts was
  rendered. The only payout-shaped item is the title "Completing the billing profiles" (chg.txt:63), which sits in the
  BookRix collection. Its body is unread.
- **(c) AI books barred even when declared: DOES NOT FIRE.** This is unchanged from the earlier reading (421.txt:87).
  This page is not about content.
- **(d) Web forms only, and the terms forbid automation: UNSETTLED.** It still parks, as before. This page says nothing
  on it.
- **(e) The legal name is shown to buyers (Q10): UNKNOWN.** This kill is proposed only; the board row does not
  pre-register it.

**Gate line.** Unchanged except for the G1 evidence:
G1 U↘(r) · G2 U(r) · G3 U(r) · G4 P(r) · G5 P in part (r) · G6 U · G7 U(r, the "Surname, Name" risk at 380.txt:71).

**Next step (one render, then a fallback).**
1. **https://www.streetlib.it/prezzi-servizi** (chg.html:471). It is the one pricing page on a host that is not yet
   shown to be a shell. The three `www.streetlib.com` pages were one identical JS shell (sha `7a29449c…`, §1). It
   settles (a): whether distribution needs a paid plan, and what the plans cost. It may be Italian and Italy-specific;
   read it for the plan names in 677.txt:87.
2. **https://help.streetlib.com/category/97-payments** ("Billing and Payments", 677.html:1717; not in this capture). It
   is a Help Scout category page, so it lists every article in the category and renders in full. It settles (b), and
   perhaps (a) through a billing article.
3. Second choice for (b): **https://help.streetlib.com/article/1498-completing-the-billing-profiles** (chg.html:1639).
   Its context is BookRix, so the fields may be German-market only.

Not recommended: `https://www.streetlib.com/pro-plan-lifetime` (chg.html:396). [INFERENCE] It is on the host whose
pages were the one empty shell. Render it only if the runner gains JavaScript rendering. The page's own JSON-LD also
holds a search template, `https://help.streetlib.com/search?query={query}` (chg.html:68). A filled-in query such as
"lifetime" would be a URL built from that template, not one found in the capture. It is left for the board to allow or
refuse.

**The recipient for the held step-8 question.** The only StreetLib address in any capture is `support@streetlib.de`
(chg.html:600, in the German footer; 10 hits across the StreetLib captures). [INFERENCE] It is the German (BookRix)
service's inbox. The held question (above, §4) goes there only if renders 1 and 2 are both silent on fees.

## Tick 10 (row 132 and row 133 renders)

**Read 28.9.2026 by an Opus reader.** Two captures, both 200, first fetch, fetchedAt 2026-09-28T22:00Z:
- `streetlib-it-prezzi-servizi` (row 132, short name `it`): 2,322 bytes (`it.meta.json:7`); its txt is empty (1 byte).
- `help-streetlib-com-category-97-payments` (row 133, short name `pay`): 97 txt lines and 1,789 html lines. The txt
  was read in full. In the html I read the article list (:1655-1676), the sidebar (:1703-1717), the JSON-LD (:72) and
  the canonical link (:14), and grepped the whole file.

Every quote was checked with `grep -n -F`.

**Status: NEEDS_MORE. Neither render settles a kill.** Row 132 is the same empty JS shell as the three
`www.streetlib.com` pages. Row 133 is a list of titles, like the changeover collection. It names the payout articles
but shows none of their text.

**Row 132 is a JS shell, not a redirect stub.** [RENDERED]
- Its sha256 is `7a29449c…` (`it.meta.json:8`), byte-identical to `streetlib-com-pricing` (`.meta.json:8`) and to
  `streetlib-com-legalpolicy`.
- The body is only `<div id="root"></div>` (it.html:28), loaded by `/assets/js/index-46a3fa32.js` (:20). "Meta tags are
  managed dynamically by react-helmet-async in PageLayout component" (:7).
- There is no redirect: no `http-equiv` refresh, no `window.location` and no canonical (0 hits). The only Italian is a
  code comment, "Ottimizzazione caricamento font" (:33).
- [INFERENCE] `www.streetlib.it` and `www.streetlib.com` serve one single-page app. No marketing page on either host
  renders on the runner, and that includes `https://www.streetlib.com/pro-plan-lifetime` (§Tick 9 already advised
  against it). Plan prices can only come from the help centre, which renders, or from a written answer.

**Row 133 lists the payout articles.** "Billing and Payments" (pay.txt:53) sits in the collection "Manage Your Account
and Royalties" (:31; JSON-LD, pay.html:72). Its articles, with hrefs made absolute against the canonical
`https://help.streetlib.com/category/97-payments` (pay.html:14), are:

| Title (pay.txt) | href (pay.html) |
|---|---|
| "Billing Profile and Payment Method" (:63) | `/article/699-billing-profile-and-payment-method` (:1658) |
| "Completing our Tax Information Interview" (:65) | `/article/433-completing-our-tax-information-interview` (:1660) |
| "Withholding tax" (:67) | `/article/429-withholding-tax` (:1662) |
| "Earnings" (:69), already read as `677` | `/article/677-earnings` (:1664) |
| "Getting Paid" (:71) | `/article/670-getting-paid` (:1666) |
| "Getting Paid (USA and Canada)" (:73) | `/article/432-getting-paid-usa-canada` (:1668) |
| "Invoices" (:75) | `/article/431-billing` (:1670) |
| "Invoices and Detailed Reports" (:77) | `/article/422-invoices-and-detailed-reports` (:1672) |
| "How to Read Billing Reports" (:79) | `/article/704-how-to-read-billing-reports` (:1674) |

- The sidebar holds two sister categories: `/category/72-create-and-manage-your-streetlib-account` (pay.html:1707) and
  `/category/111-book-sales` (:1715).
- "paypal", "bank", "payout", "israel" and "payoneer" have 0 hits in both the txt and the html.
- The footer again links "Lifetime Pro Plan" (`label: 'Lifetime Pro Plan',` pay.html:399; `link:
  'https://www.streetlib.com/pro-plan-lifetime'`, :400). That is still a name without a price.
- [INFERENCE] A separate "(USA and Canada)" article implies that "Getting Paid" (670) is the article for the rest of the
  world, so 670 is the one that answers (b) for Israel. A "Tax Information Interview" suggests a tax form at payout.
  Whether it has an identity or camera step is UNKNOWN.

**Kills. (a)-(d) are pre-registered on the board (§4 row 24). (e) is PROPOSED only.**
- **(a) Any distribution plan, subscription or per-title fee: UNSETTLED.** Row 132, the page meant to settle it, is an
  empty shell (it.html:28). No payments title names a plan, a subscription or a fee (pay.txt:63-79). The lean toward
  firing is unchanged (677.txt:87; the footer, pay.html:399).
- **(b) The payout cannot reach an Israeli individual, or needs a camera step: UNSETTLED.** The articles that settle it
  now have captured URLs (670, 699 and 433 above). No payout text is rendered.
- **(c) AI books barred even when declared: DOES NOT FIRE.** Unchanged (421.txt:87).
- **(d) Web forms only, and the terms forbid automation: UNSETTLED; it parks.** Unchanged. The terms are on the shell
  host (legalpolicy, §1).
- **(e) The legal name is shown to buyers: UNKNOWN.** PROPOSED only.

**Gate line.** Unchanged: G1 U↘(r) · G2 U(r) · G3 U(r) · G4 P(r) · G5 P in part (r) · G6 U · G7 U(r, "Surname, Name",
380.txt:71). G2 gains only a map of where the answer is.

**Next step (renders, in order; every URL is from `pay.html`, resolved against its canonical :14).**
1. **https://help.streetlib.com/article/670-getting-paid** (pay.html:1666). It settles (b): payout methods, minimum and
   countries, and whether PayPal or a bank reaches an Israeli individual.
2. **https://help.streetlib.com/article/699-billing-profile-and-payment-method** (:1658). It covers (b): which payment
   methods a billing profile takes, and whether an individual can hold one. It may touch (a) if a plan is billed there.
3. **https://help.streetlib.com/article/433-completing-our-tax-information-interview** (:1660). It covers the camera
   half of (b): any identity-document, photo or video step in the tax form.
4. **https://help.streetlib.com/category/72-create-and-manage-your-streetlib-account** (:1707). It covers (a): the
   account category, where an article on the Subscription and Lifetime options would sit if one exists. If it lists
   one, render that article next.

The held step-8 fee question (§4) stays held until renders 2 and 4 are read. The only captured address is still
`support@streetlib.de` (§Tick 9).
