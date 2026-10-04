#!/usr/bin/env -S node --import tsx
/**
 * Run the publication gate (G1-G11, src/revenue/publication-gate.ts) on a rendered video's manifest.json.
 *
 *   pnpm exec tsx scripts/publication-check.ts products/chart-explainer/out/t1/manifest.json
 *   pnpm exec tsx scripts/publication-check.ts <manifest.json> --expect G3,G4,G5
 *
 * The channel is the T1 channel: nothing published, no YPP review pending, no DMCA counter-notice. Licence snapshots
 * are looked up on disk relative to the repository root, which is what G1 means by "on disk".
 *
 * Prints one line per failure. Exit 0 when the gate passes. With --expect, exit 0 exactly when the failing gates are
 * the listed set — for the state "rendered, audits pending", where G3-G5 are supposed to fail until separate auditor
 * agents fill them — and exit 1 on any other set, so a new failure cannot hide behind the expected ones.
 *
 * This script reads a file and prints. It has no upload path and makes no request.
 */
import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { checkPublication, type ChannelState, type GateId, type GateResult, type VideoManifest } from "../src/revenue/publication-gate.js";

export const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");

/** T1 is the first video: an empty channel, as the brief and T1-PROTOCOL.md describe it. */
export const T1_CHANNEL: ChannelState = { published: [], yppReviewPending: false, dmcaCounterNoticeFiled: false };

/** Every field VideoManifest declares. A manifest missing one is refused before the gate runs, not half-checked. */
export const MANIFEST_FIELDS = [
  "id",
  "author",
  "line",
  "title",
  "description",
  "tags",
  "thumbnailBrief",
  "topic",
  "script",
  "datasets",
  "originality",
  "factCheck",
  "promiseMatch",
  "containsSyntheticMedia",
  "madeForKids",
  "onScreenTagEveryFrame",
  "narration",
  "scheduledAt",
  "runnerMinutes",
  "tokenCostIls",
] as const satisfies readonly (keyof VideoManifest)[];

export function loadManifest(path: string): VideoManifest {
  const data = JSON.parse(readFileSync(path, "utf8")) as Record<string, unknown>;
  const missing = MANIFEST_FIELDS.filter((k) => !(k in data));
  if (missing.length) throw new Error(`${path}: not a VideoManifest, missing ${missing.join(", ")}`);
  return data as unknown as VideoManifest;
}

export function runPublicationCheck(
  video: VideoManifest,
  exists: (repoPath: string) => boolean = (p) => existsSync(resolve(REPO_ROOT, p)),
): GateResult {
  return checkPublication(video, T1_CHANNEL, "publish", exists);
}

export function failingGates(result: GateResult): GateId[] {
  const order = (g: GateId) => Number(g.slice(1));
  return [...new Set(result.failures.map((f) => f.gate))].sort((a, b) => order(a) - order(b));
}

export function formatResult(video: VideoManifest, result: GateResult): string[] {
  const lines = [`${video.id}: ${result.pass ? "PASS" : "FAIL"} (${result.failures.length} failure(s))`];
  for (const f of result.failures) lines.push(`  FAIL ${f.gate}: ${f.reason}`);
  return lines;
}

/** Exit status for a result, given an optional expected failing set (see the header). */
export function exitCode(result: GateResult, expect: GateId[] | null): number {
  if (!expect) return result.pass ? 0 : 1;
  const got = failingGates(result);
  const want = [...new Set(expect)].sort((a, b) => Number(a.slice(1)) - Number(b.slice(1)));
  return got.length === want.length && got.every((g, i) => g === want[i]) ? 0 : 1;
}

function parseExpect(argv: string[]): GateId[] | null {
  const i = argv.indexOf("--expect");
  if (i < 0) return null;
  const list = (argv[i + 1] ?? "").split(",").map((s) => s.trim()).filter(Boolean);
  const bad = list.filter((g) => !/^G([1-9]|1[01])$/.test(g));
  if (bad.length) throw new Error(`--expect takes gate ids G1-G11, got ${bad.join(", ")}`);
  return list as GateId[];
}

function main(argv: string[]): number {
  const path = argv.find((a, i) => !a.startsWith("--") && argv[i - 1] !== "--expect");
  if (!path) {
    console.error("usage: tsx scripts/publication-check.ts <manifest.json> [--expect G3,G4,G5]");
    return 2;
  }
  const expect = parseExpect(argv);
  const video = loadManifest(resolve(path));
  const result = runPublicationCheck(video);
  for (const line of formatResult(video, result)) console.log(line);
  const code = exitCode(result, expect);
  if (expect) {
    console.log(`expected failing gates: ${expect.join(", ") || "(none)"}; got: ${failingGates(result).join(", ") || "(none)"} -> ${code === 0 ? "as expected" : "UNEXPECTED"}`);
  }
  return code;
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  process.exit(main(process.argv.slice(2)));
}
