import { describe, it, expect } from "vitest";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { extname, join, relative, resolve } from "node:path";
// @ts-expect-error — plain ESM script, no type declarations by design (same as the other scripts/*.mjs tests)
import { parseUrlList } from "../../../scripts/render-watch.mjs";

/**
 * BOARD-2 §2.1.3(b): no file under `src/`, `scripts/` or `.github/` may make a request to Algora's website.
 *
 * Why a test: Algora's terms forbid "any robot, spider, or other automatic device, process, or means to access
 * Service" (research/rendered/algora-terms.txt:258-260), Service being its web pages (lines 81-86). The board ruled
 * that the clause does not fire against a contributor who works only on GitHub — and that it would, the moment our
 * own code fetched the site. That already happened twice, through our research tooling (render-watch, 22.9 and
 * 26.9). A test is how it stops recurring.
 *
 * THE RULE, kept simple on purpose so anybody can predict it:
 *
 *  1. Only code is read: .ts .tsx .js .mjs .cjs .sh .bash .py .yml .yaml. A Markdown or text file cannot make a
 *     request by itself (the one list that feeds a fetcher is checked separately, below).
 *  2. Comments are allowed to name the host. A line whose first non-blank characters are `//`, `/*` or `*` — or `#`
 *     in shell, Python and YAML — is skipped, and a trailing ` // …` comment is cut off.
 *  3. What remains is a request, and fails the test, when a line names the host AND either
 *       (a) calls a request primitive on the same line — fetch, curl, wget, axios, got, http(s).get/request,
 *           XMLHttpRequest, WebSocket, requests.get/post, urlopen, page.goto…, or
 *       (b) writes the host as a URL with a scheme (`http://` or `https://`). A URL literal in code exists to be
 *           requested, so outside a comment the host is never written as one.
 *     The host in plain prose inside a string — intake.ts's "… is EGRESS_BLOCKED" explanation — is text, not a
 *     request, and is allowed.
 *
 * The host is assembled from parts below so that this file does not have to exempt itself from its own rule.
 */

const HOST = ["algora", "io"].join(".");
const HOST_RE = new RegExp(`\\b${HOST.replace(".", "\\.")}\\b`, "i");
const URL_RE = new RegExp(`https?://(?:[a-z0-9-]+\\.)*${HOST.replace(".", "\\.")}\\b`, "i");
const REQUEST_RE =
  /\b(?:fetch|fetchImpl|curl|wget|axios|got|urlopen|urllib\.request|requests\.(?:get|post|put|head|request)|https?\.(?:get|request)|XMLHttpRequest|WebSocket|EventSource|Invoke-WebRequest|goto|navigate)\b/;

const CODE_EXTENSIONS = new Set([".ts", ".tsx", ".js", ".mjs", ".cjs", ".sh", ".bash", ".py", ".yml", ".yaml"]);
const HASH_COMMENT_EXTENSIONS = new Set([".sh", ".bash", ".py", ".yml", ".yaml"]);

interface Finding {
  line: number;
  text: string;
  why: "request-primitive" | "url-literal";
}

/** The rule above, as a function, so it is tested before it is trusted. */
function findHostRequests(source: string, ext: string): Finding[] {
  const findings: Finding[] = [];
  const hashComments = HASH_COMMENT_EXTENSIONS.has(ext);
  source.split(/\r?\n/).forEach((raw, i) => {
    const trimmed = raw.trim();
    if (trimmed.startsWith("//") || trimmed.startsWith("/*") || trimmed.startsWith("*")) return;
    if (hashComments && trimmed.startsWith("#")) return;
    const code = raw.replace(/\s\/\/\s.*$/, "");
    if (!HOST_RE.test(code)) return;
    if (URL_RE.test(code)) findings.push({ line: i + 1, text: trimmed, why: "url-literal" });
    else if (REQUEST_RE.test(code)) findings.push({ line: i + 1, text: trimmed, why: "request-primitive" });
  });
  return findings;
}

function walk(dir: string, out: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    if (name === "node_modules" || name === "dist") continue;
    const path = join(dir, name);
    if (statSync(path).isDirectory()) walk(path, out);
    else out.push(path);
  }
  return out;
}

const REPO_ROOT = resolve(__dirname, "..", "..", "..");

describe("the rule, on fixtures", () => {
  const url = `https://${HOST}/acme/bounties`;

  it("flags a fetch, a curl and a URL literal", () => {
    expect(findHostRequests(`const r = await fetch("${url}");`, ".ts")).toEqual([expect.objectContaining({ line: 1, why: "url-literal" })]);
    expect(findHostRequests(`const BASE = "${url}";`, ".ts")).toHaveLength(1);
    expect(findHostRequests(`run: curl -s ${HOST}/api/bounties`, ".yml")).toEqual([expect.objectContaining({ why: "request-primitive" })]);
    expect(findHostRequests(`await page.goto("//${HOST}")`, ".mjs")).toEqual([expect.objectContaining({ why: "request-primitive" })]);
  });

  it("allows the host in comments of every kind", () => {
    const src = [`// see ${url}`, `/* ${url} */`, ` * the terms at ${url}`, `const x = 1; // ${url}`].join("\n");
    expect(findHostRequests(src, ".ts")).toEqual([]);
    expect(findHostRequests(`# render-watch fetched ${url} once`, ".yml")).toEqual([]);
  });

  it("allows the host named in prose inside a string", () => {
    expect(findHostRequests(`detail: "the layout was never rendered (${HOST} is EGRESS_BLOCKED)",`, ".ts")).toEqual([]);
  });

  it("does not treat a hash as a comment in TypeScript", () => {
    expect(findHostRequests(`#private = "${url}";`, ".ts")).toHaveLength(1);
  });
});

describe("BOARD-2 §2.1.3(b): no request to Algora's website from our own code", () => {
  it("finds none under src/, scripts/ or .github/", () => {
    const files = ["src", "scripts", ".github"].flatMap((d) => walk(join(REPO_ROOT, d)));
    expect(files.length).toBeGreaterThan(100); // the walk actually walked
    const offenders: string[] = [];
    for (const file of files) {
      const ext = extname(file);
      if (!CODE_EXTENSIONS.has(ext)) continue;
      for (const f of findHostRequests(readFileSync(file, "utf8"), ext)) {
        offenders.push(`${relative(REPO_ROOT, file)}:${f.line} (${f.why}): ${f.text}`);
      }
    }
    expect(offenders, `requests to ${HOST} found — Algora's terms forbid automated access (BOARD-2 §2.1)`).toEqual([]);
  });

  it("keeps the site out of the list render-watch fetches every week — the vector both breaches used", () => {
    const list = readFileSync(join(REPO_ROOT, "research", "rendered", "urls.txt"), "utf8");
    const entries = parseUrlList(list) as { url: string; lineNumber: number }[];
    expect(entries.length).toBeGreaterThan(0);
    const hits = entries.filter((e) => HOST_RE.test(new URL(e.url).hostname));
    expect(hits.map((h) => `urls.txt:${h.lineNumber} ${h.url}`)).toEqual([]);
  });
});
