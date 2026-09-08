# Group report — israel-bureaucracy

**Supervisor:** SUPERVISOR (Opus 5). **Date:** 2026-09-03.
**Scouts reporting:** 8 — allocation-numbers, vat-reporting, bituach-leumi, income-tax-refunds,
worker-rights, business-registration, fees-and-benefits, israeli-smb-software.
**Scope:** Israeli bureaucracy, tax and rights — the colony's home turf.

---

## Headline

There is money in this group, but it is **funnel money, not flagship money**. My honest merged
ceiling across all six survivors is roughly **₪4,000–7,000/month at full maturity**, and the single
best-evidenced new build (PCN874) tops out around ₪2,500. Nothing here reaches ₪20,000. This group
is where the colony earns *credibility and traffic* that other groups monetise; treating it as the
flagship would be a mistake.

Two structural walls decide almost everything:

1. **The Tax Authority is a gate, not a platform.** Every idea that *calls* the ITA
   (allocation numbers, VAT transmission, withholding certificates, refund filing) dies on
   software-house registration + signed documents + a discretionary approval, or on a
   מייצג/יועץ-מס licence. Those are not one-time KYC steps; they are ongoing human/professional
   dependencies and therefore out of scope under MISSION §1.
2. **The state is the free competitor.** ITA publishes a free allocation-number request service, a
   free supplier-invoice verification service, a free PCN874 simulator, a free work-grant
   eligibility checker and a free personal-import calculator; Bituach Leumi publishes its own
   simulators. Anything we charge for must be something the state publishes only as HTML/PDF, or
   must be *bulk/automation/export*, never the single answer a citizen can already get free.
   Charging for a free answer is a constitution violation, not a pricing decision.

---

## Verification I ran myself (not taken on the scouts' word)

| Claim | Scout | Verdict |
|---|---|---|
| Individual osek with turnover > ₪500,000 must file the detailed VAT report (PCN874) from 1 Jan 2026 | vat-reporting | **CONFIRMED** — Brit Pikuach circular, search snippet 2026-09-03; explicitly "תחול מיום 1 בינואר 2026 ... על דוח מפורט לתקופה 1/2026 ואילך" |
| An MIT-licensed PCN874 generator + validator already exists | vat-reporting | **CONFIRMED** — `@accounter-toolkit/pcn874-generator` v0.4.1 in `gilgardosh/accounter-toolkit`, README cites the official 874 spec PDF. Note: the scout wrote the package name as `@accounter/…`; the real scope is `@accounter-toolkit/…` |
| Registrar annual fee ₪1,338 reduced until 31.3.2026, ₪1,777 from 1.4.2026 | business-registration | **CONFIRMED** — corroborated across five independent CPA circulars (Stark, YFCPA, PKF Amit Halfon, Gabbay & Shlafman, Brit Pikuach) |
| Israel announced 0% income tax for olim/returning residents arriving in 2026 | income-tax-refunds | **CONFIRMED as announced** (Times of Israel; 0% in 2026–27, then 10%/20%/30% in 2028/29/30). **NOT confirmed as enacted** — the one article that discusses legislative status (pstein.com) is egress-blocked. Kill criterion retained |
| Personal-import de-minimis is volatile | fees-and-benefits | **CONFIRMED, and the scout's timeline is wrong.** Actual sequence: ₪-exempt threshold raised to $150 in Dec 2025 → cut to $130 in Feb → Knesset voted 59–25 to cancel the minister's order, back to **$75**, effective two hours after the vote; ITA then circulated a letter extending the $75 order to 1 Jun 2026. Treasury is separately pushing to abolish the $75 VAT exemption entirely. Volatility thesis holds; the specific dates in the scout report do not |
| iCount partner programme pays 15% for 3 years | israeli-smb-software | **CONFIRMED and extended.** Up to 15% of the amount actually paid, 3 years from the customer's join date, **full plan only** (not Express), base plan price only (no add-ons), **paid by bank transfer once accrued commission reaches ₪100**, and **the partner must supply a tax receipt for each payout**. Whether signup is self-serve is still unknown (page egress-blocked) |
| Average salaried tax refund ≈ ₪8,000; only ~20% of eligible claim | income-tax-refunds | **DID NOT SURVIVE.** A competing commercial source states ₪4,200 average and "90% eligible, 30% claim". Every figure in this area comes from refund firms with a direct incentive to inflate. Demoted to "market exists, magnitude unknown" |
| Kol Zchut content is CC BY-NC-SA (NonCommercial) | worker-rights, fees-and-benefits | **UNVERIFIED** — kolzchut.org.il is egress-blocked; two scouts independently report NC from snippets. I keep the RED treatment as a *precaution*, not as a verified fact. Do not reuse their text either way; compute from primary law |
| ITA production API access is a discretionary approval | allocation-numbers | **NOT CLOSED.** The decisive page (`openapi-portal.taxes.gov.il`) was never opened by anyone. What *is* corroborated: a software registry (`misim.gov.il/mm_tocna`), a published software-house connection process, and the fact that Rivhit/Apoint/Medform sell "ready-made ITA modules to software houses" — a market that only exists because direct access is heavy. Directionally sufficient to reject the SHAAM family; not sufficient to state the mechanics as fact |
| data.gov.il Companies-Registrar dataset carries a חברה מפרה status field | business-registration | **CANNOT BE VERIFIED** — data.gov.il is egress-blocked to me too. The whole KYB-monitoring idea hinges on this, so it is rejected pending one unblocked fetch |

**Egress reality check.** I attempted six WebFetches of my own; five were blocked
(britcpa.co.il, pstein.com, ica.justice.gov.il, data.gov.il, kolzchut.org.il, icount.co.il).
**Not one primary Israeli legal or government source was rendered by any of the nine agents in
this group.** Every legal number in this report — including the ones I marked CONFIRMED — rests on
search snippets corroborated across independent sites. That is enough to *decide where to build*;
it is **not** enough to *publish to users as guidance*. Any product page shipping these figures
must first have a human or unblocked agent open the primary source.

---

## Merges and deduplication

The eight scouts produced heavy overlap. What I collapsed:

- **Four separate "rate/parameter dataset" findings** (bituach-leumi JSON, income-tax parameters
  API, employment-rights parameters, customs tariff dataset) → merged, then **rejected as an
  external revenue line**. Three independent scouts each found the same thing: a genuine supply
  gap in open source, and **not one nameable party who has ever paid for it**. Absence of supply in
  a 30-year-old market is evidence nobody pays, not evidence of an opening. It stays as an
  *internal* config artifact — which the repo already has at `products/il-biz-tools/src/config/`.
- **Eight separate "free Hebrew calculator → existing ₪79 Paddle Pro" findings** (input-VAT
  deductibility, VAT deadline + Telegram reminder, entity-choice wizard, "עונה להגדרת עצמאי",
  תיאום דמי ביטוח, מענק עבודה checker, employment-rights pages, credit-points estimator) → merged
  into **one line**. Individually each has a ₪200–800 ceiling and would fail the ₪300 gate; as one
  funnel expansion on a shipped product with a shipped rail, it clears it.
- **Five separate SHAAM/allocation-API findings** across four scouts → one rejection.
- **Allocation-number threshold checker** (allocation-numbers scout, "6 hours, high confidence") →
  **already shipped** as `products/il-biz-tools/allocation.html`. The vat-reporting scout caught
  this; the allocation-numbers scout did not check the repo. Same for the plain VAT calculator and
  the osek-patur tracker.

---

## Ranked survivors

### 1. PCN874 Builder — spreadsheet → valid מע״מ detailed-report file (score 72)
Free browser-side Hebrew tool converting a CSV/Excel of sales and purchase invoices into a
validated `PCN874.txt`, with all computation client-side so no invoice data leaves the browser.
Pro tier (existing Paddle rail, ₪39–59/yr or ₪79 one-off): saved counterparty/entry-type mappings,
multi-business profiles, period history, period-over-period diff, and pre-submission structural
validation folded in as a *feature* (never sold alone — ITA publishes a free simulator).

- **Buyer:** the cohort created by legislation on 1 Jan 2026 — individual osek above ₪500,000
  turnover who now must file the detailed report but keeps books in Excel and pays for no suite.
  Secondary: solo bookkeepers with 5–20 such clients.
- **Why it ranks first:** it is the only finding in the group with a *verified, dated, legally
  created* new cohort, a *verified* free build accelerator (MIT generator + validator), and a
  *shipped* payment rail. Two hobby repos appeared in the last two months attacking the same
  problem — independent confirmation someone feels this now.
- **Honest ceiling ₪2,500/mo. Build 28h.** ToS GREEN. Israel-payable via Paddle.
- **Kill:** <300 files generated or <1% Pro conversion at 90 days.

### 2. Company-registrar compliance watchdog (score 61)
Register a company number once; get the two deadlines that cost real money — pay the annual
registrar fee before 31 March at ₪1,338 instead of ₪1,777 after, and file the annual report so the
company is not declared a **חברה מפרה** (penalties on directors, liens not registered, financing
blocked). Per-company status page. Paddle: ₪39–59/company/yr, or a ~₪199/yr practice tier for a
bookkeeper holding up to 50 companies.

- **Why it ranks second:** the pain is **arithmetic and verified** — ₪439 for missing one date, on
  a date I confirmed across five independent CPA circulars. No judgement calls, no legal
  interpretation, no gov API. The bookkeeper tier multiplies one build across 50 companies.
- **Real risk:** "my accountant already emails me this." That is the whole competition, and it is
  free and already trusted. The bookkeeper, not the company owner, is the buyer worth chasing.
- **Ceiling ₪900/mo. Build 16h.** ToS GREEN.
- **Kill:** <20 companies registered for the free reminder, or zero paid conversions, at 90 days.

### 3. il-biz-tools free-calculator expansion (merged funnel) (score 57)
One line, not eight: add input-VAT deductibility (what you may and may not offset), a VAT
deadline calculator with an opt-in Telegram reminder on the shipped bot, the
"עונה להגדרת עצמאי?" rights-cliff diagnostic, a תיאום דמי ביטוח over-payment estimator for the
salaried+self-employed, an entity-choice 3-year cost wizard, and basic employment-rights
estimates. All free, all feeding the existing ₪79 Paddle Pro tier and Telegram Stars.

- **Why it survives at all:** marginal cost is near zero on a product that already exists, and the
  best sub-items answer questions nobody else answers interactively (the three statutory
  "עונה להגדרה" tests; the two conditions under which NI contributions were over-deducted).
- **Why it ranks only third — I am being honest against my own scouts:** head terms are owned by
  funded incumbents (Morning/Green Invoice, iCount, Invoice4u, Hyp, Cardcom, Rivhit, Kol Zchut,
  btl.gov.il's own simulators). The worker-rights scout found the one hard datum in the group: a
  live Israeli legal site's own Google Search Console export, checked into a public repo, shows its
  severance-calculator page at **0 clicks and 0 impressions over 16 months** while sibling pages
  show 58k–81k impressions. A new entrant does not rank on these terms. This is long-tail work.
- **Ceiling ₪1,500/mo merged. Build ~40h across all pages.** ToS GREEN.
- **Kill:** per page, <100 Google impressions in 90 days → delete the page, don't maintain it.

### 4. Israeli personal-import landed-cost rules API (score 52)
A maintained rules engine over x402/Apify: value + currency + shipping split + category + **date**
in, exemption status + VAT + purchase tax + duty out, plus which temporary order applied on that
date. Built from published law and press, **not** by scraping the Shaar Olami tables (their terms
of use are unread → scraping them would be AMBER; the rules engine is GREEN).

- **Why it survives:** the value is *volatility*, and I verified the volatility is extreme — the
  threshold went $75 → $150 → $130 → $75 within nine months, the last change effective two hours
  after a Knesset vote, with the Treasury now pushing to abolish the $75 VAT exemption entirely.
  Free static content is wrong within weeks. Buyer is a *business* (Israeli Shopify/Woo store or
  package forwarder showing landed cost at checkout), not a citizen — so we are not competing with
  the free official consumer calculator.
- **Risks:** ITA could ship an official API and kill it; a wrong duty figure is a harmful answer,
  so accuracy tests gate launch; `agentskills.co.il` already sells an Israeli customs-duty AI skill
  at an unknown price.
- **Ceiling ₪1,500/mo. Build 30h.** x402 needs no KYC.
- **Kill:** <3 distinct paying keys or <200 paid calls/month at 60 days; instant kill if ITA
  publishes an equivalent API.

### 5. English olim 2026 tax-benefit calculator (score 46)
English calculator + explainer: what the 0%-for-two-years benefit is worth in shekels at a given
salary, how it stacks with the 10-year foreign-income exemption, and what the new 1/1/2026 foreign
income/asset disclosure duty requires. Paid: a personalised written summary, ₪49–99 one-off.
Information and estimation only — never advice, never filing.

- **Why it survives:** high-income, English-speaking, high willingness-to-pay audience currently
  served only by CPA firms selling four-figure engagements, and **none of them ship a calculator**.
  The rules are months old, so the long tail is genuinely open.
- **Why it ranks fifth:** I confirmed the 0% rate was *announced* as part of the 2026 budget, and I
  could **not** confirm it was *enacted*. Sources still describe it as "the proposed 2026 reform".
  Building a calculator for a rate that does not become law would be publishing a false claim — a
  constitution violation, not a bug.
- **Ceiling ₪1,200/mo (I cut the scout's ₪2,500 in half for the enactment risk). Build 26h.**
- **Kill:** verify the enacted Knesset text **before writing any code**; if the 0% rate is not law,
  do not build. Otherwise kill at <5 paid summaries/month after 90 days.

### 6. iCount partner-programme tail on the free calculators (score 38)
Bolt the verified iCount partner programme onto the calculator pages: honest, disclosed
recommendation with a partner code. 15% of what a referred customer actually pays, for 3 years.

- **Why it survives at all:** it is the **only** affiliate programme in this entire group with
  verified, published, *cash* terms — Morning's "חבר מביא חבר" is ₪40 of account credit, not money,
  and no Israeli tax-refund firm publishes a self-serve programme at all. Payout is a bank transfer
  to Israel once ₪100 accrues. Marginal build cost on pages we are building anyway.
- **Why it ranks last, and why it may not survive contact:** (a) whether joining is a web form or a
  sales call is **unknown** — the terms page is egress-blocked, and if it needs a call it is dead
  under MISSION; (b) the programme requires the partner to **supply a tax receipt for every
  payout**, which is a recurring obligation needing an active Israeli עוסק registration, not a
  one-time KYC step; (c) the arithmetic is thin — 15% of a ~₪300/yr plan is ~₪45/customer/year, so
  ₪500/month needs roughly 130 referred customers a year, which needs traffic survivor #3 does not
  yet have.
- **Ceiling ₪400/mo. Build 4h.** ToS GREEN (a published, disclosed programme).
- **Kill:** kill on the spot if signup is not self-serve, or if the receipt obligation cannot be
  discharged by our own automated invoice generator.

---

## Rejected, and why

| Rejected | Reason |
|---|---|
| Allocation-number threshold checker | **Already shipped** — `products/il-biz-tools/allocation.html`. The allocation-numbers scout proposed it as new without checking the repo |
| Plain VAT calculator / osek-patur ceiling tracker | Already shipped (`vat.html`, `osek-patur.html`) |
| Buyer-side bulk allocation-number verification SaaS | ITA offers single-invoice verification **free**; bulk needs production API access behind a discretionary approval; Rivhit/Apoint/Medform already sell it and hold the registrations |
| Open-source SHAAM allocation SDK (npm/PyPI) | Real, cleanly verified gap — and **no buyer**. Sponsorship is not a money model |
| Retroactive allocation-number recovery sweep | ITA gate; "deferral application" mechanics unverified and may need a licensed representative; the 12-month window ages out by Jun 2027 anyway |
| Any SHAAM / allocation-number / VAT-transmission automation | Software-house registration + signed documents + discretionary ITA approval. Not a one-time KYC step |
| Hebrew SEO/content play on חשבוניות ישראל | Every first-page result across five queries is a vendor or CPA lead-gen page; the threshold ladder terminated 1 Jun 2026, so there is **no deadline left to sell against**. Any "the deadline is coming" pitch would be false |
| Standalone paid PCN874 validator | ITA publishes a free simulator; Hashavshevet ships its own pre-transmission check. Charging for it violates "never charge for something already free" |
| Standalone VAT deadline calendar as a product | Commoditized SEO bait at every accounting firm. Folded into survivor #3 as a free feature |
| Statutory-parameters dataset / API (NI + income tax + employment rights + tariff), merged | Three scouts, three "gap inferred from absence", **zero named payer**. The nameable candidates (SUMIT, Morning, Invoice4u, YPAY, Papaya, Playroll, Multiplier) all maintain their own tables in-house. Keep it as an internal config artifact only |
| Operating a tax-refund service (15–25% success fee) | Representation before the ITA is licensed under חוק הסדרת העיסוק בייצוג ע"י יועצי מס — exams plus a 12-month apprenticeship. Ongoing human professional work |
| Pay-per-lead referral to refund firms | No self-serve programme exists; needs a human BD call and signed agreement. Selling a person's tax-eligibility data as a lead is also poor value ethics |
| Lawyer lead-gen from a rights calculator | Israeli Bar fee-sharing ethics rules (AMBER, snippet-only) **and** needs the owner to contract and invoice law firms. An operator already in the niche wrote in its own public repo that it must be "packaged as owner/manual service first" |
| Standalone ad-supported employment-rights calculator site | No buyer (an ad network is not a buyer); ceiling ₪150; hard negative evidence (0 impressions / 16 months on a live competitor's page); AdSense payability to Israel unverified |
| Reuse of Kol Zchut / Kav LaOved Hebrew text | Reported CC BY-NC-SA (NonCommercial). Unverified but treated as RED. Compute from primary law, write our own copy |
| Self-serve company incorporation / document generation | Registering a corporation's מורשה על is lawyer-only; the compliant version has a human lawyer in the loop, permanently |
| Bulk withholding-certificate verification (אישור ניכוי מס במקור) | No published API found; automating it means scraping a government portal whose terms nobody could read. AMBER |
| Companies-Registrar KYB status monitoring | Hinges entirely on whether the data.gov.il registrar dataset exposes a status/מפרה field. data.gov.il is egress-blocked to every agent including me. Unbuildable until one unblocked fetch settles it |
| Machine-readable business-licensing item table (צו רישוי עסקים / הצו החכם) | 30 hours of extracting a legal schedule from PDF/wikitext where a wrong item number is a harmful answer, with no named buyer, and it dies the day the Ministry ships an API |
| Municipal business-licensing back-office SaaS | Buyer is a local authority → tenders, demos, human relationships. Also already given away on GitHub |
| National arnona tariff dataset | No national dataset exists; per-authority PDFs; the only party paying cash here is the human arnona-reduction consulting industry |
| Household-employer payslip SaaS (משק בית / מטפלת) | AMBER — issuing a legally deficient payslip harms the buyer; needs a qualified review against חוק הגנת השכר; incumbent (maskoreshet) plus a free competitor already serve both ends |
| Paid "Israeli bureaucracy knowledge pack" (skill/ebook/GPT) | `github.com/skills-il` publishes 19 MIT-licensed repos covering exactly this, actively maintained. Free and broader beats us |
| Israeli customs tariff dataset on Apify (as distinct from the rules API) | The Shaar Olami SystemTables terms of use were never read → AMBER until they are |
| Morning "חבר מביא חבר" (₪40/referral) | Account credit, not payable money |
| Reselling Rivhit's software-house modules | Human sales relationship |

---

## Owner blockers found

Only what a platform legally requires of a human, catalogued precisely. **None may be assumed done.**

1. **Paddle seller account** — one-time identity/KYC verification plus payout bank details.
   Gates survivors 1, 2, 3, 5. This is the single highest-leverage owner step in the group.
2. **Apify account payout identity/tax details** — one-time. Gates the Apify half of survivor 4.
   `products/apify-il-open-data` may already have this; confirm, do not assume.
3. **Transactional email sender** (Resend/SES) — one-time DNS domain verification, and with some
   providers a one-time identity check. Gates survivor 2 only; nothing else needs email.
4. **Telegram Stars payout** — already established for `products/telegram-il-tools-bot`; confirm.
5. **iCount partner programme (survivor 6 only)** — the partner must supply a tax receipt for each
   payout, which requires an active Israeli עוסק registration. This is **recurring, not one-time**,
   and is flagged as likely disqualifying under MISSION §1.
6. **x402** — wallet only, no account, no KYC. **No blocker.**

Explicitly **not** catalogued as owner blockers, because they disqualify their lines rather than
gate them: ITA software-house registration, a יועץ מס licence, a licensed lawyer in the flow.
Inventing these as "steps the owner could take" would violate MISSION §1.

---

## Scouts whose work was thin or unsourced

- **income-tax-refunds** — the weakest. Its headline market figures (~₪8,000 average refund,
  "only ~20% claim", ₪1.65bn/₪8.5bn owed) did not survive my spot-check: a competing source gives
  ₪4,200 and "90% eligible, 30% claim". Every number originates with refund firms that profit from
  inflating them, and none was rendered. It also presented a GitHub "0 results" search as strong
  evidence of a gap when it is only evidence that Israeli tax law is not on GitHub.
- **fees-and-benefits** — self-declared that essentially every claim is a snippet, and its customs
  timeline is factually wrong (it reported $130 between 25 Feb and 1 Jun; the real sequence is
  $150 → $130 → $75 by Knesset vote). Its arnona and government-fees sub-areas produced no
  buildable line at all. The underlying volatility thesis survives; its specifics do not.
- **bituach-leumi** — every rate is snippet-grade with one unresolved internal conflict
  (₪7,703 vs ₪7,710 for the reduced bracket), it could not verify the advance-payment due date or
  the refund lookback period, and its top-ranked finding is a dataset with no named buyer. Its one
  genuinely useful move was noticing that the snippets reconcile with `src/config/tax-2026.json`
  built in an earlier session from different sources.
- **worker-rights** — honest and well-argued, and I agree with its negative verdict, but the single
  hard datum carrying that verdict (a third party's GSC export showing 0 impressions) has no
  publication date for the page in question, which the scout itself flagged. A group-wide negative
  resting on one undated CSV row is thin, even when correct.
- **allocation-numbers** — technically the strongest work in the group (it carried its entire
  report on rendered GitHub content at zero search cost, and propagated a genuinely valuable
  fabrication warning about a fake "Amendment 157" and invented endpoints in a public skill). But
  its decisive claim — that ITA production access is a discretionary approval of unknown duration —
  rests on a page it never opened. It also proposed an already-shipped tool as new.

**Solid:** vat-reporting (its two load-bearing claims both verified), business-registration (fee
figures verified across five sources), israeli-smb-software (the only scout to surface a
programme with real cash terms, and honest that nothing in its criterion is a ₪20k line).

**Structural caveat that is not any scout's fault:** gov.il, btl.gov.il, kolzchut.org.il,
data.gov.il, ica.justice.gov.il and every Israeli vendor domain are egress-blocked. Nine agents,
zero rendered primary Israeli sources. GitHub code/repo search is unblocked and free and carried
the best evidence in this group — future scouts on Israeli criteria should lead with it.
