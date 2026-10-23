from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, UniqueConstraint, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base_class import Base


class Bookmark(Base):
    __tablename__ = "bookmarks"

    id: Mapped[int] = mapped_column(
        primary_key=True,
        index=True,
    )

    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    program_id: Mapped[int] = mapped_column(
        ForeignKey("bug_bounty_programs.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    user = relationship(
        "User",
        back_populates="bookmarks",
    )

    program = relationship(
        "BugBountyProgram",
        back_populates="bookmarks",
    )

    __table_args__ = (
        UniqueConstraint(
            "user_id",
            "program_id",
            name="uq_bookmark_user_program",
        ),
    )

    def __repr__(self) -> str:
        return (
            f"<Bookmark id={self.id} "
            f"user_id={self.user_id} "
            f"program_id={self.program_id}>"
        )