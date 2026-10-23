from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.status import Status
from app.schemas.status import StatusRead


router = APIRouter()


@router.get(
    "/",
    response_model=list[StatusRead],
)
def get_statuses(
    db: Session = Depends(get_db),
):
    return (
        db.query(Status)
        .order_by(Status.sort_order.asc())
        .all()
    )