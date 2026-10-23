"""
AI model training endpoints.

Administrators can:
- Trigger model training
- View training history
- View a specific training run
"""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import require_admin
from app.core.exceptions import NotFoundError
from app.db.session import get_db
from app.models.training_history import TrainingHistory
from app.models.user import User
from app.schemas.training_history import TrainingHistoryRead
from app.services.training_service import train_severity_model

router = APIRouter()


# =========================================================
# START TRAINING
# =========================================================

@router.post(
    "/train",
    response_model=TrainingHistoryRead,
)
def train_model(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    """
    Start training using the active NVD dataset.
    """

    return train_severity_model(db)


# =========================================================
# TRAINING HISTORY
# =========================================================

@router.get(
    "/history",
    response_model=list[TrainingHistoryRead],
)
def get_training_history(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    """
    Return all model-training runs.
    """

    return (
        db.query(TrainingHistory)
        .order_by(
            TrainingHistory.created_at.desc()
        )
        .all()
    )


# =========================================================
# GET TRAINING RUN
# =========================================================

@router.get(
    "/history/{training_id}",
    response_model=TrainingHistoryRead,
)
def get_training_run(
    training_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    """
    Return one training run by ID.
    """

    history = (
        db.query(TrainingHistory)
        .filter(
            TrainingHistory.id == training_id
        )
        .first()
    )

    if history is None:
        raise NotFoundError(
            "Training history not found"
        )

    return history