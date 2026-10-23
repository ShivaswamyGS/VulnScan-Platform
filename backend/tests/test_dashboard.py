"""
Dashboard aggregation test suite.
"""

from tests.conftest import SAMPLE_REPORT_PAYLOAD


def test_dashboard_requires_admin(client, tester_headers):
    r = client.get("/api/v1/dashboard/stats", headers=tester_headers)
    assert r.status_code == 403


def test_dashboard_requires_auth(client):
    r = client.get("/api/v1/dashboard/stats")
    assert r.status_code == 401


def test_dashboard_totals_match_submitted_reports(client, tester_headers, second_tester_headers, admin_headers):
    client.post("/api/v1/reports", data=SAMPLE_REPORT_PAYLOAD, headers=tester_headers)
    client.post(
        "/api/v1/reports",
        data={**SAMPLE_REPORT_PAYLOAD, "title": "A second distinct report title"},
        headers=second_tester_headers,
    )

    r = client.get("/api/v1/dashboard/stats", headers=admin_headers)
    assert r.status_code == 200
    stats = r.json()

    assert stats["total_reports"] == 2
    # every report starts in the "Open" (non-terminal) status
    assert stats["open_reports"] == 2
    assert stats["resolved_reports"] == 0
    # every submitted report has exactly one prediction, so severities must sum to the total
    severity_sum = stats["critical_reports"] + stats["high_reports"] + stats["medium_reports"] + stats["low_reports"]
    assert severity_sum == 2
    assert len(stats["recent_reports"]) == 2


def test_dashboard_with_no_reports_returns_zeroes(client, admin_headers):
    r = client.get("/api/v1/dashboard/stats", headers=admin_headers)
    assert r.status_code == 200
    stats = r.json()
    assert stats["total_reports"] == 0
    assert stats["recent_reports"] == []
