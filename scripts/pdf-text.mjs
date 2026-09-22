// Extract text from a PDF with pdfjs-dist (npm i pdfjs-dist in a scratch dir, or add it as a devDependency).
// Usage: node scripts/pdf-text.mjs <in.pdf> <out.txt>  — used 7.9.2026 to read the PCN874 specification
// files that research/rendered/ fetched from a GitHub runner. Not on the CI path; a session tool.
import { readFileSync, writeFileSync } from 'node:fs';
import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs';
const [,, inPath, outPath] = process.argv;
const data = new Uint8Array(readFileSync(inPath));
const doc = await getDocument({ data, useSystemFonts: true, isEvalSupported: false }).promise;
let out = '';
for (let p = 1; p <= doc.numPages; p++) {
  const page = await doc.getPage(p);
  const tc = await page.getTextContent();
  let line = '', lastY = null;
  for (const it of tc.items) {
    if (!('str' in it)) continue;
    const y = Math.round(it.transform[5]);
    if (lastY !== null && Math.abs(y - lastY) > 2) { out += line.trimEnd() + '\n'; line = ''; }
    line += it.str + (it.hasEOL ? '\n' : ' ');
    lastY = y;
  }
  out += line.trimEnd() + `\n\n=== page ${p} end ===\n\n`;
}
writeFileSync(outPath, out, 'utf8');
console.log(`${inPath}: ${doc.numPages} pages, ${out.length} chars → ${outPath}`);
