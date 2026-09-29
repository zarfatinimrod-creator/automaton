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
// source (no record shows that either: the source lines say a figure was compared
// with search results, or that no check date was recorded - src/lib/source-line.js),
// or any name but the brand's.
//
// The build refuses a page whose site footer lacks the line, word for word and
// visible (aiDeclarationProblems in src/lib/publish-gate.js). The FAQ answer's
// figures sentence is written per build from the figure pages that ship as
// themselves (withShippedFiguresSentence), and the build refuses a sentence that
// names any other set, or a named page whose source line is not exactly what its
// config gives (figureSourceProblems), so the answer cannot outlive what backs it.
// Pure data and text; build-time only - no shipped page loads this file.

/** The only public name (MISSION: the brand is the only public face). */
export const BRAND_HE = 'מהודק';

/** The footer line on every shipped page. */
export const AI_DECLARATION = `האתר והכלים שבו נבנו ומתוחזקים על ידי סוכני בינה מלאכותית (AI) הפועלים מטעם המותג ${BRAND_HE}.`;

/** The attribute that marks the footer element holding it. */
export const AI_DECLARATION_ATTR = 'data-ai-declaration';

/** The footer element, as every page writes it. */
export const AI_DECLARATION_HTML = `<p class="ai-declaration" ${AI_DECLARATION_ATTR}>${AI_DECLARATION}</p>`;

/**
 * The pages whose statutory figure prints a source line: the id of that line, and the page's name as the FAQ
 * sentence lists it. The config each line is written from is the page's one entry in PAGE_RATE_SOURCES
 * (src/lib/publish-gate.js).
 */
export const FIGURE_SOURCE_PAGES = {
  'vat.html': { id: 'rate-source', name: 'המע״מ' },
  'osek-patur.html': { id: 'ceiling-source', name: 'תקרת עוסק פטור' },
  'allocation.html': { id: 'threshold-source', name: 'מספר ההקצאה' },
};

/** What is true beside each named page's figure: a source and what was checked when - not that it was checked against it. */
export const FIGURES_CLAIM = 'ליד הנתון מופיעים המקור שלו ומה נבדק בו ומתי – או שתאריך הבדיקה לא תועד.';

/**
 * The figures sentence for the figure pages that ship as themselves, in FIGURE_SOURCE_PAGES order; null when none
 * does. A page withheld for an unverified figure ships a notice with no figure and no source line, so the sentence
 * must not name it.
 */
export function figuresSourceSentence(pages) {
  const names = Object.keys(FIGURE_SOURCE_PAGES)
    .filter((page) => pages.includes(page))
    .map((page) => FIGURE_SOURCE_PAGES[page].name);
  if (!names.length) return null;
  const list = names.length === 1 ? `בדף ${names[0]}` : `בדפי ${names.slice(0, -1).join(', ')} ו${names[names.length - 1]}`;
  return `${list}, ${FIGURES_CLAIM}`;
}

/** The sentence as the source tree writes it: all three pages. The build rewrites it when fewer ship. */
export const FIGURES_SOURCE_SENTENCE = figuresSourceSentence(Object.keys(FIGURE_SOURCE_PAGES));

/** The footers' wording, kept as it was. */
export const NOT_TAX_ADVICE = 'המידע באתר אינו מהווה ייעוץ מס.';

/** The FAQ entry on the home page that says who builds and keeps the site: `<details id="who-builds">`. */
export const WHO_BUILDS_ID = 'who-builds';
export const WHO_BUILDS_QUESTION = 'מי בונה ומתחזק את האתר?';

/** Its answer when `pages` are the figure pages that ship as themselves. */
export const whoBuildsAnswer = (pages) => [AI_DECLARATION, figuresSourceSentence(pages), NOT_TAX_ADVICE].filter(Boolean).join(' ');

/** The answer as the source tree writes it. */
export const WHO_BUILDS_ANSWER = whoBuildsAnswer(Object.keys(FIGURE_SOURCE_PAGES));
