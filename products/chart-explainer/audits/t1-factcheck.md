# G4 fact-check audit: T1, "Is TypeScript catching up with JavaScript on GitHub?"

- **Gate:** G4 (fact-check), `src/revenue/publication-gate.ts`
- **Auditor:** `opus-factcheck-auditor`. The author is `opus-builder`; this audit is by a different agent.
- **Audited at:** 2026-09-27T10:31:19Z
- **Audited script sha256:** `ded6992c3e0e2f22cb03eb0e6bfefb34112e9bbac9dc44a29d8801d71572dd31`. This is the sha256 of `manifest.json` → `script`, UTF-8. I checked that the SRT text equals this script word for word.
- **Data:** GitHub Innovation Graph `data/languages.csv` at commit `078fb62ee4395d321bec9f4f06694cca68f6b6cb`. The local copy's sha256 is `795f7b9d…215dc2`, which matches the pinned value.
- **Verdict: FAIL.** All 25 figures match and all 9 claims hold, but three things fail. First, the video contradicts GitHub's widely reported Octoverse 2025 headline without addressing it. Second, 32 numbers on the charts are not in `figures.json`. Third, the page misdescribes its own figures table.

## Method

I wrote a fresh script in plain Python (csv, statistics, decimal) that reads the CSV directly. It does not import or copy `figures.py`, and I read `figures.py` only after my numbers were done, to locate chart-label formatting. The script profiles the file:

- 180,338 rows;
- 25 quarters, 2020 Q1 to 2026 Q1, with none missing;
- 185 codes;
- no duplicate (language, economy, quarter) keys;
- a minimum value of 101, consistent with the 100-developer threshold.

It then rebuilds the panel and every figure from its definition. For the ambiguous ones (top-10 growth, "earlier year") it tests several alternative definitions.

The EU exclusion is correct. The EU row is exactly the sum of its member states' rows: TypeScript 2020 Q1 is 58,654 against 58,654, TypeScript 2026 Q1 is 371,275 against 371,275, and JavaScript 2026 Q1 is 711,716 against 711,716. Keeping it would double-count those developers.

## 1. Figures: 25 recomputed, 25 MATCH, 0 MISMATCH

| # | Figure | figures.json value | Spoken/text | My value | Rounding check | Result |
|---|---|---|---|---|---|---|
| 1 | panel_economies | 92 | "92" | 92 (both languages in all 25 quarters, EU excluded) | none | MATCH |
| 2 | first_quarter | [2020,1] | "the first quarter of 2020" | (2020,1) | – | MATCH |
| 3 | last_quarter | [2026,1] | "the first quarter of 2026" | (2026,1) | – | MATCH |
| 4 | prev_year_quarter | [2025,1] | (not spoken) | (2025,1), present in file | – | MATCH |
| 5 | first_year | 2020 | "2020" | 2020 | – | MATCH |
| 6 | last_year | 2026 | (not spoken) | 2026 | – | MATCH |
| 7 | span_years | 6 | "6 years" | 24 quarter-steps / 4 = 6 | whole | MATCH |
| 8 | ratio_first_pct | 17.72552240442563 | "18%" | 247,329 / 1,395,327 × 100 = 17.72552240442563 | half-up → 18 | MATCH |
| 9 | ratio_last_pct | 48.91251773238583 | "49%" | 2,350,133 / 4,804,768 × 100 = 48.91251773238583 | half-up → 49 | MATCH |
| 10 | gap_first_millions | 1,147,998 | "1.1 million" | 1,395,327 − 247,329 = 1,147,998 | 1.147998 → 1.1 | MATCH |
| 11 | gap_last_millions | 2,454,635 | "2.5 million" | 4,804,768 − 2,350,133 = 2,454,635 | 2.454635 → 2.5 (above the 2.45 tie) | MATCH |
| 12 | a_growth_x | 9.502051922742583 | "9.5 times" | 2,350,133 / 247,329 = 9.502051922742583 | → 9.5 | MATCH |
| 13 | b_growth_x | 3.4434709569871433 | "3.4 times" | 4,804,768 / 1,395,327 = 3.4434709569871433 | → 3.4 | MATCH |
| 14 | top_n | 10 | "10" | spec parameter; my top 10 is HTML, JavaScript, CSS, Python, TypeScript, Shell, Dockerfile, Java, C++, Jupyter Notebook | – | MATCH |
| 15 | fastest_top_language | TypeScript | "TypeScript" | TypeScript 9.50×, next Dockerfile 4.71× (83 economies) | – | MATCH |
| 16 | ratio_gain_last_pts | 12.0404632913989 | "12 percentage points" | 2025 Q1 → 2026 Q1: +12.0404632913989 | → 12 | MATCH |
| 17 | ratio_gain_max_earlier_pts | 4.538617596912225 | "at most 5 percentage points" | Q1→Q1 steps: 2.98, 3.67, 4.29, 3.68, **4.54** | half-up → 5; "at most 5" is true | MATCH |
| 18 | median_ratio_first_pct | 19.751357030856532 | (not spoken) | 19.751357030856532 | → 20 | MATCH |
| 19 | median_ratio_last_pct | 50.42446213721331 | (not spoken) | 50.42446213721331 | → 50 | MATCH |
| 20 | threshold_pct | 50.0 | "50%" | spec parameter | – | MATCH |
| 21 | econ_at_threshold_first | 0 | "0" | 0 (max 38.34%) | – | MATCH |
| 22 | econ_at_threshold_last | 47 | "47" | 47 (at or above 50%, unrounded) | – | MATCH |
| 23 | max_ratio_last_pct | 60.54486168086673 | "61%" | 60.54486168086673 (RS, Serbia) | half-up → 61 | MATCH |
| 24 | econ_reported_a_first | 93 | "93" | 93 excluding EU (94 including EU) | – | MATCH |
| 25 | econ_reported_a_last | 162 | "162" | 162 excluding EU (163 including EU) | – | MATCH |

No rounded value sits on an exact .5 tie, so half-up and half-even agree for every figure.

### Robustness tests

These go beyond the figures as defined.

- **Fastest of the top 10.** TypeScript is fastest under all four definitions I tried:
  - V1, panel as defined: 9.50×.
  - V2, all economies excluding EU, raw totals: 9.76×; next is Dockerfile at 4.84×.
  - V3, each language's own fixed set of economies: 9.50×; next is Dockerfile at 4.73×.
  - V4, programming-type languages only: 9.50×.
- **"At most 5 in any earlier year."** Over every four-quarter window ending by 2025 Q1, the maximum is 4.90, still at most 5. Windows that overlap the last year are not "earlier years". The largest of those is 2024 Q4 → 2025 Q4 at +10.72, which is still below 12.04.
- **"Up from 0 in 2020."** No panel economy reached 50% in any quarter of 2020; the maximum was 39.0%.
- **"47 of 92".** This sits on a knife-edge. CN (49.955%) and EC (49.985%) fall just under the line. The count is correct as defined.
- **"The picture is the same".** Every one of the 92 economies' ratios rose from 2020 Q1 to 2026 Q1.

## 2. The 9 word claims: all hold

| Claim | Check against my numbers | Holds |
|---|---|---|
| ratio_rose | 17.73% → 48.91% | yes |
| gap_widened | 1,147,998 → 2,454,635 | yes |
| both_grew | 9.50× and 3.44× are both above 1 | yes |
| fastest_is_a | the fastest top-10 language is TypeScript, the same language as a_growth_x | yes |
| last_year_fastest | 12.04 is greater than every earlier Q1→Q1 step (max 4.54) | yes |
| no_earlier_gain_exceeds_spoken | 4.54 ≤ 5; also 4.90 ≤ 5 for any window ending by 2025 Q1 | yes |
| picture_same | median 19.75% → 50.42%; all 92 economies rose | yes |
| threshold_up_from | 0 → 47 | yes |
| reported_rose | 93 → 162 | yes |

Two wording notes, neither of which makes a claim false:

- **"JavaScript's lead grew … because both languages grew".** This is loose causation. The gap widened because JavaScript added more pushers (+3,409,441) than TypeScript did (+2,102,804). A tighter wording: "because JavaScript added more pushers than TypeScript did".
- **"The highest ratio was 61%".** This is right for the 92: Serbia, 60.54%. Across all 162 economies reported for both languages in 2026 Q1, Angola is higher at 61.70%, which rounds to 62%. The sentence follows "of the 92 economies", so its scope is clear. A tighter wording: "The highest of the 92 was 61%."

## 3. Every number that reaches a viewer

**SRT and narration.** Every number is a `figures.json` figure, stated with the correct rounding: 92; the first quarter of 2020 and the first quarter of 2026; 18%; 49%; 1.1 million; 2.5 million; 6; 9.5; 3.4; 10; 12; 5; 50%; 47; 92; 0; 2020; 61%; 93; 162. **All trace.** The SRT equals `manifest.script`.

**Page (`page/index.html`).** The body text is identical to the narration. The figure alt texts use only figures, and the figures table's values equal `figures.json`, so **all numbers trace.** One defect, finding F3: the page says each figure is shown "with its rounding stated", but the table has no rounding column or unrounded value. As a result, `ratio_gain_max_earlier_pts` appears as "5 percentage points" for "Largest change … over any earlier year", while chart s4 shows +4.5 (the true value is 4.54).

**Charts.** I recomputed all 43 data-derived numbers on the six charts and every one is correct. However, **32 of them are not in `figures.json`**. They are computed in `charts.py`, so this audit mechanism does not cover them, and neither does the script hash.

| Chart | Numbers not in figures.json | My recomputation |
|---|---|---|
| s1 | "4.80 million" (JavaScript), "2.35 million" (TypeScript) | 4,804,768 and 2,350,133 → 4.80 and 2.35 |
| s3 | Dockerfile 4.7×, Python 4.3×, Jupyter Notebook 3.9×, HTML 3.4×, CSS 3.4×, Shell 2.9×, C++ 2.4×, Java 1.5× | 4.714, 4.283, 3.906, 3.420, 3.368, 2.935, 2.359, 1.504 |
| s3 | "83 / 74 / 90 / 83 of the 92 economies reported at both ends" (Dockerfile, Jupyter Notebook, Shell, C++) | 83, 74, 90, 83 |
| s4 | +3.0, +3.7, +4.3, +3.7 | 2.975, 3.668, 4.286, 3.678 |
| s5 | 2020 Q1 bins: 3, 7, 37, 32, 10, 2, 1; 2026 Q1 bins: 3, 8, 34, 31, 14, 2 | identical, using 5-point bins that include their lower edge |
| s6 | "JavaScript: 181" | 181 excluding EU |

The remaining chart numbers do trace to `figures.json`:

- 92, 18%, 49%, 9.5×, 3.4×, "Top 10";
- the two quarters and the years;
- "47 economies at or above 50% in 2026";
- "TypeScript: 162" and "Fixed set followed here: 92".

The s4 labels +4.5 and +12.0 are the figures `ratio_gain_max_earlier_pts` and `ratio_gain_last_pts` shown at one decimal place.

`charts.py` formats its labels with Python's `format` (`:.1f`, `:.2f`). That is round-half-even on binary floats, not the half-up rule the figures use. No current label sits on a tie, so no label is wrong today.

The footers are the same on all six charts: source, commit 078fb62, CC0-1.0, "the EU aggregate is excluded; public activity only". The s6 subtitle reads "GitHub publishes an economy only when enough developers are active in the quarter". All of these are correct.

## 4. The four limits, against the rendered datasheet

Source: `research/rendered/github-innovationgraph-datasheet.txt`.

1. **"GitHub leaves out economies with too few active developers": SUPPORTED.**
   - l.25: "Metrics for economies are only reported when there are 100 or more unique developers performing the relevant activity within the time period."
   - l.120: "This means that economies with small numbers of GitHub developers will be missing."
   - The file agrees: its smallest value is 101.
2. **"Only public repositories count": SUPPORTED.**
   - l.126: "For metrics related to repositories, we only report on numbers and activity related to those that are public."
   - The spec also cites README l.27-29. The README is not in the rendered snapshot, so I did not check it.
3. **"A developer who pushes in both languages counts under each": SUPPORTED, BY INFERENCE.**
   - l.37: "the number of unique developers in each economy who made at least one git push to a repository with a given programming language during each quarter."
   - Each language's count is unique within that language, and nothing de-duplicates across languages. No sentence says this outright.
   - The rule is probably broader than the video says (finding F4). The file's own ranking puts HTML 1st, CSS 3rd, Dockerfile 7th above Java 8th, and Makefile and Batchfile in the programming top 10. That strongly suggests a push counts under every language detected in the repository, not only its main one. If so, pushing to a TypeScript repository that contains a few `.js` files also counts as a JavaScript push. The datasheet's phrase "a repository with a given programming language" does not settle the question.
4. **"Location comes from IP addresses": SUPPORTED.**
   - l.27: "Metrics of activity are assigned to a location based on the relevant user as determined by their IP address when interacting with GitHub."
   - l.129: "GitHub activity is assigned to an economy based on the IP address of the given developer or organization."

"Dedicated to the public domain" is also supported: datasheet l.143 reads "The dataset is made available under a CC0-1.0 license", and the licence snapshot is CC0 1.0 Universal.

## 5. The Octoverse framing risk: CONFIRMED

**Source:** <https://github.blog/news-insights/octoverse/octoverse-a-new-developer-joins-github-every-second-as-ai-leads-typescript-to-1/>, titled "Octoverse: A new developer joins GitHub every second as AI leads TypeScript to #1".

**What it says**, according to the text of two WebSearch results. I did not render the page, because github.blog is blocked from this container.

- "In August 2025, TypeScript overtook both Python and JavaScript to become the most used language on GitHub."
- "By GitHub contributor counts, August 2025 marks the first time TypeScript emerged as the most used language on GitHub, surpassing Python by ~42k contributors."
- 2,636,006 monthly TypeScript contributors, about +1.05M (+66.63%) year on year. JavaScript grew +24.79% (about +427k).
- Press coverage says the same: InfoWorld, "TypeScript rises to the top on GitHub"; Visual Studio Magazine, "TypeScript Tops GitHub Octoverse"; Forbes.

**How it counts**, per the search text:

- monthly unique contributors per language, where one user can appear under several categories in the same month;
- calendar-month rankings, with August 2025 for the languages;
- an Octoverse year of September 2024 to August 2025;
- public activity unless noted.

Whether Octoverse assigns contributors by a repository's primary language was **not** confirmed. The author recalled it, and my two searches did not settle it.

**How this file counts:** unique developers per quarter and per economy who pushed to "a repository with a given programming language", public only, for the 92 economies reported in every quarter.

**Judgement.** A viewer who knows the headline "TypeScript is #1 on GitHub, ahead of JavaScript" hears these three things in the first 40 seconds:

- the question "Is TypeScript catching up with JavaScript on GitHub?";
- TypeScript at 49% of JavaScript;
- "JavaScript's lead grew … to 2.5 million".

That viewer would reasonably conclude the video is wrong or out of date. The two sources measure different things, so both can be true. But the video never says so, and the difference in level is large: JavaScript has roughly twice TypeScript's pushers here, while TypeScript leads in Octoverse. So the video misleads by omission. **Verdict: FAIL until it addresses the difference.**

## Required changes

**R1 (blocking): add to the narration**, in scene `s2-answer`, immediately after "…JavaScript's lead grew, from {fig:gap_first_millions} to {fig:gap_last_millions} pushers, because both languages grew.":

> GitHub's Octoverse 2025 report named TypeScript the most used language on GitHub in August 2025, counting contributors. That is a different count from the quarterly pushers in this video.

- It uses no figure from the data. Its only numbers ("2025", "August 2025") belong to the attributed Octoverse statement. Carry them in the spec as an external statement with its URL and a rendered snapshot, not as a `{fig:}` figure.
- Before adding it, have a runner render the Octoverse URL above and confirm two things: that the page says TypeScript became the most used language on GitHub in August 2025, and that it measured this by contributors. If the wording differs, change only the attributed clause to match the page.
- It adds about 25 words, roughly 11 seconds, to a 107.8-second video whose spec caps it at 120 seconds. Measure after the re-render.
- The script hash changes, so G4 must be re-audited on the new script. This verdict does not carry over.
- Optional, and only with a source: "one likely reason is that a push to a repository counts under every language in it" (F4). Do not narrate this unless a GitHub page states it.

**R2 (blocking, traceability, not correctness):** register the 32 chart-label numbers listed in section 3 as figures, or as a `chartFigures` block with value, rounding and code. Make `charts.py` read them from `figures.json`, using half-up rounding. The next G4 can then recompute them, and a re-render cannot change them unaudited.

**R3 (blocking, page accuracy):** either add "unrounded value" and "rounding" columns to the page's figures table (for example, `ratio_gain_max_earlier_pts`: 4.54, half-up → 5), or change the sentence in `page.py` l.87 to: "Each number in the text is a named figure, computed from the data; none is typed by hand."

**Outside G4:** the page's title, header and footer still carry the literal `{{BRAND}}` placeholder. This is intentional per `page.py`, but it must be filled before the page is published.

## Verdict and reasons

**FAIL.**

- Figures: 25 of 25 match.
- Claims: 9 of 9 hold.
- Viewer-facing numbers: every narration and page number traces, and 43 of 43 chart numbers are correct.
- Limits: all 4 are supported by the datasheet.

It fails for three reasons:

1. The video would reasonably be heard as contradicting GitHub's own Octoverse 2025 headline and does not explain the difference (R1).
2. 32 numbers on the charts are correct but not in `figures.json` (R2).
3. The page claims each figure's rounding is stated when it is not (R3).
