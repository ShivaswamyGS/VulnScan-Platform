from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field

from app.schemas.prediction import PredictionRead
from app.schemas.status import StatusRead
from app.schemas.user import UserRead


class ReportBase(BaseModel):
    title: str = Field(..., min_length=5, max_length=200)
    description: str = Field(..., min_length=10)
    affected_module: str = Field(..., min_length=2, max_length=150)
    category: str = Field(..., min_length=2, max_length=100)
    steps_to_reproduce: str = Field(..., min_length=5)
    expected_result: str = Field(..., min_length=1)
    actual_result: str = Field(..., min_length=1)


class ReportCreate(ReportBase):
    """Fields an Internal Tester submits. reporter_id comes from the auth token,
    status_id defaults to the "Open" status server-side — neither is client input."""

    pass


class ReportUpdateAdmin(BaseModel):
    """Fields only an Administrator may change."""

    status_id: int | None = None
    priority: int | None = Field(None, ge=1, le=5)


class ReportRead(ReportBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    priority: int | None
    attachment_path: str | None
    submission_date: datetime
    updated_at: datetime
    reporter: UserRead
    status: StatusRead
    predictions: list[PredictionRead] = []


class ReportListItem(BaseModel):
    """Lighter-weight shape for list/table views (dashboard, report lists)."""

    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str
    category: str
    priority: int | None
    submission_date: datetime
    status: StatusRead
    latest_prediction: PredictionRead | None = None
    
class ReporterRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    full_name: str
    email: str
    role: str
    department: str | None = None
    designation: str | None = None
    employee_id: str | None = None
    is_active: bool
