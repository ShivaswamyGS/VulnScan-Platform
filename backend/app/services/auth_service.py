"""
Authentication service.

Holds the actual login business logic so the endpoint (app/api/v1/endpoints/auth.py)
stays a thin HTTP wrapper. This is where account-lockout and audit-logging
policy lives, so it applies no matter which route calls it.
"""

import logging
from datetime import datetime, timedelta, timezone

from sqlalchemy.orm import Session

from app.core.exceptions import UnauthorizedError
from app.core.security import create_access_token, create_refresh_token, verify_password
from app.models.audit_log import AuditLog
from app.models.enums import AuditActionEnum
from app.models.user import User
from app.schemas.token import Token
from app.services.user_service import get_user_by_email

logger = logging.getLogger(__name__)

# --- Brute-force protection policy ---
MAX_FAILED_ATTEMPTS = 5
LOCKOUT_WINDOW_MINUTES = 15


def _recent_failed_attempts(db: Session, email: str) -> int:
    window_start = datetime.now(timezone.utc) - timedelta(minutes=LOCKOUT_WINDOW_MINUTES)
    return (
        db.query(AuditLog)
        .filter(
            AuditLog.action == AuditActionEnum.LOGIN_FAILED,
            AuditLog.entity_type == "user_email",
            AuditLog.details == email.lower(),
            AuditLog.created_at >= window_start,
        )
        .count()
    )


def _log_audit(db: Session, *, user_id: int | None, action: AuditActionEnum, entity_id: int | None,
                details: str, ip_address: str | None) -> None:
    db.add(
        AuditLog(
            user_id=user_id,
            action=action,
            entity_type="user_email" if action in (AuditActionEnum.LOGIN, AuditActionEnum.LOGIN_FAILED) else "user",
            entity_id=entity_id,
            details=details,
            ip_address=ip_address,
        )
    )
    db.commit()


def authenticate_and_issue_tokens(db: Session, *, email: str, password: str, ip_address: str | None) -> Token:
    """
    Verify credentials, enforce lockout policy, log the outcome, and return
    a fresh access + refresh token pair on success.

    Raises UnauthorizedError (401) for: unknown email, wrong password,
    inactive account, or an active lockout — deliberately using the SAME
    error message/status for all of these so the API never reveals which
    part of the login was wrong (avoids user enumeration).
    """
    generic_error = "Incorrect email or password, or account temporarily locked"

    if _recent_failed_attempts(db, email) >= MAX_FAILED_ATTEMPTS:
        logger.warning("Login blocked by lockout policy for %s", email)
        _log_audit(db, user_id=None, action=AuditActionEnum.LOGIN_FAILED, entity_id=None,
                   details=email.lower(), ip_address=ip_address)
        raise UnauthorizedError(generic_error)

    user = get_user_by_email(db, email)

    if user is None or not verify_password(password, user.hashed_password) or not user.is_active:
        _log_audit(db, user_id=user.id if user else None, action=AuditActionEnum.LOGIN_FAILED,
                   entity_id=user.id if user else None, details=email.lower(), ip_address=ip_address)
        raise UnauthorizedError(generic_error)

    _log_audit(db, user_id=user.id, action=AuditActionEnum.LOGIN, entity_id=user.id,
               details=email.lower(), ip_address=ip_address)

    return Token(
        access_token=create_access_token(subject=str(user.id), role=user.role.value),
        refresh_token=create_refresh_token(subject=str(user.id)),
    )
