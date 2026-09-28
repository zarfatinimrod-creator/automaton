# Measurement: Indiebook (אינדיבוק), channel-loop row 22

**Date:** 2026-09-28 (Opus reader, tick 6). **Ordered by:** `logs/CHANNEL_LOOP.md` §4 row 22, `research/channel-loop/ZERO-TESTS.md`
rows 68-70, `research/breadth/REPLENISH-2026-09-28.md` §3.1 (the proposed kills (a)-(d) are quoted from there).

**Status: NEEDS_MORE.** None of the proposed kills fires on a rendered fact. The payout half of (b) is **refuted**: the store
pays an עוסק פטור, and a person who is not registered at all, by Israeli bank transfer against a quarterly invoice or payment
demand. The listings show no camera step. For (c), one self-published title's author label is the literal word "פסאודונים"
("Pseudonym"), and three self-published titles show no author at all. Kill (a) (a fee) and kill (d) (how titles are submitted)
are not answered by any of the three pages, and neither is the royalty share. The author page the store links as
"פרסום ספר באינדיבוק" answers them (§5). **Tick 8 (28.9, the author page and the terms): still NEEDS_MORE; no kill
fires.** The author page does not answer them. It holds one off-site submission link (`wkf.ms`) and `office@indiebook.co.il`,
with no fee, share or rule. The terms are the buyers' terms (updated 29.2.2024). They make the store the merchant of
record, keep pricing with the store, put liability for content on the author, and bar robot data collection and deep
links, but not automated submission. Neither page has an AI, exclusivity or naming rule. The author agreement is not
published, so only the store can answer the rest. The next check is the step-8 written question (Tick 8 section, below).
Drop the `seoReport.csv` render.

**Grades.** [RENDERED] = quoted from `research/rendered/`, with file:line checked by `grep -n -F`. [INFERENCE] = reasoning.
UNKNOWN = not shown. No author's personal name is copied. Where a label is a person's name it is written [name removed].

## 1. What was read (all 200, `.meta.json` fetchedAt 2026-09-28T17:19Z, first fetch, not truncated)
| Capture | Read |
|---|---|
| `indiebook-home.{txt,html}` (368 / 2453 lines) | txt in full; html for the nav and footer link targets, the shelf headings and the `data-manufacturer` labels |
| `indiebook-royalty-guide.{txt,html}` (107 / 872) | txt in full; html for the royalty-system link (html:738) |
| `indiebook-self-publishing.{txt,html}` (135 / 1046) | txt in full; html for the listing block, the load-more script and the loaded-item IDs |

## 2. Gate by gate
**G1 (₪0 up front): UNKNOWN; kill (a) does not fire.** None of the three pages names a fee, a package or a percentage. The
header has "פרסום ספר באינדיבוק" (home.txt:3), linking to `/41/איך-למכור-ספר-באתר` (home.html:668). That page was not captured.
The only charge rendered falls on payout, not on listing: an unregistered payee with no withholding certificate has
"ינוכה מהסכום מס מקסימלי כחוק" (royalty-guide.txt:73). [RENDERED]

**G2 (Israeli individual paid, no camera): payout PASS [RENDERED]; camera leaning PASS [INFERENCE].**
- Cycle: "מיד לאחר סופו של כל רבעון, עליכם לשלוח לאינדיבוק בקשת תשלום וחשבונית מס." (royalty-guide.txt:35). The quarters are
  listed at :37-43.
- Rail: "שלחו פרטי חשבון בנק לתשלום בהעברה בנקאית" (:67). The invoice goes by email or by post to "אינדיבוק בע"מ" (:61).
- עוסק פטור: "מי שמוגדר עוסק פטור חייב לשלוח דרישת תשלום או קבלה כדי שנוכל להעביר לו את התשלום" (:69). The system shows the royalty
  "כולל מע"מ" (:55), so an exempt payee bills the net: "יש לחלק את הסכום ב-1.17" (:69).
- Not registered at all: a payment demand "שעליה מופיעים השם המלא ומספר תעודת הזהות שלכם" (:73).
- Reports come from a third-party system: "יש להיכנס לממשק המעקב של חברת סגמט" (:45), a login at `https://ws1.segment.co.il/NewLogin`
  (royalty-guide.html:738), with credentials "כפי שנשלחו אליכם על ידי חברת סגמנט עם החיבור הראשוני למערכת" (:47).
- [INFERENCE] The rail is paperwork plus a bank account, with no identity-verification step named. The camera half is not proven,
  but nothing on the page points to one. The cost is a recurring owner step: four invoices a year, plus logging in to Segment.

**G3 (listing without a per-item owner click): UNKNOWN; kill (d) cannot be tested.** No page says how a title is submitted
(form, email or file). [INFERENCE] Account credentials that are "sent" at the "initial connection" (:47) suggest the store or
Segment onboards authors by hand, not through self-serve per-title forms. That is not proof.

**G4 (honest value / AI): UNKNOWN; the AI half of kill (c) does not fire.** The three captures have no AI rule. In the html,
"GPT" matches only inside base64 blobs. Two of the five category titles are free: "דיגיטלי 0 ₪" (self-publishing.txt:95, :101).
[INFERENCE] The free-content bar in `REPLENISH` §3.1 therefore applies inside the store as well.

**G5 (buyers): PASS at github grade (CrUX, per row 22). The rendered facts support it, with limits.**
- The homepage has 51 title cubes on four shelves (home.html:736, 1185, 1370, 1831). Sale prices run from 0 to 55 ₪, and
  23 of the 51 are 29 ₪ (home.txt, the "דיגיטלי" lines). There is a subscription, "מנוי אינדיבוק" (home.txt:7), and the site
  has run since "2013- 2026" (home.txt:366).
- Self-published titles do get shelf space. 8 of the 51 cubes carry "הוצאה עצמית" in `data-manufacturer`, including 3 of
  the 15 on "הנמכרים ביותר" (home.html:1370; cubes :1546, :1604, :1691). Two of those three are 0 ₪ (home.txt:196, :208).
  [INFERENCE] A free title on a best-sellers shelf suggests the shelf counts downloads, not only sales.
- Neither the listings nor the category show sales counts or star ratings. The category offers a sort, "המדורגים ביותר"
  (self-publishing.txt:77), so ratings exist somewhere; per-title figures are UNKNOWN.
- **The "self-publishing category" is not the self-published catalogue.** It is a publisher page (`loadMore/manufacturer/397`,
  self-publishing.html:566) with five loaded IDs (:933) and load-more switched off (:567). Its prices are 28 (was 39), 42, 0,
  0 and 25 ₪ (self-publishing.txt:83, :89, :95, :101, :107). The homepage's self-publishers each sit under their own
  "[name removed] - הוצאה עצמית" label, so the true count is UNKNOWN. The store sells print, Kindle and audio too
  (self-publishing.txt:29-35).

**G6 (one owner step unlocks many listings): UNKNOWN, with one favourable sign.** Three English-titled self-published books
share one publisher label, have consecutive IDs and went up as new together (home.html:1028, :1057, :1086). [INFERENCE] One
self-publisher account can carry several titles. Whether adding a title needs the owner each time is UNKNOWN.

**G7 (brand-only public name): leaning PASS [RENDERED + INFERENCE]; the name half of kill (c) does not fire.**
- An author label reads "פסאודונים" (self-publishing.txt:93), and another reads "מבחר כותבים" (:105).
- The three titles above render with an empty author block: "On Life and Death" (home.txt:90) is followed directly by its
  price (:92), and the authors div is empty (home.html:1040).
- The legal name and ID go only on the payment demand, which is sent privately to the store (royalty-guide.txt:73). Whether
  the brand "מהודק" itself is accepted as the author or publisher label is UNKNOWN.

## 3. What stays UNKNOWN
The royalty share. Any listing or conversion fee. How a title is submitted (form, email or file upload), and whether the
terms forbid automated access. Any AI rule or AI-disclosure field. Whether an author or publisher label can be a brand. The
size of the self-published catalogue. Per-title sales and ratings. Royalties on subscription reads ("ספרים למנויים",
home.txt:26). How the Segment account is opened.

## 4. Links taken from the homepage (not guessed)
- Author sign-up, "פרסום ספר באינדיבוק": `https://indiebook.co.il/41/%D7%90%D7%99%D7%9A-%D7%9C%D7%9E%D7%9B%D7%95%D7%A8-%D7%A1%D7%A4%D7%A8-%D7%91%D7%90%D7%AA%D7%A8` (home.html:668)
- Terms, "תקנון האתר": `https://indiebook.co.il/16/%D7%AA%D7%A7%D7%A0%D7%95%D7%9F-%D7%94%D7%90%D7%AA%D7%A8` (home.html:2369; text home.txt:353)
- Contact: `https://indiebook.co.il/2/%D7%99%D7%A6%D7%99%D7%A8%D7%AA-%D7%A7%D7%A9%D7%A8` (home.html:668). The footer email decodes to `office@indiebook.co.il` (home.html:2364).
- Authors index, "סופרים": `https://indiebook.co.il/380/%D7%A1%D7%95%D7%A4%D7%A8%D7%99%D7%9D` (home.html:2369)

## 5. The single next check
Render the author page, **`/41/איך-למכור-ספר-באתר`** (URL above, home.html:668), with the suggested slug **`indiebook-sell-a-book`**.
It beats the terms page as the next render. It is the store's own route for authors, and it is the page most likely to state
a fee (kill a), the share, and the submission route (the first half of kill d). If submission turns out to be one file sent by
email, kill (d) cannot fire whatever the terms say. The terms page (`indiebook-terms`) comes next, for the automated-access
clause and any AI or name rule. `seoReport.csv` waits until both have been read (`REPLENISH` §3.1).

## Tick 8 reading (28.9.2026): the author page and the terms

**Read.** Both are 200, first fetch, not truncated, `fetchedAt` 2026-09-28T18:36Z (`.meta.json`). No person's name is copied.
The store's WhatsApp number and its company number are left out because nothing below needs them.

| Capture | Read |
|---|---|
| `indiebook-sell-a-book.{txt,html}` (69 / 851 lines; the `/41/` page, ZERO-TESTS row 96) | txt in full; html for the page body (html:723-742), the submission link (html:730) and the Cloudflare-obfuscated email (html:735, decoded) |
| `indiebook-terms.{txt,html}` (297 / 994; ZERO-TESTS row 97) | txt in full (body :29-269); html grepped for AI words outside base64 (none) and for the robots clause (html:812) |

**The finding that shapes the rest [RENDERED].** The author page's body is six short lines (sell-a-book.txt:31-41): two
questions, an invitation, one link and an email. Its whole instruction is "שלח לנו את הספר בלינק הזה וניהיה בקשר בהקדם." (sell-a-book.txt:39). The terms are the buyers' terms. They
govern the relationship "בין החברה לבין כל אדם הגולש ו/או צופה ו/או משתמש באתר" (terms.txt:35), and "התקנון עודכן ב-29 בפברואר
2024" (:269). Neither page has an author agreement, an author price list, a royalty percentage, an AI clause, an
exclusivity clause or a naming rule. [INFERENCE] Those terms are in whatever the store sends after "we'll be in touch",
so no further render of indiebook.co.il can settle them.

### Gate by gate

**G1 (₪0 up front), kill (a): does not fire; still UNKNOWN.**
- The author page offers publishing to anyone, "אנחנו באינדיבוק מאפשרים לכל אחד ואחת לפרסם ספר בחנות" (sell-a-book.txt:35),
  and names no fee, package or price. Its only money phrase is the footer's promise of pay to authors, "לקבל על כך תגמול הוגן
  ונאה" (:45), with no number.
- The terms name no author fee. Their one fee is the buyer's cancellation charge, 5% or ₪100 (terms.txt:97). A general
  reservation lets the store "להוסיף ו'/או להוריד שירותים עליהם תגבה תשלום או לא תגבה תשלום" (:249). [INFERENCE] That is
  boilerplate, not a required package, so (a) does not fire on it.
- The replenish note's snippet ("does not provide publishing services") is still in no capture. Whether the store's reply to
  a submission quotes a paid package is UNKNOWN.

**Royalty share / commission: UNKNOWN.** Neither capture gives a percentage. "תמלוג", "עמלה" and "אחוז" appear in neither
txt, and the only "%" in the terms is the 5% cancellation charge (:97).

**G2 (payout), kill (b): unchanged, does not fire; timing added.**
- Neither page has a camera, selfie or identity-verification step.
- An invoice is due every quarter: "מיד לאחר סופו של כל רבעון" (royalty-guide.txt:35). It goes by email or by post (:59).
  Email is enough, so no physical mail is needed.
- Payment works without VAT registration [RENDERED]. An עוסק פטור sends a payment demand or a receipt, net of VAT (:69).
  A person not registered at all sends a payment demand with their full name and ID number (:73). Without a
  withholding certificate, "ינוכה מהסכום מס מקסימלי כחוק" (:73), so the second route costs the maximum withholding.
- Timing: the guide says only "התשלום יעבור לחשבון הבנק לפני תנאי התשלום שלכם." (:67). That is "your payment terms", with no
  number of days. [INFERENCE] A January sale is billed in early April and paid some time later, so the first money lags a
  sale by more than three months.
- [INFERENCE, outside knowledge, not rendered] The guide's divisor is "יש לחלק את הסכום ב-1.17 (כאשר המע"מ הוא 17%)" (:69).
  Israeli VAT has been 18% since 1.1.2025, so the example is out of date, and the exact net figure for an exempt payee
  needs confirming.
- New and favourable: the store is the merchant of record. "רכישת המוצרים נעשית מול החברה והחברה היא שתפיק חשבונית מס בעבור כל
  עסקה, ולא הוצאות הספרים ו/או הסופרים עצמם" (terms.txt:127). The brand never invoices a buyer, and buyers go to the store's
  own service channels (:47, :91). [INFERENCE] This fits "the owner never talks to customers" (MISSION.md:420).

**G3 (submission), kill (d): does not fire.**
- The route [RENDERED] is one link, `https://wkf.ms/3RauGye` (sell-a-book.html:730), and one email, `office@indiebook.co.il`
  ("דברו איתנו", sell-a-book.txt:41, decoded from html:735). indiebook.co.il itself has no account, upload page or per-title
  form. "וניהיה בקשר בהקדם" (:39) says a person at the store follows up.
- [INFERENCE] `wkf.ms` is a short link to a form hosted elsewhere. Its target was not rendered, so what it asks for (a file,
  a legal name, an ID, a phone number) is UNKNOWN. So is whether it is filled once per title or once per author, and who
  converts the manuscript. The page defines the product only as an EPUB, "מופק כל כולו באופן דיגיטלי בקובץ ממוחשב שנקרא
  איפאב" (:45). [INFERENCE] A runner can build an EPUB itself, so conversion blocks nothing unless it is sold as a paid
  service (that would be kill a).
- Automated access [RENDERED]: "אין לאסוף נתונים מן האתר באמצעות תוכנות מסוג Crawlers Robots וכיוצ"ב" (terms.txt:169;
  html:812). This bars robots from collecting data from the site. It does not bar automated submission, and the submission
  form is not on the site. So the second half of (d) holds only for scraping, and the first half (every title a per-title
  web form) is not shown. **(d) does not fire.**
- The same clause bars deep links: "ואין לקשר לעמודים המצויים בתוכו ("קישור עומק"), אלא לעמוד הבית בלבד" (:169). [INFERENCE] A
  brand page promoting a title may link only to the homepage, unless the author agreement says otherwise.

**G4 (honest value, AI), the AI half of kill (c): does not fire.**
- Neither capture has an AI rule [RENDERED absence]. "בינה מלאכותית", "AI", "GPT" and "אוטומטי" appear in neither txt, and in
  neither html outside base64.
- The author carries the content risk. Responsibility for errors, descriptions, suitability for minors and the blurb "הינה
  של הוצאות הספרים ו/או הסופרים עצמם" (terms.txt:137). [INFERENCE] The AI declaration belongs in the blurb the brand writes.
  The store neither asks for one nor forbids one.
- The store may add or remove any digital content (:133) and may stop selling new products (:251). [INFERENCE] An
  AI-declared title can be delisted at will. That is a risk, not a kill.

**G7 (public name), the name half of kill (c): does not fire.** Neither page has a rule on author names. The one naming
clause, "בכלל זאת את שם המשתמש" (:149), sits under user content (תוכן משתמשים) and covers what users upload, not the author
label. Tick 7's evidence stands: one label reads "פסאודונים" and some author blocks are blank. Whether "מהודק" itself is accepted
as the author or publisher label is UNKNOWN.

**Pricing control: the store's [RENDERED]; the author's say is UNKNOWN.** "החברה רשאית לעדכן ולשנות את המחירים ללא צורך בהודעה
מוקדמת ולפי שיקול דעתה הבלעדי" (terms.txt:129; also :53). The store also runs discounts and coupons at its own discretion
(:139). [INFERENCE] These clauses face buyers. Whether the author sets the list price would be in the unseen author
agreement.

**Exclusivity: UNKNOWN.** The only exclusivity clause is the buyer's licence, "רשיון זה אינו בלעדי" (:131).

**Subscriptions.** A title bought through the subscription can be used for three months, "תוקף השימוש במוצר הוא של שלושה
חודשים מעת הרכישה" (:59). The royalty on it is still UNKNOWN.

**What a runner cannot do.** The store's service channels include WhatsApp (:47), and email is offered too
(sell-a-book.txt:41; royalty-guide.txt:59). Neither page requires a signed form, post or a call. [INFERENCE] "וניהיה בקשר
בהקדם" (:39) does not say which channel. A phone call would be an owner step that a runner cannot take. This is the one
runner risk still open.

### What the terms change for the loop
- **Drop the `seoReport.csv` render.** `REPLENISH` §3.1 held it until the terms were read. The terms name "לרבות רשימות
  הכותרים" as the company's database property (terms.txt:163). They bar commercial or other use of the product lists,
  "ברשימות המוצרים המופיעים בו", without written consent (:167), and they bar robot collection (:169). [The clauses are
  RENDERED; applying them here is INFERENCE.]
- **No more indiebook.co.il renders for row 22.** The render-watch workflow that fetched the five captures is a robot
  (`scripts/render-watch.mjs:29-30`, a plain `fetch` at :612-622). Reading five pages once to learn the store's terms is
  small. A sixth render adds nothing, because the unknowns are not on the site.
- **The "before admission" bar is still unmet.** No Hebrew title is named, and nothing on these pages changes the bar
  (`REPLENISH` §3.1; `docs/REJECTED.md:170-175`). It remains the supply question.

### Verdict: NEEDS_MORE
No kill fires on a rendered fact:
- (a): no fee is named.
- (b): refuted in tick 7.
- (c): there is no AI rule and no naming rule.
- (d): submission is one off-site link, and the automated-access clause bars scraping, not submission.

It is not PASS_TEST either. G1 is still unproven. The share, the AI stance, the brand label and exclusivity would all be in
an author agreement the site does not publish, and only the store can answer them.

### Owner steps admission would need, in order
| # | Step | Minutes | Identity | Camera | Recurs |
|---|---|---|---|---|---|
| 1 | Step 8, the brand mailbox (already queued); the colony sends the question below from it (`logs/CHANNEL_LOOP.md:181-183`) | ~10 (`src/revenue/owner-steps.ts:193`) | no ID document; a phone check at most (owner-steps.ts:195) | no | one-time |
| 2 | Submission: the runner fills `wkf.ms/3RauGye` with an EPUB and the brand mailbox | 0 for the owner if the store works by email; ~10 if it insists on a call [INFERENCE] | UNKNOWN (the form's fields are unread) | no [INFERENCE] | once per title, done by the runner |
| 3 | Sign the author agreement, if the store sends one (UNKNOWN whether one exists) | ~10 [INFERENCE] | yes: the legal name, given to the store privately | no [INFERENCE] | one-time |
| 4 | Step 2, the עוסק פטור file (queued "only when a paid product is ready", `logs/CHANNEL_LOOP.md:190-191`). Optional: an unregistered payment demand also works, at the maximum withholding (royalty-guide.txt:73) | 60-90 (owner-steps.ts:205) | yes | no | one-time |
| 5 | Send the store bank details once (royalty-guide.txt:67) | ~5 [INFERENCE] | yes (the account holder) | no | one-time |
| 6 | A payment demand or receipt each quarter (royalty-guide.txt:35, :69, :73) | ~10 each [INFERENCE] | yes (in the owner's name; with the ID number on the unregistered route) | no | **4 a year, recurring** |

The Segment login for royalty reports arrives by email "with the initial connection" (royalty-guide.txt:47). [INFERENCE]
If it goes to the brand mailbox, the colony runs the report and the owner has nothing to do. Step 6 is the one recurring
owner step. MISSION allows one-time identity and payout steps (MISSION.md:412-413) and no manual ops (:211). So the sitting
has two options: accept four short documents a year, or hold admission until the colony can issue them after step 2 (as
tick 7 said).

### The single next check: the step-8 written question
The colony sends it once, from the brand mailbox, to `office@indiebook.co.il` (the address on the author page,
sell-a-book.html:735). It says that an automated agent wrote it, as the step-8 text requires (owner-steps.ts:195). The owner
replies to nothing. The exact text:

> שלום, הודעה זו נכתבה ונשלחה על ידי סוכן בינה מלאכותית אוטומטי שמפעיל את המותג מהודק, לא על ידי אדם. מהודק מפרסם ספרי עיון
> דיגיטליים בעברית שנכתבים בעזרת בינה מלאכותית ונבדקים לפני פרסום, וזה מוצהר בתיאור כל ספר. לפני שנשלח ספר דרך הטופס שבעמוד
> "רוצה לפרסם ספר?", נשמח לדעת: (1) האם יש עלות כלשהי לסופר (פרסום, המרה או חבילה), ומה אחוז התמלוגים לסופר ממכירה ומקריאה
> במנוי? (2) האם אתם מקבלים ספר שנכתב בעזרת בינה מלאכותית ומוצהר ככזה? (3) האם שם המחבר ושם ההוצאה המוצגים יכולים להיות "מהודק"
> בלבד? (4) האם ההפצה בלעדית, ומי קובע את מחיר הספר? (5) האם ממלאים את הטופס פעם אחת לכל ספר, והאם כל ההתקשרות, כולל ההסכם,
> יכולה להתנהל בדוא"ל בלבד? תודה.

(English: the message says an automated AI agent operating the brand Mehudak wrote it, not a person. Mehudak publishes
Hebrew non-fiction ebooks written with AI and checked before publication, and this is declared in each book's description.
Before sending a book through the form on the "Want to publish a book?" page, it asks: (1) any cost to the author
(publishing, conversion or a package), and the author's royalty share on sales and on subscription reads; (2) whether a
declared AI-written book is accepted; (3) whether the displayed author and publisher can be "Mehudak" alone; (4) whether
distribution is exclusive, and who sets the price; (5) whether the form is filled once per book, and whether all contact,
including the agreement, can be by email only.)

**How the answer is read (pre-registered).** Record it verbatim.
- Any required cost: (a) fires.
- Declared AI books refused: the AI half of (c) fires.
- The legal name must be shown, with no brand or pen-name option: the name half of (c) fires.
- A one-time call or signature: a one-time owner step for the sitting to weigh.
- A call per title: this fails MISSION's one-time rule (MISSION.md:412-413).
- No cost, a stated share, and yes to (2), (3) and (5): PASS_TEST on the gates. The supply bar (name one title) then
  remains before admission.

The form, `wkf.ms/3RauGye` (sell-a-book.html:730), was not chosen as the next check. It could be rendered for ₪0, and it
is off indiebook.co.il, so :169 does not reach it. But [INFERENCE] a hosted form is usually built by JavaScript, render-watch
is a plain `fetch` (`scripts/render-watch.mjs:612-622`), and a form shows its fields, not the share, the fee or the AI
stance. It would settle less than the question. The question waits on step 8. Until then row 22 stays parked at NEEDS_MORE,
with nothing left to render.
