"""
Bug Bounty Program endpoints for Internal Testers.

Internal testers can:

- View active/public Bug Bounty Programs
- View details of an available program

Companies continue to use programs.py for:
- Create
- Update
- Delete
- Manage their own programs
"""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.core.exceptions import ForbiddenError, NotFoundError
from app.db.session import get_db
from app.models.enums import RoleEnum
from app.models.program import BugBountyProgram
from app.models.user import User
from app.schemas.program import ProgramRead

"""
Bug Bounty Program endpoints for Internal Testers.

Internal testers can:

- View active/public Bug Bounty Programs
- View details of an available program

Companies continue to use programs.py for:
- Create
- Update
- Delete
- Manage their own programs
"""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.core.exceptions import ForbiddenError, NotFoundError
from app.db.session import get_db
from app.models.enums import RoleEnum
from app.models.program import BugBountyProgram
from app.models.user import User
from app.schemas.program import ProgramRead


router = APIRouter()


# =========================================================
# INTERNAL TESTER — LIST AVAILABLE PROGRAMS
# =========================================================

@router.get(
    "/",
    response_model=list[ProgramRead],
)
def get_available_programs(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Return active and public Bug Bounty Programs.

    Only Internal Testers can access the researcher
    program marketplace.
    """

    if current_user.role != RoleEnum.INTERNAL_TESTER:
        raise ForbiddenError(
            "Only internal testers can view Bug Bounty Programs"
        )

    programs = (
        db.query(BugBountyProgram)
        .filter(
            BugBountyProgram.status == "active",
            BugBountyProgram.visibility == "public",
            BugBountyProgram.is_active.is_(True),
        )
        .order_by(
            BugBountyProgram.created_at.desc()
        )
        .all()
    )

    return programs


# =========================================================
# INTERNAL TESTER — GET PROGRAM
# =========================================================

@router.get(
    "/{program_id}",
    response_model=ProgramRead,
)
def get_available_program(
    program_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Return an active/public Bug Bounty Program.

    Internal Testers can only access programs that are
    currently available for participation.
    """

    if current_user.role != RoleEnum.INTERNAL_TESTER:
        raise ForbiddenError(
            "Only internal testers can view Bug Bounty Programs"
        )

    program = (
        db.query(BugBountyProgram)
        .filter(
            BugBountyProgram.id == program_id,
            BugBountyProgram.status == "active",
            BugBountyProgram.visibility == "public",
            BugBountyProgram.is_active.is_(True),
        )
        .first()
    )

    if program is None:
        raise NotFoundError(
            "Bug Bounty Program not found or is not currently available"
        )

    return program

router = APIRouter()


# =========================================================
# INTERNAL TESTER — LIST AVAILABLE PROGRAMS
# =========================================================

@router.get(
    "/",
    response_model=list[ProgramRead],
)
def get_available_programs(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Return active and public Bug Bounty Programs.

    Only Internal Testers can access the researcher
    program marketplace.
    """

    if current_user.role != RoleEnum.INTERNAL_TESTER:
        raise ForbiddenError(
            "Only internal testers can view Bug Bounty Programs"
        )

    programs = (
        db.query(BugBountyProgram)
        .filter(
            BugBountyProgram.status == "active",
            BugBountyProgram.visibility == "public",
            BugBountyProgram.is_active.is_(True),
        )
        .order_by(
            BugBountyProgram.created_at.desc()
        )
        .all()
    )

    return programs


# =========================================================
# INTERNAL TESTER — GET PROGRAM
# =========================================================

@router.get(
    "/{program_id}",
    response_model=ProgramRead,
)
def get_available_program(
    program_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Return an active/public Bug Bounty Program.

    Internal Testers can only access programs that are
    currently available for participation.
    """

    if current_user.role != RoleEnum.INTERNAL_TESTER:
        raise ForbiddenError(
            "Only internal testers can view Bug Bounty Programs"
        )

    program = (
        db.query(BugBountyProgram)
        .filter(
            BugBountyProgram.id == program_id,
            BugBountyProgram.status == "active",
            BugBountyProgram.visibility == "public",
            BugBountyProgram.is_active.is_(True),
        )
        .first()
    )

    if program is None:
        raise NotFoundError(
            "Bug Bounty Program not found or is not currently available"
        )

    return program