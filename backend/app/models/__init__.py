"""
Import all SQLAlchemy models so Base.metadata is populated.

Every model must be imported here so Alembic and SQLAlchemy
can discover all tables and relationships.
"""

from app.models.asset import Asset
from app.models.audit_log import AuditLog
from app.models.company import Company
from app.models.dataset import TrainingDataset

from app.models.enums import (
    AuditActionEnum,
    RoleEnum,
    SeverityEnum,
)

from app.models.notification import Notification
from app.models.prediction import Prediction
from app.models.program import BugBountyProgram
from app.models.project import Project
from app.models.report import Report
from app.models.status import Status
from app.models.submission import VulnerabilitySubmission
from app.models.training_history import TrainingHistory
from app.models.user import User
from app.models.bookmark import Bookmark


__all__ = [
    "Asset",
    "AuditLog",
    "Company",
    "TrainingDataset",
    "AuditActionEnum",
    "RoleEnum",
    "SeverityEnum",
    "Notification",
    "Prediction",
    "BugBountyProgram",
    "Project",
    "Report",
    "Status",
    "VulnerabilitySubmission",
    "TrainingHistory",
    "User",
]