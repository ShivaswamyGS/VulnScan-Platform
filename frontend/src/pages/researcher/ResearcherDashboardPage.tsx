
from fastapi import APIRouter

from app.api.v1.endpoints import (
admin,
assets,
audit_logs,
auth,
company,
company_auth,
company_reports,
dashboard,
datasets,
employees,
health,
predictions,
programs,
projects,
reports,
researcher_programs,
statuses,
submissions,
training,
)
from app.api.v1.endpoints import users

api_router = APIRouter()

=========================================================
HEALTH
=========================================================

api_router.include_router(
health.router,
prefix="/health",
tags=["Health"],
)

=========================================================
INTERNAL USER AUTHENTICATION
=========================================================

api_router.include_router(
auth.router,
prefix="/auth",
tags=["Authentication"],
)

=========================================================
COMPANY AUTHENTICATION
=========================================================

api_router.include_router(
company_auth.router,
prefix="/company",
tags=["Company Authentication"],
)

=========================================================
COMPANY MANAGEMENT
=========================================================

api_router.include_router(
company.router,
prefix="/company",
tags=["Company"],
)

=========================================================
COMPANY EMPLOYEES
=========================================================

api_router.include_router(
employees.router,
prefix="/company/employees",
tags=["Company Employees"],
)

=========================================================
COMPANY PROJECTS
=========================================================

api_router.include_router(
projects.router,
prefix="/company/projects",
tags=["Company Projects"],
)

=========================================================
COMPANY ASSETS
=========================================================

api_router.include_router(
assets.router,
prefix="/company/assets",
tags=["Company Assets"],
)

=========================================================
COMPANY REPORTS
=========================================================

api_router.include_router(
company_reports.router,
prefix="/company/reports",
tags=["Company Reports"],
)

=========================================================
INTERNAL REPORTS
=========================================================

api_router.include_router(
reports.router,
prefix="/reports",
tags=["Reports"],
)

=========================================================
AI PREDICTIONS
=========================================================

api_router.include_router(
predictions.router,
prefix="/predictions",
tags=["Predictions"],
)

=========================================================
STATUSES
=========================================================

api_router.include_router(
statuses.router,
prefix="/statuses",
tags=["Statuses"],
)

=========================================================
DASHBOARD
=========================================================

api_router.include_router(
dashboard.router,
prefix="/dashboard",
tags=["Dashboard"],
)

=========================================================
BUG BOUNTY PROGRAMS
=========================================================

api_router.include_router(
programs.router,
prefix="/company/programs",
tags=["Company Bug Bounty Programs"],
)

=========================================================
INTERNAL TESTER — BUG BOUNTY PROGRAMS
=========================================================

api_router.include_router(
researcher_programs.router,
prefix="/programs",
tags=["Researcher Bug Bounty Programs"],
)

=========================================================
AUDIT LOGS
=========================================================

api_router.include_router(
audit_logs.router,
prefix="/audit-logs",
tags=["Audit Logs"],
)

=========================================================
ADMIN
=========================================================

api_router.include_router(
admin.router,
prefix="/admin",
tags=["Admin"],
)

---------------------------------------------------------
BUG BOUNTY SUBMISSIONS
---------------------------------------------------------

api_router.include_router(
submissions.router,
prefix="/submissions",
tags=["Bug Bounty Submissions"],
)

---------------------------------------------------------
AI TRAINING DATASETS
---------------------------------------------------------

api_router.include_router(
datasets.router,
prefix="/admin/datasets",
tags=["AI Training Datasets"],
)

---------------------------------------------------------
AI MODEL TRAINING
---------------------------------------------------------

api_router.include_router(
training.router,
prefix="/admin/training",
tags=["AI Model Training"],
)

=========================================================
ADMIN USER MANAGEMENT
=========================================================

api_router.include_router(
users.router,
prefix="/users",
tags=["Users"],
)

"""
Bug Bounty Program endpoints.

PUBLIC / RESEARCHER:

List public active Bug Bounty Programs
View a public active Bug Bounty Program

COMPANY:

Create Bug Bounty Programs
List their own programs
View their own programs
Update their own programs
Delete their own programs

Company management operations require:

Authentication
Approved company
Active company account
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

=========================================================
PUBLIC / RESEARCHER — LIST PROGRAMS
=========================================================

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

=========================================================
COMPANY — LIST OWN PROGRAMS
=========================================================

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

=========================================================
COMPANY — CREATE PROGRAM
=========================================================

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

=========================================================
PUBLIC / RESEARCHER — GET PROGRAM
=========================================================

@router.get(
"/{program_id}",
response_model=ProgramRead,
)
def get_public_program(
program_id: int,
db: Session = Depends(get_db),
):
"""
Return a public active Bug Bounty Program.

Researchers can only access programs that are:
- active
- public
- enabled
"""

return get_public_program_by_id(
    db,
    program_id,
)

=========================================================
COMPANY — UPDATE PROGRAM
=========================================================

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

=========================================================
COMPANY — DELETE PROGRAM
=========================================================

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


"""
Bug Bounty Program model.

A Bug Bounty Program is owned by a company and defines the rules,
targets, scope, rewards, and visibility for security researchers.

Only approved companies will be allowed to create programs.
That business rule is enforced at the service/API layer.

Program lifecycle:
draft -> active -> paused -> closed

Visibility:
private -> public
"""

from __future__ import annotations

from datetime import datetime

from sqlalchemy import (
    Boolean,
    DateTime,
    ForeignKey,
    Integer,
    String,
    Text,
    func,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base_class import Base


class BugBountyProgram(Base):
    __tablename__ = "bug_bounty_programs"

    # =========================================================
    # PRIMARY KEY
    # =========================================================

    id: Mapped[int] = mapped_column(
        primary_key=True,
        index=True,
    )

    # =========================================================
    # COMPANY OWNERSHIP
    # =========================================================

    company_id: Mapped[int] = mapped_column(
        ForeignKey("companies.id"),
        nullable=False,
        index=True,
    )

    # =========================================================
    # BASIC INFORMATION
    # =========================================================

    program_name: Mapped[str] = mapped_column(
        String(200),
        nullable=False,
        index=True,
    )

    description: Mapped[str] = mapped_column(
        Text,
        nullable=False,
    )

    target_website: Mapped[str] = mapped_column(
        String(500),
        nullable=False,
    )

    # =========================================================
    # SCOPE
    # =========================================================

    scope: Mapped[str] = mapped_column(
        Text,
        nullable=False,
    )

    out_of_scope: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    # =========================================================
    # REWARD INFORMATION
    # =========================================================

    reward_min: Mapped[int | None] = mapped_column(
        Integer,
        nullable=True,
    )

    reward_max: Mapped[int | None] = mapped_column(
        Integer,
        nullable=True,
    )

    severity_reward_matrix: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    # =========================================================
    # PROGRAM RULES
    # =========================================================

    program_rules: Mapped[str] = mapped_column(
        Text,
        nullable=False,
    )

    submission_guidelines: Mapped[str] = mapped_column(
        Text,
        nullable=False,
    )

    # =========================================================
    # PROGRAM DATES
    # =========================================================

    start_date: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
    )

    end_date: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )

    # =========================================================
    # PROGRAM STATUS
    # =========================================================

    status: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
        default="draft",
        index=True,
    )

    # =========================================================
    # VISIBILITY
    # =========================================================

    visibility: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
        default="private",
        index=True,
    )

    # =========================================================
    # ATTACHMENTS
    # =========================================================

    attachments: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    # =========================================================
    # ACTIVE FLAG
    # =========================================================

    is_active: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        default=True,
    )

    # =========================================================
    # TIMESTAMPS
    # =========================================================

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

    # =========================================================
    # RELATIONSHIP
    # =========================================================

    company: Mapped["Company"] = relationship(
        "Company",
    )

    # =========================================================
    # REPRESENTATION
    # =========================================================

    def __repr__(self) -> str:
        return (
            f"<BugBountyProgram "
            f"id={self.id} "
            f"name={self.program_name!r} "
            f"company_id={self.company_id} "
            f"status={self.status!r}>"
        )

"""
Schemas for Bug Bounty Programs.
"""

from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


# =========================================================
# CREATE
# =========================================================

class ProgramCreate(BaseModel):
    program_name: str = Field(
        ...,
        min_length=3,
        max_length=200,
    )

    description: str = Field(
        ...,
        min_length=10,
    )

    target_website: str = Field(
        ...,
        min_length=3,
        max_length=500,
    )

    scope: str = Field(
        ...,
        min_length=3,
    )

    out_of_scope: str | None = None

    reward_min: int | None = Field(
        default=None,
        ge=0,
    )

    reward_max: int | None = Field(
        default=None,
        ge=0,
    )

    severity_reward_matrix: str | None = None

    program_rules: str = Field(
        ...,
        min_length=10,
    )

    submission_guidelines: str = Field(
        ...,
        min_length=10,
    )

    start_date: datetime

    end_date: datetime | None = None

    status: str = Field(
        default="draft",
    )

    visibility: str = Field(
        default="private",
    )

    attachments: str | None = None

    is_active: bool = True


# =========================================================
# UPDATE
# =========================================================

class ProgramUpdate(BaseModel):
    program_name: str | None = Field(
        default=None,
        min_length=3,
        max_length=200,
    )

    description: str | None = Field(
        default=None,
        min_length=10,
    )

    target_website: str | None = Field(
        default=None,
        min_length=3,
        max_length=500,
    )

    scope: str | None = Field(
        default=None,
        min_length=3,
    )

    out_of_scope: str | None = None

    reward_min: int | None = Field(
        default=None,
        ge=0,
    )

    reward_max: int | None = Field(
        default=None,
        ge=0,
    )

    severity_reward_matrix: str | None = None

    program_rules: str | None = Field(
        default=None,
        min_length=10,
    )

    submission_guidelines: str | None = Field(
        default=None,
        min_length=10,
    )

    start_date: datetime | None = None

    end_date: datetime | None = None

    status: str | None = None

    visibility: str | None = None

    attachments: str | None = None

    is_active: bool | None = None


# =========================================================
# READ
# =========================================================

class ProgramRead(BaseModel):
    model_config = ConfigDict(
        from_attributes=True
    )

    id: int
    company_id: int

    program_name: str
    description: str
    target_website: str

    scope: str
    out_of_scope: str | None

    reward_min: int | None
    reward_max: int | None

    severity_reward_matrix: str | None

    program_rules: str
    submission_guidelines: str

    start_date: datetime
    end_date: datetime | None

    status: str
    visibility: str

    attachments: str | None

    is_active: bool

    created_at: datetime
    updated_at: datetime


from datetime import datetime, timezone

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import require_admin
from app.core.exceptions import ConflictError, NotFoundError
from app.db.session import get_db
from app.models.audit_log import AuditLog
from app.models.company import Company
from app.models.enums import AuditActionEnum
from app.models.user import User
from app.services.audit_log_service import create_audit_log

router = APIRouter()


# =========================================================
# LIST PENDING COMPANIES
# =========================================================

@router.get("/companies/pending")
def get_pending_companies(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    """
    Return all companies waiting for administrator approval.
    """

    companies = (
        db.query(Company)
        .filter(
            Company.approval_status == "pending"
        )
        .order_by(Company.created_at.desc())
        .all()
    )

    return [
        {
            "id": company.id,
            "company_name": company.company_name,
            "email": company.email,
            "website": company.website,
            "industry": company.industry,
            "country": company.country,
            "phone": company.phone,
            "approval_status": company.approval_status,
            "approval_reason": company.approval_reason,
            "created_at": company.created_at,
        }
        for company in companies
    ]


# =========================================================
# APPROVE COMPANY
# =========================================================

@router.post("/companies/{company_id}/approve")
def approve_company(
    company_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    """
    Approve a pending company registration.
    """

    company = (
        db.query(Company)
        .filter(Company.id == company_id)
        .first()
    )

    if company is None:
        raise NotFoundError("Company not found")

    if company.approval_status != "pending":
        raise ConflictError(
            f"Company cannot be approved because its current "
            f"status is '{company.approval_status}'"
        )

    old_status = company.approval_status

    company.approval_status = "approved"
    company.approval_reason = None
    company.approved_at = datetime.now(timezone.utc)

    create_audit_log(
        db,
        user_id=current_user.id,
        action=AuditActionEnum.STATUS_CHANGE,
        entity_type="company",
        entity_id=company.id,
        details={
            "action": "company_approval",
            "old_status": old_status,
            "new_status": "approved",
            "company_name": company.company_name,
        },
    )

    db.commit()
    db.refresh(company)

    return {
        "message": "Company approved successfully",
        "company_id": company.id,
        "approval_status": company.approval_status,
        "approved_at": company.approved_at,
    }


# =========================================================
# REJECT COMPANY
# =========================================================

@router.post("/companies/{company_id}/reject")
def reject_company(
    company_id: int,
    reason: str | None = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    """
    Reject a pending company registration.
    """

    company = (
        db.query(Company)
        .filter(Company.id == company_id)
        .first()
    )

    if company is None:
        raise NotFoundError("Company not found")

    if company.approval_status != "pending":
        raise ConflictError(
            f"Company cannot be rejected because its current "
            f"status is '{company.approval_status}'"
        )

    old_status = company.approval_status

    company.approval_status = "rejected"
    company.approval_reason = reason
    company.approved_at = None

    create_audit_log(
        db,
        user_id=current_user.id,
        action=AuditActionEnum.STATUS_CHANGE,
        entity_type="company",
        entity_id=company.id,
        details={
            "action": "company_rejection",
            "old_status": old_status,
            "new_status": "rejected",
            "company_name": company.company_name,
            "reason": reason,
        },
    )

    db.commit()
    db.refresh(company)

    return {
        "message": "Company rejected successfully",
        "company_id": company.id,
        "approval_status": company.approval_status,
        "approval_reason": company.approval_reason,
    }
    
    # =========================================================
# ADMIN USER MANAGEMENT
# =========================================================

@router.get("/users")
def get_users(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    """
    Return all users.

    Only administrators can view the user list.
    """

    users = (
        db.query(User)
        .order_by(User.created_at.desc())
        .all()
    )

    return [
        {
            "id": user.id,
            "full_name": user.full_name,
            "email": user.email,
            "role": user.role.value
            if hasattr(user.role, "value")
            else str(user.role),
            "is_active": user.is_active,
            "company_id": user.company_id,
            "department": user.department,
            "designation": user.designation,
            "employee_id": user.employee_id,
            "created_at": user.created_at,
            "updated_at": user.updated_at,
        }
        for user in users
    ]


# =========================================================
# GET USER DETAILS
# =========================================================

@router.get("/users/{user_id}")
def get_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    """
    Return details of a specific user.
    """

    user = (
        db.query(User)
        .filter(User.id == user_id)
        .first()
    )

    if user is None:
        raise NotFoundError("User not found")

    return {
        "id": user.id,
        "full_name": user.full_name,
        "email": user.email,
        "role": user.role.value
        if hasattr(user.role, "value")
        else str(user.role),
        "is_active": user.is_active,
        "company_id": user.company_id,
        "department": user.department,
        "designation": user.designation,
        "employee_id": user.employee_id,
        "created_at": user.created_at,
        "updated_at": user.updated_at,
    }


# =========================================================
# DEACTIVATE USER
# =========================================================

@router.post("/users/{user_id}/deactivate")
def deactivate_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    """
    Deactivate a user account.

    Administrators cannot deactivate their own account.
    """

    user = (
        db.query(User)
        .filter(User.id == user_id)
        .first()
    )

    if user is None:
        raise NotFoundError("User not found")

    if user.id == current_user.id:
        raise ConflictError(
            "Administrators cannot deactivate their own account"
        )

    if not user.is_active:
        raise ConflictError(
            "User is already inactive"
        )

    old_status = user.is_active

    user.is_active = False

    create_audit_log(
        db,
        user_id=current_user.id,
        action=AuditActionEnum.STATUS_CHANGE,
        entity_type="user",
        entity_id=user.id,
        details={
            "action": "user_deactivation",
            "old_status": old_status,
            "new_status": False,
            "user_email": user.email,
        },
    )

    db.commit()
    db.refresh(user)

    return {
        "message": "User deactivated successfully",
        "user_id": user.id,
        "is_active": user.is_active,
    }


# =========================================================
# ACTIVATE USER
# =========================================================

@router.post("/users/{user_id}/activate")
def activate_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    """
    Activate a previously deactivated user.
    """

    user = (
        db.query(User)
        .filter(User.id == user_id)
        .first()
    )

    if user is None:
        raise NotFoundError("User not found")

    if user.is_active:
        raise ConflictError(
            "User is already active"
        )

    old_status = user.is_active

    user.is_active = True

    create_audit_log(
        db,
        user_id=current_user.id,
        action=AuditActionEnum.STATUS_CHANGE,
        entity_type="user",
        entity_id=user.id,
        details={
            "action": "user_activation",
            "old_status": old_status,
            "new_status": True,
            "user_email": user.email,
        },
    )

    db.commit()
    db.refresh(user)

    return {
        "message": "User activated successfully",
        "user_id": user.id,
        "is_active": user.is_active,
    }


"""
Admin service.

Provides administrator-only access to Bug Bounty Programs
and Vulnerability Submissions.

All functions operate across companies because administrators
are trusted platform-level users.
"""

from sqlalchemy.orm import Session, joinedload

from app.core.exceptions import NotFoundError
from app.models.program import BugBountyProgram
from app.models.submission import VulnerabilitySubmission


# =========================================================
# BUG BOUNTY PROGRAMS
# =========================================================

def get_all_programs(
    db: Session,
) -> list[BugBountyProgram]:
    """
    Return all Bug Bounty Programs.

    Administrators can see programs belonging to every company.
    """

    return (
        db.query(BugBountyProgram)
        .order_by(
            BugBountyProgram.created_at.desc()
        )
        .all()
    )


def get_program_by_id(
    db: Session,
    program_id: int,
) -> BugBountyProgram:
    """
    Return any Bug Bounty Program by ID.

    No company ownership restriction is applied because
    this function is intended for administrators.
    """

    program = (
        db.query(BugBountyProgram)
        .filter(
            BugBountyProgram.id == program_id
        )
        .first()
    )

    if program is None:
        raise NotFoundError(
            "Bug Bounty Program not found"
        )

    return program


# =========================================================
# VULNERABILITY SUBMISSIONS
# =========================================================

def get_all_submissions(
    db: Session,
) -> list[VulnerabilitySubmission]:
    """
    Return all vulnerability submissions
    across all Bug Bounty Programs.
    """

    return (
        db.query(VulnerabilitySubmission)
        .options(
            joinedload(
                VulnerabilitySubmission.program
            ),
            joinedload(
                VulnerabilitySubmission.researcher
            ),
        )
        .order_by(
            VulnerabilitySubmission.submitted_at.desc()
        )
        .all()
    )


def get_submission_by_id(
    db: Session,
    submission_id: int,
) -> VulnerabilitySubmission:
    """
    Return any vulnerability submission by ID.

    Administrators can access submissions belonging
    to any company or researcher.
    """

    submission = (
        db.query(VulnerabilitySubmission)
        .options(
            joinedload(
                VulnerabilitySubmission.program
            ),
            joinedload(
                VulnerabilitySubmission.researcher
            ),
        )
        .filter(
            VulnerabilitySubmission.id
            == submission_id
        )
        .first()
    )

    if submission is None:
        raise NotFoundError(
            "Vulnerability submission not found"
        )

    return submission

"""
Admin service.

Provides administrator-only access to Bug Bounty Programs
and Vulnerability Submissions.

All functions operate across companies because administrators
are trusted platform-level users.
"""

from sqlalchemy.orm import Session, joinedload

from app.core.exceptions import NotFoundError
from app.models.program import BugBountyProgram
from app.models.submission import VulnerabilitySubmission


# =========================================================
# BUG BOUNTY PROGRAMS
# =========================================================

def get_all_programs(
    db: Session,
) -> list[BugBountyProgram]:
    """
    Return all Bug Bounty Programs.

    Administrators can see programs belonging to every company.
    """

    return (
        db.query(BugBountyProgram)
        .order_by(
            BugBountyProgram.created_at.desc()
        )
        .all()
    )


def get_program_by_id(
    db: Session,
    program_id: int,
) -> BugBountyProgram:
    """
    Return any Bug Bounty Program by ID.

    No company ownership restriction is applied because
    this function is intended for administrators.
    """

    program = (
        db.query(BugBountyProgram)
        .filter(
            BugBountyProgram.id == program_id
        )
        .first()
    )

    if program is None:
        raise NotFoundError(
            "Bug Bounty Program not found"
        )

    return program


# =========================================================
# VULNERABILITY SUBMISSIONS
# =========================================================

def get_all_submissions(
    db: Session,
) -> list[VulnerabilitySubmission]:
    """
    Return all vulnerability submissions
    across all Bug Bounty Programs.
    """

    return (
        db.query(VulnerabilitySubmission)
        .options(
            joinedload(
                VulnerabilitySubmission.program
            ),
            joinedload(
                VulnerabilitySubmission.researcher
            ),
        )
        .order_by(
            VulnerabilitySubmission.submitted_at.desc()
        )
        .all()
    )


def get_submission_by_id(
    db: Session,
    submission_id: int,
) -> VulnerabilitySubmission:
    """
    Return any vulnerability submission by ID.

    Administrators can access submissions belonging
    to any company or researcher.
    """

    submission = (
        db.query(VulnerabilitySubmission)
        .options(
            joinedload(
                VulnerabilitySubmission.program
            ),
            joinedload(
                VulnerabilitySubmission.researcher
            ),
        )
        .filter(
            VulnerabilitySubmission.id
            == submission_id
        )
        .first()
    )

    if submission is None:
        raise NotFoundError(
            "Vulnerability submission not found"
        )

    return submission


from collections import defaultdict

from sqlalchemy.orm import Session, joinedload

from app.core.security import hash_password
from app.models.company import Company
from app.models.user import User
from app.models.report import Report
from app.models.enums import SeverityEnum
from app.schemas.company import CompanyCreate, CompanyUpdate
from app.schemas.dashboard import DashboardStats
from app.schemas.report import ReportListItem


def get_company_by_email(
    db: Session,
    email: str,
) -> Company | None:
    return (
        db.query(Company)
        .filter(Company.email == email.lower())
        .first()
    )


def get_company_by_id(
    db: Session,
    company_id: int,
) -> Company | None:
    return (
        db.query(Company)
        .filter(Company.id == company_id)
        .first()
    )


def get_all_companies(db: Session):
    return db.query(Company).all()


def create_company(
    db: Session,
    company: CompanyCreate,
) -> Company:

    new_company = Company(
        company_name=company.company_name,
        email=company.email.lower(),
        hashed_password=hash_password(company.password),
        website=company.website,
        industry=company.industry,
        country=company.country,
        phone=company.phone,

        # Company approval workflow
        approval_status="pending",
        approval_reason=None,
        approved_at=None,
    )

    db.add(new_company)
    db.commit()
    db.refresh(new_company)

    return new_company


def update_company(
    db: Session,
    company: Company,
    data: CompanyUpdate,
) -> Company:

    update_data = data.model_dump(exclude_unset=True)

    for key, value in update_data.items():
        setattr(company, key, value)

    db.commit()
    db.refresh(company)

    return company


def delete_company(
    db: Session,
    company: Company,
):
    db.delete(company)
    db.commit()


def get_dashboard_stats(
    db: Session,
    company_id: int,
) -> DashboardStats:

    # Get only reports submitted by employees
    # belonging to this company.
    reports = (
        db.query(Report)
        .join(User, Report.reporter_id == User.id)
        .options(
            joinedload(Report.status),
            joinedload(Report.predictions),
            joinedload(Report.reporter),
        )
        .filter(User.company_id == company_id)
        .all()
    )

    # ---------------------------------------------------------
    # Severity counts
    # ---------------------------------------------------------

    severity_counts: dict[str, int] = {
        severity.value: 0
        for severity in SeverityEnum
    }

    # ---------------------------------------------------------
    # Status counts
    # ---------------------------------------------------------

    status_counts: dict[str, int] = defaultdict(int)

    open_count = 0
    resolved_count = 0

    # ---------------------------------------------------------
    # Aggregate reports
    # ---------------------------------------------------------

    for report in reports:

        # Status
        if report.status:
            status_counts[report.status.name] += 1

            if report.status.is_terminal:
                resolved_count += 1
            else:
                open_count += 1

        # Latest AI prediction
        if report.predictions:

            latest_prediction = report.predictions[0]

            severity = latest_prediction.predicted_severity.value

            if severity in severity_counts:
                severity_counts[severity] += 1

    # ---------------------------------------------------------
    # Recent reports
    # ---------------------------------------------------------

    recent_reports = sorted(
        reports,
        key=lambda report: report.submission_date,
        reverse=True,
    )[:10]

    recent_items = [
        ReportListItem(
            id=report.id,
            title=report.title,
            category=report.category,
            priority=report.priority,
            submission_date=report.submission_date,
            status=report.status,
            latest_prediction=(
                report.predictions[0]
                if report.predictions
                else None
            ),
        )
        for report in recent_reports
    ]

    # ---------------------------------------------------------
    # Return dashboard statistics
    # ---------------------------------------------------------

    return DashboardStats(
        total_reports=len(reports),

        critical_reports=severity_counts["critical"],
        high_reports=severity_counts["high"],
        medium_reports=severity_counts["medium"],
        low_reports=severity_counts["low"],

        open_reports=open_count,
        resolved_reports=resolved_count,

        severity_distribution=severity_counts,
        status_distribution=dict(status_counts),

        recent_reports=recent_items,
    )


from __future__ import annotations

from datetime import datetime

from sqlalchemy import Boolean, DateTime, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base_class import Base


class Company(Base):
    __tablename__ = "companies"

    id: Mapped[int] = mapped_column(
        primary_key=True,
        index=True,
    )

    company_name: Mapped[str] = mapped_column(
        String(200),
        nullable=False,
        unique=True,
    )

    email: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
        unique=True,
        index=True,
    )

    hashed_password: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )

    website: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True,
    )

    industry: Mapped[str | None] = mapped_column(
        String(100),
        nullable=True,
    )

    country: Mapped[str | None] = mapped_column(
        String(100),
        nullable=True,
    )

    phone: Mapped[str | None] = mapped_column(
        String(30),
        nullable=True,
    )

    logo: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True,
    )

    is_active: Mapped[bool] = mapped_column(
        Boolean,
        default=True,
        nullable=False,
    )

    # =====================================================
    # COMPANY APPROVAL WORKFLOW
    # =====================================================

    approval_status: Mapped[str] = mapped_column(
        String(20),
        default="pending",
        nullable=False,
        index=True,
    )

    approval_reason: Mapped[str | None] = mapped_column(
        String(500),
        nullable=True,
    )

    approved_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )

    # =====================================================
    # TIMESTAMPS
    # =====================================================

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
    )

    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
    )

    # =====================================================
    # RELATIONSHIPS
    # =====================================================

    employees: Mapped[list["User"]] = relationship(
        "User",
        back_populates="company",
    )

    projects: Mapped[list["Project"]] = relationship(
        "Project",
        back_populates="company",
        cascade="all, delete-orphan",
    )

    assets: Mapped[list["Asset"]] = relationship(
        "Asset",
        back_populates="company",
        cascade="all, delete-orphan",
    )

    def __repr__(self) -> str:
        return (
            f"<Company id={self.id} "
            f"name={self.company_name!r} "
            f"status={self.approval_status!r}>"
        )

"""
Bug Bounty vulnerability submission endpoints.

Researchers can:
- Submit vulnerabilities to active Bug Bounty Programs
- View their own submissions
- View a specific submission
- Delete their own submissions

Companies can:
- View submissions belonging to their programs
- View a specific submission
- Review/update submission status, severity and bounty

Ownership is always verified in the service layer.
"""

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.api.deps import (
    get_current_company,
    get_current_user,
)
from app.core.exceptions import ForbiddenError
from app.db.session import get_db
from app.models.company import Company
from app.models.enums import RoleEnum
from app.models.submission import VulnerabilitySubmission
from app.models.user import User
from app.schemas.submission import (
    SubmissionCreate,
    SubmissionRead,
    SubmissionUpdate,
)
from app.services.submission_service import (
    create_submission,
    delete_submission,
    get_company_submission_by_id,
    get_company_submissions,
    get_researcher_submission_by_id,
    get_researcher_submissions,
    update_submission,
)

router = APIRouter()


# =========================================================
# RESEARCHER — CREATE SUBMISSION
# =========================================================

@router.post(
    "/programs/{program_id}",
    response_model=SubmissionRead,
    status_code=status.HTTP_201_CREATED,
)
def submit_vulnerability(
    program_id: int,
    data: SubmissionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Submit a vulnerability to an active Bug Bounty Program.

    Only Internal Testers can submit vulnerabilities.
    """

    if current_user.role != RoleEnum.INTERNAL_TESTER:
        raise ForbiddenError(
            "Only internal testers can submit vulnerabilities"
        )

    return create_submission(
        db,
        current_user,
        program_id,
        data,
    )


# =========================================================
# RESEARCHER — LIST OWN SUBMISSIONS
# =========================================================

@router.get(
    "/mine",
    response_model=list[SubmissionRead],
)
def get_my_submissions(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Return only submissions created by the authenticated
    researcher.
    """

    if current_user.role != RoleEnum.INTERNAL_TESTER:
        raise ForbiddenError(
            "Only internal testers can view researcher submissions"
        )

    return get_researcher_submissions(
        db,
        current_user,
    )


# =========================================================
# RESEARCHER — GET OWN SUBMISSION
# =========================================================

@router.get(
    "/mine/{submission_id}",
    response_model=SubmissionRead,
)
def get_my_submission(
    submission_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Return a submission only if it belongs to the
    authenticated researcher.
    """

    if current_user.role != RoleEnum.INTERNAL_TESTER:
        raise ForbiddenError(
            "Only internal testers can access researcher submissions"
        )

    return get_researcher_submission_by_id(
        db,
        current_user,
        submission_id,
    )


# =========================================================
# RESEARCHER — DELETE OWN SUBMISSION
# =========================================================

@router.delete(
    "/mine/{submission_id}",
)
def remove_my_submission(
    submission_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Delete a submission belonging to the authenticated
    researcher.
    """

    if current_user.role != RoleEnum.INTERNAL_TESTER:
        raise ForbiddenError(
            "Only internal testers can delete submissions"
        )

    submission = get_researcher_submission_by_id(
        db,
        current_user,
        submission_id,
    )

    delete_submission(
        db,
        submission,
    )

    return {
        "message": "Submission deleted successfully"
    }


# =========================================================
# COMPANY — LIST SUBMISSIONS
# =========================================================

@router.get(
    "/company",
    response_model=list[SubmissionRead],
)
def get_company_submission_list(
    db: Session = Depends(get_db),
    current_company: Company = Depends(
        get_current_company
    ),
):
    """
    Return submissions belonging only to the
    authenticated company's Bug Bounty Programs.
    """

    return get_company_submissions(
        db,
        current_company,
    )


# =========================================================
# COMPANY — GET SUBMISSION
# =========================================================

@router.get(
    "/company/{submission_id}",
    response_model=SubmissionRead,
)
def get_company_submission(
    submission_id: int,
    db: Session = Depends(get_db),
    current_company: Company = Depends(
        get_current_company
    ),
):
    """
    Return a submission only if its Bug Bounty Program
    belongs to the authenticated company.
    """

    return get_company_submission_by_id(
        db,
        current_company,
        submission_id,
    )


# =========================================================
# COMPANY — REVIEW SUBMISSION
# =========================================================

@router.put(
    "/company/{submission_id}",
    response_model=SubmissionRead,
)
def review_submission(
    submission_id: int,
    data: SubmissionUpdate,
    db: Session = Depends(get_db),
    current_company: Company = Depends(
        get_current_company
    ),
):
    """
    Company reviews a vulnerability submission.

    Supported changes:
    - status
    - severity
    - bounty amount
    - reviewer comment
    """

    submission = get_company_submission_by_id(
        db,
        current_company,
        submission_id,
    )

    return update_submission(
        db,
        submission,
        data,
    )

"""
Vulnerability Submission model.

Represents a vulnerability submitted by a security researcher
to a Bug Bounty Program.

A submission belongs to:
- one Bug Bounty Program
- one submitting user

Lifecycle:
submitted -> triaged -> accepted/rejected -> resolved

The submission is separate from the existing internal Report model
because Bug Bounty submissions follow a different workflow.
"""

from __future__ import annotations

from datetime import datetime

from sqlalchemy import (
    DateTime,
    ForeignKey,
    Integer,
    String,
    Text,
    func,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base_class import Base


class VulnerabilitySubmission(Base):
    __tablename__ = "vulnerability_submissions"

    # =========================================================
    # PRIMARY KEY
    # =========================================================

    id: Mapped[int] = mapped_column(
        primary_key=True,
        index=True,
    )

    # =========================================================
    # PROGRAM
    # =========================================================

    program_id: Mapped[int] = mapped_column(
        ForeignKey("bug_bounty_programs.id"),
        nullable=False,
        index=True,
    )

    # =========================================================
    # RESEARCHER
    # =========================================================

    researcher_id: Mapped[int] = mapped_column(
        ForeignKey("users.id"),
        nullable=False,
        index=True,
    )

    # =========================================================
    # VULNERABILITY INFORMATION
    # =========================================================

    title: Mapped[str] = mapped_column(
        String(200),
        nullable=False,
    )

    description: Mapped[str] = mapped_column(
        Text,
        nullable=False,
    )

    vulnerability_type: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
    )

    affected_asset: Mapped[str] = mapped_column(
        String(500),
        nullable=False,
    )

    steps_to_reproduce: Mapped[str] = mapped_column(
        Text,
        nullable=False,
    )

    proof_of_concept: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    impact: Mapped[str] = mapped_column(
        Text,
        nullable=False,
    )

    remediation: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    # =========================================================
    # SEVERITY
    # =========================================================

    severity: Mapped[str | None] = mapped_column(
        String(20),
        nullable=True,
    )

    # =========================================================
    # REVIEW / WORKFLOW
    # =========================================================

    status: Mapped[str] = mapped_column(
        String(30),
        nullable=False,
        default="submitted",
        index=True,
    )

    # Admin/company assigned reward.
    bounty_amount: Mapped[int | None] = mapped_column(
        Integer,
        nullable=True,
    )

    # =========================================================
    # ATTACHMENT
    # =========================================================

    attachment_path: Mapped[str | None] = mapped_column(
        String(500),
        nullable=True,
    )

    # =========================================================
    # REVIEW INFORMATION
    # =========================================================

    reviewer_comment: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    # =========================================================
    # TIMESTAMPS
    # =========================================================

    submitted_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

    # =========================================================
    # RELATIONSHIPS
    # =========================================================

    program: Mapped["BugBountyProgram"] = relationship(
        "BugBountyProgram",
    )

    researcher: Mapped["User"] = relationship(
        "User",
    )

    # =========================================================
    # REPRESENTATION
    # =========================================================

    def __repr__(self) -> str:
        return (
            f"<VulnerabilitySubmission "
            f"id={self.id} "
            f"title={self.title!r} "
            f"program_id={self.program_id} "
            f"researcher_id={self.researcher_id} "
            f"status={self.status!r}>"
        )

Pasted code(20260815-150815).py
Python

"""
Prediction service — bridges a Report to the ML inference pipeline
and persists the result.

Workflow:

Report
-> preprocessing
-> ML prediction
-> severity
-> confidence
-> automatic priority
-> store prediction
-> display on dashboard

Priority:
Critical -> 1
High -> 2
Medium -> 3
Low -> 4

An existing manually assigned priority is never overwritten.
"""

import logging

from sqlalchemy.orm import Session

from app.core.exceptions import AppException
from app.models.enums import SeverityEnum
from app.models.prediction import Prediction
from app.models.report import Report
from app.services.ml_service import (
MLServiceError,
predict_severity,
)

logger = logging.getLogger(name)

=========================================================
AUTOMATIC PRIORITY MAPPING
=========================================================

SEVERITY_PRIORITY = {
SeverityEnum.CRITICAL: 1,
SeverityEnum.HIGH: 2,
SeverityEnum.MEDIUM: 3,
SeverityEnum.LOW: 4,
}

=========================================================
BUILD INFERENCE TEXT
=========================================================

def _build_inference_text(
report: Report,
) -> str:
"""
Combine the fields most likely to carry severity
signal into one text blob for the ML model.
"""

parts = [
    report.title,
    report.description,
    f"Expected: {report.expected_result}",
    f"Actual: {report.actual_result}",
]

return " ".join(
    p for p in parts if p
)

=========================================================
CALCULATE PRIORITY
=========================================================

def _calculate_priority(
severity: SeverityEnum,
) -> int:
"""
Convert predicted severity into an actionable
priority ranking.

1 = highest priority
4 = lowest priority
"""

priority = SEVERITY_PRIORITY.get(
    severity
)

if priority is None:
    raise AppException(
        f"Unsupported severity: {severity}",
        status_code=422,
    )

return priority

=========================================================
RUN PREDICTION
=========================================================

def run_prediction_for_report(
db: Session,
report: Report,
) -> Prediction:
"""
Run ML inference for a vulnerability report.

The prediction is stored as a new Prediction row.

The report receives an automatic priority only when
it does not already have a manually assigned priority.
"""

text = _build_inference_text(
    report
)

# -----------------------------------------------------
# RUN ML MODEL
# -----------------------------------------------------

try:
    result = predict_severity(
        text
    )

except MLServiceError as exc:
    logger.warning(
        "Prediction failed for report_id=%s: %s",
        report.id,
        exc,
    )

    raise AppException(
        str(exc),
        status_code=422,
    ) from exc

# -----------------------------------------------------
# NORMALIZE SEVERITY
# -----------------------------------------------------

try:
    severity_enum = SeverityEnum(
        result.severity.lower()
    )

except ValueError as exc:
    logger.error(
        "Invalid ML severity '%s' for report_id=%s",
        result.severity,
        report.id,
    )

    raise AppException(
        "ML model returned an invalid severity",
        status_code=422,
    ) from exc

# -----------------------------------------------------
# AUTOMATIC PRIORITY
# -----------------------------------------------------

calculated_priority = _calculate_priority(
    severity_enum
)

# Only assign automatic priority when
# no human priority exists.
if report.priority is None:
    report.priority = calculated_priority

    logger.info(
        "Automatic priority assigned: "
        "report_id=%s severity=%s priority=%s",
        report.id,
        severity_enum.value,
        calculated_priority,
    )

else:
    logger.info(
        "Keeping existing manual priority: "
        "report_id=%s priority=%s",
        report.id,
        report.priority,
    )

# -----------------------------------------------------
# CREATE PREDICTION RECORD
# -----------------------------------------------------

prediction = Prediction(
    report_id=report.id,
    predicted_severity=severity_enum,
    confidence_score=result.confidence,
    explanation=result.explanation,
    model_version=result.model_version,
)

db.add(prediction)

# -----------------------------------------------------
# SAVE BOTH CHANGES
# -----------------------------------------------------

db.commit()
db.refresh(prediction)

logger.info(
    "Prediction created for report_id=%s: "
    "severity=%s confidence=%.2f priority=%s",
    report.id,
    severity_enum.value,
    result.confidence,
    report.priority,
)

return prediction


from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field

from app.models.enums import SeverityEnum


class PredictionBase(BaseModel):
    predicted_severity: SeverityEnum
    confidence_score: float = Field(..., ge=0.0, le=1.0)
    explanation: str | None = None
    model_version: str


class PredictionCreate(PredictionBase):
    report_id: int


class PredictionRead(PredictionBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    report_id: int
    created_at: datetime


"""
Dataset management service.

Handles validation and registration of administrator-uploaded
NVD vulnerability datasets.

The service does not create synthetic training data.
Only the uploaded dataset is used as the training source.
"""

from pathlib import Path

import pandas as pd
from sqlalchemy.orm import Session

from app.core.exceptions import ConflictError, NotFoundError
from app.models.dataset import TrainingDataset


# =========================================================
# REQUIRED NVD COLUMNS
# =========================================================

REQUIRED_COLUMNS = {
    "cve_id",
    "description",
    "cvss_score",
    "cvss_version",
    "cvss_vector",
    "severity",
    "cwe",
    "published_date",
    "last_modified_date",
}


# =========================================================
# VALIDATE DATASET
# =========================================================

def validate_nvd_dataset(
    file_path: str,
) -> tuple[int, str]:
    """
    Validate an NVD CSV dataset.

    Returns:
        (record_count, validation_message)
    """

    path = Path(file_path)

    if not path.exists():
        raise NotFoundError(
            "Dataset file not found"
        )

    if path.suffix.lower() != ".csv":
        raise ConflictError(
            "Only CSV datasets are supported"
        )

    try:
        dataframe = pd.read_csv(path)
    except Exception as exc:
        raise ConflictError(
            f"Unable to read dataset: {exc}"
        )

    columns = set(dataframe.columns)

    missing_columns = REQUIRED_COLUMNS - columns

    if missing_columns:
        raise ConflictError(
            "Invalid NVD dataset. Missing columns: "
            + ", ".join(sorted(missing_columns))
        )

    if dataframe.empty:
        raise ConflictError(
            "Dataset contains no records"
        )

    # CVE identifier must exist.
    if dataframe["cve_id"].isna().all():
        raise ConflictError(
            "Dataset does not contain valid CVE identifiers"
        )

    # Description is required for model training.
    if dataframe["description"].isna().all():
        raise ConflictError(
            "Dataset does not contain vulnerability descriptions"
        )

    # Severity is the target label for the current model.
    if dataframe["severity"].isna().all():
        raise ConflictError(
            "Dataset does not contain severity labels"
        )

    record_count = len(dataframe)

    return (
        record_count,
        "NVD dataset validated successfully",
    )


# =========================================================
# REGISTER DATASET
# =========================================================

def register_dataset(
    db: Session,
    *,
    name: str,
    file_path: str,
) -> TrainingDataset:
    """
    Validate and register an uploaded NVD dataset.
    """

    record_count, validation_message = (
        validate_nvd_dataset(file_path)
    )

    dataset = TrainingDataset(
        name=name,
        file_path=file_path,
        dataset_type="nvd",
        record_count=record_count,
        validation_status="valid",
        validation_message=validation_message,
        is_active=False,
    )

    db.add(dataset)
    db.commit()
    db.refresh(dataset)

    return dataset


# =========================================================
# LIST DATASETS
# =========================================================

def get_datasets(
    db: Session,
) -> list[TrainingDataset]:
    """
    Return all registered training datasets.
    """

    return (
        db.query(TrainingDataset)
        .order_by(
            TrainingDataset.uploaded_at.desc()
        )
        .all()
    )


# =========================================================
# GET DATASET
# =========================================================

def get_dataset_by_id(
    db: Session,
    dataset_id: int,
) -> TrainingDataset:
    """
    Return a training dataset by ID.
    """

    dataset = (
        db.query(TrainingDataset)
        .filter(
            TrainingDataset.id == dataset_id
        )
        .first()
    )

    if dataset is None:
        raise NotFoundError(
            "Training dataset not found"
        )

    return dataset


# =========================================================
# ACTIVATE DATASET
# =========================================================

def activate_dataset(
    db: Session,
    dataset_id: int,
) -> TrainingDataset:
    """
    Mark one validated dataset as the active
    dataset for model training.

    Only one dataset can be active at a time.
    """

    dataset = get_dataset_by_id(
        db,
        dataset_id,
    )

    if dataset.validation_status != "valid":
        raise ConflictError(
            "Only a valid dataset can be activated"
        )

    (
        db.query(TrainingDataset)
        .filter(
            TrainingDataset.id != dataset.id
        )
        .update(
            {
                TrainingDataset.is_active: False
            },
            synchronize_session=False,
        )
    )

    dataset.is_active = True

    db.commit()
    db.refresh(dataset)

    return dataset


# =========================================================
# GET ACTIVE DATASET
# =========================================================

def get_active_dataset(
    db: Session,
) -> TrainingDataset:
    """
    Return the currently active training dataset.
    """

    dataset = (
        db.query(TrainingDataset)
        .filter(
            TrainingDataset.is_active.is_(True),
            TrainingDataset.validation_status == "valid",
        )
        .first()
    )

    if dataset is None:
        raise NotFoundError(
            "No active training dataset found"
        )

    return dataset


"""
Notification model.

Stores in-app notifications for users.
"""

from datetime import datetime

from sqlalchemy import Boolean, DateTime, ForeignKey, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base_class import Base


class Notification(Base):
    __tablename__ = "notifications"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)

    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id"),
        nullable=False,
        index=True,
    )

    title: Mapped[str] = mapped_column(
        String(200),
        nullable=False,
    )

    message: Mapped[str] = mapped_column(
        Text,
        nullable=False,
    )

    notification_type: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
        default="general",
    )

    entity_type: Mapped[str | None] = mapped_column(
        String(50),
        nullable=True,
    )

    entity_id: Mapped[int | None] = mapped_column(
        nullable=True,
    )

    is_read: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        nullable=False,
        index=True,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    user: Mapped["User"] = relationship(
        "User",
        back_populates="notifications",
    )

    def __repr__(self) -> str:
        return (
            f"<Notification id={self.id} "
            f"user_id={self.user_id} "
            f"type={self.notification_type}>"
        )
notification_service.py  not exist

"""
Audit log model — a generic, append-only trail of security-relevant
actions (logins, report creation, status/priority changes, etc.).

Deliberately generic (entity_type + entity_id, not a dedicated FK per
entity) so new auditable entities can be added later without a schema
migration. `details` holds a JSON-serialized string of before/after
values, kept as text for portability across DB backends.
"""

from datetime import datetime

from sqlalchemy import DateTime, Enum, ForeignKey, Integer, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base_class import Base
from app.models.enums import AuditActionEnum


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)

    # Nullable because failed-login attempts may not resolve to a known user.
    user_id: Mapped[int | None] = mapped_column(ForeignKey("users.id"), nullable=True)

    action: Mapped[AuditActionEnum] = mapped_column(Enum(AuditActionEnum, name="audit_action_enum"), nullable=False)
    entity_type: Mapped[str] = mapped_column(String(50), nullable=False)  # e.g. "report", "user"
    entity_id: Mapped[int | None] = mapped_column(Integer, nullable=True)

    details: Mapped[str | None] = mapped_column(Text, nullable=True)  # JSON string
    ip_address: Mapped[str | None] = mapped_column(String(45), nullable=True)  # supports IPv6

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    # --- Relationships ---
    user: Mapped["User | None"] = relationship("User", back_populates="audit_logs")

    def __repr__(self) -> str:
        return f"<AuditLog id={self.id} action={self.action} entity={self.entity_type}:{self.entity_id}>"


"""
User model.

Represents both Internal Testers and Administrators — differentiated by
the `role` column rather than separate tables, since they share all the
same core attributes and only differ in permissions (enforced at the
API layer via role-based dependencies added in the Authentication module).
"""

from __future__ import annotations
from datetime import datetime
from sqlalchemy import (
    Boolean,
    DateTime,
    Enum,
    ForeignKey,
    String,
    func,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base_class import Base
from app.models.enums import RoleEnum


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    full_name: Mapped[str] = mapped_column(String(150), nullable=False)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)

    role: Mapped[RoleEnum] = mapped_column(
        Enum(RoleEnum, name="role_enum"),
        nullable=False,
        default=RoleEnum.INTERNAL_TESTER,
    )

    is_active: Mapped[bool] = mapped_column(
        Boolean,
        default=True,
        nullable=False,
    )

    # ---------- Company Fields ----------
    company_id: Mapped[int | None] = mapped_column(
        ForeignKey("companies.id"),
        nullable=True,
    )

    department: Mapped[str | None] = mapped_column(
        String(100),
        nullable=True,
    )

    designation: Mapped[str | None] = mapped_column(
        String(100),
        nullable=True,
    )

    employee_id: Mapped[str | None] = mapped_column(
        String(50),
        nullable=True,
        unique=True,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
    )

    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
    )

    # ---------- Relationships ----------

    company: Mapped["Company"] = relationship(
        "Company",
        back_populates="employees",
    )

    reports: Mapped[list["Report"]] = relationship(
        "Report",
        back_populates="reporter",
        foreign_keys="Report.reporter_id",
    )

    audit_logs: Mapped[list["AuditLog"]] = relationship(
        "AuditLog",
        back_populates="user",
    )
    
    notifications: Mapped[list["Notification"]] = relationship(
    "Notification",
    back_populates="user",
    cascade="all, delete-orphan",
)

    def __repr__(self) -> str:
        return f"<User id={self.id} email={self.email!r} role={self.role}>"


"""
Schemas for Bug Bounty vulnerability submissions.
"""

from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


# =========================================================
# CREATE SUBMISSION
# =========================================================

class SubmissionCreate(BaseModel):
    """
    Data supplied by a researcher when submitting
    a vulnerability to a Bug Bounty Program.
    """

    title: str = Field(
        ...,
        min_length=5,
        max_length=200,
    )

    description: str = Field(
        ...,
        min_length=20,
    )

    vulnerability_type: str = Field(
        ...,
        min_length=2,
        max_length=100,
    )

    affected_asset: str = Field(
        ...,
        min_length=2,
        max_length=500,
    )

    steps_to_reproduce: str = Field(
        ...,
        min_length=10,
    )

    proof_of_concept: str | None = None

    impact: str = Field(
        ...,
        min_length=10,
    )

    remediation: str | None = None

    attachment_path: str | None = None


# =========================================================
# UPDATE SUBMISSION
# =========================================================

class SubmissionUpdate(BaseModel):
    """
    Fields that an authorized company/admin reviewer
    can modify during the vulnerability review process.
    """

    status: str | None = Field(
        default=None,
        min_length=3,
        max_length=30,
    )

    severity: str | None = Field(
        default=None,
        min_length=3,
        max_length=20,
    )

    bounty_amount: int | None = Field(
        default=None,
        ge=0,
    )

    reviewer_comment: str | None = None


# =========================================================
# READ SUBMISSION
# =========================================================

class SubmissionRead(BaseModel):
    """
    Public API representation of a vulnerability submission.
    """

    model_config = ConfigDict(
        from_attributes=True,
    )

    id: int

    program_id: int

    researcher_id: int

    title: str

    description: str

    vulnerability_type: str

    affected_asset: str

    steps_to_reproduce: str

    proof_of_concept: str | None

    impact: str

    remediation: str | None

    severity: str | None

    status: str

    bounty_amount: int | None

    attachment_path: str | None

    reviewer_comment: str | None

    submitted_at: datetime

    updated_at: datetime



its authorize button is not working
 its working next
Pasted code(20260815-154626).py
Python

"""
Bug Bounty vulnerability submission endpoints.

Researchers can:

Submit vulnerabilities to active Bug Bounty Programs
View their own submissions
View a specific submission
Delete their own submissions

Companies can:

View submissions belonging to their programs
View a specific submission
Review/update submission status, severity and bounty

Ownership is always verified in the service layer.
"""

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.api.deps import (
get_current_company,
get_current_user,
)
from app.core.exceptions import ForbiddenError
from app.db.session import get_db
from app.models.company import Company
from app.models.enums import RoleEnum
from app.models.submission import VulnerabilitySubmission
from app.models.user import User
from app.schemas.submission import (
SubmissionCreate,
SubmissionRead,
SubmissionUpdate,
)
from app.services.notification_service import create_notification
from app.services.submission_service import (
create_submission,
delete_submission,
get_company_submission_by_id,
get_company_submissions,
get_researcher_submission_by_id,
get_researcher_submissions,
update_submission,
)

router = APIRouter()

=========================================================
RESEARCHER — CREATE SUBMISSION
=========================================================

@router.post(
"/programs/{program_id}",
response_model=SubmissionRead,
status_code=status.HTTP_201_CREATED,
)
def submit_vulnerability(
program_id: int,
data: SubmissionCreate,
db: Session = Depends(get_db),
current_user: User = Depends(get_current_user),
):
"""
Submit a vulnerability to an active Bug Bounty Program.

Only Internal Testers can submit vulnerabilities.
"""

if current_user.role != RoleEnum.INTERNAL_TESTER:
    raise ForbiddenError(
        "Only internal testers can submit vulnerabilities"
    )

return create_submission(
    db,
    current_user,
    program_id,
    data,
)

=========================================================
RESEARCHER — LIST OWN SUBMISSIONS
=========================================================

@router.get(
"/mine",
response_model=list[SubmissionRead],
)
def get_my_submissions(
db: Session = Depends(get_db),
current_user: User = Depends(get_current_user),
):
"""
Return only submissions created by the authenticated
researcher.
"""

if current_user.role != RoleEnum.INTERNAL_TESTER:
    raise ForbiddenError(
        "Only internal testers can view researcher submissions"
    )

return get_researcher_submissions(
    db,
    current_user,
)

=========================================================
RESEARCHER — GET OWN SUBMISSION
=========================================================

@router.get(
"/mine/{submission_id}",
response_model=SubmissionRead,
)
def get_my_submission(
submission_id: int,
db: Session = Depends(get_db),
current_user: User = Depends(get_current_user),
):
"""
Return a submission only if it belongs to the
authenticated researcher.
"""

if current_user.role != RoleEnum.INTERNAL_TESTER:
    raise ForbiddenError(
        "Only internal testers can access researcher submissions"
    )

return get_researcher_submission_by_id(
    db,
    current_user,
    submission_id,
)

=========================================================
RESEARCHER — DELETE OWN SUBMISSION
=========================================================

@router.delete(
"/mine/{submission_id}",
)
def remove_my_submission(
submission_id: int,
db: Session = Depends(get_db),
current_user: User = Depends(get_current_user),
):
"""
Delete a submission belonging to the authenticated
researcher.
"""

if current_user.role != RoleEnum.INTERNAL_TESTER:
    raise ForbiddenError(
        "Only internal testers can delete submissions"
    )

submission = get_researcher_submission_by_id(
    db,
    current_user,
    submission_id,
)

delete_submission(
    db,
    submission,
)

return {
    "message": "Submission deleted successfully"
}

=========================================================
COMPANY — LIST SUBMISSIONS
=========================================================

@router.get(
"/company",
response_model=list[SubmissionRead],
)
def get_company_submission_list(
db: Session = Depends(get_db),
current_company: Company = Depends(
get_current_company
),
):
"""
Return submissions belonging only to the
authenticated company's Bug Bounty Programs.
"""

return get_company_submissions(
    db,
    current_company,
)

=========================================================
COMPANY — GET SUBMISSION
=========================================================

@router.get(
"/company/{submission_id}",
response_model=SubmissionRead,
)
def get_company_submission(
submission_id: int,
db: Session = Depends(get_db),
current_company: Company = Depends(
get_current_company
),
):
"""
Return a submission only if its Bug Bounty Program
belongs to the authenticated company.
"""

return get_company_submission_by_id(
    db,
    current_company,
    submission_id,
)

=========================================================
COMPANY — REVIEW SUBMISSION
=========================================================

@router.put(
"/company/{submission_id}",
response_model=SubmissionRead,
)
def review_submission(
submission_id: int,
data: SubmissionUpdate,
db: Session = Depends(get_db),
current_company: Company = Depends(
get_current_company
),
):
"""
Company reviews a vulnerability submission.

Supported changes:
- status
- severity
- bounty amount
- reviewer comment

The researcher is notified after the review.
"""

submission = get_company_submission_by_id(
    db,
    current_company,
    submission_id,
)

# -----------------------------------------------------
# UPDATE SUBMISSION
# -----------------------------------------------------

submission = update_submission(
    db,
    submission,
    data,
)

# -----------------------------------------------------
# NOTIFY RESEARCHER
# -----------------------------------------------------

create_notification(
    db,
    user_id=submission.researcher_id,
    title="Bug Bounty Submission Updated",
    message=(
        f"Your vulnerability submission "
        f"'{submission.title}' has been updated "
        f"by the company."
    ),
    notification_type="submission_update",
    entity_type="submission",
    entity_id=submission.id,
)

return submission




here idk submission id so please go to another features nd first complete project then we'll check ifthese feature not works properly so please go to nex tfeatures we dont have time should have to finish this project 
Pasted code(20260815-155202).py
Python

backend/app/api/v1/init.py its empty

and another file same name in endpoints

Pasted code(20260815-162213).py
Python

"""
Bug Bounty Program endpoints.

PUBLIC / RESEARCHER:

List public active Bug Bounty Programs
View a public active Bug Bounty Program

COMPANY:

Create Bug Bounty Programs
List their own programs
View their own programs
Update their own programs
Delete their own programs

Company management operations require:

Authentication
Approved company
Active company account
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

=========================================================
PUBLIC / RESEARCHER — LIST PROGRAMS
=========================================================

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

=========================================================
COMPANY — LIST OWN PROGRAMS
=========================================================

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

=========================================================
COMPANY — CREATE PROGRAM
=========================================================

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

=========================================================
PUBLIC / RESEARCHER — GET PROGRAM
=========================================================

@router.get(
"/{program_id}",
response_model=ProgramRead,
)
def get_public_program(
program_id: int,
db: Session = Depends(get_db),
):
"""
Return a public active Bug Bounty Program.

Researchers can only access programs that are:
- active
- public
- enabled
"""

return get_public_program_by_id(
    db,
    program_id,
)

=========================================================
COMPANY — UPDATE PROGRAM
=========================================================

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

=========================================================
COMPANY — DELETE PROGRAM
=========================================================

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




Pasted code(20260815-162531).py
Python
Pasted code(20260815-163925).py
Python
Pasted code(20260815-164250).py
Python

"""
Vulnerability Submission model.

Represents a vulnerability submitted by a security researcher
to a Bug Bounty Program.

A submission belongs to:

one Bug Bounty Program
one submitting user

Lifecycle:
submitted -> triaged -> accepted/rejected -> resolved

The submission is separate from the existing internal Report model
because Bug Bounty submissions follow a different workflow.
"""

from future import annotations

from datetime import datetime

from sqlalchemy import (
DateTime,
ForeignKey,
Integer,
String,
Text,
func,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base_class import Base

class VulnerabilitySubmission(Base):
tablename = "vulnerability_submissions"

# =========================================================
# PRIMARY KEY
# =========================================================

id: Mapped[int] = mapped_column(
    primary_key=True,
    index=True,
)

# =========================================================
# PROGRAM
# =========================================================

program_id: Mapped[int] = mapped_column(
    ForeignKey("bug_bounty_programs.id"),
    nullable=False,
    index=True,
)

# =========================================================
# RESEARCHER
# =========================================================

researcher_id: Mapped[int] = mapped_column(
    ForeignKey("users.id"),
    nullable=False,
    index=True,
)

# =========================================================
# VULNERABILITY INFORMATION
# =========================================================

title: Mapped[str] = mapped_column(
    String(200),
    nullable=False,
)

description: Mapped[str] = mapped_column(
    Text,
    nullable=False,
)

vulnerability_type: Mapped[str] = mapped_column(
    String(100),
    nullable=False,
)

affected_asset: Mapped[str] = mapped_column(
    String(500),
    nullable=False,
)

steps_to_reproduce: Mapped[str] = mapped_column(
    Text,
    nullable=False,
)

proof_of_concept: Mapped[str | None] = mapped_column(
    Text,
    nullable=True,
)

impact: Mapped[str] = mapped_column(
    Text,
    nullable=False,
)

remediation: Mapped[str | None] = mapped_column(
    Text,
    nullable=True,
)

# =========================================================
# SEVERITY
# =========================================================

severity: Mapped[str | None] = mapped_column(
    String(20),
    nullable=True,
)

# =========================================================
# REVIEW / WORKFLOW
# =========================================================

status: Mapped[str] = mapped_column(
    String(30),
    nullable=False,
    default="submitted",
    index=True,
)

# Admin/company assigned reward.
bounty_amount: Mapped[int | None] = mapped_column(
    Integer,
    nullable=True,
)

# =========================================================
# ATTACHMENT
# =========================================================

attachment_path: Mapped[str | None] = mapped_column(
    String(500),
    nullable=True,
)

# =========================================================
# REVIEW INFORMATION
# =========================================================

reviewer_comment: Mapped[str | None] = mapped_column(
    Text,
    nullable=True,
)

# =========================================================
# TIMESTAMPS
# =========================================================

submitted_at: Mapped[datetime] = mapped_column(
    DateTime(timezone=True),
    server_default=func.now(),
    nullable=False,
)

updated_at: Mapped[datetime] = mapped_column(
    DateTime(timezone=True),
    server_default=func.now(),
    onupdate=func.now(),
    nullable=False,
)

# =========================================================
# RELATIONSHIPS
# =========================================================

program: Mapped["BugBountyProgram"] = relationship(
    "BugBountyProgram",
)

researcher: Mapped["User"] = relationship(
    "User",
)

# =========================================================
# REPRESENTATION
# =========================================================

def __repr__(self) -> str:
    return (
        f"<VulnerabilitySubmission "
        f"id={self.id} "
        f"title={self.title!r} "
        f"program_id={self.program_id} "
        f"researcher_id={self.researcher_id} "
        f"status={self.status!r}>"
    )


"""
Schemas for Bug Bounty vulnerability submissions.
"""

from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


# =========================================================
# CREATE SUBMISSION
# =========================================================

class SubmissionCreate(BaseModel):
    """
    Data supplied by a researcher when submitting
    a vulnerability to a Bug Bounty Program.
    """

    title: str = Field(
        ...,
        min_length=5,
        max_length=200,
    )

    description: str = Field(
        ...,
        min_length=20,
    )

    vulnerability_type: str = Field(
        ...,
        min_length=2,
        max_length=100,
    )

    affected_asset: str = Field(
        ...,
        min_length=2,
        max_length=500,
    )

    steps_to_reproduce: str = Field(
        ...,
        min_length=10,
    )

    proof_of_concept: str | None = None

    impact: str = Field(
        ...,
        min_length=10,
    )

    remediation: str | None = None

    attachment_path: str | None = None


# =========================================================
# UPDATE SUBMISSION
# =========================================================

class SubmissionUpdate(BaseModel):
    """
    Fields that an authorized company/admin reviewer
    can modify during the vulnerability review process.
    """

    status: str | None = Field(
        default=None,
        min_length=3,
        max_length=30,
    )

    severity: str | None = Field(
        default=None,
        min_length=3,
        max_length=20,
    )

    bounty_amount: int | None = Field(
        default=None,
        ge=0,
    )

    reviewer_comment: str | None = None


# =========================================================
# READ SUBMISSION
# =========================================================

class SubmissionRead(BaseModel):
    """
    Public API representation of a vulnerability submission.
    """

    model_config = ConfigDict(
        from_attributes=True,
    )

    id: int

    program_id: int

    researcher_id: int

    title: str

    description: str

    vulnerability_type: str

    affected_asset: str

    steps_to_reproduce: str

    proof_of_concept: str | None

    impact: str

    remediation: str | None

    severity: str | None

    status: str

    bounty_amount: int | None

    attachment_path: str | None

    reviewer_comment: str | None

    submitted_at: datetime

    updated_at: datetime





Pasted code(20260815-165809).ts
TypeScript
Pasted code(20260815-170752).ts
TypeScript
Pasted code(20260815-170838).ts
TypeScript
Pasted code(20260815-171245).ts
TypeScript
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";


type ProtectedRouteProps = {
  children: React.ReactNode;
  allowedRoles?: string[];
};


export function ProtectedRoute({
  children,
  allowedRoles,
}: ProtectedRouteProps) {
  const { user } = useAuth();
  const location = useLocation();


  // ---------------------------------------------------------
  // NOT LOGGED IN
  // ---------------------------------------------------------


  if (!user) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location.pathname }}
      />
    );
  }


  // ---------------------------------------------------------
  // NORMALIZE ROLE
  // ---------------------------------------------------------


  const userRole = String(user.role || "")
    .trim()
    .toLowerCase();


  // ---------------------------------------------------------
  // NO ROLE RESTRICTION
  // ---------------------------------------------------------


  if (!allowedRoles || allowedRoles.length === 0) {
    return <>{children}</>;
  }


  // ---------------------------------------------------------
  // NORMALIZE ALLOWED ROLES
  // ---------------------------------------------------------


  const normalizedAllowedRoles = allowedRoles.map((role) =>
    String(role).trim().toLowerCase()
  );


  // ---------------------------------------------------------
  // AUTHORIZED
  // ---------------------------------------------------------


  if (normalizedAllowedRoles.includes(userRole)) {
    return <>{children}</>;
  }


  // ---------------------------------------------------------
  // INTERNAL TESTER
  // ---------------------------------------------------------


  if (userRole === "internal_tester") {
    return <Navigate to="/researcher/programs" replace />;
  }


  // ---------------------------------------------------------
  // ADMIN
  // ---------------------------------------------------------


  if (userRole === "admin") {
    return <Navigate to="/dashboard" replace />;
  }


  // ---------------------------------------------------------
  // FALLBACK
  // ---------------------------------------------------------


  return <Navigate to="/reports" replace />;
}



export type Role = "internal_tester" | "admin";
export type Severity = "critical" | "high" | "medium" | "low";


export interface User {
  id: number;
  full_name: string;
  email: string;
  role: Role;
  is_active: boolean;
  created_at: string;
}


export interface Employee {
  id: number;
  full_name: string;
  email: string;
  department: string;
  designation: string;
  employee_id: string;
  role: Role;
  is_active: boolean;
  created_at: string;
}


export interface Status {
  id: number;
  name: string;
  description: string | null;
  is_terminal: boolean;
  sort_order: number;
}


export interface Prediction {
  id: number;
  report_id: number;
  predicted_severity: Severity;
  confidence_score: number;
  explanation: string | null;
  model_version: string;
  created_at: string;
}


export interface Report {
  id: number;
  title: string;
  description: string;
  affected_module: string;
  category: string;
  steps_to_reproduce: string;
  expected_result: string;
  actual_result: string;
  priority: number | null;
  attachment_path: string | null;
  submission_date: string;
  updated_at: string;
  reporter: User;
  status: Status;
  predictions: Prediction[];
}


export interface ReportListItem {
  id: number;
  title: string;
  category: string;
  priority: number | null;
  submission_date: string;
  status: Status;
  latest_prediction: Prediction | null;
}


export interface ReportCreateInput {
  title: string;
  description: string;
  affected_module: string;
  category: string;
  steps_to_reproduce: string;
  expected_result: string;
  actual_result: string;
  attachment?: File | null;
}


export interface DashboardStats {
  total_reports: number;
  critical_reports: number;
  high_reports: number;
  medium_reports: number;
  low_reports: number;
  open_reports: number;
  resolved_reports: number;
  severity_distribution: Record<string, number>;
  status_distribution: Record<string, number>;
  recent_reports: ReportListItem[];
}


export interface AuthTokens {
  access_token: string;
  refresh_token: string;
  token_type: string;
}


export interface ApiErrorBody {
  detail?: string;
  errors?: unknown;
}

import { apiClient } from "./client";


export interface ResearcherProgram {
  id: number;
  company_id: number;


  program_name: string;
  description: string;
  target_website: string;


  scope: string;
  out_of_scope?: string | null;


  reward_min?: number | null;
  reward_max?: number | null;


  severity_reward_matrix?: string | null;


  program_rules: string;
  submission_guidelines: string;


  start_date: string;
  end_date?: string | null;


  status: string;
  visibility: string;


  attachments?: string | null;


  is_active: boolean;


  created_at: string;
  updated_at: string;
}


export async function getResearcherPrograms(): Promise<
  ResearcherProgram[]
> {
  const response = await apiClient.get<ResearcherProgram[]>(
    "/programs/"
  );


  return response.data;
}


export async function getResearcherProgramById(
  programId: number
): Promise<ResearcherProgram> {
  const response = await apiClient.get<ResearcherProgram>(
    /programs/${programId}
  );


  return response.data;
}

http://localhost:5173/researcher/programs openning this going to this page

Pasted code(20260815-172556).ts
TypeScript
Pasted code(20260815-174054).ts
TypeScript
Pasted code (2).ts
TypeScript
Pasted code (3).ts
TypeScript
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";


import { AppLayout } from "../../components/layout/AppLayout";
import { Card } from "../../components/ui/Card";
import { Alert } from "../../components/ui/Alert";


import {
  getCompanySubmissions,
  type VulnerabilitySubmission,
} from "../../api/submissions";


import { getErrorMessage } from "../../api/client";


export default function CompanySubmissionsPage() {
  const [submissions, setSubmissions] = useState<
    VulnerabilitySubmission[]
  >([]);


  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);


  useEffect(() => {
    loadSubmissions();
  }, []);


  async function loadSubmissions() {
    try {
      setIsLoading(true);
      setError(null);


      const data = await getCompanySubmissions();


      setSubmissions(data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }


  function getStatusClass(status: string) {
    switch (status?.toLowerCase()) {
      case "accepted":
      case "resolved":
        return "bg-green-100 text-green-700";


      case "rejected":
        return "bg-red-100 text-red-700";


      case "triaged":
  return "bg-yellow-100 text-yellow-700";


      default:
        return "bg-gray-100 text-gray-700";
    }
  }


  return (
    <AppLayout title="Bug Bounty Submissions">


      {error && (
        <div className="mb-5">
          <Alert variant="error">
            {error}
          </Alert>
        </div>
      )}


      {isLoading ? (
        <Card className="p-10 text-center">
          <p className="text-sm text-[var(--color-ink-muted)]">
            Loading submissions...
          </p>
        </Card>
      ) : submissions.length === 0 ? (
        <Card className="p-10 text-center">
          <h3 className="text-sm font-semibold text-[var(--color-ink)]">
            No Vulnerability Submissions
          </h3>


          <p className="mt-2 text-sm text-[var(--color-ink-muted)]">
            No researchers have submitted vulnerabilities to your
            Bug Bounty Programs yet.
          </p>
        </Card>
      ) : (
        <Card className="overflow-hidden">


          <div className="border-b p-5">
            <h2 className="text-base font-semibold text-[var(--color-ink)]">
              Vulnerability Submissions
            </h2>


            <p className="mt-1 text-sm text-[var(--color-ink-muted)]">
              Review vulnerabilities submitted to your Bug Bounty Programs.
            </p>
          </div>


          <div className="overflow-x-auto">


            <table className="w-full text-sm">


              <thead>
                <tr className="border-b bg-gray-50">


                  <th className="px-5 py-3 text-left font-medium">
                    Title
                  </th>


                  <th className="px-5 py-3 text-left font-medium">
                    Program
                  </th>


                  <th className="px-5 py-3 text-left font-medium">
                    Severity
                  </th>


                  <th className="px-5 py-3 text-left font-medium">
                    Status
                  </th>


                  <th className="px-5 py-3 text-left font-medium">
                    Bounty
                  </th>


                  <th className="px-5 py-3 text-left font-medium">
                    Action
                  </th>


                </tr>
              </thead>


              <tbody>


                {submissions.map((submission) => (


                  <tr
                    key={submission.id}
                    className="border-b last:border-b-0 hover:bg-gray-50"
                  >


                    <td className="px-5 py-4">
                      <div className="max-w-xs">


                        <p className="font-medium text-[var(--color-ink)]">
                          {submission.title}
                        </p>


                        <p className="mt-1 truncate text-xs text-[var(--color-ink-muted)]">
                          {submission.description}
                        </p>


                      </div>
                    </td>


                    <td className="px-5 py-4">
                      #{submission.program_id}
                    </td>


                    <td className="px-5 py-4">


                      {submission.severity ? (
                        <span className="font-medium">
                          {submission.severity}
                        </span>
                      ) : (
                        <span className="text-gray-400">
                          Not assessed
                        </span>
                      )}


                    </td>


                    <td className="px-5 py-4">


                      <span
                        className={rounded-full px-2.5 py-1 text-xs font-medium ${getStatusClass(
                          submission.status
                        )}}
                      >
                        {submission.status}
                      </span>


                    </td>


                    <td className="px-5 py-4">


                      {submission.bounty_amount !== null &&
                      submission.bounty_amount !== undefined
                        ? ₹${submission.bounty_amount}
                        : "-"}


                    </td>


                    <td className="px-5 py-4">


                      <Link
                        to={/company/submissions/${submission.id}}
                        className="rounded-md bg-[var(--color-accent)] px-3 py-2 text-xs font-medium text-white hover:opacity-90"
                      >
                        Review
                      </Link>


                    </td>


                  </tr>


                ))}


              </tbody>


            </table>


          </div>


        </Card>
      )}


    </AppLayout>
  );
}


import { apiClient } from "./client";


// =========================================================
// CREATE SUBMISSION
// =========================================================


export interface SubmissionCreate {
  title: string;
  description: string;
  vulnerability_type?: string | null;
  affected_asset?: string | null;
  steps_to_reproduce?: string | null;
  proof_of_concept?: string | null;
  impact?: string | null;
  remediation?: string | null;
  attachment_path?: string | null;
}


// =========================================================
// SUBMISSION RESPONSE
// =========================================================


export interface VulnerabilitySubmission {
  id: number;
  program_id: number;
  researcher_id: number;


  title: string;
  description: string;


  vulnerability_type?: string | null;
  affected_asset?: string | null;
  steps_to_reproduce?: string | null;
  proof_of_concept?: string | null;
  impact?: string | null;
  remediation?: string | null;
  attachment_path?: string | null;


  status: string;
  severity?: string | null;
  bounty_amount?: number | null;
  reviewer_comment?: string | null;


  submitted_at?: string;
  updated_at?: string;
}


// =========================================================
// UPDATE SUBMISSION
// =========================================================


export interface SubmissionUpdate {
  status?: string | null;
  severity?: string | null;
  bounty_amount?: number | null;
  reviewer_comment?: string | null;
}


// =========================================================
// RESEARCHER — CREATE SUBMISSION
// =========================================================


export async function createSubmission(
  programId: number,
  data: SubmissionCreate
): Promise<VulnerabilitySubmission> {
  const response =
    await apiClient.post<VulnerabilitySubmission>(
      /submissions/programs/${programId},
      data
    );


  return response.data;
}


// =========================================================
// RESEARCHER — MY SUBMISSIONS
// =========================================================


export async function getMySubmissions(): Promise<
  VulnerabilitySubmission[]
> {
  const response =
    await apiClient.get<VulnerabilitySubmission[]>(
      "/submissions/mine"
    );


  return response.data;
}


// =========================================================
// RESEARCHER — MY SUBMISSION BY ID
// =========================================================


export async function getSubmissionById(
  submissionId: number
): Promise<VulnerabilitySubmission> {
  const response =
    await apiClient.get<VulnerabilitySubmission>(
      /submissions/mine/${submissionId}
    );


  return response.data;
}


// =========================================================
// RESEARCHER — DELETE MY SUBMISSION
// =========================================================


export async function deleteMySubmission(
  submissionId: number
): Promise<{ message: string }> {
  const response =
    await apiClient.delete<{ message: string }>(
      /submissions/mine/${submissionId}
    );


  return response.data;
}


// =========================================================
// COMPANY — LIST SUBMISSIONS
// =========================================================


export async function getCompanySubmissions(): Promise<
  VulnerabilitySubmission[]
> {
  const response =
    await apiClient.get<VulnerabilitySubmission[]>(
      "/submissions/company"
    );


  return response.data;
}


// =========================================================
// COMPANY — GET SUBMISSION
// =========================================================


export async function getCompanySubmissionById(
  submissionId: number
): Promise<VulnerabilitySubmission> {
  const response =
    await apiClient.get<VulnerabilitySubmission>(
      /submissions/company/${submissionId}
    );


  return response.data;
}


// =========================================================
// COMPANY — REVIEW / UPDATE SUBMISSION
// =========================================================


export async function updateSubmission(
  submissionId: number,
  data: SubmissionUpdate
): Promise<VulnerabilitySubmission> {
  const response =
    await apiClient.put<VulnerabilitySubmission>(
      /submissions/company/${submissionId},
      data
    );


  return response.data;
}
// =========================================================
// COMPANY — REVIEW / UPDATE SUBMISSION
// Backward-compatible alias used by CompanySubmissionDetailsPage
// =========================================================


export async function updateCompanySubmission(
  submissionId: number,
  data: SubmissionUpdate
): Promise<VulnerabilitySubmission> {
  return updateSubmission(submissionId, data);
}



Pasted code(20260815-174229).ts
TypeScript
Pasted code(20260815-174336).ts
TypeScript
Today 10:58 AM
Pasted code(20260816-052802).ts
TypeScript
Pasted code(20260816-053030).ts
TypeScript
Pasted code(20260816-053103).ts
TypeScript
Pasted code(20260816-053427).ts
TypeScript
Pasted code (2)(1).ts
TypeScript
export type Role = "internal_tester" | "admin";
export type Severity = "critical" | "high" | "medium" | "low";


export interface User {
  id: number;
  full_name: string;
  email: string;
  role: Role;
  is_active: boolean;
  created_at: string;
}


export interface Employee {
  id: number;
  full_name: string;
  email: string;
  department: string;
  designation: string;
  employee_id: string;
  role: Role;
  is_active: boolean;
  created_at: string;
}


export interface Status {
  id: number;
  name: string;
  description: string | null;
  is_terminal: boolean;
  sort_order: number;
}


export interface Prediction {
  id: number;
  report_id: number;
  predicted_severity: Severity;
  confidence_score: number;
  explanation: string | null;
  model_version: string;
  created_at: string;
}


export interface Report {
  id: number;
  title: string;
  description: string;
  affected_module: string;
  category: string;
  steps_to_reproduce: string;
  expected_result: string;
  actual_result: string;
  priority: number | null;
  attachment_path: string | null;
  submission_date: string;
  updated_at: string;
  reporter: User;
  status: Status;
  predictions: Prediction[];
}


export interface ReportListItem {
  id: number;
  title: string;
  category: string;
  priority: number | null;
  submission_date: string;
  status: Status;
  latest_prediction: Prediction | null;
}


export interface ReportCreateInput {
  title: string;
  description: string;
  affected_module: string;
  category: string;
  steps_to_reproduce: string;
  expected_result: string;
  actual_result: string;
  attachment?: File | null;
}


export interface DashboardStats {
  total_reports: number;
  critical_reports: number;
  high_reports: number;
  medium_reports: number;
  low_reports: number;
  open_reports: number;
  resolved_reports: number;
  severity_distribution: Record<string, number>;
  status_distribution: Record<string, number>;
  recent_reports: ReportListItem[];
}


export interface AuthTokens {
  access_token: string;
  refresh_token: string;
  token_type: string;
}


export interface ApiErrorBody {
  detail?: string;
  errors?: unknown;
}

import { apiClient } from "./client";
import type { AuthTokens, Role, User } from "../types";


export interface RegisterInput {
  full_name: string;
  email: string;
  password: string;
}


export async function registerUser(input: RegisterInput): Promise<User> {
  const { data } = await apiClient.post<User>("/auth/register", {
    ...input,
    role: "internal_tester" as Role, // backend forces this regardless; sent for schema completeness
  });
  return data;
}


export async function login(email: string, password: string): Promise<AuthTokens> {
  // Backend expects OAuth2 form encoding, not JSON, for /auth/login.
  const form = new URLSearchParams();
  form.set("username", email);
  form.set("password", password);


  const { data } = await apiClient.post<AuthTokens>("/auth/login", form, {
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
  });
  return data;
}


export async function getCurrentUser(): Promise<User> {
  const { data } = await apiClient.get<User>("/auth/me");
  return data;
}

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";


import { getPrograms, BugBountyProgram } from "../../api/programs";
import { getMySubmissions, VulnerabilitySubmission } from "../../api/submissions";


export default function ResearcherDashboardPage() {
  const [programs, setPrograms] = useState<BugBountyProgram[]>([]);
  const [submissions, setSubmissions] = useState<VulnerabilitySubmission[]>([]);
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    async function loadDashboard() {
      try {
        const [programData, submissionData] = await Promise.all([
          getPrograms(),
          getMySubmissions(),
        ]);


        setPrograms(programData);
        setSubmissions(submissionData);
      } finally {
        setLoading(false);
      }
    }


    loadDashboard();
  }, []);


  if (loading) {
    return <div>Loading researcher dashboard...</div>;
  }


  const pending = submissions.filter(
    (submission) => submission.status === "pending"
  ).length;


  const accepted = submissions.filter(
    (submission) => submission.status === "accepted"
  ).length;


  const totalBounty = submissions.reduce(
    (total, submission) =>
      total + Number(submission.bounty_amount || 0),
    0
  );


  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">
          Researcher Dashboard
        </h1>


        <p className="text-gray-500">
          Find active bug bounty programs and manage your vulnerability
          submissions.
        </p>
      </div>


      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <div className="rounded-lg border p-5">
          <p className="text-sm text-gray-500">
            Active Programs
          </p>


          <p className="mt-2 text-2xl font-bold">
            {programs.length}
          </p>
        </div>


        <div className="rounded-lg border p-5">
          <p className="text-sm text-gray-500">
            My Submissions
          </p>


          <p className="mt-2 text-2xl font-bold">
            {submissions.length}
          </p>
        </div>


        <div className="rounded-lg border p-5">
          <p className="text-sm text-gray-500">
            Pending
          </p>


          <p className="mt-2 text-2xl font-bold">
            {pending}
          </p>
        </div>


        <div className="rounded-lg border p-5">
          <p className="text-sm text-gray-500">
            Accepted
          </p>


          <p className="mt-2 text-2xl font-bold">
            {accepted}
          </p>


          <p className="mt-1 text-sm text-gray-500">
            Bounty: ₹{totalBounty.toFixed(2)}
          </p>
        </div>
      </div>


      <div className="rounded-lg border p-5">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">
            Bug Bounty Programs
          </h2>


          <Link
            to="/researcher/programs"
            className="text-sm font-medium"
          >
            View all
          </Link>
        </div>


        <div className="mt-4">
          {programs.length === 0 ? (
            <p className="text-gray-500">
              No active bug bounty programs available.
            </p>
          ) : (
            <div className="space-y-3">
              {programs.slice(0, 5).map((program) => (
                <div
                  key={program.id}
                  className="flex items-center justify-between rounded-md border p-4"
                >
                  <div>
                    <h3 className="font-medium">
                      {program.name}
                    </h3>


                    {program.description && (
                      <p className="mt-1 text-sm text-gray-500">
                        {program.description}
                      </p>
                    )}
                  </div>


                  <Link
                    to={/researcher/programs/${program.id}}
                    className="rounded-md border px-3 py-2 text-sm"
                  >
                    View
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>


      <div className="rounded-lg border p-5">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">
            Recent Submissions
          </h2>


          <Link
            to="/researcher/submissions"
            className="text-sm font-medium"
          >
            View all
          </Link>
        </div>


        <div className="mt-4">
          {submissions.length === 0 ? (
            <p className="text-gray-500">
              You haven't submitted any vulnerabilities yet.
            </p>
          ) : (
            <div className="space-y-3">
              {submissions.slice(0, 5).map((submission) => (
                <div
                  key={submission.id}
                  className="flex items-center justify-between rounded-md border p-4"
                >
                  <div>
                    <h3 className="font-medium">
                      {submission.title}
                    </h3>


                    <p className="text-sm text-gray-500">
                      Status: {submission.status || "Pending"}
                    </p>
                  </div>


                  <Link
                    to={/researcher/submissions/${submission.id}}
                    className="rounded-md border px-3 py-2 text-sm"
                  >
                    View
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}




Pasted code(20260816-053606).ts
TypeScript
Pasted code (2)(2).ts
TypeScript

import { apiClient } from "./client";

export interface Program {

  id: number;

  program_name: string;

  description?: string | null;

  target_website: string;

  scope?: string | null;

  reward_min?: number | null;

  reward_max?: number | null;

  status: string;

  created_at?: string;

  updated_at?: string;

}

export async function getPrograms(): Promise<Program[]> {

  const response = await apiClient.get<Program[]>(

    "/company/programs"

  );

  return response.data;

}

export async function getProgramById(

  id: number

): Promise<Program> {

  const response = await apiClient.get<Program>(

    `/company/programs/${id}`

  );

  return response.data;

}

export async function createProgram(

  data: Omit<Program, "id" | "created_at" | "updated_at">

): Promise<Program> {

  const response = await apiClient.post<Program>(

    "/company/programs",

    data

  );

  return response.data;

}

export async function updateProgram(

  id: number,

  data: Partial<Program>

): Promise<Program> {

  const response = await apiClient.put<Program>(

    `/company/programs/${id}`,

    data

  );

  return response.data;

}

export async function deleteProgram(

  id: number

): Promise<void> {

  await apiClient.delete(

    `/company/programs/${id}`

  );

}

import { apiClient } from "./client";

export interface ResearcherProgram {

  id: number;

  company_id: number;

  program_name: string;

  description: string;

  target_website: string;

  scope: string;

  out_of_scope?: string | null;

  reward_min?: number | null;

  reward_max?: number | null;

  severity_reward_matrix?: string | null;

  program_rules: string;

  submission_guidelines: string;

  start_date: string;

  end_date?: string | null;

  status: string;

  visibility: string;

  attachments?: string | null;

  is_active: boolean;

  created_at: string;

  updated_at: string;

}

export async function getResearcherPrograms(): Promise<

  ResearcherProgram[]

> {

  const response = await apiClient.get<ResearcherProgram[]>(

    "/programs/"

  );

  return response.data;

}

export async function getResearcherProgramById(

  programId: number

): Promise<ResearcherProgram> {

  const response = await apiClient.get<ResearcherProgram>(

    `/programs/${programId}`

  );

  return response.data;

}

import { apiClient } from "./client";

export interface Bookmark {

  id: number;

  user_id: number;

  program_id: number;

  created_at: string;

}

export async function createBookmark(

  programId: number

): Promise<Bookmark> {

  const response = await apiClient.post<Bookmark>(

    `/bookmarks/${programId}`

  );

  return response.data;

}

export async function getMyBookmarks(): Promise<Bookmark[]> {

  const response = await apiClient.get<Bookmark[]>(

    "/bookmarks/"

  );

  return response.data;

}

export async function getBookmarkById(

  bookmarkId: number

): Promise<Bookmark> {

  const response = await apiClient.get<Bookmark>(

    `/bookmarks/${bookmarkId}`

  );

  return response.data;

}

export async function deleteBookmark(

  bookmarkId: number

): Promise<void> {

  await apiClient.delete(

    `/bookmarks/${bookmarkId}`

  );

}

src/api/notifications.ts

src/pages/.../NotificationsPage.tsx these files not exist

"""
Bug Bounty vulnerability submission endpoints.

Researchers can:

Submit vulnerabilities to active Bug Bounty Programs
View their own submissions
View a specific submission
Delete their own submissions

Companies can:

View submissions belonging to their programs
View a specific submission
Review/update submission status, severity and bounty

Ownership is always verified in the service layer.
"""

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.api.deps import (
get_current_company,
get_current_user,
)
from app.core.exceptions import ForbiddenError
from app.db.session import get_db
from app.models.company import Company
from app.models.enums import RoleEnum
from app.models.submission import VulnerabilitySubmission
from app.models.user import User
from app.schemas.submission import (
SubmissionCreate,
SubmissionRead,
SubmissionUpdate,
)
from app.services.notification_service import create_notification
from app.services.submission_service import (
create_submission,
delete_submission,
get_company_submission_by_id,
get_company_submissions,
get_researcher_submission_by_id,
get_researcher_submissions,
update_submission,
)

router = APIRouter()

=========================================================
RESEARCHER — CREATE SUBMISSION
=========================================================

@router.post(
"/programs/{program_id}",
response_model=SubmissionRead,
status_code=status.HTTP_201_CREATED,
)
def submit_vulnerability(
program_id: int,
data: SubmissionCreate,
db: Session = Depends(get_db),
current_user: User = Depends(get_current_user),
):
"""
Submit a vulnerability to an active Bug Bounty Program.

Only Internal Testers can submit vulnerabilities.
"""

if current_user.role != RoleEnum.INTERNAL_TESTER:
    raise ForbiddenError(
        "Only internal testers can submit vulnerabilities"
    )

return create_submission(
    db,
    current_user,
    program_id,
    data,
)

=========================================================
RESEARCHER — LIST OWN SUBMISSIONS
=========================================================

@router.get(
"/mine",
response_model=list[SubmissionRead],
)
def get_my_submissions(
db: Session = Depends(get_db),
current_user: User = Depends(get_current_user),
):
"""
Return only submissions created by the authenticated
researcher.
"""

if current_user.role != RoleEnum.INTERNAL_TESTER:
    raise ForbiddenError(
        "Only internal testers can view researcher submissions"
    )

return get_researcher_submissions(
    db,
    current_user,
)

=========================================================
RESEARCHER — GET OWN SUBMISSION
=========================================================

@router.get(
"/mine/{submission_id}",
response_model=SubmissionRead,
)
def get_my_submission(
submission_id: int,
db: Session = Depends(get_db),
current_user: User = Depends(get_current_user),
):
"""
Return a submission only if it belongs to the
authenticated researcher.
"""

if current_user.role != RoleEnum.INTERNAL_TESTER:
    raise ForbiddenError(
        "Only internal testers can access researcher submissions"
    )

return get_researcher_submission_by_id(
    db,
    current_user,
    submission_id,
)

=========================================================
RESEARCHER — DELETE OWN SUBMISSION
=========================================================

@router.delete(
"/mine/{submission_id}",
)
def remove_my_submission(
submission_id: int,
db: Session = Depends(get_db),
current_user: User = Depends(get_current_user),
):
"""
Delete a submission belonging to the authenticated
researcher.
"""

if current_user.role != RoleEnum.INTERNAL_TESTER:
    raise ForbiddenError(
        "Only internal testers can delete submissions"
    )

submission = get_researcher_submission_by_id(
    db,
    current_user,
    submission_id,
)

delete_submission(
    db,
    submission,
)

return {
    "message": "Submission deleted successfully"
}

=========================================================
COMPANY — LIST SUBMISSIONS
=========================================================

@router.get(
"/company",
response_model=list[SubmissionRead],
)
def get_company_submission_list(
db: Session = Depends(get_db),
current_company: Company = Depends(
get_current_company
),
):
"""
Return submissions belonging only to the
authenticated company's Bug Bounty Programs.
"""

return get_company_submissions(
    db,
    current_company,
)

=========================================================
COMPANY — GET SUBMISSION
=========================================================

@router.get(
"/company/{submission_id}",
response_model=SubmissionRead,
)
def get_company_submission(
submission_id: int,
db: Session = Depends(get_db),
current_company: Company = Depends(
get_current_company
),
):
"""
Return a submission only if its Bug Bounty Program
belongs to the authenticated company.
"""

return get_company_submission_by_id(
    db,
    current_company,
    submission_id,
)

=========================================================
COMPANY — REVIEW SUBMISSION
=========================================================

@router.put(
"/company/{submission_id}",
response_model=SubmissionRead,
)
def review_submission(
submission_id: int,
data: SubmissionUpdate,
db: Session = Depends(get_db),
current_company: Company = Depends(
get_current_company
),
):
"""
Company reviews a vulnerability submission.

Supported changes:
- status
- severity
- bounty amount
- reviewer comment

The researcher is notified after the review.
"""

submission = get_company_submission_by_id(
    db,
    current_company,
    submission_id,
)

# -----------------------------------------------------
# UPDATE SUBMISSION
# -----------------------------------------------------

submission = update_submission(
    db,
    submission,
    data,
)

# -----------------------------------------------------
# NOTIFY RESEARCHER
# -----------------------------------------------------

create_notification(
    db,
    user_id=submission.researcher_id,
    title="Bug Bounty Submission Updated",
    message=(
        f"Your vulnerability submission "
        f"'{submission.title}' has been updated "
        f"by the company."
    ),
    notification_type="submission_update",
    entity_type="submission",
    entity_id=submission.id,
)

return submission

Pasted code(20260816-054248).ts
TypeScript
Pasted code (2)(3).ts
TypeScript

from sqlalchemy.orm import Session, joinedload

from app.core.exceptions import NotFoundError
from app.models.company import Company
from app.models.enums import RoleEnum
from app.models.program import BugBountyProgram
from app.models.submission import VulnerabilitySubmission
from app.models.user import User
from app.schemas.submission import SubmissionCreate, SubmissionUpdate

=========================================================
RESEARCHER — CREATE SUBMISSION
=========================================================

def create_submission(
db: Session,
researcher: User,
program_id: int,
data: SubmissionCreate,
) -> VulnerabilitySubmission:

# -----------------------------------------------------
# VERIFY PROGRAM
# -----------------------------------------------------

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

# -----------------------------------------------------
# CREATE SUBMISSION
# -----------------------------------------------------

submission = VulnerabilitySubmission(
    program_id=program.id,
    researcher_id=researcher.id,

    title=data.title,
    description=data.description,
    vulnerability_type=data.vulnerability_type,
    affected_asset=data.affected_asset,
    steps_to_reproduce=data.steps_to_reproduce,
    proof_of_concept=data.proof_of_concept,
    impact=data.impact,
    remediation=data.remediation,
    attachment_path=data.attachment_path,

    status="submitted",
)

db.add(submission)
db.commit()
db.refresh(submission)

return submission

=========================================================
RESEARCHER — LIST OWN SUBMISSIONS
=========================================================

def get_researcher_submissions(
db: Session,
researcher: User,
) -> list[VulnerabilitySubmission]:

return (
    db.query(VulnerabilitySubmission)
    .options(
        joinedload(VulnerabilitySubmission.program),
    )
    .filter(
        VulnerabilitySubmission.researcher_id
        == researcher.id
    )
    .order_by(
        VulnerabilitySubmission.submitted_at.desc()
    )
    .all()
)

=========================================================
RESEARCHER — GET OWN SUBMISSION
=========================================================

def get_researcher_submission_by_id(
db: Session,
researcher: User,
submission_id: int,
) -> VulnerabilitySubmission:

submission = (
    db.query(VulnerabilitySubmission)
    .options(
        joinedload(VulnerabilitySubmission.program),
    )
    .filter(
        VulnerabilitySubmission.id == submission_id,
        VulnerabilitySubmission.researcher_id
        == researcher.id,
    )
    .first()
)

if submission is None:
    raise NotFoundError(
        "Submission not found"
    )

return submission

=========================================================
COMPANY — LIST SUBMISSIONS
=========================================================

def get_company_submissions(
db: Session,
company: Company,
) -> list[VulnerabilitySubmission]:

return (
    db.query(VulnerabilitySubmission)
    .join(
        BugBountyProgram,
        VulnerabilitySubmission.program_id
        == BugBountyProgram.id,
    )
    .filter(
        BugBountyProgram.company_id
        == company.id
    )
    .options(
        joinedload(VulnerabilitySubmission.program),
        joinedload(VulnerabilitySubmission.researcher),
    )
    .order_by(
        VulnerabilitySubmission.submitted_at.desc()
    )
    .all()
)

=========================================================
COMPANY — GET SUBMISSION
=========================================================

def get_company_submission_by_id(
db: Session,
company: Company,
submission_id: int,
) -> VulnerabilitySubmission:

submission = (
    db.query(VulnerabilitySubmission)
    .join(
        BugBountyProgram,
        VulnerabilitySubmission.program_id
        == BugBountyProgram.id,
    )
    .filter(
        VulnerabilitySubmission.id == submission_id,
        BugBountyProgram.company_id == company.id,
    )
    .options(
        joinedload(VulnerabilitySubmission.program),
        joinedload(VulnerabilitySubmission.researcher),
    )
    .first()
)

if submission is None:
    raise NotFoundError(
        "Submission not found"
    )

return submission

=========================================================
COMPANY — UPDATE SUBMISSION
=========================================================

def update_submission(
db: Session,
submission: VulnerabilitySubmission,
data: SubmissionUpdate,
) -> VulnerabilitySubmission:

update_data = data.model_dump(
    exclude_unset=True
)

for key, value in update_data.items():
    setattr(
        submission,
        key,
        value,
    )

db.commit()
db.refresh(submission)

return submission

=========================================================
RESEARCHER — DELETE SUBMISSION
=========================================================

def delete_submission(
db: Session,
submission: VulnerabilitySubmission,
) -> None:

db.delete(submission)
db.commit()


"""
Notification service.

Handles creation and retrieval of in-app notifications.

Notifications belong to internal users and are used for:
- Bug bounty submission updates
- AI prediction events
- Administrative actions
- General system notifications
"""

from sqlalchemy.orm import Session

from app.core.exceptions import NotFoundError
from app.models.notification import Notification
from app.models.user import User


# =========================================================
# CREATE NOTIFICATION
# =========================================================

def create_notification(
    db: Session,
    *,
    user_id: int,
    title: str,
    message: str,
    notification_type: str = "general",
    entity_type: str | None = None,
    entity_id: int | None = None,
) -> Notification:
    """
    Create an in-app notification for a user.
    """

    notification = Notification(
        user_id=user_id,
        title=title,
        message=message,
        notification_type=notification_type,
        entity_type=entity_type,
        entity_id=entity_id,
        is_read=False,
    )

    db.add(notification)
    db.commit()
    db.refresh(notification)

    return notification


# =========================================================
# GET USER NOTIFICATIONS
# =========================================================

def get_user_notifications(
    db: Session,
    user: User,
) -> list[Notification]:
    """
    Return notifications belonging only to the
    authenticated user.
    """

    return (
        db.query(Notification)
        .filter(
            Notification.user_id == user.id
        )
        .order_by(
            Notification.created_at.desc()
        )
        .all()
    )


# =========================================================
# GET SINGLE NOTIFICATION
# =========================================================

def get_notification_by_id(
    db: Session,
    user: User,
    notification_id: int,
) -> Notification:
    """
    Return a notification only if it belongs
    to the authenticated user.
    """

    notification = (
        db.query(Notification)
        .filter(
            Notification.id == notification_id,
            Notification.user_id == user.id,
        )
        .first()
    )

    if notification is None:
        raise NotFoundError(
            "Notification not found"
        )

    return notification


# =========================================================
# MARK AS READ
# =========================================================

def mark_notification_as_read(
    db: Session,
    notification: Notification,
) -> Notification:
    """
    Mark one notification as read.
    """

    notification.is_read = True

    db.commit()
    db.refresh(notification)

    return notification


# =========================================================
# MARK ALL AS READ
# =========================================================

def mark_all_notifications_as_read(
    db: Session,
    user: User,
) -> int:
    """
    Mark all notifications belonging to the
    authenticated user as read.

    Returns the number of notifications updated.
    """

    updated_count = (
        db.query(Notification)
        .filter(
            Notification.user_id == user.id,
            Notification.is_read.is_(False),
        )
        .update(
            {
                Notification.is_read: True
            },
            synchronize_session=False,
        )
    )

    db.commit()

    return updated_count


# =========================================================
# DELETE NOTIFICATION
# =========================================================

def delete_notification(
    db: Session,
    notification: Notification,
) -> None:
    """
    Delete a notification.
    """

    db.delete(notification)
    db.commit()



"""
Schemas for Bug Bounty vulnerability submissions.
"""

from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


# =========================================================
# CREATE SUBMISSION
# =========================================================

class SubmissionCreate(BaseModel):
    """
    Data supplied by a researcher when submitting
    a vulnerability to a Bug Bounty Program.
    """

    title: str = Field(
        ...,
        min_length=5,
        max_length=200,
    )

    description: str = Field(
        ...,
        min_length=20,
    )

    vulnerability_type: str = Field(
        ...,
        min_length=2,
        max_length=100,
    )

    affected_asset: str = Field(
        ...,
        min_length=2,
        max_length=500,
    )

    steps_to_reproduce: str = Field(
        ...,
        min_length=10,
    )

    proof_of_concept: str | None = None

    impact: str = Field(
        ...,
        min_length=10,
    )

    remediation: str | None = None

    attachment_path: str | None = None


# =========================================================
# UPDATE SUBMISSION
# =========================================================

class SubmissionUpdate(BaseModel):
    """
    Fields that an authorized company/admin reviewer
    can modify during the vulnerability review process.
    """

    status: str | None = Field(
        default=None,
        min_length=3,
        max_length=30,
    )

    severity: str | None = Field(
        default=None,
        min_length=3,
        max_length=20,
    )

    bounty_amount: int | None = Field(
        default=None,
        ge=0,
    )

    reviewer_comment: str | None = None


# =========================================================
# READ SUBMISSION
# =========================================================

class SubmissionRead(BaseModel):
    """
    Public API representation of a vulnerability submission.
    """

    model_config = ConfigDict(
        from_attributes=True,
    )

    id: int

    program_id: int

    researcher_id: int

    title: str

    description: str

    vulnerability_type: str

    affected_asset: str

    steps_to_reproduce: str

    proof_of_concept: str | None

    impact: str

    remediation: str | None

    severity: str | None

    status: str

    bounty_amount: int | None

    attachment_path: str | None

    reviewer_comment: str | None

    submitted_at: datetime

    updated_at: datetime


"""
Bug Bounty Program model.

A Bug Bounty Program is owned by a company and defines the rules,
targets, scope, rewards, and visibility for security researchers.

Only approved companies will be allowed to create programs.
That business rule is enforced at the service/API layer.

Program lifecycle:
draft -> active -> paused -> closed

Visibility:
private -> public
"""

from __future__ import annotations

from datetime import datetime

from sqlalchemy import (
    Boolean,
    DateTime,
    ForeignKey,
    Integer,
    String,
    Text,
    func,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base_class import Base


class BugBountyProgram(Base):
    __tablename__ = "bug_bounty_programs"

    # =========================================================
    # PRIMARY KEY
    # =========================================================

    id: Mapped[int] = mapped_column(
        primary_key=True,
        index=True,
    )

    # =========================================================
    # COMPANY OWNERSHIP
    # =========================================================

    company_id: Mapped[int] = mapped_column(
        ForeignKey("companies.id"),
        nullable=False,
        index=True,
    )

    # =========================================================
    # BASIC INFORMATION
    # =========================================================

    program_name: Mapped[str] = mapped_column(
        String(200),
        nullable=False,
        index=True,
    )

    description: Mapped[str] = mapped_column(
        Text,
        nullable=False,
    )

    target_website: Mapped[str] = mapped_column(
        String(500),
        nullable=False,
    )

    # =========================================================
    # SCOPE
    # =========================================================

    scope: Mapped[str] = mapped_column(
        Text,
        nullable=False,
    )

    out_of_scope: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    # =========================================================
    # REWARD INFORMATION
    # =========================================================

    reward_min: Mapped[int | None] = mapped_column(
        Integer,
        nullable=True,
    )

    reward_max: Mapped[int | None] = mapped_column(
        Integer,
        nullable=True,
    )

    severity_reward_matrix: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    # =========================================================
    # PROGRAM RULES
    # =========================================================

    program_rules: Mapped[str] = mapped_column(
        Text,
        nullable=False,
    )

    submission_guidelines: Mapped[str] = mapped_column(
        Text,
        nullable=False,
    )

    # =========================================================
    # PROGRAM DATES
    # =========================================================

    start_date: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
    )

    end_date: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )

    # =========================================================
    # PROGRAM STATUS
    # =========================================================

    status: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
        default="draft",
        index=True,
    )

    # =========================================================
    # VISIBILITY
    # =========================================================

    visibility: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
        default="private",
        index=True,
    )

    # =========================================================
    # ATTACHMENTS
    # =========================================================

    attachments: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    # =========================================================
    # ACTIVE FLAG
    # =========================================================

    is_active: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        default=True,
    )

    # =========================================================
    # TIMESTAMPS
    # =========================================================

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

    # =========================================================
    # RELATIONSHIP
    # =========================================================

    company: Mapped["Company"] = relationship(
        "Company",
    )
    
    bookmarks: Mapped[list["Bookmark"]] = relationship(
    "Bookmark",
    back_populates="program",
    cascade="all, delete-orphan",
)

    # =========================================================
    # REPRESENTATION
    # =========================================================

    def __repr__(self) -> str:
        return (
            f"<BugBountyProgram "
            f"id={self.id} "
            f"name={self.program_name!r} "
            f"company_id={self.company_id} "
            f"status={self.status!r}>"
        )



"""
Application entrypoint.

Run locally with:
uvicorn app.main:app --reload --port 8000

Responsibilities of this file ONLY:

- Instantiate the FastAPI app
- Wire up middleware, exception handlers, and the versioned API router

Everything else lives in dedicated modules.
"""

import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1.router import api_router
from app.core.config import settings
from app.core.exceptions import register_exception_handlers
from app.core.logging_config import configure_logging


configure_logging()

logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(_: FastAPI):
    logger.info(
        "%s starting up in %s mode",
        settings.APP_NAME,
        settings.APP_ENV,
    )

    yield

    logger.info(
        "%s shutting down",
        settings.APP_NAME,
    )


app = FastAPI(
    title=settings.APP_NAME,
    description=(
        "AI-based vulnerability triage platform "
        "for internal security teams."
    ),
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
    lifespan=lifespan,
)

@app.get("/api/v1/health")
def health_check():
    return {"status": "ok"}
# ---------------------------------------------------------
# CORS
# ---------------------------------------------------------

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------------------------------------------------------
# Global exception handlers
# ---------------------------------------------------------

register_exception_handlers(app)


# ---------------------------------------------------------
# Versioned API routes
# ---------------------------------------------------------

app.include_router(
    api_router,
    prefix=settings.API_V1_PREFIX,
)



import { FormEvent, useState } from "react";


import { Link, useNavigate, useParams } from "react-router-dom";

import { createSubmission } from "../../api/submissions";

export default function SubmitVulnerabilityPage() {

  const { programId } = useParams<{ programId: string }>();

  const navigate = useNavigate();

  const [title, setTitle] = useState("");

  const [description, setDescription] = useState("");

  const [severity, setSeverity] = useState("");

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {

    event.preventDefault();

    if (!programId) {

      setError("Program ID is missing.");

      return;

    }

    if (!title.trim()) {

      setError("Please enter a vulnerability title.");

      return;

    }

    if (!description.trim()) {

      setError("Please enter a vulnerability description.");

      return;

    }

    try {

      setLoading(true);

      setError("");

      const submission = await createSubmission(

        Number(programId),

        {

          title: title.trim(),

          description: description.trim(),

          severity: severity || undefined,

        }

      );

      navigate(

        `/researcher/submissions/${submission.id}`

      );

    } catch (err) {

      console.error(err);

      setError(

        "Unable to submit the vulnerability. Please try again."

      );

    } finally {

      setLoading(false);

    }

  }

  return (

    <div className="max-w-3xl space-y-6 p-6">

      {/* Header */}

      <div>

        <Link

          to={`/researcher/programs/${programId}`}

          className="text-sm text-gray-500"

        >

          ← Back to Program

        </Link>

        <h1 className="mt-4 text-2xl font-bold">

          Submit Vulnerability

        </h1>

        <p className="mt-1 text-gray-500">

          Provide complete and accurate information about

          the vulnerability you discovered.

        </p>

      </div>

      {/* Error */}

      {error && (

        <div className="rounded-lg border border-red-300 bg-red-50 p-4 text-red-700">

          {error}

        </div>

      )}

      {/* Form */}

      <form

        onSubmit={handleSubmit}

        className="space-y-6 rounded-lg border p-6"

      >

        {/* Title */}

        <div>

          <label

            htmlFor="title"

            className="mb-2 block text-sm font-medium"

          >

            Vulnerability Title

          </label>

          <input

            id="title"

            type="text"

            value={title}

            onChange={(event) =>

              setTitle(event.target.value)

            }

            placeholder="Example: Stored XSS in user profile"

            className="w-full rounded-md border px-3 py-2 outline-none"

            maxLength={255}

            disabled={loading}

          />

        </div>

        {/* Severity */}

        <div>

          <label

            htmlFor="severity"

            className="mb-2 block text-sm font-medium"

          >

            Severity

          </label>

          <select

            id="severity"

            value={severity}

            onChange={(event) =>

              setSeverity(event.target.value)

            }

            className="w-full rounded-md border px-3 py-2 outline-none"

            disabled={loading}

          >

            <option value="">

              Select severity

            </option>

            <option value="critical">

              Critical

            </option>

            <option value="high">

              High

            </option>

            <option value="medium">

              Medium

            </option>

            <option value="low">

              Low

            </option>

          </select>

        </div>

        {/* Description */}

        <div>

          <label

            htmlFor="description"

            className="mb-2 block text-sm font-medium"

          >

            Vulnerability Description

          </label>

          <textarea

            id="description"

            value={description}

            onChange={(event) =>

              setDescription(event.target.value)

            }

            placeholder="Describe the vulnerability, affected component, steps to reproduce, impact, and any relevant evidence."

            rows={12}

            className="w-full resize-y rounded-md border px-3 py-2 outline-none"

            disabled={loading}

          />

        </div>

        {/* Actions */}

        <div className="flex flex-wrap gap-3">

          <button

            type="submit"

            disabled={loading}

            className="rounded-md border px-5 py-2.5 font-medium disabled:opacity-50"

          >

            {loading

              ? "Submitting..."

              : "Submit Vulnerability"}

          </button>

          <Link

            to={`/researcher/programs/${programId}`}

            className="rounded-md border px-5 py-2.5"

          >

            Cancel

          </Link>

        </div>

      </form>

    </div>

  );

}

import { FormEvent, useState } from "react";

import { Link, useNavigate, useParams } from "react-router-dom";

import { AppLayout } from "../../components/layout/AppLayout";

import { Card } from "../../components/ui/Card";

import { Alert } from "../../components/ui/Alert";

import {

  createSubmission,

  type SubmissionCreate,

} from "../../api/submissions";

import { getErrorMessage } from "../../api/client";

export default function SubmitVulnerabilityPage() {

  const { id } = useParams<{ id: string }>();

  const navigate = useNavigate();

  const [title, setTitle] = useState("");

  const [description, setDescription] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(

    event: FormEvent<HTMLFormElement>

  ) {

    event.preventDefault();

    if (!id) {

      setError("Program ID is missing");

      return;

    }

    if (!title.trim()) {

      setError("Vulnerability title is required");

      return;

    }

    if (!description.trim()) {

      setError("Vulnerability description is required");

      return;

    }

    setError(null);

    setIsSubmitting(true);

    try {

      const data: SubmissionCreate = {

        title: title.trim(),

        description: description.trim(),

      };

      const submission = await createSubmission(

        Number(id),

        data

      );

      navigate(`/reports/${submission.id}`);

    } catch (err) {

      setError(getErrorMessage(err));

    } finally {

      setIsSubmitting(false);

    }

  }

  return (

    <AppLayout title="Submit Vulnerability">

      <div className="mb-4">

        <Link

          to={`/programs/${id}`}

          className="text-sm text-[var(--color-accent)] hover:underline"

        >

          ← Back to Program

        </Link>

      </div>

      {error && (

        <div className="mb-4">

          <Alert variant="error">{error}</Alert>

        </div>

      )}

      <Card className="max-w-3xl p-6">

        <div className="mb-6">

          <h2 className="text-lg font-semibold text-[var(--color-ink)]">

            Submit a Vulnerability

          </h2>

          <p className="mt-1 text-sm text-[var(--color-ink-muted)]">

            Provide clear and detailed information about the

            vulnerability you discovered.

          </p>

        </div>

        <form

          onSubmit={handleSubmit}

          className="space-y-5"

        >

          <div>

            <label

              htmlFor="title"

              className="mb-2 block text-sm font-medium text-[var(--color-ink)]"

            >

              Vulnerability Title

            </label>

            <input

              id="title"

              type="text"

              value={title}

              onChange={(event) =>

                setTitle(event.target.value)

              }

              placeholder="Example: SQL Injection in login endpoint"

              className="w-full rounded-md border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--color-accent)]"

              disabled={isSubmitting}

            />

          </div>

          <div>

            <label

              htmlFor="description"

              className="mb-2 block text-sm font-medium text-[var(--color-ink)]"

            >

              Vulnerability Description

            </label>

            <textarea

              id="description"

              value={description}

              onChange={(event) =>

                setDescription(event.target.value)

              }

              placeholder="Describe the vulnerability, affected component, steps to reproduce, impact, and any relevant technical details."

              rows={10}

              className="w-full resize-y rounded-md border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--color-accent)]"

              disabled={isSubmitting}

            />

          </div>

          <div className="flex gap-3">

            <button

              type="submit"

              disabled={isSubmitting}

              className="rounded-md bg-[var(--color-accent)] px-5 py-2.5 text-sm font-medium text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"

            >

              {isSubmitting

                ? "Submitting..."

                : "Submit Vulnerability"}

            </button>

            <Link

              to={`/programs/${id}`}

              className="rounded-md border px-5 py-2.5 text-sm font-medium text-[var(--color-ink)] hover:bg-gray-50"

            >

              Cancel

            </Link>

          </div>

        </form>

      </Card>

    </AppLayout>

  );

}

Pasted code(20260816-055015).ts
TypeScript
Pasted code(20260816-060419).ts
TypeScript
Pasted code (2)(4).ts
TypeScript

import type { ReactNode } from "react";

import { Sidebar } from "./Sidebar";

import { Topbar } from "./Topbar";

interface AppLayoutProps {

  title: string;

  children: ReactNode;

}

export function AppLayout({ title, children }: AppLayoutProps) {

  return (

    <div className="flex h-screen overflow-hidden bg-[var(--color-canvas)]">

      <Sidebar />

      <div className="flex flex-1 flex-col overflow-hidden">

        <Topbar title={title} />

        <main className="flex-1 overflow-y-auto p-6">{children}</main>

      </div>

    </div>

  );

}

import { NavLink } from "react-router-dom";

import { LayoutDashboard, ShieldAlert, FilePlus2, ListChecks, Users } from "lucide-react";

import { useAuth } from "../../context/AuthContext";

const testerLinks = [

  { to: "/reports", label: "My Reports", icon: ListChecks },

  { to: "/reports/new", label: "Submit Report", icon: FilePlus2 },

];

const adminLinks = [

  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },

  { to: "/reports", label: "All Reports", icon: ListChecks },

];

export function Sidebar() {

  const { user } = useAuth();

  const links = user?.role === "admin" ? adminLinks : testerLinks;

  return (

    <aside className="flex h-screen w-60 shrink-0 flex-col bg-[var(--color-sidebar)] text-slate-300">

      <div className="flex items-center gap-2 px-5 py-5">

        <ShieldAlert size={20} className="text-[var(--color-accent)]" />

        <span className="font-mono text-sm font-semibold tracking-tight text-white">VulnTriage</span>

      </div>

      <nav className="flex-1 space-y-0.5 px-3">

        {links.map(({ to, label, icon: Icon }) => (

          <NavLink

            key={to}

            to={to}

            end={to === "/reports"}

            className={({ isActive }) =>

              `flex items-center gap-2.5 rounded-[var(--radius-md)] px-3 py-2 text-sm transition-colors ${

                isActive

                  ? "bg-[var(--color-sidebar-hover)] text-white"

                  : "text-slate-400 hover:bg-[var(--color-sidebar-hover)] hover:text-white"

              }`

            }

          >

            <Icon size={16} />

            {label}

          </NavLink>

        ))}

      </nav>

      <div className="border-t border-white/10 px-5 py-4 text-xs text-slate-500">

        {user?.role === "admin" ? (

          <div className="flex items-center gap-1.5">

            <Users size={12} /> Administrator

          </div>

        ) : (

          <div>Internal Tester</div>

        )}

      </div>

    </aside>

  );

}

import { LogOut } from "lucide-react";

import { useNavigate } from "react-router-dom";

import { useAuth } from "../../context/AuthContext";

interface TopbarProps {

  title: string;

}

export function Topbar({ title }: TopbarProps) {

  const { user, logout } = useAuth();

  const navigate = useNavigate();

  function handleLogout() {

    logout();

    navigate("/login");

  }

  return (

    <header className="flex h-16 shrink-0 items-center justify-between border-b border-[var(--color-border)] bg-[var(--color-surface)] px-6">

      <h1 className="text-base font-semibold text-[var(--color-ink)]">{title}</h1>

      <div className="flex items-center gap-4">

        <div className="text-right">

          <p className="text-sm font-medium leading-tight">{user?.full_name}</p>

          <p className="text-xs leading-tight text-[var(--color-ink-muted)]">{user?.email}</p>

        </div>

        <button

          onClick={handleLogout}

          className="flex items-center gap-1.5 rounded-[var(--radius-md)] px-3 py-1.5 text-sm text-[var(--color-ink-muted)] transition-colors hover:bg-[var(--color-canvas)] hover:text-[var(--color-ink)]"

        >

          <LogOut size={15} />

          Log out

        </button>

      </div>

    </header>

  );

}

import { useEffect, useState } from "react";

import { Link } from "react-router-dom";

import {

  getResearcherPrograms,

  type ResearcherProgram,

} from "../../api/researcherPrograms";

import {

  getMySubmissions,

  type VulnerabilitySubmission,

} from "../../api/submissions";

import { getErrorMessage } from "../../api/client";

export default function ResearcherDashboardPage() {

  const [programs, setPrograms] = useState<

    ResearcherProgram[]

  >([]);

  const [submissions, setSubmissions] = useState<

    VulnerabilitySubmission[]

  >([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  useEffect(() => {

    let cancelled = false;

    async function loadDashboard() {

      try {

        setLoading(true);

        setError("");

        const [

          programData,

          submissionData,

        ] = await Promise.all([

          getResearcherPrograms(),

          getMySubmissions(),

        ]);

        if (!cancelled) {

          setPrograms(programData);

          setSubmissions(submissionData);

        }

      } catch (err) {

        console.error(err);

        if (!cancelled) {

          setError(getErrorMessage(err));

        }

      } finally {

        if (!cancelled) {

          setLoading(false);

        }

      }

    }

    loadDashboard();

    return () => {

      cancelled = true;

    };

  }, []);

  if (loading) {

    return (

      <div className="p-6">

        <p>Loading researcher dashboard...</p>

      </div>

    );

  }

  const pending = submissions.filter(

    (submission) =>

      submission.status === "pending" ||

      submission.status === "submitted"

  ).length;

  const accepted = submissions.filter(

    (submission) =>

      submission.status === "accepted"

  ).length;

  const totalBounty = submissions.reduce(

    (total, submission) =>

      total +

      Number(

        submission.bounty_amount || 0

      ),

    0

  );

  return (

    <div className="space-y-6 p-6">

      {/* Header */}

      <div>

        <h1 className="text-2xl font-bold">

          Researcher Dashboard

        </h1>

        <p className="mt-1 text-gray-500">

          Find active bug bounty programs and

          manage your vulnerability submissions.

        </p>

      </div>

      {/* Error */}

      {error && (

        <div className="rounded-lg border border-red-300 bg-red-50 p-4 text-red-700">

          {error}

        </div>

      )}

      {/* Statistics */}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">

        <div className="rounded-lg border bg-white p-5 shadow-sm">

          <p className="text-sm text-gray-500">

            Active Programs

          </p>

          <p className="mt-2 text-2xl font-bold">

            {programs.length}

          </p>

        </div>

        <div className="rounded-lg border bg-white p-5 shadow-sm">

          <p className="text-sm text-gray-500">

            My Submissions

          </p>

          <p className="mt-2 text-2xl font-bold">

            {submissions.length}

          </p>

        </div>

        <div className="rounded-lg border bg-white p-5 shadow-sm">

          <p className="text-sm text-gray-500">

            Pending

          </p>

          <p className="mt-2 text-2xl font-bold">

            {pending}

          </p>

        </div>

        <div className="rounded-lg border bg-white p-5 shadow-sm">

          <p className="text-sm text-gray-500">

            Accepted

          </p>

          <p className="mt-2 text-2xl font-bold">

            {accepted}

          </p>

          <p className="mt-1 text-sm text-gray-500">

            Bounty: ₹{totalBounty.toFixed(2)}

          </p>

        </div>

      </div>

      {/* Programs */}

      <div className="rounded-lg border bg-white p-5 shadow-sm">

        <div className="flex items-center justify-between">

          <h2 className="text-lg font-semibold">

            Bug Bounty Programs

          </h2>

          <Link

            to="/researcher/programs"

            className="text-sm font-medium text-blue-600 hover:underline"

          >

            View all

          </Link>

        </div>

        <div className="mt-4">

          {programs.length === 0 ? (

            <p className="text-gray-500">

              No active bug bounty programs available.

            </p>

          ) : (

            <div className="space-y-3">

              {programs

                .slice(0, 5)

                .map((program) => (

                  <div

                    key={program.id}

                    className="flex flex-col gap-3 rounded-md border p-4 md:flex-row md:items-center md:justify-between"

                  >

                    <div>

                      <h3 className="font-medium">

                        {program.program_name}

                      </h3>

                      {program.description && (

                        <p className="mt-1 text-sm text-gray-500">

                          {program.description}

                        </p>

                      )}

                      <p className="mt-1 text-xs text-gray-400">

                        Status: {program.status}

                      </p>

                    </div>

                    <Link

                      to={`/researcher/programs/${program.id}`}

                      className="w-fit rounded-md border px-3 py-2 text-sm hover:bg-gray-50"

                    >

                      View

                    </Link>

                  </div>

                ))}

            </div>

          )}

        </div>

      </div>

      {/* Recent Submissions */}

      <div className="rounded-lg border bg-white p-5 shadow-sm">

        <div className="flex items-center justify-between">

          <h2 className="text-lg font-semibold">

            Recent Submissions

          </h2>

          <Link

            to="/researcher/submissions"

            className="text-sm font-medium text-blue-600 hover:underline"

          >

            View all

          </Link>

        </div>

        <div className="mt-4">

          {submissions.length === 0 ? (

            <p className="text-gray-500">

              You haven't submitted any vulnerabilities yet.

            </p>

          ) : (

            <div className="space-y-3">

              {submissions

                .slice(0, 5)

                .map((submission) => (

                  <div

                    key={submission.id}

                    className="flex flex-col gap-3 rounded-md border p-4 md:flex-row md:items-center md:justify-between"

                  >

                    <div>

                      <h3 className="font-medium">

                        {submission.title}

                      </h3>

                      <p className="mt-1 text-sm text-gray-500">

                        Status:{" "}

                        {submission.status}

                      </p>

                      {submission.severity && (

                        <p className="text-sm text-gray-500">

                          Severity:{" "}

                          {submission.severity}

                        </p>

                      )}

                    </div>

                    <Link

                      to={`/researcher/submissions/${submission.id}`}

                      className="w-fit rounded-md border px-3 py-2 text-sm hover:bg-gray-50"

                    >

                      View

                    </Link>

                  </div>

                ))}

            </div>

          )}

        </div>

      </div>

    </div>

  );

}

@import "tailwindcss";

@theme {
/* --- Brand / surface palette --- */
--color-canvas: #F8FAFC;
--color-surface: #FFFFFF;
--color-sidebar: #0F172A;
--color-sidebar-hover: #1E293B;
--color-border: #E2E8F0;
--color-border-strong: #CBD5E1;

--color-ink: #0F172A;
--color-ink-muted: #64748B;
--color-ink-faint: #94A3B8;

--color-accent: #2563EB;
--color-accent-hover: #1D4ED8;
--color-accent-soft: #EFF6FF;

/* --- Severity palette: one fixed hue per level, never reused elsewhere --- */
--color-critical: #DC2626;
--color-critical-soft: #FEF2F2;
--color-high: #EA580C;
--color-high-soft: #FFF7ED;
--color-medium: #D97706;
--color-medium-soft: #FFFBEB;
--color-low: #0891B2;
--color-low-soft: #ECFEFF;

--color-success: #059669;
--color-success-soft: #ECFDF5;
--color-danger: #DC2626;

/* --- Type --- */
--font-sans: "IBM Plex Sans", ui-sans-serif, system-ui, sans-serif;
--font-mono: "IBM Plex Mono", ui-monospace, monospace;

/* --- Radius: crisp, not playful --- */
--radius-sm: 4px;
--radius-md: 6px;
--radius-lg: 8px;
}

@layer base {

{
border-color: var(--color-border);
}
body {
background-color: var(--color-canvas);
color: var(--color-ink);
font-family: var(--font-sans);
-webkit-font-smoothing: antialiased;
}
:focus-visible {
outline: 2px solid var(--color-accent);
outline-offset: 2px;
}
}
its open next
Pasted code(20260816-061231).ts
TypeScript
Pasted code (2)(5).ts
TypeScript
import { apiClient } from "./client";


export interface StatusRead {
  id: number;
  name: string;
}


export interface PredictionRead {
  id: number;
  prediction?: string | null;
  confidence?: number | null;
}


export interface ReportListItem {
  id: number;
  title: string;
  category: string;
  priority: number | null;
  submission_date: string;
  status: StatusRead;
  latest_prediction: PredictionRead | null;
}


export interface DashboardStats {
  total_reports: number;


  critical_reports: number;
  high_reports: number;
  medium_reports: number;
  low_reports: number;


  open_reports: number;
  resolved_reports: number;


  severity_distribution: Record<string, number>;
  status_distribution: Record<string, number>;


  recent_reports: ReportListItem[];


  critical_vulnerabilities: ReportListItem[];
}


export async function getDashboardStats(): Promise<DashboardStats> {
  const response = await apiClient.get<DashboardStats>(
    "/dashboard/stats"
  );


  return response.data;
}

import StatCard from "./StatCard";


export default function DashboardCards() {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))",
        gap: "20px",
      }}
    >
      <StatCard
        title="Total Reports"
        value={120}
        color="#3b82f6"
      />


      <StatCard
        title="Critical"
        value={8}
        color="#ef4444"
      />


      <StatCard
        title="High"
        value={18}
        color="#f97316"
      />


      <StatCard
        title="Medium"
        value={42}
        color="#eab308"
      />


      <StatCard
        title="Low"
        value={52}
        color="#22c55e"
      />


      <StatCard
        title="Open"
        value={35}
        color="#06b6d4"
      />


      <StatCard
        title="Closed"
        value={85}
        color="#6366f1"
      />
    </div>
  );
}



import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";


import { Pie } from "react-chartjs-2";


ChartJS.register(
  ArcElement,
  Tooltip,
  Legend
);


const data = {
  labels: [
    "Critical",
    "High",
    "Medium",
    "Low",
  ],


  datasets: [
    {
      data: [8, 18, 42, 52],
    },
  ],
};


export default function DashboardCharts() {
  return (
    <div
      style={{
        width: "500px",
        margin: "30px auto",
      }}
    >
      <Pie data={data} />
    </div>
  );
}





Pasted code(20260816-061855).ts
TypeScript
wt happening
Pasted code(20260816-062240).ts
TypeScript
Pasted code (2)(6).ts
TypeScript
Pasted code(20260816-062650).ts
TypeScript
Pasted code (2)(7).ts
TypeScript
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { AuthProvider } from "./context/AuthContext";


createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </StrictMode>
);


import type { ReactNode } from "react";


import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";


interface AppLayoutProps {
  title: string;
  children: ReactNode;
}


export function AppLayout({
  title,
  children,
}: AppLayoutProps) {
  return (
    <div className="flex h-screen overflow-hidden bg-[var(--color-canvas)]">


      <Sidebar />


      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">


        <Topbar title={title} />


        <main className="flex-1 overflow-y-auto">


          <div className="mx-auto w-full max-w-[1600px] p-6 lg:p-7">


            {children}


          </div>


        </main>


      </div>


    </div>
  );
}

Pasted code(20260816-063008).ts
TypeScript
Pasted code(20260816-063258).ts
TypeScript
Pasted code (2)(8).ts
TypeScript
in single dashboard it showin 4 dashboards
now its correct i guess next
Pasted code(20260816-065102).ts
TypeScript
Pasted code (2)(9).ts
TypeScript
Pasted code (3)(1).ts
TypeScript
Pasted code (4).ts
TypeScript
Pasted code (5).ts
TypeScript
Pasted code (6).ts
TypeScript

import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import {
  getResearcherProgramById,
  type ResearcherProgram,
} from "../../api/researcherPrograms";

import {
  createBookmark,
  getMyBookmarks,
  deleteBookmark,
} from "../../api/bookmarks";

export default function ProgramDetailsPage() {
  const { id } = useParams<{ id: string }>();

  const [program, setProgram] =
    useState<ResearcherProgram | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [bookmarked, setBookmarked] = useState(false);
  const [bookmarkId, setBookmarkId] =
    useState<number | null>(null);

  const [bookmarkLoading, setBookmarkLoading] =
    useState(false);

  const [bookmarkError, setBookmarkError] =
    useState("");

  useEffect(() => {
    if (!id) {
      setError("Program ID is missing.");
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function loadProgram() {
      try {
        setError("");

        const data = await getResearcherProgramById(
          Number(id)
        );

        if (!cancelled) {
          setProgram(data);
        }
      } catch (err) {
        console.error(err);

        if (!cancelled) {
          setError(
            "Unable to load bug bounty program."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadProgram();

    return () => {
      cancelled = true;
    };
  }, [id]);

  useEffect(() => {
    if (!id) {
      return;
    }

    let cancelled = false;

    async function loadBookmarkStatus() {
      try {
        const bookmarks = await getMyBookmarks();

        const existingBookmark = bookmarks.find(
          (bookmark) =>
            bookmark.program_id === Number(id)
        );

        if (!cancelled) {
          if (existingBookmark) {
            setBookmarked(true);
            setBookmarkId(existingBookmark.id);
          } else {
            setBookmarked(false);
            setBookmarkId(null);
          }
        }
      } catch (err) {
        console.error(
          "Unable to load bookmark status:",
          err
        );
      }
    }

    loadBookmarkStatus();

    return () => {
      cancelled = true;
    };
  }, [id]);

  async function handleBookmark() {
    if (!program || bookmarkLoading) {
      return;
    }

    try {
      setBookmarkLoading(true);
      setBookmarkError("");

      if (bookmarked && bookmarkId !== null) {
        await deleteBookmark(bookmarkId);

        setBookmarked(false);
        setBookmarkId(null);
      } else {
        const bookmark = await createBookmark(
          program.id
        );

        setBookmarked(true);
        setBookmarkId(bookmark.id);
      }
    } catch (err) {
      console.error(err);
      setBookmarkError(
        "Unable to update bookmark."
      );
    } finally {
      setBookmarkLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="p-6">
        <p>Loading program...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4 p-6">
        <Link
          to="/programs"
          className="text-sm text-blue-600 hover:underline"
        >
          ← Back to Programs
        </Link>

        <div className="rounded-lg border border-red-300 bg-red-50 p-4 text-red-700">
          {error}
        </div>
      </div>
    );
  }

  if (!program) {
    return (
      <div className="space-y-4 p-6">
        <Link
          to="/programs"
          className="text-sm text-blue-600 hover:underline"
        >
          ← Back to Programs
        </Link>

        <div className="rounded-lg border p-8 text-center">
          <h2 className="text-lg font-semibold">
            Program not found
          </h2>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">

      <Link
        to="/programs"
        className="text-sm text-blue-600 hover:underline"
      >
        ← Back to Programs
      </Link>

      <div className="rounded-lg border bg-white p-6 shadow-sm">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
          <div>
            <h1 className="text-2xl font-bold">
              {program.program_name}
            </h1>

            <p className="mt-2 text-sm text-gray-500">
              Target Website
            </p>

            <p className="font-medium">
              {program.target_website}
            </p>
          </div>

          <span className="w-fit rounded-full border bg-green-50 px-3 py-1 text-sm font-medium text-green-700">
            {program.status}
          </span>
        </div>
      </div>

      <div className="rounded-lg border bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold">
          Description
        </h2>

        <p className="mt-3 whitespace-pre-wrap text-sm text-gray-600">
          {program.description ||
            "No description provided."}
        </p>
      </div>

      <div className="rounded-lg border bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold">
          Scope
        </h2>

        <p className="mt-3 whitespace-pre-wrap text-sm text-gray-600">
          {program.scope ||
            "No scope information provided."}
        </p>
      </div>

      <div className="rounded-lg border bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold">
          Out of Scope
        </h2>

        <p className="mt-3 whitespace-pre-wrap text-sm text-gray-600">
          {program.out_of_scope ||
            "No out-of-scope information provided."}
        </p>
      </div>

      <div className="rounded-lg border bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold">
          Program Rules
        </h2>

        <p className="mt-3 whitespace-pre-wrap text-sm text-gray-600">
          {program.program_rules ||
            "No program rules provided."}
        </p>
      </div>

      <div className="rounded-lg border bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold">
          Submission Guidelines
        </h2>

        <p className="mt-3 whitespace-pre-wrap text-sm text-gray-600">
          {program.submission_guidelines ||
            "No submission guidelines provided."}
        </p>
      </div>

      <div className="rounded-lg border bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold">
          Reward
        </h2>

        <p className="mt-3 text-lg font-semibold">
          ₹{program.reward_min ?? 0}
          {" - "}
          ₹{program.reward_max ?? 0}
        </p>

        {program.severity_reward_matrix && (
          <div className="mt-4">
            <p className="text-sm font-medium text-gray-500">
              Severity Reward Matrix
            </p>

            <p className="mt-2 whitespace-pre-wrap text-sm text-gray-600">
              {program.severity_reward_matrix}
            </p>
          </div>
        )}
      </div>

      <div className="rounded-lg border bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold">
          Program Period
        </h2>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div>
            <p className="text-xs text-gray-500">
              Start Date
            </p>

            <p className="mt-1 text-sm font-medium">
              {new Date(
                program.start_date
              ).toLocaleString()}
            </p>
          </div>

          <div>
            <p className="text-xs text-gray-500">
              End Date
            </p>

            <p className="mt-1 text-sm font-medium">
              {program.end_date
                ? new Date(
                    program.end_date
                  ).toLocaleString()
                : "No end date"}
            </p>
          </div>
        </div>
      </div>

      {bookmarkError && (
        <div className="rounded-lg border border-red-300 bg-red-50 p-4 text-red-700">
          {bookmarkError}
        </div>
      )}

      <div className="flex flex-wrap gap-3">

        <Link
  to={`/researcher/programs/${program.id}/submit`}
  className="inline-flex rounded-md bg-[var(--color-accent)] px-5 py-2.5 text-sm font-medium text-white hover:opacity-90"
>
  Submit Vulnerability
</Link>

        <button
          type="button"
          onClick={handleBookmark}
          disabled={bookmarkLoading}
          className="inline-flex rounded-md border px-5 py-2.5 text-sm font-medium hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {bookmarkLoading
            ? "Updating..."
            : bookmarked
              ? "★ Bookmarked"
              : "☆ Bookmark"}
        </button>

        <Link
          to="/programs"
          className="inline-flex rounded-md border px-5 py-2.5 text-sm font-medium hover:bg-gray-50"
        >
          Back to Programs
        </Link>

      </div>
    </div>
  );
}

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import {
  getResearcherPrograms,
  type ResearcherProgram,
} from "../../api/researcherPrograms";

export default function ProgramsPage() {
  const [programs, setPrograms] = useState<ResearcherProgram[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadPrograms() {
      try {
        setError("");

        const data = await getResearcherPrograms();
        setPrograms(data);
      } catch (err) {
        console.error(err);
        setError("Unable to load bug bounty programs.");
      } finally {
        setLoading(false);
      }
    }

    loadPrograms();
  }, []);

  if (loading) {
    return (
      <div className="p-6">
        <p>Loading bug bounty programs...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold">
          Bug Bounty Programs
        </h1>

        <p className="mt-1 text-gray-500">
          Explore active programs and find vulnerabilities to report.
        </p>
      </div>

      {error && (
        <div className="rounded-lg border border-red-300 bg-red-50 p-4 text-red-700">
          {error}
        </div>
      )}

      {!error && programs.length === 0 && (
        <div className="rounded-lg border p-8 text-center">
          <h2 className="text-lg font-semibold">
            No active programs
          </h2>

          <p className="mt-2 text-gray-500">
            There are currently no bug bounty programs available.
          </p>
        </div>
      )}

      {programs.length > 0 && (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {programs.map((program) => (
            <div
              key={program.id}
              className="flex flex-col rounded-lg border p-5 shadow-sm"
            >
              <div className="flex-1">
                <div className="flex items-start justify-between gap-3">
                  <h2 className="text-lg font-semibold">
                    {program.program_name}
                  </h2>

                  <span className="rounded-full border px-2 py-1 text-xs">
                    {program.status}
                  </span>
                </div>

                <p className="mt-2 text-xs text-gray-500">
                  Target: {program.target_website}
                </p>

                <p className="mt-3 text-sm text-gray-600">
                  {program.description ||
                    "No description provided."}
                </p>

                {(program.reward_min !== null ||
                  program.reward_max !== null) && (
                  <div className="mt-4">
                    <p className="text-xs text-gray-500">
                      Reward
                    </p>

                    <p className="font-medium">
                      ₹{program.reward_min ?? 0}
                      {" - "}
                      ₹{program.reward_max ?? 0}
                    </p>
                  </div>
                )}

                {program.scope && (
                  <div className="mt-4">
                    <p className="text-xs text-gray-500">
                      Scope
                    </p>

                    <p className="line-clamp-3 text-sm">
                      {program.scope}
                    </p>
                  </div>
                )}
              </div>

              <Link
                to={`/programs/${program.id}`}
                className="mt-5 inline-flex justify-center rounded-md border px-4 py-2 text-sm font-medium hover:bg-gray-50"
              >
                View Program
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

import { FormEvent, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import { AppLayout } from "../../components/layout/AppLayout";
import { Card } from "../../components/ui/Card";
import { Alert } from "../../components/ui/Alert";

import {
  createSubmission,
  type SubmissionCreate,
} from "../../api/submissions";

import { getErrorMessage } from "../../api/client";

export default function SubmitVulnerabilityPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (!id) {
      setError("Program ID is missing");
      return;
    }

    if (!title.trim()) {
      setError("Vulnerability title is required");
      return;
    }

    if (!description.trim()) {
      setError("Vulnerability description is required");
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      const data: SubmissionCreate = {
        title: title.trim(),
        description: description.trim(),
      };

      const submission = await createSubmission(
        Number(id),
        data
      );

      navigate(`/reports/${submission.id}`);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AppLayout title="Submit Vulnerability">
      <div className="mb-4">
        <Link
          to={`/programs/${id}`}
          className="text-sm text-[var(--color-accent)] hover:underline"
        >
          ← Back to Program
        </Link>
      </div>

      {error && (
        <div className="mb-4">
          <Alert variant="error">{error}</Alert>
        </div>
      )}

      <Card className="max-w-3xl p-6">
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-[var(--color-ink)]">
            Submit a Vulnerability
          </h2>

          <p className="mt-1 text-sm text-[var(--color-ink-muted)]">
            Provide clear and detailed information about the
            vulnerability you discovered.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-5"
        >
          <div>
            <label
              htmlFor="title"
              className="mb-2 block text-sm font-medium text-[var(--color-ink)]"
            >
              Vulnerability Title
            </label>

            <input
              id="title"
              type="text"
              value={title}
              onChange={(event) =>
                setTitle(event.target.value)
              }
              placeholder="Example: SQL Injection in login endpoint"
              className="w-full rounded-md border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label
              htmlFor="description"
              className="mb-2 block text-sm font-medium text-[var(--color-ink)]"
            >
              Vulnerability Description
            </label>

            <textarea
              id="description"
              value={description}
              onChange={(event) =>
                setDescription(event.target.value)
              }
              placeholder="Describe the vulnerability, affected component, steps to reproduce, impact, and any relevant technical details."
              rows={10}
              className="w-full resize-y rounded-md border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
              disabled={isSubmitting}
            />
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-md bg-[var(--color-accent)] px-5 py-2.5 text-sm font-medium text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting
                ? "Submitting..."
                : "Submit Vulnerability"}
            </button>

            <Link
              to={`/programs/${id}`}
              className="rounded-md border px-5 py-2.5 text-sm font-medium text-[var(--color-ink)] hover:bg-gray-50"
            >
              Cancel
            </Link>
          </div>
        </form>
      </Card>
    </AppLayout>
  );
}

import { useState, type ChangeEvent, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Paperclip, X } from "lucide-react";
import { AppLayout } from "../../components/layout/AppLayout";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Alert } from "../../components/ui/Alert";
import { FieldWrapper, TextArea, TextInput } from "../../components/ui/FormField";
import { Select } from "../../components/ui/Select";
import { VULNERABILITY_CATEGORIES } from "../../constants/categories";
import { submitReport } from "../../api/reports";
import { getErrorMessage } from "../../api/client";
import type { ReportCreateInput } from "../../types";

const EMPTY_FORM: Omit<ReportCreateInput, "attachment"> = {
  title: "",
  description: "",
  affected_module: "",
  category: "",
  steps_to_reproduce: "",
  expected_result: "",
  actual_result: "",
};

const MAX_ATTACHMENT_MB = 10;

export function SubmitReportPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState(EMPTY_FORM);
  const [attachment, setAttachment] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function updateField<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    if (file && file.size > MAX_ATTACHMENT_MB * 1024 * 1024) {
      setError(`Attachment must be smaller than ${MAX_ATTACHMENT_MB}MB.`);
      e.target.value = "";
      return;
    }
    setError(null);
    setAttachment(file);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      const report = await submitReport({ ...form, attachment });
      navigate(`/reports/${report.id}`);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AppLayout title="Submit Vulnerability Report">
      <div className="mx-auto max-w-2xl">
        <p className="mb-6 text-sm text-[var(--color-ink-muted)]">
          Submit a detailed report and the AI triage model will estimate its severity automatically.
          An administrator will review and confirm the final priority.
        </p>

        <Card className="p-6">
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {error && <Alert variant="error">{error}</Alert>}

            <FieldWrapper label="Title" htmlFor="title" hint="A short, specific summary of the issue.">
              <TextInput
                id="title"
                required
                minLength={5}
                maxLength={200}
                value={form.title}
                onChange={(e) => updateField("title", e.target.value)}
                placeholder="SQL injection in the login endpoint"
              />
            </FieldWrapper>

            <div className="grid grid-cols-2 gap-4">
              <FieldWrapper label="Affected module" htmlFor="affected_module">
                <TextInput
                  id="affected_module"
                  required
                  value={form.affected_module}
                  onChange={(e) => updateField("affected_module", e.target.value)}
                  placeholder="Auth Service"
                />
              </FieldWrapper>

              <FieldWrapper label="Category" htmlFor="category">
                <Select
                  id="category"
                  required
                  value={form.category}
                  onChange={(e) => updateField("category", e.target.value)}
                >
                  <option value="" disabled>
                    Select a category
                  </option>
                  {VULNERABILITY_CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </Select>
              </FieldWrapper>
            </div>

            <FieldWrapper
              label="Description"
              htmlFor="description"
              hint="Be specific — this is what the AI model reads to estimate severity."
            >
              <TextArea
                id="description"
                required
                minLength={10}
                rows={4}
                value={form.description}
                onChange={(e) => updateField("description", e.target.value)}
                placeholder="Describe the vulnerability and its potential impact..."
              />
            </FieldWrapper>

            <FieldWrapper label="Steps to reproduce" htmlFor="steps">
              <TextArea
                id="steps"
                required
                rows={3}
                value={form.steps_to_reproduce}
                onChange={(e) => updateField("steps_to_reproduce", e.target.value)}
                placeholder="1. Navigate to /login
2. Submit email as ' OR '1'='1"
              />
            </FieldWrapper>

            <div className="grid grid-cols-2 gap-4">
              <FieldWrapper label="Expected result" htmlFor="expected_result">
                <TextArea
                  id="expected_result"
                  required
                  rows={2}
                  value={form.expected_result}
                  onChange={(e) => updateField("expected_result", e.target.value)}
                  placeholder="Login is rejected"
                />
              </FieldWrapper>

              <FieldWrapper label="Actual result" htmlFor="actual_result">
                <TextArea
                  id="actual_result"
                  required
                  rows={2}
                  value={form.actual_result}
                  onChange={(e) => updateField("actual_result", e.target.value)}
                  placeholder="Login succeeds, bypassing auth"
                />
              </FieldWrapper>
            </div>

            <FieldWrapper label="Attachment (optional)" htmlFor="attachment" hint="Screenshots or logs, up to 10MB.">
              {attachment ? (
                <div className="flex items-center justify-between rounded-[var(--radius-md)] border border-[var(--color-border-strong)] px-3 py-2 text-sm">
                  <span className="flex items-center gap-2 text-[var(--color-ink)]">
                    <Paperclip size={14} />
                    {attachment.name}
                  </span>
                  <button
                    type="button"
                    onClick={() => setAttachment(null)}
                    className="text-[var(--color-ink-muted)] hover:text-[var(--color-danger)]"
                  >
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <input
                  id="attachment"
                  type="file"
                  accept=".png,.jpg,.jpeg,.pdf,.txt,.log,.zip"
                  onChange={handleFileChange}
                  className="w-full rounded-[var(--radius-md)] border border-dashed border-[var(--color-border-strong)] px-3 py-2 text-sm text-[var(--color-ink-muted)] file:mr-3 file:rounded-[var(--radius-sm)] file:border-0 file:bg-[var(--color-accent-soft)] file:px-3 file:py-1 file:text-[var(--color-accent)]"
                />
              )}
            </FieldWrapper>

            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="secondary" onClick={() => navigate("/reports")}>
                Cancel
              </Button>
              <Button type="submit" isLoading={isSubmitting}>
                Submit report
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </AppLayout>
  );
}

import { FormEvent, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { AppLayout } from "../../components/layout/AppLayout";
import { Card } from "../../components/ui/Card";
import { Alert } from "../../components/ui/Alert";

import {
  createSubmission,
} from "../../api/submissions";

import { getErrorMessage } from "../../api/client";

export default function SubmitBugBountyPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [vulnerabilityType, setVulnerabilityType] = useState("");
  const [affectedAsset, setAffectedAsset] = useState("");
  const [description, setDescription] = useState("");
  const [stepsToReproduce, setStepsToReproduce] = useState("");
  const [proofOfConcept, setProofOfConcept] = useState("");
  const [impact, setImpact] = useState("");
  const [remediation, setRemediation] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (!id) {
      setError("Program ID is missing");
      return;
    }

    if (title.trim().length < 5) {
      setError(
        "Vulnerability title must be at least 5 characters"
      );
      return;
    }

    if (description.trim().length < 20) {
      setError(
        "Vulnerability description must be at least 20 characters"
      );
      return;
    }

    if (vulnerabilityType.trim().length < 2) {
      setError("Vulnerability type is required");
      return;
    }

    if (affectedAsset.trim().length < 2) {
      setError("Affected asset is required");
      return;
    }

    if (stepsToReproduce.trim().length < 10) {
      setError(
        "Steps to reproduce must be at least 10 characters"
      );
      return;
    }

    if (impact.trim().length < 10) {
      setError(
        "Impact description must be at least 10 characters"
      );
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      await createSubmission(Number(id), {
        title: title.trim(),
        description: description.trim(),
        vulnerability_type:
          vulnerabilityType.trim(),
        affected_asset:
          affectedAsset.trim(),
        steps_to_reproduce:
          stepsToReproduce.trim(),
        proof_of_concept:
          proofOfConcept.trim() || null,
        impact: impact.trim(),
        remediation:
          remediation.trim() || null,
        attachment_path: null,
      });

      navigate("/reports");
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AppLayout title="Submit Vulnerability">

      <Card className="max-w-4xl p-6">

        <div className="mb-6">
          <h2 className="text-lg font-semibold text-[var(--color-ink)]">
            Submit Vulnerability
          </h2>

          <p className="mt-1 text-sm text-[var(--color-ink-muted)]">
            Provide detailed information about the
            vulnerability discovered in this Bug Bounty Program.
          </p>
        </div>

        {error && (
          <div className="mb-5">
            <Alert variant="error">
              {error}
            </Alert>
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="space-y-5"
        >

          {/* TITLE */}

          <div>
            <label className="mb-2 block text-sm font-medium">
              Vulnerability Title *
            </label>

            <input
              type="text"
              value={title}
              onChange={(event) =>
                setTitle(event.target.value)
              }
              placeholder="Example: SQL Injection in login endpoint"
              disabled={isSubmitting}
              className="w-full rounded-lg border px-4 py-3"
            />
          </div>

          {/* VULNERABILITY TYPE */}

          <div>
            <label className="mb-2 block text-sm font-medium">
              Vulnerability Type *
            </label>

            <input
              type="text"
              value={vulnerabilityType}
              onChange={(event) =>
                setVulnerabilityType(event.target.value)
              }
              placeholder="Example: SQL Injection"
              disabled={isSubmitting}
              className="w-full rounded-lg border px-4 py-3"
            />
          </div>

          {/* AFFECTED ASSET */}

          <div>
            <label className="mb-2 block text-sm font-medium">
              Affected Asset *
            </label>

            <input
              type="text"
              value={affectedAsset}
              onChange={(event) =>
                setAffectedAsset(event.target.value)
              }
              placeholder="Example: https://example.com/login"
              disabled={isSubmitting}
              className="w-full rounded-lg border px-4 py-3"
            />
          </div>

          {/* DESCRIPTION */}

          <div>
            <label className="mb-2 block text-sm font-medium">
              Vulnerability Description *
            </label>

            <textarea
              value={description}
              onChange={(event) =>
                setDescription(event.target.value)
              }
              placeholder="Describe the vulnerability in detail..."
              rows={7}
              disabled={isSubmitting}
              className="w-full resize-y rounded-lg border px-4 py-3"
            />
          </div>

          {/* STEPS */}

          <div>
            <label className="mb-2 block text-sm font-medium">
              Steps to Reproduce *
            </label>

            <textarea
              value={stepsToReproduce}
              onChange={(event) =>
                setStepsToReproduce(event.target.value)
              }
              placeholder={`1. Open the affected endpoint
2. Enter the required input
3. Send the request
4. Observe the vulnerability`}
              rows={8}
              disabled={isSubmitting}
              className="w-full resize-y rounded-lg border px-4 py-3"
            />
          </div>

          {/* POC */}

          <div>
            <label className="mb-2 block text-sm font-medium">
              Proof of Concept
            </label>

            <textarea
              value={proofOfConcept}
              onChange={(event) =>
                setProofOfConcept(event.target.value)
              }
              placeholder="Provide safe proof-of-concept details, request examples, screenshots references, etc."
              rows={7}
              disabled={isSubmitting}
              className="w-full resize-y rounded-lg border px-4 py-3"
            />
          </div>

          {/* IMPACT */}

          <div>
            <label className="mb-2 block text-sm font-medium">
              Impact *
            </label>

            <textarea
              value={impact}
              onChange={(event) =>
                setImpact(event.target.value)
              }
              placeholder="Explain the security impact of this vulnerability..."
              rows={5}
              disabled={isSubmitting}
              className="w-full resize-y rounded-lg border px-4 py-3"
            />
          </div>

          {/* REMEDIATION */}

          <div>
            <label className="mb-2 block text-sm font-medium">
              Suggested Remediation
            </label>

            <textarea
              value={remediation}
              onChange={(event) =>
                setRemediation(event.target.value)
              }
              placeholder="Provide recommendations for fixing the vulnerability..."
              rows={5}
              disabled={isSubmitting}
              className="w-full resize-y rounded-lg border px-4 py-3"
            />
          </div>

          {/* BUTTONS */}

          <div className="flex gap-3 pt-2">

            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-lg bg-[var(--color-accent)] px-5 py-3 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting
                ? "Submitting..."
                : "Submit Vulnerability"}
            </button>

            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => navigate(-1)}
              className="rounded-lg border px-5 py-3 text-sm font-medium"
            >
              Cancel
            </button>

          </div>

        </form>
      </Card>
    </AppLayout>
  );
}

import { FormEvent, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { AppLayout } from "../../components/layout/AppLayout";
import { Card } from "../../components/ui/Card";
import { Alert } from "../../components/ui/Alert";

import {
  createSubmission,
} from "../../api/submissions";

import { getErrorMessage } from "../../api/client";

export default function SubmitBugBountyPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [vulnerabilityType, setVulnerabilityType] = useState("");
  const [affectedAsset, setAffectedAsset] = useState("");
  const [description, setDescription] = useState("");
  const [stepsToReproduce, setStepsToReproduce] = useState("");
  const [proofOfConcept, setProofOfConcept] = useState("");
  const [impact, setImpact] = useState("");
  const [remediation, setRemediation] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (!id) {
      setError("Program ID is missing");
      return;
    }

    if (title.trim().length < 5) {
      setError(
        "Vulnerability title must be at least 5 characters"
      );
      return;
    }

    if (description.trim().length < 20) {
      setError(
        "Vulnerability description must be at least 20 characters"
      );
      return;
    }

    if (vulnerabilityType.trim().length < 2) {
      setError("Vulnerability type is required");
      return;
    }

    if (affectedAsset.trim().length < 2) {
      setError("Affected asset is required");
      return;
    }

    if (stepsToReproduce.trim().length < 10) {
      setError(
        "Steps to reproduce must be at least 10 characters"
      );
      return;
    }

    if (impact.trim().length < 10) {
      setError(
        "Impact description must be at least 10 characters"
      );
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      await createSubmission(Number(id), {
        title: title.trim(),
        description: description.trim(),
        vulnerability_type:
          vulnerabilityType.trim(),
        affected_asset:
          affectedAsset.trim(),
        steps_to_reproduce:
          stepsToReproduce.trim(),
        proof_of_concept:
          proofOfConcept.trim() || null,
        impact: impact.trim(),
        remediation:
          remediation.trim() || null,
        attachment_path: null,
      });

      navigate("/reports");
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AppLayout title="Submit Vulnerability">

      <Card className="max-w-4xl p-6">

        <div className="mb-6">
          <h2 className="text-lg font-semibold text-[var(--color-ink)]">
            Submit Vulnerability
          </h2>

          <p className="mt-1 text-sm text-[var(--color-ink-muted)]">
            Provide detailed information about the
            vulnerability discovered in this Bug Bounty Program.
          </p>
        </div>

        {error && (
          <div className="mb-5">
            <Alert variant="error">
              {error}
            </Alert>
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="space-y-5"
        >

          {/* TITLE */}

          <div>
            <label className="mb-2 block text-sm font-medium">
              Vulnerability Title *
            </label>

            <input
              type="text"
              value={title}
              onChange={(event) =>
                setTitle(event.target.value)
              }
              placeholder="Example: SQL Injection in login endpoint"
              disabled={isSubmitting}
              className="w-full rounded-lg border px-4 py-3"
            />
          </div>

          {/* VULNERABILITY TYPE */}

          <div>
            <label className="mb-2 block text-sm font-medium">
              Vulnerability Type *
            </label>

            <input
              type="text"
              value={vulnerabilityType}
              onChange={(event) =>
                setVulnerabilityType(event.target.value)
              }
              placeholder="Example: SQL Injection"
              disabled={isSubmitting}
              className="w-full rounded-lg border px-4 py-3"
            />
          </div>

          {/* AFFECTED ASSET */}

          <div>
            <label className="mb-2 block text-sm font-medium">
              Affected Asset *
            </label>

            <input
              type="text"
              value={affectedAsset}
              onChange={(event) =>
                setAffectedAsset(event.target.value)
              }
              placeholder="Example: https://example.com/login"
              disabled={isSubmitting}
              className="w-full rounded-lg border px-4 py-3"
            />
          </div>

          {/* DESCRIPTION */}

          <div>
            <label className="mb-2 block text-sm font-medium">
              Vulnerability Description *
            </label>

            <textarea
              value={description}
              onChange={(event) =>
                setDescription(event.target.value)
              }
              placeholder="Describe the vulnerability in detail..."
              rows={7}
              disabled={isSubmitting}
              className="w-full resize-y rounded-lg border px-4 py-3"
            />
          </div>

          {/* STEPS */}

          <div>
            <label className="mb-2 block text-sm font-medium">
              Steps to Reproduce *
            </label>

            <textarea
              value={stepsToReproduce}
              onChange={(event) =>
                setStepsToReproduce(event.target.value)
              }
              placeholder={`1. Open the affected endpoint
2. Enter the required input
3. Send the request
4. Observe the vulnerability`}
              rows={8}
              disabled={isSubmitting}
              className="w-full resize-y rounded-lg border px-4 py-3"
            />
          </div>

          {/* POC */}

          <div>
            <label className="mb-2 block text-sm font-medium">
              Proof of Concept
            </label>

            <textarea
              value={proofOfConcept}
              onChange={(event) =>
                setProofOfConcept(event.target.value)
              }
              placeholder="Provide safe proof-of-concept details, request examples, screenshots references, etc."
              rows={7}
              disabled={isSubmitting}
              className="w-full resize-y rounded-lg border px-4 py-3"
            />
          </div>

          {/* IMPACT */}

          <div>
            <label className="mb-2 block text-sm font-medium">
              Impact *
            </label>

            <textarea
              value={impact}
              onChange={(event) =>
                setImpact(event.target.value)
              }
              placeholder="Explain the security impact of this vulnerability..."
              rows={5}
              disabled={isSubmitting}
              className="w-full resize-y rounded-lg border px-4 py-3"
            />
          </div>

          {/* REMEDIATION */}

          <div>
            <label className="mb-2 block text-sm font-medium">
              Suggested Remediation
            </label>

            <textarea
              value={remediation}
              onChange={(event) =>
                setRemediation(event.target.value)
              }
              placeholder="Provide recommendations for fixing the vulnerability..."
              rows={5}
              disabled={isSubmitting}
              className="w-full resize-y rounded-lg border px-4 py-3"
            />
          </div>

          {/* BUTTONS */}

          <div className="flex gap-3 pt-2">

            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-lg bg-[var(--color-accent)] px-5 py-3 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting
                ? "Submitting..."
                : "Submit Vulnerability"}
            </button>

            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => navigate(-1)}
              className="rounded-lg border px-5 py-3 text-sm font-medium"
            >
              Cancel
            </button>

          </div>

        </form>
      </Card>
    </AppLayout>
  );
}

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { AppLayout } from "../../components/layout/AppLayout";
import { Card } from "../../components/ui/Card";
import { Alert } from "../../components/ui/Alert";

import {
  getMySubmissions,
  type VulnerabilitySubmission,
} from "../../api/submissions";

import { getErrorMessage } from "../../api/client";

export default function MySubmissionsPage() {
  const [submissions, setSubmissions] = useState<
    VulnerabilitySubmission[]
  >([]);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadSubmissions();
  }, []);

  async function loadSubmissions() {
    try {
      setIsLoading(true);
      setError(null);

      const data = await getMySubmissions();

      setSubmissions(data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }

  function getStatusClass(status: string) {
    switch (status.toLowerCase()) {
      case "accepted":
        return "bg-green-100 text-green-700";

      case "resolved":
        return "bg-blue-100 text-blue-700";

      case "rejected":
        return "bg-red-100 text-red-700";

      case "triaged":
        return "bg-yellow-100 text-yellow-700";

      default:
        return "bg-gray-100 text-gray-700";
    }
  }

  function getSeverityClass(severity?: string | null) {
    switch (severity?.toLowerCase()) {
      case "critical":
        return "bg-red-100 text-red-800";

      case "high":
        return "bg-orange-100 text-orange-800";

      case "medium":
        return "bg-yellow-100 text-yellow-800";

      case "low":
        return "bg-green-100 text-green-800";

      default:
        return "bg-gray-100 text-gray-700";
    }
  }

  return (
    <AppLayout title="My Vulnerability Submissions">
      {error && (
        <div className="mb-5">
          <Alert variant="error">
            {error}
          </Alert>
        </div>
      )}

      {isLoading ? (
        <Card className="p-10 text-center">
          <p className="text-sm text-[var(--color-ink-muted)]">
            Loading submissions...
          </p>
        </Card>
      ) : submissions.length === 0 ? (
        <Card className="p-10 text-center">
          <h3 className="text-base font-semibold text-[var(--color-ink)]">
            No submissions yet
          </h3>

          <p className="mt-2 text-sm text-[var(--color-ink-muted)]">
            You have not submitted any vulnerabilities yet.
          </p>

          <div className="mt-5">
            <Link
              to="/programs"
              className="inline-flex rounded-md bg-[var(--color-accent)] px-5 py-2.5 text-sm font-medium text-white"
            >
              Browse Bug Bounty Programs
            </Link>
          </div>
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="px-5 py-4 text-left font-semibold">
                    Title
                  </th>

                  <th className="px-5 py-4 text-left font-semibold">
                    Program
                  </th>

                  <th className="px-5 py-4 text-left font-semibold">
                    Status
                  </th>

                  <th className="px-5 py-4 text-left font-semibold">
                    Severity
                  </th>

                  <th className="px-5 py-4 text-left font-semibold">
                    Bounty
                  </th>

                  <th className="px-5 py-4 text-left font-semibold">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody>
                {submissions.map((submission) => (
                  <tr
                    key={submission.id}
                    className="border-b last:border-b-0"
                  >
                    <td className="px-5 py-4">
                      <p className="font-medium text-[var(--color-ink)]">
                        {submission.title}
                      </p>

                      <p className="mt-1 max-w-xs truncate text-xs text-[var(--color-ink-muted)]">
                        {submission.description}
                      </p>
                    </td>

                    <td className="px-5 py-4">
                      #{submission.program_id}
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-medium ${getStatusClass(
                          submission.status
                        )}`}
                      >
                        {submission.status}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      {submission.severity ? (
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-medium ${getSeverityClass(
                            submission.severity
                          )}`}
                        >
                          {submission.severity}
                        </span>
                      ) : (
                        <span className="text-gray-400">
                          Not assigned
                        </span>
                      )}
                    </td>

                    <td className="px-5 py-4">
                      {submission.bounty_amount !== null &&
                      submission.bounty_amount !== undefined
                        ? submission.bounty_amount
                        : "-"}
                    </td>

                    <td className="px-5 py-4">
                      <Link
                        to={`/reports/${submission.id}`}
                        className="text-[var(--color-accent)] hover:underline"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </AppLayout>
  );
}

import { apiClient } from "./client";

export interface Program {
  id: number;
  program_name: string;
  description?: string | null;
  target_website: string;
  scope?: string | null;
  reward_min?: number | null;
  reward_max?: number | null;
  status: string;
  created_at?: string;
  updated_at?: string;
}

export async function getPrograms(): Promise<Program[]> {
  const response = await apiClient.get<Program[]>(
    "/company/programs"
  );

  return response.data;
}

export async function getProgramById(
  id: number
): Promise<Program> {
  const response = await apiClient.get<Program>(
    `/company/programs/${id}`
  );

  return response.data;
}

export async function createProgram(
  data: Omit<Program, "id" | "created_at" | "updated_at">
): Promise<Program> {
  const response = await apiClient.post<Program>(
    "/company/programs",
    data
  );

  return response.data;
}

export async function updateProgram(
  id: number,
  data: Partial<Program>
): Promise<Program> {
  const response = await apiClient.put<Program>(
    `/company/programs/${id}`,
    data
  );

  return response.data;
}

export async function deleteProgram(
  id: number
): Promise<void> {
  await apiClient.delete(
    `/company/programs/${id}`
  );
}

import { apiClient } from "./client";

// =========================================================
// TYPES
// =========================================================

export interface SubmissionCreate {
  title: string;
  description: string;
  vulnerability_type: string;
  affected_asset: string;
  steps_to_reproduce: string;
  proof_of_concept?: string | null;
  impact: string;
  remediation?: string | null;
  attachment_path?: string | null;
}

export interface SubmissionUpdate {
  status?: string | null;
  severity?: string | null;
  bounty_amount?: number | null;
  reviewer_comment?: string | null;
}

export interface VulnerabilitySubmission {
  id: number;

  program_id: number;
  researcher_id: number;

  title: string;
  description: string;

  vulnerability_type: string;
  affected_asset: string;

  steps_to_reproduce: string;

  proof_of_concept?: string | null;

  impact: string;

  remediation?: string | null;

  severity?: string | null;

  status: string;

  bounty_amount?: number | null;

  attachment_path?: string | null;

  reviewer_comment?: string | null;

  submitted_at: string;
  updated_at: string;

  // Program information
  program?: {
    id: number;
    company_id: number;
    program_name: string;
    description?: string | null;
    target_website: string;
    scope?: string | null;
    out_of_scope?: string | null;
    reward_min?: number | null;
    reward_max?: number | null;
    severity_reward_matrix?: string | null;
    program_rules?: string;
    submission_guidelines?: string;
    start_date?: string;
    end_date?: string | null;
    status?: string;
    visibility?: string;
    attachments?: string | null;
    is_active?: boolean;
    created_at?: string;
    updated_at?: string;
  };

  // Researcher information
  researcher?: {
    id: number;
    full_name: string;
    email: string;
    role?: string;
  };
}

// =========================================================
// RESEARCHER
// CREATE SUBMISSION
// POST /submissions/programs/{program_id}
// =========================================================

export async function createSubmission(
  programId: number,
  data: SubmissionCreate
): Promise<VulnerabilitySubmission> {
  const response =
    await apiClient.post<VulnerabilitySubmission>(
      `/submissions/programs/${programId}`,
      data
    );

  return response.data;
}

// =========================================================
// RESEARCHER
// GET MY SUBMISSIONS
// GET /submissions/mine
// =========================================================

export async function getMySubmissions(): Promise<
  VulnerabilitySubmission[]
> {
  const response =
    await apiClient.get<VulnerabilitySubmission[]>(
      "/submissions/mine"
    );

  return response.data;
}

// =========================================================
// RESEARCHER
// GET MY SUBMISSION
// GET /submissions/mine/{submission_id}
// =========================================================

export async function getMySubmissionById(
  submissionId: number
): Promise<VulnerabilitySubmission> {
  const response =
    await apiClient.get<VulnerabilitySubmission>(
      `/submissions/mine/${submissionId}`
    );

  return response.data;
}

// =========================================================
// RESEARCHER
// DELETE MY SUBMISSION
// DELETE /submissions/mine/{submission_id}
// =========================================================

export async function deleteMySubmission(
  submissionId: number
): Promise<void> {
  await apiClient.delete(
    `/submissions/mine/${submissionId}`
  );
}

// =========================================================
// COMPANY
// GET ALL SUBMISSIONS
// GET /submissions/company
// =========================================================

export async function getCompanySubmissions(): Promise<
  VulnerabilitySubmission[]
> {
  const response =
    await apiClient.get<VulnerabilitySubmission[]>(
      "/submissions/company"
    );

  return response.data;
}

// =========================================================
// COMPANY
// GET SUBMISSION BY ID
// GET /submissions/company/{submission_id}
// =========================================================

export async function getCompanySubmissionById(
  submissionId: number
): Promise<VulnerabilitySubmission> {
  const response =
    await apiClient.get<VulnerabilitySubmission>(
      `/submissions/company/${submissionId}`
    );

  return response.data;
}

// =========================================================
// COMPANY
// UPDATE / REVIEW SUBMISSION
// PUT /submissions/company/{submission_id}
// =========================================================

export async function updateCompanySubmission(
  submissionId: number,
  data: SubmissionUpdate
): Promise<VulnerabilitySubmission> {
  const response =
    await apiClient.put<VulnerabilitySubmission>(
      `/submissions/company/${submissionId}`,
      data
    );

  return response.data;
}

// =========================================================
// ALIAS
// Keep reviewSubmission available if another page uses it.
// =========================================================

export async function reviewSubmission(
  submissionId: number,
  data: SubmissionUpdate
): Promise<VulnerabilitySubmission> {
  return updateCompanySubmission(
    submissionId,
    data
  );
}

import { apiClient } from "./client";

export interface ResearcherProgram {
  id: number;
  company_id: number;

  program_name: string;
  description: string;
  target_website: string;

  scope: string;
  out_of_scope: string | null;

  reward_min: number | null;
  reward_max: number | null;

  severity_reward_matrix: string | null;

  program_rules: string;
  submission_guidelines: string;

  start_date: string;
  end_date: string | null;

  status: string;
  visibility: string;

  attachments: string | null;

  is_active: boolean;

  created_at: string;
  updated_at: string;
}

/**
 * Get active/public programs available to researchers.
 */
export async function getResearcherPrograms(): Promise<
  ResearcherProgram[]
> {
  const response =
    await apiClient.get<ResearcherProgram[]>(
      "/programs/"
    );

  return response.data;
}

/**
 * Get one researcher-visible program.
 */
export async function getResearcherProgramById(
  programId: number
): Promise<ResearcherProgram> {
  const response =
    await apiClient.get<ResearcherProgram>(
      `/programs/${programId}`
    );

  return response.data;
}

import { apiClient } from "./client";
import type {
  Report,
  ReportCreateInput,
  ReportListItem,
  Status,
} from "../types";

export interface ReportFilters {
  status_id?: number;
  category?: string;
  search?: string;
}

export async function updateReport(
  id: number,
  data: {
    status_id?: number;
    priority?: number | null;
  }
): Promise<Report> {
  const { data: response } = await apiClient.patch<Report>(
    `/reports/${id}`,
    data
  );

  return response;
}

export async function submitReport(
  input: ReportCreateInput
): Promise<Report> {
  const form = new FormData();

  form.set("title", input.title);
  form.set("description", input.description);
  form.set("affected_module", input.affected_module);
  form.set("category", input.category);
  form.set("steps_to_reproduce", input.steps_to_reproduce);
  form.set("expected_result", input.expected_result);
  form.set("actual_result", input.actual_result);

  if (input.attachment) {
    form.set("attachment", input.attachment);
  }

  const { data } = await apiClient.post<Report>(
    "/reports",
    form,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return data;
}

export async function getReports(
  filters: ReportFilters = {}
): Promise<ReportListItem[]> {
  const { data } = await apiClient.get<ReportListItem[]>(
    "/reports",
    {
      params: filters,
    }
  );

  return data;
}

export async function getReport(
  id: number
): Promise<Report> {
  const { data } = await apiClient.get<Report>(
    `/reports/${id}`
  );

  return data;
}

export async function getStatuses(): Promise<Status[]> {
  const { data } = await apiClient.get<Status[]>(
    "/statuses"
  );

  return data;
}

export async function downloadAttachment(
  reportId: number,
  filename: string
): Promise<void> {
  const response = await apiClient.get(
    `/reports/${reportId}/attachment`,
    {
      responseType: "blob",
    }
  );

  const url = window.URL.createObjectURL(
    new Blob([response.data])
  );

  const link = document.createElement("a");

  link.href = url;
  link.download = filename;

  document.body.appendChild(link);

  link.click();

  link.remove();

  window.URL.revokeObjectURL(url);
}

Pasted code(20260816-070544).ts
TypeScript
Pasted code(20260816-070656).ts
TypeScript
nd bro we have to make ui on everything so im sayin first finish ui onn evrything means company nd loin page on ike real website everything nd then we will satrt testing on evrything properly
5fec71ba-caf2-4a45-bd87-3e66f76f1e77.zip
Zip Archive

Yes bro, I can see the exact structure now. We have the researcher folder:

frontend/src/pages/researcher/
├── MySubmissionsPage.tsx
├── ProgramDetailsPage.tsx
├── ProgramsPage.tsx
├── ResearcherDashboardPage.tsx
├── SubmissionDetailsPage.tsx
└── SubmitVulnerabilityPage.tsx
First file — send this one:
frontend/src/pages/researcher/ResearcherDashboardPage.tsx

Don't send anything else yet. Send that complete file here.

I'll return the complete edited ResearcherDashboardPage.tsx, not just snippets, so you can replace it directly.

Then we'll go in this order:

1. ResearcherDashboardPage.tsx
2. ProgramsPage.tsx
3. ProgramDetailsPage.tsx
4. SubmitVulnerabilityPage.tsx
5. MySubmissionsPage.tsx
6. SubmissionDetailsPage.tsx

Then we'll move to Company UI, then Admin UI, then Auth/Login/Register, and finally the complete UI consistency pass.

This matches the actual researcher routes already present in your project.

Send ResearcherDashboardPage.tsx now.

Pasted code(20260816-072208).ts
TypeScript
bro please fast the work 

Yes bro, I remember. We are finishing the complete UI first, then we will do full testing. No redoing Module 1 or already-working backend features.

Send me this next file:
frontend/src/pages/researcher/ResearcherDashboardPage.tsx

From your screenshot, this is the main Researcher Dashboard and it is currently marked 9+ changes, so this is the next UI file we should finish properly.

After that, we go in this order:

frontend/src/pages/researcher/ResearcherDashboardPage.tsx ← SEND NOW
frontend/src/pages/researcher/MySubmissionsPage.tsx
frontend/src/pages/researcher/ProgramDetailsPage.tsx
frontend/src/pages/researcher/SubmissionDetailsPage.tsx
frontend/src/pages/researcher/ProgramsPage.tsx
frontend/src/pages/researcher/SubmitVulnerabilityPage.tsx
Finish remaining Company UI
Finish Admin UI
Finish Login/Register
Common UI/navigation/responsive polish
Then complete Phase 1 flow testing
Then full project testing

So don't send the whole ZIP.

👉 Send only frontend/src/pages/researcher/ResearcherDashboardPage.tsx now.
I'll edit the complete file so you can directly replace it.

Pasted code(20260816-072253).ts
TypeScript

Yes bro — we’re moving fast now. I found the current Researcher Dashboard file and edited the UI properly without changing the API/data flow.

✅ Completed now

Replace this file:

frontend/src/pages/researcher/ResearcherDashboardPage.tsx

with this:

Download edited ResearcherDashboardPage.tsx

UI improvements
Professional security-platform dashboard
Hero/welcome section
Quick actions
Better statistics cards
Programs section
Research activity panel
Bounty summary
Recent submissions table
Severity badges
Status badges
Empty states
Loading skeleton
Responsive mobile/tablet/desktop UI
Kept your existing API calls and routes intact
🔥 NEXT — don't send random files

Now we continue in this order:

1. frontend/src/pages/researcher/ProgramsPage.tsx ← NEXT
2. frontend/src/pages/researcher/ProgramDetailsPage.tsx
3. frontend/src/pages/reports/MySubmissionsPage.tsx
4. frontend/src/pages/reports/ReportDetailPage.tsx
5. frontend/src/pages/programs/SubmitVulnerabilityPage.tsx
6. Researcher submission details page
7. Company UI
8. Admin UI
9. Login/Register + company login/register polish
10. Then Phase 1 complete-flow testing + full project testing

Send ProgramsPage.tsx now. We won't waste time redoing the already completed backend/Phase-1 work.

ResearcherDashboardPage.tsx
Code

z̡̩̖̬̈ụ̯D̋̈
H̤̮̭̙B̠̜̔q̭̂
Ḃ̢̬̗̄r̮̜̝̍d̜̠̩
d̡̮̃̌L̠̍̐̕u̙̍
ResearcherDashboardPage.tsx
import { useEffect, useState } from "react";
import {
  Activity,
  ArrowRight,
  Award,
  Bug,
  CheckCircle2,
  ChevronRight,
  Clock3,
  DollarSign,
  FileSearch,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingUp,
} from "lucide-react";
import { Link } from "react-router-dom";

import { AppLayout } from "../../components/layout/AppLayout";

import {
  getResearcherPrograms,
  type ResearcherProgram,
} from "../../api/researcherPrograms";

import {
  getMySubmissions,
  type VulnerabilitySubmission,
} from "../../api/submissions";

import { getErrorMessage } from "../../api/client";

function formatCurrency(value: number) {
  return `₹${value.toLocaleString("en-IN")}`;
}

function getSeverityClass(severity?: string | null) {
  switch ((severity || "").toLowerCase()) {
    case "critical":
      return "bg-red-50 text-red-700 ring-1 ring-inset ring-red-200";
    case "high":
      return "bg-orange-50 text-orange-700 ring-1 ring-inset ring-orange-200";
    case "medium":
      return "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-200";
    case "low":
      return "bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-200";
    default:
      return "bg-slate-50 text-slate-600 ring-1 ring-inset ring-slate-200";
  }
}

export default function ResearcherDashboardPage() {
  const [programs, setPrograms] = useState<ResearcherProgram[]>([]);
  const [submissions, setSubmissions] = useState<
    VulnerabilitySubmission[]
  >([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadDashboard() {
      try {
        setLoading(true);
        setError("");

        const [programData, submissionData] = await Promise.all([
          getResearcherPrograms(),
          getMySubmissions(),
        ]);

        if (!cancelled) {
          setPrograms(programData);
          setSubmissions(submissionData);
        }
      } catch (err) {
        console.error(err);

        if (!cancelled) {
          setError(getErrorMessage(err));
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadDashboard();

    return () => {
      cancelled = true;
    };
  }, []);

  const pending = submissions.filter(
    (submission) =>
      submission.status === "pending" ||
      submission.status === "submitted"
  ).length;

  const accepted = submissions.filter(
    (submission) =>
      submission.status === "accepted"
  ).length;

  const resolved = submissions.filter(
    (submission) =>
      submission.status === "resolved" ||
      submission.status === "accepted"
  ).length;

  const totalBounty = submissions.reduce(
    (total, submission) =>
      total + Number(submission.bounty_amount || 0),
    0
  );

  function statusClass(status: string) {
    switch (status.toLowerCase()) {
      case "accepted":
      case "resolved":
        return "bg-[var(--color-success-soft)] text-[var(--color-success)]";

      case "rejected":
        return "bg-[var(--color-critical-soft)] text-[var(--color-critical)]";

      case "pending":
      case "submitted":
        return "bg-[var(--color-medium-soft)] text-[var(--color-medium)]";

      default:
        return "bg-slate-100 text-slate-600";
    }
  }

  if (loading) {
    return (
      <AppLayout title="Researcher Dashboard">
        <div className="min-h-[calc(100vh-120px)] bg-[var(--color-canvas)]">
          <div className="mx-auto max-w-7xl space-y-5 p-4 sm:p-6">
            <div className="h-32 animate-pulse rounded-2xl bg-[var(--color-surface)]" />
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {[1, 2, 3, 4].map((item) => (
                <div key={item} className="h-28 animate-pulse rounded-2xl bg-[var(--color-surface)]" />
              ))}
            </div>
            <div className="grid gap-5 xl:grid-cols-3">
              <div className="h-96 animate-pulse rounded-2xl bg-[var(--color-surface)] xl:col-span-2" />
              <div className="h-96 animate-pulse rounded-2xl bg-[var(--color-surface)]" />
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Researcher Dashboard">
      <div className="min-h-full bg-[var(--color-canvas)]">
        <div className="mx-auto max-w-7xl space-y-5 p-4 sm:p-6">
          {/* Hero */}
          <section className="relative overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-sm">
            <div className="absolute -right-20 -top-24 h-64 w-64 rounded-full bg-[var(--color-accent)] opacity-[0.06] blur-3xl" />
            <div className="absolute -bottom-24 left-1/3 h-48 w-48 rounded-full bg-emerald-400 opacity-[0.05] blur-3xl" />
            <div className="relative flex flex-col gap-6 p-5 sm:p-7 lg:flex-row lg:items-center lg:justify-between">
              <div className="max-w-2xl">
                <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[var(--color-border)] bg-[var(--color-canvas)] px-3 py-1.5 text-[11px] font-semibold text-[var(--color-accent)]">
                  <Sparkles size={13} />
                  SECURITY RESEARCH CENTER
                </div>
                <h2 className="text-2xl font-bold tracking-tight text-[var(--color-ink)] sm:text-3xl">
                  Welcome back, Researcher
                </h2>
                <p className="mt-2 max-w-xl text-sm leading-6 text-[var(--color-ink-muted)]">
                  Discover programs, report vulnerabilities, and keep every submission organized from one secure workspace.
                </p>
                <div className="mt-5 flex flex-wrap gap-3">
                  <Link
                    to="/researcher/programs"
                    className="inline-flex items-center gap-2 rounded-lg bg-[var(--color-accent)] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[var(--color-accent-hover)]"
                  >
                    <Target size={16} />
                    Explore Programs
                    <ArrowRight size={15} />
                  </Link>
                  <Link
                    to="/my-submissions"
                    className="inline-flex items-center gap-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2.5 text-sm font-semibold text-[var(--color-ink)] transition hover:bg-[var(--color-canvas)]"
                  >
                    <FileSearch size={16} />
                    My Submissions
                  </Link>
                </div>
              </div>
              <div className="grid w-full max-w-md grid-cols-2 gap-3 sm:grid-cols-4 lg:w-auto lg:max-w-none lg:grid-cols-2">
                <MiniMetric label="Programs" value={programs.length} icon={Target} />
                <MiniMetric label="Reports" value={submissions.length} icon={Bug} />
                <MiniMetric label="Accepted" value={accepted} icon={Award} />
                <MiniMetric label="Resolved" value={resolved} icon={CheckCircle2} />
              </div>
            </div>
          </section>

          {error && (
            <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              <ShieldCheck size={17} className="mt-0.5 shrink-0" />
              <div><p className="font-semibold">Dashboard data could not be fully loaded</p><p className="mt-0.5 text-xs">{error}</p></div>
            </div>
          )}

          {/* Statistics */}
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard label="Active Programs" value={programs.length} description="Programs open for research" icon={Target} trend="Explore" />
            <StatCard label="My Submissions" value={submissions.length} description="Vulnerability reports submitted" icon={Bug} trend="View reports" />
            <StatCard label="Pending Review" value={pending} description="Awaiting company review" icon={Clock3} trend="In progress" />
            <StatCard label="Total Bounty" value={formatCurrency(totalBounty)} description={`${accepted} accepted submission${accepted === 1 ? "" : "s"}`} icon={DollarSign} trend="Earnings" />
          </div>

          {/* Main workspace */}
          <div className="grid gap-5 xl:grid-cols-3">
            <section className="overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-sm xl:col-span-2">
              <div className="flex flex-col gap-3 border-b border-[var(--color-border)] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--color-accent-soft)]"><Target size={16} className="text-[var(--color-accent)]" /></div>
                    <h3 className="text-sm font-bold text-[var(--color-ink)]">Available Bug Bounty Programs</h3>
                  </div>
                  <p className="mt-1 pl-10 text-xs text-[var(--color-ink-muted)]">Find programs that match your security expertise.</p>
                </div>
                <Link to="/researcher/programs" className="inline-flex items-center gap-1 self-start rounded-lg px-2 py-1.5 text-xs font-semibold text-[var(--color-accent)] hover:bg-[var(--color-accent-soft)]">View all <ChevronRight size={14} /></Link>
              </div>

              <div className="divide-y divide-[var(--color-border)]">
                {programs.length === 0 ? (
                  <EmptyState icon={Target} title="No active programs" description="New bug bounty programs will appear here." action="Browse Programs" href="/researcher/programs" />
                ) : (
                  programs.slice(0, 5).map((program) => (
                    <div key={program.id} className="group flex flex-col gap-4 px-5 py-4 transition hover:bg-[var(--color-canvas)] sm:flex-row sm:items-center sm:justify-between">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start gap-3">
                          <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[var(--color-border)] bg-[var(--color-canvas)]"><Bug size={17} className="text-[var(--color-accent)]" /></div>
                          <div className="min-w-0">
                            <h4 className="truncate text-sm font-semibold text-[var(--color-ink)]">{program.program_name}</h4>
                            <p className="mt-1 line-clamp-2 text-xs leading-5 text-[var(--color-ink-muted)]">{program.description || "Security research program."}</p>
                            <div className="mt-2 flex flex-wrap gap-2">
                              <span className="rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-semibold capitalize text-emerald-700">{program.status}</span>
                              {program.reward_max != null && <span className="rounded-full bg-[var(--color-canvas)] px-2 py-1 text-[10px] font-semibold text-[var(--color-ink-muted)]">Up to {formatCurrency(Number(program.reward_max))}</span>}
                            </div>
                          </div>
                        </div>
                      </div>
                      <Link to={`/researcher/programs/${program.id}`} className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-lg border border-[var(--color-border)] px-3 py-2 text-xs font-semibold text-[var(--color-ink)] transition group-hover:border-[var(--color-accent)] group-hover:text-[var(--color-accent)]">View Program <ArrowRight size={13} /></Link>
                    </div>
                  ))
                )}
              </div>
            </section>

            <section className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-sm">
              <div className="border-b border-[var(--color-border)] px-5 py-4">
                <div className="flex items-center gap-2"><Activity size={17} className="text-[var(--color-accent)]" /><h3 className="text-sm font-bold text-[var(--color-ink)]">Research Activity</h3></div>
                <p className="mt-1 text-xs text-[var(--color-ink-muted)]">Your current submission pipeline.</p>
              </div>
              <div className="space-y-3 p-5">
                <ActivityRow icon={Activity} label="Total submissions" value={submissions.length} />
                <ActivityRow icon={Clock3} label="Pending review" value={pending} />
                <ActivityRow icon={CheckCircle2} label="Accepted" value={accepted} />
                <ActivityRow icon={ShieldCheck} label="Resolved" value={resolved} />
                <div className="mt-4 rounded-xl bg-[var(--color-accent-soft)] p-4">
                  <div className="flex items-center justify-between"><span className="text-xs font-semibold text-[var(--color-ink-muted)]">Total bounty</span><TrendingUp size={15} className="text-[var(--color-accent)]" /></div>
                  <p className="mt-1 text-xl font-bold text-[var(--color-ink)]">{formatCurrency(totalBounty)}</p>
                </div>
                <Link to="/my-submissions" className="flex w-full items-center justify-center gap-2 rounded-lg border border-[var(--color-border)] px-3 py-2.5 text-xs font-semibold text-[var(--color-ink)] transition hover:bg-[var(--color-canvas)]">View My Submissions <ArrowRight size={13} /></Link>
              </div>
            </section>
          </div>

          {/* Recent submissions */}
          <section className="overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-sm">
            <div className="flex flex-col gap-3 border-b border-[var(--color-border)] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
              <div><div className="flex items-center gap-2"><FileSearch size={17} className="text-[var(--color-accent)]" /><h3 className="text-sm font-bold text-[var(--color-ink)]">Recent Submissions</h3></div><p className="mt-1 text-xs text-[var(--color-ink-muted)]">Track the latest vulnerability reports and review status.</p></div>
              <Link to="/my-submissions" className="inline-flex items-center gap-1 self-start rounded-lg px-2 py-1.5 text-xs font-semibold text-[var(--color-accent)] hover:bg-[var(--color-accent-soft)]">View all <ChevronRight size={14} /></Link>
            </div>
            {submissions.length === 0 ? (
              <EmptyState icon={Bug} title="No submissions yet" description="Start by exploring an active bug bounty program." action="Browse Programs" href="/researcher/programs" />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[720px] text-sm">
                  <thead><tr className="bg-[var(--color-canvas)]">
                    {['Vulnerability','Severity','Status','Bounty','Action'].map((heading, index) => <th key={heading} className={`px-5 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-[var(--color-ink-muted)] ${index === 4 ? 'text-right' : ''}`}>{heading}</th>)}
                  </tr></thead>
                  <tbody className="divide-y divide-[var(--color-border)]">
                    {submissions.slice(0, 5).map((submission) => (
                      <tr key={submission.id} className="transition hover:bg-[var(--color-canvas)]">
                        <td className="px-5 py-4"><p className="max-w-xs truncate font-semibold text-[var(--color-ink)]">{submission.title}</p><p className="mt-1 text-[10px] text-[var(--color-ink-muted)]">Report #{submission.id}</p></td>
                        <td className="px-5 py-4">{submission.severity ? <span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold capitalize ${getSeverityClass(submission.severity)}`}>{submission.severity}</span> : <span className="text-xs text-[var(--color-ink-faint)]">Not assigned</span>}</td>
                        <td className="px-5 py-4"><span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold capitalize ${statusClass(submission.status)}`}>{submission.status}</span></td>
                        <td className="px-5 py-4 text-xs font-semibold text-[var(--color-ink)]">{submission.bounty_amount != null ? formatCurrency(Number(submission.bounty_amount)) : '-'}</td>
                        <td className="px-5 py-4 text-right"><Link to={`/reports/${submission.id}`} className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-[var(--color-accent)] hover:bg-[var(--color-accent-soft)]">View <ArrowRight size={12} /></Link></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>
      </div>
    </AppLayout>
  );
}

function MiniMetric({ label, value, icon: Icon }: { label: string; value: number; icon: React.ComponentType<{ size?: number; className?: string }> }) {
  return <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-canvas)] p-3"><Icon size={15} className="text-[var(--color-accent)]" /><p className="mt-2 text-lg font-bold text-[var(--color-ink)]">{value}</p><p className="text-[10px] text-[var(--color-ink-muted)]">{label}</p></div>;
}

function EmptyState({ icon: Icon, title, description, action, href }: { icon: React.ComponentType<{ size?: number; className?: string }>; title: string; description: string; action: string; href: string }) {
  return <div className="px-5 py-12 text-center"><div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--color-canvas)]"><Icon size={21} className="text-[var(--color-ink-faint)]" /></div><p className="mt-3 text-sm font-semibold text-[var(--color-ink)]">{title}</p><p className="mt-1 text-xs text-[var(--color-ink-muted)]">{description}</p><Link to={href} className="mt-4 inline-flex items-center gap-2 rounded-lg bg-[var(--color-accent)] px-4 py-2 text-xs font-semibold text-white">{action}<ArrowRight size={13} /></Link></div>;
}


/* =========================================================
   STAT CARD
========================================================= */

interface StatCardProps {
  label: string;
  value: string | number;
  description: string;
  trend?: string;
  icon: React.ComponentType<{
    size?: number;
    className?: string;
  }>;
}

function StatCard({
  label,
  value,
  description,
  trend,
  icon: Icon,
}: StatCardProps) {
  return (
    <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-[var(--color-ink-muted)]">
            {label}
          </p>

          <p className="mt-2 text-2xl font-bold tracking-tight text-[var(--color-ink)]">
            {value}
          </p>
        </div>

        <div className="flex h-9 w-9 items-center justify-center rounded-md bg-[var(--color-accent-soft)]">
          <Icon
            size={17}
            className="text-[var(--color-accent)]"
          />
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between gap-2">
        <p className="text-[10px] leading-4 text-[var(--color-ink-muted)]">{description}</p>
        {trend && <span className="shrink-0 text-[10px] font-semibold text-[var(--color-accent)]">{trend}</span>}
      </div>
    </div>
  );
}

/* =========================================================
   ACTIVITY ROW
========================================================= */

interface ActivityRowProps {
  icon: React.ComponentType<{
    size?: number;
    className?: string;
  }>;
  label: string;
  value: number;
}

function ActivityRow({
  icon: Icon,
  label,
  value,
}: ActivityRowProps) {
  return (
    <div className="flex items-center justify-between rounded-md border border-[var(--color-border)] p-3">
      <div className="flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-[var(--color-canvas)]">
          <Icon
            size={15}
            className="text-[var(--color-ink-muted)]"
          />
        </div>

        <span className="text-xs text-[var(--color-ink-muted)]">
          {label}
        </span>
      </div>

      <span className="text-sm font-semibold text-[var(--color-ink)]">
        {value}
      </span>
    </div>
  );
}