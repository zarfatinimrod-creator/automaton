"""The web page is self-contained and carries the brand; the product holds no upload or publishing code at all."""

import json
import re
from pathlib import Path

import figures
import helpers
import page

PRODUCT = Path(__file__).resolve().parent.parent
SPEC = helpers.SPEC


def _page(tmp_path) -> str:
    from PIL import Image

    an = figures.Analysis(figures.load_languages(helpers.small_dataset(tmp_path), ["EU"]), helpers.PARAMS)
    figs = figures.compute_figures(an)
    fj = json.loads(json.dumps(figures.figures_json(figs, [], SPEC, an, figures.compute_chart_figures(an))))
    charts = {}
    for s in SPEC["scenes"]:
        charts[s["id"]] = tmp_path / f"{s['id']}.png"
        Image.new("RGB", (16, 9), "white").save(charts[s["id"]])
    return page.build_page(SPEC, figures.fill_spec(SPEC, figs), fj, charts)


def test_page_has_no_scripts_trackers_or_external_resources(tmp_path):
    html = _page(tmp_path)
    for tag in ("<script", "<iframe", "<link", "<object", "<embed", "@import", "url("):
        assert tag not in html.lower(), tag
    srcs = re.findall(r'src="([^"]*)"', html)
    assert len(srcs) == len(SPEC["scenes"]) and all(s.startswith("data:image/png;base64,") for s in srcs)
    # Links go only to the dataset and to the sources the text quotes; nothing is loaded from them.
    allowed = {SPEC["dataset"]["homepage"]} | {s["url"] for s in SPEC["externalSources"].values()}
    allowed |= {c["url"] for c in SPEC["citations"] if c.get("url")}
    assert set(re.findall(r'href="([^"]*)"', html)) == allowed


def test_page_carries_the_brand_the_attribution_and_the_sources(tmp_path):
    html = _page(tmp_path)
    brand = SPEC["page"]["brand"]
    assert "{{BRAND}}" not in html
    assert html.count(brand) >= 2  # header and footer (and the title)
    assert f"<title>{SPEC['title']} — {brand}</title>" in html
    assert SPEC["dataset"]["name"] in html and SPEC["dataset"]["licence"] in html and SPEC["dataset"]["commit"] in html
    assert "synthetic voice" in html
    assert SPEC["externalSources"]["octoverse_2025"]["quote"] in html
    for s in SPEC["scenes"]:
        assert f'id="{s["id"]}"' in html


def test_page_states_each_figures_unrounded_value_and_rounding(tmp_path):
    html = _page(tmp_path)
    assert "<th>Unrounded value</th><th>Rounding</th>" in html
    assert "with its unrounded value and its" in html
    row = re.search(r"<tr><td><code>ratio_first_pct</code></td><td>38%</td><td>37.5000</td><td>half-up to 0 decimals</td>",
                    html)
    assert row, "the ratio row shows its shown value, raw value and rounding"
    assert "Every number drawn on the charts" in html


UPLOAD = re.compile(
    r"googleapis|youtube\.com/upload|upload-post|upload_post|privacyStatus|privacy_status|youtube_publish_at|"
    r"method\s*=\s*[\"']POST|\.post\(|requests\.|http\.client",
    re.I,
)


def test_no_upload_or_publishing_code_in_the_product():
    code = [p for p in PRODUCT.rglob("*.py") if ".cache" not in p.parts and "tests" not in p.parts]
    assert {p.name for p in code} >= {"fetch.py", "figures.py", "charts.py", "tts.py", "assemble.py", "page.py",
                                      "manifest.py", "render.py"}
    for p in code:
        assert not UPLOAD.search(p.read_text()), p


def test_calendar_years_are_printed_without_a_thousands_separator():
    # The G4 re-audit of revision 1 caught "2,020" in the page's unrounded column.
    import page

    assert page.unrounded(2020, "calendar year") == "2020"
    assert page.unrounded(1147998, "pushers") == "1,147,998"
    assert page.unrounded(6, "years") == "6"
