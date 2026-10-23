"""
User service — data-access + creation logic for User.

Kept separate from the API layer (app/api/v1/endpoints/auth.py) so the
same functions can be reused by the seed script, tests, or a future
admin-management endpoint without duplicating logic.
"""

from sqlalchemy.orm import Session

from app.core.exceptions import ConflictError
from app.core.security import hash_password
from app.models.enums import RoleEnum
from app.models.user import User
from app.schemas.user import UserCreate


def get_user_by_email(db: Session, email: str) -> User | None:
    return db.query(User).filter(User.email == email.lower()).first()


def get_user_by_id(db: Session, user_id: int) -> User | None:
    return db.query(User).filter(User.id == user_id).first()


def create_user(db: Session, user_in: UserCreate, *, force_role: RoleEnum | None = None):
    print("=" * 50)
    print("EMAIL RECEIVED:", user_in.email)

    existing = get_user_by_email(db, user_in.email)
    print("EXISTING USER:", existing)

    if existing:
        print("USER ALREADY EXISTS!")
        raise ConflictError("An account with this email already exists")

    print("CREATING NEW USER...")

    user = User(
        full_name=user_in.full_name,
        email=user_in.email.lower(),
        hashed_password=hash_password(user_in.password),
        role=force_role if force_role is not None else user_in.role,
    )

    db.add(user)
    db.commit()
    db.refresh(user)

    print("USER CREATED SUCCESSFULLY")
    print("=" * 50)

    return user