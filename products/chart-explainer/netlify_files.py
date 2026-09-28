"""The four Netlify files deployed beside the web arm's index.html (research/faceless-youtube/PREREG-DECISIONS.md §3.6).

- `_redirects`: `/preview/` is the same page served by a rewrite (status 200, no `!`, so no file is shadowed). Every
  colony-facing and owner-facing link uses it; the counter sends `location.origin + location.pathname`, so those loads
  carry a different `$current_url` from the canonical URL and never count (§3.4(a)). Netlify matches redirect rules with
  or without the trailing slash, so `/preview` is rewritten too.
- `_headers`: `X-Robots-Tag: noindex` on `/preview/*`, so the copy is not a second indexed page.
- `robots.txt`: `Disallow: /preview/` and the `Sitemap:` line (§3.5 route 1).
- `sitemap.xml`: the canonical URL only, which is the origin plus the pathname `/` — exactly what the counter sends from
  the page itself (§3.1).

Syntax checked on 28.9.2026 against Netlify's documentation (docs.netlify.com/manage/routing/redirects/redirect-options,
.../rewrites-proxies, .../headers; read through Context7). The files are public, so they carry no comment and nothing
but the host.

Known and reported, not resolved here: Google's documentation says that when robots.txt disallows a URL, "any indexing
or serving rules specified via robots meta tags or X-Robots-Tag HTTP headers will be ignored"
(developers.google.com/search/docs/crawling-indexing/robots-meta-tag). With both lines, as §3.6 rules, Google never sees
the noindex on `/preview/`; the Disallow alone keeps the page from being crawled, but a `/preview/` URL linked from
elsewhere can still be listed without its content. Which of the two lines to keep is the board's call.

To check on the first deploy preview, before any production deploy, because Netlify's docs (as read on 28.9.2026) do not
settle them:
- Whether a `_headers` rule matches the requested path or the rewrite target (`/index.html`). `curl -sI
  <preview-host>/preview/` must show `X-Robots-Tag: noindex`, and `curl -sI <preview-host>/` must not.
- The form without the trailing slash. The rewrite serves `/preview` too, and robots.txt rules match by path prefix, so
  `Disallow: /preview/` does not cover `/preview`; only the header keeps it out of an index. `curl -sI
  <preview-host>/preview` must show `X-Robots-Tag: noindex` as well.

The host is an argument because the sub-brand name is not chosen (RULING-2026-09-28-floors.md, "What was not decided
here"). It must be a bare lowercase https origin — no port, path, query or trailing slash — or ValueError is raised
before anything is produced.
"""

from __future__ import annotations

import re

_ORIGIN = re.compile(r"https://[a-z0-9](?:[a-z0-9-]*[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]*[a-z0-9])?)+")


def netlify_files(origin: str) -> dict[str, str]:
    """{file name: content} for the four files; `origin` is e.g. "https://<sub-brand>.netlify.app"."""
    if not isinstance(origin, str) or not _ORIGIN.fullmatch(origin):
        raise ValueError("origin must be a bare lowercase https origin, e.g. https://name.netlify.app (no trailing /)")
    canonical = origin + "/"
    return {
        "_redirects": "/preview/  /index.html  200\n",
        "_headers": "/preview/*\n  X-Robots-Tag: noindex\n",
        "robots.txt": f"User-agent: *\nDisallow: /preview/\nSitemap: {origin}/sitemap.xml\n",
        "sitemap.xml": (
            '<?xml version="1.0" encoding="UTF-8"?>\n'
            '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
            f"  <url><loc>{canonical}</loc></url>\n"
            "</urlset>\n"
        ),
    }
