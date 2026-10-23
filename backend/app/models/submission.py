"""
Vulnerability Submission model.

Represents a vulnerability submitted by a security researcher
to a Bug Bounty Program.

A submission belongs to:
- one Bug Bounty Program
- one submitting user

Lifecycle:
submitted -> triaged -> accepted/rejected -> resolved

The submission is separate from the existing internal Report model
because Bug Bounty submissions follow a different workflow.
"""

from __future__ import annotations

from datetime import datetime

from sqlalchemy import (
    DateTime,
    ForeignKey,
    Integer,
    String,
    Text,
    func,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base_class import Base


class VulnerabilitySubmission(Base):
    __tablename__ = "vulnerability_submissions"

    # =========================================================
    # PRIMARY KEY
    # =========================================================

    id: Mapped[int] = mapped_column(
        primary_key=True,
        index=True,
    )

    # =========================================================
    # PROGRAM
    # =========================================================

    program_id: Mapped[int] = mapped_column(
        ForeignKey("bug_bounty_programs.id"),
        nullable=False,
        index=True,
    )

    # =========================================================
    # RESEARCHER
    # =========================================================

    researcher_id: Mapped[int] = mapped_column(
        ForeignKey("users.id"),
        nullable=False,
        index=True,
    )

    # =========================================================
    # VULNERABILITY INFORMATION
    # =========================================================

    title: Mapped[str] = mapped_column(
        String(200),
        nullable=False,
    )

    description: Mapped[str] = mapped_column(
        Text,
        nullable=False,
    )

    vulnerability_type: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
    )

    affected_asset: Mapped[str] = mapped_column(
        String(500),
        nullable=False,
    )

    steps_to_reproduce: Mapped[str] = mapped_column(
        Text,
        nullable=False,
    )

    proof_of_concept: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    impact: Mapped[str] = mapped_column(
        Text,
        nullable=False,
    )

    remediation: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    # =========================================================
    # SEVERITY
    # =========================================================

    severity: Mapped[str | None] = mapped_column(
        String(20),
        nullable=True,
    )

    # =========================================================
    # REVIEW / WORKFLOW
    # =========================================================

    status: Mapped[str] = mapped_column(
        String(30),
        nullable=False,
        default="submitted",
        index=True,
    )

    # Admin/company assigned reward.
    bounty_amount: Mapped[int | None] = mapped_column(
        Integer,
        nullable=True,
    )

    # =========================================================
    # ATTACHMENT
    # =========================================================

    attachment_path: Mapped[str | None] = mapped_column(
        String(500),
        nullable=True,
    )

    # =========================================================
    # REVIEW INFORMATION
    # =========================================================

    reviewer_comment: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )
    duplicate_of_id: Mapped[int | None] = mapped_column(
    ForeignKey("vulnerability_submissions.id"),
    nullable=True,
    index=True,
    )
    
    
    duplicate_of: Mapped["VulnerabilitySubmission | None"] = relationship(
    "VulnerabilitySubmission",
    remote_side="VulnerabilitySubmission.id",
)


# =========================================================
# DUPLICATE TRACKING
# =========================================================

    duplicate_of_id: Mapped[int | None] = mapped_column(
    ForeignKey("vulnerability_submissions.id"),
    nullable=True,
    index=True,
)
    # =========================================================
    # TIMESTAMPS
    # =========================================================

    submitted_at: Mapped[datetime] = mapped_column(
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
    # RELATIONSHIPS
    # =========================================================

    program: Mapped["BugBountyProgram"] = relationship(
        "BugBountyProgram",
    )

    researcher: Mapped["User"] = relationship(
        "User",
    )
    
    duplicate_of: Mapped["VulnerabilitySubmission | None"] = relationship(
    "VulnerabilitySubmission",
    remote_side="VulnerabilitySubmission.id",
    foreign_keys=[duplicate_of_id],
)

    # =========================================================
    # REPRESENTATION
    # =========================================================

    def __repr__(self) -> str:
        return (
            f"<VulnerabilitySubmission "
            f"id={self.id} "
            f"title={self.title!r} "
            f"program_id={self.program_id} "
            f"researcher_id={self.researcher_id} "
            f"status={self.status!r}>"
        )