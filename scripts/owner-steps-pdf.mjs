#!/usr/bin/env node
/**
 * Render an owner-facing Hebrew Markdown document (by default docs/OWNER_STEPS.he.md) to a
 * right-to-left A4 PDF with headless Chromium, so the owner gets a file he can open on a
 * phone, print, or forward — not a Markdown source.
 *
 * Why Chromium and not a PDF library: the document is Hebrew with English identifiers,
 * tables and code spans. A browser engine already does bidirectional layout, table
 * pagination and font fallback correctly; every PDF library tried for RTL needs shaping
 * workarounds. Chromium is pre-installed in this container (PLAYWRIGHT_BROWSERS_PATH) and
 * on any machine with Chrome; nothing else is needed beyond `marked` (root devDependency).
 *
 * Usage:
 *   node scripts/owner-steps-pdf.mjs [--in docs/OWNER_STEPS.he.md] [--out docs/OWNER_STEPS.he.pdf] [--png preview.png]
 *
 * --png also writes a screenshot of the first screen so a session can look at the result
 * (Read the PNG) instead of trusting that the PDF "probably" rendered right-to-left.
 * CHROME_BIN overrides browser discovery.
 */
import { readFileSync, writeFileSync, mkdtempSync, existsSync, readdirSync, statSync } from "node:fs";
import { join, resolve, dirname } from "node:path";
import { tmpdir } from "node:os";
import { execFileSync } from "node:child_process";
import { parseArgs } from "node:util";
import { marked } from "marked";

const { values } = parseArgs({
  options: {
    in: { type: "string", default: "docs/OWNER_STEPS.he.md" },
    out: { type: "string", default: "docs/OWNER_STEPS.he.pdf" },
    png: { type: "string" },
  },
});

const projectDir = resolve(dirname(new URL(import.meta.url).pathname), "..");
const inPath = resolve(projectDir, values.in);
const outPath = resolve(projectDir, values.out);

/** Find a Chromium binary: CHROME_BIN, then the Playwright browsers directory, then PATH names. */
export function findChrome(env = process.env) {
  if (env.CHROME_BIN && existsSync(env.CHROME_BIN)) return env.CHROME_BIN;
  const roots = [env.PLAYWRIGHT_BROWSERS_PATH, "/opt/pw-browsers"].filter(Boolean);
  for (const root of roots) {
    if (!existsSync(root)) continue;
    const dirs = readdirSync(root)
      .filter((d) => /^chromium-\d+$/.test(d))
      .sort()
      .reverse();
    for (const d of dirs) {
      const candidate = join(root, d, "chrome-linux", "chrome");
      if (existsSync(candidate)) return candidate;
    }
  }
  for (const name of ["google-chrome", "chromium", "chromium-browser"]) {
    for (const dir of (env.PATH || "").split(":")) {
      const p = join(dir, name);
      if (existsSync(p)) return p;
    }
  }
  throw new Error("No Chromium found. Set CHROME_BIN or install Chrome.");
}

/** The 🔍 marker in the source means "UI path not verified from this container"; a PDF viewer
 *  without an emoji font would show a box, so it becomes a text badge with the same meaning. */
export function toHtml(markdown, { title = "OWNER_STEPS" } = {}) {
  const body = marked.parse(markdown, { gfm: true, breaks: false })
    .replace(/🔍/g, '<span class="badge">לא אומת מכאן</span>')
    // A step order like "1 → 2 → 3" inside Hebrew text is laid out by the bidi algorithm as
    // "3 ← 2 ← 1", which a reader takes as the reverse order. Isolate such runs left-to-right.
    .replace(/(\d+(?:\s*→\s*\d+)+)/g, '<span dir="ltr" style="unicode-bidi:isolate">$1</span>');
  return `<!doctype html>
<html dir="rtl" lang="he">
<head>
<meta charset="utf-8">
<title>${title}</title>
<style>
  @page { size: A4; margin: 16mm 15mm 18mm 15mm; }
  html { direction: rtl; }
  body { font-family: "DejaVu Sans", "FreeSans", "Liberation Sans", "Noto Sans Hebrew", sans-serif;
         font-size: 11pt; line-height: 1.55; color: #111; margin: 0; }
  h1 { font-size: 20pt; margin: 0 0 6pt; line-height: 1.25; }
  h2 { font-size: 15pt; margin: 18pt 0 6pt; padding-top: 6pt; border-top: 1.5pt solid #444; break-after: avoid; }
  h3 { font-size: 12pt; margin: 12pt 0 4pt; break-after: avoid; }
  p { margin: 5pt 0; }
  ul, ol { margin: 4pt 0 6pt; padding-inline-start: 22pt; }
  li { margin: 2pt 0; }
  strong { font-weight: 700; }
  hr { border: 0; border-top: 0.8pt solid #999; margin: 12pt 0; }
  a { color: #0645ad; text-decoration: none; word-break: break-all; }
  code { font-family: "Liberation Mono", "DejaVu Sans Mono", monospace; font-size: 9.5pt;
         direction: ltr; unicode-bidi: embed; background: #f3f3f3; padding: 0 3pt; border-radius: 2pt; }
  pre { direction: ltr; text-align: left; background: #f3f3f3; padding: 6pt 8pt; font-size: 9pt;
        white-space: pre-wrap; break-inside: avoid; }
  pre code { background: none; padding: 0; }
  table { border-collapse: collapse; width: 100%; margin: 6pt 0 10pt; font-size: 10pt; }
  th, td { border: 0.7pt solid #777; padding: 4pt 6pt; vertical-align: top; text-align: right; }
  th { background: #e9e9e9; }
  tr { break-inside: avoid; }
  .badge { display: inline-block; font-size: 8.5pt; font-weight: 700; color: #7a4a00; background: #fff1d6;
           border: 0.6pt solid #d9a441; border-radius: 3pt; padding: 0 4pt; margin: 0 2pt; vertical-align: middle; }
  blockquote { margin: 6pt 0; padding: 2pt 10pt; border-right: 3pt solid #bbb; color: #333; }
</style>
</head>
<body>
${body}
</body>
</html>`;
}

function main() {
  const markdown = readFileSync(inPath, "utf8");
  const html = toHtml(markdown, { title: values.in });
  const work = mkdtempSync(join(tmpdir(), "owner-steps-pdf-"));
  const htmlPath = join(work, "doc.html");
  writeFileSync(htmlPath, html, "utf8");

  const chrome = findChrome();
  const common = ["--headless=new", "--no-sandbox", "--disable-gpu", "--hide-scrollbars"];
  execFileSync(chrome, [...common, "--no-pdf-header-footer", `--print-to-pdf=${outPath}`, `file://${htmlPath}`], {
    stdio: ["ignore", "ignore", "pipe"],
  });
  const bytes = statSync(outPath).size;
  const pages = (readFileSync(outPath, "latin1").match(/\/Type\s*\/Page(?!s)/g) || []).length;
  console.log(`wrote ${values.out}: ${bytes} bytes, ${pages} page(s)`);

  if (values.png) {
    const pngPath = resolve(projectDir, values.png);
    execFileSync(chrome, [...common, "--window-size=900,1273", `--screenshot=${pngPath}`, `file://${htmlPath}`], {
      stdio: ["ignore", "ignore", "pipe"],
    });
    console.log(`preview ${values.png}`);
  }
}

if (process.argv[1] && process.argv[1].endsWith("owner-steps-pdf.mjs")) main();
