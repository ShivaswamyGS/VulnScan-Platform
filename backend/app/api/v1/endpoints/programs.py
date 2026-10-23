"""
Bug Bounty Program endpoints.

PUBLIC / RESEARCHER:

- List public active Bug Bounty Programs
- View a public active Bug Bounty Program

COMPANY:

- Create Bug Bounty Programs
- List their own programs
- View their own programs
- Update their own programs
- Delete their own programs

Company management operations require:
- Authentication
- Approved company
- Active company account
"""

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_company
from app.db.session import get_db
from app.models.company import Company
from app.schemas.program import (
    ProgramCreate,
    ProgramRead,
    ProgramUpdate,
)
from app.services.program_service import (
    create_program,
    delete_program,
    get_company_programs,
    get_program_by_id,
    update_program,
    get_public_programs,
    get_public_program_by_id,
)

router = APIRouter()


# =========================================================
# PUBLIC / RESEARCHER — LIST PROGRAMS
# =========================================================

@router.get(
    "/",
    response_model=list[ProgramRead],
)
def get_public_programs_list(
    db: Session = Depends(get_db),
):
    """
    Return all active and public Bug Bounty Programs.

    This endpoint is intentionally public so researchers
    can browse available Bug Bounty Programs.
    """

    return get_public_programs(db)


# =========================================================
# COMPANY — LIST OWN PROGRAMS
# =========================================================

@router.get(
    "/company",
    response_model=list[ProgramRead],
)
def get_company_programs_list(
    db: Session = Depends(get_db),
    current_company: Company = Depends(
        get_current_company
    ),
):
    """
    Return all Bug Bounty Programs belonging
    to the authenticated company.
    """

    return get_company_programs(
        db,
        current_company,
    )


# =========================================================
# COMPANY — CREATE PROGRAM
# =========================================================

@router.post(
    "/",
    response_model=ProgramRead,
    status_code=status.HTTP_201_CREATED,
)
def add_program(
    program: ProgramCreate,
    db: Session = Depends(get_db),
    current_company: Company = Depends(
        get_current_company
    ),
):
    """
    Create a new Bug Bounty Program.

    Only approved companies can create programs.
    """

    return create_program(
        db,
        current_company,
        program,
    )


# =========================================================
# COMPANY — GET OWN PROGRAM
# =========================================================

@router.get(
    "/{program_id}",
    response_model=ProgramRead,
)
def get_company_program(
    program_id: int,
    db: Session = Depends(get_db),
    current_company: Company = Depends(
        get_current_company
    ),
):
    """
    Return a Bug Bounty Program belonging
    to the authenticated company.

    Companies can view their own programs,
    including private programs.
    """

    return get_program_by_id(
        db,
        program_id,
        current_company,
    )

# =========================================================
# COMPANY — UPDATE PROGRAM
# =========================================================

@router.put(
    "/{program_id}",
    response_model=ProgramRead,
)
def edit_program(
    program_id: int,
    data: ProgramUpdate,
    db: Session = Depends(get_db),
    current_company: Company = Depends(
        get_current_company
    ),
):
    """
    Update a company-owned Bug Bounty Program.
    """

    program = get_program_by_id(
        db,
        program_id,
        current_company,
    )

    return update_program(
        db,
        program,
        data,
        current_company,
    )


# =========================================================
# COMPANY — DELETE PROGRAM
# =========================================================

@router.delete(
    "/{program_id}",
)
def remove_program(
    program_id: int,
    db: Session = Depends(get_db),
    current_company: Company = Depends(
        get_current_company
    ),
):
    """
    Delete a company-owned Bug Bounty Program.
    """

    program = get_program_by_id(
        db,
        program_id,
        current_company,
    )

    delete_program(
        db,
        program,
    )

    return {
        "message": "Bug Bounty Program deleted successfully"
    }