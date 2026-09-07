#!/usr/bin/env node
/**
 * pcn874 validate <file> [--json] [--quiet]
 *
 * Exit code 0 when the file has no `error` findings, 1 when it has, 2 on a usage
 * or I/O problem. Warnings never change the exit code: they are the places where
 * the Tax Authority's document gives a field its meaning without forbidding a
 * value, or where nothing rendered settles the question, and failing a build on
 * an open question would be asserting more than we know.
 */

import { readFileSync } from 'node:fs';
import { ITA_SIMULATOR_URL, describeCitation } from './sources.js';
import { validatePcn874, type Finding, type ValidationResult } from './validate.js';

const USAGE = `pcn874 — validator for the Israeli VAT detailed report file (PCN874)

Usage:
  pcn874 validate <file> [--json] [--quiet]
  pcn874 --help

Options:
  --json    print the findings as JSON
  --quiet   print only errors, not warnings
  --help    print this message

Exit codes:
  0  no error findings
  1  at least one error finding
  2  usage or I/O problem

Rules come from the Israel Tax Authority's own circular to software houses —
Appendix A (record layout), Appendix C (permitted values) — cited line by line in
docs/SPEC.md. This tool does NOT tell you the Authority will accept your file.
The Authority's free simulator is the thing that answers that:
  ${ITA_SIMULATOR_URL}`;

const SEVERITY_LABEL: Record<Finding['severity'], string> = {
  error: 'error  ',
  warning: 'warning',
  info: 'info   ',
};

export function formatHuman(result: ValidationResult, quiet: boolean): string {
  const lines: string[] = [];
  const shown = quiet ? result.findings.filter(f => f.severity === 'error') : result.findings;

  for (const f of shown) {
    const where = f.line === null ? f.record : `${f.record} (line ${f.line})`;
    const field = f.field ? ` [${f.field}]` : '';
    lines.push(`${SEVERITY_LABEL[f.severity]} ${where}${field}  ${f.rule}`);
    lines.push(`         ${f.message}`);
    if (f.officialText) lines.push(`         Tax Authority: ${f.officialText}`);
    for (const s of f.sources) lines.push(`         source: ${describeCitation(s)}`);
    if (f.openQuestion) lines.push(`         still open: ${f.openQuestion}`);
    lines.push('');
  }

  const { error, warning, info } = result.counts;
  lines.push(
    `${result.valid ? 'VALID' : 'INVALID'} — ${error} error(s), ${warning} warning(s), ${info} info; ` +
      `${result.parsed.records.length} record(s), line endings ${result.parsed.lineEnding}.`,
  );
  if (result.valid && warning > 0) {
    lines.push(
      'Warnings are places the Tax Authority document gives a field its meaning without forbidding the value, ' +
        'or where nothing rendered settles the question. They do not make the file invalid.',
    );
  }
  lines.push(
    'Checked against the Tax Authority circular (Appendices A and C); see docs/SPEC.md for what remains open. ' +
      `This is not a statement that the file will be accepted — use the Authority's simulator: ${ITA_SIMULATOR_URL}`,
  );
  return lines.join('\n');
}

export function run(argv: readonly string[]): number {
  const args = [...argv];
  if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
    process.stdout.write(`${USAGE}\n`);
    return args.length === 0 ? 2 : 0;
  }

  const command = args[0];
  if (command !== 'validate') {
    process.stderr.write(`pcn874: unknown command ${JSON.stringify(command)}\n\n${USAGE}\n`);
    return 2;
  }

  const json = args.includes('--json');
  const quiet = args.includes('--quiet');
  const positional = args.slice(1).filter(a => !a.startsWith('--'));
  if (positional.length !== 1) {
    process.stderr.write(`pcn874: validate needs exactly one file path\n\n${USAGE}\n`);
    return 2;
  }

  let text: string;
  try {
    text = readFileSync(positional[0]!, 'utf8');
  } catch (e) {
    process.stderr.write(`pcn874: cannot read ${positional[0]}: ${(e as Error).message}\n`);
    return 2;
  }

  const result = validatePcn874(text);

  if (json) {
    process.stdout.write(
      `${JSON.stringify(
        {
          valid: result.valid,
          counts: result.counts,
          lineEnding: result.parsed.lineEnding,
          recordCount: result.parsed.records.length,
          findings: quiet ? result.findings.filter(f => f.severity === 'error') : result.findings,
        },
        null,
        2,
      )}\n`,
    );
  } else {
    process.stdout.write(`${formatHuman(result, quiet)}\n`);
  }

  return result.valid ? 0 : 1;
}

const invokedDirectly =
  process.argv[1] !== undefined && /(?:^|[\\/])cli\.(?:ts|js)$|[\\/]pcn874$/.test(process.argv[1]);
if (invokedDirectly) {
  process.exit(run(process.argv.slice(2)));
}
