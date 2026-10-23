"""
Prediction model — one row per AI inference run against a Report.

Kept as its own table (rather than columns on Report) so:
1. Re-running inference (e.g. after a model retrain) preserves history
   instead of overwriting the previous prediction.
2. The dashboard/audit trail can show "confidence over time" or compare
   model versions without any schema change.
"""

from datetime import datetime

from sqlalchemy import DateTime, Enum, Float, ForeignKey, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base_class import Base
from app.models.enums import SeverityEnum


class Prediction(Base):
    __tablename__ = "predictions"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    report_id: Mapped[int] = mapped_column(ForeignKey("reports.id"), nullable=False)

    predicted_severity: Mapped[SeverityEnum] = mapped_column(
        Enum(SeverityEnum, name="severity_enum"), nullable=False
    )
    confidence_score: Mapped[float] = mapped_column(Float, nullable=False)  # 0.0 - 1.0
    explanation: Mapped[str | None] = mapped_column(Text, nullable=True)
    # Human-readable explanation, e.g. top contributing TF-IDF terms — populated
    # by the Prediction API built in the ML module.

    model_version: Mapped[str] = mapped_column(String(50), nullable=False)
    # e.g. "nb-tfidf-v1" — lets us tell which trained artifact produced this row.

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    # --- Relationships ---
    report: Mapped["Report"] = relationship("Report", back_populates="predictions")

    def __repr__(self) -> str:
        return (
            f"<Prediction id={self.id} report_id={self.report_id} "
            f"severity={self.predicted_severity} confidence={self.confidence_score:.2f}>"
        )
