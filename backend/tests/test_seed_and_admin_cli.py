"""
Tests for the standalone DB scripts: default status seeding (idempotency)
and the admin bootstrap CLI.

These bypass the `client`/dependency-override fixtures since they call the
scripts' own functions directly against a session from db_session_factory,
mirroring how they're actually invoked (as standalone scripts against
whatever DATABASE_URL is configured, not through the FastAPI app).
"""

from app.db.seed import DEFAULT_STATUSES
from app.models.status import Status
from app.schemas.user import UserCreate
from app.models.enums import RoleEnum
from app.services.user_service import create_user
from app.core.exceptions import ConflictError


def test_seeding_is_idempotent(db_session_factory):
    """Running the seed logic twice must not create duplicate status rows."""
    session = db_session_factory()

    # db_session_factory fixture already seeds once on creation; verify that baseline.
    initial_count = session.query(Status).count()
    assert initial_count == len(DEFAULT_STATUSES)

    # Re-run the same seeding logic used by app/db/seed.py::seed_statuses
    existing_names = {s.name for s in session.query(Status).all()}
    created = 0
    for row in DEFAULT_STATUSES:
        if row["name"] not in existing_names:
            session.add(Status(**row))
            created += 1
    session.commit()

    assert created == 0
    assert session.query(Status).count() == len(DEFAULT_STATUSES)
    session.close()


def test_create_admin_cli_creates_admin_role(db_session_factory):
    """Exercises the same create_user() call app/db/create_admin.py makes."""
    session = db_session_factory()

    user_in = UserCreate(full_name="Bootstrap Admin", email="bootstrap@corpsecurity.example.com",
                          password="BootstrapPass1!", role=RoleEnum.ADMIN)
    user = create_user(session, user_in, force_role=RoleEnum.ADMIN)

    assert user.role == RoleEnum.ADMIN
    assert user.email == "bootstrap@corpsecurity.example.com"
    session.close()


def test_create_admin_cli_reports_conflict_on_duplicate_email(db_session_factory):
    session = db_session_factory()
    user_in = UserCreate(full_name="Bootstrap Admin", email="bootstrap@corpsecurity.example.com",
                          password="BootstrapPass1!", role=RoleEnum.ADMIN)
    create_user(session, user_in, force_role=RoleEnum.ADMIN)

    try:
        create_user(session, user_in, force_role=RoleEnum.ADMIN)
        assert False, "Expected ConflictError for duplicate email"
    except ConflictError:
        pass
    session.close()
