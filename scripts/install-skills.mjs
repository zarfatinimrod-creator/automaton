#!/usr/bin/env node
/**
 * Vendor third-party Claude skills into .claude/skills/, by an explicit allowlist.
 *
 * Why an allowlist and not "install everything": the seven upstream repos hold over 700
 * skills between them, and a skill's name+description sits in every session's context
 * whether or not it is ever invoked. Wholesale installation of the first four alone costs
 * ~32,600 tokens per session, permanently, which is a direct tax on the budget MISSION.md
 * exists to spend on finding money. So each skill below earns its place under one of three
 * headings:
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
 * --clone-dir  directory holding shallow clones of the upstream repos, one per SOURCES[].dir
 * --user       also copy the result into ~/.claude/skills/
 */
import { mkdirSync, rmSync, cpSync, existsSync, readFileSync, writeFileSync, readdirSync, statSync } from "node:fs";
import { join, dirname, basename } from "node:path";
import { parseArgs } from "node:util";
import { homedir } from "node:os";

/**
 * @typedef {{path:string, as?:string, skillFile?:string}} SkillEntry
 *   path       skill directory, relative to <dir>/<base>
 *   as         final installed name, when `<prefix>-<basename(path)>` would be wrong
 *   skillFile  file inside that directory to install as SKILL.md — for an upstream that keeps
 *              an English twin next to a primary in another language
 * @typedef {{find:string, replace:string}} Rewrite
 *   a literal substitution applied to every .md under the installed skill (paths the skill
 *   hard-codes, links between skills that assume the upstream directory names)
 * @typedef {{to:string, paths:string[]}} Vendor
 *   runtime files the skills execute, copied from the clone into vendor/<to>/ so a fresh
 *   clone of this repo can run them without a network call
 * @typedef {{prefix:string, repo:string, dir:string, base:string, skills:(string|SkillEntry)[], rewrites?:Rewrite[], vendor?:Vendor}} Source
 */

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
  {
    prefix: "reach",
    repo: "https://github.com/Panniantong/Agent-Reach",
    dir: "Panniantong-Agent-Reach",
    base: "agent_reach",
    // Sent 6.9.2026. One skill over a Python CLI (`pip install agent-reach`) that picks,
    // installs and health-checks a backend per platform — Twitter/X, Reddit, YouTube,
    // Instagram, LinkedIn, GitHub, RSS and the Chinese platforms — and hands the agent the
    // upstream tool rather than wrapping it. Installed from its English twin; the upstream
    // primary is Chinese. Inert in this container (the egress proxy reaches none of the
    // platforms; `agent-reach doctor --json` says exactly which), live on any host with egress.
    skills: [{ path: "skill", as: "agent-reach", skillFile: "SKILL_en.md" }],
  },
  {
    prefix: "or",
    repo: "https://github.com/diegosouzapw/OmniRoute",
    dir: "diegosouzapw-OmniRoute",
    base: "skills",
    // 7 of 47. OmniRoute is an OpenAI-compatible gateway over 356 providers (150+ free
    // tiers) — a candidate inference endpoint for the automaton runtime, which has no keys
    // yet. Its 47 skills are generated operator docs for its own CLI and REST API and do
    // nothing while the gateway is not running, so only the six needed to stand it up and
    // meter it are carried, plus `ponytail`, an external MIT skill it bundles (YAGNI,
    // stdlib before dependencies — the discipline behind the arborist/vitest episode).
    // Skipped: 38 endpoint/CLI references (tunnels, webhooks, backups, A2A, MCP, eval…)
    // and two stubs whose bodies say "No endpoints mapped for this area yet".
    skills: [
      "cli-setup", "cli-serve", "cli-providers", "omni-inference", "omni-combos-routing",
      "cli-cost-usage",
      "ponytail",
    ],
  },
  {
    prefix: "co",
    repo: "https://github.com/AgriciDaniel/claude-obsidian",
    dir: "AgriciDaniel-claude-obsidian",
    base: "skills",
    // All 15. A Claude Code plugin for source-cited knowledge bases: capture → source and
    // claim ledgers → linked pages → deterministic lint and BM25 retrieval. This repo does
    // that by hand in research/colony-sweep/ (scouts → groups → audits, with a test that
    // fails when an audit goes uncited); the plugin is tooling for the same loop. The skills
    // execute a stdlib-only Python 3.11 core, vendored to vendor/claude-obsidian/ so a fresh
    // clone can run them; the `PRODUCT_ROOT` placeholder in each skill is rewritten to it.
    skills: [
      "wiki", "wiki-ingest", "wiki-query", "wiki-retrieve", "wiki-lint", "wiki-fold",
      "wiki-mode", "wiki-cli", "save", "think", "autoresearch", "canvas", "defuddle",
      "obsidian-bases", "obsidian-markdown",
    ],
    rewrites: [
      {
        find: "PRODUCT_ROOT=/absolute/path/to/installed/claude-obsidian",
        replace: 'PRODUCT_ROOT="$(git rev-parse --show-toplevel)/vendor/claude-obsidian"',
      },
      // Links between skills assume the upstream directory names.
      { find: "](../wiki-retrieve/", replace: "](../co-wiki-retrieve/" },
      { find: "](../wiki-cli/", replace: "](../co-wiki-cli/" },
      { find: "](../wiki/", replace: "](../co-wiki/" },
    ],
    vendor: {
      to: "claude-obsidian",
      paths: ["scripts", "claude_obsidian", "templates", "agents", "hooks", "LICENSE", ".claude-plugin/plugin.json"],
    },
  },
];

/** Walk a directory, calling fn(path) for every file (skipping VCS and package trees). */
function walkFiles(dir, fn) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === ".git" || entry.name === "node_modules") continue;
    const p = join(dir, entry.name);
    if (entry.isDirectory()) walkFiles(p, fn);
    else fn(p);
  }
}

/** Frontmatter block of a SKILL.md, or null. */
function frontmatter(text) {
  const m = /^---\r?\n([\s\S]*?)\r?\n---/.exec(text);
  return m ? m[1] : null;
}

/** Apply one literal substitution to every .md under dir; returns the number of files changed. */
function applyRewrite(dir, { find, replace }) {
  let changed = 0;
  walkFiles(dir, (p) => {
    if (!p.endsWith(".md")) return;
    const text = readFileSync(p, "utf8");
    if (!text.includes(find)) return;
    writeFileSync(p, text.split(find).join(replace), "utf8");
    changed++;
  });
  return changed;
}

/** Tokens per session if every SKILL.md in a clone were installed (frontmatter chars / 4). */
function wholesaleTokens(cloneRoot) {
  let chars = 0;
  let count = 0;
  walkFiles(cloneRoot, (p) => {
    if (basename(p) !== "SKILL.md") return;
    const fm = frontmatter(readFileSync(p, "utf8"));
    if (fm === null) return;
    chars += fm.length;
    count++;
  });
  return { count, tokens: Math.round(chars / 4) };
}

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
  let vendoredKb = 0;
  const missing = [];
  const wholesale = { count: 0, tokens: 0 };

  for (const source of SOURCES) {
    const cloneRoot = join(cloneDir, source.dir);
    if (!existsSync(cloneRoot)) {
      missing.push(`${source.dir} (whole clone: git clone --depth 1 --filter=blob:none ${source.repo} ${cloneRoot})`);
      continue;
    }
    const w = wholesaleTokens(cloneRoot);
    wholesale.count += w.count;
    wholesale.tokens += w.tokens;

    if (source.vendor) {
      const vendorTo = join(projectDir, "vendor", source.vendor.to);
      if (values["dry-run"]) {
        console.log(`would vendor ${source.vendor.paths.join(", ")} → vendor/${source.vendor.to}/`);
      } else {
        rmSync(vendorTo, { recursive: true, force: true });
        for (const rel of source.vendor.paths) {
          const from = join(cloneRoot, rel);
          if (!existsSync(from)) {
            missing.push(`${source.dir}/${rel} (vendor)`);
            continue;
          }
          mkdirSync(dirname(join(vendorTo, rel)), { recursive: true });
          cpSync(from, join(vendorTo, rel), { recursive: true });
        }
        vendoredKb += dirSizeKb(vendorTo);
        console.log(`vendored runtime → vendor/${source.vendor.to}/ (${dirSizeKb(vendorTo).toFixed(0)} KB)`);
      }
    }

    for (const entry of source.skills) {
      const { path: rel, as, skillFile } = typeof entry === "string" ? { path: entry } : entry;
      const from = join(cloneRoot, source.base === "." ? "" : source.base, rel);
      if (!existsSync(join(from, skillFile ?? "SKILL.md"))) {
        missing.push(`${source.dir}/${rel}`);
        continue;
      }
      const name = as ?? `${source.prefix}-${basename(rel)}`;
      const to = join(target, name);
      if (values["dry-run"]) {
        console.log(`would install ${name}  (${dirSizeKb(from).toFixed(0)} KB)`);
      } else {
        rmSync(to, { recursive: true, force: true });
        mkdirSync(dirname(to), { recursive: true });
        cpSync(from, to, { recursive: true });
        if (skillFile) {
          // Promote the chosen twin to SKILL.md and drop the original so only one registers.
          cpSync(join(to, skillFile), join(to, "SKILL.md"));
          rmSync(join(to, skillFile));
        }
        renameSkill(join(to, "SKILL.md"), name);
        for (const rw of source.rewrites ?? []) applyRewrite(to, rw);
        const fm = frontmatter(readFileSync(join(to, "SKILL.md"), "utf8"));
        descChars += fm ? fm.length : 0;
      }
      installed++;
    }
  }

  if (missing.length) {
    console.error(`\n${missing.length} allowlisted entries were not found in the clones:`);
    for (const m of missing) console.error(`  - ${m}`);
  }
  console.log(`\n${installed} skills ${values["dry-run"] ? "would be" : ""} installed into .claude/skills/`);
  if (!values["dry-run"]) {
    console.log(
      `~${Math.round(descChars / 4)} tokens of frontmatter per session ` +
      `(all ${wholesale.count} SKILL.md files in these clones would be ~${wholesale.tokens})`,
    );
    if (vendoredKb) console.log(`${vendoredKb.toFixed(0)} KB of runtime vendored under vendor/`);
  }

  if (values.user && !values["dry-run"]) {
    const userSkills = join(homedir(), ".claude", "skills");
    mkdirSync(userSkills, { recursive: true });
    cpSync(target, userSkills, { recursive: true });
    console.log(`also copied to ${userSkills}`);
  }
}

if (process.argv[1] && process.argv[1].endsWith("install-skills.mjs")) main();
