from __future__ import annotations

from datetime import datetime

from sqlalchemy import Boolean, DateTime, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base_class import Base


class Company(Base):
    __tablename__ = "companies"

    id: Mapped[int] = mapped_column(
        primary_key=True,
        index=True,
    )

    company_name: Mapped[str] = mapped_column(
        String(200),
        nullable=False,
        unique=True,
    )

    email: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
        unique=True,
        index=True,
    )

    hashed_password: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )

    website: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True,
    )

    industry: Mapped[str | None] = mapped_column(
        String(100),
        nullable=True,
    )

    country: Mapped[str | None] = mapped_column(
        String(100),
        nullable=True,
    )

    phone: Mapped[str | None] = mapped_column(
        String(30),
        nullable=True,
    )

    logo: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True,
    )

    is_active: Mapped[bool] = mapped_column(
        Boolean,
        default=True,
        nullable=False,
    )

    # =====================================================
    # COMPANY APPROVAL WORKFLOW
    # =====================================================

    approval_status: Mapped[str] = mapped_column(
        String(20),
        default="pending",
        nullable=False,
        index=True,
    )

    approval_reason: Mapped[str | None] = mapped_column(
        String(500),
        nullable=True,
    )

    approved_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )

    # =====================================================
    # TIMESTAMPS
    # =====================================================

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
    )

    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
    )

    # =====================================================
    # RELATIONSHIPS
    # =====================================================

    employees: Mapped[list["User"]] = relationship(
        "User",
        back_populates="company",
    )

    projects: Mapped[list["Project"]] = relationship(
        "Project",
        back_populates="company",
        cascade="all, delete-orphan",
    )

    assets: Mapped[list["Asset"]] = relationship(
        "Asset",
        back_populates="company",
        cascade="all, delete-orphan",
    )

    def __repr__(self) -> str:
        return (
            f"<Company id={self.id} "
            f"name={self.company_name!r} "
            f"status={self.approval_status!r}>"
        )