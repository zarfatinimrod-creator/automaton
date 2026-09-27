"""Download pinned files, verify them by sha256, cache them under a gitignored directory.

Every input the renderer uses — the dataset and the two Kokoro model files — goes through `fetch()`. A URL must be
pinned (a commit sha in a raw.githubusercontent path, or a versioned GitHub release asset), and the bytes must hash to
the value written in the analysis spec or in `tts.py`. A mismatch is a hard failure: the partial file is deleted and
nothing downstream runs, because a chart drawn from bytes nobody pinned is a number nobody can re-derive (G4).

Only GitHub-hosted URLs are accepted: they are the hosts this container and a GitHub runner can both reach, and they
are the hosts the dataset research verified (DATASETS.md, "Access").
"""

from __future__ import annotations

import hashlib
import re
import urllib.request
from pathlib import Path
from typing import BinaryIO, Callable
from urllib.parse import urlparse

HERE = Path(__file__).resolve().parent
CACHE_DIR = HERE / ".cache"

ALLOWED_HOSTS = frozenset({"raw.githubusercontent.com", "media.githubusercontent.com", "github.com"})
_COMMIT = re.compile(r"^[0-9a-f]{40}$")
_SHA256 = re.compile(r"^[0-9a-f]{64}$")
_CHUNK = 1 << 20

Opener = Callable[[str], BinaryIO]


class FetchError(RuntimeError):
    """A download that must not be used: wrong host, unpinned URL, or bytes that do not match the pinned hash."""


def sha256_file(path: Path) -> str:
    h = hashlib.sha256()
    with open(path, "rb") as f:
        for chunk in iter(lambda: f.read(_CHUNK), b""):
            h.update(chunk)
    return h.hexdigest()


def require_pinned(url: str) -> None:
    """Refuse a URL that could serve different bytes tomorrow without its path changing."""
    u = urlparse(url)
    if u.scheme != "https":
        raise FetchError(f"not https: {url}")
    if u.hostname not in ALLOWED_HOSTS:
        raise FetchError(f"host {u.hostname} is not an allowed GitHub host: {url}")
    parts = [p for p in u.path.split("/") if p]
    if u.hostname == "github.com":
        # /<owner>/<repo>/releases/download/<tag>/<file>: a named release asset.
        if len(parts) != 6 or parts[2:4] != ["releases", "download"]:
            raise FetchError(f"github.com URL is not a release asset: {url}")
        return
    if u.hostname == "media.githubusercontent.com":
        parts = parts[1:]  # /media/<owner>/<repo>/<ref>/...
    if len(parts) < 4 or not _COMMIT.match(parts[2]):
        raise FetchError(f"URL is not pinned to a 40-character commit sha: {url}")


def _default_opener(url: str) -> BinaryIO:
    req = urllib.request.Request(url, headers={"User-Agent": "chart-explainer-fetch"})
    return urllib.request.urlopen(req, timeout=120)  # noqa: S310 - https only, host allowlisted above


def fetch(url: str, sha256: str, dest: Path, opener: Opener | None = None) -> Path:
    """Return `dest` holding exactly the bytes whose sha256 is `sha256`, downloading only when the cache is not them."""
    if not _SHA256.match(sha256 or ""):
        raise FetchError(f"expected sha256 is not 64 hex characters: {sha256!r}")
    require_pinned(url)
    dest = Path(dest)
    if dest.exists() and sha256_file(dest) == sha256:
        return dest
    dest.parent.mkdir(parents=True, exist_ok=True)
    part = dest.with_name(dest.name + ".part")
    h = hashlib.sha256()
    try:
        with (opener or _default_opener)(url) as resp, open(part, "wb") as out:
            for chunk in iter(lambda: resp.read(_CHUNK), b""):
                h.update(chunk)
                out.write(chunk)
    except FetchError:
        part.unlink(missing_ok=True)
        raise
    except Exception as e:  # network errors: say which URL, keep nothing
        part.unlink(missing_ok=True)
        raise FetchError(f"download failed for {url}: {e}") from e
    got = h.hexdigest()
    if got != sha256:
        part.unlink(missing_ok=True)
        raise FetchError(f"sha256 mismatch for {url}: expected {sha256}, got {got}; the file was discarded")
    part.replace(dest)
    return dest


def fetch_dataset(dataset: dict, cache_dir: Path = CACHE_DIR, opener: Opener | None = None) -> Path:
    """Fetch the analysis spec's dataset into `<cache>/data/<commit12>-<file name>`."""
    name = Path(urlparse(dataset["url"]).path).name
    dest = Path(cache_dir) / "data" / f"{dataset['commit'][:12]}-{name}"
    if dataset["commit"] not in dataset["url"]:
        raise FetchError(f"dataset url does not contain its pinned commit {dataset['commit']}")
    return fetch(dataset["url"], dataset["sha256"], dest, opener)
