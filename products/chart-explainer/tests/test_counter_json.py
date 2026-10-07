"""counter.json: the T1 sub-brand's own PostHog project, read by the build (ruling 7.10 §3, fold 6).

render.py reads products/chart-explainer/counter.json before anything else and passes {"host": apiHost, "key":
projectKey} to page.build_page only when projectKey is non-empty; with it empty the page is the no-counter page, byte
for byte. The values are the sub-brand organisation's, never the brand's (products/il-biz-tools/src/config/site.json),
and a personal API key (phx_) or a third host is refused before anything is fetched or rendered.
"""

import ast
import json
import re

import pytest

import page
import render
from helpers import PRODUCT, REPO_ROOT
from test_page_counter import EU, GOLDEN, KEY, US, _inputs, _script

COUNTER = PRODUCT / "counter.json"
SITE = REPO_ROOT / "products" / "il-biz-tools" / "src" / "config" / "site.json"
RULING = "research/channel-loop/RULING-2026-10-07-posthog-organisation.md"


def _write(tmp_path, cfg):
    p = tmp_path / "counter.json"
    p.write_text(json.dumps(cfg) if not isinstance(cfg, str) else cfg, encoding="utf-8")
    return p


def _cfg(**over):
    return {"projectKey": "", "apiHost": EU, "projectId": "", "_comment": "x", **over}


# --- the committed file -----------------------------------------------------------------------------------------------

def test_the_committed_counter_json_holds_three_fields_and_a_comment_in_site_json_s_format():
    raw = COUNTER.read_text(encoding="utf-8")
    cfg = json.loads(raw)
    assert list(cfg) == ["projectKey", "apiHost", "projectId", "_comment"]
    assert raw == json.dumps(cfg, indent=2, ensure_ascii=False) + "\n"  # 2-space JSON and a final newline, as site.json
    assert cfg["apiHost"] in page.COUNTER_HOSTS
    assert cfg["projectKey"] == "" or re.fullmatch(r"phc_[A-Za-z0-9]{20,}", cfg["projectKey"])
    assert cfg["projectId"] == "" or re.fullmatch(r"[0-9]+", cfg["projectId"])
    assert RULING in cfg["_comment"] and (REPO_ROOT / RULING).is_file()
    assert "never the brand's" in cfg["_comment"] and "site.json" in cfg["_comment"]


def test_the_committed_file_is_read_as_the_build_reads_it_and_while_it_is_empty_the_page_is_the_golden(tmp_path):
    cfg = json.loads(COUNTER.read_text(encoding="utf-8"))
    got = render.load_counter()
    if cfg["projectKey"] == "":
        assert got is None
        assert page.build_page(*_inputs(tmp_path), counter=got) == GOLDEN.read_text(encoding="utf-8")
    else:  # after M4 of the ruling's §2 the build carries the sub-brand's counter
        assert got == {"host": cfg["apiHost"], "key": cfg["projectKey"]}


def test_the_sub_brand_and_the_brand_never_share_a_project():
    sub = json.loads(COUNTER.read_text(encoding="utf-8"))
    brand = json.loads(SITE.read_text(encoding="utf-8"))["posthog"]
    for field in ("projectKey", "projectId"):
        assert sub[field] == "" or sub[field] != brand[field], field
    assert "products/chart-explainer/counter.json" in brand["_comment"]  # site.json says where the sub-brand's lives


# --- the mapping ------------------------------------------------------------------------------------------------------

def test_an_empty_project_key_is_no_counter_and_the_golden_page(tmp_path):
    assert render.load_counter(_write(tmp_path, _cfg())) is None
    assert render.load_counter(_write(tmp_path, _cfg(projectId="12345"))) is None
    assert page.build_page(*_inputs(tmp_path), counter=render.load_counter(_write(tmp_path, _cfg()))) == \
        GOLDEN.read_text(encoding="utf-8")


@pytest.mark.parametrize("host", [EU, US])
def test_a_project_key_maps_to_host_and_key_and_the_page_carries_that_counter(tmp_path, host):
    counter = render.load_counter(_write(tmp_path, _cfg(projectKey=KEY, apiHost=host, projectId="12345")))
    assert counter == {"host": host, "key": KEY}  # projectId is not the page's: it is never passed
    js = _script(page.build_page(*_inputs(tmp_path), counter=counter))
    assert json.dumps(host + "/i/v0/e/") in js and json.dumps(KEY) in js


# --- fail closed ------------------------------------------------------------------------------------------------------

def test_a_personal_api_key_is_refused_and_not_repeated(tmp_path):
    private = "phx_" + "A1b2C3d4E5f6G7h8I9j0K1l2"
    with pytest.raises(ValueError, match="personal API key") as err:
        render.load_counter(_write(tmp_path, _cfg(projectKey=private)))
    assert private not in str(err.value)


@pytest.mark.parametrize("host", [
    "https://app.posthog.com", "https://eu.posthog.com", "https://us.posthog.com", "https://example.net",
    "https://eu.i.posthog.com/", "http://eu.i.posthog.com", "", None,
])
def test_a_third_host_is_refused(tmp_path, host):
    with pytest.raises(ValueError, match="counter host"):
        render.load_counter(_write(tmp_path, _cfg(projectKey=KEY, apiHost=host)))


def test_a_missing_host_is_refused(tmp_path):
    cfg = _cfg(projectKey=KEY)
    del cfg["apiHost"]
    with pytest.raises(ValueError, match="counter host"):
        render.load_counter(_write(tmp_path, cfg))


@pytest.mark.parametrize("cfg", [
    [], "on", 1, None, {}, {"apiHost": EU}, _cfg(projectKey=None), _cfg(projectKey=" "), _cfg(projectKey="phc_"),
    _cfg(projectKey=KEY + "\n"),
])
def test_a_file_that_is_not_an_object_with_a_project_token_is_refused(tmp_path, cfg):
    with pytest.raises(ValueError):
        render.load_counter(_write(tmp_path, json.dumps(cfg)))


def test_a_file_that_is_not_json_is_refused(tmp_path):
    with pytest.raises(ValueError):
        render.load_counter(_write(tmp_path, "{projectKey: ''}"))


# --- the build --------------------------------------------------------------------------------------------------------

def test_a_refused_counter_stops_the_render_before_anything_is_fetched_or_written(tmp_path, monkeypatch):
    bad = _write(tmp_path, _cfg(projectKey="phx_" + "A1b2C3d4E5f6G7h8I9j0K1l2"))
    monkeypatch.setattr(render, "COUNTER_CONFIG", bad)

    def fetched(*_a, **_k):
        raise AssertionError("the dataset was fetched before the counter was checked")

    monkeypatch.setattr(render.fetch, "fetch_dataset", fetched)
    out = tmp_path / "out"
    with pytest.raises(render.RenderError, match=r"^counter\.json: .*personal API key"):
        render.render(PRODUCT / "analyses" / "t1.json", out, None, REPO_ROOT, 0.0)
    assert not out.exists()


def test_a_missing_counter_file_stops_the_render(tmp_path, monkeypatch):
    monkeypatch.setattr(render, "COUNTER_CONFIG", tmp_path / "nowhere.json")
    monkeypatch.setattr(render.fetch, "fetch_dataset", lambda *_a, **_k: pytest.fail("fetched"))
    with pytest.raises(render.RenderError, match=r"^nowhere\.json: "):
        render.render(PRODUCT / "analyses" / "t1.json", tmp_path / "out", None, REPO_ROOT, 0.0)


def test_render_passes_the_counter_it_read_to_build_page_and_nowhere_else():
    tree = ast.parse((PRODUCT / "render.py").read_text(encoding="utf-8"))
    calls = [n for n in ast.walk(tree) if isinstance(n, ast.Call) and isinstance(n.func, ast.Attribute)
             and n.func.attr == "build_page"]
    assert len(calls) == 1
    kw = {k.arg: k.value for k in calls[0].keywords}
    assert set(kw) == {"counter"} and isinstance(kw["counter"], ast.Name) and kw["counter"].id == "counter"
    (fn,) = [n for n in tree.body if isinstance(n, ast.FunctionDef) and n.name == "render"]
    loads = [n for n in ast.walk(fn) if isinstance(n, ast.Call) and isinstance(n.func, ast.Name)
             and n.func.id == "load_counter"]
    assert len(loads) == 1 and [ast.unparse(a) for a in loads[0].args] == ["COUNTER_CONFIG"]
    assert render.COUNTER_CONFIG == COUNTER
