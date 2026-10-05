import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterAll, describe, expect, it } from "vitest";
import {
  domainKind,
  FOLD,
  KINDS,
  main,
  // @ts-expect-error — plain ESM script, no type declarations by design
} from "../../../scripts/remask-captures.mjs";
// @ts-expect-error — plain ESM script, no type declarations by design
import { buildMeta, redactSecrets } from "../../../scripts/render-watch.mjs";
// @ts-expect-error — plain ESM script, no type declarations by design
import { checkManifest, frozenMeta, MANIFEST, readManifest } from "../../../scripts/freeze-capture.mjs";

/**
 * scripts/remask-captures.mjs (tick 49, 5.10.2026): the one-time re-mask of the captures stored before render-watch
 * masked addresses (merge 12143ca). Every fixture is built in a temporary directory; no address is written in this file:
 * each is assembled from its parts at run time, and so is the retina asset name the mask must leave alone.
 */

const at = (local: string, domain: string) => [local, domain].join(String.fromCharCode(64));
const FREE = at("alice.person", "gmail.com"); // free-mail provider
const ORG = at("lab-office", "physics.uni.edu"); // organisation or university
const LIST = at("project-users", "googlegroups.com"); // mailing-list host
const GOV = at("helpdesk", "agency.gov"); // government
const PLACE = at("someone", "example.com"); // placeholder
const PLACE2 = at("you", "example.org"); // placeholder
const ASSET = at("logo", "2x.png"); // a retina image name, never an address
const sha = (b: Buffer | string) => createHash("sha256").update(b).digest("hex");
const lineCount = (b: Buffer) => b.toString("latin1").split("\n").length;

const scratch = mkdtempSync(join(tmpdir(), "remask-captures-test-"));
afterAll(() => rmSync(scratch, { recursive: true, force: true }));
let n = 0;

type Io = { out: string[]; log: (s: string) => void; error: (s: string) => void };
const io = (): Io => {
  const out: string[] = [];
  return { out, log: (s) => out.push(String(s)), error: (s) => out.push(String(s)) };
};
const run = (argv: string[]) => {
  const o = io();
  const code = main(argv, o);
  return { code, text: o.out.join("\n") };
};

const HTML = `<html><body>\n<h1>Contact</h1>\n<p>Write to ${FREE}</p>\n<img src="img/${ASSET}">\n<p>or the lab, ${ORG}</p>\n</body></html>\n`;
const HTML_TEXT = `Contact\nfirst line of the page\nWrite to ${FREE}\nor the lab, ${ORG}\nlast line\n`;
const QUIET_HTML = "<html><body>\n<p>No address here; see img/" + ASSET + "</p>\n</body></html>\n";
const QUIET_TEXT = "No address here\n";
const JSON_BODY = `{\n  "users": "${LIST}",\n  "support": "${GOV}",\n  "plain": "nothing"\n}\n`;
const PDF = Buffer.concat([Buffer.from("%PDF-1.4\n"), Buffer.from([0, 255, 1, 2, 10]), Buffer.from(`/Author (${PLACE})\n`), Buffer.from([0xfe, 0xff])]);
const PDF_TEXT = `Page 1\nQuestions: ${PLACE}\nPage 2\n`;
const HAND_BODY = `{"note": "kept by hand", "contact": "${PLACE2}"}\n`;

type Fixture = { root: string; dir: string; files: Map<string, Buffer>; g: (...args: string[]) => string };

function metaFor(slug: string, body: Buffer, contentType: string, ext: string, text: boolean, redacted = 0) {
  return buildMeta({
    url: `https://site.test/${slug}`,
    slug,
    fetchedAt: "2026-09-28T20:35:42.598Z",
    status: 200,
    contentType,
    byteLength: body.length,
    sha256: sha(body),
    bodyPath: `research/rendered/${slug}.${ext}`,
    textPath: text ? `research/rendered/${slug}.txt` : null,
    redacted,
  });
}
const metaText = (m: unknown) => `${JSON.stringify(m, null, 2)}\n`;

/** A research/rendered of six captures (one frozen copy with addresses, one without), a note citing two lines. */
function fixture({ git = true } = {}): Fixture {
  const root = join(scratch, `r${(n += 1)}`);
  const dir = join(root, "research/rendered");
  mkdirSync(dir, { recursive: true });
  mkdirSync(join(root, "research/measurements"), { recursive: true });
  const w = (name: string, bytes: Buffer | string) => writeFileSync(join(dir, name), bytes);

  // A live HTML capture: two addresses and an asset name in the body, the two addresses in its text.
  const page = metaFor("page", Buffer.from(HTML), "text/html; charset=utf-8", "html", true);
  w("page.html", HTML);
  w("page.txt", HTML_TEXT);
  w("page.meta.json", metaText(page));
  // Its frozen copy, as freeze-capture writes one, and a frozen copy with no address.
  const frozen = frozenMeta(page, { slug: "page", frozenSlug: "page-2026-09-28", on: "2026-09-30", commit: "abc1234", why: "cited by line" });
  w("page-2026-09-28.html", HTML);
  w("page-2026-09-28.txt", HTML_TEXT);
  w("page-2026-09-28.meta.json", metaText(frozen));
  const quietMeta = metaFor("quiet", Buffer.from(QUIET_HTML), "text/html", "html", true);
  const quietFrozen = frozenMeta(quietMeta, { slug: "quiet", frozenSlug: "quiet-2026-09-28", on: "2026-09-30", commit: "abc1234", why: "cited" });
  w("quiet-2026-09-28.html", QUIET_HTML);
  w("quiet-2026-09-28.txt", QUIET_TEXT);
  w("quiet-2026-09-28.meta.json", metaText(quietFrozen));
  // A live capture with no address at all.
  w("quiet.html", QUIET_HTML);
  w("quiet.txt", QUIET_TEXT);
  w("quiet.meta.json", metaText(quietMeta));
  // A JSON body, no text, one string already masked when it was fetched (a secret-shaped one).
  w("api.json", JSON_BODY);
  w("api.meta.json", metaText(metaFor("api", Buffer.from(JSON_BODY), "application/json; charset=utf-8", "json", false, 1)));
  // A PDF (binary, never rewritten) and its extracted text.
  w("doc.pdf", PDF);
  w("doc.txt", PDF_TEXT);
  w("doc.meta.json", metaText(metaFor("doc", PDF, "application/pdf", "pdf", true)));
  // A meta edited by hand (the AMO shape): sha256 of the body before a hand redaction, `redacted` a sentence, no final newline.
  const hand = { ...metaFor("hand", Buffer.from("the original bytes"), "application/json", "json", false), redacted: "removed by hand; sha256 is of the original body" };
  w("hand.json", HAND_BODY);
  w("hand.meta.json", JSON.stringify(hand, null, 2));

  // FROZEN.sha256 as freeze-capture writes it: every frozen file, sorted by name.
  const recorded = ["page-2026-09-28", "quiet-2026-09-28"].flatMap((s) => ["html", "meta.json", "txt"].map((e) => `${s}.${e}`)).sort();
  w(MANIFEST, recorded.map((f) => `${sha(readFileSync(join(dir, f)))}  ${f}\n`).join(""));
  w("urls.txt", "# fixture list\nhttps://site.test/page\tpage\nhttps://site.test/quiet\tquiet\n");
  // A note citing a line of the frozen copy that carries an address (3) and one that does not (2).
  writeFileSync(join(root, "research/measurements/note.md"), "The page says so at `research/rendered/page-2026-09-28.txt:3`.\nAnd its second line, research/rendered/page-2026-09-28.txt:2.\n");

  const g = (...args: string[]) => {
    const r = spawnSync("git", ["-c", "user.name=t", "-c", `user.email=${at("t", "test.invalid")}`, "-c", "commit.gpgsign=false", ...args], { cwd: root, encoding: "utf8" });
    if (r.status !== 0) throw new Error(`git ${args.join(" ")}: ${r.stderr}`);
    return r.stdout;
  };
  if (git) {
    g("init", "-q");
    g("add", "-A");
    g("commit", "-q", "-m", "fixtures");
  }
  const files = new Map<string, Buffer>(readdirSync(dir).map((f) => [f, readFileSync(join(dir, f))]));
  return { root, dir, files, g };
}
const snapshot = (dir: string) => new Map<string, Buffer>(readdirSync(dir).map((f) => [f, readFileSync(join(dir, f))]));
const unchanged = (f: Fixture, names: string[]) => names.filter((name) => !readFileSync(join(f.dir, name)).equals(f.files.get(name) as Buffer));
const meta = (f: Fixture, slug: string) => JSON.parse(readFileSync(join(f.dir, `${slug}.meta.json`), "utf8"));
const rendered = (f: Fixture) => ["--rendered", f.dir];

describe("domainKind", () => {
  it("sorts a kept domain into one of the five kinds, organisation or university when nothing else fits", () => {
    expect(KINDS).toEqual(["free-mail provider", "organisation or university", "mailing-list host", "government", "placeholder"]);
    for (const d of ["gmail.com", "GMAIL.COM", "googlemail.com", "outlook.com", "hotmail.co.uk", "yahoo.com", "proton.me", "icloud.com", "qq.com", "walla.co.il"]) {
      expect(domainKind(d), d).toBe("free-mail provider");
    }
    for (const d of ["googlegroups.com", "groups.io", "lists.debian.org", "lists.sourceforge.net"]) expect(domainKind(d), d).toBe("mailing-list host");
    for (const d of ["agency.gov", "lbl.gov", "digital.gov.il", "service.gov.uk", "army.mil", "ec.europa.eu"]) expect(domainKind(d), d).toBe("government");
    for (const d of ["example.com", "example.org", "mail.example.net", "site.example", "addons.local", "local.extension", "your-project.iam.gserviceaccount.com"]) {
      expect(domainKind(d), d).toBe("placeholder");
    }
    for (const d of ["physics.uni.edu", "stripe.com", "unesco.org", "displate.com", "gmail.com.evil.org", "mygmail.com"]) {
      expect(domainKind(d), d).toBe("organisation or university");
    }
  });
});

describe("--dry-run", () => {
  it("counts the files and addresses by domain kind, names the cited lines that would change, writes nothing, and exits 3", () => {
    const f = fixture();
    const { code, text } = run(["--dry-run", ...rendered(f)]);
    expect(code).toBe(3);
    expect(snapshot(f.dir)).toEqual(f.files);
    // page: 2 in the body, 2 in the text; its frozen copy the same; api 2; doc's text 1; hand 1.
    expect(text).toContain("would change: 5 captures, 7 files (2 .html, 3 .txt, 2 .json); 12 addresses masked");
    expect(text).toContain("by domain kind: free-mail provider 4, organisation or university 4, mailing-list host 1, government 1, placeholder 2");
    expect(text).toContain("frozen copies among them: 1 capture (2 files; their lines in FROZEN.sha256, metas included)");
    expect(text).toContain("asset names masked: 0");
    expect(text).toMatch(/^ {2}page: body \+2 \(page\.html\), text \+2 \(page\.txt\)$/m);
    expect(text).toMatch(/^ {2}page-2026-09-28 \(frozen\): body \+2 \(page-2026-09-28\.html\), text \+2 \(page-2026-09-28\.txt\)$/m);
    expect(text).toMatch(/^ {2}doc: body unchanged, text \+1 \(doc\.txt\)$/m);
    expect(text).toMatch(/^ {2}api: body \+2 \(api\.json\)$/m);
    expect(text).not.toMatch(/^ {2}quiet/m);
    expect(text).toContain("unchanged: 2 captures");
    // Only line 3 of the cited copy carries an address; line 2 is cited too and does not change.
    expect(text).toContain("cited lines that would change: 1 (1 citation)");
    expect(text).toContain("research/rendered/page-2026-09-28.txt:3 → cited by research/measurements/note.md:1");
    expect(text).not.toContain("page-2026-09-28.txt:2 →");
    // Never an address, and never a kept domain: kinds and counts only.
    expect(text).not.toMatch(/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[a-z]{2,}/);
    expect(text).not.toMatch(/gmail|uni\.edu|googlegroups|agency\.gov/);
  });

  it("counts a mask that took an asset name for an address, which is how a masker regression would show", () => {
    const f = fixture();
    // A faulty masker: redactSecrets, and then the retina image name masked as if it were an address.
    const faulty = (bytes: Buffer, contentType: string) => {
      const r = redactSecrets(bytes, contentType) as { bytes: Buffer; count: number };
      const text = r.bytes ? r.bytes.toString("latin1") : "";
      if (!r.bytes || !text.includes(ASSET)) return r;
      return { bytes: Buffer.from(text.split(ASSET).join("[redacted:email]@2x.png"), "latin1"), count: r.count + text.split(ASSET).length - 1 };
    };
    const o = io();
    expect(main(["--dry-run", ...rendered(f)], { ...o, redact: faulty })).toBe(3);
    // page.html, quiet.html and their two frozen copies each carry the asset name once.
    expect(o.out.join("\n")).toContain("asset names masked: 4");
    expect(snapshot(f.dir)).toEqual(f.files);
  });

  it("reads only the --only captures", () => {
    const f = fixture();
    const { code, text } = run(["--dry-run", ...rendered(f), "--only", "api", "doc"]);
    expect(code).toBe(3);
    expect(text).toContain("would change: 2 captures, 2 files (1 .txt, 1 .json); 3 addresses masked");
    expect(run(["--dry-run", ...rendered(f), "--only", "quiet"]).code).toBe(0);
    expect(run(["--dry-run", ...rendered(f), "--only", "no-such-capture"]).code).toBe(1);
  });
});

describe("--apply", () => {
  it("masks bodies and texts in place, rewrites the metas and FROZEN.sha256 for exactly what changed, and moves no line", () => {
    const f = fixture();
    const before = new Map(f.files);
    const { code, text } = run(["--apply", "--date", "2026-10-05", ...rendered(f)]);
    expect(code, text).toBe(0);
    expect(text).toContain("changed: 5 captures, 7 files (2 .html, 3 .txt, 2 .json); 12 addresses masked");
    expect(text).toContain("cited lines that changed: 1 (1 citation)");
    expect(text).toContain("research/rendered/page-2026-09-28.txt:3 → cited by research/measurements/note.md:1");

    const now = snapshot(f.dir);
    const changedNames = [...now.keys()].filter((name) => !(now.get(name) as Buffer).equals(before.get(name) as Buffer)).sort();
    expect(changedNames).toEqual([
      MANIFEST,
      "api.json",
      "api.meta.json",
      "doc.meta.json",
      "doc.txt",
      "hand.json",
      "hand.meta.json",
      "page-2026-09-28.html",
      "page-2026-09-28.meta.json",
      "page-2026-09-28.txt",
      "page.html",
      "page.meta.json",
      "page.txt",
    ]);
    expect([...now.keys()].sort()).toEqual([...before.keys()].sort());

    // Masked inline: the same number of lines in every changed capture file, the mask where each address was.
    for (const name of changedNames.filter((x) => !x.endsWith(".meta.json") && x !== MANIFEST)) {
      expect(lineCount(now.get(name) as Buffer), name).toBe(lineCount(before.get(name) as Buffer));
    }
    const html = readFileSync(join(f.dir, "page.html"), "utf8");
    expect(html).toBe(HTML.replace(FREE, "[redacted:email]@gmail.com").replace(ORG, "[redacted:email]@physics.uni.edu"));
    expect(html).toContain(`img/${ASSET}`);
    expect(readFileSync(join(f.dir, "page.txt"), "utf8")).toBe(HTML_TEXT.replace(FREE, "[redacted:email]@gmail.com").replace(ORG, "[redacted:email]@physics.uni.edu"));
    expect(readFileSync(join(f.dir, "page-2026-09-28.html"))).toEqual(readFileSync(join(f.dir, "page.html")));
    expect(readFileSync(join(f.dir, "api.json"), "utf8")).toBe(JSON_BODY.replace(LIST, "[redacted:email]@googlegroups.com").replace(GOV, "[redacted:email]@agency.gov"));
    expect(readFileSync(join(f.dir, "doc.txt"), "utf8")).toBe(PDF_TEXT.replace(PLACE, "[redacted:email]@example.com"));
    // The binary body and the addressless captures are the same bytes.
    expect(unchanged(f, ["doc.pdf", "quiet.html", "quiet.txt", "quiet.meta.json", "quiet-2026-09-28.html", "quiet-2026-09-28.txt", "quiet-2026-09-28.meta.json", "urls.txt"])).toEqual([]);

    // The metas: sha256 and byteLength of the new body, redacted grown by the masks, remasked added; nothing else.
    const remasked = (addresses: number) => ({ on: "2026-10-05", addresses, fold: FOLD });
    const pageMeta = meta(f, "page");
    const oldPage = JSON.parse((before.get("page.meta.json") as Buffer).toString("utf8"));
    expect(pageMeta.sha256).toBe(sha(readFileSync(join(f.dir, "page.html"))));
    expect(pageMeta.byteLength).toBe(readFileSync(join(f.dir, "page.html")).length);
    expect(pageMeta.redacted).toBe(4);
    expect(pageMeta.remasked).toEqual(remasked(4));
    const { sha256: s1, byteLength: b1, redacted: r1, remasked: m1, ...restNew } = pageMeta;
    const { sha256: s0, byteLength: b0, ...restOld } = oldPage;
    expect([s1 !== s0, b1 !== b0, r1, m1.addresses]).toEqual([true, true, 4, 4]);
    expect(restNew).toEqual(restOld);
    // Key order as buildMeta writes it: redacted after truncated, and remasked right after redacted.
    const keys = Object.keys(pageMeta);
    expect(keys.slice(keys.indexOf("truncated"), keys.indexOf("truncated") + 4)).toEqual(["truncated", "redacted", "remasked", "error"]);
    expect(keys.filter((k) => k !== "redacted" && k !== "remasked")).toEqual(Object.keys(oldPage));
    expect(readFileSync(join(f.dir, "page.meta.json"), "utf8")).toBe(`${JSON.stringify(pageMeta, null, 2)}\n`);

    // The frozen copy's meta the same way, its frozen block untouched.
    const frozenNow = meta(f, "page-2026-09-28");
    expect(frozenNow.sha256).toBe(sha(readFileSync(join(f.dir, "page-2026-09-28.html"))));
    expect(frozenNow.remasked).toEqual(remasked(4));
    expect(frozenNow.frozen).toEqual(JSON.parse((before.get("page-2026-09-28.meta.json") as Buffer).toString("utf8")).frozen);
    expect(Object.keys(frozenNow).at(-1)).toBe("frozen");

    // A PDF's body did not change, so its sha256 and byteLength stay; its text's mask is counted.
    const docMeta = meta(f, "doc");
    expect([docMeta.sha256, docMeta.byteLength]).toEqual([sha(PDF), PDF.length]);
    expect(docMeta.redacted).toBe(1);
    expect(docMeta.remasked).toEqual(remasked(1));
    // A meta that already counted a mask: redacted grows by the new ones, and remasked follows it where it stood.
    const apiMeta = meta(f, "api");
    expect(apiMeta.sha256).toBe(sha(readFileSync(join(f.dir, "api.json"))));
    expect([apiMeta.redacted, apiMeta.remasked]).toEqual([3, remasked(2)]);
    expect(Object.keys(apiMeta).slice(Object.keys(apiMeta).indexOf("redacted") - 1, Object.keys(apiMeta).indexOf("redacted") + 3)).toEqual(["truncated", "redacted", "remasked", "error"]);

    // The hand-edited meta: its sha256 was of the original body, not the stored one, and stays so; its sentence stays.
    const handText = readFileSync(join(f.dir, "hand.meta.json"), "utf8");
    const handMeta = JSON.parse(handText);
    const handOld = JSON.parse((before.get("hand.meta.json") as Buffer).toString("utf8"));
    expect([handMeta.sha256, handMeta.byteLength, handMeta.redacted]).toEqual([handOld.sha256, handOld.byteLength, handOld.redacted]);
    expect(handMeta.remasked).toEqual(remasked(1));
    expect(handText.endsWith("\n")).toBe(false);

    // FROZEN.sha256: the changed frozen files' lines carry their new hashes; every other line byte for byte.
    expect(checkManifest(f.dir)).toEqual([]);
    const oldLines = (before.get(MANIFEST) as Buffer).toString("utf8").split("\n");
    const newLines = readFileSync(join(f.dir, MANIFEST), "utf8").split("\n");
    expect(newLines.length).toBe(oldLines.length);
    const moved = newLines.filter((line, i) => line !== oldLines[i]).map((line) => line.slice(66));
    expect(moved).toEqual(["page-2026-09-28.html", "page-2026-09-28.meta.json", "page-2026-09-28.txt"]);
    expect(readManifest(f.dir).get("page-2026-09-28.txt")).toBe(sha(readFileSync(join(f.dir, "page-2026-09-28.txt"))));

    // Idempotent: a second --apply (after the commit) changes nothing, and a dry run then finds nothing.
    f.g("add", "-A");
    f.g("commit", "-q", "-m", "remasked");
    const again = snapshot(f.dir);
    expect(run(["--apply", "--date", "2026-10-06", ...rendered(f)]).code).toBe(0);
    expect(snapshot(f.dir)).toEqual(again);
    expect(run(["--dry-run", ...rendered(f)]).code).toBe(0);
  });

  it("refuses a capture with uncommitted changes it would touch, writing nothing, and does not mind one it would not touch", () => {
    const f = fixture();
    writeFileSync(join(f.dir, "api.json"), `${JSON_BODY} `);
    const dirty = snapshot(f.dir);
    const { code, text } = run(["--apply", "--date", "2026-10-05", ...rendered(f)]);
    expect(code).toBe(1);
    expect(text).toContain("api.json");
    expect(snapshot(f.dir)).toEqual(dirty);

    // A file of a capture it touches, though it would not rewrite that file: the PDF beside a text it masks.
    const p = fixture();
    writeFileSync(join(p.dir, "doc.pdf"), Buffer.concat([PDF, Buffer.from("x")]));
    const dirtyPdf = snapshot(p.dir);
    const refused = run(["--apply", "--date", "2026-10-05", ...rendered(p)]);
    expect(refused.code).toBe(1);
    expect(refused.text).toContain("doc.pdf");
    expect(snapshot(p.dir)).toEqual(dirtyPdf);

    const g = fixture();
    writeFileSync(join(g.dir, "quiet.txt"), "edited by hand\n");
    expect(run(["--apply", "--date", "2026-10-05", ...rendered(g)]).code).toBe(0);
    expect(readFileSync(join(g.dir, "quiet.txt"), "utf8")).toBe("edited by hand\n");
    expect(meta(g, "api").remasked.addresses).toBe(2);
  });

  it("refuses a dirty FROZEN.sha256 when a frozen copy would change", () => {
    const f = fixture();
    writeFileSync(join(f.dir, MANIFEST), `${(f.files.get(MANIFEST) as Buffer).toString("utf8")}\n`);
    const dirty = snapshot(f.dir);
    expect(run(["--apply", "--date", "2026-10-05", ...rendered(f)]).code).toBe(1);
    expect(snapshot(f.dir)).toEqual(dirty);
  });

  it("refuses a meta naming a body or a text that does not exist, writing nothing", () => {
    for (const missing of ["api.json", "page.txt"]) {
      const f = fixture();
      rmSync(join(f.dir, missing));
      f.g("add", "-A");
      f.g("commit", "-q", "-m", `lose ${missing}`);
      const was = snapshot(f.dir);
      for (const argv of [["--dry-run"], ["--apply", "--date", "2026-10-05"]]) {
        const { code, text } = run([...argv, ...rendered(f)]);
        expect(code, missing).toBe(1);
        expect(text).toContain(missing);
      }
      expect(snapshot(f.dir)).toEqual(was);
    }
  });

  it("refuses a directory under no git repository, an --apply without a --date, and two modes at once", () => {
    const f = fixture({ git: false });
    expect(run(["--dry-run", ...rendered(f)]).code).toBe(1);
    expect(run(["--apply", "--date", "2026-10-05", ...rendered(f)]).code).toBe(1);
    expect(snapshot(f.dir)).toEqual(f.files);
    const g = fixture();
    expect(run(["--apply", ...rendered(g)]).code).toBe(1);
    expect(run(["--apply", "--date", "2026-13-01", ...rendered(g)]).code).toBe(1);
    expect(run(["--apply", "--dry-run", "--date", "2026-10-05", ...rendered(g)]).code).toBe(1);
    expect(run(["--apply", "--date", "2026-10-05", ...rendered(g), "stray"]).code).toBe(1);
    expect(snapshot(g.dir)).toEqual(g.files);
  });

  it("refuses a mask that would move a line (a multi-line secret), writing nothing", () => {
    const f = fixture();
    const dash = "-".repeat(5);
    const block = `${dash}BEGIN PRIVATE KEY${dash}\nAAAA\nBBBB\n${dash}END PRIVATE KEY${dash}`;
    writeFileSync(join(f.dir, "api.json"), `${JSON_BODY}${block}\n`);
    f.g("add", "-A");
    f.g("commit", "-q", "-m", "a key in a body");
    const was = snapshot(f.dir);
    const { code, text } = run(["--apply", "--date", "2026-10-05", ...rendered(f)]);
    expect(code).toBe(1);
    expect(text).toContain("api.json: masking would move a line");
    expect(snapshot(f.dir)).toEqual(was);
  });

  it("refuses FROZEN.sha256 that already disagrees with a frozen file it would rewrite", () => {
    const f = fixture();
    const lines = (f.files.get(MANIFEST) as Buffer).toString("utf8").replace(/^[0-9a-f]{64}(?= {2}page-2026-09-28\.txt$)/m, "0".repeat(64));
    writeFileSync(join(f.dir, MANIFEST), lines);
    f.g("add", "-A");
    f.g("commit", "-q", "-m", "a stale manifest line");
    const was = snapshot(f.dir);
    const { code, text } = run(["--apply", "--date", "2026-10-05", ...rendered(f)]);
    expect(code).toBe(1);
    expect(text).toContain("page-2026-09-28.txt");
    expect(snapshot(f.dir)).toEqual(was);
  });
});

describe("review fixes (tick 49): unclaimed files, stale pins, --except, the documented refusals", () => {
  const commit = (f: Fixture, message: string) => {
    f.g("add", "-A");
    f.g("commit", "-q", "-m", message);
  };
  const w = (f: Fixture, name: string, bytes: Buffer | string) => writeFileSync(join(f.dir, name), bytes);

  it("masks a capture's files that no meta path names (an earlier fetch beside a failed one, a hand extraction), leaving sha256 and byteLength", () => {
    const f = fixture({ git: false });
    // A failed fetch: the meta names no body and no text, and the earlier fetch's html and text still sit beside it.
    const OLD_HTML = `<html>\n<p>Reports: ${GOV}</p>\n</html>\n`;
    const OLD_TEXT = `Reports\n${GOV}\nend\n`;
    const old = buildMeta({
      url: "https://site.test/old",
      slug: "old",
      fetchedAt: "2026-09-28T13:15:46.900Z",
      status: 503,
      contentType: "text/html; charset=utf-8",
      error: "HTTP 503 Service Unavailable",
      previousMeta: { sha256: sha(OLD_HTML) },
    });
    w(f, "old.html", OLD_HTML);
    w(f, "old.txt", OLD_TEXT);
    w(f, "old.meta.json", metaText(old));
    // Binary files no meta names: a .pdf and a .bin are left as they are, whatever they hold.
    const OLD_PDF = Buffer.concat([Buffer.from(`%PDF-1.4\n/Author (${GOV})\n`), Buffer.from([0, 255])]);
    const OLD_BIN = Buffer.concat([Buffer.from([0, 1, 2]), Buffer.from(`var a="${GOV}";\n`)]);
    w(f, "old.pdf", OLD_PDF);
    w(f, "old.bin", OLD_BIN);
    // A PDF whose meta has no textPath, and a text extracted by hand beside it.
    const scanText = `Guidance\nWrite to ${ORG}\n`;
    w(f, "scan.pdf", PDF);
    w(f, "scan.txt", scanText);
    w(f, "scan.meta.json", metaText(metaFor("scan", PDF, "application/pdf", "pdf", false)));
    // urls.txt is no capture: an address in it is not this script's to mask.
    w(f, "urls.txt", `# fixture list, questions to ${FREE}\nhttps://site.test/page\tpage\n`);
    for (const a of [["init", "-q"], ["add", "-A"], ["commit", "-q", "-m", "fixtures"]]) f.g(...a);
    const before = snapshot(f.dir);

    const dry = run(["--dry-run", ...rendered(f), "--only", "old", "scan"]);
    expect(dry.code, dry.text).toBe(3);
    // In freeze-capture's CAPTURE_EXTS order.
    expect(dry.text).toMatch(/^ {2}old: other \+1 \(old\.txt\), other \+1 \(old\.html\)$/m);
    expect(dry.text).toMatch(/^ {2}scan: body unchanged, other \+1 \(scan\.txt\)$/m);
    expect(dry.text).toContain("would change: 2 captures, 3 files (1 .html, 2 .txt); 3 addresses masked");
    expect(dry.text).toContain("files no meta path names, masked as well: 3 (3 addresses)");
    // The failed fetch's meta keeps previousSha256, the hash of the html as it was: a pin the re-mask makes stale.
    expect(dry.text).toMatch(/^ {4}research\/rendered\/old\.meta\.json:\d+ → old sha256 of research\/rendered\/old\.html$/m);
    expect(snapshot(f.dir)).toEqual(before);

    const { code, text } = run(["--apply", "--date", "2026-10-05", ...rendered(f)]);
    expect(code, text).toBe(0);
    expect(readFileSync(join(f.dir, "old.html"), "utf8")).toBe(OLD_HTML.replace(GOV, "[redacted:email]@agency.gov"));
    expect(readFileSync(join(f.dir, "old.txt"), "utf8")).toBe(OLD_TEXT.replace(GOV, "[redacted:email]@agency.gov"));
    expect(readFileSync(join(f.dir, "scan.txt"), "utf8")).toBe(scanText.replace(ORG, "[redacted:email]@physics.uni.edu"));
    expect(unchanged({ ...f, files: before }, ["scan.pdf", "urls.txt", "old.pdf", "old.bin"])).toEqual([]);
    const oldMeta = meta(f, "old");
    expect([oldMeta.sha256, oldMeta.byteLength, oldMeta.previousSha256]).toEqual([null, 0, sha(OLD_HTML)]);
    expect([oldMeta.redacted, oldMeta.remasked]).toEqual([2, { on: "2026-10-05", addresses: 2, fold: FOLD }]);
    const scanMeta = meta(f, "scan");
    expect([scanMeta.sha256, scanMeta.byteLength, scanMeta.redacted, scanMeta.remasked.addresses]).toEqual([sha(PDF), PDF.length, 1, 1]);
    const { redacted: _r, remasked: _m, ...oldRest } = oldMeta;
    expect(oldRest).toEqual(old);
    commit(f, "remasked");
    expect(run(["--dry-run", ...rendered(f)]).code).toBe(0);
  });

  it("lists the hash and byte-count pins the rewrite makes stale, outside the captures and logs/", () => {
    const f = fixture();
    const apiOld = sha(f.files.get("api.json") as Buffer);
    const quietSha = sha(QUIET_HTML);
    mkdirSync(join(f.root, "logs"), { recursive: true });
    writeFileSync(join(f.root, "logs/2026-09-30-old.md"), `history: api.json was ${apiOld.slice(0, 12)}\n`);
    writeFileSync(
      join(f.root, "research/measurements/pins.md"),
      [
        "# Pins",
        `The api capture, sha256 \`${apiOld.slice(0, 8)}…\`.`,
        `\`page.html\`: ${Buffer.byteLength(HTML)} bytes, one page.`,
        `An unrelated ${apiOld.slice(0, 7)} (too short) and the quiet copy's ${quietSha.slice(0, 12)} (unchanged).`,
        `A longer hex that only starts the same way: ${apiOld.slice(0, 8)}0123456789.`,
        "",
      ].join("\n"),
    );
    const { code, text } = run(["--dry-run", ...rendered(f)]);
    expect(code, text).toBe(3);
    expect(text).toContain("pins that go stale: 2");
    expect(text).toMatch(/^ {4}research\/measurements\/pins\.md:2 → old sha256 of research\/rendered\/api\.json$/m);
    expect(text).toMatch(/^ {4}research\/measurements\/pins\.md:3 → old byte count of research\/rendered\/page\.html$/m);
    expect(text).not.toContain("logs/");
    expect(text).not.toContain("pins.md:4");
    expect(text).not.toContain("pins.md:5");
  });

  it("leaves out the --except captures, refuses an unknown one, and counts a slug given twice once", () => {
    const f = fixture();
    expect(run(["--dry-run", ...rendered(f), "--only", "api", "api"]).text).toContain("would change: 1 capture, 1 file (1 .json); 2 addresses masked");
    expect(run(["--dry-run", ...rendered(f), "--except", "no-such-capture"]).code).toBe(1);
    const dry = run(["--dry-run", ...rendered(f), "--except", "page-2026-09-28", "doc"]);
    expect(dry.code, dry.text).toBe(3);
    expect(dry.text).toContain("left out by --except: 2 captures (doc, page-2026-09-28)");
    expect(dry.text).toContain("would change: 3 captures, 4 files (1 .html, 1 .txt, 2 .json); 7 addresses masked");
    expect(run(["--dry-run", ...rendered(f), "--only", "api", "--except", "api"]).code).toBe(0);

    const { code, text } = run(["--apply", "--date", "2026-10-05", ...rendered(f), "--except", "page-2026-09-28"]);
    expect(code, text).toBe(0);
    expect(unchanged(f, ["page-2026-09-28.html", "page-2026-09-28.txt", "page-2026-09-28.meta.json", MANIFEST])).toEqual([]);
    expect(readFileSync(join(f.dir, "page.html"), "utf8")).not.toContain(FREE);
  });

  it("refuses a meta it would rewrite that is not written as render-watch writes one (four spaces), writing nothing", () => {
    const f = fixture();
    w(f, "api.meta.json", `${JSON.stringify(meta(f, "api"), null, 4)}\n`);
    w(f, "quiet.meta.json", `${JSON.stringify(meta(f, "quiet"), null, 4)}\n`);
    commit(f, "four spaces");
    const was = snapshot(f.dir);
    for (const argv of [["--dry-run"], ["--apply", "--date", "2026-10-05"]]) {
      const { code, text } = run([...argv, ...rendered(f)]);
      expect(code).toBe(1);
      expect(text).toContain("api.meta.json is not written as render-watch writes a meta");
      // A capture with nothing to mask is not rewritten, so its meta's indentation is not this script's business.
      expect(text).not.toContain("quiet.meta.json");
    }
    expect(snapshot(f.dir)).toEqual(was);
  });

  it("masks a file named by both bodyPath and textPath once, as the body", () => {
    const f = fixture();
    const PLAIN = `A plain page\nmail ${FREE} here\n`;
    w(f, "plain.txt", PLAIN);
    w(f, "plain.meta.json", metaText(metaFor("plain", Buffer.from(PLAIN), "text/plain; charset=utf-8", "txt", true)));
    commit(f, "a text/plain capture");
    expect(meta(f, "plain").bodyPath).toBe(meta(f, "plain").textPath);
    const dry = run(["--dry-run", ...rendered(f), "--only", "plain"]);
    expect(dry.text).toMatch(/^ {2}plain: body \+1 \(plain\.txt\)$/m);
    expect(dry.text).toContain("would change: 1 capture, 1 file (1 .txt); 1 address masked");
    expect(run(["--apply", "--date", "2026-10-05", ...rendered(f), "--only", "plain"]).code).toBe(0);
    const m = meta(f, "plain");
    expect([m.redacted, m.remasked.addresses]).toEqual([1, 1]);
    expect(m.sha256).toBe(sha(readFileSync(join(f.dir, "plain.txt"))));
    expect(readFileSync(join(f.dir, "plain.txt"), "utf8")).toBe(PLAIN.replace(FREE, "[redacted:email]@gmail.com"));
  });

  it("refuses a frozen copy's file that FROZEN.sha256 does not record", () => {
    const f = fixture();
    const kept = (f.files.get(MANIFEST) as Buffer).toString("utf8").split("\n").filter((l) => !l.endsWith("  page-2026-09-28.txt"));
    w(f, MANIFEST, kept.join("\n"));
    commit(f, "a frozen file unrecorded");
    const was = snapshot(f.dir);
    for (const argv of [["--dry-run"], ["--apply", "--date", "2026-10-05"]]) {
      const { code, text } = run([...argv, ...rendered(f)]);
      expect(code).toBe(1);
      expect(text).toContain("page-2026-09-28.txt is a frozen copy's file that FROZEN.sha256 does not record");
    }
    expect(snapshot(f.dir)).toEqual(was);
  });

  it("checks a citation written without an extension against the .txt and the .html", () => {
    const f = fixture();
    writeFileSync(join(f.root, "research/measurements/bare.md"), "The page, research/rendered/page-2026-09-28 line 5.\n");
    const { text } = run(["--dry-run", ...rendered(f)]);
    // Line 5 of the text is its last line, unchanged; line 5 of the html holds the lab's address.
    expect(text).toContain("research/rendered/page-2026-09-28.html:5 → cited by research/measurements/bare.md:1");
    expect(text).not.toContain("page-2026-09-28.txt:5 →");
  });

  it("re-masks a re-masked capture in place: one remasked where it stood, its addresses accumulated, redacted grown again", () => {
    const f = fixture();
    expect(run(["--apply", "--date", "2026-10-05", ...rendered(f)]).code).toBe(0);
    // A new address in doc.txt (the PDF's text), on a line that had none.
    w(f, "doc.txt", readFileSync(join(f.dir, "doc.txt"), "utf8").replace("Page 2", `Page 2 ${LIST}`));
    commit(f, "remasked, then a new address");
    expect(run(["--apply", "--date", "2026-10-06", ...rendered(f), "--only", "doc"]).code).toBe(0);
    const m = meta(f, "doc");
    // 1 address on the first run, 1 now: the block keeps the sum and takes the new date.
    expect([m.redacted, m.remasked]).toEqual([2, { on: "2026-10-06", addresses: 2, fold: FOLD }]);
    const keys = Object.keys(m);
    expect(keys.slice(keys.indexOf("truncated"), keys.indexOf("truncated") + 4)).toEqual(["truncated", "redacted", "remasked", "error"]);
  });

  it("counts a secret-shaped string in redacted but not in remasked.addresses", () => {
    const f = fixture();
    const key = ["sk", "live", "0123456789abcdefXYZ"].join("_");
    const S = `Secrets page\nkey ${key}\nmail ${FREE}\n`;
    w(f, "sec.txt", S);
    w(f, "sec.meta.json", metaText(metaFor("sec", Buffer.from(S), "text/plain", "txt", true)));
    commit(f, "a secret in an old capture");
    const dry = run(["--dry-run", ...rendered(f), "--only", "sec"]);
    expect(dry.text).toContain("1 address masked");
    expect(dry.text).toContain("secret-shaped strings masked as well: 1");
    expect(run(["--apply", "--date", "2026-10-05", ...rendered(f), "--only", "sec"]).code).toBe(0);
    const m = meta(f, "sec");
    expect([m.redacted, m.remasked.addresses]).toEqual([2, 1]);
    expect(readFileSync(join(f.dir, "sec.txt"), "utf8")).not.toContain(key);
  });
});

describe("tick 50: the encoded forms on captures re-masked on 5.10, and remasked accumulated", () => {
  const commit = (f: Fixture, message: string) => {
    f.g("add", "-A");
    f.g("commit", "-q", "-m", message);
  };
  const w = (f: Fixture, name: string, bytes: Buffer | string) => writeFileSync(join(f.dir, name), bytes);
  // Built at run time like every address here: one with its @ as %40, one as Cloudflare's hex (key, then XOR).
  const PCT = ["%", "40"].join("");
  const ENC = ["sam.person", "gmail.com"].join(PCT); // free-mail provider
  const cf = (address: string, key = 0x42) =>
    [key, ...Buffer.from(address, "utf8").map((b) => b ^ key)].map((b) => b.toString(16).padStart(2, "0")).join("");
  const CF = cf(at("press", "agency.gov")); // government
  const encode = (html: string) =>
    html
      .replace("<h1>Contact</h1>", `<h1>Contact <a href="/r?u=${ENC}">us</a></h1>`)
      .replace("<p>or the lab,", `<p><span class="__cf_email__" data-cfemail="${CF}">[email&#160;protected]</span> or the lab,`);

  it("counts them by domain kind in a dry run, then re-masks: remasked keeps one block, its addresses the sum, on the new date", () => {
    const f = fixture();
    expect(run(["--apply", "--date", "2026-10-05", ...rendered(f)]).code).toBe(0);
    // A capture and its frozen copy as the 5.10 run left them, with the encoded forms it could not see; FROZEN.sha256
    // records the frozen copy's bytes (it held them before the fold, and the re-mask kept its line in step).
    // Each meta's sha256 and byteLength are of its stored body, as render-watch and freeze-capture write them.
    for (const slug of ["page", "page-2026-09-28"]) {
      const body = Buffer.from(encode(readFileSync(join(f.dir, `${slug}.html`), "utf8")));
      w(f, `${slug}.html`, body);
      w(f, `${slug}.meta.json`, metaText({ ...meta(f, slug), sha256: sha(body), byteLength: body.length }));
    }
    let recorded = readFileSync(join(f.dir, MANIFEST), "utf8");
    for (const name of ["page-2026-09-28.html", "page-2026-09-28.meta.json"]) {
      recorded = recorded.replace(new RegExp(`^[0-9a-f]{64}(  ${name.replaceAll(".", "\\.")})$`, "m"), `${sha(readFileSync(join(f.dir, name)))}$1`);
    }
    w(f, MANIFEST, recorded);
    commit(f, "the encoded forms the 5.10 run left");
    expect(checkManifest(f.dir)).toEqual([]);
    const before = snapshot(f.dir);

    const dry = run(["--dry-run", ...rendered(f)]);
    expect(dry.code).toBe(3);
    expect(dry.text).toContain("would change: 2 captures, 2 files (2 .html); 4 addresses masked");
    expect(dry.text).toContain("by domain kind: free-mail provider 2, organisation or university 0, mailing-list host 0, government 2, placeholder 0");
    expect(dry.text).toMatch(/^ {2}page: body \+2 \(page\.html\), text unchanged$/m);
    expect(dry.text).toContain("frozen copies among them: 1 capture (1 file;");
    expect(dry.text).not.toMatch(/[A-Za-z0-9._%+-]+(?:@|%40)[A-Za-z0-9.-]+\.[a-z]{2,}/);
    expect(dry.text).not.toContain("sam.person");
    expect(dry.text).not.toContain(CF);
    expect(snapshot(f.dir)).toEqual(before);

    expect(run(["--apply", "--date", "2026-10-06", ...rendered(f)]).code).toBe(0);
    const html = readFileSync(join(f.dir, "page.html"), "utf8");
    expect(html).toContain(`<a href="/r?u=[redacted:email]${PCT}gmail.com">`);
    expect(html).toContain('data-cfemail="[redacted:email]@agency.gov"');
    expect(html).not.toContain("sam.person");
    expect(html).not.toContain(CF);
    for (const slug of ["page", "page-2026-09-28"]) {
      const m = meta(f, slug);
      // 4 addresses on 5.10 (2 in the body, 2 in the text), 2 more now: one remasked block, on the new date.
      expect([m.redacted, m.remasked], slug).toEqual([6, { on: "2026-10-06", addresses: 6, fold: FOLD }]);
      expect(m.sha256, slug).toBe(sha(readFileSync(join(f.dir, `${slug}.html`))));
      expect(m.byteLength, slug).toBe(readFileSync(join(f.dir, `${slug}.html`)).length);
      const keys = Object.keys(m);
      expect(keys.filter((k) => k === "remasked").length).toBe(1);
      expect(keys.slice(keys.indexOf("truncated"), keys.indexOf("truncated") + 4)).toEqual(["truncated", "redacted", "remasked", "error"]);
    }
    expect(Object.keys(meta(f, "page-2026-09-28")).at(-1)).toBe("frozen");
    // FROZEN.sha256: the frozen copy's html and meta lines move to the new bytes; every other line stays.
    expect(checkManifest(f.dir)).toEqual([]);
    const oldLines = (before.get(MANIFEST) as Buffer).toString("utf8").split("\n");
    const newLines = readFileSync(join(f.dir, MANIFEST), "utf8").split("\n");
    expect(newLines.filter((l, i) => l !== oldLines[i]).map((l) => l.slice(66))).toEqual(["page-2026-09-28.html", "page-2026-09-28.meta.json"]);
    // A third run changes nothing.
    commit(f, "re-masked the encoded forms");
    expect(run(["--dry-run", ...rendered(f)]).code).toBe(0);
  });

  it("counts a mask whose @ is a script escape under its domain's kind, never as a mask with no domain (review fix)", () => {
    const f = fixture();
    const esc = `<html><body>\n<script>var a = "${["press", "agency.gov"].join("\\u0040")}", b = '${["desk", "agency.gov"].join("\\x40")}';</script>\n</body></html>\n`;
    w(f, "esc.html", esc);
    w(f, "esc.meta.json", metaText(metaFor("esc", Buffer.from(esc), "text/html", "html", false)));
    commit(f, "script escapes");
    const { code, text } = run(["--dry-run", ...rendered(f), "--only", "esc"]);
    expect(code).toBe(3);
    expect(text).toContain("would change: 1 capture, 1 file (1 .html); 2 addresses masked");
    expect(text).toContain("by domain kind: free-mail provider 0, organisation or university 0, mailing-list host 0, government 2, placeholder 0");
    expect(text).not.toContain("no domain kept");
    expect(text).not.toMatch(/press|desk/);
  });

  it("counts a Cloudflare value that is not one address in addresses, and says it kept no domain", () => {
    const f = fixture();
    const odd = `<html><body>\n<span data-cfemail="${CF}0">x</span>\n</body></html>\n`;
    w(f, "odd.html", odd);
    w(f, "odd.meta.json", metaText(metaFor("odd", Buffer.from(odd), "text/html", "html", false)));
    commit(f, "an odd hex");
    const { code, text } = run(["--dry-run", ...rendered(f), "--only", "odd"]);
    expect(code).toBe(3);
    expect(text).toContain("would change: 1 capture, 1 file (1 .html); 1 address masked");
    expect(text).toContain("  no domain kept (a Cloudflare value that is not one address): 1");
    expect(text).toContain("by domain kind: free-mail provider 0, organisation or university 0, mailing-list host 0, government 0, placeholder 0");
    expect(run(["--apply", "--date", "2026-10-06", ...rendered(f), "--only", "odd"]).code).toBe(0);
    expect(readFileSync(join(f.dir, "odd.html"), "utf8")).toBe(odd.replace(`${CF}0`, "[redacted:email]"));
    expect(meta(f, "odd").remasked).toEqual({ on: "2026-10-06", addresses: 1, fold: FOLD });
  });
});

describe("the real research/rendered, dry run", () => {
  it("runs, writes nothing, and masks no asset name", () => {
    const status = () => spawnSync("git", ["status", "--porcelain", "--untracked-files=all", "--", "research/rendered"], { encoding: "utf8" }).stdout;
    // git status alone would not see a write to a file that is already modified: every file's size and mtime too.
    const stamps = () => readdirSync("research/rendered").map((name) => {
      const st = statSync(join("research/rendered", name));
      return `${name} ${st.size} ${st.mtimeMs}`;
    });
    // Not asserted empty: the main thread runs the suite after --apply and before its commit, when these files are
    // legitimately modified; "writes nothing" is that the state after equals the state before.
    const was = status();
    const wasStamps = stamps();
    expect(existsSync("research/rendered/FROZEN.sha256")).toBe(true);
    const { code, text } = run(["--dry-run"]);
    expect([0, 3], text.slice(-2000)).toContain(code);
    expect(status()).toBe(was);
    expect(stamps()).toEqual(wasStamps);
    expect(text).toContain("asset names masked: 0");
    expect(text).toMatch(/^ {2}files no meta path names, masked as well: \d+ \(\d+ address(es)?\)$/m);
    expect(text).toMatch(/^ {2}pins that go stale: \d+ /m);
    // No address in any form the mask reads: a plain @, %40 or a script escape.
    expect(text).not.toMatch(/[A-Za-z0-9._%+-]+(?:@|%40|\\u0040|\\x40)[A-Za-z0-9.-]+\.[a-z]{2,}/i);
  }, 300_000);
});
