"""
Dashboard endpoint — admin-only aggregate statistics.
"""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import require_admin
from app.db.session import get_db
from app.models.user import User
from app.schemas.dashboard import DashboardStats
from app.services.dashboard_service import get_dashboard_stats

router = APIRouter()


@router.get("/stats", response_model=DashboardStats)
def read_dashboard_stats(db: Session = Depends(get_db), _admin: User = Depends(require_admin)) -> DashboardStats:
    return get_dashboard_stats(db)
