"""
AI training dataset model.

Stores metadata about datasets uploaded by administrators
for vulnerability-severity model training.
"""

from __future__ import annotations

from datetime import datetime

from sqlalchemy import Boolean, DateTime, Integer, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base_class import Base


class TrainingDataset(Base):
    __tablename__ = "training_datasets"

    id: Mapped[int] = mapped_column(
        primary_key=True,
        index=True,
    )

    name: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )

    file_path: Mapped[str] = mapped_column(
        String(500),
        nullable=False,
    )

    dataset_type: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
        default="nvd",
    )

    record_count: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        default=0,
    )

    validation_status: Mapped[str] = mapped_column(
        String(30),
        nullable=False,
        default="pending",
    )

    validation_message: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    is_active: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        default=False,
    )

    uploaded_at: Mapped[datetime] = mapped_column(
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

    def __repr__(self) -> str:
        return (
            f"<TrainingDataset "
            f"id={self.id} "
            f"name={self.name!r} "
            f"records={self.record_count} "
            f"status={self.validation_status!r}>"
        )