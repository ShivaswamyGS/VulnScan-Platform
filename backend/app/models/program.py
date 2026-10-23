"""
Bug Bounty Program model.

A Bug Bounty Program is owned by a company and defines the rules,
targets, scope, rewards, and visibility for security researchers.

Only approved companies will be allowed to create programs.
That business rule is enforced at the service/API layer.

Program lifecycle:
draft -> active -> paused -> closed

Visibility:
private -> public
"""

from __future__ import annotations

from datetime import datetime

from sqlalchemy import (
    Boolean,
    DateTime,
    ForeignKey,
    Integer,
    String,
    Text,
    func,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base_class import Base


class BugBountyProgram(Base):
    __tablename__ = "bug_bounty_programs"

    # =========================================================
    # PRIMARY KEY
    # =========================================================

    id: Mapped[int] = mapped_column(
        primary_key=True,
        index=True,
    )

    # =========================================================
    # COMPANY OWNERSHIP
    # =========================================================

    company_id: Mapped[int] = mapped_column(
        ForeignKey("companies.id"),
        nullable=False,
        index=True,
    )

    # =========================================================
    # BASIC INFORMATION
    # =========================================================

    program_name: Mapped[str] = mapped_column(
        String(200),
        nullable=False,
        index=True,
    )

    description: Mapped[str] = mapped_column(
        Text,
        nullable=False,
    )

    target_website: Mapped[str] = mapped_column(
        String(500),
        nullable=False,
    )

    # =========================================================
    # SCOPE
    # =========================================================

    scope: Mapped[str] = mapped_column(
        Text,
        nullable=False,
    )

    out_of_scope: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    # =========================================================
    # REWARD INFORMATION
    # =========================================================

    reward_min: Mapped[int | None] = mapped_column(
        Integer,
        nullable=True,
    )

    reward_max: Mapped[int | None] = mapped_column(
        Integer,
        nullable=True,
    )

    severity_reward_matrix: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    # =========================================================
    # PROGRAM RULES
    # =========================================================

    program_rules: Mapped[str] = mapped_column(
        Text,
        nullable=False,
    )

    submission_guidelines: Mapped[str] = mapped_column(
        Text,
        nullable=False,
    )

    # =========================================================
    # PROGRAM DATES
    # =========================================================

    start_date: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
    )

    end_date: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )

    # =========================================================
    # PROGRAM STATUS
    # =========================================================

    status: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
        default="draft",
        index=True,
    )

    # =========================================================
    # VISIBILITY
    # =========================================================

    visibility: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
        default="private",
        index=True,
    )

    # =========================================================
    # ATTACHMENTS
    # =========================================================

    attachments: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    # =========================================================
    # ACTIVE FLAG
    # =========================================================

    is_active: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        default=True,
    )

    # =========================================================
    # TIMESTAMPS
    # =========================================================

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

    # =========================================================
    # RELATIONSHIP
    # =========================================================

    company: Mapped["Company"] = relationship(
        "Company",
    )
    
    bookmarks: Mapped[list["Bookmark"]] = relationship(
    "Bookmark",
    back_populates="program",
    cascade="all, delete-orphan",
)

    # =========================================================
    # REPRESENTATION
    # =========================================================

    def __repr__(self) -> str:
        return (
            f"<BugBountyProgram "
            f"id={self.id} "
            f"name={self.program_name!r} "
            f"company_id={self.company_id} "
            f"status={self.status!r}>"
        )