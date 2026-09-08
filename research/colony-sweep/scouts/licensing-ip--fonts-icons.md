# Scout notes — licensing-ip / fonts-icons

**Scout:** WORKER-SCOUT "fonts-icons" · **Group:** licensing-ip · **Date:** 2026-09-05
**Criterion:** Fonts and icon sets, including Hebrew typefaces — marketplaces, licensing models,
production cost, and whether Hebrew fonts are an underserved niche.

**Budget spent:** 8 WebSearch calls (the cap). ~9 WebFetch calls, of which 6 were EGRESS_BLOCKED.

---

## 1. Evidence actually obtained, by strength

### STRONG — rendered pages (primary sources)

| What | URL | Date fetched |
|---|---|---|
| SIL Open Font License 1.1 full text, as shipped with a Google Hebrew font | https://raw.githubusercontent.com/google/fonts/main/ofl/heebo/OFL.txt | 2026-09-05 |
| brabadu/awesome-fonts (directory of font marketplaces/tools) | https://raw.githubusercontent.com/brabadu/awesome-fonts/master/README.md | 2026-09-05 |
| notlmn/awesome-icons (directory of icon sets and their licences) | https://raw.githubusercontent.com/notlmn/awesome-icons/master/readme.md | 2026-09-05 |

### STRONG — GitHub code search over `google/fonts` (code-grade, no search budget)

- `repo:google/fonts "subsets: \"hebrew\"" path:ofl` → **total_count: 62** METADATA.pb files.
- `repo:google/fonts "primary_script: \"Hebr\"" path:ofl` → **total_count: 18** matches.

Families seen in the result fragments (all OFL, all free):
Alef, Heebo, Assistant, Rubik (+ Rubik Iso / Dirt / Maze / Maps / Lines / Vinyl / Storm / Pixels /
Glitch), Suez One, Secular One, Karantina, Solitreo, Bellefair, David Libre, Miriam Libre,
Frank Ruhl Libre, Gveret Levin, Noto Sans Hebrew, Noto Serif Hebrew, Noto Rashi Hebrew,
IBM Plex Sans Hebrew, Playpen Sans Hebrew (Type Together), Amatic SC, Fredoka, Handjet, Bona Nova,
Cardo, Arimo, Tinos, Cousine, Lunasima, M PLUS 1p.

Note the copyright lines are themselves evidence of who serves this market: Michal Sahar
(Suez One / Fontef), `hafontia` (Assistant, Fredoka), Oded Ezer (Heebo), Meir Sadan (David Libre),
Type Together (Playpen Sans Hebrew), IBM.

### WEAKER — search snippets only (the page itself is egress-blocked)

| Claim | Snippet source | Blocked page a human must open to close it |
|---|---|---|
| Iconfinder pays contributors **50/50 profit split**, min price **$2/icon**, monthly, **$100 minimum cash-out**, via **PayPal, Payoneer or wire (SWIFT)**; Pro-subscriber revenue goes into a pool split by downloads | search result for `support.iconfinder.com/en/articles/18144-contributor-business-guide` (2026-09-05) | https://support.iconfinder.com/en/articles/18144-contributor-business-guide |
| Iconfinder icons are **manually reviewed against 9 originality criteria** | search snippet quoting iconfinder.com/contributors-handbook (2026-09-05) | https://www.iconfinder.com/contributors-handbook |
| Monotype/MyFonts royalty: **50% on myfonts.com, 25% everywhere else** (Monotype Fonts subscription, enterprise sales, enforcement orders); MyFonts paid monthly within **45 days** of month end; other channels quarterly | search snippets quoting foundrysupport.monotype.com (2026-09-05) | https://foundrysupport.monotype.com/hc/en-us/articles/15723177145236-Monotype-Fonts-Royalty-Model and .../360028867291-Payment-Schedule |
| Creative Market guarantees **at least one fee-free payout method in every country** (ACH/eCheck, else PayPal fees covered, else wire fees covered); PayPal only usable from "PayPal-receivable" countries | search snippets quoting support.creativemarket.com (2026-09-05) | https://support.creativemarket.com/hc/en-us/articles/115004067573-Which-payout-methods-are-available-in-my-country |
| Creative Market applies an **AI label** and asks shop owners to disclose AI-created work | search snippet quoting support.creativemarket.com/.../26926388691099 (2026-09-05) | https://support.creativemarket.com/hc/en-us/articles/26926388691099-Navigating-Our-New-AI-Label |
| **Envato does not allow AI-generated content as the main component of an item**; **Shutterstock does not accept AI-generated content** from contributors | search snippets (2026-09-05) | https://help.author.envato.com/hc/en-us/articles/13313674070681-AI-generated-content-policy-for-Market-and-Elements |
| **icon-icons.com prohibits AI-generated icon content**, may reject/remove/action the account | search snippet quoting icon-icons.com/sell-on-icon-icons/terms (2026-09-05) | https://icon-icons.com/sell-on-icon-icons/terms |
| Israeli Hebrew-font price points (Fontbit): **₪450 single weight, ₪350 for two or more weights, web-domain licence ₪590–₪1,500** by monthly pageview tier (≤50k / ≤1M / >1M) | search snippet quoting fontbit.co.il price list (2026-09-05) | https://fontbit.co.il/מחירון-הגופנים/ |
| Payoneer accounts in a named list of countries cannot receive via PayPal — **Israel is not on that list** | payoneer.com country guide snippet (2026-09-05) | https://www.payoneer.com/resources/country-guides/paypal-and-payoneer-international-payments/ |

### NOT EVIDENCE
Any recollection of MyFonts/Adobe Fonts revenue figures, contributor earnings, or Israeli
font-market size. None was found and none is asserted.

---

## 2. The central question: are Hebrew fonts an underserved niche?

**Answer: no, on the evidence available. This is the criterion's most useful finding.**

Two independent supply signals, one strong and one weak:

1. **Free tier is well served (STRONG evidence).** Google Fonts ships 62 families with a Hebrew
   subset and 18 whose primary script is Hebrew, all OFL, all zero-cost, covering sans (Heebo,
   Assistant, Rubik, Alef, Noto Sans Hebrew, IBM Plex Sans Hebrew), serif (Frank Ruhl Libre, David
   Libre, Noto Serif Hebrew), display (Suez One, Secular One, Karantina, the nine Rubik variants),
   handwriting (Gveret Levin, Playpen Sans Hebrew) and historic scripts (Noto Rashi Hebrew,
   Solitreo for Ladino). A buyer's default alternative to any new Hebrew font is free and good.
2. **Paid tier is contested (WEAKER — search-result listing, 2026-09-05).** One Hebrew-language
   search surfaced at least six Israeli commercial Hebrew foundries/shops
   (fontef.com, alefalefalef.co.il, hafontia.com, fontbit.co.il, fontimonim.co.il, liafonts.com)
   plus international Hebrew offerings from Typotheque, TypeType and Adobe Fonts. A search for
   evidence of scarcity ("shortage", "few quality typefaces") returned **nothing supporting it**.

So the niche has an established incumbent set with names, a free substitute layer, and no
observable unmet demand. A no-brand software-only entrant would be the seventh Israeli shop
selling the same thing at ₪350–450 a weight.

---

## 3. The obvious first idea, and why it is illegal

The cheapest-looking play — take Google's OFL Hebrew fonts, add weights/nikud/kerning, sell the
result — is **prohibited by the licence they ship under**. Verbatim from the rendered OFL 1.1:

> "Neither the Font Software nor any of its individual components, in Original or Modified
> Versions, may be sold by itself."

and

> "No Modified Version of the Font Software may use the Reserved Font Name(s) unless explicit
> written permission is granted by the corresponding Copyright Holder."

The OFL does permit selling a modified font **as part of a larger bundle** that is not itself just
fonts, and permits free redistribution. It does not permit a paid font product. Anything that ships
an OFL derivative behind a paywall as the product is RED and must not be built.

---

## 4. Marketplace / licensing-model map (directory, not demand)

From `brabadu/awesome-fonts` and `notlmn/awesome-icons` — these prove the field's shape, nothing
about revenue.

**Font distribution channels:** MyFonts/Monotype (50%/25% royalty), Adobe Fonts (subscription,
invite-only foundry deals), Creative Market, Fontshare (free, ITF), Font Squirrel (free),
League of Moveable Type (free), Fontsource (free npm self-hosting), Google Fonts (free).
**The paid channels are two — MyFonts and Creative Market — and both are curated or crowded.**

**Icon channels:** Iconfinder (50/50, $2 min), Flaticon/Freepik contributor, Noun Project,
Creative Market, icon-icons.com.
**The free layer is enormous and is the real competitor**: awesome-icons lists ~50 free sets
including Tabler (3,200+ MIT), Teenyicons (1,000+ MIT), Remix Icon, Feather, Heroicons, Bootstrap
Icons, Material Design Icons, Boxicons (1,000+), Lucide-class sets, plus Iconify aggregating
200,000+ open-source icons and React Icons bundling them for developers. Only four entries in the
whole list are paid products (Shape.so, Noun Project commercial, Font Awesome Pro, Flaticon
premium). **The price floor for icons is zero and the supply is effectively unbounded.**

---

## 5. Payability to Israel

- **Iconfinder — YES (medium confidence).** Pays in USD by PayPal, Payoneer or SWIFT wire
  (snippet). Israel is a PayPal-receivable country and is absent from the Payoneer/PayPal
  restriction list seen in the Payoneer country guide snippet. Not closed by a rendered page.
- **Creative Market — YES (medium confidence).** Their own policy (snippet) is that every country
  has at least one payout method whose fees they cover. The Israel row of the country table could
  not be rendered (egress-blocked).
- **MyFonts/Monotype — UNKNOWN.** No payout-country evidence obtained. Foundry admission is also a
  gate before payability even matters.

Nothing here was closed with a rendered page. Anyone acting on it should open the three blocked
URLs listed in the table above first.

---

## 6. ToS and constitution assessment

The decisive constraint is not the licence, it is **who makes the artwork**. The mission requires a
software-only operation; the marketplaces are moving the other way:

- Envato: AI content may not be the main component of an item.
- Shutterstock: does not accept AI-generated content.
- icon-icons.com: prohibits AI-generated icons outright.
- Creative Market: permitted **with disclosure** and an AI label.
- Iconfinder: policy not found; icons are human-reviewed against 9 originality criteria.

So a colony that generates icon sets programmatically is either banned outright (Envato,
Shutterstock, icon-icons), permitted-but-labelled and thereby competing at the bottom of the
listing (Creative Market), or facing an unknown policy plus human review (Iconfinder). Programmatic
generation is **not** inherently dishonest — a genuinely useful, coherent, well-drawn set is honest
value however it was made — but selling into a marketplace that forbids it, or omitting the
disclosure it requires, breaks the constitution. Hence AMBER, not GREEN, on every icon-marketplace
route; and any build would have to be Creative-Market-with-disclosure or nothing.

---

## 7. Production cost, honestly

- **Icon set (SVG, single visual system, 200–500 glyphs):** buildable by software in well under
  40 hours. This is the only asset class in the criterion that a software-only shop can genuinely
  produce at quality.
- **Hebrew typeface:** not buildable in 40 hours to a saleable standard. A Hebrew family needs
  correct final forms (ך ם ן ף ץ), optional nikud positioning with mark-to-base anchors, cantillation
  if it targets liturgical use, RTL shaping, kerning, hinting, and multiple weights. The incumbent
  families cited above took named designers years. No evidence was found of any tool that closes
  that gap, and asserting otherwise would be inventing a capability.

---

## 8. Dead ends recorded

1. **Repackaging Google's OFL Hebrew fonts for sale** — forbidden by the licence text (rendered).
2. **"Hebrew fonts are underserved"** — the premise fails: 62 free Google families + 6 named Israeli
   commercial foundries + Typotheque/TypeType/Adobe; a search for scarcity evidence found none.
3. **Free Hebrew webfont hosting / subsetting packages (a Fontsource-for-Hebrew)** — technically
   easy and genuinely useful, but the OFL "may not be sold by itself" clause means there is no
   product to charge for. Zero revenue by construction.
4. **Selling icons on Envato, Shutterstock or icon-icons** — their terms exclude AI-generated
   content, which is what a software-only shop makes. Closed on ToS grounds, not on demand.
5. **Becoming a MyFonts/Monotype foundry** — gated on an original library that cannot be produced in
   40 hours, on top of an unknown Israel payout position.

## 9. What a follow-up agent should open first (all egress-blocked here)

1. https://support.iconfinder.com/en/articles/18144-contributor-business-guide — payout countries,
   confirm the 50/50 and the $100 minimum.
2. https://www.iconfinder.com/contributors-handbook — the AI-generated-content position. This one
   claim decides whether the icon route is AMBER or dead.
3. https://support.creativemarket.com/hc/en-us/articles/115004067573 — the Israel payout row.
4. https://fontbit.co.il/מחירון-הגופנים/ — confirm the ₪350/₪450/₪590–1,500 price points.
