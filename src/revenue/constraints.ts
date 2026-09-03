/**
 * Revenue Colony — the promotion constraints, as code.
 *
 * MISSION.md says decisions are code so that an auditor can re-derive any of
 * them. These six constraints came out of the `store-promotion` criterion group
 * (research/colony-sweep/groups/store-promotion.md) and they are the group's
 * real output: not revenue lines, but the rules that decide whether a storefront
 * portfolio survives contact with Google, with a marketplace, or with the
 * constitution.
 *
 * They live here rather than in prose because a rule nobody can execute gets
 * re-argued every sweep. `screenProposal` gives the supervisor, the board and
 * the auditor the same answer from the same text, and a RED verdict is a
 * rejection the auditor can check without re-reading the report.
 *
 * What this is NOT: a spam filter, and not a substitute for reading a proposal.
 * It matches wording, so it catches a proposal that says what it is doing and
 * misses one that hides it. A clean screen means "nothing known-fatal was
 * stated", never "this is safe".
 */

/** How a violation should be treated by whoever is holding the proposal. */
export type ConstraintVerdict = "RED" | "AMBER";

export interface PromotionConstraint {
  id: string;
  /** One line, imperative, the way it is enforced. */
  rule: string;
  /** Why it exists, with the evidence that put it here. */
  because: string;
  /** RED kills the proposal. AMBER blocks it until a human closes the evidence gap. */
  verdict: ConstraintVerdict;
  /**
   * Wording that, if a proposal contains it, trips this constraint. Lowercased
   * substrings; Hebrew and English both appear because proposals arrive in both.
   */
  tripwires: string[];
  /** What would legitimately reopen the question. "" means nothing would. */
  reopensIf: string;
  /** The URL a human must open to make this load-bearing, when we only had a snippet. */
  evidenceGap?: string;
}

export const PROMOTION_CONSTRAINTS: PromotionConstraint[] = [
  {
    id: "unique-data-per-store",
    rule: "Every storefront must carry data that exists nowhere else in the portfolio. Never generate store N+1 from store N by substituting a city, a niche or a keyword.",
    because:
      "Google names this failure mode in four policies at once — scaled content abuse, doorway abuse, site reputation abuse and expired domain abuse. Doorway abuse explicitly covers 'having multiple websites with slight variations to the URL and home page'. A substitution portfolio is not a portfolio, it is one site Google will deindex as a set.",
    verdict: "RED",
    tripwires: [
      "same template",
      "swap the city",
      "vary the keyword",
      "per-city landing",
      "one page per city",
      "spun",
      "spintax",
      "programmatic pages from a keyword list",
      "עמוד לכל עיר",
      "אותו תבנית",
    ],
    reopensIf:
      "Google removes doorway abuse from its spam policies, or the proposal supplies genuinely distinct data per store — in which case it is not a substitution and never tripped this rule.",
    evidenceGap: "https://developers.google.com/search/docs/essentials/spam-policies",
  },
  {
    id: "one-domain-not-a-network",
    rule: "One consolidated domain with in-context internal links. Never a network of microsites cross-linking to each other.",
    because:
      "A microsite network concentrates the same deindexing risk the first constraint describes and adds link-scheme exposure on top. Consolidating il-biz-tools is a ~4-hour edit with no revenue attached and it removes a risk that could take the whole property out of Google.",
    verdict: "RED",
    tripwires: [
      "microsite",
      "network of sites",
      "satellite site",
      "pbn",
      "private blog network",
      "cross-link the domains",
      "רשת אתרים",
      "אתרי לוויין",
    ],
    reopensIf:
      "Never for SEO reasons. A separate domain for a genuinely separate product with its own buyer is not a microsite network and does not trip this.",
  },
  {
    id: "no-automated-community-posting",
    rule: "Never post to a community automatically, at any scale, however the post is worded and whoever recommends it. Reddit, Quora, Hacker News, Stack Overflow, Medium, dev.to, Hashnode.",
    because:
      "This is the single largest citation lever in existence — Reddit is roughly 40% of AI citations — and it is structurally closed to us. Faking participation is astroturfing; earning it requires a human posting under their own name; the owner does neither. This is the ceiling on the entire promotion group and no on-page work gets around it. It binds even when a platform's own playbook recommends it: Apify's parasite_seo.md ships a 27-step checklist that is largely this, and the vendor recommending it does not make it permitted.",
    verdict: "RED",
    tripwires: [
      "post to reddit",
      "reddit thread",
      "answer on quora",
      "quora answers",
      "show hn",
      "hacker news post",
      "stack overflow answer",
      "cross-post to medium",
      "dev.to",
      "hashnode",
      "community seeding",
      "seed the discussion",
      "parasite seo",
      "פרסום בקהילות",
    ],
    reopensIf:
      "Only if the owner decides to participate personally under his own name — which the mission forbids. Not reopenable by us.",
  },
  {
    id: "five-honest-reviews",
    rule: "Target five honest reviews per SKU, asked of every buyer once, automatically. Not 'many', and never selected.",
    because:
      "Spiegel/Northwestern measured purchase likelihood at five reviews as +270% versus zero, with essentially all the lift inside the first ~10. At a 5-15% review rate that is about 50 delivered orders per SKU. There is no cleverer legal lever than asking every buyer once — the arithmetic says the fifth review is where the value already is, so anything past it is not worth a rule bend.",
    verdict: "AMBER",
    tripwires: ["buy reviews", "review exchange", "incentivised review", "incentivized review", "ביקורות בתשלום"],
    reopensIf: "A larger controlled study moves the shape of the curve. The rule would change shape, not direction.",
    evidenceGap: "https://spiegel.medill.northwestern.edu/how-online-reviews-influence-sales/",
  },
  {
    id: "no-review-gating",
    rule: "Never screen, branch on, or pre-qualify sentiment before asking for a public review. No NPS gate, no 'smart send', no happy-path branch.",
    because:
      "Prohibited by Google, Trustpilot, Amazon, FTC 16 CFR 465 and the EU Omnibus directive simultaneously — five regimes, one behaviour. It is also the only differentiator the Shopify/WooCommerce review-SaaS market still markets, which is why a proposal in that space tends to arrive carrying it. Any sibling proposal containing a sentiment pre-screen is auto-rejected however it is worded.",
    verdict: "RED",
    tripwires: [
      "review gating",
      "nps gate",
      "smart send",
      "only ask happy",
      "filter out negative",
      "pre-screen sentiment",
      "sentiment gate",
      "סינון ביקורות",
    ],
    reopensIf: "Nothing. Five regimes would have to change at once, and the constitution forbids it independently of all five.",
  },
  {
    id: "llms-txt-is-hygiene",
    rule: "Ship llms.txt as one hour of hygiene and forecast zero from it. Never sell it, never sell a generator for it, never cite it as a distribution channel.",
    because:
      "97% of published llms.txt files are never fetched; crawlers do not probe for it on domains that lack it; OpenAI fetched robots.txt 3,990 times against llms.txt 7 in the same study. Google has said it has no effect on Search or AI Overviews. Selling it would be selling a placebo, which the constitution forbids before the arithmetic even gets a turn.",
    verdict: "RED",
    tripwires: ["llms.txt service", "llms.txt generator", "sell llms.txt", "llms.txt as a channel"],
    reopensIf:
      "A major assistant publishes that it reads llms.txt and a measurement shows fetches on our own domains. The fetch counts are the test, not an announcement.",
  },
];

export interface ConstraintHit {
  constraintId: string;
  verdict: ConstraintVerdict;
  /** The exact tripwire text that matched, so the finding can be checked. */
  matched: string;
  rule: string;
  because: string;
}

export interface ProposalScreen {
  /** RED if any RED constraint tripped, AMBER if only AMBER did, GREEN if none. */
  verdict: "GREEN" | "AMBER" | "RED";
  hits: ConstraintHit[];
  /** Always present, including on GREEN: a clean screen is not a safety claim. */
  caveat: string;
}

const CAVEAT =
  "This screen matches stated wording. It catches a proposal that says what it does and misses one that does not. GREEN means nothing known-fatal was stated, never that the proposal is safe.";

/**
 * Screen a proposal's text against the constraints.
 *
 * Everything the proposal says should be passed in — pitch, operating loop,
 * first step, kill criteria. A constraint tripped inside a kill criterion still
 * counts: naming the forbidden behaviour is how it arrives.
 */
export function screenProposal(text: string): ProposalScreen {
  const hay = text.toLowerCase();
  const hits: ConstraintHit[] = [];

  for (const c of PROMOTION_CONSTRAINTS) {
    for (const wire of c.tripwires) {
      if (hay.includes(wire.toLowerCase())) {
        hits.push({ constraintId: c.id, verdict: c.verdict, matched: wire, rule: c.rule, because: c.because });
        break; // one hit per constraint; the rule is what matters, not the count
      }
    }
  }

  const verdict = hits.some((h) => h.verdict === "RED") ? "RED" : hits.length > 0 ? "AMBER" : "GREEN";
  return { verdict, hits, caveat: CAVEAT };
}

/** The constraints as a prompt block, so scouts and supervisors get the same rules the code enforces. */
export function constraintsBriefing(): string {
  const lines = ["PROMOTION CONSTRAINTS (binding on every proposal, from the store-promotion sweep):"];
  for (const [i, c] of PROMOTION_CONSTRAINTS.entries()) {
    lines.push(`${i + 1}. [${c.verdict}] ${c.rule}`);
    lines.push(`   Why: ${c.because}`);
  }
  lines.push(
    "A RED constraint rejects the proposal outright. An AMBER one blocks it until the evidence gap is closed by a human.",
  );
  return lines.join("\n");
}
