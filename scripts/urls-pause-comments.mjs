#!/usr/bin/env node
/**
 * urls-pause-comments — keep the verdict named in urls.txt's "# paused (terms unread ...)" comments true.
 *
 *   node scripts/urls-pause-comments.mjs --check   # list the stale comments; exit 1 if there are any
 *   node scripts/urls-pause-comments.mjs --fix     # rewrite them in place
 *     [--urls research/rendered/urls.txt] [--verdicts research/channel-loop/terms-verdicts.json] [--today D.M.YYYY]
 *
 * WHY. queue-zero-test.mjs --apply-verdicts pauses a line by prefixing it with
 *   # paused (terms unread[, D.M.YYYY]): <site> is <VERDICT> in research/channel-loop/terms-verdicts.json — <url>\t<slug>
 * and the verdict it names is the one of that day. Verdicts change (a terms page gets read, a site is barred), the
 * comment does not, and a reader of urls.txt is then told the wrong reason (logs/CHANNEL_LOOP.md §9, tick 36, item 7).
 *
 * WHAT IT CHANGES, and nothing else. On a "# paused" line of that shape whose named verdict differs from the site's
 * current one, the verdict word, and the date note, which becomes "(<reason>[, <paused date>]; verdict as of <today>)".
 * Everything from " — " on (the URL, the slug, a js flag) is kept byte for byte, and checked before anything is
 * written. Active lines, "# retired" lines and every other comment are never touched; no line is ever un-paused.
 *
 * EXCEPTION: nevo.co.il (KEEP_AS_IS). Its pause comments are pinned (src/__tests__/revenue/robots-verdict.test.ts reads
 * them, and only scripts/robots-verdict.mjs may change nevo's verdict, ruling 30.9 16(d) D2(v)); they stay as they are.
 *
 * It also lists, and never acts on, the "# paused (terms ..." lines that would pass the terms gate today
 * (queue-zero-test.mjs termsGate): un-pausing is a reviewed edit for the main thread, and a site's note in
 * terms-verdicts.json may say why its lines stay paused anyway.
 *
 * Exit: 0 nothing stale (--check) or written (--fix); 1 stale comments (--check), or a comment naming a site with no
 * verdict (either mode; never rewritten); 2 usage or an unreadable file.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { parseArgs } from "node:util";
import { fileURLToPath } from "node:url";
import { URLS, VERDICTS, termsGate } from "./queue-zero-test.mjs";

/** Sites whose pause comments are never rewritten here (see the header). */
export const KEEP_AS_IS = new Set(["nevo.co.il"]);

const VERDICT_WORDS = "NO_TERMS_ROBOTS_OK|NOT_BARRED|CONDITIONAL_MET|CONDITIONAL_UNMET|TERMS_PENDING|NO_TERMS|BARRED";
const DATE = "\\d{1,2}\\.\\d{1,2}\\.\\d{4}";

/**
 * A pause comment this script manages: reason, optional pause date, optional earlier "verdict as of" note, site,
 * verdict word, then " — " and the rest of the line (URL, slug, flags), which is never changed.
 */
const PAUSED = new RegExp(
  `^# paused \\(([^();]*?)(?:, (${DATE}))?(?:; verdict as of ${DATE})?\\): ([a-z0-9.-]+) is (${VERDICT_WORDS}) ` +
    `in research/channel-loop/terms-verdicts\\.json( — .*)$`,
);

/** Any terms pause ("terms unread" or "terms audit"), for the un-pause listing: the URL and slug at the end. */
const TERMS_PAUSED = /^# paused \(terms\b.*\s(https?:\/\/\S+)\s+([a-z0-9][a-z0-9._-]*)(?:\s+js)?\s*$/;

/** What follows a pause comment's last " — ": the line's URL, slug and flags. */
const tail = (line) => line.slice(line.lastIndexOf(" — "));
/** The comment itself, before that. */
const head = (line) => line.slice(0, line.lastIndexOf(" — "));

/** Today's date as the comments write it (D.M.YYYY, UTC). */
export function todayNote(now = new Date()) {
  return `${now.getUTCDate()}.${now.getUTCMonth() + 1}.${now.getUTCFullYear()}`;
}

/**
 * The new urls.txt text and what changed. Pure: `verdicts` is the `sites` object of terms-verdicts.json.
 * Returns { text, changes, unresolved, kept, unpause }; line numbers are 1-based.
 */
export function syncPauseComments(urls, verdicts, { today, keep = KEEP_AS_IS } = {}) {
  if (!new RegExp(`^${DATE}$`).test(String(today ?? ""))) throw new Error(`--today must be D.M.YYYY, got ${today}`);
  const lines = urls.split("\n");
  const changes = [];
  const unresolved = [];
  const kept = [];
  const unpause = [];
  for (let i = 0; i < lines.length; i += 1) {
    const before = lines[i];
    const m = PAUSED.exec(before);
    if (m) {
      const [, reason, pausedOn, site, named, rest] = m;
      if (keep.has(site)) {
        kept.push({ line: i + 1, site });
      } else if (!verdicts?.[site]?.verdict) {
        unresolved.push({ line: i + 1, site, named });
      } else if (verdicts[site].verdict !== named) {
        const current = verdicts[site].verdict;
        const note = `# paused (${reason}${pausedOn ? `, ${pausedOn}` : ""}; verdict as of ${today}): `;
        const after = `${note}${site} is ${current} in research/channel-loop/terms-verdicts.json${rest}`;
        // The one promise this script makes: the URL, slug and flags (after the last " — ") are untouched.
        if (tail(before) !== tail(after)) throw new Error(`line ${i + 1}: the rewrite would change the URL or slug; nothing written`);
        lines[i] = after;
        changes.push({ line: i + 1, site, from: named, to: current, before, after });
      }
    }
    const t = TERMS_PAUSED.exec(lines[i]);
    if (t) {
      const [, url, slug] = t;
      const gate = termsGate(url, slug, verdicts);
      if (gate.ok && !keep.has(gate.site)) unpause.push({ line: i + 1, site: gate.site, verdict: gate.verdict, slug, url });
    }
  }
  return { text: lines.join("\n"), changes, unresolved, kept, unpause };
}

function main(argv) {
  const { values, positionals } = parseArgs({
    args: argv,
    allowPositionals: true,
    options: {
      check: { type: "boolean", default: false },
      fix: { type: "boolean", default: false },
      urls: { type: "string", default: URLS },
      verdicts: { type: "string", default: VERDICTS },
      today: { type: "string" },
    },
  });
  if (positionals.length || values.check === values.fix) {
    console.error("usage: node scripts/urls-pause-comments.mjs --check | --fix [--urls F] [--verdicts F] [--today D.M.YYYY]");
    return 2;
  }
  const urls = readFileSync(values.urls, "utf8");
  const verdicts = JSON.parse(readFileSync(values.verdicts, "utf8")).sites;
  const out = syncPauseComments(urls, verdicts, { today: values.today ?? todayNote() });

  for (const c of out.changes) {
    console.log(`urls.txt:${c.line} ${c.site}: ${c.from} -> ${c.to}`);
    console.log(`  - ${head(c.before)}`);
    console.log(`  + ${head(c.after)}`);
  }
  for (const u of out.unresolved) console.log(`urls.txt:${u.line} names ${u.named}, but ${u.site} has no verdict: left as it is`);
  for (const k of out.kept) console.log(`urls.txt:${k.line} ${k.site}: kept as it is (pinned)`);
  for (const p of out.unpause) {
    console.log(`would pass the terms gate today, left paused (un-pausing is the main thread's reviewed edit): urls.txt:${p.line} ${p.slug} (${p.site} ${p.verdict})`);
  }
  if (values.fix) {
    if (out.changes.length) writeFileSync(values.urls, out.text);
    console.log(`${out.changes.length} comment(s) rewritten${out.changes.length ? ` in ${values.urls}` : ""}`);
  } else {
    console.log(`${out.changes.length} stale comment(s)${out.changes.length ? "; run with --fix to rewrite them" : ""}`);
  }
  return out.unresolved.length || (values.check && out.changes.length) ? 1 : 0;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  let code;
  try {
    code = main(process.argv.slice(2));
  } catch (err) {
    console.error(`urls-pause-comments: ${err.message}`);
    code = 2;
  }
  process.exit(code);
}
