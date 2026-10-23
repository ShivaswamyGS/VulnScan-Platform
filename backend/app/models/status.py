"""
Status lookup table.

Kept as its own table (rather than a hardcoded enum on Report) so
administrators can see/manage the full lifecycle without a code change,
and so history/reporting can join against a stable status id.

Seeded with default rows by app/db/seed.py (added at the end of this module).
"""

from sqlalchemy import Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base_class import Base


class Status(Base):
    __tablename__ = "statuses"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(50), unique=True, nullable=False)
    # e.g. "Open", "In Review", "In Progress", "Resolved", "Closed", "Rejected"
    description: Mapped[str | None] = mapped_column(String(255), nullable=True)
    is_terminal: Mapped[bool] = mapped_column(default=False)
    # True for statuses like "Resolved"/"Closed"/"Rejected" — used by dashboard
    # to compute Open vs Resolved counts without hardcoding status names.
    sort_order: Mapped[int] = mapped_column(Integer, default=0)

    reports: Mapped[list["Report"]] = relationship("Report", back_populates="status")

    def __repr__(self) -> str:
        return f"<Status id={self.id} name={self.name!r}>"
