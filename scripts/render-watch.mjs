#!/usr/bin/env node
/**
 * render-watch — fetch the handful of web pages this repo's research says would
 * settle a question, from a host that actually has egress.
 *
 * WHY THIS EXISTS.
 *
 * Three measurements in `research/measurements/` end the same way: a verdict of
 * UNKNOWN, and a sentence naming one page that would change it. Not a search, not
 * a summary — one page. Every one of them is [BLOCKED] from the container the
 * research ran in, and so is `web.archive.org`, which is the usual rescue
 * (`research/measurements/freemius-rail.md` records the 403 from the egress
 * proxy, one attempt each, no routing around it).
 *
 * GitHub Actions runners have egress. `.github/workflows/pcn874-spec-watch.yml`
 * already proves the shape works for one document. This is the same idea widened
 * to a list: fetch, store the bytes, store a readable text extraction, store a
 * hash, and let a later session read the page out of the repository and grade a
 * claim [RENDERED] instead of [SNIPPET]. For a PDF the readable text comes from
 * pdftotext on the runner, because the container the research runs in has no PDF
 * extractor at all (28.9.2026: the CrazyGames developer terms were captured as a
 * PDF and could not be read).
 *
 * WHAT IT IS NOT. It does not read the pages, and it does not decide anything.
 * Storing bytes is not evidence of a fact; a human or an agent that reads the
 * text is. `research/rendered/README.md` says how that hand-off works.
 *
 * BEHAVIOUR.
 *   - every URL in research/rendered/urls.txt is fetched with an identifying
 *     User-Agent (USER_AGENT: the brand, never a username or the repository URL)
 *     and a 30 s timeout
 *   - before the first page of a host, that host's /robots.txt is fetched once for
 *     the run (robotsChecker) and read per RFC 9309 for the product token
 *     MehudakRenderWatch, else `*`, up to 500 KiB (ROBOTS_MAX_BYTES; a file cut short
 *     is read only to its last complete line). A URL it disallows is not fetched, and
 *     nor is anything on a host whose robots.txt answered 5xx or 429, redirected
 *     anywhere but another /robots.txt, or could not be reached; the meta records
 *     `robots` (allowed | disallowed | none | unreachable) and `robotsUrl`. In plain
 *     mode every redirect hop is checked the same way before it is requested; the js
 *     mode's limits are below. A host refused on its terms (TERMS_BARRED, tiktok.com)
 *     gets no request of any kind, its robots.txt included (in the js mode, with the
 *     limits stated for tiktok.com at the end of this comment). Ruled 30.9:
 *     RULING-2026-09-30-video.md 16(d) D2(v)
 *   - a line whose slug starts `robots-` and whose URL path is exactly /robots.txt is
 *     a robots-only probe: that file is fetched and stored like any capture, and
 *     nothing else from the host (research/rendered/README.md)
 *   - redirects are followed by hand (fetchOne), up to MAX_REDIRECTS (20, the Fetch
 *     standard's own limit), inside the same 30 s. A hop to tiktok.com is refused
 *     before it is requested, and the meta records the redirect instead
 *   - the raw body is stored under research/rendered/<slug>.<ext>, the extension
 *     chosen from the response Content-Type (html / json / pdf / xml / txt / bin)
 *   - for HTML, a deterministic text extraction is stored at <slug>.txt
 *   - for a PDF (Content-Type application/pdf), the stored <slug>.pdf is run
 *     through `pdftotext -layout <file> -` and the output is stored at <slug>.txt,
 *     verbatim apart from masking (below); textPath in the meta points at it.
 *     pdftotext comes from poppler-utils, which the workflow installs on the
 *     runner — a system program run with execFile and a fixed argv, not an npm
 *     dependency. The text is never hashed: sha256 stays the hash of the PDF bytes
 *   - if pdftotext is missing, fails or times out (60 s), the run carries on: the
 *     PDF and its meta are stored, no .txt is written, textPath is null, the meta
 *     says why in `textError`, and the log prints it
 *   - for a PDF, the script only replaces or removes a <slug>.txt its previous
 *     meta claims as its own (textPath, or bodyPath for a text/plain capture).
 *     An unclaimed <slug>.txt beside a PDF is treated as a hand extraction (four
 *     exist, made before 28.9.2026 and cited by line number from products/pcn874
 *     and research/) and is never touched: if the PDF bytes change beside one,
 *     nothing is extracted, and textError says the PDF changed beside it, names
 *     the sha256 of the stored copy it sat beside, and says it may not describe
 *     the new bytes. (A limit, not a guarantee: if the URL starts answering HTML
 *     or plain text instead, that capture's text or body is written to <slug>.txt
 *     as for any page, hand extraction or not. Git history keeps what it replaced.)
 *   - whether a PDF's bytes are new is judged against the STORED .pdf, not the
 *     previous meta, because a failed fetch leaves the last capture on disk. The
 *     same bytes beside a <slug>.txt are not extracted again: a PDF whose text is
 *     stored does not churn. The same bytes with no <slug>.txt are extracted: that
 *     reads, once, a PDF captured before this extraction existed (the meta is
 *     rewritten, keeping the bytes' fetchedAt), and retries one whose extraction
 *     failed. New bytes are extracted and replace the script's own <slug>.txt; if
 *     that fails, the script's text of the old bytes is removed rather than left
 *     beside new bytes it does not describe
 *   - a failed fetch writes no file, so the last capture's .pdf and <slug>.txt
 *     stay on disk; the failed fetch's meta therefore keeps the PDF capture's
 *     textPath, textError and redacted, which still describe them. Without that,
 *     one bad week would make the script's own text look like a hand extraction.
 *     Only a PDF's state is carried: the error meta of every other page keeps the
 *     shape it always had
 *   - secret-shaped strings (vendor docs print sample keys) and, since 5.10.2026,
 *     email addresses (the local part; the domain is kept) are masked before the
 *     body is hashed or stored, and the meta file counts them as `redacted`. An
 *     HTML page's extracted .txt is masked again on its own, and anything found
 *     only there joins the count. A PDF body is binary and stored as fetched; its
 *     extracted text is masked instead, and those are what `redacted` counts for a PDF
 *   - research/rendered/<slug>.meta.json records url, fetchedAt, status,
 *     contentType, byteLength, sha256, bodyPath, textPath (plus textError, for a
 *     PDF with no text) and whether anything changed
 *   - a non-2xx response or a network error is RECORDED IN THE META FILE and
 *     never thrown; the run still exits 0. Its meta has no sha256 and no bodyPath;
 *     after a PDF capture it keeps that capture's text state (above)
 *   - the process exits non-zero only when the script itself is broken: a
 *     malformed URL list, a duplicate slug, an unwritable output directory
 *
 * BODY SIZE IS CAPPED AT 5 MB (MAX_BYTES below). The cap is applied while the
 * body streams in, so a larger page is never fully downloaded; what is stored is
 * the first 5 MB and the meta file says `"truncated": true`. The stored sha256 is
 * the hash of the STORED bytes, not of the whole remote document — a truncated
 * capture is a sample, not a copy, and must not be cited as the full page.
 *
 * QUIET GIT HISTORY, DELIBERATELY. A meta file is rewritten only when something
 * material changed (body hash, HTTP status, or the error state — and, for a PDF
 * only, whether its text was extracted and why not). A run that finds the same
 * bytes writes nothing at all, so the workflow's `git add` finds an empty diff and
 * skips the commit; an unchanged PDF whose text is stored is not even re-extracted,
 * and one whose extraction fails the same way again writes nothing either. The
 * consequence, stated rather than hidden: `fetchedAt` is the time of the fetch that
 * produced the STORED bytes — the last time the page CHANGED, not the last time it
 * was checked, and not the time its text was extracted. The workflow run log is the
 * record of every check.
 *
 * Node 22, no npm dependencies, on purpose: a weekly fetch that depends on a
 * package tree is a weekly fetch somebody else's release can break. The one
 * outside program, pdftotext, is optional by construction: without it every page
 * is still fetched and stored, and a PDF simply has no text until a run that has it.
 * The one exception is opt-in and per line, below: a line flagged `js` needs
 * playwright-core and a Chromium, loaded only when such a line exists. A list with
 * no `js` line never imports it, so the plain run above still needs no package.
 *
 * THE JS FLAG (ordered by the loop board, research/channel-loop/RULING-2026-09-29-loop.md
 * (b), "Tick 17-18, tooling"). Some pages reach a plain GET as an empty JavaScript
 * shell: Trolley's identity-verification article, GameDistribution's payment FAQ,
 * n8n's Creator Hub. A line in urls.txt may carry a third field, `js`:
 *
 *     https://example.com/s/article/X<TAB>example-x<TAB>js
 *
 * and that URL is then loaded in headless Chromium (playwright-core, pinned exactly
 * in package.json) instead of fetched. What the browser is allowed to do is narrow,
 * and each limit is a test in src/__tests__/revenue/render-watch-js.test.ts:
 *   - one navigation per URL, then a wait for the network to go quiet, then reading
 *     the DOM, all inside the same TIMEOUT_MS as a plain GET (a page whose DOM cannot
 *     be read in the time left — a script spinning forever — is closed and recorded as
 *     a timeout); the DOM as it stands then is serialised
 *     and goes through exactly the plain path: redactSecrets, sha256, MAX_BYTES,
 *     extractText, the meta and the quiet-history rule. The meta says
 *     `renderedWith: "chromium"` and whether the network went quiet (`networkIdle`)
 *   - no clicks, no typing, no form fills, no logins, no cookies or storage carried
 *     between URLs: every URL gets a fresh browser context, closed after it
 *   - no stealth plugin and no anti-detection setting: the same USER_AGENT and
 *     accept-language as a plain GET, and the page can see it is automated
 *   - robots.txt first: the listed URL is checked against its host's robots.txt,
 *     read by a plain GET, before the browser is asked for it (or launched). Every
 *     request the page then starts itself — scripts, images, XHR, frames, and its
 *     own moves (a script's location change, a meta refresh) — goes through route(),
 *     which aborts it unsent when robots.txt disallows it; a page whose own move was
 *     aborted is not stored, and one that only lost a subresource is. A server
 *     redirect hop is checked after the page settles, and the page is not stored if
 *     robots.txt disallows it. A stated limit: the browser follows a redirect itself
 *     (route() sees only the first URL of a chain), so that hop was already
 *     requested; only a plain GET refuses a hop before asking. WebSockets are not
 *     held to robots.txt (a refused host's are closed, below)
 *   - HTML only: a js line that answers a PDF or JSON stores nothing and says to
 *     drop the flag
 *   - a browser that is unavailable is a host failure, not a site's answer: when it
 *     cannot be started, or disconnects during the run (including in the middle of a
 *     line), the js lines from then on are skipped and nothing is written for them
 *     (their earlier captures stay as they were), the plain lines are stored as
 *     usual, and the count goes to the workflow as `js_skipped`, which fails the run
 *     after the commit
 * Known limits, stated: only the top frame's DOM is stored (not iframes), open or
 * closed shadow roots are not serialised, and a rendered DOM may differ run to run
 * (a nonce, a timestamp), which the quiet-history rule then commits as a change.
 *
 * NEVER tiktok.com, in either mode. parseUrlList refuses tiktok.com and every
 * subdomain at parse time, for the file and the dispatch override alike. A listed
 * page that redirects there is not followed:
 *   - plain mode follows redirects by hand and refuses a tiktok.com hop before
 *     requesting it (fetchOne)
 *   - js mode launches Chromium with a host-resolver rule that makes every tiktok.com
 *     name fail to resolve (chromiumLaunchOptions), so no navigation, redirect,
 *     subresource, preconnect or WebSocket from inside a page reaches it. route() and
 *     routeWebSocket() block such requests as a second layer — alone they are not
 *     enough, because Playwright calls a route handler only for the first URL of a
 *     redirect chain. And a page whose main frame went to tiktok.com (a server
 *     redirect or its own script) is never stored, even where the resolver rule does
 *     not apply (a proxy that resolves names itself)
 * Every TERMS_BARRED domain gets the same three layers in the js mode: its own
 * resolver rules (TERMS_BARRED_HOST_RESOLVER_RULES), route() and routeWebSocket(), and
 * a page whose main frame was sent there is not stored (barredNavigationError).
 * Stated limits, for both: a server addressed by a bare IP address is not recognised by
 * any of these, and behind such a proxy a subresource redirected to such a host would
 * still be requested (the runner has no proxy). logs/CHANNEL_LOOP.md §9 paused every TikTok fetch on 28.9, and whether
 * any fetch of TikTok is allowed at all is ruled: research/channel-loop/RULING-2026-09-30-video.md 16(d) D2.
 */

import { execFile } from "node:child_process";
import { createHash } from "node:crypto";
import { appendFileSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { basename, dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
export const REPO_ROOT = join(HERE, "..");
export const DEFAULT_LIST = join(REPO_ROOT, "research", "rendered", "urls.txt");
export const DEFAULT_OUT_DIR = join(REPO_ROOT, "research", "rendered");

/** 30 s, as the brief requires. A page that cannot answer in 30 s is a finding too. */
export const TIMEOUT_MS = 30_000;

/** 5 MB. Applied while streaming; see the header comment. */
export const MAX_BYTES = 5 * 1024 * 1024;

/** A courtesy pause between requests. Six pages a week is not a crawl, but it costs nothing to be polite. */
export const DELAY_MS = 1_000;

/**
 * The product token render-watch answers to in a robots.txt `User-agent` line (RFC 9309 §2.2.1:
 * letters, underscores and hyphens only). Ruled 30.9: research/channel-loop/RULING-2026-09-30-video.md
 * 16(d) D2(v).
 */
export const ROBOTS_PRODUCT_TOKEN = "MehudakRenderWatch";

/**
 * The contact element of the User-Agent. It names only a surface the brand holds and that answers
 * (research/channel-loop/RULING-2026-10-06-robots-and-terms.md 2(1), ruling 6.10 row 21 (b)), and today the brand
 * holds none: il-biz-tools.netlify.app is a target, not a deployed site, and a *.netlify.app name the brand does
 * not hold can come to point at a stranger. So it is empty, and the User-Agent says "contact pending" instead.
 *
 * It fills on the first of two events, and again on the second (decision 2(2)):
 *   (i)  a brand site is live at a URL the loop controls: "live" means a deploy record written by the deploy
 *        workflow into a committed file (not by hand) AND one render-watch capture of that URL with status 200
 *        whose text carries the brand name (research/rendered/brand-<host>.meta.json; uaContactProblems checks
 *        the capture's half) — then UA_CONTACT is "+<URL>";
 *   (ii) step 8 is done, the brand mailbox: its address joins in Wikimedia's form, "+<URL>; <address>", or stands
 *        alone if (i) has not happened. The address is the brand's, never a personal one.
 * Each change bumps UA_VERSION (1.1, then 1.2), so a host's logs tell the strings apart. Never the repository's
 * URL, never a username (MISSION.md:304-308): the test refuses both.
 */
export const UA_CONTACT = "";

/** The version in the User-Agent: 1.0 while UA_CONTACT is empty; bumped on each change of UA_CONTACT (above). */
export const UA_VERSION = "1.0";

/**
 * The User-Agent for a contact and a version: the product token, the version, and a parenthesis that states only
 * true things — "robots.txt honoured; contact pending" with no contact, "<contact>; robots.txt honoured" with one
 * (the contact first, in decision 2(2)'s "(+<URL>; …)" form).
 */
export function userAgentFor(contact = UA_CONTACT, version = UA_VERSION) {
  const about = contact ? `${contact}; robots.txt honoured` : "robots.txt honoured; contact pending";
  return `${ROBOTS_PRODUCT_TOKEN}/${version} (${about})`;
}

/**
 * An identifying User-Agent: the product token, a version, and what the runner does, so a site can see who is
 * asking and say no to it by name in its robots.txt (ROBOTS_PRODUCT_TOKEN, the refusal channel the runner
 * honours). Sent by both modes and by the robots.txt fetch. It names the brand and nothing else — never a
 * username, never the repository's URL (MISSION.md:276-279; ruling 30.9 16(d) D2(v)), and no URL at all until
 * UA_CONTACT holds one (ruling 6.10 row 21 (b)). It replaced a copied Chrome string on 30.9: some pages may now
 * answer 403 where they rendered to a browser, and that 403 is the site's answer to an honest crawler, recorded as
 * such. Nothing is done to get past a block — no proxy, no retry storm, no cookie games. A site that says no is
 * recorded as saying no.
 */
export const USER_AGENT = userAgentFor();

/**
 * Why `contact` may not stand in the User-Agent yet, per decision 2(2)(i): for every URL in it, a render-watch
 * capture of that URL at <dir>/brand-<host>.meta.json whose meta records that URL's host, no error and status 200.
 * Returns the reasons, [] when there are none — and for a contact with no URL (an empty one, or a mailbox alone).
 * The deploy record, the other half of (i), is a committed file the deploy workflow writes; no such workflow exists
 * yet, so it is for the person who fills UA_CONTACT to cite, and this checks the capture.
 */
export function uaContactProblems(contact = UA_CONTACT, dir = DEFAULT_OUT_DIR) {
  const problems = [];
  for (const raw of String(contact ?? "").match(/https?:\/\/[^\s;)]+/gi) ?? []) {
    let host;
    try {
      host = new URL(raw).hostname.toLowerCase().replace(/\.+$/, "");
    } catch {
      problems.push(`${raw} is not a URL`);
      continue;
    }
    const metaPath = join(dir, `brand-${host}.meta.json`);
    if (!existsSync(metaPath)) {
      problems.push(`${raw}: no capture at ${metaPath} (decision 2(2)(i): one render-watch capture of the URL with status 200)`);
      continue;
    }
    let meta;
    try {
      meta = JSON.parse(readFileSync(metaPath, "utf8"));
    } catch {
      problems.push(`${raw}: ${metaPath} is not JSON`);
      continue;
    }
    let captured = null;
    try {
      captured = new URL(meta?.url).hostname.toLowerCase().replace(/\.+$/, "");
    } catch {
      captured = null;
    }
    if (captured !== host) problems.push(`${raw}: ${metaPath} records ${JSON.stringify(meta?.url ?? null)}, not a URL on ${host}`);
    else if (meta?.status !== 200 || meta?.error != null) {
      problems.push(`${raw}: ${metaPath} has status ${meta?.status ?? "none"} and error ${JSON.stringify(meta?.error ?? null)}, not a 200`);
    }
  }
  return problems;
}

/** Sent by both modes, so a js line asks for the same languages a plain GET does. */
export const ACCEPT_LANGUAGE = "en-US,en;q=0.9,he;q=0.8";

// ---------------------------------------------------------------------------
// The URL list
// ---------------------------------------------------------------------------

const SLUG_RE = /^[a-z0-9][a-z0-9._-]*$/;

/** The flags a urls.txt line may carry after its slug. One, today: `js` (header comment). */
const FLAGS = new Set(["js"]);

/** A slug starting with this, on a URL whose path is exactly /robots.txt, is a robots-only probe. */
export const ROBOTS_SLUG_PREFIX = "robots-";

/**
 * Derive a filesystem-safe slug from a URL, for a list line that does not name one.
 * Deterministic, lowercase, and includes the query string, because
 * `…/store?search=accessibility` and `…/store?search=israel` are different pages.
 */
export function slugFromUrl(url) {
  const withoutScheme = String(url)
    .replace(/^[a-z][a-z0-9+.-]*:\/\//i, "")
    .replace(/#.*$/, "");
  const slug = withoutScheme
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80)
    .replace(/-+$/g, "");
  return slug || "page";
}

/**
 * Parse research/rendered/urls.txt (or the workflow_dispatch override, which has
 * the same syntax).
 *
 *   - one URL per line
 *   - an optional slug after the URL; a TAB is the documented separator, but any
 *     run of whitespace is accepted, because a URL contains none and a
 *     workflow_dispatch text box cannot carry a tab
 *   - a line whose first non-blank character is `#` is a comment. Only whole-line
 *     comments: a `#` later in a line is a URL fragment, not a comment marker
 *   - blank lines are ignored
 *   - an optional flag after the slug: `js` (the only one) marks the URL for the
 *     JavaScript-capable render (header comment). A flag needs a slug before it, and
 *     `js` is not a usable slug, so `URL js` cannot silently become a plain line
 *     named "js". The entry then carries `js: true`; a line without the flag comes
 *     back in exactly the shape it always had, with no `js` key at all
 *   - a slug starting `robots-` marks a robots-only probe (ruling 30.9 16(d) D2(v)):
 *     its URL path must be exactly /robots.txt with no query, a /robots.txt URL must
 *     have such a slug, and a probe takes no `js` flag. The entry carries
 *     `robotsProbe: true`; main fetches that file and nothing else from the host
 *
 * Throws on an authoring mistake — a non-http(s) line, a URL that does not parse,
 * an unusable slug, an unknown flag, a robots- slug or a /robots.txt URL out of the
 * probe form, two lines claiming the same slug (which would
 * have one page silently overwrite another), a tiktok.com URL (isTikTokHost), or a
 * URL on a site whose terms bar automated access (termsBarred).
 * Those are the "the script itself is broken" cases; everything that can go wrong
 * at fetch time is recorded instead.
 */
export function parseUrlList(text) {
  const entries = [];
  const seen = new Map();
  const lines = String(text ?? "")
    .replace(/^﻿/, "")
    .split(/\r?\n/);

  for (let i = 0; i < lines.length; i += 1) {
    const lineNumber = i + 1;
    const raw = lines[i].trim();
    if (raw === "" || raw.startsWith("#")) continue;

    const parts = raw.split(/\s+/);
    const url = parts[0];
    const explicitSlug = parts.length > 1 ? parts[1] : "";
    const flag = parts.length > 2 ? parts[2] : null;

    if (!/^https?:\/\/\S+$/i.test(url)) {
      throw new Error(`urls.txt line ${lineNumber}: not an http(s) URL: ${url}`);
    }
    let hostname;
    try {
      hostname = new URL(url).hostname;
    } catch {
      throw new Error(`urls.txt line ${lineNumber}: not a valid URL (it does not parse): ${url}`);
    }
    // Never tiktok.com, plain or js. logs/CHANNEL_LOOP.md §9 paused every TikTok fetch on 28.9
    // (their terms bar automated access; the runner had fetched ~110 pages before that was read),
    // and whether any fetch of TikTok is allowed at all is ruled: research/channel-loop/RULING-2026-09-30-video.md 16(d) D2.
    // Refused here, at parse time, so neither urls.txt nor a dispatch override can reach it.
    if (isTikTokHost(hostname)) {
      throw new Error(
        `urls.txt line ${lineNumber}: ${url} is on tiktok.com, which render-watch never fetches in either mode ` +
          "(the TikTok pause, logs/CHANNEL_LOOP.md §9; ruled: research/channel-loop/RULING-2026-09-30-video.md 16(d) D2).",
      );
    }
    // A site whose rendered terms bar automated access is refused the same way, in both modes
    // (TERMS_BARRED says which, and where the terms say it).
    const barred = termsBarred(hostname);
    if (barred) {
      throw new Error(`urls.txt line ${lineNumber}: ${url} is on ${barred.domain}: ${barred.why}.`);
    }
    if (parts.length > 3) {
      throw new Error(
        `urls.txt line ${lineNumber}: at most three fields (URL, slug, flag), got ${parts.length}: "${raw}".`,
      );
    }
    if (flag !== null && !FLAGS.has(flag)) {
      throw new Error(
        `urls.txt line ${lineNumber}: unknown flag "${flag}" after slug "${explicitSlug}" — a slug is one word, ` +
          `and the only flag after it is ${[...FLAGS].map((f) => `"${f}"`).join(", ")}.`,
      );
    }
    if (FLAGS.has(explicitSlug)) {
      throw new Error(
        `urls.txt line ${lineNumber}: "${explicitSlug}" is a flag, not a slug. To flag a URL, name the slug first: ` +
          `URL<TAB>slug<TAB>${explicitSlug}.`,
      );
    }

    const slug = explicitSlug || slugFromUrl(url);
    if (!SLUG_RE.test(slug)) {
      throw new Error(
        `urls.txt line ${lineNumber}: slug "${slug}" is not usable as a file name (want ${SLUG_RE}).`,
      );
    }
    // The robots-only probe (ruling 30.9 16(d) D2(v)): a robots- slug is exactly a /robots.txt URL, and back.
    const probe = slug.startsWith(ROBOTS_SLUG_PREFIX);
    const parsed = new URL(url);
    const robotsPath = parsed.pathname === "/robots.txt";
    if (probe && !(robotsPath && parsed.search === "" && parsed.hash === "")) {
      throw new Error(
        `urls.txt line ${lineNumber}: slug "${slug}" starts ${ROBOTS_SLUG_PREFIX}, which marks a robots-only probe: ` +
          `its URL path must be exactly /robots.txt, with no query (got ${url}).`,
      );
    }
    if (robotsPath && !probe) {
      throw new Error(
        `urls.txt line ${lineNumber}: ${url} is a robots.txt: list it as a robots-only probe, with a slug starting ` +
          `${ROBOTS_SLUG_PREFIX} (research/rendered/README.md).`,
      );
    }
    if (probe && flag === "js") {
      throw new Error(
        `urls.txt line ${lineNumber}: a robots-only probe is read by a plain GET only; drop the js flag after "${slug}".`,
      );
    }
    if (seen.has(slug)) {
      throw new Error(
        `urls.txt line ${lineNumber}: slug "${slug}" is already used on line ${seen.get(slug)}. ` +
          `Two URLs sharing a slug would overwrite each other's stored page.`,
      );
    }
    seen.set(slug, lineNumber);
    entries.push(
      flag === "js"
        ? { url, slug, lineNumber, js: true }
        : probe
          ? { url, slug, lineNumber, robotsProbe: true }
          : { url, slug, lineNumber },
    );
  }

  return entries;
}

/**
 * Sites whose rendered terms bar automated access, so render-watch never fetches them.
 * The rule is the one the TikTok pause set (logs/CHANNEL_LOOP.md §9): a runner does not
 * fetch a site whose terms forbid it. Gumroad: its terms (captured 29.9.2026) forbid
 * "any manual or automated software ... to 'scrape' or download data from any web pages
 * contained in the Services" (research/rendered/gumroad-terms.txt:326, also :343). Found
 * in tick 19, after rows 155-186 had been fetched; whether any fetch is allowed again
 * is ruled: research/channel-loop/RULING-2026-09-30-video.md 16(d) D2. The Gumroad API is not a web page and is not
 * fetched by this script.
 *
 * A host on this list gets no request of any kind — not its pages, and not its robots.txt either: the robots.txt
 * check (robotsChecker) runs only after these refusals, and refuses such a host again itself.
 */
export const TERMS_BARRED = [
  {
    domain: "gumroad.com",
    why:
      "Gumroad's terms bar automated software that scrapes or downloads data from any web page of the Services " +
      "(research/rendered/gumroad-terms.txt:326, :343; paused in tick 19, logs/CHANNEL_LOOP.md §9; ruled: research/channel-loop/RULING-2026-09-30-video.md 16(d) D2(ii))",
  },
  // The tick-20 terms audit of every active site (research/channel-loop/TERMS-AUDIT-2026-09-29.md): each entry
  // below cites the clause that bars a runner, or a condition the runner does not meet.
  { domain: "paypal.com", why: "PayPal's user agreement bars \"any robot, spider, other automatic device, or manual process to monitor or copy our websites without our prior written permission\" (research/rendered/paypal-il-user-agreement.txt:787; terms audit 29.9)" },
  { domain: "teachsimple.com", why: "Teach Simple's terms bar using the site \"to spam, phish, pharm, pretext, spider, crawl, or scrape\" (research/rendered/teachsimple-terms-of-service.txt:363; terms audit 29.9)" },
  { domain: "indiebook.co.il", why: "Indiebook's terms: \"אין לאסוף נתונים מן האתר באמצעות תוכנות מסוג Crawlers Robots\" (research/rendered/indiebook-terms.txt:169; terms audit 29.9)" },
  { domain: "astro.build", why: "Astro's terms exclude \"using any data mining, robots or similar data gathering or extraction methods\" and downloading other than page caching (withastro/astro.build src/content/pages/terms.md:65, research/measurements/astro-themes.md:338; terms audit 29.9)" },
  { domain: "facer.io", why: "Facer's terms bar access or download \"through the use of any engine, software, tool, agent ... (including spiders, robots, crawlers, data mining tools or the like)\" other than Little Labs' software or ordinary browsers (research/rendered/facer-templates-js.bin bytes 475268-475660; terms audit 29.9)" },
  { domain: "facercreator.io", why: "Facer's terms (Little Labs) bar spiders, robots and crawlers on the Services, which the creator site is part of (research/rendered/facer-templates-js.bin bytes 475268-475660; terms audit 29.9)" },
  { domain: "youtube.com", why: "YouTube's terms bar accessing the Service \"using any automated means (such as robots, botnets or scrapers)\" except search engines or with written permission (research/faceless-youtube/scouts/discovery.md:209-211; terms audit 29.9)" },
  { domain: "blog.youtube", why: "YouTube's blog links YouTube's terms, which bar automated access except search engines or with written permission (research/rendered/youtube-blog-ypp-2027.html:3341; research/faceless-youtube/scouts/discovery.md:209-211; terms audit 29.9)" },
  { domain: "google.com", why: "YouTube's terms bar the YouTube Help pages outright (research/faceless-youtube/scouts/discovery.md:209-211); Google's own terms allow automated access only while respecting robots.txt (research/colony-sweep/scouts/risk-governance--automation-tos.md:106), which render-watch reads since 30.9, but the Help pages' bar stands (terms audit 29.9; ruling 30.9 16(d) D2(v))" },
  // googlesource.com left this list on 30.9: its one condition was robots.txt, which render-watch now reads
  // (robotsChecker), so it is CONDITIONAL_MET in research/channel-loop/terms-verdicts.json (ruling 30.9 16(d) D2(v)).
  { domain: "metaculus.com", why: "Metaculus's terms bar viewing, copying or procuring content \"by automated means (such as scripts, bots, spiders, crawlers, or scrapers)\" outside its API (Metaculus/metaculus front_end terms-of-use page.tsx:187-196; terms audit 29.9)" },
  { domain: "openai.com", why: "OpenAI's terms bar \"Automatically or programmatically extract data or Output\" (OpenTermsArchive/genai-contrib-versions OpenAI/Terms of Service.md:40; terms audit 29.9)" },
  { domain: "addons.mozilla.org", why: "Mozilla's acceptable-use policy bars harvesting personal information such as account names and email addresses, and the AMO search API returns both for every author (mozilla/legal-docs en/acceptable_use_policy.md:14; terms audit 29.9; the stored results were redacted)" },
  // Round 2 (tick 21, 29.9.2026): the terms pages rendered by rows 191-213, and GitHub-hosted copies (ToS;DR snapshots,
  // licence mirrors) for sites with no terms URL in the repo. research/channel-loop/terms-verdicts.json holds every site.
  { domain: "bit2c.co.il", why: "Bit2C's terms bar \"תוכנות מסוג Crawlers, Robots וכדומה, לשם חיפוש, סריקה, העתקה או אחזור אוטומטי\" (research/rendered/terms-bit2c.txt:494; terms audit round 2)" },
  { domain: "freemius.com", why: "Freemius's terms bar \"any automated use of the system\" and scraping, spidering or crawling (research/rendered/terms-freemius.txt:140-141; terms audit round 2)" },
  { domain: "hackmd.io", why: "HackMD's terms bar \"any robot, spider, crawler, other automated device, or manual process to monitor or copy any content\" (research/rendered/terms-hackmd.txt:30; terms audit round 2)" },
  { domain: "icount.co.il", why: "iCount's terms bar \"הפעלת יישום מחשב או כל אמצעי אחר, לשם חיפוש, סריקה, העתקה או אחזור אוטומטי\" (research/rendered/terms-icount.txt:141; terms audit round 2)" },
  { domain: "lomdimhofshi.co.il", why: "The site's terms: \"אסור להשתמש בבוטים או בסקריפטים כדי להוריד את התוכן באופן שיטתי\" (research/rendered/terms-lomdimhofshi.txt:42; terms audit round 2)" },
  { domain: "community.n8n.io", why: "n8n's forum terms: \"You may not automate access to the forum, or monitor the forum, such as with a web crawler\" (research/rendered/terms-n8n-community.txt:81; terms audit round 2)" },
  { domain: "notion.site", why: "Notion's terms bar any robot, spider or crawler that accesses the Service to monitor, extract or copy data (abhishakenp/den docs/research/integrations-auth.md:339, github grade; terms audit round 2)" },
  { domain: "upload-post.com", why: "Upload-Post's terms bar automated access beyond normal API usage, and scraping (research/rendered/terms-upload-post.txt:94-95; terms audit round 2)" },
  { domain: "wix.com", why: "Wix's terms bar access \"through any means or technology (e.g. scraping and crawling), other than our publicly supported interfaces\" (research/rendered/terms-wix.html:842; terms audit round 2)" },
  { domain: "crazygames.com", why: "CrazyGames's terms bar any robot, spider or scraper \"to access, acquire, copy or monitor any portion of the Website/Platform\" without written consent (tosdr/tosdr-snapshots Crazygames/Terms of Service.html:56, github grade; terms audit round 2)" },
  { domain: "pexels.com", why: "Pexels's terms bar \"the use of programs or robots for automatic data collection\" (KDE/kdenlive-test-suite LICENSES/LicenseRef-Pexels.txt:146, github grade; terms audit round 2). The Pexels API is not fetched by this script" },
  { domain: "pixabay.com", why: "Pixabay's terms bar \"the use of programs or robots for automatic data collection\" (kando-menu/kando LICENSES/LicenseRef-Pixabay.txt:110, github grade; terms audit round 2)" },
  { domain: "spreadshirt.com", why: "Spreadshirt's terms bar \"a robot or other automated means to monitor the activity on or copy information or pages from the site\", except search engines (tosdr/tosdr-snapshots Spreadshirt/Terms of Service.html:145, github grade; terms audit round 2)" },
  { domain: "spreadshop.com", why: "Spreadshirt's terms, which cover Spreadshops, bar robots that copy pages from the site (tosdr/tosdr-snapshots Spreadshirt/Terms of Service.html:145, :129, github grade; terms audit round 2)" },
  { domain: "teacherspayteachers.com", why: "TpT's terms: \"Don't use any automated means such as bots, spiders, or crawlers to download or otherwise obtain data from our services\" (sernl/listing-sync docs/notes/legal/marketplace-terms-assessment.md:100, github grade; terms audit round 2)" },
  // Round 3 (tick 22): the terms pages rendered by rows 216-223.
  { domain: "wavedash.com", why: "Wavedash's terms bar \"any robot, spider, or other automatic device, process, or means to access the Website for any purpose\" (research/rendered/terms-wavedash.txt:118; terms audit round 3)" },
  // Round 4 (tick 23): Tipalti's website terms (row 224).
  { domain: "tipalti.com", why: "Tipalti's website terms: \"You may not download or save a copy of the Site or any portion thereof ... for any purpose, without Tipalti's prior written consent\" (research/rendered/terms-tipalti-website.txt:245; terms audit round 4)" },
  // Tick 54 (6.10.2026): the prize-event sites' terms pages of the 6.10 weekly render, read on their frozen copies by an
  // Opus reader and an adversarial Opus verifier, verdicts by the main thread (research/channel-loop/TERMS-AUDIT-2026-10-05-prize-events.md,
  // "Terms read (6.10.2026, tick 54)"). devpost.com covers every *.devpost.com hackathon site and info.devpost.com.
  { domain: "devpost.com", why: "Devpost's terms bar using \"manual or automated software, devices, scripts robots, or other means or processes to access, “scrape,” “crawl” or “spider” the Site, User Content ... or any related data or information\" (research/rendered/terms-devpost-2026-10-06.txt:159), and every hackathon site is a Hackathon Website of the Site (:129, :170, :185; terms read 6.10, tick 54)" },
  { domain: "zindi.africa", why: "Zindi's terms: \"You must not reproduce, distribute, modify, create derivative works of, publicly display, publicly perform, republish, download, store or transmit any of the material on our Website\" (research/rendered/terms-zindi-2026-10-06.txt:68; terms read 6.10, tick 54)" },
  { domain: "zindi.world", why: "The same Zindi Terms of Use: zindi.africa's terms page names zindi.world as its og:url (research/rendered/terms-zindi-2026-10-06.html:50) and its robots.txt was read there, so zindi.africa redirects to zindi.world [inference]; :68 bars reproducing, storing or transmitting the material (research/rendered/terms-zindi-2026-10-06.txt:68; terms read 6.10, tick 54)" },
  // Tick 54, later (6.10.2026): kaggle.com's terms page, a JavaScript shell to the plain GET, rendered once in js mode
  // under ruling 6.10 row 21 (c) 3(2) and read on its frozen copy by an Opus reader and an adversarial Opus verifier,
  // verdict by the main thread (research/channel-loop/TERMS-AUDIT-2026-10-05-prize-events.md, "Shell terms pages rendered
  // once (6.10.2026, tick 54)"). It covers www.kaggle.com and its competition pages.
  { domain: "kaggle.com", why: "Kaggle's terms bar using or interacting with the Services in a manner that \"“Crawls,” “scrapes,” or “spiders” any page, data, or portion of or relating to the Services or Content (through use of manual or automated means)\" (research/rendered/terms-kaggle-2026-10-06-a3cb438.txt:77; the verifier found a narrower bulk-only reading of :77 arguable, so the bar does not rest on it alone), copying or publishing any Content not owned by you without its owner's prior consent (:87), and any use but \"your own internal, personal, non-commercial use\" (:70), each of these two sufficient alone; the terms page was rendered once in js mode under ruling 6.10 row 21 (c) 3(2) (terms read 6.10, tick 54)" },
];

/** The TERMS_BARRED entry a host falls under (the domain or any subdomain; case and trailing dot ignored), or null. */
export function termsBarred(hostname) {
  const host = String(hostname ?? "")
    .toLowerCase()
    .replace(/\.+$/, "");
  return TERMS_BARRED.find((b) => host === b.domain || host.endsWith(`.${b.domain}`)) ?? null;
}

/**
 * tiktok.com or any subdomain of it (www., vm., m., ads., …), trailing dot and case
 * ignored. A host that merely contains the name (nottiktok.com, tiktok.com.example.org)
 * is a different site. Used by parseUrlList for both modes, and by the js mode to block
 * requests a page itself makes — see the refusal's comment for why.
 */
export function isTikTokHost(hostname) {
  const host = String(hostname ?? "")
    .toLowerCase()
    .replace(/\.+$/, "");
  return host === "tiktok.com" || host.endsWith(".tiktok.com");
}

// ---------------------------------------------------------------------------
// Content type -> file extension, and the HTML text extractor
// ---------------------------------------------------------------------------

/**
 * Choose the extension the raw body is stored under. Deliberately coarse: the
 * point is that a later reader can open the file, not that every MIME type gets
 * its own suffix. `text/plain` maps to `txt` and no separate extraction is
 * written for it — the body already is the text.
 */
export function extensionFor(contentType) {
  const type = String(contentType ?? "")
    .toLowerCase()
    .split(";")[0]
    .trim();
  if (type.includes("json")) return "json";
  if (type.includes("html")) return "html";
  if (type.includes("pdf")) return "pdf";
  if (type.includes("xml")) return "xml";
  if (type.startsWith("text/")) return "txt";
  return "bin";
}

export function isHtml(contentType) {
  return extensionFor(contentType) === "html";
}

export function isPdf(contentType) {
  return extensionFor(contentType) === "pdf";
}

const NAMED_ENTITIES = {
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
  nbsp: " ",
  hellip: "…",
  mdash: "—",
  ndash: "–",
  rsquo: "’",
  lsquo: "‘",
  rdquo: "”",
  ldquo: "“",
  shy: "",
};

/** The small entity set an extracted page actually needs. Anything else is left alone. */
export function decodeEntities(text) {
  return String(text)
    .replace(/&#x([0-9a-f]+);/gi, (_m, hex) => safeFromCodePoint(Number.parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_m, dec) => safeFromCodePoint(Number.parseInt(dec, 10)))
    .replace(/&([a-z]+);/gi, (match, name) => {
      const value = NAMED_ENTITIES[name.toLowerCase()];
      return value === undefined ? match : value;
    });
}

function safeFromCodePoint(code) {
  if (!Number.isFinite(code) || code < 0 || code > 0x10ffff) return "";
  try {
    return String.fromCodePoint(code);
  } catch {
    return "";
  }
}

// <noscript> is deliberately NOT dropped: the runner is a no-JavaScript client, so a
// noscript body is what it is served. Discourse forums put every post there.
const DROPPED_ELEMENTS = "script|style|template|svg|iframe|object|canvas|math";
// The inside of a tag: anything but '>', or a whole quoted attribute value (which
// may itself contain '>', as in Discourse's media="(width >= 40rem)").
const TAG_BODY = `(?:[^>"']|"[^"]*"|'[^']*')*`;
const BLOCK_ENDS =
  /<\/(?:p|div|section|article|header|footer|main|nav|aside|ul|ol|li|dl|dt|dd|table|thead|tbody|tfoot|tr|td|th|h[1-6]|blockquote|pre|figure|figcaption|form|fieldset|legend|label|option|title)\s*>/gi;

/**
 * Turn an HTML body into something a person (or an agent reading the repo) can
 * grep. Deliberately simple and deterministic — no parser, no dependency.
 *
 * Known limits, stated because a silent limit is worse than a stated one:
 *   - nested same-name dropped elements (an <svg> inside an <svg>) end at the
 *     first closing tag, so a fragment of markup can survive
 *   - a tag is only recognised when `<` is followed by a letter, `/` or `!`, so a
 *     bare `<` in running text stays; a quoted attribute value may contain `>`
 *   - <noscript> content is kept (the runner never runs JavaScript), so a page's
 *     "please enable JavaScript" line appears in its text
 *   - text rendered by JavaScript is not here at all: this stores what the server
 *     sent, not what a browser would paint. A page that comes back nearly empty
 *     is a client-rendered page, and that is itself worth recording.
 */
export function extractText(html) {
  let text = String(html ?? "");
  text = text.replace(/<!--[\s\S]*?-->/g, " ");
  text = text.replace(new RegExp(`<(${DROPPED_ELEMENTS})\\b${TAG_BODY}>[\\s\\S]*?<\\/\\1\\s*>`, "gi"), " ");
  text = text.replace(new RegExp(`<\\/?(?:${DROPPED_ELEMENTS})\\b${TAG_BODY}>`, "gi"), " ");
  text = text.replace(/<br\s*\/?>/gi, "\n");
  text = text.replace(BLOCK_ENDS, "\n");
  text = text.replace(new RegExp(`<[A-Za-z!/]${TAG_BODY}>`, "g"), " ");
  text = decodeEntities(text);

  return text
    .replace(/\r\n?/g, "\n")
    .split("\n")
    .map((line) => line.replace(/[^\S\n]+/g, " ").trim())
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

// ---------------------------------------------------------------------------
// The PDF text extractor
// ---------------------------------------------------------------------------

/**
 * pdftotext gets a minute. A 5 MB PDF (the cap) takes seconds; a minute is room
 * for a slow runner, not a target.
 */
export const PDFTOTEXT_TIMEOUT_MS = 60_000;

/**
 * Room for the text of a PDF at the 5 MB cap. execFile's default stdout limit is
 * 1 MB; the largest PDF text in research/rendered/ today is 154 KB (the US-Israel
 * treaty), but `-layout` pads lines with spaces, and hitting the limit would lose
 * the whole text rather than trim it.
 */
const PDFTOTEXT_MAX_BUFFER = 64 * 1024 * 1024;

/**
 * Run `pdftotext -layout <file> -` (poppler-utils) and resolve its stdout.
 *
 * The one external program this script runs, and it is optional: without it a PDF
 * is still stored, just with no text (see describePdfTextError). execFile, not a
 * shell, with a fixed argv — the only variable is the path of a file this script
 * just wrote, and it is passed as one argument, never parsed. `-layout` keeps the
 * columns of a terms document or a spec table next to each other; the form feed
 * pdftotext puts between pages is kept, so a page can still be found.
 *
 * `execFileImpl` exists for the tests. Rejects with the child_process error, with
 * the child's stderr and the timeout attached for describePdfTextError.
 */
export function runPdftotext(pdfPath, { timeoutMs = PDFTOTEXT_TIMEOUT_MS, execFileImpl = execFile } = {}) {
  return new Promise((resolvePromise, rejectPromise) => {
    execFileImpl(
      "pdftotext",
      ["-layout", pdfPath, "-"],
      { timeout: timeoutMs, maxBuffer: PDFTOTEXT_MAX_BUFFER, encoding: "utf8", windowsHide: true },
      (error, stdout, stderr) => {
        if (error) {
          rejectPromise(Object.assign(error, { stderr: String(stderr ?? ""), timeoutMs }));
          return;
        }
        resolvePromise(String(stdout ?? ""));
      },
    );
  });
}

/**
 * Say, in one line fit for a committed meta file, why a PDF has no text.
 * Deterministic on purpose: the same failure on the same bytes gives the same
 * sentence, so a runner that fails the same way every week writes nothing. For
 * the same reason no host path goes in — execFile's own message carries the
 * runner's checkout path, which differs between runs and hosts.
 */
export function describePdfTextError(error) {
  const code = error?.code;
  const stderrLine =
    String(error?.stderr ?? "")
      .split(/\r?\n/)
      .map((line) => line.trim())
      .find((line) => line !== "") ?? "";
  const said = stderrLine ? `: ${stderrLine.slice(0, 200)}` : "";
  const tail = "; no text was extracted from this PDF";

  if (code === "ENOENT") {
    return (
      "pdftotext is not installed on this host (ENOENT)" +
      tail +
      ". .github/workflows/render-watch.yml installs poppler-utils before the fetch step."
    );
  }
  // `killed` is set only when node itself stopped the child, which here means the timeout.
  if (error?.killed) {
    const ms = error?.timeoutMs ?? PDFTOTEXT_TIMEOUT_MS;
    return `pdftotext did not finish within ${ms} ms and was stopped (${error?.signal ?? "killed"})${tail}`;
  }
  if (error?.signal) return `pdftotext was ended by ${error.signal}${said}${tail}`;
  if (typeof code === "number") return `pdftotext exited with code ${code}${said}${tail}`;
  return `pdftotext failed (${code ?? error?.name ?? "unknown error"})${said}${tail}`;
}

// ---------------------------------------------------------------------------
// Meta files
// ---------------------------------------------------------------------------

export function sha256(bytes) {
  return createHash("sha256").update(bytes).digest("hex");
}

/**
 * What a capture is masked of before anything is hashed, written or committed: every
 * capture is committed to this repository, and the repository is public.
 *
 * Secret-shaped strings that GitHub push protection refuses (SECRET_PATTERNS). Vendor
 * docs print sample keys in exactly these shapes: on 27.9.2026 Stripe's cross-border
 * payouts page carried one, push protection rejected the capture commit, and the whole
 * run's pages were lost. A capture is for citing prose, never for reusing a key, so a
 * key is masked whole, as `[redacted:<kind>]`.
 *
 * Email addresses (ADDRESS_PATTERN), since 5.10.2026 (tick 48). A person's address is
 * personal information, and GitHub's terms, which every GitHub Pages site carries, let
 * research use only non-personal information (ruling R3 and the tick 45 review's
 * defect 1, research/channel-loop/TERMS-AUDIT-2026-10-05-prize-events.md). The local
 * part is masked and the domain kept, as `[redacted:email]@<domain>`, so a reader can
 * still tell a project's or a mailing list's domain from a person's mail host.
 */
export const SECRET_PATTERNS = [
  { kind: "stripe-secret-key", re: /\b(?:sk|rk)_(?:test|live)_[0-9A-Za-z]{10,}\b/g },
  { kind: "stripe-webhook-secret", re: /\bwhsec_[0-9A-Za-z]{20,}\b/g },
  { kind: "github-token", re: /\b(?:gh[pousr]_[0-9A-Za-z]{36,}|github_pat_[0-9A-Za-z_]{40,})\b/g },
  { kind: "aws-access-key-id", re: /\b(?:AKIA|ASIA)[0-9A-Z]{16}\b/g },
  { kind: "slack-token", re: /\bxox[abprs]-[0-9A-Za-z-]{10,}\b/g },
  // 6.10.2026 (tick 54): a 20-page prize-event dispatch was refused twice for a "Mapbox Secret Access Token"
  // embedded in a forum page (run 37436768438, annotation). sk. is the secret prefix; pk. (public) and tk. are not masked.
  // A Mapbox token is a JWT (payload {"u":…} → eyJ1Ijoi…). The fourth dispatch of 6.10 was refused for a
  // PUBLIC token (pk.eyJ…, 93 characters, two dots; run 37437891860's shape annotation) under the same
  // "Mapbox Secret Access Token" name, so every prefix is masked, over the whole run of token characters,
  // whatever separators and padding the page carries. A capture never needs a working map key.
  { kind: "mapbox-token", re: /\b(?:sk|pk|tk)\.eyJ[A-Za-z0-9_.+/=-]{20,}/g },
  // Google API keys (AIza…) are on the same push-protection list and web pages embed them for maps and analytics.
  { kind: "google-api-key", re: /\bAIza[0-9A-Za-z_-]{35}\b/g },
  { kind: "private-key", re: /-----BEGIN (?:[A-Z]+ )?PRIVATE KEY-----[\s\S]*?-----END (?:[A-Z]+ )?PRIVATE KEY-----/g },
];

function isTextLike(contentType) {
  const ct = String(contentType ?? "").toLowerCase();
  return isHtml(ct) || ct.startsWith("text/") || ct.includes("json") || ct.includes("xml") || ct.includes("javascript");
}

/**
 * An email address: a local part, @, and a domain whose last label is letters; group 1
 * is the @ as the view holds it (`@`, or a script escape `\u0040` or `\x40`), group 2 the
 * domain, which the mask keeps. Not an address, and left alone:
 *   - a "domain" ending in a file extension: `<name>@2x.png` and `<name>@2x-<sha>.png`, the
 *     retina image names (64 of the address-shaped strings in research/rendered/ on 5.10)
 *   - a local part that runs on from a longer word, or follows `/` (a path or a URL's
 *     user: a list archive, a form path, a Sentry DSN), or follows a `:` that comes after
 *     a `/` with none of space, quote, `<>()?=&,;|#` between them: a URL's password or a
 *     path segment (`https://user:password@host`, `/wiki/User:Name@host`). Any other `:`
 *     is a boundary like a space: `mailto:`, `Email:`, `sip:`, and also one after a
 *     URL's query, fragment or a comma (`/r?to=mailto:`, `https://x.org/,Email:`)
 * A string escape in a script (`\u003e`, `\x22`, `\n`, `\t`, any one-letter escape) ends
 * the word before a local part, as a space would, except an escaped slash (`\u002F`,
 * `\x2F`), which counts as a slash: a handle after it (`\u002F@<handle>`) stays a handle.
 * The same rules hold for an address whose @ is encoded, since tick 50 (5.10.2026). An @
 * written `\u0040` or `\x40` in a script string is an @ (the escape's letter in either case).
 * Which text the rules read (maskAddresses): a plain @ or a script escape first in the text as
 * it is, percent escapes and all, exactly as before tick 50 (there `%2F` is three local-part
 * characters, not a slash, so `%2F<local>@<domain>` is masked whole); then the text with its
 * percent escapes decoded, where `<local>%40<domain>` is read as the plain matcher reads
 * `<local>@<domain>` (an escape of a local-part character, `%2B`, is part of the local part;
 * `%20` ends it as a space would; after `%2F` it is a path and is left), as is a plain @ the
 * first reading left only because its word ran on through a percent escape.
 * Not found at all, and so not masked: an @ encoded twice (`%2540`, `&#37;40`), or
 * obfuscated (`[at]`, ` at `), or an address a script assembles. Cloudflare's email
 * protection is not an @ at all: maskAddresses reads it on its own (CLOUDFLARE), as a
 * data-cfemail value quoted `"`, `'`, `\"`, `\u0022`, `\x22`, `&quot;`, `&#34;`, `&#x22;` or not
 * at all, and as the hex after `email-protection#`; a value escaped twice (`\\\"` in JSON
 * inside JSON, `&amp;quot;`) is not found. Any `email-protection#` followed by a word made of hex
 * digits alone is read as one (a fragment `#cafe` becomes a bare mask): a harmless over-mask.
 */
const ADDRESS_PATTERN =
  /(?<=^|[^A-Za-z0-9._%+\-\/\\]|\\(?:u00(?!2f)[0-9a-f]{2}|x(?!2f)[0-9a-f]{2}|[nrtbfv]))[A-Za-z0-9._%+-]+(@|\\u0040|\\x40)(?<!\/[^\s"'<>()?=&,;|#]{0,256}:[A-Za-z0-9._%+-]+(?:@|\\u0040|\\x40))((?:[A-Za-z0-9-]+\.)+[A-Za-z]{2,63})(?![A-Za-z0-9]|\.[A-Za-z0-9-])(?<!\.(?:png|jpe?g|gif|svg|webp|avif|css|js|mjs|json|map|woff2?|ttf|otf|ico|mp4|webm|pdf|html?))/gi;

// A character reference, as decodeEntities reads one: hex, decimal, or a name it knows. The first pass's view.
const CHARACTER_REFERENCE = /&#x[0-9a-f]+;|&#\d+;|&[a-z]+;/gi;
// The same, or a URL's percent escape: the second pass's view.
const REFERENCE_OR_ESCAPE = /&#x[0-9a-f]+;|&#\d+;|&[a-z]+;|%[0-9a-f]{2}/gi;
const decodeReference = (ref) => (ref[0] === "%" ? String.fromCharCode(Number.parseInt(ref.slice(1), 16)) : decodeEntities(ref));

// Cloudflare's email protection: an address as hex, its first byte the key and every other byte the address's UTF-8
// XORed with it, in a span's data-cfemail or after an anchor's /cdn-cgi/l/email-protection#. Group 1 is what comes
// before the hex, kept as written: the attribute's quote may be ", ', none, an escaped one (\" in a JSON string,
// \u0022 or \x22 in a script) or an entity (&quot;, &#34;, &#x22;: HTML inside an attribute, a srcdoc). Group 2 is the hex.
const CLOUDFLARE =
  /(data-cfemail=(?:\\?["']|&quot;|&#0*34;|&#x0*22;|\\u0022|\\x22)?|email-protection#)([0-9a-f]+)(?![0-9a-z])/gi;

/**
 * The domain of the one address a Cloudflare hex decodes to (a mailto query after it, `?subject=…`, is allowed and goes
 * with the mask), or null. Decoded in memory only, never logged.
 */
function cloudflareDomain(hex) {
  if (hex.length < 4 || hex.length % 2 !== 0) return null;
  const bytes = Buffer.from(hex, "hex");
  const decoded = Buffer.from(bytes.subarray(1).map((b) => b ^ bytes[0])).toString("utf8");
  return /^[^@\s?]+@((?:[A-Za-z0-9-]+\.)+[A-Za-z]{2,63})(?:\?[^@]*)?$/.exec(decoded)?.[1] ?? null;
}

/**
 * Mask the addresses ADDRESS_PATTERN finds in a text, keeping each domain, in this order:
 *   1. Cloudflare's email protection: each data-cfemail value and email-protection# hash is one
 *      mask, `[redacted:email]@<domain>` with the domain of the address it decodes to, or
 *      `[redacted:email]` alone when it does not decode to one address (odd or short hex, no @,
 *      two; a mailto query after the one address goes with the mask).
 *   2. The rule as it was before tick 50, over the text with its character references decoded
 *      (an address spelt in them, each character as `&#NNN;` as some Markdown converters write a
 *      mailto link, is found too) and its percent escapes not: a plain @ (or a script escape) is
 *      masked here exactly as before, its local part read from the raw text, where `%2F` is
 *      three local-part characters and not a slash.
 *   3. The same rule over the text with its percent escapes decoded as well: the `%40` form
 *      (`<local>%40<domain>`, as a query string or an encoded note writes it, read as the plain
 *      rule reads the decoded text), and a plain @ that pass 2 leaves only because its word runs
 *      on through a percent escape (`/search/Contact%20<local>@<domain>`).
 * The mask keeps the @ as the text wrote it when it was `%40`, `\u0040` or `\x40`
 * (`[redacted:email]%40<domain>`); a character reference's @ is written `@`, as before. A mask's
 * `]` is never a local-part character, so no pass finds an address in an earlier one's mask.
 * Each view decodes in one pass; decodeEntities decodes hex, then decimal, then named
 * references, so a reference that decodes into another (`&#x26;#64;`) is an @ in the
 * extracted .txt but not here: storeCapture masks that .txt on its own. Each match is
 * replaced in the text itself, so the text changes only where an address was.
 */
function maskAddresses(input) {
  let count = 0;
  let text = input.replace(CLOUDFLARE, (_m, prefix, hex) => {
    count += 1;
    const domain = cloudflareDomain(hex);
    return `${prefix}[redacted:email]${domain ? `@${domain}` : ""}`;
  });
  for (const references of [CHARACTER_REFERENCE, REFERENCE_OR_ESCAPE]) {
    const pass = maskView(text, references);
    text = pass.text;
    count += pass.count;
  }
  return { text, count };
}

/** One pass of maskAddresses: ADDRESS_PATTERN over a view of text with the references matched by `references` decoded. */
function maskView(text, references) {
  let count = 0;
  let view = "";
  const shifts = []; // [index in view of a decoded reference, its length in text minus its length in view]
  let last = 0;
  for (const m of text.matchAll(references)) {
    const decoded = decodeReference(m[0]);
    if (decoded === m[0]) continue;
    view += text.slice(last, m.index);
    shifts.push([view.length, m[0].length - decoded.length]);
    view += decoded;
    last = m.index + m[0].length;
  }
  view += text.slice(last);
  let next = 0;
  let shift = 0;
  const inText = (i) => {
    for (; next < shifts.length && shifts[next][0] < i; next += 1) shift += shifts[next][1];
    return i + shift;
  };
  let masked = "";
  let from = 0;
  for (const m of view.matchAll(ADDRESS_PATTERN)) {
    const start = inText(m.index);
    const sep = m.index + m[0].length - m[2].length - m[1].length; // where the @ is in the view
    const written = text.slice(inText(sep), inText(sep + m[1].length));
    masked += `${text.slice(from, start)}[redacted:email]${written === "%40" ? written : m[1]}${m[2]}`;
    from = inText(m.index + m[0].length);
    count += 1;
  }
  return count === 0 ? { text, count } : { text: masked + text.slice(from), count };
}

/**
 * Mask secret-shaped strings and email addresses in a text body. A body with neither
 * comes back as the same bytes, so its hash (and the quiet git history) does not
 * change; binary bodies are never rewritten. The body is read as latin1, one character
 * per byte, so every byte outside a mask is written back as it was whatever the page's
 * charset (every pattern is ASCII). Returns the bytes to store and how many were masked.
 */
export function redactSecrets(bytes, contentType) {
  if (!bytes || !isTextLike(contentType)) return { bytes, count: 0 };
  let text = bytes.toString("latin1");
  let count = 0;
  for (const { kind, re } of SECRET_PATTERNS) {
    text = text.replace(re, () => {
      count += 1;
      return `[redacted:${kind}]`;
    });
  }
  const addresses = maskAddresses(text);
  count += addresses.count;
  return count === 0 ? { bytes, count: 0 } : { bytes: Buffer.from(addresses.text, "latin1"), count };
}

/**
 * Did the fetched body change? The hash is the main answer, but a page that starts
 * answering 403 has changed too, and so has one whose network error appeared or
 * cleared — and so has one whose line moved between a plain GET and the js mode
 * (renderedWith), because the meta must say how the stored bytes were made. A plain
 * line's meta has no renderedWith on either side, so nothing about it moves.
 */
export function bodyChanged(previousMeta, next) {
  if (!previousMeta) return true;
  if ((previousMeta.sha256 ?? null) !== (next.sha256 ?? null)) return true;
  if ((previousMeta.status ?? null) !== (next.status ?? null)) return true;
  if ((previousMeta.renderedWith ?? null) !== (next.renderedWith ?? null)) return true;
  return (previousMeta.error ?? null) !== (next.error ?? null);
}

/**
 * Did anything worth committing change? The body, as above — or, for a PDF only,
 * whether its text was extracted: a PDF whose bytes did not move but whose text
 * was just read (or whose extraction started or stopped failing) is worth a commit.
 *
 * The text state is compared for PDFs and nothing else, deliberately. Metas that
 * were edited by hand exist (an HTML capture whose body was removed on purpose, two
 * text/plain captures given a textPath by hand), and comparing textPath for every
 * type would rewrite them on the next run.
 */
export function hasChanged(previousMeta, next) {
  if (bodyChanged(previousMeta, next)) return true;
  if (!isPdf(next.contentType)) return false;
  if ((previousMeta.textPath ?? null) !== (next.textPath ?? null)) return true;
  return (previousMeta.textError ?? null) !== (next.textError ?? null);
}

/**
 * The record stored beside every fetched page. Key order is fixed so a diff of
 * this file reads as a change in the page, not a reshuffle of the JSON.
 *
 * `status` is the HTTP status, or null when the request never got one (DNS,
 * timeout, refused connection). `sha256` is null when there is no stored body.
 * `textError` is present only for a PDF with no text of the script's own, and
 * says why; `textPath` is then null. A failed fetch after a PDF capture carries
 * that capture's textPath, textError and redacted (previousTextState): they
 * describe the files still on disk, not this fetch.
 * `renderedWith` ("chromium") and `networkIdle` are present only for a js line:
 * networkIdle is true when the page's network went quiet before the DOM was taken,
 * false when the time ran out first (the DOM may then be partial), and null when no
 * DOM was taken at all.
 * `robots` and `robotsUrl` say what the host's robots.txt said about this URL on the
 * fetch that wrote the meta: "allowed" or "disallowed" (it was read), "none" (it
 * answered 4xx: no rules) or "unreachable" (5xx or no answer: complete disallow), and
 * which robots.txt that was. main always records them; a meta written by an older run
 * has neither.
 */
export function buildMeta({
  url,
  slug,
  fetchedAt,
  status = null,
  contentType = null,
  byteLength = 0,
  sha256: hash = null,
  previousMeta = null,
  truncated = false,
  error = null,
  bodyPath = null,
  textPath = null,
  textError = null,
  redacted = 0,
  renderedWith = null,
  networkIdle = null,
  robots = null,
  robotsUrl = null,
}) {
  const next = {
    url,
    slug,
    fetchedAt,
    status,
    contentType,
    byteLength,
    sha256: hash,
    truncated,
    // Present only when something was masked, so every other page's meta keeps its shape.
    ...(redacted > 0 ? { redacted } : {}),
    error,
    bodyPath,
    textPath,
    // Present only for a PDF whose text could not be read, for the same reason as `redacted`.
    ...(textError ? { textError } : {}),
    // Present only for a js line, so a plain line's meta is byte-identical to what it always was.
    ...(renderedWith ? { renderedWith, networkIdle } : {}),
    // What the host's robots.txt said about this URL on the fetch that wrote this meta (ruling 30.9 16(d) D2(v)).
    // Not part of the change test: an unchanged page writes nothing, so its meta keeps the robots state of the
    // fetch that captured its bytes. A refusal is an error, and that is a change.
    ...(robots ? { robots, robotsUrl } : {}),
  };
  return {
    ...next,
    changed: hasChanged(previousMeta, next),
    firstFetch: previousMeta === null,
    previousSha256: previousMeta ? (previousMeta.sha256 ?? null) : null,
    note:
      "Third-party content, fetched by .github/workflows/render-watch.yml and stored for citation only. " +
      "fetchedAt is when this stored content was captured, i.e. the last time the page changed - " +
      "not the last time it was checked; an unchanged page rewrites nothing. " +
      "Storing bytes is not reading them: a claim becomes [RENDERED] only when a session reads the text " +
      "and writes the finding into the research file.",
  };
}

export function metaPathFor(outDir, slug) {
  return join(outDir, `${slug}.meta.json`);
}

export function readPreviousMeta(outDir, slug, readFile = readFileSync) {
  const path = metaPathFor(outDir, slug);
  if (!existsSync(path)) return null;
  try {
    const parsed = JSON.parse(readFile(path, "utf8"));
    return parsed && typeof parsed === "object" ? parsed : null;
  } catch {
    // A meta file we cannot parse is treated as absent: the next fetch rewrites it.
    return null;
  }
}

// ---------------------------------------------------------------------------
// Fetching
// ---------------------------------------------------------------------------

/**
 * Read a response body, stopping at MAX_BYTES. Streaming rather than
 * `arrayBuffer()` so an oversized document is never fully pulled down.
 */
export async function readCappedBody(response, maxBytes = MAX_BYTES) {
  if (!response.body || typeof response.body.getReader !== "function") {
    const all = Buffer.from(await response.arrayBuffer());
    return all.length > maxBytes
      ? { bytes: all.subarray(0, maxBytes), truncated: true }
      : { bytes: all, truncated: false };
  }

  const reader = response.body.getReader();
  const chunks = [];
  let total = 0;
  let truncated = false;

  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    const chunk = Buffer.from(value);
    if (total + chunk.length >= maxBytes) {
      chunks.push(chunk.subarray(0, maxBytes - total));
      total = maxBytes;
      truncated = true;
      try {
        await reader.cancel();
      } catch {
        /* the connection is going away anyway */
      }
      break;
    }
    chunks.push(chunk);
    total += chunk.length;
  }

  return { bytes: Buffer.concat(chunks, total), truncated };
}

/**
 * 20, the Fetch standard's own limit ("if request's redirect count is 20, return a
 * network error"), so a page that `redirect: "follow"` reached is reached here too.
 */
export const MAX_REDIRECTS = 20;

/** The statuses `redirect: "follow"` follows when they carry a Location. */
const REDIRECT_STATUSES = new Set([301, 302, 303, 307, 308]);

/**
 * The one line a meta file says when a listed page sent us towards tiktok.com. Only
 * the host goes in — a TikTok URL's path and query vary, and the meta must not.
 */
export function tiktokRedirectError(host) {
  return (
    `redirected to tiktok.com (${host}); not followed — render-watch never fetches tiktok.com ` +
    "(logs/CHANNEL_LOOP.md §9; ruled: research/channel-loop/RULING-2026-09-30-video.md 16(d) D2(i))"
  );
}

/** Let go of a redirect's body: nothing reads it, and an unread body holds its connection. */
async function discardBody(response) {
  try {
    await response.body?.cancel?.();
  } catch {
    /* the connection is going away anyway */
  }
}

// ---------------------------------------------------------------------------
// robots.txt (RFC 9309) — ruled 30.9: research/channel-loop/RULING-2026-09-30-video.md 16(d) D2(v)
// ---------------------------------------------------------------------------

/**
 * RFC 9309 §2.3.1.2: "crawlers SHOULD follow at least five consecutive redirects" for robots.txt, and MAY
 * then assume it unavailable (which would allow everything). render-watch follows five and reads a sixth as
 * unreachable instead — complete disallow — because the stricter reading can never fetch what a site meant
 * to refuse.
 */
export const ROBOTS_MAX_REDIRECTS = 5;

/**
 * 500 KiB, the parsing limit RFC 9309 §2.5 sets as the least a crawler must read. A robots.txt is read up to this and
 * no further; one cut short is parsed only up to its last line break (completeRobotsLines), so a rule cut in half —
 * `Allow: /public/only-this` read as `Allow: /pub` — never widens what is allowed.
 */
export const ROBOTS_MAX_BYTES = 500 * 1024;

/** The robots.txt that governs a URL: /robots.txt at its own scheme, host and port (RFC 9309 §2.3). */
export function robotsTxtUrl(url) {
  return new URL("/robots.txt", new URL(String(url)).origin).href;
}

/** Is `url` a string that parses as an http: or https: URL — the only kind a robots.txt governs, and the only kind asked? */
export function isHttpUrl(url) {
  try {
    const { protocol } = new URL(String(url));
    return protocol === "http:" || protocol === "https:";
  } catch {
    return false;
  }
}

/**
 * The complete lines of a robots.txt body cut short at ROBOTS_MAX_BYTES: everything up to and including its last line
 * break, or nothing when it has none. The cut-off last line is not the site's rule, only the start of one.
 */
export function completeRobotsLines(text) {
  const s = String(text ?? "");
  const last = Math.max(s.lastIndexOf("\n"), s.lastIndexOf("\r"));
  return last < 0 ? "" : s.slice(0, last + 1);
}

const UNRESERVED_CHAR = /^[A-Za-z0-9._~-]$/;
const HEX_PAIR = /^[0-9A-Fa-f]{2}$/;

/**
 * Printable characters URL parsers disagree about: WHATWG percent-encodes `"`, `<`, `>`, `` ` ``, `{` and `}` in a path
 * and `'` in a query, and leaves `|`, `^` (and, in a query, the backtick and braces) literal; a robots.txt writes them
 * either way. Encoded on both sides, a rule and a URL compare alike whichever form each came in.
 */
const ALWAYS_ENCODED = new Set([...`"'<>\`{}|\\^`].map((ch) => ch.charCodeAt(0)));

/**
 * One form for a rule's path and a URL's path before they are compared (RFC 9309 §2.2.2): every octet
 * outside printable ASCII is percent-encoded from its UTF-8 bytes, and so is each ALWAYS_ENCODED character; a
 * percent-encoded unreserved character is decoded, and any other percent escape keeps its encoding with
 * upper-case hex. `*`, `$` and `%` pass through, so a pattern keeps its wildcards.
 */
export function normalizeRobotsPath(text) {
  const bytes = Buffer.from(String(text), "utf8");
  let out = "";
  for (let i = 0; i < bytes.length; i += 1) {
    const byte = bytes[i];
    const pair = i + 2 < bytes.length ? String.fromCharCode(bytes[i + 1], bytes[i + 2]) : "";
    if (byte === 0x25 && HEX_PAIR.test(pair)) {
      const decoded = String.fromCharCode(Number.parseInt(pair, 16));
      out += UNRESERVED_CHAR.test(decoded) ? decoded : `%${pair.toUpperCase()}`;
      i += 2;
    } else if (byte <= 0x20 || byte >= 0x7f || ALWAYS_ENCODED.has(byte)) {
      out += `%${byte.toString(16).toUpperCase().padStart(2, "0")}`;
    } else {
      out += String.fromCharCode(byte);
    }
  }
  return out;
}

/**
 * Parse a robots.txt body into groups: { groups: [{ agents: [value, …], rules: [{ allow, pattern }, …] }] }.
 * RFC 9309 §2.1-2.2: a run of consecutive `user-agent` lines opens one group and the `allow`/`disallow`
 * lines after it belong to it; a `user-agent` line after a rule opens the next group. Keys are
 * case-insensitive, `#` starts a comment, blank lines and other records (sitemap, crawl-delay) are ignored,
 * and a rule before any `user-agent` line belongs to no group. An empty rule value is no rule. A pattern
 * that does not start with `/` or `*` is read as if it did start with `/`. Patterns are stored normalised
 * (normalizeRobotsPath). An HTML error page parses to no groups at all, which allows everything, as the RFC
 * reads a file with no matching group.
 */
export function parseRobotsTxt(text) {
  const groups = [];
  let current = null;
  let lastWasRule = false;
  for (const rawLine of String(text ?? "").replace(/^﻿/, "").split(/\r\n|\r|\n/)) {
    const line = rawLine.replace(/#.*$/, "").trim();
    const colon = line.indexOf(":");
    if (line === "" || colon < 0) continue;
    const key = line.slice(0, colon).trim().toLowerCase();
    const value = line.slice(colon + 1).trim();
    if (key === "user-agent") {
      if (current === null || lastWasRule) {
        current = { agents: [], rules: [] };
        groups.push(current);
      }
      current.agents.push(value);
      lastWasRule = false;
    } else if (key === "allow" || key === "disallow") {
      if (current === null) continue;
      lastWasRule = true;
      if (value === "") continue;
      const pattern = value.startsWith("/") || value.startsWith("*") ? value : `/${value}`;
      current.rules.push({ allow: key === "allow", pattern: normalizeRobotsPath(pattern) });
    }
  }
  return { groups };
}

/**
 * The rules that apply to `token` (RFC 9309 §2.2.1): every group with a `user-agent` naming the token —
 * the value's leading run of letters, `_` and `-`, compared case-insensitively — combined; failing that,
 * every `*` group combined; failing that, none.
 */
export function robotsRulesFor(parsed, token = ROBOTS_PRODUCT_TOKEN) {
  const want = String(token).toLowerCase();
  const names = (agent) => (agent.match(/^[A-Za-z_-]+/)?.[0] ?? "").toLowerCase() === want;
  const mine = parsed.groups.filter((g) => g.agents.some(names));
  const chosen = mine.length > 0 ? mine : parsed.groups.filter((g) => g.agents.some((agent) => agent === "*"));
  return chosen.flatMap((g) => g.rules);
}

/**
 * Does `pattern` (normalised; `*` any run of characters, a final `$` the end of the path) match `path` from
 * its start? The position-set walk of Google's reference parser: linear in the pattern times the path, with
 * no backtracking, so a hostile pattern cannot stall a run.
 */
function robotsPatternMatches(pattern, path) {
  let positions = [0];
  for (let i = 0; i < pattern.length; i += 1) {
    const ch = pattern[i];
    if (ch === "$" && i === pattern.length - 1) return positions.at(-1) === path.length;
    if (ch === "*") {
      const from = positions[0];
      positions = [];
      for (let p = from; p <= path.length; p += 1) positions.push(p);
    } else {
      const next = [];
      for (const p of positions) if (p < path.length && path[p] === ch) next.push(p + 1);
      if (next.length === 0) return false;
      positions = next;
    }
  }
  return true;
}

/**
 * Is `url` allowed by `rules` (robotsRulesFor)? RFC 9309 §2.2.2: the path and query, normalised, are matched
 * case-sensitively against every rule; the longest matching pattern decides, an Allow wins a tie, no match
 * allows, and /robots.txt itself is always allowed. Returns { allowed, rule } where rule is the deciding
 * { allow, pattern }, or null.
 */
export function robotsDecision(rules, url) {
  const parsed = new URL(String(url));
  const path = normalizeRobotsPath(`${parsed.pathname}${parsed.search}`);
  if (path === "/robots.txt") return { allowed: true, rule: null };
  let best = null;
  for (const rule of rules) {
    if (!robotsPatternMatches(rule.pattern, path)) continue;
    const longer = best === null || rule.pattern.length > best.pattern.length;
    const allowOnTie = best !== null && rule.pattern.length === best.pattern.length && rule.allow && !best.allow;
    if (longer || allowOnTie) best = rule;
  }
  return best === null ? { allowed: true, rule: null } : { allowed: best.allow, rule: { allow: best.allow, pattern: best.pattern } };
}

/** Why no request of any kind goes to a host, or null when it may be asked. The terms refusals come first, always. */
function refusedHost(hostname) {
  if (isTikTokHost(hostname)) return "tiktok.com, which render-watch never contacts";
  const barred = termsBarred(hostname);
  return barred ? `${barred.domain}, whose terms bar automated access` : null;
}

/**
 * Fetch one robots.txt, following up to ROBOTS_MAX_REDIRECTS redirects by hand, with the identifying User-Agent
 * and its own timeout. A redirect is followed only to another /robots.txt — that exact path, no query — on a host
 * that is not refused (tiktok.com, TERMS_BARRED): a robots.txt that points at a page is not a robots.txt, and
 * following it would fetch that page before anything has said it may be fetched. Never throws. Returns
 * { robotsUrl, state, status, contentType, bytes, truncated, reason, rules }:
 *   - state "parsed": a 2xx, read up to maxBytes (ROBOTS_MAX_BYTES) and, when cut short, parsed only up to its
 *     last line break; `rules` are the ones that apply to ROBOTS_PRODUCT_TOKEN
 *   - state "none": a 4xx other than 429, which RFC 9309 §2.3.1.3 reads as no robots.txt (everything allowed)
 *   - state "unreachable": a 5xx, a 429 (a site asking us to slow down is not a site with no rules; Google reads
 *     429 the same way), a network error, a timeout, too many redirects, a redirect somewhere other than a
 *     robots.txt, a refused hop or any other answer, which §2.3.1.4 reads as complete disallow; `reason` says which
 */
export async function fetchRobots(robotsUrl, { fetchImpl, timeoutMs = TIMEOUT_MS, maxBytes = ROBOTS_MAX_BYTES } = {}) {
  const doFetch = fetchImpl ?? globalThis.fetch;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  const answer = (state, fields) => ({
    robotsUrl,
    state,
    status: null,
    contentType: null,
    bytes: null,
    truncated: false,
    reason: null,
    rules: [],
    ...fields,
  });
  try {
    let url = robotsUrl;
    for (let redirects = 0; ; redirects += 1) {
      const response = await doFetch(url, {
        signal: controller.signal,
        redirect: "manual",
        headers: { "user-agent": USER_AGENT, accept: "text/plain,*/*;q=0.8", "accept-language": ACCEPT_LANGUAGE },
      });
      const status = response.status;
      const contentType = response.headers?.get?.("content-type") ?? null;
      if (REDIRECT_STATUSES.has(status)) {
        await discardBody(response);
        const location = response.headers?.get?.("location") ?? null;
        let next = null;
        try {
          next = location === null ? null : new URL(location, url);
        } catch {
          next = null;
        }
        if (next === null || (next.protocol !== "http:" && next.protocol !== "https:")) {
          return answer("unreachable", { status, contentType, reason: `HTTP ${status} redirect with no usable Location` });
        }
        const refused = refusedHost(next.hostname);
        if (refused) {
          return answer("unreachable", {
            status,
            contentType,
            reason: `redirected to ${refused} (${next.hostname.toLowerCase()}); not followed`,
          });
        }
        if (next.pathname !== "/robots.txt" || next.search !== "") {
          return answer("unreachable", {
            status,
            contentType,
            reason: `HTTP ${status} redirect to ${next.origin}${next.pathname}${next.search}, which is not a robots.txt; not followed`,
          });
        }
        if (redirects >= ROBOTS_MAX_REDIRECTS) {
          return answer("unreachable", { status, contentType, reason: `more than ${ROBOTS_MAX_REDIRECTS} redirects` });
        }
        url = next.href;
        continue;
      }
      if (status >= 200 && status <= 299) {
        const { bytes, truncated } = await readCappedBody(response, maxBytes);
        const text = bytes.toString("utf8");
        const rules = robotsRulesFor(parseRobotsTxt(truncated ? completeRobotsLines(text) : text));
        return answer("parsed", { status, contentType, bytes, truncated, rules });
      }
      await discardBody(response);
      if (status >= 400 && status <= 499 && status !== 429) return answer("none", { status, contentType, reason: `HTTP ${status}` });
      return answer("unreachable", { status, contentType, reason: `HTTP ${status}` });
    }
  } catch (error) {
    const message = error instanceof Error ? `${error.name}: ${error.message}` : String(error);
    return answer("unreachable", {
      reason: controller.signal.aborted ? `timeout after ${timeoutMs}ms (${message})` : message,
    });
  } finally {
    clearTimeout(timer);
  }
}

/** The one line a meta says when robots.txt kept a URL from being fetched. Deterministic, like every meta line. */
export function robotsRefusalError(decision, hopHost = null) {
  const head = hopHost ? `redirected to ${String(hopHost).toLowerCase()}: ` : "";
  if (decision.robots === "disallowed") {
    const rule = decision.rule ? `, "${decision.rule.allow ? "Allow" : "Disallow"}: ${decision.rule.pattern}"` : "";
    return `${head}robots.txt disallows this URL for ${ROBOTS_PRODUCT_TOKEN} (${decision.robotsUrl}${rule}); not fetched`;
  }
  if (decision.robots === "unreachable") {
    return (
      `${head}robots.txt could not be read (${decision.robotsUrl}: ${decision.reason}); RFC 9309 §2.3.1.4 reads that ` +
      "as complete disallow, so nothing on the host is fetched this run; not fetched"
    );
  }
  return `${head}${decision.reason ?? "refused"}; not fetched`;
}

/**
 * The robots.txt of every host a run touches, fetched once per scheme, host and port (fetchRobots) and kept
 * for the run. `decide(url)` answers { allowed, robots, robotsUrl, rule, reason }, where `robots` is what the
 * meta records: "allowed" or "disallowed" (robots.txt was read), "none" (it answered 4xx: no rules), or
 * "unreachable" (5xx, 429, no answer: nothing on the host is fetched this run). `probe(url)` is the robots-only
 * line: that host's robots.txt as a capture result, from the same fetch. A host refused on its terms is
 * answered without a request of any kind — the callers refuse it first, and this refuses it again. Neither
 * throws: a URL that is not http(s) (about:blank, data:, a string that does not parse) is refused with
 * `robots: null` and no request, as a refused host is.
 */
export function robotsChecker({ fetchImpl, timeoutMs = TIMEOUT_MS, maxBytes = ROBOTS_MAX_BYTES } = {}) {
  const cache = new Map();
  const robotsFor = (url) => {
    const robotsUrl = robotsTxtUrl(url);
    if (!cache.has(robotsUrl)) cache.set(robotsUrl, fetchRobots(robotsUrl, { fetchImpl, timeoutMs, maxBytes }));
    return cache.get(robotsUrl);
  };
  const refusal = (url) => {
    if (!isHttpUrl(url)) {
      const scheme = String(url).match(/^[A-Za-z][A-Za-z0-9+.-]*:/)?.[0].toLowerCase() ?? "a string with no scheme";
      return `${scheme} is not an http(s) URL: no robots.txt governs it, and nothing is requested`;
    }
    const refused = refusedHost(new URL(String(url)).hostname);
    return refused ? `${refused}: no request of any kind, robots.txt included` : null;
  };
  return {
    async decide(url) {
      const refused = refusal(url);
      if (refused) return { allowed: false, robots: null, robotsUrl: null, rule: null, reason: refused };
      const got = await robotsFor(url);
      if (got.state === "none") return { allowed: true, robots: "none", robotsUrl: got.robotsUrl, rule: null, reason: got.reason };
      if (got.state === "unreachable") {
        return { allowed: false, robots: "unreachable", robotsUrl: got.robotsUrl, rule: null, reason: got.reason };
      }
      const { allowed, rule } = robotsDecision(got.rules, url);
      return { allowed, robots: allowed ? "allowed" : "disallowed", robotsUrl: got.robotsUrl, rule, reason: null };
    },
    async probe(url) {
      const refused = refusal(url);
      if (refused) {
        return { status: null, contentType: null, bytes: null, truncated: false, error: refused, robots: null, robotsUrl: null };
      }
      const got = await robotsFor(url);
      const base = { status: got.status, contentType: got.contentType, robotsUrl: got.robotsUrl };
      if (got.state === "parsed") return { ...base, bytes: Buffer.from(got.bytes), truncated: got.truncated, error: null, robots: "allowed" };
      return { ...base, bytes: null, truncated: false, error: got.reason, robots: got.state };
    },
  };
}

/**
 * Fetch one entry. Never throws: a non-2xx answer and a network failure both come
 * back as a result object, because a page that refuses us is a finding, not a
 * broken build.
 *
 * Redirects are followed here, by hand (`redirect: "manual"`), rather than by fetch:
 * `redirect: "follow"` would request a tiktok.com hop before anything could look at
 * it. Each Location is resolved against the URL that sent it, the same headers go
 * with every hop, the one TIMEOUT_MS covers the whole chain, and at most
 * MAX_REDIRECTS hops are followed — what "follow" did for a GET, apart from the hop
 * that is refused: a tiktok.com one (isTikTokHost), recorded with the redirect's
 * status and tiktokRedirectError, before it is requested.
 *
 * With `robots` (a robotsChecker, which main always passes), every URL of the chain is
 * checked against its host's robots.txt before it is requested: the listed URL before
 * anything else, and each hop after the tiktok.com and TERMS_BARRED refusals, so a
 * refused host is never asked even for its robots.txt. A URL robots.txt disallows, or
 * one on a host whose robots.txt could not be read, is not requested; the result says
 * why (robotsRefusalError). The result then carries `robots` and `robotsUrl` for the
 * last URL checked — the page stored, or the one refused. Without `robots` the result
 * has neither key and no robots.txt is fetched, as before.
 */
export async function fetchOne(
  entry,
  { fetchImpl = fetch, timeoutMs = TIMEOUT_MS, maxBytes = MAX_BYTES, robots = null } = {},
) {
  let decision = null;
  const withRobots = (result) =>
    decision ? { ...result, robots: decision.robots, robotsUrl: decision.robotsUrl } : result;
  if (robots) {
    decision = await robots.decide(entry.url);
    if (!decision.allowed) {
      return withRobots({ status: null, contentType: null, bytes: null, truncated: false, error: robotsRefusalError(decision) });
    }
  }
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    let url = entry.url;
    let response;
    for (let redirects = 0; ; redirects += 1) {
      response = await fetchImpl(url, {
        signal: controller.signal,
        redirect: "manual",
        headers: {
          "user-agent": USER_AGENT,
          accept: "text/html,application/xhtml+xml,application/xml;q=0.9,application/json;q=0.9,*/*;q=0.8",
          "accept-language": ACCEPT_LANGUAGE,
        },
      });
      const location = REDIRECT_STATUSES.has(response.status) ? (response.headers?.get?.("location") ?? null) : null;
      if (location === null) break; // not a redirect: this is the answer (a 3xx with no Location included, as before)

      const refused = (error) =>
        withRobots({
          status: response.status,
          contentType: response.headers?.get?.("content-type") ?? null,
          bytes: null,
          truncated: false,
          error,
        });
      await discardBody(response);
      let next;
      try {
        next = new URL(location, url);
      } catch {
        return refused(`HTTP ${response.status} redirect to a Location that is not a URL; not followed`);
      }
      if (next.protocol !== "http:" && next.protocol !== "https:") {
        return refused(`HTTP ${response.status} redirect to a ${next.protocol} URL; not followed`);
      }
      if (isTikTokHost(next.hostname)) return refused(tiktokRedirectError(next.hostname));
      const barredNext = termsBarred(next.hostname);
      if (barredNext) {
        return refused(`redirected to ${barredNext.domain} (${next.hostname.toLowerCase()}), whose terms bar automated access; not followed`);
      }
      if (redirects >= MAX_REDIRECTS) return refused(`more than ${MAX_REDIRECTS} redirects; not followed`);
      if (robots) {
        // After the refusals above: a barred host is never asked, not even for its robots.txt.
        decision = await robots.decide(next.href);
        if (!decision.allowed) return refused(robotsRefusalError(decision, next.hostname));
      }
      url = next.href;
    }

    const contentType = response.headers?.get?.("content-type") ?? null;
    if (!response.ok) {
      return withRobots({
        status: response.status,
        contentType,
        bytes: null,
        truncated: false,
        error: `HTTP ${response.status}${response.statusText ? ` ${response.statusText}` : ""}`,
      });
    }

    const { bytes, truncated } = await readCappedBody(response, maxBytes);
    return withRobots({ status: response.status, contentType, bytes, truncated, error: null });
  } catch (error) {
    const message = error instanceof Error ? `${error.name}: ${error.message}` : String(error);
    return withRobots({
      status: null,
      contentType: null,
      bytes: null,
      truncated: false,
      error: controller.signal.aborted ? `timeout after ${timeoutMs}ms (${message})` : message,
    });
  } finally {
    clearTimeout(timer);
  }
}

// ---------------------------------------------------------------------------
// The js mode: one URL in headless Chromium
// ---------------------------------------------------------------------------

/** What a js line's meta says it was rendered with. */
export const RENDERED_WITH = "chromium";

/**
 * The browser context every js URL gets, fresh, and closes after it. Nothing is
 * carried in or out: no storageState, no cookies, no permissions. The same
 * User-Agent and accept-language as a plain GET; everything else is Chromium's
 * default. Service workers are blocked so a page cannot answer its own requests
 * around the tiktok.com block (route() does not see what a service worker serves).
 */
export function browserContextOptions() {
  return {
    userAgent: USER_AGENT,
    extraHTTPHeaders: { "accept-language": ACCEPT_LANGUAGE },
    acceptDownloads: false,
    serviceWorkers: "block",
  };
}

/** A Playwright error's name and first line: its call log varies, and the meta must not. */
function describeBrowserError(error) {
  if (!(error instanceof Error)) return String(error);
  const firstLine = String(error.message).split(/\r?\n/)[0].trim();
  return `${error.name}: ${firstLine}`;
}

/** The host of a URL string, or null when it does not parse. */
function hostOf(url) {
  try {
    return new URL(String(url)).hostname;
  } catch {
    return null;
  }
}

/**
 * The tiktok.com host a navigation response came from or passed through, or null.
 * Walks the response's own URL and its request's redirect chain (redirectedFrom):
 * where the host-resolver rule does not apply (a proxy that resolves names itself),
 * a redirect to TikTok is followed, and this is what keeps its page out of the
 * repository.
 */
export function tiktokHostInChain(response) {
  const hosts = [hostOf(response.url?.())];
  for (let request = response.request?.() ?? null; request; request = request.redirectedFrom?.() ?? null) {
    hosts.push(hostOf(request.url()));
  }
  return hosts.find((host) => host !== null && isTikTokHost(host)) ?? null;
}

/** Every URL of a navigation response's redirect chain, last to first (the response's own URL, then redirectedFrom). */
function redirectChainUrls(response) {
  const urls = [];
  const own = response?.url?.();
  if (own) urls.push(String(own));
  for (let request = response?.request?.() ?? null; request; request = request.redirectedFrom?.() ?? null) {
    urls.push(String(request.url()));
  }
  return urls;
}

/** The TERMS_BARRED host (not tiktok.com: that has its own refusal) a navigation response came from or passed through, or null. */
function barredHostInChain(response) {
  const hosts = redirectChainUrls(response).map(hostOf);
  return hosts.find((host) => host !== null && !isTikTokHost(host) && termsBarred(host) !== null) ?? null;
}

/**
 * Why a js page is not stored when its main frame was sent on to a TERMS_BARRED host — a server redirect, or its own
 * script. The browser's host-resolver rule (chromiumLaunchOptions) keeps that name from resolving, and route() aborts
 * a script's move there; this is what keeps the page out when neither applied. It claims only what is always true.
 */
export function barredNavigationError(host) {
  const name = String(host).toLowerCase();
  const barred = termsBarred(name);
  return `the browser was sent on to ${barred?.domain ?? name} (${name}), whose terms bar automated access; not stored`;
}

/**
 * The close reason for a WebSocket a page opens to a refused host (at most 123 bytes, as the protocol allows).
 * tiktok.com keeps the reason it always had.
 */
function webSocketRefusal(ws) {
  let host = null;
  try {
    host = hostOf(typeof ws?.url === "function" ? ws.url() : null);
  } catch {
    host = null;
  }
  const barred = host !== null && !isTikTokHost(host) ? termsBarred(host) : null;
  return barred ? `render-watch never contacts ${barred.domain}: its terms bar automated access` : "render-watch never contacts tiktok.com";
}

/** What withinBudget resolves to when the time ran out first. */
const TIMED_OUT = Symbol("timed out");

/**
 * Wait for `promise` for at most `ms`: its value, or TIMED_OUT. A rejection is passed
 * on. The promise itself is left running — the caller closes whatever it runs in —
 * with a catch attached, so its later rejection is not an unhandled one.
 */
async function withinBudget(promise, ms) {
  promise.catch(() => {});
  let timer;
  const deadline = new Promise((resolveDeadline) => {
    timer = setTimeout(() => resolveDeadline(TIMED_OUT), ms);
  });
  try {
    return await Promise.race([promise, deadline]);
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Render one js entry in `browser` (a Playwright Browser, or a fake with the same
 * few methods). Never throws, like fetchOne: a refusal, a timeout or a crash comes
 * back as a result with `error`, and the caller stores it exactly as a plain one.
 *
 * One navigation (`domcontentloaded`, TIMEOUT_MS), then a wait for the network to go
 * quiet with whatever time the navigation left, then page.content() — the DOM as it
 * stands — with whatever time is left after that. page.content() has no timeout of
 * its own and waits for the page's main thread: a script spinning forever would hold
 * it (and the whole run) indefinitely, so it is raced against the time left, and a
 * page that loses is closed with its context and recorded as a timeout. A non-2xx
 * answer or a non-HTML page stores nothing. The DOM is capped at maxBytes as a plain
 * body is. The context is closed whatever happened.
 *
 * A page whose main frame went to tiktok.com — a server redirect, or the page's own
 * script moving it — stores nothing either; the meta says tiktokRedirectError. The
 * browser's host-resolver rule (chromiumLaunchOptions) is what stops the request
 * itself; this is what keeps the page out when that rule did not apply.
 *
 * No request to a TERMS_BARRED host either, in the same three layers as tiktok.com:
 * the resolver rule, route() and routeWebSocket() for what a page starts itself, and
 * a page whose main frame was sent there is not stored (barredNavigationError).
 *
 * With `robots` (a robotsChecker), robots.txt is honoured in two places:
 *   - before a request is sent: route() sees the first URL of every request chain a
 *     page starts — each script, image, XHR, frame and the page's own moves (a
 *     script's location change, a meta refresh) — and a URL robots.txt disallows, or
 *     one on a host whose robots.txt could not be read, is aborted unsent. A page
 *     whose own move was aborted stores nothing; a page that merely lost a
 *     subresource is stored, and the result lists what was held back (`robotsBlocked`)
 *   - after the page settles, for what route() cannot see: a server redirect hop,
 *     which the browser follows itself, so that hop was already requested. A page
 *     reached through one that robots.txt disallows is not stored
 * The result carries `robots` and `robotsUrl`: on success those of the last document
 * the main frame loaded (the page stored, which an allowed redirect may have put on
 * another host), on a refusal those of the URL refused. The listed URL is checked by
 * the caller, before this runs.
 */
export async function renderWithBrowser(
  entry,
  { browser, timeoutMs = TIMEOUT_MS, maxBytes = MAX_BYTES, now = Date.now, robots = null } = {},
) {
  const failed = (fields) => ({
    status: null,
    contentType: null,
    bytes: null,
    truncated: false,
    ...fields,
    renderedWith: RENDERED_WITH,
    networkIdle: null,
  });
  const started = now();
  // Playwright reads a timeout of 0 as "no timeout", so the floor is 1 ms.
  const timeLeft = () => Math.max(1, timeoutMs - (now() - started));
  let context = null;
  // The first tiktok.com host the page's main frame tried to navigate to, if any.
  let tiktokNavigation = null;
  // The first TERMS_BARRED host the page's main frame tried to navigate to, if any.
  let barredNavigation = null;
  // Every URL the main frame navigated to: the listed one, its redirect hops, and any move its script made.
  const mainFrameUrls = [];
  // Every request route() aborted because robots.txt said no (or could not be read): url -> the decision.
  const robotsBlocked = new Map();
  try {
    context = await browser.newContext(browserContextOptions());
    // robots.txt before any request a page starts itself (ruling 30.9 16(d) D2(v)). Registered first on purpose:
    // Playwright runs the last-registered matching route first, so the refused-host route below answers tiktok.com
    // and TERMS_BARRED requests before this one is asked, and their robots.txt is never fetched.
    if (robots) {
      await context.route(
        () => true,
        async (route) => {
          try {
            const url = route.request().url();
            if (!isHttpUrl(url)) return await route.fallback();
            const decision = await robots.decide(url);
            if (decision.allowed) return await route.fallback();
            robotsBlocked.set(url, decision);
            return await route.abort("blockedbyclient");
          } catch {
            /* the page or its context closed while robots.txt was being read: nothing is left to answer */
          }
          return undefined;
        },
      );
    }
    // No request to tiktok.com, or to a host whose terms bar automated access, from inside a page either — an
    // embed, a script, a frame, and (route() does not see these) a WebSocket, which is closed before it reaches
    // the server. A second layer: route() is called only for the first URL of a redirect chain, so the resolver
    // rules in chromiumLaunchOptions are what stop a redirect. The TikTok pause (logs/CHANNEL_LOOP.md §9), ruled:
    // research/channel-loop/RULING-2026-09-30-video.md 16(d) D2(i); TERMS_BARRED: the same ruling, D2(ii).
    const onRefusedHost = (url) => refusedHost(url.hostname) !== null;
    await context.route(onRefusedHost, (route) => route.abort("blockedbyclient"));
    await context.routeWebSocket(onRefusedHost, (ws) => ws.close({ code: 1008, reason: webSocketRefusal(ws) }));
    const page = await context.newPage();
    // Every hop of a main-frame navigation is a request here, redirect targets included.
    page.on("request", (request) => {
      if (!request.isNavigationRequest()) return;
      let mainFrame = false;
      try {
        mainFrame = request.frame() === page.mainFrame();
      } catch {
        return; // a service worker's request has no frame (and service workers are blocked)
      }
      if (!mainFrame) return;
      mainFrameUrls.push(request.url());
      const host = hostOf(request.url());
      if (tiktokNavigation === null && host !== null && isTikTokHost(host)) tiktokNavigation = host;
      if (barredNavigation === null && host !== null && !isTikTokHost(host) && termsBarred(host) !== null) barredNavigation = host;
    });
    const refusedTikTok = () => failed({ error: tiktokRedirectError(tiktokNavigation) });
    const refusedBarred = () => failed({ error: barredNavigationError(barredNavigation) });

    const response = await page.goto(entry.url, { waitUntil: "domcontentloaded", timeout: timeoutMs });
    if (tiktokNavigation === null && response) tiktokNavigation = tiktokHostInChain(response);
    if (tiktokNavigation !== null) return refusedTikTok();
    if (barredNavigation === null && response) barredNavigation = barredHostInChain(response);
    if (barredNavigation !== null) return refusedBarred();
    if (!response) return failed({ error: "the navigation produced no response" });

    const status = response.status();
    const contentType = response.headers()["content-type"] ?? null;
    if (!response.ok()) {
      const statusText = response.statusText();
      return failed({ status, contentType, error: `HTTP ${status}${statusText ? ` ${statusText}` : ""}` });
    }
    if (!isHtml(contentType)) {
      return failed({
        status,
        contentType,
        error:
          `js mode stores HTML pages only, and this page answered ${contentType ?? "with no Content-Type"}; ` +
          "list it without the js flag to store it as fetched",
      });
    }

    let networkIdle = true;
    try {
      await page.waitForLoadState("networkidle", { timeout: timeLeft() });
    } catch {
      networkIdle = false; // the time ran out first: take the DOM as it stands, and say so
    }

    const html = await withinBudget(page.content(), timeLeft());
    if (html === TIMED_OUT) {
      // The finally below closes the context, which is what releases the hung page.content().
      return failed({
        status,
        contentType,
        error: `timeout after ${timeoutMs}ms (the rendered page could not be read within the time left)`,
      });
    }
    // The page's own script may have moved it to tiktok.com, or to a barred host, while the network settled.
    if (tiktokNavigation !== null) return refusedTikTok();
    if (barredNavigation !== null) return refusedBarred();

    // Every other http(s) URL the main frame went to is held to its host's robots.txt, as a plain GET's hops are.
    // A move the page's own script made went through route() above, and one robots.txt refused was never sent. A
    // server redirect hop did not: the browser follows those itself, so it was requested before this can look at
    // it, and what the check can still do is keep that page out of the repository (a stated limit).
    let robotsState = null;
    if (robots) {
      const hops = [...new Set([...mainFrameUrls, ...redirectChainUrls(response)])].filter(
        (url) => url !== entry.url && isHttpUrl(url),
      );
      for (const hop of hops) {
        const host = hostOf(hop) ?? hop;
        const blocked = robotsBlocked.get(hop);
        if (blocked) {
          return failed({
            status,
            contentType,
            error:
              `the page tried to go on to ${host}, and ${robotsRefusalError(blocked).replace(/; not fetched$/, "")}; ` +
              "that navigation was stopped before it was sent, and the page is not stored",
            robots: blocked.robots,
            robotsUrl: blocked.robotsUrl,
          });
        }
        const decision = await robots.decide(hop);
        if (!decision.allowed) {
          return failed({
            status,
            contentType,
            error:
              decision.robots === null
                ? `the browser went on to ${host}, which render-watch does not ask (${refusedHost(host) ?? decision.reason}); ` +
                  "not stored (the browser had already requested it)"
                : `the browser went on to ${host}, and ${robotsRefusalError(decision).replace(/; not fetched$/, "")}; ` +
                  "not stored (a browser follows redirects itself, so the hop was requested before this check)",
            robots: decision.robots,
            robotsUrl: decision.robotsUrl,
          });
        }
      }
      // The meta records the robots.txt of the page stored: the last document the main frame loaded.
      const stored = [...mainFrameUrls].reverse().find(isHttpUrl) ?? response.url?.() ?? entry.url;
      const decision = await robots.decide(isHttpUrl(stored) ? stored : entry.url);
      robotsState = { robots: decision.robots, robotsUrl: decision.robotsUrl };
    }

    const all = Buffer.from(html, "utf8");
    const truncated = all.length > maxBytes;
    const heldBack = [...robotsBlocked.keys()];
    return {
      status,
      contentType,
      bytes: truncated ? all.subarray(0, maxBytes) : all,
      truncated,
      error: null,
      renderedWith: RENDERED_WITH,
      networkIdle,
      ...(robotsState ?? {}),
      ...(heldBack.length > 0 ? { robotsBlocked: heldBack } : {}),
    };
  } catch (error) {
    // A navigation to tiktok.com, or to a barred host, fails to resolve (the resolver rules); say why, not
    // "name not resolved".
    if (tiktokNavigation !== null) return failed({ error: tiktokRedirectError(tiktokNavigation) });
    if (barredNavigation !== null) return failed({ error: barredNavigationError(barredNavigation) });
    const message = describeBrowserError(error);
    return failed({ error: error?.name === "TimeoutError" ? `timeout after ${timeoutMs}ms (${message})` : message });
  } finally {
    if (context) await context.close().catch(() => {});
  }
}

/**
 * Import the pinned playwright-core, from this repository's node_modules (the
 * devDependency) or, on the runner, from NODE_PATH, where the workflow installs it
 * outside the checkout. createRequire honours NODE_PATH; a bare import() would not.
 */
export async function loadPlaywright() {
  const path = createRequire(import.meta.url).resolve("playwright-core");
  const mod = await import(pathToFileURL(path).href);
  return mod.default ?? mod;
}

/**
 * Every tiktok.com name fails to resolve inside the browser — tiktok.com, any
 * subdomain, and both with the trailing dot DNS accepts (`www.tiktok.com.` resolves
 * like `www.tiktok.com`, and a pattern without the dot does not match it; tested
 * against Chromium 141 on 29.9). This is the layer that stops a redirect: Playwright
 * calls a route() handler only for the first URL of a redirect chain, so a listed
 * page answering `302 → www.tiktok.com` was fetched through route() alone.
 */
export const TIKTOK_HOST_RESOLVER_RULES = [
  "MAP tiktok.com ~NOTFOUND",
  "MAP *.tiktok.com ~NOTFOUND",
  "MAP tiktok.com. ~NOTFOUND",
  "MAP *.tiktok.com. ~NOTFOUND",
].join(", ");

/**
 * The same four rules for every TERMS_BARRED domain: its name and every subdomain, with and without the trailing
 * dot, fail to resolve inside the browser. A redirect to gumroad.com or google.com is the case route() cannot see
 * (ruling 30.9 16(d) D2(ii)); this is what stops it before a request is sent.
 */
export const TERMS_BARRED_HOST_RESOLVER_RULES = TERMS_BARRED.flatMap(({ domain }) => [
  `MAP ${domain} ~NOTFOUND`,
  `MAP *.${domain} ~NOTFOUND`,
  `MAP ${domain}. ~NOTFOUND`,
  `MAP *.${domain}. ~NOTFOUND`,
]).join(", ");

/**
 * Exactly what Chromium is launched with, pinned by a test: headless, and one
 * argument, the resolver rules — tiktok.com's, then every TERMS_BARRED domain's.
 * Nothing else — no flag that weakens the browser (web security, site isolation)
 * and nothing that hides automation.
 */
export function chromiumLaunchOptions() {
  return {
    headless: true,
    args: [`--host-resolver-rules=${TIKTOK_HOST_RESOLVER_RULES}, ${TERMS_BARRED_HOST_RESOLVER_RULES}`],
  };
}

/** Launch headless Chromium with chromiumLaunchOptions(). `load` exists for the tests. */
export async function launchChromium({ load = loadPlaywright } = {}) {
  const { chromium } = await load();
  return chromium.launch(chromiumLaunchOptions());
}

function describeLaunchError(error) {
  if (error?.code === "MODULE_NOT_FOUND" || error?.code === "ERR_MODULE_NOT_FOUND") {
    return (
      "playwright-core is not installed on this host (MODULE_NOT_FOUND); .github/workflows/render-watch.yml " +
      "installs it, and Chromium, only when the list has a js line"
    );
  }
  return `no browser could be started (${describeBrowserError(error)})`;
}

/** Why the js lines after a browser died are skipped. */
const BROWSER_DISCONNECTED = "the browser disconnected during the run";

/**
 * One browser per run, launched on the first js line and only then; one attempt.
 * If it cannot be started, or disconnects during the run, render() answers
 * { skipped: <why> } for every js line from then on and the caller writes nothing
 * for them — including the line that was rendering when it died: its error
 * ("page.goto: net::ERR_ABORTED", "browser has been closed") is the host's failure,
 * not the site's answer, so it is not stored either.
 *
 * `robots` (the run's robotsChecker) goes to renderWithBrowser, which holds every URL
 * the main frame went on to against its host's robots.txt. The listed URL itself is
 * checked by the caller before render() is called.
 */
export function jsRenderer({
  launchBrowser = launchChromium,
  timeoutMs = TIMEOUT_MS,
  maxBytes = MAX_BYTES,
  robots = null,
} = {}) {
  let browser = null;
  let launchError = null;
  const disconnected = () => typeof browser?.isConnected === "function" && !browser.isConnected();
  return {
    async render(entry) {
      if (!browser && !launchError) {
        try {
          browser = await launchBrowser();
          const version = typeof browser.version === "function" ? browser.version() : "unknown version";
          process.stdout.write(`render-watch: js mode, headless Chromium ${version}\n`);
        } catch (error) {
          launchError = describeLaunchError(error);
        }
      }
      if (!launchError && disconnected()) launchError = BROWSER_DISCONNECTED;
      if (launchError) return { skipped: launchError };
      const result = await renderWithBrowser(entry, { browser, timeoutMs, maxBytes, robots });
      // Died during this line: skip it too rather than record the crash as the site's error.
      if (result.error && disconnected()) {
        launchError = BROWSER_DISCONNECTED;
        return { skipped: launchError };
      }
      return result;
    },
    async close() {
      if (browser) await browser.close().catch(() => {});
      browser = null;
    },
  };
}

// ---------------------------------------------------------------------------
// Storing one capture
// ---------------------------------------------------------------------------

/**
 * What the previous meta says about a PDF's <slug>.txt: which file is the script's
 * own text (textPath), why there is none (textError), and how many strings in that
 * text were masked (redacted).
 *
 * A failed fetch writes no file — the last capture's .pdf and <slug>.txt stay on
 * disk — so its meta carries this state forward unchanged (storeCapture). Without
 * that, one bad week would forget that the script wrote the text beside the stored
 * PDF: the text would then be taken for a hand extraction, and left beside bytes it
 * does not describe once the PDF changed.
 *
 * Only a PDF capture, or a failed fetch (which carries a PDF capture's state and
 * otherwise has none), has any. Everything else — an HTML capture, a JSON one, the
 * hand-edited metas — gives the empty state, so their error metas keep the shape
 * they always had.
 */
export function previousTextState(previousMeta) {
  const none = { textPath: null, textError: null, redacted: 0 };
  if (!previousMeta) return none;
  const pdfCapture = previousMeta.error == null && isPdf(previousMeta.contentType);
  const failedFetch = previousMeta.error != null;
  if (!pdfCapture && !failedFetch) return none;
  return {
    textPath: previousMeta.textPath ?? null,
    textError: previousMeta.textError ?? null,
    redacted: Number.isInteger(previousMeta.redacted) && previousMeta.redacted > 0 ? previousMeta.redacted : 0,
  };
}

/**
 * Why a PDF was not extracted beside a <slug>.txt no meta claims. Only what the
 * script knows is said: no textPath names the file, and the PDF beside it changed
 * (with the sha256 of the stored copy it sat beside, so that copy can be found in
 * git history). Not "render-watch did not write it" — the script cannot know that —
 * and not "it does not describe these bytes": a PDF that changes back would make
 * that false, and this sentence is carried forward for as long as the bytes stay.
 */
export function unclaimedTextNote(ownTextPath, storedPdf) {
  const where =
    storedPdf === null
      ? "No stored PDF was beside it to compare with, so nothing says it describes these bytes"
      : `The PDF changed beside it (the stored copy was sha256 ${sha256(storedPdf)}), so it may not describe these bytes`;
  return (
    `not extracted: ${ownTextPath} is not claimed by this page's meta (no textPath names it), so render-watch ` +
    "treats it as a hand extraction — other files cite such texts by line number — and leaves it alone. " +
    `${where}: check it against the PDF before citing it. Move or re-extract it deliberately; ` +
    "a run with no such file extracts the text itself."
  );
}

/**
 * Turn one fetch result into files under outDir: the body, its text, its meta —
 * or nothing at all when nothing material changed. Returns the meta, and whether
 * the fetched body itself changed (false for a PDF whose only news is its text).
 *
 * A PDF's text comes from `extractPdfText(<stored .pdf path>)` (runPdftotext unless
 * a test injects one) and is masked with redactSecrets before it is written. It is
 * never hashed: sha256 is the hash of the PDF bytes. When the extractor throws,
 * nothing is thrown on: the meta gets `textError` and no .txt is written.
 *
 * Only a <slug>.txt the meta claims (textPath) is ever replaced or removed; a
 * failed fetch carries that claim forward (previousTextState). Any other
 * <slug>.txt beside a PDF is treated as a hand extraction that other files cite by
 * line number, and is never touched. The script's own text always describes the
 * stored .pdf: it is replaced or removed whenever those bytes are.
 *
 * Whether the fetched bytes are new is judged against the STORED .pdf, not the
 * previous meta — after a failed fetch the meta has no sha256, but the last
 * capture's bytes are still on disk. Then:
 *   - same bytes as the stored .pdf, <slug>.txt on disk: nothing is extracted, and
 *     what the meta said about the text is kept.
 *   - same bytes, no <slug>.txt: extracted. That reads, once, a PDF captured
 *     before this extraction existed, and retries one whose extraction failed.
 *   - new bytes (or no stored .pdf) beside an unclaimed <slug>.txt: nothing is
 *     extracted, and textError says the text is not the script's and may be stale.
 *   - new bytes otherwise: extracted, replacing the script's own text. If that
 *     fails, the script's text of the old bytes is removed.
 *   An unchanged PDF whose text is stored is not extracted again, so a newer
 *   pdftotext on the runner does not churn a text nobody asked to change.
 */
export async function storeCapture(
  entry,
  result,
  { outDir, now = () => new Date().toISOString(), extractPdfText = runPdftotext } = {},
) {
  const previousMeta = readPreviousMeta(outDir, entry.slug);
  let fetchedAt = now();

  let bodyPath = null;
  let textPath = null;
  let textError = null;
  let pdfText = null;
  let hash = null;
  let byteLength = 0;
  let htmlText = null;

  let redacted = 0;
  if (result.bytes) {
    const masked = redactSecrets(result.bytes, result.contentType);
    result.bytes = masked.bytes;
    redacted = masked.count;
    byteLength = result.bytes.length;
    hash = sha256(result.bytes);
    const extension = extensionFor(result.contentType);
    bodyPath = `research/rendered/${entry.slug}.${extension}`;
    if (isHtml(result.contentType)) {
      textPath = `research/rendered/${entry.slug}.txt`;
      // The .txt is masked on its own too, and its count joins the body's: extractText decodes references in passes
      // (`&#x26;#64;` becomes @), so its text can show an address the body's mask never saw. Masking is idempotent,
      // so a page whose body mask found everything adds 0 here.
      const text = redactSecrets(Buffer.from(`${extractText(result.bytes.toString("utf8"))}\n`, "utf8"), "text/plain");
      htmlText = text.bytes;
      redacted += text.count;
    }
  }

  // A js line's result carries how it was rendered; a plain fetch's carries nothing, and its meta stays as it was.
  const renderedWith = result.renderedWith ?? null;
  const networkIdle = renderedWith ? (result.networkIdle ?? null) : null;
  const bytesChanged = bodyChanged(previousMeta, {
    sha256: hash,
    status: result.status,
    error: result.error,
    renderedWith,
  });

  const ownTextPath = `research/rendered/${entry.slug}.txt`;
  // What the previous meta said about a PDF's text, carried through failed fetches.
  const previousText = previousTextState(previousMeta);
  // Does the previous meta claim <slug>.txt as the script's own file? As a text (textPath: a PDF's,
  // carried through a failed fetch, or an HTML page's), or as the body of a text/plain capture
  // (bodyPath). Only a claimed file is ever replaced or removed.
  const ownsTextFile = previousMeta?.textPath === ownTextPath || previousMeta?.bodyPath === ownTextPath;
  // ...and is it the text of a PDF, i.e. of the stored .pdf? Not so for an HTML page's text.
  const ownsPdfText = previousText.textPath === ownTextPath;
  let removeOwnText = false;

  if (!result.bytes) {
    // A failed fetch writes no file, so the last capture's .pdf and .txt are still on disk
    // and what the meta said about them is still true. Empty for anything but a PDF.
    ({ textPath, textError, redacted } = previousText);
  }

  if (result.bytes && isPdf(result.contentType)) {
    const pdfFile = join(outDir, basename(bodyPath));
    const textFile = join(outDir, basename(ownTextPath));
    const storedPdf = existsSync(pdfFile) ? readFileSync(pdfFile) : null;
    const sameAsStored = storedPdf !== null && storedPdf.equals(result.bytes);
    const textOnDisk = existsSync(textFile);
    // Same bytes as the previous meta: `fetchedAt` stays the time those bytes were captured.
    if (!bytesChanged) fetchedAt = previousMeta.fetchedAt ?? fetchedAt;

    if (sameAsStored && textOnDisk && (ownsPdfText || !ownsTextFile)) {
      // A text of exactly these bytes (the script's, or a hand extraction): keep what was said about it.
      textPath = previousText.textPath;
      textError = previousText.textError;
      redacted = previousText.redacted;
    } else if (textOnDisk && !ownsTextFile) {
      // New bytes beside a text no meta claims: leave it, and say it may be stale.
      textError = unclaimedTextNote(ownTextPath, storedPdf);
    } else {
      // pdftotext reads a file, so the PDF is stored first. Bytes already on disk are left untouched.
      if (!sameAsStored) writeFileSync(pdfFile, result.bytes);
      try {
        const text = await extractPdfText(pdfFile);
        const masked = redactSecrets(Buffer.from(String(text), "utf8"), "text/plain");
        pdfText = masked.bytes;
        redacted += masked.count;
        textPath = ownTextPath;
      } catch (error) {
        textError = describePdfTextError(error);
        // Our text of the previous bytes must not sit beside bytes it does not describe.
        removeOwnText = ownsTextFile;
      }
    }
  }

  const meta = buildMeta({
    url: entry.url,
    slug: entry.slug,
    fetchedAt,
    status: result.status,
    contentType: result.contentType,
    byteLength,
    sha256: hash,
    previousMeta,
    truncated: result.truncated,
    error: result.error,
    bodyPath,
    textPath,
    textError,
    redacted,
    renderedWith,
    networkIdle,
    robots: result.robots ?? null,
    robotsUrl: result.robotsUrl ?? null,
  });
  // An extraction always has a text to write, even when nothing in the meta moved: the meta
  // claimed a <slug>.txt that had been deleted, or the stored .pdf had been replaced by hand.
  if (pdfText !== null) meta.changed = true;

  if (!meta.changed) return { meta, bytesChanged };

  if (result.bytes) {
    writeFileSync(join(outDir, basename(bodyPath)), result.bytes);
    if (pdfText !== null) {
      writeFileSync(join(outDir, basename(textPath)), pdfText);
    } else if (htmlText !== null) {
      writeFileSync(join(outDir, basename(textPath)), htmlText);
    } else if (removeOwnText) {
      rmSync(join(outDir, basename(ownTextPath)), { force: true });
    }
  }
  writeFileSync(metaPathFor(outDir, entry.slug), `${JSON.stringify(meta, null, 2)}\n`);
  return { meta, bytesChanged };
}

// ---------------------------------------------------------------------------
// main
// ---------------------------------------------------------------------------

function parseArgs(argv) {
  const options = { list: DEFAULT_LIST, outDir: DEFAULT_OUT_DIR, needsBrowser: false };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--needs-browser") options.needsBrowser = true;
    else if (arg === "--list") options.list = resolve(argv[++i]);
    else if (arg === "--out") options.outDir = resolve(argv[++i]);
    else if (arg.startsWith("--list=")) options.list = resolve(arg.slice("--list=".length));
    else if (arg.startsWith("--out=")) options.outDir = resolve(arg.slice("--out=".length));
    else throw new Error(`Unknown argument: ${arg}`);
  }
  return options;
}

function sleep(ms) {
  return new Promise((done) => setTimeout(done, ms));
}

/**
 * Where the list comes from. RENDER_WATCH_URLS, set by the workflow from the
 * optional `urls` dispatch input, overrides the file for one run; it uses exactly
 * the same syntax, so comments and slugs work there too.
 */
export function resolveListText(env, readFile = readFileSync, listPath = DEFAULT_LIST) {
  const override = String(env?.RENDER_WATCH_URLS ?? "").trim();
  if (override) return { text: override, source: "RENDER_WATCH_URLS (workflow_dispatch input)" };
  return { text: readFile(listPath, "utf8"), source: listPath };
}

/**
 * Fetch (or, for a js line, render) one entry, store it, and log it. Returns what it
 * adds to the run's counts. A js line whose browser is unavailable (never started, or
 * stopped before or during the line) is skipped: a host failure, not the site's answer,
 * so nothing is written and the last capture stays exactly as it was.
 *
 * robots.txt comes first in every mode (`robots`, the run's robotsChecker): a plain line
 * is checked inside fetchOne, hop by hop; a js line's URL is checked with a plain GET of
 * robots.txt before the browser is asked for it (or even launched); a robots-only probe
 * line is that host's robots.txt itself, from the same one fetch per host.
 */
async function captureEntry(entry, { js, robots, fetchImpl, outDir, deps, summaryLines }) {
  let result;
  if (entry.robotsProbe) {
    result = await robots.probe(entry.url);
  } else if (entry.js) {
    const decision = await robots.decide(entry.url);
    if (!decision.allowed) {
      result = {
        status: null,
        contentType: null,
        bytes: null,
        truncated: false,
        error: robotsRefusalError(decision),
        renderedWith: RENDERED_WITH,
        networkIdle: null,
      };
    } else {
      result = await js.render(entry);
      if (result.skipped) {
        process.stdout.write(`SKIPPED     ${entry.slug}  js mode: ${result.skipped}\n            ${entry.url}\n`);
        summaryLines.push(`- \`${entry.slug}\` — SKIPPED (js mode): ${result.skipped}`);
        return { changed: 0, failed: 0, skippedJs: 1 };
      }
    }
    // renderWithBrowser says which robots.txt governed the page it stored or the hop it refused; a refusal of the
    // listed URL, above, says the listed URL's.
    if (result.robots === undefined) result = { ...result, robots: decision.robots, robotsUrl: decision.robotsUrl };
  } else {
    result = await fetchOne(entry, { fetchImpl, robots });
  }

  const { meta, bytesChanged } = await storeCapture(entry, result, {
    outDir,
    extractPdfText: deps.extractPdfText,
  });
  const hash = meta.sha256;
  const byteLength = meta.byteLength;
  // A PDF with no readable text is still a stored capture: said in the log, never thrown. So is a js page that lost
  // requests robots.txt refused before they were sent (a script, an image): the log names how many.
  const heldBack = Array.isArray(result.robotsBlocked) ? result.robotsBlocked.length : 0;
  const textNote =
    (meta.textError ? `            no PDF text: ${meta.textError}\n` : "") +
    (heldBack > 0 ? `            robots.txt held back ${heldBack} request(s) the page made; they were not sent\n` : "");
  const failed = result.error ? 1 : 0;

  if (!meta.changed) {
    process.stdout.write(`unchanged   ${entry.slug}  sha256=${hash ? hash.slice(0, 12) : "-"}  ${entry.url}\n${textNote}`);
    return { changed: 0, failed, skippedJs: 0 };
  }

  const state = result.error
    ? `FAILED      ${entry.slug}  ${result.error}`
    : !bytesChanged
      ? `text        ${entry.slug}  PDF bytes unchanged (sha256=${hash.slice(0, 12)}); ` +
        `${meta.textPath ? `text stored at ${meta.textPath}` : "text extraction failed"}`
      : `${meta.firstFetch ? "new        " : "CHANGED    "} ${entry.slug}  ${byteLength} bytes  ` +
        `${result.contentType ?? "unknown type"}${result.truncated ? "  [TRUNCATED at 5 MB]" : ""}` +
        `${meta.renderedWith ? `  [${meta.renderedWith}${meta.networkIdle ? "" : ", network not idle"}]` : ""}`;
  process.stdout.write(`${state}\n            ${entry.url}\n${textNote}`);
  summaryLines.push(
    `- \`${entry.slug}\` — ${result.error ?? `${byteLength} bytes, ${result.contentType}`}` +
      `${meta.renderedWith ? ` (rendered with ${meta.renderedWith})` : ""}` +
      `${bytesChanged ? "" : " (bytes unchanged; text extraction only)"}` +
      `${meta.textError ? `; no PDF text: ${meta.textError}` : ""}`,
  );
  return { changed: 1, failed, skippedJs: 0 };
}

/**
 * `deps` exists for the tests; the workflow runs main() with none, which means
 * runPdftotext, launchChromium and the DELAY_MS courtesy pause.
 *
 * `--needs-browser` parses the list (the file, or the dispatch override) and prints
 * `js=true` or `js=false` for $GITHUB_OUTPUT, writing nothing: the workflow asks it
 * before installing a browser, so a list with no js line never installs one.
 */
export async function main(argv = process.argv.slice(2), env = process.env, deps = {}) {
  const options = parseArgs(argv);
  const { text, source } = resolveListText(env, readFileSync, options.list);
  const entries = parseUrlList(text);

  if (options.needsBrowser) {
    process.stdout.write(`js=${entries.some((entry) => entry.js === true)}\n`);
    return 0;
  }

  process.stdout.write(`render-watch: ${entries.length} URL(s) from ${source}\n`);
  if (entries.length === 0) {
    process.stdout.write("Nothing to fetch.\n");
    return 0;
  }

  mkdirSync(options.outDir, { recursive: true });

  let changedCount = 0;
  let failedCount = 0;
  let skippedJs = 0;
  const summaryLines = [];
  const delayMs = deps.delayMs ?? DELAY_MS;
  // One fetch for the whole run: robots.txt and pages alike go through it, so a stub in deps stubs both.
  const fetchImpl = deps.fetchImpl ?? globalThis.fetch;
  // One robots.txt fetch per host for the whole run, shared by every mode (ruling 30.9 16(d) D2(v)).
  const robots = robotsChecker({ fetchImpl });
  // Launched on the first js line, if there is one; a plain list never loads playwright-core.
  const js = jsRenderer({ launchBrowser: deps.launchBrowser ?? launchChromium, robots });

  try {
    for (const [index, entry] of entries.entries()) {
      if (index > 0) await sleep(delayMs);
      const counts = await captureEntry(entry, { js, robots, fetchImpl, outDir: options.outDir, deps, summaryLines });
      changedCount += counts.changed;
      failedCount += counts.failed;
      skippedJs += counts.skippedJs;
    }
  } finally {
    await js.close();
  }

  // Said only when it happened, so a plain run's log reads exactly as it always did. The cause (not
  // installed, not started, or stopped mid-run) is on each SKIPPED line above; this names none of them.
  const skippedNote =
    skippedJs > 0 ? ` ${skippedJs} js line(s) skipped: the browser was unavailable (the SKIPPED lines say why).` : "";
  process.stdout.write(
    `\nrender-watch: ${entries.length} URL(s), ${changedCount} changed, ${failedCount} could not be fetched.${skippedNote}\n`,
  );

  // The workflow fails the run on this, after its commit step, so the plain captures still land.
  if (env.GITHUB_OUTPUT) {
    try {
      appendFileSync(env.GITHUB_OUTPUT, `js_skipped=${skippedJs}\n`);
    } catch {
      /* the log line above still says it */
    }
  }

  if (env.GITHUB_STEP_SUMMARY) {
    const body = [
      "### render-watch",
      "",
      `${entries.length} URL(s) from ${source}; ${changedCount} changed, ${failedCount} could not be fetched.${skippedNote}`,
      "",
      ...summaryLines,
      "",
      "Stored bytes are not a read page. A claim becomes [RENDERED] only when a session reads the text " +
        "and writes the finding into the research file it settles.",
      "",
    ].join("\n");
    try {
      writeFileSync(env.GITHUB_STEP_SUMMARY, body, { flag: "a" });
    } catch {
      /* a summary we cannot write is not a reason to fail a fetch */
    }
  }

  // A page that refused us is data, not a broken build. Only a broken script fails.
  return 0;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().then(
    (code) => process.exit(code ?? 0),
    (error) => {
      console.error(error?.stack ?? String(error));
      process.exit(1);
    },
  );
}
