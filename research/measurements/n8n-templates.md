# n8n paid templates (candidate 20) — the catalogue read, the Creator Hub rules not reached

**Status: READ 28.9.2026 (captures of ~13:18 UTC, render-watch commit `815c2e5`).** Half of the ₪0 test is answered
(ordering; whether paid templates appear). The other half (the AI rule, the paid-unlock condition) is not on either page.

## What was read

- `research/rendered/n8n-templates-search.json` — `https://api.n8n.io/api/templates/search?rows=100&page=1`, status 200,
  fetchedAt 2026-09-28T13:18:11.356Z, 2,243,312 bytes, not truncated; parsed with python3.
- `research/rendered/n8n-creators.txt` (126 lines) — `https://n8n.io/creators/`, status 200, fetchedAt
  2026-09-28T13:18:12.494Z; its `.html` (36 lines) was grepped for link targets and to confirm absences.
- The scout's claims: `research/breadth/scouts/automation-marketplaces.json`, n8n candidate (verdict WEAK).

## Findings — catalogue API

- Top level: `totalWorkflows` = 12,574; `workflows` = 100 items; `filters` = 3 facets (`categories` 31 values, `apps` 423,
  `nodes` 488). There is no price facet. [RENDERED]
- Workflow fields: `id, name, totalViews, price, purchaseUrl, user, description, createdAt, nodes`. `user` holds
  `id, name, username, bio, verified, links, avatar`. There is no `paid` boolean. [RENDERED]
- **Priced templates on the first page: 0 of 100.** `price` is `0` on 82 and absent on 18 (all 18 created between 2025-06-10
  and 2025-08-16); `purchaseUrl` is `null` on all 100. [RENDERED] The schema has a price and a checkout link, so priced
  listings exist as a concept. Whether the default query leaves them out or they only rank below 100 cannot be told. [INFERENCE]
- The only Gumroad presence: 2 free templates from one creator organisation (positions 67 and 73, `price` 0) paste a
  Gumroad storefront link into the description. The free template works as a funnel. [RENDERED]
- **Ordering follows none of the returned fields.** The rank correlation (Spearman) between position and `totalViews` is
  −0.30, so higher-viewed templates tend to come earlier. It is 0.02 against `createdAt` and 0.02 against `id`, and no
  field is monotonic. The first ten have a median of 2,284 views against the page's 135, and the most-viewed (214,907)
  sits at position 28. The newest `createdAt` is 2026-07-23, two months before the capture, so it is not recency. [RENDERED]
  It looks like an opaque relevance/popularity score applied on the server (the facets carry search-engine
  `highlighted`/`sampled` fields). [INFERENCE]
- **Views (lifetime `totalViews`, n=100):** min 14, p25 37, median 135, p75 3,121, p90 29,301, max 214,907, mean 13,049.
  46 have under 100 views, 68 under 1,000 and 20 have 10,000 or more. By `createdAt`: 1 from 2024, 81 from 2025, 18 from 2026.
  67 distinct creators; 85 of 100 from verified creators. [RENDERED]
- As a proxy for buyer supply: these are reader counts on free templates, not purchases. Readership is skewed. Even in
  the best-placed slots, half the listings have under 135 lifetime views. A new creator's paid listing starts with no
  views, in a ranking that favours views. [INFERENCE]

## Findings — creators page

- Title and framing: "Verified n8n Automation Workflows Creators" (`n8n-creators.txt:1`); "Only the best Verified n8n
  Automation Workflows Creators" (`:66`). Nav: "Templates Explore +10k workflow automation templates" (`:7`). [RENDERED]
- Directory head: nine creators with 133 to 346 templates each (`:69-103`; names not recorded), so the top is held by
  high-volume publishers. [RENDERED]
- Who can be a creator: no eligibility rule is stated. There is only "Become a verified creator" (`:107`) and "Join now"
  (`:117`), which links to `https://creators.n8n.io/` (`n8n-creators.html:35`). [RENDERED]
- The benefits are all non-monetary: "Have a direct connection to our product team and see new functionalities
  first-hand" (`:109`); "Earn the prestigious Verified Creator Badge to highlight your expertise" (`:111`); "Join a private
  Discord channel…" (`:113`); "Be listed in our Creators Directory and get noticed by the n8n community" (`:115`). [RENDERED]
- AI-generated-content rule: **absent**. The text has none. In the HTML, the only "AI-generated" string is in a listed
  creator's bio about their own product. [RENDERED]
- Paid templates, paid unlock, revenue share, payout method or countries, fee, identity or camera step: **none on the
  page**. HTML counts: "Gumroad" 0, "payout" 0, "commission" 0, "KYC" 0. Every "paid", "revenue" and "purchase" hit is in a
  creator bio. One bio offers support "With any purchase of  my n8n template" (sic, two spaces) (`n8n-creators.html:36`), which shows that
  creators sell templates, not that a program exists. [RENDERED]
- Submission: not described. The page config names `creatorsPortal: "https://creators.n8n.io/hub"` and
  `creatorHubDocument: "https://n8n.notion.site/n8n-Creator-hub-7bd2cbe0fce0449198ecb23ff4a2f76f"` (`html:36`). Its
  `productApi` block lists only read endpoints (search, filters, workflows, categories, creators). [RENDERED] That points to
  a portal form, one account-holder click per template, but it is not shown. [INFERENCE]

## Against the scout

- "12,572 workflows" (snippet) against 12,574 rendered: confirmed. `price` and `purchaseUrl` field names: confirmed, but
  none is populated on page 1.
- `gate_buyer_supply` PASS (github grade) → **UNKNOWN for paid listings**: the catalogue that reaches the editor shows zero
  priced templates in its first 100.
- `gate_ai_allowed_honest` and the "paid option after 3 submissions" snippet: still unread, and not held by this page.

**Verdict for row 20 (n8n paid templates): NEEDS_MORE.** The ordering half of the ₪0 test is answered, and the answer
is unfavourable: the ranking is opaque, tilted toward views and not toward recency, and none of the first 100 default
results has a price. The premise that buyers arrive from inside the editor is therefore unproven for paid listings. The
two decisive gates (the AI rule and the paid-unlock condition) are not on the creators page. Its pitch to creators offers
a badge, a Discord and a directory listing, and no money. It is not a fail, because no text refuted paid or AI-made
templates. **Next check:** render `https://n8n.notion.site/n8n-Creator-hub-7bd2cbe0fce0449198ecb23ff4a2f76f` (the
`creatorHubDocument` in `n8n-creators.html:36`) and read the AI rule, the paid-unlock condition and any payout terms.
Notion renders on the client, so if the runner gets a shell, the fallback is the scout's GitHub `submit-templates.md` raw URL.
