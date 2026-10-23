"""
Shared pytest fixtures for the backend test suite.

Key design decision: each test function gets its OWN isolated SQLite
database file (via pytest's `tmp_path`), not a shared in-memory DB or a
DB that persists across tests. This matters specifically for auth tests —
the brute-force lockout policy counts failed logins by email within a
time window, so state leaking between tests would make lockout tests
flaky or wrong depending on execution order.

Environment variables (SECRET_KEY, ML_MODEL_PATH, etc.) are set BEFORE
importing anything from `app`, since app.core.config.Settings is loaded
once via lru_cache at import time.
"""

import os
from pathlib import Path

_BACKEND_DIR = Path(__file__).resolve().parents[1]
_AI_ARTIFACTS_DIR = _BACKEND_DIR.parent / "ai" / "artifacts"

os.environ.setdefault("SECRET_KEY", "test-secret-key-for-pytest-only")
os.environ.setdefault("DATABASE_URL", "sqlite:///./_unused_placeholder.db")  # overridden per-test via dependency_overrides
os.environ.setdefault("ML_MODEL_PATH", str(_AI_ARTIFACTS_DIR / "model.pkl"))
os.environ.setdefault("ML_VECTORIZER_PATH", str(_AI_ARTIFACTS_DIR / "tfidf.pkl"))

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

import app.models  # noqa: F401 — registers all models on Base.metadata
from app.core.security import hash_password
from app.db.base_class import Base
from app.db.seed import DEFAULT_STATUSES
from app.db.session import get_db
from app.main import app as fastapi_app
from app.models.enums import RoleEnum
from app.models.status import Status
from app.models.user import User


@pytest.fixture(autouse=True)
def isolated_upload_dir(tmp_path, monkeypatch):
    """
    Redirects attachment storage to a per-test temp directory instead of the
    real uploads/ folder, so running the test suite never leaves stray
    attachment files behind in the actual project directory.
    """
    from app.core.config import settings

    upload_dir = tmp_path / "uploads"
    upload_dir.mkdir()
    monkeypatch.setattr(settings, "UPLOAD_DIR", str(upload_dir))


@pytest.fixture()
def db_session_factory(tmp_path):
    """
    Creates a fresh SQLite database file per test, with all tables created
    and default statuses seeded. Yields the sessionmaker (not a session)
    so tests and the app's request handling can each open their own session
    against the same underlying database file, mirroring how the app and
    a real client are separate processes talking to a shared database.
    """
    db_path = tmp_path / "test.db"
    engine = create_engine(f"sqlite:///{db_path}", connect_args={"check_same_thread": False})
    TestingSessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)

    Base.metadata.create_all(bind=engine)

    seed_session = TestingSessionLocal()
    for row in DEFAULT_STATUSES:
        seed_session.add(Status(**row))
    seed_session.commit()
    seed_session.close()

    yield TestingSessionLocal

    engine.dispose()


@pytest.fixture()
def client(db_session_factory):
    """A TestClient wired to the isolated per-test database via dependency override."""

    def override_get_db():
        db = db_session_factory()
        try:
            yield db
        finally:
            db.close()

    fastapi_app.dependency_overrides[get_db] = override_get_db
    with TestClient(fastapi_app) as test_client:
        yield test_client
    fastapi_app.dependency_overrides.clear()


@pytest.fixture()
def tester_headers(client):
    """Registers and logs in a fresh Internal Tester, returning auth headers."""
    client.post(
        "/api/v1/auth/register",
        json={"full_name": "Priya Nair", "email": "priya@corpsecurity.example.com", "password": "Str0ngPass!"},
    )
    r = client.post(
        "/api/v1/auth/login",
        data={"username": "priya@corpsecurity.example.com", "password": "Str0ngPass!"},
    )
    token = r.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture()
def second_tester_headers(client):
    """A second, unrelated Internal Tester — used for cross-user access-control tests."""
    client.post(
        "/api/v1/auth/register",
        json={"full_name": "Bob Tester", "email": "bob@corpsecurity.example.com", "password": "Str0ngPass!"},
    )
    r = client.post(
        "/api/v1/auth/login",
        data={"username": "bob@corpsecurity.example.com", "password": "Str0ngPass!"},
    )
    token = r.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture()
def admin_headers(client, db_session_factory):
    """
    Creates an admin directly via the DB (bypassing /auth/register, which can
    never create an admin by design — see app/api/v1/endpoints/auth.py) and
    logs in through the real endpoint.
    """
    session = db_session_factory()
    admin = User(
        full_name="Security Lead",
        email="lead@corpsecurity.example.com",
        hashed_password=hash_password("AdminPass1!"),
        role=RoleEnum.ADMIN,
    )
    session.add(admin)
    session.commit()
    session.close()

    r = client.post(
        "/api/v1/auth/login",
        data={"username": "lead@corpsecurity.example.com", "password": "AdminPass1!"},
    )
    token = r.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


SAMPLE_REPORT_PAYLOAD = {
    "title": "SQL injection in the login endpoint",
    "description": "The login form does not sanitize the email field, allowing SQL injection attacks that bypass authentication entirely.",
    "affected_module": "Auth Service",
    "category": "Injection",
    "steps_to_reproduce": "Submit email as ' OR '1'='1",
    "expected_result": "Login rejected",
    "actual_result": "Login succeeds, bypassing authentication",
}
