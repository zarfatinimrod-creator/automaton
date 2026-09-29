"""Regression tests for what the three reviews of 29.9.2026 found in the first cut's words."""

import re

import spec as S


def _screen(sc):
    return sc["on_screen_title"] + "\n" + sc["on_screen_body"] + "\n" + " ".join(sc.get("illustration", {}).get("labels", []))


def _by_id(spec, sid):
    return next(sc for sc in spec["scenes"] if sc["id"] == sid)


def test_turning_search_off_is_never_shown_as_safe(spec):
    """important-info-iw:78: whatever the search setting, unwanted content can still turn up. The search step says
    so on screen and cites that line."""
    pages = [sc for sc in spec["scenes"] if sc["on_screen_title"].startswith("4.")]
    assert any("תמיד יש סיכוי" in sc["on_screen_body"] for sc in pages)
    assert any(ev.get("line") == 78 and "תמיד יש סיכוי" in ev.get("quote", "") and "important-info-iw" in ev["file"]
               for sc in pages for ev in sc["evidence"])
    narration = " ".join(c for sc in pages for c in sc["captions"])
    assert "לא מושלם" in narration and "רואים פחות" not in narration


def test_no_step_chain_comes_from_the_computer_tab(spec):
    """The passcode page was captured on its Computer tab; its lock-icon steps, digit count and reset advice stay
    out until the app tabs are captured."""
    sc = _by_id(spec, "s3-passcode")
    assert "›" not in sc["on_screen_body"] and "ספרות" not in _screen(sc) + S.strip_nikud(sc["narration"])
    assert "סמל המנעול" not in _screen(sc) and "מתקינים מחדש" not in _screen(sc)


def test_every_parent_check_names_both_ways_in(spec):
    """Wherever a chain passes the parent check, it names the multiplication question or the code (timer-iw:41, :53)."""
    body = _by_id(spec, "s5-timer")["on_screen_body"]
    assert body.count("שאלת הכפל או הקוד") == 2
    assert "המספרים שעל המסך או הקוד" in _by_id(spec, "s6-block")["on_screen_body"]


def test_quoted_labels_are_labels(spec):
    """„השבתת החיפוש” is a section heading and „הערוץ כולו” a fragment of an option: neither is quoted any more."""
    text = "\n".join(_screen(sc) for sc in spec["scenes"])
    assert "„השבתת החיפוש”" not in text and "„הערוץ כולו”" not in text


def test_the_hook_does_not_promise_things_to_do_before_installing(spec):
    assert "קודם" not in _by_id(spec, "s0-hook")["on_screen_body"]


def test_parents_are_never_addressed_in_the_singular(spec):
    singular = re.compile(r"(^|[\s„(])(ל|ש|ב|מ)?(בעצמך|שלך|לך|אותך|עליך|אתה)(?=$|[\s,.?!”)])")
    for sc in spec["scenes"]:
        for text in (_screen(sc), S.strip_nikud(sc["narration"])):
            assert not singular.search(text), (sc["id"], text)


def test_the_quote_and_the_narration_credit_the_same_source(spec):
    sc = _by_id(spec, "s6-block")
    assert "(Google)" in sc["on_screen_body"] and "גוגל" in S.strip_nikud(sc["narration"])
