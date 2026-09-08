# Scout notes — store-promotion / attribution-without-analytics

**Scout:** WORKER-SCOUT "attribution-without-analytics", group "store-promotion"
**Date of research:** 2026-09-03
**Criterion:** How we learn which promotion worked when no analytics is deployed and the ledger
only records completed sales. Options and their honesty: marketplace seller stats, referrer/UTM
surviving to checkout, server log counting, privacy-preserving analytics that need no consent
banner under Israeli and EU law, per-store landing URLs. What is measurable without collecting
personal data at all, and what a store must NOT do to attribute a sale.

## Evidence-strength key
- **[R]** = rendered page I actually fetched (strong)
- **[S]** = search snippet quoting a page I did not render (weaker — the exact URL to open is listed)
- Memory is not used as evidence anywhere below.

## Search budget
11 WebSearch calls used (cap 20). 5 GitHub primary fetches/searches (free, no search budget).
No searches were refused.

---

## 1. Per-store landing URL + campaign token that survives into the payment record

The cheapest honest attribution needs no analytics at all: give every promotion channel its own
URL, and carry the token from that URL into the object the payment processor records. Then the
ledger row itself carries the answer — no visitor tracking, no cookie, no personal data.

Two independent primary confirmations that the token survives to a *completed* payment:

- **Paddle** (our il-biz-tools rail): custom data can be attached to a checkout via a
  `data-custom-data` HTML attribute or `Paddle.Checkout.open({customData: {...}})`, is stored
  against the transaction, copied to the subscription, and returned on the
  `transaction.completed` webhook. Paddle's own docs page gives `utm_source`/`utm_medium`/
  `utm_content` as the example keys. **[S]** — open https://developer.paddle.com/build/transactions/custom-data
  and https://developer.paddle.com/webhooks/transactions/transaction-completed/ to close this.
  Paddle also shipped "update custom data for an open checkout" in 2025:
  https://developer.paddle.com/changelog/2025/update-checkout-custom-data
- **Stripe**: `client_reference_id` and `metadata` on a Checkout Session are echoed back on the
  `checkout.session.completed` webhook and on the retrieved Session. **[S]** — open
  https://docs.stripe.com/api/checkout/sessions/create and
  https://support.stripe.com/questions/using-metadata-with-checkout-sessions

Design consequence: the token must be a *campaign* id (`tw-launch-09`, `fb-group-mumbai`), never
a per-person id. A per-person id turns a ToS-clean mechanism into personal data processing.

Honesty note: this measures **sales**, not **traffic**. It cannot tell you that a channel sent
500 visits and converted none. That gap is what findings 3–6 fill.

## 2. Marketplace-provided seller stats (free, already paid for, varying quality)

- **Gumroad** — strongest case, and verifiable in source because Gumroad is open source
  (antiwork/gumroad). UTM links are a first-class modelled entity:
  `db/migrate/20250103124729_create_utm_links.rb` creates `utm_links` with
  `permalink` (unique), `utm_campaign`, `utm_medium`, `utm_source`, `utm_term`, `utm_content`,
  `first_click_at`. **[R]** via GitHub code search.
  `app/controllers/concerns/utm_link_tracking.rb` **[R]**
  (https://raw.githubusercontent.com/antiwork/gumroad/main/app/controllers/concerns/utm_link_tracking.rb):
  a click is only tracked on GET, requires `utm_source`+`utm_medium`+`utm_campaign`, requires the
  `_gumroad_guid` cookie, and stores `browser_guid`, `ip_address`, `user_agent`, `referrer`,
  `country_code`, and the logged-in user. **This is important and cuts against the naive story:
  the marketplace's own attribution IS cookie-and-IP based personal data processing.** We do not
  control it, we are relying on the platform's controller relationship with its own visitors —
  but we must not claim our storefront is "no tracking at all" while sitting on it.
  Seller dashboard shows sales, views, conversion rate, referrers and affiliate performance
  ("Recommended by Gumroad" appears as a referrer for Discover sales). **[S]** — open
  https://help.gumroad.com/article/74-the-analytics-dashboard
- **Apify Store** (our shipped `apify-il-open-data` line): the developer console has
  **Development > Insights > Analytics**, reporting "Revenue, costs and profit trends over time",
  "User growth metrics (both paid and free users)", "Cost per 1,000 results", "Run success rate
  statistics", "User acquisition funnel analytics", "Shared debug runs from users". **[R]**
  https://raw.githubusercontent.com/apify/apify-docs/master/sources/platform/actors/monetizing/index.mdx
  and https://github.com/apify/apify-docs/blob/master/sources/platform/account/console.md
  ("**Insights** - see analytics for your Actors"). No documented *traffic source* dimension —
  the funnel is inside Apify, so off-Apify promotion is NOT separable there.
- **itch.io**: per-project views, downloads, browser plays, payments, referrers. **[S]** — open
  https://itch.io/t/5656012/using-analytics-to-understand-player-interest-and-conversion-paths
  and https://itch.io/t/3970027/why-are-mastodon-referrers-not-showing-in-analytics — the latter
  is the honest caveat: referrer headers are increasingly stripped by browsers and apps, so
  referrer data is an estimate, not a count.

Verdict: marketplace stats are free, need zero build, and are the correct first stop for any
store hosted on a marketplace. They break exactly where a store is self-hosted (il-biz-tools),
and they never separate off-platform channels well.

## 3. Cookieless / consent-banner-free analytics — real, but the "no banner" claim is narrower than vendors say

- **Plausible** claims no banner is needed because it stores no personal data: visits counted via
  a daily-rotating salted hash of IP+user-agent, original IP never stored, hash irreversible;
  they publish a lawyer-written assessment. **[S]** — open
  https://plausible.io/blog/legal-assessment-gdpr-eprivacy and https://plausible.io/data-policy
- **Counter-evidence, rendered [R]**: https://github.com/plausible/analytics/discussions/1963
  argues Art. 5(3) ePrivacy governs the *access* to terminal-equipment information (user agent,
  referrer, screen size), not what you do with it afterwards; the WP29 2012 opinion says
  first-party analytics is not "strictly necessary"; anonymisation is a post-processing step.
  The thread notes the 2023 EDPB technical guidelines pulling fingerprinting into 5(3) scope,
  and a UK Data (Use and Access) Act statistical-purposes exemption that is UK-only.
  **So: strong under GDPR, genuinely contested under ePrivacy.**
- **GoatCounter** is more honest in its own words. **[R]**
  https://raw.githubusercontent.com/arp242/goatcounter/master/tpl/help/gdpr.md :
  "GoatCounter *probably* doesn't require a GDPR consent notice"; "The GDPR is fairly new, and
  lacks case law"; it stores aggregate, computed data — "you can see '40 people used Firefox
  today' and '20 people entered the site via example.com', but *not* '10 people using Firefox
  entered via example.com'"; "It's essentially impossible to identify any person, even with full
  access to the database"; "EU Regulations ... are interpreted and enforced different across
  member states". Also tpl/help/consent.md and tpl/why.md **[R via GitHub code search]**.
- **Cloudflare Web Analytics**: claims no client-side state (no cookies/localStorage) and no
  tracking over time by IP, UA or fingerprint; IPs used for country geolocation, not stored;
  reports visits, page views, Core Web Vitals, referrers, browser/OS, country. **[S]** — open
  https://blog.cloudflare.com/the-rum-diaries-enabling-web-analytics-by-default/ and
  https://www.ctrl.blog/entry/review-cloudflare-analytics.html (independent technical review).

**Israel is the binding constraint for us, and it got stricter.** Amendment 13 to the Protection
of Privacy Law took effect **14 August 2025**. It contains no cookie-specific clause; the
requirement flows from the general consent standard plus PPA interpretive guidance, and online
identifiers (cookies, advertising IDs) may qualify as personal data requiring an identifiability
assessment. The 2025 PPA guidelines on informed consent focus on cookie consent, and the new
administrative fines give it teeth. **[S] only — every Israeli primary source is egress-blocked
here.** A human or unblocked agent must open:
https://iapp.org/news/a/israel-marks-a-new-era-in-privacy-law-amendment-13-ushers-in-sweeping-reform
https://practiceguides.chambers.com/practice-guides/data-protection-privacy-2026/israel
and the PPA's own Hebrew guidance on gov.il (blocked from this container).

Practical rule for our stores: **cookieless aggregate analytics only, and never a third-party ad
pixel.** The moment a Meta/Google Ads pixel goes on a storefront, the banner question is settled
against us in both jurisdictions, and every vendor above says so.

## 4. Server-log counting — the only option with literally zero client-side footprint

GoAccess parses existing web-server logs: no JavaScript, no cookies, nothing added to the page.
GoAccess ships `--anonymize-ip` with levels (1 default / 2 strong / 3 pedantic); IPv4 hides 8/16/24
bits, IPv6 hides 64/80/96 bits. **[S]** — open https://goaccess.io/man and
https://github.com/allinurl/goaccess/issues/2282 (GitHub, renderable, closes this cheaply).
The compliance point from the same sweep: an IP address is an online identifier and therefore
personal data under GDPR, so the correct pattern is **truncate at write time** (in nginx) so raw
IPs never land on disk, plus a short retention window (logrotate, ~7–14 days). **[S]** — open
https://opensource-analytics.com/log-file-analytics-with-goaccess/ and
https://analytics-alternatives.com/server-logs-as-analytics-goaccess-awstats/

Caveat that must not be hidden: raw logs count bots as traffic and cannot separate a scraper from
a buyer; they are a floor on "did anyone arrive", not a conversion measurement.

## 5. Google Search Console per-URL clicks & impressions — free pre-click signal, no collection by us

The Search Analytics API exposes dimensions query / page / country / device / date with metrics
clicks, impressions, CTR, position; up to 50,000 rows/day/property/search type via API versus
1,000 in the UI. The data is aggregate by construction and Google, not us, is doing the
collection. **[S]** — open https://developers.google.com/webmaster-tools/v1/how-tos/all-your-data
and https://support.google.com/webmasters/answer/7042828
For a fleet of storefronts this is the one free source that answers "is anyone even finding this
page, and on which query" without deploying a single byte of client-side code. It says nothing
about paid conversion; it joins to the ledger only by URL.

## 6. Telegram deep-link start parameter — attribution inside a bot store with no web layer at all

`https://t.me/<bot>?start=PARAM` (or `tg://resolve?domain=<bot>&start=PARAM`) delivers PARAM to
the bot's `/start` handler; PARAM is up to 64 chars of `A-Za-z0-9_-`. Mini Apps use `startapp=`.
The bot logs the campaign token at first interaction — no cookie, no browser, no fingerprint,
and it survives device switches and private tabs. **[S]** — open https://core.telegram.org/api/links
and https://docs.telegram-mini-apps.com/platform/start-parameter and
https://docs.aiogram.dev/en/latest/utils/deep_linking.html
This is directly applicable to our shipped `telegram-il-tools-bot` (Telegram Stars) and costs
roughly an hour to wire: one column on the user row, one join against Stars purchases.

## 7. What a store must NOT do (constitution guardrail, not a build)

Every one of these is RED and is to be encoded as a deny-list in the promotion agents:

- **Cookie stuffing / forced clicks / hidden iframes / 1x1 pixels / JS redirects that set
  affiliate cookies without a real click.** Not merely a ToS breach: the eBay affiliate case
  (Shawn Hogan, Brian Dunning) was prosecuted as **wire fraud** with guilty pleas and prison
  sentences; indictments alleged >$15.5M and >$5.3M respectively. **[S]** — open
  https://www.brandverity.com/blog/compliance-part-two-forced-clicks-cookie-stuffing and
  https://www.scaleo.io/blog/is-cookie-stuffing-or-cookie-dropping-illegal/
- **Device fingerprinting as an analytics substitute.** The 2023 EDPB technical guidelines pull
  fingerprinting squarely into ePrivacy Art. 5(3) — see the Plausible discussion **[R]** above.
  "Cookieless" achieved by fingerprinting is worse than a cookie, not better.
- **Third-party ad pixels on a storefront that claims no tracking.** Plausible's own page states
  that running Google Ads/Meta Pixel/HubSpot alongside reinstates the banner requirement. **[S]**
- **Per-person identifiers in checkout metadata.** Campaign tokens yes; user ids, emails, hashed
  emails, or anything re-identifying a buyer, no.
- **Faking the signal**: self-clicks, bought traffic, engagement farming to move a marketplace
  referrer number. It corrupts the only measurement we have and breaches the constitution.
- **Claiming a promotion "worked" from a projection.** Only a completed transaction id in the
  ledger counts. An attribution mechanism that produces a number nobody paid is the exact failure
  MISSION.md exists to prevent.

---

## Recommended stack for the colony (all GREEN, all software-only)

1. Every campaign gets a unique landing URL carrying a campaign token (not a person token).
2. Token is written into Paddle `custom_data` / Stripe `metadata` at checkout and read off the
   `*.completed` webhook, so the ledger row is self-attributing. (~4–8h across our rails.)
3. Marketplace seller stats are polled where the store lives on a marketplace (Gumroad, Apify,
   itch.io). (~6–10h per platform, mostly scraping/API glue.)
4. Self-hosted storefronts get GoatCounter or Cloudflare Web Analytics — aggregate, cookieless,
   no ad pixel ever. (~2–4h.)
5. Google Search Console API per-URL rows pulled nightly for the whole fleet. (~6h.)
6. Telegram stores use `?start=` tokens. (~1–2h.)
7. Nothing on the deny-list, ever, with the deny-list checked in as code, not prose.

## Open questions for a human or an unblocked agent
- The Israeli PPA's actual 2025 informed-consent guidance text (gov.il, blocked here). Does
  aggregate cookieless analytics fall outside "personal data" under Amendment 13 as it does
  under most EU DPA readings?
- Whether Paddle's `custom_data` is exposed in the seller-facing reports/exports or only via
  webhook/API — it changes whether a fallback human-free reconciliation exists.
- Whether Apify's "user acquisition funnel analytics" exposes any off-platform source dimension.
