# Metaculus template bot, 2026 seasons — the BOARD-2 §1.9 test

Generated 2026-09-27T09:38:39.410Z by `scripts/metaculus-template.mjs` from the runner captures in `research/rendered/`. Re-run it to re-derive every number here; it reads committed files only.

## Verdict: KILL

**KILL.** A pre-registered kill line fired (BOARD-2 §1.9). The line stays rejected at ₪0 and nothing goes to the owner.

Pre-registered lines (BOARD-2 §1.9): **PASS** in both seasons = best template score > 0, rank ≤ 15 among prize-eligible entries, counterfactual prize ≥ $400. **KILL** on any one = the API refuses the runner; best template score ≤ 0 in either season; counterfactual < $300 in either season; the current season's rules no longer make bots prize-eligible (checked by hand, below).

| Season | Id | Runner attempts | Best template bot | Score | Rank among eligible | Counterfactual | Grade |
|---|---|---|---|---|---|---|---|
| Spring 2026 | 32916 | render-watch.yml (browser User-Agent): HTTP 403 (HTTP 403 Forbidden); metaculus-template.yml (requests, the library's HTTP stack): HTTP 403 (HTTP 403) | — | — | — | — | KILL — the API refused an unauthenticated GitHub runner |
| Summer 2026 | 33022 | render-watch.yml (browser User-Agent): HTTP 403 (HTTP 403 Forbidden); metaculus-template.yml (requests, the library's HTTP stack): HTTP 403 (HTTP 403) | — | — | — | — | KILL — the API refused an unauthenticated GitHub runner |

**Rules check (by hand, 27.9.2026, from GitHub — not a KILL).** Metaculus/metaculus `main`, `front_end/src/app/(futureeval)/futureeval/components/futureeval-participate-tab.tsx`: the Seasonal Bot Tournament card still reads `title: "Seasonal Bot Tournament"` (:204), and the submit steps still end *"Watch your bot forecast and compete for prizes!"* (:84); the only card marked not prize-eligible is the human-vs-bot benchmark (:234, *"bots aren't prize-eligible"*). So bots are still prize-eligible in the seasonal tournament.

## Spring 2026 (`AIB_SPRING_2026_ID = 32916`)

- URL: `https://www.metaculus.com/api/leaderboards/project/32916/`.
- render-watch.yml (browser User-Agent): HTTP 403, 0 bytes `text/plain;charset=UTF-8`, fetched 2026-09-27T09:31:36.238Z — `research/rendered/metaculus-lb-32916.meta.json`.
- metaculus-template.yml (requests, the library's HTTP stack): HTTP 403, 134 bytes `text/plain;charset=UTF-8`, server `cloudflare`, sha256 `480b0bcd896918ddbd8bf784df748a2ba50956ed7a0133ffef07f31a87aea824`, fetched 2026-09-27T09:38:39.151009Z — `research/rendered/metaculus-lb-32916-client.meta.json`.

## Summer 2026 (`FE_SUMMER_2026_ID = 33022`)

- URL: `https://www.metaculus.com/api/leaderboards/project/33022/`.
- render-watch.yml (browser User-Agent): HTTP 403, 0 bytes `text/plain;charset=UTF-8`, fetched 2026-09-27T09:31:37.264Z — `research/rendered/metaculus-lb-33022.meta.json`.
- metaculus-template.yml (requests, the library's HTTP stack): HTTP 403, 134 bytes `text/plain;charset=UTF-8`, server `cloudflare`, sha256 `480b0bcd896918ddbd8bf784df748a2ba50956ed7a0133ffef07f31a87aea824`, fetched 2026-09-27T09:38:39.255127Z — `research/rendered/metaculus-lb-33022-client.meta.json`.
