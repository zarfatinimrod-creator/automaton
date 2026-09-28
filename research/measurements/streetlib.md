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
