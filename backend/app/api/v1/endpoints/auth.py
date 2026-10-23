"""
Authentication endpoints.

Design notes:
- POST /register is public but ALWAYS forces role=internal_tester —
  self-service registration can never grant admin access. Admin accounts
  are provisioned out-of-band via the `create_admin` CLI script (see
  app/db/create_admin.py) or by an existing admin (future admin-management
  endpoint in the Admin module).
- POST /login uses OAuth2PasswordRequestForm (username field carries the
  email) so the interactive Swagger UI "Authorize" button works out of the box.
- POST /refresh issues a new access token from a valid refresh token,
  without requiring the password again.
"""

import logging

from fastapi import APIRouter, Depends, Request, status
from fastapi.security import OAuth2PasswordRequestForm
from jose import JWTError
from sqlalchemy.orm import Session

from app.api.deps import get_client_ip, get_current_user
from app.core.exceptions import UnauthorizedError
from app.core.security import create_access_token, decode_token
from app.db.session import get_db
from app.models.enums import RoleEnum
from app.models.user import User
from app.schemas.token import Token
from app.schemas.user import UserCreate, UserRead
from app.services.auth_service import authenticate_and_issue_tokens
from app.services.user_service import create_user, get_user_by_id

logger = logging.getLogger(__name__)

router = APIRouter()


@router.post("/register", response_model=UserRead, status_code=status.HTTP_201_CREATED)
def register(user_in: UserCreate, db: Session = Depends(get_db)) -> User:
    """Public self-registration. Always creates an Internal Tester account."""
    return create_user(db, user_in, force_role=RoleEnum.INTERNAL_TESTER)


@router.post("/login", response_model=Token)
def login(
    request: Request,
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db),
) -> Token:
    """OAuth2-compatible login. `username` field = email."""
    return authenticate_and_issue_tokens(
        db, email=form_data.username, password=form_data.password, ip_address=get_client_ip(request)
    )


@router.post("/refresh", response_model=Token)
def refresh_access_token(refresh_token: str, db: Session = Depends(get_db)) -> Token:
    """Exchange a valid refresh token for a new access token (+ same refresh token)."""
    try:
        payload = decode_token(refresh_token)
    except JWTError:
        raise UnauthorizedError("Invalid or expired refresh token")

    if payload.get("type") != "refresh":
        raise UnauthorizedError("Invalid token type; a refresh token is required")

    user = get_user_by_id(db, int(payload["sub"]))
    if user is None or not user.is_active:
        raise UnauthorizedError("User not found or inactive")

    new_access_token = create_access_token(subject=str(user.id), role=user.role.value)
    return Token(access_token=new_access_token, refresh_token=refresh_token)


@router.get("/me", response_model=UserRead)
def read_current_user(current_user: User = Depends(get_current_user)) -> User:
    return current_user
