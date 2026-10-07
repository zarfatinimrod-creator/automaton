# Measurement: PostHog's free tier for the brand project and the page-view reader (tick 40, §9 4.10 item 1)

**Status: READ 4.10.2026, github grade. Ruling (c)'s condition, "the project and the query API stay on PostHog's free
tier", is MET on the text** as of PostHog/posthog.com at `4c27ff7` and PostHog/posthog at `526d64d`: the free plan has the
event allowance, the query API, the retention and the privacy settings the reads need, at no charge, with the reader far
below every stated limit. **It is a "today" answer, and PostHog has announced the change that would end it:** the query
API "is free to use while it's in the public beta" and PostHog plans "to charge a competitive rate for heavy usage", and
elsewhere "will eventually charge for it" (§(b)). So REOPEN is armed, not hypothetical (see "What would reopen it").
Nothing was created in PostHog and no connector was called; the project is the main thread's decision.

**The test as ruled** (`research/channel-loop/RULING-2026-09-30-documents.md:249`, `:258-260`, repo): `POSTHOG_READ_KEY` joins
step 6 "on one condition." "**Condition:** the project and the query API stay on PostHog's free tier — the board declared the
instrument ₪0 (`BOARD.md:73`, `:281`) but no pricing page is rendered (grade none here); if a query key needs a paid plan,
the row is not asked and the reader stays a no-op." REOPEN IF "PostHog's query API turns out to need a paid plan (the row
is withdrawn)" (`:267`). Queued as `logs/CHANNEL_LOOP.md` §9 "Queued 4.10 (tick 39)" item 1, which replaces the tick-36
item 5: "read PostHog's free-tier terms for the query API first".

**Grades.** `github` = a file read on GitHub at a pinned commit, cited `<repo>@<sha> <path>:<line>`; `repo` = our own files;
`none` = inference, flagged. "Not in the source" means the files listed below do not say it, not that it is false. Every
quote in a table below, and in a paragraph that cites a PC or PH file or the terms reference by line, is checked on the
lines it cites by `src/__tests__/revenue/posthog-free-tier-sources.test.ts`: against the pinned copies in
`research/measurements/posthog-free-tier-sources/` (PC's `/contents/` files and its LICENSE, all of PH), and for PC's
three `src/` files, which are not copied, against the quotes that test lists as read at PC on 4.10 (added after the
tick-40 review; until then the check was a script outside the repository).

## What was read

Two pins, both the repository's `master` HEAD on 4.10.2026 (from the repo's commit feed on github.com):
**PC** = `PostHog/posthog.com@4c27ff7578f24c75b40d1024e4e0cbd40c9922ba` (2026-10-03), **PH** =
`PostHog/posthog@526d64dd82340b1bf4293d6d9baea7e965997048` (2026-10-04T09:40:49Z). Each file was fetched raw from
`https://raw.githubusercontent.com/<repo>/<sha>/<path>` (HTTP 200) on 2026-10-04 between 09:42 and 09:49 UTC.

| Pin | Path | Lines | sha256 | Read |
|---|---|---:|---|---|
| PC | `src/pages-content/pricing-data.js` (the pricing page's FAQ data) | 335 | `56266b5ef9e45fd3…` | all |
| PC | `src/hooks/productData/product_analytics.tsx` | 469 | `b8db7bfc30a83d36…` | grepped (free, allowance, retention, SQL) |
| PC | `contents/docs/data/events-retention.mdx` | 38 | `264636ac81e23245…` | all |
| PC | `contents/docs/sql/index.mdx` | 160 | `e003193d449c07e9…` | all |
| PC | `contents/docs/api/queries.mdx` | 459 | `21d29e3753930d01…` | 1-45, 415-459; grepped |
| PC | `contents/docs/api/index.mdx` | 169 | `f946a15be2bc2fad…` | grepped (rate limits) |
| PC | `contents/docs/api/personal-api-keys.mdx` | 53 | `c3c57194e58b11ff…` | all |
| PC | `contents/docs/endpoints/endpoints-vs-query-api.mdx` | 36 | `c620d20449ee9b03…` | all |
| PC | `src/hooks/productData/endpoints.tsx` | 326 | `fa20f23b74975b10…` | grepped (pricing) |
| PC | `contents/docs/settings/projects.mdx` | 94 | `f453ec30a2d9f626…` | 1-70 |
| PC | `contents/docs/settings/organizations.mdx` | 110 | `d339327e13770fe5…` | 1-28, 50-63 |
| PC | `contents/docs/privacy/data-collection.mdx` | 329 | `cf8b8984dd3aa2ce…` | 1-40, 143-312 |
| PC | `contents/docs/privacy/data-storage.mdx` | 293 | `227922aec7c42706…` | 1-60 |
| PC | `contents/docs/product-analytics/privacy.mdx` | 98 | `92ac509b89d65f5e…` | all |
| PC | `contents/tutorials/cookieless-tracking.md` | 124 | `03f7a9208c9137b6…` | all |
| PC | `contents/docs/libraries/js/persistence.mdx` | 156 | `39bfb328ea75b7df…` | grepped |
| PC | `contents/docs/how-posthog-works/ingestion-pipeline.mdx` | 206 | `2c3a193c16d4cee7…` | grepped (pipeline order) |
| PC | `LICENSE` | 34 | `5391d207b47157cc…` | all |
| PH | `posthog/api/query.py` (the `/query/` endpoint) | 662 | `9fd7d1cbcc8a747a…` | 229-303, grepped for plan gates |
| PH | `posthog/api_queries_budget.py` | 217 | `7dd0ba08e2c99f34…` | 1-90 |
| PH | `posthog/settings/web.py` | 1565 | `1255ad0ead5ccd8d…` | 1025-1038 |
| PH | `posthog/models/team/team.py` | 1295 | `8d2648ab6cd0bd88…` | grepped (`anonymize_ips`, `cookieless_server_hash_mode`) |
| PH | `products/cdp/backend/models/hog_functions/hog_function.py` | 493 | `77a09fdabeab259f…` | 420-493 |
| PH | `nodejs/src/cdp/templates/_transformations/geoip/geoip.template.ts` | 96 | `09db26b18ebf6cbc…` | 1-45 |
| PH | `nodejs/src/ingestion/common/steps/event-processing/prepare-event-step.ts` | 73 | `0f708bd3f0a7fbde…` | 35-50 |
| PH | `LICENSE` | 25 | `6d82d67dba42eb94…` | all |

The terms and privacy pages themselves are in `research/channel-loop/terms/posthog-terms-2026-10-04.md` and
`posthog-privacy-2026-10-04.md` (pinned references at `35fc817`, byte-identical at PC). Licences: PC's docs under
`/contents/` are MIT; everything else in PC (the `src/` files above included) carries "Please do not duplicate, copy, or
use our website" (PC `LICENSE:5-6`), so those three are quoted and not copied; PH is MIT Expat outside `ee/` (PH
`LICENSE:3-7`). The other 23 files, the two LICENSEs among them, are kept byte for byte in
`research/measurements/posthog-free-tier-sources/` with `SOURCES.json` (pin, path, lines, bytes, sha256 of all 26). One
path tried did not exist: PC `contents/docs/cdp/transformations/template-geoip.mdx` (HTTP 404).

## (a) Product analytics events at our volume (a few thousand a month at most)

| Question | Finding | Quote | Source | Grade |
|---|---|---|---|---|
| Is there a free plan? | **Yes**, without a card, and it does not expire | "PostHog is free to use and each product has a generous free monthly allowance (1M events for analytics, 5K session replays, 1M feature flag requests, and more)." · "Yes, as long as you stay under the free tier limits." (Q: "Can I use PostHog completely free forever?") · "PostHog's free tier doesn't expire … no credit card or sales call required." | PC `src/pages-content/pricing-data.js:139-141`, `:306-310`, `:236-238` | github |
| The allowance | **1,000,000 events a month**, reset monthly | "You get 1 million events free every month." · "Every month, your usage is reset and you get another 1M events, 5K session replays, and more to use." | PC `src/hooks/productData/product_analytics.tsx:39`; PC `pricing-data.js:170-171` | github |
| What happens above it, on the free plan | Events dropped, **not billed** | "On the free plan, any additional events are permanently dropped and feature flags will return a default quota limited response." | PC `pricing-data.js:160-162` | github |
| What a card changes | The pay-as-you-go plan bills above the allowance; paid features need a card | "On the pay-as-you-go plan, we charge based on usage for everything above the free allowance." · "(though you will need to enter your credit card to unlock those features)" | PC `pricing-data.js:160`, `:100-101` | github |
| Our volume against it | A few thousand `$pageview` events a month is under 1% of 1M | — | repo (the task's expected volume) | repo |
| Storage | No charge for stored events | "There are no additional storage costs or fees." | PC `pricing-data.js:67-68` | github |

**(a): covered.** At our volume the allowance is not approached, and on the free plan an overrun drops events rather
than billing. The ₪0 rule therefore rests on the organization staying on the free plan with no card, which is also the
owner's step and not ours (the ₪0 rule of 27.9, `MISSION.md:352-354`: "₪0 until the ledger shows it works", "Nothing is
bought"; the owner's own clicks, "identity, payout, and anything bought", are outside the standing consent, `:349-350`).

## (b) The query API that `src/revenue/page-views.ts` reads

What the reader does (repo): one HogQL query per completed week per clock, `POST {eu|us}.posthog.com/api/projects/:id/query/`
with a personal API key as Bearer (`src/revenue/page-views-reader.ts:264-269`), one after another and at most
`MAX_WEEKS_PER_READ` (20) in one tick, so a reader catching up after a gap sends up to 20 at once and a caught-up one a
single query a week (`page-views-reader.ts:62`, `:348`). Each is a `SELECT … count() … GROUP BY pathname … LIMIT 1000`
that returns at most `sitePaths(pages).length + 2` rows: the site's paths plus a preview row and an `(other)` row, where
`sitePaths` gives two paths per page (three for the home page), so 23 paths for il-biz-tools' 11 `.html` pages and at
most 25 rows on 4.10.2026 (`src/revenue/page-views.ts:177-187`, `:189-217`, `QUERY_ROW_LIMIT` `:152`). No `OFFSET`.

| Question | Finding | Quote | Source | Grade |
|---|---|---|---|---|
| Is SQL access on the free plan? | **Yes, fully** | `availability:` / `free: full` | PC `contents/docs/sql/index.mdx:5-6` | github |
| The endpoint and the key | `POST /api/projects/:project_id/query` with a personal API key holding query read; EU host for EU cloud | "a [personal API key](…) with the project query read permission and make a POST request to `/api/projects/:project_id/query` endpoint" · "change `us.posthog.com` to `eu.posthog.com` if you're on EU cloud" | PC `sql/index.mdx:75`, `:83`; PC `contents/docs/api/queries.mdx:33`, `:37` | github |
| Does the endpoint check the plan? | **No plan gate in the code.** `create` validates and runs the query; the plan only picks throttles (`API_QUERIES_CONCURRENCY` feature) and the read-budget rate | `scope_object = "query"` · `def create(self, request: Request, *args, **kwargs) -> Response:` · `self.team.organization.is_feature_available(AvailableFeature.API_QUERIES_CONCURRENCY)` | PH `posthog/api/query.py:231`, `:288`, `:255-271` | github |
| Can a free account mint the key? | Nothing marks personal API keys as paid; only the organization-wide key **view** "requires a plan that includes organization security settings" | quoted | PC `contents/docs/api/personal-api-keys.mdx:7`, `:53` | github |
| Is it charged today? | **No**: free during the public beta | "**Will there be API pricing?** The SQL API is free to use while it's in the public beta and we work out the details. After we launch for real, we plan to charge a competitive rate for heavy usage. Stay tuned." | PC `sql/index.mdx:148` | github |
| Will it be? | **Announced**: "eventually" | "**Future pricing** - We strongly discourage Query API usage and will eventually charge for it." | PC `contents/docs/endpoints/endpoints-vs-query-api.mdx:16` | github |
| Rate limits | 2,400 requests/hour, 240/minute, 3 concurrent, 10 s execution, per project; some projects still on 120/hour | "API queries are limited at the project-level to:" · "2400 requests per hour" · "240 requests per minute" · "3 queries running concurrently" · "10 seconds of max execution time" · "an old limit of 120 queries/hour" · "has a rate limit of `2400/hour`" | PC `queries.mdx:423-430`, `:437-438`; PC `contents/docs/api/index.mdx:36` | github |
| Hourly read budget (personal-key queries) | Exists, per project, in bytes read; a paid plan's is larger. **Code default: 20 GB/hour free, ×10 paid, 24 hours of carry-over**; the deployed value is not in the source (each is an environment override) | "Queries made with a personal API key draw from an hourly read budget per project" · "For the larger budget, [subscribe to a paid plan](/pricing)." · `"API_QUERIES_BUDGET_FREE_BYTES_PER_HOUR", 20_000_000_000` · `"API_QUERIES_BUDGET_PAID_MULTIPLIER", 10.0` · `"API_QUERIES_BUDGET_CAPACITY_HOURS", 24.0` | PC `queries.mdx:443`, `:449`; PH `posthog/settings/web.py:1027-1031`; PH `posthog/api_queries_budget.py:78-85` | github |
| What the endpoint is for | A listed use is ours: "Pulling aggregated PostHog data into your own or other apps."; the endpoint "is intended for ad-hoc analytics and embedded use cases"; **not exports**: "Bulk or recurring exports of `events`, `persons`, or `query_log` are not supported … any integration that pulls more than a few thousand rows on a schedule" | quoted | PC `contents/docs/api/queries.mdx:13`, `:17`, `:19` | github |
| Third-party connectors | **Turned away**: "Third-party connectors must use [batch exports](…) … not `/query`. Connectors built on `/query` are not supported and will be rate-limited or rejected." The reader is not one: it is our own script reading our own project with a key on our own account, which is what a personal API key is for: "They're the right choice when you're using PostHog from your own scripts, automations, or any integration tied to your own account." | quoted | PC `queries.mdx:20`; PC `contents/docs/api/personal-api-keys.mdx:7` | github |
| Will it keep working? | **Not promised, and not a cost.** PostHog reserves the right to restrict export-like queries "including without prior notice", and "Pipelines built on `/query` may break at any time." A break is a reliability risk, separate from the free-tier question: the reader's week goes unread and the line shows `reader_down`, a blocker, a day after the week became readable (repo `src/revenue/page-views.ts:50`); nothing is charged | quoted | PC `queries.mdx:22`; repo `src/revenue/page-views.ts:50` | github |
| Our use against it | A weekly aggregate of at most a few dozen rows (25 on 4.10), one query per completed week, sent one at a time, at most 20 in one tick when catching up: no export, nowhere near 240/minute or 2,400/hour, never more than one of the 3 concurrent, and a week of a few thousand events is a sliver of a 20 GB/hour budget | — | repo (`src/revenue/page-views-reader.ts:62`, `:348`); budget arithmetic is ours | none (arithmetic) |
| The alternative if the query API is priced | Endpoints: "free during beta. When pricing ships, it will be usage-based with a generous monthly free tier" | quoted | PC `src/hooks/productData/endpoints.tsx:31-32` | github |

**(b): covered today.** The query API is on the free plan, ungated in code and uncharged, and the reader sits inside every
limit. Its use is one the page lists, "Pulling aggregated PostHog data into your own or other apps." (PC
`queries.mdx:13`), made by our own script with a key on our own account, which is what personal API keys are for (PC
`personal-api-keys.mdx:7`), and not a third-party connector, which the page turns away (PC `queries.mdx:20`): if PostHog
read "connector" more widely, the reader would be rate-limited or rejected, not billed. **The reader's exposure is the
announced pricing**, and the free plan's read budget, whose deployed size is not in the source. Its reliability is a
separate risk: "Pipelines built on `/query` may break at any time." (PC `queries.mdx:22`), which the reader would show as
`reader_down`, not as a cost.

## (c) Retention long enough for the 8-week read (and its 16-week extension)

| Question | Finding | Quote | Source | Grade |
|---|---|---|---|---|
| Free plan retention | **1 year** of events | "| Free | 1 year" · "Events and metadata are guaranteed to be retained for 7 years on any paid plan and 1 year on a free plan." | PC `contents/docs/data/events-retention.mdx:16-18`; PC `pricing-data.js:77-78` | github |
| What it does to a query | A query reads only events inside the window | "A query on the events table reads only the events inside the window." | PC `events-retention.mdx:27` | github |
| The reads we need | D0+56 over weeks 1-8, one extension to D0+112 over weeks 9-16; the domain-period kill reads 8 consecutive weeks | — | repo (`src/revenue/page-views.ts:41-48`) | repo |

**(c): covered.** 16 weeks is well inside a year, so `page-views.ts:424`'s "PostHog keeps the events, so a late read is the
same count" holds on the free plan for any week read within a year of it.

## (d) The privacy settings the two counters require

What is required (repo): the il-biz-tools counter uses posthog-js with `cookieless_mode: 'always'` and `persistence: 'memory'`,
and needs the project's "Cookieless server hash mode" (`products/il-biz-tools/src/lib/analytics.js:13-25`, `:45-46`;
`products/il-biz-tools/src/config/site.json:22`). The T1 web arm sends one raw `$pageview` to `/i/v0/e/` without posthog-js,
and its project "must have \"Discard client IP data\" on and GeoIP enrichment off" (`products/chart-explainer/page.py:34-37`;
the page's disclosure promises the project is set "to discard it and to derive no location from it",
`research/faceless-youtube/PREREG-DECISIONS.md:591-596`).

| Question | Finding | Quote | Source | Grade |
|---|---|---|---|---|
| Cookieless mode and memory persistence | Client options of the free SDK; the project needs the server-hash setting turned on first | "Before configuring cookieless tracking, you need to enable \"Cookieless server hash mode\" in your PostHog project settings under **Project Settings** > **Web analytics**." · "Never stores PostHog data in cookies or local/session storage" · "`persistence: \"memory\"`: Stores everything in page memory" | PC `contents/docs/privacy/data-collection.mdx:286`, `:292`; PC `contents/docs/libraries/js/persistence.mdx:21` | github |
| Is server-hash mode a paid setting? | **Not in the source** that it is: no `availability` block on the page, no plan named; in the code it is a per-project field, default off | `cookieless_server_hash_mode = field_access_control(` … `default=CookielessServerHashMode.DISABLED,` | PC `data-collection.mdx:1-6`; PH `posthog/models/team/team.py:616-618` | github |
| "Discard client IP data" | A project toggle (and an organization default); **EU organizations default to discarding** | "enable the **Discard client IP data** toggle" · "**EU organizations**: Automatically default to IP data capture disabled for GDPR compliance." | PC `contents/docs/privacy/data-storage.mdx:39`; PC `data-collection.mdx:157`; PC `contents/docs/settings/organizations.mdx:63` | github |
| Is it paid? | **Not in the source** that it is; in the code a new project takes the organization's default | `team.anonymize_ips = kwargs.get("anonymize_ips", organization.default_anonymize_ips)` | PH `posthog/models/team/team.py:124` | github |
| Does discarding the IP stop GeoIP? | **No.** The IP is dropped from the stored event, after transformations ran; GeoIP must be turned off separately, as `page.py` already says | "Transformations like [GeoIP enrichment](…) … can **still use the IP** before it is discarded" · `if (properties['$ip'] && input.team.anonymize_ips) {` / `delete properties['$ip']` (in the event-processing step, which the pipeline runs after transformations) | PC `data-storage.mdx:43-44`; PH `nodejs/src/ingestion/common/steps/event-processing/prepare-event-step.ts:41-43`; PC `contents/docs/how-posthog-works/ingestion-pipeline.mdx:94-106` | github |
| Is GeoIP on by default? | **Yes: every new project gets a GeoIP transformation, enabled** (unless the deployment disables MaxMind) | `def enabled_default_hog_functions_for_new_team(` … `"enabled": True,` · "Disabling default [GeoIP enrichment transformations]" | PH `products/cdp/backend/models/hog_functions/hog_function.py:423`, `:466`; PC `data-storage.mdx:31` | github |
| Can GeoIP be turned off on the free plan? | The template is marked free; turning a transformation off is not named as paid anywhere read. The template also skips an event with no `$ip` or with `$geoip_disable` | `free: true,` · `if (event.properties?.$geoip_disable or empty(event.properties?.$ip)) {` | PH `nodejs/src/cdp/templates/_transformations/geoip/geoip.template.ts:4`, `:33` | github |
| Server-hash mode and GeoIP | In server-hash mode the IP is stripped before transformations, so GeoIP does not enrich | "In cookieless mode, the IP is stripped before transformations run, so GeoIP enrichment and bot detection won't enrich your events." | PC `data-storage.mdx:48`; PC `contents/tutorials/cookieless-tracking.md:116` | github |
| Does server-hash mode cover the T1 page's raw event (not sent by posthog-js in cookieless mode)? | **Not in the source.** Turning GeoIP off covers both counters either way | — | — | none |

**(d): available on the free plan as far as the text says**; nothing read marks any of the four settings as paid.

## Two findings outside the four questions

1. **One project per free organization.** "Since free organizations are limited to one project, you may need to temporarily
   upgrade your plan and add billing details to create a second project" (PC `contents/docs/settings/projects.mdx:66`;
   the page's `availability` is `free: partial`, `:5-6`). Organizations themselves are free and unlimited:
   `multipleOrgs:` … `free: true` and "PostHog Cloud users can create, manage, and join organizations without limits."
   (PC `organizations.mdx:11-13`, `:28`). So il-biz-tools with pcn874 (one host) fits one free project; **if the T1
   sub-brand (`chartsplained`) gets its own project, it needs its own free organization, never a paid plan.** Shared or
   separate is a decision for the main thread with a consequence it should weigh [none, inference]: the project token is
   public in each page's source (`products/chart-explainer/page.py:26-30`), so one shared project would print the same
   `phc_` token on the brand's site and the sub-brand's, linking the two in public, which the sub-brand exists to avoid
   (`research/channel-loop/BOARD-LOOP.md:117`).
2. **GeoIP is on in every new project** (above). Creating the project is not enough for the T1 arm: the transformation has
   to be turned off afterwards, and the disclosure on the T1 page is false until it is.

## What it settles

**Ruling (c)'s condition: MET on the text** (github grade, 4.10.2026). The free plan holds a project at our volume (a), the
query API with a query-read personal key, uncharged and ungated (b), a year of retention (c), and the privacy settings (d).
Order still as ruled: the project first (cookieless, brand name, no PII), `projectKey` and `projectId` into `site.json`,
then the `POSTHOG_READ_KEY` row.

**What would reopen it** (each one withdraws the step-6 row and leaves the reader a no-op, as the ruling says):

1. PostHog prices the query API (announced: PC `sql/index.mdx:148`, PC `endpoints-vs-query-api.mdx:16`) in a way that
   reaches a free-plan project at one weekly query, or adds a plan gate to `create` (none at PH `posthog/api/query.py:288`),
   or cuts the free plan's read budget below one weekly query (code default PH `posthog/settings/web.py:1027-1029`). Then the
   route to weigh is Endpoints' free tier (PC `src/hooks/productData/endpoints.tsx:31-32`), not a paid plan.
2. The free allowance (1M events, PC `pricing-data.js:139-141`) or retention (1 year, PC `events-retention.mdx:18`) falls
   below a few thousand events a month or 16 weeks.
3. The organization the connector creates the project in is not on the free plan: a paid plan, or a trial ("trials count
   as paid while active", PC `queries.mdx:449`). **Not in the source:** which plan the connector's account is on; that is a
   live read, the first thing to check before creating anything.
4. PostHog uses the Terms against a no-credit account: it may "introduce new charges" on thirty days' notice (6.1,
   `research/channel-loop/terms/posthog-terms-2026-10-04.md:231-233`) and terminate an account without prepaid credits on
   thirty days' notice (7.1, `posthog-terms-2026-10-04.md:282-285`).
5. A second project is wanted and the free route (a second organization) is refused.

**What it does not settle.** Whether the connector's account is on the free plan, whether it can mint a personal API key
(the ruling has the owner mint and paste it, so this does not block), the deployed size of the free read budget, and
whether server-hash mode reaches the T1 raw event: none is in the source, and each is a live read for the main thread.

## 4.10 (tick 40, main thread): the live check through the connector, and the decision

Read-only calls through the attached PostHog connector (`project-get`, `organization-get`, `projects-get`, `billing-overview-get`, `read-data-schema`), 4.10 ~10:35 UTC. Grade: live account state, not a text.

- **Plan:** `billing_plan: free`, `subscription_level: free`, `has_active_subscription: false`, `trial: null`, `free_trial_until: null`. Ruling (c)'s condition holds live as well as on the text (above).
- **Projects:** the free plan's `organizations_projects` feature has `limit: 1`; the organisation holds exactly one project, created 20.8.2026. That project carries another product's telemetry (139 events in the current billing period, custom game events plus `$pageview` and `$web_vitals`; session recording on, 8 recordings). It is the owner's existing product, not the brand's, and the brand never shares it: mixed data, and its public project token already identifies that other product's site.
- **Consequence:** the colony cannot create the brand's project in this organisation on the free plan (`project-create` would be refused or push toward the paid "Boost" add-on, which the ₪0 rule forbids). Organisations are free and unlimited (`organizations.mdx`, above), but the MCP server has no tool that creates one, so a second organisation is an owner click in PostHog: one time, free, no identity check, inside an account the owner already holds. Proposed as a §6 free step (after step 8, before any deploy's D0); FABLE_QUEUE row 25 confirms its place.
- **After the click:** the colony switches the connector's active organisation (`switch-organization`), creates the project (`project-create`) with session recording off, GeoIP off (every new project gets it on, above), "Discard client IP data" on and cookieless mode, and writes the project token to `products/il-biz-tools/src/config/site.json`. Nothing was created on 4.10.
- **REOPEN (unchanged):** PostHog's announced charge for the query API; a plan change on the account; a cut to the free read budget, the event allowance or the retention.
- Ruled 7.10 (`research/channel-loop/RULING-2026-10-07-posthog-organisation.md`): the click is step 6 part ד, asked now, two organisations (brand, T1 sub-brand); the Default Project is renamed and configured, never a `project-create` beside it; REOPEN triggers R1-R3; fallbacks F1-F3.
