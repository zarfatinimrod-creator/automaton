# Measurement: Google Play Books Partner Center (CHANNEL_LOOP §4 candidate 18, breadth rank 5)

**Status: MEASURED 28.9.2026. Verdict: FAILS_TEST** (see the end). All three captures were fetched on 2026-09-28 between
16:11:52Z and 16:11:54Z, status 200, not truncated (`research/rendered/play-books-*.meta.json`).

**The test as ruled** (`logs/CHANNEL_LOOP.md:136`, `research/breadth/BOARD.md:76`): render table 6052428 and answers
3250840 and 4490848. "Israel absent from the payment-country list → dead." The verifier's left-open items are at
`research/breadth/verify/verdicts.json:458-505`.

## What was read
- `play-books-payment-countries.txt`, all 1379 lines. The table was also parsed from the `.html` with python3: 77 `<tr>`,
  which is 1 header, 75 country rows and 1 footer row. "Israel" occurs 0 times in the `.txt` and 0 times in the `.html`.
  No row has the code `IL`.
- `play-books-answer-3250840.txt` (324 lines) and `play-books-answer-4490848.txt` (179 lines), both in full. After their
  body text, the rest of each file is navigation, a language picker and page flags.

## Findings [RENDERED unless marked]
1. **Israel is on no list, in any role.** The page is "Supported countries for selling books on Google Play"
   (`payment-countries.txt:34`). The header is `Country name | Country code | Currency | Seller sign-ups | Seller promo
   codes creation | Auto-narrated audiobook creation | Purchases | Payments` (`:86-93`). The page defines the columns:
   - **Being paid as a partner:** "Payments: Google can issue payments to partners' bank accounts in these countries." (`:76`)
   - **Opening a seller account:** "Seller sign-ups: Partners in countries or regions marked with the ✔ symbol can sell
     books on Google Play Books." (`:60`)
   - **Selling to buyers there:** "Purchases: Customers can purchase books on Google Play in these countries." (`:70`)

   **There is no Israel row to quote.** Israel's alphabetical place is between `Italy | IT | EUR | ✔ (e-book only) | ✔ | ✔ |
   ✔ | ✔` (`:575-589`) and `Jordan | JO | JOD | ✘ | ✘ | ✘ | ✔ (e-book only) | ★ (USD)` (`:591-605`). The Middle East rows are
   appended out of order at the end (`:1215-1293`: AE, KW, LB, EG, BH), so the whole table was checked, not only that gap.
   Israel is absent from all three roles:
   - an Israel-based partner cannot open a seller account;
   - Google pays no bank in Israel, not even by the "★ … wire transfer in U.S. dollars" route (`:78`). Jordan (`:605`) and
     Lebanon (`Lebanon | LB | USD | ✘ | ✘ | ✘ | ✔ (e-book only) | ★ (USD)`, `:1247-1261`) do get that route;
   - buyers in Israel cannot purchase, so Hebrew titles aimed at Israeli readers would have no storefront at home.

   The page's own rule for unlisted places: "If a particular country/region isn't listed below as supported, check back
   later" (`:38`). **Currency:** none, because there is no row. The partner's currency follows the payment profile: "The
   country listed in this payment profile will determine the currency you're paid in." (`answer-4490848.txt:43`)
   - **[INFERENCE] The foreign-bank escape does not work.** South Africa shows a partner can sign up in one country and bank
     in another (`:82`). That needs a seller-sign-up country, which Israel is not. The verifier's snippet-grade rule ("local
     business address and local bank account", `verdicts.json:469`) is on answer 6009580, which is linked but unread. A
     foreign address would be a misrepresentation.
2. **The answer pages.**
   - **3250840, "Payment profiles & bank accounts"** (`:1`, `:34`):
     - The profile takes "business name, contact name, address, and phone number" (`:71`).
     - The bank account is verified by "a small deposit within 2 business days" (`:93-101`), except in wire-transfer
       countries.
     - Tax: USD sellers "must provide tax information for each payment profile … Otherwise, payments for that profile will
       be held" (`:169`). Receipts show "Chapter 3 US tax withholding" (`:151`).
   - **4490848, "Step 2. Set up your payment profile"** (`:1`, `:37`), step 2 of 9: "You must have a payment profile in order
     to sell books on Google Play." (`:43`) Step 9 is bank and tax (`:93`, unread).
   - **Identity:** "identity", "selfie", "video", "photo", "camera" and "passport" appear 0 times across all three
     captures. The linked page "Verify your business information" (`3250840:217`, answer 6193891) is unread, so the
     identity step is still UNKNOWN.
3. **Fees:** the word "fee" appears 0 times (only "feedback"). "Revenue Split FAQs" is a navigation title only
   (`3250840:225`). This is absence on payment pages, not a read fee page.
4. **AI, content and imprint:**
   - Content: "make sure your content meets Google's guidelines … review our publisher content policies" (`3250840:43`,
     answer 1067634, unread). No capture mentions AI.
   - Imprint: a "business name" field exists (`3250840:71`, `4490848:49`). Whether it shows publicly is UNKNOWN.
   - Hebrew: no capture addresses Hebrew books. The `עברית` entry (`3250840:281`) is the help-centre UI language picker.
5. **Bulk or automated upload:** "ONIX", "SFTP", "feed", "fetch", "bulk" and "API" appear 0 times. "Step 5. Upload content"
   (`4490848:85`) is unread. This is moot after finding 1.

**[INFERENCE] Side effect:** the brand Google account (step 8) loses Play Books as one of its uses (`BOARD.md:25`, `:97`).
YouTube Stage A and Search Console remain.

## Verdict for candidate 18 (Google Play Books): FAILS_TEST
The board's kill applies literally. Israel is absent from the full 75-row table, so Google cannot pay a partner's bank there
(`payment-countries.txt:76`). It is also absent as a seller sign-up country and as a purchase country, so neither the partner
side nor the Israeli-buyer side exists. The fee, identity, AI and upload questions are moot, and none was needed to decide.
**The single next check** (the only thing that could reopen it): when render-watch records a new sha256 for
`play-books-payment-countries`, run `grep -n -E '^(Israel|IL)$'` on the new `.txt`. That applies the page's "check back
later" rule (`:38`).
