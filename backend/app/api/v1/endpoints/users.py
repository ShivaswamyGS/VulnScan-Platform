"""
Admin User Management endpoints.

Administrators can:
- View all users
- Filter users by role
- View a specific user
- Activate/deactivate users
- Change user roles

All actions are admin-only and important changes are recorded
in the audit log.
"""

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.api.deps import require_admin
from app.core.exceptions import ConflictError, NotFoundError
from app.db.session import get_db
from app.models.enums import AuditActionEnum, RoleEnum
from app.models.user import User
from app.services.audit_log_service import create_audit_log


router = APIRouter()


# =========================================================
# LIST USERS
# =========================================================

@router.get("")
def list_users(
    role: RoleEnum | None = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    """
    Return all users.

    Optional filter:
    - role
    """

    query = db.query(User)

    if role is not None:
        query = query.filter(User.role == role)

    users = query.order_by(User.created_at.desc()).all()

    return [
        {
            "id": user.id,
            "full_name": user.full_name,
            "email": user.email,
            "role": user.role.value,
            "company_id": user.company_id,
            "department": user.department,
            "designation": user.designation,
            "employee_id": user.employee_id,
            "is_active": user.is_active,
            "created_at": user.created_at,
            "updated_at": user.updated_at,
        }
        for user in users
    ]


# =========================================================
# GET USER
# =========================================================

@router.get("/{user_id}")
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
        "role": user.role.value,
        "company_id": user.company_id,
        "department": user.department,
        "designation": user.designation,
        "employee_id": user.employee_id,
        "is_active": user.is_active,
        "created_at": user.created_at,
        "updated_at": user.updated_at,
    }


# =========================================================
# ACTIVATE USER
# =========================================================

@router.post("/{user_id}/activate")
def activate_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    """
    Activate a user account.
    """

    user = (
        db.query(User)
        .filter(User.id == user_id)
        .first()
    )

    if user is None:
        raise NotFoundError("User not found")

    if user.is_active:
        raise ConflictError("User is already active")

    user.is_active = True

    create_audit_log(
        db,
        user_id=current_user.id,
        action=AuditActionEnum.STATUS_CHANGE,
        entity_type="user",
        entity_id=user.id,
        details={
            "action": "user_activation",
            "user_email": user.email,
            "new_status": "active",
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
# DEACTIVATE USER
# =========================================================

@router.post("/{user_id}/deactivate")
def deactivate_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    """
    Deactivate a user account.
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
            "Administrator cannot deactivate their own account"
        )

    if not user.is_active:
        raise ConflictError("User is already inactive")

    user.is_active = False

    create_audit_log(
        db,
        user_id=current_user.id,
        action=AuditActionEnum.STATUS_CHANGE,
        entity_type="user",
        entity_id=user.id,
        details={
            "action": "user_deactivation",
            "user_email": user.email,
            "new_status": "inactive",
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
# CHANGE USER ROLE
# =========================================================

@router.post("/{user_id}/role")
def change_user_role(
    user_id: int,
    role: RoleEnum,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    """
    Change the role of a user.
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
            "Administrator cannot change their own role"
        )

    old_role = user.role

    if old_role == role:
        raise ConflictError(
            f"User already has role '{role.value}'"
        )

    user.role = role

    create_audit_log(
        db,
        user_id=current_user.id,
        action=AuditActionEnum.STATUS_CHANGE,
        entity_type="user",
        entity_id=user.id,
        details={
            "action": "user_role_change",
            "user_email": user.email,
            "old_role": old_role.value,
            "new_role": role.value,
        },
    )

    db.commit()
    db.refresh(user)

    return {
        "message": "User role updated successfully",
        "user_id": user.id,
        "role": user.role.value,
    }