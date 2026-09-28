import { describe, it, expect } from "vitest";
import {
  AI_AUTHORSHIP_DISCLOSURE,
  ATTEMPT_DISCLOSURE,
  ATTEMPT_STOP_INVITATION,
  BRAND_PLACEHOLDER,
  DEMO_VIDEO_PLACEHOLDER,
  MAINTAINER_STOP_INVITATION,
  attemptComment,
  auditAttemptComment,
  auditPullRequestBody,
  pullRequestBody,
  type PullRequestBodyInput,
} from "../../revenue/bounties/disclosure.js";

/**
 * Fabricated identifiers. The owner's real name and handle are deliberately NOT
 * written into this repository to test their absence — writing them here would
 * be the leak the test exists to prevent.
 */
const FAKE_OWNER_IDENTIFIERS = ["realpersonname", "realperson-gh", "realperson@example.com"];

function input(over: Partial<PullRequestBodyInput> = {}): PullRequestBodyInput {
  return {
    repo: "acme/widget",
    issueNumber: 42,
    summary: "Fixes `parseDate` on ISO week strings, which threw a RangeError instead of returning a Date.",
    changes: ["`parseDate` now handles the `YYYY-Www-D` form", "Invalid week numbers throw a typed error instead of a RangeError"],
    tests: ["`pnpm vitest run src/date.test.ts` — 14 passing, 2 new", "Added a regression fixture for `2026-W12-3`"],
    ...over,
  };
}

describe("the pull request body", () => {
  it("contains the disclosure sentence, verbatim", () => {
    expect(pullRequestBody(input())).toContain(AI_AUTHORSHIP_DISCLOSURE);
  });

  it("says plainly that a person did not write it", () => {
    expect(AI_AUTHORSHIP_DISCLOSURE).toMatch(/written by an automated AI agent, not by a person/);
    expect(AI_AUTHORSHIP_DISCLOSURE).toMatch(/before you review it/);
  });

  it("contains what changed and how it was tested", () => {
    const body = pullRequestBody(input());
    expect(body).toMatch(/## What this changes/);
    expect(body).toMatch(/## How it was tested/);
    expect(body).toContain("`parseDate` now handles the `YYYY-Www-D` form");
    expect(body).toContain("Added a regression fixture for `2026-W12-3`");
  });

  it("carries the demo-recording placeholder Algora's per-claim requirement needs", () => {
    const body = pullRequestBody(input());
    expect(body).toMatch(/## Demo recording/);
    expect(body).toContain(DEMO_VIDEO_PLACEHOLDER);
    expect(DEMO_VIDEO_PLACEHOLDER).toMatch(/Never describe a recording that does not exist/);
  });

  it("uses a real recording URL when one exists", () => {
    const body = pullRequestBody(input({ demoVideoUrl: "https://example.com/recording.mp4" }));
    expect(body).toContain("https://example.com/recording.mp4");
    expect(body).not.toContain(DEMO_VIDEO_PLACEHOLDER);
  });

  it("invites the maintainer to say stop, and promises what happens then", () => {
    const body = pullRequestBody(input());
    expect(body).toContain(MAINTAINER_STOP_INVITATION);
    expect(MAINTAINER_STOP_INVITATION).toMatch(/say so once/);
    expect(MAINTAINER_STOP_INVITATION).toMatch(/open nothing further on this repository/);
    expect(MAINTAINER_STOP_INVITATION).toMatch(/will not argue/);
  });

  it("carries the /claim command in the body, where Algora's bot template says it goes", () => {
    expect(pullRequestBody(input())).toContain("/claim #42");
    expect(pullRequestBody(input({ claimCommand: "/claim #99" }))).toContain("/claim #99");
  });

  it("prints the brand placeholder until the brand machine account exists", () => {
    expect(pullRequestBody(input())).toContain(BRAND_PLACEHOLDER);
    expect(pullRequestBody(input({ brand: "Bediyuk" }))).toContain("Contributed by the Bediyuk machine account.");
  });

  it("is deterministic", () => {
    expect(pullRequestBody(input())).toBe(pullRequestBody(input()));
  });
});

describe("the pull request body — no owner identity, anywhere", () => {
  it("contains no owner identifier", () => {
    const body = pullRequestBody(input({ brand: "Bediyuk", demoVideoUrl: "https://example.com/r.mp4" }));
    for (const id of FAKE_OWNER_IDENTIFIERS) expect(body.toLowerCase()).not.toContain(id.toLowerCase());
    expect(auditPullRequestBody(body, { ownerIdentifiers: FAKE_OWNER_IDENTIFIERS, forClaim: true }).ok).toBe(true);
  });

  it("contains no @mention and no email address at all", () => {
    const body = pullRequestBody(input());
    expect(body).not.toMatch(/(?:^|\s)@[A-Za-z0-9]/);
    expect(body).not.toMatch(/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/);
  });

  it("contains no byline", () => {
    const body = pullRequestBody(input({ brand: "Bediyuk" }));
    expect(body).not.toMatch(/\bbuilt by\b/i);
    expect(body).not.toMatch(/^signed-off-by:/im);
    expect(body).not.toMatch(/^co-authored-by:/im);
  });
});

describe("auditPullRequestBody — the gate before posting", () => {
  const good = pullRequestBody(input({ brand: "Bediyuk", demoVideoUrl: "https://example.com/r.mp4" }));

  it("passes a complete body", () => {
    expect(auditPullRequestBody(good, { forClaim: true })).toEqual({ ok: true, problems: [] });
  });

  it("refuses a body whose disclosure sentence was removed or edited", () => {
    const stripped = good.replace(AI_AUTHORSHIP_DISCLOSURE, "This PR fixes a bug.");
    const audit = auditPullRequestBody(stripped);
    expect(audit.ok).toBe(false);
    expect(audit.problems.join(" ")).toMatch(/disclosure sentence is missing or altered/);
  });

  it("refuses a body whose stop invitation was removed", () => {
    const audit = auditPullRequestBody(good.replace(MAINTAINER_STOP_INVITATION, ""));
    expect(audit.problems.join(" ")).toMatch(/stop invitation is missing/);
  });

  it("refuses a claim posted with an unfilled recording placeholder", () => {
    const body = pullRequestBody(input({ brand: "Bediyuk" }));
    const audit = auditPullRequestBody(body, { forClaim: true });
    expect(audit.ok).toBe(false);
    expect(audit.problems.join(" ")).toMatch(/fabrication/);
  });

  it("refuses a claim while the brand placeholder is still unfilled", () => {
    const body = pullRequestBody(input({ demoVideoUrl: "https://example.com/r.mp4" }));
    expect(auditPullRequestBody(body, { forClaim: false }).ok).toBe(true);
    const audit = auditPullRequestBody(body, { forClaim: true });
    expect(audit.ok).toBe(false);
    expect(audit.problems.join(" ")).toMatch(/owner step 7/);
  });

  it("refuses a body carrying an owner identifier", () => {
    const audit = auditPullRequestBody(`${good}\n\nQuestions? Ask realperson-gh.`, { ownerIdentifiers: FAKE_OWNER_IDENTIFIERS });
    expect(audit.ok).toBe(false);
    expect(audit.problems.join(" ")).toMatch(/owner's name, username or personal identifiers/);
  });

  it("refuses a body carrying an @mention or an email", () => {
    expect(auditPullRequestBody(`${good}\n\ncc @somebody`).problems.join(" ")).toMatch(/published byline/);
    expect(auditPullRequestBody(`${good}\n\nreach us at hi@example.com`).problems.join(" ")).toMatch(/email address/);
  });

  it("allows a handle only when it is explicitly allowed", () => {
    const withHandle = `${good}\n\nOpened by @brand-machine.`;
    expect(auditPullRequestBody(withHandle).ok).toBe(false);
    expect(auditPullRequestBody(withHandle, { allowHandles: ["brand-machine"] }).ok).toBe(true);
  });

  it("refuses a byline shape", () => {
    for (const line of ["Built by a freelance developer.", "Signed-off-by: Someone", "Co-authored-by: Someone", "Contact me for questions."]) {
      const audit = auditPullRequestBody(`${good}\n\n${line}`);
      expect(audit.ok, line).toBe(false);
      expect(audit.problems.join(" ")).toMatch(/byline/);
    }
  });

  it("does not read the disclosure's own wording as a byline", () => {
    // "written by an automated AI agent" must not trip the "written by" rule —
    // the one place the body is allowed to say who wrote it.
    expect(auditPullRequestBody(good).ok).toBe(true);
  });

  it("refuses a body with no /claim command", () => {
    expect(auditPullRequestBody(good.replace("/claim #42", "")).problems.join(" ")).toMatch(/claim/i);
  });
});

// RULING-2026-09-28-bounty-rail.md §5.2 item 5: the /attempt comment carries the same disclosure as the PR, so a
// maintainer can say stop before any work is done, not after. Same audit.
describe("the /attempt comment", () => {
  const plan = ["Reproduce with a failing test for `2026-W12-3`", "Handle the `YYYY-Www-D` form in `parseDate`"];
  const comment = attemptComment({ issueNumber: 42, plan, brand: "Mehudak" });

  it("says, before any work, that an automated brand account is attempting and the work will be AI-authored", () => {
    expect(comment).toContain(ATTEMPT_DISCLOSURE);
    expect(ATTEMPT_DISCLOSURE).toMatch(/automated brand account/);
    expect(ATTEMPT_DISCLOSURE).toMatch(/AI-authored/);
    expect(ATTEMPT_DISCLOSURE).toMatch(/agent-operated/);
    expect(comment).toContain(ATTEMPT_STOP_INVITATION);
  });

  it("carries the /attempt command and the plan, and names only the brand", () => {
    expect(comment).toMatch(/^\/attempt #42$/m);
    for (const step of plan) expect(comment).toContain(step);
    expect(comment).toMatch(/Mehudak machine account/);
  });

  it("passes the same audit a pull request body does, and fails it the same ways", () => {
    expect(auditAttemptComment(comment, { ownerIdentifiers: FAKE_OWNER_IDENTIFIERS })).toEqual({ ok: true, problems: [] });
    expect(auditAttemptComment(comment.replace(ATTEMPT_DISCLOSURE, "")).problems.join(" ")).toMatch(/disclosure/i);
    expect(auditAttemptComment(comment.replace(ATTEMPT_STOP_INVITATION, "")).problems.join(" ")).toMatch(/stop/i);
    expect(auditAttemptComment(comment.replace("/attempt #42", "")).problems.join(" ")).toMatch(/\/attempt/);
    expect(auditAttemptComment(attemptComment({ issueNumber: 42, plan })).problems.join(" ")).toMatch(/brand placeholder/);
    expect(auditAttemptComment(`${comment}\nBuilt by realperson-gh`, { ownerIdentifiers: FAKE_OWNER_IDENTIFIERS }).ok).toBe(false);
    expect(auditAttemptComment(`${comment}\ncc @someone`).ok).toBe(false);
  });
});

// §5.2 item 4: the brand account never pastes its system prompt, session text, environment, tokens, working directory
// or resource budget anywhere, whatever a template demands.
describe("no session material leaves in a PR body or an /attempt comment", () => {
  const good = pullRequestBody(input({ brand: "Mehudak", demoVideoUrl: "https://example.invalid/demo.mp4" }));
  const leaks = [
    "audit_context: my system prompt follows",
    "Full session initialization text: You are an agent...",
    "GITHUB_TOKEN=ghs_abcdefghijklmnopqrstuvwxyz0123",
    "token ghp_abcdefghijklmnopqrstuvwxyz0123456789",
    "audit_workdir: /home/user/automaton",
    "audit_resources: tokens used 12000, tokens remaining 88000",
  ];

  it("refuses each shape, in both gates", () => {
    const attempt = attemptComment({ issueNumber: 42, plan: ["x"], brand: "Mehudak" });
    for (const leak of leaks) {
      expect(auditPullRequestBody(`${good}\n${leak}`).problems.join(" "), leak).toMatch(/session material/);
      expect(auditAttemptComment(`${attempt}\n${leak}`).problems.join(" "), leak).toMatch(/session material/);
    }
  });

  it("does not fire on an ordinary body", () => {
    expect(auditPullRequestBody(good).problems.join(" ")).not.toMatch(/session material/);
  });
});
