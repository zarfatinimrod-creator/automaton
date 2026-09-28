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
 *     [--date 28.9.2026] [--dry-run]
 *
 * The row number is one past the highest numbered row. The row goes directly
 * after that row. The four-column shape is enforced (a `|` inside a cell is
 * escaped). The URL list is re-parsed with render-watch's own parser, so a
 * duplicate slug or a malformed URL fails here, before anything is written. A URL
 * already in the list (active or commented out) is refused.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { parseArgs } from "node:util";
import { fileURLToPath } from "node:url";
import { parseUrlList } from "./render-watch.mjs";

const REPO_ROOT = join(fileURLToPath(new URL(".", import.meta.url)), "..");
export const ZERO_TESTS = join(REPO_ROOT, "research", "channel-loop", "ZERO-TESTS.md");
export const URLS = join(REPO_ROOT, "research", "rendered", "urls.txt");

const ROW = /^\| *(\d+) *\|/;

function cell(text) {
  const t = String(text ?? "").replace(/\s+/g, " ").trim();
  if (!t) throw new Error("empty cell");
  return t.replace(/(?<!\\)\|/g, "\\|");
}

/** Pure: returns the two new file texts and the row number used. */
export function queueZeroTest({ zeroTests, urls, candidate, url, slug, settle, note, date }) {
  if (!/^https?:\/\/\S+$/i.test(url ?? "")) throw new Error(`not an http(s) URL: ${url}`);
  if (!/^[a-z0-9][a-z0-9-]*$/.test(slug ?? "")) throw new Error(`slug must be lowercase letters, digits and dashes: ${slug}`);
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
  const newUrls = `${urls.endsWith("\n") || urls === "" ? urls : `${urls}\n`}${comment}\n${url}\t${slug}\n`;
  parseUrlList(newUrls); // throws on a duplicate slug or a malformed line
  return { zeroTests: lines.join("\n"), urls: newUrls, row: n };
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
      date: { type: "string", default: today() },
      "dry-run": { type: "boolean", default: false },
    },
  });
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
    console.log(`${values["dry-run"] ? "would queue" : "queued"} row ${out.row}: ${values.slug}`);
  } catch (err) {
    console.error(`queue-zero-test: ${err.message}`);
    process.exit(1);
  }
}
