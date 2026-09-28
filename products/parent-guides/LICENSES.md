# Licences of what this renderer uses

Nothing here is paid, and nothing is redistributed that its licence does not allow.

| Component | Where | Licence | Notes |
|---|---|---|---|
| Heebo variable font (`fonts/heebo/Heebo[wght].ttf`) | vendored in this directory | SIL Open Font License 1.1 (`fonts/heebo/OFL.txt`) | Copyright 2014 The Heebo Project Authors (https://github.com/OdedEzer/heebo); designer Oded Ezer. Fetched from `https://raw.githubusercontent.com/google/fonts/main/ofl/heebo/Heebo%5Bwght%5D.ttf`, sha256 `18f930b583fa8fe6b40b2f8263b7ac6afbac07adc91a12467874e7467d3ace30`; Google Fonts' `METADATA.pb` kept beside it. The OFL allows bundling and embedding; the font is not sold on its own. |
| Kokoro-82M weights (`kokoro-v1.0.onnx`, `voices-v1.0.bin`) | downloaded by `setup.sh` into `.cache/models/`, never committed | Apache-2.0 (`research/rendered/kokoro-82m-model-card.txt:53`) | The model card records training on synthetic audio from closed TTS models (`research/rendered/kokoro-82m-model-card.txt:233`). |
| kokoro-onnx 0.6.1 | pip | MIT | Copyright (c) 2025 github.com/thewh1teagle |
| Phonikud 0.4.1 (Hebrew G2P) | pip | **CC BY 4.0 - attribution required** | Attribution, as carried in every manifest: *Phonikud by thewh1teagle, https://github.com/thewh1teagle/phonikud, CC BY 4.0*. Used unmodified; this repo maps its IPA output onto Kokoro's symbols (`tts.kokoro_hebrew`). |
| onnxruntime 1.30.0 | pip | MIT | |
| Pillow 12.3.0 (bundles libraqm, FriBiDi, HarfBuzz) | pip | MIT-CMU (HPND); raqm MIT, FriBiDi LGPL-2.1, HarfBuzz MIT | Dynamic use only, nothing redistributed. |
| python-bidi 0.6.11 | pip | LGPL-3.0 | Fallback text path only (engine `basic`). |
| numpy, soundfile | pip | BSD-3-Clause | |
| ffmpeg / ffprobe | the system's | LGPL/GPL (build-dependent) | Called as an external program, not distributed. |
| Whisper large-v3-turbo via sherpa-onnx (optional ASR gate) | GitHub release `k2-fsa/sherpa-onnx` `asr-models` | Whisper MIT; sherpa-onnx Apache-2.0 | Only for `asr_gate.py`; not needed to render. |

**No music** is used. **No stock** footage or images are used: every picture is drawn in code (`art.py`).

**Trademarks.** YouTube and YouTube Kids are trademarks of Google LLC. The videos name them only to say what
they are about (nominative use): no logo, no screenshot of the app, no imitation of its visual identity
(no red, no play-button shape), and every end card states that the video is independent and not affiliated with
YouTube or Google.
