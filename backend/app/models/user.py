"""
User model.

Represents both Internal Testers and Administrators — differentiated by
the `role` column rather than separate tables, since they share all the
same core attributes and only differ in permissions (enforced at the
API layer via role-based dependencies added in the Authentication module).
"""

from __future__ import annotations
from datetime import datetime
from sqlalchemy import (
    Boolean,
    DateTime,
    Enum,
    ForeignKey,
    String,
    func,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base_class import Base
from app.models.enums import RoleEnum


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    full_name: Mapped[str] = mapped_column(String(150), nullable=False)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)

    role: Mapped[RoleEnum] = mapped_column(
        Enum(RoleEnum, name="role_enum"),
        nullable=False,
        default=RoleEnum.INTERNAL_TESTER,
    )

    is_active: Mapped[bool] = mapped_column(
        Boolean,
        default=True,
        nullable=False,
    )

    # ---------- Company Fields ----------
    company_id: Mapped[int | None] = mapped_column(
        ForeignKey("companies.id"),
        nullable=True,
    )

    department: Mapped[str | None] = mapped_column(
        String(100),
        nullable=True,
    )

    designation: Mapped[str | None] = mapped_column(
        String(100),
        nullable=True,
    )

    employee_id: Mapped[str | None] = mapped_column(
        String(50),
        nullable=True,
        unique=True,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
    )

    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
    )

    # ---------- Relationships ----------

    company: Mapped["Company"] = relationship(
        "Company",
        back_populates="employees",
    )

    reports: Mapped[list["Report"]] = relationship(
        "Report",
        back_populates="reporter",
        foreign_keys="Report.reporter_id",
    )

    audit_logs: Mapped[list["AuditLog"]] = relationship(
        "AuditLog",
        back_populates="user",
    )
    
    notifications: Mapped[list["Notification"]] = relationship(
    "Notification",
    back_populates="user",
    cascade="all, delete-orphan",
)
    bookmarks: Mapped[list["Bookmark"]] = relationship(
    "Bookmark",
    back_populates="user",
    cascade="all, delete-orphan",
)


    def __repr__(self) -> str:
        return f"<User id={self.id} email={self.email!r} role={self.role}>"
