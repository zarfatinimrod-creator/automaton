# Scout notes — productized-services / compliance-scanners

**Agent:** WORKER-SCOUT "compliance-scanners", group `productized-services`
**Date of research:** 2026-09-03
**Criterion:** Compliance scanning — cookie/GDPR, accessibility (EN 301 549, WCAG, Israeli standard 5568), and the Israeli accessibility regulations for websites. Who is legally obliged and who sells to them.
**Search budget used:** 6 of 8 permitted WebSearch calls. GitHub code search + raw.githubusercontent WebFetch used first (free, unblocked).

---

## Evidence grades used below
- **RENDERED** — I fetched the page and read its text (WebFetch on raw.githubusercontent.com).
- **SNIPPET** — WebSearch returned an answer synthesised from pages I did *not* render. Weaker. Treat numbers as indicative.
- **BLOCKED** — the authoritative source is egress-blocked from this container and a human/unblocked agent must open it.

---

## 1. The legal obligation — Israel

### Sources actually rendered
- `https://raw.githubusercontent.com/eitai/israeli-web-compliance/main/SKILL.md` — **RENDERED** 2026-09-03
- `https://raw.githubusercontent.com/paka-tec/ISRWebAccessibility/main/SKILL.md` — **RENDERED** 2026-09-03
- `https://raw.githubusercontent.com/paka-tec/ISRWebAccessibility/main/references/legal.md` — **RENDERED** 2026-09-03
- `https://raw.githubusercontent.com/Freespirits/claudeguard-il/main/README.md` — **RENDERED** 2026-09-03

> Caveat, stated plainly: all four are third-party GitHub repositories (they look like other people's AI-assisted compliance skills), not the statute. They agree with each other and with the Hebrew search snippets, which raises confidence, but **none of them is primary law**. The primary sources are blocked from here — see "must-open URLs" below.

### What they say
- **Statute:** חוק שוויון זכויות לאנשים עם מוגבלות, התשנ"ח-1998 + **תקנות שוויון זכויות לאנשים עם מוגבלות (התאמות נגישות לשירות), התשע"ג-2013 — תקנה 35** (the internet-service regulation).
- **Technical standard:** **ת"י 5568 level AA**, which adopts WCAG (5568 tracks WCAG 2.0 AA; current practice implements WCAG 2.1 AA).
- **Who is obliged:** effectively every business or body that provides a service to the Israeli public through a website. Existing sites were required to comply by **October 2017**; sites launched after that must be compliant from launch. (RENDERED, eitai/SKILL.md)
- **Exemption:** "עוסק פטור (כהגדרתו בחוק מע"מ) או מחזור שנתי ממוצע עד 100,000 ₪" — full exemption at the very bottom of the market. The same file says the figure is **indexed** and gives an unsourced 2024 estimate of ~₪1,075,000, which does not obviously reconcile with the ₪100,000 text. **This number is unresolved and I will not rely on it.** A Hebrew SNIPPET (sgo.co.il) adds that even an exempt micro-business is still expected to publish a הצהרת נגישות.
- **רכז נגישות (accessibility coordinator):** required for an organisation employing **25+ workers**. (RENDERED, legal.md)
- **Statutory damages:** up to **₪50,000 per claim without proof of harm** (indexed), with a customary pre-suit notice period of up to **60 days** to fix. "Non-compliance exposes the site owner to lawsuits with statutory damages without proof of harm, and these suits are common in practice." (RENDERED, paka-tec/SKILL.md)
- **הצהרת נגישות required fields:** conformance level, adjustments actually made, coordinator name/phone/email, known gaps, last-updated date, reachable from every page.
- **Honesty rule that both repos stress:** do not declare full conformance to 5568 without a real audit. `A-N-Shilo/anshilo.com` docs put it bluntly: *"אין להצהיר על התאמה מלאה לת\"י 5568 לפני שנעשתה בדיקה שמצדיקה זאת. הצהרה גורפת שאינה נכונה גרועה מהיעדר הצהרה."* (GitHub code-search snippet, 2026-09-03)

### Adjacent Israeli law surfaced in the same sources (relevant to a "compliance scan" product's scope)
- חוק הגנת הפרטיות התשמ"א-1981 + **תיקון 13, effective 14 Aug 2025** (RENDERED, eitai/SKILL.md).
- No dedicated Israeli cookie law; the Privacy Protection Authority treats tracking as requiring transparency and sometimes consent. GDPR opt-in applies only where the site targets EU data subjects.
- חוק הספאם (תיקון 40 לחוק התקשורת): **₪1,000 per message statutory damages without proof of harm** — this is why cold outreach to scanned sites is off the table for us (see dead ends).

### Must-open URLs (BLOCKED here — a human or unblocked agent must confirm before anything is sold)
1. `https://www.gov.il/he/departments/topics/accessibility` — נציבות שוויון זכויות לאנשים עם מוגבלות, website-accessibility guides (cited by paka-tec as the authority for current thresholds).
2. The text of תקנה 35, תקנות שוויון זכויות (התאמות נגישות לשירות) תשע"ג-2013 (nevo / gov.il).
3. The current, indexed small-business turnover exemption figure and the current statutory-damages cap.

---

## 2. The legal obligation — EU (this is the demand engine, not Israel)

**SNIPPET**, WebSearch 2026-09-03, query "European Accessibility Act 28 June 2025 …":
- The **European Accessibility Act applies from 28 June 2025**. E-commerce services sold to EU consumers must be accessible **regardless of where the seller is located** — "the EAA applies based on where your customers are, not where your business is located."
- **Microenterprise exemption is narrow: fewer than 10 employees AND turnover ≤ €2m — and it covers *services only*, not products.**
- Named source pages to open for confirmation: `https://www.levelaccess.com/compliance-overview/european-accessibility-act-eaa/`, `https://accessible.org/eaa-ecommerce-services-requirements/`, `https://kinsta.com/blog/european-accessibility-act/`.
- The conformance standard behind the EAA for ICT is **EN 301 549**, which incorporates WCAG 2.1 AA. (I did not render a primary ETSI source; treat as background.)

Why it matters to us: the EAA turned "nice to have" into a dated obligation across the EU in 2025, and it reaches non-EU sellers. That is the single biggest reason a scanning product has buyers in 2026.

---

## 3. Who already sells this, and at what price

### Israel (Hebrew SNIPPET, WebSearch 2026-09-03)
| Vendor | Claim seen | URL to open |
|---|---|---|
| digitale.co.il | הנגשה לפי ת"י 5568 **מ-850 ₪ + מע"מ** | https://digitale.co.il/he/מחיר-הנגשת-אתרים/ |
| accessible.org.il | "פתרון משפטי מלא במחיר חד פעמי"; **₪450 חד-פעמי** setup incl. legal wording + accessibility statement | https://accessible.org.il/מחירים/ |
| tabnav.com | "דוח נגישות מיידי" — instant accessibility report + pricing page | https://tabnav.com/he/pricing |
| sgo.co.il | guide: "נגישות אתרים בישראל 2026: החובה החוקית" | https://sgo.co.il/website-accessibility/ |
| General market rate | הנגשת אתר תדמית קיים **₪1,500–10,000** depending on size | (same snippet) |

**Read:** the Israeli market is real and transacting, but it is already productised down to ₪450–850 one-time. That is the price ceiling a no-brand new entrant can charge, and those incumbents rank in Hebrew search while we would start at zero.

### International (SNIPPET, WebSearch 2026-09-03)
- **AudioEye** ~$199–799/mo depending on scope. **Silktide** custom, UK public-sector procurement records ~£6k–40k/yr by page volume. **Equally AI** entry ~$45/mo. **Siteimprove / Level Access / axe Monitor** custom-quoted, thousands per year.
- **Equalize Digital Accessibility Checker** (WordPress.org plugin, free tier + Pro): Pro reported at **$119–190/yr for one site**; tests WCAG 2.1 / 2.2 inside the WP editor. `https://wordpress.org/plugins/accessibility-checker/`
- **Cookie/GDPR side:** **CookieRisk** sells agency white-label daily scans + white-label PDF reports + REST API + webhooks **from €149/month for 25 monitored sites** (`https://cookierisk.eu/for-agencies`). Agency pricing patterns reported: $49–99/mo compliance management, or $300–500 one-time audit + $25/mo maintenance; traffic-tiered $29/mo (<10k visitors) to $149/mo (100k). **Consently** 5 domains $199/yr. **OneTrust** minimum annual contract raised to $10,000 in Q2 2026. **Enzuzo** enterprise from $15,000/yr.

**Read:** the audit/monitoring layer is a genuine paid category with an established agency-reseller shape. The detection engine itself is a commodity (axe-core is MIT and free) — everything that is paid for is packaging: report, jurisdiction mapping, diffing over time, white-label PDF, API.

---

## 4. The constitutional landmine in this criterion: overlay widgets

This is the highest-margin, lowest-build option in the space and **we must not build it.**

**SNIPPET + named primary URL**, WebSearch 2026-09-03:
- The **FTC fined accessiBe $1,000,000**; announced 3 Jan 2025, **final order approved April 2025**, over claims that its `accessWidget` would "automatically comply" with WCAG 2.1 AA. The FTC complaint alleges the plug-in failed to make basic components — navigation menus, form fields, image descriptions — accessible.
- Primary URLs to open: `https://www.ftc.gov/news-events/news/press-releases/2025/04/ftc-approves-final-order-requiring-accessibe-pay-1-million` and `https://www.ftc.gov/legal-library/browse/cases-proceedings/2223156-accessibe-inc`
- Practitioner reporting: settlements in accessibility suits routinely require *removal* of overlay widgets; overlays can interfere with assistive technology.

**Israeli mirror of the same point** — GitHub code-search snippet, `nimrod-cohen/fv-accessibility` `README.he.md`, read 2026-09-03:
> "פסיקות בית המשפט המחוזי בתל-אביב (2022 ואילך) קבעו במפורש כי תפריט נגישות — בין אם כ-overlay ובין אם בכל צורה אחרת — **אינו** ממלא לבדו את דרישות תקן 5568."
(URL: `https://github.com/nimrod-cohen/fv-accessibility` — a rendered GitHub search fragment, not the court ruling itself.)

Conclusion: any product that says "install this and you are compliant" is a **RED** under our constitution *and* under consumer-protection law in at least two jurisdictions. A scanner that reports honestly is fine; a widget that claims to fix is not.

---

## 5. Findings (see structured output for the full table)

1. **IL A11y Report** — Hebrew scan against ת"י 5568 / תקנה 35 + a correctly-worded הצהרת נגישות draft. GREEN. Buyer: Israeli micro web studios and SMB site owners.
2. **EAA / EN 301 549 scan-as-API on rails we already own** (Apify pay-per-event, x402). GREEN. Buyer: agencies and SaaS devs with EU customers.
3. **Pre-consent tracker scanner** (what fires before the cookie banner is answered) sold as a white-label agency report. GREEN. Buyer: EU-facing web agencies.
4. **Hebrew/RTL WordPress accessibility-checker plugin, freemium via Paddle.** GREEN. Distribution through wordpress.org = machine-discoverable, no selling required.
5. **Accessibility-regression monitor for developers** (CI-shaped diff alerts). GREEN but thin.
6. **Overlay widget / "instant compliance" badge** — RED, recorded so nobody rediscovers it.

---

## 6. Dead ends
- **Selling compliance *certification*.** A מורשה נגישות (licensed accessibility expert) sign-off is a human professional act. The owner does nothing, so we structurally cannot sell certification, only technical findings. Any product wording must say so.
- **Cold outreach off scan results.** Scanning Israeli sites in bulk and emailing owners "your site is illegal" is exactly the shape תיקון 40 punishes at ₪1,000/message without proof of harm, and it is fear-selling — banned by our constitution regardless of legality.
- **Competing on detection.** axe-core (MIT) and Lighthouse are free and better than anything we would write. There is no moat in the engine.
- **Enterprise / public-sector accessibility contracts.** Procurement requires a named human, a VPAT signature, and a sales process. Out of scope by mandate.
- **Israeli exemption threshold is unresolved.** ₪100,000 vs a claimed indexed ~₪1,075,000 — I could not close this from here. Anything that depends on the threshold must wait for gov.il.

## 7. Search-budget note
6 WebSearch calls spent; none were refused. GitHub code search + 4 raw.githubusercontent fetches carried the Israeli legal evidence at zero search cost, which is the pattern that worked.
