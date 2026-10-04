"""The four Netlify files deployed beside the web arm's index.html (research/faceless-youtube/PREREG-DECISIONS.md §3.6).

`/preview/` serves the same page under a different `$current_url`, so our own loads never count (§3.4(a)); it is kept
out of search; the sitemap lists the canonical URL only (§3.5 route 1). The host is an argument: the sub-brand
name, chartsplained, was chosen 29.9, pending the owner's veto (research/faceless-youtube/PREREG-DECISIONS.md:547; probes
in research/measurements/t1-subbrand-check.md), so no host is guessed or committed here.
"""

import re
import xml.etree.ElementTree as ET
from pathlib import Path

import pytest

import netlify_files

ORIGIN = "https://example-sub-brand.netlify.app"  # made up; the real host is chosen by the loop
PRODUCT = Path(__file__).resolve().parent.parent
REPO_ROOT = PRODUCT.parent.parent
SITEMAP_NS = "http://www.sitemaps.org/schemas/sitemap/0.9"


def _lines(text: str) -> list[str]:
    return [line for line in text.splitlines() if line.strip() and not line.lstrip().startswith("#")]


def test_it_writes_exactly_the_four_files():
    assert set(netlify_files.netlify_files(ORIGIN)) == {"_redirects", "_headers", "robots.txt", "sitemap.xml"}


def test_preview_is_the_same_page_by_a_rewrite_not_a_redirect():
    # Netlify: "/pass-through /index.html 200" rewrites; no "!" so no file is shadowed (docs.netlify.com, via Context7).
    assert _lines(netlify_files.netlify_files(ORIGIN)["_redirects"]) == ["/preview/  /index.html  200"]


def test_preview_carries_noindex():
    assert netlify_files.netlify_files(ORIGIN)["_headers"] == "/preview/*\n  X-Robots-Tag: noindex\n"


def test_robots_disallows_preview_and_names_the_sitemap():
    assert _lines(netlify_files.netlify_files(ORIGIN)["robots.txt"]) == [
        "User-agent: *",
        "Disallow: /preview/",
        f"Sitemap: {ORIGIN}/sitemap.xml",
    ]


def test_the_sitemap_lists_the_canonical_url_only():
    root = ET.fromstring(netlify_files.netlify_files(ORIGIN)["sitemap.xml"].encode("utf-8"))
    assert root.tag == f"{{{SITEMAP_NS}}}urlset"
    locs = [e.text for e in root.iter(f"{{{SITEMAP_NS}}}loc")]
    # The canonical URL is what the counter sends as $current_url on the page itself: origin + pathname "/" (§3.1).
    assert locs == [ORIGIN + "/"]
    assert "preview" not in netlify_files.netlify_files(ORIGIN)["sitemap.xml"]


def test_the_files_carry_nothing_but_the_host():
    # They are public: no repository path, no internal document name, no comment.
    for name, text in netlify_files.netlify_files(ORIGIN).items():
        assert "#" not in text, name
        assert not re.search(r"PREREG|RULING|BOARD|research/|github", text, re.I), name


@pytest.mark.parametrize("origin", [
    None, "", "example.netlify.app", "http://example.netlify.app", "https://example.netlify.app/",
    "https://Example.netlify.app", "https://example.netlify.app/preview/", "https://example.netlify.app:8443",
    "https://example.netlify.app\n", "https://example.netlify.app?x=1", "https://exa<mple.netlify.app",
    "https://localhost", "https://-example.netlify.app",
])
def test_an_origin_that_is_not_a_bare_https_origin_is_refused(origin):
    with pytest.raises(ValueError):
        netlify_files.netlify_files(origin)


def test_the_readme_names_the_recorded_host_and_the_module_hard_codes_none():
    # Tick 39 review, defect 4: "no host is committed" read as if no host was decided, but PREREG-DECISIONS.md:547
    # records it. What is true of this module is that it hard-codes none: the deploy configuration passes the host
    # (RULING-2026-09-29-lines.md (e), APPLY 3).
    prereg = (REPO_ROOT / "research" / "faceless-youtube" / "PREREG-DECISIONS.md").read_text(encoding="utf-8")
    recorded = re.search(r"sub-brand host: \*\*`([a-z0-9-]+)`\*\* \(`(https://[a-z0-9-]+\.netlify\.app)`\)", prereg)
    assert recorded, "PREREG-DECISIONS.md no longer records the sub-brand host"
    name, host = recorded.groups()
    readme = (PRODUCT / "README.md").read_text(encoding="utf-8").splitlines()
    row = next(line for line in readme if line.startswith("| `netlify_files.py` |"))
    assert "PREREG-DECISIONS.md:547" in row and "sub-brand host" in prereg.splitlines()[546]
    assert f"`{host}`" in row
    assert "No host is hard-coded in this module" in row
    assert "no host is committed" not in row
    # And the module does hard-code none: after its docstring, neither the name nor the host appears.
    code = (PRODUCT / "netlify_files.py").read_text(encoding="utf-8").split('"""', 2)[2]
    assert name not in code and host not in code
