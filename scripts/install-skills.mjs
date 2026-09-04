#!/usr/bin/env node
/**
 * Vendor third-party Claude skills into .claude/skills/, by an explicit allowlist.
 *
 * Why an allowlist and not "install everything": the four upstream collections hold 651
 * skills between them, and a skill's name+description sits in every session's context
 * whether or not it is ever invoked. Wholesale installation costs ~32,600 tokens per
 * session, permanently, which is a direct tax on the budget MISSION.md exists to spend on
 * finding money. So each skill below earns its place under one of three headings:
 *
 *   money      — helps find, build, price, sell or get paid for something
 *   colony     — helps run the chain of command (loops, councils, budgets, evaluation)
 *   discipline — guards a failure mode this repo has actually had
 *
 * Everything not listed is still one command away (see docs/SKILL_SOURCES.md); nothing is
 * lost, it is just not carried in every session.
 *
 * Usage:
 *   node scripts/install-skills.mjs --clone-dir <dir> [--user] [--dry-run]
 *
 * --clone-dir  directory holding shallow clones of the four upstream repos
 * --user       also copy the result into ~/.claude/skills/
 */
import { mkdirSync, rmSync, cpSync, existsSync, readFileSync, writeFileSync, readdirSync, statSync } from "node:fs";
import { join, dirname, basename } from "node:path";
import { parseArgs } from "node:util";
import { homedir } from "node:os";

/** @typedef {{prefix:string, repo:string, dir:string, base:string, skills:string[]}} Source */

/** @type {Source[]} */
export const SOURCES = [
  {
    prefix: "addy",
    repo: "https://github.com/addyosmani/agent-skills",
    dir: "addyosmani-agent-skills",
    base: "skills",
    // All 25. Engineering discipline across the lifecycle; cheapest collection per skill
    // (~2,000 tokens for the set) and the closest in spirit to the Superpowers set already here.
    skills: [
      "api-and-interface-design", "browser-testing-with-devtools", "ci-cd-and-automation",
      "code-review-and-quality", "code-simplification", "constraint-driven-development",
      "context-engineering", "debugging-and-error-recovery", "deprecation-and-migration",
      "documentation-and-adrs", "doubt-driven-development", "frontend-ui-engineering",
      "git-workflow-and-versioning", "idea-refine", "incremental-implementation",
      "interview-me", "observability-and-instrumentation", "performance-optimization",
      "planning-and-task-breakdown", "security-and-hardening", "shipping-and-launch",
      "source-driven-development", "spec-driven-development", "test-driven-development",
      "using-agent-skills",
    ],
  },
  {
    prefix: "mp",
    repo: "https://github.com/mattpocock/skills",
    dir: "mattpocock-skills",
    base: "skills",
    // engineering/ and productivity/, minus the two that only configure Matt's own setup.
    // `grilling` is the reason this collection is here: it is the adversarial-questioning
    // discipline the supervisors in this repo have repeatedly failed to apply to themselves.
    skills: [
      "engineering/code-review", "engineering/codebase-design", "engineering/diagnosing-bugs",
      "engineering/domain-modeling", "engineering/grill-with-docs", "engineering/implement",
      "engineering/improve-codebase-architecture", "engineering/prototype", "engineering/research",
      "engineering/resolving-merge-conflicts", "engineering/tdd", "engineering/to-spec",
      "engineering/to-tickets", "engineering/triage", "engineering/wayfinder", "engineering/wizard",
      "productivity/grill-me", "productivity/grilling", "productivity/handoff",
      "productivity/teach", "productivity/to-questionnaire", "productivity/wait-what",
      "productivity/writing-for-agents",
    ],
  },
  {
    prefix: "ecc",
    repo: "https://github.com/affaan-m/ECC",
    dir: "affaan-m-ECC",
    base: "skills",
    // 37 of 286. ECC is the largest collection by an order of magnitude and the most
    // uneven — it carries Kotlin Exposed patterns, homelab WireGuard and Manim video
    // alongside the material below. Taking all of it would cost ~25,700 tokens a session
    // for a set that is mostly about other people's stacks.
    skills: [
      // money
      "market-research", "seo", "content-engine", "marketing-campaign", "social-publisher",
      "growth-log", "email-ops", "product-lens", "product-capability", "customer-billing-ops",
      "finance-billing-ops", "competitive-platform-analysis", "competitive-report-structure",
      "lead-intelligence", "brand-discovery", "brand-voice", "crosspost", "opensource-pipeline",
      "agent-payment-x402",
      // colony
      "council", "council-multi-model", "team-agent-orchestration", "autonomous-loops",
      "continuous-agent-loop", "agent-eval", "agent-self-evaluation", "verification-loop",
      "delivery-gate", "cost-tracking", "cost-aware-llm-pipeline", "token-budget-advisor",
      "context-budget", "parallel-execution-optimizer", "recursive-decision-ledger",
      "strategic-compact", "skill-scout",
      // discipline
      "security-review",
    ],
  },
  {
    prefix: "hermes",
    repo: "https://github.com/NousResearch/hermes-agent",
    dir: "NousResearch-hermes-agent",
    base: ".",
    // 16 of 196. The payments three are the reason this collection is here: they document
    // the HTTP-402 buyer side, including AgentCash's "300+ pre-priced APIs" directory —
    // a candidate acquisition channel for products/x402-il-api, which has none.
    // Skipped: apple/ (iMessage, FindMy, Reminders — no Apple devices in play),
    // most of creative/, note-taking/, and the ~130 optional-mcps entries.
    skills: [
      "optional-skills/payments/stripe-link-cli", "optional-skills/payments/mpp-agent",
      "optional-skills/payments/stripe-projects", "optional-skills/productivity/shopify",
      "optional-skills/creative/social-media-content-calendar",
      "skills/research/grounded-citations", "skills/research/competitor-news-monitor",
      "skills/research/arxiv", "skills/web/blocked-page-recovery", "skills/social-media/xurl",
      "skills/email/email-inbox-triage", "skills/media/youtube-content",
      "skills/productivity/product-price-monitor", "skills/software-development/spike",
      "skills/software-development/codebase-inspection", "skills/software-development/github",
    ],
  },
];

/** Rewrite the frontmatter `name:` so it matches the prefixed directory. */
function renameSkill(skillMdPath, newName) {
  const text = readFileSync(skillMdPath, "utf8");
  const m = /^---\r?\n([\s\S]*?)\r?\n---/.exec(text);
  if (!m) return false;
  const body = m[1];
  if (!/^name:\s*.+$/m.test(body)) return false;
  const patched = body.replace(/^name:\s*.+$/m, `name: ${newName}`);
  writeFileSync(skillMdPath, text.replace(m[1], patched), "utf8");
  return true;
}

function dirSizeKb(dir) {
  let total = 0;
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, entry.name);
    total += entry.isDirectory() ? dirSizeKb(p) * 1024 : statSync(p).size;
  }
  return total / 1024;
}

function main() {
  const { values } = parseArgs({
    options: {
      "clone-dir": { type: "string" },
      user: { type: "boolean", default: false },
      "dry-run": { type: "boolean", default: false },
    },
  });
  const cloneDir = values["clone-dir"];
  if (!cloneDir) {
    console.error("usage: node scripts/install-skills.mjs --clone-dir <dir> [--user] [--dry-run]");
    console.error("clone first:  git clone --depth 1 --filter=blob:none <repo> <dir>/<name>");
    process.exit(2);
  }

  const projectDir = join(dirname(new URL(import.meta.url).pathname), "..");
  const target = join(projectDir, ".claude", "skills");
  let installed = 0;
  let descChars = 0;
  const missing = [];

  for (const source of SOURCES) {
    for (const rel of source.skills) {
      const from = join(cloneDir, source.dir, source.base === "." ? "" : source.base, rel);
      if (!existsSync(join(from, "SKILL.md"))) {
        missing.push(`${source.dir}/${rel}`);
        continue;
      }
      const name = `${source.prefix}-${basename(rel)}`;
      const to = join(target, name);
      if (values["dry-run"]) {
        console.log(`would install ${name}  (${dirSizeKb(from).toFixed(0)} KB)`);
      } else {
        rmSync(to, { recursive: true, force: true });
        mkdirSync(dirname(to), { recursive: true });
        cpSync(from, to, { recursive: true });
        renameSkill(join(to, "SKILL.md"), name);
        const fm = /^---\r?\n([\s\S]*?)\r?\n---/.exec(readFileSync(join(to, "SKILL.md"), "utf8"));
        descChars += fm ? fm[1].length : 0;
      }
      installed++;
    }
  }

  if (missing.length) {
    console.error(`\n${missing.length} allowlisted skills were not found in the clones:`);
    for (const m of missing) console.error(`  - ${m}`);
  }
  console.log(`\n${installed} skills ${values["dry-run"] ? "would be" : ""} installed into .claude/skills/`);
  if (!values["dry-run"]) {
    console.log(`~${Math.round(descChars / 4)} tokens of frontmatter per session (all 651 upstream would be ~32,600)`);
  }

  if (values.user && !values["dry-run"]) {
    const userSkills = join(homedir(), ".claude", "skills");
    mkdirSync(userSkills, { recursive: true });
    cpSync(target, userSkills, { recursive: true });
    console.log(`also copied to ${userSkills}`);
  }
}

if (process.argv[1] && process.argv[1].endsWith("install-skills.mjs")) main();
