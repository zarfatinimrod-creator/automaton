"""Silent timing, captions and the narration contract; none of these need the voice model."""

import re

import pytest

import render
import spec as S


def test_silent_timing_is_14_chars_per_second_with_a_floor(sample):
    short = {"on_screen_title": "קצר", "on_screen_body": "גם"}
    assert render.silent_duration(short) == 3.5
    sc = sample["scenes"][2]
    d = render.silent_duration(sc)
    assert abs(d - S.reading_chars(sc) / 14) < 1 / render.FPS + 1e-9
    assert abs(d * render.FPS - round(d * render.FPS)) < 1e-6  # whole frames


def test_reading_chars_counts_title_body_and_labels_but_not_the_step_prefix():
    sc = {"on_screen_title": "3. קוד", "on_screen_body": "אחת\n* הערה", "illustration": {"labels": ["או"]}}
    assert S.reading_chars(sc) == len("קוד אחת * הערה או")
    assert S.reading_chars(sc, title_seen=True) == len("אחת * הערה או")


def test_a_narrated_scene_holds_until_its_text_can_be_read():
    sc = {"on_screen_title": "קצר", "on_screen_body": "א" * 136}  # 140 characters: 10 s at 14 cps
    t = render.scene_timing(9.5, sc)
    assert abs(t["duration"] - 10.0) < 1 / render.FPS and not t["too_dense"] and abs(t["hold_s"] - 0.5) < 0.04


def test_a_scene_that_needs_more_than_the_hold_cap_is_too_dense():
    """The reviews found every scene of the first cut unreadable in time (95 s of text in 60 s); a long silent
    still is no cure either, so needing more than MAX_HOLD_S of silence is refused (render.py exits 4)."""
    sc = {"on_screen_title": "קצר", "on_screen_body": "א" * 136}
    assert render.scene_timing(8.9, sc)["too_dense"]
    assert not render.scene_timing(9.1, sc)["too_dense"]


def test_every_scene_of_the_sample_fits_its_measured_narration(sample):
    """Narration lengths as measured on 29.9.2026 (manifest timing.narrated_s, ef_dora at speed 0.9): each scene's
    text is readable within its narration plus at most MAX_HOLD_S."""
    measured = {"s0-hook": 5.317, "s1-account-profile": 8.711, "s2-content-setting": 9.116, "s3-passcode": 5.274,
                "s4-search": 9.479, "s4b-search-caveat": 6.191, "s5-timer": 13.193, "s6-block": 11.934,
                "s6b-report": 7.279, "s7-outro": 3.096}
    for sc, seen in zip(sample["scenes"], S.titles_seen(sample)):
        assert not render.scene_timing(measured[sc["id"]], sc, seen)["too_dense"], sc["id"]


def test_assembly_encodes_bt709_and_normalises_loudness(tmp_path):
    measured = {"input_i": "-19.8", "input_tp": "-0.7", "input_lra": "2.5", "input_thresh": "-30.2",
                "target_offset": "0.1"}
    cmd = render.ffmpeg_cmd(tmp_path / "n.wav", measured, 3.0, "מהודק · כותרת", "מהודק", tmp_path / "o.mp4")
    graph = cmd[cmd.index("-filter_complex") + 1]
    assert "[0:v]scale=out_color_matrix=bt709:out_range=tv,format=yuv420p" in graph
    assert "[1:a]pan=stereo|c0=c0|c1=c0,loudnorm=I=-14.0" in graph and "measured_I=-19.8" in graph
    for flag in ("-colorspace", "-color_primaries", "-color_trc"):
        assert cmd[cmd.index(flag) + 1] == "bt709"
    assert "artist=מהודק" in cmd and "title=מהודק · כותרת" in cmd
    # the motion frames arrive on stdin as raw RGB at the video's frame rate
    i = cmd.index("rawvideo")
    assert cmd[i + 1:i + 7] == ["-pix_fmt", "rgb24", "-s", "1080x1920", "-framerate", str(render.FPS)]
    assert "pipe:0" in cmd and "stillimage" not in cmd
    silent = render.ffmpeg_cmd(None, None, 3.0, "t", "מהודק", tmp_path / "o.mp4")
    assert "loudnorm" not in " ".join(silent) and "anullsrc=r=48000:cl=stereo" in silent


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
    sc = dict(next(s for s in sample["scenes"] if s["id"] == "s7-outro"))
    sc.pop("captions")
    assert render.caption_for(sc, 0) == "כל הפרטים, במרכז העזרה הרשמי."
    assert render.caption_for({"narration": "מַתְקִינִים יוּ֫טְיוּבּ קִידְס?"}, 0) == "מתקינים YouTube Kids?"


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
