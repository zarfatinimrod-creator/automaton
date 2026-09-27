"""Put each scene's chart on screen for exactly as long as its narration, then write the MP4 and the SRT sidecar.

Frame-exact by construction: `tts.synthesize_scene` pads every scene's audio to a whole number of video frames, and
here each chart is looped and trimmed to that many frames (`trim=end_frame=N`), so scene i lasts
frames_i / fps == samples_i / sample_rate seconds, with no rounding at the joins. The scene audio is concatenated
sample-exactly in numpy and encoded once, so there are no AAC seams between scenes. No music track exists.
"""

from __future__ import annotations

import json
import re
import shutil
import subprocess
import textwrap
from dataclasses import dataclass, field
from pathlib import Path

import numpy as np

from tts import SceneAudio, write_wav


class AssembleError(RuntimeError):
    pass


def ffmpeg_exe() -> str:
    import imageio_ffmpeg

    return imageio_ffmpeg.get_ffmpeg_exe()


@dataclass(frozen=True)
class Placement:
    scene_id: str
    image: Path
    start_frame: int
    frames: int
    fps: int

    @property
    def start(self) -> float:
        return self.start_frame / self.fps

    @property
    def duration(self) -> float:
        return self.frames / self.fps


@dataclass(frozen=True)
class Cue:
    start: float
    end: float
    text: str


@dataclass
class Timeline:
    fps: int
    sample_rate: int
    scenes: list[Placement] = field(default_factory=list)
    cues: list[Cue] = field(default_factory=list)

    @property
    def total_frames(self) -> int:
        return sum(p.frames for p in self.scenes)

    @property
    def duration(self) -> float:
        return self.total_frames / self.fps


def build_timeline(scene_ids: list[str], images: list[Path], audios: list[SceneAudio]) -> Timeline:
    if not (len(scene_ids) == len(images) == len(audios)) or not audios:
        raise AssembleError("one image and one audio per scene")
    fps, sr = audios[0].fps, audios[0].sample_rate
    tl = Timeline(fps=fps, sample_rate=sr)
    cursor = 0
    for sid, img, audio in zip(scene_ids, images, audios):
        if audio.fps != fps or audio.sample_rate != sr:
            raise AssembleError(f"scene {sid}: fps/sample rate differ from the first scene")
        placement = Placement(sid, Path(img), cursor, audio.frames, fps)
        if abs(placement.duration - audio.duration) > 1e-9:
            raise AssembleError(f"scene {sid}: image {placement.duration}s != narration {audio.duration}s")
        tl.scenes.append(placement)
        for s in audio.sentences:
            tl.cues.append(Cue(placement.start + s.start, placement.start + s.end, s.text))
        cursor += audio.frames
    return tl


def _srt_time(t: float) -> str:
    ms = int(round(t * 1000))
    h, ms = divmod(ms, 3_600_000)
    m, ms = divmod(ms, 60_000)
    s, ms = divmod(ms, 1000)
    return f"{h:02d}:{m:02d}:{s:02d},{ms:03d}"


def srt_text(cues: list[Cue], width: int = 42, max_lines: int = 2) -> str:
    """One cue per sentence, split into two-line blocks when a sentence is long; a split shares the sentence's
    measured span by character count (the only estimate here — sentence boundaries themselves are measured)."""
    blocks: list[tuple[float, float, str]] = []
    for c in cues:
        lines = textwrap.wrap(c.text, width=width)
        groups = [lines[i : i + max_lines] for i in range(0, len(lines), max_lines)]
        total = sum(len(" ".join(g)) for g in groups)
        t = c.start
        for i, g in enumerate(groups):
            end = c.end if i == len(groups) - 1 else t + (c.end - c.start) * len(" ".join(g)) / total
            blocks.append((t, end, "\n".join(g)))
            t = end
    return "\n".join(f"{i}\n{_srt_time(a)} --> {_srt_time(b)}\n{txt}\n" for i, (a, b, txt) in enumerate(blocks, 1))


def filter_graph(frames: list[int], width: int, height: int) -> str:
    parts = [
        f"[{i}:v]trim=end_frame={n},setpts=PTS-STARTPTS,scale={width}:{height},setsar=1,format=yuv420p[v{i}]"
        for i, n in enumerate(frames)
    ]
    joined = "".join(f"[v{i}]" for i in range(len(frames)))
    return ";".join(parts) + f";{joined}concat=n={len(frames)}:v=1:a=0[v]"


def assemble(tl: Timeline, audios: list[SceneAudio], out_mp4: Path, width: int, height: int,
             workdir: Path) -> Path:
    workdir.mkdir(parents=True, exist_ok=True)
    audio = np.concatenate([a.samples for a in audios])
    if len(audio) * tl.fps != tl.total_frames * tl.sample_rate:
        raise AssembleError("narration length and video length differ")
    wav = workdir / "narration.wav"
    write_wav(wav, audio, tl.sample_rate)
    cmd = [ffmpeg_exe(), "-y", "-hide_banner", "-loglevel", "error"]
    for p in tl.scenes:
        cmd += ["-loop", "1", "-framerate", str(tl.fps), "-i", str(p.image)]
    cmd += ["-i", str(wav)]
    cmd += [
        "-filter_complex", filter_graph([p.frames for p in tl.scenes], width, height),
        "-map", "[v]", "-map", f"{len(tl.scenes)}:a",
        "-c:v", "libx264", "-preset", "medium", "-crf", "18", "-tune", "stillimage", "-r", str(tl.fps),
        "-c:a", "aac", "-b:a", "192k", "-ar", "48000",
        "-movflags", "+faststart",
        str(out_mp4),
    ]
    run = subprocess.run(cmd, capture_output=True, text=True)
    if run.returncode != 0:
        raise AssembleError(f"ffmpeg failed: {run.stderr[-1500:]}")
    return out_mp4


def probe(path: Path) -> dict:
    """Duration, resolution and codecs. ffprobe when it is installed; otherwise the bundled ffmpeg's own report."""
    ffprobe = shutil.which("ffprobe")
    if ffprobe:
        run = subprocess.run(
            [ffprobe, "-v", "error", "-show_entries",
             "format=duration,size,format_name:stream=codec_type,codec_name,profile,width,height,r_frame_rate,"
             "nb_frames,sample_rate,channels,pix_fmt,display_aspect_ratio", "-of", "json", str(path)],
            capture_output=True, text=True, check=True)
        data = json.loads(run.stdout)
        data["tool"] = "ffprobe"
        return data
    run = subprocess.run([ffmpeg_exe(), "-hide_banner", "-i", str(path), "-map", "0:v", "-c", "copy", "-f", "null",
                          "-"], capture_output=True, text=True)
    err = run.stderr
    dur = re.search(r"Duration: (\d+):(\d+):(\d+\.\d+)", err)
    video = re.search(r"Stream #\S+.*?: Video: (\w+).*?, (\w+)\(?.*?, (\d+)x(\d+)[^,]*(?:,[^,]*)*?, ([\d.]+) fps", err)
    audio = re.search(r"Stream #\S+.*?: Audio: (\w+).*?, (\d+) Hz, (\w+)", err)
    frames = re.findall(r"frame=\s*(\d+)", err)
    if not (dur and video and audio):
        raise AssembleError(f"could not read ffmpeg's report for {path}:\n{err[-1500:]}")
    h, m, s = dur.groups()
    return {
        "tool": "ffmpeg -i (ffprobe not installed)",
        "format": {"duration": f"{int(h) * 3600 + int(m) * 60 + float(s):.3f}", "size": str(path.stat().st_size)},
        "streams": [
            {"codec_type": "video", "codec_name": video.group(1), "pix_fmt": video.group(2),
             "width": int(video.group(3)), "height": int(video.group(4)), "r_frame_rate": video.group(5),
             "nb_frames": frames[-1] if frames else None},
            {"codec_type": "audio", "codec_name": audio.group(1), "sample_rate": audio.group(2),
             "channels": audio.group(3)},
        ],
    }
