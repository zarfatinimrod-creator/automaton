import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";

/**
 * The weak link in the chain of command is not the research — it is the step
 * after it. Three audits were found this session sitting on disk unread, and
 * each one overturned something the owner-facing docs were still asserting:
 * payment rails "not the bottleneck", risk-governance's three candidates, and
 * the acquisition constraint that invalidates every ceiling in the repo.
 *
 * An auditor's report that nothing reads is worse than no auditor, because the
 * colony gets to believe it has one. This test is the mechanism that makes the
 * fold-in step mandatory: an audit lands, and the build stays red until
 * something in docs/ has actually taken a position on it.
 */
const repoRoot = path.resolve(__dirname, "../../..");
const auditsDir = path.join(repoRoot, "research/colony-sweep/audits");
const docsDir = path.join(repoRoot, "docs");

function docsCorpus(): string {
  return fs
    .readdirSync(docsDir)
    .filter((f) => f.endsWith(".md"))
    .map((f) => fs.readFileSync(path.join(docsDir, f), "utf-8"))
    .join("\n")
    .concat(fs.readFileSync(path.join(repoRoot, "MISSION.md"), "utf-8"));
}

describe("every audit has been folded into the docs", () => {
  const audits = fs.existsSync(auditsDir)
    ? fs.readdirSync(auditsDir).filter((f) => f.endsWith(".md"))
    : [];

  it("finds audits to check", () => {
    // If the directory empties or moves, this test would pass vacuously and
    // stop protecting anything.
    expect(audits.length).toBeGreaterThan(0);
  });

  it.each(audits)("%s is referenced from docs/ or MISSION.md", (file) => {
    const group = file.replace(/\.md$/, "");
    const corpus = docsCorpus();
    // The reference must be the audit's own path. Matching the group name
    // instead makes this test vacuous: docs/CRITERIA_SWEEP.md lists all fifteen
    // group ids, so every audit would look folded in the moment it was written.
    // Verified by planting a fake audit — the loose check passed it, this one
    // does not.
    const referenced = corpus.includes(`audits/${file}`);
    expect(
      referenced,
      `The audit for "${group}" is on disk and nothing in docs/ or MISSION.md mentions it. ` +
        `Read research/colony-sweep/audits/${file} and record what it changed — a rejection in ` +
        `docs/REJECTED.md, a corrected number in docs/INCOME_PLAN.he.md, or a constraint in ` +
        `MISSION.md. If it changed nothing, say that in docs/REJECTED.md and why.`,
    ).toBe(true);
  });
});
