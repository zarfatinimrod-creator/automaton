#!/usr/bin/env node
/**
 * pcn874 validate <file> [--json] [--quiet]
 * pcn874 generate <input.csv> --out <file> [--reported-vat <shekels>] [--json]
 *
 * Exit code 0 when the file has no `error` findings (validate) or was written
 * (generate), 1 when it has errors or the generator refused, 2 on a usage or
 * I/O problem. Warnings never change the exit code: they are the places where
 * the Tax Authority's document gives a field its meaning without forbidding a
 * value, or where nothing rendered settles the question, and failing a build on
 * an open question would be asserting more than we know.
 */

import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { generatePcn874, type GenerateResult, type GeneratorProblem } from './generate.js';
import { ITA_SIMULATOR_URL, describeCitation } from './sources.js';
import { validatePcn874, type Finding, type ValidationResult } from './validate.js';

const USAGE = `pcn874 — validator and generator for the Israeli VAT detailed report file (PCN874)

Usage:
  pcn874 validate <file> [--json] [--quiet]
  pcn874 generate <input.csv> --out <file> [--reported-vat <shekels>] [--json]
  pcn874 --help

Options:
  --json               print the findings as JSON
  --quiet              print only errors, not warnings (validate)
  --out <file>         where generate writes the PCN874 file (required)
  --reported-vat <n>   the period's total VAT to pay ("+") or receive ("-"),
                       in SHEKELS. Never computed here: the circular defines the
                       field and states no arithmetic for it (docs/SPEC.md §5.2,
                       §6.7). Overrides a "# reportedVat:" line in the CSV.
  --help               print this message

Exit codes:
  0  no error findings / the file was written
  1  at least one error finding / the generator refused
  2  usage or I/O problem

Rules come from the Israel Tax Authority's own circular to software houses —
Appendix A (record layout), Appendix C (permitted values) — cited line by line in
docs/SPEC.md; the CSV's columns are documented in docs/GENERATOR.md. This tool
does NOT tell you the Authority will accept your file. The Authority's free
simulator is the thing that answers that:
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

/**
 * The generator's report.
 *
 * Deliberately says nothing about the file being "compliant", "accepted" or
 * "approved": what it can say is that the file matches the record layout in the
 * circular, and where to go for the other question.
 */
export function formatGenerate(
  result: GenerateResult,
  outPath: string,
  input: string,
  /** True when a file already exists at `outPath`. Only read on a refusal. */
  outExists = false,
): string {
  const lines: string[] = [];

  const problem = (p: GeneratorProblem): void => {
    const where = p.line === null ? input : `${input}:${p.line}`;
    const column = p.column ? ` [${p.column}]` : '';
    lines.push(`${SEVERITY_LABEL[p.severity]} ${where}${column}  ${p.code}`);
    lines.push(`         ${p.message}`);
    if (p.officialText) lines.push(`         Tax Authority: ${p.officialText}`);
    for (const s of p.sources) lines.push(`         source: ${describeCitation(s)}`);
    if (p.productChoice) lines.push(`         product choice: ${p.productChoice}`);
    lines.push('');
  };

  for (const p of result.problems) problem(p);

  if (result.validation) {
    for (const f of result.validation.findings) {
      const where = f.line === null ? f.record : `${f.record} (line ${f.line})`;
      const field = f.field ? ` [${f.field}]` : '';
      lines.push(`${SEVERITY_LABEL[f.severity]} generated ${where}${field}  ${f.rule}`);
      lines.push(`         ${f.message}`);
      if (f.officialText) lines.push(`         Tax Authority: ${f.officialText}`);
      for (const s of f.sources) lines.push(`         source: ${describeCitation(s)}`);
      if (f.openQuestion) lines.push(`         still open: ${f.openQuestion}`);
      lines.push('');
    }
  }

  if (!result.ok) {
    lines.push(
      `REFUSED — nothing was written to ${outPath}. ${result.counts.error} error(s), ` +
        `${result.counts.warning} warning(s).`,
    );
    lines.push(
      result.validation === null
        ? 'The input was refused before a file was built.'
        : 'A file was built and then checked with this package\'s own validator, which reported an error. ' +
          'The generator does not write a file its validator rejects, and the refused file is not returned ' +
          'either: the result carries the findings and no records.',
    );
    if (outExists) {
      lines.push(
        `An earlier file is still at ${outPath}. This run did not produce it and did not touch it — do not ` +
          'upload it in the belief that it came from this input.',
      );
    }
    return lines.join('\n');
  }

  const records = result.validation?.parsed.records.length ?? 0;
  lines.push(
    `WROTE ${outPath} — ${records} record(s): 1 header, ${records - 2} transaction, 1 closing. ` +
      `${result.counts.warning} warning(s).`,
  );
  lines.push(
    'The file matches the record layout in the Tax Authority circular (Appendices A and C) and was checked ' +
      "with this package's own validator before being written. That is the whole of the claim: whether the " +
      'Authority will take the file is a different question, and the Authority answers it itself with a free ' +
      `simulator — upload the file there: ${ITA_SIMULATOR_URL}`,
  );
  lines.push(
    'What that check covers: the record layout, the field types, the two record counts and Appendix C\'s ' +
      'permitted values. It cross-checks NO amount (docs/SPEC.md §5.2), so it says nothing about whether the ' +
      'totals in this file are the ones your books hold.',
  );
  lines.push(
    'reportedVat was taken from your input and never computed: the circular defines the field (Appendix A, ' +
      'line 126) and states no arithmetic for it anywhere. See docs/SPEC.md §5.2 and §6.7.',
  );
  return lines.join('\n');
}

/** Read `--flag value` or `--flag=value`; returns null when the flag is absent. */
function optionValue(args: readonly string[], flag: string): string | null | undefined {
  for (let i = 0; i < args.length; i++) {
    const arg = args[i]!;
    if (arg === flag) {
      const next = args[i + 1];
      // A value may legitimately start with "-" (a negative amount), so only a
      // missing value is an error.
      return next === undefined ? undefined : next;
    }
    if (arg.startsWith(`${flag}=`)) return arg.slice(flag.length + 1);
  }
  return null;
}

const FLAGS_WITH_VALUES = ['--out', '--reported-vat'];

/** Positional arguments: everything that is neither a flag nor a flag's value. */
function positionals(args: readonly string[]): string[] {
  const out: string[] = [];
  for (let i = 0; i < args.length; i++) {
    const arg = args[i]!;
    if (FLAGS_WITH_VALUES.includes(arg)) {
      i++;
      continue;
    }
    if (arg.startsWith('--')) continue;
    out.push(arg);
  }
  return out;
}

function runValidate(args: readonly string[]): number {
  const json = args.includes('--json');
  const quiet = args.includes('--quiet');
  const paths = positionals(args);
  if (paths.length !== 1) {
    process.stderr.write(`pcn874: validate needs exactly one file path\n\n${USAGE}\n`);
    return 2;
  }

  let text: string;
  try {
    text = readFileSync(paths[0]!, 'utf8');
  } catch (e) {
    process.stderr.write(`pcn874: cannot read ${paths[0]}: ${(e as Error).message}\n`);
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

function runGenerate(args: readonly string[]): number {
  const json = args.includes('--json');
  const paths = positionals(args);
  if (paths.length !== 1) {
    process.stderr.write(`pcn874: generate needs exactly one input CSV path\n\n${USAGE}\n`);
    return 2;
  }
  const out = optionValue(args, '--out');
  if (out === null || out === undefined || out === '') {
    process.stderr.write(`pcn874: generate needs --out <file>\n\n${USAGE}\n`);
    return 2;
  }
  const reportedVat = optionValue(args, '--reported-vat');
  if (reportedVat === undefined) {
    process.stderr.write(`pcn874: --reported-vat needs a value, in shekels\n\n${USAGE}\n`);
    return 2;
  }
  // An empty value is a usage problem, not a figure. Passing it through made it
  // override a "# reportedVat:" line in the CSV and then read as absent, so the
  // file was refused for a directive the user had actually supplied.
  if (reportedVat === '') {
    process.stderr.write(
      `pcn874: the --reported-vat value is empty. Give the period's total VAT in shekels ("+" to pay, "-" to receive), or leave the flag off to use the CSV's "# reportedVat:" line\n\n${USAGE}\n`,
    );
    return 2;
  }

  let csv: string;
  try {
    csv = readFileSync(paths[0]!, 'utf8');
  } catch (e) {
    process.stderr.write(`pcn874: cannot read ${paths[0]}: ${(e as Error).message}\n`);
    return 2;
  }

  const result = generatePcn874(csv, {
    ...(reportedVat === null ? {} : { reportedVat }),
    sourceName: paths[0]!,
  });

  // Does a file already sit at the output path? Read BEFORE the write, so a
  // refusal can say that what is there is older than this run. Nothing here
  // deletes it: it may be a file the user owns.
  const outExisted = existsSync(out);

  // The one place a file is written, and only when the generator says so. If
  // `text` is null the generator refused, and the refused result carries no
  // records either, so nothing in it holds the file.
  if (result.ok && result.text !== null) {
    try {
      writeFileSync(out, result.text, 'utf8');
    } catch (e) {
      process.stderr.write(`pcn874: cannot write ${out}: ${(e as Error).message}\n`);
      return 2;
    }
  }

  if (json) {
    process.stdout.write(
      `${JSON.stringify(
        {
          written: result.ok,
          out: result.ok ? out : null,
          counts: result.counts,
          problems: result.problems,
          findings: result.validation?.findings ?? [],
        },
        null,
        2,
      )}\n`,
    );
  } else {
    process.stdout.write(`${formatGenerate(result, out, paths[0]!, outExisted)}\n`);
  }

  return result.ok ? 0 : 1;
}

export function run(argv: readonly string[]): number {
  const args = [...argv];
  if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
    process.stdout.write(`${USAGE}\n`);
    return args.length === 0 ? 2 : 0;
  }

  const command = args[0];
  const rest = args.slice(1);
  if (command === 'validate') return runValidate(rest);
  if (command === 'generate') return runGenerate(rest);

  process.stderr.write(`pcn874: unknown command ${JSON.stringify(command)}\n\n${USAGE}\n`);
  return 2;
}

const invokedDirectly =
  process.argv[1] !== undefined && /(?:^|[\\/])cli\.(?:ts|js)$|[\\/]pcn874$/.test(process.argv[1]);
if (invokedDirectly) {
  process.exit(run(process.argv.slice(2)));
}
