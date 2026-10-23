"""
Schemas for AI model training history.
"""

from datetime import datetime

from pydantic import BaseModel, ConfigDict


class TrainingHistoryRead(BaseModel):
    model_config = ConfigDict(
        from_attributes=True,
    )

    id: int
    dataset_id: int
    model_version: str
    status: str
    record_count: int

    accuracy: float | None
    precision: float | None
    recall: float | None
    f1_score: float | None

    model_path: str | None
    error_message: str | None

    started_at: datetime | None
    completed_at: datetime | None
    created_at: datetime