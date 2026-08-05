"""
Loader for real National Vulnerability Database (NVD) JSON feeds.

Supports both feed formats NVD has published:
- NVD API 2.0 format  (nvdcve-2.0-*.json / vulnerabilities API dumps)
- Legacy 1.1 feed format (nvdcve-1.1-*.json, deprecated by NIST but still
  seen in older mirrors/archives)

Download feeds from: https://nvd.nist.gov/vuln/data-feeds
(NVD is not reachable from this sandbox's network allowlist, so this
loader is exercised here against the bundled sample fixture in
ai/tests/fixtures/ rather than a live download — see train.py for how
to point it at a real feed file.)
"""

import json
from pathlib import Path

import pandas as pd


def _extract_description(descriptions: list[dict]) -> str | None:
    for d in descriptions:
        if d.get("lang") == "en":
            return d.get("value")
    return descriptions[0].get("value") if descriptions else None


def _extract_cvss_score_v2_0(metrics: dict) -> float | None:
    """NVD 2.0 format: prefer CVSS v3.1, then v3.0, then v2."""
    for key in ("cvssMetricV31", "cvssMetricV30", "cvssMetricV2"):
        entries = metrics.get(key)
        if entries:
            return entries[0].get("cvssData", {}).get("baseScore")
    return None


def _extract_cvss_score_v1_1(impact: dict) -> float | None:
    """Legacy 1.1 format: prefer baseMetricV3, then baseMetricV2."""
    if "baseMetricV3" in impact:
        return impact["baseMetricV3"].get("cvssV3", {}).get("baseScore")
    if "baseMetricV2" in impact:
        return impact["baseMetricV2"].get("cvssV2", {}).get("baseScore")
    return None


def load_nvd_feed(path: str | Path) -> pd.DataFrame:
    """
    Parse an NVD JSON feed file into a DataFrame with columns:
    ['cve_id', 'description', 'cvss_score'].

    Rows where either the description or a CVSS score could not be
    extracted are dropped (an incomplete row cannot be labeled or trained on).
    """
    path = Path(path)
    with open(path, encoding="utf-8") as f:
        data = json.load(f)

    records: list[dict] = []

    if "vulnerabilities" in data:
        # --- NVD API 2.0 format ---
        for item in data["vulnerabilities"]:
            cve = item.get("cve", {})
            cve_id = cve.get("id")
            description = _extract_description(cve.get("descriptions", []))
            score = _extract_cvss_score_v2_0(cve.get("metrics", {}))
            records.append({"cve_id": cve_id, "description": description, "cvss_score": score})

    elif "CVE_Items" in data:
        # --- Legacy 1.1 format ---
        for item in data["CVE_Items"]:
            cve_meta = item.get("cve", {}).get("CVE_data_meta", {})
            cve_id = cve_meta.get("ID")
            description = _extract_description(
                item.get("cve", {}).get("description", {}).get("description_data", [])
            )
            score = _extract_cvss_score_v1_1(item.get("impact", {}))
            records.append({"cve_id": cve_id, "description": description, "cvss_score": score})

    else:
        raise ValueError(
            f"Unrecognized NVD feed format in {path}: expected top-level "
            f"'vulnerabilities' (2.0) or 'CVE_Items' (1.1) key."
        )

    df = pd.DataFrame(records)
    before = len(df)
    df = df.dropna(subset=["description", "cvss_score"])
    dropped = before - len(df)
    if dropped:
        print(f"[data_loader] Dropped {dropped}/{before} rows missing description or CVSS score.")

    return df.reset_index(drop=True)
