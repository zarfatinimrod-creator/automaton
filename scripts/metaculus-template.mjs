#!/usr/bin/env node
/**
 * BOARD-2 §1.9 — the Metaculus TEST_FIRST: would Metaculus's own template bot have been paid in 2026?
 *
 * WHY THIS EXISTS. The board deferred Metaculus's bot tournaments instead of killing them: bots are the entry
 * requirement there, and in 2025 the template bot placed #1 and #2 (`screen-2/metaculus-bots.md`). What nobody has
 * seen is a 2026 season — the only place those leaderboards are served is metaculus.com, which refuses this
 * container. The board ordered one zero-cost reading from a GitHub runner, with its pass and kill lines written
 * down before the number existed. This script is the arithmetic half of that reading.
 *
 * WHERE THE BYTES COME FROM. Two runner channels, both unauthenticated, both committed with their meta.json:
 *   - `metaculus-lb-<id>`         `render-watch.yml` dispatched with the two URLs (browser User-Agent)
 *   - `metaculus-lb-<id>-client`  `metaculus-template.yml`, through `requests` — the library's own HTTP stack
 * This script reads only those committed files and touches no network, so an auditor re-runs it and gets the same
 * table. The channel counts as refused only when every attempt was refused. No URL is invented:
 *   - base   `https://www.metaculus.com/api`  — `forecasting_tools/helpers/metaculus_client.py:174` (0.3.1)
 *   - route  `leaderboards/project/<int:project_id>/`, `@permission_classes([AllowAny])` — Metaculus/metaculus
 *            `scoring/urls.py` and `scoring/views.py:105-106`, mounted under `api/` (`metaculus_web/urls.py:44`)
 *   - ids    `AIB_SPRING_2026_ID = 32916`, `FE_SUMMER_2026_ID = 33022` — `metaculus_client.py:115-117`
 *
 * THE COUNTERFACTUAL. Metaculus pays a tournament by `take = max(score, 0) ** 2` (`scoring/utils.py:224-231`), and
 * each included entry's share is its take over the included entries' total, after entries under the minimum prize
 * drop out (`assign_prize_percentages_`, `utils.py:527-548`). The template bot is not prize-eligible, so "what would
 * it have taken" is the board's method: its take over the paid entries' published take plus its own, times the pool.
 *
 * WHAT IT IS NOT. Not revenue, and not an admission: even a PASS only turns BOARD §8.1 into a question for the owner
 * with a number in it, and the default answer stays no.
 *
 * USAGE
 *   node scripts/metaculus-template.mjs             # writes research/measurements/metaculus-template-2026.md
 *   node scripts/metaculus-template.mjs --stdout    # prints it instead
 */
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { parseArgs } from "node:util";

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(HERE, "..");

export const API_BASE = "https://www.metaculus.com/api";
export const SEASONS = [
  { id: 32916, name: "Spring 2026", constant: "AIB_SPRING_2026_ID" },
  { id: 33022, name: "Summer 2026", constant: "FE_SUMMER_2026_ID" },
];
/** BOARD-2 §1.9, pre-registered. PASS needs all three in both seasons; any one KILL line in either season kills. */
export const GATES = { passMinScoreExclusive: 0, passMaxRank: 15, passMinPrizeUsd: 400, killBelowPrizeUsd: 300 };
/** `scoring/constants.py` ExclusionStatuses: only INCLUDE is paid. */
export const INCLUDE = 0;
/** Score types whose take is `max(score, 0) ** 2` (`scoring/utils.py:224-231`); anything else is not computed. */
const SQUARED_TAKE_TYPES = new Set(["peer_tournament", "default", "spot_peer_tournament", "spot_baseline_tournament"]);

export const leaderboardUrl = (id) => `${API_BASE}/leaderboards/project/${id}/`;
export const isTemplateBot = (entry) => /^metac-/i.test(entry?.user?.username ?? "");
const num = (v) => (v === null || v === undefined || v === "" ? null : Number.isFinite(Number(v)) ? Number(v) : null);
const takeOf = (entry) => num(entry.take) ?? Math.max(num(entry.score) ?? 0, 0) ** 2;
const isIncluded = (entry) =>
  entry.exclusion_status !== undefined && entry.exclusion_status !== null ? entry.exclusion_status === INCLUDE : entry.excluded === false;

/** The endpoint returns a list of leaderboards for the project; the prize is paid on the primary one. */
export function pickLeaderboard(body) {
  const list = Array.isArray(body) ? body : body && typeof body === "object" ? [body] : [];
  return list.find((lb) => lb?.is_primary_leaderboard) ?? list[0] ?? null;
}

/**
 * One season: the best `metac-*` template bot, where it would have ranked among prize-eligible entries, and what it
 * would have taken. Returns `{ error }` instead of a number when the leaderboard cannot answer the question.
 */
export function summariseSeason(leaderboard) {
  if (!leaderboard) return { error: "no leaderboard in the response" };
  if (!SQUARED_TAKE_TYPES.has(leaderboard.score_type)) {
    return { error: `score_type ${JSON.stringify(leaderboard.score_type)} does not pay by squared score; not computed` };
  }
  const entries = (leaderboard.entries ?? []).filter((e) => e?.user && num(e.score) !== null);
  const templates = entries.filter(isTemplateBot).sort((a, b) => num(b.score) - num(a.score));
  if (templates.length === 0) return { error: "no metac-* entry on the leaderboard" };

  const best = templates[0];
  const bestScore = num(best.score);
  const eligible = entries.filter(isIncluded);
  const paid = eligible.filter((e) => (num(e.prize) ?? 0) > 0);
  const paidTake = paid.reduce((sum, e) => sum + takeOf(e), 0);
  const pool = num(leaderboard.prize_pool) ?? paid.reduce((sum, e) => sum + num(e.prize), 0);
  const take = Math.max(bestScore, 0) ** 2;
  const share = take > 0 ? take / (paidTake + take) : 0;
  const rank = 1 + eligible.filter((e) => num(e.score) > bestScore).length;
  const prize = Math.round(share * pool);

  return {
    leaderboardId: leaderboard.id,
    projectName: leaderboard.project_name ?? null,
    scoreType: leaderboard.score_type,
    finalized: leaderboard.finalized === true,
    prizePool: pool,
    prizePoolFromApi: num(leaderboard.prize_pool) !== null,
    entries: entries.length,
    eligible: eligible.length,
    paid: paid.length,
    minPaidPrize: paid.length ? Math.min(...paid.map((e) => num(e.prize))) : null,
    best: { username: best.user.username, score: bestScore, publishedRank: num(best.rank), exclusionStatus: best.exclusion_status ?? null },
    rankAmongEligible: rank,
    counterfactualShare: share,
    counterfactualPrizeUsd: prize,
    templates: templates.map((e) => ({ username: e.user.username, score: num(e.score), rank: num(e.rank) })),
    topEligible: [...eligible]
      .sort((a, b) => num(b.score) - num(a.score))
      .slice(0, GATES.passMaxRank + 5)
      .map((e) => ({ username: e.user.username, isBot: e.user.is_bot === true, score: num(e.score), rank: num(e.rank), prize: num(e.prize) ?? 0 })),
  };
}

/** PASS / KILL / NEITHER for one season, with the gate that decided it. */
export function gradeSeason(s) {
  if (s.error) return { grade: "KILL", why: `unreadable: ${s.error}` };
  const kills = [];
  if (s.best.score <= GATES.passMinScoreExclusive) kills.push(`best template score ${s.best.score.toFixed(1)} ≤ 0`);
  if (s.counterfactualPrizeUsd < GATES.killBelowPrizeUsd) kills.push(`counterfactual $${s.counterfactualPrizeUsd} < $${GATES.killBelowPrizeUsd}`);
  if (kills.length) return { grade: "KILL", why: kills.join("; ") };
  const misses = [];
  if (s.rankAmongEligible > GATES.passMaxRank) misses.push(`rank ${s.rankAmongEligible} > ${GATES.passMaxRank}`);
  if (s.counterfactualPrizeUsd < GATES.passMinPrizeUsd) misses.push(`counterfactual $${s.counterfactualPrizeUsd} < $${GATES.passMinPrizeUsd}`);
  if (misses.length) return { grade: "NEITHER", why: misses.join("; ") };
  return { grade: "PASS", why: `score ${s.best.score.toFixed(1)} > 0, rank ${s.rankAmongEligible} ≤ ${GATES.passMaxRank}, $${s.counterfactualPrizeUsd} ≥ $${GATES.passMinPrizeUsd}` };
}

/** The two runner channels, in the order they are tried; `slugSuffix` names the capture in research/rendered/. */
export const CHANNELS = [
  { slugSuffix: "", name: "render-watch.yml (browser User-Agent)" },
  { slugSuffix: "-client", name: "metaculus-template.yml (requests, the library's HTTP stack)" },
];

const describeAttempt = (a) =>
  !a.meta
    ? `${a.channel}: not fetched yet`
    : `${a.channel}: HTTP ${a.meta.status ?? "none"}${a.meta.status === 200 && a.body === null ? ", body not JSON" : ""}${a.meta.status !== 200 && a.meta.error ? ` (${a.meta.error})` : ""}`;

/**
 * The whole test. `fetches` is one `{ season, attempts }` per season; each attempt is `{ channel, meta, body }` where
 * `meta` is the capture's meta.json (null when that channel never ran) and `body` the parsed JSON (null when absent or
 * not JSON). The first attempt that returned JSON is graded; a season is refused only when every channel ran and was.
 */
export function evaluate(fetches) {
  const seasons = fetches.map(({ season, attempts }) => {
    const channel = attempts.map(describeAttempt).join("; ");
    const ok = attempts.find((a) => a.meta?.status === 200 && a.body !== null);
    if (ok) {
      const summary = summariseSeason(pickLeaderboard(ok.body));
      return { season, attempts, channel, source: ok, summary, grade: gradeSeason(summary) };
    }
    // A refusal counts only once every channel has been tried; until then nothing is decided.
    if (attempts.some((a) => !a.meta)) return { season, attempts, channel, source: null, summary: null, grade: null };
    return { season, attempts, channel, source: null, summary: null, grade: { grade: "KILL", why: "the API refused an unauthenticated GitHub runner" } };
  });
  let verdict;
  if (seasons.some((s) => s.grade === null)) verdict = "PENDING";
  else if (seasons.some((s) => s.grade.grade === "KILL")) verdict = "KILL";
  else if (seasons.every((s) => s.grade.grade === "PASS")) verdict = "PASS";
  else verdict = "NEITHER";
  return { verdict, seasons };
}

const usd = (n) => (n === null || n === undefined ? "—" : `$${Math.round(n).toLocaleString("en-US")}`);
const f1 = (n) => (n === null || n === undefined ? "—" : n.toFixed(1));

const VERDICT_TEXT = {
  PENDING: "**PENDING** — at least one season has not been fetched yet. Nothing is decided.",
  KILL: "**KILL.** A pre-registered kill line fired (BOARD-2 §1.9). The line stays rejected at ₪0 and nothing goes to the owner.",
  PASS:
    "**PASS — which does not admit the line.** Per BOARD-2 §1.9 it turns BOARD §8.1 into one question for the owner, " +
    "with the number below in it; the default answer stays **no**, and only a yes triggers a re-screen.",
  NEITHER:
    "**NEITHER.** No kill line fired, but the pass bar was not met in both seasons. The board wrote no rule for this band, " +
    "so nothing changes: the line stays TEST_FIRST at ₪0 and nothing goes to the owner.",
};

/**
 * The fourth KILL line ("the current season's rules no longer make bots prize-eligible") is read by hand, from the
 * site's own source on GitHub, because metaculus.com's rendered pages refuse runners. Dated; re-read it on a re-run.
 */
export const RULES_CHECK =
  "**Rules check (by hand, 27.9.2026, from GitHub — not a KILL).** Metaculus/metaculus `main`, " +
  "`front_end/src/app/(futureeval)/futureeval/components/futureeval-participate-tab.tsx`: the Seasonal Bot Tournament " +
  "card still reads `title: \"Seasonal Bot Tournament\"` (:204), and the submit steps still end " +
  "*\"Watch your bot forecast and compete for prizes!\"* (:84); the only card marked not prize-eligible is the " +
  "human-vs-bot benchmark (:234, *\"bots aren't prize-eligible\"*). So bots are still prize-eligible in the seasonal tournament.";

export function renderReport(result, { generatedAt }) {
  const L = [];
  L.push("# Metaculus template bot, 2026 seasons — the BOARD-2 §1.9 test");
  L.push("");
  L.push(`Generated ${generatedAt} by \`scripts/metaculus-template.mjs\` from the runner captures in \`research/rendered/\`. ` +
    "Re-run it to re-derive every number here; it reads committed files only.");
  L.push("");
  L.push(`## Verdict: ${result.verdict}`);
  L.push("");
  L.push(VERDICT_TEXT[result.verdict]);
  L.push("");
  L.push("Pre-registered lines (BOARD-2 §1.9): **PASS** in both seasons = best template score > 0, rank ≤ 15 among " +
    "prize-eligible entries, counterfactual prize ≥ $400. **KILL** on any one = the API refuses the runner; best " +
    "template score ≤ 0 in either season; counterfactual < $300 in either season; the current season's rules no " +
    "longer make bots prize-eligible (checked by hand, below).");
  L.push("");
  L.push("| Season | Id | Runner attempts | Best template bot | Score | Rank among eligible | Counterfactual | Grade |");
  L.push("|---|---|---|---|---|---|---|---|");
  for (const s of result.seasons) {
    const m = s.summary;
    const ok = m && !m.error;
    L.push(`| ${s.season.name} | ${s.season.id} | ${s.channel} | ${ok ? `\`${m.best.username}\`` : "—"} | ${ok ? f1(m.best.score) : "—"} | ` +
      `${ok ? m.rankAmongEligible : "—"} | ${ok ? `${usd(m.counterfactualPrizeUsd)} (${(m.counterfactualShare * 100).toFixed(1)}% of ${usd(m.prizePool)})` : "—"} | ` +
      `${s.grade ? `${s.grade.grade} — ${s.grade.why}` : "—"} |`);
  }
  L.push("");
  L.push(RULES_CHECK);
  for (const s of result.seasons) {
    const m = s.summary;
    L.push("");
    L.push(`## ${s.season.name} (\`${s.season.constant} = ${s.season.id}\`)`);
    L.push("");
    L.push(`- URL: \`${leaderboardUrl(s.season.id)}\`.`);
    for (const a of s.attempts) {
      const slug = `metaculus-lb-${s.season.id}${a.slugSuffix}`;
      L.push(`- ${a.channel}: ${a.meta ? `HTTP ${a.meta.status ?? "none"}, ${a.meta.byteLength ?? 0} bytes` +
        `${a.meta.contentType ? ` \`${a.meta.contentType}\`` : ""}${a.meta.server ? `, server \`${a.meta.server}\`` : ""}` +
        `${a.meta.sha256 ? `, sha256 \`${a.meta.sha256}\`` : ""}, fetched ${a.meta.fetchedAt} — \`research/rendered/${slug}.meta.json\`` : "not run"}.`);
    }
    if (!m) continue;
    if (m.error) {
      L.push(`- Not computed: ${m.error}.`);
      continue;
    }
    L.push(`- Leaderboard ${m.leaderboardId}${m.projectName ? ` (“${m.projectName}”)` : ""}, score type \`${m.scoreType}\`, ` +
      `${m.finalized ? "finalized" : "**not finalized** — the numbers can still move"}.`);
    L.push(`- Prize pool ${usd(m.prizePool)}${m.prizePoolFromApi ? "" : " (not in the response; summed from paid prizes)"}; ` +
      `${m.entries} entries, ${m.eligible} prize-eligible, ${m.paid} paid, lowest paid prize ${usd(m.minPaidPrize)}.`);
    L.push(`- Best template bot \`${m.best.username}\`: score ${f1(m.best.score)}, published rank ${m.best.publishedRank ?? "—"} ` +
      `(exclusion_status ${m.best.exclusionStatus ?? "—"}), would rank ${m.rankAmongEligible} among eligible entries.`);
    L.push("");
    L.push("Every `metac-*` row:");
    L.push("");
    L.push("| Username | Score | Published rank |");
    L.push("|---|---|---|");
    for (const t of m.templates) L.push(`| \`${t.username}\` | ${f1(t.score)} | ${t.rank ?? "—"} |`);
    L.push("");
    L.push(`Top ${m.topEligible.length} prize-eligible rows:`);
    L.push("");
    L.push("| Username | Bot | Score | Published rank | Prize |");
    L.push("|---|---|---|---|---|");
    for (const e of m.topEligible) L.push(`| \`${e.username}\` | ${e.isBot ? "yes" : "no"} | ${f1(e.score)} | ${e.rank ?? "—"} | ${usd(e.prize)} |`);
  }
  L.push("");
  return L.join("\n");
}

function readCapture(slug) {
  const metaPath = join(REPO_ROOT, "research", "rendered", `${slug}.meta.json`);
  if (!existsSync(metaPath)) return { meta: null, body: null };
  const meta = JSON.parse(readFileSync(metaPath, "utf8"));
  let body = null;
  if (meta.bodyPath && existsSync(join(REPO_ROOT, meta.bodyPath))) {
    try {
      body = JSON.parse(readFileSync(join(REPO_ROOT, meta.bodyPath), "utf8"));
    } catch {
      body = null;
    }
  }
  return { meta, body };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const { values } = parseArgs({ options: { stdout: { type: "boolean", default: false } } });
  const fetches = SEASONS.map((season) => ({
    season,
    attempts: CHANNELS.map((c) => ({ channel: c.name, slugSuffix: c.slugSuffix, ...readCapture(`metaculus-lb-${season.id}${c.slugSuffix}`) })),
  }));
  const result = evaluate(fetches);
  const report = renderReport(result, { generatedAt: new Date().toISOString() });
  if (values.stdout) process.stdout.write(report);
  else {
    const out = join(REPO_ROOT, "research", "measurements", "metaculus-template-2026.md");
    writeFileSync(out, report);
    console.log(`${result.verdict}: wrote ${out}`);
  }
}
