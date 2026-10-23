"""
Audit log service.

Provides reusable functions for creating and retrieving
append-only audit records for security-relevant actions.
"""

import json

from sqlalchemy.orm import Session

from app.models.audit_log import AuditLog
from app.models.enums import AuditActionEnum


def create_audit_log(
    db: Session,
    *,
    user_id: int | None,
    action: AuditActionEnum,
    entity_type: str,
    entity_id: int | None = None,
    details: dict | None = None,
    ip_address: str | None = None,
) -> AuditLog:
    """
    Create an audit log entry.

    Parameters:
        user_id:
            ID of the user who performed the action.
            Can be None when the user is unknown.

        action:
            AuditActionEnum value.

        entity_type:
            Type of entity affected, for example
            "report", "company", or "user".

        entity_id:
            ID of the affected entity.

        details:
            Optional dictionary containing additional
            information such as before/after values.

        ip_address:
            Optional client IP address.
    """

    serialized_details = (
        json.dumps(details, default=str)
        if details is not None
        else None
    )

    audit_log = AuditLog(
        user_id=user_id,
        action=action,
        entity_type=entity_type,
        entity_id=entity_id,
        details=serialized_details,
        ip_address=ip_address,
    )

    db.add(audit_log)
    db.flush()

    return audit_log


def list_audit_logs(
    db: Session,
    *,
    user_id: int | None = None,
    action: AuditActionEnum | None = None,
    entity_type: str | None = None,
    entity_id: int | None = None,
    limit: int = 100,
) -> list[AuditLog]:
    """
    Return audit logs with optional filters.

    Only the filters supplied by the caller are applied.
    Newest audit records are returned first.
    """

    query = db.query(AuditLog)

    if user_id is not None:
        query = query.filter(
            AuditLog.user_id == user_id
        )

    if action is not None:
        query = query.filter(
            AuditLog.action == action
        )

    if entity_type is not None:
        query = query.filter(
            AuditLog.entity_type == entity_type
        )

    if entity_id is not None:
        query = query.filter(
            AuditLog.entity_id == entity_id
        )

    return (
        query
        .order_by(AuditLog.created_at.desc())
        .limit(limit)
        .all()
    )