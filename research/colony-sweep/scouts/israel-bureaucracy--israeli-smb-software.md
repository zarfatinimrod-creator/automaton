# Scout: israel-bureaucracy / israeli-smb-software
Date: 2026-09-03. Agent: WORKER-SCOUT (Opus 5).
Criterion: The Israeli SMB software landscape — Green Invoice/Morning, iCount, Rivhit, Hashavshevet.
Pricing, APIs, affiliate/partner programmes, and unserved gaps a free tool could occupy.

## Method and evidence quality
- 14 WebSearch calls (budget cap 20). WebFetch succeeded ONLY on github.com and
  raw.githubusercontent.com. Every vendor domain is blocked by the egress proxy:
  www.greeninvoice.co.il, www.icount.co.il, rivhit-api.readme.io, greeninvoice.docs.apiary.io
  all returned EGRESS_BLOCKED. So all vendor pricing/programme figures below are
  **search-result snippets quoting those pages, not rendered pages** — marked (SNIPPET).
- Rendered primary sources: two GitHub READMEs (Green Invoice MCP + notes).

## Landscape (who the players are)
| Vendor | Product | Evidence |
|---|---|---|
| Morning (ex Green Invoice, by Optimax Ltd) | cloud invoicing/business mgmt, REST API + webhooks, sandbox | https://www.greeninvoice.co.il/api-docs/ , https://greeninvoice.docs.apiary.io/ (blocked), MCP README (rendered) |
| iCount | cloud bookkeeping/invoicing, API V3, Shopify/Magento/Wix/Etsy/WooCommerce connectors, Make/Integromat apps | https://www.icount.co.il/features/api/ (SNIPPET) |
| Rivhit (ריווחית) | desktop + online, three APIs: iCredit payment pages, iCredit direct, Rivhit REST | https://api.rivhit.co.il/online/RivhitOnlineAPI.svc/help , https://rivhit-api.readme.io/ (blocked), https://www.rivhit.co.il/knowledgebase/api-ריווחית/ |
| Hashavshevet (חשבשבת / WizCloud) | desktop ERP + cloud, H-CONNECT API | https://home.wizcloud.co.il/help/apidocument/ , https://www.h-erp.co.il/wp-content/uploads/2021/05/API-חוברת-חדשה-ממשק_-011-2.pdf |
| Also in market | SUMIT, EasyCount, Vuz, Invoice4u, Kaspit, Priority, YPAY, MyBooks | https://help.sumit.co.il/blog/he/articles/10154917-... (SNIPPET) |

## Pricing found (all SNIPPET — a human must open the pricing pages to confirm)
- iCount Express: one payment 276 ILS/yr excl. VAT, one-year commitment, **no API, no store
  connections** on that tier. https://www.icount.co.il/plans/ (SNIPPET)
- iCount elsewhere quoted as 119 ILS/yr (9.90/mo) or 19.90/mo, no free trial — via SUMIT's
  comparison blog (a competitor's page, treat as weak). https://help.sumit.co.il/blog/he/articles/10154917-... (SNIPPET)
- iCount WooCommerce connection: 20 ILS/month per single connection. (SNIPPET, iCount blog)
- Rivhit: first two months free, then 69 / 49 ILS per month + VAT on annual billing
  (desktop vs web-only). (SNIPPET via SUMIT comparison — weak, competitor-authored)
- Morning Light: 288 ILS/yr = 24 ILS/mo excl. VAT — snippet flagged by the search tool itself
  as possibly stale. https://www.greeninvoice.co.il/pricing/ (SNIPPET)
- Hashavshevet support hour: 400 ILS + VAT per hour (h-erp.co.il, SNIPPET).
- **Morning API requires the "Best" plan or higher** (SNIPPET only; the exact clause lives at
  https://greeninvoice.docs.apiary.io/ — MUST be opened by an unblocked reader to confirm).

## API facts confirmed from a RENDERED source
From https://github.com/danielrosehill/GreenInvoice-MCP (MIT, README rendered 2026-09-03):
- Auth: API ID + secret from My Account > Developer Tools > API Keys; JWT token ~30 min.
- Rate limit ~3 requests/second.
- Sandbox at https://sandbox.d.greeninvoice.co.il/api/v1/ with separate credentials;
  production keys rejected there.
- 66 endpoints across account, business, document, client, supplier, item, expense, payment,
  webhook, reference_data, sandbox.
- Explicit disclaimer: not affiliated with / endorsed by Green Invoice (Optimax Ltd).
From https://github.com/danielrosehill/Green-Invoice-API-My-Notes: the author's stated pain
point is that "much of the official documentation is written in Hebrew and lacks comprehensive
English translations."

## Partner / affiliate programmes
- **iCount "הטבת שותפים"**: up to **15% of the amount actually paid** by each new customer who
  joins via a dedicated partner code, **for 3 years** from that customer's join date; partners
  also get dedicated senior technical support and a Slack channel with an integrations expert.
  https://www.icount.co.il/תכנית-הטבת-שותפים/ and https://www.icount.co.il/partners/ (SNIPPET).
  Payout mechanism (cash vs account credit), minimum payout, and whether joining is a web form
  or a sales call are ALL UNKNOWN — the terms page is blocked here.
- **Morning "חבר מביא חבר"**: 40 ILS **credit** per friend who buys an annual subscription.
  https://www.greeninvoice.co.il/help-center/morning-friends/ (SNIPPET). Credit, not money.
- Morning also has a partner-programme terms page — https://www.greeninvoice.co.il/terms-partners/
  — whose commission terms I could not read. This is the single highest-value URL for a human
  to open in this whole criterion.
- **Rivhit markets "ממשקי API מוכנים להטמעה לבתי תוכנה"** (ready-to-embed Tax-Authority APIs for
  software houses): https://www.rivhit.co.il/מודולים-למפתחים-מול-רשות-המיסים/ (SNIPPET). This is a
  B2B channel, not a self-serve affiliate programme.

## The regulatory wave that creates the gaps
- Israel Invoice model (מודל חשבוניות ישראל): allocation number (מספר הקצאה) required from the
  Tax Authority's SHAAM system; JSON in, 9-digit number back. Threshold **drops to 5,000 ILS
  from June 2026** (was 25,000 at launch). Sources (SNIPPET):
  https://www.icount.co.il/blog/invoice-israel/ , https://www.greeninvoice.co.il/magazine/israel-invoice/ ,
  https://vuz.co.il/knowledge-center/allocation-number-thresholds-2026/ ,
  https://aci.org.il/knowledge/allocation-number-input-tax-2026/ ,
  https://bakertilly.co.il/blog-invoices-2026.html
- All the majors (Morning, iCount, Rivhit, Hashavshevet, EasyCount) already ship allocation-number
  support, so "we issue allocation numbers" is NOT an open gap.
- Uniform-format audit files (מבנה אחיד: INI.TXT + BKMVDATA.TXT) — the Tax Authority already runs a
  FREE official checker at https://secapp.taxes.gov.il/TmbakmmsmlNew/frmCheckFiles.aspx
  (cited in Oracle/SAP support notes: https://answers.sap.com/questions/10277816/... ,
  https://support.oracle.com/knowledge/Oracle%20E-Business%20Suite/2163451_1.html ). Known real
  pain: >5MB files rejected; missing B100/B110 records; INI errors 1003/1018.

## Ecosystem gap evidence (GitHub, rendered search)
- `greeninvoice` repo search: 43 results, almost all 0 stars, most last touched 2018-2021.
  Best maintained: danielrosehill/GreenInvoice-MCP (3 stars, updated 2026-07), MordiSacks/greeninvoice
  (PHP SDK, 0 stars), Flatroy/morning-browser-extension (2 stars).
- `icount invoice israel` repo search: **1 result total** (peleg-jpg/make-com-israeli-automations,
  0 stars, 2026-05). There is effectively no open-source iCount or Rivhit client ecosystem.
- PyPI has python-greeninvoice-client and green-invoice (seen in search snippets, not fetched).

## Honest read
Nothing in this criterion is a 20,000 ILS/month line on its own. The vendors are the incumbents,
they own the compliance surface, and the only money they hand outsiders is a percentage of a
119-700 ILS/year subscription. The realistic play is a low-hundreds-of-shekels/month affiliate
tail bolted onto the free Hebrew calculators we already run — worth doing because marginal cost
is near zero, not because it is a business.

## Dead ends
1. Reselling / integrating Rivhit's "software house" modules — requires a human sales relationship.
   Fails MISSION (owner does nothing).
2. Building an allocation-number issuing service — the majors all ship it; a third party cannot
   get allocation numbers for someone else's business without that business's SHAAM authorization.
3. Morning "חבר מביא חבר" as revenue — 40 ILS is account credit, not payable money.
4. A free BKMVDATA web validator as a lead magnet — the Tax Authority already publishes a free
   official checker; we would be a worse copy of a government tool.
5. Selling SDKs to developers — the entire open-source footprint for these APIs is a few dozen
   0-star repos. That is not a market, it is an absence of one.

## URLs a human / unblocked agent must open to close the open questions
- https://www.greeninvoice.co.il/terms-partners/  (Morning partner commission — highest value)
- https://www.icount.co.il/תכנית-הטבת-שותפים/  (iCount payout mechanism, join flow, minimum payout)
- https://www.greeninvoice.co.il/pricing/  and  https://www.icount.co.il/plans/  (current 2026 prices)
- https://greeninvoice.docs.apiary.io/  (which plan unlocks the API; rate limits)
- https://rivhit-api.readme.io/  (Rivhit REST scope and access requirements)
