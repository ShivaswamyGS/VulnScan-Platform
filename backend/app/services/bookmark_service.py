"""
Bookmark service.

Handles creation, retrieval and deletion of bookmarks.

Bookmarks belong to internal users and allow users to save
Bug Bounty Programs for later reference.
"""

from sqlalchemy.orm import Session

from app.core.exceptions import NotFoundError
from app.models.bookmark import Bookmark
from app.models.program import BugBountyProgram
from app.models.user import User


# =========================================================
# CREATE BOOKMARK
# =========================================================

def create_bookmark(
    db: Session,
    *,
    user: User,
    program_id: int,
) -> Bookmark:
    """
    Create a bookmark for the authenticated user.
    """

    # Check that the program is currently available
    program = (
        db.query(BugBountyProgram)
        .filter(
            BugBountyProgram.id == program_id,
            BugBountyProgram.status == "active",
            BugBountyProgram.visibility == "public",
            BugBountyProgram.is_active.is_(True),
        )
        .first()
    )

    if program is None:
        raise NotFoundError(
            "Bug Bounty Program not found or is not currently available"
        )

    # Prevent duplicate bookmarks
    existing = (
        db.query(Bookmark)
        .filter(
            Bookmark.user_id == user.id,
            Bookmark.program_id == program_id,
        )
        .first()
    )

    if existing is not None:
        return existing

    bookmark = Bookmark(
        user_id=user.id,
        program_id=program_id,
    )

    db.add(bookmark)
    db.commit()
    db.refresh(bookmark)

    return bookmark


# =========================================================
# GET MY BOOKMARKS
# =========================================================

def get_user_bookmarks(
    db: Session,
    user: User,
) -> list[Bookmark]:
    """
    Return bookmarks belonging only to the authenticated user.
    """

    return (
        db.query(Bookmark)
        .filter(
            Bookmark.user_id == user.id
        )
        .order_by(
            Bookmark.created_at.desc()
        )
        .all()
    )


# =========================================================
# GET SINGLE BOOKMARK
# =========================================================

def get_bookmark_by_id(
    db: Session,
    user: User,
    bookmark_id: int,
) -> Bookmark:
    """
    Return a bookmark only if it belongs to the authenticated user.
    """

    bookmark = (
        db.query(Bookmark)
        .filter(
            Bookmark.id == bookmark_id,
            Bookmark.user_id == user.id,
        )
        .first()
    )

    if bookmark is None:
        raise NotFoundError("Bookmark not found")

    return bookmark


# =========================================================
# DELETE BOOKMARK
# =========================================================

def delete_bookmark(
    db: Session,
    bookmark: Bookmark,
) -> None:
    """
    Delete a bookmark.
    """

    db.delete(bookmark)
    db.commit()