"""
Core security primitives shared across the application:
- Password hashing (bcrypt via passlib)
- JWT access/refresh token creation and verification

These are pure utility functions with no database or FastAPI dependency,
which keeps them easily unit-testable.
"""

from datetime import datetime, timedelta, timezone
from typing import Any, Optional

from jose import JWTError, jwt
from passlib.context import CryptContext

from app.core.config import settings

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(plain_password: str) -> str:
    """Hash a plaintext password for storage."""
    return pwd_context.hash(plain_password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a plaintext password against a stored bcrypt hash."""
    return pwd_context.verify(plain_password, hashed_password)


def _create_token(subject: str, expires_delta: timedelta, token_type: str, extra_claims: Optional[dict[str, Any]] = None) -> str:
    now = datetime.now(timezone.utc)
    to_encode: dict[str, Any] = {
        "sub": subject,
        "iat": now,
        "exp": now + expires_delta,
        "type": token_type,
    }
    if extra_claims:
        to_encode.update(extra_claims)
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


def create_access_token(subject: str, role: str) -> str:
    """Create a short-lived access token carrying the user id and role."""
    return _create_token(
        subject=subject,
        expires_delta=timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES),
        token_type="access",
        extra_claims={"role": role},
    )


def create_refresh_token(subject: str) -> str:
    """Create a longer-lived refresh token carrying only the user id."""
    return _create_token(
        subject=subject,
        expires_delta=timedelta(minutes=settings.REFRESH_TOKEN_EXPIRE_MINUTES),
        token_type="refresh",
    )


def decode_token(token: str) -> dict[str, Any]:
    """
    Decode and validate a JWT.
    Raises jose.JWTError if the token is invalid, expired, or tampered with.
    Callers (see app/api/deps.py, added in the Authentication module) are
    responsible for translating this into an HTTP 401 response.
    """
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        return payload
    except JWTError as exc:
        raise exc
