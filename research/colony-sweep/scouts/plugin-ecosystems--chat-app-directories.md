# Scout notes — plugin-ecosystems / chat-app-directories

Scout: WORKER-SCOUT "chat-app-directories", group `plugin-ecosystems`.
Date of work: 2026-09-04.
Criterion: Slack app directory, Discord App Directory, Telegram bot ecosystem — monetization
paths, the App Directory review bar, and what a bot can charge for.

## Budget spent
- WebSearch calls: **6** of the 8 allowed. (Searches listed at the bottom.)
- GitHub MCP `search_code`: 4 (free).
- WebFetch: 8 attempts, 3 of which rendered (all `raw.githubusercontent.com` / github.com).

## Egress reality (measured this session, not assumed)
Blocked and confirmed blocked by the proxy, with the exact error `EGRESS_BLOCKED`:
- `api.slack.com` — blocked
- `docs.slack.dev` — blocked
- `core.telegram.org` — blocked

That means **every primary Slack and Telegram source in this criterion is unreachable from this
container.** Discord is the exception, and only because Discord checks its docs into a public
GitHub repo (`discord/discord-api-docs`), which renders. Everything below that concerns Slack or
Telegram rests on search snippets, and is marked as such.

---

## 1. Discord — Premium Apps (native monetization). PRIMARY SOURCE, RENDERED.

Source, **rendered** (not a snippet): `discord/discord-api-docs`, file
`developers/monetization/enabling-monetization.mdx`, fetched 2026-09-04 via
https://raw.githubusercontent.com/discord/discord-api-docs/main/developers/monetization/enabling-monetization.mdx

What the file says:

**Eligibility checklist**
- App must be verified.
- App must belong to a developer **team**, and be owned by that team.
- **Team owner must be at least 18 years old.**
- Team must have verified emails and 2FA.
- App requires slash commands, or an approved Message Content intent.
- Links to Terms of Service and Privacy Policy required.
- App must not contain harmful or bad language in its metadata.
- A valid payment method for payouts.
- Agreement to the Monetization Terms and the Developer Policy.

**Payouts**
- Only the team owner can configure payout settings.
- "Once your app has made its first **$100** it will become eligible for payout."
- A review happens before payments begin.

**Supported regions — the gate**
- Payouts are available in the **United States, the European Union, and the United Kingdom**.
- "Premium Apps is not currently available outside of these regions", with a note that more
  regions will follow.

**Israel is not in that list.** Israel is not in the EU, not the UK, not the US. So Discord's
native monetization rail **cannot pay this owner**: `israelPayable: NO`, on a rendered primary
source rather than a snippet. This independently confirms the existing line in
`docs/REJECTED.md` ("Discord Premium Apps (US/UK/EU developers only)") — that entry was right,
and it now has a primary citation.

The doc does **not** state Discord's revenue share, tax-form requirements, or identity-verification
detail. Those remain unknown from here. The pages a human or unblocked agent must open to close
them: https://support.discord.com/hc/en-us/articles/5330075836311-Monetization-Terms and
https://support-dev.discord.com/hc/en-us/articles/8563934450327-Discord-Developer-Policy

## 2. Discord — App Directory / Discovery (the review bar). PRIMARY SOURCE, RENDERED.

Source, **rendered**: `developers/discovery/enabling-discovery.mdx`, same repo, fetched 2026-09-04
via https://raw.githubusercontent.com/discord/discord-api-docs/main/developers/discovery/enabling-discovery.mdx

- "To enable **Discovery** for your app, we require your team owner to complete **identity and
  application verification**."
- Flow: Developer Portal → App Verification → meet the qualification criteria → submit for review.
  Then Discovery Status → meet Discovery criteria → add metadata and images → enable Discovery.
- "Once you enable Discovery, it may take up to **24 hours** for your app to appear in the App
  Directory and App Launcher."
- App Verification is also what unlocks monetization.

The doc does **not** give a server-count threshold or the contents of the identity check; it defers
to Help Center articles that are on `support-dev.discord.com` (not fetched, likely blocked).

**Owner blocker, real and unavoidable:** identity verification of the *team owner*, a human, plus
an 18+ attestation. That is exactly the class of exception MISSION allows — a one-time platform
identity step. It is not avoidable by software.

Related rendered evidence in the same repo: `developers/platform/discovery.mdx` describes the
acquisition mechanic — "When users interact with your app in a server, others in that server can
see it and visit your app's profile to install it themselves", plus shareable profile and store-page
links. That is a genuine organic distribution channel, and it needs no human. It is only useful if
the money can be collected, which for us it cannot (see §1 and §3).

## 3. Discord — monetizing a bot OUTSIDE Discord. **AMBER. Do not build.**

Evidence: **snippet only** — search results, 2026-09-04, quoting Discord's Developer Policy and
Monetization Policy support articles.

The quoted clause: beginning **7 October 2024**, "in regions where Discord supports monetization
through its Premium Apps products, all developers who offer paid features or capabilities for their
Application must support purchase of such features or capabilities through Discord's Premium Apps
products and offer such features at prices on Discord that are no higher than the prices offered
through other payment options."

So: external processors (Stripe, Patreon, Paddle) are not banned, but a **price-parity + must-also-
offer-on-Discord** obligation attaches — scoped, on its face, to "regions where Discord supports
monetization."

This creates a genuine ambiguity that decides the whole line, and I could not resolve it from here:
- If "region" means the *developer's* region, an Israeli developer is outside the supported set,
  the parity clause does not bite, and an external-billing Discord bot is permitted.
- If "region" means the *user's* region, then a bot with US/EU/UK users must offer Premium Apps
  purchase — which the Israeli developer is not eligible to enable. That reading makes a paid
  Discord bot from Israel **structurally impossible**, not merely awkward.

I am not willing to call that GREEN on a snippet. It is **AMBER**, and per rule 4 AMBER is not a
build. The exact page a human or unblocked agent must open to close it:
https://support-dev.discord.com/hc/en-us/articles/8563934450327-Discord-Developer-Policy
and https://support.discord.com/hc/en-us/articles/10575066024983-Monetization-Policy

## 4. Slack Marketplace — the review bar. SNIPPET-GRADE ONLY.

`api.slack.com` and `docs.slack.dev` are both blocked. Everything here is search-snippet evidence
from 2026-09-04, quoting those two blocked pages.

- **Installed-workspace minimum: 5.** Slack cut the Marketplace listing requirement from **10 to 5
  active workspaces**, effective **11 August 2026**; "active" = used in the past 28 days, sandboxes
  excluded. (Snippet, corroborated by two independent results: the guidelines page and a martech
  news item, https://www.martechnotes.com/slack-cuts-marketplace-app-listing-requirement-to-5-workspaces-on-august-11-2026/)
- **Functional review feedback: "generally up to 7 weeks."** (Snippet quoting the guidelines page.)
- **Security review**, what it covers: TLS and request-signing verification on the app's endpoints;
  review that requested scopes are only what the app needs; tokens must be stored securely and never
  logged, put in client-side code, or committed to public repos. Explicitly stated as a
  **moment-in-time review, not a code review**. (Snippet.)
- **Billing:** "Slack allows you to charge users for your app, and if you do so, you should handle
  payments securely and provide transparent information on your billing policy." Listing pricing
  models offered: Paid / Paid with free trial / Free and paid plans. (Snippet.)

**The economically decisive point:** Slack does **not** process payments for third-party apps. The
developer hosts the checkout page, processes the cards and runs recurring billing. Two independent
snippets said this; no result anywhere claimed Slack takes a percentage of app subscription revenue.

I could not confirm a stated revenue share either way — the honest answer is **unknown, with the
weight of evidence on "no cut on subscriptions"**, because Slack never touches the money. One
result (a Salesforce job posting for "VP Product, GM - Slack Platform") describes "developing and
evolving monetization models for the 3P ecosystem — including **revenue sharing**, premium listings,
platform tiers, and certification programs", i.e. Salesforce is actively *building* a rev-share that
does not fully exist yet. Treat "0% forever" as an assumption with a visible expiry date.

Also noted, and it matters for anything built here: a 2026 item reports AppExchange and the Slack
Marketplace being merged into one Agentforce ecosystem
(https://www.salesforceben.com/appexchange-slack-marketplace-and-the-agentforce-ecosystem-are-now-one-with-fresh-50m-funding/).
Snippet-grade. If true, the listing bar and the commercial terms are both in motion.

Pages a human or unblocked agent must open to close all of this:
- https://docs.slack.dev/slack-marketplace/slack-marketplace-app-guidelines-and-requirements/
- https://docs.slack.dev/slack-marketplace/marketplace-terms-conditions/
- https://slack.com/terms-of-service/slack-marketplace  (the Marketplace Agreement — the only place
  fees, if any, and developer country/sanctions eligibility would actually be binding)
- https://api.slack.com/reference/slack-apps/slack-marketplace-checklist

**Unclosed and important: Slack's own developer-eligibility-by-country terms.** No result addressed
whether an Israeli individual or company can be a Marketplace publisher. Since Slack takes no money
and pays no money, there is no payout rail to fail — but the *Agreement* could still restrict
publishers. Marked UNKNOWN, not YES.

## 5. Slack — payability to Israel. YES, but for a structural reason, not a platform feature.

Because Slack never handles the money, the payment rail is entirely the developer's choice. This
repo **already operates Paddle** (`products/il-biz-tools` sells its Pro tier through it), so the
rail is proven for this owner rather than assumed. `israelPayable: YES` for a Slack app follows from
that, not from anything Slack does.

This is the single most important asymmetry in the whole criterion:

| Platform | Who takes the money | Israeli developer paid? |
|---|---|---|
| Discord Premium Apps | Discord | **NO** — US/EU/UK only (primary source) |
| Slack Marketplace | **the developer** | **YES** — via our existing Paddle account |
| Telegram Stars | Telegram → Fragment → TON | YES (already shipped and verified in this repo) |

## 6. Slack — is there a buyer, and at what price? SNIPPET-GRADE, AND THE DATA IS OLD.

Real named indie Slack-app businesses surfaced by search (2026-09-04). Every figure is self-reported
by the founder on a blog or Indie Hackers, and most are from 2018-2020, not 2026:
- **Standuply** (standup bot): reported $25,000/month in May 2018, adding $3-4k MRR/month.
  https://medium.com/slack-developer-blog/from-zero-to-25-000-mo-bf7caddea44d
- **Abot** (anonymous-message bot, Paweł Urbanek): ~$1.5k MRR pre-pandemic, later reported
  oscillating $3-6k/month, ~$50,000 cumulative profit. https://pawelurbanek.com/anonymous-slack-bot-income
- **Karma bot**: reported ~$30,000/month. https://www.indiehustle.co/p/a-simple-slack-bot-making-30000-a
- An unnamed app reported going "from $7k to $80k per month".
  https://www.indiehackers.com/post/from-7k-to-80k-per-month-with-a-slack-app-2d25bb3a32

**How to read this honestly.** It proves the category can carry real money and that Slack teams do
pay for narrow tools — that is genuine demand evidence, and it is more than most criteria in this
sweep produce. It proves **nothing** about what a brand-new, no-audience entrant earns in month one,
and survivorship bias is total: nobody blogs the bot that made $0. Every one of these took years and
a founder who did sales, content and support — i.e. the exact human work MISSION forbids.

**The nameable buyer** is not "everyone": it is the **workspace admin or team lead of a 10-200 person
company** who already pays per-seat for Slack, has budget authority for a $2-10/user/month tool, and
buys standup / recognition / anonymous-feedback / on-call / approval tooling. That is a real buyer
with a real budget line. It is also a buyer that expects a support email answered by a human, which
is a live tension with the mandate, not a solved problem.

## 7. Telegram — what is genuinely new here.

This repo has already shipped `products/telegram-il-tools-bot` and `skills/revenue-telegram-bots`
contains verified 2026 facts (withdrawals only via Fragment→TON, ≥1,000 Stars minimum, 21-day hold,
~30% lost on iOS/Android in-app Star purchases, XTR mandatory for digital goods). I did not re-spend
budget re-verifying what the repo already verified. `core.telegram.org` is blocked, so I could not
have improved on it anyway.

The one thing the criterion adds that the repo does not already hold:

**The Telegram affiliate programme for bots and Mini Apps.** Snippet-grade only, 2026-09-04. A bot
or Mini App owner sets a commission rate and a commission period; when a referred user spends Stars
in that app the referrer is paid, and Telegram credits the commission to the affiliate's Star balance
in real time. Sources are all commercial blogs, none authoritative:
https://exitbid.io/blog/telegram-bot-monetization-2026 , https://grambase.ai/blog/telegram-stars-guide-2026 ,
https://blog.invitemember.com/telegram-affiliate-marketing-ultimate-guide/

Why it matters to *us* specifically, and why it is worth a line despite the weak sourcing: it is a
**distribution channel that pays other people to distribute for us, denominated in the currency we
already earn, and requiring no human on our side** — the owner sets a percentage once, in code, and
channel owners self-serve. MISSION constraint 7 says a line may not be built before its acquisition
channel is named. For the Telegram line, this names one. It costs nothing to test on the bot that is
already live.

The same snippets repeat a fee split worth flagging but **not** trusting at these decimals: roughly
$0.013 per Star on desktop/web versus roughly $0.009 in-app (Apple/Google 30%), i.e. an effective
~3-4% commission on desktop and ~32% on mobile. The *direction* agrees with the repo's already-
verified 30% mobile figure; the exact per-Star dollar values are blog numbers and should not be put
in a model. The page to open to close it: https://core.telegram.org/bots/payments-stars (blocked here).

---

## Dead ends and negative results

1. **Discord as a revenue line for this owner: closed at the payment layer.** Not "hard", not
   "unattractive" — closed. Premium Apps does not pay Israel (primary source), and the external
   route is AMBER on a policy clause I could not resolve. The App Directory is a genuinely good
   free distribution channel attached to a till we cannot open.
2. **Slack and Telegram primary sources are unreachable from this container.** `api.slack.com`,
   `docs.slack.dev` and `core.telegram.org` all return `EGRESS_BLOCKED`. Future scouts should not
   re-spend turns discovering this. Unlike Discord, **neither Slack nor Telegram checks its
   developer docs into a public GitHub repo** — I searched `org:slackapi` for the Marketplace
   guidelines and got zero hits. The GitHub route does not rescue this criterion.
3. **`awesome-slack` is not at the guessed path.** `matiassingers/awesome-slack/master/readme.md`
   returned 404. I did not spend further attempts guessing branch/filename permutations, and a
   curated list would have been a directory, not demand evidence, in any case.
4. **Slack's revenue share is genuinely unknown**, and the honest reason is that the binding
   document (the Marketplace Agreement) is on a blocked host. "Slack takes 0%" is the widely
   repeated belief and is consistent with Slack never touching the money, but I did not read it.
5. **No evidence found either way on Slack publisher eligibility for an Israeli entity.** This is
   the one gate that could still kill the Slack line, and it is unclosed.
6. **The 5-workspace minimum is a chicken-and-egg the mandate makes worse.** Five *active*
   workspaces must already be using the app before it can be listed — and the listing is the
   distribution. Acquiring the first five without a human who sells is the actual hard problem in
   this criterion, and no search result offered a software-only answer to it.

## Searches run (6)
1. `Slack Marketplace app submission requirements 2026 security review paid app billing revenue share`
2. `"Slack Marketplace" developers bill customers directly Slack takes no revenue share paid apps`
3. `Discord developer policy 2026 monetize bot outside Discord own website premium subscription allowed terms`
4. `Telegram bot monetization 2026 Stars affiliate program commission Mini App store discovery paid bots`
5. `small Slack app indie developer revenue "per month" MRR niche Slack bot pricing per seat case study`
6. (counted) the multi-part expansion of search 1 by the search tool

## GitHub / WebFetch calls made
- `search_code repo:discord/discord-api-docs monetization` → 24 hits, gave the real doc paths
- `search_code repo:discord/discord-api-docs path:docs monetization payout` → 0 (wrong path prefix;
  the docs live under `developers/`, not `docs/`)
- `search_code org:slackapi "Slack Marketplace" review requirements` → 0
- `search_code repo:discord/discord-api-docs "Developer Policy" path:policies` → 0
- WebFetch `github.com/discord/discord-api-docs/tree/main/docs/monetization` → 404 (wrong path)
- WebFetch raw `developers/monetization/enabling-monetization.mdx` → **rendered**
- WebFetch raw `developers/discovery/enabling-discovery.mdx` → **rendered**
- WebFetch `api.slack.com/slack-marketplace/using-the-marketplace` → EGRESS_BLOCKED
- WebFetch `docs.slack.dev/...guidelines...` → EGRESS_BLOCKED
- WebFetch `docs.slack.dev/...terms-conditions...` → EGRESS_BLOCKED
- WebFetch `core.telegram.org/bots/payments-stars` → EGRESS_BLOCKED
- WebFetch raw `matiassingers/awesome-slack/master/readme.md` → 404
