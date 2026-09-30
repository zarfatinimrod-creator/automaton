import { createHash } from "node:crypto";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import {
  activeCitations,
  activeSlugs,
  byLine,
  decisionFiles,
  findCitations,
  listedNames,
  // @ts-expect-error — plain ESM script, no type declarations by design
} from "../../../scripts/freeze-capture.mjs";

type Citation = {
  file: string;
  slug: string;
  ext: string;
  lines: [number, number][];
  full: boolean;
  alias: string | null;
  aliasFor?: string;
  text: string;
  fileLine: number;
};

const RENDERED = "research/rendered";
const where = (c: Citation) => `${c.file}:${c.fileLine} ${c.text}`;
const metaOf = (slug: string) => JSON.parse(readFileSync(`${RENDERED}/${slug}.meta.json`, "utf8"));

/**
 * Tick 38 (30.9.2026). The weekly render (.github/workflows/render-watch.yml) rewrites a capture in place whenever the
 * page changed, so a research note, ruling or verdict that cites research/rendered/<slug>.txt:NNN can come to point at
 * other text without anyone touching it. It already had: 13 citations by line pointed at text the render had rewritten
 * (the BTL rate lines under step2-cost.md, Displate's bot clause under the loop ruling). Every citation in a decision-bearing
 * file now names a dated frozen copy (scripts/freeze-capture.mjs), which no urls.txt line names and so no render
 * rewrites. This fails when one cites a capture the weekly run can rewrite, by line.
 */
describe("decision-bearing files cite frozen captures, never a live one by line", () => {
  const urls = readFileSync(`${RENDERED}/urls.txt`, "utf8");

  it("reads the files a decision is read from, and no log or capture notes", () => {
    const files: string[] = decisionFiles();
    for (const f of [
      "research/channel-loop/terms-verdicts.json",
      "research/channel-loop/TERMS-AUDIT-2026-09-29.md",
      "research/measurements/actions-spending-limit.md",
      "docs/REJECTED.md",
      "products/il-biz-tools/src/config/osek-zair.json",
      "products/il-biz-tools/README.md",
      "products/README.md",
    ]) {
      expect(files, f).toContain(f);
    }
    expect(files.filter((f) => f.startsWith("logs/") || f.startsWith(`${RENDERED}/`) || f.includes("node_modules"))).toEqual([]);
  });

  it("finds no citation by line of a capture whose urls.txt line is active", () => {
    // The fix for a failure here: node scripts/freeze-capture.mjs --cited (dry run), then --apply.
    expect(byLine(activeCitations({})).map(where)).toEqual([]);
  });

  it("points every citation of a frozen copy at a copy that exists, holds the lines cited, matches its own hash and is on no urls.txt line", () => {
    const all = new Set(readdirSync(RENDERED).filter((f) => f.endsWith(".meta.json")).map((f) => f.slice(0, -".meta.json".length)));
    const listed = listedNames(urls);
    let checked = 0;
    for (const file of decisionFiles() as string[]) {
      for (const c of findCitations(readFileSync(file, "utf8"), all) as Citation[]) {
        if (!all.has(c.slug)) continue;
        const meta = metaOf(c.slug);
        if (!meta.frozen) continue;
        checked += 1;
        expect(listed.has(c.slug), `${where({ ...c, file })}: a urls.txt line names it`).toBe(false);
        expect(meta.slug, c.slug).toBe(c.slug);
        expect(existsSync(meta.frozen.from), `${c.slug}: frozen.from ${meta.frozen.from}`).toBe(true);
        const path = `${RENDERED}/${c.slug}.${c.ext}`;
        expect(existsSync(path), `${where({ ...c, file })}: ${path}`).toBe(true);
        // The citation's own :N (a bare :N after it may name another file's line: the attribution is a heuristic).
        const own = /:(\d+)(?:-(\d+))?$/.exec(c.text);
        if (own) {
          const count = readFileSync(path, "utf8").split("\n").length;
          expect(Number(own[2] ?? own[1]), `${where({ ...c, file })} past the end of ${path}`).toBeLessThanOrEqual(count);
        }
        if (meta.bodyPath && meta.sha256) {
          const sha = createHash("sha256").update(readFileSync(meta.bodyPath)).digest("hex");
          expect(sha, `${c.slug}: the body is not the bytes its meta hashed`).toBe(meta.sha256);
        }
      }
    }
    expect(checked).toBeGreaterThan(300);
  });

  it("repoints the instances tick 36 named to frozen copies that say what the verdicts quote, on the same lines", () => {
    const verdicts = readFileSync("research/channel-loop/terms-verdicts.json", "utf8");
    expect(verdicts).toContain("research/rendered/terms-btl-2026-09-29.txt:303");
    expect(verdicts).toContain("research/rendered/terms-ypay-2026-09-29.txt:55");
    expect(verdicts).not.toMatch(/terms-(btl|ypay)\.txt:/);
    const line = (slug: string, n: number) => readFileSync(`${RENDERED}/${slug}.txt`, "utf8").split("\n")[n - 1];
    expect(line("terms-btl-2026-09-29", 303)).toBe(line("terms-btl", 303));
    expect(line("terms-ypay-2026-09-29", 55)).toMatch(/רובוטים/);
    // actions-spending-limit.md cites by short name (R-GA:502); its capture tables name the frozen copies.
    const asl = readFileSync("research/measurements/actions-spending-limit.md", "utf8");
    expect(asl).toContain("| `R-GA` | `gh-docs-actions-billing-2026-09-29.txt` |");
    expect(asl).toContain("| `R-SB` | `gh-docs-set-up-budgets-2026-09-29.txt` |");
  });

  it("repoints a citation the render had already moved to the capture it was written against, not to today's", () => {
    // step2-cost.md read the BTL pages of 27.9 22:46Z; the render of 29.9 moved the minimum-contribution lines.
    const step2 = readFileSync("research/measurements/step2-cost.md", "utf8");
    expect(step2).toContain("`btl-self-employed-rates-2026-09-27.txt:410`");
    expect(step2).toContain("| `research/rendered/btl-self-employed-rates-2026-09-27.txt` | 2026-09-27T22:46:07Z | 200 |");
    expect(metaOf("btl-self-employed-rates-2026-09-27").fetchedAt).toBe("2026-09-27T22:46:07.842Z");
    const at410 = readFileSync(`${RENDERED}/btl-self-employed-rates-2026-09-27.txt`, "utf8").split("\n")[409];
    expect(at410).toContain('מי שהכנסתו נמוכה מ- 3,442 ש"ח לחודש');
  });

  it("takes every citation form these files use, and only for a capture whose line is active", () => {
    const active = activeSlugs(
      [
        "https://a.example/x\tlive-page",
        "# paused (terms unread): x — https://b.example/y\tpaused-page",
        "# retired (tick 36) — https://c.example/z\tretired-page",
      ].join("\n"),
    );
    expect([...active]).toEqual(["live-page"]);
    const text = [
      "research/rendered/live-page.txt:12 and live-page.html:3-4, also `:40`",
      "| Short | Capture |",
      "| `R-LP` | `live-page.txt` | 2026-09-29 |",
      "It says so (`R-LP:7`, `:9`).",
      "live-page.html:5 links it; PAT:108, :118 are another file's lines.",
      "research/rendered/live-page.txt, fetched 2026-09-29T11:30:37Z, has the section at :563.",
      "paused-page.txt:5 and research/rendered/retired-page.txt:6 are not re-fetched; some-script.js:5 is not a capture.",
      "research/rendered/live-page.txt names it without a line.",
    ].join("\n");
    const found = findCitations(text, active) as Citation[];
    const forLive = found.filter((c) => active.has(c.slug));
    expect(byLine(forLive).map((c: Citation) => `${c.fileLine} ${c.text} ${JSON.stringify(c.lines)}`)).toEqual([
      "1 research/rendered/live-page.txt:12 [[12,12]]",
      "1 live-page.html:3-4 [[3,4],[40,40]]",
      "3 live-page.txt [[7,7],[9,9]]",
      "4 R-LP:7 [[7,7],[9,9]]",
      // :118 follows PAT:108, another file's reference: it is not attributed to the capture.
      "5 live-page.html:5 [[5,5]]",
      // A time is not a reference, so :563 is the capture's line: a citation without a line of its own, cited by line.
      "6 research/rendered/live-page.txt [[563,563]]",
    ]);
    expect(forLive.filter((c) => c.lines.length === 0).map((c) => c.fileLine)).toEqual([8]);
    // A short name is a capture only when it is one being checked; a full path always is.
    expect(found.filter((c) => !active.has(c.slug)).map((c) => c.slug)).toEqual(["retired-page"]);
  });
});
