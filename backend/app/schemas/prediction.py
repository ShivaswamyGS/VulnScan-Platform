from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field

from app.models.enums import SeverityEnum


class PredictionBase(BaseModel):
    predicted_severity: SeverityEnum
    confidence_score: float = Field(..., ge=0.0, le=1.0)
    explanation: str | None = None
    model_version: str


class PredictionCreate(PredictionBase):
    report_id: int


class PredictionRead(PredictionBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    report_id: int
    created_at: datetime
