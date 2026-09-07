import { existsSync, mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { run } from '../src/cli.js';

const here = dirname(fileURLToPath(import.meta.url));
const fixturePath = (name: string): string => join(here, 'fixtures', name);
const csvPath = (name: string): string => join(here, 'fixtures', 'csv', name);

function capture(fn: () => number): { code: number; out: string; err: string } {
  let out = '';
  let err = '';
  const outSpy = vi.spyOn(process.stdout, 'write').mockImplementation(((chunk: string) => {
    out += chunk;
    return true;
  }) as typeof process.stdout.write);
  const errSpy = vi.spyOn(process.stderr, 'write').mockImplementation(((chunk: string) => {
    err += chunk;
    return true;
  }) as typeof process.stderr.write);
  try {
    return { code: fn(), out, err };
  } finally {
    outSpy.mockRestore();
    errSpy.mockRestore();
  }
}

afterEach(() => vi.restoreAllMocks());

describe('pcn874 validate', () => {
  it('exits 0 and says VALID on a good file', () => {
    const { code, out } = capture(() => run(['validate', fixturePath('valid-minimal.txt')]));
    expect(code).toBe(0);
    expect(out).toContain('VALID');
    expect(out).not.toContain('INVALID');
    // The caveat changed with the evidence: the rules ARE the Authority's now,
    // but "valid" still is not "the Authority will accept this".
    expect(out).toContain('Checked against the Tax Authority circular');
    expect(out).toContain('not a statement that the file will be accepted');
    expect(out).toContain('misim.gov.il');
  });

  it('exits 1 and prints the rule, message and the document behind it on a bad file', () => {
    const { code, out } = capture(() => run(['validate', fixturePath('invalid-footer-z.txt')]));
    expect(code).toBe(1);
    expect(out).toContain('INVALID');
    expect(out).toContain('footer.recordType.literal');
    // The Z/X question is settled now, so this finding prints the Authority's
    // own words rather than "sources disagree" (docs/SPEC.md §6.5).
    expect(out).toContain('Tax Authority: Closing Entry: Entry Type');
    expect(out).toContain('source: Israel Tax Authority');
    expect(out).toContain('research/rendered/pcn874-gov-il-874-eng.txt:158');
    expect(out).not.toContain('sources disagree:');
  });

  it('prints "still open" only where nothing settles the question', () => {
    const { out } = capture(() => run(['validate', fixturePath('warnings-only.txt')]));
    // R's reference number: Appendix C says zeros, note D on the same row does not.
    expect(out).toContain('still open:');
    expect(out).toContain('detail.R.refNumberZeros');
    // ...and not on a rule the document settles outright.
    const { out: settled } = capture(() =>
      run(['validate', fixturePath('invalid-sign-of-zero.txt')]),
    );
    expect(settled).toContain('signOfZero');
    expect(settled).not.toContain('still open:');
  });

  it('exits 0 on a file whose only findings are warnings, and says so', () => {
    const { code, out } = capture(() => run(['validate', fixturePath('warnings-only.txt')]));
    expect(code).toBe(0);
    expect(out).toContain('VALID');
    expect(out).toContain('warning');
    expect(out).toContain('do not make the file invalid');
  });

  it('--quiet hides warnings but keeps the summary', () => {
    const { code, out } = capture(() =>
      run(['validate', fixturePath('warnings-only.txt'), '--quiet']),
    );
    expect(code).toBe(0);
    expect(out).not.toContain('detail.R.refNumberZeros');
    expect(out).toContain('4 warning(s)');
  });

  it('--json emits machine-readable findings', () => {
    const { code, out } = capture(() =>
      run(['validate', fixturePath('invalid-header-length.txt'), '--json']),
    );
    expect(code).toBe(1);
    const parsed = JSON.parse(out) as {
      valid: boolean;
      counts: { error: number };
      findings: { rule: string }[];
    };
    expect(parsed.valid).toBe(false);
    expect(parsed.counts.error).toBeGreaterThan(0);
    expect(parsed.findings.map(f => f.rule)).toContain('header.length');
  });

  it('exits 2 with usage when the file is missing', () => {
    const { code, err } = capture(() => run(['validate', fixturePath('nope.txt')]));
    expect(code).toBe(2);
    expect(err).toContain('cannot read');
  });

  it('exits 2 on an unknown command and on no arguments', () => {
    expect(capture(() => run(['simulate', 'x.txt'])).code).toBe(2);
    expect(capture(() => run([])).code).toBe(2);
  });

  it('exits 2 when validate is given the wrong number of paths', () => {
    expect(capture(() => run(['validate'])).code).toBe(2);
    expect(capture(() => run(['validate', 'a.txt', 'b.txt'])).code).toBe(2);
  });

  it('--help exits 0 and documents the exit codes', () => {
    const { code, out } = capture(() => run(['--help']));
    expect(code).toBe(0);
    expect(out).toContain('Exit codes:');
    expect(out).toContain('docs/SPEC.md');
    expect(out).toContain("Israel Tax Authority's own circular");
  });

  it('--help documents generate beside validate', () => {
    const { out } = capture(() => run(['--help']));
    expect(out).toContain('pcn874 generate <input.csv> --out <file>');
    expect(out).toContain('--reported-vat');
    expect(out).toContain('in SHEKELS');
    expect(out).toContain('docs/GENERATOR.md');
  });
});

describe('pcn874 generate', () => {
  let dir: string;
  const out = (name = 'PCN874.TXT'): string => join(dir, name);

  beforeEach(() => {
    dir = mkdtempSync(join(tmpdir(), 'pcn874-cli-'));
  });
  afterEach(() => rmSync(dir, { recursive: true, force: true }));

  it('exits 0, writes the file, and points at the Authority\'s own simulator', () => {
    const target = out();
    const { code, out: printed } = capture(() =>
      run(['generate', csvPath('minimal.csv'), '--out', target]),
    );
    expect(code).toBe(0);
    expect(printed).toContain('WROTE');
    expect(printed).toContain('matches the record layout in the Tax Authority circular');
    expect(printed).toContain('http://www.misim.gov.il/EmDvhmfrt/wUploadFileHeshboniotSim.aspx');
    expect(readFileSync(target, 'utf8')).toBe(readFileSync(fixturePath('valid-minimal.txt'), 'utf8'));
  });

  it('never says the output is compliant, accepted or approved', () => {
    const { out: printed } = capture(() =>
      run(['generate', csvPath('mixed.csv'), '--out', out()]),
    );
    expect(printed).not.toMatch(/\b(compliant|accepted|approved)\b/i);
    expect(printed).not.toMatch(/תקין|מאושר|קביל/);
  });

  it('exits 1 and writes nothing when no reportedVat is supplied', () => {
    const target = out();
    const { code, out: printed } = capture(() =>
      run(['generate', csvPath('no-reported-vat.csv'), '--out', target]),
    );
    expect(code).toBe(1);
    expect(existsSync(target)).toBe(false);
    expect(printed).toContain('REFUSED');
    expect(printed).toContain('meta.reportedVat.missing');
    expect(printed).toContain('states no arithmetic for it');
  });

  it('--reported-vat supplies it, and accepts a negative figure', () => {
    const target = out();
    expect(
      capture(() =>
        run(['generate', csvPath('no-reported-vat.csv'), '--out', target, '--reported-vat', '-1746']),
      ).code,
    ).toBe(0);
    const header = readFileSync(target, 'utf8').split('\n')[0]!;
    expect(header.slice(119)).toBe('-00000001746');
  });

  it('exits 1 and writes nothing when its own validator rejects the file it built', () => {
    const target = out();
    const { code, out: printed } = capture(() =>
      run(['generate', csvPath('input-no-supplier.csv'), '--out', target]),
    );
    expect(code).toBe(1);
    expect(existsSync(target)).toBe(false);
    expect(printed).toContain('detail.T.counterpartyExpected');
    expect(printed).toContain('does not write a file its validator rejects');
  });

  it('writes the file on warnings and prints them', () => {
    const target = out();
    const { code, out: printed } = capture(() =>
      run(['generate', csvPath('warnings.csv'), '--out', target]),
    );
    expect(code).toBe(0);
    expect(existsSync(target)).toBe(true);
    expect(printed).toContain('row.refNumber.rightmostNine');
    expect(printed).toContain('detail.refGroup.alphanumeric');
    expect(printed).toContain('warning');
  });

  it('the generated file validates through the CLI itself', () => {
    const target = out();
    expect(capture(() => run(['generate', csvPath('mixed.csv'), '--out', target])).code).toBe(0);
    const { code, out: printed } = capture(() => run(['validate', target]));
    expect(code).toBe(0);
    expect(printed).toContain('VALID');
  });

  it('--json reports what was written and what was found', () => {
    const target = out();
    const { code, out: printed } = capture(() =>
      run(['generate', csvPath('rounding.csv'), '--out', target, '--json']),
    );
    expect(code).toBe(0);
    const parsed = JSON.parse(printed) as {
      written: boolean;
      out: string;
      problems: { code: string }[];
    };
    expect(parsed.written).toBe(true);
    expect(parsed.out).toBe(target);
    expect(parsed.problems.map(p => p.code)).toContain('row.amount.roundingTie');
  });

  it('exits 2 without --out, without an input, and on an unreadable input', () => {
    expect(capture(() => run(['generate', csvPath('minimal.csv')])).code).toBe(2);
    expect(capture(() => run(['generate', '--out', out()])).code).toBe(2);
    expect(capture(() => run(['generate', csvPath('nope.csv'), '--out', out()])).code).toBe(2);
    expect(capture(() => run(['generate', csvPath('minimal.csv'), '--out'])).code).toBe(2);
    expect(
      capture(() => run(['generate', csvPath('minimal.csv'), '--out', out(), '--reported-vat'])).code,
    ).toBe(2);
  });

  it('says an earlier file is still at --out when it refuses', () => {
    const target = out();
    // First a run that writes, then a run that refuses to the same path.
    expect(capture(() => run(['generate', csvPath('minimal.csv'), '--out', target])).code).toBe(0);
    const before = readFileSync(target, 'utf8');
    const { code, out: printed } = capture(() =>
      run(['generate', csvPath('no-reported-vat.csv'), '--out', target]),
    );
    expect(code).toBe(1);
    expect(printed).toContain('REFUSED');
    expect(printed).toContain('An earlier file is still at');
    expect(printed).toContain('did not produce it');
    // ...and the earlier file is untouched: it may be a file the user owns.
    expect(readFileSync(target, 'utf8')).toBe(before);
  });

  it('says nothing about an earlier file when there is none', () => {
    const { out: printed } = capture(() =>
      run(['generate', csvPath('no-reported-vat.csv'), '--out', out()]),
    );
    expect(printed).toContain('REFUSED');
    expect(printed).not.toContain('An earlier file is still at');
  });

  it('exits 2 on an empty --reported-vat rather than reading it as absent', () => {
    const target = out();
    const { code, err } = capture(() =>
      run(['generate', csvPath('minimal.csv'), '--out', target, '--reported-vat', '']),
    );
    expect(code).toBe(2);
    expect(err).toContain('the --reported-vat value is empty');
    expect(existsSync(target)).toBe(false);
  });

  it('reports the byte width of a record that is not all ASCII', () => {
    const { code, out: printed } = capture(() =>
      run(['generate', csvPath('audit-d-refgroup-hebrew.csv'), '--out', out()]),
    );
    expect(code).toBe(0);
    expect(printed).toContain('file.byteWidth');
    expect(printed).toContain('60 characters and 62 bytes');
  });

  it('refuses the three inputs that used to be written silently wrong', () => {
    for (const [name, rule] of [
      ['audit-c2-extra-cells.csv', 'csv.row.cellCount'],
      ['audit-l-short-row.csv', 'csv.row.cellCount'],
      ['audit-n-decimal-comma.csv', 'row.amount.unreadable'],
    ] as const) {
      const target = out(`${name}.txt`);
      const { code, out: printed } = capture(() =>
        run(['generate', csvPath(name), '--out', target]),
      );
      expect(code, name).toBe(1);
      expect(existsSync(target), name).toBe(false);
      expect(printed, name).toContain(rule);
    }
  });

  it('says what the validator check does and does not cover', () => {
    const { out: printed } = capture(() =>
      run(['generate', csvPath('minimal.csv'), '--out', out()]),
    );
    expect(printed).toContain('cross-checks NO amount');
  });

  it('exits 2 when the output path cannot be written, and still wrote nothing', () => {
    const { code, err } = capture(() =>
      run(['generate', csvPath('minimal.csv'), '--out', join(dir, 'no', 'such', 'dir', 'f.txt')]),
    );
    expect(code).toBe(2);
    expect(err).toContain('cannot write');
  });
});
