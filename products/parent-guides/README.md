# parent-guides

A small renderer for faceless Hebrew parent-guide videos (1080x1920, H.264 + AAC), under the brand **מהודק**.
A spec is a script plus machine-checked evidence; the renderer draws one frame per scene with generic, abstract
art, narrates it with a synthetic voice, and assembles the video, an `.srt` and a `manifest.json`.

**Status: the first sample is held unpublished. There is no upload code.** Nothing here is posted anywhere.

## Run

```bash
./setup.sh                                                  # venv + pinned Kokoro models (sha256-checked)
.venv/bin/python render.py specs/yt-kids-setup.he.json --out out            # narrated
.venv/bin/python render.py specs/yt-kids-setup.he.json --out out --voice none  # silent, timed by text length
.venv/bin/python -m pytest -q tests
# optional intelligibility gate (needs sherpa-onnx and the Whisper model, see setup.sh):
.venv/bin/python asr_gate.py out/manifest.json --model-dir .cache/asr/sherpa-onnx-whisper-turbo
```

`--models DIR` points at an existing copy of the two Kokoro files instead of `.cache/models`.

## What it refuses (exit 2, before writing anything)

`spec.py` is standard-library only, so the refusal works on a bare machine:

- a scene or end card with **no evidence**, or evidence that does not hold: every entry must name a file under
  `research/rendered/` whose `.meta.json` says HTTP 200, and carry its quote on the cited line (fixed-string, as
  `grep -F`);
- **a number** in the on-screen text, narration or captions that is not in the scene's quotes, unless declared and
  checked: the `N.` step prefix (steps must run 1..N), the video's own step count, the capture date (must equal the
  UTC date of every cited capture's `fetchedAt`), or an illustrative number on an illustration label only;
- an **unvowelised narration line** (the voice needs nikud), or a caption that is not its narration line in
  standard spelling (only added ו/י allowed; the product name may be in Latin letters);
- an end card without the **AI line** or the **non-affiliation line**.

Layout problems (a text box outside the 96 px margin or the safe area, two boxes closer than 12 px, a title that
needs three lines, an illustration with no room) stop the render with exit 3 and leave the frames to inspect.

## Pieces

| File | Job |
|---|---|
| `spec.py` | load and validate a spec (stdlib only) |
| `canvas.py` | palette, fonts, right-to-left text (raqm, or python-bidi fallback), balanced wrapping, 2x supersampling |
| `art.py` | the generic illustrations: phone, key, calendar, padlock, magnifier, stopwatch, flag, tiles |
| `frame.py` | scene and end-card layout, with the collision and margin checks |
| `tts.py` | Hebrew narration: Phonikud IPA -> Kokoro-82M, sha256-pinned model files |
| `render.py` | the CLI: validate -> frames -> narration -> ffmpeg -> `.srt` + `manifest.json` |
| `asr_gate.py` | optional Whisper round-trip per narration line (CER on Hebrew letters) |
| `specs/` | one JSON per video; `yt-kids-setup.he.json` is the first sample |

## Mandate notes

- ₪0: every tool is free and local; nothing calls a paid API.
- Faceless: no face, no human voice; the narration is synthetic and the screen says so on every frame.
- The only public name is **מהודק**. The owner's name appears nowhere in output or metadata.
- Honest value: every fact is quoted from a first-party capture; see `LICENSES.md` for the trademark note.
- **A native Hebrew listener must approve the narration before anything is published** (the ASR gate is a proxy).
