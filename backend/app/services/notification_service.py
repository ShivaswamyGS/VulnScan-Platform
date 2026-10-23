"""
Notification service.

Handles creation and retrieval of in-app notifications.

Notifications belong to internal users and are used for:
- Bug bounty submission updates
- AI prediction events
- Administrative actions
- General system notifications
"""

from sqlalchemy.orm import Session

from app.core.exceptions import NotFoundError
from app.models.notification import Notification
from app.models.user import User


# =========================================================
# CREATE NOTIFICATION
# =========================================================

def create_notification(
    db: Session,
    *,
    user_id: int,
    title: str,
    message: str,
    notification_type: str = "general",
    entity_type: str | None = None,
    entity_id: int | None = None,
) -> Notification:
    """
    Create an in-app notification for a user.
    """

    notification = Notification(
        user_id=user_id,
        title=title,
        message=message,
        notification_type=notification_type,
        entity_type=entity_type,
        entity_id=entity_id,
        is_read=False,
    )

    db.add(notification)
    db.commit()
    db.refresh(notification)

    return notification


# =========================================================
# GET USER NOTIFICATIONS
# =========================================================

def get_user_notifications(
    db: Session,
    user: User,
) -> list[Notification]:
    """
    Return notifications belonging only to the
    authenticated user.
    """

    return (
        db.query(Notification)
        .filter(
            Notification.user_id == user.id
        )
        .order_by(
            Notification.created_at.desc()
        )
        .all()
    )


# =========================================================
# GET SINGLE NOTIFICATION
# =========================================================

def get_notification_by_id(
    db: Session,
    user: User,
    notification_id: int,
) -> Notification:
    """
    Return a notification only if it belongs
    to the authenticated user.
    """

    notification = (
        db.query(Notification)
        .filter(
            Notification.id == notification_id,
            Notification.user_id == user.id,
        )
        .first()
    )

    if notification is None:
        raise NotFoundError(
            "Notification not found"
        )

    return notification


# =========================================================
# MARK AS READ
# =========================================================

def mark_notification_as_read(
    db: Session,
    notification: Notification,
) -> Notification:
    """
    Mark one notification as read.
    """

    notification.is_read = True

    db.commit()
    db.refresh(notification)

    return notification


# =========================================================
# MARK ALL AS READ
# =========================================================

def mark_all_notifications_as_read(
    db: Session,
    user: User,
) -> int:
    """
    Mark all notifications belonging to the
    authenticated user as read.

    Returns the number of notifications updated.
    """

    updated_count = (
        db.query(Notification)
        .filter(
            Notification.user_id == user.id,
            Notification.is_read.is_(False),
        )
        .update(
            {
                Notification.is_read: True
            },
            synchronize_session=False,
        )
    )

    db.commit()

    return updated_count


# =========================================================
# DELETE NOTIFICATION
# =========================================================

def delete_notification(
    db: Session,
    notification: Notification,
) -> None:
    """
    Delete a notification.
    """

    db.delete(notification)
    db.commit()