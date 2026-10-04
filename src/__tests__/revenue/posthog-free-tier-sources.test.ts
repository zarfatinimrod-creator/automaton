import { createHash } from "node:crypto";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { describe, expect, it } from "vitest";

/**
 * Tick 40 review, defect 6. research/measurements/posthog-free-tier.md answers documents ruling (c) from GitHub-hosted
 * files at two pinned commits and quotes them by line. Its "78/78 quotes found" check lived only in a scratch folder,
 * and a quote changed to a number the source does not say (retention "1 year" to "2 years", the reviewer's mutation R1)
 * passed every committed test.
 *
 * The files the licences let us keep are now committed under SOURCES, each with the sha256 the note's table states:
 * PostHog/posthog.com's /contents/ folder is MIT and PostHog/posthog is MIT Expat outside ee/, and each pin's LICENSE
 * is copied beside its files. The three posthog.com files outside /contents/ (src/: the pricing FAQ data and two
 * product-data hooks) carry "Please do not duplicate, copy, or use our website" (LICENSE:5-6): they are listed with
 * their hash and not copied, and their quotes are pinned in REFERENCE_ONLY as read at the pinned commit on 4.10.2026.
 *
 * The check: every quote ("…" or, in a table's Quote column, `code`) in a table row, and every "…" quote in a prose
 * paragraph or list item that cites a PC or PH file or the terms reference by line, is on the lines its row or item
 * cites, in a committed copy or, for a src/ file, in REFERENCE_ONLY. Every such citation resolves to one file and fits
 * inside it. Items citing only our own repository are not checked here (those files move; the note dates its reads).
 */

const NOTE = "research/measurements/posthog-free-tier.md";
const SOURCES = "research/measurements/posthog-free-tier-sources";
const MANIFEST = `${SOURCES}/SOURCES.json`;
const TERMS_DIR = "research/channel-loop/terms";

type Pin = "PC" | "PH";
type Entry = { pin: Pin; path: string; lines: number; bytes: number; sha256: string; copied: boolean };
type Manifest = { _about: string; pins: Record<Pin, { repo: string; commit: string; licence: string }>; files: Entry[] };

const sha256 = (b: Buffer | string) => createHash("sha256").update(b).digest("hex");
const newlines = (b: Buffer) => b.toString("utf8").split("\n").length - 1;
const manifest = () => JSON.parse(readFileSync(MANIFEST, "utf8")) as Manifest;

/**
 * Quotes from the three posthog.com src/ files, which are not copied: [path, first line, last line, the quote as the
 * note writes it]. Each was found on its lines in the file fetched at PC on 4.10.2026 (sha256 in SOURCES.json); a
 * re-fetch at the pinned commit re-checks them. An entry no row or item uses fails the test, so the list cannot rot.
 */
const PRICING = "src/pages-content/pricing-data.js";
const REFERENCE_ONLY: [string, number, number, string][] = [
  [PRICING, 139, 140, "PostHog is free to use and each product has a generous free monthly allowance (1M events for analytics, 5K session replays, 1M feature flag requests, and more)."],
  [PRICING, 309, 309, "Yes, as long as you stay under the free tier limits."],
  [PRICING, 306, 306, "Can I use PostHog completely free forever?"],
  [PRICING, 237, 238, "PostHog's free tier doesn't expire … no credit card or sales call required."],
  ["src/hooks/productData/product_analytics.tsx", 39, 39, "You get 1 million events free every month."],
  [PRICING, 170, 171, "Every month, your usage is reset and you get another 1M events, 5K session replays, and more to use."],
  [PRICING, 160, 162, "On the free plan, any additional events are permanently dropped and feature flags will return a default quota limited response."],
  [PRICING, 160, 160, "On the pay-as-you-go plan, we charge based on usage for everything above the free allowance."],
  [PRICING, 101, 101, "(though you will need to enter your credit card to unlock those features)"],
  [PRICING, 68, 68, "There are no additional storage costs or fees."],
  ["src/hooks/productData/endpoints.tsx", 32, 32, "free during beta. When pricing ships, it will be usage-based with a generous monthly free tier"],
  [PRICING, 77, 78, "Events and metadata are guaranteed to be retained for 7 years on any paid plan and 1 year on a free plan."],
];

// ── The note, read as rows and items ─────────────────────────────────────────

type Tok = { kind: "quote" | "code"; text: string; col: number; before: string };

/** Split a line of the note into "…" quotes and `code` spans, with the table column each is in (0 before any |). */
function tokenize(s: string): Tok[] {
  const out: Tok[] = [];
  let col = 0;
  let plain = "";
  for (let i = 0; i < s.length; ) {
    const c = s[i];
    if (c === "|") {
      col++;
      plain = "";
      i++;
    } else if (c === "`") {
      const j = s.indexOf("`", i + 1);
      if (j < 0) throw new Error(`unclosed \` in: ${s}`);
      out.push({ kind: "code", text: s.slice(i + 1, j), col, before: plain });
      plain = "";
      i = j + 1;
    } else if (c === '"') {
      let text = "";
      let j = i + 1;
      for (; j < s.length && s[j] !== '"'; j++) {
        if (s[j] === "\\" && s[j + 1] === '"') {
          text += '"';
          j++;
        } else text += s[j];
      }
      if (j >= s.length) throw new Error(`unclosed " in: ${s}`);
      out.push({ kind: "quote", text, col, before: plain });
      plain = "";
      i = j + 1;
    } else {
      plain += c;
      i++;
    }
  }
  return out;
}

type Ref = { file: string; copy: string | null; lines: number; a: number; b: number; token: string };
type Item = { where: string; quotes: string[]; refs: Ref[]; errors: string[] };

const REF = /^(.+?):(\d+)(?:-(\d+))?$/;
const CONT = /^:(\d+)(?:-(\d+))?$/;
const TERMS_REF = /(?:^|\/)(posthog-(?:terms|privacy)-2026-10-04\.md)$/;

/** The lines of a terms reference that are quoted original text (inside an excerpt's fenced block). */
function termsQuoted(file: string): [number, number][] {
  const lines = readFileSync(file, "utf8").split("\n");
  const out: [number, number][] = [];
  for (let i = 0; i < lines.length; i++) {
    if (!lines[i].startsWith("<!-- excerpt: original lines ")) continue;
    const end = lines.indexOf("```", i + 2);
    out.push([i + 3, end]);
    i = end;
  }
  return out;
}

/** Read the note into table rows (Question tables) and prose items, each with its quotes and its PC/PH/terms citations. */
function readNote(text: string, m: Manifest): Item[] {
  const resolve = (pin: Pin, p: string): Entry[] => m.files.filter((f) => f.pin === pin && (f.path === p || f.path.endsWith(`/${p}`)));
  const items: Item[] = [];

  const collect = (where: string, toks: Tok[], quoteCols: ((t: Tok) => boolean) | null, refCol: number | null) => {
    const item: Item = { where, quotes: [], refs: [], errors: [] };
    let last: { file: string; copy: string | null; lines: number } | null = null;
    for (const t of toks) {
      if (quoteCols ? quoteCols(t) : t.kind === "quote") item.quotes.push(t.text);
      if (t.kind !== "code" || (refCol !== null && t.col !== refCol)) continue;
      const cont = t.text.match(CONT);
      const ref = cont ? null : t.text.match(REF);
      if (!cont && !ref) continue;
      if (ref) {
        const pin = t.before.match(/\b(PC|PH)\s*$/)?.[1] as Pin | undefined;
        const terms = ref[1].match(TERMS_REF);
        if (pin) {
          const hits = resolve(pin, ref[1]);
          if (hits.length !== 1) {
            item.errors.push(`${pin} \`${t.text}\`: ${hits.length} files in SOURCES.json match ${ref[1]}`);
            last = null;
            continue;
          }
          const e = hits[0];
          last = { file: `${pin} ${e.path}`, copy: e.copied ? join(SOURCES, pin, e.path) : null, lines: e.lines };
        } else if (terms) {
          const file = join(TERMS_DIR, terms[1]);
          last = { file, copy: file, lines: readFileSync(file, "utf8").split("\n").length };
        } else {
          last = null; // our own repository: not checked here
          continue;
        }
      }
      if (!last) continue;
      const m2 = (cont ?? ref)!;
      const [a, b] = cont ? [Number(m2[1]), Number(m2[2] ?? m2[1])] : [Number(m2[2]), Number(m2[3] ?? m2[2])];
      if (!(a >= 1 && b >= a && b <= last.lines)) item.errors.push(`\`${t.text}\` (${last.file}): lines ${a}-${b} are not inside its ${last.lines}`);
      else item.refs.push({ ...last, a, b, token: t.text });
    }
    if (item.refs.length || item.errors.length) items.push(item);
  };

  const lines = text.split("\n");
  let header: string[] | null = null;
  let para: { at: number; text: string } | null = null;
  const flush = () => {
    if (para) collect(`${NOTE}:${para.at}`, tokenize(para.text), null, null);
    para = null;
  };
  for (let i = 0; i < lines.length; i++) {
    const l = lines[i];
    if (l.startsWith("|")) {
      flush();
      if (/^\|[-|: ]+\|$/.test(l)) continue;
      if (/^\|[-|: ]+\|$/.test(lines[i + 1] ?? "")) {
        header = l.split("|").map((c) => c.trim());
        continue;
      }
      if (header?.[1] === "Question") {
        // Columns: 1 Question, 2 Finding, 3 Quote, 4 Source, 5 Grade. Quotes: "…" in Finding and Quote, `code` in Quote.
        const quoteCols = (t: Tok) => (t.kind === "quote" && (t.col === 2 || t.col === 3)) || (t.kind === "code" && t.col === 3);
        collect(`${NOTE}:${i + 1}`, tokenize(l), quoteCols, 4);
      }
      continue;
    }
    header = null;
    if (l.trim() === "" || l.startsWith("#")) {
      flush();
      continue;
    }
    if (/^(\d+\.|-) /.test(l) || !para) {
      flush();
      para = { at: i + 1, text: l.trim() };
    } else para.text += ` ${l.trim()}`;
  }
  flush();
  return items;
}

const sourceCache = new Map<string, string[]>();
function sourceText(r: Ref): string {
  if (!sourceCache.has(r.copy!)) sourceCache.set(r.copy!, readFileSync(r.copy!, "utf8").split("\n"));
  return sourceCache
    .get(r.copy!)!
    .slice(r.a - 1, r.b)
    .map((l) => l.trim().replace(/<\/?b>/g, ""))
    .join(" ");
}

/** Every quote of the note on the lines it cites; returns what failed, and what was checked. */
function checkQuotes(text: string) {
  const m = manifest();
  const failures: string[] = [];
  const used = new Set<number>();
  let quotes = 0;
  for (const item of readNote(text, m)) {
    failures.push(...item.errors.map((e) => `${item.where}: ${e}`));
    for (const r of item.refs) {
      if (r.file.startsWith(TERMS_DIR) && !termsQuoted(r.file).some(([s, e]) => r.a >= s && r.b <= e)) {
        failures.push(`${item.where}: \`${r.token}\` is not inside a quoted excerpt of ${r.file}`);
      }
    }
    for (const q of item.quotes) {
      quotes++;
      const fragments = q
        .split("…")
        .map((f) => f.trim())
        .filter((f) => /[A-Za-z0-9]/.test(f));
      const copied = item.refs.filter((r) => r.copy);
      if (fragments.length && fragments.every((f) => copied.some((r) => sourceText(r).includes(f)))) continue;
      const k = REFERENCE_ONLY.findIndex(
        ([p, a, b, quote]) => quote === q && item.refs.some((r) => !r.copy && r.file === `PC ${p}` && r.a <= a && r.b >= b),
      );
      if (k >= 0) {
        used.add(k);
        continue;
      }
      failures.push(`${item.where}: "${q}" is not on the lines this item cites (${item.refs.map((r) => `${r.file}:${r.a}-${r.b}`).join(", ")})`);
    }
  }
  return { failures, quotes, unused: REFERENCE_ONLY.filter((_, k) => !used.has(k)) };
}

// ── The tests ────────────────────────────────────────────────────────────────

describe("the free-tier note's GitHub sources (tick 40 review, defect 6)", () => {
  it("pins both repositories to one commit each, with each licence's terms", () => {
    const m = manifest();
    expect(m.pins.PC).toMatchObject({ repo: "PostHog/posthog.com", commit: "4c27ff7578f24c75b40d1024e4e0cbd40c9922ba" });
    expect(m.pins.PH).toMatchObject({ repo: "PostHog/posthog", commit: "526d64dd82340b1bf4293d6d9baea7e965997048" });
    const note = readFileSync(NOTE, "utf8");
    expect(note).toContain(`PostHog/posthog.com@${m.pins.PC.commit}`);
    expect(note).toContain(`PostHog/posthog@${m.pins.PH.commit}`);
    // The MIT notices travel with the copies: PC's LICENSE grants MIT for /contents/ only, PH's MIT Expat outside ee/.
    const pc = readFileSync(join(SOURCES, "PC", "LICENSE"), "utf8").split("\n");
    expect(pc[11]).toBe("# For content in the /contents/ folder");
    expect(pc.slice(15, 18).join(" ")).toContain("Permission is hereby granted, free of charge, to any person obtaining a copy");
    expect(readFileSync(join(SOURCES, "PH", "LICENSE"), "utf8")).toContain('is available under the "MIT Expat" license');
  });

  it("keeps every copied file byte for byte as listed, copies only what the licences allow, and nothing else", () => {
    const m = manifest();
    const listed = new Set<string>();
    for (const f of m.files) {
      const at = join(SOURCES, f.pin, f.path);
      if (!f.copied) {
        expect(existsSync(at), at).toBe(false);
        expect(f.pin === "PC" && !f.path.startsWith("contents/") && f.path !== "LICENSE", at).toBe(true);
        continue;
      }
      listed.add(at);
      expect(f.pin === "PH" ? !f.path.startsWith("ee/") : f.path.startsWith("contents/") || f.path === "LICENSE", at).toBe(true);
      const raw = readFileSync(at);
      expect({ sha256: sha256(raw), bytes: raw.length, lines: newlines(raw) }, at).toEqual({ sha256: f.sha256, bytes: f.bytes, lines: f.lines });
    }
    const walk = (d: string): string[] => readdirSync(d).flatMap((n) => (statSync(join(d, n)).isDirectory() ? walk(join(d, n)) : [join(d, n)]));
    const onDisk = walk(SOURCES).filter((p) => p !== MANIFEST);
    expect(onDisk.filter((p) => !listed.has(p)).map((p) => relative(SOURCES, p))).toEqual([]);
  });

  it("lists exactly the files the note's table says were read, with the table's line counts and hash prefixes", () => {
    const m = manifest();
    const table = readFileSync(NOTE, "utf8")
      .split("\n")
      .map((l) => l.match(/^\| (PC|PH) \| `([^`]+)`[^|]*\| (\d+) \| `([0-9a-f]{16})…` \|/))
      .filter((x): x is RegExpMatchArray => x !== null)
      .map(([, pin, path, lines, prefix]) => ({ pin, path, lines: Number(lines), prefix }));
    expect(table.length).toBe(m.files.length);
    for (const row of table) {
      const f = m.files.find((x) => x.pin === row.pin && x.path === row.path);
      expect(f, `${row.pin} ${row.path}`).toBeDefined();
      expect(f!.lines, row.path).toBe(row.lines);
      expect(f!.sha256.startsWith(row.prefix), row.path).toBe(true);
    }
  });

  it("finds every quote on the lines it cites, and uses every reference-only quote", () => {
    const { failures, quotes, unused } = checkQuotes(readFileSync(NOTE, "utf8"));
    expect(failures).toEqual([]);
    expect(unused).toEqual([]);
    // 69 quotes on 4.10.2026 (57 on committed copies, 12 reference-only): a floor, so the check cannot quietly read nothing.
    expect(quotes).toBeGreaterThanOrEqual(69);
  });

  it("fails on a quote that says what the source does not, a citation moved off its quote, and an unknown file", () => {
    const note = readFileSync(NOTE, "utf8");
    const swap = (a: string, b: string) => {
      expect(note).toContain(a);
      return note.replace(a, b);
    };
    // The reviewer's R1: the retention quote changed to a number the source does not say.
    expect(checkQuotes(swap('"| Free | 1 year"', '"| Free | 2 years"')).failures.join("\n")).toMatch(/"\| Free \| 2 years" is not on the lines/);
    // A quote of a src/ file (reference-only) changed by one word.
    expect(checkQuotes(swap("You get 1 million events free every month.", "You get 2 million events free every month.")).failures.join("\n")).toMatch(
      /"You get 2 million events free every month\." is not on the lines/,
    );
    // The citation moved off its quote: SQL access on the free plan.
    expect(checkQuotes(swap("PC `contents/docs/sql/index.mdx:5-6`", "PC `contents/docs/sql/index.mdx:7-8`")).failures.join("\n")).toMatch(/"free: full" is not on the lines/);
    // A line past the end of the file, and a path that names no listed file.
    expect(checkQuotes(swap("PC `events-retention.mdx:27`", "PC `events-retention.mdx:39`")).failures.join("\n")).toMatch(/lines 39-39 are not inside its 38/);
    expect(checkQuotes(swap("PC `events-retention.mdx:27`", "PC `retention.mdx:27`")).failures.join("\n")).toMatch(/0 files in SOURCES\.json match retention\.mdx/);
    // A citation of the terms reference moved onto its header.
    expect(checkQuotes(swap("posthog-terms-2026-10-04.md:231-233", "posthog-terms-2026-10-04.md:9-11")).failures.join("\n")).toMatch(/is not inside a quoted excerpt/);
  });
});

describe("the free-tier note's (b): the endpoint's purpose, the connector clause and the row bound (tick 40 review, defects 3, 4, 10)", () => {
  const note = () => readFileSync(NOTE, "utf8");
  const row = (start: string) => note().split("\n").find((l) => l.startsWith(`| ${start} |`)) ?? "";

  it("cites the listed use and the personal-key purpose, quotes the connector clause, and keeps 'may break' apart as reader_down", () => {
    // Defect 3: ":17" (ad-hoc and embedded) does not cover a scheduled weekly read; ":13" and personal-api-keys.mdx:7
    // do, ":20" bars third-party connectors (the reader is not one), and ":22" says pipelines may break at any time.
    const use = row("What the endpoint is for");
    expect(use).toContain('"Pulling aggregated PostHog data into your own or other apps."');
    expect(use).toContain("PC `contents/docs/api/queries.mdx:13`");
    const c = row("Third-party connectors");
    expect(c).toContain("Connectors built on `/query` are not supported and will be rate-limited or rejected.");
    expect(c).toContain("PC `queries.mdx:20`");
    expect(c).toContain("PC `contents/docs/api/personal-api-keys.mdx:7`");
    const r = row("Will it keep working?");
    expect(r).toContain('"Pipelines built on `/query` may break at any time."');
    expect(r).toContain("`reader_down`");
    expect(r).toContain("PC `queries.mdx:22`");
    expect(note()).not.toContain("inside the endpoint's stated purpose");
  });

  it("states the row bound as the code computes it, and the backfill burst", () => {
    // Defect 4: sitePaths gives two paths per page (three for the home page), so the bound is paths + 2, not pages + 2.
    const n = note().replace(/\s+/g, " ");
    expect(n).toContain("`sitePaths(pages).length + 2`");
    expect(n).toContain("two paths per page (three for the home page)");
    expect(n).toContain("at most 25 rows on 4.10.2026");
    expect(n).toContain("`MAX_WEEKS_PER_READ`");
    expect(n).not.toContain("at most the site's page count plus two rows");
    expect(n).not.toContain("at most a dozen rows");
  });

  it("cites the ₪0 rule by line, and the cited lines say it (defect 10)", () => {
    expect(note()).toContain("`MISSION.md:352-354`");
    const m = readFileSync("MISSION.md", "utf8").split("\n").slice(351, 354).join(" ");
    expect(m).toContain("₪0 until the ledger shows it works");
    expect(m).toContain("Nothing is bought");
  });
});
