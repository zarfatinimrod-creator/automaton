"""The renderer refuses a spec it cannot stand behind, before it writes anything."""

import json
import subprocess
import sys

from conftest import PRODUCT


def _run(spec: dict, tmp_path):
    p = tmp_path / "bad.json"
    p.write_text(json.dumps(spec, ensure_ascii=False), encoding="utf-8")
    out = tmp_path / "out"
    r = subprocess.run([sys.executable, str(PRODUCT / "render.py"), str(p), "--out", str(out), "--voice", "none"],
                       capture_output=True, text=True, cwd=PRODUCT)
    return r, out


def test_renderer_refuses_a_scene_without_evidence(sample, tmp_path):
    sample["scenes"][3]["evidence"] = []
    r, out = _run(sample, tmp_path)
    assert r.returncode == 2
    assert "s3-passcode: unsourced scene" in r.stderr
    assert not out.exists()


def test_renderer_refuses_evidence_pointing_at_a_missing_capture(sample, tmp_path):
    sample["scenes"][2]["evidence"] = [{"file": "research/rendered/yk-no-such-page.txt", "line": 1, "quote": "x"}]
    r, out = _run(sample, tmp_path)
    assert r.returncode == 2 and "no such file" in r.stderr
    assert not out.exists()


def test_renderer_refuses_a_quote_that_is_not_on_its_line(sample, tmp_path):
    ev = sample["scenes"][1]["evidence"][0]
    sample["scenes"][1]["evidence"] = [{**ev, "line": ev["line"] + 1}]
    r, out = _run(sample, tmp_path)
    assert r.returncode == 2 and "quote not on that line" in r.stderr


def test_renderer_refuses_evidence_outside_research_rendered(sample, tmp_path):
    sample["scenes"][0]["evidence"] = [{"file": "MISSION.md", "line": 1, "quote": "MISSION"}]
    r, out = _run(sample, tmp_path)
    assert r.returncode == 2 and "not under research/rendered/" in r.stderr


def test_renderer_refuses_an_unvowelised_narration_line(sample, tmp_path):
    sample["scenes"][4]["narration"] = "יש סרטונים בחיפוש שלא עברו בדיקה אנושית."
    sample["scenes"][4].pop("captions")
    r, _ = _run(sample, tmp_path)
    assert r.returncode == 2 and "not vowelised" in r.stderr


def test_renderer_refuses_a_caption_that_changes_the_words(sample, tmp_path):
    sample["scenes"][6]["captions"][0] = "גם גוגל כותבת שהסינון מושלם."
    r, _ = _run(sample, tmp_path)
    assert r.returncode == 2 and "caption does not match" in r.stderr
