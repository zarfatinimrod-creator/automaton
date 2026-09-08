# Group report — plugin-ecosystems

**Supervisor:** SUPERVISOR `plugin-ecosystems`, model Opus 5. **Date:** 2026-09-04.
**Scouts merged:** 8 — `chrome-extensions`, `figma`, `notion-templates`, `obsidian-raycast`,
`ide-plugins`, `shopify-apps`, `wordpress`, `chat-app-directories`.
All eight reports read from `research/colony-sweep/scouts/` (the wave JSON carried seven of
them; `chat-app-directories` and the tail of `wordpress` were read from disk).

---

## Headline

**Plugin ecosystems are early-entrant flywheels. Every marketplace in this group is either
unable to pay an Israeli, or structurally unable to show a new listing to a stranger, or both —
and I measured the second half rather than asserting it.** One line survives, and it survives
provisionally: a free WordPress.org plugin with a separately-distributed Pro build on the
Paddle rail the repo already operates. Its ceiling is unverified because the only instrument
that could verify it (`api.wordpress.org`) is egress-blocked from this container, and its first
step is therefore a measurement, not a build.

---

## 1. The measurement this group was missing, and what it settles

Every scout in this group inherited the same claim from `docs/REJECTED.md` — that marketplace
ranking is install-count-locked and a new listing is invisible — and every scout treated it as
received wisdom. The `obsidian-raycast` scout went further and argued the *opposite* for its own
criterion, in its strongest sentence:

> "the community directory listing itself — unlike Gumroad Discover, proven in `docs/REJECTED.md`
> to be gated on `sale_made` — has no prior-sale gate and lists a plugin from day one. That makes
> it the cleanest un-gated platform-search channel found in this sweep, which is the single
> strongest thing about this line."

That claim is true about *permission* and false about *outcome*, and the data to check it was
free, public, machine-readable, and named in that scout's own dead-ends list (it told later
agents the file "must be parsed with code, not summarised" — and then did not parse it).

I parsed it. `obsidianmd/obsidian-releases` publishes `community-plugins.json` (the append-only
listing order, so position ≈ listing date) and `community-plugin-stats.json` (per-version
download counts). Fetched 2026-09-04 via `raw.githubusercontent.com`, which is not blocked.

**Directory size (measured, not snippet):** 7,245 listed community plugins, 7,205 with stats.
The scouts' snippet figure of "roughly 7,233" was very close — credit where due.

**Downloads by listing cohort** (`downloads` is the sum over every version, i.e. it counts
updates, not users — verified: `obsidian-git` = 3,093,742 across 149 versions):

| listing position (oldest → newest) | median downloads | p90 | % over 5,000 |
|---|---:|---:|---:|
| 0–725 | 17,621 | 306,627 | 91% |
| 1,450–2,175 | 2,122 | 14,726 | 28% |
| 2,900–3,625 | 459 | 5,015 | 10% |
| 4,350–5,075 | 314 | 1,313 | 2% |
| 5,800–6,525 | 111 | 499 | 1% |
| 6,525–7,245 (newest) | 48 | 192 | 0% |

Because `downloads` counts updates, I re-ran it on a **user proxy** — the largest single-version
download count, which approximates the installed base on the most-adopted release:

| cohort | median users | p90 | p95 | p99 |
|---|---:|---:|---:|---:|
| oldest 725 | 10,534 | 104,980 | 178,528 | 876,341 |
| mid (~2,900–3,625) | 288 | 1,850 | 3,957 | 20,441 |
| ~1.5–2y old | 182 | 626 | 1,019 | 2,702 |
| ~1y old | 59 | 222 | 365 | 1,263 |
| newest | **27** | 94 | 126 | 1,004 |

**And every paid Obsidian success is in the first cohort.** Listing positions, measured:
`copilot` #818 (230,268 users), `smart-connections` #670 (114,045), `obsidian-textgenerator`
#397 (70,857), `obsidian-excalidraw` #140 (203,265). Not one of the paid products the scouts
cited as proof of demand was listed in the last four years.

**What this does to the arithmetic.** The p90 outcome for a plugin listed today is ~200 users
in its first year. At a generous 5% paid conversion and $20 one-time that is $200 **lifetime**
≈ ₪60/month in year one. To sustain ₪300/month at $20 one-time you need ~11 sales a month =
~4,400 new users a year at 5%, which is above the **p99** of every cohort younger than three
years. The Obsidian paid-plugin line — the best-evidenced, GREEN-on-primary-sources, proven-
Israel-payable finding in the entire group — **fails the ₪300/month floor on its own ecosystem's
public numbers.**

**Why this is the group report rather than a footnote.** The mechanism is not Obsidian-specific.
It is the same mechanism `docs/REJECTED.md` recorded for the Chrome Web Store (install-count-
locked), for Figma Community (accumulated usage: users, views, saves, likes, comments), and that
the `ide-plugins` scout rendered verbatim from JetBrains' own ranking documentation — relevance
× staff-pick × `log10(1 + 5 × downloads)` × `sqrt(rating)`, where a new plugin's third and
fourth terms are both zero, so the product is zero however relevant it is. Four marketplaces,
four independent ranking designs, one outcome. This group now has that outcome **measured once**
instead of asserted four times, and any later wave that wants to reopen a plugin marketplace
should be made to produce a cohort table like the one above before it is heard.

---

## 2. What survives

### RANK 1 — WordPress.org free plugin + separately-distributed Pro build (Paddle) · score 34

The only line in the group that is simultaneously (a) GREEN on a **rendered primary** ToS,
(b) payable to Israel on a rail this repo **already operates**, (c) has a named platform-search
acquisition channel, and (d) costs zero new owner KYC.

**Rendered primary evidence** (re-verified by me, 2026-09-04, not taken on the scout's word):
`raw.githubusercontent.com/WordPress/developer-plugins-handbook/main/wordpress-org/detailed-plugin-guidelines/index.md`
— guideline 5 forbids locked functionality *and* explicitly permits upselling ("Attempting to
upsell the user on ad-hoc products and features _is_ acceptable, provided it falls within bounds
of guideline 11"); guideline 6 permits a plugin acting as an interface to a paid external
service; guideline 11 confines upgrade prompts to the plugin's own settings page. Cross-checked
by the scout against WordPress's own site code in `WordPress/wordpress.org`.

So the compliant shape is exact and is not a workaround: **a fully functional free plugin in
the directory, a Pro build distributed from outside it, and a restrained upsell on the settings
page only.** That costs a second distributable and a licensing/update path.

**Why it is ranked at 34 and not higher.** Its ceiling is the one number in this group I could
not measure. `api.wordpress.org` is confirmed egress-blocked from this container (I tested it:
`connect_rejected`, organization policy), so `active_installs` is unreadable — exactly as
`docs/REJECTED.md:357` recorded, and that line is still true after this wave. The repo's prior
audit put this line at **₪1,000/month**, down from a supervisor's ₪4,000. I am not raising that
and I am not lowering it on a WordPress-free inference; I am recording that my Obsidian cohort
table is a **strong prior against it**, and that one HTTP request settles it.

The arithmetic to beat, stated plainly so the test is falsifiable: at Freemius's own published
feature-gated benchmark of 2.1% conversion and a $49/yr Pro tier, ₪1,000/month needs ~66 paying
licences a year, which needs ~3,150 free activations a year — about **260 installs a month,
every month**. That is the number the first step must measure.

**Owner blockers (real, minimal):** a `wordpress.org` account — self-serve, no KYC, no camera.
Payment uses the existing Paddle merchant-of-record account from `products/il-biz-tools`, so
there is **no new identity step at all**. This is the thinnest blocker list in the group.

**First step:** from a network that can reach `api.wordpress.org`, request
`https://api.wordpress.org/plugins/info/1.2/?action=query_plugins&request[per_page]=250&request[browse]=new`
and record `active_installs` and `added` for the newest 250 plugins — the WordPress equivalent
of the Obsidian cohort table above. Build nothing until that table exists.

**Kill criteria:** kill before writing code if the newest-cohort table shows a median
`active_installs` under 100 after twelve months (the Obsidian analogue, which would put the
₪1,000 audited ceiling at ₪0). If it clears that and the plugin ships, kill it if it has not
produced 10 real Paddle transaction ids within 90 days of the listing going live. Downloads,
stars and activations are not revenue.

---

## 3. Rejected, and why

Ordered by how close each came.

| Line | Verdict |
|---|---|
| **Obsidian paid community plugin (one-time licence, Paddle)** | **Rejected on a measured ceiling under ₪300/month.** Permission is excellent and primary-sourced (payment taxonomy Free/Optional/Paid; Developer policies permit "Payment is required for full access"). Payability YES via existing Paddle. But the newest listing cohort has a median of 27 users and a p90 of 94; sustaining ₪300/month needs above-p99 performance. Reopens only if the cohort table shifts. |
| **Obsidian server-backed subscription plugin** | Same cold-start denominator, plus per-user COGS, an uptime obligation and a directory support commitment. Competes head-on with Copilot, which has 230,268 users and a four-year head start. |
| **Obsidian paid theme** | Scout's own ceiling ₪200 — under the floor before the cohort data is applied. Retained below as a *research instrument*, not a line. |
| **Chrome Web Store, single paid extension (ExtensionPay)** | Already killed twice in `docs/REJECTED.md`; nothing this wave reopens it. ExtensionPay is Stripe-only (verified in its own issue tracker) and Stripe's Israeli merchant status is unresolved — `stripe.com` is egress-blocked, and two searches returned contradictory answers. Also AMBER. |
| **Chrome Web Store extension portfolio** | RED. Banned by the duplicate-experience clause and the minimum-functionality policy simultaneously. The one real datapoint is $31.03 MRR across 38 live extensions. |
| **Chrome ads / bandwidth-SDK / sponsorship / selling the extension** | Every route is a negotiation with a human counterparty. Mandate violation, not a market judgement. Reselling a user's bandwidth is separately AMBER under the user-data policy. |
| **MV3 licensing SDK sold to extension developers** | The one nameable buyer in the Chrome criterion, and it fails MISSION constraint 7: no acquisition channel to developers has ever been named in this repo. Selling picks to prospectors in a market where 90% of extensions have under 1,000 users. A competitor (ExtensionBill) already markets the identical flat-fee angle. |
| **Figma paid plugin (native Figma/Stripe rail)** | Payable — I independently corroborated that Israel is on Figma's creator-payout list and that plugins/widgets are open while **paid files are closed to new creators**. Killed on discovery: `docs/REJECTED.md:273` — every ranking input is accumulated usage, no editorial and no "newest" surface. Scout's own ceiling ₪400 against a directory of thousands of free plugins. |
| **Figma external-billing freemium plugin** | AMBER. The permission to link an external checkout is assembled from two snippets of a blocked host and contradicted by a third clause. Rule 3: AMBER is not a build. |
| **Hebrew / RTL Figma plugin** | Ceiling ₪250 (under floor) and identified purely by absence. The scout said it plainly: "absence of a plugin can equally mean absence of a need." No buyer has been observed asking for it. |
| **Notion Marketplace paid selling (native rail)** | Doubly dead: a Notion-staff waitlist with no published SLA (`docs/REJECTED.md:271`), and a Stripe payout dependency whose Israeli status is unresolved. |
| **Notion free listing + external checkout** | The whole line rests on **one unrendered sentence** from a blocked page. Zero primary sources rendered by that scout. Not buildable on that evidence. |
| **Notion templates at scale / Etsy storefront** | Mass output is banned by Notion's originality clause and by our own constitution. Etsy Payments for Israel remains UNVERIFIED (`docs/REJECTED.md:288`). The headline earners (Thomas Frank, Easlo) are YouTube and X audiences that happen to sell templates — the exact mechanism the mandate forbids. |
| **JetBrains Marketplace, paid-via-JetBrains (15%)** | Payout country eligibility is unknown (`plugins.jetbrains.com` blocked; the Developer Agreement was never read). Discovery is mathematically closed — the rendered ranking formula multiplies a new plugin's score to zero. Every release passes a multi-day human review. And EEA trader status publishes the owner's **name, email, address and phone** to end users. |
| **JetBrains paid-via-vendor (Paddle, 0% cut)** | Fixes payability, changes nothing about the zero-multiplier discovery, keeps the trader disclosure, and adds a conversion penalty for leaving the IDE to pay. |
| **VS Code Marketplace + own licence key** | AMBER by the scout's own grading, with an explicit "DO NOT BUILD until the Publisher Agreement is read". The VS Code Marketplace has no commerce at all — the only two pricing labels are Free and Free Trial, and `microsoft/vscode#111800` is closed with nothing shipped. |
| **Open VSX as a second publish target** | AMBER, zero demand evidence of any kind, publisher agreement unrendered. Never a line — at most a publish target for something already earning. |
| **Raycast Store extension** | No payment mechanism exists. Rendered primary: `"Ensure you use MIT in the license field"`. An MIT extension cannot be sold. Confirms and upgrades the existing `docs/REJECTED.md` entry. |
| **Alfred workflow** | The only discovery channel (Alfred Gallery) is invite-based and gated on earning a reputation through forum participation. That is the owner talking to people — a mandate violation, not a step to complete. |
| **Shopify app (any)** | Blocked at the payout gate: Partner earnings run through Hyperwallet, Israel is not confirmed, and Payoneer virtual accounts are reportedly rejected — removing the usual Israeli workaround. Compounded by a review-gated store where a new listing needs 10+ reviews in 30 days to be visible, and every fast route to reviews is forbidden by Shopify *and* by our constitution. Zero primary Shopify pages were rendered by anyone. |
| **Shopify Hebrew/Israeli-invoicing app** | Same payout gate, plus a structural one the `wordpress` scout found independently: in the Israeli e-commerce niche the plugin is always free because it is a channel for a licensed financial vendor's paid subscription. We cannot clear cards and cannot issue a tax-authority-signed invoice, so we cannot capture that money. Morning/Green Invoice already occupies the slot. |
| **Discord bot (Premium Apps)** | `israelPayable: NO` on a **rendered primary source**: payouts are United States, European Union and United Kingdom only. Israel is in none of them. |
| **Discord bot billed externally** | AMBER on an unresolved price-parity clause that, on one of its two readings, makes a paid Discord bot from Israel structurally impossible. Not callable GREEN on a snippet. |
| **Slack Marketplace app with own billing** | The most interesting rejection. Payable YES (Slack never touches the money; Paddle is ours), no platform cut, a genuinely nameable buyer with budget, and real precedent (Standuply, Karma). Rejected on acquisition, which is *harder* here than in the ecosystem I just measured: **5 active workspaces must already be using the app before it can be listed**, and the listing is the distribution. Plus a ~7-week review, unverified Israeli publisher eligibility, an active Salesforce project to introduce a revenue share, and a buyer who expects a human on support. |
| **Telegram Stars affiliate programme** | Not a line — a distribution feature for an already-shipped product, sourced only to commercial blogs. Worth logging as a near-zero-cost experiment on `products/telegram-il-tools-bot`; not worth a rank. |

---

## 4. Corrections this group owes the repo

Recorded here, not written into the files they correct (this task may edit only this report).

1. **`docs/REJECTED.md:674` and `docs/INCOME_PLAN.he.md:229` state the wrong reason for the
   Figma rejection.** Both say "Figma plugins — not approving new sellers." The evidence says
   that closure applies to paid **files**; paid **plugins and widgets** appear open to new
   creators in any Stripe-supported country, and Israel is on Figma's payout list. Figma should
   stay rejected — for discovery, per `docs/REJECTED.md:273` — but a later wave reading the
   current wording will "discover" the door is open and reopen a line whose real problem is that
   nobody can see the shelf.
2. **`src/revenue/rails.ts` overstates Freemius.** It says Freemius "pays out in ILS with no
   conversion fee". I re-checked: ILS appears as a **selling/checkout currency** offered to
   buyers alongside USD/GBP/EUR/CAD/AUD/PLN. That is a different claim from payout currency, and
   no source supports the payout version. Payout methods are PayPal, Payoneer and wire
   (IBAN/SWIFT), monthly, $100 minimum. Israel payability remains **UNKNOWN-leaning-YES** —
   "supported countries" is defined as every country where at least one payout method is
   available, and all three reach Israel, but that is an inference and this repo has been burned
   by that exact inference before. Task #21 is **not** closed. The one URL that closes it:
   `https://freemius.com/help/documentation/selling-with-freemius/supported-countries/`.
3. **The Obsidian cohort table above should become a reusable instrument.** Two of this repo's
   standing marketplace beliefs — "install-count-locked", "no cold-start lane" — have been
   argued for months and were measurable for free the whole time. Any marketplace that publishes
   an append-only listing file plus per-item stats can be measured this way in one bash call.
4. **The docs-source-repo route keeps paying and should stay in `docs/AWESOME_ROUTE.md`.** Four
   scouts independently rescued a blocked vendor by finding the docs' source repo:
   `GoogleChrome/developer.chrome.com`, `JetBrains/marketplace-docs`, `microsoft/vscode-docs`,
   `obsidianmd/obsidian-developer-docs`, `WordPress/developer-plugins-handbook`,
   `discord/discord-api-docs`. Figma, Notion, Slack, Telegram and Shopify have no such repo —
   and those are precisely the five criteria that came back thinnest. That correlation is the
   finding, not a coincidence.

---

## 5. Owner blockers found across the group

Only one-time identity or platform steps a human is legally required to perform. Nothing here is
assumed done.

- **WordPress (the ranked line):** a `wordpress.org` account — self-serve, no KYC, no camera. No
  new payment step: the existing Paddle merchant-of-record account covers it.
- **Chrome Web Store:** one-time US$5 developer registration paid by card; 2-Step Verification on
  the publishing Google account; the EU DSA trader / non-trader declaration. All snippet-grade —
  `developer.chrome.com` is blocked.
- **Figma:** approved-creator application, then activation of a Stripe account from Figma's email
  invite with Israeli identity document, bank account and tax details.
- **Notion:** a Notion account and creator profile approved by Notion staff on an unpublished
  timeline; Stripe KYC for the native rail.
- **Obsidian:** an Obsidian account and agreement to the Developer policies to claim a listing —
  account creation, not KYC. A published privacy-policy URL is required before any server-side
  telemetry (a page, not an owner action).
- **JetBrains:** a Hub account and vendor profile; a signature on the Marketplace Developer
  Agreement; an EEA trader declaration that **publicly displays name, email, address and phone**;
  bank details for USD/EUR payout.
- **VS Code / Azure:** a Microsoft account with Azure DevOps access to create the publisher
  identity, and a Microsoft Entra ID publishing identity configured before Personal Access Tokens
  are retired on 1 December 2026.
- **Open VSX:** an Eclipse Foundation account and a signature on the Eclipse ECA / Open VSX
  Publisher Agreement.
- **Shopify:** a Partner account in the owner's legal name; a one-time $19 registration fee by
  card; Hyperwallet account activation with government-ID KYC; Israeli tax residency details.
  **Plus the single unblocking action for that whole criterion:** open the Partner Dashboard
  payout screen with Country = Israel and record which transfer methods appear.
- **Discord:** team-owner identity verification plus an 18+ attestation. Moot — the rail cannot
  pay Israel.
- **Slack:** none identified beyond a developer account; whether an Israeli individual may be a
  Marketplace publisher is unverified.
- **Freemius (only if adopted as a rail):** seller identity and tax registration, and it is
  unverified whether an *osek patur* qualifies without a registered company.

---

## 6. Scout quality — named honestly

**Thin or unsourced at the primary level:**

- **`notion-templates`** — the weakest report in the group, and it says so itself: *"EVIDENCE
  FAILURE — I rendered zero primary sources."* Every Notion number is a snippet quoting a blocked
  page, and its one survivable finding rests on a single unrendered sentence. Honest about its
  own failure, which is worth something, but nothing here is buildable.
- **`shopify-apps`** — zero primary Shopify pages rendered; every Shopify-owned domain is
  blocked. Its best source is a third-party research file sitting in an unrelated GitHub repo
  (`GodMode-Team/godmode`) that itself quotes `shopify.dev`. It also correctly refused to answer
  the "weak incumbents" half of its criterion rather than inventing an answer — but the criterion
  is therefore unanswered. Minor sloppiness: its first finding object carries a duplicated,
  garbled key (`whatIsIs` followed by `whatItIs`).
- **`figma`** — no primary Figma source rendered by any route, and Figma checks nothing into a
  public repo, so the GitHub rescue was unavailable. Everything is snippet-level. Partly
  redeemed: it produced the single most useful correction in the group (paid *files* closed vs
  paid *plugins* open) and was explicit that its permission finding must be rendered before use.

**Strong on evidence but wrong on its central claim:**

- **`obsidian-raycast`** — the best-sourced report in the group on *permission* (rendered
  Obsidian developer docs, rendered Raycast MIT requirement) and it produced the group's would-be
  winner. But its load-bearing claim — that the Obsidian directory is "the cleanest un-gated
  platform-search channel found in this sweep" — was asserted without measuring the channel, from
  a report that had already located the exact public file that measures it and told other agents
  not to summarise it. Measured, that claim inverts and the line dies. Not thin; unverified in
  the one place it mattered.

**Solid:**

- **`ide-plugins`** — the strongest report. Rendered JetBrains' and Microsoft's own docs from
  their source repos on five searches, produced the group's clearest structural kill (the ranking
  formula that multiplies to zero), and actively caught three SEO-content-farm fabrications
  ("Microsoft introduced paid extensions in 2023", a "5% transaction fee", "$300–$2,100/month")
  and recorded them as false so no later agent re-imports them.
- **`wordpress`** — rendered the primary guidelines that the whole ranked line rests on,
  double-checked them against WordPress's own site code, corrected `src/revenue/rails.ts`, and
  used GitHub mirrors to measure the Israeli WooCommerce niche for zero search budget.
- **`chrome-extensions`** — rendered Google's own MV3 and payments-deprecation docs from the
  source repo, and refused to rank "top-earning niches" rather than launder an SEO content-farm
  cluster into a ranking. Refusing to answer was the right answer.
- **`chat-app-directories`** — rendered Discord's monetization and discovery docs and closed the
  Discord payability question with a primary source rather than an inference.

---

## 7. Standing open questions this group could not close

1. **Does Stripe serve Israeli *merchants* directly?** `stripe.com` and `docs.stripe.com` are
   blocked; searches return contradictory answers. It gates ExtensionPay (Stripe-only, verified),
   Notion's native rail, and Figma's. Note the distinction the repo keeps blurring: Stripe
   **Connect** through a platform demonstrably reaches Israelis (Algora's public code, Figma's
   payout list), which is a different question from a standalone Israeli merchant account.
   Open `https://stripe.com/global` and
   `https://support.stripe.com/questions/stripe-feature-availability-by-country`.
2. **`api.wordpress.org` — the one number that decides the one ranked line.** Confirmed blocked
   here (`connect_rejected`, organization policy).
3. **Shopify Partner payouts to Israel** — one screen in the Partner Dashboard.
4. **Freemius supported countries** — one page; task #21 stays open.
5. **Slack publisher eligibility for an Israeli entity** — the Marketplace Agreement at
   `https://slack.com/terms-of-service/slack-marketplace` is the binding document and nobody has
   read it.
