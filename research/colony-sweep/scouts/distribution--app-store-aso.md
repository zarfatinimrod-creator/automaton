# Scout notes — `distribution / app-store-aso`

**Criterion:** Discovery inside app and bot stores — Chrome, Telegram, Slack, Shopify, Apify.
What drives installs, and what the listing quality bar is.
**Date:** 2026-09-04. **Model:** Opus 5. **WebSearch spent: 4 of the 8 allowed.**

---

## Evidence grades used below

- **RENDERED (primary)** — I fetched the platform's own file and read it.
- **SNIPPET** — a search result quoting a page I could not open. Weaker. The URL a human must
  open to close it is named each time.
- Nothing here rests on memory.

---

## What actually rendered, and what did not

| Host | Result |
|---|---|
| `raw.githubusercontent.com` | **works**, zero search budget — carried this whole sweep |
| `docs.slack.dev` | EGRESS_BLOCKED |
| `shopify.dev`, `apps.shopify.com` | EGRESS_BLOCKED |
| `developer.chrome.com` | EGRESS_BLOCKED |
| `core.telegram.org` | EGRESS_BLOCKED |

**Mechanic worth recording for the next wave:** the GitHub MCP `search_code` is the *legacy* code
search — an **unqualified query returns `total_count: 0`, not an error**. Every query needs
`repo:`, `org:` or `user:`. Three of my first five searches returned zero for this reason alone and
looked like "no such document exists". They were not.

---

## 1. Apify Store — the only one of the five that publishes its ranking inputs

**RENDERED:** `https://raw.githubusercontent.com/apify/apify-docs/master/sources/academy/build-and-publish/apify-store-basics/how_store_works.md`

> "Search ranking evaluates parameters similar to those in the Actor quality score. As a result,
> the two correlate strongly: Actors with higher quality scores tend to rank higher in Apify Store
> search." — with "no specific position is guaranteed."
> In Apify Console "search results are personalized for each user."

**RENDERED:** `https://raw.githubusercontent.com/apify/apify-docs/master/sources/platform/actors/publishing/quality_score.mdx`
The eight quality-score categories, verbatim-sourced:

1. **Reliability** — run success rate, passes automated QA tests.
2. **Popularity** — "number of users running your Actor, save counts, and return usage patterns."
3. **Feedback and community** — reviews/ratings after multiple runs.
4. **Ease of use** — clear titles, descriptions, field guidance, documentation.
5. **Pricing transparency** — "how clearly users can understand and predict the costs."
6. **Trustworthiness** — principle of least privilege, limited permissions.
7. **History of success** — publisher track record across Actors.
8. **Congruency** — alignment between documentation and schemas.

Four of the eight (**Ease of use, Pricing transparency, Trustworthiness, Congruency**) are pure
listing craft: a new publisher with zero runs can max them on day one. That is the cold-start lane
Chrome does not have, and it is the single most useful fact in this sweep.

**RENDERED (listing bar):** `https://raw.githubusercontent.com/apify/apify-docs/master/sources/platform/actors/publishing/publish/actor-readme.mdx`
README sections: Introduction, Tutorial, Pricing, Input/output examples, FAQ and support.
> "aim for at least 300 words"
> "A well-structured README that includes important keywords has a high chance of being noticed and
> promoted by search engines or AI assistants."
> H2/H3 keyword optimisation → "People also ask" and Google sitelinks. Video helps ranking.

**RENDERED (money):** `https://raw.githubusercontent.com/apify/apify-docs/master/sources/academy/build-and-publish/apify-store-basics/how_actor_monetization_works.md`
> developer earns "80% of the revenue minus platform usage costs"; "most prices on Apify Store range
> between $1-10 per 1,000 results"; price changes need "14-day notice" and only "once per month per
> Actor". No payout country list appears in this file.

**RENDERED (SEO doctrine):** `.../promoting-your-actor/seo.md` — method only, **no numbers**. The
playbook contains no install-volume, conversion or traffic figure anywhere I looked. Anyone quoting
an Apify install number is not quoting Apify.

**Israel:** YES, *by absence* — consistent with `docs/REJECTED.md`, which records the Store
Publishing Terms as carrying "no country or jurisdiction restriction of any kind".
**Ceiling:** `docs/REJECTED.md` already puts the whole Apify line at **₪1,500/month**, audited down
from ₪4,000. Listing optimisation moves position inside that ceiling; it does not raise it.
**Constraint that kills the funnel idea, already in the repo:** Store Publishing Terms §2.2.4.2(i)
forbids promoting a competing service off the listing.

## 2. Slack Marketplace — two hard structural gates, from Slack's own SDK docs

**RENDERED (primary, Slack's own repos):**
- `https://github.com/slackapi/node-slack-sdk` → `docs/english/tutorials/local-development.md`:
  > "apps cannot use Socket Mode and also be listed in the [Slack Marketplace]. For that, you'll need
  > to use HTTP."
- `https://github.com/slackapi/bolt-js` → `docs/english/tutorials/custom-steps.md` (identical text in
  `bolt-python`):
  > "Apps containing custom steps cannot be distributed publicly or submitted to the Slack
  > Marketplace."

So the cheapest Slack build shapes — a Socket-Mode bot, and a Workflow-Builder custom step — are
**both ineligible for the store**. A listable Slack app must be a publicly hosted HTTPS app with
OAuth v2 multi-workspace installation and token storage (`packages/oauth/README.md`, rendered).

**SNIPPET only** (`docs.slack.dev` is blocked): the review is "a moment-in-time review", Slack "doesn't
conduct a code review", config changes require **resubmission and re-review**, granular scopes and
minimum-necessary permissions are mandatory, the demo video must be **30–90 seconds** with captions
on and ads off, and Slack may run additional testing including penetration testing at its discretion.
**To close this, a human/unblocked agent must open:**
`https://docs.slack.dev/slack-marketplace/slack-marketplace-app-guidelines-and-requirements/` and
`https://docs.slack.dev/slack-marketplace/slack-marketplace-review-guide`.

**Discovery:** I found **no published Slack Marketplace ranking mechanic** in any primary source.
Treat Slack ranking as unknown, not as "like the others".
**Israel:** Slack does not bill on behalf of apps — the app bills through its own rail, so payability
is our existing Paddle answer: YES via our own rail, not via Slack.
**Owner blockers:** a real support/developer contact that receives mail, and agreeing to a Slack
security review (a questionnaire, answerable in writing — not a call, not a camera). The 30–90s
video is a screen recording; no human appearance is implied by anything I rendered.

## 3. Shopify App Store — the biggest search-driven store, and the one we cannot get paid from

**SNIPPET only** (`shopify.dev` and `apps.shopify.com` both EGRESS_BLOCKED). Third-party ASO vendors,
2026, via WebSearch:
- "Shopify's own data shows that 60 percent of installs on the App Store come from searches"
  — attributed to Shopify but **quoted by a vendor blog**, not by Shopify here.
- "'Built for Shopify' certification is table stakes—1,443 apps are certified, and non-certified apps
  rarely crack the top 10." BFS apps get homepage-header and "Recommended for you" placement.
- Claimed signals: install velocity, listing freshness ("update every 30–60 days"), keyword relevance
  in title/description, and a mechanism that surfaces smaller trending apps.
- Sources seen: `https://prys.io/learn/shopify-app-store-ranking-factors`,
  `https://www.bigmoves.marketing/blog/shopify-app-store-ranking-algorithm-overview-of-shopify-app-store-ranking-factors`,
  `https://www.appjubilee.io/shopify-app-store-report-2026`,
  `https://www.shopify.com/partners/blog/built-for-shopify-updates`.
- Every one of these is a vendor selling ASO services. **Low confidence by construction.** Shopify has
  never published the algorithm — the vendors say so themselves.

**To close:** open `https://shopify.dev/docs/apps/launch/built-for-shopify` and
`https://shopify.dev/docs/apps/launch/app-store-listing` from an unblocked network.

**The gate that ends it anyway:** `docs/REJECTED.md` records **Shopify Partner payouts to Israel as
UNKNOWN**, with no supported-country list found, and every Shopify-App-Store-billed proposal blocked
until a human opens the Partner payout settings. Nothing I found today changes that. Best discovery
mechanics of the five, zero proven rail.

## 4. Chrome Web Store — Google does publish the heuristic, and it is install-locked

**RENDERED (Google's own docs repo, but ARCHIVED — `GoogleChrome/developer.chrome.com`, archived:true):**
`https://raw.githubusercontent.com/GoogleChrome/developer.chrome.com/main/site/en/docs/webstore/discovery/index.md`
> ranked by a heuristic considering "ratings from users as well as usage statistics, such as the
> number of downloads vs. uninstalls over time", plus: "The design is pleasant to the eye", "The item
> provides a clear purpose and fills a real user need", "The setup and onboarding flow are intuitive",
> "The item is easy to use".
> "If your extension isn't appearing in search results it could be because you recently published
> your extension, it may take a few hours for it to be indexed."

`.../webstore/best_listing/index.md` (RENDERED): summary ≤132 characters, ≥1 and preferably 5
screenshots at 1280x800 or 640x400, small tile 440x280, marquee 1400x560, no keyword stuffing (an
explicit policy violation), no "Editor's Choice"-style claims.

**The repo is archived**, so this is Google's text but possibly stale — the same staleness
`docs/REJECTED.md` already flagged on the duplicate-experience policy. **To close:** open
`https://developer.chrome.com/docs/webstore/discovery` live.

**SNIPPET** (2026 vendor blogs, `extensionranker.com`, `extensionfast.com`): exact keyword match in
the *title* carries the most weight; fresh reviews, weekly-users scale and low uninstall rate drive a
positive feedback loop. Consistent with Google's own text; still vendor-sourced.

**Verdict unchanged from the repo:** the only inputs a zero-install listing can move are name,
description and screenshots; everything else is install telemetry. `docs/REJECTED.md` already killed
the portfolio play as **RED** (duplicate-experience policy) and the single-extension play on ceiling.
I found nothing that reopens either. Not a build.

## 5. Telegram — there is no store, and that is the finding

**SNIPPET only** (`core.telegram.org` blocked; sources are third-party 2026 guides —
`https://www.airdroid.com/ai-insights/how-to-find-bots-in-telegram/`,
`https://botpenguin.com/blogs/telegram-search-bots`, `https://statiko.io/blog/telegram-bots-list`):
Telegram offers **no official bot directory or store**. Discovery is (a) the in-app search bar, which
matches on bot **username and title**, (b) links shared in chats and channels, (c) third-party
catalogues (BotoStore, TeleHunt, BotList/`@botlistbot` inline), (d) curated GitHub lists.

**Consequence for `products/telegram-il-tools-bot`, which is already shipped:** there is **no ASO
lever inside Telegram**. There is no ranking to climb, no listing quality bar to clear, and no
featured surface to be picked for. The only in-platform lever is the **username**, which is the
single string Telegram search matches — and it is chosen once, at `@BotFather`, and is effectively
permanent. Everything else is off-platform acquisition, which `docs/REJECTED.md` constraint 3 already
narrows for us (community posting is closed).

**To close:** open `https://core.telegram.org/bots` and the Mini Apps docs from an unblocked network
to confirm Telegram has not added a catalogue surface.

---

## The cross-cutting conclusion

Ranked by *how much of the ranking a zero-install, zero-review software-only publisher can influence
on day one*:

1. **Apify — half the score.** Four of eight quality-score categories are listing craft. Published,
   itemised, and free to max out. Ceiling ₪1,500 (already set by the repo), rail YES.
2. **Chrome — three fields.** Title, description, screenshots. Then it is install telemetry. Rejected
   already, on policy and on ceiling.
3. **Shopify — title/description keywords and listing freshness**, per vendors only. Blocked on the
   Israeli payout gate regardless.
4. **Slack — nothing published.** The gates that *are* published are eligibility gates, not ranking.
5. **Telegram — the username, and nothing else.** No store exists.

**The honest summary:** four of the five stores hand a new listing almost nothing, and the fifth
(Apify) is one we are already on, with a ceiling this repo has already audited to ₪1,500. This
criterion produces **no new revenue line**. Its value is a concrete, cheap work item on an existing
product and three eligibility facts that stop the colony designing builds that cannot be listed.
