# Measurement: PayPal Israel as a payout rail (CHANNEL_LOOP row 21, breadth board Q3)

**Date:** 2026-09-28. **Branch:** `claude/new-session-j071dx`, read at `2c57b7d` (the captures arrived in its parent `815c2e5`).
**Status: NEEDS_MORE** (tick 6, 28.9.2026: unchanged. The help index names no verification article. Its only identity
step is an upload of "proof of identity" to lift a limitation, in HELP534. See the Tick 6 section.) **Tick 7
(28.9.2026): PASS_TEST on the camera gate. Board Q3 condition (i) is met on its letter.** HELP534 names the proof of
identity as an uploaded copy of a driving licence or ID card, sent via the Message Center (`paypal-il-help534-limited.txt:54`).
The 328 KB page names no selfie, liveness, video or camera step. Residual risk: this is the path for restoring a
limited account, not sign-up. No capture holds a sign-up verification article, and the in-account request cannot be
rendered. Step 13 stays held on conditions (ii) and (iii). See the Tick 7 section. The mechanics pass: an Israeli individual may open an account, receive payment for goods and
services on a personal account, and withdraw to an Israeli bank in ILS. The camera question is **UNKNOWN, not excluded**.
The agreement names ID documents and no camera step, but it does not describe the verification flow and links no
verification article. Board Q3 condition (i) is therefore not yet met.
**Grades:** [RENDERED] = quoted from the stored capture, cited `file:line`. [INFERENCE] = my reading, not PayPal's words.
UNKNOWN = the captures do not answer it. Nothing here comes from general knowledge.

## What was read
| Capture | Source URL | fetchedAt | Notes |
|---|---|---|---|
| `paypal-il-user-agreement-mpp.txt` (1,262 lines) | `https://www.paypal.com/il/webapps/mpp/ua/useragreement-full` | 2026-09-28T13:18:07Z | Read in full: headings, then every section cited below. "Last updated on 6 July 2026" (`:11`). |
| `paypal-il-user-agreement.txt` (1,262 lines) | `https://www.paypal.com/il/legalhub/paypal/useragreement-full?locale.x=en_IL` | 2026-09-28T13:18:05Z | **Byte-identical to the file above** (md5 `65a6a785…` for both). The mpp capture's canonical and `og:url` are `…/il/legalhub/paypal/useragreement-full`. The two HTML files differ only in page chrome. Two recorded URLs, **one source**, so this is not two confirmations. |
| `paypal-il-link-bank.txt` (48 lines) | `…/il/cshelp/article/how-do-i-link-a-bank-account-to-my-paypal-account-help183?locale.x=en_IL` | 2026-09-28T13:18:10Z | **Not a shell.** Lines 9-28 are the article body: Israeli bank linking plus the US-bank option. Lines 1-7 and 30-48 are nav, help links and the cookie banner. |

The English text is a translation: "In the event of a conflict between the Hebrew version … the Hebrew version shall control" (`paypal-il-user-agreement-mpp.txt:1242`).

## 1. Account opening and verification
- [RENDERED] Eligibility: "If you are an individual, you must be a resident of Israel and at least 18 years old, to open a PayPal account" (`paypal-il-user-agreement-mpp.txt:180`).
- [RENDERED] The "Identity authentication" section (`:1186-1200`): "You authorize PayPal, directly or through third parties, to make any inquiries we consider necessary to verify your identity" (`:1188`). It lists: "date of birth, your taxpayer or national identification number, your physical address" (`:1190`); "requiring you to take steps to confirm ownership of your email address or financial instruments" (`:1192`); "ordering a credit report from a credit reporting agency" (`:1194`); "verifying your information against third party databases" (`:1196`); "requiring you to provide further documentation, such as a National Identity card, your driver's license or other identifying documents at any time" (`:1198`).
- [RENDERED] Consequence: "PayPal reserves the right to close, suspend, or limit access to your PayPal account … if … we are unable to obtain information about you required to verify your identity" (`:1200`). Refusing to "provide confirmation of your identity" is a restricted activity (`:766`).
- [RENDERED] **Camera search.** I searched the whole text for selfie, liveness, video, photo, biometric, face, camera and "image of". There are **zero** hits for selfie, liveness, video, photo or camera. The only hits are two optional *login* methods, both part of the "Essential Component" definition for unauthorized-payment liability: "enabled biometric authentication (such as fingerprint)" (`:97`) and "(such as fingerprint, Face ID)" (`:1174`). Neither is an identity-verification step.
- [INFERENCE] **Camera question: UNKNOWN, not excluded.** The document list is open-ended ("other identifying documents", `:1198`; "any inquiries we consider necessary", `:1188`). The agreement also defers the flow itself to the logged-in account. The one upload it names, an ID card, is allowed under the owner's brief.

## 2. Receiving payments as an individual
- [RENDERED] "You can use your PayPal account to receive payments for the sale of goods or services" (`:81`). "If you use your PayPal account to receive payments for the sale of goods or services or to receive donations, you must pay any applicable fees for receiving the payments" (`:516`).
- [RENDERED] Fee amounts are not in the agreement. It points to "the Commercial Payments Fees table" (`:603`), linked as `https://www.paypal.com/il/business/paypal-business-fees`. VAT is added: "you agree to pay to PayPal the amount of any legally applicable Taxes imposed on any Fee … (including, without limitation, VAT)" (`:541`). **UNKNOWN from these captures:** the receiving-fee percentage, and the ₪8 withdrawal fee and 18% VAT figures cited in BOARD Q3.
- [RENDERED] "Note that personal payments to friends and family are not available in Israel" (`:409`). [INFERENCE] Every incoming payment would therefore be a commercial payment.
- [RENDERED] Engine payouts: "If you are using PayPal Payouts (formerly Mass Pay), the terms of the PayPal Payouts Terms and Conditions will apply" (`:625`). That covers the sender. Nothing in the text covers the fee a *recipient* of a Payout pays: **UNKNOWN**.
- [RENDERED] Limits: receiving limits exist ("fail to complete the steps to lift your sending, receiving or withdrawal limit", `:813`). No amounts are stated. To lift a withdrawal cap: "Verifying your bank account; and Linking and confirming your credit card, debit card or third-party wallet information" (`:323-327`).
- [RENDERED] Holds: common cases include "New sellers or sellers who have limited selling activity" (`:863`). "Risk-based holds generally remain in place for up to 30 days" (`:873`). Reserves make funds "pending" and not withdrawable (`:905`).
- [RENDERED] Currencies: "Your balance … may be held in any of the currencies supported by PayPal, and you may hold a balance in more than one of these currencies" (`:334`). Also: "To receive funds in a currency that your account is not currently configured to accept, it may be necessary to create a balance … in that currency or convert the funds" (`:366`). Conversion uses "PayPal's transaction exchange rate (including our currency conversion fee)" (`:336`, `:376`). [INFERENCE] A USD payout can sit as a USD balance and is converted at withdrawal (§3). Whether the account auto-converts it on receipt is UNKNOWN; the text says "may be necessary".

## 3. Withdrawal to an Israeli bank
- [RENDERED] **Possible, in ILS only:** "You can only withdraw funds to Israeli bank accounts or Israeli credit cards in Israeli Shekels (ILS)" (`:338`). A foreign-currency balance "must be converted before withdrawal: to ILS when withdrawing to a local (Israeli) bank account or card" (`:344-346`). A USD balance may instead go "to a linked U.S. bank account or card (if this option is available)" (`:340`).
- [RENDERED] Fees: "We may charge a fee to make a withdrawal to your bank account" (`:329`). "PayPal’s transaction exchange rate (including our currency conversion fee) will apply in addition to the withdrawal fee" (`:354`, `:358`). Amounts are on the Fees pages, not in the captures. The bank or card issuer may charge separately (`:362`).
- [RENDERED] Link-bank article: "You can use an Israeli bank account only to withdraw funds from your PayPal account" (`paypal-il-link-bank.txt:9`). "Make sure that the name on your account is in English. Our system won’t let you add your bank account if the name is in Hebrew" (`paypal-il-link-bank.txt:13`). The bank name is entered in full, in English (`:16-17`). A US checking or savings account can be added by routing number (`:20-26`). Its "Learn how to confirm your bank account" link goes to `https://www.paypal.com/smarthelp/article/HELP185` (from the HTML). That article covers bank confirmation, not identity verification.

## 4. Business vs personal account
- [RENDERED] No business account is required. "You can also use a personal account to receive payments for the sale of goods and services, but if you plan to use your personal account primarily to sell things, you should consider a business account" (`:229`). Business accounts are "recommend[ed] … for people and organizations that primarily use PayPal to sell goods or services, even if your business is not incorporated" (`:233`).
- [RENDERED] A business account adds "consent to PayPal obtaining your personal and/or business credit report from a credit reporting agency at account opening" (`:243`). Its fees "may … differ" (`:241`), and the merchant rate needs one (`:611`). Above certain thresholds, any account type must accept a Commercial Entity Agreement (`:247`). The agreement names **no business documents**: UNKNOWN.
- [RENDERED] Tax: "We may request that you provide PayPal with your tax identification number … If you do not … you may be subject to account holds or limitations and withholding Taxes at the applicable (maximum) rates" (`:556`). [INFERENCE] This matches Q3 condition (iii): step 2 comes before this account.

## 5. Restricted activity, sanctions, digital goods, limited balances
- [RENDERED] "Access the PayPal services from a country that is not included on PayPal's permitted countries list" is restricted (`:785`), as is AML risk including "regulatory fines by European, US or other authorities" (`:813`). The word "sanction" does not appear. The goods rules sit in the Acceptable Use Policy (`https://www.paypal.com/il/legalhub/paypal/acceptableuse-full`), which was not captured.
- [RENDERED] Digital goods: micropayments for digital goods let PayPal "reverse the transaction … without requiring the buyer to escalate the dispute to a claim" (`:621`). The named higher-risk hold categories are "electronics or tickets" (`:865`). Digital goods are not named there.
- [RENDERED] Balance on limitation: PayPal may "Hold the balance … The hold may remain in place longer than 180 days if required according to Court Orders, Regulatory Requirements" (`:828`). "If we close your PayPal account … we'll … make any unrestricted funds … available for withdrawal" (`:846`). A limitation is lifted "after you provide us with the information we request" (`:901`). For AUP violations tied to counterfeit or IP-infringing goods: "$2,500 USD (or equivalent) per violation" may be deducted from the balance (`:842`). Dormancy: no login for two or more years means the account may be closed (`:1160`).

---
**Verdict for row 21 (PayPal Israel as a payout rail): NEEDS_MORE.**
As a rail it works on paper. An Israeli individual may receive payment for goods and services on a personal account, and
the balance goes to an Israeli bank in ILS, after a conversion fee and a withdrawal fee whose amounts are not in the
captures. The gate question is not answered. The agreement names an ID card or driver's licence and no selfie, liveness
or video step, but its list is open-ended and it describes no flow. Condition (i) of Q3 is **not met**, and no engine's
PayPal leg is killed either.
**Single next check:** the verification article is not linked in the captured text. The captures link only the
bank-confirmation article (`https://www.paypal.com/smarthelp/article/HELP185`) and the help index
(`https://www.paypal.com/il/cshelp/personal`). The next check is to find and render the PayPal IL help article on
confirming identity from that index.

## Tick 6 (28.9.2026): the help index
**Capture:** `research/rendered/paypal-il-help-index.txt` (39 lines) and its `.html` (24 lines), ZERO-TESTS row 59.
URL `https://www.paypal.com/il/cshelp/personal` (no locale parameter), status 200, fetchedAt 2026-09-28T16:12:00.249Z,
308,414 bytes, not truncated, sha256 `0cc5d271…`. Captured in `5d597e4`, read at `63c318e`.

**What it is: the real help index, not a shell. It is thin, and it is in Hebrew.** [RENDERED]
- Title "מרכז התמיכה של PayPal - אישי | PayPal IL" (`.txt:1`); heading "מרכז התמיכה - חשבון אישי" (`:3`). The page was served
  in Hebrew (`"worldReadyLocale":"he-IL"`, `.html:24`). Its English switch is `href="?locale.x=en_IL"` (`.html:23`).
- Visible body: five "מאמרים מומלצים" (recommended articles, `:7`), all on payments, refunds and disputes (`:9-17`; the
  `href`s are help106, help160, help142, help130 and help111, `.html:21`), then "להציג עוד" (show more, `:19`). Six help
  channels follow (`:21-33`): all topics, Resolution Center, Tax Center, Message Center, technical help and business
  help. The rest is the cookie banner (`:35-39`).
- The page data (`__NEXT_DATA__`, `.html:24`) holds 13 articles. There are 8 recommended: the five above, plus three
  behind "show more" (HELP1038, card billing address; HELP534; HELP546, form 1099). There are 5 "searchPopularArticles"
  (HELP293 send, HELP183 link bank, HELP383 fees, HELP246 Resolution Center, HELP155 link card), with titles and no URL.
  Its topic tree names six topics and gives no URLs. Two of them are "החשבון שלי" (my account, `help_account_personal`) and
  "כניסה ואבטחה" (login and security).

**Verification article: none linked, none named.** [RENDERED] No title in the text or the page data is about confirming
identity or verifying a new account. The HTML has 0 hits each for selfie, liveness, identity, סלפי, אימות and תעודת. All
19 hits for "זהות" are classified: 16 US taxpayer-ID hold strings, 1 login one-time password ("לזהות אותך"), 1
support-call passcode ("כדי לאמת את זהותכם, הזינו את קוד האבטחה הבא"), and 1 in the entry below. None is a KYC flow.
- **HELP534** (rank 7, behind "show more"). It sits only in the page data, with no `href` and nothing in the `.txt`.
  Title "מדוע חשבון ה- PayPal שלי הוגבל?"; excerpt "PayPal עשויה להגביל את החשבון שלך מסיבות כגון הפרות מדיניות, פעילות
  בסיכון גבוה, חוסר פעילות. עליך להעלות הוכחת זהות ב'הודעות' כדי לשחזר את הגישה."; url
  `"/il/cshelp/article/מדוע-חשבון-ה--paypal-שלי-הוגבל-help534"` (`.html:24`). [INFERENCE, my translation] "Why was my
  PayPal account limited?" / "…for reasons such as policy violations, high-risk activity, inactivity. You must upload
  proof of identity in 'Messages' to restore access."
- [INFERENCE] That is a path for recovering a limited account, not the opening flow. "להעלות" (upload) fits a document
  upload and the excerpt names no camera step. But an excerpt is a summary, not the article body, so the camera question
  is **still UNKNOWN**. The HELP111 and HELP155 excerpts use "חשבון מאומת" / "חשבונות מאומתים" (verified account/s)
  without defining the status.

**Verdict for row 21: NEEDS_MORE**, unchanged. Board Q3 condition (i) is still not met, because no render shows the
verification flow. The only identity step the capture names is an upload of proof of identity via Messages after a
limitation. It names no selfie, liveness or video step, and it does not exclude one.
**Single next check:** render HELP534 at the address the capture holds,
`https://www.paypal.com/il/cshelp/article/מדוע-חשבון-ה--paypal-שלי-הוגבל-help534` (the path from `.html:24`, the host from
the meta). Read what counts as "proof of identity" and whether any selfie, liveness or video step is named. If the
article is thin or only links onward, the fallback is `https://www.paypal.com/il/cshelp/browse-topics` (`.html:21`),
to reach the "החשבון שלי" topic.

## Tick 7 reading (28.9.2026)
**Capture:** `research/rendered/paypal-il-help534-limited.txt` (80 lines) and its `.html` (48 lines as `grep -n` numbers
them; the last has no newline). This is ZERO-TESTS row 66: the HELP534 address from the Tick 6 next check (percent-encoded in the
meta), status 200, fetchedAt 2026-09-28T17:19:21.935Z, 328,727 bytes, not truncated, sha256 `4c6d6204…`, first fetch.
It was served in Hebrew (`"worldReadyLocale":"he-IL"`, `.html:48`). The article record carries
`"ecmDocId":"HELP534",…,"machineTranslated":false` (`.html:48`), so the Hebrew is PayPal's own text, not a machine
translation. Every translation below is mine [INFERENCE].

**What it is: the full article, not a shell.** [RENDERED] Its title is "מדוע חשבון ה- PayPal שלי הוגבל?" (`.txt:1,7`). The body runs
`.txt:8-60`. The rest is the help-channel footer (`:62-74`) and the cookie banner (`:76-80`). The breadcrumb is
`help_disputes_and_limitations_personal/help_account_limitations_personal` (`.html:48`).

**1. What counts as proof of identity.** [RENDERED]
- "כדי לשחזר את הגישה המלאה לחשבון, עליך להיכנס לחשבון ולהעלות את הוכחת הזהות שלך (למשל עותק של רישיון הנהיגה או
  תעודת הזהות שלך). באפשרותך להעלות מסמך זה ב מרכז ההודעות שלך." (`.txt:54`). [INFERENCE, my translation] "To restore
  full access to the account, you must log in and upload your proof of identity (for example a copy of your driving
  licence or your identity card). You can upload this document in your Message Center."
- Placement. In the HTML this paragraph comes right after the "חשבון לא פעיל" (inactive account) heading and its
  one-line reason, and it closes that section (`.html:40-42`; `.txt:50-54`). The page's own excerpt applies it to every
  reason: "…מסיבות כגון הפרות מדיניות, פעילות בסיכון גבוה, חוסר פעילות. עליך להעלות הוכחת זהות ב'הודעות' כדי לשחזר את
  הגישה." (`.html:48`; the same text is in the meta description, `.html:1`).
- The other named steps are procedure, not identity checks. An email gives the reason (`.txt:8`). "בדרך כלל יהיה צורך להשלים מספר
  שלבים כדי להסיר את המגבלה על החשבון שלך." (usually several steps are needed, `.txt:12`), and they are shown in the Resolution
  Center or under the bell icon (`.txt:14`). "ברוב המקרים, צוות שירות הלקוחות שלנו לא יכול להסיר את המגבלה שלך דרך הטלפון."
  (support usually cannot lift a limitation by phone, `.txt:56`).
- [INFERENCE] "עותק" (a copy) of a licence or ID card is a document upload. A scan meets it, and the text requires no
  live capture. The board allows an ID upload ("an ID upload is allowed", `research/breadth/BOARD.md:117`).

**2. Camera search: none named.** [RENDERED] The whole 328 KB HTML has 0 hits for each of סלפי, תמונה, תמונת, מצלמה,
וידאו, צילום, לצלם, סרטון, פנים, selfie, photo, camera, liveness and biometric. The 6 "face" hits are all CSS
`@font-face` (`.html:2`, `:48`). All 30 hits for "זהות" are classified:
- 16 are US taxpayer-ID hold strings.
- 1 is a login one-time password ("שתסייע לנו לזהות אותך מהר יותר").
- 1 is a support-call passcode ("כדי לאמת את זהותכם, הזינו את קוד האבטחה הבא").
- 12 are copies of the HELP534 excerpt or the upload sentence (`.html:1`, `:42`, `:48`).

`\"verifyLabel\":\"עלינו לוודא שאכן מדובר בך.\"` ("we need to make sure it's you") sits among the phone-support
callback strings ("אם לא שוחחת עימנו בטלפון", `.html:48`). Both "מאומת" hits are the HELP155 card-linking excerpt
("לחשבונות מאומתים ו-4 כרטיסים לחשבונות לא מאומתים", `.html:48`). None of these is a KYC flow.

**3. Sign-up verification article: none linked.** [RENDERED] The body links only the Resolution Center and account home
(`.html:23`, `:43`), the Acceptable Use Policy (`https://www.paypal.com/webapps/mpp/ua/acceptableuse-full`, `.html:27`)
and `mailto:phishing@paypal.com` (`.html:43`). "מרכז ההודעות" in the upload sentence is bold text, not a link
(`.html:42`). The five related articles carry no URL (`.html:48`):
- HELP1175, a disabled account
- HELP392, a reserve
- HELP126, a held payment
- HELP132, a negative balance
- HELP349, the dispute fee

The footer repeats the six help channels, including `/il/cshelp/browse-topics` (`.html:45`). Neither the help index
(Tick 6) nor this article names a sign-up identity-verification article.

**4. Other points for the rail.** [RENDERED] Regulation is one reason for a limitation: "בקשה של מוצרים מסוימים, כגון כרטיס
דביט, יכולה להפעיל חוקים ממשלתיים" (`.txt:22`). Higher-risk seller activity is another. It includes "התחלת למכור מוצרים
מסוג חדש לחלוטין" (starting to sell an entirely new type of product, `.txt:44`) and "חלה עלייה מהירה בהיקף המכירות שלך"
(a fast rise in sales volume, `.txt:46`). [INFERENCE] A new line that starts selling fast may be limited while PayPal
reviews it. That adds to the new-seller holds in §2 (`paypal-il-user-agreement-mpp.txt:863,873`). The article names no
camera step for that case either.

**Verdict for row 21: PASS_TEST on the camera gate (board Q3 condition (i)).** A PayPal IL render now shows the identity
step and what it takes: an uploaded copy of a driving licence or ID card, sent via the Message Center (`.txt:54`). No selfie, liveness,
video or camera step appears anywhere in the 328 KB page, and the board allows an ID upload (`BOARD.md:117`). Three
PayPal IL sources now agree:
- The agreement names only data, document and ownership checks (`paypal-il-user-agreement-mpp.txt:1186-1200`).
- The help index names no other identity article.
- HELP534 names a document upload.

None of them names a camera step.

**Scope and residual risk.** [INFERENCE]
- HELP534 is the path for restoring a limited account, not sign-up. No capture holds a PayPal IL sign-up verification
  article.
- The agreement's document list stays open-ended ("other identifying documents at any time", `paypal-il-user-agreement-mpp.txt:1198`).
- The request itself appears inside the logged-in account, which a GET runner cannot render. This shows that PayPal IL's
  public text names no camera step. It is not a view of the in-account request.
- The kill stays live. If the in-account request asks for a selfie when the owner reaches step 13, the owner stops there
  and the PayPal leg dies, as the board decided in advance (`BOARD.md:121-122`).

**What changes:** condition (i) is met. Step 13 stays held on the other two conditions: (ii) a PayPal-paid engine passes
its ₪0 tests and a sitting admits it; (iii) step 2 is done. The owner is asked for nothing now. This is a reader's
verdict, and the board confirms it at the next sitting.

**Single next check (confirmatory: it can only kill).** Render `https://www.paypal.com/il/cshelp/browse-topics`. The
path is the footer link `/il/cshelp/browse-topics` (`.html:45`) on the host in the meta, and it is ZERO-TESTS row 66's
named fallback. Look under the "החשבון שלי" topic for an identity-confirmation article. If one names a selfie, liveness
or video step, row 21 becomes FAILS_TEST. Suggested slug: `paypal-il-browse-topics`.
