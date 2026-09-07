# il-biz-tools — כלים לעסק

A static, dependency-free, Hebrew (RTL) micro-site with four tools for Israeli freelancers and
small businesses. No framework, no build step: the deploy artifact is this folder.

## What it sells, to whom

| Tool | Page | Free | Pro (paid) |
|---|---|---|---|
| VAT calculator (מחשבון מע"מ) | `vat.html` | yes | — |
| Osek patur ceiling tracker (מעקב תקרת עוסק פטור) | `osek-patur.html` | yes | — |
| Net salary estimator (אומדן שכר נטו) | `net-salary.html` | yes | — |
| Receipt / invoice generator (קבלה / חשבונית עסקה) | `invoice.html` | print / PDF, local save, saved client list, per-type auto numbering | document branding: your logo and accent colour |

Audience: the ~600k Israeli self-employed, especially **עוסקים פטורים** (freelancers under the
VAT threshold) who need a receipt today and want to know when they will cross the ceiling.
Traffic model: Hebrew SEO (each page has a title, description, canonical, and a FAQPage JSON-LD
answering the exact questions people search), plus sharing in freelancer Facebook/WhatsApp groups.

### Pricing suggestion
- Free tools: free forever (they are the SEO funnel).
- **Pro (document branding): one-time ₪79** via Paddle overlay checkout. Paddle is the merchant of record
  and handles Israeli VAT on the digital sale. Alternative processors that work for an individual
  in Israel: PayPal Business, Payoneer Checkout. Stripe is not available in Israel.

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

Everything in `tax-2026.json` is flagged `"verified": false`; the net-salary page shows an
**אומדן** badge and a disclaimer. Change a number in the JSON and the UI + tests pick it up.
Not modelled: surtax, pension tax credit, special credit points (children, degree, army),
benefits in kind, study fund.

## Layout

```
index.html  vat.html  osek-patur.html  net-salary.html  invoice.html  404.html
assets/style.css            shared RTL styles incl. @media print for the receipt
assets/common.js            nav, canonical, optional analytics
assets/page-*.js            DOM glue per page (no logic)
src/lib/*.js                pure ES modules: vat, osek-patur, net-salary, invoice, paddle, analytics, money
src/config/*.json           vat.json, osek-patur.json, tax-2026.json, site.json
tests/*.test.js             vitest (node environment)
scripts/serve.js            zero-dependency local server
scripts/check-html.js       checks title/description/canonical/JSON-LD/links on every page
netlify.toml robots.txt sitemap.xml
```

## Run locally / test

```bash
cd products/il-biz-tools
npm install          # vitest only
npm test             # 46 unit tests
npm run check:html   # static page sanity checks
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

Until `pro.publicKey` is set, the Pro box stays disabled and says so. The checkout button
appears only when **both** the Paddle credentials and the public key are configured —
selling a key that nothing can verify would be taking money for nothing.

**Losing `.license-key.json` invalidates every key already issued.** Back it up.

| `paddle.clientToken` | Paddle **client-side** token (`test_…` / `live_…`) — this is the `PADDLE_CLIENT_TOKEN` | `""` (Pro shows "בקרוב") |
| `paddle.priceId` | Paddle price id (`pri_…`) for the Pro product | `""` |
| `paddle.environment` | `sandbox` or `production` | `sandbox` |
| `analytics.provider` | `none` / `plausible` / `posthog` | `none` (off) |
| `analytics.plausibleDomain` | Plausible site domain | `""` |
| `analytics.posthogKey`, `analytics.posthogHost` | PostHog project key (`phc_…`) and host | `""`, EU host |

Optional CI variables (never committed): `NETLIFY_AUTH_TOKEN`, `NETLIFY_SITE_ID` for CLI deploys.
The Paddle **API key** (server-side secret) is never needed by this site; only the client token.

## Deploy (Netlify, exact steps)

1. Push the repo. In Netlify: *Add new site → Import from Git*, pick the repo.
2. Base directory: `products/il-biz-tools`. Build command: *(empty)*. Publish directory: `.`
   (`netlify.toml` already declares this; headers/CSP/redirects are in the same file).
3. Deploy. Then set the custom domain and update `siteUrl` in `src/config/site.json`,
   `sitemap.xml` and `robots.txt` to the real domain; commit.
4. Submit `https://<domain>/sitemap.xml` in Google Search Console.

CLI alternative: `npx netlify-cli deploy --dir=products/il-biz-tools --prod`
(needs `NETLIFY_AUTH_TOKEN` + `NETLIFY_SITE_ID`). Any other static host (Cloudflare Pages,
GitHub Pages, Vercel) works too — copy the headers from `netlify.toml` if the host supports them.

## One-time steps only the owner can do

1. **Paddle** (merchant of record; supports Israeli individuals): sign up at paddle.com, complete
   identity/KYC and payout details (Payoneer or bank), get the site domain approved, create the
   Pro product + price, copy the *client-side token* and *price id* into `site.json`, switch
   `environment` to `production`, and run `make-license.js init`. Until both are done the Pro box shows **בקרוב**.
   Fallbacks: PayPal Business "buy now" link or Payoneer Checkout — replace `openProCheckout` in
   `assets/page-invoice.js` with a link.
2. **Netlify** account + domain purchase (or use the free `*.netlify.app` subdomain).
3. **Google Search Console** verification for the domain.
4. Optional: Plausible or PostHog account; fill `analytics` in `site.json`.
5. Tax: income from the site is business income — an Israeli osek patur/murshe registration is
   the owner's responsibility (Paddle invoices the buyer, the owner reports Paddle payouts).

## Constitution notes
Honest value only: every figure is sourced and unverified ones are labelled אומדן in the UI.
No personal data is collected; receipts and clients stay in the visitor's `localStorage`.
No scraping, no third-party ToS involved beyond Paddle/analytics opt-ins.

---

## עברית — מה יש כאן

אתר סטטי בעברית (RTL) לעצמאים ולעסקים קטנים בישראל, בלי שרת ובלי build:

- **מחשבון מע"מ** – 18%, ניתן לשינוי ב-`src/config/vat.json`.
- **מעקב תקרת עוסק פטור 2026** – 122,833 ₪, רצועת אזהרה ב-85%, תחזית שנתית, שמירה מקומית.
- **אומדן שכר נטו** – מדרגות המס 2026 (לאחר ריווח המדרגות), נקודות זיכוי 242 ₪, ביטוח לאומי
  ומס בריאות לפי המדרגה המופחתת (7,703 ₪) והתקרה (51,910 ₪). מסומן **אומדן** עד לאימות מול
  לוח העזר של רשות המסים.
- **מחולל קבלות / חשבוניות עסקה** – מסמך נקי להדפסה או ל-PDF (`@media print`), כולל הערת
  "עוסק פטור - לא חייב במע"מ", מספור רץ, שמירה ב-localStorage. תכונות Pro (PDF ממותג, לקוחות
  שמורים) מאחורי שער Paddle: כשממלאים `clientToken` ו-`priceId` ב-`site.json` נפתח חלון תשלום,
  אחרת מוצג "בקרוב".

**צעדים שרק הבעלים יכול לבצע:** פתיחת חשבון Paddle (KYC + פרטי משיכה ל-Payoneer/בנק), יצירת
מוצר ומחיר, חשבון Netlify ודומיין, אימות ב-Google Search Console.

**בדיקות:** `npm install && npm test` (46 בדיקות, vitest). **הרצה מקומית:** `npm run serve`.
