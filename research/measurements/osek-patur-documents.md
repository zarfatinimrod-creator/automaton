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
of 26.9.2019, in force 1.1.2020 (`listing/page_144.html`). **Any amendment after 6.3.2023 is unknown.** **[superseded
(tick 18): the live page, captured 29.9.2026, lists no amendment after 26.9.2019; see "29.9 (tick 18, rendered)" 3.0]**

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
  (BK:9693-9699) **[superseded (tick 18): the tier has eight items, including an invoice for a service of ₪210 or more;
  see "29.9 (tick 18, rendered)" 3.1]**. A 2026 third-party read of the live page (`nm-digitalhub/KALFA-RSVP-React`
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
    confirms the current one. **[superseded (tick 18): the live page prints this as the current 2004 wording, with no
    strike or insert marks in its `.html`; see "29.9 (tick 18, rendered)" 3.2]**
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

---

## 29.9 (tick 18, rendered)

**Read by:** reader A, tick 18, from the render-watch captures of ZERO-TESTS rows 164-165. Only the captures below
were read. Every quote was checked with `grep -n -F` against the capture before it was written here.

| Short name | Capture (under `research/rendered/`) | fetchedAt (UTC) | sha256 (first 12) | Currency |
|---|---|---|---|---|
| `R-BK` | `nevo-books-instructions.txt` (13,141 lines, 1.4 MB; searched with grep, not read whole) | 2026-09-29 09:56:47 | `e7b2bbe0b560` | No "נוסח עדכני" stamp. The page's own list of amending instruments ends at `R-BK:13139`: "ק"ת תשע"ט מס' 8276 מיום 26.9.2019 עמ' 4038 – הוראות תשע"ט-2019; תחילתן ביום 1.1.2020". |
| `R-BKH` | `nevo-books-instructions.html` (the same page, all on one line, so every citation is `:1`) | same | same | — |
| `R-ESIG` | `nevo-electronic-signature-law.txt` (473 lines) | 2026-09-29 09:56:50 | `9c549606698a` | "נוסח עדכני נכון ליום: 02-04-2026" (`R-ESIG:3`) |

**How the current text was told apart from history.** The page prints the current text of each provision first,
then the dated amendment notes. The `.txt` flattens struck and inserted words into one run. The `.html` keeps them as
`<s>…</s>` and `<u>…</u>`. Where a tick-17 reading depended on which words were current, I checked the `.html`
markup.

### 3. הוראות מס הכנסה (ניהול פנקסי חשבונות), at rendered grade

**3.0 Currency. Settled for the page as published.** The page lists no amending instrument later than 26.9.2019 (in
force 1.1.2020). A grep of every "מיום d.m.20yy" in the page finds no date later than 1.1.2020. So the 2023 mirror
that tick 17 read matches the live page wherever the two were compared below.

**3.1 §2 and §2א: who keeps what. §2א is confirmed verbatim.**
- §2(א) today binds every taxpayer to the schedule for his trade: "(א) נישום חייב לנהל מערכת חשבונות לפי התוספת
  בהוראות אלה החלה עליו, ובהתאם לאמור בהוראות אלה; הוראה זו לא תחול על נישום שלא היתה לו, בשנת המס, הכנסה לפי סעיף
  2(1) לפקודה;" (`R-BK:1395`).
- In 1995 the small dealer was taken out of §2(א) and given his own section. The 1995 note strikes
  `<s>על עוסק זעיר שסעיף 31(3) לחוק מס ערך מוסף, התשל&quot;ו-1976, חל עליו, או</s>` (`R-BKH:1`), and the note under
  §2א reads "הוספת סעיף 2א" (`R-BK:1433`).
- §2א: "2 א. על אף האמור בסעיף 2, עוסק זעיר שסעיף 31(3) לחוק מס ערך מוסף, תשל"ו-1976, חל עליו, יהיה חייב לנהל מערכת
  חשבונות שתכלול לפחות:" (`R-BK:1427`). It requires:
  - "(1) שוברי קבלה או ספר פדיון יומי;" (`R-BK:1428`)
  - "(2) תיק תיעוד חוץ." (`R-BK:1429`)
- **Does §2א reach an עוסק פטור? Not settled at rendered grade.**
  - The phrase "עוסק פטור" occurs 0 times in the capture (`grep -c`).
  - §2א names the "עוסק זעיר" to whom VAT law §31(3) applies. The link from that term to today's עוסק פטור runs
    through the VAT law ("עוסק זעיר" deleted; §31(3) = "עסקאות של עוסק פטור"; tick-17 1.1). That link is still
    github grade, because the VAT law was not rendered.
- **If §2א does not apply, which schedule does?** No schedule names software, digital goods or online sales ("דיגיטל"
  appears only in the scanning and digital-archive provisions, `R-BK:2669`, `:3260` and `:3271-3310`). Three schedules are candidates by their definitions:
  - Schedule א' (manufacturers): `"יצרן" - נישום שעסקו או חלק מעסקו ייצור מוצרים;` (`R-BK:3362`).
  - Schedule ג' (retailers): `"קמעונאי" - נישום שעסקו או חלק מעסקו מכירת טובין מתוצרת זולתו לצרכן` (`R-BK:5919`).
  - Schedule י"א, headed "ניהול פנקסי חשבונות על-ידי נותני שירותים ואחרים" (`R-BK:9506`). It is the residual one:
    "(1) נישום שעסקו או חלק מעסקו מתן שירות לעסק אחר או לצרכן ואשר לא חלה עליו תוספת אחרת מהתוספות להוראות אלה;"
    (`R-BK:9514`) and "(2) נישום אחר המנהל עסק או משלח יד ולא חלה עליו תוספת אחרת מן התוספות להוראות אלה."
    (`R-BK:9515`).
  - The free professions in schedule ה' are a closed list of trades (`R-BK:8043`), and none is software. Schedule
    י"א's §3 ("3. נותני שירותים המנויים בסעיף זה יכללו במערכת החשבונות את הספרים והתעוד דלהלן:", `R-BK:10471`)
    names party halls, hotels, transport, garages, car rental, renovation, entertainment venues, restaurants and
    currency exchange, and none of them digital.
  - [inference] Selling one's own software licence is not "goods made by another", so schedule ג' fits poorly.
    Whether it is "ייצור מוצרים" (א') or a service (י"א) is a characterisation for an accountant.
- **Schedule י"א, lowest tier. This corrects tick 17.** The chapeau reads "(ג) נותני שירותים שמחזור עסקם אינו עולה על
  820,000 שקלים חדשים ובעסקם פחות מ-5 מועסקים חייבים לנהל מערכת חשבונות שתכלול לפחות:" (`R-BK:9549`). The list has
  eight items, not the four tick 17 gave:
  - "(1) ספר תקבולים ותשלומים;" (`:9550`)
  - "(2) שוברי קבלה לגבי תקבולים שלא נכללו בסרט קופה רושמת;" (`:9551`)
  - "(3) סרט קופה רושמת;" (`:9552`)
  - (4) an orders book (`:9553`)
  - "(5) חשבונית לגבי שירות בסכום של 210 שקלים חדשים או יותר;" (`:9554`, which continues)
  - "(6) תיק תעוד חוץ;" (`:9555`)
  - "(7) רשימת יתרות הלקוחות והספקים לסוף שנת המס;" (`:9557`)
  - "(8) רשימת המלאי לסוף שנת המס אם המלאי הוא מהותי בעסקו של הנישום, ובכל מקרה שבו ערך המלאי עולה על 10,100 שקלים
    חדשים." (`:9559`)
  - [inference] Under schedule י"א a service of ₪210 or more also needs an income-tax invoice (§9), not only a receipt.
    Under §2א it does not. Which regime governs therefore changes the document set, not only the book set.

**3.2 §5, the receipt voucher. Confirmed, and the (7) wording is settled.**
- The opening: "5 . (א) תעוד פנים שהוא שובר קבלה ייערך לכל תקבול בנפרד, ויכלול –" (`R-BK:1451`). The seven items
  match tick-17 1.2, including "(6) מהות התקבול, או ציון החשבון שאותו יש לזכות;" (`R-BK:1457`).
- Item (7): "(7) חתימת המקבל, אלא אם כן נשלחה נקבלה כמסמך ממוחשב." (`R-BK:1458`). In the `.html` this line carries no
  `<s>` or `<u>` mark. The 2004 note reads "החלפת פסקה 5(א)(7)" (`R-BK:1590`), and the wording it replaced was "(7)
  חתימת המקבל." (`R-BK:1592`).
  - **So "נשלחה נקבלה" is the page's current printed text of the 2004 wording, not a merge of two wordings.** Tick
    17's merge hypothesis is superseded (marked in 1.2 above).
- "(ד) עותק אחד משובר הקבלה יימסר למשלם." (`R-BK:1461`). §18ב(א) deems an emailed receipt to be that copy (3.4).

**3.3 The paper alternatives, and what they need from a person**
- **A paper receipt voucher** needs "(7) חתימת המקבל" (`R-BK:1458`), and a copy "יימסר למשלם" (`R-BK:1461`).
  [inference] A handwritten signature and a handed-over copy need a person. An automated operator cannot make either.
  Only the computerised route of §18ב removes the signature and deems delivery.
- **The daily takings book** is §2א's other option ("שוברי קבלה או ספר פדיון יומי", `R-BK:1428`). Its rules:
  - "6 . (א) תעוד פנים שהוא ספר פדיון יומי יהיה ספר כרוך, ויכלול –" (`R-BK:1594`), ending with "(4) סיכום בדיו של כל
    התקבולים, אשר ייעשה בסוף אותו יום, או למחרתו בבוקר." (`R-BK:1598`).
  - A "bound book" may be a permanent file: `"ספר כרוך" -` (`R-BK:1170`) includes "(ג) קובץ קבוע;" (`R-BK:1173`).
  - [inference] The book can be kept as a no-delete, auto-numbered file, and nothing in §6 is "sent", so §18ב's notice,
    consent and signature would not be triggered by the book itself.
  - Two things the text leaves open:
    - whether a computed daily total satisfies "בדיו" (in ink);
    - whether a dealer who keeps only the daily book must still hand each payer a receipt. §2א and §6 do not say so,
      but VAT reg 26ד(ב) (github grade, tick-17 1.3) lets a buyer demand a document.
  - This is a candidate ₪0 route for the board, not a finding.

**3.4 §18ב, sending receipts by computer. Confirmed, with two details tick 17 did not quote.**
- "18 ב. (א) נישום רשאי לשלוח באמצעות מחשב, לאחר שנרשמו במערכת חשבונותיו, כל אחד מאלה:" (`R-BK:2233`). The first
  item is "(1) שובר קבלה, כאמור בסעיף 5;" (`R-BK:2234`).
- The condition in full: "ובלבד ששלחם כמסמך ממוחשב, עליו נכתבו בצורה בולטת לעין המילים מסמך ממוחשב, אשר נוצר בסריקת
  מקור התיעוד למחשב או שנוצר בהפקה אוטומטית מתוך הקובץ הקבוע שבמערכת חשבונותיו ובלא הקלדה נוספת, למעט צירוף החתימה
  האלקטרונית המאובטחת או החתימה האלקטרונית המאושרת, לפי הענין, ולמעט צירוף המילים מסמך ממוחשב;" (`R-BK:2238`).
  - New 1: a scan of a source document is a second permitted origin, besides automatic production.
- New 2, deemed delivery: "שלח הנישום שובר קבלה במסמך ממוחשב כאמור, יראו לענין סעיף 5(ד) כאילו מסר למשלם עותק משובר
  הקבלה." (`R-BK:2238`).
- The notice: "(ב) נישום המבקש לשלוח מסמכים ממוחשבים, יודיע על כך לפקיד השומה בדואר רשום, לפני משלוח המסמך הממוחשב
  הראשון." (`R-BK:2239`).
- The payer's consent: "(ג) המסמך הממוחשב יישלח רק למי שהביע את הסכמתו, בכתב או באופן ממוחשב לקבל מסמכים ממוחשבים
  מאותו שולח, לפני קבלת המסמך הממוחשב הראשון וכל עוד לא ביטל את הסכמתו לקבלת מסמכים ממוחשבים בכתב או באופן ממוחשב;
  הנישום ישמור את ההסכמה או את ביטולה, לפי הענין, כחלק בלתי נפרד ממערכת החשבונות שלו." (`R-BK:2240`).
- The payment channel, for a **secured** signature only: "(ד) נישום המבקש לשלוח מסמך ממוחשב חתום בחתימה אלקטרונית
  מאובטחת, יקבל את התקבול בשל הפעולה באחד מאמצעים אלה בלבד, ובאופן המאפשר זהוים של הצדדים לעסקה:" (`R-BK:2241`).
  The three means are:
  - "(1) כרטיס אשראי של הלקוח כאשר השובר ערוך לפקודת הנישום;" (`:2242`)
  - "(2) שיק משורטט על שם הלקוח, שנכתב עליו "לא סחיר", לפקודת הנישום בלבד;" (`:2243`)
  - "(3) העברה ישירה מחשבון הבנק של הלקוח לזכות חשבון הבנק של הנישום הכלול במערכת חשבונותיו." (`:2244`)
  - [inference, REFUTED by the tick-18 verifier] (ד) does not bind a document signed with an **approved** signature. A platform payout that reaches
    the dealer through a wallet (PayPal, Payoneer) rather than "מחשבון הבנק של הלקוח" may not meet (3). The payout
    rail of each venue is not in these texts.

**3.5 "מסמך ממוחשב", and whose signature it carries. Confirmed. The signer changed in 2004.**
- The current definition: `"מסמך ממוחשב" – מסמך שמתקיים בו כל אחד מאלה:` (`R-BK:1205`):
  - "(1) הוא נוצר, נשלח, נקלט, נראה ונשמר באמצעים ממוחשבים;" (`R-BK:1206`)
  - "(2) הוא חתום בחתימה אלקטרונית מאושרת או בחתימה אלקטרונית מאובטחת, של עורך התיעוד;" (`R-BK:1207`)
  - "(3) (נמחקה);" (`R-BK:1208`)
- The 2004 note shows the change:
  `<s>בחתימה אלקטרונית מאובטחת של הנישום</s> <u>בחתימה אלקטרונית מאובטחת, של עורך התיעוד</u>` (`R-BKH:1`). The old (3)
  is struck: `(3) צוינו בו בצורה בולטת לעין המילים &quot;מסמך ממוחשב&quot;;</span></s>` (`R-BKH:1`). The "מסמך ממוחשב"
  label now lives in §18ב(א).
  - **So since 2004 the signature is the document preparer's ("עורך התיעוד"), not necessarily the taxpayer's.** The
    term "עורך התיעוד" is not defined on the page. It occurs only at `R-BK:1207` and in the 2004 note.
- Both signature types are borrowed from the Electronic Signature Law: `"חתימה אלקטרונית מאובטחת" – כהגדרתה בחוק חתימה
  אלקטרונית, התשס"א-2001;` (`R-BK:1221`), and likewise `"חתימה אלקטרונית מאושרת"` (`R-BK:1226`).
- Records made on the taxpayer's behalf count: `"תעוד פנים" - רישום בגין פעולה שנעשתה על-ידי הנישום, או מטעמו;`
  (`R-BK:1187`). Tick 17 is confirmed.

**3.6 The computerised system and its software. Confirmed, plus one requirement tick 17 did not list.**
- `"מערכת חשבונות" - ספרי חשבון ותעוד אשר נישום חייב לנהל לפי הוראות אלה, ואם ספרים ותיעוד כאמור מנוהלים באמצעות
  תוכנת מחשב, ובלבד שהם מערכת חשבונות ממוחשבת;` (`R-BK:1113`).
- Registration binds only software that must be registered: "ולגבי מערכת חשבונות המנוהלת באמצעות תוכנה החייבת רישום
  במרשם התוכנות לניהול מערכת חשבונות ממוחשבת כאמור בנספח ה' שבסעיף 36 - ובלבד שנרשמה על ידי המנהל;" (`R-BK:1123`).
  The register covers "(ג) (1) המנהל ינהל מרשם תוכנות לניהול מערכת חשבונות ממוחשבת המיועדות למכירה, להשכרה או
  לשימושו של אחר (להלן - המרשם);" (`R-BK:3182`).
- The permanent file: `"קובץ קבוע" - קובץ אשר מתקיימים בו כל אלה:` (`R-BK:1157`). Its conditions are "(1) אין אפשרות
  למחוק רשומה בו;" (`R-BK:1158`) and "(2) הרשומות בו מוספרו באופן אוטומטי במספור עוקב, כשרצף המספרים העוקבים נשמר
  מעיבוד לעיבוד במשך שנת המס;" (`R-BK:1159`).
- Appendix ה' is confirmed:
  - "(4) הפקת פלט מודפס של תיעוד פנים המפורט בפרק ב' מקובץ קבוע בלבד, בציון המלה "מקור" על גבי עותק אחד בלבד והמלה
    "העתק" על גבי העותקים האחרים;" (`R-BK:3150`)
  - "(5) בדיקת רצף המספרים העוקבים של תיעוד פנים;" (`R-BK:3151`)
  - "(6) גיבוי יזום של מערכת החשבונות הממוחשבת, למעט לתוכנה המנהלת את מערכת החשבונות." (`R-BK:3152`)
  - "(א1) בתוכנה לניהול מערכת חשבונות ממוחשבת המפיקה מסמכים ממוחשבים תתקיים שיטה לאיתור אותם מסמכים." (`R-BK:3167`)
- New: "(ב) מערכת חשבונות ממוחשבת, המפיקה תיעוד פנים, תצוייד במיתקן הגנה למקרה של הפסקת זרם החשמל." (`R-BK:3177`).
  [inference] A hosted runner's infrastructure presumably provides this. The text does not say how it is shown.

**3.7 Where the books are kept, and for how long (§25). Tick 17 did not cover it.**
- Place: "25 . (א) מערכת החשבונות תוחזק במען העסק, כפי שציינו הנישום בדין וחשבון על ההכנסה, או בכל מקום אחר אשר
  הנישום הודיע עליו בכתב לפקיד השומה ואולם בעסק שהיתה לו הכנסה שהופקה בישראל או באזור". The same line ends with
  "– בכל מקום אחר בישראל או באזור שעליו הודיע הנישום לפקיד השומה." (both `R-BK:2659`).
  - [inference] For Israeli-source income the books stay at the business address, or at another place **in Israel**
    notified in writing. Whether a permanent file on a foreign-hosted runner or repository is "kept" abroad is a
    question the text raises and does not answer. Such a notice would be one more piece of one-time owner paperwork.
- Period: "(ג) מערכת החשבונות תישמר במשך שבע שנים מתום שנת המס שאליה היא מתייחסת, או במשך שש שנים מיום הגשת הדו"ח על
  ההכנסה לאותה שנת המס, הכל לפי המאוחר." (`R-BK:2661`).
- Signed computerised documents stay computerised: "(ג2) מסמך ממוחשב ששלח או קיבל הנישום, חתום בחתימה אלקטרונית,
  יישמר באמצעי אחסון ממוחשבים, כחלק בלתי נפרד ממערכת החשבונות של הנישום." (`R-BK:2663`).
- Card settlements: "(ג1) נישום המוכר טובין, או הנותן שירותים תמורת סכום ששולם לו בכרטיס אשראי, ישמור את כל מסמכי
  ההתחשבנות בינו לבין חברת האשראי כחלק ממערכת חשבונותיו." (`R-BK:2662`).

### 4. חוק חתימה אלקטרונית (consolidated 02-04-2026), at rendered grade

**4.1 Definitions. Tick-17 2.2 (`ESIG:207`, `:210`, `:212`) is confirmed.**
- `" חתימה אלקטרונית " – חתימה שהיא מידע אלקטרוני או סימן אלקטרוני, שהוצמד או שנקשר למסר אלקטרוני;` (`R-ESIG:23`)
- `" חתימה אלקטרונית מאובטחת " – חתימה אלקטרונית שמתקיימים בה כל אלה:` (`R-ESIG:25`):
  - "(1) היא ייחודית לבעל אמצעי החתימה;" (`R-ESIG:27`)
  - "(2) היא מאפשרת זיהוי לכאורה של בעל אמצעי החתימה;" (`R-ESIG:29`)
  - "(3) היא הופקה באמצעי חתימה הניתן לשליטתו הבלעדית של בעל אמצעי החתימה;" (`R-ESIG:31`)
  - "(4) היא מאפשרת לזהות שינוי שבוצע במסר האלקטרוני לאחר מועד החתימה;" (`R-ESIG:33`)
- `" חתימה אלקטרונית מאושרת " – חתימה אלקטרונית מאובטחת אשר גורם מאשר הנפיק תעודה אלקטרונית מאושרת בדבר אמצעי אימות החתימה המזהה אותה;`
  (`R-ESIG:35`). The certifying authority is a registered one: `" גורם מאשר " – גורם המנפיק תעודות אלקטרוניות מאושרות, והרשום במרשם לפי הוראות חוק זה;` (`R-ESIG:15`).
- The means and the holder:
  - `" אמצעי חתימה " – תוכנה, חפץ או מידע ייחודיים, הדרושים להפקת חתימה אלקטרונית מאובטחת;` (`R-ESIG:11`)
  - `" בעל אמצעי חתימה " – מי שהופק לו אמצעי חתימה;` (`R-ESIG:13`)
  - "מידע" here has the Computers Law's meaning: `" מידע ", לעניין ההגדרות בסעיף זה – כהגדרתו בחוק המחשבים;` (`R-ESIG:39`)

**4.2 The holder's duties, and what an approved signature adds**
- §7(א): "(1) ינקוט את כל האמצעים הסבירים לשם שמירה על אמצעי החתימה שלו ולשם מניעת שימוש בו בלא הרשאתו;"
  (`R-ESIG:104`), and "(2) ימסור הודעה, מיד כשנודע לו על פגיעה בשליטתו באמצעי החתימה" (`R-ESIG:106`). §7(ב): "(ב)
  קיים בעל אמצעי החתימה את חובותיו כאמור בסעיף זה, לא יהיה אחראי לנזק שנגרם עקב שימוש באמצעי החתימה שלו בלא
  הרשאתו." (`R-ESIG:110`).
- A certificate is personal and identifies the holder:
  - "18. (א) גורם מאשר רשאי להנפיק לאדם מסוים, לפי בקשתו (להלן – המבקש), תעודה אלקטרונית מאושרת, המאשרת כי אמצעי
    אימות חתימה מסוים הוא שלו." (`R-ESIG:300`)
  - "(ב) גורם מאשר לא ינפיק תעודה אלקטרונית מאושרת אלא לאחר שנקט אמצעים סבירים לזהות את המבקש" (`R-ESIG:302`)
  - The certificate includes "(1) שמו של בעל התעודה ומספר הזהות שלו, או פרט מזהה אחר, כפי שקבע השר;" (`R-ESIG:311`)
- Evidence: only the approved signature is prima facie proof of who signed. "(3) לעניין מסר אלקטרוני החתום בחתימה
  אלקטרונית מאושרת – גם לכך שהמסר האלקטרוני נחתם על ידי בעל אמצעי החתימה." (`R-ESIG:78`).
- Where an enactment requires a signature, the general rule is "2. (א) נדרשה לפי חיקוק חתימתו של אדם על מסמך, ניתן
  לקיים דרישה זו לגבי מסמך שהוא מסר אלקטרוני, באמצעות אחת מאלה:" (`R-ESIG:55`). The two options are "(1) חתימה
  אלקטרונית מאושרת;" (`R-ESIG:57`) and "(2) חתימה אלקטרונית אחרת, ובלבד שמתקיימות, ברמת ודאות מספקת בנסיבות העניין,
  התכליות לדרישת החתימה בהתאם לאותו חיקוק." (`R-ESIG:59`).
  - [inference] The bookkeeping definition names only "מאושרת" or "מאובטחת" (`R-BK:1207`), so option (2) does not
    widen it.

**4.3 Can a key held by an automated system, on the holder's behalf, meet "sole control"?**
- **Verdict: not settled by the text. The words point both ways, and no text read defines "control".**
- What the text says:
  - A signature means may be software or data ("תוכנה, חפץ או מידע ייחודיים", `R-ESIG:11`). A key file is the kind of
    thing the law contemplates.
  - The holder is the person for whom the means was produced ("מי שהופק לו", `R-ESIG:13`), not whoever stores it.
  - Condition (3) asks that the means be "הניתן לשליטתו הבלעדית" (`R-ESIG:31`). [inference] That is phrased as a
    capability ("amenable to his sole control"), not as "held by no one else".
  - §7(א)(1) makes the holder prevent use "בלא הרשאתו" (`R-ESIG:104`). [inference] That presupposes that use with his
    authorisation is possible.
- What cuts the other way [inference]:
  - A key in a GitHub environment secret can also be reached by the platform and by any repository administrator.
    Whether that is still "sole" control is exactly the characterisation the text does not make.
  - The bookkeeping instructions ask for the signature "של עורך התיעוד" (`R-BK:1207`). If the preparer is the
    automated operator, it is not a "person" to whom a certificate is issued "לאדם מסוים" (`R-ESIG:300`). That bears
    on the approved route only.
- The approved route costs a certificate from a registered certifying authority, which names the holder with an ID
  number (`R-ESIG:311`). That touches both the ₪0 rule and the identity rule. The secured route needs no certificate,
  but it limits payment to the three channels in §18ב(ד) (3.4).

### 5. Tick-17 claims this section supersedes
- 1.1: "The list is a receipts-and-payments book, receipt vouchers, a till roll and an orders book (BK:9693-9699)".
  The rendered tier (ג) has eight items, including an invoice for a service of ₪210 or more (3.1).
- 1.2: "(7) … It is probably a merge of an old and a new wording". The live page prints that wording as current, with
  no strike marks. It replaced "(7) חתימת המקבל." in 2004 (3.2).
- "How current the BK text is": "Any amendment after 6.3.2023 is unknown." The live page lists none after 26.9.2019
  (3.0).

### 6. Next-render URLs (not yet captured; both from the tick-17 table, sourced from the lawsofisrael nevo listing, github)

| URL | Slug | What it settles |
|---|---|---|
| `https://www.nevo.co.il/law_html/law01/271_001.htm` | `nevo-vat-law` | Whether "עוסק זעיר" is deleted and §31(3) reads "עסקאות של עוסק פטור": the one link that makes §2א govern an עוסק פטור (3.1). Also §45 and §47(א). |
| `https://www.nevo.co.il/law_html/law01/271_019.htm` | `nevo-vat-bookkeeping-regs` | Reg 1 (adopting these instructions) and reg 26ד (exemption from the transaction invoice; a receipt on the buyer's request). This bears on whether a daily-takings-book-only dealer must still issue receipts (3.3). |

### What this settles for FABLE_QUEUE row 17
- The live page matches the 2023 mirror on §2א, §5(א), §18ב(א)-(ד), "מסמך ממוחשב" and Appendix ה', and lists no
  amendment after 26.9.2019. §18ב allows an emailed receipt with a secured **or** approved signature "לפי הענין". It
  requires a one-time registered-mail notice, each payer's prior consent, and automatic production from the permanent
  file. It deems the email to be the payer's copy.
- Since 2004 the signature is "של עורך התיעוד" (it replaced "של הנישום"). A secured signature needs means "הניתן
  לשליטתו הבלעדית של בעל אמצעי החתימה". The holder is "מי שהופק לו אמצעי חתימה", and the means may be software. No
  text read says whether a key stored by a system on the holder's behalf is under his sole control.
- A certificate (for the approved route) is issued "לאדם מסוים" and names the holder with an ID number. A secured
  signature needs none, but it restricts payment to a card, a crossed cheque or a direct bank transfer.
- The page never says "עוסק פטור". §2א (for the "עוסק זעיר שסעיף 31(3)… חל עליו") requires "שוברי קבלה או ספר פדיון
  יומי" plus an external-documents file. The daily takings book may be a "קובץ קבוע" but needs a "סיכום בדיו". That
  §2א reaches today's עוסק פטור still rests on the VAT law, which is github grade.
- §25(א) keeps the books, for Israeli-source income, at the business address or at another place "בישראל או באזור"
  notified to the assessing officer. It keeps them for 7 years (or 6 from the return, whichever is later). Signed
  computerised documents are kept "באמצעי אחסון ממוחשבים".

---

## 29.9 (tick 19, rendered)

Rows 178-179 (captured 29.9 ~10:46 UTC). Read by an Opus reader, checked by an adversarial verifier.

### 29.9 (tick 19, rendered): חוק מס ערך מוסף and the VAT bookkeeping regulations (ZERO-TESTS rows 178-179)

**Read by:** a tick-19 reader, from the render-watch captures of ZERO-TESTS rows 178-179, plus the tick-18 captures
`R-BK` and `R-BKH` where cited. Every quote was checked with `grep -n -F` against the capture before it was written
here.

| Short name | Capture (under `research/rendered/`) | fetchedAt (UTC) | sha256 (first 12) | Currency |
|---|---|---|---|---|
| `R-VAT` | `nevo-vat-law.txt` (1,818 lines) | 2026-09-29 10:46:51 | `ec477ce90ae6` | "נוסח עדכני נכון ליום: 13-07-2026" (`R-VAT:3`) |
| `R-VATH` | `nevo-vat-law.html` (the same page) | same | same | Current text only. The file has no `<s>`, no `<u>` and no `display:none` (0 matches each), so the page cannot date any single provision. |
| `R-VATR` | `nevo-vat-bookkeeping-regs.txt` (742 lines) | 2026-09-29 10:46:52 | `7046ce2704b3` | No "נוסח עדכני" stamp (0 matches in the `.html`). The list of instruments ends "ק"ת תשפ"ו מס' 12460 מיום 8.7.2026 עמ' 2345 – הודעה תשפ"ו-2026; תחילתה ביום 1.1.2026." (`R-VATR:740`). See 8.5. |
| `R-VATRH` | `nevo-vat-bookkeeping-regs.html` (the same page, all on one line, so every citation is `:1`) | same | same | — |

**How the current text was told apart from history.**
- `R-VAT` uses a different nevo layout from `R-BK`: it prints the current text only, with no amendment notes.
- `R-VATR` uses the `R-BK` layout. The current text is plain. Dated amendment notes and older wordings sit in spans
  styled `display:none;background:#FFFF99` in the `.html`, and the `.txt` flattens them into the same run. Every
  claim below about what is current in `R-VATR` was checked against that markup, and the page's own table of contents
  was used as a second check.

### 7. חוק מס ערך מוסף (consolidated 13-07-2026), at rendered grade

**7.1 Definitions, §1. Tick 17's github reading is confirmed.**
- `" עוסק " – מי שמוכר נכס או נותן שירות במהלך עסקיו, ובלבד שאינו מלכ"ר או מוסד כספי, וכן מי שעושה עסקת אקראי;`
  (`R-VAT:87`)
- `"עוסק זעיר" – (נמחקה)` (`R-VAT:89`). The page carries no history, so the date of the deletion (tick 17: amendment
  24, 2002) stays github grade.
- `" עוסק מורשה "– עוסק שנרשם לפי סעיף 52 או לפי סעיף 58 ואינו עוסק פטור וכן מי שנמנה עם סוג עוסקים שלגביהם קבע שר האוצר שיירשמו כעוסקים מורשים;`
  (`R-VAT:91`)
- `" עוסק פטור " – עוסק שמחזור העסקאות שלו בכל עסקיו אינו עולה על 122,833 שקלים חדשים לשנה או על סכום גבוה יותר שקבע שר האוצר;`
  (`R-VAT:93`). The amount is indexed every 1 January under §126(א) (`R-VAT:1637`).
- The invoice terms:
  - `" חשבונית " – חשבונית עסקה או חשבונית מס;` (`R-VAT:31`)
  - `" חשבונית מס " – חשבונית שהוצאה על פי סעיף 47;` (`R-VAT:33`)
  - `" חשבונית עסקה " – חשבונית שחובה להוציאה לפי סעיף 45;` (`R-VAT:35`)
- The law also defines the two electronic signatures (7.6).

**7.2 §31(3), the exempt dealer's exemption. The link §2א needs is now rendered on both ends.**
- Under the heading "פטור לעסקאות מסוימות" (`R-VAT:473`): "31. אלה עסקאות הפטורות ממס:" (`R-VAT:474`).
- "(3) עסקאות של עוסק פטור, למעט עסקאות שהן מכירת מקרקעין, או עסקאות שהן מכירת ציוד שאינו מקרקעין שבעת רכישתו נוכה
  מס תשומות ששולם בשלו;" (`R-VAT:484`). Tick 17 quoted the item only up to "מכירת מקרקעין" (1.1). The live item also
  carves out equipment on whose purchase input tax was deducted. [inference] Neither carve-out touches a software or
  revenue-share payout.
- **The chain, all rendered now:**
  - §2א names "עוסק זעיר שסעיף 31(3) לחוק מס ערך מוסף, תשל"ו-1976, חל עליו" (`R-BK:1427`).
  - The law deletes "עוסק זעיר" (`R-VAT:89`), and §31(3) exempts "עסקאות של עוסק פטור" (`R-VAT:484`).
  - The VAT regulations use the same formula for the exempt dealer. Reg 8 inserts a §15א into the instructions "לענין
    מס ערך מוסף" ("8. אחרי סעיף 15 להוראות יבוא לענין מס ערך מוסף:", `R-VATR:374`, under the note "הוספת סעיף 15א
    תק' תשנ"א-1991", `R-VATR:373`), and it reads "15א. (א) עוסק, למעט עוסק שחלות עליו הוראות סעיף 31(3) לחוק, ינהל
    חשבון מס ערך מוסף על עסקאות וחשבון מס ערך מוסף על תשומות, הכל כמפורט להלן, לפי הענין." (`R-VATR:376`). This is
    a section of the instructions, not "reg 15א". It is a different provision from the "תקנה 15א לתקנות מס ערך מוסף
    (רישום)" named in reg 1 (8.1).
  - The wording that §15א replaced in 1991 (the "החלפת תקנה 8" note, `R-VATR:411-415`, hidden history) read "(ב) עוסק
    זעיר פטור מניהול חשבון כאמור." (`R-VATR:423`). [inference] In 1991 the drafter put the §31(3) formula where
    "עוסק זעיר" had stood, which is the same formula §2א uses.
  - The stale label survives in the regulations too: "13. בהוראות, בסעיף 1 לתוספת ג', בהגדרת "עוסק יחיד", אחרי
    "עוסק יחיד" יבוא לענין מס ערך מוסף "עוסק זעיר שהוא - "." (`R-VATR:629`, current text).
- [inference] §2א plausibly governs today's עוסק פטור. No text joins the two words, so this still needs an accountant's
  confirmation. The 1991 substitution above is the closest the texts come, and the question no longer waits on a
  render.

**7.3 Chapter ט' (invoices): §45, §46, §47, and registration**
- Under "פרק ט': חשבוניות" (`R-VAT:654`) and the heading "חובה להוציא חשבונית עסקה" (`R-VAT:655`): "45. עוסק חייב
  להוציא לקונה חשבונית עסקה על כל עסקה או חלק מעסקה גם אם הם פטורים ממס." (`R-VAT:656`). This confirms tick 17's
  VAT:2304 verbatim.
  - [inference] "עוסק" includes the exempt dealer (`R-VAT:87`), and "גם אם הם פטורים ממס" reaches §31(3)
    transactions. On its face §45 binds an exempt dealer to a transaction invoice for every transaction.
- §46: "46. (א) חשבונית תוצא תוך ארבעה עשר יום ממועד החיוב במס." (`R-VAT:659`). For an exempt transaction: "(ב)
  היתה העסקה פטורה ממס, תוצא חשבונית במועד שבו היה צריך להוציאה לפי סעיף קטן (א) אילו היתה חייבת במס."
  (`R-VAT:661`). The time of charge for a service (§§28-29) was not read here.
- Under the heading "זכות להוציא חשבונית מס" (`R-VAT:663`): "47. (א) עוסק מורשה רשאי להוציא לגבי עסקה חייבת במס
  חשבונית מס במקום חשבונית עסקה, וחייב הוא לעשות כן לפי דרישת הקונה." (`R-VAT:664`). This confirms tick 17's
  VAT:2314.
  - A tax invoice shows the tax separately and the buyer's registration number: "(ב) (1) חשבונית מס תכלול פרטים שקבע
    המנהל, ובלבד שיפורטו בה המס בנפרד וכן מספר הרישום של הקונה;" (`R-VAT:712`, which continues with the
    Director's power to allow "כולל מס").
- **Registration.** Every dealer registers: "52. (א) עוסק, מלכ"ר ומוסד כספי חייבים ברישום, במועד ובדרך שנקבעו."
  (`R-VAT:756`). Only a non-exempt one gets the authorised dealer's certificate:
  - "53. (א) עוסק, שאינו עוסק פטור, יקבל עם רישומו לפי סעיף 52 תעודת עוסק מורשה." (`R-VAT:769`)
  - "(ב) מי שאינו עוסק מורשה יקבל עם רישומו אישור על רישומו ועל סיווגו." (`R-VAT:771`)
- **How a small dealer becomes authorised is not plain in the law.**
  - Under the heading "רישום עוסק זעיר כעוסק מורשה" (`R-VAT:782`) the section now reads "57. (בוטל)" (`R-VAT:783`).
  - §58, under "רישום מסוג שונה" (`R-VAT:784`), lets the Director, on request or on his own initiative, register a
    taxpayer "כנמנה עם סוג אחר", on the condition "אם ראה שמהותם קרובה יותר לסוג האחר." (`R-VAT:785`).
  - [inference] The עוסק פטור definition turns on turnover alone (`R-VAT:93`), and the עוסק מורשה definition excludes
    an עוסק פטור (`R-VAT:91`). Read together, the law read here does not show plainly how a dealer under the ceiling
    becomes an עוסק מורשה by choice. §58 reads as reclassification by the nature of the business, not as an election.
    The third limb of the definition (classes the Minister of Finance designates) and the registration regulations
    (URL 1 in section 10) may supply the route. This bears on the "written no" branch of (e)3, which treats VAT
    registration as a cost decision for the owner.
- **No provision read gives an exempt dealer the right to issue a חשבונית מס.** The right in §47(א) is the עוסק
  מורשה's, and that term excludes the עוסק פטור by definition ("ואינו עוסק פטור", `R-VAT:91`). No provision read says
  in terms that an exempt dealer "shall not" issue one. The bar works through §47(א)'s grant and §50(א)'s "אדם שאינו
  רשאי לפי סעיף 47" (7.4).

**7.4 Issuing a tax invoice without the right: the ban and its penalties**
- Civil, §50, under the heading "הוצאת חשבונית מס שלא כדין" (`R-VAT:738`): "50. (א) אדם שאינו רשאי לפי סעיף 47
  להוציא חשבונית מס, והוציא חשבונית מס או הוציא מסמך הנחזה כחשבונית מס אף אם חסרים בו פרטים הנדרשים לענין חשבונית
  מס, יהיה חייב בתשלום כפל המס המצויין בחשבונית או המשתמע ממנה." (`R-VAT:739`).
  - A buyer who deducts input tax from such an invoice may be charged double as well, "אלא אם כן הוכיח להנחת דעתו של
    המנהל כי לא ידע שהחשבונית הוצאה שלא כדין" (§50(א1), `R-VAT:741`).
- Criminal, §117(א): "117. (א) מי שהפר כמפורט להלן הוראה מהוראות חוק זה או התקנות על פיו, דינו – מאסר שנה:"
  (`R-VAT:1531`). The list includes "(5) הוציא חשבונית מס בלי שהיה זכאי לעשות כן או לאחר שנאסר עליו לעשות כן;"
  (`R-VAT:1541`).
- §117(ב)(3) (`R-VAT:1579`) carries five years under the evasion chapeau at `R-VAT:1573` ("במטרה להתחמק או להשתמט
  מתשלום מס"). It covers a tax invoice "או מסמך הנחזה כחשבונית מס" issued "מבלי שעשה או התחייב לעשות עסקה".
  [inference] It is about sham documents, not about who may issue one.
- [inference] §50(א) reaches a "מסמך הנחזה כחשבונית מס" even when particulars are missing. Whether an exempt dealer's
  document headed in English "Tax Invoice" is "הנחזה כחשבונית מס" is a legal question the text does not answer.

**7.5 What the law expects of the buyer, and the power to exempt from invoicing**
- §47א binds a buyer that is itself liable to tax: "47א. קונה שהוא חייב במס, שרכש נכסים או שירותים לצורך עסקו או
  לשימוש בעסקו או לצורך פעילותו, חייב לנהוג כלהלן:" (`R-VAT:720`).
  - The first tier reads "(א) עלה ערך הנכסים או השירותים על 362 שקלים חדשים אך לא הגיע ל-29,112 שקלים חדשים, ידרוש
    ממוכר שהוא עוסק מורשה חשבונית מס או ישלם בהעברה בנקאית, בכרטיס אשראי או בשיק שהוא חתום עליו כמושך ונאמר בו כי
    התשלום הוא למוכר בלבד;" (`R-VAT:722`).
  - The upper tier has the same limit and no payment alternative: "(ב) היה ערך הנכסים או השירותים 29,112 שקלים חדשים
    או יותר, חייב הוא לדרוש ממוכר שהוא עוסק מורשה חשבונית מס" (`R-VAT:724`, which continues).
  - [inference] In both tiers the buyer's duty to demand a tax invoice runs only against a seller "שהוא עוסק מורשה".
    The law itself does not expect a tax invoice from an exempt dealer.
- Input-tax deduction rests on a tax invoice: "38. (א) עוסק זכאי לנכות מהמס שהוא חייב בו את מס התשומות הכלול
  בחשבונית מס שהוצאה לו כדין" (`R-VAT:565`, which continues). The law's wording for a valid tax invoice is "חשבונית מס
  שהוצאה לו כדין" (`R-VAT:565`, `:573`) or "חשבונית מס שהוצאה כדין" (`R-VAT:635`).
  - [inference] An exempt dealer's §31(3) transaction carries no VAT, so the buyer loses no deduction by holding a
    document that is not a tax invoice.
- The power to exempt, in §51 (`R-VAT:746`): "(3) פטורים לעוסקים, לסוג עוסקים או לסוג עסקאות מחובת הוצאת חשבונית,
  והתנאתם בניהול רישומים או בהוצאת מסמכים במקום חשבונית." (`R-VAT:752`). The bookkeeping regulations cite §51 among
  their powers (`R-VATR:104`). Whether any current exemption uses §51(3) for the exempt dealer is the question of 8.3.
- Books: "66. חייב במס ינהל פנקסים ורשומות בצורה ובדרך שקבע שר האוצר, דרך כלל או לסוגי עוסקים או חייבי מס."
  (`R-VAT:845`).
- **Tax invoices and allocation numbers.** This applies only to a registered dealer, so it matters only in (e)3's
  "written no" branch.
  - Deduction is barred on a tax invoice "שסכומה, בלא המס, עולה על 5,000 שקלים חדשים ושאינה כוללת מספר שהקצה לה
    המנהל" (§38(א1), `R-VAT:567`).
  - An authorised dealer "רשאי לבקש מהמנהל להקצות מספר לחשבונית המס", and above that amount "חייב הוא לעשות כן לפי
    דרישת הקונה;" (§47(א2)(1), `R-VAT:668`).
  - The request goes online: "(2) המבקש יגיש את הבקשה כאמור בפסקה (1) באופן מקוון כפי שיורה המנהל;" (`R-VAT:670`).
  - [inference] A registered dealer invoicing Wix for more than ₪5,000 before VAT would make one online request per
    invoice if Wix asks. Whether a runner may file that request without the owner is not in these texts.

**7.6 The VAT law's "secured signature" is narrower than the Electronic Signature Law's. Neither tick 17 nor tick 18
had this.**
- `" חתימה אלקטרונית מאובטחת " – כהגדרתה בחוק חתימה אלקטרונית, התשס"א-2001 (להלן – חוק חתימה אלקטרונית), ובלבד שהונפקה על ידי המדינה או על ידי מי שהמדינה הסמיכה לכך, בהתאם להוראות לפי סעיף 145(א1);`
  (`R-VAT:37`)
- The approved signature is not narrowed: `" חתימה אלקטרונית מאושרת " – כהגדרתה בחוק חתימה אלקטרונית;` (`R-VAT:39`).
- The power behind the proviso: "(א1) שר האוצר ושר המשפטים רשאי לקבוע הוראות לעניין אופן הנפקת חתימה אלקטרונית
  מאובטחת, וכן הוראות לעניין חובותיו של בעל אמצעי החתימה האלקטרונית ואחריותו לשימוש בה;" (`R-VAT:1783`, which
  continues).
- The phrase "חתימה אלקטרונית מאובטחת" occurs twice in `R-VAT`, at `:37` and `:1783`, so the capture does not show
  where the definition bites.
- The bookkeeping instructions define the same words themselves, by the Electronic Signature Law alone and with no
  state-issuance proviso (`R-BK:1221`). They are issued under the Income Tax Ordinance ("בתוקף סמכותי לפי סעיף 130
  לפקודת מס הכנסה, אני מורה לאמור:", `R-BK:1104`), and reg 1 applies them for VAT "בשינויים המחוייבים" (8.1).
- [inference] One reading is that the VAT law's definition governs those words when the instructions are applied for
  VAT. On that reading, a signing key the runner generates for itself is not one "שהונפקה על ידי המדינה או על ידי מי
  שהמדינה הסמיכה לכך", whatever the answer on "sole control" (tick 18 4.3). The other reading is that the instructions'
  own definition governs their own words. Nothing read decides between them: the Interpretation Law is not captured,
  and neither is any provision made under §145(א1). Not decided.

### 8. תקנות מס ערך מוסף (ניהול פנקסי חשבונות), at rendered grade

**8.1 Reg 1 adopts the income-tax instructions for VAT, as in force from time to time. Confirmed, with an exclusion
tick 17 did not quote.**
- The current text: "1. עוסק, למעט עוסק שרישומו לפי תקנה 15א לתקנות מס ערך מוסף (רישום), תשל"ו-1976, חייב לנהל
  לצורך מס ערך מוסף אותם פנקסי חשבונות ותעוד הנילווה אליהם שנדרש לנהל לענין מס הכנסה ויחולו עליו הוראות מס הכנסה
  (ניהול פנקסי חשבונות) (מס' 2), תשל"ג-1973 (להלן - ההוראות), וכן כל הוראה אחרת לפי סעיף 130 לפקודת מס הכנסה,
  כתקפם מעת לעת, בשינויים המחוייבים ובשינויים המפורטים בתקנות אלה." (`R-VATR:106`). The same words recur at
  `R-VATR:115` inside the hidden 1980 note. The line at `:106` is the plain, current one.
- [inference] Because of "כתקפם מעת לעת", everything tick 18 rendered (§2א, §5, §18ב, "מסמך ממוחשב", Appendix ה')
  applies for VAT too, "בשינויים המחוייבים".
- **The name.** Reg 1 says "(מס' 2), תשל"ג-1973". The rendered instructions dropped "(מס' 2)" from their own name in
  2002: `הוראות מס הכנסה (ניהול פנקסי חשבונות) <s>(מס' 2)</s>, תשל&quot;ג-1973` (`R-BKH:1`), under the note "הוראות
  תשס"ג-2002" (`R-BK:1101`). [inference] It is the same instrument. The regulations' own footnote reads "[1] יש לקרוא
  תקנות אלה יחד עם הוראות מס הכנסה (ניהול פנקסי חשבונות) (מס' 2), תשל"ג-1973." (`R-VATR:742`).
- **The exclusion.** A dealer "שרישומו לפי תקנה 15א לתקנות מס ערך מוסף (רישום)" is outside reg 1. It came in 1978:
  under "תק' (מס' 3) תשל"ח-1978" (`R-VATR:108`) the hidden note marks it
  `<u>, למעט עוסק שרישומו לפי תקנה 15א לתקנות מס ערך מוסף (רישום), תשל&quot;ו-1976,</u>` (`R-VATRH:1`). What reg
  15א covers is not on this page (URL 1 in section 10).

**8.2 Reg 2: how the instructions are read for VAT. Three substitutions bear on runner documents.**
- "2. (א) בכל מקום בהוראות -" (`R-VATR:117`):
  - "(1) במקום "נישום" קרי "עוסק";" (`R-VATR:118`)
  - "(2) במקום "נציב" או "פקיד- השומה" קרי "המנהל";" (`R-VATR:119`)
  - "(3) במקום "חשבונית" קרי "חשבונית עסקה"." (`R-VATR:120`)
- Reg 2(ב) carries one thing across between the authorities: "(ב) הקלה שנתן נציב מס הכנסה בהתאם לסעיף 3 להוראות,
  יראו אותה כאילו ניתנה מאת המנהל." (`R-VATR:121`).
- [inference] Four consequences:
  - The instructions' "חשבונית" is, for VAT, the §45 "חשבונית עסקה". §18ב(א) lets a dealer send by computer "(2)
    חשבונית כאמור בסעיף 9(א) למעט חשבונית המשמשת כתעודת משלוח;" (`R-BK:2235`). So a transaction invoice can go by
    the same computerised route as a receipt.
  - §18ב(ב)'s one-time registered-mail notice "לפקיד השומה" (`R-BK:2239`) reads, for VAT, as a notice to "המנהל"
    (the VAT Director).
  - Nothing read says whether one notice serves both authorities. Reg 2(ב) carries an income-tax relief over to VAT
    expressly and says nothing like it for a notice. That silence leans toward a separate notice. At worst it is a
    second one-time registered letter in the step-2 batch, with postage.
  - The same substitution reaches §25(א)'s notice of where the books are kept (tick 18 3.7).

**8.3 §26ד (exemption from the transaction invoice; a receipt on request) is not in force on the live page. This
reverses tick 17 1.3.**
- What tick 17 called "reg 26ד" is a section that reg 12 inserted into the instructions for VAT. **The current text
  of reg 12 is "12. (בוטלה)." (`R-VATR:455`).** The page's table of contents goes from "סעיף 11" (`R-VATR:63`) to
  "סעיף 13" (`R-VATR:71`).
- The history note: "מיום 1.1.1991" (`R-VATR:582`), "תק' תשנ"א-1991" (`:583`), "ק"ת תשנ"א מס' 5321 מיום 13.1.1991
  עמ' 405" (`:584`), "ביטול תקנה 12" (`:585`), "הנוסח הקודם:" (`:586`).
- The revoked regulation opens "12. אחרי סעיף 26 להוראות יבוא לענין מס ערך מוסף:" (`:588`). It inserted a whole
  "פרק ה': הוראות שונות" (`:589`), from §26ב ("עריכת חוזה אינה פוטרת מן החובה להוציא חשבונית", `:596`) through §26ו.
  §26ד is part of it (`:610-614`).
- In the `.html`, all six occurrences of "26ד" and all four of "קבלה במקום חשבונית עסקה" sit in spans styled
  `display:none;background:#FFFF99`, the page's hidden history. An example is
  `FrankRuehl;display:none;background:#FFFF99'>ביטול תקנה 12` (`R-VATRH:1`). The line "12. (בוטלה)." carries no
  such style.
- **The wording tick 17 quoted was a 1976 transitional exemption, and it had been replaced long before 1991.**
  - Under "מיום 18.8.1976" (`R-VATR:461`), the "תק' (מס' 2) תשל"ו-1976" note (`R-VATR:462`) gives: "(1) מי שאין עליו
    לפי ההוראות חובה להוציא חשבונית , למעט עוסק שמערכת חשבונותיו חייבת לפי ההוראות לכלול סרט קופה רושמת ולא עשו כן
    ;" (`R-VATR:466`).
  - That amendment inserted both the proviso and the whole of (ב):
    `(1) מי שאין עליו לפי ההוראות חובה להוציא חשבונית<u>, למעט עוסק שמערכת חשבונותיו חייבת לפי ההוראות לכלול סרט קופה רושמת ולא עשו כן</u>`
    and
    `<u>(ב) הפטור לפי סעיף קטן (א) לא יחול אם ביקש הקונה חשבונית עסקה, ואולם במקרה זה רשאי המוכר לתת לקונה קבלה במקום חשבונית עסקה.</u>`
    (both `R-VATRH:1`).
  - A transitional regulation limited that item in time. Reg 15, before its own revocation in 1991 ("ביטול תקנה 15",
    `R-VATR:698`; "הוראת מעבר", `:700`), read "15. (א) תקפו של פטור לפי סעיף 26ד(א)(1) להוראות הוא עד ליום כ"ג באדר
    ב' תשל"ח (1 באפריל 1978)." (`R-VATR:701`).
  - From 1.8.1979 (`R-VATR:481-483`) the general wording was struck (`R-VATR:486`) and replaced by "(1) עוסק זעיר
    שחייב בניהול פנקסים לפי תוספת י"ג להוראות ואינו חייב בניהול קופה רושמת." (`R-VATR:487`).
  - When reg 12 was revoked, §26ד(א)(1) read "(1) עוסק זעיר שחייב בניהול מערכת חשבונות לפי סעיפים קטנים (ג), (ד),
    (ה),(ו) ו- (ז) לסעיף 2 לתוספת ג' להוראות ואינו חייב בניהול קופה רושמת." (`R-VATR:612`).
  - Its (ב) had not changed: "(ב) הפטור לפי סעיף קטן (א) לא יחול אם ביקש הקונה חשבונית עסקה, ואולם במקרה זה רשאי
    המוכר לתת לקונה קבלה במקום חשבונית עסקה." (`R-VATR:614`).
  - [inference] Even before 1991, the exemption reached only a small dealer keeping books under schedule ג' (the
    retail schedule) §2(ג)-(ז). A service business would not have qualified.
- **A second rule went with reg 12: a receipt deemed a transaction invoice.** The revoked §26ג ("26ג. (א) תעוד כמפורט
  בסעיף קטן (ב) יראו אותו כחשבונית עסקה אם הוא כולל פרטים אלה:", `R-VATR:598`) listed "(4) תלוש מכירה של קופה רושמת,
  הנחשב בחשבונית על פי סעיף 2 לתוספת י"א להוראות או שובר קבלה שהוצא על פי אותו סעיף." (`R-VATR:606`, hidden and
  struck). No live counterpart was found.
- The rendered instructions carry no replacement. "26ד", "פטור מהוצאת חשבונית", "קבלה במקום" and "חשבונית עסקה" each
  occur 0 times in `nevo-books-instructions.txt`.
- [inference] On the two rendered VAT pages and the rendered instructions, no current text exempts an exempt dealer
  from §45's transaction invoice. None lets the dealer give a receipt "in place of" one, and none deems a receipt to be
  one.
- Two places could still hold such a rule:
  - The 1991 gazette that revoked reg 12 (URL 2 in section 10) shows whether the rule moved or was dropped.
  - The general regulations, תקנות מס ערך מוסף, תשל"ו-1976, which the instructions cite ("תקנה 6א לתקנות מס ערך
    מוסף, תשל"ו-1976", `R-BK:1398`), were not captured. No URL for them was found, including in the lawsofisrael
    listing pages 073-075 at `aeca0b25` (github).

**8.4 What the current regulations say about the documents an exempt dealer issues: almost nothing directly**
- Counts in the two captures:
  - "עוסק פטור": 0 in `R-VATR`.
  - "חשבון עסקה": 0 in `R-VATR` and 0 in `R-VAT`.
  - "ממוחשב": 0 in `R-VATR` and 0 in `R-VAT`.
- The exempt dealer appears once, through the §31(3) formula, and only to be excused from VAT accounts. That is §15א(א)
  of the instructions as reg 8 inserts it (`R-VATR:376`, quoted in 7.2).
- **A tax invoice's particulars include the authorised dealer's status.** Reg 7 adds §9א to the instructions ("7. אחרי
  סעיף 9 להוראות יבוא לענין מס ערך מוסף:", `R-VATR:176`): "(1) שם העוסק המורשה, מענו, הכותרת "חשבונית מס", המלים
  "עוסק מורשה", ומספר הרישום במשרד מס ערך מוסף - הכל בדפוס;" (`R-VATR:179`).
- A receipt counts as a tax invoice only on the same terms: "(ב) שובר קבלה שהוצא לגבי עסקה כמפורט בסעיף 29 לחוק,
  ייחשב כחשבונית מס אם כלולים בו הכותרת "חשבונית מס" וכל יתר הפרטים שבתקנת משנה (א)." (`R-VATR:186`).
  - [inference] Neither route is open to an exempt dealer, because the particulars include the words "עוסק מורשה".
  - The rendered instructions treat §9א as live. §18ב(א) lets a dealer send "(4) חשבונית מס, כאמור בתקנה 9א לתקנות מס
    ערך מוסף (ניהול פנקסי חשבונות), התשל"ו-1976 למעט חשבונית המשמשת כתעודת משלוח;" (`R-BK:2237`).
- **What the transaction invoice must carry.** Via reg 2(א)(3), the instructions' §9(א) "חשבונית" is the VAT
  transaction invoice. Its current text (plain in `R-BKH`, no hidden markup):
  - "9 . (א) תעוד פנים שהוא חשבונית ייערך לכל מכירה או מתן שירות בנפרד, או למספר מכירות לאותו לקוח ויכלול –"
    (`R-BK:1745`)
  - Item (1) is the dealer's name, address and ID or VAT number: "(1) שם הנישום ומענו ומספר תעודת הזהות או מספר החברה
    במשרד רשם החברות, או מספר האגודה השיתופית במשרד רשם האגודות השיתופיות, או מספר הרישום כעוסק לצורך מס ערך מוסף,
    לפי חוק מס ערך מוסף, תשל"ו-1975, הכל בדפוס;" (`R-BK:1746`)
  - Items (2)-(9) (`R-BK:1747-1754`) are the date, the delivery note, the customer and a description of the service,
    the unit, quantity, unit price, and "(9) סכום החשבונית." (`R-BK:1754`).
  - The customer item: "(4) שם הלקוח ומענו, להוציא מקרים של מכירות קמעוניות במזומן, אלא אם כן על המכירה חל מס ערך
    מוסף בשיעור אפס או שהמכירה פטורה מהמס האמור; היה מענו של הלקוח ידוע לנישום - אין חובה לציינו;" (`R-BK:1749`).
  - [inference] The list has no title and no signature item. Sent by computer, though, it is a "מסמך ממוחשב" and needs
    the approved or secured signature "של עורך התיעוד" (tick 18 3.5, `R-BK:1207`).
  - The instructions deem one document to be both invoice and receipt only for entertainment and transport tickets
    ("ייחשבו לחשבונית ולשובר קבלה", `R-BK:1756`; "ייחשב לחשבונית ושובר קבלה", `R-BK:1762`). [inference] Whether one
    document may serve both roles for anyone else is not stated.
- **Issuing in the dealer's place.** The one live provision on someone else issuing a VAT document "במקום העוסק" is
  reg 13א ("13 א. בסעיף 2 לתוספת י"ב להוראות, אחרי סעיף קטן (י) יבוא לענין מס ערך מוסף:", `R-VATR:665`). It covers
  an approved agricultural marketer: "(יא) (1) משווק תוצרת חקלאית שמנהל המכס ומע"מ אישר אותו לענין תקנה זו, רשאי,
  בהסכמתו של עוסק המוכר לו תוצרת חקלאית, להוציא במקום העוסק חשבונית מס בשל התוצרת החקלאית שמכר לו;"
  (`R-VATR:666`). Such a marketer is treated "כאילו היה המוכר" (`R-VATR:668`).
  - [inference] This governs a third party issuing a tax invoice in its own right. It is not software issuing the
    dealer's own documents in the dealer's name, so it neither fires nor clears (e)3's REOPEN clause.
- **Computerised documents.** The page has no provision of its own. They come in only through reg 1's adoption of the
  instructions (8.1) and reg 2's substitutions (8.2).
- [inference] **The exempt dealer's documents on the rendered text:**
  - §45's transaction invoice, from the law, in the §9(א) form;
  - the receipt vouchers of §2א and §5, from the instructions via reg 1.
  - Now that §26ד and §26ג are gone, no text read says whether a receipt alone satisfies §45.

**8.5 Currency**
- Every instrument listed after "ק"ת תשנ"א: מס' 5321 מיום 13.1.1991 עמ' 404 – תק' תשנ"א-1991; תחילתן ביום
  1.1.1991 (ת"ט מס' 5331 מיום 7.2.1991 עמ' 518)." (`R-VATR:720`) is a "הודעה": all 20 lines at `R-VATR:721-740`.
- The one current provision labelled with a notice is the amount in §9א(ג)(1). It sits under "הודעה תשפ"ו-2026"
  (`R-VATR:187`) and reads "... אינו עולה על 309 שקלים חדשים כולל מס ערך מוסף; ..." (`R-VATR:188`).
- [inference] The operative text is as amended in 1991, with only index notices since.

### 9. Earlier claims this section supersedes or narrows
Line numbers without a file name are this file's (`research/measurements/osek-patur-documents.md`).
- **Tick 17 1.3** (`:98-102`): reg 26ד(א)(1) and (ב) were quoted as current (VATR:409, :411), with the inference that
  an עוסק פטור "is exempt from the transaction invoice" and "may be given a receipt instead". The live page shows reg
  12, which inserted them, as "(בוטלה)" since 1.1.1991. The quoted (1) was a transitional 1976 item, limited to
  1.4.1978 and replaced in 1979 (8.3).
- **Tick 17 §3, the "Wix" bullet** (`:180`): "or on request a receipt in place of a transaction invoice (VATR:411)". No
  such rule is live (8.3).
- **Tick 18 3.3** (`:290`): "but VAT reg 26ד(ב) (github grade, tick-17 1.3) lets a buyer demand a document." Not live
  (8.3). [inference] Whether a dealer who keeps only the daily takings book must hand each payer a document now turns on
  §45 (7.3), not on §26ד.
- **Tick 17 1.1** (`:61-62`): the §31(3) quote stops at "מכירת מקרקעין", and the live item continues (7.2). The
  deletion of "עוסק זעיר" is confirmed. Its date ("by amendment 24 in 2002") stays github grade.
- **Tick 18 3.1** (`:236-237`) and its row-17 bullet (`:448`): "That link is still github grade". Every textual link is
  now rendered (7.2).
- **Tick 18 §6** (`:429-434`): both URLs are now captured and read here.
- **Ruling (e)3** (`RULING-2026-09-29-loop.md:272`): "An עוסק פטור issues a receipt or a transaction invoice, not a
  חשבונית מס." The words "not a חשבונית מס" now stand on rendered text (7.3, 7.4, 8.4). [inference] "or" may be "and":
  §45 asks for a transaction invoice on every transaction, and no live exemption was found (8.3).

### 10. Next-render URLs

| # | URL | Slug | Where the need appears | What it settles |
|---|---|---|---|---|
| 1 | `https://www.nevo.co.il/law_html/law01/271_004.htm` | `nevo-vat-registration-regs` | `R-VATR:106` (reg 1 excludes a dealer registered under reg 15א), and `R-VAT:91`, `:783`, `:785` (how a dealer under the ceiling becomes authorised). The URL is from the lawsofisrael nevo listing, `2023-03-06/israel/listing/page_074.html:1663` at `aeca0b25` (github). The entry's title is "תקנות מס ערך מוסף (רישום), תשל"ו-1976" (`:1676`). | What reg 15א of תקנות מס ערך מוסף (רישום) covers, and so whether reg 1, and with it §18ב, reaches the owner. Also what an exempt dealer's registration involves, and whether and how a dealer under the ceiling may register as an עוסק מורשה. |
| 2 | `http://www.nevo.co.il/Law_word/law06/TAK-5321.pdf` | `nevo-kt-5321-1991` | `R-VATR:584-585` ("ביטול תקנה 12"). The link itself is in `R-VATRH:1`. | What the 1991 package (pp. 404-406) did with the transaction-invoice exemption, the receipt-on-request rule and the receipt-as-invoice rule (§26ג) when it revoked reg 12: moved them (and where) or dropped them. It is a PDF, and whether the runner stores one usefully is untested. |

### What this adds to FABLE_QUEUE row 17 (a)
- **The REOPEN clause is not fired by these texts.** Nothing in the VAT law or regulations read says the dealer must
  issue or sign in person.
  - §45 obliges "עוסק" to issue, and the instructions still count records made "מטעמו" (`R-BK:1187`).
  - The VAT law expects receipts to be recorded by others for the dealer. If a receipt is not recorded "בידי עובדו של
    העוסק או בידי שלוחו של העוסק שאיננו עובדו", the employee or agent is charged, and the dealer is charged too unless
    he proves "שהוא נקט כל האמצעים הסבירים להבטחת מניעת העבירה" (§117(א1), `R-VAT:1569`). [inference] That allocates
    liability for records made on the dealer's behalf. It does not bar them.
  - Reg 13א (8.4) concerns a third party issuing in its own right and does not bear on software issuing in the
    dealer's name.
- **The document set may grow from one to two.** [inference]
  - With §26ד and §26ג gone, §45 asks the exempt dealer for a transaction invoice on every payout, and §2א and §5 ask
    for a receipt voucher.
  - Both can be sent by computer under §18ב(א)(1)-(2), because reg 2(א)(3) reads the instructions' "חשבונית" as
    "חשבונית עסקה".
  - The invoice's particulars are §9(א)'s (8.4): the name, address and number "הכל בדפוס", date, the customer's name
    and address unless known, a description of the service, and the amount. (e)3 condition 3's list ("the עוסק's name
    and number, a sequential number, date, payer, amount, period") would need the service description and the
    customer's address added. The signature burden is the same as the receipt's on the computerised route.
  - This adds no per-document owner work.
- **A code guard, not owner work.** [inference]
  - A runner document for an exempt dealer must never be titled "חשבונית מס" or carry "עוסק מורשה" (§9א(א)(1)).
  - A title such as "Tax Invoice" risks §50(א)'s "מסמך הנחזה כחשבונית מס" (double the tax shown or implied) and
    §117(א)(5) (one year).
  - A test on the generator's document titles removes this at ₪0 and zero owner minutes, and fits (e)3 condition 3
    ("only what the law requires"). Whether an English heading is "הנחזה" is for a lawyer.
- **A possible second hurdle for a key kept in a GitHub secret.** [inference]
  - If the VAT law's state-issued "חתימה אלקטרונית מאובטחת" (`R-VAT:37`) governs the instructions as applied for VAT,
    a self-generated key fails whatever the "sole control" answer.
  - The instructions carry their own, unnarrowed definition (`R-BK:1221`) and are issued under the Income Tax Ordinance
    (`R-BK:1104`), so that reading is not the text's (7.6).
  - The approved route is not narrowed (`R-VAT:39`), but it needs a certificate naming the holder (tick 18 4.2),
    which tick 17 took to cost money.
  - This may narrow row 17 (a)'s "is there a ₪0 route". It does not close it, and the text does not decide it.
- **Perhaps one more one-time notice.** [inference] Reg 2(א)(2) turns §18ב(ב)'s notice to the assessing officer into a
  notice to "המנהל" for VAT, and reg 2(ב) shows the regulations carry things across expressly when they mean to (8.2).
  That is step-2 paperwork once, with postage, not per payout.
- **Wix.** [inference] throughout. The legal question is not decided here.
  - The text closes one reading. An exempt dealer cannot lawfully issue a "חשבונית מס" (`R-VAT:33`, `:664`, `:91`,
    `:769`), and doing so is penalised (§50(א), §117(א)(5)).
  - What Wix asks for. The agreement is with "Wix.com Ltd. (together with its affiliated companies, “Wix”)"
    (`wix-partner-agreement-body.txt:13`) and "will be governed by the laws of the State of Israel" (`:563`). It asks
    for "a lawful tax invoice to be issued by the Party receiving the respective payment" (`:385`), and `:387`
    repeats it.
  - One reading makes the clause unmeetable. "lawful tax invoice" is close to the law's own "חשבונית מס שהוצאה לו
    כדין" (`R-VAT:565`), the document on which a buyer's input-tax deduction rests. On that reading Wix means a חשבונית
    מס, which an exempt dealer cannot give short of VAT registration.
  - The other reading makes it a naming question. In the law, "חשבונית" covers both kinds (`R-VAT:31`). §47א asks a
    buyer to demand a tax invoice only from a seller "שהוא עוסק מורשה" (`R-VAT:722`, `:724`). In the first tier the
    buyer may instead pay by bank transfer, card or a restricted cheque (`R-VAT:722`), and Wix pays "through wire
    transfer or any other method chosen by Wix" (`:385`). On that reading the lawful document an exempt dealer can
    give is the §45 transaction invoice.
  - **The texts do not decide between the two.** The only lawful document an exempt dealer can issue is not a tax
    invoice. Whether that meets Wix's clause turns on Wix's reading, which only Wix's written answer settles. That is
    what the held question does. A written no leads to (e)3's existing branch, where VAT registration is a cost
    decision for the owner.
  - That branch carries two unknowns the text raises (7.3, 7.5):
    - how a dealer under the ceiling registers as authorised (URL 1);
    - an online allocation-number request per tax invoice above ₪5,000 before VAT, on Wix's demand, which a runner
      may or may not be able to file.
  - The held question (`research/owner-asks/questions.json:43`) asks about "a receipt ... in place of a tax invoice".
    With §26ד gone, the lawful counterpart on this text is the §45 transaction invoice, with the receipt. Whether to
    reword it is the board's call.
  - Suppose schedule י"א governs instead of §2א. Its tier (ג) already asks for an invoice for a service of ₪210 or
    more (`R-BK:9554`), which reads as "חשבונית עסקה" for VAT. Every Wix payout is at least USD 200
    (`wix-partner-agreement-body.txt:381`). So under either regime a Wix payout would carry a transaction invoice,
    treating the payout as consideration for a service to Wix. That characterisation is itself an inference.

### Side finding (outside rows 178-179)
- The live consolidation (13-07-2026) prints "122,833" in the עוסק פטור definition (`R-VAT:93`). The amount changes
  each 1 January (§126(א), `R-VAT:1637`). [inference] A figure current on 13.7.2026 is therefore the 2026 figure.
- `research/tiktok/08-reads/hebrew-israel.md:365` lists "Cap is 122,833 ₪ for 2026" as "Not settled". That row is
  about the income-tax עסק זעיר track.
- The track's cap is a statutory reference to this VAT amount: 87ב as read at
  `research/tiktok/08-reads/tt2-render-check.md:99`, "אינו עולה על הסכום הקבוע בהגדרה 'עוסק פטור' שבסעיף 1 לחוק מס
  ערך מוסף".
- `research/tiktok/08-reads/tt2-render-check.md:154-155` asks for the 2026 figure "as a sourced config value with
  `checkedOn`".
- [inference] This capture is such a source: nevo's consolidation as of 13-07-2026, not the gazette notice, which the
  page does not show because it carries no history.

### What this settles for FABLE_QUEUE row 17
- (e)3's REOPEN clause is not fired by the VAT law or regs. No text read requires the dealer to issue or sign each document in person, and the instructions still count records made "מטעמו" (R-BK:1187). §117(א1) (nevo-vat-law.txt:1569) allocates liability for receipts recorded by the dealer's employee or agent rather than barring such recording.
- Drop tick 17's receipt-on-request premise. §26ד was revoked with reg 12 from 1.1.1991 (nevo-vat-bookkeeping-regs.txt:455, :582-586), so row 17's Wix reasoning cannot rest on VATR:411. The quoted item was in any case a 1976 transitional exemption limited to 1.4.1978 (:698-701) and replaced in 1979 (:481-487).
- [inference] A payout may need two runner documents: a §45 transaction invoice (nevo-vat-law.txt:656) in the §9(א) form (R-BK:1745-1754), and a §2א/§5 receipt. Both fit the §18ב(א)(1)-(2) computerised route via reg 2(א)(3) (regs.txt:120; R-BK:2235), so no per-document owner work is added. (e)3 condition 3's field list would need the service description and the customer's address added.
- [inference] New ₪0 code guard: an exempt dealer's runner document must never be titled חשבונית מס or Tax Invoice, nor carry "עוסק מורשה" (regs.txt:179). The exposure is §50(א) double tax on a "מסמך הנחזה כחשבונית מס" (vat-law.txt:739) and §117(א)(5), one year (:1541). This is a test on the generator, and it fits (e)3 condition 3.
- [inference] A possible second hurdle for the GitHub-secret key, not decided. The VAT law defines a secured signature as state-issued or state-authorised (vat-law.txt:37). The instructions carry their own unnarrowed definition (R-BK:1221) and are issued under Ordinance §130 (R-BK:1104), so the narrower one governs only on one reading. The approved route is not narrowed (:39) but needs a certificate.
- [inference] Reg 2(א)(2) (regs.txt:119) may make §18ב(ב)'s registered-mail notice also a notice to the VAT Director. Reg 2(ב) (:121) carries only reliefs across expressly. At most one more one-time letter in the step-2 batch, with postage.
- [inference] Wix: an exempt dealer cannot lawfully issue a חשבונית מס. Whether Wix's 'lawful tax invoice' requires one is not settled by text: 'חשבונית מס שהוצאה לו כדין' (vat-law.txt:565) tilts one way, and §1's 'חשבונית' plus §47א (:722, :724) the other. The held question at research/owner-asks/questions.json:43 remains the instrument, and the board may reword it around a §45 transaction invoice.
- [inference] The written-no branch (VAT registration as a cost decision) has two textual unknowns. The law read does not show plainly how a dealer under the ceiling becomes authorised: §57 is repealed, §58 is reclassification by nature, and the definitions at :91 and :93 exclude an עוסק פטור (vat-law.txt:782-785). And each tax invoice above ₪5,000 needs an online allocation number on Wix's demand (:567, :668, :670), a per-invoice act a runner may or may not be able to file.
- Still open: what reg 15א of the VAT registration regs covers (it excludes some dealers from reg 1) and how a small dealer registers as authorised; what the 1991 gazette did with §26ד and §26ג; the general VAT regs (no URL found). The first two are queued as next-render URLs.

---

## 29.9 (tick 20, rendered)

ZERO-TESTS row 187 (captured 29.9 ~13:02 UTC by render-watch). Read by an Opus reader, checked by an adversarial verifier.

### 29.9 (tick 20, rendered): תקנות מס ערך מוסף (רישום) (ZERO-TESTS row 187)

**Read by:** a tick-20 reader, from the render-watch capture of ZERO-TESTS row 187, checked by an adversarial verifier. Where cited, it also uses the tick-19 captures `R-VAT` (`nevo-vat-law.txt`), `R-VATR` (`nevo-vat-bookkeeping-regs.txt`) and `R-VATRH`, and the tick-18 capture `R-BK` (`nevo-books-instructions.txt`). Every quote was checked by exact substring match (`grep -n -F`) against the capture at the cited line before it was written here. A bare "`:NNN`" continues the file named last in the same bullet or table cell. In section 12, a bare "`:NNN`" is this file.

| Short name | Capture (under `research/rendered/`) | fetchedAt (UTC) | sha256 (first 12) | Currency |
|---|---|---|---|---|
| `R-REG` | `nevo-vat-registration-regs.txt` (236 lines) | 2026-09-29 13:02:22 | `415d519ef5b6` | "נוסח עדכני נכון ליום: 10-12-2024" (`R-REG:3`) |
| `R-REGH` | `nevo-vat-registration-regs.html` (the same page, 27,946 bytes, 70 lines) | same | same | Current text only: 0 matches each for `display:none`, `FFFF99`, `<s>`, `<u>` and `href`. |

The meta file reads `status` 200, `error` null, `truncated` false and `firstFetch` true.

**How the current text was told apart from history.** It did not need to be. The page uses `R-VAT`'s layout (`id_` blocks under `<h6>` headings, no `href`, no `display:none`), which prints only the current text: no amendment notes and no list of instruments. "ק"ת", "תחילתן", "תיקון" and "בוטל" each occur 0 times in `R-REG`. Nothing on the page dates a provision.

### 11. תקנות מס ערך מוסף (רישום) (consolidated 10-12-2024), at rendered grade

**11.1 Reg 15א registers a one-off seller. It does not reach the owner, so VAT bookkeeping reg 1 does, and §18ב with it.**
- The heading is "רישום עוסק בעסקת אקראי" (`R-REG:175`). The rule itself: "15א. (א) רישומו של מי שעשה עסקת אקראי ואינו חייב להירשם על פי סעיף 52 לחוק לענין עסקאותיו במהלך עסקו, יהא בהודעה למנהל בטופס שקבע המנהל, שבה יפרט את טיב עסקת האקראי, מועד עשייתה, מחירה" (`R-REG:176`, which continues with the expected price).
- The notice is due "(ב) הודעה לפי תקנת משנה (א) יש להגיש עד ה-15 לחודש שלאחר החודש שבו היתה תחילת עסקת האקראי." (`R-REG:178`).
- Below a threshold, registration is needed only once the year's occasional deals together reach it (`R-REG:180`). The threshold is "" הסכום הקובע " – סכום מחזור העסקאות של עוסק זעיר לענין סעיף 31(3) לחוק." (`R-REG:180`).
- One notice with an undertaking to report covers later occasional deals in the same tax year (`R-REG:182`). Services in the professions of reg 6א(א)(2) of the general regulations get neither relief (`R-REG:184`).
- The law's terms behind the rule:
  - "עוסק" includes "וכן מי שעושה עסקת אקראי;" (`R-VAT:87`).
  - "עסקת אקראי" is first "(1) מכירת טובין או מתן שירות באקראי, כשהמכירה או השירות הם בעלי אופי מסחרי;" (`R-VAT:105`).
  - A running business registers under §52: "52. (א) עוסק, מלכ"ר ומוסד כספי חייבים ברישום, במועד ובדרך שנקבעו." (`R-VAT:756`).
- **The owner is not a 15א registrant.** [inference]
  - The colony sells repeatedly and by design: storefronts, app listings and platform payouts. That is "עסקאותיו במהלך עסקו", not a sale "באקראי".
  - Step 2 opens an ordinary file and chooses עוסק פטור (`docs/OWNER_STEPS.he.md:146`). That is registration under reg 2, not a 15א notice.
- **Foreign payers do not change this on the text.**
  - The regulations' "חייב במס" includes a dealer "אף אם הוא פטור מתשלום המס או אם כל עסקאותיו פטורות ממס" (`R-REG:8`). It excludes only four cases:
    - all transactions exempt under §31(1) or §31(2) (`R-REG:10`);
    - a seller whose tax on all transactions the service recipient pays under reg 6א of the general regulations (`R-REG:12`);
    - certain land sellers (`R-REG:14`);
    - a household solar or wind producer (`R-REG:16`).
  - §31(3) is not among them. [inference] No text read makes a foreign platform that pays an Israeli seller a reg 6א recipient. Reg 6א itself is not captured. The general regulations now have a URL at github grade (section 13, URL 5).
  - Reg 6's "עוסק זר" is a foreign business active in Israel: "חייב במס שעיקר עסקיו או פעילותו מחוץ לישראל ויש לו פעילות או עסקים גם בישראל (להלן – עוסק זר)" (`R-REG:72`). It is not an Israeli seller paid from abroad.
- **So reg 1 reaches the owner.** Reg 1 excepts only "עוסק שרישומו לפי תקנה 15א לתקנות מס ערך מוסף (רישום), תשל"ו-1976" (`R-VATR:106`).
  - [inference] An owner registered under reg 2 must keep for VAT the books the income-tax instructions require, "כתקפם מעת לעת". §18ב's computerised route and its conditions come with them, read through reg 2(א)(3) (tick 19, 8.1-8.2).
  - [inference] The exception fits its purpose: a one-off seller registered by notice is not expected to keep a full set of books.
- **Two provisions share the label "15א".** Reg 15א of these regulations is the occasional-deal rule above. §15א of the instructions, which bookkeeping reg 8 inserts, excuses the §31(3) dealer from VAT accounts (`R-VATR:376`, tick 19 7.2). Reg 1 names only the first.

**11.2 Registration: who files, how, and when**
- "2. (א) חייב במס יירשם על ידי מילוי כל הפרטים בטופס רישום שקבע המנהל וימציאו –" (`R-REG:41`).
- How a dealer delivers the form: "(1) אם הוא עוסק – ביד אישית, או באמצעות רואה חשבון, עורך דין, יועץ מס, פקיד ברית הפיקוח כאמור בסעיף 72 לחוק, או מנהל חשבונות שלו ואם הוא מלכ"ר או מוסד כספי – ביד או בדואר רשום לאותו משרד מס ערך מוסף מהמפורטים בתוספת, שהוא הקרוב ביותר למקום עסקו;" (`R-REG:43`). Registered post is given to a non-profit or a financial institution only.
- When: "(2) חייב במס ימציא למנהל טופס כאמור בתקנה זו לא יאוחר מהיום שבו החל בעסקיו או בפעולותיו." (`R-REG:45`).
- Registering before trading starts:
  - The law allows it for a person who proves he is setting up a business: "(ב) אדם שהוכיח, להנחת דעתו של המנהל, שהוא מקים עסק, רשאי להירשם כעוסק ומשנרשם דינו לכל דבר וענין כדין עוסק." (`R-VAT:758`).
  - Reg 3 asks for a form that states the bookkeeping type and the expected start date: "3. המבקש להירשם כעוסק לפי סעיף 52(ב) לחוק, בטרם החל למכור נכסים או לתת שירותים במהלך עסקיו, יגיש בקשה לפי טופס שקבע המנהל" (`R-REG:52`, which continues).
- What the form asks a dealer: "ולענין רישום עוסק – גם פרטים אלה: סוג העסק, מחזור העסקאות השנתי של העסק, מספר המועסקים בעסק ומספר תיק הניכויים באגף מס הכנסה." (`R-REG:47`).
- How turnover is counted when the past year's figure is unknown:
  - Reg 14(א), a business that operated for only part of the past year: the monthly average over its period of activity times twelve (`R-REG:168`).
  - Reg 14(ב), unknown "מסיבה שונה": the month before registration times twelve, "ואם טרם החל בעסקיו או פעל פחות מחודש קודם הרישום – על פי הסכום המשוער בשנת המס הבאה כאילו יפעל בכל אותה שנה." (`R-REG:170`).
  - [inference] A new dealer's class follows the annual turnover stated or estimated on the form, subject to reg 13 (11.3). The text gives the dealer no box to choose a class; step 2's "בחר **עוסק פטור**" (`docs/OWNER_STEPS.he.md:146`) describes a form field, not a legal election.
- After filing:
  - "7. (א) אדם שבידיו תעודת רישום או מסמך אחר מאת המנהל המאשר דבר רישומו, יראוהו כמי שלכאורה רשום כדין." (`R-REG:87`).
  - If no certificate arrives within thirty days, the dealer writes to the Director by registered letter (reg 7(ב), `R-REG:89`).
  - The law gives a dealer who is not authorised "אישור על רישומו ועל סיווגו" (§53(ב), `R-VAT:771`).
- **Provisional registration by the Director.** Missed by the reader: "(ג) מי שרשם אותו המנהל לפי סעיף 54 לחוק, לא ינכה מס תשומות ולא יוציא חשבוניות מס כל עוד לא נרשם מיזמתו." (`R-REG:91`). §54 lets the Director register provisionally one who "חייב ברישום ולא נרשם" (`R-VAT:774`). [inference] This does not bear on an owner who registers at step 2. It confirms that the "never חשבונית מס" guard (tick 19) also holds while any registration is not the dealer's own.
- **The text has no electronic channel.** "מקוון", "אלקטרוני" and "אינטרנט" each occur 0 times in `R-REG`.
  - [inference] The 10-12-2024 text provides only delivery by hand or through a listed professional. Step 2 says "אונליין" (`docs/OWNER_STEPS.he.md:130`).
  - The page does not contradict that word. "ביד אישית" says who delivers, and an online service could exist outside these regulations. But no rendered page shows one, so "אונליין" stays unverified.
- **One registration for every line.**
  - The law: "55. אדם שיש לו כמה עסקים או שבעסקו כמה יחידות עסק, יירשם כעוסק אחד לגבי כולם" (`R-VAT:777`, which continues).
  - A business unit may register separately only if "(2) ברישומו בנפרד כאמור לא יהפוך לגביהם לעוסק הפטור ממס." (reg 9(א)(2), `R-REG:107`).
  - [inference] Every colony income line counts toward one ceiling. The definition already says so with "בכל עסקיו" (`R-VAT:93`).

**11.3 Becoming an עוסק מורשה below the ceiling: the text gives no election, and §58 is a weak route**
- **Reg 11, the old voluntary route, names the exempt dealer as excluded.** Under the heading "רישום עוסק זעיר כעוסק מורשה" (`R-REG:122`): "11. (א) עוסק זעיר, למעט עוסק הפטור ממס על פי סעיף 31(3) לחוק, רשאי להירשם כעוסק מורשה אם הוכיח להנחת דעתו של המנהל שהוא מנהל מערכת חשבונות שחייב בה עוסק מורשה בהתאם לתקנות מס ערך מוסף (ניהול פנקסי חשבונות), התשל"ו-1976." (`R-REG:123`). The request goes on the Director's form (`R-REG:125`).
  - [inference] Three things stand against it for the owner:
    - Its words exclude the dealer §31(3) exempts, which is the owner.
    - Its class, "עוסק זעיר", has been deleted from the law (`R-VAT:89`), so the category it opens has no counterpart today.
    - It sits under the heading of the repealed §57 ("רישום עוסק זעיר כעוסק מורשה", `R-VAT:782`; "57. (בוטל)", `R-VAT:783`), and the preamble lists §57 among its powers ("בתוקף סמכותי לפי סעיפים 1, 52, 55, 56, 57, 65, 118 ו-145 לחוק מס ערך מוסף", `R-REG:5`). Whether a regulation survives the repeal of its enabling section is a question for the Interpretation Law, which is not captured.
  - Either way, reg 11 gives the owner no route.
- **Reg 12 is the only procedure by request: a reasoned request under §58.** Under the heading "רישום בסוג שונה" (`R-REG:127`):
  - "12. (א) חייב במס המבקש להירשם על פי סעיף 58 לחוק בסוג חייבי מס שונה, יגיש למנהל בקשה בכתב תוך ציון נימוקים." (`R-REG:128`)
  - "(ב) עד להחלטת המנהל יירשם המבקש כאמור בתקנת משנה (א) לפי סוג חייבי מס שנקבע לו לפי החוק." (`R-REG:130`)
  - §58 lets the Director reclassify "אם ראה שמהותם קרובה יותר לסוג האחר" (`R-VAT:785`).
  - A §58 classification takes effect "כעבור שלושים יום לאחר החודש שבו ניתנה ההודעה לפי סעיף 64, או במועד אחר שקבע המנהל" (§63, `R-VAT:831`).
  - Anyone who considers himself harmed may appeal "תוך שלושים יום לאחר שהומצאה לו ההודעה, לערער לפני בית המשפט המחוזי" (§64, `R-VAT:834`).
- **On the text, even a granted §58 request may not make a dealer under the ceiling authorised.** [inference] throughout:
  - The definition names §58 registrants only with a qualifier: "עוסק שנרשם לפי סעיף 52 או לפי סעיף 58 ואינו עוסק פטור" (`R-VAT:91`). "עוסק פטור" turns on turnover alone (`R-VAT:93`), and a §58 grant does not change turnover. Tick 19 read `:91` the same way ("the עוסק מורשה definition excludes an עוסק פטור", `osek-patur-documents.md:543-544`).
  - The authorised dealer's certificate goes to "53. (א) עוסק, שאינו עוסק פטור" (`R-VAT:769`).
  - §58 moves "מי שנמנה עם סוג פלוני של חייבי מס" to "סוג אחר" (`R-VAT:785`), and reg 12 speaks of "סוג חייבי מס שונה" (`R-REG:128`). The law defines "" חייב במס " – עוסק, מלכ"ר, או מוסד כספי;" (`R-VAT:29`). Read against that definition, the classes §58 moves between may be these three kinds, not exempt and authorised dealers. The law does speak of "סוגי עוסקים" elsewhere (§66, `R-VAT:845`), so the text does not settle it.
  - Tick 19 already read §58 "as reclassification by the nature of the business, not as an election" (`osek-patur-documents.md:545`). The registration regulations add the procedure, not a right.
  - Whether VAT offices in practice register a dealer under the ceiling as authorised on request is not shown by any rendered page.
- **Reg 13 is a mandatory class, not a choice.** Under the heading "רישום כעוסק מורשה" (`R-REG:132`): "13. עוסק הנמנה על אחת מהקבוצות המנויות להלן ירשום אותו המנהל כעוסק מורשה גם אם על פי סכום מחזור עסקותיו או מספר המועסקים בעסק הוא היה נחשב כעוסק זעיר:" (`R-REG:133`).
  - Item (1): "(1) בעל מקצוע חפשי שהוא: אגרונום, אדריכל, הנדסאי, חוקר פרטי, טוען רבני, טכנאי, טכנאי שיניים, יועץ לארגון, יועץ לניהול, יועץ מדעי, יועץ מס, כלכלן, מהנדס, מודד, מנהל חשבונות, מתורגמן, סוכן ביטוח, עורך דין, רואה חשבון או שמאי, בעל מעבדה כימית או רפואית וכן עוסקים שעיסוקם מתן שירותים מהסוגים המפורטים בתקנה 6א לתקנות מס ערך מוסף, תשל"ו- 1976, ולגבי אותם שירותים בלבד;" (`R-REG:135`).
  - Items (2)-(6) and (8) cover doctors and other health professions, driving schools, schools (including vocational or practical instruction to groups of at least five, `R-REG:141`), real-estate and vehicle dealers and brokers, and cooperative societies (`R-REG:137-165`).
  - Item (7) is "(7) חברה הרשומה כדין לפי פקודת החברות;" (`R-REG:163`).
  - [inference] Reg 13 is the definition's third limb: "וכן מי שנמנה עם סוג עוסקים שלגביהם קבע שר האוצר שיירשמו כעוסקים מורשים;" (`R-VAT:91`). The preamble lists §1 among the regulations' powers (`R-REG:5`). Joined by "וכן", this limb stands outside the "ואינו עוסק פטור" qualifier.
  - §59(א)'s proviso keeps such a dealer authorised at low turnover: "הוראה זו לא תחול על מי שנקבע לגביו שיהיה עוסק מורשה אף אם מחזור העסקאות שלו נמוך מהסכום האמור." (`R-VAT:788`).
  - [inference] Tick 19 7.3 said "The עוסק פטור definition turns on turnover alone" (`osek-patur-documents.md:543`). That holds for the definition. What reg 13 shows is that authorised status does not turn on turnover alone: for its classes, occupation or legal form decides. A reg-13 dealer under the ceiling also meets the עוסק פטור definition's words; the pages read do not say how §31(3) then applies, though §59(א)'s proviso shows the law expects such a dealer to be authorised.
- **The ways out of authorised status are not ways in.**
  - An authorised dealer below the amount for two years in a row is re-registered as exempt (§59(א), `R-VAT:788`).
  - In the first year: "(ב) עוסק מורשה שמחזור העסקאות שלו בשנה הראשונה לפעילותו נמוך מהסכום המחייב רישום כעוסק מורשה, רשאי המנהל, מיזמתו, לרשום אותו כעוסק פטור." (`R-VAT:790`).
- **Summary.** [inference] On the texts read:
  - The only route that plainly makes a dealer under the ceiling authorised is reg 13, the third limb. Of its classes, only item (7), incorporating, is one a person can choose to join.
  - A reasoned §58 request (reg 12) is discretionary, and its footing is doubtful twice over: §58 may concern the three kinds of taxpayer, and the definition qualifies a §58 registrant with "ואינו עוסק פטור".
  - Reg 11, the old voluntary route, excludes the §31(3) dealer by name.

**11.4 What an exempt dealer must file or notify under these regulations**
- **The annual turnover declaration.** Under the heading "הצהרה על מחזור עסקאות" (`R-REG:172`): "15. עוסק הפטור מתשלום המס לפי סעיף 31(3) לחוק למעט עוסק כאמור בתקנה 1(4) יצהיר עד 31 בינואר בכל שנה על מחזור עסקאותיו בשנה שחלפה לפי טופס שקבע המנהל." (`R-REG:173`). It is the only filing these regulations place on the exempt dealer as such.
- **Where it goes.** "16. בקשות או הודעות על פי תקנות 3, 6, 7, 8, 9, 10, 11, 12, 15 ו-15א, יוגשו למשרד מס ערך מוסף כמפורט בתוספת אשר באזור פעולותיו מנהל החייב במס את עסקיו" (`R-REG:194`). The schedule lists seventeen offices by address (`R-REG:204-236`).
- **Changes: written notice within fifteen days.**
  - "8. (א) הופסקו כליל העסקים או הפעילות של החייב במס או הופסקו לתקופה העולה על תקופת דו"ח אחת, או חלו אירועים המצריכים שינוי ברישום או ביטולו, כגון שינוי מען העסק" (`R-REG:96`).
  - The same sentence goes on through partners and legal status to "שינוי בענף הכלכלי שאליו משתייך העסק, יודיע על כך החייב במס בכתב למנהל תוך חמישה-עשר יום מהיום שבו חל האירוע." (`R-REG:96`).
  - [inference] A change of address qualifies. So might a new colony line that moves the business into another economic branch. The text does not say whether one does, for example video ad revenue beside software licences.
- **The certificate.**
  - If none arrives within thirty days, a registered letter to the Director (reg 7(ב), `R-REG:89`).
  - If it is lost: "(ד) אבדה תעודת הרישום או המסמך האחר, יודיע על כך החייב במס מיד בכתב למנהל." (`R-REG:93`).
- **Offences.**
  - "17. הפרת הוראה מהוראות תקנות 2, 4, 6, 7, 8, 15 ו-15א שלא נקבעה בחוק כעבירה, נקבעת כעבירה." (`R-REG:197`). Reg 17 reaches only a breach the law does not already make an offence.
  - The law already makes some of these offences. §117(א), "דינו – מאסר שנה" (`R-VAT:1531`), covers "(4) לא עשה את המוטל עליו לענין רישומו;" (`R-VAT:1539`) and "(6) לא הגיש במועד דו"ח שיש להגישו לפי חוק זה או תקנות לפיו" (`R-VAT:1543`).
  - §118 is the residual penalty for breaching a regulation that says so: "דינו – מאסר שלושה חדשים או קנס 5,000 לירות." (`R-VAT:1609`).
  - [inference] Late registration, and probably a reg 8 change "המצריכ[ה] שינוי ברישום", fall under §117(א)(4), up to a year, not under reg 17 and §118. A missed 31 January declaration falls under §117(א)(6) if the declaration is a "דו"ח", which the text does not say. Otherwise reg 17 makes it an offence and §118 applies, with a fine printed in pre-1980 lirot whose current value is not on the page (section 13, URL 4).
- **Periodic reports are not in these regulations.**
  - §67(א): "חייב במס יגיש למנהל בדרך שקבע שר האוצר דו"ח לכל תקופה שקבע שר האוצר כתקופת דו"ח לחייבי מס דרך כלל או לסוגים" (`R-VAT:848`).
  - §67(א2)(1) sets two months for a dealer up to 1,775,000 שקלים, "אלא אם כן קבע שר האוצר לפי סעיף קטן (א) תקופת דיווח ארוכה יותר" (`R-VAT:852`).
  - §67(ב) makes the report due "תוך חמישה עשר יום לאחר תקופת הדו"ח שבו, אף אם לא היו באותה תקופה עסקים או פעילות המחייבים בתשלום מס" (`R-VAT:856`).
  - §67(ד) lets the Minister exempt "סוגי עוסקים שכל עסקם בעסקאות פטורות ממס או בעסקאות החייבות במס בשיעור אפס" (`R-VAT:862`).
  - [inference] On the law alone, an exempt dealer, who is a "חייב במס" in these regulations too (`R-REG:8`), would report every two months unless the Minister set a longer period or exempted the class. The §31(3) dealer's transactions are exempt, so the class fits §67(ד). Whatever does it sits in an instrument that is not captured, probably the general regulations.
  - The general regulations do have a URL, at github grade. In the lawsofisrael nevo listing at `aeca0b25`, `2023-03-06/israel/listing/page_028.html:921` links `https://www.nevo.co.il/law_html/law01/271_005.htm`, and the entry's title is "תקנות מס ערך מוסף, תשל"ו-1976" (`:934`). The reader searched only pages 072-076, whose eleven "מס ערך מוסף" titles are all on page 074 (section 13, URL 5).
  - So step 2's "דיווח **פעם בשנה**" (`docs/OWNER_STEPS.he.md:156`) is rendered only for the annual declaration (`R-REG:173`). That the exempt dealer files no periodic reports is not rendered anywhere.
- **The wording is stale.**
  - "עוסק פטור" occurs 0 times in `R-REG`. The exempt dealer appears as "עוסק הפטור ממס" with no section cited at `R-REG:107`, as "עוסק הפטור ממס על פי סעיף 31(3) לחוק" at `:123`, as "עוסק הפטור מתשלום המס לפי סעיף 31(3) לחוק" at `:173`, and through "עוסק זעיר לענין סעיף 31(3)" at `:180`.
  - "עוסק זעיר" appears at `R-REG:122`, `:123`, `:133` and `:180`.
  - [inference] Like bookkeeping reg 13 (`R-VATR:629`), these regulations were not reworded when the law deleted the term.

**11.5 Currency**
- The stamp reads "נוסח עדכני נכון ליום: 10-12-2024" (`R-REG:3`, `R-REGH:1`). That is about nineteen months older than `R-VAT`'s 13-07-2026.
  - [inference] An amendment after 10.12.2024 would not appear on this page, and nothing on the page says whether there was one.
- The page has no instrument list and no marked history, so no provision on it can be dated.
- Its only threshold amount is reg 1(4)'s "20,100 שקלים חדשים" (`R-REG:16`), for household solar or wind producers.
  - The amount is indexed every 1 January against 2009 (reg 15ב, `R-REG:187`): "(ג) המנהל יפרסם ברשומות את הסכום שהתעדכן לפי תקנה זאת." (`R-REG:191`).
  - It does not bear on the owner.
- [inference; weak] The page's 71 block ids are 24-hex strings.
  - Read as ObjectId timestamps, they run from 2.1.2024 to 10.12.2024; 40 of the 71 date 2.1.2024. The latest is reg 1(4)'s indexed item, on the stamp's own date.
  - Late-2024 ids also sit on provisions the page gives no reason to date to 2024, such as reg 5א (2.12.2024) and the schedule's first address (3.12.2024).
  - So the ids more likely record the publisher's editing than amendment dates. They agree with the stamp and date nothing.

### 12. Earlier claims this section answers, narrows or leaves open
Line numbers without a file name are this file's (`research/measurements/osek-patur-documents.md`).
- **Tick 19 8.1** (`:635-636`) said "What reg 15א covers is not on this page". This section answers it: reg 15א is registration for an occasional deal (11.1), and it does not reach the owner.
- **Tick 19 7.3** (`:543-548`) said "The third limb of the definition (classes the Minister of Finance designates) and the registration regulations" (`:546`) "may supply the route" (`:547`). Answered:
  - The third limb is, on inference, reg 13, a mandatory class.
  - Reg 12 is §58's procedure, not a right, and §58's reach to a dealer under the ceiling is doubtful on the text (11.3).
  - Reg 11 excludes the §31(3) dealer (11.3).
  - The same bullet's "turns on turnover alone" (`:543`) holds for the עוסק פטור definition. Reg 13 shows that authorised status does not turn on turnover alone. The bullet's reading of `R-VAT:91` (`:543-544`) stands and now bears on §58 too.
- **Tick 19's row-17 bullets** (`:841`, `:873-874`) are answered here: "how a dealer under the ceiling registers as authorised (URL 1)" and "Still open: what reg 15א ... covers". The 1991 gazette (`:782`) stays open. The general regulations stay uncaptured but now have a URL (section 13, URL 5), against `:874`'s "(no URL found)".
- **Tick 19 §10 row 1** (`:781`) is now captured and read here.
- **Ruling (e)3** says "A written no makes Wix's payout depend on VAT registration, which is a cost decision for the owner" (`RULING-2026-09-29-loop.md:275`). The held question's `when` says "a written no makes Wix's payout depend on VAT registration, a cost decision for the owner" (`research/owner-asks/questions.json:45`).
  - [inference] On the text, the owner cannot simply choose to register as authorised below the ceiling.
  - A written no leads to incorporating (reg 13(7), not ₪0), a §58 request that is a long shot on the text, or Wix out.
  - The wording is the board's call.
- **Step 2:**
  - "אונליין" (`docs/OWNER_STEPS.he.md:130`) is not in the 10-12-2024 text of reg 2 and stays unverified (11.2).
  - "דיווח **פעם בשנה**" (`docs/OWNER_STEPS.he.md:156`) is rendered only for the annual declaration (11.4).

### 13. Next-render URLs

| # | URL | Slug (proposed) | Where it appears | What it settles |
|---|---|---|---|---|
| 1 | `https://www.gov.il/he/service/opening-a-file-vat` | `gov-il-opening-a-file-vat` | `research/colony-sweep/scouts/payment-rails--israeli-tax-registration.md:13`, `:74`; `research/colony-sweep/scouts/risk-governance--owner-kyc-catalogue.md:57` | Whether reg 2's "טופס רישום שקבע המנהל" is filed online today (step 2's "אונליין"). Whether the service lets a dealer under the ceiling ask for authorised status. **Likely [BLOCKED]:** three gov.il `/he/service/` and `/he/pages/` paths returned 403 to the runner (`tt-src-gov-il-he-service-report-and-payment-for-micro-business-owner.meta.json`, `tt2-gov-sa190125-1.meta.json`, `tt2-gov-sa210725-1.meta.json`). The only gov.il capture that rendered is a `BlobFolder` PDF (`pcn874-gov-il-874-eng.meta.json`, status 200). |
| 2 | `https://www.gov.il/he/pages/vat_exempt_dealer` | `gov-il-vat-exempt-dealer` | `research/colony-sweep/scouts/risk-governance--selling-as-individual.md:12` | The Tax Authority's own account of the exempt dealer: the reg 15 declaration's form and channel, the periodic-report exemption, and the occupations that cannot be exempt (reg 13). Same 403 risk as URL 1. |
| 3 | `http://www.nevo.co.il/Law_word/law06/TAK-5321.pdf` | `nevo-kt-5321-1991` | tick 19 §10 row 2 (`osek-patur-documents.md:782`); the link itself is in `R-VATRH:1` | Carried over: what the 1991 package did with §26ד and §26ג. It is not yet a ZERO-TESTS row: "TAK-5321" occurs 0 times in `ZERO-TESTS.md` and in `urls.txt`. |
| 4 | `https://www.nevo.co.il/law_html/law01/271_035.htm` | `nevo-vat-fines-increase-regs` | the lawsofisrael nevo listing, `2023-03-06/israel/listing/page_074.html:1140` at `aeca0b25` (github), entry "תקנות מס ערך מוסף (הגדלת סכומי קנסות), תשמ"ד-1984" (`:1153`) | The current value of §118's "קנס 5,000 לירות" (`R-VAT:1609`), if a missed reg 15 declaration falls under §118 rather than §117(א)(6) (11.4). Low priority. |
| 5 | `https://www.nevo.co.il/law_html/law01/271_005.htm` | `nevo-vat-general-regs` | the lawsofisrael nevo listing, `2023-03-06/israel/listing/page_028.html:921` at `aeca0b25` (github), entry "תקנות מס ערך מוסף, תשל"ו-1976" (`:934`) | **Highest priority of the five.** Reg 6א (which reg 1(2), reg 13(1) and reg 15א(ה) cite): whether any of the owner's services is a reg 6א service, and whether a foreign payer can be a reg 6א recipient. And the exempt dealer's report period or exemption under §67(א) or §67(ד), the instrument behind step 2's "דיווח **פעם בשנה**". "271_005" occurs 0 times in `ZERO-TESTS.md` and in `urls.txt`. |

### What this adds to FABLE_QUEUE row 17 (a)
- **Reg 1 reaches the owner, so the VAT side has no side door.** [inference]
  - Reg 1's one exception is the reg 15א occasional-deal registrant (`R-VATR:106`; the rule at `R-REG:176`), and the owner is not one (11.1).
  - So for VAT, as for income tax, the owner's documents fall under the instructions "כתקפם מעת לעת" and under §18ב with its conditions: the one-time notice, the payer's consent, automatic production, and the approved or secured signature "של עורך התיעוד" (`R-BK:1207`).
  - (a)'s signature question is therefore one question for both taxes, and no rendered text exempts the VAT side from it. The ₪0 question stays where tick 19 left it.
- **On the text, the Wix written-no branch is not a simple cost decision.** [inference]
  - Reg 11 excludes the §31(3) dealer by name (`R-REG:123`).
  - Reg 12 and §58 are a reasoned written request, granted only "אם ראה שמהותם קרובה יותר לסוג האחר" (`R-REG:128`, `R-VAT:785`). The applicant stays in his legal class until the decision (`R-REG:130`), and a grant takes effect thirty days after the month of notice or on a date the Director sets (`R-VAT:831`).
  - Worse for this route: the definition names §58 registrants only if "ואינו עוסק פטור" (`R-VAT:91`), and §58's "סוג ... של חייבי מס" may mean עוסק, מלכ"ר or מוסד כספי (`R-VAT:29`). Even a granted request may leave a dealer under the ceiling exempt on the text (11.3).
  - Reg 13(7) makes any company authorised whatever its turnover (`R-REG:163`). Incorporating is not ₪0, and its cost is not measured here.
  - So Wix's written no leads to one of three:
    - incorporating (a real cost decision, and a different taxpayer);
    - a §58 request, a long shot on the text (owner time: one reasoned letter);
    - Wix out.
  - (e)3's sentence (`RULING-2026-09-29-loop.md:275`) and the held question's `when` (`questions.json:45`) could say so.
  - If authorised status is reached, the branch is recurring work, not a one-time decision: §67 periodic reports, two-monthly by default under §67(א2)(1) (`R-VAT:852`), due "אף אם לא היו באותה תקופה עסקים" (`R-VAT:856`), plus tick 19's online allocation number for each tax invoice above ₪5,000 before VAT, on Wix's demand. Whether that recurring filing is KILL-4's "per-item owner paperwork" or "a recurring cost" (`research/channel-loop/BOARD-LOOP.md:67`) turns on whether the runner can file it.
- **Step 2 carries a risk to the exempt-dealer premise: reg 13(1).** [inference]
  - The owner's step-2 occupation line is "פיתוח תוכנה ומכירת כלים דיגיטליים" (`docs/OWNER_STEPS.he.md:146`). If the VAT office reads it as a listed free profession ("הנדסאי", "טכנאי", "מהנדס", "יועץ לארגון", "יועץ לניהול", `R-REG:135`) or as a reg 6א service (not captured; URL 5), the Director "ירשום" the owner as authorised whatever the turnover (`R-REG:133`).
  - Then the exempt-dealer document set is the wrong one: tick 19's §45 transaction invoice plus receipt, and the "never חשבונית מס" guard. A חשבונית מס becomes lawful, Wix's clause becomes meetable, and periodic VAT reports begin.
  - The list names titles, not tasks. Nothing read says whether a software developer is a "מהנדס" or a "טכנאי" for reg 13. A future colony line that runs group instruction could also fall in reg 13(4) (`R-REG:141`).
  - A ₪0 guard:
    - the document generator does not run until the class on the registration approval is recorded in state ("אישור על רישומו ועל סיווגו", §53(ב), `R-VAT:771`; the certificate, reg 7(א), `R-REG:87`);
    - its dealer-type switch keys on that recorded class;
    - the owner gives the class in one word with "צעד 2 בוצע" (`docs/OWNER_STEPS.he.md:149`).
- **One fixed yearly filing for the owner, not one per payout.** [inference]
  - Reg 15 asks for the declaration by 31 January (`R-REG:173`), on the Director's form at the regional office (`R-REG:194`). Missing it is an offence: under §117(א)(6), up to a year, if the declaration is a "דו"ח" (`R-VAT:1543`, `:1531`); otherwise under reg 17 and §118 (`R-REG:197`, `R-VAT:1609`).
  - The runner can compute the figure from its own ledger.
  - For registration, the text makes delivery the owner's or a listed professional's (`R-REG:43`). For the declaration, it does not say who may deliver.
  - Once a year does not trip KILL-4. It belongs in the owner's steps and in a January reminder in the tick.
- **Fifteen-day change notices** (reg 8, `R-REG:96`) follow events, not payouts: a change of address, the business stopping, or a change of economic branch. [inference] A new colony line might trigger one. That is a watch item for the tick, not owner work per document.

### Side finding (outside row 187): il-biz-tools' osek-patur page
- The page's FAQ says what happens above the ceiling (`products/il-biz-tools/osek-patur.html:84`). It says the ceiling is measured by turnover, "סך התקבולים בשנה הקלנדרית" (`:85`).
- [inference] Three rendered points could be added without new sources:
  - Reg 13's classes are registered as authorised at any turnover (`R-REG:133-165`), so for a lawyer, an engineer or a company using the tracker the ceiling does not decide their status.
  - Reg 15's declaration is due by 31 January (`R-REG:173`).
  - For a dealer who worked only part of the previous year, reg 14(א) counts turnover as "ממוצע המחזור לחודש במשך תקופת פעילותו בשנת המס שחלפה כשהוא מוכפל בשנים עשר" (`R-REG:168`).
- The tracker's `projectedAnnual` does something close but not the same.
  - It is the average over months with a positive entry, times 12 (`products/il-biz-tools/src/lib/osek-patur.js:32-34`). That drops zero months inside the period of activity, which reg 14(א) would count.
  - The page's status test uses the calendar-year sum (`osek-patur.js:28-30`, `:38-40`).
  - The text does not say whether reg 14 governs the ceiling test or only classification at registration.
- This is a product accuracy item, not a row-17 one.

### What this settles for FABLE_QUEUE row 17
- **Reg 15א is the occasional-deal registration** ("רישום עוסק בעסקת אקראי", nevo-vat-registration-regs.txt:175-184). An owner registered under reg 2 as an ongoing עוסק פטור is outside it [inference]. So VAT bookkeeping reg 1 (nevo-vat-bookkeeping-regs.txt:106) applies to the owner, and §18ב's conditions govern the VAT side as well.
- **No election below the ceiling on the text.**
  - Reg 11 excludes "עוסק הפטור ממס על פי סעיף 31(3) לחוק" (registration-regs.txt:123) and sits on the repealed §57 (nevo-vat-law.txt:783).
  - Reg 12 is a reasoned §58 request, decided on the nature of the business (registration-regs.txt:128; vat-law.txt:785). [inference] Its reach is doubtful: the definition names §58 registrants only if "ואינו עוסק פטור" (vat-law.txt:91), and §58's "סוג ... של חייבי מס" may mean עוסק, מלכ"ר or מוסד כספי (vat-law.txt:29).
  - Reg 13 makes its listed classes authorised whatever the turnover, a company included (registration-regs.txt:133, :163).
  - [inference] Wix's written no therefore leads to incorporating, a long-shot §58 request, or Wix out, not a plain cost decision. Rewording (e)3 (RULING-2026-09-29-loop.md:275) and questions.json:45 is the board's call.
- **[inference] Reg 13(1) is a step-2 premise risk.** Its list includes "הנדסאי", "טכנאי", "מהנדס", "יועץ לארגון", "יועץ לניהול" and reg 6א services (registration-regs.txt:135), and the step-2 occupation line reads "פיתוח תוכנה" (OWNER_STEPS.he.md:146). ₪0 guard: key the document generator on the class recorded from the registration approval (vat-law.txt:771).
- **Reg 15:** the exempt dealer's prior-year turnover declaration is due by 31 January every year (registration-regs.txt:173). Missing it is an offence: §117(א)(6), up to a year, if it counts as a "דו"ח" (vat-law.txt:1543), otherwise reg 17 with §118 (registration-regs.txt:197; vat-law.txt:1609) [inference on which applies]. It is once a year, not per payout.
- **Registration offences are the law's own:** §117(א)(4), "לא עשה את המוטל עליו לענין רישומו" (vat-law.txt:1539), up to a year (:1531).
- **Reg 2(א)(1):** a dealer registers "ביד אישית" or through a CPA, lawyer, tax adviser, a §72 supervision-union official or a bookkeeper (registration-regs.txt:43). No online channel is in the 10-12-2024 text, so step 2's "אונליין" stays unverified.
- **Still open:**
  - reg 6א of the general regulations and the exempt dealer's §67 report period or exemption (vat-law.txt:848, :852, :862). Both sit in תקנות מס ערך מוסף, תשל"ו-1976, which now has a URL (nevo 271_005, lawsofisrael listing page_028.html:921 at aeca0b25, github) and is not yet a ZERO-TESTS row;
  - how offices treat §58 requests from dealers under the ceiling (gov.il pages, likely 403);
  - the 1991 gazette (TAK-5321, still not a ZERO-TESTS row).

### What this adds for the sitting

- (a) Reg 1 reaches the owner. Its only exception is the reg 15א occasional-deal registrant (nevo-vat-bookkeeping-regs.txt:106; the rule at nevo-vat-registration-regs.txt:176), and the owner is not one [inference]. So the §18ב signature question is one question for income tax and VAT alike. No rendered text gives the VAT side its own way out. The ₪0 route question stands where tick 19 left it.
- (a), Wix written-no branch: on the text, the owner cannot simply choose to register as authorised below the ceiling. Reg 11 excludes the §31(3) dealer (registration-regs.txt:123). Reg 12/§58 is a discretionary, reasoned request (:128; nevo-vat-law.txt:785, :831). Its footing is doubtful twice over [inference]: the definition names §58 registrants only if "ואינו עוסק פטור" (vat-law.txt:91), and §58's "סוג ... של חייבי מס" may mean עוסק/מלכ"ר/מוסד כספי (:29). Reg 13(7) makes any company authorised (registration-regs.txt:163). So a written no leads to incorporating (not ₪0), a long-shot §58 letter, or Wix out. Rule whether (e)3's 'which is a cost decision for the owner' (RULING-2026-09-29-loop.md:275) and the held question's `when` (research/owner-asks/questions.json:45) should say so.
- (a), recurring-work check: if authorised status is reached, §67 reports become due two-monthly by default (vat-law.txt:852), even with no activity (:856). On top of that come tick 19's per-invoice allocation numbers above ₪5,000 before VAT. Rule whether that trips KILL-4 ('per-item owner paperwork' / 'a recurring cost', research/channel-loop/BOARD-LOOP.md:67) unless the runner can file them.
- (a), premise risk: reg 13(1) makes listed free professions (הנדסאי, טכנאי, מהנדס, יועץ לארגון, יועץ לניהול) and reg-6א services authorised whatever the turnover (registration-regs.txt:133, :135). Step 2's occupation line reads 'פיתוח תוכנה ומכירת כלים דיגיטליים' (docs/OWNER_STEPS.he.md:146). Rule whether to adopt a ₪0 guard. Under it, the document generator does not run until the class on the registration approval (§53(ב) 'אישור על רישומו ועל סיווגו', vat-law.txt:771) is recorded in state, and its dealer-type switch keys on that class.
- (a), owner minutes: reg 15's turnover declaration by 31 January (registration-regs.txt:173) is a fixed yearly owner filing, not per payout, so it does not trip KILL-4. The runner can compute the figure. Correct the penalty premise: a late 'דו"ח' under the regulations is §117(א)(6), up to a year (vat-law.txt:1543, :1531), if the declaration counts as one [inference]. Otherwise it is reg 17 with §118 (registration-regs.txt:197; vat-law.txt:1609), and late registration is §117(א)(4) (:1539). Rule whether it joins the owner's steps and a January tick reminder.
- (a), watch item: reg 8 requires written notice within 15 days of a change of address, the business stopping, or a change of economic branch (registration-regs.txt:96). A new colony income line might count [inference]. It is event-driven owner paperwork, not per document.
- Step 2 wording (outside (a) but bears on it): 'אונליין' (OWNER_STEPS.he.md:130) is not in reg 2's 10-12-2024 text, which provides delivery by hand or through a listed professional (registration-regs.txt:43). 'דיווח **פעם בשנה**' (:156) is rendered only for the annual declaration. On the law alone, §67(א2)(1) would make an exempt dealer report two-monthly unless the Minister set longer or exempted the class (vat-law.txt:852, :862).
- Queue before the next sitting: the general VAT regulations have a URL the reader missed. nevo 271_005 is at lawsofisrael listing page_028.html:921/:934 at aeca0b25 (github). It holds reg 6א (bearing on reg 1(2), 13(1) and 15א(ה)) and probably the exempt dealer's report exemption. Still open: how offices treat §58 requests (gov.il, likely 403), and the 1991 gazette TAK-5321, still not a ZERO-TESTS row.

---

## 29.9 (tick 22)

Written after the terms audit paused every nevo line (nevo.co.il has no terms on file). One Opus reader, checked by an adversarial verifier.

### Where the law texts come from if nevo stays paused

Written 29.9 as a follow-up to the terms audit, and checked by an adversarial verifier. Grades are as in "Grades" above. Each GitHub file was fetched raw at the pinned commit, and each quote was checked with `grep -n -F`. One exception: the Copyright Act line has an inline `<ref>` tag around "סעיף 4", so only the part after the tag matches `grep -F`.

**nevo's own terms: none found (NO_TERMS stands, `terms-verdicts.json:248-253`).**
- **No capture names any terms.** A `grep -i -F` over all ten captures (`research/rendered/nevo-*.html` and `.txt`) found 0 hits for each of these strings: תקנון, תנאי שימוש, terms, copyright, זכויות יוצרים, זכות יוצרים, כל הזכויות, ©, privacy, policy and robots (rendered).
  - The one hit for "תנאי השימוש" is statute text, in the timeshare list of חוק הגנת הצרכן (`nevo-consumer-protection-law-70305.txt:640`).
- **No capture has a site footer.** Every page ends with its last provision followed by an AdSense block (e.g. `nevo-vat-law.txt:1818`, §151).
- **The only site notice** is a link in `nevo-books-instructions` (twice) and `nevo-vat-bookkeeping-regs` (once): "הודעה למנויים על עריכה ושינויים במסמכי פסיקה, חקיקה ועוד באתר נבו - הקש כאן".
  - It appears at `nevo-books-instructions.txt:13080`, `:13082` and `nevo-vat-bookkeeping-regs.txt:709`.
  - The link goes to `http://www.nevo.co.il/advertisements/nevo-100.doc`. It is an editing notice for subscribers, not terms, and it was not opened.
- **GitHub code search found no copy of nevo's terms and no terms URL.** Queries tried: "nevo.co.il" with תקנון, with "תנאי שימוש", with "terms of use", and with robots. Four third-party statements turned up. None of them quotes any terms text:
  - `barkk678-lgtm/legislator` `docs/data-sources.md:3-5` at `b4344c1d`: "**אין לגרד את נבו או את דינים.** … האתרים האלה הם מוצרים מסחריים עם תנאי שימוש." The file says terms exist but quotes none.
  - `dk-forge/ai-layoff-tracker` `railway/country_coverage.py` at `4ce5e163`. Its `REFUSAL_LEDGER` (`:321`) lists nevo.co.il as one that "bans GPTBot, Google-Extended, Perplexity and '*' outright" (`:467-468`). The entry is marked `"verified_here": False` (`:472`).
  - `calcagnocarloalberto1-star/mediaresenzaconfini` `testi-in-vigore-israele/index.html:92` at `89075e47` reports a nevo page as "accesso bloccato da robots.txt".
  - `lawsofisrael/lawsofisrael` `scripts/scripts.txt:1` at `aeca0b25` says: "please note: while the law information is public domain however the activity of using the website might be not under the terms of the website".
- **robots.txt is not terms, and render-watch never fetches it.** The runner's own notes say so (`scripts/render-watch.mjs:352-353`, repo). Fetching nevo's robots.txt would also be a new nevo line, and those are held back ("new nevo lines wait", `terms-verdicts.json:252`).

**What §6 of the Copyright Act settles, and what it leaves open.**
- **The text of §6** (חוק זכות יוצרים, התשס"ח-2007, "פרסומים רשמיים"): "על אף הוראות סעיף 4, לא תהא זכות יוצרים בחוקים, בתקנות, בדברי הכנסת ובהחלטות שיפוטיות של בית משפט או של כל רשות שלטונית המפעילה סמכות שפיטה על פי דין."
  - Source: `nitzba/OCR_Error_Detection_Deep_Learning` `LawRepoWiki/akn/il/act/PrimaryLegislation/2007-11-25/113653/he@/main.xml:379`, with the heading at `:374`, at `030c1399` (github).
  - The lawsofisrael README gives it in English (`README.md:31-32` at `aeca0b25`).
- **What it settles:** there is no copyright in the statutory text.
- **What it does not cover:** nevo's own additions, such as the "נוסח עדכני נכון ליום" stamp (`nevo-vat-law.txt:3`), the amendment notes and the subscriber notice. These are not "חוקים" or "תקנות". A date stamp is in any case a fact [inference].
  - A third-party project puts it this way: "The editorial apparatus of a consolidation belongs to its publisher" (`TheAxiomFoundation/rulespec-il` `README.md:105-106` at `3e0df172`, github).
  - [inference] Whether "תקנות" in §6 covers the Director's הוראות (the books instructions) is not settled here.
- **What it does not answer:** whether nevo's unread site terms bar a weekly GET. That is a contract question, not a copyright one. `legislator` frames it the same way: "הסיכון הוא חוזי, לא זכויות יוצרים" (`docs/data-sources.md:5`).

**Alternative 1, with terms already read: the GitHub mirror (`github.com`, CONDITIONAL_MET).**
- **The verdict** is `terms-verdicts.json:113-116`. The condition is research use of public, non-personal information, with any publications open access (`TERMS-AUDIT-2026-09-29.md:25`).
- **The mirror** is `https://github.com/lawsofisrael/lawsofisrael` at `aeca0b25`, which is HEAD. This file's first reading used it (`:30`), and so did `refund-law-il.md:57`.
  - README: "the files are from different source" (`README.md:12`) and "public domain" (`:15`).
  - `2023-03-06/israel/` holds the VAT law, the VAT bookkeeping regulations, the income-tax bookkeeping instructions and the Electronic Signature Law, in `docs/`, `convert/` and `converted_docx/` (file names, blobless clone, github).
- **Limits:**
  - The folder is dated 2023-03-06, and all 8 commits are from 2023-06-29 (`git log`). That is older than the consolidations read at rendered grade here, e.g. the VAT law as of 13-07-2026 (`nevo-vat-law.txt:3`).
  - The files are nevo's own documents. The mirror's scripts downloaded them from nevo in a browser (`scripts/scripts.txt:6`, `:27`, `:31`), and its author flags nevo's terms (`:1`). So GitHub's terms cover our reading of the mirror, but they do not clean up how the mirror obtained the files, and nevo's editorial layer comes along with them.
  - A `raw.githubusercontent.com` URL maps to the site `githubusercontent.com` (`siteOf`, `scripts/queue-zero-test.mjs:110-123`), which has no verdict entry. A pinned blob never changes, so read it once through a clone rather than adding a weekly render line.

**Alternative 2, for newer text: he.wikisource.org, ספר החוקים הפתוח (`wikisource.org`, CONDITIONAL_UNMET).**
- **The Knesset database links here for full text.** It "points its "לחוק המלא" link at the he.wikisource.org ספר החוקים הפתוח project".
  - Source: `TheAxiomFoundation/axiom-corpus` `manifests/il-taxben-pilot-openlaw.yaml:5-6` at `dbb69efb`. The link was followed for the Income Tax Ordinance (`:32`). `rulespec-il` says the same (`README.md:88-90`) and ranks nevo as "commercial consolidation, cross-check only" (`:97`).
  - The database itself gives no text: it "renders client-side and `KNS_DocumentIsraelLaw` returns empty over OData" (`rulespec-il` `README.md:82-83`).
- **It carries 2026 changes, and it can differ from nevo.** A third party fetched the VAT law page on 27.8.2026 (`https://he.wikisource.org/wiki/%D7%97%D7%95%D7%A7_%D7%9E%D7%A1_%D7%A2%D7%A8%D7%9A_%D7%9E%D7%95%D7%A1%D7%A3`).
  - Its §38(א1) read "(מינואר 2026 ועד מאי 2026: 10,000 שקלים חדשים)" (`skills-il/tax-and-finance` `tranzila-payment-gateway/evidence.json:333-335` at `df1bc2da`, github).
  - nevo's 13-07-2026 text of the same clause has no interim figure (`nevo-vat-law.txt:567`).
  - Neither source is shown here to be complete.
- **Scope and upkeep**, per `legislator` `docs/data-sources.md`:
  - about 6,100 pages under the category "בוט חוקים", with "רישיון חופשי, MediaWiki API מלא, dumps להורדה" (`:10-11`);
  - "51% תקנות" (`:15`);
  - kept by volunteers, with a lag on recent amendments (`:25`).
  - Not checked: whether it holds the VAT registration regulations, the VAT bookkeeping regulations and the books instructions.
- **Its terms are conditional.** The Wikimedia Terms of Use were read at github grade from `tosdr/tosdr-snapshots` `Wikimedia/Terms of Service.html` at `b44ae1b6`. They have been in force since 7.6.2023 (`:1155`), and the snapshot's footer says "last edited on 31 March 2024" (`:1210`).
  - They bar "Engaging in automated uses of the Project Websites that are abusive or disruptive of the services, violate acceptable usage policies where available, or have not been approved by the Wikimedia community;" (`:981`).
  - They bind API users to "the User-Agent Policy, the Robot Policy, and the API:Etiquette" (`:1100`).
- **Why the condition is not met:** the runner sends a copied Chrome User-Agent (`scripts/render-watch.mjs:189-190`). The User-Agent policy has not been read first-hand, but two third parties quote it: "Do not copy a browser's user agent for your bot, as bot-like behavior with a browser's user agent will be assumed malicious." (`Nieole/romcat` `docs/research/scraper-sources.md:1318` at `43ef95da`; also `Shaostoul/Humanity` `docs/reference/findings/2026-09-25-site-embed-terms.md:154` at `0954d4a1`).
  - Both policies are unread and queued: the Robot Policy (`https://wikitech.wikimedia.org/wiki/Robot_policy`) and the User-Agent policy, each linked at `:1100`.
- **Access:** he.wikisource.org was EGRESS_BLOCKED from this project's container on 4.9.2026 (`research/colony-sweep/scouts/distribution--email-acquisition.md:15`). It has not been re-tested. render-watch runs on GitHub Actions, not in this container.

**Checked and not usable yet.**
- **The Knesset (`knesset.gov.il`, NO_TERMS).**
  - The homepage footer links "תנאי שימוש" to `/About/Pages/TermsOfUse.aspx` on `main.knesset.gov.il`. The footer also reads "כל הזכויות שמורות למדינת ישראל - הכנסת או לצדדים שלישיים, כמפורט בתנאי שימוש" (`theWallProject/mono` `packages/scrapper/logs/homepage_ai_extractor/1773740627845_The_Israeli_Knesset_(Parliament)/page.html:2299`, `:2367` at `07ffcbd1`, captured 17.3.2026, github).
  - No copy of the terms text was found on GitHub. Queue: `https://main.knesset.gov.il/About/Pages/TermsOfUse.aspx`.
  - What it would open: the official gazette PDFs on `fs.knesset.gov.il`, "the authentic text of each amending act" (`rulespec-il` `README.md:85-87`). These are official texts but not consolidated.
- **gov.il.** `www.gov.il` is TERMS_PENDING (`terms-verdicts.json:407-411`). Its terms page answered the runner with 403 on 29.9 at 16:22Z (`research/rendered/terms-gov-il.meta.json`). This search found no gov.il page with consolidated legislation.

**What this leaves [inference].**
- The nevo pages already captured stay readable (`terms-verdicts.json:252`).
- For text as of early 2023, the lawsofisrael mirror on GitHub can be read under terms already read, with the provenance caveat above.
- For newer consolidated text, Wikisource is the only candidate found. Before any runner line: read the Robot Policy and the User-Agent policy, and give that host an identifying User-Agent with contact details.
- The dumps that `legislator` mentions (`:11`) would make a one-time read possible without weekly page fetches. That route is also unread.
- For official, unconsolidated text, read the Knesset's terms first.
