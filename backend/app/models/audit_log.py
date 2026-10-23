"""
Audit log model — a generic, append-only trail of security-relevant
actions (logins, report creation, status/priority changes, etc.).

Deliberately generic (entity_type + entity_id, not a dedicated FK per
entity) so new auditable entities can be added later without a schema
migration. `details` holds a JSON-serialized string of before/after
values, kept as text for portability across DB backends.
"""

from datetime import datetime

from sqlalchemy import DateTime, Enum, ForeignKey, Integer, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base_class import Base
from app.models.enums import AuditActionEnum


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)

    # Nullable because failed-login attempts may not resolve to a known user.
    user_id: Mapped[int | None] = mapped_column(ForeignKey("users.id"), nullable=True)

    action: Mapped[AuditActionEnum] = mapped_column(Enum(AuditActionEnum, name="audit_action_enum"), nullable=False)
    entity_type: Mapped[str] = mapped_column(String(50), nullable=False)  # e.g. "report", "user"
    entity_id: Mapped[int | None] = mapped_column(Integer, nullable=True)

    details: Mapped[str | None] = mapped_column(Text, nullable=True)  # JSON string
    ip_address: Mapped[str | None] = mapped_column(String(45), nullable=True)  # supports IPv6

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    # --- Relationships ---
    user: Mapped["User | None"] = relationship("User", back_populates="audit_logs")

    def __repr__(self) -> str:
        return f"<AuditLog id={self.id} action={self.action} entity={self.entity_type}:{self.entity_id}>"
