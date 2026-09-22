import { describe, it, expect } from "vitest";
import { POLICY_RULES, assessRepoPolicy, effectiveAction } from "../../revenue/bounties/policy.js";

describe("repository policy — bans", () => {
  it("reads an explicit ban on AI-generated pull requests as `forbidden`", () => {
    const a = assessRepoPolicy({ contributing: "We do not accept AI-generated pull requests. Please write your own code." });
    expect(a.verdict).toBe("forbidden");
    expect(a.effective).toBe("do-not-attempt");
    expect(a.reasons[0]!.signal).toBe("ban");
    expect(a.reasons[0]!.document).toBe("contributing");
  });

  it("reads the ban stated in the other direction", () => {
    const a = assessRepoPolicy({ contributing: "AI-generated contributions are not welcome here." });
    expect(a.verdict).toBe("forbidden");
  });

  it("catches LLM, ChatGPT, Copilot and machine-generated phrasings", () => {
    for (const text of [
      "LLM-generated patches will be closed without review.",
      "Pull requests written by ChatGPT are rejected.",
      "Copilot-authored code is prohibited in this repository.",
      "We never merge machine-generated documentation.",
      "AI slop is unacceptable.",
    ]) {
      expect(assessRepoPolicy({ contributing: text }).verdict, text).toBe("forbidden");
    }
  });

  it("carries the hackathon phrasing the sweep actually rendered", () => {
    // scouts/bounties-grants--hackathons.md §1, fetched 2026-09-03:
    // "All other artificial intelligence tools are not permitted."
    const a = assessRepoPolicy({ readme: "Projects are required to utilize Google Cloud artificial intelligence tools. All other artificial intelligence tools are not permitted." });
    expect(a.verdict).toBe("forbidden");
    expect(a.reasons.some((r) => r.ruleId === "ban-ai-authorship-after")).toBe(true);
  });

  it("carries the HackerOne automated-submission phrasing the sweep quoted", () => {
    // groups/bounties-grants.md, rejected table.
    const a = assessRepoPolicy({
      codeOfConduct: "This project doesn't tolerate any sort of automated delivery of reports from scanners, scripts, browser automation frameworks, etc.",
    });
    expect(a.verdict).toBe("forbidden");
    const reason = a.reasons.find((r) => r.ruleId.startsWith("ban-automated-submissions"))!;
    expect(reason).toBeDefined();
    expect(reason.source).toMatch(/HackerOne/);
  });

  it("reads a human-authorship requirement as a ban stated from the other side", () => {
    for (const text of [
      "All contributions must be written by a human.",
      "Only human-authored pull requests are considered.",
    ]) {
      expect(assessRepoPolicy({ contributing: text }).verdict, text).toBe("forbidden");
    }
  });

  it("treats a `meaningful human creativity` attestation as a ban", () => {
    const a = assessRepoPolicy({ readme: "Submissions must clearly demonstrate meaningful human creativity, judgment, and engineering." });
    expect(a.verdict).toBe("forbidden");
    const reason = a.reasons.find((r) => r.ruleId === "ban-meaningful-human-creativity")!;
    // BOARD.md §2: it "cannot be signed honestly for agent-built work".
    expect(reason.provenance).toBe("snippet");
  });

  it("cites the input, so a director can check the verdict against the source", () => {
    const contributing = "Thanks for helping out!\nWe do not accept AI-generated pull requests, sorry.\nRun the tests before opening a PR.";
    const a = assessRepoPolicy({ contributing });
    const reason = a.reasons[0]!;
    expect(contributing).toContain(reason.matched);
    expect(reason.quote).toBe("We do not accept AI-generated pull requests, sorry.");
    expect(reason.what.length).toBeGreaterThan(20);
  });
});

describe("repository policy — false positives that must not fire", () => {
  it('does not ban a repository merely for having "AI" in its name', () => {
    const a = assessRepoPolicy({
      readme: "AI Toolkit is a collection of helpers for building with OpenAI, Anthropic and Mistral. Contributions welcome!",
      contributing: "Thanks for contributing to AI Toolkit. Please run `pnpm test` and keep PRs small. No force pushes to main.",
    });
    expect(a.verdict).toBe("unknown");
    expect(a.reasons).toEqual([]);
  });

  it('does not ban "there are no AI tools in this list yet"', () => {
    const a = assessRepoPolicy({ readme: "There are no AI tools in this list yet — send a PR if you know one." });
    expect(a.verdict).toBe("unknown");
  });

  it("does not ban a project that describes what it is not", () => {
    const a = assessRepoPolicy({ readme: "This library uses no AI, no machine learning and no network calls. It is 400 lines of plain TypeScript." });
    expect(a.verdict).toBe("unknown");
  });

  it("does not read a double negative as a ban", () => {
    const a = assessRepoPolicy({ contributing: "To be clear: AI-generated code is not prohibited here." });
    expect(a.verdict).not.toBe("forbidden");
  });

  it('does not read "AI-assisted PRs are not welcome" as a permission', () => {
    const a = assessRepoPolicy({ contributing: "AI-assisted PRs are not welcome." });
    expect(a.verdict).toBe("forbidden");
    expect(a.reasons.some((r) => r.signal === "explicit-permission")).toBe(false);
  });

  it("does not fire on ordinary contribution guidance", () => {
    const a = assessRepoPolicy({
      contributing: "Fork the repo, create a branch, add a test, and open a pull request. We do not accept breaking changes without an issue first. Be kind in review.",
      codeOfConduct: "Harassment is not tolerated. Automated moderation is in place.",
    });
    expect(a.verdict).toBe("unknown");
  });

  it("documents the one conservative false positive it does have, rather than hiding it", () => {
    // An ISSUE asking us to build a filter that rejects AI-generated images
    // trips the ban rule, because the prohibition word and the AI-authorship
    // phrase share a sentence. The failure costs one skipped bounty and can
    // never cost a violation, which is the direction the filter is biased in
    // on purpose. Recorded here so it is a known cost, not a surprise.
    const a = assessRepoPolicy({ issueText: "Add a moderation filter that rejects AI-generated images on upload." });
    expect(a.verdict).toBe("forbidden");
    expect(a.reasons[0]!.document).toBe("issueText");
  });
});

describe("repository policy — disclosure, permission and silence", () => {
  it("reads a disclosure requirement as `disclose`", () => {
    for (const text of [
      "Please disclose any use of AI tools in your pull request description.",
      "If you used AI to write this patch, say so in the PR.",
      "- [ ] I have disclosed any AI assistance used in this contribution.",
    ]) {
      const a = assessRepoPolicy({ pullRequestTemplate: text });
      expect(a.verdict, text).toBe("disclose");
      expect(a.effective).toBe("attempt-with-disclosure");
    }
  });

  it("reads an explicit permission as `allowed` — and still expects us to disclose", () => {
    const a = assessRepoPolicy({ contributing: "AI-assisted contributions are welcome, as long as you understand the code." });
    expect(a.verdict).toBe("allowed");
    expect(a.effective).toBe("attempt-with-disclosure");
    expect(a.summary).toMatch(/still discloses/);
  });

  it("lets a ban beat a permission in the same repository", () => {
    const a = assessRepoPolicy({
      readme: "AI-assisted contributions are welcome.",
      contributing: "We do not accept AI-generated pull requests.",
    });
    expect(a.verdict).toBe("forbidden");
  });

  it("lets a disclosure requirement beat a permission", () => {
    const a = assessRepoPolicy({
      readme: "AI-assisted contributions are welcome.",
      pullRequestTemplate: "Please disclose any use of AI in this PR.",
    });
    expect(a.verdict).toBe("disclose");
  });

  it("returns `unknown` on silence and treats it as disclosure, never as permission", () => {
    const silent = assessRepoPolicy({ contributing: "Run the linter. Squash your commits." });
    expect(silent.verdict).toBe("unknown");
    expect(silent.effective).toBe("attempt-with-disclosure");
    expect(silent.summary).toMatch(/Silence is not consent/);

    const nothing = assessRepoPolicy({});
    expect(nothing.verdict).toBe("unknown");
    expect(nothing.documentsRead).toEqual([]);
    expect(nothing.effective).toBe("attempt-with-disclosure");
  });

  it("records which documents it actually read", () => {
    const a = assessRepoPolicy({ contributing: "hello", readme: "   ", issueText: "world" });
    expect(a.documentsRead).toEqual(["contributing", "issueText"]);
  });

  it("maps only `forbidden` to do-not-attempt", () => {
    expect(effectiveAction("forbidden")).toBe("do-not-attempt");
    for (const v of ["allowed", "disclose", "unknown"] as const) {
      expect(effectiveAction(v)).toBe("attempt-with-disclosure");
    }
  });
});

describe("the rule table itself", () => {
  it("attributes a source to every rule that claims rendered or snippet provenance, and to no generic rule", () => {
    // "Do not invent policy text as if it were from a named repo": a rule that
    // names a source must have one, and a generic sentence shape must name none.
    for (const rule of POLICY_RULES) {
      if (rule.provenance === "generic") expect(rule.source, rule.id).toBeUndefined();
      else expect(rule.source, rule.id).toBeTruthy();
      expect(rule.what.length, rule.id).toBeGreaterThan(20);
      expect(rule.pattern.flags, rule.id).toContain("g");
      expect(rule.pattern.flags, rule.id).toContain("i");
    }
  });

  it("has unique rule ids", () => {
    const ids = POLICY_RULES.map((r) => r.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
