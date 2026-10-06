# il-biz-tools — כלים לעסק

A static, dependency-free, Hebrew (RTL) micro-site with eight tools for Israeli freelancers and
small businesses (`pcn874.html` is the free validator page of the separate `pcn874` line). No framework, no dependencies at runtime: the build ships only the files the shipped pages
load, writes a no-figures notice in place of any withheld page, filters the sitemap, and refuses to build at all
while a publish blocker stands; the deploy artifact is `_site/`.

> **Open blocker (27.9.2026): the site cannot be published yet.** The accessibility statement
> (`accessibility.html`) needs a contact for accessibility requests. No brand mailbox exists and the owner's
> personal details may never appear, so the contact is a marked placeholder and `node scripts/build-site.js`
> refuses while it is there. See [The accessibility statement](#the-accessibility-statement-and-the-publish-blocker).

## What it sells, to whom

| Tool | Page | Free | Pro (paid) |
|---|---|---|---|
| VAT calculator (מחשבון מע"מ) | `vat.html` | yes | — |
| Osek patur ceiling tracker (מעקב תקרת עוסק פטור) | `osek-patur.html` | yes | — |
| בעל עסק זעיר self-check (30% of turnover or actual expenses?) | `osek-zair.html` | yes — tax years 2024 and 2025 only, taxable income only, every figure cited to a primary text | — |
| Net salary estimator (אומדן שכר נטו) | `net-salary.html` | yes | — |
| Receipt / invoice generator (קבלה / חשבונית עסקה) | `invoice.html` | print / PDF, local save, saved client list, per-type auto numbering | document branding: your logo and accent colour |
| Allocation-number check (מספר הקצאה) | `allocation.html` | yes | — |
| Companies-Registrar annual fee (אגרה שנתית לרשם החברות) | `registrar-fee.html` | deadline calculator; **no shekel amounts** — see the gate below | — |
| PCN874 structure validator (בודק קובץ PCN874) | `pcn874.html` | yes — structure only, individual-merchant file (Appendix A) only, in the browser, no upload; its page views count for the `pcn874` line through the colony's weekly reader (`src/revenue/page-views-reader.ts`) once the PostHog project, its key in `site.json`, the read key and D0 exist (none does today) | — (no price on the page; the paid builder waits for owner steps 2+3 and a pricing ruling) |

Audience: Israeli self-employed (no headcount is sourced in this repo), especially **עוסקים פטורים** (freelancers under the
VAT threshold) who need a receipt today and want to know when they will cross the ceiling.
Traffic model: Hebrew SEO only (each tool page has a title, description, canonical, and a FAQPage JSON-LD
answering the exact questions people search). Nothing else is planned: no posting in groups, no outreach,
no paid ads. The owner does not talk to people and the colony does not post into communities, so if
search sends no one, the page-view kill rule is what answers it.

### Pricing suggestion
- Free tools: free forever (they are the SEO funnel).
- **Pro – הלוגו וצבע המותג על המסמך (the logo and brand colour on the document): one-time ₪79** through **Gumroad**,
  which replaced Paddle here. ₪79 is the price the product job asks Gumroad for; the page shows only what Gumroad
  reports back (`gumroad.priceCents`), never a number typed into HTML.
  Gumroad is the merchant of record, pays out in ILS to an Israeli bank (the one payment rail this repo
  has rendered evidence of that for), and no source reports a liveness video in its onboarding — the Paddle onboarding step that collides
  with the mandate. Stripe does not take an Israeli individual as a direct merchant (the one Stripe path on the owner
  checklist is Connect Express through Algora, step 4); PayPal Business and Payoneer
  Checkout remain the fallbacks.
- Whether Gumroad's rules admit Pro in its current shape is read from Gumroad's own help text, **not ruled on**:
  licence keys "can help creators verify purchases through their application and authorize or revoke access to
  the software they have created" (`_76-license-keys.html.erb`), and the outside-fulfilment rule is about products
  with **nothing** attached — "A product that has real files or content is never affected by this"
  (`_155-things-you-cant-sell-on-gumroad.html.erb`). So the product carries real content: written Hebrew
  activation instructions plus Gumroad's licence-key block (a downloadable guide would be better still and is not
  built). Gumroad's own review after the first 3–4 sales is the actual ruling
  (`research/measurements/gumroad-license-decision.md` §1, §9). It is not an AI service and must never be sold as one.

## Verified figures and sources (September 2026)

| Figure | Value in config | Status | Source |
|---|---|---|---|
| VAT rate | 18% (`src/config/vat.json`) | verified | [ynet – taxes 2026](https://www.ynet.co.il/economy/article/yokra14629288), [mako](https://www.mako.co.il/finances-news/Article-f27f6c987b8fa91027.htm) |
| Osek patur ceiling 2026 | ₪122,833 (`src/config/osek-patur.json`) | verified against secondary sources only (Kol Zchut, Bizportal, mako, CPA circulars); no gov.il page rendered from here | [Kol Zchut](https://www.kolzchut.org.il/he/עוסק_פטור), [Bizportal](https://www.bizportal.co.il/guides/news/article/20039167) |
| Income-tax monthly brackets 2026 | 10% ≤7,010; 14% ≤10,060; 20% ≤19,000; 31% ≤25,100; 35% ≤46,690; 47% ≤60,130; 50% above (`src/config/tax-2026.json`) | **estimate (אומדן)** — widened brackets approved 30.3.2026, retroactive to 1.1.2026; verify against the Tax Authority booklet | [N12/mako](https://www.mako.co.il/news-money/calculators/Article-54d2f6451f9ff91027.htm), [Tax Authority monthly deductions booklet 2026 (PDF)](https://www.gov.il/BlobFolder/generalpage/income-tax-monthly-deductions-booklet/he/generalInformation_income-tax-monthly-deductions-booklet_monthly-deductions-booklet-2026.pdf), [Knesset research (PDF)](https://fs.knesset.gov.il/globaldocs/MMM/a4622f6b-9905-f111-a13e-005056aa7c52/2_a4622f6b-9905-f111-a13e-005056aa7c52_11_21431.pdf) |
| Credit point value | ₪242/month (frozen 2025–2027) | estimate | [mako](https://www.mako.co.il/news-money/calculators/Article-54d2f6451f9ff91027.htm), [msl.org.il](https://msl.org.il/מחקר/מדרגות-מס/) |
| Surtax (מס יסף) | 3% above ₪721,560/yr — **not modelled** | n/a | same |
| Bituach Leumi reduced tier | up to ₪7,703/month: 1.04% NI + 3.23% health | estimate | [Kol Zchut – employee NI](https://www.kolzchut.org.il/he/דמי_ביטוח_לאומי_לעובד_שכיר), [BTL health rates](https://www.btl.gov.il/Insurance/Health_Insurance/Pages/שיעורי%20דמי%20ביטוח%20בריאות.aspx), [Malam 2026 updates](https://www.malam-payroll.com/national-insurance-updates-for-2026/) |
| Bituach Leumi full tier | ₪7,703–₪51,910: 7% NI + 5.17% health | estimate | same |
| Allocation-number thresholds | ₪25,000 → ₪20,000 → ₪10,000 → ₪5,000 from 1.6.2026 (`src/config/allocation-number.json`) | verified | Chamber of Commerce, Grant Thornton IL, Green Invoice, iCount |
| Companies-Registrar annual fee (reduced / full) | `1338` / `1777` held in `src/config/registrar-fee.json` and **never rendered** | **unverified — not published** | six independent accountancy circulars (Stark, YFCPA, PKF Amit Halfon, Gabbay & Shlafman, Brit Pikuach, Erlich) as quoted in `research/colony-sweep/audits/israel-bureaucracy.md` §2.2 and `groups/israel-bureaucracy.md`. No primary source (תקנות החברות (אגרות) / רשות התאגידים) was ever opened |
| Registrar reduced-rate window (through 31 March; full rate from 1 April) | `deadline` in `src/config/registrar-fee.json` | unverified against a primary source, **rendered anyway, labelled** | same six circulars |
| בעל עסק זעיר deduction rate | 30% of turnover (`src/config/osek-zair.json`) | **read in a primary text** (third-party copy), 29.9.2026 | ספר החוקים 3045 p.172, Income Tax Ordinance 87ד(א) (image; transcribed in `logs/2026-09-29-osek-zair-check.md`); Tax Authority data report, `research/rendered/tt2-capitax-21072025-1.txt:27-28` |
| בעל עסק זעיר cap, tax years 2024 and 2025 | ₪120,000 (`src/config/osek-zair.json`) | **read in a primary text** (third-party copy), 29.9.2026 | gazette p.171 (87ב(1): the VAT עוסק פטור amount) and p.173 (section 35: 120,000; 37(ב): first CPI step 1.1.2026); report `:27-28`, `:34-35` |
| בעל עסק זעיר cap, tax year 2026 | `122833` held in `src/config/osek-zair-unverified.json` and **never rendered or shipped** | **unverified** — CPI-linked from 1.1.2026; no primary text read states it. From 29.9 to 6.10.2026 the page computed it from a capture accepted in place of one; on 6.10.2026 that capture was marked `[robots-bar]` and left the product (`research/channel-loop/RULING-2026-10-06-robots-and-terms.md`, decision 1) | the osek patur ceiling of `osek-patur.json` (secondary). The page refuses 2026 |

Not modelled in net salary: surtax, pension tax credit, special credit points (children, degree,
army), benefits in kind, study fund.

**Source, and what was checked when, on the page (TikTok note N8; corrected 29.9.2026).** `osek-patur.html`,
`vat.html` and `allocation.html` state a statutory figure, so each shows "מקור: <name> (מקור משני) · <check>" right
after its lead, and in the answer that states the figure (the JSON-LD answer too), from `source` and `check` in the
config (`src/lib/source-line.js`). The check says only what a record in the repository backs: "נבדק: <date>" for a
dated read of the cited page (`check.how: "read"`, none yet), "הושווה לתוצאות חיפוש: <date>" for a comparison with
search results (`"search"`), and "תאריך הבדיקה לא תועד" when no dated record exists. The ceiling and the VAT rate
rest on the search read of 7.9.2026 (`research/measurements/serp/2026-09-07-hebrew-calculators.md`), which opened no
page - so they say "compared with search results", not "checked" (review of 29.9: the earlier "נבדק: 7.9.2026"
claimed a read nobody made). The allocation threshold has no dated record at all. `tests/statutory-sources.test.js`
opens each `check.record` and requires the date and the figure in it (and, for "read", the cited address). A dated
read of a primary page (note §8.1 N13) is what turns a line into "נבדק". The home page says each figure's source is
on its tool's page. The osek patur ceiling is set per calendar year, so once the year in the config is over the
page script shows "הנתון לא עודכן עדיין לשנת <year>" beside the source line until someone checks the new figure.
Only verified configs get a line: `net-salary.html` renders `tax-2026.json` (`verified: false`) and claims no
check date anywhere.

## The unverified-rate gate (why `net-salary.html` is not on the public site)

MISSION rule 4 (honest value only), read here as "never publish an unverified legal figure", used to be kept by hand: `tax-2026.json`
says `"verified": false`, the page wears an **אומדן** badge, and everyone hoped the badge was enough.
It is not, so the rule is now enforced by the build for rendered pages — and, since 27.9.2026, for the config
files themselves. Until then the build copied `src/config/` (and `src/lib/`) into `_site/` whole, so
`tax-2026.json` and the registrar amounts were reachable at `/src/config/` although no published page rendered
them.

**What reaches `_site/` now.** Nothing is copied by folder. `src/lib/site-deps.js` follows every local reference
from the HTML that will ship — `<script src>`, `<link href>`, `<img src>`, imports inside an inline module — then
every `import` and every `fetch('literal')` in the modules those load, and the build copies exactly that set.
Each JSON file reached then goes through `CONFIG_PUBLISH_RULES` (`src/lib/publish-gate.js`):

| Config | Rule | What ships today |
|---|---|---|
| `vat.json`, `osek-patur.json`, `allocation-number.json`, `osek-zair.json` | `verified` — ships only while `"verified": true` | the whole file |
| `osek-zair-unverified.json` | `verified` | **nothing**: no page loads it (the 2026 cap waits there, beside the VAT section reference 31(3) from an unrendered regulation), and a shipped page that did would stop the build |
| `tax-2026.json` | `verified` | **nothing**: no shipped page loads it (its page is withheld), and if one did the build would stop |
| `registrar-fee.json` | whole once verified; until then only `verified`, `renderAmounts`, `updated`, `deadline` | the dates and the two flags, rewritten into a fresh file — **no amount, no notes, no internal sources** |
| `site.json` | `no-figures` (site metadata) | the whole file |

Fail closed: a JSON file with no rule never ships, and a shipped page that loads one stops the build; so does a
shipped page that loads a `verified`-rule config which is not verified, a reference that climbs out of the
product or points at a missing file, and a dynamic `import()` with a computed target. A withheld page's notice
loads only the stylesheet, so `net-salary.js` and `page-net-salary.js` no longer ship either, and neither do the
build-time modules (`publish-gate.js`, `site-deps.js`, `a11y-check.js`). `tests/build-site.test.js` runs the real
build in a throwaway copy and asserts no unverified config and no registrar amount is in the output; putting the
old folder copy back turns four of its tests red.

`src/lib/publish-gate.js` maps every page to the config files whose **figures it renders**.
`node scripts/build-site.js` reads those configs and, for any page depending on one that is not
flagged `"verified": true`:

- the real page is **not copied** into `_site/`;
- a short notice ships at the same URL instead — a "לא מאומת" banner, an explanation, `noindex`,
  and not one figure of any kind;
- the URL is dropped from the `sitemap.xml` that ships.

Nothing in the source tree moves, so `npm run serve`, the tests and local development still see the
real page; the day the rates are confirmed against the Tax Authority booklet, flipping one JSON flag
republishes it. `node scripts/check-html.js` prints the same verdict for its fixed list of 10 pages (the 9 tool
pages and `accessibility.html`) plus `404.html`. What **fails** on an HTML page missing from the map is the build (`scripts/build-site.js`) and
`tests/publish-gate.test.js` — a page nobody classified is a page nobody decided about.

Today the gate withholds exactly one page: `net-salary.html`. Nothing here marks anything verified.

`registrar-fee.html` takes the other route the gate allows. Its config *is* unverified, so the page
renders **no shekel amount at all**: `feeAmountDisclosure()` in `src/lib/registrar-fee.js` refuses to
hand the amounts out while `verified` is false, the page tells the reader to check the amount at
רשות התאגידים, and a test asserts the shipped HTML contains neither figure. What it does render is
the *rule* and the *calendar* — which carry the same evidence grade, are labelled as such on the
page, and differ in what a mistake costs: a wrong date sends someone to check early, a wrong amount
is a number they act on.

## The accessibility statement and the publish blocker

An Israeli commercial site owes an accessibility statement (הצהרת נגישות) and IS 5568 conformance
(`research/colony-sweep/audits/israel-bureaucracy.md`, the two places that name it). `accessibility.html` is
that statement, and it says only what is true:

- **Not claimed:** conformance with IS 5568. The site has had no full IS 5568 audit and no accessibility
  expert or certified auditor (מורשה נגישות) has looked at it, and the page says exactly that.
- **What was checked, how, when:** on 27.9.2026, an automated check of every page's source and of the stylesheet,
  without a browser — the 13 checks in `A11Y_CHECKS` (`src/lib/a11y-check.js`): lang/dir, title, zoom not blocked,
  image alt, form-control labels, button and link names, one h1 and no skipped heading level, unique ids, `main`
  and named `nav`, no positive tabindex, focus outline not removed, and 26 text/background pairs read from
  `assets/style.css` at ≥ 4.5:1 by the WCAG 2.0 formula. `tests/a11y-check.test.js` holds the page's list equal
  to `A11Y_CHECKS`, word for word, so the statement cannot list a check the code does not run or skip one it does.
- **What the first run fixed:** `--brand` `#0f6fff`→`#0b63e6`, `--ok` `#1a8f4e`→`#157a45`, `--warn`
  `#c77d00`→`#8f5b00` (links, button labels and two badges were 3.0–4.4:1), and the home page's tool-card
  headings went from `h3` to `h2` (they skipped a level).
- **What was not checked:** a screen reader, keyboard use in a real browser, 200% zoom, content the scripts
  create at runtime, the printed / PDF receipt, and the accent colour a Pro user picks.

The build runs the same checks on every page it would ship and refuses to publish if any fails, so the
statement's "checked" stays true.

**The blocker.** A statement normally names a contact for accessibility requests. No brand mailbox exists, and
the owner's personal details may never appear on the site, so the contact is a placeholder marked
`data-publish-blocker="accessibility-contact"`. `publishBlockers()` (`src/lib/publish-gate.js`) refuses the
publish unless all of these hold, and deleting the marker satisfies only the first:

1. no shipped page carries a `data-publish-blocker` marker, written any way HTML allows (quoted, unquoted,
   without a value, any letter case, inside a comment);
2. no shipped page carries the placeholder's words (`ממלא מקום`, `לא לפרסום`), however they are spaced, split
   by tags or entity-encoded;
3. `accessibility.html` has at least one visible `<a data-a11y-contact href="…">` inside `<main>` whose href is
   `mailto:` with exactly one address, `https:`, or `tel:` with a full number, at a public domain (reserved
   example/test domains are refused), with visible link text; every element marked `data-a11y-contact` must
   pass;
4. `accessibility.html` is in the build at all.

On any failure `node scripts/build-site.js` exits 1 and deletes `_site/`, so Netlify's build fails and no stale
copy is left to upload. `node scripts/build-site.js --preview` builds the identical tree into `_preview/` (never
`_site/`, gitignored) and lists the blockers instead of stopping, for inspection only. To clear it: replace
that one `<p>` with a paragraph holding the real, brand-owned contact as
`<a data-a11y-contact href="mailto:…">…</a>` (or an `https:` form or a `tel:` number). The gate can check that
a contact is well-formed and visible; it cannot check that someone reads it. Choosing the contact is a decision,
not code — it is on the owner-ask list, not solved here.

## The בעל עסק זעיר self-check (`osek-zair.html`, TikTok note A11)

What it answers, for tax years 2024 and 2025: is the year's turnover within the cap (₪120,000; "אינו עולה על", so
equal is within), and is taxable income from the business lower under the track (turnover minus 30% of turnover)
or under regular reporting (turnover minus the expenses entered) - and by how much. It says, in the result, when the
30% track loses (expenses above 30% of turnover), and then carries the two-year cooling-off of 87ה(ב) into that
verdict. It says it takes income from the business to equal the turnover entered (87ד(א) deducts a share of turnover
from income; if they differ, both taxable-income rows move by the same amount and the gap does not). Pure arithmetic
in `src/lib/osek-zair.js`; nothing stored or sent.

Over the cap it compares nothing but does not say the deduction is gone: section 87ד(ג) lets someone registered on
the first day of the tax year who stops qualifying during it still deduct, up to 30% of the cap (`yearOfExitRate`;
₪36,000 for 2024 and 2025). The tool cannot know whether that was so; the result names the section and the ceiling.
The FAQ adds 87ד(ב), a cost the comparison leaves out (depreciation added back on selling a business asset), and the
turnover hint cites 87ז(א) and a 2025 draft under it, as a draft whose enactment has not been read.

What it refuses: **tax** (no text read gives brackets or credit points; the page says why and quotes the Tax
Authority's own "almost 80% under the tax threshold"), **tax year 2026** (the cap is CPI-linked from 1.1.2026 and no
primary text read states it; its amount waits in `osek-zair-unverified.json`, which no page loads and the build never
ships; the page offers 2026 as not computed and says so in `pendingYears.2026`, cited to the gazette alone) and any
later year (`compareTracks` refuses a year not in `years`),
**the conditions** (listed with section and page, not checked), and **National Insurance** (the same law amended it;
the meaning is unread).

Where every number comes from: `src/config/osek-zair.json`. Each fact and condition cites a text capture by file and
line (the quote must be at those lines after bidi marks become spaces) or the gazette - ספר החוקים 3045, an
image-only PDF - by page, with the quote in the dated read record `logs/2026-09-29-osek-zair-check.md` (the three
pages were rendered to images and read on 29.9.2026; after review they were read again, `check.review`).
`tests/osek-zair-page.test.js` walks the chain both ways: every run of text with a digit on the page is a config
string the page renders or one of a few fixed strings that may restate only the rate, caps and years; every number in
a fact is in its quotes; every quote is at its lines or in the record, on the page it cites (page bounds in
`documents.gazette.recordPages`) and inside the section it names; every capture's sha256 matches its `.meta.json`.
The home page card names the tool without its figures, since `index.html` renders no config and the gate cannot
withhold what it shows. The source line after the lead says
"עותקים באתר capitax.co.il · נבדק: 29.9.2026": the documents are primary texts, the copies are a tax firm's.

The name: the track is "בעל עסק זעיר" (amendment 265); "עוסק זעיר" appears only as the search phrase and in the
answer that sets it apart. That answer says nothing about the phrase in the VAT law: the sentence that did
(`facts.vatSense`, 29.9 to 6.10.2026) was cited to a capture marked `[robots-bar]` on 6.10.2026 and left the product
with it, and no pinned excerpt of a permitted text of the law was in the repository to cite it to instead
(`RULING-2026-10-06-robots-and-terms.md`, decision 1(5)). The older secondary sentence ("עוסק זעיר" is also a VAT-law
term) does not come back: the law's text, where read, shows the definition deleted. The section reference 31(3),
which a statute mirror of the VAT registration regulations ties to the phrase, is not on the page; it stays in
`osek-zair-unverified.json` until the regulations are read.

## The registrar annual-fee page (`registrar-fee.html`)

What it answers: *when* the reduced-rate window for the Companies Registrar annual fee closes.
Given a date it returns this year's 31 March deadline, the 1 April switch to the full rate, and —
once that has passed — the next window and the days to it. Pure calendar arithmetic in
`src/lib/registrar-fee.js`, no registry lookup, no company data.

What it refuses to answer: **how much the fee is.** The repo's research corroborated ₪1,338 reduced
and ₪1,777 from 1.4.2026 across six independent accountancy circulars (`audits/israel-bureaucracy.md` §2.2), and the group
report (`groups/israel-bureaucracy.md`) states that not one primary Israeli legal or government source was
rendered by any of the nine agents in that group — "That is enough to decide where to build; it is not
enough to publish to users as guidance". So the amounts stay in
`registrar-fee.json` with `verified: false` and `renderAmounts: false`, `feeAmountDisclosure()`
refuses to hand them out, the page tells the reader to check רשות התאגידים, and a test asserts the
shipped HTML contains neither number. The `חברה מפרה` status half of the original product idea is not
built at all: it needs a `data.gov.il` field nobody has been able to render.

The free email reminder is **rendered disabled** and posts nowhere — there is no backend and no
endpoint. The board gated the paid reminder on 100 weekly views of this page; the free form is gated
with it, because collecting addresses for a service that may never open is the thing not to do. Two
pieces of copy sit at the point of capture, and both are 🔍 **drafts awaiting a lawyer**:

- **§30א(ג) disclosure** — the buyer is told at collection that the details will also be used for
  advertising of a similar kind, and is given a refusal checkbox there and in every future message.
  Israel's spam law makes this right non-retroactive: an address collected without that sentence can
  never lawfully be emailed, which is why the sentence exists before the first address does.
- **Amendment 13 handling** — what is stored (email, optional company number, signup date), for how
  long (until deletion is requested, at most 24 months after the last reminder), how to delete it
  (one message; the contact address is published when the service opens, and deliberately not
  invented before that), and that nothing is sold, rented or passed on.

The page itself carries a plain-Hebrew "נוסח טיוטה, טרם נבדק משפטית" note rather than the 🔍 emoji.

## The PCN874 validator page (`pcn874.html`)

A free, static page that checks the **structure** of a PCN874 file (`דוח מע"מ מפורט`) in the browser. It
belongs to the `pcn874` revenue line (research/channel-loop/BOARD-LOOP.md, rank 4) and rides this site's
deploy, because pcn874 has no public surface of its own.

**What it runs.** products/pcn874's own validator - not a port. `src/vendor/pcn874/` holds `sources`,
`layout`, `parse` and `validate` from `products/pcn874/src`, with the types stripped by Node's
`module.stripTypeScriptTypes` (mode `strip`) and nothing else changed (`src/lib/pcn874-bundle.js`). Each file
is headed with its source path and the source's sha256. `scripts/build-site.js` regenerates the bundle on every
build and **refuses, preview included, if the committed copy differs or `../pcn874/src` is missing**; so after
any change under `products/pcn874/src`, run `node scripts/bundle-pcn874.js` and commit the result.
`tests/pcn874-bundle.test.js` proves the committed bundle is that generation and that every pcn874 fixture
validates identically through the bundle and the TypeScript. The one change pcn874 needed for this was
`Buffer.byteLength` → `TextEncoder` (its `tests/browser-safe.test.ts` keeps the four modules free of Node-only
APIs). `netlify.toml` pins an exact `NODE_VERSION` (`22.22.2`, the version the committed bundle was generated
on) and `package.json` says `>=22.13`: the strip API needs 22.13+, and the build's byte-for-byte check means a
floating `"22"` could fail a deploy on a Node patch release that changes the stripper's output. Moving the pin
means regenerating the bundle on the new version in the same commit. CI (`.github/workflows/products-ci.yml`)
still says `node-version: 22`; it was left alone (outside this page's brief), and if a Node release ever changes
the output, CI's bundle test is where it shows first.

**What it says.** In Hebrew, above the file input: it checks only an individual merchant's file (Appendix A),
not a representatives' file (Appendix B); it checks structure only; it **cross-checks no amount** and **does not
compute `reportedVat`**; a few rules read an amount (zero or not, the 5,000-shekel identified-sale threshold,
the petty-cash cap as a warning) but none compares header totals to the records; it also does **not** check
that an invoice date is a real date inside the period, VAT-id check digits, or whether an invoice needs an
allocation number (zeros are accepted; the page links `allocation.html` for that question); the circular is
from 2009, no later edition was found, the allocation-number regime came after it, and it says itself that
figures like 5,000 and 2% may change; a file that passes can still be rejected. The Tax Authority's own check
is its simulator, linked at `ITA_SIMULATOR_URL` from pcn874's own `sources.ts` - and the page says what the
cited manual says (`research/rendered/pcn874-h-erp-mirror.txt:1269-1270`): the simulator too checks only in
part, and the transmission itself decides. The page does **not** call the simulator free: pcn874's sources say
no rendered source states a price or confirms the address today, and the page says the address comes from a
vendor manual. A warning is never called harmless: the page says the circular does not settle it, so it is
not counted as an error here, and the Tax Authority may still reject the file for it. A clean result is shown
in a neutral box, not a green one. A file that looks like Appendix B (an `A` record or a `Z` closing record)
gets "this looks like a representatives' file, which the checker does not check" instead of "does not
conform", and the closing record is named by its real first letter. The Hebrew for `detail.*.signOfZero`
depends on the severity: the warning (invoice total zero, VAT not - a VAT-only credit) tells the user not to
change the sign without checking, and never reads like the error (both zero). Findings are listed per line in a table - record, field, severity, the failed rule
in Hebrew (`src/lib/pcn874-report.js`, one Hebrew line per rule id the validator can emit, enforced by
`tests/pcn874-report.test.js`), the validator's English in a `<details>` labelled "sources and notes" (its
`officialText` carries vendor-manual text and the validator's own notes, not only the circular's words) - and
the summary goes to a `role="status" aria-live="polite"` region.

**Reading the file.** The page and the pcn874 CLI decode a file through the same function
(`decodePcn874Bytes` in pcn874's `parse.ts`): UTF-8, invalid bytes replaced, a leading BOM kept - and both say
so when the bytes were not UTF-8 (a Hebrew file saved as Windows-1255: the byte widths reported are of the
decoded text, and the page replaces the `file.byteWidth` line accordingly) or when the file starts with a
byte-order mark (the reason its first line is not seen as the header). Files over 25 MB (`MAX_FILE_BYTES`, more
than 400,000 records) are refused before a byte is read: the validator runs on the page's thread, and a 62 MB
file measured 6.8 s and about 680 MB. The input is emptied after each pick, so picking the same fixed file
again re-runs the check; a slower earlier file never overwrites a later one's result; and a failure inside the
checker is reported as the checker failing, not as an unreadable file or a finding.

**After a result (TikTok note N7).** Once a check finishes - clean or not - a slot below the findings offers
"הדפסה / PDF של הממצאים" (`window.print()`). The printout carries a header the screen never shows (`.print-only`):
the file name, the date checked, "not acceptance" and "מסמך זה אינו ייעוץ מס", then the scope box verbatim, the
summary and the findings; the file picker, the slot, the FAQ and the rule reference do not print. A share button
exists only where the browser has `navigator.share`, and shares only when pressed: the text
(`src/lib/pcn874-share.js`) holds the error and warning counts and the ids of the rules that fired - never a
value from the file and never its name - and the page's address alone on the last line with `?via=share`; no
emoji and nothing above U+FFFF. The `api.whatsapp.com` fallback is built and tested but ships **off**
(`WHATSAPP_FALLBACK_ENABLED = false`): the note's release gate wants an Android and an iOS device test recorded
at `docs/whatsapp-share-device-test.md` first, and the tests fail if the flag is turned on without that file.
The FAQ answers "למה הבודק חינמי?" with a funding line and no link to anything paid, and says the validator "חינמי
ונשאר חינמי" - `invoice.html`'s own words - and never "לתמיד" or "לכל החיים" (RULING-2026-09-29-lines (f): "stays
free" is structural, the free core is MIT; it is not "stays up"). The funding sentence stays as it is until a
generator is priced, when it must change; a paid pcn874 offer, if any, is a one-time licence priced only after the
validator page's D0+56 read passes.

**One dealer's file, yours or a client's (N15).** The scope box says "כאן אפשר לבדוק קובץ של עוסק אחד – שלכם או
של לקוח – קובץ אחד בכל פעם". No page and no share text pitches the validator for accountants' or
representatives' multi-client filing (Appendix B is not supported; extending it is Fable F4).

**The rule reference (N10).** Below the FAQ, "כל הכללים שהבודק בודק" lists every check - error or warning, the
lines of the circular it cites (of the text extracted from the PDF, which the section says), a plain Hebrew
explanation, then what is not checked. It is generated from the validator's own rule table, `RULES` in
`products/pcn874/src/validate.ts`, which every finding takes its severity and citations from
(`tests/rules.test.ts` there proves every finding equals its row and every row is reported by some input). The
section sits in `pcn874.html` between two markers; `node scripts/pcn874-rule-reference.js` rewrites it, `--check`
reports a stale one, and the build refuses, preview included, when it differs from the table - so after a rules
change run `node scripts/bundle-pcn874.js` and then `node scripts/pcn874-rule-reference.js`.

**What it does not do.** The file is read with `File.arrayBuffer()` and validated in the tab; it is not
uploaded, sent or stored. No module the page loads contains `fetch`, `XMLHttpRequest`, `sendBeacon`,
`WebSocket`, `EventSource` or a storage API, and the page script runs in the tests with all of them trapped. The
page sends nothing itself: sharing is the user's own `navigator.share`, with counts and rule names only.
The page carries no price, no "buy" and no Gumroad link.

**Page views - the counter runs, the read path is wired, nothing is configured.** The page calls `initPage()`,
so the site's cookieless PostHog counter (off until `posthog.projectKey` is set) counts its views by URL like every
other page. The colony's hourly tick now reads them (29.9.2026, loop board `RULING-2026-09-29-loop.md` (b)):
`src/revenue/page-views.ts` turns PostHog query results into weekly counts - `pcn874.html` (or `/pcn874`) for the
`pcn874` line, every other page for `il-biz-tools`; `/preview/…`, the 404 page, any page withheld as a noindex
notice (asked of `src/lib/publish-gate.js` itself) and any other path excluded, and only the canonical host of
`siteUrl` counted - and `src/revenue/page-views-reader.ts` calls PostHog's query API
(`POST https://eu.posthog.com/api/projects/<id>/query/`, one HogQL query per completed week, with the paths
bucketed inside the query - `/preview/…` in one row, each site page as itself, everything else in one `(other)`
row - so invented paths sent with the public project token cannot make a week too long to read) and writes one
`weeklyPageViews` KPI row per line per week: the week in its unit, the time it was written in `captured_at`. The
report prints, per week read, what was counted for each line and what was not counted and why (preview, noindex,
other paths). Weeks run seven days from the clock's anchor day in `state/colony/page-view-clock.json` (D0, then the
domain deploy day), and a week is read 6 hours after it ends. The same tick evaluates the gates on those rows:
nothing before two consecutive weekly writes; no two *written* by D0+21 is an instrument fault (fixed, clock
restarted, never a fail - a week read late does not undo it) - a netlify-period gate: the domain deploy starts the kill
clock, not a new instrument, so no day-21 deadline runs from the domain deploy day
(`RULING-2026-10-06-domain-clock.md`); the D0+56 read is made once week 8 is read: under 5
page views over weeks 1-8 → pause, 100 a week or more over weeks 5-8 → pass, between → one extension to D0+112,
read the same way over weeks 9-16, and between again → pause, as under 5, re-entering at the domain deploy
(`RULING-2026-09-30-documents.md` (c)); and "under 100 a week for 8 consecutive weeks" → kill, on the clock that starts
at the domain deploy (BOARD-LOOP PUBLISH-10, restated in `RULING-2026-09-28-floors.md` row 9). A week still unread a
day after it became readable is `reader_down` in either period - a blocker until the reader reads it, never a clock
restart, because PostHog keeps the events and a late read is the same count; a week that cannot be read at all is the
loop's call, recorded as an instrument fault with a new d0 (no gate detects it: such a week is never written and stays
`reader_down`); after a final netlify-period verdict a later gap is a diagnostic note, not a blocker - and a reader
that is not configured while a D0 is recorded is a blocker at once. A verdict is printed in the report for
the board to apply; nothing moves a line by itself. A week that cannot be read is not written, and a missing week
is unmeasured, never zero. Tests: `src/__tests__/revenue/page-views*.test.ts`, against a fake fetch and fixtures
shaped like PostHog's documented response.

What still has to happen before it reads anything - each part is a no-op until it exists, and the report names
the missing one:

1. **The PostHog project** (cookieless server-hash mode on), its `phc_` key in `posthog.projectKey`
   and its numeric id in `posthog.projectId` (or the `POSTHOG_PROJECT_ID` Actions variable). **Agent work, through
   the PostHog connector attached to the session** - the board assigned it there (`research/colony-sweep/BOARD.md`
   §6.3; `research/channel-loop/BOARD-LOOP.md` rank 2, first action (4)); it is not an owner step. Not done: this
   change creates nothing.
2. **`POSTHOG_READ_KEY`**: a PostHog personal API key with the "Performing analytics queries" (query read) scope
   and nothing else, as a GitHub Actions secret. PostHog mints personal keys in a signed-in user's settings; whether
   the connector's account can mint one was not checked here (that is a live call). Putting it into the repository's
   secrets needs a repository admin, which today means the owner's one-time step-6 sitting, beside the tokens pasted
   there - **but it is not on the owner's list**: adding it is a proposed step for the next Fable sitting, never
   something a builder adds.
3. **D0**: the loop writes the public deploy day, with its evidence, into `state/colony/page-view-clock.json` on
   the day the deploy is public (runner 200, clean identifier grep) - and only with the counter live in the
   deployed `site.json`, or its first weeks would read as zeros nobody measured. pcn874 rides the same deploy.
4. **The `/preview/` path**: the reader already excludes it, but no Netlify rewrite serves `/preview/*` yet
   (`netlify.toml`). Until one does, the colony must not open the canonical host in a JavaScript browser at all.

Until 1-3 exist nothing is read, an unmeasured week is a missing reading, never a zero, and no reach or kill gate
runs. A D0 written while 1 or 2 is missing is not waved through: the tick reports the missing part as a blocker
from that day, and at D0+21 the M-instrument fault, which stays until the clock is restarted - adding the key later
backfills the weeks but does not undo it, because a clock without an instrument is a fault, not a pass. Item 4 keeps our own views out; the
reader does not wait for it.

**Not verified.** No real browser has run the page: none can be installed in the build container (the
Playwright download is blocked). The real page and its real module graph ran once under jsdom (28.9.2026):
three files, correct summaries and rows, no network call, no injected markup. The review fixes (size cap, re-pick,
stale runs, reading notes, the neutral clean box) ran only against the tests' fake DOM, not under jsdom or a
browser. A screen reader, keyboard use in a real browser and 200% zoom remain unchecked.

## The AI declaration (every page, since 29.9.2026)

The constitution ("You must never deny what you are") and MISSION rule 4 say a visitor is told who builds this
site. Every page the build ships — each tool page, the accessibility statement, a withheld page's notice and the
404 — carries one line in its site footer (`src/lib/ai-declaration.js`):

> האתר והכלים שבו נבנו ומתוחזקים על ידי סוכני בינה מלאכותית (AI) הפועלים מטעם המותג מהודק.

The home page's FAQ answers "מי בונה ומתחזק את האתר?" with that line, one sentence on figures and the footers'
existing "not tax advice" wording; its FAQPage JSON-LD carries the same text. `pcn874.html`'s "למה הבודק חינמי?",
the one answer that says who runs the site, ends with the line too.

What it does **not** say, because nothing in the repository backs it: that a person reviewed the site or its
results, or that a figure was checked against its source - no record shows such a check, and the source lines say a
figure was compared with search results, or that no check date was recorded. Until the review of 29.9.2026 one page
did imply the second: the notice that replaces a withheld page said its figures were not verified "against the
official source" and linked back to "the tools that are verified". It now says only that the page's data file is
not marked as checked, and links to the home page; a test keeps every shipped page from saying that figures, or
other tools, were verified against the official source. No `author`, `creator` or `publisher` went into the
JSON-LD: those fields take a Person or an Organization, AI agents are neither, and the repository holds no record of
the brand as a registered body to name as one.

The figures sentence names only the figure pages that ship as themselves in that build (`src/lib/source-line.js`
writes their lines): the build rewrites it on the page and in the JSON-LD (`withShippedFiguresSentence`), so with
`vat.json` flipped to unverified the answer names the ceiling and allocation pages only, and with all three withheld
the sentence goes. A withheld page's notice shows no figure and no source line, so the sentence must not name it.

Enforced three ways. `scripts/build-site.js` refuses to publish:
- a page whose site footer lacks the line written exactly as `AI_DECLARATION_HTML` (one class, the marker, the text
  and nothing inside it), or with anything that can hide it (`aiDeclarationProblems` in `src/lib/publish-gate.js`):
  a hidden, inert, aria-hidden, popover or style attribute on it or around it; a wrapper other than html, body, the
  footer and a div (a closed `<details>` folds it away); a screen rule in the shipped stylesheets or an inline
  `<style>` that can hide it or anything around it - display, visibility, opacity, a tiny font or box, transparent
  text, a clip, a transform, an off-screen position. Rules inside `@media print` alone are left out: print hides the
  whole footer, and the printout is the user's document;
- a shipped script, file or inline, that names `ai-declaration` or `site-footer` (`declarationScriptProblems`);
- a figures sentence that names any other set of pages, a `#who-builds` answer or JSON-LD twin that is not
  `whoBuildsAnswer()` of that set, and a named page whose line is not exactly `sourceLineHe()` of its config
  (`figureSourceProblems`). The check is on whenever the `#who-builds` entry or the figures claim is on a page, so
  rewording the answer does not switch it off.

The preview lists all of these. `node scripts/check-html.js` reports a source page without the line.
`tests/ai-declaration.test.js` builds the site and checks every built page, holds the allowlist of claims the text
may make with what backs each one, and holds each bypass the review found as a case the gate must refuse.

The printed PCN874 findings carry the line too, in `#pcn-print-header` (unmarked; the gate keys on the footer):
print hides the site footer, and the findings are the tool's own analysis that goes on to whoever files the report.
A customer's receipt from the invoice generator is the customer's document and carries none.

What the gate cannot see: a script that hides the line without naming it or its footer, and another element drawn
over it. It reads the HTML and CSS as they ship; no browser has rendered the pages.

## Layout

```
index.html  vat.html  osek-patur.html  osek-zair.html  net-salary.html  invoice.html
allocation.html  registrar-fee.html  pcn874.html  accessibility.html  404.html
assets/style.css            shared RTL styles incl. @media print for the receipt
assets/common.js            nav, canonical, optional analytics
assets/page-*.js            DOM glue per page (no logic)
src/lib/*.js                pure ES modules: vat, osek-patur, osek-zair, net-salary, invoice, allocation,
                            registrar-fee, gumroad, license, branding, analytics, money, pro-nudge,
                            pcn874-report, pcn874-share, source-line - and build-time ones that never ship:
                            publish-gate, site-deps, a11y-check, pcn874-bundle, pcn874-rule-reference,
                            pro-offer, ai-declaration
src/vendor/pcn874/*.js      GENERATED: products/pcn874's validator with its types stripped (do not edit)
src/config/*.json           vat.json, osek-patur.json, osek-zair.json, osek-zair-unverified.json,
                            tax-2026.json, allocation-number.json, registrar-fee.json, site.json
tests/*.test.js             vitest (node environment); tests/helpers/ builds in a throwaway copy
scripts/serve.js            zero-dependency local server
scripts/build-site.js       ships only what the shipped pages load, applies the unverified-rate and
                            config gates, runs the accessibility checks, refuses on a publish blocker
scripts/check-html.js       checks title/description/canonical/JSON-LD/links/classes on every page
scripts/bundle-pcn874.js    regenerates src/vendor/pcn874/ from products/pcn874/src (--check: stale?)
scripts/pcn874-rule-reference.js  regenerates the rule reference inside pcn874.html (--check: stale?)
scripts/gumroad-pro-product.js  creates the Pro product on Gumroad (draft, licence-key block), later
                            enables it, and checks the live offer against the page; run only by
                            .github/workflows/gumroad-pro-product.yml and gumroad-pro-probe.yml
netlify.toml robots.txt sitemap.xml
```

## Run locally / test

```bash
cd products/il-biz-tools
npm install          # vitest only
npm test             # 694 tests (vitest, 29 files; re-measured 29.9.2026 after the AI declaration review fixes)
node scripts/bundle-pcn874.js   # after ANY change under products/pcn874/src - the build refuses a stale bundle
node scripts/pcn874-rule-reference.js   # then this: the build refuses a stale rule reference too
npm run check:html   # static page sanity checks + what the publish gate will withhold
node scripts/build-site.js   # writes _site/ exactly as it will be deployed - or refuses (exit 1) on a blocker
node scripts/build-site.js --preview   # the same tree into _preview/, blockers listed, for inspection only
npm run serve        # http://localhost:8080
```

The pages are ES modules (`<script type="module">` + JSON import attributes). Chrome blocks
module scripts on `file://`, so open through `npm run serve` (Firefox and Safari open
`index.html` directly). Any static host serves it as-is.

## Env vars

There are **no server-side env vars** — this is a static site. Public configuration lives in
`src/config/site.json` (all values are safe to publish; never put secret keys there):

| Key | Meaning | Default |
|---|---|---|
| `siteUrl` | Canonical origin; `assets/common.js` rewrites `<link rel=canonical>` from it at runtime. The static canonical in all 9 pages and the JSON-LD `url` in `index.html` are hard-coded, so edit those too, plus `sitemap.xml` and `robots.txt` | `https://il-biz-tools.netlify.app` |
| `gumroad.productUrl` | Full `https://` URL of the Gumroad product page. Empty ⇒ the Pro button is disabled and says the shop is not open. Written by the product-creation job | `""` |
| `gumroad.productId` | Gumroad's public product id — what the licence check sends with the key. Empty ⇒ the button stays disabled (`no_product_id`) and activation sends nothing. Written by the product-creation job | `""` |
| `gumroad.priceCents` / `gumroad.currency` | The price Gumroad itself reports when the job reads the product back (`price` in minor units, `currency`; `7900` / `ils` = ₪79). Shown in the Pro box and injected into the pricing FAQ **only** in the `ready` state; empty ⇒ the button stays disabled (`no_price`). Written by the product-creation job, never by hand | `null` / `""` |
| `analytics.provider` | `none` or `plausible` | `none` (off) |
| `analytics.plausibleDomain` | Plausible site domain | `""` |
| `posthog.projectKey` | PostHog project key (`phc_…`). Empty ⇒ **no snippet at all** | `""` |
| `posthog.apiHost` | PostHog host | `https://eu.i.posthog.com` |
| `posthog.projectId` | The same PostHog project's numeric id, for the colony's weekly page-view reader only (the page never uses it; not a secret). The `POSTHOG_PROJECT_ID` Actions variable overrides it | `""` |

Optional CI variables (never committed): `NETLIFY_AUTH_TOKEN`, `NETLIFY_SITE_ID` for CLI deploys.
No server-side secret is needed by this site at all — the checkout is a link and the licence keys are
Gumroad's; verification needs only the public product id. (`GUMROAD_ACCESS_TOKEN` is a GitHub secret the
product-creation job and the hourly sales sync use; the site never sees it.)

### PostHog page views (optional, cookieless, off by default)

`posthog.projectKey` is empty in the repo and **no account was created**. Filling it in emits an
inline snippet that initialises PostHog with:

| Option | Value | Why |
|---|---|---|
| `cookieless_mode` | `'always'` | PostHog never stores anything in cookies or local/session storage |
| `persistence` | `'memory'` | the same guarantee from the other side, for older SDK builds |
| `autocapture` | `false` | no clicks, no form contents — page views only |
| `capture_pageview` | `true` | the one thing being measured |
| `disable_session_recording` | `true` | no replay of anyone's screen |
| `capture_dead_clicks`, `capture_heatmaps`, `capture_exceptions`, `capture_performance` | `false` | unset, posthog-js takes each from the PostHog project's settings, so a toggle there could start sending element text (on `pcn874.html` a table cell holds bytes of the user's file); pinned off in code |
| `disable_surveys` | `true` | no surveys, whatever the project says |
| `mask_all_text`, `mask_all_element_attributes` | `true` | if any element capture ever ran, no text or attributes |

What it measures: page views per URL, and nothing that identifies a visitor. What it is **for**:
the board gated the paid registrar reminder on *100 weekly views* of `registrar-fee.html`, and this
is how that number gets counted instead of guessed. Option names taken from PostHog's own docs
(retrieved 2026-09-07): `posthog.com/tutorials/cookieless-tracking`, `/docs/libraries/js/persistence`,
`/docs/libraries/js/config`; the pinned-off ones from posthog-js's own `packages/types/src/posthog-config.ts`
and the extensions that read them (retrieved 2026-09-28 through Context7).

🔍 **Unverified, owner-side:** PostHog's cookieless tutorial states that "Cookieless server hash mode"
must be enabled in *Project Settings → Web analytics* first. Nobody here has an account to confirm
what that toggle looks like. Until the key is filled in, none of this runs and no request leaves the
page.

## The Pro tier, and what it honestly is

Pro sells **one** thing: your logo and accent colour on the printed document. The saved
client list, the per-document-type numbering, the PDF export and the stored documents are
free and stay free. An earlier version of this page advertised those free features as Pro
and also promised branding that did not exist; that was fixed rather than shipped, because
charging for something the buyer already has is a scam whatever the price.

**How entitlement works without a server — Option C** (`research/measurements/gumroad-license-decision.md`).
Gumroad mints and emails the key per sale (its `purchase.rb:2144-2171`); no owner action per sale exists.
The buyer pastes the key into the Pro box on `invoice.html`, and the browser sends it, with the public
`gumroad.productId`, in one `POST` to `https://api.gumroad.com/v2/licenses/verify` — a form-encoded CORS
simple request, `credentials: 'omit'`, 8-second timeout. On a yes the page keeps the key, the product id and
the check time in `localStorage` under `ilbiz.license` and discards everything else Gumroad returns (the
buyer's own email, name, price, card display). From then on the cached licence is honoured offline. At most
once every 7 days, in the background, the page asks again with `increment_uses_count=false`, using the
product id the key was activated with, so a later config change cannot orphan an existing buyer.

**Only a definitive answer switches Pro off:** one of Gumroad's three 404 bodies (key disabled, key not
found for this product, access revoked — `licenses_controller.rb:38,86,89`), or a 200 with `success: true`
whose purchase is refunded, chargebacked, disputed and not won, or has a subscription end date. Everything
else — no network, timeout, 429, 5xx, 400, a challenge page, a body that is not JSON, a 200 without
`success: true`, and Gumroad's generic JSON 404 that names no key — is *unknown* and leaves the stored licence
exactly as it was, including its last-check time. A first activation that gets *unknown* is kept as
`pending`, the buyer is told nothing is lost, and the next page load retries it once on its own. A refund
therefore switches Pro off at the next weekly re-check, not instantly; that lag is the price of offline use
and is accepted in the decision.

All of it is in `src/lib/license.js` (`classifyVerifyResponse`, `verifyWithGumroad`, `shouldRecheck`,
`createLicenseController`) and unit-tested with injected `fetch` and a fake `localStorage`; the page glue in
`assets/page-invoice.js` is tested by loading the real page against a fake DOM. A determined user can still
bypass client-side gating by editing JavaScript — that is true of every static site, and it is not a reason
to pretend otherwise. Key sharing is not enforced (no seat count); the seller sees `uses` in Gumroad.

**Setting it up — agent work, not an owner step.** The token the owner already mints at step 3 and pastes at
step 6 carries `edit_products` (Gumroad's `doorkeeper.rb:10`, `oauth_application.rb:121-122`).
`.github/workflows/gumroad-pro-product.yml` (manual dispatch only) uses it to:

1. `create` — reuse the product by exact name (`PRO_PRODUCT_NAME`, "Pro – הלוגו וצבע המותג על המסמך"), or
   `POST /v2/products` **as a draft** with the price (₪79 by default), a description of exactly what Pro is (its
   last paragraph is the site's AI declaration, the `AI_DECLARATION` constant itself), and content holding Hebrew
   activation instructions plus Gumroad's `licenseKey` block; read it back and require that block and one fixed
   one-time price (no membership or tiers, no pay-what-you-want, no purchasing-power-parity prices, no option that
   changes the charge); read the refund period in force (`GET /v2/refund_policy` and the product's own block);
   print the public `id` and `short_url`; open a PR writing both, the read-back `priceCents` and `currency`, and
   `refundPeriodDays` (the days Gumroad applies, or `null` when unreadable or not a bounded period) into
   `src/config/site.json`. With `--fine-print docs/refund-fine-print.he.txt` it also says what it would write as the
   refund policy's fine print - or why it cannot be written yet, still exit 0 - and with `--apply` writes it (see
   "Refunds"); a write that stops fails the run only after site.json is written, and the workflow's PR step runs on
   `!cancelled()`, so the productId PR opens either way.
2. `enable` — a second dispatch, only once `state/colony/brand-mail.json` shows the brand mailbox of owner step 8
   probed green (within 2 days, no accessibility mail unanswered for 7+ days — a buyer's receipt reply or refund
   request goes to the Gumroad sign-up email, and the owner answers no one), that same probe lists the refund
   responder (`"responders": ["gumroad-refund"]`; a probe without the key is a no), **and** the offer checks out
   (`check`, next): `PUT /v2/products/:id/enable`. `create` is not gated.
3. `check` — reads only; run by `enable` first and by `gumroad-pro-probe.yml` afterwards. The **deployed**
   `src/config/site.json` carries the repo's id and price; Gumroad charges exactly that price, once; the account's
   own address (`GET /v2/user`) is the `BRAND_MAIL_ADDRESS` secret of step 8 (compared, never printed) and its
   `name` is the brand's, "Mehudak" (`GUMROAD_ACCOUNT_NAME`; it prints on receipts; compared, never printed); the
   refund policy buyers will see is a bounded window of at least 14 days (`MIN_REFUND_DAYS`); the deployed
   `refundPeriodDays` is exactly that window, compared as the price is; and that policy's fine print is the
   committed text. See "Refunds", below.
4. `refund --email <addr> [--requested-at <iso>] [--apply]` — what the brand-mail responder calls. See "Refunds".

Without the secret `create`, `enable` and `check` exit 0 with a notice; `refund` exits 1, because nothing was
refunded and the responder must not answer as if it had been. `.github/workflows/gumroad-pro-probe.yml` then checks the real
product id from the site's own origin (expects the exact "does not exist" 404 for an impossible key and
`access-control-allow-origin: *`) and runs `check`, so a price edited in the Gumroad dashboard after `enable`
fails the probe. Tax: Gumroad collects none for a buyer in Israel (`lib/utilities/compliance/countries.rb`, read
29.9.2026), so an Israeli buyer pays the price the page shows; a buyer abroad may see VAT/GST added at checkout. 🔍 **Not yet rendered:** Gumroad's help FAQ says products cannot be created
through the API while its code says they can; the first `create` run settles it. If Gumroad refuses, the job
stops and the fallback — one dashboard click, *Insert → License key* — is raised with the owner **before**
anything is sold, never added to his checklist silently.

**First real key verified: not yet — the first sale is the test.** No Pro product exists on Gumroad yet, so
no real key has ever reached `verify` from a browser. What is measured: CORS on preflight and POST
through Cloudflare, and the exact 404 body for a key that does not exist (runner probe, 25.9). What is only
read in Gumroad's code: that a real key returns the documented 200 payload with those flags. This line
changes only when a `gumroad:<productId>` sale is in `revenue_ledger` and the buyer-side outcome is noted in
the decision file. Until then Pro may be described as on sale — once it is — and as nothing more.

**The Pro button has exactly five states**, all decided in `src/lib/gumroad.js` (`proButtonState`)
and unit-tested rather than trusted. Only `ready` shows a price:

| `gumroad.productUrl` | `gumroad.productId` | `priceCents` + `currency` | state | button |
|---|---|---|---|---|
| empty | anything | anything | `unconfigured` | disabled, "בקרוב", "המיתוג עדיין לא נמכר – החנות טרם נפתחה" |
| not an `https://` URL | anything | anything | `invalid_url` | disabled, and it says the URL is malformed |
| set | missing | anything | `no_product_id` | disabled — a licence key nothing can check against its product is nothing |
| set | set | missing | `no_price` | disabled — no sale without the price Gumroad reported, visible beside the button |
| set | set | set | `ready` | the price, "לרכישה ב-Gumroad", "המכירה ב-Gumroad, בחנות Mehudak (מהודק)"; opens the product page in a new tab (`noopener`) |

**The offer on the page** (research/tiktok/08-sales-marketing-lessons.md §8.1 N1–N5), each part tested:
the Pro box heading is the product name; "תשלום חד-פעמי, בלי מנוי" and one trust line sit in plain sight beside the
button; in the `ready` state a visitor without a licence can **try** the logo and colour on the on-screen preview
(`applyBranding(…, 'trial')` — only an `@media screen` rule reads the trial colour and print hides the logo, so a
printed or saved PDF is exactly the free document, with no watermark); after a print dialog in that try-out one
factual line says a print or PDF comes out without the branding and what Pro costs - never that anything was
printed, since `afterprint` also fires on a cancelled dialog - once per session and never again once closed
(`src/lib/pro-nudge.js`; no modal, no timer); and `#pro-faq` answers seven pricing questions, each checked against
the code in `tests/pro-faq.test.js`. The price in those answers is a slot the build fills from `site.json`
(`src/lib/pro-offer.js`), in the visible answer and its JSON-LD twin alike, and only in the `ready` state. The
answers that describe a live sale (`<details data-pro-sale>`: what happens after paying, who sells it, whether a
refund is possible, and the home page's "how much") are dropped from the built page, with their JSON-LD twins,
until the button is `ready`: before that the Pro box says nothing is sold yet. The refund answer is dropped too
while `refundPeriodDays` is not a number.

**Refunds** (`research/channel-loop/RULING-2026-09-29-lines.md` (h)). There is no "no refunds" policy. Gumroad
opens every account with a 30-day money-back guarantee (`RefundPolicy::DEFAULT_REFUND_PERIOD_IN_DAYS`) and that
default is kept as it stands, so no policy call is needed. `enable` and `check` refuse unless the period in force
— the product's own policy, or the account's when the product inherits it and Gumroad reports it in effect — is a
bounded window of **at least 14 days** (`MIN_REFUND_DAYS`): "none" and 7 days are refused, and so is a policy that
cannot be read. 14 is the floor because it is the option lawful under both readings of the consumer-protection law
the repository holds (secondary sources only; the primary text of חוק הגנת הצרכן 14ג(ד) is the one check still to
render); no cancellation fee is charged. The page names Gumroad's policy and no law: the seventh `#pro-faq` entry,
"אפשר לקבל החזר?", answers "החזר כספי בתוך {n} ימים מהרכישה, במטבע שבו חויבתם, לפי מדיניות ההחזרים של Gumroad:
משיבים למייל הקבלה מ-Gumroad, או כותבים לנו בקישור ביטול עסקה (Pro). מדיניות מלאה בדף המוצר ב-Gumroad." — `{n}` is
`refundPeriodDays`, filled by the build (`withRefundDays`) in the answer and its JSON-LD twin, and the entry ships
only while the button is `ready` and the period is a number.

**The cancellation link and the fine print** (`research/channel-loop/RULING-2026-09-30-documents.md` (b), fold
actions 4(c) and 7). The home page footer carries a dedicated link, "ביטול עסקה (Pro)" — a `mailto:` with the subject
"ביטול עסקה – Pro" — and one paragraph beside it: cancel through that link or by replying to the Gumroad receipt,
give name and ID number, and a cancellation inside the refund period gets a full refund through Gumroad in the
currency charged. The refund answer above links it too. No address is typed into a page: the build fills every
`<a data-cancel-link>` from the accessibility statement's own `mailto:` contact (`withCancelLinks`,
`src/lib/publish-gate.js`), the one brand address the site already publishes, without its `+tag` (`bareAddress`):
the statement's contact is meant to be `<brand>+accessibility@…`, and `scripts/brand_mail.py` reads mail to a
`+accessibility`/`+a11y` address as accessibility mail that the refund responder never answers. In the source the
link carries `data-publish-blocker="cancel-link"`, so the publish gate refuses it while the statement's contact is a
placeholder, and `cancelLinkProblems` refuses any link that is not exactly that bare address and subject, a link with
a `+tag`, or a home page without one in its footer - deleting the marker clears nothing. The same
Hebrew, with the site's URL, is the refund policy's fine print, which Gumroad shows under the policy's title on the
receipt and the product page: `docs/refund-fine-print.he.txt`, written by `create --fine-print … --apply`
(`PUT /v2/refund_policy` with the period already in force; `gumroad-pro-product.yml`, `write_fine_print`) and
compared by `check`.

Requests are answered by the brand-mail responder, never by the owner: `python3 scripts/brand_mail.py
respond-refunds` (run by `.github/workflows/brand-mail.yml`, scheduled with the probe; inert until step 8's secrets
exist, and reads no mail while `site.json` has no `productId`, since nothing can have been sold) reads the brand
mailbox, acts only on mail whose own receiving server's `Authentication-Results` show DKIM or SPF passing for the
sender's From domain, never on mail in a venue question's thread, and only when the sender's own words (subject, or
body above the quoted receipt) ask for a refund, the money back or the cancellation of the purchase — whole words
and phrases, never a bare verb such as "לבטל" or "להחזיר", and not a tax, expense or customer refund the buyer's
own bookkeeping names; it calls `refund --email <sender> --requested-at <received>` and
answers with one fixed sentence that does not say whether the address bought anything. `refund` reads
`GET /v2/sales?email=&product_id=`, keeps only sales of this product whose buyer address is exactly the sender,
not already refunded, charged back or disputed, and inside the window in force measured at the request, and
refunds the most recent one in full (`PUT /v2/sales/:id/refund`, no amount) — one sale per request, never the
same sale twice. It is a dry run unless `--apply`; the scheduled run applies, a manual dispatch is a dry run
unless ticked. It logs sale ids and counts, never an address; Gumroad's refund endpoint answers with the sale and
no separate refund id (`api/v2/sales_controller.rb#refund`, read 29.9.2026; not yet run). A refunded key switches
Pro off at its next weekly re-check (above). **Kill rule:** if Pro is disabled or the line is killed, the responder
keeps running for `refundPeriodDays + 7` days after the last sale, so every buyer inside the window is still
answered. **The balance** (RULING-2026-09-30-documents (d); where it waits, RULING-2026-10-05-refund-state): Gumroad
refuses a refund the unpaid balance cannot cover ("Your balance is insufficient to process this refund.",
`refundable.rb:99-100`), so the first refund on a new account waits for more sales. `refund` exits 3 on that refusal
alone and names the sale; the responder then sends one holding reply (facts only, no date) and marks the request
`\Answered` and `\Flagged` in one IMAP command: the request itself, flagged in the brand mailbox, is the waiting
state. Nothing about the buyer is written to a file or committed, no sale id is printed (the responder redacts them),
and its job holds `contents: read` only. A second request for a sale already waiting is marked answered, with no
second holding reply and no second flag. At the start of every run the responder searches the flagged requests, with
no date bound - flagged and answered, since it sets the flag only together with `\Answered`: a star a person puts on
mail nobody has answered yet is not a waiting request, and it comes off when that request is answered for good - and
runs the first lookup again: `refund --email <the sender> --requested-at <the request's receipt
time>`. When nothing is eligible any more but the most recent sale of this product to that address inside the window
is wholly refunded, `refund` says `already-refunded`. Only a refund that happened (`refunded`, or
`already-refunded`) answers, with the usual reply in the request's thread, once per sender per run, and takes the
flag off; the balance again waits quietly; anything else - `none`, a stop - keeps the flag and fails the run for a
session to look at, because the holding reply said the refund will be issued. A request deleted from the mailbox
loses its waiting state, so flagged brand mail is left alone. The first real refund is still the recorded check.

No Gumroad code runs on this site: no SDK, no overlay, no iframe. The only contact is one `fetch` from the
buyer's browser to `api.gumroad.com/v2/licenses/verify`, at activation and at most every 7 days after. The
button is a link, which is why removing Paddle made the CSP **smaller** (`frame-src 'none'`, no
`cdn.paddle.com`); the licence check added exactly one `connect-src` entry, `https://api.gumroad.com`.

What the buyer is told, verbatim, sits in the Pro box: one line beside the key input ("מפתח הרישיון נבדק מול
Gumroad פעם אחת בהפעלה, ואחר כך לכל היותר פעם בשבוע.") and the full "מה נשלח לאן" text in a `<details>`
(decision §6). The home-page FAQ and the invoice FAQ carry the same exception.

**What Pro must never claim.** One thing only: your logo and accent colour on the printed document.
The saved client list, the numbering, the PDF export and the stored documents are free and stay free
— the index-page FAQ that still described them as Pro was corrected in this change.

## Deploy (Netlify, exact steps)

1. In Netlify, open the existing site `il-biz-tools` (site id `2087c2ed-5270-4407-8746-675d6ea41d5e`) → build & deploy settings → *Link repository* → `automaton`, branch `main`. Only if that site is gone: *Add new site → Import an existing project* (owner step 6 in `docs/OWNER_STEPS.he.md`).
2. Base directory: `products/il-biz-tools`. Build command: `node scripts/build-site.js`. Publish directory: `_site` (written by `scripts/build-site.js` with only the files the shipped pages load, so `package.json`, `README.md`, `tests/`, `scripts/` and any unverified config are never uploaded). **Today this build refuses** — the accessibility contact is still a placeholder — so a deploy fails until that blocker is cleared.
   (`netlify.toml` declares the build command and the publish directory, not the base directory, which is set here in the UI; headers/CSP/redirects are in the same file).
3. Deploy. Then set the custom domain and replace `https://il-biz-tools.netlify.app` with the real domain in
   `siteUrl` (`src/config/site.json`), the static `<link rel="canonical">` of all 9 pages, the JSON-LD `url` in
   `index.html`, `sitemap.xml` and `robots.txt`; commit. If the Pro product already exists on Gumroad, its
   description and activation text name the old `invoice.html` URL too (`scripts/gumroad-pro-product.js` writes
   them at creation and does not update a reused product), so they need the same edit on Gumroad's side.
4. Submit `https://<domain>/sitemap.xml` in Google Search Console.

CLI alternative, from `products/il-biz-tools`: `node scripts/build-site.js && npx netlify-cli deploy --dir=_site --prod`
(needs `NETLIFY_AUTH_TOKEN` + `NETLIFY_SITE_ID`). Any other static host (Cloudflare Pages,
GitHub Pages, Vercel) works too — copy the headers from `netlify.toml` if the host supports them.

## One-time steps only the owner can do

1. **Gumroad** (merchant of record; this is owner step 3 in `docs/OWNER_STEPS.he.md` — the Paddle
   account was never opened and is not on the list): sign up with the brand name as the store name,
   complete payout and identity details, and mint the access token (`GUMROAD_ACCESS_TOKEN`, pasted into
   GitHub secrets at step 6). Creating the Pro product and pasting its URL into `gumroad.productUrl` are not part of that step. Until both the URL and the product id exist (both written into site.json by the product-creation job), the Pro box stays on **בקרוב** and nothing can be bought.
   Nothing happens per sale: Gumroad mints and emails each buyer's key itself.
   Fallbacks if Gumroad refuses: PayPal Business "buy now" link or Payoneer Checkout. Swapping the one
   `openProCheckout` call in `assets/page-invoice.js` is not enough: the button is enabled only by
   `proButtonState` in `src/lib/gumroad.js` (a `gumroad.productUrl` plus a `gumroad.productId`), the licence
   keys themselves are Gumroad's (another rail needs another licence mechanism), and the buyer-facing
   notes in `gumroad.js`, `license.js`, `page-invoice.js` and `invoice.html` name Gumroad.
2. **Domain** (owner step 5 in `docs/OWNER_STEPS.he.md`): buy one `.com` with WHOIS privacy and configure nothing;
   the DNS records come from the agent. **Netlify** (owner step 6): the account and the `il-biz-tools` site already
   exist; what is left is *Link repository*. The free `*.netlify.app` subdomain is not a substitute: without a
   domain no line that depends on search exists (`src/revenue/owner-steps.ts`).
3. **Google Search Console** — optional, not a checklist step (`research/colony-sweep/BOARD.md` §6.3, §8): only if
   the owner chooses to add the property in their own Google account, and asked for only after the site shows traffic.
4. Not an owner step: analytics. The board assigned page views to the PostHog connector attached to the agent's session (`research/colony-sweep/BOARD.md` §6.3), so the project key, the project id and the cookieless server-hash toggle are ours to set; `posthog.projectKey` and `posthog.projectId` stay empty until then, and Plausible is not planned. The one open question is the colony reader's `POSTHOG_READ_KEY` secret: pasting a secret into the repository needs a repository admin, and it is not on the owner's list — see "Page views" under the pcn874 section; whether to add it is for the next Fable sitting.
5. Tax: income from the site is business income — an Israeli osek patur/murshe registration is
   the owner's responsibility (Gumroad invoices the buyer, the owner reports Gumroad payouts).
6. Not an owner step (`docs/OWNER_STEPS.he.md` step 3: "זה אצלי, לא אצלך"): `net-salary.html` stays
   unpublished until the 2026 brackets and NI rates in `tax-2026.json` are confirmed against two independent
   GitHub-hosted implementations and `verified` flips to true (`research/colony-sweep/BOARD.md` §2 build #4, §7.1).
7. Not an owner step either (`docs/OWNER_STEPS.he.md` has none): before any shekel amount appears on
   `registrar-fee.html`, a human or an unblocked agent (the research's own wording,
   `research/colony-sweep/groups/israel-bureaucracy.md`) opens the primary source
   (תקנות החברות (אגרות) / רשות התאגידים), corrects the amounts in `registrar-fee.json`, and sets both
   `verified` and `renderAmounts` to true.

## Constitution notes
Honest value only: every figure is sourced, unverified ones are labelled אומדן in the UI, and — since
this change — a page whose figures are unverified is not published at all.
No personal data is collected by this site; receipts and clients stay in the visitor's `localStorage`. The one
request that leaves the page is the Pro licence check, from the buyer's browser to Gumroad, disclosed in the Pro box. The
registrar reminder form ships **disabled** and posts nowhere: no address is collected for a service
that does not exist, and the §30א(ג) and Amendment 13 copy is written and flagged for legal review
before it ever does.
No scraping, no third-party ToS involved beyond Gumroad and the optional analytics opt-ins.
Never deny what it is: every page says in its footer that AI agents build and keep the site for the brand
(see [The AI declaration](#the-ai-declaration-every-page-since-2992026)), and the build refuses a page that does not.

---

## עברית — מה יש כאן

אתר סטטי בעברית (RTL) לעצמאים ולעסקים קטנים בישראל, בלי שרת (ה-build רק מעתיק קבצים ל-`_site/`):

- **מחשבון מע"מ** – 18%, ניתן לשינוי ב-`src/config/vat.json`.
- **מעקב תקרת עוסק פטור 2026** – 122,833 ₪, רצועת אזהרה ב-85%, תחזית שנתית, שמירה מקומית.
- **אומדן שכר נטו** – מדרגות המס 2026 (לאחר ריווח המדרגות), נקודות זיכוי 242 ₪, ביטוח לאומי
  ומס בריאות לפי המדרגה המופחתת (7,703 ₪) והתקרה (51,910 ₪). מסומן **אומדן** עד לאימות מול
  לוח העזר של רשות המסים.
- **מחולל קבלות / חשבוניות עסקה** – מסמך נקי להדפסה או ל-PDF (`@media print`), כולל הערת
  "עוסק פטור - לא חייב במע"מ", מספור רץ, שמירה ב-localStorage. שמירת הלקוחות, המספור והייצוא
  חינמיים. התוספת היחידה בתשלום היא **Pro – הלוגו וצבע המותג על המסמך**, דרך Gumroad (החנות Mehudak):
  רק כשיש `gumroad.productUrl`, `gumroad.productId` והמחיר ש-Gumroad החזירה, מוצג המחיר והכפתור פותח את דף
  המוצר; אחרת מוצג "בקרוב" ובלי מחיר. מפתח הרישיון
  הוא של Gumroad עצמה: היא מייצרת אותו לכל קונה ושולחת בקבלה, והדפדפן של הקונה בודק אותו מולה פעם אחת
  בהפעלה ואחר כך לכל היותר פעם בשבוע. אין לבעלים שום פעולה אחרי מכירה. מפתח אמיתי ראשון עוד לא אומת –
  המכירה הראשונה היא הבדיקה.
- **בודק מספר הקצאה** – לפי סכום, תאריך וסוג הלקוח.
- **אגרה שנתית לרשם החברות** – מחשבון מועדים: מתי נסגר חלון התעריף המוזל (31 במרץ) ומתי מתחיל
  התעריף המלא (1 באפריל). **בלי סכומים**: שיעורי האגרה לא אומתו מול מקור ראשוני, ולכן הדף אומר
  לבדוק אותם ברשות התאגידים במקום להדפיס מספר. טופס התזכורת מוצג סגור עד שהדף יגיע ל-100 צפיות
  בשבוע, וכולל נוסח גילוי לפי סעיף 30א(ג) ונוסח שמירת מידע לפי תיקון 13 – שניהם טיוטה שטרם נבדקה
  משפטית.
- **בודק קובץ PCN874** (`pcn874.html`, של קו ההכנסה `pcn874`) – בדיקת מבנה לקובץ הדוח המפורט למע"מ, בדפדפן
  ובלי העלאה, עם ממצאים לפי שורה והכלל שנכשל בעברית. בודק מבנה בלבד: אינו מצליב סכומים ואינו מחשב את הסכום
  המדווח, ומפנה לסימולטור של רשות המסים. הקוד הוא הבודק של `products/pcn874` עצמו, וה-build מסרב לפרסם עותק
  שאינו תואם למקור. אין בדף מחיר ואין קישור קנייה. אחרי בדיקה אפשר להדפיס או לשמור כ-PDF את הממצאים (עם שם
  הקובץ, תאריך הבדיקה ו"אינו ייעוץ מס"), ובדפדפן שתומך בכך – לשתף סיכום שמכיל רק את מספר השגיאות והאזהרות ואת
  שמות הכללים, בלי שום ערך מתוך הקובץ. בתחתית הדף רשימת כל הכללים, שנוצרת מטבלת הכללים של הבודק עצמו.

**שער הפרסום:** דף שמציג נתון מקובץ שמסומן `"verified": false` לא מתפרסם בכלל. כרגע זה
`net-salary.html`: במקומו עולה הודעה קצרה בלי אף מספר, והכתובת יורדת מה-sitemap. ברגע שהמדרגות
יאומתו מול לוח העזר של רשות המסים – היפוך דגל אחד מחזיר את הדף. גם קובצי הנתונים עצמם לא עולים
לאתר כמו שהם: ה-build מעתיק רק קבצים שדף מתפרסם באמת טוען, ו-`tax-2026.json` לא ביניהם. מ-`registrar-fee.json`
עולים רק התאריכים ושני הדגלים – בלי אף סכום.

**הצהרת נגישות – חוסם פתוח:** `accessibility.html` אומרת רק מה שנכון: האתר לא עבר בדיקה מלאה לפי ת"י 5568,
ומה כן נבדק (13 בדיקות אוטומטיות על קוד הדפים, 27.9.2026), מה תוקן (שלושה צבעים הוכהו, כותרות בדף הבית) ומה
לא נבדק. בהצהרה חסרה דרך פנייה בנושא נגישות: אין עדיין תיבת דואר של המותג, ופרטים אישיים של הבעלים לא יופיעו
באתר לעולם. לכן השורה מסומנת כממלא מקום, וה-build מסרב לבנות את `_site/` כל עוד היא שם. מחיקת הסימון לבדה
לא משחררת את השער: הוא מסרב גם כשמילות ממלא המקום נשארות בדף, וגם כשאין בהצהרה קישור פנייה אמיתי וגלוי
(`<a data-a11y-contact href="mailto:…">` או `https:` או `tel:`, בדומיין ציבורי ולא בדומיין דוגמה).

**הצהרת AI בכל דף (29.9.2026):** בתחתית כל דף שעולה לאתר – גם בהודעה של דף מושהה וגם בדף 404 – כתוב: "האתר והכלים
שבו נבנו ומתוחזקים על ידי סוכני בינה מלאכותית (AI) הפועלים מטעם המותג מהודק." בשאלות הנפוצות בדף הבית יש גם תשובה
מלאה ל"מי בונה ומתחזק את האתר?". ההצהרה לא טוענת שאדם בדק משהו ולא שנתון נבדק מול המקור שלו – אין לכך תיעוד. ה-build
מסרב לפרסם דף בלי השורה, וגם דף שבו היא כתובה אחרת או שמשהו יכול להסתיר אותה: מאפיין, עטיפה (כמו `<details>` סגור),
כלל CSS שחל עליה או על מה שסביבה, או סקריפט שנוגע בה. משפט הנתונים בתשובה נכתב בכל build רק על דפי הנתונים שעולים
כמו שהם – דף מושהה יוצא ממנו – וכל שורת מקור חייבת להיות בדיוק מה שקובץ הנתונים שלה נותן. ההודעה שעולה במקום דף
מושהה אומרת רק שקובץ הנתונים שלו אינו מסומן כנבדק ומקשרת לדף הבית (עד 29.9 היא אמרה "לא אומתו מול המקור הרשמי"
וקישרה ל"כלים שכן מאומתים", כלומר רמזה ששאר הכלים אומתו מול המקור הרשמי). גם הדפסת ממצאי PCN874 נושאת את השורה.
הבדיקה `tests/ai-declaration.test.js` מחזיקה את רשימת הטענות המותרות ואת כל דרך העקיפה שנמצאה בסקירה.

**צעדים שרק הבעלים יכול לבצע:** פתיחת חנות Gumroad על שם המותג (KYC + פרטי משיכה) והטוקן שלה,
חשבון Netlify ודומיין, אימות ב-Google Search Console. יצירת מוצר ה-Pro והדבקת הכתובת והמזהה שלו
ב-`site.json` הן עבודה שלי, דרך אותו טוקן (`.github/workflows/gumroad-pro-product.yml`).

**בדיקות:** `npm install && npm test` (694 בדיקות ב-29 קבצים, vitest, 29.9.2026). **הרצה מקומית:** `npm run serve`.
