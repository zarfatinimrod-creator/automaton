"""Put the product's modules (fetch, figures, charts, tts, assemble, page, manifest) on the import path."""

import sys
from pathlib import Path

PRODUCT = Path(__file__).resolve().parent.parent
REPO_ROOT = PRODUCT.parent.parent
sys.path.insert(0, str(PRODUCT))
