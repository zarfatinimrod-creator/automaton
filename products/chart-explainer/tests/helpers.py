"""A small, fully known dataset shared by the tests (two panel economies, nine quarters, an EU aggregate)."""

import json
from pathlib import Path

PRODUCT = Path(__file__).resolve().parent.parent
REPO_ROOT = PRODUCT.parent.parent
SPEC = json.loads((PRODUCT / "analyses" / "t1.json").read_text())
PARAMS = {"languageA": "TypeScript", "languageB": "JavaScript", "topN": 2, "thresholdPct": 50,
          "excludeEconomies": ["EU"]}
NINE_QUARTERS = [(2020 + i // 4, i % 4 + 1) for i in range(9)]  # two whole year steps


def write_csv(path: Path, rows: list[tuple[int, str, str, int, int]]) -> Path:
    lines = ["num_pushers,language,language_type,iso2_code,year,quarter"]
    lines += [f"{n},{lang},programming,{econ},{y},{q}" for n, lang, econ, y, q in rows]
    path.write_text("\n".join(lines) + "\n")
    return path


def small_dataset(tmp_path: Path) -> Path:
    """AA and BB in every quarter; CC missing one quarter (so outside the panel); an EU aggregate to exclude."""
    rows = []
    for i, (y, q) in enumerate(NINE_QUARTERS):
        rows += [(100 + 10 * i, "TypeScript", "AA", y, q), (400, "JavaScript", "AA", y, q)]
        rows += [(200 + 50 * i, "TypeScript", "BB", y, q), (400 + 20 * i, "JavaScript", "BB", y, q)]
        rows += [(9999, "TypeScript", "EU", y, q), (9999, "JavaScript", "EU", y, q)]
        rows += [(150, "Python", "AA", y, q), (150, "Python", "BB", y, q)]
        if i != 2:
            rows += [(500, "TypeScript", "CC", y, q), (500, "JavaScript", "CC", y, q)]
    return write_csv(path=tmp_path / "languages.csv", rows=rows)


def small_spec() -> dict:
    spec = json.loads(json.dumps(SPEC))
    spec["params"] = dict(PARAMS)
    return spec
