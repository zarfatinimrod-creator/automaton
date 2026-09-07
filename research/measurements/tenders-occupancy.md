# Measurement: occupancy of the Israeli government-tender alert / tender-data market

**Date:** 2026-09-07
**Task:** repo task #25, ordered by the board (`research/colony-sweep/BOARD.md` §5.7, §6.3, §7).
**Question, as a measurement and not a pitch:** how occupied is the Israeli market for tender alerts and
tender data (מכרזים ממשלתיים, מכרזי רשויות מקומיות, מכרזי חברות ממשלתיות)? Who sells, at what price, over
what free floor, is there an unserved payer segment at ₪30–80/month, and is there a channel a stranger
could arrive through?

**Origin of the question:** `research/colony-sweep/audits/data-apis.md` §4.1 — the `data-apis` auditor found
that the group's headline wall ("the issuer publishes it free, so the price floor is zero") has a live
counterexample in tenders: **Govi charges 249 ILS + VAT per month for alerting over data that mr.gov.il and
data.gov.il publish free**, and none of the eight scouts in that group had enumerated the vertical.

**Search budget: 8 of 8 WebSearch calls used.** Everything else came from GitHub (`search_code` + WebFetch on
raw.githubusercontent.com and github.com), which costs no search budget. Every Israeli vendor domain and every
`gov.il` host is egress-blocked from this container — four blocks verified first-hand this session.

---

## Evidence strength legend

- **[RENDERED]** — I fetched and read the artefact, or GitHub's code-search API returned the verbatim file
  content. Code in third-party repos that *calls* an endpoint is first-hand evidence about that endpoint.
- **[SNIPPET]** — a WebSearch result summary quoting a page I could not render. Weaker; prices in this report
  are almost all SNIPPET, because every vendor site is blocked.
- **[BLOCKED]** — the primary source exists and the egress proxy refused it. A human must open it.

Verified blocked this session, by direct attempt: `govi.co.il`, `optimatch.co.il`, `tenders.maagarim.city`,
`www.sba.org.il` — all `EGRESS_BLOCKED`. Assume the same for every other `.co.il` and `gov.il` host named below.

---

## 1. The two facts that decide this measurement

**Fact 1 — the market is occupied by at least 17 sellers, and two independent vendors have converged on
exactly the same price.** Govi at ₪249 + VAT/month (the audit's figure) and OptiMatch at ₪249/month + VAT on
an annual prepay (list ₪299) are the same number from two firms. WizBiz sells a 3-month trial at ₪599
(≈₪200/month) and has been in this business since 2006. That is not a gap; that is a price point the market
has already found. **Nothing anywhere in the evidence is priced between ₪0 and ~₪133/month.**

**Fact 2 — the narrow, fully-automated slice this measurement was sent to look for already exists, is
open-source, and is given away.** `alon94/tenders-agent` ("שווה מכרזים") is a deployed Next.js app on Vercel
that syncs **78 enumerated Israeli tender publishers** daily at 07:00, merges three feeds, scores each tender
against a user profile on a 4-dimension engine, sends a "hot alert" email above 80 points and a daily digest —
and it goes further than the incumbents in exactly the direction a niche entrant would go: it downloads each
tender's PDF and extracts whether the tender carries a **small-business preference** (`small_biz`,
`small_biz_quote`, `small_biz_confidence`). It has **0 stars, 0 forks, no licence, no pricing page and no
landing page** [RENDERED: https://github.com/alon94/tenders-agent]. The clever narrow filter is built. Nobody
found it, and nobody paid for it.

---

## 2. The sellers

Buy-side (sold to bidders — alerts, database, bid support). Price column is the best evidence available; the
period is stated only where a source stated it.

| # | Vendor (Hebrew / domain) | Price | What it adds over the free sources | Human in the product? | Self-serve or sales call | Grade |
|---|---|---|---|---|---|---|
| 1 | **גובי — Govi** `govi.co.il` | **₪249 + VAT / month**, 14-day trial, no commitment | Tender board across all sectors, advanced search, "smart agent" (pick sectors → daily or weekly email alerts + personal area), tender *results*, private tenders | **Yes** — "צוות עריכת תוכן מקצועי" (professional content-editing team) | Self-serve (trial → subscription) | Price [SNIPPET] via `audits/data-apis.md`; product shape [SNIPPET], my own search returned govi.co.il pages and confirmed the shape but **did not reproduce the price** |
| 2 | **OptiMatch** `optimatch.co.il` | **₪249/month on annual prepay + VAT** (list ₪299/month); quarterly / semi-annual / annual prepaid terms | "שירות AI שמביא לך מכרזים מדוייקים לעסק" — AI matching of tenders to one business | AI-first; contract terms imply an account manager | Prepaid contract → sales-adjacent | [SNIPPET] |
| 3 | **WizBiz** `wizbiz.co.il` | **₪599 for a 3-month trial** (≈₪200/month) | "מאות מכרזים מידי יום", per-vertical category pages, user interface, publish-a-tender side; in the field since 2006; also sells `srm.wizbiz.co.il`, a tender-management system to publishers ("14 שנים") | Not stated | Self-serve trial | [SNIPPET] |
| 4 | **יפעת מכרזים** (קבוצת יפעת) `ifat.co.il`, `ifat-businesses.co.il` | **Not published** | "מאגר המכרזים הגדול במדינה"; bid help and submission support; construction-sector database for contractors, developers, engineers, architects; subscriber gets username+password | Yes — a media-monitoring group with editorial operations | **Sales call**, and resold through chambers of commerce (e.g. `haifachamber.org.il`) | [SNIPPET] |
| 5 | **נוגה מכרזים** `nogatenders.co.il` | Not published | "מנוע חיפוש מכרזים ציבוריים לעסקים"; scans dozens of sources daily — ministries, local authorities, public corporations, hospitals; hundreds of new tenders weekly; positions to contractors, consultants, cleaning, security, engineering, IT | Not stated | Contact form | [SNIPPET] |
| 6 | **מאגרים** `tenders.maagarim.city` | Not published (`/sale/` page exists) | Locate + manage: smart alerts, task management, file storage, "organisational memory"; ministries, government companies, local authorities, municipal corporations, education, hospitals | Not stated | **Sales call** | [SNIPPET]; site [BLOCKED] |
| 7 | **GOVO** `govo.co.il` | Not published | "אתר המכרזים הרשמי", ~100% of government tenders; per-publisher sub-branch pages (civil-service commission etc.) | Not stated | Unknown | [SNIPPET] |
| 8 | **לשכת המסחר** (Federation of Israeli Chambers) `chamber.org.il` | **₪2,900 full site / ₪1,600 for one classification**, with a **20% discount via the Small Business Agency**; period not stated in the snippet (probably annual) | Curated database segmented by field, publisher and deadline; **free** weekly "Chambernet" mailing as membership marketing | Yes — curated | Membership / sales | [SNIPPET]; `sba.org.il` page [BLOCKED] |
| 9 | **מכון היצוא** `export.gov.il` | **₪1,500/year members, ~$1,000/year public; + ₪550/month analyst add-on** | Worldwide tender/project alerts for exporters, daily, by business field | **Yes** — a paid analyst tier | Membership | Price [SNIPPET] via `audits/data-apis.md`; product page [SNIPPET] |
| 10 | **כונס אונליין** `konesonline.co.il` | Not published | Receivership / liquidation notices plus a tender information centre | Not stated | Unknown | [SNIPPET] |
| 11 | **rmiclick** `rmiclick.co.il` | Not published | Paid third-party alerts on **רמ"י land tenders**, described by an independent researcher as itself scraping/mailing, because "אין API/RSS אמיתי למכרזי רמ"י" | Unknown | Unknown | [RENDERED, second-hand] — `Orhgit/tedros`, `docs/research/2026-08-24-news-autopilot-sources.md` |
| 12 | **קולות קוראים tier** — `orgil.org.il`, "קלי קולות", `arma.co.il` | Not published | Matching calls-for-proposals to an NGO's profile, saved favourites, "VIP" submission preparation at a subscriber discount; ARMA sells location + budget control **to local authorities** | Yes (VIP prep) | Sales | [SNIPPET] |

English-language aggregators that carry Israeli tenders and sell alerts to foreign bidders — the board's
"English-language foreign bidders" hypothesis, tested: **it is already occupied by at least five firms**, one of
which owns the exact-match domain. All [SNIPPET], none priced in the results:
`tendersinfo.com/global-israel-tenders.php`, `tendersontime.com/israel-tenders/`,
`globaltenders.com/government-tenders-israel.php`, **`israeltenders.com`**, `tendersarabia.com/tenders/israel/`.
One source notes the structural reason the segment is real: Israel is a **WTO GPA signatory**, so foreign
suppliers may bid — which is also why the aggregators got there first.

Adjacent, sell-side (software sold to the bodies that *publish* tenders — different buyer, listed so the
market is not miscounted): **ConWize** `conwize.co.il` (digital management of public tenders for authorities,
government companies and public bodies, plus construction bid estimation), **דקל** `bids.dekel.co.il`
(publication platform for authorities, universities and public companies) [RENDERED — in the 78-source list],
**משכ"ל** `mashcal.co.il`, and the Interior Ministry's own **נמ"ר** system for authority tenders.

Free substitutes, which is the part the price-floor argument turns on:
- **BudgetKey / מפתח התקציב** (`next.obudget.org`, הסדנא לידע ציבורי) — free search and free API over
  `tenders`, `muni_tenders`, `calls_for_bids`, `procurement_tenders_all`.
- **`alon94/tenders-agent`** — the open-source clone described in §1.
- **`barvhaim/remy-mcp`** — a free MCP server wrapping the רמ"י tender API for agents.
- **`skills-il/legal-tech` → `israeli-tender-proposal-builder`** and **`skills-il/government-services` →
  `israeli-land-tenders`** — free skills covering the *bid-support* layer (electronic tender box, thresholds,
  מכרז פומבי vs זוטא, bid strategy) [RENDERED].
- **Chambernet** weekly mailing (free), and a free "דוח קולות קוראים" that advertises itself as replacing a
  paid alerting system (`tamir-s.co.il`) [SNIPPET].

**Seller count: 17 firms selling to bidders (12 Israeli + 5 English-language), plus 4 publisher-side vendors
and at least 5 free substitutes, two of which are code we can read.**

---

## 3. The free floor — what the state publishes, and by what mechanism

This is the strongest section, because GitHub is the one place not blocked and third-party code that calls
these endpoints is first-hand evidence about them.

| Source | What it publishes | Mechanism | Evidence |
|---|---|---|---|
| **מינהל הרכש הממשלתי** `mr.gov.il` | Central tenders, ministry tenders, exemption notices (פטור ממכרז), live statuses and dates, per-tender PDF documents at `/ilgstorefront/he/p/{publication_id}` | **HTML only. No public API.** "Server-rendered HTML, 20 results per page, ordered by last-update date (newest first)"; the search path is `/ilgstorefront/he/search-tenders?q=` | [RENDERED] `alon94/tenders-agent/app/lib/db.ts`; `avi-the-coach/gov-tender-editor/scraper-service/lib/gov-scraper.js`; `natikuan/mkrzym-api/tender_scraper.py`; `OpenBudget/budgetkey-data-pipelines` (`download_pages_data.py`, `naama_scraper.py`, `add_central_urls_resource.py`) — five independent repos, all scraping, none using an API |
| **next.obudget.org** (BudgetKey, Hasadna — a civic NGO, not the state) | `procurement_tenders_all`, `muni_tenders` (municipal tenders scraped from authority sites), `calls_for_bids`, `tenders`, plus contracts, supports, entities | **Free SQL over HTTP** (`/api/query`), Elasticsearch full-text (`/search/<doc-type>`), SimpleDB (`/api/tables/<t>/query`). **No API key. CORS enabled for all endpoints. 1-hour cache. No documented rate limit.** Auth only for saved Lists | [RENDERED] `OpenBudget/BudgetKey/documentation/UsingTheAPI.md`; independently verified by a third party: "Free, no API key… ran anonymous queries successfully" (`oresh123456/igudim-dashboard`, `api-research/out/digest.md`) |
| **data.gov.il** (CKAN) | `tenders` = **דוח מכרזים**, `exemptions` = דוח התקשרויות בפטור — both described as "דו״ח מרכז, **אחת לשנה**" (a central **annual** report, Excel/CSV); municipal tender datasets, e.g. Be'er Sheva `tender-br7` "מכרזים ופניות לקבלת הצעות מחיר פעילים והיסטוריים"; several רמ"י resources | `GET /api/3/action/datastore_search?resource_id=…`, keyless; CSV/JSON/XLSX/XML | [RENDERED] `danielrosehill/Israel-Open-Data-Resources` (`tenders` → `7038b3e6-a74d-442e-b16b-466c8196124a`, `exemptions` → `65c8fced-c50c-400e-94fb-ef1a208c43e5`, `tender-br7` → `6a281768-…`); calling code in `shillo96-pixel/landwatch-israel`, `fleet-360/michrazim`, `akmake/corso` |
| **רשות מקרקעי ישראל** `apps.land.gov.il/MichrazimSite/api` | Land tenders: search, details, results, map details, settlement codes, tender types, priority populations | **JSON API, `no authentication is required`**, courtesy 1-second delay; `POST /api/SearchApi/Search`, `GET /api/MichrazDetailsApi/Get?michrazID=` | [RENDERED] `barvhaim/remy-mcp` (README + `israeli_land_api.py`), `MrAnde7son/nadlaner`, `alon94/tenders-agent`, `EdenZadikove/govmap`, `yoavweizman94-cmyk/DAILY-BRIEF` |
| **משרד הביטחון** `online.mod.gov.il` | בל"מ and defence procurement — **explicitly not published on mr.gov.il** | HTML | [RENDERED] 78-source list |
| **Government companies, hospitals, universities, water and port corporations, municipalities** | Each publishes its own tenders page — חברת החשמל, רכבת ישראל, נתיבי ישראל, נתיבי איילון, נת"ע, חנ"י, נמלי אשדוד/חיפה/אילת, ביטוח לאומי, קק"ל, מכבי/מאוחדת/כללית/לאומית, איכילוב/הדסה/רמב"ם/שיבא, 9 universities, מי אביבים, אחוזות החוף, עיריות חיפה/ראשל"צ/ב"ש/חולון/אשדוד/ת"א/פ"ת/נתניה… | Mostly HTML; the list marks several as JS-rendered, WAF-blocked, or **geo-blocked outside Israel** | [RENDERED] `alon94/tenders-agent/app/sources/page.tsx` — 78 sources with a per-source status of `active` / `pilot` / `candidate` |

Three things follow, and they cut in both directions.

**3a. The free floor is real but it is not a feed.** The *live* central source is HTML with 20 rows a page and
no API; the open-data version (`data.gov.il/dataset/tenders`) is an **annual report**, not a stream. The only
free machine-readable live-ish layer is **BudgetKey's**, and BudgetKey is a volunteer NGO mirror, not the
issuer. So "the state publishes it free" is true of the *content* and only partly true of the *mechanism*.

**3b. What the ₪249 actually buys is aggregation across ~78 heterogeneous publishers, and that is real work.**
The government companies and health funds — where the sources say the money is for SMEs ("הזדמנויות רבות
בהיקפים המתאימים לעסקים קטנים ובינוניים", on מכבי) — are exactly the ones with no central free feed.

**3c. And that work is closed to this colony specifically.** The same 78-source file records that several
publishers are unreachable from outside Israel: נמל חיפה "האתר חסום מחוץ לישראל", חוצה ישראל "האתר חסום מחוץ
לישראל", הגיחון "האתר חסום מחוץ לישראל", חברת החשמל "נדרש proxy ישראלי", plus WAF and JS-rendered blocks on
עיריית פתח תקווה, עיריית ת"א, נתניה, שיבא. Our container cannot reach `mr.gov.il`, `data.gov.il` or any of
these. **The aggregation layer that justifies the price is the one layer we cannot build from here**, and
buying an Israeli proxy is a recurring cost, which MISSION.md's float explicitly may not fund.

---

## 4. Segments — who pays ₪249, and is anyone left at ₪30–80?

**Who pays.** On the vendors' own positioning: suppliers with a bid function — contractors, consultants,
cleaning, security, engineering, IT, construction (יפעת's database is explicitly for contractors, developers,
engineers and architects); exporters (מכון היצוא); NGOs chasing קולות קוראים; and, at the top, organisations
that want an analyst (₪550/month) or "organisational memory", task management and file storage (מאגרים) —
i.e. a bid *team*, not a person. The presence of a human editorial team in the ₪249 product is the tell: what
is being sold is not the rows, it is somebody having read them.

**Who does not pay.** The freelancer and micro-business end is served, deliberately, for free — by the
chamber's weekly Chambernet mailing, by the state portals, and by the ministries' own publication duty. One
source states the market's actual friction plainly: "בישראל אין מקור רשמי אחד שמרכז את כלל המכרזים" — the
problem is fragmentation, and the fix is breadth, which is the one thing a narrow slice by definition does not
sell. And the Small Business Agency's answer to a small business that cannot afford ₪2,900 is **a 20% discount
on an incumbent's service**, not a cheaper product.

**The ₪30–80 question, answered: no such segment was found, and three of the four candidate slices are
already occupied.**

| Candidate narrow slice | Status |
|---|---|
| One category / one region filter for a micro-business | **No evidence of any product priced below ~₪133/month effective anywhere in this market.** The buyer's alternative to ₪249 is not ₪50 — it is ₪0 (Chambernet weekly, the portals, obudget). A ₪50 filtered view of a free feed is squeezed from both sides, and MISSION rule 4 / `REJECTED.md` wall 2 bites: charging for a re-cut of something free needs an added input we do not have |
| **עדיפות לעסק קטן** (small-business-preference tenders only) — the sharpest niche filter available | **Already built and given away**: `alon94/tenders-agent` extracts it from the tender PDFs with a confidence grade. 0 stars, 0 forks, unpriced |
| NGOs / קולות קוראים | Occupied at both ends: paid (orgil, "קלי קולות" with VIP submission prep, ARMA for authorities) and free (gov.il's own מאגר ריכוז קולות קוראים, משרד החינוך's portal, socialmap's "הקול קורה", and `tamir-s.co.il`'s free report explicitly sold as replacing a paid alerting system) |
| English-language foreign bidders / API buyers | Occupied — five international aggregators including `israeltenders.com`; and the "API buyer" is served free by `next.obudget.org` (SQL, no key, CORS on) and by a free MCP server for רמ"י |

---

## 5. Acquisition channel — MISSION constraint 7

How a stranger actually finds a tender service in Israel, from the evidence:

1. **Hebrew organic search — occupied by programmatic long-tail pages built from the same free data.** WizBiz
   runs a page per vertical (`/מכרזי-יועצי-נגישות/`, `/מכרזי-וירטואליזציה/`, `/מכרזי-אינטרנט-ופיתוח-תוכנה/`);
   Govi runs a page per publisher (`govi.co.il/publisher/1073` = רשות החברות הממשלתיות, `/publisher/54` = משרד
   ראש הממשלה) plus a guide post ("איפה אפשר למצוא מכרזים בישראל?"); GOVO runs `/SubBranch/` pages the same way.
   The long tail a new entrant would target is already carpeted by incumbents with domain age (WizBiz since
   2006) — **and generating the same page set from the same free rows is precisely the doorway pattern
   MISSION constraint 6 forbids.** So this channel is closed to us twice over.
2. **Chambers of commerce and the Small Business Agency.** Real and named: יפעת is resold through the Haifa
   chamber, the SBA platform carries a 20% discount on tender services, WizBiz runs a **מעוף** landing page
   on ActiveTrail. Every one of these is a human business-development relationship. **Fails MISSION rule 1** —
   the owner does not talk to anyone.
3. **Facebook and LinkedIn groups.** Named by the sources as a genuine discovery channel ("קבוצות פייסבוק
   ולינקדאין ייעודיות לתחומי המכרזים… מקור מצוין למידע שזורם בזמן אמת"), especially for NGOs. **Closed to us**
   — we cannot read them, and posting into them is per-store promotion, which constraint 4 rules out.
4. **GitHub.** Two open-source Israeli tender agents already sit there. The closest competitor has **0 stars**.
   Israeli SMB bidders are not on GitHub.

**No channel that is both open to us and compatible with the mandate was named. By constraint 7 the verdict is
therefore "not buildable now", independently of the occupancy finding.**

---

## 6. Rail — Gumroad, and the invoicing question (flagged, not resolved)

Gumroad pays ILS to Israel (established elsewhere in this repo). The question this measurement can speak to is
the *buyer's* side, and it is not settled:

- Every incumbent here bills an Israeli business in shekels. A Gumroad subscription is a **foreign
  merchant-of-record** charge in USD; the buyer receives a Gumroad receipt, not an Israeli **חשבונית מס**.
- Israeli input-VAT deduction runs on a proper tax invoice; a purchase of services from abroad is a different
  treatment path (imported services / self-invoice), and one search on it returned only export-side VAT
  material, not the import side. **I could not render a single authoritative Israeli tax source from here.**
- So the flag, stated and left open per instruction: **would an Israeli עוסק expensing a ₪250/month business
  tool accept a US merchant-of-record receipt instead of a חשבונית מס, and does that suppress conversion?**
  Unresolved. It needs an Israeli accountant or a rendered רשות המסים page, not another agent's guess.
- Secondary friction, cheap to state: USD pricing and FX in a market where every competitor quotes ₪ + מע"מ.

---

## 7. Occupancy verdict

| Question | Answer |
|---|---|
| **Number of sellers** | **17 selling to bidders** — 12 Israeli (Govi, OptiMatch, WizBiz, יפעת, נוגה, מאגרים, GOVO, לשכת המסחר, מכון היצוא, כונס אונליין, rmiclick, orgil/קלי-קולות) + 5 English-language international (TendersInfo, TendersOnTime, GlobalTenders, IsraelTenders.com, TendersArabia). Plus 4 publisher-side vendors and ≥5 free substitutes |
| **Price band** | **₪200–₪299/month** for self-serve Hebrew subscriptions — two independent vendors at exactly **₪249 + VAT**; **₪1,600–2,900** per chamber package and **₪1,500/year** for the Export Institute (≈₪125–242/month); **₪550/month** for a human analyst. **Nothing priced below ~₪133/month exists. The tier below that is ₪0** |
| **Do the free sources cover what is sold?** | **Partly, and this is the honest answer.** Content: yes — the state publishes the tenders and the exemptions, `data.gov.il` and `next.obudget.org` are keyless, and BudgetKey's free API already serves the "API buyer". Mechanism: no — the live central portal is HTML with 20 rows a page and no API, the open-data tender file is an **annual** report, and ~78 publishers each have their own site. **What the ₪249 buys is aggregation plus a human reading the results — and the aggregation half is exactly the half we cannot perform, because several publishers geo-block non-Israeli traffic and every one of them is blocked from this container** |
| **Unserved segment?** | **None found.** No product exists below ₪133/month; the sharpest narrow filter (small-business-preference tenders) is already built, open-source and unpriced with 0 stars; NGOs, English-language foreign bidders and API buyers are each occupied, twice over in two of the three cases |
| **Channel** | **None named that we may use.** Search is carpeted by incumbents and the scalable version is a doorway network; chambers/SBA need a human; the groups are closed and per-store; GitHub does not reach this buyer. **Constraint 7: not buildable now** |
| **Verdict** | **OCCUPIED — do not build. Not buildable now on constraint 7 as well, so the line fails on two independent grounds** |

**What is worth keeping from this measurement, since the vertical itself is closed:**
`next.obudget.org/api/query` is a **free, keyless, CORS-enabled SQL API with an Elasticsearch search layer over
Israeli procurement, budget, supports and entity data**, independently verified as working anonymously. That is
a better substrate than anything `products/apify-il-open-data` currently normalises, and the audit's
`data-apis` conclusion should be read alongside it. And the 78-source publisher list in
`alon94/tenders-agent/app/sources/page.tsx` is the best free map of Israeli public-procurement publishers I
have seen anywhere — including its per-source note of which sites are geo-blocked, which is directly reusable
by any future Israeli-data line.

## 8. What evidence would change the verdict

1. **A rendered vendor pricing page showing any Israeli tender product at or below ₪80/month.** The whole
   verdict rests on a price floor of ~₪133 established from snippets; one rendered page under ₪80 breaks it.
2. **A rendered Govi pricing page.** ₪249 + VAT is the anchor of this measurement and it is still SNIPPET-grade
   at two removes. My own search did not reproduce it.
3. **Evidence that `mr.gov.il` itself offers free per-interest email alerts.** One search summary asserted the
   government portal lets users "register for email alerts based on areas of interest"; a targeted follow-up
   search failed to confirm it, so it is **recorded as unverified and not relied on**. If true, it collapses
   the incumbents' core feature to ₪0 and makes the vertical worse, not better.
4. **A named channel that reaches an Israeli SMB bidder without a human and without a doorway page.** Nothing
   else in this report matters until this exists.
5. **A stranger paying us for anything at all** (MISSION §7, the whole-plan trigger). Until then every number
   here is an estimate of somebody else's market.
6. **Cheap Israeli egress.** If reading Israeli publisher sites ever becomes free and reliable from CI, the
   aggregation half of §3b becomes performable — the market would still be occupied, but the finding would be
   about competition rather than about capability.

## 9. What a human or unblocked agent must open to close this out

1. https://govi.co.il/ — the pricing page and what the ₪249 tier actually includes.
2. https://optimatch.co.il/ and https://wizbiz.co.il/איך-זה-עובד/ — confirm ₪249/₪299 and ₪599/3-months.
3. https://www.chamber.org.il/serviceslobby/tenders/ — is ₪2,900 / ₪1,600 annual, and what does Chambernet's
   free weekly mailing contain?
4. https://www.sba.org.il/hb/BizPlatform/Pages/plt76.aspx — which vendor the state discounts for small
   businesses, and on what terms.
5. https://mr.gov.il/ilgstorefront/he/ — does the portal offer free per-interest email alerts, and is there any
   RSS or API behind the storefront?
6. https://nogatenders.co.il/ and https://tenders.maagarim.city/sale/ — the two unpriced Israeli vendors.

---

## 10. Paragraph for `docs/REJECTED.md` (or `docs/INCOME_PLAN.he.md`)

**Israeli tender alerts — measured 2026-09-07, rejected as occupied and unbuildable.** Seventeen sellers reach
this buyer: twelve Israeli (Govi, OptiMatch, WizBiz, יפעת, נוגה, מאגרים, GOVO, לשכת המסחר, מכון היצוא and three
more) and five English aggregators, including israeltenders.com. Two price at ₪249 + VAT/month; nothing exists
below about ₪133, because the tier beneath is free — the chamber's weekly mailing, BudgetKey's keyless SQL API,
and an open-source clone syncing 78 publishers that even extracts small-business-preference tenders, with zero
stars and no price. No segment is unserved at ₪30–80. The ₪249 buys aggregation across those 78 publishers plus
a human editor, and several of them geo-block non-Israeli traffic — the one layer we cannot build. No usable
channel was named: search is carpeted by incumbents, chambers need a salesperson, the groups are closed.
**Re-open only on a rendered Israeli tender product at or under ₪80/month, or a named owner-free channel to an
Israeli SMB bidder.**
