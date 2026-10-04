#!/usr/bin/env node
/**
 * urls-pause-comments — keep the verdict and the reason named in urls.txt's "# paused (terms unread ...)" comments true.
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
 * WHAT IT CHANGES, and nothing else. On a "# paused" line of that shape that no longer says what the verdict file says:
 *   - the verdict word, and the date note, which becomes "(<reason>[, <paused date>]; verdict as of <today>)";
 *   - the reason, when it is one the verdict decides (DERIVED_REASONS: "terms unread", "terms read", "terms read, left
 *     paused"; reasonFor says which verdict gives which). "terms unread" next to a verdict that came from reading the
 *     terms (BARRED, NOT_BARRED, CONDITIONAL_MET) is the wrong reason item 7 was about (tick 39 review, defect 1).
 *     Any other reason ("tick 21", "terms unread round 2") is a person's and is kept as written (defect 3), and so is
 *     "terms unread" for CONDITIONAL_UNMET or NO_TERMS_ROBOTS_OK, which do not say whether the terms were read
 *     (n8n.io's CONDITIONAL_UNMET is "linked but unread", y8.com's was read);
 *   - on a TERMS_BARRED host (scripts/render-watch.mjs), a line whose reason the verdict decides takes the form
 *     queue-zero-test --apply-verdicts writes for a barred host, with the pause date kept:
 *       # paused (terms audit[, <paused date>]): <domain> — see TERMS_BARRED in scripts/render-watch.mjs — <url>\t<slug>
 *     as the other TERMS_BARRED lines in urls.txt read. That form names no verdict, so it is never rewritten again.
 * Everything from " — " on (the URL, the slug, a js flag) is kept byte for byte. assertOnlyCommentsChanged checks
 * that before anything is written, reading each changed line's URL and slug with robots-verdict.mjs's PAUSED_LINE
 * (defect 2). Active lines, "# retired" lines and every other comment are never touched; no line is ever un-paused.
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
import { termsBarred } from "./render-watch.mjs";
import { PAUSED_LINE } from "./robots-verdict.mjs";

/** Sites whose pause comments are never rewritten here (see the header). */
export const KEEP_AS_IS = new Set(["nevo.co.il"]);

/** The reasons a verdict decides (reasonFor's values): these are rewritten, any other reason is kept. */
export const DERIVED_REASONS = new Set(["terms unread", "terms read", "terms read, left paused"]);

/**
 * The reason a verdict gives for a terms pause, or null when the verdict alone does not say whether the terms were
 * read (the reason is then left as written). NOT_BARRED and CONDITIONAL_MET pass the gate: such a line is paused only
 * because nobody has un-paused it (a reviewed edit for the main thread; the site's note may say why it stays paused).
 */
export function reasonFor(verdict) {
  switch (verdict) {
    case "TERMS_PENDING":
    case "NO_TERMS":
      return "terms unread";
    case "BARRED":
      return "terms read";
    case "NOT_BARRED":
    case "CONDITIONAL_MET":
      return "terms read, left paused";
    default:
      return null;
  }
}

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

/** The comment itself, before its last " — " (the URL, slug and flags follow it). */
const head = (line) => line.slice(0, line.lastIndexOf(" — "));

/** The TERMS_BARRED entry for a pause line's URL host (the site named in the comment when the URL does not parse). */
function barredFor(line, site) {
  const url = PAUSED_LINE.exec(line)?.[1];
  try {
    return termsBarred(new URL(url).hostname);
  } catch {
    return termsBarred(site);
  }
}

/**
 * Throws unless `after` is `before` with only the listed lines changed, and each of those still a "# paused" line with
 * the same URL, slug and js flag, as robots-verdict.mjs's PAUSED_LINE reads them. syncPauseComments runs it on its own
 * output, so a rewrite that would move a URL or slug, or un-pause a line, writes nothing.
 */
export function assertOnlyCommentsChanged(before, after, changedLines) {
  const a = before.split("\n");
  const b = after.split("\n");
  if (a.length !== b.length) throw new Error(`the rewrite has ${b.length} lines, the file ${a.length}; nothing written`);
  const changed = new Set(changedLines);
  const js = (line) => /\sjs\s*$/.test(line);
  for (let i = 0; i < a.length; i += 1) {
    if (!changed.has(i + 1)) {
      if (a[i] !== b[i]) throw new Error(`line ${i + 1}: changed but not listed as changed; nothing written`);
      continue;
    }
    const was = PAUSED_LINE.exec(a[i]);
    const now = PAUSED_LINE.exec(b[i]);
    if (!was || !now) throw new Error(`line ${i + 1}: not a "# paused" line ending in URL and slug on both sides; nothing written`);
    if (was[1] !== now[1] || was[2] !== now[2] || js(a[i]) !== js(b[i])) {
      throw new Error(`line ${i + 1}: the rewrite would change the URL, slug or js flag; nothing written`);
    }
  }
}

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
      const derived = DERIVED_REASONS.has(reason);
      const barred = derived ? barredFor(before, site) : null;
      const date = pausedOn ? `, ${pausedOn}` : "";
      if (keep.has(site)) {
        kept.push({ line: i + 1, site });
      } else if (barred) {
        const after = `# paused (terms audit${date}): ${barred.domain} — see TERMS_BARRED in scripts/render-watch.mjs${rest}`;
        lines[i] = after;
        changes.push({ line: i + 1, site, from: named, to: "BARRED", before, after });
      } else if (!verdicts?.[site]?.verdict) {
        unresolved.push({ line: i + 1, site, named });
      } else {
        const current = verdicts[site].verdict;
        const why = derived ? (reasonFor(current) ?? reason) : reason;
        if (current !== named || why !== reason) {
          const after = `# paused (${why}${date}; verdict as of ${today}): ${site} is ${current} in research/channel-loop/terms-verdicts.json${rest}`;
          lines[i] = after;
          changes.push({ line: i + 1, site, from: named, to: current, before, after });
        }
      }
    }
    const t = TERMS_PAUSED.exec(lines[i]);
    if (t) {
      const [, url, slug] = t;
      const gate = termsGate(url, slug, verdicts);
      if (gate.ok && !keep.has(gate.site)) unpause.push({ line: i + 1, site: gate.site, verdict: gate.verdict, slug, url });
    }
  }
  const text = lines.join("\n");
  assertOnlyCommentsChanged(urls, text, changes.map((c) => c.line));
  return { text, changes, unresolved, kept, unpause };
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
    console.log(`urls.txt:${c.line} ${c.site}: ${c.from} -> ${c.to}${c.from === c.to ? " (the reason changed)" : ""}`);
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
