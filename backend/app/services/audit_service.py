"""
Audit logging service.

Provides a single reusable function for recording security-relevant
actions performed by users in the system.

Examples:
- Login
- Failed login
- Report creation
- Report status change
- Report priority change
- User creation/update/delete
"""

from __future__ import annotations

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

    The record is added and flushed but not committed.
    The calling service/endpoint remains responsible for committing
    the surrounding transaction.
    """

    audit_log = AuditLog(
        user_id=user_id,
        action=action,
        entity_type=entity_type,
        entity_id=entity_id,
        details=(
            json.dumps(details)
            if details is not None
            else None
        ),
        ip_address=ip_address,
    )

    db.add(audit_log)
    db.flush()

    return audit_log