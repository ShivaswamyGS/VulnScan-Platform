"""
Bootstrap script to create the FIRST admin account.

Since the public /auth/register endpoint can never create an admin
(by design — see app/api/v1/endpoints/auth.py), the very first admin
must be created out-of-band. Run this once per environment:

    python -m app.db.create_admin --email lead@company.com --name "Security Lead" --password "ChangeMe123!"

After that, admin-to-admin account creation should go through a proper
admin-management endpoint (Admin module) — this script is a bootstrap
tool, not a general-purpose user management interface.
"""

import argparse

from app.core.exceptions import ConflictError
from app.db.session import SessionLocal
from app.models.enums import RoleEnum
from app.schemas.user import UserCreate
from app.services.user_service import create_user


def main() -> None:
    parser = argparse.ArgumentParser(description="Create the first admin account.")
    parser.add_argument("--email", required=True)
    parser.add_argument("--name", required=True)
    parser.add_argument("--password", required=True)
    args = parser.parse_args()

    db = SessionLocal()
    try:
        user_in = UserCreate(full_name=args.name, email=args.email, password=args.password, role=RoleEnum.ADMIN)
        user = create_user(db, user_in, force_role=RoleEnum.ADMIN)
        print(f"Admin account created: id={user.id} email={user.email}")
    except ConflictError as exc:
        print(f"Error: {exc.message}")
    finally:
        db.close()


if __name__ == "__main__":
    main()
