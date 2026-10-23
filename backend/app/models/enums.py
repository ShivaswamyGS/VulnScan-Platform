"""
Shared enums for the domain model.

Kept in one place so `models/`, `schemas/`, and `services/` all reference
the exact same string values — avoids drift between DB constraints,
API validation, and business logic.
"""

import enum


class RoleEnum(str, enum.Enum):
    INTERNAL_TESTER = "internal_tester"
    ADMIN = "admin"


class SeverityEnum(str, enum.Enum):
    CRITICAL = "critical"
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"


class AuditActionEnum(str, enum.Enum):
    CREATE = "create"
    UPDATE = "update"
    DELETE = "delete"
    LOGIN = "login"
    LOGIN_FAILED = "login_failed"
    STATUS_CHANGE = "status_change"
    PRIORITY_CHANGE = "priority_change"
