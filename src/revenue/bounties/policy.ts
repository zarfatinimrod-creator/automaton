/**
 * Revenue Colony — Algora OSS bounties, build #2, stage 1: the repository policy filter.
 *
 * BOARD.md build #2 and CHIEF-AUDIT.md §2.1 row 6 both grade this line **AMBER**
 * for one reason and it is not Algora's terms: *"Algora's terms do not prohibit
 * agent-authored PRs — the risk is per-repo maintainer policy, and it is real."*
 * (`research/colony-sweep/groups/bounties-grants.md` §4). The line is permitted
 * only behind a filter that reads the repository's own contribution policy first
 * and refuses to attempt anything that bans AI-authored work. Without the filter
 * the line violates the constitution regardless of what the platform allows, and
 * MISSION rule 4 — honest value outranks revenue — decides that, not the ceiling.
 *
 * What this module is, precisely: a **conservative reader of text somebody else
 * wrote**. It does not fetch anything (the caller supplies the documents), it
 * does not decide whether to attempt (that is `intake.ts`), and it never claims a
 * repository is safe. Its four verdicts are:
 *
 *   forbidden — an explicit ban on AI-generated / LLM-assisted contributions, or
 *               on automated submissions, or a requirement that the work be
 *               human-authored. The colony does not attempt. Ever.
 *   disclose  — the policy requires AI use to be disclosed.
 *   allowed   — the policy explicitly permits AI-assisted contributions.
 *   unknown   — the policy is silent, which is the common case.
 *
 * **`unknown` is treated as `disclose`, never as `allowed`.** Silence is not
 * consent; it is the absence of an answer, and the colony discloses anyway on
 * every pull request (`disclosure.ts`). `effectiveAction()` below is where that
 * mapping lives so no caller has to remember it.
 *
 * ── Provenance of the phrasings, stated because it is the honest part ──
 *
 * The 121-criterion sweep quotes exactly three AI-policy phrasings verbatim, and
 * **none of them comes from a repository's CONTRIBUTING or CODE_OF_CONDUCT**:
 *
 *  1. HackerOne's misconduct policy — "doesn't tolerate any sort of automated
 *     delivery of reports from scanners, scripts, browser automation frameworks,
 *     etc." (`groups/bounties-grants.md`, rejected table).
 *  2. A Google-Cloud-sponsored hackathon's rules, fetched 2026-09-03 — "Projects
 *     are required to utilize Google Cloud artificial intelligence tools ... All
 *     other artificial intelligence tools are not permitted."
 *     (`scouts/bounties-grants--hackathons.md` §1).
 *  3. A Microsoft Build AI challenge, snippet-grade — the solution "must clearly
 *     demonstrate meaningful human creativity, judgment, and engineering —
 *     AI-generated boilerplate alone does not constitute a good submission."
 *     (`scouts/bounties-grants--hackathons.md`).
 *
 * So every rule below carries a `provenance` field, and the honest value for the
 * repository-policy rules is `generic`: they match a *shape* of sentence, and
 * they are attributed to nobody. No policy text in this file is presented as a
 * quotation from a named repository, because the sweep never rendered one.
 *
 * ── Which way the errors go, on purpose ──
 *
 * A false `forbidden` costs one skipped bounty. A false `allowed` costs a
 * constitution violation and, per the line's own kill criterion, the line itself
 * ("one maintainer asking us to stop ... kills the line immediately and
 * permanently"). The patterns are therefore biased toward over-detecting bans,
 * and `policy.test.ts` documents the known conservative false positive rather
 * than hiding it.
 */

/** The documents a caller can supply. Named for the files they come from. */
export type PolicyDocument = "contributing" | "codeOfConduct" | "pullRequestTemplate" | "readme" | "issueText";

export interface RepoPolicyTexts {
  contributing?: string;
  codeOfConduct?: string;
  pullRequestTemplate?: string;
  readme?: string;
  issueText?: string;
}

export type PolicyVerdict = "allowed" | "disclose" | "forbidden" | "unknown";

export type PolicySignal = "ban" | "disclosure-required" | "explicit-permission";

/**
 * Where a phrasing comes from.
 *  - `rendered` — a sweep file fetched the page and quoted it.
 *  - `snippet`  — a sweep file quotes a search-result summary it could not open.
 *  - `generic`  — a sentence shape this filter recognises, attributed to nobody.
 */
export type PolicyProvenance = "rendered" | "snippet" | "generic";

export interface PolicyRule {
  id: string;
  signal: PolicySignal;
  /** What the rule is looking for, in words a director can argue with. */
  what: string;
  pattern: RegExp;
  provenance: PolicyProvenance;
  /** Named only where the phrasing was actually quoted by a sweep file. */
  source?: string;
}

export interface PolicyReason {
  ruleId: string;
  signal: PolicySignal;
  document: PolicyDocument;
  /** The phrase that matched, exactly as it appears in the caller's input. */
  matched: string;
  /** The sentence containing it, quoted from the caller's input. */
  quote: string;
  what: string;
  provenance: PolicyProvenance;
  source?: string;
}

export interface RepoPolicyAssessment {
  verdict: PolicyVerdict;
  reasons: PolicyReason[];
  /** Which documents the caller actually supplied. An empty list is why `unknown` happens. */
  documentsRead: PolicyDocument[];
  /** What the colony does about it. `unknown` collapses into `attempt-with-disclosure`. */
  effective: EffectiveAction;
  summary: string;
}

export type EffectiveAction = "attempt-with-disclosure" | "do-not-attempt";

// ── Phrase fragments ─────────────────────────────────────────────────────────
//
// Every ban rule needs BOTH a prohibition token AND an AI-*authorship* phrase.
// The bare token "AI" never triggers anything, which is what makes a repository
// called "AI Toolkit" or a README full of "OpenAI" safe from this filter by
// construction rather than by an exception list.

/** "AI-generated", "LLM-written", "ChatGPT-assisted", "machine-generated", "AI slop". */
const AI_AUTHORSHIP = String.raw`(?:a\.?i\.?|llms?|gen[\s-]?ai|generative\s+ai|artificial\s+intelligence|chat\s?gpt|gpt(?:-?\d+(?:\.\d+)?)?|copilot|claude|cursor|codex|machine|bot)[\s-]?(?:generated|authored|assisted|assistance|written|produced|created|slop)`;

/** "written by an LLM", "generated entirely by a machine", "authored by a bot". */
const AI_BY = String.raw`(?:generated|authored|written|produced|created|drafted)\s+(?:entirely\s+|solely\s+|partly\s+|in\s+part\s+)?by\s+(?:an?\s+|the\s+|any\s+)?(?:a\.?i\.?|llms?|large\s+language\s+models?|language\s+models?|chat\s?gpt|copilot|claude|gpt(?:-?\d+)?|bots?|machines?|generative\s+ai|artificial\s+intelligence)`;

/** "use of AI", "using an LLM", "relied on ChatGPT". */
const AI_USE = String.raw`(?:use\s+of|usage\s+of|using|used|employ(?:ing|ed)?|rely(?:ing)?\s+on|relied\s+on)\s+(?:an?\s+|any\s+|the\s+)?(?:a\.?i\.?|llms?|chat\s?gpt|copilot|claude|generative\s+ai|artificial\s+intelligence)\b`;

/**
 * "AI tools", "artificial intelligence assistants".
 *
 * Used in the AFTER direction only. "There are no AI tools in this list yet" is
 * an ordinary innocent sentence, and matching it in the BEFORE direction would
 * ban a repository for describing itself.
 */
const AI_TOOLING = String.raw`(?:a\.?i\.?|llms?|generative\s+ai|artificial\s+intelligence)\s+(?:coding\s+)?(?:tools?|assistants?|agents?|models?)`;

/** Automated / scripted submission, the HackerOne shape. */
const AUTOMATED_SUBMISSION = String.raw`(?:automated|automatic|scripted|bot|machine)[\s-]?(?:delivery|submissions?|pull\s+requests?|prs?|reports?|contributions?|patches?)`;

const PROHIBIT_BEFORE = String.raw`(?:\bno\b|\bnot\b|\bnever\b|\bdon'?t\b|\bdo\s+not\b|\bdoes\s+not\b|\bdoesn'?t\b|\bwon'?t\b|\bwill\s+not\b|\bcannot\b|\bcan'?t\b|\brefuse[sd]?\b|\breject(?:s|ed|ing)?\b|\bprohibit(?:s|ed|ing)?\b|\bforbid(?:s|den|ding)?\b|\bban(?:s|ned|ning)?\b|\bdisallow(?:s|ed|ing)?\b|\bdecline[sd]?\b|\bunwelcome\b)`;

const PROHIBIT_AFTER = String.raw`(?:(?:are|is|will\s+be|shall\s+be|get)\s+)?(?:not\s+(?:accepted|allowed|permitted|welcome|tolerated|reviewed|merged|considered)|prohibited|forbidden|banned|rejected|declined|unwelcome|unacceptable|closed(?:\s+without\s+review)?|automatically\s+closed)`;

/** Between the two halves of a rule: same sentence only. */
const GAP = String.raw`[^.!?\n]{0,90}?`;

/** "must be written by a human", "only human-authored contributions". */
const HUMAN_REQUIRED = [
  String.raw`(?:must|shall|has\s+to|have\s+to|are\s+required\s+to|is\s+required\s+to|only)\s+(?:be\s+)?${GAP}(?:written|authored|created|produced|coded|implemented)\s+(?:entirely\s+|solely\s+|exclusively\s+)?by\s+(?:a\s+|real\s+)?humans?`,
  String.raw`humans?[\s-]?(?:written|authored|made)\s+(?:code|contributions?|pull\s+requests?|prs?|patches?)\s+only`,
  String.raw`only\s+humans?[\s-]?(?:written|authored|made)\s+(?:code|contributions?|pull\s+requests?|prs?|patches?)`,
].join("|");

const DISCLOSE_VERB = String.raw`(?:disclose[sd]?|disclosure|declare[sd]?|state[sd]?|indicate[sd]?|mention(?:ed)?|acknowledge[sd]?|flag(?:ged)?|note[sd]?|tell\s+us|let\s+us\s+know|say\s+so|make\s+(?:it|this)\s+clear|be\s+(?:up[\s-]?front|transparent|explicit))`;

const PERMIT_VERB = String.raw`(?:welcome[sd]?|allowed?|permitted?|accepted?|encouraged?|fine|okay|ok)`;

/**
 * Double negatives. "AI-generated code is not prohibited" is a permission, and a
 * ban rule that reads it as a ban would be exactly the confident misreading
 * `systematic-debugging` exists to stop.
 */
const NEGATED_BAN = /\bnot\s+(?:prohibited|forbidden|banned|disallowed|unwelcome|unacceptable|rejected|discouraged)\b/i;

/** "AI-assisted PRs are not welcome" must not read as a permission. */
const NEGATED_PERMISSION = /\bnot\s+(?:welcome|allowed|permitted|accepted|encouraged|fine|okay|ok)\b/i;

const re = (body: string): RegExp => new RegExp(body, "gi");

/**
 * The rule table.
 *
 * Read it as the filter's whole opinion: nothing outside this list can change a
 * verdict, so an auditor can disagree with the line rather than with the code.
 */
export const POLICY_RULES: PolicyRule[] = [
  {
    id: "ban-ai-authorship-before",
    signal: "ban",
    what: "a prohibition word followed, in the same sentence, by an AI-authorship phrase",
    pattern: re(`${PROHIBIT_BEFORE}${GAP}(?:${AI_AUTHORSHIP}|${AI_BY}|${AI_USE})`),
    provenance: "generic",
  },
  {
    id: "ban-ai-authorship-after",
    signal: "ban",
    what: "an AI-authorship phrase followed, in the same sentence, by a prohibition predicate",
    pattern: re(`(?:${AI_AUTHORSHIP}|${AI_BY}|${AI_TOOLING})${GAP}${PROHIBIT_AFTER}`),
    provenance: "rendered",
    source:
      'The sentence shape is the one rendered in research/colony-sweep/scouts/bounties-grants--hackathons.md §1: "All other artificial intelligence tools are not permitted." That page is a hackathon rules page, not a repository policy — no repository CONTRIBUTING file was rendered anywhere in the sweep.',
  },
  {
    id: "ban-automated-submissions-before",
    signal: "ban",
    what: "a prohibition word followed by automated/scripted/bot submissions — the shape that closed HackerOne for this colony",
    pattern: re(`${PROHIBIT_BEFORE}${GAP}${AUTOMATED_SUBMISSION}`),
    provenance: "rendered",
    source:
      'research/colony-sweep/groups/bounties-grants.md, rejected table: HackerOne\'s misconduct policy "doesn\'t tolerate any sort of automated delivery of reports from scanners, scripts, browser automation frameworks, etc."',
  },
  {
    id: "ban-automated-submissions-after",
    signal: "ban",
    what: "automated/scripted/bot submissions followed by a prohibition predicate",
    pattern: re(`${AUTOMATED_SUBMISSION}${GAP}${PROHIBIT_AFTER}`),
    provenance: "generic",
  },
  {
    id: "ban-requires-human-authorship",
    signal: "ban",
    what: "a requirement that the contribution be written by a human — a ban stated from the other side",
    pattern: re(`(?:${HUMAN_REQUIRED})`),
    provenance: "generic",
  },
  {
    id: "ban-meaningful-human-creativity",
    signal: "ban",
    what: 'an attestation of "meaningful human creativity" — the colony cannot sign it honestly for agent-built work',
    pattern: re(String.raw`meaningful\s+human\s+creativity`),
    provenance: "snippet",
    source:
      'research/colony-sweep/scouts/bounties-grants--hackathons.md, snippet-grade: the solution "must clearly demonstrate meaningful human creativity, judgment, and engineering — AI-generated boilerplate alone does not constitute a good submission." BOARD.md §2 rules that this attestation "cannot be signed honestly for agent-built work".',
  },
  {
    id: "disclose-required-before",
    signal: "disclosure-required",
    what: "a disclosure verb followed, in the same sentence, by an AI phrase",
    pattern: re(`${DISCLOSE_VERB}${GAP}(?:${AI_AUTHORSHIP}|${AI_BY}|${AI_USE}|${AI_TOOLING})`),
    provenance: "generic",
  },
  {
    id: "disclose-required-after",
    signal: "disclosure-required",
    what: "an AI phrase followed, in the same sentence, by a disclosure verb",
    pattern: re(`(?:${AI_AUTHORSHIP}|${AI_BY}|${AI_USE}|${AI_TOOLING})${GAP}${DISCLOSE_VERB}`),
    provenance: "generic",
  },
  {
    id: "permission-explicit-after",
    signal: "explicit-permission",
    what: "an AI phrase the policy explicitly welcomes, allows or permits",
    pattern: re(`(?:${AI_AUTHORSHIP}|${AI_BY}|${AI_TOOLING})${GAP}(?:are|is)?\\s*${PERMIT_VERB}\\b`),
    provenance: "generic",
  },
  {
    id: "permission-explicit-before",
    signal: "explicit-permission",
    what: "the policy saying it accepts or welcomes AI-assisted contributions",
    pattern: re(`\\bwe\\s+(?:accept|welcome|allow|permit|encourage)\\b${GAP}(?:${AI_AUTHORSHIP}|${AI_BY}|${AI_TOOLING})`),
    provenance: "generic",
  },
];

const DOCUMENT_ORDER: PolicyDocument[] = ["contributing", "codeOfConduct", "pullRequestTemplate", "readme", "issueText"];

/** The sentence containing `index`, collapsed and capped, quoted from the input. */
function sentenceAround(text: string, index: number, length: number): string {
  let start = index;
  while (start > 0 && !".!?\n".includes(text[start - 1] as string)) start -= 1;
  let end = index + length;
  while (end < text.length && !".!?\n".includes(text[end] as string)) end += 1;
  if (end < text.length && ".!?".includes(text[end] as string)) end += 1;
  const quote = text.slice(start, end).replace(/\s+/g, " ").trim();
  return quote.length > 240 ? `${quote.slice(0, 237)}...` : quote;
}

/**
 * Read a repository's own contribution policy and say what the colony may do.
 *
 * Pure: the caller fetches the files, this decides. `unknown` is honest output
 * rather than a placeholder — see `effective`, which maps it to disclosure.
 */
export function assessRepoPolicy(texts: RepoPolicyTexts, rules: PolicyRule[] = POLICY_RULES): RepoPolicyAssessment {
  const documentsRead = DOCUMENT_ORDER.filter((d) => typeof texts[d] === "string" && texts[d]!.trim().length > 0);
  const reasons: PolicyReason[] = [];

  for (const document of documentsRead) {
    const text = texts[document] as string;
    for (const rule of rules) {
      for (const m of text.matchAll(rule.pattern)) {
        const matched = m[0];
        if (typeof m.index !== "number") continue;
        if (rule.signal === "ban" && NEGATED_BAN.test(matched)) continue;
        if (rule.signal === "explicit-permission" && NEGATED_PERMISSION.test(matched)) continue;
        reasons.push({
          ruleId: rule.id,
          signal: rule.signal,
          document,
          matched: matched.replace(/\s+/g, " ").trim(),
          quote: sentenceAround(text, m.index, matched.length),
          what: rule.what,
          provenance: rule.provenance,
          ...(rule.source ? { source: rule.source } : {}),
        });
      }
    }
  }

  const bans = reasons.filter((r) => r.signal === "ban");
  const disclosures = reasons.filter((r) => r.signal === "disclosure-required");
  const permissions = reasons.filter((r) => r.signal === "explicit-permission");

  // Precedence, and it is deliberately one-directional: a ban anywhere wins over
  // a permission anywhere. A policy that says both is a policy we do not
  // understand, and the mandate's answer to not understanding is to walk away.
  let verdict: PolicyVerdict;
  let summary: string;
  if (bans.length > 0) {
    verdict = "forbidden";
    summary = `${bans.length} ban signal${bans.length === 1 ? "" : "s"} found in ${[...new Set(bans.map((b) => b.document))].join(", ")}. The colony does not attempt bounties in this repository.`;
  } else if (disclosures.length > 0) {
    verdict = "disclose";
    summary = `The policy requires AI use to be disclosed (${[...new Set(disclosures.map((d) => d.document))].join(", ")}). The colony discloses on every pull request anyway.`;
  } else if (permissions.length > 0) {
    verdict = "allowed";
    summary = `The policy explicitly permits AI-assisted contributions (${[...new Set(permissions.map((p) => p.document))].join(", ")}). The colony still discloses on every pull request.`;
  } else if (documentsRead.length === 0) {
    verdict = "unknown";
    summary = "No policy document was supplied. Silence is not consent: treated as `disclose`, never as `allowed`.";
  } else {
    verdict = "unknown";
    summary = `Read ${documentsRead.join(", ")} and found no AI-contribution clause either way. Silence is not consent: treated as \`disclose\`, never as \`allowed\`.`;
  }

  return { verdict, reasons, documentsRead, effective: effectiveAction(verdict), summary };
}

/**
 * The single place `unknown → disclose` is written down.
 *
 * CHIEF-AUDIT §2.1 row 6 requires "disclosed AI authorship on every PR", which
 * means the disclosure is unconditional and the only decision this verdict
 * carries is whether to attempt at all.
 */
export function effectiveAction(verdict: PolicyVerdict): EffectiveAction {
  return verdict === "forbidden" ? "do-not-attempt" : "attempt-with-disclosure";
}
