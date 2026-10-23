"""
Declarative base for all SQLAlchemy ORM models.

All model classes (created in the Database Schema module) will inherit
from `Base`. Keeping this in its own file (rather than in session.py)
avoids circular imports between models and the engine/session setup.
"""

from sqlalchemy.orm import DeclarativeBase


class Base(DeclarativeBase):
    pass
