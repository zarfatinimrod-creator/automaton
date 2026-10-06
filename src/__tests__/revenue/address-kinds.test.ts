import { spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { afterAll, describe, expect, it } from "vitest";

/**
 * scripts/address-kinds.mjs (logs/CHANNEL_LOOP.md §9, tick 52 item 1 = tick 50 item 3): counts the address-shaped
 * strings in files by form, domain kind and local-part role, and never prints one. Every address, local part and
 * domain below is assembled from its parts at run time, so none is written in this file; each test then searches the
 * whole output for those parts.
 */

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const SCRIPT = join(ROOT, "scripts", "address-kinds.mjs");
const scratch = mkdtempSync(join(tmpdir(), "address-kinds-test-"));
afterAll(() => rmSync(scratch, { recursive: true, force: true }));

const AT = String.fromCharCode(64);
const at = (local: string, domain: string, sign = AT) => [local, domain].join(sign);
const mask = (domain: string) => at("[redacted:email]", domain);
// The parts, each a string the output must never hold.
const PERSON = ["fixture", "person"].join(".");
const FREE = ["gmail", "com"].join(".");
const GOV = ["agency", "gov"].join(".");
const UNI = ["physics", "uni", "edu"].join(".");
const LISTS = ["lists", "project", "org"].join(".");
const ROLE = ["sup", "port"].join("");
const HANDLE = ["some", "handle"].join(".");

let n = 0;
function file(name: string, text: string | Buffer): string {
  const dir = join(scratch, `f${(n += 1)}`);
  mkdirSync(dir, { recursive: true });
  const path = join(dir, name);
  writeFileSync(path, text);
  return path;
}
function run(...args: string[]) {
  const r = spawnSync(process.execPath, [SCRIPT, ...args], { cwd: ROOT, encoding: "utf8" });
  return { code: r.status, out: r.stdout, err: r.stderr, all: `${r.stdout}\n${r.stderr}` };
}
/** Cloudflare's email protection as a page carries it: a key byte, then the address's bytes XORed with it, in hex. */
function cloudflare(address: string, key = 0x42): string {
  const bytes = Buffer.from(address, "utf8");
  return [key, ...bytes.map((b) => b ^ key)].map((b) => b.toString(16).padStart(2, "0")).join("");
}
const never = (all: string, parts: string[]) => {
  for (const p of parts) expect(all, "the output holds a part of an address").not.toContain(p);
};

describe("address-kinds.mjs", () => {
  it("counts masks by kind and a plain raw address by form, kind and role; exit 3; prints no part of either", () => {
    const path = file("page.txt", `Write to ${mask(GOV)} or ${mask(UNI)}.\nOr, still raw, ${at(PERSON, FREE)} today.\n`);
    const r = run(path);
    expect(r.code, r.all).toBe(3);
    expect(r.out).toContain(`${path}: masked 2 (government 1, organisation or university 1); raw 1 (free-mail provider 1); left by design 0`);
    expect(r.out).toContain("  raw by form: plain 1; the masker takes 1 of them");
    expect(r.out).toContain("  raw by local-part role: other 1");
    expect(r.out).toContain("total, 1 file(s): masked 2 (government 1, organisation or university 1); raw 1 (free-mail provider 1)");
    expect(r.err).toMatch(/WARNING: .*page\.txt holds 1 address-shaped string/);
    never(r.all, [at(PERSON, FREE), PERSON, FREE, GOV, UNI, "fixture", "gmail"]);
  });

  it("counts each form the masker leaves by design, and exits 0 when those are all a file holds", () => {
    const esc = "\\u002F";
    const text = [
      `<img src="/img/${at("logo", "2x.png")}">`, // an asset name
      `<a href="https://${LISTS}/archive/${at("list", LISTS)}/">archive</a>`, // a local part after /
      `<a href="/share?u=https%3A%2F%2F${LISTS}%2Farchive%2F${at("list", LISTS, "%40")}">share</a>`, // after /, encoded
      `<a href="https://${at("reader:s3cret", "git.project.org")}/repo.git">git</a>`, // a URL userinfo (a password)
      `<script>u="https:${esc}${esc}${at("0123abcd", "o1.ingest.project.io")}${esc}4"</script>`, // userinfo, escaped
      `npm i ${at("react", "18.2.0")}`, // package@version
      `<a href="https:${esc}${esc}www.video.example${esc}${at("", "channel.name")}">c</a>`, // a handle after an escaped /
      `<p>\\u003e${at("", "handle.team")}</p>`, // a handle after an escaped bracket
      `<p>follow ${at("", HANDLE)} there</p>`, // a plain handle after a space
    ].join("\n");
    const r = run(file("forms.html", text));
    expect(r.code, r.all).toBe(0);
    expect(r.out).toContain("masked 0; raw 0; left by design 9");
    expect(r.out).toContain("  left by design: URL userinfo 2, asset name 1, forum handle 3, local part after / 2, package@version 1");
    expect(r.err).not.toMatch(/WARNING/);
    never(r.all, ["reader", "s3cret", "0123abcd", LISTS, "channel.name", "handle.team", HANDLE]);
  });

  it("counts a %40 address and a Cloudflare value under their own forms, with their kinds and roles (exit 3)", () => {
    const text = [
      `<a href="/contact?to=${at(ROLE, UNI, "%40")}">write</a>`,
      `<a href="/cdn-cgi/l/email-protection#${cloudflare(at(PERSON, GOV))}">[email&#160;protected]</a>`,
      `<span class="__cf_email__" data-cfemail="${cloudflare(at(ROLE, FREE), 0x17)}">[email&#160;protected]</span>`,
    ].join("\n");
    const r = run(file("encoded.html", text));
    expect(r.code, r.all).toBe(3);
    expect(r.out).toContain("raw 3 (free-mail provider 1, government 1, organisation or university 1)");
    expect(r.out).toContain("  raw by form: %40 1, Cloudflare hex 2; the masker takes 3 of them");
    expect(r.out).toContain("  raw by local-part role: other 1, role 2");
    never(r.all, [PERSON, ROLE, FREE, GOV, UNI, cloudflare(at(PERSON, GOV))]);
  });

  it("counts an address spelt in character references, a look-alike @ and an address outside ASCII as raw", () => {
    const refs = [...at(PERSON, UNI)].map((c) => `&#${c.charCodeAt(0)};`).join("");
    const text = [`<a href="mailto:${refs}">mail</a>`, at(PERSON, UNI, "\uFF20"), at(`jos\u00e9`, UNI), at(PERSON, UNI, "&commat;")].join("\n");
    const r = run(file("odd.html", text));
    expect(r.code, r.all).toBe(3);
    expect(r.out).toContain("raw 4 (organisation or university 4)");
    expect(r.out).toContain("  raw by form: character reference 1, look-alike at sign 1, other form the masker finds 1, plain 1; the masker takes 1 of them");
    never(r.all, [PERSON, UNI, "jos\u00e9"]);
  });

  it("reads a role local part with a +tag as a role", () => {
    const r = run(file("tagged.txt", `Write to ${at([ROLE, "desk"].join("+"), UNI)} today.\n`));
    expect(r.code, r.all).toBe(3);
    expect(r.out).toContain("  raw by local-part role: role 1");
    never(r.all, [ROLE, "desk", UNI]);
  });

  it("counts a mask glued to what is left of a local part outside ASCII as raw, partly masked (exit 3)", () => {
    const text = [
      `${["garc", "\u00ed"].join("")}${mask(UNI)}`, // a letter outside ASCII left before the mask
      `${["jos", "&eacute;"].join("")}${mask(UNI)}`, // a named character reference for one
      `${["mar", "&#237;"].join("")}${mask(GOV)}`, // a numeric one
      `x&nbsp;${mask(UNI)}`, // a space before the mask: masked, harmless
    ].join("\n");
    const r = run(file("partly.html", text));
    expect(r.code, r.all).toBe(3);
    expect(r.out).toContain("masked 1 (organisation or university 1); raw 3 (government 1, organisation or university 2)");
    expect(r.out).toContain("  raw by form: partly masked 3; the masker takes 0 of them");
    expect(r.out).toContain("  raw by local-part role: not read 3");
    never(r.all, ["garc", "jos", "mar", UNI, GOV]);
  });

  it("reads a binary body as the masker does: it never rewrites one, so nothing in it is taken", () => {
    const pdf = Buffer.concat([Buffer.from("%PDF-1.4\n/Author ("), Buffer.from(at(PERSON, UNI)), Buffer.from(")\n"), Buffer.from([0, 255, 10])]);
    const r = run(file("doc.pdf", pdf));
    expect(r.code, r.all).toBe(3);
    expect(r.out).toContain("  raw by form: plain 1; the masker takes 0 of them");
    never(r.all, [PERSON, UNI]);
  });

  it("exits 1 on a file it cannot read (a missing path, a directory) and still counts the others", () => {
    const clean = file("clean.txt", "nothing here\n");
    const r = run(join(scratch, "no-such-file.txt"), clean);
    expect(r.code, r.all).toBe(1);
    expect(r.err).toContain("cannot read");
    expect(r.out).toContain(`${clean}: masked 0; raw 0; left by design 0`);
    expect(run(scratch).code).toBe(1);
    expect(run().code).toBe(2);
    expect(run("--bogus", clean).code).toBe(2);
  });

  it("--json writes the same numbers as one object", () => {
    const a = file("a.txt", `${mask(GOV)} and ${at(PERSON, FREE)}\n`);
    const b = file("b.html", `<img src="${at("logo", "2x.png")}">\n`);
    const r = run(a, b, "--json");
    expect(r.code, r.all).toBe(3);
    const j = JSON.parse(r.out);
    expect(Object.keys(j)).toEqual(["files", "total", "unreadable"]);
    expect(j.files.map((f: { file: string }) => f.file)).toEqual([a, b]);
    expect(j.files[0]).toEqual({
      file: a,
      masked: { count: 1, kinds: { government: 1 } },
      raw: { count: 1, kinds: { "free-mail provider": 1 }, forms: { plain: 1 }, roles: { other: 1 }, maskerTakes: 1 },
      byDesign: { count: 0, forms: {} },
    });
    expect(j.files[1].byDesign).toEqual({ count: 1, forms: { "asset name": 1 } });
    expect(j.total).toMatchObject({ files: 2, masked: { count: 1 }, raw: { count: 1, maskerTakes: 1 }, byDesign: { count: 1 } });
    expect(j.unreadable).toEqual([]);
    never(r.all, [PERSON, FREE, GOV]);
  });

  it("over two real captures, a masked one and one with no address, exits 0 and prints no address", () => {
    const dir = join(ROOT, "research", "rendered");
    const txt = readdirSync(dir).filter((f) => f.endsWith(".txt")).sort();
    const masked = txt.find((f) => readFileSync(join(dir, f), "utf8").includes("[redacted:email]@"));
    const clean = txt.find((f) => !/[@\uFF20\uFE6B]|%40|&#0*64;|&#x0*40;|email-protection#/i.test(readFileSync(join(dir, f), "utf8")));
    expect(masked && clean).toBeTruthy();
    const r = run(join(dir, masked as string), join(dir, clean as string));
    expect(r.code, r.all).toBe(0);
    expect(r.out).toMatch(/: masked [1-9]\d* \(/);
    expect(r.all).not.toMatch(/[\p{L}\p{N}._%+-]+@[\p{L}\p{N}-]+\.[\p{L}\p{N}.-]+/u);
  });
});
