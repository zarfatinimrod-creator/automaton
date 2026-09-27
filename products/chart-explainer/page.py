"""The web comparison arm (T1-PROTOCOL order item 4): the same analysis as one static HTML page.

Same question, same filled text, same charts, same figures and attribution as the video, built from the same spec and
the same figures.json, so the two arms cannot drift apart. It is not deployed: that waits on the brand domain (owner
step 5). The page carries the brand from the spec (`page.brand`, decided in
research/measurements/brand-name-decision.md); the video carries none.

Self-contained: the charts are inlined as data URIs, the CSS is inline, and there is no script, font, pixel, iframe or
any other request to a third party — so there is nothing to track anyone with. The only links are to the sources.
"""

from __future__ import annotations

import base64
import html
from pathlib import Path
from typing import Any

from figures import FilledSpec, placeholders

_CSS = """
:root { color-scheme: light; --surface: #fcfcfb; --text: #0b0b0b; --text-2: #52514e; --rule: #e4e3df; }
* { box-sizing: border-box; }
body { margin: 0; background: var(--surface); color: var(--text);
  font: 18px/1.6 "DejaVu Sans", system-ui, -apple-system, "Segoe UI", sans-serif; }
header, main, footer { max-width: 60rem; margin: 0 auto; padding: 0 16px; }
header { padding-top: 24px; color: var(--text-2); font-size: 15px; font-weight: bold; }
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
blockquote { margin: 8px 0; padding-left: 12px; border-left: 3px solid var(--rule); color: var(--text-2); }
footer { color: var(--text-2); font-size: 15px; padding-bottom: 40px; margin-top: 40px; }
"""


def _e(s: Any) -> str:
    return html.escape(str(s), quote=True)


def _img(path: Path) -> str:
    return "data:image/png;base64," + base64.b64encode(Path(path).read_bytes()).decode("ascii")


def unrounded(value: Any, unit: str = "") -> str:
    """The raw value as computed: integers whole, floats to four decimals, quarters as 'YYYY Qn', and calendar
    years without a thousands separator (the G4 re-audit caught "2,020")."""
    if isinstance(value, list) and len(value) == 2:
        return f"{value[0]} Q{value[1]}"
    if isinstance(value, bool) or isinstance(value, str):
        return str(value)
    if isinstance(value, int):
        return str(value) if "year" in unit and "years" not in unit else f"{value:,}"
    return f"{value:,.4f}"


def rounding(entry: dict[str, Any]) -> str:
    if entry["rounding"] == "half-up":
        return f"half-up to {entry['decimals']} decimal{'s' if entry['decimals'] != 1 else ''}"
    return "none"


def _rows(entries: list[dict[str, Any]], with_chart: bool = False) -> str:
    out = []
    for e in entries:
        chart = f"<td>{_e(e['chart'])}</td>" if with_chart else ""
        out.append(
            f"<tr>{chart}<td><code>{_e(e['name'])}</code></td><td>{_e(e['text'])}</td>"
            f"<td>{_e(unrounded(e['value'], e.get('unit', '')))}</td><td>{_e(rounding(e))}</td><td>{_e(e['description'])}</td></tr>"
        )
    return "\n".join(out)


def build_page(spec: dict[str, Any], filled: FilledSpec, fj: dict[str, Any], charts: dict[str, Path]) -> str:
    """`fj` is figures.json as written by the render: the page shows exactly the numbers the video uses."""
    d = spec["dataset"]
    brand = spec["page"]["brand"]
    used = sorted({n for s in spec["scenes"] for n in placeholders(s["narration"])})
    by_name = {e["name"]: e for e in fj["figures"]}
    sections = []
    for s in filled.scenes:
        sections.append(
            f"<section id=\"{_e(s['id'])}\">\n"
            f"<figure><img src=\"{_img(charts[s['id']])}\" width=\"1920\" height=\"1080\" alt=\"{_e(s['alt'])}\">"
            f"<figcaption>{_e(s['chartTitle'])}</figcaption></figure>\n"
            f"<p>{_e(s['narration'])}</p>\n</section>"
        )
    head = "<tr><th>Figure</th><th>As shown</th><th>Unrounded value</th><th>Rounding</th><th>How it is computed</th></tr>"
    chart_head = "<tr><th>Chart</th>" + head.removeprefix("<tr>")
    external = []
    for src in spec.get("externalSources", {}).values():
        external.append(
            f"<li><a href=\"{_e(src['url'])}\">{_e(src['publisher'])}, “{_e(src['title'])}”</a>:"
            f"<blockquote>{_e(src['quote'])}</blockquote>"
            f"<small>Stored copy: <code>{_e(src['rendered'])}</code>, line {_e(src['line'])}.</small></li>"
        )
    citations = []
    for c in spec.get("citations", []):
        link = f" (<a href=\"{_e(c['url'])}\">source</a>)" if c.get("url") else ""
        citations.append(f"<li>“{_e(c['quote'])}” — <code>{_e(c['rendered'])}</code>, line {_e(c['line'])}{link}</li>")
    statements = "\n".join(f"<li>“{_e(s['quote'])}” — {_e(s['where'])}</li>" for s in d["licenceStatements"])
    excluded = ", ".join(spec["params"]["excludeEconomies"])
    return f"""<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{_e(filled.title)} — {_e(brand)}</title>
<meta name="description" content="{_e(spec['question'])} An analysis computed from {_e(d['name'])} ({_e(d['licence'])}).">
<style>{_CSS}</style>
</head>
<body>
<header>{_e(brand)}</header>
<main>
<article>
<h1>{_e(filled.title)}</h1>
<p class="lede">Every chart and every number below is computed by code from one public file:
{_e(d['name'])}, <code>{_e(d['file'])}</code>. The one exception is a statement quoted from GitHub's Octoverse report,
attributed where it appears. Nothing here is advice.</p>
{chr(10).join(sections)}
<section id="figures">
<h2>How every number was computed</h2>
<p>Each number in the text is a named figure computed from the data, shown here with its unrounded value and its
rounding; none is typed by hand. The year in the attributed Octoverse sentence is the source's own, not ours.</p>
<div class="table-wrap"><table>
<thead>{head}</thead>
<tbody>
{_rows([by_name[n] for n in used])}
</tbody></table></div>
<details>
<summary>Every number drawn on the charts ({len(fj.get('chartFigures', []))} figures)</summary>
<div class="table-wrap"><table>
<thead>{chart_head}</thead>
<tbody>
{_rows(fj.get('chartFigures', []), with_chart=True)}
</tbody></table></div>
</details>
</section>
<section id="sources">
<h2>Sources quoted</h2>
<ul>
{chr(10).join(external)}
{chr(10).join(citations)}
</ul>
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
<footer>{_e(brand)}</footer>
</body>
</html>
"""
