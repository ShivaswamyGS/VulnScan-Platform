"""
Schemas for AI training dataset management.
"""

from datetime import datetime

from pydantic import BaseModel, ConfigDict


class DatasetRead(BaseModel):
    model_config = ConfigDict(
        from_attributes=True,
    )

    id: int
    name: str
    file_path: str
    dataset_type: str
    record_count: int
    validation_status: str
    validation_message: str | None
    is_active: bool
    uploaded_at: datetime
    updated_at: datetime