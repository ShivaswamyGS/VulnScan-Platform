"""
Report submission, listing, access control, and attachment test suite.
"""

from tests.conftest import SAMPLE_REPORT_PAYLOAD


def test_submit_report_triggers_prediction(client, tester_headers):
    r = client.post("/api/v1/reports", data=SAMPLE_REPORT_PAYLOAD, headers=tester_headers)
    assert r.status_code == 201
    body = r.json()
    assert body["title"] == SAMPLE_REPORT_PAYLOAD["title"]
    assert len(body["predictions"]) == 1
    prediction = body["predictions"][0]
    assert prediction["predicted_severity"] in ("critical", "high", "medium", "low")
    assert 0.0 <= prediction["confidence_score"] <= 1.0


def test_submit_report_requires_auth(client):
    r = client.post("/api/v1/reports", data=SAMPLE_REPORT_PAYLOAD)
    assert r.status_code == 401


def test_submit_report_validates_minimum_field_lengths(client, tester_headers):
    bad_payload = {**SAMPLE_REPORT_PAYLOAD, "title": "hi"}  # below min_length=5
    r = client.post("/api/v1/reports", data=bad_payload, headers=tester_headers)
    assert r.status_code == 422


def test_tester_sees_only_own_reports(client, tester_headers, second_tester_headers):
    client.post("/api/v1/reports", data=SAMPLE_REPORT_PAYLOAD, headers=tester_headers)

    bob_payload = {**SAMPLE_REPORT_PAYLOAD, "title": "A different report title entirely"}
    client.post("/api/v1/reports", data=bob_payload, headers=second_tester_headers)

    r = client.get("/api/v1/reports", headers=second_tester_headers)
    assert r.status_code == 200
    reports = r.json()
    assert len(reports) == 1
    assert reports[0]["title"] == bob_payload["title"]


def test_admin_sees_all_reports(client, tester_headers, second_tester_headers, admin_headers):
    client.post("/api/v1/reports", data=SAMPLE_REPORT_PAYLOAD, headers=tester_headers)
    client.post("/api/v1/reports", data={**SAMPLE_REPORT_PAYLOAD, "title": "Second report title here"}, headers=second_tester_headers)

    r = client.get("/api/v1/reports", headers=admin_headers)
    assert r.status_code == 200
    assert len(r.json()) == 2


def test_tester_cannot_view_another_testers_report(client, tester_headers, second_tester_headers):
    create = client.post("/api/v1/reports", data=SAMPLE_REPORT_PAYLOAD, headers=tester_headers)
    report_id = create.json()["id"]

    r = client.get(f"/api/v1/reports/{report_id}", headers=second_tester_headers)
    assert r.status_code == 403


def test_admin_can_view_any_report(client, tester_headers, admin_headers):
    create = client.post("/api/v1/reports", data=SAMPLE_REPORT_PAYLOAD, headers=tester_headers)
    report_id = create.json()["id"]

    r = client.get(f"/api/v1/reports/{report_id}", headers=admin_headers)
    assert r.status_code == 200


def test_nonexistent_report_returns_404(client, tester_headers):
    r = client.get("/api/v1/reports/999999", headers=tester_headers)
    assert r.status_code == 404


def test_attachment_with_disallowed_extension_is_rejected(client, tester_headers):
    files = {"attachment": ("exploit.exe", b"MZ-fake-binary", "application/octet-stream")}
    r = client.post("/api/v1/reports", data=SAMPLE_REPORT_PAYLOAD, files=files, headers=tester_headers)
    assert r.status_code == 422


def test_valid_attachment_is_stored_under_randomized_name(client, tester_headers):
    files = {"attachment": ("original-name.png", b"\x89PNG\r\n\x1a\nfakepngdata", "image/png")}
    r = client.post("/api/v1/reports", data=SAMPLE_REPORT_PAYLOAD, files=files, headers=tester_headers)
    assert r.status_code == 201
    stored_path = r.json()["attachment_path"]
    assert stored_path != "original-name.png"
    assert stored_path.endswith(".png")


def test_attachment_download_requires_ownership(client, tester_headers, second_tester_headers):
    files = {"attachment": ("poc.png", b"\x89PNG\r\n\x1a\nfakepngdata", "image/png")}
    create = client.post("/api/v1/reports", data=SAMPLE_REPORT_PAYLOAD, files=files, headers=tester_headers)
    report_id = create.json()["id"]

    r_owner = client.get(f"/api/v1/reports/{report_id}/attachment", headers=tester_headers)
    assert r_owner.status_code == 200
    assert r_owner.content == b"\x89PNG\r\n\x1a\nfakepngdata"

    r_other = client.get(f"/api/v1/reports/{report_id}/attachment", headers=second_tester_headers)
    assert r_other.status_code == 403


def test_report_without_attachment_has_no_download(client, tester_headers):
    create = client.post("/api/v1/reports", data=SAMPLE_REPORT_PAYLOAD, headers=tester_headers)
    report_id = create.json()["id"]

    r = client.get(f"/api/v1/reports/{report_id}/attachment", headers=tester_headers)
    assert r.status_code == 404
