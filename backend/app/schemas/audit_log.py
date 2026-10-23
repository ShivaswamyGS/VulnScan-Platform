from datetime import datetime

from pydantic import BaseModel, ConfigDict

from app.models.enums import AuditActionEnum


class AuditLogRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int | None
    action: AuditActionEnum
    entity_type: str
    entity_id: int | None
    details: str | None
    ip_address: str | None
    created_at: datetime
