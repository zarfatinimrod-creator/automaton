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
  checked: the `N.` step prefix (steps must run 1..N; consecutive scenes may share a number as pages of one step),
  the video's own step count, the capture date (must equal the **Israel-time** date of every cited capture's
  `fetchedAt`: 22:00 UTC on 28.9 is 01:00 on 29.9 in Israel), or an illustrative number on an illustration label only;
- **a quote from a Computer-tab capture** (title " - מחשב - " / " - Computer - ") without a `desktop_ok` reason: the
  app's steps differ by device, and a desktop step chain drawn beside a phone is wrong;
- an **unvowelised narration line** (the voice needs nikud), or a caption that is not its narration line in
  standard spelling (only added ו/י allowed; the product name may be in Latin letters);
- an end card without the **AI line** or the **non-affiliation line**; a spec without the independence tag, or
  whose series line does not open with the brand.

Layout problems (a text box outside the 120 px side margins or the safe area y 180-1500, two boxes closer than
12 px, a title that needs three lines, an illustration with no room) stop the render with exit 3 and leave the frames
to inspect. The safe area keeps everything clear of what Shorts, Reels and TikTok draw over a video: their tabs at
the top, their caption, channel name and sound ticker in the bottom 420 px, and their button column at the right. The
tag "סרטון עצמאי · נוצר בעזרת AI · קריינות סינתטית" sits at the top of every frame, and the header opens with the
brand.

**Reading time (exit 4).** Every scene must stay up long enough to read all its text at 14 characters a second
(title, body, footnotes and illustration labels; a later page of a step does not re-count its repeated title). A
narrated scene may hold at most 1 s of silence after its last line for that; a scene that needs more is refused,
and the fix is less text or more narration.

**Sound and colour.** The mono narration goes to both channels at full level and is loudness-normalised in two
passes (-14 LUFS integrated, true peak under -1.5 dBTP after AAC); the manifest records the measured values. Frames
are converted with the BT.709 matrix and the file is tagged BT.709, which is what phones and browsers assume for HD
video.

## Pieces

| File | Job |
|---|---|
| `spec.py` | load and validate a spec (stdlib only) |
| `canvas.py` | palette, fonts, right-to-left text (raqm, or python-bidi fallback), balanced wrapping, 2x supersampling |
| `art.py` | the generic illustrations: phone, key, calendar, padlock, magnifier, stopwatch, flag, tiles |
| `frame.py` | scene and end-card layout, with the collision and margin checks |
| `tts.py` | Hebrew narration: Phonikud IPA -> Kokoro-82M, sha256-pinned model files |
| `render.py` | the CLI: validate -> frames -> narration -> ffmpeg -> `.srt` + `manifest.json` |
| `asr_gate.py` | optional Whisper round-trip per narration line: CER on Hebrew letters, and negations, number words and person forms must be heard exactly |
| `specs/` | one JSON per video; `yt-kids-setup.he.json` is the first sample |

## Mandate notes

- ₪0: every tool is free and local; nothing calls a paid API.
- Faceless: no face, no human voice; the narration is synthetic and the screen says so on every frame.
- The only public name is **מהודק**. The owner's name appears nowhere in output or metadata.
- Honest value: every fact is quoted from a first-party capture; see `LICENSES.md` for the trademark note.
- **A native Hebrew listener must approve the narration before anything is published** (the ASR gate is a proxy).
