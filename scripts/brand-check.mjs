#!/usr/bin/env node
/**
 * Is a brand name free? Four lookups per name, status codes only.
 *
 * WHY. Every public owner step carries the brand (research/measurements/brand-name-check.md), and the 3.9
 * recommendation "Bediyuk" turned out to be taken twice over once a runner looked. This asks the same questions of each
 * candidate, from a host with egress, and keeps nothing but the answers:
 *   - `.com`     RDAP at Verisign — the base IANA's bootstrap lists for `com` (research/rendered/iana-rdap-dns.json).
 *                404 = not registered, 200 = registered.
 *   - GitHub     `api.github.com/users/<name>` — covers users and organisations. 404 = free.
 *   - YouTube    `www.youtube.com/@<name>` — 404 = no channel holds the handle, 200 = one does.
 *   - Netlify    `https://<name>.netlify.app` — added 29.9.2026 for the T1 sub-brand host
 *                (research/channel-loop/RULING-2026-09-29-lines.md (e)). 404 is read as free; anything else as taken or
 *                unknown. The "Site not found" 404 is a reading from memory (grade none): the fold reads the first
 *                result before trusting it. Redirects are not followed — a site that 301s to its own domain is a site.
 * No page body is stored: a YouTube page is a megabyte and may be a private person's channel; only the status is kept.
 *
 * USAGE
 *   node scripts/brand-check.mjs                                   # research/measurements/brand-candidates.txt
 *   node scripts/brand-check.mjs --candidates research/measurements/t1-subbrand-candidates.txt
 *   node scripts/brand-check.mjs --out /tmp/x.json name1 name2     # ad-hoc names, JSON only
 *
 * A list `research/measurements/<stem>-candidates.txt` writes `<stem>-candidates.json` (the path the 27.9 brand answers
 * were committed under) and `<stem>-check.md` beside it. Only a list in research/measurements is accepted, because the
 * workflow passes a dispatch input straight here.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { parseArgs } from "node:util";

const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const MEASUREMENTS = join("research", "measurements");
export const CANDIDATES = join(REPO_ROOT, MEASUREMENTS, "brand-candidates.txt");
export const OUT = join(REPO_ROOT, MEASUREMENTS, "brand-candidates.json");
export const NAME_RE = /^[a-z][a-z0-9-]{2,30}$/;
const LIST_RE = /^([a-z0-9][a-z0-9-]*)-candidates\.txt$/;

/** The probes, in the order they are asked and printed. `allFree` needs every one of them. */
export const PROBES = ["com", "github", "youtube", "netlify"];
const PROBE_LABELS = { com: ".com", github: "GitHub", youtube: "YouTube", netlify: "Netlify" };

export const lookups = (name) => ({
  com: `https://rdap.verisign.com/com/v1/domain/${name}.com`,
  github: `https://api.github.com/users/${name}`,
  youtube: `https://www.youtube.com/@${name}`,
  netlify: `https://${name}.netlify.app`,
});

/** One line per name; `#` starts a comment; blank lines ignored. Throws on a name no registry would take. */
export function parseCandidates(text) {
  const names = [];
  for (const [i, raw] of String(text).split("\n").entries()) {
    const line = raw.replace(/#.*/, "").trim().toLowerCase();
    if (!line) continue;
    if (!NAME_RE.test(line)) throw new Error(`line ${i + 1}: "${line}" is not a usable name (${NAME_RE})`);
    if (names.includes(line)) throw new Error(`line ${i + 1}: "${line}" is listed twice`);
    names.push(line);
  }
  return names;
}

/**
 * Where a candidate list's answers go, as repo-relative paths. Refuses anything that is not
 * `research/measurements/<stem>-candidates.txt` — the workflow's dispatch input arrives here as data.
 */
export function outputsFor(candidatesPath) {
  const rel = relative(REPO_ROOT, resolve(REPO_ROOT, String(candidatesPath)));
  const parts = rel.split(sep);
  const file = parts.at(-1) ?? "";
  const m = LIST_RE.exec(file);
  if (parts.length !== 3 || parts.slice(0, 2).join("/") !== "research/measurements" || !m) {
    throw new Error(`"${candidatesPath}" is not a candidate list: expected research/measurements/<name>-candidates.txt`);
  }
  const dir = "research/measurements";
  return { candidates: `${dir}/${file}`, json: `${dir}/${m[1]}-candidates.json`, md: `${dir}/${m[1]}-check.md` };
}

/** 404 → free, 200 → taken, anything else → unknown (a refusal or a redirect is not an answer). */
export function verdictOf(status) {
  if (status === 404) return "free";
  if (status === 200) return "taken";
  return "unknown";
}

/** A probe missing from a row (a row written before the probe existed) counts as unknown, never as free. */
const verdictIn = (row, probe) => row[probe]?.verdict ?? "unknown";

export function summarise(rows) {
  const allFree = rows.filter((r) => PROBES.every((p) => verdictIn(r, p) === "free")).map((r) => r.name);
  return {
    allFree,
    firstAllFree: allFree[0] ?? null,
    unknown: rows.filter((r) => PROBES.some((p) => verdictIn(r, p) === "unknown")).map((r) => r.name),
  };
}

/** The status code of one GET, or `error: …`. The body is cancelled unread. */
export async function probeStatus(url, fetchImpl = fetch) {
  try {
    const res = await fetchImpl(url, { redirect: "manual", signal: AbortSignal.timeout(20_000), headers: { "accept-language": "en" } });
    await res.body?.cancel();
    return res.status;
  } catch (error) {
    return `error: ${error instanceof Error ? error.message : String(error)}`;
  }
}

/** One name on every probe, in PROBES order. `pauseMs` is the politeness gap between requests. */
export async function checkName(name, { fetchImpl = fetch, pauseMs = 400 } = {}) {
  const urls = lookups(name);
  const row = { name };
  for (const probe of PROBES) {
    const s = await probeStatus(urls[probe], fetchImpl);
    row[probe] = { url: urls[probe], status: s, verdict: verdictOf(s) };
    if (pauseMs > 0) await new Promise((r) => setTimeout(r, pauseMs));
  }
  return row;
}

/** The Markdown record of one run: a table in list order, the first all-free name, and what the result is not. */
export function renderMarkdown(out) {
  const cell = (x) => `${x?.verdict ?? "unknown"} (${x?.status ?? "not asked"})`;
  const lines = [
    `# Brand check — ${out.candidates ?? "ad-hoc names"}`,
    "",
    `Measured ${out.measuredAt} by \`scripts/brand-check.mjs\` from a runner. Status codes only; no page body stored.`,
    "404 = free, 200 = taken, anything else (a redirect, a refusal, an error) = unknown.",
    "",
    `| name | ${PROBES.map((p) => PROBE_LABELS[p]).join(" | ")} | all four free |`,
    `|---|${PROBES.map(() => "---").join("|")}|---|`,
    ...out.rows.map((r) => `| \`${r.name}\` | ${PROBES.map((p) => cell(r[p])).join(" | ")} | ${out.allFree.includes(r.name) ? "**yes**" : "no"} |`),
    "",
    `First all-free name in list order: ${out.firstAllFree ? `\`${out.firstAllFree}\`` : "none"}.`,
    out.unknown.length ? `Unknown on at least one probe (re-run before reading them as taken): ${out.unknown.map((n) => `\`${n}\``).join(", ")}.` : "No probe answered unknown.",
    "",
    "The Netlify probe's reading (404 = no site holds the name) is grade none until a fold reads this first result",
    "(research/channel-loop/RULING-2026-09-29-lines.md (e)). This file is a measurement, not a choice: the fold records",
    "the name, and the owner may veto it.",
    "",
  ];
  return lines.join("\n");
}

async function main() {
  const { values, positionals } = parseArgs({
    options: { candidates: { type: "string" }, out: { type: "string" }, md: { type: "string" } },
    allowPositionals: true,
  });
  let names;
  let listPath = null;
  let jsonPath = values.out ?? OUT;
  let mdPath = values.md ?? null;
  if (positionals.length) {
    names = parseCandidates(positionals.join("\n"));
  } else {
    const paths = outputsFor(values.candidates ?? relative(REPO_ROOT, CANDIDATES));
    listPath = paths.candidates;
    names = parseCandidates(readFileSync(join(REPO_ROOT, paths.candidates), "utf8"));
    jsonPath = values.out ?? join(REPO_ROOT, paths.json);
    mdPath = values.md ?? join(REPO_ROOT, paths.md);
  }

  const rows = [];
  for (const name of names) {
    const row = await checkName(name);
    rows.push(row);
    console.log(`${name}: ${PROBES.map((p) => `${PROBE_LABELS[p]} ${row[p].verdict} (${row[p].status})`).join(", ")}`);
  }
  const out = {
    measuredAt: new Date().toISOString(),
    candidates: listPath,
    note: "Status codes only; no page bodies stored. 404 = free, 200 = taken, anything else = unknown. Netlify's 404 reading is grade none until a fold reads it.",
    ...summarise(rows),
    rows,
  };
  writeFileSync(jsonPath, JSON.stringify(out, null, 2) + "\n");
  if (mdPath) writeFileSync(mdPath, renderMarkdown(out));
  console.log(`all four free: ${out.allFree.join(", ") || "none"}; first in list order: ${out.firstAllFree ?? "none"}`);
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
  });
}
