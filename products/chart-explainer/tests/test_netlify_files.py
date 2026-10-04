"""The four Netlify files deployed beside the web arm's index.html (research/faceless-youtube/PREREG-DECISIONS.md §3.6).

`/preview/` serves the same page under a different `$current_url`, so our own loads never count (§3.4(a)); it is kept
out of search; the sitemap lists the canonical URL only (§3.5 route 1). The host is an argument: the sub-brand
name, chartsplained, was chosen 29.9, pending the owner's veto (research/faceless-youtube/PREREG-DECISIONS.md:547; probes
in research/measurements/t1-subbrand-check.md), so no host is guessed or committed here.
"""

import re
import xml.etree.ElementTree as ET

import pytest

import netlify_files

ORIGIN = "https://example-sub-brand.netlify.app"  # made up; the real host is chosen by the loop
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
