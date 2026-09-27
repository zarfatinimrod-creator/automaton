"""manifest.json has exactly the fields `publication-gate.ts` reads, and the board's constants match the TypeScript."""

import json
import re
from pathlib import Path

import pytest

import figures
import manifest

PRODUCT = Path(__file__).resolve().parent.parent
REPO_ROOT = PRODUCT.parent.parent
GATE = (REPO_ROOT / "src" / "revenue" / "publication-gate.ts").read_text()
SPEC = json.loads((PRODUCT / "analyses" / "t1.json").read_text())
FIXTURE = json.loads((PRODUCT / "tests" / "fixtures" / "t1-manifest.fixture.json").read_text())


def interface_fields(name: str) -> tuple[list[str], list[str]]:
    """(required, optional) top-level fields of `export interface <name> { ... }` in publication-gate.ts."""
    body = re.search(rf"export interface {name} \{{\n(.*?)\n\}}", GATE, re.S).group(1)
    body = re.sub(r"/\*\*.*?\*/", "", body, flags=re.S)
    required, optional = [], []
    depth = 0
    for line in body.splitlines():
        m = re.match(r"^  (\w+)(\??):", line) if depth == 0 else None
        if m:
            (optional if m.group(2) else required).append(m.group(1))
        depth += line.count("{") - line.count("}")
    return required, optional


def ts_string_constant(name: str) -> str:
    expr = re.search(rf"export const {name} =\s*(.*?);\n", GATE, re.S).group(1)
    return "".join(re.findall(r'"((?:[^"\\]|\\.)*)"', expr))


def test_manifest_fields_are_the_video_manifest_interface_in_order():
    required, optional = interface_fields("VideoManifest")
    assert optional == []
    assert list(manifest.MANIFEST_FIELDS) == required


def test_dataset_entries_have_every_required_dataset_use_field_and_nothing_foreign():
    required, optional = interface_fields("DatasetUse")
    for d in manifest.datasets(SPEC):
        assert set(required) <= set(d)
        assert set(d) <= set(required) | set(optional)
        for u in d["upstream"]:
            assert set(u) == {"source", "licence"}


def test_board_constants_mirror_the_gate():
    assert re.search(r"export const CHART_TTS_SYNTHETIC_MEDIA = true;", GATE)
    assert manifest.CHART_TTS_SYNTHETIC_MEDIA is True
    assert ts_string_constant("SYNTHETIC_VOICE_DISCLOSURE") == manifest.SYNTHETIC_VOICE_DISCLOSURE
    engines = re.search(r"ALLOWED_NARRATION_ENGINES[^=]*= new Set\(\[(.*?)\]\)", GATE).group(1)
    assert set(re.findall(r'"([^"]+)"', engines)) == set(manifest.ALLOWED_NARRATION_ENGINES)


def _filled():
    figs = {n: figures.Figure(n, "text", 0, "", "x", None, "7", "", "") for n in figures.FIGURES}
    return figures.fill_spec(SPEC, figs)


def test_build_manifest_leaves_the_auditors_fields_to_the_auditors():
    m = manifest.build_manifest(SPEC, _filled(), runner_minutes=2.241, token_cost_ils=0.0,
                                scheduled_at="2026-09-27T10:00:00Z")
    assert tuple(m) == manifest.MANIFEST_FIELDS
    assert m["author"] == "opus-builder"
    assert m["originality"] is None and m["factCheck"] is None and m["promiseMatch"] is None
    assert m["containsSyntheticMedia"] is True
    assert m["narration"] == {"engine": "kokoro-82m", "voiceId": SPEC["voice"]["voice"]}
    assert m["runnerMinutes"] == 2.25  # rounded up, never down
    assert m["topic"] == SPEC["topic"]


def test_description_attributes_the_dataset_below_the_voice_sentence():
    desc = manifest.description(SPEC)
    assert manifest.SYNTHETIC_VOICE_DISCLOSURE in desc
    data_at = desc.index(SPEC["dataset"]["name"], desc.index(manifest.SYNTHETIC_VOICE_DISCLOSURE))
    assert data_at > desc.index(manifest.SYNTHETIC_VOICE_DISCLOSURE)  # "the data cited below"
    assert SPEC["dataset"]["licence"] in desc and SPEC["dataset"]["commit"] in desc
    assert "{{" not in desc


def test_a_cloning_engine_is_refused():
    spec = json.loads(json.dumps(SPEC))
    spec["voice"]["engine"] = "voice-clone-x"
    with pytest.raises(ValueError, match="never made"):
        manifest.build_manifest(spec, _filled(), runner_minutes=1, token_cost_ils=0, scheduled_at="x")


def test_the_committed_fixture_is_a_real_t1_manifest():
    assert tuple(FIXTURE) == manifest.MANIFEST_FIELDS
    assert FIXTURE["author"] == "opus-builder"
    assert (REPO_ROOT / FIXTURE["datasets"][0]["licenceSnapshot"]).exists()
    assert figures.hand_typed_numbers(FIXTURE["script"]) != [], "the fixture holds the filled script"
