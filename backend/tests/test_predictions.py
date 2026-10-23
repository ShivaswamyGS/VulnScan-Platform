"""
Prediction history and admin re-run test suite.
"""

from tests.conftest import SAMPLE_REPORT_PAYLOAD


def test_prediction_history_visible_to_owner(client, tester_headers):
    create = client.post("/api/v1/reports", data=SAMPLE_REPORT_PAYLOAD, headers=tester_headers)
    report_id = create.json()["id"]

    r = client.get(f"/api/v1/predictions/{report_id}/history", headers=tester_headers)
    assert r.status_code == 200
    assert len(r.json()) == 1


def test_prediction_history_hidden_from_other_testers(client, tester_headers, second_tester_headers):
    create = client.post("/api/v1/reports", data=SAMPLE_REPORT_PAYLOAD, headers=tester_headers)
    report_id = create.json()["id"]

    r = client.get(f"/api/v1/predictions/{report_id}/history", headers=second_tester_headers)
    assert r.status_code == 403


def test_non_admin_cannot_rerun_prediction(client, tester_headers):
    create = client.post("/api/v1/reports", data=SAMPLE_REPORT_PAYLOAD, headers=tester_headers)
    report_id = create.json()["id"]

    r = client.post(f"/api/v1/predictions/{report_id}/rerun", headers=tester_headers)
    assert r.status_code == 403


def test_admin_rerun_creates_new_prediction_without_deleting_old(client, tester_headers, admin_headers):
    create = client.post("/api/v1/reports", data=SAMPLE_REPORT_PAYLOAD, headers=tester_headers)
    report_id = create.json()["id"]

    r = client.post(f"/api/v1/predictions/{report_id}/rerun", headers=admin_headers)
    assert r.status_code == 200

    history = client.get(f"/api/v1/predictions/{report_id}/history", headers=admin_headers)
    assert len(history.json()) == 2  # original + rerun, not overwritten
