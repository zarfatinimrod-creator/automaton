#!/usr/bin/env node
/**
 * capture-check — flag render-watch captures the reader should not take as read pages.
 *
 *   node scripts/capture-check.mjs <slug...>        one line per capture: slug, kind, evidence (tab-separated)
 *   node scripts/capture-check.mjs --all            every research/rendered/*.meta.json (counts per kind on stderr)
 *   node scripts/capture-check.mjs --changed        the captures git says are changed or new: every *.meta.json directly
 *                                                   in the directory that is modified, staged or untracked, and still on
 *                                                   disk (changedSlugs; counts per kind on stderr). None is not an error.
 *   --summary                                       instead of the tab lines: Markdown for a GitHub job summary on stdout
 *                                                   (summaryMarkdown), and one ::warning:: workflow command per flagged
 *                                                   capture on stderr (warningLine), each written as soon as that capture
 *                                                   is checked, so a run stopped midway keeps what it had. A capture that
 *                                                   cannot be read is a row and a warning of its own, kind "unreadable".
 *   --timeout <s>                                   seconds one capture may take (default CAPTURE_TIMEOUT_S); past that it
 *                                                   is kind "timeout", not checked (timedClassifier), and the next goes on
 *   --dir <path>                                    read captures from another directory (tests)
 * render-watch.yml runs `--changed --summary` between its fetch and its commit, so each run's job summary names the
 * captures it just stored that are not read pages. The workflow step treats every exit code as an answer, never a failure.
 *
 * Exit 0 when every capture is "ok" (or --changed found none), 3 when any is flagged (with --summary that includes a
 * capture it could not read: it is listed), 2 on a usage error, a directory git cannot read for --changed, or, without
 * --summary, a missing or unreadable capture.
 *
 * A capture is research/rendered/<slug>.{meta.json,txt,html} (render-watch.mjs). The kinds:
 *   status         the meta has an error, or a status outside 200-299. The evidence says which: the server answered
 *                  (403 refused, 404 not found, 5xx a server error, 3xx a redirect not followed), or there was no
 *                  answer (the fetch failed, or was not sent: robots.txt); and whether an older capture's text is
 *                  still on disk (a failed fetch writes no file, so what sits beside it is from an earlier date).
 *   bot-challenge  too little text and a challenge page's own marker (Cloudflare's interstitial, an Imperva incident
 *                  page, a PerimeterX or DataDome captcha, Reblaze's empty-bodied seed page, AWS WAF's challenge,
 *                  F5's support-ID page, Akamai's challenge, or challenge wording); or too little text, a captcha
 *                  (reCAPTCHA, hCaptcha, Turnstile) and no sign at all of a JavaScript app.
 *   js-shell       too little text and a sign the page needs JavaScript: an empty app root, a body of scripts only, a
 *                  Salesforce loading box; or, with very little text (under WEAK_SIGN_TEXT), a weaker sign: a
 *                  noscript notice, page state shipped for scripts, a React streaming placeholder, a splash screen.
 *   short          too little text and none of the above (a real short page is flagged too: the reader decides).
 *   ok             enough text; any marker found is still named in the evidence.
 *   timeout        (the CLI's) not checked: reading and checking it took longer than --timeout. Some of the markers'
 *                  regexes backtrack on crafted HTML: 26 KB of `<div ui-view ` took 16 s, and the time grows with the
 *                  cube of the size. A capture's HTML is a stranger's, so the CLI checks each one on a worker thread
 *                  it can stop.
 *   unreadable     (the CLI's) the capture could not be read: no meta, a meta that is not JSON, a file it names missing.
 *   trimmed        the meta has a `trimmed` block (ruling 6.10 row 21 (d): scripts/trim-capture.mjs, or render-watch's
 *                  route for a copying-barred site) and no kind from before the trim: only cited lines are in the tree,
 *                  and the evidence says where the full bytes are (git history, or not retained: the route). A capture
 *                  trim-capture trimmed keeps the kind capture-check gave it whole (the block's captureCheck), with the
 *                  trim named in the evidence; a body the trim removed is not a missing file.
 * "Too little text" is fewer than queue-zero-test's MIN_TERMS_TEXT characters, counted in the text
 * queue-zero-test's readTermsCapture reads: <slug>.txt. The evidence says whose text that is: the fetcher's (the meta's
 * textPath), the body itself (a plain-text capture), or a .txt the meta does not name (the hand extractions beside
 * four PDFs; research/rendered/README.md step 1).
 * Passive bot sensors (Radware's connector, Cloudflare's jsd script, DataDome's tag, PerimeterX's app id, Imperva's
 * resource script, AWS WAF's SDK, F5's TSPD script) sit on ordinary pages too (mr.gov.il's storefront carries the same
 * Radware connector as Israel Post's terms), so they never decide a kind: they are named, "also ...". So are captcha
 * scripts on an app shell: login forms and invisible reCAPTCHA v3 load one on ordinary shells (Facer's terms).
 * Only HTML, PDF and plain-text captures are pages; a JSON or JavaScript capture is data, reported ok and not
 * text-checked.
 *
 * It only flags. It writes nothing, and it never edits terms-verdicts.json: whether a challenge is the site's
 * refusal (ruling 16(d) D2(iv), research/channel-loop/RULING-2026-09-30-video.md) is the reader's judgement.
 */
import { spawnSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { basename, join } from "node:path";
import { fileURLToPath } from "node:url";
import { parseArgs } from "node:util";
import { isMainThread, MessageChannel, parentPort, receiveMessageOnPort, Worker, workerData } from "node:worker_threads";
import { MIN_TERMS_TEXT, RENDERED } from "./queue-zero-test.mjs";

/**
 * Text under which a weak JavaScript sign (framework markup that server-rendered pages also carry) marks a shell.
 * The shells in the store with only such a sign hold at most 193 characters (YouTube's footer, n8n's Notion hub 95);
 * PayPal's server-rendered help index pages carry the same noscript notice and __NEXT_DATA__ with 546 and 726.
 */
export const WEAK_SIGN_TEXT = 250;

/** A challenge page's own markers: with too little text, the page is a challenge. */
export const CHALLENGE_PAGES = [
  ["Cloudflare challenge page", /\/cdn-cgi\/challenge-platform\/[^"'\s]*\/orchestrate\/|<title>\s*Just a moment\.\.\.\s*<\/title>|cf_chl_opt|cf-browser-verification/i],
  ["Imperva/Incapsula incident page", /Incapsula incident ID/i],
  ["PerimeterX (HUMAN) captcha", /px-captcha|captcha\.px-cdn\.net/i],
  ["DataDome captcha", /captcha-delivery\.com/i],
  ["Reblaze challenge (seed script, empty body)", (h) => (/<body\b[^>]*>\s*<\/body>/i.test(h) ? h.match(/window\.rbzns\s*=/) : null)],
  ["AWS WAF challenge page", /id=["']challenge-container["']|AwsWafIntegration\.getToken\b/],
  ["F5 BIG-IP support-ID page", /Your support ID is/i],
  ["Akamai challenge page", /\/_sec\/cp_challenge\/|sec-if-cpt-container/i],
  ["challenge wording", /verify (?:that )?you(?:['’]re| are) (?:not a robot|a human|human)|checking (?:if the site connection is secure|your browser before accessing)|unusual traffic from your computer network/i],
];

/** Passive bot sensors: site-wide scripts on ordinary pages as well. Named, never decisive. */
export const BOT_SENSORS = [
  ["Cloudflare bot script", /\/cdn-cgi\/challenge-platform\/(?:[^"'\s]*\/)?scripts\/jsd\//i],
  ["Imperva/Incapsula script", /_Incapsula_Resource/i],
  ["PerimeterX (HUMAN) sensor", /_pxAppId|client\.perimeterx\.net/i],
  ["DataDome tag", /js\.datadome\.co/i],
  ["Radware Bot Manager (ShieldSquare) connector", /__uzdbm_\d|validate\.perfdrive\.com|shieldsquare/i],
  ["Reblaze seed or cookie", /window\.rbzns\s*=|\brbzid\b/i],
  ["AWS WAF script", /\.token\.awswaf\.com|AwsWafIntegration/],
  ["F5 BIG-IP bot defense script", /\/TSPD\/(?:\?type=|[0-9a-f]{20,})/i],
];

/** Captcha widgets: common on forms, so a challenge only on a short page with no sign at all of an app. */
export const CAPTCHAS = [
  ["reCAPTCHA", /(?:google\.com|recaptcha\.net)\/recaptcha\/(?:api|enterprise)\.js|class=["'][^"']*\bg-recaptcha\b/i],
  ["hCaptcha", /hcaptcha\.com\/1\/api\.js|class=["'][^"']*\bh-captcha\b/i],
  ["Cloudflare Turnstile", /challenges\.cloudflare\.com\/turnstile\/|class=["'][^"']*\bcf-turnstile\b/i],
];

/** Signs the page needs JavaScript to show its text. Each takes the HTML with comments and styles removed. */
export const JS_SIGNS = [
  ["empty app root", (h) => h.match(/<(div|main|section)\b[^>]*\bid=["'](?:root|app|__next|__nuxt|___gatsby|svelte|react-root|app-root|application)["'][^>]*>\s*<\/\1>|<div\b[^>]*\b(?:ui-view|ng-view)\b[^>]*>\s*<\/div>|<app-root\b[^>]*>\s*<\/app-root>/i)],
  ["body holds only scripts", (h) => {
    const body = h.match(/<body\b[^>]*>([\s\S]*)<\/body>/i);
    if (!body) return null;
    const rest = body[1].replace(/<script\b[\s\S]*?<\/script>/gi, "").replace(/<noscript\b[\s\S]*?<\/noscript>/gi, "");
    return /^\s*$/.test(rest) ? ["<body>"] : null;
  }],
  ["Salesforce Aura loading box", (h) => h.match(/id=["']auraLoadingBox["']/)],
];

/** Weaker signs: server-rendered pages carry them too, so they mark a shell only with very little text. */
export const WEAK_JS_SIGNS = [
  ["noscript asks for JavaScript", (h) => h.match(/<noscript\b[^>]*>(?:(?!<\/noscript>)[\s\S]){0,600}?(?:\b(?:enable|requires?|required|turn on|need)\b[^<]{0,80}javascript|javascript[^<]{0,80}\b(?:must be enabled|is required|is disabled))/i)],
  ["page state shipped for scripts to render", (h) => h.match(/__NEXT_DATA__|__NUXT__|__UNIVERSAL_DATA_FOR_REHYDRATION__|ytInitialData|window\.__INITIAL_STATE__|__APOLLO_STATE__|\bdata-page=["']\{|\bdata-sjs\b/)],
  ["React streaming placeholder", (h) => h.match(/<template id=["']B:\d+["']><\/template>/)],
  ["splash screen", (h) => h.match(/\bid=["']splash-screen["']/)],
];

const quote = (m) => JSON.stringify(m[0].replace(/\s+/g, " ").slice(0, 60));
const found = (list, html) =>
  list.flatMap(([name, test]) => {
    const m = typeof test === "function" ? test(html) : html.match(test);
    return m ? [`${name} ${quote(m)}`] : [];
  });

function statusEvidence(meta, text) {
  const status = meta?.status;
  let what;
  if (!Number.isInteger(status)) what = `status ${status ?? "none"}: no answer (the fetch failed, or was not sent)`;
  else if (status >= 200 && status <= 299) what = `status ${status}: the server answered, but the fetch recorded an error`;
  else {
    const gloss =
      status >= 500 ? "a server error"
      : status === 404 || status === 410 ? "not found"
      : status >= 400 ? "refused"
      : status >= 300 ? "a redirect, not followed"
      : "not a final answer";
    what = `status ${status}: the server answered ${status} (${gloss})`;
  }
  const parts = [what, `error ${JSON.stringify(meta?.error ?? null)}`];
  if (text != null) {
    parts.push(`an older capture's text is still on disk (${String(text).trim().length} characters, from an earlier fetch: git history has its date)`);
  }
  return parts.join("; ");
}

const TEXT_FROM = {
  fetcher: "",
  body: " (the body itself)",
  beside: " in a .txt the meta does not name (textPath null), not the fetcher's",
  besidePdf: " in the .txt beside the PDF, not the fetcher's (textPath null: a hand extraction, research/rendered/README.md step 1)",
};

/**
 * { meta, text, html, textFrom } -> { kind, evidence }. text is <slug>.txt's content, html the HTML body, either null.
 * textFrom says whose text it is: "fetcher" (the meta's textPath; the default), "body" or "beside" (readCapture).
 */
export function classifyCapture({ meta, text, html, textFrom = "fetcher" }) {
  const status = meta?.status;
  if (meta?.error != null || !Number.isInteger(status) || status < 200 || status > 299) {
    return { kind: "status", evidence: statusEvidence(meta, text) };
  }
  if (meta?.trimmed && typeof meta.trimmed === "object") {
    const t = meta.trimmed;
    const kept = (Array.isArray(t.keptLines) ? t.keptLines : []).reduce((n, [a, b]) => n + b - a + 1, 0);
    const where =
      `trimmed ${t.on} (ruling 6.10 row 21 (d)): ${kept} of ${t.lineCount ?? 0} text lines kept in the tree, the body ` +
      `${t.body?.inTree ? "kept at its cited lines only" : "out of it"}; the full bytes: ${t.fullBytesIn ?? "git history"}`;
    return t.captureCheck ? { kind: t.captureCheck, evidence: `${where}; capture-check's kind before the trim` } : { kind: "trimmed", evidence: where };
  }
  const type = String(meta?.contentType ?? "").split(";")[0].trim() || "no content type";
  const isHtml = /html/i.test(type) || /\.html?$/i.test(meta?.bodyPath ?? "");
  const isPdf = /pdf/i.test(type);
  if (!isHtml && !isPdf && !/^text\/plain$/i.test(type)) {
    return { kind: "ok", evidence: `${type}: data, not a page; not text-checked` };
  }
  const length = String(text ?? "").trim().length;
  let size = `${length} characters of text${TEXT_FROM[textFrom === "beside" && isPdf ? "besidePdf" : textFrom] ?? ""}`;
  if (text == null) size = isHtml && meta?.bodyPath == null ? "no stored body or text (bodyPath and textPath null)" : "no text (textPath null, and no .txt beside the body)";
  const bare = html ? html.replace(/<!--[\s\S]*?-->/g, "").replace(/<style\b[\s\S]*?<\/style>/gi, "") : "";
  const challenges = html ? found(CHALLENGE_PAGES, html) : [];
  const sensors = html ? found(BOT_SENSORS, html) : [];
  const captchas = html ? found(CAPTCHAS, html) : [];
  const strong = html ? found(JS_SIGNS, bare) : [];
  const weak = html ? found(WEAK_JS_SIGNS, bare) : [];
  const also = (list) => list.map((f) => `also ${f}`);
  const with_ = (lead, rest) => [lead, ...rest].join("; ");

  if (length >= MIN_TERMS_TEXT) {
    return { kind: "ok", evidence: with_(size, [...challenges, ...sensors, ...captchas, ...strong, ...weak].map((f) => `has ${f}`)) };
  }
  const tooLittle = text == null ? size : `${size}, fewer than ${MIN_TERMS_TEXT}`;
  if (challenges.length) {
    return { kind: "bot-challenge", evidence: with_(tooLittle, [...challenges, ...also([...sensors, ...captchas, ...strong, ...weak])]) };
  }
  const shellSigns = length < WEAK_SIGN_TEXT ? [...strong, ...weak] : strong;
  if (shellSigns.length) {
    const unused = weak.filter((f) => !shellSigns.includes(f));
    return { kind: "js-shell", evidence: with_(tooLittle, [...shellSigns, ...also([...sensors, ...captchas, ...unused])]) };
  }
  if (captchas.length && !weak.length) {
    return { kind: "bot-challenge", evidence: with_(tooLittle, [...captchas, ...also(sensors)]) };
  }
  const weakNote = weak.map((f) => `also ${f} (framework markup; with ${WEAK_SIGN_TEXT}+ characters of text not taken as a shell)`);
  return { kind: "short", evidence: with_(tooLittle, [...also([...sensors, ...captchas]), ...weakNote]) };
}

/**
 * Read <dir>/<slug>.meta.json, its text and its HTML (looked up in dir by file name). The text is <slug>.txt, as
 * queue-zero-test's readTermsCapture reads it; a textPath naming a missing file is an incomplete capture and throws.
 */
export function readCapture(slug, dir = RENDERED) {
  const metaPath = join(dir, `${slug}.meta.json`);
  if (!existsSync(metaPath)) throw new Error(`no capture: ${metaPath} does not exist`);
  const meta = JSON.parse(readFileSync(metaPath, "utf8"));
  const named = (path, trimmedAway = false) => {
    if (path == null) return null;
    const file = join(dir, basename(path));
    if (!existsSync(file) && trimmedAway) return null;
    if (!existsSync(file)) throw new Error(`capture ${slug} is incomplete: its meta names ${path}, which is not in ${dir}`);
    return readFileSync(file, "utf8");
  };
  let text = named(meta.textPath);
  let textFrom = "fetcher";
  const beside = join(dir, `${slug}.txt`);
  if (text == null && existsSync(beside)) {
    text = readFileSync(beside, "utf8");
    textFrom = meta.bodyPath != null && basename(meta.bodyPath) === `${slug}.txt` ? "body" : "beside";
  }
  const isHtml = /html/i.test(String(meta.contentType ?? "")) || /\.html?$/i.test(meta.bodyPath ?? "");
  // A trimmed capture's body left the tree on purpose (its meta keeps bodyPath, and says where the full bytes are).
  return { meta, text, textFrom, html: isHtml ? named(meta.bodyPath, meta.trimmed?.body?.inTree === false) : null };
}

/**
 * The captures in dir that git says are changed or new, as sorted slugs: every <slug>.meta.json directly in dir that
 * is modified, staged or untracked against HEAD, and still on disk. Between render-watch.yml's fetch step and its
 * commit step that is exactly what the run stored: the tree is clean at the branch tip before the fetch, and a page
 * that did not change writes nothing (render-watch.mjs). A changed .txt beside an unchanged meta is not a new capture.
 * Throws when git cannot say (no git, or dir is not in a repository).
 */
export function changedSlugs(dir = RENDERED) {
  const git = (...args) => {
    // --no-optional-locks: a status that only reads does not refresh (write) the index either.
    const r = spawnSync("git", ["--no-optional-locks", ...args], { cwd: dir, encoding: "utf8", maxBuffer: 256 * 1024 * 1024 });
    if (r.error || r.status !== 0) throw new Error(`git ${args[0]} could not read ${dir}: ${String(r.error?.message ?? r.stderr).trim()}`);
    return r.stdout;
  };
  const prefix = git("rev-parse", "--show-prefix").trim(); // dir from the top of the repository: "" or "research/rendered/"
  // -z: raw paths from the top, never quoted. --untracked-files=all: each new file, even when the whole directory is new
  // (a first run), where the default names only the directory. --no-renames: every entry is "XY <path>" (a staged
  // rename is a deletion and an addition, not two paths in one entry). "-- .": only paths under dir, so each starts
  // with prefix.
  const entries = git("status", "--porcelain=v1", "-z", "--untracked-files=all", "--no-renames", "--", ".").split("\0");
  const slugs = new Set();
  for (const entry of entries) {
    const file = entry.slice(3 + prefix.length);
    // Not in a subdirectory, a meta, and on disk (a deleted meta is a change with nothing to read).
    if (file.includes("/") || !file.endsWith(".meta.json") || !existsSync(join(dir, file))) continue;
    slugs.add(file.slice(0, -".meta.json".length));
  }
  return [...slugs].sort();
}

/**
 * One Markdown table cell on one line, with what GitHub would read as markup or a cell break backslash-escaped: also $
 * (math) and @ (a mention). A bare URL is left as it is: GitHub may make it a link, to the page it names.
 */
const cell = (s) => String(s).replace(/\s+/g, " ").replace(/[\\`*_[\]<>&|~$@]/g, "\\$&");

/**
 * The job summary is written in three parts, so a caller can write each row as soon as it has it: summaryHead(total),
 * then summaryRow(row, first) for each row that is not "ok" (first: the first such row, which also writes the table
 * header), then summaryEnd(rows) with every row. summaryMarkdown(rows) is the three at once. where names the
 * directory; scope qualifies "capture" ("changed or new " for --changed).
 */
export function summaryHead(total, { where = "research/rendered", scope = "" } = {}) {
  if (!total) return "### capture-check\n\n";
  return (
    `### capture-check\n\nChecking ${total} ${scope}capture${total === 1 ? "" : "s"} in ${cell(where)}. ` +
    "A row below for each one that is not a read page, as it is checked; the last line counts them, and without it the check was cut short.\n\n"
  );
}

export const summaryRow = (row, first) =>
  `${first ? "| slug | kind | evidence |\n| --- | --- | --- |\n" : ""}| ${cell(row.slug)} | ${cell(row.kind)} | ${cell(row.evidence)} |\n`;

export function summaryEnd(rows, { where = "research/rendered", scope = "" } = {}) {
  const flagged = rows.filter((r) => r.kind !== "ok").length;
  if (!rows.length) return `No ${scope}capture in ${cell(where)}: nothing to check.\n`;
  if (!flagged) return `Every ${scope}capture in ${cell(where)} reads as a page (${rows.length} checked, kind ok).\n`;
  return (
    `\nNot read pages: ${flagged} of ${rows.length} ${scope}captures in ${cell(where)}. ` +
    "capture-check only flags: the reader judges each one (research/rendered/README.md, step 0).\n"
  );
}

/** The whole job summary for rows of { slug, kind, evidence }: a table of the rows that are not "ok", and a count. */
export function summaryMarkdown(rows, options = {}) {
  const flagged = rows.filter((r) => r.kind !== "ok");
  return summaryHead(rows.length, options) + flagged.map((r, i) => summaryRow(r, i === 0)).join("") + summaryEnd(rows, options);
}

// A workflow command's escaping (the Actions toolkit's): the data escapes %, CR and LF; a property also : and ,.
const commandData = (s) => String(s).replace(/%/g, "%25").replace(/\r/g, "%0D").replace(/\n/g, "%0A");
const commandProperty = (s) => commandData(s).replace(/:/g, "%3A").replace(/,/g, "%2C");

/**
 * A ::warning:: workflow command for one flagged capture: an annotation on the run page. GitHub limits how many
 * annotations it shows for a step (the limit is GitHub's, not checked here); the summary table has every row.
 */
export const warningLine = ({ slug, kind, evidence }) =>
  `::warning title=${commandProperty(`capture-check: ${kind}`)}::${commandData(`${slug}: ${evidence}`)}`;

/** Seconds one capture may take to read and check before the CLI reports it as kind "timeout" (the slowest capture in
 * the store took 0.2 s when this was written: gamedistribution-guidelines, 5 MB of HTML). */
export const CAPTURE_TIMEOUT_S = 10;

/**
 * Reads and checks captures on a worker thread, at most timeoutS seconds each, so one capture whose HTML makes a regex
 * backtrack cannot hold up the rest: past the limit the worker is stopped (a regex is interrupted too) and a fresh one
 * takes the next capture. check(slug) returns { slug, kind, evidence }, kind "timeout" past the limit, and throws what
 * readCapture throws. close() stops the worker. The main thread waits with Atomics.wait, so this stays synchronous.
 */
export function timedClassifier(dir = RENDERED, timeoutS = CAPTURE_TIMEOUT_S) {
  let worker = null;
  let flag;
  let port;
  const close = () => {
    if (worker) void worker.terminate();
    worker = null;
  };
  const check = (slug) => {
    if (!worker) {
      flag = new Int32Array(new SharedArrayBuffer(4));
      const channel = new MessageChannel();
      port = channel.port1;
      worker = new Worker(new URL(import.meta.url), { workerData: { captureCheckWorker: true, flag, port: channel.port2 }, transferList: [channel.port2] });
      worker.unref(); // a worker still running a regex never holds the process open
    }
    Atomics.store(flag, 0, 0);
    worker.postMessage({ slug, dir });
    Atomics.wait(flag, 0, 0, timeoutS * 1e3);
    const reply = receiveMessageOnPort(port);
    if (!reply) {
      close();
      return {
        slug,
        kind: "timeout",
        evidence: `not checked: reading and checking it took longer than ${timeoutS} s (a page's HTML can be written to make the markers' regexes backtrack for minutes); read the capture by hand`,
      };
    }
    if (reply.message.error != null) throw new Error(reply.message.error);
    return reply.message.row;
  };
  return { check, close };
}

// The worker's side of timedClassifier: one capture per message, the answer on the port, then the flag.
if (!isMainThread && workerData?.captureCheckWorker === true) {
  const { flag, port } = workerData;
  parentPort.on("message", ({ slug, dir }) => {
    let reply;
    try {
      reply = { row: { slug, ...classifyCapture(readCapture(slug, dir)) } };
    } catch (err) {
      reply = { error: String(err?.message ?? err) };
    }
    port.postMessage(reply);
    Atomics.store(flag, 0, 1);
    Atomics.notify(flag, 0);
  });
}

function main(argv) {
  const usage = "usage: node scripts/capture-check.mjs [--dir <path>] [--summary] [--timeout <s>] <slug...> | --all | --changed";
  let args;
  try {
    args = parseArgs({
      args: argv,
      allowPositionals: true,
      options: { all: { type: "boolean" }, changed: { type: "boolean" }, dir: { type: "string" }, summary: { type: "boolean" }, timeout: { type: "string" } },
    });
  } catch (err) {
    console.error(`${err.message}\n${usage}`);
    return 2;
  }
  const { all, changed, summary } = args.values;
  const dir = args.values.dir ?? RENDERED;
  const timeoutS = args.values.timeout === undefined ? CAPTURE_TIMEOUT_S : Number(args.values.timeout);
  if (!(timeoutS > 0 && Number.isFinite(timeoutS))) {
    console.error(`--timeout takes a number of seconds above 0, got ${JSON.stringify(args.values.timeout)}\n${usage}`);
    return 2;
  }
  let slugs;
  if (changed) {
    if (all || args.positionals.length) {
      console.error(usage);
      return 2;
    }
    try {
      slugs = changedSlugs(dir);
    } catch (err) {
      console.error(err.message);
      if (summary) process.stdout.write(`### capture-check\n\ncapture-check could not list the changed captures: ${cell(err.message)}\n`);
      return 2;
    }
  } else {
    slugs = all
      ? readdirSync(dir).filter((f) => f.endsWith(".meta.json")).map((f) => f.slice(0, -".meta.json".length)).sort()
      : args.positionals;
    if (!slugs.length || (all && args.positionals.length)) {
      console.error(usage);
      return 2;
    }
  }
  const where = { where: args.values.dir ?? "research/rendered", scope: changed ? "changed or new " : "" };
  if (summary) process.stdout.write(summaryHead(slugs.length, where));
  const classifier = timedClassifier(dir, timeoutS);
  const counts = {};
  const rows = [];
  let errors = 0;
  let flagged = 0;
  for (const slug of slugs) {
    let row;
    try {
      if (!/^[a-z0-9][a-z0-9._-]*$/i.test(slug)) throw new Error(`not a capture slug: ${slug}`);
      row = classifier.check(slug);
    } catch (err) {
      errors += 1;
      // With --summary the message is only a row and a warning, both escaped: raw, its newlines could start a line
      // GitHub reads as a workflow command (a meta that is not JSON has its first characters in the message).
      if (!summary) console.error(err.message);
      row = { slug, kind: "unreadable", evidence: err.message };
    }
    counts[row.kind] = (counts[row.kind] ?? 0) + 1;
    rows.push(row);
    if (summary) {
      // Written now, not at the end: a run stopped by its step's timeout keeps every row before the one it stopped in.
      if (row.kind !== "ok") {
        flagged += 1;
        process.stdout.write(summaryRow(row, flagged === 1));
        console.error(warningLine(row));
      }
    } else if (row.kind !== "unreadable") console.log(`${slug}\t${row.kind}\t${row.evidence}`);
  }
  classifier.close();
  if (summary) process.stdout.write(summaryEnd(rows, where));
  const tally = Object.entries(counts).map(([k, v]) => `${k} ${v}`).join(", ");
  if (all) console.error(`${slugs.length} captures: ${tally}`);
  if (changed) console.error(`${slugs.length} changed or new captures${tally ? `: ${tally}` : ""}`);
  // With --summary an unreadable capture is listed like any flagged one: exit 2 there means no list at all.
  if (errors && !summary) return 2;
  return Object.keys(counts).some((k) => k !== "ok") ? 3 : 0;
}

if (isMainThread && process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) process.exitCode = main(process.argv.slice(2));
