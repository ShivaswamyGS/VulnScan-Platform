from datetime import datetime, timezone

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.services.admin_service import get_all_programs
from app.api.deps import require_admin
from app.core.exceptions import ConflictError, NotFoundError
from app.db.session import get_db
from app.models.audit_log import AuditLog
from app.models.company import Company
from app.models.enums import AuditActionEnum
from app.models.user import User
from app.services.audit_log_service import create_audit_log

from app.services.admin_service import (
    get_all_programs,
    get_program_by_id,
    get_all_submissions,
    get_submission_by_id,
)
router = APIRouter()

# =========================================================
# ADMIN — LIST ALL BUG BOUNTY PROGRAMS
# =========================================================

@router.get("/programs")
def get_admin_programs(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    """
    Return all Bug Bounty Programs across all companies.

    Only administrators can access this endpoint.
    """

    programs = get_all_programs(db)

    return [
        {
            "id": program.id,
            "company_id": program.company_id,
            "program_name": program.program_name,
            "description": program.description,
            "target_website": program.target_website,
            "scope": program.scope,
            "out_of_scope": program.out_of_scope,
            "reward_min": program.reward_min,
            "reward_max": program.reward_max,
            "severity_reward_matrix": program.severity_reward_matrix,
            "program_rules": program.program_rules,
            "submission_guidelines": program.submission_guidelines,
            "start_date": program.start_date,
            "end_date": program.end_date,
            "status": program.status,
            "visibility": program.visibility,
            "attachments": program.attachments,
            "is_active": program.is_active,
            "created_at": program.created_at,
            "updated_at": program.updated_at,
        }
        for program in programs
    ]
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
    
    
    # =========================================================
