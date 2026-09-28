"""ASR round-trip gate for a rendered parent guide: an intelligibility proxy, NOT a listening test.

    python asr_gate.py out/manifest.json --model-dir DIR [--max-cer 0.05]

Reads every narration line file render.py wrote (out/audio/lines/<scene>-<n>.wav: the line alone plus a 0.6 s tail),
transcribes it with Whisper large-v3-turbo (int8 ONNX via sherpa-onnx), and scores the character error rate on Hebrew
letters against the line's caption (the narration in standard spelling). "YouTube Kids" is scored as יוטיוב קידס
whichever script Whisper writes it in. Writes <out>/asr_gate.json and exits 1 if any line fails.

Model: GitHub release k2-fsa/sherpa-onnx `asr-models`, sherpa-onnx-whisper-turbo.tar.bz2 (Whisper: MIT; sherpa-onnx:
Apache-2.0). Optional dependency, not in requirements.txt: pip install sherpa-onnx==1.13.8 soundfile.
Adapted from the voice prototype's asr_gate.py (28.9.2026).
"""

from __future__ import annotations

import argparse
import json
import re
import sys
from pathlib import Path

BRAND = [(r"(?i)you\s*tube", "יוטיוב"), (r"(?i)kids", "קידס"), (r"יו טיוב", "יוטיוב"), (r"קידז", "קידס")]


def heb(s: str) -> str:
    for pat, rep in BRAND:
        s = re.sub(pat, rep, s)
    return re.sub(r"[^א-ת]", "", s)


def lev(a: str, b: str) -> int:
    p = list(range(len(b) + 1))
    for i, ca in enumerate(a, 1):
        c = [i]
        for j, cb in enumerate(b, 1):
            c.append(min(p[j] + 1, c[j - 1] + 1, p[j - 1] + (ca != cb)))
        p = c
    return p[-1]


def cer(ref: str, hyp: str) -> float:
    r = heb(ref)
    return lev(r, heb(hyp)) / max(1, len(r))


def main(argv=None) -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("manifest")
    ap.add_argument("--model-dir", required=True)
    ap.add_argument("--max-cer", type=float, default=0.05)
    a = ap.parse_args(argv)

    import sherpa_onnx
    import soundfile as sf

    d = Path(a.model_dir)
    rec = sherpa_onnx.OfflineRecognizer.from_whisper(
        encoder=str(d / "turbo-encoder.int8.onnx"), decoder=str(d / "turbo-decoder.int8.onnx"),
        tokens=str(d / "turbo-tokens.txt"), language="he", task="transcribe", num_threads=4)
    mpath = Path(a.manifest)
    out = mpath.parent
    m = json.loads(mpath.read_text(encoding="utf-8"))
    rows, failed = [], 0
    for sc in m["scenes"]:
        for j, cue in enumerate(sc["narration"], 1):
            wav = out / "audio" / "lines" / f"{sc['id']}-{j}.wav"
            x, sr = sf.read(wav, dtype="float32")
            st = rec.create_stream()
            st.accept_waveform(sr, x)
            rec.decode_stream(st)
            hyp = st.result.text.strip()
            c = cer(cue["caption"], hyp)
            ok = c <= a.max_cer
            failed += not ok
            rows.append({"line": f"{sc['id']}-{j}", "reference": cue["caption"], "asr": hyp, "cer": round(c, 3),
                         "pass": ok})
            print(f"{'PASS' if ok else 'FAIL'} CER={c:.3f} {sc['id']}-{j}  ASR: {hyp}")
    worst = max(rows, key=lambda r: r["cer"])
    summary = {"max_cer": a.max_cer, "lines": len(rows), "failed": failed, "worst": worst, "rows": rows,
               "note": "Whisper round-trip, an intelligibility proxy. A native Hebrew listener must still approve."}
    (out / "asr_gate.json").write_text(json.dumps(summary, ensure_ascii=False, indent=1), encoding="utf-8")
    print(f"{len(rows) - failed}/{len(rows)} lines pass at CER <= {a.max_cer}; worst {worst['line']} {worst['cer']}")
    return 1 if failed else 0


if __name__ == "__main__":
    sys.exit(main())
