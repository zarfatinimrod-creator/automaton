# Faceless YouTube: datasets that pass G1 and G2 (27.9.2026)

**What this is.** This is the answer to RED-TEAM §2.6: *"before naming niches, run G1 against the codebook of each candidate
dataset ... and list only topics ... whose upstream licence ... permits commercial redistribution."* It checks each
candidate (dataset, indicator set) against gates G1 and G2 **as coded** in `src/revenue/publication-gate.ts`:

- `ALLOWED_DATA_LICENCES` = {`CC0-1.0`, `CC-BY-4.0`, `CC-BY-3.0`, `public-domain`}. The check is an exact string match.
- Every entry in `upstream` must carry an allowed licence.
- The `SENSITIVE_TOPIC` regex is run on the topic string.

**Evidence grades.** These are the ones the brief set.

- **CODE**: I read it in a file on GitHub. The quote is verbatim, with its path and line.
- **CODE-secondary**: a GitHub file that states the licence of *someone else's* data, for example OWID's snapshot metadata or a data packager's README. By the brief's definition this is still CODE. It is marked so the board can see it is not the licensor's own statement.
- **SNIPPET**: a WebSearch result summary. I used 4 WebSearch calls, the maximum allowed.
- **UNKNOWN**: fails G1.

**Access.** All files were fetched today from `raw.githubusercontent.com`, or from GitHub's LFS host
`media.githubusercontent.com` where a repo stores CSVs in Git LFS. That host is GitHub's own; I made one probe and it
returned 200. The GitHub MCP file tool is restricted to the owner's repos, but code search works across GitHub.
`api.github.com` via curl returned nothing, and I did not retry it.

---

## Summary table

"Snapshot source" is the GitHub file to store as the G1 snapshot. "Render" names a primary licence page for the
render-watch job; every such URL was seen written in a file or search result (full list in the last section).

| # | Candidate (dataset → indicators) | Topic | Upstream of those indicators → licence (grade) | G1 verdict | Snapshot source |
|---|---|---|---|---|---|
| C1 | GitHub Innovation Graph → `languages.csv` (`num_pushers`, `language`, `iso2_code`, `year`, `quarter`) | Technology adoption | GitHub (first-party) → CC0-1.0 (CODE) | **PASS** | `github/innovationgraph/main/LICENSE.md` + README l.63-65 |
| C2 | GitHub Innovation Graph → `licenses.csv` (`num_pushers`, `spdx_license`, `iso2_code`, `year`, `quarter`) | Open-source software culture | GitHub → CC0-1.0 (CODE) | **PASS** (same dataset as C1, different video) | same as C1 |
| C3 | OurAirports → `airports.csv` (`type`, `elevation_ft`, `iso_country`, `latitude_deg`) + `runways.csv` (`airport_ident`, `length_ft`, `surface`, `closed`) | Transport | OurAirports → public domain via the Unlicense (CODE) | **PASS**. The mapping Unlicense → `public-domain` is a judgement; see blocker B2 | `davidmegginson/ourairports-data/main/LICENSE`; render `https://ourairports.com/data/` |
| C4 | owid/co2-data → `land_use_change_co2`, `cumulative_luc_co2`, `share_global_luc_co2`, `co2`, `cumulative_co2`, `co2_including_luc` | Environment (land use) | Global Carbon Project → CC BY 4.0 (CODE-secondary: OWID etl metadata); OWID's own layer → CC BY 4.0 (CODE) | **PASS** for these columns only | `owid/co2-data/master/README.md` l.127-131 + `owid/etl/.../gcp/2025-11-13/*.dvc`; render ICOS licence page |
| C5 | owid/co2-data → `cement_co2`, `cumulative_cement_co2`, `share_global_cement_co2`, `co2` | Industry / building materials | Global Carbon Project → CC BY 4.0 (CODE-secondary) | **PASS** (same dataset as C4, different video) | same as C4; render the Zenodo DOI |
| C6 | MoMA collection → `Artworks.csv` (`Date`, `DateAcquired`, `Classification`, `Department`, `Height (cm)`, `Width (cm)`, `Medium`) | Art and culture | MoMA → CC0 (CODE) | **PASS** | `MuseumofModernArt/collection/main/README.md` l.12 |
| C7 | Wittgenstein Centre (WCDE v3) → `bmys` (mean years of schooling by broad age), `bprop` (attainment distribution by broad age), years ≤ 2020 only | Education | Wittgenstein Centre → CC BY 4.0 (CODE-secondary: OWID etl metadata only; no producer-side statement found) | **PASS**, with the weakest licence evidence of the passing set. Render before the first publish | `owid/etl/.../demography/2026-02-11/wittgenstein_human_capital.zip.dvc`; render `https://dataexplorer.wittgensteincentre.org/wcde-v3/` |
| C8 | US SSA baby names → `year`, `sex`, `name`, `n`, `prop` | Demographics / naming culture | US Social Security Administration → public domain (CODE-secondary + SNIPPET from ssa.gov); packagers hadley/babynames and TidyTuesday → CC0 (CODE) | **PASS** | `OpenGenderTracking/globalnamedata/master/LICENSE.md` l.11 + `hadley/babynames` DESCRIPTION; render `http://www.ssa.gov/policy/accessibility.html` |
| C9 | NOAA Mauna Loa monthly CO2 (datahub `co2-ppm`) → monthly average, de-seasonalised, days, for **May 1974 onward** | Science (atmosphere) | NOAA GML → public domain (CODE-secondary: datahub quotes NOAA's disclaimer). Before May 1974: Scripps → CC BY 4.0 (SNIPPET only) | **PASS from 1974-05**; **full series from 1958 only after the Scripps page is rendered** | `datasets/co2-ppm/main/README.md` l.45-47; render NOAA disclaimer and Scripps pages |
| C10 | USDA NASS honey bee colonies (TidyTuesday 2022-01-11) → `colony.csv` (`colony_n`, `colony_lost_pct`, `colony_added`, `state`, `months`) | Agriculture / food | USDA NASS → public domain (SNIPPET only; the GitHub files stating it are third-party lists) | **CONDITIONAL**: passes only once a NASS/USDA policy page is rendered and stored | none authoritative on GitHub; render `https://www.nass.usda.gov/Data_and_Statistics/Citation_Request/index.php` |
| C11 | datahub `global-temp` → **only rows with `Source == GISTEMP`** (`Year`, `Mean`) | Science (climate record) | NASA GISS → public domain (CODE-secondary) | **PASS for GISTEMP rows**; the `GCAG` rows fail (see rejected R9). Reserve only: climate framing risk | `datasets/global-temp/main/README.md` l.77 |
| C12 | Tate collection → `artwork_data.csv` (`year`, `acquisitionYear`, `width`, `height`, `units`, `medium`, `artist`) | Art and culture | Tate → CC0 (CODE) | **PASS**. Reserve: an alternative to C6, frozen at 2013 | `tategallery/collection/master/LICENCE` + README l.11 |

**Count.** Nine candidates pass on CODE-grade evidence (C1-C9). C9 passes from May 1974. C11 and C12 are further
passes held in reserve. C10 is conditional on a render. Across C1-C10 there are **nine distinct topics**: technology,
open-source culture, transport, land use, building materials, art, education, naming/demographics, atmosphere and
agriculture.

**Six materially different videos, suggested.**

1. C1 — technology.
2. C3 — transport.
3. C6 — art.
4. C7 — education.
5. C8 — names.
6. C4 — land use.

C9, C10, C2 and C5 are substitutes. Energy is absent by construction (RED-TEAM §2.6), and so are health and finance.

---

## Blockers and gate findings (read before building the renderer)

**B1. `CC BY 3.0 IGO` is not in `ALLOWED_DATA_LICENCES`, and this closes two whole topics.**

- UN World Population Prospects is recorded as `CC BY 3.0 IGO`:
  `owid/etl/master/snapshots/un/2024-07-12/un_wpp_population_low.csv.dvc` l.23-25:
  > `license:` / `name: CC BY 3.0 IGO` / `url: https://population.un.org/wpp/downloads/`
- So is UNESCO UIS education:
  `owid/etl/master/snapshots/unesco/2026-05-12/education_sdgs.zip.dvc` l.15-17:
  > `name: CC BY 3.0 IGO` / `url: https://databrowser.uis.unesco.org/terms-and-conditions`

The gate compares exact strings, so both fail as coded. That rules out UN-based demographics and urbanisation, and
UIS-based education. CC BY 3.0 IGO is attribution-only, but adding it to the set is a board decision, not mine. C7
and C8 are how this file covers education and demographics without it.

**B2. Licence-string mapping.** OurAirports is released under the Unlicense, and datahub packages are released under
ODC-PDDL. Neither is literally in the set. C3 maps the Unlicense to `public-domain` because its text says "released
into the public domain". That is a judgement. The alternative is to add `Unlicense` to the set, and the board should
pick one. MIT is not in the set either, which is why R6 and R7 fail.

**B3. Per-capita columns in owid/co2-data fail.** Every `*_per_capita` column's codebook source ends in "Population
based on various sources (2024)". OWID's population step loads all three of these:

> `ds_un = paths.load_dataset("un_wpp")` ... `ds_hyde = paths.load_dataset("all_indicators")` ... `ds_gapminder = paths.load_dataset("population", namespace="gapminder")`

That is `owid/etl/master/etl/steps/data/garden/demography/2024-07-15/population.py` l.55-62. HYDE is recorded as
`CC BY-NC 4.0` (`snapshots/hyde/2026-06-08/all_indicators.zip.dvc` l.29-31). I read the 2026-06-08 HYDE snapshot's
licence. The step loads HYDE `all_indicators` without a version I could pin.

**So C4 and C5 must use absolute and share columns only, never per-capita ones.** `*_per_gdp` (Maddison) and
`*_per_unit_energy` / `energy_*` / `primary_energy_consumption` (Energy Institute, EIA) are UNKNOWN here and fail too.

**B4. Evidence authority.** Several passes rest on a file that states *another party's* licence: OWID's etl metadata
for GCP and Wittgenstein, datahub for NOAA and GISS, and third-party repos for SSA. The gate's `upstream` field stores
a licence string, not a grade. Recommendation: before each candidate's first publish, the render-watch captures the
primary licence page listed below, and the GitHub file is stored beside it.

**B5. G2's regex matches word prefixes, so the topic string must be chosen deliberately.** I tested the regex from
`publication-gate.ts` locally:

| Topic string | Result |
|---|---|
| "global warming" | FAIL on `war` |
| "colony loss from disease" | FAIL on `disease` |
| "taxonomy of museum objects" | FAIL on `tax` |
| "lawn grass" | FAIL on `law` |
| "bird migration" | FAIL on `migra` |
| "R&D investment" | FAIL on `invest` |

All the topic strings proposed below pass. The regex screens only the topic and advice phrasing. RED-TEAM §2.11's
politically-framed-conclusion screen is not in code yet, and C4, C5, C9 and C11 are the candidates it matters for.

**B6. Data defects found while checking. G4 must know about these.**

- `datasets/co2-ppm/data/co2-mm-mlo.csv` has **6 header names but 7 values per row**:
  - header: `Date,Decimal Date,Average,Interpolated,Trend,Number of Days`
  - row: `2026-07,2026.5417,429.12,428.83,21,0.59,0.25`
  - The values follow NOAA's layout: average, de-seasonalised, #days, st.dev, uncertainty. The labels are shifted. Read the file positionally.
- Innovation Graph's `iso2_code` includes an `EU` aggregate beside member states. Drop it before ranking economies.
- Wittgenstein `bmys` runs 1950-2100. Values after 2020 are projections, so use ≤ 2020 only, or label projections as such.
- MoMA's CSV and the SSA files after 2017 sit in Git LFS. `raw.githubusercontent.com` returns an LFS pointer, and the fetch must use `media.githubusercontent.com`.

---

## Per-candidate detail

### C1. GitHub Innovation Graph: programming languages by economy (technology adoption)

**Indicators.** From `data/languages.csv`: `num_pushers, language, language_type, iso2_code, year, quarter`. It covers
2020 Q1 to 2026 Q1, with 184 economies and 404 languages (MEASURED today).

**Upstream and licence.** The data is GitHub's own, aggregated from public activity. There is no third-party
input. Evidence is CODE:

- `github/innovationgraph/main/README.md` l.63-65:
  > "## License" / "This project is released under [CC0-1.0](https://creativecommons.org/publicdomain/zero/1.0/)."
- `docs/datasheet.md` l.142-143:
  > "Describe any applicable intellectual property (IP) licenses ... The dataset is made available under a CC0-1.0 license."
- `LICENSE.md` l.1:
  > "# Creative Commons CC0 1.0 Universal"

**Raw URL.** `https://raw.githubusercontent.com/github/innovationgraph/main/data/languages.csv` (200, 5.8 MB)

**Snapshot.** Store the GitHub file `github/innovationgraph/main/LICENSE.md`.

**Suggested G2 topic string.** "programming languages on GitHub by economy" (passes the regex).

**Example question.** Among economies with at least 500 Rust pushers in 2020 Q1, which grew fastest by 2026 Q1? Did
their C/C++ share of pushers fall at the same time? Feasibility (MEASURED; not a publishable figure, since G4
recomputes): India ×20.9, Brazil ×10.7, Japan ×8.1.

**Framing notes.** Avoid country-politics readings. That includes trade-control restrictions on some economies and
the supplementary per-capita file, whose population source I did not check.

### C2. GitHub Innovation Graph: open-source licence choice by economy

**Indicators.** From `data/licenses.csv`: `num_pushers, spdx_license, iso2_code, year, quarter`. It covers 2020-2026,
with 30 SPDX ids. Note from datasheet l.38: `NOASSERTION` means a licence file that could not be identified.

**Licence and snapshot.** Same as C1 (CC0-1.0, CODE).

**Raw URL.** `https://raw.githubusercontent.com/github/innovationgraph/main/data/licenses.csv` (200)

**Example question.** In which economies is the copyleft (GPL-family) share of pushers shrinking fastest relative to
MIT/Apache-2.0, and is any economy moving the other way?

### C3. OurAirports: runway length against airport elevation (transport)

**Indicators.**

- From `airports.csv`: `ident, type, elevation_ft, iso_country, latitude_deg, longitude_deg, scheduled_service`.
- From `runways.csv`: `airport_ident, length_ft, width_ft, surface, closed`.
- Do not use `wikipedia_link` or `keywords`.

**Upstream and licence.** OurAirports is a crowd-maintained compilation, and it is the producer.

- CODE (licensor's own repo), `davidmegginson/ourairports-data/main/LICENSE` l.1-6:
  > "This is free and unencumbered software released into the public domain. / Anyone is free to copy, modify, publish, use, compile, sell, or distribute this software ... for any purpose, commercial or non-commercial, and by any means."

  The text is the Unlicense, worded for "software", but it sits in the data-only repo.
- CODE-secondary, `datasets/airport-codes/main/README.md` l.9:
  > "Downloaded from public domain source https://ourairports.com/data/ who compiled this data from multiple different sources."

  The same README (l.46) hedges: *"would imagine this was public domain"*.
- The primary statement on `ourairports.com/data/` was not read: the host was not tried, and WebSearch was spent elsewhere.

**Raw URLs.**

- `https://raw.githubusercontent.com/davidmegginson/ourairports-data/main/airports.csv` (200, 12.7 MB)
- `https://raw.githubusercontent.com/davidmegginson/ourairports-data/main/runways.csv` (200, 4.0 MB)
- Both are updated daily (README l.4).

**Snapshot.** Store `LICENSE` from the repo. Render `https://ourairports.com/data/` (cited at README l.5).

**Suggested G2 topic string.** "airport runways and altitude". Avoid military airfields.

**Example question.** How much longer is the longest open runway at high-altitude large airports than at near-sea-level
ones, per 1,000 ft of elevation? Feasibility (MEASURED; median of the longest open runway at `large_airport`):

| Elevation band | Airports | Median runway |
|---|---|---|
| ≤ 1,000 ft | 882 | 9,844 ft |
| > 5,000 ft | 50 | 12,275 ft |

### C4. owid/co2-data: land-use-change CO2 (environment, non-energy)

**Indicators.** `land_use_change_co2, cumulative_luc_co2, share_global_luc_co2, co2, cumulative_co2, co2_including_luc`
(plus `country, year, iso_code`). It covers 1750-2024 (MEASURED).

**Column → source.** CODE, `owid/co2-data/master/owid-co2-codebook.csv`. Each chosen column's `source` field is
exactly:

> `Global Carbon Budget (2025) [https://globalcarbonbudget.org/]`

For example, rows 9 `co2`, 12 `co2_including_luc`, 32 `cumulative_luc_co2`, 43 `land_use_change_co2`, 69
`share_global_luc_co2`. Contrast row 18, `co2_per_capita`:

> `Global Carbon Budget (2025) [...]; Population based on various sources (2024) [...]`

That column fails (B3).

**Upstream licence.** CODE-secondary.

- `owid/etl/master/snapshots/gcp/2025-11-13/global_carbon_budget_land_use_change_emissions.xlsx.dvc` l.23-25:
  > `license:` / `name: CC BY 4.0` / `url: https://www.icos-cp.eu/data-services/about-data-portal/data-license`
- The national-emissions `.dvc` has the same lines, 23-25.

**OWID layer.** CODE, `owid/co2-data/master/README.md` l.129-131:

> "All visualizations, data, and code produced by _Our World in Data_ are completely open access under the [Creative Commons BY license](https://creativecommons.org/licenses/by/4.0/)." ... "The data produced by third parties ... is subject to the license terms from the original third-party authors."

**Raw URL.** `https://raw.githubusercontent.com/owid/co2-data/master/owid-co2-data.csv` (200)

**Snapshot.** Store the README (l.127-131) and the two `.dvc` files. Render the ICOS licence URL.

**Suggested G2 topic string.** "land-use change carbon dioxide emissions".

**Example question.** In how many countries do cumulative land-use-change emissions still exceed cumulative fossil
emissions, and in which year did fossil overtake land use in each of the others? Feasibility (MEASURED; sums over all
available years, OWID aggregates excluded): 89 of 194 countries.

**Framing note.** Deforestation is politics-adjacent. The script must be descriptive, with no attribution of blame
(RED-TEAM §2.11).

### C5. owid/co2-data: cement CO2 (building materials)

**Indicators.** `cement_co2, cumulative_cement_co2, share_global_cement_co2, co2`. The codebook's source for each is
`Global Carbon Budget (2025)` (row 7 for `cement_co2`).

**Upstream licence.** CODE-secondary, `owid/etl/master/snapshots/gcp/2025-11-13/global_carbon_budget_fossil_co2_emissions.csv.dvc`
l.24-26:

> `license:` / `name: CC BY 4.0` / `url: https://doi.org/10.5281/zenodo.5569234`

I infer that the fossil-emissions file feeds `cement_co2`. All four GCP snapshot files carry CC BY 4.0 either way.

**Raw URL and snapshot.** Same as C4. Also render the Zenodo DOI.

**Suggested G2 topic string.** "cement carbon dioxide emissions".

**Example question.** In which countries does cement account for the largest share of fossil CO2, and in what year did
cement's share of the world total peak?

### C6. MoMA collection: acquisition timing and object size (art)

**Indicators.** From `Artworks.csv`: `Date, DateAcquired, Classification, Department, Medium, Height (cm), Width (cm)`.
It has 160,700 records (README l.7). Content-Length is 73,218,527 bytes, last modified 2026-09-27 (MEASURED).

**Licence.** MoMA is the producer. Evidence is CODE, `MuseumofModernArt/collection/main/README.md` l.12:

> "This datasets are placed in the public domain using a [CC0 License](https://creativecommons.org/publicdomain/zero/1.0/)."

Also l.18:

> "Images are not included and are not part of the dataset."

So charts only, and never artwork images.

**Raw URL.** The file is in Git LFS: `https://media.githubusercontent.com/media/MuseumofModernArt/collection/main/Artworks.csv`
(206 on a range request, verified). The `raw.githubusercontent.com` path returns the LFS pointer.

**Snapshot.** Store the repo README.md.

**Suggested G2 topic string.** "museum of modern art acquisitions".

**Example question.** What is the median gap between when a work was made and when MoMA acquired it, by acquisition
decade? Has the museum become faster at collecting the art of its own time?

**Framing note.** Avoid artist gender and nationality comparisons, which can read as politics.

### C7. Wittgenstein Centre: schooling by age cohort (education)

**Indicators.** `bmys` (mean years of schooling by broad age: `15+, 25+, 20--39, 40--64, 60+, 65+, 80+, 20--64`, by
`sex`), and optionally `bprop` (attainment distribution by broad age). Columns are
`name, country_code, year, age, sex, bmys`, over 1950-2100 in 5-year steps (MEASURED). Use ≤ 2020. Avoid the
`ggap*` gender-gap indicators.

**Upstream licence.** CODE-secondary only, `owid/etl/master/snapshots/demography/2026-02-11/wittgenstein_human_capital.zip.dvc`:

- l.17: `producer: Wittgenstein Centre`
- l.22: `url_main: https://dataexplorer.wittgensteincentre.org/wcde-v3/`
- l.26-28: `license:` / `name: CC BY 4.0` / `url: https://creativecommons.org/licenses/by/4.0/deed.en`

The `wcde` package README and `wcde-shiny` state no data licence (code search: 0 hits). My WebSearch found no producer
statement. **The licence rests on OWID's record alone.** Second-order inputs (census and survey attainment data, UN
WPP base populations) are WIC's modelling inputs, not the indicator's source. I record them so the board sees them.

**Raw URLs.** Served by the maintainer's GitHub data server, which is the path the `wcde` package itself uses:
`guyabel/wcde/main/R/get_wcde.R` l.194, `server == "github" ~ "https://github.com/guyabel/wcde-data/raw/master/"`.

- `https://raw.githubusercontent.com/guyabel/wcde-data/master/wcde-v3-batch/2/bmys.rds` (200, 403 KB; gzip RDS, not LFS)
- `https://raw.githubusercontent.com/guyabel/wcde-data/master/wcde-v3-batch/2/bprop.rds` (200, 2.1 MB)
- The renderer needs an RDS reader. I used `rdata` to verify; I did not check its licence.

**Snapshot.** Store the `.dvc` file. Render `https://dataexplorer.wittgensteincentre.org/wcde-v3/`. If that page does
not show CC BY 4.0, C7 fails.

**Suggested G2 topic string.** "adult schooling by age cohort".

**Example question.** In which countries do 20-39-year-olds out-school the 60+ generation by the widest margin, and how
many years of schooling did that one generation gain? Feasibility (MEASURED, 2020, both sexes): Maldives 8.7 years,
Timor-Leste 7.8, Tunisia 7.7.

### C8. US SSA baby names (demographics / naming culture)

**Indicators.** `year, sex, name, n, prop`.

**Upstream licence.** The upstream is the Social Security Administration.

- CODE-secondary, `OpenGenderTracking/globalnamedata/master/LICENSE.md` l.11:
  > "Data from the Social Security Administration is released under the [public domain](http://www.ssa.gov/policy/accessibility.html)"
- CODE-secondary, `JohnCrafton/name-stuff/main/sources/ssa-baby-names/README.md` l.5:
  > "**License:** CC0 (Public Domain)"
- SNIPPET (WebSearch, ssa.gov):
  > "The information, statistics, and documents posted on the SSA website have been prepared by staff of the Social Security Administration in the course of their official work as federal employees, and therefore the work is in the public domain and is not protected by copyright."

  The result list included `https://www.ssa.gov/policy/accessibility.html`, the same page globalnamedata cites.

**Packaging chain.** CODE throughout:

- `hadley/babynames/master/README.md` l.6: "three datasets provided by the USA social security administration", sourced from `http://www.ssa.gov/oact/babynames/limits.html` (l.10).
- `hadley/babynames` DESCRIPTION l.13: `License: CC0`.
- `rfordatascience/tidytuesday/main/LICENSE` l.1-3: "CC0 1.0 Universal".
- `data/2022/2022-03-22/readme.md` l.33: "The data this week comes from [`babynames`](http://hadley.github.io/babynames/) R package from Hadley Wickham."

**Raw URLs.**

- Primary: `https://raw.githubusercontent.com/rfordatascience/tidytuesday/main/data/2022/2022-03-22/babynames.csv` (48.8 MB, plain CSV, 1880-2017).
- Extension to 2024, weaker provenance (an unexplained third-party mirror, Git LFS):
  - `https://media.githubusercontent.com/media/dcadata/name-finder/main/data/names/yob2024.txt`
  - Verified 200, with 31,904 names and 3,328,501 births counted; first row `Olivia,F,14718`.
  - It is the same layout for each `yobYYYY.txt`.
  - G4 should cross-check these against ssa.gov from a runner before use.

**Snapshot.** Store `globalnamedata/LICENSE.md` and the `babynames` DESCRIPTION. Render `http://www.ssa.gov/policy/accessibility.html`.

**Suggested G2 topic string.** "US baby names".

**Example question.** Do popular names now rise and fall faster than they did in the 1950s? Measure the median years
from a name's peak share to half that share, by peak decade.

**Framing note.** Stay off ethnicity and immigration readings. "immigra" is in the G2 regex.

### C9. NOAA Mauna Loa monthly CO2 (science, atmosphere)

**Indicators.** Monthly average CO2 (ppm), de-seasonalised value and days measured. Read the columns positionally (B6).
The data runs 1958-03 to 2026-07, 822 lines (MEASURED).

**Upstream licence. There are two upstreams inside one series.** From NOAA's own file header (a GitHub copy at
`BetaNumeric/climate_spiral/main/data/co2_mm_mlo.txt`):

- l.2-4: "USE OF NOAA GML DATA ... These data are made freely available to the public and the scientific community".
- l.25-29: "Data from March 1958 through April 1974 have been obtained by C. David Keeling of the Scripps Institution of Oceanography (SIO) ... Scripps data downloaded from http://scrippsco2.ucsd.edu/data/atmospheric_co2".

**NOAA segment (May 1974 onward).** CODE-secondary, `datasets/co2-ppm/main/README.md` l.45-47, quoting NOAA's disclaimer:

> "The information on government servers are in the public domain, unless specifically annotated otherwise, and may be used freely by the public so long as you do not 1) claim it is your own ... 2) use it in a manner that implies an endorsement or affiliation with NOAA, or 3) modify it in content and then present it as official government material."

The header's "freely available ... please include relevant citation" is a request, not an annotation restricting use
(INFERENCE).

**Scripps segment (1958-03 to 1974-04).** SNIPPET only:

> "Scripps CO2 program data and graphics on scrippsco2.ucsd.edu are licensed under a CC BY license, Creative Commons Attribution 4.0 International License".

**Raw URL.** `https://raw.githubusercontent.com/datasets/co2-ppm/main/data/co2-mm-mlo.csv` (200, current to 2026-07)

**Snapshot.** Store the co2-ppm README. Render `http://www.esrl.noaa.gov/gmd/about/disclaimer.html`, plus a Scripps
page (listed below) before any pre-1974 month appears on screen.

**Suggested G2 topic string.** "atmospheric carbon dioxide at Mauna Loa".

**Example question.** Has the within-year swing of CO2 at Mauna Loa (the planet's seasonal "breathing") grown since the
1970s? Feasibility (MEASURED; per-year max-min of average minus de-seasonalised): 6.23 ppm mean for 1975-79, against
6.66 ppm for 2020-24.

**Framing note.** Keep it to descriptive physics, with no policy conclusion.

### C10. USDA NASS honey bee colonies (agriculture). CONDITIONAL

**Indicators.** From `colony.csv`: `year, months, state, colony_n, colony_max, colony_lost, colony_lost_pct, colony_added, colony_reno, colony_reno_pct`.
It covers 2015-2021, 47 states, quarterly (MEASURED). `stressor.csv` has `stressor, stress_pct`; one label reads "Disesases".

**Upstream.** `rfordatascience/tidytuesday/main/data/2022/2022-01-11/readme.md` l.33 (CODE):

> "The data this week comes from the [USDA](https://usda.library.cornell.edu/concern/publications/rn301137d?locale=en)"

**Licence.** SNIPPET (WebSearch, usda.gov domains):

> "Public domain information on the National Agricultural Statistics Service (NASS) Web pages may be freely downloaded and reproduced. Most of the information available from this site is within the public domain."

The only GitHub files stating NASS public domain are third-party lists, so I did not use them as a snapshot:
`connu/awesome-datasets/.../agriculture-and-crops/README.md` l.42 and `manya28/data-512-project/main/README.md` l.91.
**"Most" is not "all"**, so the render must show that the bee-colony report is not excepted.

**Raw URL.** `https://raw.githubusercontent.com/rfordatascience/tidytuesday/main/data/2022/2022-01-11/colony.csv` (200)

**Snapshot.** None on GitHub. Render `https://www.nass.usda.gov/Data_and_Statistics/Citation_Request/index.php`
(a WebSearch result; which result page carries the sentence is not established).

**Suggested G2 topic string.** "honey bee colonies in the United States". Do not use "colony loss from disease", which fails on `disease`.

**Example question.** What share of all US colonies sits in California in January-March compared with July-September,
and did that seasonal concentration grow from 2015 to 2021?

### C11. NASA GISTEMP annual anomaly (reserve)

**Indicators.** From `data/annual.csv`, only rows where `Source == GISTEMP` (146 rows): `Year, Mean`.

**Licence.** CODE-secondary, `datasets/global-temp/main/README.md` l.77:

> "NASA GISTEMP data is a US Government work and is in the public domain."

No NASA licence page URL appears in any file I read.

**Raw URL.** `https://raw.githubusercontent.com/datasets/global-temp/main/data/annual.csv`

**Suggested G2 topic string.** "global surface temperature record".

**Example question.** How many years did each successive 0.1 °C step in the annual anomaly take, and is the step time
shrinking?

**Why reserve.** It is a fourth climate-adjacent candidate, with no primary licence page to render.

### C12. Tate collection (reserve, alternative to C6)

**Licence.** CODE:

- `tategallery/collection/master/README.md` l.11:
  > "The metadata here is released under the Creative Commons Public Domain [CC0](http://creativecommons.org/publicdomain/zero/1.0/) licence."
- `LICENCE` l.1-3: "CC0 1.0 Universal".

**Raw URL.** `https://raw.githubusercontent.com/tategallery/collection/master/artwork_data.csv` (200, plain CSV). It has
69,201 rows, and the latest `acquisitionYear` is 2013, so it is frozen.

**Example question.** How much of Tate's catalogue is one bequest, and what does the collection's age profile look like
without it? Feasibility (MEASURED): 57% of rows are credited to J. M. W. Turner.

The Met's Open Access CSV is also CC0 (`metmuseum/openaccess/master/README.md` l.8), but it is in Git LFS and I did
not measure it. It is a further art reserve.

---

## Rejected candidates

| # | Candidate | Reason | Evidence |
|---|---|---|---|
| R1 | OWID energy data; the co2-data columns `energy_per_capita`, `energy_per_gdp`, `primary_energy_consumption`, `co2_per_unit_energy`, `co2_including_luc_per_unit_energy` | Their source includes the Energy Institute Statistical Review, whose licence is UNKNOWN (not rendered; RED-TEAM §2.6), so **FAIL** | Codebook `source` field: "U.S. Energy Information Administration ...; Energy Institute - Statistical Review of ..." |
| R2 | Every `*_per_capita` column in owid/co2-data, and any OWID `population` series | The population input combines HYDE (**CC BY-NC 4.0**) with UN WPP (**CC BY 3.0 IGO**, not in the set), so **FAIL** | B3: `population.py` l.55-62; `hyde/2026-06-08/all_indicators.zip.dvc` l.29-31 |
| R3 | `*_per_gdp` columns (Maddison Project Database) | Licence not read, so **UNKNOWN → FAIL** | Codebook source "Bolt and van Zanden – Maddison Project Database 2023" |
| R4 | FAOSTAT-based agriculture: crop yields, livestock, land use, fertiliser. Includes the OWID crop-yield charts and TidyTuesday's OWID crop-yield copies | **CC BY-NC-SA 3.0 IGO**, both NonCommercial and ShareAlike, so **FAIL**. This is why agriculture falls to USDA (C10) | `owid/etl/master/snapshots/faostat/2026-02-25/faostat_qcl.zip.dvc` l.23-25: `name: CC BY-NC-SA 3.0 IGO` / `url: http://www.fao.org/contact-us/terms/db-terms-of-use/en` |
| R5 | HYDE long-run population, urbanisation, cropland and livestock (including "Historical counts of livestock mammals") | **CC BY-NC 4.0**, so **FAIL** | `hyde/2026-06-08/all_indicators.zip.dvc` l.29-31; `hyde/2005-08-29/historical_livestock_mammals.xls.dvc` l.26-27 |
| R6 | UN WPP demographics and urbanisation; World Bank population (`datasets/population`, built on WPP); UNESCO UIS education | **CC BY 3.0 IGO**, not in the gate's set as coded, so **FAIL until the board adds it** (B1) | `un_wpp_population_low.csv.dvc` l.23-25; `unesco/2026-05-12/education_sdgs.zip.dvc` l.15-17 |
| R7 | Barro-Lee educational attainment (`barrolee/BarroLeeDataSet`) | The repo is **MIT**, which is not in the set, so **FAIL** as coded. The README gives only a citation, no data licence | `LICENSE` l.1-3: "MIT License / Copyright (c) 2020 barrolee" |
| R8 | Open Exoplanet Catalogue | **MIT**, which is not in the set, so **FAIL**. It also imports from the NASA Exoplanet Archive, whose terms I did not read | README l.17: "The database is licensed under an MIT license"; l.6: "I will import data from the NASA Exoplanet Archive" |
| R9 | `datasets/global-temp` rows labelled `GCAG` | The README names HadCRUT5 under the **Open Government Licence v3** (not in the set). The data labels the rows `GCAG`, so the provenance is ambiguous: **FAIL** | README l.73: "The HadCRUT5 data is © British Crown Copyright, Met Office, provided under the Open Government Licence v3"; `annual.csv` shows 177 `GCAG` rows |
| R10 | `datasets/sea-level-rise` (CSIRO and EPA series) | CSIRO: "not altered" condition, not in the set, so **FAIL**. EPA: licence assumed, not stated, so **UNKNOWN** | README l.54: "copyright CSIRO, but please feel free to use them, conditional on the figures not being altered"; l.51: "EPA is Federal Government, so public domain we would assume." |
| R11 | `datasets/glacier-mass-balance` (EPA from WGMS) | WGMS terms are "for scientific and educational purposes", so commercial use is not granted: **FAIL** | README l.31: "Open access for scientific and educational purposes under requirement of correct citation" |
| R12 | `datasets/population-global-historical` | The source is the appendix of a copyrighted book (Cohen 1996). The packager's PDDL cannot license it, so **UNKNOWN → FAIL** | `datapackage.json` sources: "Appendix in Joel E. Cohen, *How Many People Can the Earth Support?*, Norton 1996" |
| R13 | `datasets/genome-sequencing-costs` (NHGRI) | No licence statement from NHGRI was read (**UNKNOWN**), and the topic is health-adjacent under G2 | `datapackage.json` has only the source URL on genome.gov |
| R14 | Jones et al. national contributions: `methane`, `nitrous_oxide`, `total_ghg`, `temperature_change_from_*` | The licence passes: **CC BY 4.0** (CODE-secondary, `emissions/2025-12-04/national_contributions_annual_emissions.csv.dvc` l.25-27). It is **rejected on G2**: it attributes warming to nations, which is politically framed (RED-TEAM §2.11), and its natural topic wording trips the regex on "war" | `.dvc` l.6: "A dataset describing the global warming response to national emissions" |
| R15 | Nobel Prize data | No GitHub-hosted copy with provenance was found. The CC0 claim appears only in awesome-lists, so it was not pursued (**UNKNOWN**) | Code search `"api.nobelprize.org" "CC0"`: 70 hits, all lists or personal projects |
| R16 | USDA FAS PSD (world crop balances) | Public domain per a third-party README, but **no GitHub-hosted data** (`artifacts/` is git-ignored). A runner could fetch it from USDA; that is unverified | `JacobFV/world-model/main/data/usda_fas_psd/README.md` l.42, l.54 |
| R17 | US births by day (CDC/SSA copies) | Not pursued: delivery scheduling is health-adjacent under G2. Licence not checked | — |

---

## URLs to render (verbatim, each with the file that cites it)

Primary licence pages the render-watch job should capture. Each URL is exactly as written in the cited source.

| URL | Cited in | For |
|---|---|---|
| `https://www.icos-cp.eu/data-services/about-data-portal/data-license` | `owid/etl` `snapshots/gcp/2025-11-13/global_carbon_budget_land_use_change_emissions.xlsx.dvc` l.25 (and `..._national_emissions.xlsx.dvc` l.25) | C4 |
| `https://doi.org/10.5281/zenodo.5569234` | `owid/etl` `snapshots/gcp/2025-11-13/global_carbon_budget_fossil_co2_emissions.csv.dvc` l.26 | C5 |
| `https://creativecommons.org/licenses/by/4.0/` | `owid/co2-data` `README.md` l.129 | C4, C5 (OWID layer) |
| `https://dataexplorer.wittgensteincentre.org/wcde-v3/` | `owid/etl` `snapshots/demography/2026-02-11/wittgenstein_human_capital.zip.dvc` l.22 (`url_main`) | C7 |
| `https://creativecommons.org/licenses/by/4.0/deed.en` | same `.dvc`, l.28 | C7 |
| `https://ourairports.com/data/` | `davidmegginson/ourairports-data` `README.md` l.5; `datasets/airport-codes` `README.md` l.9 | C3 |
| `https://creativecommons.org/publicdomain/zero/1.0/` | `github/innovationgraph` `README.md` l.65; `MuseumofModernArt/collection` `README.md` l.12 | C1, C2, C6 |
| `http://creativecommons.org/publicdomain/zero/1.0/` | `tategallery/collection` `README.md` l.11 | C12 |
| `http://www.ssa.gov/policy/accessibility.html` | `OpenGenderTracking/globalnamedata` `LICENSE.md` l.11 (the https form appeared in WebSearch results) | C8 |
| `http://www.ssa.gov/oact/babynames/limits.html` | `hadley/babynames` `README.md` l.10 | C8 (data page) |
| `https://www.ssa.gov/oact/babynames/` | `JohnCrafton/name-stuff` `sources/ssa-baby-names/README.md` l.3 | C8 (data page) |
| `http://www.esrl.noaa.gov/gmd/about/disclaimer.html` | `datasets/co2-ppm` `README.md` l.50 | C9 (NOAA segment) |
| `https://scrippsco2.ucsd.edu/` and `https://keelingcurve.ucsd.edu/permissions-and-data-sources/` | WebSearch results (SNIPPET); which one carries the CC BY sentence is not established | C9 (Scripps segment, 1958-1974) |
| `http://scrippsco2.ucsd.edu/data/atmospheric_co2` | NOAA header, `BetaNumeric/climate_spiral` `data/co2_mm_mlo.txt` l.29 | C9 (data page, not a licence page) |
| `https://www.nass.usda.gov/Data_and_Statistics/Citation_Request/index.php` and `https://www.usda.gov/about-usda/policies-and-links` | WebSearch results (SNIPPET) | C10 |
| `https://usda.library.cornell.edu/concern/publications/rn301137d?locale=en` | `rfordatascience/tidytuesday` `data/2022/2022-01-11/readme.md` l.33 | C10 (source report, not a licence page) |

Raw data URLs are given per candidate above. All returned 200 today, except that the LFS files are served only via `media.githubusercontent.com`.

---

## What was not checked

- `ourairports.com/data/` was not read, so C3 rests on the repo's Unlicense.
- The ICOS and Zenodo licence pages were not read, so GCP rests on OWID's record.
- No producer-side Wittgenstein statement was found.
- The HYDE version inside OWID's 2024-07-15 population step was not pinned.
- The Maddison, EI and NASA Exoplanet Archive licences were not read.
- The licences of the RDS reader (`rdata`) and of the TidyTuesday copies' second-order transformations were not checked.
- No RPM or audience evidence for any of these topics. That is outside this file.
