#!/usr/bin/env node
/**
 * robots-verdict — set NO_TERMS_ROBOTS_OK for one site, only when its robots.txt allows every path we queued; and
 * re-check every site it set against the robots.txt the weekly render keeps current.
 *
 *   node scripts/robots-verdict.mjs <site> [--apply]
 *     [--verdicts research/channel-loop/terms-verdicts.json] [--urls research/rendered/urls.txt]
 *     [--rendered research/rendered]
 *   node scripts/robots-verdict.mjs --recheck [--apply] [--site <site>]
 *     [--verdicts research/channel-loop/terms-verdicts.json] [--urls <list>]... [--rendered research/rendered]
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
 *      capture (file, URL, fetchedAt, sha256) and the ruling, the old NO_TERMS source kept at its end, and every field
 *      it does not set kept as it was (the note; since 6.10 the copying field, RULING-2026-10-06-robots-and-terms.md
 *      decision 4(2)). Nothing else in the file changes, and the file keeps its exact format (serializeVerdicts)
 * Steps 2-4 are judgeRobots, which --recheck shares.
 *
 * Dry run by default: it prints each page's answer and what it would write. --apply writes terms-verdicts.json. It
 * never touches urls.txt: un-pausing a site's lines is a separate, reviewed edit.
 *
 * Exit codes: 0 — the verdict is (or, dry, would be) set; 3 — nothing to change, and the output says why;
 * 1 — a usage or read error.
 *
 * --RECHECK (logs/CHANNEL_LOOP.md §9, "Queued 6.10 (tick 54)" item 3; built in tick 58). Since tick 54 each source cites
 * a dated frozen copy of the robots.txt capture it was set on (research/rendered/robots-<x>-<date>.txt, or its .meta.json
 * for a 404; scripts/freeze-capture.mjs), so the weekly render, which rewrites the live capture robots-<x> whenever the
 * site's robots.txt changes, never moves what a verdict rests on, and no test sees that change either. --recheck looks.
 * For every NO_TERMS_ROBOTS_OK site (--site: that one only, and exit 1 for a site that is not in the file or has another
 * verdict; a site with any other verdict is never touched) whose
 * source opens with the citation step 5 writes (parseRobotsSource), naming a frozen copy that holds what the citation
 * says (its url, fetchedAt, sha256 prefix or 404 status), it reads the live capture of the same robots.txt URL
 * (readRobotsCapture) and says one of:
 *   unchanged    the live capture's body is the frozen copy's bytes; or both answered 404/410 (no rules either way)
 *   unreachable  there is no live capture, or it is no robots.txt read (a 401/403/429, an HTML page, a 5xx, no answer:
 *                readableCapture): reported, nothing changes. Render-watch's run-time check still reads that answer
 *                before it fetches a page
 *   refresh      the robots.txt changed (a 200 to a 404 included: no rules, RFC 9309 §2.3.1.3 and ruling 6.10) and
 *                judgeRobots, run on the live capture, still allows every queued path: the live capture is frozen as a
 *                new dated copy (freeze-capture's freezeCapture, FROZEN.sha256 following; only the meta and the files it
 *                names, and always the live meta's version: liveVersion; a planned copy that is not the live answer is
 *                an error, nothing frozen), the source's citation is rewritten to name the copy, its fetchedAt and sha256, the rest of the
 *                source ("all N queued paths allowed ...; NO_TERMS before: ...") and every other field stay byte for
 *                byte, and the note gains one dated sentence: "Re-checked <date>: robots.txt changed (<old sha12> →
 *                <new sha12>), all N queued paths still allowed."
 *   revert       some queued path is now disallowed: the copy is frozen as for refresh, the verdict goes back to
 *                NO_TERMS, the source records the declined judgement (the new citation, judgeRobots' reason naming
 *                each disallowed path and its rule, the ruling, "NO_TERMS_ROBOTS_OK before: " and the old source),
 *                checked becomes the day, and the note keeps its opening kind word "exhaustive-negative" and gains a
 *                dated sentence naming the disallowed path(s), so the site can be judged again (step 1) on a later
 *                robots.txt
 *   error        the source names no frozen copy, the copy does not hold what it says, the robots.txt changed but no
 *                page of the site is queued, or a freeze was refused
 * The queued paths are read from every --urls list (default: research/rendered/urls.txt and
 * research/measurements/ai-allowed-events.urls.txt, where the prize lines are), each line once. A changed live capture
 * must be committed (a freeze names the commit its bytes came from) when --rendered is the repository's own.
 * urls.txt after a revert: --recheck changes nothing in it. The site's prize lines are gated by its verdict (termsGate,
 * scripts/queue-zero-test.mjs), so they stop passing the moment the verdict is NO_TERMS; its robots probe line stays
 * active, since termsGate passes a probe for an exhaustive-negative NO_TERMS site, and the weekly run keeps the live
 * capture fresh for the next --recheck; no line is paused. A paused line whose comment names the site's verdict
 * (agenthon.net's and eurocontrol.int's read terms lines) then names a stale one, so urls-pause-comments.test.ts fails until
 * `node scripts/urls-pause-comments.mjs --fix` rewrites that word, which pauses and un-pauses nothing.
 * When it runs: the 07:11 Tuesday tick, after it has read the weekly render's commit (render-watch.yml, Tuesday 05:23
 * UTC) and before any dispatch (research/rendered/README.md): dry, then --apply when a site changed, a commit of the copies
 * and the file, then scripts/verify.sh. The tests that hold what ticks 45 to 57 left read the verdicts as they stood before
 * any re-check (beforeRechecks, with the 18 entries of 5c980e3 in src/__tests__/revenue/fixtures/
 * terms-verdicts-5c980e3-robots-ok.json), so a refresh or a revert leaves them green. Measured on a copy of the store for all
 * 18 sites at once (tick 58 review fix), what else needs a hand edit: after a revert, the urls-pause-comments --fix above;
 * after a refresh or a revert of eurocontrol.int or agenthon.net, the mutation plan's T57-D and T57B-D entries whose find
 * text the rewrite moved (src/__tests__/revenue/mutations/robots-verdict.json; mutation-plans.test.ts names them: T57-D2,
 * D5, D6 and T57B-D2 after a refresh, T57-D1, T57B-D1 and T57B-D2 after a revert), retargeted at the entry's text now or
 * dropped with a line in the tick's log. Nothing else turned red.
 * Dry run by default: one line per site with its outcome (and, for refresh and revert, each queued path's answer, the
 * copy it would freeze and the sentence it would add), then a totals line. --apply freezes and writes
 * terms-verdicts.json through serializeVerdicts. It never fetches anything. Exit codes: 0 — something was (or, dry,
 * would be) changed; 3 — nothing to change (every site unchanged or unreachable); 1 — an error (a usage or read error,
 * or an error line; with --apply the other sites are still written).
 */
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, readdirSync, readFileSync, realpathSync, writeFileSync } from "node:fs";
import { basename, join, relative, resolve } from "node:path";
import { parseArgs } from "node:util";
import { fileURLToPath } from "node:url";
import { CAPTURE_EXTS, diskFiles, existingCopy, freezeCapture, frozenName, isSlug, maskCapture, RENDERED_REL, sourceVersion } from "./freeze-capture.mjs";
import { PRIZE_URLS } from "./prize-dispatch.mjs";
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

/**
 * The order of a site entry's fields in terms-verdicts.json. "copying" (since 6.10: "barred" | "allowed" | "unread",
 * RULING-2026-10-06-robots-and-terms.md decision 4(2)) comes after "note", or after "checked" when there is no note; a
 * field not listed here keeps its own order after these.
 */
export const ENTRY_FIELDS = ["verdict", "source", "checked", "note", "copying"];

/** A site entry with its fields in ENTRY_FIELDS order, then any other field in the order it had. A new object. */
export function orderEntry(entry) {
  const out = {};
  for (const k of ENTRY_FIELDS) if (Object.hasOwn(entry, k)) out[k] = entry[k];
  for (const [k, v] of Object.entries(entry)) if (!Object.hasOwn(out, k)) out[k] = v;
  return out;
}

/**
 * terms-verdicts.json exactly as it is committed: one-space indent, no trailing newline, and every site entry's fields
 * in ENTRY_FIELDS order, so the file has one exact format whatever order a writer built an entry in.
 */
export function serializeVerdicts(verdicts) {
  const sites = verdicts?.sites;
  if (sites === null || typeof sites !== "object" || Array.isArray(sites)) return JSON.stringify(verdicts, null, 1);
  const ordered = Object.fromEntries(
    Object.entries(sites).map(([site, entry]) => [site, entry !== null && typeof entry === "object" && !Array.isArray(entry) ? orderEntry(entry) : entry]),
  );
  return JSON.stringify({ ...verdicts, sites: ordered }, null, 1);
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

/** The bytes of the body a capture's meta names (bodyPath, looked up in renderedDir by its file name), or null. */
function bodyBytes(meta, renderedDir) {
  const file = meta?.bodyPath ? join(renderedDir, basename(meta.bodyPath)) : null;
  return file && existsSync(file) ? readFileSync(file) : null;
}

/**
 * The committed robots- capture of one robots.txt URL: { slug, meta, body, bytes } from research/rendered/robots-*.meta.json
 * whose `url` is that URL and that is not a frozen copy, with the stored body as text and as bytes (both null when the
 * capture stored none), or null when there is none.
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
    // A dated frozen copy (scripts/freeze-capture.mjs) keeps the live capture's url, and its name sorts first; it is a
    // record of what one fetch said, not the robots.txt the weekly render keeps current.
    if (meta?.frozen) continue;
    let url;
    try {
      url = new URL(meta?.url).href;
    } catch {
      continue;
    }
    if (url !== robotsUrl) continue;
    const bytes = bodyBytes(meta, renderedDir);
    return { slug: name.replace(/\.meta\.json$/, ""), meta, body: bytes === null ? null : bytes.toString("utf8"), bytes };
  }
  return null;
}

/** One capture by its slug, live or frozen: { slug, meta, body, bytes } as readRobotsCapture returns it, or null. */
export function readCaptureBySlug(slug, renderedDir = RENDERED) {
  if (!isSlug(slug)) return null;
  const path = join(renderedDir, `${slug}.meta.json`);
  if (!existsSync(path)) return null;
  let meta;
  try {
    meta = JSON.parse(readFileSync(path, "utf8"));
  } catch {
    return null;
  }
  const bytes = bodyBytes(meta, renderedDir);
  return { slug, meta, body: bytes === null ? null : bytes.toString("utf8"), bytes };
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
 * The citation of one robots.txt a verdict rests on, as a source records it: "robots.txt read at <file> (<url>, fetched
 * <fetchedAt>, sha256 <12 hex>)" for a file, "robots.txt answered <status> at <url> (<meta>, fetched <fetchedAt>): no
 * rules, RFC 9309 §2.3.1.3" for a 404 or 410. `capture` is { slug, meta }, live or frozen: the citation names its files.
 * parseRobotsSource reads it back.
 */
export function robotsCite(robotsUrl, { slug, meta }, kind) {
  const where = `research/rendered/${slug}`;
  if (kind === "file") {
    const file = meta.bodyPath ? `research/rendered/${basename(meta.bodyPath)}` : `${where}.txt`;
    return `robots.txt read at ${file} (${robotsUrl}, fetched ${meta.fetchedAt}, sha256 ${String(meta.sha256 ?? "").slice(0, 12)})`;
  }
  return `robots.txt answered ${meta?.status} at ${robotsUrl} (${where}.meta.json, fetched ${meta.fetchedAt}): no rules, RFC 9309 §2.3.1.3`;
}

/** Each disallowed page with the rule that refuses it: "<slug> (<url>, \"Disallow: <pattern>\")", joined by "; ". */
const listRefused = (refused) => refused.map((c) => `${c.slug} (${c.url}, ${quoteRule(c.rule)})`).join("; ");

/**
 * Steps 2-4 for one site: its queued pages (every line of `urls` on the site, active or paused, each URL and slug once,
 * the robots- probes left out), the committed robots.txt capture of each host they sit on (`readCapture`), and each
 * page's answer. Returns { ok, kind, why, checked, cites, refused }: kind "allowed" (ok) when every page is allowed;
 * "disallowed" when some are (refused lists them, and why names each with its rule); "no-page", "no-capture", "refused"
 * (a capture that is not a robots.txt the site served) or "unreachable" (a 5xx, no answer) when nothing can be judged.
 * cites holds one citation (robotsCite) per robots.txt read, in page order. Shared by judgeSite and --recheck.
 */
export function judgeRobots({ site, urls, readCapture = (url) => readRobotsCapture(url) }) {
  const fail = (kind, why) => ({ ok: false, kind, why, checked: [], cites: [], refused: [] });
  const seen = new Set();
  const pages = queuedPaths(urls, site).filter((p) => {
    const key = `${p.url}\t${p.slug}`;
    if (isRobotsProbe(p.url, p.slug) || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
  if (pages.length === 0) return fail("no-page", `${site} has no queued page in urls.txt besides a robots.txt probe: nothing to judge`);

  // One robots.txt per scheme, host and port the pages sit on, each read from its committed capture.
  const rulesByRobots = new Map();
  const cites = [];
  for (const page of pages) {
    const robotsUrl = robotsTxtUrl(page.url);
    if (rulesByRobots.has(robotsUrl)) continue;
    const origin = new URL(robotsUrl).origin;
    const capture = readCapture(robotsUrl);
    if (!capture) {
      return fail(
        "no-capture",
        `no committed robots.txt capture for ${origin}: queue ${robotsUrl} as a robots- probe line in urls.txt ` +
          "(a slug starting robots-), let render-watch fetch it, then run this again",
      );
    }
    const { meta, body, slug } = capture;
    const where = `research/rendered/${slug}`;
    const readable = readableCapture(meta, body);
    if (readable.kind === "file") {
      const text = meta.truncated ? completeRobotsLines(body) : body;
      rulesByRobots.set(robotsUrl, robotsRulesFor(parseRobotsTxt(text)));
      cites.push(robotsCite(robotsUrl, capture, "file"));
    } else if (readable.kind === "absent") {
      rulesByRobots.set(robotsUrl, []);
      cites.push(robotsCite(robotsUrl, capture, "absent"));
    } else if (readable.kind === "refused") {
      return fail(
        "refused",
        `the robots.txt capture of ${origin} (${where}.meta.json) is not a robots.txt the site served: ${readable.why}. ` +
          "Ruling 30.9 16(d) D2(iv): a refusal or a bot challenge is the site's answer, and NO_TERMS_ROBOTS_OK is set only " +
          "on a robots.txt read (a 2xx text/plain file) or on a 404/410",
      );
    } else {
      return fail(
        "unreachable",
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
    return {
      ok: false,
      kind: "disallowed",
      why:
        `robots.txt disallows ${refused.length} queued path(s) for ${ROBOTS_PRODUCT_TOKEN}: ` +
        listRefused(refused),
      checked,
      cites,
      refused,
    };
  }
  return { ok: true, kind: "allowed", why: `every queued path of ${site} is allowed`, checked, cites, refused };
}

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

  const judged = judgeRobots({ site, urls, readCapture });
  if (!judged.ok) return decline(judged.why, judged.checked);

  const n = judged.checked.length;
  // Every field this does not set (the note, the copying field since 6.10, anything a later fold adds) is kept as it
  // was, in the file's field order (orderEntry): the robots verdict says nothing about them.
  const next = orderEntry({
    ...entry,
    verdict: "NO_TERMS_ROBOTS_OK",
    source:
      `${judged.cites.join("; ")}: all ${n} queued path${n === 1 ? "" : "s"} allowed for ${ROBOTS_PRODUCT_TOKEN} ` +
      `(scripts/robots-verdict.mjs); ruling ${RULING}; NO_TERMS before: ${entry.source}`,
    checked: today,
  });
  return {
    changed: true,
    why: `every queued path of ${site} is allowed`,
    verdicts: { ...verdicts, sites: { ...verdicts.sites, [site]: next } },
    checked: judged.checked,
  };
}

// ---------------------------------------------------------------------------------------------------------------------
// --recheck: a NO_TERMS_ROBOTS_OK site against the robots.txt the weekly render keeps current (the header comment).

const sha256 = (bytes) => createHash("sha256").update(bytes).digest("hex");
const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const SLUG = "[a-z0-9][a-z0-9._-]*";
const FILE_CITE = new RegExp(`^robots\\.txt read at research/rendered/(${SLUG})\\.txt \\((https?://\\S+?), fetched (\\S+), sha256 ([0-9a-f]{12})\\)$`);
const ABSENT_CITE = new RegExp(
  `^robots\\.txt answered (\\d{3}) at (https?://\\S+) \\(research/rendered/(${SLUG})\\.meta\\.json, fetched (\\S+)\\): no rules, RFC 9309 §2\\.3\\.1\\.3$`,
);
const SOURCE_TAIL = new RegExp(`: all (\\d+) queued paths? allowed for ${escapeRe(ROBOTS_PRODUCT_TOKEN)} \\(scripts/robots-verdict\\.mjs\\); ruling `);

/**
 * The citations a NO_TERMS_ROBOTS_OK source opens with, as judgeSite writes them (robotsCite, joined by "; ", then
 * ": all N queued paths allowed for MehudakRenderWatch (scripts/robots-verdict.mjs); ruling ..."): { cites, rest, n },
 * each cite { kind: "file", slug, robotsUrl, fetchedAt, sha12 } or { kind: "absent", status, robotsUrl, slug, fetchedAt }
 * with its text, and rest the source from ": all N" on. null for any other source.
 */
export function parseRobotsSource(source) {
  const text = String(source ?? "");
  const tail = SOURCE_TAIL.exec(text);
  if (!tail) return null;
  const cites = citesOf(text.slice(0, tail.index));
  return cites && { cites, rest: text.slice(tail.index), n: Number(tail[1]) };
}

/** The citations robotsCite writes, joined by "; ", read back (parseRobotsSource's cites), or null when one is not. */
function citesOf(text) {
  const cites = [];
  for (const part of text.split("; ")) {
    const file = FILE_CITE.exec(part);
    const absent = file ? null : ABSENT_CITE.exec(part);
    if (file) cites.push({ kind: "file", text: part, slug: file[1], robotsUrl: file[2], fetchedAt: file[3], sha12: file[4] });
    else if (absent) cites.push({ kind: "absent", text: part, status: Number(absent[1]), robotsUrl: absent[2], slug: absent[3], fetchedAt: absent[4] });
    else return null;
  }
  return cites;
}

/** Why a cited copy is not the frozen copy its citation says, or null when it is. */
function frozenProblem(cite, frozen) {
  const named = `research/rendered/${cite.slug}${cite.kind === "file" ? ".txt" : ".meta.json"}`;
  if (!frozen) return `the source cites ${named}, which is not on disk`;
  if (!frozen.meta?.frozen) {
    return `the source cites ${named}, a live capture the weekly run rewrites, not a frozen copy: freeze it (scripts/freeze-capture.mjs) and repoint the source first`;
  }
  let url = null;
  try {
    url = new URL(frozen.meta.url).href;
  } catch {
    /* no URL: refused below */
  }
  if (url !== cite.robotsUrl) return `${named} is a copy of ${frozen.meta.url}, not of ${cite.robotsUrl}`;
  if (frozen.meta.fetchedAt !== cite.fetchedAt) return `${named} was fetched ${frozen.meta.fetchedAt}, not ${cite.fetchedAt} as the source says`;
  const kind = readableCapture(frozen.meta, frozen.body).kind;
  if (kind !== cite.kind) return `${named} reads as ${kind}, not as the ${cite.kind === "file" ? "file" : "404/410"} the source cites`;
  if (cite.kind === "file" && sha256(frozen.bytes).slice(0, 12) !== cite.sha12) {
    return `${named} hashes to ${sha256(frozen.bytes).slice(0, 12)}, not ${cite.sha12} as the source says`;
  }
  if (cite.kind === "absent" && frozen.meta.status !== cite.status) return `${named} answered ${frozen.meta.status}, not ${cite.status} as the source says`;
  return null;
}

/**
 * The version of a live capture a freeze copies: freeze-capture's sourceVersion (the files as committed, and the commit
 * that wrote them; it refuses uncommitted changes) when renderedDir is a repository's research/rendered, else the files
 * on disk with no commit (a test's directory). Always the live meta: sourceVersion's failed-fetch fallback (a 404 or a
 * 5xx meta beside the body an earlier 200 left on disk, which render-watch does not delete) hands back that older read
 * page, which is right for a page a decision quotes and wrong here, where the answer itself is what is judged. Then the
 * version is the live meta and the files it names (namedFiles: the stale body stays out), as the commit that last wrote
 * them stored them (the working tree, which sourceVersion has found clean).
 */
export function liveVersion(renderedDir, slug) {
  const dir = resolve(renderedDir);
  const top = spawnSync("git", ["--no-optional-locks", "-C", dir, "rev-parse", "--show-toplevel"], { encoding: "utf8" });
  const root = top.status === 0 ? top.stdout.trim() : "";
  const own = root !== "" && existsSync(join(root, RENDERED_REL)) && realpathSync(join(root, RENDERED_REL)) === realpathSync(dir);
  if (!own) return { commit: null, files: diskFiles(slug, dir), note: null };
  const version = sourceVersion(root, slug);
  const live = diskFiles(slug, dir);
  if (version.files.get("meta.json")?.equals(live.get("meta.json"))) return version;
  const files = namedFiles(live);
  const rels = [...files.keys()].map((ext) => `${RENDERED_REL}/${slug}.${ext}`);
  const wrote = spawnSync("git", ["--no-optional-locks", "-C", root, "log", "-1", "--format=%h", "--", ...rels], { encoding: "utf8" });
  return { commit: wrote.status === 0 ? wrote.stdout.trim() || null : null, files, note: null };
}

const extOf = (path) => (typeof path === "string" ? (CAPTURE_EXTS.find((ext) => ext !== "meta.json" && path.endsWith(`.${ext}`)) ?? null) : null);

/** A capture's meta and the files it names (bodyPath, textPath): a stale body a failed fetch left beside it stays out. */
function namedFiles(files) {
  if (!files.has("meta.json")) return files;
  const meta = JSON.parse(files.get("meta.json").toString("utf8"));
  const keep = new Set(["meta.json", extOf(meta.bodyPath), extOf(meta.textPath)]);
  return new Map([...files].filter(([ext]) => keep.has(ext)));
}

const recheckWhy = (slug, commit, on) =>
  `A dated copy of the render-watch capture of ${slug}${commit ? ` as commit ${commit} stored it` : ""} (fetchedAt above), its meta ` +
  `and the files it names, made on ${on} by scripts/robots-verdict.mjs --recheck through scripts/freeze-capture.mjs's ` +
  "freezeCapture, so that research/channel-loop/terms-verdicts.json keeps pointing at the robots.txt answer the re-check " +
  "judged the site's queued paths on. Frozen with allowFlagged (frozen.flagged, when set): the answer itself is the claim " +
  "(a robots.txt file is short by nature; a 404 is what the host said). The slug is not in urls.txt, so render-watch " +
  `never rewrites these files; the live slug ${slug} stays on the weekly watch.`;

/**
 * The frozen copy --recheck would make of a live robots- capture, without writing: { capture, options, plan }. capture
 * is the copy as judgeRobots reads it ({ slug, meta, body, bytes }); options is what freezeCapture writes it with. The
 * name: an existing frozen copy with the same bytes (existingCopy), else <slug>-<fetchedAt day>, or that with the commit
 * (or the meta's hash) appended when the name holds other bytes, as freeze-capture --cited names one.
 */
function planCopy({ live, renderedDir, urlsText, today, versionOf }) {
  const version = versionOf(live.slug);
  const files = namedFiles(version.files);
  let frozenSlug = existingCopy(renderedDir, live.slug, maskCapture(files, today).files);
  if (!frozenSlug) {
    frozenSlug = frozenName(live.slug, JSON.parse(files.get("meta.json").toString("utf8")));
    if (CAPTURE_EXTS.some((ext) => existsSync(join(renderedDir, `${frozenSlug}.${ext}`)))) {
      frozenSlug = `${frozenSlug}-${version.commit ?? sha256(files.get("meta.json")).slice(0, 7)}`;
    }
  }
  const options = {
    slug: live.slug,
    files,
    dir: renderedDir,
    urlsText,
    on: today,
    commit: version.commit,
    why: recheckWhy(live.slug, version.commit, today),
    allowFlagged: true,
    frozenSlug,
  };
  const plan = freezeCapture({ ...options, dryRun: true });
  if (plan.already) return { capture: readCaptureBySlug(plan.frozenSlug, renderedDir), options, plan };
  const meta = JSON.parse(plan.writes.find((w) => w.ext === "meta.json").bytes.toString("utf8"));
  const body = plan.writes.find((w) => w.ext === extOf(meta.bodyPath)) ?? null;
  return { capture: { slug: plan.frozenSlug, meta, body: body ? body.bytes.toString("utf8") : null, bytes: body ? body.bytes : null }, options, plan };
}

/** The note with one more sentence after it. */
const withSentence = (note, sentence) => (!note ? sentence : /[.!?]$/.test(note) ? `${note} ${sentence}` : `${note}. ${sentence}`);

/**
 * Re-check one site. Pure apart from reading renderedDir (and, through versionOf, git); it writes nothing. Returns
 * { site, outcome, why, checked, changes, freezes, entry, sentence }: outcome "unchanged", "unreachable", "refresh",
 * "revert", "error", or "skipped" for a site that is not NO_TERMS_ROBOTS_OK (never touched); for refresh and revert,
 * entry is the rewritten entry, freezes the copies to write first (freezeCapture options), checked each queued page's
 * answer and sentence the note's new sentence.
 */
export function recheckSite({ site, entry, urls, urlsText = urls, renderedDir = RENDERED, today, versionOf = (slug) => liveVersion(renderedDir, slug) }) {
  const out = (outcome, why, more = {}) => ({ site, outcome, why, checked: [], changes: [], freezes: [], entry: null, sentence: null, ...more });
  if (entry?.verdict !== "NO_TERMS_ROBOTS_OK") {
    return out("skipped", `${site} is ${entry?.verdict ?? "not in the file"}: only a NO_TERMS_ROBOTS_OK site is re-checked`);
  }
  const parsed = parseRobotsSource(entry.source);
  if (!parsed) {
    return out(
      "error",
      'its source does not open with the citation scripts/robots-verdict.mjs writes ("robots.txt read at …" or "robots.txt ' +
        'answered 404 at …", then ": all N queued paths allowed …"): nothing to re-check against',
    );
  }

  // Each cited robots.txt: the frozen copy (it must hold what the citation says) and the live capture of the same URL.
  const hosts = [];
  for (const cite of parsed.cites) {
    const frozen = readCaptureBySlug(cite.slug, renderedDir);
    const problem = frozenProblem(cite, frozen);
    if (problem) return out("error", problem);
    const from = cite.kind === "file" ? cite.sha12 : `HTTP ${cite.status}`;
    const live = readRobotsCapture(cite.robotsUrl, renderedDir);
    if (!live) {
      hosts.push({ cite, frozen, state: "unreachable", why: `${cite.robotsUrl}: no live capture of it in research/rendered (its robots- probe line's)` });
      continue;
    }
    const at = `research/rendered/${live.slug}.meta.json`;
    const now = readableCapture(live.meta, live.body);
    if (now.kind !== "file" && now.kind !== "absent") {
      hosts.push({ cite, frozen, live, state: "unreachable", why: `${cite.robotsUrl}: the live capture (${at}) is no robots.txt read: ${now.why}` });
      continue;
    }
    const same = now.kind === "absent" ? cite.kind === "absent" : cite.kind === "file" && live.bytes.equals(frozen.bytes);
    const to = now.kind === "file" ? sha256(live.bytes).slice(0, 12) : `HTTP ${live.meta.status}`;
    const why = !same
      ? `${cite.robotsUrl}: robots.txt changed (${from} → ${to})`
      : now.kind === "file"
        ? `${cite.robotsUrl}: the live capture research/rendered/${basename(live.meta.bodyPath)} is the bytes of the frozen copy research/rendered/${cite.slug}.txt (sha256 ${from})`
        : `${cite.robotsUrl}: the live capture (${at}) answered ${live.meta.status}, as the frozen copy research/rendered/${cite.slug}.meta.json did (${cite.status}): no rules either way`;
    hosts.push({ cite, frozen, live, state: same ? "same" : "changed", from, to, why });
  }
  const unreachable = hosts.filter((h) => h.state === "unreachable");
  if (unreachable.length) return out("unreachable", unreachable.map((h) => h.why).join("; "));
  const changed = hosts.filter((h) => h.state === "changed");
  if (changed.length === 0) return out("unchanged", hosts.map((h) => h.why).join("; "));

  // The robots.txt changed: every queued path is judged again (judgeRobots), on the copy that would be frozen of each
  // changed capture and on the frozen copy of each unchanged one, so the citations name files no render rewrites.
  const planned = [];
  const freezeView = (live) => {
    const p = planCopy({ live, renderedDir, urlsText, today, versionOf });
    // The copy must hold the live answer: the robots.txt's bytes, or the same 404/410. A copy of another version (an
    // older one a fallback handed back) would cite an answer the site no longer gives, and every later run would find
    // the same change again.
    const now = readableCapture(live.meta, live.body).kind;
    const kind = p.capture ? readableCapture(p.capture.meta, p.capture.body).kind : "missing";
    const holds = kind === now && (now === "file" ? p.capture.bytes.equals(live.bytes) : p.capture.meta.status === live.meta.status);
    if (!holds) {
      throw new Error(
        `the copy ${p.plan.frozenSlug} a freeze of research/rendered/${live.slug} would cite is not its live answer (it reads as ` +
          `${kind}${p.capture?.meta?.status ? ` ${p.capture.meta.status}` : ""}, the live capture as ${now} ${live.meta.status}): nothing frozen or written`,
      );
    }
    planned.push(p);
    return p.capture;
  };
  const views = new Map(hosts.map((h) => [h.cite.robotsUrl, h.state === "same" ? h.frozen : freezeView(h.live)]));
  const readCapture = (url) => {
    if (!views.has(url)) {
      // A host the source does not cite (a page queued on it since): its live capture, frozen when it is a robots.txt read.
      const live = readRobotsCapture(url, renderedDir);
      const kind = live ? readableCapture(live.meta, live.body).kind : null;
      views.set(url, kind === "file" || kind === "absent" ? freezeView(live) : live);
    }
    return views.get(url);
  };
  const judged = judgeRobots({ site, urls, readCapture });
  const change = changed.length === 1 ? `${changed[0].from} → ${changed[0].to}` : changed.map((h) => `${h.cite.robotsUrl}: ${h.from} → ${h.to}`).join("; ");
  const n = judged.checked.length;
  const paths = `${n} queued path${n === 1 ? "" : "s"}`;
  const freezes = planned.filter((p) => judged.cites.some((c) => c.includes(`research/rendered/${p.capture.slug}.`)));
  const more = { checked: judged.checked, changes: changed.map((h) => ({ robotsUrl: h.cite.robotsUrl, from: h.from, to: h.to })), freezes };
  if (judged.kind === "allowed") {
    const sentence = `Re-checked ${today}: robots.txt changed (${change}), all ${paths} still allowed.`;
    // Only the citation moves: the rest of the source, from ": all N queued paths" on, and every other field stay.
    const next = orderEntry({ ...entry, source: `${judged.cites.join("; ")}${parsed.rest}`, note: withSentence(entry.note, sentence) });
    return out("refresh", `robots.txt changed (${change}); all ${paths} still allowed`, { ...more, entry: next, sentence });
  }
  if (judged.kind === "disallowed") {
    const sentence =
      `Re-checked ${today}: robots.txt changed (${change}) and now disallows ${judged.refused.length} of ${paths} for ` +
      `${ROBOTS_PRODUCT_TOKEN}: ${listRefused(judged.refused)}; the verdict is NO_TERMS again (scripts/robots-verdict.mjs ` +
      "--recheck), and the robots probe stays on the weekly watch.";
    const next = orderEntry({
      ...entry,
      verdict: "NO_TERMS",
      source:
        `${judged.cites.join("; ")}: ${judged.why} (re-checked ${today} by scripts/robots-verdict.mjs --recheck); ` +
        `ruling ${RULING}; NO_TERMS_ROBOTS_OK before: ${entry.source}`,
      checked: today,
      note: withSentence(entry.note, sentence),
    });
    return out("revert", `robots.txt changed (${change}); ${judged.why}`, { ...more, entry: next, sentence });
  }
  if (judged.kind === "no-page") return out("error", `robots.txt changed (${change}), but ${judged.why}: pass --urls with the list that queues them`);
  return out("unreachable", `robots.txt changed (${change}), but ${judged.why}`);
}

// ---------------------------------------------------------------------------------------------------------------------
// History: what an entry was before --recheck rewrote it, for the tests that reconstruct what an earlier tick left.

const DAY = "\\d{4}-\\d{2}-\\d{2}";
const TOKEN_RE = escapeRe(ROBOTS_PRODUCT_TOKEN);
/** The sentence a refresh adds to the note (recheckSite). */
const REFRESH_SENTENCE = new RegExp(`^Re-checked (${DAY}): robots\\.txt changed \\((.+?)\\), all (\\d+) queued paths? still allowed\\.`);
/** The sentence a revert adds to the note, always its last (recheckSite). */
const REVERT_SENTENCE = new RegExp(
  `^Re-checked (${DAY}): robots\\.txt changed \\((.+?)\\) and now disallows (\\d+) of (\\d+) queued paths? for ${TOKEN_RE}: (.+); ` +
    "the verdict is NO_TERMS again \\(scripts/robots-verdict\\.mjs --recheck\\), and the robots probe stays on the weekly watch\\.$",
);
/** What a revert's source puts between its citations and the NO_TERMS_ROBOTS_OK source it replaced (recheckSite). */
const REVERT_MARK = new RegExp(
  `: robots\\.txt disallows \\d+ queued path\\(s\\) for ${TOKEN_RE}: .+? \\(re-checked (${DAY}) by scripts/robots-verdict\\.mjs --recheck\\); ` +
    `ruling ${escapeRe(RULING)}; NO_TERMS_ROBOTS_OK before: `,
);

/**
 * A revert's source as recheckSite writes it, read back: { cites, day, replaced }, cites as parseRobotsSource reads them,
 * day the re-check's, replaced the NO_TERMS_ROBOTS_OK source it replaced; null for any other source.
 */
export function parseRevertSource(source) {
  const text = String(source ?? "");
  const mark = REVERT_MARK.exec(text);
  if (!mark) return null;
  const cites = citesOf(text.slice(0, mark.index));
  return cites && { cites, day: mark[1], replaced: text.slice(mark.index + mark[0].length) };
}

/**
 * Is `now` the entry `before` after zero or more --recheck rewrites, and nothing else? `before` must be a NO_TERMS_ROBOTS_OK
 * entry whose source opens with the citation judgeSite writes. A refresh moves only the source's citation (the rest of the
 * source, from ": all N queued paths" on, stays) and adds one note sentence; a revert, the last rewrite there can be, sets
 * NO_TERMS, checked to its day, a source of its citations, its reason and the source it replaced, and a last note sentence of
 * the same day. Every other field is the same, in the same order, and the old note is kept whole at the note's start.
 */
export function isRecheckOf(now, before) {
  const plain = (e) => e !== null && typeof e === "object" && !Array.isArray(e);
  if (!plain(now) || !plain(before)) return false;
  if (JSON.stringify(now) === JSON.stringify(before)) return true;
  const base = before.verdict === "NO_TERMS_ROBOTS_OK" ? parseRobotsSource(before.source) : null;
  if (!base) return false;
  if (Object.keys(now).join("\n") !== Object.keys(orderEntry({ ...before, note: before.note ?? "" })).join("\n")) return false;
  for (const k of Object.keys(now)) {
    if (!["verdict", "source", "checked", "note"].includes(k) && JSON.stringify(now[k]) !== JSON.stringify(before[k])) return false;
  }
  // The note: the old one whole, then each re-check's sentence, joined as withSentence joins them.
  const old = before.note ?? "";
  const joiner = !old ? "" : /[.!?]$/.test(old) ? " " : ". ";
  if (typeof now.note !== "string" || !now.note.startsWith(`${old}${joiner}`)) return false;
  let rest = now.note.slice(old.length + joiner.length);
  let refreshes = 0;
  for (let m = REFRESH_SENTENCE.exec(rest); m; m = REFRESH_SENTENCE.exec(rest)) {
    refreshes += 1;
    rest = rest.slice(m[0].length);
    if (rest === "") break;
    if (!rest.startsWith(" ")) return false;
    rest = rest.slice(1);
  }
  const source = String(now.source ?? "");
  if (now.verdict === "NO_TERMS_ROBOTS_OK") {
    const parsed = parseRobotsSource(source);
    return refreshes > 0 && rest === "" && now.checked === before.checked && parsed !== null && parsed.rest === base.rest;
  }
  if (now.verdict !== "NO_TERMS") return false;
  const revert = REVERT_SENTENCE.exec(rest);
  const declined = parseRevertSource(source);
  if (!revert || !declined || revert[1] !== declined.day || now.checked !== revert[1]) return false;
  const { replaced } = declined;
  if (refreshes === 0) return replaced === before.source;
  return parseRobotsSource(replaced)?.rest === base.rest;
}

/**
 * `sites` with each entry of `base` put back where the entry in `sites` is that entry after --recheck rewrites
 * (isRecheckOf): the verdicts as they stood before any re-check, for a test that reconstructs what an earlier tick left.
 * Every other entry is kept as it is (a hand edit, a judgeSite set after a revert), so a test still sees it. A new object.
 */
export function beforeRechecks(sites, base) {
  const out = { ...sites };
  for (const [site, entry] of Object.entries(base)) if (Object.hasOwn(sites, site) && isRecheckOf(sites[site], entry)) out[site] = entry;
  return out;
}

const OUTCOMES = ["unchanged", "unreachable", "refresh", "revert", "error"];

function recheckMain(values) {
  const today = new Date().toISOString().slice(0, 10);
  const raw = readFileSync(values.verdicts, "utf8");
  const verdicts = JSON.parse(raw);
  const sites = verdicts?.sites;
  if (sites === null || typeof sites !== "object" || Array.isArray(sites)) throw new Error(`${values.verdicts} has no "sites" object`);
  // The file is written back only in its one exact format, so a file not in it is refused before anything is frozen.
  if (values.apply && serializeVerdicts(verdicts) !== raw) {
    throw new Error(`${values.verdicts} is not in the format serializeVerdicts writes: nothing written`);
  }
  const lists = values.urls?.length ? values.urls : [URLS, PRIZE_URLS];
  const urls = lists.map((file) => readFileSync(file, "utf8")).join("\n");
  let names = Object.keys(sites).filter((s) => sites[s]?.verdict === "NO_TERMS_ROBOTS_OK");
  if (values.site !== undefined) {
    const site = values.site.toLowerCase();
    if (!Object.hasOwn(sites, site)) throw new Error(`--site ${site}: no such site in ${values.verdicts}`);
    if (!names.includes(site)) throw new Error(`--site ${site}: it is ${sites[site]?.verdict}, and only a NO_TERMS_ROBOTS_OK site is re-checked`);
    names = [site];
  }
  console.log(
    `robots-verdict --recheck: ${names.length} NO_TERMS_ROBOTS_OK site(s); queued paths from ${lists.map((file) => relative(process.cwd(), file) || file).join(", ")}` +
      `${values.apply ? "" : " (dry run; --apply writes)"}`,
  );
  let next = verdicts;
  let copies = 0;
  const results = [];
  for (const site of names) {
    let r;
    try {
      r = recheckSite({ site, entry: sites[site], urls, renderedDir: values.rendered, today });
    } catch (err) {
      r = { site, outcome: "error", why: err.message, checked: [], freezes: [], sentence: null };
    }
    if (values.apply && (r.outcome === "refresh" || r.outcome === "revert")) {
      try {
        for (const f of r.freezes) {
          freezeCapture({ ...f.options, dryRun: false });
          copies += 1;
        }
        next = { ...next, sites: { ...next.sites, [site]: r.entry } };
      } catch (err) {
        r = { ...r, outcome: "error", why: `${r.why}; a freeze failed, so the entry is not written: ${err.message}` };
      }
    }
    results.push(r);
    console.log(`  ${r.outcome.padEnd(11)} ${site}  ${r.why}`);
    if (r.outcome !== "refresh" && r.outcome !== "revert") continue;
    for (const c of r.checked) {
      console.log(`      ${c.allowed ? "allowed    " : "DISALLOWED "} ${c.slug}  ${c.url}  (${c.state}; ${quoteRule(c.rule)})`);
    }
    for (const f of r.freezes) {
      console.log(`      ${values.apply ? "froze" : "would freeze"} ${f.options.slug} -> ${f.plan.frozenSlug}${f.plan.already ? " (already frozen)" : ""}`);
    }
    console.log(`      ${r.outcome === "revert" ? "verdict NO_TERMS; " : ""}the note gains: ${r.sentence}`);
  }
  const count = (o) => results.filter((r) => r.outcome === o).length;
  console.log(`totals: ${results.length} site(s): ${OUTCOMES.map((o) => `${count(o)} ${o}`).join(", ")}`);
  if (next !== verdicts) {
    writeFileSync(values.verdicts, serializeVerdicts(next));
    console.log(`wrote ${count("refresh") + count("revert")} entr(ies) of ${values.verdicts} and ${copies} frozen cop(ies), FROZEN.sha256 following`);
  } else {
    console.log(values.apply ? "nothing written" : "dry run: nothing written");
  }
  if (count("error") > 0) return 1;
  return count("refresh") + count("revert") > 0 ? 0 : 3;
}

function main(argv) {
  const { values, positionals } = parseArgs({
    args: argv,
    allowPositionals: true,
    options: {
      apply: { type: "boolean", default: false },
      recheck: { type: "boolean", default: false },
      site: { type: "string" },
      verdicts: { type: "string", default: VERDICTS },
      urls: { type: "string", multiple: true },
      rendered: { type: "string", default: RENDERED },
    },
  });
  if (values.recheck) {
    if (positionals.length !== 0) throw new Error("usage: node scripts/robots-verdict.mjs --recheck [--apply] [--site <site>] (--site names one site)");
    return recheckMain(values);
  }
  if (values.site !== undefined) throw new Error("--site goes with --recheck; to judge one site, name it: node scripts/robots-verdict.mjs <site>");
  if (positionals.length !== 1) throw new Error("usage: node scripts/robots-verdict.mjs <site> [--apply] | --recheck [--apply] [--site <site>]");
  if ((values.urls?.length ?? 0) > 1) throw new Error("one --urls list when judging one site (--recheck reads several)");
  const site = positionals[0].toLowerCase();
  const verdicts = JSON.parse(readFileSync(values.verdicts, "utf8"));
  const out = judgeSite({
    site,
    verdicts,
    urls: readFileSync(values.urls?.[0] ?? URLS, "utf8"),
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
