"""Render one analysis spec end to end: data -> figures -> charts -> narration -> MP4 + SRT -> page -> manifest.

    python render.py analyses/t1.json --out out/t1
    python render.py analyses/t1.json --out out/t1 --clock-start "$(date +%s)"   # runner: count the whole job

Writes, under --out: <id>.mp4, <id>.srt, charts/*.png, page/index.html, figures.json, manifest.json,
manifest.notes.json and render-report.json. Nothing is uploaded or published: this program has no network code
beyond fetch.py's pinned, hash-checked downloads from GitHub.

Exit status is non-zero, and no manifest is written, when a claim is false for the data, a template holds a
hand-typed number, a download does not match its hash, or the video falls outside the spec's duration bounds.
"""

from __future__ import annotations

import argparse
import hashlib
import json
import sys
import time
from datetime import datetime, timezone
from pathlib import Path

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE))

import assemble  # noqa: E402
import charts  # noqa: E402
import fetch  # noqa: E402
import figures  # noqa: E402
import manifest  # noqa: E402
import page  # noqa: E402
import tts  # noqa: E402


class RenderError(RuntimeError):
    pass


def _write_json(path: Path, data) -> None:
    path.write_text(json.dumps(data, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")


def render(spec_path: Path, out: Path, clock_start: float | None, repo_root: Path, token_cost_ils: float) -> dict:
    started = time.time()
    clock_from = clock_start if clock_start is not None else started
    steps: dict[str, float] = {}

    def lap(name: str, t0: float) -> float:
        steps[name] = round(time.time() - t0, 2)
        return time.time()

    spec = json.loads(Path(spec_path).read_text(encoding="utf-8"))
    video = spec["video"]
    out.mkdir(parents=True, exist_ok=True)

    t = time.time()
    csv_path = fetch.fetch_dataset(spec["dataset"])
    t = lap("fetchDataset", t)

    data = figures.load_languages(csv_path, spec["params"]["excludeEconomies"])
    an = figures.Analysis(data, spec["params"])
    figs = figures.compute_figures(an)
    claims = figures.check_claims(an, figs)
    filled = figures.fill_spec(spec, figs)
    untraced = figures.untraced_numbers(filled.script, figs)
    if untraced:
        raise RenderError(f"numbers in the narration no figure accounts for: {untraced}")
    _write_json(out / "figures.json", figures.figures_json(figs, claims, spec, an))
    t = lap("figures", t)

    images = []
    for s in filled.scenes:
        images.append(charts.render_scene_chart(s, an, figs, spec, out / "charts" / f"{s['id']}.png"))
    t = lap("charts", t)

    model, voices = tts.ensure_models()
    t = lap("fetchModels", t)
    engine = tts.load_engine(model, voices)
    audios = [tts.synthesize_scene(engine, s["narration"], spec["voice"], int(video["fps"])) for s in filled.scenes]
    t = lap("narration", t)

    tl = assemble.build_timeline([s["id"] for s in filled.scenes], images, audios)
    if not video["minSeconds"] <= tl.duration <= video["maxSeconds"]:
        raise RenderError(f"video is {tl.duration:.2f}s; the spec allows {video['minSeconds']}-{video['maxSeconds']}s")
    mp4 = assemble.assemble(tl, audios, out / f"{spec['id']}.mp4", int(video["width"]), int(video["height"]),
                            out / "work")
    (out / f"{spec['id']}.srt").write_text(assemble.srt_text(tl.cues), encoding="utf-8")
    t = lap("assemble", t)

    probe = assemble.probe(mp4)
    (out / "page").mkdir(exist_ok=True)
    (out / "page" / "index.html").write_text(
        page.build_page(spec, filled, figs, {s["id"]: p for s, p in zip(filled.scenes, images)}), encoding="utf-8")
    t = lap("probeAndPage", t)

    finished = time.time()
    runner_minutes = (finished - clock_from) / 60
    scheduled_at = datetime.fromtimestamp(finished, timezone.utc).isoformat(timespec="seconds").replace("+00:00", "Z")
    m = manifest.build_manifest(spec, filled, runner_minutes=runner_minutes, token_cost_ils=token_cost_ils,
                                scheduled_at=scheduled_at)
    report = {
        "analysis": spec["id"],
        "renderedAt": scheduled_at,
        "clockStartedBy": "--clock-start (job start)" if clock_start is not None else "render.py start",
        "renderWallMinutes": round((finished - started) / 60, 3),
        "runnerMinutes": m["runnerMinutes"],
        "steps": steps,
        "durationSeconds": tl.duration,
        "totalFrames": tl.total_frames,
        "fps": tl.fps,
        "narrationSampleRate": tl.sample_rate,
        "scenes": [
            {"id": p.scene_id, "startSeconds": p.start, "seconds": p.duration, "frames": p.frames,
             "audioSeconds": a.duration, "sentences": len(a.sentences)}
            for p, a in zip(tl.scenes, audios)
        ],
        "words": len(filled.script.split()),
        "mp4": {"path": mp4.name, "bytes": mp4.stat().st_size,
                "sha256": hashlib.sha256(mp4.read_bytes()).hexdigest()},
        "probe": probe,
        "licenceSnapshotPresent": (repo_root / spec["dataset"]["licenceSnapshot"]).exists(),
        "tts": tts.PROVENANCE,
        "music": None,
    }
    m, audit_notes = manifest.merge_audits(m)
    _write_json(out / "manifest.json", m)
    _write_json(out / "manifest.notes.json", {**manifest.build_notes(m, report), **audit_notes})
    _write_json(out / "render-report.json", report)
    return report


def main(argv: list[str] | None = None) -> int:
    ap = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    ap.add_argument("spec", type=Path)
    ap.add_argument("--out", type=Path, required=True)
    ap.add_argument("--clock-start", type=float, default=None,
                    help="epoch seconds when the job started, so runnerMinutes covers setup too (G9)")
    ap.add_argument("--repo-root", type=Path, default=HERE.parent.parent)
    ap.add_argument("--token-cost-ils", type=float, default=0.0)
    a = ap.parse_args(argv)
    try:
        report = render(a.spec, a.out, a.clock_start, a.repo_root, a.token_cost_ils)
    except (RenderError, figures.FigureError, fetch.FetchError, assemble.AssembleError) as e:
        print(f"render failed: {e}", file=sys.stderr)
        return 1
    print(json.dumps({k: report[k] for k in ("analysis", "durationSeconds", "runnerMinutes", "steps", "mp4")},
                     indent=2))
    return 0


if __name__ == "__main__":
    sys.exit(main())
