"""The ASR gate's meaning check: a low character error rate can hide a flipped meaning, so negations, number words
and person forms must be heard exactly. The two cases are the ones the first cut passed at CER 0.031 and 0.034."""

import pytest

import asr_gate as G


@pytest.mark.parametrize("ref,hyp,missing", [
    ("או שאתם בוחרים בעצמכם סרטונים וערוצים.", "או שאתם בוחרים בעצמם סרטונים וערוצים.", ["בעצמכם"]),
    ("אחר כך, יוצרים קוד אישי של ארבע ספרות.", "אחר כך יוצרים קוד אישי של אבע ספרות.", ["ארבע"]),
    ("שישה דברים שכדאי לעשות.", "6 דברים שכדאי לעשות.", ["שישה"]),
    ("והילדים לא יכולים לחפש.", "והילדים יכולים לחפש.", ["לא"]),
    ("יש סרטונים בחיפוש שלא עברו בדיקה אנושית.", "יש סרטונים בהיפוש שלא עברו בדיקה אנושית.", []),
    ("מתקינים לילדים YouTube Kids?", "מתקינים לילדים יוטיוב קידס.", []),
])
def test_missing_critical_words(ref, hyp, missing):
    assert G.missing_critical(ref, hyp) == missing


def test_critical_words_behind_prefix_letters():
    assert G.is_critical("שלא") and G.is_critical("כשאתם") and G.is_critical("ולכם")
    assert not G.is_critical("לילדים") and not G.is_critical("הילדים") and not G.is_critical("לכל")


def test_the_first_cut_would_now_fail_on_the_two_flipped_lines():
    first_cut = [("או שאתם בוחרים בעצמכם סרטונים וערוצים.", "או שאתם בוחרים בעצמם סרטונים וערוצים."),
                 ("אחר כך, יוצרים קוד אישי של ארבע ספרות.", "אחר כך יוצרים קוד אישי של אבע ספרות.")]
    for ref, hyp in first_cut:
        assert G.cer(ref, hyp) <= 0.05 and G.missing_critical(ref, hyp)
