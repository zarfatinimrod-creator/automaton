# Scout notes — vertical-niches / real-estate agent tooling

Scout: WORKER-SCOUT "real-estate", group `vertical-niches`.
Date of research: 2026-09-05. Search budget spent: **7 of 8 allowed** WebSearch calls,
plus 1 GitHub `search_code` (free) and 1 WebFetch of raw.githubusercontent.com (free).

Criterion, verbatim: *Real-estate agent tooling: listing generation, comparables, client
follow-up. What is bought at under $50/month.*

## Evidence grades used below
- **RENDERED** — I fetched the page and read it.
- **SNIPPET** — I saw a search-result summary quoting the page; the page itself was not opened.
- **CODE** — first-hand source code or repo docs on GitHub (strongest available here, since
  vendor sites are mostly egress-blocked).
- Nothing below rests on memory. Where I could only get a snippet I name the URL a human
  must open to close the claim.

---

## 1. What is actually bought under $50/month (price discovery)

SNIPPET, WebSearch 2026-09-05, query "AI listing description generator real estate agents
pricing per month 2026":
- ListingCopy.ai — $29/mo
- Write.Homes — free tier, paid from ~$14/mo
- Epique — ~$8–$80/mo by volume
- Copy.ai — free 2,000 words/mo, Pro $36/mo
- EstatePass listing description generator — free
- ChatGPT Plus / Claude Pro — $20/mo, used directly for the same job

Result URLs seen:
- https://www.g2.com/products/listingai/reviews
- https://www.estatepass.ai/best/listing-description-generator/
- https://selinaeizik.com/blog/best-ai-listing-description-generators
- https://thetooljury.com/best-ai-listing-description-writer-for-real-estate-agents/
- https://aitoolsbakery.com/blog/best-ai-listing-description-generators/

SNIPPET, WebSearch 2026-09-05, query "reddit realtors best cheap tools under $50 month":
- Lone Wolf **Cloud CMA starts at $49.00 per user/month** — this is the ceiling price for the
  comparables job.
- Common stack advice: "ChatGPT + Canva + one content tool = $20–50/mo total".
Result URLs seen:
- https://www.housingwire.com/articles/real-estate-marketing-tools/
- https://pickaxe.co/post/ai-tools-for-realtors
- https://www.capterra.com/p/10036048/RealtorOS/

**To close (a human must open):** https://www.estatepass.ai/best/listing-description-generator/
and any vendor pricing page directly — I could not render them.

Reading: the listing-generation job is priced at **$0–$36/mo and the free tier is credible**.
A no-brand new entrant with no marketing channel has no wedge here.

## 2. Comparables — the MLS gate (the decisive fact for the US)

SNIPPET, WebSearch 2026-09-05, query "MLS data access rules third party developer RESO Web API
IDX license requirement broker". Consistent across sources:
- Third-party developers get MLS data through an **approved vendor agreement** — a legitimate
  use case, a signed data-use agreement, and passing the MLS's vendor approval process — or via
  broker/agent membership.
- RESO Web API credentials are issued **by each local MLS** after agreeing to that MLS's data
  use and licensing policy.
- IDX / VOW / full broker feeds are three separate permission levels; each MLS sets its own
  schema, access rules and licensing terms.
Result URLs seen:
- https://www.mlsgrid.com/resources
- https://www.unlockmls.com/data-licensing
- https://mlsimport.com/direct-mlsimport-feeds-vs-idx-vendors/
- https://mlsimport.com/what-are-idx-mls-rets-and-reso-api/
- https://noseberrydigitals.com/guides/idx-rets-reso-integration-guide

**Implication for this mission.** Comparables is the highest-value job in the criterion
(Cloud CMA proves $49/user/mo), and it is the one job an Israeli software-only operation
**cannot** ship: access is per-MLS, contractual, human-negotiated, repeated across hundreds of
MLSs, and typically conditioned on broker participation. That is recurring human sales work,
not a one-time KYC step, so it fails the mandate outright. Scraping Zillow/Redfin instead of
licensing is a terms violation — RED, not a workaround.

**To close:** https://www.mlsgrid.com/resources (the actual MLS Grid license agreement PDF)
and one MLS's vendor application, e.g. https://www.unlockmls.com/data-licensing.

## 3. The Israeli comparables route — CODE-grade evidence

GitHub `search_code` for `nadlan.gov.il` returned 249 hits. Key primary sources:

- **`Etelis/nadlan-mcp`** — `docs/internals.md` RENDERED via
  https://raw.githubusercontent.com/Etelis/nadlan-mcp/main/docs/internals.md :
  | Backend | URL | Auth |
  |---|---|---|
  | Static data | `https://data.nadlan.gov.il/api` | **none** |
  | Dynamic API | `https://api.nadlan.gov.il` | HS256-signed envelope + reCAPTCHA Enterprise |
  | Search | `https://es.govmap.gov.il/TldSearch` | none |
  Static endpoints carry settlement/neighborhood summaries, price and rent trends, rental
  yields, street lists — "the bulk of the usable data". The **transaction-level** endpoints
  (`/deal-data`, `/deal-info`) are gated by reCAPTCHA Enterprise; the doc states automated
  clients cannot obtain valid tokens and get empty results / HTTP 405.
- **`skills-il/tax-and-finance`**, `israeli-property-appraisal/scripts/comparables.py` — CODE:
  hard-codes `API_TOKEN = "cf153c72-fb28-4b27-9db4-982bc89cb3b0"`, described in-source as a
  "public client constant embedded in the nadlan.gov.il front end… scoped to the
  nadlan.gov.il origin". The same skill's SKILL.md routes users to the **website** when no
  local MCP is available, i.e. it treats automated deal-level access as unreliable.
- Free existing wrappers, all public: `Etelis/nadlan-mcp`, `nitzpo/nadlan-mcp`,
  `IsraelZablianov/nadlan-skill`, `jmpfar/gov-nadlan-fetcher`, `MrAnde7son/nadlaner`
  (`gov/nadlan/helpers.py` shows the HS256 + domain signing), `ItamarBenAri/Nadlan-Scraper`,
  `AdanimInstitue/israel-nadlan-data`, plus a hosted free **Nadlan MCP** at
  https://agentskills.co.il/he/mcp/nadlan (cited by `skills-il/government-services`).
  Directory: https://github.com/danielrosehill/Israel-Open-Data-Resources

**Reading.** The static tier is honest, unauthenticated public data and is GREEN. The
transaction tier is behind reCAPTCHA Enterprise, and replaying a front-end-scoped token to
defeat it is exactly the kind of circumvention the constitution forbids — AMBER at best,
and I will not recommend it. Separately, the whole area is **already commoditised by free
open source and a free hosted MCP**, so there is no paid wedge left even on the GREEN part.

## 4. Distribution channels that do not require the owner to sell

This is the binding constraint, not the build. Two marketplaces surfaced:

**GoHighLevel marketplace** (SNIPPET, WebSearch 2026-09-05):
- Developers pay a **15% revenue share**; listings can be free, one-time or recurring; custom
  apps commonly monetise **per sub-account**.
- Monthly billing cycle, paid on the 15th for the previous month, **via Tipalti**, with a
  3-step payee registration.
- Real-estate listings that perform "do one specific job extremely well".
Result URLs seen: https://help.gohighlevel.com/support/solutions/articles/155000001217-set-up-your-marketplacapp-pricing ,
https://www.gohighlevel.com/marketplace-home-v2 , https://www.gohighlevel.com/home-5737 ,
https://gohighlevelgrowthstack.com/guides/gohighlevel-marketplace-2026
**To close:** the HighLevel support article above, and the developer terms at
https://marketplace.gohighlevel.com/ .

**Tipalti payability to Israel** (SNIPPET, WebSearch 2026-09-05): Tipalti pays 200+ countries,
120 currencies, 50+ methods; **Israel is inside its global-ACH local-bank-transfer coverage**
(the only Israel-specific restriction mentioned is that Israeli-based entities cannot pay
Pakistan — irrelevant to receiving). Result URL:
https://help.tipalti.com/hc/en-us/articles/31314361313815-Payment-methods-coverage-US-ROW
**To close:** that same help article, rendered.

**Follow Up Boss embedded apps** (SNIPPET, WebSearch 2026-09-05):
- Account owners/admins can create an Embedded App; you build an App URL and **submit it for
  review to be published**; there is a public integrations directory filtered by "Embedded Apps".
- Public REST API at `https://api.followupboss.com/v1/`, registration required with
  `X-System` / `X-System-Key` headers for anyone serving FUB customers; webhooks available.
- **No platform billing** — you would bill separately (Paddle/Stripe), so the payout rail is
  one we already operate.
Result URLs seen: https://docs.followupboss.com/docs/start-here-brand-new-integration ,
https://docs.followupboss.com/reference/getting-started ,
https://help.followupboss.com/hc/en-us/articles/360048843753-Create-an-Embedded-App ,
https://www.followupboss.com/integrations?tag=Embedded+Apps

## 5. Israeli broker CRM market

SNIPPET, WebSearch 2026-09-05 (Hebrew query). Incumbents: שת"פ נדל"ן (**99₪ / 199₪ per month**
tiers named in the snippet), Scalla CRM, WebTiv, Nadlan CRM, STSICONIC. Nadlan CRM advertises
commission splitting, collection tracking, monthly KPI and an annual report for the accountant.
Result URLs seen: https://shatapnadlan.co.il/crm , https://www.nadlancrm.co.il/ ,
https://www.webtiv.co.il/welcome/crm.asp , https://scallacrm.co.il/ , https://stsiconic.com/crm-real-estate/
**To close:** https://shatapnadlan.co.il/crm for the actual price table.

Reading: a crowded local market at 99–199₪/mo, sold by phone and demo to a relationship-driven
profession. Nothing here a silent, brandless self-serve product wins.

## Verdict

The criterion is **mostly a dead end under this mission's constraints**, and the reason is
specific rather than vague: the one job with a proven $49/mo price (comparables) is locked
behind per-MLS contracts that require repeated human negotiation; the one job that is trivially
buildable (listing text) has been driven to free by both specialist free tiers and general LLMs;
and follow-up is CRM, the most contested software category in the vertical. The only findings
worth carrying forward are distribution-shaped, not idea-shaped: the GoHighLevel marketplace
(pays Israel via Tipalti, 15% cut, no selling by the owner) and the Follow Up Boss embedded-app
directory (bill on our existing Paddle rail). Both are channels for a narrow tool, and neither
has public demand numbers, so both are medium-to-low confidence and would need an occupancy
test before any build hours.
