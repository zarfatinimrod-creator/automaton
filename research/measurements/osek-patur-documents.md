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
