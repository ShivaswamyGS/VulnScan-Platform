from datetime import datetime, timezone

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import require_admin
from app.core.exceptions import ConflictError, NotFoundError
from app.db.session import get_db
from app.models.company import Company
from app.models.enums import AuditActionEnum
from app.models.user import User
from app.services.audit_log_service import create_audit_log

router = APIRouter()


# =========================================================
# LIST COMPANIES
# =========================================================

@router.get("")
def list_companies(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    """
    Admin-only list of all companies.
    """

    companies = (
        db.query(Company)
        .order_by(Company.created_at.desc())
        .all()
    )

    return companies


# =========================================================
# LIST PENDING COMPANIES
# =========================================================

@router.get("/pending")
def list_pending_companies(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    """
    Return companies waiting for administrator approval.
    """

    return (
        db.query(Company)
        .filter(
            Company.approval_status == "pending"
        )
        .order_by(
            Company.created_at.asc()
        )
        .all()
    )


# =========================================================
# GET COMPANY
# =========================================================

@router.get("/{company_id}")
def get_company(
    company_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    """
    Return one company.
    """

    company = (
        db.query(Company)
        .filter(
            Company.id == company_id
        )
        .first()
    )

    if company is None:
        raise NotFoundError(
            "Company not found"
        )

    return company


# =========================================================
# APPROVE COMPANY
# =========================================================

@router.post("/{company_id}/approve")
def approve_company(
    company_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    """
    Approve a pending company.
    """

    company = (
        db.query(Company)
        .filter(
            Company.id == company_id
        )
        .first()
    )

    if company is None:
        raise NotFoundError(
            "Company not found"
        )

    if company.approval_status == "approved":
        raise ConflictError(
            "Company is already approved"
        )

    company.approval_status = "approved"
    company.approval_reason = None
    company.approved_at = datetime.now(
        timezone.utc
    )

    company.is_active = True

    create_audit_log(
        db,
        user_id=current_user.id,
        action=AuditActionEnum.STATUS_CHANGE,
        entity_type="company",
        entity_id=company.id,
        details={
            "action": "company_approval",
            "company_name": company.company_name,
            "new_status": "approved",
        },
    )

    db.commit()
    db.refresh(company)

    return {
        "message": "Company approved successfully",
        "company_id": company.id,
        "approval_status": company.approval_status,
        "is_active": company.is_active,
    }


# =========================================================
# REJECT COMPANY
# =========================================================

@router.post("/{company_id}/reject")
def reject_company(
    company_id: int,
    reason: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    """
    Reject a company registration.
    """

    company = (
        db.query(Company)
        .filter(
            Company.id == company_id
        )
        .first()
    )

    if company is None:
        raise NotFoundError(
            "Company not found"
        )

    if company.approval_status == "approved":
        raise ConflictError(
            "An approved company cannot be rejected"
        )

    if not reason.strip():
        raise ConflictError(
            "Rejection reason is required"
        )

    company.approval_status = "rejected"
    company.approval_reason = reason
    company.approved_at = None
    company.is_active = False

    create_audit_log(
        db,
        user_id=current_user.id,
        action=AuditActionEnum.STATUS_CHANGE,
        entity_type="company",
        entity_id=company.id,
        details={
            "action": "company_rejection",
            "company_name": company.company_name,
            "new_status": "rejected",
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
        "is_active": company.is_active,
    }


# =========================================================
# DEACTIVATE COMPANY
# =========================================================

@router.post("/{company_id}/deactivate")
def deactivate_company(
    company_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    """
    Deactivate an approved company account.
    """

    company = (
        db.query(Company)
        .filter(
            Company.id == company_id
        )
        .first()
    )

    if company is None:
        raise NotFoundError(
            "Company not found"
        )

    if not company.is_active:
        raise ConflictError(
            "Company is already inactive"
        )

    company.is_active = False

    create_audit_log(
        db,
        user_id=current_user.id,
        action=AuditActionEnum.STATUS_CHANGE,
        entity_type="company",
        entity_id=company.id,
        details={
            "action": "company_deactivation",
            "company_name": company.company_name,
            "new_status": "inactive",
        },
    )

    db.commit()
    db.refresh(company)

    return {
        "message": "Company deactivated successfully",
        "company_id": company.id,
        "is_active": company.is_active,
    }


# =========================================================
# ACTIVATE COMPANY
# =========================================================

@router.post("/{company_id}/activate")
def activate_company(
    company_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    """
    Activate an approved company account.
    """

    company = (
        db.query(Company)
        .filter(
            Company.id == company_id
        )
        .first()
    )

    if company is None:
        raise NotFoundError(
            "Company not found"
        )

    if company.approval_status != "approved":
        raise ConflictError(
            "Only approved companies can be activated"
        )

    if company.is_active:
        raise ConflictError(
            "Company is already active"
        )

    company.is_active = True

    create_audit_log(
        db,
        user_id=current_user.id,
        action=AuditActionEnum.STATUS_CHANGE,
        entity_type="company",
        entity_id=company.id,
        details={
            "action": "company_activation",
            "company_name": company.company_name,
            "new_status": "active",
        },
    )

    db.commit()
    db.refresh(company)

    return {
        "message": "Company activated successfully",
        "company_id": company.id,
        "is_active": company.is_active,
    }