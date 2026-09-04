# GROUP REPORT — `distribution`

**Supervisor:** SUPERVISOR agent, group `distribution`. **Model:** Opus 5. **Date:** 2026-09-04.
**Scouts merged:** 8 — `launch-platforms`, `directories`, `seo-2026`, `app-store-aso`,
`israeli-channels`, `email-acquisition`, `short-video`, `partnerships-integrations`
(6 arrived as JSON this wave; `short-video` and `partnerships-integrations` were read from
`research/colony-sweep/scouts/` per the brief).

---

## Headline

**This group earns nothing, and it cannot — by construction.** Distribution is not a revenue line;
it is the precondition for other groups' revenue. Across 8 scouts and roughly 40 findings there is
**not one buyer who pays us for distribution**. Every candidate is a channel that would have to
convert on a rail we already own (Paddle, Telegram Stars, Apify, x402).

That makes this group the direct test of **MISSION constraint 7** — *nobody knows how a stranger
finds any of this, and until they do every ceiling in this repo is ₪0* — and the answer the sweep
returns is worse than the constraint feared:

> **Every human-audience channel is closed to us by the platform's own written rules, and every
> machine-audience channel ranks on prior success.** Those are not two problems. They are one
> problem with two faces, and between them they close the entire surface.

- Hacker News forbids "generated text or AI-edited text" verbatim and has no write API.
- Product Hunt names "bots… or other artificial activity" in its prohibited list and requires a
  photographed personal account plus a maker present in the comments all day.
- Reddit's Responsible Builder Policy requires bots to disclose themselves and forbids
  "substantially similar content across subreddits" — the compliant bot is the one that may not promote.
- Facebook removed the Groups publishing API and the `publish_to_groups` permission on 2024-04-22.
- WhatsApp has no Channels publishing API at all, and business-initiated messages need prior opt-in.
- Israeli SMB forums and municipal business groups are joined by a human sending a WhatsApp message.
- Apify Store, Chrome Web Store, Shopify App Store and Gumroad Discover all rank on installs,
  ratings, popularity or a prior sale (the last three already proven from platform code in
  `audits/store-promotion.md` and `docs/REJECTED.md`).

**Two things survived**, both cheap, both GREEN, both Israel-payable, and neither of them net-new
revenue: an Apify Store listing built for the four quality-score categories a day-one publisher can
actually max, and Hebrew transactional tool pages on `il-biz-tools`. Their attributable ceilings are
₪500 and ₪400 — **and both sit inside ceilings other groups have already counted.** The board must
not add them to the portfolio total. The group's honest net-new contribution to ₪20,000/month is **₪0**.

---

## What I verified myself (not inherited)

| Claim | Method | Verdict |
|---|---|---|
| Apify quality score has 8 categories and drives Store ranking | RENDERED `raw.githubusercontent.com/apify/apify-docs/.../quality_score.mdx` | **CONFIRMED**, and stronger than the scout said: *"Actors with higher quality scores tend to rank higher on **both surfaces**"* — Store search **and MCP server search** |
| Stripe does not self-serve cross-border payouts to Israel | WebSearch (docs.stripe.com EGRESS_BLOCKED) | **CONFIRMED.** Platforms in US/UK/EEA/Canada/Switzerland pay connected accounts in those same regions; *"Stripe doesn't support self-serve cross-border payouts to countries outside the listed regions."* Israel is outside all five. This **promotes the newsletter-sponsorship line from UNKNOWN to dead** |
| AI Overviews are rarer on transactional than informational queries | WebSearch, multiple independent aggregators | **CONFIRMED directionally, numbers unstable**: informational 36%, transactional quoted as 5% (Seer) and 19% (vertical breakdown) by different sources. The direction holds; no single figure should be quoted |
| MCP Registry publishing is fully automated, no human review | RENDERED `.../registry/main/docs/modelcontextprotocol-io/quickstart.mdx` | **CONFIRMED.** `mcp-publisher login github` → `mcp-publisher publish`; no review step anywhere in the flow |
| n8n verified community node needs no human conversation | RENDERED `.../n8n-docs/.../submit-community-node.md` | **CONFIRMED.** Scaffolding + **no run-time dependencies** + npm publish with GitHub Actions provenance, then *"sign up or log in to the n8n Creator Portal and submit"* — a portal, not a thread |

I did **not** re-verify Hacker News, Product Hunt or Reddit. Those are kills; killing on
verbatim-mirrored guideline text plus a Wayback capture is adequate, and spending searches to
re-confirm a rejection would be waste.

---

## Ranked survivors — 2

### 1. Apify Store listing built for the four day-one quality-score categories — score 62

Publish `products/apify-il-open-data` and construct the listing against the four of Apify's eight
quality-score categories a zero-run publisher controls: **Ease of use, Pricing transparency,
Trustworthiness, Congruency of texts**. The other four — Reliability, Popularity, Feedback and
community, History of success — are gated on prior success and cannot be moved on day one.

- **Buyer:** Apify users searching Store for Israeli statutory/open-data scraping. Apify bills them
  and pays us 80% of fees minus platform usage costs.
- **Israel payable: YES**, and this is the strongest payability evidence in the group —
  `audits/store-promotion.md` renders the Store T&Cs and finds **no country exclusion**, with two
  independent routes to Israel (PayPal ILS withdrawal, SWIFT wire from the Czech Republic).
- **Ceiling ₪500/month, and it is NOT net-new.** The whole Apify line is audited at ₪1,500 across
  5–8 Actors (`docs/REJECTED.md`). We have one Actor, in a niche that is **occupied** —
  `apify.com/swerve/supermarket-prices` wraps the same `data.gov.il` endpoint. ₪500 is one
  well-listed Actor's honest share of an already-counted line.
- **Why rank it anyway:** it is the only item in 8 scout reports with rendered-primary evidence for
  its mechanism, it costs 8 hours, and it is **pending task #20** — the cheapest existing test of
  constraint 7. If it returns zero runs from strangers in 30 days, the ₪1,500 Apify line is ₪0 and
  the board learns that for 8 hours instead of finding out after a portfolio is built on it.
- **First step (one action):** rewrite `products/apify-il-open-data/README.md` to Apify's own
  `actor-readme.mdx` section list — Introduction, Tutorial, Pricing (per-event price stated),
  Input/output examples, FAQ + support, 300+ words, keyword-bearing H2/H3 — then `apify push` and
  publish to Store.
- **Kill:** 30 days after publishing, zero runs from accounts other than ours. Also kill on sight
  any version that links from the listing to our own paid site: Store Publishing Terms
  §2.2.4.2(i) forbids promoting a competing service from a Store listing.

### 2. Hebrew transactional tool pages on `il-biz-tools` — score 46

One URL per named Israeli computation, form or rate, each with the calculation on the page, its own
title/H1/FAQPage schema, and **zero** "what is X" explainers. This is the only channel in the group
that is not gated on a platform's prior-success ranking, and the only one the colony fully controls.

- **Buyer:** Israeli עוסק פטור/מורשה searching a specific computation, converting to the existing
  **₪79 one-time** Pro tier through Paddle.
- **Ceiling ₪400/month, demoted from the scout's ₪1,500.** The arithmetic the scout did not do:
  Pro is ₪79 **one-time**, not a subscription, so ₪1,500/month needs ~19 *new* buyers *every month,
  forever*. Against the scout's own kill threshold of 300 organic clicks/month at month 8 and a
  1–2% purchase rate, the honest number is ₪240–475. And the monetisable surface is thin — Pro
  currently sells a logo and an accent colour on an invoice.
- **Timeline is the real cost.** New domains rank long-tail at 2–4 months and build meaningful
  traffic at 4–8. **A line whose channel is SEO cannot be a line that earns this quarter.**
- **First step (one action):** verify the live `il-biz-tools` domain in Google Search Console and
  export the existing query/impression report. Nobody in this repo has ever looked at it; it is
  free, it is the only Israel-specific evidence that exists about whether these pages rank at all,
  and it costs zero of the 25 build hours to find out before spending them.
- **Kill:** <300 organic clicks/month across the tool pages at month 8, or zero Paddle purchases
  attributable to organic search at month 12.
- **Boundary:** stay under a few hundred genuinely-distinct pages. One page per city or per year
  with a substitution is scaled content abuse (Google names it in four spam policies) and MISSION
  constraint 6 rejects it independently.

---

## One item that is not a line and should be done anyway

**The §30א(ג) disclosure sentence at checkout — one hour, and otherwise permanently lost.**
Israel's spam law permits marketing to a buyer without fresh consent only if, *at the moment they
gave their details*, they were told the details would be used for advertising and were given a
chance to refuse. That sentence is missing from every checkout we run. Every customer acquired
before it is added can **never** be lawfully emailed — the right is not retroactive. It is a copy
change in metadata we already control, it needs no owner action, and it costs an hour. It has a
ceiling of ₪0 today because we have no customers, which is exactly why it is cheap to fix now.

---

## Rejected, and why

| Line | Why rejected |
|---|---|
| **Hacker News / Show HN** | Guidelines forbid *"generated text or AI-edited text"* verbatim; API is read-only; own-post ratio triggers a silent filter. RED, and it pays nothing |
| **Product Hunt launch** | *"bots… or other artificial activity"* is in the prohibited list; requires a photographed personal account ≥1 week old and the maker live in the comments — recurring human marketing labour, not a KYC exception |
| **Reddit self-promotion** | Spam Policy and Responsible Builder Policy close it from both sides: undisclosed bots forbidden, "substantially similar content across subreddits" forbidden, aged non-promotional account required. Already in `docs/REJECTED.md` as astroturfing |
| **A disclosed Reddit bot** | Compliant and worthless: the compliant version may not promote, which was the entire point |
| **Indie Hackers** | No terms page renderable, no traffic figure of any grade, and the same human-narrative requirement. Unquantified |
| **Bulk directory submission (doing it)** | ~90 form-based directories, zero published traffic data anywhere between two enumerations totalling 237 entries. Unmeasurable by construction |
| **Directory-submission-as-a-service (selling it)** | RED. The honest version needs humans filling moderated forms; the automatable version is bot-submitting boilerplate into forms that ban it — link spam under our own constitution |
| **`awesome-*` list PRs** | `sindresorhus/awesome` prohibits *"fully AI-generated pull requests"* and requires substantive reciprocal review of 4 other PRs. An agent cannot satisfy that honestly |
| **G2 / Capterra** | Needs real customer reviews we do not have; soliciting them dishonestly is barred. Costs money (PPC) rather than earning it |
| **dev.to publishing API** | Genuinely automatable, and that is the trap: auto-generated posts to farm a channel are spam under our constitution regardless of what the API permits |
| **Chrome Web Store** | Rejected twice already; Google's own heuristic ranks on *"downloads vs. uninstalls over time"* — a positive feedback loop with no cold-start lane |
| **Slack Marketplace** | Socket Mode apps and Workflow-Builder-custom-step apps are both **ineligible for listing** (Slack's own SDK docs) — those are the two cheap shapes. No published ranking mechanic exists at all |
| **Shopify App Store** | Best discovery mechanics of the five and **blocked on payability**: Partner payouts to Israel remain UNKNOWN with no published country list. Do not re-sweep the discovery research until the rail is answered |
| **Telegram bot "ASO"** | There is no Telegram bot store. No directory, no ranking, no featured surface. The only in-platform lever is the bot's username string |
| **Facebook groups for עצמאים** | Meta removed the Groups API endpoints and `publish_to_groups` on 2024-04-22. Every vendor still selling this is browser-automating a logged-in account |
| **WhatsApp Channels / group outreach** | No official Channels publishing API exists; business-initiated messaging requires prior opt-in and approved templates. Four unofficial-API vendors exist *because* the sanctioned route does not |
| **Israeli SMB forums (Arutz 7, Tapuz, BizMakeBiz, municipal)** | No API, no verified permission to post promotionally, unmeasurable traffic, and Rehovot's forum is joined by a human sending a WhatsApp message |
| **Telegram Ads / Telega.io** | Reported minimums €2,000,000 direct or €3,000–5,000 via reseller (vendor blogs, `promote.telegram.org` blocked); no Hebrew inventory found on Telega.io and no evidence an Israeli advertiser can fund an account |
| **Meta Marketing API paid ads** | Compliant and fully automatable — and paid acquisition is already rejected on portfolio arithmetic in `docs/REJECTED.md`. Do not spend a shekel before a product converts organic traffic |
| **Newsletter sponsorship (beehiiv / Paved)** | **Now dead, not deferred.** I confirmed Stripe self-serve cross-border payouts exclude Israel; both marketplaces pay publishers through Stripe connected accounts. The arithmetic fails independently: 2,000 subscribers at $100 CPM is $140 net per send |
| **Bought / scraped / imported Israeli lists, lead-gen-as-a-service** | RED by statute: ₪1,000 per message with no proof of harm, burden of the consent record on the sender. Amendment 13 additionally requires a **named human DPO** at 10,000 people — an irreducible owner blocker |
| **Israeli spam-law compliance tool as a product** | Price floor zero (MISSION constraint 8): smoove, ActiveTrail, inwise, Rav Messer, Meser10 and SUMIT all bundle compliance free. Survives only as a free lead magnet, which is not a line |
| **Email capture on the calculators** | Not rejected on merit — **rejected on sequence**. It is a conversion multiplier on traffic that does not yet exist, and 20 build hours of infrastructure for nobody. Trigger to revisit: `il-biz-tools` showing ≥300 organic sessions/month |
| **Lifecycle email to existing buyers (30א(ג))** | Ceiling ₪0 today: we have no paying customers. The one-hour disclosure fix above is the part worth doing now |
| **Telegram opt-in broadcast channel** | Same fault: the platform enforces exactly the consent model Israeli law wants, and there is no audience to broadcast to. A channel with no acquisition mechanism is a folder |
| **Short video (Shorts / Reels / TikTok)** | Honest ceiling "low hundreds" by its own scout, for 25–35 build hours. YouTube is the only platform we can automate and the one where **Shorts links are deliberately non-clickable**; TikTok's posting API is closed to individuals; faceless AI content at volume is RED on both platforms and the colony shape (one repo, one scheduler, many channels) is the textbook cluster-termination example |
| **MCP Registry + n8n verified node listings** | The only listings in the entire group obtainable with **zero human contact**, both verified by me — and both have a direct ceiling of ₪0. Worth doing as hygiene when a listable product exists; not a revenue line, and not ranked as one. Note the MCP Registry carries a real blocker (below) |
| **RapidAPI** | Already rejected in `groups/agent-markets.md` on measured seller earnings of $2.27–$103.33/month, with the only well-paying part of the channel (enterprise) reachable solely by human negotiation. Not re-litigated here |
| **Zapier / Make / HubSpot listings** | Zapier needs 50 active users and 10 Zap templates; HubSpot needs 3 active installs; Make requires an active **Partnership Agreement**. The first two are demand gates before the distribution — which inverts the reason we wanted the listing. The third needs a contract with a partner organisation |

---

## Owner blockers found (only real ones)

1. **Apify Verified Creator identity/KYC**, required before any payout: *"you must successfully
   complete identity verification and the Know Your Customer (KYC) process."* Already catalogued in
   the `apify-actors` owner setup — **not re-verified as done, and it must not be assumed done.**
2. **Apify payout minimums**: USD 20 for PayPal, USD 100 for any other option. Below those, earned
   money does not move.
3. **MCP Registry namespace proof against a company domain.** The GitHub route derives the namespace
   from the account, which would publish the owner's username — forbidden by the anonymity rule in
   MISSION. The compliant route is **DNS/HTTP verification of a company domain**, which means
   registering one: a one-time card payment against the ₪200 float, requiring a platform receipt id.
4. **Shopify Partner payout country for Israel — unanswered.** One-time login to the Partner
   dashboard payout settings. No published country list substitutes for it. Every Shopify-billed
   proposal stays blocked until it is read.
5. **Chrome Web Store developer registration** — a one-time paid developer account with identity
   verification. Not verified in this sweep; do not assume done, and do not assume the fee amount.
   (Recorded only because the store is rejected *for other reasons*; nobody should pay this.)
6. **Google Search Console verification** for the `il-biz-tools` domain needs a Google account under
   the company name and a DNS/file proof. Identity-adjacent, one-time, no KYC.

**Explicitly not owner blockers**, because they are recurring human labour that MISSION forbids
outright rather than one-time identity steps a human may legitimately perform: a Product Hunt maker
account and launch-day comment presence; a Hacker News posting history; an aged Reddit account with
non-promotional participation; an Indie Hackers narrative post; joining a municipal business forum
by WhatsApp. These are reasons the lines are **rejected**, not steps to put on the owner's checklist.

---

## Scouts whose work was thin or unsourced

- **`israeli-channels` — weakest in the group.** Its own closing note is accurate and damning:
  *"not one platform policy page or Israeli domain was rendered."* Every Israel-specific claim is a
  search snippet. The €2,000,000 Telegram Ads minimum comes from a vendor blog and should not be
  repeated as fact. Its verdicts survive only because the automation question kills Facebook and
  WhatsApp before the rules question is reached — the rules question is **not** answered.
- **`short-video` — honest about being thin, and thin.** States outright: *"Not one conversion-rate
  number below rests on an audited source."* Its structural findings (which posting APIs are open to
  an individual developer) are well sourced and useful; every traffic and conversion number in it is
  link-in-bio vendor marketing and must not be quoted.
- **`seo-2026` — no primary source of any kind.** `ahrefs.com`, `developers.google.com` and
  `blog.google` are all blocked; the spam-policy evidence is a third-party GitHub mirror that says
  it paraphrases. Hebrew AIO coverage is genuinely unknown. My own verification confirms the
  *direction* of its central claim but found the numbers unstable between sources (transactional
  AIO coverage quoted as both 5% and 19%).
- **`email-acquisition` — strong shape, second-hand law.** The entire legal section rests on a
  third-party GitHub mirror of the statute because `he.wikisource.org` is blocked. That is strong
  evidence of what the mirror asserts and weak evidence of what the statute says. It also produced
  the group's best single correction — the ₪1,000-per-message exposure — so this is a caveat, not a
  dismissal.

**Strong scouts:** `launch-platforms` (verbatim guideline mirrors plus a Wayback capture),
`app-store-aso` (rendered primary from GitHub for Apify, Chrome and Slack; correctly flagged the
archived-repo staleness), `directories` (caught and reported the `tarkaai/gtm-skills` trap — an
LLM-authored repo confidently listing submission API endpoints with no sources, which a lazier scout
would have built against), `partnerships-integrations` (two rendered-primary findings I re-verified
and confirmed).

---

## The one mechanic worth propagating

`app-store-aso` found a bug that costs every wave a turn: **GitHub MCP `search_code` requires a
`repo:`, `org:` or `user:` qualifier.** An unqualified query returns `total_count: 0` — a silent
empty result indistinguishable from "the document does not exist". Three of that scout's first five
searches failed this way. Qualified queries worked immediately. This belongs in `docs/CRITERIA_SWEEP.md`.
