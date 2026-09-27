"""The web comparison arm (T1-PROTOCOL order item 4): the same analysis as one static HTML page.

Same question, same filled text, same charts, same figures and attribution as the video, built from the same spec so
the two arms cannot drift apart. It is not deployed: that waits on the brand domain (owner step 5). The brand name is
the placeholder `{{BRAND}}` (as in src/revenue/bounties/disclosure.ts); no brand, owner or personal name is written.

Self-contained: the charts are inlined as data URIs, the CSS is inline, and there is no script, font, pixel, iframe or
any other request to a third party — so there is nothing to track anyone with.
"""

from __future__ import annotations

import base64
import html
from pathlib import Path
from typing import Any

from figures import Figure, FilledSpec, placeholders

BRAND_PLACEHOLDER = "{{BRAND}}"

_CSS = """
:root { color-scheme: light; --surface: #fcfcfb; --text: #0b0b0b; --text-2: #52514e; --rule: #e4e3df; }
* { box-sizing: border-box; }
body { margin: 0; background: var(--surface); color: var(--text);
  font: 18px/1.6 "DejaVu Sans", system-ui, -apple-system, "Segoe UI", sans-serif; }
header, main, footer { max-width: 60rem; margin: 0 auto; padding: 0 16px; }
header { padding-top: 24px; color: var(--text-2); font-size: 15px; }
h1 { font-size: clamp(28px, 5vw, 40px); line-height: 1.2; margin: 24px 0 8px; }
h2 { font-size: 22px; margin: 40px 0 8px; }
.lede { color: var(--text-2); }
figure { margin: 32px 0 8px; }
figure img { width: 100%; height: auto; display: block; border: 1px solid var(--rule); }
figcaption { color: var(--text-2); font-size: 15px; margin-top: 6px; }
.table-wrap { overflow-x: auto; }
table { border-collapse: collapse; width: 100%; font-size: 15px; }
th, td { text-align: left; vertical-align: top; padding: 6px 8px; border-bottom: 1px solid var(--rule); }
code { font-size: 14px; overflow-wrap: anywhere; }
footer { color: var(--text-2); font-size: 15px; padding-bottom: 40px; margin-top: 40px; }
"""


def _e(s: Any) -> str:
    return html.escape(str(s), quote=True)


def _img(path: Path) -> str:
    return "data:image/png;base64," + base64.b64encode(Path(path).read_bytes()).decode("ascii")


def build_page(spec: dict[str, Any], filled: FilledSpec, figs: dict[str, Figure], charts: dict[str, Path]) -> str:
    d = spec["dataset"]
    used = sorted({n for s in spec["scenes"] for n in placeholders(s["narration"])})
    sections = []
    for s in filled.scenes:
        sections.append(
            f"<section id=\"{_e(s['id'])}\">\n"
            f"<figure><img src=\"{_img(charts[s['id']])}\" width=\"1920\" height=\"1080\" alt=\"{_e(s['alt'])}\">"
            f"<figcaption>{_e(s['chartTitle'])}</figcaption></figure>\n"
            f"<p>{_e(s['narration'])}</p>\n</section>"
        )
    rows = "\n".join(
        f"<tr><td><code>{_e(n)}</code></td><td>{_e(figs[n].text)}</td><td>{_e(figs[n].description)}</td></tr>"
        for n in used
    )
    statements = "\n".join(f"<li>“{_e(s['quote'])}” — {_e(s['where'])}</li>" for s in d["licenceStatements"])
    excluded = ", ".join(spec["params"]["excludeEconomies"])
    return f"""<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{_e(filled.title)} — {BRAND_PLACEHOLDER}</title>
<meta name="description" content="{_e(spec['question'])} An analysis computed from {_e(d['name'])} ({_e(d['licence'])}).">
<style>{_CSS}</style>
</head>
<body>
<header>{BRAND_PLACEHOLDER}</header>
<main>
<article>
<h1>{_e(filled.title)}</h1>
<p class="lede">Every chart and every number below is computed by code from one public file:
{_e(d['name'])}, <code>{_e(d['file'])}</code>. Nothing here is advice.</p>
{chr(10).join(sections)}
<section id="figures">
<h2>How every number was computed</h2>
<p>Each number in the text is a named figure, computed from the data with its rounding stated; none is typed by hand.</p>
<div class="table-wrap"><table>
<thead><tr><th>Figure</th><th>Value</th><th>How it is computed</th></tr></thead>
<tbody>
{rows}
</tbody></table></div>
</section>
<section id="data">
<h2>Data and licence</h2>
<p>Data: <a href="{_e(d['homepage'])}">{_e(d['name'])}</a>, <code>{_e(d['file'])}</code> at commit
<code>{_e(d['commit'])}</code> (sha256 <code>{_e(d['sha256'])}</code>). Licence: {_e(d['licence'])}
(Creative Commons CC0 1.0 Universal), as GitHub states it:</p>
<ul>
{statements}
</ul>
<p>The {_e(excluded)} aggregate is excluded because it repeats its member states. The data covers public activity
only. GitHub did not produce, endorse or approve this page.</p>
</section>
<section id="method">
<h2>How this page was made</h2>
<p>The text was written by an AI system; every number in it is filled in from the computed figures above. The charts
are drawn by code (matplotlib) from the data. The same analysis is also made as a video narrated by a synthetic voice
(Kokoro text-to-speech), not a recording of any person.</p>
</section>
</article>
</main>
<footer>{BRAND_PLACEHOLDER}</footer>
</body>
</html>
"""
