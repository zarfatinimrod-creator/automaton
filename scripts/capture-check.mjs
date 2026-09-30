#!/usr/bin/env node
/**
 * capture-check — flag render-watch captures the reader should not take as read pages.
 *
 *   node scripts/capture-check.mjs <slug...>        one line per capture: slug, kind, evidence (tab-separated)
 *   node scripts/capture-check.mjs --all            every research/rendered/*.meta.json (counts per kind on stderr)
 *   --dir <path>                                    read captures from another directory (tests)
 *
 * Exit 0 when every capture is "ok", 3 when any is flagged, 2 on a usage error or a missing capture.
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
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { basename, join } from "node:path";
import { fileURLToPath } from "node:url";
import { parseArgs } from "node:util";
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
  const named = (path) => {
    if (path == null) return null;
    const file = join(dir, basename(path));
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
  return { meta, text, textFrom, html: isHtml ? named(meta.bodyPath) : null };
}

function main(argv) {
  const usage = "usage: node scripts/capture-check.mjs [--dir <path>] <slug...> | --all";
  let args;
  try {
    args = parseArgs({ args: argv, allowPositionals: true, options: { all: { type: "boolean" }, dir: { type: "string" } } });
  } catch (err) {
    console.error(`${err.message}\n${usage}`);
    return 2;
  }
  const dir = args.values.dir ?? RENDERED;
  const slugs = args.values.all
    ? readdirSync(dir).filter((f) => f.endsWith(".meta.json")).map((f) => f.slice(0, -".meta.json".length)).sort()
    : args.positionals;
  if (!slugs.length || (args.values.all && args.positionals.length)) {
    console.error(usage);
    return 2;
  }
  const counts = {};
  let errors = 0;
  for (const slug of slugs) {
    if (!/^[a-z0-9][a-z0-9._-]*$/i.test(slug)) {
      console.error(`not a capture slug: ${slug}`);
      errors += 1;
      continue;
    }
    try {
      const { kind, evidence } = classifyCapture(readCapture(slug, dir));
      counts[kind] = (counts[kind] ?? 0) + 1;
      console.log(`${slug}\t${kind}\t${evidence}`);
    } catch (err) {
      console.error(err.message);
      errors += 1;
    }
  }
  if (args.values.all) console.error(`${slugs.length} captures: ${Object.entries(counts).map(([k, v]) => `${k} ${v}`).join(", ")}`);
  if (errors) return 2;
  return Object.keys(counts).some((k) => k !== "ok") ? 3 : 0;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) process.exitCode = main(process.argv.slice(2));
