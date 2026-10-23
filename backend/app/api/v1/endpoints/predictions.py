"""
Prediction endpoints.

Predictions are created automatically on report submission (see
app/api/v1/endpoints/reports.py), so this module only covers:
- viewing the full prediction history for a report
- an admin-triggered re-run (e.g. after a model retrain)
"""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, require_admin
from app.core.exceptions import ForbiddenError
from app.db.session import get_db
from app.models.enums import RoleEnum
from app.models.user import User
from app.schemas.prediction import PredictionRead
from app.services.prediction_service import run_prediction_for_report
from app.services.report_service import get_report_by_id

router = APIRouter()


@router.get("/{report_id}/history", response_model=list[PredictionRead])
def get_prediction_history(
    report_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)
) -> list[PredictionRead]:
    report = get_report_by_id(db, report_id)

    if current_user.role != RoleEnum.ADMIN and report.reporter_id != current_user.id:
        raise ForbiddenError("You do not have permission to view predictions for this report")

    return report.predictions


@router.post("/{report_id}/rerun", response_model=PredictionRead)
def rerun_prediction(report_id: int, db: Session = Depends(get_db), _admin: User = Depends(require_admin)) -> PredictionRead:
    """Admin-only: re-run inference on a report (e.g. after retraining the model)."""
    report = get_report_by_id(db, report_id)
    return run_prediction_for_report(db, report)
