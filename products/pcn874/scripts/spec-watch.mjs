#!/usr/bin/env node
/**
 * Download the official PCN874 specification and watch its SHA-256.
 *
 * Runs in GitHub Actions, which has egress; from the build container every URL
 * below is blocked, so running this locally is expected to report every source
 * unreachable and exit 0 with nothing recorded.
 *
 * As of 2026-09-07 all three documents HAVE been fetched and read: the extracted
 * text lives in research/rendered/ and docs/SPEC.md cites it line by line. What
 * this job is for has therefore changed. It is no longer "get us a copy"; it is
 * "tell us when the Authority re-issues the document", because docs/SPEC.md and
 * src/layout.ts are derived from a specific 2009 circular and a new edition
 * would silently make them wrong.
 *
 * The URLs come from products/pcn874/src/sources.ts (OFFICIAL_SPEC_URLS), where
 * each one carries its provenance. None of them was invented here.
 *
 * The terms gate comes first (research/channel-loop/RULING-2026-09-30-video.md 16(d)
 * D2(iv): unread or silent terms mean no fetch). A URL is fetched only when its site
 * passes termsGate in scripts/queue-zero-test.mjs against research/channel-loop/
 * terms-verdicts.json, the same gate render-watch's lines pass. On 30.9.2026 all three
 * sites fail it (www.gov.il, rivhit.co.il and h-erp.co.il are NO_TERMS), so the watch
 * downloads nothing and cannot notice a new edition until their terms are read.
 *
 * Behaviour:
 *   - a URL whose site fails the terms gate        -> skipped, never fetched, lock entry kept, not a change
 *   - every URL refused by the terms gate          -> exit 0 saying so, nothing downloaded, lock untouched
 *   - a URL that downloads for the first time      -> hash recorded, exit 0
 *   - a URL whose hash matches the lock file       -> exit 0
 *   - a URL whose hash CHANGED                     -> exit 1, so somebody looks
 *   - a URL that cannot be reached                 -> reported, does not fail
 *   - no URL reachable at all                      -> exit 0 with a loud notice
 *
 * A fetched source's lock entry is rewritten with its `baseline` (the capture docs/SPEC.md
 * was derived from) carried over, and with `readByAHuman` false whenever the hash is new or
 * changed: downloaded bytes are not read bytes.
 *
 * The downloaded bytes are written to .spec-downloads/ so the workflow can keep
 * them as an artefact; that directory is git-ignored.
 */

import { createHash } from 'node:crypto';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
// Resolved against this file, not the working directory: the same from the repo root
// and from products/pcn874, where the workflow runs it. Node builtins only below it.
import { loadVerdicts, termsGate } from '../../../scripts/queue-zero-test.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..');
const LOCK_PATH = join(root, 'docs', 'SPEC-SOURCES.lock.json');
const DOWNLOAD_DIR = join(root, '.spec-downloads');

/** Cited in every skip line. */
export const TERMS_RULING = 'ruling 30.9 16(d) D2(iv)';

// Kept in step with src/sources.ts OFFICIAL_SPEC_URLS; tests/spec-watch.test.ts
// fails if the two lists drift apart.
export const URLS = [
  {
    id: 'gov-il-874-eng',
    url: 'https://www.gov.il/BlobFolder/generalpage/tax-vat-online-invoice-reporting/he/IncomeTax_IncomeTaxSoftwareHousesInfo_874-eng.pdf',
    provenance:
      'accounter:packages/pcn874-generator/README.md:5 — the repo names it as its own basis',
  },
  {
    id: 'rivhit-mirror',
    url: 'https://www.rivhit.co.il/uploaded_files/documents/pcn874_manual_U1231.pdf',
    provenance:
      'research/colony-sweep/audits/israel-bureaucracy.md:188 — vendor mirror, edition 1.51',
  },
  {
    id: 'h-erp-mirror',
    url: 'https://downloads.h-erp.co.il/files/vatr/Guidance874W.pdf',
    provenance: 'research/colony-sweep/audits/israel-bureaucracy.md:550 — second vendor mirror',
  },
];

const TIMEOUT_MS = 45_000;

function readLock(lockPath) {
  try {
    return JSON.parse(readFileSync(lockPath, 'utf8'));
  } catch {
    return { note: '', sources: {} };
  }
}

async function fetchOne(entry, fetchImpl) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const response = await fetchImpl(entry.url, {
      signal: controller.signal,
      redirect: 'follow',
      headers: { 'user-agent': 'pcn874-spec-watch (+https://github.com/)' },
    });
    if (!response.ok) return { ok: false, reason: `HTTP ${response.status}` };
    const bytes = Buffer.from(await response.arrayBuffer());
    if (bytes.length === 0) return { ok: false, reason: 'empty body' };
    return {
      ok: true,
      bytes,
      sha256: createHash('sha256').update(bytes).digest('hex'),
      contentType: response.headers.get('content-type') ?? 'unknown',
    };
  } catch (e) {
    return { ok: false, reason: e instanceof Error ? e.message : String(e) };
  } finally {
    clearTimeout(timer);
  }
}

const LOCK_NOTE =
  'SHA-256 of the official PCN874 specification as downloaded by ' +
  '.github/workflows/pcn874-spec-watch.yml. The three documents were fetched and read on ' +
  '2026-09-07; their extracted text is in research/rendered/ and docs/SPEC.md cites it line by ' +
  'line. This lock exists so a NEW EDITION is noticed: a changed hash means the layout in ' +
  'docs/SPEC.md and src/layout.ts may no longer match what the Authority publishes, and must be ' +
  're-derived before anything ships. A hash here does NOT mean the new bytes have been read.';

/**
 * Run the watch once. Everything it touches is injectable so the tests use no network
 * and no tracked file. Returns the exit code and one result per URL:
 * { id, status: 'skipped' | 'unreachable' | 'new' | 'unchanged' | 'changed', reason? }.
 */
export async function runSpecWatch({
  urls = URLS,
  verdicts = loadVerdicts(),
  fetchImpl = fetch,
  lockPath = LOCK_PATH,
  downloadDir = DOWNLOAD_DIR,
  write = s => process.stdout.write(s),
  writeErr = s => process.stderr.write(s),
} = {}) {
  const lock = readLock(lockPath);
  lock.sources ??= {};
  lock.note = LOCK_NOTE;

  const results = [];
  let changed = false;
  let anyReachable = false;

  for (const entry of urls) {
    const gate = termsGate(entry.url, entry.id, verdicts);
    if (!gate.ok) {
      // Not fetched, so not evidence of anything: the lock keeps its last known hash.
      const reason = `terms (${gate.verdict ?? 'no verdict'}, ${TERMS_RULING})`;
      write(`skipped      ${entry.id}  ${reason}\n             ${gate.why}\n`);
      results.push({ id: entry.id, status: 'skipped', reason });
      continue;
    }

    const result = await fetchOne(entry, fetchImpl);
    if (!result.ok) {
      write(`unreachable  ${entry.id}  ${result.reason}\n             ${entry.url}\n`);
      const previous = lock.sources[entry.id];
      if (previous) previous.lastUnreachableAt = new Date().toISOString();
      results.push({ id: entry.id, status: 'unreachable', reason: result.reason });
      continue;
    }

    anyReachable = true;
    mkdirSync(downloadDir, { recursive: true });
    writeFileSync(join(downloadDir, `${entry.id}.pdf`), result.bytes);

    const previous = lock.sources[entry.id];
    let status;
    if (!previous) {
      status = 'new';
      write(`new          ${entry.id}  sha256=${result.sha256}  ${result.bytes.length} bytes\n`);
    } else if (previous.sha256 !== result.sha256) {
      status = 'changed';
      changed = true;
      write(`CHANGED      ${entry.id}\n             was ${previous.sha256}\n             now ${result.sha256}\n`);
    } else {
      status = 'unchanged';
      write(`unchanged    ${entry.id}  sha256=${result.sha256}\n`);
    }
    results.push({ id: entry.id, status });

    lock.sources[entry.id] = {
      url: entry.url,
      provenance: entry.provenance,
      sha256: result.sha256,
      bytes: result.bytes.length,
      contentType: result.contentType,
      lastSeenAt: new Date().toISOString(),
      ...(previous?.firstSeenAt ? { firstSeenAt: previous.firstSeenAt } : { firstSeenAt: new Date().toISOString() }),
      // Only the bytes a human read carry true: a new or changed hash was downloaded, not read (the lock note).
      readByAHuman: status === 'unchanged' ? (previous?.readByAHuman ?? false) : false,
      // The capture docs/SPEC.md was derived from: it does not move because the source did.
      ...(previous?.baseline ? { baseline: previous.baseline } : {}),
    };
  }

  if (results.every(r => r.status === 'skipped')) {
    write(
      `\nEvery specification source was refused by the terms gate (${TERMS_RULING}): nothing was\n` +
        'downloaded, the lock is untouched, and a new edition cannot be detected until those sites\'\n' +
        'terms are read and allow a runner. Read them (for a refusal-type site, a GitHub-hosted copy)\n' +
        'and record the verdict in research/channel-loop/terms-verdicts.json.\n',
    );
    return { exitCode: 0, results };
  }

  writeFileSync(lockPath, `${JSON.stringify(lock, null, 2)}\n`, 'utf8');

  if (!anyReachable) {
    write(
      '\nNo specification URL was reachable from here. That is the expected result inside the\n' +
        'automaton build container, where gov.il and both vendor mirrors are egress-blocked; in\n' +
        'GitHub Actions it means the URLs have moved and docs/SPEC.md §1 needs a look.\n' +
        'Not treated as a failure, because a network result is not evidence about the format.\n',
    );
    return { exitCode: 0, results };
  }

  if (changed) {
    writeErr(
      '\nA specification hash changed. products/pcn874/docs/SPEC.md and src/layout.ts are derived from\n' +
        'the 2009 circular whose hash this job recorded; a new edition may move a width or an offset.\n' +
        'Download the artefact this run uploaded, extract it (node scripts/pdf-text.mjs), diff it\n' +
        'against docs/SPEC.md, and update the table before shipping anything that depends on it.\n',
    );
    return { exitCode: 1, results };
  }

  return { exitCode: 0, results };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const { exitCode } = await runSpecWatch();
  process.exit(exitCode);
}
