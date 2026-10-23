from datetime import datetime

from pydantic import BaseModel, ConfigDict

from app.schemas.prediction import PredictionRead
from app.schemas.report import ReporterRead
from app.schemas.status import StatusRead


class CompanyReportUpdate(BaseModel):
    status_id: int | None = None

    priority: int | None = None


class CompanyReportRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str
    description: str
    affected_module: str
    category: str
    steps_to_reproduce: str
    expected_result: str
    actual_result: str
    priority: int | None
    attachment_path: str | None
    submission_date: datetime

    reporter: ReporterRead
    status: StatusRead
    predictions: list[PredictionRead] = []