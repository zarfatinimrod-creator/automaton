"""Render a faceless Hebrew parent-guide video from a spec.

    python render.py specs/yt-kids-setup.he.json --out out            # narrated (Kokoro, voice ef_dora)
    python render.py specs/yt-kids-setup.he.json --out out --voice none  # silent: timed by text length

Order of work, and where it stops:
  1. spec.validate()  - an unsourced scene, a quote not on its cited line, an unsourced number, an unvowelised
                        narration line or an end card without the AI and non-affiliation lines -> exit 2, nothing
                        written.
  2. frames           - one 1080x1920 PNG per scene plus the end card, each the scene's settled state (every text
                        revealed, every illustration beat at rest); any layout problem -> exit 3.
  3. narration        - per line, with measured timings; or, with --voice none, each scene lasts
                        max(3.5 s, reading time) and the video gets a silent AAC track.
     reading time     - every scene must stay on screen long enough to read all its text at 14 characters a
                        second (spec.reading_chars: title, body, footnotes, illustration labels), counted from when
                        each text appears (motion.reading_need: a line revealed with the last narration line cannot
                        be read before it). A narrated scene may hold up to MAX_HOLD_S of silence after its last line
                        for that; a scene that would need more -> exit 4, and the fix is less text, an earlier reveal
                        or more narration, not a longer silent still.
  4. motion           - compose.Video draws every video frame from the scenes' layers and the spec's `motion` keys
                        (motion.py): texts ease in at the narration line that speaks them, a highlight can run
                        along a step chain while it is spoken, the illustration plays its beats (none hidden under
                        a slide), scenes slide a short way and cross-fade (<= 300 ms), the progress bar fills
                        continuously, the hook's question is on screen whole from the first frame while its promise,
                        phone and "6" move from 0.0 s, and the end card fades in and then stays fully opaque for
                        end_card_hold_s. Nothing is drawn outside y 180-1500. Frames go to ffmpeg as raw RGB, so a
                        re-render is byte-identical.
     ffmpeg           - H.264 yuv420p, BT.709 matrix and colour tags (phones and browsers assume BT.709 for HD;
                        an untagged BT.601 encode shifts the palette), 30 fps; AAC 48 kHz stereo, the mono
                        narration copied to both channels and loudness-normalised in two passes to -14 LUFS
                        integrated, true peak under -1.5 dBTP after encoding (platforms turn loud videos down but do not turn quiet ones up);
                        an .srt; manifest.json with every scene's sources (capture file:line, checked), the voice
                        and font licences, the measured loudness and the ffprobe result.
No music. Nothing is uploaded anywhere: there is no upload code.
"""

from __future__ import annotations

import argparse
import hashlib
import json
import math
import platform
import re
import subprocess
import sys
from datetime import datetime, timezone
from pathlib import Path

import motion as M
import spec as S

HERE = Path(__file__).resolve().parent
FPS = 30
LEAD_S = 0.15      # silence before a scene's first line
GAP_S = 0.45       # silence between lines
TAIL_S = 0.45      # silence after a scene's last line
LINE_TAIL_S = 0.6  # tail on the per-line check files (as the voice prototype's one-line files)
CPS = 14.0         # reading speed for on-screen text, characters per second
MIN_SCENE_S = 3.5
MAX_HOLD_S = 1.0   # silence a narrated scene may hold after its last line so its text can be read
# -14 LUFS integrated. The true-peak ceiling is set to -2 dBTP because AAC encoding adds a few tenths of a dB:
# with -1.5 the finished file measured -1.3 dBTP (29.9.2026); with -2 it lands under -1.5.
LOUDNESS = {"I": -14.0, "TP": -2.0, "LRA": 11.0}
PAN = "pan=stereo|c0=c0|c1=c0"  # the mono narration on both channels at full level (-ac 2 would cost 3 dB)
COLOUR_TAGS = ["-colorspace", "bt709", "-color_primaries", "bt709", "-color_trc", "bt709", "-color_range", "tv"]
RLM = "‏"
FONT = {
    "family": "Heebo (variable, wght 100-900)",
    "file": "fonts/heebo/Heebo[wght].ttf",
    "licence": "SIL Open Font License 1.1 (fonts/heebo/OFL.txt)",
    "copyright": "Copyright 2014 The Heebo Project Authors (https://github.com/OdedEzer/heebo)",
    "designer": "Oded Ezer",
    "source": "https://raw.githubusercontent.com/google/fonts/main/ofl/heebo/Heebo%5Bwght%5D.ttf",
}


# ------------------------------------------------------------------ timing and captions (pure functions)


def quantize(d: float) -> float:
    """Round a duration up to a whole number of video frames."""
    return math.ceil(round(d * FPS, 6)) / FPS


def reading_time(scene: dict, title_seen: bool = False) -> float:
    """Seconds a viewer needs to read everything the scene shows, at CPS (a repeated page title is not re-read)."""
    return S.reading_chars(scene, title_seen) / CPS


def silent_duration(scene: dict, title_seen: bool = False) -> float:
    return quantize(max(MIN_SCENE_S, reading_time(scene, title_seen)) + float(scene.get("hold_extra_s", 0)))


def revealed_reading_time(scene: dict, title_seen: bool, cues: list[dict], slide_in: bool = False) -> float:
    """Seconds until everything is read when each text can only be read once it has appeared (motion.py): the
    reading rule applied in reveal order. Equals reading_time() when everything is on screen from the start."""
    return M.reading_need(M.reading_elements(scene, title_seen, cues, slide_in), CPS)


def scene_timing(narrated_s: float, scene: dict, title_seen: bool = False, cues: list[dict] | None = None,
                 slide_in: bool = False) -> dict:
    """A narrated scene's length. narrated_s is lead + lines + gaps + tail. The scene lasts until its text can be
    read at CPS - counted from when each text appears, given the cues - and until its motion has come to rest; the
    silence that adds after the narration is the hold, and a hold over MAX_HOLD_S marks the scene too dense
    (render.py refuses it)."""
    base = narrated_s + float(scene.get("hold_extra_s", 0))
    need = reading_time(scene, title_seen)
    revealed = revealed_reading_time(scene, title_seen, cues, slide_in) if cues else need
    rest = M.motion_end(scene, cues, slide_in) if cues else 0.0
    dur = quantize(max(base, need, revealed, rest))
    return {"duration": dur, "narrated_s": round(narrated_s, 3), "reading_s": round(need, 2),
            "reading_revealed_s": round(revealed, 2), "motion_rest_s": round(rest, 2),
            "hold_s": round(dur - narrated_s, 3), "too_dense": max(need, revealed, rest) - base > MAX_HOLD_S}


def silent_cues(scene: dict, dur: float) -> list[dict]:
    """Spread the narration text over the scene in proportion to its length (captions for a silent cut)."""
    lines = S.narration_lines(scene)
    total = sum(len(S.strip_nikud(ln)) for ln in lines) or 1
    t, span, cues = LEAD_S, dur - LEAD_S - TAIL_S, []
    for j, ln in enumerate(lines):
        d = span * len(S.strip_nikud(ln)) / total
        cues.append({"text": ln, "caption": caption_for(scene, j), "start": round(t, 3), "end": round(t + d, 3)})
        t += d
    return cues


def silent_scene(scene: dict, title_seen: bool = False, slide_in: bool = False) -> tuple[float, list[dict], dict]:
    """A silent scene: silent_duration(), stretched (whole frames) until its text can be read in reveal order and
    its motion has come to rest, with the captions spread over the final length."""
    dur = silent_duration(scene, title_seen)
    for _ in range(60):
        cues = silent_cues(scene, dur)
        revealed = revealed_reading_time(scene, title_seen, cues, slide_in)
        need = max(revealed, M.motion_end(scene, cues, slide_in))
        if need <= dur + 1e-9:
            break
        dur = quantize(need)
    return dur, cues, {"duration": dur, "reading_s": round(reading_time(scene, title_seen), 2),
                       "reading_revealed_s": round(revealed, 2)}


def end_card_duration(spec: dict) -> float:
    """The end card's length: its cross-fade in (motion.TRANSITION_S) and then end_card_hold_s fully opaque, so the
    AI and non-affiliation lines are readable for the whole hold the script gives them."""
    return quantize(float(spec.get("end_card_hold_s", 4.5)) + M.TRANSITION_S)


def srt_time(t: float) -> str:
    ms = int(round(t * 1000))
    h, ms = divmod(ms, 3_600_000)
    m, ms = divmod(ms, 60_000)
    sec, ms = divmod(ms, 1000)
    return f"{h:02d}:{m:02d}:{sec:02d},{ms:03d}"


def caption_for(scene: dict, j: int) -> str:
    """Caption for narration line j: the spec's standard-spelling caption (checked by spec.caption_matches), or
    else the narration without nikud, with the product name as written on screen."""
    caps = scene.get("captions")
    if caps:
        return caps[j]
    return re.sub(r"יוטיוב קידס", "YouTube Kids", S.strip_nikud(S.narration_lines(scene)[j]))


def rtl_line(text: str) -> str:
    """RLM on both ends, so a player that assumes LTR still puts the final punctuation on the left."""
    return f"{RLM}{text}{RLM}"


def srt(cues: list[dict]) -> str:
    out = []
    for i, c in enumerate(cues, 1):
        out.append(f"{i}\n{srt_time(c['start'])} --> {srt_time(c['end'])}\n{rtl_line(c['caption'])}\n")
    return "\n".join(out)


# ------------------------------------------------------------------ helpers


def sha256(p: Path) -> str:
    h = hashlib.sha256()
    with open(p, "rb") as f:
        for chunk in iter(lambda: f.read(1 << 20), b""):
            h.update(chunk)
    return h.hexdigest()


def evidence_record(ev: dict, root: Path) -> dict:
    p = root / ev["file"]
    meta = json.loads(S.meta_path_for(p).read_text(encoding="utf-8"))
    rec = {"cite": f"{ev['file']}:{ev['line']}" if "line" in ev else ev["file"],
           "quote": ev.get("quote"), "checked": S.check_evidence(ev, root) is None,
           "url": meta.get("url"), "http_status": meta.get("status"), "fetchedAt": meta.get("fetchedAt"),
           "stored_body_sha256": meta.get("sha256")}
    return {k: v for k, v in rec.items() if v is not None}


def ffprobe(path: Path) -> dict:
    r = subprocess.run(["ffprobe", "-v", "error", "-show_entries",
                        "format=duration:stream=codec_type,codec_name,width,height,pix_fmt,sample_rate,channels",
                        "-of", "json", str(path)], capture_output=True, text=True, check=True)
    return json.loads(r.stdout)


def loudnorm_filter(measured: dict | None = None, report: bool = False) -> str:
    """The audio chain: mono narration to both channels, then EBU R128 loudness normalisation. Without measurements
    it is the first (measuring) pass; with the first pass's measurements it is the second pass, linear when the
    target is reachable without passing the true-peak ceiling, else loudnorm's dynamic mode."""
    f = f"{PAN},loudnorm=I={LOUDNESS['I']}:TP={LOUDNESS['TP']}:LRA={LOUDNESS['LRA']}"
    if measured is None:
        return f + ":print_format=json"
    f += (f":measured_I={measured['input_i']}:measured_TP={measured['input_tp']}"
          f":measured_LRA={measured['input_lra']}:measured_thresh={measured['input_thresh']}"
          f":offset={measured['target_offset']}:linear=true")
    return f + (":print_format=json" if report else ",aresample=48000")


def _loudnorm_json(wav: Path, af: str) -> dict:
    r = subprocess.run(["ffmpeg", "-hide_banner", "-nostats", "-i", str(wav), "-af", af, "-f", "null", "-"],
                       capture_output=True, text=True, check=True)
    err = r.stderr
    return json.loads(err[err.rindex("{"):err.rindex("}") + 1])


def measure_loudnorm(wav: Path) -> dict:
    """First loudnorm pass over the narration (its loudness, peak, range and threshold), plus the mode the second
    pass will run in ("linear" or "dynamic")."""
    m = _loudnorm_json(wav, loudnorm_filter())
    m["second_pass"] = _loudnorm_json(wav, loudnorm_filter(m, report=True)).get("normalization_type")
    return m


def measure_output(mp4: Path) -> dict:
    """Integrated loudness, range and true peak of the finished file's audio (ffmpeg ebur128)."""
    r = subprocess.run(["ffmpeg", "-hide_banner", "-nostats", "-i", str(mp4), "-map", "0:a", "-af",
                        "ebur128=peak=true", "-f", "null", "-"], capture_output=True, text=True, check=True)
    tail = r.stderr[r.stderr.rindex("Summary:"):]
    get = lambda pat: float(re.search(pat, tail).group(1))  # noqa: E731
    return {"integrated_lufs": get(r"I:\s+(-?[\d.]+) LUFS"), "lra_lu": get(r"LRA:\s+(-?[\d.]+) LU"),
            "true_peak_dbfs": get(r"Peak:\s+(-?[\d.]+) dBFS")}


def ffmpeg_cmd(audio: Path | None, measured: dict | None, total: float, title: str, artist: str,
               mp4: Path) -> list[str]:
    """The assembly command. The video arrives on stdin as raw 1080x1920 rgb24 frames at FPS (compose.Video.write);
    audio=None gives a silent stereo track."""
    cmd = ["ffmpeg", "-y", "-loglevel", "error",
           "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", "1080x1920", "-framerate", str(FPS), "-i", "pipe:0"]
    graph = "[0:v]scale=out_color_matrix=bt709:out_range=tv,format=yuv420p[v]"
    if audio is not None:
        cmd += ["-i", str(audio)]
        graph += f";[1:a]{loudnorm_filter(measured)}[a]"
        amap = "[a]"
    else:
        cmd += ["-f", "lavfi", "-t", f"{total:.6f}", "-i", "anullsrc=r=48000:cl=stereo"]
        amap = "1:a"
    cmd += ["-filter_complex", graph, "-map", "[v]", "-map", amap,
            "-c:v", "libx264", "-preset", "medium", "-crf", "20", "-tune", "animation", "-r", str(FPS), *COLOUR_TAGS,
            "-c:a", "aac", "-b:a", "160k", "-ar", "48000", "-ac", "2", "-movflags", "+faststart",
            "-metadata", f"title={title}", "-metadata", f"artist={artist}",
            "-metadata", "comment=Sample, unpublished. Made with AI; synthetic narration. Independent; not "
                         "affiliated with YouTube or Google.", str(mp4)]
    return cmd


def encode(video, audio: Path | None, measured: dict | None, total: float, title: str, artist: str, mp4: Path,
           stop: int | None = None) -> None:
    """Stream the video's frames into ffmpeg and wait for it (stop: only the first `stop` frames, for tests)."""
    proc = subprocess.Popen(ffmpeg_cmd(audio, measured, total, title, artist, mp4), stdin=subprocess.PIPE)
    try:
        video.write(proc.stdin, stop=stop)
    finally:
        proc.stdin.close()
    if proc.wait() != 0:
        raise subprocess.CalledProcessError(proc.returncode, "ffmpeg")


def tool_versions() -> dict:
    from PIL import __version__ as pil, features

    ff = subprocess.run(["ffmpeg", "-version"], capture_output=True, text=True).stdout.split("\n")[0]
    return {"python": platform.python_version(), "pillow": pil, "raqm": features.version("raqm"),
            "fribidi": features.version("fribidi"), "harfbuzz": features.version("harfbuzz"), "ffmpeg": ff}


# ------------------------------------------------------------------ main


def main(argv=None) -> int:
    ap = argparse.ArgumentParser(description=__doc__.split("\n")[0])
    ap.add_argument("spec")
    ap.add_argument("--out", default=str(HERE / "out"))
    ap.add_argument("--voice", default="ef_dora", help='Kokoro voice, or "none" for a silent cut')
    ap.add_argument("--speed", type=float, default=0.9)
    ap.add_argument("--models", default=None, help="directory holding the pinned Kokoro files (default .cache/models)")
    ap.add_argument("--engine", choices=["auto", "raqm", "basic"], default="auto")
    ap.add_argument("--repo-root", default=str(S.REPO_ROOT))
    ap.add_argument("--frames-only", action="store_true")
    a = ap.parse_args(argv)

    root = Path(a.repo_root).resolve()
    spec_path = Path(a.spec).resolve()
    spec = S.load(spec_path)
    problems = S.validate(spec, root)
    if problems:
        print("refusing to render " + spec_path.name + ":", file=sys.stderr)
        for p in problems:
            print("  - " + p, file=sys.stderr)
        return 2

    import numpy as np
    import soundfile as sf

    import frame
    from canvas import engine_auto

    engine = engine_auto() if a.engine == "auto" else a.engine
    voiced = a.voice != "none"
    ai_line = spec["ai_line"] if voiced else spec.get("ai_line_silent", spec["ai_line"])
    out = Path(a.out).resolve()
    (out / "frames").mkdir(parents=True, exist_ok=True)
    stem = spec_path.name[:-5] if spec_path.name.endswith(".json") else spec_path.stem

    # 2. frames
    scenes = spec["scenes"]
    total_steps = len(S.step_numbers(spec))
    seen_step, frames, reports, bad = False, [], {}, []
    for i, sc in enumerate(scenes):
        step, _ = S.split_title(sc["on_screen_title"])
        seen_step = seen_step or step is not None
        filled = step if step is not None else (total_steps if seen_step else 0)
        img, rep = frame.render_scene(sc, spec, engine, ai_line, filled, total_steps)
        f = out / "frames" / f"{i:02d}-{sc['id']}.png"
        img.save(f, optimize=True)
        frames.append(f)
        reports[sc["id"]] = rep
        bad += [f"{sc['id']}: {p}" for p in rep["problems"]]
    img, rep = frame.render_end_card(spec, engine, ai_line)
    f = out / "frames" / f"{len(scenes):02d}-end-card.png"
    img.save(f, optimize=True)
    frames.append(f)
    reports["end-card"] = rep
    bad += [f"end-card: {p}" for p in rep["problems"]]
    if bad:
        print("layout problems (frames written to inspect):", file=sys.stderr)
        for p in bad:
            print("  - " + p, file=sys.stderr)
        return 3
    if a.frames_only:
        print(json.dumps({"frames": [str(p) for p in frames]}, ensure_ascii=False, indent=1))
        return 0

    # 3. narration and timing
    sr = 24000
    timeline, track, all_cues, t0 = [], [], [], 0.0
    narrator = None
    if voiced:
        import tts

        narrator = tts.Narrator(Path(a.models) if a.models else tts.DEFAULT_MODELS, a.voice, a.speed)
        (out / "audio" / "lines").mkdir(parents=True, exist_ok=True)
    dense, seen = [], S.titles_seen(spec)
    for i, sc in enumerate(scenes):
        if voiced:
            parts, cues, t = [np.zeros(int(LEAD_S * sr), np.float32)], [], LEAD_S
            lines = S.narration_lines(sc)
            for j, ln in enumerate(lines):
                x, ipa = narrator.line(ln)
                d = len(x) / sr
                cues.append({"text": ln, "caption": caption_for(sc, j), "ipa": ipa, "start": round(t, 3),
                             "end": round(t + d, 3)})
                sf.write(out / "audio" / "lines" / f"{sc['id']}-{j + 1}.wav",
                         np.concatenate([x, np.zeros(int(LINE_TAIL_S * sr), np.float32)]), sr, subtype="PCM_16")
                parts.append(x)
                t += d
                if j < len(lines) - 1:
                    parts.append(np.zeros(int(GAP_S * sr), np.float32))
                    t += GAP_S
            timing = scene_timing(t + TAIL_S, sc, seen[i], cues, slide_in=i > 0)
            dur = timing["duration"]
            if timing["too_dense"]:
                dense.append(f"{sc['id']}: its text needs {timing['reading_revealed_s']:.1f} s to read at {CPS:.0f} "
                             f"characters a second, counted from when each line appears ({timing['reading_s']:.1f} s "
                             f"if all were shown at once), and its motion rests at {timing['motion_rest_s']:.1f} s; "
                             f"the narration covers {timing['narrated_s']:.1f} s and a scene may hold at most "
                             f"{MAX_HOLD_S:.1f} s of silence. Cut text, reveal it earlier (motion.reveal) or add "
                             "narration.")
            audio = np.concatenate(parts)
            audio = np.concatenate([audio, np.zeros(int(round(dur * sr)) - len(audio), np.float32)])
            track.append(audio)
        else:
            dur, cues, timing = silent_scene(sc, seen[i], slide_in=i > 0)
        timeline.append({"id": sc["id"], "start": round(t0, 3), "duration": dur, "cues": cues, "timing": timing,
                         "title_seen": seen[i]})
        all_cues += [{**c, "start": round(t0 + c["start"], 3), "end": round(t0 + c["end"], 3)} for c in cues]
        t0 += dur
    if dense:
        print("scenes too dense to read (frames and line audio written to inspect):", file=sys.stderr)
        for p in dense:
            print("  - " + p, file=sys.stderr)
        return 4
    end_dur = end_card_duration(spec)
    timeline.append({"id": "end-card", "start": round(t0, 3), "duration": end_dur, "cues": []})
    if voiced:
        track.append(np.zeros(int(round(end_dur * sr)), np.float32))
    total = t0 + end_dur

    # 4. assemble
    mp4, srt_path = out / f"{stem}.mp4", out / f"{stem}.srt"
    srt_path.write_text(srt(all_cues), encoding="utf-8")
    wav, measured = None, None
    if voiced:
        wav = out / "audio" / "narration.wav"
        sf.write(wav, np.concatenate(track), sr, subtype="PCM_16")
        measured = measure_loudnorm(wav)
    title = f"{spec['brand']} · {spec.get('title_he', stem)}"
    import compose

    video = compose.Video(spec, timeline, engine, ai_line, FPS)
    encode(video, wav, measured, total, title, spec["brand"], mp4)
    probe = ffprobe(mp4)
    loudness = ({"target": LOUDNESS, "narration_measured": {k: measured[k] for k in
                                                              ("input_i", "input_tp", "input_lra", "input_thresh")},
                 "second_pass_mode": measured.get("second_pass"), "output": measure_output(mp4)}
                if voiced else None)

    manifest = {
        "product": "parent-guides",
        "status": spec.get("status"),
        "published": False,
        "rendered_at": datetime.now(timezone.utc).isoformat(timespec="seconds"),
        "spec": {"file": str(spec_path.relative_to(root)) if spec_path.is_relative_to(root) else str(spec_path),
                 "sha256": sha256(spec_path)},
        "title": spec.get("title_he"),
        "brand": spec["brand"],
        "ai_declaration_on_screen": ai_line,
        "affiliation": "Independent video; not affiliated with YouTube or Google. Trademarks named for identification "
                       "only; no logo, screenshot or imitation of their visual identity.",
        "video": {"file": mp4.name, "title_metadata": title, "width": 1080, "height": 1920, "fps": FPS,
                  "codec": "H.264 yuv420p + AAC 48 kHz stereo",
                  "colour": "RGB to YUV with the BT.709 matrix, limited range; tagged bt709 primaries, transfer and "
                            "matrix",
                  "duration_s": round(total, 3), "captions": srt_path.name, "music": None,
                  "stills": "frames/: each scene's settled still (every text revealed, every beat at rest): the frame "
                            "the layout checks ran on, and the scene's last video frame outside the progress band"},
        "loudness": loudness,
        "voice": ({"voice": a.voice, "speed": a.speed, **tts.PROVENANCE,
                   "human_review_required": "A native Hebrew listener must approve the narration before anything "
                                            "is published."} if voiced else None),
        "timing": ({"lead_s": LEAD_S, "gap_s": GAP_S, "tail_s": TAIL_S, "reading_chars_per_second": CPS,
                    "max_hold_s": MAX_HOLD_S} if voiced
                   else {"chars_per_second": CPS, "min_scene_s": MIN_SCENE_S}),
        "motion": {"reveal_s": M.REVEAL_S, "reveal_lead_s": M.REVEAL_LEAD_S, "stagger_s": M.STAGGER_S,
                   "rise_px": M.RISE_PX, "transition_s": M.TRANSITION_S,
                   "slide_frac": M.SLIDE_FRAC, "beat_after_slide_s": M.BEAT_AFTER_SLIDE_S,
                   "highlight_s": list(M.HIGHLIGHT_S),
                   "transition": "slide in from the left by 30% of the width while cross-fading, previous scene "
                                 "out to the right (right-to-left forward); later pages of one step keep header "
                                 "and title still; no beat starts before the slide rests; the end card "
                                 "cross-fades in and then holds fully opaque for end_card_hold_s",
                   "progress_bar": "the current step's segment fills continuously across its pages",
                   "hook": "the question is on screen, whole, from the first frame; the promise, the phone and "
                           "the '6' move from 0.0 s",
                   "drawn_band_y": [compose.BAND[1], compose.BAND[3]],
                   "frames": video.n_frames, "schedule": video.schedule()},
        "font": {**FONT, "sha256": sha256(HERE / FONT["file"])},
        "tools": tool_versions(),
        "scenes": [],
        "end_card": {"lines": [ai_line if ln == spec["ai_line"] else ln for ln in S.end_card_lines(spec)],
                     "duration_s": end_dur, "start_s": timeline[-1]["start"], "fade_in_s": M.TRANSITION_S,
                     "fully_opaque_s": round(end_dur - M.TRANSITION_S, 3),
                     "frame": f"frames/{frames[-1].name}",
                     "evidence": [evidence_record(ev, root) for ev in spec.get("end_card_evidence", [])]},
        "dropped_for_lack_of_source": spec.get("dropped_for_lack_of_source", []),
        "voice_notes": spec.get("voice_notes", []),
        "checks": {"spec_problems": [], "layout_problems": [], "ffprobe": probe},
    }
    for sc, seg, fp in zip(scenes, timeline, frames):
        manifest["scenes"].append({
            "id": sc["id"], "start_s": seg["start"], "duration_s": seg["duration"], "frame": f"frames/{fp.name}",
            "on_screen_title": sc["on_screen_title"], "on_screen_body": sc["on_screen_body"],
            "narration": [{k: v for k, v in c.items()} for c in seg["cues"]],
            "reading_chars": S.reading_chars(sc, seg["title_seen"]), "timing": seg["timing"],
            "sources": [evidence_record(ev, root)["cite"] for ev in sc["evidence"]],
            "evidence": [evidence_record(ev, root) for ev in sc["evidence"]],
            "script_sources": sc["sources"],
            "derived_numbers": sc.get("derived_numbers", []),
            "layout": {k: v for k, v in reports[sc["id"]].items() if k in ("body_size", "title_size", "problems")},
        })
    (out / "manifest.json").write_text(json.dumps(manifest, ensure_ascii=False, indent=1), encoding="utf-8")
    fmt = probe.get("format", {})
    print(json.dumps({"mp4": str(mp4), "srt": str(srt_path), "manifest": str(out / "manifest.json"),
                      "duration_s": fmt.get("duration"), "streams": probe.get("streams")}, ensure_ascii=False))
    return 0


if __name__ == "__main__":
    sys.exit(main())
