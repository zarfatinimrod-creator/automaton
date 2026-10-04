"""manifest.json has exactly the fields `publication-gate.ts` reads, and the board's constants match the TypeScript."""

import json
import re
from pathlib import Path

import pytest

import figures
import manifest
import tts

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


def test_kids_line_sentences_mirror_the_gate():
    """Ruling 4.10 §4 rules 1-2: the three pinned sentences are identical in publication-gate.ts and here (fold 9)."""
    for name in ("KIDS_SPOKEN_DECLARATION", "KIDS_ON_SCREEN_TAG", "KIDS_AUDIENCE_SENTENCE"):
        assert ts_string_constant(name) == getattr(manifest, name), name
    # The ruling's own words, so a drift in both copies at once is caught too.
    assert manifest.KIDS_SPOKEN_DECLARATION == (
        "This video was made by a computer program, not by a person. The voice is a computer voice, not a real "
        "person. Every number comes from real data, listed under the video."
    )
    assert manifest.KIDS_ON_SCREEN_TAG == "Made by a computer program · computer voice · not a person"
    assert manifest.KIDS_AUDIENCE_SENTENCE == "Made for children who can read. This channel is set as made for kids."


def test_lines_are_the_gates_youtube_lines():
    union = re.search(r"export type YoutubeLine = (.*?);\n", GATE).group(1)
    assert tuple(re.findall(r'"([^"]+)"', union)) == manifest.LINES
    assert manifest.KIDS_LINE == "kids-explainers"


def _kids_spec(**changes):
    spec = json.loads(json.dumps(SPEC))
    spec.update({"line": "kids-explainers", "madeForKids": True, **changes})
    return spec


def test_build_manifest_writes_t1s_line_and_designation_from_the_spec():
    m = manifest.build_manifest(SPEC, _filled(), runner_minutes=1, token_cost_ils=0, scheduled_at="x")
    assert (m["line"], m["madeForKids"], m["onScreenTagEveryFrame"]) == ("faceless-youtube", False, None)
    assert (m["tags"], m["thumbnailBrief"]) == ([], None)
    assert SPEC["line"] == "faceless-youtube" and SPEC["madeForKids"] is False


def test_build_manifest_on_the_kids_line_records_the_tag_and_opens_the_description_for_the_parent():
    m = manifest.build_manifest(_kids_spec(), _filled(), runner_minutes=1, token_cost_ils=0, scheduled_at="x")
    assert (m["line"], m["madeForKids"]) == ("kids-explainers", True)
    assert m["onScreenTagEveryFrame"] == manifest.KIDS_ON_SCREEN_TAG
    assert m["description"].startswith(manifest.KIDS_AUDIENCE_SENTENCE + "\n\n" + manifest.SYNTHETIC_VOICE_DISCLOSURE)
    assert SPEC["question"] not in m["description"].split("\n\n")[0]
    assert tuple(m) == manifest.MANIFEST_FIELDS


def test_build_manifest_writes_the_spec_designation_as_it_is_and_leaves_the_judging_to_g11():
    # Not decided in the spec: null, which G11 fails. Decided wrongly: written as it is, which G11 fails too.
    spec = _kids_spec()
    del spec["madeForKids"]
    assert manifest.build_manifest(spec, _filled(), runner_minutes=1, token_cost_ils=0, scheduled_at="x")["madeForKids"] is None
    wrong = manifest.build_manifest(_kids_spec(madeForKids=False), _filled(), runner_minutes=1, token_cost_ils=0, scheduled_at="x")
    assert wrong["madeForKids"] is False


def test_tags_and_thumbnail_brief_come_from_the_spec():
    m = manifest.build_manifest(_kids_spec(tags=["rain", "charts"], thumbnailBrief="The rain chart."), _filled(),
                                runner_minutes=1, token_cost_ils=0, scheduled_at="x")
    assert (m["tags"], m["thumbnailBrief"]) == (["rain", "charts"], "The rain chart.")


@pytest.mark.parametrize("line", [None, "", "kids-shorts", "Kids-Explainers"])
def test_a_spec_without_a_known_line_writes_no_manifest(line):
    spec = json.loads(json.dumps(SPEC))
    spec["line"] = line
    with pytest.raises(ValueError, match="written only for faceless-youtube, kids-explainers"):
        manifest.build_manifest(spec, _filled(), runner_minutes=1, token_cost_ils=0, scheduled_at="x")


def test_narration_names_the_pinned_files_p1_requires():
    """P-1 (ruling 30.9 16(c) item 7): the gate refuses a manifest that does not name the archive and the model, and
    accepts only the files its licence record pins — which must be the ones tts.py fetches by sha256."""
    required, _ = interface_fields("VideoManifest")
    assert "narration" in required
    narration_type = re.search(r"^  narration: \{(.*?)\};$", GATE, re.M).group(1)
    assert re.findall(r"(\w+)(\??):", narration_type) == [
        ("engine", ""), ("voiceId", ""), ("voicesFile", ""), ("modelFile", "")
    ]
    record = GATE[GATE.index("export const KOKORO_82M_VOICE_LICENCE"):]
    for key, pinned in (("archive", tts.KOKORO_VOICES), ("model", tts.KOKORO_MODEL)):
        entry = re.search(rf'  {key}: \{{\n    file: "([^"]+)",\n    sha256: "([0-9a-f]{{64}})"', record)
        assert entry.groups() == (pinned.filename, pinned.sha256), key
    assert FIXTURE["narration"]["voicesFile"] == tts.KOKORO_VOICES.filename
    assert FIXTURE["narration"]["modelFile"] == tts.KOKORO_MODEL.filename


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
    assert m["narration"] == {
        "engine": "kokoro-82m",
        "voiceId": SPEC["voice"]["voice"],
        "voicesFile": "voices-v1.0.bin",
        "modelFile": "kokoro-v1.0.onnx",
    }
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


def test_the_video_carries_no_brand_and_the_description_carries_the_context():
    m = manifest.build_manifest(SPEC, _filled(), runner_minutes=1, token_cost_ils=0, scheduled_at="x")
    brand = SPEC["page"]["brand"].lower()
    for key in ("title", "description", "script"):
        assert brand not in m[key].lower(), key
    assert brand not in json.dumps(FIXTURE).lower()
    assert "a repository that holds both languages counts for both" in m["description"]
    assert SPEC["externalSources"]["octoverse_2025"]["sentence"] in m["description"]


def test_the_fixture_is_the_revised_script():
    assert "As a share of JavaScript, yes, and quickly; in raw numbers, no: JavaScript's lead grew." in FIXTURE["script"]
    assert "Relative to JavaScript, yes, and quickly." not in FIXTURE["script"]
