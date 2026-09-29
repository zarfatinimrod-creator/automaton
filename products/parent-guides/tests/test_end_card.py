"""The end card declares AI use and independence; every frame carries the brand and the AI line."""

import re

import pytest

AI = re.compile(r"נוצר בעזרת AI")
NOT_AFFILIATED = re.compile(r"ללא קשר ל-YouTube או ל-Google")


def test_end_card_carries_the_ai_line_and_the_non_affiliation_line(spec):
    import spec as S

    lines = S.end_card_lines(spec)
    assert lines[0] == spec["brand"] == "מהודק"
    assert any(AI.search(ln) for ln in lines)
    assert any(NOT_AFFILIATED.search(ln) for ln in lines)


def test_end_card_direction_line_is_not_on_screen(spec):
    import spec as S

    assert not any(ln.startswith("(") for ln in S.end_card_lines(spec))


def test_validator_refuses_an_end_card_without_the_ai_line(sample):
    import spec as S

    sample["end_card"] = sample["end_card"].replace(sample["ai_line"], "")
    assert "end card lacks the AI line" in S.validate(sample)


def test_validator_refuses_an_end_card_without_the_non_affiliation_line(sample):
    import spec as S

    sample["end_card"] = sample["end_card"].replace("סרטון עצמאי, ללא קשר ל-YouTube או ל-Google\n", "")
    assert "end card lacks the non-affiliation line" in S.validate(sample)


def test_every_frame_and_the_end_card_show_brand_and_ai_line(sample):
    """The brand opens the header of every frame, and the tag at the top of every frame says the video is
    independent and made with AI - at the top, where Shorts, Reels and TikTok draw nothing over it."""
    pytest.importorskip("PIL")
    import frame
    from canvas import engine_auto

    eng = engine_auto()
    for sc in sample["scenes"]:
        _, rep = frame.render_scene(sc, sample, eng, sample["ai_line"], 0, 6)
        assert rep["texts"]["brand"] == "מהודק"
        assert rep["texts"]["tag"] == f"סרטון עצמאי · {sample['ai_line']}"
        tag_box = dict(rep["boxes"])["tag"]
        assert tag_box[3] < 300, tag_box
    _, rep = frame.render_end_card(sample, eng, sample["ai_line"])
    assert any(AI.search(t) for t in rep["texts"].values())
    assert any(NOT_AFFILIATED.search(t.replace(" ", " ")) for t in rep["texts"].values())


def test_silent_cut_does_not_claim_a_synthetic_voice(sample):
    pytest.importorskip("PIL")
    import frame
    from canvas import engine_auto

    _, rep = frame.render_end_card(sample, engine_auto(), sample["ai_line_silent"])
    assert not any("קריינות" in t for t in rep["texts"].values())


def test_validator_wants_the_brand_first_in_the_series_line(sample):
    """"מדריך להורים: YouTube Kids" in the brand colour could read as an official guide; the header opens with
    the brand."""
    import spec as S

    sample["series"] = "מדריך להורים: YouTube Kids"
    assert any("series line must open with the brand" in p for p in S.validate(sample))


def test_validator_wants_an_independence_tag(sample):
    import spec as S

    sample.pop("independent_tag")
    assert "spec lacks 'independent_tag'" in S.validate(sample)


def test_end_card_names_the_help_center_as_it_names_itself(spec):
    """The captures title it "מרכז העזרה של YouTube For Families", not "... של YouTube Kids"."""
    import spec as S

    card = "\n".join(S.end_card_lines(spec))
    assert "מרכז העזרה של YouTube For Families" in card
    assert "מרכז העזרה של YouTube Kids" not in card
    assert "support.google.com/youtubekids" in card and "youtube.com/kids" in card
    for sc in spec["scenes"]:
        assert "מרכז העזרה של YouTube Kids" not in sc["on_screen_title"] + sc["on_screen_body"]
