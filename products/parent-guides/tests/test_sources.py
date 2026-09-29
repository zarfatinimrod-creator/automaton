"""Every scene stands on first-party captures: the file exists under research/rendered/, returned HTTP 200, and holds
the quoted words on the cited line (a fixed-string match, as grep -F). These checks are written out here rather than
calling spec.validate(), so a bug in the validator cannot hide a bad spec."""

import json

from conftest import REPO

RENDERED = (REPO / "research" / "rendered").resolve()


def _meta(path):
    name = path.name
    stem = name[: -len(".meta.json")] if name.endswith(".meta.json") else name.rsplit(".", 1)[0]
    return json.loads((path.parent / f"{stem}.meta.json").read_text(encoding="utf-8"))


def _holds(ev) -> bool:
    p = (REPO / ev["file"]).resolve()
    if RENDERED not in p.parents or not p.is_file():
        return False
    if _meta(p).get("status") != 200:
        return False
    if "meta" in ev:
        m = _meta(p)
        return all(m.get(k) == v for k, v in ev["meta"].items())
    lines = p.read_text(encoding="utf-8").split("\n")
    return 1 <= ev["line"] <= len(lines) and ev["quote"] in lines[ev["line"] - 1]


def test_every_scene_has_a_source_under_research_rendered(spec):
    for sc in spec["scenes"]:
        holding = [ev for ev in sc.get("evidence", []) if _holds(ev)]
        assert holding, f"{sc['id']} has no source that exists under research/rendered/"


def test_every_evidence_entry_holds(spec):
    bad = [(sc["id"], ev) for sc in spec["scenes"] for ev in sc["evidence"] if not _holds(ev)]
    bad += [("end card", ev) for ev in spec["end_card_evidence"] if not _holds(ev)]
    assert not bad


def test_every_scene_names_its_sources_in_the_script_too(spec):
    """The verbatim script sources travel with the evidence: each evidence file is named in the scene's own
    source strings (by slug; the script shortens yk-passcode-iw to passcode-iw), so the reader of the script sees
    the same captures."""
    for sc in spec["scenes"]:
        text = " ".join(sc["sources"])
        for ev in sc["evidence"]:
            slug = ev["file"].split("/")[-1].split(".")[0].removeprefix("yk-")
            assert slug in text, f"{sc['id']}: {ev['file']} is not named in the script's sources"


def test_the_validator_accepts_the_sample(spec):
    import spec as S

    assert S.validate(spec) == []
