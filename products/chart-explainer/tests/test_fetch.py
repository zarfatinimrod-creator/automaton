"""Downloads are pinned and hash-checked: a mismatch fails and leaves nothing behind."""

import hashlib
import io
import json
from pathlib import Path

import pytest

import fetch
import tts
from fetch import FetchError

PRODUCT = Path(__file__).resolve().parent.parent
SPEC = json.loads((PRODUCT / "analyses" / "t1.json").read_text())
URL = "https://raw.githubusercontent.com/owner/repo/" + "a" * 40 + "/data/file.csv"
BODY = b"num_pushers,language\n1,Go\n"
GOOD = hashlib.sha256(BODY).hexdigest()


class Opener:
    def __init__(self, body: bytes):
        self.body, self.calls = body, 0

    def __call__(self, url):
        self.calls += 1
        return io.BytesIO(self.body)


def test_sha256_mismatch_fails_and_discards_the_download(tmp_path):
    dest = tmp_path / "file.csv"
    with pytest.raises(FetchError, match="sha256 mismatch"):
        fetch.fetch(URL, "0" * 64, dest, Opener(BODY))
    assert not dest.exists()
    assert not list(tmp_path.iterdir()), "no partial file may survive"


def test_matching_hash_is_written_then_served_from_cache(tmp_path):
    dest = tmp_path / "file.csv"
    opener = Opener(BODY)
    assert fetch.fetch(URL, GOOD, dest, opener).read_bytes() == BODY
    fetch.fetch(URL, GOOD, dest, opener)
    assert opener.calls == 1


def test_a_tampered_cache_is_downloaded_again_and_checked(tmp_path):
    dest = tmp_path / "file.csv"
    dest.write_bytes(b"tampered")
    with pytest.raises(FetchError, match="sha256 mismatch"):
        fetch.fetch(URL, GOOD, dest, Opener(b"also wrong"))
    opener = Opener(BODY)
    fetch.fetch(URL, GOOD, dest, opener)
    assert opener.calls == 1 and dest.read_bytes() == BODY


@pytest.mark.parametrize(
    "url",
    [
        "https://raw.githubusercontent.com/owner/repo/main/data/file.csv",  # a branch moves
        "http://raw.githubusercontent.com/owner/repo/" + "a" * 40 + "/f.csv",  # not https
        "https://example.com/owner/repo/" + "a" * 40 + "/f.csv",  # not an allowed host
        "https://github.com/owner/repo/blob/main/f.csv",  # not a release asset
    ],
)
def test_unpinned_or_foreign_urls_are_refused(url, tmp_path):
    with pytest.raises(FetchError):
        fetch.fetch(url, GOOD, tmp_path / "x", Opener(BODY))


def test_the_t1_dataset_and_the_kokoro_files_are_pinned():
    fetch.require_pinned(SPEC["dataset"]["url"])
    assert SPEC["dataset"]["commit"] in SPEC["dataset"]["url"]
    for m in (tts.KOKORO_MODEL, tts.KOKORO_VOICES):
        fetch.require_pinned(m.url)
        assert m.url.startswith("https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0/")
        assert len(m.sha256) == 64


def test_a_bad_expected_hash_is_refused_before_any_download(tmp_path):
    opener = Opener(BODY)
    with pytest.raises(FetchError, match="64 hex"):
        fetch.fetch(URL, "not-a-hash", tmp_path / "x", opener)
    assert opener.calls == 0
