#!/usr/bin/env node
/**
 * Flag dependencies whose pinned version has stopped moving while the package
 * itself has not.
 *
 * Written 4.9.2026 after finding by hand that products/x402-il-api sells over
 * `x402-express@1.2.0` (last published 2026-04-16) while the x402 ecosystem had
 * moved to `@x402/express`, which shipped 2.25.0 that same morning. Nothing in
 * this repo would have noticed. The rail that needs no KYC — the only one that
 * can earn before the owner does anything — was riding the abandoned half of its
 * own SDK, and it took a third-party skill mentioning something unrelated to
 * surface it.
 *
 * Two things that finding teaches, both encoded below:
 *
 *   1. `x402-express` is an *optionalDependency*, so a checker that reads only
 *      `dependencies` and `devDependencies` would have missed the very case that
 *      motivated it. All four dependency fields are scanned.
 *   2. "Behind latest" is the wrong alarm on its own — plenty of pins are
 *      deliberately behind and fine. The signal that matters is DIVERGENCE: our
 *      pin has not moved in a long time *and* the package has moved since. That
 *      is the shape of a dependency being quietly abandoned underneath us.
 *
 * Usage:
 *   node scripts/check-deps-freshness.mjs            # all products, human output
 *   node scripts/check-deps-freshness.mjs --json     # machine-readable
 *   node scripts/check-deps-freshness.mjs --dir products/x402-il-api
 *
 * WHAT THIS CANNOT DO, said before the output tempts anyone to trust it more than
 * it deserves: it cannot tell an abandoned package from a finished one. Measured
 * against this repo's own 14 dependencies, a 120-day quiet window flags four —
 * `x402-express` (140d, the real find) and also `express` (276d) and `supertest`
 * (240d), which are quiet because they are mature and done. Same silence, opposite
 * meaning, and no registry field separates them. So this is a triage list for a
 * human to read, not a verdict, and only a publisher's own deprecation exits
 * non-zero by default. `--strict` treats every finding as blocking, for a release
 * gate where somebody has already decided the noise is worth it.
 */
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join } from "node:path";
import { parseArgs } from "node:util";

/** A pin unchanged for this long is old enough to be worth a look. */
export const STALE_PIN_DAYS = 180;
/** ...but only alarming if the package itself moved this much more recently. */
export const MOVED_SINCE_DAYS = 90;
/**
 * A package whose OWN latest release is older than this has gone quiet, and a
 * dependency that has gone quiet is the shape of the x402 case: `x402-express`
 * reads as perfectly current, because 1.2.0 really is its latest — the project
 * simply stopped publishing under that name and continued as `@x402/express`.
 * No amount of comparing our pin to its latest can see that. What can be seen is
 * the silence. Threshold calibrated below against this repo's own dependencies.
 */
export const PACKAGE_QUIET_DAYS = 120;

const DEP_FIELDS = ["dependencies", "devDependencies", "optionalDependencies", "peerDependencies"];

const DAY_MS = 86_400_000;
const days = (a, b) => Math.floor((a - b) / DAY_MS);

/** Strip a range prefix to the version it floors at. Returns null if unresolvable. */
export function floorVersion(range) {
  if (typeof range !== "string") return null;
  const m = /^[\^~>=]*\s*(\d+\.\d+\.\d+(?:-[\w.]+)?)$/.exec(range.trim());
  return m ? m[1] : null;
}

export function majorOf(version) {
  const m = /^(\d+)\./.exec(version ?? "");
  return m ? Number(m[1]) : null;
}

/**
 * Decide what to say about one dependency. Pure: no network, no clock.
 *
 * @param {{name:string, range:string, latest:string|null,
 *          latestTime:number|null, pinnedTime:number|null,
 *          deprecated?:string|null, now:number}} input
 * @returns {{name:string, range:string, severity:"deprecated"|"major-behind"|"abandoned-pin"|"behind"|"current"|"unknown", blocking:boolean, detail:string}}
 */
export function assessPackage({ name, range, latest, latestTime, pinnedTime, deprecated, now }) {
  const pinned = floorVersion(range);
  const say = (severity, blocking, detail) => ({ name, range, severity, blocking, detail });

  if (deprecated) return say("deprecated", true, `deprecated by its publisher: ${deprecated}`);
  if (!latest) return say("unknown", false, "not found on the registry");
  if (!pinned) return say("unknown", false, `range "${range}" does not floor at a single version`);

  const latestAge = latestTime == null ? null : days(now, latestTime);
  // Checked before the pin comparisons on purpose: a package that has stopped
  // publishing is a bigger fact about a dependency than how far behind we are.
  if (latestAge != null && latestAge >= PACKAGE_QUIET_DAYS) {
    return say(
      "quiet-package", false,
      `the package itself has not published in ${latestAge}d (latest ${latest}) ` +
      `— check whether it continued under another name`,
    );
  }

  const pinnedMajor = majorOf(pinned);
  const latestMajor = majorOf(latest);
  const pinAgeDays = pinnedTime == null ? null : days(now, pinnedTime);
  const latestAgeDays = latestAge;

  // Divergence: our pin is old and the package has moved on well after it.
  if (
    pinAgeDays != null && latestAgeDays != null &&
    pinAgeDays >= STALE_PIN_DAYS && pinAgeDays - latestAgeDays >= MOVED_SINCE_DAYS
  ) {
    return say(
      "abandoned-pin", false,
      `pinned ${pinned} last published ${pinAgeDays}d ago; ${latest} published ${latestAgeDays}d ago ` +
      `— the package moved ${pinAgeDays - latestAgeDays}d after our pin stopped`,
    );
  }

  if (pinnedMajor != null && latestMajor != null && latestMajor > pinnedMajor) {
    return say("major-behind", false, `pinned ${pinned}, latest ${latest} — ${latestMajor - pinnedMajor} major behind`);
  }
  if (pinned !== latest) return say("behind", false, `pinned ${pinned}, latest ${latest}`);
  return say("current", false, `at ${latest}`);
}

/** Every dependency declared by a package.json, with the field it came from. */
export function collectDeps(pkgJson) {
  const out = [];
  for (const field of DEP_FIELDS) {
    for (const [name, range] of Object.entries(pkgJson[field] ?? {})) out.push({ name, range, field });
  }
  return out;
}

async function fetchPackument(name) {
  const url = `https://registry.npmjs.org/${name.replace("/", "%2F")}`;
  const res = await fetch(url);
  if (!res.ok) return null;
  return res.json();
}

async function main() {
  const { values } = parseArgs({
    options: {
      json: { type: "boolean", default: false },
      strict: { type: "boolean", default: false },
      dir: { type: "string" },
    },
  });
  const roots = values.dir
    ? [values.dir]
    : readdirSync("products", { withFileTypes: true })
        .filter((e) => e.isDirectory() && existsSync(join("products", e.name, "package.json")))
        .map((e) => join("products", e.name));

  const now = Date.now();
  const findings = [];

  for (const root of roots) {
    const pkg = JSON.parse(readFileSync(join(root, "package.json"), "utf8"));
    for (const { name, range, field } of collectDeps(pkg)) {
      const doc = await fetchPackument(name);
      const latest = doc?.["dist-tags"]?.latest ?? null;
      const time = doc?.time ?? {};
      const pinned = floorVersion(range);
      const result = assessPackage({
        name, range, latest,
        latestTime: latest && time[latest] ? Date.parse(time[latest]) : null,
        pinnedTime: pinned && time[pinned] ? Date.parse(time[pinned]) : null,
        deprecated: latest ? (doc?.versions?.[latest]?.deprecated ?? null) : null,
        now,
      });
      findings.push({ product: root, field, ...result });
    }
  }

  const blocking = findings.filter((f) =>
    values.strict ? f.severity !== "current" && f.severity !== "unknown" : f.blocking,
  );

  if (values.json) {
    console.log(JSON.stringify({ checkedAt: new Date(now).toISOString(), findings }, null, 2));
  } else {
    for (const root of roots) {
      const mine = findings.filter((f) => f.product === root);
      console.log(`\n${root}`);
      for (const f of mine.sort((a, b) => Number(b.blocking) - Number(a.blocking))) {
        const mark = f.severity === "deprecated" ? "!!" : f.severity === "current" ? "  " : " ·";
        console.log(`  ${mark} ${f.name.padEnd(32)} ${f.severity.padEnd(14)} ${f.detail}`);
      }
    }
    const noted = findings.filter((f) => f.severity !== "current" && f.severity !== "unknown");
    console.log(
      noted.length
        ? `\n${noted.length} dependency finding(s) worth a look` +
          `${blocking.length ? `, ${blocking.length} of them blocking` : " — none blocking"}.` +
          `\nA quiet package may be abandoned or may simply be finished; this cannot tell you which.`
        : "\nNothing deprecated, quiet, or a major behind.",
    );
  }

  process.exit(blocking.length ? 1 : 0);
}

if (process.argv[1] && process.argv[1].endsWith("check-deps-freshness.mjs")) await main();
