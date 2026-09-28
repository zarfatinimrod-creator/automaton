"""No scene says a number its sources do not say.

Allowed without a quote, and each one checked here: the step prefix "N. " of a step title (the steps must run
1..N in order), the video's own step count, the capture date (the UTC date of every cited capture's fetchedAt),
and an illustrative number on an illustration label (never in the text or the narration)."""

import json
import re
from datetime import datetime, timezone

from conftest import REPO

NUM = re.compile(r"\d+(?:[.:,]\d+)*")
NIKUD = re.compile("[֑-ׇֽֿׁׂׅׄ]")
STEP = re.compile(r"^(\d+)\.\s+")


def _steps(spec):
    return [int(m.group(1)) for sc in spec["scenes"] if (m := STEP.match(sc["on_screen_title"]))]


def _capture_dates(spec):
    dates = set()
    for ev in [e for sc in spec["scenes"] for e in sc["evidence"]] + spec["end_card_evidence"]:
        p = REPO / ev["file"]
        stem = p.name[: -len(".meta.json")] if p.name.endswith(".meta.json") else p.name.rsplit(".", 1)[0]
        ts = json.loads((p.parent / f"{stem}.meta.json").read_text(encoding="utf-8"))["fetchedAt"]
        d = datetime.fromisoformat(ts.replace("Z", "+00:00")).astimezone(timezone.utc)
        dates.add(f"{d.day}.{d.month}.{d.year}")
    return dates


def _allowed(spec, sc, where):
    ok = set()
    for d in sc.get("derived_numbers", []):
        if d["kind"] == "step_count":
            assert d["value"] == str(len(_steps(spec)))
            ok.add(d["value"])
        elif d["kind"] == "capture_date":
            assert _capture_dates(spec) == {d["value"]}
            ok.add(d["value"])
        elif d["kind"] == "illustrative" and where == "label":
            ok.add(d["value"])
    return ok


def test_steps_run_one_to_n(spec):
    assert _steps(spec) == list(range(1, len(_steps(spec)) + 1))


def test_no_scene_text_contains_a_digit_that_is_not_in_its_source_quote(spec):
    for sc in spec["scenes"]:
        quoted = set(NUM.findall(" ".join(ev.get("quote", "") for ev in sc["evidence"])))
        title = STEP.sub("", sc["on_screen_title"])
        text = "\n".join([title, sc["on_screen_body"], NIKUD.sub("", sc["narration"])] + sc.get("captions", []))
        allowed = quoted | _allowed(spec, sc, "text")
        stray = [n for n in NUM.findall(text) if n not in allowed]
        assert not stray, f"{sc['id']}: numbers not in its quotes: {stray}"
        labels = " ".join(sc.get("illustration", {}).get("labels", []))
        stray = [n for n in NUM.findall(labels) if n not in quoted | _allowed(spec, sc, "label")]
        assert not stray, f"{sc['id']}: illustration numbers neither quoted nor declared: {stray}"


def test_end_card_numbers_are_sourced(spec):
    import spec as S

    card = "\n".join(S.end_card_lines(spec))
    quoted = set(NUM.findall(" ".join(ev.get("quote", "") for ev in spec["end_card_evidence"])))
    dates = {d["value"] for d in spec.get("end_card_derived_numbers", []) if d["kind"] == "capture_date"}
    assert dates <= _capture_dates(spec)
    assert [n for n in NUM.findall(card) if n not in quoted | dates] == []


def test_validator_refuses_an_unsourced_number(sample):
    import spec as S

    sc = sample["scenes"][1]
    sc["on_screen_body"] += "\nעד 10 פרופילים בחשבון"
    problems = S.validate(sample)
    assert any("'10'" in p and sc["id"] in p for p in problems)


def test_validator_refuses_an_illustrative_number_in_the_text(sample):
    import spec as S

    sc = next(s for s in sample["scenes"] if s["id"] == "s3-passcode")
    sc["on_screen_body"] += "\nהשאלה היא 3 × 4"  # "3" is declared illustrative: allowed on the card only
    assert any("'3'" in p for p in S.validate(sample))


def test_validator_refuses_a_wrong_step_count(sample):
    import spec as S

    sample["scenes"][0]["derived_numbers"][0]["value"] = "7"
    sample["scenes"][0]["on_screen_body"] = sample["scenes"][0]["on_screen_body"].replace("6 ", "7 ")
    assert any("step_count" in p for p in S.validate(sample))


def test_validator_refuses_a_wrong_capture_date(sample):
    import spec as S

    out = next(s for s in sample["scenes"] if s["id"] == "s7-outro")
    out["on_screen_body"] = out["on_screen_body"].replace("28.9.2026", "27.9.2026")
    out["derived_numbers"][0]["value"] = "27.9.2026"
    assert any("capture_date" in p for p in S.validate(sample))
