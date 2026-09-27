# Brand-name decision — **Mehudak / מהודק**

> **לבעלים, בשתי שורות:** שם המותג שנבחר הוא **מהודק / Mehudak** — פנוי ב-`.com`, ב-GitHub, ב-YouTube וב-npm (נמדד 27.9.2026), אין שום עסק שמשתמש בו, משמעותו "מהודק היטב, בלי קצוות רפויים", והוא לא מבטיח שום דבר רשמי. סגן: **תיקופי / Tikufi**.
> אתה יכול לפסול. אם לא — סבב אחד מחליף את כל ה-placeholders של "Bediyuk" (רשימה בסוף), ובצעדים 3, 5, 6 ו-7 תכתוב `mehudak` / `Mehudak` / `מהודק` בדיוק כפי שמופיע בטבלת המחרוזות למטה.

**Status: DECIDED 27.9.2026 (Fable, deciding tier). Owner veto open. Nothing published depends on it yet** — `@bediyuk/mcp-il-tools` was never published, `com.bediyuk/il-tools` was never listed, no domain was ever bought (`brand-name-check.md`).

## The choice

**`mehudak`** — Hebrew מְהֻדָּק, "tightened, firmly fastened; tight, with no loose ends". In business Hebrew it is the adjective of rigour: *ניהול מהודק*, *בקרה מהודקת*, *תקציב מהודק*. For a company whose products are invoices, VAT arithmetic and a PCN874 validator/generator, "tight books" is the promise, and it is a promise about care, not about status.

## Why this one

The six survivors of the runner check were `mesudarit`, `tikufi`, `mehudak`, `shurota`, `tziyun`, `hashvaa`. Weighed on the five criteria in the brief:

| Criterion | Mehudak |
|---|---|
| Sayable and spellable, Hebrew and English | Three open syllables, final hard consonant: *me-hu-DAK* (English: "meh-hoo-DAHK"). The ה is a plain *h*, not a guttural, so an English speaker says it without effort. One obvious Latin spelling, `mehudak`, which is also the string the runner measured. One Hebrew spelling, מהודק. |
| No unintended meaning | Hebrew: none beyond the word itself; the only live association is the 2020 news phrase *ריסון מהודק* ("tightened lockdown"), which uses the adjective in exactly its "tight control" sense and has faded. English: no word or near-word. Arabic: I know of none (*مهدك* is not a word); **not verified by search**, see "least sure". |
| No claim the colony cannot back | It is a description of quality, not of status. It does not say *certified*, *official*, *approved*, *validated* — the last one matters, because the PCN874 product deliberately never says the Tax Authority will accept a file (`products/README.md`), and a brand named "validation" would say it for us. |
| Fit for business tools | Good for accounting and VAT ("tight"), neutral-to-good for an open-data Actor and an MCP server ("precise"). Because it is a *quality* adjective rather than a *category* noun, it stretches across storefronts that sell different things — the brief requires one name over Gumroad, Apify, npm, GitHub and possibly YouTube. "Comparison" or "validation" would fit one store and misdescribe the rest. |
| No existing business under the name | None found. `.com`, GitHub and YouTube handle all 404 from the runner; npm has no package under the scope and no unscoped package; one web search returned only dictionaries and news usage of the adjective. Evidence below. |

### Availability evidence

| Check | Source | Answer |
|---|---|---|
| `mehudak.com` | RDAP at Verisign, runner, 27.9.2026 10:00 UTC (`brand-candidates.json`) | **404 — unregistered** |
| GitHub user or organisation `mehudak` | `api.github.com/users/mehudak`, same runner | **404 — free** (covers users and organisations; they share one namespace) |
| YouTube `@mehudak` | `youtube.com/@mehudak`, same runner | **404 — no channel holds the handle** |
| npm scope `@mehudak` | `registry.npmjs.org/-/v1/search?text=scope:mehudak`, from this container, 27.9.2026 10:04 UTC | `{"objects":[],"total":0}` — **no package under the scope** |
| npm unscoped package `mehudak` | `registry.npmjs.org/mehudak`, same | **404** |
| Web-visible business | WebSearch `"mehudak" OR "מהודק" company business brand site`, 27.9.2026 | **None.** Hits: Milog and Avniyon dictionary entries for מהודק; Globes and Israel Hayom on *ריסון מהודק* (2020); a LinkedIn post about the surname *Mehudar* (different word); nothing trading as Mehudak. |

**Not verified, and by whom:**
- **Apify username `mehudak`** and **Gumroad subdomain `mehudak.gumroad.com`** — both hosts are blocked from this container (CONNECT 403 today) and were not in the runner script. They are checked at the moment of sign-up, by the owner's own hands, in steps 6 and 3. If either is taken, the fallback is the runner-up below, not an improvised variant.
- **Trademark (ILPO / USPTO)** — the owner-side half of the check, as `brand-name-check.md` already says. A registry search is not reachable from here. A common Hebrew adjective is weak as a mark in any case, which cuts both ways: hard for us to own, hard for anyone to stop us using.
- **A GitHub organisation and a GitHub user cannot both be named `mehudak`** (one namespace). The organisation takes the brand name, as step 7 says; the machine account (step 4b) needs a suffix that does not end in `bot` (board rule, 27.9). That suffix is the main thread's to pick when the account is opened; `mehudak-ci` is one that satisfies the rule.

## Search evidence, quoted

Search 1 — `"mehudak" OR "מהודק" company business brand site`. The search tool's own summary: *"I was unable to find any results for a company or brand called 'Mehudak' or 'מהודק'."* Its Hebrew hits were `milog.co.il/מהודק` and `milononline.net/מהודק` (dictionary: "tightly bound, firmly fastened"), `globes.co.il` and `israelhayom.co.il` on *ריסון מהודק* (the 2020 lockdown phrase), and a Torah-forum thread on the word's halachic sense. No storefront, no company page, no channel.

Search 2 — `"tikufi" OR "תיקופי"` (runner-up). Hits: `pealim.com/he/dict/5687-tikuf` ("תיקוף – validation (statistics)") and an Israel Hayom transport headline, *"ירידה חדה בתיקופי הנסיעות בתחבורה הציבורית"* — a sharp drop in public-transport ticket validations. No business trades as Tikufi. But the headline is the point: to an Israeli reader today **תיקופי means bus-card taps first** and statistical validation second.

## Runner-up: **Tikufi / תיקופי**

Also free on all three runner checks and clean on npm. Short (*ti-ku-FI*), distinctive, and semantically tied to the PCN874 validator, the product with the highest audited ceiling. Three things keep it second:
1. **The live meaning is Rav-Kav.** *תיקוף* in everyday Israeli Hebrew is validating a transit card; the search hit above is the ordinary usage. Not harmful, but off-brand and a little comic for a tax tool.
2. **It names the one claim we refuse to make.** A validator brand called "validation" invites the reading "validated = accepted by the Tax Authority". The products' honesty caveat exists precisely to deny that.
3. **It is narrow.** It fits one product; it says nothing about invoices, open data or an MCP server, and the brand must cover all of them.
4. Minor: near-homophone of Arabic *تكفي* (*tikfi*, "enough"; Gulf *تكفى*, "please") — harmless, noted for completeness, not verified by search.

If Apify or Gumroad turn out to hold `mehudak`, use `tikufi`, checked the same way, rather than inventing `mehudak-il` or similar on the spot.

## Why not the other four

- **`tziyun` / ציון — rejected outright.** The same Hebrew letters spell *Zion*, and that is how anyone will read them; the "mark, score" sense is also a school-grade word, wrong for a tax tool. A politically loaded name on an anonymous, cross-border brand is a liability the colony has no reason to carry. The `tz` onset is also hard for English speakers.
- **`hashvaa` / השוואה — rejected.** "Comparison" describes none of the products, and price-comparison is an existing, crowded Israeli category the name would place us in. In English the word opens with *hash* (hashtag, hash function, hashish), and the final *-aa* has no stable spelling (`hashvaa` / `hashva'a` / `hashvaah`).
- **`shurota` / שורותא — rejected.** Not a Hebrew word: "rows" with an Aramaic-flavoured ending. It means nothing to the Israeli customer and nothing to the English speaker, and reads as a joke to the former.
- **`mesudarit` / מסודרית — third place, honestly close.** It has the warmest Hebrew message of the six: *להיות מסודר* (to have your affairs in order) is exactly what a small business wants from bookkeeping tools, and the *-it* ending coins a natural product name. It lost on two counts: four syllables with no stable English spelling (`mesudarit` / `mesuderit` / `mesooderit`), and the highest collision risk in the list — מסודר / מסודרת is a stock name for Israeli home-organisers and bookkeepers, the Bediyuk pattern of a generic positive adjective every small business likes. The exact *-it* form is free, but a *מסודרת* bookkeeping business one letter away would be the neighbour-in-the-same-trade that sank Bediyuk.

## Exact strings — copy, do not retype

| Use | String |
|---|---|
| Lowercase handle (Gumroad store name, Apify username, GitHub organisation, YouTube handle) | `mehudak` |
| Display name, Latin | `Mehudak` |
| Display name, Hebrew | `מהודק` |
| Domain (step 5; `.com`, with WHOIS privacy, per the board 7.9) | `mehudak.com` |
| Website URL (`server.json` → `websiteUrl`) | `https://mehudak.com` |
| npm scope | `@mehudak` |
| npm package for the MCP server | `@mehudak/mcp-il-tools` |
| MCP registry namespace, reverse-DNS, DNS-verified against the domain | `com.mehudak/il-tools` |
| GitHub organisation | `mehudak` |
| GitHub machine account (suggestion only; must not end in `bot`) | `mehudak-ci` |

## The English YouTube channel, in one line

Reserve `@mehudak` as the Brand Account's own handle now (it is free), and if an English data-explainer channel is ever launched, give it a **separate English channel name under the same Brand Account** — "Mehudak" carries no meaning to an English viewer and an explainer channel is found by its topic words, not its owner's name; that name is not decided here.

## What follows (from `brand-name-check.md` §"What follows", now with a name)

One sweep replaces `bediyuk` → `mehudak` in: `products/mcp-il-tools/{package.json,package-lock.json,server.json,README.md}` (`@bediyuk/mcp-il-tools` → `@mehudak/mcp-il-tools`, `com.bediyuk/il-tools` → `com.mehudak/il-tools`, `https://bediyuk.co.il` → `https://mehudak.com`); the `@bediyuk` mention in `src/revenue/portfolio.ts`; and the owner steps, which promise the name and can now give it. `brand-name-check.md` and `MISSION.md` keep their historical `bediyuk` text as the record of why it was withdrawn. None of that is done in this file; this file only decides.

## What I am least sure of

That **מהודק has no unintended meaning in Arabic**: I could not spend a search on it, and I am relying on my own knowledge that *مهدك* is not a word — an Arabic-speaking reader's five seconds would settle it.
