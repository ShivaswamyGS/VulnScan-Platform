"""
Schemas for in-app notifications.
"""

from datetime import datetime

from pydantic import BaseModel, ConfigDict


# =========================================================
# NOTIFICATION READ
# =========================================================

class NotificationRead(BaseModel):
    model_config = ConfigDict(
        from_attributes=True,
    )

    id: int
    user_id: int

    title: str
    message: str

    notification_type: str

    entity_type: str | None
    entity_id: int | None

    is_read: bool

    created_at: datetime