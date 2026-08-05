import pytest

from ai.src.labeling import cvss_to_severity


@pytest.mark.parametrize(
    "score,expected",
    [
        (10.0, "Critical"),
        (9.0, "Critical"),
        (9.8, "Critical"),
        (8.9, "High"),
        (7.0, "High"),
        (6.9, "Medium"),
        (4.0, "Medium"),
        (3.9, "Low"),
        (0.1, "Low"),
        (0.0, None),   # CVSS 0.0 is "no impact" - explicitly not labeled
        (None, None),
    ],
)
def test_cvss_to_severity_boundaries(score, expected):
    assert cvss_to_severity(score) == expected
