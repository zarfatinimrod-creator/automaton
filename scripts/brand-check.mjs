#!/usr/bin/env node
/**
 * Is a brand name free? Three lookups per name, status codes only.
 *
 * WHY. Every public owner step carries the brand (research/measurements/brand-name-check.md), and the 3.9
 * recommendation "Bediyuk" turned out to be taken twice over once a runner looked. This asks the same three
 * questions of each candidate, from a host with egress, and keeps nothing but the answers:
 *   - `.com`     RDAP at Verisign — the base IANA's bootstrap lists for `com` (research/rendered/iana-rdap-dns.json).
 *                404 = not registered, 200 = registered.
 *   - GitHub     `api.github.com/users/<name>` — covers users and organisations. 404 = free.
 *   - YouTube    `www.youtube.com/@<name>` — 404 = no channel holds the handle, 200 = one does.
 * No page body is stored: a YouTube page is a megabyte and may be a private person's channel; only the status is kept.
 *
 * USAGE
 *   node scripts/brand-check.mjs                          # names from research/measurements/brand-candidates.txt
 *   node scripts/brand-check.mjs --out /tmp/x.json name1 name2
 */
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { parseArgs } from "node:util";

const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
export const CANDIDATES = join(REPO_ROOT, "research", "measurements", "brand-candidates.txt");
export const OUT = join(REPO_ROOT, "research", "measurements", "brand-candidates.json");
export const NAME_RE = /^[a-z][a-z0-9-]{2,30}$/;

export const lookups = (name) => ({
  com: `https://rdap.verisign.com/com/v1/domain/${name}.com`,
  github: `https://api.github.com/users/${name}`,
  youtube: `https://www.youtube.com/@${name}`,
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

/** 404 → free, 200 → taken, anything else → unknown (a refusal is not an answer). */
export function verdictOf(status) {
  if (status === 404) return "free";
  if (status === 200) return "taken";
  return "unknown";
}

export function summarise(rows) {
  const allFree = rows.filter((r) => r.com.verdict === "free" && r.github.verdict === "free" && r.youtube.verdict === "free").map((r) => r.name);
  return { allFree, unknown: rows.filter((r) => [r.com, r.github, r.youtube].some((x) => x.verdict === "unknown")).map((r) => r.name) };
}

async function status(url) {
  try {
    const res = await fetch(url, { redirect: "manual", signal: AbortSignal.timeout(20_000), headers: { "accept-language": "en" } });
    await res.body?.cancel();
    return res.status;
  } catch (error) {
    return `error: ${error instanceof Error ? error.message : String(error)}`;
  }
}

async function main() {
  const { values, positionals } = parseArgs({ options: { out: { type: "string", default: OUT } }, allowPositionals: true });
  const names = positionals.length ? parseCandidates(positionals.join("\n")) : parseCandidates(readFileSync(CANDIDATES, "utf8"));
  const rows = [];
  for (const name of names) {
    const row = { name };
    for (const [key, url] of Object.entries(lookups(name))) {
      const s = await status(url);
      row[key] = { url, status: s, verdict: verdictOf(s) };
      await new Promise((r) => setTimeout(r, 400)); // be polite to three registries
    }
    rows.push(row);
    console.log(`${name}: .com ${row.com.verdict} (${row.com.status}), github ${row.github.verdict} (${row.github.status}), youtube ${row.youtube.verdict} (${row.youtube.status})`);
  }
  const out = { measuredAt: new Date().toISOString(), note: "Status codes only; no page bodies stored. 404 = free, 200 = taken, anything else = unknown.", ...summarise(rows), rows };
  writeFileSync(values.out, JSON.stringify(out, null, 2) + "\n");
  console.log(`all three free: ${out.allFree.join(", ") || "none"}`);
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
  });
}
