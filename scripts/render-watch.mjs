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
 *   - every URL in research/rendered/urls.txt is fetched with a browser-like
 *     User-Agent and a 30 s timeout
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
 *   - secret-shaped strings (vendor docs print sample keys) are masked before the
 *     body is hashed or stored, and the meta file counts them as `redacted`. A PDF
 *     body is binary and stored as fetched; its extracted text is masked instead,
 *     and those are what `redacted` counts for a PDF
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
 * Stated limits: a TikTok server addressed by a bare IP address is not recognised by
 * any of these, and behind such a proxy a subresource redirected to TikTok would still
 * be requested (the runner has no proxy). logs/CHANNEL_LOOP.md §9 paused every TikTok fetch on 28.9, and whether
 * any fetch of TikTok is allowed at all is pending logs/FABLE_QUEUE.md row 16(d).
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
 * A normal browser User-Agent. Not a disguise: several of the pages on the list
 * return 403 to a default Node user-agent string and render fine to a browser,
 * and a 403 that is an artefact of our own headers would be recorded here as if
 * it were the site's answer. Nothing else is done to get past a block — no proxy,
 * no retry storm, no cookie games. A site that says no is recorded as saying no.
 */
export const USER_AGENT =
  "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36";

/** Sent by both modes, so a js line asks for the same languages a plain GET does. */
export const ACCEPT_LANGUAGE = "en-US,en;q=0.9,he;q=0.8";

// ---------------------------------------------------------------------------
// The URL list
// ---------------------------------------------------------------------------

const SLUG_RE = /^[a-z0-9][a-z0-9._-]*$/;

/** The flags a urls.txt line may carry after its slug. One, today: `js` (header comment). */
const FLAGS = new Set(["js"]);

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
 *
 * Throws on an authoring mistake — a non-http(s) line, a URL that does not parse,
 * an unusable slug, an unknown flag, two lines claiming the same slug (which would
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
    // and whether any fetch of TikTok is allowed at all is pending logs/FABLE_QUEUE.md row 16(d).
    // Refused here, at parse time, so neither urls.txt nor a dispatch override can reach it.
    if (isTikTokHost(hostname)) {
      throw new Error(
        `urls.txt line ${lineNumber}: ${url} is on tiktok.com, which render-watch never fetches in either mode ` +
          "(the TikTok pause, logs/CHANNEL_LOOP.md §9; pending logs/FABLE_QUEUE.md row 16(d)).",
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
    if (seen.has(slug)) {
      throw new Error(
        `urls.txt line ${lineNumber}: slug "${slug}" is already used on line ${seen.get(slug)}. ` +
          `Two URLs sharing a slug would overwrite each other's stored page.`,
      );
    }
    seen.set(slug, lineNumber);
    entries.push(flag === "js" ? { url, slug, lineNumber, js: true } : { url, slug, lineNumber });
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
 * waits on logs/FABLE_QUEUE.md row 16(d). The Gumroad API is not a web page and is not
 * fetched by this script.
 */
export const TERMS_BARRED = [
  {
    domain: "gumroad.com",
    why:
      "Gumroad's terms bar automated software that scrapes or downloads data from any web page of the Services " +
      "(research/rendered/gumroad-terms.txt:326, :343; paused in tick 19, logs/CHANNEL_LOOP.md §9; pending logs/FABLE_QUEUE.md row 16(d))",
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
  { domain: "google.com", why: "Google's terms allow automated access only while respecting robots.txt, which render-watch does not read, and YouTube's terms bar the YouTube Help pages outright (research/colony-sweep/scouts/risk-governance--automation-tos.md:106; research/faceless-youtube/scouts/discovery.md:209-211; terms audit 29.9)" },
  { domain: "googlesource.com", why: "Google's terms allow automated access only while respecting robots.txt, which render-watch does not read (research/colony-sweep/scouts/risk-governance--automation-tos.md:106; terms audit 29.9)" },
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
 * Secret-shaped strings that GitHub push protection refuses. Vendor docs print
 * sample keys in exactly these shapes: on 27.9.2026 Stripe's cross-border payouts
 * page carried one, push protection rejected the capture commit, and the whole
 * run's pages were lost. A capture is for citing prose, never for reusing a key,
 * so the key is masked before anything is hashed or written.
 */
export const SECRET_PATTERNS = [
  { kind: "stripe-secret-key", re: /\b(?:sk|rk)_(?:test|live)_[0-9A-Za-z]{10,}\b/g },
  { kind: "stripe-webhook-secret", re: /\bwhsec_[0-9A-Za-z]{20,}\b/g },
  { kind: "github-token", re: /\b(?:gh[pousr]_[0-9A-Za-z]{36,}|github_pat_[0-9A-Za-z_]{40,})\b/g },
  { kind: "aws-access-key-id", re: /\b(?:AKIA|ASIA)[0-9A-Z]{16}\b/g },
  { kind: "slack-token", re: /\bxox[abprs]-[0-9A-Za-z-]{10,}\b/g },
  { kind: "private-key", re: /-----BEGIN (?:[A-Z]+ )?PRIVATE KEY-----[\s\S]*?-----END (?:[A-Z]+ )?PRIVATE KEY-----/g },
];

function isTextLike(contentType) {
  const ct = String(contentType ?? "").toLowerCase();
  return isHtml(ct) || ct.startsWith("text/") || ct.includes("json") || ct.includes("xml") || ct.includes("javascript");
}

/**
 * Mask secret-shaped strings in a text body. A body with none comes back as the
 * same bytes, so its hash (and the quiet git history) does not change; binary
 * bodies are never rewritten. Returns the bytes to store and how many were masked.
 */
export function redactSecrets(bytes, contentType) {
  if (!bytes || !isTextLike(contentType)) return { bytes, count: 0 };
  const original = bytes.toString("utf8");
  let text = original;
  let count = 0;
  for (const { kind, re } of SECRET_PATTERNS) {
    text = text.replace(re, () => {
      count += 1;
      return `[redacted:${kind}]`;
    });
  }
  return count === 0 ? { bytes, count: 0 } : { bytes: Buffer.from(text, "utf8"), count };
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
    "(logs/CHANNEL_LOOP.md §9; pending logs/FABLE_QUEUE.md row 16(d))"
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
 */
export async function fetchOne(entry, { fetchImpl = fetch, timeoutMs = TIMEOUT_MS, maxBytes = MAX_BYTES } = {}) {
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

      const refused = (error) => ({
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
      url = next.href;
    }

    const contentType = response.headers?.get?.("content-type") ?? null;
    if (!response.ok) {
      return {
        status: response.status,
        contentType,
        bytes: null,
        truncated: false,
        error: `HTTP ${response.status}${response.statusText ? ` ${response.statusText}` : ""}`,
      };
    }

    const { bytes, truncated } = await readCappedBody(response, maxBytes);
    return { status: response.status, contentType, bytes, truncated, error: null };
  } catch (error) {
    const message = error instanceof Error ? `${error.name}: ${error.message}` : String(error);
    return {
      status: null,
      contentType: null,
      bytes: null,
      truncated: false,
      error: controller.signal.aborted ? `timeout after ${timeoutMs}ms (${message})` : message,
    };
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
 */
export async function renderWithBrowser(
  entry,
  { browser, timeoutMs = TIMEOUT_MS, maxBytes = MAX_BYTES, now = Date.now } = {},
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
  try {
    context = await browser.newContext(browserContextOptions());
    // No request to tiktok.com from inside a page either — an embed, a script, a frame, and (route() does
    // not see these) a WebSocket, which is closed before it reaches the server. A second layer: route() is
    // called only for the first URL of a redirect chain, so the resolver rule in chromiumLaunchOptions is
    // what stops a redirect. The TikTok pause (logs/CHANNEL_LOOP.md §9) and logs/FABLE_QUEUE.md row 16(d).
    const onTikTok = (url) => isTikTokHost(url.hostname);
    await context.route(onTikTok, (route) => route.abort("blockedbyclient"));
    await context.routeWebSocket(onTikTok, (ws) => ws.close({ code: 1008, reason: "render-watch never contacts tiktok.com" }));
    const page = await context.newPage();
    // Every hop of a main-frame navigation is a request here, redirect targets included.
    page.on("request", (request) => {
      if (tiktokNavigation !== null || !request.isNavigationRequest()) return;
      let mainFrame = false;
      try {
        mainFrame = request.frame() === page.mainFrame();
      } catch {
        return; // a service worker's request has no frame (and service workers are blocked)
      }
      const host = hostOf(request.url());
      if (mainFrame && host !== null && isTikTokHost(host)) tiktokNavigation = host;
    });
    const refusedTikTok = () => failed({ error: tiktokRedirectError(tiktokNavigation) });

    const response = await page.goto(entry.url, { waitUntil: "domcontentloaded", timeout: timeoutMs });
    if (tiktokNavigation === null && response) tiktokNavigation = tiktokHostInChain(response);
    if (tiktokNavigation !== null) return refusedTikTok();
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
    // The page's own script may have moved it to tiktok.com while the network settled.
    if (tiktokNavigation !== null) return refusedTikTok();

    const all = Buffer.from(html, "utf8");
    const truncated = all.length > maxBytes;
    return {
      status,
      contentType,
      bytes: truncated ? all.subarray(0, maxBytes) : all,
      truncated,
      error: null,
      renderedWith: RENDERED_WITH,
      networkIdle,
    };
  } catch (error) {
    // A navigation to tiktok.com fails to resolve (the resolver rule); say why, not "name not resolved".
    if (tiktokNavigation !== null) return failed({ error: tiktokRedirectError(tiktokNavigation) });
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
 * Exactly what Chromium is launched with, pinned by a test: headless, and one
 * argument, the tiktok.com resolver rule. Nothing else — no flag that weakens the
 * browser (web security, site isolation) and nothing that hides automation.
 */
export function chromiumLaunchOptions() {
  return { headless: true, args: [`--host-resolver-rules=${TIKTOK_HOST_RESOLVER_RULES}`] };
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
 */
export function jsRenderer({ launchBrowser = launchChromium, timeoutMs = TIMEOUT_MS, maxBytes = MAX_BYTES } = {}) {
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
      const result = await renderWithBrowser(entry, { browser, timeoutMs, maxBytes });
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

  let redacted = 0;
  if (result.bytes) {
    const masked = redactSecrets(result.bytes, result.contentType);
    result.bytes = masked.bytes;
    redacted = masked.count;
    byteLength = result.bytes.length;
    hash = sha256(result.bytes);
    const extension = extensionFor(result.contentType);
    bodyPath = `research/rendered/${entry.slug}.${extension}`;
    if (isHtml(result.contentType)) textPath = `research/rendered/${entry.slug}.txt`;
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
  });
  // An extraction always has a text to write, even when nothing in the meta moved: the meta
  // claimed a <slug>.txt that had been deleted, or the stored .pdf had been replaced by hand.
  if (pdfText !== null) meta.changed = true;

  if (!meta.changed) return { meta, bytesChanged };

  if (result.bytes) {
    writeFileSync(join(outDir, basename(bodyPath)), result.bytes);
    if (pdfText !== null) {
      writeFileSync(join(outDir, basename(textPath)), pdfText);
    } else if (textPath && isHtml(result.contentType)) {
      writeFileSync(join(outDir, basename(textPath)), `${extractText(result.bytes.toString("utf8"))}\n`);
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
 */
async function captureEntry(entry, { js, outDir, deps, summaryLines }) {
  let result;
  if (entry.js) {
    result = await js.render(entry);
    if (result.skipped) {
      process.stdout.write(`SKIPPED     ${entry.slug}  js mode: ${result.skipped}\n            ${entry.url}\n`);
      summaryLines.push(`- \`${entry.slug}\` — SKIPPED (js mode): ${result.skipped}`);
      return { changed: 0, failed: 0, skippedJs: 1 };
    }
  } else {
    result = await fetchOne(entry);
  }

  const { meta, bytesChanged } = await storeCapture(entry, result, {
    outDir,
    extractPdfText: deps.extractPdfText,
  });
  const hash = meta.sha256;
  const byteLength = meta.byteLength;
  // A PDF with no readable text is still a stored capture: said in the log, never thrown.
  const textNote = meta.textError ? `            no PDF text: ${meta.textError}\n` : "";
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
  // Launched on the first js line, if there is one; a plain list never loads playwright-core.
  const js = jsRenderer({ launchBrowser: deps.launchBrowser ?? launchChromium });

  try {
    for (const [index, entry] of entries.entries()) {
      if (index > 0) await sleep(delayMs);
      const counts = await captureEntry(entry, { js, outDir: options.outDir, deps, summaryLines });
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
