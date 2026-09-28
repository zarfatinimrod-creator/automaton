"""Render a faceless Hebrew parent-guide video from a spec.

    python render.py specs/yt-kids-setup.he.json --out out            # narrated (Kokoro, voice ef_dora)
    python render.py specs/yt-kids-setup.he.json --out out --voice none  # silent: timed by text length

Order of work, and where it stops:
  1. spec.validate()  - an unsourced scene, a quote not on its cited line, an unsourced number, an unvowelised
                        narration line or an end card without the AI and non-affiliation lines -> exit 2, nothing
                        written.
  2. frames           - one 1080x1920 PNG per scene plus the end card; any layout problem -> exit 3.
  3. narration        - per line, with measured timings; or, with --voice none, each scene lasts
                        max(3.5 s, on-screen characters / 14) and the video gets a silent AAC track.
  4. ffmpeg           - H.264 yuv420p + AAC, 30 fps; an .srt; manifest.json with every scene's sources
                        (capture file:line, checked), the voice and font licences, and the ffprobe result.
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

import spec as S

HERE = Path(__file__).resolve().parent
FPS = 30
LEAD_S = 0.15      # silence before a scene's first line
GAP_S = 0.45       # silence between lines
TAIL_S = 0.45      # silence after a scene's last line
LINE_TAIL_S = 0.6  # tail on the per-line check files (as the voice prototype's one-line files)
CPS = 14.0         # silent timing: on-screen characters per second
MIN_SCENE_S = 3.5
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


def on_screen_chars(scene: dict) -> int:
    return len(scene.get("on_screen_title", "")) + len(scene.get("on_screen_body", "").replace("\n", " "))


def silent_duration(scene: dict) -> float:
    return quantize(max(MIN_SCENE_S, on_screen_chars(scene) / CPS) + float(scene.get("hold_extra_s", 0)))


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
    total_steps = len(S.step_scenes(spec))
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
    for i, sc in enumerate(scenes):
        hold = float(sc.get("hold_extra_s", 0))
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
            dur = quantize(t + TAIL_S + hold)
            audio = np.concatenate(parts)
            audio = np.concatenate([audio, np.zeros(int(round(dur * sr)) - len(audio), np.float32)])
            track.append(audio)
        else:
            dur = silent_duration(sc)
            cues = silent_cues(sc, dur)
        timeline.append({"id": sc["id"], "start": round(t0, 3), "duration": dur, "cues": cues})
        all_cues += [{**c, "start": round(t0 + c["start"], 3), "end": round(t0 + c["end"], 3)} for c in cues]
        t0 += dur
    end_dur = quantize(float(spec.get("end_card_hold_s", 4.5)))
    timeline.append({"id": "end-card", "start": round(t0, 3), "duration": end_dur, "cues": []})
    if voiced:
        track.append(np.zeros(int(round(end_dur * sr)), np.float32))
    total = t0 + end_dur

    # 4. assemble
    mp4, srt_path = out / f"{stem}.mp4", out / f"{stem}.srt"
    srt_path.write_text(srt(all_cues), encoding="utf-8")
    cmd = ["ffmpeg", "-y", "-loglevel", "error"]
    for fp, seg in zip(frames, timeline):
        cmd += ["-loop", "1", "-framerate", str(FPS), "-t", f"{seg['duration']:.6f}", "-i", str(fp)]
    if voiced:
        wav = out / "audio" / "narration.wav"
        sf.write(wav, np.concatenate(track), sr, subtype="PCM_16")
        cmd += ["-i", str(wav)]
    else:
        cmd += ["-f", "lavfi", "-t", f"{total:.6f}", "-i", "anullsrc=r=48000:cl=stereo"]
    n = len(frames)
    cmd += ["-filter_complex", "".join(f"[{k}:v]" for k in range(n)) + f"concat=n={n}:v=1:a=0,format=yuv420p[v]",
            "-map", "[v]", "-map", f"{n}:a", "-c:v", "libx264", "-preset", "medium", "-crf", "20",
            "-tune", "stillimage", "-r", str(FPS), "-c:a", "aac", "-b:a", "160k", "-ar", "48000", "-ac", "2",
            "-movflags", "+faststart", "-metadata", f"title={spec.get('title_he', stem)}",
            "-metadata", "comment=Sample, unpublished. Made with AI; synthetic narration. Independent; not "
                         "affiliated with YouTube or Google.", str(mp4)]
    subprocess.run(cmd, check=True)
    probe = ffprobe(mp4)

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
        "video": {"file": mp4.name, "width": 1080, "height": 1920, "fps": FPS, "codec": "H.264 yuv420p + AAC",
                  "duration_s": round(total, 3), "captions": srt_path.name, "music": None},
        "voice": ({"voice": a.voice, "speed": a.speed, **tts.PROVENANCE,
                   "human_review_required": "A native Hebrew listener must approve the narration before anything "
                                            "is published."} if voiced else None),
        "timing": ({"lead_s": LEAD_S, "gap_s": GAP_S, "tail_s": TAIL_S} if voiced
                   else {"chars_per_second": CPS, "min_scene_s": MIN_SCENE_S}),
        "font": {**FONT, "sha256": sha256(HERE / FONT["file"])},
        "tools": tool_versions(),
        "scenes": [],
        "end_card": {"lines": [ai_line if ln == spec["ai_line"] else ln for ln in S.end_card_lines(spec)],
                     "duration_s": end_dur, "start_s": timeline[-1]["start"],
                     "frame": f"frames/{frames[-1].name}",
                     "evidence": [evidence_record(ev, root) for ev in spec.get("end_card_evidence", [])]},
        "dropped_for_lack_of_source": spec.get("dropped_for_lack_of_source", []),
        "checks": {"spec_problems": [], "layout_problems": [], "ffprobe": probe},
    }
    for sc, seg, fp in zip(scenes, timeline, frames):
        rt = on_screen_chars(sc) / CPS
        manifest["scenes"].append({
            "id": sc["id"], "start_s": seg["start"], "duration_s": seg["duration"], "frame": f"frames/{fp.name}",
            "on_screen_title": sc["on_screen_title"], "on_screen_body": sc["on_screen_body"],
            "narration": [{k: v for k, v in c.items()} for c in seg["cues"]],
            "reading_time_at_14cps_s": round(rt, 1), "dense": rt > seg["duration"],
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
