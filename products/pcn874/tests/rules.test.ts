/**
 * RULES — the validator's rule table.
 *
 * Every rule the validator can report is one row of RULES: its id, its
 * severity, and the sources it cites. The checks take severity and sources from
 * that table, so a list of the rules published elsewhere (the il-biz-tools
 * validator page generates its rule reference from it) says what the checks do.
 *
 * These tests hold the table to the validator in both directions:
 *   - every finding, from every fixture and from a mutation of every field of
 *     every record, equals its table row exactly (id, severity, sources);
 *   - every table row is reported by at least one of those inputs, so the table
 *     lists nothing the validator never says.
 */
import { readFileSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { DETAIL, FOOTER, HEADER, magnitudeOf, type RecordSpec } from '../src/layout.js';
import { parsePcn874, type ParsedPcn874, type Pcn874Record } from '../src/parse.js';
import { kindOf } from '../src/sources.js';
import { RULES, validatePcn874, type Finding, type RuleEntry } from '../src/validate.js';

const here = dirname(fileURLToPath(import.meta.url));
const fixtureDir = join(here, 'fixtures');
const fixtures = readdirSync(fixtureDir).filter(f => f.endsWith('.txt'));
const fixture = (name: string): string => readFileSync(join(fixtureDir, name), 'utf8');

const keyOf = (id: string, variant?: string): string => (variant ? `${id} [${variant}]` : id);

/** Replace one field of one parsed record, keeping every other byte. */
function withField(parsed: ParsedPcn874, index: number, fields: Record<string, string>): ParsedPcn874 {
  const records = parsed.records.map((r, i): Pcn874Record =>
    i === index ? { ...r, fields: { ...r.fields, ...fields } } : r,
  );
  return { ...parsed, records };
}

/** A value of the right width that breaks a field of this class. */
function breaking(spec: RecordSpec, id: string): string {
  const field = spec.fields.find(f => f.id === id)!;
  const fill = (ch: string): string => ch.repeat(field.length);
  switch (field.class) {
    case 'digits':
      return fill('A');
    case 'sign':
      return fill('*');
    case 'literal':
      return fill('#');
    case 'alpha':
      return fill('Q');
    case 'alphanumeric':
      return fill('#');
  }
}

const mixed = parsePcn874(fixture('valid-mixed.txt'));
const indexOf = (kind: string): number => mixed.records.findIndex(r => r.kind === kind);

/** Every input the tests run: the fixtures, and targeted mutations of a clean file. */
function inputs(): { name: string; input: string | ParsedPcn874 }[] {
  const out: { name: string; input: string | ParsedPcn874 }[] = fixtures.map(name => ({
    name,
    input: fixture(name),
  }));

  // One broken field at a time, on every field of every record kind.
  for (const [kind, spec] of [
    ['header', HEADER],
    ['detail', DETAIL],
    ['footer', FOOTER],
  ] as const) {
    const at = indexOf(kind);
    for (const field of spec.fields) {
      out.push({ name: `${kind}.${field.id} broken`, input: withField(mixed, at, { [field.id]: breaking(spec, field.id) }) });
    }
    // Sign of zero: a "-" on an amount of zeros.
    for (const field of spec.fields.filter(f => f.class === 'sign')) {
      const amount = magnitudeOf(spec, field)!;
      const zeros = '0'.repeat(amount.length);
      if (kind === 'detail') {
        out.push({
          name: `detail ${field.id} both zero`,
          input: withField(mixed, at, { [field.id]: '-', [amount.id]: zeros, totalVat: '000000000' }),
        });
        out.push({
          name: `detail ${field.id} invoice zero, VAT not`,
          input: withField(mixed, at, { [field.id]: '-', [amount.id]: zeros, totalVat: '000000180' }),
        });
      } else {
        out.push({ name: `${kind} ${field.id} of zero`, input: withField(mixed, at, { [field.id]: '-', [amount.id]: zeros }) });
      }
    }
  }

  const lines = fixture('valid-mixed.txt').split('\n').filter(Boolean);
  const header = lines[0]!;
  const footer = lines[lines.length - 1]!;
  const details = lines.slice(1, -1);
  const k = details.find(l => l.startsWith('K'))!;
  out.push(
    { name: 'empty file', input: '' },
    { name: 'no header', input: [...details, footer].join('\n') },
    { name: 'two headers', input: [header, header, ...details, footer].join('\n') },
    { name: 'no footer', input: [header, ...details].join('\n') },
    { name: 'footer not last', input: [header, footer, ...details].join('\n') },
    { name: 'mixed line endings', input: `${header}\r\n${details.join('\n')}\n${footer}\n` },
    { name: 'report month 13', input: withField(mixed, 0, { reportMonth: '202613' }) },
    { name: 'generation date 30 Feb', input: withField(mixed, 0, { generationDate: '20260230' }) },
    { name: 'reserved amount', input: withField(mixed, 0, { differentRateSalesAmount: '00000000001' }) },
    { name: 'reserved VAT', input: withField(mixed, 0, { differentRateSalesVat: '000000001' }) },
    { name: 'K with a supplier', input: [header, ...details.filter(l => l !== k), `K514444444${k.slice(10)}`, footer].join('\n') },
  );
  return out;
}

const runs = inputs().map(({ name, input }) => ({ name, findings: validatePcn874(input).findings }));

/** The table row a finding must equal: same id, same severity, same sources. */
const rowFor = (f: Finding): RuleEntry | undefined =>
  RULES.find(r => r.id === f.rule && r.severity === f.severity && JSON.stringify(r.sources) === JSON.stringify(f.sources));

describe('RULES, the validator\'s rule table', () => {
  it('has one row per id and variant, each an error or a warning, each citing at least one source', () => {
    expect(RULES.length).toBeGreaterThan(60);
    const keys = RULES.map(r => keyOf(r.id, r.variant));
    expect(new Set(keys).size).toBe(keys.length);
    for (const r of RULES) {
      expect(['error', 'warning'], r.id).toContain(r.severity);
      expect(r.sources.length, r.id).toBeGreaterThan(0);
      for (const s of r.sources) expect(kindOf(s), `${r.id}: ${s}`).toBeDefined();
    }
  });

  it('gives a variant only where one id is reported in more than one way, and then to every row of that id', () => {
    const byId = new Map<string, RuleEntry[]>();
    for (const r of RULES) byId.set(r.id, [...(byId.get(r.id) ?? []), r]);
    for (const [id, rows] of byId) {
      if (rows.length === 1) expect(rows[0]!.variant, id).toBeUndefined();
      else for (const r of rows) expect(r.variant, id).toMatch(/\S/);
    }
  });

  it('is what the validator reports: every finding of every input equals its row exactly', () => {
    expect(runs.length).toBeGreaterThan(80);
    for (const { name, findings } of runs) {
      for (const f of findings) {
        expect(rowFor(f), `${name}: ${f.rule} (${f.severity}) ${JSON.stringify(f.sources)}`).toBeDefined();
      }
    }
  });

  it('lists nothing the validator never reports: every row is reported by some input here', () => {
    const reported = new Set(runs.flatMap(({ findings }) => findings.map(f => rowFor(f)).filter(Boolean)));
    const silent = RULES.filter(r => !reported.has(r)).map(r => keyOf(r.id, r.variant));
    expect(silent).toEqual([]);
  });
});
