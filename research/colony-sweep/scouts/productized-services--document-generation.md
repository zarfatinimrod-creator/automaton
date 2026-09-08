# WORKER-SCOUT "document-generation" — productized-services group

Sweep date: 2026-09-03. Scout: Opus 5.
Criterion: **Document and form generation (contracts, invoices, letters, official forms):
demand, and the precise line where this becomes regulated legal or tax advice in Israel.**

---

## 0. Method, budget and evidence tiers — read before trusting anything below

- **Web searches spent: 7 of the 8 allowed.** One held in reserve, unused.
- **Egress proxy blocked** every Israeli primary source I tried and the statute mirrors:
  `he.wikisource.org` returned `EGRESS_BLOCKED` on direct WebFetch (2026-09-03). `gov.il`,
  `nevo.co.il`, `knesset.gov.il` were surfaced only as search-result links, never rendered.
- **What did render:** the GitHub API (`search_code`, `search_repositories`) and WebFetch
  against `github.com` / `raw.githubusercontent.com`.
- Evidence tiers used per claim below:
  - `[rendered]` — I fetched the page and read it.
  - `[snippet]` — a search-result summary quoting a page I could not open.
  - `[repo]` — source code / data committed by a third party to a public GitHub repo.
    Better than an SEO blog, dated and quotable, but it is **that developer's summary**,
    not the statute.
  - Nothing here comes from my own memory. Where I had no source I wrote "unknown".

---

## 1. THE LINE — where document generation becomes reserved legal practice in Israel

### 1.1 The statute: s.20 of חוק לשכת עורכי הדין, תשכ"א-1961 (ייחוד המקצוע)

`[snippet]` WebSearch 2026-09-03, summarising the wikisource/nevo/knesset texts:

> "Section 20 specifies that **drafting legal documents for another person**, including
> representing another person in legal negotiations to prepare such a document, is among the
> activities that must only be performed by lawyers."

Sources surfaced (NONE rendered — a human must open these to close the claim):
- https://he.wikisource.org/wiki/חוק_לשכת_עורכי_הדין (blocked to me: EGRESS_BLOCKED)
- https://www.nevo.co.il/law_html/law01/p179_001.htm
- https://fs.knesset.gov.il/4/law/4_lsr_209049.PDF (the 1961 law as published)
- https://www.colman.ac.il/teaching/our-centers/institute-for-ethics/article-uniqe/

### 1.2 The controlling case — and it is *good news*, not bad

`[repo]` `lalomavi-collab/desktop-tutorial`, file `lalum-app/src/data/rulings.json`,
fetched via raw.githubusercontent 2026-09-03
(https://raw.githubusercontent.com/lalomavi-collab/desktop-tutorial/df384e8533c7e30c360792b5315d6fd1f083e140/lalum-app/src/data/rulings.json):

> **ע"א 4223/12 — המרכז למימוש זכויות רפואיות בע"מ ולבנת פורן נ' לשכת עורכי הדין בישראל**,
> בית המשפט העליון (ארבל, עמית, שהם), **25.6.2014**.
> Three criteria decide whether a service crosses into s.20 territory:
> (1) **היקף שיקול הדעת הכרוך בביצוע הפעולה** — the scope of discretion the act requires;
> (2) the potential public harm from substandard service;
> (3) whether citizens have alternative ways to assert the right.
> Holding as summarised in the repo: **"rights analysis and selection among legal strategies
> require attorney consultation exclusively, while form completion and routine document
> drafting were permitted."**

Same repo, `lalum-app/supabase/functions/lalum-assistant/rulings.data.ts`, tags the ruling
`["ייחוד המקצוע", "סעיף 20 לחוק לשכת עורכי הדין", "Legal Tech", "מיצוי זכויות"]`.

Caveat, stated plainly: this is **a third party's summary of the judgment inside their
product's seed data**, not the judgment. It is consistent with the s.20 snippet in §1.1 and
with the search summary that the section has been used to stop non-lawyers, but a build that
sits near the line must be checked against the actual ע"א 4223/12 text.

### 1.3 The operational line, stated as a rule we can code against

| Side | What it looks like | Verdict |
|---|---|---|
| **Permitted** | A blank or parameterised **template** the buyer fills in himself; mechanical **form completion** from data the user supplied; arithmetic; a document the user is the author of | GREEN, per the 4223/12 discretion test `[repo]` |
| **Reserved** | Choosing **which** legal instrument or strategy fits this person's situation; drafting a document tailored to a named person's dispute; a demand letter / claim / will produced for a specific client; negotiating on their behalf | RED — s.20 `[snippet]` |

The discriminator is **discretion exercised on behalf of an identified person**, not the file
format and not whether an LLM wrote it. "AI-generated" is not a defence and not an aggravator.

### 1.4 The second line: tax

`[snippet]` WebSearch 2026-09-03 on **חוק הסדרת העיסוק בייצוג על ידי יועצי מס, תשס"ה-2005**:

> "a person cannot engage in **representing taxpayers before a tax authority** unless they are
> a registered tax consultant with a valid licence under this law, or are authorised to
> represent taxpayers under another law."

Sources surfaced, not rendered:
- https://www.nevo.co.il/law_html/law01/999_387.htm
- https://he.wikisource.org/wiki/חוק_הסדרת_העיסוק_בייצוג_על_ידי_יועצי_מס
- https://he.wikipedia.org/wiki/יועץ_מס

Operational reading: what is reserved is **representation before רשות המסים** — filing on
someone's behalf, standing for them, arguing an assessment. **Computing a number and handing
the user a filled form he files himself is not representation.** This is exactly the line our
shipped `products/il-biz-tools` already sits on the safe side of, and it must stay there.

### 1.5 The third line: marketing, not licensing — FTC v. DoNotPay

`[snippet]` FTC press release 2026-02 (finalised order), WebSearch 2026-09-03:
https://www.ftc.gov/news-events/news/press-releases/2025/02/ftc-finalizes-order-donotpay-prohibits-deceptive-ai-lawyer-claims-imposes-monetary-relief-requires
and case page https://www.ftc.gov/legal-library/browse/cases-proceedings/donotpay

> DoNotPay pays **$193,000** in monetary relief, must notify 2021–2023 subscribers, and is
> **prohibited from advertising that its service performs like a real lawyer unless it has
> sufficient evidence**. The FTC found it "never tested whether its output matched the quality
> of a licensed attorney's work" and that documents "contained errors and might not have been
> legally valid".

The lesson for us is a **copy rule**, and it is binding on every storefront we open in this
criterion: never claim lawyer-equivalence, never imply legal validity we have not tested, and
never let a landing page say "legally binding" about output we generated. Under our
constitution this is not merely a legal risk, it is the honesty rule.

---

## 2. DEMAND — what people actually search for and buy

### 2.1 Israeli demand, from a competitor's own SEMrush export committed to GitHub

`[repo]` `The-new-ben/nadlan-strategy-hub`, `.lovable/reports/report-3a-real-semrush.md`
(also mirrored in `The-new-ben/nad-lan-co-il` `handoff/lovable/2026-06-23-war-room-sync/reports/`),
GitHub code search 2026-09-03:

> `|20 | חוזה שכירות | 3,600 | 18 | $1.10 | wide open |`
> (columns: keyword, monthly impressions/volume, keyword difficulty, CPC, competing domains)

and, from the same org's `project-control/content-expedition-log-2026-07.md`:

> "Strike-zone gold that maps to our own tools: **\"הסכם גירושין\" (1,590 imp, pos 7.9),
> \"חוזה שכירות אונליין\" (pos 6.3)**, \"חיפוש עורך דין\" (pos 7.5)."
> "Competitor agent: din.co.il leads on SCALE (5,574 lawyers, 341K Q&A) but has NO AI intake,
> NO document upload, NO price transparency"

Reading: **~3,600/month for חוזה שכירות at KD 18 and "wide open"** is real, low-competition
Hebrew demand for a lease-contract document. It is one keyword, from one competitor's export,
so treat the absolute number as indicative, not audited. The same org ships a live catalogue
of 50 Hebrew document tools (`The-new-ben/justice-theme`, `assets/js/legal-tools-app.js`:
`"TOOL CATALOG - 50 live tools with bilingual generator templates"`, entries include
`residential-lease` / "חוזה שכירות למגורים", `simple-will` / "טיוטת צוואה פשוטה",
`hearing-request` / "בקשה לשימוע לפני פיטורים") — i.e. **an Israeli competitor already
occupies this niche and monetises it as lawyer lead-gen**, which is a business model we cannot
run (it needs humans).

### 2.2 Global template demand — real but the numbers are vendor marketing

`[snippet]` WebSearch 2026-09-03, insightagent.app guides (an SEO/marketing site, **not** Etsy):
> "Business templates including invoice, proposal, and contract templates are among the
> best-selling categories, with prices ranging from **$12–$45**… sellers typically price
> templates in the **$8–$20** range, and shops with 20–30 listings can hit **$3,000–$6,000/month**."

I am flagging the $3–6k/month claim as **unreliable**: it comes from a site that sells advice
to Etsy sellers and has an interest in the number being large. The **price band $12–45** is
corroborated by live Etsy listing titles in the same result set
(https://www.etsy.com/listing/1681347954/freelance-invoice-canva-template-instant) and is the
only part I would plan against.

### 2.3 Developer demand for document APIs — priced, crowded, and RTL-blind

`[snippet]` WebSearch 2026-09-03 across vendor pricing pages:
- **PDFMonkey** (https://pdfmonkey.io/pricing/): Free 20 docs/mo; Starter €19/mo 300 docs;
  Pro €49/mo 3,000; Pro+ €99/mo 5,000; Premium €299/mo 60,000.
- **Documint** (via Capterra): from $30/mo (200 docs) + $0.15/extra doc; Gold $80; Platinum $150.
- **Anvil**: $0.10 per PDF, pay-per-use.
- **DocuSeal**: Pro $20/user/mo, **$0.20 per API document completion**.
Comparison listicles from Nutrient, CraftMyPDF, pdfnoodle, pdfapihub all published "best PDF
generation API 2026" round-ups — i.e. **at least 8 funded incumbents fighting over this term.**

### 2.4 The one genuine technical gap I could verify: Hebrew/RTL rendering is still broken

`[rendered]` https://github.com/foliojs/pdfkit/issues/219 — "Right-to-Left (RTL) support for
Hebrew and Arabic", **opened 5 April 2014, still OPEN** as of 2026-09-03, labels `fonts`,
`word wrapping`. Twelve years unresolved in the most-used Node PDF library.

`[rendered]` https://github.com/diegomura/react-pdf/issues/2900 — "Bidi issue with RTL
languages (Hebrew, Arabic)", opened 9 Oct 2024, now closed, related PR #3303 (closed).
Quote from the reporter: *"After the bidi support integrated everything is much easier for RTL
languages. At the same time, an issue (glitch) occurs when you try to add a `<Text>` element
inside another `<Text>` element."*

`[snippet]` corroborating threads: aspose forum "Hebrew text become reversed after RTL to PDF
conversion using .NET" (https://forum.aspose.com/t/hebrew-text-become-reversed-after-rtl-to-pdf-conversion-using-net/207929),
IBM support "Right to Left (RTL) Languages Produce Mirrored Text"
(https://www.ibm.com/support/pages/right-left-rtl-languages-produce-mirrored-text),
Adobe community "RTL Hebrew text appears reversed in Acrobat Compare Files tool",
and a 2026-03-09 post "I built a library to fix RTL (Hebrew/Arabic) text rendering in
@react-pdf/renderer — broken since 2019" (techresolve.blog).

Consensus in those results: **headless Chrome (Puppeteer) is the only reliable path** because
the browser implements the Unicode bidi algorithm properly; the pure-JS PDF libraries do not.

This is the sharpest thing in the whole criterion: a **specific, dated, decade-old, verifiable
defect** that sits exactly on top of our home market's language.

### 2.5 Freelancer proposal/contract SaaS — weak evidence, do not plan on it

`[snippet]` WebSearch 2026-09-03 returned only SEO listicles (questera.ai, superframeworks,
ideaproof.io, flowjam, microgaps) claiming a "$29/month proposal generator" and "$5k–$20k MRR
with 50–200 customers". **No named product, no revenue page, no founder post.** These are
idea-list content farms. I record the claim and mark it low confidence; it is not evidence.

---

## 3. THE INVOICE SUB-CRITERION — why it is not the easy win it looks like

Israeli tax-document issuance is already covered in depth by the sibling scout
`payment-rails--invoicing-obligations.md` (same sweep). Its rendered-repo findings that bear
on document *generation*:

- Israel runs a **continuous-transaction-control** regime: a tax invoice above threshold needs
  an **allocation number (מספר הקצאה)** from the Tax Authority platform before the buyer can
  deduct input VAT (regime began May 2024).
- SHAAM document types: **300 (transaction) and 330 (credit) do NOT require an allocation
  number; 305/310/320/332 (and v2 codes 340/345/348) DO** — quoted there from
  `skills-il/accounting` `israeli-e-invoice/scripts/validate_invoice.py`.
- Two repos **disagree** on the numbering table, and Green Invoice/Morning uses a *third*,
  private namespace (`// Document type 400 = קבלה`, `Creepie132/trinity`).

Consequence for this criterion: generating a **legally-operative Israeli tax invoice** for
third parties means integrating a state CTC platform, matching a document-type table whose
public sources contradict each other, and competing with entrenched incumbents (Green
Invoice/Morning, iCount) that own the accountant channel. **AMBER for a no-brand entrant.**
What is left clean is the **non-operative** end of the same shelf — proforma / הצעת מחיר /
דרישת תשלום / delivery note — which carries no allocation-number duty and no monopoly.

---

## 4. FINDINGS (the same six returned in the structured output)

1. **Hebrew/RTL-correct document rendering API** — the one defensible build. §2.4.
2. **Hebrew fill-it-yourself template packs sold as files** — safest legal structure. §1.3, §2.1, §2.2.
3. **Non-operative business documents for Israeli sellers** (quote/proforma/delivery note) — §3.
4. **Personalised Hebrew legal documents for a named client** — RED. The boundary itself. §1.1–1.3, §1.5.
5. **Filing/representing before רשות המסים** — RED. §1.4.
6. **Generic English document-generation API** — commodity, no wedge for a no-brand entrant. §2.3.

---

## 5. Owner blockers (one-time, human-only) — none new to this criterion

Every rail these findings would use is already catalogued by sibling scouts:
- Etsy: Etsy Payments direct to Israeli bank in ILS = **YES**; Payoneer path **not** available
  to Israel; Israel fee is **4.5% + ₪2.00** per sale (`storefronts--etsy-digital.md`).
- Gumroad: Israel is in the payout table, **ILS bank deposit**, verified from Gumroad's own
  open-source repo; **PayPal checkout cannot be offered by an Israeli seller**
  (`storefronts--gumroad.md`).
- Paddle / x402 / Telegram Stars / Apify: already shipped and proven in `products/`.
So the blockers are the ordinary ones: **identity/KYC at the storefront, proof of Israeli
residence, and an Israeli bank account in Latin characters**. I found **no** document-generation
platform that adds a licence, bar-membership or professional-registration blocker — because
every build I am recommending deliberately stays on the permitted side of §1.3 and §1.4.

## 6. Exact URLs a human or unblocked agent must open to close the gaps

1. https://www.nevo.co.il/law_html/law01/p179_001.htm — actual text of s.20, לשכת עורכי הדין.
2. https://fs.knesset.gov.il/4/law/4_lsr_209049.PDF — the law as published.
3. The judgment ע"א 4223/12 itself (supreme court site) — confirm the three-criteria test and
   that "form completion" is genuinely on the permitted side.
4. https://www.nevo.co.il/law_html/law01/999_387.htm — text of חוק הסדרת העיסוק בייצוג ע"י יועצי מס.
5. https://pdfmonkey.io/pricing/ — confirm the €19/€49/€99/€299 tiers I only have as a snippet.
6. https://www.etsy.com/market/invoice_template_for_freelancer — real sold-counts, to replace
   the unreliable $3–6k/month marketing claim in §2.2.

## 7. Dead ends

- **Generic PDF/document-generation API in English.** At least eight incumbents with public
  pricing pages and a whole listicle industry around the keyword (§2.3). A no-brand entrant
  has no wedge; per-document price is already at $0.10.
- **Israeli lawyer-facing / consumer legal document portals.** `The-new-ben/justice-theme`
  shows an Israeli operator already running 50 Hebrew document tools, monetised by routing
  users to lawyers — a lead-gen model that requires humans and that we cannot and should not
  copy.
- **Anything that drafts for a named person or files/represents before an authority** — closed
  by s.20 and by the 2005 tax-representation law. Not a gap in the market; a licence wall.
- **Primary Israeli sources.** gov.il, kolzchut, nevo, knesset, he.wikisource were all
  unreachable; wikisource confirmed EGRESS_BLOCKED by direct attempt. Every statutory claim
  here is snippet- or repo-tier and is listed in §6 for closure.
- **Freelancer proposal-SaaS revenue claims.** Only content-farm listicles. No named product.
