#!/usr/bin/env node
/**
 * prize-dispatch — print the lines of research/measurements/ai-allowed-events.urls.txt whose site passes the terms
 * gate: the text for render-watch.yml's `urls` workflow_dispatch input, for the prize-event reading.
 *
 *   node scripts/prize-dispatch.mjs [--urls <file>] [--verdicts <file>] [--rendered <dir>] [--skip-captured] [--why]
 *
 * Defaults: --urls research/measurements/ai-allowed-events.urls.txt, --verdicts research/channel-loop/terms-verdicts.json,
 * --rendered research/rendered.
 *
 * WHY. The list is written by the weekly prize-intake job (src/revenue/ai-allowed-events.ts) and never edited by hand.
 * It cannot be pasted whole: render-watch's parser refuses a line on a TERMS_BARRED host (sites.google.com today),
 * and the rule of tick 20 — a site's terms are read before its first line is fetched (logs/CHANNEL_LOOP.md §9;
 * research/channel-loop/TERMS-AUDIT-2026-10-05-prize-events.md, "What the reading can render") — fails most of the
 * rest. Queued in logs/CHANNEL_LOOP.md §9 (5.10, tick 45, item 2); built in tick 47.
 *
 * WHAT IT PRINTS. stdout: only the lines for which termsGate (scripts/queue-zero-test.mjs: TERMS_BARRED, the site's
 * verdict, PATH_LIMITS with its hosts) says ok, as URL<TAB>slug, in file order, newline-terminated. Never a js flag:
 * an automatic filter does not decide that a page gets the JavaScript render. The text is re-parsed with render-watch's
 * own parseUrlList before anything is printed (as queue-zero-test.mjs --override does), so a line render-watch would
 * refuse — tiktok.com, a barred host, a duplicate or unusable slug — never reaches a dispatch; its refusal names the
 * lines of the input file, not of the re-parsed text.
 * stderr: how many URL lines were read and how many pass, and one line per failing site with its count and the gate's
 * reason (sites by count, then name). --why adds each passing line's site and verdict. --skip-captured leaves out a
 * passing line whose <rendered>/<slug>.meta.json exists, and says how many.
 *
 * Input: render-watch's syntax. A line whose first non-blank character is # is a comment; blank lines are ignored;
 * fields are split on whitespace (a TAB is the documented separator). A line with a third field (a flag) or with no
 * slug is refused, with its line number: the intake writes neither.
 *
 * DISPATCHING. The printed lines are dispatched with scripts/render-dispatch.sh, never pasted by hand:
 * `node scripts/prize-dispatch.mjs > <file>`, then `scripts/render-dispatch.sh <file> <ref>`, which checks the lines
 * again with render-watch's parser and this gate, dispatches render-watch.yml with them as its `urls` input, waits for
 * the run, fast-forwards the branch and runs capture-check and an address count on the new captures.
 *
 * Exit codes: 0 — at least one line printed; 3 — the file was read and nothing passes (or every passing line is
 * already captured, with --skip-captured); 1 — a usage or read error (a --verdicts file with no "sites" object is
 * one), a refused line, or a parseUrlList refusal (and nothing on stdout). It writes no file.
 */
import { existsSync, readFileSync } from "node:fs";
import { join, relative, sep } from "node:path";
import { parseArgs } from "node:util";
import { fileURLToPath } from "node:url";
import { loadVerdicts, RENDERED, termsGate, VERDICTS } from "./queue-zero-test.mjs";
import { parseUrlList } from "./render-watch.mjs";

const REPO_ROOT = join(fileURLToPath(new URL(".", import.meta.url)), "..");
export const PRIZE_URLS = join(REPO_ROOT, "research", "measurements", "ai-allowed-events.urls.txt");

/**
 * The passing lines of a list text, and what happened to every other line. Pure: `captureExists(slug)` is asked only
 * with skipCaptured. Throws on a line with a third field or no slug, and when parseUrlList refuses the output.
 */
export function selectDispatchLines(text, verdicts, { skipCaptured = false, captureExists = () => false } = {}) {
  const lines = [];
  const passed = [];
  const skipped = [];
  const failures = [];
  let read = 0;
  String(text ?? "")
    .replace(/^﻿/, "")
    .split(/\r?\n/)
    .forEach((raw, i) => {
      const t = raw.trim();
      if (t === "" || t.startsWith("#")) return;
      const lineNumber = i + 1;
      const fields = t.split(/\s+/);
      if (fields.length > 2) {
        throw new Error(`line ${lineNumber}: a third field ("${fields.slice(2).join(" ")}") after the slug; the intake writes none, and a js line never comes from an automatic filter`);
      }
      if (fields.length < 2) throw new Error(`line ${lineNumber}: no slug after ${fields[0]}; every intake line carries one`);
      read += 1;
      const [url, slug] = fields;
      const gate = termsGate(url, slug, verdicts);
      if (!gate.ok) {
        failures.push({ url, slug, lineNumber, site: gate.site ?? "(not a URL)", why: gate.why });
        return;
      }
      if (skipCaptured && captureExists(slug)) {
        skipped.push({ slug, lineNumber, site: gate.site });
        return;
      }
      passed.push({ url, slug, lineNumber, site: gate.site, verdict: gate.verdict });
      lines.push(`${url}\t${slug}`);
    });
  // tiktok.com, a barred host, a duplicate or bad slug: parseUrlList throws. Its "line N" counts lines of the output
  // text, whose line N is passed[N - 1]; the message names the input file's line instead.
  if (lines.length) {
    try {
      parseUrlList(`${lines.join("\n")}\n`);
    } catch (err) {
      const inputLine = (n) => passed[Number(n) - 1]?.lineNumber ?? `${n} of the output`;
      throw new Error(`render-watch's parser refuses the output: ${err.message.replace(/^urls\.txt /, "").replace(/\bline (\d+)/g, (_, n) => `line ${inputLine(n)}`)}`);
    }
  }
  return { lines, read, passed, skipped, failures };
}

/** The stderr summary of a selection, one string per line. */
export function describeSelection({ read, passed, skipped, failures }, { source = PRIZE_URLS, why = false } = {}) {
  const pass = passed.length + skipped.length;
  const sites = new Set([...passed, ...skipped].map((p) => p.site));
  const out = [`prize-dispatch: read ${read} line(s) of ${source}: ${pass} pass the terms gate (${sites.size} site(s)), ${failures.length} fail`];
  const bySite = new Map();
  for (const f of failures) {
    const s = bySite.get(f.site) ?? { count: 0, whys: new Set() };
    s.count += 1;
    s.whys.add(f.why);
    bySite.set(f.site, s);
  }
  const order = [...bySite].sort(([a, x], [b, y]) => y.count - x.count || (a < b ? -1 : a > b ? 1 : 0));
  for (const [site, s] of order) out.push(`  fail  ${site}  ${s.count}: ${[...s.whys].join(" | ")}`);
  if (why) for (const p of passed) out.push(`  pass  ${p.slug}  ${p.site} ${p.verdict}`);
  if (skipped.length) out.push(`skipped ${skipped.length} passing line(s) already captured (<rendered>/<slug>.meta.json exists)`);
  if (pass === 0) out.push("nothing passes the terms gate: nothing to dispatch");
  else if (passed.length === 0) out.push("every passing line is already captured: nothing to dispatch");
  return out;
}

function main(argv) {
  const { values } = parseArgs({
    args: argv,
    options: {
      urls: { type: "string", default: PRIZE_URLS },
      verdicts: { type: "string", default: VERDICTS },
      rendered: { type: "string", default: RENDERED },
      "skip-captured": { type: "boolean", default: false },
      why: { type: "boolean", default: false },
    },
  });
  const verdicts = loadVerdicts(values.verdicts);
  // Not research/channel-loop/terms-verdicts.json's shape: every line would fail for want of a verdict, a wrong reason.
  if (verdicts === null || typeof verdicts !== "object" || Array.isArray(verdicts)) {
    throw new Error(`--verdicts ${values.verdicts} has no "sites" object (the shape of research/channel-loop/terms-verdicts.json)`);
  }
  const out = selectDispatchLines(readFileSync(values.urls, "utf8"), verdicts, {
    skipCaptured: values["skip-captured"],
    captureExists: (slug) => existsSync(join(values.rendered, `${slug}.meta.json`)),
  });
  // A path inside the repository is named from its root, so a tick log can cite the summary as it is.
  const source = values.urls.startsWith(REPO_ROOT + sep) ? relative(REPO_ROOT, values.urls) : values.urls;
  for (const line of describeSelection(out, { source, why: values.why })) console.error(line);
  if (out.lines.length === 0) return 3;
  process.stdout.write(`${out.lines.join("\n")}\n`);
  return 0;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  let code;
  try {
    code = main(process.argv.slice(2));
  } catch (err) {
    console.error(`prize-dispatch: ${err.message}`);
    code = 1;
  }
  process.exitCode = code;
}
