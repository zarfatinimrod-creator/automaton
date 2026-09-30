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
 *   status         the meta has an error, or a status outside 200-299 (Medium's 403s): never fetched.
 *   bot-challenge  too little text and a bot manager's marker in the HTML (Cloudflare, Imperva/Incapsula,
 *                  PerimeterX, DataDome, Radware, Reblaze, AWS WAF, F5, Akamai, or challenge wording); or too
 *                  little text, a captcha (reCAPTCHA, hCaptcha, Turnstile) and no sign of a JavaScript app.
 *   js-shell       too little text and a sign the page needs JavaScript: a noscript notice, an empty app root, a
 *                  body of scripts only, page state shipped for scripts to render, a Salesforce loading box.
 *   short          too little text and no other sign (a real short page is flagged too: the reader decides).
 *   ok             enough text; any marker found is still named in the evidence.
 * "Too little text" is fewer than queue-zero-test's MIN_TERMS_TEXT characters of the capture's extracted text.
 * A captcha script alone does not make a challenge: login forms and invisible reCAPTCHA v3 load one on ordinary
 * app shells (Facer's terms). Only HTML and PDF captures are pages; a JSON, plain-text or JavaScript capture is data,
 * reported ok and not text-checked.
 *
 * It only flags. It writes nothing, and it never edits terms-verdicts.json: whether a challenge is the site's
 * refusal (ruling 16(d) D2(iv), research/channel-loop/RULING-2026-09-30-video.md) is the reader's judgement.
 */
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { basename, join } from "node:path";
import { fileURLToPath } from "node:url";
import { parseArgs } from "node:util";
import { MIN_TERMS_TEXT, RENDERED } from "./queue-zero-test.mjs";

/** Site-wide bot managers and challenge pages: with too little text, the page is a challenge. */
export const BOT_MANAGERS = [
  ["Cloudflare challenge", /\/cdn-cgi\/challenge-platform\/|<title>\s*Just a moment\.\.\.\s*<\/title>|cf_chl_opt|cf-browser-verification/i],
  ["Imperva/Incapsula", /_Incapsula_Resource|Incapsula incident ID/i],
  ["PerimeterX (HUMAN)", /px-captcha|_pxAppId|captcha\.px-cdn\.net|client\.perimeterx\.net/i],
  ["DataDome", /captcha-delivery\.com|js\.datadome\.co/i],
  ["Radware Bot Manager (ShieldSquare)", /__uzdbm_\d|validate\.perfdrive\.com|shieldsquare/i],
  ["Reblaze", /window\.rbzns\s*=|\brbzid\b/i],
  ["AWS WAF challenge", /\.token\.awswaf\.com|AwsWafIntegration/],
  ["F5 BIG-IP bot defense", /\/TSPD\/(?:\?type=|[0-9a-f]{20,})/i],
  ["Akamai bot challenge", /\/_sec\/cp_challenge\/|sec-if-cpt-container/i],
  ["challenge wording", /verify (?:that )?you(?:['’]re| are) (?:not a robot|a human|human)|checking (?:if the site connection is secure|your browser before accessing)|unusual traffic from your computer network/i],
];

/** Captcha widgets: common on forms, so a challenge only on a short page with no sign of an app. */
export const CAPTCHAS = [
  ["reCAPTCHA", /(?:google\.com|recaptcha\.net)\/recaptcha\/(?:api|enterprise)\.js|class=["'][^"']*\bg-recaptcha\b/i],
  ["hCaptcha", /hcaptcha\.com\/1\/api\.js|class=["'][^"']*\bh-captcha\b/i],
  ["Cloudflare Turnstile", /challenges\.cloudflare\.com\/turnstile\/|class=["'][^"']*\bcf-turnstile\b/i],
];

/** Signs the page needs JavaScript to show its text. Each takes the HTML with comments and styles removed. */
export const JS_SIGNS = [
  ["noscript asks for JavaScript", (h) => h.match(/<noscript\b[^>]*>(?:(?!<\/noscript>)[\s\S]){0,600}?(?:\b(?:enable|requires?|required|turn on|need)\b[^<]{0,80}javascript|javascript[^<]{0,80}\b(?:must be enabled|is required|is disabled))/i)],
  ["empty app root", (h) => h.match(/<(div|main|section)\b[^>]*\bid=["'](?:root|app|__next|__nuxt|___gatsby|svelte|react-root|app-root|application)["'][^>]*>\s*<\/\1>|<div\b[^>]*\b(?:ui-view|ng-view)\b[^>]*>\s*<\/div>|<app-root\b[^>]*>\s*<\/app-root>/i)],
  ["body holds only scripts", (h) => {
    const body = h.match(/<body\b[^>]*>([\s\S]*)<\/body>/i);
    if (!body) return null;
    const rest = body[1].replace(/<script\b[\s\S]*?<\/script>/gi, "").replace(/<noscript\b[\s\S]*?<\/noscript>/gi, "");
    return /^\s*$/.test(rest) ? ["<body>"] : null;
  }],
  ["page state shipped for scripts to render", (h) => h.match(/__NEXT_DATA__|__NUXT__|__UNIVERSAL_DATA_FOR_REHYDRATION__|ytInitialData|window\.__INITIAL_STATE__|__APOLLO_STATE__|\bdata-page=["']\{/)],
  ["Salesforce Aura loading box", (h) => h.match(/id=["']auraLoadingBox["']/)],
];

const quote = (m) => JSON.stringify(m[0].replace(/\s+/g, " ").slice(0, 60));
const found = (list, html) =>
  list.flatMap(([name, test]) => {
    const m = typeof test === "function" ? test(html) : html.match(test);
    return m ? [`${name} ${quote(m)}`] : [];
  });

/** { meta, text, html } -> { kind, evidence }. text is the extracted text (textPath), html the HTML body, either null. */
export function classifyCapture({ meta, text, html }) {
  const status = meta?.status;
  if (meta?.error != null || !Number.isInteger(status) || status < 200 || status > 299) {
    return { kind: "status", evidence: `status ${status ?? "none"}, error ${JSON.stringify(meta?.error ?? null)}: never fetched` };
  }
  const type = String(meta?.contentType ?? "").split(";")[0].trim() || "no content type";
  const isHtml = /html/i.test(type) || /\.html?$/i.test(meta?.bodyPath ?? "");
  if (!isHtml && !/pdf/i.test(type)) {
    return { kind: "ok", evidence: `${type}: data, not a page; not text-checked` };
  }
  const length = String(text ?? "").trim().length;
  let size = `${length} characters of text`;
  if (text == null) size = isHtml && meta?.bodyPath == null ? "no stored body or text (bodyPath and textPath null)" : "no extracted text (textPath null)";
  const bare = html ? html.replace(/<!--[\s\S]*?-->/g, "").replace(/<style\b[\s\S]*?<\/style>/gi, "") : "";
  const managers = html ? found(BOT_MANAGERS, html) : [];
  const captchas = html ? found(CAPTCHAS, html) : [];
  const signs = html ? found(JS_SIGNS, bare) : [];
  const all = [...managers, ...captchas, ...signs];
  const with_ = (lead, rest) => [lead, ...rest].join("; ");

  if (length >= MIN_TERMS_TEXT) return { kind: "ok", evidence: with_(size, all.map((f) => `has ${f}`)) };
  const tooLittle = text == null ? size : `${size}, fewer than ${MIN_TERMS_TEXT}`;
  if (managers.length) return { kind: "bot-challenge", evidence: with_(tooLittle, [...managers, ...[...captchas, ...signs].map((f) => `also ${f}`)]) };
  if (signs.length) return { kind: "js-shell", evidence: with_(tooLittle, [...signs, ...captchas.map((f) => `also ${f}`)]) };
  if (captchas.length) return { kind: "bot-challenge", evidence: with_(tooLittle, captchas) };
  return { kind: "short", evidence: tooLittle };
}

/** Read <dir>/<slug>.meta.json and the text and HTML it names (looked up in dir by file name). Throws if missing. */
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
  const text = named(meta.textPath);
  const isHtml = /html/i.test(String(meta.contentType ?? "")) || /\.html?$/i.test(meta.bodyPath ?? "");
  return { meta, text, html: isHtml ? named(meta.bodyPath) : null };
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
