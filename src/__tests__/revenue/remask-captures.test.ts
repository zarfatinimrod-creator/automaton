import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
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
import { buildMeta } from "../../../scripts/render-watch.mjs";
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

describe("the real research/rendered, dry run", () => {
  it("runs, writes nothing, and masks no asset name", () => {
    const status = () => spawnSync("git", ["status", "--porcelain", "--untracked-files=all", "--", "research/rendered"], { encoding: "utf8" }).stdout;
    const was = status();
    expect(existsSync("research/rendered/FROZEN.sha256")).toBe(true);
    const { code, text } = run(["--dry-run"]);
    expect([0, 3], text.slice(-2000)).toContain(code);
    expect(status()).toBe(was);
    expect(text).toContain("asset names masked: 0");
    expect(text).not.toMatch(/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[a-z]{2,}/);
  }, 300_000);
});
