"""
Notification endpoints.

Authenticated users can:

- View their notifications
- View one notification
- Mark one notification as read
- Mark all notifications as read
- Delete their own notification

Users can never access another user's notifications.
"""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models.user import User
from app.schemas.notification import NotificationRead
from app.services.notification_service import (
    delete_notification,
    get_notification_by_id,
    get_user_notifications,
    mark_all_notifications_as_read,
    mark_notification_as_read,
)

router = APIRouter()


# =========================================================
# LIST MY NOTIFICATIONS
# =========================================================

@router.get(
    "/",
    response_model=list[NotificationRead],
)
def get_my_notifications(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Return notifications belonging to the
    authenticated user.
    """

    return get_user_notifications(
        db,
        current_user,
    )


# =========================================================
# GET ONE NOTIFICATION
# =========================================================

@router.get(
    "/{notification_id}",
    response_model=NotificationRead,
)
def get_my_notification(
    notification_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Return one notification belonging to
    the authenticated user.
    """

    return get_notification_by_id(
        db,
        current_user,
        notification_id,
    )


# =========================================================
# MARK ONE AS READ
# =========================================================

@router.post(
    "/{notification_id}/read",
    response_model=NotificationRead,
)
def mark_as_read(
    notification_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Mark one notification as read.
    """

    notification = get_notification_by_id(
        db,
        current_user,
        notification_id,
    )

    return mark_notification_as_read(
        db,
        notification,
    )


# =========================================================
# MARK ALL AS READ
# =========================================================

@router.post(
    "/read-all",
)
def mark_all_as_read(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Mark all notifications belonging to the
    authenticated user as read.
    """

    count = mark_all_notifications_as_read(
        db,
        current_user,
    )

    return {
        "message": "All notifications marked as read",
        "updated_count": count,
    }


# =========================================================
# DELETE NOTIFICATION
# =========================================================

@router.delete(
    "/{notification_id}",
)
def remove_notification(
    notification_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Delete a notification belonging to
    the authenticated user.
    """

    notification = get_notification_by_id(
        db,
        current_user,
        notification_id,
    )

    delete_notification(
        db,
        notification,
    )

    return {
        "message": "Notification deleted successfully"
    }