# T1 — gate-passed, held unpublished (27.9.2026)

The evidence of the render that passed `checkPublication()` G1-G10 with 0 failures. The MP4 itself is not in git
(4.4 MB); it is re-rendered byte-identical from this repository, and pinned here by its sha256.

- Question: "Is TypeScript catching up with JavaScript on GitHub?", from GitHub Innovation Graph `languages.csv` at
  commit `078fb62e`, CC0 (`research/rendered/github-innovationgraph-licence.txt`).
- Script sha256 `bf98a1b066eab0b8ca26a474759e9a3fa0e5cfccbb47a7cfd6a5fed1e17a86a6`, to which all three auditor verdicts
  are bound (`../../audits/`): G3 originality PASS, G4 fact-check PASS (25 narration + 61 chart figures recomputed
  independently), G5 promise PASS. Revision 1 answered every required change from the first audit.
- MP4 sha256 `2928927139a7bc0de2fa7562803d23b93e771ebb72b12154b71eab59b773baf6`, 116.73 s, 1920x1080 h264 + aac mono.
- `narration.voicesFile` / `modelFile` (`voices-v1.0.bin`, `kokoro-v1.0.onnx`) were added to `manifest.json` on
  30.9.2026 without a re-render, when the gate's P-1 began to require them (ruling 30.9 16(c) item 7): they are
  `tts.py`'s sha256-pinned files, the only ones the render could load; `manifest.notes.json` says so.
- Re-render: `python render.py analyses/t1.json --out out/t1` (models and data are fetched by sha256), then
  `python manifest.py out/t1` and `npx tsx scripts/publication-check.ts products/chart-explainer/out/t1/manifest.json`.

Held unpublished on purpose. Per RED-TEAM §2.5 the next step is the web comparison arm (this `page.html`, on the brand
domain — owner step 5), read at day 56, and only then Stage A is put to the owner. `scheduledAt` is the render time,
not a schedule; the publish step must re-run the gate with the real time.
