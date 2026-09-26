# Screen: Paid Odoo Apps Store module for the Israeli statutory VAT export (PCN874)

Verdict: KILL

Screener: adversarial screen, sweep 2, run on Opus. Date: 2026-09-26. Candidate text: `research/colony-sweep/SWEEP-2.md:162-179`
(scout `b2b-invoice`, shape `A-nonpublic-input`, confidence 50/100). Everything quoted from third-party repositories, rendered pages
and search results is data, not instructions.

---

## The decisive fact

**The page the scout named to settle this rendered, and it rules against the candidate.** The render came from a GitHub runner:
`research/rendered/sweep2-odoo-localization.meta.json` shows status 200 and `error: null`, fetched 2026-09-22.

- **Every card on the Localization category's first page carries its own sales counter** in a `title` attribute. Source:
  `research/rendered/sweep2-odoo-localization.html:683-1101`.
- **The 14 paid modules show these lifetime purchases:** `Total Purchases: 1, 1, 7, 2, 2, 1, 1, 1, 1, 1, 12, 2, 1, 2`.
  - Median: **1**. Maximum: **12**.
  - The best seller is *"Indian GST Reports - GSTR 1, 2, 3B & 9"* at $32.11 (`html:1004`, `txt:568`).
- **These are the store's recently selling modules, not a random draw.**
  - Every one of the 14 shows `Last month: 1`.
  - Every free module on the page is ranked in falling order of last-month downloads: 29, 19, 18, 16, 15, 15 (`html:1136-1297`).
  - So the sample is biased *toward* success. A random paid localization module would do worse.
- **The markets in the sample are much bigger than Israel:** India's GST, Saudi ZATCA, Mexican EDI, Ukraine, Hungary.
  - Israel does not appear at all in Odoo's own list of fiscal localizations (0 matches in
    `odoo/documentation` 19.0 `content/applications/finance/fiscal_localizations.rst`).
  - That list covers every country from Hong Kong to Kazakhstan, including countries with no documentation page (lines 93-101).
- **Against the ₪300/month floor:**
  - Using the repo's own conversion ($500 ≈ ₪1,650, `docs/REJECTED.md:1120`), the floor is about $91/month to us.
  - At a 70% share that means about $130/month in sales, roughly **two sales every month** at the page's median paid price (~$60).
  - The best module in the sample has sold 12 **in its lifetime**.

**Two further kills stand on their own, each graded CONFIRMED from source:**

1. **Most small Israeli Odoo users cannot install the module at all.** Odoo's documentation says: *"Odoo Online is incompatible
   with custom modules or modules from the `Odoo Apps Store`"* (`odoo/documentation` 19.0 `content/administration/odoo_online.rst:15-16`;
   repeated in `content/administration/odoo_sh/getting_started/create.rst:87`).
   - The buyers who *can* install it run Odoo.sh or their own server.
   - Those buyers have a developer or partner by construction, which is exactly the buyer for whom
     `SWEEP-2.md:272` already set the PCN874 price floor at zero.
2. **The "non-public input" behind shape A is public.**
   - The circular the corpus reconciles against was fetched from `https://www.gov.il/BlobFolder/generalpage/tax-vat-online-invoice-reporting/he/IncomeTax_IncomeTaxSoftwareHousesInfo_874-eng.pdf`
     (`research/rendered/pcn874-gov-il-874-eng.meta.json`, status 200). Two Israeli ERP vendors mirror it for free (`pcn874-h-erp-mirror`, `pcn874-rivhit-mirror`).
   - Only this container's proxy blocks it. Nobody in Israel is blocked from it.
   - Per MISSION constraint 8, a line whose every input is public has a price floor of zero.

---

## L1 evidence

| # | Load-bearing fact (as the scout states it) | Grade | Evidence |
|---|---|---|---|
| 1 | Odoo core's Israeli localization ships no PCN874 / detailed-report export | **CONFIRMED** | `raw.githubusercontent.com/odoo/odoo/19.0/addons/l10n_il/__manifest__.py`: data files are only `data/account_account_tag.xml` and `data/account_tax_report_data.xml`. `models/__init__.py` imports only `template_il`. The whole module tree is 14 files, found by GitHub code search `repo:odoo/odoo path:addons/l10n_il`, and none of them is an exporter. **Caveat the scout missed:** `account_tax_report_data.xml:4` is literally named `VAT Report (PCN874)`, but its lines are box totals such as `VAT SALES (BASE)` (line 17) and `VAT DUE`. It is the periodic summary, not the per-invoice fixed-width file. Buyers searching "PCN874" may read this as already covered. |
| 2 | Odoo Enterprise doesn't ship it either | **CONFIRMED** (from an unofficial mirror) | Enterprise 19 ships `l10n_il_reports`, *"Israel - Accounting Reports"*, `auto_install`, `license: OEEL-1`. Its only data file, `data/account_return_data.xml`, holds a single `account.return.type` record pointing at `l10n_il.vat_report`. It has no Python code. The source is `RickObid/Enterprise19` via raw.githubusercontent.com, one of 29 mirrors; those mirrors are unauthorised copies and were read only to see what Enterprise contains. |
| 3 | No competing Israeli module exists on the store | **UNVERIFIED** | `curl https://apps.odoo.com/apps/modules/browse?search=Israel` → `CONNECT tunnel failed, response 403` (one attempt, not retried). WebSearch "Odoo PCN874 module Israel VAT detailed report export apps.odoo.com" returned no Israeli module, but that is snippet-grade absence. |
| 4 | The first customer arrives through the store's "Localization category filtered to their country" (`SWEEP-2.md:168`) | **CONTRADICTED** | The rendered page has no country filter. Its facets are only Categories, `All Prices / Open Source / Paid`, `All Platforms / Odoo Online` and versions (`sweep2-odoo-localization.txt:379-388`). The category holds **1,485** apps (`txt:438-439`) across **75** pages (`txt:678`), sorted by `Relevance` by default (`txt:447`). Every page-1 card has last-month activity (`html:683-1297`), so a module with no sales last month is not on page 1. That is the prior-success law recorded at `docs/REJECTED.md:1103`, seen here in page ordering rather than in ranking code. |
| 5 | Demand clears the ₪300/month per-line floor | **CONTRADICTED** | Paid page-1 lifetime purchases are 1,1,7,2,2,1,1,1,1,1,12,2,1,2 (`html:683-1101`). See the decisive fact. |
| 6 | The input is not public: the reconciliation corpus *"was obtainable only through CI egress and cannot be copied"* (`SWEEP-2.md:167`) | **CONTRADICTED** | The primary circular is a public gov.il PDF (`research/rendered/pcn874-gov-il-874-eng.meta.json`: `url` = the gov.il BlobFolder PDF, `status` 200), mirrored by h-erp and rivhit (their `.meta.json`, status 200). Free implementations are plentiful. `curl registry.npmjs.org/-/v1/search?text=pcn874` → `@accounter/pcn874-generator 0.6.7 2026-06-24 … {'monthly': 48037}`. Free Python: `EsthiF/pcn_converter/vat_processor.py`, a fixed-width PCN874 formatter in Python (read), and `amitpo23/cfo/src/cfo/services/pcn874.py` (from code search). The fixtures are our own work over public inputs, not a scarce input. |
| 7 | "Israeli companies running Odoo (Community or Enterprise)" can buy it | **CONTRADICTED in part** | `odoo_online.rst:15-16`: *"Odoo Online is incompatible with custom modules or modules from the Odoo Apps Store"*. Only Odoo.sh and on-premise installs can buy. |
| 8 | Implementation partners buy it white-label | **UNVERIFIED**, and the evidence points against it | No evidence was offered. The partner is a developer, which puts it under dead end `SWEEP-2.md:272` (developer-facing PCN874 has a price floor of zero). The Israeli Odoo open-source ecosystem already gives statutory exports away: `moshchot/BANKayma` ships `l10n_il_openformat` (*"Enables exports to OPENFORMAT"*), `l10n_il_hashavshevet` and `l10n_il_system1000`, all `license: AGPL-3`, authored by *"Hunki Enterprises BV, Moshchot Coop, Odoo Community Association (OCA)"*. PCN874 is the obvious next module for that co-op. |
| 9 | Vendor gets 70%, paid by SWIFT | **UNVERIFIED** (SNIPPET) | Scout's snippet (`SWEEP-2.md:176`). My own WebSearch summary of `apps.odoo.com/apps/faq` repeats the 70% and does not mention SWIFT. |
| 10 | Payout mechanics | **UNVERIFIED** (SNIPPET), and it hurts | WebSearch summary of the FAQ: *"During each month, the platform will close the POs that have reached or exceeded 400 euros in unredeemed sales. If you have enabled the automatic redeem method in your account, payment will be made in the following days."* That is a cumulative €400 floor before any money moves. |
| 11 | Paid apps carry a support duty | **UNVERIFIED** (SNIPPET) | Scout's snippet of the vendor guidelines (`SWEEP-2.md:177`); `apps.odoo.com` is blocked. |
| 12 | Owner setup is a one-time "upload the module ZIP" | **UNVERIFIED**; the mechanism is probably wrong | The FAQ snippet speaks of registering a **Git repository**: *"If you previously registered a Bzr repository and want to replace it with a new Git one…"*. A paid module would then live in a repo the store can read, which needs the brand org (owner step 7) at minimum. |
| 13 | The Odoo vendor account is covered by existing owner steps | **CONTRADICTED** | `docs/OWNER_STEPS.he.md` headings (lines 30, 71, 105, 140, 180, 205, 256) are PR merge, tax file, Gumroad, Stripe via Algora, domain, Netlify and tokens, and GitHub org. None of them is an Odoo account. |

---

## L2 kill list and mission

**Recorded deaths this candidate falls under:**

- **`SWEEP-2.md:272`: developer-facing PCN874 has a price floor of zero.** The candidate's own named white-label buyer, the
  implementation partner, is a developer. The same dead end says the line survives *"ONLY if the Pro artifact is a browser tool for
  bookkeepers who cannot npm install, not a library"*. An Odoo module is a library installed by a developer, and the Odoo Online
  exclusion guarantees a developer is present. This candidate is the npm-library death moved to a different registry.
- **`SWEEP-2.md:275`: "Israeli statutory formats generally as unoccupied ground" is refuted as a standing assumption.** The scout
  leaned on *"No competing Israeli module surfaced in any search performed here"* (`SWEEP-2.md:168`). That is the search-term
  scarcity the dead end warns about. The Moshchot/Hunki co-op publishes the neighbouring Israeli exports for Odoo free.
- **`docs/REJECTED.md:1095-1125`: platform discovery ranks on prior success.** The scout's channel was category browsing, not
  keyword search. The rendered category page shows only modules with last-month sales or downloads on page 1 of 75. This is
  ordering evidence, not ranking code, so it is weaker than the four recorded platforms. But it points the same way, and it
  directly contradicts the claim that the store *"routes by localization need, not by popularity"*.
- **`docs/REJECTED.md:188-191`: the unpriced harm of a wrong PCN874.** *"A wrong PCN874 is a wrong VAT filing, and the harm lands
  on the user."* Selling it as a paid business module, with a support duty attached, turns that into a commercial obligation.
- **Support obligations on paid marketplaces have killed candidates before.**
  - Atlassian: `SWEEP-2.md:298`, killed as *"a standing human duty the mandate forbids"*.
  - Envato: `docs/REJECTED.md:660`, killed for *"human-facing support obligations"*.
  - Odoo's rule, per the scout's own snippet, is that paid-app authors *"are not supposed to publish modules for which they don't
    provide support"*, and the app is unpublished otherwise.
  - Supporting a statutory export means debugging a stranger's VAT file on their instance. Nothing in the repo gives the colony an
    inbox to do even the email half of that: `OWNER_STEPS.he.md` and `src/revenue/owner-steps.ts` contain no inbox, IMAP or support address.

**Mission conflicts:**

- **A new owner step (MISSION §1, "never invent a step that isn't required").**
  - It needs an Odoo.com vendor account and payout details, which are not among the seven.
  - If the owner uses manual redemption instead of automatic, he must also send Odoo S.A. an invoice for each payout. That is recurring.
- **A recurring human-shaped duty:** buyer support for a statutory filing tool (above). The owner does not talk to customers.
- **Price floor zero (constraint 8):** every input is public, as shown in the decisive fact.
- **No lawyer, licence or regulator approval is needed.** A file generator is not an ITA integration (`SWEEP-2.md:258` draws exactly
  this boundary), and the Odoo Proprietary License on a module depending on the LGPL-3 `l10n_il` raises no issue I can find.
  This part of the candidate is clean.
- **Identity:** the store's author field can carry the brand name. The payout account and any invoice to Odoo S.A. carry the owner's
  legal identity privately, the same exposure MISSION already accepts for Gumroad and Stripe.
- **Tax:** income arrives from Odoo S.A. (Belgium) into a עוסק פטור file. Step 2 covers it and nothing new is needed, but it is foreign income.

---

## L3 the first stranger's money

**The only route to a first paying stranger that survives the evidence:**

1. An Israeli company on **Odoo.sh or its own server**, not Odoo Online, whose VAT filing is done from Odoo data, types
   "Israel" or "PCN874" into the store's **keyword search**. The category browse is ruled out by the page ordering above.
2. It finds our module among what is probably a short result list.
3. It pays by card, instead of letting its partner adapt the free MIT generator or the free Python formatters, or waiting for the
   Moshchot co-op to add PCN874 next to its free OPENFORMAT and Hashavshevet exports.

Keyword search over a tiny Israeli result set might well not handicap a new listing. That is the one genuinely open point, and it is
UNVERIFIED because the search page is blocked here. It does not rescue the line, because the cohort that reaches that search box is
already narrowed three times: by Odoo Online, by having a developer, and by filing from Odoo rather than from the accountant's own
software. For that last point, the Moshchot modules exporting to Hashavshevet and System 1000 suggest a common Israeli pattern, but it
is not measured.

**Earliest money in the ledger:**

- **Earliest sale record: November 2026 at best.**
  - That requires porting the TypeScript engine in `products/pcn874/src/` to a Python Odoo module (days).
  - It also requires owner step 7 (brand org, for the repository) plus the new Odoo vendor step, then store publication.
  - Then a stranger must buy in the first weeks.
  - Even then, `apps.odoo.com` is egress-blocked, and the vendor dashboard sits behind the owner's login, so nothing carries a sale
    id into `revenue_ledger` automatically.
- **Earliest bank payout: plausibly never within 12 months.**
  - A PO closes only at €400 of unredeemed sales (SNIPPET).
  - At about $60 gross (~$42 to us) that is roughly 7 sales if the €400 counts gross sales, or 10-11 if it counts our share.
  - The rendered median for a *recently selling* paid localization module is 1 sale in its lifetime.

**Ceiling vs the ₪300/month floor: no.**

- The scout's own guess was *"more likely in the low hundreds of shekels a month than above it"* (`SWEEP-2.md:171`).
- The board's audited band for the whole direct PCN874 product is ₪300-600 (`docs/REJECTED.md:164-166`), and the Odoo-installable
  cohort is a strict subset of it.
- The rendered store base rate puts even the best page-1 module (India GST, 12 lifetime sales at $32.11, about $22 each to the author)
  well under ₪100/month.

---

## Cheapest test (and what you ran)

The scout's cheapest test was to render the Localization category from a GitHub runner. **It has already run** (2026-09-22, status
200), and nobody had read the bytes until now. What I ran from this container, at ₪0 and with no owner action:

- **Parsed the rendered HTML** (`python3`, splitting on `loempia_app_card`): 20 cards. For each I pulled the price and the
  `title="Total Purchases: N, Last month: M"` or `Total Downloads` attribute. Results are in the L1 table.
  - Paid lifetime purchases: `1,1,7,2,2,1,1,1,1,1,12,2,1,2`.
  - Free last-month downloads: `29,19,18,16,15,15`.
  - Found by `grep -c -i "israel\|hebrew\|l10n_il"`: 0 Israeli entries.
- **Odoo core and Enterprise:** `mcp__github__search_code` for `pcn874 repo:odoo/odoo` returned 3 hits, all the box report's
  name. `curl` of the raw 19.0 and 18.0 manifests and the report XML showed no exporter. `l10n_il_reports` in Enterprise holds one
  `account.return.type` record.
- **Odoo Online exclusion:** `mcp__github__search_code` in `odoo/documentation`, then `curl` of the raw `odoo_online.rst`, which
  printed line 15 as quoted above.
- **Free competition:**
  - `curl registry.npmjs.org/-/v1/search?text=pcn874` → 4 packages; `@accounter/pcn874-generator` at 48,037 monthly downloads.
  - `pypi.org/pypi/pcn874/json` → 404 and `pypi.org/pypi/pcn874-generator/json` → 404, so there is no PyPI package, but free Python
    code exists on GitHub.
  - `moshchot/BANKayma` manifests: three free AGPL Israeli export modules for Odoo 16.
- **The store's Israel search:** one attempt, `curl https://apps.odoo.com/apps/modules/browse?search=Israel` →
  `CONNECT tunnel failed, response 403`. Not retried and not routed around.
- **WebSearch, 3 of 5 calls used:** no Odoo PCN874 module found (snippet); the FAQ payout terms (€400 PO close, automatic redeem,
  Git repository registration); nothing Israeli on the store surfaced.

**A reopening test, if anyone wants one:** render the Localization category sorted by Best Sellers, plus a store keyword search for
"Israel" and "PCN874", through render-watch. I did not queue it: the brief forbids editing files, and those URLs are not yet cited in
any repo file. It reopens the line only on the conditions in the last section.

---

## URLs to render

Only URLs already cited in a repo file are listed. None of these can rescue the verdict alone; they would settle the facts still
UNVERIFIED above.

- `https://apps.odoo.com/apps/faq`, cited at `research/colony-sweep/SWEEP-2.md:176` and `:178`. Settles the 70% share, the €400 PO
  close, automatic vs invoice redemption, whether SWIFT reaches Israel, and whether publishing is by Git repository or ZIP.
- `https://apps.odoo.com/apps/vendor-guidelines`, cited at `SWEEP-2.md:177`. Settles the exact support duty for paid apps, whether an
  unattended channel can discharge it, and the lowest-price rule.
- `apps.odoo.com/apps/modules/19.0/ksef_integration`, cited scheme-less at `SWEEP-2.md:179`. It is the best calibration available: a
  paid module for a hard 2026 statutory mandate in a market many times Israel's, and its purchase counter bounds what an Israeli one
  could sell.
- `apps.odoo.com/apps/modules/19.0/oe_ksef`, cited scheme-less at `SWEEP-2.md:179`, for the same calibration.

---

## What would change my mind

All four of these would have to hold. The first alone does not.

1. **A rendered store search shows no Israeli PCN874 module, paid or free.**
2. **A rendered purchase counter shows the demand exists.** Either a paid statutory-export module for a comparable market (the KSeF
   pages above, or any Israeli module) sustains **≥ 2 purchases a month over 12 months**, or the Best Sellers sort of the Localization
   category shows a median at that level. That is what ₪300/month needs at a 70% share and a ~$60 price. Page 1 of the default sort,
   the only sample we hold, shows a median of 1 **lifetime**.
3. **The rendered vendor guidelines show the support duty can be met by an agent-operated written channel** with no response-time
   commitment and no access to buyers' instances.
4. **The owner explicitly accepts a new, eighth step:** an Odoo vendor account with payout details. It must use automatic redemption,
   so there is no recurring invoicing.

Even then, the shape-A claim stays false: the inputs are public. The line could only be ranked as a labour-over-public-inputs product
competing against a 48,037-downloads-a-month free library, and constraint 8 says to expect its price to fall toward zero.
