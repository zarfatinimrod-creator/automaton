import { existsSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import {
  activeCitations,
  activeSlugs,
  byLine,
  checkManifest,
  decisionFiles,
  isProse,
  listedNames,
  manifestSlugs,
  MANIFEST,
  readManifest,
  scanCitations,
  scanKnown,
  scanOptions,
  // @ts-expect-error — plain ESM script, no type declarations by design
} from "../../../scripts/freeze-capture.mjs";

type Ref = { range: [number, number]; ext: string | null; fileLine: number; token: string };
type Citation = {
  file: string;
  slug: string;
  ext: string | null;
  lines: [number, number][];
  refs: Ref[];
  full: boolean;
  form: string;
  alias: string | null;
  aliasFor?: string;
  text: string;
  fileLine: number;
};
type Other = { name: string; ext: string; lines: [number, number][]; fileLine: number; text: string };

const RENDERED = "research/rendered";
const where = (c: { file: string; fileLine: number; text: string }) => `${c.file}:${c.fileLine} ${c.text}`;
const metaOf = (slug: string) => JSON.parse(readFileSync(`${RENDERED}/${slug}.meta.json`, "utf8"));
const lineOf = (slug: string, ext: string, n: number) => readFileSync(`${RENDERED}/${slug}.${ext}`, "utf8").split("\n")[n - 1];
const read = (file: string) => readFileSync(file, "utf8");

/**
 * Where a decision note names an ACTIVE capture on purpose, without a line: the live page, not what was read. Each
 * entry is "<file> <slug>" and says why. Any other name of an active capture in a note (md or json) fails below: a
 * section that names the live capture and cites its lines in a form the scanner cannot place (bare :N lines after a
 * name, an abbreviation) would otherwise pass unseen. Code (src/) is not a decision-bearing file (decisionFiles).
 */
const LIVE_MENTIONS: Record<string, string> = {
  "research/channel-loop/RULING-2026-09-29-loop.md displate-about-regulations": "the watch itself: which capture tick 21 re-renders",
  "research/channel-loop/TERMS-AUDIT-2026-09-29.md sweep2-google-vrp-faq": "the audit reports the live capture's failed fetch (its meta)",
  "research/channel-loop/ZERO-TESTS.md robots-nevo": "a render row: the slug the weekly probe writes",
  "research/channel-loop/terms-verdicts.json robots-nevo": "the weekly probe, which is meant to see a change",
  "research/measurements/actions-spending-limit.md gh-docs-set-up-budgets": "the table of slugs rendered for this note (what urls.txt holds)",
  "research/measurements/actions-spending-limit.md gh-docs-budgets-and-alerts": "the table of slugs rendered for this note (what urls.txt holds)",
  "research/measurements/html5-syndication.md gamedistribution-sdk-implementation": "\"Suggested slug\": the name a render was asked to use",
  "research/measurements/html5-syndication.md gamedistribution-wiki-faq": "\"Suggested slug\": the name a render was asked to use",
  "products/apify-il-open-data/docs/PUBLISH.md apify-store-accessibility": "the weekly store count the publish check reads",
  "research/owner-docs-audit/FINDINGS.md apify-store-accessibility": "the live store listing a later run re-reads for the count",
  "research/owner-docs-audit/JUDGEMENT.md apify-store-accessibility": "the live store listing a later run re-reads for the count",
  "research/owner-docs-audit/apify-publish.md apify-store-accessibility": "the live store listing a later run re-reads for the count",
  "research/owner-docs-audit/x402-il-api.md apify-store-accessibility": "the live store listing a later run re-reads for the count",
  "research/breadth/scouts/automation-marketplaces.json apify-store-accessibility": "a scout's output, naming the watched listing",
  "research/breadth/verify/verdicts.json apify-store-accessibility": "a verifier's output, naming the watched listing",
  "research/faceless-youtube/LICENCE-IGO-DECISION.md unesco-uis-databrowser-terms": "a urls.txt line the note proposed: the slug a render writes",
  "research/channel-loop/RULING-2026-10-06-robots-and-terms.md robots-nevo": "the weekly probe the ruling keeps running, and its live meta (what the runner saw)",
  "research/channel-loop/RULING-2026-10-06-robots-and-terms.md terms-kaggle": "the live shell capture the once-only js route (decision 3) re-renders",
  // The 4.10 row-18 ruling named amo-add-on-policies while urls.txt:331 was still active; its fold retired that line
  // (ruling §3 rule 1), so the slug is no longer an active capture and its entry here went with it.
};

/**
 * A path under research/rendered/ that names no capture on purpose: "<file> <path>" and why. Anything else that names a
 * capture not on disk fails below.
 */
const NOT_CAPTURES: Record<string, string> = {
  "research/faceless-youtube/LICENCE-IGO-DECISION.md research/rendered/owid-co2-licence.txt": "a fixture path in a quoted test (narration-licence-gate.test.ts), turned into a snapshots/ path",
};

/**
 * Tick 38 (30.9.2026). The weekly render (.github/workflows/render-watch.yml) rewrites a capture in place whenever the
 * page changed, so a research note, ruling or verdict that cites research/rendered/<slug>.txt:NNN can come to point at
 * other text without anyone touching it. It already had: 44 citations by line, in 17 files, had a cited range the render
 * had rewritten, 118 ranges in all (the BTL rate lines under step2-cost.md, Displate's Terms of Use under the loop
 * ruling and wall-art-pod.md, the Kokoro card under the faceless-YouTube verdicts and parent-guides' LICENSES.md). Every citation in a decision-bearing file
 * now names a dated frozen copy (scripts/freeze-capture.mjs), which no urls.txt line names and so no render rewrites,
 * and FROZEN.sha256 holds each copy's bytes. This fails when one cites a capture the weekly run can rewrite, by line.
 */
describe("decision-bearing files cite frozen captures, never a live one by line", () => {
  const urls = read(`${RENDERED}/urls.txt`);
  const active: Set<string> = activeSlugs(urls);
  const known: Set<string> = scanKnown(".", urls);
  const listed: Set<string> = listedNames(urls);
  const files: string[] = decisionFiles();

  it("reads the files a decision, a claim or a release is read from, and no log or capture", () => {
    for (const f of [
      "research/channel-loop/terms-verdicts.json",
      "research/channel-loop/TERMS-AUDIT-2026-09-29.md",
      "research/measurements/actions-spending-limit.md",
      "research/faceless-youtube/VERDICT.md",
      "research/owner-asks/questions.json",
      "docs/REJECTED.md",
      "products/il-biz-tools/src/config/osek-zair.json",
      "products/il-biz-tools/README.md",
      "products/parent-guides/LICENSES.md",
      "products/chart-explainer/releases/t1/render-report.json",
      "products/README.md",
    ]) {
      expect(files, f).toContain(f);
    }
    expect(files.filter((f) => f.startsWith("logs/") || f.startsWith(`${RENDERED}/`) || f.includes("node_modules") || f.endsWith("package-lock.json"))).toEqual([]);
    // Not code: a test's slugs are fixtures (research/rendered/x.txt, page-2026-09-28.txt), and a comment in src/ is
    // not where a decision is read from. Code that reads a capture reads it at run time, live or frozen as it names.
    expect(files.filter((f) => f.startsWith("src/") || /\.(ts|tsx|js|mjs|cjs|py)$/.test(f))).toEqual([]);
    // The same list from a relative root (the paths are relative to it either way).
    expect(decisionFiles(".")).toEqual(files);
  });

  it("finds no citation by line of a capture whose urls.txt line is active", () => {
    // The fix for a failure here: node scripts/freeze-capture.mjs --cited (dry run), then --apply.
    expect(byLine(activeCitations({})).map(where)).toEqual([]);
  });

  it("names an active capture in a note only where LIVE_MENTIONS says the live page is meant, and never by line", () => {
    const seen = new Set<string>();
    const unlisted: string[] = [];
    for (const file of files.filter(isProse)) {
      for (const c of scanCitations(read(file), known, scanOptions(file)).citations as Citation[]) {
        if (!active.has(c.slug) || c.alias) continue;
        const key = `${file} ${c.slug}`;
        seen.add(key);
        if (!LIVE_MENTIONS[key] || c.lines.length) unlisted.push(`${where({ ...c, file })}${c.lines.length ? " (by line)" : ""}`);
      }
    }
    expect(unlisted).toEqual([]);
    // An entry nothing matches any more is removed, so the list says only what is true.
    expect(Object.keys(LIVE_MENTIONS).filter((k) => !seen.has(k))).toEqual([]);
  });

  it(`records every frozen copy's files in ${MANIFEST}, byte for byte, and every recorded copy is a frozen one`, () => {
    // A rewritten, deleted or re-made frozen file fails here, and so does a copy whose meta lost its "frozen" block.
    expect(checkManifest(RENDERED)).toEqual([]);
    expect(manifestSlugs(readManifest(RENDERED)).size).toBeGreaterThan(50);
  });

  it("cites only captures on disk, never a line past the end of the file it names, and a dated or frozen one only as recorded", () => {
    const recorded: Set<string> = manifestSlugs(readManifest(RENDERED));
    const lineCount = new Map<string, number>();
    const count = (path: string) => {
      if (!lineCount.has(path)) lineCount.set(path, existsSync(path) ? read(path).split("\n").length : -1);
      return lineCount.get(path) as number;
    };
    const DATED = /-\d{4}-\d{2}-\d{2}(-[0-9a-f]{7,})?$/;
    // A dated name is a frozen copy's when the name without its date is a capture (owner-reel-2026-09-22 is a capture
    // fetched under a dated slug; sweep-2026-09-28.json is a scout's file).
    const copyName = (name: string) => DATED.test(name) && known.has(name.replace(DATED, ""));
    const problems: string[] = [];
    const exempt = new Set<string>();
    let checked = 0;
    for (const file of files) {
      const { citations, others } = scanCitations(read(file), known, scanOptions(file)) as { citations: Citation[]; others: Other[] };
      for (const c of citations) {
        const at = where({ ...c, file });
        if (!existsSync(`${RENDERED}/${c.slug}.meta.json`)) {
          if (NOT_CAPTURES[`${file} ${c.text}`]) exempt.add(`${file} ${c.text}`);
          else problems.push(`${at}: no capture ${c.slug} on disk`);
          continue;
        }
        // A capture no urls.txt line names is never rendered again: a copy that says it is frozen, or is named by a
        // day, is one only when FROZEN.sha256 holds its bytes (a copy whose meta lost its "frozen" block included).
        if (listed.has(c.slug) || !(copyName(c.slug) || metaOf(c.slug).frozen)) continue;
        if (!recorded.has(c.slug)) problems.push(`${at}: ${c.slug} is a frozen copy ${MANIFEST} does not record`);
        // A frozen copy holds every line cited of it: a line past the end is a misread citation (another file's line
        // given to this capture, or the wrong file of it), never a skip.
        for (const r of c.refs) {
          checked += 1;
          const exts = r.ext ? [r.ext] : ["txt", "html"];
          const [a, b] = r.range;
          if (!exts.some((ext) => a >= 1 && b >= a && b <= count(`${RENDERED}/${c.slug}.${ext}`))) {
            problems.push(`${at}: ${r.token} (line ${r.fileLine}) is past the end of ${c.slug}.${exts.join("/")}`);
          }
        }
      }
      // A dated name that is no copy on disk: a frozen copy that does not exist.
      for (const o of others) {
        if (copyName(o.name)) problems.push(`${file}:${o.fileLine} ${o.text}: no frozen copy ${o.name} on disk`);
      }
    }
    expect(problems).toEqual([]);
    expect(Object.keys(NOT_CAPTURES).filter((k) => !exempt.has(k))).toEqual([]);
    expect(checked).toBeGreaterThan(900);
  });

  it("repoints the instances tick 36 named to frozen copies that say what the verdicts quote, on the same lines", () => {
    const verdicts = read("research/channel-loop/terms-verdicts.json");
    expect(verdicts).toContain("research/rendered/terms-btl-2026-09-29.txt:303");
    expect(verdicts).toContain("research/rendered/terms-ypay-2026-09-29.txt:55");
    expect(verdicts).not.toMatch(/terms-(btl|ypay)\.txt:/);
    expect(lineOf("terms-btl-2026-09-29", "txt", 303)).toBe(lineOf("terms-btl", "txt", 303));
    expect(lineOf("terms-ypay-2026-09-29", "txt", 55)).toMatch(/רובוטים/);
    // actions-spending-limit.md cites by short name (R-GA:502); its capture tables name the frozen copies.
    const asl = read("research/measurements/actions-spending-limit.md");
    expect(asl).toContain("| `R-GA` | `gh-docs-actions-billing-2026-09-29.txt` |");
    expect(asl).toContain("| `R-SB` | `gh-docs-set-up-budgets-2026-09-29.txt` |");
  });

  it("repoints a citation the render had already moved to the capture it was written against, not to today's", () => {
    // step2-cost.md read the BTL pages of 27.9 22:46Z; the render of 29.9 moved the minimum-contribution lines.
    const step2 = read("research/measurements/step2-cost.md");
    expect(step2).toContain("`btl-self-employed-rates-2026-09-27.txt:410`");
    expect(step2).toContain("| `research/rendered/btl-self-employed-rates-2026-09-27.txt` | 2026-09-27T22:46:07Z | 200 |");
    expect(metaOf("btl-self-employed-rates-2026-09-27").fetchedAt).toBe("2026-09-27T22:46:07.842Z");
    expect(lineOf("btl-self-employed-rates-2026-09-27", "txt", 410)).toContain('מי שהכנסתו נמוכה מ- 3,442 ש"ח לחודש');
  });

  it("wall-art-pod.md §4-§6 name the 28.9 captures their short names (tou, priv, chunk) stand for", () => {
    const w = read("research/measurements/wall-art-pod.md");
    expect(w).toContain("Capture: `displate-about-regulations-2026-09-28` (200, fetchedAt 2026-09-28T21:03Z");
    expect(w).toContain("Capture: `displate-com-about-privacy-2026-09-28` (200, fetchedAt 2026-09-28T22:00Z");
    expect(w).toContain("Capture: `displate-about-privacy-chunk-2026-09-28` (200,");
    expect(metaOf("displate-about-regulations-2026-09-28").fetchedAt.slice(0, 16)).toBe("2026-09-28T21:03");
    expect(metaOf("displate-about-privacy-chunk-2026-09-28").fetchedAt.slice(0, 16)).toBe("2026-09-28T23:21");
    // G7 PASS rests on tou.txt:447, and the bot clause on :471: the 28.9 text, which the live capture no longer has there.
    expect(lineOf("displate-about-regulations-2026-09-28", "txt", 447)).toMatch(/^The User has the option to convert their Account and register as an Artist/);
    expect(lineOf("displate-about-regulations-2026-09-28", "txt", 471)).toMatch(/^The Service Provider reserves the right to delete Accounts/);
    // The menu lines named at line 8 are the faq copy's, named in full.
    expect(w).toContain("(`displate-com-about-faq-2026-09-28.txt:38-43`)");
  });

  it("html5-syndication.md cites the html line that holds the edit date, in the copy the line was written against", () => {
    const h = read("research/measurements/html5-syndication.md").split("\n");
    const sdk = h.find((l) => l.includes('datetime="2021-12-09'));
    const faq = h.find((l) => l.includes('datetime="2018-04-16'));
    expect(sdk).toContain("gamedistribution-sdk-implementation-2026-09-28.txt:154");
    expect(faq).toContain("gamedistribution-wiki-faq-2026-09-28.");
    expect(lineOf("gamedistribution-sdk-implementation-2026-09-28", "html", 713)).toContain('datetime="2021-12-09');
    expect(lineOf("gamedistribution-wiki-faq-2026-09-28", "html", 713)).toContain('datetime="2018-04-16');
  });

  it("polar-rail.md names copies whose metas say what its source lines say (fetchedAt, sha256, byteLength)", () => {
    const p = read("research/measurements/polar-rail.md");
    for (const [slug, fetchedAt, sha] of [
      ["polar-supported-countries-2026-09-28", "2026-09-28T01:55:22", "05cc3bd8"],
      ["polar-acceptable-use-2026-09-28", "2026-09-28T07:15:22", "73feedd2721f"],
      ["polar-fees-2026-09-28", "2026-09-28T07:15:23", "468d494c9cb9"],
    ]) {
      expect(p, slug).toContain(slug);
      expect(metaOf(slug).fetchedAt.slice(0, 19), slug).toBe(fetchedAt);
      expect(metaOf(slug).sha256.startsWith(sha), slug).toBe(true);
    }
    expect(p).not.toMatch(/polar-(supported-countries|acceptable-use|fees)-2026-09-29/);
  });

  it("names the frozen D2D terms and Invoice4u price list where their bare lines are cited", () => {
    expect(read("research/measurements/teacher-and-ebook-stores.md")).toContain("`draft2digital-com-terms-of-service-2026-09-28` (200, 768 lines)");
    expect(read("research/measurements/israeli-invoicing-free-tiers.md")).toContain("## Invoice4u (`invoice4u-pricelist-2026-09-29`)");
    expect(lineOf("draft2digital-com-terms-of-service-2026-09-28", "txt", 490)).toMatch(/To use the Program, you must open an account, which is free/);
  });

  it("the Kokoro licence notes cite the card each was written against: training on closed TTS models' audio", () => {
    // LICENSES.md:9 was written on 29.9 (6f9f8f2) against the 28.9 20:32Z fetch; the t1 render report on 27.9 (78fafc9)
    // against the 25.9 fetch. Line 233 says the same in both; the lines after it (:245-:267) moved in between.
    for (const [file, card] of [
      ["products/parent-guides/LICENSES.md", "kokoro-82m-model-card-2026-09-28"],
      ["products/chart-explainer/releases/t1/render-report.json", "kokoro-82m-model-card-2026-09-25"],
    ]) {
      expect(lineOf(card, "txt", 233), card).toMatch(/^Synthetic audio \[1\] generated by closed \[2\] TTS models/);
      expect(read(file), file).toContain(`research/rendered/${card}.txt:233`);
    }
    expect(metaOf("kokoro-82m-model-card-2026-09-28").fetchedAt).toBe("2026-09-28T20:32:16.298Z");
    expect(metaOf("kokoro-82m-model-card-2026-09-25").fetchedAt).toBe("2026-09-25T16:04:30.468Z");
  });

  it("TERMS-AUDIT cites the frozen IRS meta's url, fetchedAt and status lines, not the slug line the freeze renamed", () => {
    const audit = read("research/channel-loop/TERMS-AUDIT-2026-09-29.md");
    expect(audit).toContain("irs-us-israel-treaty-2026-09-25.meta.json:2, :4-5");
    expect(lineOf("irs-us-israel-treaty-2026-09-25", "meta.json", 2)).toMatch(/"url"/);
    expect(lineOf("irs-us-israel-treaty-2026-09-25", "meta.json", 4)).toMatch(/"fetchedAt"/);
    expect(lineOf("irs-us-israel-treaty-2026-09-25", "meta.json", 5)).toMatch(/"status"/);
  });
});

describe("scanCitations reads every citation form the notes use", () => {
  const known = new Set(["live-page", "other-page", "a.bin-x", "help-x-article-677-earnings", "live-page-2026-09-28"]);
  const text = [
    /* 1 */ "research/rendered/live-page.txt:12 and live-page.html:3-4, also `:40`",
    /* 2 */ "| Short | Capture |",
    /* 3 */ "| `R-LP` | `live-page.txt` | 2026-09-29 |",
    /* 4 */ "It says so (`R-LP:7`, `:9`).",
    /* 5 */ "live-page.html:5 links it; PAT:108, :118 are another file's lines.",
    /* 6 */ "research/rendered/live-page.txt, fetched 2026-09-29T11:30:37Z, has the section at :563.",
    /* 7 */ "paused-page.txt:5 and research/rendered/retired-page.txt:6 are not re-fetched; some-script.js:5 is not a capture.",
    /* 8 */ "research/rendered/live-page.txt names it without a line.",
    /* 9 */ "## 4. The terms",
    /* 10 */ 'Capture: `live-page` (200, fetchedAt 2026-09-28T21:03Z). Read in full (lp.txt:90-945, "in force", :945). Short name `lp`.',
    /* 11 */ "- The bot clause (lp.txt:471), the form (lp.html:640).",
    /* 12 */ "  :473 goes on.",
    /* 13 */ "## 5. More forms",
    /* 14 */ ":12 belongs to no capture here.",
    /* 15 */ "[the clause](../rendered/live-page.txt:21) and [again](../../research/rendered/live-page.txt:22)",
    /* 16 */ "research/rendered/live-page.txt#L23, research/rendered/live-page.txt:L24, research/rendered/live-page.txt:25–26",
    /* 17 */ "research/rendered/live-page.txt line 27 and research/rendered/live-page.txt: 28",
    /* 18 */ "`live-page`.txt:29 and live-page:30; research/rendered/live-page.txt: 2026-09-29 is a date.",
    /* 19 */ "The capture `research/rendered/live-page.{txt,html}` (200) says so at :31, and the html has it at :713.",
    /* 20 */ "| `AUP` | `live-page.txt`, `live-page.html` |",
    /* 21 */ "| `B.1` | `live-page.txt` (row 12) |",
    /* 22 */ "It says (AUP:32, B.1:33).",
    /* 23 */ "Short names: `677` = `…-article-677-earnings` (row 136), `OP` = `research/rendered/other-page`.",
    /* 24 */ "In 677 (677.html:1656, :1659); OP:34.",
    /* 25 */ "research/rendered/a.bin-x.txt:5 and a.bin-x.txt:6",
    /* 26 */ "- `live-page` (row 132, short name `lv`): 2,322 bytes (`lv.meta.json:7`, `.txt:1`); `*.meta.json:5`.",
    /* 27 */ "The frozen copy live-page-2026-09-28.txt:3 is not the live one; research/channel-loop/terms-verdicts.json (`:163-166`).",
  ].join("\n");
  const { citations, unattributed, others } = scanCitations(text, known) as { citations: Citation[]; unattributed: { fileLine: number; text: string }[]; others: Other[] };
  const show = (c: Citation) => `${c.fileLine} ${c.text} ${JSON.stringify(c.lines)}`;
  const of = (slug: string) => citations.filter((c) => c.slug === slug);

  it("takes paths, short names, braces, mentions, backticks, anchors and line words, each with the lines written after it", () => {
    expect(byLine(of("live-page")).map(show)).toEqual([
      "1 research/rendered/live-page.txt:12 [[12,12]]",
      "1 live-page.html:3-4 [[3,4],[40,40]]",
      "3 live-page.txt [[7,7],[9,9]]",
      "4 R-LP:7 [[7,7],[9,9]]",
      // :118 follows PAT:108, another file's reference: it is not attributed to the capture.
      "5 live-page.html:5 [[5,5]]",
      // A time is not a reference, so :563 is the capture's line: a citation without a line of its own, cited by line.
      "6 research/rendered/live-page.txt [[563,563]]",
      // A prose short name: every lp.txt:N, lp.html:N, and the :N that starts a later line of the section.
      "10 live-page [[90,945],[945,945],[471,471],[640,640],[473,473]]",
      "10 lp.txt:90-945 [[90,945],[945,945]]",
      "11 lp.txt:471 [[471,471]]",
      "11 lp.html:640 [[640,640],[473,473]]",
      "15 ../rendered/live-page.txt:21 [[21,21]]",
      "15 ../../research/rendered/live-page.txt:22 [[22,22]]",
      "16 research/rendered/live-page.txt#L23 [[23,23]]",
      "16 research/rendered/live-page.txt:L24 [[24,24]]",
      "16 research/rendered/live-page.txt:25–26 [[25,26]]",
      "17 research/rendered/live-page.txt [[27,27]]",
      "17 research/rendered/live-page.txt: 28 [[28,28]]",
      "18 `live-page`.txt:29 [[29,29]]",
      "18 live-page:30 [[30,30]]",
      "19 research/rendered/live-page.{txt,html} [[31,31],[713,713]]",
      // A table row with two files of the capture, or text after it, and a short name with a dot.
      "20 live-page.txt [[32,32]]",
      "21 live-page.txt [[33,33]]",
      "22 AUP:32 [[32,32]]",
      "22 B.1:33 [[33,33]]",
      // "(row 132, short name `lv`)" names the capture before it; `.txt:1` and `*.meta.json:5` are its files' lines.
      "26 live-page [[7,7],[1,1],[5,5]]",
      "26 lv.meta.json:7 [[7,7],[1,1],[5,5]]",
    ]);
    // Without a line: the name alone, a date after ": ", the second file on a short-name row.
    expect(of("live-page").filter((c) => c.lines.length === 0).map((c) => c.fileLine)).toEqual([8, 18, 20]);
  });

  it("gives each line the file it is in: the html when the sentence says so, the extension after a short name", () => {
    const brace = of("live-page").find((c) => c.form === "brace") as Citation;
    expect(brace.refs.map((r) => `${r.range[0]} ${r.ext}`)).toEqual(["31 txt", "713 html"]);
    const lv = of("live-page").find((c) => c.fileLine === 26 && !c.alias) as Citation;
    expect(lv.refs.map((r) => `${r.range[0]} ${r.ext}`)).toEqual(["7 meta.json", "1 txt", "5 meta.json"]);
    expect(lv.aliasFor).toBe("lv");
  });

  it("reads short-name pairs, including a slug named by its end, and a slug with a dot and an extension inside it", () => {
    expect(of("help-x-article-677-earnings").map(show)).toEqual(["23 …-article-677-earnings [[1656,1656],[1659,1659]]", "24 677.html:1656 [[1656,1656],[1659,1659]]"]);
    expect(of("other-page").map(show)).toEqual(["23 research/rendered/other-page [[34,34]]", "24 OP:34 [[34,34]]"]);
    expect(of("a.bin-x").map((c) => `${c.slug} ${c.ext} ${JSON.stringify(c.lines)}`)).toEqual(["a.bin-x txt [[5,5]]", "a.bin-x txt [[6,6]]"]);
    expect(of("live-page-2026-09-28").map(show)).toEqual(["27 live-page-2026-09-28.txt:3 [[3,3]]"]);
  });

  it("gives a line reference that starts a line to the section's capture, even one named without a line", () => {
    // teacher-and-ebook-stores.md names draft2digital-com-terms-of-service once, without an extension, and its D2D
    // section then cites the terms by bare lines that start list items, paragraphs after the name.
    const note = [
      "## D2D",
      "Capture: `live-page` (200, 768 lines).",
      "",
      "- `:490-491` the account is free; `:33` too.",
      "## Next",
      "- `:12` belongs to no capture.",
    ].join("\n");
    const scan = scanCitations(note, known);
    expect(scan.citations.map((c: Citation) => `${c.fileLine} ${c.slug} ${JSON.stringify(c.lines)}`)).toEqual(["2 live-page [[490,491],[33,33]]"]);
    expect(scan.unattributed.map((u: { text: string }) => u.text)).toEqual([":12"]);
  });

  it("takes urls.txt for the list it is, not a capture", () => {
    const scan = scanCitations("Queued at research/rendered/urls.txt:111 and research/rendered/live-page.txt:5.", known);
    expect(scan.citations.map((c: Citation) => `${c.slug} ${JSON.stringify(c.lines)}`)).toEqual(["live-page [[5,5]]"]);
  });

  it("in JSON, gives a line's references only to a capture named on that line: each string value stands alone", () => {
    const json = [
      '  { "evidence": "research/rendered/live-page.txt:12 says so, and :14." },',
      '  { "evidence": "OSS VRP rules lines 341-346 exclude them; the CoC at :86-90." },',
    ].join("\n");
    expect(scanOptions("research/x/results.json")).toEqual({ carry: true, lineParagraphs: true });
    expect(scanOptions("research/x/note.md")).toEqual({ carry: true, lineParagraphs: false });
    expect(scanOptions("src/x.ts")).toEqual({ carry: false, lineParagraphs: false });
    const scan = scanCitations(json, known, scanOptions("research/x/results.json"));
    expect(scan.citations.map((c: Citation) => `${c.slug} ${JSON.stringify(c.lines)}`)).toEqual(["live-page [[12,12],[14,14]]"]);
    expect(scan.unattributed.map((u: { text: string }) => u.text)).toEqual(["lines 341-346", ":86-90"]);
    // In a note the same two lines are one paragraph, and the second line's references go to the capture.
    expect(scanCitations(json, known, scanOptions("research/x/note.md")).citations[0].lines).toEqual([[12, 12], [14, 14], [341, 346], [86, 90]]);
  });

  it("gives a reference carried from an earlier line the capture's own file, not an html short-name reference's", () => {
    const note = [
      "Capture: `live-page` (200). Short name `lp`. The html body is one line, so every html citation is `lp.html:115`. The",
      "menus (:38-43) and the officer (:153) are not reproduced; `lp.html:115` again, and there :116.",
      "The `.html:615` holds the posts",
      "  (:655), and `lp.txt:2` the title.",
      "- A path: research/rendered/other-page.html:5, and",
      "  :7 goes on.",
    ].join("\n");
    const { citations } = scanCitations(note, known) as { citations: Citation[] };
    const anchor = citations.find((c) => c.slug === "live-page" && !c.alias) as Citation;
    expect(anchor.refs.map((r) => `${r.range[0]} ${r.ext}`)).toEqual(["115 html", "38 null", "153 null", "115 html", "116 html", "615 html", "655 html", "2 txt"]);
    const other = citations.find((c) => c.slug === "other-page") as Citation;
    expect(other.refs.map((r) => `${r.range[0]} ${r.ext}`)).toEqual(["5 html", "7 html"]);
  });

  it("gives a line after the note (\"the note\", \"note `:N`\") to the note, not to a capture named before it", () => {
    // SITTING-2026-10-01-BRIEF.md summarises a research note: "note `:545`" and "the note's inference (`:79`)" are the
    // note's lines, and a reference that goes on into the next line stays the note's. A page's own note ("an install
    // note (`:115`)", docs/REJECTED.md; "a GameMaker note (`:8831`", wavedash.md) is the page's line.
    const brief = [
      "Rendered (`live-page.txt:219`, `:221`); the note's inference (`:79`, `:565`) and note `:545`, `:555`.",
      "  (`:573`) goes on, as the note cites `:54`.",
      "The page (`live-page.txt:300`) has an install note (`:222`) and a GameMaker note (`:223`).",
      // A line break inside "the note's" or "(note `:594`)" (SITTING-2026-10-01-BRIEF.md:682-683, :730-731).
      "So (`live-page.txt:400`) and the",
      "  note's inference (`:79`, `:565`); the opt-in (`live-page.txt:500`) (note",
      "  `:594`).",
    ].join("\n");
    const { citations } = scanCitations(brief, known) as { citations: Citation[] };
    expect(citations.map((c) => `${c.slug} ${JSON.stringify(c.lines)}`)).toEqual([
      "live-page [[219,219],[221,221]]",
      "live-page [[300,300],[222,222],[223,223]]",
      "live-page [[400,400]]",
      "live-page [[500,500]]",
    ]);
  });

  it("keeps what is no capture out: another file's lines, a paused short name, a line after no name", () => {
    // A short name is a capture only when it is a known one; a full path always is.
    expect(citations.filter((c) => !known.has(c.slug)).map((c) => c.slug)).toEqual(["retired-page"]);
    expect(others.map((o) => `${o.fileLine} ${o.text}`)).toEqual(["7 paused-page.txt:5"]);
    // A path to another file (a note, a verdicts file) owns the bare lines after it.
    expect(citations.filter((c) => c.lines.some(([x]) => x === 163))).toEqual([]);
    // A heading ends the section: :12 belongs to nothing, and the scan says so.
    expect(unattributed.map((u) => `${u.fileLine} ${u.text}`)).toEqual(["14 :12"]);
  });
});
