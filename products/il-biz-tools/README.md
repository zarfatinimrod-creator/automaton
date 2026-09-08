# il-biz-tools — כלים לעסק

A static, dependency-free, Hebrew (RTL) micro-site with six tools for Israeli freelancers and
small businesses. No framework, no dependencies at runtime: the build only copies files, and
the deploy artifact is `_site/`.

## What it sells, to whom

| Tool | Page | Free | Pro (paid) |
|---|---|---|---|
| VAT calculator (מחשבון מע"מ) | `vat.html` | yes | — |
| Osek patur ceiling tracker (מעקב תקרת עוסק פטור) | `osek-patur.html` | yes | — |
| Net salary estimator (אומדן שכר נטו) | `net-salary.html` | yes | — |
| Receipt / invoice generator (קבלה / חשבונית עסקה) | `invoice.html` | print / PDF, local save, saved client list, per-type auto numbering | document branding: your logo and accent colour |
| Allocation-number check (מספר הקצאה) | `allocation.html` | yes | — |
| Companies-Registrar annual fee (אגרה שנתית לרשם החברות) | `registrar-fee.html` | deadline calculator; **no shekel amounts** — see the gate below | — |

Audience: the ~600k Israeli self-employed, especially **עוסקים פטורים** (freelancers under the
VAT threshold) who need a receipt today and want to know when they will cross the ceiling.
Traffic model: Hebrew SEO (each page has a title, description, canonical, and a FAQPage JSON-LD
answering the exact questions people search), plus sharing in freelancer Facebook/WhatsApp groups.

### Pricing suggestion
- Free tools: free forever (they are the SEO funnel).
- **Pro (document branding): one-time ₪79** through **Gumroad**, which replaced Paddle here.
  Gumroad is the merchant of record, sells in ILS (the one payment rail this repo has rendered
  evidence for), and needs no liveness video to open — the Paddle onboarding step that collides
  with the mandate. Stripe is not available to an Israeli individual; PayPal Business and Payoneer
  Checkout remain the fallbacks.
- Gumroad's rules allow a downloadable/licence product, which is exactly what Pro is: a file-free
  licence key that unlocks branding in the buyer's own browser. It is not an AI service and must
  never be sold as one.

## Verified figures and sources (September 2026)

| Figure | Value in config | Status | Source |
|---|---|---|---|
| VAT rate | 18% (`src/config/vat.json`) | verified | [ynet – taxes 2026](https://www.ynet.co.il/economy/article/yokra14629288), [mako](https://www.mako.co.il/finances-news/Article-f27f6c987b8fa91027.htm) |
| Osek patur ceiling 2026 | ₪122,833 (`src/config/osek-patur.json`) | verified | [Kol Zchut](https://www.kolzchut.org.il/he/עוסק_פטור), [Bizportal](https://www.bizportal.co.il/guides/news/article/20039167) |
| Income-tax monthly brackets 2026 | 10% ≤7,010; 14% ≤10,060; 20% ≤19,000; 31% ≤25,100; 35% ≤46,690; 47% ≤60,130; 50% above (`src/config/tax-2026.json`) | **estimate (אומדן)** — widened brackets approved 30.3.2026, retroactive to 1.1.2026; verify against the Tax Authority booklet | [N12/mako](https://www.mako.co.il/news-money/calculators/Article-54d2f6451f9ff91027.htm), [Tax Authority monthly deductions booklet 2026 (PDF)](https://www.gov.il/BlobFolder/generalpage/income-tax-monthly-deductions-booklet/he/generalInformation_income-tax-monthly-deductions-booklet_monthly-deductions-booklet-2026.pdf), [Knesset research (PDF)](https://fs.knesset.gov.il/globaldocs/MMM/a4622f6b-9905-f111-a13e-005056aa7c52/2_a4622f6b-9905-f111-a13e-005056aa7c52_11_21431.pdf) |
| Credit point value | ₪242/month (frozen 2025–2027) | estimate | [mako](https://www.mako.co.il/news-money/calculators/Article-54d2f6451f9ff91027.htm), [msl.org.il](https://msl.org.il/מחקר/מדרגות-מס/) |
| Surtax (מס יסף) | 3% above ₪721,560/yr — **not modelled** | n/a | same |
| Bituach Leumi reduced tier | up to ₪7,703/month: 1.04% NI + 3.23% health | estimate | [Kol Zchut – employee NI](https://www.kolzchut.org.il/he/דמי_ביטוח_לאומי_לעובד_שכיר), [BTL health rates](https://www.btl.gov.il/Insurance/Health_Insurance/Pages/שיעורי%20דמי%20ביטוח%20בריאות.aspx), [Malam 2026 updates](https://www.malam-payroll.com/national-insurance-updates-for-2026/) |
| Bituach Leumi full tier | ₪7,703–₪51,910: 7% NI + 5.17% health | estimate | same |
| Allocation-number thresholds | ₪25,000 → ₪20,000 → ₪10,000 → ₪5,000 from 1.6.2026 (`src/config/allocation-number.json`) | verified | Chamber of Commerce, Grant Thornton IL, Green Invoice, iCount |
| Companies-Registrar annual fee (reduced / full) | `1338` / `1777` held in `src/config/registrar-fee.json` and **never rendered** | **unverified — not published** | six independent accountancy circulars (Stark, YFCPA, PKF Amit Halfon, Gabbay & Shlafman, Brit Pikuach, Erlich) as quoted in `research/colony-sweep/audits/israel-bureaucracy.md` §2.2 and `groups/israel-bureaucracy.md`. No primary source (תקנות החברות (אגרות) / רשות התאגידים) was ever opened |
| Registrar reduced-rate window (through 31 March; full rate from 1 April) | `deadline` in `src/config/registrar-fee.json` | unverified against a primary source, **rendered anyway, labelled** | same six circulars |

Not modelled in net salary: surtax, pension tax credit, special credit points (children, degree,
army), benefits in kind, study fund.

## The unverified-rate gate (why `net-salary.html` is not on the public site)

MISSION rule 4 — never publish an unverified legal figure — used to be kept by hand: `tax-2026.json`
says `"verified": false`, the page wears an **אומדן** badge, and everyone hoped the badge was enough.
It is not, so the rule is now enforced by the build.

`src/lib/publish-gate.js` maps every page to the config files whose **figures it renders**.
`node scripts/build-site.js` reads those configs and, for any page depending on one that is not
flagged `"verified": true`:

- the real page is **not copied** into `_site/`;
- a short notice ships at the same URL instead — a "לא מאומת" banner, an explanation, `noindex`,
  and not one figure of any kind;
- the URL is dropped from the `sitemap.xml` that ships.

Nothing in the source tree moves, so `npm run serve`, the tests and local development still see the
real page; the day the rates are confirmed against the Tax Authority booklet, flipping one JSON flag
republishes it. `node scripts/check-html.js` prints the same verdict, and **fails** if an HTML page
is missing from the map — a page nobody classified is a page nobody decided about.

Today the gate withholds exactly one page: `net-salary.html`. Nothing here marks anything verified.

`registrar-fee.html` takes the other route the gate allows. Its config *is* unverified, so the page
renders **no shekel amount at all**: `feeAmountDisclosure()` in `src/lib/registrar-fee.js` refuses to
hand the amounts out while `verified` is false, the page tells the reader to check the amount at
רשות התאגידים, and a test asserts the shipped HTML contains neither figure. What it does render is
the *rule* and the *calendar* — which carry the same evidence grade, are labelled as such on the
page, and differ in what a mistake costs: a wrong date sends someone to check early, a wrong amount
is a number they act on.

## The registrar annual-fee page (`registrar-fee.html`)

What it answers: *when* the reduced-rate window for the Companies Registrar annual fee closes.
Given a date it returns this year's 31 March deadline, the 1 April switch to the full rate, and —
once that has passed — the next window and the days to it. Pure calendar arithmetic in
`src/lib/registrar-fee.js`, no registry lookup, no company data.

What it refuses to answer: **how much the fee is.** The repo's research corroborated ₪1,338 reduced
and ₪1,777 from 1.4.2026 across six independent accountancy circulars, and the same research file
states that not one primary Israeli legal or government source was ever opened — "enough to decide
where to build, not enough to publish to users as guidance". So the amounts stay in
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

## Layout

```
index.html  vat.html  osek-patur.html  net-salary.html  invoice.html
allocation.html  registrar-fee.html  404.html
assets/style.css            shared RTL styles incl. @media print for the receipt
assets/common.js            nav, canonical, optional analytics
assets/page-*.js            DOM glue per page (no logic)
src/lib/*.js                pure ES modules: vat, osek-patur, net-salary, invoice, allocation,
                            registrar-fee, gumroad, license, branding, analytics, publish-gate, money
src/config/*.json           vat.json, osek-patur.json, tax-2026.json, allocation-number.json,
                            registrar-fee.json, site.json
tests/*.test.js             vitest (node environment)
scripts/serve.js            zero-dependency local server
scripts/build-site.js       copies the allowlist into _site/ and applies the unverified-rate gate
scripts/check-html.js       checks title/description/canonical/JSON-LD/links/classes on every page
netlify.toml robots.txt sitemap.xml
```

## Run locally / test

```bash
cd products/il-biz-tools
npm install          # vitest only
npm test             # 120 unit tests
npm run check:html   # static page sanity checks + what the publish gate will withhold
node scripts/build-site.js   # writes _site/ exactly as it will be deployed
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
| `siteUrl` | Canonical origin, used for `<link rel=canonical>`; also edit `sitemap.xml` and `robots.txt` | `https://il-biz-tools.netlify.app` |
| `gumroad.productUrl` | Full `https://` URL of the Gumroad product page. Empty ⇒ the Pro button is disabled and says the shop is not open | `""` |
| `analytics.provider` | `none` or `plausible` | `none` (off) |
| `analytics.plausibleDomain` | Plausible site domain | `""` |
| `posthog.projectKey` | PostHog project key (`phc_…`). Empty ⇒ **no snippet at all** | `""` |
| `posthog.apiHost` | PostHog host | `https://eu.i.posthog.com` |
| `pro.publicKey` | Licence-verification public key, written by `make-license.js init` | `null` |

Optional CI variables (never committed): `NETLIFY_AUTH_TOKEN`, `NETLIFY_SITE_ID` for CLI deploys.
No server-side secret is needed by this site at all — the Gumroad checkout is a link, and the
licence signing key never leaves the owner's machine.

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

What it measures: page views per URL, and nothing that identifies a visitor. What it is **for**:
the board gated the paid registrar reminder on *100 weekly views* of `registrar-fee.html`, and this
is how that number gets counted instead of guessed. Option names taken from PostHog's own docs
(retrieved 2026-09-07): `posthog.com/tutorials/cookieless-tracking`, `/docs/libraries/js/persistence`,
`/docs/libraries/js/config`.

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

**How entitlement works without a server.** The site is static, so there is nobody to ask
"did this person pay?". Pro is unlocked by a licence key: a short token signed with the
owner's private key and verified in the browser against the public key in
`src/config/site.json` (ECDSA P-256 via Web Crypto). Nobody can mint a key without the
private half. A determined user can still bypass client-side gating by editing JavaScript
— that is true of every static site, and it is not a reason to pretend otherwise.

**Setting it up (owner, once):**

```bash
node scripts/make-license.js init            # writes .license-key.json (gitignored - back it up)
                                             # and fills pro.publicKey in src/config/site.json
node scripts/make-license.js issue buyer@example.com   # per sale: print the key to send
```

**Losing `.license-key.json` invalidates every key already issued.** Back it up.

**The Pro button has exactly four states**, all decided in `src/lib/gumroad.js` (`proButtonState`)
and unit-tested rather than trusted:

| `gumroad.productUrl` | `pro.publicKey` | state | button |
|---|---|---|---|
| empty | anything | `unconfigured` | disabled, "בקרוב", "המיתוג עדיין לא נמכר – החנות טרם נפתחה" |
| not an `https://` URL | anything | `invalid_url` | disabled, and it says the URL is malformed |
| set | missing | `no_public_key` | disabled — a licence key nothing can verify is nothing |
| set | set | `ready` | opens the Gumroad product page in a new tab (`noopener`) |

Nothing from Gumroad is loaded into this site: no SDK, no overlay, no iframe. The button is a link,
which is why removing Paddle made the CSP **smaller** (`frame-src 'none'`, no `cdn.paddle.com`).

**How the buyer gets the key.** After a sale the owner runs `make-license.js issue <sale id>` and
puts the resulting key where Gumroad delivers it to the buyer — the product's content / licence
field. 🔍 **Unverified:** no Gumroad account exists yet, so nobody here has seen that screen. The
mechanism is written down as the plan, not as a rendered fact; confirm it at owner step 3 and correct
this paragraph if Gumroad's actual delivery differs.

**What Pro must never claim.** One thing only: your logo and accent colour on the printed document.
The saved client list, the numbering, the PDF export and the stored documents are free and stay free
— the index-page FAQ that still described them as Pro was corrected in this change.

## Deploy (Netlify, exact steps)

1. Push the repo. In Netlify: *Add new site → Import from Git*, pick the repo.
2. Base directory: `products/il-biz-tools`. Build command: `node scripts/build-site.js`. Publish directory: `_site` (what `netlify.toml` declares: an explicit allowlist, so `package.json`, `README.md`, `tests/` and `scripts/` are never uploaded).
   (`netlify.toml` already declares this; headers/CSP/redirects are in the same file).
3. Deploy. Then set the custom domain and update `siteUrl` in `src/config/site.json`,
   `sitemap.xml` and `robots.txt` to the real domain; commit.
4. Submit `https://<domain>/sitemap.xml` in Google Search Console.

CLI alternative: `npx netlify-cli deploy --dir=products/il-biz-tools --prod`
(needs `NETLIFY_AUTH_TOKEN` + `NETLIFY_SITE_ID`). Any other static host (Cloudflare Pages,
GitHub Pages, Vercel) works too — copy the headers from `netlify.toml` if the host supports them.

## One-time steps only the owner can do

1. **Gumroad** (merchant of record; this is owner step 3 in `docs/OWNER_STEPS.he.md` — the Paddle
   account was never opened and is not on the list): create the store under the brand name, complete
   identity and payout details, create the Pro product, then paste its full product URL into
   `gumroad.productUrl` and run `make-license.js init`. Until **both** the URL and the public key
   exist, the Pro box stays on **בקרוב** and nothing can be bought.
   Fallbacks if Gumroad refuses: PayPal Business "buy now" link or Payoneer Checkout — swap the one
   `openProCheckout` call in `assets/page-invoice.js`.
2. **Netlify** account + domain purchase (or use the free `*.netlify.app` subdomain).
3. **Google Search Console** verification for the domain.
4. Optional: Plausible, or PostHog (`posthog.projectKey` + the cookieless server-hash-mode toggle).
5. Tax: income from the site is business income — an Israeli osek patur/murshe registration is
   the owner's responsibility (Gumroad invoices the buyer, the owner reports Gumroad payouts).
6. **Before `net-salary.html` can be published at all:** confirm the 2026 brackets and NI rates
   against the Tax Authority booklet and flip `verified` in `tax-2026.json`. Nobody here may flip it.
7. **Before any shekel amount appears on `registrar-fee.html`:** open the primary source
   (תקנות החברות (אגרות) / רשות התאגידים), correct the amounts in `registrar-fee.json`, and set both
   `verified` and `renderAmounts` to true.

## Constitution notes
Honest value only: every figure is sourced, unverified ones are labelled אומדן in the UI, and — since
this change — a page whose figures are unverified is not published at all.
No personal data is collected; receipts and clients stay in the visitor's `localStorage`. The
registrar reminder form ships **disabled** and posts nowhere: no address is collected for a service
that does not exist, and the §30א(ג) and Amendment 13 copy is written and flagged for legal review
before it ever does.
No scraping, no third-party ToS involved beyond Gumroad and the optional analytics opt-ins.

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
  חינמיים. התוספת היחידה בתשלום היא **Pro – מיתוג המסמך** (לוגו וצבע), דרך Gumroad: כשממלאים
  `gumroad.productUrl` ויש מפתח ציבורי, הכפתור פותח את דף המוצר; אחרת מוצג "בקרוב".
- **בודק מספר הקצאה** – לפי סכום, תאריך וסוג הלקוח.
- **אגרה שנתית לרשם החברות** – מחשבון מועדים: מתי נסגר חלון התעריף המוזל (31 במרץ) ומתי מתחיל
  התעריף המלא (1 באפריל). **בלי סכומים**: שיעורי האגרה לא אומתו מול מקור ראשוני, ולכן הדף אומר
  לבדוק אותם ברשות התאגידים במקום להדפיס מספר. טופס התזכורת מוצג סגור עד שהדף יגיע ל-100 צפיות
  בשבוע, וכולל נוסח גילוי לפי סעיף 30א(ג) ונוסח שמירת מידע לפי תיקון 13 – שניהם טיוטה שטרם נבדקה
  משפטית.

**שער הפרסום:** דף שמציג נתון מקובץ שמסומן `"verified": false` לא מתפרסם בכלל. כרגע זה
`net-salary.html`: במקומו עולה הודעה קצרה בלי אף מספר, והכתובת יורדת מה-sitemap. ברגע שהמדרגות
יאומתו מול לוח העזר של רשות המסים – היפוך דגל אחד מחזיר את הדף.

**צעדים שרק הבעלים יכול לבצע:** פתיחת חנות Gumroad על שם המותג (KYC + פרטי משיכה), יצירת המוצר
והדבקת כתובתו, חשבון Netlify ודומיין, אימות ב-Google Search Console.

**בדיקות:** `npm install && npm test` (120 בדיקות, vitest). **הרצה מקומית:** `npm run serve`.
