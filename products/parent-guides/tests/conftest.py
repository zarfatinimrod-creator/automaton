import copy
import json
import sys
from pathlib import Path

import pytest

PRODUCT = Path(__file__).resolve().parents[1]
REPO = PRODUCT.parents[1]
SPECS = sorted((PRODUCT / "specs").glob("*.json"))
sys.path.insert(0, str(PRODUCT))


def load_spec(path: Path) -> dict:
    return json.loads(path.read_text(encoding="utf-8"))


@pytest.fixture(params=SPECS, ids=[p.name for p in SPECS])
def spec(request) -> dict:
    return load_spec(request.param)


@pytest.fixture
def sample() -> dict:
    """A deep copy of the first sample spec, safe to mutate."""
    return copy.deepcopy(load_spec(PRODUCT / "specs" / "yt-kids-setup.he.json"))
