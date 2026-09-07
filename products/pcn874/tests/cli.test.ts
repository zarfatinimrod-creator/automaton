import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { run } from '../src/cli.js';

const here = dirname(fileURLToPath(import.meta.url));
const fixturePath = (name: string): string => join(here, 'fixtures', name);

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
    expect(out).toContain('not the Tax Authority specification');
  });

  it('exits 1 and prints the rule, message and source on a bad file', () => {
    const { code, out } = capture(() => run(['validate', fixturePath('invalid-footer-z.txt')]));
    expect(code).toBe(1);
    expect(out).toContain('INVALID');
    expect(out).toContain('footer.recordType.literal');
    expect(out).toContain('source: Urigo/accounter-fullstack');
    expect(out).toContain('sources disagree:');
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
    expect(out).not.toContain('detail.L.vatIdZeros');
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
    expect(capture(() => run(['generate', 'x.txt'])).code).toBe(2);
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
    expect(out).toContain('docs/SPEC-FROM-SOURCES.md');
  });
});
