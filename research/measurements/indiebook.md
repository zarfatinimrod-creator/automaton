# Measurement: Indiebook (אינדיבוק), channel-loop row 22

**Date:** 2026-09-28 (Opus reader, tick 6). **Ordered by:** `logs/CHANNEL_LOOP.md` §4 row 22, `research/channel-loop/ZERO-TESTS.md`
rows 68-70, `research/breadth/REPLENISH-2026-09-28.md` §3.1 (the proposed kills (a)-(d) are quoted from there).

**Status: NEEDS_MORE.** None of the proposed kills fires on a rendered fact. The payout half of (b) is **refuted**: the store
pays an עוסק פטור, and a person who is not registered at all, by Israeli bank transfer against a quarterly invoice or payment
demand. The listings show no camera step. For (c), one self-published title's author label is the literal word "פסאודונים"
("Pseudonym"), and three self-published titles show no author at all. Kill (a) (a fee) and kill (d) (how titles are submitted)
are not answered by any of the three pages, and neither is the royalty share. The author page the store links as
"פרסום ספר באינדיבוק" answers them (§5).

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
