# Scout notes — productized-services / pdf-ocr

**Criterion:** PDF, OCR and document-extraction pipelines including Hebrew OCR — accuracy
reality, existing services, and paying buyers.

**Scout:** WORKER-SCOUT `pdf-ocr`. **Date of research:** 2026-09-03.
**Web-search budget spent: 8 of 8 (the cap).** No search was refused. Plus free GitHub
repo/code search and 4 WebFetch attempts (2 rendered, 2 EGRESS_BLOCKED).

## Evidence grading used below
- **[RENDERED]** — I fetched the page/file and read the text. Strong.
- **[RENDERED-2ND]** — I rendered a public repo file that *quotes* a vendor's page. Strong for
  "someone wrote this down", weaker for "the vendor says this today".
- **[SNIPPET]** — only a search-result summary quoting a page I could not open. Weak; the URL a
  human must open is named.
- **[BLOCKED]** — fetch refused by the egress proxy.

Nothing below rests on my own memory. Where I could only infer, it is marked low confidence.

---

## 1. The market map — what OCR costs and how good it is

**[RENDERED]** https://raw.githubusercontent.com/dantetemplar/pdf-extraction-agenda/main/README.md
(fetched 2026-09-03). A maintained comparison table of PDF-extraction tools with prices and
OmniDocBench / dp-bench scores. Verbatim extracts:

| Service | Benchmark | Price |
|---|---|---|
| Mistral OCR | OmniDocBench overall 0.268 | **$1 per 1,000 pages** |
| Azure OCR | dp-bench NID 87.69 | $1 per 1,000 transactions |
| Google Document AI | dp-bench NID 90.86 | $1.50 per 1,000 pages |
| Amazon Textract | dp-bench NID 96.71 | $1.50 per 1,000 pages |
| Upstage AI | dp-bench NID 97.02 (highest) | $10 per 1,000 pages |
| LlamaParse | dp-bench NID 92.82 | free 1,000 pages/day, then $3/1,000 |
| Mathpix | OmniDocBench 0.191 | $5 per 1,000 pages |
| Marker (API) | OmniDocBench 0.296 | $3 per 1,000 pages, min $25/month |
| Unstructured | OmniDocBench 0.586 | $2–$30 per 1,000 pages |
| Zerox | — | $2 per 1,000 pages |
| MinerU / dots.ocr / PP-StructureV3 / MonkeyOCR / PaddleOCR-VL | 0.125–0.145 (best OSS) | **free, self-hosted, permissive licences** |

The same README explicitly contains **no mention of Hebrew or any RTL script**.

**[RENDERED-2ND]** https://github.com/programminghistorian/jekyll `en/lessons/ocr-with-google-vision-and-tesseract.md`
(via GitHub code search, 2026-09-03) quotes Google Vision: *"only free for the first 1000 pages
per month. After that, it costs $1.50 per 1000 pages."*

**[RENDERED-2ND]** https://github.com/link-assistant/hive-mind `docs/case-studies/pdf-failure-issue-655/OCR_TOOLS.md`
quotes Azure: *"Read API: $1.50 per 1000 pages / Layout API: $10 per 1000 pages."*

**[RENDERED]** https://raw.githubusercontent.com/getomni-ai/benchmark/main/README.md — the
best-known OCR benchmark repo (639 stars). It documents methodology (JSON accuracy =
`1 - diff_fields/total_fields`; Levenshtein for text) and the model list (Claude, GPT-4o,
Gemini, Qwen, Llama, Gemma, AWS, Azure, Google, Unstructured) but **carries no accuracy numbers
in the README and no Hebrew/non-Latin breakdown**. The numbers live at
https://getomni.ai/blog/ocr-benchmark — **a human must open that URL**; the domain was not tried
because the budget was gone.

**Structural conclusion (high confidence):** raw page-to-text is a **commodity priced at
$1–$1.50 per 1,000 pages**, with free permissively-licensed models (MinerU, PaddleOCR-VL,
dots.ocr) scoring *better* than several paid services. There is no margin in reselling OCR.

## 2. Hebrew specifically — the accuracy reality

**[SNIPPET]** https://mistral.ai/news/ocr-4/ (Mistral OCR 4, released 2026-06-23), via search
2026-09-03: 170 languages across 10 script groups, **Hebrew named explicitly**, with the claim
that the "widest gains" are on "rare and low-resource scripts (Hebrew, Greek, Gujarati, Tamil,
Malayalam, Kannada, Telugu) where many competing systems degrade". Claimed 85.20 OlmOCRBench,
93.07 OmniDocBench, 72% human win-rate over 600+ docs in 12+ languages.
**This is vendor marketing seen only in snippet form.** URLs a human must open to close it:
https://mistral.ai/news/ocr-4/ and https://venturebeat.com/data/mistral-launches-ocr-4-turning-document-extraction-into-a-full-enterprise-ai-play

**[SNIPPET]** Free Hebrew OCR already exists at consumer level: https://www.i2ocr.com/free-online-hebrew-ocr
and https://www.i2ocr.com/pdf-ocr-hebrew ("free online OCR ... Hebrew text from images ...
optional bulk OCR"; premium bulk tier for larger jobs). Seen 2026-09-03, page not opened.

**[SNIPPET]** Hebrew *manuscript* HTR is a served niche: https://www.transkribus.org/hebrew-manuscript-transcription
— "models for Hebrew square script, Sephardic semi-cursive, rabbinic hands and Yiddish ...
**11 community models** including DiJeSt and IGRA Sfardi", one trained on Sephardic burial
records "ideal for genealogical research". Also eScriptorium (open, academic).

**[BLOCKED]** https://www.ezrabrand.com/p/ocr-odyssey-taming-text-recognition — the one
independent Hebrew-practitioner write-up I found ("OCR Odyssey: Taming Text Recognition for
Hebrew Classics"). **A human must open this**; it is the best candidate for a real
non-vendor Hebrew accuracy verdict.

**Open-source Hebrew OCR is essentially barren.** GitHub repo search `hebrew OCR`
(2026-09-03, 101 results) — the entire top of the list, by stars:
- https://github.com/Lotemn102/HebHTR — 57 stars, **archived**
- https://github.com/Sivan22/TrOCR-Hebrew — 11 stars, "in development"
- https://github.com/aiviewz/Synthdog-RTL — 9 stars (RTL synthetic data generator)
- https://github.com/yaacov/hebocr — 6 stars, last real work 2015
- https://github.com/HebrewBooks-2026/win-ocr — 5 stars, created 2026-06, active: local
  Hebrew/Aramaic OCR (Tesseract + Windows OneOCR) with a Rashi-script corrector, for HebrewBooks
- https://github.com/moshefurman/Hebrewbooks-TextLayers — 2 stars, corrected OCR text layers for
  the HebrewBooks corpus
Everything else in the list is 0–2 stars and student-project shaped.

GitHub repo search `israeli invoice receipt OCR hebrew extraction` returned **exactly one repo**:
https://github.com/peleg-jpg/israeli-receipt-scanner (0 stars, created 2026-05-11) — parses
Israeli receipts for merchant, date, NIS total, VAT, invoice number, osek murshe number.

**Reading:** Hebrew OCR was a real gap; as of mid-2026 the frontier VLM/OCR vendors claim to have
closed it at commodity price. Nobody has built an open Hebrew stack because nobody needs to any
more. A "we do Hebrew OCR" product therefore has **no moat and no price above $1/1,000 pages**.

## 3. Israel — the buyers exist but the seats are taken

Search 2026-09-03, Hebrew query "סריקת חשבוניות אוטומטית OCR עברית הנהלת חשבונות ישראל שירות".
All **[SNIPPET]**; every one of these hosts is likely egress-blocked and none was opened.

| Vendor | What it is | URL a human must open |
|---|---|---|
| SUMIT | accounting platform; **bundles** OCR expense scanning (supplier ID, date, amount, doc number) | https://help.sumit.co.il/he/articles/5833251-... |
| Rivhit | accounting platform; markets invoice scanning as ending accountant↔owner meetings | https://www.rivhit.co.il/סריקת-חשבוניות/ |
| FinBot | AI invoice scanning + classification, **claims 97% accuracy**, app in Hebrew/English/Arabic/Russian | https://www.fin-bot.co.il/ai-חשבונאי/ |
| PrioriOCR (Eshkol IT) | supplier-invoice OCR-AI into ERP | https://eshkol-it.co.il/priori-ocr/ |
| Payper | invoice-OCR explainer + product | https://payper.co.il/static/article/סריקת_חשבוניות_OCR_פייפר |
| Storenext | OCR system | https://www.storenext.co.il/ocr-מערכת/ |
| Scanbook | bureau document/invoice scanning service | https://scanbook.co.il/document-scanning-company/scanning-and-ocr-services/invoice-scanning/ |

The 97% figure is FinBot's own marketing quoted in a snippet. Do not repeat it as fact.

**This is the decisive fact for the Israeli angle:** the OCR is **bundled free inside the
bookkeeping platform the buyer already pays for** (SUMIT, Rivhit). A no-brand outsider cannot
sell a standalone Israeli invoice scanner into that.

### The regulated boundary (matters for ToS/legal)
**[SNIPPET]**, 2026-09-03. Israeli law lets a *scan* replace the original document only under
תקנות/הוראות מס הכנסה (ניהול פנקסי חשבונות) התשל"ג-1973 — scanning per the rules of **נספח ו'**
to section 36, and digital-archive retention per **נספח ז'**, in force since **1 January 2013**;
the same snippet set names Tax Authority circular 933502. Sources seen:
- https://www.mekler.co.il/links/item/3139-... (Boaz Mekler CPA, "סריקת מסמכים וארכיב דיגיטלי")
- https://www.comsign.co.il/tax-regulations-digital-archiving/
- https://he.wikisource.org/wiki/הוראות_מס_הכנסה_(ניהול_פנקסי_חשבונות) — **[BLOCKED]**, tried and refused
- https://www.nevo.co.il/law_html/law01/255_179.htm — not tried, budget gone

Consequence: a product that says "scan and throw away your paper" is making a **regulated legal
claim** and is AMBER at best for us. A product that says "extract the fields, keep your
originals" is clean.

### The demand context we already own (rendered by sibling scouts, not by me)
- From `israel-bureaucracy--vat-reporting.md`: from **1 Jan 2026 an individual osek with turnover
  above ₪500,000 must file the detailed PCN874 report** (SNIPPET-grade there too; URL to close it:
  https://www.gov.il/he/pages/pa280825-1). That drags a new cohort into per-invoice data entry.
- From `israel-bureaucracy--allocation-numbers.md`: allocation-number threshold falls to
  **₪5,000 from June 2026** (RENDERED from three independent repos).
Both increase the number of invoice records that must be keyed. Both are also exactly what the
incumbent platforms above are built to absorb.

## 4. Where a software-only outsider could actually take money

### Apify Store (the colony already ships an actor there)
Search 2026-09-03 "Apify store PDF OCR actor pay per event". **[SNIPPET]** — the category is
already populated and partly abandoned:
- https://apify.com/valek.josef/document-ocr — **[DEPRECATED]** in its own title
- https://apify.com/actor4you/ai-data-extraction-from-pdf/api — **[DEPRECATED]**
- https://apify.com/memo23/pdf-text-extractor , https://apify.com/automation-lab/pdf-text-extractor ,
  https://apify.com/gochujang/pdf-text-extractor/api — live
- https://apify.com/cspnair/pdf-ocr-api — multi-engine (Google Vision / DeepSeek OCR / Textract),
  snippet quotes **~$5 per 100 pages, ~$40 per 1,000 pages**
- https://apify.com/junipr/image-to-text — snippet quotes **$5.20 per 1,000 images ($0.0052/image)**
- https://apify.com/vivid_astronaut/ocr-pdf-extractor — "12+ languages"
No Hebrew-specific actor appeared in the results. Prices charged are **3–40× the underlying
$1/1,000-page cost**, which is the one genuinely encouraging number in this criterion.
Apify payout terms are already RENDERED in `agent-markets--apify.md`: 80% dev share, **$20
minimum via PayPal/Wise**, KYC with a photo ID. → **Israel-payable YES.**

### x402 (the colony already ships an endpoint)
From `agent-markets--x402-economy.md` (RENDERED there): ~150 live x402 services priced
$0.001–$0.02/call. A per-page document endpoint fits the shape. Volume unproven.

### RapidAPI
From `agent-markets--rapidapi.md` (RENDERED-2ND there): **25% marketplace fee**, PayPal payouts,
thresholds undocumented, heavy listing clutter. Payability to Israel **UNKNOWN** — every
first-party payout page is egress-blocked.

## 5. Things I checked and found empty
- GitHub repo search `israeli bank statement parser pdf` → **0 results**. Israeli bank data is
  solved by *scraping*, not PDF parsing: https://github.com/eshaham/israeli-bank-scrapers
  (1,100 stars, updated 2026-09-03) plus a live ecosystem (asher-mcp, Actual-Budget importers).
  Scraping banks is not ours to recommend anyway.
- GitHub code search `Hebrew OCR CER accuracy tesseract heb evaluation` → API error
  (503 "too many shards failed"). Not retried. **No character-error-rate figure for Hebrew was
  obtained from any source.** This is the single biggest hole in this scout.
- GitHub issue search for Hebrew/RTL reversed-text extraction bugs → 0 results with two query
  shapes. I believe the RTL logical-order problem is real but **I have no evidence for it**, so
  it is not reported as a finding.
- Hebrew legal-document / נסח טאבו extraction: the 8th search returned only Wikipedia OCR pages
  and Tabu *issuing* services (https://mekarkein-online.justice.gov.il/, datahelp.co.il,
  mazekal.co.il, home.tabu.co.il). **No Israeli legal-document extraction vendor and no evidence
  of a buyer.** Genuinely unknown, not empty.

## 6. Honest verdict for the supervisor
This criterion is **mostly a dead end, for a specific and checkable reason**: the technology
became a commodity ($1/1,000 pages, Hebrew included, free OSS models scoring higher than paid
services) at the same time as the Israeli buyer-facing seat was taken by accounting platforms
that give the same OCR away inside a subscription. The only non-zero opening is arbitrage on a
marketplace that already has paying traffic (Apify), where sellers demonstrably charge 3–40×
the underlying cost — and that is a few hundred shekels a month, not a pillar of 20,000.

## 7. URLs a human or unblocked agent must open to close this scout
1. https://getomni.ai/blog/ocr-benchmark — actual per-model accuracy numbers
2. https://www.ezrabrand.com/p/ocr-odyssey-taming-text-recognition — independent Hebrew verdict
3. https://mistral.ai/news/ocr-4/ — confirm the Hebrew claim and current per-page price
4. https://www.nevo.co.il/law_html/law01/255_179.htm — נספח ו'/ז' scanning rules, verbatim
5. https://www.fin-bot.co.il/ai-חשבונאי/ and https://www.rivhit.co.il/סריקת-חשבוניות/ — is the
   Israeli invoice-OCR really bundled, and at what price
6. https://apify.com/cspnair/pdf-ocr-api — real run counts / user counts on an OCR actor
