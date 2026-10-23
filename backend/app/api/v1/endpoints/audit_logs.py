"""
Audit log endpoints.

Administrators can view the security audit trail.

GET /audit-logs
"""

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.api.deps import require_admin
from app.db.session import get_db
from app.models.enums import AuditActionEnum
from app.models.user import User
from app.services.audit_log_service import list_audit_logs


router = APIRouter()


@router.get("")
def get_audit_logs(
    user_id: int | None = Query(None),
    action: AuditActionEnum | None = Query(None),
    entity_type: str | None = Query(None),
    entity_id: int | None = Query(None),
    limit: int = Query(
        100,
        ge=1,
        le=500,
    ),
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    """
    Return audit logs.

    Only administrators can access the audit trail.

    Optional filters:
    - user_id
    - action
    - entity_type
    - entity_id
    - limit
    """

    logs = list_audit_logs(
        db,
        user_id=user_id,
        action=action,
        entity_type=entity_type,
        entity_id=entity_id,
        limit=limit,
    )

    return [
        {
            "id": log.id,
            "user_id": log.user_id,
            "action": log.action.value,
            "entity_type": log.entity_type,
            "entity_id": log.entity_id,
            "details": log.details,
            "ip_address": log.ip_address,
            "created_at": log.created_at,
        }
        for log in logs
    ]