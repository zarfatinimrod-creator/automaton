// The AI declaration: one line in the footer of every page the site ships, and a
// fuller answer where the site says who runs it.
//
// The constitution: "You must never deny what you are. Never misrepresent your
// actions." MISSION rule 4: nothing that deceives a buyer. The site and its tools
// are written and kept up by AI agents working for the brand מהודק, and a visitor
// is told so on every page, not only if they go looking.
//
// Every sentence here is a claim, and tests/ai-declaration.test.js holds the
// allowlist each one must be on and re-checks the ones code can check against the
// built site. What it deliberately does not say: that a person reviewed anything
// (no record in the repository shows one), that a figure was checked against its
// source (no page does that: the source lines say a figure was compared with
// search results, or that no check date was recorded - src/lib/source-line.js),
// or any name but the brand's.
//
// The build refuses a page whose site footer lacks the line, word for word and
// visible (aiDeclarationProblems in src/lib/publish-gate.js), and refuses a named
// figure page that ships without its source line (figureSourceProblems), so the
// FAQ answer cannot outlive what backs it. Pure data; build-time only - no
// shipped page loads this file.

/** The only public name (MISSION: the brand is the only public face). */
export const BRAND_HE = 'מהודק';

/** The footer line on every shipped page. */
export const AI_DECLARATION = `האתר והכלים שבו נבנו ומתוחזקים על ידי סוכני בינה מלאכותית (AI) הפועלים מטעם המותג ${BRAND_HE}.`;

/** The attribute that marks the footer element holding it. */
export const AI_DECLARATION_ATTR = 'data-ai-declaration';

/** The footer element, as every page writes it. */
export const AI_DECLARATION_HTML = `<p class="ai-declaration" ${AI_DECLARATION_ATTR}>${AI_DECLARATION}</p>`;

/**
 * The pages whose statutory figure prints a source line, and the id of that line. The FAQ sentence below names
 * exactly these three, so it is true only while each of them, when it ships as itself, carries its line.
 */
export const FIGURE_SOURCE_PAGES = {
  'vat.html': 'rate-source',
  'osek-patur.html': 'ceiling-source',
  'allocation.html': 'threshold-source',
};

/** What is true about figures: a source and what was checked when beside them - not that they were checked against it. */
export const FIGURES_SOURCE_SENTENCE =
  'בדפי המע״מ, תקרת עוסק פטור ומספר ההקצאה, ליד הנתון מופיעים המקור שלו ומה נבדק בו ומתי – או שתאריך הבדיקה לא תועד.';

/** The footers' wording, kept as it was. */
export const NOT_TAX_ADVICE = 'המידע באתר אינו מהווה ייעוץ מס.';

/** The FAQ entry on the home page that says who builds and keeps the site. */
export const WHO_BUILDS_QUESTION = 'מי בונה ומתחזק את האתר?';
export const WHO_BUILDS_ANSWER = `${AI_DECLARATION} ${FIGURES_SOURCE_SENTENCE} ${NOT_TAX_ADVICE}`;
