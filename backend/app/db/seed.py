"""
Seed default lookup data.

Run once after migrations, in a fresh environment:
python -m app.db.seed

Idempotent: safe to run multiple times, it only inserts statuses that
don't already exist (matched by name).
"""

import logging

from app.db.session import SessionLocal
from app.models.status import Status


logger = logging.getLogger(__name__)


DEFAULT_STATUSES = [
    {
        "name": "Open",
        "description": "Newly submitted, not yet triaged",
        "is_terminal": False,
        "sort_order": 1,
    },
    {
        "name": "In Review",
        "description": "An admin is actively reviewing this report",
        "is_terminal": False,
        "sort_order": 2,
    },
    {
        "name": "In Progress",
        "description": "Confirmed and being remediated",
        "is_terminal": False,
        "sort_order": 3,
    },
    {
        "name": "Resolved",
        "description": "Fix verified",
        "is_terminal": True,
        "sort_order": 4,
    },
    {
        "name": "Rejected",
        "description": "Not a valid finding / duplicate / won't fix",
        "is_terminal": True,
        "sort_order": 5,
    },
]


def seed_statuses() -> None:
    db = SessionLocal()

    try:
        existing_names = {
            status.name
            for status in db.query(Status).all()
        }

        created = 0

        for row in DEFAULT_STATUSES:
            if row["name"] not in existing_names:
                db.add(Status(**row))
                created += 1

        db.commit()

        print(
            f"Seed complete. {created} new status rows created "
            f"({len(DEFAULT_STATUSES) - created} already existed)."
        )

    finally:
        db.close()


if __name__ == "__main__":
    seed_statuses()