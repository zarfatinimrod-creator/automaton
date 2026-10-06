#!/usr/bin/env node
/**
 * address-kinds — count the address-shaped strings in files by form, domain kind and local-part role, never printing
 * one.
 *
 *   node scripts/address-kinds.mjs <file>... [--json]
 *
 * Why: ticks 49-52 counted the addresses left in captures by hand, three times, and scripts/render-dispatch.sh carried
 * the only copy of the counter inline (its step 7); a re-mask run (scripts/remask-run.sh) and a tick reading re-fetched
 * captures need the same count as a check. This is that counter, once; render-dispatch.sh calls it.
 *
 * Each file is read as UTF-8 (so an address outside ASCII, an accented local part or an internationalised domain, is
 * found, as render-dispatch's report found it), and counted:
 *   masked          `[redacted:email]` as render-watch writes it, by the kind of the domain it kept (domainKind,
 *                   scripts/remask-captures.mjs: free-mail provider, organisation or university, mailing-list host,
 *                   government, placeholder), or "no domain kept" for a bare mask; a mask glued to what is left of a
 *                   local part outside ASCII (a letter outside ASCII just before it, or a character reference or script
 *                   escape for one: render-watch's masker takes only the ASCII tail of such a local part) is not
 *                   masked but raw, in the form "partly masked", role "not read"
 *   raw             an address-shaped string the mask did not take: a local part, an @ in any of the forms a capture
 *                   may hold it, and a domain that is not a file name; by its form (plain, %40, script escape \u0040
 *                   or \x40, character reference &#64; &#x40; &commat;, look-alike at sign U+FF20 / U+FE6B, Cloudflare
 *                   hex, and "other form the masker finds" for an address render-watch's masker would mask that none of
 *                   these reads, such as one spelt wholly in character references), by domain kind, and by local-part
 *                   role ("role" for a project's or a desk's address: support, info, contact, press, sales, team,
 *                   admin, noreply and the like; "other" for the rest; "not read" where only the masker saw it); and
 *                   how many of them the masker takes (a re-mask, scripts/remask-captures.mjs, would mask those)
 *   left by design  the forms render-watch's masker leaves on purpose (its ADDRESS_PATTERN comment and
 *                   research/rendered/README.md): an asset name (`<name>@2x.png`), a URL userinfo (`scheme://user@host`,
 *                   `scheme://user:password@host`), a local part after `/` (a path: a list archive, a form id, a wiki
 *                   page `/User:<name>@host`; percent-encoded too), package@version (a number after the @), and a forum
 *                   handle (an @ with no local part before it, then a dotted name: `/@<channel.name>`, and after a script
 *                   escape, `\u002F@<channel.name>` or `\u003e@<name.team>`, which the plain matcher reads as `u002F`
 *                   and `u003e` local parts)
 * Whether the masker takes a string is asked of the masker itself: redactSecrets (scripts/render-watch.mjs) reads the
 * file's bytes as latin1, as it reads a stored body, once over the whole file and once over the string's surroundings
 * with and without its @; nothing here re-implements its rules. A raw string it leaves that is in none of the
 * by-design forms (a look-alike at sign, an address outside ASCII, &commat;) is still raw. The masker is told each
 * file's type by its extension (freeze-capture.mjs's EXT_TYPES; any other is text): it never rewrites a binary body,
 * a .pdf or .bin, so an address-shaped string in one is raw and none is taken (the PDF's extracted .txt is masked).
 *
 * Prints one block per file and a total: counts, kinds, forms and roles only — never an address, a local part or a
 * raw address's domain (a mask's domain only as its kind). A WARNING line on stderr names each file holding raw ones.
 * --json writes the same numbers as one JSON object instead of the blocks: { files: [...], total, unreadable }.
 *
 * Exit: 0 when no file holds a raw address-shaped string; 3 when at least one does (so a tick can use it as a check);
 * 1 when a file cannot be read (the others are still counted); 2 on a usage error.
 *
 * src/__tests__/revenue/address-kinds.test.ts runs it on fixtures built at run time and on two real captures.
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { EXT_TYPES } from "./freeze-capture.mjs";
import { domainKind } from "./remask-captures.mjs";
import { redactSecrets } from "./render-watch.mjs";

// An @ as a capture may hold one: plain, percent-encoded, script-escaped, a character reference, a look-alike.
const AT = "(?:@|%40|\\\\[uU]0040|\\\\[xX]40|&#0*64;?|&#[xX]0*40;?|&commat;|\uFF20|\uFE6B)";
// Letters, marks and digits of any script: an accented local part or an internationalised domain is an address too.
const W = "\\p{L}\\p{M}\\p{N}";
const LOCAL = `[${W}._%+-]`;
const DOMAIN = `((?:[${W}-]+\\.)+[\\p{L}\\p{M}][${W}-]{1,62})`;
const MASK = new RegExp(`\\[redacted:email\\](?:${AT}${DOMAIN})?`, "gu");
// A raw address: the local part (group 1), the @ as written (group 2), the domain (group 3).
const RAW = new RegExp(`(?<!${LOCAL})(${LOCAL}+)(${AT})${DOMAIN}(?![${W}-])`, "gu");
// package@version: a number after the @ (never a RAW match, whose last label starts with a letter).
const PACKAGE = new RegExp(`(?<!${LOCAL})${LOCAL}+@v?\\d+(?:\\.\\d+)+(?![${W}_-]|\\.[${W}])`, "gu");
// A forum handle: an @ with no local part before it (and not a mask's), then a dotted name.
const HANDLE = new RegExp(`(?<![${W}._%+\\]-])${AT}${DOMAIN}(?![${W}-])`, "gu");
// Where a Cloudflare email-protection value may start; the masker decides whether one does.
const CLOUDFLARE_AT = /data-cfemail=|email-protection#/gi;
const FILE_NAME = /\.(?:png|jpe?g|gif|svg|webp|avif|css|js|mjs|json|map|woff2?|ttf|otf|ico|mp4|webm|pdf|html?)$/i;
// Before a local part: a URL's scheme and authority (`scheme://`, `scheme://user:`), or a path's `/` (escaped too).
const USERINFO_BEFORE = /:\/\/(?:[^\s"'<>()?=&,;|#/@]*:)?$/;
const SLASH_BEFORE = /\/(?:[^\s"'<>()?=&,;|#/]*:)?$/;
const ROLES = new Set([
  "abuse", "admin", "administrator", "billing", "bounty", "bounties", "careers", "chair", "chairs", "challenge",
  "committee", "community", "contact", "contactus", "dev", "developers", "donotreply", "do-not-reply", "editor",
  "editors", "enquiries", "events", "feedback", "hackathon", "hello", "help", "helpdesk", "hr", "info", "inquiries",
  "jobs", "legal", "mail", "marketing", "media", "news", "newsletter", "noreply", "no-reply", "office", "organizers",
  "organisers", "partners", "partnerships", "postmaster", "press", "privacy", "sales", "security", "support", "team",
  "webmaster",
]);

export const KIND_NO_DOMAIN = "no domain kept";
export const BY_DESIGN = ["asset name", "URL userinfo", "local part after /", "package@version", "forum handle"];
export const RAW_FORMS = ["plain", "%40", "script escape", "character reference", "look-alike at sign", "Cloudflare hex", "partly masked", "other form the masker finds"];

const decodePercent = (s) => s.replace(/%([0-9a-f]{2})/gi, (_m, h) => String.fromCharCode(Number.parseInt(h, 16)));
const bump = (map, key, n = 1) => map.set(key, (map.get(key) ?? 0) + n);
const maskCount = (s) => s.split("[redacted:email]").length - 1;
/** How many masks the masker adds to a text (its bytes read as latin1, as redactSecrets reads a stored body). */
const masksAdded = (bytes, contentType = "text/plain") => {
  const { bytes: out } = redactSecrets(bytes, contentType);
  return { added: maskCount(out.toString("latin1")) - maskCount(bytes.toString("latin1")), text: out.toString("latin1") };
};
// Just before a mask: a letter outside ASCII, or a reference or escape that may spell one (decoded below).
const BEFORE_MASK = /(?:&#[xX]([0-9a-fA-F]{1,6});|&#(\d{1,7});|&([A-Za-z]{2,8});|\\u([0-9a-fA-F]{4})|\\x([0-9a-fA-F]{2})|([^\x00-\x7F]))$/u;
// The named references that spell a letter outside ASCII (&eacute;, &ntilde;, &oslash;, &aelig;, &szlig;, &thorn;...).
const LETTER_NAME = /^(?:[A-Za-z]{1,2}(?:acute|grave|circ|uml|tilde|ring|cedil|slash|caron|lig)|szlig|eth|ETH|thorn|THORN)$/;
const NON_ASCII_LETTER = /^[^\x00-\x7F]$/u;
/** Is the mask at text[index] glued to what is left of a local part outside ASCII? */
function partlyMasked(text, index) {
  const m = BEFORE_MASK.exec(text.slice(Math.max(0, index - 12), index));
  if (!m) return false;
  if (m[3]) return LETTER_NAME.test(m[3]);
  const ch = m[6] ?? String.fromCodePoint(Number.parseInt(m[1] ?? m[2] ?? m[4] ?? m[5], m[2] ? 10 : 16));
  return NON_ASCII_LETTER.test(ch) && /[\p{L}\p{M}]/u.test(ch);
}
const kindsOfMasks = (text) => {
  const kinds = new Map();
  for (const m of text.matchAll(MASK)) bump(kinds, m[1] ? domainKind(m[1]) : KIND_NO_DOMAIN);
  return kinds;
};

/** The form an @ is written in. */
export function atForm(at) {
  if (at === "@") return "plain";
  if (at === "%40") return "%40";
  if (at.startsWith("\\")) return "script escape";
  if (at.startsWith("&")) return "character reference";
  return "look-alike at sign";
}

/** "role" for a project's or a desk's local part, "other" for the rest. Never returns the local part. */
export function localRole(local) {
  const base = decodePercent(String(local)).toLowerCase().split("+")[0];
  return ROLES.has(base) ? "role" : "other";
}

/** Does the masker take the raw string text[start, end) whose @ is text[atStart, atEnd)? Asked of redactSecrets. */
function maskerTakes(text, start, atStart, atEnd, end, contentType) {
  const from = Math.max(0, start - 400);
  const to = Math.min(text.length, end + 64);
  const added = (s) => masksAdded(Buffer.from(s, "utf8"), contentType).added;
  return added(text.slice(from, to)) > added(`${text.slice(from, atStart)} ${text.slice(atEnd, to)}`);
}

/**
 * The by-design form of a raw string the masker leaves, or null when it is in none. What comes before the @ is read
 * with its percent escapes and script escapes decoded (`%2F`, `\u002F`, `\\u003e`), as the masker reads them: what the
 * plain matcher took for a local part may be an escape (`\u002F@<name>`), which leaves no local part at all.
 */
function byDesignForm(text, hit) {
  if (FILE_NAME.test(hit[3])) return "asset name";
  const before = decodePercent(text.slice(Math.max(0, hit.index - 400), hit.index) + hit[1]).replace(
    /\\+(?:u00([0-9a-f]{2})|x([0-9a-f]{2}))/gi,
    (_m, u, x) => String.fromCharCode(Number.parseInt(u ?? x, 16)),
  );
  const local = /[\p{L}\p{M}\p{N}._+-]*$/u.exec(before)[0];
  const ahead = before.slice(0, before.length - local.length);
  if (!local) return "forum handle";
  if (USERINFO_BEFORE.test(ahead)) return "URL userinfo";
  if (SLASH_BEFORE.test(ahead)) return "local part after /";
  return null;
}

/**
 * The counts for one text (a file read as UTF-8; bytes are its bytes, for the masker; contentType is what the masker is
 * told it is: a binary body, a PDF, is one it never rewrites, so nothing in it is taken).
 */
export function countText(text, bytes = Buffer.from(text, "utf8"), contentType = "text/plain") {
  const masked = { count: 0, kinds: new Map() };
  const raw = { count: 0, kinds: new Map(), forms: new Map(), roles: new Map(), maskerTakes: 0 };
  const byDesign = { count: 0, forms: new Map() };
  const takenKinds = new Map();
  const addRaw = (form, kind, role, taken) => {
    raw.count += 1;
    bump(raw.forms, form);
    bump(raw.kinds, kind);
    bump(raw.roles, role);
    if (taken) {
      raw.maskerTakes += 1;
      bump(takenKinds, kind);
    }
  };
  const addByDesign = (form) => {
    byDesign.count += 1;
    bump(byDesign.forms, form);
  };

  for (const m of text.matchAll(MASK)) {
    const kind = m[1] ? domainKind(m[1]) : KIND_NO_DOMAIN;
    if (partlyMasked(text, m.index)) addRaw("partly masked", kind, "not read", false);
    else {
      masked.count += 1;
      bump(masked.kinds, kind);
    }
  }

  for (const hit of text.matchAll(RAW)) {
    const atStart = hit.index + hit[1].length;
    const atEnd = atStart + hit[2].length;
    const taken = maskerTakes(text, hit.index, atStart, atEnd, hit.index + hit[0].length, contentType);
    const design = taken ? null : byDesignForm(text, hit);
    if (design) addByDesign(design);
    else addRaw(atForm(hit[2]), domainKind(hit[3]), localRole(hit[1]), taken);
  }
  for (const _ of text.matchAll(PACKAGE)) addByDesign("package@version");
  for (const _ of text.matchAll(HANDLE)) addByDesign("forum handle");

  // Cloudflare's email protection: the masker says whether a value starts here and keeps its domain; the hex is
  // decoded in memory only to read the local part's role.
  for (const c of text.matchAll(CLOUDFLARE_AT)) {
    const snippet = text.slice(c.index, c.index + 600);
    const out = masksAdded(Buffer.from(snippet, "utf8"), contentType).text;
    const k = out.indexOf("[redacted:email]");
    if (k < 0 || k > 24 || snippet.startsWith("[redacted:email]", k)) continue;
    const hex = /^[0-9a-f]+/i.exec(snippet.slice(k))?.[0] ?? "";
    const domain = new RegExp(MASK.source, "u").exec(out.slice(k))?.[1];
    const key = hex.length >= 4 ? Buffer.from(hex.slice(0, 2), "hex")[0] : 0;
    const decoded = Buffer.from(Buffer.from(hex.slice(2), "hex").map((b) => b ^ key)).toString("utf8");
    const local = /^([^@\s?]+)@/.exec(decoded)?.[1];
    addRaw("Cloudflare hex", domain ? domainKind(domain) : KIND_NO_DOMAIN, local ? localRole(local) : "not read", true);
  }

  // What the masker would mask in the whole file that none of the above read (an address spelt wholly in character
  // references): counted as raw, its kinds from the masks the masker would add.
  const whole = masksAdded(bytes, contentType);
  const extra = whole.added - raw.maskerTakes;
  if (extra > 0) {
    const kinds = kindsOfMasks(whole.text);
    for (const [k, n] of kindsOfMasks(text)) bump(kinds, k, -n);
    for (const [k, n] of takenKinds) bump(kinds, k, -n);
    let left = extra;
    for (const [k, n] of [...kinds].sort(([a], [b]) => (a < b ? -1 : 1))) {
      for (let i = 0; i < Math.min(n, left); i += 1) addRaw("other form the masker finds", k, "not read", true);
      left -= Math.max(0, Math.min(n, left));
    }
    for (let i = 0; i < left; i += 1) addRaw("other form the masker finds", "kind not read", "not read", true);
  }
  return { masked, raw, byDesign };
}

const tally = (map) =>
  [...map]
    .filter(([, n]) => n > 0)
    .sort(([a], [b]) => (a < b ? -1 : 1))
    .map(([k, n]) => `${k} ${n}`)
    .join(", ");
const said = (n, map) => `${n}${n ? ` (${tally(map)})` : ""}`;
const plain = (map) => Object.fromEntries([...map].filter(([, n]) => n > 0).sort(([a], [b]) => (a < b ? -1 : 1)));

function block(label, c) {
  const lines = [`${label}: masked ${said(c.masked.count, c.masked.kinds)}; raw ${said(c.raw.count, c.raw.kinds)}; left by design ${c.byDesign.count}`];
  if (c.raw.count) {
    lines.push(`  raw by form: ${tally(c.raw.forms)}; the masker takes ${c.raw.maskerTakes} of them`);
    lines.push(`  raw by local-part role: ${tally(c.raw.roles)}`);
  }
  if (c.byDesign.count) lines.push(`  left by design: ${tally(c.byDesign.forms)}`);
  return lines;
}

function addInto(total, c) {
  total.masked.count += c.masked.count;
  for (const [k, n] of c.masked.kinds) bump(total.masked.kinds, k, n);
  total.raw.count += c.raw.count;
  total.raw.maskerTakes += c.raw.maskerTakes;
  for (const key of ["kinds", "forms", "roles"]) for (const [k, n] of c.raw[key]) bump(total.raw[key], k, n);
  total.byDesign.count += c.byDesign.count;
  for (const [k, n] of c.byDesign.forms) bump(total.byDesign.forms, k, n);
}

/** The type the masker is told a file is, by its extension as freeze-capture.mjs's EXT_TYPES says (else text). */
const contentTypeOf = (file) => EXT_TYPES[/\.([a-z0-9]+)$/i.exec(file)?.[1]?.toLowerCase()] ?? "text/plain";

const toJson = (c) => ({
  masked: { count: c.masked.count, kinds: plain(c.masked.kinds) },
  raw: { count: c.raw.count, kinds: plain(c.raw.kinds), forms: plain(c.raw.forms), roles: plain(c.raw.roles), maskerTakes: c.raw.maskerTakes },
  byDesign: { count: c.byDesign.count, forms: plain(c.byDesign.forms) },
});

export function main(argv, { log = console.log, error = console.error } = {}) {
  const json = argv.includes("--json");
  const files = argv.filter((a) => a !== "--json");
  const unknown = files.filter((a) => a.startsWith("--"));
  if (!files.length || unknown.length) {
    error(`address-kinds: ${unknown.length ? `unknown option ${unknown[0]}` : "no file given"}\nusage: node scripts/address-kinds.mjs <file>... [--json]`);
    return 2;
  }
  const total = { masked: { count: 0, kinds: new Map() }, raw: { count: 0, kinds: new Map(), forms: new Map(), roles: new Map(), maskerTakes: 0 }, byDesign: { count: 0, forms: new Map() } };
  const results = [];
  const unreadable = [];
  for (const file of files) {
    let bytes;
    try {
      bytes = readFileSync(file);
    } catch (err) {
      error(`address-kinds: cannot read ${file}: ${err.code ?? "error"}`);
      unreadable.push(file);
      continue;
    }
    const c = countText(bytes.toString("utf8"), bytes, contentTypeOf(file));
    results.push({ file, c });
    addInto(total, c);
    if (!json) for (const line of block(file, c)) log(line);
    if (c.raw.count) {
      error(`address-kinds: WARNING: ${file} holds ${c.raw.count} address-shaped string(s) outside the forms the masker leaves by design (${tally(c.raw.kinds)}): read them before the capture is cited`);
    }
  }
  if (json) {
    log(JSON.stringify({ files: results.map(({ file, c }) => ({ file, ...toJson(c) })), total: { files: results.length, ...toJson(total) }, unreadable }, null, 2));
  } else {
    for (const line of block(`total, ${results.length} file(s)`, total)) log(line);
  }
  if (unreadable.length) return 1;
  return total.raw.count ? 3 : 0;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) process.exitCode = main(process.argv.slice(2));
