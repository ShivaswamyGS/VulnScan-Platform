"""
AI model training history.

Stores the result and metadata of every model-training run.
"""

from __future__ import annotations

from datetime import datetime

from sqlalchemy import DateTime, Float, ForeignKey, Integer, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base_class import Base


class TrainingHistory(Base):
    __tablename__ = "training_history"

    id: Mapped[int] = mapped_column(
        primary_key=True,
        index=True,
    )

    dataset_id: Mapped[int] = mapped_column(
        ForeignKey("training_datasets.id"),
        nullable=False,
        index=True,
    )

    model_version: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
    )

    status: Mapped[str] = mapped_column(
        String(30),
        nullable=False,
        default="pending",
        index=True,
    )

    record_count: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        default=0,
    )

    accuracy: Mapped[float | None] = mapped_column(
        Float,
        nullable=True,
    )

    precision: Mapped[float | None] = mapped_column(
        Float,
        nullable=True,
    )

    recall: Mapped[float | None] = mapped_column(
        Float,
        nullable=True,
    )

    f1_score: Mapped[float | None] = mapped_column(
        Float,
        nullable=True,
    )

    model_path: Mapped[str | None] = mapped_column(
        String(500),
        nullable=True,
    )

    error_message: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    started_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )

    completed_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    dataset: Mapped["TrainingDataset"] = relationship(
        "TrainingDataset",
    )

    def __repr__(self) -> str:
        return (
            f"<TrainingHistory "
            f"id={self.id} "
            f"dataset_id={self.dataset_id} "
            f"model_version={self.model_version!r} "
            f"status={self.status!r}>"
        )