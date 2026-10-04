#!/usr/bin/env node
/**
 * robots-verdict — set NO_TERMS_ROBOTS_OK for one site, only when its robots.txt allows every path we queued.
 *
 *   node scripts/robots-verdict.mjs <site> [--apply]
 *     [--verdicts research/channel-loop/terms-verdicts.json] [--urls research/rendered/urls.txt]
 *     [--rendered research/rendered]
 *
 * THE RULE (research/channel-loop/RULING-2026-09-30-video.md 16(d) D2(iv)-(v)). A site with no terms anywhere is
 * NO_TERMS, and its note says which kind: refusal-type (the terms page refused the runner — retired, never judged
 * here) or exhaustive-negative (a recorded search found none: nevo). An exhaustive-negative site may be fetched only
 * under a new verdict, NO_TERMS_ROBOTS_OK, "set only for exhaustive-negative sites by a script that reads the site's
 * robots.txt for the queued paths". This is that script.
 *
 * WHAT IT DOES. For <site> (a key of terms-verdicts.json, e.g. nevo.co.il):
 *   1. the entry must be NO_TERMS with a note that opens "exhaustive-negative"; anything else is left alone
 *   2. every queued line of the site in urls.txt — active, or commented out as `# paused …` (not `# retired`) —
 *      is collected; a robots- probe line is not a page, and at least one page must be queued
 *   3. each host those pages sit on must have a committed robots.txt capture: research/rendered/robots-*.meta.json
 *      whose url is that host's /robots.txt, made by render-watch's robots-only probe line. The capture must be a
 *      robots.txt the site actually served (readableCapture): a 2xx whose Content-Type is text/plain and whose body
 *      is not markup is parsed (only to its last complete line when cut short), and a 404 or 410 means the site has
 *      none, so no rules (RFC 9309 §2.3.1.3). Anything else sets nothing. A 401, 403 or 429, or a 2xx HTML page (a bot
 *      challenge, a soft 404), is the site refusing or not answering, not a file that says yes: a single render-watch
 *      run may read a 4xx as no rules, but this verdict unlocks the site for good, and ruling D2(iv) calls a 403 or a
 *      bot challenge the site's answer. A 5xx or no answer is complete disallow (§2.3.1.4)
 *   4. every page is checked with render-watch's own parser (parseRobotsTxt, robotsRulesFor, robotsDecision), for
 *      the product token MehudakRenderWatch, else `*`
 *   5. only if every page is allowed does the entry become NO_TERMS_ROBOTS_OK, with a source line citing the
 *      capture (file, URL, fetchedAt, sha256) and the ruling, the old NO_TERMS source kept at its end, and the note
 *      kept. Nothing else in the file changes, and the file keeps its exact format (serializeVerdicts)
 *
 * Dry run by default: it prints each page's answer and what it would write. --apply writes terms-verdicts.json. It
 * never touches urls.txt: un-pausing a site's lines is a separate, reviewed edit.
 *
 * Exit codes: 0 — the verdict is (or, dry, would be) set; 3 — nothing to change, and the output says why;
 * 1 — a usage or read error.
 */
import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { basename, join } from "node:path";
import { parseArgs } from "node:util";
import { fileURLToPath } from "node:url";
import { isExhaustiveNegative, isRobotsProbe, siteOf, URLS, RENDERED, VERDICTS } from "./queue-zero-test.mjs";
import {
  completeRobotsLines,
  parseRobotsTxt,
  robotsDecision,
  robotsRulesFor,
  robotsTxtUrl,
  ROBOTS_PRODUCT_TOKEN,
  slugFromUrl,
} from "./render-watch.mjs";

const RULING = "research/channel-loop/RULING-2026-09-30-video.md 16(d) D2(v)";

/** terms-verdicts.json exactly as it is committed: one-space indent, no trailing newline. */
export function serializeVerdicts(verdicts) {
  return JSON.stringify(verdicts, null, 1);
}

/** A `# paused …` line ending in URL<TAB>slug[<TAB>js]: [, url, slug]. Also read by scripts/urls-pause-comments.mjs. */
export const PAUSED_LINE = /^#\s*paused\b.*\s(https?:\/\/\S+)\s+([a-z0-9][a-z0-9._-]*)(?:\s+js)?\s*$/;

/**
 * The site's lines in urls.txt, in file order: active lines, and lines commented out as `# paused …` that end in
 * `URL<TAB>slug` (the form queue-zero-test's --apply-verdicts and the ticks write). A `# retired` line is not queued.
 */
export function queuedPaths(urls, site) {
  const out = [];
  for (const raw of String(urls).split(/\r?\n/)) {
    const line = raw.trim();
    if (line === "") continue;
    let url;
    let slug;
    let state;
    if (line.startsWith("#")) {
      const m = line.match(PAUSED_LINE);
      if (!m) continue;
      [, url, slug] = m;
      state = "paused";
    } else {
      const parts = line.split(/\s+/);
      url = parts[0];
      slug = parts[1] ?? slugFromUrl(url);
      state = "active";
    }
    let host;
    try {
      host = new URL(url).hostname;
    } catch {
      continue;
    }
    if (siteOf(host) === site) out.push({ url, slug, state });
  }
  return out;
}

/**
 * The committed robots- capture of one robots.txt URL: { slug, meta, body } from research/rendered/robots-*.meta.json
 * whose `url` is that URL, with the stored body (null when the capture stored none), or null when there is none.
 */
export function readRobotsCapture(robotsUrl, renderedDir = RENDERED) {
  if (!existsSync(renderedDir)) return null;
  const metas = readdirSync(renderedDir)
    .filter((name) => /^robots-.*\.meta\.json$/.test(name))
    .sort();
  for (const name of metas) {
    let meta;
    try {
      meta = JSON.parse(readFileSync(join(renderedDir, name), "utf8"));
    } catch {
      continue;
    }
    let url;
    try {
      url = new URL(meta?.url).href;
    } catch {
      continue;
    }
    if (url !== robotsUrl) continue;
    const bodyFile = meta.bodyPath ? join(renderedDir, basename(meta.bodyPath)) : null;
    const body = bodyFile && existsSync(bodyFile) ? readFileSync(bodyFile, "utf8") : null;
    return { slug: name.replace(/\.meta\.json$/, ""), meta, body };
  }
  return null;
}

/**
 * Is a committed robots.txt capture something the verdict may rest on? { kind: "file" } for a 2xx text/plain body that
 * is not markup, { kind: "absent" } for a 404 or 410 (the site has no robots.txt), else { kind: "refused" | "unreachable",
 * why }. Stricter than render-watch's run-time reading on purpose: that one decides one run, this one unlocks a site.
 */
export function readableCapture(meta, body) {
  const status = meta?.status;
  const contentType = String(meta?.contentType ?? "").toLowerCase();
  if (meta?.error == null && Number.isInteger(status) && status >= 200 && status <= 299) {
    if (body === null || body === undefined) return { kind: "refused", why: `a ${status} capture with no stored body` };
    if (!/^text\/plain(\s*;|$)/.test(contentType)) {
      return { kind: "refused", why: `a ${status} answered ${meta?.contentType ?? "with no Content-Type"}, not text/plain` };
    }
    if (/^\s*</.test(String(body).replace(/^\uFEFF/, ""))) {
      return { kind: "refused", why: `a ${status} whose body is markup (a bot challenge or an error page), not a robots.txt` };
    }
    return { kind: "file" };
  }
  if (status === 404 || status === 410) return { kind: "absent" };
  if (Number.isInteger(status) && status >= 400 && status <= 499) {
    return { kind: "refused", why: `HTTP ${status}: the site refused or throttled the request, which says nothing about its rules` };
  }
  return { kind: "unreachable", why: `status ${status ?? "none"}, error ${JSON.stringify(meta?.error ?? null)}` };
}

/** "the rule" as a meta or a person would quote it. */
const quoteRule = (rule) => (rule ? `"${rule.allow ? "Allow" : "Disallow"}: ${rule.pattern}"` : "no rule");

/**
 * Judge one site. Pure apart from `readCapture` (readRobotsCapture by default). Returns
 * { changed, why, verdicts, checked }: `verdicts` is the whole file's object — a new one with the entry rewritten
 * when `changed`, the same one otherwise — and `checked` lists each queued page's answer.
 */
export function judgeSite({ site, verdicts, urls, readCapture = (url) => readRobotsCapture(url), today }) {
  const entry = verdicts?.sites?.[site] ?? null;
  const decline = (why, checked = []) => ({ changed: false, why, verdicts, checked });
  if (entry === null) return decline(`${site} has no verdict in research/channel-loop/terms-verdicts.json`);
  if (entry.verdict === "NO_TERMS_ROBOTS_OK") return decline(`${site} is already NO_TERMS_ROBOTS_OK`);
  if (!isExhaustiveNegative(entry)) {
    return decline(
      `${site} is ${entry.verdict}${entry.note ? ` with the note "${entry.note}"` : " with no note"}: NO_TERMS_ROBOTS_OK is ` +
        "set only for a NO_TERMS site whose note opens exhaustive-negative (ruling 30.9 16(d) D2(iv)-(v))",
    );
  }

  const pages = queuedPaths(urls, site).filter((p) => !isRobotsProbe(p.url, p.slug));
  if (pages.length === 0) return decline(`${site} has no queued page in urls.txt besides a robots.txt probe: nothing to judge`);

  // One robots.txt per scheme, host and port the pages sit on, each read from its committed capture.
  const rulesByRobots = new Map();
  const cites = [];
  for (const page of pages) {
    const robotsUrl = robotsTxtUrl(page.url);
    if (rulesByRobots.has(robotsUrl)) continue;
    const origin = new URL(robotsUrl).origin;
    const capture = readCapture(robotsUrl);
    if (!capture) {
      return decline(
        `no committed robots.txt capture for ${origin}: queue ${robotsUrl} as a robots- probe line in urls.txt ` +
          "(a slug starting robots-), let render-watch fetch it, then run this again",
      );
    }
    const { meta, body, slug } = capture;
    const status = meta?.status;
    const where = `research/rendered/${slug}`;
    const readable = readableCapture(meta, body);
    if (readable.kind === "file") {
      const text = meta.truncated ? completeRobotsLines(body) : body;
      rulesByRobots.set(robotsUrl, robotsRulesFor(parseRobotsTxt(text)));
      const file = meta.bodyPath ? `research/rendered/${basename(meta.bodyPath)}` : `${where}.txt`;
      cites.push(`robots.txt read at ${file} (${robotsUrl}, fetched ${meta.fetchedAt}, sha256 ${String(meta.sha256 ?? "").slice(0, 12)})`);
    } else if (readable.kind === "absent") {
      rulesByRobots.set(robotsUrl, []);
      cites.push(`robots.txt answered ${status} at ${robotsUrl} (${where}.meta.json, fetched ${meta.fetchedAt}): no rules, RFC 9309 §2.3.1.3`);
    } else if (readable.kind === "refused") {
      return decline(
        `the robots.txt capture of ${origin} (${where}.meta.json) is not a robots.txt the site served: ${readable.why}. ` +
          "Ruling 30.9 16(d) D2(iv): a refusal or a bot challenge is the site's answer, and NO_TERMS_ROBOTS_OK is set only " +
          "on a robots.txt read (a 2xx text/plain file) or on a 404/410",
      );
    } else {
      return decline(
        `the robots.txt capture of ${origin} (${where}.meta.json) is not a read file (${readable.why}): RFC 9309 §2.3.1.4 ` +
          "reads that as complete disallow",
      );
    }
  }

  const checked = pages.map((page) => {
    const robotsUrl = robotsTxtUrl(page.url);
    const { allowed, rule } = robotsDecision(rulesByRobots.get(robotsUrl), page.url);
    return { ...page, robotsUrl, allowed, rule };
  });
  const refused = checked.filter((c) => !c.allowed);
  if (refused.length > 0) {
    return decline(
      `robots.txt disallows ${refused.length} queued path(s) for ${ROBOTS_PRODUCT_TOKEN}: ` +
        refused.map((c) => `${c.slug} (${c.url}, ${quoteRule(c.rule)})`).join("; "),
      checked,
    );
  }

  const n = pages.length;
  const next = {
    verdict: "NO_TERMS_ROBOTS_OK",
    source:
      `${cites.join("; ")}: all ${n} queued path${n === 1 ? "" : "s"} allowed for ${ROBOTS_PRODUCT_TOKEN} ` +
      `(scripts/robots-verdict.mjs); ruling ${RULING}; NO_TERMS before: ${entry.source}`,
    checked: today,
    ...(entry.note ? { note: entry.note } : {}),
  };
  return {
    changed: true,
    why: `every queued path of ${site} is allowed`,
    verdicts: { ...verdicts, sites: { ...verdicts.sites, [site]: next } },
    checked,
  };
}

function main(argv) {
  const { values, positionals } = parseArgs({
    args: argv,
    allowPositionals: true,
    options: {
      apply: { type: "boolean", default: false },
      verdicts: { type: "string", default: VERDICTS },
      urls: { type: "string", default: URLS },
      rendered: { type: "string", default: RENDERED },
    },
  });
  if (positionals.length !== 1) throw new Error("usage: node scripts/robots-verdict.mjs <site> [--apply]");
  const site = positionals[0].toLowerCase();
  const verdicts = JSON.parse(readFileSync(values.verdicts, "utf8"));
  const out = judgeSite({
    site,
    verdicts,
    urls: readFileSync(values.urls, "utf8"),
    readCapture: (url) => readRobotsCapture(url, values.rendered),
    today: new Date().toISOString().slice(0, 10),
  });
  console.log(`robots-verdict: ${site} (${verdicts.sites?.[site]?.verdict ?? "no verdict"})`);
  for (const c of out.checked) {
    console.log(`  ${c.allowed ? "allowed    " : "DISALLOWED "} ${c.slug}  ${c.url}  (${c.state}; ${quoteRule(c.rule)})`);
  }
  if (!out.changed) {
    console.log(`no change: ${out.why}`);
    return 3;
  }
  const entry = out.verdicts.sites[site];
  if (values.apply) {
    writeFileSync(values.verdicts, serializeVerdicts(out.verdicts));
    console.log(`set ${site} to NO_TERMS_ROBOTS_OK in ${values.verdicts}`);
    console.log("  its paused lines now pass the terms gate; un-pausing them is a separate, reviewed edit of urls.txt");
  } else {
    console.log(`would set ${site} to NO_TERMS_ROBOTS_OK (dry run; --apply writes ${values.verdicts})`);
  }
  console.log(`  source: ${entry.source}`);
  return 0;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  let code;
  try {
    code = main(process.argv.slice(2));
  } catch (err) {
    console.error(`robots-verdict: ${err.message}`);
    code = 1;
  }
  process.exit(code);
}
