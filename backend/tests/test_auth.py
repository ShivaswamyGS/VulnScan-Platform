"""
Auth test suite.

Covers the security-critical behaviors from Module 4: registration cannot
escalate to admin, duplicate emails conflict, wrong passwords fail
uniformly, tokens work correctly, and the brute-force lockout actually
blocks further attempts (even with the correct password).
"""

TESTER_EMAIL = "priya@corpsecurity.example.com"
TESTER_PASSWORD = "Str0ngPass!"


def register_tester(client, email=TESTER_EMAIL, password=TESTER_PASSWORD):
    return client.post(
        "/api/v1/auth/register",
        json={"full_name": "Priya Nair", "email": email, "password": password},
    )


def test_register_creates_internal_tester(client):
    r = register_tester(client)
    assert r.status_code == 201
    assert r.json()["role"] == "internal_tester"


def test_register_cannot_escalate_to_admin(client):
    """Sending role=admin in the request body must be silently ignored server-side."""
    r = client.post(
        "/api/v1/auth/register",
        json={"full_name": "Attacker", "email": "attacker@corpsecurity.example.com",
              "password": "Str0ngPass!", "role": "admin"},
    )
    assert r.status_code == 201
    assert r.json()["role"] == "internal_tester"


def test_duplicate_email_registration_conflicts(client):
    register_tester(client)
    r = register_tester(client)
    assert r.status_code == 409


def test_login_wrong_password_returns_401(client):
    register_tester(client)
    r = client.post("/api/v1/auth/login", data={"username": TESTER_EMAIL, "password": "wrongpassword"})
    assert r.status_code == 401


def test_login_unknown_email_returns_401(client):
    r = client.post("/api/v1/auth/login", data={"username": "nobody@corpsecurity.example.com", "password": "whatever"})
    assert r.status_code == 401


def test_login_success_returns_tokens(client):
    register_tester(client)
    r = client.post("/api/v1/auth/login", data={"username": TESTER_EMAIL, "password": TESTER_PASSWORD})
    assert r.status_code == 200
    body = r.json()
    assert "access_token" in body
    assert "refresh_token" in body
    assert body["token_type"] == "bearer"


def test_me_requires_valid_token(client):
    r = client.get("/api/v1/auth/me")
    assert r.status_code == 401

    register_tester(client)
    login = client.post("/api/v1/auth/login", data={"username": TESTER_EMAIL, "password": TESTER_PASSWORD})
    token = login.json()["access_token"]

    r = client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert r.status_code == 200
    assert r.json()["email"] == TESTER_EMAIL


def test_me_rejects_garbage_token(client):
    r = client.get("/api/v1/auth/me", headers={"Authorization": "Bearer not-a-real-token"})
    assert r.status_code == 401


def test_refresh_token_issues_new_access_token(client):
    register_tester(client)
    login = client.post("/api/v1/auth/login", data={"username": TESTER_EMAIL, "password": TESTER_PASSWORD})
    refresh_token = login.json()["refresh_token"]

    r = client.post("/api/v1/auth/refresh", params={"refresh_token": refresh_token})
    assert r.status_code == 200
    assert "access_token" in r.json()


def test_access_token_cannot_be_used_as_refresh_token(client):
    register_tester(client)
    login = client.post("/api/v1/auth/login", data={"username": TESTER_EMAIL, "password": TESTER_PASSWORD})
    access_token = login.json()["access_token"]

    r = client.post("/api/v1/auth/refresh", params={"refresh_token": access_token})
    assert r.status_code == 401


def test_brute_force_lockout_blocks_even_correct_password(client):
    register_tester(client)

    for _ in range(5):
        client.post("/api/v1/auth/login", data={"username": TESTER_EMAIL, "password": "wrong"})

    # The 6th attempt, even with the CORRECT password, must still be blocked.
    r = client.post("/api/v1/auth/login", data={"username": TESTER_EMAIL, "password": TESTER_PASSWORD})
    assert r.status_code == 401
