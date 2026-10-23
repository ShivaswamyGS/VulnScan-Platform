"""
Database engine + session management.

Provides `get_db()`, a FastAPI dependency that yields a SQLAlchemy
Session and guarantees it is closed after the request, even on error.
"""

from collections.abc import Generator

from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker

from app.core.config import settings

engine = create_engine(
    settings.DATABASE_URL,
    pool_pre_ping=True,  # detects stale connections before use
    future=True,
)

SessionLocal = sessionmaker(
    bind=engine,
    autocommit=False,
    autoflush=False,
    future=True,
)


def get_db() -> Generator[Session, None, None]:
    """FastAPI dependency: yields a DB session per-request and closes it afterwards."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
