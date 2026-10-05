#!/usr/bin/env node
/**
 * remask-captures — the one-time re-mask of the captures stored before render-watch masked email addresses.
 *
 *   node scripts/remask-captures.mjs [--dry-run] [--rendered <dir>] [--only <slug>...] [--except <slug>...]
 *   node scripts/remask-captures.mjs --apply --date YYYY-MM-DD [--rendered <dir>] [--only <slug>...] [--except <slug>...]
 *
 * Why: since merge 12143ca (5.10.2026, tick 48) render-watch masks an address before it writes a capture
 * (redactSecrets: the local part becomes `[redacted:email]`, the domain is kept), but a capture stored before that and
 * not fetched since keeps its addresses, and the repository is public. The decision (main thread, 5.10): mask them in
 * place, once, through the same redactSecrets, and say in the commit that git history keeps the earlier bytes. Run again
 * when the masker learns a new form (tick 50: an @ written %40 or as a script escape, and Cloudflare's email protection,
 * which the 5.10 run could not see): it changes only what the masker now finds.
 *
 * What it reads: every <slug>.meta.json in --rendered (default research/rendered), frozen copies included, or the
 * --only slugs, less the --except slugs (each named once however often it is given; a positional slug belongs to the
 * --only or --except just before it). A meta's bodyPath is masked with the meta's contentType (redactSecrets leaves a
 * binary body, a PDF, untouched: it masks HTML, text, JSON, XML and JavaScript), its textPath as text/plain; a file
 * named by both is masked once, as the body. Each path is read from --rendered by its file name, as render-watch and
 * freeze-capture do. The capture's other files, <slug>.<ext> for freeze-capture's CAPTURE_EXTS, that no meta path
 * names are masked too, with the type their extension says (.txt text/plain, .html, .json, .xml; a .pdf or .bin is
 * binary and left alone): a failed fetch's meta names no body while the earlier fetch's files still sit beside it, and
 * a hand extraction sits beside a PDF whose meta has no textPath. They are not the meta's body, so sha256 and
 * byteLength stay; their masks count in `redacted` and `remasked`.
 *
 * DRY RUN (the default) writes nothing and prints each capture that would change (whether its body and its text would,
 * and how many addresses each masks), then a summary: files that would change, addresses masked by domain kind
 * (domainKind: free-mail provider, organisation or university, mailing-list host, government, placeholder; kinds and
 * counts only, never an address and never a domain; a mask is counted in every form redactSecrets writes it,
 * `[redacted:email]` then @, %40 or a script escape and the domain, or alone where a Cloudflare value was not one
 * address, which the summary counts as "no domain kept"), the frozen copies among them, masks whose kept domain is an asset
 * name (always 0: the mask leaves `<name>@2x.png` alone), and the cited lines that would change: every citation by line
 * in the decision-bearing files (freeze-capture's decisionFiles and scanCitations, the scan frozen-citations.test.ts
 * runs) whose range holds a line that changes, as `<capture file>:<line> → cited by <file>:<line>`, never the text.
 * Masking is inline, so no line of a body or a text moves (a change that would move one is refused); a meta gains
 * keys, so a citation of a meta's line past `truncated` is listed too. Then the pins that go stale (stalePins): every
 * line in the repository's files (tracked or untracked and not ignored; not logs/, which is history, not the captures'
 * own files and not FROZEN.sha256, which this rewrites) that holds 8 or more leading hex digits of the old sha256 of a
 * file it rewrites, or the old byte count of one (`N bytes`, `byteLength N`) on a line naming its capture: a note's or
 * a test's hash of a capture, and a meta's previousSha256, read the bytes before the mask. Exit 0 when nothing would
 * change, 3 when something would.
 *
 * APPLY (--apply --date YYYY-MM-DD; the date is never read from the clock) writes, for each capture that changes, the
 * masked body and text, each through a temp file and a rename, then its meta: `redacted` grows by the masks (a
 * `redacted` that is a sentence, as the AMO captures' hand redaction wrote, stays as it is), `remasked: { on, addresses,
 * fold: "12143ca" }` follows it (a capture re-masked before keeps one such block: `on` becomes this run's --date and
 * `addresses` the earlier count plus this run's), and when the body changed, `sha256` and `byteLength` become the new body's — when they
 * were the stored body's (a meta whose sha256 says it is of the body before a hand redaction keeps it). `redacted` and
 * `remasked` sit where buildMeta puts `redacted` (after `truncated`); nothing else in the meta moves, and it is written
 * as render-watch writes one (two-space JSON, its final newline as it was). For a frozen copy the same, and then
 * FROZEN.sha256's lines for exactly the files that changed get their new hashes; every other line stays byte for byte.
 * A second --apply changes nothing (the mask does not match its own output). Exit 0.
 *
 * It refuses (exit 1, nothing written): a directory under no git repository; a meta naming a bodyPath or textPath that
 * does not exist, or that is not JSON; a meta it would rewrite whose bytes are not that JSON as render-watch writes it;
 * a mask that would move a line; a frozen file FROZEN.sha256 does not record, or records with other bytes than are on
 * disk; and with --apply, uncommitted changes (or untracked files) among the files of the captures it would touch,
 * FROZEN.sha256 included when it would be rewritten: the earlier bytes must be in git history.
 *
 * src/__tests__/revenue/remask-captures.test.ts runs it on fixtures and, as a dry run, on the real research/rendered.
 */
import { spawnSync } from "node:child_process";
import { existsSync, readFileSync, renameSync, rmSync, statSync, writeFileSync } from "node:fs";
import { basename, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { parseArgs } from "node:util";
import {
  activeSlugs,
  CAPTURE_EXTS,
  decisionFiles,
  EXT_TYPES,
  FOLD,
  isDay,
  isSlug,
  knownSlugs,
  MANIFEST,
  maskedMeta,
  readManifest,
  RENDERED_REL,
  REPO_ROOT,
  scanCitations,
  scanOptions,
} from "./freeze-capture.mjs";
import { redactSecrets, sha256 } from "./render-watch.mjs";

/** The merge that made render-watch mask addresses; a re-masked meta names it (defined in freeze-capture.mjs). */
export { FOLD };

export const KINDS = ["free-mail provider", "organisation or university", "mailing-list host", "government", "placeholder"];

const FREE_MAIL = [
  "gmail.com", "googlemail.com", "msn.com", "ymail.com", "rocketmail.com", "aol.com", "icloud.com", "me.com", "mac.com",
  "proton.me", "protonmail.com", "protonmail.ch", "pm.me", "web.de", "mail.ru", "inbox.ru", "bk.ru", "list.ru", "qq.com",
  "163.com", "126.com", "foxmail.com", "sina.com", "zoho.com", "zohomail.com", "tutanota.com", "tuta.io", "fastmail.com",
  "hey.com", "naver.com", "daum.net", "walla.co.il", "walla.com", "mail.com",
];
const FREE_MAIL_FAMILY = /(?:^|\.)(?:yahoo|hotmail|outlook|live|gmx|yandex)\.(?:[a-z]{2,3}|co\.[a-z]{2}|com\.[a-z]{2})$/;
const LIST_HOSTS = ["googlegroups.com", "groups.io", "freelists.org", "discoursemail.com", "simplelists.com", "topicbox.com"];
const ends = (domain, list) => list.some((d) => domain === d || domain.endsWith(`.${d}`));

/**
 * The kind of a kept domain, for the summary. A heuristic over names, in this order: a placeholder (example.com/org/net,
 * the reserved .example/.test/.invalid/.localhost, .local and a `local.` host, a `your-…` sample name), a government
 * (.gov, .mil, gov./govt./gouv./gob. under a country, gc.ca, europa.eu, admin.ch, bund.de), a free-mail provider, a
 * mailing-list host (a list service, or a `lists.`/`list.`/`listserv.`/`mailman.`/`groups.` host); everything else is
 * "organisation or university" — which therefore also holds a person's own domain and an add-on's id.
 */
export function domainKind(domain) {
  const d = String(domain).toLowerCase();
  if (
    /(?:^|\.)example\.(?:com|org|net)$/.test(d) ||
    /\.(?:example|local|localhost|localdomain|test|invalid|internal)$/.test(d) ||
    /^(?:local|localhost)\./.test(d) ||
    /(?:^|\.)your-[a-z0-9-]+\./.test(d)
  ) {
    return "placeholder";
  }
  if (/\.(?:gov|mil)$/.test(d) || /\.(?:gov|govt|gouv|gob|mil)\.[a-z]{2}$/.test(d) || ends(d, ["gc.ca", "europa.eu", "admin.ch", "bund.de"])) {
    return "government";
  }
  if (ends(d, FREE_MAIL) || FREE_MAIL_FAMILY.test(d)) return "free-mail provider";
  if (ends(d, LIST_HOSTS) || /^(?:lists?|listserv|mailman|groups?)\./.test(d)) return "mailing-list host";
  return "organisation or university";
}

// A mask as redactSecrets writes it, its kept domain in group 1 (render-watch's ADDRESS_PATTERN domain and end) after
// the @ as it was written (@, %40, \u0040, \x40); group 1 is undefined for a bare mask (a Cloudflare value that was not
// one address).
const MASKED = /\[redacted:email\](?:(?:@|%40|\\[uU]0040|\\[xX]40)((?:[A-Za-z0-9-]+\.)+[A-Za-z]{2,63})(?![A-Za-z0-9]|\.[A-Za-z0-9-]))?/g;
// A kept "domain" that is a file name: the mask would have taken an asset name (`<name>@2x.png`) for an address.
const ASSET_DOMAIN = /\.(?:png|jpe?g|gif|svg|webp|avif|css|js|mjs|json|map|woff2?|ttf|otf|ico|mp4|webm|pdf|html?)$/i;

const masksIn = (text) => {
  const out = new Map();
  for (const m of text.matchAll(MASKED)) {
    const domain = (m[1] ?? "").toLowerCase(); // "" for a bare mask
    out.set(domain, (out.get(domain) ?? 0) + 1);
  }
  return out;
};

/** The lines (1-based) of before that differ in after, by position: a rewritten line, or one an insertion moved. */
const changedLines = (before, after) => {
  const a = before.split("\n");
  const b = after.split("\n");
  return a.flatMap((line, i) => (line === b[i] ? [] : [i + 1]));
};

/**
 * One file through redactSecrets: { bytes, count, addresses, domains (kept domain -> new masks; "" for a bare mask),
 * lines (changed line numbers), moved (its line count would change) }. count is every mask (addresses and secret-shaped
 * strings); addresses only the new `[redacted:email]` masks.
 */
export function maskFile(bytes, contentType, redact = redactSecrets) {
  const masked = redact(bytes, contentType);
  if (masked.count === 0) return { bytes, count: 0, addresses: 0, domains: new Map(), lines: [], moved: false };
  const was = bytes.toString("latin1");
  const now = masked.bytes.toString("latin1");
  const old = masksIn(was);
  const domains = new Map();
  let addresses = 0;
  for (const [domain, k] of masksIn(now)) {
    const added = k - (old.get(domain) ?? 0);
    if (added > 0) {
      domains.set(domain, added);
      addresses += added;
    }
  }
  return {
    bytes: masked.bytes,
    count: masked.count,
    addresses,
    domains,
    lines: changedLines(was, now),
    moved: was.split("\n").length !== now.split("\n").length,
  };
}

/** The capture's meta rewritten for its new bytes (see the header; freeze-capture's maskedMeta): the text to write. */
export function remaskedMetaText(capture, on) {
  const body = capture.parts.find((p) => p.role === "body" && p.count > 0) ?? null;
  const out = maskedMeta(capture.meta, { count: capture.count, addresses: capture.addresses, on, body });
  return `${JSON.stringify(out, null, 2)}${capture.metaText.endsWith("\n") ? "\n" : ""}`;
}

/**
 * Read and mask every capture in dir (or only, less except), in memory: { captures, problems, manifest, left }. A
 * capture is { slug, frozen, metaName, metaText, meta, parts: [{ role: body|text|other, name, before, bytes, count,
 * addresses, domains, lines, moved }], changed, count, addresses }; left is the --except slugs, sorted. problems are
 * the refusals that hold for a dry run as for --apply.
 */
export function planRemask({ dir, only = null, except = [], redact = redactSecrets }) {
  const problems = [];
  const captures = [];
  const slugs = only?.length ? [...new Set(only)] : [...knownSlugs(dir)].sort();
  const left = [...new Set(except)].sort();
  for (const slug of left) {
    if (!isSlug(slug) || !existsSync(join(dir, `${slug}.meta.json`))) problems.push(`${slug}: no capture to leave out (${slug}.meta.json does not exist)`);
  }
  for (const slug of slugs) {
    if (left.includes(slug)) continue;
    const metaName = `${slug}.meta.json`;
    if (!isSlug(slug) || !existsSync(join(dir, metaName))) {
      problems.push(`${slug}: no capture (${metaName} does not exist)`);
      continue;
    }
    const metaText = readFileSync(join(dir, metaName), "utf8");
    let meta;
    try {
      meta = JSON.parse(metaText);
    } catch (err) {
      problems.push(`${metaName} is not JSON: ${err.message}`);
      continue;
    }
    const parts = [];
    const bodyName = meta.bodyPath ? basename(meta.bodyPath) : null;
    const textName = meta.textPath ? basename(meta.textPath) : null;
    if (bodyName) parts.push({ role: "body", name: bodyName, contentType: meta.contentType });
    if (textName && textName !== bodyName) parts.push({ role: "text", name: textName, contentType: "text/plain" });
    for (const ext of CAPTURE_EXTS) {
      const name = `${slug}.${ext}`;
      if (ext === "meta.json" || parts.some((p) => p.name === name) || !existsSync(join(dir, name))) continue;
      parts.push({ role: "other", name, contentType: EXT_TYPES[ext] });
    }
    for (const part of parts) {
      const path = join(dir, part.name);
      if (!existsSync(path)) {
        problems.push(`${metaName} names ${part.role === "body" ? "bodyPath" : "textPath"} ${part.name}, which does not exist`);
        part.before = null;
        Object.assign(part, { bytes: null, count: 0, addresses: 0, domains: new Map(), lines: [], moved: false });
        continue;
      }
      part.before = readFileSync(path);
      Object.assign(part, maskFile(part.before, part.contentType, redact));
    }
    const count = parts.reduce((s, p) => s + p.count, 0);
    const capture = {
      slug,
      frozen: Boolean(meta.frozen),
      metaName,
      metaText,
      meta,
      parts,
      changed: count > 0,
      count,
      addresses: parts.reduce((s, p) => s + p.addresses, 0),
    };
    captures.push(capture);
    if (!capture.changed) continue;
    for (const p of parts) if (p.moved) problems.push(`${p.name}: masking would move a line (a multi-line secret?); not rewritten`);
    if (`${JSON.stringify(meta, null, 2)}${metaText.endsWith("\n") ? "\n" : ""}` !== metaText) {
      problems.push(`${metaName} is not written as render-watch writes a meta (two-space JSON): rewriting it would change other bytes`);
    }
  }

  let manifest = new Map();
  try {
    manifest = readManifest(dir);
  } catch (err) {
    problems.push(err.message);
  }
  for (const c of captures.filter((x) => x.changed)) {
    for (const name of [...c.parts.filter((p) => p.count > 0).map((p) => p.name), c.metaName]) {
      const before = name === c.metaName ? Buffer.from(c.metaText) : c.parts.find((p) => p.name === name).before;
      if (manifest.has(name) && manifest.get(name) !== sha256(before)) problems.push(`${MANIFEST} already disagrees with ${name}: not rewritten`);
      if (c.frozen && !manifest.has(name)) problems.push(`${name} is a frozen copy's file that ${MANIFEST} does not record`);
    }
  }
  return { captures, problems, manifest, left };
}

/** Every citation by line, in root's decision-bearing files, of a line that changes: [{ capture, line, file, fileLine }]. */
export function citedChanges({ root, dir, changed }) {
  if (!changed.size) return [];
  const known = knownSlugs(dir);
  if (existsSync(join(dir, "urls.txt"))) for (const s of activeSlugs(readFileSync(join(dir, "urls.txt"), "utf8"))) known.add(s);
  const where = relative(root, dir).split("\\").join("/");
  const out = new Map();
  for (const file of decisionFiles(root)) {
    for (const c of scanCitations(readFileSync(join(root, file), "utf8"), known, scanOptions(file)).citations) {
      for (const r of c.refs) {
        for (const ext of r.ext ? [r.ext] : ["txt", "html"]) {
          for (const line of changed.get(`${c.slug}.${ext}`) ?? []) {
            if (line < r.range[0] || line > r.range[1]) continue;
            const hit = { capture: `${where}/${c.slug}.${ext}`, line, file, fileLine: r.fileLine };
            out.set(`${hit.capture}:${line} ${file}:${r.fileLine}`, hit);
          }
        }
      }
    }
  }
  return [...out.values()];
}

const git = (cwd, args) => spawnSync("git", ["--no-optional-locks", ...args], { cwd, encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });

const HEX = /(?<![0-9A-Fa-f])[0-9a-f]{8,64}(?![0-9A-Fa-f])/g;
const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/**
 * The pins that go stale (see the header): [{ file, fileLine, kind: "sha256" | "byte count", of: [capture file...] }].
 * metaTexts: meta file name -> the text --apply writes for it, read in place of the file on disk.
 */
export function stalePins({ root, dir, changed, metaTexts = new Map() }) {
  if (!changed.length) return [];
  const where = relative(root, dir).split("\\").join("/");
  const at = (name) => (where ? `${where}/${name}` : name);
  const byPrefix = new Map();
  const sizes = new Map(); // old byte count -> [{ name, slug, count }]
  for (const c of changed) {
    const rewritten = c.parts.filter((p) => p.count > 0);
    for (const f of [...rewritten, { name: c.metaName, before: Buffer.from(c.metaText) }]) {
      const hash = sha256(f.before);
      byPrefix.set(hash.slice(0, 8), [...(byPrefix.get(hash.slice(0, 8)) ?? []), { hash, name: f.name }]);
    }
    for (const p of rewritten) {
      if (p.bytes.length === p.before.length) continue;
      const n = p.before.length;
      const num = `(?:${[...new Set([String(n), n.toLocaleString("en-US")])].map(escapeRe).join("|")})(?![\\d,]|\\.\\d)`;
      sizes.set(n, [
        ...(sizes.get(n) ?? []),
        {
          name: p.name,
          slug: new RegExp(`(?<![A-Za-z0-9-])${escapeRe(c.slug)}(?![A-Za-z0-9-])`),
          count: new RegExp(`(?<![\\d,.])${num}[\\s-]?(?:bytes?|B)\\b|byteLength\\W{0,4}${num}`),
        },
      ]);
    }
  }
  const listed = git(root, ["ls-files", "-z", "--cached", "--others", "--exclude-standard"]);
  if (listed.status !== 0) throw new Error(`git ls-files failed: ${String(listed.stderr).trim()}`);
  const out = [];
  for (const file of [...new Set(listed.stdout.split("\0").filter(Boolean))].sort()) {
    if (file.startsWith("logs/")) continue;
    const name = where && file.startsWith(`${where}/`) ? file.slice(where.length + 1) : null;
    if (name !== null && (name === MANIFEST || (!name.endsWith(".meta.json") && !name.endsWith(".md")))) continue;
    const path = join(root, file);
    let text = name !== null ? metaTexts.get(name) : undefined;
    if (text === undefined) {
      if (!existsSync(path) || !statSync(path).isFile() || statSync(path).size > 64 * 1024 * 1024) continue;
      const bytes = readFileSync(path);
      if (bytes.subarray(0, 8192).includes(0)) continue;
      text = bytes.toString("utf8");
    }
    text.split("\n").forEach((line, i) => {
      const hashOf = new Set();
      for (const m of line.matchAll(HEX)) {
        for (const h of byPrefix.get(m[0].slice(0, 8)) ?? []) if (h.hash.startsWith(m[0])) hashOf.add(at(h.name));
      }
      if (hashOf.size) out.push({ file, fileLine: i + 1, kind: "sha256", of: [...hashOf].sort() });
      const numbers = new Set([...line.matchAll(/\d{1,3}(?:,\d{3})+|\d+/g)].map((m) => Number(m[0].replaceAll(",", ""))));
      const countOf = [...numbers].flatMap((k) => sizes.get(k) ?? []).filter((s) => s.slug.test(line) && s.count.test(line)).map((s) => at(s.name));
      if (countOf.length) out.push({ file, fileLine: i + 1, kind: "byte count", of: [...new Set(countOf)].sort() });
    });
  }
  return out;
}

/** Write through a temp file beside the target and a rename: a reader never sees half a file. */
function writeAtomic(path, bytes) {
  const tmp = join(resolve(path, ".."), `.${basename(path)}.remask-${process.pid}.tmp`);
  try {
    writeFileSync(tmp, bytes);
    renameSync(tmp, path);
  } finally {
    rmSync(tmp, { force: true });
  }
}

const EXT_ORDER = ["html", "txt", "json", "xml", "bin", "pdf"];
const extOf = (name) => name.slice(name.lastIndexOf(".") + 1);
const plural = (k, one, many = `${one}s`) => `${k} ${k === 1 ? one : many}`;

/** The summary's lines, from a plan. Kinds and counts only: no address, no domain. */
function summarize(plan, verb, cited, citedVerb, pins = []) {
  const changed = plan.captures.filter((c) => c.changed);
  const parts = changed.flatMap((c) => c.parts.filter((p) => p.count > 0));
  const byExt = new Map();
  for (const p of parts) byExt.set(extOf(p.name), (byExt.get(extOf(p.name)) ?? 0) + 1);
  const exts = [...byExt.keys()].sort((a, b) => (EXT_ORDER.indexOf(a) + 1 || 99) - (EXT_ORDER.indexOf(b) + 1 || 99) || (a < b ? -1 : 1));
  const byKind = new Map(KINDS.map((k) => [k, 0]));
  let assetNames = 0;
  let bare = 0;
  for (const p of parts) {
    for (const [domain, k] of p.domains) {
      if (domain === "") {
        bare += k;
        continue;
      }
      byKind.set(domainKind(domain), byKind.get(domainKind(domain)) + k);
      if (ASSET_DOMAIN.test(domain)) assetNames += k;
    }
  }
  const addresses = changed.reduce((s, c) => s + c.addresses, 0);
  const other = changed.reduce((s, c) => s + c.count - c.addresses, 0);
  const frozen = changed.filter((c) => c.frozen);
  const frozenFiles = frozen.reduce((s, c) => s + c.parts.filter((p) => p.count > 0).length, 0);
  const lines = [];
  for (const c of changed) {
    const say = (role) => {
      const p = c.parts.find((x) => x.role === role);
      if (!p) return null;
      return p.count > 0 ? `${role} +${p.addresses} (${p.name})` : `${role} unchanged`;
    };
    const others = c.parts.filter((p) => p.role === "other" && p.count > 0).map((p) => `other +${p.addresses} (${p.name})`);
    lines.push(`  ${c.slug}${c.frozen ? " (frozen)" : ""}: ${[say("body"), say("text"), ...others].filter(Boolean).join(", ")}`);
  }
  lines.push(`unchanged: ${plural(plan.captures.length - changed.length, "capture")}`);
  if (plan.left?.length) lines.push(`left out by --except: ${plural(plan.left.length, "capture")} (${plan.left.join(", ")})`);
  lines.push(
    `${verb}: ${plural(changed.length, "capture")}, ${plural(parts.length, "file")}` +
      `${exts.length ? ` (${exts.map((e) => `${byExt.get(e)} .${e}`).join(", ")})` : ""}; ${plural(addresses, "address", "addresses")} masked`,
  );
  lines.push(`  by domain kind: ${KINDS.map((k) => `${k} ${byKind.get(k)}`).join(", ")}`);
  if (bare) lines.push(`  no domain kept (a Cloudflare value that is not one address): ${bare}`);
  lines.push(`  frozen copies among them: ${plural(frozen.length, "capture")} (${plural(frozenFiles, "file")}; their lines in ${MANIFEST}, metas included)`);
  lines.push(`  asset names masked: ${assetNames}`);
  const unnamed = parts.filter((p) => p.role === "other");
  lines.push(`  files no meta path names, masked as well: ${unnamed.length} (${plural(unnamed.reduce((s, p) => s + p.addresses, 0), "address", "addresses")})`);
  if (other) lines.push(`  secret-shaped strings masked as well: ${other}`);
  lines.push(`  cited lines that ${citedVerb}: ${new Set(cited.map((h) => `${h.capture}:${h.line}`)).size} (${plural(cited.length, "citation")})`);
  for (const h of cited) lines.push(`    ${h.capture}:${h.line} → cited by ${h.file}:${h.fileLine}`);
  lines.push(`  pins that go stale: ${pins.length} (a hash or byte count of the bytes before the mask)`);
  for (const p of pins) lines.push(`    ${p.file}:${p.fileLine} → old ${p.kind} of ${p.of.join(", ")}`);
  return lines;
}

/** The command line. io: { log, error }, and redact, the masker (redactSecrets; a test stands in a faulty one). */
export function main(argv, { log = console.log, error = console.error, redact = redactSecrets } = {}) {
  const usage =
    "usage: node scripts/remask-captures.mjs [--dry-run] [--rendered <dir>] [--only <slug>...] [--except <slug>...]\n" +
    "       node scripts/remask-captures.mjs --apply --date YYYY-MM-DD [--rendered <dir>] [--only <slug>...] [--except <slug>...]";
  let args;
  try {
    args = parseArgs({
      args: argv,
      allowPositionals: true,
      tokens: true,
      options: {
        "dry-run": { type: "boolean" },
        apply: { type: "boolean" },
        date: { type: "string" },
        rendered: { type: "string" },
        only: { type: "string", multiple: true },
        except: { type: "string", multiple: true },
      },
    });
  } catch (err) {
    error(`${err.message}\n${usage}`);
    return 1;
  }
  const v = args.values;
  // A positional slug belongs to the --only or --except right before it.
  const lists = { only: [], except: [] };
  let last = null;
  let stray = false;
  for (const t of args.tokens) {
    if (t.kind === "option") last = t.name in lists ? t.name : null;
    if (t.kind === "option" && last) lists[last].push(t.value);
    if (t.kind === "positional" && last) lists[last].push(t.value);
    else if (t.kind === "positional") stray = true;
  }
  if ((v.apply && v["dry-run"]) || stray) {
    error(usage);
    return 1;
  }
  if (v.apply && !isDay(v.date)) {
    error(`remask-captures: --apply needs --date YYYY-MM-DD (a real day), not ${JSON.stringify(v.date ?? null)}\n${usage}`);
    return 1;
  }
  const dir = resolve(v.rendered ?? join(REPO_ROOT, RENDERED_REL));
  const top = existsSync(dir) ? git(dir, ["rev-parse", "--show-toplevel"]) : { status: 1 };
  if (top.status !== 0) {
    error(`remask-captures: ${dir} is under no git repository: the earlier bytes must be in its history`);
    return 1;
  }
  const root = top.stdout.trim();
  const plan = planRemask({ dir, only: lists.only.length ? lists.only : null, except: lists.except, redact });
  const changed = plan.captures.filter((c) => c.changed);
  const metaTexts = new Map(changed.map((c) => [c.slug, remaskedMetaText(c, v.date ?? "YYYY-MM-DD")]));

  // The files --apply writes, and FROZEN.sha256's new hashes.
  const writes = [];
  const hashes = new Map();
  for (const c of changed) {
    for (const p of c.parts.filter((x) => x.count > 0)) writes.push({ name: p.name, bytes: p.bytes });
    writes.push({ name: c.metaName, bytes: Buffer.from(metaTexts.get(c.slug)) });
  }
  for (const w of writes) if (plan.manifest.has(w.name)) hashes.set(w.name, sha256(w.bytes));
  if (v.apply && writes.length) {
    // Every file of a capture it touches (a PDF beside a text it rewrites, say), and FROZEN.sha256 when it is rewritten.
    const touched = changed.flatMap((c) => CAPTURE_EXTS.map((ext) => `${c.slug}.${ext}`)).filter((name) => existsSync(join(dir, name)));
    const names = [...new Set([...touched, ...writes.map((w) => w.name), ...(hashes.size ? [MANIFEST] : [])])];
    const status = git(dir, ["status", "--porcelain", "--untracked-files=all", "--", ...names]);
    if (status.status !== 0) plan.problems.push(`git status failed: ${String(status.stderr).trim()}`);
    else if (status.stdout.trim()) plan.problems.push(`uncommitted changes among the files it would write (commit them first): ${status.stdout.trim().split("\n").join("; ")}`);
  }
  if (plan.problems.length) {
    for (const p of plan.problems) error(`remask-captures: ${p}`);
    error(`remask-captures: refused (${plural(plan.problems.length, "problem")}); nothing written`);
    return 1;
  }

  const lineMap = new Map();
  for (const c of changed) {
    for (const p of c.parts.filter((x) => x.count > 0)) lineMap.set(p.name, p.lines);
    lineMap.set(c.metaName, changedLines(c.metaText, metaTexts.get(c.slug)));
  }
  const cited = citedChanges({ root, dir, changed: lineMap });
  const pins = stalePins({ root, dir, changed, metaTexts: new Map(changed.map((c) => [c.metaName, metaTexts.get(c.slug)])) });
  const where = relative(root, dir).split("\\").join("/") || ".";
  log(`remask-captures: ${v.apply ? "apply" : "dry run"} over ${where} (${plural(plan.captures.length, "capture")})`);

  if (!v.apply) {
    for (const line of summarize(plan, "would change", cited, "would change", pins)) log(line);
    return changed.length ? 3 : 0;
  }
  for (const w of writes) writeAtomic(join(dir, w.name), w.bytes);
  if (hashes.size) {
    const path = join(dir, MANIFEST);
    const text = readFileSync(path, "utf8")
      .split("\n")
      .map((line) => {
        const m = /^([0-9a-f]{64})( {2})(\S+)$/.exec(line);
        return m && hashes.has(m[3]) ? `${hashes.get(m[3])}${m[2]}${m[3]}` : line;
      })
      .join("\n");
    writeAtomic(path, Buffer.from(text));
  }
  for (const line of summarize(plan, "changed", cited, "changed", pins)) log(line);
  return 0;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1])) process.exitCode = main(process.argv.slice(2));
