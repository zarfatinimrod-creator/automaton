# Scout report — distribution / israeli-channels

**Criterion:** Reaching Israeli small businesses (עצמאים / עסקים קטנים) via WhatsApp channels,
Telegram channels, Facebook groups and forums. Group rules on promotion, and whether an
automated poster is allowed at all — assume not unless proven.

**Date:** 2026-09-04. **Search budget spent:** 8 of 8 (the cap). **Pages rendered:** 1
(`raw.githubusercontent.com`, irrelevant to Israel). All Israel-specific claims below are
**search-snippet grade**, not rendered-page grade. Say so downstream.

---

## Headline

**The criterion is largely a kill.** The three named channels — Facebook groups, WhatsApp,
Israeli forums — are all closed to an automated poster, and two of them are closed by the
platform's own engineering, not merely by group rules. The honest answer to "can an
automated poster reach Israeli SMBs in their communities" is **no, and it is not a grey
area**. What survives is a much smaller set: **paid ad APIs and opt-in owned channels**,
which are permitted, automatable, and do not require the owner to speak to anyone — but
they are a *cost* channel, not a revenue line, and their value is entirely downstream of a
product that already converts.

---

## 1. Facebook groups for עצמאים — CLOSED BY API REMOVAL (RED for automation)

Meta deprecated the Groups API. Announced January 2024; endpoints and permissions removed
**2024-04-22** across all API versions, including `publish_to_groups` and
`groups_access_member_info`. Every scheduling vendor (Buffer, Hootsuite, Sprinklr, Zoho)
lost group publishing at once. Meta's stated reason: reduce spam and protect communities.

- https://techcrunch.com/2024/02/05/meta-cuts-off-third-party-access-to-facebook-groups-leaving-developers-and-customers-in-disarray/ (snippet, seen 2026-09-04)
- https://www.sprinklr.com/help/articles/getting-started-facebook/meta-deprecates-facebook-groups-api/66229eb25f9dd9599d632712 (snippet)
- https://smashballoon.com/doc/facebook-api-changes-affecting-groups-april-2024/ (snippet)

**Consequence for this colony.** There is no sanctioned programmatic path into a Facebook
group. The only remaining routes are (a) a human posting by hand — forbidden by MISSION,
the owner does nothing — or (b) browser automation of a logged-in account, which is a
direct violation of Meta's Automated Data Collection Terms and of our own constitution.
Vendors advertising "post to multiple groups in 2026" (multiplegroupposter.com,
socialrails.com, recurpost.com — all seen as snippets) are selling exactly route (b).
**Do not build, do not buy.**

Israeli groups do exist and are large — e.g. `facebook.com/groups/shavit` ("קהילת עצמאים
ובעלי עסקים של שביט", seen in search results) and the "השולמנים"/Shulman self-employed
community covered by Globes
(https://www.globes.co.il/news/article.aspx?did=1001306631, snippet). Their individual
promotion rules were **not** obtainable: facebook.com group pages did not render and no
search result quoted a rulebook. This is unresolved, but it is moot — the API question
kills it before the rules question is reached.

**URL a human or unblocked agent must open to close it:**
`https://developers.facebook.com/docs/graph-api/changelog/` (Groups API deprecation entry)
and any target group's own "About → Rules".

**What would reopen it:** Meta restoring a publish permission for groups. No sign of it.

---

## 2. WhatsApp cold outreach to Israeli SMBs — RED

The WhatsApp Business Messaging Policy requires **opt-in before any business-initiated
message**, prohibits unsolicited bulk messaging, requires pre-approved templates for
marketing, and requires an opt-out. Enforcement is account suspension.

- https://developers.facebook.com/documentation/business-messaging/whatsapp/getting-opt-in (snippet)
- https://whatsappbusiness.com/policy/ — **EGRESS_BLOCKED**, could not render. This is the
  primary source and it remains unread. Anyone unblocked should open it.
- Secondary snippets: https://www.infobip.com/blog/how-to-collect-whatsapp-business-opt-ins ,
  https://spotler.com/blog/what-are-the-rules-and-restrictions-for-whatsapp-marketing

Cold-messaging Israeli businesses found by scraping is therefore both a terms violation and
a constitution violation. Closed.

**WhatsApp Channels (broadcast) are worse, not better.** There is **no official Meta API for
posting to a WhatsApp Channel** as of 2026; every "WhatsApp Channels API" on the market —
Whapi.Cloud, WAHA, Wassenger, Maytapi — is an unofficial wrapper around WhatsApp Web/mobile
automation.

- https://whapi.cloud/whatsapp-channels , https://waha.devlike.pro/whatsapp-channels/ ,
  https://maytapi.com/features/whatsapp-channel-api (all snippets, 2026-09-04)

Unofficial clients are the exact thing WhatsApp's terms forbid, and accounts using them are
routinely banned. **AMBER at best, treated as RED here.** An owned WhatsApp Channel posted
to by hand is a human action and MISSION forbids it.

**The one GREEN WhatsApp route:** the official Cloud API sending *template* messages to
people who opted in **on our own property** (il-biz-tools, the Telegram bot). That is
permitted, fully automatable, and is a retention/upsell channel for users we already have —
not an acquisition channel. It costs money per message and it cannot grow an audience we do
not already own.

---

## 3. Israeli forums — alive, but human-only, and small

Israeli SMB forums that still exist (all snippet-grade, 2026-09-04):

| Forum | URL |
|---|---|
| ערוץ 7 — "פורום עצמאיים ועסקים קטנים" | https://www.inn.co.il/forum/f21 |
| תפוז — "יזמות וניהול עסק" | https://www.tapuz.co.il/forums/יזמות-וניהול-עסק.429/ |
| BizMakeBiz — עסקים עושים עסקים (org, founded May 2008) | https://www.bizmakebiz.co.il/ |
| Municipal business forums (example: Rehovot, join **by WhatsApp message**) | https://www.rehovot.muni.il/articles/item/5164/ |

None publishes an API. None was verified to permit promotional posting; per the
brief's default, assume not. Rehovot's forum is explicitly joined by sending a WhatsApp
message — a human act. Traffic on Israeli legacy forums is not measurable from here and no
number should be invented.

**The one thing forums are worth to us:** they are indexed. A Hebrew answer that ranks in
Google for the same query the forum thread ranks for reaches the same person, costs no
posting, and breaks no rule. That is SEO on our own domain, which belongs to another
criterion but is the real substitute for this one.

---

## 4. Telegram — our own channel yes, Telegram Ads no

Telegram is the one platform in the criterion where an automated poster is *sanctioned*:
the Bot API is official, and we already ship `products/telegram-il-tools-bot`. Posting to a
**channel we own** via a bot is GREEN and needs no permission from anyone.

Buying reach is the problem:

- Official Telegram Ads direct-account minimum is reported at **€2,000,000**, with official
  agency resellers at **€3,000–€5,000** initial deposit; third-party resellers around **$150**.
  Source: https://propellerads.com/blog/adv-telegram-ads-minimum-budget/ and
  https://propellerads.com/blog/adv-telegram-ads/ (snippets, 2026-09-04). **These are
  vendor blogs, not promote.telegram.org.** The €2M figure in particular should not be
  quoted as fact without opening https://promote.telegram.org.
- Telegram Ads settles in **TON** or via a **Euro account available only in certain
  countries** (unnamed in the snippets). Israel's status is **UNKNOWN**.
- Resale marketplace **Telega.io** sells single ad posts in individual channels, takes
  **12.5%** from publishers, and pays out to card or crypto wallet
  (https://telega.io/faq — **EGRESS_BLOCKED**, only snippets seen). **No evidence of any
  Hebrew or Israel-targeted channel inventory** was found. Advertiser-side payability from
  Israel: UNKNOWN.

Verdict: Telegram Ads is out on price and on unknown Israeli eligibility. Telega.io is
AMBER and unevidenced for our audience.

---

## 5. Meta Ads / Google Ads — the only compliant automatable push channel

The Marketing API lets software create, budget and target campaigns with no human in the
loop, and Meta bills advertisers with a country, billing address and VAT/tax ID, generating
monthly invoices.

- https://www.facebook.com/business/help/190161391031782 (VAT charges for Meta ads, snippet)
- https://www.facebook.com/business/help/716180208457684 (how Meta charges, snippet)
- https://www.facebook.com/business/help/133076073434794 (taxes on ad placement, snippet)

None of these snippets names Israel specifically. Israeli advertisers being billed in ILS
with an Israeli VAT ID is **highly likely but not evidenced here** — mark it UNKNOWN and
close it by opening the Meta billing help page from an unblocked network, or simply by the
owner adding a payment method (a one-time act, and a legitimate ownerBlocker).

This is a **cost** channel. It converts to revenue only through a product that already
converts, and it is the honest replacement for "post in the groups where they already are".

---

## Dead ends, stated plainly

1. **Automated posting into Facebook groups: dead, permanently, by API removal.** Any tool
   claiming otherwise is browser automation and violates Meta's terms.
2. **Automated posting into WhatsApp groups or channels: dead.** No official API for
   Channels; group messaging requires opt-in; every third-party "Channels API" is an
   unofficial client.
3. **Israeli forums: no API, no evidence of promotion being permitted, unmeasurable
   traffic.** Not a channel a machine can use.
4. **Telegram Ads: priced out and Israel-eligibility unknown.**
5. **Group *rules* on promotion were not obtainable at all.** facebook.com, telegram.org,
   whatsappbusiness.com and telega.io are all egress-blocked here. The rules question is
   genuinely unanswered — it just happens not to matter for the top two, because the
   automation question kills them first.
6. **No Israeli-specific distribution channel appears in `mmccaff/PlacesToPostYourStartup`**
   (rendered 2026-09-04). The English launch-directory route has zero Israeli surface.

## What I could not do

- Render a single Israeli or platform primary source. Everything above rests on snippets.
- Verify the promotion rules of any specific Israeli group.
- Verify Israeli eligibility for Telegram Ads or Telega.io advertiser accounts.
