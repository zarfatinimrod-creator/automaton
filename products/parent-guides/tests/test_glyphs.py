"""Every character a viewer sees exists in the vendored font, so nothing renders as a tofu box."""

import pytest

fontTools = pytest.importorskip("fontTools.ttLib")

from conftest import PRODUCT  # noqa: E402


def _on_screen(spec) -> str:
    import spec as S

    parts = [spec["brand"], spec["series"], spec["ai_line"], spec["ai_line_silent"], "שלב"]
    parts += S.end_card_lines(spec)
    for sc in spec["scenes"]:
        parts += [sc["on_screen_title"], sc["on_screen_body"]]
        parts += sc.get("illustration", {}).get("labels", [])
    return "".join(parts)


def test_font_covers_every_on_screen_character(spec):
    cmap = fontTools.TTFont(str(PRODUCT / "fonts" / "heebo" / "Heebo[wght].ttf")).getBestCmap()
    chars = set(_on_screen(spec)) | {" "}  # display() joins "YouTube Kids" with a no-break space
    missing = sorted(c for c in chars if c not in "\n" and ord(c) not in cmap)
    assert not missing, [f"U+{ord(c):04X}" for c in missing]


def test_font_licence_travels_with_the_font():
    d = PRODUCT / "fonts" / "heebo"
    assert "SIL Open Font License, Version 1.1" in (d / "OFL.txt").read_text(encoding="utf-8")
    assert 'license: "OFL"' in (d / "METADATA.pb").read_text(encoding="utf-8")
