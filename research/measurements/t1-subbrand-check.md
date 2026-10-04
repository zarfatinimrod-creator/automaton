# Brand check — research/measurements/t1-subbrand-candidates.txt

Measured 2026-09-30T08:53:40.348Z by `scripts/brand-check.mjs` from a runner. Status codes only; no page body stored.
404 = free, 200 = taken, anything else (a redirect, a refusal, an error) = unknown.

> **Compliance note, added 4.10.2026 (research/channel-loop/RULING-2026-10-04-kids-youtube.md §7 rule 4, fold 8).** This
> run, at 2026-09-30T08:53:40Z (commit `e8a3759`), probed `www.youtube.com` after youtube.com entered `TERMS_BARRED` on
> 29.9.2026 at 14:01:49Z (commit `52dafb4`; ruling 30.9 16(d) D2). The 29.9 08:54-08:55 runs came before the bar. It is
> not repeated: `scripts/brand-check.mjs` now refuses the YouTube probe while youtube.com is barred, and a re-run of this
> list would ask three probes only. The YouTube column below stays on disk under D1(1)(ii), as the record of the breach
> and the reason not to re-probe.

| name | .com | GitHub | YouTube | Netlify | all four free |
|---|---|---|---|---|---|
| `chartexplained` | free (404) | free (404) | taken (200) | free (404) | no |
| `plotnotes` | taken (200) | taken (200) | taken (200) | free (404) | no |
| `axisnotes` | taken (200) | taken (200) | free (404) | free (404) | no |
| `dataplotted` | taken (200) | free (404) | free (404) | free (404) | no |
| `linesandbars` | free (404) | free (404) | taken (200) | free (404) | no |
| `readthechart` | taken (200) | free (404) | taken (200) | free (404) | no |
| `chartsplained` | free (404) | free (404) | free (404) | free (404) | **yes** |
| `plainchart` | taken (200) | free (404) | taken (200) | free (404) | no |
| `datawalkthrough` | free (404) | free (404) | free (404) | free (404) | **yes** |
| `chartlesson` | free (404) | free (404) | taken (200) | free (404) | no |

First all-free name in list order: `chartsplained`.
No probe answered unknown.

The Netlify probe's reading (404 = no site holds the name) is grade none until a fold reads this first result
(research/channel-loop/RULING-2026-09-29-lines.md (e)). This file is a measurement, not a choice: the fold records
the name, and the owner may veto it.
