"""
Bug Bounty Program service.

Handles:
- Creating programs
- Listing company programs
- Fetching a company-owned program
- Updating programs
- Deleting programs
- Validating company approval
- Validating program lifecycle and visibility
"""

from sqlalchemy.orm import Session

from app.core.exceptions import (
    ConflictError,
    ForbiddenError,
    NotFoundError,
)
from app.models.company import Company
from app.models.program import BugBountyProgram
from app.schemas.program import ProgramCreate, ProgramUpdate


# =========================================================
# VALIDATION HELPERS
# =========================================================

ALLOWED_STATUSES = {
    "draft",
    "active",
    "paused",
    "closed",
}

ALLOWED_VISIBILITY = {
    "private",
    "public",
}


def _validate_program_values(
    *,
    status: str | None = None,
    visibility: str | None = None,
    reward_min: int | None = None,
    reward_max: int | None = None,
) -> None:
    """
    Validate program lifecycle, visibility and reward values.
    """

    if status is not None and status not in ALLOWED_STATUSES:
        raise ConflictError(
            "Invalid program status. "
            "Allowed values: draft, active, paused, closed"
        )

    if visibility is not None and visibility not in ALLOWED_VISIBILITY:
        raise ConflictError(
            "Invalid program visibility. "
            "Allowed values: private, public"
        )

    if reward_min is not None and reward_min < 0:
        raise ConflictError(
            "Minimum reward cannot be negative"
        )

    if reward_max is not None and reward_max < 0:
        raise ConflictError(
            "Maximum reward cannot be negative"
        )

    if (
        reward_min is not None
        and reward_max is not None
        and reward_min > reward_max
    ):
        raise ConflictError(
            "Minimum reward cannot be greater than maximum reward"
        )


def _ensure_company_approved(
    company: Company,
) -> None:
    """
    Only approved companies can manage Bug Bounty Programs.
    """

    if company.approval_status != "approved":
        raise ForbiddenError(
            "Only approved companies can manage Bug Bounty Programs"
        )

    if not company.is_active:
        raise ForbiddenError(
            "Company account is inactive"
        )


# =========================================================
# LIST COMPANY PROGRAMS
# =========================================================

def get_company_programs(
    db: Session,
    company: Company,
) -> list[BugBountyProgram]:
    """
    Return only programs belonging to the authenticated company.
    """

    _ensure_company_approved(company)

    return (
        db.query(BugBountyProgram)
        .filter(
            BugBountyProgram.company_id == company.id
        )
        .order_by(
            BugBountyProgram.created_at.desc()
        )
        .all()
    )


# =========================================================
# GET PROGRAM BY ID
# =========================================================

def get_program_by_id(
    db: Session,
    program_id: int,
    company: Company,
) -> BugBountyProgram:
    """
    Get a program only if it belongs to the authenticated company.
    """

    _ensure_company_approved(company)

    program = (
        db.query(BugBountyProgram)
        .filter(
            BugBountyProgram.id == program_id,
            BugBountyProgram.company_id == company.id,
        )
        .first()
    )

    if program is None:
        raise NotFoundError(
            "Bug Bounty Program not found"
        )

    return program
# =========================================================
# PUBLIC — LIST PROGRAMS
# =========================================================

def get_public_programs(
    db: Session,
) -> list[BugBountyProgram]:
    """
    Return Bug Bounty Programs that researchers
    are allowed to discover.

    Only programs that are:
    - active
    - public
    - enabled
    are returned.
    """

    return (
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


# =========================================================
# PUBLIC — GET PROGRAM BY ID
# =========================================================

def get_public_program_by_id(
    db: Session,
    program_id: int,
) -> BugBountyProgram:
    """
    Return a Bug Bounty Program only if it is
    publicly available to researchers.
    """

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
            "Bug Bounty Program not found"
        )

    return program

# =========================================================
# CREATE PROGRAM
# =========================================================

def create_program(
    db: Session,
    company: Company,
    data: ProgramCreate,
) -> BugBountyProgram:
    """
    Create a Bug Bounty Program for the authenticated company.
    """

    _ensure_company_approved(company)

    _validate_program_values(
        status=data.status,
        visibility=data.visibility,
        reward_min=data.reward_min,
        reward_max=data.reward_max,
    )

    # Prevent duplicate program names
    existing_program = (
        db.query(BugBountyProgram)
        .filter(
            BugBountyProgram.company_id == company.id,
            BugBountyProgram.program_name
            == data.program_name,
        )
        .first()
    )

    if existing_program:
        raise ConflictError(
            "A Bug Bounty Program with this name already exists"
        )

    # Validate date range
    if (
        data.end_date is not None
        and data.end_date < data.start_date
    ):
        raise ConflictError(
            "End date cannot be earlier than start date"
        )

    program = BugBountyProgram(
        company_id=company.id,
        program_name=data.program_name,
        description=data.description,
        target_website=data.target_website,
        scope=data.scope,
        out_of_scope=data.out_of_scope,
        reward_min=data.reward_min,
        reward_max=data.reward_max,
        severity_reward_matrix=data.severity_reward_matrix,
        program_rules=data.program_rules,
        submission_guidelines=data.submission_guidelines,
        start_date=data.start_date,
        end_date=data.end_date,
        status=data.status,
        visibility=data.visibility,
        attachments=data.attachments,
        is_active=data.is_active,
    )

    db.add(program)
    db.commit()
    db.refresh(program)

    return program


# =========================================================
# UPDATE PROGRAM
# =========================================================

def update_program(
    db: Session,
    program: BugBountyProgram,
    data: ProgramUpdate,
    company: Company,
) -> BugBountyProgram:
    """
    Update a company-owned Bug Bounty Program.
    """

    _ensure_company_approved(company)

    update_data = data.model_dump(
        exclude_unset=True
    )

    # Nothing to update
    if not update_data:
        return program

    # -----------------------------------------------------
    # STATUS
    # -----------------------------------------------------

    if "status" in update_data:
        _validate_program_values(
            status=update_data["status"]
        )

    # -----------------------------------------------------
    # VISIBILITY
    # -----------------------------------------------------

    if "visibility" in update_data:
        _validate_program_values(
            visibility=update_data["visibility"]
        )

    # -----------------------------------------------------
    # REWARD VALIDATION
    # -----------------------------------------------------

    new_reward_min = update_data.get(
        "reward_min",
        program.reward_min,
    )

    new_reward_max = update_data.get(
        "reward_max",
        program.reward_max,
    )

    _validate_program_values(
        reward_min=new_reward_min,
        reward_max=new_reward_max,
    )

    # -----------------------------------------------------
    # DATE VALIDATION
    # -----------------------------------------------------

    new_start_date = update_data.get(
        "start_date",
        program.start_date,
    )

    new_end_date = update_data.get(
        "end_date",
        program.end_date,
    )

    if (
        new_end_date is not None
        and new_end_date < new_start_date
    ):
        raise ConflictError(
            "End date cannot be earlier than start date"
        )

    # -----------------------------------------------------
    # PROGRAM NAME
    # -----------------------------------------------------

    if "program_name" in update_data:

        new_name = update_data["program_name"]

        existing_program = (
            db.query(BugBountyProgram)
            .filter(
                BugBountyProgram.company_id == company.id,
                BugBountyProgram.program_name == new_name,
                BugBountyProgram.id != program.id,
            )
            .first()
        )

        if existing_program:
            raise ConflictError(
                "A Bug Bounty Program with this name already exists"
            )

    # -----------------------------------------------------
    # APPLY UPDATE
    # -----------------------------------------------------

    for key, value in update_data.items():
        setattr(
            program,
            key,
            value,
        )

    db.commit()
    db.refresh(program)

    return program


# =========================================================
# DELETE PROGRAM
# =========================================================

def delete_program(
    db: Session,
    program: BugBountyProgram,
) -> None:
    """
    Delete a company-owned Bug Bounty Program.
    """

    db.delete(program)
    db.commit()