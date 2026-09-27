"""The web page is self-contained and brand-free; the product holds no upload or publishing code at all."""

import json
import re
from pathlib import Path

import figures
import page

PRODUCT = Path(__file__).resolve().parent.parent
SPEC = json.loads((PRODUCT / "analyses" / "t1.json").read_text())


def _page(tmp_path) -> str:
    from PIL import Image

    charts = {}
    for s in SPEC["scenes"]:
        charts[s["id"]] = tmp_path / f"{s['id']}.png"
        Image.new("RGB", (16, 9), "white").save(charts[s["id"]])
    figs = {n: figures.Figure(n, "text", 0, "", "x", None, "7", f"how {n} is computed", "") for n in figures.FIGURES}
    return page.build_page(SPEC, figures.fill_spec(SPEC, figs), figs, charts)


def test_page_has_no_scripts_trackers_or_external_resources(tmp_path):
    html = _page(tmp_path)
    for tag in ("<script", "<iframe", "<link", "<object", "<embed", "@import", "url("):
        assert tag not in html.lower(), tag
    srcs = re.findall(r'src="([^"]*)"', html)
    assert len(srcs) == len(SPEC["scenes"]) and all(s.startswith("data:image/png;base64,") for s in srcs)
    # The only links are to the dataset and its licence statement's sources, never a resource the page loads.
    assert set(re.findall(r'href="([^"]*)"', html)) == {SPEC["dataset"]["homepage"]}


def test_page_uses_the_brand_placeholder_and_carries_the_attribution(tmp_path):
    html = _page(tmp_path)
    assert html.count("{{BRAND}}") >= 2
    assert SPEC["dataset"]["name"] in html and SPEC["dataset"]["licence"] in html and SPEC["dataset"]["commit"] in html
    assert "synthetic voice" in html
    for s in SPEC["scenes"]:
        assert f'id="{s["id"]}"' in html


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
