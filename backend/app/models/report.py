"""
Report model — a submitted vulnerability report.

Notes:
- `priority` is a separate field from the AI-predicted `severity` (which
  lives on Prediction). Severity is what the model predicts from the
  text; priority is the actionable ranking an admin assigns, which may
  agree with or override the AI's severity.
- `attachment_path` stores a relative path under UPLOAD_DIR, never an
  absolute filesystem path, so the storage location can move without
  breaking stored data.
"""

from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Integer, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base_class import Base


class Report(Base):
    __tablename__ = "reports"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)

    title: Mapped[str] = mapped_column(String(200), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    affected_module: Mapped[str] = mapped_column(String(150), nullable=False)
    category: Mapped[str] = mapped_column(String(100), nullable=False)
    steps_to_reproduce: Mapped[str] = mapped_column(Text, nullable=False)
    expected_result: Mapped[str] = mapped_column(Text, nullable=False)
    actual_result: Mapped[str] = mapped_column(Text, nullable=False)
    attachment_path: Mapped[str | None] = mapped_column(String(500), nullable=True)

    # Admin-assigned priority (1 = highest). Distinct from AI severity — see docstring.
    priority: Mapped[int | None] = mapped_column(Integer, nullable=True)

    reporter_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    status_id: Mapped[int] = mapped_column(ForeignKey("statuses.id"), nullable=False)

    submission_date: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    # --- Relationships ---
    reporter: Mapped["User"] = relationship("User", back_populates="reports", foreign_keys=[reporter_id])
    status: Mapped["Status"] = relationship("Status", back_populates="reports")
    predictions: Mapped[list["Prediction"]] = relationship(
    "Prediction",
    back_populates="report",
    order_by="Prediction.created_at.desc()",
)

    def __repr__(self) -> str:
        return f"<Report id={self.id} title={self.title!r} status_id={self.status_id}>"
