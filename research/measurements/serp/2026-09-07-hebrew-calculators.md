# Measurement: Hebrew calculator SERPs (board task — the one approved SERP pull)

**Date:** 2026-09-07. **Calls made:** 2026-09-07, 18:27–18:29 UTC (21:27–21:29 IDT), in two batches of three.
**Ordered by:** `research/colony-sweep/BOARD.md` §6.3.2, verbatim: *"One Hebrew SERP pull — APPROVED, before
build #3. Done with the WebSearch tool, one call per term, at most six terms … results written verbatim to
`research/measurements/serp/`. Not automated from CI: scraping Google results violates Google's terms and the
mandate forbids ToS violations; the licensed search tool does not."*

**Question:** who holds the Hebrew SERPs for the terms the two search-acquired lines depend on — `il-biz-tools`
(board build #4, ceiling ₪400, grade `contradicted`) and `pcn874` (board build #3, ceiling ₪600, grade
`inferred`) — and does the evidence let either line pass MISSION constraint 7 (*"a line may not be built before
its acquisition channel is named"*)?

**Search budget: 6 of 6 WebSearch calls used, one per term.** No WebFetch. No result page was opened: this is a
SERP measurement, not a content study, and opening the pages would answer a different question at a cost the
board did not authorise.

---

## Evidence strength legend

- **[SNIPPET]** — everything below. **A search result is a snippet by definition.** There is no RENDERED grade
  anywhere in this file and nothing in it may be upgraded to one by a later reader.
- Where the search tool's own synthesised summary asserts a fact (a figure, a threshold), it is reproduced in a
  blockquote and is **[SNIPPET] about a summary** — weaker still, because it is a model's paraphrase of pages
  neither it nor I opened. It is recorded so the next rank can see what the instrument said, not so anyone can
  cite it.

### Three limits of the instrument, stated before the data

1. **The tool is US-locale.** Its own description reads *"Search the web. Returns result blocks with titles and
   URLs. US-only."* These are Hebrew queries resolved from the United States. The result sets are almost
   entirely `.co.il`, which suggests language dominates the retrieval — but **the ranking order is not what a
   searcher in Tel Aviv sees**, and no conclusion below rests on a specific position.
2. **The instrument returns no snippets.** It returns a title and a URL per result, plus one synthesised summary
   of the whole set. The brief asked for "every result's title, domain, and snippet as given, in order" — titles,
   domains and order are recorded verbatim; **the snippet column is empty because the instrument does not emit
   one**, and inventing plausible snippet text would be exactly the failure `verification-before-completion`
   exists to stop.
3. **SERP features are invisible.** Ads, AI Overviews, featured snippets, People-Also-Ask, and Google's own
   inline calculator widget do not appear in this output. For `מחשבון מע"מ` in particular, Google very plausibly
   answers the query itself above every organic result. **An organic position whose click-through is eaten by a
   SERP feature is worth nothing, and this instrument cannot see that.**

---

## 1. The one-line answer

**Two of the six SERPs are held by small independent tool sites — so a new Hebrew calculator is not structurally
barred from page one, which is more than any platform channel in this repo can say. But those two are exactly
the free-arithmetic pages, and all four SERPs that touch money return no tool at all: Kol Zchut, Green Invoice,
iCount, YPAY and a wall of CPA firms hold them, precisely as `content-seo` §1–3 predicted. The PCN874 SERP
returns nine results and not one standalone tool — the unserved shape the board bet ₪600 on is real.**

---

## 2. The six queries, verbatim

Titles are reproduced as the instrument returned them (JSON escaping of `"` in `מע"מ` removed; nothing else
changed). Order is the order returned. Domain is extracted from the returned URL and is the only derived column.

---

### Q1 — `מחשבון חשבונית עוסק פטור`
*Represents:* `products/il-biz-tools/invoice.html` — **the only page on the site that takes money** (title:
"מחולל קבלות וחשבוניות עסקה לעוסק פטור – הדפסה ושמירה כ-PDF"; H1: "קבלה / חשבונית עסקה"). Called 18:27 UTC.
**7 results.**

| # | Title (verbatim) | Domain | URL | Snippet |
|---|---|---|---|---|
| 1 | עוסק פטור (מושג) – כל-זכות | `kolzchut.org.il` | `https://www.kolzchut.org.il/he/עוסק_פטור` | none returned |
| 2 | איזה סוג חשבונית עוסק פטור צריך להוציא | `greeninvoice.co.il` | `https://www.greeninvoice.co.il/magazine/exempt-dealer-invoice/` | none returned |
| 3 | עוסק פטור מוציא חשבונית או קבלה? שאלנו 32 רואי חשבון מומלצים! | `midrag.co.il` | `https://www.midrag.co.il/Expanel/Question/1866` | none returned |
| 4 | חשבונית מס, חשבונית עסקה וקבלה: עושים סדר במסמכי העסק [לשנת 2026] | `hyp.co.il` | `https://hyp.co.il/blog/tax-invoice/` | none returned |
| 5 | פתיחת עוסק פטור: מדריך מקיף (מעודכן ל-2026) \| iCount | `icount.co.il` | `https://www.icount.co.il/blog/osek-patur/` | none returned |
| 6 | איזה מסמך עוסק פטור צריך להפיק – קבלה או חשבונית? - AccountIT | `account-it.co.il` | `https://www.account-it.co.il/איזה-מסמך-עוסק-פטור-צריך-להפיק-קבלה-א/` | none returned |
| 7 | מערכת הנהלת חשבונות באיטרנט חינם - סליקה, הפקת חשבונית דיגיטלית ירוקה חינם - YPAY | `ypay.co.il` | `https://ypay.co.il/` | none returned |

Instrument summary, verbatim in the part that asserts fact:

> *"To be an exempt dealer, the annual business turnover (not profit) must not exceed 122,833 ₪ as of 2026. …
> An exempt dealer is not required or allowed to issue a tax invoice … However, an exempt dealer can issue a
> transaction invoice … The search results show that there are various software tools and accounting systems
> specifically designed for exempt dealers to manage their invoicing and reporting requirements."*

**Analysis.** Top-3 domains: **kolzchut.org.il, greeninvoice.co.il, midrag.co.il.** Holders: one NGO rights
encyclopedia (#1), three invoicing/payments SaaS content-marketing properties (#2 Green Invoice, #5 iCount, #4
Hyp), one accountant-directory Q&A (#3), one accountant's blog (#6), one free invoicing SaaS homepage (#7).
**Small independent tool site: none.** **The query contains the word `מחשבון` and not one result is a tool.**
Google is reading this intent as informational and satisfying it with articles.

Two things this costs us. First, `invoice.html` is a *tool* aimed at a SERP that contains no tools — we would be
introducing a result type the ranking evidently does not want here. Second, and worse for the line's economics:
**result #7 is YPAY, whose own title advertises `הפקת חשבונית דיגיטלית ירוקה חינם` — free digital invoice
issuance.** Our Pro tier's single paid feature is a branded invoice/receipt PDF. MISSION constraint 8's price
floor of zero is not a theory on this term; a competitor is standing on page one announcing the price.

---

### Q2 — `מחשבון שכר נטו 2026`
*Represents:* `net-salary.html` (title: "מחשבון שכר נטו 2026 – אומדן מברוטו לנטו עם מס הכנסה וביטוח לאומי";
H1: "אומדן שכר נטו \[badge: אומדן]"). Called 18:27 UTC. **8 results.**

| # | Title (verbatim) | Domain | URL | Snippet |
|---|---|---|---|---|
| 1 | מחשבון שכר נטו 2026 – חישוב ברוטו לנטו \| היום | `israelhayom.co.il` | `https://www.israelhayom.co.il/net-salary-calculator` | none returned |
| 2 | מחשבון שכר - מברוטו לנטו כולל הפרשות והטבות מס (מעודכן 2026) | `taxes-refund.co.il` | `https://taxes-refund.co.il/מחשבון-שכר/` | none returned |
| 3 | מחשבון שכר - חישוב ברוטו נטו - מעודכן לשנת 2026 - Malam-Payroll | `malam-payroll.com` | `https://www.malam-payroll.com/מחשבון-שכר/` | none returned |
| 4 | מחשבון שכר 2026: חישוב ברוטו לנטו | `xn----1hcmgxnk8ede.co.il` (Hebrew IDN) | `https://www.xn----1hcmgxnk8ede.co.il/` | none returned |
| 5 | מחשבון שכר ברוטו נטו 2026 - היידה | `haide-jobs.co.il` | `https://haide-jobs.co.il/מחשבון-שכר-ברוטו-נטו-2026/` | none returned |
| 6 | מחשבון ברוטו נטו 2026 - מחשבון שכר נטו וטבלה | `sfb.co.il` | `https://www.sfb.co.il/en-us/gross-net-calculator` | none returned |
| 7 | מחשבון שכר ברוטו נטו \| מדרגות מס 2026 - חינם \| מחשבונים | `machshevonim.com` | `https://www.machshevonim.com/salary` | none returned |
| 8 | כמה נטו - מחשבון שכר נקי 2026 \| חישוב משכורת נטו | `kamaneto.com` | `https://kamaneto.com/` | none returned |

Instrument summary, verbatim in the part that asserts fact:

> *"As of 2026, the value of each tax credit point is approximately 242 ₪ per month. Income tax in Israel uses
> progressive tax brackets: 10% on the portion up to ₪7,010, 14% on the portion from over ₪7,010 to ₪10,060, and
> continuing up to 50% on income above ₪60,161 per month (2026). … these calculations are estimates only and do
> not replace an official pay slip."*

**Analysis.** Top-3 domains: **israelhayom.co.il, taxes-refund.co.il, malam-payroll.com.** Holders: a national
newspaper (#1), a tax-refund service (#2), **Malam Payroll — the largest payroll bureau in the country** (#3), a
jobs board (#5), a financial site (#6).

**Small independent tool sites: yes, three.** `machshevonim.com` ("מחשבונים" — a general calculator site, #7),
`kamaneto.com` ("כמה נטו" — a single-purpose exact-intent site, #8), and the Hebrew IDN at #4 which is
single-purpose by construction. **This is the first of two pieces of positive constraint-7 evidence in the pull:
sites with no brand, no newsroom and no payroll bureau behind them are on page one of a head term.** Whatever
gates Gumroad Discover (`sale_made`), Apify Store (history of success) and WordPress.org (`active_installs`)
impose, a Hebrew calculator SERP evidently does not impose an equivalent — a new page is not handicapped 100–200×
on day one here. That is the single most useful thing this pull found for `il-biz-tools`.

The cost, recorded honestly: those independents sit at 4, 7 and 8, under a newspaper and Malam. And our page
brands itself `אומדן` in its own H1 badge — an estimate competing with the bureau that produces the real payslip.
The badge is right (the underlying rates carry `verified: false`) and it is a ranking liability. Both are true.

---

### Q3 — `תקרת עוסק פטור 2026`
*Represents:* `osek-patur.html` (title: "מעקב תקרת עוסק פטור 2026 – כמה נשאר עד ₪122,833?"; H1: "מעקב תקרת עוסק
פטור 2026"). Called 18:27 UTC. **6 results.**

| # | Title (verbatim) | Domain | URL | Snippet |
|---|---|---|---|---|
| 1 | תקרת עוסק פטור 2026 - כמה עוסק פטור יכול להרוויח בשנה? | `greeninvoice.co.il` | `https://www.greeninvoice.co.il/magazine/תקרת-עוסק-פטור/` | none returned |
| 2 | עוסק פטור (מושג) – כל-זכות | `kolzchut.org.il` | `https://www.kolzchut.org.il/he/עוסק_פטור` | none returned |
| 3 | פתיחת עוסק פטור \| מדריך לשנת 2026 - ucan2 | `ucan2.co.il` | `https://www.ucan2.co.il/עוסק-פטור/` | none returned |
| 4 | עדכון תקרת עוסק פטור לשנת 2026 - מה זה אומר עבור העסק שלך? - גיל הלוי גולד - רואי חשבון ויועצים | `gmcpa.co.il` | `https://www.gmcpa.co.il/2026/01/14/עדכון-תקרת-עוסק-פטור-לשנת-2026-מה-זה-אומר/` | none returned |
| 5 | מדריך לעסק - עוסק פטור 2026 | `cpa-ea.co.il` | `https://cpa-ea.co.il/blog/mdrihim-osek-patur/hadraha-leosek-patur/` | none returned |
| 6 | עוסק פטור, זעיר או מורשה 2026? המדריך השלם \| יובלים | `yuvalim-finance.co.il` | `https://yuvalim-finance.co.il/osek-patur-zair-morshe/` | none returned |

Instrument summary, verbatim in the part that asserts fact:

> *"For 2026, as of January 1st, the annual turnover ceiling for an exempt business (עוסק פטור) is 122,833 NIS.
> … As part of the 2026 'Micro Business' reform, a business whose turnover does not exceed the ceiling (122,833
> NIS) is entitled to a significant tax benefit: automatic deduction of expenses at a rate of 30% of turnover."*

**Analysis.** Top-3 domains: **greeninvoice.co.il, kolzchut.org.il, ucan2.co.il.** Holders: Green Invoice's
content magazine at #1, Kol Zchut at #2, then three accountant/advisory firms (#4 גיל הלוי גולד רו״ח, #5 cpa-ea,
#6 יובלים) and one business-services site (#3). **Small independent tool site: none. Tools of any kind: none.**

This is `content-seo` §1–3's predicted incumbent set with nothing left over: the NGO encyclopedia, the invoicing
SaaS doing content marketing, and the accountants' blogs, in that order. Two observations that matter more than
the ranking:

- **The number our whole page is built around — ₪122,833 — is stated identically by Green Invoice and Kol Zchut
  on page one.** MISSION constraint 8: the input is public, published, and already free at the top of the SERP.
- **Our page is a different shape from every result: a live running tracker, not an article.** Read optimistically
  that is white space. Read as this SERP reads, Google has chosen articles six times out of six for this intent,
  and a tool may simply be the wrong answer to the question as asked. **The pull cannot distinguish those two
  readings, and the difference is the entire value of the page.** Only deployed page views settle it, which is
  precisely what board build #4 is for.
- Note also the instrument's claim of a 2026 "עסק זעיר / Micro Business" reform with a 30% automatic expense
  deduction. **[SNIPPET] about a summary — not verified, not to be used.** If real it changes what the
  osek-patur page ought to say, and it is flagged for the render queue, nothing more.

---

### Q4 — `מחשבון מע"מ`
*Represents:* `vat.html` (title: "מחשבון מע״מ 2026 – חישוב מע״מ 18% מברוטו לנטו ולהפך"; H1: "מחשבון מע״מ").
Called 18:29 UTC. **8 results.**

| # | Title (verbatim) | Domain | URL | Snippet |
|---|---|---|---|---|
| 1 | מחשבון מע"מ - חישוב מע"מ מכל סכום \| טופס 101 | `tofes101.co.il` | `https://tofes101.co.il/forms/vat-calculator/` | none returned |
| 2 | מחשבון מע"מ \| פלוס מינוס | `plus-m.co.il` | `https://plus-m.co.il/pm-calculators/מחשבון-מעמ/` | none returned |
| 3 | מחשבון מע"מ | `cashdo.co.il` | `https://cashdo.co.il/tools/מחשבון-מעמ` | none returned |
| 4 | מחשבון מע"מ (חישוב מע"מ בקלות) — חישוב | `hishov.co.il` | `https://hishov.co.il/מחשבון-מעמ/` | none returned |
| 5 | מחשבון מע"מ \| Calculators.co.il | `calculators.co.il` | `https://www.calculators.co.il/calculator/Vat-Calculator.html` | none returned |
| 6 | מחשבון מע"מ - חישוב מהיר לסכום המע"מ \| צריח מדיה | `rooks.co.il` | `https://rooks.co.il/vat-calculator/` | none returned |
| 7 | מחשבון מעמ: חישוב או חילוץ, דיווח מקוון ותשלום מע"מ לרשויות המס ב 2026 | `vatcalculator.co.il` | `https://vatcalculator.co.il/` | none returned |
| 8 | מחשבון מע"מ שנת 2026 (לפי 18%) כולל חילוץ המע"מ - חישובים.ישראל | `xn--5dbhficy4f.xn--4dbrk0ce` (חישובים.ישראל) | `https://www.xn--5dbhficy4f.xn--4dbrk0ce/calculators/vat-calculator/` | none returned |

Instrument summary, verbatim in the part that asserts fact:

> *"In Israel, the main VAT rate currently stands at 18%, though this rate may change based on government
> decisions."*

**Analysis.** Top-3 domains: **tofes101.co.il, plus-m.co.il, cashdo.co.il.** Holders: **eight tool pages, eight
out of eight.** No government, no Kol Zchut, no Green Invoice, no accountant blog — the only SERP in the pull
with no incumbent on it at all.

**Small independent tool sites: essentially all of them**, including two on exact-intent domains
(`vatcalculator.co.il` at #7 and the Hebrew IDN `חישובים.ישראל` at #8) and at least four generic calculator
farms. **This is the pull's second and strongest piece of positive constraint-7 evidence: a Hebrew calculator
SERP that is entirely small independent tool sites is a SERP with no ranking gate a new tool cannot clear.**

And it is the pull's clearest constraint-8 finding at the same time. A VAT calculator is one multiplication by a
single public rate. **Eight parties have already built it, they give it away, and two of them bought the exact
domain to do so.** The page cannot be differentiated, cannot be priced, and its *entire* function is reproducible
by anyone — very plausibly including Google itself, inline, above all eight (see limit 3). `vat.html` is entrant
number nine into a market whose price is zero and whose supply is unlimited. It is worth publishing as a traffic
instrument. It is not worth an SEO hour, and it will never be worth a shekel.

---

### Q5 — `דוח מע"מ מפורט PCN874 קובץ`
*Represents:* the `pcn874` line (board build #3, ceiling ₪600) — the term whose cohort is *created by law*.
Called 18:29 UTC. **9 results.**

| # | Title (verbatim) | Domain | URL | Snippet |
|---|---|---|---|---|
| 1 | דיווח מקוון למע"מ - PCN874 - מאגר מידע - iCount | `help.icount.co.il` | `https://help.icount.co.il/reports/pcn874/` | none returned |
| 2 | דוח מע"מ PCN874 חשבשבת H-ERP - Simply Smarter - הנהלת חשבונות וניהול מלאי | `h-erp.co.il` | `https://www.h-erp.co.il/מידע-ללקוחות/שאלות-נפוצות/דוח-מעמ-pcn874/` | none returned |
| 3 | דוח מע"מ PCN874 - חשבשבת בענן | `home.wizcloud.co.il` | `https://home.wizcloud.co.il/help/pcn874/` | none returned |
| 4 | 33 / 1 מדריך להכנת דיווח מקוון למע מ" קובץ PCN874 מהדורה1.51 , | `rivhit.co.il` | `https://www.rivhit.co.il/uploaded_files/documents/pcn874_manual_U1231.pdf` | none returned |
| 5 | נושא מספר עמוד הקדמה - כללי | `downloads.h-erp.co.il` | `https://downloads.h-erp.co.il/files/vatr/Guidance874W.pdf` | none returned |
| 6 | מדריך דיווח מע"מ מפורט — PCN874 | `bitancpa.com` | `https://bitancpa.com/knowledge/detailed-vat-reporting-guide` | none returned |
| 7 | דיווח חשבוניות מקוון רשות המסים בישראל | `gov.il` | `https://www.gov.il/he/pages/tax-vat-online-invoice-reporting` | none returned |
| 8 | מה זה PCN874? הסבר פשוט להגשת דוח מע"מ מקוון לעוסקים מורשים | `linet.org.il` | `https://www.linet.org.il/מה-זה-pcn874-מדריך-מקיף-להגשת-דוח-מעמ-מקוון-ב-2/` | none returned |
| 9 | דווח מע"מ מקוון (PCN 874) - לינט תוכנה לניהול העסק | `linet.org.il` | `https://www.linet.org.il/לינט-תוכנה-לעסק-דווח-מעמ-מקוון-pcn-874/` | none returned |

Instrument summary, verbatim in the part that asserts fact:

> *"רשות המיסים מאפשרת דיווח מע"מ מקוון באמצעות קובץ שנקרא PCN874. PCN874 הוא קובץ אלקטרוני בפורמט טקסט (TXT)
> שמשמש לדיווח חודשי או רבעוני למע"מ באופן מקוון. … דוח זה מפרט, בין היתר, את חשבוניות המס שהעסק הפיק ואת
> חשבוניות המס שהעסק קיבל. הנתונים הנדרשים לכל חשבונית כוללים מספר חשבונית, תאריך, סכום, מע"מ, ומספר עוסק
> ספק/לקוח."*

**Analysis.** Top-3 domains: **help.icount.co.il, h-erp.co.il, home.wizcloud.co.il.** This is the most
informative result in the pull and it points two ways at once.

**Does a PCN874 query return a tool? No. Not one, on nine results.** The SERP decomposes into exactly four
things and none of them is a product a stranger can buy and use:
- **Accounting-software documentation** — iCount's help centre (#1), Hashavshevet/H-ERP's FAQ (#2), Hashavshevet
  in the cloud (#3), Linet twice (#8, #9). Six of nine. Every one of them says: *here is how our software
  produces the file.*
- **Mirrored copies of the Tax Authority's own preparation manual** — Rivhit hosting `pcn874_manual_U1231.pdf`,
  its title carrying the edition string **`מהדורה 1.51`** (#4), and H-ERP hosting `Guidance874W.pdf` (#5).
- **An accountant's knowledge base** — bitancpa (#6).
- **The state** — gov.il's online invoice-reporting page (#7).

**The unserved shape is real, and this is the evidence for it.** Nobody on this SERP sells a standalone
spreadsheet-to-PCN874 converter, and nobody sells a validator. The competition for the term is *documentation*,
not *product* — and documentation is weak SEO competition: help-centre pages and PDFs are not written to rank,
and a genuine Hebrew tool page would be a different and better-matched result type on a query nobody is
contesting commercially. On this evidence `pcn874` has the least occupied SERP of anything the colony owns.

**Two findings the line's director must not read past.**

1. **The spec gate now has named targets.** `skills/revenue-pcn874/SKILL.md` states the gate that outranks the
   ceiling: the ITA specification has not been rendered, because gov.il *and both vendor mirrors* are
   egress-blocked from this container. **This SERP names two mirror URLs verbatim** — `rivhit.co.il/…/pcn874_manual_U1231.pdf`
   (edition 1.51) and `downloads.h-erp.co.il/files/vatr/Guidance874W.pdf` — plus the gov.il page itself. They are
   recorded here as [SNIPPET] search results and **nothing about their contents is claimed**; they belong in
   `.github/workflows/pcn874-spec-watch.yml` as fetch targets for a runner with egress. Until a session reads one
   of them against `docs/SPEC-FROM-SOURCES.md`, no legal figure ships and the seven source disagreements stay
   open. **This pull does not move that gate one millimetre; it only tells the runner where to point.**
2. **The strongest counter-hypothesis to the ₪600 ceiling is sitting in the results.** Six of nine are vendors
   whose software *already emits the file as a feature*. The reason nobody sells a PCN874 tool may not be that
   the market is unserved — it may be that **the cohort legally required to file already owns bookkeeping
   software that produces it**, and the file is a byproduct rather than a purchase. That would make the
   "audience created by law" argument true and irrelevant at the same time: the audience exists, is compelled,
   and is already equipped. **A SERP cannot settle this.** It is a demand question, and the honest cheapest test
   is the board's own build order — publish the free validator, count who downloads it — not a bigger build.

---

### Q6 — `אגרה שנתית רשם החברות 2026`
*Represents:* `registrar-fee.html` (title: "אגרה שנתית לרשם החברות – מתי משלמים ומתי נסגר חלון התעריף המוזל";
H1 carries the badge "בלי סכומים" — the page deliberately ships **without the fee amounts** because
`tax-2026.json` is `verified: false`). Called 18:29 UTC. **9 results.**

| # | Title (verbatim) | Domain | URL | Snippet |
|---|---|---|---|---|
| 1 | אגרה שנתית לרשם החברות והשותפויות - יהודה ארליך ושות' | `erlichj.co.il` | `https://erlichj.co.il/חדשות-ועדכונים/אגרה-שנתית-לרשם-החברות-והשותפויות/` | none returned |
| 2 | חברה פרטית – חובת תשלום אגרה שנתית והגשת דוח שנתי (2026) – ברית פיקוח | `britcpa.co.il` | `https://britcpa.co.il/hozrim/חברה-פרטית-חובת-תשלום-אגרה-שנתית-והגשת-6/` | none returned |
| 3 | תזכורת לתשלום אגרת רשם לחברה או שותפות לשנת 2026 – PKF עמית, חלפון | `ahcpa.co.il` | `https://ahcpa.co.il/תזכורת-לתשלום-אגרת-רשם-לחברה-או-שותפות-5/` | none returned |
| 4 | תשלום אגרה שנתית לחברה לשנת 2026 - גבאי את שלפמן - משרד רואי חשבון | `cpa-gs.co.il` | `https://cpa-gs.co.il/תשלום-אגרה-שנתית-לחברה-לשנת-2026/` | none returned |
| 5 | פתיחת חברה ברשם החברות – המדריך המלא (2026) | `gbs-law.co.il` | `https://gbs-law.co.il/open-company/` | none returned |
| 6 | תשלום אגרה שנתית מופחתת לרשם החברות לשנת 2026 - עד 31.3 - יניר פרקש ושות' | `yfcpa.co.il` | `https://www.yfcpa.co.il/newsletter/תשלום-אגרה-שנתית-מופחתת-לרשם-החברות-לש/` | none returned |
| 7 | אגרת רישום חברה ב-2026- איך חוסכים מאות שקלים? \| DigitaLawyer | `digitalawyer.co.il` | `https://www.digitalawyer.co.il/אגרת-רישום-חברה-ב-2021/` | none returned |
| 8 | לתשומת לב - הזדמנות לחסוך 439 ש"ח באגרת רשם החברות לשנת 2026 | `taxellent.co` | `https://www.taxellent.co/post/לתשומת-לב-הזדמנות-לחסוך-439-ש-ח-באגרת-רשם-החברות-לשנת-2026` | none returned |
| 9 | תשלום אגרה שנתית לחברה או שותפות \| רשות התאגידים | `gov.il` | `https://www.gov.il/he/service/company_partnership_annual_payment` | none returned |

Instrument summary, verbatim in the part that asserts fact:

> *"ניתן לשלם אגרה מופחתת בסך 1,338 ש"ח עד ל-31.03.2026, והחל מה-01.04.2026 התעריף יעודכן לתעריף הרגיל בסך של
> 1,777 ש"ח. … חברה שנרשמה ברשם החברות, פטורה מתשלום אגרה שנתית רק במהלך אותה שנה קלנדרית בה נרשמה."*

**Analysis.** Top-3 domains: **erlichj.co.il, britcpa.co.il, ahcpa.co.il.** Holders: **eight of nine are
professional-services firms** — six CPA practices (#1, #2, #3, #4, #6, #8) and two law firms (#5, #7) — all
publishing the same annual reminder as client-acquisition content. The state's own payment service is **ninth**.
**Small independent tool site: none. Tools of any kind: none.**

This is the purest instance of `content-seo` §1–3's "accountants' blogs" finding in the whole pull, and it is
also where our own page is weakest. Three things follow:

- **The content is not ours to own.** The fee arithmetic is published by at least three results independently —
  #6 names the reduced rate and the 31.3 deadline, #8 names the ₪439 saving in its title (which is exactly
  ₪1,777 − ₪1,338), and the instrument's summary states both figures. Constraint 8 again: every input is public
  and nine parties already publish it.
- **Our page currently offers strictly less than every result on this SERP.** `registrar-fee.html` ships with a
  `בלי סכומים` badge and no amounts, by design, because the rates are unverified. That decision is correct under
  MISSION rule 4 and it means the page cannot answer the question the searcher is asking. **A page that withholds
  the only fact the query wants will not hold a position against six CPA firms that state it.** The board's own
  gate — the registrar reminder is not built as a paid product until the page shows 100 weekly views — is the
  right gate, and this SERP predicts the page will not reach it in its current form.
- **Corroboration worth recording, not acting on.** The ₪1,338 → ₪1,777 arithmetic the board cited in build #6
  is echoed by this SERP from several directions. It is **[SNIPPET] about a summary** and it does **not** meet
  rule 4's bar (two independent GitHub-hosted implementations agreeing). `verified` stays `false`.

---

## 3. What holds across all six

| Query | Top-3 domains | Tools on page 1 | Small independent tool site? | Incumbent shape |
|---|---|---|---|---|
| מחשבון חשבונית עוסק פטור | kolzchut.org.il, greeninvoice.co.il, midrag.co.il | 0 of 7 | **No** | Kol Zchut + invoicing SaaS + accountants; **free competitor (YPAY) on page 1** |
| מחשבון שכר נטו 2026 | israelhayom.co.il, taxes-refund.co.il, malam-payroll.com | 8 of 8 | **Yes — 3** (machshevonim, kamaneto, Hebrew IDN) | newspaper + payroll bureau above the independents |
| תקרת עוסק פטור 2026 | greeninvoice.co.il, kolzchut.org.il, ucan2.co.il | 0 of 6 | **No** | Green Invoice + Kol Zchut + 3 CPA firms |
| מחשבון מע"מ | tofes101.co.il, plus-m.co.il, cashdo.co.il | 8 of 8 | **Yes — effectively all 8** | none — no incumbent present at all |
| דוח מע"מ מפורט PCN874 קובץ | help.icount.co.il, h-erp.co.il, home.wizcloud.co.il | **0 of 9** | **No** | accounting-software docs ×6, ITA manual mirrors ×2, gov.il |
| אגרה שנתית רשם החברות 2026 | erlichj.co.il, britcpa.co.il, ahcpa.co.il | 0 of 9 | **No** | 6 CPA firms + 2 law firms + gov.il ninth |

Four patterns, each supported by more than one query:

1. **Intent splits the set cleanly, and the split runs against us.** The two queries whose intent is *compute
   this number* (`מע"מ`, `שכר נטו`) return nothing but tools and let independents rank. The four whose intent is
   *tell me the rule* (invoice type, ceiling, PCN874 file, annual fee) return no tool at all. **The colony's
   pages that can rank are arithmetic on public constants; the colony's pages that touch an obligation face
   SERPs that Google answers with prose.**
2. **Constraint 8 is visible on four of six SERPs as a live competitor, not as an argument.** Free VAT
   calculators ×8, free net-salary calculators ×8, free invoice issuance (YPAY), the ₪122,833 published by two
   page-one results, the registrar fee published by six. Every input this colony's Hebrew pages use is public,
   and on four terms somebody has already published it free at the top of the page.
3. **The `content-seo` audit's incumbent list is confirmed and one name should be added.** Kol Zchut (Q1 #1,
   Q3 #2), Green Invoice (Q1 #2, Q3 #1) and accountants' blogs (Q1, Q3, Q5, Q6) are all where §1–3 said they
   would be. **iCount belongs on that list as an equal**: #5 on Q1 and #1 on Q5, ranking through a help centre
   rather than a magazine. Two different content strategies from two invoicing SaaS vendors, both effective.
4. **No SERP in this pull is gated on prior success.** MISSION's strongest finding — Gumroad's `sale_made`,
   Apify's history-of-success, WordPress.org's `active_installs` weighting, all rendered, all closing the
   day-one door — has **no analogue visible here**. `kamaneto.com` and `cashdo.co.il` did not need install
   counts. That is the one genuinely encouraging structural fact in this file, and it is why Hebrew organic
   remains a named channel at all.

---

## 4. The two constraint-7 verdicts

MISSION constraint 7: *"a line may not be built before its acquisition channel is named, and the first thing
built on any line is the cheapest test that a stranger can find it."*

### `il-biz-tools` — **channel NAMED and PARTIALLY DEMONSTRATED. Build #4 proceeds as a measurement. The Pro
feature does not.**

The channel passes the naming test with better evidence than any platform channel in this repo: two of six SERPs
are held by small independent tool sites, so a Hebrew calculator page is not structurally barred from page one
and carries no day-one handicap. **That is a real answer to the question MISSION says nobody had answered.**

But the demonstration and the money point in opposite directions. **The two SERPs a new tool can enter are the
two whose product is free arithmetic on a public constant** — 18% VAT, published tax brackets — and both are
saturated (eight competitors each, two exact-match domains). **The one page on the site that takes money, the Pro
invoice/receipt PDF, faces a SERP with zero tools, Kol Zchut at #1, two invoicing SaaS vendors, two accountants —
and a free invoicing product at #7.** The osek-patur and registrar SERPs are the same shape: no tools, incumbents
holding, and our registrar page shipping without the fact the query asks for.

Ruling: the board's build #4 is correct as written — **deploy, switch Paddle to Gumroad, measure page views** —
because it is a measurement and this pull says the measurement is worth taking. **No SEO hour goes into
`invoice.html`, and the ₪400 target keeps its `contradicted` grade**, because nothing here shows a paying buyer
arriving from search; it shows free tools ranking and paid ones absent. The pages worth publishing are worth
₪0 by construction; the page worth money has the worst SERP of the six.

### `pcn874` — **channel NAMED and BEST-EVIDENCED IN THE PULL. Build #3 proceeds in the board's stated order,
validator first. The spec gate still outranks it.**

Nine results, zero tools. The shape the board bet on — a standalone spreadsheet-to-PCN874 converter, and a free
validator in front of it — **is not served by anybody on this SERP**, and the competition for the term is
documentation and PDFs rather than optimised commercial content. Combined with pattern 4 (no prior-success gate),
this is the strongest constraint-7 position the colony has measured on any line.

Three qualifications that travel with the verdict and must not be dropped:

1. **The spec gate is untouched.** `SKILL.md` is unambiguous: no legal figure ships until the ITA specification
   is read. This pull produces **search results about mirrors**, which is not a rendering. Its contribution is
   two named URLs plus an edition string (`מהדורה 1.51`) for `pcn874-spec-watch.yml` to fetch from a runner with
   egress.
2. **"Unserved" is not "wanted".** Six of nine results are vendors whose software already emits the file. The
   cohort is compelled by law *and* already equipped by software. This SERP cannot tell the two apart, and it is
   the single most important open question on the line.
3. **The board's own order is the right test.** Free validator on GitHub and npm under the brand, count the
   downloads, and only then build the generator. That is the cheapest test that a stranger can find it, and this
   pull gives no reason to reorder it.

---

## 5. What this measurement is not

**Six queries are an instrument reading, not a demand estimate.** Stated plainly because the failure mode this
repo keeps producing is a number nobody checked:

- **There are no volumes here.** Not one query in this file carries a monthly search volume. `מחשבון מע"מ` might
  be searched fifty thousand times a month in Israel or five hundred; nothing above distinguishes those, and the
  difference is the whole business case.
- **There are no clicks here.** Position is not traffic. With ads, an AI Overview, a People-Also-Ask block or
  Google's own inline calculator above the fold — none of which this instrument can see — a first organic
  position can deliver a small fraction of the clicks its rank implies.
- **There is no conversion here.** Even a visitor to `invoice.html` is not a buyer, and no page of ours has ever
  been visited by a stranger.
- **The locale is wrong.** US-only retrieval on Hebrew queries. The composition of the result sets is probably
  robust; the ordering is not, and no argument above depends on a specific position.
- **Nothing was rendered.** Everything is [SNIPPET]. Not one of the 47 results was opened, by instruction.

**The numbers a real decision needs — search volume, click-through, and a conversion rate on our own pages — are
not in a SERP and cannot be extracted from one.** They come from the deployed site's page views (board build #4,
PostHog cookieless) and from the free validator's download count (build #3). Until those have rows, every ceiling
on both lines remains an estimate of an untested market, exactly as `BOARD.md` §9 says.

---

## 6. Evidence that would change these verdicts, cheapest first

1. **Page views on the deployed `il-biz-tools`.** Board build #4. Settles the Q3/Q4 ambiguity — whether a tool on
   an informational SERP gets traffic — with real numbers instead of inference. Costs nothing but the deploy.
2. **Download count on the free PCN874 validator.** Board build #3, step 1. The only thing that can distinguish
   "unserved" from "unwanted" on Q5. Also costs nothing.
3. **One fetch of `rivhit.co.il/uploaded_files/documents/pcn874_manual_U1231.pdf` or
   `downloads.h-erp.co.il/files/vatr/Guidance874W.pdf` from a runner with egress.** Does not change a
   constraint-7 verdict; it opens the gate that outranks the pcn874 ceiling.
4. **Search volumes for the six terms, from any source that publishes them.** The one input that would turn this
   instrument reading into a demand estimate. Not available to this container and not obtainable by scraping
   Google, which the mandate forbids.
5. **A second pull in three months on the same six terms**, to see whether any position is contestable at all
   over time — but only after the site is deployed, since a pull about pages nobody hosts measures nothing.

---

## 7. For `docs/INCOME_PLAN.he.md` — 100 words

> **מדידת SERP בעברית — 7.9.2026, שש שאילתות, כולן SNIPPET.** שתי שאילתות המחשבון (מע״מ, שכר נטו) מוחזקות
> כולן בידי אתרי כלים עצמאיים קטנים — הוכחה שדף חדש בעברית יכול לדרג בלי היסטוריית פלטפורמה. אבל אלה בדיוק
> הדפים שמחירם אפס: שמונה מחשבוני מע״מ חינמיים, שניים על דומיין תואם. ארבע השאילתות שנוגעות לכסף — חשבונית
> עוסק פטור, תקרת עוסק פטור, PCN874, אגרה שנתית — מחזירות **אפס כלים**: כל־זכות, Green Invoice, iCount ו־YPAY
> (חשבונית חינם) ושמונה משרדי רו״ח. PCN874: תשע תוצאות, אף כלי — הצורה באמת לא מוצעת, אך שישה מהם ספקי תוכנה
> שכבר מפיקים את הקובץ. שש שאילתות הן קריאת מכשיר, לא אומדן ביקוש.
