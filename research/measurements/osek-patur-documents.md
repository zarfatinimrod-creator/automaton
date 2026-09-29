# Measurement: what an עוסק פטור must issue, and whether software may issue it (loop ruling 29.9 (e)3)

**Date:** 2026-09-29 (tick 17). **Branch:** `claude/new-session-j071dx`, read at `5edc1ab`.
**Ordered by:** `research/channel-loop/RULING-2026-09-29-loop.md` (e)3 ("Whether Israeli bookkeeping rules let
software issue the עוסק's receipts. Not rendered here."), its REOPEN IF, and ZERO-TESTS row 153.

**Status in one paragraph.** kolzchut refused the runner for the third time on 29.9 (`kolzchut-osek-patur.meta.json`:
`"status": 403`, rendered). Instead I read the primary text on GitHub: הוראות מס הכנסה (ניהול פנקסי חשבונות),
התשל"ג-1973, in a public-domain mirror of nevo taken on 6.3.2023 (github grade). **A computerised accounting system is
allowed, and a receipt may be sent by computer.** Sending one has conditions the six in ruling (e)3 do not list:
- a one-time registered-mail notice to the assessing officer before the first document;
- the payer's prior consent to receive computerised documents;
- documents produced automatically from a no-delete, auto-numbered file;
- each document marked "מסמך ממוחשב" and signed with an approved or secured electronic signature "של עורך התיעוד".

The law defines a secured signature as one made with means under the **sole control** of the signature-means owner.
Whether a key the runner holds can be the owner's secured signature is a legal question the text does not answer. **So
the REOPEN clause is neither fired nor cleared. It is narrowed to one question: who holds the signature.** One render
of the live nevo page settles whether any of this changed after 2019, the last amendment the mirror lists.

## Grades
- **rendered**: quoted from a capture in `research/rendered/`, cited `file:line`.
- **github**: read by me on 29.9 from GitHub (raw.githubusercontent.com or a blobless clone), pinned to a commit; each
  quote was checked with `grep -n -F` against my text extraction.
- **snippet**: a search result I could not open. None is used here.
- **repo**: this repository's own files.
- **none**: my inference. Every inference is marked **[inference]**.

## What was read
All from `lawsofisrael/lawsofisrael` at `aeca0b25fa4542f4d9bddf76ccdf862f5347b188`, folder `2023-03-06/israel/`
(README: "public domain"). The files are nevo's "נוסח מלא ומעודכן": the current text of each provision is printed
first, followed by dated amendment notes and older wordings. I cite the current text, the first occurrence before the
amendment notes. Where struck and inserted words were merged in the source, I say so.

| Short name | File | git blob | Header |
|---|---|---|---|
| `BK` | `converted_docx/הוראות מס הכנסה (ניהול פנקסי חשבונות), תשל%22ג-1973.docx` | `7258d87a4b16` | "נוסח מלא ומעודכן" (no date) |
| `VAT` | `converted_docx/חוק מס ערך מוסף, תשל%22ו-1975.docx` | `e20977680182` | "נוסח מלא ומעודכן" |
| `VATR` | `converted_docx/תקנות מס ערך מוסף (ניהול פנקסי חשבונות), תשל%22ו-1976.docx` | `68d5b7878fae` | "נוסח מלא ומעודכן" |
| `ESIG` | `converted_docx/חוק חתימה אלקטרונית, תשס%22א-2001.docx` | `692f02822477` | "נוסח מלא ומעודכן" |
| listing | `listing/page_144.html` (the BK entry), `page_010.html` (VAT), `page_074.html` (VATR), `page_007.html` (ESIG) | — | — |

**How the quotes are located.** Line numbers are paragraph numbers in my extraction of `word/document.xml`. I used
Python's `zipfile` and `xml.etree.ElementTree`: one `w:p` per line, its own `w:t` text joined, nested paragraphs
skipped, and tab runs collapsed to one space. The extraction is not stored. Rerun it on the pinned blob to check a quote.

**How current the BK text is.** The mirrored nevo listing gives BK's URL as
`https://www.nevo.co.il/law_html/law01/255_179.htm`. Under "תיקונים אחרונים" its last entry is "ק"ת תשע"ט מס' 8276"
of 26.9.2019, in force 1.1.2020 (`listing/page_144.html`). **Any amendment after 6.3.2023 is unknown.**

---

## 1. What an עוסק פטור must keep and issue

### 1.1 The special rule, §2א (github)
- BK:962: "2א. על אף האמור בסעיף 2, עוסק זעיר שסעיף 31(3) לחוק מס ערך מוסף, תשל"ו-1976, חל עליו, יהיה חייב לנהל מערכת
  חשבונות שתכלול לפחות:". It requires:
  - "(1) שוברי קבלה או ספר פדיון יומי;" (BK:966)
  - "(2) תיק תיעוד חוץ." (BK:967)
- **The label is stale.** The VAT law deleted the term: ""עוסק זעיר" – (נמחקה);" (VAT:988), by amendment 24 in 2002.
  Its §31(3) today reads "(3) עסקאות של עוסק פטור, למעט עסקאות שהן מכירת מקרקעין" (VAT:1779).
- [inference] §2א points at the dealer whose transactions §31(3) exempts, and today that is the עוסק פטור. So §2א
  plausibly governs the עוסק פטור. The text never says "עוסק פטור", and an accountant should confirm.
- If §2א does not apply, a service business falls under schedule י"א. Its lowest tier also requires receipts: "(ג)
  נותני שירותים שמחזור עסקם אינו עולה על 820,000 שקלים חדשים ובעסקם פחות מ-5 מועסקים חייבים לנהל מערכת חשבונות שתכלול
  לפחות:" (BK:9690). The list is a receipts-and-payments book, receipt vouchers, a till roll and an orders book
  (BK:9693-9699). A 2026 third-party read of the live page (`nm-digitalhub/KALFA-RSVP-React`
  `.claude/agents/shared/tax-catalog-israel.md:134-139`, github, secondary) places the עוסק פטור in this tier and notes
  §2א as relief.
- **Either way the core document is the receipt voucher (שובר קבלה).**

### 1.2 What a receipt must carry, §5 (github)
- "5. (א) תעוד פנים שהוא שובר קבלה ייערך לכל תקבול בנפרד, ויכלול –" (BK:990):
  - "(1) מספר עוקב;" (BK:993)
  - (2) the taxpayer's name and ID number, or company number, or VAT registration number (BK:994)
  - "(3) תאריך;" (BK:1000)
  - "(4) שם המשלם ומענו, להוציא מקרים של מכירות קמעוניות במזומן; היה מענו של המשלם ידוע לנישום - אין חובה לציינו;"
    (BK:1001)
  - "(5) סכום התקבול;" (BK:1005)
  - "(6) מהות התקבול, או ציון החשבון שאותו יש לזכות;" (BK:1006)
  - "(7) חתימת המקבל, אלא אם כן נשלחה נקבלה כמסמך ממוחשב." (BK:1008). The words "נשלחה נקבלה" are stored exactly
    so in the file, in one run with no strike mark. It is probably a merge of an old and a new wording, and the render
    confirms the current one.
- "(ד) עותק אחד משובר הקבלה יימסר למשלם." (BK:1012).
- [inference] **Compared with ruling (e)3 condition 3.** The condition lists name and number, sequential number, date,
  payer, amount and period. §5(א) also requires (6), the nature of the receipt, and (7), a signature, unless the
  receipt is a computerised document (section 2). "Period" is not required, but it is harmless under (6). Condition 3
  should add (6) and the signature, or the "מסמך ממוחשב" route.

### 1.3 The VAT side: invoice or receipt (github)
- Every dealer must issue a transaction invoice: "45. עוסק חייב להוציא לקונה חשבונית עסקה על כל עסקה או חלק מעסקה גם
  אם הם פטורים ממס." (VAT:2304).
- The VAT bookkeeping regulations adopt BK: a dealer keeps the income-tax books "ויחולו עליו הוראות מס הכנסה (ניהול
  פנקסי חשבונות) (מס' 2), תשל"ג-1973 (להלן - ההוראות)" (VATR:57).
- The regulations exempt from a transaction invoice "(1) מי שאין עליו לפי ההוראות חובה להוציא חשבונית" (VATR:409, reg
  26ד(א)). "(ב) הפטור לפי סעיף קטן (א) לא יחול אם ביקש הקונה חשבונית עסקה, ואולם במקרה זה רשאי המוכר לתת לקונה קבלה
  במקום חשבונית עסקה." (VATR:411).
- [inference] Under §2א an עוסק פטור keeps receipts, not invoices, so it is exempt from the transaction invoice. A
  payer who asks for one may be given a receipt instead.
- **A tax invoice (Wix's "lawful tax invoice") belongs to the authorised dealer:** "47. (א) עוסק מורשה רשאי להוציא לגבי
  עסקה חייבת במס חשבונית מס" (VAT:2314). [inference] An exempt dealer has no such right. This supports the held
  question ruling (e)3 put on Wix's list.

---

## 2. Is a computerised system allowed, and may it send receipts? Yes, with conditions (github)

### 2.1 Books kept by software
- ""מערכת חשבונות" - ספרי חשבון ותעוד אשר נישום חייב לנהל לפי הוראות אלה, ואם ספרים ותיעוד כאמור מנוהלים באמצעות
  תוכנת מחשב, ובלבד שהם מערכת חשבונות ממוחשבת;" (BK:600). A computerised system is one run "בהתאם לכללים שנקבעו בנספח
  ה'" (BK:612).
- **A document done on the taxpayer's behalf counts:** ""תעוד פנים" - רישום בגין פעולה שנעשתה על-ידי הנישום, או מטעמו;"
  (BK:686). [inference] Nothing here requires the taxpayer to make each record in person.
- **Appendix ה' requirements on the software (BK:2945-2957):**
  - Printed internal documents come from the permanent file only: "(4) הפקת פלט מודפס של תיעוד פנים המפורט בפרק ב'
    מקובץ קבוע בלבד, בציון המלה "מקור" על גבי עותק אחד בלבד והמלה "העתק" על גבי העותקים האחרים;" (BK:2953).
  - "(5) בדיקת רצף המספרים העוקבים של תיעוד פנים;" (BK:2954).
  - Backup, (6).
  - A method to locate computerised documents, (א1) (BK:2971).
  - The permanent file itself: ""קובץ קבוע" - קובץ אשר מתקיימים בו כל אלה:" (BK:652), starting with "(1) אין אפשרות
    למחוק רשומה בו;" (BK:654) and continuing with automatic sequential numbering kept through the tax year (BK:655).
- **Which software must be registered:** "(ג) (1) המנהל ינהל מרשם תוכנות לניהול מערכת חשבונות ממוחשבת המיועדות למכירה,
  להשכרה או לשימושו של אחר (להלן - המרשם);" (BK:2989). [inference] Software written for, and used only on, the
  dealer's own books is not "for sale, rental or another's use" on this wording. If il-biz-tools itself counts as
  accounting software, then because it is offered to the public "for another's use" it might need registration
  (`products/il-biz-tools/README.md:21` describes its per-type auto numbering, repo). That is flagged, not found.

### 2.2 Sending a receipt by computer, §18ב
- "18ב. (א) נישום רשאי לשלוח באמצעות מחשב, לאחר שנרשמו במערכת חשבונותיו, כל אחד מאלה:" (BK:1891). The list starts with
  "(1) שובר קבלה, כאמור בסעיף 5;" (BK:1894). It is allowed provided the document is sent as a "מסמך ממוחשב" marked
  with those words and "שנוצר בהפקה אוטומטית מתוך הקובץ הקבוע שבמערכת חשבונותיו ובלא הקלדה נוספת, למעט צירוף החתימה
  האלקטרונית המאובטחת או החתימה האלקטרונית המאושרת, לפי הענין" (BK:1900).
- **One-time notice:** "(ב) נישום המבקש לשלוח מסמכים ממוחשבים, יודיע על כך לפקיד השומה בדואר רשום, לפני משלוח המסמך
  הממוחשב הראשון." (BK:1902).
- **Consent of the recipient:** "(ג) המסמך הממוחשב יישלח רק למי שהביע את הסכמתו, בכתב או באופן ממוחשב לקבל מסמכים
  ממוחשבים מאותו שולח" (BK:1903). The consent is kept in the books (same line).
- **Payment channel when a secured signature is used:** "(ד) נישום המבקש לשלוח מסמך ממוחשב חתום בחתימה אלקטרונית
  מאובטחת, יקבל את התקבול בשל הפעולה באחד מאמצעים אלה בלבד, ובאופן המאפשר זהוים של הצדדים לעסקה:" (BK:1904). One of
  the means is "(3) העברה ישירה מחשבון הבנק של הלקוח לזכות חשבון הבנק של הנישום הכלול במערכת חשבונותיו." (BK:1907).
- **The computerised document, defined:** ""מסמך ממוחשב" – מסמך שמתקיים בו כל אחד מאלה:" (BK:706):
  - "(1) הוא נוצר, נשלח, נקלט, נראה ונשמר באמצעים ממוחשבים;" (BK:708)
  - "(2) הוא חתום בחתימה אלקטרונית מאושרת או בחתימה אלקטרונית מאובטחת, של עורך התיעוד;" (BK:709)
  - (3) is "(נמחקה)" (BK:711).
- **The signature, defined** (ESIG): ""חתימה אלקטרונית מאובטחת" - חתימה אלקטרונית שמתקיימים בה כל אלה:" (ESIG:207).
  One of the conditions is "(3) היא הופקה באמצעי חתימה הניתן לשליטתו הבלעדית של בעל אמצעי החתימה;" (ESIG:210). An
  "approved" signature is a secured one backed by a certificate from a registered certifying authority (ESIG:212).

---

## 3. What this means for ruling (e)3 ([inference] throughout, on the 2023 text)
- **"May software issue the receipts?" Yes.** Books may be kept by software (2.1). Records made on the taxpayer's
  behalf count (BK:686). A receipt may be produced automatically from the permanent file and emailed (BK:1891-1900). A
  platform that pays by bank transfer into the dealer's account meets the payment-channel rule (BK:1907).
- **"Must the עוסק personally sign each document?" Not by hand, but each emailed receipt carries an electronic signature
  of "עורך התיעוד".** A secured signature must come from means under the **sole control** of its owner (ESIG:210).
  - If the owner is the signer and the key sits with the runner, whether that is the owner's "sole control" is a legal
    question.
  - If the company's operator is the signer ("מטעמו"), whose signature it must be is the same question.
  - An approved signature needs a certifying authority's certificate, which [inference] costs money. That is a ₪0-rule
    question for the owner, not a per-document step.
  - **Net:** REOPEN IF ("the עוסק must personally sign or issue each document") is not fired by the text. It is not
    cleared either while the signature question is open.
- **Conditions to add to the six (none of them per-document owner work, except as noted):**
  - (7) Before the first computerised document, a registered-mail notice to the assessing officer (BK:1902). This is a
    one-time physical act with a postage cost. It is owner paperwork once, so under MISSION it belongs in the step-2
    batch, and it is not free.
  - (8) Each payer's written or computerised consent to receive computerised documents, kept in the books (BK:1903).
    [inference] A payer's finance address answering "yes" by email would be the consent. Y8, Wix and Indiebook each
    need it once.
  - (9) Documents are produced automatically from a permanent, no-delete, auto-numbered file, marked "מסמך ממוחשב",
    with a sequence check (BK:1900, BK:652-655, BK:2953-2954).
  - (10) The receipt also carries the nature of the receipt (BK:1006). Condition 3 as written omits it.
- **The alternatives, both worse:**
  - A paper receipt signed by the owner ("חתימת המקבל", BK:1008) is per-document owner work. That is the KILL-4 path
    the ruling feared.
  - Self-billing venues (CrazyGames, GameDistribution; ruling (e)3 BASIS) need nothing from us.
- **Wix:** an exempt dealer may give a receipt, or on request a receipt in place of a transaction invoice (VATR:411).
  The right to a tax invoice is the authorised dealer's (VAT:2314). The held question stands as written.
- **What this does not settle:**
  - Whether §2א governs today's עוסק פטור (1.1).
  - Whether any provision changed after 2019 (the live page).
  - Whether the Tax Authority's practice accepts a runner-held secured signature (no text read here).

## Next-render URLs (for `research/rendered/urls.txt`; each URL appears verbatim in the mirrored nevo listing, cited above)
Row 153 (kolzchut) has now failed three times (27.9, 28.9 and 29.9, `kolzchut-osek-patur.meta.json`). I suggest
retiring it in favour of URL 1, the primary text it was meant to summarise.

| # | URL | Slug | What it settles |
|---|---|---|---|
| 1 | `https://www.nevo.co.il/law_html/law01/255_179.htm` | `nevo-books-instructions` | Whether §2א, §5(א)(7) (the "נשלחה נקבלה" wording), §18ב(א)-(ד), the "מסמך ממוחשב" definition and Appendix ה'(ג)(1) still read as in the 2023 mirror, and whether anything was amended after 2019. Also confirmed by `skills-il/accounting` and `nm-digitalhub/KALFA-RSVP-React` (github, both cite it as fetched live in 2026). |
| 2 | `https://www.nevo.co.il/law_html/law01/159m1_001.htm` | `nevo-electronic-signature-law` | The current "חתימה אלקטרונית מאובטחת" definition, the sole-control condition behind the one open question. |
| 3 | `https://www.nevo.co.il/law_html/law01/271_019.htm` | `nevo-vat-bookkeeping-regs` | Reg 1 (adopting BK) and reg 26ד (exemption from the transaction invoice; a receipt when the buyer asks), live. |
| 4 | `https://www.nevo.co.il/law_html/law01/271_001.htm` | `nevo-vat-law` | §45, §47(א) and §31(3) live: whether an exempt dealer can meet Wix's "lawful tax invoice". Lower priority; the Wix question is held anyway. |
