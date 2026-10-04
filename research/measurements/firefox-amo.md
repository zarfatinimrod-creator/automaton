# Measurement: Firefox Add-ons (AMO) + Gumroad Pro licence (CHANNEL_LOOP §4 candidate 16, breadth rank 1)

**Status: MEASURED 28.9.2026. Verdict: FAILS_TEST** (see the end). **Tick 6 reopen check (28.9.2026, AMO 'invoice'
search): the G4 failure is CONFIRMED. Logo branding is already free in at least four AMO add-ons. Recommendation: KILL** (see
the last section). The captures were fetched on 2026-09-28: the policies at
13:17:49.555Z, newest at 13:17:50.968Z, hebrew at 13:17:52.330Z and the langpack at 13:17:53.428Z. All four returned 200
and none was truncated (`research/rendered/amo-*.meta.json`).

**The test as ruled** (`logs/CHANNEL_LOOP.md:134`, `research/breadth/BOARD.md:72`): render the four AMO URLs. Before
admission, name in writing one Pro feature that is free nowhere, our own il-biz-tools included; if none, the engine is not
admitted (G4). Read the newest cohort's daily users and the Hebrew langpack's. The pre-registered venue kill is at
`research/breadth/BREADTH-SWEEP.md:473-474`: no nameable Pro feature (G4); *or* a newest-cohort median of about 30 *and*
Hebrew utilities under about 500.

## What was read
- `amo-add-on-policies-2026-09-28.txt`: lines 1-2007 are three copies of the site navigation, and the policy body (2008-2222) was read
  in full.
- `amo-search-newest.json` (sort=created, the newest 50 of 105,270 extensions), `amo-search-hebrew.json` (q=hebrew, page 1 of
  4, i.e. 50 of 153 results) and `amo-hebrew-langpack.json`, parsed with python3. No author names were recorded.

## Policies [RENDERED, except where marked]
1. **AI.** The words "AI", "artificial" and "LLM" appear 0 times in the whole capture. The only generated-code rule is about
   build output: "Add-ons may contain transpiled, minified or otherwise machine-generated code, but Mozilla needs to review a
   copy of the source code before any of these steps have been applied." (`:2069`); "Add-ons are not allowed to contain
   obfuscated code, nor code that hides the purpose of the functionality involved." (`:2075`). No disclosure duty exists.
   [INFERENCE] AI-written code is allowed by absence, so our AI declaration under G4 stays voluntary.
2. **Automation and submission.** The policy body does not say how uploads happen. The navigation lists "web-ext sign" (`:111`),
   "Signing your add-ons" (`:383`) and "Roll back using the Add-on Submission API" (`:416`): those pages exist but were not
   read. The v5 search and detail endpoints returned 200 without authentication (meta files). The create endpoint (POST
   `/api/v5/addons/addon/`) is still github grade (`BREADTH-SWEEP.md:173`). Reviewers test the add-on: "the add-on author must
   provide testing information and, if an account is needed for any part of the add-on’s functionality, testing credentials"
   (`:2063`). [INFERENCE] A Pro tier would mean handing the reviewers a working licence key.
3. **Paid features.** "Listings must disclose when payment is required to enable any add-on functionality." (`:2051`). §7,
   Monetization (`:2195-2201`), covers only injected ads, cryptocurrency miners (which are "prohibited", `:2199`) and affiliate
   tags. It says nothing about licence keys or paywalls. The API carries a `requires_payment` flag, set on 4 of the 50 newest and
   2 of the 50 hebrew results. Paid functionality is therefore allowed with disclosure. AMO has no "nothing free sold as paid"
   rule: that rule is ours (G4). The policies also exclude a thin wrapper around our site: "Add-ons with the sole purpose of
   promoting, installing, loading or launching an outside website, application or add-on are not permitted." (`:2057`);
   "Add-ons must be self-contained and not load remote code for execution." (`:2087`).
4. **Data collection.** "Add-ons must limit data transmission to what is necessary for functionality" (`:2111`), and "ancillary
   information ... is prohibited" (`:2119`). The listing must say "what information it transmits" (`:2029`). Implicit consent
   covers only a single user click: "Any passive, continuous, or background transmission requires explicit consent."
   (`:2167`). On Firefox 140+, the add-on must "accurately state the data collection practices in the extension manifest,
   including when it does not collect data" (`:2131`); 38 of the 50 newest declare `data_collection_permissions: ["none"]`.
   [INFERENCE] il-biz-tools' Option C re-checks the key "once every 7 days, in the background"
   (`products/il-biz-tools/README.md:297`). An add-on doing the same would need an explicit consent screen or a declared
   manifest category, and the listing would have to name the traffic to api.gumroad.com.
5. **Review times.** The policies name none: "days", "hours" and "queue" appear 0 times. Measured instead: for 48 of the 50
   newest, `current_version.reviewed` minus `file.created` is 72.0-72.1 h, and for the other 2 it is under 0.1 h. Every
   `reviewed` stamp falls in the minutes before the fetch. [INFERENCE] A new listing goes public about 72 h after upload, and
   sort=created shows add-ons at the moment they go public.
6. **Identity and brand.** No identity, real-name or verification rule appears: "identity", "real name" and "legal name" all
   return 0 hits. The navigation has "Developer accounts" / "Setting a display name" (`:441-442`). Of the 50 newest authors,
   49 carry an `anonymous-<hash>` username beside a free-form display name. [INFERENCE] G7 leans P. On the risk side, "Mozilla
   reserves the right to block or delete any developer’s account" (`:2213`), and add-ons "must conform to the laws of the
   United States" (`:2053`).
7. **Money.** "fee", "cost" and "price" name no charge: "cost" and "price" have 0 hits, and all 4 "fee" hits are "feel".
   G1 holds on this page, by absence. The Distribution Agreement (navigation `:2230`) was not read.

## Numbers [RENDERED]
- **Newest 50.** All were created on 2026-09-25 between 06:25 and 13:12 UTC, about 7 new public extensions an hour
  [INFERENCE]. Daily users: **median 0**, p75 1, p90 1, max 10, mean 0.56. **32 of 50 (64%) are at 0**, and 48 of 50 are at 1
  or below. Three authors hold three add-ons each. **Caveat:** these add-ons had been public for minutes (item 5), so this is
  a day-0 reading. It shows only that a new listing starts at zero, and it cannot test the ~30 line in either direction.
- **The "hebrew" search** (page 1, relevance order). **25 of the 50 are RTL or text-direction fixers**: 2,788 users in total,
  median 16, max 998 (`rtl-helper`, which is multi-language). Twelve of those were created in 2026, with users of
  1, 1, 2, 3, 8, 23, 33, 46, 101, 129, 340 and 349 (median 28). One requires payment (`hebrew-support-for-slack-rtl`, 1 user).
  The Hebrew-only utilities are `hebrew-tooltip-translation` (85), `search-in-morfix` (41), `easyhebrewkeyboard` (16),
  `mistype-switcher` (3), `hebrew-layout-fixer` (1) and `keymap-converter` (1); the Tanakh readers have 1, 0 and 0. The big
  numbers belong to generic tools that only mention Hebrew: `reverso-context-beta` (10,219), `markdown-here` (3,801),
  `translation-comparison` (3,745) and `netflix-bilingual-subtitles` (1,594, paid). I scanned name, summary, description and
  tags for VAT/מע"מ, invoice/receipt/חשבונית/קבלה, logo/branding, salary/שכר, osek/עוסק, calculator/מחשבון and
  calendar/Hebrew date/שבת/חג. **None of the 6 matches was real**: they came from "syntax", "taxí", "המעמיק" and a UI "תאריך".
- **The Hebrew langpack** (`hebrew-il-language-pack`, published by Mozilla since 2013, version 158.0.20260924) has
  **144,540 daily users**. This supersedes the snippet-grade 132,251 at `BREADTH-SWEEP.md:189`. [INFERENCE] About
  1.4×10^5 Hebrew-UI Firefox users is the ceiling on the audience. The best Hebrew-only utility on page 1 reaches 85 of them.

## The one Pro feature that is free nowhere?
il-biz-tools sells one Pro feature, "your logo and accent colour on the printed document" (`README.md:284`), for ₪79 on
Gumroad. Its client list, numbering, PDF export and stored documents "are free and stay free" (`:285-286`). The scout's four
planned add-ons (`research/breadth/scouts/app-plugin-marketplaces.json`, `candidates[1]`) name no Pro feature at all.

| Candidate | Does something free already do it? | Qualifies? |
|---|---|---|
| RTL fixer (planned) | Yes. Page 1 has 24 free RTL fixers, with up to 998 users; the one paid fixer has 1 user | **No** |
| VAT calculator (planned) | Yes, on our own `vat.html`. None appears on AMO page 1 | **No** (free on our own site, G4) |
| Hebrew-date overlay (planned) | None on page 1. The board records that free ones exist, with the URL not saved (`BREADTH-SWEEP.md:177`) | **No**: no Pro feature is named |
| gov.il helper (planned) | None on page 1 | **No**: no Pro feature is named, and there is an affiliation risk (`:177-178`) |
| Receipt branding (il-biz-tools' existing Pro, sold as an add-on) | Not free on our site, where it is the paid tier. Page 1 has no receipt add-on of any kind | **Not refuted, not established**: 103 of the 153 results and every receipt tool outside AMO are unread. It would be a second shop for a feature we already sell, not a new one |

On this evidence, no feature can be named in writing as free nowhere. The one that is not refuted rests on its absence from
50 search results.

## Verdict for candidate 16 (Firefox Add-ons): FAILS_TEST
The ruled admission gate is not met. No Pro feature can be named that is free nowhere, and the rule says that without one
the engine is not admitted (G4, `BOARD.md:72`). That condition is a venue kill by itself (`BREADTH-SWEEP.md:473`). The
policies are friendly: no fee, no AI clause, paid features allowed with disclosure, and an account behind a display name. The
Hebrew niche is not: it already holds 24 free RTL fixers, and the Hebrew-only utilities sit at 1-85 daily users, under the
~500 line. The newest-cohort median of 0 is a day-0 reading and settles nothing. The audience ceiling is the langpack's 144,540.
**The single next check** (the only one that could reopen it, by showing whether receipt branding is already free on AMO):
https://addons.mozilla.org/api/v5/addons/search/?app=firefox&type=extension&q=invoice&page_size=50

## Tick 6 (28.9.2026): the reopen check — AMO 'invoice' search
Capture: `research/rendered/amo-search-invoice.json` (ZERO-TESTS row 62). It was fetched at 2026-09-28T16:12:05.095Z,
returned 200, was not truncated (451,566 bytes) and was rendered at commit 5d597e4. I parsed it with python3 and recorded no
author names.

**Counts [RENDERED].** `count` 281, `page_size` 50, `page_count` 6. Only page 1 was read. Of those 50, 23 are about invoices,
receipts or bills. The other 27 match on the stem "voice" (TTS, recorders, dictation) and are noise.

**What il-biz-tools sells as Pro [RENDERED]:** "your logo and accent colour on the printed document" (`README.md:284`), for
₪79 one-time (`:33`). In the page code these are the `#brand-logo` and `#brand-accent` controls (`assets/page-invoice.js:182-228`).

**Page-1 results that generate, brand or customise invoices [RENDERED].** None of these results is Hebrew or Israeli. Across
all 50 results, name, summary, description and tags contain no "Hebrew", "Israel", RTL, Hebrew script, osek, ₪/ILS/NIS
or a `he` locale. The local ones are India GST, Argentina AFIP and Egypt ETA.

| Add-on (slug) | Free? (`requires_payment`) | Daily users | Branding it states | Market |
|---|---|---|---|---|
| `alibill-aliexpress-invoice` | free | 696 | "Add Custom Company Information and Logo" | generic, AliExpress orders |
| `aliinvoice` | free flag, but freemium | 219 | logo free; "only 4 templates" of 14 free | generic, AliExpress orders |
| `free-invoice-generator` | free | 20 | "Customizable invoices with logo, tax, and discounts", "100% free" | generic; opens an outside website |
| `merabill-gst-invoice-generator` | free | 2 | "company logo, Terms and Conditions, Bank Details, Header, Footer" | India GST |
| `estimate-invoice-maker` | free | 0 | "Custom Branding - Use your company logo" | generic |
| `snapinvoice-best-invoice-maker` | **paid** | 0 | logo free; PRO = "three additional templates and watermark removal", one-time, sold on an external site | generic, offline |
| `invoice-generator-pro`, `afip-invoice-helper`, `ha-invoice` | free | 1 each | "multiple templates" / "templates" / business details (no logo named) | generic / Argentina / India |

Non-branding makers: `simply-invoice` (2), `quick-invoice-generator` (1), `ali2invoice-aliexpress-invoice` (18) and `alivat`
(9), all free. The rest are downloaders or parsers, not makers. The only paid invoice add-on besides SnapInvoice is
`invoice-pdf-grabber` (142 users), an Egypt ETA downloader.

**The G4 question, answered literally: is "logo and accent colour on the receipt" free elsewhere on AMO? Yes, for the logo
[RENDERED].** Four general or GST makers state a logo on the invoice at no charge: `free-invoice-generator`, `merabill`,
`estimate-invoice-maker`, and SnapInvoice's free tier. Two AliExpress generators with 696 and 219 users do the same. The
accent colour is named by none of the 50 (absence, from 50 of 281 results). Colour and design choice is what AMO sellers
charge for, as templates (`aliinvoice`, SnapInvoice). A colour picker alone would again rest on absence, and it is not the
feature we sell. **G4 failure confirmed.**
[INFERENCE] Two more readings point the same way:
- **The ~30 line.** The nine general invoice makers have median 1 and max 20 daily users. They were created between 2019 and
  2026, so this is not a day-0 reading, and all nine sit below ~30.
- **The closest analogue.** SnapInvoice is offline and localStorage-based, keeps the logo free and sells a one-time PRO. It
  shows 0 users 29 days after creation.

What is empty on AMO is the free base: a Hebrew/RTL, osek/VAT receipt. That base is already free on our own site, so it
cannot be the Pro feature. The same finding (logo branding is free in other tools) bears on il-biz-tools' own Pro. That is
for the owner, not this candidate.

**Recommendation for candidate 16 at the 29.9 sitting: KILL.** G4 is failed on evidence, not on absence: the one Pro feature
we have (the logo on the document) is free in at least four AMO add-ons. The ruled condition is therefore a venue kill by
itself (`BREADTH-SWEEP.md:473`). The invoice-maker cohort reinforces it: every general maker sits under ~30 users, and the
nearest analogue with a paid tier has 0.
