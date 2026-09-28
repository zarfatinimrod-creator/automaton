"""The optional page-view counter (research/channel-loop/BOARD-LOOP.md rank 5; RED-TEAM §2.1(c)).

Off (the default), the page is byte-for-byte the page it was before the counter existed. On, it carries exactly one
inline script that sends one anonymous $pageview to PostHog's public capture endpoint, and the page says so in plain
words. Anything but a PostHog project token for one of the two PostHog cloud hosts is refused before a page is built.
"""

import base64
import json
import re
from pathlib import Path

import pytest

import figures
import helpers
import page

SPEC = helpers.SPEC
# The page exactly as build_page wrote it before the counter was added (commit 4fd389e), for the inputs below.
GOLDEN = Path(__file__).resolve().parent / "fixtures" / "t1-page-no-counter.golden.html"
# A 16x9 white PNG, fixed as bytes so the pin does not depend on the installed Pillow or zlib build.
PNG = base64.b64decode(
    "iVBORw0KGgoAAAANSUhEUgAAABAAAAAJCAIAAAC0SDtlAAAAF0lEQVR4nGP8//8/AymAiSTVoxpopQEAMWADD3qy2BsAAAAASUVORK5CYII="
)
KEY = "phc_" + "A1b2C3d4E5f6G7h8I9j0K1l2M3n4O5p6Q7r8S9t0"  # made up, in the documented project-token shape
EU = "https://eu.i.posthog.com"
US = "https://us.i.posthog.com"
DISCLOSURE = ("This page counts visits anonymously, without cookies, through PostHog, and stores nothing about the "
              "visitor.")


def _inputs(tmp_path):
    an = figures.Analysis(figures.load_languages(helpers.small_dataset(tmp_path), ["EU"]), helpers.PARAMS)
    figs = figures.compute_figures(an)
    fj = json.loads(json.dumps(figures.figures_json(figs, [], SPEC, an, figures.compute_chart_figures(an))))
    charts = {}
    for s in SPEC["scenes"]:
        charts[s["id"]] = tmp_path / f"{s['id']}.png"
        charts[s["id"]].write_bytes(PNG)
    return SPEC, figures.fill_spec(SPEC, figs), fj, charts


def _script(html: str) -> str:
    (body,) = re.findall(r"<script>(.*?)</script>", html, flags=re.S)
    return body


def _method(html: str) -> str:
    return re.search(r'<section id="method">(.*?)</section>', html, flags=re.S).group(1)


# --- off: nothing changes ---------------------------------------------------------------------------------------------

def test_counter_off_is_byte_identical_to_the_page_before_the_counter(tmp_path):
    golden = GOLDEN.read_text(encoding="utf-8")
    inputs = _inputs(tmp_path)
    assert page.build_page(*inputs) == golden
    assert page.build_page(*inputs, counter=None) == golden
    assert "<script" not in golden and "PostHog" not in golden


# --- on: one inline script, one anonymous event -----------------------------------------------------------------------

@pytest.mark.parametrize("host", [EU, US])
def test_counter_on_adds_exactly_one_inline_script_and_no_external_load(tmp_path, host):
    html = page.build_page(*_inputs(tmp_path), counter={"host": host, "key": KEY})
    assert html.lower().count("<script") == 1 and html.lower().count("</script>") == 1
    assert re.findall(r"<script\b[^>]*>", html, flags=re.I) == ["<script>"]  # no src=, no type=module, nothing
    srcs = re.findall(r'src="([^"]*)"', html)
    assert len(srcs) == len(SPEC["scenes"]) and all(s.startswith("data:image/png;base64,") for s in srcs)
    for tag in ("<iframe", "<link", "<object", "<embed", "@import", "url(", "<img src=\"http"):
        assert tag not in html.lower(), tag


def test_counter_script_sends_one_anonymous_pageview_and_touches_no_storage(tmp_path):
    js = _script(page.build_page(*_inputs(tmp_path), counter={"host": EU, "key": KEY}))
    low = js.lower()
    for word in ("cookie", "localstorage", "sessionstorage", "indexeddb", "caches", "storage"):
        assert word not in low, word
    # Nothing a fingerprint is made of is read.
    for word in ("navigator", "screen", "canvas", "useragent", "language", "timezone", "plugins", "devicememory"):
        assert word not in low, word
    assert js.count("fetch(") == 1 and "XMLHttpRequest" not in js and "sendBeacon" not in js
    assert json.dumps(EU + "/i/v0/e/") in js  # PostHog's single-event capture endpoint, on the chosen cloud host
    assert json.dumps(KEY) in js
    assert '"$pageview"' in js
    assert '"$process_person_profile": false' in js
    assert "getRandomValues" in js  # a random id per load, never kept
    assert 'credentials: "omit"' in js


def test_counter_on_says_so_in_how_this_page_was_made_and_nowhere_changes_otherwise(tmp_path):
    inputs = _inputs(tmp_path)
    off = page.build_page(*inputs)
    on = page.build_page(*inputs, counter={"host": EU, "key": KEY})
    method = _method(on)
    assert DISCLOSURE in method
    assert "PostHog" not in _method(off) and DISCLOSURE not in off
    # The only differences between the two pages are the disclosure paragraph and the script.
    stripped = re.sub(r"<script>.*?</script>\n", "", on, flags=re.S)
    stripped = re.sub(r"\n<p>This page counts visits anonymously.*?</p>", "", stripped, flags=re.S)
    assert stripped == off


def test_counter_disclosure_names_what_is_sent_and_what_is_not_kept(tmp_path):
    method = _method(page.build_page(*_inputs(tmp_path), counter={"host": US, "key": KEY}))
    text = " ".join(method.split())
    assert "sets no cookie" in text and "writes nothing to your browser" in text
    assert "random number" in text and "the page's address" in text
    assert "IP address" in text


# --- fail closed ------------------------------------------------------------------------------------------------------

@pytest.mark.parametrize("key", [
    None, "", 12345, "phc_", "phc_" + "a" * 19, "phc_" + "a" * 19 + "-", "phc_" + "a" * 30 + "\n",
    " phc_" + "a" * 30, "PHC_" + "a" * 30, "phs_" + "a" * 30, "phc_" + "a" * 20 + "</script>",
    "phc_" + "a" * 20 + '"', "phc_" + "а" * 30,
])
def test_a_key_that_is_not_a_project_token_is_refused(tmp_path, key):
    with pytest.raises(ValueError):
        page.build_page(*_inputs(tmp_path), counter={"host": EU, "key": key})


def test_a_personal_api_key_is_refused_by_name(tmp_path):
    with pytest.raises(ValueError, match="personal API key"):
        page.build_page(*_inputs(tmp_path), counter={"host": EU, "key": "phx_" + "A1b2C3d4E5f6G7h8I9j0K1l2"})


@pytest.mark.parametrize("host", [
    None, "", "eu.i.posthog.com", "http://eu.i.posthog.com", "https://eu.i.posthog.com/", "https://EU.i.posthog.com",
    "https://eu.posthog.com", "https://us.posthog.com", "https://app.posthog.com", "https://eu-assets.i.posthog.com",
    "https://eu.i.posthog.com.example.net", "https://example.net", "https://eu.i.posthog.com/i/v0/e/",
])
def test_a_host_that_is_not_a_posthog_cloud_ingestion_host_is_refused(tmp_path, host):
    with pytest.raises(ValueError):
        page.build_page(*_inputs(tmp_path), counter={"host": host, "key": KEY})


@pytest.mark.parametrize("counter", [
    {}, {"key": KEY}, {"host": EU}, {"host": EU, "key": KEY, "extra": 1}, [EU, KEY], "on", True,
])
def test_a_counter_that_is_not_exactly_host_and_key_is_refused(tmp_path, counter):
    with pytest.raises(ValueError):
        page.build_page(*_inputs(tmp_path), counter=counter)


def test_the_module_docstring_describes_both_modes():
    doc = page.__doc__
    assert "counter" in doc and "PostHog" in doc and "/i/v0/e/" in doc
    assert "phx_" in doc and "public" in doc
    assert "there is no script" not in doc  # the old unconditional claim is gone; the off mode is described instead
