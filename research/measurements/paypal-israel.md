# Measurement: PayPal Israel as a payout rail (CHANNEL_LOOP row 21, breadth board Q3)

**Date:** 2026-09-28. **Branch:** `claude/new-session-j071dx`, read at `2c57b7d` (the captures arrived in its parent `815c2e5`).
**Status: NEEDS_MORE.** The mechanics pass: an Israeli individual may open an account, receive payment for goods and
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
