#!/usr/bin/env bash
# One-time setup: a Python 3.11 venv with the pinned requirements, and the two Kokoro model files from their
# GitHub release, checked against the pinned sha256 values (tts.py). Everything lands in .venv/ and .cache/,
# both gitignored. Costs nothing; needs PyPI and github.com once, no network afterwards.
set -euo pipefail
cd "$(dirname "$0")"

PY="${PYTHON:-python3.11}"
if [ ! -x .venv/bin/python ]; then
  "$PY" -m venv .venv
fi
.venv/bin/pip install -q -r requirements-dev.txt

mkdir -p .cache/models
R=https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0
fetch() {
  local name="$1" want="$2"
  if [ ! -f ".cache/models/$name" ]; then
    curl -sSfL -o ".cache/models/$name.part" "$R/$name"
    mv ".cache/models/$name.part" ".cache/models/$name"
  fi
  echo "$want  .cache/models/$name" | sha256sum -c -
}
fetch kokoro-v1.0.onnx 7d5df8ecf7d4b1878015a32686053fd0eebe2bc377234608764cc0ef3636a6c5
fetch voices-v1.0.bin bca610b8308e8d99f32e6fe4197e7ec01679264efed0cac9140fe9c29f1fbf7d

# Optional: the ASR gate (asr_gate.py) - uncomment to install.
# .venv/bin/pip install -q sherpa-onnx==1.13.8
# mkdir -p .cache/asr && curl -sSfL https://github.com/k2-fsa/sherpa-onnx/releases/download/asr-models/sherpa-onnx-whisper-turbo.tar.bz2 | tar xj -C .cache/asr
echo "ready: .venv/bin/python render.py specs/yt-kids-setup.he.json --out out"
