"""Scene duration equals narration duration, to the frame; the MP4 has exactly the frames the timeline says."""

import shutil
import subprocess

import numpy as np
import pytest
from PIL import Image

import assemble
import tts

SR, FPS = 24_000, 30
VOICE = {"voice": "af_heart", "speed": 1.0, "lang": "en-us", "sentencePauseSeconds": 0.25, "sceneTailSeconds": 0.5,
         "pronounce": {"IP": "I P"}}


class FakeEngine:
    """Returns a fixed-length tone per sentence: 0.01 s of audio per character, so lengths are known in advance."""

    def __init__(self):
        self.spoken = []

    def create(self, text, voice, speed, lang):
        self.spoken.append(text)
        n = int(SR * 0.01 * len(text))
        return (0.1 * np.sin(np.arange(n) / 10)).astype(np.float32), SR


def test_scene_duration_equals_audio_duration_exactly():
    engine = FakeEngine()
    audio = tts.synthesize_scene(engine, "One sentence here. And a second one? Yes.", VOICE, FPS)
    assert len(audio.samples) % (SR // FPS) == 0
    assert audio.duration == audio.frames / FPS
    assert audio.duration == len(audio.samples) / SR
    # Speech + two sentence pauses + the tail, padded by less than one frame.
    speech = sum(int(SR * 0.01 * len(t)) for t in engine.spoken)
    unpadded = speech + 2 * int(SR * 0.25) + int(SR * 0.5)
    assert 0 <= len(audio.samples) - unpadded < SR // FPS


def test_sentence_timings_are_measured_and_ordered():
    audio = tts.synthesize_scene(FakeEngine(), "First part. Second part.", VOICE, FPS)
    a, b = audio.sentences
    assert a.start == 0 and a.end == pytest.approx(len("First part.") * 0.01)
    assert b.start == pytest.approx(a.end + 0.25)
    assert b.end < audio.duration


def test_spoken_text_is_normalised_but_subtitles_keep_the_figures():
    engine = FakeEngine()
    audio = tts.synthesize_scene(engine, "In 2020 it had 18% and grew 9.5 times, from IP addresses.", VOICE, FPS)
    assert engine.spoken == ["In 20 20 it had 18 percent and grew 9 point 5 times, from I P addresses."]
    assert audio.sentences[0].text == "In 2020 it had 18% and grew 9.5 times, from IP addresses."


def test_normalize_english_matches_the_fork_rules():
    assert tts.normalize_english("1.1 million") == "1 point 1 million"
    assert tts.normalize_english("the first quarter of 2026") == "the first quarter of 20 26"
    assert tts.normalize_english("in 1990") == "in 19 90"
    assert tts.normalize_english("102%") == "102 percent"


def _solid(path, rgb, size=(320, 180)):
    Image.new("RGB", size, rgb).save(path)
    return path


def _audio(seconds: float) -> tts.SceneAudio:
    n = int(SR * seconds)
    n += (-n) % (SR // FPS)
    return tts.SceneAudio(np.zeros(n, dtype=np.float32), SR, FPS, [tts.SentenceTiming("Hi.", "Hi.", 0.0, seconds / 2)])


def test_timeline_places_each_image_for_exactly_its_audio(tmp_path):
    audios = [_audio(1.0), _audio(1.5)]
    tl = assemble.build_timeline(["a", "b"], [tmp_path / "a.png", tmp_path / "b.png"], audios)
    assert [p.frames for p in tl.scenes] == [30, 45]
    assert [p.duration for p in tl.scenes] == [a.duration for a in audios]
    assert tl.scenes[1].start == 1.0
    assert tl.cues[1].start == pytest.approx(1.0)  # the second scene's sentence is shifted by the first scene


def test_assembled_video_has_exactly_the_timeline_frames(tmp_path):
    red = _solid(tmp_path / "red.png", (255, 0, 0))
    blue = _solid(tmp_path / "blue.png", (0, 0, 255))
    audios = [_audio(1.0), _audio(1.5)]
    tl = assemble.build_timeline(["red", "blue"], [red, blue], audios)
    mp4 = assemble.assemble(tl, audios, tmp_path / "out.mp4", 320, 180, tmp_path / "work")
    probe = assemble.probe(mp4)
    video = next(s for s in probe["streams"] if s["codec_type"] == "video")
    assert int(video["nb_frames"]) == 75
    assert (video["width"], video["height"]) == (320, 180)
    assert float(probe["format"]["duration"]) == pytest.approx(2.5, abs=1 / FPS)

    def frame(n):
        out = tmp_path / f"f{n}.png"
        subprocess.run([assemble.ffmpeg_exe(), "-v", "error", "-y", "-i", str(mp4), "-vf", f"select=eq(n\\,{n})",
                        "-vsync", "0", "-frames:v", "1", str(out)], check=True)
        return np.asarray(Image.open(out).convert("RGB"), dtype=int).mean(axis=(0, 1))

    assert frame(29)[0] > 200 and frame(29)[2] < 60  # last frame of the red scene
    assert frame(30)[2] > 200 and frame(30)[0] < 60  # first frame of the blue scene


def test_probe_without_ffprobe_uses_the_bundled_ffmpeg(tmp_path, monkeypatch):
    audios = [_audio(1.0)]
    tl = assemble.build_timeline(["g"], [_solid(tmp_path / "g.png", (0, 128, 0))], audios)
    mp4 = assemble.assemble(tl, audios, tmp_path / "g.mp4", 320, 180, tmp_path / "work")
    monkeypatch.setattr(shutil, "which", lambda name: None)
    probe = assemble.probe(mp4)
    assert probe["tool"].startswith("ffmpeg")
    video, audio = probe["streams"]
    assert (video["codec_name"], video["width"], video["height"], video["nb_frames"]) == ("h264", 320, 180, "30")
    assert audio["codec_name"] == "aac"


def test_srt_is_one_cue_per_sentence_split_into_two_line_blocks():
    cues = [assemble.Cue(0.0, 2.0, "Short one."), assemble.Cue(2.25, 10.0, "A " * 60 + "end.")]
    text = assemble.srt_text(cues)
    blocks = text.strip().split("\n\n")
    assert blocks[0] == "1\n00:00:00,000 --> 00:00:02,000\nShort one."
    assert len(blocks) > 2
    assert all(len(b.split("\n")) <= 4 for b in blocks)  # index, times, at most two lines
    assert blocks[-1].split("\n")[1].endswith("00:00:10,000")
