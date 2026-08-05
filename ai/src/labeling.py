"""
Converts a numeric CVSS score into one of the four severity labels used
throughout the platform: Critical, High, Medium, Low.

This mirrors the exact bands specified in the project brief:
    9.0-10.0 -> Critical
    7.0-8.9  -> High
    4.0-6.9  -> Medium
    0.1-3.9  -> Low
"""

from ai.config import CVSS_SEVERITY_BANDS


def cvss_to_severity(score: float) -> str | None:
    """
    Map a CVSS score to a severity label.

    Returns None for scores outside all defined bands (e.g. 0.0, which CVSS
    reserves for "no vulnerability" / informational findings) so callers can
    explicitly decide to drop those rows rather than silently mislabeling them.
    """
    if score is None:
        return None

    for low, high, label in CVSS_SEVERITY_BANDS:
        if low <= score <= high:
            return label

    return None
