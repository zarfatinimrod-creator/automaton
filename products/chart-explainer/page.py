"""The web comparison arm (T1-PROTOCOL order item 4): the same analysis as one static HTML page.

Same question, same filled text, same charts, same figures and attribution as the video, built from the same spec and
the same figures.json, so the two arms cannot drift apart. It is not deployed: that waits on the brand domain (owner
step 5). The page carries the brand from the spec (`page.brand`, decided in
research/measurements/brand-name-decision.md); the video carries none.

Self-contained: the charts are inlined as data URIs and the CSS is inline; the only links are to the sources. The page
has two modes, chosen by build_page's keyword argument `counter`:

- Off (`counter=None`, the default). The page has no script, font, pixel, iframe or any other request to a third party,
  so there is nothing to track anyone with. The output is byte-identical to the page as it was before the counter
  existed (tests/fixtures/t1-page-no-counter.golden.html pins it), and releases/t1/page.html is this mode.
- On (`counter={"host": "https://eu.i.posthog.com" or "https://us.i.posthog.com", "key": "phc_..."}`). One small inline
  script is added, and nothing else is loaded: PostHog's JavaScript library is not used. The first time a visit scrolls
  the page, the script sends ONE anonymous `$pageview` event (a visit that never scrolls sends nothing, and so does a
  crawler that renders the page without scrolling — PREREG-DECISIONS.md §3) to PostHog's public single-event capture
  endpoint, `<host>/i/v0/e/`, carrying a random id drawn for that load and never kept,
  `"$process_person_profile": false`, and the page's address without its query string or fragment. It sets no cookie, writes nothing to browser storage, and reads nothing a
  fingerprint is made of (user agent, screen, fonts, canvas, language). The "How this page was made" section then says
  plainly that the page counts visits anonymously, without cookies, through PostHog, and stores nothing about the
  visitor. This is the cookieless page-view instrument RED-TEAM §2.1(c) allows as the web arm's K0-equivalent
  (research/faceless-youtube/RED-TEAM.md; research/channel-loop/BOARD-LOOP.md rank 5).

The key is PostHog's project token. It is public by design: it appears in the page source, and PostHog's own docs say
it is "ok" for it to be public — it captures events but "doesn't have access to your private data". The flip side,
also in PostHog's docs: anyone who copies it can post events to the project, so the count is what arrived, not proof of
who sent it. A personal API key (`phx_`) is the opposite — private, able to read and write the project's data — and is
refused by name. A key that is not `^phc_[A-Za-z0-9]{20,}$`, a host other than the two PostHog cloud ingestion hosts,
or a `counter` that is not exactly those two fields raises ValueError before any page is built (fail closed); the
error never repeats the key.

What the page cannot guarantee by itself: the browser's request reaches PostHog with the visitor's IP address, as any
request to any server does, and PostHog uses that address (and a GeoIP transformation) unless the project is set
otherwise. So before a page with the counter on is deployed, the PostHog project behind the key must have "Discard
client IP data" on and GeoIP enrichment off. The disclosure on the page says the project is set that way; this module
cannot check a project's settings, so whoever deploys it must.
"""

from __future__ import annotations

import base64
import html
import json
import re
from pathlib import Path
from typing import Any

from figures import FilledSpec, placeholders

# The counter follows PostHog's own documentation, read on 2026-09-28 through Context7 (library /posthog/posthog.com):
#
#   contents/docs/api/capture.mdx, "Single event": "[POST] <ph_client_api_host>/i/v0/e/" and "Every event request must
#     contain an `api_key`, `distinct_id`, and `event` field with the name. Both the `properties` and `timestamp` fields
#     are optional." Its curl example sends `--header "Content-Type: application/json"`.
#   contents/docs/api/capture.mdx, pageview: "event": "$pageview" with "properties": {"$current_url": ...}.
#   contents/docs/api/capture.mdx, anonymous events: "Capture anonymous events by setting the `$process_person_profile`
#     property to `false` in the event payload. If the provided `distinct_id` has ever been used with an identified
#     event, the event will still be treated as identified." (The id here is new on every load, so it never has been.)
#   contents/docs/api/index.mdx: "On US Cloud, these are `https://us.i.posthog.com` for public endpoints ... On EU
#     Cloud, these are `https://eu.i.posthog.com` for public endpoints".
#   contents/docs/_snippets/exposed-api-keys.mdx: "It is **ok** for your **project token** (starts with `phc_`) to be
#     public. ... Your **personal API key** (starts with `phx_`), however, should **NOT** be public as it enables
#     reading and writing potentially private data."
#   contents/tutorials/web-redact-properties.md: "PostHog will use the client IP address found during an event capture
#     request if an `$ip` isn't passed through `event.properties`. ... enable the **Discard client IP data** toggle.
#     When this is enabled, PostHog will drop any IP information related to an event."
#   contents/docs/privacy/data-storage.mdx: with that toggle on, "Transformations like GeoIP enrichment and bot
#     detection can **still use the IP** before it is discarded" — hence GeoIP must be off as well.
COUNTER_HOSTS = ("https://eu.i.posthog.com", "https://us.i.posthog.com")
CAPTURE_PATH = "/i/v0/e/"
_PROJECT_TOKEN = re.compile(r"phc_[A-Za-z0-9]{20,}")  # always fullmatch: `$` would accept a trailing newline

COUNTER_DISCLOSURE = """
<p>This page counts visits anonymously, without cookies, through PostHog, and stores nothing about the visitor.
The first time a visit scrolls the page, one small script on it sends PostHog a single page-view event holding the
page's address and a random number drawn for that visit alone, with person profiles switched off; a visit that never
scrolls sends nothing. It sets no cookie and writes nothing to your browser. Your IP address reaches PostHog with that
request, as it reaches any server a page talks to; the PostHog project is set to discard it and to derive no location
from it.</p>"""

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


def counter_config(counter: Any) -> tuple[str, str] | None:
    """Validate `counter` and return (host, key), or None when the counter is off. Fails closed: anything else raises,
    and no message repeats the key (a mistaken private key must not reach a log)."""
    if counter is None:
        return None
    if not isinstance(counter, dict) or set(counter) != {"host", "key"}:
        raise ValueError("counter must be None or exactly {'host': ..., 'key': ...}")
    host, key = counter["host"], counter["key"]
    if not isinstance(key, str):
        raise ValueError("counter key must be a PostHog project token (a string starting phc_)")
    if "phx_" in key.lower():
        raise ValueError("counter key looks like a PostHog personal API key (phx_): it is private and must never be put "
                         "in a page; use the project token (phc_)")
    if not _PROJECT_TOKEN.fullmatch(key):
        raise ValueError("counter key must match ^phc_[A-Za-z0-9]{20,}$ (a PostHog project token)")
    if not isinstance(host, str) or host not in COUNTER_HOSTS:
        raise ValueError(f"counter host must be one of {', '.join(COUNTER_HOSTS)}")
    return host, key


def counter_script(host: str, key: str) -> str:
    """The one inline script: a single anonymous $pageview to PostHog's capture endpoint, sent on the visit's FIRST SCROLL
    and never on load (research/faceless-youtube/PREREG-DECISIONS.md §3: a renderer that never scrolls sends nothing, and
    a visit that never scrolls is not counted as a reader). The id is 16 random bytes drawn when the event is sent and
    never stored; `credentials: "omit"` keeps the browser from attaching any cookie or stored credential; a failed send is
    dropped rather than retried; `once: true` means a second scroll sends nothing. Call it only with counter_config's
    output."""
    return f"""<script>
addEventListener("scroll", function () {{
  var b = new Uint8Array(16), id = "";
  crypto.getRandomValues(b);
  for (var i = 0; i < b.length; i++) id += (b[i] + 256).toString(16).slice(1);
  fetch({json.dumps(host + CAPTURE_PATH)}, {{
    method: "POST",
    headers: {{"Content-Type": "application/json"}},
    credentials: "omit",
    body: JSON.stringify({{
      "api_key": {json.dumps(key)},
      "event": "$pageview",
      "distinct_id": id,
      "properties": {{"$process_person_profile": false, "$current_url": location.origin + location.pathname}}
    }})
  }}).catch(function () {{}});
}}, {{ once: true, passive: true }});
</script>
"""


def build_page(spec: dict[str, Any], filled: FilledSpec, fj: dict[str, Any], charts: dict[str, Path], *,
               counter: dict[str, str] | None = None) -> str:
    """`fj` is figures.json as written by the render: the page shows exactly the numbers the video uses.

    `counter` is None (no script at all, the default) or {"host": ..., "key": ...} for the anonymous PostHog page-view
    counter described in the module docstring; it is validated before anything is built."""
    on = counter_config(counter)
    script = counter_script(*on) if on else ""
    disclosure = COUNTER_DISCLOSURE if on else ""
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
(Kokoro text-to-speech), not a recording of any person.</p>{disclosure}
</section>
</article>
</main>
<footer>{_e(brand)}</footer>
{script}</body>
</html>
"""
