import { readdirSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
// @ts-expect-error — plain ESM script, no type declarations by design
import { parseUrlList } from "../../../scripts/render-watch.mjs";
// @ts-expect-error — plain ESM script, no type declarations by design
import { applyVerdicts, loadVerdicts, siteOf, termsGate } from "../../../scripts/queue-zero-test.mjs";

/**
 * Tick 69 (11.10.2026), ruling 11.10 row 27, fold 13(d) (research/channel-loop/RULING-2026-10-11-osek-patur-ceiling.md):
 * a TERMS_PENDING entry for capitax.co.il and one plain terms line, queued through scripts/queue-zero-test.mjs as
 * ZERO-TESTS row 270, in the form tick 45 queued its nine TERMS_PENDING sites (rows 235-243). The terms address is the
 * footer link of the site's one HTML capture, which the TikTok research fetched on 28.9.2026. capitax.co.il hosts the
 * copy of the gazette that osek-patur's and osek-zair's ₪120,000 for 2024 and 2025 rest on, so reading these terms can
 * fire that ruling's REOPEN (a). This file pins the entry, its citations and the line; prize-terms-audit.test.ts ("tick
 * 69") holds the counts that moved.
 */
type Entry = { verdict: string; source: string; checked: string; note: string; copying: string };
type Meta = { url: string; slug: string; fetchedAt: string; status: number; contentType: string; robots?: unknown };

const SITE = "capitax.co.il";
const TERMS_URL = "https://www.capitax.co.il/legalterms";
const SLUG = "terms-capitax";
const ROW = 270;
const VERDICTS = "research/channel-loop/terms-verdicts.json";
const URLS = "research/rendered/urls.txt";
const ZERO = "research/channel-loop/ZERO-TESTS.md";
const RULING = "research/channel-loop/RULING-2026-10-11-osek-patur-ceiling.md";
const RENDERED = "research/rendered";
const PAGE = "tt-src-capitax-co-il-content-2-3311";
const HTML = `${RENDERED}/${PAGE}.html`;
const PATUR = "products/il-biz-tools/src/config/osek-patur.json";
const ZAIR = "products/il-biz-tools/src/config/osek-zair.json";
/** Every capture of the site in the tree, page first, then the five PDFs in the order the note names them. */
const CAPTURES = [
  PAGE,
  "tt2-capitax-265-2023",
  "tt2-capitax-21072025-1",
  "tt2-capitax-11122024",
  "tt2-capitax-26112024-2",
  "tt2-capitax-28052025-1",
];

const read = (path: string) => readFileSync(path, "utf8");
const lineOf = (path: string, n: number) => read(path).split("\n")[n - 1];
const metaOf = (slug: string) => JSON.parse(read(`${RENDERED}/${slug}.meta.json`)) as Meta;
const entry = () => (JSON.parse(read(VERDICTS)).sites as Record<string, Entry>)[SITE];
/** The capture's HTML as the site sent it: windows-1255 bytes, its lines as grep -n numbers them. */
const htmlLine = (n: number) => new TextDecoder("windows-1255").decode(readFileSync(HTML)).split("\n")[n - 1];

describe("capitax.co.il: the TERMS_PENDING entry (tick 69, ruling 11.10 row 27 fold 13(d))", () => {
  it("is TERMS_PENDING, checked 11.10, copying unread, its fields in the file's order", () => {
    const e = entry();
    expect(Object.keys(e)).toEqual(["verdict", "source", "checked", "note", "copying"]);
    expect([e.verdict, e.checked, e.copying]).toEqual(["TERMS_PENDING", "2026-10-11", "unread"]);
    expect(loadVerdicts()[SITE]).toEqual(e);
  });

  it("sources the terms URL to the footer of the 28.9 capture, at lines that hold the link and the base it resolves against", () => {
    const { source } = entry();
    expect(source.startsWith(`${TERMS_URL} (link observed in a capture: href="/legalterms", the footer's terms-of-use item, at ${HTML}:580, and again beside the copyright line at :655, both resolved against <base href="https://www.capitax.co.il/"> at :39; `)).toBe(true);
    expect(source).toContain(`the capture is of https://www.capitax.co.il/content/2/3311, fetched 2026-09-28T21:02:31.830Z for the TikTok research, status 200, text/html; charset=windows-1255, on no urls.txt line)`);
    expect(source).toContain("no GitHub-hosted copy was looked for (the build had no network)");
    expect(source.endsWith(`Tick 69, ruling 11.10 row 27 (${RULING}, "Folds for Opus" 13(d))`)).toBe(true);
    // The lines say what the source says: the menu's and the copyright line's link, the anchor text "terms of use".
    const link = '<a href="/legalterms">תנאי שימוש</a>';
    expect(htmlLine(580).trim()).toBe(`<li>${link}</li>`);
    expect(htmlLine(655)).toContain(`| ${link}</p>`);
    expect(htmlLine(39).trim()).toBe('<base href="https://www.capitax.co.il/"/>');
    expect(new URL("/legalterms", "https://www.capitax.co.il/").href).toBe(TERMS_URL);
    // No other link in the capture names terms or a legal page (the one other "terms" is a sign-up form's checkbox).
    const html = new TextDecoder("windows-1255").decode(readFileSync(HTML));
    expect([...html.matchAll(/href="([^"]*)"/g)].map((m) => m[1]).filter((h) => /terms|legal|takanon/i.test(h))).toEqual(["/legalterms", "/legalterms"]);
    // The capture's meta, as the source gives it.
    const m = metaOf(PAGE);
    expect([m.url, m.fetchedAt, m.status, m.contentType]).toEqual(["https://www.capitax.co.il/content/2/3311", "2026-09-28T21:02:31.830Z", 200, "text/html; charset=windows-1255"]);
    const urls = read(URLS);
    expect(urls.includes(m.url) || urls.split(/\s+/).includes(PAGE)).toBe(false);
  });

  it("lists every capture of the site, each fetched 28.9 before any terms read and before robots.txt was read", () => {
    const { note } = entry();
    expect(note.startsWith(`terms unread: the host had no terms verdict, robots record or copying field before this entry (${RULING}:468-471). Six captures of the site already exist in research/rendered/, all fetched on 28.9.2026, before any terms read and before render-watch read robots.txt (none of their metas has a robots key): `)).toBe(true);
    // Every capture whose meta names a capitax.co.il URL, and the slug families the fold names, are the six.
    const metas = readdirSync(RENDERED).filter((f) => f.endsWith(".meta.json"));
    const bySite = metas
      .map((f) => JSON.parse(read(`${RENDERED}/${f}`)) as Meta)
      .filter((m) => typeof m.url === "string" && siteOf(new URL(m.url).hostname) === SITE)
      .map((m) => m.slug);
    const byName = metas.map((f) => f.slice(0, -".meta.json".length)).filter((s) => /^(tt-src-capitax-|tt2-capitax-)/.test(s));
    expect(bySite.sort()).toEqual([...CAPTURES].sort());
    expect(byName.sort()).toEqual([...CAPTURES].sort());
    for (const slug of CAPTURES) {
      const m = metaOf(slug);
      expect(note, slug).toContain(slug);
      expect([new URL(m.url).hostname, m.status, m.fetchedAt.slice(0, 10)], slug).toEqual(["www.capitax.co.il", 200, "2026-09-28"]);
      expect(Object.hasOwn(m, "robots"), slug).toBe(false);
    }
    expect(metaOf(PAGE).fetchedAt.slice(11, 16)).toBe("21:02");
    for (const slug of CAPTURES.slice(1)) expect(metaOf(slug).fetchedAt.slice(11, 16), slug).toBe("23:22");
    expect(note).toContain(`${PAGE} (21:02 UTC, the page whose footer gives the terms address) and five PDFs of 23:22 UTC, tt2-capitax-265-2023 (ספר החוקים 3045, the gazette), tt2-capitax-21072025-1, tt2-capitax-11122024, tt2-capitax-26112024-2 and tt2-capitax-28052025-1 (with the gazette, the documents of ${ZAIR}:4-64)`);
    // The ruling's lines: the host had no record before this entry.
    expect(lineOf(RULING, 468)).toContain("**capitax.co.il's standing** as a host: no terms verdict, no robots record, no `copying` field");
    expect(lineOf(RULING, 471)).toContain("queued (Folds 13(d)), not ruled.");
    // osek-zair.json:4-64 is its documents block, and its five documents are the five PDFs.
    expect(lineOf(ZAIR, 4)).toBe('  "documents": {');
    expect(lineOf(ZAIR, 64)).toBe("  },");
    const docs = JSON.parse(read(ZAIR)).documents as Record<string, { meta: string; copyOn: string }>;
    expect(Object.values(docs).map((d) => d.meta)).toEqual(CAPTURES.slice(1).map((s) => `${RENDERED}/${s}.meta.json`));
    expect(Object.values(docs).every((d) => d.copyOn === SITE)).toBe(true);
  });

  it("says that ruling 11.10 row 27 rests both pages' ₪120,000 on the tt2-capitax gazette copy, and what its REOPEN (a) fires on, at the lines it cites", () => {
    const { note } = entry();
    expect(note).toContain(
      "Ruling 11.10 row 27 rests osek-patur's and osek-zair's ₪120,000 for 2024 and 2025 on the tt2-capitax-265-2023 copy of the gazette, section 35 on page 173 (RULING-2026-10-11-osek-patur-ceiling.md:238-248; osek-patur.json:5-21, :37-50; osek-zair.json:5-21, :77-80)",
    );
    expect(note).toContain(
      "its REOPEN (a) (:414-417) fires if a robots read of capitax.co.il, a terms read of the host or fold 10(ii) of the 6.10 ruling marks the tt2-capitax captures [robots-bar] or copying-barred: both pages then lose that source at once, both figures move to pending, and a sitting rules what the two pages may still say.",
    );
    // The ruling's lines hold it.
    expect(lineOf(RULING, 238)).toContain("**What a primary text in the store states for this amount.** The gazette, ספר החוקים 3045, p. 173");
    expect(lineOf(RULING, 242)).toContain("a third-party copy on capitax.co.il");
    expect(lineOf(RULING, 248)).toContain("years on osek-zair.html");
    expect(lineOf(RULING, 414).startsWith("**REOPEN IF** (a) fold 10(ii) of the 6.10 ruling (`:413-415`), a robots read of capitax.co.il, or a terms read of that host")).toBe(true);
    expect(lineOf(RULING, 415)).toContain("marks the `tt2-capitax-*` captures `[robots-bar]` or copying-barred: then ₪120,000 for 2024 and 2025 loses its source on both");
    expect(lineOf(RULING, 416)).toContain("both pages' figures move to pending, and a sitting rules what");
    expect(lineOf(RULING, 417)).toContain("; (b) a permitted");
    // The configs' lines: both gazette documents are the tt2-capitax-265-2023 copy, and both pages' years hold 120000.
    for (const file of [PATUR, ZAIR]) {
      expect(lineOf(file, 5), file).toBe('    "gazette": {');
      expect(lineOf(file, 21).trimEnd().startsWith("    }"), file).toBe(true);
      const gazette = JSON.parse(read(file)).documents.gazette as { capture: string; copyOn: string; url: string };
      expect([gazette.capture, gazette.copyOn, gazette.url], file).toEqual([`${RENDERED}/tt2-capitax-265-2023.pdf`, SITE, "https://www.capitax.co.il/Attachments/265-2023.pdf"]);
    }
    expect([lineOf(PATUR, 37), lineOf(PATUR, 39), lineOf(PATUR, 45), lineOf(PATUR, 50)]).toEqual(['  "years": {', '      "ceiling": 120000,', '      "ceiling": 120000,', "  },"]);
    expect([77, 78, 79, 80].map((n) => lineOf(ZAIR, n))).toEqual(['  "years": {', '    "2024": { "cap": 120000 },', '    "2025": { "cap": 120000 }', "  },"]);
  });

  it("warns that the .txt of a windows-1255 page holds no Hebrew, because render-watch decodes every HTML body as UTF-8", () => {
    const { note } = entry();
    expect(note).toContain(
      'Read the capture\'s .html, not its .txt: render-watch decodes every HTML body as UTF-8 before it extracts the text (scripts/render-watch.mjs, extractText(body.toString("utf8"))), so the .txt of this windows-1255 page holds 6,866 replacement characters and no Hebrew letter, and a terms page in the same charset will read only through its .html.',
    );
    const rw = read("scripts/render-watch.mjs");
    expect(rw).toContain('extractText(body.toString("utf8"))');
    // Nothing in render-watch decodes another charset; when something does, this warning and the note change with it.
    expect(rw).not.toMatch(/TextDecoder|windows-1255|iconv/);
    const txt = read(`${RENDERED}/${PAGE}.txt`);
    expect([...txt].filter((c) => c === "�")).toHaveLength(6866);
    expect(/[֐-׿]/.test(txt)).toBe(false);
    expect(htmlLine(580)).toMatch(/[֐-׿]/);
  });

  it("queues its terms page only, plain and once: the gate passes that line and refuses every other page of the site", () => {
    const { note } = entry();
    expect(note).toContain("The terms line's meta will carry robots.txt's answer for /legalterms only, not for /Attachments/ or /content/.");
    expect(note.endsWith(
      "Only its terms page is queued (a terms- line, ZERO-TESTS row 270; ruling 30.9 16(d) D2(iii)-(iv)), plain and once, for the next render-watch run (GitHub Actions has been disabled on the repository since about 8.10, so no run is due); no other page of the site is fetched, and the six captures stay as they are, until the terms are read.",
    )).toBe(true);
    // The note does not name the terms line's slug: a decision file naming an active capture is held to LIVE_MENTIONS.
    expect(note.includes(SLUG) || entry().source.includes(SLUG)).toBe(false);
    const v = loadVerdicts();
    expect(termsGate(TERMS_URL, SLUG, v)).toEqual({ ok: true, site: SITE, verdict: "TERMS_PENDING" });
    for (const [url, slug] of [
      ["https://www.capitax.co.il/Attachments/265-2023.pdf", "tt2-capitax-265-2023"],
      ["https://www.capitax.co.il/content/2/3311", PAGE],
      ["https://www.capitax.co.il/robots.txt", "robots-capitax"],
    ]) {
      const gate = termsGate(url, slug, v);
      expect(gate.ok, url).toBe(false);
      expect(gate.why, url).toContain(`${SITE} is TERMS_PENDING: only its terms page (a terms-... slug) may be queued until its terms are read`);
    }
    expect(applyVerdicts(read(URLS), v).paused).toEqual([]);
  });
});

describe("capitax.co.il: ZERO-TESTS row 270 and its urls.txt line (tick 69)", () => {
  it("adds row 270 after row 269, four columns, in the tick-45 terms-audit form", () => {
    const lines = read(ZERO).split("\n");
    const at = lines.findIndex((l) => l.startsWith(`| ${ROW} | `));
    expect(lines.filter((l) => l.startsWith(`| ${ROW} | `))).toHaveLength(1);
    expect(lines[at - 1].startsWith(`| ${ROW - 1} | `)).toBe(true);
    expect(lines[at]).toBe(
      `| ${ROW} | terms audit (tick 69): capitax.co.il, the host of the gazette copy that osek-patur's and osek-zair's ₪120,000 rest on (ruling 11.10 row 27, fold 13(d)) | ${TERMS_URL} | whether capitax.co.il's site-use terms bar automated access or storing captures, before anything more rests on the six captures of 28.9 (ruling 11.10 row 27 REOPEN (a): a bar moves both pages' ₪120,000 to pending) |`,
    );
    expect(lines[at].replace(/\\\|/g, "").split("|").length - 2).toBe(4);
  });

  it("lists one plain, active line for the terms page under the row's comment, and no other capitax.co.il URL anywhere in the list", () => {
    const lines = read(URLS).split("\n");
    const at = lines.findIndex((l) => l.startsWith(`# research/channel-loop/ZERO-TESTS.md row ${ROW} — `));
    expect(lines[at]).toBe(
      `# research/channel-loop/ZERO-TESTS.md row ${ROW} — capitax.co.il TERMS_PENDING (tick 69, ruling 11.10 row 27 fold 13(d)): URL from the footer link href="/legalterms" at ${HTML}:580 and :655, under the page's base href at :39, the 28.9 capture of the site's /content/2/3311 page (on no urls.txt line), rendered grade; plain once-fetch (ruling 30.9 16(d) D2(iii)) (11.10.2026).`,
    );
    expect(lines[at + 1]).toBe(`${TERMS_URL}\t${SLUG}`);
    const listed = parseUrlList(read(URLS)) as { url: string; slug: string; js?: boolean }[];
    const own = listed.filter((e) => siteOf(new URL(e.url).hostname) === SITE);
    expect(own.map((e) => [e.url, e.slug, Boolean(e.js)])).toEqual([[TERMS_URL, SLUG, false]]);
    // Every URL in the list, active or commented out: the terms page is the only one on the site.
    const all = (read(URLS).match(/https?:\/\/[^\s"<>)]+/g) ?? []).filter((u) => siteOf(new URL(u).hostname) === SITE);
    expect(all).toEqual([TERMS_URL]);
  });
});
