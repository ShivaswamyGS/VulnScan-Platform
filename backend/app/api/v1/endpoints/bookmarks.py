"""
Bookmark endpoints.

Authenticated internal testers can:

- Bookmark a Bug Bounty Program
- View their bookmarks
- View one bookmark
- Remove their bookmarks

Users can only access their own bookmarks.
"""

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.core.exceptions import ForbiddenError
from app.db.session import get_db
from app.models.enums import RoleEnum
from app.models.user import User
from app.schemas.bookmark import BookmarkRead
from app.services.bookmark_service import (
    create_bookmark,
    get_user_bookmarks,
    get_bookmark_by_id,
    delete_bookmark,
)


router = APIRouter()


# =========================================================
# CREATE BOOKMARK
# =========================================================

@router.post(
    "/{program_id}",
    response_model=BookmarkRead,
    status_code=status.HTTP_201_CREATED,
)
def add_bookmark(
    program_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Bookmark a Bug Bounty Program.
    """

    if current_user.role != RoleEnum.INTERNAL_TESTER:
        raise ForbiddenError(
            "Only internal testers can bookmark programs"
        )

    return create_bookmark(
        db,
        user=current_user,
        program_id=program_id,
    )


# =========================================================
# LIST MY BOOKMARKS
# =========================================================

@router.get(
    "/",
    response_model=list[BookmarkRead],
)
def get_my_bookmarks(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Return bookmarks belonging to the authenticated user.
    """

    if current_user.role != RoleEnum.INTERNAL_TESTER:
        raise ForbiddenError(
            "Only internal testers can view bookmarks"
        )

    return get_user_bookmarks(
        db,
        current_user,
    )


# =========================================================
# GET ONE BOOKMARK
# =========================================================

@router.get(
    "/{bookmark_id}",
    response_model=BookmarkRead,
)
def get_one_bookmark(
    bookmark_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Return one bookmark belonging to the authenticated user.
    """

    if current_user.role != RoleEnum.INTERNAL_TESTER:
        raise ForbiddenError(
            "Only internal testers can access bookmarks"
        )

    return get_bookmark_by_id(
        db,
        current_user,
        bookmark_id,
    )


# =========================================================
# DELETE BOOKMARK
# =========================================================

@router.delete(
    "/{bookmark_id}",
)
def remove_bookmark(
    bookmark_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Remove a bookmark belonging to the authenticated user.
    """

    if current_user.role != RoleEnum.INTERNAL_TESTER:
        raise ForbiddenError(
            "Only internal testers can delete bookmarks"
        )

    bookmark = get_bookmark_by_id(
        db,
        current_user,
        bookmark_id,
    )

    delete_bookmark(
        db,
        bookmark,
    )

    return {
        "message": "Bookmark removed successfully"
    }