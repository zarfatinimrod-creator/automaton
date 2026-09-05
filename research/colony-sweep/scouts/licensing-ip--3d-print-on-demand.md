# Scout notes — licensing-ip / 3d-print-on-demand

**Criterion:** 3D models and print-on-demand digital goods: platforms, payouts to Israel, and whether the work is genuinely software-only.
**Date:** 2026-09-05. **Search budget spent: 8 of 8 (the cap).** No searches were refused.

## Evidence grading used below
- **CODE** — a file rendered from github.com / raw.githubusercontent.com (strong, first-hand).
- **SNIPPET** — a WebSearch result summary quoting a page I could not render (weaker; the exact URL to open is named).
- **BLOCKED** — attempted WebFetch, refused by the egress proxy. Nothing was inferred from a blocked page.

## Hosts confirmed BLOCKED this session (do not retry)
cults3d.com, makerworld.com, wiki.bambulab.com, help.cgtrader.com, www.epicgames.com,
resources.turbosquid.com. Every primary platform page in this criterion is blocked; all
platform-terms evidence below is therefore SNIPPET or CODE, never a rendered platform page.

---

## 1. Cults3D — the only platform in this criterion with a documented, self-serve publishing API

**CODE.** Cults3D exposes a single GraphQL endpoint `https://cults3d.com/graphql`, HTTP Basic auth
with a self-service key generated at `https://cults3d.com/en/api/keys`. Confirmed independently in
many third-party repos:
- https://raw.githubusercontent.com/CheekyCodexConjurer/cults3d-api-docs/main/endpoints.md — rendered.
  Documents `createCreation` ("Publish a new design (metadata + inline fileUrls / imageUrls)") with
  `name, description, imageUrls, fileUrls, downloadPrice, currency, licenseCode, tagNames, metaTags,
  madeWithAi`; `updateCreation` for repricing; `salesBatch` exposing
  `income(currency: EUR) { value }` and `payedOutAt`; `ordersBatch` with per-order price and
  download URLs.
- https://raw.githubusercontent.com/jonasfrey/polyprints/main/cults3d_api.md — rendered. Same
  mutation, max 10 images and 10 files per listing, all URLs must be public HTTPS.
- https://github.com/manyfold3d/manyfold `app/deserializers/integrations/cults3d/base_deserializer.rb`,
  https://github.com/codeofaxel/Kiln `kiln/src/kiln/marketplaces/cults3d.py`,
  https://github.com/RBStephenson/STL-Studio `backend/app/services/cults.py` — all hard-code the
  same endpoint and Basic-auth scheme.
- https://github.com/mvanhorn/printing-press-library — a research brief plus **live probe logs**:
  `POST https://cults3d.com/graphql` without auth returns `HTTP 401 "HTTP Basic: Access denied"`,
  i.e. the endpoint is live; and it records a Cults3D API changelog entry as recent as July 2026.

So: listing, pricing, repricing and reading one's own sales ledger with real transaction ids are all
API-driven. **Publishing on Cults3D is genuinely software-only.** Producing the geometry is the open
question, not publishing it.

**Payouts. SNIPPET only.** Cults3D pays designers through **Hyperwallet** (PayPal group; onward to
PayPal, bank transfer, debit card, Venmo) or **Payoneer** in USD, after a 30-day pending period.
Sources seen: https://cults3d.com/en/pages/payouts-hyperwallet (BLOCKED — snippet only),
https://x.com/Cults3D/status/1697264841486905820 (announcement of Payoneer, snippet). Commission:
the designer keeps 80% of each sale ex-VAT (snippet, from Cults' own marketing blog —
https://cults3d.com/en/blog/articles/side-income-3d-printing-earn-money).
**No rendered evidence that Israel is an eligible payout country.** Payoneer is the standard
Israeli-freelancer rail, which makes YES likely, but that is inference and is not recorded as
evidence. **URL a human or unblocked agent must open to close it:**
`https://cults3d.com/en/pages/payouts-hyperwallet` and the payout-country list Payoneer/Hyperwallet
show inside the Cults account.

**The finding that changes the economics — SNIPPET, and it is decisive.**
https://cults3d.com/en/pages/filtering-ai-generated-designs (BLOCKED; snippet quoted the page):
designers **must** declare AI use, undeclared AI use risks design removal or account suspension, and
Cults has added a **"No AI" filter that is enabled by default across the whole site** — AI-declared
models "do not appear in search results or on other pages of the platform" by default. An honest
AI-model farm on Cults3D is therefore built into a default-hidden ghetto, and a dishonest one
violates both the platform's terms and our constitution. This is the single most important fact in
the criterion and it must be verified on the rendered page before anything is built.

**The way through, if there is one:** procedural / parametric geometry (OpenSCAD, CadQuery,
build123d) is *code*, not generative AI, and is the one production route that is both software-only
and arguably outside the `madeWithAi` flag. Whether Cults3D reads an agent-written parametric script
as "made with AI" is **unresolved** and is a disclosure question we must not answer in our own
favour. Until resolved: AMBER.

## 2. MakerWorld (Bambu Lab) — pays real cash, and is NOT software-only

**SNIPPET.** Exclusive Model Program: cash-out at **$0.066 per exclusive point**, minimum **$100**
balance, via third-party payment providers shown in-account, provider fees borne by the creator
(https://makerworld.com/en/exclusive-model-policy — BLOCKED, snippet). No country list was obtainable;
Israeli payability **UNKNOWN**.

**The kill is not payability, it is physical work.** SNIPPET from
https://wiki.bambulab.com/en/makerworld/tutorials/model-upload-guidelines and
.../print-profile-upload (both BLOCKED): a print profile **must be verified as printable and must
include at least one photo of a model printed with that profile**; model gallery images must include
at least one clear photo of the actual printed object; CC0 publication requires photos of a
personally printed object. Corroborating third-party report of tightening:
https://www.fabbaloo.com/news/bambu-lab-introduces-stricter-print-profile-guidelines-for-makerworld-contributors
(snippet). That requires a human, a printer and a camera on every single upload — it is exactly the
manual ops MISSION forbids. **Ceiling for us: ₪0.** Faking a print photo would be deception of the
platform and of buyers: constitutionally forbidden, so there is no clever route.

## 3. Printables (Prusa) — no evidence of a cash payout; API is read-only in practice

**CODE.** `https://api.printables.com/graphql/` is a live, undocumented, unauthenticated-readable
GraphQL endpoint — proven by ~157 code hits including
https://github.com/microlinkhq/unavatar `src/providers/printables.js`,
https://github.com/extesy/hoverzoom `plugins/printables.js`, and the printing-press-library brief
which live-tested an anonymous search → file list → signed download chain. But that is a *reader's*
route; **no `createPrint`-style publishing mutation appeared in any of the rendered code**, and the
same brief states Prusa has no official API and that schema drift between community wrappers is real.
Printables' reward currency (Prusameters/club) has **no rendered evidence of conversion to cash for
an Israeli**. Treated as a dead end rather than a finding.

## 4. CGTrader — best payout story of the group, weakest software-only story

**SNIPPET** (help.cgtrader.com BLOCKED). Payouts run through **Hyperwallet**, with **Payoneer** as a
free option and **no minimum accumulated balance** (wire/Webmoney require $200); Payoneer transfers
under $100 carry a $1 fee. Sources: https://help.cgtrader.com/hc/en-us/articles/360015145137-Payout-methods,
https://help.cgtrader.com/hc/en-us/articles/360015145157-Payout-fees,
https://www.cgtrader.com/forum/general-discussions/cgtrader-welcomes-payoneer-as-a-new-payout-method-for-designers.
Israel not named anywhere I could render → **UNKNOWN**. No API for publishing was found in GitHub
code search; uploads appear to be web-UI only, so the publishing step is not demonstrably
software-only. CGTrader's AI-content policy was not established.

## 5. TurboSquid (Shutterstock/Getty) — explicitly closed to AI-generated content

**SNIPPET**, from https://resources.turbosquid.com/general-info/terms-agreements/turbosquids-policy-on-publishing-ai-generated-content/
(BLOCKED) as quoted by search and corroborated by https://www.cgchannel.com/2025/05/cubebrush-bans-ai-generated-content-from-its-online-marketplace/
and https://www.pixelsham.com/2024/02/16/turbosquid-move-towards-supporting-ai-against-its-own-policies/:
TurboSquid does not accept AI-generated content from artists, on the stated ground that its
authorship cannot be attributed to a person. Note the asymmetry TurboSquid itself runs a generative
3D tool (https://www.turbosquid.com/ai-3d-generator/early-access) and licenses site assets for AI
training under opt-out — that is their business, not a licence for contributors. Combined with
human review of submissions, this is a **closed door** for an AI-production colony and only a narrow
one for procedural geometry. Payout route to Israel not established.

## 6. Fab (Epic Games) — the only marketplace found that explicitly permits AI content

**SNIPPET.** Fab and ArtStation Marketplace permit AI-generated content **if tagged `CreatedWithAI`**
and do not license existing assets for AI training (cgchannel, pixelsham, as above). Publisher
onboarding: https://www.fab.com/o/become-a-publisher, https://dev.epicgames.com/documentation/fab/publisher-get-started-in-fab.
Payouts go through "a third-party payout provider" in a listed set of countries and regions, and
Epic states receiving payments does not by itself make you eligible
(https://www.epicgames.com/help/c-34406160/c-34044796/a14621632 — BLOCKED). **Israel: UNKNOWN, and
this is the exact URL to open to settle it.** Fab is the highest-value unresolved question in this
criterion: it is the one platform whose stated AI policy and our production method are compatible.

## 7. Print-on-demand *physical* merch — already closed by this repo, not re-opened

docs/REJECTED.md:260-261 and :288 — multi-shop Etsy/POD is RED (the operator literature is about
defeating account-linking detection), Amazon Merch on Demand starts at a tier ladder that advances
only by sales and lists no Israel eligibility, and Etsy Payments for Israel is UNVERIFIED. Nothing
found this session changes any of that, and physical fulfilment is outside "digital goods" anyway.

## What the GitHub sweep incidentally showed (directory-grade, not demand)
A live third-party tool ecosystem exists around STL catalogues — Manyfold, STL-Studio, PrintStash,
Kiln, printgoat, several MCP servers (clugtu/cults3d-mcp, brs077/3dp-mcp-server). It proves the APIs
are real and used. It proves nothing about anyone paying for such a tool, and I found **no demand
evidence** for one. Recorded so the next scout does not mistake it for a market.

## Earnings evidence — deliberately not treated as evidence
The only monthly-earnings figures reachable were Cults3D's own marketing blog and an affiliate
newsletter (https://cults3d.com/en/blog/articles/side-income-3d-printing-earn-money,
https://wifimoolah.com/p/idea-61). A platform's blog telling designers they will reach $1.5-3.5k/month
is advertising, not data. **No independent seller-earnings data was obtained.** All monthly ceilings
in the structured output are therefore low-confidence and were set conservatively, not from those
numbers.
