# Measurement: Hebrew teacher and kindergarten origins (REPLENISH row 5 lead)

**Status (28.9.2026): no paid multi-seller marketplace found, so there is no scout target.** Of the six origins,
four rendered (200). None is a marketplace where third parties list and sell materials. One is a physical shopping
mall, two are free materials sites, and one is a single educator's course business. The other two (haganenet,
lemidatova) refused the render (403) and stay UNKNOWN. On present evidence the lead is closed for 4 of 6. It reopens
only if one of the two refused origins renders and shows sellers. The TPT confirmation render was also refused (403),
so the TPT kill stands at github grade.

**Ordered by:** `research/breadth/REPLENISH-2026-09-28.md:78` (row 5) and `:325` (§5: "Six homepage renders: is any a
paid multi-seller marketplace?"); ZERO-TESTS rows 88 and 90-95 (`research/channel-loop/ZERO-TESTS.md:97-104`).
**Grades:** [RENDERED] means quoted from the stored capture at the cited line (each quote checked with `grep -n -F`).
[INFERENCE] means reasoned from rendered facts. UNKNOWN means the capture does not answer it. Personal names on these
pages (testimonials, contact links) are not copied.

## Keyword sweep over the four `.html` captures [RENDERED]

Terms: מוכר, מוכרים, הצטרפ, העל, עמלה, תנאי, מנוי, מחיר, ₪, woocommerce, dokan, wcfm, vendor, seller (plus cart, עגלה,
shop, חנות, premium).

- **No seller signal anywhere.** מוכר, מוכרים, עמלה, מנוי, מחיר, ₪, woocommerce, dokan, wcfm, seller, cart and עגלה
  have **0 hits in all four**.
- **Every hit that did occur is something else:**
  - ganim-mall: הצטרפ ×2, the mall's members' club. shop ×2, the `/shops/` store directory (html:29). תנאי ×1, the
    club sign-up consent (txt:46). premium ×1, a script variable `PremiumSettings`.
  - worksheets4kids: תנאי ×3, the site's terms of use.
  - lomdiml: העל ×1, a testimonial's "בהעלאת ההישגים". תקנון ×2, the site-rules link.
  - lomdimhofshi: תנאי ×1, the terms-of-use link. vendor ×1, `navigator.vendor` in a script (html:3). premium ×3,
    "Yoast SEO Premium plugin" (html:10, :25).
- **AI.** "בינה מלאכותית", "AI" and "GPT" have 0 hits in every `.txt` and `.html`. **No site addresses AI-made
  materials.**

## 1. ganim-mall.co.il: (d) a physical shopping mall, not a teacher site [RENDERED]

- "בלב שכונת כפר גנים בפתח תקוה, הוקם קניון מודרני" (`research/rendered/ganim-mall-home.txt:22`); "9,000 מ"ר שטחי
  מסחר" (`:23`). The menu offers "שטחים להשכרה" (`:9`) and a members' club (`:28`).
- The REPLENISH "mall" inference (`REPLENISH-2026-09-28.md:78`) is refuted. "גנים" is the neighbourhood's name, and
  nothing on the page is sold online.

## 2. worksheets4kids.co.il: (b) a free materials site, one publisher [RENDERED]

- "מאגר פדגוגי מקצועי בחינם" (`worksheets4kids-home-2026-09-29.txt:181`); "והכל להדפסה בחינם!" (`:238`).
- The creators are in-house: "מי שיוצר את הדפים שלנו הם אנשי חינוך" (`:238`). "כל התכנים באתר הנם מקוריים ולשימוש
  אישי בלבד" (`:326`). There is no upload or seller path among its links.
- Its only commerce hint is a newsletter promising "המלצות והנחות על מוצרי לימוד לילדים" (`:335`). It sells nothing
  on the page. Prices: none.

## 3. lomdiml.co.il: (a) one educator's own business, selling courses and workshops, not materials [RENDERED]

- "קורסים וכלים פרקטיים להורים, מורים ותלמידים" (`lomdiml-home-2026-09-29.txt:77`), written in the first person singular: "שלחו לי
  הודעה ואני אחזור אליכם בהקדם האפשרי" (`:182`). It also sells to schools under "גפ"ן" (`:216`), claiming "125 בתי ספר"
  (`:83-84`).
- The "אתר הקורסים" button points off-site, to `https://www.mindtreesadnaot.com/` (`lomdiml-home-2026-09-29.html:277`). No price or
  ₪ appears on the homepage, so prices are UNKNOWN. There are 8 named testimonials under "לקוחות ממליצים" (`.txt:224`);
  the names were not copied.
- **Side note.** There is an off-screen spam link, "casino buitenland" (`.txt:332`), inside `position: absolute; left:
  -666324px` (`.html:1647`). [INFERENCE] The site is loosely maintained. This does not change the classification.

## 4. lomdimhofshi.co.il: (b) a free practice portal, one team [RENDERED]

- "פורטל הלימודים החינמי הגדול בישראל" (`lomdimhofshi-home.txt:22`); "חינם לגמרי, בלי תשלום ובלי הרשמה!" (`:28`);
  "בלי תשלום, בלי סיסמאות ובלי פרסומות מציקות" (`:520`).
- Size: "24,724 שאלות" (`:46`), for grades 1-6. "כל מבחן הופך בלחיצה לדף עבודה מסודר לכיתה או לבית" (`:544`).
- Authorship: "ע"י צוות לומדים חופשי" (`:558`). No outside contributors or sellers are named or linked.

## 5. Refused: haganenet.co.il and lemidatova.com (UNKNOWN)

- Both returned `"status": 403` with no body (`research/rendered/haganenet-home.meta.json:5`,
  `lemidatova-home.meta.json:5`). Whether either is a marketplace is UNKNOWN. Nothing is inferred from their names or
  from memory.

## 6. TPT confirmation render refused

- `research/rendered/tpt-seller-fees.meta.json:5` reads `"status": 403` (fetched 2026-09-28T17:19Z, empty body).
  The reopen test (`REPLENISH-2026-09-28.md:256`, a seller tier with no up-front fee) was not run. **The TPT G1 kill
  stands at github grade** (the $29 one-time Basic fee, `:249`), not at rendered grade.

## 7. What this adds

- [INFERENCE] **Two more free floors** for Hebrew elementary practice material: worksheets4kids (printable worksheets)
  and lomdimhofshi (24,724 questions, with a printable worksheet from any test). Together with row 4's free sites
  (`REPLENISH-2026-09-28.md:77`), they raise the bar that "never sell what is already free" sets for any paid Hebrew
  worksheet.

## Next check

None qualifies. No captured page links to a Hebrew materials marketplace or to either refused origin, so there is no
in-capture URL to render. [INFERENCE] A runner re-render of the two refused homepages would probably be refused again.
