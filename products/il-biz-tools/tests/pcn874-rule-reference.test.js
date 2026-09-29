// The PCN874 rule reference on pcn874.html (TikTok note N10).
//
// Every check the validator runs, as an error or a warning, with the lines of
// the circular it cites, a plain Hebrew explanation, and then what is not
// checked. It is generated from the validator's own rule table (RULES in
// products/pcn874/src/validate.ts, vendored in src/vendor/pcn874/validate.js),
// so the page and the tool cannot drift apart: the committed section must equal
// what the generator writes, and the build refuses a page whose section is stale.
import { describe, it, expect } from 'vitest';
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { RULES } from '../src/vendor/pcn874/validate.js';
import { kindOf } from '../src/vendor/pcn874/sources.js';
import {
  RULE_REFERENCE_START,
  RULE_REFERENCE_END,
  ruleReferenceRows,
  renderRuleReference,
  withRuleReference,
  ruleReferenceProblems,
  NOT_CHECKED_HE,
  VARIANT_HE,
} from '../src/lib/pcn874-rule-reference.js';
import { ruleHebrew } from '../src/lib/pcn874-report.js';
import { checkPageA11y } from '../src/lib/a11y-check.js';
import { textOf, elementById } from './helpers/html.js';
import { productRoot, copyProduct, removeCopy, runBuild } from './helpers/product-copy.js';

const html = readFileSync(join(productRoot, 'pcn874.html'), 'utf8');
const officialLines = (sources) =>
  sources.filter((s) => kindOf(s) === 'official').map((s) => s.slice(s.lastIndexOf(':') + 1));

describe('the rows, from the validator\'s rule table', () => {
  const rows = ruleReferenceRows();

  it('has one row per row of RULES, in the table\'s order', () => {
    expect(rows.length).toBe(RULES.length);
    rows.forEach((row, i) => {
      expect(row.id).toBe(RULES[i].id);
      expect(row.variant ?? null).toBe(RULES[i].variant ?? null);
    });
  });

  it('gives each row its severity in Hebrew, exactly as the table has it', () => {
    rows.forEach((row, i) => {
      expect(row.severity).toBe(RULES[i].severity);
      expect(row.severityHe).toBe(RULES[i].severity === 'error' ? 'שגיאה' : 'אזהרה');
    });
  });

  it('gives each row the circular\'s lines its table row cites, and says so when it cites none', () => {
    rows.forEach((row, i) => {
      expect(row.lines).toEqual(officialLines(RULES[i].sources));
    });
    const noLine = rows.filter((r) => r.lines.length === 0);
    expect(noLine.map((r) => r.id)).toContain('file.lineEnding.mixed');
    for (const r of noLine) expect(r.linesHe).toContain('אין שורה בחוזר');
  });

  it('explains each row in Hebrew with the validator page\'s own wording', () => {
    for (const row of rows) {
      expect(row.explanation, row.id).toMatch(/[א-ת]/);
      if (!row.variant) expect(row.explanation, row.id).toBe(ruleHebrew(row.id));
    }
    const credit = rows.find((r) => r.id === 'detail.invoiceSumSign.signOfZero' && r.severity === 'warning');
    expect(credit.explanation).toBe(ruleHebrew('detail.invoiceSumSign.signOfZero', { severity: 'warning' }));
  });

  it('has a Hebrew label for every variant the table names, so a new variant turns this red', () => {
    for (const r of RULES.filter((x) => x.variant)) expect(VARIANT_HE[r.variant], r.variant).toMatch(/[א-ת]/);
  });
});

describe('the section as rendered', () => {
  const section = renderRuleReference();

  it('lists every rule id with its severity and its circular lines', () => {
    for (const row of ruleReferenceRows()) {
      expect(section).toContain(`<code dir="ltr">${row.id}</code>`);
      for (const line of row.lines) expect(section).toContain(line.replace('-', '–'));
    }
    const errors = RULES.filter((r) => r.severity === 'error').length;
    const warnings = RULES.filter((r) => r.severity === 'warning').length;
    expect(textOf(section)).toContain(`${RULES.length} כללים: ${errors} שגיאות ו-${warnings} אזהרות`);
  });

  it('ends with what the validator does not check, reportedVat and the amounts among them', () => {
    const notChecked = section.slice(section.indexOf('מה הבודק אינו בודק'));
    expect(notChecked).not.toBe(section);
    for (const item of NOT_CHECKED_HE) expect(textOf(notChecked)).toContain(textOf(item));
    expect(textOf(notChecked)).toContain('reportedVat');
    expect(textOf(notChecked)).toContain('אינו מצליב');
  });

  it('says where the line numbers come from, and that it is generated from the validator', () => {
    expect(textOf(section)).toContain('הטקסט שחולץ');
    expect(textOf(section)).toContain('נוצרת מטבלת הכללים של הבודק');
  });

  it('is marked as generated, between its two markers', () => {
    expect(section.startsWith(RULE_REFERENCE_START)).toBe(true);
    expect(section.trimEnd().endsWith(RULE_REFERENCE_END)).toBe(true);
  });
});

describe('pcn874.html carries it, and cannot drift', () => {
  it('the committed section is exactly what the generator writes', () => {
    expect(ruleReferenceProblems(html)).toEqual([]);
    expect(withRuleReference(html)).toBe(html);
  });

  it('a stale section is reported, and so is a page with no section', () => {
    const stale = html.replace('<code dir="ltr">file.empty</code>', '<code dir="ltr">file.gone</code>');
    expect(ruleReferenceProblems(stale).length).toBeGreaterThan(0);
    const cut = html.slice(0, html.indexOf(RULE_REFERENCE_START)) + html.slice(html.indexOf(RULE_REFERENCE_END) + RULE_REFERENCE_END.length);
    expect(ruleReferenceProblems(cut).length).toBeGreaterThan(0);
  });

  it('the page still passes every accessibility check with it, ids unique', () => {
    expect(checkPageA11y(html)).toEqual([]);
  });

  it('sits inside the page\'s main content, in its own labelled section', () => {
    const section = elementById(html, 'pcn-rules');
    expect(section).toMatch(/aria-labelledby="pcn-rules-title"/);
    expect(html.indexOf('id="pcn-rules"')).toBeGreaterThan(html.indexOf('<main'));
    expect(html.indexOf('id="pcn-rules"')).toBeLessThan(html.indexOf('</main>'));
  });

  it('the script rewrites the section and --check reports a stale one', () => {
    const dir = copyProduct();
    try {
      const page = join(dir, 'pcn874.html');
      writeFileSync(page, readFileSync(page, 'utf8').replace('<code dir="ltr">file.empty</code>', '<code dir="ltr">file.gone</code>'));
      const check = spawnSync(process.execPath, [join(dir, 'scripts/pcn874-rule-reference.js'), '--check'], { encoding: 'utf8' });
      expect(check.status).toBe(1);
      const write = spawnSync(process.execPath, [join(dir, 'scripts/pcn874-rule-reference.js')], { encoding: 'utf8' });
      expect(write.status, write.stderr).toBe(0);
      expect(readFileSync(page, 'utf8')).toBe(html);
    } finally {
      removeCopy(dir);
    }
  });

  it('the build refuses a page whose rule reference is stale, preview too', () => {
    const dir = copyProduct();
    try {
      const page = join(dir, 'pcn874.html');
      writeFileSync(page, readFileSync(page, 'utf8').replace('<code dir="ltr">file.empty</code>', '<code dir="ltr">file.gone</code>'));
      const r = runBuild(dir, '--preview');
      expect(r.status).toBe(1);
      expect(r.stderr).toContain('rule reference');
    } finally {
      removeCopy(dir);
    }
  });
});
