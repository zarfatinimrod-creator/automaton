#!/usr/bin/env node
/**
 * Queue one ₪0 test: add a numbered row to research/channel-loop/ZERO-TESTS.md and
 * the matching line (with its citing comment) to research/rendered/urls.txt, in
 * one step. Every tick did this by hand with a throwaway Python snippet; tick 6
 * got a row's column count wrong that way. This keeps the two files in step.
 *
 *   node scripts/queue-zero-test.mjs \
 *     --candidate "Wix App Market (11), after rows 57-58" \
 *     --url https://dev.wix.com/docs/... \
 *     --slug wix-security-privacy-info \
 *     --settle "whether the submission step asks for the third-party test" \
 *     --note "Wix App Market (11): the submission step, linked from a tick-6 capture" \
 *     [--js --terms <slug>] [--date 28.9.2026] [--dry-run]
 *
 * The row number is one past the highest numbered row. The row goes directly
 * after that row. The four-column shape is enforced (a `|` inside a cell is
 * escaped). The URL list is re-parsed with render-watch's own parser, so a
 * duplicate slug or a malformed URL fails here, before anything is written. A URL
 * already in the list (active or commented out) is refused, and so is any tiktok.com
 * URL (render-watch's parser refuses it; logs/CHANNEL_LOOP.md §9).
 *
 * --js queues the line for render-watch's JavaScript-capable render (the `js` flag;
 * research/rendered/README.md). The loop board allowed it on one condition: "the
 * target's terms must already be rendered and must not bar automated access, exactly
 * as for a plain GET" (research/channel-loop/RULING-2026-09-29-loop.md (b)). So --js
 * REQUIRES --terms <slug>, naming a render-watch capture of the target site's terms,
 * and that slug goes into the line's comment. What the script checks (checkTermsCapture):
 * the capture is a real one — research/rendered/<slug>.meta.json says it was fetched
 * without error with a 2xx status, and research/rendered/<slug>.txt holds at least
 * MIN_TERMS_TEXT characters, so an empty JavaScript shell does not count; it is not
 * the target page itself, nor urls.txt; and it was captured from the target's own
 * site (siteOf), or from a site TERMS_ELSEWHERE records for it. What it cannot check,
 * and the person queueing the line does: that the capture IS the terms, and that they
 * do not bar automated access. A Salesforce help-centre page, refused below as a shell
 * for a plain line, is allowed with --js: rendering such a shell is what the mode is for.
 *
 * Only this script checks. A js line written into urls.txt by hand, or typed into the
 * workflow's dispatch box, is checked by no code: the reviewed commit is the gate there.
 *
 *   node scripts/queue-zero-test.mjs --override 174-179
 *
 * prints, and writes nothing, the lines for render-watch's `urls` dispatch input that
 * render exactly ZERO-TESTS rows 174-179: each row's urls.txt line, found under its
 * "# research/channel-loop/ZERO-TESTS.md row N —" comment, js flag kept. Ticks 16-18
 * copied these by hand (logs/2026-09-29-channel-loop-tick-17.md §7). A retired row
 * (its URL line commented out) is skipped and named on stderr; a row with no line is
 * an error; the output is re-parsed with render-watch's own parser.
 *
 * The terms gate (research/channel-loop/terms-verdicts.json; RULING of the tick-21 audit). A line may
 * be queued, and stay active, only when its site's terms were read and allow a runner (NOT_BARRED or
 * CONDITIONAL_MET), or when it is a TERMS_PENDING site's own terms page (slug `terms-...`). queueZeroTest
 * refuses anything else and says what to do. `--apply-verdicts` comments out every active line that fails
 * the gate, the step ticks 21-23 ran by hand (logs/2026-09-29-channel-loop-tick-22.md §7).
 *
 * Since 30.9 (research/channel-loop/RULING-2026-09-30-video.md 16(d) D2(iv)-(v)): NO_TERMS_ROBOTS_OK passes like
 * NOT_BARRED, but only as scripts/robots-verdict.mjs writes it — a note opening "exhaustive-negative" and a source naming
 * that script (isRobotsOkVerdict); one set by hand fails. A robots-only probe — a robots-... slug whose URL path is
 * exactly /robots.txt — passes for an exhaustive-negative NO_TERMS site only: D2(v) allows that read so the script can
 * judge the site, and D2(iv) allows no fetch at all of a site whose terms are unread (TERMS_PENDING: its terms page
 * only). Nothing else about the gate changed.
 */
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { parseArgs } from "node:util";
import { fileURLToPath } from "node:url";
import { parseUrlList, termsBarred } from "./render-watch.mjs";

const REPO_ROOT = join(fileURLToPath(new URL(".", import.meta.url)), "..");
export const ZERO_TESTS = join(REPO_ROOT, "research", "channel-loop", "ZERO-TESTS.md");
export const URLS = join(REPO_ROOT, "research", "rendered", "urls.txt");
export const RENDERED = join(REPO_ROOT, "research", "rendered");
export const VERDICTS = join(REPO_ROOT, "research", "channel-loop", "terms-verdicts.json");

/** The committed per-site terms verdicts: { site: { verdict, source, ... } }. */
export function loadVerdicts(path = VERDICTS) {
  return JSON.parse(readFileSync(path, "utf8")).sites;
}

/**
 * The verdicts under which any line of a site may be active. NO_TERMS_ROBOTS_OK (ruling 30.9 16(d) D2(v)) counts only
 * when isRobotsOkVerdict says scripts/robots-verdict.mjs set it; termsGate checks that.
 */
export const ACTIVE_VERDICTS = new Set(["NOT_BARRED", "CONDITIONAL_MET", "NO_TERMS_ROBOTS_OK"]);

/**
 * A NO_TERMS_ROBOTS_OK entry as scripts/robots-verdict.mjs writes it: the note it keeps opens "exhaustive-negative",
 * and its source names the script. The ruling allows the verdict "only for exhaustive-negative sites by a script that
 * reads the site's robots.txt for the queued paths" (16(d) D2(v)); a hand-set one — on a refusal-type site, say — is
 * not that, and the gate refuses it.
 */
export function isRobotsOkVerdict(entry) {
  return (
    entry?.verdict === "NO_TERMS_ROBOTS_OK" &&
    /^exhaustive-negative\b/.test(String(entry?.note ?? "")) &&
    String(entry?.source ?? "").includes("scripts/robots-verdict.mjs")
  );
}

/**
 * A NO_TERMS entry whose note opens "exhaustive-negative": a recorded search found no terms anywhere (nevo),
 * as against "refusal-type", where the terms page refused the runner (RULING-2026-09-30-video.md 16(d) D2(iv)).
 */
export function isExhaustiveNegative(entry) {
  return entry?.verdict === "NO_TERMS" && /^exhaustive-negative\b/.test(String(entry?.note ?? ""));
}

/**
 * A robots-only probe: a slug starting robots- on a URL whose path is exactly /robots.txt, with no query
 * (render-watch fetches that file and nothing else from the host; research/rendered/README.md).
 */
export function isRobotsProbe(url, slug) {
  let parsed;
  try {
    parsed = new URL(url);
  } catch {
    return false;
  }
  return String(slug).startsWith("robots-") && parsed.pathname === "/robots.txt" && parsed.search === "" && parsed.hash === "";
}

/**
 * Whether a line for this URL and slug passes the terms gate, and if not, why. Barred hosts (TERMS_BARRED in
 * render-watch) always fail; otherwise the site's verdict decides. Never throws.
 *
 * Since 30.9 (ruling 16(d) D2(iv)-(v)): NO_TERMS_ROBOTS_OK is active-eligible like NOT_BARRED when
 * scripts/robots-verdict.mjs set it (isRobotsOkVerdict), and a robots- probe of /robots.txt passes for an
 * exhaustive-negative NO_TERMS site — the one thing that may be fetched from such a site until its robots.txt is read
 * and recorded. Not for a TERMS_PENDING site: its terms are unread, and unread terms mean no fetch but the terms page.
 */
export function termsGate(url, slug, verdicts) {
  let host;
  try {
    host = new URL(url).hostname.toLowerCase();
  } catch {
    return { ok: false, why: `not a URL: ${url}` };
  }
  const barred = termsBarred(host);
  if (barred) return { ok: false, site: barred.domain, verdict: "BARRED", why: `${barred.domain} is in TERMS_BARRED: ${barred.why}` };
  const site = siteOf(host);
  const entry = verdicts?.[site] ?? null;
  const verdict = entry?.verdict ?? null;
  if (verdict === "NO_TERMS_ROBOTS_OK" ? isRobotsOkVerdict(entry) : ACTIVE_VERDICTS.has(verdict)) return { ok: true, site, verdict };
  if (verdict === "TERMS_PENDING" && String(slug).startsWith("terms-")) return { ok: true, site, verdict };
  if (isRobotsProbe(url, slug) && isExhaustiveNegative(entry)) return { ok: true, site, verdict };
  const why =
    verdict === null
      ? `${site} has no verdict in research/channel-loop/terms-verdicts.json: read its terms first (queue its terms page as a terms-... slug after adding a TERMS_PENDING verdict with the terms URL)`
      : verdict === "TERMS_PENDING"
        ? `${site} is TERMS_PENDING: only its terms page (a terms-... slug) may be queued until its terms are read (ruling 30.9 16(d) D2(iv))`
        : verdict === "NO_TERMS_ROBOTS_OK"
          ? `${site} is NO_TERMS_ROBOTS_OK, but not as scripts/robots-verdict.mjs writes it (a note opening exhaustive-negative and a source naming the script): only that script sets the verdict (ruling 30.9 16(d) D2(v))`
          : isExhaustiveNegative(entry)
            ? `${site} is NO_TERMS, exhaustive-negative: only a robots- probe of /robots.txt may be queued until scripts/robots-verdict.mjs sets NO_TERMS_ROBOTS_OK (ruling 30.9 16(d) D2(v))`
            : `${site} is ${verdict} in research/channel-loop/terms-verdicts.json`;
  return { ok: false, site, verdict, why };
}

/**
 * Comment out every active urls.txt line that fails the terms gate. Returns the new text and counts; the caller
 * writes it. A barred host's line says so; any other failing line names its site and verdict.
 */
export function applyVerdicts(urls, verdicts) {
  const lines = urls.split("\n");
  const paused = [];
  for (let i = 0; i < lines.length; i += 1) {
    const t = lines[i].trim();
    if (t === "" || t.startsWith("#")) continue;
    const [url, slug] = t.split(/\s+/);
    const gate = termsGate(url, slug ?? "", verdicts);
    if (gate.ok) continue;
    const head =
      gate.verdict === "BARRED" && termsBarred(new URL(url).hostname)
        ? `# paused (terms audit): ${gate.site} — see TERMS_BARRED in scripts/render-watch.mjs — `
        : `# paused (terms unread): ${gate.site} is ${gate.verdict} in research/channel-loop/terms-verdicts.json — `;
    lines[i] = head + lines[i];
    paused.push(slug ?? url);
  }
  return { urls: lines.join("\n"), paused };
}

/**
 * A terms capture: at least this many characters of text. Real terms run to thousands
 * (GameDistribution's developer terms, 35,889 bytes of text; Algora's, 20,262); the
 * JavaScript shells tick 15 captured came back with 70 (Trolley's help centre) and 96
 * (n8n's Notion hub).
 */
export const MIN_TERMS_TEXT = 1000;

/**
 * Sites that keep their terms on another site: the target's site (siteOf) -> the sites
 * whose terms capture counts for it. Empty until a capture shows one; an entry names
 * the file that shows it. (n8n's Creator Hub, for one, is on n8n.notion.site: whose
 * terms govern it — n8n's, Notion's, or both — is a decision to write down here, not
 * one this script makes.)
 */
export const TERMS_ELSEWHERE = {};

/**
 * Hosts where every subdomain is a different owner's site (a hand-kept part of the
 * Public Suffix List's private section): on these the site is one label deeper, so a
 * capture of another tenant's terms does not count for the target.
 */
const SHARED_HOSTS = new Set([
  "notion.site",
  "github.io",
  "gitbook.io",
  "readthedocs.io",
  "vercel.app",
  "netlify.app",
  "pages.dev",
  "herokuapp.com",
  "blogspot.com",
  "wordpress.com",
  "substack.com",
  "my.site.com",
  "force.com",
]);

/** Second-level labels under a two-letter country code: example.co.il is a site, co.il is not. */
const COUNTRY_SECOND_LEVEL = new Set(["co", "com", "org", "net", "ac", "gov", "edu", "ltd", "plc", "muni", "idf", "k12"]);

/**
 * The site a host belongs to — its registrable domain, approximately, without a Public
 * Suffix List: the last two labels (support.trolley.com -> trolley.com), the last
 * three under a country code's second level (example.co.il; each gov.il host is its
 * own site), and one label deeper than a SHARED_HOSTS suffix
 * (n8n.notion.site). A shared host missing from that list is read as one site, which
 * is the permissive direction — a stated limit.
 */
export function siteOf(hostname) {
  const labels = String(hostname ?? "")
    .toLowerCase()
    .replace(/\.+$/, "")
    .split(".");
  for (const shared of SHARED_HOSTS) {
    const depth = shared.split(".").length;
    if (labels.length > depth && labels.slice(-depth).join(".") === shared) return labels.slice(-depth - 1).join(".");
  }
  const last = labels.at(-1) ?? "";
  const second = labels.at(-2) ?? "";
  const keep = labels.length >= 3 && last.length === 2 && COUNTRY_SECOND_LEVEL.has(second) ? 3 : 2;
  return labels.slice(-keep).join(".");
}

/**
 * Read a capture's meta and text from research/rendered/, or null when either is
 * missing or the meta does not parse. The default for queueZeroTest's termsCapture.
 */
export function readTermsCapture(slug) {
  const metaPath = join(RENDERED, `${slug}.meta.json`);
  const textPath = join(RENDERED, `${slug}.txt`);
  if (!existsSync(metaPath) || !existsSync(textPath)) return null;
  try {
    return { meta: JSON.parse(readFileSync(metaPath, "utf8")), text: readFileSync(textPath, "utf8") };
  } catch {
    return null;
  }
}

/**
 * Throw unless `terms` names a capture a js line may rest on (the module comment says
 * what that means). `capture` is what readTermsCapture returned for it.
 */
export function checkTermsCapture({ terms, slug, url, capture, elsewhere = TERMS_ELSEWHERE }) {
  if (!/^[a-z0-9][a-z0-9._-]*$/.test(terms)) {
    throw new Error(`--terms must be a capture slug (research/rendered/<slug>.txt), got "${terms}"`);
  }
  if (terms === "urls") {
    throw new Error("--terms urls names research/rendered/urls.txt, the URL list itself, not a capture of any terms");
  }
  if (terms === slug) {
    throw new Error(`--terms ${terms} is the slug of the line being queued: the terms must be a different, earlier capture`);
  }
  if (!capture) {
    throw new Error(
      `no capture at research/rendered/${terms}.txt with its ${terms}.meta.json: render the target's terms first, ` +
        "read them, then queue the js line",
    );
  }
  const { meta, text } = capture;
  const status = meta?.status;
  if (meta?.error != null || !Number.isInteger(status) || status < 200 || status > 299) {
    throw new Error(
      `research/rendered/${terms}.meta.json is not a successful capture (status ${status ?? "none"}, ` +
        `error ${JSON.stringify(meta?.error ?? null)}): a terms page that was never read cannot clear a js line`,
    );
  }
  const length = String(text ?? "").trim().length;
  if (length < MIN_TERMS_TEXT) {
    throw new Error(
      `research/rendered/${terms}.txt has ${length} characters of text, fewer than ${MIN_TERMS_TEXT}: ` +
        "that is an empty JavaScript shell or a stub, not a read terms page",
    );
  }
  let target;
  try {
    target = new URL(url);
  } catch {
    throw new Error(`not a valid URL (it does not parse): ${url}`);
  }
  let captured;
  try {
    captured = new URL(meta.url);
  } catch {
    throw new Error(`research/rendered/${terms}.meta.json has no usable url: ${JSON.stringify(meta?.url ?? null)}`);
  }
  if (captured.href === target.href) {
    throw new Error(`--terms ${terms} is a capture of ${url} itself, not of its site's terms`);
  }
  const targetSite = siteOf(target.hostname);
  const capturedSite = siteOf(captured.hostname);
  if (capturedSite !== targetSite && !(elsewhere[targetSite] ?? []).includes(capturedSite)) {
    throw new Error(
      `--terms ${terms} was captured from ${captured.hostname} (site ${capturedSite}), not from the target's site ` +
        `${targetSite}: a js line rests on the target site's own terms. If this site keeps its terms elsewhere, ` +
        "record that in TERMS_ELSEWHERE (scripts/queue-zero-test.mjs) with the file that shows it",
    );
  }
}

const ROW = /^\| *(\d+) *\|/;

/**
 * Pages the runner can never render: it fetches without running JavaScript, and these
 * serve an empty shell that JavaScript fills. Tick 15 spent two render rows on
 * support.trolley.com/s/article/... and got no article text. Only shells a capture has
 * shown go here; a guessed entry would refuse a page that renders.
 */
const JS_SHELLS = [
  {
    // Salesforce Experience Cloud help centres (research/rendered/trolley-identity-verification*, tick 15)
    test: (u) => /^\/s\/(article|topic|global-search)\//.test(u.pathname) || /\.(force\.com|my\.site\.com)$/.test(u.hostname),
    why: "a Salesforce Experience Cloud page (/s/article/...), an empty JavaScript shell to the runner (tick 15, support.trolley.com)",
  },
];

function cell(text) {
  const t = String(text ?? "").replace(/\s+/g, " ").trim();
  if (!t) throw new Error("empty cell");
  return t.replace(/(?<!\\)\|/g, "\\|");
}

/**
 * Returns the two new file texts and the row number used. Pure apart from
 * `termsCapture`, which reads the disk by default and is injected by the tests.
 */
export function queueZeroTest({
  zeroTests,
  urls,
  candidate,
  url,
  slug,
  settle,
  note,
  date,
  js = false,
  terms,
  termsCapture = readTermsCapture,
  termsElsewhere = TERMS_ELSEWHERE,
  verdicts = loadVerdicts(),
}) {
  if (!/^https?:\/\/\S+$/i.test(url ?? "")) throw new Error(`not an http(s) URL: ${url}`);
  if (!/^[a-z0-9][a-z0-9-]*$/.test(slug ?? "")) throw new Error(`slug must be lowercase letters, digits and dashes: ${slug}`);
  const hasTerms = terms !== undefined && terms !== null;
  if (js) {
    if (!hasTerms) {
      throw new Error(
        "--js needs --terms <slug>: the target's terms must already be rendered at research/rendered/<slug>.txt " +
          "and must not bar automated access, exactly as for a plain GET (RULING-2026-09-29-loop.md (b))",
      );
    }
    const plausible = /^[a-z0-9][a-z0-9._-]*$/.test(terms);
    checkTermsCapture({ terms, slug, url, capture: plausible ? termsCapture(terms) : null, elsewhere: termsElsewhere });
  } else if (hasTerms) {
    throw new Error("--terms is only for a --js line: it names the terms capture the JavaScript render rests on");
  }
  // A plain GET gets an empty shell from these; the js render is what reads them.
  const shell = js ? null : JS_SHELLS.find((s) => s.test(new URL(url)));
  if (shell) throw new Error(`the runner cannot render ${url}: ${shell.why}. Queue it with --js --terms <slug> instead`);
  // verdicts: null skips the gate (unit tests of the row mechanics only); the CLI always loads the file.
  if (verdicts !== null) {
    const gate = termsGate(url, slug, verdicts);
    if (!gate.ok) throw new Error(`the terms gate refuses ${url}: ${gate.why}`);
  }
  const listed = urls.split(/\r?\n/).some((l) => l.replace(/^#\s*/, "").split(/\s+/)[0] === url);
  if (listed) throw new Error(`URL already in urls.txt (active or commented): ${url}`);

  const lines = zeroTests.split("\n");
  let last = -1;
  let max = 0;
  lines.forEach((l, i) => {
    const m = l.match(ROW);
    if (m && Number(m[1]) >= max) {
      max = Number(m[1]);
      last = i;
    }
  });
  if (last < 0) throw new Error("no numbered row found in ZERO-TESTS.md");
  const n = max + 1;
  const row = `| ${n} | ${cell(candidate)} | ${url} | ${cell(settle)} |`;
  const header = lines.find((l) => /^\| *# *\|/.test(l));
  const cols = (s) => s.replace(/\\\|/g, "").split("|").length;
  if (header && cols(header) !== cols(row)) {
    throw new Error(`row has ${cols(row) - 2} columns, the table has ${cols(header) - 2}`);
  }
  lines.splice(last + 1, 0, row);

  const comment = `# research/channel-loop/ZERO-TESTS.md row ${n} — ${cell(note).replace(/\\\|/g, "|")} (${date}).`;
  const jsNote = js ? ` JS render; terms read at research/rendered/${terms}.txt.` : "";
  const line = js ? `${url}\t${slug}\tjs` : `${url}\t${slug}`;
  const newUrls = `${urls.endsWith("\n") || urls === "" ? urls : `${urls}\n`}${comment}${jsNote}\n${line}\n`;
  parseUrlList(newUrls); // throws on a duplicate slug or a malformed line
  return { zeroTests: lines.join("\n"), urls: newUrls, row: n };
}

const LIST_ROW = /^# research\/channel-loop\/ZERO-TESTS\.md row (\d+) —/;

/**
 * The dispatch override for ZERO-TESTS rows from..to: each row's active urls.txt line, in
 * row order. Retired rows come back in `retired`; a row with no comment in urls.txt throws.
 */
export function overrideLines(urls, from, to) {
  if (!Number.isInteger(from) || !Number.isInteger(to) || from < 1 || to < from) {
    throw new Error(`not a row range: ${from}-${to}`);
  }
  const lines = urls.split(/\r?\n/);
  const out = [];
  const retired = [];
  for (let n = from; n <= to; n += 1) {
    const at = lines.findIndex((l) => Number(l.match(LIST_ROW)?.[1]) === n);
    if (at < 0) throw new Error(`row ${n} has no line in urls.txt`);
    // The row's own line is the first non-comment line after its comment, before the next row's comment.
    let line = null;
    for (let i = at + 1; i < lines.length && !LIST_ROW.test(lines[i]); i += 1) {
      const t = lines[i].trim();
      if (t !== "" && !t.startsWith("#")) {
        line = t;
        break;
      }
    }
    if (line) out.push(line);
    else retired.push(n);
  }
  if (out.length === 0) throw new Error(`rows ${from}-${to}: every row is retired, nothing to render`);
  parseUrlList(out.join("\n")); // tiktok.com, a malformed line or a duplicate slug fails here
  return { lines: out, retired };
}

function today() {
  const d = new Date();
  return `${d.getUTCDate()}.${d.getUTCMonth() + 1}.${d.getUTCFullYear()}`;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const { values } = parseArgs({
    options: {
      candidate: { type: "string" },
      url: { type: "string" },
      slug: { type: "string" },
      settle: { type: "string" },
      note: { type: "string" },
      js: { type: "boolean", default: false },
      terms: { type: "string" },
      date: { type: "string", default: today() },
      "dry-run": { type: "boolean", default: false },
      override: { type: "string" },
      "apply-verdicts": { type: "boolean", default: false },
    },
  });
  if (values["apply-verdicts"]) {
    try {
      const out = applyVerdicts(readFileSync(URLS, "utf8"), loadVerdicts());
      if (!values["dry-run"]) writeFileSync(URLS, out.urls);
      console.log(`${values["dry-run"] ? "would pause" : "paused"} ${out.paused.length} line(s)${out.paused.length ? `: ${out.paused.join(", ")}` : ""}`);
    } catch (err) {
      console.error(`queue-zero-test: ${err.message}`);
      process.exit(1);
    }
    process.exit(0);
  }
  if (values.override !== undefined) {
    try {
      const m = values.override.match(/^(\d+)(?:-(\d+))?$/);
      if (!m) throw new Error(`--override takes a row or a range, like 174-179: ${values.override}`);
      const from = Number(m[1]);
      const out = overrideLines(readFileSync(URLS, "utf8"), from, m[2] === undefined ? from : Number(m[2]));
      if (out.retired.length) console.error(`skipped retired row(s): ${out.retired.join(", ")}`);
      console.log(out.lines.join("\n"));
    } catch (err) {
      console.error(`queue-zero-test: ${err.message}`);
      process.exit(1);
    }
    process.exit(0);
  }
  try {
    const out = queueZeroTest({
      zeroTests: readFileSync(ZERO_TESTS, "utf8"),
      urls: readFileSync(URLS, "utf8"),
      ...values,
      note: values.note ?? values.candidate,
    });
    if (!values["dry-run"]) {
      writeFileSync(ZERO_TESTS, out.zeroTests);
      writeFileSync(URLS, out.urls);
    }
    console.log(`${values["dry-run"] ? "would queue" : "queued"} row ${out.row}: ${values.slug}${values.js ? " (js)" : ""}`);
  } catch (err) {
    console.error(`queue-zero-test: ${err.message}`);
    process.exit(1);
  }
}
