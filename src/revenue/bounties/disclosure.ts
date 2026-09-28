/**
 * Revenue Colony — Algora OSS bounties, build #2, stage 3: the pull request body.
 *
 * Every pull request this line opens carries the same four things, and each one
 * is a ruling rather than a style choice:
 *
 *  1. **A plain AI-authorship disclosure.** CHIEF-AUDIT §2.1 row 6 and BOARD.md
 *     build #2 both require "disclosed AI authorship on every PR" — unconditional,
 *     regardless of what the repository's policy says, including when it says
 *     nothing. MISSION rule 4: nothing that deceives anybody, and a maintainer
 *     reviewing agent-written code without being told is being deceived.
 *  2. **What changed and how it was tested.** A claim is a claim about correctness.
 *  3. **A demo recording.** `audits/bounties-grants.md` §4 calls this "a hard
 *     product requirement the report never mentions", quoting Algora's own
 *     `bot_templates.ex`: "To claim a bounty, you need to provide a short demo
 *     video of your changes in your pull request." When there is no recording yet
 *     the body carries a **placeholder that is obviously unfilled**, so that a
 *     body posted with a `/claim` and no recording is caught by
 *     `auditPullRequestBody` instead of by a maintainer. A described recording
 *     that does not exist is a fabrication and the constitution forbids it.
 *  4. **An invitation to say stop.** The line's own kill criterion is that one
 *     maintainer asking us to stop kills it "immediately and permanently". Saying
 *     so in the pull request is what makes that a promise rather than a policy
 *     nobody outside this repo can see.
 *
 * ── No owner identity, anywhere ──
 *
 * MISSION, פרסום בעילום שם: "Nothing we publish carries the owner's name,
 * username, or personal identifiers." A pull request is a published byline, which
 * is exactly why BOARD.md §5 moved this line onto a brand machine account and put
 * it in owner step 7. This module therefore writes **no personal identity at
 * all** — no handle, no email, no "built by". The only name it will print is the
 * brand, and until the brand machine account exists it prints
 * `BRAND_PLACEHOLDER`, which `auditPullRequestBody({ forClaim: true })` refuses.
 *
 * ── The /attempt comment, and what never leaves (28.9.2026) ──
 *
 * RULING-2026-09-28-bounty-rail.md §5.2 item 5: the `/attempt` comment carries the
 * same disclosure as the pull request, so a maintainer can say stop before any work
 * is done rather than after — `attemptComment()`, checked by `auditAttemptComment()`
 * against the same identity rules. Item 4: the brand account never pastes its system
 * prompt, session text, environment, tokens, working directory or resource budget
 * anywhere, whatever a template demands (UnsafeLabs/Bounty-Hunters' CONTRIBUTING asks
 * for exactly that). Both gates refuse a body carrying any of those shapes.
 */

/** Printed until the brand machine account exists (owner step 7). Deliberately ugly. */
export const BRAND_PLACEHOLDER = "{{BRAND}}";

/** The disclosure sentence. Exported so a test can assert the exact text, unchanged. */
export const AI_AUTHORSHIP_DISCLOSURE =
  "This pull request was written by an automated AI agent, not by a person. " +
  "You are being told before you review it: no part of this contribution is offered as human work.";

/** The stop invitation, and the rule behind it. */
export const MAINTAINER_STOP_INVITATION =
  "If you would rather not receive AI-authored contributions, say so once on this pull request. " +
  "We will close it, we will open nothing further on this repository, and we will not argue the point.";

/** The disclosure on an `/attempt` comment: the same facts as the PR's, said before any work is done. */
export const ATTEMPT_DISCLOSURE =
  "This attempt is made by an automated brand account, not by a person: the work will be AI-authored and agent-operated. " +
  "You are being told before any work is done, so you can say no first.";

/** The stop invitation on an `/attempt` comment. */
export const ATTEMPT_STOP_INVITATION =
  "If you would rather not receive AI-authored contributions, say so once here. " +
  "We will withdraw this attempt, we will open nothing on this repository, and we will not argue the point.";

/** The unfilled demo-recording marker. Its presence is what makes an unfilled body detectable. */
export const DEMO_VIDEO_PLACEHOLDER =
  "<!-- DEMO RECORDING REQUIRED BEFORE /claim: replace this line with the recording URL. " +
  "Never describe a recording that does not exist. -->";

export interface PullRequestBodyInput {
  /** `owner/repo` the pull request targets. */
  repo: string;
  /** The bounty issue number the `/claim` points at. */
  issueNumber: number;
  /** One or two sentences: what this changes and why. */
  summary: string;
  /** The concrete changes, one per line. */
  changes: string[];
  /** How it was verified. Commands, test names, fixtures — things a maintainer can re-run. */
  tests: string[];
  /** The recording URL. Omit or null until a recording actually exists. */
  demoVideoUrl?: string | null;
  /** The brand name. Omit until the brand machine account exists (owner step 7). */
  brand?: string;
  /** Overrides `/claim #<issueNumber>` if Algora's bot spelled it differently. */
  claimCommand?: string;
}

/**
 * Build the pull request body.
 *
 * Pure and deterministic: the same input always produces the same body, which is
 * what lets `auditPullRequestBody` be a real gate rather than a spot check.
 */
export function pullRequestBody(input: PullRequestBodyInput): string {
  const brand = (input.brand ?? "").trim() || BRAND_PLACEHOLDER;
  const claim = input.claimCommand ?? `/claim #${input.issueNumber}`;
  const demo = input.demoVideoUrl && input.demoVideoUrl.trim().length > 0 ? input.demoVideoUrl.trim() : DEMO_VIDEO_PLACEHOLDER;

  const bullets = (lines: string[], empty: string): string =>
    lines.length > 0 ? lines.map((l) => `- ${l.trim()}`).join("\n") : `- ${empty}`;

  return [
    `## What this changes`,
    ``,
    input.summary.trim(),
    ``,
    bullets(input.changes, "No change list was supplied — this body is incomplete and must not be posted."),
    ``,
    `## How it was tested`,
    ``,
    bullets(input.tests, "No verification was supplied — this body is incomplete and must not be posted."),
    ``,
    `## Demo recording`,
    ``,
    demo,
    ``,
    `## AI authorship`,
    ``,
    AI_AUTHORSHIP_DISCLOSURE,
    ``,
    MAINTAINER_STOP_INVITATION,
    ``,
    `Contributed by the ${brand} machine account. Issue: ${input.repo}#${input.issueNumber}.`,
    ``,
    claim,
    ``,
  ].join("\n");
}

export interface AttemptCommentInput {
  /** The bounty issue number the `/attempt` points at. */
  issueNumber: number;
  /** The implementation plan Algora's bot template asks for, one step per line. */
  plan: string[];
  /** The brand name. Omit until the brand machine account exists (owner step 7). */
  brand?: string;
  /** Overrides `/attempt #<issueNumber>` if Algora's bot spelled it differently. */
  attemptCommand?: string;
}

/**
 * Build the `/attempt` comment. Pure and deterministic, like `pullRequestBody`.
 * Algora's bot template: "Comment `/attempt #N` with your implementation plan".
 */
export function attemptComment(input: AttemptCommentInput): string {
  const brand = (input.brand ?? "").trim() || BRAND_PLACEHOLDER;
  const command = input.attemptCommand ?? `/attempt #${input.issueNumber}`;
  const plan = input.plan.length > 0 ? input.plan.map((l) => `- ${l.trim()}`).join("\n") : "- No plan was supplied — this comment is incomplete and must not be posted.";
  return [
    command,
    ``,
    `Plan:`,
    ``,
    plan,
    ``,
    ATTEMPT_DISCLOSURE,
    ``,
    ATTEMPT_STOP_INVITATION,
    ``,
    `Posted by the ${brand} machine account.`,
    ``,
  ].join("\n");
}

export interface PullRequestAuditOptions {
  /**
   * Personal identifiers that must never appear. Supplied by the caller, never
   * stored here — writing the owner's name into this repository to check that it
   * is absent from a pull request would be the leak it is meant to prevent.
   */
  ownerIdentifiers?: string[];
  /** GitHub handles the body is allowed to mention. Empty by default: a byline is what the mandate forbids. */
  allowHandles?: string[];
  /** True when the body is about to be posted with a `/claim`. Tightens the recording and brand checks. */
  forClaim?: boolean;
}

export interface PullRequestAudit {
  ok: boolean;
  problems: string[];
}

/** An @mention anywhere in the body. A byline is exactly what MISSION forbids. */
const MENTION = /(?:^|[\s([{,])@([A-Za-z0-9][A-Za-z0-9-]{0,38})/g;
const EMAIL = /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g;

/**
 * Session material that never leaves (RULING-2026-09-28-bounty-rail.md §5.2 item 4): a system prompt or session text,
 * a token or secret, an environment dump, a working or home directory, a resource budget.
 */
export const SESSION_LEAK_PATTERNS: { id: string; pattern: RegExp }[] = [
  { id: "system-prompt", pattern: /\b(?:(?:my|our|the\s+agent'?s|its)\s+system\s+prompt|session\s+initiali[sz]ation\s+text)\b/i },
  { id: "token", pattern: /\b(?:gh[pousr]_[A-Za-z0-9]{20,}|github_pat_[A-Za-z0-9_]{20,}|sk-(?:ant-)?[A-Za-z0-9_-]{20,})/ },
  { id: "secret-assignment", pattern: /\b[A-Z][A-Z0-9_]*(?:TOKEN|KEY|SECRET|PASSWORD)\s*[=:]\s*\S{8,}/ },
  { id: "home-or-workdir", pattern: /(?:^|[\s:=("'`])(?:\/home\/[\w.-]+|\/root(?:\/|\b)|\/Users\/[\w.-]+)/m },
  { id: "resource-budget", pattern: /\btokens?\s+(?:used|remaining)\b/i },
];

function sessionLeakProblems(body: string): string[] {
  return SESSION_LEAK_PATTERNS.filter(({ pattern }) => pattern.test(body)).map(
    ({ id }) => `The body carries session material (${id}). The brand account never pastes its system prompt, session text, environment, tokens, working directory or resource budget anywhere (RULING-2026-09-28-bounty-rail.md §5.2 item 4).`,
  );
}

/** The identity rules both gates share: no owner identifier, no @mention, no email, no byline. */
function identityProblems(body: string, options: PullRequestAuditOptions): string[] {
  const problems: string[] = [];
  const allow = new Set((options.allowHandles ?? []).map((h) => h.replace(/^@/, "").toLowerCase()));
  for (const identifier of options.ownerIdentifiers ?? []) {
    const needle = identifier.trim();
    if (needle.length > 0 && body.toLowerCase().includes(needle.toLowerCase())) {
      problems.push(`The body contains an owner identifier. MISSION: nothing we publish carries the owner's name, username or personal identifiers.`);
    }
  }
  for (const m of body.matchAll(MENTION)) {
    const handle = (m[1] ?? "").toLowerCase();
    if (!allow.has(handle)) problems.push(`The body mentions @${m[1]}. A pull request is a published byline; the mandate allows the brand and nothing else.`);
  }
  for (const m of body.matchAll(EMAIL)) {
    problems.push(`The body contains an email address (${m[0]}). No support address, no personal contact details.`);
  }
  for (const { id, pattern } of FORBIDDEN_BYLINE_PATTERNS) {
    if (pattern.test(body)) problems.push(`The body carries a byline shape (${id}). MISSION forbids "built by" lines entirely.`);
  }
  return problems;
}

/** "built by", "authored by X", "— Name". The shapes a byline takes. */
export const FORBIDDEN_BYLINE_PATTERNS: { id: string; pattern: RegExp }[] = [
  { id: "built-by", pattern: /\b(?:built|made|created|developed|authored|written|submitted)\s+by\s+(?!(?:an?\s+)?(?:automated|ai\b|agent))/i },
  { id: "signed-off-personal", pattern: /^signed-off-by:/im },
  { id: "co-authored-by", pattern: /^co-authored-by:/im },
  { id: "contact-me", pattern: /\b(?:contact\s+me|email\s+me|reach\s+me\s+at|my\s+(?:site|website|blog|portfolio))\b/i },
];

/**
 * Check a pull request body against the invariants before it is posted.
 *
 * This is the `verification-before-completion` gate for this line: the failure
 * mode this repo actually has is a confident claim nobody checked, and "the PR
 * discloses AI authorship" is precisely that kind of claim.
 */
export function auditPullRequestBody(body: string, options: PullRequestAuditOptions = {}): PullRequestAudit {
  const problems: string[] = [];

  if (!body.includes(AI_AUTHORSHIP_DISCLOSURE)) {
    problems.push("The AI-authorship disclosure sentence is missing or altered. CHIEF-AUDIT §2.1 row 6 requires it on every PR, verbatim.");
  }
  if (!body.includes(MAINTAINER_STOP_INVITATION)) {
    problems.push("The stop invitation is missing or altered. The line's kill criterion is that one maintainer request ends it permanently; the PR has to say so.");
  }
  if (!/\/claim\s+#\d+/.test(body)) {
    problems.push("No `/claim #N` command. Algora's own bot_templates.ex says the claim goes in the PR body.");
  }
  if (!/##\s*How it was tested/i.test(body)) {
    problems.push("No verification section. A claim is a claim about correctness.");
  }

  if (body.includes(DEMO_VIDEO_PLACEHOLDER)) {
    problems.push(
      options.forClaim
        ? "The demo-recording placeholder is still unfilled and this body is being posted with a claim. Algora requires a short demo video per claim; describing a recording that does not exist is a fabrication."
        : "The demo-recording placeholder is unfilled. Record before claiming.",
    );
  }
  if (options.forClaim && body.includes(BRAND_PLACEHOLDER)) {
    problems.push(`The brand placeholder ${BRAND_PLACEHOLDER} is unfilled. The brand machine account is owner step 7 and no PR leaves before it exists.`);
  }

  problems.push(...identityProblems(body, options), ...sessionLeakProblems(body));
  return { ok: problems.length === 0, problems };
}

/**
 * The same gate for an `/attempt` comment (§5.2 item 5): its disclosure, its stop invitation, its command, the brand
 * filled in — an attempt is always about to be posted — and every identity and session rule a PR body obeys.
 */
export function auditAttemptComment(body: string, options: Omit<PullRequestAuditOptions, "forClaim"> = {}): PullRequestAudit {
  const problems: string[] = [];
  if (!body.includes(ATTEMPT_DISCLOSURE)) {
    problems.push("The /attempt disclosure is missing or altered. The attempt must say, before any work, that an automated brand account is attempting and the work will be AI-authored (RULING-2026-09-28-bounty-rail.md §5.2 item 5).");
  }
  if (!body.includes(ATTEMPT_STOP_INVITATION)) {
    problems.push("The stop invitation is missing or altered. A maintainer must be able to say stop before any work is done.");
  }
  if (!/\/attempt\s+#\d+/.test(body)) {
    problems.push("No `/attempt #N` command. Algora's bot template asks for it with the implementation plan.");
  }
  if (body.includes(BRAND_PLACEHOLDER)) {
    problems.push(`The brand placeholder ${BRAND_PLACEHOLDER} is unfilled. The brand machine account is owner step 7 and nothing is posted before it exists.`);
  }
  problems.push(...identityProblems(body, options), ...sessionLeakProblems(body));
  return { ok: problems.length === 0, problems };
}
