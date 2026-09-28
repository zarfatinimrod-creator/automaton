"""Silent timing, captions and the narration contract; none of these need the voice model."""

import re

import pytest

import render
import spec as S


def test_silent_timing_is_14_chars_per_second_with_a_floor(sample):
    short = {"on_screen_title": "קצר", "on_screen_body": "גם"}
    assert render.silent_duration(short) == 3.5
    sc = sample["scenes"][2]
    want = len(sc["on_screen_title"]) + len(sc["on_screen_body"].replace("\n", " "))
    d = render.silent_duration(sc)
    assert abs(d - (want / 14 + sc["hold_extra_s"])) < 1 / render.FPS + 1e-9
    assert abs(d * render.FPS - round(d * render.FPS)) < 1e-6  # whole frames


def test_silent_cues_cover_the_narration_in_order(sample):
    sc = sample["scenes"][1]
    dur = render.silent_duration(sc)
    cues = render.silent_cues(sc, dur)
    assert [c["caption"] for c in cues] == sc["captions"]
    assert cues[0]["start"] == render.LEAD_S and cues[-1]["end"] <= dur
    assert all(a["end"] <= b["start"] + 1e-6 for a, b in zip(cues, cues[1:]))


def test_srt_format_and_rtl_marks():
    text = render.srt([{"caption": "יש סרטון שלא מתאים לכם?", "start": 1.5, "end": 3.25}])
    assert text.startswith("1\n00:00:01,500 --> 00:00:03,250\n‏")
    assert text.rstrip("\n").endswith("?‏")


def test_captions_are_the_narration_in_standard_spelling(sample):
    for sc in sample["scenes"]:
        for cap, line in zip(sc["captions"], S.narration_lines(sc)):
            assert S.caption_matches(cap, line), (sc["id"], cap)


@pytest.mark.parametrize("cap,line,ok", [
    ("קודם כל, נכנסים", "קֹ֫דֶם כֹּל, נִכְנָסִים", True),
    ("קודם כל נכנסים", "קֹ֫דֶם כֹּל, נִכְנָסִים", False),      # punctuation dropped
    ("קודם הכל, נכנסים", "קֹ֫דֶם כֹּל, נִכְנָסִים", False),    # a word changed
    ("מתקינים YouTube Kids?", "מַתְקִינִים יוּ֫טְיוּבּ קִידְס?", True),
])
def test_caption_matching_rules(cap, line, ok):
    assert S.caption_matches(cap, line) is ok


def test_default_caption_without_a_captions_field(sample):
    sc = dict(sample["scenes"][7])
    sc.pop("captions")
    assert render.caption_for(sc, 0) == "כל הפרטים, במרכז העזרה של YouTube Kids."


def test_ipa_mapping_and_vowelisation_contract():
    tts = pytest.importorskip("tts")
    assert tts.kokoro_hebrew("ʔaχʁon") == "axɾon"
    with pytest.raises(ValueError):
        tts.require_vowelised("שלום להורים")
    tts.require_vowelised("שָׁלוֹם לַהוֹרִים")


def test_nikud_stripping_keeps_maqaf():
    assert S.strip_nikud("בְּֽמֶרְכַּז") == "במרכז"
    assert S.strip_nikud("ב־YouTube") == "ב־YouTube"
    assert not re.search("[֑-ׇ]", S.strip_nikud("כׇּל יוּ֫טְיוּבּ"))
