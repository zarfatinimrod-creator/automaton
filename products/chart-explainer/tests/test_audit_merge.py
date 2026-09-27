"""G3-G5 verdicts reach the manifest only from auditor files bound to the exact script audited."""

from __future__ import annotations

import json

import pytest

import manifest


def _m(script="Is it? Yes."):
    return {"author": manifest.AUTHOR, "script": script, "originality": None, "factCheck": None, "promiseMatch": None}


def _write(d, name, **kw):
    (d / name).write_text(json.dumps(kw), encoding="utf-8")


def test_verdicts_bound_to_this_script_are_merged(tmp_path):
    h = manifest.script_sha256("Is it? Yes.")
    _write(tmp_path, "a.json", gate="G4", auditor="opus-factcheck-auditor", verdict="PASS", figuresChecked=25, auditedScriptSha256=h)
    _write(tmp_path, "b.json", gate="G3", auditor="opus-originality-auditor", verdict="PASS", auditedScriptSha256=h)
    m, notes = manifest.merge_audits(_m(), tmp_path)
    assert m["factCheck"] == {"auditor": "opus-factcheck-auditor", "verdict": "PASS", "figuresChecked": 25}
    assert m["originality"] == {"auditor": "opus-originality-auditor", "verdict": "PASS"}
    assert m["promiseMatch"] is None
    assert "a.json" in notes["factCheck"]


def test_a_verdict_for_another_draft_is_never_carried_over(tmp_path):
    _write(tmp_path, "a.json", gate="G4", auditor="x", verdict="PASS", figuresChecked=25,
           auditedScriptSha256=manifest.script_sha256("an earlier draft"))
    m, notes = manifest.merge_audits(_m(), tmp_path)
    assert m["factCheck"] is None
    assert "hash mismatch" in notes["factCheck"]


def test_the_author_cannot_audit_itself(tmp_path):
    _write(tmp_path, "a.json", gate="G5", auditor=manifest.AUTHOR, verdict="PASS",
           auditedScriptSha256=manifest.script_sha256("Is it? Yes."))
    m, notes = manifest.merge_audits(_m(), tmp_path)
    assert m["promiseMatch"] is None
    assert "author" in notes["promiseMatch"]


def test_two_verdicts_for_one_gate_is_an_error(tmp_path):
    h = manifest.script_sha256("Is it? Yes.")
    _write(tmp_path, "a.json", gate="G3", auditor="x", verdict="PASS", auditedScriptSha256=h)
    _write(tmp_path, "b.json", gate="G3", auditor="y", verdict="FAIL", auditedScriptSha256=h)
    with pytest.raises(ValueError, match="second G3"):
        manifest.merge_audits(_m(), tmp_path)


def test_no_audits_dir_leaves_everything_null(tmp_path):
    m, notes = manifest.merge_audits(_m(), tmp_path / "missing")
    assert (m["originality"], m["factCheck"], m["promiseMatch"]) == (None, None, None)
    assert notes == {}
