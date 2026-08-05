from pathlib import Path

from ai.src.data_loader import load_nvd_feed

FIXTURES = Path(__file__).parent / "fixtures"


def test_parses_nvd_2_0_format():
    df = load_nvd_feed(FIXTURES / "sample_nvd_2_0.json")
    # 4 entries in fixture, 1 has no CVSS metrics -> dropped
    assert len(df) == 3
    assert set(df["cve_id"]) == {"CVE-2023-0001", "CVE-2023-0002", "CVE-2023-0003"}
    row = df[df["cve_id"] == "CVE-2023-0001"].iloc[0]
    assert row["cvss_score"] == 9.8
    assert "sql injection" in row["description"].lower()


def test_prefers_cvss_v31_over_v2():
    df = load_nvd_feed(FIXTURES / "sample_nvd_2_0.json")
    row = df[df["cve_id"] == "CVE-2023-0002"].iloc[0]
    assert row["cvss_score"] == 6.1  # from cvssMetricV31, not a v2 fallback


def test_parses_legacy_1_1_format():
    df = load_nvd_feed(FIXTURES / "sample_nvd_1_1.json")
    assert len(df) == 2
    row = df[df["cve_id"] == "CVE-2020-0001"].iloc[0]
    assert row["cvss_score"] == 9.0
    assert "buffer overflow" in row["description"].lower()

    row2 = df[df["cve_id"] == "CVE-2020-0002"].iloc[0]
    assert row2["cvss_score"] == 5.5  # falls back to CVSS v2


def test_unrecognized_format_raises(tmp_path):
    bad_file = tmp_path / "bad.json"
    bad_file.write_text('{"not_a_known_key": []}')
    try:
        load_nvd_feed(bad_file)
        assert False, "Expected ValueError for unrecognized format"
    except ValueError:
        pass
